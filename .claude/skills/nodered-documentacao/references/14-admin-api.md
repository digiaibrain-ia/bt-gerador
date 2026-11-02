# Admin HTTP API

Fonte: `docs/api/admin/**` (index, oauth, types, errors e cada página de método)

API para administrar o runtime remotamente; usada pelo editor e pela CLI `node-red admin`. As rotas ficam sob `httpAdminRoot` (padrão `/`, ex.: `http://localhost:1880/flows`).

## 1. Autenticação
Protegida por `adminAuth` (ver `08-seguranca.md`). **Sem `adminAuth`, qualquer um com acesso à rede usa a API.**

```bash
# 0. esquema ativo
curl http://localhost:1880/auth/login
#   {}  -> sem autenticação
#   {"type":"credentials","prompts":[{"id":"username","type":"text","label":"Username"},
#                                    {"id":"password","type":"password","label":"Password"}]}
# 1. obter token
curl http://localhost:1880/auth/token --data 'client_id=node-red-admin&grant_type=password&scope=*&username=admin&password=password'
#   {"access_token":"A_SECRET_TOKEN","expires_in":604800,"token_type":"Bearer"}
# 2. usar
curl -H "Authorization: Bearer A_SECRET_TOKEN" http://localhost:1880/settings
# revogar
curl --data 'token=A_SECRET_TOKEN' -H "Authorization: Bearer A_SECRET_TOKEN" http://localhost:1880/auth/revoke
```
- `client_id`: `node-red-admin` ou `node-red-editor`. `grant_type`: `password`.
- `scope`: a doc diz "lista de permissões separada por espaço. **Atualmente, deve ser `*` ou `read`**". Não documente nem recomende outros valores (ex.: `scope=flows.read flows.write`) — isso não é suportado pela documentação. Permissões granulares (`["flows.read","flows.write"]`) são definidas **no usuário** em `adminAuth.users[].permissions` ou devolvidas pela função `tokens`/`authenticate`; o comportamento de combinar scope `*` com um usuário de permissões restritas **não está documentado** — diga isso e sugira testar em homologação.
- Token expira em 604800 s (7 dias) por padrão (`sessionExpiryTime`).

## 2. Métodos
Todos aceitam `Authorization: Bearer [token]` quando há autenticação.

| Método | Rota | Permissão | Descrição |
|---|---|---|---|
| GET | `/auth/login` | — | Esquema de autenticação |
| POST | `/auth/token` | — | Troca credenciais por token (200 / 401) |
| POST | `/auth/revoke` | — | Revoga token (200 / 401). A página do método pede corpo JSON `{"token": "..."}`; o exemplo curl oficial usa form (`--data 'token=...'`) — divergência da própria doc |
| GET | `/settings` | `settings.read` | `{httpNodeRoot, version, user}` (`user` só com autenticação) |
| GET | `/diagnostics` | `settings.read` | Relatório (requer `diagnostics.enabled: true`) |
| GET | `/flows` | `flows.read` | Configuração ativa (v1 array; v2 `{rev, flows}`) |
| POST | `/flows` | `flows.write` | Define configuração ativa (deploy) |
| GET | `/flows/state` | — | `{"state":"start"|"stop"}` (requer `runtimeState.enabled: true`) |
| POST | `/flows/state` | `flows.write` | Inicia/para fluxos; corpo **URL-encoded** `state=start|stop` |
| POST | `/flow` | `flows.write` | Adiciona um fluxo (aba) |
| GET | `/flow/:id` | `flows.read` | Um fluxo; `id=global` retorna config nodes e subflows globais |
| PUT | `/flow/:id` | `flows.write` | Atualiza um fluxo (ou `global`); para todos os nós do fluxo antes |
| DELETE | `/flow/:id` | `flows.write` | Remove um fluxo (204 / 400 / 401 / 404) |
| GET | `/nodes` | `nodes.read` | `Accept: application/json` → array de Node Set; `text/html` → HTML de todos os nós |
| POST | `/nodes` | `nodes.write` | Instala módulo |
| GET | `/nodes/:module` | `nodes.read` | Info do módulo (Node Module) |
| PUT | `/nodes/:module` | `nodes.write` | `{"enabled": true|false}` |
| DELETE | `/nodes/:module` | `nodes.write` | Remove módulo (204) |
| GET | `/nodes/:module/:set` | `nodes.read` | Info do Node Set |
| PUT | `/nodes/:module/:set` | `nodes.write` | `{"enabled": true|false}` |

(Existe a pasta `get/credentials/type/id` no repositório, mas a página está vazia.)

### GET/POST `/flows` em detalhe
- `Node-RED-API-Version` (0.15.0+): `v1` padrão (array de nós) ou `v2` (`{"rev": "abc-123", "flows": [...]}`).
- `Node-RED-Deployment-Type` (POST):
  - `full` (padrão) — para **todos** os nós e inicia a nova configuração
  - `nodes` — para só os nós modificados
  - `flows` — para só os fluxos com nós modificados
  - `reload` — recarrega do armazenamento e reinicia todos os nós (0.12.2+)
- **Controle de concorrência (v2)**: envie o `rev` obtido no GET. Se o runtime tiver versão mais nova → **409** (resolva e reenvie). Para forçar, omita `rev`. Sucesso v2 → 200 com `{"rev": "def-456"}` (não presuma formato do rev). v1 → 204 sem corpo.
- **Credenciais** no POST: dentro do nó (`"credentials": {"user": "...", "pass": "..."}`), numa seção `credentials` de nível superior por id de nó, ou conjunto criptografado `"credentials": {"$": "<string criptografada>"}`.
- Respostas: 200/204, 400 (versão inválida), 401, 409.

### POST `/flow`
Corpo: um objeto de fluxo com pelo menos `nodes`:
```json
{ "id": "91ad451.f6e52b8", "label": "Sheet 1", "nodes": [ ], "configs": [ ] }
```
O runtime **atribui novo id** (substitui o enviado e atualiza o `z` de todos os nós). Ids de nós devem ser únicos — rejeita se algum já existir. Retorna `{"id":"5a04dce3.a5fb24"}`.

### PUT `/flow/:id`
Fluxo normal: `{id, label, nodes, configs}`. Global: `{"id":"global","configs":[],"subflows":[]}`.

### POST `/nodes`
- npm: `Content-type: application/json`, `{"module": "node-red-node-suncalc"}` (nome ou caminho completo de diretório; **não** aceita `.tgz` nem versão aqui).
- tgz: `multipart/form-data`:
  ```bash
  curl -X POST http://localhost:1880/nodes -H "Content-Type: multipart/form-data" \
    -F "tarball=@node-red-contrib-foo-1.0.3.tgz;type=application/x-compressed-tar;filename=node-red-contrib-foo-1.0.3.tgz"
  ```
- Retorna Node Module (200); 400, 401, 404.

### GET `/diagnostics` (exemplo resumido)
Campos: `report`, `scope`, `time`, `intl` (locale, timeZone), `nodejs` (versão, arch, platform, memoryUsage), `os` (containerised, wsl, totalmem, freemem, loadavg, release, uptime), `runtime` (versão, isStarted, flows.state, modules, **settings** — mostra valores ou `SET`/`UNSET` para sensíveis como `adminAuth`, `uiPort`, `httpNodeAuth`).

## 3. Tipos
- **Node**: `id`, `type`, `x`, `y`, `z` (fluxo/subflow a que pertence), `wires`, e campos próprios do tipo. **Config node não tem `x`, `y`, `wires`.**
- **Subflow**: `{"id","type":"subflow","name","info","in":[{x,y,wires:[{id}]}],"out":[{x,y,wires:[{id,port}]}],"configs":[...],"nodes":[...]}`.
- **Complete Flow configuration**: array plano de Node — formato principal do `/flows` e do import/export do editor (v2 acrescenta `rev`).
- **Single Flow configuration** (0.13+, uma aba): `{id, label, nodes, configs, subflows}` (`subflows` só no fluxo `global`).
- **Node Module**: `{name, version, nodes:[Node Set]}`.
- **Node Set**: `{id:"modulo/set", name, types:[...], enabled, module, version}`; `module: "node-red"` = carregado de arquivos copiados, não de módulo npm.

## 4. Erros
| Código | Motivo |
|---|---|
| 200 | Sucesso com conteúdo |
| 204 | Sucesso sem conteúdo |
| 400 | Requisição inválida — corpo `{code, message}` |
| 401 | Não autorizado |
| 404 | Não encontrado |
| 409 | Conflito de versão (`POST /flows`) |
| 500 | Erro no servidor |

Códigos do 400: `unexpected_error`, `invalid_request`, `settings_unavailable` (storage não permite mudar settings), `module_already_loaded`, `type_in_use` (remover/desativar tipo em uso), `invalid_api_version`.

## 5. Exemplo: backup e deploy por script
```bash
TOKEN=$(curl -s http://localhost:1880/auth/token --data 'client_id=node-red-admin&grant_type=password&scope=*&username=admin&password=SENHA' | jq -r .access_token)
# backup com revisão
curl -s -H "Authorization: Bearer $TOKEN" -H "Node-RED-API-Version: v2" http://localhost:1880/flows > flows-v2.json
# deploy só dos fluxos alterados, com controle de rev
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
     -H "Node-RED-API-Version: v2" -H "Node-RED-Deployment-Type: flows" \
     --data @flows-v2.json http://localhost:1880/flows
```
(Montado a partir da documentação; `jq` é ferramenta externa.)
