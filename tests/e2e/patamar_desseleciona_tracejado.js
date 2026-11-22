// Medidor (1.10.221 ou o nome em MEDIDOR): o operador DESMARCA uma chave no degrau e clica de novo nela. A chave tem de voltar a ficar
// TRACEJADA (sugerida) e com a sinalizacao de ligada. Demo, so BC56, 40 kW a 100 %. Uso: node tests/e2e/patamar_desseleciona_tracejado.js (MEDIDOR=nome.html)
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
  // chega ao degrau 107 % com o operador esperando o Aplicar (mesmo caminho do teste patamar_manual_espera_aplicar)
  for (let i = 0; i < 200; i++) { await p.waitForTimeout(500); const s = await p.evaluate(() => ({ et: T.et, mae: GUIADO_MAE.estado })); if (s.et >= 1 && s.et <= 3 && s.mae === 'AGUARDA_APLICAR') await p.evaluate(() => GUIADO_DBG.aplica()); if (s.et === 4 && s.mae === 'AGUARDA_APLICAR') break; }
  await p.evaluate(() => GUIADO_DBG.aplica()); await p.waitForTimeout(600);
  // escolhe uma chave de 4 kW que esteja ligada no degrau e a DESMARCA clicando na propria chave (como o operador)
  const k = await p.evaluate(() => { const g = GUIADO_DBG.G, sel = g.sel['56']; const kws = [5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 3]; return sel.findIndex((x, ix) => x && kws[ix] === 4); });
  ok('ha uma chave de 4 kW selecionada no degrau (preparo)', k >= 0, 'indice ' + k);
  const estado = () => p.evaluate(i => { const t = document.querySelector('#bancos .tile[data-i="' + i + '"]'); return t ? { sug: t.classList.contains('sug'), on: t.classList.contains('on') || t.classList.contains('ligado') || t.classList.contains('lig'), classes: t.className } : null; }, k);
  await p.locator('#bancos .tile[data-i="' + k + '"]').click(); await p.waitForTimeout(500);
  const apos1 = await estado();
  ok('desmarcada: sem tracejado', apos1 && !apos1.sug, JSON.stringify(apos1));
  await p.locator('#bancos .tile[data-i="' + k + '"]').click(); await p.waitForTimeout(500);
  const apos2 = await estado();
  ok('marcada de novo: volta o tracejado (sug)', apos2 && apos2.sug, JSON.stringify(apos2));
  ok('sem erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | '));
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + R.filter(x => x).length + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
