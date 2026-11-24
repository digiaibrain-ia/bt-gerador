# DEC-006 · O Patamar liga só pelo Modo

- **Data:** 2026-11-17
- **Quem decidiu:** Reginaldo
- **Estado:** em uso
- **Versão onde vale:** medidor 1.10.221 em diante

## Contexto
Havia dois controles para ligar o Patamar Guiado: o card Modo (Salvamento) e um botão dentro do diálogo.

## Decisão
Um controle só: o do **Modo** (Salvamento › Por patamar). No diálogo e no cabeçalho fica só a sinalização "Patamar: On / Off".

## O que isso muda
O botão Ligar/Desligar Patamar saiu do diálogo. Para desligar, mude o Salvamento para Manual ou Auto. Três testes antigos que clicavam nesse botão passaram a ligar o Patamar pelo Modo.

## Como conferir
`tests/e2e/patamar_sugerir_e_tracejado_10s.js` (dialogo sem o botão); `central_exportar.js` e `mapa_fbs_no_medidor.js` adaptados.

## Provado × não provado
- Provado: em Demo (PLC simulado).
- Não provado: `tests/e2e/geradores_ideais.js` (adaptado, mas não rodado nesta rodada).
