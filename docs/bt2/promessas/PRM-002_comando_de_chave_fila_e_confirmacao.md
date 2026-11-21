# PRM-002 · Comando de chave passa pela fila e pela confirmação

- **Módulo:** fluxos `chaves-56-api-v3.7` e `chaves-400-api-v3.6` (Node-RED)
- **Quem revisa a promessa:** Reginaldo
- **Estado da promessa:** verificada em PLC simulado · parcialmente validada na bancada

## A promessa
Cada comando de chave vindo do medidor entra numa **fila** (um por vez) e é **revalidado ao sair**. Só é dado como feito se o PLC **confirmar** (eco do número do pacote, `seq`) em até **2 s**. Sem confirmação, o fluxo responde **504** ("incerto: confira o estado antes de repetir") e a variável fica em **quarentena** (resposta 503) por cerca de 4 s. O "Desligar banco" tem prioridade e cancela os "ligar" pendentes (409).

## O que NÃO é prometido
- Que o PLC confirme **dentro** de 2 s. Em 17/11 houve 6 respostas 504 em 5 chaves do BC56 e 1 no "Ligar banco" (ver BK-PLC-03 no backlog).
- Login: a guarda confere origem e JSON, não identidade (BK-AUD-05).

## Verificado por
| Teste | Onde | O que prova |
|---|---|---|
| `f2_comando_chaves.test.js` | `tests/integracao/` | habilitar, ligar e desligar com as travas |
| `f6_fila_gravacao.test.js` | `tests/integracao/` | comandos simultâneos, repetição e recuperação de erro |
| Bancada de 16/11 | PC BT2 | handshake seq/eco e o `RespEcoOk` ligado ao DB3000 |

## Se a promessa falhar
O medidor mostra "Não consegui ligar" (CHV-001) com o motivo (504 ou 503). Conferir o estado da chave antes de repetir.

## Provado × não provado
- Provado: a lógica da fila e da confirmação, em PLC simulado; o handshake na bancada do ET200.
- Não provado: a 1200 e a latência real do PLC em ensaio longo.
