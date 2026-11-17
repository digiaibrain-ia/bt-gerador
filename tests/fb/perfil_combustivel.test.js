'use strict';
// FB filho "perfil de combustivel" v0.1: funcoes puras. Rodar: node --test tests/fb/perfil_combustivel.test.js
const { test } = require('node:test'); const assert = require('node:assert/strict');
const P = require('../../dashboard/modulos-fonte/fb_perfil_combustivel_v0.1.js');
test('diesel: nada muda (sem sub-degraus, portao sempre libera, descida em 1 grupo)', () => {
  assert.deepEqual(P.subDegraus('diesel', 0, 100), []);
  assert.equal(P.liberaProximo('diesel', { esperouS: 0, freqHz: 10, freqNomHz: 60 }).libera, true);
  assert.deepEqual(P.planoDescida('diesel', 40, [{ id: 'a', kw: 5 }, { id: 'b', kw: 4 }]).grupos.length, 1);
});
test('gas (25): degraus IGUAIS de no maximo 25 pontos: 0->30 = [15]; 50->100 = [75]; 30->50 e 100->107 sem sub-degrau', () => {
  assert.deepEqual(P.subDegraus('gas', 0, 30), [15]); assert.deepEqual(P.subDegraus('gas', 50, 100), [75]);
  assert.deepEqual(P.subDegraus('gas', 30, 50), []); assert.deepEqual(P.subDegraus('gas', 100, 107), []);
});
test('biometano (20): 50->100 = 3 degraus iguais (66,7 e 83,3); 0->30 = [15]; nenhum degrau passa de 20 pontos', () => {
  assert.deepEqual(P.subDegraus('biometano', 50, 100), [66.7, 83.3]); assert.deepEqual(P.subDegraus('biometano', 0, 30), [15]);
  for (const [de, ate] of [[0, 30], [30, 50], [50, 100], [100, 107], [0, 107]]) { const s = [de, ...P.subDegraus('biometano', de, ate), ate]; for (let i = 1; i < s.length; i++) assert.ok(s[i] - s[i - 1] <= 20 + 0.11, de + '->' + ate); }
});
test('subir so vale para cima: ate <= de nao gera sub-degrau', () => { assert.deepEqual(P.subDegraus('gas', 100, 30), []); assert.deepEqual(P.subDegraus('gas', 50, 50), []); });
test('portao do gas: pausa minima, depois frequencia; sem leitura NAO libera (falha segura)', () => {
  const g = (t, f) => P.liberaProximo('gas', { esperouS: t, freqHz: f, freqNomHz: 60 });
  assert.equal(g(3, 60).libera, false); assert.match(g(3, 60).motivo, /pausa mínima/);
  assert.equal(g(10, 60).libera, true); assert.equal(g(10, 58.2).libera, true); assert.equal(g(10, 58.0).libera, false); assert.match(g(10, 58.0).motivo, /abaixo do mínimo/);
  const s = P.liberaProximo('gas', { esperouS: 20, freqHz: null, freqNomHz: 60 }); assert.equal(s.libera, false); assert.match(s.motivo, /sem leitura/);
});
test('portao: passou pausa + maxEspera sem recuperar = DESISTE (nao adiciona carga)', () => {
  const r = P.liberaProximo('gas', { esperouS: 71, freqHz: 55, freqNomHz: 60 }); assert.equal(r.libera, false); assert.equal(r.desiste, true);
  assert.equal(P.liberaProximo('gas', { esperouS: 69, freqHz: 55, freqNomHz: 60 }).desiste, false);
});
test('descida do gas (50 %): grupos de no maximo ~50 % do kW a 100 %, o ultimo leva tudo; progresso garantido mesmo com chave maior que o passo', () => {
  const ch = [5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 3].map((kw, i) => ({ id: 'k' + i, kw }));   // 56 kW
  const d = P.planoDescida('gas', 40, ch); assert.equal(d.pausaS, 10); assert.ok(d.grupos.length >= 2);
  const ids = d.grupos.flatMap(g => g.abre).sort(); assert.deepEqual(ids, ch.map(c => c.id).sort());                 // abre todas, cada uma 1 vez
  assert.equal(d.grupos[d.grupos.length - 1].kwDepois, 0);
  for (const g of d.grupos.slice(0, -1)) assert.ok(g.abre.reduce((s, i) => s + ch.find(c => c.id === i).kw, 0) <= 40 * 0.5 + 1e-9);
  const g1 = P.planoDescida('gas', 40, [{ id: 'g', kw: 30 }, { id: 'h', kw: 30 }]); assert.deepEqual(g1.grupos.flatMap(g => g.abre).sort(), ['g', 'h']);
});
test('perfil desconhecido cai em diesel (falha para o comportamento atual)', () => { assert.equal(P.get('xyz').id, 'diesel'); assert.equal(P.get(undefined).id, 'diesel'); });
