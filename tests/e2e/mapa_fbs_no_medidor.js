// Medidor 1.10.209: o botao "Mapa dos FBs" (Patamar Guiado > Detalhes > Ferramentas) abre a copia EMBUTIDA do mapa (v0.19) e a AUREOLA do bloco ativo funciona com os FBs virtuais DE VERDADE (sem injetar foto).
// Roteiro no DEMO: parado (nenhum bloco brilha) -> Operador Auto + Ligar Patamar Guiado + iniciar o ensaio (brilham os blocos em estado ativo, nao todos; a aureola respira sem apagar).
// LIMITE: neste roteiro a mae para em SEM_CARGA (o gerador virtual nao e ligado): so se exercita armar e iniciar; a mae no estado EXECUTANDO (sugestao 4, rodizio 5 em acao) nao e exercitada aqui. A logica da aureola esta em mapa_fbs_aura.js.
// Abre o arquivo direto (file://), sem servidor. Uso: node tests/e2e/mapa_fbs_no_medidor.js   (MEDIDOR=nome.html; SHOTS=pasta para salvar capturas)
const { chromium } = require('playwright');
const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || 'medidor_gerador_v1.10.209.html');
const SHOTS = process.env.SHOTS || '';
const fs = require('fs');
// GUARDA (LL-059): a copia embutida do mapa tem que ser a versao MAIS NOVA que existe na pasta (a 1.10.206 embutia a v0.14 enquanto a pasta ja tinha a v0.16)
const maisNova = fs.readdirSync(path.dirname(ARQ)).map(n => /^mapa_fbs_v0\.(\d+)\.html$/.exec(n)).filter(Boolean).map(m => +m[1]).sort((a, b) => b - a)[0];
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
(async () => {
  const b = await chromium.launch();
  for (const [nome, vp, mobile] of [['desktop 1536x900', { width: 1536, height: 900 }, false], ['celular 390', { width: 390, height: 844 }, true]]) {
    console.log('\n## ' + nome);
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 2 }); const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
    await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto('file://' + ARQ); await p.waitForTimeout(2200);
    // Demo ligado (checkbox escondido, liberado pela senha de testes) e Operador em Auto: sem isso o Patamar Guiado nao liga
    await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(700);
    await p.evaluate(() => { const a = document.getElementById('mAuto'); if (a) a.click(); }); await p.waitForTimeout(400);
    await p.evaluate(() => document.getElementById('bPatDet').click()); await p.waitForTimeout(400);
    ok('o botao "Mapa dos FBs" existe em Patamar Guiado > Detalhes > Ferramentas', await p.evaluate(() => { const e = document.querySelector('[data-gd=mapa]'); return !!e && e.getBoundingClientRect().width > 0; }));
    await p.evaluate(() => document.querySelector('[data-gd=mapa]').click()); await p.waitForTimeout(1200);
    ok('o painel do mapa abre', await p.evaluate(() => document.getElementById('dlgMapaFBs').open));
    const fr = await (await p.$('#mapaFrame')).contentFrame(); await fr.waitForSelector('#svgm', { timeout: 5000 });
    const verEmb = await fr.evaluate(() => document.querySelector('meta[name=app-version]').content);
    ok('a copia embutida do mapa e a v0.19 (era v0.14)', verEmb === '0.19', verEmb);
    ok('GUARDA: a copia embutida e a versao mais nova do mapa na pasta (v0.' + maisNova + ')', verEmb === '0.' + maisNova);
    // v1.10.209: area do diagrama no celular. Celular: painel em TELA CHEIA, titulo em UMA linha, o diagrama com a maior parte da tela. PC: painel como antes.
    const cel = nome.startsWith('celular');
    const geo = await p.evaluate(() => { const d = document.getElementById('dlgMapaFBs'), r = d.getBoundingClientRect(), t = d.querySelector('.jt').getBoundingClientRect(), i = document.getElementById('mapaFrame').getBoundingClientRect(), j = document.getElementById('mapaJan'); return { W: innerWidth, H: innerHeight, dw: Math.round(r.width), dh: Math.round(r.height), t: Math.round(t.height), ih: Math.round(i.height), jan: j.innerText.trim(), janW: Math.round(j.getBoundingClientRect().width) }; });
    const cvH = await fr.evaluate(() => Math.round(document.getElementById('cv').getBoundingClientRect().height));
    if (cel) {
      // o modulo de janelas do projeto (LL-020) impoe max-width/max-height em linha com 4 px de folga por lado, para toda janela caber inteira na tela: o painel ocupa a tela MENOS essa folga
      ok('celular: o painel ocupa a tela inteira (menos 4 px de folga por lado, regra de janelas LL-020)', geo.dw >= geo.W - 10 && geo.dh >= geo.H - 10 && geo.dw <= geo.W && geo.dh <= geo.H, geo.dw + 'x' + geo.dh + ' em ' + geo.W + 'x' + geo.H);
      ok('celular: barra de titulo em UMA linha (<= 56 px) e o botao Janela propria so com o icone', geo.t <= 56 && geo.jan === '↗' && geo.janW <= 48, 'titulo ' + geo.t + ' px, botao "' + geo.jan + '"');
      ok('celular: o iframe usa quase toda a altura (>= 90 %) e o DIAGRAMA ocupa >= 60 % da altura da tela', geo.ih / geo.H >= 0.9 && cvH / geo.H >= 0.6, 'iframe ' + geo.ih + ' px · diagrama ' + cvH + ' px de ' + geo.H + ' = ' + Math.round(100 * cvH / geo.H) + ' %');
    } else {
      ok('PC: painel como antes (iframe 76vh, botao "Janela propria" com texto, barra de titulo normal)', Math.abs(geo.ih - Math.round(0.76 * geo.H)) <= 4 && /Janela própria/.test(geo.jan) && geo.dw < geo.W, 'iframe ' + geo.ih + ' px (76vh = ' + Math.round(0.76 * geo.H) + '), botao "' + geo.jan + '"');
    }
    ok('o medidor entrega a foto dos FBs ao mapa (AO VIVO)', await fr.evaluate(() => typeof AO !== 'undefined' && AO !== null && AO.v === 1 && /AO VIVO/.test(document.getElementById('vivo').textContent)));
    const auras = () => fr.evaluate(() => [...document.querySelectorAll('.aura')].map(h => h.closest('g').getAttribute('aria-label').replace(/:.*/, '')));
    const opac = () => fr.evaluate(() => [...document.querySelectorAll('.aura')].map(a => +getComputedStyle(a).opacity));
    const observa = async ms => { const t0 = Date.now(), v = new Set(), ops = []; let n = 0, com = 0; while (Date.now() - t0 < ms) { const a = await auras(); a.forEach(x => v.add(x)); n++; if (a.length) com++; (await opac()).forEach(o => ops.push(o)); await p.waitForTimeout(120); } return { blocos: [...v], n, com, ops }; };
    const parado = await observa(3000);
    ok('PARADO (fotos reais do medidor, 3 s): nenhum bloco brilha', parado.blocos.length === 0, JSON.stringify(parado.blocos));
    // arma a mae e inicia o ensaio de verdade
    await p.evaluate(() => window.__setSalvaModo('P')); await p.waitForTimeout(500);   // 1.10.221: o Patamar liga pelo Modo (Salvamento Por patamar); o botao do dialogo saiu
    ok('Patamar Guiado ligado (sinalizacao Patamar: On)', await p.evaluate(() => !!GUIADO_MAE.armada && /Patamar: On/.test(document.body.textContent)));
    await p.evaluate(() => iniciaEnsaio()); await p.waitForTimeout(700);
    if (await p.evaluate(() => document.getElementById('dlgDados').open)) { await p.evaluate(() => document.getElementById('dOk').click()); await p.waitForTimeout(700); }
    const ativ = observa(3500); await p.waitForTimeout(300);
    await p.evaluate(() => iniciaEnsaio()); await p.waitForTimeout(500);
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'medidor208_mapa_' + nome.replace(/ /g, '_') + '.png') });
    const v = await ativ;
    const conf = await fr.evaluate(() => { const ativos = Object.entries(AO.filhos).filter(([k, f]) => f.estado === 'ativo').map(([k]) => +k).sort((x, y) => x - y); const aur = [...document.querySelectorAll('.aura')].map(e => +/Bloco (\d+)/.exec(e.closest('g').getAttribute('aria-label'))[1]).sort((x, y) => x - y); return { ativos, aur }; });
    ok('ao armar e iniciar, a auréola está EXATAMENTE nos blocos que a foto dos FBs marca como ativos (conferido contra os dados)', conf.ativos.length > 0 && JSON.stringify(conf.ativos) === JSON.stringify(conf.aur), 'ativos ' + JSON.stringify(conf.ativos) + ' · aureolas ' + JSON.stringify(conf.aur));
    ok('brilham alguns blocos (inclui Tempos 7), nao todos', v.blocos.some(x => /^Bloco 7\b/.test(x)) && v.blocos.length >= 1 && v.blocos.length < 11, JSON.stringify(v.blocos));
    ok('a aureola PERMANECE enquanto o bloco esta ativo (presente em >= 80 % das amostras apos iniciar)', v.com / v.n >= 0.8, v.com + '/' + v.n);
    ok('a aureola respira sem apagar nem estourar (0,37 a 0,93)', v.ops.length > 0 && Math.min(...v.ops) >= 0.37 && Math.max(...v.ops) <= 0.93, v.ops.length ? 'min ' + Math.min(...v.ops).toFixed(2) + ' max ' + Math.max(...v.ops).toFixed(2) : 'sem amostra');
    ok('sem erro de JavaScript (pagina e mapa)', erros.length === 0, erros.join(' | '));
    await ctx.close();
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + (R.length - f) + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
