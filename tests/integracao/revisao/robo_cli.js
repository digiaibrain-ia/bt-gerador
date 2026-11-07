// CLI do Dev/Operador oculto: node robo_cli.js <avancado|monkey> <minutos> <desktop|poco>  (servidor local na porta 8805 servindo dashboard/ferramentas)
const { chromium } = require('playwright');
const tipo = process.argv[2] || 'avancado', min = process.argv[3] || '1', perfil = process.argv[4] || 'desktop';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext(perfil === 'poco' ? { viewport: { width: 407, height: 904 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', r => r.request().url().startsWith('http://127.0.0.1:8805') ? r.continue() : r.abort());
  await p.goto('http://127.0.0.1:8805/medidor_gerador_v1.10.176.html'); await p.waitForTimeout(2500);
  await p.fill('#demoSenha', 'mwm'); await p.waitForTimeout(300);
  await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(1500);
  p.on('dialog', d => d.dismiss()); /* beforeunload do Monkey (a caixa de areia pede para ficar na pagina) */ const t0 = Date.now();
  const ok = await p.evaluate(([t, m]) => window.opSecreto.rodarAv({ tipo: t, minutos: m, semente: 20261107 }), [tipo, min]);
  const c = await p.evaluate(() => window.opSecreto.contagem());
  const md = await p.evaluate(() => window.opSecreto.md());
  require('fs').writeFileSync('robo_' + tipo + '_' + perfil + '.md', md);
  console.log('rodou:', ok, 'segundos:', Math.round((Date.now() - t0) / 1000), JSON.stringify(c), 'erros de pagina:', errs.length, errs.slice(0, 3));
  await b.close();
})();
