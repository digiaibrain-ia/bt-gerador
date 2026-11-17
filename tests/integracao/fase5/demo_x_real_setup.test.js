'use strict';
// FASE 5 / Demo x Real (08/11/2026) - SETUP no modo REAL contra o Node-RED de teste + PLC simulado + simulador de bancada.
// O DSE e imitado por uma rota do navegador (so no teste); o PLC e o simulado em memoria. Nada toca producao (trava de 4 camadas em ajudas.js).
// Prova: (1) no modo REAL, sem "Dados do ensaio" confirmados, o Setup NAO deixa selecionar chave e os botoes de chaveamento sao so leitura;
//        (2) com os Dados confirmados (tensao 380 V), o chaveamento vai ao PLC (DB3002), a chave e selecionada e o botao Salvar habilita;
//        (3) caracterizacao: no REAL a potencia nominal usada pela tela e 91 kW fixos (KW_NOM) - A CONFIRMAR com o Reginaldo;
//        (4) todo DR-1: a mensagem de bloqueio nao diz ONDE informar (o botao esta travado e a tensao vem de Dados do ensaio).
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe } = require('../ajudas.js');

const HTML = process.env.BT2_FASE4_HTML || 'medidor_gerador_v1.10.190.html';
describe('Fase 5 - Setup no modo REAL (simulado) x Demo', () => {
  let h, e, b, p;
  const txt = s => p.evaluate(x => { const el = document.querySelector(x); return el ? el.textContent.replace(/\s+/g, ' ').trim() : null; }, s);
  before(async () => {
    h = await sobe({ fluxos: ['chaves-56-api-v3.5', 'simulador-dse-demo-v7', 'registro-ensaio-db2100-api-v1.8'], env: ENV_TESTE, envAbas: { BT2_BANCADA: '1' }, servirHtml: true });
    e = enderecos('56');
    await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 5000);
    h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true); h.plc.escrever(e.cbBanco, true);
    for (let i = 1; i <= 13; i++) h.plc.escrever(e.hab(i), true);
    await post(h, '/api/simulador/dse', { ligado: true });
    b = await chromium.launch(); p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    p.on('pageerror', x => { throw new Error('erro de JavaScript na pagina: ' + x.message); });
    await p.route('**/*', r => {
      const u = r.request().url();
      if (/\/api\/gerador/.test(u)) { const kw = +h.plc.ler('DB2000,REAL84') || 0; return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, idadeSegundos: 0.3, modo: 'MANUAL', dse: { modeloConfigurado: 'DSE 4520' }, tensaoL1L2: 381.7, tensaoL2L3: 381.8, tensaoL3L1: 382.4, correnteL1: kw * 1.5, correnteL2: kw * 1.5, correnteL3: kw * 1.5, kw, tempAguaC: 60, rpm: 1869, bateria: 28.3, percCarga: kw / 91 * 100, leds: { stop: false, manual: true, teste: false, auto: false, disjuntorGerador: true, geradorDisponivel: true }, saidaCombustivel: true, saidaPartida: false }) }); }
      return u.startsWith(h.url) ? r.continue() : r.abort();
    });
    await p.goto(h.url + '/html/' + HTML);
    assert.ok(await esperaAte(async () => (await txt('#gEstado') || '').includes('OPERANDO'), 12000), 'a tela nao mostrou o gerador OPERANDO');
  });
  after(async () => { if (b) await b.close(); if (h) await h.para(); });

  test('REAL sem Dados confirmados: botoes de chaveamento so leitura e selecionar chave e bloqueado', async () => {
    await p.click('#btSetup'); await p.waitForTimeout(800);
    const dis = await p.evaluate(() => [...document.querySelectorAll('#dlgChSetup button')].filter(x => /^(220|380|440) V$/.test(x.textContent.trim())).map(x => x.disabled));
    assert.deepEqual(dis, [true, true, true], 'os 3 botoes de chaveamento deveriam estar travados (so leitura)');
    await p.click('#dlgChSetup .tile'); await p.waitForTimeout(1500);
    assert.match(await txt('#stTxt'), /chaveamento/i);
    assert.equal(await p.evaluate(() => document.getElementById('stSalva').disabled), true);
    await p.evaluate(() => document.getElementById('dlgChSetup').close());
  });

  test('REAL com Dados confirmados (380 V): chaveamento vai ao PLC, a chave e selecionada e Salvar habilita', async () => {
    await p.evaluate(() => abreDados(false)); await p.waitForTimeout(600);
    await p.evaluate(() => { const set = (id, v) => { const el = document.getElementById(id); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }; set('dServ', 'TESTE1'); set('dVer', '1.0'); set('dFreq', '60'); set('dTens', '380'); set('dTamb', '25'); set('dPot', '91'); const f = document.querySelector('input[name=dFase][value="Trifásico"]'); if (f) f.checked = true; });
    await p.click('#dOk'); await p.waitForTimeout(2500);
    await p.click('#btSetup'); await p.waitForTimeout(800);
    assert.ok(await esperaAte(async () => /380 V informado e confirmado/.test(await txt('#stTxt') || ''), 8000), 'o chaveamento 380 V nao foi confirmado pelo PLC: ' + await txt('#stTxt'));
    await p.click('#dlgChSetup .tile'); 
    assert.ok(await esperaAte(async () => !(await p.evaluate(() => document.getElementById('stSalva').disabled)), 8000), 'Salvar nao habilitou: ' + await txt('#stTxt'));
  });

  test('caracterizacao (A CONFIRMAR): no REAL a potencia nominal da tela e 91 kW fixos', async () => {
    assert.equal(await p.evaluate(() => KW_NOM), 91);
  });

  test('ACHADO DR-1 (Baixa): a mensagem de bloqueio do Setup deveria dizer que a tensao vem de "Dados do ensaio"', { todo: 'DR-1: mensagem generica "Informe o chaveamento..." com os botoes travados; so o chip fala dos Dados do ensaio' }, async () => {
    const msg = await p.evaluate(() => tensMsg('56'));
    assert.match(msg, /Dados do ensaio/);
  });
});
