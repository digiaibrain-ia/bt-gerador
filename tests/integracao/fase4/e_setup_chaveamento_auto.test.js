'use strict';
// FASE 4: medidor_gerador_v1.10.172 - o chaveamento do SETUP vem sozinho da tensao do gerador dos Dados do ensaio (Chromium + Node-RED de teste v3.5 + PLC simulado).
// Prova: informa 380 e depois 440 ao PLC sozinho (so com Dados CONFIRMADOS), botoes somente leitura, 208/480 so sinalizam (nada e gravado), Dados nao confirmados nao gravam.
// A mesma bateria na 1.10.171 tem que FALHAR (BT2_FASE4_HTML=medidor_gerador_v1.10.171.html). Nao prova o comportamento do 1200 nem a decisao sobre 208/480.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { ENV_TESTE, enderecos, esperaAte, sobe } = require('../ajudas.js');

const HTML = process.env.BT2_FASE4_HTML || 'medidor_gerador_v1.10.176.html';
describe('Setup: chaveamento vindo dos Dados do ensaio', () => {
  let h, b, p; const e = enderecos('56'), e4 = enderecos('400');
  const chip = () => p.evaluate(() => document.getElementById('stTensChip').textContent);
  const tens = () => h.plc.ler(e.tensaoSel);
  const dados = (v, conf = true) => p.evaluate(([v, conf]) => { DADOS.tensao = v; dadosConfMarca(conf); }, [v, conf]);
  before(async () => {
    h = await sobe({ fluxos: ['chaves-56-api-v3.5', 'chaves-400-api-v3.5'], env: ENV_TESTE, servirHtml: true });
    for (const x of [e, e4]) { h.plc.escrever(x.comOk, true); h.plc.escrever(x.seletora, true); }
    b = await chromium.launch(); p = await b.newPage({ viewport: { width: 1400, height: 900 } });
    p.on('pageerror', x => { throw new Error('erro de JavaScript na pagina: ' + x.message); });
    await p.route('**/*', r => (r.request().url().startsWith(h.url) ? r.continue() : r.abort()));
    await p.goto(h.url + '/html/' + HTML);
    assert.ok(await esperaAte(async () => ((await p.evaluate(() => (document.querySelector('#lkPlc') || {}).textContent || '')).includes('leitura ok')), 12000), 'chip do PLC sem "leitura ok"');
  });
  after(async () => { if (b) await b.close(); if (h) await h.para(); });

  test('Dados NAO confirmados (valor padrao do formulario): o Setup NAO grava chaveamento no PLC', async () => {
    await dados(220, false);
    await p.evaluate(() => document.getElementById('dlgChSetup').show());
    await new Promise(r => setTimeout(r, 4500));
    assert.equal(tens(), 0, 'gravou o chaveamento sem os Dados do ensaio confirmados');
    assert.match(await chip(), /NÃO INFORMADO.*confirme os Dados do ensaio/);
  });

  test('Dados confirmados em 380 V: o chaveamento e informado SOZINHO ao PLC e os botoes ficam somente leitura', async () => {
    await dados(380, true);
    assert.ok(await esperaAte(() => tens() === 2, 9000), 'o PLC nao recebeu 380 V (TensaoSel=' + tens() + ')');
    assert.ok(await esperaAte(async () => /Chaveamento ativo: 380 V/.test(await chip()), 6000), 'chip: ' + await chip());
    const des = await p.evaluate(() => [...document.querySelectorAll('#stTensSeg button')].map(x => x.disabled));
    assert.deepEqual(des, [true, true, true], 'os botoes devem ser somente leitura');
  });

  test('trocou o gerador para 440 V: o chaveamento acompanha sozinho', async () => {
    await dados(440, true);
    assert.ok(await esperaAte(() => tens() === 3, 9000), 'o PLC nao recebeu 440 V (TensaoSel=' + tens() + ')');
  });

  test('208 V e 480 V: so SINALIZA no Setup, nada e gravado no PLC', async () => {
    for (const v of [208, 480]) {
      const antes = h.plc.escritas.length, ant = tens();
      await dados(v, true);
      assert.ok(await esperaAte(async () => new RegExp('Gerador em ' + v + ' V.*sem chaveamento').test(await chip()), 6000), 'chip para ' + v + ': ' + await chip());
      await new Promise(r => setTimeout(r, 2500));
      assert.equal(h.plc.escritas.length, antes, v + ' V nao pode gravar nada no PLC');
      assert.equal(tens(), ant);
    }
  });
});
