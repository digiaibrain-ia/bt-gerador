# Prompt de extrato das sessões do Project — v1.0 (10/11/2026)

Colar no começo (ou no fim) de uma sessão do Project e mandar o resultado para análise. O extrato é RELATO do assistente, não prova.

```
Você vai gerar um EXTRATO de ESTA conversa, para análise posterior. O extrato é RELATO do assistente, não prova: quem confere é o Reginaldo.

Regras obrigatórias:
1. Use SOMENTE o que está nesta conversa. Não complete com conhecimento de mercado, versões, datas ou "boas práticas". Se não estiver escrito aqui, escreva "não consta nesta conversa".
2. Comece declarando a COBERTURA em uma destas formas:
   - COMPLETA: você vê todas as mensagens desde a primeira.
   - PARCIAL: você vê a conversa a partir de algum ponto. Diga qual.
   - RESUMO: o começo existe só como resumo escrito por alguém. Diga quem escreveu e que não é texto original. Nesse caso o extrato inteiro é "relato de segunda mão".
3. SANITIZE: troque IP, senha, token, chave, e-mail e nomes de pessoas por [IP], [SENHA], [TOKEN], [EMAIL], [PESSOA]. Na tabela também.
4. Tabela: uma linha por PEDIDO DO REGINALDO, excluindo pedidos de extrato, de revisão de prompt e de relatório sobre o próprio extrato (esses ficam só em LACUNAS, se houver).
   Colunas: N | pedido do Reginaldo (frase curta, fiel) | ORIGEM | FONTE DA IDEIA | o que o assistente entregou | o que deu errado, SE ele relatou | regra afirmada pelo Reginaldo
   - ORIGEM: a intenção principal. Segunda intenção entre parênteses.
     BANCADA (viu algo no equipamento) · REGRA-EQUIPAMENTO (explicou como o equipamento funciona) · USO (dificuldade ao usar) · IDEIA-NOVA (pediu algo novo) · DECISAO-PENDENTE (pergunta de escolha ou comparação) · QUALIDADE (revisão, nome, padrão, correção de desenho)
   - FONTE DA IDEIA (obrigatória em toda linha): REGINALDO · OUTRA-PESSOA (papel, sem nome) · EQUIPAMENTO · SUGESTAO-ASSISTENTE (veio de sugestão sua ou do Claude Code, e ele aceitou ou mandou implementar) · NÃO-IDENTIFICADA. Em linhas de QUALIDADE ou USO, escreva "—". Não suponha: se não estiver escrito, NÃO-IDENTIFICADA.
   - Coluna de regra: só frase literal do Reginaldo entre aspas, com o número da mensagem. Uma aprovação ("este está correto") não é regra de equipamento; marque como APROVAÇÃO. Um prazo ou pedido de tarefa não é regra. Se não houver, "não consta".
5. Três listas separadas, cada item com fonte:
   a) FATOS DO EQUIPAMENTO: só o que o Reginaldo afirmou sobre o equipamento, com frase literal. Marca CONFIRMADO-PELO-REGINALDO.
   b) DECISÕES: só o que o Reginaldo decidiu com as próprias palavras. Nunca inclua sugestão do assistente aqui, nem como "não aprovada". Sugestões vão para c.
   c) SUPOSIÇÕES E SUGESTÕES DO ASSISTENTE: tudo que você afirmou sem ele confirmar, inclusive contratos, rotas, mecanismos e nomes que você propôs.
   Relato de ação não é prova: "instalei X" vira "RELATO-DE-AÇÃO: Reginaldo relatou ter instalado X".
6. Erros e retrabalhos: quem relatou o erro (Reginaldo ou você). Causa raiz SOMENTE se aparecer no texto, com a fonte: "segundo a mensagem de erro colada", "relatada pelo Reginaldo", "inferência do assistente" ou "causa não identificada".
7. Se passar de 40 linhas, entregue em partes e termine com "CONTINUA — digite 'continue'".
8. LACUNAS (seção própria, sempre): trechos faltando, resumidos, quebrados ou fora de ordem; pedidos citados num resumo sem mensagem visível; anexos, prints e textos descritos mas não visíveis; atividade em outras conversas. Para cada uma, o efeito provável sobre o extrato. Se não houver, "nenhuma visível".
9. Não suponha continuidade: não escreva que um pedido "veio do anterior" a menos que o próprio Reginaldo tenha dito isso.
10. Fechamento: "Trecho coberto: [início] a [fim]" e "Trechos não visíveis: [...]".
```
