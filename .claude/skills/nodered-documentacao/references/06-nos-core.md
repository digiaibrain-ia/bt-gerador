# Nós core — referência completa

Fontes: `docs/user-guide/nodes.md` e a ajuda oficial embutida no editor (código Node-RED 5.0.7, `packages/node_modules/@node-red/nodes/locales/en-US/**`). É o mesmo texto da aba Help do editor.

Nós como Modbus, S7, OPC UA, Serial, Dashboard, SQL **não são core** — vêm de pacotes do Flow Library e têm documentação própria.

## Sumário por categoria
- **common**: inject, debug, complete, catch, status, link in, link out, link call, comment, (global-config, unknown)
- **function**: function, switch, change, range, template, delay, trigger, exec, filter (rbe)
- **network**: mqtt in, mqtt out, mqtt-broker, http in, http response, http request, websocket in/out (+ listener/client), tcp in, tcp out, tcp request, udp in, udp out, tls-config, http proxy
- **parser**: csv, html, json, xml, yaml
- **sequence**: split, join, sort, batch
- **storage**: file (write), file in, watch

Convenção: **Entradas** = propriedades de `msg` que o nó lê; **Saídas** = que ele define.

---
## COMMON

### inject
Injeta mensagem manualmente (botão) ou periodicamente.
- Saídas: `payload` (vários tipos; padrão **timestamp em ms** desde 1970), `topic` (opcional). Desde 1.1.0 pode definir **qualquer propriedade**.
- Payload: string, número, booleano, objeto JS, Buffer, contexto flow/global, timestamp.
- Disparo: manual; **intervalo**; "interval between times" e "at a specific time" (usam **cron**: "20 minutos" = hh:00, hh:20, hh:40 — não "daqui a 20 min"; para isso use *interval*); **uma vez ao iniciar** os fluxos.
- Intervalo máximo ~596 h (24 dias); acima de 1 dia prefira um nó agendador que resista a quedas/reinícios.
- Quebra de linha em string: gere com Function ou Template.

### debug
Mostra na barra Debug `msg.payload` (padrão), outra propriedade, a mensagem completa ou o resultado de JSONata; opcionalmente no **log do runtime** e/ou texto curto (32 caracteres) no **status** do nó.
- Mostra hora, nó de origem e tipo; clique no id revela o nó; Buffers como bytes ou string.
- Botão liga/desliga. Desative ou remova Debug sem uso.

### complete
Dispara um fluxo quando **outro nó termina** de tratar uma mensagem (ex.: após nó de e-mail, que não tem saída).
- Precisa selecionar os nós-alvo (não há modo "todos" como no Catch).
- Só funciona com nós que implementam `done()` (recurso do 1.0).

### catch
Captura erros lançados por nós **da mesma aba**.
- Saídas: `error.message`, `error.source.id`, `error.source.type`, `error.source.name`.
- Padrão: todos os nós da aba; ou nós específicos; ou só erros **não capturados** por um Catch "direcionado".
- Todos os Catch compatíveis recebem a mensagem. Em subflow: Catch interno primeiro; senão sobe para a aba da instância. `msg.error` pré-existente vai para `msg._error`.
- Detalhes (incluindo `count` e laço de 9 repetições): `04-erros-status.md`.

### status
Relata mudanças de status de outros nós da mesma aba (todos ou selecionados).
- Saídas: `status.text`, `status.source.type`, `status.source.id`, `status.source.name` (e `fill`, `shape`). **Não gera `payload`.**

### link in / link out / link call
Fios virtuais entre fluxos.
- **link in**: conecta a qualquer `link out` de qualquer aba; age como se estivessem ligados. Fios só aparecem com o nó selecionado; para outra aba mostra nó virtual clicável.
- **link out**: modo "enviar para todos os `link in` conectados" **ou** modo **return** (devolve ao `link call` que iniciou).
- **link call**: chama um fluxo que começa em `link in` e termina em `link out` em modo return; espera a resposta e a envia adiante. **Timeout padrão 30 s** → erro capturável por Catch.
  - "Dynamic target": `msg.target` = nome ou id do `link in`. Mesmo id → chamado; **dois ou mais com o mesmo nome → erro**.
- **Links não entram nem saem de subflows**; `link call` não chama `link in` dentro de subflow.
- No Function: `node.linkcall(...)` (5.0+, timeout padrão 5 s) — ver `02-function-node.md`.

### comment
Comentário no fluxo; o painel aceita **Markdown**, exibido na barra de informação.

### global-config / unknown
- `global-config`: guarda configuração global dos fluxos (ex.: variáveis de ambiente globais).
- `unknown`: tipo não instalado. Se fizer deploy, a configuração é preservada, mas **o fluxo não inicia** até instalar o tipo. Instale pelo Manage Palette ou `npm install <modulo>`, reinicie e reimporte. Pode ser dependência faltando — veja o log de partida.

---
## FUNCTION

### function
JavaScript contra `msg`. Retorna mensagem(ns) ou nada (para o fluxo). Abas **On Start** (se retornar Promise, só processa após resolver) e **On Stop**.
- Retorno: objeto → saída 1; array → uma posição por saída; array dentro do array → várias mensagens; `null` → nada.
- **Não chame `node.send` na aba de setup** — os nós seguintes podem ainda não estar prontos.
- `node.log/warn/error`; `node.error("Error", msg)` aciona Catch. `node.id`, `node.name`, `node.outputCount`. `env.get("MY_ENV_VAR")`.
- Guia completo: `02-function-node.md`.

### switch
Roteia por regras avaliadas sobre propriedade de msg, contexto flow/global, **variável de ambiente** ou JSONata.
- Regras: **Value**, **Sequence** (sobre sequências do Split), **Expression** JSONata (casa se true), **Otherwise**.
- Envia para todas as saídas que casam, ou para na primeira.
- `is true/false` e `is null` são **estritos** (sem conversão de tipo). `is empty`/`is not empty` testam tamanho de String/Array/Buffer ou nº de propriedades de Object; **nunca** passam com boolean, null ou undefined.
- Por padrão não altera `msg.parts`. Opção **recreate message sequences**: cria nova sequência por regra (bufferiza a sequência inteira; limite `nodeMessageBufferMaxLength`).

### change
Set, Change, Delete, Move em msg, contexto flow ou global; várias regras em ordem.
- Change: busca/substituição; com regex, "replace with" aceita grupos (`$1`); **só muda o tipo se a correspondência for completa**.
- Tipo "expression" = JSONata.

### range
Mapeia número para outra faixa (linear).
- Entrada `payload` **deve** ser número (tenta converter; senão rejeita).
- Modos (ex.: entrada 0–10 → 0–100, valor 12): **scale** → 120; **limit** (limitar à faixa) → 100; **wrap** → 20; **drop** (descarta fora da faixa de entrada) → sem saída. Opção de arredondar.
- Ideal para escalar leituras brutas (ex.: 0–27648 de um analógico → 0–100 %).

### template
Define uma propriedade a partir de um template (Mustache por padrão; pode desligar).
- Entradas: o `msg`; `template` (se não configurado no nó).
- `Hello {{payload.name}}. Today is {{date}}` com `{date:"Monday", payload:{name:"Fred"}}` → `Hello Fred. Today is Monday`.
- Contexto: `{{flow.name}}`, `{{global.name}}`; store específico: `{{flow[store].name}}`.
- Mustache **escapa** HTML/não alfanuméricos; use `{{{triplo}}}` para não escapar.
- Trocar delimitadores: primeira linha `{{=[[ ]]=}}`.
- Env: `{{env.COLOUR}}`. Pode converter resultado JSON/YAML em objeto.

### delay
Atrasa cada mensagem ou limita taxa.
- Entradas: `delay` (ms, se permitido sobrescrever), `rate` (ms entre mensagens, se permitido; fica valendo até mudar/reset/restart), `reset` (limpa tudo **sem enviar**), `flush` (número = libera N; outro tipo = libera todas), `toFront` (true, em rate limit: vai para a frente da fila; com `msg.flush=1` reenvia na hora).
- **Delay**: fixo, aleatório numa faixa, ou por mensagem; cada mensagem independente.
- **Rate limit**: distribui uniformemente (3 msgs em 12 s = 1 a cada 4 s); status mostra a fila; pode **descartar intermediárias**. Pode agrupar **por `msg.topic`** (intermediárias descartadas automaticamente; a cada intervalo libera a mais recente de todos os tópicos ou do próximo tópico).
- **Burst**: passa até o limite na hora; excedentes descartados ou enviados à 2ª saída até o período acabar (status verde = pode enviar, vermelho = bloqueado).
- Profundidade máxima da fila: `nodeMessageBufferMaxLength` no settings.

### trigger
Ao ser disparado envia uma mensagem e, opcionalmente, uma segunda após um tempo — salvo se estendido ou resetado.
- Padrão: envia `payload` = `1`, espera **250 ms**, envia `0` (ex.: piscar LED).
- Payloads configuráveis, inclusive "nada". **Watchdog**: primeira = nada + "extend delay" a cada mensagem → só envia se nada chegar no intervalo.
- String aceita Mustache. `msg.delay` (ms) sobrescreve, se habilitado.
- Reset: `msg.reset` ou `payload` igual ao configurado → cancela timeout/repetição sem enviar.
- Pode **reenviar em intervalo** até ser resetado.
- Pode tratar **streams separados** por uma propriedade (padrão `msg.topic`); status mostra nº de streams.

### exec
Executa comando do sistema.
- Entradas: `payload` (anexado ao comando, se configurado), `kill` (sinal: `SIGINT`, `SIGQUIT`, `SIGHUP`...; vazio = `SIGTERM`), `pid` (obrigatório se houver vários processos).
- Saídas: 1 stdout, 2 stderr (ambos com `rc` em modo exec), 3 código de retorno `{code: 0}` (+ `message`, `signal` em erro).
- Modo **exec** (espera terminar) ou **spawn** (saída linha a linha enquanto roda; objeto de retorno na 3ª saída).
- Parâmetros com espaço entre aspas. Saída é string, ou Buffer se houver não-UTF8. Status mostra PID (lido pelo Status node). Timeout mata o processo. "Hide console" no Windows. Python: use `-u` para não bufferizar. Buffer máximo: `execMaxBufferSize`.

### filter (rbe — report by exception)
Só passa se o valor mudou.
- Entradas: `payload` (RBE aceita número, string, objeto simples; demais modos exigem número), `topic` (por tópico), `reset` (limpa valor guardado do tópico ou de todos).
- **RBE**: bloqueia até mudar; pode ignorar o valor inicial.
- **Deadband**: bloqueia **a menos que** a variação seja > (ou ≥) ± faixa. **Narrowband**: bloqueia **se** a variação for maior — descarta outliers de sensor. Ambos aceitam %; comparam com a última saída válida ou com a última entrada.
- Funciona **por `msg.topic`** (configurável): um nó atende vários tópicos. Muito útil para reduzir gravações em banco a partir de leituras cíclicas de CLP.

---
## NETWORK

### mqtt in
Assina tópico(s) de um broker.
- Saídas: `payload` (string, ou Buffer se binário), `topic` (separador `/`), `qos` (0 no máximo uma vez, 1 ao menos uma, 2 exatamente uma), `retain` (true = retido, pode ser antigo). MQTTv5: `responseTopic`, `correlationData`, `contentType`, `userProperties`, `messageExpiryInterval`.
- Curingas `+` (um nível) e `#` (vários). Vários nós MQTT podem compartilhar a conexão.
- **Assinatura dinâmica** (opcional; o nó ganha entrada): `msg.action` = `"connect"`, `"disconnect"`, `"getSubscriptions"`, `"subscribe"`, `"unsubscribe"`; `msg.topic` = string, `{topic, qos}` ou array; `msg.broker` (no connect) sobrescreve `broker`, `port`, `url`, `username`, `password` — se já conectado dá erro, a menos que tenha `force`.
- Opção de formato de saída (string, Buffer, JSON parseado — 0.19+).

### mqtt out
Publica.
- Entradas: `payload` (string/Buffer; **objeto vira JSON**; sem payload nada é enviado; para mensagem vazia use string vazia), `topic`, `qos` (padrão 0), `retain` (padrão false); MQTTv5: `responseTopic`, `correlationData`, `contentType`, `userProperties`, `messageExpiryInterval`, `topicAlias`.
- Tópico/QoS/retain no nó ou, se em branco, via `msg`. Limpar retido: mensagem vazia com retain.
- Controle dinâmico: `msg.action` `"connect"`/`"disconnect"` (+ `msg.broker`); mensagens de controle não publicam.

### mqtt-broker (config)
Uma conexão reutilizada por MQTT In/Out. Client ID aleatório se vazio e Clean Session; se definido, **único no broker**. **Birth** (publica ao conectar), **Close** (antes de fechar normalmente — redeploy/desligamento), **Will** (broker publica se a conexão cair). WebSocket: servidor como URI completo (`ws://example.com:4000/mqtt`). Reconexão: `mqttReconnectTime`.

### http in
Cria endpoint HTTP.
- Saídas: `payload` (GET: objeto da query string; senão corpo), `req` (`body`, `headers`, `query`, `params`, `cookies`, `files` se upload habilitado), `res` (**não use diretamente; deve chegar intacto ao HTTP Response**).
- Caminho fixo (`/user`) ou com parâmetros (`/user/:name` → `msg.req.params`). Corpo convertido pelo content-type (ex.: JSON → objeto) ou, se desativado, Buffer.
- **Não responde sozinho**: o fluxo precisa de um **HTTP Response**.

### http response
- Entradas: `payload` (corpo), `statusCode` (padrão 200), `headers`, `cookies`.
- statusCode/headers definidos **no nó não podem ser sobrescritos** por `msg`.
- Cookies: `{name:'nick', session:{value:'1234', maxAge:900000}}`; opções `domain`, `expires`, `maxAge`, `path`, `value`; `value: null` apaga.

### http request
- Entradas: `url`, `method` (`GET`, `PUT`, `POST`, `PATCH`, `DELETE` — se não configurados no nó), `headers` (os do nó sobrescrevem), `cookies`, `payload` (corpo), `rejectUnauthorized: false` (aceita certificado autoassinado), `followRedirects: false`, `requestTimeout` (ms; sobrescreve `httpRequestTimeout`).
- Saídas: `payload` (string, JSON parseado ou Buffer — configurável), `statusCode` (ou código de erro), `headers`, `responseUrl`, `responseCookies`, `redirectList`.
- URL com Mustache: `example.com/{{{topic}}}` (triplo não escapa `/`, `&`).
- Pode codificar `msg.payload` (objeto) como query string em GET.
- Proxy: `http_proxy` no ambiente + reiniciar, ou config **http proxy** (tem precedência; hosts ignorados não usam proxy).
- **Vários HTTP Request em sequência**: o primeiro coloca os cabeçalhos da resposta em `msg.headers`, que o próximo usaria como cabeçalhos da requisição (se não alterado, é ignorado). Para enviar cabeçalhos próprios, apague ou zere `msg.headers = {}` antes.
- Objeto em `payload` → `application/json` automático. Formulário: `msg.headers["content-type"] = "application/x-www-form-urlencoded"`. Upload: `multipart/form-data` com `payload = {"KEY": {"value": CONTEUDO, "options": {"filename": "NOME"}}}`.

### websocket in / out (+ websocket-listener / websocket-client)
- **in**: dados em `msg.payload`; ou espera JSON e usa o objeto **como a mensagem inteira**.
- **out**: envia `msg.payload` (ou o `msg` inteiro como JSON). Se a mensagem veio de um WebSocket In, responde **só ao cliente de origem**; senão faz broadcast. Para broadcast de mensagem vinda de WebSocket In, apague `msg._session`.
- listener: servidor no caminho; client: conecta numa URL. `webSocketNodeVerifyClient`, `inboundWebSocketTimeout` no settings.

### tcp in / tcp out / tcp request
- **tcp in**: conecta a porta remota ou aceita conexões. Portas < 1024 podem exigir root/admin.
- **tcp out**: conecta, aceita conexões ou **responde** a um TCP In. Só envia `msg.payload`; opção de decodificar Base64 para binário. Sem `msg._session` → todos os clientes. Em reply-to, `msg.reset = true` reinicia a conexão de `_session.id` (ou todas).
- **tcp request**: envia `payload` e lê resposta — por contagem de caracteres, até um caractere, por tempo após a 1ª resposta, "sit and wait" (fica conectado) ou envia e fecha. `msg.reset = true` ou `"host:port"` força reconexão. Resposta em `payload` como **Buffer** (use `.toString()`). Host/porta vazios → `msg.host`/`msg.port` em cada mensagem.
- Settings: `socketReconnectTime`, `socketTimeout`, `tcpMsgQueueSize`.

### udp in / udp out
- **in**: `payload` Buffer, string ou base64; `msg.ip` e `msg.port` de origem; multicast.
- **out**: envia `payload` para host/porta; `msg.ip`/`msg.port` podem definir destino, mas **o configurado no nó tem precedência**; broadcast (endereço local ou 255.255.255.255); multicast. Portas < 1024 e broadcast podem exigir root.

### tls-config / http proxy (config)
Opções de conexão TLS (certificados; `tlsConfigDisableLocalFiles` bloqueia arquivos locais) e de proxy HTTP (lista de hosts ignorados).

---
## PARSER

### csv
CSV ↔ objeto, nos dois sentidos.
- String → objeto por linha; uma mensagem por linha (com `parts`) ou uma com array.
- Objeto → CSV; array simples → uma linha; array de arrays/objetos → várias linhas.
- Template de colunas (sempre **separado por vírgula**, mesmo com outro separador de dados), ou da primeira linha; em branco usa `msg.columns` ou as propriedades na ordem da primeira linha. Array: template só gera linha de títulos.
- Parser RFC4180 (template compatível; erros capturáveis para cabeçalho/dados malformados).
- Opções: converter números, incluir strings vazias, incluir nulls. Aceita entrada multi-parte (`parts`, ex.: do File In ou Split). Cabeçalho só uma vez: `msg.reset` reenvia.

### html
Extrai elementos de HTML em `payload` com seletor CSS/jQuery (css-select). `msg.select` se não configurado. Saída: array numa mensagem ou uma mensagem por elemento (com `parts`).

### json
JSON ↔ objeto. Entradas `payload`, `schema` (JSON Schema opcional; removido antes de seguir). Falha na validação → Catch recebe `schemaError` (array). Pode formatar a string; pode **forçar** sempre objeto (útil após HTTP In com content-type errado) ou sempre string (nesse caso não valida nem reformata a string recebida). Qualquer propriedade, não só payload.

### xml
XML ↔ objeto (xml2js; `msg.options` repassa opções). Atributos em `$`, texto em `_` (nomes configuráveis): `<p class="tag">Hello World</p>` → `{"p":{"$":{"class":"tag"},"_":"Hello World"}}`.

### yaml
YAML ↔ objeto.

---
## SEQUENCE

### split
Divide uma mensagem em sequência.
- String/Buffer: por caractere (padrão `\n`), sequência de bytes ou tamanho fixo. Array: elementos ou blocos. Objeto: uma mensagem por chave/valor (pode copiar a chave para `msg.topic`).
- `msg.parts`: `id`, `index`, `count` (se conhecido), `type` (string/array/object/buffer), `ch` (separador), `key` (objeto), `len` (tamanho fixo).
- **Streaming mode**: remonta streams (ex.: serial com comandos terminados em `\n` que chegam partidos); guarda o pedaço final e junta à próxima mensagem. Não define `parts.count` → **não serve para Join automático**.

### join
Junta sequências.
- **Automatic**: desfaz um Split usando `parts`.
- **Manual**: resultado string/Buffer (com separador), array (propriedade ou mensagem inteira), objeto chave/valor (chave de uma propriedade, ex.: `topic`), objeto mesclado. Demais propriedades vêm da última mensagem. `count` de mensagens; para objeto, após atingir pode enviar a cada nova. `timeout` envia o que tiver (reinicia com `msg.restartTimeout`). `msg.complete` finaliza e envia; `msg.reset` descarta o parcial.
- **Reduce**: JSONata acumulada — `$A` acumulado, `$I` índice, `$N` total; valor inicial; fix-up opcional; ordem normal ou reversa. Média: reduce `$A+payload`, inicial `0`, fix-up `$A/$N`.
- Bufferiza (limite `nodeMessageBufferMaxLength`).

### sort
Ordena array numa propriedade ou reordena uma sequência (precisa de `parts`). Ascendente/descendente, numérico opcional; chave = valor ou JSONata. Bufferiza (limite no settings).

### batch
Cria sequências: **número de mensagens** (com overlap), **intervalo de tempo** (opcional mensagem vazia se nada chegar), **concatenar sequências** (cada mensagem com `msg.topic` e `msg.parts`; ordem por lista de tópicos). `msg.reset` descarta o buffer.

---
## STORAGE

### file (escrever)
Escreve `payload` em arquivo (anexar, com `\n` opcional; ou sobrescrever) ou **apaga** o arquivo.
- `msg.filename` (padrão, configurável) — com nome dinâmico o arquivo é **fechado a cada escrita**; para desempenho use nome fixo.
- Binário (imagem): sobrescrever e sem newline. Codificação configurável (ou `msg.encoding`). Após escrever, repassa a mensagem de entrada. Caminhos relativos: `fileWorkingDirectory`.

### file in
Lê arquivo como string ou Buffer.
- `msg.filename` (padrão); caminho absoluto recomendado (relativo ao diretório de trabalho do processo). Windows: escape as barras (`\\Users\\myUser`).
- Pode dividir texto em linhas ou binário em blocos (~64k Linux/Mac, ~41k Windows), com `parts`. Codificação para string. Erros → Catch.

### watch
Observa diretórios/arquivos (lista separada por vírgula; aspas se tiver espaço; Windows com `\\`). Saídas: `payload` e `filename` (caminho completo), `topic` (lista observada), `file` (nome curto), `type` (file/directory), `size` (bytes). Precisa existir; se apagado e recriado pode deixar de ser observado.

---
## Valores internos no JSON do fluxo (5.0.7)
O rótulo do editor nem sempre é o valor gravado no JSON. Ao **escrever** um fluxo, use estes valores (extraídos do código; a lista completa de propriedades por tipo está em `assets/core-node-defaults.json`, e `scripts/validate_flow.py` confere):

| Nó | Propriedade | Valores (rótulo no editor → valor) |
|---|---|---|
| range | `action` | scale → `scale`; limitar à faixa → **`clamp`**; wrap → **`roll`**; drop → `drop` |
| filter (tipo `rbe`) | `func` | `rbe`, `rbei` (ignora valor inicial), `deadband`, `deadbandEq` (≥), `narrowband`, `narrowbandEq` |
| filter (tipo `rbe`) | `inout` | `out` = compara com a última **saída** válida; `in` = com a última **entrada** |
| filter (tipo `rbe`) | `septopics` / `topi` | `true` = separado por tópico; `topi` = nome da propriedade (padrão `topic`) |
| trigger | `op1type` / `op2type` | tipos TypedInput (`str`, `num`, `bool`, `json`, `bin`, `date`, `env`, `flow`, `global`) + **`nul`** (nada), `pay` (payload original), `payl` (último payload, só op2) |
| trigger | `units` / `bytopic` | `ms`, `s`, `min`, `hr` / `all`, `topic` |
| trigger | `extend`, `overrideDelay`, `duration` | extend = reinicia a cada msg; `duration` negativo = repetir o envio a cada intervalo |
| delay | `pauseType` | `delay` (fixo), `delayv` (por `msg.delay`), `random`, `rate` (todas, espaçamento uniforme), `burst`, `queue` (por tópico, "um tópico de cada vez"), `timed` (por tópico, "todos os tópicos") |
| delay | `drop` / `outputs` | enfileirar → `drop:false`; descartar → `drop:true`; enviar à 2ª saída → `drop:true` + `outputs:2` |
| delay | `timeoutUnits` / `rateUnits` | `milliseconds`, `seconds`, `minutes`, `hours`, `days` / `second`, `minute`, `hour`, `day` |
| join | `mode` / `build` | `auto`, `custom` (manual), `reduce` / `string`, `buffer`, `array`, `object`, `merged` |
| link out | `mode` | `link` (enviar aos link in) ou `return` (responder ao link call) |
| link call | `linkType` / `timeout` | `static` ou `dynamic` / segundos (padrão 30) |
| http request | `method` / `ret` / `paytoqs` | `GET`, `POST`, `PUT`, `DELETE`, `HEAD`, `use` (via `msg.method`) / `txt`, `bin`, `obj` / `ignore`, `query`, `body` |
| mqtt in | `datatype` / `qos` / `rh` | `auto-detect`, `auto`, `buffer`, `utf8`, `json`, `base64` / `0`–`2` / retain handling `0`–`2` |
| csv | `multi` / `hdrout` | `one`, `mult` / `none`, `all`, `once` |
| inject | `props`, `repeat` (s, string), `crontab`, `once`, `onceDelay` | `props: [{"p":"payload"},{"p":"topic","vt":"str"}]` + `payload`/`payloadType` e `topic` no nível do nó |

---
## Padrões úteis combinando nós (industrial)
- **Polling periódico**: inject (interval) → nó de leitura do protocolo → function/range (escala) → filter (deadband) → gravação.
- **Watchdog de comunicação**: trigger (nada, extend, timeout N s) após a leitura → alarme se parar de chegar.
- **Evitar inundar o banco**: filter por tópico/deadband ou delay em rate limit por tópico.
- **Agrupar leituras de várias fontes numa linha de tabela**: `msg.topic` por fonte + join manual (objeto chave/valor, count N).
- **Retry**: catch → delay → volta ao nó que falhou (ver `16-cookbook.md`).
