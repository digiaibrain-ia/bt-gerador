const HISTORICO=[
  {v:"1.10.228",d:"18/11/2026",i:[
    'Passo 5 da auditoria (B1): ao voltar ao estado seguro (troca de modo) a tela agora AVISA quando o PLC/Node-RED não confirma o desligamento das chaves ou o zerar da seleção. Novo Alerta CHV-009 por banco, que só sai quando o desligamento do mesmo banco der certo por inteiro (o CHV-001 saía com qualquer outro comando bem-sucedido). Nos desmarcados automáticos do Setup (gerador parado/STOP) o texto passa a dizer que o PLC não confirmou. Nenhum comando mudou, nada é bloqueado e o PLC não é tocado.'
  ]},
  {v:"1.10.227",d:"18/11/2026",i:[
    'Código-fonte modular (Passo 3 da auditoria, aprovado pelo Reginaldo): o medidor passa a ser MONTADO por dashboard/build/build.js a partir de dashboard/src/ (esqueleto index.html + 9 arquivos de estilo + 40 módulos de script por assunto + os demais módulos). Nenhuma regra, tela ou rota mudou: o HTML remontado com a versão 1.10.226 tem o mesmo SHA-256 do arquivo da 1.10.226 (prova em docs/bt2/auditoria/PASSO_3_BUILD_MODULAR_v0.1.md). Só mudam o número da versão e este item do histórico.'
  ]},
  {v:"1.10.226",d:"18/11/2026",i:[
    'Alarme inteligente (pedido do Reginaldo): novo tipo de ocorrência INFORMAÇÃO (I), registrado junto com Alerta e Falha (diálogo e histórico, com filtro próprio), mas que NÃO conta nos botões Alertas/Falhas nem no triângulo dos cards, porque não exige ação do operador. DSE-001 "não conectado" (o DSE nunca foi visto, ex.: cabo não ligado) passa a ser Informação; "perdeu a conexão" continua Falha. A explicação dos nomes (alarme incômodo, inundação de alarmes, repetido, permanente, fugaz, alarme campeão, relação sinal/ruído) está dentro do diálogo, em ⓘ Legenda.'
  ]},
  {v:"1.10.225",d:"18/11/2026",i:[
    'Menos ruído no log (pedido do Reginaldo): a mesma falha de API repetida (ex.: GET /api/gerador → 503 a cada ciclo, com o DSE sem cabo; eram 2291 de 3091 eventos no log da bancada) deixa de gerar um evento por tentativa. O medidor continua consultando normalmente; só o registro muda: a 1ª falha entra inteira, as repetições iguais só contam e a cada 60 s entra UM resumo com a primeira ocorrência, a última e o contador. Sucesso, outra rota ou outro status = evento normal.'
  ]},
  {v:"1.10.224",d:"17/11/2026",i:[
    'Menos ruído nos alarmes e no log (pedido do Reginaldo, após o teste só com o BC56): CHV-005 (banco bloqueado/desligado pelo PLC) e CHV-006 (banco sem leitura) de um banco que NÃO está selecionado em Detalhes do Patamar e está parado (nenhuma chave ligada, nenhum comando pendente) deixam de ser criados e de entrar no log; se já estavam ativos, são limpos. Banco selecionado, ou com chave ligada/comando pendente, continua alarmando. Mantidos de propósito: CHV-003 (Demo + PLC), COM-001/002/005, DSE-001 e CHV-001.'
  ]},
  {v:"1.10.223",d:"17/11/2026",i:[
    'Conceito corrigido pelo Reginaldo: o padrão de "Tolerância de carga (± %)" era 10, o que faz as faixas dos degraus 100 % e 107 % se sobreporem (100 ± 10 já inclui 107). O padrão passa a 3 pontos (era 3 antes da v1.9.29). Quem já salvou parâmetros neste navegador/PC mantém o valor salvo: ajuste o campo em Etapas e salve.'
  ]},
  {v:"1.10.222",d:"17/11/2026",i:[
    'Teste de bancada: com o cronômetro (INICIAR) ativo o botão Sugerir chaves continuava com cara de ligado (só avisava ao clicar). Agora o botão fica DESLIGADO de verdade (apagado, sem clique, com dica) enquanto o cronômetro conta; parado ou pausado, volta ao normal. O Aplicar continua livre.'
  ]},
  {v:"1.10.221",d:"17/11/2026",i:[
    'Teste de bancada (Patamar com PLC + SIDSE): (1) desmarcou uma chave, aplicou e clicou nela de novo: o tracejado (sugestão) não acompanhava o clique; agora acompanha a escolha do operador (desmarcar tira, marcar de novo devolve). (2) O tracejado some 10 s (de ensaio; no Demo acelerado encolhe com o relogio) depois que a carga chegou ao degrau (aplicado e dentro da banda); volta se a carga sair da banda ou se o operador mexer numa chave. (3) Sugerir chaves só funciona com o cronômetro (Iniciar) desligado; durante o ensaio mostra aviso. Aplicar continua livre. (4) O Ligar/Desligar Patamar Guiado saiu do diálogo: o controle é só o do ⚙ Modo (Salvamento › Por patamar); o diálogo e o cabeçalho só sinalizam Patamar: On/Off.'
  ]},
  {v:"1.10.220",d:"17/11/2026",i:[
    'PERFIL DE COMBUSTÍVEL (pedido do Reginaldo): gerador a GÁS NATURAL ou BIOMETANO não aceita degrau grande de carga como o diesel. Novo FB filho em JavaScript (fb_perfil_combustivel_v0.1, funções puras, com entradas: combustível, de/até, tempo desde o último degrau, frequência medida e nominal, chaves ligadas). Seletor "Combustível do gerador" em Detalhes do Patamar: Diesel (padrão, nada muda), Gás natural, Biometano/biogás. Gás/biometano: sobe em degraus IGUAIS de até 25 %/20 %, espera a pausa (10/15 s) e SÓ dá o próximo degrau com a frequência recuperada; se não recuperar no limite, DESISTE sem adicionar carga; sem leitura de frequência não adiciona carga. A etapa final sem carga desce em degraus (queda planejada); emergência (DSE parou, limite) continua imediata. Valores ASSUMIDOS: confirmar com o datasheet do motor. Mãe virtual v0.14 (descarrega opcional).'
  ]},
  {v:"1.10.219",d:"17/11/2026",i:[
    'PATAMAR MANUAL: O RELÓGIO SÓ SOLTA QUANDO A CARGA CHEGA AO DEGRAU (pedido do Reginaldo). Na 1.10.218 o relógio soltava assim que o operador clicava em Aplicar. Agora, no patamar manual (Por patamar), o relógio da etapa espera DUAS coisas: o Aplicar e a carga dentro da banda do degrau (a banda é o maior entre 3 pontos e o melhor erro que o banco consegue para aquele alvo + 1,5 ponto, para chave grossa não travar o ensaio). Continua valendo desmarcar uma chave, aplicar e depois clicar na chave que falta (a mesma ou outra): o relógio solta quando a carga chegar. Ex.: 107 % com 40 kW a 100 %: 39 kW e 40 kW seguram; 42 kW e 43 kW soltam. Patamar Auto e os outros salvamentos não mudam.'
  ]},
  {v:"1.10.218",d:"17/11/2026",i:[
    'PATAMAR MANUAL ESPERA O APLICAR (achado do Reginaldo na bancada): no salvamento "Por patamar", um patamar em modo Manual agora SEGURA o relógio da etapa até o operador clicar em Aplicar. Antes, na passagem 100 % → 107 % a carga do 100 % já estava dentro da tolerância (±10 pontos) do 107 %, o relógio contou sozinho, a etapa avançou e foi salva sem aplicar a sugestão ("foi em auto"). Clicar em Aplicar solta o relógio, também quando não há nada a mudar. Patamar Auto e os outros modos de salvamento não mudam.'
  ]},
  {v:"1.10.217",d:"17/11/2026",i:[
    'DADOS DO ENSAIO › CATÁLOGO DE MODELOS: corrigido o campo de busca que "sumia". Com um gerador já escolhido (lembrado ao recarregar), a busca fica escondida e o botão "Trocar gerador" volta a busca; mas a mensagem "Catálogo atualizado sozinho" apagava a ficha e esse botão, e não havia como trocar o gerador. Agora a mensagem tem lugar próprio e a ficha com "Trocar gerador" permanece. Resto igual à 1.10.216.'
  ]},
  {v:"1.10.216",d:"16/11/2026",i:[
    'ÁREA RNC SEPARADA (pedido do Reginaldo): botão "RNC" no cabeçalho abre a área do RNC, com o interruptor "Usar RNC", que nasce DESLIGADO (hoje o RNC é o cartão escrito; a automação é melhoria). Desligado = o medidor fica como era: sem botão "Registrar defeito", sem aviso "RNC: BLOQUEADO" e sem nenhuma chamada ao servidor do RNC. Ligado = botão "⚠ Registrar defeito", aviso, lista de pendentes de envio, RNCs recentes e atalho para a tela de Reparo.'
    ,'SEM REDE: se o servidor não responder, o registro NÃO se perde: entra numa fila e o medidor baixa um arquivo .csv (RNC_pendente_<série>_<data-hora>.csv, abre no Excel). A fila é reenviada sozinha (a cada 30 s e quando a rede volta, com a página aberta) ou por "Enviar pendentes (.csv)"; a mesma chave evita duplicar. A tela avisa: salvo SÓ neste aparelho, ainda NÃO está no sistema, coloque a etiqueta BLOQUEADO. Recusa por dado inválido não entra na fila (o erro aparece e a janela continua preenchida).'
    ,'Dev/Operador oculto: a fase RNC é pulada (com aviso) quando o RNC está desligado. Resto igual à 1.10.215.'
  ]},
  {v:"1.10.215",d:"16/11/2026",i:[
    'BANCO DE CARGAS: mostra SÓ os bancos selecionados em Detalhes do Patamar; os demais ficam ocultos (antes, com o PLC não conectado, todos apareciam porque as chaves ficam com "?"). Segurança: um banco desmarcado continua visível se tiver chave ligada, comando pendente ou se a leitura dele FOI perdida depois de existir. 👁 n/N mostra todos.'
    ,'MODO › Fonte dos dados: "SIDSE" (Demo) ou "DSE Real". Salvamento: "Manual", "Auto" ou "Patamar".'
    ,'MODO › Node-RED: a caixa "Node-RED (confirmado)" virou "Registro no Node-RED" (é o modo Manual/Auto do registro que o Node-RED confirma, diferente do indicador Node-RED, que resume os servidores). Mostra valor curto (Simulado, Manual ✓, Auto ✓, Sem confirmação, Enviando…, Consultando…) e o texto completo no balão; no Demo local não repete mais um erro que não se aplica.'
  ]},
  {v:"1.10.214",d:"16/11/2026",i:[
    'VISUAL (pedido do Reginaldo): card MODO MENOR, com o mesmo visual de antes. As caixinhas de comunicação (PLC, Node-RED, HTML) e as de configuração ficam iguais (bordas, cores, bolinha com pulso, balões); só diminuem o espaçamento e as letras. Substitui a tentativa da 1.10.213 (visual novo), que foi descartada. Resto igual à 1.10.212.'
  ]},
  {v:"1.10.212",d:"15/11/2026",i:[
    'ALARME INTELIGENTE (pedido do Reginaldo: tratar alarmes falsos). (1) Contexto: no Demo local (nada vai ao PLC) não há alarme de leitura do PLC — o CHV-006 "banco sem leitura" aparecia no Demo à toa. (2) Escopo: só alarma o banco EM USO (selecionado em Detalhes do Patamar, ligado ou com chave ligada) há mais de 4 s; banco fora de uso é lido a cada 3 s e não alarma. (3) Causa-raiz: se o Node-RED das chaves não responde, aparece UM alarme (COM-002) com a lista dos bancos afetados, em vez de uma fila de COM-001 e CHV-006; COM-001 também cobre o CHV-006 do mesmo banco.'
    ,'SEGURANÇA NÃO MUDA: CHV-005, CHV-007, CHV-008 e COM-005 continuam como eram; se o medidor não conseguir decidir se o banco está em uso, trata como em uso. Nova linha "Monitorando — ..." no topo da janela Alertas e Falhas mostra o que está sendo vigiado agora.'
  ]},
  {v:"1.10.211",d:"15/11/2026",i:[
    'RNC (Registro de Não Conformidade) JUNTADO (veio da outra sessão): botão "⚠ Registrar defeito" no cabeçalho e aviso informativo "RNC: BLOQUEADO" quando a série tem RNC pendente. Só informa: nunca bloqueia o ensaio nem comanda PLC, chaves ou DSE; fala só com /api/rnc/* do Node-RED (fluxo rnc-api-v1.1).'
    ,'BANCOS VISÍVEIS: o card "Banco de Cargas" mostra só os bancos selecionados em Detalhes do Patamar. Banco desmarcado só some se estiver sem carga; com chave ligada, comando pendente ou sem leitura continua visível. Botão 👁 n/N alterna para Todos.'
    ,'Dev/Operador oculto: fase "RNC · Registrar defeito" (só grava se a pasta de dados do RNC for de TESTE) e falha simulada do alternador no Demo. Resto igual à 1.10.210.'
  ]},
  {v:"1.10.210",d:"15/11/2026",i:[
    'CENTRAL DE REGISTROS — BOTÃO EXPORTAR ▾ (pedido do Reginaldo): a Central ganhou o menu Exportar ▾, como o Gráfico, o Mapa e os Logs, no lugar do "Imprimir agora". Itens: PDF organizado (imprimir) — resumo, ocorrências, monitoramento resumido, falhas e avisos agrupados e dados do ensaio em tabelas curtas; Markdown agrupado (.md) — tudo o que está marcado num arquivo só; Planilha de alertas (.csv); Monitoramento (.json); e Amostras (.csv) quando houver sessões pendentes. Salvar selecionados e Copiar resumo continuam iguais.'
    ,'O "Imprimir agora" antigo despejava o JSON e os logs brutos no papel (no registro do Reginaldo deu um PDF de 26 páginas e 23 MB). O PDF organizado só imprime tabelas e resumos; os dados completos ficam no Markdown agrupado e no Salvar selecionados. Também entrou no código-fonte da Central o ajuste da 1.10.191 (chave "perguntar ao fim do ensaio"), que antes só existia dentro do medidor.'
  ]},
  {v:"1.10.209",d:"14/11/2026",i:[
    'MAPA DOS FBs NO CELULAR — MAIS ALTURA PARA O DIAGRAMA (pedido do Reginaldo): em celular em pé o diagrama tinha só 17 % da altura da tela (8 % em telas menores). Agora o painel do mapa ocupa a tela inteira, a barra de título fica em uma linha (o botão Janela própria vira só o ícone ↗) e dentro do mapa o cabeçalho ficou enxuto (botões de modo curtos, título escondido), a faixa Gerador/Banco/Carga virou uma linha de resumo com o botão ▸ para abrir o detalhe, e a legenda foi para o botão ⓘ (painel suspenso). O PC não muda. Mapa embutido: v0.19.'
  ]},
  {v:"1.10.208",d:"14/11/2026",i:[
    'MAPA DOS FBs — AURÉOLA NO BLOCO ATIVO (pedido do Reginaldo; substitui o contorno que piscava da 1.10.207): o bloco em estado ATIVO (contando) ganha uma auréola azul de fundo, desfocada, que respira entre 40 % e 90 % (ida e volta suave, nunca apaga) enquanto estiver ativo, no mesmo estilo da iluminação do card Modo. A respiração segue o relógio, então o mapa recriar o desenho a cada foto não reinicia nem faz saltos. Cores dos estados mais fortes e símbolo de forma (■ ✔ ▶ ▲) continuam. Com "reduzir movimento" ligado no aparelho a auréola fica fixa. A exportação do mapa não leva a auréola.'
  ]},
  {v:"1.10.207",d:"14/11/2026",i:[
    'MAPA DOS FBs — ILUMINAÇÃO (pedido do Reginaldo): o cartão do bloco ganha um contorno âmbar por cerca de 1 s sempre que o bloco age (mudou estado, entrada ou saída entre duas fotos); ruído de medição e contadores de tempo não contam, e abrir a tela ou voltar de "sem sinal" não acende tudo. Os estados (ocioso, ok, contando, falha) ganharam cores mais fortes e diferentes, nos temas claro e escuro, e um símbolo de forma além da cor (■ ✔ ▶ ▲). Com "reduzir movimento" ligado no aparelho não há animação (anel fixo). A exportação do mapa não leva o halo.'
    ,'A cópia do mapa embutida no medidor estava na v0.14 (é a que o operador vê no PC de operação); agora é a v0.17, e traz junto o ícone i com área de toque maior e a Ajuda nova da v0.16.'
  ]},
  {v:"1.10.206",d:"14/11/2026",i:[
    'REGRA DE TEXTO LONGO (pedido do Reginaldo): texto longo não fica mais na tela, vira janela suspensa com o ícone ⓘ. No quadro do nº de série (Dados do ensaio) sobrou UMA linha curta (o que o NS é + etiquetas de origem, avisos e alterados) e o botão ⓘ; a decodificação completa, os avisos, o conflito com o catálogo, os campos alterados, a legenda das barras e os EXEMPLOS DA NORMA (ETD 091 e ETD 094, com botão "usar") abrem no painel. O painel fecha com ✕, Esc (fecha só o painel, não o diálogo) ou clique fora.'
    ,'Sem outras mudanças de comportamento em relação à 1.10.205 (decodificador estrito pelas normas, origem de cada campo, precedência NS × catálogo, aviso de conflito, envio da origem ao registro).'
  ]},
  {v:"1.10.205",d:"14/11/2026",i:[
    'DADOS DO ENSAIO, FLUXO MESCLADO (pedido do Reginaldo): 1) o nº de série do MES é decifrado só pelas normas (ETD 091 rev.05 gerador, 9 caracteres; ETD 094 rev.00 torre, 8) e preenche Motor, Alternador e Controlador; 2) o operador usa a busca de modelo (catálogo), que preenche frequência, tensão, potência e controlador; 3) o que faltar é digitado. A tolerância da 1.10.204 (aceitar S na frente) foi REMOVIDA: NS fora da norma não preenche nada e a tela manda preencher à mão.'
    ,'Cada campo mostra de onde veio: barra azul = nº de série, barra verde = catálogo, sem barra = digitado (legenda no quadro do NS). Quem rodar por último vence; mexer à mão tira a marca. Se o catálogo (sempre Deep Sea) contrariar o controlador do NS (ex.: Deif AGC150), aparece um aviso. Só vale no modo "Por nº de série (MES)"; o modo Manual continua idêntico.'
  ]},
  {v:"1.10.204",d:"14/11/2026",i:[
    'NÚMERO DE SÉRIE DO MES COM "S" NA FRENTE: o Dados do ensaio por nº de série aceitava um NS de 10 caracteres com uma letra na frente do NS da norma. REMOVIDO na 1.10.205: só vale o formato das normas ETD 091 e ETD 094.'
  ]},
  {v:"1.10.203",d:"14/11/2026",i:[
    'NÚMERO DE SÉRIE NO REGISTRO DO ENSAIO: ao confirmar os Dados do ensaio, o nº de série é normalizado (sem espaços e sem *, o Ø da plaqueta vira 0, letras maiúsculas) em qualquer modo. Antes, o Ø ia ao PLC como ? e a leitura de volta não conferia. Com o fluxo de registro v1.10, o Node-RED também normaliza.'
    ,'O preenchimento enviado ao Node-RED agora leva a origem dos dados (Manual ou Por nº de série) e, no modo por NS, o que foi decodificado e quais campos o operador alterou. O fluxo v1.10 guarda isso na memória do Node-RED (some se reiniciar; o DB2100 do PLC não ganha campo novo) e devolve em GET /api/ensaio/snap (campo origem). Com o fluxo v1.9 o medidor continua funcionando: o fluxo ignora os campos novos.'
  ]},
  {v:"1.10.202",d:"14/11/2026",i:[
    'DADOS DO ENSAIO — SEGUNDA OPÇÃO "Por nº de série (MES)" (pedido do Reginaldo): no topo do diálogo Dados do ensaio há agora o seletor "Origem dos dados". "Manual / print do SAP (original)" é o padrão e continua idêntico. "Por nº de série (MES)": digite ou leia o NS (geradores ETD 091 rev.05, 9 caracteres; torres ETD 094 rev.00, 8 caracteres; o Ø vale 0 e os * do código de barras são ignorados) e a tela preenche Motor, Alternador e Controlador. Tudo continua editável: o que você mudar fica com contorno azul e é contado no aviso. Letra que a norma não lista não trava: aparece como desconhecida e o campo fica para digitar. Potência, tensão, frequência, temperatura e versão continuam digitados. Ao fechar o diálogo, volta para Manual. Ainda não grava no registro (virá com o fluxo de registro novo).'
  ]},
  {v:"1.10.201",d:"13/11/2026",i:[
    'MENU ☰ também na OPERAÇÃO (pedido do Reginaldo): o botão ☰ agora aparece sempre e, para o operador, abre só o Medidor e o Gráfico do ensaio. No modo DEV (senha do Demo ou ?dev=1) o menu mostra todas as ferramentas, Verificar, Atualizar e o link para o index.html. Arquivo do menu: menu_dev_v0.3.js (junto do catalogo_ferramentas.js na mesma pasta; sem eles a tela abre normalmente, sem o ☰).'
  ]},
  {v:"1.10.200",d:"11/11/2026",i:[
    'Dev/Operador oculto (Rápido): se o Patamar Guiado estiver LIGADO (o salvamento "Por patamar" liga sozinho) o robô o desliga durante o ensaio dele e religa no fim. Antes o ensaio parava na etapa 2 com a carga em 0 % porque, com o 30 % em manual, o Patamar esperava o "Aplicar" e o operador simulado em Auto não subia a carga (falha "o ensaio continua progredindo").'
  ]},
  {v:"1.10.199",d:"11/11/2026",i:[
    'Dev/Operador oculto: INSPEÇÃO VISUAL DE DESIGN (só leitura). (1) Para cada objeto, foca e passa o mouse e confere que nenhum card/painel/área de rolagem muda de posição ou tamanho (falha: "layout muda ao passar o mouse/focar"); avisa se um balão aparece fora da tela. (2) No ciclo completo, depois de "Gravar sem relatório" confere que nenhum botão ficou DESABILITADO (e que os chips do Patamar voltam a poder ser escolhidos).'
  ]},
  {v:"1.10.198",d:"10/11/2026",i:[
    'Os chips de estado do card Modo (PLC, DSE…) também usam o balão de última camada (fora do fluxo, sem mexer no layout dos cards, texto selecionável). Agora TODOS os balões do medidor são assim: o ⓘ e esses chips eram os dois únicos feitos em CSS dentro do card.'
  ]},
  {v:"1.10.197",d:"10/11/2026",i:[
    'Balão do ícone ⓘ refeito: um só, fora do fluxo da tela (não empurra mais os cards nem mexe no layout), com texto que dá para SELECIONAR e copiar, que não some quando o mouse vai até ele, acima de janelas modais e dentro da tela. Esc fecha.'
  ]},
  {v:"1.10.196",d:"10/11/2026",i:[
    'Depois de GRAVAR o ensaio ("Ensaio gravado · aguardando START") os chips de patamar (30 %, 50 %, 100 %, 107 %) voltam a poder ser escolhidos (ficavam desabilitados, como se o ensaio ainda estivesse em curso), e o Patamar Guiado religa sozinho se estava ligado.'
  ]},
  {v:"1.10.195",d:"10/11/2026",i:[
    'Ao GRAVAR o ensaio (com ou sem relatório) o card PATAMAR volta ao estado inicial: sem patamar escolhido, sem seleção/plano/mensagem do ensaio anterior (antes continuava em "Alvo 0 kW (0 %)" / "etapa sem carga"). O liga/desliga do Patamar continua como o operador deixou. O Registro do ensaio continua na tela até o próximo INICIAR.'
  ]},
  {v:"1.10.194",d:"10/11/2026",i:[
    'Carrega catalogo_ferramentas.js (nome sem versão, gerado pela pasta): a lista de ferramentas nunca mais fica uma versão atrás. Nada mais mudou.'
  ]},
  {v:"1.10.193",d:"10/11/2026",i:[
    'Gráfico embutido (botão Analisar quando o medidor roda sozinho) atualizado da v0.10 para a v0.13: Ajuda com ✕, alvos de toque no celular e sem IP real no código. O mapa embutido não mudou.'
  ]},
  {v:"1.10.192",d:"10/11/2026",i:[
    'Carrega o catálogo de ferramentas v0.8 (menu ☰ abre gerenciador de logs v1.9 e gráfico v0.13, sem IP real). Nada mais mudou.'
  ]},
  {v:"1.10.191",d:"10/11/2026",i:[
    'Novo em ⚙ Modo: "Perguntar ao final do ensaio" (Sim/Não). Com Não, a tela não mostra mais "Ensaio finalizado. Salvar os registros agora?"; os registros continuam no botão Registros. Padrão Sim (igual à 1.10.190).'
  ]},
  {v:"1.10.190",d:"08/11/2026",i:[
    'Dev/Operador oculto (fase Patamar): o robô buscava os chips de patamar uma vez só e, depois do 1º clique (que redesenha o card), os outros viravam elementos soltos — por isso mostrava o mesmo alvo (30 kW) nos quatro. O card estava certo (parado: alvo = chip escolhido; ensaio iniciado: acompanha a etapa). Agora o robô busca o chip a cada volta e confere que o alvo mostrado é o do chip.',
  ]},
  {v:"1.10.189",d:"08/11/2026",i:[
    'Dev/Operador oculto: nada é gerado, aberto ou impresso sozinho. A caixa de areia agora bloqueia TODO link que sai da página (inclusive os que abrem outra aba — era assim que o Simulador de amostras abria e baixava amostras_sim_*.md/csv no fim do robô), vale também no modo Rápido, e a impressão automática do fim do ensaio fica desligada enquanto o robô roda. O download automático do relatório (1.10.187) foi removido: agora só pelo botão Baixar da barra.',
  ]},
  {v:"1.10.188",d:"08/11/2026",i:[
    'Arquivo aberto de Downloads (content://) ou WebView do celular PROÍBE o armazenamento do navegador e o medidor dava erro não tratado (SecurityError ao ler localStorage). Agora, se estiver bloqueado, entra um armazenamento em memória (vale enquanto a aba estiver aberta) e a tela funciona normalmente; o robô avisa no relatório.',
  ]},
  {v:"1.10.187",d:"08/11/2026",i:[
    'Dev/Operador oculto no celular: a barra agora cabe na largura (os botões Copiar e ✕ ficavam fora da tela) e, ao terminar, o relatório é BAIXADO sozinho como arquivo .md (vai para Downloads) — arquivo aberto de Downloads (content://) não pode ser recarregado se o Android descartar a aba.',
  ]},
  {v:"1.10.186",d:"08/11/2026",i:[
    'Dica de interface (Alt+I) é recurso de PC: em celular/tablet (toque) ela nunca nasce ligada pela escolha guardada (só com ?ui=1) e a caixa "Inspecionar objetos" do popup Demo não aparece.',
  ]},
  {v:"1.10.185",d:"08/11/2026",i:[
    'Dev/Operador oculto (Monkey no celular): achada a causa do balão sumir — a caixa "chkPlcNovos" (Patamar > detalhes) recarrega a página ao mudar; o robô a tocava e a página recarregava no meio do teste. Agora a caixa de areia bloqueia esse toque e o relatório também é guardado em window.name (sobrevive à recarga mesmo com o arquivo aberto de Downloads).',
  ]},
  {v:"1.10.184",d:"08/11/2026",i:[
    'Dica de interface (Alt+I) nascia LIGADA depois de um teste do robô (ele tocava no item do menu e não devolvia) e no celular não havia como desligar. Agora: o robô devolve o estado de antes; há a caixa "Inspecionar objetos (Alt+I)" no popup Demo (toque); e o endereço com ?ui=0 desliga e apaga a escolha guardada.',
  ]},
  {v:"1.10.183",d:"07/11/2026",i:[
    'Dev/Operador oculto: o bloco do popup Demo agora cabe na largura do celular; no modo Monkey o balão do robô não fica mais escondido atrás de um popup aberto depois dele (a barra é re-elevada a cada 0,25 s enquanto o robô roda).',
  ]},
  {v:"1.10.182",d:"07/11/2026",i:[
    'Dev/Operador oculto: ao terminar ou ser interrompido, a barra do robô FICA na tela ("concluído" ou "interrompido" + motivo, contagem e botões Relatório / Copiar / ✕) em vez de sumir; o relatório é salvo no navegador a cada 4 s e, se a página recarregar no meio do teste, a barra avisa "interrompido (a página recarregou)" e Copiar / Central de registros / Imprimir usam o relatório salvo.',
  ]},
  {v:"1.10.181",d:"07/11/2026",i:[
    'Botão Copiar relatório (Dev/Operador oculto) dizia "Copiado!" mas colava um texto antigo: o campo temporário da cópia nascia fora do popup modal (inerte). Agora nasce dentro do popup, o relatório também aparece num campo de texto na tela (selecionar e copiar à mão) e há o botão Compartilhar (celular). Mesma correção no Diagnóstico das Ocorrências e no menu do botão direito.',
  ]},
  {v:"1.10.180",d:"07/11/2026",i:[
    'Dev/Operador oculto (achados do Poco X6 Pro): o robô força o salvamento MANUAL antes de cada ensaio e devolve o salvamento de antes no fim (no celular o navegador guardava "Por patamar", que salva as etapas sozinho e fazia o robô acusar 8 falhas que não eram do medidor); aviso de "alvo de toque 0×0" só para objetos que existem.',
  ]},
  {v:"1.10.179",d:"07/11/2026",i:[
    'Barra do Dev/Operador oculto: ganhou CRONÔMETRO, pode ser ARRASTADA (⠿) e REDIMENSIONADA (posição e tamanho ficam guardados), pode ser RECOLHIDA (–) e agora nasce no canto inferior direito (antes ficava no meio, em cima de "Última atualização"). Visão do operador "Simples (só INICIAR)" não mostra mais o card Patamar.',
  ]},
  {v:"1.10.178",d:"07/11/2026",i:[
    'Dev/Operador oculto: o relatório agora diz em que DISPOSITIVO rodou — nome (campo no popup Demo, guardado no navegador), tipo provável (celular/tablet/PC-notebook), tela, DPR, zoom aproximado do navegador, toque ou mouse. O navegador não sabe se é PC ou notebook: vale o nome digitado.',
  ]},
  {v:"1.10.177",d:"07/11/2026",i:[
    'Menu do botão direito (pacote para a IA) abria FORA da tela em monitor largo (a partir de 2400 px a tela tem zoom 1,5×; acima de 3200 px, 2×): agora a posição leva o zoom em conta e o menu fica sempre inteiro na tela. Achado do robô Dev/Operador oculto no note DELL.',
  ]},
  {v:"1.10.176",d:"07/11/2026",i:[
    'Correções da revisão universal (PC e celular): (1) arrastar uma janela não a deixa mais sair da tela — o ✕ e o título ficam sempre visíveis; (2) arrastar por TOQUE passou a funcionar; (3) a faixa de erro vazia não cobre mais campos (ex.: catálogo em Dados do ensaio); (4) no celular os botões, caixas de marcar e ✕ ganharam tamanho mínimo de toque (o PC não muda).',
  ]},
  {v:"1.10.175",d:"07/11/2026",i:[
    'O "Operador secreto" virou "Dev/Operador oculto" e ganhou 3 modos (popup Demo): RÁPIDO (as fases de antes), AVANÇADO (varredura de TODOS os objetos da tela — botões, campos, listas, abas, chaves, janelas — conferindo se dá para clicar, o que abre, ONDE abre, se cabe na tela, se fica por cima, se fecha pelo ✕/Esc/clique fora e se reabre; menu do botão direito; Patamar guiado; ensaio em várias velocidades) e MONKEY (cliques aleatórios com semente fixa, por alguns minutos). Só roda em DEMO LOCAL (nunca no real nem em Demo + PLC). Caixa de areia: bloqueia e conta envio de rede (POST/PUT/DELETE), impressão, janela nova, alerta, download e seletor de arquivo. Relatório com cobertura (X de Y objetos), perfil da tela (PC/celular) e achados; o relatório também sai pela Central de registros.',
  ]},
  {v:"1.10.174",d:"06/11/2026",i:[
    'CORREÇÃO (log do operador): a janela "Central de registros" não fechava (o ✕ não respondia) e não se movia. O ✕ e o arrastar são ligados ao carregar a página só nas janelas que já existem; a Central era criada depois e ficava sem os dois. Agora ela está no HTML como as outras janelas (fecha com ✕, arrasta pela barra de título, Esc). O teste novo clica no ✕ e arrasta a barra de verdade.',
  ]},
  {v:"1.10.173",d:"06/11/2026",i:[
    'GERADOR "OPERANDO" com o DSE REAL: a partir de agora o estado também usa as GRANDEZAS. O LED MANUAL só diz que o modo do controlador é Manual (não que o motor gira). Condições confirmadas pelo operador com o DSE real ligado e o motor rodando: modo MANUAL, LED MANUAL ligado, LED STOP e LED AUTO desligados. "Operando" = LED (ou geradorDisponivel) E rotação ≥ 1400 rpm E tensão média das 3 fases ≥ 100 V (quando esses valores existem na leitura; sem eles vale só o LED, como antes). Motor parado com o DSE em Manual agora aparece "parado"; entre 50 e 1400 rpm, ou sem tensão ainda, "partindo". O PLC (FB100) continua usando o ledManual; mudar isso é versão nova do FB100, só com o OK do Reginaldo.',
  ]},
  {v:"1.10.172",d:"06/11/2026",i:[
    'SETUP: o chaveamento (220/380/440 V) agora vem SOZINHO da tensão do gerador dos Dados do ensaio (pedido do operador: o Setup só funciona com o gerador ligado e a configuração já foi escolhida nos Dados do ensaio). No modo PLC a tela informa o chaveamento ao PLC sozinha, só com os Dados do ensaio CONFIRMADOS e uma tensão que o banco atenda; os botões 220/380/440 viraram somente leitura (mostram o ativo). Com chave selecionada o chaveamento não troca (a tela avisa para desmarcar).',
    'Tensão do gerador de 208 V ou 480 V (fora dos três chaveamentos): o Setup só SINALIZA a tensão ("sem chaveamento correspondente"); nada é gravado no PLC e o Setup continua sem salvar. A definir com o operador.',
  ]},
  {v:"1.10.171",d:"06/11/2026",i:[
    'CENTRAL DE REGISTROS (chip "🗂 Registros" no cabeçalho, botão direito → "Central de registros", ou o aviso do fim do ensaio): uma janela só com caixas de seleção para juntar Alertas e Falhas (com Efeito/Causa/Solução), Monitoramento (estado agora), Amostras, Logs (tela + comunicação do Node-RED) e Dados do ensaio. Salva numa PASTA escolhida UMA vez (BT2_registros/ensaio_data_hora_modelo/, subpasta por tipo + RESUMO.md + AGRUPADO.md para colar na conversa) ou em Downloads (um arquivo agrupado .md). Também IMPRIME na hora e copia o resumo.',
    'No fim do ensaio a tela só PERGUNTA "Salvar os registros agora?" — nada é gravado sozinho. A Central não apaga nem baixa as amostras pendentes (o fluxo de Amostras continua igual) e não comanda PLC, DSE ou chaves.',
  ]},
  {v:"1.10.170",d:"06/11/2026",i:[
    'ALERTAS E FALHAS VIRAM TROUBLESHOOTER: cada linha ganhou o botão "▸ Roteiro" com Efeito (o sintoma) → Causa (a raiz, com um teste rápido) → Solução (passos, marcados "No PC / Node-RED", "Na tela" ou "Depende de bancada/TI") e o botão "Copiar diagnóstico" para colar no chat. Roteiro v0.1: precisa da validação do Reginaldo. Nada aqui comanda PLC, DSE ou chaves.',
    'Botão "ⓘ Legenda" na janela Alertas e Falhas: explica o formato do código (T-AAA-NNN) e lista todos os códigos do catálogo.',
    'Animação discreta dos triângulos: pulso lento vermelho quando há FALHA ativa e âmbar mais fraco para alerta (não anima com "reduzir movimento" do sistema).',
    'DSE-001 passou a diferenciar "API fora do ar" de "API no ar, mas o Modbus do DSE não conecta" (mostra o status e o último erro do Modbus; usa o diagnóstico que o /api/gerador devolve mesmo no 503).',
    'CORREÇÃO: o popup "Cards x flow" (só desenvolvedor) abria ATRÁS do popup Demo; agora abre por cima.',
  ]},
  {v:"1.10.169",d:"06/11/2026",i:[
    'CLIQUE TRAVADO NA CHAVE (bancada de 06/11; só o F5 destravava): o clique na chave tinha dois retornos SILENCIOSOS. (1) Chave marcada "em envio" ignorava o clique sem avisar e sem limite de tempo: agora a tela avisa ("comando anterior ainda em envio") e, passados 12 s, solta o estado preso e deixa clicar. (2) Com o Patamar manual esperando o Aplicar, o clique só edita a sugestão e não comanda o PLC: agora a tela explica isso. Nenhum comando novo vai ao PLC.',
  ]},
  {v:"1.10.168",d:"06/11/2026",i:[
    'FASE 4 / PORTÃO A (bancada de 06/11): novas falhas vindas do PLC do banco (flow chaves v3.5 + PLC com os DBs v0.3). CHV-007 "Chave sem retorno (SB)": o PLC derrubou o comando (CB) porque o retorno não veio em 2 s; a chave fica TRAVADA e só rearma com um novo clique. CHV-008 "Contator colado": retorno ativo sem comando; o PLC bloqueia a chave. Com o flow antigo (sem esses campos) nada muda.',
    'Ao clicar numa chave que estava em falha de retorno, a tela avisa que é um rearme (o PLC só rearma com novo comando e retorno em 0).',
  ]},
  {v:"1.10.167",d:"03/11/2026",i:[
    'SEGURANÇA (auditoria Fase 2, Portão 1): o endereço da API do DSE deixou de ter IP fixo no HTML. Por padrão é a origem da própria página (/api/gerador no mesmo Node-RED). Uma customização fica só no navegador (localStorage, chave medidor.dseUrl) e é removida ao voltar ao padrão. Exemplos de IP no texto da tela viraram <servidor>.'
  ]},
  {v:"1.10.166",d:"03/11/2026",i:[
    'Alertas e Falhas viraram DOIS botões independentes no cabeçalho (cada um com a sua contagem e cor). Clicar em Alertas abre a janela só com alertas; clicar em Falhas, só com falhas. Dentro da janela há dois chips (Alertas N / Falhas N) para ligar o outro tipo junto — ou desligar, sempre sobrando pelo menos um. Clicar de novo no mesmo botão fecha; clicar no outro troca o tipo sem fechar. O triângulo do cabeçalho de cada card continua abrindo os dois tipos daquele card.'
  ]},
  {v:"1.10.165",d:"03/11/2026",i:[
    'MODO OPERADOR é o padrão ao abrir a página: o botão Demo agora fica ESCONDIDO e no lugar dele há uma caixa de senha. Digitando a senha de testes (sem precisar de Enter) o botão Demo aparece e as ferramentas de teste/desenvolvimento são liberadas; o cadeado trava de novo e volta ao modo operador. Acabou o prompt() de senha, que não abria no celular. A senha é trava contra uso por engano, não segurança.',
    'Pacote para a IA: só Markdown (saiu o botão .json) e nova seção \"Referências\": descrições prontas de figuras que se repetem (ex.: triângulo de ocorrências, estados das chaves), lidas da pasta referencias/ publicada ao lado do HTML. Marque as que valem para a pergunta e elas entram no pacote.'
  ]},
  {v:"1.10.164",d:"03/11/2026",i:[
    'NOVO — botão direito (e TOQUE LONGO no celular; Shift+F10 no teclado) abre um menu com: \"Capturar para a IA\", \"Abrir pacote (só imagem/texto)\", \"Inspecionar objetos (Alt+I)\", \"Copiar descrição deste objeto\" e \"Tamanho desta janela (⤢)\". Nada que já existia mudou: botões, popups, ⤢ e Alt+I continuam iguais; o menu só aponta para eles. Nos campos de texto continua o menu normal do navegador. Nenhum comando de chave/banco/gerador entra no menu.',
    'NOVO — \"Capturar para a IA\": faixa \"Captura ativa\" (Esc ou Cancelar desarma; desarma sozinha em 60 s); você arrasta um retângulo (ou toca em um objeto) e abre a janela \"Pacote para a IA\", nesta ordem: imagens (cole com Ctrl+V, arraste ou escolha da galeria; legenda e OCR opcional com o Tesseract local), objetos da área (nome, texto, posição, tamanho, estado, cor — com caixinha para tirar o que não interessa), contexto (versão, tela, Demo/PLC, janelas abertas, ensaio, FB mãe, erros; o log é opcional), a PERGUNTA, prévia e a estimativa de tokens. Botões fixos embaixo: \"Copiar e fechar\", Salvar .md, Salvar .json e Fechar (pergunta antes de descartar o que você escreveu). Campo de senha nunca entra. Se a cópia automática for bloqueada (página http), usa um plano B e, em último caso, seleciona a prévia.'
  ]},
  {v:"1.10.163",d:"03/11/2026",i:[
    'AUDITORIA GERAL (03/11). FBs: (1) a guarda de capacidade passa a BLOQUEAR chave com kW inválido (NaN/vazio/negativo), antes liberava; (2) com \"Usar kW real\" a sugestão travava (até 31 s) ou falhava (pilha estourada; banco de 32 chaves devolvia 0 kW sem aviso) — agora programação dinâmica também com kW real (24–39 ms; nunca passa do alvo nem do limite); (3) FALHA de execução (retorno físico não confirmou) só sai pelo REARME do operador — antes mudar kW a 100 %, limite, degrau ou chaves habilitadas reaplicava as chaves sozinho; (4) se a carga CONFIRMADA passa do limite, o Patamar derruba as chaves; (5) confirmação chave a chave (a soma podia bater com a chave errada); (6) no patamar Manual, o Aplicar confere a guarda da seleção final do operador. Módulos rodizio_chaves v0.6 e fbs_virtuais v0.13 (45 testes automáticos).',
    'AUDITORIA DE OPERAÇÃO (celular e desktop): (1) a coluna da etapa em andamento rola sozinha para a vista no Registro (o Salvar das etapas finais ficava escondido à direita no celular e em 1280 px); (2) até 1279 px o SALVAR ETAPA aparece ao lado do FINALIZAR; (3) PARAR ENSAIO pergunta primeiro se quer parar (antes o Cancelar também parava); (4) janelas de Chaves, Setup, Troca, Gráfico, Logs e Alertas abrem onde o operador está, sem a tela pular para o topo; (5) Resultado do ensaio: no celular só a tabela rola de lado; (6) botão Alertas/Falhas conta separado e fica com contorno vermelho com falha ativa; (7) botões desabilitados do Patamar ficam esmaecidos; (8) ✕ das janelas de Chaves volta ao canto de cima; (9) mensagens de sucesso em azul (vermelho só para erro); (10) Dados do ensaio no celular: fases sem corte e botões em 2 colunas. Também: dica do \"Ligar banco\" mostra a rota certa (/api/chaves/595).'
  ]},
  {v:"1.10.162",d:"03/11/2026",i:[
    'CORRIGIDO no resumo do Registro de aprendizado: o \"maior excesso sobre o alvo\" de uma etapa que DESCE (ex.: 0 % final depois de 107 %) mostrava ~106 pt porque contava as amostras ainda em \"estabilizando\" com a carga da etapa anterior. Agora, em etapa que desce, só conta o trecho \"contando\"; em etapa que sobe continua contando tudo (overshoot real). Achado nos seus logs de 03/11.'
  ]},
  {v:"1.10.161",d:"03/11/2026",i:[
    'CORRIGIDO no celular: o popup \"Resultado do ensaio · confira antes de gravar\" (e qualquer janela com etiqueta no cabeçalho) abria sem o ✕ de fechar, que ficava fora da tela (a etiqueta \"Nº série · versão\" deixava o cabeçalho mais largo que a janela). Agora a etiqueta encolhe com reticências e o ✕ fica sempre visível. Medido a 390 px: ✕ de x=409 (fora) para dentro da tela.'
  ]},
  {v:"1.10.160",d:"03/11/2026",i:[
    'CORRIGIDO (regressão da 1.10.154): no Registro compacto a linha com os botões \"Salvar valores da etapa\" ficava escondida, então o operador não conseguia salvar a etapa pela tabela. Achado pelo Operador secreto: na 1.10.141 o ensaio completo passava (6 etapas) e da 1.10.154 em diante parava na etapa 1. Agora a linha Salvar aparece também no modo compacto.'
  ]},
  {v:"1.10.159",d:"03/11/2026",i:[
    'FB Sugerir chaves reescrito por PROGRAMAÇÃO DINÂMICA (sem testar todas as 2^n combinações): 4 bancos reais caem de ~150 ms para 2–40 ms e um banco de 32 chaves passa a ser viável (antes: 22 chaves = 1,8 s, 32 = impossível). Resultado de menor custo igual ao anterior (150 casos conferidos). Bancos com kW fora da grade de 0,1 caem no cálculo antigo.',
    'FB mãe: tolerância de confirmação agora = menor entre 0,5 kW e a metade da menor chave habilitada (com chave de 0,5 kW do BC59,5, uma chave que não fecha não passa mais como confirmada); habilitar/desabilitar chaves recalcula a etapa; após FALHA, o 1º clique no chip "Patamar: On" REARMA (só com o DSE respondendo; nunca automático).',
    'Testes automáticos dos FBs: tests/fb (25 testes). Módulos-fonte: rodizio_chaves_v0.5 e fbs_virtuais_v0.12, iguais ao embutido aqui.'
  ]},
  {v:"1.10.158",d:"03/11/2026",i:[
    'CORRIGIDO (achado da suíte de testes tests/fb): o FB Sugerir chaves (sugere) lançava exceção interna com alvo inválido (vazio, NaN, negativo). Agora falha segura: nada ligado + aviso, sem travar a tela.'
  ]},
  {v:"1.10.157",d:"03/11/2026",i:[
    'Log de desenvolvedor (observabilidade) agora cobre TODOS os bancos: seletora (selXXX), "Ligar banco" (ligXXX) e comunicação (com.bXXX) de BC56, BC400, BC59,5 (595) e BC550 (550). Os nomes de BC56 e BC400 não mudam (sel56, lig400…).'
  ]},
  {v:"1.10.156",d:"03/11/2026",i:[
    'MIGRAÇÃO BT2: tirados os literais \'56\'/\'400\' do código — DB de cada banco (agora numeração v4: BC56=DB3000, BC400=DB3100, BC59,5=DB3200, BC550=DB3300; DB por tensão = +2), botões da janela de Logs, soma de acionamentos (rodízio) e a lista "Cards x flow" saem da tabela BANCOS. Um 5º banco vira só uma linha em BANCOS.',
    'NOVO — chave "BC59,5 e BC550 já estão no PLC" em Detalhes › Ajustes (ou abrindo a página com ?novos=1 / ?novos=0). Desligada (padrão) = como antes (bancos novos só no Demo local). Ligada = tiram o semPlc: polling, leitura e comando como BC56/BC400, usando as rotas /api/chaves/595 e /550 dos fluxos chaves-595 e chaves-550. Ligar SÓ depois de importar os blocos no PLC e os fluxos no Node-RED.'
  ]},
  {v:"1.10.155",d:"03/11/2026",i:[
    'MIGRAÇÃO BT2 (preparação): cada banco ganha o campo "rota" — a parte da URL /api/chaves/{rota} e /api/logs/{rota}. BC56 e BC400 continuam com rota = id (56, 400). BC59,5 usa 595 e BC550 usa 550 (sem vírgula na URL), prontos para os fluxos chaves-595 e chaves-550 v1.0. Nada muda na tela hoje: os dois bancos novos continuam "semPlc" até existirem no PLC; quando existirem, basta tirar semPlc de cada um.'
  ]},
  {v:'1.10.154',d:'02/11/2026',i:[
    'Registro do ensaio: os chips "Abrir" sob cada degrau voltavam a aparecer porque havia um 2º lugar no código (anexaBotoesRegistro) que os recriava quando a tabela era refeita; retirados dos dois lugares. O botão Resultado continua. O clique no degrau (0 %, 30 %…) e no card Etapas do ensaio continua abrindo o registro da etapa.',
  ]},
  {v:'1.10.153',d:'02/11/2026',i:[
    'Janela da Água: o botão ⤢ de tamanho ficava sobre o título (a janela não tem barra .jt e o ✕ é .dlgx); agora fica ao lado do ✕, no cabeçalho. Vale também para qualquer janela com cabeçalho .dlgtop.',
    'Banco de Cargas segue a seleção de Detalhes: banco selecionado NASCE aberto; não selecionado, fechado (continua visível e operável). Abrir/fechar à mão é livre e não muda a liberação das chaves (seletora Auto + Ligar banco). A seleção dos bancos agora é lembrada.',
  ]},
  {v:'1.10.152',d:'02/11/2026',i:[
    'Janela Detalhes do Patamar nasce com as medidas escolhidas pelo operador (735×578 px, x 357, y 99; módulo de janelas ganhou "padroes" — vale só até o operador mover/redimensionar). Cartões de patamar sem o tempo (min). Seleção dos bancos (BC56, BC400, BC59,5, BC550) saiu do card e foi para a seção Bancos da janela Detalhes. Registro do ensaio sem os botões Abrir (a função está no card Etapas do ensaio).',
  ]},
  {v:'1.10.151',d:'02/11/2026',i:[
    'Janela "Detalhes do Patamar" virou janela de verdade (fixa no HTML, como a Tabela de potência): botão ⤢ de tamanho/posição, altura máxima com rolagem, conteúdo em seções (Resumo por banco, Plano de passos, Operador e salvamento, Fonte do DSE, Ferramentas, Ajustes). Os campos de Ajustes não perdem o foco enquanto você digita.',
    'Card Registro do ensaio: nasce COMPACTO, mostrando só os degraus (% e status/Abrir) e a linha Carga real; o clique no título alterna entre compacto e completo (com a dica correta em cada estado).',
  ]},
  {v:'1.10.150',d:'02/11/2026',i:[
    'Card PATAMAR no arranjo pedido pelo operador (maquete v0.3): Gerador em cima sem título; Bancos; 4 cartões + Abrir TODAS as chaves como 5ª coluna; linha Sugerir / Limpar / Aplicar / Ligar Patamar Guiado; barra de resultado embaixo. Resumo por banco, plano, operador, DSE, mapa e ajustes foram para a camada aberta pelo chip "Detalhes" no cabeçalho do card.',
  ]},
  {v:'1.10.149',d:'02/11/2026',i:[
    'Card PATAMAR: retirados o texto "Gerador em 220 V — atendem..." e a caixa de estado da Mãe. O estado da Mãe passou para a dica (ao passar o mouse) do botão Ligar Patamar Guiado.',
  ]},
  {v:'1.10.148',d:'02/11/2026',i:[
    'Card PATAMAR: botão Aplicar na mesma linha de Sugerir chaves e Limpar seleção. Plano de passos e Detalhes saíram da tela e ficaram numa janela única, aberta pelo chip "Detalhes".',
  ]},
  {v:'1.10.147',d:'02/11/2026',i:[
    'Card PATAMAR mais enxuto: 4 patamares em uma linha; Manual (mão amarela, fundo branco) e Auto (setas brancas, fundo azul) juntos num conjunto só; o selecionado ganha contorno escuro (sem o verde); "Clique em um %" retirado; botão de emergência subiu para a linha do título.',
  ]},
  {v:'1.10.146',d:'02/11/2026',i:[
    'Ícone do Auto trocado para o símbolo azul de ciclo automático (SVG, para aparecer igual em qualquer PC).',
  ]},
  {v:'1.10.145',d:'02/11/2026',i:[
    'Card PATAMAR sem títulos repetidos (Sugerir, Patamar Guiado automático, Aplicar): a explicação ficou no ícone i. Aviso de patamar vazio virou uma linha curta.',
  ]},
  {v:'1.10.144',d:'02/11/2026',i:[
    'Ícone do Manual trocado para ✋ (mão). Ícone do Auto ainda a escolher.',
  ]},
  {v:'1.10.143',d:'02/11/2026',i:[
    'Card PATAMAR mais enxuto: Manual e Auto viraram ícones (👤 Manual, ⚙ Auto), com a explicação ao passar o mouse; cartões de patamar mais estreitos (cabem mais por linha). Mesmas ações.',
  ]},
  {v:'1.10.142',d:'02/11/2026',i:[
    'Card PATAMAR reorganizado: a parte do ensaio (bancos, patamares, Sugerir, Ligar guiado, Aplicar) fica visível; Operador/Salvamento, Fonte do DSE, mapa, ajustes avançados e plano de passos foram para "Detalhes" (recolhido). Textos longos viraram ícones (i). Nenhuma ação mudou: mesmos botões e mesma lógica.',
  ]},
  {v:'1.10.141',d:'02/11/2026',i:[
    'Entrega (pacote de publicação): o medidor passa a carregar o catálogo de ferramentas v0.7 (antes pedia v0.1, que não existe). Nenhuma mudança de funcionamento.',
  ]},
  {v:'1.10.140',d:'02/11/2026',i:[
    'BC59,5 e BC550 viram BANCOS DE VERDADE no Demo local: aparecem no card Cargas com tiles, comando, seletora/Ligar banco, simulação de carga, Setup, Chaves, Troca de resistência, Patamar Guiado e FB mãe (Auto). Marcação na linha "Bancos" do Patamar (BC56/BC400 nascem marcados; os novos, não). Marcados "semPlc": sem rota/polling/DB — fora do Demo local (PLC) as chaves deles ficam sem leitura e o comando é bloqueado. Voltou a um cálculo só para todos os bancos (a camada só-consulta e a mãe "só PLC" saíram). Tensões dos novos = ASSUMIDO [220,380,440].',
  ]},
  {v:'1.10.139',d:'02/11/2026',i:[
    'CORRIGIDO: no Patamar Auto o FB mãe travava ("FALHA — nenhuma combinação cabe abaixo do alvo") e o cronômetro não iniciava, porque a sugestão passou a escolher chaves de BC59,5/BC550, que a mãe não comanda nem mede. A mãe agora calcula só com os bancos com PLC (BC56/BC400). O botão Sugerir chaves continua usando os 4 bancos (análise visual).',
  ]},
  {v:'1.10.138',d:'02/11/2026',i:[
    'CORRIGIDO: com Patamar ligado e ensaio parado, a sugestão feita no botão Sugerir chaves era apagada pelo ciclo de 1 s (seleção ia a 0 kW). Agora a sugestão pedida pelo operador fica até Limpar seleção / parar o ensaio. Sugerir funciona também só com BC59,5/BC550 marcados (antes dava 0 kW). Tracejado dos bancos BC59,5/BC550 só aparece para banco marcado; Limpar seleção também zera esses bancos.',
  ]},
  {v:'1.10.137',d:'02/11/2026',i:[
    'Sugerir chaves (só análise, Demo): as chaves sugeridas dos bancos só-consulta (BC59,5/BC550) aparecem tracejadas nos seus próprios tiles. Nada é comandado; Aplicar continua só para BC56/BC400.',
  ]},
  {v:'1.10.136',d:'02/11/2026',i:[
    'Sugestão do Patamar com FBs de cálculo por número de bancos: 2 bancos (FB original, sem mudança), 3 bancos, 4 bancos e 5+ bancos. A escolha é automática, pela quantidade de bancos marcados. Os FBs de 3+ combinam bancos por soma (guarda só a melhor combinação de cada soma), em vez do produto completo que esgotava a memória com 4 bancos. Testado contra força bruta (300 casos aleatórios de 3 e 4 bancos): mesma diferença mínima do alvo.',
    'Sugerir chaves agora calcula TODOS os bancos marcados num único cálculo (BC56, BC400, BC59,5 e BC550). A divisão em duas etapas (PLC primeiro, depois manuais) saiu. O comando de PLC continua só em BC56/BC400.',
  ]},
  {v:'1.10.135',d:'02/11/2026',i:[
    'Balão de ajuda (ícone i): parava de aparecer fora da tela no celular quando o ícone estava perto da borda esquerda (centralizava sob o ícone e estourava). Agora ancora pela esquerda do ícone com largura adaptada ao viewport — não estoura mais.',
    'Patamar Guiado: checkbox dos bancos BC59,5/BC550 agora aparece direto na linha "Bancos" (junto com BC56/BC400), sem precisar abrir o card Banco de Cargas — é o mesmo estado "Usar neste ensaio" dos dois lugares. Tirado o aviso "Manual (sem PLC)" do topo e o rótulo "(manual)" da lista de sugestão, a pedido do operador — os 4 bancos aparecem lado a lado, com o mesmo formato. BC59,5/BC550 continuam sem tile no card Cargas (ainda não têm PLC/Node-RED real) — isso é a próxima etapa da migração (Dashboard, Node-RED, PLC), não feita nesta versão.',
  ]},
  {v:'1.10.134',d:'02/11/2026',i:[
    'Patamar Guiado: a pedido do operador, BC59,5 e BC550 ("só consulta", sem PLC/Node-RED) PASSAM A ENTRAR na sugestão e no total do Patamar. Cálculo em 2 etapas: 1) BC56/BC400 (com PLC) tentam sozinhos, como antes; 2) o que sobrar do alvo é repassado para BC59,5/BC550, dentro da folga de segurança que ainda resta (limite do gerador − já sugerido nos bancos reais). Essas chaves NUNCA são comandadas por aqui — aparecem só na lista "BC.. (manual)" do resumo, para o operador ligar/desligar à mão; o plano de comando (Confirmar e aplicar) continua só com BC56/BC400. O cartão de resultado (Seleção/alvo/diferença/limite) agora soma os 4 bancos; a guarda que libera comando ao PLC (aplica/planoDe) continua olhando só os bancos reais. ASSUMIDO: BC59,5/BC550 não têm ficha de tensão — contam como elegíveis sempre que marcados "Usar neste ensaio", independente da tensão do gerador; a engenharia confirma. Preferência pelos bancos com PLC primeiro (automáticos, com rodízio de desgaste) — a confirmar com a engenharia se a ordem deveria ser outra.',
  ]},
  {v:'1.10.133',d:'02/11/2026',i:[
    'Patamar Guiado: cartão de resultado (3 · Sugerir e 5 · Ligar) redesenhado — a mensagem de bloqueio/aviso fica sozinha em destaque e os números (Seleção/alvo/diferença/limite) viraram uma linha leve embaixo, em vez de tudo numa frase só em negrito colorido gigante (achado do operador: tela "muito poluída"). Confirmado: BC59,5 e BC550 ("só consulta") propositalmente não entram no Patamar Guiado — não têm PLC/Node-RED (ver 1.10.132).',
  ]},
  {v:'1.10.132',d:'01/11/2026',i:[
    'Patamar Guiado: todo o conteúdo do antigo diálogo agora fica DENTRO do card Patamar (acima do Banco de Cargas). O botão "Patamar Guiado" do cabeçalho recolhe/abre o corpo; "Abrir TODAS as chaves" (emergência) fica no topo do corpo. Saíram as 4 caixinhas da 1.10.131 (o conteúdo do guiado já mostra tudo).',
  ]},
  {v:'1.10.131',d:'01/11/2026',i:[
    'Card Banco de Cargas: BC56 e BC400 viraram sub-cards com setinha (como BC59,5 e BC550). Nascem ABERTOS e o estado aberto/fechado fica guardado no navegador. Seletora, Ligar banco e kW ligados ficam na barra do sub-card (visíveis mesmo fechado).',
    'Card PATAMAR agora tem corpo com 4 caixinhas de leitura: Estado, Patamar (etapa e alvo %), Chaves sugeridas por banco e Próximo passo. Botões e ids do cabeçalho inalterados.',
  ]},
  {v:'1.10.130',d:'01/11/2026',i:[
    'Patamar virou um CARD próprio (botão Patamar Guiado, estado Off/On e ✔ Aplicar), empilhado ACIMA do card Banco de Cargas. Os botões mantêm os mesmos ids; nada mudou na lógica.',
    'Falta de leitura do PLC: o texto "⚠ SEM LEITURA do PLC" saiu de dentro do card do banco; agora é a falha CHV-006 no triângulo do cabeçalho do card Banco de Cargas (com o número de falhas). As chaves continuam com "?" e contorno tracejado.',
    'Janelas (⤢): o limite de altura/largura em vh/vw era multiplicado pelo zoom do corpo da página, e a janela "nascia pequena" e não crescia; agora o limite é em px reais (v0.7). "Ajustar" também usa a escala total.',
  ]},
  {v:'1.10.129',d:'01/11/2026',i:[
    'Janelas (⤢): chave de memória nova (bt2.jan2) — descarta posições/zoom salvos por versões anteriores, gravados com o zoom total e que reabriam deslocados (ex.: dlgDemo). Testadas as 26 janelas (zoom da tela 100% e 80%): Salvar → fechar → abrir volta ao mesmo lugar/tamanho. Salve de novo as janelas que você ajustou.',
    'Banco de Cargas: o nome do banco fica no mesmo lugar e a seletora/Ligar banco vêm logo ao lado (esquerda).',
  ]},
  {v:'1.10.128',d:'01/11/2026',i:[
    'Janelas v0.6 (correção do SIZE): o Salvar gravava o zoom TOTAL (zoom do corpo da página × zoom da janela) e ao reabrir o zoom era aplicado em dobro; agora grava só o zoom próprio e reabre no mesmo lugar e tamanho. Janelas salvas antes da 1.10.128 devem ser salvas de novo.',
    'Dica de interface: o retângulo laranja e o balão agora respeitam o zoom do corpo da página (apareciam deslocados).',
    'Banco de Cargas: seletora/Ligar banco voltaram à posição original (continuam sem borda).',
  ]},
  {v:'1.10.127',d:'01/11/2026',i:[
    'Janelas (⤢ Tamanho) v0.6: ao reabrir, a janela INTEIRA é mantida dentro da tela atual (antes só a barra de título); se for maior que a tela, encolhe. Corrige o diálogo reaparecendo parcialmente fora após Salvar, fechar e abrir em outra tela/zoom.',
    'Card Banco de Cargas: legenda Ligado/Desligado/Comandada removida; botões (seletora Auto/Manual, Ligar/Desligar banco, chips) sem borda .',
    'Dica de interface (Alt+I): passa a apontar a chave (tile), o banco ou o botão sob o mouse, em vez do contêiner #bancos.',
  ]},
  {v:'1.10.126',d:'31/10/2026',i:[
    'Seletor "Usar neste ensaio" nos bancos BC59,5 e BC550 (card Banco de Cargas). Marcado, o banco passa a aparecer, SÓ PARA CONSULTA, nas abas dos diálogos Chaves (Habilitar/Desabilitar e Setup), na Troca de resistência e no Patamar Guiado (aviso). A escolha fica guardada no navegador.',
    'BC59,5 e BC550 continuam sem PLC/Node-RED: não há polling, comando, Setup, sugestão do Guiado nem soma de kW para eles. BC56 e BC400 não mudaram. A 1.10.124 (2 bancos) segue guardada.',
  ]},
  {v:'1.10.125',d:'31/10/2026',i:[
    'Card Banco de Cargas: aparecem os outros 2 bancos (BC59,5 e BC550) como sub cards (setinha) FECHADOS, só para consulta — chaves em cinza, sem clique e sem ligação com PLC/Node-RED. A versão anterior (1.10.124, só 2 bancos) foi mantida no projeto.',
    'Mapa dos FBs v0.14 (embutido): no celular a barra de cima fica compacta e os 3 blocos Gerador → Banco → Carga aparecem completos (quebram em linhas); botões sem borda.',
  ]},
  {v:'1.10.124',d:'31/10/2026',i:[
    'Alertas e Falhas: o triângulo AMARELO voltou na frente de "Alertas"; o triângulo vermelho com "!" fica no lugar do "e" ("▲ Alertas ▲ Falhas").',
    'Card Modo: saiu o botão "Dados" (os Dados do ensaio já abrem pelo card Etapas do Ensaio e pelo link do Setup).',
    'Painel de tamanho das janelas (⤢) v0.5: novo botão "Salvar" — guarda tamanho, posição e zoom da janela no navegador (localStorage) para ela nascer assim.',
    'Troca de resistência: cada banco virou um sub card (setinha) que nasce FECHADO; abre um por vez, e mostra quantas chaves estão marcadas. Preparado para 4 bancos.',
    'Catálogo de modelos (.csv): ao abrir a página servida por http (Node-RED) o sistema procura o catalogo_modelos_v0.1.csv na mesma pasta e atualiza sozinho. Aberta como arquivo (file://) o navegador bloqueia — aí continua o "Escolher arquivo".',
    'FBs virtuais v0.11: o filho 7 (Tempos) agora sinaliza no mapa assim que o ensaio é iniciado, mesmo com a FB mãe desarmada (antes só sinalizava com a mãe armada).',
  ]},
  {v:'1.10.123',d:'30/10/2026',i:[
    'Setup › Chaveamento: ao abrir o diálogo, o chaveamento (220/380/440 V) já vem SINALIZADO pela tensão do "Dados do ensaio" (campo Tensão, preenchido pelo modelo de gerador escolhido). No Demo local o chaveamento é marcado sozinho; no modo PLC só aparece a dica (o HTML não escreve a tensão no PLC por conta própria). Se o chaveamento ativo divergir dos Dados, o aviso aparece ao lado.',
    'Placa do BC550: série agora "18 1308" (o caractere ilegível é um espaço), sem o "?".',
  ]},
  {v:'1.10.122',d:'30/10/2026',i:[
    'Cabeçalho mais limpo: saíram "Modo guiado", "Dados" e a etiqueta "MANUAL" (modo do controlador DSE). O Modo continua no botão "⚙ Alterar" do card Modo e os Dados do ensaio no botão "📋 Dados" do mesmo card (e no link novo do Setup).',
    'Modo escuro virou ícone (lua/sol). "Alertas e Falhas" ganhou o triângulo vermelho com "!" branco no lugar do "e".',
    'Todos os botões da interface ficaram SEM BORDA: usam um tom a mais que o fundo (claro e escuro). Só a aparência mudou — nada muda de tamanho nem de lugar. Chaves do banco de carga, campos de digitação e indicadores de estado não foram mexidos.',
    'Card Banco de Cargas: novo ícone de placa abre a RÉPLICA VISUAL das placas dos 4 bancos (BC56, BC400, BC59,5 e BC550), conforme as fotos. Só informativo: BC59,5 e BC550 ainda não estão integrados ao sistema.',
    'Setup: novo link "Abrir Dados do ensaio" (abre o mesmo diálogo do botão Dados).',
    'Card Simulação: o rótulo "DSE simulado:" virou "SI-DSE:".',
    'Janelas v0.4: painel de tamanho (⤢) redesenhado e mais compacto; o botão "Caber na tela" virou "Ajustar" (sem preposição).',
    'Setup: removida a animação amarela que piscava nos números das fórmulas.',
  ]},
  {v:'1.10.121',d:'30/10/2026',i:[
    'Patamar Manual: enquanto a sugestão espera o Aplicar, clicar numa chave do card Cargas só TIRA ou COLOCA a chave na sugestão (tracejado) — não comanda mais o PLC. Depois do Aplicar os cliques voltam a comandar. (Só cliques do operador; os comandos do sistema, como "Abrir TODAS" e a parada por falha do DSE, nunca são interceptados.)',
    'Setup: fórmulas do kW real e da resistência redesenhadas (números grandes, cada termo com nome, o resultado em destaque; o valor pisca ao mudar).',
    'Setup › Chaveamento 220/380/440 V agora liga e desliga: clicar na tensão ativa volta para "não informado". No Demo local já funciona; no PLC real precisa do flow v2.6 (aceita tensao 0).',
  ]},
  {v:'1.10.120',d:'30/10/2026',i:[
    'Salvamento: agora são TRÊS modos (⚙ Modo): Manual, Automático e "Por patamar". Em "Por patamar" a etapa é salva e o ensaio avança sozinho ao cumprir o tempo (como o Automático); o que cada patamar escolhe é como as CHAVES ENTRAM: Manual ou Auto. (Corrige a 1.10.119, que misturava salvar com aplicar.)',
    'Patamar Manual: ao entrar no patamar as chaves sugeridas aparecem tracejadas no card Cargas e o sistema espera o operador. O operador pode ajustar a seleção e clicar "Aplicar" (botão que aparece ao lado de Patamar Guiado). Entram as chaves selecionadas; depois ele liga à mão as que tirou até a carga atingir o degrau, e o tempo do patamar corre normalmente. Patamar Auto: as chaves entram sozinhas.',
    'FBs virtuais v0.10: novo estado AGUARDA_APLICAR da mãe; o Patamar Guiado passa a ligar sozinho em "Por patamar" (não exige mais Operador = Auto).',
    'Janela ⚙ Modo mais limpa: os textos explicativos foram para o ícone i de cada título; botões com nomes curtos.',
  ]},
  {v:'1.10.119',d:'30/10/2026',i:[
    'Patamar refeito: cada patamar (30, 50, 100 %…) ganhou seu próprio SALVAMENTO Manual/Auto. O ajuste global (⚙ Modo › Salvamento) vira o PADRÃO de todos; clicar em Manual/Auto num patamar cria uma exceção só para ele (clicar de novo volta ao padrão). Fica guardado neste computador.',
    'Novo botão "Aplicar (salvar e seguir)" no Patamar: nos patamares em Manual o OPERADOR fecha a transição — completa a carga com as chaves e, ao atingir a % do degrau (e o tempo configurado de liberação do SALVAR), o Aplicar acende; ele grava a etapa e segue o ensaio (mesma regra do SALVAR). Mostra a barra de carga na faixa do degrau e quanto falta.',
    'Patamar sem seleção: ao desmarcar o patamar o cartão mostra "sem sugestão" e as chaves tracejadas somem.',
    'FBs virtuais v0.9: o filho 9 informa o salvamento do patamar e se o APLICAR está liberado (aparece no mapa dos FBs v0.12). A mãe continua sem salvar nem avançar etapa.',
  ]},
  {v:'1.10.118',d:'30/10/2026',i:[
    'Menu ☰ v0.2: botão "Atualizar" procura na pasta as versões novas de cada ferramenta (testa os próximos números de versão) e passa a abrir a mais nova, sem editar o catálogo; "Esquecer" desfaz.',
    'Botões Popup/Analisar (gráfico) e Mapa em janela: agora abrem o ARQUIVO REAL da pasta (página 100 %, a versão que o menu ☰ conhece). Só se o arquivo não existir é que usam a cópia embutida (mais antiga).',
    'Janelas v0.3: o balãozinho do ⤢ fica aberto enquanto você move/redimensiona a janela, mostra e deixa digitar a posição (x, y) e a posição é salva sozinha ao soltar o mouse — a janela já nasce ali da próxima vez. Restaurar apaga tamanho, zoom e posição.',
    'Card Simulação: o ícone do DSE simulado deixou de ser os olhos (que são do observador Gerenciador/Gráfico) e virou uma senoide ideal animada; fica vermelha e distorcida quando alguma condição está marcada como REPROVADA.',
    'Gráfico do ensaio v0.10 (embutido aqui): topo compacto, o desenho ganha ~50 % de altura; olhos de observador.',
  ]},
  {v:'1.10.117',d:'29/10/2026',i:[
    'CAUSA ENCONTRADA da perda de status das chaves (log de 29/10): na troca de etapa o medidor disparava até 26 POST /api/chaves/{banco}/ligar ao mesmo tempo (22:58:38, 28 POSTs no mesmo milissegundo). Eles lotam as conexões do navegador e o Node-RED/PLC; o GET /api/chaves seguinte ficava 4 s na fila, estourava o tempo ("AbortError", ms 4001) e o banco virava "sem leitura" (falsa leitura). Agora os POST de chave saem em fila (no máximo 3 por vez, na mesma ordem), o que deixa sempre conexão livre para o GET; e o GET de chaves ganha 6 s. Nenhuma rota nova: mesmos POST/GET de antes.',
    'Correção do erro "Cannot read properties of null (reading style)" da Dica de interface (Alt+I) que apareceu no log às 23:07: a caixa de contorno ainda não existia no primeiro movimento do mouse.',
  ]},
  {v:'1.10.116',d:'29/10/2026',i:[
    'Simulação: o DSE simulado agora é IDEAL — as 6 condições de aprovação do "Resultado do ensaio" nascem sempre APROVADAS no Demo (antes o stand-by dava 106,6 % e reprovava sozinho). No card "Simulação" há um par de olhos animados ("DSE simulado"); clicar abre um diálogo com as 6 condições e a escolha Aprovado / Reprovado de cada uma, para simular reprovação quando quiser. Só vale com ensaio SIMULADO: ensaio real nunca é alterado. Resultado/PDF marcam "definido pelo DSE simulado".',
  ]},
  {v:'1.10.115',d:'29/10/2026',i:[
    'URGENTE — card Banco de Cargas: chave SEM LEITURA do PLC (leitura com mais de 5 s ou erro) deixava de ser "?" e aparecia como DESLIGADA esmaecida (falsa leitura). Agora aparece com bolinha hachurada, contorno tracejado e "?"; o cabeçalho do banco diz "⚠ SEM LEITURA do PLC — chaves desconhecidas" e o tooltip de cada chave mostra o motivo e há quanto tempo foi a última tentativa. "Aplicado nas chaves" e "Diferença" mostram — (e não 0 kW) enquanto algum banco estiver sem leitura.',
    'Mapa dos FBs v0.11 e Gerenciador de logs v1.6 com botão Ajuda; catálogo sem o Simulador do rodízio e o Painel BT2 (sem função no projeto).',
    'Log [DEV.OBS]: uma linha quando um banco PERDE e quando RECUPERA a leitura do PLC (com motivo e idade do dado) — para achar a causa das quedas.',
  ]},
  {v:'1.10.114',d:'29/10/2026',i:[
    'DICA DE INTERFACE (Alt+I liga/desliga; ou abrir com ?ui=1): ao passar o mouse mostra o TIPO do elemento (Botão, Chip, Card, Janela…), o ID de programação (#id) e as coordenadas na tela; Alt+clique fixa a etiqueta (popover) com botão Copiar. Desligada por padrão. Mesma dica em todos os HTML do projeto.',
    'JANELAS v0.2: o aviso "não pode abrir agora" (popover) fica aberto até fechar (✕, Esc ou clique fora) e mostra o tipo e o id da janela.',
    'Gráfico v0.9 e Mapa dos FBs v0.10 embutidos (mapa: ligações em estilo placa de circuito, ícone i e destaque por clique).',
  ]},
  {v:'1.10.113',d:'29/10/2026',i:[
    'PARAR ENSAIO (Demo/Demo+PLC): ao desligar a simulação o estado do gerador simulado ("operando") ficava para trás e travava o popup ⚙ Modo (e dava a impressão de tela congelada). Agora o estado/medição simulados são limpos ao sair do Demo.',
    'Botões do cabeçalho dos cards (Analisar, Popup, Patamar, Grandezas, Motor, Faixas, Resultado...) não recolhem/expandem mais o card: o card permanece como estava.',
    'Card Modo: nova linha "Visão do operador" (Completa/Simples).',
    'Retirado o botão "Gerar PDF" do card Leitura das grandezas (o PDF continua em Imprimir dentro dos popups e no Resultado).',
    'JANELAS: regra "sem risco = flutuante" — os popups que não oferecem risco abrem sem travar a tela (várias ao mesmo tempo, arrastáveis, redimensionáveis); os que oferecem risco (Faixas/parâmetros, limites de água, Demo) nem abrem com ensaio em andamento ou gerador real ligado: só uma mensagem pequena e discreta. Continuam travando a tela: Dados do ensaio, Finalizar, Resalvar, registro da etapa.',
    'CONTROLE DE TAMANHO único (botão ⤢ na barra de título de TODA janela): zoom − / +, largura, altura, caber na tela, restaurar e copiar medidas; o canto inferior direito arrasta para redimensionar; o que você deixar fica lembrado. Substitui a barra grande A−/A+/100 %/COPIAR MEDIDAS do Patamar guiado.',
    'Gráfico v0.8 embutido (seletor de fonte "Medidor / Gerador direto" mais claro).',
  ]},
  {v:'1.10.112',d:'29/10/2026',i:[
    'API DOS CARDS (dentro do navegador, somente leitura): cada card da tela (tensões, correntes, potência, água, rotação, bateria, banco de cargas, modo...) mais o estado do ensaio, das etapas, do gerador e das comunicações é publicado no canal bt2-api para os outros HTML (gráfico v0.7 já usa; visor api_cards_visor_v0.1). Não cria rota nova no Node-RED e não aceita comandos.',
    'VISÃO SIMPLES DO OPERADOR (⚙ Modo › Visão do operador, ou ?op=1): só INICIAR; as etapas avançam e gravam sozinhas, o ensaio finaliza sozinho; ZERAR (só o degrau) e PARAR ENSAIO continuam. Esconde Banco de Cargas/Patamar, PAUSAR, SALVAR e FINALIZAR. Reaproveita Guiado + salvamento automático (sem lógica nova), com PLC conectado ou Demo.',
  ]},
  {v:'1.10.111',d:'29/10/2026',i:[
    'Cabeçalho: retirado o visual "a cada 1 s" da barra da API (confundiu na apresentação). O intervalo de leitura continua 1 s por dentro; nada mais mudou.',
  ]},
  {v:'1.10.110',d:'29/10/2026',i:[
    'Gráfico do ensaio v0.6 embutido (substitui o v0.5): novos cartões "Condições de aprovação" (tempo a 100 %, tensão máx/mín, frequência máx/mín, stand-by, etapas concluídas, resultado) que, ao passar o mouse ou tocar, destacam no gráfico a etapa e o valor medido; e fonte "API direto" para acompanhar o ensaio em outro aparelho sem abrir o medidor (somente leitura; resultado informativo).',
    'O medidor passa a informar ao gráfico os critérios usados na aprovação (100 % por T100_MIN e stand-by por STBY_MIN), para o gráfico conferir com os mesmos números. O restante do medidor não mudou.',
  ]},
  {v:'1.10.109',d:'29/10/2026',i:[
    'MENU ☰ DE DESENVOLVIMENTO (pedido do usuário): botão ☰ no cabeçalho, só para o desenvolvedor (aparece depois da senha do Demo, ou com ?dev=1 no endereço; ?dev=0 desliga). Lista as ferramentas do projeto e abre a escolhida NO MESMO ENDEREÇO (IP:porta) da página atual; se a página estiver em file:// ele avisa que precisa abrir por http://IP:1880/. Botão "Verificar se os arquivos existem" marca ✓/✗ para cada ferramenta. Módulos novos (mesma pasta): catalogo_ferramentas_v0.1.js (lista única de arquivos e versões) e menu_dev_v0.1.js. Se os dois arquivos não existirem, o medidor funciona igual (o menu simplesmente não aparece).',
    'O botão "Gerenciador de logs" passa a abrir o arquivo indicado no catálogo (antes o nome ficava fixo no código); sem o catálogo usa gerenciador_logs_v1.4.html como antes.',
    'Mapa dos FBs v0.8 embutido (substitui o v0.7): esquema único com cada filho como um FB do PLC — entradas à esquerda, saídas à direita, valor ao vivo por pino e fios entre os blocos; clicar abre uma gaveta com abas Resumo e Técnico (valores, conta em andamento, ligações). Sumiram os botões Macro/Explodido. Nada mudou no ensaio, nas chaves, no PLC ou no Node-RED.']},
  {v:'1.10.108',d:'29/10/2026',i:[
    'FICHA DO BANCO — TENSÕES POR BANCO (pedido do operador): o BC56 atende 220, 380 e 440 V; o BC400 só 220 e 380 V (antes uma lista única oferecia 440 V para os dois). A lista fica em BANCOS (campo tensoes); se o retrofit passar o BC400 para 440 V basta acrescentar 440 lá. Módulo: modulos/ficha_banco_v0.1.js.',
    'Setup › chaveamento: o botão de uma tensão que o banco não tem fica desabilitado (mesmo tamanho, só esmaecido) com a explicação no balão; se já houver um chaveamento guardado que o banco não tem, o selo avisa.',
    'Patamar Guiado: ELEGIBILIDADE pela tensão do gerador (Dados do ensaio). Gerador em 440 V → o BC400 aparece desabilitado ("não atende 440 V") e não entra na sugestão nem no comando; se nenhum banco marcado atende, a mensagem diz quais atendem. Tensão fora de 220/380/440 (ex.: 400) NÃO restringe banco (ASSUMIDO) e a tela avisa. A marcação do operador é preservada: voltando a tensão, o banco volta como estava.']},
  {v:'1.10.107',d:'29/10/2026',i:[
    'EXPORTAR ▾ UNIFICADO (todas as telas): um menu só por tela, com todos os formatos juntos. CORREÇÃO: o menu aparecia ATRÁS das janelas (Grandezas, Motor, Log, Alertas…) porque as janelas modais ficam na camada de cima do navegador; agora o menu usa a mesma camada (popover) e abre sempre por cima.',
    'Gráfico do ensaio: o botão "Gerar relatório (PDF)" e o "Exportar ▾" viraram UM só "Exportar ▾" com Relatório do ensaio (PDF), Gráfico (PNG) e Dados (CSV). Chaves › Setup: "Imprimir Setup (PDF)" virou "Exportar ▾" com PDF, Texto e Markdown. Registro de aprendizado: 3 botões de arquivo viraram "Exportar ▾" (Tudo, só resumo, só amostras).',
    'IMPRESSÃO AUTOMÁTICA ao fim do ensaio (⚙ Modo › novo card): marcando, quando o ensaio termina o relatório PDF é gerado sozinho e salvo na pasta escolhida (ou baixado, se não houver pasta); opção de abrir também a impressão do navegador. O campo "caminho de destino" é referência (o navegador não grava em caminho digitado): aparece na mensagem e no Log; para gravar direto use "Escolher pasta". A pasta é a mesma do Registro de aprendizado e é lembrada neste navegador (pode pedir autorização de novo).',
    'Páginas embutidas atualizadas: gráfico v0.5, mapa v0.7 (ambos com Exportar ▾; o mapa exporta PDF, PNG e SVG). Gerenciador de logs v1.4 (Exportar ▾ com JSON, Markdown e PDF). Simulador de amostras v0.5 (Exportar ▾).']},
  {v:'1.10.106',d:'29/10/2026',i:[
    'ESCALONADOR DE ENTRADA com SUB-DEGRAUS (FB filho 10, em JavaScript): entre uma etapa e outra a carga sobe em passos de pontos percentuais em vez de um degrau seco. Padrões pedidos pelo operador: 30→50 de 5 em 5 (35, 40, 45, 50 %), 50→100 de 10 em 10, 100→107 em 3 e 4 (103, 107 %). Só vale com o ensaio INICIADO (o cronômetro da etapa continua só começando depois da estabilização no alvo final).',
    'Em cada sub-degrau as chaves NOVAS entram primeiro e as que deixam de ser necessárias saem DEPOIS de uma janela (padrão 1 s): a carga nunca cai no meio da subida. Pausa entre sub-degraus: padrão 1 s. Trava: se a sobreposição (antigas + novas) passar do limite de segurança ou do alvo da etapa, aquele sub-degrau troca as chaves no mesmo instante (ordem antiga) e o aviso aparece na lista de passos e no Log; no comando, a guarda ainda confere o transitório antes de CADA passo.',
    'Todos os números do escalonador ficam num lugar só, em Ajustes avançados › "Escalonador de entrada (filho 10)": sub-degraus ligados/desligados, ligar antes/desligar depois, janela, pausa e os passos de cada transição (vários valores separados por vírgula; o último se repete). São os mesmos parâmetros que o FB filho 10 terá no PLC. Valores assumidos até a engenharia confirmar.',
    'Patamar Guiado AUTOMÁTICO agora também funciona com SALVAMENTO AUTOMÁTICO quando a fonte é o SIDSE (simulador ideal do DSE). Com o DSE real continua exigindo salvamento manual. O indicador do diálogo mostra "Salvamento: manual" ou "automático (SIDSE)".',
    'Mapa dos FBs: novo botão "↗ Janela própria" (no painel do mapa e no diálogo do Patamar) abre o mapa numa janela separada para arrastar à segunda tela, igual ao gráfico. O painel dentro da página continua existindo.',
    'Gerenciador de logs v1.3 (gerenciador_logs_v1.3.html): ABAS por página — Medidor | Gráfico | Mapa dos FBs. O gráfico (v0.4) e o mapa (v0.6) passaram a registrar o que acontecem neles (abriu, sinal ao vivo, lote com buraco, sem dados, estado da mãe, erro JavaScript) e entregam ao gerenciador quando ele pede. O JSON/Markdown exportado leva todas as abas. O botão do popup Demo abre o v1.3.',
    'Log: o escalonador registra no Log de desenvolvimento (card bco) o plano de cada aplicação (passos, duração, sub-degraus, avisos) e qualquer passo interrompido pela guarda.',
  ]},
  {v:'1.10.105',d:'28/10/2026',i:[
    'CORREÇÃO (achada no teste do operador em DEMO + PLC): ao salvar o aquecimento e ir para 30 %, as chaves ligavam no PLC (56 kW) mas o "Medido no DSE" ficava em 0,0 kW e a contagem do tempo não começava. Causa: o DSE SIMULADO calculava a carga só pelas chaves do simulador local, e em DEMO + PLC quem liga as chaves é o PLC. Agora, com as chaves vindas do PLC, a carga simulada segue o FEEDBACK real das chaves (sb.ligada). Demo local não muda.'
  ]},
  {v:'1.10.104',d:'28/10/2026',i:[
    'Patamar Guiado (diálogo, passo 5): o parágrafo explicativo saiu; ficam só DOIS indicadores de check — "Operador: Auto" e "Salvamento: manual" — cada um com ✓ (verde) ou ✗ (vermelho). Mostra de relance qual condição impede de ligar.'
  ]},
  {v:'1.10.103',d:'28/10/2026',i:[
    'VERSÃO: volta o CONTADOR DE ENTREGA crescente no último número (1.10.103 = 103ª entrega; 1.10.0, 1.10.1 e 1.10.2 foram as entregas 100, 101 e 102). O número do MEIO indica o grupo de funções (1.9 = ensaio manual, registro e alertas; 1.10 = Patamar Guiado e catálogo de geradores). Mapa completo em claude/MAPA_VERSOES_FUNCOES_v0.1.md.',
    'NOVO: botão "Carregar gerador padrão" em Dados do ensaio — volta ao gerador padrão do Demo (série, equipamentos, 60 Hz, 220 V, 100 kW) e esquece o modelo do catálogo. É o único preenchimento completo para rodar as simulações originais; o Patamar Guiado só precisa das cargas.',
    'Patamar Guiado: o botão e o chip passaram para o card BANCO DE CARGAS. O chip agora é "Patamar: On / Off" (On/Off = convenção do projeto para chips de estado: curto e usual na indústria). Corrigido: o chip "Guiado: desligado" aparecia no cabeçalho mesmo escondido (o atributo hidden perdia para o CSS; agora [hidden] sempre esconde).',
    'Diálogo do Patamar Guiado: mais largo (cabe o texto sem barra horizontal) e com controle de TAMANHO: botões A− / A+ (zoom do conteúdo) e uma linha que mostra largura, altura, posição e zoom, com botão "Copiar medidas" para informar na revisão.',
    'Cabeçalho: os chips "Node-RED confirma…", "Preenchimento ✓ conferido…" e "SIMULADOR LOCAL" saíram da barra e foram para o ícone ⓘ. Na barra fica só um indicador discreto (ⓘ ✓ = tudo certo; ⓘ ✗ = há problema; ⓘ SIM = simulador local). Clique no ⓘ para ver o detalhe (e reenviar o preenchimento, quando for o caso).',
    'REGRA DO PROJETO — LAYOUT ESTÁVEL: indicador visual (tracejado, sombra, realce) NUNCA muda a altura/largura de nada. Só vale: outline-offset negativo, box-shadow inset ou pseudo-elemento absoluto; nunca border/padding/margin novos nem outline externo. O tracejado das chaves sugeridas foi refeito assim (antes aumentava a altura do card).',
    'Mapa dos FBs v0.5: na visão EXPLODIDO voltam as linhas de quem conversa com quem; as caixas ficaram menores (3 entradas e 2 saídas ao vivo; o restante no painel de detalhe). O mapa abre num painel DENTRO da página (antes era uma janela separada que ia para trás ao clicar em SALVAR e parecia ter fechado).',
    'Nomes dos cards: "Cargas · banco de carga" virou "Banco de Cargas" e "Etapas do ensaio · PADRÃO" virou "Etapas do Ensaio".',
    'PARAR ENSAIO: a tela é restabelecida PRIMEIRO (cronômetro, Patamar Guiado, gráfico, chaves/tracejado) e só depois o PLC é limpo em segundo plano, com limite de 10 s e mensagem. Antes, se o PLC demorasse, o diálogo ficava congelado até dar F5.',
    '"Mensagens e falhas" virou "Alertas e Falhas" ("Mensagem" fica para as orientações ao operador). Tipo: Falha (algo não funciona) ou Alerta (aviso, nada quebrou). Regra do CÓDIGO revista: T-AAA-NNN (T = F de Falha ou A de Alerta; AAA = família; NNN = número que nunca se reutiliza). Ex.: F-COM-001, A-CHV-002. Documento: claude/PADRAO_OCORRENCIAS_ALERTAS_FALHAS_v1.1.md.',
    'NOVO: "Histórico (Buffer) de Alertas e Falhas": registro circular dos últimos 500 eventos (ativou / normalizou) guardado no localStorage do navegador — sobrevive a recarregar a página. Abre pelo botão "Histórico" da janela Alertas e Falhas; filtra por card e tipo; exporta e limpa.',
    'EXPORTAR: botão único "Exportar ▾" com TXT / Markdown / PDF onde faz sentido — Alertas e Falhas, Histórico, Log das chaves, Grandezas do DSE e Motor. No gráfico ficam só PNG e CSV (TXT/MD não fazem sentido para imagem). JSON não faz parte do Exportar (fica separado onde for necessário).',
    'FINALIZAR passa a seguir a mesma condição do SALVAR: com salvamento AUTOMÁTICO, quando a última etapa é cumprida e todas estão gravadas e conferidas no PLC, o ensaio é finalizado sozinho (o botão continua disponível se alguma etapa não foi gravada). Com salvamento manual, continua clicando em FINALIZAR. INTERPRETAÇÃO — a confirmar com o operador.'
  ]},
  {v:'1.10.2',d:'28/10/2026',i:[
    'CORREÇÃO: com o Patamar Guiado ligado, o SIMULADOR (Operador = Auto) escolhia as próprias chaves e atropelava a sugestão (ligava outras chaves, com o mesmo total). Agora o Patamar Guiado é quem comanda as chaves (os cliques dele passam mesmo com Operador = Auto); o simulador só faz a carga seguir as chaves ligadas.',
    'CORREÇÃO: o DSE simulado lia kW com base fixa de 91 kW (ex.: 57 kW ligados apareciam como 27,5 kW medidos). Agora a leitura usa a potência do gerador escolhido (SIDSE).',
    'CORREÇÃO: ao PARAR o ensaio (ou terminar) o tracejado/sombra de seleção sai das chaves sozinho.',
    'Nome: "Manual guiado" passa a se chamar PATAMAR GUIADO (acabar com a confusão com o modo de ensaio "Guiado"). O "Ligar Patamar Guiado" fica SÓ dentro do diálogo; no cabeçalho o chip só mostra o estado e não clica.',
    'Patamar: o seletor virou botões de marcar (✓) só com as %, nasce SEM nenhum marcado (antes nascia em 100 %). Clicar de novo no marcado desmarca. Sugerir/Aplicar pedem a escolha do patamar.'
  ]},
  {v:'1.10.1',d:'28/10/2026',i:[
    'CORREÇÃO (a pedido do operador): o GUIADO AUTOMÁTICO volta a NASCER DESLIGADO em toda abertura de página (não guarda mais "ligado"). Ao abrir, nada é sugerido, comandado ou avisado; o INICIAR se comporta como antes do guiado.',
    'O liga/desliga do guiado automático fica DENTRO do diálogo Manual guiado (seção 5). No cabeçalho o chip só aparece enquanto o guiado automático está ligado (clique nele para desligar).',
    'O guiado automático só liga com OPERADOR = Auto (card Simulação) e SALVAMENTO = manual (cabeçalho). Se um dos dois mudar com ele ligado, ele desliga sozinho e avisa. O Manual guiado de sempre (Sugerir chaves + Confirmar e aplicar) não mudou.',
    'Ao ligar o guiado automático, o tracejado e a seleção do uso manual são limpos (sobravam chaves tracejadas/verdes do teste manual misturadas com a sugestão automática).'
  ]},
  {v:'1.10.0',d:'28/10/2026',i:[
    'MANUAL GUIADO nasce com o SIDSE (Simulador Ideal DSE: valores teóricos). Sem DSE real ativo ele NUNCA gera "DSE sem resposta" nem abre as chaves por isso. No diálogo do Manual guiado há a opção "DSE real", que só habilita com o DSE conectado e fora do Demo; escolhida, a proteção de DSE volta a valer.',
    'INICIAR não reabre "Dados do ensaio" quando os dados já foram confirmados nesta sessão do navegador: inicia direto. Para alterar, use o botão Dados do ensaio.',
    'CORREÇÃO (botões travados): PARAR ENSAIO ficava apagado depois de INICIAR quando o gerador estava sem leitura (—), e no Demo o INICIAR ficava apagado se o gerador simulado já estivesse operando. Agora os botões são recalculados a cada atualização da tela.',
    'Seleção do gerador (Dados do ensaio): depois de escolher, a ficha do gerador sobe para o topo e a busca/lista some (botão "Trocar gerador" traz de volta). O gerador escolhido é lembrado ao recarregar a página.',
    'Potência a 100 % passa a vir da TABELA DE POTÊNCIA 60 Hz da empresa quando o kVA está na tabela (260 kVA = 189,1 kW); fora da tabela ou fora de 60 Hz usa o kW do catálogo (.dse). A ficha mostra a origem e avisa quando o .dse diverge da tabela.'
  ]},
  {v:'1.9.99',d:'28/10/2026',i:[
    'CORREÇÃO: ao escolher o modelo do gerador (catálogo) em Dados do ensaio, a Potência (kW) agora é SEMPRE trocada pelo kW a 100 % do modelo (ex.: 260 kVA / 220 V = 189 kW). Antes só preenchia se estivesse vazia e ficava com o valor do gerador anterior.',
    'NOVO: ao lado do botão Guiado aparece a ficha do gerador escolhido (kVA · V · Hz · 100 % = kW) e, no fim de cada etapa, a próxima etapa com o kW sugerido ("SALVAR aplica").'
  ]},
  {v:'1.9.98',d:'28/10/2026',i:[
    'CORREÇÃO (Demo): o gerador simulado agora tem a potência do gerador ESCOLHIDO. Antes a base era fixa em 91 kW: com 100 kW ligados o % de carga lido ia a 110 % e não batia com as etapas (30/50/100/107 %). Agora 100 kW num gerador de 100 kW = 100 %.',
    'CORREÇÃO: o Guiado agora vem LIGADO por padrão. Antes, a chave "Guiado" vinha desligada e, ao clicar INICIAR, nada era sugerido nem aplicado (parecia que a simulação não funcionava). Fluxo: escolher o gerador → INICIAR (aquecimento conta) → no fim do aquecimento o tracejado mostra as chaves do 30 % → SALVAR aplica → e assim até o fim. Para usar o ensaio sem o Guiado, desligue a chave no topo.',
    'Guiado: a escolha ligado/desligado passou a ser guardada com outro nome (guiadoOn), porque o valor antigo "desligado" ficou gravado em quem nunca mexeu na chave.',
    'Aviso na barra do topo: se o ensaio estiver iniciado com o Guiado desligado, o botão pisca em "Guiado: DESLIGADO — nada será sugerido".'
  ]},
  {v:'1.9.97',d:'28/10/2026',i:[
    'O gráfico do ensaio (v0.3) e o mapa dos FBs (v0.4) agora vêm EMBUTIDOS neste HTML: no celular (ou em qualquer lugar) basta ter este arquivo. Os botões "Analisar" e "Mapa dos FBs" abrem as janelas sem precisar dos outros arquivos nem de servidor. Os arquivos separados continuam válidos quando houver servidor.',
    'O mapa dos FBs recebe os dados direto do medidor (postMessage), como o gráfico.'
  ]},
  {v:'1.9.96',d:'28/10/2026',i:[
    'Guiado com salvamento MANUAL: quando a etapa é cumprida e o sistema espera o SALVAR, o Guiado já mostra (tracejado nas chaves do card Cargas) as chaves que entram na PRÓXIMA etapa, com a mensagem "próxima etapa 2 (30 %) → 56 kW · SALVAR aplica". Ao clicar SALVAR, ele aceita essas mesmas chaves e as aplica, e assim até o fim do ensaio. Os FBs virtuais, o mapa e o gráfico acompanham (marca "FBs: PREVIA …").'
  ]},
  {v:'1.9.95',d:'28/10/2026',i:[
    'Manual guiado agora usa o kW do MODELO escolhido em Dados do ensaio (kW_xml); só sem modelo vale a Potência digitada. Se as duas diferirem, aparece um aviso no passo 1.',
    'Gráfico próprio v0.3: no celular o desenho aparece logo abaixo da leitura (antes ficava depois de todos os botões e parecia que não havia gráfico).'
  ]},
  {v:'1.9.94',d:'28/10/2026',i:[
    'Guiado: se o kW a 100 % (ou limite/degrau) mudar com o ensaio em andamento, as chaves agora são RECALCULADAS e reaplicadas. Antes ficavam as chaves da conta antiga (ex.: 27 kW ligados com sugestão de 30 kW tracejada).',
    'Guiado: no patamar, se as chaves ligadas ficarem diferentes do sugerido, o botão Guiado mostra "chaves ≠ sugerido" e o mapa dos FBs marca o filho 6 (só avisa; não reaplica sozinho, pois pode ser ajuste manual).'
  ]},
  {v:'1.9.93',d:'28/10/2026',i:[
    'Guiado: quando nenhuma combinação de chaves cabe abaixo do alvo (gerador pequeno: menor chave maior que o alvo), a mensagem diz isso e mostra a menor chave habilitada, em vez de "sem chaves habilitadas".',
    'Nova ferramenta ferramentas/teste_guiado_modelos_v0.1.js: testa o Guiado nas 6 etapas para todos os modelos do catálogo (Demo) e gera relatório.'
  ]},
  {v:'1.9.92',d:'28/10/2026',i:[
    'Gráfico (página própria v0.2): marcas do Guiado não aparecem mais duplicadas (a mesma mensagem chegava por 2 caminhos).',
    'Marcas do Guiado no gráfico só nos momentos que importam: "Guiado: 50 % → 94 kW" (comando), "FBs: NO_PATAMAR · confirmado …", etapa sem carga, falha e fim. Saíram as marcas de passagem (aguardando, sugerindo, escalonando, confirmando).'
  ]},
  {v:'1.9.91',d:'28/10/2026',i:[
    'Manual guiado virou uma CHAVE na tela principal (botão "Guiado: LIGADO/DESLIGADO" ao lado de "Manual guiado"). Ligado: ao INICIAR, a cada etapa o sistema sugere, desenha o TRACEJADO nas chaves do card Cargas e comanda as chaves (PLC do Demo), enquanto o gerador simulado faz as contas. Você confere, SALVA a etapa e segue. Não depende do modo Manual/Automático do salvamento. A escolha fica guardada e religa sozinha depois de ZERAR.',
    'O tracejado agora aparece na tela principal mesmo com o diálogo do Manual guiado fechado.',
    'FBs virtuais v0.2: cada filho publica ENTRADAS e SAÍDAS com valores ao vivo (kW alvo, limite, degrau, divergência cmd × conf…). O mapa dos FBs (v0.3) ganhou a visão Macro e a visão Explodida.'
  ]},
  {v:'1.9.90',d:'28/10/2026',i:[
    'Manual guiado: passo "5 · Rodar ensaio" com FB mãe + FBs filhos VIRTUAIS em JavaScript (módulo fbs_virtuais_v0.1.js). Com o ensaio INICIADO, a cada etapa a mãe sugere (filho 4), confere a guarda (11), escalona (10) e comanda (6) pelo mesmo caminho do operador, e confirma o retorno físico. Não salva nem avança etapa: isso continua sendo do operador.',
    'Botão "Mapa dos FBs" abre mapa_fbs_v0.2.html, que mostra AO VIVO o estado da mãe e de cada filho. Cada mudança de estado vira marca no gráfico.',
    'Gerador virtual ideal = o gerador simulado do Demo (kW a 100 % dos Dados do ensaio). Sem DSE real, o filho 8 não vigia o DSE.'
  ]},
  {v:'1.9.89',d:'28/10/2026',i:[
    'Revisão de cores: barra superior azul-escura com filete laranja (era preta); seleção/destaque em laranja (saiu o azul vivo); fundos em cinza-azulado neutro. Verde/vermelho/amarelo continuam só para sinal (ligado, falha, alerta). Tokens em um lugar só (:root).',
    'Botão "Tabela de potência" no Manual guiado: janela de consulta (arrastável) com 30/50/100/107 % por gerador do catálogo (60 Hz), linha do gerador atual destacada.',
    'Degrau máx. por cálculo teórico: campo vazio = 30 % de kW a 100 % (ASSUMIDO — a engenharia confirma); valor digitado vence.'
  ]},
  {v:'1.9.88',d:'28/10/2026',i:[
    'Manual guiado ENXUTO: saiu a lista de chaves do diálogo (ela já existe no card Cargas, sem redundância). A sugestão continua desenhada tracejada nas chaves do card Cargas e o diálogo mostra só um resumo por banco. Janela bem menor, pronta para ser arrastada para cima do card do Gráfico. Sai também o "Ajustar à mão": quem escolhe as chaves é o rodízio.',
    'Manual guiado: o "Seguir a etapa do ensaio" deixou de ser opção — com o ensaio INICIADO o patamar acompanha a etapa automaticamente (seletor travado); com o ensaio parado o patamar é escolhido à mão.',
    'Manual guiado: "Se o DSE cair, abrir chaves" deixou de ser opção — é OBRIGATÓRIO para qualquer controlador (fora do modo Demo, onde o DSE é simulado). Saiu também o seletor "Variante".',
    'Manual guiado: excesso no 107 % passou para 2,5 pontos (107 + 2,5 = 109,5 %, abaixo do limite de segurança de 110 %). A "Pausa entre degraus" (5 s) só vale com o ensaio PARADO; com o ensaio iniciado os degraus entram sem pausa.',
    'Cores: criados os TOKENS de cor da interface (--ui-*): laranja de destaque (seleção, ação principal, sugestão) sobre o azul-escuro já usado nas barras de título. Verde, vermelho e amarelo ficam reservados a SINALIZAÇÃO (ligado, falha, alerta). A barra verde das janelas soltas virou azul com filete laranja. Aplicado no Manual guiado, barras de título e sugestão no card Cargas; o resto da tela migra na revisão final.',
  ]},
  {v:'1.9.87',d:'27/10/2026',i:[
    'Manual guiado: o modelo do gerador agora é escolhido SÓ em "Dados do ensaio". No Manual guiado aparece apenas o modelo/kW já definidos lá, com o botão "Abrir Dados do ensaio" (sem catálogo duplicado). O kW a 100 % vem da Potência (kW) dos Dados do ensaio.',
    'Manual guiado: o seletor de Patamar não oferece mais 0 % (sem carga) — o roteiro só pede carga; o retorno sem carga é feito com "Abrir TODAS as chaves". Patamar e "Seguir a etapa" ficam na mesma linha (sobra espaço).',
    'Manual guiado: o botão "Abrir TODAS as chaves (zerar a carga)" subiu para a barra verde do título (ao lado do ✕), com a mesma cor de perigo do resto da tela; a caixa vermelha foi removida.',
    'Manual guiado: marcar/desmarcar chave não redesenha mais a lista (sem piscar). A chave marcada mostra ✓ e muda de cor com transição suave; o clique dá um leve "apertar".',
  ]},
  {v:'1.9.86',d:'27/10/2026',i:[
    'CORRIGIDO: a falha CHV-005 (banco bloqueado pelo PLC) não normalizava depois de virar a seletora para Auto e clicar em "Ligar banco" (por isso "Limpar normalizadas" não limpava nada). Agora ela normaliza sozinha quando o banco fica liberado (seletora em Auto E banco ligado).',
    'MELHORADO: enquanto o banco continua bloqueado, o texto da CHV-005 acompanha o motivo ATUAL (seletora em Manual, sem comunicação ou, quando só falta ligar, "acione Ligar banco"), em vez de ficar com o motivo do momento em que a falha nasceu.',
  ]},
  {v:'1.9.85',d:'27/10/2026',i:[
    'CORRIGIDO (log): a transição da seletora quando o PLC está sem comunicação com o ET200 era gravada como "Manual (local)"; agora aparece "sem comunicação ET200", igual ao chip da tela. Só muda o texto do log.',
  ]},
  {v:'1.9.84',d:'27/10/2026',i:[
    'CORRIGIDO: o botão ✕ de fechar volta para o canto SUPERIOR DIREITO de TODAS as janelas, igual ao resto da aplicação (a v1.9.83 tinha movido para a esquerda por engano de pedido). Nenhuma outra mudança.',
  ]},
  {v:'1.9.83',d:'27/10/2026',i:[
    'Padrão de TODAS as janelas: o botão ✕ de fechar fica sempre no canto SUPERIOR ESQUERDO da barra do título (antes ficava à direita).',
    '"Dados do ensaio" maior e SEM barra de rolagem: o seletor do modelo DSE foi para a coluna da direita (embaixo dos dados do equipamento), com visual novo (cartão, lista com etiquetas kVA/V/Hz e ficha do que foi preenchido).',
    'Manual guiado maior e em 2 colunas: à esquerda 1 Gerador · 2 Patamar · 3 Sugerir; à direita 4 Ajustar à mão · 5 Aplicar. Dica de uso: sem INICIAR escolha o patamar à mão (valida a sugestão); com o ensaio iniciado e "Seguir a etapa" marcado o patamar acompanha a etapa — você ainda clica em Sugerir e Aplicar a cada etapa.',
    'Nenhuma rota, DB ou endereço novo.',
  ]},
  {v:'1.9.82',d:'27/10/2026',i:[
    'Manual guiado reorganizado na ORDEM DE USO: 1 Gerador (modelo do catálogo / kW a 100 %) → 2 Patamar → 3 Sugerir chaves → 4 Ajustar à mão (opcional) → 5 Confirmar e aplicar. Parâmetros raros (limite de segurança, excesso do 107 %, degrau, pausa, proteção do DSE, variante) foram para "Ajustes avançados".',
    'Catálogo de modelos DSE (.csv): agora com BUSCA DIGITADA (vários termos, ex.: "40 kva 220 mwm") e lista clicável. O catálogo fica guardado no navegador (carregue o .csv de novo só quando houver modelo novo). Mesmo seletor no Manual guiado e em "Dados do ensaio".',
    '"Abrir todas" agora se chama "Abrir TODAS as chaves (zerar a carga)" e fica separado, em área de emergência: abre TODAS as chaves que estão comandadas (equivale a clicar em cada chave ligada). É o mesmo ato que a proteção "DSE caiu" faz sozinha.',
    'Rodízio SAIU do diálogo do Manual guiado: continua calculando sozinho (critério fixo: acionamentos + horas). O operador só informa a troca no novo botão "🔧 Troca de resistência" do card Cargas · banco de carga, que zera o desgaste da(s) chave(s) trocada(s).',
    'Dados do ensaio: novo bloco "Modelo do DSE (catálogo)" — escolher o modelo preenche Frequência, Tensão e Controlador (Fabricante/Modelo); a Potência (kW) só é preenchida se estiver vazia, e o kW do arquivo .dse aparece como DICA (a regra "kW do .dse = 100 %" ainda é a confirmar). Nada é comandado.',
    'Nenhuma rota, DB ou endereço novo. Contadores do rodízio e catálogo ficam no navegador de CADA PC.',
  ]},
  {v:'1.9.81',d:'27/10/2026',i:[
    'NOVO — botão "🧭 Manual guiado" (barra do modo do ensaio): assistente que SUGERE quais chaves ligar em cada patamar (sem carga → 30 → 50 → 100 → 107 → sem carga, tomados das ETAPAS do ensaio). Menor erro primeiro, nunca acima do alvo (107 %: atinge o mínimo com excesso limitado), só chaves habilitadas e liberadas, BC56 + BC400 combináveis.',
    'RODÍZIO macio das chaves de mesmo kW (por acionamentos e/ou horas; só desempata, não aumenta o erro). Contadores guardados no navegador; botão "trocada" zera a chave.',
    'O operador pode TROCAR a seleção sugerida. Carga abaixo do alvo é livre; acima do LIMITE DE SEGURANÇA (kW a 100 % × percentual) é BLOQUEADO com mensagem. Sem a capacidade do gerador informada, bloqueia (falha segura). Percentual provisório: 110 % (a engenharia confirma).',
    'ENTRADA ESCALONADA: degrau máximo (kW) e pausa (s) entre grupos de chaves para geradores que disparam com degrau a seco; vazio = tudo de uma vez. Cada chave mostra 3 estados separados: pedida → saída ativa → confirmada.',
    'Variante COM DSE: se a telemetria do DSE cair, as chaves são abertas (decisão do operador, 27/10). Variante SEM DSE: gerador virtual ideal (usa só o modelo). Catálogo de modelos: carregue o catalogo_modelos_v0.1.csv.',
    'Os comandos usam o MESMO caminho do clique na chave do card Cargas (mesmas travas: banco ligado/seletora, habilitada, ensaio, PLC). Nenhuma rota, DB ou endereço novo. O guiado NÃO pausa o cronômetro do ensaio (a desenvolver). Marcos "Guiado: …" aparecem no gráfico (página 📈 Analisar).',
    'CORRIGIDO — ordem física das chaves do BC56 (tabela do operador, 27/10): 5,5,5,5,5,4,4,4,4,4,4,4,3 kW (antes 3,4,…,5). BC400 não muda. ATENÇÃO: os DB150 (setup.nominal[]) e o FC4 do ET200 precisam seguir a MESMA ordem. Setup (kW real) e Habilitar/Desabilitar salvos no navegador foram descartados UMA vez; refaça-os.'
  ]},
  {v:'1.9.80',d:'27/10/2026',i:[
    'NOVO — botão "📈 Analisar" no card do gráfico abre a página grafico_ensaio_v0.1.html (janela própria, para arrastar à segunda tela e acompanhar o ensaio ao vivo, com zoom, desvio, tolerâncias e medição A/B).',
    'O medidor passa a ENVIAR à página os pontos que já registra (carga, tensão, frequência, kW), o estado do cronômetro e os parâmetros (TOL, TENS_TOL, FREQ_TOL, nominais de "Dados do ensaio"). Só envia enquanto a página estiver aberta e "ouvindo" (batimento a cada 3 s).',
    'SOMENTE LEITURA: não comanda chave, não escreve no PLC e não altera aprovação do ensaio. Se a página fechar, o medidor para de enviar sozinho.'
  ]},
  {v:'1.9.78',d:'25/10/2026',i:[
    'NOVO — Setup POR CHAVEAMENTO do banco (220 / 380 / 440 V): a resistência das chaves é a mesma nas 3 tensões, então o kW real de cada chave muda com a tensão (P = V²/R). O popup Setup ganhou o seletor "Chaveamento do banco"; o chaveamento é INFORMADO por aqui (HTML → Node-RED → PLC) e o Setup de cada chave é guardado separado por tensão. Exige flow chaves v2.5 (nova rota POST /api/chaves/{56|400}/tensao) + FB100 v0.3 + DB152 (BC56) / DB160 (BC400) v0.2 no PLC. Com o flow v2.4 o seletor fica inativo e tudo funciona como antes. No Demo local o Setup por chaveamento fica guardado no navegador.',
    'Sem chaveamento informado não dá para selecionar chave nem salvar Setup (o PLC recusa também). A tabela do Setup ganhou a comparação por chaveamento: kW real, R medido e desvio de R entre tensões (a resistência deveria ser igual nas 3).',
    'REMOVIDO o "R teórico" (V medida² ÷ kW de placa): a fórmula misturava a tensão ao vivo com a potência de placa, cuja tensão de referência é DESCONHECIDA (a identificação 3/4/5 kW etc. é só um rótulo). No lugar: "V ref. estimada" = V medida × √(kW de placa ÷ kW real), por chave e por chaveamento — se as estimativas baterem entre as chaves, essa é a tensão de referência da placa. Descoberta na prática com o Setup (decisão do operador em 25/10/2026).',
    'Com o popup Setup aberto a tela principal fica BLOQUEADA (cortina escura; clique nela só avisa) — como era no início. Só o Setup e o que já estava aberto continuam acessíveis. O popup Setup ficou maior (até 98 % da tela) com blocos de leitura, quadrados de chave e tabela em tamanho maior. O visual completo do Setup será refeito em outra versão, a pedido do operador.',
    'ASSUMIDO (a confirmar): com o chaveamento "não informado" o PLC mostra TODAS as chaves sem Setup (usa kW de placa em "Usar kW real"), para nunca aplicar kW real de outra tensão; "Limpar kW reais" apaga só o chaveamento ativo.'
  ]},
  {v:'1.9.77',d:'24/10/2026',i:[
    'NOVO — seletora Local/Remoto e "Ligar banco" de VERDADE fora do Demo local (exige flow chaves v2.4 + FB101 v0.4 + DB150/DB158 v0.2 + DB38/DB39 v0.2 no ET200): o chip mostra a posição da seletora física lida do ET200 (Auto/Manual ou "sem comunicação ET200") e o botão envia POST /api/chaves/{banco}/banco. Com flow antigo (v2.3) a regra continua INATIVA, como antes.',
    'Regra do PLC (FB101 v0.4): seletora fora de Auto ou comunicação 1515-ET200 perdida DESLIGA o banco e abre as chaves dele; nada religa sozinho quando a comunicação volta — o operador aciona "Ligar banco" de novo. "Desligar banco" é sempre permitido.',
    'Relatório e "Resultado do ensaio": novas condições de aprovação — Frequência (desvio máximo acima e abaixo do nominal, padrão 5 %) e Potência em Stand-by (etapa acima de 100 %: carga aplicada mínima, padrão 107 %). As duas tolerâncias entram em Faixas, ao lado do desvio de tensão. Valores conforme o print do relatório de 24/10; origem a confirmar com a engenharia da fábrica (ver CRITERIOS_APROVACAO_ENSAIO_vs_ISO8528_v0.1.md).',
    'A frequência é medida pela tag "frequencia" do DSE nas leituras desta tela (média da janela final de cada etapa salva). O DB53 não guarda frequência: se a página for recarregada no meio do ensaio, as condições de frequência ficam "a definir".',
    'Mensagens e falhas: COM-005 (PLC sem comunicação com o ET200, lida de sbBanco.comEt200Ok — código que estava reservado) e CHV-005 (banco bloqueado pelo PLC: seletora saiu de Auto ou comunicação caiu com o banco liberado).',
    'Robustez: logo depois de "Ligar/Desligar banco" a leitura periódica do PLC é ignorada por 1,5 s (a leitura pode ser anterior ao comando); "Desligar banco" é enviado mesmo sem leitura recente do PLC (segurança). No Node-RED v2.4, "Desligar banco" e o vigia furam a fila de gravações.',
    'Botão 📋 do popup Demo abre gerenciador_logs_v1.2.html (nome novo do arquivo).',
    'Chip do PLC e popup "Cards x flow" passam a esperar o flow chaves-v2.4.'
  ]},
  {v:'1.9.76',d:'24/10/2026',i:[
    'NOVO — ensaio em andamento TRAVA a montagem da carga: o botão Setup (kW real por chave), a seletora Auto/Manual e o "Ligar banco" do card Cargas ficam bloqueados (cinza, com o motivo no tooltip) enquanto o ensaio estiver rodando. O "Desligar banco" continua liberado (é o caminho seguro para tirar carga). Decisão B adotada por padrão — se preferir travar também o Desligar, é só avisar.',
    'NOVO — com o popup Setup ABERTO o botão INICIAR fica bloqueado (e o clique explica o motivo): evita começar o ensaio no meio de uma calibração de chave. Decisão A adotada: "popup aberto".',
    'MUDOU no Demo local: o card Cargas agora NASCE em Auto e com o banco LIGADO (antes nascia em Manual na v1.9.75). A regra de Manual/desligado continua valendo — é só clicar no chip para voltar a Manual e testar o bloqueio. Real e Demo+PLC não mudaram (sem sinal, regra inativa).',
    'NOVO — Operador secreto (popup Demo › "▶ Iniciar o Operador secreto"): robô de teste (o "cliente oculto") que percorre sozinho o card Cargas (seletora Auto/Manual, "Ligar banco", chaves), o popup ⚙ Chaves, o Setup e UM ENSAIO COMPLETO (INICIAR → Dados do ensaio → 6 etapas com Salvar → FINALIZAR → Gravar sem relatório), apertando os mesmos botões do operador e conferindo, depois de cada ação, o que a tela responde (✔ ok · ✖ falha · ⚠ aviso). Roda em Demo local (100% navegador/localStorage) e em Demo + PLC (pede confirmação, porque aciona chaves e regrava o DB53 de verdade); NUNCA roda no modo REAL. Barra flutuante com "Parar" (ou tecla Esc); ao terminar ou ser interrompido devolve a tela ao estado de antes (chaves soltas, seletoras, Setup fechado, simulação/velocidade/gerador, ⚙ Chaves e "Dados do ensaio" originais). Cada conferência vai para o Log de desenvolvimento (card DEV.OPS, tipo "teste") e aparece no gerenciador de logs v1.2; "Copiar relatório" gera o resumo em Markdown.',
    'CORRIGIDO (achado do Operador secreto): com o popup Setup ABERTO e nenhuma chave selecionada, mudar a seletora ou o "Ligar banco" do card Cargas bloqueava o banco mas a nota e as chaves cinza do popup só atualizavam muito depois — a tela mostrava o banco ainda liberado. Agora o popup redesenha na hora.',
  ]},
  {v:'1.9.75',d:'24/10/2026',i:[
    'NOVO no Demo local (não muda nada fora dele): a seletora Auto/Manual de cada banco agora nasce em MANUAL (bloqueada), igual à seletora física de verdade — antes nascia "sem sinal" e as chaves ficavam liberadas direto, o que não testava o intertravamento. Agora é preciso clicar no chip pra virar Auto e depois em "Ligar banco" antes de operar as chaves do banco, exatamente como vai funcionar quando os sinais cbBC56Manual/Auto, cbBC400Manual/Auto, cbLigarBC56 e cbLigarBC400 existirem no PLC. Fora do Demo local (real e Demo+PLC) nada mudou: o chip continua em "sem sinal" e a regra INATIVA (sinal ainda não existe no PLC/ET200).',
    'O chip da seletora, no Demo local, alterna só entre Manual e Auto (nunca mais passa por "sem sinal") e ganhou cara de botão: borda sólida e "⇄" no texto, pra ficar claro que é clicável — antes a borda tracejada de "sem sinal" escondia que dava pra clicar.',
    'A Simulação em AUTO (operador simulado) libera os DOIS bancos sozinha (seletora Auto + "Ligar banco") ao ser ligada no Demo local — senão, com os bancos nascendo bloqueados, o operador simulado não teria nenhuma chave disponível pra montar a carga do ensaio.',
    'CORRIGIDO: o popup Setup (kW real por chave) agora respeita a MESMA regra da seletora/"Ligar banco" do card Cargas — antes ele ignorava e deixava calibrar com o banco em Manual ou desligado. Com o banco bloqueado, a nota do popup mostra o motivo e as chaves ficam marcadas (cinza), e se a seletora ou o "Ligar banco" bloquearem o banco ENQUANTO uma chave dele está selecionada no Setup, a calibração é cancelada na hora (mesma lógica já existente para o STOP do gerador).',
  ]},
  {v:'1.9.74',d:'23/10/2026',i:[
    'CORRIGIDO, a pedido do operador: ordem das chaves do card "Cargas · banco de carga". A chave 1 agora é a de MENOR carga e a última a de maior (antes estava ao contrário). BC56: 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5 kW. BC400: 5, 5, 10, 10, 10, 10, 50, 50, 50, 50, 50, 50, 50 kW. A posição n é o "indice" de /api/chaves/{banco}/ligar e o bit n-1 de cb.ligar[]/sb.ligada[] — os DB150/DB158 (setup.nominal[]) e o FC4 do ET200 precisam seguir a MESMA ordem. Nenhuma rota nova. Os valores de Setup (kW real) e de Habilitar/Desabilitar salvos no navegador foram descartados UMA vez (a ordem mudou e ficariam trocados); refaça-os.',
    'NOVO no card Cargas: cada banco ganhou o chip "Seletora" (Auto = remoto, Manual = local) e o botão "Ligar banco". Regra do operador: com a seletora do banco em Auto e o banco ligado, as chaves respondem; em Manual (local) ou desligado, as chaves ficam apagadas e o clique é bloqueado com aviso. Os sinais cbBC56Manual/Auto e cbBC400Manual/Auto (ET200→PLC) e cbLigarBC56 e cbLigarBC400 (PLC→ET200) ainda NÃO existem no PLC: no Demo local o chip e o botão simulam o comportamento; com PLC real o chip mostra "sem sinal" e as chaves seguem liberadas como antes (nada foi enviado ao PLC).',
    'O card Cargas agora SEMPRE nasce aberto, com as chaves visíveis, inclusive no Demo 100% local (antes nascia recolhido desde a v1.9.29).',
    'Tooltips (balão ao parar o mouse) no card Cargas: legenda, cada chave (banco, posição, kW, estado e motivo do bloqueio), seletora, botão Ligar banco e os três totais.',
    '[DEV.OBS] O log passa a dizer o banco e a posição dentro dele ("clique na chave BC56 #3 de 13", "chaves ligadas: BC56 1,2 · BC400 1") em vez do índice global base 0 (causa de confusão BC56 × BC400 ao ler o log). Novos eventos: seletora e "Ligar banco" de cada banco. O texto dos cliques ganhou espaço entre os pedaços ("Banco de 400 kW 400 kW nominal", antes "…kW400 kW…") e o botão sem id diz de qual popup/card é (ex.: botão "✕" [dlgChHD]).'
  ]},
  {v:'1.9.73',d:'23/10/2026',i:[
    'NOVO (só desenvolvedor, atrás da senha do Demo): observabilidade [DEV.OBS]. A tela passa a registrar, na memória do navegador (até 4000 eventos), o que o teste faz e o que a tela responde: cliques, mudanças de estado (modo, gerador, simulação, ensaio, chaves ligadas/comandadas, chave do Setup, popups, bolinhas de comunicação), mensagens ao operador, ocorrências (OCOR) e chamadas /api/ (todo POST e GET que falhou). Não comanda nada e não escreve no PLC/DB53.',
    'Popup Demo e Servidor [DEV.DEM]: botão "📋 Gerenciador de logs" (abre gerenciador_logs_v1.html, na mesma pasta) e seletor de abertura — Manual (nasce assim, a cada carga da página) ou Automático (abre ao finalizar o ensaio). Caixa "Enviar eventos ao Node-RED" (POST /api/dev/log-evento, flow nodered/dev-logs-api-v1.0.json; no Demo local nada sai do navegador — o gerenciador recebe pelo canal local). Sem o flow no Node-RED o log continua na tela e chega ao gerenciador pelo canal local (mesmo navegador).',
    '🧪 Cards x flow [DEV.CARDS] ganhou a linha "Dev · Logs (observabilidade)" (flow esperado dev-logs-v1.0).',
  ]},
  {v:'1.9.72',d:'23/10/2026',i:[
    'CORREÇÃO (Demo, card Cargas): depois do ensaio finalizado (ou com nenhum ensaio ativo) os quadrados das chaves não ligavam ao clicar quando a Simulação da carga estava em AUTO — o clique era ignorado em silêncio. No real o operador sempre pode ligar/desligar as chaves à mão; agora, sem ensaio ativo, o clique assume o comando: a Simulação passa sozinha para MANUAL e a chave liga (aviso na tela). Com ensaio ativo (rodando ou pausado) em Auto o clique continua não sendo aplicado, mas agora avisa o motivo (antes não dizia nada). Clique com uma chave selecionada no Setup também passa a avisar em vez de ignorar.',
    'Conferido no Setup [bco.SU] nos mesmos estados (sem ensaio, finalizado, finalizado+gravado; Manual e Auto): seleciona a chave e calcula a fórmula normalmente. Com ensaio rodando o Setup segue bloqueado, como no real.',
  ]},
  {v:'1.9.71',d:'23/10/2026',i:[
    'CORREÇÃO (Demo + Setup [bco.SU]): apertar STOP do gerador com uma chave selecionada no Setup não desmarcava a chave — o gerador simulado leva ~10 s desacelerando e, nesse tempo, o painel ainda dizia "OPERANDO", então a desmarcação automática (v1.9.70) só vinha depois. Agora o próprio STOP (e "Desligar gerador (Demo)") desmarca a chave NA HORA, redesenha o quadrado e descarta o "kW sem carga". A desmarcação automática por gerador parado continua valendo como segurança.',
  ]},
  {v:'1.9.70',d:'23/10/2026',i:[
    'CORREÇÃO (Setup [bco.SU]): quando o gerador parava (STOP no painel, Demo ou real) com uma chave selecionada, o texto "desmarcada automaticamente" aparecia mas o quadrado da chave continuava azul "SELECIONADA" e o "kW sem carga" continuava verde com o valor antigo — parecia que a chave estava ligada e a fórmula não calculava. Agora, ao parar o gerador: o quadrado é redesenhado (sem seleção) e o "kW sem carga" volta a "aguardando" até o gerador operar de novo com todas as chaves desligadas. Também vale se o gerador já estava parado e a linha-base era antiga.',
  ]},
  {v:'1.9.69',d:'23/10/2026',i:[
    'CORREÇÃO (Demo, popup Setup [bco.SU]): com uma chave SELECIONADA no Setup, a "Cálculo do kW real" podia ficar congelada em 0,0 kW (e Ia/Ib/Ic = 0) mesmo com o gerador operando. Causa: o simulador de carga apagava as chaves ligadas (mexer no potenciômetro da Simulação, modo Auto, fim de ensaio simulado) enquanto a tela continuava mostrando a chave como selecionada. Agora, enquanto há chave selecionada no Setup, o simulador mantém ligada SÓ essa chave; o potenciômetro e o botão Auto ficam desabilitados com aviso, e voltam ao normal ao desmarcar a chave ou fechar o Setup.',
  ]},
  {v:'1.9.68',d:'23/10/2026',i:[
    'NOVO (só desenvolvedor, atrás da senha do botão Demo): popup "🧪 Cards x flow" — lista os 3 flows do Node-RED de que o HTML depende (chaves BC56, chaves BC400, registro do ensaio) e mostra, pra cada um, o flow que a tela está realmente enxergando agora (campo "flow" da resposta) contra o esperado (chaves-v2.3 / chaves-v2.3 / registro-ensaio-v1.4): "OK", "flow desatualizado" ou "sem leitura ainda". Usa os mesmos códigos de Card que já existem no HTML (bco, reg) — não criei siglas novas.',
    'O registro do ensaio agora também guarda o campo "flow" da resposta de /api/ensaio/modo (antes só as chaves guardavam); é o que alimenta a linha do registro no popup novo.',
  ]},
  {v:'1.9.67',d:'23/10/2026',i:[
    '"Usar o PLC real durante o Demo" só fica marcável quando o PLC JÁ está respondendo de verdade (GET /api/chaves confirmado) — antes bastava estar no Demo. Sem o PLC ativo, o campo some desabilitado e um aviso explica o motivo embaixo dele; o estado é checado por uma sonda própria a cada ~3 s enquanto a tela está em Demo local (fora do Demo local a bolinha PLC já diz isso). Opção de uso só do desenvolvedor, a pedido do operador.',
  ]},
  {v:'1.9.66',d:'23/10/2026',i:[
    'A tela agora NASCE PRONTA PARA O PLC: fora do Demo, as chaves e o registro do ensaio vão sempre ao Node-RED real. Acabaram os vários "⚙ Servidor" (ensaio, Banco de Carga, popups Chaves/Setup, tela principal) e as opções "Automático / Sempre Node-RED / Sempre simulador": existe UM só campo Servidor, dentro do botão Demo (pede a senha). Sem URL salva, vale o mesmo endereço de onde a página foi aberta (http/https); aberto como arquivo (file://) é preciso informar. A URL antiga das chaves (ou do registro) é aproveitada na primeira abertura.',
    'Três modos, deduzidos do que está ligado: REAL (padrão: DSE real + PLC), DEMO LOCAL (DSE simulado, nada vai ao PLC — o PLC não é simulado) e DEMO + PLC (DSE simulado, mas chaves e registro gravam de verdade no PLC; pede confirmação e fica sempre sinalizado em CHV-003). O botão Demo mostra o modo atual (cor e texto). O modo nunca é lembrado entre aberturas.',
    'TRAVA DE SEGURANÇA: com o DSE real conectado (leitura válida) o Demo não liga. E, com o Demo ligado, a tela consulta o endereço do DSE a cada 5 s: se um DSE real responder com leitura válida, o Demo é DESLIGADO sozinho (ocorrência DSE-002) e a tela volta para uma condição segura.',
    'Condição segura a cada troca de modo (inclusive o desligamento automático): janelas fechadas, chave do Setup desmarcada (no PLC também), simulação de falha do motor desarmada, chaves locais desligadas e — se o PLC estava em uso — todos os comandos cbLigar que a tela conhecia são desligados no PLC (ao entrar em modo com PLC, isso é feito logo após a primeira leitura). Com ensaio em andamento a troca manual de modo é bloqueada; no desligamento automático o ensaio simulado é encerrado.',
    'Removido o "FORÇAR SALVAR (teste)" e a opção ② do Demo: como não existe PLC simulado, gravar no PLC exige o PLC ativo, e no Demo + PLC o ensaio simulado grava normalmente. A injeção de falhas do simulador local ficou recolhida dentro do popup Demo.',
  ]},
  {v:'1.9.65',d:'22/10/2026',i:[
    'SEGURANÇA — comando de chave que "sobrava" no PLC: o cbLigar (laranja) ficava TRUE no DB150/DB158 mesmo depois de fechar o navegador, e voltava a aparecer ao abrir a tela em outro computador. Agora o flow do Node-RED v2.3 (chaves-56-api-v2.3.json e chaves-400-api-v2.3.json) tem um VIGIA: se nenhuma tela consultar o flow por 30 s, ele ZERA os cbLigar das 16 chaves daquele banco (escreve, lê de volta e confere). O tempo é ajustável no próprio Node-RED (aba > Propriedades > variável de ambiente WD_HTML_S). Não existe botão de zerar: fechar o navegador já resolve (após o tempo do vigia).',
    'Novas mensagens (triângulo no card Banco de Carga): CHV-003 — "Demo ligado e as chaves apontam para o Node-RED REAL do PLC" (clicar nas chaves comanda o PLC de verdade); CHV-004 — "o Node-RED zerou N chave(s) porque a tela ficou sem consultar" (aparece ao reabrir a tela, por 3 min, se o corte foi nos últimos 10 min).',
    'A atualização do PLC (1x por segundo) agora é disparada por um relógio em segundo plano (Web Worker). Antes, com a aba escondida por mais de 5 min, o Chrome reduzia o relógio da página para ~1 vez por minuto e o vigia achava que a tela tinha sumido. Se o navegador não permitir o Worker, volta ao relógio antigo sozinho.',
    'O chip do PLC avisa quando o flow das chaves é o v2.2 (sem vigia) e pede a v2.3.',
  ]},
  {v:'1.9.64',d:'22/10/2026',i:[
    'NOVO — Mensagens e falhas: botão "Mensagens e falhas" na barra de cima (com o total de ocorrências ativas) e um TRIÂNGULO amarelo com "!" preto no cabeçalho de cada card, que só aparece quando há mensagem ou falha naquele card. Clicar abre a janela "Mensagens e falhas" (arrastável, não bloqueia a tela): do card (já filtrada) ou de todos os cards e da aplicação. Cada ocorrência tem CÓDIGO (AAA-NNN) + TEXTO, fica "Ativa" enquanto a causa existir e passa a "Normalizou" sozinha. Tem Imprimir / PDF.',
    'Ocorrências já ligadas (básico): COM-001 PLC sem leitura (por banco), COM-002 Node-RED das chaves, COM-003 Node-RED do registro do ensaio, DSE-001 leitura do DSE, CHV-001 comando de chave não executado, CHV-002 comando bloqueado (banco sem leitura), ENS-001 dados do ensaio não gravados, ENS-002 etapa não gravada, ENS-003 sem leitura de volta do registro, SIS-001 erro interno da tela. Padrão completo em claude/PADRAO_OCORRENCIAS_MENSAGENS_FALHAS.md.',
    'Bolinhas do card Modo: cinza agora vale para "não conectado" E para "perdeu a conexão" (o texto abaixo da bolinha diz qual). O balão (tooltip) das bolinhas parou de piscar: agora é desenhado por CSS e o texto só muda quando o conteúdo muda (antes era reescrito a cada segundo).',
    'CORREÇÃO do "Salvar dados" / "Failed to fetch": as rotas do registro do ensaio só funcionavam na MESMA origem da página; se o HTML era aberto como arquivo (file://) ou por outro endereço, o navegador falhava antes de chegar ao Node-RED. Agora há o campo "URL do Node-RED do registro do ensaio" em ⚙ Servidor (vazio = usa a URL do ⚙ Servidor do Banco de Carga; vazio nos dois e página como arquivo = mensagem clara em vez de "Failed to fetch").',
    'Rotas do registro do ensaio migradas para o padrão /api/: /ensaio/modo → /api/ensaio/modo, /ensaio/snap… → /api/ensaio/snap… (requer o flow registro-ensaio-db53-api-v1.4.json; apague antes o tab antigo "Selecao do ensaio").',
    'Impressão/PDF: a janela de Logs e a de Mensagens e falhas sugerem o nome do arquivo no padrão nome_DEMO|REAL_AAAAMMDD_HHMMSS (ex.: log_chaves_BC400_REAL_20261022_195311).',
    'Janela "Dados do ensaio" maior: 1240 px em 2 colunas (print do SAP + identificação à esquerda, equipamento à direita), campos maiores e botões Cancelar / Limpar / Repetir / Iniciar ensaio sempre visíveis (rodapé fixo). Corrigido o ícone de imagem quebrada que aparecia na caixa do print antes de colar uma imagem.',
  ]},
  {v:'1.9.63',d:'22/10/2026',i:[
    'CORREÇÃO: Banco de 400 kW agora funciona na tela principal, no Setup e no Habilitar/Desabilitar com o servidor "Node-RED real" (antes só o BC56 chamava o PLC; o BC400 ficava no simulador). Cada banco usa a sua rota /api/chaves/56 ou /api/chaves/400 (DB150 e DB158). Os dois bancos são lidos a cada 1 s, cada um com o seu erro.',
    'Banco sem leitura do PLC aparece apagado com a legenda "sem leitura do PLC" (em vez de mostrar o último estado como se fosse atual). Comando em banco sem leitura é bloqueado na hora com mensagem clara (antes ficava laranja até o tempo esgotar).',
    'Card Modo: 3 bolinhas de comunicação — PLC, Node-RED e HTML. Verde = ativo, amarelo = parcial, cinza = não conectado. Passe o mouse para ver o motivo. A bolinha do PLC mostra que o Node-RED CONSEGUE LER o PLC por S7; o batimento (heartbeat) do programa do PLC entra quando o DB for criado. Fontes menores no card.',
    'Janela de Logs refeita no padrão das outras popups (cabeçalho azul, ✕, não-modal) e ARRASTÁVEL pelo título (duplo clique volta ao centro). Botão Atualizar agora mostra que atualizou (hora, contagem), opção "Atualizar sozinho (3 s)", escolha BC56/BC400, e avisos claros quando o Node-RED está com flow antigo/aba duplicada (comandos enviados mas log vazio).',
    'Requer os flows v2.2 (chaves-56-api-v2.2.json e chaves-400-api-v2.2.json): apague TODAS as abas antigas "Chaves BC56/BC400 (API)" antes de importar. Com flow v2.1 ou anterior as telas funcionam, mas o aviso de flow antigo aparece.',
  ]},
  {v:"1.9.62",d:"22/10/2026",i:["Setup: chave selecionada com destaque forte (azul, aumentada, etiqueta SELECIONADA) mesmo já calibrada; fórmulas (kW real e resistências) visíveis assim que abre o Setup; Setup bloqueado enquanto há ensaio em andamento (Demo também).","Botão Logs corrigido: abre uma janela própria (antes não fazia nada) e lê o log pela URL do Servidor do Banco de Carga (/api/logs/56 e /api/logs/400); resumo com falhas, tempo médio e máximo; Imprimir/PDF."]},
  {v:'1.9.59',d:'21/10/2026',i:[
    'Tela principal com servidor "Node-RED real": cada clique liga/desliga UMA chave do Banco de 56 kW (POST /api/chaves/56/ligar -> cb.ligar[n]), quantas chaves quiser, uma a uma. Substitui o limite de "1 chave por vez" da v1.9.58 (que usava a rota do Setup).',
    'Resposta imediata: a chave pinta de LARANJA (comandada) no instante do clique e reverte sozinha se o PLC recusar; VERDE só com o feedback (sb.ligada). Cliques em chaves diferentes não esperam um ao outro; leitura do PLC a cada 1 s (era 2 s).',
    'PADRÃO DE ROTAS: todas passam a começar com /api/ — /api/chaves/56/... e /api/simulador/dse (exigem os flows v2 do Node-RED: chaves-56-api-v2.json e simulador-dse-demo-v3.json).',
  ]},
  {v:'1.9.58',d:'21/10/2026',i:[
    'Tela principal (card Cargas) com servidor "Node-RED real": clicar numa chave do Banco de 56 kW agora comanda o PLC de verdade (POST /api/chaves/56/selecionar, a mesma rota do Setup). Antes o clique só funcionava no Demo e só mexia na simulação local. Clicar de novo na chave comandada desliga.',
    'A chave comandada aparece com contorno LARANJA; só fica VERDE quando o PLC confirmar pelo feedback (sb.ligada). Só 1 chave por vez (limite da rota/chaveSel).',
  ]},
  {v:'1.9.57',d:'21/10/2026',i:[
    'CORREÇÃO GRAVE (desde a v1.9.53): erro de escopo (CH_SRV não visível fora do módulo das chaves) derrubava o render() a cada ciclo — a tela caía em "servidor/rede fora" e as chaves da tela principal nunca atualizavam, nem em Demo. Corrigido.',
    'Chaves da tela principal agora são atualizadas por um timer próprio (2 s) lendo o PLC da Carga (GET /api/chaves/56), independente de o servidor de telemetria do DSE (/api/gerador) estar no ar.',
  ]},
  {v:'1.9.56',d:'21/10/2026',i:[
    'Botão "Demo" (barra de cima): fundo preto → laranja piscando enquanto o Demo está ligado (pedido do operador, indicador visual claro de que o app está em simulação).',
  ]},
  {v:'1.9.55',d:'21/10/2026',i:[
    'Setup: removida a frase "o PLC mede e grava sozinho (própria leitura do FB100)" — agora mostra o kW real já salvo (ou "aguardando Salvar esta chave").',
    'CORREÇÃO: se o gerador parar (real ou Demo) com uma chave selecionada no Setup, ela é desmarcada automaticamente — antes ficava "presa" e travava os cliques na tela.',
    'Novo botão "⚙ Servidor" na tela principal (card Cargas) — mesmo popup de configuração (CH_SRV) já usado nos popups Chaves e Setup; agora os 3 lugares leem/gravam a mesma fonte.',
  ]},
  {v:'1.9.54',d:'21/10/2026',i:[
    'CORREÇÃO Demo: o potenciômetro virtual (painel Simulação) ficava com o valor antigo depois que o Setup desligava as chaves ao abrir o popup. Agora o slider sempre acompanha as chaves (liga/desliga sincroniza os dois).',
  ]},
  {v:'1.9.53',d:'21/10/2026',i:[
    'CORREÇÃO IMPORTANTE: a tela principal (card Cargas) não refletia o estado real das chaves no PLC — só mostrava a simulação local (Demo) ou nada. Agora, com o modo PLC ativo, o Banco de 56 kW na tela principal usa o mesmo estado real (sb.ligada, lido via GET /api/chaves/56) que já alimentava o Setup e o Habilitar/Desabilitar — as 3 telas agora batem com a chave 1 do PLC de verdade.',
    'GET /api/chaves/56: o campo `ligada[]` do contrato (status real de cada chave) agora é lido e usado (antes era ignorado).',
    'Atualização do PLC passa a rodar também com os popups Setup/Habilitar fechados (antes só rodava com algum popup aberto) — a tela principal agora se mantém sincronizada sozinha, a cada ~2s.',
  ]},
  {v:'1.9.52',d:'21/10/2026',i:[
    'Aviso flutuante (chip vermelho "chave desabilitada" etc.) reposicionado: estava em cima das janelas flutuantes (ex.: Setup), agora fica fixo na base da tela.',
    'Setup real-PLC: botão "Ligar/Desligar gerador (Demo)" agora também avisa o Node-RED (POST /api/simulador/dse {ligado}) quando o modo PLC está ativo, pra forçar valores de teste no DB52 (sem DSE conectado) — depende do fluxo novo "Simulador DSE (Demo)" no Node-RED.',
  ]},
  {v:'1.9.51',d:'21/10/2026',i:[
    'Popup Chaves (Habilitar/Desabilitar): invertida a ordem — kW real (verde) agora aparece ANTES do kW nominal, conforme pedido do operador.',
    'Texto da nota do popup Chaves corrigido: removida referência desatualizada a "DB55 a definir".',
  ]},
  {v:'1.9.50',d:'21/10/2026',i:[
    'Correção, a pedido do operador: ao abrir o popup "🛠 Setup", precisava clicar DUAS vezes na chave pra selecionar. Causa: a chamada de live() no botão Setup acontecia ANTES do .show() do dialog — e live() só recalcula "kW sem carga" (BASE_OK) quando o dialog já está com open=true, então essa 1ª chamada era um no-op. O popup abria com BASE_OK desatualizado e o 1º clique na chave era rejeitado ("Aguardando a medição de kW sem carga"); só o 2º clique funcionava, depois do timer de 500ms rodar live() de novo. Agora live() roda só depois do .show().'
  ]},
  {v:'1.9.49',d:'21/10/2026',i:[
    'Correção, a pedido do operador: "🛠 Setup" agora desseleciona de fato a chave anterior ao abrir o popup — o bug era chAtualizaDoPlc() (atualização do PLC) rodando DEPOIS do reset de SEL e restaurando a seleção antiga; agora roda antes.',
    'Mudança de comportamento, a pedido do operador: "🗑 Limpar Chave" agora limpa TUDO — apaga o Setup salvo E desseleciona a chave (volta pro estado "clique numa chave para calibrar"), em vez de manter a chave selecionada recalculando sozinha (como era desde a v1.9.46/1.9.48).'
  ]},
  {v:'1.9.48',d:'21/10/2026',i:[
    'Setup das cargas: botões "Salvar Chave" e "Limpar Chave" (texto encurtado, sem "esta").',
    'R teórico agora usa V NOMINAL (do campo "Tensão" em Dados do ensaio, com fallback 380V) em vez de V ao vivo — compara a resistência usando tensão de projeto fixa, não a tensão real do momento.',
    'Correção: depois de clicar "Limpar Chave", as fórmulas continuam mostrando os cálculos ao vivo (a chave permanece selecionada para recalibração).'
  ]},
  {v:'1.9.47',d:'21/10/2026',i:[
    'Setup das cargas: adicionadas fórmulas animadas das resistências (R medido e R teórico) junto com a fórmula de kW real. Mostram a conta completa em tempo real: (V²) ÷ (kW real × 1000) para R medido, e (V²) ÷ (kW nominal × 1000) para R teórico.'
  ]},
  {v:'1.9.46',d:'21/10/2026',i:[
    'Card "Setup das cargas" (popup 2): adicionado ícone "i" explicando a fórmula de cálculo (kW real = kW com a chave − kW sem carga, depois resistência = V² ÷ P e resistência teórica = V² ÷ P_nominal).',
    'Fórmula animada: novo display mostrando a conta em tempo real (kW com chave) − (kW sem carga) = (kW real) com os valores atualizando ao vivo enquanto a chave está calibrando. Aparece só quando uma chave está selecionada E a baseline "kW sem carga" (BASE_OK) está pronta.',
    'Novo botão "🗑 Limpar esta chave" — apaga o Setup (kW real, resistência, data) de UMA chave específica, sem afetar as outras ou o resto da tabela. Complemento ao "Limpar kW reais" que apaga TODAS do banco. Botão fica escondido se nenhuma chave estiver selecionada ou não tiver Setup salvo ainda.',
    'Botão "⚙ Servidor" (popup Servidor do Banco de Carga): garantido que o campo de URL fica visível (scroll automático ao abrir a popup).'
  ]},
  {v:'1.9.45',d:'20/10/2026',i:[
    'Popups Chaves (Habilitar/Desabilitar) e Setup: visual mais compacto a pedido do operador — chips de status (Gerador/kW sem carga/PLC) menores e menos chamativos, menos espaço entre blocos (jlin/chcard/legenda), lista de chaves e caixinhas de leitura mais enxutas. Objetivo: caber sem precisar de barra de rolagem na maioria das telas. Só muda esses 2 popups — os chips/espaçamentos usados nos outros popups do app continuam iguais.',
    'IMPORTANTE sobre "PLC fora do ar" mesmo com a URL salva certa: o mais provável agora é bloqueio de CORS do navegador, não erro de endereço. Quando o HTML é aberto direto como arquivo (file:///...) e tenta chamar um Node-RED em outra origem (outra porta/IP), o navegador bloqueia a resposta se o Node-RED não enviar o cabeçalho "Access-Control-Allow-Origin" — e o erro aparece exatamente como "Failed to fetch", igual ao de rede fora do ar. Isso também explicaria o "Dados de ensaio" não gravar no DB (mesmo tipo de chamada, mesmo problema). Correção é do lado do Node-RED (settings.js, "httpNodeCors") — ver explicação enviada ao operador; não é algo que o HTML resolve sozinho.'
  ]},
  {v:'1.9.44',d:'20/10/2026',i:[
    'Popup "Setup" (card 2): layout reorganizado — era tudo empilhado numa coluna só (herdava uma grade de 2 colunas pensada pra quando os cards 1+2 ficavam juntos no popup antigo; com o popup dividido, a 2ª coluna ficava em branco). Agora as chaves pra selecionar ficam à esquerda e as leituras/formulário/resultado à direita, lado a lado. Popup também ficou bem maior (900px → 1360px).',
    'Troca de aba (Banco de 56 ↔ Banco de 400) com uma chave selecionada/ligada pra calibração agora é BLOQUEADA (antes cancelava a calibração em silêncio e trocava). Mostra aviso pedindo pra desligar a chave (clicar nela de novo) antes de trocar de banco.',
    'Campo "URL do Node-RED do PLC" (popup Servidor): Enter agora também salva (antes só salvava ao perder o foco do campo — se o operador digitasse e fechasse o popup sem clicar em outro campo antes, a URL podia não ser salva, e as ações ficavam sem efeito no PLC sem aviso claro disso). A nota do campo agora mostra "Salvo: ..." com o valor atual quando preenchido, pra confirmar visualmente.'
  ]},
  {v:'1.9.43',d:'20/10/2026',i:[
    'CORREÇÃO: "PLC: Node-RED fora do ar ou sem rede (Failed to fetch)" mesmo com o flow "Chaves BC56 (DB150)" online — a causa era o Banco de Carga reaproveitar a MESMA origem/porta do campo "URL" do topo (esse é o Node-RED do DSE). Na prática são 2 servidores Node-RED diferentes. Agora o popup "⚙ Servidor" do Banco de Carga tem um campo próprio "URL do Node-RED do PLC (Chaves/Banco de Carga)", salvo separado (localStorage) — preencha com o endereço real do Node-RED que roda o flow do PLC (não é o mesmo do DSE). Sem essa URL preenchida, o chip mostra "configure a URL em ⚙ Servidor" em vez de tentar (e falhar) contra o endereço errado.',
    'Textos de explicação mais longos dos popups Chaves/Servidor do Banco de Carga foram trocados por um ícone "i" (bolinha, igual ao padrão já usado em "Leitura das grandezas") — passa o mouse ou foca (teclado) para ver o texto completo. Primeira leva: títulos "1 · Habilitar/desabilitar" e "2 · Setup das cargas", e o aviso do Banco de 400 kW no popup Servidor.',
    'NOVO: o popup único "⚙ Chaves" virou DOIS popups independentes — "⚙ Chaves" (só Habilitar/Desabilitar, card 1) e "🛠 Setup" (só calibração/kW real, card 2). Continuam "conversando" normalmente (mesmo estado, mesmas rotas do PLC); cada um pode ser aberto/fechado sem mexer no outro.',
    'NOVO: Chaves, Setup e o Gráfico do ensaio agora são popups "soltos" (borda verde) — não bloqueiam mais a tela principal (dá pra clicar em qualquer coisa atrás) e podem ficar vários abertos ao mesmo tempo. Continuam arrastáveis pela barra de título (recurso que já existia) — duplo clique na barra volta ao centro. Os demais popups do app (Grandezas, Motor, Demo, Parâmetros etc.) continuam como sempre foram (travam a tela de fundo), a pedido do operador.',
    'NOVO: o card "Gráfico do ensaio" ganhou um botão "⤢ Popup" — ao clicar, o card sai da tela principal e vira um popup solto (arrastável); fechando o popup, ele volta pro lugar de origem na tela. Dentro do popup, clicar no próprio gráfico (ou no botão "🔍 Zoom") amplia/reduz o desenho — mesma ideia de clique-para-ampliar já usada no print do SAP em "Dados de ensaio".'
  ]},
  {v:'1.9.42',d:'20/10/2026',i:[
    'CORREÇÃO: popup Demo — ① "Simulação tradicional" e ② "Teste de validação do ensaio" eram exclusivas (marcar uma desmarcava a outra). Isso escondia o botão "Ligar gerador (Demo)" do card Chaves (que depende de ①) toda vez que o operador marcava ②, como reportado. ① e ② agora podem ficar marcadas juntas; ③ continua dependendo de ① (sem sentido ligar a falha do motor sem a simulação rodando).',
    'NOVO: Banco de Carga (card Chaves) ganhou fonte própria, independente de ①/②/③ — botão "⚙ Servidor" dentro do popup Chaves (ao lado das abas, na barra azul), com 2 opções: "Simulador local" (como sempre foi) ou "Node-RED real" (grava de verdade no PLC). Chip de status no card 2 mostra qual está ativa.',
    'CORREÇÃO: "acionei chave mas não chegou comando no PLC" — com "Node-RED real" escolhido (só Banco de 56 kW, que é o único com flow pronto — claude/REGISTRO_FLOW_CHAVES_BC56_DB150.md), as ações do card Chaves agora chamam de verdade as rotas HTTP do flow chaves-56-db150-v1.json: habilitar/desabilitar chave → POST /api/chaves/56/habilitar; clicar numa chave p/ calibrar → POST /api/chaves/56/selecionar; "Salvar esta chave" → POST /api/chaves/56/salvar; "Usar kW real" → POST /api/chaves/56/usarKwReal; "Limpar kW reais" → POST /api/chaves/56/limpar. URL base = mesma origem/porta do campo "URL da API" no topo (confirmado com o operador). A cada ação, o popup confere a resposta (ok:true/erro) e, após Salvar/Limpar, relê o PLC (GET /api/chaves/56) pra atualizar a tabela — nunca mostra sucesso sem confirmação. Se o Node-RED não responder, o erro aparece no texto da ação e no chip de status (nunca falha calada).',
    'No modo "Node-RED real", o cálculo de kW real/resistência (card 2) deixou de usar a conta local (kW medido − kW sem carga) — essa conta é só do simulador. Quem calcula e grava o kW real é o próprio PLC (FB100, com sua própria referência de "kW sem carga"); a tela só mostra o que o GET /api/chaves/56 confirmar de volta. "Salvar esta chave" fica liberado assim que uma chave é selecionada no PLC, sem depender do "BASE_OK" local.',
    'Banco de 400 kW (DB158) continua só no simulador local — não tem flow no Node-RED ainda; aviso disso no popup "⚙ Servidor" e na nota do card 1.',
    'Ao trocar pra "Node-RED real" com o Banco de 56 kW já tendo kW real calibrado no simulador local, pede confirmação antes (esses valores locais serão substituídos pelos lidos do PLC assim que a 1ª leitura chegar).'
  ]},
  {v:'1.9.41',d:'20/10/2026',i:[
    'Popup "Chaves do banco de carga": abas de banco (56/400) movidas pra dentro da barra azul do título, ao lado do "✕" — não sobram mais buracos no layout acima dos 2 cards (era onde as abas ficavam na v1.9.40).',
    'Card 1 ("Habilitar/desabilitar"): trocado de grade de quadrados (tiles) por lista vertical do lado esquerdo, uma linha por chave com o texto "Chave 1", "Chave 2" etc. — libera bem mais espaço horizontal pro card 2 (Setup).',
    'Selo "kW real": fundo verde cheio trocado por verde transparente (translúcido) com texto verde escuro, a pedido do operador; fonte do valor em kW (nominal e real) aumentada e em negrito para ficar mais em destaque. A palavra "real" repetida em cada chave foi removida — agora tem só UMA legenda discreta (quadradinho verde + texto) no topo do popup explicando a cor.',
    'Card "Leitura das grandezas" → popups "Grandezas" e "Motor": novo botão "🖶 Imprimir (PDF)" dentro de CADA popup (um em "Grandezas e parâmetros do DSE", outro em "Motor"), gerando um PDF em várias páginas (pagina automaticamente) com todos os campos mostrados naquela popup — em Grandezas respeita os filtros/checkboxes atuais da tela. O botão "Gerar PDF" que já existia no cabeçalho do card (resumo rápido, 1 página) foi MANTIDO como estava — são complementares; avise se quiser que eu remova o antigo.'
  ]},
  {v:'1.9.40',d:'20/10/2026',i:[
    'Popup "Chaves do banco de carga": reorganizado em abas por banco (56 kW / 400 kW) — cada aba mostra só o banco escolhido nos cards "Habilitar/desabilitar" e "Setup", em vez de empilhar os 2 bancos juntos (era isso que forçava a barra de rolagem). Popup aumentado (1180px → 1340px) e tiles maiores (56px → 68px). "Limpar kW reais" agora limpa só o banco da aba ativa (antes apagava os 2 bancos de uma vez — avise se preferir voltar ao comportamento antigo).',
    'Tabela de resultados do Setup (card 2) agora fica sempre visível, sem precisar expandir nada — mostra só o banco da aba ativa, então cabe inteira sem cortar.',
    'Valor "kW real" de cada chave: era um texto pequeno e apagado embaixo do nominal — agora é um selo verde cheio, bem mais visível.',
    'Novo botão "🖶 Imprimir Setup (PDF)": gera um mini-relatório (A4 paisagem, sem biblioteca, offline) com a tabela de Setup dos 2 bancos (nominal, real, R medido, R teórico, desvio, data) + totais de carga disponível, igual ao PDF de Grandezas já existente. Não grava nada no PLC.',
    'Mensagem de aviso "Chave desabilitada" (clique numa chave desabilitada no card Cargas, Demo): já desaparecia sozinha em 10 s (msgGer, desde antes desta versão) — nenhuma mudança necessária aqui.'
  ]},
  {v:'1.9.39',d:'20/10/2026',i:[
    'Gráfico "Tempo de ensaio": corrigida a rampa diagonal entre degraus (ex.: 0%→30%→50%→100%) relatada pelo operador com 2 prints. CAUSA ENCONTRADA: os pontos de ajuste/estabilização já eram excluídos do traço (filtro p.n, desde a v1.9.34), mas o desenho ligava com uma reta o ÚLTIMO ponto válido do degrau anterior ao PRIMEIRO ponto válido do novo degrau — essa reta cruzando o período excluído é que aparecia como "rampa". CORREÇÃO: o traço "Carga medida" agora nunca liga pontos de etapas diferentes (desenha um traço isolado por etapa); a linha tracejada "Perfil planejado" não foi alterada e continua sendo só a referência/alvo, sem nenhuma ligação com os pontos medidos.',
    'Botão ZERAR (zera só o degrau ativo, v1.9.33): agora pede confirmação (OK/Cancelar) antes de executar, pra evitar clique involuntário — igual já era feito no "ZERAR POR COMPLETO". Sem mudança no que o botão faz, só a confirmação antes.',
    'Card Chaves: array BANCOS ganhou o campo "id" ("56"/"400", nomes definidos pelo operador em 20/10/2026) junto do índice 0/1 que já existia — pendência registrada em claude/CONTRATO_HTTP_HTML_NODERED_CHAVES.md (seção Pendências, item 1). Preparação apenas: o card continua 100% localStorage/Demo, sem nenhuma chamada HTTP nova nesta versão; o id fica pronto para quando a integração com o Node-RED (rotas /chaves/{56|400}/...) for construída.'
  ]},
  {v:'1.9.38',d:'20/10/2026',i:[
    'Novo card "Modo" no topo da coluna 1 (acima de "Etapas do ensaio"): mostra, só leitura, o que está selecionado - Fonte dos dados (REAL ou DEMO), Tipo de ensaio (Livre/Guiado), Salvamento (manual/automático), Node-RED (o que o Node-RED CONFIRMOU) e Gráfico. O botão "Alterar" abre o mesmo popup de Modo de antes (mesmos ids e travas, inclusive a trava com gerador ligado). ASSUMIDO: o botão "Modo" da barra superior foi mantido como atalho para o mesmo popup - pode sair se preferir só o card.',
    'Novo botão "Gerar PDF" no card "Leitura das grandezas": gera na hora um PDF (A4 paisagem, sem biblioteca, offline) com os valores que estão na tela agora (tensões, correntes, potência, carga %, água, rotação, bateria) + data/hora + origem: "DADOS DEMO (SIMULAÇÃO)" ou "DADOS REAIS (Node-RED/DSE)". Se a última leitura está velha ou sem comunicação, o PDF avisa "DADO ANTIGO / SEM COMUNICAÇÃO". Não grava nada no PLC e não altera o relatório do ensaio.'
  ]},
  {v:'1.9.37',d:'19/10/2026',i:[
    'Validado (não houve alteração de código): o cronômetro, ao clicar em ZERAR no meio de uma etapa, já voltava corretamente para a soma do tempo das etapas ANTERIORES já salvas — confirmado por teste automatizado (Playwright): antes do ZERAR o relógio mostrava 04:00 (03:00 de 2 etapas já salvas + 01:00 em andamento na etapa 3); depois do ZERAR voltou para exatamente 03:00, igual à soma das etapas salvas. Essa lógica (cronAtual = soma de durS das etapas anteriores + tempo da etapa atual) já existia desde a v1.9.33 e não precisou de ajuste.',
    'Popup de Chaves: aumentado de 860px para 1180px e reorganizado em 2 colunas lado a lado (card 1 "Habilitar/desabilitar" à esquerda, card 2 "Setup das cargas" à direita, mais largo) em telas ≥900px, para reduzir a sensação de aperto pedida pelo operador. Em telas estreitas continua empilhado como antes.',
    'Setup das cargas: adicionada coluna "R teórico (Ω)" no formulário ao vivo e na tabela-resumo, ao lado do "R medido (V²/P)" já existente. ASSUMIDO (não confirmado com o operador — favor validar): R teórico usa a MESMA tensão média medida (V) só que com a potência NOMINAL da chave no lugar da potência real medida, ou seja R_teórico = V²_medido / (kW_nominal×1000). A ideia é isolar o desvio da resistência (bobina/contato) do efeito da variação de tensão da rede/gerador no momento da medição. Se o critério correto for outro (ex.: tensão nominal também, ou outra referência), avise que ajusto.',
  ]},
  {v:'1.9.36',d:'19/10/2026',i:[
    'Corrigido: quando o card "Gráfico do ensaio" nasce/é recolhido na tela larga (≥1280px), a coluna 1 (Etapas) não deixa mais um vão vazio abaixo — o card Etapas ocupa o espaço livre.',
    'Popup de Chaves: tamanho reduzido (860px) para caber melhor na tela.',
    'Setup das cargas (card 2 do popup Chaves) refeito do zero a pedido do operador: não tem mais os passos "1) Medir sem carga / 2) Medir com a chave" — o "kW sem carga" agora é medido sozinho, ao vivo, sempre que o gerador está operando e NENHUMA chave está ligada (mostrado num chip de status). Clicar numa chave liga só ela e mostra os cálculos ao vivo (pode esperar/repetir quantas vezes quiser); um único botão "Salvar esta chave" grava; clicar na mesma chave de novo desliga e libera a escolha da próxima. Além do kW real, agora calcula também a resistência equivalente R = V² / P (tensão média das 3 fases ao quadrado dividido pela potência em W), mostrada em Ω.',
    'Correção de robustez: o trecho que trava/destrava os modos de operação conforme o gerador (novo na v1.9.35) agora está em try/catch — um erro ali não trava mais o resto da atualização da tela (botões, etapas, popups).',
  ]},
  {v:'1.9.35',d:'19/10/2026',i:[
    'Card "Registro do ensaio" voltou ao layout de ANTES (o da v1.9.30: grandezas em linhas, etapas em colunas, "Salvar valores da etapa" na última linha), porque o popup do botão "Resultado" já está no formato do SAP. Os layouts novos (v1.9.31 = tabela transposta; v1.9.32 = cabeçalho agrupado estilo SAP) foram retirados desta versão; essas duas versões continuam existindo como arquivos. Nada de lógica de salvar foi mexido.',
    'Correção (demo): o STOP do gerador deixou de DESCARTAR o ensaio. Agora é igual ao real: o gerador para, o ensaio continua ARMADO e as etapas já salvas ficam preservadas; ao ligar de novo e clicar INICIAR, o ensaio segue de onde estava (sem limpar o PLC). Antes, o STOP pedia confirmação, zerava o ensaio e o novo START apagava as etapas salvas.',
    'Regra: com o gerador ligado (operando/partindo/parando) os MODOS DE OPERAÇÃO ficam travados — tipo de ensaio (popup Modo e popup Faixas), salvamento manual/automático e Node-RED manual/automático. Escolha do gráfico continua livre.',
    'Popup das chaves refeito em dois cards: 1) só habilitar/desabilitar (botões "habilitar/desabilitar todas" removidos); 2) Setup das cargas (kW real, chave a chave) com botão de ligar gerador só no Demo, grandezas lidas em tempo real com o nome da tag, fórmula visual (kW com a chave − kW sem carga = kW real) e tabela com a carga disponível (nominal × real).',
  ]},
  {v:'1.9.34',d:'19/10/2026',i:[
    'Gráfico: agora são 3 opções no popup ⚙ Modo — "Sem gráfico", "Tempo de ensaio" (novo, padrão) e "Relógio (clássico)", que é o gráfico da v1.9.32 preservado. No novo, o eixo é o cronômetro e só aparece o que foi contado: sem faixas amarelas de ajuste/estabilização, sem pausa, sem "dente" de STOP do gerador e sem marca do ZERAR de degrau. O registro interno continua completo (CSV/relógio).',
    'Botão das chaves foi para o card Cargas (como o "Resultado"). O popup agora mostra as chaves na mesma posição do card, com a caixa de marcar dentro de cada quadro.',
    'Setup da chave (kW real): com o gerador em START e sem ensaio em andamento, uma chave por vez (as demais bloqueadas): mede o kW do DSE sem carga e com a chave, e salva a diferença como kW real. Opção "Usar kW real nos cálculos". Por ora só no navegador (depois vira FB no PLC). No Demo, cada chave física difere ±2% do nominal para dar o que medir.',
  ]},
  {v:'1.9.33',d:'18/10/2026',i:[
    'ZERAR agora zera SÓ o degrau ativo (sem o popup "Novo ensaio"): o degrau volta ao início (aquecimento/estabilização), o ensaio continua em andamento e o cronômetro só volta a contar quando a carga igualar o alvo. No ensaio livre o ZERAR segue zerando tudo. O "zerar tudo / apagar PLC" fica no PARAR ENSAIO (já existente).',
    'Gráfico mais fiel ao real: pausa do operador, STOP/falha do gerador e perda de dado CONGELAM o eixo do tempo (nada é plotado, sem "dente" de desliga/religa); ZERAR do degrau rebobina o gráfico ao início do degrau. A ação de zerar/pausar não é registrada.',
    'Novo popup "⚙ Modo": reúne tipo de ensaio (Livre / Guiado), salvamento (manual / automático), gráfico (com / sem) e modo do Node-RED (Manual / Automático). O botão "Salvar etapa" saiu do cabeçalho e o seletor saiu da barra do ensaio. O card do Gráfico nasce recolhido.',
    'Novo popup "Chaves": habilita/desabilita cada chave de resistência. Chave desabilitada aparece com bolinha cinza e fundo amarelo e nunca é ligada pela simulação. No Demo manual as chaves podem ser clicadas (o potenciômetro continua valendo e monta o conjunto respeitando as desabilitadas). Por ora só tela/Demo — envio ao PLC depende do DB55.',
  ]},
  {v:'1.9.32',d:'18/10/2026',i:[
    'A pedido do operador, com o print real da tela de resultado do SAP como referência: o cabeçalho do card "Registro do ensaio" agora é agrupado em 2 linhas como no SAP (POTÊNCIA · TEMP.MOTOR · TENSÃO · CORRENTE · AUXILIARES) e a 1ª coluna passou a se chamar "Minutos (carga)", com o rótulo de cada etapa no formato do SAP: faixa de minutos acumulados (a partir da duração de cada etapa) + carga alvo — ex.: "0 - 2 (0%)", "2 - 3 (30%)", "3 - 4 (50%)", "4 - 9 (100%)", "9 - 11 (107%)", "11 - 12 (0%)" (as faixas acompanham os minutos configurados em Parâmetros). O SAP repete a coluna KW duas vezes; aqui, no grupo POTÊNCIA, ficam "Carga real (%)" e "kW" (sem repetir). Estab., Cronôm. e Salvar continuam fora dos grupos, como colunas próprias. Só desenho (buildTabela + CSS da tabela): regras de salvar/resalvar/reenviar, status da etapa e ids das células não foram alterados. Observação: no print do SAP a 5ª etapa aparece como "(110%)" e aqui continua 107 % (valor configurado nos Parâmetros) — não foi alterado.'
  ]},
  {v:'1.9.31',d:'18/10/2026',i:[
    'A pedido do operador: card "Registro do ensaio" com a tabela TRANSPOSTA (linhas por colunas), no mesmo formato do SAP — agora cada ETAPA é uma linha (0 %, 30 %, 50 %, 100 %, 107 %, 0 %) e as grandezas são colunas, na mesma ordem de antes e do DB53 (Carga real, Potência, Temp. motor, Tensão Va/Vb/Vc, Corrente Ia/Ib/Ic, Rotação, Bateria, Tempo de estabilidade, Cronômetro) — as duas colunas Carga real (%) e Potência (kW) foram mantidas. A coluna "Salvar valores da etapa" fica fixa na borda direita da tabela e a coluna "Etapa" (com status e botão Abrir) fixa na esquerda, para o SALVAR nunca sair da tela quando a tabela precisar rolar na horizontal. Nenhuma regra de salvar/resalvar/reenviar, status da etapa ou leitura de volta foi alterada — só o desenho da tabela (buildTabela) e o CSS dela; os ids das células (th0…, c_<grandeza>_<etapa>, c_sv_<etapa>) continuam os mesmos.'
  ]},
  {v:'1.9.30',d:'17/10/2026',i:[
    'A pedido do operador, depois dos primeiros testes com o gerador real (v1.9.29 funcionou: "servidor/rede fora" apareceu corretamente ao desconectar o cabo): (1) Botão "Automático" (barra "Modo do ensaio") agora fica sempre desabilitado, com dica ao passar o mouse ("disponível futuramente, use somente o Manual") — não altera o que o Node-RED confirma, só impede o operador de pedir a troca pro automático agora. (2) Confirmado e corrigido: o popup "⚙ Servidor" (troca a fonte de gravação do ensaio entre simulador local e Node-RED real, e as injeções de falha de teste) não tinha nenhuma trava — agora só aparece/funciona com o modo demo ativo; fecha sozinho se o demo for desligado com ele aberto. (3) Título "Registro do ensaio" simplificado — tirei o complemento "· valor no fim de cada etapa (média dos últimos Xs)". (4) Texto "ISO" removido de tudo que é tela/rótulo do tipo de ensaio ("Ensaio padrão ISO" -> "Ensaio padrão", "Restaurar padrão ISO" -> "Restaurar padrão", "Padrão ISO" -> "Padrão" em TIPOS/TIPO_DESC, inclusive no título "Etapas do ensaio · ..." e nos logs do Registro de Aprendizado); NÃO mexi na citação "ISO8528/ISO3046" do relatório PDF (Valores de Referência) por serem normas técnicas reais, não o rótulo do tipo de ensaio — confirmar se isso também deve sair. (5) Números das grandezas: +5% adicional em cima do que já tinha ficado maior na v1.9.29.'
  ]},
  {v:'1.9.29',d:'17/10/2026',i:[
    'A pedido do operador, em preparação pro primeiro teste com gerador real: (1) ACH-13 da auditoria corrigido — tick() agora checa r.ok da resposta HTTP e exige "ok"/"idadeSegundos" presentes e numéricos antes de considerar a leitura válida (antes, campo ausente passava como "ok"/"idade zero"); ATENÇÃO: se o Node-RED real não mandar sempre esses dois campos, a tela vai passar a mostrar "Dado antigo" sempre — testar com o gerador real e avisar se isso acontecer. (2) Card "Cargas · banco de carga" (#bco) agora sempre nasce recolhido (as chaves ficam escondidas até o clique na setinha), independente do que foi salvo de sessões anteriores. (3) Números das grandezas (#med) +20% em todos os tamanhos de tela, mantendo o limite de largura/altura do card; número e unidade agora alinhados pela base (flex+baseline), inclusive entre valores com e sem casa decimal. (4) Padrão da água: atenção 85°C -> 90°C (crítico mantido em 95°C) — ainda marcado como provisório, ver pasta PENDENCIAS. (5) Tolerância de carga padrão: 3% -> 10% (TOL e PARAM_ISO.tol, pra não repetir a divergência do ACH-09). (6) Popup "Limites da temperatura da água": Salvar (clique ou Enter) grava e mostra "✓ Salvo.", mas não fecha mais sozinha — fecha só pelo ✕ ou clicando fora. Os botões "Aplicar"/parâmetros (dlgParam) já tinham esse comportamento antes, não precisaram mudar. NÃO mexi em "Dados do ensaio" (fluxo de início do ensaio manual) nem nos achados ACH-04/ACH-12 — ver conversa, ficaram pendentes de confirmação.'
  ]},
  {v:'1.9.28',d:'17/10/2026',i:[
    'Correção de geometria a pedido do operador (v1.9.27 corrigiu a quebra de texto do "ZERAR POR COMPLETO O ENSAIO", mas deixou o círculo da lâmpada (#lamp) sozinho numa 3ª linha, sem alinhamento com nada — "ficou muito feio, sem geometria"): reordenei só o HTML (sem mexer em lógica/CSS de posição) — #lamp volta para a 1ª linha, ao lado de INICIAR/PAUSAR/ZERAR (como era antes da v1.9.27), e "ZERAR POR COMPLETO O ENSAIO" fica sozinho numa 2ª linha, ocupando a largura toda. Confirmado por captura de tela.'
  ]},
  {v:'1.9.27',d:'17/10/2026',i:[
    'Ajuste visual a pedido do operador (print: botão "ZERAR POR COMPLETO O ENSAIO" quebrando em 3 linhas, destoando do círculo da lâmpada e do FINALIZAR ao lado): esse botão compartilhava a mesma regra CSS dos botões curtos (INICIAR/PAUSAR/ZERAR), que limita a largura a 150px. Agora ".btns" aceita quebra de linha (flex-wrap) e "#bZerTudo" ganhou regra própria para ocupar a linha toda, abaixo dos outros três botões — sem mexer na lógica/posição no HTML nem no onclick, só no layout. Não mexi na lâmpada (círculo cinza vazio quando o ensaio está parado/concluído é o estado "sem leitura" por design, em estadoLampada()) nem no FINALIZAR — avisar se ainda achar que destoam depois dessa correção.'
  ]},
  {v:'1.9.26',d:'17/10/2026',i:[
    'BUG SÉRIO CONFIRMADO pelo operador (print mostrando o tempo da etapa 2 contando sozinho, de 0:00 a 0:43, sem a carga ter sido levada aos 30% do degrau): avancaEtapa() — usada no caminho MANUAL, quando o operador clica em SALVAR — resetava T.el e T.estavel ao mudar de etapa, mas esquecia de resetar T.jaEstavel. Como T.jaEstavel ficava "true" herdado da etapa anterior (ex.: aquecimento 0%, que estabiliza sozinho), passoUnit() pulava a checagem de carga×alvo da nova etapa e já ia direto somando T.el. O caminho automático (dentro de passoUnit(), só usado quando "Salvar etapa: automático") já resetava corretamente — faltava só aqui. Corrigido: agora T.jaEstavel=false também em avancaEtapa().',
    'A pedido do operador: se o gerador já está confirmadamente operando no instante em que ele confirma a janela "Dados do ensaio" de um ensaio novo (ex.: ligou o gerador antes de preencher os dados), o cronômetro inicia direto — não exige mais um 2º clique em INICIAR só pra confirmar o que já se sabia. Se o gerador ainda NÃO está operando nesse instante, continua 100% manual: fica ARMADO e o INICIAR pisca até o clique, como já era.'
  ]},
  {v:'1.9.25',d:'17/10/2026',i:[
    'Ajuste a pedido do operador: o piscar agora é um guia de "próxima ação" que se move pelo ensaio, não fica preso no INICIAR. INICIAR pisca (azul pastel/branco) só até o 1º clique e depois fica azul fixo até PARAR ENSAIO/ZERAR — não volta a piscar a cada etapa. O botão "Salvar" de cada linha da tabela Registro do ensaio (que já ficava verde sólido quando a etapa estava cumprida aguardando o clique) agora PISCA (verde/branco) até o operador clicar — mesmo tratamento dado ao FINALIZAR, que também passa a piscar quando todas as etapas estão salvas aguardando o clique final.'
  ]},
  {v:'1.9.24',d:'17/10/2026',i:[
    'A pedido do operador — "SALVAR ETAPA" (botão no topo do card Etapas do ensaio) foi escondido por ser redundante: a mesma ação (salvar a etapa atual / Resalvar / Reenviar) já existe no botão de cada linha da tabela "Registro do ensaio" (coluna 3). Nada de lógica mudou — só ficou escondido (display:none); o código e os testes que o usavam continuam funcionando.',
    'A pedido do operador — o botão "▶ INICIAR CONTAGEM" (painel GERADOR) foi escondido por ser redundante com o "INICIAR" do card Etapas do ensaio. Agora existe um único botão de início visível: INICIAR. Ele assumiu toda a função que o botão escondido tinha, inclusive ligar o gerador simulado no demo (clickIniciar()).',
    'Novo indicador visual no botão INICIAR, a pedido do operador: pisca em azul pastel/branco enquanto o ensaio está ARMADO aguardando o clique (classe .pede) e fica azul fixo enquanto o cronômetro está contando (classe .ativo) — sem textos trocando de "START"/"START ENSAIO" para "INICIAR CONTAGEM".',
    'Corrigido texto desatualizado no tooltip do botão oculto (modo real, armado): ainda mencionava "a contagem começa sozinha", que não existe mais desde a v1.9.23 (cronômetro é sempre manual).'
  ]},
  {v:'1.9.23',d:'17/10/2026',i:[
    'REVERTIDO a pedido do operador (testou em campo e no demo): o cronômetro NÃO inicia mais sozinho ao detectar o gerador "operando". Da v1.9.19 até a v1.9.22, ao detectar "operando" com o ensaio ARMADO, o app chamava iniciaCron() automaticamente (pulava o clique em INICIAR). O operador confirmou que quer manter esse clique sempre manual e deliberado — agora só mostra um aviso ("Gerador operando — clique em INICIAR...") sem iniciar nada sozinho.',
    'Corrigida a causa raiz que tinha motivado o início automático no demo: botoesGer() agora reconhece o ensaio ARMADO também no demo — o botão vira "▶ INICIAR CONTAGEM" (igual ao modo real) e fica habilitado, em vez de ficar preso desabilitado assim que o gerador simulado sai de "parado". Assim o clique manual de INICIAR volta a funcionar no demo sem depender de automação.',
    'Reconfirmado: o tempo de cada etapa (T.el) só começa a contar depois que a carga fica dentro da tolerância (±3%) pelo tempo de estabilidade sorteado (1,5–4,5 s) — isso não mudou, continua em passoUnit().'
  ]},
  {v:'1.9.22',d:'17/10/2026',i:[
    'Confirmado em campo pelo operador: o DSE dele tem 3 botões push (sem seletora) — STOP (vermelho), MANUAL/AUTO (branco, nasce em MANUAL), START (verde). O LED STOP acende ao conectar o cabo (parado/ocioso); o LED MANUAL acende quando o gerador é partido por ele. Com isso confirmado, genInfo() volta a usar leds.manual===true como sinal principal de "gerador ligado" (desfeito provisoriamente na v1.9.21 por dúvida sobre o significado do LED — ver aquele changelog). geradorDisponivel/rpm continuam como reserva.',
    'Corrigido junto, pra não repetir o mesmo problema da v1.9.21: o simulador do demo mandava leds.manual sempre true (fixo), não importa se o gerador simulado estava parado ou operando — isso faria genInfo() achar sempre "operando" se eu tivesse deixado o uso de leds.manual ligado. Agora o demo imita a descrição do operador: LED stop aceso só com o gerador simulado parado, LED manual aceso assim que ele deixa de estar parado (partindo/operando) — mesma semântica do DSE real.',
    'Critério de estabilidade (TOL=3 pontos, ESTAB 1,5–4,5 s por etapa) confirmado pelo operador como correto — mantido sem alteração; "carga começando a subir" como gatilho alternativo foi descartado.'
  ]},
  {v:'1.9.21',d:'17/10/2026',i:[
    'BUG CONFIRMADO (reproduzido com teste automatizado): o operador relatou que "esperar a estabilidade da carga" não funcionava nem no DEMO (Manual nem Automático). Rastreei: depois do ensaio ARMADO (1º clique), o botão #bGenStart no demo fica desabilitado assim que o gerador simulado sai de "parado" (botoesGer: só habilita em "parado"/"—") — ou seja, o 2º clique que faltava pra chamar iniciaCron() NUNCA era possível no demo. Resultado: T.run nunca virava true, e por isso T.jaEstavel/T.estavel (a espera de estabilidade em passoUnit) nunca rodavam, em nenhuma etapa, em nenhum modo. Corrigido: o início automático que a v1.9.19 trouxe só pra fora do demo (ao detectar o gerador "operando") agora vale também no demo — mesmo gatilho, mesmo debounce de 2 leituras seguidas da v1.9.20. Testei no demo: o gerador simulado chega a "operando", o cronômetro liga sozinho, e a partir daí T.estavel volta a acumular normalmente.',
    'TENTEI usar o LED MANUAL (leds.manual) como sinal de "gerador ligado", a pedido do operador, mas desfiz: no simulador do demo, leds.manual vem sempre true (é fixo, não representa o gerador rodando) — testando, isso fazia genInfo() achar o gerador sempre "operando", mesmo "parado", quebrando toda a lógica de armado/parado. Como não dá pra confirmar sem adivinhar se no DSE real o LED MANUAL também significa só "seletor em modo manual" (sempre aceso nesse modo) em vez de "motor rodando", fica como pergunta pro operador antes de usar esse campo — genInfo() continua como estava (geradorDisponivel/rpm).',
    'Ainda não mexi no critério de estabilidade em si (TOL=3 pontos, ESTAB 1,5–4,5 s sorteado por etapa) nem na ideia de "carga começando a subir" como gatilho alternativo/mais cedo — ficou pendente a resposta do operador sobre isso (pergunta feita na v1.9.20). O SALVAR "não salvando" relatado em campo é consistente com esse mesmo bug (T.run travado em false ⇒ T.aguarda nunca chegava a true ⇒ o SALVAR da tela principal nunca tinha o que salvar, só sobrava o SALVAR manual de dentro do painel "Abrir" da etapa, que exige a carga JÁ dentro da tolerância na hora do clique) — ainda não confirmado em campo que era exatamente isso, fica como suspeita forte, não como certeza.'
  ]},
  {v:'1.9.20',d:'16/10/2026',i:[
    'A pedido do operador, depois do ensaio real de hoje: vigiaGerador() não descarta mais o ensaio sozinho quando o gerador aparenta ter parado (4 s lendo "parando"/"parado") — isso podia (e aconteceu em campo) perder etapas já salvas por causa de um soluço de comunicação Modbus/Node-RED, sem o gerador real ter parado de verdade. Agora só avisa uma vez ("Gerador parece ter parado — o ensaio continua ARMADO (nada foi perdido)...") e o ensaio continua ARMADO — só é perdido se o operador clicar em PARAR ENSAIO. Continua valendo a proteção que já existia: enquanto o gerador não estiver "operando", passoUnit() não conta tempo de etapa (genRun()), então nenhuma etapa inválida é salva mesmo sem descartar.',
    'Reforço de segurança no início automático da v1.9.19 (cronômetro ligar sozinho ao detectar o gerador operando): agora exige 2 leituras seguidas "operando" (não só 1) antes de confiar e chamar iniciaCron() — debounce contra uma leitura isolada/ruído do Modbus logo depois de uma falha ou reconexão. Levantado porque, no ensaio de hoje, depois de ZERAR + PARAR ENSAIO + novo START + INICIAR, algo deu errado bem nesse momento e na sequência o SALVAR parou de funcionar — ainda não confirmei a causa exata (preciso de mais detalhes: apareceu alguma mensagem em vermelho/laranja ao clicar SALVAR, ou nada?), mas essa é uma suspeita razoável e a correção aqui é uma melhoria de segurança independente de ser ou não a causa.'
  ]},
  {v:'1.9.19',d:'16/10/2026',i:[
    'A pedido do operador: no ensaio real, com o ensaio já ARMADO (1º clique em START ENSAIO + Dados confirmados), o cronômetro não precisa mais do 2º clique em "INICIAR CONTAGEM" — assim que o Modbus mostrar o gerador passando a "operando" (mesma leitura de leds/saídas/rpm que já existia em genInfo(), usada por botoesGer() e vigiaGerador()), o app chama iniciaCron() sozinho (o mesmo efeito do 2º clique: inicia a contagem e tenta ligar o Registro) e avisa "Gerador detectado operando — cronômetro e Registro iniciados automaticamente.". O 2º clique continua funcionando normalmente como alternativa manual (ex.: sem leitura de rpm/leds disponível pra detectar "operando" sozinho). Só se aplica no ensaio real e fora do teste de carga (que já inicia direto no 1º clique, sem o fluxo ARMADO) — no demo não muda nada, a partida continua simulada pelo próprio clique em START.'
  ]},
  {v:'1.9.18',d:'16/10/2026',i:[
    'A pedido do operador: a popup "Demo" agora bloqueia por completo ligar ① Simulação tradicional (ou ③, que liga ① junto) quando o DSE real está conectado — fora do modo demo e com a última leitura da API válida/recente (mesma variável `dadoOk` usada em ingest()/tick()). Tentando marcar, o checkbox volta sozinho pra desmarcado e mostra aviso explicando; pra simular de novo, é preciso primeiro a leitura real cair (desligar a URL/rede do Node-RED, por exemplo) ou desligar o DSE. Não bloqueia desligar ① nem mexer em ② (teste de validação), e não afeta usar o demo quando já não há DSE real respondendo.',
    'A pedido do operador: "Dados do ensaio" não bloqueia mais START/confirmação por campo vazio ou inválido, nem no ensaio real — a janela sempre libera (antes exigia nº de série, versão, data no formato certo, e frequência/tensão/temperatura/potência numéricas e > 0). Agora só avisa (sem travar) o que ficou faltando na mensagem "Ensaio ARMADO sem preencher: ..." — dá pra completar depois em "Dados do ensaio", inclusive com o ensaio já rodando.',
    'Decorrência da mudança acima, corrigida junto (segurança/integridade de dado): avaliaEnsaio() calculava os limites de tensão como DADOS.tensao*(1±tolerância) — sem tensão informada isso virava NaN, e "valor > NaN"/"valor < NaN" são sempre false, o que faria o ensaio aparecer como APROVADO na tensão mesmo estando fora da faixa (ou mesmo sem nenhum dado de tensão pra avaliar). Agora, sem tensão informada, o resultado da tensão fica "PENDENTE" (não avaliado) em vez de aprovar errado — no relatório (PDF e janela "Resultado do ensaio") e nos campos do cabeçalho (frequência/tensão/temp. ambiente/potência), que mostram "não informado" em vez de "NaN" quando o campo ficou vazio.'
  ]},
  {v:'1.9.17',d:'16/10/2026',i:[
    'A pedido do operador: rgIniciar() não trava mais o Registro por falta do modelo do DSE e/ou do gerador (campos Motor/Alternador em "Dados do ensaio") — isso é só identificação do arquivo pra organizar o acervo por modelo, não é função do HTML decidir se o ensaio pode ou não ser gravado por causa disso. Agora, se "Auto-ativar registro" estiver marcado, o Registro liga junto com o 2º clique em START/INICIAR CONTAGEM mesmo sem modelo informado — a sessão fica identificada como "não identificado" (dá pra corrigir depois digitando o modelo nos campos do painel Amostras, mesmo com a gravação em andamento). Revertido também o aviso "bloqueado" que o botão Registro passou a mostrar na v1.9.16 para esse caso (não bloqueia mais, então não faz sentido mostrar como bloqueado). A trava do DEMO (checkbox "Não gravar amostras enquanto demo estiver marcado") continua intacta, sem mudança — essa é intencional e configurável pelo operador.',
    'Confirmado (sem mudança de código, só reforçando o que já existia): o Registro liga sozinho junto com o 2º clique de START/INICIAR CONTAGEM do cronômetro (iniciaCron→rgIniciar, se Auto-ativar estiver marcado) e desliga sozinho em qualquer um destes: PARAR ENSAIO (pararEnsaio), ZERAR/ZERAR POR COMPLETO, FINALIZAR (ensaio finalizado) e quando o gerador que estava operando desliga no meio do ensaio e o sistema descarta o ensaio sozinho (descartaEnsaio) — todos já chamavam rgParar().'
  ]},
  {v:'1.9.16',d:'16/10/2026',i:[
    'Corrigido: botão "Registro" (REC, painel Amostras) bloqueado por "demo" + trava "Não gravar amostras no demo" ficava com o atributo disabled do navegador — um botão disabled não dispara clique nenhum, então clicar nele não fazia NADA e não mostrava nenhuma explicação (por isso parecia simplesmente não funcionar). Agora o botão continua clicável quando bloqueado (só fica esmaecido/com o ponto amarelo); o clique chama a mesma rotina de sempre, que abre o painel Amostras com o aviso "Registro bloqueado: demo está marcado..." e o caminho para desligar a trava, se for o caso.',
    'Checado para o ensaio real (fora do DEMO, a trava acima não bloqueia nada — ela só existe para não misturar amostra simulada no acervo real): confirmado com teste automatizado (Playwright, mock da API) que START ENSAIO funciona em 2 cliques — 1º clique abre "Dados do ensaio" e, ao confirmar, só ARMA (T.started=true, T.run=false, mensagem "ensaio ARMADO..."); o botão vira "▶ INICIAR CONTAGEM" e só o 2º clique de fato inicia a contagem (iniciaCron) e tenta ligar o Registro sozinho (rgIniciar, se "Auto-ativar registro" estiver marcado, que é o padrão). O modelo do DSE (pModelo) já vem automaticamente do próprio equipamento via Modbus/Node-RED. MAS o modelo do GERADOR (motor + alternador) só existe se for digitado nas linhas "Motor" e "Alternador" da tabela de equipamento, dentro de "Dados do ensaio" — e esses campos não são obrigatórios para confirmar a janela. Se ficarem vazios, o Registro não liga sozinho no 2º clique e, até esta versão, nada no painel principal avisava isso (só abrindo "Amostras" e clicando em "Registro" é que aparecia "Informe o modelo do DSE e do gerador..."). Corrigido: o botão "Registro" agora também fica esmaecido/bloqueado nesse caso (não só quando é a trava do demo), com o título explicando o motivo — mesmo sem abrir o painel Amostras. AÇÃO NO CAMPO: preencha ao menos Motor e Alternador em "Dados do ensaio" antes do 2º clique (INICIAR CONTAGEM) para o Registro entrar sozinho; se esquecer, é só abrir "Amostras" e clicar em "Registro" depois de preencher, ou corrigir e continuar.'
  ]},
  {v:'1.9.15',d:'16/10/2026',i:[
    'Correção confirmada com teste automatizado (Playwright): ao desligar o demo (por PARAR ENSAIO, desmarcando ① na popup Demo, ou "bloquear testes"), o badge "⚠ MOTOR" ficava com o valor antigo até a PRÓXIMA leitura real chegar — e se essa leitura demorasse, falhasse ou a rede estivesse instável no momento da troca, o alarme simulado continuava na tela mesmo com tudo desligado (reportado pelo operador depois da v1.9.14: "mesmo desmarcando... não apaga a falha"). Novo `limpaIndicadoresDemo()`, chamado nos 3 pontos que desligam o demo, esconde o badge e zera modo/modelo na hora, sem esperar o próximo tick().'
  ]},
  {v:'1.9.14',d:'16/10/2026',i:[
    'A pedido do operador: "PARAR ENSAIO" (bParaEns/pararEnsaio()) agora também desliga a simulação (①/③ na popup Demo), em vez de só parar a sequência de etapas e deixar os dados simulados (inclusive uma falha de motor já disparada) continuando em segundo plano. Novo helper `demoDesliga()`. Não mexe em ② (teste de validação), que continua um controle independente.'
  ]},
  {v:'1.9.13',d:'16/10/2026',i:[
    'Simulação do motor (③), a pedido do operador: marcar ③ sozinha já liga ① automaticamente (não precisa mais marcar as duas) — basta clicar INICIAR direto, sem mexer em mais nada.',
    'A falha não entra mais na hora em que ③ é marcada: agora ela só dispara quando o ensaio simulado sai do aquecimento e entra no degrau de 30% da carga (ETAPAS[1].alvo===30), replicando o caso real relatado ("teve teste de gerador que o motor foi o problema"). Novo gatilho `motorFalhaDegrau()`, chamado nos dois pontos onde a etapa avança: o avanço automático (passoUnit) e o avanço manual depois de SALVAR ETAPA (avancaEtapa) — o ensaio MANUAL do BT2 é o modo prioritário do projeto, então os dois caminhos precisavam do gatilho.',
    'Desmarcar ③ no meio do ensaio para a falha na hora (não espera o próximo degrau). ZERAR/começar de novo também desarma a falha (mas mantém ③ marcada, pronta para disparar de novo no próximo degrau de 30%, sem precisar marcar de novo).'
  ]},
  {v:'1.9.12',d:'16/10/2026',i:[
    'Correção: quando a leitura real falha (pill "servidor/rede fora" — sem rede/VPN até o Node-RED/PLC, ex. testando fora da rede do banco de testes), o badge "⚠ MOTOR" e os pills "modo"/"modelo" ficavam congelados com o último valor lido, mesmo que fosse de uma simulação de falha de motor já encerrada (reportado pelo operador: "encerrou o simulador mas falha do motor ainda fica com alarme"). Agora, sem dado novo, esses três indicadores são escondidos/zerados em vez de manter o valor antigo na tela — comportamento do tick(), que já existia desde antes da v1.9.9, não tinha esse tratamento no catch do fetch.'
  ]},
  {v:'1.9.11',d:'16/10/2026',i:[
    'Reorganização completa dos controles de demo/teste, a pedido do operador: o checkbox "demo" solto no cabeçalho e o botão "🔒 bloquear testes" deram lugar a um único botão "Demo", que abre uma popup com 3 checkboxes — ① Simulação tradicional (o demo de sempre: gerador, cargas e gráfico), ② Teste de validação do ensaio (independente, exclusivo com ① e ③ — é o que antes ficava preso junto com o demo e liberava o "FORÇAR SALVAR (teste)"), ③ Simular falha no motor (só funciona junto com ①; movido de dentro da popup Motor, que tinha ficado confuso/desencontrado da v1.9.9/v1.9.10).',
    'Marcar ① ou desmarcar liga/desliga o checkbox real "demo" (ainda é ele que o resto do app usa) e reinicia o motor de simulação; marcar ② desliga ① e ③ automaticamente e vice-versa.',
    '"FORÇAR SALVAR (teste)" agora aparece só com ② marcada (antes dependia de senha + "demo" marcado, o que tinha ficado contraditório com o novo simulador do motor). A senha ("mwm") agora libera a popup Demo inteira, uma vez por sessão; o botão "🔒 bloquear testes" moveu para dentro da popup e desliga as 3 opções de novo.',
    'Removido o checkbox "Simular falha ECU" de dentro da popup Motor — a popup Motor volta a ser só leitura ao vivo, sem controles.'
  ]},
  {v:'1.9.10',d:'16/10/2026',i:[
    'Correção: o botão "FORÇAR SALVAR (teste)" aparecia mesmo com "demo" desmarcado sempre que a senha de testes já tinha sido digitada na sessão (comportamento original, desde a v1.4.4 — dependia só da senha, não do demo). Agora exige os dois: senha desbloqueada E "demo" marcado. Desmarcar "demo" esconde o botão na hora, mesmo com a senha ainda ativa.',
    'Ajustado o texto da confirmação ao digitar a senha: não promete mais liberar o FORÇAR SALVAR com o demo desligado.'
  ]},
  {v:'1.9.9',d:'16/10/2026',i:[
    'Popup Motor: novo checkbox "Simular falha ECU" (aparece só com "demo" marcado) — liga uma falha sintética no simulador (pressão de óleo cai a 0, temp. do óleo sobe, 1 código "Simulado · TESTE-PRESSAO-OLEO", NÃO é um SPN/FMI real) pra testar a popup e o alerta "⚠ MOTOR" do cabeçalho sem precisar de um defeito real no motor.'
  ]},
  {v:'1.9.8',d:'16/10/2026',i:[
    'Nova popup "Motor" (botão ao lado de "Grandezas", card Leitura das grandezas): temperatura e pressão do óleo, pressão do turbo, temperatura de admissão/escape, pressão de combustível/arrefecimento, consumo, torque, posição do acelerador e falhas da ECU — todos campos já mapeados pelo servidor Node-RED (mesmos usados na popup "Grandezas", grupos "Motor e bateria" e "Motor via CAN / ECU"), nenhum campo novo inventado.',
    'Só tela: a popup Motor é só leitura ao vivo da API — não grava nada no PLC, não entra nas amostras do Registro de aprendizado (CSV) nem no relatório PDF. Persistência (DB Snap separado) fica para quando for decidido.',
    'Novo indicador "⚠ MOTOR" no cabeçalho, vermelho, quando a ECU reporta 1 ou mais falhas (falhasEcu.quantidade) — clique abre a popup Motor direto.'
  ]},
  {v:'1.9.7',d:'15/10/2026',i:[
    'Painel Amostras (Registro de aprendizado): nova trava "Não gravar amostras enquanto \'demo\' estiver marcado" (ligada por padrão), em Comportamento. Com ela ligada, o botão Registro fica bloqueado (desabilitado, com motivo no title) e o auto-início também não liga enquanto "demo" estiver marcado — evita amostras de teste/simulação se misturarem no acervo real.'
  ]},
  {v:'1.9.6',d:'15/10/2026',i:[
    'Card "Cargas · banco de carga": os 3 campinhos (Aplicado nas chaves / Medido no DSE / Diferença) agora ficam visíveis mesmo com o card recolhido (seta fechada). Só a nota + os ladrilhos das chaves somem/aparecem com a seta.'
  ]},
  {v:'1.9.5',d:'15/10/2026',i:[
    'Config real dos bancos de carga da BT2 (card "Cargas", ladrilhos de referência no ensaio real + chaves do DEMO): "Banco de 56 kW" (13 chaves: 5×5 + 7×4 + 1×3) e "Banco de 400 kW" (13 chaves: 7×50 + 4×10 + 2×5), no lugar dos nomes/valores fictícios "Eletele" usados até a v1.9.4.'
  ]},
  {v:'1.9.4',d:'15/10/2026',i:[
    'START ENSAIO de um ensaio novo não pergunta mais "Apagar o ensaio anterior no PLC?" — a limpeza do PLC agora é automática e silenciosa (o operador já decidiu isso ao clicar em START). Se a limpeza falhar, o ensaio começa mesmo assim e avisa na tela.',
    'Depois de FINALIZAR, os valores do ensaio ficam na tela normalmente (sem perguntar nada). Novo botão opcional "ZERAR POR COMPLETO O ENSAIO", visível só depois de um ensaio finalizado, para quem quiser apagar tela + PLC antes do próximo START.',
    'Modo de testes: senha trocada para "mwm" (minúsculo). Novo botão "🔒 bloquear testes" ao lado do "demo", que aparece só depois de desbloquear e desliga a senha de novo (trava o demo e o Forçar Salvar).',
    'Botão "FORÇAR SALVAR (teste)" passou para antes do "SALVAR ETAPA" na barra, pra não deslocar o layout quando ele aparece/desaparece.',
    'Forçar Salvar (teste): corrigido o tempo/cronômetro gravado no DB SNAP — estava sempre zerado (o cronômetro real nunca roda nesse modo); agora usa a duração cheia da etapa, igual aos outros valores sintéticos.',
    'Build voltou ao nome padrão de versionamento (sem o sufixo "-teste"), mantendo todas as ferramentas de teste/simulação construídas (senha, Forçar Salvar, valores sintéticos, Parar Ensaio).',
    'Card "Cargas · banco de carga": no ensaio real (API sem o campo "bancos"), além da nota "acionado manualmente" agora também aparecem os ladrilhos de referência das chaves (só visuais, sem clicar) — mesma config de kW usada no demo. ATENÇÃO: confira se os bancos/kWs mostrados (hoje "Eletele 56 kW" e "Eletele 550 kW", do demo) batem com o banco de carga físico real da BT2 — se não baterem, me passe a config certa (nomes dos bancos e kW de cada chave) que eu ajusto.'
  ]},
  {v:'1.9.0',d:'15/10/2026',i:[
    'Novo: ligação com o Node-RED de seleção (mesma origem do HTML). Barra "Modo do ensaio" com o seletor Manual / Automático: o modo é enviado ao Node-RED (POST /ensaio/modo) e a tela só mostra como "efetivo" o que o próprio Node-RED devolve em GET /ensaio/modo. Sem confirmação = erro vermelho (nunca mostra um modo que ninguém confirmou).',
    'Salvar etapa / Resalvar / Reenviar: o HTML envia a etapa ao Node-RED (POST /ensaio/snap/etapa, com a confirmação do operador) e depois LÊ DE VOLTA (GET /ensaio/snap). A etapa só aparece como "✓ salva" quando a leitura de volta traz a etapa com os valores enviados. A cronometragem só avança de etapa depois dessa confirmação.',
    'A tabela "Registro do ensaio" passou a ser desenhada a partir da leitura de volta do PLC (e não de um estado local). Faixa embaixo da tabela mostra a hora da última leitura e os erros.',
    'Falhas tratadas: timeout, Node-RED fora do ar, HTTP de erro, ok:false, gravação que o PLC não confirmou na leitura de volta. A etapa fica "✗ não salva" com o motivo e o botão "Reenviar".',
    'Dados do ensaio (preenchimento do SAP): ao confirmar, é enviado ao Node-RED (POST /ensaio/snap/preenchimento) e conferido na leitura de volta.',
    'Novo ensaio (ZERAR ou START de um ensaio novo): pergunta ao operador e chama POST /ensaio/snap/limpar antes de zerar a tela.',
    'Servidor de teste: botão "⚙ Servidor" permite escolher Node-RED real ou SIMULADOR LOCAL (mock) com injeção de falhas, para testar a interface sem o Node-RED. No DEMO o padrão é o simulador local (o DEMO nunca grava no PLC).'
  ]},
  {v:'1.8.9',d:'14/10/2026',i:[
    'Gerador parou no meio do ensaio = ensaio perdido. No DEMO, o STOP agora pede confirmação e descarta o ensaio em andamento (cronômetro, etapas, gráfico e botões voltam ao zero — o SALVAR não fica mais verde). No ensaio real (gerador desligado no painel do DSE), o sistema percebe que o gerador que estava operando desligou por 4 s seguidos e descarta o ensaio sozinho, com aviso na tela. Depois que as etapas já foram todas salvas (aguardando FINALIZAR) o ensaio completo é preservado.',
    'As amostras do Registro de um ensaio descartado continuam gravadas, mas não contam como "ensaio feito" no acervo.',
    'Dados do ensaio: DEMO e ensaio REAL passaram a ter dados separados. O ensaio real sempre começa em branco (vem do print do SAP ou é digitado) — os modelos da simulação (motor SDEC, alternador WEG QYI 274C SA etc.) não aparecem mais no real nem são usados para identificar as amostras do Registro.',
    'Registro de amostras: meta de ensaios por modelo padrão passou de 5 para 100. O download continua zerando o que estava pendente.'
  ]},
  {v:'1.8.8',d:'14/10/2026',i:[
    'Importar print do SAP reescrito: em vez de ler a página inteira e tentar adivinhar quem é quem pelo texto (o que embaralhava os campos), agora o sistema localiza cada caixinha branca do formulário na imagem e lê uma por uma, e o campo é definido pela posição da caixinha (1ª linha = série/versão/data, 6 linhas de equipamentos, última linha = frequência/tensão/temperatura/potência, e a fase pelo botão marcado). Testado com os prints reais do SAP: 26 de 26 campos corretos em todos, em ~6 s.',
    'Cada caixinha é lida em vários tamanhos e vence a leitura mais repetida. Campos com leitura duvidosa ou que não foi possível ler ficam marcados em laranja e listados na mensagem, para o operador conferir/digitar. Todos os campos são sempre sobrescritos pela leitura — nunca sobra valor antigo de outro ensaio.',
    'Se o print não tiver o desenho do formulário (cortado demais ou outra tela), cai automaticamente no método anterior (página inteira) e avisa para conferir tudo.',
    'Removida a conversão para preto-e-branco da v1.8.6, que apagava valores do print.'
  ]},
  {v:'1.8.7',d:'14/10/2026',i:[
    'Leitura do print do SAP: a ampliação da v1.8.6 ajudou a reconhecer os rótulos, mas testes com um print real mostraram que o passo de converter pra preto-e-branco estava apagando boa parte dos valores digitados (ficavam mais claros que os rótulos e o contraste jogava fora) — por isso as caixinhas voltavam vazias mesmo a imagem tendo sido ampliada.',
    'Removido o preto-e-branco (a imagem ampliada agora segue colorida) e removido também o modo de segmentação forçado de "bloco único" que tinha sido ligado na v1.8.6 — voltou pro modo automático do mecanismo, que se saiu bem melhor nos testes com o layout em caixinhas do formulário do SAP.'
  ]},
  {v:'1.8.6',d:'14/10/2026',i:[
    'Leitura do print do SAP: a causa dos campos vindo errados/em branco no teste real era a resolução do print colado (nesse caso, ~900px de largura) ser baixa demais para o OCR — o texto bruto mostrava que quase nada era reconhecido, inclusive linhas inteiras da tabela de equipamentos.',
    'Agora, antes de ler, a imagem é ampliada automaticamente até ~2600px de largura e convertida para preto/branco com mais contraste (o que também limpa boa parte do cinza-claro das bordas das caixinhas do SAP). Também ajustado o modo de segmentação do mecanismo de OCR para tratar o print como um bloco único de texto, que combina melhor com o formato do SAP do que o modo padrão.'
  ]},
  {v:'1.8.5',d:'14/10/2026',i:[
    'Janela "Dados do ensaio": o Modelo do Controlador não é mais travado/preenchido automaticamente a partir da API do gerador (campo "azul, lido do DSE") — agora entra só pelo print (OCR) ou digitado, igual aos outros campos.'
  ]},
  {v:'1.8.4',d:'14/10/2026',i:[
    'Corrigidos 3 bugs na leitura automática do print (achados testando com um print real, de campos com caixinha/borda ao redor de cada valor): ruído de borda colado na palavra (ex. "[DEEP", "220]") não era limpo, só quando vinha separado; um token sem letra nenhuma (ex. "|" sozinho) podia "colar" errado num rótulo vizinho e embaralhar a leitura; e o nome do equipamento (Motor/Alternador/Controlador...) exigia acerto perfeito — "Controlador" lido como "Controtador" pelo OCR fazia a linha inteira ser ignorada.',
    'A tolerância a erro de leitura nos rótulos agora é proporcional ao tamanho da palavra, com reforço para não confundir "Tensão" com "Versão" (que diferem só numa letra).'
  ]},
  {v:'1.8.2',d:'14/10/2026',i:[
    'Janela "Dados do ensaio": a miniatura do print colado agora é pequena (clique nela para ampliar/reduzir) — a janela fica bem mais compacta.',
    'Corrigido: Frequência/Tensão/Temp. ambiente/Potência vinham com lixo do OCR junto ao número (ex.: "[220]" em vez de "220", ou a unidade "(ºC)" sozinha sem o valor) — agora só o número é extraído; se não achar nenhum número, o campo fica em branco em vez de mostrar lixo.',
    'Corrigido: a tabela de equipamentos às vezes trazia ruído de borda dos campos do SAP (ex.: "©)", ")") nas células de Fabricante/Modelo/Nº de série — esses tokens que são só pontuação agora são descartados.',
    'Janela "Resultado do ensaio": o botão "Gravar ensaio" virou dois — "Gravar com relatório" (gera o PDF, como antes) e "Gravar sem relatório" (só grava o ensaio, sem gerar o PDF).'
  ]},
  {v:'1.8.1',d:'14/10/2026',i:[
    'Corrigido: mensagem de erro do OCR mostrava "undefined" em vez da causa real (o mecanismo de leitura às vezes rejeita com um texto simples, não com um erro — a tela só sabia ler o formato de erro).'
  ]},
  {v:'1.8.0',d:'13/10/2026',i:[
    'Janela "Dados do ensaio": nova caixa para importar um print da tela do SAP — cole com Ctrl+V, arraste a imagem ou escolha um arquivo.',
    '"Ler dados do print" reconhece o texto da imagem (OCR, roda no navegador, sem internet) e preenche automaticamente Nº de série, Versão do teste, Data, a tabela de equipamentos (Fabricante/Modelo/Nº de série de cada item) e Frequência/Tensão/Temp. ambiente/Potência.',
    'O preenchimento é só um rascunho: os campos continuam editáveis para o operador conferir e corrigir antes de salvar. A fase (Mono/Bi/Trifásico) não é lida automaticamente — confirme manualmente.',
    'Exige os arquivos do mecanismo de OCR publicados em /tesseract/ dentro da pasta pública do Node-RED (não incluídos no HTML — ver instruções de instalação); sem eles, a caixa mostra um aviso e os campos continuam digitáveis normalmente.'
  ]},
  {v:'1.7.1',d:'13/10/2026',i:[
    'Correção de rumo: removida a histerese automática de estabilidade da v1.7.0 — o sistema não deve decidir sozinho quando uma oscilação "invalida" a leitura, isso é do operador.',
    'Agora: uma vez que a carga estabiliza pela 1ª vez na etapa (dentro da tolerância, pelo tempo mínimo exigido), o cronômetro passa a contar e NÃO reseta mais sozinho nessa etapa, nenhuma oscilação depois interrompe — some apenas ao trocar de etapa. Decisão de invalidar fica com o operador (ex.: Resalvar).',
    'Mantida a transição mais ágil do banco de chaves (demo) da v1.7.0.'
  ]},
  {v:'1.7.0',d:'13/10/2026',i:[
    'Simulador demo: transição de carga mais ágil (chaves do banco fecham/abrem mais rápido) — tempo de ajuste mais realista, sem distorcer o tempo de estabilização.',
    'Histerese na estabilidade: depois que a carga já estabilizou dentro da tolerância, só uma oscilação maior (perceptível ao operador) reseta a contagem — ruído pequeno de medição não derruba mais o cronômetro.',
    'Isso mantém o foco da coleta em transições reais de degrau, sem contaminar com oscilação residual pequena.'
  ]},
  {v:'1.6.1',d:'13/10/2026',i:[
    'Relógio (tempo total decorrido) voltou a aparecer na tela, abaixo do gráfico, junto com cronômetro e estabilização.',
    'No relatório (PDF) e nas exportações (PNG/gráfico com título) continua mostrando só cronômetro e estabilização, sem o relógio.'
  ]},
  {v:'1.6.0',d:'13/10/2026',i:[
    'Acervo: o ensaio agora conta automaticamente assim que o registro termina — não precisa mais baixar o CSV para contar.',
    'O download (Baixar tudo/TXT/CSV) continua servindo para obter os arquivos; as amostras ficam "pendentes de arquivo" até baixar, mas já entram na meta.',
    'Novo: em PC com Chrome/Edge, é possível escolher uma pasta (botão "Escolher pasta" no painel Amostras) para salvar automaticamente TXT, CSV e PDF do relatório, além do download normal. Não aparece em celular ou outros navegadores — cai no download padrão.'
  ]},
  {v:'1.5.1',d:'13/10/2026',i:[
    'Corrigido: Registro agora encerra automaticamente quando o ensaio é finalizado (clique em FINALIZAR).'
  ]},
  {v:'1.5.0',d:'13/10/2026',i:[
    'Indicador de registro movido para a barra superior (piscando em vermelho quando ativo).',
    'Botão "Ativar registro" e "Limpar pendentes" removidos — apenas checkbox de auto-ativação no painel Amostras.',
    'Registro auto-encerra automaticamente quando o ensaio é finalizado/gravado (sem ação manual).',
    'Interface mais limpa: popup Amostras focada em visualizar dados e baixar arquivos.'
  ]},
  {v:'1.4.1',d:'13/10/2026',i:[
    'Checkbox "Auto-ativar registro ao iniciar ensaio" adicionado no painel Amostras, em Comportamento.',
    'Quando marcado (padrão): registro ativa automaticamente ao clicar "Iniciar".',
    'Quando desmarcado: você ativa o registro manualmente clicando no botão de ponto vermelho.'
  ]},
  {v:'1.4.0',d:'13/10/2026',i:[
    'Botão "Registro" movido de cabeçalho para dentro do painel Amostras (popup de aprendizado).',
    'A coleta de registros agora ativa automaticamente ao clicar em "Iniciar" o ensaio.',
    'O painel de amostras não abre mais automaticamente ao final do teste — use o botão Amostras para consultar.',
    'Parâmetro padrão em Ajustes mudou de 90 para 98 (ex.: LIB, FIB, etc).'
  ]},
  {v:'1.3.0',d:'13/10/2026',i:[
    'Registro de aprendizado: botão "Registro" liga/desliga a gravação de 1 amostra por segundo (leituras, etapa, estado do cronômetro, gerador) e dos eventos do ensaio.',
    'Painel "Amostras": acompanha as amostras da sessão e o acervo organizado por modelo de DSE e de gerador, com meta de ensaios por modelo.',
    'Arquivos: resumo em TXT (por etapa, patamares de carga, transições e eventos) e amostras em CSV. O CSV leva as sessões encerradas para o acervo.',
    'A sessão é encerrada sozinha ao gravar o ensaio ou ao trocar entre demo e real. Amostras do demo ficam separadas ([DEMO]).'
  ]},
  {v:'1.2.0',d:'13/10/2026',i:[
    'Popup Faixas simplificada: só 2 tipos de ensaio (Padrão ISO e Só teste de carga). O Ensaio livre foi removido.',
    'Faixas: Aplicar salva sem fechar a janela; Fechar fecha; Enter não envia. Trocar de aba não apaga nem reescreve os valores digitados.',
    'Faixas: sempre abre na aba ISO (com ensaio em andamento mostra o tipo em uso). "Só teste de carga" esconde os campos de etapas.',
    'Relógio removido da barra do gráfico.',
    'Reaplicadas as alterações da v1.1.0 (ver abaixo) que haviam sido perdidas numa edição.'
  ]},
  {v:'1.1.0',d:'12/10/2026',i:[
    'FINALIZAR só libera ao final do teste (todas as etapas cumpridas e salvas).',
    'Com a API real: START vira "START ENSAIO" (só inicia o ensaio) e o STOP foi retirado — ligar/desligar o gerador é no painel do DSE. O demo continua simulando START/STOP.',
    'Velocidade de simulação (5×/10×) não vale mais fora do demo — no real o tempo é sempre 1×.',
    'ZERAR pede confirmação se há ensaio não gravado; aviso do navegador ao fechar/recarregar com ensaio não gravado.',
    'PDF marcado como SIMULAÇÃO se o demo foi usado e mostra a versão do programa.',
    'Controle de versão visível (cabeçalho, rodapé e esta janela).'
  ]},
  {v:'1.0.0',d:'até 11/10/2026',i:[
    'Versão base: tela única em 3 colunas, modo claro/escuro, tamanho da letra, ensaio por etapas, relatório PDF, CSV e PNG, janelas arrastáveis, alarme de água, modo DEMO.'
  ]}
];
