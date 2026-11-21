# Contrato HTTP do comando em lote das chaves · POST /api/chaves/{banco}/lote · v0.1 · 21/11/2026

Estado: **implementado e provado em PLC simulado** (fluxos chaves-56 v3.12, chaves-400 v3.11, chaves-550 v1.12, chaves-595 v1.12). **Nada validado na bancada.** O medidor ainda **não usa** esta rota (ver "Como o medidor vai usar").

## Para que serve
Um degrau do Patamar liga e desliga várias chaves ao mesmo tempo. Com um comando por chave, cada um espera a sua vez na fila e a leitura de volta (450 ms mais a leitura): oito chaves são oito esperas em série, e o medidor já chegou a disparar 26 POST no mesmo milissegundo. O lote leva o degrau **inteiro em um comando**, valida tudo junto, confere a capacidade do conjunto e confirma com **uma** leitura de volta.

## Requisição
`POST /api/chaves/{banco}/lote` (banco = `56`, `400`, `550` ou `595`), `Content-Type: application/json`, mesma guarda D3 das outras rotas de escrita (só a própria tela).
```json
{ "ligar": [1, 2, 5], "desligar": [7] }
```
- `ligar` e `desligar` são listas de índices de chave (inteiros de 1 até o número de chaves do banco: 13, 13, 12 e 18). Qualquer uma pode faltar, mas ao menos uma chave tem de aparecer.
- Uma chave não pode aparecer duas vezes, nem em `ligar` e em `desligar` ao mesmo tempo.

## Regras (tudo ou nada)
1. **Validação:** cada chave a ligar passa pelas mesmas regras do `POST .../ligar`: banco ligado, chave habilitada, sem contator colado, PLC do banco com eco e habilitação confirmados, sem Setup em andamento. **Uma chave que não pode recusa o lote inteiro e nada é escrito.** Desligar é sempre permitido, e um lote só com `desligar` passa sempre (como desligar uma chave).
2. **Capacidade (modo `recusar`):** o total comandado do conjunto, somado às reservas ainda em voo e aos outros bancos, não pode passar de 110 % do kW a 100 % do gerador. Passou: **409 `LIMITE_EXCEDIDO`** para o lote inteiro e nenhuma chave é escrita. Aceito: reserva o kW de todas as chaves novas até o PLC mostrá-las ligadas (ou 5 s). Em modo `registrar` o lote só anota no log.
3. **Fila e prioridade:** entra na mesma fila de uma gravação por vez. Um "Desligar banco" aceito depois cancela o lote que ainda espera na fila (como cancela um `ligar`).
4. **Escrita:** os bits são escritos **um a um** (cada bit é atômico; não se lê nem se reescreve palavra), **desligar primeiro e depois ligar**.
5. **Confirmação:** uma leitura de volta confere todas as chaves. Não conferiu dentro de 2 s: **504** com `incerto: true` e as variáveis entram em quarentena (igual às outras rotas).

## Respostas
| Código | Corpo | Quando |
|---|---|---|
| 200 | `{ "ok": true, "ligadas": [1,2,5], "desligadas": [7] }` | todas as chaves conferiram na leitura de volta |
| 400 | `{ "ok": false, "erro": "..." }` | corpo inválido, índice fora da faixa, chave repetida, chave desabilitada |
| 403 | `{ "codigo": "D3_...", ... }` | pedido que não veio da própria tela |
| 409 | `{ "codigo": "LIMITE_EXCEDIDO" \| "CONTATOR_COLADO" \| "SEM_ECO" \| "HAB_NAO_CONFIRMADA" \| "ESTADO_MUDOU" \| "CANCELADO_POR_DESLIGAR", ... }` | regra recusou (nada escrito) ou o estado mudou enquanto esperava na fila |
| 503 | `{ "codigo": "LEITURA_VELHA", ... }` | leitura do PLC com mais de 2,5 s (só para lotes com `ligar`) |
| 504 | `{ "ok": false, "incerto": true, ... }` | enviado, mas sem confirmação do PLC: **conferir o estado antes de repetir** |

O lote é idempotente: repetir o mesmo corpo leva ao mesmo estado final.

## Quem executa a sequência do Patamar (o contrato não depende disso)
O Patamar é uma sequência de **degraus**; cada degrau é um lote, e entre degraus há uma pausa (o perfil de combustível do gás e do biometano manda).
| Executor | Quem manda os lotes e cuida da pausa | Estado |
|---|---|---|
| **FB em JavaScript (medidor)** | O medidor manda um `POST /lote` por degrau e espera a pausa entre degraus | rota pronta; o medidor ainda usa um POST por chave |
| **FB do PLC (futuro)** | O PLC executa o plano e aplica cada degrau por máscara (ver abaixo); o Node-RED só informa o plano e lê o resultado | modelo e rascunho SCL em `plc/bt2/entrega_lote_v0.1/`, **não compilado** |

### Lote por máscara no PLC (item 3, rascunho)
Para ligar e desligar as chaves do degrau **no mesmo ciclo do PLC**, o Node-RED escreveria três itens: `LoteSet` (palavra, máscara de ligar), `LoteClr` (palavra, máscara de desligar) e, **por último**, `LoteSeq` (contador). O bloco `fb105_loteMascara` (até 16 chaves) ou `fb106_loteMascara32` aplica os bits quando `Seq <> SeqAck` (desligar primeiro, ligar só chave habilitada com o banco ligado) e reconhece com `SeqAck = Seq`. Assim ninguém lê e reescreve uma palavra, e o PLC não perde o que fez no mesmo byte. A regra está especificada em `tests/plc_modelo/modelo_lote_mascara.js` e provada por propriedades.

## Como o medidor vai usar (passo seguinte, ainda não feito)
O Patamar executa cada degrau chamando `clica(banco, idx)` em cada chave (`33_patamar_guiado.js`, função `passoFn`), e cada clique vira um `POST .../ligar` (`31_chaves_e_bancos_painel.js`). O ponto de troca é `passoFn`: agrupar `p.liga` e `p.desliga` por banco e chamar uma função de lote que atualiza `CH_CMD` de todas as chaves e faz **um** `POST .../lote`, com retorno ao comportamento atual se a rota não existir (404). Deve nascer **desligado por padrão** e só ser ligado depois de o lote ser validado na bancada com carga desacoplada.
