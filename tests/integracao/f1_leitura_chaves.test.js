'use strict';
// F1 - Leitura do estado dos 4 bancos (GET /api/chaves/{id}) e o que acontece quando o PLC nao responde.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { ENV_TESTE, BANCOS, enderecos, esperaAte, get, sobe } = require('./ajudas.js');

describe('F1 leitura do estado dos 4 bancos', () => {
  let h;
  before(async () => {
    h = await sobe({ fluxos: Object.values(BANCOS).map(b => b.flow), env: ENV_TESTE });
    // so segue quando os QUATRO bancos ja tem leitura (antes de todos, a rota responde 503 'nenhuma leitura desde o deploy')
    assert.ok(await esperaAte(async () => { for (const id of Object.keys(BANCOS)) if ((await get(h, '/api/chaves/' + id)).status !== 200) return false; return true; }, 10000), 'nem todos os bancos ficaram prontos');
  });
  after(async () => { if (h) await h.para(); });

  test('caminho feliz: cada banco devolve o estado no formato v2.5 e com o tamanho do seu DB', async () => {
    for (const [id, b] of Object.entries(BANCOS)) {
      const r = await get(h, '/api/chaves/' + id);
      assert.equal(r.status, 200, id + ': status');
      assert.equal(r.j.flow, 'chaves-v2.5', id + ': flow');
      assert.equal(r.j.banco, id, id + ': banco');
      assert.equal(r.j.habilitada.length, b.N, id + ': habilitada deve ter ' + b.N + ' posicoes');
      assert.equal(r.j.cbLigar.length, b.N, id + ': cbLigar deve ter ' + b.N + ' posicoes');
    }
  });

  test('o estado reflete o PLC: um bit de feedback escrito no DB aparece na leitura do banco', async () => {
    const e = enderecos('56'); const h0 = h;
    h0.plc.escrever(e.sb(2), true);                          // Ligada2 do BC56
    const ok = await esperaAte(async () => (await get(h0, '/api/chaves/56')).j.ligada[1] === true, 3000);
    assert.ok(ok, 'Ligada2 escrita no PLC nao chegou na leitura');
    h0.plc.escrever(e.sb(2), false);
  });

  test('BC59,5 (18 chaves) e lido do DB3200, nao do DB do BC56', async () => {
    const e = enderecos('595');
    h.plc.escrever(e.hab(18), true);                         // Habilitada18 (a ultima chave real)
    const ok = await esperaAte(async () => (await get(h, '/api/chaves/595')).j.habilitada[17] === true, 3000);
    assert.ok(ok, 'Habilitada18 do BC59,5 nao apareceu');
    assert.ok(!(await get(h, '/api/chaves/56')).j.habilitada.includes(true), 'o BC56 nao pode enxergar o DB do BC59,5 (nenhuma das 16 posicoes do BC56 pode ficar true)');
    h.plc.escrever(e.hab(18), false);
  });

  test('erro: PLC sem leitura recente devolve 503 com mensagem (nao mostra estado velho como atual)', async () => {
    h.plc.falhas.leitura = true;
    try {
      const ok = await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 503, 6000, 150);
      assert.ok(ok, 'depois de ~2,5 s sem leitura a rota deveria responder 503');
      const r = await get(h, '/api/chaves/56');
      assert.match(r.j.erro, /PLC sem leitura/i);
    } finally { h.plc.falhas.leitura = false; }
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 5000), 'a leitura deveria voltar quando o PLC responde');
  });

  test('erro: banco que nao existe nao tem rota (404)', async () => {
    assert.equal((await get(h, '/api/chaves/99')).status, 404);
  });
});
