'use strict';
// 13/11/2026 - MENU ☰ na OPERACAO e no DEV (medidor 1.10.201 + menu_dev_v0.3.js).
// Prova: (1) operacao (sem ?dev): o botao ☰ aparece e o painel lista SO Medidor e Grafico do ensaio, sem Verificar/Atualizar/index; (2) dev (?dev=1): lista as 7 ferramentas + Verificar + Atualizar + link index.html;
// (3) ?dev=0 volta a operacao. Mutacao: com o menu v0.2 no lugar (BT2_MENU_ANTIGO=1) a bateria tem que FALHAR (botao escondido na operacao).
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path');
const { chromium } = require('playwright');
const R = path.join(__dirname, '..', '..', '..'), FER = path.join(R, 'dashboard', 'ferramentas'), MF = path.join(R, 'dashboard', 'modulos-fonte');
const MED = process.env.BT2_MED || 'medidor_gerador_v1.10.201.html';
let dir, srv, port, b;
before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'menu-')); fs.copyFileSync(path.join(FER, MED), path.join(dir, MED)); fs.copyFileSync(path.join(FER, 'catalogo_ferramentas.js'), path.join(dir, 'catalogo_ferramentas.js'));
  fs.copyFileSync(path.join(MF, process.env.BT2_MENU_ANTIGO ? 'menu_dev_v0.2.js' : 'menu_dev_v0.3.js'), path.join(dir, 'menu_dev_v0.3.js'));
  srv = http.createServer((q, r) => { const f = path.join(dir, q.url.split('?')[0].replace(/^\//, '')); if (fs.existsSync(f) && fs.statSync(f).isFile()) { r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8' }); r.end(fs.readFileSync(f)); } else { r.writeHead(404); r.end(); } });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); port = srv.address().port; b = await chromium.launch();
});
after(async () => { if (b) await b.close(); if (srv) srv.close(); });
async function abre(qs) {
  const ctx = await b.newContext(), p = await ctx.newPage(), erros = []; p.on('pageerror', e => erros.push(e.message));
  await p.route('**/api/**', r => r.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await p.goto(`http://127.0.0.1:${port}/${MED}${qs}`); await p.waitForTimeout(1200);
  const vis = await p.evaluate(() => { const x = document.querySelector('.mdv-b'); return !!x && getComputedStyle(x).display !== 'none' && x.offsetParent !== null; });
  let itens = [], tem = {};
  if (vis) { await p.click('.mdv-b'); await p.waitForTimeout(300); itens = await p.$$eval('.mdv-p .mdv-i', a => a.map(x => x.dataset.id)); tem = await p.evaluate(() => ({ ver: !!document.querySelector('#mdv-ver'), up: !!document.querySelector('#mdv-up'), es: !!document.querySelector('#mdv-es') })); }
  await ctx.close(); return { vis, itens, tem, erros };
}
test('operacao: ☰ visivel com so Medidor e Grafico, sem funcoes de dev', async () => {
  const r = await abre(''); assert.ok(r.vis, 'o botao ☰ nao aparece na operacao'); assert.deepEqual(r.itens, ['medidor', 'grafico']); assert.deepEqual(r.tem, { ver: false, up: false, es: false }); assert.equal(r.erros.length, 0, r.erros.join(';'));
});
test('dev (?dev=1): todas as ferramentas + Verificar/Atualizar/Esquecer + index', async () => {
  const r = await abre('?dev=1'); assert.ok(r.vis); assert.deepEqual(r.itens, ['medidor', 'grafico', 'apivisor', 'maquete', 'mapa', 'gerenciador', 'amostras', 'index']); assert.deepEqual(r.tem, { ver: true, up: true, es: true }); assert.equal(r.erros.length, 0, r.erros.join(';'));
});
test('?dev=0 volta para a operacao', async () => {
  const r = await abre('?dev=0'); assert.ok(r.vis); assert.deepEqual(r.itens, ['medidor', 'grafico']);
});
