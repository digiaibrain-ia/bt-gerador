'use strict';
// F9 - Simulador de bancada (SEM DSE real): liga o gerador simulado, o banco responde com a potencia e o feedback das chaves.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe, espera } = require('./ajudas.js');

describe('F9 simulador de bancada', () => {
  let h, e;
  before(async () => {
    // o simulador so responde em modo bancada: a aba precisa de BT2_BANCADA=1 (padrao 0 = trava fechada)
    h = await sobe({ fluxos: ['chaves-56-api-v3.3', 'simulador-dse-demo-v7'], env: ENV_TESTE, envAbas: { BT2_BANCADA: '1' } });
    e = enderecos('56');
    await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 5000);
  });
  after(async () => { if (h) await h.para(); });

  test('caminho feliz: ligar o simulador e ligar 2 chaves faz a potencia virar base + kW das chaves', async () => {
    h.plc.escrever(e.cbBanco, true); h.plc.escrever(e.hab(1), true); h.plc.escrever(e.hab(6), true);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.bancoLigado === true, 3000));
    const s = await post(h, '/api/simulador/dse', { ligado: true });
    assert.equal(s.status, 200, s.t);
    assert.equal((await post(h, '/api/chaves/56/ligar', { indice: 1, ligar: true })).status, 200);   // chave 1 = 5 kW
    assert.equal((await post(h, '/api/chaves/56/ligar', { indice: 6, ligar: true })).status, 200);   // chave 6 = 4 kW
    // base simulada 0,8 kW + 5 + 4 kW, com ruido de +/-0,05 kW
    assert.ok(await esperaAte(async () => Math.abs(h.plc.ler('DB2000,REAL84') - 9.8) < 0.2, 5000), 'potenciaKw = ' + h.plc.ler('DB2000,REAL84') + ' (esperado ~9,8)');
    assert.equal(h.plc.ler(e.sb(1)), true, 'o feedback da chave 1 (Ligada1) deveria acompanhar o comando');
  });

  test('erro: "ligado" que nao e true/false devolve 400 e nao muda o simulador', async () => {
    const antes = h.plc.ler('DB2000,REAL84');
    assert.equal((await post(h, '/api/simulador/dse', { ligado: 'sim' })).status, 400);
    await espera(400);
    assert.equal(h.plc.ler('DB2000,REAL84'), antes);
  });

  test('desligar o simulador zera a potencia e o feedback das chaves', async () => {
    const s = await post(h, '/api/simulador/dse', { ligado: false });
    assert.equal(s.status, 200, s.t);
    assert.ok(await esperaAte(async () => h.plc.ler('DB2000,REAL84') === 0, 4000), 'potencia nao zerou');
    assert.ok(await esperaAte(async () => h.plc.ler(e.sb(1)) === false, 4000), 'feedback da chave 1 nao limpou');
  });
});
