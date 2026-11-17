'use strict';
// S2 (Fase 2, Portao 2) - enderecos de producao fora dos fluxos; DSE por variavel; simulador de bancada travado.
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { ENV_TESTE, esperaAte, get, post, sobe } = require('../ajudas.js');

const PASTA = path.join(__dirname, '..', '..', '..', 'nodered', 'flows', 'bt2');
const NOVOS = ['chaves-56-api-v3.1', 'chaves-400-api-v3.1', 'chaves-550-api-v1.2', 'chaves-595-api-v1.2', 'cliente-156-dse-plc-carga-v3', 'cliente-31-seletor-plc-db2000-v4', 'registro-ensaio-db2100-api-v1.6', 'simulador-dse-demo-v6', 'servidor-deepsea-api-gerador-v3_7'];
const lerFluxo = n => JSON.parse(fs.readFileSync(path.join(PASTA, n + '.json'), 'utf8'));

describe('S2 Portao 2 - fluxos sem enderecos fixos', () => {
  test('estatico: nenhum IP de producao nas versoes novas dos fluxos', () => {
    for (const n of NOVOS) {
      const t = fs.readFileSync(path.join(PASTA, n + '.json'), 'utf8');
      assert.equal((t.match(/172\.17\./g) || []).length, 0, n + ' ainda tem IP de rede fixo');
    }
  });

  test('estatico: todo endpoint S7 usa ${PLC_IP} (conexao vem da variavel de ambiente do PC)', () => {
    for (const n of NOVOS) {
      const eps = lerFluxo(n).filter(x => x.type === 's7 endpoint');
      for (const e of eps) assert.equal(e.address, '${PLC_IP}', n + ' / ' + e.name);
    }
  });

  test('estatico: o simulador v6 traz a trava de bancada (BT2_BANCADA padrao 0) nas duas funcoes', () => {
    const f = lerFluxo('simulador-dse-demo-v6');
    const aba = f.find(x => x.type === 'tab');
    const v = (aba.env || []).find(e => e.name === 'BT2_BANCADA');
    assert.ok(v, 'a aba nao define BT2_BANCADA');
    assert.equal(v.value, '0', 'o padrao precisa ser 0 (trava fechada)');
    const funcoes = f.filter(x => x.type === 'function');
    assert.ok(funcoes.some(x => x.name === 'liga/desliga DSE simulado' && /BT2_BANCADA/.test(x.func)), 'liga/desliga sem a trava');
    assert.ok(funcoes.some(x => x.name === 'calcula potencia + feedback simulado' && /BT2_BANCADA/.test(x.func)), 'calc sem a trava');
  });

  describe('comportamento no runtime (Node-RED de teste)', () => {
    test('o DSE: o no change monta msg.url a partir da variavel DSE_URL (tipo env), sem endereco escrito', async () => {
      const ch = lerFluxo('cliente-31-seletor-plc-db2000-v4').find(n => n.type === 'change' && (n.rules || []).some(r => r.tot === 'env'));
      assert.ok(ch, 'o cliente-31 v4 nao tem o no change que le o DSE por variavel');
      const probe = [
        { id: 'pr_tab', type: 'tab', label: 'probe DSE', disabled: false, info: '' },
        { id: 'pr_in', type: 'http in', z: 'pr_tab', name: '', url: '/probe-dse', method: 'get', upload: false, swaggerDoc: '', wires: [['pr_ch']] },
        Object.assign({}, ch, { id: 'pr_ch', z: 'pr_tab', wires: [['pr_fn']] }),
        { id: 'pr_fn', type: 'function', z: 'pr_tab', name: 'devolve msg.url', func: 'msg.payload = msg.url || ""; return msg;', outputs: 1, wires: [['pr_out']] },
        { id: 'pr_out', type: 'http response', z: 'pr_tab', name: '', statusCode: '', headers: {}, wires: [] },
      ];
      const tmp = path.join(require('os').tmpdir(), 'probe-dse-' + Date.now() + '.json');
      fs.writeFileSync(tmp, JSON.stringify(probe));
      process.env.DSE_URL = 'http://127.0.0.1:9/api/gerador-de-teste';
      const h = await sobe({ fluxosCaminho: [tmp], env: ENV_TESTE });
      try {
        assert.ok(await esperaAte(async () => (await get(h, '/probe-dse')).status === 200, 8000), 'probe nao respondeu');
        const r = await get(h, '/probe-dse');
        assert.equal(r.t, 'http://127.0.0.1:9/api/gerador-de-teste', 'msg.url veio: ' + r.t);
      } finally { await h.para(); delete process.env.DSE_URL; fs.rmSync(tmp, { force: true }); }
    });


    test('a conexao com o PLC sai da variavel de ambiente do PROCESSO (PLC_IP)', async () => {
      process.env.PLC_IP = '127.0.0.1';
      const h = await sobe({ fluxos: ['chaves-56-api-v3.1'], env: ENV_TESTE });
      try {
        const e = global.__BT2_ENDERECOS__ || {};
        assert.ok(await esperaAte(() => Object.keys(global.__BT2_ENDERECOS__ || {}).length >= 2, 4000), 'os endpoints nao registraram o endereco');
        const valores = Object.values(global.__BT2_ENDERECOS__);
        assert.ok(valores.length >= 2 && valores.every(x => x === '127.0.0.1'), 'enderecos resolvidos: ' + JSON.stringify(valores));
      } finally { await h.para(); delete process.env.PLC_IP; delete global.__BT2_ENDERECOS__; }
    });

    test('sem PLC_IP definido o endereco fica literal ${PLC_IP} (falha segura: nao vai a lugar nenhum)', async () => {
      delete process.env.PLC_IP; delete global.__BT2_ENDERECOS__;
      const h = await sobe({ fluxos: ['chaves-56-api-v3.1'], env: ENV_TESTE });
      try {
        assert.ok(await esperaAte(() => Object.keys(global.__BT2_ENDERECOS__ || {}).length >= 2, 4000));
        assert.ok(Object.values(global.__BT2_ENDERECOS__).every(x => x === '${PLC_IP}'));
      } finally { await h.para(); delete global.__BT2_ENDERECOS__; }
    });

    test('simulador com a trava FECHADA (BT2_BANCADA=0): nao liga e responde 404', async () => {
      const h = await sobe({ fluxos: ['chaves-56-api-v3.1', 'simulador-dse-demo-v6'], env: ENV_TESTE });
      try {
        // so posta depois que as rotas estao no ar (antes disso o 404 volta sem JSON)
        assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 8000), 'rotas nao ficaram prontas');
        const r = await post(h, '/api/simulador/dse', { ligado: true });
        assert.equal(r.status, 404, r.t);
        assert.match(r.j.erro, /bancada desligado/);
        assert.notEqual(h.plc.ler('DB2000,X2.1'), true, 'o simulador escreveu ledManual com a trava fechada');
      } finally { await h.para(); }
    });
  });
});
