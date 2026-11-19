'use strict';
/* =====================================================================================================================
   decodifica_serie_mwm.prop.test.js — TESTES DE PROPRIEDADES (fast-check) do decodificador do numero de serie MWM · Passo 7 · 19/11/2026.
   PARA QUE SERVE (leigo): o numero de serie preenche os dados do ensaio. Aqui o computador inventa milhares de series (certas, erradas e absurdas) e confere que: nunca da erro,
   so aceita o formato da norma, a letra de combustivel desconhecida invalida, as demais letras desconhecidas so AVISAM, e os avisos de data aparecem nos dias certos.
   ORACULO: os codigos das tabelas da ETD 091 rev.05 (gerador) e ETD 094 rev.00 (torre) estao escritos aqui de forma independente do modulo.
   COMO RODAR: npm --prefix tests/propriedades ci && node --test tests/propriedades/*.test.js
   ===================================================================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fc = require('fast-check');
const S = require('../../dashboard/modulos-fonte/decodifica_serie_mwm_v0.3.js');
const cfg = { numRuns: +process.env.FC_RUNS || 500, seed: +process.env.FC_SEED || 20261119 };
const GER = { comb: 'DGB', motor: 'ABCRHWDFUYSVMTKZ', alt: 'WCMFN', ctrl: 'ABCDEFN' }, TOR = { fonte: 'DSB', motor: 'TKN', alt: 'MN' };
const LETRA = fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), DIG5 = fc.integer({ min: 0, max: 99999 }).map(n => String(n).padStart(5, '0'));
const ger = fc.tuple(LETRA, LETRA, LETRA, LETRA, DIG5).map(([a, b, c, d, n]) => a + b + c + d + n);
const tor = fc.tuple(LETRA, LETRA, LETRA, DIG5).map(([a, b, c, n]) => a + b + c + n);
const gerOk = fc.tuple(fc.constantFrom(...GER.comb), fc.constantFrom(...GER.motor), fc.constantFrom(...GER.alt), fc.constantFrom(...GER.ctrl), DIG5).map(([a, b, c, d, n]) => a + b + c + d + n);

test('NUNCA lanca erro e sempre devolve a forma combinada, qualquer que seja a entrada (texto, numero, objeto, nulo)', () => {
  fc.assert(fc.property(fc.anything(), fc.anything(), (t, o) => {
    const r = S.decodificaSerie(t, o);
    assert.equal(typeof r.valido, 'boolean'); assert.ok(Array.isArray(r.erros) && Array.isArray(r.avisos)); assert.equal(typeof r.normalizado, 'string'); assert.equal(typeof r.bruto, 'string');
    assert.equal(r.valido, r.erros.length === 0 && (r.tipo === 'gerador' || r.tipo === 'torre'), 'valido <=> sem erros e com tipo');
  }), cfg);
  for (const x of [undefined, null, '', '   ', '***', 0, NaN, {}, [], Symbol.iterator.toString()]) { const r = S.decodificaSerie(x); assert.equal(r.valido, false); assert.ok(r.erros.length > 0); }
  assert.equal(S.decodificaSerie(null).bruto, ''); assert.equal(S.decodificaSerie(undefined).bruto, ''); assert.equal(S.decodificaSerie(12345).bruto, '12345');
});

test('normaliza: tira espacos e *, troca o zero cortado por 0, poe em maiusculas, e e idempotente', () => {
  fc.assert(fc.property(fc.string(), t => { const n = S.normaliza(t); assert.equal(S.normaliza(n), n); assert.ok(!/[\s*Øø∅a-z]/.test(n.replace(/[^\x00-\x7F]/g, ''))); }), cfg);
  assert.equal(S.normaliza('*gdwaØ4447*'), 'GDWA04447'); assert.equal(S.normaliza(' g d w a ø 4 4 4 7 '), 'GDWA04447'); assert.equal(S.normaliza('a∅b'), 'A0B');
  assert.equal(S.normaliza(null), ''); assert.equal(S.normaliza(undefined), '');
});

test('decodificar a serie "suja" (espacos, *, minusculas, zero cortado) da o mesmo resultado que a limpa', () => {
  fc.assert(fc.property(ger, fc.boolean(), fc.boolean(), (s, minus, estrela) => {
    const suja = (estrela ? '*' : '') + (minus ? s.toLowerCase() : s).replace(/0/g, 'Ø').split('').join(' ') + (estrela ? '*' : '');
    const a = S.decodificaSerie(s), b = S.decodificaSerie(suja);
    assert.equal(b.normalizado, s); assert.deepEqual({ ...b, bruto: '' }, { ...a, bruto: '' });
  }), cfg);
});

test('so existe serie valida com 9 caracteres (4 letras + 5 digitos) ou 8 (3 letras + 5 digitos); o resto e invalido com erro', () => {
  fc.assert(fc.property(fc.stringMatching(/^[A-Z0-9]{0,14}$/), s => {
    const r = S.decodificaSerie(s);
    const formaGer = /^[A-Z]{4}\d{5}$/.test(s), formaTor = /^[A-Z]{3}\d{5}$/.test(s);
    if (!formaGer && !formaTor) { assert.equal(r.valido, false); assert.ok(r.erros.length > 0); assert.equal(r.tipo, null); }
    else assert.equal(r.tipo, formaGer ? 'gerador' : 'torre');
  }), cfg);
  assert.match(S.decodificaSerie('ABC1234').erros[0], /Tamanho inválido: 7/); assert.match(S.decodificaSerie('GDWAB44470').erros[0], /Tamanho inválido: 10/);
  assert.match(S.decodificaSerie('GDW444470').erros[0], /4 letras seguidas de 5 dígitos/); assert.match(S.decodificaSerie('GD-A04447').erros[0], /caracteres inválidos/);
  assert.match(S.decodificaSerie('GD444470').erros[0], /3 letras seguidas de 5 dígitos/); assert.match(S.decodificaSerie('').erros[0], /vazio/);
});

test('GERADOR: campos, tabelas e regra do combustivel (desconhecido INVALIDA; motor/alternador/controlador desconhecidos so AVISAM)', () => {
  fc.assert(fc.property(ger, s => {
    const r = S.decodificaSerie(s);
    assert.equal(r.tipo, 'gerador'); assert.equal(r.norma, 'ETD 091 rev.05'); assert.equal(r.prefixo, s.slice(0, 4)); assert.equal(r.sequencial, parseInt(s.slice(4), 10));
    const c = [[r.combustivel, s[0], GER.comb], [r.motor, s[1], GER.motor], [r.alternador, s[2], GER.alt], [r.controlador, s[3], GER.ctrl]];
    for (const [campo, letra, tab] of c) { assert.equal(campo.codigo, letra); assert.equal(campo.conhecido, tab.includes(letra)); assert.equal(campo.descricao !== null, campo.conhecido); }
    assert.equal(r.valido, GER.comb.includes(s[0]), 'so o combustivel desconhecido invalida');
    assert.equal(r.erros.length, GER.comb.includes(s[0]) ? 0 : 1);
    const av = r.avisos.join('|');
    assert.equal(/Família de motor/.test(av), !GER.motor.includes(s[1])); assert.equal(/Alternador/.test(av), !GER.alt.includes(s[2])); assert.equal(/Controlador/.test(av), !GER.ctrl.includes(s[3]));
    assert.equal(/Sequencial 00000/.test(av), r.sequencial === 0);
    assert.ok(!/Fabricado antes|Letra G antes/.test(av), 'sem data nao ha aviso de data');
  }), cfg);
  const d = S.decodificaSerie('DWCA00001'); assert.equal(d.combustivel.descricao, 'Diesel'); assert.equal(d.motor.descricao, 'Série 229 · 6 cil · 6,2 L'); assert.equal(d.alternador.descricao, 'Cramaco'); assert.equal(d.controlador.descricao, 'Deep Sea 4520'); assert.deepEqual(d.avisos, []);
  const g = S.decodificaSerie('GDWAØ4447'); assert.equal(g.valido, true); assert.equal(g.combustivel.descricao, 'Gás natural'); assert.equal(g.sequencial, 4447);
});

test('TORRE: campos, tabelas e regra da fonte de energia (desconhecida INVALIDA; motor/alternador so avisam)', () => {
  fc.assert(fc.property(tor, s => {
    const r = S.decodificaSerie(s);
    assert.equal(r.tipo, 'torre'); assert.equal(r.norma, 'ETD 094 rev.00'); assert.equal(r.prefixo, s.slice(0, 3)); assert.equal(r.sequencial, parseInt(s.slice(3), 10));
    for (const [campo, letra, tab] of [[r.fonteEnergia, s[0], TOR.fonte], [r.motor, s[1], TOR.motor], [r.alternador, s[2], TOR.alt]]) { assert.equal(campo.codigo, letra); assert.equal(campo.conhecido, tab.includes(letra)); }
    assert.equal(r.valido, TOR.fonte.includes(s[0])); assert.equal(r.controlador, undefined);
    const av = r.avisos.join('|');
    assert.equal(/Família de motor/.test(av), !TOR.motor.includes(s[1])); assert.equal(/Alternador/.test(av), !TOR.alt.includes(s[2])); assert.equal(/Sequencial 00000/.test(av), r.sequencial === 0);
  }), cfg);
  const t = S.decodificaSerie('DTM12345'); assert.equal(t.valido, true); assert.equal(t.fonteEnergia.descricao, 'Motor diesel'); assert.equal(t.motor.descricao.startsWith('Yanmar'), true); assert.equal(t.alternador.descricao, 'Mecc Alte');
});

test('AVISOS DE DATA: estrutura antiga antes de 2020-12-29; letra G antes de 2021-12-14; so para gerador e so com data; Date e texto valem', () => {
  fc.assert(fc.property(gerOk, fc.date({ min: new Date('2019-01-01'), max: new Date('2023-01-01'), noInvalidDate: true }), (s, dt) => {
    const dia = dt.toISOString().slice(0, 10), r = S.decodificaSerie(s, { dataFabricacao: dia }), av = r.avisos.join('|');
    assert.equal(/Fabricado antes de 29\/12\/2020/.test(av), dia < '2020-12-29', dia);
    assert.equal(/Letra G antes de 14\/12\/2021/.test(av), s[0] === 'G' && dia < '2021-12-14', dia + ' ' + s);
    assert.deepEqual(S.decodificaSerie(s, { dataFabricacao: dt }).avisos, r.avisos, 'Date == texto');
  }), cfg);
  for (const [d, esperaAntiga, esperaG] of [['2020-12-28', true, true], ['2020-12-29', false, true], ['2021-12-13', false, true], ['2021-12-14', false, false]]) {
    const r = S.decodificaSerie('GDWA00001', { dataFabricacao: d }); assert.equal(r.avisos.some(a => /estrutura antiga/.test(a)), esperaAntiga, d); assert.equal(r.avisos.some(a => /Letra G/.test(a)), esperaG, d);
  }
  assert.equal(S.decodificaSerie('DDWA00001', { dataFabricacao: '2019-01-01' }).avisos.some(a => /Letra G/.test(a)), false, 'so a letra G');
  assert.equal(S.decodificaSerie('DTM12345', { dataFabricacao: '2019-01-01' }).avisos.length, 0, 'torre nao tem aviso de data');
  for (const ruim of [undefined, null, '', 'lixo', '2020-13-45', new Date('x'), {}]) assert.equal(S.decodificaSerie('GDWA00001', { dataFabricacao: ruim }).avisos.some(a => /Fabricado|Letra G/.test(a)), false, 'data invalida = sem aviso: ' + String(ruim));
  assert.equal(S.decodificaSerie('GDWA00001', { dataFabricacao: '2020-12-28T10:00:00Z' }).avisos.some(a => /estrutura antiga/.test(a)), true, 'texto ISO completo tambem vale');
  assert.equal(S.decodificaSerie('GDWA00001', { dataFabricacao: new Date('2020-12-29T00:00:00Z') }).avisos.some(a => /estrutura antiga/.test(a)), false);
  assert.equal(S.decodificaSerie('GDWA00001', null).valido, true);
});

test('API: versao, tabelas expostas e uso no navegador (window.MWM_SERIE)', () => {
  assert.equal(S.versao, '0.3'); assert.deepEqual(Object.keys(S.tabelas).sort(), ['GER_ALTERNADOR', 'GER_COMBUSTIVEL', 'GER_CONTROLADOR', 'GER_MOTOR', 'TOR_ALTERNADOR', 'TOR_FONTE', 'TOR_MOTOR']);
  assert.equal(Object.keys(S.tabelas.GER_MOTOR).join(''), GER.motor); assert.equal(Object.keys(S.tabelas.TOR_FONTE).join(''), TOR.fonte);
  const vm = require('vm'), fs = require('fs'), path = require('path'), win = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../../dashboard/modulos-fonte/decodifica_serie_mwm_v0.3.js'), 'utf8'), { window: win });
  assert.equal(typeof win.MWM_SERIE.decodificaSerie, 'function'); assert.equal(win.MWM_SERIE.decodificaSerie('GDWA04447').valido, true);
});
