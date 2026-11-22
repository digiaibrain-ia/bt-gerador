# Contexto

Fontes: `docs/user-guide/context.md`, `docs/api/context/*` (store memory/localfilesystem — detalhes em `15-apis-runtime-editor.md`)

## O que é
Forma de guardar informação compartilhada entre nós **sem usar a mensagem**.

## Escopos
- **Node**: só o nó que gravou.
- **Flow**: todos os nós da mesma aba.
- **Global**: todos os nós.

Escolha: se só um nó (ex.: um Function) usa, node basta. Caso típico de flow/global: um sensor publica valores num fluxo e um fluxo HTTP separado devolve a última leitura guardada em contexto.

- Global pode ser pré-populado com `functionGlobalContext` no settings.js.
- **Subflow**: o `flow` dentro de um subflow é o do próprio subflow, não da aba onde a instância está. Desde 0.20, use `$parent.` para acessar o contexto do fluxo pai: `flow.get("$parent.colour")`.

## Stores
Padrão: somente memória (perde no restart). Desde 0.19, `contextStorage` no settings.js configura persistência. Módulos embutidos: `memory` e `localfilesystem`; plugins próprios são possíveis.

### Persistir em arquivo
```javascript
contextStorage: {
   default: { module: "localfilesystem" }
}
```
Padrões do `localfilesystem`: arquivos em `~/.node-red/context/`; cache em memória, grava no disco **a cada 30 segundos**. (Se o seu settings.js for antigo e não tiver o exemplo, adicione manualmente.)

### Vários stores
```javascript
contextStorage: {
   default: "memoryOnly",
   memoryOnly: { module: 'memory' },
   file: { module: 'localfilesystem' }
}
```
- `default` indica o store usado quando nenhum é especificado.
- Vários `localfilesystem` **precisam** de `dir` diferentes.

## Usar no fluxo
- **Change node**: jeito mais fácil (ex.: `flow.myData` = `msg.payload`); com vários stores, a UI deixa escolher o store.
- **Inject** pode injetar um valor de contexto; **Switch** pode rotear por um valor de contexto.
- **Apagar** permanentemente do store de arquivo: Change node com operação Delete.
- Function node: ver `02-function-node.md`. Nó customizado: `13-criando-nos.md`.
- A barra lateral **Context Data** mostra e atualiza valores (ver `09-editor.md`).

## Boas práticas (Developing Flows)
- Prefira `flow` a `global`; nomes descritivos.
- Para estado entre várias instâncias de Node-RED, use serviço externo (MQTT, banco).
- O contexto antigo via `context.global.foo = ...` (pré-0.13) ainda funciona mas é obsoleto: não persiste e não aparece no visualizador.
