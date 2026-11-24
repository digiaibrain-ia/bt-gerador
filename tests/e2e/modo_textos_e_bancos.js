// Medidor 1.10.215: (1) Modo: Fonte = SIDSE / DSE Real; Salvamento = Manual / Auto / Patamar; caixa "Registro no Node-RED" com valor curto e coerente com o indicador Node-RED;
// (2) Banco de Cargas: so o selecionado fica visivel, mesmo com o PLC nunca lido (chaves com "?"); leitura PERDIDA depois de existir mantem o banco visivel (seguranca).
// file://. Uso: node tests/e2e/modo_textos_e_bancos.js (MEDIDOR=nome.html)
const { chromium } = require('playwright'); const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || require('../versoes.js').medidorAtual());
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
const modo = p => p.evaluate(() => ({ fonte: mcFonte.textContent, salva: mcSalva.textContent, node: mcNode.textContent, lkNr: document.querySelector('#lkNr small').textContent }));
(async () => {
  const b = await chromium.launch();
  for (const [nome, vp, mobile] of [['desktop 1280', { width: 1280, height: 800 }, false], ['celular 390', { width: 390, height: 844 }, true]]) {
    console.log('\n## ' + nome);
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
    await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto('file://' + ARQ); await p.waitForTimeout(2500);
    // ---- real (Demo desligado) ----
    let m = await modo(p); ok('Fonte dos dados = "DSE Real" (modo real)', m.fonte === 'DSE Real', m.fonte);
    ok('"Registro no Node-RED" e valor curto (<= 16 letras), sem o erro cru', m.node.length <= 16 && !/HTML foi aberto/.test(m.node), m.node);
    ok('rotulo da caixa e "Registro no Node-RED"', await p.evaluate(() => [...document.querySelectorAll('#modoCard .mdgrid .l')].some(e => e.textContent === 'Registro no Node-RED')));
    // ---- Demo ----
    await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(1500);
    m = await modo(p); ok('Fonte dos dados = "SIDSE" (Demo)', m.fonte === 'SIDSE', m.fonte);
    ok('Demo local: Registro = "Simulado" e o indicador Node-RED diz "simulação" (coerentes)', m.node === 'Simulado' && m.lkNr === 'simulação', m.node + ' / ' + m.lkNr);
    for (const [cod, esp] of [['M', 'Manual'], ['A', 'Auto'], ['P', 'Patamar']]) {
      await p.evaluate(c => window.__setSalvaModo(c), cod); await p.waitForTimeout(700); m = await modo(p); ok('Salvamento = "' + esp + '"', m.salva === esp, m.salva);
    }
    // ---- bancos: modo real, PLC nunca lido, so 1 banco selecionado ----
    await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = false; d.dispatchEvent(new Event('change', { bubbles: true })); SRVM.url = 'http://servidor-teste:1880'; window.__sel = [BANCOS_PLC[0].id]; window.bancoUsado = id => window.__sel.includes(id); }); await p.waitForTimeout(2500);
    const est = () => p.evaluate(() => [...document.querySelectorAll('#bancos details.bk[data-bk]')].map(d => ({ id: d.dataset.bk, oculto: d.classList.contains('bk-oculto'), unk: !!d.querySelector('.tile.unk') })));
    let e = await est(); const selId = await p.evaluate(() => window.__sel[0]);
    ok('so o banco selecionado fica visivel (os demais ocultos), mesmo sem leitura do PLC', e.length >= 2 && e.filter(x => !x.oculto).length === 1 && !e.find(x => x.id === selId).oculto, JSON.stringify(e));
    ok('o botao 👁 mostra 1/N', await p.evaluate(n => document.getElementById('bBkTodos').textContent.includes('1/' + n), e.length));
    // seguranca: leitura perdida depois de ter existido -> banco desmarcado reaparece
    const outro = e.find(x => x.id !== selId && x.unk).id;
    await p.evaluate(id => { LINK.banco[id] = Object.assign(LINK.banco[id] || {}, { visto: true, ok: false }); }, outro); await p.waitForTimeout(1200); e = await est();
    ok('SEGURANCA: banco desmarcado cuja leitura foi PERDIDA depois de existir reaparece', e.find(x => x.id === outro).oculto === false, JSON.stringify(e.find(x => x.id === outro)));
    await p.evaluate(() => { window.bancoUsado = () => { throw new Error('x'); }; }); await p.waitForTimeout(1200);
    ok('erro ao decidir a selecao nao quebra a tela', erros.length === 0, erros.slice(0, 2).join(' | '));
    await p.evaluate(() => document.getElementById('bBkTodos').click()); await p.waitForTimeout(700); e = await est();
    ok('👁 alterna para Todos (nenhum oculto)', e.every(x => !x.oculto));
    await ctx.close();
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + R.filter(x => x).length + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
