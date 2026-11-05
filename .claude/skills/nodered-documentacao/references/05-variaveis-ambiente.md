# Variáveis de ambiente

Fonte: `docs/user-guide/environment-variables.md`

## Em propriedades de nó
Valor da propriedade no formato `${ENV_VAR}`: o runtime substitui ao carregar os fluxos.
- **Só funciona se for o valor inteiro** — `CLIENT-${HOST}` **não** funciona.
- Se o diálogo do nó não tiver campo de texto para aquilo, dá para editar o arquivo de fluxo à mão.

## TypedInput tipo "env variable"
- Sem `${}`: o valor inteiro é o nome da variável (`"FOO"` → `process.env.FOO`).
- Com `${}`: interpola (`"Hello ${FOO}"` → `"Hello World"`).

## Outros acessos
- JSONata (Change etc.): `$env('ENV_VAR')`
- Function: `let foo = env.get("FOO");`
- Template (3.0+): `{{env.COLOUR}}`

## Níveis
- **Propriedades de instância de subflow** (0.20+): aparecem como variáveis de ambiente dentro do subflow, personalizáveis por instância (ex.: um subflow de API REST com o tipo de registro como variável).
- **Fluxo / grupo** (2.1+): na aba correspondente do diálogo de edição do fluxo ou grupo.
- **Global** (3.1+): no diálogo User Settings do editor.
- **Aninhamento**: dentro de subflow, busca nas propriedades do subflow, depois no fluxo que o contém (que pode ser outro subflow). Prefixo `$parent.` pula o nível local.

## Rodando como serviço
Instalado como serviço pelo script oficial, o Node-RED **não** vê variáveis definidas só no processo que o chamou. Opções:
- No settings.js, **fora** de `module.exports`: `process.env.FOO='World';`
- Arquivo `~/.node-red/environment` com linhas `ENV_VAR='foobar'` (lido pelo systemd).

## Embutidas (2.2+)
- `NR_NODE_ID`, `NR_NODE_NAME`, `NR_NODE_PATH` (IDs separados por `/`: fluxo, subflows, nó)
- `NR_GROUP_ID`, `NR_GROUP_NAME`
- `NR_FLOW_ID`, `NR_FLOW_NAME`
- `NR_SUBFLOW_NAME`, `NR_SUBFLOW_ID`, `NR_SUBFLOW_PATH` (3.1+)

IDs são únicos, nomes não. Sem nome → string vazia. Nó fora de grupo → group id vazio.

## Docker
Variáveis da imagem oficial (`FLOWS`, `NODE_OPTIONS`, `NODE_RED_ENABLE_SAFE_MODE`, `NODE_RED_ENABLE_PROJECTS`, `TZ`...) em `10-instalacao.md`.
