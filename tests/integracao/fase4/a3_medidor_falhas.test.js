'use strict';
// FASE 4 / Portao A (A3): medidor_gerador_v1.10.168 (Chromium) contra o Node-RED de teste com chaves-56 v3.5 e o PLC simulado.
// Prova: falha de retorno (CHV-007) e contator colado (CHV-008) aparecem como Falha na tela, por chave, e SOMEM quando o PLC limpa.
// O PLC do banco e simulado por um respondedor (como no A2). Nao prova o SCL nem o ET200.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { ENV_TESTE, BANCOS, enderecos, esperaAte, get, sobe } = require('../ajudas.js');
const { parseAddr } = require('../plc_simulado.js');

const HTML = process.env.BT2_FASE4_HTML || 'medidor_gerador_v1.10.168.html';
describe('A3 - medidor: falhas do PLC do banco', () => {
  let h, b, p, timer; const e = enderecos('56'), B = BANCOS['56'];
  const bit = (base, i) => 'DB' + B.db + ',X' + (base + Math.floor((i - 1) / 8)) + '.' + ((i - 1) % 8);
  const grava = (addr, v) => { const a = parseAddr(addr), m = h.plc.db(a.db); m[a.byte] = v ? (m[a.byte] | (1 << a.bit)) : (m[a.byte] & ~(1 << a.bit)); };
  const st = { falha: new Set(), col: new Set() };
  const tick = () => { for (let i = 1; i <= 16; i++) { grava(bit(464, i), h.plc.ler(e.hab(i))); grava(bit(466, i), st.falha.has(i)); grava(bit(468, i), st.col.has(i)); } grava('DB' + B.db + ',X470.0', true); };
  const ocor = () => p.evaluate(() => window.OCOR.ativas().filter(x => /^CHV-00[78]$/.test(x.cod)).map(x => ({ cod: x.cod, ref: x.ref, tipo: x.tipo, txt: x.txt })));

  before(async () => {
    h = await sobe({ fluxos: ['chaves-56-api-v3.5', 'chaves-400-api-v3.5'], env: ENV_TESTE, servirHtml: true });   // o chip "PLC" so fica ok com os DOIS bancos lendo
    const e4 = enderecos('400'); h.plc.escrever(e4.comOk, true); h.plc.escrever(e4.seletora, true);
    h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true); for (let i = 1; i <= 13; i++) h.plc.escrever(e.hab(i), true);
    tick(); timer = setInterval(tick, 100);
    b = await chromium.launch(); p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    p.on('pageerror', x => { throw new Error('erro de JavaScript na pagina: ' + x.message); });
    await p.route('**/*', r => (r.request().url().startsWith(h.url) ? r.continue() : r.abort()));
    await p.goto(h.url + '/html/' + HTML);
    assert.ok(await esperaAte(async () => ((await p.evaluate(() => (document.querySelector('#lkPlc') || {}).textContent || '')).includes('leitura ok')), 12000), 'o chip do PLC nunca mostrou "leitura ok"');
  });
  after(async () => { clearInterval(timer); if (b) await b.close(); if (h) await h.para(); });

  test('versao: o arquivo carregado e a 1.10.168', async () => {
    assert.equal(await p.evaluate(() => document.querySelector('meta[name="app-version"]').content), '1.10.168');
  });

  test('sem falhas no PLC: nenhuma CHV-007/008 na tela', async () => { assert.deepEqual(await ocor(), []); });

  test('falha de retorno da chave 5: CHV-007 aparece como FALHA da chave BC56-5 e some quando o PLC limpa', async () => {
    st.falha.add(5); tick();
    assert.ok(await esperaAte(async () => (await ocor()).some(x => x.cod === 'CHV-007' && x.ref === 'BC56-5'), 8000), 'CHV-007 nao apareceu');
    const o = (await ocor()).find(x => x.cod === 'CHV-007'); assert.equal(o.tipo, 'f'); assert.match(o.txt, /sem retorno/);
    st.falha.delete(5); tick();
    assert.ok(await esperaAte(async () => !(await ocor()).some(x => x.cod === 'CHV-007'), 8000), 'CHV-007 nao saiu depois de o PLC limpar a falha');
  });

  test('contator colado da chave 6: CHV-008 aparece e some', async () => {
    st.col.add(6); tick();
    assert.ok(await esperaAte(async () => (await ocor()).some(x => x.cod === 'CHV-008' && x.ref === 'BC56-6'), 8000), 'CHV-008 nao apareceu');
    st.col.delete(6); tick();
    assert.ok(await esperaAte(async () => !(await ocor()).some(x => x.cod === 'CHV-008'), 8000), 'CHV-008 nao saiu');
  });

  test('duas chaves em falha ao mesmo tempo geram duas ocorrencias', async () => {
    st.falha.add(2); st.falha.add(3); tick();
    assert.ok(await esperaAte(async () => (await ocor()).filter(x => x.cod === 'CHV-007').length === 2, 8000));
    st.falha.clear(); tick();
    assert.ok(await esperaAte(async () => (await ocor()).length === 0, 8000));
  });
});
