# Fundamento 5 — Testes de Integração (Travar o Comportamento)

Prompt original, na íntegra (publicado pelo Mano Deyvin no Substack dele):

```
Você é um especialista em testes automatizados. Quero criar uma rede de segurança com testes de integração nos fluxos mais críticos do meu app antes de mexer em código legado.

1. Liste os fluxos críticos de ponta a ponta do projeto (ex.: cadastro, login, checkout, webhook, fluxo principal de uso).
2. Para cada fluxo, escreva um teste de integração que:
   a. usa uma frase clara (com it/test) descrevendo o comportamento esperado do usuário/sistema;
   b. testa o caminho feliz e os principais erros (ex.: dados inválidos, falha de serviço externo);
   c. passa pelo front/rota simulada batendo no backend e no banco de dados local.
3. Configuração do ambiente de teste:
   a. garanta que o banco de testes seja local (ex.: container ou arquivo separado);
   b. inclua uma trava expressa que impeça rodar os testes se a URL do banco apontar para produção.
4. Me entregue o comando exato para rodar os testes (npm test, pytest, rake, etc.).

Regras: mostre o plano e os arquivos de teste antes de gravar no disco. Proibido criar testes unitários mockando tudo a ponto de não testar a integração real. Proibido rodar testes em banco de produção em hipótese alguma.
```
