# Tratamento de erros e status

Fonte: `docs/user-guide/handling-errors.md`

Tratar erro depende da aplicação: repetir a ação, disparar alerta, ou tratar como parte normal da lógica. Pense nisso sempre que o fluxo fala com banco, API externa ou broker MQTT.

Um nó pode reportar erro de duas formas: só escrevendo no log (**não capturável**) ou notificando o runtime (**capturável**, dispara fluxo). Há ainda um terceiro tipo que derruba o runtime (`uncaughtException`).

## Erros no log
Aparecem na barra Debug com mensagem, data/hora e nó de origem; passar o mouse destaca o nó; clicar no nome revela o nó no workspace.

## Erros capturáveis — Catch node
- Erro capturado por Catch **não** é mais logado no Debug.
- A mensagem emitida pelo Catch é a mensagem fornecida pelo nó que reportou, com `msg.error`:
```json
{
  "topic": "...", "payload": "...",
  "error": {
    "message": "An error",
    "source": { "id": "2e25823d.fa3f7e", "type": "function", "name": "My Function", "count": 1 }
  }
}
```
- `source.count`: quantas vezes **esta** mensagem foi lançada por **este** nó. Detecta laço (mensagem volta ao nó que erra de novo). O runtime deixa laçar **9 vezes** e então loga um erro não capturável que quebra o laço. **Apagar `count` desativa essa proteção.**
- Se a mensagem já tinha `msg.error`, ele é movido para `msg._error`.
- Por padrão o Catch pega erros de **todos os nós da mesma aba**; pode mirar nós específicos.
- Dois Catch mirando o mesmo nó: ambos disparam.
- Catch "todos os nós" pode ser configurado para pegar só erros **ainda não capturados** por outro Catch → permite tratadores específicos + um "pega-tudo".
- **Subflows**: o erro procura primeiro Catch dentro do subflow; se não houver, sobe para o fluxo que contém a instância.

No Function: `node.error("msg", msg)` (ver `02-function-node.md`). Em nó customizado: `done(err)` (ver `13-criando-nos.md`).

## Erros não capturáveis
Nó escreve no log sem notificar o runtime. Catch não pega. Alternativas: o nó pode atualizar status (monitore com Status node) ou enviar mensagem normal com propriedade indicando erro. Vale pedir ao autor do nó para corrigir.

## `uncaughtException`
Erro Node.js não tratado dentro de um nó (tipicamente uma tarefa assíncrona sem tratador de erro). **Derruba o runtime inteiro** — é a única coisa segura a fazer. Identifique o nó pelo stack trace no log e abra issue no nó.

## Mudanças de status — Status node
Nem todo problema vira erro: ex., MQTT perdendo conexão **muda o status**, não gera erro. O Status node reage a isso:
```json
{
  "status": {
    "fill": "red", "shape": "ring",
    "text": "node-red:common.status.disconnected",
    "source": { "id": "27bbb5b1.d3eb3a", "type": "mqtt out" }
  }
}
```

## Padrões prontos (Cookbook)
- "Trigger a flow when a node throws an error" e "Automatically retry an action after an error" — ver `16-cookbook.md`.
- Posicione Catch de forma consistente (perto dos nós ou agrupados abaixo do fluxo principal) e nomeie cada um pelo cenário que trata (`12-boas-praticas-fluxos.md`).
