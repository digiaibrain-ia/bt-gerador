'use strict';
/* =====================================================================================================================
   perfil_combustivel.prop.test.js — TESTES DE PROPRIEDADES (fast-check) do FB "perfil de combustivel" · Passo 7 · 19/11/2026.
   PARA QUE SERVE (leigo): em vez de alguns exemplos escritos a mao, o computador inventa milhares de casos (inclusive os absurdos) e confere regras que NUNCA podem falhar:
   motor a gas nao recebe degrau maior que o permitido; sem leitura de frequencia nao se adiciona carga; a descida abre todas as chaves, uma vez cada, em ordem.
   COMO RODAR: npm --prefix tests/propriedades ci && node --test tests/propriedades/*.test.js        (o fast-check fica em tests/propriedades/node_modules, fora do Git)
   COMO PROVA (tecnico): modulo REAL dashboard/modulos-fonte/fb_perfil_combustivel_v0.1.js (funcoes puras). Semente fixa (FC_SEED) para repetir; shrinking mostra o menor caso que falha.
   ===================================================================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fc = require('fast-check');
const P = require('../../dashboard/modulos-fonte/fb_perfil_combustivel_v0.1.js');
const cfg = { numRuns: +process.env.FC_RUNS || 500, seed: +process.env.FC_SEED || 20261119, verbose: 0 };
const GAS = ['gas', 'biometano'];
const pct = fc.double({ min: 0, max: 130, noNaN: true });

test('subDegraus: crescente, dentro de (de, ate), em partes iguais e nenhum degrau passa do maximo do perfil', () => {
  fc.assert(fc.property(fc.constantFrom(...GAS), pct, pct, (id, a, b) => {
    const p = P.PERFIS[id], de = Math.min(a, b), ate = Math.max(a, b), s = P.subDegraus(id, de, ate);
    const n = Math.ceil((ate - de) / p.passoMaxPct - 1e-9);
    if (!(ate > de) || n <= 1) { assert.deepEqual(s, []); return; }
    assert.equal(s.length, n - 1, 'quantidade de sub-degraus');
    const pts = [de, ...s, ate];
    for (let i = 1; i < pts.length; i++) {
      assert.ok(pts[i] > pts[i - 1] - 0.051, 'crescente (tolerancia do arredondamento de 0,1)');
      assert.ok(pts[i] - pts[i - 1] <= p.passoMaxPct + 0.11, 'degrau acima do maximo do perfil: ' + (pts[i] - pts[i - 1]));
    }
    for (const v of s) assert.ok(v > de - 0.051 && v < ate + 0.051, 'fora do intervalo');
  }), cfg);
});

test('subDegraus: diesel, perfil desconhecido, nulo e intervalo invalido nao geram degrau', () => {
  fc.assert(fc.property(pct, pct, fc.constantFrom('diesel', 'inexistente', '', undefined, null), (a, b, id) => {
    assert.deepEqual(P.subDegraus(id, a, b), []);
  }), cfg);
  fc.assert(fc.property(fc.constantFrom(...GAS), pct, (id, a) => { assert.deepEqual(P.subDegraus(id, a, a), []); assert.deepEqual(P.subDegraus(id, a + 50, a), []); }), cfg);
  assert.deepEqual(P.subDegraus('gas', NaN, 100), []); assert.deepEqual(P.subDegraus('gas', 0, NaN), []);
});

test('subDegraus: exemplos do proprio modulo (gas 0 a 30 = [15]; 50 a 100 = [75]; 30 a 50 = []; biometano 50 a 100 = [66,7; 83,3])', () => {
  assert.deepEqual(P.subDegraus('gas', 0, 30), [15]); assert.deepEqual(P.subDegraus('gas', 50, 100), [75]);
  assert.deepEqual(P.subDegraus('gas', 30, 50), []); assert.deepEqual(P.subDegraus('gas', 0, 25), []); assert.deepEqual(P.subDegraus('gas', 0, 25.5), [12.8]);
  assert.deepEqual(P.subDegraus('biometano', 50, 100), [66.7, 83.3]); assert.deepEqual(P.subDegraus('biometano', 0, 20), []);
});

const leitura = fc.record({ esperouS: fc.double({ min: 0, max: 400, noNaN: true }), freqHz: fc.double({ min: -10, max: 80, noNaN: true }), freqNomHz: fc.constantFrom(50, 60, 0, -1, NaN, Infinity) });

test('liberaProximo: diesel sempre libera', () => {
  fc.assert(fc.property(leitura, e => { const r = P.liberaProximo('diesel', e); assert.deepEqual(r, { libera: true, desiste: false, motivo: '' }); }), cfg);
  assert.equal(P.liberaProximo(undefined, { esperouS: 0 }).libera, true);
});

test('liberaProximo: antes da pausa minima NUNCA libera nem desiste (mesmo com frequencia boa)', () => {
  fc.assert(fc.property(fc.constantFrom(...GAS), fc.double({ min: 0, max: 0.999, noNaN: true }), fc.double({ min: 50, max: 60, noNaN: true }), (id, fr, hz) => {
    const p = P.PERFIS[id], r = P.liberaProximo(id, { esperouS: p.pausaS * fr, freqHz: hz, freqNomHz: hz });
    assert.equal(r.libera, false); assert.equal(r.desiste, false); assert.match(r.motivo, /pausa mínima/);
  }), cfg);
});

test('liberaProximo: SEM leitura valida de frequencia nunca libera (falha segura: nao adiciona carga as cegas)', () => {
  const ruim = fc.constantFrom(NaN, undefined, null, 0, -5, Infinity, -Infinity, 'abc');
  fc.assert(fc.property(fc.constantFrom(...GAS), fc.double({ min: 0, max: 400, noNaN: true }), ruim, ruim, fc.boolean(), (id, t, f, fn, ruimF) => {
    const p = P.PERFIS[id], e = ruimF ? { esperouS: t, freqHz: f, freqNomHz: 60 } : { esperouS: t, freqHz: 60, freqNomHz: fn };
    const r = P.liberaProximo(id, e);
    assert.equal(r.libera, false, 'liberou sem leitura valida');
    if (t >= p.pausaS) assert.match(r.motivo, /sem leitura de frequência/);
  }), cfg);
});

test('liberaProximo: com leitura valida libera se e so se pausa cumprida e frequencia >= minimo; desiste so quando nao libera e passou pausa + espera maxima', () => {
  fc.assert(fc.property(fc.constantFrom(...GAS), fc.constantFrom(50, 60), fc.double({ min: 0, max: 400, noNaN: true }), fc.double({ min: 40, max: 70, noNaN: true }), (id, fn, t, f) => {
    const p = P.PERFIS[id], r = P.liberaProximo(id, { esperouS: t, freqHz: f, freqNomHz: fn });
    const minHz = Math.round(fn * p.freqMinPct / 100 * 100) / 100;
    const deveLiberar = t >= p.pausaS && !(f < minHz);
    assert.equal(r.libera, deveLiberar, `t=${t} f=${f} min=${minHz}`);
    assert.equal(r.desiste, !deveLiberar && t >= p.pausaS && t > p.pausaS + p.maxEsperaS, `desiste t=${t}`);
    if (r.libera) assert.equal(r.desiste, false);
    if (!r.libera) assert.ok(r.motivo.length > 0, 'quem nao libera explica por que');
  }), cfg);
});

test('liberaProximo: nos limites exatos (pausa, frequencia minima, pausa + espera maxima)', () => {
  for (const id of GAS) {
    const p = P.PERFIS[id], minHz = Math.round(60 * p.freqMinPct) / 100;
    assert.equal(P.liberaProximo(id, { esperouS: p.pausaS, freqHz: minHz, freqNomHz: 60 }).libera, true, 'exatamente na pausa e na frequencia minima libera');
    assert.equal(P.liberaProximo(id, { esperouS: p.pausaS - 0.001, freqHz: 60, freqNomHz: 60 }).libera, false);
    assert.equal(P.liberaProximo(id, { esperouS: p.pausaS, freqHz: minHz - 0.01, freqNomHz: 60 }).libera, false);
    const fim = p.pausaS + p.maxEsperaS;
    assert.equal(P.liberaProximo(id, { esperouS: fim, freqHz: minHz - 1, freqNomHz: 60 }).desiste, false, 'no tempo maximo ainda espera');
    assert.equal(P.liberaProximo(id, { esperouS: fim + 0.001, freqHz: minHz - 1, freqNomHz: 60 }).desiste, true, 'passou do tempo maximo: desiste');
  }
});

const chaves = fc.uniqueArray(fc.record({ id: fc.integer({ min: 1, max: 60 }), kw: fc.oneof(fc.constantFrom(0.5, 1, 2, 3, 4, 5, 10, 25, 50, 100), fc.double({ min: 0.1, max: 150, noNaN: true })) }), { selector: c => c.id, maxLength: 24 });

test('planoDescida: cada chave aparece UMA vez, grupos nao vazios, kW restante decresce ate 0 e bate com a soma das chaves que faltam abrir', () => {
  fc.assert(fc.property(fc.constantFrom(...GAS), fc.double({ min: 10, max: 1000, noNaN: true }), chaves, (id, kw100, ch) => {
    const p = P.PERFIS[id], r = P.planoDescida(id, kw100, ch);
    if (!ch.length) { assert.deepEqual(r, { grupos: [], pausaS: 0 }); return; }
    assert.equal(r.pausaS, p.descida.pausaS);
    const todos = r.grupos.flatMap(g => g.abre);
    assert.deepEqual([...todos].sort((a, b) => a - b), ch.map(c => c.id).sort((a, b) => a - b), 'todas as chaves, cada uma exatamente uma vez');
    const kwDe = Object.fromEntries(ch.map(c => [c.id, c.kw])); let falta = ch.reduce((s, c) => s + c.kw, 0);
    r.grupos.forEach((g, i) => {
      assert.ok(g.abre.length >= 1, 'grupo vazio');
      falta -= g.abre.reduce((s, id2) => s + kwDe[id2], 0);
      assert.ok(Math.abs(g.kwDepois - (i === r.grupos.length - 1 ? 0 : falta)) < 0.011, `kwDepois do grupo ${i}: ${g.kwDepois} esperado ${falta}`);
    });
    assert.equal(r.grupos[r.grupos.length - 1].kwDepois, 0);
  }), cfg);
});

test('planoDescida: cada grupo (exceto quando a chave sozinha ja passa do passo) tira no maximo o passo; a ordem e da maior para a menor chave', () => {
  fc.assert(fc.property(fc.constantFrom(...GAS), fc.double({ min: 10, max: 1000, noNaN: true }), chaves, (id, kw100, ch) => {
    if (!ch.length) return;
    const p = P.PERFIS[id], passo = kw100 * p.descida.passoPct / 100, kwDe = Object.fromEntries(ch.map(c => [c.id, c.kw])), r = P.planoDescida(id, kw100, ch);
    r.grupos.slice(0, -1).forEach(g => { const t = g.abre.reduce((s, i) => s + kwDe[i], 0); assert.ok(g.abre.length === 1 || t <= passo + 1e-6, `grupo tira ${t} > passo ${passo}`); });
    const ordem = r.grupos.flatMap(g => g.abre).map(i => kwDe[i]);
    assert.equal(r.grupos.length >= 1, true);
    for (let i = 1; i < ordem.length; i++) if (r.grupos.some(g => g.abre.includes(ch[0].id))) { /* a ordem total so e decrescente dentro de cada grupo e entre grupos seguintes: conferido abaixo */ }
    for (let g = 1; g < r.grupos.length; g++) { const ant = Math.min(...r.grupos[g - 1].abre.map(i => kwDe[i])), atu = Math.max(...r.grupos[g].abre.map(i => kwDe[i])); assert.ok(atu <= ant + 1e-9, 'grupo seguinte tem chave maior que a do anterior'); }
  }), cfg);
});

test('planoDescida: diesel (ou sem kW a 100 %, ou chaves sem kW) abre tudo de uma vez; chaves invalidas sao ignoradas', () => {
  fc.assert(fc.property(chaves, ch => {
    if (!ch.length) return;
    const r = P.planoDescida('diesel', 100, ch); assert.equal(r.grupos.length, 1); assert.equal(r.pausaS, 0); assert.deepEqual(r.grupos[0], { abre: [...ch].sort((a, b) => b.kw - a.kw).map(c => c.id), kwDepois: 0 });
  }), cfg);
  const ch = [{ id: 1, kw: 5 }, { id: 2, kw: 5 }];
  for (const kw100 of [0, -1, NaN, undefined]) assert.equal(P.planoDescida('gas', kw100, ch).grupos.length, 1, 'sem kW a 100 %: tudo de uma vez');
  assert.deepEqual(P.planoDescida('gas', 100, [null, { id: 1, kw: 0 }, { id: 2, kw: -3 }, undefined]), { grupos: [], pausaS: 0 });
  assert.deepEqual(P.planoDescida('gas', 100, undefined), { grupos: [], pausaS: 0 });
  assert.deepEqual(P.planoDescida('gas', 100, [{ id: 7, kw: 12 }]), { grupos: [{ abre: [7], kwDepois: 0 }], pausaS: 10 });
});

test('get / ehDiesel: perfil desconhecido vira diesel; so gas e biometano tem portao', () => {
  assert.equal(P.get('xyz').id, 'diesel'); assert.equal(P.get().id, 'diesel'); assert.equal(P.ehDiesel(P.get('gas')), false); assert.equal(P.ehDiesel(P.get('biometano')), false);
  assert.equal(P.ehDiesel(null), true); assert.equal(P.ehDiesel({ id: 'x', passoMaxPct: 0 }), true); assert.equal(P.ehDiesel({ id: 'diesel', passoMaxPct: 30 }), true);
});

// ---- exemplos exatos (matam mutantes de fronteira que as propriedades gerais nao distinguem) ----
test('PERFIS: os valores de seguranca (ASSUMIDOS, confirmar com a engenharia) ficam travados: mudar um deles tem que ser decisao explicita', () => {
  assert.deepEqual(P.PERFIS.diesel, { id: 'diesel', nome: 'Diesel (padrão)', passoMaxPct: null, pausaS: null, portao: false, freqMinPct: null, maxEsperaS: null, descida: null, resumo: P.PERFIS.diesel.resumo });
  const g = P.PERFIS.gas, b = P.PERFIS.biometano;
  assert.deepEqual([g.passoMaxPct, g.pausaS, g.portao, g.freqMinPct, g.maxEsperaS, g.descida], [25, 10, true, 97, 60, { passoPct: 50, pausaS: 10 }]);
  assert.deepEqual([b.passoMaxPct, b.pausaS, b.portao, b.freqMinPct, b.maxEsperaS, b.descida], [20, 15, true, 97.5, 90, { passoPct: 25, pausaS: 15 }]);
  assert.deepEqual(Object.keys(P.PERFIS), ['diesel', 'gas', 'biometano']);
});

test('perfil passado como OBJETO (nao so como nome) e respeitado', () => {
  const custom = { id: 'x', passoMaxPct: 10, pausaS: 5, portao: true, freqMinPct: 90, maxEsperaS: 20, descida: { passoPct: 10, pausaS: 3 } };
  assert.deepEqual(P.subDegraus(custom, 0, 30), [10, 20]);
  assert.equal(P.liberaProximo(custom, { esperouS: 4, freqHz: 60, freqNomHz: 60 }).libera, false);
  assert.equal(P.liberaProximo(custom, { esperouS: 5, freqHz: 54, freqNomHz: 60 }).libera, true);
  assert.equal(P.liberaProximo(custom, { esperouS: 5, freqHz: 53.99, freqNomHz: 60 }).libera, false);
  assert.deepEqual(P.planoDescida(custom, 100, [{ id: 1, kw: 10 }, { id: 2, kw: 10 }, { id: 3, kw: 10 }]), { grupos: [{ abre: [1], kwDepois: 20 }, { abre: [2], kwDepois: 10 }, { abre: [3], kwDepois: 0 }], pausaS: 3 });
});

test('liberaProximo: as mensagens dizem quanto falta e por que espera', () => {
  assert.equal(P.liberaProximo('gas', { esperouS: 4, freqHz: 60, freqNomHz: 60 }).motivo, 'pausa mínima de 10 s entre degraus (faltam 6 s)');
  assert.equal(P.liberaProximo('gas', { esperouS: 12, freqHz: 58, freqNomHz: 60 }).motivo, 'frequência 58 Hz abaixo do mínimo de 58.2 Hz: espera recuperar');
  assert.equal(P.liberaProximo('gas', { esperouS: 71, freqHz: 58, freqNomHz: 60 }).motivo, 'frequência 58 Hz abaixo do mínimo de 58.2 Hz: espera recuperar (esperou 71 s, limite 70 s)');
  assert.equal(P.liberaProximo('biometano', { esperouS: 20, freqHz: NaN, freqNomHz: 60 }).motivo, 'sem leitura de frequência: não adiciona carga às cegas');
  assert.equal(P.liberaProximo('biometano', { esperouS: 106, freqHz: NaN, freqNomHz: 60 }).motivo, 'sem leitura de frequência: não adiciona carga às cegas (esperou 106 s, limite 105 s)');
});

test('planoDescida: exemplos exatos (passo, soma no limite, chave maior que o passo, ordem)', () => {
  const k = (...v) => v.map((kw, i) => ({ id: i + 1, kw }));
  // gas: passo = 50 % de 100 kW = 50 kW. Total 50 exatamente = um grupo so
  assert.deepEqual(P.planoDescida('gas', 100, k(10, 10, 10, 10, 10)), { grupos: [{ abre: [1, 2, 3, 4, 5], kwDepois: 0 }], pausaS: 10 });
  // total 100: tira 50 no primeiro grupo, o resto no ultimo
  assert.deepEqual(P.planoDescida('gas', 100, k(50, 50)), { grupos: [{ abre: [1], kwDepois: 50 }, { abre: [2], kwDepois: 0 }], pausaS: 10 });
  assert.deepEqual(P.planoDescida('gas', 100, k(20, 20, 20, 20, 20)), { grupos: [{ abre: [1, 2], kwDepois: 60 }, { abre: [3, 4], kwDepois: 20 }, { abre: [5], kwDepois: 0 }], pausaS: 10 });
  // chave maior que o passo sai sozinha (sempre progride); a ordem e da maior para a menor
  assert.deepEqual(P.planoDescida('gas', 100, k(5, 80, 5)), { grupos: [{ abre: [2], kwDepois: 10 }, { abre: [1, 3], kwDepois: 0 }], pausaS: 10 });
  assert.deepEqual(P.planoDescida('biometano', 100, k(30, 30, 30, 30)), { grupos: [{ abre: [1], kwDepois: 90 }, { abre: [2], kwDepois: 60 }, { abre: [3], kwDepois: 30 }, { abre: [4], kwDepois: 0 }], pausaS: 15 });
  // total um pouco acima do limite de 0,01 % ainda e um grupo so (tolerancia de arredondamento)
  assert.equal(P.planoDescida('gas', 100, [{ id: 1, kw: 25 }, { id: 2, kw: 25.004 }]).grupos.length, 1);
  assert.equal(P.planoDescida('gas', 100, [{ id: 1, kw: 25 }, { id: 2, kw: 25.1 }]).grupos.length, 2);
});

test('subDegraus: fronteiras do numero de degraus (n = 1 nao gera nada; n = 2 gera 1)', () => {
  assert.deepEqual(P.subDegraus('gas', 0, 25), []); assert.deepEqual(P.subDegraus('gas', 0, 25.2), [12.6]); assert.deepEqual(P.subDegraus('gas', 0, 50), [25]);
  assert.deepEqual(P.subDegraus('gas', 10, 10.5), []); assert.deepEqual(P.subDegraus('gas', 5, 4), []);
});

test('planoDescida: soma exatamente no passo entra no grupo (fronteira) e perfil sem "descida" abre tudo de uma vez sem quebrar', () => {
  const k = (...v) => v.map((kw, i) => ({ id: i + 1, kw }));
  assert.deepEqual(P.planoDescida('gas', 100, k(25, 25, 25, 25)), { grupos: [{ abre: [1, 2], kwDepois: 50 }, { abre: [3, 4], kwDepois: 0 }], pausaS: 10 });
  const semDescida = { id: 'x', passoMaxPct: 10, pausaS: 5, portao: true, freqMinPct: 90, maxEsperaS: 20 };      // nao e diesel, mas nao tem descida
  assert.deepEqual(P.planoDescida(semDescida, 100, k(30, 30)), { grupos: [{ abre: [1, 2], kwDepois: 0 }], pausaS: 0 });
});
