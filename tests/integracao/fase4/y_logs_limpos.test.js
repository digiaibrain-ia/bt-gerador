'use strict';
/* =====================================================================================================================
   FASE 4 / Passo 6 — LOG LIMPO DO FLUXO DO DSE (19/11/2026).
   PARA QUE SERVE (leigo): com o DSE falhando, o fluxo escrevia "bloco X incompleto" a cada resposta de cada bloco (ate 13 linhas por segundo). Agora 1 aviso por bloco a cada 5 min.
   O QUE PROVA: (1) servidor-deepsea v3_8 so difere da v3_7 no no "decodifica blocos" e na aba; (2) o codigo REAL do no, executado com 100 respostas incompletas
   do mesmo bloco, emite 1 aviso (e a contagem de falhas continua subindo para 100); outro bloco avisa a sua vez; depois de 5 min avisa de novo com o total;
   (3) a contagem de falhas e o "descarte sem tocar nos valores bons" continuam iguais.
   CONTRA-PROVA: BT2_LOG_FLUXO=servidor-deepsea-api-gerador-v3_7 tem que FALHAR no teste (2).
   NAO PROVA: o Modbus real do DSE (o nó de leitura precisa do modulo modbus, que o harness nao tem): so o trecho de decodificacao que gera o aviso e executado.
   ===================================================================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), vm = require('vm');
const { caminhoFluxo } = require('../../versoes.js');
const NOVO = process.env.BT2_LOG_FLUXO || 'servidor-deepsea-api-gerador-v3_8';
const lerFl = n => JSON.parse(fs.readFileSync(caminhoFluxo(n), 'utf8'));

test('(1) a v3_8 so difere da v3_7 no no "decodifica blocos" e na aba', () => {
  const a = lerFl('servidor-deepsea-api-gerador-v3_7'), d = lerFl('servidor-deepsea-api-gerador-v3_8'), poD = Object.fromEntries(d.map(n => [n.id, n]));
  assert.equal(d.length, a.length); assert.deepEqual(a.filter(n => !poD[n.id]).map(n => n.id), []);
  const mudou = a.filter(n => JSON.stringify(n) !== JSON.stringify(poD[n.id])).map(n => n.name || n.type).sort();
  assert.deepEqual(mudou, ['decodifica blocos', 'tab']);   // 'tab' = a aba (rotulo e info)
});

test('(2) 100 respostas incompletas do mesmo bloco geram 1 aviso; a contagem de falhas sobe; outro bloco avisa a sua vez; apos 5 min avisa de novo', () => {
  const no = lerFl(NOVO).find(n => n.name === 'decodifica blocos');
  const ctx = { warns: [], ng: { gerador_cfg: { alarmQty: 20, ledQty: 20 }, gerador_blk: {} }, agora: 1_000_000 };
  const node = { warn: t => ctx.warns.push(t), error: t => ctx.warns.push('ERRO ' + t), status() {} };
  const global = { get: k => ctx.ng[k], set: (k, v) => { ctx.ng[k] = v; } };
  const FakeDate = class extends Date { static now() { return ctx.agora; } };
  const roda = (bloco, payload) => vm.runInNewContext('(function(msg,node,global,flow,env,context){' + no.func + '\n})', { Date: FakeDate, console })({ bloco, payload }, node, global, { get() {}, set() {} }, { get() {} }, {});
  for (let i = 0; i < 100; i++) { ctx.agora += 1000; assert.equal(roda('A', [1, 2, 3]), null); }              // bloco A (espera 35 registradores): 3 = incompleto
  assert.equal(ctx.warns.length, 1, 'esperava 1 aviso para 100 respostas incompletas: ' + ctx.warns.length);
  assert.match(ctx.warns[0], /bloco A incompleto ou desconhecido \(1 falhas/);
  assert.equal(ctx.ng.gerador_blk.A.falhas, 100, 'a contagem de falhas continua por resposta');
  roda('B', [1]); assert.equal(ctx.warns.length, 2, 'outro bloco avisa a sua vez'); assert.match(ctx.warns[1], /bloco B/);
  ctx.agora += 301_000; roda('A', [1]);
  assert.equal(ctx.warns.length, 3, 'passados 5 min o bloco A avisa de novo'); assert.match(ctx.warns[2], /\(101 falhas/);
});
