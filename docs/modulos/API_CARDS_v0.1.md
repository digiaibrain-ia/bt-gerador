# API_CARDS v0.1 — API interna dos cards (29/10/2026)

Módulo: `modulos/api_cards_v0.1.js` (inline no medidor 1.10.112, gráfico v0.7 e visor). Ligação no medidor: `modulos/modo_operador_v0.1.js`.

## (a) Implementado e testado
- **Somente leitura**, dentro do navegador, canal `BroadcastChannel('bt2-api')`. **Não cria rota no Node-RED** e ignora qualquer mensagem que não seja `oi`/`pede` (nenhum comando passa por aqui).
- Cliente → medidor: `{k:'oi'}` a cada 3 s (publica só enquanto há ouvinte, 6 s) e `{k:'pede'}`.
- Medidor → cliente (1×/s): `{k:'snap', v:1, t, cards, links, ensaio, etapas, gerador, nominal, operador}`. Snapshot **completo** (sem incremental): perder um não corrompe nada. Cliente marca "sem dados" após 4 s.
- `cards`: todo `<div class="card">` de `section.panel` com `<div class="v" id>` → `{id, painel, rotulo, texto, valor, unidade, classes}`. Hoje (18): mcFonte, mcTipo, mcSalva, mcNode, mcGra (painel `modoCard`); tensaoL1L2/L2L3/L3L1, correnteL1/L2/L3, kw, tempAguaC, rpm, bateria (painel `med`); bkApl, bkDse, bkDif (painel `bco`). Novo card com `.v[id]` entra sozinho.
- `links`: lkPlc, lkNr, lkHtml (`estado`, `texto`).
- `ensaio`: iniciado, rodando, fim, parcial, aguardaFim, etapa (índice 0), decorrido (s), jaEstavel, simulado, tipo, salvarManual, tolerancia, demo, versao. `etapas`: i, alvo, min, nome, salva, estado (concluida/atual/pendente). `gerador`: estado, leituraValida, cargaPct. `nominal`: tensao, freq (null se não informado). `operador`: simples.
- Consumidores: **gráfico v0.7** (kW, correntes, rotação, água, bateria ao vivo na fonte Medidor) e **api_cards_visor_v0.1.html** (tabela de tudo).
- API JS na própria página: `BT2_API.snapshot()`, `.card(id)`, `.assina(fn)`, `.cliente(fn)`.

## (b) Assumido
- Nomes dos campos de `ensaio/etapas/gerador` = nomes novos desta API (derivados das variáveis T, MODO, ETAPAS, SNAP, GEN do medidor 1.10.111); não são rotas nem tags do PLC.
- `valor` é o número exibido na tela (já formatado/arredondado pelo medidor), não o valor bruto do DSE.

## (c) Limites / a desenvolver
- Só entre páginas do mesmo navegador/origem. Outro aparelho: leitura direta `/api/gerador` (gráfico, fonte "API direto").
- Cards em popups (Chaves, Patamar, Motor etc.) não estão no snapshot; só os de `section.panel`. Mapa dos FBs ainda não consome a API.
- Rotas HTTP no Node-RED: **não feitas** (exigem nomes aprovados por você).

---
# MODO_OPERADOR v0.1 — Visão simples
- Ligar: ⚙ Modo › "Visão do operador › Simples", ou `?op=1` (`?op=0` desliga). Selo "Visão simples" no cabeçalho.
- Prepara **Guiado + salvamento automático** pelos próprios botões do popup (mesmas travas: gerador ligado ou ensaio em andamento bloqueiam). Sair devolve o salvamento manual anterior.
- Esconde: Banco de Cargas/Patamar guiado, PAUSAR, SALVAR, FINALIZAR e o painel Simulação. Mantém INICIAR, ZERAR (só o degrau), PARAR ENSAIO, tabela de registro (reenvio manual de etapa).
- A lógica de ensaio **não mudou**: avanço de etapa por tempo+estabilidade e finalização automática quando todas as etapas estão gravadas e conferidas no PLC (v1.10.103). Se uma gravação falhar, o ensaio não finaliza sozinho — reenviar pela tabela.
- Testado: liga/desliga, recarregar, `?op=1`, restauração do salvamento, sem erros JS. **Ainda não testado**: ensaio completo de ponta a ponta nesta visão (nem no Demo nem com PLC) — fazer um ensaio Demo antes de usar em produção.
- Premissa: quem sobe a carga é outro (painel/observador); nesta visão o operador não tem as chaves na tela.
