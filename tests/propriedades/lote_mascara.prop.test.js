'use strict';
/* =====================================================================================================================
   lote_mascara.prop.test.js — PROPRIEDADES do modelo do bloco de PLC "lote por mascara" · Passo 10 (item 3) · 21/11/2026.
   PARA QUE SERVE (leigo): confere, com milhares de estados e lotes inventados, que comandar varias chaves por MASCARA (duas palavras + um contador, aplicadas pelo PLC) da o MESMO resultado que o
   comando de hoje, bit a bit, e que as regras de seguranca valem: so liga chave habilitada com o banco ligado; desligar vale sempre e vem primeiro; repetir o mesmo lote nao faz nada; bit fora das mascaras nao muda.
   Este e o teste de CONFORMIDADE que o bloco SCL tem que cumprir quando for compilado e testado na bancada.
   ===================================================================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fc = require('fast-check');
const path = require('path');
const M = require(path.join(__dirname, '..', 'plc_modelo', 'modelo_lote_mascara.js'));
const cfgFc = { numRuns: +process.env.FC_RUNS || 500, seed: +process.env.FC_SEED || 20261121 };
const NS = [16, 32];

const gEstado = (n) => fc.record({ cb: fc.array(fc.boolean(), { minLength: n, maxLength: n }), hab: fc.array(fc.boolean(), { minLength: n, maxLength: n }), ligarBanco: fc.boolean(), seqAck: fc.integer({ min: 0, max: 65535 }) });
const gLote = (n) => fc.tuple(fc.uniqueArray(fc.integer({ min: 1, max: n }), { maxLength: n }), fc.uniqueArray(fc.integer({ min: 1, max: n }), { maxLength: n })).map(([l, d]) => { const dd = d.filter(x => !l.includes(x)); return { ligar: l, desligar: dd }; });

for (const n of NS) {
  test('EQUIVALENCIA (' + n + ' chaves): aplicar o lote por mascara = o lote de hoje, bit a bit (desligar primeiro, ligar so habilitada com banco ligado)', () => {
    fc.assert(fc.property(gEstado(n), gLote(n), fc.integer({ min: 1, max: 65535 }), (est, lote, d) => {
      const seq = (est.seqAck + d) % 65536; if (seq === est.seqAck) return;
      const viaMascara = M.aplicaLote(est, { setMask: M.mascaraDe(lote.ligar), clrMask: M.mascaraDe(lote.desligar), seq }, n);
      const viaBits = M.loteBitABit(est, lote.ligar, lote.desligar);
      assert.deepEqual(viaMascara.cb, viaBits.cb, 'os bits das chaves tem que ser iguais');
      assert.equal(viaMascara.seqAck, seq, 'o PLC reconhece o lote');
      assert.deepEqual(viaMascara.hab, est.hab); assert.equal(viaMascara.ligarBanco, est.ligarBanco);
    }), cfgFc);
  });

  test('SEGURANCA (' + n + ' chaves): nunca liga chave desabilitada nem com o banco desligado; desligar sempre vale; bit fora das mascaras nao muda; entrada nao e alterada', () => {
    fc.assert(fc.property(gEstado(n), gLote(n), fc.integer({ min: 1, max: 65535 }), (est, lote, d) => {
      const seq = (est.seqAck + d) % 65536, antes = JSON.stringify(est);
      const r = M.aplicaLote(est, { setMask: M.mascaraDe(lote.ligar), clrMask: M.mascaraDe(lote.desligar), seq }, n);
      assert.equal(JSON.stringify(est), antes, 'nao altera o estado de entrada');
      for (let i = 1; i <= n; i++) {
        const antesI = est.cb[i - 1], depoisI = r.cb[i - 1];
        if (lote.desligar.includes(i)) assert.equal(depoisI, false, 'chave ' + i + ' pedida para desligar tem que ficar desligada');
        else if (lote.ligar.includes(i)) assert.equal(depoisI, antesI || (est.hab[i - 1] && est.ligarBanco), 'chave ' + i + ': so liga se habilitada e com o banco ligado');
        else assert.equal(depoisI, antesI, 'chave ' + i + ' fora das mascaras nao pode mudar');
        if (depoisI && !antesI) assert.ok(est.hab[i - 1] && est.ligarBanco, 'ligou ' + i + ' sem poder');
      }
    }), cfgFc);
  });

  test('IDEMPOTENCIA (' + n + ' chaves): o mesmo lote (mesmo contador) aplicado de novo nao muda nada; um lote novo com o contador igual ao reconhecido tambem nao', () => {
    fc.assert(fc.property(gEstado(n), gLote(n), fc.integer({ min: 1, max: 65535 }), (est, lote, d) => {
      const seq = (est.seqAck + d) % 65536, l = { setMask: M.mascaraDe(lote.ligar), clrMask: M.mascaraDe(lote.desligar), seq };
      const a = M.aplicaLote(est, l, n), b = M.aplicaLote(a, l, n); assert.deepEqual(b, a);
      const c = M.aplicaLote(est, { ...l, seq: est.seqAck }, n); assert.deepEqual(c, est, 'contador igual ao reconhecido = nada a fazer');
    }), cfgFc);
  });
}

test('mascaras: indices <-> mascara fazem ida e volta; o contador de 16 bits volta a 0 e o lote desse contador ainda e aplicado uma vez', () => {
  fc.assert(fc.property(fc.uniqueArray(fc.integer({ min: 1, max: 32 }), { maxLength: 32 }), (idx) => { assert.deepEqual(M.indicesDe(M.mascaraDe(idx), 32), idx.slice().sort((a, b) => a - b)); }), cfgFc);
  assert.equal(M.mascaraDe([1]), 1); assert.equal(M.mascaraDe([16]), 0x8000); assert.equal(M.mascaraDe([32]), 0x80000000); assert.equal(M.mascaraDe([1, 3]), 5); assert.equal(M.mascaraDe([]), 0);
  assert.equal(M.proximaSeq(65535), 0); assert.equal(M.proximaSeq(0), 1);
  const est = { cb: Array(16).fill(false), hab: Array(16).fill(true), ligarBanco: true, seqAck: 65535 };
  const r = M.aplicaLote(est, { setMask: M.mascaraDe([1, 2]), clrMask: 0, seq: M.proximaSeq(65535) }, 16); assert.deepEqual(r.cb.slice(0, 3), [true, true, false]); assert.equal(r.seqAck, 0);
});

test('exemplos: desligar vem ANTES de ligar; ligar e desligar da mesma chave (erro do chamador) termina ligado, como no SCL; banco desligado nao liga nada', () => {
  const base = { cb: [true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false], hab: Array(16).fill(true), ligarBanco: true, seqAck: 7 };
  const r = M.aplicaLote(base, { setMask: M.mascaraDe([3, 4]), clrMask: M.mascaraDe([1]), seq: 8 }, 16); assert.deepEqual(r.cb.slice(0, 5), [false, true, true, true, false]);
  const conflito = M.aplicaLote(base, { setMask: M.mascaraDe([1]), clrMask: M.mascaraDe([1]), seq: 8 }, 16); assert.equal(conflito.cb[0], true);
  const off = M.aplicaLote({ ...base, ligarBanco: false }, { setMask: M.mascaraDe([3]), clrMask: M.mascaraDe([2]), seq: 8 }, 16); assert.deepEqual(off.cb.slice(0, 3), [true, false, false]);
  const semHab = M.aplicaLote({ ...base, hab: base.hab.map((_, i) => i !== 2) }, { setMask: M.mascaraDe([3]), clrMask: 0, seq: 8 }, 16); assert.equal(semHab.cb[2], false);
});
