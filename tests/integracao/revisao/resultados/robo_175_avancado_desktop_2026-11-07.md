# Dev/Operador oculto — relatório

- Versão do HTML: 1.10.175
- Modo: Demo local
- Duração: 4min 13s
- Resultado: **152 OK · 1 FALHA · 6 AVISO**

## Preparação

- ✔ perfil da tela — `1280×800 px · DPR 1 · mouse · Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.`

## Chaves (⚙)

- ⚠ chaves já habilitadas — `todas as 56 chaves estavam habilitadas: nada a mudar`
- ⚠ chaves já habilitadas — `todas as 56 chaves estavam habilitadas: nada a mudar`

## U1 · Varredura da página

- ✖ **FALHA** coberto por outro elemento: [dlgDados] input "digite parte do nome: 40 kva 220 mwm…" — `o clique cairia em div#dErr (em dlgDados) ret=62,569,1155,20 objeto=832,561,375,35 scrollY=0 html=<div class="jerr" id="dErr"></div>`

## Menu do botão direito

- ✔ menu do botão direito abriu e fechou em 20 posições

## Patamar guiado

- ✔ há chips de patamar (30/50/100/107 %) — `4 chip(s)`
- ✔ patamar 30% da carga · 1 min: sugerir → sugestão ok — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ⚠ patamar 30% da carga · 1 min: Aplicar comandou 3 chave(s) — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ✔ ⛔ Abrir TODAS deixa 0 chave ligada/comandada (30% da carga · 1 min) — `0 ainda ligada(s)`
- ✔ patamar 50% da carga · 1 min: sugerir → sugestão ok — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ⚠ patamar 50% da carga · 1 min: Aplicar comandou 5 chave(s) — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ✔ ⛔ Abrir TODAS deixa 0 chave ligada/comandada (50% da carga · 1 min) — `0 ainda ligada(s)`
- ✔ patamar 100% da carga · 5 min: sugerir → sugestão ok — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ⚠ patamar 100% da carga · 5 min: Aplicar comandou 7 chave(s) — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ✔ ⛔ Abrir TODAS deixa 0 chave ligada/comandada (100% da carga · 5 min) — `0 ainda ligada(s)`
- ✔ patamar 107% da carga · 2 min: sugerir → sugestão ok — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ⚠ patamar 107% da carga · 2 min: Aplicar comandou 6 chave(s) — `Seleção 30 kWAlvo 30,0 kW (30 %)Diferença 0,0 kWLimite 110 kW`
- ✔ ⛔ Abrir TODAS deixa 0 chave ligada/comandada (107% da carga · 2 min) — `0 ainda ligada(s)`

## Ensaio

- ✔ simulação em AUTO
- ✔ velocidade 10× — `sp=10`
- ✔ gerador simulado parou (STOP do Demo) — `SIM.gen=parado`
- ✔ INICIAR abre "Dados do ensaio"
- ✔ o botão do popup diz "Iniciar ensaio" — `Iniciar ensaio`
- ✔ confirmar os dados arma o ensaio — `dlgDados=false T.started=true · Dados enviados ao PLC. Gerador já operando — cronômetro iniciado.`
- ✔ ensaio armado: botão Setup aparece bloqueado — `cfgbtn inl nao`
- ✔ ensaio armado: clicar em Setup não abre o popup — `Setup bloqueado: há um ensaio em andamento (inclusive pausado). Use PARAR ENSAIO antes de `
- ✔ ensaio armado: seletora do BC56 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC56 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ ensaio armado: seletora do BC400 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC400 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ ensaio armado: seletora do BC59,5 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC59,5 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ ensaio armado: seletora do BC550 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC550 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ gerador simulado operando — `SIM.gen=operando`
- ✔ cronômetro conta (T.run) — `T.run=true`
- ✔ etapa 1 (0%): carga dentro da tolerância do alvo — `carga=0.0% alvo=0% TOL=10`
- ✔ etapa 1 cumprida: botão Salvar da tabela disponível e piscando — `class=svbtn pede disabled=false texto=Salvar`
- ✔ etapa 1: SALVAR grava e o ensaio avança — `SNAP=true T.et=2 · `
- ✔ etapa 2 (30%): carga dentro da tolerância do alvo — `carga=29.5% alvo=30% TOL=10`
- ✔ etapa 2 cumprida: botão Salvar da tabela disponível e piscando — `class=svbtn pede disabled=false texto=Salvar`
- ✔ etapa 2: SALVAR grava e o ensaio avança — `SNAP=true T.et=3 · `
- ✔ etapa 3 (50%): carga dentro da tolerância do alvo — `carga=51.1% alvo=50% TOL=10`
- ✔ etapa 3 cumprida: botão Salvar da tabela disponível e piscando — `class=svbtn pede disabled=false texto=Salvar`
- ✔ etapa 3: SALVAR grava e o ensaio avança — `SNAP=true T.et=4 · `
- ✔ etapa 4 (100%): carga dentro da tolerância do alvo — `carga=101.4% alvo=100% TOL=10`
- ✔ etapa 4 cumprida: botão Salvar da tabela disponível e piscando — `class=svbtn pede disabled=false texto=Salvar`
- ✔ etapa 4: SALVAR grava e o ensaio avança — `SNAP=true T.et=5 · `
- ✔ etapa 5 (107%): carga dentro da tolerância do alvo — `carga=108.3% alvo=107% TOL=10`
- ✔ etapa 5 cumprida: botão Salvar da tabela disponível e piscando — `class=svbtn pede disabled=false texto=Salvar`
- ✔ etapa 5: SALVAR grava e o ensaio avança — `SNAP=true T.et=6 · `
- ✔ etapa 6 (0%): carga dentro da tolerância do alvo — `carga=0.0% alvo=0% TOL=10`
- ✔ etapa 6 cumprida: botão Salvar da tabela disponível e piscando — `class=svbtn pede disabled=false texto=Salvar`
- ✔ etapa 6: SALVAR grava e o ensaio avança — `SNAP=true T.et=6 · `
- ✔ todas as 6 etapas ficaram salvas — `✔✔✔✔✔✔`
- ✔ FINALIZAR libera ao final das etapas
- ✔ etapas cumpridas (antes de FINALIZAR): botão Setup aparece bloqueado — `cfgbtn inl nao`
- ✔ etapas cumpridas (antes de FINALIZAR): clicar em Setup não abre o popup — `Setup bloqueado: há um ensaio em andamento (inclusive pausado). Use PARAR ENSAIO antes de `
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC56 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC56 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC400 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC400 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC59,5 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC59,5 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC550 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC550 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ BC56: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC56 desligado: chaves soltas.`
- ✔ BC56: "Ligar banco" fica TRAVADO durante o ensaio — `lig=false · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até parar o ens`
- ✔ BC400: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC400 desligado: chaves soltas.`
- ✔ BC400: "Ligar banco" fica TRAVADO durante o ensaio — `lig=false · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até parar o ens`
- ✔ BC59,5: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC59,5 desligado: chaves soltas.`
- ✔ BC59,5: "Ligar banco" fica TRAVADO durante o ensaio — `lig=false · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até parar o ens`
- ✔ BC550: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC550 desligado: chaves soltas.`
- ✔ BC550: "Ligar banco" fica TRAVADO durante o ensaio — `lig=false · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até parar o ens`
- ✔ FINALIZAR encerra o ensaio e abre o resultado — `T.fim=true dlgRes=true · `
- ✔ o resultado traz o "Resultado final" — `Resultado final: APROVADO · condições definidas pelo DSE simulado`
- ✔ resultado sem etapas faltando
- ✔ "Gravar sem relatório" grava o ensaio — `T.gravado=true`
- ✔ depois de gravar, o botão Setup volta a ficar liberado — `cfgbtn inl`
- ✔ BC56: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC56: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`
- ✔ BC400: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC400: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`
- ✔ BC59,5: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC59,5: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`
- ✔ BC550: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC550: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`
- ✔ simulação em AUTO
- ✔ velocidade 10× — `sp=10`
- ✔ gerador simulado parou (STOP do Demo) — `SIM.gen=parado`
- ✔ INICIAR abre "Dados do ensaio"
- ✔ o botão do popup diz "Iniciar ensaio" — `Iniciar ensaio`
- ✔ confirmar os dados arma o ensaio — `dlgDados=false T.started=true · Dados enviados ao PLC. Gerador já operando — cronômetro iniciado.`
- ✔ ensaio armado: botão Setup aparece bloqueado — `cfgbtn inl nao`
- ✔ ensaio armado: clicar em Setup não abre o popup — `Setup bloqueado: há um ensaio em andamento (inclusive pausado). Use PARAR ENSAIO antes de `
- ✔ ensaio armado: seletora do BC56 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC56 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ ensaio armado: seletora do BC400 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC400 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ ensaio armado: seletora do BC59,5 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC59,5 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ ensaio armado: seletora do BC550 aparece travada — `bkchip s-auto s-bt trav`
- ✔ ensaio armado: seletora do BC550 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ gerador simulado operando — `SIM.gen=operando`
- ✔ cronômetro conta (T.run) — `T.run=true`
- ✔ etapa 1 (0%): carga dentro da tolerância do alvo — `carga=0.0% alvo=0% TOL=10`
- ✔ etapa 1 cumprida: botão Salvar da tabela disponível e piscando — `class=svbtn pede disabled=false texto=Salvar`
- ✔ etapa 1: SALVAR grava e o ensaio avança — `SNAP=true T.et=2 · `
- ✔ etapa 2 (30%): carga dentro da tolerância do alvo — `carga=30.3% alvo=30% TOL=10`
- ✔ etapa 2 cumprida: botão Salvar da tabela disponível e piscando — `class=svbtn pede disabled=false texto=Salvar`
- ✔ etapa 2: SALVAR grava e o ensaio avança — `SNAP=true T.et=3 · `
- ✔ etapa 3 (50%): carga dentro da tolerância do alvo — `carga=51.2% alvo=50% TOL=10`
- ✔ etapa 3 cumprida: botão Salvar da tabela disponível e piscando — `class=svbtn pede disabled=false texto=Salvar`
- ✔ etapa 3: SALVAR grava e o ensaio avança — `SNAP=true T.et=4 · `
- ✔ etapa 4 (100%): carga dentro da tolerância do alvo — `carga=103.0% alvo=100% TOL=10`
- ✔ etapa 4 cumprida: botão Salvar da tabela disponível e piscando — `class=svbtn pede disabled=false texto=Salvar`
- ✔ etapa 4: SALVAR grava e o ensaio avança — `SNAP=true T.et=5 · `
- ✔ etapa 5 (107%): carga dentro da tolerância do alvo — `carga=110.9% alvo=107% TOL=10`
- ✔ etapa 5 cumprida: botão Salvar da tabela disponível e piscando — `class=svbtn pede disabled=false texto=Salvar`
- ✔ etapa 5: SALVAR grava e o ensaio avança — `SNAP=true T.et=6 · `
- ✔ etapa 6 (0%): carga dentro da tolerância do alvo — `carga=0.0% alvo=0% TOL=10`
- ✔ etapa 6 cumprida: botão Salvar da tabela disponível e piscando — `class=svbtn pede disabled=false texto=Salvar`
- ✔ etapa 6: SALVAR grava e o ensaio avança — `SNAP=true T.et=6 · `
- ✔ todas as 6 etapas ficaram salvas — `✔✔✔✔✔✔`
- ✔ FINALIZAR libera ao final das etapas
- ✔ etapas cumpridas (antes de FINALIZAR): botão Setup aparece bloqueado — `cfgbtn inl nao`
- ✔ etapas cumpridas (antes de FINALIZAR): clicar em Setup não abre o popup — `Setup bloqueado: há um ensaio em andamento (inclusive pausado). Use PARAR ENSAIO antes de `
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC56 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC56 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC400 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC400 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC59,5 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC59,5 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC550 aparece travada — `bkchip s-auto s-bt trav`
- ✔ etapas cumpridas (antes de FINALIZAR): seletora do BC550 não muda durante o ensaio — `sel auto→auto · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até p`
- ✔ BC56: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC56 desligado: chaves soltas.`
- ✔ BC56: "Ligar banco" fica TRAVADO durante o ensaio — `lig=false · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até parar o ens`
- ✔ BC400: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC400 desligado: chaves soltas.`
- ✔ BC400: "Ligar banco" fica TRAVADO durante o ensaio — `lig=false · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até parar o ens`
- ✔ BC59,5: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC59,5 desligado: chaves soltas.`
- ✔ BC59,5: "Ligar banco" fica TRAVADO durante o ensaio — `lig=false · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até parar o ens`
- ✔ BC550: "Desligar banco" continua liberado durante o ensaio — `lig=false · BC550 desligado: chaves soltas.`
- ✔ BC550: "Ligar banco" fica TRAVADO durante o ensaio — `lig=false · Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até parar o ens`
- ✔ FINALIZAR encerra o ensaio e abre o resultado — `T.fim=true dlgRes=true · `
- ✔ o resultado traz o "Resultado final" — `Resultado final: APROVADO · condições definidas pelo DSE simulado`
- ✔ resultado sem etapas faltando
- ✔ "Gravar sem relatório" grava o ensaio — `T.gravado=true`
- ✔ depois de gravar, o botão Setup volta a ficar liberado — `cfgbtn inl`
- ✔ BC56: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC56: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`
- ✔ BC400: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC400: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`
- ✔ BC59,5: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC59,5: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`
- ✔ BC550: seletora destravada — `bkchip s-auto s-bt`
- ✔ BC550: seletora e "Ligar banco" voltam a funcionar — `sel=auto lig=true`

## Cobertura

- ✔ 148 de 155 objetos acionados (95 %); 88 não acionados

## Caixa de areia

- ✔ efeitos bloqueados/contados — `{"print":1,"janelaNova":4,"alerta":2,"confirmacao":1,"prompt":0,"redeBloqueada":0,"seletor":3,"download":1}`

## JavaScript

- ✔ nenhum erro de JavaScript durante o teste


## Cobertura e contexto

- Modo do robô: **avancado** · semente 20261107
- Tela: 1280×800 px · DPR 1 · mouse
- Objetos acionados: 148 de 155
- Caixa de areia (bloqueado/contado): {"print":1,"janelaNova":4,"alerta":2,"confirmacao":1,"prompt":0,"redeBloqueada":0,"seletor":3,"download":1}

### Não acionados (88)

- button#bGenStop "■ STOP" [desabilitado]
- button#bParaEns "Para o ENSAIO (diferente do gerador, q" [desabilitado]
- [dlgModo] button#ensM_auto "Modo automático: disponível futurament" [desabilitado]
- [dlgDados] button#sapLer "Ler dados do print" [desabilitado]
- [dlgDados] button#sapLimpa "Remover imagem" [desabilitado]
- [dlgDados] input "digite parte do nome: 40 kva 220 mwm…" [coberto por div#dErr (em dlgDados) ret=62,569,1155,20 objeto=832,561,375,35 scrollY=0 html=<div class="jerr" id="dErr"></div>]
- button#bFim "Só libera ao final do teste (todas as " [desabilitado]
- button#bPau "PAUSAR" [escondido agora]
- h2 "Clique para recolher" [escondido agora]
- span#dseOlhos "DSE simulado (ideal): clique para esco" [escondido agora]
- button#mMan "Simulação da CARGA (só no DEMO) — não " [escondido agora]
- button#mAuto "Simulação da CARGA (só no DEMO) — não " [escondido agora]
- input#simCarga "0" [escondido agora]
- button "1×" [escondido agora]
- button "5×" [escondido agora]
- button "8×" [escondido agora]
- button "10×" [escondido agora]
- button#bGuiado "Assistente que sugere as chaves de cad" [escondido agora]
- button#bPlacas "Placas dos bancos de carga" [escondido agora]
- button#bTroca "Informe aqui quando trocar a resistênc" [escondido agora]
- button#bChaves "Habilitar/desabilitar cada chave (não " [escondido agora]
- button#btSetup "Setup do kW real/resistência, chave a " [escondido agora]
- summary "Banco de 56 kW⇄ Seletora: Auto (remoto" [escondido agora]
- button "Ensaio em andamento: a seletora e o "L" [escondido agora]
- button "Simula o comando Ligar banco do BC56 (" [escondido agora]
- div "BC56 · chave 1 de 13 · 5 kW · desligad" [escondido agora]
- div "BC56 · chave 2 de 13 · 5 kW · desligad" [escondido agora]
- div "BC56 · chave 3 de 13 · 5 kW · desligad" [escondido agora]
- div "BC56 · chave 4 de 13 · 5 kW · desligad" [escondido agora]
- div "BC56 · chave 5 de 13 · 5 kW · desligad" [escondido agora]
- div "BC56 · chave 6 de 13 · 4 kW · desligad" [escondido agora]
- div "BC56 · chave 7 de 13 · 4 kW · desligad" [escondido agora]
- div "BC56 · chave 8 de 13 · 4 kW · desligad" [escondido agora]
- div "BC56 · chave 9 de 13 · 4 kW · desligad" [escondido agora]
- div "BC56 · chave 10 de 13 · 4 kW · desliga" [escondido agora]
- div "BC56 · chave 11 de 13 · 4 kW · desliga" [escondido agora]
- div "BC56 · chave 12 de 13 · 4 kW · desliga" [escondido agora]
- div "BC56 · chave 13 de 13 · 3 kW · desliga" [escondido agora]
- summary "Banco de 400 kW⇄ Seletora: Auto (remot" [escondido agora]
- button "Ensaio em andamento: a seletora e o "L" [escondido agora]
- button "Simula o comando Ligar banco do BC400 " [escondido agora]
- div "BC400 · chave 1 de 13 · 5 kW · desliga" [escondido agora]
- div "BC400 · chave 2 de 13 · 5 kW · desliga" [escondido agora]
- div "BC400 · chave 3 de 13 · 10 kW · deslig" [escondido agora]
- div "BC400 · chave 4 de 13 · 10 kW · deslig" [escondido agora]
- div "BC400 · chave 5 de 13 · 10 kW · deslig" [escondido agora]
- div "BC400 · chave 6 de 13 · 10 kW · deslig" [escondido agora]
- div "BC400 · chave 7 de 13 · 50 kW · deslig" [escondido agora]
- div "BC400 · chave 8 de 13 · 50 kW · deslig" [escondido agora]
- div "BC400 · chave 9 de 13 · 50 kW · deslig" [escondido agora]
- div "BC400 · chave 10 de 13 · 50 kW · desli" [escondido agora]
- div "BC400 · chave 11 de 13 · 50 kW · desli" [escondido agora]
- div "BC400 · chave 12 de 13 · 50 kW · desli" [escondido agora]
- div "BC400 · chave 13 de 13 · 50 kW · desli" [escondido agora]
- summary "Banco de 59,5 kW⇄ Seletora: Auto (remo" [escondido agora]
- button "Simula o comando Ligar banco do BC59,5" [escondido agora]
- div "BC59,5 · chave 1 de 18 · 5 kW · deslig" [escondido agora]
- div "BC59,5 · chave 2 de 18 · 5 kW · deslig" [escondido agora]
- div "BC59,5 · chave 3 de 18 · 5 kW · deslig" [escondido agora]
- div "BC59,5 · chave 4 de 18 · 5 kW · deslig" [escondido agora]
- div "BC59,5 · chave 5 de 18 · 5 kW · deslig" [escondido agora]
- div "BC59,5 · chave 6 de 18 · 4 kW · deslig" [escondido agora]
- div "BC59,5 · chave 7 de 18 · 4 kW · deslig" [escondido agora]
- div "BC59,5 · chave 8 de 18 · 4 kW · deslig" [escondido agora]
- div "BC59,5 · chave 9 de 18 · 4 kW · deslig" [escondido agora]
- div "BC59,5 · chave 10 de 18 · 4 kW · desli" [escondido agora]
- div "BC59,5 · chave 11 de 18 · 4 kW · desli" [escondido agora]
- div "BC59,5 · chave 12 de 18 · 3 kW · desli" [escondido agora]
- div "BC59,5 · chave 13 de 18 · 3 kW · desli" [escondido agora]
- div "BC59,5 · chave 14 de 18 · 2 kW · desli" [escondido agora]
- div "BC59,5 · chave 15 de 18 · 1 kW · desli" [escondido agora]
- div "BC59,5 · chave 16 de 18 · 0,5 kW · des" [escondido agora]
- div "BC59,5 · chave 17 de 18 · 0,5 kW · des" [escondido agora]
- div "BC59,5 · chave 18 de 18 · 0,5 kW · des" [escondido agora]
- summary "Banco de 550 kW⇄ Seletora: Auto (remot" [escondido agora]
- button "Simula o comando Ligar banco do BC550 " [escondido agora]
- div "BC550 · chave 1 de 12 · 5 kW · desliga" [escondido agora]
- div "BC550 · chave 2 de 12 · 5 kW · desliga" [escondido agora]
- div "BC550 · chave 3 de 12 · 5 kW · desliga" [escondido agora]
- div "BC550 · chave 4 de 12 · 5 kW · desliga" [escondido agora]
- div "BC550 · chave 5 de 12 · 5 kW · desliga" [escondido agora]
- div "BC550 · chave 6 de 12 · 25 kW · deslig" [escondido agora]
- div "BC550 · chave 7 de 12 · 50 kW · deslig" [escondido agora]
- div "BC550 · chave 8 de 12 · 50 kW · deslig" [escondido agora]
- div "BC550 · chave 9 de 12 · 100 kW · desli" [escondido agora]
- div "BC550 · chave 10 de 12 · 100 kW · desl" [escondido agora]
- div "BC550 · chave 11 de 12 · 100 kW · desl" [escondido agora]
- div "BC550 · chave 12 de 12 · 100 kW · desl" [escondido agora]

### Onde cada janela abriu

- `dlgReg` em 226,15 (828×679)
- `dlgCentral` em 346,32 (589×531)
- `dlgVer` em 382,42 (515×454)
- `dlgOcor` em 162,0 (957×791)
- `dlgOcHist` em 162,0 (957×198)
- `dlgLogs` em 180,0 (920×206)
- `dlgDemo` em 309,4 (662×791)
- `dlgModo` em 401,32 (478×537)
- `dlgDados` em 38,84 (1203×632)
- `dlgGrafico` em 190,0 (900×113)
- `dlgGrand` em 200,26 (880×587)
- `dlgMotor` em 306,23 (669×608)
- `dlgPatDet` em 357,99 (647×509)

### O que cada objeto abriu

- button#bAmo "Painel do registro de aprendizado: amo" → abriu dlgReg
- button#bCentral "Central de registros: salvar ou imprim" → abriu dlgCentral
- button#pVer "Versão do programa — clique para ver o" → abriu dlgVer
- button#bAlertas "Sem alertas ativos. Clique para ver o " → abriu dlgOcor
- [dlgOcor] button#ocHist "Registro dos últimos 500 eventos, guar" → abriu dlgOcHist
- button#bFalhas "2 falhas ativas — clique para ver" → abriu dlgOcor
- button#bLogs "Log da comunicação HTML ↔ Node-RED ↔ P" → abriu dlgLogs
- button#bDemo "Demo e Servidor: URL do Node-RED do PL" → abriu dlgDemo
- button#bModoCard "Alterar o modo de operação (abre o pop" → abriu dlgModo
- button "Abrir os dados do ensaio (nº de série," → abriu dlgDados
- button#graPop "Vira popup (não bloqueia a tela, pode " → abriu dlgGrafico
- button "Todas as grandezas do DSE" → abriu dlgGrand
- button "Grandezas do motor" → abriu dlgMotor
- button#bPatDet "Resumo por banco, plano de passos, ope" → abriu dlgPatDet
