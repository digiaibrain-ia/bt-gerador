# Backlog fora de escopo (regra 5)

Achados que **não** são corrigidos durante a Fase 1. Ficam aqui para tratarmos depois, em passo próprio e com "OK".
Achados que os testes da Fase 1 revelaram aparecem como testes **pendentes** (`todo`) com o ID; o comportamento esperado continua escrito no teste.

## Achados da Fase 1 (testes pendentes)

| ID | Gravidade | Onde | O que acontece | O que deveria acontecer | Teste |
|---|---|---|---|---|---|
| F4-2 | **Alta** | `POST /api/chaves/{56,400,550,595}/tensao`, fluxo `chaves-*` | Com o PLC sem resposta, a rota responde **erro 500** ("leitura de volta nao conferiu"), mas o chaveamento **já foi gravado** no PLC. A conferência lê o cache parado, não o PLC. O operador vê erro e o estado mudou. | Se a resposta é erro, o PLC não pode ter mudado. Conferir no PLC, não no cache. | `f4_setup_tensao.test.js` (ACHADO F4-2) |
| F4-1 | Média | mesma rota | A validação aceita dado de até **5 s** de idade (DB3002), enquanto o `GET` já recusa com **2,5 s**. Entre 2,5 e 5 s o POST tenta escrever sem PLC. | Recusar com 503 antes de escrever, com a mesma regra de idade do `GET`. | `f4_setup_tensao.test.js` (ACHADO F4-1) |
| F2-1 | Baixa | `http in` de todas as rotas de chaves | JSON malformado no corpo volta como **500** ("Internal Server Error"): erro do cliente tratado como erro do servidor. | 400. | `f2_comando_chaves.test.js` (ACHADO F2-1) |

## Achados do F11 (para a Fase 2)

| ID | Gravidade | Onde | Observação |
|---|---|---|---|
| F2-3 | ~~Média~~ **resolvido no Portão 1 (medidor 1.10.167)** | `medidor_gerador_v1.10.166.html` (antes) | O HTML traz **fixo o endereco real do DSE** (`172.17.210.156:1880`) e tenta falar com ele a cada consulta. Durante o teste o navegador foi bloqueado (a trava funcionou), mas o cliente conhece um endereco de producao. Tema da Fase 2 (nunca confiar no cliente). |

## Outros achados (anotados, sem teste ainda)

| ID | Gravidade | Onde | Observação |
|---|---|---|---|
| D-1 | Baixa | cabeçalho do fluxo `chv56_wd_html` (vigia "HTML sumiu") | O texto diz que o vigia só zera `CbLigar`. O código também desliga o banco (`LigarBanco`, v2.4). Corrigir o texto (documentação), não o código. |
| D-2 | Baixa | `WD_HTML_S` (tempo do vigia) | O limite é lido da **variável da aba** (Propriedades da aba). Conferir no PC BT2 que a aba tem o valor certo (padrão 30 s). |
| D-3 | Média | `s7 in` de todos os fluxos | O teste roda com o **Node-RED 5.0.9**. A versão do PC BT2 não foi confirmada; comportamento pode diferir. |

## Fase 2 - Portao 3 (D3): limites registrados

| ID | Gravidade | Onde | Observacao |
|---|---|---|---|
| D-4 | Media | rotas de escrita (D3) | A guarda de Origin/Content-Type **nao e login**. Continua dependendo da TI: `adminAuth` no `settings.js` e rede. Confirmar no PC. |
| D-5 | Baixa | rotas de escrita (D3) | DNS rebinding passa na comparacao Origin = Host. Mitigacao de rede/nome (TI). |
| D-6 | Baixa | uso do medidor como arquivo local | `Origin: null` e barrado; abrir pelo endereco do servidor. `BT2_ORIGENS_OK=null` existe mas libera paginas isoladas de qualquer site (nao recomendado). |
| D-7 | Baixa | `dev-logs` e simulador | Rotas de log/simulador estao sob a mesma guarda; o simulador continua so para bancada (D4). |

## Fase 3 - observacoes do Portao 1 (a CONFIRMAR no Portao 2; nada foi corrigido)

| ID | Observacao (explorando o BC56 v3.2 com a instrumentacao) | Estado |
|---|---|---|
| P3-o1 (confirmado como P3-A4) | Com latencia de escrita de **700 ms** (> espera de 450 ms do fluxo), os 6 comandos `habilitar` simultaneos responderam **500** (leitura de volta nao conferiu) enquanto o PLC simulado aplicou as escritas (5 de 6 ja aplicadas quando a resposta saiu, a 6a ainda em voo). Sinal de resposta **antes** da escrita terminar / falso erro que levaria o cliente a repetir. Relaciona-se a R2, R6 e ao F4-2. | hipotese; caracterizar no Portao 2 |
| P3-o2 | Com 6 comandos simultaneos e escrita serial, a fila atendeu **um por vez** (sem sobreposicao), com ~570 ms por comando (a ultima resposta a ~3,5 s). | informativo (I1 ok neste cenario) |

## Fase 3 - Portao 2: achados CONFIRMADOS (testes `todo` em `tests/integracao/concorrencia/c2_caracterizacao.test.js`; nada corrigido)

| ID | Gravidade | Hipotese | Onde | O que acontece (reproduzido) | O que deveria acontecer |
|---|---|---|---|---|---|
| ~~P3-A1~~ **corrigido na Etapa 4a** | **Alta** | R5/R1 | `chaves-*`, `fila` (prioridade do "Desligar banco") | "Ligar banco" aceito antes e "Desligar banco" depois: o desligar **fura a fila** (`unshift`) e o ligar mais antigo executa **depois**. As 3 respostas sao 200 e o banco termina **LIGADO**. | O ultimo comando aceito prevalece (banco desligado). |
| ~~P3-A2~~ **corrigido na Etapa 4a** | Media | R1 | `chaves-*`, `valida selecionar` fora da fila | `selecionar` e validado com a chave habilitada; um `habilitar:false` que ja estava na frente executa antes. Termina `ChaveSel=3` com `Habilitada3=false`. | Revalidar ao sair da fila ou recusar. |
| ~~P3-A3~~ **corrigido na Etapa 4a** | **Alta*** | R1+R5 | `chaves-*`, `valida ligar` + prioridade | `ligar chave` validado com banco ligado executa **depois** do "Desligar banco" prioritario: `CbLigar2=TRUE` com `LigarBanco=FALSE`. *Gravidade a confirmar com o FB101 no PLC (ele pode zerar). | Revalidar ao sair da fila. |
| ~~P3-A4~~ **corrigido na Etapa 4b** | Media | R2/R6 | `chaves-*`, espera de 450 ms + `confere` | Escrita mais lenta que 450 ms: resposta **500** ("leitura de volta nao conferiu") e a escrita e **aplicada depois** (9 s no teste). Falso erro: o cliente repete ou desiste. Ja tinha sido visto como P3-o1; relaciona-se ao F4-2 (mesmo padrao na rota `tensao`). | Resposta coerente com o estado final (ou "estado desconhecido, releia"). |
| ~~P3-A5~~ **corrigido na Etapa 4b** | **Alta (condicional ao driver)** | R2/R5, modo concorrente | `chaves-*` + driver S7 | So se o driver real aplicar escritas **concorrentes**: escrita antiga atrasada ultrapassa a nova e `CbLigar1` termina TRUE depois de `ligar:false` responder 200. No modo serial (suposicao) nao ocorre. | Confirmar o comportamento do driver S7 no PC; se concorrente, versionar/descartar escrita antiga. |
| ~~P3-B1~~ **corrigido na Etapa 4c** | Media | R7 | `registro-ensaio-db2100-api`, rota `preenchimento` | `preenchValido=TRUE` e gravado **primeiro**. Com queda do PLC apos 2 escritas ele fica TRUE, a serie gravada e o resto vazio (snapshot parcial "valido"). A `etapa` esta correta (bit Salva por ultimo). | Gravar `preenchValido` **por ultimo** (correcao possivel so no fluxo). Atomicidade total pode exigir mudanca de layout do DB2100: **limite de arquitetura (decisao do Gemini): so registrar**. |
| ~~P3-C1~~ **corrigido na Etapa 4c** | Baixa | R8 | `dev-logs-api` | Dedup por "maior n ja aceito": se o lote 4-6 chega antes do lote 1-3 (dois POSTs em voo), os eventos 1-3 sao **descartados em silencio** como duplicados. | Dedup por conjunto de n (ou aceitar fora de ordem). |
| ~~P3-C2~~ **corrigido na Etapa 4c** | Baixa | R8 | `dev-logs-api`, `GET /api/dev/logs` | Cursor `desde` **a frente** do ultimo seq (ex.: apos reinicio do Node-RED) devolve lista vazia sem sinal; so o campo `boot` permite perceber. | Sinalizar (`cursorAdiante`/`reiniciado`). |

**Etapa 4a (Fase 3):** P3-A1, A2 e A3 corrigidos nas versoes `chaves-56/400 v3.3` e `chaves-550/595 v1.4` (expurgo na fila + revalidacao na saida; testes `concorrencia/c3_etapa4a.test.js` nos 4 bancos; os mesmos testes **falham** nas versoes anteriores). Falta no PC: confirmar no TIA que o FB101 zera CbLigar com banco desligado (A3) e a importacao pela TI. O ramo `LEITURA_VELHA` (cache do PLC com mais de 2,5 s na saida da fila) so tem verificacao estatica; nao reproduzi de forma deterministica.

**Etapa 4b (Fase 3):** P3-A4 e P3-A5 corrigidos em `chaves-56/400 v3.4` e `chaves-550/595 v1.5` (gerador `gerar_fluxos_portao4b_v0.1.py`; testes `concorrencia/c4_etapa4b.test.js` nos 4 bancos; falham nas versoes anteriores). Variaveis da aba novas: `CONF_JANELA_MS` (2000) e `QUARENTENA_MS` (10000). **Limites desta etapa (a validar no PC):** (a) a reafirmacao limita o tempo com a chave indevidamente ligada (~1 a 3 s no teste), nao o elimina: uma escrita tardia ja enviada nao pode ser recolhida; (b) o `s7 in` de teste so emite por ciclo e ignora o gatilho de leitura: no PC o "retenta" forca uma leitura imediata, caminho nao exercitado pelo simulador (a avaliacao ocorre pela leitura ciclica); (c) quarentena e reafirmacao ficam so em memoria (somem no reinicio do Node-RED, como a fila); (d) `SALVAR` nao usa a janela (SetupOk e decisao do PLC) e a rota `tensao` nao foi tocada (F4-1/F4-2); (e) erro EXPLICITO de escrita agora responde 500 definitivo pelo `catch` (os pedidos de escrita passaram a carregar o `_reqId`), sem quarentena.

**Etapa 4c (Fase 3):** P3-B1, P3-C1 e P3-C2 corrigidos em `registro-ensaio v1.8` e `dev-logs v1.3` (gerador `gerar_fluxos_portao4c_v0.1.py`; testes `concorrencia/c5_etapa4c.test.js` e `c2`; falham nas versoes anteriores). **Limites:** (a) P3-B1: os dados em si continuam nao atomicos; o contrato e "so ler o snapshot quando `preenchValido=TRUE`" e **precisa ser confirmado no TIA** nos consumidores do DB2100 (atomicidade total exigiria mudar o layout: limite de arquitetura registrado, nao tocado); o preenchimento leva ~3 s; (b) P3-C1: a janela de dedup e de 500 `n` por sessao (n mais de 500 atras do maior e tratado como duplicado); eventos de lote antigo ganham `seq` maior (ordem de chegada; `n` e `t` corretos); (c) P3-C2: o gerenciador de logs ainda nao usa os sinais `cursorAdiante`/`reiniciado` (so o servidor foi alterado; ajuste do gerenciador seria uma versao nova do HTML, fora desta etapa).

**Situacao ao fim da Etapa 4c:** todos os achados P3-A1..A5, B1, C1, C2 estao corrigidos nas versoes novas; continuam pendentes **apenas** F2-1, F4-1 e F4-2 (mantidos de proposito). Falta a Etapa 5 (estresse, roteiro de implantacao v0.5) e a validacao no PC.

Comportamentos **corretos** confirmados (testes verdes): fila FIFO para comandos comuns sob jitter nos dois modos de escrita; fila liberada depois de falso 500 e depois de timeout 503 de 8 s, sem resposta duplicada; comandos absolutos idempotentes (chaves e registro); `etapa` sem estado parcial; registro serializado com estado final do ultimo aceito; logs sem perda com 30 lotes concorrentes, reenvio deduplicado e `limpar` sem ressuscitar eventos.

**Caracterizado, nao e achado:** cliente que desiste (aborta) com o comando ja na fila: o comando **ainda executa** (R9).

**Nao reproduzivel de forma deterministica (R4):** o vigia "HTML sumiu" so gera o `ZERAR` com a fila livre; a unica janela e de um tick entre a checagem do vigia e a entrada na `fila`. Analise por leitura: o `ZERAR` tambem tem prioridade (`unshift`), mesma mecanica do P3-A1/A3. Nao ha teste.

**Observacao sobre a `TRAVA_MAX` de 10 s:** o vigia de 8 s libera a fila antes; a trava antiga so seria "roubada" se o vigia falhasse. Nao reproduzido (fora do alcance sem falha do proprio Node-RED).

## Itens já listados antes (sem mudança nesta fase)

- **Tipo `Remote` em `VAR_INPUT`** nos FBs de comunicação (FB101/FB103): a confirmar no TIA.
- **`EnsaioAtivo` fixo em FALSE** nas chamadas: a tag real ainda não existe no PLC.
- **FB100 v0.4 e FB102 v0.2:** os arquivos existem, mas a decisão de subir ao PLC é sua.
- **Gerador `gerar_banco`:** ainda não gera o FB100 v0.4 nem o FB102 v0.2 (só os FBs do ET200 v0.2).
- **Robô do Operador secreto:** 8 falhas no popup Setup, porque ele não informa o chaveamento (220/380/440 V) antes de selecionar a chave.
- **Cópia do gráfico embutida no medidor:** ainda na v0.10 (a versão separada é a v0.11).
- **FC de chamadas dos bancos:** nomes de instância genéricos no comentário.

## Limites da Fase 1 (o que os testes NÃO provam)
- O PLC é uma **simulação em memória**, não o driver S7 real nem o tempo real do 1515 ou do ET200.
- O **F11** (front real contra o Node-RED local, com Playwright) **ainda não foi feito**: fica para depois dos F1–F10.
- Segurança da senha de testes e rotas sem login são da **Fase 2**, não entram aqui.
