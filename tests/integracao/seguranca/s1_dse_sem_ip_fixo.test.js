'use strict';
// S1 (Fase 2, Portao 1) - O endereco do DSE nao tem IP fixo no cliente. Por padrao e a origem da propria pagina.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { ENV_TESTE, esperaAte, sobe } = require('../ajudas.js');

const HTML = path.join(__dirname, '..', '..', '..', 'dashboard', 'ferramentas', 'medidor_gerador_v1.10.172.html');

describe('S1 DSE sem IP fixo no cliente', () => {
  test('estatico: o HTML nao traz nenhum IP de rede fixo (172.17.* nem http://<numero>:porta)', () => {
    const s = fs.readFileSync(HTML, 'utf8');
    assert.equal((s.match(/172\.17\./g) || []).length, 0, 'ainda ha 172.17.* no HTML');
    const ips = s.match(/https?:\/\/\d{1,3}(?:\.\d{1,3}){3}/g) || [];
    assert.deepEqual(ips, [], 'URL com IP literal no HTML: ' + ips.join(', '));
  });

  describe('navegador (medidor real contra o Node-RED de teste)', () => {
    let h, b, p, pedidos = [];
    before(async () => {
      h = await sobe({ fluxos: ['chaves-56-api-v3.0'], env: ENV_TESTE, servirHtml: true });
      b = await chromium.launch();
      p = await b.newPage({ viewport: { width: 1280, height: 900 } });
      await p.route('**/*', r => {
        const u = r.request().url();
        if (u.startsWith(h.url)) { pedidos.push(u); return r.continue(); }
        return r.abort();
      });
      await p.goto(h.url + '/html/medidor_gerador_v1.10.172.html');
      await esperaAte(async () => pedidos.some(u => u.endsWith('/api/gerador')), 8000, 200);
    });
    after(async () => { if (b) await b.close(); if (h) await h.para(); });

    test('o campo do DSE mostra a origem da pagina, sem customizacao', async () => {
      assert.equal(await p.inputValue('#url'), h.url + '/api/gerador');
    });

    test('a tela consulta o DSE na propria origem e nenhum pedido vai a IP de rede', () => {
      assert.ok(pedidos.some(u => u === h.url + '/api/gerador'), 'nenhum pedido chegou em /api/gerador da propria origem');
      assert.equal(pedidos.filter(u => /172\.17\./.test(u)).length, 0);
    });

    test('customizacao salva so no localStorage e usada na consulta', async () => {
      const outro = h.url + '/api/outro-dse';
      await p.evaluate(u => { localStorage.setItem('medidor.dseUrl', u); }, outro);
      await p.reload();
      assert.equal(await p.inputValue('#url'), outro, 'a customizacao salva nao apareceu no campo');
      assert.ok(await esperaAte(() => pedidos.some(u => u === outro), 8000, 200), 'a tela nao consultou o endereco customizado');
    });

    test('voltar ao padrao remove a customizacao do localStorage', async () => {
      await p.fill('#url', h.url + '/api/gerador');
      await p.dispatchEvent('#url', 'change');
      const salvo = await p.evaluate(() => localStorage.getItem('medidor.dseUrl'));
      assert.equal(salvo, null, 'o padrao nao deveria ficar salvo no navegador');
    });
  });
});
