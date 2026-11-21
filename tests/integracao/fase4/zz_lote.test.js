'use strict';
/* =====================================================================================================================
   FASE 4 / Passo 10 (item 2) — COMANDO EM LOTE DAS CHAVES: POST /api/chaves/<banco>/lote · 21/11/2026.
   PARA QUE SERVE (leigo): o Patamar liga varias chaves de uma vez (um degrau). Em vez de um comando por chave (cada um esperando a sua vez e a leitura de volta), o medidor pode mandar o degrau
   inteiro num comando so: {"ligar":[1,2,5], "desligar":[7]}. TUDO OU NADA: se uma chave nao puder ligar, nada e escrito. A capacidade e conferida para o CONJUNTO. Desligar nunca e recusado.
   O QUE ESTE TESTE PROVA:
     S   as 4 versoes novas (v3.13, v3.12, v1.13, v1.13) so diferem das anteriores (v3.10, v3.9, v1.10, v1.10) na rota nova e nas emendas dos nos compartilhados; nenhuma rota existente mudou de comportamento;
     L1  caminho feliz: liga e desliga varias chaves num comando, o PLC recebe os bits certos e a resposta lista o que foi feito;
     L2  corpo invalido => 400 e NADA escrito;        L3 tudo ou nada: chave desabilitada, banco desligado, contator colado => recusa o lote inteiro e nada e escrito;
     L4  guarda D3 e leitura velha (503) valem para o lote; lote so de desligar passa sempre;
     L5  capacidade: o conjunto que passa do limite leva 409 (tudo ou nada); dois lotes simultaneos => so cabe um; desligar nunca e recusado; modo registrar so anota;
     L6  velocidade: um lote de 8 chaves termina muito antes de 8 comandos em sequencia;       L7 banco de 18 chaves (BC59,5): indices ate 18.
   CONTRA-PROVA: BT2_LOTE_FLUXO56=chaves-56-api-v3.10 BT2_LOTE_FLUXO595=chaves-595-api-v1.10 (versoes SEM a rota de lote) tem que FALHAR em L1 a L6.
   NAO PROVA: PLC/ET200 reais nem o tempo real de escrita e leitura (bancada).
   ===================================================================================================================== */
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), os = require('os'), path = require('path');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe } = require('../ajudas.js');
const { caminhoFluxo } = require('../../versoes.js');

const RAIZ = path.join(__dirname, '..', '..', '..');
const cfg = JSON.parse(fs.readFileSync(path.join(RAIZ, 'nodered', 'config', 'bancos_capacidade.json'), 'utf8'));
const F56 = process.env.BT2_LOTE_FLUXO56 || 'chaves-56-api-v3.13', F595 = process.env.BT2_LOTE_FLUXO595 || 'chaves-595-api-v1.13', API = 'gerador-capacidade-api-v1.0';
const PARES = { '56': ['chaves-56-api-v3.10', 'chaves-56-api-v3.13'], '400': ['chaves-400-api-v3.9', 'chaves-400-api-v3.12'], '550': ['chaves-550-api-v1.10', 'chaves-550-api-v1.13'], '595': ['chaves-595-api-v1.10', 'chaves-595-api-v1.13'] };   // lote SEM a leitura em blocos (gerar_lote_v0.2)
const lerFl = n => JSON.parse(fs.readFileSync(caminhoFluxo(n), 'utf8'));
const NOVOS_FUNCS = ['fila (uma gravacao por vez)', 'monta escritas por variavel', 'confere leitura x escrita', 'reserva de capacidade na saida da fila (C2)'];

describe('Lote estatico', () => {
  for (const [banco, [antes, depois]] of Object.entries(PARES)) {
    test('S: ' + depois + ' so difere de ' + antes + ' na rota nova e nas emendas (fila, revalida, monta, confere, reserva); as outras rotas ficam identicas', () => {
      const a = lerFl(antes), d = lerFl(depois), poA = Object.fromEntries(a.map(n => [n.id, n])), poD = Object.fromEntries(d.map(n => [n.id, n]));
      assert.deepEqual(a.filter(n => !poD[n.id]).map(n => n.id), [], 'nenhum no pode sumir');
      const novos = d.filter(n => !poA[n.id]); assert.equal(novos.length, 5, 'http in + D3 + frescor + valida lote + grupo');
      assert.deepEqual(novos.map(n => n.type).sort(), ['function', 'function', 'function', 'group', 'http in']);
      const rota = novos.find(n => n.type === 'http in'); assert.equal(rota.method, 'post'); assert.equal(rota.url, '/api/chaves/' + banco + '/lote');
      const permitidos = new Set([a.find(n => n.type === 'tab').id, ...NOVOS_FUNCS.map(s => a.find(n => n.name === s).id), a.find(n => /^revalida na saida da fila/.test(n.name)).id]);
      const indevidos = a.filter(n => JSON.stringify(n) !== JSON.stringify(poD[n.id]) && !permitidos.has(n.id)).map(n => n.name || n.id);
      assert.deepEqual(indevidos, [], 'o lote nao pode alterar nenhum outro no');
      for (const id of permitidos) { if (poA[id].type === 'tab') continue; const dif = Object.keys(poD[id]).filter(k => JSON.stringify(poD[id][k]) !== JSON.stringify(poA[id][k])).sort(); assert.ok(dif.every(k => k === 'func' || k === 'info'), (poA[id].name) + ' so pode mudar func e info: ' + dif); }
      const val = novos.find(n => n.name === 'valida lote'), ligar = a.find(n => n.name === 'valida ligar'), c2 = a.find(n => /_c2_limite$/.test(n.id));
      assert.deepEqual(val.wires, [c2.wires[0], ligar.wires[1]], 'o lote entra na MESMA fila e sai pelo MESMO HTTP response');
      const pad = JSON.parse(/const PADRAO = (\{.*?\});\n/s.exec(poD[a.find(n => /_c2_reserva$/.test(n.id)).id].func)[1]); assert.deepEqual(pad, cfg);
      assert.equal(a.find(n => /_c2_limite$/.test(n.id)).func, d.find(n => /_c2_limite$/.test(n.id)).func, 'o no de entrada (C2) e identico');
    });
  }
});

describe('Lote em execucao: Node-RED real + PLC simulado (BC56)', () => {
  let h, e56, dir;
  const grava = (nome, obj) => { const f = path.join(dir, nome); fs.writeFileSync(f, JSON.stringify(obj)); return f; };
  const comCfg = extra => { const c = JSON.parse(JSON.stringify(cfg)); for (const [k, v] of Object.entries(extra || {})) c[k] = (v && typeof v === 'object' && !Array.isArray(v) && c[k] && typeof c[k] === 'object') ? Object.assign(c[k], v) : v; return c; };
  const prepara = async (arq, opc = {}) => {
    if (h) await h.para();
    h = await sobe({ fluxos: [F56, API], env: ENV_TESTE, envAbas: { BT2_CAPACIDADE_JSON: arq || grava('padrao.json', cfg) } });
    e56 = enderecos('56'); const e400 = enderecos('400');
    for (const [e, n] of [[e56, 13], [e400, 13]]) { if (opc.bancoOff !== true) h.plc.escrever(e.cbBanco, true); for (let i = 1; i <= n; i++) if (!(opc.semHab || []).includes(i)) h.plc.escrever(e.hab(i), true); }
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 10000), 'BC56 sem leitura');
    await new Promise(r => setTimeout(r, 3500));              // o Node-RED le o arquivo de configuracao 2 s depois de subir
  };
  const lote = (corpo, cab) => post(h, '/api/chaves/56/lote', corpo, cab);
  const cbs = async () => ((await get(h, '/api/chaves/56')).j.cbLigar || []);
  const nEsc = () => h.plc.escritas.length;
  const lig = async (i) => { const r = await post(h, '/api/chaves/56/ligar', { indice: i, ligar: true }); if (r.status === 200) await esperaAte(async () => (await cbs())[i - 1] === true, 6000, 100); return r; };
  const dsl = async (i) => { const r = await post(h, '/api/chaves/56/ligar', { indice: i, ligar: false }); if (r.status === 200) await esperaAte(async () => (await cbs())[i - 1] === false, 6000, 100); return r; };
  const kwLigado = async () => (await cbs()).reduce((a, v, i) => a + (v ? [5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 3][i] : 0), 0);
  before(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lote-')); });
  after(async () => { if (h) await h.para(); });

  test('L1: caminho feliz: liga varias chaves num comando, depois liga e desliga no mesmo comando; o PLC recebe os bits certos e a resposta lista o que foi feito', async () => {
    await prepara();
    const r = await lote({ ligar: [1, 2, 3], desligar: [] }); assert.equal(r.status, 200, r.t); assert.deepEqual(r.j, { ok: true, ligadas: [1, 2, 3], desligadas: [] });
    for (const i of [1, 2, 3]) assert.equal(h.plc.ler(e56.cb(i)), true, 'chave ' + i); assert.equal(h.plc.ler(e56.cb(4)), false);
    const r2 = await lote({ ligar: [4], desligar: [1] }); assert.equal(r2.status, 200, r2.t); assert.deepEqual(r2.j, { ok: true, ligadas: [4], desligadas: [1] });
    assert.equal(h.plc.ler(e56.cb(1)), false); assert.equal(h.plc.ler(e56.cb(4)), true); assert.equal(h.plc.ler(e56.cb(2)), true, 'as outras nao mudam');
    assert.ok(await esperaAte(async () => { const c = await cbs(); return c[0] === false && c[3] === true; }, 3000));
    const r3 = await lote({ desligar: [2, 3, 4] }); assert.equal(r3.status, 200, 'lote so de desligar (sem "ligar")'); assert.deepEqual((await cbs()).slice(0, 4), [false, false, false, false]);
    const r4 = await lote({ ligar: [2, 3] }); assert.equal(r4.status, 200, 'sem "desligar"'); for (const i of [2, 3]) assert.equal(h.plc.ler(e56.cb(i)), true);
    await lote({ desligar: [2, 3] });
  });

  test('L2: corpo invalido => 400 e NADA escrito', async () => {
    await prepara(); const antes = nEsc();
    for (const corpo of [{}, { ligar: [] , desligar: [] }, { ligar: 'a' }, { ligar: [1], desligar: 'x' }, { ligar: [0] }, { ligar: [14] }, { ligar: [1.5] }, { ligar: ['1'] }, { ligar: [1, 1] }, { ligar: [1], desligar: [1] }, { desligar: [-1] }, { ligar: Array.from({ length: 14 }, (_, i) => i + 1) }]) {
      const r = await lote(corpo); assert.equal(r.status, 400, JSON.stringify(corpo) + ' => ' + r.status + ' ' + r.t); assert.equal(r.j.ok, false);
    }
    assert.equal((await post(h, '/api/chaves/56/lote', '{nao e json')).status >= 400, true);
    assert.equal(nEsc(), antes, 'corpo invalido nao pode gerar escrita');
  });

  test('L3: TUDO OU NADA: uma chave a ligar que nao pode (desabilitada, banco desligado, contator colado) recusa o lote inteiro e nada e escrito', async () => {
    await prepara(null, { semHab: [5] }); let antes = nEsc();
    const r = await lote({ ligar: [1, 5, 2] }); assert.equal(r.status, 400); assert.match(r.j.erro, /chave 5 esta desabilitada/); assert.equal(nEsc(), antes); assert.equal(h.plc.ler(e56.cb(1)), false, 'a chave 1 (valida) tambem nao pode ter sido ligada');
    h.plc.escrever(e56.sb(2), true); h.plc.escrever('DB3000,X466.1', true);          // chave 2 ligada com falha de retorno = contator colado
    assert.ok(await esperaAte(async () => ((await get(h, '/api/chaves/56')).j.falhaRetorno || [])[1] === true, 3000));
    antes = nEsc();                                                                             // depois das escritas de preparacao deste teste
    const c = await lote({ ligar: [1, 2] }); assert.equal(c.status, 409); assert.equal(c.j.codigo, 'CONTATOR_COLADO'); assert.equal(nEsc(), antes); h.plc.escrever(e56.sb(2), false); h.plc.escrever('DB3000,X466.1', false);
    await prepara(null, { bancoOff: true }); antes = nEsc();
    const b = await lote({ ligar: [1, 2] }); assert.equal(b.status, 409); assert.match(b.j.erro, /banco BC56 desligado/); assert.equal(nEsc(), antes);
    const d = await lote({ desligar: [1, 2] }); assert.equal(d.status, 200, 'desligar passa mesmo com o banco desligado');
  });

  test('L4: a guarda D3 e a leitura velha valem para o lote; lote so de desligar nunca e barrado pelo frescor', async () => {
    await prepara();
    const sem = await lote({ ligar: [1] }, { Origin: undefined }); assert.equal(sem.status, 403); assert.match(sem.j.codigo, /^D3_/);
    const ruim = await lote({ ligar: [1] }, { Origin: 'http://outro.exemplo' }); assert.equal(ruim.status, 403);
    h.plc.falhas.leitura = true; await new Promise(r => setTimeout(r, 3200));
    const velha = await lote({ ligar: [1, 2] }); assert.equal(velha.status, 503); assert.equal(velha.j.codigo, 'LEITURA_VELHA'); assert.equal(h.plc.ler(e56.cb(1)), false);
    h.plc.falhas.leitura = false;
  });

  test('L5: capacidade: o CONJUNTO que passa do limite leva 409 (tudo ou nada); dois lotes simultaneos => so cabe um; desligar nunca recusa; modo registrar so anota', async () => {
    await prepara(grava('rec.json', comCfg({ modo: 'recusar', gerador: { kw100: 20 } })));      // limite 22 kW
    for (const i of [1, 2, 3]) assert.equal((await lig(i)).status, 200);                           // 15 kW
    let antes = nEsc();
    const r = await lote({ ligar: [4, 5] }); assert.equal(r.status, 409, r.t); assert.equal(r.j.codigo, 'LIMITE_EXCEDIDO'); assert.equal(r.j.totalKw, 25); assert.equal(r.j.limiteKw, 22); assert.match(r.j.erro, /lote \[4,5\]/);
    assert.equal(nEsc(), antes, 'lote recusado nao escreve nada'); assert.equal(h.plc.ler(e56.cb(4)), false); assert.equal(h.plc.ler(e56.cb(5)), false);
    const ok = await lote({ ligar: [4] }); assert.equal(ok.status, 200, 'um so cabe (20 kW)'); assert.ok(await esperaAte(async () => (await cbs())[3] === true, 3000));
    const des = await lote({ desligar: [1, 2, 3, 4] }); assert.equal(des.status, 200, 'desligar nunca e recusado');
    assert.ok(await esperaAte(async () => (await cbs()).slice(0, 4).every(v => v === false), 3000));
    for (const i of [1, 2]) assert.equal((await lig(i)).status, 200);                              // 10 kW
    const [a, b] = await Promise.all([lote({ ligar: [3, 4] }), lote({ ligar: [5, 6] })]);          // cada um acrescenta 10 kW (A=20 kW, B=+10 = 30 > 22)
    assert.deepEqual([a.status, b.status].sort(), [200, 409], 'a: ' + a.status + ' b: ' + b.status);
    await new Promise(r => setTimeout(r, 1500)); assert.ok(await kwLigado() <= 22, 'carga final ' + await kwLigado());
    await prepara(grava('reg.json', comCfg({ modo: 'registrar', gerador: { kw100: 20 } })));
    for (const i of [1, 2, 3]) await lig(i);
    const reg = await lote({ ligar: [4, 5] }); assert.equal(reg.status, 200, 'registrar nao recusa'); assert.ok(await esperaAte(async () => (await get(h, '/api/logs/56')).j.logs.some(x => x.rota === 'LIMITE' && /lote \[4,5\]/.test(x.dado) && /so registra/.test(x.erro)), 4000), 'o lote acima do limite e anotado no log');
  });

  test('L6: velocidade: um lote de 8 chaves termina muito antes de 8 comandos em sequencia', async () => {
    await prepara(); h.plc.latencia.escritaMs = 40;
    const t0 = Date.now(); const r = await lote({ ligar: [1, 2, 3, 4, 5, 6, 7, 8] }); const tLote = Date.now() - t0; assert.equal(r.status, 200, r.t);
    await lote({ desligar: [1, 2, 3, 4, 5, 6, 7, 8] }); assert.ok(await esperaAte(async () => (await cbs()).slice(0, 8).every(v => v === false), 4000));
    const t1 = Date.now(); for (let i = 1; i <= 8; i++) assert.equal((await post(h, '/api/chaves/56/ligar', { indice: i, ligar: true })).status, 200); const tSeq = Date.now() - t1;
    console.log('# tempo: lote de 8 chaves = ' + tLote + ' ms | 8 comandos em sequencia = ' + tSeq + ' ms');
    assert.ok(tLote * 2 < tSeq, 'lote ' + tLote + ' ms deveria ser menos da metade da sequencia ' + tSeq + ' ms');
  });

  test('L8: um "Desligar banco" aceito depois cancela o lote que espera na fila (409 CANCELADO_POR_DESLIGAR) e nada do lote e escrito', async () => {
    await prepara(); h.plc.latencia.escritaMs = 600;
    const p1 = post(h, '/api/chaves/56/ligar', { indice: 1, ligar: true });                    // ocupa a fila por mais de 1 s
    await new Promise(r => setTimeout(r, 150)); const pl = lote({ ligar: [2, 3] });             // espera na fila
    h.plc.latencia.escritaMs = 0;                                                               // so a escrita que ja estava em voo e lenta; o Desligar banco (17 escritas) nao pode estourar a janela de 2 s
    await new Promise(r => setTimeout(r, 150)); const pb = post(h, '/api/chaves/56/banco', { ligar: false });   // seguranca: fura a fila e cancela o que depende do banco ligado
    const [, rl, rb] = await Promise.all([p1, pl, pb]);
    assert.equal(rl.status, 409, rl.t); assert.equal(rl.j.codigo, 'CANCELADO_POR_DESLIGAR'); assert.equal(rb.status, 200, rb.t);
    assert.equal(h.plc.ler(e56.cb(2)), false); assert.equal(h.plc.ler(e56.cb(3)), false, 'nada do lote cancelado foi escrito');
  });
});

describe('Lote em execucao (BC59,5: 18 chaves)', () => {
  let h, dir;
  before(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lote595-')); });
  after(async () => { if (h) await h.para(); });
  test('L7: o banco de 18 chaves aceita indices ate 18 e recusa 19', async () => {
    h = await sobe({ fluxos: [F595], env: ENV_TESTE }); const e = enderecos('595'); h.plc.escrever(e.cbBanco, true); for (let i = 1; i <= 18; i++) h.plc.escrever(e.hab(i), true);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/595')).status === 200, 10000), 'BC59,5 sem leitura'); await new Promise(r => setTimeout(r, 1500));
    const r = await post(h, '/api/chaves/595/lote', { ligar: [1, 9, 17, 18] }); assert.equal(r.status, 200, r.t); assert.deepEqual(r.j.ligadas, [1, 9, 17, 18]);
    for (const i of [1, 9, 17, 18]) assert.equal(h.plc.ler(e.cb(i)), true, 'chave ' + i); assert.equal(h.plc.ler(e.cb(2)), false);
    assert.equal((await post(h, '/api/chaves/595/lote', { ligar: [19] })).status, 400);
    assert.equal((await post(h, '/api/chaves/595/lote', { desligar: [1, 9, 17, 18] })).status, 200);
  });
});
