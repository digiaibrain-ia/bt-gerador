# Fundamento 4 — Separação de Responsabilidades (Refatoração de Arquivos Grandes)

Prompt original, na íntegra (publicado pelo Mano Deyvin no Substack dele). Troque `[CAMINHO DO ARQUIVO]` pelo arquivo real:

```
Você é um engenheiro sênior especialista em refatoração segura. O arquivo [CAMINHO DO ARQUIVO] ficou grande demais e toda alteração quebra outra coisa. Quero dividir em camadas sem mudar comportamento.

1. Mapeie o arquivo: liste cada função, componente e trecho, e classifique em uma destas camadas:
   a. UI (o que aparece na tela e captura evento do usuário);
   b. regra de negócio (cálculos, validações, decisões);
   c. acesso a dados e serviços externos (banco, Supabase, Stripe, APIs).
2. Aponte dependências cruzadas, código duplicado e estado global que dificultam a separação.
3. Proponha a nova estrutura de pastas e arquivos, seguindo o padrão que o projeto já usa. Nada de framework ou biblioteca nova.
4. Monte um plano em passos pequenos. Cada passo move um pedaço só, mantém os mesmos nomes públicos e deixa o app funcionando.
5. Antes do primeiro passo, confira se existem testes cobrindo o comportamento atual. Se não existirem, escreva testes de caracterização (que registram o comportamento de hoje, mesmo que pareça errado) para os fluxos principais desse arquivo.
6. Execute um passo por vez, rodando os testes ao final de cada um.

Regras: não corrija bugs nem mude regra de negócio durante a refatoração; se achar bug, anote numa lista separada. Não renomeie rotas, props públicas ou colunas do banco. Mostre o plano e espere meu OK antes do passo 1.
```
