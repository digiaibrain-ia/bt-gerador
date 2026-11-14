# Checklist de bancada - Fase 4 (v0.2) - 06/11/2026
Execucao: Engenharia de Automacao (Reginaldo) [+ TI se houver rede/PM2]. **CARGA DE POTENCIA DESACOPLADA** (disjuntores/contatores de potencia abertos, sinalizacao de seguranca ativa) em todos os itens abaixo. Preencha e devolva (ou use a Central de registros para gerar o RESUMO.md).
Dados: data ____ / quem ____ / firmware 1515 ____ / firmware PLC do banco ____ / versao Node-RED ____ / commit do pacote ____

## 0. Seguranca e estado seguro
| # | Verificar | OK? |
|---|---|---|
| 0.1 | Carga de potencia desacoplada e sinalizada | |
| 0.2 | Backup do TIA (1515 e PLC do banco) e do Node-RED feito | |
| 0.3 | Ventilador do banco: ligado/ciente de que NAO e monitorado hoje (BANC-1) | |

## 1. PLC / comunicacao
| # | Verificar | Esperado | OK? |
|---|---|---|---|
| 1.1 | Deslocamentos do DB de chaves no TIA | `sbRet` em X464.0..X470.0; `cbBanco` X460.0 | |
| 1.2 | DB38/39 (ET200) 24 bytes; PUT BYTE 10 / GET BYTE 14 | sem erro nos StatusPut/StatusGet | |
| 1.3 | `ComOk`, `RespEcoOk` e `vidaET` | TRUE / TRUE / mudando | |

## 2. Regra do SB/CB (T = 2 s) - Portao A
| # | Teste | Esperado | OK? |
|---|---|---|---|
| B1 | Bloquear o SB de uma chave e ligar | falha em ~2 s (2,0 a 2,1 s); CB cai; saida cai | |
| B2 | Liberar o SB | a chave **NAO liga sozinha** | |
| B3 | Novo clique na chave | liga (rearme) | |
| B4 | Simular contator colado (SB=1 sem comando) | `contatorColado`; chave bloqueada; clique recusado | |
| B5 | Desabilitar uma chave | `habResp` cai; nao energiza | |
| B6 | Tirar o cabo de rede | saidas caem; falha trava | |
| B7 | Religar a rede com o CB ainda em 1 | **nao religa sozinha** | |
| B8 | Medidor mostra CHV-007/CHV-008 e some quando o PLC limpa | triangulo pulsa; roteiro abre | |

## 3. Medidor 1.10.172
| # | Verificar | Esperado | OK? |
|---|---|---|---|
| 3.1 | Clique na chave com o Patamar manual esperando o Aplicar | aviso "so edita a sugestao" | |
| 3.2 | Chave "em envio" (segundo clique rapido) | aviso "ainda em envio"; solta em ate 12 s | |
| 3.3 | Setup: confirmar Dados do ensaio com 380 V | chaveamento 380 V informado ao PLC sozinho; botoes somente leitura | |
| 3.4 | Setup: Dados com 208 V ou 480 V | so sinaliza; nao grava; Setup nao salva (anotar o que o operador quer) | |
| 3.5 | DSE desconectado (cabo/IP da placa 2) | DSE-001 diz "API no ar, Modbus do DSE nao conecta" com o status | |
| 3.6 | Alertas e Falhas: "▸ Roteiro" e "ⓘ Legenda" | Efeito/Causa/Solucao; legenda com os codigos. **Validar o texto do roteiro** | |
| 3.7 | "🗂 Registros": escolher pasta, salvar | pasta `BT2_registros/ensaio_.../` com subpastas + RESUMO.md + AGRUPADO.md; reabrir o navegador e ver se pede para liberar | |
| 3.8 | Fim do ensaio | a tela PERGUNTA; nada grava sozinho | |
| 3.9 | Cards x flow (so desenvolvedor) abre por cima do Demo | sim | |

## 4. Pendente de decisao (anotar)
- Tensao 208/480 V: ____ (bloquear, liberar ou chaveamento proprio)
- Resistencia que o programador do 1200 quer para a IHM: do chaveamento atual ou por tensao ____
- Sinais do DB de competencia do banco (ventilador, protecoes, liberacao): ____

## 5. Go / no-go
GO se 0 e 1 OK, B1 a B7 OK e 3.1 a 3.3 OK. NO-GO e rollback se alguma chave energizar sem comando, religar sozinha (B2/B7), ou o `ComOk` oscilar sem causa. Registrar tudo como `todo` com ID e gravidade.
