// Mapa dos FBs v0.19: AREA DO DIAGRAMA NO CELULAR (pedido do Reginaldo: "area de visualizacao dos FB no celular e pequena, pouca altura").
// Mede a fracao da tela que o diagrama ocupa em 390x844, 360x740 e deitado 844x390, confere o cabecalho enxuto, a faixa Gerador/Banco/Carga em uma linha, a legenda no botao i e que o PC (1536x800) NAO muda.
// Abre o arquivo direto (file://), sem servidor. Uso: node tests/e2e/mapa_fbs_celular.js   (MAPA=nome.html; SHOTS=pasta para capturas). Contra a v0.18 o teste falha (era 17 %).
const { chromium } = require('playwright');
const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MAPA || 'mapa_fbs_v0.19.html');
const SHOTS = process.env.SHOTS || '';
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
const FOTO = `() => ({ v: 1, ts: Date.now(), fonte: 'virtual', estado: 'EXECUTANDO', msg: '', kw: { alvo: 50, sel: 50, cmd: 50, conf: 50, cap100: 100 }, etapa: { idx: 0, alvoPct: 50 }, aplicar: { modo: 'A', liberado: false },
  filhos: Object.fromEntries([1,2,3,4,5,6,7,8,9,10,11].map(i => [i, { estado: i === 7 ? 'ativo' : 'idle', txt: '', ent: {}, sai: i === 2 ? { 'kW medido': 50, 'V medido': 220, 'Hz medido': 60 } : {} }])) })`;
const vis = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0; }, sel);
const alt = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e && getComputedStyle(e).display !== 'none' ? Math.round(e.getBoundingClientRect().height) : 0; }, sel);
(async () => {
  const b = await chromium.launch();
  // ---- celulares: o diagrama tem que ocupar boa parte da tela ----
  for (const [nome, vp, minFrac] of [['celular 390x844', { width: 390, height: 844 }, 0.6], ['celular 360x740', { width: 360, height: 740 }, 0.55], ['celular deitado 844x390', { width: 844, height: 390 }, 0.45]]) {
    console.log('\n## ' + nome);
    const ctx = await b.newContext({ viewport: vp, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
    await p.goto('file://' + ARQ); await p.waitForTimeout(500);
    await p.evaluate(F => recebe(eval(F)()), FOTO); await p.waitForTimeout(300);
    const cv = await alt(p, '#cv'), hd = await alt(p, 'header'), gc = await alt(p, '#gc'), lg = await alt(p, '.lg');
    ok('o diagrama ocupa >= ' + Math.round(minFrac * 100) + ' % da altura da tela', cv / vp.height >= minFrac, cv + ' px de ' + vp.height + ' = ' + Math.round(100 * cv / vp.height) + ' % (cabecalho ' + hd + ', faixa ' + gc + ', legenda ' + lg + ')');
    ok('a legenda longa saiu da tela (so no botao ⓘ)', lg === 0 && await vis(p, '#bLeg'));
    ok('titulo escondido e botoes de modo curtos (sem DSE / com DSE / Automatico)', !(await vis(p, 'h1')) && await p.evaluate(() => [...document.querySelectorAll('.seg button')].map(b => b.innerText.trim()).join('|') === 'sem DSE|com DSE|Automático'));
    ok('pilula curta: so o estado da mae (sem "AO VIVO" nem "mae:")', await p.evaluate(() => { const v = document.getElementById('vivo'); return v.className === 'on' && [...v.querySelectorAll('.vv,.mae-l')].every(e => getComputedStyle(e).display === 'none') && v.getBoundingClientRect().width < 170; }), await p.evaluate(() => document.getElementById('vivo').innerText));
    ok('faixa Gerador/Banco/Carga: nasce em UMA linha de resumo com os valores', await p.evaluate(() => { const g = document.getElementById('gc'); return g.classList.contains('min') && getComputedStyle(document.getElementById('gcS')).display !== 'none' && /G 50,0 kW · Banco 50,0→50,0 kW · Carga 50,0 %/.test(document.getElementById('gcS').textContent) && getComputedStyle(g.querySelector('.gcb')).display === 'none'; }), await p.evaluate(() => document.getElementById('gcS').textContent));
    await p.click('#gcT'); await p.waitForTimeout(150);
    ok('▸ abre o detalhe (3 cartoes) e ▾ fecha de novo', await p.evaluate(() => getComputedStyle(document.querySelector('#gc .gcb')).display !== 'none' && document.getElementById('gcT').textContent === '▾' && getComputedStyle(document.getElementById('gcS')).display === 'none'));
    await p.click('#gcT'); await p.waitForTimeout(150);
    ok('voltou a uma linha', await p.evaluate(() => document.getElementById('gc').classList.contains('min')));
    // legenda no painel do ⓘ
    await p.click('#bLeg'); await p.waitForTimeout(150);
    ok('ⓘ abre a legenda completa (cores, simbolos, brilho) num painel que cabe na tela', await p.evaluate(() => { const l = document.getElementById('legPop'), r = l.getBoundingClientRect(); return l.classList.contains('on') && /dados e alvos/.test(l.textContent) && /■ ocioso ✔ ok ▶ contando ▲ falha/.test(l.textContent) && /brilho: bloco ativo/.test(l.textContent) && r.left >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1; }));
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'mapa19_' + nome.replace(/ /g, '_') + '_legenda.png') });
    await p.click('#legPop .legx'); ok('✕ fecha a legenda', !(await p.evaluate(() => document.getElementById('legPop').classList.contains('on'))));
    await p.click('#bLeg'); await p.keyboard.press('Escape'); ok('Esc fecha a legenda', !(await p.evaluate(() => document.getElementById('legPop').classList.contains('on'))));
    await p.click('#bLeg'); await p.mouse.click(Math.round(vp.width / 2), Math.round(vp.height / 2) - 100); await p.waitForTimeout(150); ok('toque fora fecha a legenda', !(await p.evaluate(() => document.getElementById('legPop').classList.contains('on'))));
    ok('zoom ajustado pela ALTURA (40 a 60 %): o diagrama inteiro cabe na altura, sem rolar para cima e para baixo', await p.evaluate(() => { const cv = document.getElementById('cv'), s = document.getElementById('svgm'); const zp = parseInt(document.getElementById('zp').textContent); return zp >= 40 && zp <= 60 && s.getBoundingClientRect().height <= cv.clientHeight + 4; }), await p.evaluate(() => document.getElementById('zp').textContent + ' · svg ' + Math.round(document.getElementById('svgm').getBoundingClientRect().height) + ' px em ' + document.getElementById('cv').clientHeight + ' px'));
    ok('a pagina nao ganha rolagem lateral (so o diagrama rola)', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    ok('botoes de toque com pelo menos 36 px (ⓘ, ▸, Exportar, Ajustar)', await p.evaluate(() => ['#bLeg', '#gcT', '#bExp', '#zA'].every(s => { const r = document.querySelector(s).getBoundingClientRect(); return r.width >= 34 && r.height >= 34; })));
    if (SHOTS) { await p.screenshot({ path: path.join(SHOTS, 'mapa19_' + nome.replace(/ /g, '_') + '.png') }); }
    ok('sem erro de JavaScript', erros.length === 0, erros.join(' | '));
    await ctx.close();
  }
  // ---- PC: nada muda ----
  console.log('\n## PC 1536x800 (nao pode mudar)');
  const ctx = await b.newContext({ viewport: { width: 1536, height: 800 } }); const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
  await p.goto('file://' + ARQ); await p.waitForTimeout(500); await p.evaluate(F => recebe(eval(F)()), FOTO); await p.waitForTimeout(300);
  ok('PC: titulo, legenda e faixa com os 3 cartoes continuam na tela; sem botao ⓘ nem ▸', await vis(p, 'h1') && await vis(p, '.lg') && await vis(p, '#gc .gcb') && !(await vis(p, '#bLeg')) && !(await vis(p, '#gcT')) && !(await vis(p, '#gcS')));
  ok('PC: botoes de modo com texto completo e pilula "AO VIVO · mae: EXECUTANDO"', await p.evaluate(() => [...document.querySelectorAll('.seg button')].map(b => b.innerText.trim()).join('|') === 'Guiado sem DSE|Guiado com DSE|Automático' && /AO VIVO · mãe: EXECUTANDO/.test(document.getElementById('vivo').innerText)));
  ok('PC: "Ajustar" continua ajustando pela largura (zoom como antes)', await p.evaluate(() => { const cv = document.getElementById('cv'); const zp = parseInt(document.getElementById('zp').textContent); return zp >= 40 && zp <= 160; }), await p.evaluate(() => document.getElementById('zp').textContent));
  ok('PC: sem erro de JavaScript', erros.length === 0, erros.join(' | '));
  await ctx.close();
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + (R.length - f) + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
