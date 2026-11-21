// Medidor 1.10.212 — ALARME INTELIGENTE: contexto (Demo local sem alarme de PLC), escopo (so banco em uso), causa-raiz (1 alarme + dependentes), seguranca nao suprimida, linha "Monitorando".
// Abre o arquivo direto (file://), servidor SIMULADO por page.route. Uso: node tests/e2e/alarme_inteligente.js   (MEDIDOR=nome.html)
const { chromium } = require('playwright'); const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || require('../versoes.js').medidorAtual());
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
const ativos = p => p.evaluate(() => OCOR.ativas().map(o => o.cod + (o.ref ? '|' + o.ref : '')).sort());
(async () => {
  const b = await chromium.launch();
  for (const [nome, vp, mobile] of [['desktop 1280', { width: 1280, height: 800 }, false], ['celular 390', { width: 390, height: 844 }, true]]) {
    console.log('\n## ' + nome);
    const nova = async (queda) => { const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage(); await p.addInitScript(() => { window.OCOR_DEBOUNCE_ESCALA = 0; }); p.erros = []; p.on('pageerror', e => p.erros.push(e.message));
      const resp = r => queda ? r.abort() : r.fulfill({ status: 503, body: '{}' }); await p.route('**/*/api/**', resp); await p.route('**/api/**', resp); await p.goto('file://' + ARQ); return { ctx, p }; };
    // 1) Demo local: sem alarme de PLC
    { const { ctx, p } = await nova(); await p.waitForTimeout(1500);
      await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(9000);
      const a = await ativos(p); const falsos = a.filter(x => /^(COM-001|COM-002|CHV-006)/.test(x));
      ok('Demo local: nenhum alarme de leitura do PLC (COM-001/COM-002/CHV-006)', falsos.length === 0, JSON.stringify(a));
      const m = await p.evaluate(() => document.getElementById('ocMonit') && document.getElementById('ocMonit').textContent);
      ok('linha "Monitorando" diz que o PLC nao e monitorado no Demo local', /Monitorando/.test(m || '') && /não monitorado/.test(m), m);
      ok('sem erro de JavaScript (Demo)', p.erros.length === 0, p.erros.slice(0, 2).join(' | ')); await ctx.close(); }
    // 2) Real, servidor FORA DA REDE: UMA causa (COM-002); COM-001, CHV-006 e COM-003 nao aparecem
    { const { ctx, p } = await nova(true); await p.waitForTimeout(1200);
      await p.evaluate(() => { SRVM.url = 'http://servidor-teste:1880'; }); await p.waitForTimeout(9500);
      const a = await ativos(p);
      ok('servidor fora: 1 causa-raiz COM-002', a.filter(x => x.startsWith('COM-002')).length === 1, JSON.stringify(a));
      ok('servidor fora: COM-001, CHV-006 e COM-003 NAO aparecem (sao consequencia)', !a.some(x => /^(COM-001|CHV-006|COM-003)/.test(x)), JSON.stringify(a));
      const t = await p.evaluate(() => (OCOR.ativas().find(o => o.cod === 'COM-002') || {}).txt || '');
      ok('o texto da causa diz o que foi afetado (bancos e registro)', /afeta também/.test(t) && /registro do ensaio/.test(t), t.slice(0, 200));
      await ctx.close(); }
    // 2b) Node-RED respondendo (HTTP 503), os dois bancos em uso e sem leitura: 1 alarme COM-001 por banco, sem CHV-006 duplicado
    { const { ctx, p } = await nova(false); await p.waitForTimeout(1200);
      await p.evaluate(() => { SRVM.url = 'http://servidor-teste:1880'; window.bancoUsado = () => true; }); await p.waitForTimeout(10000);
      const a = await ativos(p); const ids = await p.evaluate(() => BANCOS_PLC.map(b => b.id));
      ok('PLC fora com os bancos em uso: 1 COM-001 por banco e nenhum CHV-006', ids.every(id => a.includes('COM-001|BC' + id)) && !a.some(x => x.startsWith('CHV-006')), JSON.stringify(a)); await ctx.close(); }
    // 3) Real, servidor das chaves OK mas PLC do banco sem leitura: so o banco EM USO alarma, 1 alarme por banco (COM-001), sem CHV-006
    { const { ctx, p } = await nova(); await p.waitForTimeout(1200);
      await p.evaluate(() => { SRVM.url = 'http://servidor-teste:1880'; window.__em = ['__nenhum__']; window.bancoUsado = id => window.__em.includes(id); window.__relogio = setInterval(() => { LINK.chv = Object.assign(LINK.chv, { ok: true, visto: true, ts: Date.now() }); }, 300); });
      await p.waitForTimeout(7000);
      let a = await ativos(p); ok('nenhum banco em uso: nenhum alarme de PLC', !a.some(x => /^(COM-001|CHV-006)/.test(x)), JSON.stringify(a));
      const ids = await p.evaluate(() => BANCOS_PLC.map(b => b.id)); const alvo = ids[0], outro = ids[1];
      await p.evaluate(id => { window.__em = [id]; }, alvo); await p.waitForTimeout(2000);
      a = await ativos(p); ok('banco recem-selecionado espera ~4 s antes de alarmar (nao pisca)', !a.some(x => x.startsWith('COM-001')), JSON.stringify(a));
      await p.waitForTimeout(4500); a = await ativos(p);
      ok('banco em uso e sem leitura: 1 alarme COM-001 so dele', a.filter(x => x.startsWith('COM-001')).join() === 'COM-001|BC' + alvo, JSON.stringify(a));
      ok('o banco fora de uso nao alarma e CHV-006 nao duplica', !a.includes('COM-001|BC' + outro) && !a.some(x => x.startsWith('CHV-006')), JSON.stringify(a));
      // falha-segura: se nao der para saber, trata como em uso
      await p.evaluate(() => { window.bancoUsado = () => { throw new Error('x'); }; }); await p.waitForTimeout(5500); a = await ativos(p);
      ok('erro ao decidir "em uso" = trata como em uso (nao esconde)', ids.every(id => a.includes('COM-001|BC' + id)), JSON.stringify(a));
      // seguranca nao suprimida: CHV-005 de banco fora de uso continua ativo
      await p.evaluate(() => { window.bancoUsado = () => false; OCOR.set('bco', 'CHV-005', 'BCteste: banco bloqueado', { ref: 'BCteste' }); }); await p.waitForTimeout(2500); a = await ativos(p);
      ok('seguranca (CHV-005) nunca e suprimida pelo "fora de uso"', a.includes('CHV-005|BCteste'), JSON.stringify(a));
      const m = await p.evaluate(() => document.getElementById('ocMonit').textContent); ok('linha "Monitorando" cita o PLC em modo real', /Monitorando/.test(m) && /PLC:/.test(m) && !/não monitorado/.test(m), m);
      ok('sem erro de JavaScript (Real)', p.erros.length === 0, p.erros.slice(0, 2).join(' | ')); await ctx.close(); }
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + R.filter(x => x).length + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
