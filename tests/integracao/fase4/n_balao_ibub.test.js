'use strict';
// 10/11/2026 - medidor 1.10.197/198: baloes de ULTIMA CAMADA (icone "i" e chips do card Modo; nunca mexem no layout) (Patamar e dialogos). Prova: (1) o balao aparece com o texto do data-tip e NAO muda a posicao dos cards (layout igual antes e durante);
// (2) o mouse pode ir ate o balao sem ele sumir e o texto pode ser SELECIONADO (getSelection) e continua aberto com a selecao; (3) dentro de um dialogo MODAL (⚙ Modo) o balao fica por cima (elementFromPoint);
// (4) Esc fecha. A mesma bateria na 1.10.196 (BT2_MED) tem que FALHAR.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const FER = path.join(__dirname, '..', '..', '..', 'dashboard', 'ferramentas'), CAT = path.join(__dirname, '..', '..', '..', 'catalogo');
const MED = process.env.BT2_MED || 'medidor_gerador_v1.10.198.html';
let srv, port, b, p;
before(async () => {
  srv = http.createServer((q, r) => { const u = q.url.split('?')[0].replace(/^\//, ''); const f = fs.existsSync(path.join(FER, u)) ? path.join(FER, u) : path.join(CAT, u); if (fs.existsSync(f) && fs.statSync(f).isFile()) { r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.csv') ? 'text/csv; charset=utf-8' : 'text/html; charset=utf-8' }); r.end(fs.readFileSync(f)); } else { r.writeHead(404); r.end(); } });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); port = srv.address().port; b = await chromium.launch(); p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  p.on('pageerror', e => { throw new Error('erro de JavaScript: ' + e.message); }); p.on('dialog', d => d.dismiss());
  await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto(`http://127.0.0.1:${port}/${MED}`); await p.waitForTimeout(1800);
  await p.fill('#demoSenha', 'mwm'); await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(1800);
});
after(async () => { if (b) await b.close(); if (srv) srv.close(); });
const bancoTop = () => p.evaluate(() => { const bc = [...document.querySelectorAll('section.panel')].find(s => /Banco de Cargas/i.test((s.querySelector('h2') || {}).textContent || '')); return Math.round(bc.getBoundingClientRect().top); });
test('balao do Patamar: aparece, nao muda o layout, deixa selecionar o texto e fecha com Esc', async () => {
  const antes = await bancoTop(); const ib = await p.$('#patCard .ibub'); const tipTxt = await ib.getAttribute('data-tip'); const bx = await ib.boundingBox();
  await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.waitForTimeout(500);
  const vis = await p.evaluate(() => { const t = document.getElementById('ibubTip'); return t ? { disp: getComputedStyle(t).display, txt: t.textContent } : null; });
  assert.ok(vis && vis.disp === 'block', 'o balao nao apareceu'); assert.equal(vis.txt, tipTxt); assert.equal(await bancoTop(), antes, 'o balao mexeu no layout dos cards');
  const tb = await (await p.$('#ibubTip')).boundingBox(); await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2); await p.waitForTimeout(700);
  assert.equal(await p.evaluate(() => getComputedStyle(document.getElementById('ibubTip')).display), 'block', 'o balao sumiu quando o mouse foi ate ele');
  await p.mouse.dblclick(tb.x + 20, tb.y + 14); await p.evaluate(() => { const t = document.getElementById('ibubTip'), r = document.createRange(); r.selectNodeContents(t); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
  assert.equal(await p.evaluate(() => String(getSelection())), tipTxt, 'nao deu para selecionar o texto do balao');
  await p.mouse.move(5, 5); await p.waitForTimeout(700); assert.equal(await p.evaluate(() => getComputedStyle(document.getElementById('ibubTip')).display), 'block', 'o balao fechou com texto selecionado');
  await p.evaluate(() => getSelection().removeAllRanges()); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  assert.equal(await p.evaluate(() => getComputedStyle(document.getElementById('ibubTip')).display), 'none', 'Esc nao fechou o balao');
});
test('layout estavel no viewport do notebook (1536x694): o hover no icone i e nos chips do card Modo nao muda o layout', async () => {
  await p.setViewportSize({ width: 1536, height: 694 }); await p.waitForTimeout(500);
  const snap = () => p.evaluate(() => [...document.querySelectorAll('section.panel, .col, .card, .hrow')].filter(e => e.offsetParent).map(e => { const r = e.getBoundingClientRect(); return Math.round(r.top) + ',' + Math.round(r.left) + ',' + Math.round(r.width) + ',' + Math.round(r.height); }).join(';') + '|' + document.documentElement.scrollWidth + 'x' + document.documentElement.scrollHeight);
  const alvos = await p.evaluate(() => [...document.querySelectorAll('.ibub, #modoCard .lk')].filter(e => e.offsetParent && e.getBoundingClientRect().width > 2 && (e.getAttribute('data-tip') || '').trim()).map((e, i) => { e.setAttribute('data-hvb', i); return i; }));
  assert.ok(alvos.length >= 3, 'esperava ao menos 3 icones/chips com balao visiveis, achei ' + alvos.length);
  for (const i of alvos) {
    await p.evaluate(k => document.querySelector('[data-hvb="' + k + '"]').scrollIntoView({ block: 'center' }), i); await p.mouse.move(2, 2); await p.waitForTimeout(150); const s0 = await snap();
    const r = await p.evaluate(k => { const q = document.querySelector('[data-hvb="' + k + '"]').getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; }, i); await p.mouse.move(r.x, r.y); await p.waitForTimeout(300);
    assert.equal(await snap(), s0, 'o hover no alvo ' + i + ' mudou o layout'); const vis = await p.evaluate(() => { const t = document.getElementById('ibubTip'); return !!t && getComputedStyle(t).display === 'block'; }); assert.ok(vis, 'o balao do alvo ' + i + ' nao apareceu');
  }
  await p.mouse.move(2, 2); await p.setViewportSize({ width: 1400, height: 900 }); await p.waitForTimeout(300);
});
test('balao dentro de dialogo modal fica por cima', async () => {
  await p.evaluate(() => document.getElementById('bModo').click()); await p.waitForTimeout(500);
  const ib = await p.$('#dlgModo .ibub'); const bx = await ib.boundingBox(); await p.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await p.waitForTimeout(500);
  const por = await p.evaluate(() => { const t = document.getElementById('ibubTip'); if (!t) return 'sem'; const r = t.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e && (e.id === 'ibubTip' || t.contains(e)) ? 'topo' : 'coberto por ' + (e && (e.id || e.tagName)); });
  assert.equal(por, 'topo', 'o balao ficou ' + por); await p.keyboard.press('Escape');
});
