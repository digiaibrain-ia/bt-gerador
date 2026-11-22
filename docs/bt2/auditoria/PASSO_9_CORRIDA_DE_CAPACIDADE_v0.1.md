# Passo 9: corrida do limite de capacidade (reserva na saída da fila) · 20/11/2026

Origem: a segunda opinião do Gemini apontou que dois comandos de ligar quase simultâneos podem passar do limite. **Conferi na prática antes de concordar** e a corrida é real (inclusive dentro de um único banco).

## O problema (provado)
O nó C2 decidia **na entrada** do pedido, somando o que o PLC já tinha ligado (`Ligada` ou `CbLigar`). O comando que ainda estava em voo (aceito, esperando na fila ou sendo escrito) não entrava na conta. Duas requisições seguidas viam a mesma carga e as duas passavam.
Prova com Node-RED real e PLC simulado, modo `recusar`, `kw100` 20 kW (limite 22 kW), 3 chaves de 5 kW ligadas, dois `ligar` simultâneos (chaves 4 e 5):
| Versão | Resposta das duas | kW comandados |
|---|---|---|
| chaves-56 v3.9 (antes) | 200 e 200 (3 de 3 execuções) | **25 kW** (limite 22) |
| chaves-56 v3.10 (agora) | 200 e **409** | 20 kW |

## A correção
Versões novas (as anteriores ficam intactas): **chaves-56 v3.10, chaves-400 v3.9, chaves-550 v1.10, chaves-595 v1.10**, geradas por `nodered/gerador/gerar_capacidade_c2b_reserva_v0.1.py`.
1. **Nó novo "reserva de capacidade na saída da fila (C2)"**, entre o `revalida` e a escrita no PLC. Ali os pedidos já estão em fila única por banco e a leitura é fresca. Em modo `recusar` e só para LIGAR: total = carga comandada + **reservas ainda em voo** + outros bancos; acima do limite, responde **409 `LIMITE_EXCEDIDO`** pelo mesmo caminho de resposta dos outros erros e o PLC não recebe nada. Aceito: grava a reserva e publica na hora o kW do banco.
2. **Cache ao vivo** passa a publicar em `bt2_kw_<id>` a carga comandada **mais as reservas vivas**, então um banco enxerga a reserva do outro imediatamente (antes havia até 200 ms de atraso).
3. A reserva some quando o PLC mostra a chave ligada (`Ligada` ou `CbLigar`) ou depois de **5 s**.
4. O nó de entrada (C2) continua **idêntico** (recusa cedo, sem reservar). Modo `registrar` (padrão): nada muda, nada é reservado. Desligar nunca é recusado. Erro no nó novo: o comando segue (fail-open). Sem `kw100` conhecido: nunca recusa.
Por que é atômico: um nó de função do Node-RED roda inteiro, de forma síncrona, numa única thread. A leitura das reservas, a decisão e a gravação da nova reserva acontecem sem outro pedido no meio, inclusive entre bancos.

## Provas
| Prova | Resultado |
|---|---|
| Integração `fase4/z_capacidade_corrida.test.js` (estrutura nos 4 bancos, mesmo banco com 2 e com 3 simultâneos, 56 × 400 simultâneos, 4 chaves em sequência rápida sem falso bloqueio, `registrar`, desligar) | **9 de 9** |
| **Contra-prova:** o mesmo teste com as versões sem reserva (`BT2_C2B_FLUXO56=chaves-56-api-v3.9 BT2_C2B_FLUXO400=chaves-400-api-v3.8`) | **falha** nos testes da corrida (mesmo banco e entre bancos), como deve |
| Propriedades `tests/propriedades/capacidade_reserva.prop.test.js` (código real do nó em `vm`): com o PLC "congelado" a carga aceita nunca passa do limite; desligar nunca recusa; `registrar` não recusa nem reserva; reserva refletida não conta duas vezes; vence em 5 s; kW publicado inclui a reserva | **14 de 14** (contra-prova com o nó de entrada: 7 dos 8 testes iniciais falham) |
| Mutação (Stryker) do nó novo | **74,5 % → 92,2 %**; 18 sobreviventes, todos equivalentes (12 são o `PADRAO` embutido, fallbacks de lista e `>=` mascarado pela tolerância de 1e-9) |
| Equivalência: unitários, build, propriedades e a bateria de integração inteira (56 arquivos) rodando contra os fluxos novos no lugar dos antigos (`BT2_FLUXO_TROCA`) | unitários e propriedades **284 de 284**; integração **398 passam, 0 falham, 5 `todo`** (os mesmos 5). Numa execução, `concorrencia/c2_caracterizacao` falhou uma vez por tempo (um 504 num teste com escrita atrasada de propósito) e depois passou **6 de 6** sozinho (3 com os fluxos novos e 3 com os antigos): instabilidade de tempo, não regressão. O e2e não foi repetido: o medidor (1.10.231) não mudou |

## O que não está provado e riscos que ficam
- **Tempos reais:** a reserva vale 5 s. Na bancada, medir quanto leva do POST até o PLC mostrar a chave ligada (`cbLigar`). Se passar de 5 s sob carga, a janela reabre. O valor é uma constante no nó (`RESV_MS`).
- **Comando que falha depois de aceito** (erro de escrita, timeout) deixa a reserva viva até 5 s: o efeito é conservador (pode recusar, de forma falsa, uma nova tentativa feita logo depois e perto do limite).
- **Bancos sem fluxo carregado** não entram na soma (igual a antes).
- O PLC continua sem limitar capacidade (BK-AUD-04). O limite vale no medidor e no Node-RED.
- Só vale em modo `recusar`, que continua desligado por padrão até a bancada.
