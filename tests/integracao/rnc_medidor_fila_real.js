// Medidor 1.10.216 contra o fluxo RNC v1.1 REAL (Node-RED 5.x do harness, pasta de dados temporaria): sem rede -> fila + .csv -> rede volta -> 1 RNC criada (nao duplica) -> serie BLOQUEADA.
// Uso: cd tests/integracao && BT2_AMBIENTE_TESTE=local node rnc_medidor_fila_real.js
const path = require('path'), os = require('os'), fs = require('fs'); const { chromium } = require('playwright');
const { ENV_TESTE, sobe } = require('./ajudas.js');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || 'medidor_gerador_v1.10.216.html');
const FLUXO = path.resolve(__dirname, '..', '..', 'nodered', 'flows', 'rnc-api-v1.1.json');
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnc-dados-teste-'));
  const h = await sobe({ fluxos: [], fluxosCaminho: [FLUXO], env: Object.assign({}, ENV_TESTE, { RNC_DIR: dir }) });
  const b = await chromium.launch();
  try {
    await new Promise(r => setTimeout(r, 1500));
    const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true }); const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
    let fora = true, posts = 0;
    await p.route('http://servidor-teste:1880/**', async r => { const u = new URL(r.request().url()); if (fora) return r.abort(); if (r.request().method() === 'POST') posts++;
      const resp = await r.fetch({ url: h.url + u.pathname + u.search }); return r.fulfill({ response: resp }); });
    await p.route('**/api/**', r => /servidor-teste/.test(r.request().url()) ? r.fallback() : r.fulfill({ status: 503, body: '{}' }));
    await p.goto('file://' + ARQ); await p.waitForTimeout(2200);
    await p.evaluate(() => { SRVM.url = 'http://servidor-teste:1880'; const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); RNC_DEFEITO.ativa(true); }); await p.waitForTimeout(600);
    await p.evaluate(() => document.getElementById('bRnc').click()); await p.waitForTimeout(400);
    await p.fill('#rncSerie', 'FILA00000000000001'); await p.fill('#rncModelo', 'Modelo de teste'); await p.fill('#rncNome', 'Tecnico Teste'); await p.fill('#rncDesc', 'defeito registrado sem rede');
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 6000 }), p.evaluate(() => document.getElementById('rncEnv').click())]); await p.waitForTimeout(400);
    ok('sem rede: foi para a fila e baixou o .csv', (await p.evaluate(() => RNC_DEFEITO.fila().length)) === 1 && /\.csv$/.test(dl.suggestedFilename()));
    const s0 = await fetch(h.url + '/api/rnc/serie/FILA00000000000001').then(r => r.json()); ok('o servidor real NAO tem a RNC ainda', s0.total === 0, JSON.stringify(s0).slice(0, 120));
    fora = false; await p.evaluate(() => window.dispatchEvent(new Event('online'))); await p.waitForTimeout(2000);
    await p.evaluate(() => RNC_DEFEITO.reenvia()); await p.waitForTimeout(800);   // segundo reenvio: nao pode duplicar
    const s1 = await fetch(h.url + '/api/rnc/serie/FILA00000000000001').then(r => r.json());
    ok('rede voltou: o servidor real tem EXATAMENTE 1 RNC e a serie esta BLOQUEADA', s1.total === 1 && s1.situacao === 'BLOQUEADO', JSON.stringify({ total: s1.total, situacao: s1.situacao, posts }));
    // reenvio com a MESMA chave (simula resposta perdida): o servidor devolve a mesma RNC, sem criar outra
    const csv = fs.readFileSync(await dl.path(), 'utf8'); const lin = csv.split('\r\n')[1].split('";"'); const chave = lin[0].replace(/^"/, '');
    const dup = await fetch(h.url + '/api/rnc/abrir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serial: 'FILA00000000000001', modelo: 'Modelo de teste', banco: 'BT2', tipo_nc: 'FALHA_ENSAIO', descricao: '[DEMO] defeito registrado sem rede', actor: 'Tecnico Teste', idempotency_key: chave }) }).then(r => r.json());
    const s2 = await fetch(h.url + '/api/rnc/serie/FILA00000000000001').then(r => r.json());
    ok('reenviar a chave do .csv NAO cria outra RNC (idempotencia no servidor real)', s2.total === 1, JSON.stringify({ total: s2.total, resp: dup.ok }));
    ok('sem erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | '));
  } finally { await b.close(); await h.para(); }
  const f = R.filter(x => !x).length; console.log('\n' + R.filter(x => x).length + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})().catch(e => { console.error('ERRO', e.message); process.exit(1); });
