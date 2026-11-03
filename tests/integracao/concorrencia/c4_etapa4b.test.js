'use strict';
// C4 (Fase 3, Etapa 4b) - P3-A4 (janela de confirmacao + 504 incerto) e P3-A5 (quarentena POR VARIAVEL + reafirmacao) nos 4 fluxos de chaves.
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { ENV_TESTE, BANCOS, enderecos, esperaAte, get, post, sobe } = require('../ajudas.js');
const V = require('../verificador.js');

const dorme = ms => new Promise(r => setTimeout(r, ms));
const PASTA = path.join(__dirname, '..', '..', '..', 'nodered', 'flows', 'bt2');
const ABAS = { CONF_JANELA_MS: 1000, QUARENTENA_MS: 3000 };   // reduzidos para o teste nao demorar (padrao de producao: 2000 / 10000)

describe('C4 4b - estatico: os 4 fluxos novos', () => {
  for (const id of Object.keys(BANCOS)) {
    test('BC' + id + ': confere tem 3 saidas (retentativa), monta tem 5 (503 de quarentena), reafirma ligada a fila, variaveis da aba presentes', () => {
      const fl = JSON.parse(fs.readFileSync(path.join(PASTA, BANCOS[id].flow + '.json'), 'utf8')), por = Object.fromEntries(fl.map(n => [n.id, n])), P = 'chv' + id;
      const conf = por[P + '_confere'], monta = por[P + '_monta'];
      assert.equal(conf.outputs, 3); assert.deepEqual(conf.wires, [[P + '_monta'], [P + '_responde'], [P + '_conf_retry']]);
      assert.deepEqual(por[P + '_conf_retry'].wires, [[P + '_retenta']]); assert.deepEqual(por[P + '_retenta'].wires, [[P + '_s7_read']]);
      assert.equal(monta.outputs, 5); assert.deepEqual(monta.wires[4], [P + '_responde']);
      assert.deepEqual(por[P + '_reafirma'].wires, [[P + '_fila']]); assert.deepEqual(por[P + '_reafirma_inj'].wires, [[P + '_reafirma']]);
      assert.match(conf.func, /incerto = true/); assert.match(conf.func, /fim\(504, corpo\)/); assert.match(monta.func, /AGUARDE_CONFIRMACAO/);
      const salvar = conf.func.slice(conf.func.indexOf("if (ctx.rota === 'SALVAR')"), conf.func.indexOf("if (ctx.rota === 'BANCO')"));
      assert.ok(!/nc\(/.test(salvar), 'SALVAR nao pode usar a janela (SetupOk e decisao do PLC)');
      const tab = fl.find(n => n.type === 'tab'); const nomes = (tab.env || []).map(e => e.name);
      assert.ok(nomes.includes('CONF_JANELA_MS') && nomes.includes('QUARENTENA_MS'));
    });
  }
  test('as versoes anteriores (v3.3/v1.4) nao foram alteradas pelo gerador da 4b', () => {
    for (const n of ['chaves-56-api-v3.3', 'chaves-400-api-v3.3', 'chaves-550-api-v1.4', 'chaves-595-api-v1.4'])
      assert.ok(!fs.readFileSync(path.join(PASTA, n + '.json'), 'utf8').includes('AGUARDE_CONFIRMACAO'), n);
  });
});

for (const id of Object.keys(BANCOS)) {
  describe('C4 4b - BC' + id, () => {
    const P = (h, r, c) => post(h, '/api/chaves/' + id + '/' + r, c);
    const sobeBanco = async () => {
      const h = await sobe({ fluxos: [BANCOS[id].flow], env: ENV_TESTE, envAbas: ABAS }), e = enderecos(id);
      h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true);
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/' + id)).status === 200, 10000), 'banco nao ficou pronto');
      return { h, e };
    };

    test('A4: escrita dentro da janela (900 ms) => 200 sem falso erro; alem da janela (2,5 s) => 504 incerto:true e a escrita chega depois', async () => {
      const { h, e } = await sobeBanco();
      try {
        h.plc.atrasosEscrita.push(900);
        const a = await P(h, 'habilitar', { indice: 3, habilitada: true });
        assert.equal(a.status, 200, a.t); assert.equal(h.plc.ler(e.hab(3)), true);
        h.plc.atrasosEscrita.push(2500);
        const b = await P(h, 'habilitar', { indice: 4, habilitada: true });
        assert.equal(b.status, 504, b.t); assert.equal(b.j.incerto, true);
        assert.equal(h.plc.ler(e.hab(4)), false);
        assert.ok(await esperaAte(() => h.plc.ler(e.hab(4)) === true, 4000));
        assert.equal(V.respostasEmDuplicidade(h.logs).length, 0, JSON.stringify(h.logs.slice(-2)));
      } finally { await h.para(); }
    });

    test('A5: quarentena POR VARIAVEL - a mesma variavel responde 503 AGUARDE_CONFIRMACAO (com Retry-After), outra chave do banco segue livre e, passada a quarentena, a variavel volta', async () => {
      const { h, e } = await sobeBanco();
      try {
        h.plc.atrasosEscrita.push(2500);
        const a = await P(h, 'habilitar', { indice: 4, habilitada: true });
        assert.equal(a.status, 504, a.t);
        const r = await fetch(h.url + '/api/chaves/' + id + '/habilitar', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: h.url }, body: JSON.stringify({ indice: 4, habilitada: true }) });
        const j = await r.json();
        assert.equal(r.status, 503); assert.equal(j.codigo, 'AGUARDE_CONFIRMACAO'); assert.ok(Number(r.headers.get('retry-after')) >= 1, 'faltou o Retry-After');
        const outra = await P(h, 'habilitar', { indice: 5, habilitada: true });
        assert.equal(outra.status, 200, 'a quarentena nao pode travar o banco todo: ' + outra.t);
        await dorme(3300);                                              // fim da quarentena de 3 s
        const depois = await P(h, 'habilitar', { indice: 4, habilitada: true });
        assert.equal(depois.status, 200, 'a variavel nao saiu da quarentena: ' + depois.t);
        assert.equal(V.respostasEmDuplicidade(h.logs).length, 0);
      } finally { await h.para(); }
    });

    test('erro EXPLICITO de escrita no PLC => 500 definitivo (sem quarentena): repetir o mesmo comando logo em seguida funciona', async () => {
      const { h, e } = await sobeBanco();
      try {
        h.plc.falhas.escrita = true;
        const a = await P(h, 'habilitar', { indice: 6, habilitada: true });
        h.plc.falhas.escrita = false;
        assert.equal(a.status, 500, a.t);
        const b = await P(h, 'habilitar', { indice: 6, habilitada: true });
        assert.equal(b.status, 200, 'o erro definitivo nao pode gerar quarentena: ' + b.t); assert.equal(h.plc.ler(e.hab(6)), true);
      } finally { await h.para(); }
    });

    test('desligar BANCO durante a quarentena passa (seguranca) e o fluxo normal sem incerteza continua com 200', async () => {
      const { h, e } = await sobeBanco();
      try {
        h.plc.atrasosEscrita.push(2500);
        const a = await P(h, 'banco', { ligar: true });                 // 504 incerto: LigarBanco entra em quarentena
        assert.equal(a.status, 504, a.t);
        const c = await P(h, 'banco', { ligar: true });
        assert.equal(c.status, 503, 'ligar banco repetido deveria esperar a quarentena: ' + c.t);
        const d = await P(h, 'banco', { ligar: false });
        assert.equal(d.status, 200, 'DESLIGAR banco e comando de seguranca e nao pode ser barrado: ' + d.t);
      } finally { await h.para(); }
    });
  });
}
