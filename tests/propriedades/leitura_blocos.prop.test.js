'use strict';
/* =====================================================================================================================
   leitura_blocos.prop.test.js — PROVA DE EQUIVALENCIA da leitura em blocos de byte · Passo 10 (item 1) · 21/11/2026.
   PARA QUE SERVE (leigo): os fluxos de chaves passaram a ler o DB do PLC em 8 pedidos grandes (blocos de byte) em vez de 124 pedidos miudos (um bit cada) e a decodificar os bits depois.
   Este teste enche a memoria de um PLC simulado com bytes ALEATORIOS e confere que, para os 4 bancos, o que o fluxo novo entrega ao resto do programa e EXATAMENTE igual ao que o fluxo antigo entregava
   (mesmos nomes, mesmos valores true/false, mesmos arrays). Tambem confere que leitura invalida (bloco ausente, curto ou nao numerico) NAO atualiza o cache, e que toda escrita do fluxo continua possivel por nome.
   COMO RODAR: npm --prefix tests/propriedades ci && node --test tests/propriedades/*.test.js     CONTRA-PROVA: LB_DECOD_QUEBRA=1 (decodificador com o bit trocado) tem que FALHAR.
   ===================================================================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fc = require('fast-check');
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..', '..');
const { PlcSimulado } = require(path.join(RAIZ, 'tests', 'integracao', 'plc_simulado.js'));
const cfgFc = { numRuns: +process.env.FC_RUNS || 150, seed: +process.env.FC_SEED || 20261121 };
const BANCOS = [['chaves-56-api-v3.10', 'chaves-56-api-v3.11'], ['chaves-400-api-v3.9', 'chaves-400-api-v3.10'], ['chaves-550-api-v1.10', 'chaves-550-api-v1.11'], ['chaves-595-api-v1.10', 'chaves-595-api-v1.11']];
const lerFl = n => JSON.parse(fs.readFileSync(path.join(RAIZ, 'nodered', 'flows', 'bt2', n + '.json'), 'utf8'));
const epLeitura = fl => { const ep = fl.find(n => n.type === 's7 endpoint' && fl.some(m => m.type === 's7 in' && m.endpoint === n.id && /le DB\d+ \(todas\)/.test(m.name) && !/por tensao/.test(n.name))); return ep; };

function carrega(par) {
  const antigo = lerFl(par[0]), novo = lerFl(par[1]);
  const epA = antigo.find(n => n.type === 's7 endpoint' && n.vartable.some(v => /^DB\d+,X\d+\.\d$/.test(v.addr)));
  const epN = novo.find(n => n.id === epA.id), decod = novo.find(n => /_decod$/.test(n.id));
  let func = decod.func; if (process.env.LB_DECOD_QUEBRA) func = func.replace('>> bit) & 1) === 1', '>> bit) & 1) === 0');
  return { antigo, novo, epA, epN, decod, fn: vm.runInNewContext('(function (msg, flow, global, env, node) {' + func + '\n})', { Date, process, console }) };
}
function decodifica(c, payload, est = { flow: {} }) {
  const avisos = [], flow = { get: k => est.flow[k], set: (k, v) => { est.flow[k] = v; } };
  const r = c.fn({ payload, topic: 'PLC' }, flow, { get() {}, set() {} }, { get() {} }, { warn: t => avisos.push(t), log() {} });
  return { r, avisos };
}
const leTudo = (plc, vt) => Object.fromEntries(vt.map(v => [v.name, plc.ler(v.addr)]));
const pl = x => JSON.parse(JSON.stringify(x));

for (const par of BANCOS) {
  const c = carrega(par);
  test('EQUIVALENCIA ' + par[1] + ': com memoria aleatoria, blocos + decodificador = leitura bit a bit de antes (mesmos nomes e valores)', () => {
    fc.assert(fc.property(fc.uint8Array({ minLength: 1100, maxLength: 1100 }), (bytes) => {
      const plc = new PlcSimulado(); const db = +/^DB(\d+),/.exec(c.epA.vartable[0].addr)[1]; Buffer.from(bytes).copy(plc.db(db), 0);
      const antes = leTudo(plc, c.epA.vartable), blocos = leTudo(plc, c.epN.vartable);
      assert.ok(Object.keys(blocos).length <= 8, 'a leitura nova tem no maximo 8 itens');
      const { r } = decodifica(c, blocos);
      assert.ok(r, 'decodificou');
      assert.deepEqual(pl(r.payload), pl(antes), 'o payload novo tem que ser igual ao de antes');
      for (const [k, v] of Object.entries(r.payload)) if (/^(CbLigar|Ligada|Habilitada|SetupOk|HabResp|FalhaRet|ContColado)\d+$|^(Salvar|UsarKwReal|LigarBanco|SeletoraAuto|ComEt200Ok|RespEcoOk)$/.test(k)) assert.equal(typeof v, 'boolean', k + ' deve ser booleano');
      assert.equal(r.topic, 'PLC');
    }), cfgFc);
  });

  test('LEITURA INVALIDA ' + par[1] + ': bloco ausente, curto ou nao numerico NAO e repassado (o cache envelhece), com aviso no maximo 1 vez por minuto', () => {
    const plc = new PlcSimulado(); const db = +/^DB(\d+),/.exec(c.epA.vartable[0].addr)[1]; plc.db(db).fill(0x55);
    const ok = leTudo(plc, c.epN.vartable); const blocos = c.epN.vartable.filter(v => /^DB\d+,BYTE\d+\.\d+$/.test(v.addr) && /^Bits/.test(v.name));
    assert.ok(decodifica(c, ok).r);
    const est = { flow: {} };
    for (const b of blocos) {
      for (const ruim of [undefined, null, 'BAD 255', [], ok[b.name].slice(0, -1), ok[b.name].map((x, i) => (i === 0 ? 'x' : x)), ok[b.name].map((x, i) => (i === 0 ? NaN : x))]) {
        const p = Object.assign({}, ok, { [b.name]: ruim }); if (ruim === undefined) delete p[b.name];
        const { r } = decodifica(c, p, est); assert.equal(r, null, b.name + ' invalido nao pode ser repassado: ' + JSON.stringify(ruim));
      }
    }
    for (const sem of [null, undefined, 'texto', 5]) assert.equal(decodifica(c, sem, { flow: {} }).r, null);
    const e2 = { flow: {} }, a1 = decodifica(c, Object.assign({}, ok, { [blocos[0].name]: 'BAD 255' }), e2); assert.equal(a1.avisos.length, 1); assert.match(a1.avisos[0], /leitura em blocos invalida/);
    assert.equal(decodifica(c, Object.assign({}, ok, { [blocos[0].name]: 'BAD 255' }), e2).avisos.length, 0, 'dentro de 1 minuto nao repete o aviso');
  });

  test('ESCRITA ' + par[1] + ': todo nome que o fluxo escreve existe no endpoint de escrita com o MESMO endereco de antes; leitura e escrita usam o mesmo PLC e o s7 out usa o de escrita', () => {
    const { antigo, novo, epA } = c; const epw = novo.find(n => /_epw$/.test(n.id)); assert.ok(epw);
    const antes = Object.fromEntries(epA.vartable.map(v => [v.name, v.addr]));
    for (const v of epw.vartable) assert.equal(v.addr, antes[v.name], 'endereco de ' + v.name + ' mudou');
    const nomes = new Set(epw.vartable.map(v => v.name));
    const texto = novo.filter(n => n.func).map(n => n.func).join('\n'); const escritos = new Set();
    for (const m of texto.matchAll(/variable:\s*'([A-Za-z0-9_]+)'\s*(\+)?/g)) escritos.add(m[1] + (m[2] ? '*' : ''));
    const outros = new Set(novo.filter(n => n.type === 's7 endpoint' && n.id !== epw.id && n.id !== c.epN.id).flatMap(n => n.vartable.map(v => v.name)));
    for (const e of escritos) { const nome = e.replace('*', ''); if ([...outros].some(o => o.startsWith(nome))) continue; assert.ok(e.endsWith('*') ? [...nomes].some(x => x.startsWith(nome)) : nomes.has(nome), 'o fluxo escreve ' + nome + ' mas o endpoint de escrita nao tem'); }
    const sout = novo.find(n => n.type === 's7 out' && /escreve DB\d+$/.test(n.name) && !/tensao/.test(n.name) && antigo.find(a => a.id === n.id).endpoint === c.epA.id);
    assert.equal(sout.endpoint, epw.id, 'o s7 out do DB passa a usar o endpoint de escrita'); assert.equal(epw.address, c.epA.address); assert.equal(epw.rack, c.epA.rack); assert.equal(epw.slot, c.epA.slot); assert.equal(epw.address, '${PLC_IP}', 'o endereco continua vindo da variavel de ambiente');
    for (const n of antigo) if (n.id !== sout.id && n.type === 's7 out') assert.equal(novo.find(m => m.id === n.id).endpoint, n.endpoint, 'os outros s7 out nao mudam');
  });
}

test('estrutura: blocos cobrem exatamente os bits de antes (sem repetir nem faltar) e os itens que nao eram bit ficam como estavam', () => {
  for (const par of BANCOS) {
    const c = carrega(par);
    const bitsAntes = c.epA.vartable.filter(v => /^DB\d+,X\d+\.\d$/.test(v.addr)).map(v => v.name).sort();
    const blocos = /const BLOCOS = (\[.*?\]);\s*\/\//s.exec(c.decod.func)[1]; const lista = JSON.parse(blocos); const nomes = lista.flatMap(b => b.bits.map(x => x[0])).sort();
    assert.deepEqual(nomes, bitsAntes, par[1] + ': os bits decodificados tem que ser exatamente os de antes');
    const naoBitAntes = c.epA.vartable.filter(v => !/^DB\d+,X\d+\.\d$/.test(v.addr)), naoBitNovo = c.epN.vartable.filter(v => !/^Bits/.test(v.name));
    assert.deepEqual(naoBitNovo, naoBitAntes, par[1] + ': itens que nao eram bit ficam iguais');
    assert.equal(c.epN.vartable.length, 2 + naoBitAntes.length); assert.equal(c.epN.cycletime, c.epA.cycletime, 'ciclo de leitura igual ao de antes');
  }
});
