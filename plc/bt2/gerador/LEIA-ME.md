# Gerador de blocos de banco de carga (BT2)

**Regra (03/11/2026):** o FB é escolhido pelo número de chaves do banco.

| Chaves | Arrays | FB de setup | FB de comunicação ET200 | Telegrama |
|---|---|---|---|---|
| até 16 | 16 | `fb100_setupChaves` | `fb101_ComEt200` | 6+6 bytes |
| 17 a 32 | 32 | `fb102_setupChaves32` | `fb103_ComEt200_32` | 8+8 bytes |

Hoje: BC56 (13), BC400 (13), BC550 (12) → FB100/FB101. BC59,5 (18) → FB102/FB103.

## Como adicionar um banco
1. Acrescente a ficha em `bancos_bt2_v0.3.json` (nome, slug da rota, DB base, remoto do ET200, kW por chave na ordem física).
2. `python3 plc/bt2/gerador/gerar_banco_v0.3.py <ID>` → gera o fluxo Node-RED `chaves-<slug>-api-v1.1.json`.
3. `python3 plc/bt2/gerador/gerar_banco_v0.3.py <ID> --blocos` → gera os DBs (`.db`) e as chamadas (`.scl`) em `plc/bt2/bancos_cargas/`.
4. No HTML, acrescentar a linha do banco em `BANCOS` com `rota`.

## Conferido
Para 16 chaves o gerador reproduz exatamente as variáveis do fluxo `chaves-400-api-v2.6` (zero diferenças nos dois endpoints). Offsets dos DBs de 16 batem com o DB150/DB152 existentes.

## Não conferido
Nada foi compilado no TIA nem testado em PLC/Node-RED real. Os offsets dos DBs são calculados: conferir a coluna "Deslocamento" no TIA.

## v0.3 (03/11/2026)
`--extras` passa a usar os FBs do ET200 revisados (`fb_bancoEt200_16/32_v0.2.scl`: não religam sozinhos após queda de comunicação) em vez de regerar a v0.1, e gera `fc_bancosNovosEt200_v0.2` (sem S7_Optimized_Access) e `fc_chamadasBancos_BT2_v0.2`.
