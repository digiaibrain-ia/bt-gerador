'use strict';
// 11/11/2026 - Dev/Operador oculto (medidor 1.10.200): no ensaio do robo Rapido, o Patamar Guiado LIGADO (o salvamento "Por patamar" liga sozinho) e o salvamento fora de Manual sao normalizados (o robo desliga o Patamar e usa
// Manual) e DEVOLVIDOS no fim. Sem isso o ensaio parava na etapa 2 com a carga em 0 % (relatorio do Reginaldo no Poco X6 Pro, 10/11/2026).
// O ciclo completo do robo (~150 s) passou fora da suite (166 OK; so as 8 falhas conhecidas do Setup); aqui se prova a normalizacao/devolucao. A 1.10.199 (BT2_MED) tem que FALHAR.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const FER = path.join(__dirname, '..', '..', '..', 'dashboard', 'ferramentas'), CAT = path.join(__dirname, '..', '..', '..', 'catalogo');
const MED = process.env.BT2_MED || 'medidor_gerador_v1.10.200.html';
let srv, port, b;
before(async () => {
  srv = http.createServer((q, r) => { const u = q.url.split('?')[0].replace(/^\//, ''); const f = fs.existsSync(path.join(FER, u)) ? path.join(FER, u) : path.join(CAT, u); if (fs.existsSync(f) && fs.statSync(f).isFile()) { r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.csv') ? 'text/csv; charset=utf-8' : 'text/html; charset=utf-8' }); r.end(fs.readFileSync(f)); } else { r.writeHead(404); r.end(); } });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); port = srv.address().port; b = await chromium.launch();
});
after(async () => { if (b) await b.close(); if (srv) srv.close(); });
test('o robo desliga o Patamar e usa salvamento Manual no ensaio dele e devolve no fim', async () => {
  const p = await b.newPage({ viewport: { width: 407, height: 904 } }); const erros = []; p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.dismiss());
  await p.addInitScript(() => { try { localStorage.setItem('medidor.porPatamar', '1'); } catch (e) {} });
  await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto(`http://127.0.0.1:${port}/${MED}`); await p.waitForTimeout(2000);
  await p.fill('#demoSenha', 'mwm'); await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(1500);
  const est = () => p.evaluate(() => ({ on: !!GUIADO_DBG.G.guiadoOn, porpat: !!PORPAT, ls: localStorage.getItem('medidor.porPatamar') }));
  assert.deepEqual(await est(), { on: true, porpat: true, ls: '1' }, 'pre-condicao: Por patamar deveria ter ligado o Patamar Guiado');
  assert.equal(await p.evaluate(() => window.opSecreto.normalizaPatamar()), true); assert.equal((await est()).on, false, 'o robo nao desligou o Patamar');
  assert.equal(await p.evaluate(() => window.opSecreto.normalizaSalvamento()), true); const m = await est(); assert.equal(m.porpat, false, 'o salvamento continuou Por patamar'); assert.equal(m.ls, '0');
  assert.equal(await p.evaluate(() => window.opSecreto.restauraSalvamento()), true); assert.equal(await p.evaluate(() => window.opSecreto.restauraPatamar()), true);
  const f = await est(); assert.equal(f.porpat, true, 'o salvamento nao foi devolvido'); assert.equal(f.on, true, 'o Patamar nao foi religado'); assert.equal(erros.length, 0, erros.join(';'));
});
