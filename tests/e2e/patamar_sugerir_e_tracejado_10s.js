// Medidor 1.10.221: (a) Sugerir chaves fica bloqueado com o cronometro (Iniciar) ativo; (b) o tracejado some ~10 s DEPOIS que a carga chegou ao degrau; (c) o dialogo nao tem mais o botao Ligar/Desligar Patamar.
// Demo local, so BC56, 40 kW a 100 %, ensaio acelerado (10x). file://. Uso: node tests/e2e/patamar_sugerir_e_tracejado_10s.js (MEDIDOR=nome.html)
const { chromium } = require('playwright'); const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || require('../versoes.js').medidorAtual());
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1536, height: 900 } })).newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
  await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto('file://' + ARQ); await p.waitForTimeout(2200);
  await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(1500);
  const pot = () => p.evaluate(() => { const e = document.getElementById('dPot'); e.value = '40'; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }); await pot();
  await p.evaluate(() => document.getElementById('mAuto') && document.getElementById('mAuto').click()); await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('bPatDet').click()); await p.waitForTimeout(400);
  await p.evaluate(() => { const c = [...document.querySelectorAll('input[data-gd=u]')].find(e => e.dataset.bk === '400' || /BC400/.test(e.closest('label') ? e.closest('label').textContent : '')); if (c && c.checked) c.click(); });
  await p.evaluate(() => window.__setSalvaModo('P')); await p.waitForTimeout(500);
  await p.evaluate(() => { const v = document.querySelector('#velSeg [data-v="10"]'); v && v.click(); });
  // (c) o botao Ligar/Desligar nao existe mais no dialogo
  await p.evaluate(() => document.getElementById('bGuiado').click()); await p.waitForTimeout(500);
  ok('dialogo sem botao Ligar/Desligar Patamar (so sinalizacao)', await p.evaluate(() => !document.querySelector('#dlgGuiado [data-gd=rodar]') && /Patamar: (On|Off)/.test(document.getElementById('dlgGuiado').textContent)));
  await p.evaluate(() => { const d = document.getElementById('dlgGuiado'); if (d && d.open) d.close(); });
  await p.evaluate(() => document.getElementById('bIni').click()); await p.waitForTimeout(800); await pot(); await p.evaluate(() => { const o = document.getElementById('dOk'); if (o && o.offsetParent) o.click(); }); await p.waitForTimeout(800);
  // (a) com o ensaio iniciado, Sugerir chaves e bloqueado e avisa
  await p.evaluate(() => document.getElementById('bGuiado').click()); await p.waitForTimeout(500);
  // pausado: o botao volta; retomando: desliga de novo
  await p.evaluate(() => document.getElementById('bPau').click()); await p.waitForTimeout(1300);
  ok('com o cronometro PAUSADO o botao Sugerir volta a funcionar', await p.evaluate(() => { const b = document.querySelector('#dlgGuiado [data-gd=sug]'); return !!b && !b.disabled && T.run === false; }));
  await p.evaluate(() => document.getElementById('bIni').click()); await p.waitForTimeout(1300);
  ok('retomando o cronometro o botao Sugerir desliga de novo', await p.evaluate(() => { const b = document.querySelector('#dlgGuiado [data-gd=sug]'); return !!b && b.disabled && T.run === true; }));
  await p.evaluate(() => { const d = document.getElementById('dlgGuiado'); if (d && d.open) d.close(); });
  // (b) degrau 30 % (10 s de ensaio = 1 s real no Demo a 10x): aplica a sugestao e acompanha o tracejado ate a carga chegar e passar 10 s
  let aplicou = false, tAplicou = 0, tBanda = 0, tSumiu = 0, tracejadoViu = false, antes10 = false;
  for (let i = 0; i < 160 && !tSumiu; i++) {
    await p.waitForTimeout(500);
    const s = await p.evaluate(() => ({ et: T.et, mae: GUIADO_MAE.estado, n: document.querySelectorAll('#bancos .tile.sug').length, c: carga, a: aplicarInfo().alvoPct, ap: APL_ET }));
    if (!aplicou && s.et === 1 && s.mae === 'AGUARDA_APLICAR') { await p.evaluate(() => GUIADO_DBG.aplica()); aplicou = true; tAplicou = Date.now(); continue; }
    if (process.env.DEBUG && aplicou) console.log('  amostra', i, JSON.stringify(s));
    if (!aplicou) continue;
    if (s.n > 0) tracejadoViu = true;
    const banda = 3, dentro = typeof s.c === 'number' && Math.abs(s.c - s.a) <= banda;
    if (dentro && !tBanda) tBanda = Date.now();
    if (!dentro) tBanda = 0;
    if (tracejadoViu && s.n === 0) { tSumiu = Date.now(); antes10 = tBanda && (tSumiu - tBanda) < 900;   /* 10 s de ensaio = 1 s real a 10x */ }
  }
  ok('logo depois do Aplicar o tracejado aparece', tracejadoViu);
  ok('o tracejado sumiu depois que a carga chegou ao degrau', tSumiu > 0 && tBanda > 0, 'dentro da banda ha ' + (tBanda ? Math.round((tSumiu - tBanda) / 1000) : '?') + ' s');
  ok('...e nao antes de ~10 s dentro da banda', tSumiu > 0 && !antes10);
  ok('sem erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | '));
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + R.filter(x => x).length + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
