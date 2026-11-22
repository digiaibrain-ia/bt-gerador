# Padrão de comentários SCL: //[F] funcionamento e //[M] montagem no TIA (v0.1)

Criado em 17/11/2026 a pedido do Reginaldo. Primeira aplicação: `plc/bt2/entrega_1200_v0.17/` (o ET200 v0.7 **não** foi alterado).

## Por quê
O comentário de **funcionamento** explica a lógica ("por que o banco cai em 2 s"). O comentário de **montagem** explica o trabalho no TIA ("importe antes do FB, número manual 3007, sem acesso otimizado"). São leitores e momentos diferentes. Misturados, um atrapalha o outro. Com etiqueta, o `Localizar` do TIA filtra um dos dois.

## Regra
| Etiqueta | Barra de cabeçalho | Conteúdo |
|---|---|---|
| `//[F]` | `//[F]=====` (igual) | FUNCIONAMENTO: o que o código faz e por que; regras de segurança; escritor único; limites |
| `//[M]` | `//[M]-----` (traço) | MONTAGEM NO TIA: ordem de importação, número/nome do DB, acesso otimizado, onde ligar os seus tags, o que remover (FC7/FC8), como chamar (1x por ciclo) |

1. **Toda linha de comentário `//` leva a etiqueta** (`//[F]` ou `//[M]`), inclusive comentário no fim da linha de código. Grafia única, sem espaço: `//[F]`, nunca `// [F]`.
2. Cada bloco `.scl` tem **as duas**: cabeçalho com legenda, bloco FUNCIONAMENTO (barra `=`) e bloco MONTAGEM (barra `-`).
3. Parâmetros: em geral `//[F]` (o que significa); `//[M]` quando o parâmetro é ligado pelo programador (de qual campo do DB vem, qual tag entra).
4. Só ASCII (importação do TIA). Sem acento.
5. O lugar a preencher pelo programador marca-se `//[M] <- seu tag ...` na própria linha.
6. Comentário de aviso de risco continua dentro de `[F]` (ou `[M]` se for sobre a montagem). Não há 3ª etiqueta.

## Como conferir
`tests/plc_modelo/comentarios_marcados.test.js` (node --test): falha se houver comentário sem etiqueta, caractere não ASCII ou bloco sem as duas etiquetas. Rascunho: o teste verifica só o texto, **não** compila no TIA.

## Status
Aplicado ao 1200 v0.17 (rascunho, não compilado). ET200: não aplicar agora (pedido do Reginaldo). Se a v0.17 compilar e a equipe aprovar a leitura, replicar no ET200 em versão nova.
