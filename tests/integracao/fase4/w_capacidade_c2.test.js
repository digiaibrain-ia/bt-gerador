'use strict';
/* =====================================================================================================================
   FASE 4 / Passo 5 (C2) — LIMITE DE CAPACIDADE E DEGRAU QUE PODEM RECUSAR (19/11/2026).
   PARA QUE SERVE (leigo): com "modo": "recusar" no arquivo de capacidade o Node-RED recusa (HTTP 409) o comando de LIGAR chave que levaria a carga acima do limite
   do gerador (kw100 x pctLim / 100) ou acima do degrau permitido. DESLIGAR nunca e recusado. Com o padrao do arquivo ("registrar") nada e recusado.
   O kW a 100 % do gerador vem do arquivo (se preenchido) ou do medidor (POST /api/gerador/capacidade); sem nenhum dos dois o limite nao e avaliado e NADA e recusado.
   O QUE ESTE TESTE PROVA:
     S3  as 4 versoes C2 so diferem das do C1 no no de limite, na validacao do arquivo e no padrao embutido (nada mais mudou); padrao embutido = arquivo inteiro;
     R1  modo registrar: passa do limite mas o comando e aceito (so anota);   R2 modo recusar: 409 LIMITE_EXCEDIDO e o PLC NAO recebe o comando; desligar sempre passa;
     R3  sem kw100 conhecido nunca recusa;   R4 rota do medidor: guarda D3, validacao (400), efetivo no GET, limite vale;   R5 kw100 do arquivo vale mais que o do medidor;
     R6  o valor do medidor vence apos validade_s;   R7 degrau;   R8 soma entre bancos;   R9 arquivo invalido: padrao embutido (nada recusa);   R10 arquivo do repositorio: nada recusa.
   CONTRA-PROVA: BT2_C2_FLUXO56=chaves-56-api-v3.8 BT2_C2_FLUXO400=chaves-400-api-v3.7 (versoes do C1, que nunca recusam) tem que FALHAR em R2, R4, R5, R7 e R8.
   NAO PROVA: o PLC/ET200 reais nem o valor do degrau (BK-AUD-10: nao ha valor normativo; o teste usa valores de teste).
   ===================================================================================================================== */
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), os = require('os'), path = require('path');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe } = require('../ajudas.js');
const { caminhoFluxo } = require('../../versoes.js');

const RAIZ = path.join(__dirname, '..', '..', '..');
const CONFIG = path.join(RAIZ, 'nodered', 'config', 'bancos_capacidade.json');
const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
const F56 = process.env.BT2_C2_FLUXO56 || 'chaves-56-api-v3.9', F400 = process.env.BT2_C2_FLUXO400 || 'chaves-400-api-v3.8', API = 'gerador-capacidade-api-v1.0';
const PARES = { '56': ['chaves-56-api-v3.8', 'chaves-56-api-v3.9'], '400': ['chaves-400-api-v3.7', 'chaves-400-api-v3.8'], '550': ['chaves-550-api-v1.8', 'chaves-550-api-v1.9'], '595': ['chaves-595-api-v1.8', 'chaves-595-api-v1.9'] };
const lerFl = n => JSON.parse(fs.readFileSync(caminhoFluxo(n), 'utf8'));

describe('C2 estatico', () => {
  test('o arquivo de capacidade v0.2 tem os campos novos e valores padrao seguros', () => {
    assert.equal(cfg.modo, 'registrar'); assert.equal(cfg.gerador.kw100, null); assert.equal(cfg.degrau.max_kw, null);
    assert.ok(cfg.gerador.kw100_max > 0 && cfg.gerador.validade_s >= 10 && cfg.degrau.janela_s >= 1);
  });
  for (const [rota, [antes, depois]] of Object.entries(PARES)) {
    test('S3: ' + depois + ' so difere de ' + antes + ' no limite (C2), na validacao do arquivo e no padrao embutido', () => {
      const a = lerFl(antes), d = lerFl(depois), poA = Object.fromEntries(a.map(n => [n.id, n])), poD = Object.fromEntries(d.map(n => [n.id, n]));
      const sumiu = a.filter(n => !poD[n.id]).map(n => n.id), novo = d.filter(n => !poA[n.id]).map(n => n.id);
      assert.deepEqual([sumiu.length, novo.length], [1, 1]); assert.match(sumiu[0], /_c1_limite$/); assert.match(novo[0], /_c2_limite$/);
      const val = a.find(n => n.name === 'valida ligar');
      const permitidos = new Set([a.find(n => n.type === 'tab').id, a.find(n => n.name === 'guarda leitura ao vivo (cache)').id, val.id, val.g, sumiu[0], poA[sumiu[0]] && a.find(n => /_c1_cfg$/.test(n.id)).id]);
      const indevidos = a.filter(n => poD[n.id] && JSON.stringify(n) !== JSON.stringify(poD[n.id]) && !permitidos.has(n.id)).map(n => n.name || n.id);
      assert.deepEqual(indevidos, [], 'o C2 nao pode alterar nenhum outro no');
      const cap = poD[novo[0]]; assert.equal(cap.outputs, 2);
      assert.deepEqual(poD[val.id].wires[0], [cap.id]); assert.deepEqual(poD[val.id].wires[1], val.wires[1], 'a saida de erro de "valida ligar" nao pode mudar');
      assert.deepEqual(cap.wires[0], poA[sumiu[0]].wires[0], 'a saida normal segue para a mesma fila de antes');
      assert.deepEqual(cap.wires[1], val.wires[1], 'a recusa usa o mesmo caminho de resposta HTTP dos outros erros');
      const pad = JSON.parse(/const PADRAO = (\{.*?\});\n/s.exec(cap.func)[1]); assert.deepEqual(pad, cfg, 'o padrao embutido deve ser igual ao arquivo inteiro');
      const pg = JSON.parse(/const PADRAO = (\{.*?\});\n/s.exec(poD[a.find(n => n.name === 'guarda leitura ao vivo (cache)').id].func)[1]); assert.deepEqual(pg, cfg);
    });
  }
  test('o fluxo gerador-capacidade-api-v1.0: rotas, guarda D3 e padrao embutido', () => {
    const f = lerFl(API), rotas = f.filter(n => n.type === 'http in').map(n => n.method + ' ' + n.url).sort();
    assert.deepEqual(rotas, ['get /api/gerador/capacidade', 'post /api/gerador/capacidade']);
    assert.ok(f.some(n => n.type === 'function' && /PORTAO 3 \(D3\)/.test(n.func)), 'a escrita precisa da guarda D3');
    for (const n of f.filter(n => n.type === 'function' && /const PADRAO = /.test(n.func))) assert.deepEqual(JSON.parse(/const PADRAO = (\{.*?\});\n/s.exec(n.func)[1]), cfg);
    assert.ok(!f.some(n => /s7/.test(n.type)), 'sem nos S7');
  });
});

describe('C2 em execucao: Node-RED real + PLC simulado', () => {
  let h, e56, dir;
  const grava = (nome, obj) => { const f = path.join(dir, nome); fs.writeFileSync(f, typeof obj === 'string' ? obj : JSON.stringify(obj)); return f; };
  const comCfg = extra => { const c = JSON.parse(JSON.stringify(cfg)); for (const [k, v] of Object.entries(extra || {})) c[k] = (v && typeof v === 'object' && !Array.isArray(v) && c[k] && typeof c[k] === 'object') ? Object.assign(c[k], v) : v; return c; };
  const logs = async (rota = '56') => (await get(h, '/api/logs/' + rota)).j.logs;
  const reg = async (tipo, rota = '56') => (await logs(rota)).filter(x => x.rota === tipo);
  const prepara = async (arq, fluxos = [F56, API]) => {
    if (h) await h.para();
    h = await sobe({ fluxos, env: ENV_TESTE, envAbas: { BT2_CAPACIDADE_JSON: arq } });
    e56 = enderecos('56'); const e400 = enderecos('400');
    for (const [e, n] of [[e56, 13], [e400, 13]]) { h.plc.escrever(e.cbBanco, true); for (let i = 1; i <= n; i++) h.plc.escrever(e.hab(i), true); }
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 10000), 'BC56 sem leitura');
    await new Promise(r => setTimeout(r, 3500));              // o Node-RED le o arquivo de configuracao 2 s depois de subir
  };
  const ligar = async (i, rota = '56') => {
    const r = await post(h, '/api/chaves/' + rota + '/ligar', { indice: i, ligar: true });
    if (r.status === 200) assert.ok(await esperaAte(async () => ((await get(h, '/api/chaves/' + rota)).j.cbLigar || [])[i - 1] === true, 6000, 100), 'cbLigar nao refletiu a chave ' + i);
    return r;
  };
  const desligar = async (i, rota = '56') => {
    const r = await post(h, '/api/chaves/' + rota + '/ligar', { indice: i, ligar: false });
    if (r.status === 200) assert.ok(await esperaAte(async () => ((await get(h, '/api/chaves/' + rota)).j.cbLigar || [])[i - 1] === false, 6000, 100), 'cbLigar nao voltou a false');
    return r;
  };
  before(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cap-c2-')); });
  after(async () => { if (h) await h.para(); });

  test('R1: modo registrar: passa do limite, o comando e ACEITO e so anota', async () => {
    await prepara(grava('r1.json', comCfg({ modo: 'registrar', gerador: { kw100: 20 } })));
    for (let i = 1; i <= 4; i++) assert.equal((await ligar(i)).status, 200);
    const r = await ligar(5); assert.equal(r.status, 200, 'registrar nao recusa'); assert.equal(h.plc.ler(e56.cb(5)), true);
    assert.ok(await esperaAte(async () => (await reg('LIMITE')).length === 1, 4000)); assert.match((await reg('LIMITE'))[0].erro, /so registra/);
  });

  test('R2: modo recusar: 409 LIMITE_EXCEDIDO, o PLC NAO recebe o comando e desligar sempre passa', async () => {
    await prepara(grava('r2.json', comCfg({ modo: 'recusar', gerador: { kw100: 20 } })));      // limite 22 kW
    for (let i = 1; i <= 4; i++) assert.equal((await ligar(i)).status, 200);                     // 20 kW
    const antes = h.plc.escritas.length;
    const r = await post(h, '/api/chaves/56/ligar', { indice: 5, ligar: true });
    assert.equal(r.status, 409, JSON.stringify(r.j)); assert.equal(r.j.ok, false); assert.equal(r.j.codigo, 'LIMITE_EXCEDIDO');
    assert.equal(r.j.totalKw, 25); assert.equal(r.j.limiteKw, 22); assert.equal(r.j.origemKw100, 'arquivo');
    await new Promise(r => setTimeout(r, 800));
    assert.equal(h.plc.ler(e56.cb(5)), false, 'o PLC nao pode ter recebido o comando recusado'); assert.equal(h.plc.escritas.length, antes, 'nenhuma escrita nova no PLC');
    assert.match((await reg('LIMITE'))[0].erro, /RECUSADO/);
    assert.equal((await desligar(1)).status, 200, 'desligar nunca e recusado');
    assert.equal((await ligar(5)).status, 200, 'com 5 kW livres a mesma chave passa (20 kW)');
    assert.equal((await post(h, '/api/chaves/56/ligar', { indice: 6, ligar: true })).status, 409, 'agora 24 kW > 22');
    for (let i = 5; i >= 2; i--) assert.equal((await desligar(i)).status, 200, 'desligar mesmo acima do limite');
  });

  test('R3: sem kw100 conhecido (arquivo e medidor) NUNCA recusa, mesmo em modo recusar', async () => {
    await prepara(grava('r3.json', comCfg({ modo: 'recusar' })));
    for (let i = 1; i <= 13; i++) assert.equal((await ligar(i)).status, 200, 'chave ' + i);            // 56 kW, sem limite conhecido
    assert.deepEqual(await reg('LIMITE'), []);
  });

  test('R4: rota do medidor: guarda D3, validacao 400, efetivo no GET e o limite passa a valer', async () => {
    await prepara(grava('r4.json', comCfg({ modo: 'recusar' })));
    assert.equal((await post(h, '/api/gerador/capacidade', { kw100: 20 }, { Origin: undefined, Referer: undefined })).status, 403, 'sem origem');
    assert.equal((await post(h, '/api/gerador/capacidade', { kw100: 20 }, { Origin: 'http://evil.example' })).status, 403, 'origem de outro site');
    for (const ruim of [0, -5, 'abc', '', null, 5000, {}]) { const r = await post(h, '/api/gerador/capacidade', { kw100: ruim }); assert.equal(r.status, 400, 'kw100 ' + JSON.stringify(ruim) + ' deveria ser 400'); assert.equal(r.j.codigo, 'KW100_INVALIDO'); }
    assert.equal((await get(h, '/api/gerador/capacidade')).j.efetivo.kw100, null);
    const ok = await post(h, '/api/gerador/capacidade', { kw100: 20, modelo: 'Modelo de teste' }); assert.equal(ok.status, 200); assert.equal(ok.j.kw100, 20);
    const g = (await get(h, '/api/gerador/capacidade')).j;
    assert.deepEqual([g.efetivo.kw100, g.efetivo.origem, g.limiteKw, g.modo], [20, 'medidor', 22, 'recusar']); assert.equal(g.kw100Medidor.valido, true); assert.equal(g.kw100Medidor.modelo, 'Modelo de teste');
    for (let i = 1; i <= 4; i++) assert.equal((await ligar(i)).status, 200);
    assert.equal((await post(h, '/api/chaves/56/ligar', { indice: 5, ligar: true })).status, 409);
  });

  test('R5: o kw100 do ARQUIVO vale mais que o do medidor', async () => {
    await prepara(grava('r5.json', comCfg({ modo: 'recusar', gerador: { kw100: 20 } })));
    assert.equal((await post(h, '/api/gerador/capacidade', { kw100: 900 })).status, 200);         // o medidor tenta afrouxar o limite
    assert.equal((await get(h, '/api/gerador/capacidade')).j.efetivo.origem, 'arquivo');
    for (let i = 1; i <= 4; i++) assert.equal((await ligar(i)).status, 200);
    assert.equal((await post(h, '/api/chaves/56/ligar', { indice: 5, ligar: true })).status, 409, 'o limite continua 22 kW');
  });

  test('R6: o valor do medidor perde a validade (validade_s) e o limite deixa de ser avaliado', async () => {
    await prepara(grava('r6.json', comCfg({ modo: 'recusar', gerador: { validade_s: 10 } })));
    assert.equal((await post(h, '/api/gerador/capacidade', { kw100: 10 })).status, 200);          // limite 11 kW
    for (let i = 1; i <= 2; i++) assert.equal((await ligar(i)).status, 200);                      // 10 kW
    assert.equal((await post(h, '/api/chaves/56/ligar', { indice: 3, ligar: true })).status, 409, 'valido: 15 kW > 11');
    await new Promise(r => setTimeout(r, 11500));
    assert.equal((await get(h, '/api/gerador/capacidade')).j.efetivo.kw100, null, 'vencido');
    assert.equal((await ligar(3)).status, 200, 'sem valor valido o limite nao e avaliado');
  });

  test('R7: degrau: carga nova acima de max_kw dentro da janela e recusada (recusar) ou anotada (registrar)', async () => {
    await prepara(grava('r7.json', comCfg({ modo: 'recusar', degrau: { max_kw: 12, janela_s: 60 } })));
    for (let i = 1; i <= 2; i++) assert.equal((await ligar(i)).status, 200);                      // 10 kW novos na janela
    const r = await post(h, '/api/chaves/56/ligar', { indice: 3, ligar: true });
    assert.equal(r.status, 409, JSON.stringify(r.j)); assert.equal(r.j.codigo, 'DEGRAU_EXCEDIDO'); assert.equal(h.plc.ler(e56.cb(3)), false);
    assert.equal((await desligar(1)).status, 200);
    await prepara(grava('r7b.json', comCfg({ modo: 'registrar', degrau: { max_kw: 12, janela_s: 60 } })));
    for (let i = 1; i <= 3; i++) assert.equal((await ligar(i)).status, 200, 'registrar aceita');
    assert.ok(await esperaAte(async () => (await reg('LIMITE')).some(x => /DEGRAU_EXCEDIDO/.test(x.erro)), 4000), JSON.stringify(await logs()));
  });

  test('R8: a soma e ENTRE bancos', async () => {
    await prepara(grava('r8.json', comCfg({ modo: 'recusar', gerador: { kw100: 60 } })), [F56, F400, API]);       // limite 66 kW
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/400')).status === 200, 10000));
    assert.equal((await ligar(7, '400')).status, 200);                                                             // 50 kW
    await new Promise(r => setTimeout(r, 1500));
    for (let i = 1; i <= 3; i++) assert.equal((await ligar(i)).status, 200);                                       // 65 kW
    const r = await post(h, '/api/chaves/56/ligar', { indice: 4, ligar: true });
    assert.equal(r.status, 409, JSON.stringify(r.j)); assert.equal(r.j.totalKw, 70);
  });

  test('R9: arquivo ausente ou invalido: padrao embutido (registrar, sem kw100): nada e recusado', async () => {
    for (const a of [path.join(dir, 'nao-existe.json'), grava('lixo.json', '{ isso nao e json'), grava('modo.json', comCfg({ modo: 'destruir', gerador: { kw100: 5 } }))]) {
      await prepara(a);
      for (let i = 1; i <= 3; i++) assert.equal((await ligar(i)).status, 200, path.basename(a));
      assert.deepEqual(await reg('LIMITE'), []);
    }
  });

  test('R10: arquivo do repositorio (registrar, tudo null): ligar as 13 chaves sem nenhuma recusa nem anotacao', async () => {
    await prepara(CONFIG);
    for (let i = 1; i <= 13; i++) assert.equal((await ligar(i)).status, 200);
    assert.deepEqual(await reg('LIMITE'), []); assert.deepEqual(await reg('CAPACIDADE'), []);
  });
});
