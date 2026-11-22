# Cookbook — receitas oficiais

Fonte: repositório `node-red/cookbook.nodered.org` (todas as receitas publicadas). Cada receita tem um fluxo JSON importável na página: `https://cookbook.nodered.org/<caminho>` — ao montar um fluxo parecido, aponte a URL.

Formato das receitas: Problema → Solução → Exemplo (fluxo) → Discussão.

## Mensagens (`/basic/...`)
| Receita | Solução |
|---|---|
| Valor fixo numa propriedade (`set-message-property-fixed`) | **Change** → Set. Tipos: string, número, booleano, timestamp (ms desde 1970), JSON (vira objeto), Buffer; ou de contexto/outra propriedade/JSONata |
| Apagar propriedade (`delete-message-property`) | Change → Delete |
| Mover propriedade (`move-message-property`) | Change → Move (ou Set + Delete) |
| Mapear faixas numéricas (`map-between-different-number-ranges`) | **Range** (ex.: 0–1023 → 0–5 V). Padrão **não limita** (2046 → 10); opções *clamp* (limitar) ou *wrap* (módulo) e arredondar |

## Controle de fluxo
| Receita | Solução |
|---|---|
| Disparar ao iniciar (`trigger-on-start`) | **Inject** com "Inject once after 0.1 seconds" — dispara algumas centenas de ms após cada **deploy**/partida (bom para inicializar contexto ou avisar reinício) |
| Intervalo regular (`trigger-at-interval`) | Inject com repeat; pode restringir a horários/dias. Para parar: Repeat = none + deploy |
| Horário específico (`trigger-at-time`) | Inject com cron (ex.: 16h em dias úteis: `00 16 * * 1,2,3,4,5`); vários horários = vários Inject |
| Rotear por propriedade (`route-on-property`) | **Switch** em `msg.topic` com uma saída por valor; enviar para todas as regras que casam ou só a primeira |
| Rotear por contexto (`route-on-context`) | Guarde o estado em `flow.state` (Change) e use Switch com propriedade `flow.state` — funciona como "portão" controlado por outro fluxo |
| Operar em cada elemento de array (`operate-on-array`) | **Split** → processamento → **Join** (modo automático, usa `msg.parts`). É o "loop" do Node-RED |
| Alarme se mensagem não chegar (`trigger-timeout`) | **Trigger**: envia nada, espera 5 s e envia `"timeout"`, com "extend delay" ligado (cada mensagem nova reinicia a espera) |
| Placeholder quando o stream para (`trigger-placeholder`) | Trigger 1 (envia `"reset"`, após 2 s sem mensagens envia true, com extend) → Trigger 2 (repete `0` a cada 2 s até receber `payload` = `"reset"`) |
| Desacelerar (`rate-limit-messages`) | **Delay** em modo rate limit (ex.: 1 msg/s, distribui no período) |
| Taxa regular descartando excesso (`rate-limit-message-stream`) | Delay rate limit com **"drop intermediate messages"** (fica com a mais recente) |
| Só quando o valor muda (`report-by-exception`) | **RBE / Filter** (report by exception); com número, pode exigir variação mínima (deadband) |
| Juntar streams numa mensagem (`join-streams`) | `msg.topic` único por fonte + **Join** manual → objeto chave/valor por `topic`, "após N partes" (ex.: 3) — envia a cada vez que tem as 3, com o valor mais recente de cada. Timeout opcional |

## Erros
| Receita | Solução |
|---|---|
| Fluxo ao ocorrer erro (`trigger-on-error`) | **Catch** (nós específicos ou todos); mensagem original + `msg.error`. Exige que o nó reporte o erro corretamente |
| Repetir após erro (`retry-on-error`) | Catch → (Delay, ex. 2 s) → de volta ao nó que falhou; útil para erros transitórios. Cuide para não criar laço infinito (ver `msg.error.source.count` em `04-erros-status.md`) |

## Formatos de dados
| Receita | Solução |
|---|---|
| JSON (`convert-json`) | **JSON** node — detecta a direção; pode forçar sempre Object ou sempre String |
| XML (`convert-xml`) | **XML** node; atributos ficam em `$` (ex.: `{"note":{"$":{"priority":"high"},"to":["Nick"],...}}`); elementos viram arrays. Dica: injete o XML desejado para descobrir o objeto que o gera |
| YAML (`convert-yaml`) | **YAML** node, nos dois sentidos |
| Gerar CSV (`generate-csv`) | **CSV** node com colunas (`a,b,c`); objeto único → `"10,20,30\n"` (bom para anexar com File Out); array → várias linhas, opção de cabeçalho |
| Ler CSV (`parse-csv`) | CSV node: pular N linhas, primeira linha como nomes de coluna; saída única (array de objetos) ou uma mensagem por linha (com `msg.parts` para Join) |
| Dados de página HTML (`/http/simple-get-request`) | **HTTP Request** + **HTML** node com seletor CSS (ex.: `.node-red-latest-version`); use "Inspecionar elemento" do navegador |
| Texto linha a linha (`split-text`) | Split (padrão: por linha) → Change JSONata `(parts.index+1) & ": " & payload` → Join |

## HTTP endpoints (`/http/...`)
| Receita | Como |
|---|---|
| Criar endpoint (`create-an-http-endpoint`) | **HTTP In** → (Template) → **HTTP Response**. Todo fluxo que começa em HTTP In **precisa chegar a um HTTP Response**, senão a requisição dá timeout. Corpo = `msg.payload`. Com `httpNodeAuth`: `curl -u user:senha` |
| Query string (`handle-query-parameters`) | `msg.req.query` (`?name=Nick&colour=blue` → `{name, colour}`; repetidos viram array) |
| Parâmetros de URL (`handle-url-parameters`) | URL do HTTP In com `/hello-param/:name` → `msg.req.params.name` |
| Cabeçalhos da requisição (`access-http-request-headers`) | `msg.req.headers` (nomes em minúsculas) |
| Dados de outro fluxo (`include-data-from-another-flow`) | Grave em contexto flow num fluxo (Change) e leia no fluxo HTTP |
| Responder JSON (`serve-json-content`) | `msg.headers = {"content-type": "application/json"}` no HTTP Response |
| Servir arquivo (`serve-a-local-file`) | **File In** retornando **Buffer** + `Content-Type` correto (ex.: `image/png`) |
| POST texto (`post-raw-data-to-a-flow`) | `Content-Type: text/plain` → `msg.payload` é o corpo |
| POST formulário (`post-form-data-to-a-flow`) | `application/x-www-form-urlencoded` → `msg.payload.name` |
| POST JSON (`post-json-data-to-a-flow`) | `application/json` → objeto em `msg.payload` |
| Cookies (`work-with-cookies`) | Lidos em `msg.req.cookies`; resposta define `msg.cookies = { name:'nick', session:{ value:'1234', maxAge:900000 } }`; opções `domain`, `expires`, `maxAge`, `path`, `value`; **null apaga**. HTTP Request aceita `msg.cookies`; `encode:false` evita URL-encoding |

## HTTP requests
| Receita | Como |
|---|---|
| GET simples (`simple-get-request`) | HTTP Request (+ HTML para extrair) |
| URL dinâmica (`set-request-url`) | `msg.url` (deixe a URL do nó vazia) |
| URL por template (`set-request-url-template`) | URL com Mustache `https://.../posts/{{post}}` usando `msg.post`; use `{{{triplo}}}` para não escapar HTML |
| Query string (`set-query-string`) | Mustache na URL: `...?q={{{query}}}&format=json` |
| JSON já convertido (`parse-json-response`) | Return = "a parsed JSON object" (padrão é string); para XML use o nó XML |
| Resposta binária (`get-binary-response`) | Return = "a binary buffer" |
| Cabeçalhos da requisição (`set-request-header`) | `msg.headers = {'X-Auth-User': 'mike', 'X-Auth-Key': 'fred-key'}` |

## MQTT (`/mqtt/...`)
| Receita | Como |
|---|---|
| Conectar (`connect-to-broker`) | MQTT In/Out + config node **MQTT Broker** (ex.: mosquitto local: `localhost:1883`); brokers remotos/seguros exigem mais opções |
| Publicar (`publish-to-topic`) | MQTT Out com tópico configurado |
| Tópico dinâmico (`set-publish-topic`) | Deixe o tópico do nó **vazio** e defina `msg.topic` |
| Mensagem retida (`publish-retained-message`) | Retain = true no nó ou `msg.retain = true`; novos assinantes recebem ao assinar; para limpar, publique mensagem vazia com retain |
| Assinar (`subscribe-to-topic`) | MQTT In; tópico fixo no nó (para variar, variável de ambiente + reinício); curingas `+` (um nível) e `#` (vários); `msg.topic` traz o tópico real. (A doc atual do nó também permite assinatura dinâmica — ver `06-nos-core.md`) |
| JSON recebido (`receive-json`) | Payload é string (ou Buffer); use JSON node ou, desde 0.19, a opção de formato de saída do próprio MQTT In |

## Contribuir
Canal `#docs` no Slack do Node-RED. Guia de estilo: título < 10 palavras; seções Problem/Solution/Example/Discussion; propriedades entre crases; nós como `<code class="node">`; fluxo JSON minificado numa linha.
