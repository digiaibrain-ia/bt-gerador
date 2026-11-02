# Manifesto: blocos do PLC 1515 (BT2) x arquivos do repositório

Fonte: prints do TIA Portal (Program blocks e External source files) enviados em 02/11/2026.
Regra: o que está no PLC hoje é a verdade. Nada foi renumerado nesta etapa (renumeração para a faixa v4 vem depois, ver `docs/PLANO_NUMERACAO_BLOCOS_PLC_v4_rascunho.csv`).

## Blocos no PLC (Program blocks)

| Bloco no PLC | Tipo | Fonte no repositório | Situação |
|---|---|---|---|
| OB1 Main | OB | (nenhuma) | FALTA exportar |
| FC100 fc100_cardBancoCargas_BT2 | FC | (nenhuma) | FALTA exportar |
| FB100 fb100_setupChaves | FB | `plc/bancos_cargas/fb100_setupChaves_v0.3.scl` + `exemplo_chamada_fb100_v0.3.scl` | OK (v0.3) |
| FB101 fb101_ComEt200 | FB | `plc/comunicacao_et200/fb101_ComEt200_v0.7.scl` + `fb101_ComEt200_chamadas_v0.7.scl` | OK (v0.7) |
| DB20 db20_exemploStruct | DB | (nenhuma; citado como padrão nos cabeçalhos) | FALTA exportar (só exemplo) |
| DB52 db52_BancoTeste2_DSE | DB | (nenhuma; só os endereços em `plc/variaveis/s7endpoint_PLC_1515F_DB52.csv`) | FALTA exportar `db52_BancoTeste2_DSE.db` |
| DB53 db53_BancoTeste2_SNAP_MANUAL | DB | `plc/bancos_cargas/db53_BancoTeste2_SNAP_MANUAL-v0.1.db` | OK (v0.1) |
| DB150 db150_BC56_Chaves | DB | `plc/bancos_cargas/db150_BC56_Chaves_v0.3.db` | OK (v0.3) |
| DB152 db152_BC56_SetupPorTensao | DB | `plc/bancos_cargas/db152_BC56_SetupPorTensao_v0.2.db` | OK (v0.2) |
| DB154 db154_BC56_SetupChaves | DB instância FB100 | gerado pelo TIA a partir do FB100 | sem fonte (normal) |
| DB155i db155i_BC56_ComEt200 | DB instância FB101 | gerado pelo TIA | sem fonte (normal) |
| DB158 db158_BC400_Chaves | DB | `plc/bancos_cargas/db158_BC400_Chaves_v0.3.db` | OK (v0.3) |
| DB160 db160_BC400_SetupPorTensao | DB | `plc/bancos_cargas/db160_BC400_SetupPorTensao_v0.2.db` | OK (v0.2) |
| DB162 db162_BC400_SetupChaves | DB instância FB100 | gerado pelo TIA | sem fonte (normal) |
| DB163i db163i_BC400_ComEt200 | DB instância FB101 | gerado pelo TIA | sem fonte (normal) |
| OB123 FOB_RTG1, FB1 Main_Safety_RTG1, DB1 | Safety | fora deste repositório | fora do escopo |

## Arquivos do repositório que NÃO estão no PLC

| Arquivo | Observação |
|---|---|
| `plc/comunicacao_et200/db38_db39_ComEt200_v0.3.scl` | versão antiga do desenho da comunicação |
| `plc/comunicacao_et200/fb_watchdogComEt200_RASCUNHO_v0.1.scl` | rascunho |
| `plc/comunicacao_et200/fc_vidaET_v0.1.scl` | não aparece no PLC |
| `plc/arquivo/*` | versões antigas (v0.2 de DB150/DB158, v0.6 de FB101), guardadas |

## Pendências para a migração

1. Exportar do TIA como fonte externa: OB1, FC100, DB52 (`db52_BancoTeste2_DSE.db`, já existe no TIA como fonte externa) e DB20.
2. Definir a ordem: BT2 primeiro, depois BT1 (decisão de 01/11/2026).
3. Renumerar para as faixas v4 só depois de fechar o inventário acima.

## Lote de 02/11/2026 (conferido, já no repositório)

| Arquivo recebido | Onde está no repositório | Situação |
|---|---|---|
| `grafico_ensaio_v0.10.html` | `dashboard/ferramentas/` | igual |
| `gerenciador_logs_v1.6.html` | `dashboard/ferramentas/` | igual |
| `api_cards_visor_v0.3.html` | `dashboard/ferramentas/` | igual |
| `amostras_simulador_v0.6.html` | `dashboard/ferramentas/` | igual |
| `fc_vidaET_v0.1.scl` | `plc/comunicacao_et200/` | igual (roda no ET200, não na 1515) |

Pendente de análise: nenhum dos cinco foi analisado nesta etapa, só conferido e guardado.

## Lote de 02/11/2026 (2º lote, conferido)

| Arquivo recebido | Onde está no repositório | Situação |
|---|---|---|
| `fb101_ComEt200_v0.6.scl` | `plc/arquivo/` | igual (versão antiga, guardada) |
| `fb101_ComEt200_chamadas_v0.6.scl` | `plc/arquivo/` | igual (versão antiga, guardada) |
| `db38_db39_ComEt200_v0.3.scl` | `plc/comunicacao_et200/` | igual |
| `catalogo_dse_v0.1.py` | `catalogo/` | igual |
| `RODIZIO_CHAVES_v0.1.md` | `docs/RODIZIO_CHAVES_v0.1.md` | novo (guardado agora) |

Pendente de análise: nenhum destes foi analisado nesta etapa.
Atenção: as chamadas v0.6 mapeiam DB155 → DB38 → db150 e DB163 → DB39 → db158. A v0.6 do FB101 comenta que o nome "BC400" da instância DB155 está trocado. Guardado para a análise, sem corrigir.
