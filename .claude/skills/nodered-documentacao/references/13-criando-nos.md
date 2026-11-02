# Criando nós customizados

Fonte: `docs/creating-nodes/*.md` (16 páginas)

## Sumário
1. Princípios gerais · 2. Primeiro nó (lower-case) · 3. Arquivo .js (runtime) · 4. Arquivo .html (editor) · 5. Propriedades e validação · 6. Diálogo de edição e widgets · 7. Credenciais · 8. Aparência · 9. Status · 10. Config nodes · 11. Contexto · 12. Guia de estilo da ajuda · 13. Exemplos · 14. i18n · 15. Recursos extras (1.3+) · 16. Empacotamento e publicação · 17. Subflow como módulo (1.3+) · 18. Testes unitários

## 1. Princípios gerais
Principal forma de estender o Node-RED; publique no npm e adicione ao Flow Library. Um nó deve:
- ter **propósito bem definido** (vários nós de propósito único > um nó que expõe tudo de uma API);
- ser **simples de usar**, escondendo complexidade e jargão;
- ser **tolerante** com tipos de entrada (string, número, booleano, Buffer, objeto, array, null) e fazer a coisa certa;
- ser **consistente** no que envia e documentar as propriedades que adiciona;
- ficar no **início, meio ou fim** de um fluxo — não em todos;
- **capturar erros**: erro não capturado faz o Node-RED parar o fluxo inteiro; registre tratadores em toda chamada assíncrona.

## 2. Primeiro nó
Nós são criados no deploy, trocam mensagens e são apagados no próximo deploy. Arquivos: `.js` (comportamento), `.html` (propriedades, diálogo, ajuda) e `package.json` (módulo npm).

`package.json` (gere com `npm init`, depois acrescente):
```json
{
    "name" : "node-red-contrib-example-lower-case",
    "node-red" : { "nodes": { "lower-case": "lower-case.js" } }
}
```
(Não publique o exemplo no npm.)

`lower-case.js`:
```javascript
module.exports = function(RED) {
    function LowerCaseNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
            msg.payload = msg.payload.toLowerCase();
            node.send(msg);
        });
    }
    RED.nodes.registerType("lower-case", LowerCaseNode);
}
```
- O módulo exporta função chamada na carga, recebendo `RED` (API do runtime). O construtor recebe as propriedades do editor, chama `RED.nodes.createNode` e registra listeners. Dependências npm vão em `dependencies`.

`lower-case.html`:
```html
<script type="text/javascript">
    (function () {            // isola para não vazar globais
        'use strict'
        RED.nodes.registerType('lower-case',{
            category: 'function',
            color: '#a6bbcf',
            defaults: { name: {value:""} },
            inputs: 1,
            outputs: 1,
            icon: "file.svg",
            label: function() { return this.name||"lower-case"; }
        });
    }());
</script>
<script type="text/html" data-template-name="lower-case">
    <div class="form-row">
        <label for="node-input-name"><i class="fa fa-tag"></i> Name</label>
        <input type="text" id="node-input-name" placeholder="Name">
    </div>
</script>
<script type="text/html" data-help-name="lower-case">
    <p>A simple node that converts the message payloads into all lower-case characters</p>
</script>
```
Convenção: propriedade `name` para distinguir instâncias.

**Testar localmente**: no userDir, `npm install <pasta do módulo>` (ex.: `cd ~/.node-red && npm install ~/dev/node-red-contrib-example-lower-case`; Windows: `cd C:\Users\me\.node_red` e caminho completo). Cria link simbólico em `~/.node-red/node_modules`; reinicie o Node-RED para pegar mudanças. O npm adiciona o módulo ao `package.json` do userDir (evite com `--no-save`).

## 3. Arquivo .js
### Construtor
```javascript
function SampleNode(config) {
    RED.nodes.createNode(this, config);
    // código do nó
}
RED.nodes.registerType("sample", SampleNode);
```
### Receber (1.0+: `msg, send, done`)
```javascript
this.on('input', function(msg, send, done) {
    // ...
    if (done) { done(); }          // "if" mantém compatibilidade com 0.x
});
```
### Erros
```javascript
let node = this;
this.on('input', function(msg, send, done) {
    if (err) {
        if (done) { done(err); }            // 1.0+: aciona Catch da aba
        else { node.error(err, msg); }      // 0.x
    }
});
```
### Enviar
- Nó de **início** (eventos externos): `this.send({ payload:"hi" });`
- Dentro do `input`: use o `send` recebido (fallback 0.x: `send = send || function() { node.send.apply(node,arguments) }`), depois `done()`.
- `msg` null = nada enviado. **Reaproveite a mensagem recebida** em vez de criar outra (preserva propriedades).
- Várias saídas: `this.send([ msg1, msg2 ]);` Várias mensagens numa saída: `this.send([ [msgA1, msgA2, msgA3], msg2 ]);`
### Fechar (a cada deploy os nós existentes são apagados)
```javascript
this.on('close', function() { /* limpar */ });
this.on('close', function(done) { doSomething(function() { done(); }); });   // assíncrono
this.on('close', function(removed, done) {     // 0.17+
    if (removed) { /* desativado ou apagado */ } else { /* reiniciando */ }
    done();
});
```
**Timeout** (0.17+): se o `done` do close levar mais de **15 s**, o runtime loga erro e segue (antes esperava para sempre).
### Log
`this.log`, `this.warn`, `this.error`, `this.trace` e `this.debug` (0.17+). warn/error também vão para a aba Debug.
### Status
`this.status({fill:"red",shape:"ring",text:"disconnected"});` (seção 9).
### Settings próprios no settings.js
- Nome **prefixado pelo tipo do nó**, em camelCase, com **padrão sensato** (não exigir do usuário). Tipo `sample-node` + `colour` → `sampleNodeColour`; runtime: `RED.settings.sampleNodeColour`.
- Expor ao editor (0.17+):
  ```javascript
  RED.nodes.registerType("sample", SampleNode, {
      settings: { sampleNodeColour: { value: "red", exportable: true } }
  });
  ```
  Nome fora da regra → erro no log.

## 4. Arquivo .html
Três `<script>`:
1. Definição (JavaScript) via `RED.nodes.registerType('tipo', {...})` — o tipo deve ser igual ao do `.js`.
2. Template de edição: `<script type="text/html" data-template-name="tipo">`.
3. Ajuda: `<script type="text/html" data-help-name="tipo">` (o primeiro `<p>` vira tooltip na palette; descreva propriedades de entrada e saída).

Propriedades da definição:
| Propriedade | Tipo | Uso |
|---|---|---|
| `category` | string | categoria na palette (`config` para config node) |
| `defaults` | object | propriedades editáveis |
| `credentials` | object | propriedades de credencial |
| `inputs` | number | `0` ou `1` |
| `outputs` | number | `0` ou mais |
| `color` | string | cor de fundo |
| `paletteLabel` | string/function | rótulo na palette |
| `label` | string/function | rótulo no workspace |
| `labelStyle` | string/function | classe CSS do rótulo |
| `inputLabels` / `outputLabels` | string/function | rótulos das portas |
| `icon` | string/function | ícone |
| `align` | string | `'right'` para nós de fim de fluxo |
| `button` | object | botão na borda |
| `oneditprepare` | function | antes de mostrar o diálogo |
| `oneditsave` | function | ao confirmar |
| `oneditcancel` | function | ao cancelar |
| `oneditdelete` | function | ao apagar (config node) |
| `oneditresize` | function | ao redimensionar |
| `onpaletteadd` / `onpaletteremove` | function | tipo adicionado/removido da palette |

Dica no diálogo: `<div class="form-tips"><b>Tip:</b> ...</div>`.

## 5. Propriedades e validação
```javascript
defaults: { name: {value:""}, prefix: {value:""} },
```
```html
<div class="form-row">
    <label for="node-input-prefix"><i class="fa fa-tag"></i> Prefix</label>
    <input type="text" id="node-input-prefix">
</div>
```
```javascript
this.prefix = config.prefix;
```
- Atributos de cada entrada: `value` (padrão), `required` (inválido se null/vazio), `validate` (função → true/false), `type` (tipo do config node apontado).
- **Nomes reservados**: qualquer letra única (`x`, `y`, `z`, `d`, `g`, `l` já usadas; demais reservadas), `id`, `type`, `wires`, `inputs`, `outputs`. Exceção: `outputs` em `defaults` para número de saídas configurável (como o Function).
- `validate` roda com `this` = nó (acessa outras propriedades). Durante a edição, `this` reflete a configuração salva, **não** o formulário — leia o elemento do formulário e use `this` como fallback.
- Prontos: `RED.validators.number()`, `RED.validators.regex(re)`.
```javascript
defaults: {
   minimumLength: { value:0, validate:RED.validators.number() },
   lowerCaseOnly: { value:"", validate:RED.validators.regex(/[a-z]+/) },
   custom: { value:"", validate:function(v) {
      var minimumLength = $("#node-input-minimumLength").length ? $("#node-input-minimumLength").val() : this.minimumLength;
      return v.length > minimumLength
   } }
},
```
Inválido/ausente: marcador de configuração faltando no nó e campo com borda vermelha.
- O editor preenche automaticamente `<input id="node-input-<prop>">` (ou `node-config-input-<prop>`) e lê de volta ao fechar. Comportamento customizado via `oneditprepare`/`oneditsave` (ex.: Inject converte cron `1,2 * * * *` em UI amigável e de volta).

## 6. Diálogo de edição e widgets
- `<script type="text/html" data-template-name="tipo">` (o type evita que o navegador trate como HTML).
- Linhas `<div class="form-row">` com `<label>` (ícone Font Awesome 4.7 em `<i>`) e input `node-input-<prop>` (`node-config-input-<prop>` em config nodes). `<input type="text">` para string/número, `checkbox` para booleano, `<select>` para opções fixas.
- **Botões**: `<button type="button" class="red-ui-button">`; pequeno: `red-ui-button red-ui-button-small`; grupo toggle: `<span class="button-group">` com `red-ui-button toggle` e tratar a classe `selected` no `oneditprepare` (sem espaços entre os botões).
- **TypedInput** (jQuery, inicializado no `oneditprepare`):
  ```javascript
  // String/Number/Boolean – precisa de input hidden para guardar o tipo
  $("#node-input-example1").typedInput({ type:"str", types:["str","num","bool"], typeField:"#node-input-example1-type" })
  // JSON (com botão para editor JSON)
  $("#node-input-example2").typedInput({ type:"json", types:["json"] })
  // msg/flow/global
  $("#node-input-example3").typedInput({ type:"msg", types:["msg","flow","global"], typeField:"#node-input-example3-type" })
  // select / multi-select (valor = lista separada por vírgula)
  $("#node-input-example4").typedInput({ types:[{ value:"fruit", multiple:"true",
      options:[{value:"apple",label:"Apple"},{value:"banana",label:"Banana"}] }] })
  ```
  API completa em `15-apis-runtime-editor.md`.
- **Editor multilinha** (Ace; Monaco se habilitado — padrão na 5.x):
  ```html
  <div style="height: 250px; min-height:150px;" class="node-text-editor" id="node-input-example-editor"></div>
  ```
  ```javascript
  oneditprepare: function() {
      this.editor = RED.editor.createEditor({ id:'node-input-example-editor', mode:'ace/mode/text', value:this.exampleText });
  },
  oneditsave: function() { this.exampleText = this.editor.getValue(); this.editor.destroy(); delete this.editor; },
  oneditcancel: function() { this.editor.destroy(); delete this.editor; },
  ```

## 7. Credenciais
Guardadas **fora do arquivo de fluxos** e **não exportadas**.
1. Na definição: `credentials: { username: {type:"text"}, password: {type:"password"} },`
2. No template: inputs `node-input-username` / `node-input-password` (mesma convenção).
3. No `.js`: `RED.nodes.registerType("my-node", MyNode, { credentials: { username:{type:"text"}, password:{type:"password"} } });`
- Runtime: `this.credentials.username`, `this.credentials.password`.
- Editor: `text` disponível em `this.credentials`; `password` **não** — existe `this.credentials.has_password` (booleano: tem valor não vazio).
- Credenciais **não** podem ser usadas na função `label`.
- Uso avançado (tokens OAuth atribuídos pelo servidor): ver nó Twitter em node-red-nodes.

## 8. Aparência
- **Ícone** (`icon`): string ou função (avaliada na carga/edição; também chamada para a palette, onde `this` não é instância — deve retornar valor válido).
  - Stock: `alert.svg`, `arrow-in.svg`, `bridge-dash.svg`, `bridge.svg`, `db.svg`, `debug.svg`, `envelope.svg`, `feed.svg`, `file.svg`, `function.svg`, `hash.svg`, `inject.svg`, `light.svg`, `serial.svg`, `template.svg`, `white-globe.svg` (1.0+ troca pedidos .png por .svg).
  - Próprio: pasta `icons` ao lado do .js/.html; nome único; branco sobre transparente, 2:3, mínimo 40×60.
  - Font Awesome 4.7: `"font-awesome/fa-automobile"`.
  - O usuário pode trocar o ícone na aba Appearance — exceto se o nó tiver `icon` em `defaults` (ex.: `ui_button`).
- **Cor** (`color`): paleta suave. Usadas: `#3FADB5 #87A980 #A6BBCF #AAAA66 #C0C0C0 #C0DEED #C7E9C0 #D7D7A0 #D8BFD8 #DAC4B4 #DEB887 #DEBD5C #E2D96E #E6E0F8 #E7E7AE #E9967A #F3B567 #FDD0A2 #FDF0C2 #FFAAAA #FFCC66 #FFF0F0 #FFFFFF`.
- **Rótulos**: `label` (ex.: `function() { return this.name||"lower-case"; }`), `paletteLabel` (avaliado uma vez), `labelStyle` (classes `node_label` padrão ou `node_label_italic`: `function() { return this.name?"node_label_italic":""; }`), `align: 'right'`.
- **Rótulos de porta**: `inputLabels: "parameter for input"`, `outputLabels: ["stdout","stderr","rc"]` ou `function(index) {...}` (índice a partir de 0). O usuário pode sobrescrever. Não são dinâmicos nem vêm de `msg`.
- **Botões**: o editor não é dashboard; em geral nós não devem ter botão (Inject e Debug são exceções de desenvolvimento).
  ```javascript
  button: {
      enabled: function() { return !this.changed },
      visible: function() { return this.hasButton },
      onclick: function() { }
  },
  // toggle (como o Debug): defaults: { buttonState: {value:true} }, button: { toggle:"buttonState", onclick: function(){} }
  ```

## 9. Status
```javascript
this.status({fill:"red",shape:"ring",text:"disconnected"});
this.status({fill:"green",shape:"dot",text:"connected"});
this.status({});   // limpa
```
- `shape`: `ring` ou `dot`. `fill`: `red`, `green`, `yellow`, `blue`, `grey`. `text`: opcional, **menos de 20 caracteres**.
- Exibição pode ser ligada/desligada no menu (Display Node Status). Status node (0.12+) captura atualizações para disparar fluxos.
- Com i18n: `text:"myNode.status.ready"`; catálogo core: `"node-red:common.status.connected"`.

## 10. Config nodes
Compartilham configuração (ex.: MQTT In/Out usam o broker e **compartilham a conexão**). **Escopo global por padrão** (estado compartilhado entre fluxos).
- Diferenças: `category: 'config'` e inputs `node-config-input-<prop>`.
```html
<script type="text/javascript">
    RED.nodes.registerType('remote-server',{
        category: 'config',
        defaults: {
            host: {value:"localhost",required:true},
            port: {value:1234,required:true,validate:RED.validators.number()},
        },
        label: function() { return this.host+":"+this.port; }
    });
</script>
<script type="text/html" data-template-name="remote-server">
    <div class="form-row"><label for="node-config-input-host"><i class="fa fa-bookmark"></i> Host</label><input type="text" id="node-config-input-host"></div>
    <div class="form-row"><label for="node-config-input-port"><i class="fa fa-bookmark"></i> Port</label><input type="text" id="node-config-input-port"></div>
</script>
```
```javascript
module.exports = function(RED) {
    function RemoteServerNode(n) {
        RED.nodes.createNode(this, n);
        this.host = n.host;
        this.port = n.port;
    }
    RED.nodes.registerType("remote-server", RemoteServerNode);
}
```
- Se o config node abre a conexão remota, trate `close` para desconectar.
- **Usar**: `defaults: { server: {value:"", type:"remote-server"} }` + `<input id="node-input-server">` (o editor troca por `<select>` com botão de edição). Runtime:
```javascript
this.server = RED.nodes.getNode(config.server);
if (this.server) { /* this.server.host, this.server.port */ } else { /* nenhum configurado */ }
```

## 11. Contexto em nó customizado
```javascript
var nodeContext = this.context();
var flowContext = this.context().flow;
var globalContext = this.context().global;
```
Mesmos `get`/`set` do Function (`02-function-node.md`). Config nodes compartilhados são globais por padrão — **não assuma acesso a contexto flow**.

## 12. Guia de estilo da ajuda
Estrutura (HTML ou, desde 2.1.0, `type="text/markdown"` **sem indentação** dentro do script):
- Introdução de 2–3 linhas; o **primeiro `<p>`** é o tooltip na palette.
- `<h3>Inputs</h3>` — propriedades usadas (com tipo), breves.
- `<h3>Outputs</h3>` — propriedades enviadas; várias saídas em `<ol class="node-ports">` com um `<li>` + `<dl>` por saída (saída única: só o `<dl>`).
- `<h3>Details</h3>` — uso detalhado; subtítulos `<h4>`.
- `<h3>References</h3>` — links externos (docs, repositório/npm).
- Propriedades: `<dl class="message-properties">`, `<dt>nome <span class="property-type">tipo</span></dt>` (`class="optional"` se opcional) e `<dd>descrição</dd>`. Markdown: `: payload (string | buffer) : descrição` e `: *topic* (string) : ...`.
- Fora das listas: `<code>msg.payload</code>`. Sem `<b>`/`<i>` no corpo. Não presuma leitor experiente — acima de tudo, seja útil.

## 13. Exemplos
Arquivo de fluxo em `examples/` na raiz do pacote; o nome do arquivo vira o item de menu (Import → Examples): `examples/My Great Example.json` → "My Great Example". Curtos, com Comment node, sem nós de terceiros extras.

## 14. i18n
Nó `"myNode": "myNode/my-node.js"` → `myNode/locales/<idioma>/my-node.json` (catálogo) e `my-node.html` (ajuda traduzida). `locales` no mesmo diretório do .js; padrão `en-US`.
- Catálogo `{"myNode": {"message1": "..."}}` carregado no namespace `my-node-module/myNode` (core: `node-red`).
- Runtime: `RED._("myNode.message1")`. Status: `text:"myNode.status.ready"` ou `"node-red:common.status.connected"`.
- Editor: `<span data-i18n="myNode.label.foo"></span>`; atributo: `data-i18n="[placeholder]myNode.placeholder.foo"`; vários: `data-i18n="[title]myNode.label.linkTitle;myNode.label.linkText"`; nas funções da definição: `this._("...")`.

## 15. Recursos extras no editor (1.3+)
Pasta `resources` na raiz do módulo → servida em `/resources/<modulo>/<arquivo>` (com escopo: `/resources/@scope/pacote/arquivo`). No editor use **URL relativa** (sem `/` inicial): `<img src="resources/node-red-node-example/image.png" />`, `<script src="resources/node-red-node-example/library.js">`.

## 16. Empacotamento e publicação
- **Nome** (módulos publicados após 31/01/2022): **escopo npm** (`@myScope/node-red-sample` ou `@myScope/sample`; ter `node-red` no nome ajuda). Fork para correção: mesmo nome sob seu escopo (fork é último recurso).
- Estrutura livre; `examples/` **na raiz**:
  ```
  ├── LICENSE
  ├── README.md
  ├── package.json
  ├── examples/example-1.json
  └── sample/{icons/my-icon.svg, sample.html, sample.js}
  ```
- `package.json`:
  ```json
  {
      "name": "@myScope/node-red-sample",
      "version": "0.0.1",
      "description": "A sample node for Node-RED",
      "dependencies": {},
      "keywords": [ "node-red" ],
      "node-red": {
          "version": ">=2.0.0",
          "nodes": { "sample": "sample/sample.js" }
      }
  }
  ```
  Liste cada .js uma vez (vários nós no mesmo arquivo). Keyword `node-red` só quando estiver estável e documentado. `node-red.version` declara a versão mínima suportada.
- README (GitHub markdown: capacidades, pré-requisitos, exemplo) e LICENSE.
- Teste local: `npm install <caminho>` no userDir.
- **Flow Library**: desde abr/2020 não indexa automaticamente; envie em flows.nodered.org → **+** → node (flows.nodered.org/add/node). Atualizar: reenviar ou "request refresh" na página do nó (logado).

## 17. Subflow como módulo (1.3+, experimental, manual)
Antes: propriedades configuráveis, tratamento de erro (dentro ou repassado), saída de status, ícone/cor/categoria.
Metadados (Module Properties): Module (nome npm), Node Type (único; padrão é o id), Version, Description, License, Author, Keywords.
1. `mkdir node-red-example-subflow && cd node-red-example-subflow && npm init` (respostas iguais aos metadados); README.
2. Wrapper `example.js`:
   ```javascript
   const fs = require("fs");
   const path = require("path");
   module.exports = function(RED) {
       const subflowJSON = JSON.parse(fs.readFileSync(path.join(__dirname, "subflow.json")));
       RED.nodes.registerSubflow(subflowJSON);
   }
   ```
3. Adicione uma instância, exporte (`Ctrl-E`, formato formatted). No array, o penúltimo item é a **definição** e o último a **instância**: apague a instância; leve a definição para fora do array; coloque os demais nós dentro dela na propriedade `"flow"`; limpe vírgulas; salve `subflow.json`.
4. `package.json`: `"node-red": { "nodes": { "example-node": "example.js" }, "dependencies": ["node-red-node-random"] }` e `"dependencies": { "node-red-node-random": "1.2.3" }` (nós não padrão nas **duas** listas).

## 18. Testes unitários
`node-red-node-test-helper` (framework sobre o runtime). Pasta `test/`, ex. `test/lower-case_spec.js`:
```javascript
var helper = require("node-red-node-test-helper");
var lowerNode = require("../lower-case.js");
describe('lower-case Node', function () {
  afterEach(function () { helper.unload(); });
  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "lower-case", name: "test name" }];
    helper.load(lowerNode, flow, function () {
      helper.getNode("n1").should.have.property('name', 'test name');
      done();
    });
  });
  it('should make payload lower case', function (done) {
    var flow = [{ id:"n1", type:"lower-case", name:"test name", wires:[["n2"]] }, { id:"n2", type:"helper" }];
    helper.load(lowerNode, flow, function () {
      var n2 = helper.getNode("n2"), n1 = helper.getNode("n1");
      n2.on("input", function (msg) { msg.should.have.property('payload', 'uppercase'); done(); });
      n1.receive({ payload: "UpperCase" });
    });
  });
});
```
