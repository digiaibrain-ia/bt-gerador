'use strict';
// F5 - Vigia "HTML sumiu": se a tela para de consultar, o flow zera o comando das chaves (sem mexer em Habilitada).
// Usa WD_HTML_S=2 na ABA (variavel de ambiente da aba, trocada so na copia em memoria; o arquivo de producao nao muda).
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { ENV_TESTE, enderecos, esperaAte, get, sobe, espera } = require('./ajudas.js');

describe('F5 vigia "HTML sumiu" do BC56', () => {
  let h, e;
  before(async () => {
    h = await sobe({ fluxos: ['chaves-56-api-v3.3'], env: ENV_TESTE, envAbas: { WD_HTML_S: '2' } });
    e = enderecos('56');
    await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 5000);
  });
  after(async () => { if (h) await h.para(); });

  test('enquanto a tela consulta o flow, o comando das chaves NAO e zerado', async () => {
    h.plc.escrever(e.cbBanco, true); h.plc.escrever(e.hab(1), true); h.plc.escrever(e.cb(1), true);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.cbLigar[0] === true, 3000), 'o cache ainda nao refletiu a escrita (espera de 3 s)');
    for (let i = 0; i < 10; i++) {                             // ~5 s consultando a cada 500 ms
      const r = await get(h, '/api/chaves/56');
      assert.equal(r.j.cbLigar[0], true, 'a tela esta viva e a chave 1 foi zerada mesmo assim (passo ' + i + ')');
      await espera(500);
    }
  });

  test('sem consultas por mais de WD_HTML_S, o vigia zera CbLigar e desliga o banco (v2.4), sem mexer em Habilitada', async () => {
    const hab = h.plc.ler(e.hab(1));
    assert.ok(await esperaAte(async () => h.plc.ler(e.cb(1)) === false, 10000, 200), 'o vigia nao zerou a chave 1 em ~10 s');
    assert.equal(h.plc.ler(e.hab(1)), hab, 'o vigia nao pode mexer em Habilitada');
    assert.equal(h.plc.ler(e.cbBanco), false, 'v2.4: o vigia tambem desliga o banco (LigarBanco) quando o HTML some');
  });

  test('o vigia nao age sem chave ligada e sem banco ligado (nada a zerar)', async () => {
    h.plc.escrever(e.cbBanco, false); h.plc.escrever(e.cb(1), false);
    const antes = h.plc.escritas.length;
    await espera(3500);                                        // passa do limite, sem consultas
    const escritasVigia = h.plc.escritas.slice(antes).filter(x => /^DB3000,X0\./.test(x.addr));
    assert.equal(escritasVigia.length, 0, 'o vigia escreveu comando sem ter o que zerar');
  });
});
