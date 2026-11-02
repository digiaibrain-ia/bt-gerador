# Conceitos e mensagens

Fontes: `docs/user-guide/concepts.md`, `docs/user-guide/messages.md` (nodered.org/docs/user-guide/concepts, /messages)

## Glossário oficial

| Termo | Definição |
|---|---|
| **Node (nó)** | Bloco básico de um fluxo. É disparado por uma mensagem do nó anterior ou por um evento externo (requisição HTTP, timer, mudança de GPIO). Processa e pode enviar mensagem aos próximos nós. **No máximo uma porta de entrada** e quantas saídas precisar. |
| **Configuration node (nó de configuração)** | Guarda configuração reutilizável compartilhada por nós comuns. Ex.: MQTT In/Out usam um config node "MQTT Broker" que representa **uma conexão compartilhada**. Não aparece no workspace; fica na barra lateral "Configuration nodes". |
| **Flow (fluxo)** | Aba do editor; principal forma de organizar nós. Informalmente também designa um conjunto de nós conectados — uma aba pode ter vários. |
| **Context (contexto)** | Informação compartilhada entre nós sem passar pela mensagem. Escopos node, flow, global. Padrão em memória (não sobrevive a restart); pode ser em arquivo ou plugin. |
| **Message (mensagem)** | O que trafega entre nós. Objeto JavaScript simples com quaisquer propriedades; chamado `msg` no editor. Por convenção tem `payload` com a informação mais útil. |
| **Subflow** | Conjunto de nós colapsado em um único nó. Reduz complexidade visual ou empacota um componente reutilizável. |
| **Wire (fio)** | Conecta nós; representa o caminho das mensagens. |
| **Palette** | Lista de nós disponíveis, à esquerda. Nós extras via linha de comando ou Palette Manager. |
| **Workspace** | Área principal onde se arrasta e conecta nós; uma aba por fluxo e por subflow aberto. |
| **Sidebar** | Painéis de ferramentas: informação, ajuda, debug, config nodes etc. |

## Estrutura da mensagem

```json
{ "_msgid": "12345", "payload": "..." }
```
- `payload`: propriedade padrão com que a maioria dos nós trabalha.
- `_msgid`: adicionado pelo Node-RED; identifica a mensagem para rastreá-la no fluxo.
- Valores podem ser Boolean, Number, String, Array, Object ou Null.

### Explorar mensagens com o Debug
- O Debug mostra `msg.payload` por padrão; pode mostrar outra propriedade ou a mensagem completa.
- A barra lateral mostra nome da propriedade, tipo (`Object`, `String`, `Array`...) e conteúdo (arrays/objetos colapsados, clique para expandir).
- Ao passar o mouse aparecem 3 botões:
  - **copiar caminho** (ex.: `payload.Phone[2].type`) — cole direto em Change/Function;
  - **copiar valor** como JSON (arrays e buffers longos vêm truncados);
  - **fixar (pin)** o elemento, que passa a ser expandido automaticamente nas próximas mensagens do mesmo Debug.

### JSON
Se uma propriedade contém **string** JSON, é preciso convertê-la em objeto antes de acessar campos — use o nó **JSON**. O Debug mostra se é String ou Object.

## Alterar mensagens
Dois nós principais:
- **Function**: JavaScript livre (ver `02-function-node.md`).
- **Change**: sem código; também acessa contexto flow/global. Operações: **Set** (valor fixo, de outra propriedade/contexto, ou expressão **JSONata**), **Change** (buscar/substituir em string), **Delete**, **Move**.
  - Exemplo JSONata: converter `msg.payload.temperature` (°F) para `msg.payload.temperature_c` (90 → 32.22222).
  - JSONata parece JavaScript mas tem diferenças importantes (jsonata.org).

## Sequências de mensagens
Série ordenada de mensagens relacionadas (ex.: Split transforma um array em uma mensagem por elemento).

`msg.parts`:
- `msg.parts.id` — identificador único da sequência
- `msg.parts.index` — posição na sequência
- `msg.parts.count` — total, se conhecido
- Pode ter metadados extras (o Split adiciona informação que o Join usa para remontar).

Nós que operam sobre sequências:
- **Split** — String/Buffer: divide por caractere (padrão `\n`), sequência de buffer ou tamanho fixo. Array: por elemento ou em blocos de tamanho fixo. Object: uma mensagem por par chave/valor.
- **Join** — modos **Automatic** (desfaz um Split anterior), **Manual** (controle fino), **Reduce** (0.18+; expressão JSONata acumulada sobre cada mensagem).
- **Sort** (0.18+) — ordena por propriedade ou resultado JSONata.
- **Batch** (0.18+) — **Number of messages** (grupos de N, com *overlap* opcional), **Time interval** (agrupa por intervalo; pode enviar mensagem vazia se nada chegar), **Concatenate Sequences** (concatena sequências identificadas por `msg.topic`, na ordem configurada).

Detalhes de cada nó: `06-nos-core.md`.
