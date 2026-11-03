// Alertas e Falhas: dois botoes independentes + chips de tipo na janela (medidor 1.10.166). Porta 8790.
const { chromium } = require('playwright');
const URL = 'http://localhost:8790/' + (process.env.MEDIDOR || 'medidor_gerador_v1.10.166.html');
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
(async () => {
  const b = await chromium.launch();
  for (const [nome, vp, mobile] of [['desktop 1280', { width: 1280, height: 800 }, false], ['celular 390', { width: 390, height: 844 }, true]]) {
    console.log('\n## ' + nome);
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
    await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto(URL); await p.waitForTimeout(1800);
    ok('existem os dois botoes independentes', await p.evaluate(() => !!document.getElementById('bAlertas') && !!document.getElementById('bFalhas') && document.getElementById('bAlertas') !== document.getElementById('bFalhas')));
    // cria ocorrencias de cada tipo (os codigos definem o tipo)
    const tipos = await p.evaluate(() => { const cods = [['bco', 'CHV-001'], ['bco', 'CHV-002'], ['bco', 'CHV-006'], ['app', 'SIS-001'], ['dse', 'DSE-001']]; cods.forEach(([c, k]) => { try { window.OCOR.set(c, k, 'teste ' + k, { ref: 'T' }); } catch (e) {} }); return true; });
    await p.waitForTimeout(600);
    const cont = await p.evaluate(() => ({ a: document.querySelector('#bAlertas span').textContent, f: document.querySelector('#bFalhas span').textContent, aTem: document.getElementById('bAlertas').classList.contains('tem'), fTem: document.getElementById('bFalhas').classList.contains('tem') }));
    const na = +cont.a.replace(/\D/g, ''), nf = +cont.f.replace(/\D/g, '');
    ok('contagens separadas (precisa ter alerta e falha para o teste)', na > 0 && nf > 0, cont.a + ' · ' + cont.f);
    ok('cor so quando ha ocorrencia daquele tipo', cont.aTem === (na > 0) && cont.fTem === (nf > 0));
    const linhas = () => p.evaluate(() => [...document.querySelectorAll('#ocCorpo tr')].map(tr => tr.children[1].textContent.trim()));
    const chips = () => p.evaluate(() => [...document.querySelectorAll('#ocTipos button')].map(x => x.dataset.t + ':' + x.classList.contains('on')).join(' '));
    // Alertas: abre so com alertas
    await p.click('#bAlertas'); await p.waitForTimeout(400);
    let l = await linhas(); ok('clicar em Alertas mostra SO alertas', l.length === na && l.every(x => x === 'Alerta'), l.length + ' linhas · ' + await chips());
    // liga Falhas junto
    await p.click('#ocTipos button[data-t=f]'); await p.waitForTimeout(300); l = await linhas();
    ok('ligar o chip Falhas mostra os dois juntos', l.length === na + nf && l.includes('Alerta') && l.includes('Falha'), l.length + ' linhas · ' + await chips());
    // desliga Alertas: sobra so falhas; tentar desligar o ultimo nao faz nada
    await p.click('#ocTipos button[data-t=m]'); await p.waitForTimeout(300); l = await linhas();
    ok('desligar Alertas deixa so Falhas', l.length === nf && l.every(x => x === 'Falha'));
    await p.click('#ocTipos button[data-t=f]'); await p.waitForTimeout(300); l = await linhas();
    ok('nao deixa desligar os dois tipos', l.length === nf, await chips());
    // clicar no outro botao troca sem fechar
    await p.click('#bAlertas', { force: true }).catch(() => {}); await p.waitForTimeout(300);
    ok('janela segue aberta ao trocar de botao', await p.evaluate(() => document.getElementById('dlgOcor').open));
    // Falhas: abre so com falhas
    await p.evaluate(() => document.getElementById('dlgOcor').close()); await p.click('#bFalhas'); await p.waitForTimeout(400); l = await linhas();
    ok('clicar em Falhas mostra SO falhas', l.length === nf && l.every(x => x === 'Falha'), await chips());
    // clicar de novo no mesmo botao fecha
    const cobre = await p.evaluate(() => { const r = document.getElementById('bFalhas').getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e && !e.closest('#bFalhas'); });
    await p.evaluate(() => document.getElementById('bFalhas').click()); await p.waitForTimeout(300);   // (no celular a janela pode cobrir o botao: a logica e conferida por clique via script)
    if (cobre) console.log('     (nota: neste tamanho a janela cobre o botao do cabecalho; fecha-se pelo ✕)');
    ok('clicar de novo no mesmo botao fecha a janela', await p.evaluate(() => !document.getElementById('dlgOcor').open));
    // botoes dentro da tela (celular)
    const dentro = await p.evaluate(() => ['bAlertas', 'bFalhas'].every(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.width > 0 && r.right <= innerWidth + 1 && r.left >= 0; }));
    ok('os dois botoes ficam dentro da tela', dentro);
    ok('nenhum erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | '));
    await ctx.close();
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\nTOTAL ' + R.length + ' · FALHAS ' + f); process.exit(f ? 1 : 0);
})();
