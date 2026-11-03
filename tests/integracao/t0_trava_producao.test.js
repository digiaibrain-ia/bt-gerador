'use strict';
// T0 - A TRAVA de producao: prova que ela recusa producao e que a guarda de rede bloqueia IP real.
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const net = require('net');
const { verificaAmbiente, verificaFlows, instalaGuardaRede, TravaProducao } = require('./trava_producao.js');

describe('T0 trava de producao', () => {
  test('recusa NODE_ENV=production', () => {
    assert.throws(() => verificaAmbiente({ NODE_ENV: 'production', BT2_AMBIENTE_TESTE: 'local' }, {}), TravaProducao);
  });
  test('recusa rodar sem BT2_AMBIENTE_TESTE=local', () => {
    assert.throws(() => verificaAmbiente({}, {}), /BT2_AMBIENTE_TESTE/);
  });
  test('recusa configuracao com IP real do projeto (PLC 1515 e servidor DSE)', () => {
    for (const ip of ['172.17.209.135', '172.17.210.156']) {
      assert.throws(() => verificaAmbiente({ BT2_AMBIENTE_TESTE: 'local' }, { plcHost: ip }), /equipamento REAL/, ip);
    }
  });
  test('recusa URL que nao e localhost', () => {
    assert.throws(() => verificaAmbiente({ BT2_AMBIENTE_TESTE: 'local' }, { noderedUrl: 'http://10.0.0.5:1880' }), /nao e localhost/);
  });
  test('aceita localhost e 127.0.0.1', () => {
    assert.doesNotThrow(() => verificaAmbiente({ BT2_AMBIENTE_TESTE: 'local' }, { a: 'http://127.0.0.1:1880', b: 'localhost' }));
  });
  test('verificaFlows aponta endpoint S7 com IP real (sera substituido pelo simulado)', () => {
    const achados = verificaFlows([{ id: 'x', type: 's7 endpoint', address: '172.17.209.135' }, { id: 'y', type: 's7 endpoint', address: '127.0.0.1' }]);
    assert.deepEqual(achados, ['x (172.17.209.135)']);
  });
  test('guarda de rede: qualquer conexao TCP para IP real e bloqueada ANTES de sair da maquina', () => {
    instalaGuardaRede();
    assert.throws(() => { const s = new net.Socket(); s.connect(102, '172.17.209.135'); }, /BLOQUEADO|bloqueada/);
  });
  test('guarda de rede: conexao para localhost continua permitida (o teste precisa dela)', async () => {
    instalaGuardaRede();
    const srv = net.createServer().listen(0, '127.0.0.1');
    await new Promise(r => srv.once('listening', r));
    const porta = srv.address().port;
    await new Promise((res, rej) => { const s = net.connect(porta, '127.0.0.1', () => { s.end(); res(); }); s.on('error', rej); });
    await new Promise(r => srv.close(r));
  });
});
