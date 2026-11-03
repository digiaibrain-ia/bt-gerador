'use strict';
// F7 - Registro do ensaio no PLC (DB2100): modo manual/auto, gravar etapa e preenchimento, ler de volta e limpar.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { ENV_TESTE, esperaAte, get, post, sobe } = require('./ajudas.js');

const VALORES = { cargaReal: 30.1, potencia: 27.5, tempMotor: 35, Va: 221.1, Vb: 220.9, Vc: 221.4, Ia: 70, Ib: 70, Ic: 69, rpm: 1800, bateria: 28.3, tEstab: 2.0, cronometro: 45 };

describe('F7 registro do ensaio (DB2100)', () => {
  let h;
  before(async () => {
    h = await sobe({ fluxos: ['registro-ensaio-db2100-api-v1.7'], env: ENV_TESTE });
    await esperaAte(async () => (await get(h, '/api/ensaio/modo')).status === 200, 5000);
  });
  after(async () => { if (h) await h.para(); });

  test('caminho feliz: trocar o modo para manual e para auto', async () => {
    const m = await post(h, '/api/ensaio/modo', { modo: 'manual' });
    assert.equal(m.status, 200, m.t);
    assert.equal(m.j.modo, 'manual');
    assert.equal((await post(h, '/api/ensaio/modo', { modo: 'auto' })).j.modo, 'auto');
  });

  test('erro: modo que nao e manual/auto devolve 400', async () => {
    const r = await post(h, '/api/ensaio/modo', { modo: 'xpto' });
    assert.equal(r.status, 400);
    assert.match(r.j.erro, /manual ou auto/);
  });

  test('caminho feliz: gravar uma etapa grava no DB2100 e aparece na leitura do snap', async () => {
    const r = await post(h, '/api/ensaio/snap/etapa', { confirmado: true, indice: 2, etapa: 30, valores: VALORES });
    assert.equal(r.status, 200, r.t);
    assert.ok(await esperaAte(async () => JSON.stringify(await get(h, '/api/ensaio/snap')).includes('30.1'), 4000), 'a etapa gravada nao aparece no snap');
  });

  test('erro: etapa sem confirmacao do operador e recusada (400) e nada e gravado', async () => {
    const antes = h.plc.escritas.length;
    const r = await post(h, '/api/ensaio/snap/etapa', { confirmado: false, indice: 2, etapa: 30, valores: VALORES });
    assert.equal(r.status, 400);
    assert.match(r.j.erro, /sem confirmacao/);
    assert.equal(h.plc.escritas.length, antes);
  });

  test('erro: indice de etapa fora de 1..6 e recusado (400)', async () => {
    for (const indice of [0, 7]) assert.equal((await post(h, '/api/ensaio/snap/etapa', { confirmado: true, indice, etapa: 30, valores: VALORES })).status, 400);
  });

  test('erro: campo de medicao ausente nos valores e recusado (400)', async () => {
    const v = Object.assign({}, VALORES); delete v.cronometro;
    const r = await post(h, '/api/ensaio/snap/etapa', { confirmado: true, indice: 3, etapa: 50, valores: v });
    assert.equal(r.status, 400);
    assert.match(r.j.erro, /cronometro ausente/);
  });

  test('erro: PLC fora na hora de gravar a etapa responde erro (>= 500) e nao finge sucesso', async () => {
    h.plc.falhas.escrita = true;
    let r;
    try { r = await post(h, '/api/ensaio/snap/etapa', { confirmado: true, indice: 4, etapa: 100, valores: VALORES }); }
    finally { h.plc.falhas.escrita = false; }
    assert.ok(r.status >= 500, 'deveria falhar; veio ' + r.status);
  });

  test('limpar o snap sem confirmacao do operador e recusado (400)', async () => {
    const r = await post(h, '/api/ensaio/snap/limpar', {});
    assert.equal(r.status, 400);
    assert.match(r.j.erro, /confirmado:true/);
  });

  test('limpar o snap com confirmacao responde 200', async () => {
    assert.equal((await post(h, '/api/ensaio/snap/limpar', { confirmado: true })).status, 200);
  });
});
