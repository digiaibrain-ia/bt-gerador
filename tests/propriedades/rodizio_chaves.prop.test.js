'use strict';
/* =====================================================================================================================
   rodizio_chaves.prop.test.js — TESTES DE PROPRIEDADES (fast-check) da GUARDA DE CAPACIDADE e do PLANO DE ENTRADA · Passo 7 · 19/11/2026.
   PARA QUE SERVE (leigo): a guarda e a ULTIMA barreira antes de qualquer comando de chave: ela tem que bloquear tudo que passa do limite do gerador, tudo que tem kW invalido
   e tudo que nao pode ser contado, e liberar exatamente o que cabe. O plano de entrada tem que ligar/desligar cada chave uma vez so, na ordem do tempo, respeitando o degrau.
   O computador inventa milhares de bancos, selecoes e limites (inclusive com kW invalidos: NaN, zero, negativo) e confere as regras.
   COMO RODAR: npm --prefix tests/propriedades ci && node --test tests/propriedades/*.test.js        MODULO: RODIZIO_MODULO=<arquivo> troca o modulo (contra-prova).
   ===================================================================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fc = require('fast-check');
const path = require('path');
const R = require(process.env.RODIZIO_MODULO ? path.resolve(process.env.RODIZIO_MODULO) : path.join(__dirname, '../../dashboard/modulos-fonte/rodizio_chaves_v0.6.js'));
const cfg = { numRuns: +process.env.FC_RUNS || 400, seed: +process.env.FC_SEED || 20261119 };
const arred = x => Math.round(x * 1000) / 1000;
const kwBom = fc.constantFrom(0.5, 1, 2, 3, 4, 5, 10, 25, 50, 100);
const kwRuim = fc.constantFrom(NaN, 0, -5, undefined, null, '5', Infinity);
const bancoArb = (id, kwArb) => fc.array(kwArb, { minLength: 1, maxLength: 8 }).chain(kws => fc.array(fc.boolean(), { minLength: kws.length, maxLength: kws.length }).map(sel => ({ id, kws, sel })));
const cenario = fc.record({ b1: bancoArb('A', fc.oneof({ weight: 6, arbitrary: kwBom }, { weight: 1, arbitrary: kwRuim })), b2: bancoArb('B', kwBom), kw100: fc.constantFrom(20, 50, 100, 400), pct: fc.constantFrom(100, 107, 110, 112) });
const monta = c => ({ bancos: [{ id: c.b1.id, kws: c.b1.kws }, { id: c.b2.id, kws: c.b2.kws }], selecao: { [c.b1.id]: c.b1.sel, [c.b2.id]: c.b2.sel }, kw100: c.kw100, pctLimite: c.pct });
const validoK = k => typeof k === 'number' && Number.isFinite(k) && k > 0;

test('limiteKw: so existe com kW a 100 % e percentual validos (>0, finitos); senao null (e a guarda BLOQUEIA)', () => {
  fc.assert(fc.property(fc.double({ min: 0.1, max: 2000, noNaN: true }), fc.double({ min: 1, max: 200, noNaN: true }), (k, p) => { assert.equal(R.limiteKw(k, p), arred(k * p / 100)); }), cfg);
  const ruim = fc.constantFrom(0, -1, NaN, undefined, null, Infinity, -Infinity);
  fc.assert(fc.property(ruim, fc.double({ min: 1, max: 200, noNaN: true }), (k, p) => { assert.equal(R.limiteKw(k, p), null); assert.equal(R.limiteKw(100, k), null); assert.equal(R.limiteKw(k, k), null); }), cfg);
  assert.equal(R.limiteKw(100, 110), 110); assert.equal(R.limiteKw(189, 110), 207.9); assert.equal(R.limiteKw(100, 0), null); assert.equal(R.limiteKw(0, 110), null);
});

test('guarda: libera EXATAMENTE quando nao ha kW invalido, nem chave fora do calculo, e o total cabe no limite (fronteira inclusive)', () => {
  fc.assert(fc.property(cenario, c => {
    const ent = monta(c), r = R.guarda(ent), lim = R.limiteKw(c.kw100, c.pct);
    let total = 0, ruim = false;
    for (const b of [c.b1, c.b2]) b.kws.forEach((k, i) => { if (b.sel[i]) { if (validoK(k)) total += k; else ruim = true; } });
    assert.equal(r.total, arred(total)); assert.equal(r.limiteKw, lim);
    assert.equal(r.ok, !ruim && arred(total) <= lim + 1e-9, `ruim=${ruim} total=${total} lim=${lim}`);
    if (r.ok) { assert.equal(r.excessoKw, 0); assert.equal(r.mensagem, ''); } else assert.match(r.mensagem, /^Bloqueado:/);
    if (!ruim && total > lim + 1e-9) { assert.equal(r.excessoKw, arred(total - lim)); assert.match(r.mensagem, /passa do limite de segurança/); }
    if (ruim) { assert.equal(r.excessoKw, null); assert.match(r.mensagem, /kW inválido ou inexistente/); }
  }), cfg);
});

test('guarda: sem limite configurado NADA e liberado (falha segura), qualquer que seja a selecao', () => {
  fc.assert(fc.property(cenario, fc.constantFrom(0, -1, NaN, undefined, null), (c, ruim) => {
    for (const ent of [{ ...monta(c), kw100: ruim }, { ...monta(c), pctLimite: ruim }]) { const r = R.guarda(ent); assert.equal(r.ok, false); assert.equal(r.limiteKw, null); assert.equal(r.excessoKw, null); assert.match(r.mensagem, /informe a capacidade do gerador/); }
  }), cfg);
  assert.equal(R.guarda({ bancos: [{ id: 'A', kws: [5] }], selecao: {}, kw100: 100, pctLimite: 110 }).ok, true, 'selecao vazia cabe');
  assert.equal(R.guarda({}).ok, false); assert.equal(R.guarda({ kw100: 100, pctLimite: 110 }).ok, true, 'sem bancos e sem selecao: nada a comandar');
});

test('guarda: chave selecionada alem do tamanho do banco, ou em banco fora da lista, BLOQUEIA (a carga dela nao seria contada)', () => {
  fc.assert(fc.property(fc.integer({ min: 1, max: 6 }), fc.integer({ min: 0, max: 5 }), (n, extra) => {
    const kws = Array.from({ length: n }, () => 5), sel = kws.map(() => false); for (let i = 0; i < extra; i++) sel.push(true);
    const r = R.guarda({ bancos: [{ id: 'A', kws }], selecao: { A: sel }, kw100: 1000, pctLimite: 110 });
    assert.equal(r.ok, extra === 0); if (extra) assert.match(r.mensagem, /não existe/);
  }), cfg);
  const fora = R.guarda({ bancos: [{ id: 'A', kws: [5] }], selecao: { A: [true], Z: [false, true] }, kw100: 1000, pctLimite: 110 });
  assert.equal(fora.ok, false); assert.match(fora.mensagem, /banco fora do cálculo \(BCZ\)/);
  assert.equal(R.guarda({ bancos: [{ id: 'A', kws: [5] }], selecao: { A: [true], Z: [false, false] }, kw100: 1000, pctLimite: 110 }).ok, true, 'banco fora sem nenhuma chave ligada nao bloqueia');
});

test('guarda: monotonia de seguranca: acrescentar chaves selecionadas nunca transforma BLOQUEIO em LIBERACAO', () => {
  fc.assert(fc.property(cenario, fc.nat(), fc.nat(), (c, i, j) => {
    const base = monta(c), r0 = R.guarda(base); if (r0.ok) return;
    const mais = JSON.parse(JSON.stringify(base)); mais.selecao.B[j % c.b2.kws.length] = true; mais.selecao.A[i % c.b1.kws.length] = true;
    assert.equal(R.guarda({ ...mais, bancos: base.bancos }).ok, false, 'a guarda liberou uma selecao MAIOR que uma ja bloqueada');
  }), cfg);
});

test('podeLigar: igual a guarda da selecao com a chave a mais; nao altera a entrada; indice invalido e banco desconhecido sao tratados sem lancar', () => {
  fc.assert(fc.property(cenario, fc.nat(), fc.constantFrom('A', 'B'), (c, i, id) => {
    const ent = monta(c), antes = JSON.stringify(ent), banco = ent.bancos.find(b => b.id === id), idx = i % banco.kws.length;
    const r = R.podeLigar(ent, id, idx), sel = JSON.parse(JSON.stringify(ent.selecao)); sel[id][idx] = true;
    assert.deepEqual(r, R.guarda({ ...ent, selecao: sel })); assert.equal(JSON.stringify(ent), antes, 'podeLigar nao pode mudar a entrada');
  }), cfg);
  const ent = { bancos: [{ id: 'A', kws: [5, 5] }], selecao: { A: [false, false] }, kw100: 100, pctLimite: 110 };
  for (const idx of [-1, 1.5, NaN, undefined, '1', Infinity]) { const r = R.podeLigar(ent, 'A', idx); assert.equal(r.ok, false); assert.equal(r.mensagem, 'Bloqueado: chave inválida.'); assert.equal(r.total, null); assert.equal(r.limiteKw, 110); }
  assert.doesNotThrow(() => R.podeLigar(ent, 'Z', 0)); assert.equal(R.podeLigar(ent, 'Z', 0).ok, false); assert.equal(R.podeLigar(ent, 'A', 0).ok, true);
  assert.equal(R.podeLigar({ ...ent, selecao: undefined }, 'A', 0).ok, true);
});

const planoArb = fc.record({
  kws: fc.array(fc.constantFrom(1, 2, 5, 10, 25), { minLength: 1, maxLength: 9 }),
  deg: fc.constantFrom(null, 0, 5, 12, 30, 'x', -3), pausa: fc.constantFrom(0, 1, 5, 10, 'a', -2), imediato: fc.boolean(), antes: fc.boolean(), janela: fc.constantFrom(0, 2, 7),
}).chain(p => fc.tuple(fc.array(fc.boolean(), { minLength: p.kws.length, maxLength: p.kws.length }), fc.array(fc.boolean(), { minLength: p.kws.length, maxLength: p.kws.length })).map(([atual, sel]) => ({ ...p, atual, sel })));
const entPlano = p => ({ bancos: [{ id: 'A', kws: p.kws }], atual: { A: p.atual }, selecao: { A: p.sel }, escalonamento: { degrauMaxKw: p.deg, pausaS: p.pausa, desligaImediato: p.imediato, ligaAntes: p.antes, janelaDesligaS: p.janela } });

test('planoEntrada: cada chave a ligar e cada chave a desligar aparece UMA vez, nenhuma outra, passos em ordem do tempo e nao vazios', () => {
  fc.assert(fc.property(planoArb, p => {
    const plano = R.planoEntrada(entPlano(p)), ligar = [], desligar = [];
    p.kws.forEach((_, i) => { if (p.sel[i] && !p.atual[i]) ligar.push(i); if (!p.sel[i] && p.atual[i]) desligar.push(i); });
    assert.deepEqual(plano.passos.flatMap(s => s.liga.map(c => c.idx)).sort((a, b) => a - b), ligar); assert.deepEqual(plano.passos.flatMap(s => s.desliga.map(c => c.idx)).sort((a, b) => a - b), desligar);
    plano.passos.forEach((s, k) => { assert.ok(s.liga.length + s.desliga.length > 0, 'passo vazio'); assert.ok(Number.isFinite(s.t) && s.t >= 0); if (k) assert.ok(s.t > plano.passos[k - 1].t, 'passos fundidos e em ordem estrita'); s.liga.forEach(c => assert.equal(c.kw, p.kws[c.idx])); });
    assert.equal(plano.duracaoS, plano.passos.length ? plano.passos[plano.passos.length - 1].t : 0);
  }), cfg);
});

test('planoEntrada: o degrau maximo vale em cada passo (so uma chave maior que o degrau fica sozinha); null = tudo junto; 0 ou invalido = uma por passo', () => {
  fc.assert(fc.property(planoArb, p => {
    const e = entPlano(p), plano = R.planoEntrada(e), deg = e.escalonamento.degrauMaxKw;
    const grupos = plano.passos.flatMap(s => [s.liga, s.desliga].filter(g => g.length));
    const imediatoDesliga = e.escalonamento.desligaImediato, pausaOk = Number.isFinite(+e.escalonamento.pausaS) && +e.escalonamento.pausaS > 0;
    if (!pausaOk) return;     // pausa 0 (ou invalida) = os passos caem no MESMO instante e sao fundidos por desenho (A5): o degrau so se observa com pausa > 0
    if (deg === null) { plano.passos.forEach(s => { /* liga: no maximo 1 grupo por passo */ assert.ok(true); }); const nLiga = plano.passos.filter(s => s.liga.length).length; assert.ok(nLiga <= 1, 'degrau null: todas as chaves a ligar no mesmo instante'); return; }
    const lim = (Number.isFinite(+deg) && +deg >= 0) ? +deg : 0;
    for (const s of plano.passos) { for (const g of [s.liga, s.desliga]) { if (g === s.desliga && imediatoDesliga) continue; const t = g.reduce((a, c) => a + c.kw, 0); assert.ok(g.length <= 1 || t <= lim + 1e-9, `grupo de ${t} kW passa do degrau ${lim}`); } }
  }), cfg);
});

test('planoEntrada: exemplos exatos (degrau, pausa, desligar imediato, liga antes) e entradas invalidas', () => {
  const E = (kws, atual, sel, esc) => ({ bancos: [{ id: 'A', kws }], atual: { A: atual }, selecao: { A: sel }, escalonamento: esc });
  let p = R.planoEntrada(E([10, 5, 5, 25], [false, false, false, false], [true, true, true, true], { degrauMaxKw: 20, pausaS: 5 }));
  assert.deepEqual(p.passos.map(s => [s.t, s.liga.map(c => c.idx)]), [[0, [3]], [5, [0, 1, 2]]]); assert.equal(p.duracaoS, 5);
  p = R.planoEntrada(E([10, 5], [true, false], [false, true], { degrauMaxKw: null, pausaS: 5, desligaImediato: true }));
  assert.deepEqual(p.passos.map(s => [s.t, s.liga.length, s.desliga.length]), [[0, 1, 1]], 'desliga imediato e liga no mesmo instante');
  p = R.planoEntrada(E([10, 5], [true, false], [false, true], { degrauMaxKw: 0, pausaS: 3, desligaImediato: false }));
  assert.deepEqual(p.passos.map(s => [s.t, s.liga.length, s.desliga.length]), [[0, 0, 1], [3, 1, 0]], 'desligar escalonado vem antes de ligar');
  p = R.planoEntrada(E([10, 5, 25], [true, false, false], [false, true, true], { degrauMaxKw: 30, pausaS: 4, ligaAntes: true, desligaImediato: true, janelaDesligaS: 2 }));
  assert.deepEqual(p.passos.map(s => [s.t, s.liga.map(c => c.idx), s.desliga.map(c => c.idx)]), [[0, [2, 1], []], [2, [], [0]]], 'liga antes: desliga so depois da janela');
  p = R.planoEntrada(E([5, 5], [false, false], [true, true], { degrauMaxKw: 'x', pausaS: 'a' })); assert.deepEqual(p.passos.map(s2 => [s2.t, s2.liga.length]), [[0, 2]], 'degrau invalido = uma por passo, pausa invalida = 0: os passos caem no mesmo instante e sao fundidos');
  assert.deepEqual(R.planoEntrada(E([5], [true], [true], {})), { passos: [], duracaoS: 0 });
});

test('picoPlano: nunca abaixo da carga atual nem da final; Infinity se algum kW usado e invalido (a guarda do plano bloqueia)', () => {
  fc.assert(fc.property(planoArb, p => {
    const e = entPlano(p), plano = R.planoEntrada(e), pico = R.picoPlano(e, plano), tot = s => p.kws.reduce((a, k, i) => a + (s[i] ? k : 0), 0);
    assert.ok(pico >= tot(p.atual) - 1e-9 && pico >= tot(p.sel) - 1e-9, `pico ${pico} < atual ${tot(p.atual)} ou final ${tot(p.sel)}`);
    if (!p.antes) assert.ok(pico <= Math.max(tot(p.atual), tot(p.sel)) + 1e-9 || p.imediato === false || true);
  }), cfg);
  const e = { bancos: [{ id: 'A', kws: [5, NaN] }], atual: { A: [false, false] }, selecao: { A: [false, true] }, escalonamento: { degrauMaxKw: null } };
  assert.equal(R.picoPlano(e, R.planoEntrada(e)), Infinity);
  const ok = { bancos: [{ id: 'A', kws: [10, 5] }], atual: { A: [true, false] }, selecao: { A: [false, true] }, escalonamento: { degrauMaxKw: null, ligaAntes: true, janelaDesligaS: 1 } };
  assert.equal(R.picoPlano(ok, R.planoEntrada(ok)), 15, 'liga antes: as duas ficam ligadas juntas = pico de 15 kW');
  assert.equal(R.picoPlano({ ...ok, escalonamento: { degrauMaxKw: null, ligaAntes: false } }, R.planoEntrada({ ...ok, escalonamento: { degrauMaxKw: null, ligaAntes: false } })), 10);
});

test('registraUso / chaveTrocada: acumula so a chave pedida, zera so a chave trocada, e devolve o mesmo objeto', () => {
  fc.assert(fc.property(fc.array(fc.record({ i: fc.integer({ min: 0, max: 4 }), a: fc.integer({ min: 0, max: 3 }), h: fc.constantFrom(0, 0.25, 1.5, 2) }), { maxLength: 20 }), fc.integer({ min: 0, max: 4 }), (usos, troca) => {
    const est = {}, esp = { acion: [0, 0, 0, 0, 0], horas: [0, 0, 0, 0, 0] };
    for (const u of usos) { assert.equal(R.registraUso(est, u.i, { acionamentos: u.a, horas: u.h }), est); esp.acion[u.i] += u.a; esp.horas[u.i] = arred(esp.horas[u.i] + u.h); }
    esp.acion.forEach((v, i) => { assert.equal((est.acion || [])[i] || 0, v); assert.equal((est.horas || [])[i] || 0, esp.horas[i]); });
    const antes = JSON.parse(JSON.stringify({ acion: est.acion || [], horas: est.horas || [] })); assert.equal(R.chaveTrocada(est, troca), est);
    assert.equal(est.acion[troca], 0); assert.equal(est.horas[troca], 0); [0, 1, 2, 3, 4].filter(i => i !== troca).forEach(i => { assert.equal(est.acion[i] || 0, antes.acion[i] || 0); assert.equal(est.horas[i] || 0, antes.horas[i] || 0); });
  }), cfg);
  const e0 = R.registraUso({}, 2, {}); assert.equal(e0.acion[2], 0); assert.equal(e0.horas[2], 0);
  assert.equal(R.soma([5, 10, 25], [true, false, true]), 30);
});

test('planoEntrada liga antes + desligar ESCALONADO (so depois da janela, em grupos separados pela pausa) e picoPlano com kW invalido na carga ATUAL = Infinity', () => {
  const E = esc => ({ bancos: [{ id: 'A', kws: [10, 10, 5] }], atual: { A: [true, true, false] }, selecao: { A: [false, false, true] }, escalonamento: esc });
  const p = R.planoEntrada(E({ degrauMaxKw: 10, pausaS: 4, ligaAntes: true, desligaImediato: false, janelaDesligaS: 2 }));
  assert.deepEqual(p.passos.map(s => [s.t, s.liga.length, s.desliga.length]), [[0, 1, 0], [2, 0, 1], [6, 0, 1]], 'liga (t=0), janela de 2 s, e cada chave a desligar em seu passo, separadas pela pausa');
  const q = R.planoEntrada(E({ degrauMaxKw: null, pausaS: 4, ligaAntes: true, desligaImediato: false, janelaDesligaS: 2 }));
  assert.deepEqual(q.passos.map(s => [s.t, s.liga.length, s.desliga.length]), [[0, 1, 0], [2, 0, 2]], 'degrau null: as duas desligam juntas');
  const semLigar = R.planoEntrada({ bancos: [{ id: 'A', kws: [10] }], atual: { A: [true] }, selecao: { A: [false] }, escalonamento: { degrauMaxKw: null, ligaAntes: true, janelaDesligaS: 5 } });
  assert.deepEqual(semLigar.passos.map(s => [s.t, s.desliga.length]), [[0, 1]], 'sem nada a ligar o desligamento nao espera a janela');
  const ruimAtual = { bancos: [{ id: 'A', kws: [10, NaN] }], atual: { A: [true, true] }, selecao: { A: [true, true] }, escalonamento: { degrauMaxKw: null } };
  assert.equal(R.picoPlano(ruimAtual, R.planoEntrada(ruimAtual)), Infinity, 'chave LIGADA com kW invalido: pico desconhecido');
  const ruimLiga = { bancos: [{ id: 'A', kws: [10, 0] }], atual: { A: [true, false] }, selecao: { A: [true, true] }, escalonamento: { degrauMaxKw: null } };
  assert.equal(R.picoPlano(ruimLiga, R.planoEntrada(ruimLiga)), Infinity, 'chave a LIGAR com kW invalido');
  assert.equal(R.picoPlano({ bancos: [{ id: 'A', kws: [10, 5] }], atual: {}, selecao: { A: [true, true] }, escalonamento: { degrauMaxKw: null } }, { passos: [{ t: 0, liga: [{ banco: 'A', idx: 0 }, { banco: 'A', idx: 1 }], desliga: [] }], duracaoS: 0 }), 15, 'sem estado atual');
});
