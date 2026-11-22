'use strict';
/* =====================================================================================================================
   FASE 4 / Passo 9 — CORRIDA DO LIMITE DE CAPACIDADE (C2b: reserva na saida da fila) · 20/11/2026.
   PARA QUE SERVE (leigo): com "modo": "recusar" o Node-RED recusa (409) o comando de LIGAR que passaria do limite do gerador (kw100 x 110 %). Antes desta correcao, dois comandos
   quase ao mesmo tempo (duplo clique, duas telas, dois bancos) enxergavam a MESMA carga e os dois passavam, estourando o limite. Agora o limite e conferido de novo na saida da fila
   somando o que ja foi aceito e ainda nao apareceu no PLC (a "reserva"), e o outro banco enxerga a reserva na hora.
   O QUE ESTE TESTE PROVA:
     S   as 4 versoes novas so diferem das C2 no no de reserva, na fiacao do "revalida", no cache que publica o kW e na descricao; o no de entrada (C2) e identico;
     C1  mesmo banco: dois LIGAR simultaneos que juntos passam do limite => exatamente um e aceito, o outro leva 409 e o PLC NAO recebe o comando; tres simultaneos => so cabe um;
     C2  entre bancos (56 e 400): dois LIGAR simultaneos, um em cada banco => exatamente um e aceito;
     C3  sem falso bloqueio: 4 chaves em sequencia rapida (sem esperar o PLC) cabem no limite e passam; a 5a leva 409; desligando uma, a 5a passa (a reserva nao fica "fantasma");
     C4  modo registrar: nada e recusado, como antes;   C5 desligar nunca e recusado, nem com reserva em voo.
   CONTRA-PROVA: BT2_C2B_FLUXO56=chaves-56-api-v3.9 BT2_C2B_FLUXO400=chaves-400-api-v3.8 (versoes SEM a reserva) tem que FALHAR em C1 e C2.
   NAO PROVA: PLC/ET200 reais nem os tempos reais de escrita e leitura (bancada).
   ===================================================================================================================== */
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), os = require('os'), path = require('path');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe } = require('../ajudas.js');
const { caminhoFluxo } = require('../../versoes.js');

const RAIZ = path.join(__dirname, '..', '..', '..');
const cfg = JSON.parse(fs.readFileSync(path.join(RAIZ, 'nodered', 'config', 'bancos_capacidade.json'), 'utf8'));
const F56 = process.env.BT2_C2B_FLUXO56 || 'chaves-56-api-v3.10', F400 = process.env.BT2_C2B_FLUXO400 || 'chaves-400-api-v3.9', API = 'gerador-capacidade-api-v1.0';
const PARES = { '56': ['chaves-56-api-v3.9', 'chaves-56-api-v3.10'], '400': ['chaves-400-api-v3.8', 'chaves-400-api-v3.9'], '550': ['chaves-550-api-v1.9', 'chaves-550-api-v1.10'], '595': ['chaves-595-api-v1.9', 'chaves-595-api-v1.10'] };
const lerFl = n => JSON.parse(fs.readFileSync(caminhoFluxo(n), 'utf8'));

describe('C2b estatico', () => {
  for (const [banco, [antes, depois]] of Object.entries(PARES)) {
    test('S: ' + depois + ' so difere de ' + antes + ' no no de reserva, na fiacao do revalida e no cache que publica o kW', () => {
      const a = lerFl(antes), d = lerFl(depois), poA = Object.fromEntries(a.map(n => [n.id, n])), poD = Object.fromEntries(d.map(n => [n.id, n]));
      const sumiu = a.filter(n => !poD[n.id]).map(n => n.id), novo = d.filter(n => !poA[n.id]).map(n => n.id);
      assert.deepEqual(sumiu, [], 'nenhum no pode sumir'); assert.equal(novo.length, 1); assert.match(novo[0], /_c2_reserva$/);
      const tab = a.find(n => n.type === 'tab'), cache = a.find(n => n.name === 'guarda leitura ao vivo (cache)'), rev = a.find(n => /^revalida na saida da fila/.test(n.name)), monta = a.find(n => n.name === 'monta escritas por variavel');
      const wd = a.find(n => /^watchdog 8s/.test(n.name)), resp = a.find(n => n.name === 'responde + libera fila');
      const permitidos = new Set([tab.id, cache.id, rev.id, rev.g]);
      const indevidos = a.filter(n => JSON.stringify(n) !== JSON.stringify(poD[n.id]) && !permitidos.has(n.id)).map(n => n.name || n.id);
      assert.deepEqual(indevidos, [], 'o C2b nao pode alterar nenhum outro no (inclui o no de entrada do C2)');
      assert.deepEqual(rev.wires[0], [monta.id, wd.id]); assert.deepEqual(poD[rev.id].wires[0], [novo[0]], 'o revalida passa a alimentar o no de reserva');
      assert.deepEqual(poD[rev.id].wires[1], rev.wires[1], 'a saida de erro do revalida nao muda');
      const r = poD[novo[0]]; assert.equal(r.outputs, 2); assert.deepEqual(r.wires, [[monta.id, wd.id], [resp.id]], 'segue como antes (monta + watchdog); recusa responde pelo mesmo caminho');
      const dif = Object.keys(poD[cache.id]).filter(k => JSON.stringify(poD[cache.id][k]) !== JSON.stringify(cache[k])).sort(); assert.deepEqual(dif, ['func', 'info'], 'no cache so muda func e info');
      const pad = JSON.parse(/const PADRAO = (\{.*?\});\n/s.exec(r.func)[1]); assert.deepEqual(pad, cfg, 'o padrao embutido deve ser igual ao arquivo inteiro');
      assert.ok(/chv\d+_resv/.test(poD[cache.id].func) && /reservasVivas/.test(poD[cache.id].func));
      assert.equal(a.find(n => /_c2_limite$/.test(n.id)).func, d.find(n => /_c2_limite$/.test(n.id)).func, 'o no de entrada (C2) e identico');
    });
  }
});

describe('C2b em execucao: Node-RED real + PLC simulado', () => {
  let h, e56, e400, dir;
  const grava = (nome, obj) => { const f = path.join(dir, nome); fs.writeFileSync(f, JSON.stringify(obj)); return f; };
  const comCfg = extra => { const c = JSON.parse(JSON.stringify(cfg)); for (const [k, v] of Object.entries(extra || {})) c[k] = (v && typeof v === 'object' && !Array.isArray(v) && c[k] && typeof c[k] === 'object') ? Object.assign(c[k], v) : v; return c; };
  const prepara = async (arq, fluxos = [F56, API]) => {
    if (h) await h.para();
    h = await sobe({ fluxos, env: ENV_TESTE, envAbas: { BT2_CAPACIDADE_JSON: arq } });
    e56 = enderecos('56'); e400 = enderecos('400');
    for (const [e, n] of [[e56, 13], [e400, 13]]) { h.plc.escrever(e.cbBanco, true); for (let i = 1; i <= n; i++) h.plc.escrever(e.hab(i), true); }
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 10000), 'BC56 sem leitura');
    if (fluxos.includes(F400)) assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/400')).status === 200, 10000), 'BC400 sem leitura');
    await new Promise(r => setTimeout(r, 3500));              // o Node-RED le o arquivo de configuracao 2 s depois de subir
  };
  const cbs = async (rota = '56') => ((await get(h, '/api/chaves/' + rota)).j.cbLigar || []);
  const ligar = async (i, rota = '56') => {
    const r = await post(h, '/api/chaves/' + rota + '/ligar', { indice: i, ligar: true });
    if (r.status === 200) assert.ok(await esperaAte(async () => (await cbs(rota))[i - 1] === true, 6000, 100), 'cbLigar nao refletiu a chave ' + i);
    return r;
  };
  const desligar = async (i, rota = '56') => {
    const r = await post(h, '/api/chaves/' + rota + '/ligar', { indice: i, ligar: false });
    if (r.status === 200) assert.ok(await esperaAte(async () => (await cbs(rota))[i - 1] === false, 6000, 100), 'cbLigar nao voltou a false');
    return r;
  };
  const simultaneos = (lista) => Promise.all(lista.map(([rota, i]) => post(h, '/api/chaves/' + rota + '/ligar', { indice: i, ligar: true })));
  const kwLigado = async (rota = '56', kws = [5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 3]) => (await cbs(rota)).reduce((a, v, i) => a + (v ? kws[i] : 0), 0);
  before(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cap-c2b-')); });
  after(async () => { if (h) await h.para(); });

  test('C1: mesmo banco: dois LIGAR simultaneos que juntos passam do limite => exatamente um e aceito; tres simultaneos => so cabe um', async () => {
    await prepara(grava('c1.json', comCfg({ modo: 'recusar', gerador: { kw100: 20 } })));      // limite 22 kW
    for (let i = 1; i <= 3; i++) assert.equal((await ligar(i)).status, 200);                      // 15 kW
    const antes = h.plc.escritas.length;
    const [a, b] = await simultaneos([['56', 4], ['56', 5]]);
    assert.deepEqual([a.status, b.status].sort(), [200, 409], 'a: ' + a.status + ' b: ' + b.status);
    const rec = a.status === 409 ? a : b; assert.equal(rec.j.codigo, 'LIMITE_EXCEDIDO'); assert.equal(rec.j.totalKw, 25); assert.equal(rec.j.limiteKw, 22);
    await new Promise(r => setTimeout(r, 1500));
    assert.equal(await kwLigado(), 20, 'so 20 kW comandados (limite 22)');
    assert.ok(h.plc.escritas.length > antes);
    const recusada = a.status === 409 ? 4 : 5; assert.equal(h.plc.ler(e56.cb(recusada)), false, 'o PLC nao pode ter recebido o comando recusado');
    for (let i = 4; i >= 1; i--) await desligar(i);
    for (let i = 1; i <= 3; i++) assert.equal((await ligar(i)).status, 200);
    const tres = await simultaneos([['56', 4], ['56', 5], ['56', 6]]);
    assert.equal(tres.filter(r => r.status === 200).length, 1, 'de tres, so um cabe: ' + tres.map(r => r.status).join(','));
    assert.equal(tres.filter(r => r.status === 409).length, 2);
    await new Promise(r => setTimeout(r, 1500)); assert.ok(await kwLigado() <= 22, 'nunca acima do limite');
  });

  test('C2: entre bancos (56 e 400): dois LIGAR simultaneos, um em cada banco, que juntos passam do limite => exatamente um e aceito', async () => {
    await prepara(grava('c2.json', comCfg({ modo: 'recusar', gerador: { kw100: 20 } })), [F56, F400, API]);
    for (let i = 1; i <= 3; i++) assert.equal((await ligar(i, '56')).status, 200);               // 15 kW no 56
    const [a, b] = await simultaneos([['56', 4], ['400', 1]]);                                     // +5 kW de cada lado: 25 > 22
    assert.deepEqual([a.status, b.status].sort(), [200, 409], 'a: ' + a.status + ' b: ' + b.status);
    await new Promise(r => setTimeout(r, 1500));
    const total = await kwLigado('56') + await kwLigado('400', [5, 5, 10, 10, 10, 10, 50, 50, 50, 50, 50, 50, 50]);
    assert.ok(total <= 22, 'carga total dos dois bancos = ' + total + ' kW (limite 22)');
  });

  test('C3: sem falso bloqueio: 4 chaves em sequencia rapida (sem esperar o PLC) passam; a 5a leva 409; desligando uma, a 5a passa', async () => {
    await prepara(grava('c3.json', comCfg({ modo: 'recusar', gerador: { kw100: 20 } })));
    for (let i = 1; i <= 4; i++) assert.equal((await post(h, '/api/chaves/56/ligar', { indice: i, ligar: true })).status, 200, 'chave ' + i + ' cabe (ate 20 kW)');
    const quinta = await post(h, '/api/chaves/56/ligar', { indice: 5, ligar: true });
    assert.equal(quinta.status, 409, JSON.stringify(quinta.j));
    assert.ok(await esperaAte(async () => (await cbs()).slice(0, 4).every(v => v === true), 6000, 100));
    assert.equal((await desligar(1)).status, 200);
    assert.equal((await ligar(5)).status, 200, 'sem reserva fantasma: 15 + 5 = 20 kW cabe');
    for (let i = 5; i >= 2; i--) assert.equal((await desligar(i)).status, 200);
  });

  test('C4: modo registrar: nada e recusado (como antes), mesmo com dois LIGAR simultaneos acima do limite', async () => {
    await prepara(grava('c4.json', comCfg({ modo: 'registrar', gerador: { kw100: 20 } })));
    for (let i = 1; i <= 3; i++) assert.equal((await ligar(i)).status, 200);
    const [a, b] = await simultaneos([['56', 4], ['56', 5]]);
    assert.deepEqual([a.status, b.status], [200, 200]);
    await new Promise(r => setTimeout(r, 1500)); assert.equal(await kwLigado(), 25);
  });

  test('C5: desligar nunca e recusado, nem com LIGAR em voo na fila', async () => {
    await prepara(grava('c5.json', comCfg({ modo: 'recusar', gerador: { kw100: 20 } })));
    for (let i = 1; i <= 4; i++) assert.equal((await ligar(i)).status, 200);                      // 20 kW
    const r = await Promise.all([post(h, '/api/chaves/56/ligar', { indice: 5, ligar: true }), post(h, '/api/chaves/56/ligar', { indice: 1, ligar: false }), post(h, '/api/chaves/56/ligar', { indice: 2, ligar: false })]);
    assert.equal(r[1].status, 200, 'desligar nao e recusado'); assert.equal(r[2].status, 200);
    await new Promise(r2 => setTimeout(r2, 1500));
    for (let i = 5; i >= 1; i--) await post(h, '/api/chaves/56/ligar', { indice: i, ligar: false });
  });
});
