---
name: nodered-documentacao
description: Documentação oficial completa do Node-RED (nodered.org/docs + cookbook + ajuda dos nós core, versão 5.0.7) em PT-BR. Use SEMPRE que o assunto for Node-RED — criar, revisar ou depurar fluxos; escrever código de Function node; usar contexto, variáveis de ambiente, Catch/Status; configurar settings.js, segurança (adminAuth, HTTPS), Docker, Raspberry Pi, Windows ou serviço; Projects/git; criar nós customizados ou subflows empacotados; Admin HTTP API; hooks e storage; ou montar um fluxo JSON importável — mesmo que o usuário só diga "flow", "nó inject/delay/trigger/mqtt/http", "msg.payload", "deploy" ou peça para "subir dados do PLC/Modbus/MQTT para o banco" via Node-RED.
---

# Node-RED — documentação oficial

Esta skill contém a documentação oficial do Node-RED reescrita em português, lida no original em 29/09/2026:
- site `nodered.org/docs` (repositório `node-red/node-red.github.io`, 141 páginas);
- `cookbook.nodered.org` (todas as receitas);
- a ajuda embutida de cada nó core e o `settings.js` padrão do código-fonte **Node-RED 5.0.7**.

Use as referências para responder com precisão em vez de confiar na memória: o Node-RED muda entre versões (ex.: `node.linkcall` só existe na 5.x; o editor de código padrão passou a ser o Monaco) e detalhes errados quebram fluxos em produção.

## Como usar
1. Identifique o tema na tabela abaixo e **leia o arquivo de referência** correspondente antes de responder (só os que o assunto pede; eles são independentes).
2. Responda em português, mantendo identificadores exatos (`msg.payload`, `node.send`, `httpNodeRoot`...).
3. Quando algo depende de versão, diga a versão (as referências anotam "2.1+", "3.1+", "5.0+" etc.).
4. Se o usuário precisar de detalhe que a referência não tem, diga isso e aponte o link oficial (cada referência cita a página de origem) em vez de inventar.

| Assunto | Referência |
|---|---|
| Glossário (nó, fluxo, config node, subflow, palette...), estrutura de `msg`, JSON, Change, sequências e `msg.parts` | `references/01-conceitos-mensagens.md` |
| Function node: retorno, várias saídas, async com `node.send`/`node.done`, On Start/On Stop, log, contexto, status, módulos externos, timeout, `node.linkcall` | `references/02-function-node.md` |
| Contexto node/flow/global, `$parent.`, stores memory/localfilesystem, persistência | `references/03-contexto.md` |
| Erros: Catch, `msg.error`, laço de 9 repetições, subflows, uncaughtException, Status node | `references/04-erros-status.md` |
| Variáveis de ambiente: `${VAR}`, TypedInput, `$env()`, `env.get`, subflow/grupo/fluxo/global, serviço, `NR_*` | `references/05-variaveis-ambiente.md` |
| **Todos os nós core** (inject, debug, complete, catch, status, link, function, switch, change, range, template, delay, trigger, exec, filter/rbe, mqtt, http, websocket, tcp, udp, csv, html, json, xml, yaml, split, join, sort, batch, file, watch) | `references/06-nos-core.md` |
| settings.js completo, opções de runtime/editor/nós, editorTheme, externalModules, nodeDefaults, logging, embedding, diferenças site × 5.0.7 | `references/07-settings-runtime.md` |
| Segurança: HTTPS e renovação, adminAuth (senha bcrypt, OAuth, permissões, tokens, usuário padrão), httpNodeAuth, middleware | `references/08-seguranca.md` |
| Editor: abas, nós, config nodes, fios, grupos, subflows, seleção, busca (`is:`/`uses:`), import/export, barras laterais, atalhos | `references/09-editor.md` |
| Instalação: versões do Node.js, npm, linha de comando, Raspberry Pi, Windows, Docker/compose, boot (systemd/PM2/NSSM), Android, BeagleBone, AWS, Azure, código-fonte | `references/10-instalacao.md` |
| Palette via npm, CLI `node-red admin`, Projects (git), telemetria | `references/11-projects-cli-telemetria.md` |
| Boas práticas: organizar abas, link × subflow, design de mensagem, documentar fluxos | `references/12-boas-praticas-fluxos.md` |
| Criar nós: .js/.html, propriedades, validação, TypedInput, credenciais, aparência, status, config nodes, ajuda, i18n, empacotar/publicar, subflow como módulo, testes | `references/13-criando-nos.md` |
| Admin HTTP API: autenticação por token, todos os endpoints, `/flows` v2 com `rev`, tipos de deploy, erros | `references/14-admin-api.md` |
| Hooks, Storage API, Context Store API, Library Store, RED.actions/events/notify/sidebar, widgets, temas, API de módulo, `RED.util` | `references/15-apis-runtime-editor.md` |
| Cookbook: receitas de mensagens, controle de fluxo, erros, formatos, HTTP, MQTT | `references/16-cookbook.md` |
| Tutoriais, FAQ (GPIO, Arduino), onde pedir ajuda | `references/17-tutoriais-faq.md` |
| Validar um fluxo JSON / propriedades exatas de cada nó core | `scripts/validate_flow.py` + `assets/core-node-defaults.json` |

Perguntas que cruzam temas (ex.: "fluxo HTTP que lê do contexto e trata erro") → leia as 2–3 referências envolvidas.

## Princípios que valem para quase toda resposta
Estes vêm da própria documentação; aplique-os ao escrever ou revisar fluxos:

- **Preserve a mensagem.** Nós e Functions devem alterar e devolver o `msg` recebido, não criar outro. Criar um novo perde propriedades — no par HTTP In/Response isso quebra a resposta, porque `msg.res` precisa chegar intacto.
- **Dado principal em `msg.payload`, metadados em outras propriedades**, com nomes autoexplicativos. Evite `reset` e `parts`, que alguns nós interpretam. `msg.topic` identifica a origem (Delay, Filter, Join e Trigger podem agir por tópico).
- **Código assíncrono no Function**: `node.send(msg)` e depois `node.done()`, terminando com `return;`. Para acionar um Catch, use `node.error("texto", msg)` com a mensagem como 2º argumento.
- **Contexto**: prefira `flow` a `global`. O padrão é só memória e zera no restart; para persistir, configure `contextStorage` com `localfilesystem` (grava a cada 30 s). Para compartilhar entre instâncias Node-RED, use MQTT ou banco.
- **Erros**: nem toda falha é erro (ex.: MQTT desconectado muda **status**). Combine Catch e Status, posicione de forma consistente e dê nome a cada Catch.
- **Segredos fora do fluxo**: use variáveis de ambiente (`${VAR}` só funciona como valor inteiro da propriedade) e credenciais de nó. Defina `credentialSecret` e nunca o altere depois.
- **A instalação padrão não tem autenticação.** Fora de rede confiável, ative `adminAuth` (bcrypt via `node-red admin hash-pw`) e HTTPS.
- **Reuso**: link nodes entre abas (só no início ou fim do fluxo; link call para "chamar e voltar"). Subflows são configurados por propriedades de instância, e **cada instância tem contexto e conexões próprios**.
- **Documente**: dê nome aos nós-chave, rótulos às portas, use Comment nodes e grupos, e escreva a descrição Markdown de nós, grupos e abas. Link nodes sem nome viram IDs impossíveis de rastrear.

## Quando o usuário pedir um fluxo importável
Entregue o JSON num bloco de código, pronto para **Menu → Import** (`Ctrl/⌘-i`). Formato (array plano de nós; ver `14-admin-api.md`, seção Tipos):
```json
[
  {"id":"tab1","type":"tab","label":"Leitura","disabled":false,"info":""},
  {"id":"n1","type":"inject","z":"tab1","name":"a cada 5 s","props":[{"p":"payload"}],"repeat":"5","once":true,"onceDelay":0.1,"payload":"","payloadType":"date","x":130,"y":80,"wires":[["n2"]]},
  {"id":"n2","type":"function","z":"tab1","name":"Escalar","func":"msg.payload = msg.payload / 10;\nreturn msg;","outputs":1,"x":310,"y":80,"wires":[["n3"]]},
  {"id":"n3","type":"debug","z":"tab1","name":"","active":true,"tosidebar":true,"complete":"payload","targetType":"msg","x":480,"y":80,"wires":[]}
]
```
- `id` único; `z` = id da aba; `wires` = array por saída, cada uma com a lista de ids de destino; `x`/`y` para o layout (linhas horizontais, ramos alinhados verticalmente).
- **Use os nomes e valores internos corretos** — o rótulo do editor muitas vezes difere do valor gravado (ex.: range "wrap" é `roll`, "limit" é `clamp`; trigger "nada" é `op1type: "nul"`; delay por tópico é `pauseType: "queue"`/`"timed"`). Tabela em `06-nos-core.md` → "Valores internos no JSON"; lista completa de propriedades de cada nó core em `assets/core-node-defaults.json`.
- **Valide antes de entregar**: salve o JSON e rode `python3 scripts/validate_flow.py fluxo.json` (caminho relativo a esta skill). Ele aponta ids duplicados, fios para nós inexistentes, `z` inválido, propriedades desconhecidas e valores de seleção inválidos para os nós core 5.0.7. Corrija os ERROS; avalie os AVISOS.
- Config nodes (broker MQTT, TLS, conexões de nós de terceiros) **não têm** `x`, `y`, `wires`, e são referenciados pelo id numa propriedade do nó.
- Não coloque senhas no JSON: credenciais não são exportadas; peça para o usuário preencher após importar.
- Para nós de terceiros (Modbus, S7, SQL, Dashboard), o nome das propriedades varia por pacote. Diga qual pacote (ex.: do Flow Library) e avise que o usuário deve conferir as propriedades após importar, ou prefira descrever a configuração em texto.
- Diga quais nós extras precisam ser instalados (Manage Palette ou `npm install` em `~/.node-red`) e se é preciso reiniciar.

## Contexto de uso deste usuário
O uso típico é industrial: o Node-RED fica entre CLPs/controladores (Siemens S7, Modbus/TCP, geradores Deep Sea) e bancos SQL. Nesses fluxos costumam aparecer:
- leitura cíclica com inject (interval) ou nós de protocolo;
- escala com function ou range;
- redução de gravações com filter (deadband por tópico) ou delay (rate limit);
- watchdog de comunicação com trigger;
- agrupamento de leituras com join manual;
- retry com catch + delay.

Detalhes em `06-nos-core.md` (final) e `16-cookbook.md`. **Protocolos específicos (mapas de registradores, handshake com CLP) não fazem parte desta documentação**: use o manual do fabricante e, se existirem, as skills próprias (ex.: MES/rastreabilidade, Siemens S7).

## Limites desta skill
- Base: código **5.0.7** e site lidos em 29/09/2026. Para versões mais novas, confira https://nodered.org/docs e o CHANGELOG no GitHub.
- A referência JSDoc da API de módulo foi resumida por assinaturas (versão 1.3, a mais nova publicada no site).
- Páginas do site que estão em branco no original (editores de buffer/JS/JSON/JSONata, settings do editor) não têm conteúdo a oferecer.
