# Fundamento 1 — Race Condition (Condição de Corrida)

Prompt original, na íntegra (publicado pelo Mano Deyvin no Substack dele):

```
Você é um engenheiro sênior revisando um app que eu construí com IA. Quero achar e corrigir race conditions (condições de corrida).

1. Varra o código e liste todo lugar que faz "ler, decidir e depois gravar": criação de pedido, baixa de estoque, uso de cupom, saldo, créditos, vagas, convites, contadores, qualquer recurso limitado.
2. Para cada ocorrência, explique em uma frase o que acontece se 2 requisições iguais chegarem no mesmo milissegundo (ex.: pedido duplicado, estoque negativo, cupom usado 2 vezes).
3. Proponha a correção mais simples que resolve no banco, nesta ordem de preferência:
   a. constraint única (unique index) que impede o registro duplicado;
   b. operação atômica no próprio banco (ex.: UPDATE estoque SET qtd = qtd - 1 WHERE id = X AND qtd > 0, conferindo as linhas afetadas);
   c. transação com lock da linha (SELECT ... FOR UPDATE) quando a regra for mais complexa.
4. No front, desabilite o botão durante o envio, mas trate isso como conforto de UX. A proteção de verdade fica no servidor e no banco.
5. Para cada correção, escreva um teste que dispara 2 requisições simultâneas e prova que só uma tem efeito.

Regras: não proponha Redis, fila, lock em memória ou qualquer infraestrutura nova se o banco resolve; se achar que precisa, me explique por que o banco não basta antes. Me mostre a lista completa e o plano antes de alterar qualquer arquivo. Toda migration nova deve ser revisada por mim antes de rodar. Se já existirem dados duplicados que impeçam criar a constraint, me avise e proponha como limpar, sem apagar nada sozinho.
```
