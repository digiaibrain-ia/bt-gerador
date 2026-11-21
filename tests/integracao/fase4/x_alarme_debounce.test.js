'use strict';
/* =====================================================================================================================
   FASE 4 / Passo 6 — DEBOUNCE E HISTERESE DE ALARMES POR CRITICIDADE (19/11/2026).
   PARA QUE SERVE (leigo): alarmes de comunicação que somem em poucos segundos (45 de 88 ciclos na bancada de 17/11) cansavam o operador. Agora a causa precisa durar 10 s para virar
   alarme e, depois de ativo, 5 s normal para sumir. Alarmes de SEGURANÇA e de ação do operador continuam IMEDIATOS.
   COMO PROVA (técnico): medidor real no Chromium servido pelo harness; o teste usa a própria API de ocorrências (OCOR.set/limpa) com uma referência que a varredura da tela não usa (ref 'TESTE'),
   para isolar o debounce. Tempo real (os tempos de 10 s e 5 s fazem parte do comportamento).
   CONTRA-PROVA: o medidor 1.10.230 (sem debounce) tem que FALHAR: BT2_FASE4_HTML=medidor_gerador_v1.10.230.html
   NAO PROVA: os tempos certos por categoria (ASSUMIDOS: a Engenharia confirma) nem o efeito na bancada real.
   ===================================================================================================================== */
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { ENV_TESTE, esperaAte, sobe } = require('../ajudas.js');
const HTML = process.env.BT2_FASE4_HTML || require('../../versoes.js').medidorAtual();
const espera = ms => new Promise(r => setTimeout(r, ms));

describe('Passo 6: debounce (10 s) e histerese (5 s) so nas ocorrencias de comunicacao', () => {
  let h, b, p;
  before(async () => {
    h = await sobe({ fluxos: [], env: ENV_TESTE, servirHtml: true });
    b = await chromium.launch(); p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.route('**/*', r => (r.request().url().startsWith(h.url) ? r.continue() : r.abort()));
    await p.goto(h.url + '/html/' + HTML);
    assert.ok(await esperaAte(() => p.evaluate(() => !!(window.OCOR && window.OCOR.ativas)), 8000), 'a tela nao carregou o OCOR');
  });
  after(async () => { if (b) await b.close(); if (h) await h.para(); });
  const ativa = (cod, ref = 'TESTE') => p.evaluate(([c, r]) => window.OCOR.ativas().some(o => o.cod === c && o.ref === r), [cod, ref]);
  const hist = (cod, ev) => p.evaluate(([c, e]) => window.OCOR.historico().filter(x => x.cod === c && x.ref === 'TESTE' && x.e === e).length, [cod, ev]);
  const set = (cod, card = 'modo') => p.evaluate(([c, cd]) => window.OCOR.set(cd, c, 'teste ' + c, { ref: 'TESTE' }), [cod, card]);
  const limpa = (cod, card = 'modo') => p.evaluate(([c, cd]) => window.OCOR.limpa(cd, c, 'TESTE'), [cod, card]);

  test('alarmes de seguranca e de acao do operador sao IMEDIATOS (CHV-007, CHV-008, CHV-001, CHV-009, SIS-001)', async () => {
    for (const c of ['CHV-007', 'CHV-008', 'CHV-001', 'CHV-009', 'SIS-001']) { await set(c, 'bco'); assert.equal(await ativa(c), true, c + ' nao pode ser atrasado'); await limpa(c, 'bco'); }
  });

  test('FUGAZ: a causa some antes de 10 s e o alarme NUNCA aparece (so conta como fugaz)', async () => {
    const f0 = await p.evaluate(() => window.OCOR.fugazes());
    await set('COM-001'); assert.equal(await ativa('COM-001'), false, 'ainda nao pode estar ativo');
    assert.equal(await p.evaluate(() => window.OCOR.pendentes()) >= 1, true);
    await espera(3000); await limpa('COM-001');
    await espera(8000);                                                  // passa de 10 s desde o inicio: se tivesse sobrado pendencia ele apareceria
    assert.equal(await ativa('COM-001'), false); assert.equal(await hist('COM-001', 'ativou'), 0, 'nao pode ter registrado ativacao');
    assert.equal(await p.evaluate(() => window.OCOR.fugazes()), f0 + 1, 'conta 1 fugaz');
  });

  test('PERSISTENTE: a causa dura 10 s e o alarme aparece, e se mantem enquanto a causa for renovada', async () => {
    await set('COM-001'); const t0 = Date.now();
    assert.equal(await ativa('COM-001'), false);
    assert.ok(await esperaAte(async () => { await set('COM-001'); return ativa('COM-001'); }, 14000, 500), 'deveria ter aparecido apos 10 s');
    const dt = Date.now() - t0; assert.ok(dt >= 9500 && dt <= 13500, 'apareceu em ' + dt + ' ms (esperado ~10 s)');
    assert.equal(await hist('COM-001', 'ativou'), 1);
  });

  test('HISTERESE: depois de ativo, a causa some mas o alarme so normaliza apos 5 s; se a causa volta antes, ele NAO pisca', async () => {
    assert.equal(await ativa('COM-001'), true, 'pre-condicao (do teste anterior)');
    await limpa('COM-001'); assert.equal(await ativa('COM-001'), true, 'segura durante a histerese');
    await espera(2500); await set('COM-001');                              // a causa voltou antes dos 5 s
    await espera(4500); assert.equal(await ativa('COM-001'), true, 'continua ativo');
    assert.equal(await hist('COM-001', 'normalizou'), 0, 'nao pode ter normalizado/piscado'); assert.equal(await hist('COM-001', 'ativou'), 1);
    await limpa('COM-001'); const t0 = Date.now();
    assert.ok(await esperaAte(async () => !(await ativa('COM-001')), 9000, 300), 'deveria normalizar apos 5 s');
    const dt = Date.now() - t0; assert.ok(dt >= 4500 && dt <= 8000, 'normalizou em ' + dt + ' ms (esperado ~5 s)');
    assert.equal(await hist('COM-001', 'normalizou'), 1);
  });

  test('OCOR_DEBOUNCE_ESCALA = 0 desliga (so diagnostico): tudo imediato', async () => {
    await p.evaluate(() => { window.OCOR_DEBOUNCE_ESCALA = 0; });
    await set('COM-001'); assert.equal(await ativa('COM-001'), true); await limpa('COM-001'); assert.equal(await ativa('COM-001'), false);
    await p.evaluate(() => { window.OCOR_DEBOUNCE_ESCALA = 1; });
  });

  test('as tabelas deixam fora do debounce todo codigo de seguranca/acao', async () => {
    const t = await p.evaluate(() => window.OCOR.debounce);
    for (const c of ['CHV-001', 'CHV-002', 'CHV-004', 'CHV-007', 'CHV-008', 'CHV-009', 'ENS-001', 'ENS-002', 'ENS-003', 'SIS-001']) assert.equal(t.DEB_S[c], undefined, c + ' nao pode ter debounce');
    assert.deepEqual(Object.keys(t.DEB_S).sort(), ['CHV-005', 'CHV-006', 'COM-001', 'COM-002', 'COM-003', 'COM-005', 'DSE-001', 'DSE-002']);
  });
});
