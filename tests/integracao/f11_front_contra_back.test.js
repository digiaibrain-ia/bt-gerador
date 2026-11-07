'use strict';
// F11 - Front REAL (medidor_gerador_v1.10.176.html, no Chromium/Playwright) operando contra o Node-RED local de teste e o PLC simulado.
// O navegador so fala com o Node-RED de teste: qualquer outro endereco e BLOQUEADO (inclusive o DSE real fixo no HTML).
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { ENV_TESTE, enderecos, esperaAte, get, sobe } = require('./ajudas.js');

describe('F11 front real contra o Node-RED de teste', () => {
  let h, e56, e400, b, p, bloqueados = [];
  const txt = sel => p.evaluate(s => { const el = document.querySelector(s); return el ? el.textContent.replace(/\s+/g, ' ').trim() : null; }, sel);
  const temClasse = (sel, cls) => p.evaluate(([s, c]) => { const el = document.querySelector(s); return !!el && el.classList.contains(c); }, [sel, cls]);

  before(async () => {
    h = await sobe({ fluxos: ['chaves-56-api-v3.4', 'chaves-400-api-v3.4', 'registro-ensaio-db2100-api-v1.8'], env: ENV_TESTE, servirHtml: true });
    e56 = enderecos('56'); e400 = enderecos('400');
    for (const e of [e56, e400]) { h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true); }
    b = await chromium.launch();
    p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    p.on('pageerror', x => { throw new Error('erro de JavaScript na pagina: ' + x.message); });
    await p.route('**/*', r => {
      const u = r.request().url();
      if (u.startsWith(h.url)) return r.continue();
      bloqueados.push(u); return r.abort();                 // trava no navegador: so o Node-RED de teste
    });
    await p.goto(h.url + '/html/medidor_gerador_v1.10.176.html');
    assert.ok(await esperaAte(async () => (await txt('#lkPlc') || '').includes('leitura ok'), 12000), 'o chip do PLC nunca mostrou "leitura ok"');
  });
  after(async () => { if (b) await b.close(); if (h) await h.para(); });

  test('caminho feliz: a tela mostra "leitura ok" do PLC com os bancos lidos', async () => {
    assert.match(await txt('#lkPlc'), /leitura ok/);
  });

  test('o estado do PLC aparece na tela: chave ligada no DB vira chave ligada (verde) no card', async () => {
    h.plc.escrever(e56.sb(1), true);                        // feedback da chave 1 do BC56
    assert.ok(await esperaAte(() => temClasse('#bancos .tile[data-i="0"]', 's1'), 6000), 'a chave 1 do BC56 nao ficou ligada na tela');
    h.plc.escrever(e56.sb(1), false);
    assert.ok(await esperaAte(async () => !(await temClasse('#bancos .tile[data-i="0"]', 's1')), 6000), 'a chave 1 nao voltou a desligada na tela');
  });

  test('comando pela tela chega ao PLC: "Ligar banco" do BC56 grava LigarBanco e o botao muda', async () => {
    assert.equal(h.plc.ler(e56.cbBanco), false, 'pre-condicao: banco 56 desligado');
    const botao = p.locator('.bkbtn').first();
    await botao.click();
    assert.ok(await esperaAte(() => h.plc.ler(e56.cbBanco) === true, 5000), 'o comando de ligar o banco nao chegou ao PLC');
    assert.ok(await esperaAte(async () => (await p.locator('.bkbtn').first().textContent()).includes('Desligar banco'), 5000), 'o botao nao mudou para "Desligar banco"');
  });

  test('queda do PLC (sem leitura) aparece na tela: o chip deixa de dizer "leitura ok"', async () => {
    // PLC fora do ar = leitura E escrita caem juntas (na pratica nao existe PLC que so falha na leitura)
    h.plc.falhas.leitura = true; h.plc.falhas.escrita = true;
    try {
      assert.ok(await esperaAte(async () => !(await txt('#lkPlc') || '').includes('leitura ok'), 12000), 'a tela continuou dizendo "leitura ok" com o PLC parado: ' + await txt('#lkPlc'));
    } finally { /* a recuperacao e testada no caso seguinte */ }
  });

  test('erro (503) nao e silencioso: operar com o PLC parado mostra aviso e NAO muda o PLC', async () => {
    const antes = h.plc.ler(e56.cbBanco);
    await p.locator('.bkbtn').first().click().catch(() => {});
    assert.ok(await esperaAte(async () => ((await txt('#gmsg')) || '').length > 0, 6000), 'nenhuma mensagem apareceu na tela com o PLC parado');
    assert.equal(h.plc.ler(e56.cbBanco), antes, 'o banco mudou no PLC mesmo com o PLC sem resposta');
  });

  test('recuperacao: quando o PLC volta, a tela volta a "leitura ok" sozinha', async () => {
    h.plc.falhas.leitura = false; h.plc.falhas.escrita = false;
    assert.ok(await esperaAte(async () => (await txt('#lkPlc') || '').includes('leitura ok'), 12000), 'a tela nao se recuperou: ' + await txt('#lkPlc'));
  });

  test('o navegador so fala com o Node-RED de teste (IP de rede fixo nao pode aparecer)', () => {
    // achado para a Fase 2 (cliente com endereco real fixo): nao falha o teste, so registra
    const reais = [...new Set(bloqueados.map(u => { try { return new URL(u).host; } catch (x) { return u; } }))];
    console.log('     bloqueados pelo teste (' + bloqueados.length + '): ' + reais.join(', '));
    assert.ok(bloqueados.every(u => !u.startsWith('http://127.0.0.1')), 'o teste bloqueou um endereco local por engano');
    // S1 (Fase 2): a tela nao pode mais tentar falar com IP de rede fixo (o DSE vem da propria origem)
    assert.equal(bloqueados.filter(u => /172\.17\./.test(u)).length, 0, 'a tela ainda tenta falar com IP de rede fixo');
  });
});
