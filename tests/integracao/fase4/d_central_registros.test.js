'use strict';
// FASE 4 / Portao D: medidor_gerador_v1.10.171 (Chromium) - Central de registros. Pasta simulada pelo OPFS do navegador (mesma API FileSystemDirectoryHandle).
// Prova: lista com caixas de selecao, salvar em pasta (subpastas por tipo + RESUMO.md + AGRUPADO.md), Downloads (1 arquivo agrupado), imprimir, botao direito,
// aviso de fim do ensaio que so PERGUNTA (nada grava sozinho). NAO prova o seletor de pasta real do Chrome/Edge nem o conteudo dos logs do Node-RED real.
// A mesma bateria na 1.10.170 tem que FALHAR (BT2_FASE4_HTML=medidor_gerador_v1.10.170.html).
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { ENV_TESTE, esperaAte, sobe } = require('../ajudas.js');

const HTML = process.env.BT2_FASE4_HTML || 'medidor_gerador_v1.10.172.html';
describe('D - Central de registros', () => {
  let h, b, ctx, p;
  const txt = f => p.evaluate(f);
  before(async () => {
    h = await sobe({ fluxos: [], env: ENV_TESTE, servirHtml: true });
    b = await chromium.launch(); ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] }); p = await ctx.newPage();
    p.on('pageerror', x => { throw new Error('erro de JavaScript na pagina: ' + x.message); });
    await p.route('**/*', r => (r.request().url().startsWith(h.url) ? r.continue() : r.abort()));
    await p.route('**/api/gerador', r => r.fulfill({ status: 503, contentType: 'application/json', body: '{"ok":false}' }));
    await p.addInitScript(() => {   // "pasta do usuario" = OPFS; conta quantas escritas aconteceram (para provar que nada grava sozinho)
      window.__escritas = 0; window.__prints = 0;
      window.showDirectoryPicker = async () => { const raiz = await navigator.storage.getDirectory(); const d = await raiz.getDirectoryHandle('pasta_teste', { create: true }); return d; };
      const orig = FileSystemFileHandle.prototype.createWritable; FileSystemFileHandle.prototype.createWritable = function (...a) { window.__escritas++; return orig.apply(this, a); };
      window.print = () => { window.__prints++; };
    });
    await p.goto(h.url + '/html/' + HTML);
    await p.waitForFunction(() => window.CENTRAL_REG && window.OCOR && window.OCOR.set);
  });
  after(async () => { if (b) await b.close(); if (h) await h.para(); });

  test('o chip "Registros" abre a Central com os 5 itens e caixas de selecao', async () => {
    await p.click('#bCentral');
    assert.ok(await esperaAte(() => txt(() => document.getElementById('dlgCentral').open), 3000), 'a janela nao abriu');
    const itens = await txt(() => [...document.querySelectorAll('#cenLista input[data-it]')].map(i => i.dataset.it));
    assert.deepEqual(itens, ['alertas', 'monit', 'amostras', 'logs', 'dados']);
    assert.equal(await txt(() => document.querySelector('#cenLista input[data-it="amostras"]').disabled), true, 'sem amostras pendentes o item deve ficar desabilitado');
    assert.equal(await txt(() => document.querySelector('#cenLista input[data-it="alertas"]').checked), true);
  });

  test('salvar numa PASTA: cria BT2_registros/ensaio_.../<tipo>/ com os arquivos, RESUMO.md e AGRUPADO.md', async () => {
    await p.evaluate(() => window.OCOR.set('bco', 'CHV-007', 'Ch 5 sem retorno', { ref: 'BC56-5' }));
    await p.click('#cenEscolhe');
    assert.ok(await esperaAte(() => txt(() => /pasta_teste/.test(document.getElementById('cenPastaNome').textContent)), 3000), 'a pasta nao foi escolhida');
    await p.click('#cenSalva');
    assert.ok(await esperaAte(() => txt(() => /Salvo em/.test(document.getElementById('cenSt').textContent)), 8000), 'nao salvou: ' + await txt(() => document.getElementById('cenSt').textContent));
    const arv = await p.evaluate(async () => {
      const raiz = await navigator.storage.getDirectory(), pasta = await raiz.getDirectoryHandle('pasta_teste'), base = await pasta.getDirectoryHandle('BT2_registros');
      const out = {}; for await (const [n, ens] of base.entries()) { out.ens = n; out.itens = []; for await (const [n2, h2] of ens.entries()) { if (h2.kind === 'directory') { const l = []; for await (const [n3] of h2.entries()) l.push(n3); out.itens.push(n2 + '/' + l.join('+')); } else out.itens.push(n2); }
        const rs = await (await ens.getFileHandle('RESUMO.md')).getFile(); out.resumo = await rs.text(); const ag = await (await ens.getFileHandle('AGRUPADO.md')).getFile(); out.agr = await ag.text(); const al = await (await (await ens.getDirectoryHandle('alertas')).getFileHandle('alertas_falhas_ativas.txt')).getFile(); out.alAtivas = await al.text(); }
      return out;
    });
    assert.match(arv.ens, /^ensaio_\d{8}_\d{6}_/);
    for (const x of ['RESUMO.md', 'AGRUPADO.md']) assert.ok(arv.itens.includes(x), 'falta ' + x + ': ' + arv.itens);
    for (const d of ['alertas/', 'monitoramento/', 'logs/', 'ensaio/']) assert.ok(arv.itens.some(i => i.startsWith(d)), 'falta a subpasta ' + d + ': ' + arv.itens);
    assert.ok(!arv.itens.some(i => i.startsWith('amostras/')), 'sem amostras nao cria a subpasta');
    assert.match(arv.resumo, /CHV-007/); assert.match(arv.agr, /monitoramento_instantaneo\.json/); assert.match(arv.alAtivas, /Causa 1:/);
  });

  test('Downloads: baixa UM arquivo agrupado .md com tudo', async () => {
    await p.evaluate(() => { document.querySelector('#cenDest input[value="down"]').checked = true; });
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), p.click('#cenSalva')]);
    assert.match(dl.suggestedFilename(), /^bt2_registros_ensaio_.*_agrupado\.md$/);
    const t = require('fs').readFileSync(await dl.path(), 'utf8');
    assert.match(t, /# Registros do medidor/); assert.match(t, /alertas\/alertas_falhas_ativas\.txt/); assert.match(t, /monitoramento\/monitoramento_instantaneo\.json/);
  });

  test('imprimir agora: monta a area de impressao e chama a impressao do navegador', async () => {
    const antes = await txt(() => window.__prints);
    await p.click('#cenImprime');
    assert.ok(await esperaAte(async () => (await txt(() => window.__prints)) === antes + 1, 4000), 'nao chamou a impressao');
    assert.match(await txt(() => document.getElementById('prCentral').textContent), /Registros do medidor/);
  });

  test('botao direito: o menu traz "Central de registros" e abre a janela', async () => {
    await p.evaluate(() => { document.getElementById('dlgCentral').close(); });
    await p.click('body', { button: 'right', position: { x: 600, y: 400 } });
    await p.waitForSelector('.pia-menu');
    assert.ok(/Central de registros/.test(await txt(() => document.querySelector('.pia-menu').textContent)), 'item ausente no menu');
    await p.click('.pia-menu button:has-text("Central de registros")');
    assert.ok(await esperaAte(() => txt(() => document.getElementById('dlgCentral').open), 3000));
    await p.evaluate(() => document.getElementById('dlgCentral').close());
  });

  test('fim do ensaio: o aviso so PERGUNTA e NAO grava nada sozinho; "Agora nao" fecha; "Salvar registros..." abre a Central', async () => {
    const esc0 = await txt(() => window.__escritas);
    await p.evaluate(() => { T.started = true; T.fim = true; });
    assert.ok(await esperaAte(() => txt(() => !!document.getElementById('cenAviso')), 4000), 'o aviso nao apareceu');
    await new Promise(r => setTimeout(r, 1500));
    assert.equal(await txt(() => window.__escritas), esc0, 'a tela gravou sozinha no fim do ensaio');
    await p.click('#cenAvNao');
    assert.equal(await txt(() => !!document.getElementById('cenAviso')), false);
    await p.evaluate(() => { T.fim = false; T.started = false; });
    await new Promise(r => setTimeout(r, 1300));
    await p.evaluate(() => { T.started = true; T.fim = true; });
    assert.ok(await esperaAte(() => txt(() => !!document.getElementById('cenAviso')), 4000));
    await p.click('#cenAvSim');
    assert.ok(await esperaAte(() => txt(() => document.getElementById('dlgCentral').open && !document.getElementById('cenMsg').hidden), 3000), 'a Central nao abriu com a mensagem de fim de ensaio');
    assert.equal(await txt(() => window.__escritas), esc0, 'abrir a Central nao pode gravar');
    await p.evaluate(() => { document.getElementById('dlgCentral').close(); T.fim = false; T.started = false; });
  });

  test('a escolha das caixas fica lembrada', async () => {
    await p.click('#bCentral');
    await p.evaluate(() => { const c = document.querySelector('#cenLista input[data-it="logs"]'); c.checked = false; });
    await p.click('#cenSalva'); await new Promise(r => setTimeout(r, 1500));
    await p.evaluate(() => document.getElementById('dlgCentral').close());
    await p.click('#bCentral');
    assert.equal(await txt(() => document.querySelector('#cenLista input[data-it="logs"]').checked), false);
  });
});
