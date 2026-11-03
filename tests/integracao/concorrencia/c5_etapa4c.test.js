'use strict';
// C5 (Fase 3, Etapa 4c) - P3-B1 (registro em duas fases), P3-C1 (dedup por conjunto) e P3-C2 (sinais aditivos no GET) nas versoes novas.
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { ENV_TESTE, esperaAte, get, post, sobe } = require('../ajudas.js');

const PASTA = path.join(__dirname, '..', '..', '..', 'nodered', 'flows', 'bt2');
const lerFluxo = n => JSON.parse(fs.readFileSync(path.join(PASTA, n + '.json'), 'utf8')), porId = fl => Object.fromEntries(fl.map(x => [x.id, x]));
const lote = (sessao, ns) => ({ eventos: ns.map(n => ({ sessao, n, t: 't', v: '1', modo: 'm', card: 'c', tipo: 'api', acao: 'a' + n, res: 'ok' })) });
const LOG = '/api/dev/log-evento';

describe('C5 4c - estatico', () => {
  test('registro v1.8: monta tem a fase 2 (valida), grava preenchValido=FALSE na fase 1 e confere sobe o flag so depois; versao anterior intacta', () => {
    const p = porId(lerFluxo('registro-ensaio-db2100-api-v1.8')), antigo = JSON.stringify(lerFluxo('registro-ensaio-db2100-api-v1.7'));
    assert.match(p.reg_fn_prep.func, /_selFase === 'valida'/); assert.match(p.reg_fn_prep.func, /variable: 'preenchValido', payload: false/);
    assert.ok(!/variable: 'preenchValido', payload: true \}\);\n\s+writes\.push\(\{ variable: 'serie'/.test(p.reg_fn_prep.func), 'o TRUE nao pode mais vir antes dos dados');
    assert.match(p.reg_fn_conf.func, /ctx\.fase === 'valida'/); assert.match(p.reg_fn_conf.func, /_selFase: 'valida'/);
    assert.ok(!antigo.includes("_selFase === 'valida'"), 'a v1.7 foi alterada');
  });
  test('dev-logs v1.3: dedup por conjunto e sinais do GET presentes; versao anterior intacta', () => {
    const p = porId(lerFluxo('dev-logs-api-v1.3')), antigo = JSON.stringify(lerFluxo('dev-logs-api-v1.2'));
    assert.match(p.devlog_fn_post.func, /vs\.n\.includes\(e\.n\)/); assert.match(p.devlog_fn_get.func, /cursorAdiante/); assert.match(p.devlog_fn_get.func, /reiniciado/);
    assert.ok(!antigo.includes('cursorAdiante') && !antigo.includes('devlog_vistos'), 'a v1.2 foi alterada');
  });
});

const endVar = (flow, nome) => { for (const n of lerFluxo(flow)) for (const v of (n.vartable || [])) if (v.name === nome) return v.addr; throw new Error('variavel nao encontrada: ' + nome); };
const REG = 'registro-ensaio-db2100-api-v1.8';
const PREEN = { campos: { serie: 'SN-1', versao: 'V1', data: '2026-11-03', fase: 'trifasico', frequenciaHz: 60, tensaoV: 380, tempAmbienteC: 25, potenciaKw: 100, equipamentos: { motor: { fabricante: 'M', modelo: 'X', serie: '1' } } } };

describe('C5 4c - registro de ensaio: preenchimento em duas fases (P3-B1)', () => {
  test('P3-B1 (corrigido, 4c): queda do PLC em QUALQUER ponto do preenchimento (apos N escritas, N=0..24) nunca deixa preenchValido=TRUE com dados incompletos', async () => {
    const h = await sobe({ fluxos: [REG], env: ENV_TESTE });
    try {
      assert.ok(await esperaAte(async () => (await get(h, '/api/ensaio/snap')).status === 200, 10000));
      const v = n => h.plc.ler(endVar(REG, n));
      const completo = () => v('serie') === 'SN-1' && v('versao') === 'V1' && v('data') === '2026-11-03' && v('fase') === 'trifasico' && h.plc.ler(endVar(REG, 'preenchNums')) !== undefined;
      for (const N of [0, 1, 2, 3, 6, 12, 24]) {
        h.plc.falhas.escritaApos = null; assert.equal((await post(h, '/api/ensaio/snap/limpar', { confirmado: true })).status, 200);
        h.plc.aplicadas = 0; h.plc.falhas.escritaApos = N;
        const r = await post(h, '/api/ensaio/snap/preenchimento', PREEN);
        assert.notEqual(r.status, 200, 'N=' + N + ': queda e a resposta foi 200');
        assert.ok(!(v('preenchValido') === true && !completo()), 'N=' + N + ': preenchValido=TRUE com dados incompletos');
        assert.equal(v('preenchValido'), false, 'N=' + N + ': o snapshot deveria ficar INVALIDO');
      }
      h.plc.falhas.escritaApos = null; h.plc.aplicadas = 0;
      const ok = await post(h, '/api/ensaio/snap/preenchimento', PREEN);
      assert.equal(ok.status, 200, ok.t); assert.equal(v('preenchValido'), true); assert.ok(completo());
    } finally { await h.para(); }
  });

  test('P3-B1 (4c): sem falha o flag e a ULTIMA escrita (duas fases) e um snapshot valido anterior e INVALIDADO assim que o novo preenchimento falha no meio', async () => {
    const h = await sobe({ fluxos: [REG], env: ENV_TESTE });
    try {
      assert.ok(await esperaAte(async () => (await get(h, '/api/ensaio/snap')).status === 200, 10000));
      const flag = endVar(REG, 'preenchValido');
      h.plc.trace.length = 0;
      const t0 = Date.now(); const r = await post(h, '/api/ensaio/snap/preenchimento', PREEN); const dt = Date.now() - t0;
      assert.equal(r.status, 200, r.t); assert.ok(dt > 2500 && dt < 6000, 'duas fases devem levar ~3 s; levou ' + dt + ' ms');
      const ok = h.plc.trace.filter(t => t.ok).sort((x, y) => x.ordem - y.ordem);
      assert.equal(ok[ok.length - 1].addr, flag); assert.equal(ok[ok.length - 1].valor, true, 'a ultima escrita deveria ser preenchValido=TRUE');
      assert.equal(ok[0].addr, flag); assert.equal(ok[0].valor, false, 'a primeira escrita deveria INVALIDAR (preenchValido=FALSE)');
      const outro = JSON.parse(JSON.stringify(PREEN)); outro.campos.serie = 'SN-NOVO';
      h.plc.aplicadas = 0; h.plc.falhas.escritaApos = 3;
      const f = await post(h, '/api/ensaio/snap/preenchimento', outro);
      assert.notEqual(f.status, 200); assert.equal(h.plc.ler(flag), false, 'o snapshot antigo (valido) deveria ter sido invalidado ao iniciar o novo');
    } finally { await h.para(); }
  });

});

describe('C5 4c - dev-logs: casos de borda do dedup por conjunto', () => {
  test('n MAIS de 500 atras do maior continua descartado (limite da janela); dentro da janela e aceito; limpar nao ressuscita; sessoes independentes', async () => {
    const h = await sobe({ fluxos: ['dev-logs-api-v1.3'], env: ENV_TESTE });
    try {
      assert.ok(await esperaAte(async () => (await get(h, '/api/dev/logs')).status === 200, 8000));
      assert.equal((await post(h, LOG, lote('a', [1000]))).j.aceitos, 1);
      assert.equal((await post(h, LOG, lote('a', [499]))).j.duplicados, 1, 'n a mais de 500 do maior deveria ser descartado');
      assert.equal((await post(h, LOG, lote('a', [501]))).j.aceitos, 1, 'n dentro da janela deveria ser aceito');
      assert.equal((await post(h, LOG, lote('b', [1]))).j.aceitos, 1, 'outra sessao nao pode ser afetada');
      await post(h, '/api/dev/logs/limpar', {});
      assert.equal((await post(h, LOG, lote('a', [1000, 501]))).j.aceitos, 0, 'limpar nao pode ressuscitar eventos ja vistos');
      assert.equal((await post(h, LOG, lote('a', [1001]))).j.aceitos, 1);
    } finally { await h.para(); }
  });
  test('lotes concorrentes da MESMA sessao fora de ordem (4 lotes embaralhados): nenhum evento se perde e nenhum duplica', async () => {
    const h = await sobe({ fluxos: ['dev-logs-api-v1.3'], env: ENV_TESTE });
    try {
      assert.ok(await esperaAte(async () => (await get(h, '/api/dev/logs')).status === 200, 8000));
      const lotes = [[7, 8, 9], [1, 2, 3], [10, 11, 12], [4, 5, 6]];
      const rs = await Promise.all(lotes.map(l => post(h, LOG, lote('z', l))));
      assert.equal(rs.reduce((t, r) => t + r.j.aceitos, 0), 12);
      const g = (await get(h, '/api/dev/logs?limit=2000')).j; assert.deepEqual(g.eventos.map(x => x.n).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    } finally { await h.para(); }
  });
});
