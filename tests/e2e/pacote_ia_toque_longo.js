// Toque longo (celular) abre o menu, nao aciona o botao por baixo, e toque curto/rolagem NAO abrem o menu. Medidor 1.10.164, porta 8790.
const { chromium } = require('playwright');
const URL = 'http://localhost:8790/' + (process.env.MEDIDOR || 'medidor_gerador_v1.10.164.html');
const ok = (n, c, d) => console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : ''));
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
  await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto(URL); await p.waitForTimeout(1800);
  const cdp = await ctx.newCDPSession(p);
  const toque = async (x, y, ms, mexe) => {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    if (mexe) { await p.waitForTimeout(100); await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 60 }] }); }
    await p.waitForTimeout(ms); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };
  // alvo: um botao inofensivo e visivel que conta cliques
  const alvo = await p.evaluate(() => { const bt = document.createElement('button'); bt.id = 'tl'; bt.textContent = 'alvo do toque'; bt.style.cssText = 'position:fixed;left:40px;top:300px;width:140px;height:48px;z-index:5'; window.__cliques = 0; bt.onclick = () => window.__cliques++; document.body.appendChild(bt); return { x: 110, y: 324 }; });
  await toque(alvo.x, alvo.y, 120); await p.waitForTimeout(300);
  ok('toque curto aciona o botao e NAO abre o menu', await p.evaluate(() => window.__cliques === 1 && !document.querySelector('.pia-menu')));
  await toque(alvo.x, alvo.y, 800, true); await p.waitForTimeout(300);
  ok('toque com arrasto (rolagem) NAO abre o menu', await p.evaluate(() => !document.querySelector('.pia-menu')));
  await toque(alvo.x, alvo.y, 900); await p.waitForTimeout(400);
  const m = await p.evaluate(() => { const e = document.querySelector('.pia-menu'); if (!e) return null; const r = e.getBoundingClientRect(); return { n: e.querySelectorAll('button').length, dentro: r.left >= 0 && r.right <= innerWidth && r.top >= 0 && r.bottom <= innerHeight, cliques: window.__cliques }; });
  ok('toque longo abre o menu dentro da tela', m && m.n === 5 && m.dentro, m && JSON.stringify(m));
  ok('toque longo NAO aciona o botao por baixo', m && m.cliques === 1);
  await p.touchscreen.tap(20, 700); await p.waitForTimeout(300);
  ok('tocar fora fecha o menu', await p.evaluate(() => !document.querySelector('.pia-menu')));
  ok('nenhum erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | '));
  await b.close();
})();
