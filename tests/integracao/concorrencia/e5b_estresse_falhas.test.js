'use strict';
// E5b (Fase 3, Etapa 5) - ESTRESSE com escritas tardias injetadas (serial e CONCORRENTE) e com o banco de 32 chaves (BC595).
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { ENV_TESTE, BANCOS, enderecos, esperaAte, get, sobe } = require('../ajudas.js');
const V = require('../verificador.js');
const E = require('./estresse.js');
const PERMITIDOS = ['200', '400', '409', '503', '504'];

async function rodada({ id = '56', serial, tardias, semente, esperaFim = 9000 }) {
  const h = await sobe({ fluxos: [BANCOS[id].flow], env: ENV_TESTE, envAbas: { QUARENTENA_MS: 4000 } }), e = enderecos(id);
  try {
    h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/' + id)).status === 200, 10000), 'banco nao ficou pronto');
    Object.assign(h.plc.latencia, { serial, escritaMs: 80, escritaJitterMs: 60, leituraMs: 80, leituraJitterMs: 60 }); h.plc.semente(semente);
    let ultimo = -99999;
    const perturba = tardias ? t => { if (t - ultimo > 4000) { ultimo = t; h.plc.atrasosEscrita.push(3000); } } : undefined;   // a cada 4 s uma escrita demora 3 s (alem da janela de 2 s)
    const r = await E.carga({ h, id, semente: semente + 4, perturba }); const f = await E.encerra({ h, id, esperaMs: esperaFim });
    console.log('# [estresse BC' + id + (serial ? ' serial' : ' CONCORRENTE') + '] ' + JSON.stringify({ enviados: r.enviados, lat: r.lat, status: r.porStatus, codigos: r.porCodigo, violMs: r.violMax, violacoes: r.violacoes.length, maxEmVoo: h.plc.maxEmVoo }));
    return { r, f, dupl: V.respostasEmDuplicidade(h.logs).length };
  } finally { await h.para(); }
}
function base({ r, f, dupl }, { violLimite }) {
  assert.ok(r.enviados >= 10); assert.equal(r.perdidos, 0); assert.deepEqual(r.erros, []); assert.equal(dupl, 0, 'resposta em duplicidade');
  assert.equal(r.estouroFront, 0, 'POST acima de 10 s: ' + r.lat.max + ' ms'); assert.ok(r.gets.max < 3000, 'GET lento: ' + r.gets.max);
  for (const st of Object.keys(r.porStatus)) assert.ok(PERMITIDOS.includes(st), 'status inesperado ' + st + ': ' + JSON.stringify(r.porStatus));
  assert.ok(r.violMax <= violLimite, 'chave ligada com banco desligado por ' + r.violMax + ' ms (limite ' + violLimite + ')');
  assert.equal(f.status, 200); assert.equal(f.bancoLigado, false); assert.equal(f.cbLigadas, 0, 'sobrou chave ligada no fim'); assert.ok(f.ms < 5000, 'fila nao drenou: ' + f.ms + ' ms');
}

describe('E5b estresse com escritas tardias', () => {
  test('serial: a cada 4 s uma escrita passa da janela (504 + quarentena): nada se perde, nenhum POST passa de 10 s, estado final seguro', async () => {
    const x = await rodada({ serial: true, tardias: true, semente: 5 });
    base(x, { violLimite: 0 }); assert.ok((x.r.porStatus[504] || 0) >= 1, 'a falha nao foi exercitada (nenhum 504): ' + JSON.stringify(x.r.porStatus));
  });
  test('CONCORRENTE: escritas antigas podem ultrapassar as novas; a reafirmacao limita o tempo de chave ligada indevidamente (<= 4 s) e o estado final e seguro', async () => {
    const x = await rodada({ serial: false, tardias: true, semente: 6 });
    base(x, { violLimite: 4000 }); assert.ok((x.r.porStatus[504] || 0) >= 1, 'a falha nao foi exercitada (nenhum 504): ' + JSON.stringify(x.r.porStatus));
  });
  test('BC595 (32 chaves) com jitter: mesmos invariantes', async () => {
    const x = await rodada({ id: '595', serial: true, tardias: false, semente: 7, esperaFim: 5000 });
    base(x, { violLimite: 0 });
  });
});
