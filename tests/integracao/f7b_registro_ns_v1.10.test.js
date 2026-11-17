'use strict';
// F7b - Registro do ensaio v1.10: NS normalizado no servidor (O cortado/asteriscos) e metadados opcionais origemDados/ns (memoria do Node-RED).
// Nada novo e escrito no PLC: o teste confere o DB2100 (serie) e o GET snap (origem).
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { ENV_TESTE, esperaAte, get, post, sobe } = require('./ajudas.js');
const fs = require('fs');
const path = require('path');
const lerFluxo = nome => JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'nodered', 'flows', 'bt2', nome + '.json'), 'utf8'));

const REG = 'registro-ensaio-db2100-api-v1.10';
const endVar = nome => { for (const n of lerFluxo(REG)) for (const v of (n.vartable || [])) if (v.name === nome) return v.addr; throw new Error('variavel nao encontrada: ' + nome); };
const EQ = { motor: { fabricante: 'Yanmar', modelo: '2/3/4 cil', serie: '' }, alternador: { fabricante: 'Mecc Alte', modelo: '-', serie: '' }, controlador: { fabricante: 'DEIF', modelo: 'AGC150', serie: '' }, retificador: {}, rat: {}, bateria: {} };
const preen = extra => ({ campos: Object.assign({ serie: 'DTMFØ4447', versao: 'V1', data: '14.11.2026', fase: 'Trifásico', frequenciaHz: 60, tensaoV: 220, tempAmbienteC: 25, potenciaKw: 100, equipamentos: EQ }, extra) });
const NS = { valido: true, tipo: 'gerador', prefixo: 'DTMF', sequencial: 4447, alterados: ['Alternador fabricante'], avisos: [] };

describe('F7b registro v1.10: NS normalizado e origem dos dados', () => {
  let h;
  before(async () => { h = await sobe({ fluxos: [REG], env: ENV_TESTE }); await esperaAte(async () => (await get(h, '/api/ensaio/snap')).status === 200, 8000); });
  after(async () => { if (h) await h.para(); });
  const limpa = async () => assert.equal((await post(h, '/api/ensaio/snap/limpar', { confirmado: true })).status, 200);

  test('NS com O cortado chega ao PLC com zero (antes ia ? )', async () => {
    const r = await post(h, '/api/ensaio/snap/preenchimento', preen({})); assert.equal(r.status, 200, r.t);
    assert.equal(h.plc.ler(endVar('serie')), 'DTMF04447');
  });
  test('NS com * do codigo de barras, espacos e minusculas e normalizado', async () => {
    for (const s of ['*DTMFØ4447*', ' dtmf Ø4447 ', '*dtmf04447*']) {
      const r = await post(h, '/api/ensaio/snap/preenchimento', preen({ serie: s })); assert.equal(r.status, 200, r.t);
      assert.equal(h.plc.ler(endVar('serie')), 'DTMF04447', s);
    }
  });
  test('sem origemDados/ns (cliente antigo): grava como a v1.9 e snap devolve origem manual', async () => {
    await limpa();
    assert.equal((await post(h, '/api/ensaio/snap/preenchimento', preen({}))).status, 200);
    const s = await get(h, '/api/ensaio/snap'); assert.equal(s.status, 200);
    assert.equal(s.j.preenchimento.serie, 'DTMF04447'); assert.equal(s.j.preenchimento.equipamentos.motor.fabricante, 'Yanmar');
    assert.equal(s.j.origem.origemDados, 'manual'); assert.equal(s.j.origem.ns, null);
  });
  test('origemDados=ns com metadados: volta no snap, saneado', async () => {
    await limpa();
    const r = await post(h, '/api/ensaio/snap/preenchimento', preen({ origemDados: 'ns', ns: Object.assign({}, NS, { avisos: ['aviso Ø longo'.repeat(30)], extra: 'x' }) })); assert.equal(r.status, 200, r.t);
    const o = (await get(h, '/api/ensaio/snap')).j.origem;
    assert.equal(o.origemDados, 'ns'); assert.equal(o.ns.tipo, 'gerador'); assert.equal(o.ns.sequencial, 4447); assert.deepEqual(o.ns.alterados, ['Alternador fabricante']);
    assert.ok(o.ns.avisos[0].length <= 120 && !/[^\x20-\x7E]/.test(o.ns.avisos[0])); assert.equal(o.ns.extra, undefined); assert.equal(o.serie, 'DTMF04447');
  });
  test('origemDados invalido ou ns que nao e objeto: 400 e nada e gravado', async () => {
    await limpa(); const antes = h.plc.escritas.length;
    for (const extra of [{ origemDados: 'xpto' }, { origemDados: 'ns', ns: 'texto' }, { origemDados: 'ns', ns: [1, 2] }]) {
      const r = await post(h, '/api/ensaio/snap/preenchimento', preen(extra)); assert.equal(r.status, 400, JSON.stringify(extra)); assert.match(r.j.erro, /origemDados|ns/);
    }
    assert.equal(h.plc.escritas.length, antes);
  });
  test('limpar apaga a origem; snap sem preenchimento nao devolve origem', async () => {
    await post(h, '/api/ensaio/snap/preenchimento', preen({ origemDados: 'ns', ns: NS })); await limpa();
    const s = (await get(h, '/api/ensaio/snap')).j; assert.equal(s.preenchimento, null); assert.equal(s.origem, null);
  });
  test('falha de gravacao no PLC: origem nova NAO passa a valer', async () => {
    await limpa(); h.plc.falhas.escritaApos = 3; h.plc.aplicadas = 0;
    let r; try { r = await post(h, '/api/ensaio/snap/preenchimento', preen({ origemDados: 'ns', ns: NS })); } finally { h.plc.falhas.escritaApos = null; h.plc.aplicadas = 0; }
    assert.notEqual(r.status, 200); const s = (await get(h, '/api/ensaio/snap')).j; assert.equal(s.origem, null);
  });
  test('origem de outro NS e ignorada: se o NS lido do PLC mudou, origem = null', async () => {
    await limpa(); assert.equal((await post(h, '/api/ensaio/snap/preenchimento', preen({ origemDados: 'ns', ns: NS }))).status, 200);
    assert.ok((await get(h, '/api/ensaio/snap')).j.origem);
    h.plc.escrever(endVar('serie'), 'OUTRO00001');   // alguem mexeu no PLC por fora do fluxo
    assert.equal((await get(h, '/api/ensaio/snap')).j.origem, null);
  });
});
