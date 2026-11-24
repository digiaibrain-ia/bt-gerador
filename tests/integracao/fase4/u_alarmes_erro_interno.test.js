'use strict';
/* =====================================================================================================================
   FASE 4 / Passo 5 (B3) — o motor de alarmes NÃO pode falhar em silêncio. 19/11/2026.
   PARA QUE SERVE (leigo): o medidor confere o estado a cada segundo para abrir/fechar alarmes. Se essa conferência der erro, antes o erro era engolido e os
   alarmes podiam parar de atualizar sem ninguém saber. Agora aparece o alerta SIS-001 "Erro interno da tela".
   COMO PROVA (técnico): medidor real no Chromium servido pelo harness; o teste faz a leitura de window.CH_SRV lançar erro SÓ quando quem lê é o motor (varre), para isolar a falha dele do resto da tela,
   e espera o SIS-001; depois restaura. (SIS-001 é evento: some sozinho em 60 s sem repetir.)
   CONTRA-PROVA: o medidor 1.10.228 (que engolia o erro) tem que FALHAR: BT2_FASE4_HTML=medidor_gerador_v1.10.228.html
   NÃO PROVA: o desarmar da mãe do Patamar (só conferido por leitura do código no tests/catch_vazio.test.js).
   ===================================================================================================================== */
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { ENV_TESTE, esperaAte, sobe } = require('../ajudas.js');
const HTML = process.env.BT2_FASE4_HTML || require('../../versoes.js').medidorAtual();

describe('Passo 5 B3: erro no motor de alarmes vira SIS-001', () => {
  let h, b, p;
  before(async () => {
    h = await sobe({ fluxos: [], env: ENV_TESTE, servirHtml: true });
    b = await chromium.launch(); p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.route('**/*', r => (r.request().url().startsWith(h.url) ? r.continue() : r.abort()));
    await p.goto(h.url + '/html/' + HTML);
    assert.ok(await esperaAte(() => p.evaluate(() => !!(window.OCOR && window.OCOR.ativas)), 8000), 'a tela nao carregou o OCOR');
  });
  after(async () => { if (b) await b.close(); if (h) await h.para(); });
  const sis = () => p.evaluate(() => window.OCOR.ativas().filter(o => o.cod === 'SIS-001').map(o => o.txt));

  test('controle: tela normal não tem SIS-001', async () => {
    assert.deepEqual(await sis(), []);
  });

  test('falha SÓ dentro do motor de alarmes (varre): aparece SIS-001 "Erro interno da tela" e a tela continua viva', async () => {
    // a propriedade que o varre() le (window.CH_SRV) passa a lançar erro SOMENTE quando quem lê é o varre (confere a pilha); o resto da tela não é afetado
    await p.evaluate(() => {
      window.__chSrv = window.CH_SRV;
      Object.defineProperty(window, 'CH_SRV', { configurable: true, get() { if (/\bvarre\b/.test(new Error().stack || '')) throw new Error('falha de teste dentro do varre'); return window.__chSrv; } });
    });
    assert.ok(await esperaAte(async () => (await sis()).length > 0, 6000), 'esperava SIS-001 em ate 6 s');
    assert.match((await sis())[0], /Erro interno da tela: falha de teste dentro do varre/);
    await p.evaluate(() => { Object.defineProperty(window, 'CH_SRV', { configurable: true, writable: true, value: window.__chSrv }); });
    assert.equal(await p.evaluate(() => typeof window.OCOR.ativas), 'function', 'a tela segue respondendo');
  });
});
