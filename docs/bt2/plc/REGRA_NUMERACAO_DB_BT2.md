# Regra de numeração de DB/FB/FC e Setup de chaves — BT2

Complementa `claude/ARQUITETURA_DADOS_ENSAIO_PLC.md`.

## Regra de numeração de DB / FB / FC (definida pelo usuário em 19/10/2026)

**Confirmado (dito pelo usuário):**
- **BT2** usa **DB50–DB99** (e o mesmo intervalo vale para FC e FB). **BT1** usa **DB100–DB149** (idem FC/FB). Não misturar.
- **DB50 e DB51**: reserva por enquanto.
- **DB50–DB59**: DBs dos **cards** — um DB por card, tudo do card nesse DB (no PLC provavelmente haverá FB/FC dedicado a cada card).
- **DB60–DB69**: DBs de **instância de FB**, etc.
- A escolha dos números de cada card fica a critério do assistente, **a partir do DB54**, seguindo a ordem.
- Já definidos antes pelo usuário: **DB52** = telemetria DSE (`db52_BancoTeste2_DSE`), **DB53** = Registro do ensaio (SNAP MANUAL), **DB54** = cards de parâmetros, **DB55** = chaves (acesso via S7 contrib).

**Proposta (NÃO confirmada, aguardando o usuário):**
| DB | Card / função |
|---|---|
| 54 | Parâmetros / Faixas (tipo de ensaio, etapas, tolerâncias, água) |
| 55 | Chaves do banco de carga (habilita/desabilita, kW real do Setup, CBs) |
| 56 | Etapas do ensaio (estado, cronômetro, comandos) |
| 57 | Dados do ensaio (preenchimento SAP) |
| 58 | Modo de operação (tipo, salvamento, gráfico, Node-RED manual/auto) |
| 59 | reserva |
| 60+ | instâncias de FB (ex.: FB DB52→DB53; FB de Setup das chaves) |

## Setup da chave (kW real) — ideia do usuário, 19/10/2026
- Só com o gerador em START e sem ensaio em andamento; uma chave por vez, as demais bloqueadas temporariamente.
- kW real da chave = kW lido do DSE com a chave − kW sem carga. Salvo para poder usar o valor real no ensaio.
- **Implementado** no HTML v1.9.34 (só no navegador/localStorage, Demo simula ±2%); **a desenvolver**: FB no PLC e campos no DB55.
