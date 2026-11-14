# Padrão de rotas HTTP do Node-RED (decisão do operador, 21/10/2026; atualizado 23/10/2026)

**Regra**: toda rota HTTP (nó `http in`) exposta pelo Node-RED ao HTML começa com `/api/`, no formato `/api/<recurso>/<...>`.

**Terminologia**: "rota HTTP" (API REST do Node-RED, nó `http in`) não é "endpoint S7" (nó de configuração do PLC com IP/rack/slot + tabela de variáveis, usado por `s7 in`/`s7 out`).

## Inventário (atualizado 23/10/2026)

| Rota | Flow | Situação |
|---|---|---|
| `GET /api/gerador` | Deep Sea -> REST (`servidor-deepsea-api-gerador-v3_4.json`) | no padrão |
| `GET /api/chaves/56` e `/api/chaves/400` | Chaves BC56 / BC400 (API) v2.2 | no padrão; GET responde do cache da leitura cíclica (503 se velha) |
| `POST /api/chaves/56/ligar` | idem | NOVA v2 |
| `POST /api/chaves/56/habilitar`, `/selecionar`, `/salvar`, `/usarKwReal`, `/limpar` | idem | no padrão (eram `/chaves/56/...`) |
| `GET /api/logs/56`, `GET /api/logs/400` | Chaves BC56/BC400 (API) v2.1 | NOVAS 22/10/2026 — log da comunicação (só POST e GET que falhou), na memória do Node-RED, `?limit=` até 1000 |
| `POST /api/simulador/dse` | Simulador DSE (Demo) v3 | no padrão (era `/simulador/dse`) |
| `GET/POST /api/ensaio/modo`, `POST /api/ensaio/snap/preenchimento`, `POST /api/ensaio/snap/etapa`, `GET /api/ensaio/snap`, `POST /api/ensaio/snap/limpar` | Registro do Ensaio DB53 (API) v1.4 (`registro-ensaio-db53-api-v1.4.json`) | **MIGRADO 22/10/2026** (eram `/ensaio/*` do `selecao-ensaio-v1.3`). Lógica idêntica (verificado no emulador); respostas dos GET ganharam o campo `flow`. Exige HTML v1.9.64 |
| `POST /api/dev/log-evento`, `GET /api/dev/logs`, `POST /api/dev/logs/limpar` | Dev · Logs (API) v1.0 (`dev-logs-api-v1.0.json`, flow `dev-logs-v1.0`) | **NOVAS 23/10/2026** — observabilidade do desenvolvedor [DEV.OBS]: buffer circular em memória (5000 eventos); NÃO toca PLC/DB. Prefixo `/api/dev/` reservado a ferramentas de desenvolvedor (nunca usado pelo operador). Exige HTML v1.9.73. Contrato: `CONTRATO_HTTP_HTML_NODERED_DEV_LOGS.md` |

## Regra 22/10/2026: um flow por card
Cada card tem **o seu DB e o seu flow** no Node-RED; o **nome da aba** identifica o card (ex.: "Chaves BC56 (API) v2.2", "Registro do Ensaio DB53 (API)", futuro "Modo (API)"). O prefixo `/api/<recurso>` continua o mesmo. Hoje o modo manual/automático (`/api/ensaio/modo`) ainda mora no flow do Registro — migra para o flow do Modo quando o DB58 existir (decisão pendente).

## Regra 23/10/2026: prefixo /api/dev/
Rotas de ferramenta de desenvolvedor (log, diagnóstico) ficam sob `/api/dev/...`, para nunca colidir com as rotas de card (`/api/chaves`, `/api/ensaio`, `/api/gerador`, `/api/logs/56|400`). O `/api/logs/56` e `/api/logs/400` (log da comunicação de cada banco) continuam nos flows de chaves v2.3 e o Gerenciador de logs os lê (só GET).

## Ao criar rota nova
- Prefixo `/api/`; recurso no singular/plural já usado (`chaves`, `ensaio`, `gerador`); banco/identificador no caminho (`/api/chaves/56`).
- POST só vale com HTTP 2xx e `ok:true`; confirmar por leitura de volta (padrão dos contratos).
- Registrar a rota neste inventário e no contrato do card.
