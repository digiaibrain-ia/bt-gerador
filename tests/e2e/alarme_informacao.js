// Medidor 1.10.226: tipo de ocorrencia INFORMACAO (I): registrada junto com Alerta e Falha, filtro proprio, NAO conta nos botoes Alertas/Falhas;
// glossario dentro do dialogo (Legenda). Demo local, file://. Uso: node tests/e2e/alarme_informacao.js (MEDIDOR=nome.html)
const { chromium } = require('playwright'); const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || require('../versoes.js').medidorAtual());
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1536, height: 900 } })).newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
  await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto('file://' + ARQ); await p.waitForTimeout(2200);
  await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(1500);
  const hdr = () => p.evaluate(() => ({ a: document.querySelector('#bAlertas span').textContent, f: document.querySelector('#bFalhas span').textContent }));
  const h0 = await hdr();
  await p.evaluate(() => window.OCOR.set('app', 'TST-001', 'Informacao de teste: DSE nunca conectado', { ref: '', tipo: 'i' })); await p.waitForTimeout(1300);
  const ocs = await p.evaluate(() => window.OCOR.lista().filter(o => o.cod === 'TST-001').map(o => ({ tipo: o.tipo, ativa: o.ativa })));
  ok('Informacao e registrada com tipo i e fica ativa', ocs.length === 1 && ocs[0].tipo === 'i' && ocs[0].ativa, JSON.stringify(ocs));
  const h1 = await hdr(); ok('Informacao NAO conta nos botoes Alertas/Falhas', h0.a === h1.a && h0.f === h1.f, JSON.stringify([h0, h1]));
  // Falha continua contando
  await p.evaluate(() => window.OCOR.set('app', 'TST-002', 'Falha de teste', { ref: '', tipo: 'f' })); await p.waitForTimeout(1300);
  const h2 = await hdr(); ok('Falha continua contando em Falhas', /Falhas 1/.test(h2.f), JSON.stringify(h2));
  // dialogo: filtro Informacoes
  await p.evaluate(() => document.getElementById('bFalhas').click()); await p.waitForTimeout(600);
  const semInfo = await p.evaluate(() => document.getElementById('ocCorpo').textContent);
  ok('dialogo aberto por Falhas nao mostra a Informacao', !/Informacao de teste/.test(semInfo));
  await p.evaluate(() => document.querySelector('#ocTipos button[data-t=i]').click()); await p.waitForTimeout(500);
  const comInfo = await p.evaluate(() => document.getElementById('ocCorpo').innerText);
  ok('botao Informacoes mostra a linha com tipo "Informação" e codigo I-TST-001', /Informação/.test(comInfo) && /I-TST-001/.test(comInfo), comInfo.replace(/\s+/g, ' ').slice(0, 140));
  // legenda com o glossario
  await p.evaluate(() => document.getElementById('ocLeg').click()); await p.waitForTimeout(400);
  const leg = await p.evaluate(() => document.getElementById('dlgOcor').textContent);
  ok('Legenda tem o glossario (alarme incomodo, inundacao, relacao sinal/ruido, Informacao)', /Entenda os nomes/.test(leg) && /nuisance alarm/.test(leg) && /alarm flood/.test(leg) && /Relação sinal\/ruído/.test(leg) && /Informação \(I\)/.test(leg));
  // historico guarda o tipo
  const hist = await p.evaluate(() => window.OCOR.historico().filter(x => x.cod === 'TST-001').map(x => x.tipo));
  ok('historico guarda o tipo i', hist.length >= 1 && hist.every(t => t === 'i'), JSON.stringify(hist));
  ok('sem erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | '));
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + R.filter(x => x).length + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
