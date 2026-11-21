'use strict';
/* =====================================================================================================================
   capacidade_reserva.prop.test.js — TESTE DE PROPRIEDADES do no "reserva de capacidade na saida da fila (C2)" e do cache que publica o kW · Passo 9 · 20/11/2026.
   PARA QUE SERVE (leigo): este no e o que impede que DOIS comandos quase simultaneos de ligar chave estourem o limite do gerador. Aqui o codigo REAL do no roda (sem Node-RED) com
   milhares de sequencias inventadas de comandos e a propriedade principal e conferida: com o PLC "congelado" (ainda sem mostrar nenhuma chave nova), a carga aceita NUNCA passa do limite.
   Tambem: desligar nunca e recusado; modo registrar nunca recusa nem reserva; a reserva refletida no PLC nao conta duas vezes; a reserva vence em 5 s; o kW publicado inclui a reserva; erro => segue.
   COMO RODAR: npm --prefix tests/propriedades ci && node --test tests/propriedades/*.test.js     CONTRA-PROVA/MUTACAO: CAP_RESERVA_ARQ=<arquivo gerado por tests/mutacao/gera_alvos.js>.
   ===================================================================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fc = require('fast-check');
const fs = require('fs'), path = require('path'), vm = require('vm');
const RAIZ = path.join(__dirname, '..', '..');
const cfgFc = { numRuns: +process.env.FC_RUNS || 300, seed: +process.env.FC_SEED || 20261120 };
const FLUXO = JSON.parse(fs.readFileSync(path.join(RAIZ, 'nodered/flows/bt2/chaves-56-api-v3.10.json'), 'utf8'));
const FONTE = process.env.CAP_RESERVA_ARQ ? fs.readFileSync(path.resolve(RAIZ, process.env.CAP_RESERVA_ARQ), 'utf8')      // alvo da mutacao
  : '(function (msg, flow, global, env, node) {' + FLUXO.find(n => n.id === 'chv56_c2_reserva').func + '\n})';
const FONTE_CACHE = '(function (msg, flow, global, env, node) {' + FLUXO.find(n => n.id === 'chv56_cache_vivo').func + '\n})';
const T0 = 1_800_000_000_000;
const ESPELHO = { '56': { chaves_kw: [5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 3] }, '400': { chaves_kw: [5, 5, 10, 10, 10, 10, 50, 50, 50, 50, 50, 50, 50] } };
const KW = ESPELHO['56'].chaves_kw;

function novoEstado(c) {                           // estado que sobrevive entre os comandos (flow e global do Node-RED)
  return { flow: { chv56_live: c.live || {}, chv56_logs: [], chv56_resv: c.resv }, global: { bt2_capacidade: c.cfg, bt2_kw100_cliente: c.cli, bt2_kw_400: c.outro } };
}
function roda(est, c) {                            // executa o no REAL; devolve { saida, msg, avisos }
  const ctx = k => ({ get: n => { if (c.quebra) throw new Error('boom'); return est[k][n]; }, set: (n, v) => { est[k][n] = v; } }), avisos = [];
  const agora = c.agora === undefined ? T0 : c.agora;
  const Fake = class extends Date { static now() { return agora; } };
  const fn = vm.runInNewContext(FONTE, { Date: Fake, process, console });
  const msg = { _rota: c.rota === undefined ? 'LIGAR' : c.rota, _reqId: 'r' + Math.random(), payload: { indice: c.indice, ligar: c.ligar } };
  const saida = fn(msg, ctx('flow'), ctx('global'), { get() {} }, { warn: t => avisos.push(t), log() {} });
  return { saida, msg, avisos };
}
const pl = x => JSON.parse(JSON.stringify(x));
const cfgDe = (kw100, modo = 'recusar', pct = 110) => ({ modo, pctLim: pct, gerador: { kw100, validade_s: 180, kw100_max: 1000 }, degrau: { max_kw: null, janela_s: 10 }, bancos: ESPELHO });
const liveDe = (ligadas = []) => Object.assign({ Nominal: [] }, ...ligadas.map(i => ({ ['Ligada' + i]: true })));
const comLimite = (kw100, pct = 110) => Math.round(kw100 * pct) / 100;

test('SEGURANCA: com o PLC "congelado" (nao mostra nenhuma chave nova), a carga ACEITA nunca passa do limite, em qualquer sequencia de LIGAR', () => {
  fc.assert(fc.property(fc.constantFrom(10, 20, 30, 50), fc.constantFrom(100, 110), fc.array(fc.integer({ min: 1, max: 13 }), { minLength: 1, maxLength: 25 }), fc.subarray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], { maxLength: 4 }), (kw100, pct, pedidos, jaLigadas) => {
    const lim = comLimite(kw100, pct), est = novoEstado({ cfg: cfgDe(kw100, 'recusar', pct), live: liveDe(jaLigadas), resv: undefined }), aceitas = new Set(jaLigadas);
    const base = jaLigadas.reduce((a, i) => a + KW[i - 1], 0);
    for (const idx of pedidos) {
      const r = roda(est, { indice: idx, ligar: true });
      if (r.saida[1]) { assert.equal(r.saida[0], null); assert.equal(r.msg.statusCode, 409); assert.equal(r.msg.payload.codigo, 'LIMITE_EXCEDIDO'); assert.equal(r.msg.payload.ok, false); assert.equal(r.msg.payload.limiteKw, lim); }
      else { assert.equal(r.saida[0], r.msg); assert.equal(r.msg.statusCode, undefined); aceitas.add(idx); }
      const total = [...aceitas].reduce((a, i) => a + KW[i - 1], 0);
      if (base <= lim + 1e-9) assert.ok(total <= lim + 1e-9, 'aceitou ate ' + total + ' kW com limite ' + lim + ' (pedidos ' + pedidos.join(',') + ')');
    }
  }), cfgFc);
});

test('o limite e exato: cabe no valor exato, 0,001 kW acima recusa; chave repetida nao soma duas vezes; sequencia ate o limite', () => {
  const est = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe([]) });                // limite 20: 4 chaves de 5 kW
  for (let i = 1; i <= 4; i++) assert.equal(roda(est, { indice: i, ligar: true }).saida[0] !== null, true, 'chave ' + i + ' cabe');
  assert.equal(roda(est, { indice: 4, ligar: true }).saida[0] !== null, true, 'a mesma chave de novo (reserva dela) nao soma duas vezes');
  const r5 = roda(est, { indice: 5, ligar: true }); assert.equal(r5.saida[1], r5.msg); assert.equal(r5.msg.payload.totalKw, 25);
  const est2 = novoEstado({ cfg: cfgDe(19.99, 'recusar', 100), live: liveDe([1, 2, 3]) }); assert.equal(roda(est2, { indice: 4, ligar: true }).saida[1] !== null, true, '20 kW com limite 19,99 recusa');
  const est3 = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe([1, 2, 3]) }); assert.equal(roda(est3, { indice: 4, ligar: true }).saida[1], null, '20 kW com limite 20 libera');
});

test('SEGURANCA: desligar e qualquer outra rota NUNCA sao recusados nem mexem na reserva; modo registrar e kW desconhecido nunca recusam nem reservam', () => {
  fc.assert(fc.property(fc.integer({ min: 1, max: 13 }), fc.constantFrom('BANCO', 'SELECIONAR', 'SALVAR', 'ZERAR', 'HABILITAR', null, 'ligar'), fc.constantFrom(10, 20), (idx, rota, kw100) => {
    const est = novoEstado({ cfg: cfgDe(kw100), live: liveDe([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) });
    const dsl = roda(est, { indice: idx, ligar: false }); assert.equal(dsl.saida[0], dsl.msg); assert.equal(dsl.saida[1], null); assert.equal(est.flow.chv56_resv, undefined);
    const outra = roda(est, { indice: idx, ligar: true, rota }); if (rota !== 'LIGAR') { assert.equal(outra.saida[0], outra.msg); assert.equal(est.flow.chv56_resv, undefined); }
    const semModo = cfgDe(kw100); delete semModo.modo;                                              // arquivo sem "modo" = registrar
    for (const c of [cfgDe(kw100, 'registrar'), semModo, cfgDe(null, 'recusar')]) {
      const e2 = novoEstado({ cfg: c, live: liveDe([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), outro: undefined }); const r = roda(e2, { indice: idx, ligar: true });
      assert.equal(r.saida[1], null, 'sem modo recusar (ou sem kw100) nunca recusa');
      if (c.modo !== 'recusar') { assert.equal(e2.flow.chv56_resv, undefined, 'registrar nao reserva'); assert.equal(e2.global.bt2_kw_56, undefined, 'e nao publica'); }
    }
  }), cfgFc);
});

test('reserva: so conta enquanto o PLC nao mostra a chave ligada (sem contar duas vezes) e vence em 5 s', () => {
  const est = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe([1, 2, 3]) });
  assert.equal(roda(est, { indice: 4, ligar: true }).saida[1], null);                                  // reserva a chave 4 (20 kW)
  assert.equal(roda(est, { indice: 5, ligar: true }).saida[1] !== null, true, 'a reserva da 4 conta: 25 > 20');
  est.flow.chv56_live = liveDe([1, 2, 3, 4]);                                                          // o PLC passou a mostrar a chave 4
  assert.equal(roda(est, { indice: 5, ligar: true }).saida[1] !== null, true, 'refletida: 20 comandados + 5 = 25 recusa, sem contar a 4 duas vezes');
  est.flow.chv56_live = liveDe([1, 2, 3]);
  assert.equal(roda(est, { indice: 5, ligar: true, agora: T0 + 4999 }).saida[1] !== null, true, 'ate 5 s a reserva ainda vale');
  const r = roda(est, { indice: 5, ligar: true, agora: T0 + 5001 }); assert.equal(r.saida[1], null, 'depois de 5 s a reserva vence (PLC nunca mostrou a chave 4)');
  assert.deepEqual(pl(est.flow.chv56_resv.map(x => x.idx)), [5]);
});

test('o kW publicado para os outros bancos inclui a reserva; recusa nao publica nada novo; o outro banco ja reservado entra na soma', () => {
  const est = novoEstado({ cfg: cfgDe(30, 'recusar', 100), live: liveDe([1, 2]) });                   // 10 kW comandados
  roda(est, { indice: 3, ligar: true });
  assert.deepEqual(pl(est.global.bt2_kw_56), { ts: T0, kw: 10 + 5 });
  roda(est, { indice: 4, ligar: true }); assert.equal(est.global.bt2_kw_56.kw, 20);
  const antes = pl(est.global.bt2_kw_56); roda(est, { indice: 6, ligar: true, agora: T0 + 10 }); roda(est, { indice: 7, ligar: true, agora: T0 + 10 });   // 20 + 4 + 4 = 28; depois 32 > 30
  assert.equal(est.global.bt2_kw_56.kw <= 30, true);
  const o = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe([1, 2, 3]), outro: { kw: 5, ts: T0 - 4000 } });
  assert.equal(roda(o, { indice: 4, ligar: true }).saida[1] !== null, true, 'o outro banco (5 kW, 4 s) entra na soma: 25 > 20');
  const velho = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe([1, 2, 3]), outro: { kw: 5, ts: T0 - 5001 } });
  assert.equal(roda(velho, { indice: 4, ligar: true }).saida[1], null, 'leitura do outro banco com mais de 5 s nao entra'); void antes;
});

test('mensagens e log: recusa grava UM registro (e repete no maximo a cada 2 s), responde pelo mesmo caminho dos outros erros e deixa o contexto para o log de comunicacao', () => {
  const est = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe([1, 2, 3, 4]) });
  const r = roda(est, { indice: 5, ligar: true });
  const dado = 'chave 5: total comandado 25 kW > limite 20 kW (kw100 20 x 100 %, origem arquivo, com reservas em voo)';
  assert.equal(r.msg.payload.erro, 'comando recusado: ' + dado); assert.equal(r.msg.headers['Content-Type'], 'application/json'); assert.equal(r.msg.payload.origemKw100, 'arquivo');
  const logs = pl(est.flow.chv56_logs); assert.equal(logs.length, 1); assert.equal(logs[0].rota, 'LIMITE'); assert.equal(logs[0].dado, dado); assert.equal(logs[0].erro, 'LIMITE_EXCEDIDO (C2: RECUSADO na saida da fila, nao foi enviado ao PLC)');
  assert.deepEqual(r.avisos, ['capacidade (C2): RECUSADO na saida da fila, banco 56 - ' + dado]);
  assert.equal(pl(est.flow.chv56_ctx).rota, 'LIGAR'); assert.equal(est.flow.chv56_ctx.reqId, r.msg._reqId); assert.equal(est.flow.chv56_ctx.esp.reserva, 'LIMITE_EXCEDIDO');
  roda(est, { indice: 5, ligar: true, agora: T0 + 1999 }); assert.equal(est.flow.chv56_logs.length, 1);
  roda(est, { indice: 5, ligar: true, agora: T0 + 2000 }); assert.equal(est.flow.chv56_logs.length, 2);
});

test('FAIL-OPEN: qualquer erro deixa o comando SEGUIR e so avisa; kW por chave: PLC (Nominal) > espelho; chave ja ligada nao reserva', () => {
  const q = roda(novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe([1, 2, 3, 4]) }), { indice: 5, ligar: true, quebra: true });
  assert.equal(q.saida[0], q.msg); assert.equal(q.saida[1], null); assert.deepEqual(q.avisos, ['capacidade (C2 reserva): erro ao avaliar (o comando segue normalmente): boom']);
  const nom = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: Object.assign(liveDe([1, 2, 3]), { Nominal: [0, 0, 0, 21] }) });
  const r = roda(nom, { indice: 4, ligar: true }); assert.equal(r.saida[1], r.msg); assert.equal(r.msg.payload.totalKw, 36, 'usa o kW do PLC (21), nao o espelho (5)');
  const ja = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe([1, 2, 3, 4]) }); roda(ja, { indice: 4, ligar: true }); assert.equal(ja.flow.chv56_resv.length, 0, 'chave ja ligada: nada a reservar');
  const cb = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: Object.assign(liveDe([1, 2, 3]), { CbLigar4: true }) }); roda(cb, { indice: 4, ligar: true }); assert.equal(cb.flow.chv56_resv.length, 0, 'comando em andamento (CbLigar) tambem conta como ligada');
});

// ---- o cache ao vivo: publica carga comandada + reservas vivas e limpa as refletidas ou vencidas ----
function rodaCache(est, live, agora = T0) {
  const ctx = k => ({ get: n => est[k][n], set: (n, v) => { est[k][n] = v; } });
  const Fake = class extends Date { static now() { return agora; } };
  vm.runInNewContext(FONTE_CACHE, { Date: Fake, process, console })({ payload: live }, ctx('flow'), ctx('global'), { get() {} }, { warn() {}, log() {} });
}
test('cache: publica em bt2_kw_56 a carga comandada + as reservas vivas, limpa as refletidas e as vencidas, e sem reserva fica como antes', () => {
  const est = novoEstado({ cfg: cfgDe(30), live: liveDe([]), resv: [{ idx: 4, kw: 5, ts: T0 - 100 }, { idx: 6, kw: 4, ts: T0 - 100 }, { idx: 7, kw: 4, ts: T0 - 5001 }, { idx: 4, kw: 5, ts: T0 - 50 }] });
  rodaCache(est, liveDe([1, 2, 6]));                                                                  // 1, 2 e 6 ligadas = 5 + 5 + 4 = 14; reserva da 6 refletida, da 7 vencida, da 4 duplicada conta 1 vez
  assert.deepEqual(pl(est.global.bt2_kw_56), { ts: T0, kw: 14 + 5 });
  assert.deepEqual(pl(est.flow.chv56_resv.map(r => r.idx)), [4]);
  const sem = novoEstado({ cfg: cfgDe(30), live: liveDe([]) }); rodaCache(sem, liveDe([1, 2])); assert.deepEqual(pl(sem.global.bt2_kw_56), { ts: T0, kw: 10 }); assert.equal(sem.flow.chv56_resv, undefined);
  const lixo = novoEstado({ cfg: cfgDe(30), live: liveDe([]), resv: [null, { idx: 3 }, { idx: 5, kw: 'x', ts: T0 }] }); rodaCache(lixo, liveDe([1])); assert.equal(lixo.global.bt2_kw_56.kw, 5, 'reserva malformada nao conta (kw invalido) e nao quebra');
});

/* ---------------------------------------------------------------------------------------------------------------------
   Testes dirigidos (mutacao): kW por chave, kW a 100 % (arquivo x medidor, validade), fronteiras de tempo, CbLigar e log.
   --------------------------------------------------------------------------------------------------------------------- */
const quatro = [1, 2, 3, 4];                                                       // 20 kW ligados; ligar a 5 => 25 kW
const tenta = (cfg, live, extra) => { const est = novoEstado({ cfg, live, ...extra }); return Object.assign(roda(est, { indice: 5, ligar: true, ...(extra && extra.req) }), { est }); };
const recusou = r => r.saida[1] !== null;

test('kW de cada chave: PLC (Nominal, so numero finito > 0, aceita matriz) > espelho (so numero finito) > 0', () => {
  const kwNova = (live, bancos) => { const est = novoEstado({ cfg: Object.assign(cfgDe(0.001, 'recusar', 100), { bancos: bancos || ESPELHO }), live }); const r = roda(est, { indice: 5, ligar: true }); return recusou(r) ? r.msg.payload.totalKw : 0; };
  assert.equal(kwNova({ Nominal: [0, 0, 0, 0, 21] }), 21); assert.equal(kwNova({ Nominal: [[0, 0, 0, 0, 21]] }), 21, 'matriz: primeira linha');
  assert.equal(kwNova({ Nominal: [0, 0, 0, 0, 9, 0] }), 9, 'indice 5 = posicao 5 (nao a vizinha)'); assert.equal(kwNova({ Nominal: [0, 0, 0, 0, 0, 9] }), 5);
  for (const ruim of [0, -3, '7', Infinity, NaN, null]) assert.equal(kwNova({ Nominal: [0, 0, 0, 0, ruim] }), 5, 'Nominal invalido (' + String(ruim) + ') cai no espelho');
  assert.equal(kwNova({ Nominal: 'abc' }), 5); assert.equal(kwNova({ Nominal: undefined }), 5); assert.equal(kwNova({ Nominal: { 4: 9 } }), 5);
  assert.equal(kwNova({ Nominal: [] }, { '56': { chaves_kw: [5, 5, 5, 5, '5'] } }), 0, 'espelho em texto vale 0'); assert.equal(kwNova({ Nominal: [] }, { '56': { chaves_kw: [5, 5, 5, 5, Infinity] } }), 0);
  assert.equal(kwNova({ Nominal: [] }, { '56': {} }), 0); assert.equal(kwNova({ Nominal: [] }, {}), 0);
});

test('CbLigar (comando em andamento) conta como ligada, tanto na carga comandada quanto na reserva ja refletida', () => {
  const cb = (liv) => novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: Object.assign({ Nominal: [] }, liv) });
  assert.equal(recusou(roda(cb({ CbLigar1: true, CbLigar2: true, CbLigar3: true, CbLigar4: true }), { indice: 5, ligar: true })), true, '4 chaves so com CbLigar = 20 kW comandados');
  const est = cb({ CbLigar1: true, CbLigar2: true, CbLigar3: true }); assert.equal(recusou(roda(est, { indice: 4, ligar: true })), false);          // reserva a 4 (20 kW)
  est.flow.chv56_live = Object.assign({ Nominal: [] }, { CbLigar1: true, CbLigar2: true, CbLigar3: true, CbLigar4: true });                       // a 4 aparece so como CbLigar
  const r = roda(est, { indice: 5, ligar: true }); assert.equal(r.msg.payload.totalKw, 25, 'sem contar a 4 duas vezes (CbLigar reflete a reserva)');
  const so = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: { Nominal: [], Ligada1: true, Ligada2: true, Ligada3: true } }); roda(so, { indice: 4, ligar: true });
  so.flow.chv56_live = { Nominal: [], Ligada1: true, Ligada2: true, Ligada3: true, Ligada4: true }; assert.equal(roda(so, { indice: 5, ligar: true }).msg.payload.totalKw, 25, 'Ligada tambem reflete a reserva');
});

test('kW a 100 %: arquivo (>0) vale mais que o medidor; medidor vale 180 s por padrao (ou validade_s) e so se > 0; sem nenhum, nunca recusa', () => {
  const cfgK = (kw100, validade_s) => ({ modo: 'recusar', pctLim: 110, gerador: { kw100, validade_s, kw100_max: 1000 }, degrau: {}, bancos: ESPELHO });
  const live = liveDe(quatro), cli = (kw100, idadeMs) => ({ kw100, modelo: 'm', ts: T0 - idadeMs });
  assert.equal(recusou(tenta(cfgK(20), live, { cli: cli(1000, 0) })), true, 'o arquivo (20) vale mais que o medidor (1000)');
  assert.equal(recusou(tenta(cfgK(0), live, { cli: cli(20, 0) })), true, 'kw100 do arquivo 0 nao vale: usa o medidor'); assert.equal(recusou(tenta(cfgK(-5), live, { cli: cli(20, 0) })), true);
  assert.equal(recusou(tenta(cfgK(null, undefined), live, { cli: cli(20, 179_000) })), true, 'sem validade_s: 180 s'); assert.equal(recusou(tenta(cfgK(null, undefined), live, { cli: cli(20, 180_000) })), true, 'exatamente 180 s ainda vale');
  assert.equal(recusou(tenta(cfgK(null, undefined), live, { cli: cli(20, 181_000) })), false, 'vencido: nao avalia');
  assert.equal(recusou(tenta(cfgK(null, 10), live, { cli: cli(20, 9_000) })), true); assert.equal(recusou(tenta(cfgK(null, 10), live, { cli: cli(20, 11_000) })), false, 'validade_s 10 s');
  assert.equal(recusou(tenta(cfgK(null, undefined), live, { cli: cli(0, 0) })), false); assert.equal(recusou(tenta(cfgK(null, undefined), live, { cli: cli(-20, 0) })), false);
  assert.equal(recusou(tenta(cfgK(null, undefined), live, { cli: cli(20, -1000) })), true, 'leitura "do futuro" (relogio) ainda vale'); assert.equal(recusou(tenta(cfgK(null, undefined), live, {})), false, 'sem medidor nem arquivo nunca recusa');
  const r = tenta(cfgK(null, undefined), live, { cli: cli(20, 5000) }); assert.equal(r.msg.payload.origemKw100, 'medidor'); assert.equal(r.msg.payload.limiteKw, 22);
  assert.equal(recusou(tenta(Object.assign(cfgK(20), { pctLim: undefined }), live, {})), true, 'pctLim ausente = 110 %'); assert.equal(tenta(Object.assign(cfgK(20), { pctLim: undefined }), live, {}).msg.payload.limiteKw, 22);
  assert.equal(recusou(tenta(Object.assign(cfgK(20), { gerador: undefined }), live, {})), false, 'sem bloco gerador: nao avalia');
});

test('fronteiras de tempo: reserva vale ate 5000 ms; leitura do outro banco ate 5000 ms; limite exato libera (0,001 acima recusa)', () => {
  const base = () => novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe([1, 2, 3]) });
  const e = base(); roda(e, { indice: 4, ligar: true });
  assert.equal(recusou(roda(e, { indice: 5, ligar: true, agora: T0 + 5000 })), true, 'com exatamente 5000 ms a reserva ainda conta'); assert.equal(recusou(roda(e, { indice: 5, ligar: true, agora: T0 + 5001 })), false);
  const o1 = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe([1, 2, 3]), outro: { kw: 5, ts: T0 - 5000 } }); assert.equal(recusou(roda(o1, { indice: 4, ligar: true })), true, 'outro banco com exatamente 5000 ms conta');
  const o2 = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe([1, 2, 3]), outro: { kw: Infinity, ts: T0 } }); assert.equal(recusou(roda(o2, { indice: 4, ligar: true })), false, 'kW infinito do outro banco e ignorado');
  const o3 = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe([1, 2, 3]), outro: { kw: NaN, ts: T0 } }); assert.equal(recusou(roda(o3, { indice: 4, ligar: true })), false);
  const lig = (kw100, pct) => recusou(roda(novoEstado({ cfg: cfgDe(kw100, 'recusar', pct), live: liveDe([1, 2, 3]) }), { indice: 4, ligar: true })); assert.equal(lig(20, 100), false); assert.equal(lig(19.99, 100), true); assert.equal(lig(20, 125), false);
  const ctxRec = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe(quatro) }); roda(ctxRec, { indice: 5, ligar: true });
  assert.deepEqual(pl(ctxRec.flow.chv56_ctx), { rota: 'LIGAR', reqId: ctxRec.flow.chv56_ctx.reqId, fase: 'reserva', lerAgora: false, esp: { reserva: 'LIMITE_EXCEDIDO' } });
});

test('log do no: comeca vazio se nao existe, guarda no maximo 1000 (descarta o mais antigo), com os campos fixos do formato do log', () => {
  const sem = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe(quatro) }); delete sem.flow.chv56_logs; roda(sem, { indice: 5, ligar: true });
  assert.equal(sem.flow.chv56_logs.length, 1); const l = pl(sem.flow.chv56_logs[0]); assert.equal(l.status, 0); assert.equal(l.ok, false); assert.equal(l.ms, 0);
  const m = n => Array.from({ length: n }, (_, i) => ({ rota: 'x' + i }));
  const a = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe(quatro) }); a.flow.chv56_logs = m(999); roda(a, { indice: 5, ligar: true }); assert.equal(a.flow.chv56_logs.length, 1000); assert.equal(a.flow.chv56_logs[0].rota, 'x0');
  const b = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe(quatro) }); b.flow.chv56_logs = m(1000); roda(b, { indice: 5, ligar: true }); assert.equal(b.flow.chv56_logs.length, 1000); assert.equal(b.flow.chv56_logs[0].rota, 'x1'); assert.equal(b.flow.chv56_logs[999].rota, 'LIMITE');
});

test('reservas guardadas com lixo ou repetidas nao quebram nem contam duas vezes', () => {
  const est = novoEstado({ cfg: cfgDe(30, 'recusar', 100), live: liveDe([1, 2]), resv: [null, undefined, 7, { idx: 3 }, { idx: 4, kw: 5, ts: T0 }, { idx: 4, kw: 5, ts: T0 }] });
  const r = roda(est, { indice: 6, ligar: true }); assert.equal(r.saida[1], null); assert.deepEqual(pl(est.flow.chv56_resv.map(x => x.idx).sort()), [4, 6], 'a reserva repetida conta uma vez e o lixo some');
  const dois = novoEstado({ cfg: cfgDe(20, 'recusar', 100), live: liveDe([1, 2, 3]), resv: [{ idx: 4, kw: 5, ts: T0 }, { idx: 4, kw: 5, ts: T0 }] }); assert.equal(roda(dois, { indice: 5, ligar: true }).msg.payload.totalKw, 25, 'duas reservas da mesma chave: 15 + 5 + 5');
});
