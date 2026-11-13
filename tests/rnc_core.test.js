/* tests/rnc_core.test.js — prova as regras do RNC (core) e a gravação (io). Rodar: node --test tests/rnc_core.test.js  · 13/11/2026
   Prova SIMULADA (nada de PLC/DSE). O que depende do PC real (disco, rede, Node-RED de produção) fica para a bancada. */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs'), os = require('os'), path = require('path');
const core = require('../nodered/gerador/rnc/rnc_core_v1.0.js');
const criarArmazem = require('../nodered/gerador/rnc/rnc_io_v1.0.js');

const SERIE = 'M9MGD26060019SDFWA01715';
const novoArm = () => criarArmazem({ fs, path, core, dir: fs.mkdtempSync(path.join(os.tmpdir(), 'rnc-')) });
const abrir = (a, extra) => a.executar(Object.assign({ acao: 'abrir', serial: SERIE, banco: 'BT2', modelo: 'Mod X', tipo_nc: 'DEFEITO', descricao: 'vazamento de óleo', actor: 'Ana' }, extra));
const ev = (a, rnc, rev, event, data, actor) => a.executar({ acao: 'evento', rnc_id: rnc, rev_esperado: rev, event, data, actor: actor === undefined ? 'Beto' : actor });

test('ciclo completo: abre -> reparo -> reteste reprova -> reparo -> reteste aprova -> libera', () => {
  const a = novoArm();
  const r1 = abrir(a); assert.equal(r1.status, 201);
  const id = r1.body.rnc.rnc_id; assert.match(id, /^RNC-\d{4}-0001$/);
  assert.equal(r1.body.situacao, 'BLOQUEADO');
  assert.equal(ev(a, id, 1, 'REPARO_INICIADO').status, 200);
  assert.equal(ev(a, id, 2, 'REPARO_REGISTRADO', { acao: 'troca de junta' }).status, 200); // peça opcional
  let r = ev(a, id, 3, 'RETESTE_REGISTRADO', { resultado: 'REPROVADO' });
  assert.equal(r.body.rnc.estado, 'EM_REPARO'); assert.equal(r.body.situacao, 'BLOQUEADO');
  assert.equal(ev(a, id, 4, 'REPARO_REGISTRADO', { acao: 'troca do retentor', peca: 'retentor 123' }).status, 200);
  r = ev(a, id, 5, 'RETESTE_REGISTRADO', { resultado: 'APROVADO' });
  assert.equal(r.body.rnc.estado, 'LIBERADO'); assert.equal(r.body.situacao, 'LIBERADO');
  assert.equal(r.body.rnc.reparos.length, 2); assert.equal(r.body.rnc.retestes.length, 2);
});

test('rev velha é recusada (409) e não grava', () => {
  const a = novoArm(); const id = abrir(a).body.rnc.rnc_id;
  ev(a, id, 1, 'REPARO_INICIADO');
  const n = a.carregar().length;
  const r = ev(a, id, 1, 'REPARO_INICIADO', null, 'Carla');
  assert.equal(r.status, 409); assert.equal(r.body.rev_atual, 2); assert.equal(a.carregar().length, n);
});

test('não pula estado e valida campos', () => {
  const a = novoArm(); const id = abrir(a).body.rnc.rnc_id;
  assert.equal(ev(a, id, 1, 'RETESTE_REGISTRADO', { resultado: 'APROVADO' }).status, 422); // liberar direto
  assert.equal(ev(a, id, 1, 'REPARO_REGISTRADO', { acao: 'x y z' }).status, 422);          // sem iniciar reparo
  ev(a, id, 1, 'REPARO_INICIADO');
  assert.equal(ev(a, id, 2, 'REPARO_REGISTRADO', { acao: '' }).status, 400);               // reparo sem ação
  assert.equal(ev(a, id, 2, 'REPARO_REGISTRADO', { acao: 'ajuste' }, '').status, 400);     // sem responsável
  ev(a, id, 2, 'REPARO_REGISTRADO', { acao: 'ajuste' });
  assert.equal(ev(a, id, 3, 'RETESTE_REGISTRADO', { resultado: 'TALVEZ' }).status, 400);
});

test('gerador só libera quando TODAS as RNCs da série estão liberadas', () => {
  const a = novoArm();
  const id1 = abrir(a).body.rnc.rnc_id, id2 = abrir(a, { descricao: 'ruído no mancal' }).body.rnc.rnc_id;
  assert.notEqual(id1, id2);
  let rev = 1; for (const [e, d] of [['REPARO_INICIADO'], ['REPARO_REGISTRADO', { acao: 'ok ok' }], ['RETESTE_REGISTRADO', { resultado: 'APROVADO' }]]) { ev(a, id1, rev++, e, d); }
  const s = core.situacaoSerie(a.listar(), SERIE);
  assert.equal(s.situacao, 'BLOQUEADO'); assert.deepEqual(s.pendentes.map(p => p.rnc_id), [id2]);
  rev = 1; for (const [e, d] of [['REPARO_INICIADO'], ['REPARO_REGISTRADO', { acao: 'ok ok' }], ['RETESTE_REGISTRADO', { resultado: 'APROVADO' }]]) { ev(a, id2, rev++, e, d); }
  assert.equal(core.situacaoSerie(a.listar(), SERIE).situacao, 'LIBERADO');
  assert.equal(core.situacaoSerie(a.listar(), 'OUTRASERIE000000000').situacao, 'SEM_RNC');
});

test('série e demais campos inválidos são recusados', () => {
  const a = novoArm();
  assert.equal(abrir(a, { serial: 'AB 1' }).status, 400);
  assert.equal(abrir(a, { banco: 'BT9' }).status, 400);
  assert.equal(abrir(a, { tipo_nc: 'XYZ' }).status, 400);
  assert.equal(abrir(a, { descricao: 'ab' }).status, 400);
  assert.equal(abrir(a, { actor: ' ' }).status, 400);
  assert.equal(abrir(a, { modelo: '' }).status, 400);
  assert.equal(abrir(a, { serial: ' m9mgd26060019sdfwa01715 ' }).body.rnc.serial, SERIE); // normaliza
});

test('idempotência: reenvio com a mesma chave não duplica', () => {
  const a = novoArm();
  const r1 = abrir(a, { idempotency_key: 'k1' }), r2 = abrir(a, { idempotency_key: 'k1' });
  assert.equal(r2.body.repetido, true); assert.equal(r2.body.rnc.rnc_id, r1.body.rnc.rnc_id); assert.equal(a.carregar().length, 1);
});

test('gravação: reabrir lê do disco, linha quebrada é ignorada, IDs seguem em sequência', () => {
  const a = novoArm(); abrir(a); abrir(a, { descricao: 'segunda falha' });
  fs.appendFileSync(path.join(a.dir, 'rnc.jsonl'), '{linha quebrada\n');
  const b = criarArmazem({ fs, path, core, dir: a.dir });
  assert.equal(Object.keys(b.listar()).length, 2); assert.equal(b.saude().linhasIgnoradas, 1);
  assert.equal(abrir(b, { descricao: 'terceira falha' }).body.rnc.rnc_id.endsWith('0003'), true);
});

test('muitos pedidos seguidos (1000) mantêm rev/IDs sem buraco e sem duplicar', () => {
  const a = novoArm(); const ids = new Set();
  for (let i = 0; i < 1000; i++) { const r = abrir(a, { serial: 'SERIE' + String(i).padStart(12, '0'), idempotency_key: 'k' + i }); ids.add(r.body.rnc.rnc_id); }
  assert.equal(ids.size, 1000); assert.equal(a.carregar().length, 1000);
  const linhas = fs.readFileSync(path.join(a.dir, 'rnc.jsonl'), 'utf8').trim().split('\n');
  assert.equal(linhas.length, 1000); linhas.forEach(l => JSON.parse(l));
  assert.equal(new Set(a.carregar().map(e => e.event_id)).size, 1000);
});

test('foto: tipo/tamanho validados, referência no evento, leitura só do que existe; RNC encerrada continua consultável', () => {
  const a = novoArm(); const id = abrir(a).body.rnc.rnc_id;
  assert.equal(a.executarFoto(id, 'Ana', 'text/plain', Buffer.from('x')).status, 415);
  assert.equal(a.executarFoto(id, 'Ana', 'image/jpeg', Buffer.alloc(3 * 1024 * 1024 + 1)).status, 413);
  assert.equal(a.executarFoto('RNC-2026-9999', 'Ana', 'image/jpeg', Buffer.from('x')).status, 404);
  const r = a.executarFoto(id, 'Ana', 'image/jpeg', Buffer.from('jpgdata'));
  assert.equal(r.status, 201); assert.equal(r.body.rnc.fotos[0].foto_ref, id + '/1.jpg'); assert.equal(r.body.rnc.rev, 1); // foto não muda rev
  assert.equal(a.lerFoto(id, '1.jpg').buffer.toString(), 'jpgdata');
  assert.equal(a.lerFoto(id, '../../rnc.jsonl'), null); assert.equal(a.lerFoto(id, '2.jpg'), null);
});

test('backup diário copia o arquivo e guarda no máximo 30', () => {
  const a = novoArm(); abrir(a);
  for (let d = 1; d <= 35; d++) a.backup(new Date(Date.UTC(2026, 0, d)));
  const bks = fs.readdirSync(path.join(a.dir, 'backup')); assert.equal(bks.length, 30);
  assert.equal(fs.readFileSync(path.join(a.dir, 'backup', bks[0]), 'utf8'), fs.readFileSync(path.join(a.dir, 'rnc.jsonl'), 'utf8'));
});
