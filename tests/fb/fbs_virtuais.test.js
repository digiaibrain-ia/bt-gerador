// Testes da FB MAE virtual (maquina de estados) com um "host" simulado - rodar: node --test tests/fb/
// Cada teste monta um host falso (relogio, DSE, chaves) e anda a maquina ciclo a ciclo, como um OB ciclico.
// Itens marcados { todo } sao ACHADOS conhecidos (ver docs/bt2/analise/): o teste descreve o comportamento desejado e hoje falha.
const test = require('node:test'), assert = require('node:assert/strict');
globalThis.BroadcastChannel = undefined; // evita canal aberto segurando o processo
const { FBV } = (() => { require('../../dashboard/modulos-fonte/fbs_virtuais_v0.11.js'); return { FBV: globalThis.FBV }; })();

function criaHost(o = {}) {
  const h = { t: 0, ini: true, et: 0, pcts: [50, 100], kw100d: 100, dse: true, sel: 50, cmd: 0, conf: 0, manual: false, aplicou: false, salvar: false,
    chamadas: { aplica: 0, derruba: 0, sugere: 0 }, guardaOk: true, plano: 5, extra: { nHabil: 10, pctLim: 107, menorChaveKw: 5 }, fim: false };
  Object.assign(h, o);
  return Object.assign(h, {
    agora: () => h.t, iniciado: () => h.ini, fimEnsaio: () => h.fim, etapa: () => h.et, nEtapas: () => h.pcts.length, alvoPct: i => h.pcts[i],
    kw100: () => h.kw100d, modelo: () => ({ arquivo: 'teste' }), fonte: () => 'real', dseOk: () => h.dse,
    sugere: () => { h.chamadas.sugere++; return { total: h.sel }; },
    guarda: () => h.guardaOk ? { ok: true, total: h.sel, limiteKw: 107 } : { ok: false, total: h.sel, limiteKw: 107, mensagem: 'Bloqueado: acima do limite' },
    aplica: () => { h.chamadas.aplica++; h.cmd = h.sel; }, duracaoPlanoS: () => h.plano, aguardaSalvar: () => h.salvar,
    sugerePrevia: () => ({ total: 100 }), limpaPrevia() {}, derruba: () => { h.chamadas.derruba++; h.cmd = 0; h.conf = 0; },
    kwComandado: () => h.cmd, kwConfirmado: () => h.conf, marco() {}, tempoEtapaS: () => 0, extra: () => h.extra,
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

// ---------------- ACHADOS conhecidos (comportamento desejado, hoje falha) ----------------
test('ACHADO A1: divergencia de 0,5 kW (menor chave do BC59,5) deveria ser detectada', { todo: 'TOL_CONF_KW=0,5 e igual a menor chave' }, () => {
  const h = criaHost({ sel: 50 }), m = FBV.criaMae(h); m.arma(); anda(m, h, 7);
  assert.equal(m.estado, 'CONFIRMANDO'); h.conf = 49.5; anda(m, h, 1);
  assert.notEqual(m.estado, 'NO_PATAMAR', 'chave de 0,5 kW sem confirmar passou como confirmada');
});

test('ACHADO A2: apos FALHA por retorno fisico deveria existir saida (rearme) sem trocar de etapa', { todo: 'FALHA e terminal ate a etapa mudar' }, () => {
  const h = criaHost(), m = FBV.criaMae(h); m.arma(); anda(m, h, 2); h.conf = 0; anda(m, h, 31);
  assert.equal(m.estado, 'FALHA'); h.conf = 50; anda(m, h, 3);
  assert.notEqual(m.estado, 'FALHA', 'retorno voltou ao normal e a mae segue em FALHA');
});

test('ACHADO A3: habilitar chaves depois de "nenhuma combinacao" deveria recalcular a etapa', { todo: 'habilitacao nao entra na assinatura de parametros' }, () => {
  const h = criaHost({ sel: 0, extra: { nHabil: 0, pctLim: 107, menorChaveKw: 5 } }), m = FBV.criaMae(h); m.arma(); anda(m, h, 2);
  assert.equal(m.estado, 'FALHA'); h.sel = 50; h.extra = { nHabil: 10, pctLim: 107, menorChaveKw: 5 }; anda(m, h, 3);
  assert.notEqual(m.estado, 'FALHA', 'operador habilitou as chaves e a mae continua em FALHA');
});
