// Matriz dos MODOS DE OPERACAO (Demo local, so BC56, 40 kW a 100 %, ensaio a 10x): Salvamento (Manual / Automatico / Por patamar) x Operador (Manual / Auto).
// Para cada combinacao observa 40 s apos INICIAR e registra: estado da Mae, se as chaves entraram sozinhas, se a etapa avancou sozinha, se precisou clicar Aplicar/Salvar. NAO afirma o "certo": gera a tabela para revisao.
// Uso: node tests/e2e/modos_operacao_matriz.js [saida.json]   (MEDIDOR=nome.html)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || require('../versoes.js').medidorAtual());
const KW = [5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 3];
(async () => {
  const b = await chromium.launch(); const out = [];
  for (const salva of ['M', 'A', 'P']) for (const op of ['Manual', 'Auto']) {
    const p = await (await b.newContext({ viewport: { width: 1536, height: 900 } })).newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
    await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto('file://' + ARQ); await p.waitForTimeout(2000);
    await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(1200);
    const pot = () => p.evaluate(() => { const e = document.getElementById('dPot'); e.value = '40'; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }); await pot();
    if (op === 'Auto') await p.evaluate(() => document.getElementById('mAuto') && document.getElementById('mAuto').click()); else await p.evaluate(() => document.getElementById('mManual') && document.getElementById('mManual').click());
    await p.waitForTimeout(400); await p.evaluate(() => document.getElementById('bPatDet').click()); await p.waitForTimeout(300);
    await p.evaluate(() => { const c = [...document.querySelectorAll('input[data-gd=u]')].find(e => e.dataset.bk === '400' || /BC400/.test(e.closest('label') ? e.closest('label').textContent : '')); if (c && c.checked) c.click(); });
    await p.evaluate(m => window.__setSalvaModo(m), salva); await p.waitForTimeout(500);
    await p.evaluate(() => { const v = document.querySelector('#velSeg [data-v="10"]'); v && v.click(); });
    const cfg = await p.evaluate(() => ({ porpat: !!PORPAT, salvarManual: !!salvarManual, guiadoOn: !!GUIADO_DBG.G.guiadoOn }));
    await p.evaluate(() => document.getElementById('bIni').click()); await p.waitForTimeout(800); await pot(); await p.evaluate(() => { const o = document.getElementById('dOk'); if (o && o.offsetParent) o.click(); }); await p.waitForTimeout(800);
    const obs = { salva, op, cfg, maes: new Set(), etMax: 0, kwMax: 0, aguardaSalvar: false, aguardaAplicar: false, chavesSozinhas: false, relogioMax: 0, erros };
    for (let i = 0; i < 160; i++) {
      await p.waitForTimeout(250);
      const s = await p.evaluate(kws => ({ et: T.et, run: !!T.run, started: !!T.started, aguarda: !!T.aguarda, el: T.el, mae: GUIADO_MAE.estado, kw: kws.reduce((a, k, ix) => { const e = document.querySelector('#bancos .tile[data-i="' + ix + '"]'); return a + (e && (e.classList.contains('cmd') || e.classList.contains('s1')) ? k : 0); }, 0), apl: !!(window.PATAMAR_AGUARDA_APLICAR && window.PATAMAR_AGUARDA_APLICAR()) }), KW);
      obs.maes.add(s.mae); obs.etMax = Math.max(obs.etMax, s.et); obs.kwMax = Math.max(obs.kwMax, s.kw); if (s.aguarda) obs.aguardaSalvar = true; if (s.apl) obs.aguardaAplicar = true; if (s.et >= 1 && s.kw > 0) obs.chavesSozinhas = true; obs.relogioMax = Math.max(obs.relogioMax, s.el);
    }
    obs.maes = [...obs.maes]; out.push(obs); await p.close(); console.log(salva + '/' + op, JSON.stringify(obs));
  }
  await b.close(); if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
})();
