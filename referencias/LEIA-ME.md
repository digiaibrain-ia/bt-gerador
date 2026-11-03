# Pasta de referências (para o "Pacote para a IA")

Figuras e estados que se repetem no medidor, cada uma com uma **descrição curta**. No botão direito → "Capturar para a IA" → seção **Referências**, você marca as que valem para a sua pergunta e a descrição entra no pacote (em texto, barato). A imagem só precisa ser anexada à conversa se o problema for visual.

## Como funciona
- `indice.json` é a lista. Cada item: `id`, `titulo`, `descricao`, `arquivo` (imagem em `img/`), `tags`.
- A pasta `referencias/` precisa ficar **ao lado do HTML** no PC (`public/html/referencias/`) para o medidor achar o `indice.json`. Sem ela, a seção mostra que não encontrou.
- Cada item tem **uma figura e um significado**. Regra: só registrar o que está no código ou o que o operador confirmou. **Não inventar significado.**

## Como adicionar uma referência nova
1. Ponha a imagem em `img/` (PNG, nome sem acento: `triangulo_vermelho_x.png`).
2. Acrescente um item em `indice.json` com título, descrição de 1 a 2 frases (o que é, quando aparece, o que o operador faz) e as tags.
3. Se a figura veio do medidor, ela pode ser gerada de novo com `tests/e2e/gera_referencias.js` (fotografa o elemento real).
4. Copie a pasta para o PC (ela vai junto no pacote `bt2-*`).

## O que já está registrado
Só o que é verificável no código do medidor 1.10.166: os dois botões do cabeçalho (Alertas e Falhas), o triângulo de ocorrências nos cards e o chip do Patamar. **Estados das chaves, ícones Manual/Auto e outras figuras**: fica para o operador trazer a imagem e dizer o significado (ou autorizar a geração a partir do Demo).
