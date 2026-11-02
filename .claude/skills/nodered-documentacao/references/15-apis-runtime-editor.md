# APIs do runtime, do editor e de módulo

Fontes: `docs/api/hooks/**`, `api/storage/**`, `api/context/**`, `api/library/`, `api/ui/**`, `api/modules/v/1.3/*` (JSDoc). Admin HTTP API: `14-admin-api.md`. Logging customizado: `07-settings-runtime.md`.

## Sumário
1. Hooks (mensageria e instalação) · 2. Storage API · 3. Context Store API · 4. Library Store · 5. Editor: RED.actions / RED.events / RED.notify / RED.sidebar · 6. Widgets: TypedInput, EditableList, SearchBox, TreeList, autoComplete · 7. Temas · 8. API de módulo (embedding) e RED.util

## 1. Hooks
Código em pontos-chave do runtime. (Há hooks no editor, mas não documentados para uso geral.)
```javascript
RED.hooks.add("preDeliver.my-hooks", (sendEvent) => { console.log(`About to deliver to ${sendEvent.destination.id}`); });
RED.hooks.remove("*.my-hooks");     // só remove handlers registrados com rótulo
```
- Handler recebe um objeto payload; opcionalmente um callback (se declarar 2 argumentos, **tem** de usá-lo; o retorno é ignorado).
- Terminar: retornar normalmente / callback sem argumentos / Promise resolvida. Alterações no payload seguem adiante.
- Parar processamento: retornar **estritamente `false`** / `callback(false)` / Promise resolvida com `false`.
- Erro: lançar / `callback(err)` / Promise rejeitada.

### Mensageria (ordem no caminho)
| Hook | Recebe | Notas |
|---|---|---|
| `onSend` | array de SendEvent | nó chamou `send`; mensagens exatamente como passadas (podem repetir referência). Deve ser síncrono; se assíncrono, **clone e substitua `msg` e ponha `cloneMessage = false`**. `false` descarta |
| `preRoute` | SendEvent | prestes a rotear; mesma regra de clonagem; `false` descarta |
| `preDeliver` | SendEvent | destino (`destination.node`) já definido; mensagem já clonada se preciso; `false` descarta |
| `postDeliver` | SendEvent | despachada (entrega assíncrona ao hook) |
| `onReceive` | ReceiveEvent | prestes a entrar no nó; `false` descarta |
| `postReceive` | ReceiveEvent | entregue ao handler `input` |
| `onComplete` | CompleteEvent | nó terminou (`done`) ou logou erro; `error` preenchido se houve |

Exemplo assíncrono:
```javascript
RED.hooks.add("preRoute", (sendEvent, done) => {
    if (sendEvent.cloneMessage) {
        sendEvent.msg = RED.util.cloneMessage(sendEvent.msg);
        sendEvent.cloneMessage = false;
    }
    someAsyncAPI(sendEvent).then(() => done()).catch(err => done(err));   // erro = para a mensagem
});
```
Objetos:
- **SendEvent** `{msg, source:{id, node, port}, destination:{id, node}, cloneMessage}`
- **ReceiveEvent** `{msg, destination:{id, node}}`
- **CompleteEvent** `{msg, node:{id, node}, error}`

### Instalação de módulos (nós e módulos externos)
| Hook | Evento | Comportamento |
|---|---|---|
| `preInstall` | InstallEvent `{module, version, url, dir, isExisting, isUpgrade, args}` | pode alterar `args` do npm; `false` pula o `npm install` (outro mecanismo deve instalar em `node_modules`); erro = falha limpa |
| `postInstall` | InstallEvent | roda mesmo se preInstall retornou false; não roda se o npm falhou; erro = falha limpa (ex.: rebuild em Electron com `child_process.exec("npm run rebuild " + ev.module, {cwd: ev.dir}, ...)`) |
| `preUninstall` | UninstallEvent `{module, dir, args}` | `false` pula `npm remove`; erro = falha limpa |
| `postUninstall` | UninstallEvent | erro só é logado (não dá para desfazer) |

## 2. Storage API
Onde o runtime guarda: fluxos, credenciais, settings do usuário, sessões, biblioteca. Padrão: sistema de arquivos local. Plugin: `storageModule: require("my-node-red-storage-plugin")` no settings.js. Tudo baseado em **Promises** (a doc cita When.js; referência de implementação `red/runtime/storage/localfilesystem.js`).

| Função | Retorna Promise que... |
|---|---|
| `init(settings)` | resolve quando inicializado |
| `getFlows()` / `saveFlows(flows)` | resolve com os fluxos / quando salvo |
| `getCredentials()` / `saveCredentials(credentials)` | idem, credenciais |
| `getSettings()` / `saveSettings(settings)` | idem, settings do usuário |
| `getSessions()` / `saveSessions(sessions)` | idem, sessões |
| `getLibraryEntry(type, name)` | `type` ex.: `flows`, `functions`, `templates`; entrada única → conteúdo; diretório → array de strings (subpastas) e objetos `{fn:'File-1.js', outputs:3, ...}` |
| `saveLibraryEntry(type, name, meta, body)` | resolve quando salvo |

Obsoletas (pré-0.10.7, não implemente): `getAllFlows()`, `getFlow(name)`, `saveFlow(name, flow)`.
Exemplo real: AWS Elastic Beanstalk com `node-red-contrib-storage-s3` (`10-instalacao.md`).

## 3. Context Store API (0.19+)
```javascript
contextStorage: {
   default: { module: "memory", config: { customOption: 'value' } },
   custom:  { module: require("my-custom-store") }
}
```
- **memory**: padrão, síncrono e assíncrono, apaga no restart, sem opções.
- **localfilesystem**: opções `dir` (padrão userDir), `base` (padrão `"context"`), `cache` (padrão `true`; sem cache só acesso assíncrono), `flushInterval` (s, padrão `30`; poupa SD card do Pi — **se o Node-RED for morto, o que não foi gravado se perde**). Estrutura:
  ```
  ~/.node-red/context/
    global/global.json
    <id do fluxo>/flow.json
    <id do fluxo>/<id do nó>.json
  ```
- **Plugin próprio**: exporta `module.exports = function(config){ return new ContextStore(config); }` (várias instâncias com configs diferentes). O objeto implementa:
  | Método | Descrição |
  |---|---|
  | `open()` | Promise; antes de qualquer acesso |
  | `close()` | Promise; runtime parando |
  | `get(scope, key, [cb])` | key string ou array; `cb(err, v1, v2, ...)`; sem cb e sem suporte síncrono → lança erro |
  | `set(scope, key, value, [cb])` | string+qualquer; array+array (faltantes = null); array+não-array (valor na 1ª chave, resto null); `cb(err)` |
  | `keys(scope, [cb])` | `cb(err, keys)` |
  | `delete(scope)` | apaga todas as chaves do escopo |
  | `clean(activeNodes)` | Promise; remove escopos de nós/fluxos que não existem mais |

## 4. Library Store (1.3.0+)
Biblioteca local do Import/Export fica em `~/.node-red/lib` (via Storage API). Fontes extras:
```javascript
editorTheme: {
    library: {
        sources: [{
            id: "team-collaboration-library",          // obrigatório; letras, números, - _
            type: "node-red-library-file-store",       // obrigatório
            path: "/Users/tom/work/team-library/",     // obrigatório, absoluto
            label: "Team collaboration",
            icon: "font-awesome/fa-users",
            types: ["flows"],                          // opcional: restringe tipos
            readOnly: true                             // opcional: só importar
        }]
    },
}
```
(Pasta compartilhada tipo Dropbox para equipe.) Plugin próprio: `package.json` com `"node-red": {"plugins": {"customstore": "store.js"}}` e:
```javascript
module.exports = function(RED) {
    const PLUGIN_TYPE_ID = "node-red-library-custom-store";
    class CustomStorePlugin {
        constructor(config) { this.type = PLUGIN_TYPE_ID; this.id = config.id; this.label = config.label; }
        async init() { }
        async getEntry(type, path) { /* entrada ou listagem; path inválido → erro */ }
        async saveEntry(type, path, meta, body) { }
    }
    RED.plugins.registerPlugin(PLUGIN_TYPE_ID, { type: "node-red-library-source", class: CustomStorePlugin });
}
```

## 5. APIs do editor
### RED.actions
```javascript
RED.actions.add("my-custom-tab:show-custom-tab", function() { RED.sidebar.show("my-custom-tab"); });  // nome [provider]:[acao]
RED.actions.remove("my-custom-tab:show-custom-tab");
RED.actions.invoke("my-custom-tab:show-custom-tab");   // pode passar argumentos (atalho chama sem args)
```
### RED.events — `RED.events.on(evento, fn)` / `RED.events.off(evento, fn)`
Eventos fora desta lista são privados.
- Workspace: `deploy`; `login` (`"username"`, só com adminAuth); `view:selection-changed`; `workspace:change` `{old, workspace}`; `workspace:clear` (troca de projeto); `workspace:dirty` `{dirty}`; `workspace:hide` / `workspace:show` `{workspace}`.
- Configuração: `flows:add|change|remove`, `flows:reorder` (array de ids), `groups:add|change|remove`, `links:add|remove`, `nodes:add|change|remove`, `nodes:reorder` `{z, nodes}`, `subflows:add|change|remove`.
- Palette: `registry:module-updated` `{module, version}`, `registry:node-set-added|disabled|enabled|removed`, `registry:node-type-added|removed` (`"tipo"`), `registry:plugin-added`.
### RED.notify(message, [options]) — use com parcimônia
Opções: `type` (`compact`, `success`, `warning`, `error`; padrão info), `timeout` (ms, padrão 5000), `fixed` (não some nem fecha no clique), `modal`, `buttons` (`{text, class:"primary", click}` — deve haver um `primary` se houver vários). Retorna objeto com `close()` e `update(message, options)`.
```javascript
RED.notify("Something has happened", { type: "warning", timeout: 10000 });
let n = RED.notify("Confirma?", { modal:true, fixed:true, type:'warning',
    buttons:[ {text:"cancel", click:()=>n.close()}, {text:"okay", class:"primary", click:()=>n.close()} ] });
```
### RED.sidebar
`addTab({id, label, name, iconClass:"fa fa-database", content, toolbar?, enableOnEdit?, action?})`, `removeTab(id)` (obrigatório no `onpaletteremove` se adicionou no `onpaletteadd`), `show(id)`, `containsTab(id)`.

## 6. Widgets (jQuery, no `oneditprepare`)
### TypedInput
- Opções: `default` (tipo se não houver `typeField`), `types` (array), `typeField` (seletor de input — guarde o tipo em `defaults`, ex.: `myFieldType: {value:"str"}` + `<input type="hidden" id="node-input-myFieldType">`).
- Tipos embutidos: `msg`, `flow`, `global`, `str`, `num`, `bool`, `json`, `bin` (Buffer), `re`, `jsonata`, `date` (timestamp atual), `env`, `node`, `cred` (credencial segura).
- **TypeDefinition** (tipo próprio): `value` (obrigatório), `label`, `icon`, `options` (lista fixa), `multiple`, `hasValue:false`, `validate`, `valueLabel(container, value)`, `autoComplete` (2.1+; não combina com options/hasValue=false/valueLabel).
- Métodos: `disable([state])` e `disabled()` (1.2.7+), `enable()` (1.3.3+), `hide`, `show`, `type()`/`type(t)`, `types(arr)`, `validate()`, `value()`/`value(v)`, `width(w)`. Evento `change(event, type, value)` (`value` desde 1.3).
- **Runtime**: o valor chega como **string** (`"true"`, `"false"`...). Converta:
  ```javascript
  const r = RED.util.evaluateNodeProperty(value, type, node);            // maioria dos tipos
  const r2 = RED.util.evaluateNodeProperty(value, type, node, msg);      // tipo msg
  RED.util.evaluateNodeProperty(value, type, node, msg, (err, result) => { ... });  // flow/global
  ```
### EditableList (usado por Switch e Change)
- Opções: `addButton` (bool/texto), `addItem(row, index, data)` (`data` = `{}` se pelo botão), `buttons` (`{label, icon, title, click}`), `connectWith`, `header`, `height` (`'auto'` sem scroll), `filter(data)`, `resize()`, `resizeItem(row, index)`, `scrollOnAdd`, `sort(a,b)`, `sortable` (bool ou seletor de handle), `sortItems(items)`, `removable`, `removeItem(data)`.
- Métodos: `addItem`, `addItems`, `removeItem`, `width`, `height` (use em vez dos do jQuery), `items` (cada elemento guarda `data`), `empty` (sem callbacks), `filter` (retorna visíveis; `null` remove filtro), `show(item)` (0.20+), `sort`, `length`, `cancel` (3.1+).
### SearchBox
Opções `delay` (ms), `minimumLength`; métodos `change()`, `count("120 / 300")` (vazio esconde), `value()`/`value(v)`.
### TreeList (0.20+)
- Item: `label`, `id`, `class`, `icon`, `checkbox`, `radio` (2.1+), `selected`, `children` (array ou `function(done)` assíncrona), `expanded`, `deferBuild`, `element`, `expandOnClick` (5.0+).
- Após adicionado: `item.parent`, `item.depth`, `item.treeList.{container,label}` e funções `remove(detach)`, `makeLeaf`, `makeParent(children)`, `insertChildAt(item,pos,select)`, `addChild(item,select)`, `expand(done)`, `collapse()`, `sortChildren(fn)`, `replaceElement(el)`.
- Métodos `data()`/`data(items)`, `empty()`, `show(itemId)` (só nível superior). Eventos `treelistselect`, `treelistmouseover`, `treelistmouseout`.
### autoComplete (2.1+)
`$(el).autoComplete({ search: function(val[, done]) { return [{value, label}] } })` — com 2 argumentos deve chamar `done(resultados)`; `label` pode ser elemento DOM; `destroy` remove.

## 7. Temas (2.0+)
1. `git clone https://github.com/node-red/node-red`; copie `packages/node_modules/@node-red/editor-client/src/sass/colors.scss`; edite.
2. `node node-red/scripts/build-custom-theme.js --in ../my-custom-theme/colors.scss --out ../my-custom-theme/style.css`
3. Teste: `editorTheme.page.css: "/caminho/absoluto/style.css"`.
4. Plugin: `theme.js` → `RED.plugins.registerPlugin("my-custom-theme", { type: "node-red-theme", css: "style.css", /* scripts, */ monacoOptions: { theme: "vs-dark" /* ou objeto/JSON */, fontSize: 14, minimap: {enabled:false} }, mermaid: { theme: "dark" } })`; `package.json` com `"node-red": {"plugins": {"my-theme": "theme.js"}}` e keyword `node-red` (nome sugerido `node-red-contrib-theme-XYZ`).
5. `npm install /caminho` no userDir, `editorTheme: { theme: "my-custom-theme" }`, reinicie (mudanças de CSS depois só precisam recarregar o editor).

## 8. API de módulo (embedding) — JSDoc 1.3
`require("node-red")`:
- Propriedades: `httpAdmin` (Express do editor/Admin API), `httpNode` (Express dos nós HTTP), `server`, `settings`, `nodes` (interno, não use direto), `auth`, `events`, `hooks`, `log`, `runtime`, `util`.
- `init(httpServer, userSettings)`, `start()` → Promise, `stop()` → Promise (depois não reinicie sem reiniciar o processo Node.js), `version()`.
- `runtime`: `init`, `isStarted`, `start`, `stop`, `version`; submódulos `comms`, `context` (`getValue`, `delete`), `flows` (`getFlows`, `setFlows`, `addFlow`, `getFlow`, `updateFlow`, `deleteFlow`, `getNodeCredentials`), `library` (`getEntry`, `saveEntry`), `nodes` (`addModule`, `removeModule`, `getModuleInfo`, `setModuleState`, `setNodeSetState`, `getNodeList`, `getIcon`...), `plugins`, `projects` (commit, push, pull, branches...), `settings` (`getRuntimeSettings`, `getUserSettings`, `updateUserSettings`, chaves SSH do usuário).
- `util.log`: `log`, `info`, `warn`, `error`, `debug`, `trace`, `metric`, `audit`, `addHandler`, `removeHandler`, `_` (i18n).
- **RED.util** (também usado em nós):
  | Função | Uso |
  |---|---|
  | `cloneMessage(msg)` | clona com segurança (trata `msg.req`/`msg.res`, que não podem ser clonados) |
  | `compareObjects(a, b)` | compara objetos |
  | `encodeObject(msg, opts)` | JSON sem perder Buffer/Function |
  | `ensureBuffer(o)` / `ensureString(o)` | conversões |
  | `evaluateEnvProperty(value, node)` | substitui `${VAR}` numa string |
  | `prepareJSONataExpression(value, node)` + `evaluateJSONataExpression(expr, msg, cb)` | JSONata com funções do Node-RED |
  | `evaluateNodeProperty(value, type, node, msg, cb)` | avalia valor de TypedInput |
  | `generateId()` | id pseudoaleatório |
  | `getMessageProperty(msg, expr)` / `setMessageProperty(msg, prop, value, createMissing)` | aceitam prefixo `msg.` |
  | `getObjectProperty(obj, expr)` / `setObjectProperty(...)` | `pet.type` → valor; caminho inexistente no meio lança erro |
  | `normalisePropertyExpression(str)` | `a["b"].c` → `['a','b','c']` |
  | `normaliseNodeTypeName(name)` | `a-random node type` → `aRandomNodeType` |
  | `parseContextStore(key)` | `#:(file)::foo` → `{store:"file", key:"foo"}` |
- Versões antigas da referência (1.0, 0.20.0) existem no site; a 1.3 é a mais recente publicada.
