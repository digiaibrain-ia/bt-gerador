/* ============================================================================
   analisador_grafico_v0.2.js  —  Analisador de gráficos do ensaio (zoom, desvio, tolerâncias)
   v0.2 (27/10/2026): NOVO seletor "Ensaio inteiro / Últimos 1, 2, 5, 10 min" para acompanhar ao vivo em outra tela (janela móvel). Fora isso igual à v0.1.
   ----------------------------------------------------------------------------
   PARA QUE SERVE (linguagem para equipes não técnicas)
     Mostra o ensaio "ao longo do tempo" em faixas empilhadas (carga, desvio da carga,
     tensão, frequência...), todas com o MESMO eixo de tempo. O operador pode:
       • aproximar/afastar (roda do mouse, botões + e −, ou gesto de pinça no celular);
       • andar pelo tempo (arrastar, setas do teclado);
       • selecionar uma região para aproximar ("Zoom de área");
       • passar o cursor e ler TODOS os valores daquele instante;
       • marcar dois instantes (A e B) e ver a diferença entre eles;
       • ver, numa tabela, mínimo / média / máximo e o % do tempo dentro da tolerância
         na janela visível — é assim que se enxerga o DESVIO sem abrir planilha.
     Este módulo NÃO decide aprovação nem reprovação: só mostra dados e tolerâncias que
     o programa hospedeiro entrega. Os limites (±%) vêm dos parâmetros já existentes.

   BOAS PRÁTICAS DE GRÁFICO APLICADAS (e o porquê)
     1. Eixo X compartilhado e faixas empilhadas  → comparar causa e efeito no mesmo instante
        sem misturar unidades (%, V, Hz) no mesmo eixo.
     2. Cada faixa ajusta o eixo Y sozinha à janela visível → um desvio pequeno de tensão não
        some ao lado de uma carga de 0–120 %. Shift + roda trava/ajusta o Y manualmente.
     3. Tolerância desenhada como FAIXA sombreada, não só linha → fora da faixa é visível de longe.
     4. Decimação min/máx por coluna de pixel → milhares de pontos continuam rápidos E nenhum
        pico (que pode ser a falha!) desaparece ao afastar o zoom.
     5. Cursor com leitura de todos os valores + marcadores A/B → medir sem adivinhar no olho.
     6. Não depende só de cor: série tem nome na legenda e na tabela; estados têm texto.
     7. Funciona offline (sem biblioteca externa), em tela de toque e com teclado.
     8. Atualização "ao vivo" sem tirar o operador do zoom que ele escolheu.

   INTEGRAÇÃO (o hospedeiro entrega os dados; o módulo desenha)
     const g = AnaliseGrafico.criar({
        montar: elementoHtml,                 // onde o módulo constrói a interface
        titulo: 'Ensaio',                     // usado no PNG exportado
        rotuloX: 'Tempo (mm:ss)',
        fmtX: t => '01:23',                   // opcional: formata o tempo
        tema: () => 'claro' | 'escuro',       // opcional
        dados: () => ({ ...ver "FORMATO DE DADOS" abaixo... }),
     });
     g.atualiza();   // chame quando houver dado novo (pode chamar à vontade: ele limita a taxa)

   FORMATO DE DADOS devolvido por dados():
     {
       tMax: número,                          // maior tempo conhecido (fim do eixo "tudo")
       etapas:  [{t0,t1,rotulo}],             // degraus do roteiro (botões "Etapa ◀ ▶" e linhas)
       faixasX: [{t0,t1,cor,rotulo}],         // sombreado vertical global (ajuste, pausa...)
       marcos:  [{t,rotulo}],                 // riscos verticais (ex.: manobra de chave)
       infoExtra: t => 'texto',               // opcional: linha extra no cursor (etapa, estado...)
       tracks: [{
          id, titulo, unidade, dec, peso,     // peso = altura relativa da faixa
          y: {fixo:[min,max]} | {},           // fixo = faixa padrão; senão ajusta aos dados
          bandas:  [{x0,x1,y0,y1,cor,rotulo}],// tolerância sombreada (em unidades do eixo)
          linhasH: [{y,cor,rotulo}],          // limites tracejados
          series: [{ id, nome, cor, tipo:'linha'|'pontos'|'degrau', largura,
                     dados:[[t,valor|null],...],   // ordenado por t; null = quebra de linha
                     faixa:{lo,hi} }]          // opcional: habilita "% dentro da faixa"
       }]
     }
   ============================================================================ */
(function (global) {
  'use strict';

  /* -------------------------------------------------------------------------
     1) UTILITÁRIOS PUROS (sem tela) — fáceis de testar e de portar
     ------------------------------------------------------------------------- */

  /** Formata segundos como mm:ss (ou h:mm:ss). Por quê: operador pensa em minutos. */
  function fmtTempoPadrao(t) {
    const s = Math.max(0, Math.round(t));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    const p2 = n => (n < 10 ? '0' : '') + n;
    return (h ? h + ':' + p2(m) : p2(m)) + ':' + p2(r);
  }

  /** Número com vírgula decimal (padrão brasileiro). */
  function nb(v, dec) {
    if (v == null || !isFinite(v)) return '—';
    return Number(v).toFixed(dec == null ? 1 : dec).replace('.', ',');
  }

  /**
   * Passo "bonito" para uma grade (1, 2, 5 × 10^n). Por quê: rótulos como 0, 20, 40
   * são lidos de relance; 0, 17, 34 não.
   */
  function passoBonito(faixa, alvoDivisoes) {
    const bruto = faixa / Math.max(1, alvoDivisoes);
    const pot = Math.pow(10, Math.floor(Math.log10(bruto || 1)));
    const f = bruto / pot;
    return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * pot;
  }

  /** Passo de grade para o eixo de TEMPO (segundos): 1, 2, 5, 10, 15, 30 s, 1, 2, 5, 10, 15, 30 min, 1 h... */
  function passoTempo(faixa, alvoDivisoes) {
    const opcoes = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 14400];
    const bruto = faixa / Math.max(1, alvoDivisoes);
    for (const o of opcoes) if (o >= bruto) return o;
    return opcoes[opcoes.length - 1];
  }

  /** Busca binária: primeiro índice com t >= alvo (dados ordenados por t). */
  function primeiroIdx(d, alvo) {
    let a = 0, b = d.length;
    while (a < b) { const m = (a + b) >> 1; if (d[m][0] < alvo) a = m + 1; else b = m; }
    return a;
  }

  /** Índice do ponto mais próximo de t (para o cursor). -1 se vazio. */
  function maisProximo(d, t) {
    if (!d.length) return -1;
    const i = primeiroIdx(d, t);
    if (i <= 0) return 0;
    if (i >= d.length) return d.length - 1;
    return (t - d[i - 1][0] <= d[i][0] - t) ? i - 1 : i;
  }

  /**
   * Estatística de uma série numa janela [t0,t1].
   * Devolve {n, min, max, media, dp, dentro}. 'dentro' = % de amostras dentro de faixa{lo,hi}.
   * Por quê por amostra e não por tempo: as amostras vêm em ritmo quase constante (≈0,4 s a 1 s),
   * então a diferença é desprezível e a conta fica explicável a quem não é técnico.
   */
  function estatistica(serie, t0, t1) {
    const d = serie.dados;
    let n = 0, soma = 0, min = Infinity, max = -Infinity, dentro = 0;
    for (let i = primeiroIdx(d, t0); i < d.length && d[i][0] <= t1; i++) {
      const v = d[i][1];
      if (v == null || !isFinite(v)) continue;
      n++; soma += v; if (v < min) min = v; if (v > max) max = v;
      if (serie.faixa && v >= serie.faixa.lo && v <= serie.faixa.hi) dentro++;
    }
    if (!n) return { n: 0 };
    const media = soma / n;
    let q = 0;
    for (let i = primeiroIdx(d, t0); i < d.length && d[i][0] <= t1; i++) {
      const v = d[i][1]; if (v == null || !isFinite(v)) continue; q += (v - media) * (v - media);
    }
    return { n, min, max, media, dp: Math.sqrt(q / n), dentro: serie.faixa ? 100 * dentro / n : null };
  }

  /**
   * Decimação min/máx: reduz a série a no máximo ~4 pontos por coluna de pixel,
   * preservando primeiro, mínimo, máximo e último de cada coluna na ORDEM do tempo.
   * Por quê: amostrar "1 a cada N" apagaria picos; aqui o pico sempre aparece.
   * Quebras (null) são preservadas.
   */
  function decimar(d, t0, t1, px, colunas) {
    let i0 = Math.max(0, primeiroIdx(d, t0) - 1), i1 = Math.min(d.length, primeiroIdx(d, t1) + 1);
    const n = i1 - i0;
    if (n <= colunas * 2) return d.slice(i0, i1);
    const saida = [];
    let col = null, bucket = null;
    const fecha = () => {
      if (!bucket) return;
      const lista = [bucket.f, bucket.mi, bucket.ma, bucket.l].filter(Boolean);
      lista.sort((a, b) => a[0] - b[0]);
      let ant = null;
      for (const p of lista) { if (p !== ant) saida.push(p); ant = p; }
      bucket = null;
    };
    for (let i = i0; i < i1; i++) {
      const p = d[i];
      if (p[1] == null) { fecha(); saida.push(p); col = null; continue; }
      const c = Math.floor(px(p[0]));
      if (c !== col) { fecha(); col = c; bucket = { f: p, mi: p, ma: p, l: p }; }
      else { if (p[1] < bucket.mi[1]) bucket.mi = p; if (p[1] > bucket.ma[1]) bucket.ma = p; bucket.l = p; }
    }
    fecha();
    return saida;
  }

  /* -------------------------------------------------------------------------
     2) ESTILO (injetado uma única vez). Prefixo .ag- evita conflito com a página.
     ------------------------------------------------------------------------- */
  const CSS = `
  .ag{--ag-bg:#fff;--ag-txt:#222;--ag-mut:#666;--ag-lin:#d8d8d3;--ag-bar:#f1f2f4;--ag-pri:#1d5fa8;background:var(--ag-bg);padding:6px;box-sizing:border-box;display:flex;flex-direction:column;gap:6px;min-height:0;height:100%;font:12.5px/1.35 system-ui,Segoe UI,Arial,sans-serif;color:var(--ag-txt)}
  .ag[data-tema=escuro]{--ag-bg:#1b1c1f;--ag-txt:#e6e6e2;--ag-mut:#a4a59f;--ag-lin:#3b3d43;--ag-bar:#26282c;--ag-pri:#5aa2f0}
  .ag-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
  .ag-bar select{width:auto!important;max-width:210px;flex:0 0 auto}
  .ag-bar button,.ag-bar select{font:inherit;padding:5px 10px;border:1px solid var(--ag-lin);border-radius:6px;background:var(--ag-bar);color:var(--ag-txt);cursor:pointer;min-height:32px}
  .ag-bar button[aria-pressed=true]{background:var(--ag-pri);border-color:var(--ag-pri);color:#fff}
  .ag-bar button:focus-visible,.ag canvas:focus-visible{outline:2px solid var(--ag-pri);outline-offset:1px}
  .ag-bar .ag-sep{width:1px;align-self:stretch;background:var(--ag-lin)}
  .ag-leg{display:flex;flex-wrap:wrap;gap:4px 8px}
  .ag-leg button{display:inline-flex;gap:6px;align-items:center;font:inherit;padding:2px 8px;border:1px solid var(--ag-lin);border-radius:12px;background:transparent;color:var(--ag-txt);cursor:pointer}
  .ag-leg button[aria-pressed=false]{opacity:.4;text-decoration:line-through}
  .ag-leg i{display:inline-block;width:14px;height:0;border-top:3px solid}
  .ag-leg i.p{height:8px;border:0;background:currentColor;width:8px}
  .ag-cv{position:relative;flex:1 1 auto;min-height:260px;border:1px solid var(--ag-lin);border-radius:6px;background:var(--ag-bg);overflow:hidden;touch-action:none}
  .ag-cv canvas{position:absolute;inset:0;width:100%;height:100%;display:block;cursor:crosshair}
  .ag-cv.mover canvas{cursor:grab}.ag-cv.arrastando canvas{cursor:grabbing}
  .ag-tip{position:absolute;pointer-events:none;background:var(--ag-bg);color:var(--ag-txt);border:1px solid var(--ag-mut);border-radius:6px;padding:5px 8px;font-size:12px;box-shadow:0 3px 12px rgba(0,0,0,.25);white-space:nowrap;display:none;z-index:2;font-variant-numeric:tabular-nums}
  .ag-tip b{font-weight:700}
  .ag-est{overflow:auto;max-height:26vh;border:1px solid var(--ag-lin);border-radius:6px}
  .ag-est table{border-collapse:collapse;width:100%;font-size:12px;font-variant-numeric:tabular-nums}
  .ag-est th{position:sticky;top:0;background:var(--ag-bar);text-align:right;padding:3px 8px;border-bottom:1px solid var(--ag-lin);white-space:nowrap}
  .ag-est th:first-child,.ag-est td:first-child{text-align:left}
  .ag-est td{padding:3px 8px;text-align:right;border-bottom:1px solid var(--ag-lin)}
  .ag-est .ag-cap{padding:4px 8px;color:var(--ag-mut);text-align:left}
  .ag-ok{color:#2e9a5f}.ag-ruim{color:#d64545;font-weight:700}
  .ag-dica{color:var(--ag-mut);font-size:11.5px}
  @media (max-width:760px){.ag-bar button,.ag-bar select{min-height:40px}}
  `;
  function injetaCss() {
    if (document.getElementById('ag-css')) return;
    const s = document.createElement('style'); s.id = 'ag-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  /* -------------------------------------------------------------------------
     3) FÁBRICA DO ANALISADOR
     ------------------------------------------------------------------------- */
  function criar(op) {
    injetaCss();
    const fmtX = op.fmtX || fmtTempoPadrao;
    const raiz = op.montar;
    raiz.innerHTML = '';
    const el = document.createElement('div'); el.className = 'ag'; raiz.appendChild(el);
    el.innerHTML =
      '<div class="ag-bar" role="toolbar" aria-label="Controles do gráfico">' +
      '<button type="button" data-a="mover" aria-pressed="true" title="Arrastar move o gráfico no tempo">✋ Mover</button>' +
      '<button type="button" data-a="area" aria-pressed="false" title="Arrastar desenha um retângulo e aproxima nele">▭ Zoom de área</button>' +
      '<button type="button" data-a="mais" title="Aproximar (tecla +)">＋</button>' +
      '<button type="button" data-a="menos" title="Afastar (tecla −)">－</button>' +
      '<button type="button" data-a="tudo" title="Mostra o ensaio inteiro e solta o zoom vertical (duplo clique)">⤢ Ajustar tudo</button>' +
      '<span class="ag-sep"></span>' +
      '<button type="button" data-a="ant" title="Etapa anterior">◀ Etapa</button>' +
      '<select data-a="etapa" aria-label="Ir para a etapa"></select>' +
      '<button type="button" data-a="prox" title="Próxima etapa">Etapa ▶</button>' +
      '<span class="ag-sep"></span>' +
      '<button type="button" data-a="vivo" aria-pressed="true" title="Acompanha o fim do ensaio enquanto ele corre">● Ao vivo</button>' +
      '<select data-a="jan" aria-label="Largura da janela ao vivo" title="Quanto tempo mostrar enquanto acompanha ao vivo"><option value="0">Ensaio inteiro</option><option value="60">Últimos 1 min</option><option value="120">Últimos 2 min</option><option value="300">Últimos 5 min</option><option value="600">Últimos 10 min</option></select>' +
      '<button type="button" data-a="limpaAB" title="Remove os marcadores A e B">✕ A/B</button>' +
      '<button type="button" data-a="png" title="Salva a imagem do que está na tela">⬇ PNG</button>' +
      '</div>' +
      '<div class="ag-leg" aria-label="Legenda (clique para ocultar/mostrar)"></div>' +
      '<div class="ag-cv mover"><canvas tabindex="0" role="img" aria-label="Gráfico do ensaio. Setas movem, mais e menos aproximam, Home ajusta tudo."></canvas><div class="ag-tip" role="status"></div></div>' +
      '<div class="ag-est" aria-live="off"></div>' +
      '<div class="ag-dica">Roda do mouse = zoom no tempo · Shift + roda = zoom vertical da faixa · arrastar = mover · clique = marcador A, depois B · clique no título da faixa = foco nos dados · duplo clique = ajustar tudo</div>';

    const $ = s => el.querySelector(s);
    const cvBox = $('.ag-cv'), cv = cvBox.querySelector('canvas'), tip = $('.ag-tip'), estBox = $('.ag-est'), leg = $('.ag-leg'), selEt = $('[data-a=etapa]');

    /* ---- ESTADO ---- */
    const E = {
      D: null,                 // últimos dados entregues pelo hospedeiro
      x0: 0, x1: 60,           // janela visível (s)
      auto: true,              // true = mostra o ensaio inteiro; false = o operador escolheu a janela
      vivo: true,              // true = se a janela termina no fim dos dados, acompanha o fim
      modo: 'mover',           // 'mover' | 'area'
      yMan: {},                // trackId -> [min,max] escolhido à mão
      foco: new Set(),         // faixas em 'foco nos dados': o eixo Y ignora os limites de tolerância
      oculta: new Set(),       // séries ocultas pela legenda
      cursorT: null, cursorY: null, cursorTrack: null,
      A: null, B: null,        // marcadores (s)
      arraste: null, ponteiros: new Map(), pinca: null,
      janVivaL: 0,             // largura (s) da janela móvel 'últimos N min' (0 = ensaio inteiro)
      jaVista: new Set(),      // séries que já apareceram (para aplicar 'ocultaInicial' uma única vez)
      layout: [], dirty: true, ultimaAtual: 0, tMaxAnt: 0, assinatura: ''
    };

    const tema = () => (op.tema ? op.tema() : (document.documentElement.dataset.tema === 'escuro' ? 'escuro' : 'claro'));

    /* ---- PALETA POR TEMA (cores de texto/grade; as cores das SÉRIES vêm do hospedeiro) ---- */
    function paleta(t) {
      return t === 'escuro'
        ? { bg: '#1b1c1f', txt: '#c9cac5', mut: '#8e8f8a', g1: '#34363b', g2: '#2a2c30', moldura: '#6a6c72', cursor: '#e6e6e2', A: '#f1b81c', B: '#e0709a' }
        : { bg: '#ffffff', txt: '#444', mut: '#777', g1: '#e1e1dc', g2: '#eeeeea', moldura: '#999', cursor: '#222', A: '#b57a00', B: '#b0306a' };
    }
    const corSerie = (s, t) => (typeof s.cor === 'object' && s.cor ? (s.cor[t] || s.cor.claro) : s.cor);

    /* ---- DADOS ---- */
    function leDados() {
      E.D = op.dados() || { tracks: [] };
      const D = E.D;
      D.tMax = Math.max(10, D.tMax || 0);
      // Se a lista de séries/etapas mudou, refaz legenda e seletor de etapas.
      const ass = D.tracks.map(t => t.id + ':' + t.series.map(s => s.id).join(',')).join('|') + '#' + (D.etapas || []).length;
      if (ass !== E.assinatura) {
        E.assinatura = ass;
        // Séries marcadas 'ocultaInicial' (ex.: as 3 fases, para não poluir) começam ocultas SÓ na primeira vez;
        // depois vale sempre a escolha do operador na legenda.
        D.tracks.forEach(tr => tr.series.forEach(s => { if (s.ocultaInicial && !E.jaVista.has(s.id)) E.oculta.add(s.id); E.jaVista.add(s.id); }));
        montaLegenda(); montaEtapas();
      }
    }

    function montaLegenda() {
      leg.innerHTML = '';
      (E.D.tracks || []).forEach(tr => tr.series.forEach(s => {
        const b = document.createElement('button'); b.type = 'button';
        b.setAttribute('aria-pressed', E.oculta.has(s.id) ? 'false' : 'true');
        const t = tema(), cor = corSerie(s, t);
        b.innerHTML = '<i class="' + (s.tipo === 'pontos' ? 'p' : '') + '" style="border-color:' + cor + ';color:' + cor + '"></i>' + s.nome;
        b.onclick = () => { if (E.oculta.has(s.id)) E.oculta.delete(s.id); else E.oculta.add(s.id); b.setAttribute('aria-pressed', E.oculta.has(s.id) ? 'false' : 'true'); marca(); };
        leg.appendChild(b);
      }));
    }
    function montaEtapas() {
      selEt.innerHTML = '<option value="">Ir para a etapa…</option>';
      (E.D.etapas || []).forEach((e, i) => { const o = document.createElement('option'); o.value = i; o.textContent = (i + 1) + ' · ' + e.rotulo; selEt.appendChild(o); });
      selEt.style.display = (E.D.etapas || []).length ? '' : 'none';
    }

    /* ---- JANELA (zoom/pan) ---- */
    const larguraMin = () => Math.max(2, (E.D.tMax || 60) / 2000); // não deixa aproximar além do razoável
    function aplicaJanela(x0, x1, manterJan) {
      if (!manterJan) E.janVivaL = 0;      // o operador mexeu na janela à mão: sai do modo 'últimos N min'
      const T = E.D.tMax || 60, minL = larguraMin();
      let L = Math.max(minL, x1 - x0);
      L = Math.min(L, T * 1.2);
      if (x0 < -0.02 * T) { x0 = -0.02 * T; }
      x1 = x0 + L;
      if (x1 > T * 1.02 && x0 > 0) { x1 = T * 1.02; x0 = x1 - L; if (x0 < 0) x0 = 0; }
      E.x0 = x0; E.x1 = x1; E.auto = false;
      E.vivo = (E.x1 >= T - L * 0.02);     // se o operador deixou o fim visível, continua acompanhando
      sincBotoes(); marca();
    }
    function ajustaTudo() { E.auto = true; E.vivo = true; E.yMan = {}; E.foco.clear(); sincBotoes(); marca(); }
    function zoomX(fator, centroT) {
      if (E.auto) { E.x0 = 0; E.x1 = E.D.tMax; }
      const c = centroT != null ? centroT : (E.x0 + E.x1) / 2;
      aplicaJanela(c - (c - E.x0) * fator, c + (E.x1 - c) * fator);
    }
    function irParaEtapa(i) {
      const e = (E.D.etapas || [])[i]; if (!e) return;
      const m = Math.max(2, (e.t1 - e.t0) * 0.06);
      aplicaJanela(e.t0 - m, e.t1 + m);
    }
    function etapaAtualIdx() {
      const c = (E.x0 + E.x1) / 2, et = E.D.etapas || [];
      for (let i = 0; i < et.length; i++) if (c >= et[i].t0 && c <= et[i].t1) return i;
      return -1;
    }
    function sincBotoes() {
      $('[data-a=mover]').setAttribute('aria-pressed', E.modo === 'mover');
      $('[data-a=area]').setAttribute('aria-pressed', E.modo === 'area');
      $('[data-a=vivo]').setAttribute('aria-pressed', E.vivo);
      cvBox.classList.toggle('mover', E.modo === 'mover');
    }

    /* ---- MARGENS (px CSS). O retângulo de cada faixa é calculado dentro de desenha(). ---- */
    const ML = 58, MR = 14, MT = 8, MB = 30, GAP = 8;

    /** Janela X efetiva (modo 'tudo' ou escolhida). */
    function janela() {
      if (E.auto) return [0, Math.max(10, E.D.tMax)];
      return [E.x0, E.x1];
    }

    /** Escala Y da faixa: manual > fixa > automática sobre os dados visíveis. */
    function escalaY(tr, t0, t1) {
      if (E.yMan[tr.id]) return E.yMan[tr.id];
      let lo = Infinity, hi = -Infinity;
      const inclui = v => { if (v != null && isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v; } };
      if (tr.y && tr.y.fixo && E.auto && !E.foco.has(tr.id)) return tr.y.fixo.slice();
      tr.series.forEach(s => {
        if (E.oculta.has(s.id)) return;
        const d = s.dados;
        for (let i = Math.max(0, primeiroIdx(d, t0) - 1); i < d.length && d[i][0] <= t1 + 1e-9; i++) inclui(d[i][1]);
      });
      // Faixas de tolerância entram na escala: o operador precisa ver o LIMITE junto com o dado.
      // Exceção: 'foco nos dados' (clique no título da faixa) — útil quando a tolerância é bem maior que a oscilação real.
      if (!E.foco.has(tr.id)) {
        (tr.bandas || []).forEach(b => { if (b.x1 >= t0 && b.x0 <= t1) { inclui(b.y0); inclui(b.y1); } });
        (tr.linhasH || []).forEach(l => inclui(l.y));
      }
      if (!isFinite(lo)) return (tr.y && tr.y.fixo) ? tr.y.fixo.slice() : [0, 1];
      const minSpan = (tr.y && tr.y.spanMin) || 1e-6;
      let span = Math.max(hi - lo, minSpan);
      const pad = span * 0.08;
      const mid = (hi + lo) / 2;
      span = Math.max(span + 2 * pad, minSpan);
      return [mid - span / 2, mid + span / 2];
    }

    /* ---------------------------------------------------------------------
       DESENHO — função única usada na tela e na exportação PNG
       --------------------------------------------------------------------- */
    function desenha(ctx, W, H, t, opts) {
      opts = opts || {};
      const P = paleta(t), D = E.D;
      // Na tela, o hospedeiro pode definir as cores da página (--ag-bg, --ag-txt, --ag-mut, --ag-lin): o canvas segue a página.
      // Por quê: assim o gráfico não "destoa" do resto da janela em tema claro/escuro. A exportação PNG ignora isso (sempre claro).
      if (!opts.png) {
        const cs = getComputedStyle(el), v = n => cs.getPropertyValue(n).trim();
        if (v('--ag-bg')) P.bg = v('--ag-bg'); if (v('--ag-txt')) P.txt = v('--ag-txt'); if (v('--ag-mut')) P.mut = v('--ag-mut');
        if (v('--ag-lin')) { P.g1 = v('--ag-lin'); P.g2 = v('--ag-lin'); P.moldura = v('--ag-lin'); }
      }
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      const [t0, t1] = janela();
      const topo = opts.titulo ? 54 : 0;
      if (topo) { ctx.fillStyle = P.txt; ctx.font = 'bold 18px system-ui,Arial'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(opts.titulo, ML, 20); ctx.font = '12px system-ui,Arial'; ctx.fillStyle = P.mut; ctx.fillText(new Date().toLocaleString('pt-BR') + ' · janela ' + fmtX(t0) + ' → ' + fmtX(t1), ML, 40); }
      // Layout dentro da área abaixo do título
      const salvo = E.layout;
      const trs = D.tracks || [];
      const soma = trs.reduce((a, q) => a + (q.peso || 1), 0) || 1;
      const alt = H - topo - MT - MB - GAP * Math.max(0, trs.length - 1);
      let yy = topo + MT;
      const lay = trs.map(q => { const h = Math.max(40, alt * (q.peso || 1) / soma); const r = { tr: q, x: ML, y: yy, w: W - ML - MR, h }; yy += h + GAP; return r; });
      if (!opts.png) E.layout = lay;
      const X = tt => ML + (tt - t0) / (t1 - t0) * (W - ML - MR);
      const px = tt => X(tt) - ML;
      ctx.textBaseline = 'middle';

      lay.forEach((r, k) => {
        const tr = r.tr, [y0, y1] = escalaY(tr, t0, t1);
        const Y = v => r.y + r.h - (v - y0) / (y1 - y0 || 1) * r.h;
        r.y0 = y0; r.y1 = y1;
        ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
        // faixas verticais globais (ajuste/estabilização/pausa)
        (D.faixasX || []).forEach(f => { ctx.fillStyle = f.cor; ctx.fillRect(X(f.t0), r.y, Math.max(1, X(f.t1) - X(f.t0)), r.h); });
        // etapas: fundo alternado leve para localizar o degrau
        (D.etapas || []).forEach((e, i) => { if (i % 2) { ctx.fillStyle = t === 'escuro' ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.03)'; ctx.fillRect(X(e.t0), r.y, X(e.t1) - X(e.t0), r.h); } });
        // grade horizontal
        const pas = passoBonito(y1 - y0, Math.max(2, Math.floor(r.h / 34)));
        ctx.lineWidth = 1; ctx.strokeStyle = P.g1;
        for (let v = Math.ceil(y0 / pas) * pas; v <= y1 + 1e-9; v += pas) { ctx.beginPath(); ctx.moveTo(r.x, Math.round(Y(v)) + .5); ctx.lineTo(r.x + r.w, Math.round(Y(v)) + .5); ctx.stroke(); }
        // grade vertical (tempo)
        const pt = passoTempo(t1 - t0, Math.max(3, Math.floor(r.w / 90)));
        ctx.strokeStyle = P.g2;
        for (let tt = Math.ceil(t0 / pt) * pt; tt <= t1; tt += pt) { ctx.beginPath(); ctx.moveTo(Math.round(X(tt)) + .5, r.y); ctx.lineTo(Math.round(X(tt)) + .5, r.y + r.h); ctx.stroke(); }
        // bandas de tolerância
        (tr.bandas || []).forEach(b => { ctx.fillStyle = b.cor; ctx.fillRect(X(b.x0), Y(b.y1), Math.max(1, X(b.x1) - X(b.x0)), Math.max(1, Y(b.y0) - Y(b.y1))); });
        // limites tracejados
        (tr.linhasH || []).forEach(l => { ctx.save(); ctx.setLineDash([6, 4]); ctx.strokeStyle = l.cor; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(r.x, Y(l.y)); ctx.lineTo(r.x + r.w, Y(l.y)); ctx.stroke(); ctx.restore(); });
        // marcos (manobras etc.)
        (D.marcos || []).forEach(m => { if (m.t < t0 || m.t > t1) return; ctx.strokeStyle = 'rgba(217,119,6,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(m.t), r.y); ctx.lineTo(X(m.t), r.y + r.h); ctx.stroke(); });
        // séries
        tr.series.forEach(s => {
          if (E.oculta.has(s.id)) return;
          const dd = decimar(s.dados, t0, t1, px, Math.max(1, Math.floor(r.w)));
          ctx.strokeStyle = ctx.fillStyle = corSerie(s, t);
          ctx.lineWidth = s.largura || 1.8; ctx.lineJoin = 'round';
          if (s.tipo === 'pontos') {
            dd.forEach(p => { if (p[1] != null) ctx.fillRect(X(p[0]) - 1.5, Y(p[1]) - 1.5, 3, 3); });
          } else {
            ctx.beginPath(); let on = false, ult = null;
            dd.forEach(p => {
              if (p[1] == null) { on = false; ult = null; return; }
              const x = X(p[0]), y = Y(p[1]);
              if (!on) { ctx.moveTo(x, y); on = true; }
              else if (s.tipo === 'degrau') { ctx.lineTo(x, ult); ctx.lineTo(x, y); }
              else ctx.lineTo(x, y);
              ult = y;
            });
            ctx.stroke();
          }
        });
        ctx.restore();
        // moldura, rótulos de Y e título da faixa
        ctx.strokeStyle = P.moldura; ctx.lineWidth = 1; ctx.strokeRect(r.x + .5, r.y + .5, r.w - 1, r.h - 1);
        ctx.fillStyle = P.txt; ctx.font = '11px system-ui,Arial'; ctx.textAlign = 'right';
        const dec = tr.dec == null ? (pas < 1 ? 2 : pas < 10 ? 1 : 0) : tr.dec;
        for (let v = Math.ceil(y0 / pas) * pas; v <= y1 + 1e-9; v += pas) ctx.fillText(nb(v, Math.max(dec, pas < 1 ? 2 : 0)), r.x - 6, Y(v));
        ctx.textAlign = 'left'; ctx.font = 'bold 11px system-ui,Arial'; ctx.fillStyle = P.txt;
        ctx.fillText(tr.titulo + (tr.unidade ? ' (' + tr.unidade + ')' : '') + (E.yMan[tr.id] ? '  · Y manual' : '') + (E.foco.has(tr.id) ? '  · foco nos dados' : ''), r.x + 6, r.y + 11);
        // rótulos das bandas/linhas (uma vez, à direita, só se couber)
        ctx.font = '10.5px system-ui,Arial'; ctx.textAlign = 'right'; ctx.fillStyle = P.mut;
        (tr.linhasH || []).forEach(l => { if (l.rotulo && Y(l.y) > r.y + 10 && Y(l.y) < r.y + r.h - 4) ctx.fillText(l.rotulo, r.x + r.w - 5, Y(l.y) - 5); });
      });

      // eixo X (rótulos no rodapé, uma vez)
      if (lay.length) {
        const ult = lay[lay.length - 1], base = ult.y + ult.h;
        ctx.fillStyle = P.txt; ctx.font = '11px system-ui,Arial'; ctx.textAlign = 'center';
        const pt = passoTempo(t1 - t0, Math.max(3, Math.floor((W - ML - MR) / 90)));
        for (let tt = Math.ceil(t0 / pt) * pt; tt <= t1; tt += pt) ctx.fillText(fmtX(tt), X(tt), base + 12);
        ctx.fillStyle = P.mut; ctx.fillText(op.rotuloX || 'Tempo (mm:ss)', ML + (W - ML - MR) / 2, base + 25);
        // rótulos das etapas no topo da primeira faixa
        const r0 = lay[0]; ctx.font = '10.5px system-ui,Arial'; ctx.textAlign = 'center'; ctx.fillStyle = P.mut;
        (D.etapas || []).forEach((e, i) => { const xa = Math.max(X(e.t0), r0.x), xb = Math.min(X(e.t1), r0.x + r0.w); if (xb - xa > 34) ctx.fillText(e.rotulo, (xa + xb) / 2, r0.y + 22); });
      }

      // marcadores A/B e cursor
      const risco = (tt, cor, rot) => {
        if (tt == null || tt < t0 || tt > t1) return;
        lay.forEach(r => { ctx.strokeStyle = cor; ctx.lineWidth = 1.4; ctx.setLineDash(rot ? [] : [3, 3]); ctx.beginPath(); ctx.moveTo(X(tt), r.y); ctx.lineTo(X(tt), r.y + r.h); ctx.stroke(); ctx.setLineDash([]); });
        if (rot && lay.length) { ctx.fillStyle = cor; ctx.font = 'bold 12px system-ui,Arial'; ctx.textAlign = 'center'; ctx.fillText(rot, X(tt), lay[0].y + lay[0].h - 8); }
      };
      risco(E.A, P.A, 'A'); risco(E.B, P.B, 'B');
      if (!opts.png) {
        risco(E.cursorT, P.cursor, null);
        if (E.arraste && E.arraste.tipo === 'area') {
          const a = E.arraste; ctx.fillStyle = 'rgba(47,127,216,.18)'; ctx.strokeStyle = '#2f7fd8';
          ctx.fillRect(Math.min(a.px0, a.px1), lay.length ? lay[0].y : 0, Math.abs(a.px1 - a.px0), (lay.length ? lay[lay.length - 1].y + lay[lay.length - 1].h - lay[0].y : H));
          ctx.strokeRect(Math.min(a.px0, a.px1) + .5, lay.length ? lay[0].y : 0, Math.abs(a.px1 - a.px0), (lay.length ? lay[lay.length - 1].y + lay[lay.length - 1].h - lay[0].y : H));
        }
      }
    }

    /* ---------------------------------------------------------------------
       REDESENHO COM LIMITE DE TAXA
       --------------------------------------------------------------------- */
    function marca() { E.dirty = true; if (!E.rafId) E.rafId = requestAnimationFrame(quadro); }
    function quadro() {
      E.rafId = 0; if (!E.dirty) return; E.dirty = false;
      if (!E.D) return;
      const W = cv.clientWidth || 600, H = cv.clientHeight || 300, dpr = window.devicePixelRatio || 1;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      el.dataset.tema = tema();
      desenha(ctx, W, H, tema());
      tabela();
    }

    /* ---------------------------------------------------------------------
       TABELA DE ESTATÍSTICAS (janela visível ou intervalo A–B)
       --------------------------------------------------------------------- */
    function tabela() {
      const D = E.D; if (!D) return;
      let [t0, t1] = janela(), rotulo = 'Janela visível ' + fmtX(t0) + ' → ' + fmtX(t1);
      const temAB = E.A != null && E.B != null;
      if (temAB) { t0 = Math.min(E.A, E.B); t1 = Math.max(E.A, E.B); rotulo = 'Entre A e B: ' + fmtX(t0) + ' → ' + fmtX(t1) + ' (Δt ' + fmtX(t1 - t0) + ')'; }
      let h = '<table><thead><tr><th>Série</th><th>mín</th><th>média</th><th>máx</th><th>desvio-padrão</th><th>dentro da faixa</th>' + (E.A != null ? '<th>em A</th>' : '') + (E.B != null ? '<th>em B</th>' : '') + (temAB ? '<th>B − A</th>' : '') + '</tr></thead><tbody>';
      h += '<tr><td class="ag-cap" colspan="9">' + rotulo + '</td></tr>';
      (D.tracks || []).forEach(tr => tr.series.forEach(s => {
        if (E.oculta.has(s.id)) return;
        const st = estatistica(s, t0, t1), dec = tr.dec == null ? 1 : tr.dec;
        const vA = E.A != null ? valorEm(s, E.A) : null, vB = E.B != null ? valorEm(s, E.B) : null;
        const cls = st.dentro == null ? '' : (st.dentro >= 99.5 ? 'ag-ok' : 'ag-ruim');
        h += '<tr><td>' + s.nome + (tr.unidade ? ' (' + tr.unidade + ')' : '') + '</td>' +
          (st.n ? '<td>' + nb(st.min, dec) + '</td><td>' + nb(st.media, dec) + '</td><td>' + nb(st.max, dec) + '</td><td>' + nb(st.dp, Math.max(dec, 2)) + '</td><td class="' + cls + '">' + (st.dentro == null ? '—' : nb(st.dentro, 1) + ' %') + '</td>' : '<td colspan="5">sem dados na janela</td>') +
          (E.A != null ? '<td>' + nb(vA, dec) + '</td>' : '') + (E.B != null ? '<td>' + nb(vB, dec) + '</td>' : '') +
          (temAB ? '<td>' + (vA != null && vB != null ? nb(vB - vA, dec) : '—') + '</td>' : '') + '</tr>';
      }));
      h += '</tbody></table>';
      if (estBox._h !== h) { estBox.innerHTML = h; estBox._h = h; }
    }
    function valorEm(s, t) { const i = maisProximo(s.dados, t); return i < 0 ? null : s.dados[i][1]; }

    /* ---------------------------------------------------------------------
       CURSOR E LEITURA (tooltip)
       --------------------------------------------------------------------- */
    function atualizaCursor(x, y) {
      const [t0, t1] = janela(), W = cv.clientWidth;
      const inside = x >= ML && x <= W - MR;
      if (!inside) { E.cursorT = null; tip.style.display = 'none'; marca(); return; }
      E.cursorT = t0 + (x - ML) / (W - ML - MR) * (t1 - t0);
      E.cursorTrack = (E.layout.find(r => y >= r.y && y <= r.y + r.h) || {}).tr || null;
      let h = '<b>' + fmtX(E.cursorT) + '</b>';
      if (op.dados && E.D.infoExtra) { const ex = E.D.infoExtra(E.cursorT); if (ex) h += ' · ' + ex; }
      (E.D.tracks || []).forEach(tr => tr.series.forEach(s => {
        if (E.oculta.has(s.id)) return;
        const i = maisProximo(s.dados, E.cursorT);
        if (i < 0 || s.dados[i][1] == null) return;
        // Não mostra valor de um ponto muito distante do cursor (série sem dado nesse trecho)
        if (Math.abs(s.dados[i][0] - E.cursorT) > Math.max(5, (t1 - t0) / 40)) return;
        h += '<br><span style="color:' + corSerie(s, tema()) + '">■</span> ' + s.nome + ': <b>' + nb(s.dados[i][1], tr.dec == null ? 1 : tr.dec) + '</b>' + (tr.unidade ? ' ' + tr.unidade : '');
      }));
      tip.innerHTML = h; tip.style.display = 'block';
      const bw = cvBox.clientWidth, tw = tip.offsetWidth;
      tip.style.left = Math.min(Math.max(4, x + 14), bw - tw - 4) + 'px';
      tip.style.top = Math.max(4, Math.min(y + 10, cvBox.clientHeight - tip.offsetHeight - 4)) + 'px';
      marca();
    }

    /* ---------------------------------------------------------------------
       ENTRADA: mouse, toque (pinça), teclado
       --------------------------------------------------------------------- */
    const posicao = ev => { const b = cv.getBoundingClientRect(); return [ev.clientX - b.left, ev.clientY - b.top]; };
    const tDoX = x => { const [t0, t1] = janela(); return t0 + (x - ML) / (cv.clientWidth - ML - MR) * (t1 - t0); };

    cv.addEventListener('pointerdown', ev => {
      cv.setPointerCapture(ev.pointerId);
      const [x, y] = posicao(ev);
      E.ponteiros.set(ev.pointerId, [x, y]);
      if (E.ponteiros.size === 2) { // gesto de pinça: guarda distância inicial
        const [a, b] = [...E.ponteiros.values()];
        E.pinca = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), x0: janela()[0], x1: janela()[1], c: tDoX((a[0] + b[0]) / 2) };
        E.arraste = null; return;
      }
      const [t0, t1] = janela();
      const modoArea = E.modo === 'area' || ev.shiftKey;
      E.arraste = { tipo: modoArea ? 'area' : 'mover', px0: x, px1: x, py0: y, xi: x, x0: t0, x1: t1, moveu: false };
      if (!modoArea) cvBox.classList.add('arrastando');
    });
    cv.addEventListener('pointermove', ev => {
      const [x, y] = posicao(ev);
      if (E.ponteiros.has(ev.pointerId)) E.ponteiros.set(ev.pointerId, [x, y]);
      if (E.pinca && E.ponteiros.size === 2) {
        const [a, b] = [...E.ponteiros.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        const f = E.pinca.d / Math.max(10, d), c = E.pinca.c;
        aplicaJanela(c - (c - E.pinca.x0) * f, c + (E.pinca.x1 - c) * f); return;
      }
      const a = E.arraste;
      if (a) {
        if (Math.abs(x - a.xi) > 3) a.moveu = true;
        if (a.tipo === 'mover') {
          const dt = (x - a.xi) / (cv.clientWidth - ML - MR) * (a.x1 - a.x0);
          aplicaJanela(a.x0 - dt, a.x1 - dt);
        } else { a.px1 = x; marca(); }
      }
      atualizaCursor(x, y);
    });
    const fim = ev => {
      E.ponteiros.delete(ev.pointerId);
      if (E.ponteiros.size < 2) E.pinca = null;
      const a = E.arraste; E.arraste = null; cvBox.classList.remove('arrastando');
      if (!a) return;
      if (a.tipo === 'area' && Math.abs(a.px1 - a.px0) > 8) {
        const ta = tDoX(a.px0), tb = tDoX(a.px1); aplicaJanela(Math.min(ta, tb), Math.max(ta, tb));
      } else if (!a.moveu) { // clique simples
        // Clique no TÍTULO da faixa = alterna 'foco nos dados' (ignora/inclui os limites no eixo Y)
        const rt = E.layout.find(q => a.py0 >= q.y && a.py0 <= q.y + 16 && a.xi >= q.x && a.xi <= q.x + 280);
        if (rt) { if (E.foco.has(rt.tr.id)) E.foco.delete(rt.tr.id); else E.foco.add(rt.tr.id); marca(); return; }
        // senão: marcador A, depois B, depois recomeça
        const t = tDoX(a.xi);
        // Espera 260 ms: se vier um 2º clique (duplo clique = "ajustar tudo") NÃO deve deixar marcadores A/B para trás.
        clearTimeout(E.timerClique);
        E.timerClique = setTimeout(() => {
          if (E.A == null || (E.A != null && E.B != null)) { E.A = t; E.B = null; } else { E.B = t; }
          marca();
        }, 260);
      }
      marca();
    };
    cv.addEventListener('pointerup', fim);
    cv.addEventListener('pointercancel', fim);
    cv.addEventListener('pointerleave', () => { if (!E.arraste) { E.cursorT = null; tip.style.display = 'none'; marca(); } });
    cv.addEventListener('dblclick', () => { clearTimeout(E.timerClique); ajustaTudo(); });
    cv.addEventListener('wheel', ev => {
      ev.preventDefault(); // por quê: a roda deve aproximar o gráfico, não rolar a página/diálogo
      const [x, y] = posicao(ev), f = ev.deltaY < 0 ? 1 / 1.18 : 1.18;
      if (ev.shiftKey) { // zoom vertical só da faixa sob o cursor
        const r = E.layout.find(q => y >= q.y && y <= q.y + q.h); if (!r) return;
        const [a, b] = E.yMan[r.tr.id] || [r.y0, r.y1];
        const v = r.y1 - (y - r.y) / r.h * (r.y1 - r.y0);   // valor sob o cursor
        E.yMan[r.tr.id] = [v - (v - a) * f, v + (b - v) * f]; marca();
      } else zoomX(f, tDoX(x));
    }, { passive: false });
    cv.addEventListener('keydown', ev => {
      const [t0, t1] = janela(), L = t1 - t0;
      if (ev.key === 'ArrowLeft') { aplicaJanela(t0 - L * .2, t1 - L * .2); ev.preventDefault(); }
      else if (ev.key === 'ArrowRight') { aplicaJanela(t0 + L * .2, t1 + L * .2); ev.preventDefault(); }
      else if (ev.key === '+' || ev.key === '=') { zoomX(1 / 1.4); ev.preventDefault(); }
      else if (ev.key === '-') { zoomX(1.4); ev.preventDefault(); }
      else if (ev.key === 'Home') { ajustaTudo(); ev.preventDefault(); }
      else if (ev.key === 'End') { aplicaJanela((E.D.tMax) - L, E.D.tMax); ev.preventDefault(); }
    });

    /* ---- barra de botões ---- */
    el.querySelector('.ag-bar').addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b) return;
      const a = b.dataset.a;
      if (a === 'mover' || a === 'area') { E.modo = a; sincBotoes(); }
      else if (a === 'mais') zoomX(1 / 1.5);
      else if (a === 'menos') zoomX(1.5);
      else if (a === 'tudo') ajustaTudo();
      else if (a === 'ant') { const i = etapaAtualIdx(); irParaEtapa(Math.max(0, (i < 0 ? 1 : i) - 1)); }
      else if (a === 'prox') { const i = etapaAtualIdx(); irParaEtapa(Math.min((E.D.etapas || []).length - 1, i + 1)); }
      else if (a === 'vivo') { E.vivo = !E.vivo; if (E.vivo && !E.auto) { const L = E.x1 - E.x0; aplicaJanela(E.D.tMax - L, E.D.tMax); E.vivo = true; } sincBotoes(); marca(); }
      else if (a === 'limpaAB') { E.A = E.B = null; marca(); }
      else if (a === 'png') exportaPng();
    });
    el.querySelector('[data-a=jan]').addEventListener('change', ev => {
      const L = +ev.target.value;
      if (!L) { E.janVivaL = 0; ajustaTudo(); return; }
      E.janVivaL = L; E.vivo = true; E.auto = false;
      const T = Math.max(E.D.tMax, L); E.x1 = T; E.x0 = T - L; sincBotoes(); marca();
    });
    selEt.addEventListener('change', () => { if (selEt.value !== '') irParaEtapa(+selEt.value); selEt.value = ''; });

    /* ---- exportação PNG: mesma função de desenho, sempre em tema claro (impressão) ---- */
    function geraCanvas() {   // v0.3: o PDF e o PNG usam o mesmo desenho (tema claro, 1600×900)
      const c = document.createElement('canvas'); c.width = 1600; c.height = 900;
      desenha(c.getContext('2d'), 1600, 900, 'claro', { png: true, titulo: op.titulo || 'Gráfico do ensaio' });
      return c;
    }
    function exportaPng() {
      const c = geraCanvas();
      c.toBlob(b => {
        const a = document.createElement('a'); a.href = URL.createObjectURL(b);
        a.download = (op.nomeArquivo || 'grafico_ensaio') + '_' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + '.png';
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }, 'image/png');
    }

    /* ---- redimensionamento ---- */
    const ro = new ResizeObserver(() => marca()); ro.observe(cvBox);

    /* ---- API pública ---- */
    function atualiza(forca) {
      const agora = performance.now();
      if (!forca && agora - E.ultimaAtual < 250) return;       // limite de taxa: 4 quadros/s bastam para dado de 0,4 s
      E.ultimaAtual = agora;
      leDados();
      const T = E.D.tMax;
      // "Ao vivo": se o operador aproximou mas deixou o fim visível, a janela anda junto com o fim.
      if (E.janVivaL > 0 && E.vivo) { E.auto = false; E.x1 = Math.max(T, E.janVivaL); E.x0 = E.x1 - E.janVivaL; }
      else if (!E.auto && E.vivo && T > E.tMaxAnt) { const L = E.x1 - E.x0; E.x1 = T; E.x0 = T - L; }
      E.tMaxAnt = T;
      marca();
    }
    function reseta() { E.janVivaL = 0; E.A = E.B = null; E.yMan = {}; E.foco.clear(); E.oculta.clear(); E.auto = true; E.vivo = true; E.assinatura = ''; E.tMaxAnt = 0; atualiza(true); }
    function destruir() { ro.disconnect(); if (E.rafId) cancelAnimationFrame(E.rafId); raiz.innerHTML = ''; }
    sincBotoes(); atualiza(true);
    // Expõe funções puras para teste automatizado (não usadas em produção).
    return { atualiza, reseta, destruir, png: exportaPng, canvas: geraCanvas, _estado: E, _irParaEtapa: irParaEtapa, _zoomX: zoomX, _ajustaTudo: ajustaTudo };
  }

  global.AnaliseGrafico = { criar, _util: { primeiroIdx, maisProximo, estatistica, decimar, passoBonito, passoTempo, fmtTempoPadrao } };
})(typeof window !== 'undefined' ? window : globalThis);
