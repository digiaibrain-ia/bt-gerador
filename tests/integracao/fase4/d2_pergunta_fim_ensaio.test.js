'use strict';
// v1.10.191 - opcao "Perguntar ao final do ensaio" (Modo). Prova: padrao SIM mostra o aviso; com NAO o aviso nao aparece e nada grava; a escolha fica guardada (recarregando a pagina);
// o botao Registros continua abrindo a Central. A mesma bateria na 1.10.190 tem que FALHAR (BT2_FASE4_HTML=medidor_gerador_v1.10.190.html).
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { ENV_TESTE, esperaAte, sobe } = require('../ajudas.js');
const HTML = process.env.BT2_FASE4_HTML || 'medidor_gerador_v1.10.191.html';
describe('v1.10.191 - perguntar ao final do ensaio', () => {
  let h, b, p; const txt = f => p.evaluate(f);
  const fim = async () => { await p.evaluate(() => { T.fim = false; T.started = false; }); await new Promise(r => setTimeout(r, 1300)); await p.evaluate(() => { T.started = true; T.fim = true; }); };
  before(async () => {
    h = await sobe({ fluxos: [], env: ENV_TESTE, servirHtml: true });
    b = await chromium.launch(); p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
    p.on('pageerror', x => { throw new Error('erro de JavaScript na pagina: ' + x.message); });
    await p.route('**/*', r => (r.request().url().startsWith(h.url) ? r.continue() : r.abort()));
    await p.route('**/api/gerador', r => r.fulfill({ status: 503, contentType: 'application/json', body: '{"ok":false}' }));
    await p.goto(h.url + '/html/' + HTML); await p.waitForFunction(() => window.CENTRAL_REG && window.OCOR);
  });
  after(async () => { if (b) await b.close(); if (h) await h.para(); });
  test('padrao SIM: o botao Sim esta marcado e o aviso aparece ao fim do ensaio', async () => {
    assert.equal(await txt(() => document.querySelector('#mdPf button.on').dataset.v), '1');
    await fim(); assert.ok(await esperaAte(() => txt(() => !!document.getElementById('cenAviso')), 4000), 'o aviso nao apareceu');
    await p.click('#cenAvNao');
  });
  test('NAO: o aviso nao aparece, a escolha fica guardada e o botao Registros continua abrindo a Central', async () => {
    await p.evaluate(() => document.querySelector('#mdPf button[data-v="0"]').click());
    assert.equal(await txt(() => localStorage.getItem('medidor.cen.perguntaFim')), '0');
    await fim(); await new Promise(r => setTimeout(r, 2500));
    assert.equal(await txt(() => !!document.getElementById('cenAviso')), false, 'o aviso apareceu mesmo com Nao');
    await p.reload(); await p.waitForFunction(() => window.CENTRAL_REG && window.OCOR);
    assert.equal(await txt(() => document.querySelector('#mdPf button.on').dataset.v), '0', 'a escolha nao ficou guardada');
    await fim(); await new Promise(r => setTimeout(r, 2500));
    assert.equal(await txt(() => !!document.getElementById('cenAviso')), false);
    await p.evaluate(() => { T.fim = false; T.started = false; });
    await p.click('#bCentral'); assert.ok(await esperaAte(() => txt(() => document.getElementById('dlgCentral').open), 3000));
  });
});
