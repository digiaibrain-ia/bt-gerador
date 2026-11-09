# Roteiro para o programador do PLC de cargas (S7-1200) - v0.3 (09/11/2026) RASCUNHO

Complementa o `ROTEIRO_..._v0.2.md` (contexto, DBs, telegrama, ordem de carga, testes de bancada). Aqui: o que mudou depois das decisoes do Reginaldo e o BC59,5.

## Decisoes do Reginaldo (09/11/2026)
| # | Assunto | Decisao |
|---|---|---|
| 1 | Firmware da CPU | Nao importa. Seguir; confirmar `TON_TIME` e ponteiro absoluto no TIA. |
| 2 | Enderecos fisicos | Nao precisamos. Valem os **DBs definidos aqui**; o programador liga as E/S e acerta a logica dele com estes sinais. Os tags do CSV sao so nomes propostos. |
| 3 | Retorno do contator geral, tensao/corrente/temperatura | Futuro. Hoje `bancoLigadoFbk` fica FALSE. |
| 4 | Ventilador | Nao existe monitoramento. **Nao trava nada agora** (`UsaVentilador = FALSE`; `ventiladorOk` reservado). Futuro. |
| 5 | DB26 / numeros de DB | Resolvido: valem os DBs deste pacote (mesmos numeros da 1500). O programador revisa do lado dele. |
| 6 | Tensao de chaveamento no 1200 | Futuro, pelo DB de competencia (`chaveamentoFisicoV` ja reservado; hoje 0 = nao sabe). |
| 7 | Conexoes S7 livres / protecao de acesso | Fica para depois (o Reginaldo chama o assunto). `ID_Conexao` segue A PREENCHER. |

## Bancos do pacote
| Banco | Chaves | Telegrama (DB) | PUT / GET do 1515 | Competencia | Espelho |
|---|---|---|---|---|---|
| BC56 | 13 de 16 | DB3007 (24 B) | 10 / 14 | DB3008 (8 B) | DB3000 |
| BC400 | 13 de 16 | DB3107 | 10 / 14 | DB3108 | DB3100 |
| BC550 | 12 de 16 | DB3307 | 10 / 14 | DB3308 | DB3300 |
| **BC59,5** | **18 de 32** | **DB3207 (36 B)** | **14 / 22** | **DB3208** | **DB3200 (3 PUTs)** |

## Arquivos novos (BC59,5)
`tipos_ComBanco32_v0.2.scl`, `dbs_Banco595_v0.2.scl`, `fb_supervisaoChaves32_1200_v0.2.scl`, `fb_bancoCarga32_v0.2.scl`, `fc_chamadasBanco595_v0.2.scl`, `tags_IO_1200_BC595_A_PREENCHER_v0.2.csv`, `fb105_Com1200Espelho32_v0.2.scl`, `chamadas_1515_PUTGET_BC595_para_1200_v0.2.scl`.
Lado do 1515 (fora desta pasta): `plc/bt2/bancos_cargas/db3200_BC595_Chaves_v0.3.db`, `db3300_BC550_Chaves_v0.3.db`, `chamadas_BC595_v0.3.scl`, `chamadas_BC550_v0.3.scl`, `plc/bt2/comunicacao_et200/fb103_ComEt200_32_v0.3.scl`.

## Telegrama BC59,5 (36 bytes)
PEDIDO 14 B: cmd[32] X0.0 | vida1515 W4 | ligarBanco X6.0 | reserva B7 | habPed[32] X8.0 | seq W12.
RESPOSTA 22 B: fbk[32] X14.0 | vidaET W18 | seletoraAuto X20.0 | reserva B21 | habResp[32] X22.0 | eco W26 | falhaRetorno[32] X28.0 | contatorColado[32] X32.0.
Espelho do DB3200 (392 B, bytes 8..399): PUT1 8..143 (136 B), PUT2 144..271 (128 B), PUT3 272..399 (128 B). Um job por vez na conexao.

## Provado x nao provado
Provado (script `verifica_offsets_*`): offsets e tamanhos coerentes entre tipos, DBs, FB103 e chamadas; fluxos `chaves-550/595-api-v1.6` com teste (24/24; a v1.5 falha 20).
**Nao provado:** compilacao no TIA, ponteiros absolutos como VARIANT, tempos reais, comportamento no PLC e na bancada (carga de potencia DESACOPLADA).

## Ajuste v0.3 (09/11/2026)
Tensao de chaveamento SAIU do pacote (decisao do Reginaldo: futuro). DB de competencia continua com 8 B; o DBW2 virou `reservaW2` (ninguem le nem escreve). Arquivos `*_v0.3` (tipos, fb_bancoCarga16/32, fc_chamadas, tags) substituem os v0.1/v0.2 correspondentes.

## Ajuste v0.4 - DB_ANY (09/11/2026)
`fb_bancoCarga16_v0.4` e `fb_bancoCarga32_v0.4` recebem **so o numero do DB** (`DbCom`, `DbCompet` : DB_ANY) e tratam os campos por offset (PEEK/POKE) dentro. O PEDIDO e lido para um buffer no inicio do ciclo; so a faixa da RESPOSTA e escrita no fim (escritor unico). DB invalido (0) = nada liga. Chamadas: `fc_chamadasBancosCarga_v0.4`, `fc_chamadasBanco595_v0.4`. Logica, supervisao e 1515 nao mudaram.
**Nao provado:** nomes/parametros de PEEK/POKE e suporte na CPU (firmware nao confirmado) - conferir no TIA; reacao da CPU a DB inexistente.
