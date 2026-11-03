// Testes da FB MAE virtual (maquina de estados) com um "host" simulado - rodar: node --test tests/fb/
// Cada teste monta um host falso (relogio, DSE, chaves) e anda a maquina ciclo a ciclo, como um OB ciclico.
// Itens marcados { todo } sao ACHADOS conhecidos (ver docs/bt2/analise/): o teste descreve o comportamento desejado e hoje falha.
// Modulo testado: v0.13 por padrao. Para provar que um teste novo NAO e vacuo: FBV_MODULO=dashboard/modulos-fonte/fbs_virtuais_v0.12.js node --test tests/fb/fbs_virtuais.test.js
const test = require('node:test'), assert = require('node:assert/strict'), path = require('path'), fs = require('fs'), vm = require('vm');
const MOD = process.env.FBV_MODULO ? path.resolve(process.env.FBV_MODULO) : path.join(__dirname, '../../dashboard/modulos-fonte/fbs_virtuais_v0.13.js');
globalThis.BroadcastChannel = undefined; globalThis.BANCOS = [{ id: '56' }, { id: '400' }]; // evita canal aberto segurando o processo
const { FBV } = (() => { require(MOD); return { FBV: globalThis.FBV }; })();

function criaHost(o = {}) {
  const h = { t: 0, ini: true, et: 0, pcts: [50, 100], kw100d: 100, dse: true, sel: 50, cmd: 0, conf: 0, manual: false, aplicou: false, salvar: false,
    chamadas: { aplica: 0, derruba: 0, sugere: 0 }, guardaOk: true, plano: 5, extraD: { nHabil: 10, pctLim: 107, menorChaveKw: 5 }, fim: false };
  Object.assign(h, o);
  return Object.assign(h, {
    agora: () => h.t, iniciado: () => h.ini, fimEnsaio: () => h.fim, etapa: () => h.et, nEtapas: () => h.pcts.length, alvoPct: i => h.pcts[i],
    kw100: () => h.kw100d, modelo: () => ({ arquivo: 'teste' }), fonte: () => 'real', dseOk: () => h.dse,
    sugere: () => { h.chamadas.sugere++; return { total: h.sel }; },
    guarda: () => h.guardaOk ? { ok: true, total: h.sel, limiteKw: 107 } : { ok: false, total: h.sel, limiteKw: 107, mensagem: 'Bloqueado: acima do limite' },
    aplica: () => { h.chamadas.aplica++; h.cmd = h.sel; }, duracaoPlanoS: () => h.plano, aguardaSalvar: () => h.salvar,
    sugerePrevia: () => ({ total: 100 }), limpaPrevia() {}, derruba: () => { h.chamadas.derruba++; h.cmd = 0; h.conf = 0; },
    kwComandado: () => h.cmd, kwConfirmado: () => h.conf, marco() {}, tempoEtapaS: () => 0, extra: () => h.extraD,
    aplicaManual: () => h.manual, aplicouEt: () => h.aplicou,
  });
}
const anda = (m, h, n, dtMs = 1000) => { for (let i = 0; i < n; i++) { h.t += dtMs; m.ciclo(); } };

test('caminho feliz (patamar Auto): SUGERINDO -> ESCALONANDO -> CONFIRMANDO -> NO_PATAMAR', () => {
  const h = criaHost(), m = FBV.criaMae(h); m.arma(); anda(m, h, 1);
  assert.equal(m.estado, 'ESCALONANDO'); assert.equal(h.chamadas.aplica, 1);
  anda(m, h, 6); assert.equal(m.estado, 'CONFIRMANDO');
  h.conf = 50; anda(m, h, 1); assert.equal(m.estado, 'NO_PATAMAR');
});

test('seguranca: DSE sem resposta derruba as chaves, desarma e vai para FALHA', () => {
  const h = criaHost(), m = FBV.criaMae(h); m.arma(); anda(m, h, 2);
  h.dse = false; anda(m, h, 1);
  assert.equal(m.estado, 'FALHA'); assert.equal(m.armada, false); assert.equal(h.chamadas.derruba, 1);
  h.dse = true; anda(m, h, 3); assert.equal(m.estado, 'FALHA', 'DSE voltando nao pode re-armar sozinho');
});

test('seguranca: guarda bloqueando impede qualquer comando', () => {
  const h = criaHost({ guardaOk: false }), m = FBV.criaMae(h); m.arma(); anda(m, h, 3);
  assert.equal(m.estado, 'FALHA'); assert.equal(h.chamadas.aplica, 0, 'comandou chave com a guarda bloqueada');
});

test('patamar Manual: nada e comandado ate o operador aplicar', () => {
  const h = criaHost({ manual: true }), m = FBV.criaMae(h); m.arma(); anda(m, h, 5);
  assert.equal(m.estado, 'AGUARDA_APLICAR'); assert.equal(h.chamadas.aplica, 0);
  h.aplicou = true; anda(m, h, 1); assert.equal(m.estado, 'ESCALONANDO');
});

test('etapa de 0 %: abre todas as chaves', () => {
  const h = criaHost({ pcts: [0, 50] }), m = FBV.criaMae(h); m.arma(); anda(m, h, 1);
  assert.equal(m.estado, 'SEM_CARGA'); assert.equal(h.chamadas.derruba, 1); assert.equal(h.cmd, 0);
});

test('sem kW a 100 %: nao comanda e avisa', () => {
  const h = criaHost({ kw100d: 0 }), m = FBV.criaMae(h); m.arma(); anda(m, h, 2);
  assert.equal(m.estado, 'FALHA'); assert.equal(h.chamadas.aplica, 0);
});

test('retorno fisico que nao confirma em 20 s vira FALHA', () => {
  const h = criaHost(), m = FBV.criaMae(h); m.arma(); anda(m, h, 2); h.conf = 0; anda(m, h, 31);
  assert.equal(m.estado, 'FALHA');
});

test('fim do ensaio desarma a mae', () => {
  const h = criaHost(), m = FBV.criaMae(h); m.arma(); anda(m, h, 2); h.fim = true; anda(m, h, 1);
  assert.equal(m.estado, 'FIM'); assert.equal(m.armada, false);
});

// ---------------- achados F3, F4, F5 (corrigidos na v0.12) ----------------
test('F3: com chave de 0,5 kW, divergencia de 0,5 kW NAO confirma (tolerancia = metade da menor chave)', () => {
  const h = criaHost({ sel: 50, extraD: { nHabil: 10, pctLim: 107, menorChaveKw: 0.5 } }), m = FBV.criaMae(h); m.arma(); anda(m, h, 7);
  assert.equal(m.estado, 'CONFIRMANDO'); h.conf = 49.5; anda(m, h, 1);
  assert.equal(m.estado, 'CONFIRMANDO', 'chave de 0,5 kW sem confirmar passou como confirmada');
  h.conf = 49.9; anda(m, h, 1); assert.equal(m.estado, 'NO_PATAMAR', 'divergencia de 0,1 kW (ruido) deve confirmar');
});

test('F3: com chaves grandes a tolerancia continua 0,5 kW', () => {
  const h = criaHost({ sel: 50 }), m = FBV.criaMae(h); m.arma(); anda(m, h, 7); h.conf = 49.5; anda(m, h, 1);
  assert.equal(m.estado, 'NO_PATAMAR');
});

test('F4: rearma() tira a mae da FALHA de retorno fisico, so por ato do operador e com DSE ok', () => {
  const h = criaHost(), m = FBV.criaMae(h); m.arma(); anda(m, h, 2); h.conf = 0; anda(m, h, 31);
  assert.equal(m.estado, 'FALHA'); h.conf = 50; anda(m, h, 3);
  assert.equal(m.estado, 'FALHA', 'nao pode sair sozinha');
  h.dse = false; assert.equal(m.rearma(), false, 'sem DSE nao rearma'); h.dse = true;
  assert.equal(m.rearma(), true); anda(m, h, 8); h.conf = 50; anda(m, h, 1);
  assert.equal(m.estado, 'NO_PATAMAR');
});

test('F4: rearma() fora de FALHA nao faz nada', () => {
  const h = criaHost(), m = FBV.criaMae(h); m.arma(); anda(m, h, 2); assert.equal(m.rearma(), false);
});

test('F5: habilitar chaves depois de "nenhuma combinacao" recalcula a etapa', () => {
  const h = criaHost({ sel: 0, extraD: { nHabil: 0, pctLim: 107, menorChaveKw: 5 } }), m = FBV.criaMae(h); m.arma(); anda(m, h, 2);
  assert.equal(m.estado, 'FALHA'); h.sel = 50; h.extraD = { nHabil: 10, pctLim: 107, menorChaveKw: 5 }; anda(m, h, 3);
  assert.notEqual(m.estado, 'FALHA');
});

// ---------------- auditoria 03/11/2026 (v0.13): achados M1-M5 ----------------
// M1 (media-alta): FALHA de EXECUCAO (retorno fisico) saia sozinha quando um parametro mudava (kW a 100 %, limite, degrau, chaves habilitadas
// - alguns mudam sem o operador: kW do modelo, seletora/Ligar banco) ou quando a etapa avancava: a mae reaplicava as chaves sem rearme.
const falhaRetorno = (o) => { const h = criaHost(o), m = FBV.criaMae(h); m.arma(); anda(m, h, 2); h.conf = 0; anda(m, h, 31); assert.equal(m.estado, 'FALHA'); return { h, m }; };
test('M1 FALHA de retorno fisico: mudanca de parametro NAO reaplica sozinha (so rearma)', () => {
  const { h, m } = falhaRetorno(), ap = h.chamadas.aplica;
  h.extraD = Object.assign({}, h.extraD, { pctLim: 110 }); anda(m, h, 3);
  h.extraD = Object.assign({}, h.extraD, { nHabil: 9 }); anda(m, h, 3);
  h.kw100d = 120; anda(m, h, 3);
  assert.equal(m.estado, 'FALHA', 'saiu da FALHA sem rearme'); assert.equal(h.chamadas.aplica, ap, 'comandou chaves sem rearme');
  assert.equal(m.rearma(), true); anda(m, h, 1); assert.equal(m.estado, 'ESCALONANDO'); assert.equal(h.chamadas.aplica, ap + 1);
});
test('M1 FALHA de retorno fisico: etapa nova NAO reaplica sozinha', () => {
  const { h, m } = falhaRetorno(), ap = h.chamadas.aplica;
  h.et = 1; anda(m, h, 3);
  assert.equal(m.estado, 'FALHA'); assert.equal(h.chamadas.aplica, ap, 'etapa nova comandou chaves sem rearme');
});
test('M1 (regressao) FALHA de planejamento (guarda/sem combinacao) continua tentando de novo na etapa seguinte', () => {
  const h = criaHost({ guardaOk: false }), m = FBV.criaMae(h); m.arma(); anda(m, h, 2); assert.equal(m.estado, 'FALHA');
  h.guardaOk = true; h.et = 1; anda(m, h, 1); assert.equal(m.estado, 'ESCALONANDO');
});

// M2 (media): confirmacao so pela SOMA de kW: chave A (5 kW) nao fechou e chave B (5 kW, sem comando) fechou = soma igual = "confirmado".
test('M2 confirmacao por chave: troca de chaves de mesmo kW (host.divergentes) NAO confirma', () => {
  const h = criaHost({ div: 0 }); h.divergentes = () => h.div;
  const m = FBV.criaMae(h); m.arma(); anda(m, h, 7); assert.equal(m.estado, 'CONFIRMANDO');
  h.conf = 50; h.div = 2; anda(m, h, 1); assert.equal(m.estado, 'CONFIRMANDO', 'confirmou com 2 chaves divergentes');
  h.div = 0; anda(m, h, 1); assert.equal(m.estado, 'NO_PATAMAR');
});

// M3 (media-alta): a mae so conferia o limite no COMANDO; carga CONFIRMADA (retorno fisico) acima do limite (contatora colada, fio) passava batido.
test('M3 supervisao: carga confirmada acima do limite derruba as chaves e vai a FALHA (exige rearme)', () => {
  const h = criaHost(), m = FBV.criaMae(h); m.arma(); anda(m, h, 7); h.conf = 50; anda(m, h, 1); assert.equal(m.estado, 'NO_PATAMAR');
  const d = h.chamadas.derruba; h.conf = 120; anda(m, h, 1);
  assert.equal(m.estado, 'FALHA'); assert.equal(h.chamadas.derruba, d + 1, 'nao derrubou');
  h.conf = 0; const ap = h.chamadas.aplica; h.et = 1; anda(m, h, 3); assert.equal(m.estado, 'FALHA'); assert.equal(h.chamadas.aplica, ap);
});

// M4 (baixa): patamar Manual - ao Aplicar a mae nao conferia a guarda da selecao FINAL do operador.
test('M4 patamar Manual: Aplicar com a guarda bloqueando vai a FALHA (nao a ESCALONANDO)', () => {
  const h = criaHost({ manual: true }), m = FBV.criaMae(h); m.arma(); anda(m, h, 3); assert.equal(m.estado, 'AGUARDA_APLICAR');
  h.guardaOk = false; h.aplicou = true; anda(m, h, 1); assert.equal(m.estado, 'FALHA');
});

// M5 (baixa): io() usava a variavel global BANCOS do HTML; fora do medidor o ciclo quebrava (ReferenceError) a cada segundo.
test('M5 sem a global BANCOS (fora do medidor) o ciclo nao lanca excecao', () => {
  const ctx = vm.createContext({ console }); vm.runInContext(fs.readFileSync(MOD, 'utf8'), ctx);
  const h = criaHost(), m = ctx.FBV.criaMae(h); m.arma();
  assert.doesNotThrow(() => anda(m, h, 3)); assert.equal(m.estado, 'ESCALONANDO');
});
