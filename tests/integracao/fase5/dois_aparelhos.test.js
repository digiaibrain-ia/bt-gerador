'use strict';
// FASE 5 / Fundamento 1 (race condition) - DOIS APARELHOS (ex.: PC e celular) comandando a MESMA chave ao mesmo tempo (08/11/2026).
// Rodadas de "ligar" e "desligar" simultaneos vindos de dois clientes. Prova: o servidor so responde com codigos previstos (200, 409, 503, 504),
// nunca 5xx inesperado, e no fim o comando no PLC e o feedback (simulador de bancada) ficam COERENTES (sb = cb) e o banco nao fica em estado impossivel.
// Nao prova o PLC real nem o FB101 (tempo real); so a fila do Node-RED com o PLC simulado.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe, espera } = require('../ajudas.js');

describe('Fase 5 - dois aparelhos comandando a mesma chave', () => {
  let h, e;
  before(async () => {
    h = await sobe({ fluxos: ['chaves-56-api-v3.5', 'simulador-dse-demo-v7'], env: ENV_TESTE, envAbas: { BT2_BANCADA: '1' } });
    e = enderecos('56');
    await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 5000);
    h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true); h.plc.escrever(e.cbBanco, true);
    for (let i = 1; i <= 13; i++) h.plc.escrever(e.hab(i), true);
    await post(h, '/api/simulador/dse', { ligado: true });
    await esperaAte(async () => (await get(h, '/api/chaves/56')).j.bancoLigado === true, 4000);
  });
  after(async () => { if (h) await h.para(); });

  test('12 rodadas de ligar x desligar simultaneos: so codigos previstos e estado final coerente', async () => {
    const PREVISTOS = new Set([200, 409, 503, 504]); const vistos = new Map();
    for (let r = 0; r < 12; r++) {
      const [a, b] = await Promise.all([
        post(h, '/api/chaves/56/ligar', { indice: 1, ligar: true }),     // aparelho A (PC)
        post(h, '/api/chaves/56/ligar', { indice: 1, ligar: false }),    // aparelho B (celular)
      ]);
      for (const x of [a, b]) vistos.set(x.status, (vistos.get(x.status) || 0) + 1);
    }
    const inesperados = [...vistos.keys()].filter(s => !PREVISTOS.has(s));
    assert.deepEqual(inesperados, [], 'codigos inesperados: ' + JSON.stringify([...vistos]));
    // assenta e confere coerencia comando x feedback
    await espera(2500);
    const cb = h.plc.ler(e.cb(1)); const ok = await esperaAte(() => h.plc.ler(e.sb(1)) === cb, 6000);
    assert.ok(ok, `feedback (sb=${h.plc.ler(e.sb(1))}) nao acompanhou o comando (cb=${cb}) depois de assentar; codigos: ` + JSON.stringify([...vistos]));
  });

  test('desligar o banco enquanto dois aparelhos ligam chaves: o banco termina DESLIGADO e nenhuma chave fica ligada', async () => {
    const ops = [];
    for (let i = 1; i <= 6; i++) ops.push(post(h, '/api/chaves/56/ligar', { indice: i, ligar: true }));
    ops.push(post(h, '/api/chaves/56/banco', { ligar: false }).catch(() => ({ status: 0 })));
    for (let i = 7; i <= 12; i++) ops.push(post(h, '/api/chaves/56/ligar', { indice: i, ligar: true }));
    await Promise.all(ops);
    await espera(3000);
    const ligadas = []; for (let i = 1; i <= 13; i++) if (h.plc.ler(e.cb(i)) === true) ligadas.push(i);
    const bancoLigado = h.plc.ler(e.cbBanco);
    assert.equal(bancoLigado, false, 'o Desligar banco deveria prevalecer sobre os Ligar chave simultaneos');
    assert.deepEqual(ligadas, [], 'banco desligado mas ha chaves comandadas: ' + JSON.stringify(ligadas));
  });
});
