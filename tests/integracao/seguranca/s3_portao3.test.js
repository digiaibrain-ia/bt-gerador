'use strict';
// S3 (Fase 2, Portao 3, D3) - "Nunca confie no cliente": toda rota de ESCRITA so aceita pedido da PROPRIA tela (mesma origem) e em JSON.
// CORS sozinho nao protege: o browser envia o POST "simples" (text/plain) mesmo sem permissao de leitura. A guarda fica no servidor.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe } = require('../ajudas.js');

const PASTA = path.join(__dirname, '..', '..', '..', 'nodered', 'flows', 'bt2');
const PROTEGIDOS = ['chaves-56-api-v3.4', 'chaves-400-api-v3.4', 'chaves-550-api-v1.5', 'chaves-595-api-v1.5', 'registro-ensaio-db2100-api-v1.8', 'dev-logs-api-v1.3', 'simulador-dse-demo-v7'];
const lerFluxo = n => JSON.parse(fs.readFileSync(path.join(PASTA, n + '.json'), 'utf8'));
const ESCRITA = ['post', 'put', 'patch', 'delete'];
const rotasEscrita = n => lerFluxo(n).filter(x => x.type === 'http in' && ESCRITA.includes(String(x.method).toLowerCase()));
const EVIL = 'http://evil.example';

describe('S3 Portao 3 - guarda de escrita (D3)', () => {
  test('estatico: TODA rota de escrita das versoes novas passa pela guarda antes de qualquer outro no', () => {
    let total = 0;
    for (const n of PROTEGIDOS) {
      const fl = lerFluxo(n), porId = Object.fromEntries(fl.map(x => [x.id, x]));
      for (const r of rotasEscrita(n)) {
        total++;
        const alvo = porId[r.wires[0][0]];
        assert.equal(r.wires[0].length, 1, n + ' ' + r.url + ': o http in deve ir SO para a guarda');
        assert.equal(alvo.name, 'guarda escrita (D3)', n + ' ' + r.url + ': primeiro no apos o http in nao e a guarda');
        assert.equal(alvo.outputs, 2);
        assert.ok(porId[alvo.wires[1][0]].type === 'http response', n + ' ' + r.url + ': bloqueio deve sair por um http response');
      }
    }
    assert.equal(total, 8 * 4 + 4 + 2 + 1, 'quantidade de rotas de escrita protegidas');
  });

  test('estatico: as versoes antigas (Portao 2) nao foram alteradas pelo gerador do Portao 3', () => {
    for (const n of ['chaves-56-api-v3.1', 'registro-ensaio-db2100-api-v1.6', 'dev-logs-api-v1.1', 'simulador-dse-demo-v6'])
      assert.ok(!JSON.stringify(lerFluxo(n)).includes('guarda escrita (D3)'), n + ' foi alterado');
  });

  describe('com os fluxos no ar (Node-RED de teste + PLC simulado)', () => {
    let h, e56, srvEvil, portaEvil;
    before(async () => {
      h = await sobe({ fluxos: PROTEGIDOS, env: ENV_TESTE, envAbas: { BT2_BANCADA: '1' } });
      e56 = enderecos('56');
      for (const e of [e56]) { h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true); }
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 10000), 'BC56 nao ficou pronto');
      srvEvil = http.createServer((q, s) => { s.setHeader('Content-Type', 'text/html'); s.end('<html><body>pagina de outro site</body></html>'); });
      await new Promise(r => srvEvil.listen(0, '127.0.0.1', r)); portaEvil = srvEvil.address().port;
    });
    after(async () => { if (srvEvil) srvEvil.close(); if (h) await h.para(); });

    const hab = (cab, corpo) => post(h, '/api/chaves/56/habilitar', corpo === undefined ? { indice: 5, habilitada: true } : corpo, cab);
    const limpa = () => h.plc.escrever(e56.hab(5), false);

    test('caminho feliz: mesma origem + application/json passa e GRAVA no PLC', async () => {
      limpa(); const r = await hab();
      assert.equal(r.status, 200, r.t); assert.equal(h.plc.ler(e56.hab(5)), true);
    });

    test('Content-Type com charset (application/json; charset=utf-8) tambem passa', async () => {
      limpa(); const r = await hab({ 'Content-Type': 'application/json; charset=utf-8' });
      assert.equal(r.status, 200, r.t); assert.equal(h.plc.ler(e56.hab(5)), true);
    });

    test('origem EXTERNA (Origin de outro site) -> 403 D3_origem_nao_permitida e NADA e gravado', async () => {
      limpa(); const antes = h.plc.escritas.length;
      const r = await hab({ Origin: EVIL });
      assert.equal(r.status, 403, r.t); assert.equal(r.j.ok, false); assert.equal(r.j.codigo, 'D3_origem_nao_permitida');
      assert.equal(h.plc.escritas.length, antes, 'o PLC nao pode receber escrita de origem externa');
      assert.equal(h.plc.ler(e56.hab(5)), false);
    });

    test('sem Origin e sem Referer -> 403 D3_sem_origem', async () => {
      const antes = h.plc.escritas.length;
      const r = await hab({ Origin: undefined });
      assert.equal(r.status, 403, r.t); assert.equal(r.j.codigo, 'D3_sem_origem');
      assert.equal(h.plc.escritas.length, antes);
    });

    test('sem Origin mas com Referer da mesma origem -> passa; Referer externo -> 403', async () => {
      limpa(); let r = await hab({ Origin: undefined, Referer: h.url + '/html/medidor_gerador_v1.10.170.html' });
      assert.equal(r.status, 200, r.t); assert.equal(h.plc.ler(e56.hab(5)), true);
      limpa(); r = await hab({ Origin: undefined, Referer: EVIL + '/atacante.html' });
      assert.equal(r.status, 403, r.t); assert.equal(r.j.codigo, 'D3_origem_nao_permitida'); assert.equal(h.plc.ler(e56.hab(5)), false);
    });

    test('Origin com o mesmo prefixo do servidor mas outro dominio (truque de comparacao) -> 403', async () => {
      for (const o of [h.url + '.evil.example', h.url + '@evil.example', h.url.replace('127.0.0.1', '127.0.0.1.evil.example'), 'null']) {
        limpa(); const r = await hab({ Origin: o });
        assert.equal(r.status, 403, 'Origin ' + o + ' => ' + r.status); assert.equal(h.plc.ler(e56.hab(5)), false);
      }
    });

    test('Content-Type que NAO e JSON (text/plain, form, ausente) -> 403 D3_content_type_invalido, mesmo na mesma origem', async () => {
      for (const ct of ['text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data; boundary=x', 'application/jsonx', undefined]) {
        limpa(); const antes = h.plc.escritas.length;
        const r = await hab({ 'Content-Type': ct }, '{"indice":5,"habilitada":true}');
        assert.equal(r.status, 403, 'Content-Type ' + ct + ' => ' + r.status + ' ' + r.t);
        assert.equal(r.j.codigo, 'D3_content_type_invalido');
        assert.equal(h.plc.escritas.length, antes);
      }
    });

    test('a GUARDA vale para TODAS as rotas de escrita: com origem externa cada uma devolve 403 e o PLC nao recebe nada', async () => {
      const antes = h.plc.escritas.length; let n = 0;
      for (const f of PROTEGIDOS) for (const r of rotasEscrita(f)) {
        const resp = await post(h, r.url, { indice: 1, habilitada: true, ligado: true, eventos: [], confirmado: true }, { Origin: EVIL });
        assert.equal(resp.status, 403, f + ' ' + r.url + ' => ' + resp.status + ' ' + resp.t); n++;
      }
      assert.equal(n, 39, 'rotas verificadas');
      assert.equal(h.plc.escritas.length, antes, 'alguma rota escreveu no PLC com origem externa');
    });

    test('leituras (GET) NAO exigem Origin: o medidor e outras ferramentas continuam lendo', async () => {
      for (const rota of ['/api/chaves/56', '/api/ensaio/modo', '/api/logs/56']) {
        const r = await get(h, rota); assert.notEqual(r.status, 403, rota); assert.ok(r.status < 500, rota + ' ' + r.status);
      }
    });

    test('ataque real no navegador: pagina de OUTRA origem tenta POST text/plain (no-cors) na rota de comando -> 403 e o PLC nao muda', async () => {
      const b = await chromium.launch(); let visto = null;
      try {
        const p = await b.newPage();
        p.on('response', r => { if (r.url().includes('/api/chaves/56/habilitar')) visto = r.status(); });
        await p.route('**/*', r => { const u = r.request().url(); return (u.startsWith(h.url) || u.startsWith('http://127.0.0.1:' + portaEvil)) ? r.continue() : r.abort(); });
        await p.goto('http://127.0.0.1:' + portaEvil + '/');
        limpa(); const antes = h.plc.escritas.length;
        await p.evaluate(async alvo => { try { await fetch(alvo + '/api/chaves/56/habilitar', { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ indice: 5, habilitada: true }) }); } catch (e) { /* opaco */ } }, h.url);
        assert.ok(await esperaAte(() => visto !== null, 5000), 'o pedido nao chegou ao servidor (o teste nao provaria nada)');
        assert.equal(visto, 403);
        assert.equal(h.plc.escritas.length, antes); assert.equal(h.plc.ler(e56.hab(5)), false);
      } finally { await b.close(); }
    });
  });

  describe('lista de origens extras (BT2_ORIGENS_OK, variavel da aba)', () => {
    test('origem listada passa; origem nao listada continua barrada; "null" so passa se listado de proposito', async () => {
      const h = await sobe({ fluxos: ['chaves-56-api-v3.4'], env: ENV_TESTE, envAbas: { BT2_ORIGENS_OK: 'http://painel.exemplo:1880, null' } });
      try {
        const e = enderecos('56'); h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true);
        assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 8000));
        const hab = cab => post(h, '/api/chaves/56/habilitar', { indice: 6, habilitada: true }, cab);
        assert.equal((await hab({ Origin: 'http://painel.exemplo:1880' })).status, 200);
        assert.equal((await hab({ Origin: 'null' })).status, 200);
        assert.equal((await hab({ Origin: 'http://outro.exemplo:1880' })).status, 403);
      } finally { await h.para(); }
    });
  });
});
