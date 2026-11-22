# Editor

Fonte: `docs/user-guide/editor/**` (páginas `editors/*` e `settings/*` estão em branco no site oficial)

## Sumário
1. Layout · 2. Palette e Palette Manager · 3. Fluxos (abas) · 4. Nós · 5. Config nodes · 6. Fios · 7. Grupos · 8. Subflows · 9. Seleção e clipboard · 10. Busca · 11. Import/Export · 12. Barras laterais · 13. Ações, atalhos e arranjo · 14. Deploy

## 1. Layout
- **Header**: botão Deploy, menu principal, menu do usuário (com autenticação).
- **Workspace** no centro, uma aba por fluxo e por subflow aberto. Rodapé: zoom (`Ctrl/⌘-=`, `Ctrl/⌘--`, `Ctrl/⌘-0`) e **navegador** (miniatura; arraste o retângulo; bom para achar nós "perdidos" nas bordas).
- **Sidebars** dos dois lados; qualquer painel pode ir para qualquer lado; cada sidebar pode mostrar 2 painéis (dividido). Arraste pela borda para redimensionar; arrastar até a borda da janela esconde. Mostrar de novo: `Ctrl/⌘-Alt-Space` (esquerda), `Ctrl/⌘-Space` (direita) ou menu View.
- User Settings: `Ctrl/⌘-,` (aba View personaliza o workspace).
- Vídeos "Node-RED Essentials" no YouTube (ainda não atualizados para a v5).

## 2. Palette
- Nós por categoria; subflows numa categoria no topo. Clique no cabeçalho recolhe/expande; botões no rodapé recolhem/expandem tudo; campo de filtro no topo. `Ctrl/⌘-g p`.
- **Palette Manager** (User Settings → Palette; menu "Manage palette"; ação `core:manage-palette`; atalho: ver nota abaixo):
  - *Nodes*: módulos instalados, versão, tipos de nó; remover, desativar, atualizar. **Nó em uso no fluxo não pode ser removido nem desativado.**
  - *Install*: busca, data de atualização, link da documentação, botão install.
  - Nota: a doc lista `Ctrl/⌘-Shift-p` tanto para o Palette Manager quanto para a lista de ações.

## 3. Fluxos (abas)
- Nome e descrição (Markdown, aparece na barra Info). Todos os nós da aba compartilham o contexto `flow`.
- Adicionar: botão **+** ou duplo clique em espaço livre da barra de abas (`core:add-flow`). Reordenar arrastando a aba.
- **Propriedades**: duplo clique na aba → abas *Properties* (nome, descrição) e *Environment Variables*.
- **Habilitar/desabilitar**: toggle no rodapé do diálogo ou botão na Explorer. Fluxo desabilitado: nenhum nó é criado no deploy.
- **Esconder**: clique direito → hide flow (`Alt-w`); mostrar último escondido `Alt-Shift-w`; hide other/all, show all.
- **Travar (lock)**: impede alterações — clique direito na aba, cadeado no diálogo ou na barra Info.
- **Apagar**: botão Delete no diálogo.
- **Trocar**: lista de fluxos `Ctrl/⌘-Shift-f`; anterior `Ctrl/⌘-[`; próxima `Ctrl/⌘-]`.

## 4. Nós
- Adicionar: arrastar da palette, **Quick-Add** (`Ctrl/⌘` + clique no workspace), importar.
- Quick-Add: mostra os 5 nós core principais, recentes e lista alfabética; filtro; mantendo `Ctrl/⌘` ao escolher, adiciona e continua aberto para o próximo; se acionado sobre um fio, **insere o nó no fio**.
- Portas: no máximo 1 entrada, várias saídas; rótulos ao passar o mouse (Switch mostra a regra; personalizáveis).
- **Status** abaixo do nó (ex.: MQTT conectado). Status node reage a mudanças.
- **Círculo azul** = alterações não deployadas. **Triângulo vermelho** = erro de configuração (tooltip mostra detalhes).
- **Badge de docs** quando há descrição; clique abre popup (lápis edita).
- Botões nas bordas: só **Inject** e **Debug** entre os nós core.
- **Editar**: duplo clique ou `Enter` (com vários selecionados, edita o primeiro). Abas: *Properties*, *Description* (Markdown → barra Info), *Appearance* (mostrar rótulo, ícone, rótulos de porta).
- **Habilitar/desabilitar** nó: toggle no rodapé. Desabilitado não é criado no deploy; se estiver no meio do fluxo, **nenhuma mensagem passa**.

## 5. Config nodes
- Adicionados pelo diálogo do nó que precisa deles (select + botão de editar/adicionar).
- Diálogo só tem Properties e Description. Rodapé mostra quantos nós usam; **escopo** (padrão: todos os fluxos; pode ficar local a um fluxo); toggle habilitar.
- Barra lateral **Configuration nodes** (`Ctrl/⌘-g c`): lista por escopo, tipo, rótulo e contagem de uso; não usados têm contorno pontilhado; filtro "unused"; duplo clique edita.

## 6. Fios
- Arraste da porta ao destino. Ou `Ctrl/⌘` + clique na porta e clique no destino; mantendo `Ctrl/⌘`, continua da saída do nó recém-ligado (encadear rápido; combina com Quick-Add).
- **Inserir no fio**: solte um nó (com entrada e saída) no meio de um fio (fica tracejado).
- **Mover fio**: selecione, segure `Shift` e arraste a partir da porta; solto no vazio = apaga. Porta com vários fios e nenhum selecionado: move todos.
- Vários fios: `Ctrl/⌘` + clique. Selecionar nós destaca os fios entre eles.
- **Apagar**: selecione e `Delete`. **Fatiar**: segure `Alt/Option` e arraste.
- **Apagar nó mantendo fios**: `Ctrl/⌘-delete` (ação `core:delete-selection-and-reconnect`).
- **Desconectar nó sem apagar**: ação `core:detach-selected-nodes` (sem atalho padrão; atribua em keyboard settings).

## 7. Grupos
- Selecione nós → Groups → Group selection (`Ctrl/⌘-Shift-g`). Movidos/copiados como um objeto.
- Editar: duplo clique ou `Enter`. Abas Properties (cor de contorno/preenchimento, rótulo sim/não, cor e posição do rótulo), Environment Variables, Description.
- Copiar/colar estilo: `Ctrl/⌘-Shift-c` / `Ctrl/⌘-Shift-v`.
- Adicionar: arraste para dentro. Remover: Groups → Remove from group, ou arraste segurando `Alt`.
- Merge selection (juntar grupos/nós num grupo). Desagrupar: `Ctrl/⌘-Shift-u`.

## 8. Subflows
- Conjunto de nós colapsado num nó; vai para a palette; instâncias como qualquer nó. **Não pode conter instância de si mesmo** (direta ou indireta).
- Criar vazio: Subflows → Create subflow. **Converter seleção**: Subflows → Selection to Subflow — só se todos os fios de entrada chegam a **um único nó** (o subflow tem no máximo 1 entrada).
- Editar: duplo clique na palette, ou "Edit flow template" no diálogo da instância. Abre em aba que pode ser fechada.
- Entradas/saídas: quadrados cinza; toolbar adiciona/remove (máx. 1 entrada).
- **Saída de status**: toolbar adiciona; `msg.payload` com string ou objeto de status atualiza o status das instâncias.
- Diálogo de propriedades: *Properties* (propriedades por instância → variáveis de ambiente; cada uma com UI configurável e aba "UI Preview"), *Module Properties* (versão, licença, nome do módulo — para empacotar como npm), *Description*, *Appearance* (categoria na palette, rótulo, cor, ícone, rótulos de porta).
- "delete subflow" remove o subflow **e todas as instâncias**.
- Contexto e Catch dentro de subflow: ver `03-contexto.md` e `04-erros-status.md`.

## 9. Seleção e clipboard
- Clique seleciona (Info mostra propriedades e ajuda). `Ctrl/⌘` + clique adiciona/remove.
- `Shift` + clique no meio: nó e todos conectados (`Alt-s c`); no lado esquerdo: upstream (`Alt-s u`); lado direito: downstream (`Alt-s d`).
- Só um fio por clique (vários com `Ctrl/⌘`). Laço: clique e arraste no workspace (não seleciona fios). Tudo: `Ctrl/⌘-a`.
- Várias abas: `Ctrl/⌘` + clique na aba (apagar, copiar, exportar).
- Copiar/recortar/colar: `Ctrl/⌘-c/x/v` — **clipboard interno** do editor, não o do sistema.

## 10. Busca (`Ctrl/⌘-f`)
Indexa todas as propriedades (id, tipo, nome...), inclusive config nodes. Botão de lupa revela sem fechar; botão ▶ copia a busca para a Explorer; buscas prontas no menu; barra de navegação entre resultados.

| Filtro | Efeito |
|---|---|
| `is:config` | só config nodes |
| `is:subflow` | só subflows |
| `is:unused` | config nodes ou subflows sem uso |
| `is:invalid` | nós com erro de configuração |
| `uses:<config-node-id>` | nós que dependem daquele config node |

## 11. Import / Export
- **Import** (`Ctrl/⌘-i`): colar JSON, enviar arquivo, biblioteca local, exemplos dos nós instalados; importar no fluxo atual ou em novo fluxo.
- **Export** (`Ctrl/⌘-e`): copiar para clipboard do sistema, baixar arquivo, salvar na biblioteca local. Escopo: nós selecionados, fluxo atual (com o nó da aba) ou configuração completa. JSON compacto (uma linha) ou formatado.
- Credenciais não são exportadas (ver `13-criando-nos.md`, credenciais).

## 12. Barras laterais
| Painel | Atalho | O que faz |
|---|---|---|
| Explorer | `Ctrl/⌘-g e` | Árvore de fluxos e nós; busca com a mesma sintaxe; revelar, acionar botão (Inject/Debug), habilitar/desabilitar. |
| Information | `Ctrl/⌘-g i` | Propriedades da seleção ("show more" = todas), descrição; copiar URL do nó, abrir ajuda, revelar. Sem seleção: descrição do fluxo. |
| Debug | `Ctrl/⌘-g d` | Mensagens dos Debug e alguns logs do runtime. Filtro: all nodes / selected nodes / current flow. **Guarda só as 100 mais recentes** (as filtradas contam). Pausar (descarta e conta as novas), limpar (`Ctrl/⌘-Alt-l`; tudo ou só visíveis), abrir em janela separada. Ações para ativar/desativar Debug selecionados, todos, ou do fluxo. |
| Help | `Ctrl/⌘-g h` | Ajuda de todos os nós, com sumário. |
| Configuration nodes | `Ctrl/⌘-g c` | Ver seção 5. |
| Context data | `Ctrl/⌘-g x` | Seções node/flow/global; **clique em refresh para carregar**; auto-refresh ao trocar nó/fluxo; refresh por chave; copiar valor (convertido a JSON). |

Nós/plugins podem adicionar painéis (ex.: node-red-debugger).
Dica: em fluxos com Debug barulhentos, desative os nós em vez de filtrar a barra.

## 13. Ações, atalhos, arranjo
- Lista de ações: View → Action list (`Ctrl/⌘-Shift-p`, `core:show-action-list`).
- Atalhos: View → Keyboard shortcuts (`Shift-?`). Clique na linha, digite o atalho, escolha escopo (`global`, `workspace`, `edit dialog`) e confirme; seta volta ao padrão.
- Arranjo (menu Arrange): alinhar à esquerda `Alt-a l`, direita `Alt-a r`, topo `Alt-a t`, base `Alt-a b`, meio `Alt-a m`, centro `Alt-a c`; distribuir horizontal `Alt-a h`, vertical `Alt-a v`; alinhar à grade; ordem (frente/trás) sem atalho.

## 14. Deploy
O site não tem página própria do botão Deploy. Os tipos de deploy aparecem na Admin API (`Node-RED-Deployment-Type`): `full` (para tudo e reaplica), `nodes` (só nós alterados), `flows` (só fluxos alterados), `reload` (recarrega do armazenamento). Ver `14-admin-api.md`. Com `runtimeState.ui: true`, o menu de deploy ganha botão de parar/iniciar fluxos (`07-settings-runtime.md`).
