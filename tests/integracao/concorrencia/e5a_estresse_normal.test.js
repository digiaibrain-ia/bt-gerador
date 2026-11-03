'use strict';
// E5a (Fase 3, Etapa 5) - ESTRESSE com perfis de latencia: normal, jitter e degradado (BC56). Carga imitando o front (3 POST simultaneos, GET a cada 1 s).
// Duracao de cada rodada: BT2_ESTRESSE_S (padrao 12 s). Para bancada/soak: BT2_ESTRESSE_S=600 npm --prefix tests/integracao test
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { ENV_TESTE, BANCOS, enderecos, esperaAte, get, sobe } = require('../ajudas.js');
const V = require('../verificador.js');
const E = require('./estresse.js');

const PERMITIDOS = ['200', '400', '409', '503', '504'];
async function rodada({ id = '56', perfil, semente, envAbas = { QUARENTENA_MS: 4000 }, esperaFim = 4000 }) {
  const h = await sobe({ fluxos: [BANCOS[id].flow], env: ENV_TESTE, envAbas }), e = enderecos(id);
  try {
    h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/' + id)).status === 200, 10000), 'banco nao ficou pronto');
    perfil(h.plc); h.plc.semente(semente);
    const r = await E.carga({ h, id, semente: semente + 4 }); const f = await E.encerra({ h, id, esperaMs: esperaFim });
    console.log('# [estresse BC' + id + '] ' + JSON.stringify({ enviados: r.enviados, lat: r.lat, gets: r.gets, status: r.porStatus, codigos: r.porCodigo, violMs: r.violMax, maxEmVoo: h.plc.maxEmVoo }));
    return { r, f, dupl: V.respostasEmDuplicidade(h.logs).length, maxEmVoo: h.plc.maxEmVoo };
  } finally { await h.para(); }
}
function confere({ r, f, dupl, maxEmVoo }, { serial = true, so200 = false } = {}) {
  assert.ok(r.enviados >= 10, 'pouca carga gerada: ' + r.enviados);
  assert.equal(r.perdidos, 0, 'pedido sem resposta'); assert.deepEqual(r.erros, [], 'erros de conexao'); assert.equal(dupl, 0, 'resposta em duplicidade');
  assert.equal(r.estouroFront, 0, 'algum POST passou do timeout de 10 s do front: max=' + r.lat.max + ' ms');
  assert.ok(r.gets.max < 3000, 'o GET (leitura da tela) ficou lento: ' + r.gets.max + ' ms');
  for (const st of Object.keys(r.porStatus)) assert.ok(PERMITIDOS.includes(st), 'status inesperado ' + st + ': ' + JSON.stringify(r.porStatus));
  if (serial) assert.equal(maxEmVoo, 1, 'escritas concorrentes no modo serial');
  assert.equal(r.violMax, 0, 'chave ligada com o banco desligado por ' + r.violMax + ' ms');
  assert.equal(f.status, 200, 'o desligar banco final falhou'); assert.equal(f.bancoLigado, false); assert.equal(f.cbLigadas, 0, 'sobrou chave ligada depois do desligar banco');
  assert.ok(f.ms < 5000, 'a fila nao drenou: o desligar final levou ' + f.ms + ' ms');
}

describe('E5a estresse BC56 - perfis normal, jitter e degradado', () => {
  test('normal (sem latencia): sem perda, sem estouro do timeout do front, estado final seguro', async () => confere(await rodada({ perfil: () => {}, semente: 1 })));
  test('jitter (escrita 80+-60 ms, leitura 80+-60 ms)', async () => confere(await rodada({ perfil: p => { Object.assign(p.latencia, { escritaMs: 80, escritaJitterMs: 60, leituraMs: 80, leituraJitterMs: 60 }); }, semente: 2 })));
  test('degradado (escrita 600+-400 ms, leitura 300+-200 ms): aparecem 504/503 mas nada se perde e o pior POST fica abaixo de 10 s', async () => {
    const x = await rodada({ perfil: p => { Object.assign(p.latencia, { escritaMs: 600, escritaJitterMs: 400, leituraMs: 300, leituraJitterMs: 200 }); }, semente: 3, esperaFim: 8000 });
    confere(x);
  });
});
