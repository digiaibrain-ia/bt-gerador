// Medidor 1.10.219 (regra da 1.10.218 refinada): salvamento "Por patamar", patamar MANUAL: a etapa so conta tempo depois do Aplicar. Demo local, so BC56, 40 kW a 100 %, ensaio acelerado (10x).
// No degrau 107 % o operador NAO aplica por ~25 s: a etapa nao pode contar nem avancar. Depois aplica: o relogio solta e a etapa avanca. file://. Uso: node tests/e2e/patamar_manual_espera_aplicar.js (MEDIDOR=nome.html)
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
  await p.evaluate(() => document.getElementById('bIni').click()); await p.waitForTimeout(800); await pot(); await p.evaluate(() => { const o = document.getElementById('dOk'); if (o && o.offsetParent) o.click(); }); await p.waitForTimeout(800);
  const est = () => p.evaluate(() => ({ et: T.et, el: Math.round(T.el * 10) / 10, mae: GUIADO_MAE.estado, esp: !!(window.PATAMAR_AGUARDA_APLICAR && window.PATAMAR_AGUARDA_APLICAR()), kw100: GUIADO_DBG.G.kw100 }));
  let t107 = null, elAntes = 0, fase = 'espera', tFase = 0, avancou = false, completou = false, elHold = 0, fim = false;
  for (let i = 0; i < 700 && !fim; i++) {
    await p.waitForTimeout(500); const s = await est();
    if (s.et >= 1 && s.et <= 3 && s.mae === 'AGUARDA_APLICAR') await p.evaluate(() => GUIADO_DBG.aplica());   // 30, 50 e 100 %: aplica a sugestao
    if (s.et === 4) {
      if (fase === 'espera' && s.mae === 'AGUARDA_APLICAR') {            // 107 %: tira UMA chave de 4 kW da selecao, aplica (39 kW = 97,5 %) e NAO completa ainda
        await p.evaluate(() => { const g = GUIADO_DBG.G, kws = [5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 3]; const sel = g.sel['56']; const k = sel.findIndex((x, ix) => x && kws[ix] === 4); window.__chaveTirada = k; sel[k] = false; GUIADO_DBG.aplica(); });
        fase = 'aplicado-parcial'; tFase = Date.now(); }
      else if (fase === 'aplicado-parcial') {
        elHold = Math.max(elHold, s.el);
        if (Date.now() - tFase > 20000) { await p.evaluate(() => { const t = document.querySelector('#bancos .tile[data-i="' + window.__chaveTirada + '"]'); t && t.click(); }); fase = 'completou'; completou = true; }
      }
    }
    if (s.et >= 5) { if (fase !== 'completou') avancou = true; fim = true; }
  }
  const s0 = await est();
  ok('kW a 100 % = 40 (preparo do teste)', s0.kw100 === 40, JSON.stringify(s0));
  ok('107 %: aplicou com 39 kW (97,5 %) e a carga ainda nao chegou: o relogio NAO contou (max ' + elHold + ' s em 20 s reais = 200 s de ensaio)', elHold < 1 && !avancou, 'avancou antes de completar: ' + avancou);
  ok('depois de clicar na chave que faltava (a carga chegou ao degrau) o relogio solta e a etapa avanca', completou && fim && !avancou, 'completou=' + completou + ' fim=' + fim);
  ok('sem erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | '));
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + R.filter(x => x).length + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
