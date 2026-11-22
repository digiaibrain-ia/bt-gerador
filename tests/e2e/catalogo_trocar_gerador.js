// Medidor 1.10.217: com gerador JA ESCOLHIDO, a mensagem do catalogo automatico nao pode apagar a ficha nem o botao "Trocar gerador"; "Trocar gerador" traz a busca de volta.
// file://. Uso: node tests/e2e/catalogo_trocar_gerador.js (MEDIDOR=nome.html)
const { chromium } = require('playwright'); const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || require('../versoes.js').medidorAtual());
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
(async () => {
  const b = await chromium.launch();
  for (const [nome, vp, mobile] of [['desktop 1280', { width: 1280, height: 800 }, false], ['celular 390', { width: 390, height: 844 }, true]]) {
    console.log('\n## ' + nome);
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
    await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' }));
    await p.addInitScript(() => { try { localStorage.setItem('medidor.modeloEscolhido', JSON.stringify({ arquivo: 'x_260KVA_60HZ_220V.dse', kVA: '260', V: '220', Hz: '60', kW: '208', pasta_modelo: 'x', ctrl: 'DSE 4520' })); } catch (e) {} });
    await p.goto('file://' + ARQ); await p.waitForTimeout(2200);
    await p.evaluate(() => document.getElementById('bDados').click()); await p.waitForTimeout(700);
    const est = () => p.evaluate(() => { const c = document.getElementById('dCat'); const vis = e => !!e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none';
      return { escolhido: c.classList.contains('escolhido'), troca: vis(c.querySelector('[data-c=troca]')), busca: vis(c.querySelector('[data-c=q]')), aviso: (c.querySelector('[data-c=aviso]') || {}).textContent || '', ficha: !!c.querySelector('.cat-ficha') }; });
    let e = await est(); ok('gerador escolhido lembrado: ficha e "Trocar gerador" visiveis, busca escondida', e.escolhido && e.ficha && e.troca && !e.busca, JSON.stringify(e));
    await p.evaluate(() => window.CATDSE.avisa('Catálogo atualizado sozinho (catalogo_modelos_v0.1.csv): 1663 modelos.')); await p.waitForTimeout(300); e = await est();
    ok('depois da mensagem do catalogo a ficha e o botao "Trocar gerador" CONTINUAM la', e.ficha && e.troca, JSON.stringify(e));
    ok('a mensagem do catalogo aparece em lugar proprio', /1663 modelos/.test(e.aviso), e.aviso);
    await p.evaluate(() => document.querySelector('#dCat [data-c=troca]').click()); await p.waitForTimeout(400); e = await est();
    ok('"Trocar gerador" traz o campo de busca de volta', e.busca && !e.escolhido, JSON.stringify(e));
    ok('sem erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | ')); await ctx.close();
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + R.filter(x => x).length + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
