'use strict';
// F2b - CONTRA-PROVA do ACHADO F2-1: sem o middleware nodered/config/bt2_json_invalido_400_v0.1.js (Node-RED puro) o corpo JSON quebrado volta 500.
// Fica em arquivo proprio porque o Node-RED (RED) e unico por processo. Se um dia o Node-RED passar a devolver 400 sozinho, este teste avisa e o middleware pode sair.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ENV_TESTE, esperaAte, get, post, sobe } = require('./ajudas.js');

test('sem o middleware, JSON malformado volta 500 (o que o middleware corrige)', async () => {
  const h = await sobe({ fluxos: ['chaves-56-api-v3.9'], env: ENV_TESTE });
  try {
    await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 5000);
    const r = await post(h, '/api/chaves/56/habilitar', '{isto nao e json');
    assert.equal(r.status, 500, 'veio ' + r.status);
    assert.equal((await get(h, '/api/chaves/56')).status, 200, 'o fluxo continua respondendo');
  } finally { await h.para(); }
});
