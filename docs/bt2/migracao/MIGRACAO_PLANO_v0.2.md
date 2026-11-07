# Migração BT2 — plano v0.2 (03/11/2026)

> Substitui o v0.1 (mantido como histórico). Registra as decisões do operador de 03/11/2026.

## Decisões registradas

| # | Decisão |
|---|---|
| 1 | OB1 e FC100 só fazem chamadas: não precisam ser exportados. DB52 = o que já está no repositório. DB20 é exemplo de programação: desconsiderado. |
| 2 | Numeração = plano v4, organizada em Excel como exemplo: `docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v5_exemplo.xlsx`. |
| 3 | Competência BT1/BT2 (DBs 500–599): depois. |
| 4 | BT2 primeiro, BT1 depois. |
| 5 | Papel da 1200: por ora o ET200 faz esse papel junto com a 1515. |
| 6 | Ficha dos bancos novos aceita (kW por chave; tensões 220/380/440 V assumidas). |

## Achado que bloqueia o BC59,5

Todos os arrays do PLC (DB Chaves, FB100, FB101) e o telegrama PUT/GET (6+6 bytes) têm **16 posições**. O BC59,5 tem **18 chaves**. O BC550 (12) cabe.

Opções (decisão do operador):
- **a)** ampliar para 24 ou 32 posições (muda FB100, FB101, DBs e o FC4 do ET200);
- **b)** tratar o BC59,5 como 2 bancos lógicos (9 + 9);
- **c)** outra solução física/lógica.

## Fases (revisadas)

| Fase | O quê | Estado |
|---|---|---|
| 0 | Congelar versão e backups | feito |
| 1 | Inventário do PLC | dispensado (decisão 1) |
| 2 | Decisões | feitas, exceto o limite de 16 posições |
| 3 | PLC: rascunhos SCL/DB do BC550 (cabe) e do BC59,5 (após decisão) — endereços não confirmados ficam marcados "a confirmar" | próxima |
| 4 | Node-RED parametrizado `/api/chaves/{id}` | depois da 3 |
| 5 | HTML sem `semPlc`, lista de bancos em dados | depois da 4 |
| 6 | Testes Demo + PLC por banco, bancos desligados | depois da 5 |
| 7 | Renumeração para a faixa v4 e competência | competência depois |

Renumerar muda os endereços S7 dos fluxos (DB150 → DB3000 etc.); só fazer com snapshot e teste com bancos desligados.
