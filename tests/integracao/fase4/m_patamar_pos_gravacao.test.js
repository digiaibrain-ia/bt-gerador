'use strict';
// 10/11/2026 - medidor 1.10.195: ao GRAVAR o ensaio (sem ou com relatorio) o card PATAMAR volta ao estado inicial (sem patamar escolhido; nao segue mais a ultima etapa).
// Prova: com o patamar 30 % escolhido e o ensaio terminado, depois de gravar (sem ou com relatorio) o patamar escolhido volta a "nenhum" (G.pat = -1) e some a mensagem da ultima etapa ("etapa sem carga").
// v1.10.196: depois de gravar os chips voltam a ser clicaveis. A mesma bateria na 1.10.194/195 (BT2_MED) tem que FALHAR.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const FER = path.join(__dirname, '..', '..', '..', 'dashboard', 'ferramentas'), CAT = path.join(__dirname, '..', '..', '..', 'catalogo');
const MED = process.env.BT2_MED || 'medidor_gerador_v1.10.196.html';
let srv, port, b;
before(async () => {
  srv = http.createServer((q, r) => { const u = q.url.split('?')[0].replace(/^\//, ''); const f = fs.existsSync(path.join(FER, u)) ? path.join(FER, u) : path.join(CAT, u); if (fs.existsSync(f) && fs.statSync(f).isFile()) { r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.csv') ? 'text/csv; charset=utf-8' : 'text/html; charset=utf-8' }); r.end(fs.readFileSync(f)); } else { r.writeHead(404); r.end(); } });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); port = srv.address().port; b = await chromium.launch();
});
after(async () => { if (b) await b.close(); if (srv) srv.close(); });
for (const botao of ['resOkSemPdf', 'resOk']) {
  test('apos gravar (' + botao + ') o card Patamar volta ao inicial', async () => {
    const p = await b.newPage({ viewport: { width: 1400, height: 1100 } }); const erros = []; p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.dismiss());
    await p.addInitScript(() => { window.print = () => {}; });
    await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' }));
    await p.goto(`http://127.0.0.1:${port}/${MED}`); await p.waitForTimeout(1800);
    await p.fill('#demoSenha', 'mwm'); await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(1800);
    await p.evaluate(() => { const e = document.getElementById('dPot'); e.value = '145,5'; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); });
    await p.evaluate(() => { const x = [...document.querySelectorAll('#patCard button')].find(b => /^30 %$/.test(b.textContent.trim())); x.click(); }); await p.waitForTimeout(400);
    await p.evaluate(() => { T.started = true; T.run = false; T.fim = true; T.et = ETAPAS.length - 1; }); await p.waitForTimeout(1500);
    assert.equal(await p.evaluate(() => GUIADO_DBG.G.pat), 1, 'pre-condicao: o patamar 30 % deveria estar escolhido antes de gravar');
    await p.evaluate(id => { document.getElementById('dlgRes').showModal(); document.getElementById(id).click(); }, botao); await p.waitForTimeout(1800);
    const depois = await p.evaluate(() => document.getElementById('patCard').innerText);
    assert.doesNotMatch(depois, /etapa sem carga/, 'o card continuou com a mensagem da ultima etapa depois de gravar');
    assert.equal(await p.evaluate(() => GUIADO_DBG.G.pat), -1, 'o patamar escolhido nao voltou ao inicial (sem patamar)');
    assert.ok(await p.evaluate(() => !!T.fim && !!T.gravado), 'o ensaio deveria estar gravado');
    // v1.10.196: com o ensaio gravado os chips de patamar voltam a poder ser escolhidos
    assert.equal(await p.evaluate(() => { const c = [...document.querySelectorAll('#patCard button.gd-chip')].find(x => /30 %/.test(x.textContent)); return c ? c.disabled : 'sem chip'; }), false, 'o chip 30 % continua desabilitado depois de gravar');
    await p.evaluate(() => [...document.querySelectorAll('#patCard button.gd-chip')].find(x => /30 %/.test(x.textContent)).click()); await p.waitForTimeout(400);
    assert.equal(await p.evaluate(() => GUIADO_DBG.G.pat), 1, 'o clique no chip 30 % nao escolheu o patamar depois de gravar'); assert.equal(erros.length, 0, erros.join(';')); await p.close();
  });
}
