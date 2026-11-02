# Padrão de Alertas e Falhas (ocorrências) — código + texto — v1.1 (28/10/2026)

> **Mudanças da v1.1 (HTML v1.10.103):** (1) "Alertas e Falhas" passou a se chamar **Alertas e Falhas** — "Mensagem" fica reservada para as orientações ao operador (a faixa de texto da tela); (2) o tipo "Mensagem" virou **Alerta**; (3) **regra do código revista**: `T-AAA-NNN`, com a letra do tipo na frente (seção 2); (4) novo **Histórico (Buffer)** em localStorage (seção 8); (5) botão único **Exportar ▾** (TXT / MD / PDF); (6) card "Banco de Cargas" agora é **Banco de Cargas**.

> **Resumo.** Toda mensagem ou falha que a aplicação mostra ao operador é uma **ocorrência** com **código `AAA-NNN`** e **texto curto em português**. Cada ocorrência pertence a **um card** (onde o operador vê o sintoma) e aparece em dois lugares: no **triângulo amarelo com "!"** do cabeçalho do card (só quando há ocorrência ativa) e na janela **"Alertas e Falhas"** (botão da barra de cima, junto com todas as outras). Implementado no HTML **v1.9.64**. As falhas do PLC ainda **não** estão ligadas — o padrão já reserva o lugar.

## 1. Situação (regra 4)

**(a) Implementado e testado no emulador (22/10/2026)**
- Código, texto, card, tipo (falha/mensagem), estado (ativa/normalizou), contagem de vezes, janela com filtro por card e por estado, impressão/PDF com nome sugerido, triângulo por card, botão geral com total.
- Os 10 códigos da seção 4.

**(b) Assumido por mim (precisa do seu OK)**
- Famílias de 3 letras (seção 2) e numeração `NNN` por família.
- Qual card "dono" de cada código (seção 4).
- Tempos: carência de 8 s ao abrir a página antes de acusar "ainda não conectou"; ocorrências de evento expiram em 30 s (CHV-002) e 60 s (SIS-001).

**(c) A desenvolver**
- Falhas vindas do PLC (família `PLC`) — dependem de um DB de status (hoje "a definir": DB151/DB159 na planilha `PLANO_NUMERACAO_BLOCOS_PLC_v3.xlsx`, aba `Blocos_novos`).
- `COM-004` (programa do PLC sem batimento) — depende do DB58 (`ESPECIFICACAO_DB58_MODO_HEARTBEAT.md`).
- Histórico em arquivo/DB do servidor (o buffer do navegador, seção 8, já existe desde a v1.10.103).

## 2. Formato do código (REVISADO na v1.1)

**`T-AAA-NNN`** — letra do **tipo** + hífen + três letras da **família** + hífen + três dígitos. Exemplos: `F-COM-001` (falha de comunicação), `A-CHV-002` (alerta de chave). Com referência: `F-CHV-001 · BC56`.

| Parte | Significado | Valores |
|---|---|---|
| `T` | **Tipo** — vem na frente para o operador saber a gravidade antes de ler o resto | `F` = Falha (algo que deveria funcionar e não funciona) · `A` = Alerta (aviso; nada quebrou) |
| `AAA` | **Família** — de onde vem | tabela abaixo |
| `NNN` | **Número** dentro da família; nunca se reutiliza | 001… |

**Por que mudou (técnico):** na v1.0 o tipo só aparecia numa coluna separada e o código (`CHV-002`) não dizia se era grave; ao exportar/colar um código solto, perdia-se a gravidade. **Leigo:** a primeira letra já diz "F = quebrou", "A = só um aviso".

**Compatibilidade:** a **chave interna** continua `AAA-NNN` (`OCOR.set(card,'CHV-001',…)`, `CAT`, `varre()`); a letra do tipo é acrescentada só na hora de mostrar/exportar (função `codExib`). Nenhum código existente foi renumerado, então os registros e documentos antigos continuam valendo (`CHV-001` = `F-CHV-001`). Se um mesmo número mudar de tipo no futuro, deve receber um **número novo** (regra 1).

| Família | Assunto | Faixa em uso |
|---|---|---|
| `COM` | Comunicação entre as partes (PLC, Node-RED, rede) | 001–003, 005 |
| `DSE` | Leitura do DSE / gerador | 001, 002 |
| `CHV` | Chaves do banco de carga (comando) | 001–005 |
| `ENS` | Registro do ensaio no PLC (preenchimento, etapas) | 001–003 |
| `SIS` | Erro interno da própria tela | 001 |
| `PLC` | **Reservada**: falhas que o próprio PLC informar | — |

Regras:
1. **Nunca reutilizar um número.** Se um código sair de uso, o número fica aposentado.
2. **Texto**: português, frase curta, diz **o que** não funciona e, quando houver, **por quê** (mensagem do Node-RED/PLC). Sem sigla sem explicação. Máx. ~160 caracteres.
3. **Tipo**: `Falha` = algo que deveria funcionar e não funciona; `Alerta` = aviso, nada quebrou (ex.: comando bloqueado de propósito).
4. **Referência** (opcional): separa a mesma ocorrência em itens diferentes — `COM-001 · BC56` e `COM-001 · BC400` são duas ocorrências.
5. **Um card dono** por código: é onde o operador vê o efeito. `app` = não tem card; aparece só no botão geral.

## 3. Estado de uma ocorrência

| Estado | Quando |
|---|---|
| **Ativa** | a causa existe agora |
| **Normalizou às hh:mm:ss** | a causa sumiu (a leitura voltou, o gravar deu certo…) ou, nas de evento, ficou sem se repetir pelo tempo de expiração |

A ocorrência **não é apagada** ao normalizar (fica no histórico da sessão, filtro "Todas"); "Limpar normalizadas" remove da lista. O triângulo e o contador do botão geral contam só as **ativas**.

Não há "reconhecer/silenciar": enquanto a causa existe, a ocorrência fica ativa. (Se quiser reconhecimento, é decisão sua — hoje não existe.)

## 4. Catálogo implementado (HTML v1.9.64)

| Código | Tipo | Card | Texto-base | Ativa quando | Normaliza quando |
|---|---|---|---|---|---|
| `COM-001` (· BC56 / BC400) | Falha | Modo | "BCxx: não conectado / perdeu a conexão — *motivo*" | modo com PLC (real ou Demo + PLC) e URL definida, e o banco sem leitura do PLC nos últimos 5 s (e já houve leitura **ou** passaram 8 s da abertura) | a leitura do banco volta |
| `COM-002` | Falha | Modo | "não conectado / perdeu a conexão — sem resposta do Node-RED das chaves" | modo com PLC (real ou Demo + PLC) e nenhuma resposta nos últimos 5 s | o Node-RED responde |
| `COM-003` | Falha | Modo | "*motivo* (GET /api/ensaio/modo)" | registro do ensaio no Node-RED (modo real ou Demo + PLC) e o GET do modo deu erro | o GET volta a responder |
| `COM-005` (· BC56 / BC400) | Falha | Modo | "BCxx: PLC sem comunicação com o ET200 (FB101 ComOk = FALSE) — banco desligado pelo PLC" | HTML v1.9.77 com flow v2.4: `GET` traz `comEt200Ok:false` (lido de `sbBanco.comEt200Ok`) | `comEt200Ok` volta a TRUE. **v1.9.77** (estava reservado; não precisou do DB151/DB159) |
| `DSE-001` | Falha | Leitura das grandezas | "não conectado / perdeu a conexão — a API do gerador (/api/gerador) não responde" | Demo desligado e sem resposta do DSE | a API volta |
| `DSE-002` | Alerta | Leitura das grandezas | "Demo desligado automaticamente: um DSE real respondeu em *URL* com leitura válida. Modo REAL ativo; chaves desligadas e janelas fechadas." | com o Demo ligado, a consulta de 5 s ao endereço do DSE devolveu `ok:true` e `idadeSegundos` ≤ 10 s | expira em 10 min. **v1.9.66** |
| `CHV-001` (· BC56 / BC400) | Falha | Banco de Cargas | "BCxx: comando "*rota*" não executado — *motivo*" | um POST de chave (ligar, habilitar, selecionar, salvar, usarKwReal, limpar) falhou | o próximo POST do mesmo banco dá certo |
| `CHV-002` (· BC56 / BC400) | Alerta | Banco de Cargas | "BCxx: comando bloqueado — banco sem leitura do PLC (*motivo*)" | o operador clicou numa chave com o banco sem leitura (a tela **não** envia o comando) | 30 s sem repetir |
| `CHV-003` | Alerta | Banco de Cargas | "Modo DEMO + PLC: o DSE é simulado, mas clicar numa chave comanda o PLC de verdade (*URL*)…" | modo **Demo + PLC** (Demo ligado **e** "Usar o PLC real" marcado) com URL | normaliza ao sair de Demo + PLC (varredura de 1 s). **v1.9.65; significado ajustado na v1.9.66** (antes: Demo ligado com ⚙ Servidor em "Node-RED real") |
| `CHV-004` (· BC56 / BC400) | Alerta | Banco de Cargas | "BCxx: o Node-RED zerou N chave(s) comandada(s) às HH:MM:SS porque nenhuma tela consultou o PLC (vigia de segurança)…" | o `GET` traz `wdZerou.ts` novo e de menos de 10 min (flow v2.3) | expira em 3 min. **v1.9.65** |
| `CHV-005` (· BC56 / BC400) | Falha | Banco de Cargas | "BCxx: banco bloqueado pelo PLC — (seletora em Manual / sem comunicação PLC ↔ ET200)…" | HTML v1.9.77 com flow v2.4: o banco estava liberado e a leitura do PLC passou a bloqueá-lo (seletora saiu de Auto ou `comEt200Ok` falso) | limpa quando o banco volta a ficar liberado (Auto + Ligar banco) |
| `ENS-001` | Falha | Registro do ensaio | "Preenchimento NÃO gravado no PLC: *motivo*" | o envio dos Dados do ensaio falhou | um novo envio confirma |
| `ENS-002` (· E1…E6) | Falha | Registro do ensaio | "Etapa *n* (*alvo* %) NÃO gravada no PLC: *motivo*" | salvar a etapa falhou | a etapa é regravada e confirmada |
| `ENS-003` | Alerta | Registro do ensaio | "Dados do ensaio: a leitura de volta não trouxe o preenchimento" | gravou, mas o PLC não devolveu o que foi enviado | reenvio confirmado |
| `SIS-001` | Falha | Aplicação (geral) | "Erro interno da tela: *mensagem do navegador*" | erro de JavaScript não tratado (ignora o aviso inofensivo "ResizeObserver loop") | 60 s sem repetir |

> "Não conectado" = nunca houve leitura nesta página; "perdeu a conexão" = havia leitura e parou. As bolinhas do card Modo usam as mesmas palavras (cinza nos dois casos).

## 5. Reservado para depois (não implementado)

| Código | Assunto | Depende de |
|---|---|---|
| `COM-004` | Programa do PLC sem batimento (CPU lida, mas o pulso `sb.hbPlc` parado) | DB58 (`ESPECIFICACAO_DB58_MODO_HEARTBEAT.md`) |
| `PLC-NNN` | Falhas informadas pelo próprio PLC (por exemplo, uma palavra de falhas num DB de status) | definição do DB de status; cada bit → um código |

## 6. Como acrescentar uma ocorrência nova (no HTML)

1. Incluir o código na tabela `CAT` do módulo `OCOR` (tipo, card, texto-base) e neste documento.
2. Ocorrência de **estado** (a causa pode ser consultada a qualquer momento): ligar/desligar dentro de `varre()` com `liga(condição, 'AAA-NNN', texto, referência)`.
3. Ocorrência de **evento** (algo que acontece num instante): chamar `OCOR.set(card, 'AAA-NNN', texto, {ref, ev:true, expira:ms})` onde o evento acontece e, quando fizer sentido, `OCOR.limpa(card, 'AAA-NNN', ref)` no sucesso seguinte.
4. Testar: provocar a causa, ver o triângulo, abrir a janela, remover a causa e ver "Normalizou".

## 7. Limites (honestidade)

- **Não é alarme de segurança.** É informação para o operador; nenhum comando do PLC depende disto.
- A lista da janela vive na **memória da página** (recarregar zera); o que aconteceu fica no **Histórico (Buffer)** do navegador (seção 8). Histórico em servidor/PLC não existe ainda.
- Só enxerga o que o HTML enxerga: se o Node-RED e o HTML caírem juntos, quem registra a queda é o PLC (futuro, família `PLC`/`COM-004`).
- Testado só contra o emulador de Node-RED; não contra o PLC real.

## 8. Histórico (Buffer) de Alertas e Falhas — novo na v1.1 (HTML v1.10.103)

**O que é.** Registro circular dos últimos **500 eventos** (cada vez que uma ocorrência **ativou** ou **normalizou**), guardado no **localStorage** do navegador (chave `medidor.alertasHist.v1`). Abre pelo botão **Histórico** da janela Alertas e Falhas.

| Campo | Conteúdo |
|---|---|
| Data e hora | momento do evento |
| Evento | Ativou / Normalizou |
| Tipo · Card · Código · Texto | os mesmos da lista (código no formato `T-AAA-NNN`) |
| Modo | DEMO ou REAL no momento do evento |

**Regras.** (1) Buffer circular: ao passar de 500, saem os mais antigos. (2) Grava no máximo a cada 2 s e ao sair da página (não pesa). (3) Se o navegador não deixar gravar (modo privado, cheio), o histórico segue só na memória e a tela não trava. (4) Filtros por card e tipo; **Exportar ▾** (TXT / MD / PDF); **Limpar histórico** (pede confirmação). (5) Não é enviado a lugar nenhum e não comanda nada. (6) É por navegador/computador: outro PC ou outro navegador tem o seu próprio histórico.

**Por que localStorage (técnico):** não depende do Node-RED/PLC (que podem ser justamente a causa da falha), funciona com o HTML aberto como arquivo e sobrevive a F5. **Limite honesto:** é limpo se o usuário apagar os dados do navegador.

## 9. Exportar ▾ (padrão do projeto desde a v1.10.103)

Um único botão **Exportar ▾** abre um menu com **Texto (.txt)**, **Markdown (.md)** e **PDF (imprimir)** — só as opções que fazem sentido para o conteúdo (o gráfico oferece só PNG e CSV). **JSON** não entra neste menu: é formato de máquina e fica separado, onde for necessário (ex.: gerenciador de logs, salvar/abrir ensaio no gráfico). Nome do arquivo: `nome_DEMO|REAL_AAAAMMDD_HHMMSS.ext`.
