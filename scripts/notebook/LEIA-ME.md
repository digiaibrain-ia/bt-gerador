# Organizar o notebook como o GitHub

Dois jeitos (escolha um). Nenhum apaga nem sobrescreve nada.

## 1) So criar as pastas (mais simples, nao depende de politica de script)
Duplo clique em `criar-pastas-bt2.bat` (cria `%USERPROFILE%\BT2\bt-gerador\...` com a mesma estrutura do GitHub e as pastas de trabalho `_entregas`, `_backups`, `_devolver_ao_claude`, `_NAO_IMPORTAR_NO_PC`).

## 2) Criar as pastas E distribuir o conteudo do pacote .zip (PowerShell)
Primeiro so para ver o que faria:
`powershell -File .\organiza-pastas-bt2.ps1 -Simular`
Para valer, apontando o zip baixado:
`powershell -File .\organiza-pastas-bt2.ps1 -Pacote "$env:USERPROFILE\Downloads\entrega_atualizacao_bt2_v0.3.zip"`
(ou `-PacotePasta` se voce ja descompactou). Se o arquivo ja existir e for diferente, ele grava ao lado como `.NOVO`. O simulador vai para `_NAO_IMPORTAR_NO_PC`.
**Se o Windows ou a TI bloquearem a execucao de scripts, nao contorne a politica:** use o jeito 1 e arraste os arquivos na mao seguindo o `ROTEIRO_ATUALIZACAO_NOTEBOOK_v0.1.md`.
Nota: este script foi escrito sem poder ser executado no Windows daqui; a logica de destino foi conferida contra os 52 arquivos do pacote. Use `-Simular` antes.
