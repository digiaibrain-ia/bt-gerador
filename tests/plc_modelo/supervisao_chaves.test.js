'use strict';
// Vetores de teste da regra "SB some -> CB cai" (Fase 4 / Portao A). Provam a LOGICA no modelo de referencia, nao o SCL no PLC.
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { Sistema } = require('./modelo_supervisao.js');

describe('Portao A - supervisao do retorno (T = 2 s)', () => {
  test('caminho feliz: liga, o retorno chega em 100 ms, nenhuma falha, CB continua em 1', () => {
    const s = new Sistema(); s.clique(3, true); s.passo(3000);
    assert.equal(s.saidaQ[3], true); assert.equal(s.aux[3], true);
    assert.equal(s.falhaNo1515[3], false); assert.equal(s.cbLigar[3], true);
  });

  test('retorno bloqueado: falha NAO aparece antes de 2,0 s e aparece ate 2,2 s; CB e saida caem', () => {
    const s = new Sistema(); s.auxBloqueado[5] = true; s.clique(5, true);
    s.passo(1900); assert.equal(s.falhaNo1515[5], false, 'nao pode falhar com 1,9 s');
    s.passo(300);  assert.equal(s.falhaNo1515[5], true, 'tem de falhar ate 2,2 s');
    s.passo(50);   assert.equal(s.cbLigar[5], false, 'o CB do 1515 cai'); assert.equal(s.saidaQ[5], false, 'a saida cai');
  });

  test('NAO religa sozinha quando o retorno volta (o caso da bancada de 06/11)', () => {
    const s = new Sistema(); s.auxBloqueado[5] = true; s.clique(5, true); s.passo(3000);
    assert.equal(s.falhaNo1515[5], true);
    s.auxBloqueado[5] = false; s.passo(5000);   // "retirei o contato NA"
    assert.equal(s.saidaQ[5], false); assert.equal(s.cbLigar[5], false); assert.equal(s.aux[5], false);
    assert.equal(s.falhaNo1515[5], true, 'a falha continua travada ate novo comando');
  });

  test('rearme so por novo comando (borda de subida) com retorno em 0; depois liga normal', () => {
    const s = new Sistema(); s.auxBloqueado[5] = true; s.clique(5, true); s.passo(3000);
    s.auxBloqueado[5] = false; s.passo(500);
    s.clique(5, true); s.passo(100);            // novo clique "ligar"
    assert.equal(s.falhaNo1515[5], false); s.passo(500);
    assert.equal(s.saidaQ[5], true); assert.equal(s.aux[5], true); assert.equal(s.cbLigar[5], true);
  });

  test('retorno some com a chave ligada (queda do contator): falha e CB cai em T', () => {
    const s = new Sistema(); s.clique(2, true); s.passo(1000); assert.equal(s.aux[2], true);
    s.auxBloqueado[2] = true; s.passo(2300);
    assert.equal(s.falhaNo1515[2], true); assert.equal(s.cbLigar[2], false); assert.equal(s.saidaQ[2], false);
  });

  test('oscilacao curta do retorno (1 s) NAO gera falha', () => {
    const s = new Sistema(); s.clique(2, true); s.passo(1000);
    s.auxBloqueado[2] = true; s.passo(1000); s.auxBloqueado[2] = false; s.passo(2000);
    assert.equal(s.falhaNo1515[2], false); assert.equal(s.saidaQ[2], true);
  });

  test('contator colado (retorno 1 sem comando) vira falha travada e bloqueia; clique nao limpa com retorno em 1', () => {
    const s = new Sistema(); s.auxColado[4] = true; s.passo(2300);
    assert.equal(s.colNo1515[4], true);
    s.clique(4, true); s.passo(1000);
    assert.equal(s.saidaQ[4], false, 'nao energiza com contator colado'); assert.equal(s.colNo1515[4], true);
    s.auxColado[4] = false; s.passo(300);       // manutencao: soltou
    assert.equal(s.colNo1515[4], true, 'continua travado ate novo comando');
    s.clique(4, false); s.passo(100); s.clique(4, true); s.passo(800);
    assert.equal(s.colNo1515[4], false); assert.equal(s.saidaQ[4], true);
  });

  test('tempo T e parametro: com T = 1 s a falha vem entre 1,0 e 1,2 s', () => {
    const s = new Sistema({ tempoRetornoMs: 1000 }); s.auxBloqueado[1] = true; s.clique(1, true);
    s.passo(900); assert.equal(s.falhaNo1515[1], false); s.passo(300); assert.equal(s.falhaNo1515[1], true);
  });

  test('uma chave com falha nao afeta as outras', () => {
    const s = new Sistema(); s.auxBloqueado[5] = true; s.clique(5, true); s.clique(6, true); s.passo(3000);
    assert.equal(s.falhaNo1515[5], true); assert.equal(s.falhaNo1515[6], false); assert.equal(s.saidaQ[6], true);
  });
});

describe('Portao A - habilitar/desabilitar (pedido/resposta) e eco', () => {
  test('desabilitar: a resposta confirma e a chave nao energiza (nem com CB em 1)', () => {
    const s = new Sistema(); s.habilitada[7] = false; s.clique(7, true); s.passo(500);
    assert.equal(s.habRespNo1515[7], false); assert.equal(s.saidaQ[7], false);
    s.habilitada[7] = true; s.passo(100);
    assert.equal(s.habRespNo1515[7], true); assert.equal(s.saidaQ[7], true);
  });

  test('habilitada so e CONFIRMADA com eco fresco: eco parado => HabResp nao confirma', () => {
    const s = new Sistema(); s.passo(200); assert.equal(s.habRespNo1515[7], true);
    s.ecoAtrasado = true; s.passo(100);
    assert.equal(s.ecoOk, false); assert.equal(s.habRespNo1515[7], false);
  });

  test('chave fora do banco (indice > NumChaves) nunca e liberada', () => {
    const s = new Sistema({ numChaves: 13 }); s.clique(15, true); s.passo(1000);
    assert.equal(s.saidaQ[15], false); assert.equal(s.habRespNo1515[15], false);
  });
});

describe('Portao A - perda de comunicacao', () => {
  test('sem comunicacao: nada liberado, HabResp zerado; falha travada permanece', () => {
    const s = new Sistema(); s.auxBloqueado[5] = true; s.clique(5, true); s.passo(3000);
    s.comOk = false; s.passo(1000);
    assert.equal(s.habRespNo1515[5], false); assert.equal(s.saidaQ[5], false); assert.equal(s.sup.falhaRetorno[5], true);
  });

  test('queda e volta da comunicacao NAO religa chave sozinha (CB zerado pelo banco desligado/interlock)', () => {
    const s = new Sistema(); s.clique(2, true); s.passo(1000); s.comOk = false; s.ligarBanco = false; s.passo(1000);
    s.comOk = true; s.passo(3000);
    assert.equal(s.saidaQ[2], false); assert.equal(s.cbLigar[2], false);
  });
});
