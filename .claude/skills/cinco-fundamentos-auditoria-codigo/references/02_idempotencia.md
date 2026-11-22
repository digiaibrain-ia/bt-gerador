# Fundamento 2 — Idempotência

Prompt original, na íntegra (publicado pelo Mano Deyvin no Substack dele):

```
Você é um engenheiro sênior especialista em pagamentos. Quero que todo webhook e todo endpoint de pagamento do meu app aceite repetição sem efeito duplicado (idempotência).

1. Liste todos os webhooks recebidos (Stripe ou outro gateway) e todos os endpoints que cobram, liberam plano, creditam saldo ou mandam e-mail transacional.
2. Webhooks:
   a. confirme que a assinatura do webhook é verificada com o corpo bruto da requisição antes de qualquer processamento;
   b. crie uma tabela de eventos processados com o ID do evento como chave única;
   c. ao receber um evento, tente gravar o ID primeiro; se já existir, responda 200 e não faça mais nada;
   d. não dependa da ordem de chegada dos eventos: quando precisar do estado atual, busque o objeto na API do gateway;
   e. responda 2xx rápido e mande o trabalho pesado para uma fila ou processamento assíncrono, se o projeto já tiver essa estrutura.
3. Chamadas que EU faço ao gateway (criar cobrança, assinatura, reembolso): envie uma idempotency key (UUID v4) gerada uma vez por operação de negócio e reaproveitada em caso de nova tentativa.
4. Endpoints do meu app que criam pedido ou pagamento: aceite um header Idempotency-Key do cliente e devolva a mesma resposta se a chave se repetir.
5. Escreva testes que enviam o mesmo evento 2 vezes, e 2 vezes ao mesmo tempo, e provam que o efeito acontece só uma vez.

Regras: mostre o plano antes de alterar código. Não mude valores, preços nem regras de cobrança. Não use dado pessoal (e-mail, CPF) como chave de idempotência.
```
