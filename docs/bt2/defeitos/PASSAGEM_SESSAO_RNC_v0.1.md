# Passagem de sessão: sistema de RNC e retrabalho do gerador (piloto sem SQL) - v0.1 (13/11/2026)

Documento autossuficiente para a sessão nova. Origem: sessão BT2, branch `ccr-4f9e06b7-bw4qef` do repositório `digiaibrain-ia/bt-gerador` (CLAUDE.md e BACKLOG_FORA_DE_ESCOPO.md estão nessa branch, não na `main`).

## 1. O que o Reginaldo quer
Controlar a QUALIDADE e o RETRABALHO do produto (o gerador), como em sistemas MES/QMS, com RNC (Registro de Não Conformidade). NÃO é CMMS.

Fluxo:
1. Cada gerador é identificado pelo número de série.
2. O operador, durante o ensaio, registra o defeito ou erro de montagem (RNC), pelo HTML.
3. O gerador fica BLOQUEADO para expedição até ser consertado.
4. O gerador sai do banco de teste para reparo. Outro operador abre outro HTML, vê o que foi apontado, faz a correção e registra o que fez, a peça trocada, quem fez e quando.
5. O gerador volta ao banco para RE-TESTE (novo ensaio do mesmo número de série). Só depois de passar é liberado.

Telas: dois HTMLs. Registro (o operador alimenta durante o ensaio) e Reparo (cards por estado, estilo kanban: Aberta, Bloqueado, Em reparo, Reparado, Aguardando reteste, Liberado; ou Reprovado).
Referências de campos e fluxo: MES/QMS, RNC, retrabalho e rastreabilidade por série. NÃO usar NocoDB nem Atlas.

## 2. Premissas técnicas já combinadas
- Piloto SEM SQL. Só informativo: nada comanda PLC, chave ou DSE.
- Fluxo Node-RED NOVO, separado do fluxo das chaves.
- Gravação em arquivo JSON/JSONL no PC (não localStorage: os dois operadores usam PCs diferentes). Estruturar como tabela desde o início, para o SQL entrar depois sem refazer.
- Edição simultânea: número de revisão por registro (quem salva com versão velha recebe aviso).
- Backup diário e exportação para CSV. Fotos em pasta, com limite de tamanho (não dentro do JSON).
- Autoria: sem login, nome digitado (serve para o piloto).
- No medidor (versão nova, nunca sobrescrever), o botão "Registrar defeito" anexa modelo, etapa, hora, grandezas e alarmes do DSE.
- O PC BT2 não acessa o GitHub: tudo chega por pacote .zip. Nunca alterar o PC BT2 de produção, o PLC ou o DSE a partir do repositório ou de uma sessão.
- O menu ☰ do medidor (v1.10.201) lista as ferramentas do grupo "Operação" do catálogo: o Registro entraria nesse grupo.
- Fora do escopo do piloto: peças, estoque, preventiva e ordem de serviço completa.

## 3. Decisões que o Reginaldo precisa responder antes do plano
1. Quantos geradores por mês e como o fluxo é controlado hoje (papel, Excel ou sistema)?
2. O reparo acontece na mesma rede do PC BT2 (os dois PCs gravam no mesmo arquivo pelo Node-RED)?
3. A foto é obrigatória no registro?
4. O Reparo fica na operação ou só no dev?
5. O medidor deve avisar (informativo, sem bloquear) ao iniciar ou gravar um ensaio de um número de série com RNC aberta?
Chave do gerador assumida: número de série (confirmar).

## 4. Seções do BACKLOG_FORA_DE_ESCOPO.md sobre este tema (cópia)
## (13/11/2026) IDEIA: página de input de RELATÓRIO DE DEFEITOS durante o ensaio (HTML + SQL)
- **Origem (Reginaldo):** há situações impossíveis de testar no gerador até as devidas correções; a ideia é registrar os defeitos durante o ensaio, tudo pelo HTML e SQL.
- **Estado:** só ideia. Não foi feito nada. Pela regra do projeto (SQL Server: "não fazer nada agora"), quando for a hora: fora do caminho de comando, gravação assíncrona, credenciais só em variável do PM2.
- **Perguntas para quando começar:** quais campos o operador preenche (modelo, etapa, tipo de defeito, texto livre, foto?); se o registro entra no relatório do ensaio; onde fica a página (operação ou dev); se grava primeiro no Node-RED/arquivo e o SQL entra depois.
- **Menu ☰:** quando a página existir, entra no catálogo no grupo "Operação" (aparece no menu da operação).
- **(13/11/2026) Análise de viabilidade (sessão BT2) — entregue ao Reginaldo; tema segue em NOVA sessão.** Piloto SEM SQL: 1 fluxo Node-RED novo (criar/listar/atualizar/foto), 2 HTMLs (Registro durante o ensaio; Reparo com cards por estado Aberto/Em reparo/Concluído, estilo kanban), gravação em JSON/JSONL no PC (não localStorage: cada PC teria o seu). Só informativo (nada comanda PLC/chave), fluxo separado das chaves. O botão "Registrar defeito" no medidor já anexa modelo, etapa, hora, grandezas e alarmes do DSE. Referências de campos/estados/cards: NocoDB e Atlas CMMS (não instalar). Riscos: edição simultânea (número de revisão), perda de dados (backup + CSV), identificação do gerador, fotos em pasta, rede do PC de reparo, autoria sem login, escopo (peças/estoque/preventiva ficam fora).
- **Decisões pendentes do Reginaldo para a nova sessão:** (1) chave do gerador: nº de série ou da OS; (2) o reparo acontece na mesma rede do PC BT2?; (3) foto obrigatória no registro?; (4) o Reparo fica na operação ou só no dev?
- **(13/11/2026) CORREÇÃO DE CONCEITO (Reginaldo):** NÃO é CMMS (manutenção da máquina). É controle de QUALIDADE e RETRABALHO do produto (o gerador): **RNC (Registro de Não Conformidade) / ordem de retrabalho**, como em MES/QMS. Fluxo: montagem → falha apontada no ensaio → bloqueio (não vai para expedição) → área de reparo (técnico vê o que foi apontado, conserta, registra peça trocada, libera) → RE-TESTE na bancada → só então liberado. Chave = número de série (QR/código de barras). Referências a usar: MES/QMS (rastreabilidade por série, desvio para retrabalho, RNC, plano de ação), NÃO NocoDB/Atlas. Estados sugeridos: Aberta → Bloqueado → Em reparo → Reparado → Aguardando reteste → Liberado (ou Reprovado/sucata). Perguntas novas: quantos geradores por mês; como o fluxo é controlado hoje (papel, Excel, sistema).


## 5. Regras do projeto (CLAUDE.md, cópia integral)
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
