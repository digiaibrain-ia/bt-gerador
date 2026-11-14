'use strict';
// FASE 4 / Portao A (A2): fluxos chaves-56/400 v3.5 contra o PLC SIMULADO.
// Prova: leitura da struct sbRet, regras do 'ligar' (contator colado, eco, habilitacao confirmada), 'habilitar' confirmado pelo banco,
// P3-E1 (leitura velha recusada na entrada), F4-1 e F4-2 (/tensao). O PLC DO BANCO e simulado aqui por um "respondedor" que copia
// habilitada -> habResp (pedido/resposta). NAO prova o SCL nem o ET200 reais. VERSAO por BT2_FASE4_VERSAO (padrao v3.5): a mesma bateria
// rodando na v3.4 tem que FALHAR (verificacao por mutacao).
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { ENV_TESTE, BANCOS, enderecos, esperaAte, get, post, sobe } = require('../ajudas.js');
const { parseAddr } = require('../plc_simulado.js');

const VERSAO = process.env.BT2_FASE4_VERSAO || 'v3.5';
for (const id of ['56', '400']) {
  describe('A2 - chaves-' + id + '-api-' + VERSAO, () => {
    const flow = 'chaves-' + id + '-api-' + VERSAO;
    const B = BANCOS[id], e = enderecos(id);
    const bit = (base, i) => 'DB' + B.db + ',X' + (base + Math.floor((i - 1) / 8)) + '.' + ((i - 1) % 8);
    const a = { habResp: i => bit(464, i), falha: i => bit(466, i), col: i => bit(468, i), eco: 'DB' + B.db + ',X470.0' };
    let h, timer;
    const resp = { ativo: true, eco: true, falha: new Set(), col: new Set(), naoConfirma: new Set() };
    // escrita SEM registrar em plc.escritas (nao polui a contagem de escritas dos fluxos)
    const grava = (addr, v) => { const p = parseAddr(addr), b = h.plc.db(p.db); b[p.byte] = v ? (b[p.byte] | (1 << p.bit)) : (b[p.byte] & ~(1 << p.bit)); };
    const le = addr => h.plc.ler(addr);
    const tick = () => {            // o "PLC do banco": habResp segue o pedido (habilitada) enquanto ativo; eco; falhas controladas pelo teste
      for (let i = 1; i <= 16; i++) {
        if (resp.ativo && !resp.naoConfirma.has(i)) grava(a.habResp(i), le(e.hab(i)));
        grava(a.falha(i), resp.falha.has(i)); grava(a.col(i), resp.col.has(i));
      }
      grava(a.eco, resp.ativo && resp.eco);
    };
    const pronto = async () => { h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true); h.plc.escrever(e.cbBanco, true); for (let i = 1; i <= 13; i++) h.plc.escrever(e.hab(i), true); };
    before(async () => {
      h = await sobe({ fluxos: [flow], env: ENV_TESTE });
      await pronto(); tick(); timer = setInterval(tick, 100);
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/' + id)).status === 200, 10000), 'banco nao ficou pronto');
    });
    after(async () => { clearInterval(timer); if (h) await h.para(); });
    const reset = async () => {
      resp.ativo = true; resp.eco = true; resp.falha.clear(); resp.col.clear(); resp.naoConfirma.clear();
      h.plc.falhas.leitura = false; h.plc.atrasosEscrita.length = 0;
      h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true); h.plc.escrever(e.cbBanco, true);
      for (let i = 1; i <= 16; i++) { h.plc.escrever(e.cb(i), false); h.plc.escrever(e.sb(i), false); h.plc.escrever(e.hab(i), i <= 13); }
      h.plc.escrever(e.chaveSel, 0);
      tick();
      assert.ok(await esperaAte(async () => { const r = await get(h, '/api/chaves/' + id); return r.status === 200 && r.j.respEcoOk !== false; }, 8000, 150), 'nao voltou ao normal');
    };

    test('GET traz os campos novos (aditivo): habResp, falhaRetorno, contatorColado, respEcoOk', async () => {
      await reset(); resp.falha.add(5); resp.col.add(6); tick();
      assert.ok(await esperaAte(async () => { const r = await get(h, '/api/chaves/' + id); return r.j && Array.isArray(r.j.falhaRetorno) && r.j.falhaRetorno[4] === true; }, 5000), 'falhaRetorno[5] nao apareceu no GET');
      const r = await get(h, '/api/chaves/' + id);
      assert.equal(r.j.contatorColado[5], true); assert.equal(r.j.falhaRetorno[3], false);
      assert.equal(r.j.habResp[0], true); assert.equal(r.j.respEcoOk, true);
      assert.ok(Array.isArray(r.j.cbLigar) && Array.isArray(r.j.ligada), 'campos antigos continuam');
    });

    test('ligar: contator colado (retorno ativo + falha travada) -> 409 CONTATOR_COLADO e nada e escrito', async () => {
      await reset(); resp.col.add(6); h.plc.escrever(e.sb(6), true); tick();
      assert.ok(await esperaAte(async () => { const g = (await get(h, '/api/chaves/' + id)).j; return g.contatorColado?.[5] === true && g.ligada?.[5] === true; }, 5000));
      const antes = h.plc.escritas.length;
      const r = await post(h, '/api/chaves/' + id + '/ligar', { indice: 6, ligar: true });
      assert.equal(r.status, 409, r.t); assert.equal(r.j.codigo, 'CONTATOR_COLADO');
      assert.equal(h.plc.escritas.length, antes);
    });

    test('ligar: falha de retorno TRAVADA com retorno em 0 NAO recusa (o novo comando e o rearme) e grava o CB', async () => {
      await reset(); resp.falha.add(5); tick();
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/' + id)).j.falhaRetorno?.[4] === true, 5000));
      const r = await post(h, '/api/chaves/' + id + '/ligar', { indice: 5, ligar: true });
      assert.equal(r.status, 200, r.t); assert.equal(le(e.cb(5)), true);
    });

    test('ligar: sem eco do PLC do banco -> 409 SEM_ECO e nada e escrito', async () => {
      await reset(); resp.eco = false; tick();
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/' + id)).j.respEcoOk === false, 5000));
      const antes = h.plc.escritas.length;
      const r = await post(h, '/api/chaves/' + id + '/ligar', { indice: 3, ligar: true });
      assert.equal(r.status, 409, r.t); assert.equal(r.j.codigo, 'SEM_ECO'); assert.equal(h.plc.escritas.length, antes);
    });

    test('ligar: habilitacao NAO confirmada pelo banco -> 409 HAB_NAO_CONFIRMADA e nada e escrito', async () => {
      await reset(); resp.naoConfirma.add(7); grava(a.habResp(7), false); tick();
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/' + id)).j.habResp?.[6] === false, 5000));
      const antes = h.plc.escritas.length;
      const r = await post(h, '/api/chaves/' + id + '/ligar', { indice: 7, ligar: true });
      assert.equal(r.status, 409, r.t); assert.equal(r.j.codigo, 'HAB_NAO_CONFIRMADA'); assert.equal(h.plc.escritas.length, antes);
    });

    test('ligar normal continua funcionando (banco confirma, sem falhas)', async () => {
      await reset();
      const r = await post(h, '/api/chaves/' + id + '/ligar', { indice: 2, ligar: true });
      assert.equal(r.status, 200, r.t); assert.equal(le(e.cb(2)), true);
    });

    test('habilitar: confirmado pelo PLC do banco -> 200 habConfirmadaBanco:true', async () => {
      await reset();
      const r = await post(h, '/api/chaves/' + id + '/habilitar', { indice: 8, habilitada: false });
      assert.equal(r.status, 200, r.t); assert.equal(r.j.habConfirmadaBanco, true); assert.equal(le(e.hab(8)), false);
    });

    test('habilitar: o banco NAO responde (habResp parado) -> 504 incerto (nao 200)', async () => {
      await reset(); resp.naoConfirma.add(9); grava(a.habResp(9), true); tick();
      const r = await post(h, '/api/chaves/' + id + '/habilitar', { indice: 9, habilitada: false });
      assert.equal(r.status, 504, r.t); assert.equal(r.j.incerto, true);
    });

    test('habilitar: sem comunicacao 1515-ET200 -> 200 com habConfirmadaBanco:false (gravado no 1515)', async () => {
      await reset(); h.plc.escrever(e.comOk, false);
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/' + id)).j.comEt200Ok === false, 5000));
      const r = await post(h, '/api/chaves/' + id + '/habilitar', { indice: 10, habilitada: false });
      assert.equal(r.status, 200, r.t); assert.equal(r.j.habConfirmadaBanco, false);
    });

    test('P3-E1: com a leitura velha, comando que nao e de seguranca e recusado NA ENTRADA (503 LEITURA_VELHA, rapido, sem escrita)', async () => {
      await reset(); h.plc.falhas.leitura = true;
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/' + id)).status === 503, 7000, 150));
      const antes = h.plc.escritas.length, t0 = Date.now();
      const r = await post(h, '/api/chaves/' + id + '/habilitar', { indice: 4, habilitada: false });
      assert.equal(r.status, 503, r.t); assert.equal(r.j.codigo, 'LEITURA_VELHA');
      assert.ok(Date.now() - t0 < 1500, 'demorou ' + (Date.now() - t0) + ' ms (deveria falhar na hora)');
      assert.equal(h.plc.escritas.length, antes);
      const s = await post(h, '/api/chaves/' + id + '/ligar', { indice: 4, ligar: false });   // seguranca: desligar passa SEMPRE
      assert.notEqual(s.j && s.j.codigo, 'LEITURA_VELHA', 'desligar e comando de seguranca: nao pode ser recusado por leitura velha');
      h.plc.falhas.leitura = false;
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/' + id)).status === 200, 8000));
    });

    test('F4-1: /tensao com o PLC sem resposta recusa ANTES de escrever (503)', async () => {
      await reset(); h.plc.falhas.leitura = true;
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/' + id)).status === 503, 7000, 150));
      const antes = h.plc.escritas.length;
      const r = await post(h, '/api/chaves/' + id + '/tensao', { tensao: 440 });
      assert.equal(r.status, 503, r.t); assert.equal(h.plc.escritas.length, antes, 'nao deveria nem tentar escrever');
      h.plc.falhas.leitura = false;
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/' + id)).status === 200, 8000));
    });

    test('F4-2: /tensao com escrita lenta (PLC aplica depois) responde 504 incerto, nunca 500', async () => {
      await reset();
      // a leitura do DB por tensao (ciclo de 1 s) volta um pouco depois da principal: espera ela ficar fresca (a rota agora exige <= 2,5 s)
      assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/' + id)).j.tensaoSel !== null, 8000, 150), 'DB por tensao sem leitura');
      await new Promise(r2 => setTimeout(r2, 1300));
      h.plc.atrasosEscrita.push(4000);
      const r = await post(h, '/api/chaves/' + id + '/tensao', { tensao: 380 });
      assert.notEqual(r.status, 500, 'erro 500 com a escrita ainda em voo: ' + r.t);
      assert.equal(r.status, 504, r.t); assert.equal(r.j.incerto, true);
      h.plc.atrasosEscrita.length = 0;
      await new Promise(r2 => setTimeout(r2, 4500));   // deixa a escrita lenta terminar antes do proximo teste
    });
  });
}
