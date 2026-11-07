'use strict';
// FASE 4 / Portao B (BANC-3): clique na chave que "nao entende mais" (so o F5 destravava). Medidor no Chromium contra o Node-RED de teste (chaves v3.5) + PLC simulado.
// Prova que o clique nao e mais ignorado EM SILENCIO e que o estado preso "em envio" se solta. Nao prova a causa exata que ocorreu na bancada
// (os dois retornos silenciosos sao as unicas causas na tela que o F5 limpa). A mesma bateria na 1.10.168 tem que FALHAR.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { ENV_TESTE, BANCOS, enderecos, esperaAte, sobe } = require('../ajudas.js');
const { parseAddr } = require('../plc_simulado.js');

const HTML = process.env.BT2_FASE4_HTML || 'medidor_gerador_v1.10.176.html';
describe('B - clique da chave nunca fica mudo nem preso', () => {
  let h, b, p, timer; const e = enderecos('56'), B = BANCOS['56'];
  const bit = (base, i) => 'DB' + B.db + ',X' + (base + Math.floor((i - 1) / 8)) + '.' + ((i - 1) % 8);
  const grava = (addr, v) => { const a = parseAddr(addr), m = h.plc.db(a.db); m[a.byte] = v ? (m[a.byte] | (1 << a.bit)) : (m[a.byte] & ~(1 << a.bit)); };
  const tick = () => { for (let i = 1; i <= 16; i++) { grava(bit(464, i), h.plc.ler(e.hab(i))); grava(bit(466, i), false); grava(bit(468, i), false); } grava('DB' + B.db + ',X470.0', true); };
  const msg = () => p.evaluate(() => (document.querySelector('#gmsg') || {}).textContent || '');
  const tile = i => p.locator('#bancos .tile[data-i="' + i + '"]');

  before(async () => {
    h = await sobe({ fluxos: ['chaves-56-api-v3.5', 'chaves-400-api-v3.5'], env: ENV_TESTE, servirHtml: true });
    const e4 = enderecos('400'); h.plc.escrever(e4.comOk, true); h.plc.escrever(e4.seletora, true);
    h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true); h.plc.escrever(e.cbBanco, true); for (let i = 1; i <= 13; i++) h.plc.escrever(e.hab(i), true);
    tick(); timer = setInterval(tick, 100);
    b = await chromium.launch(); p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    p.on('pageerror', x => { throw new Error('erro de JavaScript na pagina: ' + x.message); });
    await p.route('**/*', r => (r.request().url().startsWith(h.url) ? r.continue() : r.abort()));
    await p.goto(h.url + '/html/' + HTML);
    assert.ok(await esperaAte(async () => ((await p.evaluate(() => (document.querySelector('#lkPlc') || {}).textContent || '')).includes('leitura ok')), 12000), 'o chip do PLC nunca mostrou "leitura ok"');
    assert.ok(await esperaAte(async () => (await p.evaluate(() => document.querySelector('.bkbtn') ? document.querySelector('.bkbtn').textContent : '')).includes('Desligar banco'), 10000), 'o banco BC56 nao apareceu ligado na tela');
  });
  after(async () => { clearInterval(timer); if (b) await b.close(); if (h) await h.para(); });

  test('caminho feliz: clique na chave 1 comanda o PLC', async () => {
    await tile(0).click();
    assert.ok(await esperaAte(() => h.plc.ler(e.cb(1)) === true, 6000), 'o clique nao chegou ao PLC');
    assert.ok(await esperaAte(async () => !(await p.evaluate(() => CH_PEND.has(0))), 8000), 'a chave 1 nao saiu de "em envio"');
    await tile(0).click();   // desliga
    assert.ok(await esperaAte(() => h.plc.ler(e.cb(1)) === false, 6000));
    await esperaAte(async () => (await msg()) === '', 400);
  });

  test('Patamar manual esperando o Aplicar: o clique NAO fica mudo (avisa que so edita a sugestao) e nao comanda o PLC', async () => {
    await p.evaluate(() => { window.__po = window.PATAMAR_PENDENTE; window.__pe = window.PATAMAR_EDITA; window.PATAMAR_PENDENTE = () => true; window.PATAMAR_EDITA = () => {}; });
    const antes = h.plc.escritas.length;
    await tile(1).click();
    assert.ok(await esperaAte(async () => /Patamar manual esperando o Aplicar/.test(await msg()), 3000), 'clique mudo: nenhum aviso. msg="' + await msg() + '"');
    assert.equal(h.plc.escritas.length, antes, 'o clique nao pode comandar o PLC nesse estado');
    await p.evaluate(() => { window.PATAMAR_PENDENTE = window.__po; window.PATAMAR_EDITA = window.__pe; });
  });

  test('chave "em envio": o segundo clique avisa em vez de ficar mudo', async () => {
    h.plc.atrasosEscrita.push(5000);
    await tile(2).click();                                            // 1o clique: o POST fica em voo (escrita lenta)
    assert.ok(await esperaAte(async () => (await p.evaluate(() => CH_PEND.has(2))), 3000), 'a chave nao entrou em envio');
    await tile(2).click();                                            // 2o clique, ainda em envio
    assert.ok(await esperaAte(async () => /ainda em envio/.test(await msg()), 3000), 'clique mudo: nenhum aviso. msg="' + await msg() + '"');
    assert.ok(await esperaAte(async () => !(await p.evaluate(() => CH_PEND.has(2))), 16000), 'a chave ficou em envio para sempre');
    h.plc.atrasosEscrita.length = 0;
    h.plc.escrever(e.cb(3), false);
    await new Promise(r => setTimeout(r, 1500));
  });

  test('estado preso (em envio ha mais de 12 s): o clique solta e COMANDA o PLC', async () => {
    h.plc.escrever(e.cb(4), false);
    await p.evaluate(() => { CH_PEND.add(3); if (typeof CH_PEND_T !== 'undefined') CH_PEND_T[3] = Date.now() - 20000; });   // simula o estado preso que so o F5 limpava
    await tile(3).click();
    assert.ok(await esperaAte(() => h.plc.ler(e.cb(4)) === true, 6000), 'a chave continuou travada: o clique foi ignorado');
  });
});
