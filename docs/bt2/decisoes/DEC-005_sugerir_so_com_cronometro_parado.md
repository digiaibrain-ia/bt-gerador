# DEC-005 · Sugerir chaves só com o cronômetro parado

- **Data:** 2026-11-17
- **Quem decidiu:** Reginaldo
- **Estado:** em uso
- **Versão onde vale:** medidor 1.10.222 em diante (a 1.10.221 só avisava ao clicar)

## Contexto
No teste do Patamar com PLC + SIDSE, Sugerir chaves e Aplicar entravam em conflito com o Patamar guiado durante o ensaio.

## Decisão
O botão **Sugerir chaves** fica **desligado** (apagado, sem clique, com dica) enquanto o cronômetro (INICIAR) está contando. Parado ou pausado, funciona. O **Aplicar continua livre**, para o operador poder desmarcar e marcar chaves.

## O que isso muda
Ver a promessa [PRM-003](../promessas/PRM-003_sugerir_so_com_cronometro_parado.md).

## Como conferir
`tests/e2e/patamar_sugerir_e_tracejado_10s.js` (7 de 7).

## Provado × não provado
- Provado: em Demo (PLC simulado).
- Não provado: na bancada com o PLC real depois da 1.10.222.
