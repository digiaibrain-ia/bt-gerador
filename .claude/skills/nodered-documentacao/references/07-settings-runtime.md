# settings.js, configuração do runtime, logging e embedding

Fontes: `docs/user-guide/runtime/settings-file.md`, `configuration.md`, `logging.md`, `embedding.md` e o `settings.js` padrão do código-fonte Node-RED **5.0.7** (`packages/node_modules/node-red/settings.js`).

## Sumário
1. Arquivo de settings
2. Opções por seção (tabela completa)
3. editorTheme
4. externalModules
5. nodeDefaults
6. Logging
7. Embedding
8. Divergências entre site e código 5.0.7

## 1. Arquivo de settings
- `settings.js` no userDir (`~/.node-red`). Se não existir, o Node-RED copia um padrão. Outro arquivo: `--settings <arquivo>`.
- O log de partida mostra qual foi usado: `[info] Settings file  : /Users/nol/.node-red/settings.js`.
- É um módulo Node.js que exporta um objeto (pode conter qualquer JavaScript válido, executado na partida). Opções vêm comentadas com `//`; descomente para ativar (ex.: `flowFilePretty: true`).
- **Separe cada entrada por vírgula.** Erro de sintaxe impede o Node-RED de iniciar; o log indica onde.
- Padrão para copiar antes do primeiro start: github.com/node-red/node-red/blob/main/packages/node_modules/node-red/settings.js
- Código fora de `module.exports` é permitido (ex.: `process.env.FOO='World';`).

## 2. Opções por seção

### Arquivo de fluxos e diretório
| Opção | Descrição / padrão |
|---|---|
| `flowFile` | Arquivo de fluxos. Sem valor: `flows_<hostname>.json`. O settings padrão define `'flows.json'`. |
| `credentialSecret` | Chave própria para criptografar credenciais (senão usa chave gerada). `false` desativa a criptografia. **Depois de definida, não mude** — perde as credenciais existentes. |
| `flowFilePretty` | JSON dos fluxos em várias linhas (bom para controle de versão). Padrão do settings: `true`. |
| `userDir` | Diretório de dados do usuário (fluxos, credenciais, biblioteca). Padrão `$HOME/.node-red`. |
| `nodesDir` | Diretório(s) extra(s) de nós, string ou array. Padrão `$HOME/.node-red/nodes`. |

### Segurança (detalhes em `08-seguranca.md`)
`adminAuth`, `https` (objeto ou função), `httpsRefreshInterval` (horas), `requireHttps` (redireciona HTTP → HTTPS), `httpNodeAuth`, `httpStaticAuth`.

### Servidor
| Opção | Descrição / padrão |
|---|---|
| `uiPort` | Porta do editor. Padrão 1880 (settings padrão: `process.env.PORT || 1880`). Só standalone. |
| `uiHost` | Interface. Padrão `0.0.0.0` (todas IPv4); `"::"` para IPv6; `"127.0.0.1"` só local. Só standalone. |
| `apiMaxLength` | Tamanho máximo de requisição aceito pela API do runtime. Padrão `'5mb'`. |
| `httpServerOptions` | Opções do Express (app.settings). |
| `httpAdminRoot` | Raiz do editor. `false` desativa **todos** os endpoints admin (API e editor). Padrão `/`. |
| `httpAdminMiddleware` | Middleware (ou array) em todas as rotas admin. |
| `httpAdminCookieOptions` | Opções do cookie de sessão do adminAuth. |
| `httpNodeRoot` | Raiz dos endpoints de nós HTTP. `false` desativa. Padrão `/`. |
| `httpNodeCors` | CORS dos nós HTTP (ex.: `{origin: "*", methods: "GET,PUT,POST,DELETE"}`). |
| `httpNodeMiddleware` | Middleware antes de todos os HTTP In. `req.skipRawBodyParser = true` pula o rawBodyParser. |
| `httpStatic` | Diretório de conteúdo estático (ou array de `{path, root, options, cors, middleware}`). Servido em `/`; então mova o editor com `httpAdminRoot`, ou use `httpStaticRoot`. |
| `httpStaticRoot` | Prefixo para todas as rotas estáticas (ex.: `/static/`). |
| `httpStaticCors` | CORS padrão das rotas estáticas. |
| `proxyOptions` | `{ mode: "legacy" }` para lógica de proxy anterior à v4. |
| Proxy HTTP | Defina `http_proxy`/`HTTP_PROXY` (e `no_proxy`) **no sistema operacional**; no settings não tem efeito. |
| `https` | Opções TLS. Só standalone. |
| `disableEditor` | `true` não serve o editor; API admin continua. Padrão `false`. |

### Runtime
| Opção | Descrição / padrão |
|---|---|
| `lang` | Idioma: en-US (padrão), ja, de, zh-CN, zh-TW, ru, ko. |
| `diagnostics` | `{enabled, ui}` — endpoint `/diagnostics` e ação `show-system-info` no editor. Padrão ambos `true`; `false` desativa. |
| `runtimeState` | `{enabled, ui}` — permite parar/iniciar fluxos via `POST /flows/state` e botões no editor. Padrão ambos `false`. |
| `telemetry` | `{enabled, updateNotification}` — ver `11-projects-cli-telemetria.md`. |
| `logging` | Ver seção 6. |
| `contextStorage` | Stores de contexto (`03-contexto.md`). |
| `exportGlobalContextKeys` | `false` (padrão) esconde de `global.keys()`/barra Context as chaves vindas de `functionGlobalContext`. |
| `externalModules` | Ver seção 4. |

### Editor
`disableEditor`, `editorTheme` (seção 3), `adminAuth`, `paletteCategories` (ordem das categorias; padrão `['subflows', 'common', 'function', 'network', 'sequence', 'parser', 'storage']`; no settings 5.x fica em `editorTheme.palette.categories.order`).

### Nós
| Opção | Descrição / padrão |
|---|---|
| `fileWorkingDirectory` | Diretório base para caminhos relativos dos nós File. Padrão: diretório de trabalho do processo. |
| `functionExternalModules` | Módulos por Function node. Doc: padrão `false`; **settings 5.x traz `true`**. |
| `globalFunctionTimeout` | Timeout (s) aplicado a **todos** os Function. Padrão 0. |
| `functionTimeout` | Timeout (s) inicial de **novos** Function (depois é por nó). Padrão 0. |
| `functionGlobalContext` | Objetos no contexto global (ex.: `{ os: require('os') }` → `global.get("os")`). |
| `nodeMessageBufferMaxLength` | Máximo de mensagens que nós de sequência bufferizam. 0/ausente = sem limite. |
| `ui` | Caminho do node-red-dashboard relativo a `httpNodeRoot` (`{ path: "ui" }`); também `readOnly`, `middleware`, `ioMiddleware`. |
| `debugUseColors` | Colore a saída de console do Debug. |
| `debugMaxLength` | Máx. de caracteres enviados à barra Debug. 1000. |
| `debugStatusLength` | Máx. de caracteres do status sob o Debug. 32. |
| `execMaxBufferSize` | Buffer do Exec. 10000000 (10 MB). |
| `httpRequestTimeout` | Timeout do HTTP Request (ms). 120000. |
| `mqttReconnectTime` | Espera para reconectar MQTT (ms). Doc: 5000; settings 5.x: 15000. |
| `serialReconnectTime` | Reabrir porta serial (ms). Doc: 5000; settings 5.x: 15000. |
| `socketReconnectTime` | Reconectar TCP (ms). 10000. |
| `socketTimeout` | Timeout de socket TCP servidor (ms). Doc: 120000; settings: padrão sem timeout. |
| `tcpMsgQueueSize` | Mensagens em fila enquanto o TCP conecta. 1000. |
| `inboundWebSocketTimeout` | Timeout de WebSocket de entrada que não casa com nenhum nó (ms). 5000. |
| `tlsConfigDisableLocalFiles` | `true` impede o config TLS de usar arquivos locais para chaves/certificados. |
| `webSocketNodeVerifyClient` | `function(info[, callback])` para aceitar/recusar conexões WebSocket (`info.origin`, `info.req`, `info.secure`; callback `(result, code, reason)`). |

## 3. editorTheme (todas as partes opcionais)
```javascript
editorTheme: {
    page: { title, favicon, css, scripts: [...] },
    header: { title, image /* null remove */, url },
    deployButton: { type: "simple", label: "Save", icon },
    menu: { "menu-item-import-library": false, "menu-item-export-library": false,
            "menu-item-keyboard-shortcuts": false,
            "menu-item-help": { label: "...", url: "..." } },
    tours: false,            // desliga o tour de boas-vindas
    userMenu: false,         // esconde menu do usuário mesmo com adminAuth
    login: { image },        // 256x256
    logout: { redirect: "http://example.com" },
    palette: {
        editable: true,      // obsoleto: use externalModules.palette.allowInstall
        catalogues: ['https://catalogue.nodered.org/catalogue.json'],
        theme: [ { category: ".*", type: ".*", color: "#f0f" } ],   // cores por RegExp
        categories: { order: [...] }
    },
    projects: { enabled: false, workflow: { mode: "manual" /* ou "auto" */ } },
    theme: "",               // temas: github.com/node-red-contrib-themes/theme-collection
    codeEditor: { lib: "monaco" /* "ace" | "basic" */, options: { theme: "vs", fontSize, fontFamily, fontLigatures } },
    markdownEditor: { mermaid: { enabled: true } },
    mermaid: { theme: "default" },
    multiplayer: { enabled: false }
}
```

## 4. externalModules
```javascript
externalModules: {
    autoInstall: false,        // instalar módulos ausentes automaticamente
    autoInstallRetry: 30,      // segundos entre tentativas
    palette: {                 // Palette Manager
        allowInstall: true, allowUpdate: true, allowUpload: true,  // upload de .tgz
        allowList: ['*'], denyList: [],
        allowUpdateList: ['*'], denyUpdateList: []
    },
    modules: {                 // dependências de nós como o Function
        allowInstall: true, allowList: [], denyList: []
    }
}
```
`*` é curinga.

## 5. nodeDefaults (4.1.9+)
Muda os valores iniciais de nós recém-arrastados (não trava nada, não afeta nós existentes):
```javascript
nodeDefaults: {
    debug: { complete: true, console: true, active: false },
    inject: { props: [{"p":"payload"}], payload: "Hello World", payloadType: "str" }
}
```
Nomes das propriedades: selecione um nó → barra Information → "show more".

## 6. Logging
```javascript
logging: {
    console: { level: "info", metrics: false, audit: false },
    myCustomLogger: {
        level: 'debug', metrics: true,
        handler: function(settings) {          // chamado uma vez na partida
            return function(msg) { console.log(msg.timestamp, msg.event); }
        }
    }
}
```
- Níveis: `fatal`, `error`, `warn`, `info` (padrão), `debug`, `trace`, `off` (desliga log, não afeta metrics/audit). Cada nível inclui os mais graves. Em dispositivos com flash limitada, `fatal` minimiza escrita.
- `metrics: true` — eventos de receive/send de cada nó (`[metric] {"event":"node.inject.send","msgid":...}`) e memória a cada 15 s (`runtime.memory.rss`, `heapTotal`, `heapUsed`).
- `audit: true` — acessos à Admin API (evento, endpoint, IP, timestamp, e usuário se `adminAuth`), ex.: `{"event":"flows.set","type":"full","version":"v2",...}`.
- Vários loggers customizados; o único nome reservado é `console`. A doc mostra um exemplo enviando metrics ao Logstash via TCP (sem reconexão — só ilustrativo).
- No Pi como serviço: `node-red-log` mostra o log.

## 7. Embedding (Node-RED dentro de outra aplicação Express)
```javascript
var http = require('http');
var express = require("express");
var RED = require("node-red");
var app = express();
app.use("/", express.static("public"));
var server = http.createServer(app);
var settings = {
    httpAdminRoot: "/red",
    httpNodeRoot: "/api",
    userDir: "/home/nol/.nodered/",
    functionGlobalContext: { }    // habilita contexto global
};
RED.init(server, settings);
app.use(settings.httpAdminRoot, RED.httpAdmin);
app.use(settings.httpNodeRoot, RED.httpNode);
server.listen(8000);
RED.start();
```
- Adicione `node-red` (e nós usados) às dependências do `package.json` da aplicação.
- O `settings.js` **não é usado**: passe tudo ao `RED.init`.
- Ignorados (ficam por conta do seu Express): `uiHost`, `uiPort`, `httpAdminAuth`, `httpNodeAuth`, `httpStatic`, `httpStaticAuth`, `https`.
- API de módulo: `15-apis-runtime-editor.md`.

## 8. Divergências site × código 5.0.7
| Item | Página de configuração | settings.js 5.0.7 |
|---|---|---|
| Editor de código padrão | "Defaults to ace" | `lib: "monaco"` (padrão); opções monaco/ace/basic |
| `functionExternalModules` | padrão `false` | settings traz `true` |
| `mqttReconnectTime` / `serialReconnectTime` | 5000 | 15000 no settings |
| Opções não documentadas na página | — | `requireHttps`, `apiMaxLength`, `httpServerOptions`, `httpStaticRoot`, `proxyOptions`, `lang`, `diagnostics`, `runtimeState`, `exportGlobalContextKeys`, `globalFunctionTimeout`, `nodeMessageBufferMaxLength`, `debugUseColors`, `debugStatusLength`, `execMaxBufferSize`, `httpRequestTimeout`, `tcpMsgQueueSize`, `inboundWebSocketTimeout`, `tlsConfigDisableLocalFiles`, `webSocketNodeVerifyClient`, `fileWorkingDirectory`, `multiplayer`, `markdownEditor` |

Valores escritos no settings.js prevalecem sobre o padrão interno. Em caso de dúvida, confira o settings.js da instalação.
