# Passo 6: debounce de alarmes e log limpo do Node-RED (medidor 1.10.231) · 19/11/2026

Autorizado pelo Reginaldo (19/11/2026) e decidido por critério técnico. Nenhum comando mudou; nada foi implantado.

## 6.1 Alarmes: debounce (10 s) e histerese (5 s) por criticidade
**Problema (bancada de 17/11):** 45 de 88 ciclos "ativou → normalizou" duraram menos de 10 s (CHV-005: 14, COM-001: 10, CHV-006: 7, DSE-001: 7, CHV-001: 5), sobretudo na troca de modo.
**Regra (medidor 1.10.231, módulo `36_ocorrencias_e_alarmes`):**
| Categoria | Códigos | Entrada | Saída |
|---|---|---|---|
| **Comunicação e disponibilidade** | COM-001, COM-002, COM-003, COM-005, DSE-001, DSE-002, CHV-005, CHV-006 | a causa precisa **durar 10 s** | **5 s** normal antes de normalizar |
| **Segurança e ação do operador (tempo real)** | CHV-007 (sem retorno), CHV-008 (contator colado), CHV-001, CHV-004, CHV-009, CHV-002, ENS-001/002/003, SIS-001, alarmes e proteções do DSE | imediato | imediato |
Uma causa que some antes dos 10 s **nunca aparece** (conta em `OCOR.fugazes()`); se a causa volta durante os 5 s da saída, o alarme não pisca. `window.OCOR_DEBOUNCE_ESCALA = 0` desliga (só diagnóstico). **Os tempos são ASSUMIDOS** (10 s e 5 s): a Engenharia confirma por categoria; estão em uma tabela (`DEB_S`/`HIS_S`).
**Impacto para o operador:** alarmes de comunicação aparecem até 10 s depois e saem até 5 s depois; os de segurança não mudam.
**Testes:** `fase4/x_alarme_debounce` (6, tempo real; contra-prova na 1.10.230 falha). Quatro roteiros que supunham alarme instantâneo foram ajustados: `c_medidor_troubleshooter` (C7 espera até 20 s pelo COM-005) e os e2e `alarme_inteligente` e `alarme_banco_silenciado`, que provam a lógica de causa-raiz e passaram a rodar com o debounce desligado (o tempo é provado no teste próprio).

## 6.2 Logs do Node-RED
Revisados os `node.warn/log/error` dos fluxos atuais. **Única fonte real de ruído:** no fluxo do DSE, `decodifica blocos` avisava "bloco X incompleto ou desconhecido" a cada resposta de cada bloco, a cada segundo (até 13 linhas por segundo com o DSE falhando). Corrigido em **`servidor-deepsea-api-gerador-v3_8`** (gerador `gerar_logs_limpos_v0.1.py`): 1 aviso por bloco a cada 5 min, com o total de falhas; a contagem de falhas e a resposta não mudam. Teste `fase4/y_logs_limpos` (o código real do nó, 100 respostas incompletas = 1 aviso; contra-prova na v3_7 falha).
**Revisados e mantidos (com motivo):** guarda D3 "bloqueado" (evento de segurança: deve aparecer); "vigia HTML sumiu" e "fila: liberando trava" (já têm intervalo mínimo); avisos de capacidade (já limitados); "capacidade: config carregada" (1 vez ao subir). Não há `INFO` repetido em laço nos fluxos de chaves, registro e dev-logs. O nó de debug "alerta DSE (queda/volta)" só escreve na barra lateral, em transição.

## Limites
Os tempos de debounce são hipótese; não houve teste na bancada. O log do medidor no navegador (DEV.OBS/Central de registros) já agrupa falha repetida (1.10.225).
