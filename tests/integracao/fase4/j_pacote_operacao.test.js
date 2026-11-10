'use strict';
// 10/11/2026 - PACOTE DE OPERACAO = so medidor + catalogo_modelos_v0.1.csv (sem index, sem catalogo de ferramentas, sem menu_dev, sem arquivo do grafico).
// Prova: (1) o medidor abre sem erro de JS; (2) o botao "Analisar" abre o grafico EMBUTIDO (titulo "Grafico do ensaio"); (3) o catalogo de modelos e pedido e encontrado (200); (4) o index_v0.6 (so dev) cita o catalogo v0.8.
// A mesma bateria sem o CSV (BT2_OP_SEM_CSV=1) tem que FALHAR no item 3.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path');
const { chromium } = require('playwright');
const FER = path.join(__dirname, '..', '..', '..', 'dashboard', 'ferramentas'), CAT = path.join(__dirname, '..', '..', '..', 'catalogo');
const MED = process.env.BT2_MED || 'medidor_gerador_v1.10.192.html';
let dir, srv, port, b; const vistos = [];
before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'op-')); fs.copyFileSync(path.join(FER, MED), path.join(dir, MED));
  if (!process.env.BT2_OP_SEM_CSV) fs.copyFileSync(path.join(CAT, 'catalogo_modelos_v0.1.csv'), path.join(dir, 'catalogo_modelos_v0.1.csv'));
  srv = http.createServer((q, r) => {
    const u = q.url.split('?')[0].replace(/^\//, ''), f = path.join(dir, u); const ok = fs.existsSync(f) && fs.statSync(f).isFile(); vistos.push([u, ok ? 200 : 404]);
    if (ok) { r.writeHead(200, { 'content-type': u.endsWith('.csv') ? 'text/csv; charset=utf-8' : 'text/html; charset=utf-8' }); r.end(fs.readFileSync(f)); } else { r.writeHead(404); r.end(); }
  });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); port = srv.address().port; b = await chromium.launch();
});
after(async () => { if (b) await b.close(); if (srv) srv.close(); });
test('medidor sozinho: abre sem erro de JS e o Analisar abre o grafico embutido', async () => {
  const ctx = await b.newContext(), p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
  await p.route('**/api/**', r => r.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await p.goto(`http://127.0.0.1:${port}/${MED}`); await p.waitForTimeout(1500);
  const pr = ctx.waitForEvent('page', { timeout: 6000 }).catch(() => null);
  await p.evaluate(() => { const x = document.getElementById('graAnalisar'); if (x) x.click(); });
  const pop = await pr; assert.ok(pop, 'o Analisar nao abriu janela'); await pop.waitForTimeout(1200);
  assert.match(await pop.title(), /Gr[aá]fico do ensaio/); assert.equal(erros.length, 0, erros.join(';'));
});
test('o catalogo de modelos (csv) e pedido e encontrado', () => {
  const v = vistos.find(x => x[0] === 'catalogo_modelos_v0.1.csv'); assert.ok(v, 'o medidor nao pediu o catalogo de modelos'); assert.equal(v[1], 200, 'catalogo de modelos nao encontrado na pasta (404)');
});
test('index_v0.6 (so dev) cita o catalogo v0.8 e nao o v0.7', () => {
  const t = fs.readFileSync(path.join(FER, 'index_v0.6.html'), 'utf8'); assert.ok(t.includes('catalogo_ferramentas_v0.8.js')); assert.ok(!t.includes('catalogo_ferramentas_v0.7.js'));
});
