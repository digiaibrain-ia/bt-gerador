// Medidor 1.10.224: CHV-005/CHV-006 de banco NAO selecionado e parado sao silenciados; banco selecionado (ou com chave ligada) continua alarmando. Demo local. file://.
// Uso: node tests/e2e/alarme_banco_silenciado.js (MEDIDOR=nome.html)
const { chromium } = require('playwright'); const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || require('../versoes.js').medidorAtual());
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1536, height: 900 } })).newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
  // Passo 6 (19/11/2026): este roteiro prova a LOGICA de causa-raiz/silenciamento, nao o tempo; o debounce de 10 s tem teste proprio (fase4/x_alarme_debounce). Por isso o debounce fica desligado aqui.
  await p.addInitScript(() => { window.OCOR_DEBOUNCE_ESCALA = 0; });
  await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto('file://' + ARQ); await p.waitForTimeout(2200);
  await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(1500);
  const ativas = (cod, ref) => p.evaluate(([c, r]) => window.OCOR.lista().filter(x => x.cod === c && x.ref === r && x.ativa).length, [cod, ref]);
  const seta = (cod, ref) => p.evaluate(([c, r]) => window.OCOR.set('bco', c, r + ': teste de alarme', { ref: r }), [cod, ref]);
  // BC400 NAO selecionado e parado
  await p.evaluate(() => { GUIADO_DBG.G.usa['400'] = false; }); await p.waitForTimeout(700);
  ok('BC400 fora do teste e parado: silencia() = true', await p.evaluate(() => window.BANCOS_VISIVEIS.silencia('400')));
  await seta('CHV-005', 'BC400'); await seta('CHV-006', 'BC400');
  ok('CHV-005 e CHV-006 do BC400 NAO sao criadas', (await ativas('CHV-005', 'BC400')) === 0 && (await ativas('CHV-006', 'BC400')) === 0);
  // BC56 selecionado: continua alarmando
  await p.evaluate(() => { GUIADO_DBG.G.usa['56'] = true; }); await p.waitForTimeout(700);
  await seta('CHV-005', 'BC56');
  ok('BC56 selecionado: CHV-005 continua sendo criada', (await ativas('CHV-005', 'BC56')) === 1);
  // CHV-003 (nao e ruido) e COM-005 continuam funcionando mesmo para BC400 silenciado
  await p.evaluate(() => window.OCOR.set('modo', 'COM-005', 'BC400: PLC sem comunicacao com o ET200 (teste)', { ref: 'BC400' }));
  ok('COM-005 (infraestrutura) do BC400 NAO e silenciada', (await ativas('COM-005', 'BC400')) === 1);
  // banco que estava ativo e passou a ficar fora do teste: a ocorrencia e limpa
  await p.evaluate(() => { GUIADO_DBG.G.usa['400'] = true; }); await p.waitForTimeout(700);
  await seta('CHV-005', 'BC400'); const antes = await ativas('CHV-005', 'BC400');
  await p.evaluate(() => { GUIADO_DBG.G.usa['400'] = false; }); await p.waitForTimeout(2600);
  ok('BC400 selecionado: CHV-005 criada; ao sair do teste (parado) ela e limpa', antes === 1 && (await ativas('CHV-005', 'BC400')) === 0, 'antes=' + antes);
  ok('sem erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | '));
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + R.filter(x => x).length + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
