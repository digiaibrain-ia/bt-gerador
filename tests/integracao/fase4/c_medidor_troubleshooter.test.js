'use strict';
// FASE 4 / Portao C: medidor_gerador_v1.10.170 (Chromium) - animacao dos triangulos, troubleshooter (Efeito/Causa/Solucao), legenda,
// "Cards x flow" por cima do Demo, DSE-001 por statusModbus e medidor com o PLC do banco sem comunicacao (ET200 sem comunicacao).
// A mesma bateria na 1.10.169 tem que FALHAR (BT2_FASE4_HTML=medidor_gerador_v1.10.169.html). Nao prova o texto do roteiro (validacao do Reginaldo).
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { ENV_TESTE, enderecos, esperaAte, sobe } = require('../ajudas.js');

const HTML = process.env.BT2_FASE4_HTML || 'medidor_gerador_v1.10.171.html';

describe('C - medidor: triangulos, troubleshooter, legenda, Cards x flow, DSE-001', () => {
  let h, b, ctx, p;
  const ativa = (cod) => p.evaluate(c => window.OCOR.ativas().some(x => x.cod === c), cod);
  before(async () => {
    h = await sobe({ fluxos: [], env: ENV_TESTE, servirHtml: true });
    b = await chromium.launch();
    ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] }); p = await ctx.newPage();
    p.on('pageerror', x => { throw new Error('erro de JavaScript na pagina: ' + x.message); });
    await p.route('**/*', r => (r.request().url().startsWith(h.url) ? r.continue() : r.abort()));
    await p.route('**/api/gerador', r => r.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, diag: { statusModbus: 'retrying after 5000 msec. (attempt 3)', errosModbusTotal: 7, ultimoErro: 'Connection refused', ultimoErroHa: 2 } }) }));
    await p.goto(h.url + '/html/' + HTML);
    await p.waitForFunction(() => window.OCOR && window.OCOR.set);
  });
  after(async () => { if (b) await b.close(); if (h) await h.para(); });

  test('C1 animacao: falha ativa pulsa (vermelho), alerta pulsa (ambar), "reduzir movimento" desliga', async () => {
    await p.evaluate(() => window.OCOR.set('bco', 'CHV-007', 'teste falha', { ref: 'BC56-5' }));
    assert.ok(await esperaAte(() => p.evaluate(() => { const t = document.querySelector('.ocb[data-card="bco"]'); return !!t && t.classList.contains('f') && !t.hidden; }), 4000), 'o triangulo do card nao ficou com a classe f');
    const nome = () => p.evaluate(() => getComputedStyle(document.querySelector('.ocb[data-card="bco"] svg')).animationName);
    assert.ok(/ocPulsoF/.test(await nome()), 'animacao da falha: ' + await nome());
    await p.evaluate(() => window.OCOR.limpa('bco', 'CHV-007', 'BC56-5'));
    await p.evaluate(() => window.OCOR.set('bco', 'CHV-002', 'teste alerta', { ref: 'BC56' }));
    assert.ok(await esperaAte(() => p.evaluate(() => document.querySelector('.ocb[data-card="bco"]').classList.contains('m')), 4000));
    assert.ok(/ocPulsoM/.test(await nome()), 'animacao do alerta: ' + await nome());
    await p.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await nome(), 'none', 'com "reduzir movimento" nao pode animar');
    await p.emulateMedia({ reducedMotion: 'no-preference' });
    await p.evaluate(() => window.OCOR.limpa('bco', 'CHV-002', 'BC56'));
  });

  test('C2 troubleshooter: o Roteiro abre Efeito, Causa e Solucao com o teste rapido e o "onde" de cada passo; copia o diagnostico', async () => {
    await p.evaluate(() => { window.OCOR.set('bco', 'CHV-007', 'Ch 5 sem retorno', { ref: 'BC56-5' }); window.OCOR.abre(); });
    await p.waitForSelector('#ocCorpo button.ocx');
    await p.click('#ocCorpo button.ocx');
    await p.waitForSelector('#ocCorpo tr.oct');
    const t = await p.evaluate(() => document.querySelector('#ocCorpo tr.oct').textContent.replace(/\s+/g, ' '));
    for (const x of ['Efeito', 'Causa', 'Solução', 'Teste rápido', 'Depende de bancada/TI', 'Roteiro v0.1']) assert.ok(t.includes(x), 'falta "' + x + '" no painel: ' + t.slice(0, 200));
    await p.click('#ocCorpo button[data-copia]');
    assert.ok(await esperaAte(async () => /Diagnóstico copiado/.test(await p.evaluate(() => document.getElementById('ocStatus').textContent)), 3000), 'o botao copiar nao confirmou');
    assert.match(await p.evaluate(() => navigator.clipboard.readText()), /DIAGNÓSTICO[\s\S]*Causa 1:[\s\S]*Solução \[/);
    await p.click('#ocCorpo button.ocx');
    assert.equal(await p.locator('#ocCorpo tr.oct').count(), 0, 'o painel nao recolheu');
    await p.evaluate(() => window.OCOR.limpa('bco', 'CHV-007', 'BC56-5'));
  });

  test('C3 legenda: o botao mostra o formato T-AAA-NNN e todos os codigos do catalogo', async () => {
    await p.evaluate(() => window.OCOR.abre());
    await p.click('#ocLeg');
    const t = await p.evaluate(() => document.getElementById('ocLegenda').textContent);
    assert.ok(t.includes('T-AAA-NNN') && t.includes('CHV-007') && t.includes('CHV-008') && t.includes('DSE-001'), 'legenda incompleta');
    assert.ok(await p.evaluate(() => document.querySelectorAll('#ocLegenda tbody tr').length) >= 18);
    await p.click('#ocLeg');
    assert.equal(await p.evaluate(() => document.getElementById('ocLegenda').hidden), true);
  });

  test('C4 "Cards x flow" abre POR CIMA do popup Demo', async () => {
    await p.evaluate(() => document.getElementById('dlgOcor').close());
    await p.fill('#demoSenha', 'mwm'); await p.click('#bDemo'); await p.click('#bDevCards');
    const topo = await p.evaluate(() => { const r = document.getElementById('dlgDevCards').getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + 30); return el && el.closest('dialog') ? el.closest('dialog').id : null; });
    assert.equal(topo, 'dlgDevCards', 'o popup Cards x flow ficou atras de: ' + topo);
    await p.evaluate(() => { document.getElementById('dlgDevCards').close(); document.getElementById('dlgDemo').close(); });
  });

  test('C5 DSE-001: API no ar (503) mas Modbus do DSE sem conexao -> o texto e o roteiro dizem isso', async () => {
    assert.ok(await esperaAte(() => ativa('DSE-001'), 25000, 500), 'DSE-001 nunca apareceu');
    const txt = await p.evaluate(() => window.OCOR.ativas().find(x => x.cod === 'DSE-001').txt);
    assert.match(txt, /API responde \(HTTP 503\).*Modbus do DSE n.o conecta.*retrying/s, txt);
    await p.evaluate(() => window.OCOR.abre());
    await p.waitForSelector('#ocCorpo button.ocx');
    await p.locator('#ocCorpo tr', { hasText: 'DSE' }).locator('button.ocx').first().click();
    const painel = await p.evaluate(() => document.querySelector('#ocCorpo tr.oct').textContent.replace(/\s+/g, ' '));
    assert.ok(/Modbus do DSE: status retrying/.test(painel) && /Connection refused/.test(painel) && /IP FIXO/.test(painel), painel.slice(0, 300));
  });
});

describe('C7 - medidor com o PLC do banco (ET200) sem comunicacao', () => {
  let h, b, p; const e = enderecos('56');
  before(async () => {
    h = await sobe({ fluxos: ['chaves-56-api-v3.5', 'chaves-400-api-v3.5'], env: ENV_TESTE, servirHtml: true });
    const e4 = enderecos('400'); h.plc.escrever(e4.comOk, true); h.plc.escrever(e4.seletora, true);
    h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true); h.plc.escrever(e.cbBanco, true); for (let i = 1; i <= 13; i++) h.plc.escrever(e.hab(i), true);
    b = await chromium.launch(); p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    p.on('pageerror', x => { throw new Error('erro de JavaScript na pagina: ' + x.message); });
    await p.route('**/*', r => (r.request().url().startsWith(h.url) ? r.continue() : r.abort()));
    await p.goto(h.url + '/html/' + HTML);
    assert.ok(await esperaAte(async () => ((await p.evaluate(() => (document.querySelector('#lkPlc') || {}).textContent || '')).includes('leitura ok')), 12000), 'chip do PLC sem "leitura ok"');
  });
  after(async () => { if (b) await b.close(); if (h) await h.para(); });

  test('ET200 sem comunicacao: COM-005 ativa, o banco fica bloqueado e o clique NAO comanda o PLC (com mensagem)', async () => {
    h.plc.escrever(e.comOk, false);
    assert.ok(await esperaAte(() => p.evaluate(() => window.OCOR.ativas().some(x => x.cod === 'COM-005' && x.ref === 'BC56')), 8000), 'COM-005 nao apareceu');
    const antes = h.plc.escritas.length;
    await p.locator('#bancos .tile[data-i="0"]').click();
    assert.ok(await esperaAte(async () => (await p.evaluate(() => document.querySelector('#gmsg').textContent)).length > 0, 3000), 'clique mudo: sem mensagem');
    assert.equal(h.plc.escritas.length, antes, 'o clique nao pode comandar o PLC com o banco sem comunicacao');
    await p.evaluate(() => window.OCOR.abre());
    await p.waitForSelector('#ocCorpo button.ocx');
    await p.locator('#ocCorpo tr', { hasText: 'COM-005' }).locator('button.ocx').first().click();
    assert.ok((await p.evaluate(() => document.querySelector('#ocCorpo tr.oct').textContent)).includes('vidaET'), 'o roteiro do COM-005 nao fala da vida do PLC do banco');
  });
});
