'use strict';
// F4 - Chaveamento do banco (220/380/440 V) e salvamento do Setup. Regra: nao muda chaveamento com chave selecionada.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe } = require('./ajudas.js');

describe('F4 chaveamento do banco e Setup', () => {
  let h, e;
  before(async () => {
    h = await sobe({ fluxos: ['chaves-56-api-v3.1'], env: ENV_TESTE });
    e = enderecos('56');
    // o DB por tensao (DB3002) e lido pelo 's7 in' com ciclo de 1 s: espera a primeira leitura
    // so segue quando o GET responde 200 (estado completo: DB3000 + DB3002). Antes disso as rotas de escrita respondem 503 'aguardando a 1a leitura'.
    assert.ok(await esperaAte(async () => { const g = await get(h, '/api/chaves/56'); return g.status === 200 && g.j.tensaoSel !== null; }, 8000), 'PLC simulado nao ficou pronto');
  });
  after(async () => { if (h) await h.para(); });

  test('caminho feliz: informar 380 V grava o chaveamento no DB3002 e aparece na leitura', async () => {
    const r = await post(h, '/api/chaves/56/tensao', { tensao: 380 });
    assert.equal(r.status, 200, r.t);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.tensaoSel === 2, 4000), 'tensaoSel deveria ser 2 (380 V)');
    assert.equal(h.plc.ler(e.tensaoSel), 2, 'o INT nao foi gravado no DB3002');
  });

  test('caminho feliz: 0 = "nao informado" e aceito', async () => {
    const r = await post(h, '/api/chaves/56/tensao', { tensao: 0 });
    assert.equal(r.status, 200, r.t);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.tensaoSel === 0, 4000));
  });

  test('erro: tensao que nao e 0/220/380/440 devolve 400 e nao grava', async () => {
    const antes = h.plc.escritas.length;
    const r = await post(h, '/api/chaves/56/tensao', { tensao: 7 });
    assert.equal(r.status, 400);
    assert.match(r.j.erro, /220, 380 ou 440/);
    assert.equal(h.plc.escritas.length, antes);
  });

  test('erro: nao muda o chaveamento com uma chave selecionada no Setup (409)', async () => {
    h.plc.escrever(e.chaveSel, 2);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.chaveSel === 2, 3000));
    const r = await post(h, '/api/chaves/56/tensao', { tensao: 220 });
    assert.equal(r.status, 409);
    assert.match(r.j.erro, /chave selecionada/);
    h.plc.escrever(e.chaveSel, 0);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).j.chaveSel === 0, 3000), 'o cache nao refletiu a chave desmarcada');
  });

  test('erro: salvar sem confirmacao e sem chave selecionada e recusado (400)', async () => {
    assert.equal((await post(h, '/api/chaves/56/salvar', { confirmado: false })).status, 400);
    const r = await post(h, '/api/chaves/56/salvar', { confirmado: true });
    assert.equal(r.status, 400);
    assert.match(r.j.erro, /nenhuma chave selecionada/);
  });

  test('erro: com o PLC sem resposta, o POST /tensao nunca responde sucesso (status diferente de 200)', async () => {
    h.plc.falhas.leitura = true;
    try {
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 503, 6000, 150));
      const r = await post(h, '/api/chaves/56/tensao', { tensao: 440 });
      assert.notEqual(r.status, 200, 'com o PLC parado a escrita foi aceita como sucesso: ' + r.t);
    } finally { h.plc.falhas.leitura = false; }
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 5000));
  });

  // ACHADO F4-2 (pendente): quando o POST responde erro (500, "leitura de volta nao conferiu"), o valor JA FOI GRAVADO no PLC.
  // A conferencia de volta le o cache parado (valor antigo) em vez do PLC. Resultado: o operador ve erro, mas o chaveamento mudou.
  test('ACHADO F4-2: se o POST responde erro, o chaveamento NAO pode ter mudado no PLC', { todo: 'ACHADO F4-2: conferencia de volta le cache parado; PLC muda mesmo com resposta 500' }, async () => {
    const antes = h.plc.ler(e.tensaoSel);
    h.plc.falhas.leitura = true;
    let r;
    try {
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 503, 6000, 150));
      r = await post(h, '/api/chaves/56/tensao', { tensao: 440 });
    } finally { h.plc.falhas.leitura = false; }
    assert.notEqual(r.status, 200, 'a resposta deveria ser de erro neste cenario');
    assert.equal(h.plc.ler(e.tensaoSel), antes, 'resposta de erro, mas o PLC mudou o chaveamento de ' + antes + ' para ' + h.plc.ler(e.tensaoSel));
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 5000));
  });

  // ACHADO F4-1 (pendente, fora desta correcao): o POST /tensao so confere a idade da leitura do DB3002 (5 s); a leitura
  // principal do banco (DB3000) so e recusada pelo GET a partir de 2,5 s. Por isso, entre 2,5 e 5 s sem PLC, a escrita e
  // TENTADA e falha na conferencia (500) em vez de ser recusada antes (503). Seguro hoje (nada e confirmado), mas o
  // contrato esperado e recusar antes de escrever. Ver BACKLOG_FORA_DE_ESCOPO.md.
  test('ACHADO F4-1: com o PLC sem resposta, o POST /tensao deveria recusar ANTES de escrever (503)', { todo: 'ACHADO F4-1: validacao usa dado de ate 5 s; GET recusa a 2,5 s' }, async () => {
    h.plc.falhas.leitura = true;
    try {
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 503, 6000, 150));
      const antes = h.plc.escritas.length;
      const r = await post(h, '/api/chaves/56/tensao', { tensao: 440 });
      assert.equal(r.status, 503);
      assert.equal(h.plc.escritas.length, antes, 'nao deveria nem tentar escrever no PLC sem resposta');
    } finally { h.plc.falhas.leitura = false; }
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 5000));
  });
});
