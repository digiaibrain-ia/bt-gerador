// Verifica o padrao de comentarios //[F] (funcionamento) e //[M] (montagem no TIA) na entrega 1200 v0.17.
// Regra: todo comentario // traz a etiqueta; arquivo so ASCII (importacao TIA); cada bloco .scl tem as duas etiquetas.
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
const D = path.join(__dirname, '..', '..', 'plc', 'bt2', 'entrega_1200_v0.17', 'PLC_CARGA_1200');
const arqs = fs.readdirSync(D);
test('entrega tem os blocos esperados', () => {
  for (const n of ['fb_bancosCarga1200_v0.1.scl', 'fb_bancoCarga16_v0.9.scl', 'fb_supervisaoChaves16_v0.9.scl', 'fc_bancosCarga1200_v0.16.scl', 'db3006i_BancosCarga1200_v0.1.db'])
    assert.ok(arqs.includes(n), n);
});
for (const a of arqs) {
  const t = fs.readFileSync(path.join(D, a), 'utf8').replace(/^﻿/, '');
  test('ASCII: ' + a, () => { assert.ok(!/[^\x00-\x7F]/.test(t), 'caractere nao ASCII'); });
  if (!a.endsWith('.scl')) continue;
  test('etiquetas: ' + a, () => {
    const sem = [];
    t.split(/\r?\n/).forEach((l, i) => { if (/\/\//.test(l) && !/\/\/\[(F|M)\]/.test(l)) sem.push((i + 1) + ': ' + l.trim().slice(0, 60)); });
    assert.deepStrictEqual(sem, [], 'comentario sem //[F] ou //[M]');
    assert.ok(/\/\/\[F\]/.test(t) && /\/\/\[M\]/.test(t), 'falta uma das duas etiquetas');
  });
}
test('Ligar Banco seguro: latch com ComOk no wrapper', () => {
  const t = fs.readFileSync(path.join(D, 'fb_bancosCarga1200_v0.1.scl'), 'utf8');
  assert.match(t, /LigarBancoBC56 := "db3007_BC56_Com"\.ligarBanco AND #ComOkBC56 AND NOT #_bloqBC56/);
  assert.match(t, /LigarBancoBC400 := "db3107_BC400_Com"\.ligarBanco AND #ComOkBC400 AND NOT #_bloqBC400/);
});
test('sem PEEK/POKE/DB_ANY nos blocos novos', () => {
  for (const a of arqs.filter(x => x.endsWith('.scl'))) {
    const t = fs.readFileSync(path.join(D, a), 'utf8').split('\n').filter(l => !/^\s*\/\//.test(l) && !/\/\/\[/.test(l.replace(/^[^/]*/, '').slice(0, 0))).join('\n');
    const cod = t.replace(/\/\/.*$/gm, '');
    assert.ok(!/PEEK|POKE|DB_ANY/.test(cod), a);
  }
});
test('fc: uma unica chamada da instancia', () => {
  const t = fs.readFileSync(path.join(D, 'fc_bancosCarga1200_v0.16.scl'), 'utf8').replace(/\/\/.*$/gm, '');
  assert.strictEqual((t.match(/"db3006i_BancosCarga1200"\(/g) || []).length, 1);
});
