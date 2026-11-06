'use strict';
// Medidor 1.10.173: "gerador operando" com o DSE REAL = LED (ou geradorDisponivel) E rotacao >= 1400 rpm E tensao media >= 100 V (quando existem).
// Os valores do caso real vem do que o Reginaldo confirmou: DSE ligado, motor rodando, modo MANUAL, LED MANUAL on, STOP/AUTO off (rpm 1869, ~382 V).
// A mesma bateria na 1.10.172 tem que FALHAR nos casos de motor parado/sem tensao. Nao prova o PLC (o FB100 continua usando o ledManual).
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { ENV_TESTE, sobe } = require('../ajudas.js');

const HTML = process.env.BT2_FASE4_HTML || 'medidor_gerador_v1.10.173.html';
describe('genInfo (gerador operando) com o DSE real', () => {
  let h, b, p;
  const gi = d => p.evaluate(x => genInfo(x), d);
  const caso = (rpm, v, led = { manual: true, stop: false, auto: false, teste: false }) => ({ leds: led, rpm, tensaoL1L2: v, tensaoL2L3: v, tensaoL3L1: v });
  before(async () => {
    h = await sobe({ fluxos: [], env: ENV_TESTE, servirHtml: true });
    b = await chromium.launch(); p = await b.newPage();
    p.on('pageerror', x => { throw new Error('erro de JavaScript na pagina: ' + x.message); });
    await p.route('**/*', r => (r.request().url().startsWith(h.url) ? r.continue() : r.abort()));
    await p.goto(h.url + '/html/' + HTML);
    await p.waitForFunction(() => typeof genInfo === 'function');
  });
  after(async () => { if (b) await b.close(); if (h) await h.para(); });

  test('caso REAL confirmado (Manual on, Stop/Auto off, 1869 rpm, ~382 V) = operando', async () => {
    const r = await gi({ leds: { manual: true, stop: false, auto: false }, rpm: 1869, tensaoL1L2: 381.7, tensaoL2L3: 381.8, tensaoL3L1: 382.4 });
    assert.equal(r.estado, 'operando'); assert.equal(r.run, true);
  });
  test('DSE em Manual com o motor PARADO (0 rpm, 0 V) = parado, nao operando', async () => {
    const r = await gi(caso(0, 0)); assert.equal(r.estado, 'parado'); assert.equal(r.run, false);
  });
  test('motor girando abaixo de 1400 rpm = partindo', async () => {
    const r = await gi(caso(900, 150)); assert.equal(r.estado, 'partindo'); assert.equal(r.run, false);
  });
  test('rotacao ok mas SEM tensao (alternador nao excitou) = nao operando', async () => {
    const r = await gi(caso(1800, 20)); assert.equal(r.run, false); assert.notEqual(r.estado, 'operando');
  });
  test('sem rotacao nem tensao na leitura, so o LED: continua operando (como antes)', async () => {
    const r = await gi({ leds: { manual: true } }); assert.equal(r.estado, 'operando'); assert.equal(r.run, true);
  });
  test('LED Manual apagado e motor parado = parado', async () => {
    const r = await gi(caso(0, 0, { manual: false, stop: true, auto: false })); assert.equal(r.estado, 'parado');
  });
});
