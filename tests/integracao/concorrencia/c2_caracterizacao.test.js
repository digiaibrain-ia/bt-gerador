'use strict';
// C2 (Fase 3, Portao 2) - CARACTERIZACAO de condicoes de corrida e idempotencia (hipoteses R1 a R9). NENHUM fluxo foi alterado.
// Cada achado confirmado e um teste 'todo' (ACHADO P3-xx) com o comportamento ESPERADO escrito; o que ja esta correto e teste verde.
// Modo de escrita: SERIAL e o padrao; o CONCORRENTE so entra onde a ultrapassagem muda o resultado (P3-A5 e o teste de FIFO sob jitter).
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { ENV_TESTE, enderecos, esperaAte, get, post, sobe } = require('../ajudas.js');
const V = require('../verificador.js');

const dorme = ms => new Promise(r => setTimeout(r, ms));
const PASTA = path.join(__dirname, '..', '..', '..', 'nodered', 'flows', 'bt2');
const P = (h, rota, c) => post(h, '/api/chaves/56/' + rota, c);

// BC56 v3.2 pronto, com a comunicacao ET200 e a seletora em Auto (condicao normal para ligar banco)
async function bc56(opt = {}) {
  const h = await sobe(Object.assign({ fluxos: ['chaves-56-api-v3.2'], env: ENV_TESTE }, opt)); const e = enderecos('56');
  h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true);
  assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 10000), 'BC56 nao ficou pronto');
  return { h, e };
}
// espera o cache do fluxo refletir o que o teste escreveu direto no PLC
const veNaLeitura = (h, fn) => esperaAte(async () => fn((await get(h, '/api/chaves/56')).j || {}), 4000, 60);
// segura a fila: a 1a escrita da proxima chamada demora 400 ms (< espera de 450 ms do fluxo, entao responde 200)
const seguraFila = h => h.plc.atrasosEscrita.push(400);

describe('C2 R1/R5 BC56 - ordem e validacao dos comandos', () => {
  test('(projeto v2.4) "Desligar banco" tem PRIORIDADE: executa antes de comandos comuns ja na fila', async () => {
    const { h, e } = await bc56();
    try {
      h.plc.trace.length = 0; seguraFila(h);
      const a = P(h, 'habilitar', { indice: 10, habilitada: true }); await dorme(60);
      const b = P(h, 'banco', { ligar: true }); await dorme(40); const c = P(h, 'banco', { ligar: false });
      await Promise.all([a, b, c]);
      assert.deepEqual(V.valoresAplicados(h.plc.trace, e.cbBanco), [false, true], 'o desligar deveria ter sido aplicado antes do ligar');
    } finally { await h.para(); }
  });

  test('ACHADO P3-A1 (Alta): se "Ligar banco" foi aceito ANTES e "Desligar banco" DEPOIS, o ultimo comando aceito deveria prevalecer (banco desligado)', { todo: 'ACHADO P3-A1: o desligar fura a fila e o ligar mais antigo executa depois: banco fica LIGADO com as 3 respostas 200' }, async () => {
    const { h, e } = await bc56();
    try {
      seguraFila(h);
      const a = P(h, 'habilitar', { indice: 10, habilitada: true }); await dorme(60);
      const b = P(h, 'banco', { ligar: true }); await dorme(40); const c = P(h, 'banco', { ligar: false });
      const r = await Promise.all([a, b, c]); await dorme(300);
      assert.deepEqual(r.map(x => x.status), [200, 200, 200]);
      assert.equal(h.plc.ler(e.cbBanco), false, 'ultimo comando aceito foi DESLIGAR, mas o banco ficou ligado');
    } finally { await h.para(); }
  });

  test('ACHADO P3-A2 (Media): "selecionar" validado antes de um "habilitar:false" que esta na frente da fila nao deveria deixar ChaveSel numa chave desabilitada', { todo: 'ACHADO P3-A2: validacao fora da fila (R1): ChaveSel=3 com Habilitada3=false' }, async () => {
    const { h, e } = await bc56();
    try {
      h.plc.escrever(e.cbBanco, true); h.plc.escrever(e.hab(3), true);
      assert.ok(await veNaLeitura(h, j => j.bancoLigado === true && j.habilitada?.[2] === true));
      seguraFila(h);
      const a = P(h, 'habilitar', { indice: 10, habilitada: true }); await dorme(60);
      const b = P(h, 'habilitar', { indice: 3, habilitada: false }); await dorme(40); const c = P(h, 'selecionar', { indice: 3 });
      await Promise.all([a, b, c]); await dorme(300);
      assert.ok(!(h.plc.ler(e.hab(3)) === false && h.plc.ler(e.chaveSel) === 3), 'ChaveSel=3 numa chave que ficou desabilitada');
    } finally { await h.para(); }
  });

  test('ACHADO P3-A3 (Alta*): "ligar chave" validado com banco ligado nao deveria resultar em CbLigar=TRUE com o banco desligado (*gravidade a confirmar com o FB101 no PLC)', { todo: 'ACHADO P3-A3: validacao fora da fila (R1) + prioridade do desligar banco: CbLigar2=TRUE e LigarBanco=FALSE' }, async () => {
    const { h, e } = await bc56();
    try {
      h.plc.escrever(e.cbBanco, true); h.plc.escrever(e.hab(2), true);
      assert.ok(await veNaLeitura(h, j => j.bancoLigado === true && j.habilitada?.[1] === true));
      seguraFila(h);
      const a = P(h, 'habilitar', { indice: 10, habilitada: true }); await dorme(60);
      const c = P(h, 'ligar', { indice: 2, ligar: true }); await dorme(40); const b = P(h, 'banco', { ligar: false });
      await Promise.all([a, c, b]); await dorme(300);
      assert.ok(!(h.plc.ler(e.cbBanco) === false && h.plc.ler(e.cb(2)) === true), 'chave ligada (CbLigar2) com o banco desligado');
    } finally { await h.para(); }
  });

  for (const [rotulo, modo] of [['serial', true], ['CONCORRENTE', false]]) {
    test('FIFO: 6 comandos comuns aceitos em ordem (liga/desliga alternados) sob jitter terminam no ULTIMO e foram aplicados na ordem [' + rotulo + ']', async () => {
      const { h, e } = await bc56();
      try {
        h.plc.latencia.serial = modo; h.plc.latencia.escritaMs = 120; h.plc.latencia.escritaJitterMs = 100; h.plc.semente(11); h.plc.trace.length = 0;
        const seq = [true, false, true, false, true, false], rs = [];
        for (const v of seq) { rs.push(P(h, 'habilitar', { indice: 7, habilitada: v })); await dorme(25); }
        const r = await Promise.all(rs);
        assert.ok(r.every(x => x.status === 200), 'status: ' + r.map(x => x.status).join(','));
        assert.deepEqual(V.valoresAplicados(h.plc.trace, e.hab(7)), seq, 'ordem de aplicacao difere da ordem de aceitacao');
        assert.equal(h.plc.ler(e.hab(7)), false);
        assert.equal(V.respostasEmDuplicidade(h.logs).length, 0);
      } finally { await h.para(); }
    });
  }
});

describe('C2 R2/R3/R6 BC56 - escrita atrasada, timeout e repeticao', () => {
  test('ACHADO P3-A4 (Media): se a escrita demora mais que a espera do fluxo (450 ms) a resposta e 500 e a escrita e APLICADA depois: o erro deveria refletir o estado final', { todo: 'ACHADO P3-A4: 500 "leitura de volta nao conferiu" e, 9 s depois, o PLC aplica a escrita (falso erro; cliente repete ou desiste)' }, async () => {
    const { h, e } = await bc56();
    try {
      h.plc.atrasosEscrita.push(9000);
      const t0 = Date.now(); const r = await P(h, 'habilitar', { indice: 4, habilitada: true });
      await dorme(Math.max(0, 9400 - (Date.now() - t0)));
      const aplicou = h.plc.ler(e.hab(4)) === true;
      assert.equal(r.status === 200, aplicou, 'resposta ' + r.status + ' mas a escrita ' + (aplicou ? 'FOI' : 'NAO foi') + ' aplicada');
    } finally { await h.para(); }
  });

  test('a fila NAO fica presa depois de um falso 500: o proximo comando e atendido e as respostas sao uma por pedido (sem duplicidade)', async () => {
    const { h, e } = await bc56();
    try {
      h.plc.atrasosEscrita.push(700);          // 1a escrita atrasa 700 ms (> 450): o 1o comando responde 500
      const a = await P(h, 'habilitar', { indice: 5, habilitada: true });
      assert.equal(a.status, 500, a.t);
      const b = await P(h, 'habilitar', { indice: 6, habilitada: true });
      assert.equal(b.status, 200, 'a fila ficou presa/atrasada: ' + b.t);
      assert.equal(V.respostasEmDuplicidade(h.logs).length, 0, JSON.stringify(h.logs.slice(-2)));
      assert.equal(h.plc.ler(e.hab(6)), true);
    } finally { await h.para(); }
  });

  test('PLC sem leitura: o comando responde 503 pelo vigia de 8 s, a fila e liberada e o comando seguinte funciona quando o PLC volta (sem resposta duplicada)', async () => {
    const { h, e } = await bc56();
    try {
      h.plc.falhas.leitura = true;
      const t0 = Date.now(); const a = await P(h, 'habilitar', { indice: 8, habilitada: true }); const dt = Date.now() - t0;
      assert.ok(a.status === 503 || a.status === 500, 'esperado 503/500, veio ' + a.status + ' ' + a.t);
      assert.ok(dt >= 7000 && dt < 11000, 'o timeout deveria vir perto de 8 s; veio ' + dt + ' ms');
      h.plc.falhas.leitura = false;
      assert.ok(await veNaLeitura(h, () => true));
      const b = await P(h, 'habilitar', { indice: 9, habilitada: true });
      assert.equal(b.status, 200, 'fila presa depois do timeout: ' + b.t);
      assert.equal(V.respostasEmDuplicidade(h.logs).length, 0);
      assert.equal(h.plc.ler(e.hab(9)), true);
    } finally { await h.para(); }
  });

  test('(R6) comandos absolutos sao idempotentes: repetir 2x (ligar/habilitar/selecionar/usarKwReal/banco) da 200 nas duas e o mesmo estado final', async () => {
    const { h, e } = await bc56();
    try {
      await P(h, 'banco', { ligar: true }); await P(h, 'habilitar', { indice: 2, habilitada: true });
      assert.ok(await veNaLeitura(h, j => j.bancoLigado === true && j.habilitada?.[1] === true));
      const casos = [['banco', { ligar: true }], ['habilitar', { indice: 3, habilitada: true }], ['usarKwReal', { usar: true }], ['selecionar', { indice: 2 }]];
      for (const [rota, corpo] of casos) {
        const a = await P(h, rota, corpo); const b = await P(h, rota, corpo);
        assert.equal(a.status, 200, rota + ' 1a: ' + a.t); assert.equal(b.status, 200, rota + ' 2a: ' + b.t);
      }
      assert.equal(h.plc.ler(e.chaveSel), 2); assert.equal(h.plc.ler(e.cbBanco), true); assert.equal(h.plc.ler(e.hab(3)), true);
    } finally { await h.para(); }
  });

  test('(R9) cliente que desiste (aborta a conexao) com o comando JA aceito na fila: o comando ainda EXECUTA (comportamento atual, caracterizado)', async () => {
    const { h, e } = await bc56();
    try {
      seguraFila(h);
      const a = P(h, 'habilitar', { indice: 10, habilitada: true }); await dorme(60);
      const ctl = new AbortController();
      const p = fetch(h.url + '/api/chaves/56/habilitar', { method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/json', Origin: h.url }, body: JSON.stringify({ indice: 6, habilitada: true }) }).catch(() => 'abortado');
      await dorme(100); ctl.abort(); await p; await a;
      assert.ok(await esperaAte(() => h.plc.ler(e.hab(6)) === true, 3000), 'o comando aceito nao executou');
    } finally { await h.para(); }
  });
});

describe('C2 R2/R5 BC56 - modo CONCORRENTE (so onde muda o resultado)', () => {
  test('ACHADO P3-A5 (Alta, CONDICIONAL ao driver): escrita antiga atrasada (9 s) ultrapassa a nova e o estado final contraria o ultimo comando aceito (que respondeu 200)', { todo: 'ACHADO P3-A5: so ocorre se o driver S7 real aplicar escritas concorrentes; CbLigar1 termina TRUE apos "ligar:false" ter respondido 200' }, async () => {
    const { h, e } = await bc56();
    try {
      h.plc.latencia.serial = false;
      h.plc.escrever(e.cbBanco, true); h.plc.escrever(e.hab(1), true);
      assert.ok(await veNaLeitura(h, j => j.bancoLigado === true && j.habilitada?.[0] === true));
      h.plc.atrasosEscrita.push(9000);
      const t0 = Date.now();
      await P(h, 'ligar', { indice: 1, ligar: true });          // responde 500 (falso erro) e a escrita fica "no ar" por 9 s
      const b = await P(h, 'ligar', { indice: 1, ligar: false });
      assert.equal(b.status, 200, b.t);
      await dorme(Math.max(0, 9500 - (Date.now() - t0)));
      assert.equal(h.plc.ler(e.cb(1)), false, 'CbLigar1 ficou TRUE depois de "ligar:false" aceito (200)');
    } finally { await h.para(); }
  });
});

// ---------- registro de ensaio (DB2100) ----------
const endVar = (flow, nome) => { for (const n of JSON.parse(fs.readFileSync(path.join(PASTA, flow + '.json'), 'utf8'))) for (const v of (n.vartable || [])) if (v.name === nome) return v.addr; throw new Error('variavel nao encontrada: ' + nome); };
const REG = 'registro-ensaio-db2100-api-v1.7';
const PREEN = { campos: { serie: 'SN-1', versao: 'V1', data: '2026-11-03', fase: 'trifasico', frequenciaHz: 60, tensaoV: 380, tempAmbienteC: 25, potenciaKw: 100, equipamentos: { motor: { fabricante: 'M', modelo: 'X', serie: '1' } } } };

describe('C2 R7 registro de ensaio - atomicidade e concorrencia', () => {
  test('ACHADO P3-B1 (Media): o PLC cai no meio de "preenchimento": o flag preenchValido nao deveria ficar TRUE com os dados incompletos', { todo: 'ACHADO P3-B1: preenchValido e gravado PRIMEIRO; com queda apos 2 escritas ele fica TRUE, serie gravada e o resto vazio (snapshot parcial "valido"). Atomicidade total pode exigir mudanca de layout no PLC (limite)' }, async () => {
    const h = await sobe({ fluxos: [REG], env: ENV_TESTE });
    try {
      assert.ok(await esperaAte(async () => (await get(h, '/api/ensaio/snap')).status === 200, 10000));
      h.plc.falhas.escritaApos = 2;
      const r = await post(h, '/api/ensaio/snap/preenchimento', PREEN);
      assert.notEqual(r.status, 200, 'queda do PLC e a resposta foi 200');
      const valido = h.plc.ler(endVar(REG, 'preenchValido')), versao = h.plc.ler(endVar(REG, 'versao'));
      assert.ok(!(valido === true && versao === ''), 'preenchValido=TRUE com versao/data/fase/numeros nao gravados');
    } finally { await h.para(); }
  });

  test('"etapa": o bit Salva so e gravado DEPOIS dos valores; com queda no meio dos valores o bit continua FALSE (sem etapa salva pela metade)', async () => {
    const h = await sobe({ fluxos: [REG], env: ENV_TESTE });
    try {
      assert.ok(await esperaAte(async () => (await get(h, '/api/ensaio/snap')).status === 200, 10000));
      h.plc.falhas.escritaApos = 1;
      const valores = Object.fromEntries(['cargaReal','potencia','tempMotor','Va','Vb','Vc','Ia','Ib','Ic','rpm','bateria','tEstab','cronometro'].map(k => [k, 1]));
      const r = await post(h, '/api/ensaio/snap/etapa', { etapa: 50, indice: 1, valores, confirmado: true });
      assert.notEqual(r.status, 200, r.t);
      assert.equal(h.plc.ler(endVar(REG, 'etapa1Salva')), false);
    } finally { await h.para(); }
  });

  test('preenchimento, limpar e preenchimento concorrentes (com jitter, modo concorrente): fila serializa e o estado final e o do ULTIMO aceito', async () => {
    const h = await sobe({ fluxos: [REG], env: ENV_TESTE });
    try {
      assert.ok(await esperaAte(async () => (await get(h, '/api/ensaio/snap')).status === 200, 10000));
      h.plc.latencia.serial = false; h.plc.latencia.escritaMs = 60; h.plc.latencia.escritaJitterMs = 50; h.plc.semente(5);
      const outro = JSON.parse(JSON.stringify(PREEN)); outro.campos.serie = 'SN-ULTIMO';
      const a = post(h, '/api/ensaio/snap/preenchimento', PREEN); await dorme(30);
      const b = post(h, '/api/ensaio/snap/limpar', { confirmado: true }); await dorme(30);
      const c = post(h, '/api/ensaio/snap/preenchimento', outro);
      const r = await Promise.all([a, b, c]);
      assert.deepEqual(r.map(x => x.status), [200, 200, 200], r.map(x => x.t).join(' | '));
      assert.equal(h.plc.ler(endVar(REG, 'serie')), 'SN-ULTIMO'); assert.equal(h.plc.ler(endVar(REG, 'preenchValido')), true);
    } finally { await h.para(); }
  });

  test('(R6) repetir "preenchimento" e "limpar" 2x: sempre 200 e mesmo estado final', async () => {
    const h = await sobe({ fluxos: [REG], env: ENV_TESTE });
    try {
      assert.ok(await esperaAte(async () => (await get(h, '/api/ensaio/snap')).status === 200, 10000));
      for (const [rota, c] of [['preenchimento', PREEN], ['limpar', { confirmado: true }]]) {
        const a = await post(h, '/api/ensaio/snap/' + rota, c), b = await post(h, '/api/ensaio/snap/' + rota, c);
        assert.equal(a.status, 200, rota + ' ' + a.t); assert.equal(b.status, 200, rota + ' ' + b.t);
      }
      assert.equal(h.plc.ler(endVar(REG, 'preenchValido')), false);
    } finally { await h.para(); }
  });
});

// ---------- logs de desenvolvedor ----------
const lote = (sessao, ns) => ({ eventos: ns.map(n => ({ sessao, n, t: 't', v: '1', modo: 'm', card: 'c', tipo: 'api', acao: 'a' + n, res: 'ok' })) });
const LOG = '/api/dev/log-evento';

describe('C2 R8 logs de desenvolvedor - concorrencia e idempotencia', () => {
  test('reenvio do MESMO lote nao duplica (dedup sessao+n) e 30 lotes concorrentes de sessoes distintas nao perdem evento (seq contiguo)', async () => {
    const h = await sobe({ fluxos: ['dev-logs-api-v1.2'], env: ENV_TESTE });
    try {
      assert.ok(await esperaAte(async () => (await get(h, '/api/dev/logs')).status === 200, 8000));
      const a = await post(h, LOG, lote('s0', [1, 2, 3])), b = await post(h, LOG, lote('s0', [1, 2, 3]));
      assert.equal(a.j.aceitos, 3); assert.equal(b.j.aceitos, 0, 'reenvio deveria ser descartado como duplicado');
      const rs = await Promise.all(Array.from({ length: 30 }, (_, i) => post(h, LOG, lote('c' + i, [1, 2, 3, 4]))));
      assert.ok(rs.every(r => r.status === 200 && r.j.aceitos === 4));
      const g = (await get(h, '/api/dev/logs?limit=2000')).j;
      assert.equal(g.total, 3 + 120); assert.deepEqual(g.eventos.map(x => x.seq), Array.from({ length: 123 }, (_, i) => i + 1), 'seq deveria ser 1..123 sem buracos');
    } finally { await h.para(); }
  });

  test('ACHADO P3-C1 (Baixa): lote MAIS NOVO chegando antes do mais antigo (mesma sessao) nao deveria descartar o antigo como "duplicado"', { todo: 'ACHADO P3-C1: dedup por "maior n ja aceito" perde em silencio os eventos 1-3 quando o lote 4-6 chega primeiro (dois POSTs em voo se ultrapassam)' }, async () => {
    const h = await sobe({ fluxos: ['dev-logs-api-v1.2'], env: ENV_TESTE });
    try {
      assert.ok(await esperaAte(async () => (await get(h, '/api/dev/logs')).status === 200, 8000));
      await post(h, LOG, lote('s1', [4, 5, 6])); const velho = await post(h, LOG, lote('s1', [1, 2, 3]));
      assert.equal(velho.j.aceitos, 3, 'eventos 1-3 foram descartados como duplicados (aceitos=' + velho.j.aceitos + ')');
    } finally { await h.para(); }
  });

  test('ACHADO P3-C2 (Baixa): cursor "desde" a frente do ultimo seq (ex.: apos reinicio do Node-RED) deveria ser sinalizado ao cliente, nao devolver lista vazia em silencio', { todo: 'ACHADO P3-C2: sem sinal (ex.: cursorAdiante) o cliente fica sem receber eventos novos ate o seq alcancar o cursor antigo; hoje so o campo boot permite perceber' }, async () => {
    const h = await sobe({ fluxos: ['dev-logs-api-v1.2'], env: ENV_TESTE });
    try {
      assert.ok(await esperaAte(async () => (await get(h, '/api/dev/logs')).status === 200, 8000));
      await post(h, LOG, lote('s2', [1, 2]));
      const g = (await get(h, '/api/dev/logs?desde=9999')).j;
      assert.equal(g.eventos.length, 0);
      assert.ok(g.cursorAdiante === true || g.reiniciado === true, 'resposta nao sinaliza que o cursor esta a frente: ' + JSON.stringify(Object.keys(g)));
    } finally { await h.para(); }
  });

  test('"limpar" entre lotes: o seq continua (nao reinicia), a sessao nao ressuscita o que foi limpo e o cursor "desde" segue valido', async () => {
    const h = await sobe({ fluxos: ['dev-logs-api-v1.2'], env: ENV_TESTE });
    try {
      assert.ok(await esperaAte(async () => (await get(h, '/api/dev/logs')).status === 200, 8000));
      await post(h, LOG, lote('s3', [1, 2, 3]));
      const l = await post(h, '/api/dev/logs/limpar', {}); assert.equal(l.j.limpos, 3);
      const re = await post(h, LOG, lote('s3', [1, 2, 3])); assert.equal(re.j.aceitos, 0, 'o reenvio do backlog antigo ressuscitou eventos limpos');
      const novo = await post(h, LOG, lote('s3', [4])); assert.equal(novo.j.aceitos, 1);
      const g = (await get(h, '/api/dev/logs?desde=3')).j; assert.deepEqual(g.eventos.map(x => x.seq), [4]);
    } finally { await h.para(); }
  });
});
