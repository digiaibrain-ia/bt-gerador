// Medidor 1.10.225: falha de API repetida nao vira um evento por tentativa no log (DEV.OBS). Demo local, file://. Uso: node tests/e2e/log_falha_repetida.js (MEDIDOR=nome.html)
const { chromium } = require('playwright'); const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || 'medidor_gerador_v1.10.226.html');
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
  await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto('file://' + ARQ); await p.waitForTimeout(2200);
  const conta = a => p.evaluate(x => window.devObs.buf().filter(e => String(e.acao).indexOf(x) === 0).length, a);
  await p.evaluate(() => { for (let i = 0; i < 300; i++) window.devObs.log('med', 'api', 'GET /api/teste-rep → 503', 'falha'); });
  ok('300 falhas iguais seguidas = 1 evento no log', (await conta('GET /api/teste-rep → 503')) === 1, 'eventos: ' + (await conta('GET /api/teste-rep → 503')));
  await p.evaluate(() => { window.devObs.log('med', 'api', 'GET /api/teste-rep → 200', 'ok'); window.devObs.log('med', 'api', 'GET /api/outra-rota → 503', 'falha'); });
  ok('sucesso e outra rota continuam sendo registrados', (await conta('GET /api/teste-rep → 200')) === 1 && (await conta('GET /api/outra-rota → 503')) === 1);
  await p.evaluate(() => { window.__obsRepForca(); window.devObs.log('med', 'api', 'GET /api/teste-rep → 503', 'falha'); });
  const resumo = await p.evaluate(() => window.devObs.buf().filter(e => /teste-rep → 503 — repetido ×\d+ desde/.test(e.acao)).map(e => ({ a: e.acao, d: e.det })));
  ok('a cada 60 s entra UM resumo com contador, primeira e ultima', resumo.length === 1 && resumo[0].d && resumo[0].d.vezes === 301 && !!resumo[0].d.primeira && !!resumo[0].d.ultima, JSON.stringify(resumo).slice(0, 200));
  await p.evaluate(() => { for (let i = 0; i < 50; i++) window.devObs.log('bco', 'clique', 'clique de teste ' + i, 'info'); });
  ok('eventos que nao sao falha de API nao mudam (50 cliques = 50 eventos)', (await p.evaluate(() => window.devObs.buf().filter(e => /^clique de teste/.test(e.acao)).length)) === 50);
  ok('sem erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | '));
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + R.filter(x => x).length + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
