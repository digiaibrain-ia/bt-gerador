# Migração BT2 — plano v0.4 (03/11/2026)

Substitui o v0.3. **Mudança:** o FB é escolhido pelo tamanho do banco (decisão do operador): até 16 chaves → FB100/FB101; 17 a 32 → FB102/FB103.

## Correção em relação ao v0.3
O v0.3 colocava o BC550 (12 chaves) nos FBs de 32. Pela regra nova ele fica nos FBs de 16. Refeito: DBs, chamadas, fluxo e Excel. Só o BC59,5 (18 chaves) usa os FBs de 32.

| Banco | Chaves | FB | DB chaves / tensão | Instâncias | Remoto ET200 | Fluxo Node-RED |
|---|---|---|---|---|---|---|
| BC56 | 13 | FB100/101 | 150 / 152 | 154 / 155 | DB38 | chaves-56 v2.6 |
| BC400 | 13 | FB100/101 | 158 / 160 | 162 / 163 | DB39 | chaves-400 v2.6 |
| BC59,5 | 18 | FB102/103 | 3200 / 3202 | 3204 / 3205 | DB40 (16 B) | chaves-595 v1.1 |
| BC550 | 12 | FB100/101 | 3300 / 3302 | 3304 / 3305 | DB41 (12 B, igual DB38) | chaves-550 v1.1 |

## Entregue (rascunhos, nada compilado/testado em PLC)
- Gerador: `plc/bt2/gerador/` (`gerar_banco_v0.1.py`, `bancos_bt2_v0.1.json`, `LEIA-ME.md`). Validado: para 16 chaves reproduz o fluxo chaves-400 v2.6.
- PLC: `db3200/3202_BC595_*_v0.2.db`, `db3300/3302_BC550_*_v0.2.db`, `chamadas_BC595_v0.2.scl`, `chamadas_BC550_v0.2.scl`, `db40_ComBC595_32_v0.2.scl`, `db41_ComBC550_v0.1.scl`, `fb102_setupChaves32_v0.1.scl`, `fb103_ComEt200_32_v0.1.scl`.
- Node-RED: `chaves-595-api-v1.1.json`, `chaves-550-api-v1.1.json` (v1.0 removidos: nunca foram para o PC).
- Excel: `docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v5.2_exemplo.xlsx`.
- HTML: medidor 1.10.155 com campo `rota` por banco; `semPlc` mantido até existir o PLC.

## Dúvidas geradas e respondidas por critério
| Dúvida | Resposta | Critério |
|---|---|---|
| BC550 (12) usa FB de 16 ou 32? | 16 | regra do operador |
| DB41 do ET200 com qual layout? | igual ao DB38 (12 bytes) | mesmo FB101, FC4 sem mudança de tamanho |
| Versão dos arquivos substituídos | novos arquivos v0.2/v1.1; os rascunhos v0.1/v1.0 saem do repositório | nunca foram entregues ao PC |
| Tirar `semPlc` agora? | não | sem PLC o banco ficaria "sem leitura" |
| Trocar os literais `'56'/'400'` do HTML | adiado | não bloqueia os bancos novos; risco de regressão |

## Fila do operador
1. Importar no TIA do 1515: FB102, FB103, DBs e chamadas; compilar e enviar erros.
2. No TIA do ET200: DB40 (16 bytes) e DB41 (12 bytes); estender o FC4 só para o BC59,5.
3. Confirmar números DB40/DB41 e os offsets dos DBs (coluna "Deslocamento").
4. Testar com bancos desligados, depois tirar `semPlc` de cada banco.
