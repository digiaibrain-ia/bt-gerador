// Medidor 1.10.213: card MODO discreto (so CSS). Compara com a versao anterior (1.10.212): menos altura, sem estouro lateral, tudo legivel, baloes e ids intactos.
// file://. Uso: node tests/e2e/modo_discreto.js (MEDIDOR=nome.html ANTES=nome.html SHOTS=pasta)
const { chromium } = require('playwright'); const path = require('path');
const D = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas');
const NOVO = path.join(D, process.env.MEDIDOR || 'medidor_gerador_v1.10.213.html'), ANTES = path.join(D, process.env.ANTES || 'medidor_gerador_v1.10.212.html'); const SHOTS = process.env.SHOTS || '';
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
const medida = p => p.evaluate(() => { const c = document.getElementById('modoCard'), r = c.getBoundingClientRect();
  return { h: Math.round(r.height), w: Math.round(r.width), estoura: c.scrollWidth > c.clientWidth + 1 || document.documentElement.scrollWidth > innerWidth + 1,
    lk: [...c.querySelectorAll('.lk')].map(e => ({ t: e.innerText.replace(/\s+/g, ' ').trim(), tip: e.dataset.tip || '', w: Math.round(e.getBoundingClientRect().width) })),
    cfg: [...c.querySelectorAll('.mdgrid .card')].map(e => ({ l: e.querySelector('.l').innerText, v: e.querySelector('.v').innerText.trim(), vis: e.getBoundingClientRect().width > 0 && e.querySelector('.v').getBoundingClientRect().width > 8, cortado: e.querySelector('.v').getBoundingClientRect().height > 2 * 16.5 })),
    ids: ['lkPlc', 'lkNr', 'lkHtml', 'mcFonte', 'mcTipo', 'mcSalva', 'mcNode', 'mcGra', 'mcVisao'].every(i => document.getElementById(i)) }; });
(async () => {
  const b = await chromium.launch();
  for (const [nome, vp, mobile] of [['celular 390', { width: 390, height: 844 }, true], ['desktop 1280', { width: 1280, height: 800 }, false]]) {
    console.log('\n## ' + nome); const k = nome.split(' ')[0]; const res = {};
    for (const [rot, arq] of [['antes', ANTES], ['agora', NOVO]]) {
      const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 2 }); const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
      await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto('file://' + arq); await p.waitForTimeout(2500);
      res[rot] = await medida(p); res[rot].erros = erros;
      if (SHOTS) await (await p.$('#modoCard')).screenshot({ path: SHOTS + '/modo_' + k + '_' + rot + '.png' });
      await ctx.close();
    }
    const a = res.antes, n = res.agora;
    ok('o card ficou mais baixo (' + a.h + ' -> ' + n.h + ' px)', n.h < a.h * 0.97);
    ok('sem estouro lateral', !n.estoura);
    ok('os 3 indicadores de comunicacao seguem la, com nome e estado, e o balao (data-tip) preservado', n.lk.length === 3 && n.lk.every(x => x.t.length > 4 && x.w > 30) && n.lk.map(x => x.tip.slice(0, 30)).join('|') === a.lk.map(x => x.tip.slice(0, 30)).join('|') && n.lk.every(x => x.tip.length > 20), n.lk.map(x => x.t).join(' / '));
    ok('as 6 configuracoes seguem la, com os mesmos valores, visiveis e sem corte', n.cfg.length === 6 && n.cfg.every(x => x.vis && x.v.length > 0) && JSON.stringify(n.cfg.map(x => [x.l, x.v])) === JSON.stringify(a.cfg.map(x => [x.l, x.v])), n.cfg.map(x => x.l + '=' + x.v).join(' | '));
    ok('nenhum valor com mais de 2 linhas (nada escondido)', n.cfg.every(x => !x.cortado), n.cfg.filter(x => x.cortado).map(x => x.l).join(','));
    ok('todos os ids do card existem', n.ids);
    ok('sem erro de JavaScript', n.erros.length === 0, n.erros.slice(0, 2).join(' | '));
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + R.filter(x => x).length + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
