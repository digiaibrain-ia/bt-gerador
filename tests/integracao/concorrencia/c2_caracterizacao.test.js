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
  const h = await sobe(Object.assign({ fluxos: ['chaves-56-api-v3.4'], env: ENV_TESTE }, opt)); const e = enderecos('56');
  h.plc.escrever(e.comOk, true); h.plc.escrever(e.seletora, true);
  assert.ok(await esperaAte(async () => (await get(h, '/api/chaves/56')).status === 200, 10000), 'BC56 nao ficou pronto');
  return { h, e };
}
// espera o cache do fluxo refletir o que o teste escreveu direto no PLC
const veNaLeitura = (h, fn) => esperaAte(async () => fn((await get(h, '/api/chaves/56')).j || {}), 4000, 60);
// segura a fila: a 1a escrita da proxima chamada demora 400 ms (< espera de 450 ms do fluxo, entao responde 200)
const seguraFila = h => h.plc.atrasosEscrita.push(400);

describe('C2 R1/R5 BC56 - ordem e validacao dos comandos', () => {
  test('(projeto v2.4, preservado na 4a) "Desligar banco" tem PRIORIDADE: executa antes dos comandos comuns que ja estavam na fila', async () => {
    const { h, e } = await bc56();
    try {
      h.plc.trace.length = 0; seguraFila(h);
      const a = P(h, 'habilitar', { indice: 10, habilitada: true }); await dorme(60);
      const b = P(h, 'habilitar', { indice: 2, habilitada: true }); await dorme(40);
      const c = P(h, 'banco', { ligar: false });
      const r = await Promise.all([a, b, c]);
      assert.deepEqual(r.map(x => x.status), [200, 200, 200], r.map(x => x.t).join(' | '));
      const ord = addr => h.plc.trace.filter(t => t.ok && t.addr === addr).map(t => t.ordem)[0];
      assert.ok(ord(e.cbBanco) < ord(e.hab(2)), 'o desligar deveria ser aplicado antes do habilitar que estava na fila (ordens ' + ord(e.cbBanco) + ' e ' + ord(e.hab(2)) + ')');
    } finally { await h.para(); }
  });

  // --- Etapa 4a (Fase 3): P3-A1/A2/A3 CORRIGIDOS nas versoes v3.3/v1.4. Contrato aprovado: INVARIANTE (estado final = ultimo comando aceito e resposta VERDADEIRA).
  test('P3-A1 (corrigido): "Ligar banco" aceito antes e "Desligar banco" depois: o banco termina DESLIGADO e cada resposta e verdadeira (o ligar antigo foi executado antes OU cancelado com 409)', async () => {
    const { h, e } = await bc56();
    try {
      h.plc.trace.length = 0; seguraFila(h);
      const a = P(h, 'habilitar', { indice: 10, habilitada: true }); await dorme(60);
      const b = P(h, 'banco', { ligar: true }); await dorme(40); const c = P(h, 'banco', { ligar: false });
      const [ra, rb, rc] = await Promise.all([a, b, c]); await dorme(300);
      assert.equal(ra.status, 200, ra.t); assert.equal(rc.status, 200, rc.t);
      assert.equal(h.plc.ler(e.cbBanco), false, 'ultimo comando aceito foi DESLIGAR, mas o banco ficou ligado');
      const aplicados = V.valoresAplicados(h.plc.trace, e.cbBanco);
      if (rb.status === 200) assert.deepEqual(aplicados, [true, false], 'o ligar respondeu 200 mas nao foi executado antes do desligar');
      else { assert.equal(rb.status, 409, rb.t); assert.equal(rb.j.codigo, 'CANCELADO_POR_DESLIGAR'); assert.ok(!aplicados.includes(true), 'o ligar foi cancelado (409) mas chegou ao PLC'); }
      assert.equal(V.respostasEmDuplicidade(h.logs).length, 0);
    } finally { await h.para(); }
  });

  test('P3-A2 (corrigido): "selecionar" aceito antes de um "habilitar:false" na frente da fila: nunca ChaveSel numa chave desabilitada e a resposta e verdadeira', async () => {
    const { h, e } = await bc56();
    try {
      h.plc.escrever(e.cbBanco, true); h.plc.escrever(e.hab(3), true);
      assert.ok(await veNaLeitura(h, j => j.bancoLigado === true && j.habilitada?.[2] === true));
      seguraFila(h);
      const a = P(h, 'habilitar', { indice: 10, habilitada: true }); await dorme(60);
      const b = P(h, 'habilitar', { indice: 3, habilitada: false }); await dorme(40); const c = P(h, 'selecionar', { indice: 3 });
      const [, rb, rc] = await Promise.all([a, b, c]); await dorme(300);
      assert.equal(rb.status, 200, rb.t);
      assert.ok(!(h.plc.ler(e.hab(3)) === false && h.plc.ler(e.chaveSel) === 3), 'ChaveSel=3 numa chave que ficou desabilitada');
      assert.equal(rc.status === 200, h.plc.ler(e.chaveSel) === 3, 'resposta ' + rc.status + ' nao confere com o estado (ChaveSel=' + h.plc.ler(e.chaveSel) + ')');
      assert.equal(rc.status, 409, rc.t); assert.equal(rc.j.codigo, 'ESTADO_MUDOU');
    } finally { await h.para(); }
  });

  test('P3-A3 (corrigido): "ligar chave" aceito antes de um "Desligar banco": nunca CbLigar=TRUE com o banco desligado e a resposta e verdadeira', async () => {
    const { h, e } = await bc56();
    try {
      h.plc.escrever(e.cbBanco, true); h.plc.escrever(e.hab(2), true);
      assert.ok(await veNaLeitura(h, j => j.bancoLigado === true && j.habilitada?.[1] === true));
      seguraFila(h);
      const a = P(h, 'habilitar', { indice: 10, habilitada: true }); await dorme(60);
      const c = P(h, 'ligar', { indice: 2, ligar: true }); await dorme(40); const b = P(h, 'banco', { ligar: false });
      const [, rc, rb] = await Promise.all([a, c, b]); await dorme(300);
      assert.equal(rb.status, 200, rb.t);
      assert.ok(!(h.plc.ler(e.cbBanco) === false && h.plc.ler(e.cb(2)) === true), 'chave ligada (CbLigar2) com o banco desligado');
      assert.equal(rc.status === 200, h.plc.ler(e.cb(2)) === true, 'resposta ' + rc.status + ' nao confere com CbLigar2');
      assert.equal(rc.status, 409, rc.t);
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
  test('P3-A4 (corrigido, 4b): escrita mais lenta que a espera de 450 ms mas dentro da janela de 2 s => 200 (sem falso erro) e aplicada', async () => {
    const { h, e } = await bc56();
    try {
      h.plc.atrasosEscrita.push(900);
      const r = await P(h, 'habilitar', { indice: 4, habilitada: true });
      assert.equal(r.status, 200, 'falso erro com a escrita ainda dentro da janela: ' + r.t);
      assert.equal(h.plc.ler(e.hab(4)), true);
    } finally { await h.para(); }
  });

  test('P3-A4 (corrigido, 4b): escrita alem da janela => 504 incerto:true (nunca 500 com escrita que sera aplicada depois) e a resposta e coerente com o estado', async () => {
    const { h, e } = await bc56({ envAbas: { CONF_JANELA_MS: 1000 } });
    try {
      h.plc.atrasosEscrita.push(3000);
      const t0 = Date.now(); const r = await P(h, 'habilitar', { indice: 4, habilitada: true }); const dt = Date.now() - t0;
      assert.equal(r.status, 504, r.t); assert.equal(r.j.incerto, true); assert.match(r.j.erro, /confira o estado antes de repetir/);
      assert.ok(dt >= 900 && dt < 2500, 'a janela de 1 s deveria fechar perto de 1 s; veio ' + dt + ' ms');
      assert.equal(h.plc.ler(e.hab(4)), false, 'ainda nao aplicada quando o 504 saiu');
      assert.ok(await esperaAte(() => h.plc.ler(e.hab(4)) === true, 5000), 'a escrita tardia nao chegou (o 504 e "incerto", nao "falhou")');
      assert.equal(V.respostasEmDuplicidade(h.logs).length, 0);
    } finally { await h.para(); }
  });

  test('a fila NAO fica presa depois de um 504: o proximo comando (outra variavel) e atendido e as respostas sao uma por pedido (sem duplicidade)', async () => {
    const { h, e } = await bc56({ envAbas: { CONF_JANELA_MS: 1000 } });
    try {
      h.plc.atrasosEscrita.push(2500);
      const a = await P(h, 'habilitar', { indice: 5, habilitada: true });
      assert.equal(a.status, 504, a.t);
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
  test('P3-A5 (corrigido, 4b): modo CONCORRENTE - escrita antiga atrasada que desfaz um "desligar" aceito e CORRIGIDA pela reafirmacao (estado final = ultimo comando aceito)', async () => {
    const { h, e } = await bc56({ envAbas: { CONF_JANELA_MS: 1000, QUARENTENA_MS: 4000 } });
    try {
      h.plc.latencia.serial = false;
      h.plc.escrever(e.cbBanco, true); h.plc.escrever(e.hab(1), true);
      assert.ok(await veNaLeitura(h, j => j.bancoLigado === true && j.habilitada?.[0] === true));
      h.plc.trace.length = 0; h.plc.atrasosEscrita.push(4000);
      const a = await P(h, 'ligar', { indice: 1, ligar: true });          // 504 incerto: a escrita fica "no ar" por 4 s
      assert.equal(a.status, 504, a.t);
      const b = await P(h, 'ligar', { indice: 1, ligar: false });          // desligar e comando de SEGURANCA: passa pela quarentena
      assert.equal(b.status, 200, b.t);
      // a escrita antiga (TRUE) chega ao PLC e a reafirmacao precisa devolver FALSE
      assert.ok(await esperaAte(() => h.plc.trace.some(t => t.ok && t.addr === e.cb(1) && t.valor === true), 6000), 'a escrita antiga nao chegou (cenario nao reproduzido)');
      assert.ok(await esperaAte(() => h.plc.ler(e.cb(1)) === false, 6000, 100), 'CbLigar1 ficou TRUE depois de "ligar:false" aceito (200): a reafirmacao nao corrigiu');
      const ok = h.plc.trace.filter(t => t.ok && t.addr === e.cb(1)).sort((x, y) => x.ordem - y.ordem);
      assert.deepEqual(ok.map(t => t.valor), [false, true, false], 'sequencia aplicada: ' + ok.map(t => t.valor).join(','));
      assert.ok(ok[2].tAplicada - ok[1].tAplicada < 3500, 'tempo com a chave TRUE indevidamente: ' + (ok[2].tAplicada - ok[1].tAplicada) + ' ms');
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
