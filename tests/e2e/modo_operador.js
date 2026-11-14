// Modo operador por padrao + caixa de senha no lugar do botao Demo + secao Referencias do Pacote (medidor 1.10.166). Porta 8790 (com referencias/ ao lado).
const { chromium } = require('playwright');
const URL = 'http://localhost:8790/' + (process.env.MEDIDOR || 'medidor_gerador_v1.10.166.html');
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
(async () => {
  const b = await chromium.launch();
  for (const [nome, vp, mobile] of [['desktop 1280', { width: 1280, height: 800 }, false], ['celular 390', { width: 390, height: 844 }, true]]) {
    console.log('\n## ' + nome);
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message)); let prompts = 0; p.on('dialog', d => { if (d.type() === 'prompt') prompts++; d.dismiss(); });
    await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto(URL); await p.waitForTimeout(1800);
    const vis = id => p.evaluate(i => { const e = document.getElementById(i); if (!e) return null; const r = e.getBoundingClientRect(); return getComputedStyle(e).display !== 'none' && r.width > 0 && r.right <= innerWidth + 1 && r.left >= 0; }, id);
    ok('ao abrir: modo operador (botao Demo escondido, caixa de senha visivel e dentro da tela)', (await vis('bDemo')) === false && (await vis('demoSenha')) === true);
    ok('ferramentas de teste escondidas', await p.evaluate(() => getComputedStyle(document.getElementById('bDemoLock')).display === 'none' && getComputedStyle(document.getElementById('bDevCards')).display === 'none'));
    await p.fill('#demoSenha', 'errada'); await p.press('#demoSenha', 'Enter'); await p.waitForTimeout(300);
    ok('senha errada + Enter: nada aparece e a caixa limpa', (await vis('bDemo')) === false && (await p.inputValue('#demoSenha')) === '');
    await p.fill('#demoSenha', 'MWM'); await p.waitForTimeout(300);
    ok('digitar a senha libera o botao Demo sem Enter (maiuscula tambem)', (await vis('bDemo')) === true && (await vis('demoSenha')) === false);
    ok('as ferramentas de teste aparecem', await p.evaluate(() => getComputedStyle(document.getElementById('bDemoLock')).display !== 'none'));
    await p.click('#bDemo'); await p.waitForTimeout(400);
    ok('o botao Demo abre a janela Demo e Servidor', await p.evaluate(() => document.getElementById('dlgDemo').open));
    ok('nao usa mais prompt() de senha', prompts === 0);
    await p.click('#bDemoLock');   // o cadeado fica dentro da janela Demo await p.waitForTimeout(400);
    ok('o cadeado volta ao modo operador', (await vis('bDemo')) === false && (await vis('demoSenha')) === true);
    // Pacote: sem botao JSON e com Referencias
    await p.evaluate(() => window.PACOTE_IA.abre(null, [])); await p.waitForTimeout(900);
    ok('pacote sem botao .json', await p.evaluate(() => !document.getElementById('piaJson')) && await p.evaluate(() => !!document.getElementById('piaMd')));
    const refs = await p.evaluate(() => [...document.querySelectorAll('#piaRefs .pia-ref')].map(x => x.querySelector('b').textContent));
    ok('secao Referencias lista o indice', refs.length === 6, refs.length + ' itens');
    await p.click('#piaRefs .pia-ref input >> nth=0'); await p.fill('#piaQ', 'teste');
    const md = await p.textContent('#piaPrev'); ok('referencia marcada entra no pacote em texto', /## Referências/.test(md) && /Alertas/.test(md));
    ok('nenhum erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | '));
    await ctx.close();
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\nTOTAL ' + R.length + ' · FALHAS ' + f); process.exit(f ? 1 : 0);
})();
