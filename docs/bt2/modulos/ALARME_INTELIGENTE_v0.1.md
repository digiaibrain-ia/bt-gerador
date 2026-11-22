# Alarme inteligente (medidor 1.10.212, 15/11/2026)

**Pedido (Reginaldo):** "da pra tratar esses alarmes falsos? Monitoramento somente quando for necessario."
**Origem do alarme falso:** BK-DEMO-01 — no Demo local, o CHV-006 ("banco sem leitura do PLC") acendia em BC56 e BC400 sem haver PLC para ler.

## Regras (em `varre()`, 1x por segundo)
| Regra | O que faz |
|---|---|
| **Contexto** | Demo local (nada vai ao PLC) = sem COM-001, COM-002 nem CHV-006. A linha "Monitorando" diz isso. |
| **Escopo** | Banco so entra no alarme se estiver **em uso**: selecionado em Detalhes do Patamar, ligado, ou com alguma chave ligada. Banco recem-selecionado espera 4 s pela 1a leitura (nao pisca). |
| **Leitura** | Banco fora de uso e lido a cada 3 s (em uso: a cada 1 s). O limite de "leitura valida" e 5 s, entao o "?" nao aparece. |
| **Causa-raiz** | Node-RED fora da rede = **1 alarme COM-002** com "afeta tambem: bancos em uso e o registro do ensaio". COM-001 (PLC do banco) e CHV-006 e COM-003 sao dependentes e nao aparecem junto. COM-001 cobre o CHV-006 do mesmo banco. |
| **Seguranca** | CHV-005, CHV-007, CHV-008 e COM-005 **nao mudam**. Se o medidor nao conseguir decidir se o banco esta em uso, trata como em uso. |
| **Linha "Monitorando"** | No topo da janela Alertas e Falhas: o que esta sendo vigiado agora (PLC por banco em uso, DSE real/simulado, registro real/simulado). |

## Provado (Chromium, servidor simulado) — `tests/e2e/alarme_inteligente.js` (30 verificacoes, desktop e celular)
Demo local sem alarme de PLC; servidor fora = 1 causa; PLC fora com bancos em uso = 1 COM-001 por banco; nenhum banco em uso = sem alarme; 4 s de espera; erro ao decidir = em uso; CHV-005 nunca suprimido. **Contra a 1.10.211 o teste falha** (CHV-006 no Demo).

## Limites
- O DSE-001 continua independente (o endereco do DSE pode ser outro servidor).
- Nao foi provado com PLC real; a bancada deve conferir que desligar a rede do PLC acende COM-001 so no banco em uso.
- O teste `central_exportar.js` dependia do alarme falso; agora cria as proprias ocorrencias (CHV-001).
