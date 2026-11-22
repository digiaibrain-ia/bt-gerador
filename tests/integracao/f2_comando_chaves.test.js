'use strict';
// F2 - Comando de chaves (habilitar, ligar, desligar) do BC56, com as travas de banco ligado e chave habilitada.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe } = require('./ajudas.js');

describe('F2 comando de chaves do BC56', () => {
  let h, e;
  before(async () => {
    h = await sobe({ fluxos: ['chaves-56-api-v3.9'], env: ENV_TESTE, jsonMiddleware: true });   // F2-1: com o middleware de JSON invalido (settings.js do PC)
    e = enderecos('56');
    await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 5000);
  });
  after(async () => { if (h) await h.para(); });

  test('caminho feliz: habilitar uma chave grava no PLC e aparece na leitura', async () => {
    const r = await post(h, '/api/chaves/56/habilitar', { indice: 3, habilitada: true });
    assert.equal(r.status, 200, r.t);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.habilitada[2] === true, 3000), 'Habilitada3 nao chegou na leitura');
    assert.equal(h.plc.ler(e.hab(3)), true, 'o bit nao foi gravado no DB3000');
  });

  test('erro: indice fora da faixa do banco (0 e 14 no BC56 de 13 chaves) devolve 400', async () => {
    for (const indice of [0, 14]) {
      const r = await post(h, '/api/chaves/56/habilitar', { indice, habilitada: true });
      assert.equal(r.status, 400, 'indice ' + indice);
      assert.match(r.j.erro, /1 a 13/);
    }
  });

  test('erro: habilitada que nao e true/false devolve 400 e nada e gravado', async () => {
    const antes = h.plc.escritas.length;
    const r = await post(h, '/api/chaves/56/habilitar', { indice: 4, habilitada: 'sim' });
    assert.equal(r.status, 400);
    assert.equal(h.plc.escritas.length, antes, 'nao pode escrever no PLC quando a entrada e invalida');
  });

  test('erro: corpo que nao e JSON valido NAO derruba o fluxo (o GET continua respondendo)', async () => {
    const r = await post(h, '/api/chaves/56/habilitar', '{isto nao e json');
    assert.ok(r.status >= 400, 'deveria ser erro; veio ' + r.status);
    assert.equal((await get(h, '/api/chaves/56')).status, 200, 'o fluxo parou de responder depois do JSON ruim');
  });

  // ACHADO F2-1 (fechado em 19/11/2026): o 500 vem do "http in" do Node-RED, nao do fluxo; o middleware nodered/config/bt2_json_invalido_400_v0.1.js (httpNodeMiddleware no settings.js) devolve 400.
  test('ACHADO F2-1: JSON malformado devolve 400 (erro do cliente) com mensagem clara, em todas as rotas de comando', async () => {
    for (const rota of ['habilitar', 'ligar']) {
      const r = await post(h, '/api/chaves/56/' + rota, '{isto nao e json');
      assert.equal(r.status, 400, rota + ' veio ' + r.status + ': ' + r.t.slice(0, 80));
      assert.deepEqual(r.j, { ok: false, erro: 'corpo JSON invalido' });
    }
    assert.equal((await get(h, '/api/chaves/56')).status, 200);
  });

  test('o middleware nao atrapalha: corpo valido continua como antes e o PLC nao recebe nada do corpo ruim', async () => {
    const antes = h.plc.escritas.length;
    await post(h, '/api/chaves/56/habilitar', '{"indice":');
    assert.equal(h.plc.escritas.length, antes, 'corpo invalido nao pode gerar escrita');
    const r = await post(h, '/api/chaves/56/habilitar', { indice: 3, habilitada: true });
    assert.equal(r.status, 200, r.t);
  });

  test('ligar exige banco ligado: sem "Ligar banco" a chave nao liga (409) e o PLC nao recebe comando', async () => {
    h.plc.escrever(e.cbBanco, false);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.bancoLigado === false, 3000));
    const antes = h.plc.escritas.length;
    const r = await post(h, '/api/chaves/56/ligar', { indice: 3, ligar: true });
    assert.equal(r.status, 409);
    assert.match(r.j.erro, /banco BC56 desligado/);
    assert.equal(h.plc.escritas.length, antes, 'banco desligado nao pode gerar escrita de comando');
  });

  test('ligar com banco ligado e chave habilitada: liga a chave no PLC', async () => {
    h.plc.escrever(e.cbBanco, true);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.bancoLigado === true, 3000));
    const r = await post(h, '/api/chaves/56/ligar', { indice: 3, ligar: true });
    assert.equal(r.status, 200, r.t);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.cbLigar[2] === true, 3000), 'CbLigar3 nao foi comandado');
  });

  test('erro: chave desabilitada nao liga (400) mesmo com o banco ligado', async () => {
    const r = await post(h, '/api/chaves/56/ligar', { indice: 5, ligar: true });
    assert.equal(r.status, 400);
    assert.match(r.j.erro, /desabilitada/);
  });

  test('desligar a chave limpa o comando dela', async () => {
    const r = await post(h, '/api/chaves/56/ligar', { indice: 3, ligar: false });
    assert.equal(r.status, 200, r.t);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.cbLigar[2] === false, 3000));
  });
});
