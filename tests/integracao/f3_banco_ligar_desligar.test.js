'use strict';
// F3 - Ligar e desligar o BANCO (POST /banco): so liga com comunicacao com o ET200 e seletora em Auto.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe } = require('./ajudas.js');

describe('F3 ligar e desligar o banco BC56', () => {
  let h, e;
  before(async () => {
    h = await sobe({ fluxos: ['chaves-56-api-v3.0'], env: ENV_TESTE });
    e = enderecos('56');
    await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 5000);
  });
  after(async () => { if (h) await h.para(); });

  test('caminho feliz: com ET200 ok e seletora em Auto, o banco liga', async () => {
    h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.comEt200Ok === true, 3000));
    const r = await post(h, '/api/chaves/56/banco', { ligar: true });
    assert.equal(r.status, 200, r.t);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.bancoLigado === true, 3000), 'o banco nao ficou ligado');
  });

  test('erro: sem comunicacao com o ET200 o banco NAO liga (409)', async () => {
    h.plc.escrever(e.comOk, false);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.comEt200Ok === false, 3000));
    const r = await post(h, '/api/chaves/56/banco', { ligar: true });
    assert.equal(r.status, 409);
    assert.match(r.j.erro, /sem comunicacao/);
    h.plc.escrever(e.comOk, true);
  });

  test('erro: seletora em Manual (local) nao deixa ligar pelo HTML (409)', async () => {
    h.plc.escrever(e.seletora, false);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.seletora === 'manual', 3000));
    const r = await post(h, '/api/chaves/56/banco', { ligar: true });
    assert.equal(r.status, 409);
    assert.match(r.j.erro, /Manual/);
    h.plc.escrever(e.seletora, true);
  });

  test('erro: corpo sem "ligar" booleano devolve 400', async () => {
    assert.equal((await post(h, '/api/chaves/56/banco', { ligar: 'sim' })).status, 400);
  });

  test('desligar o banco zera o comando de TODAS as chaves (abre tudo)', async () => {
    h.plc.escrever(e.cb(1), true); h.plc.escrever(e.cb(7), true);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.cbLigar[0] === true, 3000));
    const r = await post(h, '/api/chaves/56/banco', { ligar: false });
    assert.equal(r.status, 200, r.t);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.cbLigar.every(x => x === false), 3000), 'alguma chave continuou comandada');
  });
});
