# PRM-003 · Sugerir chaves só com o cronômetro parado

- **Módulo:** medidor 1.10.222 em diante (card Patamar)
- **Quem revisa a promessa:** Reginaldo
- **Estado da promessa:** verificada em Demo (PLC simulado)

## A promessa
Com o cronômetro (INICIAR) contando, o botão **Sugerir chaves** está **desligado** (apagado e sem clique). Parado ou pausado, funciona. O botão **Aplicar** continua livre durante o ensaio.

## O que NÃO é prometido
- Que o operador não possa mexer nas chaves durante o ensaio: pode clicar nas chaves e usar o Aplicar.

## Verificado por
| Teste | Onde | O que prova |
|---|---|---|
| `patamar_sugerir_e_tracejado_10s.js` | `tests/e2e/` | botão desligado com o cronômetro contando, volta ao pausar, desliga de novo ao retomar |

## Se a promessa falhar
O botão aparece ligado durante o ensaio. Avisar e anotar a versão do medidor.

## Provado × não provado
- Provado: em Demo local.
- Não provado: na bancada com PLC real.
