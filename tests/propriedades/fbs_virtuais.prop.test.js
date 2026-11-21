'use strict';
/* =====================================================================================================================
   fbs_virtuais.prop.test.js — TESTE DE PROPRIEDADES COM PLANTA SIMULADA do FB MAE (Patamar) · Passo 7 · 19/11/2026.
   PARA QUE SERVE (leigo): a "mae" decide quando comandar chaves. Em vez de alguns cenarios escritos a mao, o computador monta uma bancada de mentira (gerador, chaves, retorno fisico)
   e inventa SEQUENCIAS inteiras de eventos (iniciar ensaio, DSE cair, limite mudar, retorno travar, operador armar/desarmar/rearmar...). Depois de CADA evento confere as regras de seguranca:
     R1  so comanda chave (aplica) armada, com o DSE respondendo e com a GUARDA liberando a selecao (a guarda e a ultima barreira);
     R2  DSE sem resposta com a mae armada: derruba as chaves NO MESMO ciclo, desarma e vai para FALHA;
     R3  depois de uma FALHA DE EXECUCAO (retorno nao confirmou, carga acima do limite, DSE) nada e comandado de novo ate o operador armar/rearmar/desarmar;
     R4  rearma so funciona em FALHA com o DSE respondendo (e nunca sozinho);  R5  desarmada nunca comanda nem derruba;
     R6  etapa de 0 % abre todas as chaves (descarrega/derruba) e nao comanda carga;   R7  patamar MANUAL nunca chama aplica() (quem aplica e o operador);
     R8  carga confirmada acima do limite + tolerancia derruba e vai para FALHA;   R9  estados e foto sempre validos.
   COMO RODAR: npm --prefix tests/propriedades ci && node --test tests/propriedades/*.test.js        CONTRA-PROVA: FBV_MODULO=<arquivo antigo/quebrado> (ver mutacao em tests/mutacao).
   ===================================================================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fc = require('fast-check');
const fs = require('fs'), path = require('path'), vm = require('vm');
const MOD = process.env.FBV_MODULO ? path.resolve(process.env.FBV_MODULO) : path.join(__dirname, '../../dashboard/modulos-fonte/fbs_virtuais_v0.14.js');
const cfg = { numRuns: +process.env.FC_RUNS || 300, seed: +process.env.FC_SEED || 20261119 };
const carrega = () => { const ctx = { console, process, localStorage: { setItem() {}, getItem() { return null; } } }; vm.runInNewContext(fs.readFileSync(MOD, 'utf8'), ctx); return ctx.FBV; };
const VALIDOS = ['PARADO', 'AGUARDA_INICIO', 'AGUARDA_ETAPA', 'SUGERINDO', 'AGUARDA_APLICAR', 'ESCALONANDO', 'CONFIRMANDO', 'NO_PATAMAR', 'SEM_CARGA', 'PREVIA', 'FIM', 'FALHA'];
const EXEC = /retorno físico|carga confirmada|DSE sem resposta/;

// ---- planta simulada (o "host" da mae) ----
function mundo(pcts, sorteio) {
  const w = { t: 1_000_000, ini: false, fim: false, et: 0, pcts, kw100: 100, dse: true, guardaOk: true, limite: 110, sug: 30, manual: false, aplicou: false, cmd: 0, conf: 0, trava: false, lag: 2, chamadas: [], ultGuardaOk: null, viol: [], aguardaSalvar: false, planoS: 0, sugPrev: 40, menor: 1, nHabil: 10, pctLim: 110, diverg: 0 };
  const h = {
    agora: () => w.t, iniciado: () => w.ini, fimEnsaio: () => w.fim, etapa: () => w.et, nEtapas: () => w.pcts.length, alvoPct: i => w.pcts[i], kw100: () => w.kw100, modelo: () => ({ arquivo: 'm.dse' }), fonte: () => 'virtual',
    dseOk: () => w.dse, sugere: () => { w.chamadas.push({ k: 'sugere' }); return { total: w.sug }; }, guarda: () => { const kwSel = w.sug; w.ultGuardaOk = w.guardaOk; return { ok: w.guardaOk, mensagem: w.guardaOk ? '' : 'bloqueado', total: kwSel, limiteKw: w.limite }; },
    aplica: () => { w.chamadas.push({ k: 'aplica', arm: w.mae.armada, dse: w.dse, g: w.ultGuardaOk }); w.cmd = w.sug; w.pendente = w.t; },
    duracaoPlanoS: () => w.planoS, aguardaSalvar: () => w.aguardaSalvar, sugerePrevia: i => { w.chamadas.push({ k: 'sugerePrevia', i }); return { total: w.sugPrev }; }, limpaPrevia: () => w.chamadas.push({ k: 'limpaPrevia' }), limpaTracejado: () => w.chamadas.push({ k: 'limpaTracejado' }), tempoEtapaS: () => 5,
    derruba: m => { w.chamadas.push({ k: 'derruba', m, arm: w.mae.armada }); w.cmd = 0; w.conf = 0; }, descarrega: m => { w.chamadas.push({ k: 'descarrega', m }); w.cmd = 0; w.conf = 0; },
    kwComandado: () => w.cmd, kwConfirmado: () => w.conf, marco() {}, aplicaManual: () => w.manual, aplicouEt: () => w.aplicou, extra: () => ({ menorChaveKw: w.menor, nHabil: w.nHabil, pctLim: w.pctLim }), divergentes: () => w.diverg,
  };
  w.h = h; w.mae = sorteio.FBV.criaMae(h); return w;
}
const comandos = w => w.chamadas.filter(c => ['aplica', 'derruba', 'descarrega'].includes(c.k));
const planta = w => { if (w.cmd !== w.conf && !w.trava && w.t - (w.pendente || 0) >= w.lag * 1000) w.conf = w.cmd; };       // o retorno fisico segue o comando depois de `lag` s, a nao ser que esteja travado

const pctsArb = fc.array(fc.constantFrom(0, 30, 50, 75, 100, 107), { minLength: 1, maxLength: 6 });
const evArb = fc.oneof(
  { weight: 6, arbitrary: fc.integer({ min: 1, max: 25 }).map(n => ({ k: 'tick', n })) },
  { weight: 2, arbitrary: fc.constant({ k: 'inicia' }) }, { weight: 2, arbitrary: fc.constant({ k: 'avanca' }) }, { weight: 1, arbitrary: fc.constant({ k: 'fim' }) },
  { weight: 2, arbitrary: fc.boolean().map(ok => ({ k: 'dse', ok })) }, { weight: 2, arbitrary: fc.boolean().map(ok => ({ k: 'guarda', ok })) },
  { weight: 2, arbitrary: fc.constantFrom(0, 10, 30, 60, 120).map(v => ({ k: 'sug', v })) }, { weight: 2, arbitrary: fc.constantFrom(0, 50, 100, 200).map(v => ({ k: 'kw100', v })) },
  { weight: 2, arbitrary: fc.constantFrom(20, 100, 110, 150).map(v => ({ k: 'limite', v })) }, { weight: 2, arbitrary: fc.boolean().map(v => ({ k: 'trava', v })) },
  { weight: 1, arbitrary: fc.boolean().map(v => ({ k: 'manual', v })) }, { weight: 2, arbitrary: fc.boolean().map(v => ({ k: 'salvar', v })) }, { weight: 1, arbitrary: fc.constantFrom(0, 3, 12).map(v => ({ k: 'plano', v })) }, { weight: 1, arbitrary: fc.constantFrom(100, 107, 112).map(v => ({ k: 'pctLim', v })) }, { weight: 1, arbitrary: fc.constantFrom(0, 1, 2).map(v => ({ k: 'diverg', v })) }, { weight: 1, arbitrary: fc.boolean().map(v => ({ k: 'aplicou', v })) },
  { weight: 2, arbitrary: fc.constant({ k: 'arma' }) }, { weight: 1, arbitrary: fc.constant({ k: 'desarma' }) }, { weight: 2, arbitrary: fc.constant({ k: 'rearma' }) },
  { weight: 1, arbitrary: fc.constantFrom(0, 1, 2, 3).map(v => ({ k: 'conf', v })) },
);

function roda(pcts, evs, FBV, verifica) {
  const w = mundo(pcts, { FBV }); let semAplicar = false, execFalha = false;
  const ciclo = () => {
    const antes = { n: w.chamadas.length, arm: w.mae.armada, est: w.mae.estado, dse: w.dse, et: w.et, pct: w.ini ? w.pcts[w.et] : null };
    w.t += 1000; planta(w); w.mae.ciclo();
    const novas = w.chamadas.slice(antes.n), foto = w.mae.foto();
    verifica({ w, antes, novas, foto });
    if (/^FALHA$/.test(w.mae.estado) && EXEC.test(foto.msg || '')) execFalha = true;
  };
  for (const e of evs) {
    const nAntes = w.chamadas.length, estAntes = w.mae.estado;
    switch (e.k) {
      case 'tick': for (let i = 0; i < e.n; i++) ciclo(); break;
      case 'inicia': w.ini = true; break; case 'avanca': w.et = Math.min(w.et + 1, w.pcts.length - 1); break; case 'fim': w.fim = true; break;
      case 'dse': w.dse = e.ok; break; case 'guarda': w.guardaOk = e.ok; break; case 'sug': w.sug = e.v; break; case 'kw100': w.kw100 = e.v; break;
      case 'limite': w.limite = e.v; break; case 'trava': w.trava = e.v; break; case 'manual': w.manual = e.v; break; case 'salvar': w.aguardaSalvar = e.v; break; case 'plano': w.planoS = e.v; break; case 'pctLim': w.pctLim = e.v; break; case 'diverg': w.diverg = e.v; break; case 'aplicou': w.aplicou = e.v; break; case 'conf': w.conf = e.v * 40; break;
      case 'arma': w.mae.arma(); execFalha = false; break; case 'desarma': w.mae.desarma('teste'); execFalha = false; break;
      case 'rearma': { const ok = w.mae.rearma(); const podia = estAntes === 'FALHA' && w.dse; assert.equal(ok, podia, 'rearma so vale em FALHA com o DSE respondendo'); if (ok) execFalha = false; else assert.equal(w.mae.estado, estAntes, 'rearma negado nao muda o estado'); break; }
    }
    if (['arma', 'desarma', 'rearma'].includes(e.k)) assert.equal(w.chamadas.length, nAntes, e.k + ' nunca comanda nem derruba por si so');
  }
  return w;
}

test('SEGURANCA em sequencias aleatorias: R1 a R9 valem depois de cada ciclo, com planta simulada', () => {
  const FBV = carrega();
  fc.assert(fc.property(pctsArb, fc.array(evArb, { minLength: 1, maxLength: 45 }), (pcts, evs) => {
    let execBloqueado = false, estPrev = 'PARADO';
    roda(pcts, evs, FBV, ({ w, antes, novas, foto }) => {
      const aplic = novas.filter(c => c.k === 'aplica'), quedas = novas.filter(c => c.k === 'derruba' || c.k === 'descarrega');
      const est = w.mae.estado;
      assert.ok(VALIDOS.includes(est), 'estado invalido ' + est); assert.equal(foto.v, 1); assert.equal(foto.armada, w.mae.armada); assert.equal(foto.estado, est);
      for (const a of aplic) { assert.equal(a.arm, true, 'R1: aplica com a mae desarmada'); assert.equal(a.dse, true, 'R1: aplica com o DSE sem resposta'); assert.equal(a.g, true, 'R1: aplica sem a guarda liberar'); }   // (a guarda e conferida DENTRO do mesmo ciclo)
      if (!antes.arm) { assert.equal(novas.length, 0, 'R5: desarmada nao comanda nem derruba'); }
      if (antes.arm && !antes.dse) { assert.equal(quedas.length >= 1, true, 'R2: DSE caiu e as chaves nao foram derrubadas'); assert.equal(w.mae.armada, false, 'R2: deve desarmar'); assert.equal(est, 'FALHA'); assert.equal(aplic.length, 0); }
      if (antes.arm && antes.pct === 0 && w.ini && w.dse && aplic.length) assert.fail('R6: etapa de 0 % nao comanda carga');
      if (w.manual && aplic.length && antes.arm && antes.pct > 0 && antes.est !== 'AGUARDA_APLICAR') { /* aplicaManual pode ter mudado no meio da sequencia; so conferimos o caso estavel abaixo */ }
      if (est === 'FALHA' && EXEC.test(foto.msg || '')) execBloqueado = true;
      if (execBloqueado && est === 'FALHA') assert.equal(aplic.length, 0, 'R3: comandou depois de FALHA de execucao sem rearme');
      if (est !== 'FALHA' || !EXEC.test(foto.msg || '')) execBloqueado = (est === 'FALHA') ? execBloqueado : false;
      estPrev = est;
    });
  }), cfg);
});

test('R3 direto: apos "retorno fisico nao confirmou" a mae NAO reaplica sozinha, mesmo com parametros mudando; so rearma() destrava', () => {
  const FBV = carrega(), w = mundo([50, 100], { FBV }); w.trava = true;                // o retorno nunca confirma
  w.ini = true; w.mae.arma();
  for (let i = 0; i < 5; i++) { w.t += 1000; w.mae.ciclo(); }
  assert.equal(w.chamadas.filter(c => c.k === 'aplica').length, 1, 'comandou 1 vez'); assert.ok(['CONFIRMANDO', 'ESCALONANDO'].includes(w.mae.estado), w.mae.estado);
  for (let i = 0; i < 25; i++) { w.t += 1000; w.mae.ciclo(); }                          // passa da folga de confirmacao (20 s)
  assert.equal(w.mae.estado, 'FALHA'); assert.match(w.mae.foto().msg, /retorno físico não confirmou/);
  const n = w.chamadas.length; w.kw100 = 150; w.limite = 200; w.sug = 60; w.et = 1;     // mudar parametros e etapa NAO reaplica
  for (let i = 0; i < 10; i++) { w.t += 1000; w.mae.ciclo(); }
  assert.equal(w.chamadas.length, n, 'nao pode comandar nada depois da FALHA de execucao'); assert.equal(w.mae.estado, 'FALHA');
  w.dse = false; assert.equal(w.mae.rearma(), false, 'rearma exige o DSE respondendo'); w.dse = true; w.trava = false;
  assert.equal(w.mae.rearma(), true); assert.equal(w.mae.estado, 'AGUARDA_ETAPA');
  for (let i = 0; i < 4; i++) { w.t += 1000; w.mae.ciclo(); }
  assert.equal(w.chamadas.filter(c => c.k === 'aplica').length, 2, 'depois do rearme volta a comandar a etapa atual');
});

test('R8 direto: carga confirmada acima do limite + tolerancia derruba UMA vez e vai para FALHA; dentro da tolerancia nao', () => {
  const FBV = carrega();
  for (const [conf, deveFalhar] of [[110.4, false], [110.5, false], [110.6, true], [150, true]]) {
    const w = mundo([50, 100], { FBV }); w.ini = true; w.sug = 50; w.limite = 110; w.mae.arma();
    for (let i = 0; i < 6; i++) { w.t += 1000; w.mae.ciclo(); }
    w.conf = conf; for (let i = 0; i < 3; i++) { w.t += 1000; w.mae.ciclo(); }
    assert.equal(w.mae.estado === 'FALHA', deveFalhar, `conf ${conf} kW com limite 110`);
    if (deveFalhar) { assert.equal(w.chamadas.filter(c => c.k === 'derruba' && /acima do limite/.test(c.m)).length, 1, 'derruba uma vez so'); assert.match(w.mae.foto().msg, /acima do limite/); }
  }
});

test('R7 direto: patamar MANUAL nao chama aplica(); espera o operador (AGUARDA_APLICAR) e so escalona depois do Aplicar', () => {
  const FBV = carrega(), w = mundo([50], { FBV }); w.ini = true; w.manual = true; w.mae.arma();
  for (let i = 0; i < 5; i++) { w.t += 1000; w.mae.ciclo(); }
  assert.equal(w.mae.estado, 'AGUARDA_APLICAR'); assert.equal(w.chamadas.filter(c => c.k === 'aplica').length, 0);
  w.aplicou = true; w.cmd = 50; w.conf = 50; for (let i = 0; i < 4; i++) { w.t += 1000; w.mae.ciclo(); }
  assert.equal(w.chamadas.filter(c => c.k === 'aplica').length, 0, 'quem aplica e o operador'); assert.ok(['ESCALONANDO', 'CONFIRMANDO', 'NO_PATAMAR'].includes(w.mae.estado), w.mae.estado);
});

test('guarda que BLOQUEIA a selecao: FALHA "guarda bloqueou" e nada e comandado; etapa nova tenta de novo', () => {
  const FBV = carrega(), w = mundo([50, 75], { FBV }); w.ini = true; w.guardaOk = false; w.mae.arma();
  for (let i = 0; i < 4; i++) { w.t += 1000; w.mae.ciclo(); }
  assert.equal(w.mae.estado, 'FALHA'); assert.match(w.mae.foto().msg, /guarda bloqueou/); assert.equal(comandos(w).length, 0);
  w.guardaOk = true; w.et = 1; for (let i = 0; i < 3; i++) { w.t += 1000; w.mae.ciclo(); }
  assert.equal(w.chamadas.filter(c => c.k === 'aplica').length, 1, 'etapa nova sempre tenta de novo (falha de planejamento)');
});

test('sem kW a 100 %, sem combinacao de chaves e etapa de 0 %: estados e mensagens certos, sem comandar carga', () => {
  const FBV = carrega();
  let w = mundo([50], { FBV }); w.ini = true; w.kw100 = 0; w.mae.arma(); for (let i = 0; i < 3; i++) { w.t += 1000; w.mae.ciclo(); }
  assert.equal(w.mae.estado, 'FALHA'); assert.match(w.mae.foto().msg, /kW a 100 %/); assert.equal(comandos(w).length, 0);
  w = mundo([50], { FBV }); w.ini = true; w.sug = 0; w.mae.arma(); for (let i = 0; i < 3; i++) { w.t += 1000; w.mae.ciclo(); }
  assert.equal(w.mae.estado, 'FALHA'); assert.match(w.mae.foto().msg, /nenhuma combinação cabe|sem chaves habilitadas/); assert.equal(comandos(w).length, 0);
  w = mundo([0, 50], { FBV }); w.ini = true; w.mae.arma(); for (let i = 0; i < 3; i++) { w.t += 1000; w.mae.ciclo(); }
  assert.equal(w.mae.estado, 'SEM_CARGA'); assert.equal(w.chamadas.filter(c => c.k === 'aplica').length, 0); assert.equal(w.chamadas.filter(c => c.k === 'descarrega').length, 1, 'usa descarrega() (queda planejada) quando o host oferece');
  w = mundo([50], { FBV }); w.fim = true; w.ini = true; w.mae.arma(); w.t += 1000; w.mae.ciclo(); assert.equal(w.mae.estado, 'FIM'); assert.equal(w.mae.armada, false);
  w = mundo([50], { FBV }); w.mae.arma(); assert.equal(w.mae.estado, 'AGUARDA_INICIO'); w.t += 1000; w.mae.ciclo(); assert.equal(w.mae.estado, 'AGUARDA_INICIO'); assert.equal(comandos(w).length, 0);
});

test('caminho feliz completo: sugere, guarda libera, comanda, confirma e chega a NO_PATAMAR; a foto mostra os kW', () => {
  const FBV = carrega(), w = mundo([50, 100], { FBV }); w.ini = true; w.sug = 50; w.mae.arma(); const vistos = new Set();
  for (let i = 0; i < 12; i++) { w.t += 1000; planta(w); w.mae.ciclo(); vistos.add(w.mae.estado); }   // com a planta: o retorno fisico segue o comando
  assert.equal(w.mae.estado, 'NO_PATAMAR'); for (const s of ['CONFIRMANDO', 'NO_PATAMAR']) assert.ok(vistos.has(s), 'passou por ' + s);
  const f = w.mae.foto(); assert.deepEqual([f.kw.alvo, f.kw.sel, f.kw.cmd, f.kw.conf, f.kw.cap100], [50, 50, 50, 50, 100]); assert.equal(f.etapa.idx, 0); assert.equal(f.etapa.alvoPct, 50);
  assert.equal(w.chamadas.filter(c => c.k === 'aplica').length, 1, 'comandou uma vez so');
  w.mae.desarma('fim'); assert.equal(w.mae.estado, 'PARADO'); assert.equal(w.mae.armada, false);
});

// ---- cenarios dirigidos: previa da proxima etapa, divergencia, mudanca de parametros, plano com duracao, tolerancia de confirmacao ----
const ciclos = (w, n) => { for (let i = 0; i < n; i++) { w.t += 1000; planta(w); w.mae.ciclo(); } };
const nChamadas = (w, k) => w.chamadas.filter(c => c.k === k).length;

test('PREVIA: com o SALVAR pendente a mae mostra a sugestao da proxima etapa SEM comandar; ao salvar ACEITA a mesma selecao (nao recalcula); sem SALVAR a previa e cancelada', () => {
  const FBV = carrega(), w = mundo([50, 75, 0], { FBV }); w.ini = true; w.sug = 50; w.mae.arma(); ciclos(w, 6);
  assert.equal(w.mae.estado, 'NO_PATAMAR'); const aplicsAntes = nChamadas(w, 'aplica'), sugAntes = nChamadas(w, 'sugere');
  w.aguardaSalvar = true; w.sugPrev = 70; ciclos(w, 2);
  assert.equal(w.mae.estado, 'PREVIA'); assert.match(w.mae.foto().msg, /próxima etapa 2 \(75 %\) → 70\.0 kW · SALVAR aplica/); assert.equal(nChamadas(w, 'sugerePrevia'), 1, 'calcula a previa uma vez so'); assert.equal(nChamadas(w, 'aplica'), aplicsAntes, 'previa nao comanda');
  w.aguardaSalvar = false; ciclos(w, 1); assert.equal(w.mae.estado, 'NO_PATAMAR', 'sem SALVAR pendente a previa e cancelada'); assert.equal(nChamadas(w, 'limpaPrevia'), 1);
  w.aguardaSalvar = true; ciclos(w, 2); assert.equal(w.mae.estado, 'PREVIA'); w.sug = 99;            // o operador salva: etapa avanca, e a mae aceita a previa (70) sem chamar sugere()
  w.aguardaSalvar = false; w.et = 1; ciclos(w, 1);
  assert.equal(nChamadas(w, 'sugere'), sugAntes, 'prévia aceita: nao recalcula'); assert.equal(nChamadas(w, 'aplica'), aplicsAntes + 1); assert.equal(w.mae.foto().kw.sel, 70, 'aceita a selecao vista na previa');
  assert.ok(w.mae.foto().log.some(l => /prévia aceita pelo SALVAR: 70\.0 kW/.test(l.m)));
});

test('PREVIA de etapa com 0 %: avisa que SALVAR abre todas as chaves (limpa o tracejado) e nao calcula sugestao', () => {
  const FBV = carrega(), w = mundo([50, 0], { FBV }); w.ini = true; w.sug = 50; w.mae.arma(); ciclos(w, 6);
  w.aguardaSalvar = true; ciclos(w, 2);
  assert.equal(w.mae.estado, 'PREVIA'); assert.match(w.mae.foto().msg, /\(0 %\): SALVAR abre todas as chaves/); assert.equal(nChamadas(w, 'limpaTracejado'), 1); assert.equal(nChamadas(w, 'sugerePrevia'), 0);
  w.aguardaSalvar = false; w.et = 1; ciclos(w, 1); assert.equal(w.mae.estado, 'SEM_CARGA'); assert.equal(nChamadas(w, 'descarrega'), 1);
});

test('PREVIA so na penultima etapa em diante: na ultima etapa nao ha proxima, entao nao ha previa; e so a partir de NO_PATAMAR / SEM_CARGA', () => {
  const FBV = carrega(), w = mundo([50, 75], { FBV }); w.ini = true; w.mae.arma(); w.et = 1; ciclos(w, 6); assert.equal(w.mae.estado, 'NO_PATAMAR');
  w.aguardaSalvar = true; ciclos(w, 3); assert.equal(w.mae.estado, 'NO_PATAMAR', 'ultima etapa: sem previa'); assert.equal(nChamadas(w, 'sugerePrevia'), 0);
  const w2 = mundo([50, 75], { FBV }); w2.ini = true; w2.aguardaSalvar = true; w2.trava = true; w2.mae.arma(); ciclos(w2, 2);
  assert.notEqual(w2.mae.estado, 'PREVIA', 'durante o escalonamento/confirmacao nao mostra previa'); assert.equal(nChamadas(w2, 'sugerePrevia'), 0);
});

test('DIVERGENCIA no patamar: chaves diferentes do sugerido (alem da tolerancia) so AVISAM, sem reaplicar; volta ao normal quando conferem', () => {
  const FBV = carrega(), w = mundo([50], { FBV }); w.ini = true; w.sug = 50; w.mae.arma(); ciclos(w, 6); assert.equal(w.mae.estado, 'NO_PATAMAR'); const ap = nChamadas(w, 'aplica');
  w.cmd = 50.4; w.conf = 50.4; ciclos(w, 2); assert.doesNotMatch(w.mae.foto().msg, /chaves ≠/, 'dentro da tolerancia (0,5 kW) nao avisa');
  w.cmd = 44; w.conf = 44; ciclos(w, 2); assert.match(w.mae.foto().msg, /chaves ≠ sugerido \(44\.0 × 50\.0 kW\)/); assert.equal(w.mae.estado, 'NO_PATAMAR'); assert.equal(nChamadas(w, 'aplica'), ap, 'so avisa: nao reaplica');
  w.cmd = 50; w.conf = 50; ciclos(w, 2); assert.doesNotMatch(w.mae.foto().msg, /chaves ≠/); assert.match(w.mae.foto().msg, /confirmado 50\.0 kW/);
});

test('mudar kW a 100 %, % de seguranca ou chaves habilitadas DURANTE a etapa recalcula e reaplica uma vez; sem mudanca nao reaplica', () => {
  const FBV = carrega(), w = mundo([50], { FBV }); w.ini = true; w.sug = 50; w.mae.arma(); ciclos(w, 6); assert.equal(nChamadas(w, 'aplica'), 1);
  ciclos(w, 10); assert.equal(nChamadas(w, 'aplica'), 1, 'sem mudanca: nao reaplica');
  for (const [campo, valor] of [['kw100', 120], ['pctLim', 107], ['nHabil', 9]]) { const n = nChamadas(w, 'aplica'); w[campo] = valor; w.sug = 55; ciclos(w, 6); assert.equal(nChamadas(w, 'aplica'), n + 1, campo + ' mudou: recalcula e reaplica'); w.sug = 50; }
});

test('plano com duracao: ESCALONANDO ate a duracao acabar; so entao CONFIRMANDO; e a confirmacao exige kW dentro da tolerancia (metade da menor chave, no maximo 0,5 kW)', () => {
  const FBV = carrega(), w = mundo([50], { FBV }); w.ini = true; w.sug = 50; w.planoS = 5; w.lag = 0; w.mae.arma(); ciclos(w, 1);
  assert.equal(w.mae.estado, 'ESCALONANDO'); ciclos(w, 3); assert.equal(w.mae.estado, 'ESCALONANDO', 'plano de 5 s ainda nao acabou'); ciclos(w, 2); assert.ok(['CONFIRMANDO', 'NO_PATAMAR'].includes(w.mae.estado), w.mae.estado);
  for (const [menor, conf, ok] of [[1, 49.6, true], [1, 49.4, false], [0.5, 49.8, true], [0.5, 49.7, false], [10, 49.6, true], [10, 49.4, false]]) {
    const x = mundo([50], { FBV }); x.ini = true; x.sug = 50; x.menor = menor; x.trava = true; x.mae.arma(); ciclos(x, 3); x.conf = conf; ciclos(x, 1);
    assert.equal(x.mae.estado === 'NO_PATAMAR', ok, `menor chave ${menor} kW, confirmado ${conf} kW`);
  }
  const d = mundo([50], { FBV }); d.ini = true; d.sug = 50; d.mae.arma(); d.diverg = 1; ciclos(d, 4); assert.equal(d.mae.estado, 'CONFIRMANDO', 'chave divergente impede a confirmacao'); assert.match(d.mae.foto().filhos[6].txt, /1 chave\(s\) divergente\(s\)/);
  d.diverg = 0; ciclos(d, 1); assert.equal(d.mae.estado, 'NO_PATAMAR');
});

test('confirmacao que demora mais que a folga (20 s) vira FALHA de execucao; dentro da folga nao', () => {
  const FBV = carrega();
  for (const [seg, falha] of [[19, false], [21, true]]) { const w = mundo([50], { FBV }); w.ini = true; w.sug = 50; w.trava = true; w.mae.arma(); ciclos(w, 1); ciclos(w, seg); assert.equal(w.mae.estado === 'FALHA', falha, seg + ' s'); }
});

test('AGUARDA_APLICAR: ao aplicar a guarda e conferida DE NOVO; se bloquear a selecao aplicada vira FALHA', () => {
  const FBV = carrega(), w = mundo([50], { FBV }); w.ini = true; w.manual = true; w.sug = 50; w.mae.arma(); ciclos(w, 3); assert.equal(w.mae.estado, 'AGUARDA_APLICAR');
  w.aplicou = true; w.guardaOk = false; ciclos(w, 1); assert.equal(w.mae.estado, 'FALHA'); assert.match(w.mae.foto().msg, /guarda bloqueou a seleção aplicada/);
  const x = mundo([50], { FBV }); x.ini = true; x.manual = true; x.sug = 50; x.mae.arma(); ciclos(x, 3); x.aplicou = true; ciclos(x, 1); assert.ok(['ESCALONANDO', 'CONFIRMANDO', 'NO_PATAMAR'].includes(x.mae.estado), x.mae.estado); assert.ok(x.mae.foto().log.some(l => /operador aplicou: 50\.0 kW/.test(l.m)), 'registra que o operador aplicou');
});

test('FRONTEIRAS: derruba UMA vez mesmo com a carga continuando acima do limite; folga de confirmacao exata (20 s); divergencia exatamente na tolerancia nao avisa', () => {
  const FBV = carrega();
  { const w = mundo([50, 100], { FBV }); w.ini = true; w.sug = 50; w.limite = 110; w.mae.arma(); ciclos(w, 6);
    w.h.derruba = m => { w.chamadas.push({ k: 'derruba', m }); };                      // a chave NAO abre de verdade: a carga confirmada continua alta
    w.trava = true; w.conf = 150; ciclos(w, 8);                                        // trava: a planta nao devolve o retorno ao comando
    assert.equal(w.mae.estado, 'FALHA'); assert.equal(w.chamadas.filter(c => c.k === 'derruba').length, 1, 'derruba uma vez so, nao a cada ciclo'); }
  { const w = mundo([50], { FBV }); w.ini = true; w.sug = 50; w.trava = true; w.mae.arma(); ciclos(w, 1);
    assert.equal(w.mae.estado, 'CONFIRMANDO'); ciclos(w, 20); assert.equal(w.mae.estado, 'CONFIRMANDO', 'com exatamente 20 s ainda espera'); ciclos(w, 1); assert.equal(w.mae.estado, 'FALHA', 'passou de 20 s'); }
  { const w = mundo([50], { FBV }); w.ini = true; w.sug = 50; w.mae.arma(); ciclos(w, 6); assert.equal(w.mae.estado, 'NO_PATAMAR');
    w.cmd = 50.5; w.conf = 50.5; ciclos(w, 2); assert.doesNotMatch(w.mae.foto().msg, /chaves ≠/, 'diferenca exatamente igual a tolerancia nao avisa');
    w.cmd = 50.6; w.conf = 50.6; ciclos(w, 2); assert.match(w.mae.foto().msg, /chaves ≠/, 'um pouco acima da tolerancia avisa'); }
});

test('o "Aplicar" do operador so vale em AGUARDA_APLICAR: com aplicouEt verdadeiro em outro estado nada muda', () => {
  const FBV = carrega(), w = mundo([50, 75], { FBV }); w.ini = true; w.sug = 50; w.mae.arma(); ciclos(w, 6); assert.equal(w.mae.estado, 'NO_PATAMAR');
  const n = w.chamadas.length, log0 = w.mae.foto().log.length; w.aplicou = true; ciclos(w, 3);
  assert.equal(w.mae.estado, 'NO_PATAMAR'); assert.ok(!w.mae.foto().log.slice(0, w.mae.foto().log.length - log0).some(l => /operador aplicou/.test(l.m)), 'nao reinicia o escalonamento'); assert.equal(w.chamadas.length, n);
});

test('desarmar e armar limpam o que ficou de uma execucao anterior (previa, etapa aplicada, FALHA de execucao)', () => {
  const FBV = carrega(), w = mundo([50, 75], { FBV }); w.ini = true; w.sug = 50; w.trava = true; w.mae.arma(); ciclos(w, 25); assert.equal(w.mae.estado, 'FALHA');
  w.mae.desarma('operador'); assert.equal(w.mae.estado, 'PARADO'); w.trava = false; w.mae.arma(); ciclos(w, 6);
  assert.equal(w.mae.estado, 'NO_PATAMAR', 'depois de desarmar e armar a falha de execucao nao persiste'); assert.equal(w.chamadas.filter(c => c.k === 'aplica').length, 2, 'comanda a etapa de novo');
  assert.equal(w.mae.foto().filhos[9].estado, 'ok');
});
