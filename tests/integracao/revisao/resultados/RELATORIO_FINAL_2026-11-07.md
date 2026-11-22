# Revisão universal + Dev/Operador oculto — relatório final (07/11/2026)

## O que foi entregue
- **Medidor 1.10.176** (inclui o 1.10.175): botão **Dev/Operador oculto** com 3 modos — Rápido (como antes), **Avançado** (varre todos os objetos da tela e das janelas; confere se dá para clicar, onde abre, se cabe, se fica por cima, se fecha por ✕/Esc/fora e se reabre; menu do botão direito; Patamar guiado; ensaio a 10× e 5×) e **Monkey** (cliques aleatórios, semente fixa, 3 min). Só em **Demo local**. Caixa de areia: bloqueia/conta rede de escrita, impressão, janela nova, alerta, download, seletor de arquivo e saída da página. Relatório com cobertura e perfil da tela; também sai pela Central de registros (item "robo").
- **Correções achadas pela revisão** (PC e celular): janela saía da tela ao arrastar (✕ inalcançável) → agora fica inteira na tela (arrasto + guarda ao mudar tamanho/zoom/girar); arrasto por toque; faixa de erro vazia por cima de campo; alvos de toque no celular (só `pointer:coarse`).
- **Outros HTML em versões novas:** maquete v0.5 (menu Exportar fecha; cópia sem erro), mapa v0.16 (área de toque do "i"), gerenciador v1.8, api_cards_visor v0.4, gráfico v0.12 (✕ na Ajuda), index v0.3 (nome fixo; backup `index_v0.2.html`), Ajuda v0.2 (arrasta e fica na tela). Amostras v0.7 e arquitetura v0.5: sem achado relevante, sem mudança.

## O que foi provado (Chromium/Playwright, mouse e toque reais, PLC/Node-RED simulados)
- Robô Avançado (1.10.176): **desktop 152 OK / 0 FALHA**; **Poco A (407×904) 152 OK / 0 FALHA / 120 avisos** (toque pequeno); **Monkey 3 min, semente 20261107: 1174 ações, 0 erro de JavaScript**, 6 tentativas de sair da página bloqueadas.
- Revisão universal (todos os HTML, desktop + Poco A + Poco B): antes 1183 achados / 3 tipos de falha alta em massa; depois só restam os itens de `BACKLOG_FORA_DE_ESCOPO.md` (REV-1…REV-6).
- Regressão: 268 testes de integração/fase4/segurança, 262 passam, 5 `todo` já conhecidos (P3-E1, P3-E2, F2-1…), 1 teste da Central atualizado de propósito (agora 6 itens, com o "robo"); reexecutado: 39 + 33 passam.

## O que NÃO foi provado
- Poco X6 Pro real, Safari e Firefox (arrasto/toque aqui é Chromium emulado; viewport CSS do Poco não confirmado — usei 407×904 e 444×986).
- "Todas as possibilidades" = todos os objetos visíveis + menus + sequências + monkey com semente; não é combinação exaustiva (explosão combinatória).
- Nada foi aplicado no PC BT2, no PLC ou no Node-RED de produção. Os HTML novos só entram por pacote .zip, com OK do Reginaldo.
- No Monkey pode aparecer o aviso do navegador "Sair do site?": clicar em **Cancelar** (a caixa de areia pede para ficar na página).

## Atualização final (08/11/2026) — versão entregue: medidor 1.10.190
Desde a 1.10.176 o teste em desktop, Poco X6 Pro (Chrome/WebView, arquivo aberto de Downloads) e a foto do tablet acharam e corrigiram:
- 177: menu do botão direito fora da tela com zoom do body (tela larga).
- 178/179: relatório identifica o dispositivo; barra do robô com cronômetro, arrastar, redimensionar, recolher; visão simples sem card Patamar.
- 180: robô força salvamento Manual no ensaio e devolve o anterior.
- 181: botão Copiar relatório não mente mais (campo de cópia dentro do popup modal; texto na tela; Compartilhar).
- 182/183/187: barra do robô fica no fim (concluído/interrompido), cabe no celular, fica acima de popups (inclusive modais, com Parar tocável); bloco do robô cabe no celular.
- 184/186: Dica Alt+I não nasce ligada nem aparece no celular; robô devolve a preferência.
- 185: caixa chkPlcNovos recarregava a página no Monkey — bloqueada na caixa de areia.
- 188: armazenamento do navegador bloqueado (content:///WebView) não gera erro.
- 189: o robô não abre aba, não baixa e não imprime sozinho, em nenhum modo.
- 190: fase Patamar conferida (o card estava certo; o defeito era do robô). REV-6 fechado.
Resultado final no Poco: Avançado 153 OK/0 falha; Monkey (1015 ações) 6 OK/0 falha, 0 erro de JavaScript. Layout (alvos 44 px, mapa no celular) e menu de toque longo: decisão do Reginaldo de não alterar.

## Fase 5 (08/11/2026) — Demo × Real e dois aparelhos, com decisões autônomas
- Regressão completa contra o medidor 1.10.190: **274 testes, 268 passam, 0 falham, 6 `todo`** (P3-E1, P3-E2, F2-1, DR-1 e os já conhecidos). Nada em produção foi alterado.
- Achado principal (provado no simulador, **não na bancada**): no modo REAL o Setup só informa o chaveamento ao PLC com os Dados do ensaio **confirmados**; no Demo vem sozinho. Detalhes, pontuação das decisões e propostas: `docs/licoes/DECISOES_AUTONOMAS_2026-11-08.md`.
