# Decisões tomadas sem o Reginaldo (08/11/2026) — critério de pontuação

O Reginaldo saiu e autorizou: "se tiver dúvida, formule as perguntas, analise e crie critério de pontuação; quem tiver mais pontos é a resposta".
**Critério:** nota 0 a 5 por item × peso. Maior soma ganha. Empate → a opção mais conservadora. **Segurança de produção e reversibilidade têm os maiores pesos**: nada aqui altera PC BT2, PLC 1515, DSE nem fluxo/HTML de produção.
Pesos: Segurança de produção ×5 · Reversibilidade ×4 · Fidelidade ao pedido ×3 · Dá para provar com teste ×2 · Custo ×1.

## D1 — Como investigar o "Setup/Salvar não funcionou" (Demo × Real)
| Opção | Seg | Rev | Fid | Prova | Custo | Soma |
|---|---|---|---|---|---|---|
| A. Teste no modo REAL (simulado): Node-RED + PLC simulado + simulador de bancada, DSE imitado por rota do navegador | 5 | 5 | 5 | 5 | 1 | **71** |
| B. Só análise de código + plano de teste | 5 | 5 | 3 | 2 | 4 | 62 |
| C. Esperar o Reginaldo contar a condição | 5 | 5 | 0 | 0 | 5 | 50 |
**Escolhida: A.** Resultado: `tests/integracao/fase5/demo_x_real_setup.test.js` (3 passam, 1 `todo`).

## D2 — Os abertos P3-E1 e P3-E2 (fila com PLC mudo; limpar registro sem janela de confirmação)
| Opção | Seg | Rev | Fid | Prova | Custo | Soma |
|---|---|---|---|---|---|---|
| A. Gerar fluxo novo (chaves/registro v3.6/v1.9) corrigindo | 1 | 3 | 3 | 4 | 1 | 38 |
| B. Só registrar como proposta, sem mudar fluxo | 5 | 5 | 2 | 2 | 5 | **60** |
**Escolhida: B.** Mexer em fluxo de produção exige backup e OK explícito (regra do projeto). Fica na lista de propostas abaixo.

## D3 — Teste de "dois aparelhos"
| Opção | Seg | Rev | Fid | Prova | Custo | Soma |
|---|---|---|---|---|---|---|
| A. Dois navegadores reais pela interface | 5 | 5 | 4 | 3 | 1 | 64 |
| B. Dois clientes HTTP simultâneos na mesma API (a fila do Node-RED é onde mora a corrida) | 5 | 5 | 4 | 5 | 4 | **76** |
**Escolhida: B.** `tests/integracao/fase5/dois_aparelhos.test.js` (2 passam, estável em 3 execuções).

## O que NÃO foi decidido por mim (fica para o Reginaldo)
1. A condição exata do Setup/Salvar que falhou na bancada (LL-040): provei no simulador **uma** divergência real (abaixo), mas não sei se foi essa.
2. Se o 91 kW fixo no modo Real é intencional.
3. Se o texto do bloqueio do Setup deve mudar (DR-1).
4. Qualquer mudança em fluxo ou HTML de produção.

## Achados desta rodada (todos provados no simulador; **nenhum provado na bancada**)
- **DR-0 (provado, comportamento por projeto):** no modo REAL, o Setup só informa o chaveamento ao PLC (DB3002) depois que os **Dados do ensaio** estão **confirmados** (tensão do gerador). Sem isso, selecionar chave é bloqueado e os 3 botões 220/380/440 V ficam **travados (somente leitura)**. No Demo local o chaveamento vem sozinho dos Dados padrão do Demo, por isso no Demo nunca aparece o bloqueio. É uma explicação plausível para "Salvar não funcionou": com os Dados confirmados, a chave é selecionada e o Salvar habilita (teste 2).
- **DR-1 (baixa, `todo`):** a mensagem de bloqueio diz só "Informe o chaveamento do banco (220 / 380 / 440 V)…" com os botões travados; **não diz que a tensão vem de "Dados do ensaio"** (só o chip ao lado diz). Proposta: trocar a mensagem por "O chaveamento vem da tensão dos Dados do ensaio: abra Dados do ensaio, informe a tensão e confirme".
- **DR-2 (A CONFIRMAR):** no REAL `KW_NOM = 91` fixo (comentário da v1.9.98 diz que é para voltar ao valor original). Se o gerador real não for 91 kW, o % de carga na tela fica errado. Caracterizado por teste (`KW_NOM === 91`).
- **Fundamento 1 (dois aparelhos):** 12 rodadas de ligar × desligar simultâneos da mesma chave: só códigos previstos (200/409/503/504), feedback coerente com o comando; Desligar banco prevalece sobre ligar chaves simultâneos. **Não prova o FB101 nem o tempo real do PLC.**

## Propostas (para o Reginaldo decidir; nada foi feito)
1. DR-1: trocar o texto do bloqueio (mudança só no HTML, versão nova).
2. P3-E1: fazer a fila falhar rápido quando o PLC não responde (fluxo novo; pede backup e OK).
3. P3-E2: janela de confirmação no `limpar` do registro (fluxo novo; pede backup e OK).
4. DR-2: confirmar com o Reginaldo o 91 kW e, se não for, ler a potência do modelo escolhido também no Real.
