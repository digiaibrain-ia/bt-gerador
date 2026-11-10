# Migração BT2 — plano v0.3 (03/11/2026)

Substitui o v0.2. Registra as decisões tomadas por critério enquanto o operador está ausente. Regra combinada: decido sozinho o que for critério/lógica; paro só se algo fugir do combinado.

## Decisões do operador (03/11/2026)
- Bancos novos usam **FB novo de 32 chaves** (evita retrabalho).
- Pendências do Excel respondidas por critério pelo assistente (abaixo).

## Decisões por critério (assistente)

| # | Pergunta | Decisão | Critério |
|---|---|---|---|
| 1 | Limite de 16 posições | FB102 (setup) e FB103 (ET200) de 32 chaves; FB100/FB101 ficam para BC56/BC400 | decisão do operador; não mexe no que já foi testado |
| 2 | Migrar BC56/BC400 para os FBs de 32? | **Não agora.** Só depois que BC59,5/BC550 funcionarem | risco: BC56/BC400 estão testados com PLC real |
| 3 | Numeração dos bancos novos | já nascem na faixa v4 (DB3200…, DB3300…) | decisão anterior do operador (usar v4) |
| 4 | Remotos no ET200 | DB40 `ComBC595`, DB41 `ComBC550`, 16 bytes cada (cmd 4 B + vida 2 + ligar 1 + res 1; fbk 4 B + vida 2 + seletora 1 + res 1) | sequência após DB38/DB39; operador confirma no TIA do ET200 |
| 5 | Retentividade dos DBs de setup | DB de setup por tensão deve ser retentivo; DB de chaves segue padrão do DB150 (non retain) | igual ao padrão atual; marcado para conferir no TIA |
| 6 | Ligação 4 bancos × 1 conexão S7 | manter um ID de conexão por ora; risco anotado no cabeçalho do FB103 (aumentar `Pausa` ou separar conexões se houver erro de recurso ocupado) | só dá para saber no PLC |
| 7 | Nomes trocados DB155/DB163 | corrigir na renumeração; FB101 v0.7 já traz os nomes certos | evita mexer agora |

## Entregue nesta etapa (rascunhos, não compilados no TIA)
- `plc/bt2/bancos_cargas/fb102_setupChaves32_v0.1.scl`, `exemplo_chamada_fb102_v0.1.scl`
- `plc/bt2/bancos_cargas/db3200_BC595_Chaves_v0.1.db`, `db3202_BC595_SetupPorTensao_v0.1.db`, `db3300_BC550_Chaves_v0.1.db`, `db3302_BC550_SetupPorTensao_v0.1.db`
- `plc/bt2/comunicacao_et200/fb103_ComEt200_32_v0.1.scl`, `fb103_ComEt200_32_chamadas_v0.1.scl`, `db40_db41_ComEt200_32_v0.1.scl`
- `docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v5.1_exemplo.xlsx`

Offsets dos DBs de 32 chaves (para o Node-RED): chaves — `cb.ligar` X0.0, `sb.ligada` X4.0, `habilitada` X8.0, `setupOk` X12.0, `kwReal` D16, `rMedidoOhm` D144, `rTeoricoOhm` D272, `setupData` B400, `nominal` D784, `chaveSel` W912, `salvar` X914.0, `usarKwReal` X914.1, `cbBanco.ligar` X916.0, `sbBanco.seletoraAuto` X918.0, `comEt200Ok` X918.1. Setup por tensão — `tensaoV` W0/2/4, `kwReal` D6+4p, `rMedidoOhm` D390+4p, `vMedidaV` D774+4p, `baseKw` D1158+4p, `setupData` B1542+12p, `setupOk` X2694.0+p, `tensaoSel` W2706 (p = (tensão−1)*32 + (chave−1)).

## O que depende do operador (fica na fila)
1. Importar os DBs/FBs no TIA do 1515, compilar e avisar erros (rascunhos nunca compilados).
2. No TIA do ET200: criar DB40/DB41 e estender o FC4 para 32 bits por banco.
3. Confirmar nomes/números dos remotos.

## Próximo (sem esperar)
Fase 4: Node-RED parametrizado para os bancos novos (rotas `/api/chaves/{id}` com offsets acima).

## Fase 4 — feito (rascunho): fluxos Node-RED dos bancos novos
- `nodered/flows/bt2/chaves-595-api-v1.0.json` (DB3200/DB3202, 18 chaves) e `chaves-550-api-v1.0.json` (DB3300/DB3302, 12 chaves).
- Gerados do `chaves-400-api-v2.6` (mesma lógica de fila, vigia "HTML sumiu", conferência de releitura e Setup por tensão), trocando só DBs, offsets, tamanho (32) e prefixo dos nós (`chv595_`, `chv550_`).
- Rotas: `/api/chaves/595/...` e `/api/chaves/550/...` (`/api/logs/{id}`). **Slug 595 e não "59,5"** para não ter vírgula na URL; o HTML (id `59,5`) ganha um campo `rota` na fase 5.
- Checado: JSON válido, JS de todos os nós sem erro de sintaxe, ids únicos. **Não testado em PLC/Node-RED.**
- Ao importar: o mesmo IP do PLC ([IP_1515]) dos fluxos atuais; só funciona depois dos DBs/FBs no 1515 e do ET200.

## Fase 5 — feito em parte: medidor 1.10.155
- Campo `rota` por banco (`rotaDe(id)`): BC56 → 56, BC400 → 400, BC59,5 → 595, BC550 → 550. Usado no polling, em `rotaCh` (todos os POST) e na janela de Logs.
- `semPlc` **mantido** nos dois bancos novos: tirar só quando o PLC deles existir (senão ficariam "sem leitura" no PLC real). É a mudança de uma linha por banco.
- Teste: Playwright (carrega, sem erros de console, mapeamento de rotas conferido). Não foi gerado pacote para o PC nem alterado o catálogo, porque nada muda na tela hoje.
- Faltam os literais `'56'/'400'` espalhados no HTML (fase 5 completa), que não bloqueiam os bancos novos.
