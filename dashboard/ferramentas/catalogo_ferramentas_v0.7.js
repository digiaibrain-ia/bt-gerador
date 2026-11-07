/* =====================================================================================================================
   catalogo_ferramentas_v0.7.js — LISTA ÚNICA das páginas (HTML) do projeto  ·  29/10/2026
   PARA QUE SERVE (leigo): é a "agenda" das ferramentas. Quando uma ferramenta ganhar versão nova, a gente muda o nome do arquivo AQUI, em UMA linha,
   e o menu ☰ (menu_dev_v0.1.js) e a página de entrada (index.html) já abrem o arquivo certo. Não precisa mais editar o final do medidor.
   POR QUE (técnico): o nome do arquivo leva a versão (regra do projeto). Sem este catálogo, cada página guardava o nome das outras no próprio código.
   COMO ATUALIZAR: troque o valor de "arquivo" da ferramenta que mudou (ex.: 'mapa_fbs_v0.8.html' → 'mapa_fbs_v0.11.html') e copie o arquivo novo para a pasta public.
   COMO ACRESCENTAR: copie um bloco {…} e mude id, nome, arquivo, desc. "legado:true" = ainda existe mas aponta para versões antigas (aparece esmaecido).
   NÃO FAZ: não lê PLC, DSE nem Node-RED; não grava nada. Só descreve arquivos. Os nomes abaixo vieram dos arquivos entregues até 29/10/2026.
   ===================================================================================================================== */
window.CATALOGO_FERRAMENTAS = {
  atualizado: '03/11/2026',
  apoio: ['catalogo_ferramentas_v0.7.js', 'menu_dev_v0.2.js'],   // .js que o medidor carrega da MESMA pasta; o index confere se estão lá
  /* 29/10/2026: Simulador do rodízio e Painel BT2 saíram do catálogo (decisão do operador: sem função no projeto). Os arquivos antigos podem ser apagados da pasta. */
  itens: [
    { id: 'medidor',     grupo: 'Operação',        nome: 'Medidor do Gerador (ensaio)',  arquivo: 'medidor_gerador_v1.10.181.html', desc: 'Tela principal: leitura do DSE, ensaio, registro, chaves e Patamar Guiado.' },
    { id: 'grafico',     grupo: 'Operação',        nome: 'Gráfico do ensaio',            arquivo: 'grafico_ensaio_v0.12.html',       desc: 'Ensaio ao vivo em tela cheia (2º monitor) ou ensaio salvo para análise.' },
    { id: 'apivisor',   grupo: 'Desenvolvimento', nome: 'Visor da API dos cards',       arquivo: 'api_cards_visor_v0.4.html',      desc: 'Mostra tudo o que o medidor publica (cards, ensaio, etapas, gerador) — somente leitura.' },
    { id: 'maquete',     grupo: 'Desenvolvimento', nome: 'Maquete de layout',            arquivo: 'maquete_layout_v0.5.html',       desc: 'Blocos arrastáveis dos cards da tela principal (com setinha, travar, presets) para testar arranjos e mandar o print.' },
    { id: 'mapa',        grupo: 'Desenvolvimento', nome: 'Mapa dos FBs',                 arquivo: 'mapa_fbs_v0.16.html',             desc: 'Esquema dos blocos (mãe + filhos) com valores ao vivo do Patamar Guiado.' },
    { id: 'gerenciador', grupo: 'Desenvolvimento', nome: 'Gerenciador de logs',          arquivo: 'gerenciador_logs_v1.8.html',     desc: 'Recebe os logs [DEV.OBS] do medidor, gráfico e mapa, em abas.' },
    { id: 'amostras',    grupo: 'Desenvolvimento', nome: 'Simulador de amostras',        arquivo: 'amostras_simulador_v0.7.html',   desc: 'Registro de aprendizado e simulação de ensaios por modelo.' },
  ]
};
/* v0.7.1 (07/11/2026): ESCOLHA PELO INDEX. O index.html tem o botão "Escolher arquivo…" em cada ferramenta; o nome escolhido fica guardado neste navegador
   (localStorage 'bt2.catalogo.arquivos') e vale aqui, no index e no menu ☰ do medidor (mesma origem). Sem escolha, vale o nome escrito acima. */
(function () {
  let m = {}; try { m = JSON.parse(localStorage.getItem('bt2.catalogo.arquivos') || '{}') || {}; } catch (e) {}
  window.CATALOGO_FERRAMENTAS.itens.forEach(i => { i.padrao = i.arquivo; if (typeof m[i.id] === 'string' && /^[\w.\-]+\.html?$/i.test(m[i.id])) { i.arquivo = m[i.id]; i.escolhido = true; } });
})();
