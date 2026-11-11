/* =====================================================================================================================
   catalogo_ferramentas.js - GERADO (nao editar a mao). Nome SEM versao de proposito: medidor e index carregam sempre este nome.
   Cada ferramenta aponta para a MAIOR versao do arquivo presente na pasta (gerado por dashboard/gerador/gerar_catalogo_auto_v0.1.py, tambem rodado pelo gerador do pacote).
   Para trocar a versao de uma ferramenta: copie o arquivo novo para a pasta e gere de novo (ou, so neste navegador, use "Escolher arquivo..." no index).
   NAO FAZ: nao le PLC, DSE nem Node-RED; nao grava nada. So descreve arquivos.
   ===================================================================================================================== */
window.CATALOGO_FERRAMENTAS = {
  atualizado: '10/11/2026 (gerado)',
  apoio: ['catalogo_ferramentas.js', 'menu_dev_v0.2.js'],   // .js que o medidor carrega da MESMA pasta; o index confere se estao la
  itens: [
    { id: 'medidor', grupo: 'Operação', nome: 'Medidor do Gerador (ensaio)', arquivo: 'medidor_gerador_v1.10.199.html', desc: 'Tela principal: leitura do DSE, ensaio, registro, chaves e Patamar Guiado.' },
    { id: 'grafico', grupo: 'Operação', nome: 'Gráfico do ensaio', arquivo: 'grafico_ensaio_v0.13.html', desc: 'Ensaio ao vivo em tela cheia (2º monitor) ou ensaio salvo para análise.' },
    { id: 'apivisor', grupo: 'Desenvolvimento', nome: 'Visor da API dos cards', arquivo: 'api_cards_visor_v0.4.html', desc: 'Mostra tudo o que o medidor publica (cards, ensaio, etapas, gerador) — somente leitura.' },
    { id: 'maquete', grupo: 'Desenvolvimento', nome: 'Maquete de layout', arquivo: 'maquete_layout_v0.5.html', desc: 'Blocos arrastáveis dos cards da tela principal (com setinha, travar, presets) para testar arranjos e mandar o print.' },
    { id: 'mapa', grupo: 'Desenvolvimento', nome: 'Mapa dos FBs', arquivo: 'mapa_fbs_v0.16.html', desc: 'Esquema dos blocos (mãe + filhos) com valores ao vivo do Patamar Guiado.' },
    { id: 'gerenciador', grupo: 'Desenvolvimento', nome: 'Gerenciador de logs', arquivo: 'gerenciador_logs_v1.9.html', desc: 'Recebe os logs [DEV.OBS] do medidor, gráfico e mapa, em abas.' },
    { id: 'amostras', grupo: 'Desenvolvimento', nome: 'Simulador de amostras', arquivo: 'amostras_simulador_v0.7.html', desc: 'Registro de aprendizado e simulação de ensaios por modelo.' },
  ]
};
/* v0.7.1 (07/11/2026): ESCOLHA PELO INDEX. O index.html tem o botão "Escolher arquivo…" em cada ferramenta; o nome escolhido fica guardado neste navegador
   (localStorage 'bt2.catalogo.arquivos') e vale aqui, no index e no menu ☰ do medidor (mesma origem). Sem escolha, vale o nome escrito acima. */
(function () {
  let m = {}; try { m = JSON.parse(localStorage.getItem('bt2.catalogo.arquivos') || '{}') || {}; } catch (e) {}
  window.CATALOGO_FERRAMENTAS.itens.forEach(i => { i.padrao = i.arquivo; if (typeof m[i.id] === 'string' && /^[\w.\-]+\.html?$/i.test(m[i.id])) { i.arquivo = m[i.id]; i.escolhido = true; } });
})();
