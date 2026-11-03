'use strict';
// F6 - Fila de gravacao: comandos simultaneos, repeticao (idempotencia) e recuperacao depois de erro de escrita.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe } = require('./ajudas.js');

describe('F6 fila de gravacao do BC56', () => {
  let h, e;
  before(async () => {
    h = await sobe({ fluxos: ['chaves-56-api-v3.0'], env: ENV_TESTE });
    e = enderecos('56');
    await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 5000);
  });
  after(async () => { if (h) await h.para(); });

  test('8 habilitacoes simultaneas: todas respondem 200 e todas chegam no PLC', async () => {
    const rs = await Promise.all([1, 2, 3, 4, 5, 6, 7, 8].map(indice => post(h, '/api/chaves/56/habilitar', { indice, habilitada: true })));
    assert.ok(rs.every(r => r.status === 200), 'status: ' + rs.map(r => r.status).join(','));
    const ok = await esperaAte(async () => (await get(h, '/api/chaves/56')).j.habilitada.slice(0, 8).every(x => x === true), 5000);
    assert.ok(ok, 'nem todas as 8 chaves ficaram habilitadas no PLC');
    const enderecosEscritos = new Set(h.plc.escritas.map(x => x.addr));
    for (let i = 1; i <= 8; i++) assert.ok(enderecosEscritos.has(e.hab(i)), 'Habilitada' + i + ' nunca foi escrita');
  });

  test('repetir o mesmo comando (duas vezes) deixa o mesmo estado final', async () => {
    const a = await post(h, '/api/chaves/56/habilitar', { indice: 9, habilitada: true });
    const b = await post(h, '/api/chaves/56/habilitar', { indice: 9, habilitada: true });
    assert.equal(a.status, 200); assert.equal(b.status, 200);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.habilitada[8] === true, 3000));
  });

  test('erro de escrita no PLC: o comando falha com erro (>= 500) e NAO trava a fila', async () => {
    h.plc.falhas.escrita = true;
    let r;
    try { r = await post(h, '/api/chaves/56/habilitar', { indice: 10, habilitada: true }); }
    finally { h.plc.falhas.escrita = false; }
    assert.ok(r.status >= 500, 'deveria falhar com 5xx; veio ' + r.status);
    const depois = await post(h, '/api/chaves/56/habilitar', { indice: 10, habilitada: true });
    assert.equal(depois.status, 200, 'a fila ficou travada depois do erro: ' + depois.t);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.habilitada[9] === true, 3000));
  });
});
