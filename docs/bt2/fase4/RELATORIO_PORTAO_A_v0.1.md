# Relatorio do Portao A (Fase 4) - v0.1 - 06/11/2026
Regra decidida pelo Reginaldo: **SB some -> CB cai, T = 2 s, falha travada, rearme so por novo comando.** Pedido/resposta no DB das chaves.

## O que foi entregue (arquivos NOVOS; nada de producao foi sobrescrito)
| Parte | Arquivos | Estado |
|---|---|---|
| A0/A1 PLC | `plc/bt2/comunicacao_et200/fb_supervisaoChaves16_v0.1.scl`, `db38_db39_ComEt200_v0.4.scl`, `fb101_ComEt200_v0.8.scl`; `plc/bt2/bancos_cargas/db3000_BC56_Chaves_v0.3.db`, `db3100_BC400_Chaves_v0.3.db`, `chamadas_BC56_v0.3.scl`, `chamadas_BC400_v0.3.scl` | **Rascunho. Nao compilado no TIA, nao testado no PLC.** |
| A4 modelo | `tests/plc_modelo/` (14 vetores em JS) | 14/14 passam; mutantes falham |
| A2 fluxos | `nodered/flows/bt2/chaves-56-api-v3.5.json`, `chaves-400-api-v3.5.json` (gerador `nodered/gerador/gerar_fluxos_fase4a_v0.1.py`) | 24/24 testes passam; 21/24 falham na v3.4 |
| A3 medidor | `dashboard/ferramentas/medidor_gerador_v1.10.168.html` (gerador `dashboard/gerador/gerar_medidor_v1.10.168_v0.1.py`); `catalogo_ferramentas_v0.7.js` aponta para a 168 | 5/5 testes de front passam; 4/5 falham na 167 |

## Suite completa (06/11/2026)
219 testes: **214 passam, 0 falham, 5 `todo`** (F2-1, P3-E2 e os achados F4-1, F4-2, P3-E1 que seguem `todo` nos testes das versoes ANTIGAS v3.4, mantidas de proposito; na v3.5 os tres ja passam em `fase4/a2_sbret.test.js`). Os testes de front (f10, f11, s1, s3) passam contra o medidor 1.10.168.

## O que mudou no comportamento
- Fluxos v3.5: leem `sbRet` (habResp, falhaRetorno, contatorColado, respEcoOk) e devolvem no GET (campos novos, aditivos).
- `ligar`: 409 `CONTATOR_COLADO`, 409 `SEM_ECO`, 409 `HAB_NAO_CONFIRMADA`. Falha de retorno travada **nao** recusa: o novo comando e o rearme.
- `habilitar`: 200 so depois de o PLC do banco confirmar (`habConfirmadaBanco:true`); sem comunicacao com o banco responde 200 com `habConfirmadaBanco:false`; sem confirmacao na janela, 504 `incerto`.
- F4-1: `/tensao` recusa com 503 antes de escrever se a leitura tiver mais de 2,5 s. F4-2: leitura de volta que nao confere vira 504 `incerto` (nao 500).
- P3-E1: comando que nao e de seguranca e recusado na entrada (503 `LEITURA_VELHA`) e tambem na saida da fila. Desligar chave, desligar banco e desselecionar passam sempre.
- Medidor 1.10.168: falhas `CHV-007` (sem retorno) e `CHV-008` (contator colado) por chave; aviso de rearme ao clicar numa chave em falha.
- **F2-1 nao e corrigivel no fluxo** (o no `http in` responde 500 fixo a JSON invalido). Continua `todo`.

## O que NAO foi provado (depende da bancada, com carga de potencia DESACOPLADA)
- O SCL compilado e rodando (S7-300 do ET200 e, depois, S7-1200); o tempo real do contator; o PUT/GET com o layout de 10+14 bytes; os deslocamentos dos DBs (conferir no TIA).
- O "PLC do banco" dos testes de fluxo e um respondedor simulado em JS: prova o fluxo e a tela, nao o ET200.
- A precisao da falha e de +100 ms (ticks de 100 ms): com T = 2 s sai entre 2,0 e 2,1 s no modelo.

## Acoplamento (o PLC e o Node-RED mudam juntos)
- **Fluxo v3.5 so entra com o PLC ja carregado com os DBs v0.3** (`sbRet` em X464.0). Com o DB antigo a leitura falha e o medidor mostra banco sem leitura.
- **PLC novo com fluxo antigo (v3.4):** funciona, mas sem as regras novas no `ligar`/`habilitar`.
- Ordem: 1) backup do TIA e do Node-RED; 2) ET200: DB38/39 v0.4, FB de supervisao, driver `Cmd AND Permite`; 3) 1515: DBs v0.3, FB101 v0.8 e chamadas (inclusive no `fc_chamadasBancos_BT2`); 4) importar `chaves-56/400 v3.5` (uma aba por vez); 5) medidor 1.10.168 e catalogo em `public/html`.
- **Rollback:** recarregar o backup do TIA e reimportar `chaves-56/400 v3.4`; voltar o medidor para a 167 e o catalogo.

## Checklist de bancada (carga DESACOPLADA)
B1 SB bloqueado -> falha em ~2 s e CB cai; B2 liberar o SB -> a chave NAO liga; B3 novo clique -> liga; B4 contator colado simulado; B5 desabilitar chave -> `habResp` cai; B6 cabo de rede fora -> saidas caem e a falha trava; B7 volta da rede sem religar; B8 medidor mostra CHV-007/CHV-008 e some quando o PLC limpa.

## Pendente
- Etapas 2 e 3 (BC550/BC595) com `sbRet` e versoes novas `chaves-550/595`.
- O FC4 do ET200 nao esta no repositorio: a troca para `Cmd AND Permite` e feita por voce no TIA.
- Portao B (clique travado, com o aviso no medidor), Portao C, Portao D, F/G.
