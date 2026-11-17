# MAPA DE VERSÕES — qual a função de cada número — v0.1 (28/10/2026)

> **Resumo.** Este documento explica o que cada número do nome `medidor_gerador_vA.B.C.html` significa e lista, versão por versão, a função principal entregue. Gerado a partir do array `HISTORICO` do HTML v1.10.103 (a fonte é o próprio HTML; a coluna "Função" é a 1ª linha do histórico, resumida).

## 1. Regra dos números (vale a partir da v1.10.103)

| Posição | Nome | Significado | Quando muda |
|---|---|---|---|
| **A** (1) | MAIOR | geração da arquitetura (HTML único, sem servidor) | só se a arquitetura mudar |
| **B** (10) | MENOR — **grupo de funções** | o "assunto" da fase: 1.8 = importar print do SAP; 1.9 = chaves/ensaio manual BT2/alertas; 1.10 = Patamar Guiado… | quando nasce um grupo de funções novo (operador decide) |
| **C** (103) | CONTADOR DE ENTREGA | número de ordem da entrega, **sempre crescente, nunca zera** | a cada arquivo entregue (uma versão entregue nunca é sobrescrita) |

**Exemplo:** `1.10.103` = 103ª entrega, dentro do grupo de funções 10 (Patamar Guiado). A próxima entrega é `1.10.104`; se nascer um grupo novo, `1.11.105` (o contador **não** volta a zero).

**Equivalência das entregas 1.10.0/1/2:** foram feitas quando o contador zerava a cada grupo. Pela regra nova valem as entregas **100, 101 e 102** (1.10.0 = #100, 1.10.1 = #101, 1.10.2 = #102). Os arquivos já entregues **não foram renomeados**.

**Ordenação por nome de arquivo:** em ordem alfabética o explorador de arquivos coloca `1.10.103` ANTES de `1.9.99` (compara texto, e "1.1" < "1.9"). Use ordenação "natural" ou por data de modificação; o contador (3º número) cresce sempre, então a entrega mais nova é a de maior 3º número.

## 2. O que cada número do meio (B) significa

| B | Função do grupo | Entregas |
|---|---|---|
| 1.0 | Versão base (tela única, etapas, relatório PDF/CSV/PNG) | 1 (1.0.0 … 1.0.0) |
| 1.1 | FINALIZAR só ao final do teste | 1 (1.1.0 … 1.1.0) |
| 1.2 | Tipos de ensaio (Padrão e só teste de carga) | 1 (1.2.0 … 1.2.0) |
| 1.3 | Registro de aprendizado (1 amostra por segundo) | 1 (1.3.0 … 1.3.0) |
| 1.4 | Registro dentro do painel Amostras | 2 (1.4.0 … 1.4.1) |
| 1.5 | Indicador de registro na barra superior | 2 (1.5.0 … 1.5.1) |
| 1.6 | Acervo de ensaios e relógio | 2 (1.6.0 … 1.6.1) |
| 1.7 | Simulador Demo mais ágil | 2 (1.7.0 … 1.7.1) |
| 1.8 | Importar print do SAP (OCR) em Dados do ensaio | 9 (1.8.0 … 1.8.9) |
| 1.9 | Node-RED de seleção, chaves do banco de carga, ensaio manual BT2, Alertas, gráfico, catálogo e FBs virtuais (entregas 0 a 99) | 94 (1.9.0 … 1.9.99) |
| 1.10 | Patamar Guiado, tabela de potência 60 Hz, FBs mãe/filhos, histórico de alertas (entregas 100 em diante) | 4 (1.10.0 … 1.10.103) |

## 3. Lista completa (da mais antiga para a mais nova)

| Versão | Data | Função principal (1ª linha do histórico) |
|---|---|---|
| 1.0.0 | até 11/10/2026 | Versão base: tela única em 3 colunas, modo claro/escuro, tamanho da letra, ensaio por etapas, relatório PDF, CSV e PNG, janelas arrastáveis, alarme d… |
| 1.1.0 | 12/10/2026 | FINALIZAR só libera ao final do teste (todas as etapas cumpridas e salvas). |
| 1.2.0 | 13/10/2026 | Popup Faixas simplificada: só 2 tipos de ensaio (Padrão ISO e Só teste de carga). O Ensaio livre foi removido. |
| 1.3.0 | 13/10/2026 | Registro de aprendizado: botão "Registro" liga/desliga a gravação de 1 amostra por segundo (leituras, etapa, estado do cronômetro, gerador) e dos eve… |
| 1.4.0 | 13/10/2026 | Botão "Registro" movido de cabeçalho para dentro do painel Amostras (popup de aprendizado). |
| 1.4.1 | 13/10/2026 | Checkbox "Auto-ativar registro ao iniciar ensaio" adicionado no painel Amostras, em Comportamento. |
| 1.5.0 | 13/10/2026 | Indicador de registro movido para a barra superior (piscando em vermelho quando ativo). |
| 1.5.1 | 13/10/2026 | Corrigido: Registro agora encerra automaticamente quando o ensaio é finalizado (clique em FINALIZAR). |
| 1.6.0 | 13/10/2026 | Acervo: o ensaio agora conta automaticamente assim que o registro termina — não precisa mais baixar o CSV para contar. |
| 1.6.1 | 13/10/2026 | Relógio (tempo total decorrido) voltou a aparecer na tela, abaixo do gráfico, junto com cronômetro e estabilização. |
| 1.7.0 | 13/10/2026 | Simulador demo: transição de carga mais ágil (chaves do banco fecham/abrem mais rápido) — tempo de ajuste mais realista, sem distorcer o tempo de est… |
| 1.7.1 | 13/10/2026 | Correção de rumo: removida a histerese automática de estabilidade da v1.7.0 — o sistema não deve decidir sozinho quando uma oscilação "invalida" a le… |
| 1.8.0 | 13/10/2026 | Janela "Dados do ensaio": nova caixa para importar um print da tela do SAP — cole com Ctrl+V, arraste a imagem ou escolha um arquivo. |
| 1.8.1 | 14/10/2026 | Corrigido: mensagem de erro do OCR mostrava "undefined" em vez da causa real (o mecanismo de leitura às vezes rejeita com um texto simples, não com u… |
| 1.8.2 | 14/10/2026 | Janela "Dados do ensaio": a miniatura do print colado agora é pequena (clique nela para ampliar/reduzir) — a janela fica bem mais compacta. |
| 1.8.4 | 14/10/2026 | Corrigidos 3 bugs na leitura automática do print (achados testando com um print real, de campos com caixinha/borda ao redor de cada valor): ruído de … |
| 1.8.5 | 14/10/2026 | Janela "Dados do ensaio": o Modelo do Controlador não é mais travado/preenchido automaticamente a partir da API do gerador (campo "azul, lido do DSE"… |
| 1.8.6 | 14/10/2026 | Leitura do print do SAP: a causa dos campos vindo errados/em branco no teste real era a resolução do print colado (nesse caso, ~900px de largura) ser… |
| 1.8.7 | 14/10/2026 | Leitura do print do SAP: a ampliação da v1.8.6 ajudou a reconhecer os rótulos, mas testes com um print real mostraram que o passo de converter pra pr… |
| 1.8.8 | 14/10/2026 | Importar print do SAP reescrito: em vez de ler a página inteira e tentar adivinhar quem é quem pelo texto (o que embaralhava os campos), agora o sist… |
| 1.8.9 | 14/10/2026 | Gerador parou no meio do ensaio = ensaio perdido. No DEMO, o STOP agora pede confirmação e descarta o ensaio em andamento (cronômetro, etapas, gráfic… |
| 1.9.0 | 15/10/2026 | Novo: ligação com o Node-RED de seleção (mesma origem do HTML). Barra "Modo do ensaio" com o seletor Manual / Automático: o modo é enviado ao Node-RE… |
| 1.9.4 | 15/10/2026 | START ENSAIO de um ensaio novo não pergunta mais "Apagar o ensaio anterior no PLC?" — a limpeza do PLC agora é automática e silenciosa (o operador já… |
| 1.9.5 | 15/10/2026 | Config real dos bancos de carga da BT2 (card "Cargas", ladrilhos de referência no ensaio real + chaves do DEMO): "Banco de 56 kW" (13 chaves: 5×5 + 7… |
| 1.9.6 | 15/10/2026 | Card "Cargas · banco de carga": os 3 campinhos (Aplicado nas chaves / Medido no DSE / Diferença) agora ficam visíveis mesmo com o card recolhido (set… |
| 1.9.7 | 15/10/2026 | Painel Amostras (Registro de aprendizado): nova trava "Não gravar amostras enquanto 'demo' estiver marcado" (ligada por padrão), em Comportamento. Co… |
| 1.9.8 | 16/10/2026 | Nova popup "Motor" (botão ao lado de "Grandezas", card Leitura das grandezas): temperatura e pressão do óleo, pressão do turbo, temperatura de admiss… |
| 1.9.9 | 16/10/2026 | Popup Motor: novo checkbox "Simular falha ECU" (aparece só com "demo" marcado) — liga uma falha sintética no simulador (pressão de óleo cai a 0, temp… |
| 1.9.10 | 16/10/2026 | Correção: o botão "FORÇAR SALVAR (teste)" aparecia mesmo com "demo" desmarcado sempre que a senha de testes já tinha sido digitada na sessão (comport… |
| 1.9.11 | 16/10/2026 | Reorganização completa dos controles de demo/teste, a pedido do operador: o checkbox "demo" solto no cabeçalho e o botão "🔒 bloquear testes" deram l… |
| 1.9.12 | 16/10/2026 | Correção: quando a leitura real falha (pill "servidor/rede fora" — sem rede/VPN até o Node-RED/PLC, ex. testando fora da rede do banco de testes), o … |
| 1.9.13 | 16/10/2026 | Simulação do motor (③), a pedido do operador: marcar ③ sozinha já liga ① automaticamente (não precisa mais marcar as duas) — basta clicar INICIAR dir… |
| 1.9.14 | 16/10/2026 | A pedido do operador: "PARAR ENSAIO" (bParaEns/pararEnsaio()) agora também desliga a simulação (①/③ na popup Demo), em vez de só parar a sequência de… |
| 1.9.15 | 16/10/2026 | Correção confirmada com teste automatizado (Playwright): ao desligar o demo (por PARAR ENSAIO, desmarcando ① na popup Demo, ou "bloquear testes"), o … |
| 1.9.16 | 16/10/2026 | Corrigido: botão "Registro" (REC, painel Amostras) bloqueado por "demo" + trava "Não gravar amostras no demo" ficava com o atributo disabled do naveg… |
| 1.9.17 | 16/10/2026 | A pedido do operador: rgIniciar() não trava mais o Registro por falta do modelo do DSE e/ou do gerador (campos Motor/Alternador em "Dados do ensaio")… |
| 1.9.18 | 16/10/2026 | A pedido do operador: a popup "Demo" agora bloqueia por completo ligar ① Simulação tradicional (ou ③, que liga ① junto) quando o DSE real está conect… |
| 1.9.19 | 16/10/2026 | A pedido do operador: no ensaio real, com o ensaio já ARMADO (1º clique em START ENSAIO + Dados confirmados), o cronômetro não precisa mais do 2º cli… |
| 1.9.20 | 16/10/2026 | A pedido do operador, depois do ensaio real de hoje: vigiaGerador() não descarta mais o ensaio sozinho quando o gerador aparenta ter parado (4 s lend… |
| 1.9.21 | 17/10/2026 | BUG CONFIRMADO (reproduzido com teste automatizado): o operador relatou que "esperar a estabilidade da carga" não funcionava nem no DEMO (Manual nem … |
| 1.9.22 | 17/10/2026 | Confirmado em campo pelo operador: o DSE dele tem 3 botões push (sem seletora) — STOP (vermelho), MANUAL/AUTO (branco, nasce em MANUAL), START (verde… |
| 1.9.23 | 17/10/2026 | REVERTIDO a pedido do operador (testou em campo e no demo): o cronômetro NÃO inicia mais sozinho ao detectar o gerador "operando". Da v1.9.19 até a v… |
| 1.9.24 | 17/10/2026 | A pedido do operador — "SALVAR ETAPA" (botão no topo do card Etapas do ensaio) foi escondido por ser redundante: a mesma ação (salvar a etapa atual /… |
| 1.9.25 | 17/10/2026 | Ajuste a pedido do operador: o piscar agora é um guia de "próxima ação" que se move pelo ensaio, não fica preso no INICIAR. INICIAR pisca (azul paste… |
| 1.9.26 | 17/10/2026 | BUG SÉRIO CONFIRMADO pelo operador (print mostrando o tempo da etapa 2 contando sozinho, de 0:00 a 0:43, sem a carga ter sido levada aos 30% do degra… |
| 1.9.27 | 17/10/2026 | Ajuste visual a pedido do operador (print: botão "ZERAR POR COMPLETO O ENSAIO" quebrando em 3 linhas, destoando do círculo da lâmpada e do FINALIZAR … |
| 1.9.28 | 17/10/2026 | Correção de geometria a pedido do operador (v1.9.27 corrigiu a quebra de texto do "ZERAR POR COMPLETO O ENSAIO", mas deixou o círculo da lâmpada (#la… |
| 1.9.29 | 17/10/2026 | A pedido do operador, em preparação pro primeiro teste com gerador real: (1) ACH-13 da auditoria corrigido — tick() agora checa r.ok da resposta HTTP… |
| 1.9.30 | 17/10/2026 | A pedido do operador, depois dos primeiros testes com o gerador real (v1.9.29 funcionou: "servidor/rede fora" apareceu corretamente ao desconectar o … |
| 1.9.31 | 18/10/2026 | A pedido do operador: card "Registro do ensaio" com a tabela TRANSPOSTA (linhas por colunas), no mesmo formato do SAP — agora cada ETAPA é uma linha … |
| 1.9.32 | 18/10/2026 | A pedido do operador, com o print real da tela de resultado do SAP como referência: o cabeçalho do card "Registro do ensaio" agora é agrupado em 2 li… |
| 1.9.33 | 18/10/2026 | ZERAR agora zera SÓ o degrau ativo (sem o popup "Novo ensaio"): o degrau volta ao início (aquecimento/estabilização), o ensaio continua em andamento … |
| 1.9.34 | 19/10/2026 | Gráfico: agora são 3 opções no popup ⚙ Modo — "Sem gráfico", "Tempo de ensaio" (novo, padrão) e "Relógio (clássico)", que é o gráfico da v1.9.32 pres… |
| 1.9.35 | 19/10/2026 | Card "Registro do ensaio" voltou ao layout de ANTES (o da v1.9.30: grandezas em linhas, etapas em colunas, "Salvar valores da etapa" na última linha)… |
| 1.9.36 | 19/10/2026 | Corrigido: quando o card "Gráfico do ensaio" nasce/é recolhido na tela larga (≥1280px), a coluna 1 (Etapas) não deixa mais um vão vazio abaixo — o ca… |
| 1.9.37 | 19/10/2026 | Validado (não houve alteração de código): o cronômetro, ao clicar em ZERAR no meio de uma etapa, já voltava corretamente para a soma do tempo das eta… |
| 1.9.38 | 20/10/2026 | Novo card "Modo" no topo da coluna 1 (acima de "Etapas do ensaio"): mostra, só leitura, o que está selecionado - Fonte dos dados (REAL ou DEMO), Tipo… |
| 1.9.39 | 20/10/2026 | Gráfico "Tempo de ensaio": corrigida a rampa diagonal entre degraus (ex.: 0%→30%→50%→100%) relatada pelo operador com 2 prints. CAUSA ENCONTRADA: os … |
| 1.9.40 | 20/10/2026 | Popup "Chaves do banco de carga": reorganizado em abas por banco (56 kW / 400 kW) — cada aba mostra só o banco escolhido nos cards "Habilitar/desabil… |
| 1.9.41 | 20/10/2026 | Popup "Chaves do banco de carga": abas de banco (56/400) movidas pra dentro da barra azul do título, ao lado do "✕" — não sobram mais buracos no layo… |
| 1.9.42 | 20/10/2026 | CORREÇÃO: popup Demo — ① "Simulação tradicional" e ② "Teste de validação do ensaio" eram exclusivas (marcar uma desmarcava a outra). Isso escondia o … |
| 1.9.43 | 20/10/2026 | CORREÇÃO: "PLC: Node-RED fora do ar ou sem rede (Failed to fetch)" mesmo com o flow "Chaves BC56 (DB150)" online — a causa era o Banco de Carga reapr… |
| 1.9.44 | 20/10/2026 | Popup "Setup" (card 2): layout reorganizado — era tudo empilhado numa coluna só (herdava uma grade de 2 colunas pensada pra quando os cards 1+2 ficav… |
| 1.9.45 | 20/10/2026 | Popups Chaves (Habilitar/Desabilitar) e Setup: visual mais compacto a pedido do operador — chips de status (Gerador/kW sem carga/PLC) menores e menos… |
| 1.9.46 | 21/10/2026 | Card "Setup das cargas" (popup 2): adicionado ícone "i" explicando a fórmula de cálculo (kW real = kW com a chave − kW sem carga, depois resistência … |
| 1.9.47 | 21/10/2026 | Setup das cargas: adicionadas fórmulas animadas das resistências (R medido e R teórico) junto com a fórmula de kW real. Mostram a conta completa em t… |
| 1.9.48 | 21/10/2026 | Setup das cargas: botões "Salvar Chave" e "Limpar Chave" (texto encurtado, sem "esta"). |
| 1.9.49 | 21/10/2026 | Correção, a pedido do operador: "🛠 Setup" agora desseleciona de fato a chave anterior ao abrir o popup — o bug era chAtualizaDoPlc() (atualização do… |
| 1.9.50 | 21/10/2026 | Correção, a pedido do operador: ao abrir o popup "🛠 Setup", precisava clicar DUAS vezes na chave pra selecionar. Causa: a chamada de live() no botão… |
| 1.9.51 | 21/10/2026 | Popup Chaves (Habilitar/Desabilitar): invertida a ordem — kW real (verde) agora aparece ANTES do kW nominal, conforme pedido do operador. |
| 1.9.52 | 21/10/2026 | Aviso flutuante (chip vermelho "chave desabilitada" etc.) reposicionado: estava em cima das janelas flutuantes (ex.: Setup), agora fica fixo na base … |
| 1.9.53 | 21/10/2026 | CORREÇÃO IMPORTANTE: a tela principal (card Cargas) não refletia o estado real das chaves no PLC — só mostrava a simulação local (Demo) ou nada. Agor… |
| 1.9.54 | 21/10/2026 | CORREÇÃO Demo: o potenciômetro virtual (painel Simulação) ficava com o valor antigo depois que o Setup desligava as chaves ao abrir o popup. Agora o … |
| 1.9.55 | 21/10/2026 | Setup: removida a frase "o PLC mede e grava sozinho (própria leitura do FB100)" — agora mostra o kW real já salvo (ou "aguardando Salvar esta chave"). |
| 1.9.56 | 21/10/2026 | Botão "Demo" (barra de cima): fundo preto → laranja piscando enquanto o Demo está ligado (pedido do operador, indicador visual claro de que o app est… |
| 1.9.57 | 21/10/2026 | CORREÇÃO GRAVE (desde a v1.9.53): erro de escopo (CH_SRV não visível fora do módulo das chaves) derrubava o render() a cada ciclo — a tela caía em "s… |
| 1.9.58 | 21/10/2026 | Tela principal (card Cargas) com servidor "Node-RED real": clicar numa chave do Banco de 56 kW agora comanda o PLC de verdade (POST /api/chaves/56/se… |
| 1.9.59 | 21/10/2026 | Tela principal com servidor "Node-RED real": cada clique liga/desliga UMA chave do Banco de 56 kW (POST /api/chaves/56/ligar -> cb.ligar[n]), quantas… |
| 1.9.62 | 22/10/2026 | Setup: chave selecionada com destaque forte (azul, aumentada, etiqueta SELECIONADA) mesmo já calibrada; fórmulas (kW real e resistências) visíveis as… |
| 1.9.63 | 22/10/2026 | CORREÇÃO: Banco de 400 kW agora funciona na tela principal, no Setup e no Habilitar/Desabilitar com o servidor "Node-RED real" (antes só o BC56 chama… |
| 1.9.64 | 22/10/2026 | NOVO — Mensagens e falhas: botão "Mensagens e falhas" na barra de cima (com o total de ocorrências ativas) e um TRIÂNGULO amarelo com "!" preto no ca… |
| 1.9.65 | 22/10/2026 | SEGURANÇA — comando de chave que "sobrava" no PLC: o cbLigar (laranja) ficava TRUE no DB150/DB158 mesmo depois de fechar o navegador, e voltava a apa… |
| 1.9.66 | 23/10/2026 | A tela agora NASCE PRONTA PARA O PLC: fora do Demo, as chaves e o registro do ensaio vão sempre ao Node-RED real. Acabaram os vários "⚙ Servidor" (en… |
| 1.9.67 | 23/10/2026 | "Usar o PLC real durante o Demo" só fica marcável quando o PLC JÁ está respondendo de verdade (GET /api/chaves confirmado) — antes bastava estar no D… |
| 1.9.68 | 23/10/2026 | NOVO (só desenvolvedor, atrás da senha do botão Demo): popup "🧪 Cards x flow" — lista os 3 flows do Node-RED de que o HTML depende (chaves BC56, cha… |
| 1.9.69 | 23/10/2026 | CORREÇÃO (Demo, popup Setup [bco.SU]): com uma chave SELECIONADA no Setup, a "Cálculo do kW real" podia ficar congelada em 0,0 kW (e Ia/Ib/Ic = 0) me… |
| 1.9.70 | 23/10/2026 | CORREÇÃO (Setup [bco.SU]): quando o gerador parava (STOP no painel, Demo ou real) com uma chave selecionada, o texto "desmarcada automaticamente" apa… |
| 1.9.71 | 23/10/2026 | CORREÇÃO (Demo + Setup [bco.SU]): apertar STOP do gerador com uma chave selecionada no Setup não desmarcava a chave — o gerador simulado leva ~10 s d… |
| 1.9.72 | 23/10/2026 | CORREÇÃO (Demo, card Cargas): depois do ensaio finalizado (ou com nenhum ensaio ativo) os quadrados das chaves não ligavam ao clicar quando a Simulaç… |
| 1.9.73 | 23/10/2026 | NOVO (só desenvolvedor, atrás da senha do Demo): observabilidade [DEV.OBS]. A tela passa a registrar, na memória do navegador (até 4000 eventos), o q… |
| 1.9.74 | 23/10/2026 | CORRIGIDO, a pedido do operador: ordem das chaves do card "Cargas · banco de carga". A chave 1 agora é a de MENOR carga e a última a de maior (antes … |
| 1.9.75 | 24/10/2026 | NOVO no Demo local (não muda nada fora dele): a seletora Auto/Manual de cada banco agora nasce em MANUAL (bloqueada), igual à seletora física de verd… |
| 1.9.76 | 24/10/2026 | NOVO — ensaio em andamento TRAVA a montagem da carga: o botão Setup (kW real por chave), a seletora Auto/Manual e o "Ligar banco" do card Cargas fica… |
| 1.9.77 | 24/10/2026 | NOVO — seletora Local/Remoto e "Ligar banco" de VERDADE fora do Demo local (exige flow chaves v2.4 + FB101 v0.4 + DB150/DB158 v0.2 + DB38/DB39 v0.2 n… |
| 1.9.78 | 25/10/2026 | NOVO — Setup POR CHAVEAMENTO do banco (220 / 380 / 440 V): a resistência das chaves é a mesma nas 3 tensões, então o kW real de cada chave muda com a… |
| 1.9.80 | 27/10/2026 | NOVO — botão "📈 Analisar" no card do gráfico abre a página grafico_ensaio_v0.1.html (janela própria, para arrastar à segunda tela e acompanhar o ens… |
| 1.9.81 | 27/10/2026 | NOVO — botão "🧭 Manual guiado" (barra do modo do ensaio): assistente que SUGERE quais chaves ligar em cada patamar (sem carga → 30 → 50 → 100 → 107 … |
| 1.9.82 | 27/10/2026 | Manual guiado reorganizado na ORDEM DE USO: 1 Gerador (modelo do catálogo / kW a 100 %) → 2 Patamar → 3 Sugerir chaves → 4 Ajustar à mão (opcional) →… |
| 1.9.83 | 27/10/2026 | Padrão de TODAS as janelas: o botão ✕ de fechar fica sempre no canto SUPERIOR ESQUERDO da barra do título (antes ficava à direita). |
| 1.9.84 | 27/10/2026 | CORRIGIDO: o botão ✕ de fechar volta para o canto SUPERIOR DIREITO de TODAS as janelas, igual ao resto da aplicação (a v1.9.83 tinha movido para a es… |
| 1.9.85 | 27/10/2026 | CORRIGIDO (log): a transição da seletora quando o PLC está sem comunicação com o ET200 era gravada como "Manual (local)"; agora aparece "sem comunica… |
| 1.9.86 | 27/10/2026 | CORRIGIDO: a falha CHV-005 (banco bloqueado pelo PLC) não normalizava depois de virar a seletora para Auto e clicar em "Ligar banco" (por isso "Limpa… |
| 1.9.87 | 27/10/2026 | Manual guiado: o modelo do gerador agora é escolhido SÓ em "Dados do ensaio". No Manual guiado aparece apenas o modelo/kW já definidos lá, com o botã… |
| 1.9.88 | 28/10/2026 | Manual guiado ENXUTO: saiu a lista de chaves do diálogo (ela já existe no card Cargas, sem redundância). A sugestão continua desenhada tracejada nas … |
| 1.9.89 | 28/10/2026 | Revisão de cores: barra superior azul-escura com filete laranja (era preta); seleção/destaque em laranja (saiu o azul vivo); fundos em cinza-azulado … |
| 1.9.90 | 28/10/2026 | Manual guiado: passo "5 · Rodar ensaio" com FB mãe + FBs filhos VIRTUAIS em JavaScript (módulo fbs_virtuais_v0.1.js). Com o ensaio INICIADO, a cada e… |
| 1.9.91 | 28/10/2026 | Manual guiado virou uma CHAVE na tela principal (botão "Guiado: LIGADO/DESLIGADO" ao lado de "Manual guiado"). Ligado: ao INICIAR, a cada etapa o sis… |
| 1.9.92 | 28/10/2026 | Gráfico (página própria v0.2): marcas do Guiado não aparecem mais duplicadas (a mesma mensagem chegava por 2 caminhos). |
| 1.9.93 | 28/10/2026 | Guiado: quando nenhuma combinação de chaves cabe abaixo do alvo (gerador pequeno: menor chave maior que o alvo), a mensagem diz isso e mostra a menor… |
| 1.9.94 | 28/10/2026 | Guiado: se o kW a 100 % (ou limite/degrau) mudar com o ensaio em andamento, as chaves agora são RECALCULADAS e reaplicadas. Antes ficavam as chaves d… |
| 1.9.95 | 28/10/2026 | Manual guiado agora usa o kW do MODELO escolhido em Dados do ensaio (kW_xml); só sem modelo vale a Potência digitada. Se as duas diferirem, aparece u… |
| 1.9.96 | 28/10/2026 | Guiado com salvamento MANUAL: quando a etapa é cumprida e o sistema espera o SALVAR, o Guiado já mostra (tracejado nas chaves do card Cargas) as chav… |
| 1.9.97 | 28/10/2026 | O gráfico do ensaio (v0.3) e o mapa dos FBs (v0.4) agora vêm EMBUTIDOS neste HTML: no celular (ou em qualquer lugar) basta ter este arquivo. Os botõe… |
| 1.9.98 | 28/10/2026 | CORREÇÃO (Demo): o gerador simulado agora tem a potência do gerador ESCOLHIDO. Antes a base era fixa em 91 kW: com 100 kW ligados o % de carga lido i… |
| 1.9.99 | 28/10/2026 | CORREÇÃO: ao escolher o modelo do gerador (catálogo) em Dados do ensaio, a Potência (kW) agora é SEMPRE trocada pelo kW a 100 % do modelo (ex.: 260 k… |
| 1.10.0 | 28/10/2026 | MANUAL GUIADO nasce com o SIDSE (Simulador Ideal DSE: valores teóricos). Sem DSE real ativo ele NUNCA gera "DSE sem resposta" nem abre as chaves por … |
| 1.10.1 | 28/10/2026 | CORREÇÃO (a pedido do operador): o GUIADO AUTOMÁTICO volta a NASCER DESLIGADO em toda abertura de página (não guarda mais "ligado"). Ao abrir, nada é… |
| 1.10.2 | 28/10/2026 | CORREÇÃO: com o Patamar Guiado ligado, o SIMULADOR (Operador = Auto) escolhia as próprias chaves e atropelava a sugestão (ligava outras chaves, com o… |
| 1.10.103 | 28/10/2026 | VERSÃO: volta o CONTADOR DE ENTREGA crescente no último número (1.10.103 = 103ª entrega; 1.10.0, 1.10.1 e 1.10.2 foram as entregas 100, 101 e 102). O… |

## 4. Limites
- A coluna "Função principal" é só a 1ª linha de cada entrada; várias versões têm mais itens (veja o HISTORICO no HTML ou o botão de versão na tela).
- Os nomes dos grupos 1.0–1.8 e 1.10 foram escritos por mim a partir do histórico (ASSUMIDO — corrija se quiser outro rótulo).
