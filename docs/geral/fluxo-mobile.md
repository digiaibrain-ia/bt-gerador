# Fluxo de trabalho: celular + GitHub + IA (sem PC da empresa)
1. Abrir uma issue no app do GitHub com o ajuste desejado.
2. A IA (Claude Code na web) cria a branch `feat|fix/...` e abre o Pull Request.
3. O Actions roda o build (e testes, quando existirem) no PR.
4. Revisar o diff e dar merge pelo app do GitHub.
5. Criar a tag `medidor-vX.Y.Z` (Releases → Draft new release). O Actions gera o HTML e anexa ao Release.
6. O operador baixa o `.html` do Release e abre no navegador.
7. Backup: salvar no Drive o projeto TIA, PDFs e dados de ensaio (manual, fora do Git).
