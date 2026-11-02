# DICA DE INTERFACE v0.1 — "que elemento é este?" (29/10/2026)

**Arquivo:** `dica_ui_v0.1.js` (colado inline em medidor 1.10.114, gráfico v0.9, mapa v0.10, gerenciador de logs v1.5, amostras v0.6, simulador do rodízio v0.2, visor da API v0.2, painel BT2 v0.3 e index.html).

## Para que serve (leigo)
Para falar com a programação sem apontar "aquele botãozinho". Ligada, mostra ao passar o mouse: **tipo do elemento** (Botão, Chip, Card, Janela…), **id de programação** (`#bAnalisar`) e **coordenadas**. **Alt + clique** fixa a etiqueta até fechar (✕ ou Esc) e tem **Copiar**. Um contorno tracejado laranja mostra qual é o elemento.

## Como usar
| Ação | Como |
|---|---|
| Ligar/desligar | **Alt + I** (a escolha fica lembrada) · ou abrir a página com `?ui=1` · ou `DICAUI.liga(true)` no console |
| Fixar (manter aberto) | **Alt + clique** no elemento (o clique NÃO aciona o botão) |
| Fechar a fixa | ✕ ou Esc |
Desligada por padrão: o operador não vê nada diferente.

## Dicionário de tipos (nome PT-BR ← como é reconhecido)
Botão (`button`, `role=button`) · Chip (classes `chip/enschip/gchip/gd-chip`) · Card (`.card`) · Painel (`section.panel`) · Janela (`dialog`; "flutuante" se aberta pelo módulo JANELAS) · Barra de título (`.jt`) · Botão ⤢ (`.jwbtn`) · Bloco FB (`.bx`, mapa) · Ícone i (mapa) · Lista suspensa · Campo de entrada/texto · Caixa de seleção · Aba · Link · Gráfico (canvas) · Tabela · Desenho (svg) · Título · Rótulo · Quadro embutido · Popover/menu. O que não se encaixa mostra `Elemento <tag>`.
Sem id próprio: mostra "dentro de `#id-do-pai`".

## Coordenadas
- **tela** x, y, largura×altura = retângulo do elemento na janela do navegador (px);
- **mouse** = cursor na janela; **monitor** = cursor no monitor (screenX/Y).

## Nomes de elementos de UI (resposta à pergunta do operador)
- **tooltip**: etiqueta ao passar o mouse; some ao sair.
- **popover**: aviso não modal que **permanece aberto** até fechar (é o que o Alt+clique cria e o aviso de risco do JANELAS v0.2).
- **toast / snackbar**: mensagem que aparece num canto e some sozinha.
- **diálogo modal**: janela que trava a tela de trás.

## Técnico / riscos
- `popover="manual"` (camada de cima do navegador, acima de `<dialog>`); sem suporte → `position:fixed` com z-index alto.
- Contorno = `<div>` fixa (não altera o elemento → respeita REGRA_LAYOUT_ESTAVEL_v0.1).
- Com a dica ligada, o `title` do elemento sob o mouse é guardado e mostrado dentro da etiqueta (evita duas dicas); devolvido ao sair.
- Dentro de iframes embutidos (gráfico/mapa no medidor) cada página tem o seu Alt+I (foco no quadro certo).
- Não envia nada para fora, não lê PLC/Node-RED.
- **Teste feito (Playwright):** Alt+I liga em todas as páginas; tipo+id+coordenadas no hover; Alt+clique fixa sem acionar o botão; Esc fecha; sem erros de página.
