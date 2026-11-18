'use strict';
/* =====================================================================================================================
   FASE 4 / Passo 5 (C1) — LIMITE DE CAPACIDADE NO BACKEND QUE SO REGISTRA (19/11/2026).
   PARA QUE SERVE (leigo): o Node-RED passou a calcular quanto de carga ficaria comandada e a ANOTAR no log do banco quando o limite do gerador seria
   passado ou quando o kW que o PLC informa difere do arquivo de espelho. Ele NAO recusa nada: o comando continua sendo executado (C2 e que vai recusar).
   O QUE ESTE TESTE PROVA:
     S1  o arquivo nodered/config/bancos_capacidade.json bate com o medidor (kW de cada chave, DBs, pctLim 110);
     S2  as 4 versoes novas dos fluxos so diferem das anteriores onde o C1 mexeu (nada mais mudou) e o padrao embutido = o arquivo;
     R1  abaixo do limite: nada anotado; acima: LIMITE_EXCEDIDO no log, MAS o comando e executado (200 e cb=TRUE no PLC);
     R2  kw100 = null (padrao do repositorio): limite nao avaliado, nada anotado, comandos normais;
     R3  arquivo ausente ou invalido: o fluxo segue com o padrao embutido (nada quebra);
     R4  kW do PLC (setup.nominal) diferente do espelho: NOMINAL_DIVERGE no log, e o kW do PLC e o usado na soma;
     R5  soma ENTRE bancos (BC400 + BC56).
   CONTRA-PROVA: BT2_C1_FLUXO56=chaves-56-api-v3.7 (versao anterior, sem C1) tem que FALHAR nos testes R1, R4 e R5.
   NAO PROVA: o PLC/ET200 reais, nem o limite do gerador real (kw100 vem do arquivo; a fonte automatica e a decisao do C2).
   ===================================================================================================================== */
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), os = require('os'), path = require('path');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe } = require('../ajudas.js');
const { caminhoFluxo } = require('../../versoes.js');

const RAIZ = path.join(__dirname, '..', '..', '..');
const CONFIG = path.join(RAIZ, 'nodered', 'config', 'bancos_capacidade.json');
const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
const F56 = process.env.BT2_C1_FLUXO56 || 'chaves-56-api-v3.8', F400 = process.env.BT2_C1_FLUXO400 || 'chaves-400-api-v3.7';
const NOVOS = { '56': ['chaves-56-api-v3.7', 'chaves-56-api-v3.8'], '400': ['chaves-400-api-v3.6', 'chaves-400-api-v3.7'], '550': ['chaves-550-api-v1.7', 'chaves-550-api-v1.8'], '595': ['chaves-595-api-v1.7', 'chaves-595-api-v1.8'] };
const lerFl = n => JSON.parse(fs.readFileSync(caminhoFluxo(n), 'utf8'));

describe('C1 estatico: o arquivo de capacidade e os fluxos novos', () => {
  test('S1: o arquivo bate com o medidor (kW das chaves, DB e pctLim)', () => {
    const js = fs.readFileSync(path.join(RAIZ, 'dashboard', 'src', 'js', 'principal', '11_bancos_e_chaves_modelo.js'), 'utf8');
    const medidor = {};
    for (const m of js.matchAll(/\{id:'([\d,]+)',nome:'[^']*',db:(\d+),dbTens:\d+,chaves:\[([^\]]*)\]/g)) medidor[m[1]] = { db: +m[2], chaves: m[3].split(',').map(Number) };
    assert.deepEqual(Object.keys(medidor).sort(), ['400', '550', '56', '59,5'], 'o medidor deve ter os 4 bancos');
    for (const [rota, b] of Object.entries(cfg.bancos)) {
      const m = medidor[b.id_medidor]; assert.ok(m, 'banco ' + b.id_medidor + ' ausente no medidor');
      assert.deepEqual(b.chaves_kw, m.chaves, 'chaves_kw do banco ' + rota + ' diferem do medidor');
      assert.equal(b.db, m.db, 'DB do banco ' + rota);
    }
    const g = fs.readFileSync(path.join(RAIZ, 'dashboard', 'src', 'js', 'principal', '33_patamar_guiado.js'), 'utf8');
    assert.equal(+/pctLim:(\d+)/.exec(g)[1], cfg.pctLim, 'pctLim do arquivo difere do G.pctLim do medidor');
  });

  test('S1b: o arquivo e valido (somas dos bancos e limites)', () => {
    const soma = r => Math.round(cfg.bancos[r].chaves_kw.reduce((a, b) => a + b, 0) * 100) / 100;
    assert.deepEqual([soma('56'), soma('400'), soma('595'), soma('550')], [56, 400, 59.5, 550]);
    assert.ok(cfg.pctLim >= 50 && cfg.pctLim <= 200); assert.ok(cfg.gerador.kw100 === null || cfg.gerador.kw100 > 0);
  });

  for (const [rota, [antes, depois]] of Object.entries(NOVOS)) {
    test('S2: ' + depois + ' so difere de ' + antes + ' onde o C1 mexeu; padrao embutido = arquivo', () => {
      const a = lerFl(antes), d = lerFl(depois), poA = Object.fromEntries(a.map(n => [n.id, n])), poD = Object.fromEntries(d.map(n => [n.id, n]));
      const novos = d.filter(n => !poA[n.id]).map(n => n.id);
      assert.ok(novos.length === 6 && novos.every(i => /_c1_/.test(i)), 'nos novos devem ser os 6 do C1: ' + novos);
      assert.deepEqual(a.filter(n => !poD[n.id]).map(n => n.id), [], 'nenhum no pode ter sumido');
      // so podem ter mudado: a aba (rotulo, info, env), "guarda leitura ao vivo (cache)" (publica o kW), "valida ligar" (so o fio de saida) e o grupo dele (lista e altura)
      const gv = poA[a.find(x => x.name === 'valida ligar').id].g;
      const permitidos = new Set([a.find(n => n.type === 'tab').id, a.find(n => n.name === 'guarda leitura ao vivo (cache)').id, a.find(n => n.name === 'valida ligar').id, gv]);
      const indevidos = a.filter(n => JSON.stringify(n) !== JSON.stringify(poD[n.id]) && !permitidos.has(n.id)).map(n => n.name || n.id);
      assert.deepEqual(indevidos, [], 'o C1 nao pode alterar nenhum outro no');
      const vlA = a.find(x => x.name === 'valida ligar'), vlD = poD[vlA.id];
      assert.deepEqual({ ...vlD, wires: null }, { ...vlA, wires: null }, '"valida ligar" so pode mudar o fio de saida');
      const vl = vlD;
      assert.deepEqual(vl.wires[0], [d.find(n => /_c1_limite$/.test(n.id)).id], 'valida ligar deve apontar para o no de limite');
      const limite = d.find(n => /_c1_limite$/.test(n.id));
      assert.deepEqual(limite.wires[0], poA[a.find(x => x.name === 'valida ligar').id].wires[0], 'o no de limite deve seguir para o mesmo destino de antes');
      assert.deepEqual(vl.wires[1], poA[vl.id].wires[1], 'a saida de erro de "valida ligar" nao pode mudar');
      const pad = JSON.parse(/const PADRAO = (\{.*?\});\n/s.exec(limite.func)[1]);
      assert.deepEqual(pad, cfg, 'o padrao embutido deve ser igual ao arquivo');
      assert.equal(limite.outputs, 1);
    });
  }
});

describe('C1 em execucao: Node-RED real + PLC simulado (o limite so registra)', () => {
  let h, e56, e400, dir, arq, dest = [];
  const grava = (nome, obj) => { const f = path.join(dir, nome); fs.writeFileSync(f, typeof obj === 'string' ? obj : JSON.stringify(obj)); return f; };
  const comKw = (kw100, extra) => Object.assign(JSON.parse(JSON.stringify(cfg)), { gerador: { kw100 } }, extra || {});
  const logs = async (rota = '56') => (await get(h, '/api/logs/' + rota)).j.logs;
  const reg = async (tipo, rota = '56') => (await logs(rota)).filter(x => x.rota === tipo);
  const prepara = async (arqCfg, fluxos = [F56]) => {
    if (h) await h.para();
    h = await sobe({ fluxos, env: ENV_TESTE, envAbas: { BT2_CAPACIDADE_JSON: arqCfg } });
    e56 = enderecos('56'); e400 = enderecos('400');
    for (const [e, n] of [[e56, 13], [e400, 13]]) { h.plc.escrever(e.cbBanco, true); for (let i = 1; i <= n; i++) h.plc.escrever(e.hab(i), true); }
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 10000), 'BC56 sem leitura');
    await new Promise(r => setTimeout(r, 3500));              // o Node-RED le o arquivo de configuracao 2 s depois de subir
  };
  const ligar = async (i, rota = '56') => {
    const r = await post(h, '/api/chaves/' + rota + '/ligar', { indice: i, ligar: true });
    if (r.status === 200) assert.ok(await esperaAte(async () => ((await get(h, '/api/chaves/' + rota)).j.cbLigar || [])[i - 1] === true, 6000, 100), 'cbLigar nao refletiu a chave ' + i + ' (' + rota + ')');
    return r;
  };
  before(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cap-c1-')); });
  after(async () => { if (h) await h.para(); });

  test('R1: abaixo do limite nada e anotado; acima do limite anota LIMITE_EXCEDIDO MAS o comando e executado', async () => {
    arq = grava('kw20.json', comKw(20));                        // limite = 20 x 110 % = 22 kW
    await prepara(arq);
    for (let i = 1; i <= 4; i++) assert.equal((await ligar(i)).status, 200);        // 4 x 5 kW = 20 kW (< 22)
    assert.deepEqual(await reg('LIMITE'), [], 'abaixo do limite nao pode anotar nada');
    const r = await ligar(5);                                                       // 25 kW (> 22)
    assert.equal(r.status, 200, 'C1 NAO recusa: o comando tem que ser aceito, veio ' + r.status + ' ' + JSON.stringify(r.j));
    assert.ok(await esperaAte(async () => (await reg('LIMITE')).length === 1, 4000), 'esperava 1 LIMITE_EXCEDIDO: ' + JSON.stringify(await logs()));
    const x = (await reg('LIMITE'))[0];
    assert.match(x.erro, /LIMITE_EXCEDIDO/); assert.match(x.dado, /total comandado 25 kW > limite 22 kW/); assert.match(x.dado, /kw100 20 x 110 %/);
    assert.equal(h.plc.ler(e56.cb(5)), true, 'o PLC recebeu o comando (so registra, nao recusa)');
  });

  test('R2: kw100 = null (arquivo do repositorio): limite nao avaliado, nada anotado, comandos normais', async () => {
    await prepara(CONFIG);
    for (let i = 1; i <= 13; i++) assert.equal((await ligar(i)).status, 200);       // as 13 chaves = 56 kW
    assert.deepEqual(await reg('LIMITE'), []); assert.deepEqual(await reg('CAPACIDADE'), []);
  });

  test('R3: arquivo ausente ou invalido: o fluxo segue com o padrao embutido', async () => {
    for (const a of [path.join(dir, 'nao-existe.json'), grava('lixo.json', '{ isso nao e json'), grava('pct.json', comKw(20, { pctLim: 5 }))]) {
      await prepara(a);
      assert.equal((await ligar(1)).status, 200, 'o fluxo tem que funcionar com ' + path.basename(a));
      assert.deepEqual(await reg('LIMITE'), [], 'sem arquivo valido o padrao tem kw100 null: nada a anotar (' + path.basename(a) + ')');
    }
  });

  test('R4: kW do PLC (setup.nominal) diferente do espelho: anota NOMINAL_DIVERGE e usa o kW do PLC', async () => {
    arq = grava('kw20b.json', comKw(20));
    await prepara(arq);
    const nom = cfg.bancos['56'].chaves_kw.slice(); nom[0] = 7; nom.push(0, 0, 0);       // PLC informa 7 kW na chave 1 (espelho: 5)
    h.plc.escrever('DB3000,REAL392.16', nom);
    assert.ok(await esperaAte(async () => ((await get(h, '/api/chaves/56')).j.nominal || [])[0] === 7, 6000), 'GET nao refletiu o nominal 7');
    assert.equal((await ligar(1)).status, 200);
    assert.ok(await esperaAte(async () => (await reg('CAPACIDADE')).length === 1, 4000), 'esperava NOMINAL_DIVERGE: ' + JSON.stringify(await logs()));
    assert.match((await reg('CAPACIDADE'))[0].dado, /chave 1: PLC informa 7 kW, espelho tem 5 kW/);
    for (const i of [2, 3, 4]) assert.equal((await ligar(i)).status, 200);              // 7 + 5 + 5 + 5 = 22 (nao passa de 22)
    assert.deepEqual(await reg('LIMITE'), [], 'ainda no limite (22 kW)');
    await ligar(5);                                                                     // 27 kW: so passa se o kW do PLC (7) foi usado em vez do espelho (5 => 25 tambem passaria)
    assert.match((await reg('LIMITE'))[0].dado, /total comandado 27 kW > limite 22 kW/, 'a soma deve usar o kW do PLC');
  });

  test('R5: a soma e ENTRE bancos (BC400 + BC56)', async () => {
    arq = grava('kw60.json', comKw(60));                      // limite 66 kW
    await prepara(arq, [F56, F400]);
    assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/400')).status === 200, 10000), 'BC400 sem leitura');
    assert.equal((await ligar(7, '400')).status, 200);        // chave 7 do BC400 = 50 kW
    await new Promise(r => setTimeout(r, 1500));
    for (let i = 1; i <= 3; i++) assert.equal((await ligar(i)).status, 200);     // 50 + 15 = 65 kW (< 66)
    assert.deepEqual(await reg('LIMITE'), []);
    assert.equal((await ligar(4)).status, 200);               // 50 + 20 = 70 kW (> 66)
    assert.ok(await esperaAte(async () => (await reg('LIMITE')).length === 1, 4000), 'esperava LIMITE entre bancos: ' + JSON.stringify(await logs()));
    assert.match((await reg('LIMITE'))[0].dado, /total comandado 70 kW > limite 66 kW/);
  });
});
