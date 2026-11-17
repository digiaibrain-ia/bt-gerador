'use strict';
// 11/11/2026 - HOVER ESTAVEL: passar o mouse (hover REAL do navegador) em cada objeto interativo, icone e chip da tela principal NAO pode mudar posicao/tamanho de painel, coluna ou card, nem a area de rolagem.
// Perfis: notebook 1536x694 (tela do Reginaldo) e desktop 1280x800. Lição: o balao do icone "i" empurrava os cards so no 1536x694 e ninguem testava esse tamanho. A mesma bateria na 1.10.196 (BT2_MED) tem que FALHAR no 1536x694.
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
for (const [w, h] of [[1536, 694], [1280, 800]]) {
  test(`hover nao muda o layout (${w}x${h})`, async () => {
    const p = await b.newPage({ viewport: { width: w, height: h } }); p.on('dialog', d => d.dismiss());
    await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto(`http://127.0.0.1:${port}/${MED}`); await p.waitForTimeout(1800);
    await p.fill('#demoSenha', 'mwm'); await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(1800);
    const snap = () => p.evaluate(() => [...document.querySelectorAll('section.panel, .col, .card, .hrow')].filter(e => e.offsetParent).map(e => { const r = e.getBoundingClientRect(); return Math.round(r.top) + ',' + Math.round(r.left) + ',' + Math.round(r.width) + ',' + Math.round(r.height); }).join(';') + '|' + document.documentElement.scrollWidth + 'x' + document.documentElement.scrollHeight);
    const n = await p.evaluate(() => { const a = [...document.querySelectorAll('button,[data-tip],.ibub,.lk,.enschip,.tile,label,summary,th')].filter(e => e.offsetParent && e.getBoundingClientRect().width > 2 && e.getBoundingClientRect().height > 2 && !e.closest('dialog:not([open])')); a.slice(0, 220).forEach((e, i) => e.setAttribute('data-hv', i)); return Math.min(a.length, 220); });
    assert.ok(n >= 100, 'poucos objetos para o hover: ' + n); const ruins = [];
    for (let i = 0; i < n; i++) {
      const pos = async () => p.evaluate(k => { const e = document.querySelector('[data-hv="' + k + '"]'); if (!e) return null; e.scrollIntoView({ block: 'center' }); const q = e.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2, d: ((e.id || e.className || e.tagName) + ':' + (e.textContent || '').trim().slice(0, 16)).slice(0, 44) }; }, i);
      let alvo = await pos(); if (!alvo) continue; let mudou = false;
      for (let t = 0; t < 2; t++) { await p.mouse.move(2, 2); await p.waitForTimeout(80); const s0 = await snap(); alvo = await pos(); await p.mouse.move(alvo.x, alvo.y); await p.waitForTimeout(220); mudou = (await snap()) !== s0; if (!mudou) break; }   // 2 tentativas: ruido de relogio/atualizacao nao conta
      if (mudou) ruins.push(alvo.d);
    }
    await p.close(); assert.equal(ruins.length, 0, 'o hover mudou o layout em: ' + ruins.slice(0, 6).join(' ; '));
  });
}
