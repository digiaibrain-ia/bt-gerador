'use strict';
// C3 (Fase 3, Etapa 4a) - correcao de P3-A1/A2/A3 nos 4 fluxos de chaves (BC56, BC400, BC550, BC595): expurgo na fila + revalidacao na saida.
// Cada banco usa SEUS enderecos (BC595 tem layout de 32 chaves). Invariante: estado final = ultimo comando aceito e resposta verdadeira.
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { ENV_TESTE, BANCOS, enderecos, esperaAte, get, post, sobe } = require('../ajudas.js');
const V = require('../verificador.js');

const dorme = ms => new Promise(r => setTimeout(r, ms));
const PASTA = path.join(__dirname, '..', '..', '..', 'nodered', 'flows', 'bt2');

describe('C3 4a - estatico: os 4 fluxos novos tem o expurgo, a revalidacao e mantem a prioridade do desligar', () => {
  for (const id of Object.keys(BANCOS)) {
    test('BC' + id + ': nos novos ligados na ordem fila/libera -> revalida -> monta/watchdog; expurgo -> responder proprio', () => {
      const fl = JSON.parse(fs.readFileSync(path.join(PASTA, BANCOS[id].flow + '.json'), 'utf8')), por = Object.fromEntries(fl.map(n => [n.id, n])), p = 'chv' + id + '_';
      const fila = por[p + 'fila'], lib = por[p + 'libera_fila'], rev = por[p + 'revalida'], can = por[p + 'cancela_resp'];
      assert.ok(rev && can, 'faltam os nos novos');
      assert.deepEqual(fila.wires, [[rev.id], [can.id]]); assert.deepEqual(lib.wires, [[rev.id]]);
      assert.deepEqual(rev.wires, [[p + 'monta', p + 'wd'], [p + 'responde']]);
      assert.equal(por[can.wires[0][0]].type, 'http response');
      assert.match(fila.func, /prio = /); assert.match(fila.func, /fila\.unshift\(msg\)/, 'a prioridade do desligar (unshift) precisa continuar');
      assert.match(can.func, /CANCELADO_POR_DESLIGAR/); assert.ok(!/libera/.test(can.func.replace(/\/\/.*$/gm, '')), 'o responder de cancelados nao pode liberar a fila');
      assert.match(rev.func, /LEITURA_VELHA/); assert.match(rev.func, /ESTADO_MUDOU/);
    });
  }
  test('as versoes anteriores (v3.2/v1.3) nao foram alteradas pelo gerador da 4a', () => {
    for (const n of ['chaves-56-api-v3.2', 'chaves-400-api-v3.2', 'chaves-550-api-v1.3', 'chaves-595-api-v1.3'])
      assert.ok(!fs.readFileSync(path.join(PASTA, n + '.json'), 'utf8').includes('CANCELADO_POR_DESLIGAR'), n);
  });
});

for (const id of Object.keys(BANCOS)) {
  describe('C3 4a - BC' + id + ' (' + BANCOS[id].N + ' chaves)', () => {
    const rota = r => '/api/chaves/' + id + '/' + r;
    const sobeBanco = async () => {
      const h = await sobe({ fluxos: [BANCOS[id].flow], env: ENV_TESTE }), e = enderecos(id);
      h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true);
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/' + id)).status === 200, 10000), 'banco nao ficou pronto');
      return { h, e };
    };
    const P = (h, r, c) => post(h, rota(r), c);
    const seguraFila = h => h.plc.atrasosEscrita.push(400);
    const bancoLigadoNaTela = h => esperaAte(async () => (await get(h, '/api/chaves/' + id)).j.bancoLigado === true, 4000, 60);
    const NB = BANCOS[id].n, bloqueia = NB;           // ultima chave valida do banco serve de "comando que segura a fila"

    test('A1: ligar banco aceito antes + desligar banco depois => banco DESLIGADO; o ligar antigo responde 409 CANCELADO_POR_DESLIGAR e nao chega ao PLC', async () => {
      const { h, e } = await sobeBanco();
      try {
        h.plc.trace.length = 0; seguraFila(h);
        const a = P(h, 'habilitar', { indice: bloqueia, habilitada: true }); await dorme(60);
        const b = P(h, 'banco', { ligar: true }); await dorme(40); const c = P(h, 'banco', { ligar: false });
        const [ra, rb, rc] = await Promise.all([a, b, c]); await dorme(300);
        assert.equal(ra.status, 200, ra.t); assert.equal(rc.status, 200, rc.t);
        assert.equal(rb.status, 409, rb.t); assert.equal(rb.j.codigo, 'CANCELADO_POR_DESLIGAR');
        assert.equal(h.plc.ler(e.cbBanco), false);
        assert.ok(!V.valoresAplicados(h.plc.trace, e.cbBanco).includes(true), 'o ligar cancelado chegou ao PLC');
        assert.equal(V.respostasEmDuplicidade(h.logs).length, 0, JSON.stringify(h.logs.slice(-2)));
      } finally { await h.para(); }
    });

    test('A1: o expurgo NAO atinge o que foi aceito DEPOIS do desligar (ligar banco novo executa) nem comandos que nao dependem do banco (habilitar)', async () => {
      const { h, e } = await sobeBanco();
      try {
        h.plc.trace.length = 0; seguraFila(h);
        const a = P(h, 'habilitar', { indice: bloqueia, habilitada: true }); await dorme(60);
        const velho = P(h, 'banco', { ligar: true }); await dorme(30);
        const hab = P(h, 'habilitar', { indice: 2, habilitada: true }); await dorme(30);
        const des = P(h, 'banco', { ligar: false }); await dorme(30);
        const novo = P(h, 'banco', { ligar: true });
        const [ra, rv, rh, rd, rn] = await Promise.all([a, velho, hab, des, novo]); await dorme(400);
        assert.deepEqual([ra.status, rv.status, rh.status, rd.status, rn.status], [200, 409, 200, 200, 200], [ra, rv, rh, rd, rn].map(x => x.status + ' ' + x.t).join(' | '));
        assert.equal(h.plc.ler(e.cbBanco), true, 'o ultimo comando aceito foi LIGAR (depois do desligar)');
        assert.equal(h.plc.ler(e.hab(2)), true, 'o habilitar (nao depende do banco) deveria ter executado');
        assert.equal(V.respostasEmDuplicidade(h.logs).length, 0);
      } finally { await h.para(); }
    });

    test('A2: selecionar aceito antes de habilitar:false na frente => 409 ESTADO_MUDOU e ChaveSel nao fica numa chave desabilitada', async () => {
      const { h, e } = await sobeBanco();
      try {
        h.plc.escrever(e.cbBanco, true); h.plc.escrever(e.hab(3), true);
        assert.ok(await esperaAte(async () => { const j = (await get(h, '/api/chaves/' + id)).j; return j.bancoLigado === true && j.habilitada?.[2] === true; }, 4000, 60));
        seguraFila(h);
        const a = P(h, 'habilitar', { indice: bloqueia, habilitada: true }); await dorme(60);
        const b = P(h, 'habilitar', { indice: 3, habilitada: false }); await dorme(40); const c = P(h, 'selecionar', { indice: 3 });
        const [, rb, rc] = await Promise.all([a, b, c]); await dorme(300);
        assert.equal(rb.status, 200, rb.t); assert.equal(rc.status, 409, rc.t); assert.equal(rc.j.codigo, 'ESTADO_MUDOU');
        assert.equal(h.plc.ler(e.chaveSel), 0); assert.equal(h.plc.ler(e.hab(3)), false);
      } finally { await h.para(); }
    });

    test('A3: ligar chave aceito antes de desligar banco => cancelado (409) e CbLigar nunca fica TRUE com o banco desligado', async () => {
      const { h, e } = await sobeBanco();
      try {
        h.plc.escrever(e.cbBanco, true); h.plc.escrever(e.hab(2), true);
        assert.ok(await esperaAte(async () => { const j = (await get(h, '/api/chaves/' + id)).j; return j.bancoLigado === true && j.habilitada?.[1] === true; }, 4000, 60));
        seguraFila(h);
        const a = P(h, 'habilitar', { indice: bloqueia, habilitada: true }); await dorme(60);
        const c = P(h, 'ligar', { indice: 2, ligar: true }); await dorme(40); const b = P(h, 'banco', { ligar: false });
        const [, rc, rb] = await Promise.all([a, c, b]); await dorme(300);
        assert.equal(rb.status, 200, rb.t); assert.equal(rc.status, 409, rc.t); assert.equal(rc.j.codigo, 'CANCELADO_POR_DESLIGAR');
        assert.equal(h.plc.ler(e.cbBanco), false); assert.equal(h.plc.ler(e.cb(2)), false);
      } finally { await h.para(); }
    });

    test('regressao: sem concorrencia o fluxo normal continua igual (ligar banco -> habilitar -> selecionar -> ligar chave -> desligar banco, tudo 200)', async () => {
      const { h, e } = await sobeBanco();
      try {
        for (const [r, c] of [['banco', { ligar: true }], ['habilitar', { indice: 2, habilitada: true }]]) { const x = await P(h, r, c); assert.equal(x.status, 200, r + ' ' + x.t); }
        assert.ok(await bancoLigadoNaTela(h));
        for (const [r, c] of [['selecionar', { indice: 2 }], ['selecionar', { indice: 0 }], ['ligar', { indice: 2, ligar: true }], ['ligar', { indice: 2, ligar: false }], ['banco', { ligar: false }]]) {
          const x = await P(h, r, c); assert.equal(x.status, 200, r + ' ' + JSON.stringify(c) + ' ' + x.t);
        }
        assert.equal(h.plc.ler(e.cbBanco), false);
      } finally { await h.para(); }
    });
  });
}
