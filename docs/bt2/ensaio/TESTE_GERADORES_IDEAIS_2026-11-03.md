# Teste automático no Demo — 5 geradores ideais, Patamar Auto (medidor 1.10.160, 03/11/2026)

Robô: `tests/e2e/geradores_ideais.js` (Playwright, Chromium). Resultado bruto: `tests/e2e/resultado_geradores_ideais.jsonl`.
Cenário: Demo local, simulação Auto a 10×, 4 bancos marcados (`?novos=1`), modelo escolhido pelo catálogo (.csv), todos os patamares em **Auto**, **Patamar: On**, ensaio completo de 6 etapas (0, 30, 50, 100, 107, 0 %), SALVAR em cada etapa. Gerador ideal (SIDSE), sem falhas. Limite de capacidade 110 % e excesso do modo mínimo 2 % (padrões do medidor).

Critérios por etapa: (1) o kW que a FB mãe escolheu bate com o módulo de sugestão (±0,5 kW); (2) o kW comandado não passa do limite; (3) kW confirmado = comandado (±0,5 kW).

| Gerador | kW a 100 % | Etapas | Falhas | Ensaio concluiu |
|---|---|---|---|---|
| MWM 40 kVA | 29,1 | 30 % 8,5 · 50 % 14,5 · 100 % 29 · 107 % 31,5 | 0 | sim |
| MWM 150 kVA | 109,1 | 32,5 · 54,5 · 109 · 117 | 0 | sim |
| SCA 500 kVA | 363,6 | 109 · 181,5 · 363,5 · 389,5 | 0 | sim |
| SCA 800 kVA | 581,8 | 174,5 · 290,5 · 581,5 · 623 | 0 | sim |
| 8660 1250 kVA | 909,1 | 272,5 · 454,5 · 909 · 973 | 0 | sim |

Erros de JavaScript durante as 5 rodadas: nenhum.

## O que este teste NÃO prova
- O "esperado" vem do mesmo módulo de sugestão que o medidor usa: confirma a **integração** (tela → FB mãe → comando → confirmação) e os limites, não a correção do cálculo (essa é coberta por `tests/fb`, com oráculo de força bruta).
- O kW "confirmado" vem do simulador ideal; num gerador real haverá ruído e atraso.
- Não conferi **quais bancos** entraram em cada patamar (a contagem de chaves comandadas pelos blocos na tela não foi lida: ficou 0 no robô). Os totais batem, mas a distribuição por banco não foi verificada.
- Sem falhas injetadas, sem PLC, sem Manual.
