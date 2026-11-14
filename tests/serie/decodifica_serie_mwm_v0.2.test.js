'use strict';
// Teste do decodificador de número de série MWM (ETD 091 rev.05 e ETD 094 rev.00). Exemplos tirados das próprias normas.
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { decodificaSerie } = require('../../dashboard/modulos-fonte/decodifica_serie_mwm_v0.2.js');

describe('gerador (ETD 091)', () => {
  test('exemplo 5.1: GDWAØ4447', () => {
    const r = decodificaSerie('GDWAØ4447');
    assert.equal(r.valido, true); assert.equal(r.tipo, 'gerador');
    assert.equal(r.combustivel.descricao, 'Gás natural');
    assert.match(r.motor.descricao, /12 \(2V\).*4 cil/);
    assert.equal(r.alternador.descricao, 'WEG');
    assert.equal(r.controlador.descricao, 'Deep Sea 4520');
    assert.equal(r.sequencial, 4447);
  });
  test('exemplo 5.2: DRCBØ4447 (diesel, 229-3 3,1 L, Cramaco, DSE 7320)', () => {
    const r = decodificaSerie('DRCBØ4447');
    assert.equal(r.valido, true);
    assert.match(r.motor.descricao, /229.*3 cil.*3,1/);
    assert.equal(r.alternador.descricao, 'Cramaco'); assert.equal(r.controlador.descricao, 'Deep Sea 7320');
  });
  test('exemplo 5.3: DTMFØ4447 (Yanmar, Mecc Alte, AGC150)', () => {
    const r = decodificaSerie('DTMFØ4447');
    assert.equal(r.valido, true);
    assert.match(r.motor.descricao, /Yanmar/); assert.equal(r.alternador.descricao, 'Mecc Alte'); assert.equal(r.controlador.descricao, 'Deif AGC150');
  });
  test('aceita * do código de barras, espaços, minúsculas e zero normal no lugar do Ø', () => {
    for (const s of ['*DTMFØ4447*', ' dtmf04447 ', '*DTMF04447*']) {
      const r = decodificaSerie(s); assert.equal(r.valido, true, s); assert.equal(r.normalizado, 'DTMF04447');
    }
  });
  test('Tabela V: sequenciais 28, 301, 5900, 11196', () => {
    assert.equal(decodificaSerie('DTMFØØØ28').sequencial, 28);
    assert.equal(decodificaSerie('DTMFØØ3Ø1').sequencial, 301);
    assert.equal(decodificaSerie('DTMFØ59ØØ').sequencial, 5900);
    assert.equal(decodificaSerie('DTMF11196').sequencial, 11196);
  });
  test('letra de motor desconhecida: continua válido, com aviso', () => {
    const r = decodificaSerie('DQMF00001');
    assert.equal(r.valido, true); assert.equal(r.motor.conhecido, false); assert.equal(r.motor.codigo, 'Q');
    assert.ok(r.avisos.some(a => /motor/i.test(a)));
  });
  test('combustível inexistente invalida', () => {
    const r = decodificaSerie('XTMF00001'); assert.equal(r.valido, false);
  });
  test('G antes de 14/12/2021 avisa possível biogás; B ou data nova não avisa', () => {
    assert.ok(decodificaSerie('GDWA00001', { dataFabricacao: '2021-06-01' }).avisos.some(a => /biog/i.test(a)));
    assert.ok(!decodificaSerie('GDWA00001', { dataFabricacao: '2022-03-01' }).avisos.some(a => /biog/i.test(a)));
    assert.ok(!decodificaSerie('GDWA00001').avisos.some(a => /biog/i.test(a)));
  });
  test('antes de 29/12/2020 avisa estrutura antiga', () => {
    assert.ok(decodificaSerie('DTMF00001', { dataFabricacao: new Date('2020-05-01T00:00:00Z') }).avisos.some(a => /estrutura antiga/.test(a)));
  });
});

describe('v0.2: NS do MES com S na frente (10 caracteres)', () => {
  test('SDFWA01715: S vira prefixoMes (com aviso) e o resto decodifica pela ETD 091', () => {
    const r = decodificaSerie('SDFWA01715');
    assert.equal(r.valido, true); assert.equal(r.tipo, 'gerador'); assert.equal(r.prefixoMes, 'S');
    assert.equal(r.combustivel.descricao, 'Diesel'); assert.match(r.motor.descricao, /12 \(2V\).*6 cil.*7,2/);
    assert.equal(r.alternador.descricao, 'WEG'); assert.equal(r.controlador.descricao, 'Deep Sea 4520'); assert.equal(r.sequencial, 1715);
    assert.ok(r.avisos.some(a => /Prefixo "S"/.test(a)));
  });
  test('9 caracteres seguem sem prefixo; outra letra na frente (10 caracteres) e invalida; 23 caracteres e invalido', () => {
    assert.equal(decodificaSerie('DFWA01715').prefixoMes, null);
    assert.equal(decodificaSerie('XDFWA01715').valido, false);
    assert.equal(decodificaSerie('M9MGD26060019SDFWA01715').valido, false);
  });
});

describe('torre (ETD 094)', () => {
  test('exemplo 5.1: DTMØ4447 (diesel, Yanmar, Mecc Alte)', () => {
    const r = decodificaSerie('DTMØ4447');
    assert.equal(r.valido, true); assert.equal(r.tipo, 'torre');
    assert.equal(r.fonteEnergia.descricao, 'Motor diesel'); assert.match(r.motor.descricao, /Yanmar/); assert.equal(r.alternador.descricao, 'Mecc Alte'); assert.equal(r.sequencial, 4447);
  });
  test('exemplos 5.2 e 5.3: solar e bateria sem motor e sem alternador', () => {
    const s = decodificaSerie('SNNØ4447'), b = decodificaSerie('BNNØ4447');
    assert.equal(s.fonteEnergia.descricao, 'Painel solar'); assert.equal(b.fonteEnergia.descricao, 'Bateria');
    assert.equal(s.motor.descricao, 'Sem motor'); assert.equal(b.alternador.descricao, 'Sem alternador');
  });
});

describe('entradas inválidas (nunca lançam erro)', () => {
  for (const [nome, v] of [['vazio', ''], ['nulo', null], ['indefinido', undefined], ['tamanho 7', 'DTMF123'], ['10 caracteres', 'DTMFA000001'],
    ['letras no sequencial', 'DTMFABCDE'], ['símbolo', 'DTMF-4447X'], ['dígito onde deveria ser letra', 'D1MF00001']]) {
    test(nome, () => { const r = decodificaSerie(v); assert.equal(r.valido, false); assert.ok(r.erros.length > 0); });
  }
});
