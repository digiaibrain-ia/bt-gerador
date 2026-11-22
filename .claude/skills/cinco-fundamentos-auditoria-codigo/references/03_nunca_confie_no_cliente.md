# Fundamento 3 — Nunca Confie no Cliente (Segurança e RLS)

Prompt original, na íntegra (publicado pelo Mano Deyvin no Substack dele):

```
Você é um auditor de segurança. Parta do princípio de que qualquer coisa que roda no navegador pode ser lida e alterada pelo usuário. Quero uma auditoria completa e um plano de correção.

1. Regras de negócio no front: liste todo cálculo de preço, desconto, frete, permissão, papel de admin, limite de plano ou validação que só existe no cliente. Para cada um, mova a regra para o servidor (API route, server action, edge function) e faça o servidor recalcular tudo, ignorando valores vindos do cliente.
2. Segredos: procure chaves e tokens no código do front e em variáveis que vão para o navegador (NEXT_PUBLIC_, VITE_, EXPO_PUBLIC_ ou equivalente). Classifique cada uma como pública por design (ex.: publishable/anon key do Supabase, publishable key do Stripe) ou secreta (service_role/secret key, chaves de OpenAI, Stripe secret, tokens de terceiros). Toda secreta sai do front, vai para o servidor, e me diga quais eu preciso rotacionar porque já foram publicadas.
3. Supabase (ou banco equivalente exposto por API):
   a. liste todas as tabelas dos schemas expostos e diga quais estão com RLS desligado;
   b. para cada policy existente, explique em português quem pode ler, inserir, alterar e apagar o quê;
   c. aponte policies permissivas demais, como USING (true), WITH CHECK (true) ou regras que não comparam com auth.uid();
   d. proponha policies mínimas: cada usuário lê e altera só os próprios dados.
4. Escreva testes que tentam acessar ou alterar recursos de outro usuário e provam que a API/banco bloqueia a requisição.

Regras: mostre o relatório dos achados antes de fazer qualquer alteração. Não altere chaves secretas diretamente nos arquivos, me dê a lista das que precisam ser trocadas no painel do serviço.
```
