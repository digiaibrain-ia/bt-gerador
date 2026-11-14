'use strict';
// 10/11/2026 - medidor 1.10.193: o grafico EMBUTIDO (botao Analisar com o medidor sozinho, sem arquivo do grafico na pasta) e o grafico_ensaio v0.13.
// Prova: o popup abre com app-version 0.13, sem erro de JS, e o endereco da API e o da mesma origem (sem IP fixo). A mesma bateria no medidor 1.10.192 (BT2_MED) tem que FALHAR (embutido v0.10).
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path');
const { chromium } = require('playwright');
const FER = path.join(__dirname, '..', '..', '..', 'dashboard', 'ferramentas'), MED = process.env.BT2_MED || 'medidor_gerador_v1.10.193.html';
let dir, srv, port, b;
before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'emb-')); fs.copyFileSync(path.join(FER, MED), path.join(dir, MED));
  srv = http.createServer((q, r) => { const f = path.join(dir, q.url.split('?')[0].replace(/^\//, '')); if (fs.existsSync(f) && fs.statSync(f).isFile()) { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(fs.readFileSync(f)); } else { r.writeHead(404); r.end(); } });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); port = srv.address().port; b = await chromium.launch();
});
after(async () => { if (b) await b.close(); if (srv) srv.close(); });
test('Analisar abre o grafico embutido v0.13, sem IP e sem erro de JS', async () => {
  const ctx = await b.newContext(), p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
  await p.route('**/api/**', r => r.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await p.goto(`http://127.0.0.1:${port}/${MED}`); await p.waitForTimeout(1500);
  const pr = ctx.waitForEvent('page', { timeout: 6000 }).catch(() => null);
  await p.evaluate(() => { const x = document.getElementById('graAnalisar'); if (x) x.click(); });
  const pop = await pr; assert.ok(pop, 'o Analisar nao abriu janela'); await pop.waitForTimeout(1500);
  assert.equal(await pop.evaluate(() => { const m = document.querySelector('meta[name="app-version"]'); return m && m.content; }), '0.13', 'o grafico embutido nao e o v0.13');
  assert.equal(await pop.evaluate(() => document.getElementById('dirUrl').value), `http://127.0.0.1:${port}/api/gerador`, 'o endereco deveria ser o da mesma origem (a janela embutida herda a origem do medidor), sem IP fixo');
  assert.equal(erros.length, 0, erros.join(';'));
});
