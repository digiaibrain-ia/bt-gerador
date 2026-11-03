# Migração BT2 — plano v0.5 (03/11/2026)

Substitui o v0.4. O operador autorizou reorganizar a numeração inteira e deixar tudo pronto para implantar em 04/11/2026.

## Decisões
- **Numeração v4 para todos os bancos do BT2**: BC56 = 3000, BC400 = 3100, BC59,5 = 3200, BC550 = 3300 (chaves; +2 setup por tensão; +4 instância do FB de setup; +5 instância do FB do ET200). DSE = 2000, snap manual = 2100. Competência BT1/BT2 e BT1 ficam para depois.
- **FB pelo tamanho**: ≤16 chaves → FB100/FB101; 17–32 → FB102/FB103.
- **ET200 flexível**: o número do DB remoto é um campo da ficha; se estiver ocupado, troca-se o campo e regera (ver `ET200_PREVISIBILIDADE_v0.1.md`).
- **Chave "bancos novos no PLC"** no HTML (`?novos=1` ou Detalhes › Ajustes): liga BC59,5 e BC550 sem editar código.
- Em dúvidas de critério decidi sozinho; as que dependem do equipamento ficaram no roteiro.

## Entregue
| Área | Arquivos |
|---|---|
| Gerador | `plc/bt2/gerador/gerar_banco_v0.2.py`, `bancos_bt2_v0.2.json`, `LEIA-ME.md` |
| PLC | `db3000/3002`, `db3100/3102`, `db3200/3202`, `db3300/3302` (v0.2), `db2100_BancoTeste2_SnapManual_v0.2`, `chamadas_BC56/BC400/BC595/BC550_v0.2`, FB102, FB103, `db40_ComBC595_32_v0.2`, `db41_ComBC550_v0.1` |
| Node-RED | `chaves-56-api-v3.0`, `chaves-400-api-v3.0`, `chaves-595-api-v1.1`, `chaves-550-api-v1.1`, `cliente-156-dse-plc-carga-v2`, `cliente-31-seletor-plc-db2000-v3`, `registro-ensaio-db2100-api-v1.5`, `simulador-dse-demo-v4` |
| HTML | `medidor_gerador_v1.10.156.html` (sem literais `'56'/'400'` na lógica; DB por banco vem de `BANCOS`) |
| Docs | `IMPLANTACAO_ROTEIRO_v0.1.md`, `ET200_PREVISIBILIDADE_v0.1.md`, `MAPA_RENUMERACAO_BT2_v0.1.csv`, Excel v6 |
| Pacote | `dashboard/pacotes/bt2-1.10.156/` (+ `.zip`) |

## Verificado
- Flows gerados: JSON válido; para 16 chaves o gerador reproduz as variáveis do `chaves-400` v2.6 sem diferenças; o fluxo BC56 gerado só difere do v2.6 no número dos DBs, no prefixo dos nós e no limite de índice (13 em vez de 16).
- HTML 1.10.156 (Playwright): sem erros; chave desligada → rotas 56 e 400; chave ligada → 56, 400, 595 e 550.
- Excel: recalculado no LibreOffice sem erros.

## Não verificado
Compilação no TIA; PLC e ET200 reais; Node-RED real; FC4 do ET200 (fonte não está no repositório); comportamento de 4 bancos na mesma conexão S7.

## Limites conhecidos
- Registro de logs de desenvolvedor (`sel56`, `lig56`, `b56`…) ainda usa nomes fixos para BC56/BC400; não afeta a operação.
- O HTML continua dizendo "DB150" em textos antigos do histórico (só texto).
