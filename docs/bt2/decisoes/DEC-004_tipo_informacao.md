# DEC-004 · Novo tipo de ocorrência: Informação

- **Data:** 2026-11-18
- **Quem decidiu:** Reginaldo
- **Estado:** em uso
- **Versão onde vale:** medidor 1.10.226 em diante

## Contexto
O DSE sem cabo gerava alarme como se fosse perda de comunicação. Regra de ouro adotada: **todo alarme deve ter uma ação que o operador possa tomar**; o que não tem ação é Informação.

## Decisão
Criar o tipo **Informação (I)**, registrado junto com Alerta e Falha (diálogo e histórico, com filtro próprio). Não conta nos botões Alertas e Falhas nem no triângulo dos cards. DSE-001 "não conectado" (nunca visto) passa a ser Informação; "perdeu a conexão" continua Falha.

## O que isso muda
Código `I-...`; botão **Informações** no diálogo; glossário em ⓘ Legenda (alarme incômodo, inundação, repetido, permanente, fugaz, alarme campeão, relação sinal/ruído).

## Como conferir
`tests/e2e/alarme_informacao.js` (8 de 8).

## Provado × não provado
- Provado: o tipo, os contadores, o filtro e o glossário.
- Não provado: a troca do DSE-001 para Informação com o DSE real sem cabo (só na bancada).
