'use strict';
// Medidor 1.10.174: TODAS as janelas fecham pelo ✕ e se movem pela barra de titulo, com MOUSE DE VERDADE (clique e arraste), incluindo a Central de registros.
// Origem: no log do Reginaldo (06/11/2026) o ✕ da Central foi clicado dezenas de vezes sem "fechou popup dlgCentral", e ela nao se movia. O teste da Central
// da v1.10.171 fechava por codigo (d.close()) e por isso nao pegou. A mesma bateria na 1.10.173 tem que FALHAR na Central.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { ENV_TESTE, esperaAte, sobe } = require('../ajudas.js');

const HTML = process.env.BT2_FASE4_HTML || 'medidor_gerador_v1.10.176.html';
const JANELAS = ['dlgCentral', 'dlgVer', 'dlgReg', 'dlgDemo', 'dlgDevCards', 'dlgPlacas', 'dlgDseSim', 'dlgRes', 'dlgGrand', 'dlgMotor', 'dlgLogs', 'dlgOcor', 'dlgOcHist', 'dlgModo', 'dlgChHD', 'dlgGrafico', 'dlgMapaFBs', 'dlgPatDet', 'dlgTabPot', 'dlgTroca', 'dlgParam'];
describe('Janelas: fechar pelo X e mover pela barra de titulo (mouse real)', () => {
  let h, b, p;
  const pos = id => p.evaluate(i => { const r = document.getElementById(i).getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top)]; }, id);
  const abre = async id => {
    await p.evaluate(i => { document.querySelectorAll('dialog[open]').forEach(x => { if (x.id !== 'dlgGuiado') try { x.close(); } catch (e) {} }); const d = document.getElementById(i); try { d.showModal(); } catch (e) { d.show(); } }, id);
    assert.ok(await esperaAte(() => p.evaluate(i => document.getElementById(i).open, id), 3000), id + ' nao abriu');
  };
  before(async () => {
    h = await sobe({ fluxos: [], env: ENV_TESTE, servirHtml: true });
    b = await chromium.launch(); p = await b.newPage({ viewport: { width: 1500, height: 1000 } });
    p.on('pageerror', x => { throw new Error('erro de JavaScript na pagina: ' + x.message); });
    await p.route('**/*', r => (r.request().url().startsWith(h.url) ? r.continue() : r.abort()));
    await p.goto(h.url + '/html/' + HTML); await p.waitForTimeout(2000);
    await p.fill('#demoSenha', 'mwm');
  });
  after(async () => { if (b) await b.close(); if (h) await h.para(); });

  for (const id of JANELAS) {
    test(id + ': arrasta pela barra de titulo e fecha com clique real no ✕', async () => {
      if (id === 'dlgCentral') { await p.click('#bCentral'); assert.ok(await esperaAte(() => p.evaluate(() => document.getElementById('dlgCentral').open), 3000), 'a Central nao abriu'); }
      else await abre(id);
      const hdr = p.locator('#' + id + ' .jt').first(); const bb = await hdr.boundingBox(); assert.ok(bb, 'sem barra de titulo');
      const a = await pos(id);
      await p.mouse.move(bb.x + 30, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + 150, bb.y + bb.height / 2 + 70, { steps: 8 }); await p.mouse.up();
      await p.waitForTimeout(150);
      const c = await pos(id);
      assert.ok(Math.abs(c[0] - a[0]) > 20 || Math.abs(c[1] - a[1]) > 20, id + ' NAO se moveu: ' + a + ' -> ' + c);
      await p.locator('#' + id + ' .jx, #' + id + ' [data-fecha]').first().click({ timeout: 3000 });
      assert.ok(await esperaAte(() => p.evaluate(i => !document.getElementById(i).open, id), 2000), id + ' NAO fechou com o clique no ✕');
      if (id === 'dlgCentral') {
        assert.ok(await esperaAte(() => p.evaluate(() => window.OBS_LOG.eventos().some(e => /fechou popup dlgCentral/.test(e.acao))), 3000), 'o log nao registrou "fechou popup dlgCentral"');
      }
    });
  }

  test('Central: reabre depois de fechar e fecha de novo (varias vezes), e Esc fecha', async () => {
    for (let k = 0; k < 3; k++) {
      await p.click('#bCentral'); assert.ok(await esperaAte(() => p.evaluate(() => document.getElementById('dlgCentral').open), 3000), 'abrir ' + k);
      await p.locator('#dlgCentral .jx').click(); assert.ok(await esperaAte(() => p.evaluate(() => !document.getElementById('dlgCentral').open), 2000), 'fechar ' + k);
    }
    await p.click('#bCentral'); await p.locator('#dlgCentral .jt').click({ position: { x: 20, y: 10 } }); await p.keyboard.press('Escape');
    assert.ok(await esperaAte(() => p.evaluate(() => !document.getElementById('dlgCentral').open), 2000), 'Esc nao fechou a Central');
  });
});
