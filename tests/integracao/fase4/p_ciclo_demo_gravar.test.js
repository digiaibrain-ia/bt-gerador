'use strict';
// 11/11/2026 - POS-ENSAIO: depois de terminar e GRAVAR o ensaio no Demo, a tela principal volta a ter os mesmos botoes habilitados de antes do ensaio (nenhum ficou desabilitado por engano) e os chips do Patamar
// voltam a poder ser escolhidos. Lição: depois de gravar, os chips do Patamar ficavam desabilitados (a tela ainda achava que o ensaio estava em curso) e nenhum teste passava por esse caminho.
// A mesma bateria na 1.10.195 (BT2_MED) tem que FALHAR.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const FER = path.join(__dirname, '..', '..', '..', 'dashboard', 'ferramentas'), CAT = path.join(__dirname, '..', '..', '..', 'catalogo');
const MED = process.env.BT2_MED || 'medidor_gerador_v1.10.199.html';
let srv, port, b;
before(async () => {
  srv = http.createServer((q, r) => { const u = q.url.split('?')[0].replace(/^\//, ''); const f = fs.existsSync(path.join(FER, u)) ? path.join(FER, u) : path.join(CAT, u); if (fs.existsSync(f) && fs.statSync(f).isFile()) { r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.csv') ? 'text/csv; charset=utf-8' : 'text/html; charset=utf-8' }); r.end(fs.readFileSync(f)); } else { r.writeHead(404); r.end(); } });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); port = srv.address().port; b = await chromium.launch();
});
after(async () => { if (b) await b.close(); if (srv) srv.close(); });
for (const botao of ['resOkSemPdf', 'resOk']) {
  test('apos gravar (' + botao + ') nenhum botao da tela fica desabilitado por engano', async () => {
    const p = await b.newPage({ viewport: { width: 1536, height: 900 } }); const erros = []; p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.dismiss()); await p.addInitScript(() => { window.print = () => {}; });
    await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto(`http://127.0.0.1:${port}/${MED}`); await p.waitForTimeout(1800);
    await p.fill('#demoSenha', 'mwm'); await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(1800);
    await p.evaluate(() => { const e = document.getElementById('dPot'); e.value = '145,5'; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); });
    const dis = () => p.evaluate(() => Object.fromEntries([...document.querySelectorAll('button,input:not([type=hidden]),select')].filter(e => e.offsetParent && (!e.closest('dialog') || e.closest('dialog').id === 'dlgGuiado')).map(e => [(e.id || e.dataset.gd || e.className || e.tagName) + '|' + (e.textContent || e.value || '').trim().slice(0, 16), !!e.disabled])));
    const antes = await dis();
    await p.evaluate(() => { [...document.querySelectorAll('#patCard button')].find(x => /^30 %$/.test(x.textContent.trim())).click(); T.started = true; T.run = false; T.fim = true; T.et = ETAPAS.length - 1; }); await p.waitForTimeout(1200);
    await p.evaluate(id => { document.getElementById('dlgRes').showModal(); document.getElementById(id).click(); }, botao); await p.waitForTimeout(1800);
    const depois = await dis(); const novos = Object.keys(depois).filter(k => depois[k] && antes[k] === false);
    assert.deepEqual(novos, [], 'ficaram desabilitados depois de gravar: ' + novos.slice(0, 8).join(' ; ')); assert.equal(erros.length, 0, erros.join(';')); await p.close();
  });
}
