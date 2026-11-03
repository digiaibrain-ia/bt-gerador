'use strict';
// I1 (Fase 3, Portao 1) - a INSTRUMENTACAO funciona: latencia, jitter, atraso explicito, queda no meio, escrita serial/concorrente,
// semente fixa, trace e verificador. NAO testa o comportamento dos fluxos (isso e do Portao 2): so prova que o ambiente consegue
// reproduzir e MEDIR condicoes de corrida sem tocar em nenhum arquivo de producao.
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { PlcSimulado } = require('../plc_simulado.js');
const V = require('../verificador.js');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe } = require('../ajudas.js');

const dorme = ms => new Promise(r => setTimeout(r, ms));

describe('I1 instrumentacao - PLC simulado (unitario)', () => {
  test('semente fixa: o mesmo jitter sai na mesma sequencia; outra semente muda', () => {
    const sorteia = s => { const p = new PlcSimulado(); p.latencia.escritaMs = 100; p.latencia.escritaJitterMs = 80; p.semente(s); return Array.from({ length: 6 }, () => p._atrasoEscrita('DB1,X0.0', true)); };
    assert.deepEqual(sorteia(42), sorteia(42));
    assert.notDeepEqual(sorteia(42), sorteia(43));
    assert.ok(sorteia(42).every(x => x >= 20 && x <= 180), 'jitter fora de 100 +- 80');
  });

  test('atrasos explicitos (numero ou funcao) sao consumidos UM POR ESCRITA, na ordem, antes da latencia padrao', () => {
    const p = new PlcSimulado(); p.latencia.escritaMs = 7; p.atrasosEscrita.push(500, (a, v) => v ? 11 : 22);
    assert.equal(p._atrasoEscrita('DB1,X0.0', true), 500);
    assert.equal(p._atrasoEscrita('DB1,X0.0', true), 11);
    assert.equal(p._atrasoEscrita('DB1,X0.0', false), 7, 'acabou a lista: volta a latencia padrao');
  });

  test('escrita SERIAL: nunca mais de 1 em voo e a ordem de aplicacao = ordem de chegada, mesmo com atrasos diferentes', async () => {
    const p = new PlcSimulado(); p.atrasosEscrita.push(120, 10, 60);
    await Promise.all([1, 2, 3].map(i => p.escreverDoFluxo('DB1,INT' + 2 * i, i)));
    assert.equal(p.maxEmVoo, 1);
    assert.deepEqual(p.trace.map(t => t.valor), [1, 2, 3]);
    assert.ok(p.trace.every(t => t.ok));
  });

  test('escrita CONCORRENTE (serial=false): varias em voo e a escrita rapida ULTRAPASSA a lenta (reordenacao reproduzida)', async () => {
    const p = new PlcSimulado(); p.latencia.serial = false; p.atrasosEscrita.push(150, 10);
    await Promise.all([p.escreverDoFluxo('DB1,INT0', 111), p.escreverDoFluxo('DB1,INT0', 222)]);
    assert.equal(p.maxEmVoo, 2);
    assert.deepEqual(V.valoresAplicados(p.trace, 'DB1,INT0'), [222, 111], 'o valor MAIS ANTIGO foi aplicado por ultimo');
    assert.equal(p.ler('DB1,INT0'), 111, 'estado final = o pedido mais antigo (a corrida que o Portao 2 vai procurar nos fluxos)');
  });

  test('queda no meio da sequencia (escritaApos=2): as duas primeiras aplicam, as seguintes falham e NADA e aplicado', async () => {
    const p = new PlcSimulado(); p.falhas.escritaApos = 2;
    const r = await Promise.allSettled([1, 2, 3, 4].map(i => p.escreverDoFluxo('DB1,INT' + 2 * i, i)));
    assert.deepEqual(r.map(x => x.status), ['fulfilled', 'fulfilled', 'rejected', 'rejected']);
    assert.equal(p.ler('DB1,INT6'), 0); assert.equal(p.ler('DB1,INT8'), 0);
    assert.deepEqual(p.trace.map(t => t.ok), [true, true, false, false]);
  });

  test('escrita direta do teste (plc.escrever) NAO entra no trace; so a dos fluxos entra', () => {
    const p = new PlcSimulado(); p.escrever('DB1,X0.0', true);
    assert.equal(p.trace.length, 0); assert.equal(p.escritas.length, 1);
  });
});

describe('I1 instrumentacao - verificador de invariantes (unitario, trace sintetico)', () => {
  const t = (n, addr, ini, fim, ok = true) => ({ n, addr, valor: 1, tChegada: ini, tInicio: ini, tAplicada: fim, ok });
  const G = { A: a => a.startsWith('A'), B: a => a.startsWith('B') };
  test('janelas disjuntas -> sem sobreposicao; janelas que se cruzam -> detecta o par', () => {
    assert.deepEqual(V.sobreposicoes([t(1, 'A1', 0, 10), t(2, 'A2', 10, 20), t(3, 'B1', 20, 30)], G), []);
    assert.deepEqual(V.sobreposicoes([t(1, 'A1', 0, 10), t(2, 'B1', 5, 15)], G), [['A', 'B']]);
  });
  test('ordem de inicio dos grupos e contagem de respostas perdidas', () => {
    assert.deepEqual(V.ordemDeInicio([t(1, 'B1', 5, 6), t(2, 'A1', 9, 10)], G), ['B', 'A']);
    assert.equal(V.semRespostaPerdida([{ status: 200 }, null, { status: 503 }, { status: undefined }]), 2);
  });
  test('deteccao de resposta em duplicidade nos logs do Node-RED', () => {
    const logs = [{ msg: 'ok' }, { msg: 'Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client' }];
    assert.equal(V.respostasEmDuplicidade(logs).length, 1);
  });
  test('percentis de latencia', () => {
    const p = V.percentis([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
    assert.deepEqual([p.n, p.min, p.p50, p.max], [10, 10, 60, 100]);
  });
});

describe('I1 instrumentacao - dentro do Node-RED de teste (fluxo BC56 v3.2 de producao, so lido do disco)', () => {
  const sobeBc56 = async () => {
    const h = await sobe({ fluxos: ['chaves-56-api-v3.3'], env: ENV_TESTE });
    const e = enderecos('56'); h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 10000), 'BC56 nao ficou pronto');
    return { h, e };
  };

  test('latencia de ESCRITA configurada (300 ms, menor que a espera de 450 ms do fluxo) aparece no trace e o comando ainda responde 200', async () => {
    const { h, e } = await sobeBc56();
    try {
      h.plc.trace.length = 0; h.plc.latencia.escritaMs = 300;
      const r = await post(h, '/api/chaves/56/habilitar', { indice: 2, habilitada: true });
      assert.equal(r.status, 200, r.t);
      const w = h.plc.trace.find(x => x.addr === e.hab(2));
      assert.ok(w && w.ok && w.tAplicada - w.tInicio >= 280, 'trace nao registrou o atraso: ' + JSON.stringify(w));
      assert.equal(h.plc.maxEmVoo, 1, 'escrita serial: uma por vez');
      // (a resposta NAO fica mais lenta: o fluxo ja espera 450 ms depois de escrever, e a latencia de 300 ms cabe dentro dessa espera.
      //  O que acontece quando a latencia passa de 450 ms e assunto do Portao 2 da Fase 3.)
    } finally { await h.para(); }
  });

  test('atraso EXPLICITO na 1a escrita de um comando: o trace mostra qual escrita atrasou e a ordem de aplicacao', async () => {
    const { h, e } = await sobeBc56();
    try {
      h.plc.trace.length = 0; h.plc.atrasosEscrita.push(300);
      const r = await post(h, '/api/chaves/56/habilitar', { indice: 3, habilitada: true });
      assert.equal(r.status, 200, r.t);
      assert.ok(h.plc.trace.length >= 1, 'o comando nao gerou escrita');
      assert.ok(h.plc.trace[0].tAplicada - h.plc.trace[0].tInicio >= 280, 'a primeira escrita nao recebeu o atraso explicito');
      assert.ok(h.plc.trace.every((x, i, a) => i === 0 || x.tInicio >= a[i - 1].tAplicada - 1), 'serial: cada escrita comeca depois da anterior');
      assert.equal(h.plc.ler(e.hab(3)), true);
    } finally { await h.para(); }
  });

  test('queda do PLC no meio: escritaApos=0 -> o comando NAO aplica nada no PLC e a rota nao responde 200', async () => {
    const { h, e } = await sobeBc56();
    try {
      h.plc.trace.length = 0; h.plc.aplicadas = 0; h.plc.falhas.escritaApos = 0;
      const r = await post(h, '/api/chaves/56/habilitar', { indice: 4, habilitada: true });
      assert.notEqual(r.status, 200, 'respondeu 200 mesmo com o PLC recusando a escrita: ' + r.t);
      assert.equal(h.plc.ler(e.hab(4)), false);
      assert.ok(h.plc.trace.length >= 1 && h.plc.trace.every(x => !x.ok), 'trace deveria mostrar as tentativas recusadas');
    } finally { await h.para(); }
  });

  test('latencia de LEITURA: a mudanca no PLC so aparece no GET depois do atraso (cache envelhecido, reproduzivel)', async () => {
    const { h, e } = await sobeBc56();
    try {
      h.plc.latencia.leituraMs = 900; await dorme(1100);      // deixa a latencia entrar em regime
      h.plc.escrever(e.sb(5), true); const t0 = Date.now();
      const viu = await esperaAte(async () => (await get(h, '/api/chaves/56')).j.ligada?.[4] === true || (await get(h, '/api/chaves/56')).j.ligadas?.[4] === true, 6000, 50);
      const dt = Date.now() - t0;
      assert.ok(viu, 'o estado nunca apareceu no GET (campo de leitura nao reconhecido?)');
      assert.ok(dt >= 700, 'apareceu cedo demais (' + dt + ' ms): a latencia de leitura nao esta valendo');
    } finally { await h.para(); }
  });

  test('captura de logs do Node-RED: um aviso emitido pelo fluxo (guarda D3 bloqueando) aparece em h.logs', async () => {
    const { h } = await sobeBc56();
    try {
      const n0 = h.logs.length;
      const r = await post(h, '/api/chaves/56/habilitar', { indice: 1, habilitada: true }, { Origin: 'http://evil.example' });
      assert.equal(r.status, 403);
      assert.ok(await esperaAte(() => h.logs.length > n0, 2000), 'h.logs nao captou nada');
      assert.ok(h.logs.some(l => /D3 bloqueado/.test(l.msg)), JSON.stringify(h.logs.slice(-2)));
    } finally { await h.para(); }
  });
});
