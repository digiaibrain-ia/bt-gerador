# Regras do projeto BT2 (banco de cargas)

Estas regras valem para qualquer sessao neste repositorio. Escritas em portugues, para o Reginaldo e a equipe.

## Seguranca e producao
- Nunca alterar o PC BT2 de producao, o PLC 1515 ou o DSE a partir do repositorio ou de uma sessao. O PC nao acessa o GitHub: tudo chega por pacote .zip.
- Nenhuma mudanca em PLC ou Node-RED de producao sem backup antes e OK explicito do Reginaldo.
- Carga de potencia sempre DESACOPLADA durante qualquer teste em bancada.
- O simulador (`simulador-dse-demo-v7`) nunca vai para o PC de producao.
- Nao colocar IP real, senha, token ou chave no Git. Enderecos vem de variavel do PM2 (`PLC_IP`, `DSE_URL`).

## Metodo de trabalho
- Antes de alterar arquivo de producao: mostrar plano e causa, e esperar OK.
- Mudanca vai para versao nova (ex.: `v3.5`), nunca sobrescrever a anterior. Gerar por script em `nodered/gerador/`.
- Teste que falha deve ser registrado como `todo` com ID e gravidade, nao apagado nem enfraquecido.
- Achado fora do escopo vai para `BACKLOG_FORA_DE_ESCOPO.md`, nao e corrigido no meio de outra tarefa.
- Relatorio honesto: dizer o que foi provado (PLC simulado) e o que depende da bancada ou da TI.

## Ordem da atualizacao
1. Backup (TIA e Node-RED exportado).
2. Etapa 1 do PLC: renumerar DBs (DB150 -> DB3000 etc.), so no 1515.
3. Importar os JSON novos no Node-RED, uma aba por vez.
4. Etapas 2 e 3 (BC550, BC595), com blocos do ET200/1200.
5. Checklist de bancada (`docs/bt2/migracao/CHECKLIST_BANCADA_v0.1.md`).

PLC e Node-RED mudam juntos: DB novo no PLC pede o fluxo novo logo depois.

## Comunicacao
- Respostas curtas e diretas, em portugues, especialmente para comandos.
- Explicar passos de Windows/PowerShell com o caminho exato.
- Nao pedir aprovacao ao Gemini; o processo com ele foi encerrado.

## SQL Server (futuro)
- Nao fazer nada agora. Quando for a hora: fora do caminho de comando, gravacao assincrona, credenciais so em variavel do PM2.
