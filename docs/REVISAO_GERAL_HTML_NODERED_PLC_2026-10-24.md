# Revisão geral HTML × Node-RED × PLC — BT2 — 24/10/2026

**Versões analisadas:** `medidor_gerador_v1.9.76.html` · `gerenciador_logs_v1.html` (v1.2) · `chaves-56-api-v2.3.json` / `chaves-400-api-v2.3.json` · `registro-ensaio-db53-api-v1.4.json` · `plc_bancos_cargas/*.scl|*.db`.
**Escopo:** só BT2, ensaio **manual**. Nada de ensaio automático. Nenhum flow e nenhum arquivo do PLC foi alterado nesta revisão (só leitura).

> **Resumo.** O Operador secreto (botão no Demo) percorreu o ciclo completo — setup das cargas, seletora/Ligar banco, Setup, ensaio de 6 etapas até gravar — em **Demo local** (122 OK · 0 falhas · 4 avisos) e em **Demo + PLC** com o emulador de Node-RED (68 OK · 0 falhas · 5 avisos). Achou 1 defeito real de tela (Setup não repintava ao mudar a seletora), já corrigido na v1.9.76. Os demais achados são avisos de comportamento e pendências que dependem de decisão ou do PLC/ET200.

---

## 1. (a) Implementado e confirmado

Testado no emulador (`nrsim.js` como Node-RED/PLC) e no Chromium (Playwright). **Nada testado em PLC/ET200 real.**

**HTML v1.9.76**
1. Setup das cargas: botão **Setup** bloqueado com ensaio em andamento (inclusive pausado) — liberado de novo ao gravar.
2. **INICIAR** bloqueado enquanto o popup Setup estiver **aberto** (decisão A).
3. Card Cargas: seletora e **Ligar banco** bloqueados durante o ensaio; **Desligar banco** continua permitido (decisão B, padrão — você não respondeu).
4. Demo **local** nasce em **Auto** com o banco **ligado**.
5. Botão **Operador secreto** (popup Demo): Demo local e Demo + PLC; recusa rodar no modo real, com ensaio em andamento ou com o Setup aberto. Registra tudo no log como `DEV.OPS` / tipo `teste`.
6. **Correção:** com o popup Setup aberto, mudar seletora/Ligar banco mudava o estado mas a nota e as chaves cinza do popup só atualizavam no próximo clique (achado do Operador secreto).

**Gerenciador de logs v1.2**
1. Divisória do detalhe arrastável **por toque** (área de 40 px em tela de toque; teto de altura recalculado).
2. Botão **? Legenda** + tooltips de Card/Tipo/Resultado/Origem reescritos; opção da lista de filtro já mostra "sigla — descrição".
3. Resumo e exportação (Markdown/JSON) com a seção **Operador secreto**.
4. Corrigido por mim durante o teste: a lista de filtro mais larga gerava rolagem horizontal no celular (agora `max-width:100%`).

**Evidência do problema do celular (reproduzido):** no v1.1, arrastar a divisória 160 px para cima levava o painel de 130 → **126 px** (teto `CONT.clientHeight − 170` travava); na v1.2 o mesmo gesto leva a **290 px**; para baixo volta a 170 px.

**Regressão automatizada (emulador + Chromium):** 21 suítes do medidor (`t7c … t33` e `t40`) + Operador secreto em Demo + PLC (`t41`) + gerenciador no celular (`t42`) — **todas verdes** no final. Três suítes precisaram de ajuste **do teste**, não do HTML:
- `t30`, `t32`, `t33`: assumiam o Demo local nascendo em Manual; agora nasce em Auto + ligado (mudança pedida).
- `t24`: a asserção "nada sai do navegador no Demo local" era sensível ao relógio — entre digitar a senha e escolher "Demo local" o modo ainda é "real" e o lote de boot pode sair (a rotina `publica()` roda a cada 1 s). Passou a medir **depois** de escolher o Demo local. Comportamento do HTML não mudou (`publica()` é idêntica à v1.9.75).
- `t31`: só a versão do gerenciador (1.1 → 1.2).

---

## 2. (b) Assumido / inferido (confirmar)

| # | Assumido | Por quê |
|---|---|---|
| 1 | "Setup aberto" (decisão A) = **popup aberto**, mesmo sem chave selecionada | Você escreveu "Etapa 1 decisão A" |
| 2 | **Desligar banco** liberado no ensaio; seletora e Ligar bloqueados | Desligar só tira carga; padrão da decisão B que você não respondeu |
| 3 | Operador secreto em **Demo + PLC** pode habilitar chaves, ligar uma chave por banco e apagar/regravar o DB53 | Você pediu "demo + PLC" e "roda até executar ciclo completo"; o botão pede confirmação e restaura as chaves ao final |
| 4 | O emulador `nrsim` reproduz a fila de escrita/leitura e o vigia do flow v2.3 | Ele carrega os JSON reais dos flows; **não reproduz** rede S7, ET200 nem PUT/GET |
| 5 | A causa das "26 chaves desabilitadas" no Demo é a chave de `localStorage` compartilhada com o modo PLC | Conferido no código (`medidor.chavesDes`); a origem exata dos valores no seu navegador não foi vista |

---

## 3. Achados

### 3.1 HTML

| ID | Gravidade | Achado | Estado |
|---|---|---|---|
| H1 | Média | **Demo herda as chaves desabilitadas do modo PLC** (`localStorage` `medidor.chavesDes` é a mesma chave nos dois). Entrar no Demo depois de usar o PLC pode mostrar o card Cargas inteiro "desabilitado". | Operador contorna (habilita e restaura). **Correção proposta, não aplicada:** chave separada para Demo local. |
| H2 | Baixa/Média | **Demo: INICIAR fica desabilitado, sem tooltip, quando o gerador simulado está ligado** (ex.: depois do Setup). No modo real o INICIAR arma o ensaio com o gerador já operando — comportamento diferente entre Demo e real. | **Proposta (1 linha), não aplicada:** habilitar também com gerador `operando` e explicar no tooltip. |
| H3 | — | Setup não repintava ao mudar seletora/Ligar banco com o popup aberto | **Corrigido** na v1.9.76 |
| H5 | Baixa (transitório) | **Leitura atrasada do PLC regrava a tela por 1–2 s.** Em `chAtualizaUm` (modo PLC/Demo + PLC) todo GET sobrescreve `DIS[]` (habilitada) e `SEL` (`chaveSel`) com o que o PLC devolveu. Um GET que já estava em voo antes do POST `/habilitar` ou `/selecionar` volta com o valor antigo: a chave recém-habilitada reaparece "desabilitada", ou a chave recém-desmarcada no Setup reaparece "selecionada" depois de fechar o popup, até a leitura seguinte. Visto na 2ª execução do Operador secreto em Demo + PLC (não na 1ª). O PLC em si fica certo; é só a tela. | **Proposta, não aplicada:** ignorar `habilitada`/`chaveSel` do GET enquanto houver POST pendente do mesmo banco e por ~1,5 s depois (mesma ideia do `CH_PEND`, que já protege `cb.ligar`). O Operador secreto agora trata e registra como aviso. |
| H4 | Informativo | Interbloqueio da seletora/Ligar banco só vale no **Demo local** (`BKS[id].sel !== null`). Com PLC real continua "sem sinal": os sinais não existem. | Depende de `PROPOSTA_SINAIS_LIGAR_BANCO_E_SELETORA_v0.1.md` D1/D2/D3 |

### 3.2 Node-RED

| ID | Achado | Arquivo |
|---|---|---|
| N1 | **Vigia "HTML sumiu"** só age se: leitura recente do PLC (≤ 2,5 s), existe `CbLigar` TRUE, fila livre, 5 s desde a última tentativa. Se o **próprio Node-RED parar**, nada zera o `cb.ligar` no DB150/DB158. | `chaves-56-api-v2.3.json` (nó "vigia: HTML sumiu → ZERAR cbLigar"); `PROTECAO_COMANDOS_PERSISTENTES_CB.md` |
| N2 | Rotas da seletora e de "Ligar banco" **não existem** (nenhum nome de rota foi criado; só proposto) | `PROPOSTA_SINAIS_LIGAR_BANCO_E_SELETORA_v0.1.md` |
| N3 | `GET /api/gerador → 404` (592 ocorrências no log real analisado): origem **não resolvida**. Um 404 do Node-RED significa que o servidor respondeu, mas **a rota não está registrada ali** — **inferência (b):** flow do DSE não implantado/aba desabilitada, ou rota com outro nome. O HTML aponta para `http://172.17.210.156:1880/api/gerador` (campo `#url`); o flow que atende essa rota **não está** entre os arquivos do projeto que li. Preciso do JSON dele (aba do DSE) para confirmar. | `medidor_gerador_v1.9.76.html` (campo `#url`); `CONTRATO_HTTP_HTML_NODERED_DEV_LOGS.md` (gerenciador v1.1) |

### 3.3 PLC / ET200

| ID | Gravidade | Achado | Arquivo |
|---|---|---|---|
| P1 | **Alta (antes do teste real)** | `setup.nominal[]` do **DB150** está em ordem **antiga/decrescente** (5×5, 4×7, 3) e o **DB158** (50×7, 10×4, 5×2). O HTML v1.9.74+ usa a ordem **crescente** (BC56: 3, 4×7, 5×5 · BC400: 5, 5, 10×4, 50×7). O HTML **não consome** `nominal[]` da API (calcula R teórico sozinho), mas o `rTeoricoOhm[]` gravado pelo FB100 sai do `nominal[]` antigo, e o mapeamento bit n−1 → contator no FC4 do ET200 precisa seguir a mesma ordem física. **Já estava registrado** como "ATENÇÃO" no contrato; continua pendente. | `plc_bancos_cargas/db150_BC56_Chaves.db`, `db158_BC400_Chaves.db`; `CONTRATO_HTTP_HTML_NODERED_CHAVES.md` |
| P2 | Média | Arquivos locais `fb101_ComEt200_chamadas.scl` e `db10_db11_ComEt200_v0.1.scl` ainda usam **DB10/DB11** no ET200, enquanto os prints citados no contrato mostram **DB38 `ComBC56` / DB39 `ComBC400`**. Fonte local desatualizada em relação ao TIA (você vai trocar os literais no FB101 — inversão 56 ↔ 400). | `plc_bancos_cargas/fb101_ComEt200_chamadas.scl`, `db10_db11_ComEt200_v0.1.scl` |
| P3 | Alta (segurança) | `fb102_WatchdogComandos` **não existe** (só rascunho `fb_watchdogComEt200_RASCUNHO_v0.1.scl`, `Habilita := FALSE`). Sem ele, queda do Node-RED/rede não zera `cb.ligar` no PLC. O contrato do ET200 (zerar saídas se `vida1515` parar por 2 s) depende de lógica do **seu lado**, ainda não confirmada (Q5). | `fb_watchdogComEt200_RASCUNHO_v0.1.scl`; `PASSO_A_PASSO_PUT_GET_1515_ET200_v2.md` §4.2 e §9 |
| P4 | Informativo | Canal × banco físico: rota `/api/chaves/56` → DB150 → instância DB155 → ET200 DB38; `/api/chaves/400` → DB158 → DB163 → ET200 DB39. Com a sua inversão no FB101 o **canal 56** passa a comandar o **banco físico de 400 kW**. Os documentos ainda não dizem isso. | `CONTRATO_HTTP_HTML_NODERED_CHAVES.md` (nota da linha 9) |

---

## 4. (c) A desenvolver / decisões pendentes (nada feito)

1. Decidir **D1/D2/D3** da proposta de sinais (seletora Manual/Auto e Ligar banco) — sem isso o interbloqueio não chega ao PLC.
2. Reordenar `nominal[]` dos DB150/DB158 e conferir o FC4 do ET200 (P1).
3. `fb102` + pulso do Node-RED no DB58 + sinal de validade no DB52 (P3; decisões D2–D4 de `PROTECAO_COMANDOS_PERSISTENTES_CB.md`).
4. Atualizar documentos da inversão 56 ↔ 400 — **só depois** de você confirmar que trocou e testou no FB101 **e** escrever "Pode alterar".
5. Correções H1 e H2 (se quiser).
6. Registrar a sigla `DEV.OPS` em `PADRAO_SIGLAS_CARDS.md`.
7. Teste em PLC/ET200 reais seguindo `CHECKLIST_DECISAO_TESTE_REAL_BT2.md`.

---

## 5. Como repetir os testes

- **Operador secreto (usuário):** abrir o HTML → **Demo** (senha) → Tradicional ou "Usar o PLC (Node-RED)" → **▶ Iniciar o Operador secreto**. Esc ou **Parar** interrompe; o relatório sai em **Copiar relatório** e no log (`DEV.OPS`).
- **Gerenciador:** abrir `gerenciador_logs_v1.html`, carregar o log; no celular arrastar a barra horizontal abaixo da tabela.
- **Regressão automatizada** (scratchpad do desenvolvedor): suítes `t7c … t33` + `t40` (operador local) + `t41` (operador Demo + PLC) + `t42` (gerenciador mobile).

## Glossário (contextual)

- **Operador secreto:** rotina de teste do Demo que age como "cliente oculto": usa todas as funções e anota o que não bate.
- **Demo local / Demo + PLC / real:** Demo local = tudo no navegador; Demo + PLC = medições simuladas, chaves no PLC; real = tudo de verdade.
- **Seletora (Auto/Manual):** chave física do banco: Auto = remoto (o sistema comanda), Manual = local.
- **Canal × banco físico:** `56`/`400` na rota é o canal de comunicação; pode não ser o mesmo banco físico depois da inversão no FB101.
- **Vigia "HTML sumiu":** rotina do flow v2.3 que zera os comandos das chaves se a tela some por 30 s.
- **nominal[]:** kW nominal de cada chave guardado no DB do banco.
