'use strict';
// S4 (auditoria dos 5 fundamentos, 17/11/2026): fluxo RNC contra o Node-RED REAL do harness (pasta de dados temporaria "teste").
// AUD-1 "nunca confie no cliente": rotas de ESCRITA so da propria tela (Origin/Referer do mesmo host) e no tipo certo; AUD-2/AUD-3 idempotencia; AUD-6/7 corrida e caminho de arquivo.
// Fluxo testado: BT2_RNC_FLUXO (padrao rnc-api-v1.2). A MESMA bateria na v1.1 (BT2_RNC_FLUXO=rnc-api-v1.1) tem que FALHAR.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path'), os = require('os'), fs = require('fs');
const { ENV_TESTE, sobe } = require('../ajudas.js');
const FLUXO = path.resolve(__dirname, '..', '..', '..', 'nodered', 'flows', (process.env.BT2_RNC_FLUXO || 'rnc-api-v1.2') + '.json');
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const sobeRnc = async extra => { const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnc-dados-teste-')); const h = await sobe({ fluxos: [], fluxosCaminho: [FLUXO], env: Object.assign({}, ENV_TESTE, { RNC_DIR: dir }, extra || {}) }); await new Promise(r => setTimeout(r, 1500)); return h; };
const corpo = (n, extra) => Object.assign({ serial: 'AUDIT' + String(n).padStart(13, '0'), modelo: 'Modelo de teste', banco: 'BT2', tipo_nc: 'DEFEITO', descricao: 'registro de auditoria ' + n, actor: 'Auditor', idempotency_key: 'chave-auditoria-' + n }, extra || {});
const post = (h, rota, ct, body, hdr) => fetch(h.url + rota, { method: 'POST', headers: Object.assign({ 'Content-Type': ct }, hdr || {}), body }).then(async r => { let j = null; try { j = await r.json(); } catch (e) {} return { s: r.status, j }; });
const eventos = h => fetch(h.url + '/api/rnc/saude').then(r => r.json()).then(j => j.eventos);

describe('S4 RNC: guarda de origem (AUD-1)', () => {
  let h; before(async () => { h = await sobeRnc(); }); after(async () => { if (h) await h.para(); });
  const EVIL = { Origin: 'http://evil.example' };
  test('formulario simples (form-urlencoded) de OUTRO site e recusado e nada e gravado', async () => {
    const r = await post(h, '/api/rnc/abrir', 'application/x-www-form-urlencoded', new URLSearchParams(corpo(1)).toString(), EVIL);
    assert.equal(r.s, 403, 'HTTP ' + r.s + ' ' + JSON.stringify(r.j)); assert.equal(await eventos(h), 0);
  });
  test('JSON com Origin de outro site e recusado', async () => { assert.equal((await post(h, '/api/rnc/abrir', 'application/json', JSON.stringify(corpo(2)), EVIL)).s, 403); assert.equal(await eventos(h), 0); });
  test('text/plain de outro site e recusado', async () => { assert.equal((await post(h, '/api/rnc/abrir', 'text/plain', JSON.stringify(corpo(3)), EVIL)).s, 403); });
  test('sem Origin nem Referer (cliente fora do navegador) e recusado: sem_origem', async () => { const r = await post(h, '/api/rnc/abrir', 'application/json', JSON.stringify(corpo(4))); assert.equal(r.s, 403); assert.match(JSON.stringify(r.j), /sem_origem/); assert.equal(await eventos(h), 0); });
  test('mesma origem + JSON: aceito (201)', async () => { const r = await post(h, '/api/rnc/abrir', 'application/json', JSON.stringify(corpo(5)), { Origin: h.url }); assert.equal(r.s, 201, JSON.stringify(r.j)); });
  test('so Referer do mesmo host: aceito', async () => { assert.equal((await post(h, '/api/rnc/abrir', 'application/json', JSON.stringify(corpo(6)), { Referer: h.url + '/html/rnc_registro_v0.2.html' })).s, 201); });
  test('mesma origem mas Content-Type errado (text/plain): recusado', async () => { assert.equal((await post(h, '/api/rnc/abrir', 'text/plain', JSON.stringify(corpo(7)), { Origin: h.url })).s, 403); });
  test('leituras (GET) seguem sem exigir Origin', async () => { for (const u of ['/api/rnc/saude', '/api/rnc', '/api/rnc/serie/AUDIT0000000000005']) assert.equal((await fetch(h.url + u)).status, 200, u); });
  test('evento (mudar estado) de OUTRO site e recusado e a RNC nao muda', async () => {
    const l = await fetch(h.url + '/api/rnc?serial=AUDIT0000000000005').then(r => r.json()); const rnc = l.rncs[0];
    const r = await post(h, '/api/rnc/evento', 'application/x-www-form-urlencoded', new URLSearchParams({ rnc_id: rnc.rnc_id, rev_esperado: rnc.rev, event: 'REPARO_INICIADO', actor: 'X' }).toString(), EVIL);
    assert.equal(r.s, 403); const dep = await fetch(h.url + '/api/rnc?serial=AUDIT0000000000005').then(r => r.json()); assert.equal(dep.rncs[0].estado, 'ABERTA');
    const ok = await post(h, '/api/rnc/evento', 'application/json', JSON.stringify({ rnc_id: rnc.rnc_id, rev_esperado: rnc.rev, event: 'REPARO_INICIADO', data: {}, actor: 'Reparador' }), { Origin: h.url }); assert.equal(ok.s, 200, JSON.stringify(ok.j));
  });
  test('foto de OUTRO site e recusada; da propria tela (PNG) e aceita', async () => {
    const l = await fetch(h.url + '/api/rnc?serial=AUDIT0000000000005').then(r => r.json()); const id = l.rncs[0].rnc_id;
    const ruim = await fetch(h.url + '/api/rnc/foto/' + id + '?actor=X', { method: 'POST', headers: Object.assign({ 'Content-Type': 'image/png' }, EVIL), body: PNG }); assert.equal(ruim.status, 403);
    const bom = await fetch(h.url + '/api/rnc/foto/' + id + '?actor=Reparador', { method: 'POST', headers: { 'Content-Type': 'image/png', Origin: h.url }, body: PNG }); assert.equal(bom.status, 201, 'HTTP ' + bom.status);
  });
});

describe('S4 RNC: BT2_ORIGENS_OK (medidor aberto como arquivo envia Origin: null)', () => {
  let h; before(async () => { h = await sobeRnc({ BT2_ORIGENS_OK: 'null' }); }); after(async () => { if (h) await h.para(); });
  test('Origin null liberado pela variavel; outro site continua recusado', async () => {
    assert.equal((await post(h, '/api/rnc/abrir', 'application/json', JSON.stringify(corpo(20)), { Origin: 'null' })).s, 201);
    assert.equal((await post(h, '/api/rnc/abrir', 'application/json', JSON.stringify(corpo(21)), { Origin: 'http://evil.example' })).s, 403);
  });
});

describe('S4 RNC: idempotencia (AUD-2/AUD-3) e corrida (AUD-6)', () => {
  let h; before(async () => { h = await sobeRnc(); }); after(async () => { if (h) await h.para(); });
  const ORI = h2 => ({ Origin: h2.url });
  test('abrir SEM idempotency_key e recusado (400) e nada e gravado', async () => {
    const c = corpo(30); delete c.idempotency_key; const r = await post(h, '/api/rnc/abrir', 'application/json', JSON.stringify(c), ORI(h)); assert.equal(r.s, 400, JSON.stringify(r.j)); assert.equal(await eventos(h), 0);
  });
  test('mesma chave e MESMO conteudo: 201 e depois 200 repetido, sempre a mesma RNC', async () => {
    const a = await post(h, '/api/rnc/abrir', 'application/json', JSON.stringify(corpo(31)), ORI(h)); const b = await post(h, '/api/rnc/abrir', 'application/json', JSON.stringify(corpo(31)), ORI(h));
    assert.equal(a.s, 201); assert.equal(b.s, 200); assert.equal(b.j.repetido, true); assert.equal(b.j.rnc.rnc_id, a.j.rnc.rnc_id);
  });
  test('mesma chave com OUTRO conteudo: 409 CHAVE_REUTILIZADA e nada novo e gravado', async () => {
    const antes = await eventos(h); const r = await post(h, '/api/rnc/abrir', 'application/json', JSON.stringify(corpo(31, { descricao: 'outro defeito completamente diferente' })), ORI(h));
    assert.equal(r.s, 409, JSON.stringify(r.j)); assert.equal(r.j.codigo, 'CHAVE_REUTILIZADA'); assert.equal(await eventos(h), antes);
  });
  test('4 abrir SIMULTANEOS com a mesma chave criam UMA so RNC', async () => {
    const rs = await Promise.all([1, 2, 3, 4].map(() => post(h, '/api/rnc/abrir', 'application/json', JSON.stringify(corpo(32)), ORI(h))));
    assert.equal(new Set(rs.map(x => x.j.rnc.rnc_id)).size, 1); assert.equal(rs.filter(x => x.s === 201).length, 1);
  });
  test('3 eventos SIMULTANEOS com a mesma rev: 1x200 e 2x409', async () => {
    const c = await post(h, '/api/rnc/abrir', 'application/json', JSON.stringify(corpo(33)), ORI(h)); const { rnc_id, rev } = c.j.rnc;
    const ss = await Promise.all([1, 2, 3].map(() => post(h, '/api/rnc/evento', 'application/json', JSON.stringify({ rnc_id, rev_esperado: rev, event: 'REPARO_INICIADO', data: {}, actor: 'A' }), ORI(h))));
    assert.deepEqual(ss.map(x => x.s).sort(), [200, 409, 409]);
  });
  test('foto: caminho fora da pasta nao e lido (../, %2e%2e, /etc/passwd)', async () => {
    for (const u of ['/api/rnc/foto/%2e%2e/rnc.jsonl', '/api/rnc/foto/%2e%2e%2frnc.jsonl/x', '/api/rnc/foto/..%2f..%2fetc/passwd', '/api/rnc/foto/RNC-2026-0001/%2e%2e%2f%2e%2e%2frnc.jsonl']) assert.equal((await fetch(h.url + u)).status, 404, u);
  });
});
