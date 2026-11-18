'use strict';
/* =====================================================================================================================
   FASE 4 / Passo 5 (B1+B2) — falha ao DESLIGAR/ZERAR o PLC na volta ao estado seguro não pode ficar silenciosa. 18/11/2026.
   PARA QUE SERVE (leigo): quando o operador troca de modo, a tela manda o PLC desligar as chaves e soltar a seleção. Se o Node-RED
   ou o PLC não confirmar (503, fora do ar), a tela tem que AVISAR (alerta CHV-009) e só tirar o aviso quando o desligamento der certo.
   COMO PROVA (técnico): Node-RED REAL do harness + PLC simulado + medidor real no Chromium. A falha é injetada NO NAVEGADOR (503 nas rotas
   POST /api/chaves/56/selecionar e /ligar); o resto é real. Nada fala com PLC, DSE ou Node-RED de produção (o navegador só alcança o harness).
   CONTRA-PROVA: a mesma bateria no medidor 1.10.227 (sem o CHV-009) tem que FALHAR: BT2_FASE4_HTML=medidor_gerador_v1.10.227.html
   NÃO PROVA: o comportamento no PLC/ET200 reais, nem o texto "desmarcada automaticamente" do Setup (gerador parado), que precisa de uma chave
   selecionada pelo painel.
   ===================================================================================================================== */
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { ENV_TESTE, enderecos, esperaAte, sobe } = require('../ajudas.js');
const HTML = process.env.BT2_FASE4_HTML || 'medidor_gerador_v1.10.228.html';

describe('Passo 5 B1/B2: zerar o PLC com falha avisa (CHV-009) e só normaliza quando der certo', () => {
  let h, b, p, falhar = false, chamadas = [];
  const ativas = () => p.evaluate(() => window.OCOR.ativas().map(o => ({ cod: o.cod, ref: o.ref, tipo: o.tipo, txt: o.txt })));
  const cod = async c => (await ativas()).filter(o => o.cod === c);
  // simula "o operador comandou a chave 1 do BC56 e a deixou selecionada no PLC", depois pede a volta ao estado seguro
  // (o PLC simulado também fica com a chave 1 comandada e selecionada, senão a leitura periódica da tela zera o CH_CMD no meio do teste)
  const estadoSeguro = async () => {
    const e = enderecos('56'); h.plc.escrever(e.cb(1), true); h.plc.escrever(e.hab(1), true); h.plc.escrever(e.chaveSel, 1);
    await p.evaluate(async () => { CH_CMD[0] = true; CH_SELPLC = 0; await window.chModoSeguro({ eraPlc: true, serPlc: false }); });
  };

  before(async () => {
    h = await sobe({ fluxos: ['chaves-56-api-v3.7', 'chaves-400-api-v3.6', 'registro-ensaio-db2100-api-v1.10'], env: ENV_TESTE, servirHtml: true });
    const e56 = enderecos('56'), e400 = enderecos('400');
    for (const e of [e56, e400]) { h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true); }
    b = await chromium.launch(); p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    p.on('pageerror', x => { throw new Error('erro de JavaScript na pagina: ' + x.message); });
    await p.route('**/*', r => {
      const rq = r.request(), u = rq.url();
      if (!u.startsWith(h.url)) return r.abort();                                   // só o Node-RED de teste
      if (rq.method() === 'POST' && /\/api\/chaves\/56\/(selecionar|ligar)$/.test(u)) {
        chamadas.push(u.split('/').pop() + (falhar ? ' (503 injetado)' : ''));
        if (falhar) return r.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ ok: false, erro: 'sem leitura recente do PLC (injetado pelo teste)' }) });
      }
      return r.continue();
    });
    await p.goto(h.url + '/html/' + HTML);
    assert.ok(await esperaAte(async () => ((await p.evaluate(() => (document.querySelector('#lkPlc') || {}).textContent || '')).includes('leitura ok')), 12000), 'chip do PLC sem "leitura ok"');
  });
  after(async () => { if (b) await b.close(); if (h) await h.para(); });

  test('controle: com o PLC respondendo, voltar ao estado seguro NÃO abre CHV-009', async () => {
    await estadoSeguro();
    assert.ok(chamadas.some(c => c.startsWith('ligar')) && chamadas.some(c => c.startsWith('selecionar')), 'a tela deveria ter mandado desligar a chave e soltar a seleção: ' + chamadas.join(' | '));
    assert.deepEqual(await cod('CHV-009'), []);
  });

  test('falha 503 nas duas rotas: abre o Alerta CHV-009 do BC56 (tipo Alerta) e o CHV-001 continua aparecendo', async () => {
    falhar = true; chamadas = [];
    await estadoSeguro();
    const a = await cod('CHV-009');
    assert.equal(a.length, 1, 'esperava 1 CHV-009, veio: ' + JSON.stringify(await ativas()));
    assert.equal(a[0].ref, 'BC56'); assert.equal(a[0].tipo, 'm', 'deve ser Alerta');
    assert.match(a[0].txt, /NÃO consegui desligar/); assert.match(a[0].txt, /seleção da chave não foi zerada/); assert.match(a[0].txt, /continua comandada/);
    assert.equal((await cod('CHV-001')).length >= 1, true, 'o CHV-001 de cada comando que falhou continua existindo');
  });

  test('o aviso não some sozinho: continua ativo mesmo com a tela lendo o PLC por alguns ciclos', async () => {
    falhar = false;
    await new Promise(r => setTimeout(r, 3500));                                    // ~3 ciclos de leitura da tela com o PLC já respondendo
    assert.equal((await cod('CHV-009')).length, 1, 'CHV-009 não pode sair sozinho: só quando o desligamento do banco der certo');
  });

  test('voltou a responder: repetir a volta ao estado seguro normaliza o CHV-009', async () => {
    falhar = false; chamadas = [];
    await estadoSeguro();
    assert.ok(await esperaAte(async () => (await cod('CHV-009')).length === 0, 4000), 'CHV-009 deveria ter normalizado: ' + JSON.stringify(await ativas()));
    const hist = await p.evaluate(() => window.OCOR.historico().filter(o => o.cod === 'CHV-009').length);
    assert.ok(hist >= 1, 'o CHV-009 precisa ficar no histórico (Central de registros)');
  });

  test('o roteiro do CHV-009 existe no catálogo (efeito, causa e solução)', async () => {
    const r = await p.evaluate(() => { const c = window.OCOR.CAT['CHV-009']; return c ? { t: c.t, card: c.card, txt: c.txt } : null; });
    assert.deepEqual(r && r.t, 'm'); assert.equal(r.card, 'bco');
  });
});
