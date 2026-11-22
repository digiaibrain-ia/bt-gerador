'use strict';
/* =====================================================================================================================
   capacidade_c2.prop.test.js — TESTE DE PROPRIEDADES do no "limite de capacidade e degrau (C2)" do Node-RED · Passo 7b · 19/11/2026.
   PARA QUE SERVE (leigo): este no do fluxo de chaves e o que RECUSA (HTTP 409) um comando de ligar chave que passaria do limite do gerador ou do degrau. Aqui o codigo REAL do no roda
   (sem Node-RED) contra milhares de situacoes inventadas e e comparado com uma regra escrita ao lado, de forma independente: so recusa em modo "recusar", so quando o kW a 100 % e
   conhecido (arquivo ou medidor recente), desligar NUNCA e recusado, a soma e entre bancos, e qualquer erro dentro do no deixa o comando seguir (fail-open).
   COMO RODAR: npm --prefix tests/propriedades ci && node --test tests/propriedades/*.test.js        CONTRA-PROVA/MUTACAO: CAP_C2_ARQ=<arquivo gerado por tests/mutacao/gera_alvos.js>.
   ===================================================================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fc = require('fast-check');
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..', '..');
const cfgFc = { numRuns: +process.env.FC_RUNS || 400, seed: +process.env.FC_SEED || 20261119 };
const FONTE = process.env.CAP_C2_ARQ ? fs.readFileSync(path.resolve(RAIZ, process.env.CAP_C2_ARQ), 'utf8')      // alvo da mutacao: arquivo (function (msg, flow, global, env, node) { corpo })
  : '(function (msg, flow, global, env, node) {' + JSON.parse(fs.readFileSync(path.join(RAIZ, 'nodered/flows/bt2/chaves-56-api-v3.9.json'), 'utf8')).find(n => n.id === 'chv56_c2_limite').func + '\n})';
const T0 = 1_800_000_000_000;
const ESPELHO = { '56': { chaves_kw: [5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 3] }, '400': { chaves_kw: [5, 5, 10, 10, 10, 10, 50, 50, 50, 50, 50, 50, 50] } };

function roda(c) {                                 // executa o no REAL com contexto de mentira; devolve { saida, msg, dados, avisos }. Extras: c.dados (reaproveita o estado da chamada anterior), c.agora, c.globalExtra, c.logsInit, c.semLogs, c.quebra
  const dados = c.dados || { flow: { chv56_live: c.live, chv56_logs: c.logsInit || [], chv56_c2_deg: c.hist }, global: Object.assign({ bt2_capacidade: c.cfg, bt2_kw100_cliente: c.cli, bt2_kw_400: c.outro }, c.globalExtra) };
  if (c.dados) dados.flow.chv56_live = c.live;                                // reaproveitar o estado nao pode manter a leitura ao vivo antiga
  if (c.semLogs) delete dados.flow.chv56_logs;
  const ctx = k => ({ get: n => { if (c.quebra) throw new Error('boom'); return dados[k][n]; }, set: (n, v) => { dados[k][n] = v; } }), avisos = [];
  const agora = c.agora === undefined ? T0 : c.agora;
  const Fake = class extends Date { static now() { return agora; } };
  const fn = vm.runInNewContext(FONTE, { Date: Fake, process, console });
  const msg = { payload: { indice: c.indice, ligar: c.ligar } };
  const saida = fn(msg, ctx('flow'), ctx('global'), { get() {} }, { warn: t => avisos.push(t), log() {} });
  return { saida, msg, dados, avisos };
}

const kwDe = (cfgB, nominal, i) => (typeof nominal[i - 1] === 'number' && nominal[i - 1] > 0) ? nominal[i - 1] : cfgB.chaves_kw[i - 1];
function oraculo(c) {                              // a REGRA, escrita de forma independente do no
  if (!c.ligar) return { recusa: false };
  const cfgB = c.cfg.bancos['56'], nom = c.live.Nominal, ja = c.live['Ligada' + c.indice] === true || c.live['CbLigar' + c.indice] === true;
  const kwNova = ja ? 0 : kwDe(cfgB, nom, c.indice);
  let total = 0; for (let j = 1; j <= 13; j++) if (c.live['Ligada' + j] === true || c.live['CbLigar' + j] === true || j === c.indice) total += kwDe(cfgB, nom, j);
  if (c.outro && T0 - c.outro.ts <= 5000) total += c.outro.kw;
  total = Math.round(total * 1000) / 1000;
  const g = c.cfg.gerador; let kw100 = null, origem = null;
  if (g.kw100 > 0) { kw100 = g.kw100; origem = 'arquivo'; } else if (c.cli && c.cli.kw100 > 0 && T0 - c.cli.ts <= (g.validade_s || 180) * 1000) { kw100 = c.cli.kw100; origem = 'medidor'; }
  const lim = kw100 ? Math.round(kw100 * c.cfg.pctLim) / 100 : null;
  let codigo = null;
  if (lim !== null && total > lim + 1e-9) codigo = 'LIMITE_EXCEDIDO';
  const jan = (c.cfg.degrau.janela_s || 10) * 1000, soma = Math.round((c.hist.filter(e => T0 - e.ts <= jan).reduce((a, e) => a + e.kw, 0) + kwNova) * 1000) / 1000;
  if (!codigo && c.cfg.degrau.max_kw > 0 && soma > c.cfg.degrau.max_kw + 1e-9) codigo = 'DEGRAU_EXCEDIDO';
  return { recusa: c.cfg.modo === 'recusar' && codigo !== null, codigo, total, lim, origem, kwNova };
}

const cenario = fc.record({
  modo: fc.constantFrom('registrar', 'recusar', undefined), pct: fc.constantFrom(100, 110, 112), kw100: fc.constantFrom(null, 20, 50, 300), validade: fc.constantFrom(10, 180),
  degMax: fc.constantFrom(null, 5, 12, 40), janela: fc.constantFrom(10, 60), ligar: fc.boolean(), indice: fc.integer({ min: 1, max: 13 }),
  ligadas: fc.array(fc.boolean(), { minLength: 13, maxLength: 13 }), cbs: fc.array(fc.boolean(), { minLength: 13, maxLength: 13 }),
  nominal: fc.constantFrom([], [7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 6, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [[5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 3, 0, 0, 0]]),
  cli: fc.constantFrom(null, { kw100: 30, idade: 1000 }, { kw100: 30, idade: 20000 }, { kw100: 100, idade: 150000 }, { kw100: 0, idade: 10 }, { kw100: 5, idade: 10000 }),
  outro: fc.constantFrom(null, { kw: 50, idade: 1000 }, { kw: 50, idade: 5000 }, { kw: 50, idade: 5001 }, { kw: 100, idade: 100000 }),
  hist: fc.array(fc.record({ idade: fc.constantFrom(0, 3000, 9999, 10000, 10001, 30000, 59999, 60000, 60001), kw: fc.constantFrom(2, 5, 10) }), { maxLength: 4 }),
});
const monta = s => ({ ligar: s.ligar, indice: s.indice, live: Object.assign({ Nominal: s.nominal }, ...s.ligadas.map((v, i) => ({ ['Ligada' + (i + 1)]: v })), ...s.cbs.map((v, i) => ({ ['CbLigar' + (i + 1)]: v }))),
  cfg: { modo: s.modo, pctLim: s.pct, gerador: { kw100: s.kw100, validade_s: s.validade, kw100_max: 1000 }, degrau: { max_kw: s.degMax, janela_s: s.janela }, bancos: ESPELHO },
  cli: s.cli ? { kw100: s.cli.kw100, modelo: 'm', ts: T0 - s.cli.idade } : undefined, outro: s.outro ? { kw: s.outro.kw, ts: T0 - s.outro.idade } : undefined, hist: s.hist.map(h => ({ ts: T0 - h.idade, kw: h.kw })) });

test('o no decide COMO a regra escrita ao lado: recusa so em modo "recusar" e so com limite/degrau excedido; senao segue (saida 1); a carga e a origem do kW batem', () => {
  fc.assert(fc.property(cenario, s => {
    const c = monta(s), o = oraculo(c), r = roda(c);
    assert.equal(Array.isArray(r.saida) && r.saida.length, 2);
    if (o.recusa) {
      assert.equal(r.saida[0], null); assert.equal(r.saida[1], r.msg); assert.equal(r.msg.statusCode, 409); assert.equal(r.msg.payload.ok, false); assert.equal(r.msg.payload.codigo, o.codigo);
      assert.equal(r.msg.payload.totalKw, o.total); assert.equal(r.msg.payload.limiteKw, o.lim); assert.equal(r.msg.payload.origemKw100, o.origem); assert.equal(r.msg.headers['Content-Type'], 'application/json'); assert.match(r.msg.payload.erro, /^comando recusado: /);
      assert.equal(r.dados.flow.chv56_c2_deg.length, c.hist.length, 'comando recusado nao entra no historico do degrau');
    } else {
      assert.equal(r.saida[1], null); assert.equal(r.saida[0], r.msg); assert.equal(r.msg.statusCode, undefined, 'quem segue nao recebe status');
      if (c.ligar && o.kwNova > 0) { const h = r.dados.flow.chv56_c2_deg; assert.equal(h[h.length - 1].kw, o.kwNova); assert.equal(h[h.length - 1].ts, T0); }
    }
  }), cfgFc);
});

test('SEGURANCA: desligar NUNCA e recusado e nao mexe em nada; sem kW a 100 % conhecido o LIMITE nunca recusa; modo registrar NUNCA recusa', () => {
  fc.assert(fc.property(cenario, s => {
    const dsl = monta({ ...s, ligar: false }), r = roda(dsl); assert.equal(r.saida[0], r.msg); assert.equal(r.saida[1], null); assert.equal(r.dados.flow.chv56_logs.length, 0); assert.deepEqual(r.dados.flow.chv56_c2_deg, dsl.hist);
    const reg = roda(monta({ ...s, modo: 'registrar' })); assert.equal(reg.saida[1], null, 'registrar nunca recusa');
    const semKw = monta({ ...s, kw100: null, cli: null, degMax: null, modo: 'recusar' }); assert.equal(roda(semKw).saida[1], null, 'sem kW a 100 % e sem degrau nunca recusa');
  }), cfgFc);
});

test('FAIL-OPEN: qualquer erro dentro do no deixa o comando SEGUIR (saida 1) e so avisa no log do no', () => {
  const base = monta({ modo: 'recusar', pct: 110, kw100: 20, degMax: null, janela: 10, ligar: true, indice: 5, ligadas: Array(13).fill(true), cbs: Array(13).fill(false), nominal: [], cli: null, outro: null, hist: [] });
  const rc = roda(base); assert.equal(rc.saida[1], rc.msg, 'controle: com tudo ligado recusa');
  for (const quebra of [{ cfg: { ...base.cfg, bancos: null } }, { cfg: { ...base.cfg, gerador: null, degrau: null, bancos: null } }, { live: null, cfg: { ...base.cfg, bancos: { '56': null } } }]) {
    const c = { ...base, ...quebra }; let r; assert.doesNotThrow(() => { r = roda(c); }); assert.equal(r.saida[1], null, 'erro => segue'); assert.equal(r.saida[0], r.msg);
  }
  const lixo = { ...base, cfg: { ...base.cfg, bancos: { '56': { chaves_kw: 'abc' } } } }; const r = roda(lixo); assert.equal(r.saida[1] === null || r.saida[1] === r.msg, true);
});

test('exemplos exatos: limite no valor exato libera, 0,001 kW acima recusa; kW do arquivo vale mais que o do medidor; medidor vence a validade; degrau fecha a janela; soma entre bancos so ate 5 s', () => {
  const E = (mud, extra) => { const base = { ligar: true, indice: 1, live: { Nominal: [] }, cfg: { modo: 'recusar', pctLim: 110, gerador: { kw100: null, validade_s: 180, kw100_max: 1000 }, degrau: { max_kw: null, janela_s: 10 }, bancos: ESPELHO }, cli: undefined, outro: undefined, hist: [] }; const c = { ...base, ...extra }; c.cfg = { ...base.cfg, ...(mud || {}) }; return roda(c); };
  const lig = n => Object.fromEntries(Array.from({ length: n }, (_, i) => ['Ligada' + (i + 2), true]));          // chaves 2..n+1 ja ligadas (5 kW cada ate a 5a)
  // limite = 20 * 110 % = 22 kW; ligar a chave 1 com 4 chaves ja ligadas (4 x 5 = 20) -> 25 kW > 22 recusa; com 3 -> 20 kW libera
  assert.equal(E({ gerador: { kw100: 20, validade_s: 180 } }, { live: { Nominal: [], ...lig(4) } }).saida[1] !== null, true);
  assert.equal(E({ gerador: { kw100: 20, validade_s: 180 } }, { live: { Nominal: [], ...lig(3) } }).saida[1], null);
  const exato = E({ gerador: { kw100: 20, validade_s: 180 }, pctLim: 100 }, { live: { Nominal: [], ...lig(3) } }); assert.equal(exato.saida[1], null, '20 kW com limite 20 libera');
  assert.equal(E({ gerador: { kw100: 19.99, validade_s: 180 }, pctLim: 100 }, { live: { Nominal: [], ...lig(3) } }).saida[1] !== null, true, '20 kW com limite 19,99 recusa');
  assert.equal(E({ gerador: { kw100: 20, validade_s: 180 } }, { live: { Nominal: [], ...lig(4) }, cli: { kw100: 900, ts: T0 } }).saida[1] !== null, true, 'o arquivo vale mais que o medidor');
  assert.equal(E(null, { live: { Nominal: [], ...lig(4) }, cli: { kw100: 20, ts: T0 - 179_000 } }).saida[1] !== null, true, 'medidor dentro da validade vale');
  assert.equal(E(null, { live: { Nominal: [], ...lig(4) }, cli: { kw100: 20, ts: T0 - 181_000 } }).saida[1], null, 'medidor vencido: nao avalia');
  assert.equal(E(null, { live: { Nominal: [], ...lig(4) }, cli: { kw100: 20, ts: T0 - 180_000 } }).saida[1] !== null, true, 'exatamente na validade ainda vale');
  const deg = ts => E({ gerador: { kw100: null }, degrau: { max_kw: 12, janela_s: 10 } }, { hist: [{ ts: T0 - ts, kw: 10 }], indice: 1 });
  assert.equal(deg(9_000).saida[1] !== null, true, '10 kW na janela + 5 = 15 > 12'); assert.equal(deg(10_000).saida[1] !== null, true, 'na borda da janela ainda conta'); assert.equal(deg(10_001).saida[1], null, 'fora da janela nao conta');
  assert.equal(E({ gerador: { kw100: 60, validade_s: 180 }, pctLim: 100 }, { indice: 1, outro: { kw: 56, ts: T0 - 5_000 } }).saida[1] !== null, true, 'outro banco (56 kW, 5 s) + 5 = 61 > 60'); assert.equal(E({ gerador: { kw100: 60, validade_s: 180 }, pctLim: 100 }, { indice: 1, outro: { kw: 56, ts: T0 - 5_001 } }).saida[1], null, 'leitura do outro banco com mais de 5 s nao entra');
  const nominal = E({ gerador: { kw100: 20, validade_s: 180 }, pctLim: 100 }, { indice: 1, live: { Nominal: [21], ...lig(0) } }); assert.equal(nominal.saida[1] !== null && nominal.msg.payload.totalKw, 21, 'usa o kW do PLC (21) e nao o espelho (5)');
  const ja = E({ gerador: { kw100: 5, validade_s: 180 }, pctLim: 100 }, { indice: 1, live: { Nominal: [], Ligada1: true } }); assert.equal(ja.saida[1], null, 'chave ja ligada nao soma de novo (5 kW cabe em 5)');
});

/* ---------------------------------------------------------------------------------------------------------------------
   Testes dirigidos (Passo 7b): mensagens de log/aviso, limitacao de repeticao, fronteiras e valores ausentes/estranhos.
   --------------------------------------------------------------------------------------------------------------------- */
const pl = x => JSON.parse(JSON.stringify(x));                                       // objetos criados dentro do vm tem outro prototipo: compara por JSON
const BASE = (mud, extra) => { const c = { ligar: true, indice: 1, live: { Nominal: [] }, cfg: { modo: 'recusar', pctLim: 110, gerador: { kw100: 20, validade_s: 180, kw100_max: 1000 }, degrau: { max_kw: null, janela_s: 10 }, bancos: ESPELHO }, cli: undefined, outro: undefined, hist: [], ...extra }; c.cfg = { ...c.cfg, ...(mud || {}) }; return c; };
const cheio = n => Object.fromEntries(Array.from({ length: n }, (_, i) => ['Ligada' + (i + 2), true]));      // chaves 2..n+1 ligadas

test('LIMITE recusado: grava UM registro no log do no com o texto completo, avisa no no, e repete no maximo a cada 2 s', () => {
  const c = BASE(null, { live: { Nominal: [], ...cheio(4) } });                       // 4 x 5 + 5 = 25 kW > 22 kW
  const r1 = roda(c);
  const dado = 'chave 1: total comandado 25 kW > limite 22 kW (kw100 20 x 110 %, origem arquivo)';
  assert.equal(r1.saida[1], r1.msg); assert.equal(r1.msg.payload.erro, 'comando recusado: ' + dado);
  const logs = r1.dados.flow.chv56_logs; assert.equal(logs.length, 1);
  assert.deepEqual({ ...pl(logs[0]), t: typeof logs[0].t }, { t: 'string', rota: 'LIMITE', dado, status: 0, ok: false, ms: 0, erro: 'LIMITE_EXCEDIDO (C2: comando RECUSADO, nao foi enviado ao PLC)' });
  assert.ok(!isNaN(Date.parse(logs[0].t)) && new Date(logs[0].t).toISOString() === logs[0].t, 't e uma data ISO');
  assert.deepEqual(r1.avisos, ['capacidade (C2): RECUSADO banco 56 - ' + dado]); assert.equal(r1.dados.flow.chv56_c1_recLIMITE_EXCEDIDO, T0);
  const r2 = roda({ ...c, dados: r1.dados, agora: T0 + 1999 }); assert.equal(r2.saida[1], r2.msg, 'continua recusando'); assert.equal(r2.dados.flow.chv56_logs.length, 1, 'dentro de 2 s nao repete o log'); assert.equal(r2.avisos.length, 0);
  const r3 = roda({ ...c, dados: r1.dados, agora: T0 + 2000 }); assert.equal(r3.dados.flow.chv56_logs.length, 2, 'com 2 s volta a registrar'); assert.equal(r3.avisos.length, 1);
});

test('modo registrar: so anota (o comando segue, sem status), no maximo a cada 10 s, com o texto "so registra"', () => {
  const c = BASE({ modo: 'registrar' }, { live: { Nominal: [], ...cheio(4) } });
  const r1 = roda(c); assert.equal(r1.saida[0], r1.msg); assert.equal(r1.saida[1], null); assert.equal(r1.msg.statusCode, undefined); assert.equal(r1.msg.payload.ok, undefined);
  const dado = 'chave 1: total comandado 25 kW > limite 22 kW (kw100 20 x 110 %, origem arquivo)', l = r1.dados.flow.chv56_logs;
  assert.equal(l.length, 1); assert.equal(l[0].rota, 'LIMITE'); assert.equal(l[0].dado, dado); assert.equal(l[0].erro, 'LIMITE_EXCEDIDO (so registra; o comando NAO foi recusado)'); assert.deepEqual(r1.avisos, ['capacidade (C2): LIMITE_EXCEDIDO banco 56 (so registra) - ' + dado]);
  assert.equal(r1.dados.flow.chv56_c1_excLIMITE_EXCEDIDO, T0);
  assert.equal(roda({ ...c, dados: r1.dados, agora: T0 + 9999 }).dados.flow.chv56_logs.length, 1); assert.equal(roda({ ...c, dados: r1.dados, agora: T0 + 10000 }).dados.flow.chv56_logs.length, 2);
});

test('DEGRAU: texto, fronteira exata (igual ao maximo libera), janela padrao 10 s e codigos de repeticao independentes do limite', () => {
  const deg = (max, hist, janela) => roda(BASE({ gerador: { kw100: null }, degrau: { max_kw: max, janela_s: janela } }, { hist }));
  const r = deg(12, [{ ts: T0 - 1000, kw: 10 }], 60); assert.equal(r.msg.statusCode, 409); assert.equal(r.msg.payload.codigo, 'DEGRAU_EXCEDIDO'); assert.equal(r.msg.payload.erro, 'comando recusado: chave 1: 15 kW novos em 60 s > degrau maximo 12 kW');
  assert.equal(r.msg.payload.limiteKw, null); assert.equal(r.msg.payload.origemKw100, null); assert.equal(r.dados.flow.chv56_logs[0].erro, 'DEGRAU_EXCEDIDO (C2: comando RECUSADO, nao foi enviado ao PLC)'); assert.equal(r.dados.flow.chv56_c1_recDEGRAU_EXCEDIDO, T0);
  assert.equal(deg(15, [{ ts: T0 - 1000, kw: 10 }], 10).saida[1], null, 'soma 15 com maximo 15 libera (nao e >=)'); assert.notEqual(deg(14.99, [{ ts: T0 - 1000, kw: 10 }], 10).saida[1], null);
  assert.notEqual(deg(12, [{ ts: T0 - 10000, kw: 10 }], undefined).saida[1], null, 'sem janela configurada vale 10 s'); assert.equal(deg(12, [{ ts: T0 - 10001, kw: 10 }], undefined).saida[1], null);
  assert.equal(deg(0, [{ ts: T0, kw: 100 }], 10).saida[1], null, 'max_kw 0 desliga o degrau'); assert.equal(deg(-5, [{ ts: T0, kw: 100 }], 10).saida[1], null); assert.equal(deg(null, [{ ts: T0, kw: 100 }], 10).saida[1], null);
  assert.equal(roda(BASE({ degrau: undefined }, { live: { Nominal: [] } })).saida[1], null, 'sem bloco degrau nao quebra e nao recusa');
  assert.equal(roda(BASE({ gerador: { kw100: 20 }, degrau: { max_kw: 1, janela_s: 10 } }, { live: { Nominal: [], ...cheio(4) } })).msg.payload.codigo, 'LIMITE_EXCEDIDO', 'quando os dois estouram, o motivo e o LIMITE');
});

test('historico do degrau: so comandos que seguiram entram; eventos fora da janela saem; guarda no maximo 200; chave ja ligada ou 0 kW nao entra', () => {
  const r = roda(BASE({ degrau: { max_kw: 100, janela_s: 10 } }, { hist: [{ ts: T0 - 30000, kw: 5 }, { ts: T0 - 2000, kw: 2 }] }));
  assert.deepEqual(pl(r.dados.flow.chv56_c2_deg), [{ ts: T0 - 2000, kw: 2 }, { ts: T0, kw: 5 }], 'o antigo saiu, o novo entrou no fim');
  const muitos = Array.from({ length: 205 }, (_, i) => ({ ts: T0 - 5000, kw: 0.001 * (i + 1) })), r2 = roda(BASE({ degrau: { max_kw: 100000, janela_s: 10 } }, { hist: muitos }));
  assert.equal(r2.dados.flow.chv56_c2_deg.length, 200); assert.equal(r2.dados.flow.chv56_c2_deg[199].ts, T0); assert.equal(r2.dados.flow.chv56_c2_deg[0].kw, muitos[6].kw);
  const ja = BASE(null, { hist: [{ ts: T0 - 9000, kw: 3 }], live: { Nominal: [], Ligada1: true } }), r3 = roda(ja); assert.equal(r3.dados.flow.chv56_c2_deg, ja.hist, 'ja ligada: nao registra nada novo');
  const cb = BASE(null, { hist: [], live: { Nominal: [], CbLigar1: true } }); assert.deepEqual(pl(roda(cb).dados.flow.chv56_c2_deg), [], 'comando em andamento (CbLigar) tambem conta como ja ligada');
  const zero = BASE({ bancos: { '56': { chaves_kw: [0, 5] } } }, { hist: [] }); assert.deepEqual(pl(roda(zero).dados.flow.chv56_c2_deg), [], 'chave de 0 kW nao entra no historico');
});

test('kW de cada chave: PLC (so numero finito > 0, aceita matriz [[...]]) > espelho (so numero finito) > 0', () => {
  const kw = (live, bancos) => { const r = roda(BASE({ gerador: { kw100: 1000 }, bancos: bancos || ESPELHO }, { live })); return r.dados.flow.chv56_c2_deg.length ? r.dados.flow.chv56_c2_deg[0].kw : 0; };
  assert.equal(kw({ Nominal: [21] }), 21); assert.equal(kw({ Nominal: [[21]] }), 21, 'matriz: usa a primeira linha'); assert.equal(kw({ Nominal: [0] }), 5); assert.equal(kw({ Nominal: [-3] }), 5); assert.equal(kw({ Nominal: ['7'] }), 5, 'texto nao vale');
  assert.equal(kw({ Nominal: [Infinity] }), 5); assert.equal(kw({ Nominal: [NaN] }), 5); assert.equal(kw({ Nominal: 'abc' }), 5); assert.equal(kw({ Nominal: undefined }), 5); assert.equal(kw({ Nominal: { 0: 9 } }), 5);
  assert.equal(kw({ Nominal: [] }, { '56': { chaves_kw: ['5'] } }), 0, 'espelho em texto vale 0'); assert.equal(kw({ Nominal: [] }, { '56': { chaves_kw: [Infinity] } }), 0); assert.equal(kw({ Nominal: [] }, { '56': {} }), 0); assert.equal(kw({ Nominal: [] }, {}), 0);
  assert.equal(roda(BASE({ gerador: { kw100: 20 }, pctLim: 100 }, { live: { Nominal: [], ...cheio(3) } })).saida[1], null, '3 x 5 + 5 = 20 libera com limite 20');
  assert.notEqual(roda(BASE({ gerador: { kw100: 20 }, pctLim: 100 }, { live: { Nominal: [21], ...cheio(0) } })).saida[1], null, 'kW do PLC (21) passa do limite 20');
});

test('outros bancos: so entram leituras com ate 5 s e kW finito; o proprio banco 56 nao e lido de volta', () => {
  const C = (extra) => roda(BASE({ gerador: { kw100: 20 }, pctLim: 100, bancos: { ...ESPELHO, '550': { chaves_kw: [1] } } }, { live: { Nominal: [], ...cheio(3) }, ...extra }));
  assert.equal(C({}).saida[1], null, 'sem outros: 20 kW libera');
  assert.notEqual(C({ outro: { kw: 1, ts: T0 } }).saida[1], null, 'outro banco soma'); assert.notEqual(C({ globalExtra: { bt2_kw_550: { kw: 1, ts: T0 - 5000 } } }).saida[1], null, 'qualquer banco do arquivo (nao so o 400)');
  assert.equal(C({ globalExtra: { bt2_kw_56: { kw: 99, ts: T0 } } }).saida[1], null, 'o proprio 56 e ignorado'); assert.equal(C({ outro: { kw: Infinity, ts: T0 } }).saida[1], null); assert.equal(C({ outro: { kw: NaN, ts: T0 } }).saida[1], null);
  assert.equal(C({ outro: { kw: 50, ts: T0 - 5001 } }).saida[1], null);
});

test('kW a 100 % do medidor: validade padrao 180 s, valor invalido (0, negativo) nao vale; limite padrao 110 %', () => {
  const M = (cli, mud) => roda(BASE({ gerador: { kw100: null, ...(mud || {}) } }, { live: { Nominal: [], ...cheio(4) }, cli }));            // 25 kW comandados
  assert.notEqual(M({ kw100: 20, ts: T0 - 100_000 }, { validade_s: undefined }).saida[1], null, 'sem validade configurada vale 180 s'); assert.equal(M({ kw100: 20, ts: T0 - 181_000 }, { validade_s: undefined }).saida[1], null);
  assert.equal(M({ kw100: 20, ts: T0 - 11_000 }, { validade_s: 10 }).saida[1], null, 'validade 10 s: 11 s vencido'); assert.notEqual(M({ kw100: 20, ts: T0 - 9_000 }, { validade_s: 10 }).saida[1], null);
  assert.equal(M({ kw100: 0, ts: T0 }).saida[1], null); assert.equal(M({ kw100: -20, ts: T0 }).saida[1], null);
  const r = roda(BASE({ pctLim: undefined, gerador: { kw100: 20 } }, { live: { Nominal: [], ...cheio(3), Ligada1: true } }));
  assert.equal(r.saida[1], null, '20 kW <= 22 (110 % padrao)'); assert.notEqual(roda(BASE({ pctLim: undefined, gerador: { kw100: 20 } }, { live: { Nominal: [], ...cheio(4) } })).saida[1], null, '25 > 22');
  assert.equal(roda(BASE({ gerador: { kw100: 20 }, pctLim: 125 }, { live: { Nominal: [], ...cheio(4) } })).saida[1], null, '25 <= 25 com 125 %');
  assert.equal(roda(BASE({ gerador: { kw100: '20' } }, { live: { Nominal: [], ...cheio(4) } })).msg.payload.limiteKw, 22, 'kw100 em texto e convertido');
  assert.equal(roda(BASE({ gerador: undefined }, { live: { Nominal: [], ...cheio(4) } })).saida[1], null, 'sem bloco gerador: nao avalia');
});

test('aviso "kW desconhecido": uma vez por hora, com o total comandado; nao aparece quando o kW a 100 % e conhecido', () => {
  const c = BASE({ gerador: { kw100: null } }, { live: { Nominal: [], Ligada2: true } });
  const r1 = roda(c); assert.deepEqual(r1.avisos, ['capacidade: kw100 do gerador desconhecido (arquivo e medidor) - limite NAO avaliado, nada e recusado. Total comandado agora: 10 kW']); assert.equal(r1.dados.flow.chv56_c1_semkw, T0);
  assert.equal(roda({ ...c, dados: r1.dados, agora: T0 + 3_599_999 }).avisos.length, 0); assert.equal(roda({ ...c, dados: r1.dados, agora: T0 + 3_600_000 }).avisos.length, 1);
  assert.equal(roda(BASE(null, { live: { Nominal: [] } })).avisos.length, 0);
});

test('divergencia PLC x espelho: so registra (NAO recusa), uma vez por chave a cada 10 min, com tolerancia de 0,05 kW', () => {
  const D = (nominal, extra) => roda(BASE({ gerador: { kw100: 1000 } }, { live: { Nominal: nominal }, ...extra }));
  const r = D([7]); assert.equal(r.saida[0], r.msg); const l = r.dados.flow.chv56_logs; assert.equal(l.length, 1);
  assert.deepEqual({ ...pl(l[0]), t: 0 }, { t: 0, rota: 'CAPACIDADE', dado: 'chave 1: PLC informa 7 kW, espelho tem 5 kW', status: 0, ok: false, ms: 0, erro: 'NOMINAL_DIVERGE (so registra)' }); assert.equal(r.dados.flow.chv56_c1_div1, T0);
  assert.equal(D([5.04]).dados.flow.chv56_logs.length, 0, 'dentro da tolerancia'); assert.equal(D([5.06]).dados.flow.chv56_logs.length, 1); assert.equal(D([4.94]).dados.flow.chv56_logs.length, 1);
  assert.equal(D([0]).dados.flow.chv56_logs.length, 0); assert.equal(D(['7']).dados.flow.chv56_logs.length, 0); assert.equal(D([[7]]).dados.flow.chv56_logs.length, 1, 'matriz tambem e conferida');
  assert.equal(D([5, 5, 9]).dados.flow.chv56_logs.length, 0, 'compara so a chave comandada, nao a vizinha');
  const c = BASE({ gerador: { kw100: 1000 } }, { live: { Nominal: [7] } });
  assert.equal(roda({ ...c, dados: r.dados, agora: T0 + 599_999 }).dados.flow.chv56_logs.length, 1); assert.equal(roda({ ...c, dados: r.dados, agora: T0 + 600_000 }).dados.flow.chv56_logs.length, 2);
  const c2 = BASE({ gerador: { kw100: 1000 } }, { indice: 2, live: { Nominal: [0, 9] } }); const r5 = roda({ ...c2, dados: r.dados, agora: T0 + 1 }), l5 = r5.dados.flow.chv56_logs; assert.equal(l5[l5.length - 1].dado, 'chave 2: PLC informa 9 kW, espelho tem 5 kW', 'outra chave tem seu proprio limite de repeticao'); assert.equal(r5.dados.flow.chv56_c1_div2, T0 + 1);
  assert.equal(D([7], { cfg: { ...BASE().cfg, gerador: { kw100: 1000 }, bancos: { '56': { chaves_kw: ['x'] } } } }).dados.flow.chv56_logs.length, 0, 'espelho sem numero: nao ha com o que comparar');
});

test('log do no: comeca vazio se nao existe, guarda no maximo 1000 (descarta o mais antigo, nunca antes)', () => {
  const rec = { live: { Nominal: [], ...cheio(4) } };
  assert.equal(roda(BASE(null, { ...rec, semLogs: true })).dados.flow.chv56_logs.length, 1);
  const m = n => Array.from({ length: n }, (_, i) => ({ rota: 'x' + i }));
  const a = roda(BASE(null, { ...rec, logsInit: m(999) })).dados.flow.chv56_logs; assert.equal(a.length, 1000); assert.equal(a[0].rota, 'x0'); assert.equal(a[999].rota, 'LIMITE');
  const b = roda(BASE(null, { ...rec, logsInit: m(1000) })).dados.flow.chv56_logs; assert.equal(b.length, 1000); assert.equal(b[0].rota, 'x1'); assert.equal(b[999].rota, 'LIMITE');
});

test('sem configuracao no contexto: usa o espelho PADRAO embutido (modo registrar, sem kW a 100 %) e nunca recusa', () => {
  const r = roda(BASE(null, { cfg: undefined, live: { Nominal: [] } }));
  assert.equal(r.saida[0], r.msg); assert.deepEqual(r.avisos, ['capacidade: kw100 do gerador desconhecido (arquivo e medidor) - limite NAO avaliado, nada e recusado. Total comandado agora: 0 kW']);
});

test('FAIL-OPEN: o erro vira UM aviso com o motivo e o comando segue; payload sem "ligar === true" nem e avaliado', () => {
  const r = roda({ ...BASE(null, { live: { Nominal: [], ...cheio(4) } }), quebra: true });
  assert.equal(r.saida[0], r.msg); assert.equal(r.saida[1], null); assert.deepEqual(r.avisos, ['capacidade (C2): erro ao avaliar (o comando segue normalmente): boom']);
  for (const lig of ['true', 1, undefined, null]) { const q = roda(BASE(null, { ligar: lig, live: { Nominal: [], ...cheio(4) } })); assert.equal(q.saida[0], q.msg); assert.equal(q.dados.flow.chv56_logs.length, 0); }
});
