'use strict';
// 10-11/11/2026 - Dev/Operador oculto: modo "Inspecao visual (rapida)" (medidor 1.10.199). Prova: (1) no tamanho do notebook (1536x694) o robo percorre os objetos, foca/passa o mouse em cada um e NAO acha
// quebra de layout (falha = 0); (2) o proprio DETECTOR funciona: numa copia do medidor com o balao antigo de volta (CSS ::after dentro do card, sem o balao de ultima camada) o robo ACHA "layout muda ao passar o mouse/focar".
// (O robo cobre :focus e eventos de mouse; o :hover real do CSS e coberto por fase4/n_balao_ibub.test.js e fase4/o_hover_estavel.test.js.)
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path');
const { chromium } = require('playwright');
const FER = path.join(__dirname, '..', '..', '..', 'dashboard', 'ferramentas'), CAT = path.join(__dirname, '..', '..', '..', 'catalogo');
const MED = process.env.BT2_MED || 'medidor_gerador_v1.10.199.html';
let dir, srv, port, b;
before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'insp-')); const t = fs.readFileSync(path.join(FER, MED), 'utf8');
  fs.writeFileSync(path.join(dir, 'real.html'), t);
  // mutante: balao antigo de volta (pseudo-elemento absoluto no card) e o balao de ultima camada desligado
  const m = t.replace('.ibub::after,#modoCard .lk::after{content:none!important;display:none!important}', '').replace("e.target.closest('.ibub,#modoCard .lk')", "null");
  assert.notEqual(m, t, 'o mutante nao alterou o medidor (o teste precisa ser atualizado)'); fs.writeFileSync(path.join(dir, 'mutante.html'), m);
  srv = http.createServer((q, r) => { const u = q.url.split('?')[0].replace(/^\//, ''); const f = fs.existsSync(path.join(dir, u)) ? path.join(dir, u) : fs.existsSync(path.join(FER, u)) ? path.join(FER, u) : path.join(CAT, u); if (fs.existsSync(f) && fs.statSync(f).isFile()) { r.writeHead(200, { 'content-type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.csv') ? 'text/csv; charset=utf-8' : 'text/html; charset=utf-8' }); r.end(fs.readFileSync(f)); } else { r.writeHead(404); r.end(); } });
  await new Promise(ok => srv.listen(0, '127.0.0.1', ok)); port = srv.address().port; b = await chromium.launch();
});
after(async () => { if (b) await b.close(); if (srv) srv.close(); });
async function roda(arq) {
  const p = await b.newPage({ viewport: { width: 1536, height: 694 } }); const erros = []; p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.dismiss());
  await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto(`http://127.0.0.1:${port}/${arq}`); await p.waitForTimeout(2000);
  await p.fill('#demoSenha', 'mwm'); await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(1500);
  const ok = await p.evaluate(() => window.opSecreto.rodarAv({ tipo: 'visual', minutos: 1, semente: 20261107 }));
  const rel = await p.evaluate(() => window.opSecreto.relatorio().map(r => JSON.stringify(r))); const c = await p.evaluate(() => window.opSecreto.contagem()); await p.close(); return { ok, rel, c, erros };
}
test('medidor real no 1536x694: inspecao visual sem quebra de layout', async () => {
  const r = await roda('real.html'); assert.equal(r.ok, true); assert.equal(r.erros.length, 0, r.erros.join(';'));
  const ruins = r.rel.filter(x => /layout muda/.test(x)); assert.equal(ruins.length, 0, 'quebras de layout: ' + ruins.slice(0, 2).join(' // ').slice(0, 300));
  const fase = r.rel.find(x => /objetos inspecionados/.test(x)); assert.ok(fase, 'o robo nao registrou a fase'); assert.match(fase, /"?(\d+) objetos/); const n = +(/(\d+) objetos/.exec(fase) || [])[1]; assert.ok(n >= 60, 'poucos objetos inspecionados: ' + n);
});
test('o detector acha a quebra de layout no mutante (balao antigo)', async () => {
  const r = await roda('mutante.html'); const ruins = r.rel.filter(x => /layout muda/.test(x)); assert.ok(ruins.length >= 1, 'o robo NAO achou a quebra de layout que o balao antigo causa (detector sem efeito)');
});
