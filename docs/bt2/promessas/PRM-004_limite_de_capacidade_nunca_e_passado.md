# PRM-004 · O limite de capacidade nunca é passado, nem com comandos simultâneos

- **Módulo:** nós C2 (limite de entrada) e C2b (reserva na saída da fila) dos fluxos `chaves-56-api-v3.10`, `chaves-400-api-v3.9`, `chaves-550-api-v1.10` e `chaves-595-api-v1.10` (Node-RED)
- **Quem revisa a promessa:** Reginaldo
- **Estado da promessa:** verificada em PLC simulado · **não validada na bancada**

## A promessa
Em modo `recusar`, a carga **aceita** nunca passa de **110 % do kW a 100 % do gerador** ([DEC-008](../decisoes/DEC-008_limite_unico_110_por_gerador.md)), mesmo quando dois comandos de ligar chegam quase ao mesmo tempo, no mesmo banco ou em bancos diferentes. O que passar do limite volta **409 `LIMITE_EXCEDIDO`** e **não chega ao PLC**. O Node-RED reserva o kW de cada chave aceita até o PLC mostrar a chave ligada (ou 5 s), e os outros bancos enxergam a reserva na hora.
Vale sempre: **desligar nunca é recusado**; sem kW a 100 % conhecido nada é recusado; modo `registrar` (padrão, [DEC-009](../decisoes/DEC-009_modo_recusar_um_so_depois_da_bancada.md)) não recusa e não reserva; erro interno deixa o comando seguir (fail-open).

## O que NÃO é prometido
- Que o PLC respeite o mesmo limite (BK-AUD-04): hoje limitam o medidor e o Node-RED.
- Que o tempo real entre o POST e a chave aparecer ligada seja menor que 5 s. Se passar, a janela da corrida reabre. **Medir na bancada** (item A7 do checklist).
- Que um comando que falha depois de aceito não deixe a reserva por até 5 s (pode recusar, de forma falsa, uma nova tentativa logo em seguida e perto do limite).

## Verificado por
| Teste | Onde | O que prova |
|---|---|---|
| `z_capacidade_corrida.test.js` | `tests/integracao/fase4/` | dois LIGAR simultâneos (mesmo banco e 56 × 400): só um passa; sem falso bloqueio; contra-prova nas versões sem a reserva |
| `capacidade_reserva.prop.test.js` | `tests/propriedades/` | com o PLC "congelado", a carga aceita nunca passa do limite (mutação 92,2 %) |
| `capacidade_c2.prop.test.js` | `tests/propriedades/` | o nó de entrada contra uma regra escrita à parte (mutação 92,9 %) |

## Se a promessa falhar
O medidor mostra o erro 409 com o motivo, ou o comando passa quando não devia (aí é a corrida). Voltar o modo para `registrar` e reiniciar o Node-RED; os detalhes estão em [Passo 9](../auditoria/PASSO_9_CORRIDA_DE_CAPACIDADE_v0.1.md).

## Provado × não provado
- Provado: a corrida (antes 25 kW com limite de 22; agora 20 kW) e as regras acima, em PLC simulado.
- Não provado (depende da bancada): tempos reais do PLC e do ET200, e o kW a 100 % real de cada gerador.
