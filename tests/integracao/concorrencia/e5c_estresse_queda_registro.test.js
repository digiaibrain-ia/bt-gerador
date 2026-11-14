'use strict';
// E5c (Fase 3, Etapa 5) - queda de leitura do PLC com carga (P3-E1) e registro de ensaio com a sequencia do front.
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe } = require('../ajudas.js');
const V = require('../verificador.js');
const E = require('./estresse.js');

describe('E5c queda de leitura do PLC com comandos na fila', () => {
  const bc56 = async () => {
    const h = await sobe({ fluxos: ['chaves-56-api-v3.4'], env: ENV_TESTE }), e = enderecos('56');
    h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 10000));
    return { h, e };
  };
  const tempo = async (h, rota, corpo) => { const t = Date.now(); const r = await post(h, '/api/chaves/56/' + rota, corpo); return { status: r.status, ms: Date.now() - t, j: r.j }; };

  test('recuperacao: PLC sem leitura -> o comando responde 503 pelo vigia de 8 s, a fila e liberada e o proximo comando funciona assim que o PLC volta', async () => {
    const { h, e } = await bc56();
    try {
      h.plc.falhas.leitura = true;
      const a = await tempo(h, 'habilitar', { indice: 3, habilitada: true });
      assert.equal(a.status, 503, JSON.stringify(a.j)); assert.ok(a.ms >= 7000 && a.ms < 11000, 'vigia fora de 8 s: ' + a.ms);
      h.plc.falhas.leitura = false;
      const b = await tempo(h, 'habilitar', { indice: 4, habilitada: true });
      assert.equal(b.status, 200, JSON.stringify(b.j)); assert.ok(b.ms < 3000, 'fila lenta depois da volta do PLC: ' + b.ms + ' ms');
      assert.equal(V.respostasEmDuplicidade(h.logs).length, 0); assert.equal(h.plc.ler(e.hab(4)), true);
    } finally { await h.para(); }
  });

  test('ACHADO P3-E1 (Media): com o PLC sem leitura por 12 s, dois comandos comuns na fila NAO deveriam passar de 10 s (timeout do front); hoje o 2o espera o vigia de 8 s do 1o', { todo: 'ACHADO P3-E1: com o PLC mudo a fila nao falha rapido: o 1o espera o vigia de 8 s e o 2o fica parado ate a leitura voltar (12 s no teste) ou ao proprio vigia; o front desiste aos 10 s e o comando ainda executa depois (R9)' }, async () => {
    const { h } = await bc56();
    try {
      h.plc.falhas.leitura = true; setTimeout(() => { h.plc.falhas.leitura = false; }, 12000);
      const [a, b] = await Promise.all([tempo(h, 'habilitar', { indice: 3, habilitada: true }), (async () => { await E.dorme(100); return tempo(h, 'habilitar', { indice: 4, habilitada: true }); })()]);
      assert.ok(Math.max(a.ms, b.ms) <= 10000, 'latencias com o PLC mudo: ' + a.ms + ' ms e ' + b.ms + ' ms (status ' + a.status + ',' + b.status + ')');
    } finally { await h.para(); }
  });
});

const PASTA = path.join(__dirname, '..', '..', '..', 'nodered', 'flows', 'bt2');
const PREEN = { campos: { serie: 'SN-1', versao: 'V1', data: '2026-11-03', fase: 'trifasico', frequenciaHz: 60, tensaoV: 380, tempAmbienteC: 25, potenciaKw: 100, equipamentos: { motor: { fabricante: 'M', modelo: 'X', serie: '1' } } } };
const VAL = Object.fromEntries(['cargaReal', 'potencia', 'tempMotor', 'Va', 'Vb', 'Vc', 'Ia', 'Ib', 'Ic', 'rpm', 'bateria', 'tEstab', 'cronometro'].map(k => [k, 1]));

describe('E5c registro de ensaio (v1.8) com a sequencia do front (as gravacoes do ensaio saem UMA POR VEZ: ENS.fila)', () => {
  const sobeReg = async () => {
    const h = await sobe({ fluxos: ['registro-ensaio-db2100-api-v1.8'], env: ENV_TESTE });
    assert.ok(await esperaAte(async () => (await get(h, '/api/ensaio/snap')).status === 200, 10000));
    Object.assign(h.plc.latencia, { escritaMs: 80, escritaJitterMs: 60, leituraMs: 80, leituraJitterMs: 60 }); h.plc.semente(9);
    return h;
  };
  const chama = async (h, lat, rota, corpo) => { const t = Date.now(); const r = await post(h, '/api/ensaio/snap/' + rota, corpo); lat.push(Date.now() - t); return r; };

  test('preenchimento + 6 etapas em sequencia, com jitter (escrita 80+-60 ms, leitura 80+-60 ms): tudo 200 e cada chamada abaixo de 10 s', async () => {
    const h = await sobeReg();
    try {
      const lat = [], st = [];
      st.push((await chama(h, lat, 'preenchimento', PREEN)).status);
      for (let i = 1; i <= 6; i++) st.push((await chama(h, lat, 'etapa', { etapa: i * 15, indice: i, valores: VAL, confirmado: true })).status);
      console.log('# [estresse registro sequencial] ' + JSON.stringify({ lat: V.percentis(lat), st }));
      assert.ok(st.every(x => x === 200), 'status: ' + st.join(','));
      assert.ok(Math.max(...lat) < 10000, 'chamada acima de 10 s: ' + Math.max(...lat) + ' ms');
      assert.equal(V.respostasEmDuplicidade(h.logs).length, 0);
    } finally { await h.para(); }
  });

  test('ACHADO P3-E2 (Baixa/Media, condicional ao tempo real de escrita S7): "limpar" (42 variaveis) com escrita de 80+-60 ms cada deveria confirmar (200), nao dar falso 500 como o P3-A4 das chaves', { todo: 'ACHADO P3-E2: o registro confere UMA vez apos 1,5 s (sem janela de confirmacao como a das chaves); se as 42 escritas do limpar passam de 1,5 s o resultado e 500 e as escritas terminam depois' }, async () => {
    const h = await sobeReg();
    try {
      await post(h, '/api/ensaio/snap/preenchimento', PREEN);
      for (let i = 1; i <= 6; i++) await post(h, '/api/ensaio/snap/etapa', { etapa: i * 15, indice: i, valores: VAL, confirmado: true });   // as 6 etapas salvas precisam voltar a FALSE no limpar
      const r = await post(h, '/api/ensaio/snap/limpar', { confirmado: true });
      assert.equal(r.status, 200, 'limpar com jitter: ' + r.status + ' ' + r.t);
    } finally { await h.para(); }
  });
});
