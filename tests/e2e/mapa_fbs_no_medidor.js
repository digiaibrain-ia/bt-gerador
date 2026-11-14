// Medidor 1.10.207: o botao "Mapa dos FBs" (Patamar Guiado > Detalhes > Ferramentas) abre a copia EMBUTIDA do mapa (v0.17) e o pulso funciona com os FBs virtuais DE VERDADE (sem injetar foto).
// Roteiro no DEMO: parado (nao pulsa) -> Operador Auto + Ligar Patamar Guiado + iniciar o ensaio (os blocos que agem pulsam, nao todos) -> o pulso acaba.
// LIMITE: neste roteiro a mae para em SEM_CARGA (o gerador virtual nao e ligado): so se exercita armar e iniciar (pulsam 9, 1, 3, 6, 7, 8, 10, 11); a mae no estado EXECUTANDO (sugestao 4, rodizio 5 em acao) nao e exercitada aqui. A logica do pulso por bloco esta em mapa_fbs_pulso.js.
// Abre o arquivo direto (file://), sem servidor. Uso: node tests/e2e/mapa_fbs_no_medidor.js   (MEDIDOR=nome.html; SHOTS=pasta para salvar capturas)
const { chromium } = require('playwright');
const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || 'medidor_gerador_v1.10.207.html');
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
    ok('a copia embutida do mapa e a v0.17 (era v0.14)', verEmb === '0.17', verEmb);
    ok('GUARDA: a copia embutida e a versao mais nova do mapa na pasta (v0.' + maisNova + ')', verEmb === '0.' + maisNova);
    ok('o medidor entrega a foto dos FBs ao mapa (AO VIVO)', await fr.evaluate(() => typeof AO !== 'undefined' && AO !== null && AO.v === 1 && /AO VIVO/.test(document.getElementById('vivo').textContent)));
    const halos = () => fr.evaluate(() => [...document.querySelectorAll('.halo')].map(h => h.closest('g').getAttribute('aria-label').replace(/:.*/, '')));
    const observa = async ms => { const t0 = Date.now(), v = new Set(); while (Date.now() - t0 < ms) { (await halos()).forEach(x => v.add(x)); await p.waitForTimeout(120); } return [...v]; };
    const parado = await observa(3000);
    ok('PARADO (fotos reais do medidor, 3 s): nenhum bloco pulsa', parado.length === 0, JSON.stringify(parado));
    // arma a mae e inicia o ensaio de verdade
    await p.evaluate(() => document.querySelector('[data-gd=rodar]').click()); await p.waitForTimeout(500);
    ok('Patamar Guiado ligado (botao vira "Desligar")', await p.evaluate(() => /Desligar Patamar Guiado/.test(document.querySelector('[data-gd=rodar]').textContent)));
    await p.evaluate(() => iniciaEnsaio()); await p.waitForTimeout(700);
    if (await p.evaluate(() => document.getElementById('dlgDados').open)) { await p.evaluate(() => document.getElementById('dOk').click()); await p.waitForTimeout(700); }
    const ativ = observa(3500); await p.waitForTimeout(300);
    await p.evaluate(() => iniciaEnsaio()); await p.waitForTimeout(500);
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'medidor207_mapa_' + nome.replace(/ /g, '_') + '.png') });
    const v = await ativ;
    ok('ao armar e iniciar, pulsam so os blocos que agem (inclui Alvos 3 e Tempos 7), nao todos', v.some(x => /^Bloco 3\b/.test(x)) && v.some(x => /^Bloco 7\b/.test(x)) && v.length >= 2 && v.length < 11, JSON.stringify(v));
    await p.waitForTimeout(2200);
    ok('depois do pulso, volta ao normal (nenhum halo parado esperando)', (await halos()).length === 0);
    ok('sem erro de JavaScript (pagina e mapa)', erros.length === 0, erros.join(' | '));
    await ctx.close();
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + (R.length - f) + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
