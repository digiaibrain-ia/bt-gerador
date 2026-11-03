# Fase 3, Portao 3 - Proposta de correcao (SEM implementar) - v0.1

Estado: **proposta para aprovacao**. Nenhum fluxo, front ou PLC foi alterado. Base: achados P3-A1..A5, P3-B1, P3-C1, P3-C2 (testes `todo` em `tests/integracao/concorrencia/c2_caracterizacao.test.js`; detalhes em `BACKLOG_FORA_DE_ESCOPO.md`).
Fora do escopo (continuam como estao, por decisao): F2-1, F4-1, F4-2 e a rota `tensao` (mesmo padrao do P3-A4, **nao** sera tocada).

## 0. Exposicao real (o que li no front 1.10.167)
- O front manda ate **3 POST de chave ao mesmo tempo** (`chPostVaga`, fila de 3 vagas, todos os bancos juntos) com timeout de **10 s**. Logo, P3-A1/A2/A3 sao alcancaveis por **um unico cliente**, nao so por dois operadores. Tambem ha o vigia ("HTML sumiu") e repeticao apos timeout.
- O front trata resposta nao-200 como recusa (`chValida`); um codigo novo nao quebra o cliente atual (cai no mesmo caminho de erro).

## 1. Mecanismo comum (P3-A1, A2, A3): "revalidar na saida da fila" + "expurgo"
**Causa raiz (uma so):** as rotas validam contra o cache `live` **antes** de entrar na fila; o comando so executa **depois** dos que estao na frente. Alem disso o "Desligar banco" e o `ZERAR` do vigia entram na **frente** (`unshift`) e os comandos antigos que "energizam" ficam atras deles.
**Proposta (nos 4 fluxos de chaves, via gerador, versoes novas):**
1. **Revalida na saida da fila:** novo no function entre `fila`/`libera fila` e `monta escritas`, com a **mesma regra** dos `valida*` (banco ligado, chave habilitada, sem Setup em andamento) lida do `live` **no momento de executar**. Exige leitura recente (<= 2,5 s, como o vigia); reprova com **409** `{ok:false, codigo:'ESTADO_MUDOU', erro:'o estado mudou enquanto o comando esperava na fila'}`. Falha sai por um responder que libera a fila.
2. **Expurgo (decisao do Gemini):** quando entra um `Desligar banco` (ou o `ZERAR` do vigia), dentro da **mesma funcao `fila`** (atomica) remove-se da espera todo comando **ja aceito** que depende do banco ligado: `BANCO ligar:true`, `LIGAR ligar:true`, `SELECIONAR indice>0`, `SALVAR`. Cada um recebe **409** `{codigo:'CANCELADO_POR_DESLIGAR'}` por um **responder proprio que NAO libera a fila nem mexe no `ctx`** (usar o `responde + libera fila` existente liberaria a fila com outro comando em voo). A **prioridade de seguranca do desligar e preservada**. Comandos aceitos **depois** do desligar nao sao afetados. O comando **em voo** nao e cancelavel: termina e o desligar vem logo depois.
**Riscos:** (a) leitura velha na saida da fila -> reprova indevidamente (mitigado: na saida o comando anterior acabou de ser confirmado por leitura); (b) regra duplicada em dois lugares (mitigado: uma funcao compartilhada gerada do mesmo texto e teste que compara); (c) expurgo cancelar algo legitimo (mitigado: so o que estava aceito **antes** do desligar).
**Front:** nenhuma mudanca obrigatoria (409 ja existe nas rotas). Opcional na 1.10.168: tratar `CANCELADO_POR_DESLIGAR` como aviso, nao como falha de comunicacao (CHV-001).
**PLC:** nenhum. (P3-A3 continua dependendo de o FB101 zerar CbLigar com banco desligado: **confirmar no TIA**; a correcao no Node-RED vale de qualquer jeito.)
**Criterio de aceitacao (muda o teste, ver secao 7):**
- A1: estado final do banco = **ultimo comando aceito** (desligado); cada resposta e verdadeira: o "ligar" mais antigo ou foi **executado antes** (200) ou foi **cancelado** (409); nunca 200 sem ter executado.
- A2: nunca `ChaveSel=n` com `Habilitada n=false`; o `selecionar` obsoleto responde 409.
- A3: nunca `CbLigar=TRUE` com `LigarBanco=FALSE`.
- Repetido nos 4 bancos (BC56 de 16 chaves e BC595 de 32 chaves no minimo).

## 2. P3-A4 (Media) - falso 500 com escrita aplicada depois
**Causa raiz:** `confere` faz **uma unica** leitura de volta apos 450 ms fixos. Se o PLC ainda nao aplicou, responde 500 "nao conferiu" e **libera a fila**; a escrita chega depois.
**Proposta:** janela de confirmacao: o `confere` **aceita a primeira leitura que bater** ate `CONF_JANELA_MS` (variavel da aba, padrao **2000 ms**) em vez de falhar na primeira; so ao fim da janela responde **504** `{ok:false, incerto:true, erro:'comando enviado, sem confirmacao do PLC: confira o estado antes de repetir'}`. A fila so e liberada ao responder (a escrita lenta nao concorre com o proximo comando dentro da janela). O 8 s do vigia nao muda.
**Riscos:** comando que realmente falhou agora responde em ate 2 s (antes 0,45 s) e ocupa a fila por esse tempo; com 3 POST simultaneos o pior caso soma, ainda abaixo do timeout de 10 s do front (mitigado: janela por variavel da aba; medir no teste de estresse).
**Front:** compativel (504 e nao-200, cai no caminho de erro atual). Recomendado na 1.10.168: ao receber `incerto:true`, **reler o estado antes de repetir** (o GET de 1 s ja faz isso na pratica).
**PLC:** nenhum. **Overlap:** a rota `tensao` tem o mesmo defeito (F4-2) e **nao sera tocada**.
**Criterio:** resposta 200 => escrita aplicada; resposta de erro **definitivo** (500) => nao aplicada; escrita que nao confirma na janela => **504 incerto** (nunca 500 com escrita que sera aplicada depois e nunca 200 sem aplicar).

## 3. P3-A5 (Alta, condicional ao driver) - escrita antiga atrasada ultrapassa a nova
**Causa raiz:** depois de 504/500 nada impede um novo comando de escrever a mesma variavel **antes** da escrita antiga chegar; so e problema se o driver S7 real aplicar escritas concorrentes (**nao confirmado**).
**Proposta (independe do driver):** **quarentena** apos 504: por `QUARENTENA_MS` (padrao 10 s) comandos **comuns** que escrevem em variaveis do comando incerto respondem **503** `{codigo:'AGUARDE_CONFIRMACAO'}` com `Retry-After`; **Desligar banco / ZERAR passam** (seguranca) **e sao reafirmados** (reescritos e confirmados) quando a quarentena termina, para um "ligar" tardio nao religar nada.
**Riscos:** durante a quarentena o operador nao comanda aquela variavel (falha segura); a reafirmacao e mais uma escrita; estado de quarentena em memoria (perde no reinicio; aceitavel: reinicio reseta a fila tambem).
**Front:** trata 503 como hoje. **PLC:** nenhum. **Decisao pendente:** implementar ja (recomendo) ou so depois de confirmar o driver no PC.
**Criterio:** no modo **concorrente**, apos `ligar:true` com escrita atrasada 9 s, um `ligar:false` aceito (200) termina com `CbLigar=FALSE` **ou** e recusado (503) - nunca 200 com estado final contrario.

## 4. P3-B1 (Media) - `preenchValido` gravado primeiro
**Causa raiz:** o `preenchimento` escreve `preenchValido=TRUE` na frente dos dados; queda no meio deixa "valido" com dados vazios.
**Proposta:** **duas fases** (mesmo padrao que a `etapa` ja usa): fase 1 grava `preenchValido=FALSE` + todos os dados e **confere**; fase 2 grava `preenchValido=TRUE` e **confere**. 200 so apos a fase 2. `limpar` ja grava o flag FALSE primeiro. Queda em qualquer ponto => flag FALSE.
**Riscos:** o preenchimento passa de ~1,5 s para ~3 s (2 esperas de 1,5 s), dentro do timeout de 10 s do front. **Limite (registrar, sem solucao):** os dados em si nao sao atomicos; o contrato passa a ser "**so ler os dados se `preenchValido=TRUE`**" - **confirmar no TIA** que os consumidores do DB2100 respeitam o flag.
**Front:** nenhuma. **PLC:** sem mudanca de layout (decisao 3); so a regra de consumo.
**Criterio:** para toda queda apos N escritas (N de 0 ate o total), nunca `preenchValido=TRUE` com dados incompletos.

## 5. P3-C1 (Baixa) - lote antigo descartado como duplicado
**Causa raiz:** dedup por "maior n ja aceito" por sessao.
**Proposta:** guardar por sessao a **janela dos ultimos 500 `n` vistos** (conjunto) e descartar **so repeticao exata**; limite de 50 sessoes mantido (memoria limitada).
**Riscos:** eventos de um lote antigo ganham `seq` maior (ordem de chegada); o `n` e o `t` do evento continuam corretos (verificar a ordenacao no gerenciador de logs). **Front/PLC:** nenhum; totalmente retrocompativel.
**Criterio:** lote 4-6 e depois 1-3 => aceita 3 e 3; qualquer reenvio => 0 aceitos; limpar nao ressuscita.

## 6. P3-C2 (Baixa) - cursor a frente sem sinal
**Proposta (aditiva):** o `GET /api/dev/logs` passa a devolver `cursorAdiante: desde > ultimo` e, se o cliente mandar `boot=<id>` diferente do atual, `reiniciado: true`. **Front:** o gerenciador de logs (nova versao) reinicia o cursor ao ver o sinal; o cliente antigo ignora os campos novos. **PLC:** nenhum.

## 7. Contrato dos testes (precisa do seu OK: muda 3 `todo`)
Para nao "enfraquecer" teste, o OK e sobre o **contrato**: os `todo` A1 e A4 trazem premissas que a correcao muda de proposito (A1 exige `[200,200,200]`; A4 exige `200 <=> aplicou`). Passam a verificar o **invariante** (estado final = ultimo comando aceito; resposta verdadeira) em vez do codigo de status. Os demais `todo` mantem a asserção como esta. Cada correcao tambem ganha teste **novo** (expurgo, revalidacao, janela, quarentena, fases, dedup por conjunto).

## 8. Plano de execucao (cada etapa: versoes novas, gerador, testes, relatorio e OK)
- **4a:** A1+A2+A3 nos 4 fluxos de chaves (`chaves-56/400 v3.3`, `550/595 v1.4`) + testes nos 4 bancos.
- **4b:** A4 e, se aprovado, A5.
- **4c:** B1 (`registro v1.8`), C1 e C2 (`dev-logs v1.3`).
- **4d:** `rid`/Idempotency-Key opcional no servidor + front 1.10.168 (aprovado na decisao 2; retrocompativel): resultado consultavel por `rid`, repeticao com o mesmo `rid` nao enfileira duplicata.
- **5:** estresse longo com falhas injetadas, roteiro de implantacao v0.5, backlog.
Nada vai ao PC. Versoes antigas ficam para voltar atras.
