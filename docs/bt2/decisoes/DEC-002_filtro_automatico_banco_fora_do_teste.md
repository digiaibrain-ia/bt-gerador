# DEC-002 · Filtro automático de alarme de banco fora do teste

- **Data:** 2026-11-17 (pedido) · 2026-11-18 (mantido)
- **Quem decidiu:** Reginaldo
- **Estado:** em uso
- **Versão onde vale:** medidor 1.10.224 em diante

## Contexto
O teste foi só com o BC56. Com a seletora do BC400 em Manual, o alarme CHV-005 ("banco bloqueado pelo PLC") ficava ativo sem utilidade. No histórico, CHV-005 foi o campeão de ativações (55 de 154) e CHV-006 (banco sem leitura) somou 27.

## Decisão
CHV-005 e CHV-006 de um banco **não selecionado em Detalhes do Patamar e parado** (nenhuma chave ligada, nenhum comando pendente) deixam de ser criados. Se já estavam ativos, são limpos. Banco selecionado, ou com chave ligada, continua alarmando.

## Por quê
Alarme sem ação possível é ruído. A regra é automática (não é botão do operador) e em caso de dúvida **não** silencia.

## O que isso muda
Mantidos de propósito: CHV-003 (Demo + PLC), COM-001/002/005 (infraestrutura), DSE-001 e CHV-001 (comando não executado).

## Como conferir
`tests/e2e/alarme_banco_silenciado.js` (6 de 6).

## Provado × não provado
- Provado: em Demo local (PLC simulado).
- Não provado: no PC BT2 com bancos reais.
