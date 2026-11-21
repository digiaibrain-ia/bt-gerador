# DEC-007 · Falha de API repetida vira um registro só no log

- **Data:** 2026-11-18
- **Quem decidiu:** Reginaldo
- **Estado:** em uso
- **Versão onde vale:** medidor 1.10.225 em diante

## Contexto
Com o DSE sem cabo, o medidor consulta o Node-RED a cada ciclo e recebe 503. No log da bancada: 4.234 eventos iguais (56,5 %), empurrando para fora o que importa (buffer de 5.000 eventos).

## Decisão
A consulta do DSE **continua normal**. Só o **registro** muda: a 1ª falha entra inteira; repetições iguais (mesmo card e mesma ação, a cada menos de 30 s) só contam; a cada 60 s entra **um** resumo com contador, primeira e última ocorrência. Sucesso, outra rota ou outro status = evento normal e a série recomeça.

## Por quê
Melhorar a relação sinal/ruído sem jogar sinal fora.

## Como conferir
`tests/e2e/log_falha_repetida.js` (5 de 5).

## Provado × não provado
- Provado: em Demo (PLC simulado).
- Não provado: no PC BT2 com o DSE sem cabo, durante um ensaio longo.
