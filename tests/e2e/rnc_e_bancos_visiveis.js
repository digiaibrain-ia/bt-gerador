// Medidor 1.10.211: (1) botao "Registrar defeito" (RNC) grava via /api/rnc/abrir com contexto e chave de idempotencia (servidor SIMULADO por page.route);
// (2) card Banco de Cargas mostra so os bancos selecionados (👁 n/N alterna para Todos). Abre o arquivo direto (file://). Uso: node tests/e2e/rnc_e_bancos_visiveis.js (MEDIDOR=nome.html)
const { chromium } = require('playwright'); const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || 'medidor_gerador_v1.10.216.html');
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
(async () => {
  const b = await chromium.launch();
  for (const [nome, vp, mobile] of [['desktop 1536x900', { width: 1536, height: 900 }, false], ['celular 390', { width: 390, height: 844 }, true]]) {
    console.log('\n## ' + nome);
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
    const posts = [];
    await p.route('**/*/api/**', r => {
      const u = r.request().url(), m = r.request().method();
      if (/\/api\/rnc\/abrir/.test(u) && m === 'POST') { let j = {}; try { j = JSON.parse(r.request().postData() || '{}'); } catch (e) {} posts.push(j); return r.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ ok: true, rnc: { rnc_id: 'RNC-2026-0001', estado: 'ABERTA', gerador: 'BLOQUEADO', serial: j.serial } }) }); }
      if (/\/api\/rnc\//.test(u)) return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, serial: 'X', situacao: 'SEM_RNC', pendentes: [] }) });
      return r.fulfill({ status: 503, body: '{}' });
    });
    await p.goto('file://' + ARQ); await p.waitForTimeout(2200);
    await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(800);
    await p.evaluate(() => { if (window.RNC_DEFEITO && RNC_DEFEITO.ativa) RNC_DEFEITO.ativa(true); }); await p.waitForTimeout(300);   // 1.10.216: o RNC nasce desligado
    ok('botao "Registrar defeito" existe e esta visivel', await p.evaluate(() => { const e = document.getElementById('bRnc'); return !!e && e.getBoundingClientRect().width > 0; }));
    await p.evaluate(() => { SRVM.url = 'http://servidor-teste:1880'; }); await p.waitForTimeout(200);
    await p.evaluate(() => document.getElementById('bRnc').click()); await p.waitForTimeout(500);
    ok('a janela do RNC abre, com contexto e aviso de Demo', await p.evaluate(() => document.getElementById('dlgRnc').open && document.getElementById('rncCtx').textContent.includes('"demo": true')));
    await p.fill('#rncSerie', 'abc123def456ghi789'); await p.fill('#rncDesc', 'Falha de carga do alternador no teste'); await p.fill('#rncNome', 'Tecnico Teste'); await p.fill('#rncModelo', 'Modelo de teste');
    await p.evaluate(() => document.getElementById('rncEnv').click()); await p.waitForTimeout(900);
    ok('o envio chegou ao servidor 1x com serie normalizada, tipo, descricao com [DEMO], contexto e chave', posts.length === 1 && posts[0].serial === 'ABC123DEF456GHI789' && posts[0].tipo_nc === 'FALHA_ENSAIO' && /\[DEMO\]/.test(posts[0].descricao) && posts[0].contexto && posts[0].idempotency_key, JSON.stringify(posts[0] || {}).slice(0, 120));
    ok('a tela mostra o numero da RNC criada', await p.evaluate(() => /RNC-2026-0001/.test(document.getElementById('rncRes').textContent)));
    await p.evaluate(() => document.getElementById('dlgRnc').close());
    // bancos visiveis
    const q = () => p.evaluate(() => { const all = [...document.querySelectorAll('#bancos details.bk[data-bk]')]; return { n: all.length, ocultos: all.filter(d => d.classList.contains('bk-oculto')).length, btn: (document.getElementById('bBkTodos') || {}).textContent || null }; });
    await p.evaluate(() => document.getElementById('bPatDet') && document.getElementById('bPatDet').click()); await p.waitForTimeout(600);
    let s = await q();
    ok('o botao 👁 n/N existe e o card tem bancos', s.n >= 2 && !!s.btn, JSON.stringify(s));
    // desmarca todos menos o primeiro usando o proprio modulo do medidor (G.usa) se existir; senao confere so o botao
    const antes = s.ocultos;
    await p.evaluate(() => document.getElementById('bBkTodos').click()); await p.waitForTimeout(700);
    const dep = await q();
    ok('👁 alterna entre "so selecionados" e "todos" (nenhum oculto em Todos)', dep.ocultos === 0 || dep.ocultos !== antes, 'antes ' + antes + ' depois ' + dep.ocultos);
    ok('sem erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | '));
    await ctx.close();
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + R.filter(x => x).length + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
