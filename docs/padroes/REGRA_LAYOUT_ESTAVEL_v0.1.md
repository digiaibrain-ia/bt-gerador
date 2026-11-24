# REGRA DO PROJETO — LAYOUT ESTÁVEL (indicadores visuais) — v0.1 (28/10/2026)

> **Resumo.** Indicador visual (tracejado, sombra, realce, pulso) **nunca** pode mudar o tamanho de nada na tela. Decisão do operador em 28/10/2026, depois de notar que o tracejado das chaves sugeridas aumentava a altura do card Banco de Cargas. Vale para todo HTML do projeto, a partir do medidor v1.10.103.

## 1. A regra
Um indicador visual só pode usar técnicas que **não entram na conta de tamanho** do elemento nem do vizinho:

| Pode | Não pode |
|---|---|
| `box-shadow: inset …` (sombra para dentro) | `border` novo ou mais grosso ao ligar o indicador |
| `outline` com `outline-offset` **negativo** (para dentro) | `outline` com offset positivo / grande (vaza para fora e entra no scroll do card) |
| pseudo-elemento `::before/::after` com `position:absolute; inset:0; pointer-events:none` dentro de um pai `position:relative` | `padding` / `margin` novos ao ligar o indicador |
| mudar **cor**, **opacidade** ou **fundo** | `transform:scale()` que invade o vizinho; trocar `font-weight` em texto que quebra linha |
| `animation` só de opacidade/cor | `animation` de tamanho/offset externo |

**Por que (técnico):** `border`, `padding` e `margin` somam ao tamanho da caixa; `outline` com offset positivo estende a área pintável/rolável do ancestral (`overflow:auto`) e pode mudar a altura do card ou criar barra de rolagem. Pseudo-elemento absoluto e `inset` ficam "por cima" e não participam do layout.
**Por que (leigo):** o indicador é um "adesivo" colado por cima, não uma moldura que empurra os vizinhos.

## 2. Aplicação já feita (v1.10.103)
`.tile.sug` (chave sugerida pelo Patamar Guiado): antes `outline:3px dashed` + `outline-offset` animado de 1 a 3 px; agora `::after` absoluto com borda tracejada de 3 px **dentro** da chave, animando só a opacidade. Medido no navegador: altura do card Banco de Cargas **idêntica** com e sem tracejado (286,69 px nos dois casos).

## 3. Como testar um indicador novo
1. Medir `getBoundingClientRect().height/width` do card e do vizinho **com e sem** o indicador (deve ser idêntico).
2. Conferir com o card recolhido/expandido e com a janela estreita (celular).
3. Se mudar, refazer com uma das técnicas da coluna "Pode".

## 4. Pendência (ASSUMIDO — a revisar)
Ainda existem realces antigos que **não** seguem a regra, todos **dentro de diálogos** (não no layout principal): `.chpk #chSel .tile.sel` (chave selecionada no Setup: outline de 4 px + `transform:scale(1.07)` + etiqueta). Não foram alterados agora para não mexer no Setup sem pedido; ficam para a revisão final.
