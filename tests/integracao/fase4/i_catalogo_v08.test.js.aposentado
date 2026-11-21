'use strict';
// 10/11/2026 - catalogo v0.8 + medidor 1.10.192. Prova: (1) todo arquivo do catalogo e do "apoio" existe na pasta (menu_dev fica em modulos-fonte e e copiado junto); (2) o catalogo aponta para
// gerenciador_logs v1.9, grafico_ensaio v0.13 e medidor 1.10.192; (3) o medidor 1.10.192 carrega esse catalogo; (4) o catalogo nao tem IP. A mesma bateria no catalogo v0.7 / medidor 1.10.190 tem que FALHAR
// (BT2_CAT=catalogo_ferramentas_v0.7.js BT2_MED=medidor_gerador_v1.10.190.html).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path'), vm = require('vm');
const F = path.join(__dirname, '..', '..', '..', 'dashboard', 'ferramentas'), MS = path.join(__dirname, '..', '..', '..', 'dashboard', 'modulos-fonte');
const CAT = process.env.BT2_CAT || 'catalogo_ferramentas_v0.8.js', MED = process.env.BT2_MED || 'medidor_gerador_v1.10.192.html';
const cat = () => { const w = {}; vm.runInNewContext(fs.readFileSync(path.join(F, CAT), 'utf8'), { window: w }); return w.CATALOGO_FERRAMENTAS; };
test('todo arquivo do catalogo existe', () => {
  const c = cat(); for (const i of c.itens) assert.ok(fs.existsSync(path.join(F, i.arquivo)), 'falta ' + i.arquivo);
  for (const a of c.apoio) assert.ok(fs.existsSync(path.join(F, a)) || fs.existsSync(path.join(MS, a)), 'falta apoio ' + a);
});
test('aponta para as versoes novas e sem IP', () => {
  const c = cat(), por = id => c.itens.find(i => i.id === id).arquivo;
  assert.equal(por('gerenciador'), 'gerenciador_logs_v1.9.html'); assert.equal(por('grafico'), 'grafico_ensaio_v0.13.html'); assert.equal(por('medidor'), 'medidor_gerador_v1.10.192.html');
  assert.ok(!/\b172\.17\.\d+\.\d+\b/.test(fs.readFileSync(path.join(F, CAT), 'utf8')));
});
test('o medidor carrega o catalogo v0.8', () => {
  const t = fs.readFileSync(path.join(F, MED), 'utf8'); assert.ok(t.includes('<script src="catalogo_ferramentas_v0.8.js"></script>'), 'o medidor nao carrega o catalogo v0.8');
});
