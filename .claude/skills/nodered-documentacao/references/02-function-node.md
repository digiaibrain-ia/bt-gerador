# Function node

Fonte: `docs/user-guide/writing-functions.md` (nodered.org/docs/user-guide/writing-functions)

O código digitado é o **corpo** de uma função que recebe `msg`.

## Retorno
```javascript
return msg;          // passa adiante
return null;         // não envia nada; o fluxo termina aqui
```
- Deve sempre retornar um objeto msg (ou null). Retornar número ou string gera erro.
- Pode retornar um objeto novo (`return { payload: msg.payload.length };`), **mas isso perde as propriedades originais** — quebra, por exemplo, HTTP In → HTTP Response, que precisa de `msg.req` e `msg.res` do começo ao fim. Regra geral: **modifique e devolva o mesmo `msg`**.
- Depuração rápida: `node.warn("valor xyz = " + xyz);` aparece na barra Debug.

## Várias saídas
Configure o número de saídas no diálogo e retorne um array (uma posição por saída; `null` = nada naquela saída):
```javascript
if (msg.topic === "banana") { return [ null, msg ]; }
else { return [ msg, null ]; }

const newMsg = { payload: msg.payload.length };
return [msg, newMsg];      // original na 1ª, derivada na 2ª
```
`node.outputCount` informa quantas saídas estão configuradas — útil para funções genéricas:
```javascript
const messages = new Array(node.outputCount);
messages[Math.floor(Math.random() * node.outputCount)] = msg;
return messages;
```

## Várias mensagens em uma saída
Array dentro do array; os nós seguintes recebem uma por vez, na ordem:
```javascript
return [ [ msg1, msg2, msg3 ], msg4 ];   // 3 na saída 1, 1 na saída 2

const outputMsgs = [];
for (const w of msg.payload.split(" ")) outputMsgs.push({payload: w});
return [ outputMsgs ];
```

## Envio assíncrono
Não dá para `return` depois de um callback. Use `node.send()` (aceita o mesmo formato do return) e termine com `return;`:
```javascript
doSomeAsyncWork(msg, function(result) {
    msg.payload = result;
    node.send(msg);
    node.done();     // avisa o runtime que terminou esta mensagem
});
return;
```
- O Function **clona toda mensagem** passada a `node.send` (antes do 1.0 não clonava a primeira). Para não clonar a primeira (objeto não clonável ou desempenho): `node.send(msg, false);`
- `node.done()` permite ao runtime rastrear corretamente a mensagem (Complete node, contabilização).

## On Start / On Stop
- **On Start** (1.1.0+, chamada "Setup" antes do 1.3.0): roda quando o nó inicia. Pode retornar Promise; mensagens que chegarem antes ficam **enfileiradas**.
  ```javascript
  if (context.get("counter") === undefined) { context.set("counter", 0) }
  ```
- **Limpeza** no redeploy: aba **On Stop**, ou `node.on('close', function() { ... })`.
- Timeouts e intervals pendentes são limpos automaticamente ao parar/redeploy.

## Log
```javascript
node.log("Something happened");
node.warn("Something happened you should know about");
node.error("Oh no, something bad happened");
node.debug(...); node.trace(...);   // só aparecem se houver logger nesse nível
```
- `warn` e `error` também vão para a aba Debug.
- Onde aparece o log: terminal (se iniciado por linha de comando), log do sistema (serviço), PM2 (ferramenta própria), Raspberry Pi: `node-red-log`.

## Erros
Para interromper e acionar um Catch na mesma aba, passe a mensagem original como 2º argumento:
```javascript
node.error("hit an error", msg);
return;   // não retorne nada
```

## Contexto
Variáveis prontas: `context` (nó), `flow` (aba), `global`. (São recurso do Function; nó customizado usa outra API — ver `13-criando-nos.md`.)
```javascript
let myCount = flow.get("count");
flow.set("count", 123);

let count = context.get('count') || 0;
count += 1;
context.set('count', count);
msg.count = count;
return msg;

// vários de uma vez (ausentes viram null)
let values = flow.get(["count", "colour", "temperature"]);
flow.set(["count", "colour", "temperature"], [123, "red", "12.5"]);
```
**Assíncrono** (stores que só suportam async lançam erro se usados de forma síncrona):
```javascript
flow.get("count", function(err, myCount) { ... });
flow.get(["count", "colour"], function(err, count, colour) { ... });
flow.set("count", 123, function(err) { ... });
flow.set(["count", "colour"], [123, "red"], function(err) { ... });
```
**Store específico** (0.19+; o nome pode ser variável):
```javascript
let v = flow.get("count", "storeName");
flow.get("count", "storeName", function(err, v) { ... });
flow.set("count", 123, "storeName");
flow.set("count", 123, "storeName", function(err) { ... });
```
`context.keys()`, `flow.keys()`, `global.keys()` listam chaves. `context.flow`/`context.global` equivalem a `flow`/`global`.

## Status
```javascript
node.status({fill:"red",shape:"ring",text:"disconnected"});
node.status({fill:"green",shape:"dot",text:"connected"});
node.status({text:"Just text status"});
node.status({});   // limpa
```
Pode ser capturado por um Status node.

## Módulos adicionais
Não dá para `require` direto no Function. Duas formas:
1. **`functionGlobalContext`** no settings.js:
   ```javascript
   functionGlobalContext: { osModule: require('os') }
   // no Function: global.get('osModule')
   ```
   O módulo precisa estar instalado no diretório do settings (geralmente `cd ~/.node-red && npm install <modulo>`).
2. **`functionExternalModules: true`** no settings.js: a aba Setup ganha lista de módulos + nome da variável; são instalados em `~/.node-red/node_modules/` no deploy.

## Timeout
Na aba Setup, em segundos; 0 (padrão) = sem timeout. **Só vale para código síncrono.** Padrão para novos nós: `functionTimeout` no settings.

## Chamar Link nodes — `node.linkcall` (Node-RED 5+)
Chamada em linha a outro fluxo, aguardando resposta (ex.: reutilizar um fluxo de banco de dados):
```javascript
msg.topic = 'select * from orders';
const result = await node.linkcall('database-query', msg);
// result.payload = resultado da consulta
```
- O fluxo chamado começa num **link in** e termina num **link out** configurado como "return to calling link node".
- O próprio exemplo oficial usa `await` direto no corpo do Function — em código novo, `await` com `try/catch` é aceitável; o padrão `node.send` + `node.done` continua sendo o documentado para callbacks.
- Não confunda com o nó **link call**, cujo timeout padrão é **30 s** (o `node.linkcall` do Function é **5 s**).
- `node.linkcall(target, msg, options)`: `target` = `id` ou `name` do link in; `options.timeout` em ms (padrão `5000`); `options.clone` (padrão `true`).

## Referência de API disponível no Function
- `node`: `id`, `name`, `outputCount`, `log`, `warn`, `error`, `debug`, `trace`, `on`, `status`, `send`, `done`, `linkcall` (5.0+)
- `context`: `get`, `set`, `keys`, `flow`, `global` · `flow`: `get`, `set`, `keys` · `global`: `get`, `set`, `keys`
- `RED.util.cloneMessage(..)` — clona uma mensagem com segurança para reutilizar
- `env.get(..)` — variável de ambiente
- Também: `Buffer`, `console` (prefira `node.log`), `util` (módulo Node.js), `setTimeout/clearTimeout`, `setInterval/clearInterval`.
