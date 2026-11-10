'use strict';
// 10/11/2026 - gerenciador_logs v1.9 e grafico_ensaio v0.13: sem IP real no codigo. Prova: (1) o HTML nao contem IP de rede interna; (2) o grafico, servido por http, usa a mesma origem como endereco;
// (3) aberto como arquivo e sem endereco salvo, o campo da API fica vazio (nao ha IP fixo); (4) sem erro de JavaScript. A mesma bateria nas versoes antigas (BT2_GER_HTML/BT2_GRA_HTML) tem que FALHAR.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const P = path.join(__dirname, '..', '..', '..', 'dashboard', 'ferramentas');
const GER = process.env.BT2_GER_HTML || 'gerenciador_logs_v1.9.html', GRA = process.env.BT2_GRA_HTML || 'grafico_ensaio_v0.13.html';
const IP = /\b(10|172\.(1[6-9]|2[0-9]|3[01])|192\.168)\.\d{1,3}\.\d{1,3}(\.\d{1,3})?\b/;
describe('paginas sem IP real', () => {
  let srv, port, b;
  before(async () => {
    srv = http.createServer((q, r) => { const f = path.join(P, q.url.split('?')[0].replace(/^\//, '')); if (fs.existsSync(f)) { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(fs.readFileSync(f)); } else { r.writeHead(404); r.end(); } });
    await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); port = srv.address().port; b = await chromium.launch();
  });
  after(async () => { if (b) await b.close(); if (srv) srv.close(); });
  const abre = async (arq, modo) => {
    const p = await b.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
    await p.route('**/*', r => (/^http:\/\/127\.0\.0\.1/.test(r.request().url()) || r.request().url().startsWith('file:') ? r.continue() : r.abort()));
    await p.goto(modo === 'http' ? `http://127.0.0.1:${port}/${arq}` : `file://${P}/${arq}`); await p.waitForTimeout(700); return { p, erros };
  };
  test('os dois HTML nao contem IP de rede interna', () => {
    for (const a of [GER, GRA]) assert.ok(!IP.test(fs.readFileSync(path.join(P, a), 'utf8')), 'IP encontrado em ' + a);
  });
  test('grafico: por http usa a mesma origem; como arquivo o campo fica vazio; sem erro de JS', async () => {
    const h = await abre(GRA, 'http'); assert.equal(await h.p.evaluate(() => document.getElementById('dirUrl').value), `http://127.0.0.1:${port}/api/gerador`); assert.equal(h.erros.length, 0, h.erros.join(';')); await h.p.close();
    const f = await abre(GRA, 'file'); assert.equal(await f.p.evaluate(() => document.getElementById('dirUrl').value), '', 'o campo deveria vir vazio em arquivo local'); assert.equal(f.erros.length, 0, f.erros.join(';')); await f.p.close();
  });
  test('gerenciador abre sem erro de JS', async () => { const g = await abre(GER, 'http'); assert.equal(g.erros.length, 0, g.erros.join(';')); await g.p.close(); });
});
