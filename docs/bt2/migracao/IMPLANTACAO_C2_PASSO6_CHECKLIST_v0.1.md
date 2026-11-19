# Implantação do C2 + Passo 6 + medidor 1.10.231 · checklist v0.1 · 19/11/2026

Para a TI e a Engenharia. Continua valendo o `IMPLANTACAO_C1_CHECKLIST_v0.1.md` (backup, uma aba por vez, carga **desacoplada**, OK do Reginaldo). **Eu não implanto**: nada foi importado no PC BT2, no PLC ou no DSE.

## O que muda (em relação ao pacote v1.27)
| Parte | De | Para |
|---|---|---|
| Fluxos de chaves | v3.8 / v3.7 / v1.8 / v1.8 (C1) | `chaves-56 v3.9`, `chaves-400 v3.8`, `chaves-550 v1.9`, `chaves-595 v1.9` (C2) |
| Fluxo novo | — | `gerador-capacidade-api-v1.0` (POST/GET `/api/gerador/capacidade`) |
| Fluxo do DSE | `servidor-deepsea-api-gerador v3_7` | `v3_8` (só o log: 1 aviso por bloco a cada 5 min) |
| Arquivo de capacidade | v0.1 | v0.2 (`modo`, `gerador.kw100_max`, `validade_s`, `degrau`) |
| Medidor | 1.10.229 | 1.10.231 |
| PLC / ET200 / DSE | — | nada muda |

## Comportamento padrão (o que NÃO muda de risco)
O arquivo vem com `"modo": "registrar"`, `kw100: null` e `degrau.max_kw: null`: **nada é recusado**. O C2 só passa a recusar se alguém mudar `modo` para `recusar` (ver abaixo).
O que o operador percebe de diferente: alarmes de **comunicação** (COM-001/002/003/005, DSE-001/002, CHV-005/006) aparecem até 10 s depois e saem até 5 s depois; os de **segurança** (CHV-007/008, CHV-001, CHV-004, CHV-009, ENS-, SIS-001 e proteções do DSE) continuam imediatos. Avisar a operação.

## Ordem
1. Backup (igual ao checklist do C1) + guardar as abas v3.8/v3.7/v1.8/v1.8, o `servidor-deepsea v3_7`, o `bancos_capacidade.json` v0.1 e o medidor 1.10.229.
2. Copiar o `bancos_capacidade.json` v0.2 por cima do anterior (mesmo caminho). **Reaplicar as variáveis da aba** (`BT2_ORIGENS_OK`, `WD_HTML_S`, `CONF_JANELA_MS`, `QUARENTENA_MS`, `BT2_CAPACIDADE_JSON`) em cada aba importada.
3. Importar uma aba por vez, apagando a anterior: BC56, BC400, BC550, BC595. Após cada Deploy, log: `capacidade: config carregada v0.2 (modo registrar, ...)` e `GET /api/chaves/<banco>` igual ao de antes.
4. Importar `gerador-capacidade-api-v1.0` (aba nova, sem nó S7). Conferir `GET /api/gerador/capacidade`: `modo: registrar`, `efetivo.kw100: null` até o medidor avisar.
5. Trocar a aba do DSE por `servidor-deepsea-api-gerador-v3_8` (uma aba por vez; confirmar a leitura do DSE depois).
6. Copiar `medidor_gerador_v1.10.231.html` e `catalogo_ferramentas.js` para `public\\html`. Abrir o medidor em modo real com um modelo escolhido: em até 1 min `GET /api/gerador/capacidade` mostra `kw100Medidor` e `efetivo.origem: "medidor"`.
7. Ligar e desligar chaves normalmente (carga desacoplada): nada muda; `GET /api/logs/<banco>` sem `LIMITE` (modo registrar).

## Para ativar a recusa (SOMENTE com OK do Reginaldo, carga desacoplada)
1. Conferir `efetivo.kw100` e `limiteKw` em `GET /api/gerador/capacidade` (ou preencher `gerador.kw100` no arquivo para uma campanha com gerador fixo).
2. Editar `"modo": "recusar"`, reiniciar o Node-RED, conferir no log `config carregada v0.2 (modo recusar...)`.
3. Pelo medidor tentar ligar uma chave que passe do limite: tem que voltar **409 `LIMITE_EXCEDIDO`** e o comando **não** chegar ao PLC; abaixo do limite tudo normal; **desligar sempre funciona**.
4. Retorno: `"modo": "registrar"` e reiniciar (ou reimportar as abas do pacote v1.27).
`degrau.max_kw` continua `null`: o valor precisa da Engenharia (BK-AUD-10).

## Retorno (rollback)
Reimportar as abas do pacote v1.27 (BC56 v3.8, BC400 v3.7, BC550/BC595 v1.8), apagar `gerador-capacidade-api-v1.0`, voltar o `servidor-deepsea v3_7` e o medidor 1.10.229 (o arquivo v0.2 pode ficar: os fluxos antigos aceitam os campos extras).

## O que NÃO está provado
PLC/ET200 reais, `file in` com o caminho do PC, tempos reais, os tempos de debounce (10 s/5 s) na bancada e o valor do degrau. Os testes rodaram em Node-RED 5.0.9 com PLC simulado.
