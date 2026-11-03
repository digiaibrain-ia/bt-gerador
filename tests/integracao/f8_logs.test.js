'use strict';
// F8 - Logs: log de comunicacao das chaves (GET /api/logs/{id}) e o log de desenvolvedor (flow dev-logs).
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe } = require('./ajudas.js');

describe('F8 logs', () => {
  let h;
  before(async () => {
    h = await sobe({ fluxos: ['chaves-56-api-v3.2', 'dev-logs-api-v1.2'], env: ENV_TESTE });
    await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 5000);
  });
  after(async () => { if (h) await h.para(); });

  test('o log das chaves registra cada comando enviado ao PLC', async () => {
    const antes = (await get(h, '/api/logs/56')).j.total;
    await post(h, '/api/chaves/56/habilitar', { indice: 2, habilitada: true });
    const depois = await get(h, '/api/logs/56');
    assert.equal(depois.status, 200);
    assert.ok(depois.j.total > antes, 'o comando nao entrou no log (antes ' + antes + ', depois ' + depois.j.total + ')');
  });

  test('erro: log de banco que nao existe nao tem rota (404)', async () => {
    assert.equal((await get(h, '/api/logs/99')).status, 404);
  });

  test('log de desenvolvedor: um lote de eventos entra e volta na leitura', async () => {
    const ev = { sessao: 'teste-F8', n: 1, t: Date.now(), card: 'bco', tipo: 'teste', acao: 'F8', res: 'ok', det: 'marcador-F8-unico' };
    const r = await post(h, '/api/dev/log-evento', { eventos: [ev] });
    assert.equal(r.status, 200, r.t);
    const l = await get(h, '/api/dev/logs?desde=0');
    assert.equal(l.status, 200);
    assert.ok(JSON.stringify(l.j).includes('marcador-F8-unico'), 'o evento nao voltou na leitura');
  });

  test('erro: corpo sem lista de eventos e recusado (400)', async () => {
    assert.equal((await post(h, '/api/dev/log-evento', { isso: 'nao e um lote' })).status, 400);
  });

  test('limpar o log de desenvolvedor esvazia o buffer', async () => {
    assert.equal((await post(h, '/api/dev/logs/limpar', {})).status, 200);
    const l = await get(h, '/api/dev/logs?desde=0');
    assert.ok(!JSON.stringify(l.j).includes('marcador-F8-unico'), 'o evento continuou depois de limpar');
  });
});
