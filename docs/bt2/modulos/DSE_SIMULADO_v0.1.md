# DSE simulado ideal (medidor 1.10.116)
**O quê:** no card "Simulação" (só Demo) há o par de olhos "DSE simulado". Clique abre o diálogo `dlgDseSim` com as 6 condições de aprovação (tempo 100 %, tensão máx/mín, frequência máx/mín, stand-by), cada uma com Aprovado/Reprovado. Tudo nasce APROVADO.
**Por quê:** o simulador reprovava sozinho (stand-by 106,6 % < 107 %). O DSE simulado deve ser ideal; a reprovação só acontece se o operador escolher.
**Como:** `DSE_SIM.apr[0..5]` (JS, em memória) → `dseSimAplica()` é chamada em `avaliaEnsaio()` **somente quando `T.simulado`**. Ensaio real nunca é alterado. Resultado e PDF (já marcado SIMULAÇÃO) usam o mesmo veredito; o Resultado mostra "condições definidas pelo DSE simulado".
**Limite:** muda o veredito, não os números medidos (stand-by mostrado continua o valor simulado). Estado volta a "tudo aprovado" ao recarregar a página.
**Teste:** Demo ligado → olhos → Reprovado na condição 6 → `avaliaEnsaio().final` = REPROVADO; "Tudo aprovado" → APROVADO.
