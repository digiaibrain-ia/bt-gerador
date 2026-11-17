'use strict';
// PLC SIMULADO EM MEMORIA. Guarda DBs como bytes reais (big-endian, como o S7) e le/escreve os enderecos
// no mesmo formato que os fluxos usam: DBn,X<byte>.<bit> | DBn,BYTE<ofs>.<n> | DBn,INT<ofs> | DBn,REAL<ofs>[.<n>] | DBn,S<ofs>.<max>
// Nao e o driver S7 real: e a memoria do PLC para o teste. Falhas injetaveis: falhas.leitura / falhas.escrita.
// PORTAO 1 DA FASE 3 (instrumentacao, so para teste): latencia/jitter de leitura e escrita, atrasos explicitos por escrita,
// queda do PLC apos N escritas, escrita serial (como a fila de um driver) ou concorrente, semente fixa (reproduzivel)
// e TRACE das escritas feitas pelos FLUXOS (ordem, inicio, aplicacao, concorrencia). Veja LEIA-ME.md e verificador.js.

const TAM_DB = 4096;
const dorme = ms => new Promise(r => setTimeout(r, ms));
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function parseAddr(addr) {
  const m = /^DB(\d+),(X|BYTE|INT|REAL|S)(\d+)(?:\.(\d+))?$/.exec(String(addr).trim());
  if (!m) throw new Error('endereco S7 nao reconhecido: ' + addr);
  const db = +m[1], tipo = m[2], ofs = +m[3], n = m[4] == null ? null : +m[4];
  if (tipo === 'X') return { db, tipo, byte: ofs, bit: n || 0 };
  return { db, tipo, ofs, n };   // n: quantidade (BYTE/REAL/S) ou max (S); null = escalar
}

class PlcSimulado {
  constructor() { this.reset(); }
  reset() {
    this.dbs = new Map();
    this.falhas = { leitura: false, escrita: false, escritaApos: null };   // escritaApos=n: depois de n escritas dos fluxos o PLC "cai" (todas as seguintes falham)
    this.escritas = [];   // historico de escritas (para os testes conferirem a ordem)
    // --- instrumentacao (Portao 1, Fase 3) ---
    this.latencia = { escritaMs: 0, escritaJitterMs: 0, leituraMs: 0, leituraJitterMs: 0, serial: true };   // serial=true: escritas uma apos a outra (como a fila do driver); false: concorrentes (pode reordenar)
    this.atrasosEscrita = [];   // fila de atrasos EXPLICITOS (ms ou funcao (addr,valor)=>ms), consumidos na ordem, um por escrita dos fluxos
    this.trace = [];            // escritas dos FLUXOS: {n, addr, valor, tChegada, tInicio, tAplicada, ok}
    this.nEscrita = 0; this.aplicadas = 0; this.emVoo = 0; this.maxEmVoo = 0;
    this._rand = mulberry32(1); this._cadeia = Promise.resolve();
  }
  semente(n) { this._rand = mulberry32(n); }
  parar() { this.parado = true; }   // fim do teste: escritas ainda na fila do simulador abortam na hora (senao um atraso grande segura o processo)
  _jitter(base, jit) { return Math.max(0, Math.round(base + (jit ? (this._rand() * 2 - 1) * jit : 0))); }
  atrasoLeitura() { return this._jitter(this.latencia.leituraMs, this.latencia.leituraJitterMs); }
  _atrasoEscrita(addr, valor) {
    if (this.atrasosEscrita.length) { const a = this.atrasosEscrita.shift(); return Math.max(0, Math.round(typeof a === 'function' ? a(addr, valor) : a)); }
    return this._jitter(this.latencia.escritaMs, this.latencia.escritaJitterMs);
  }
  // Escrita DOS FLUXOS (usada pelo no 's7 out' de teste): aplica atraso/queda e registra no trace. Devolve promessa que rejeita se o PLC "caiu".
  escreverDoFluxo(addr, valor) {
    const n = ++this.nEscrita, tChegada = Date.now(), ms = this._atrasoEscrita(addr, valor);   // o atraso e sorteado na CHEGADA (ordem de chegada = ordem do sorteio)
    const exec = async () => {
      const tInicio = Date.now(); this.emVoo++; this.maxEmVoo = Math.max(this.maxEmVoo, this.emVoo);
      const reg = { n, addr, valor: JSON.parse(JSON.stringify(valor)), tChegada, tInicio, tAplicada: null, ok: false };
      this.trace.push(reg);
      try {
        if (this.parado) throw new Error('PLC simulado parado');
        if (ms > 0) await dorme(ms);
        if (this.parado) throw new Error('PLC simulado parado');
        if (this.falhas.escrita || (this.falhas.escritaApos != null && this.aplicadas >= this.falhas.escritaApos)) throw new Error('escrita recusada pelo PLC (simulado)');
        this.escrever(addr, valor); reg.ok = true; reg.ordem = ++this.aplicadas;   // ordem de APLICACAO (1,2,3...)
      } finally { reg.tAplicada = Date.now(); this.emVoo--; }
    };
    if (!this.latencia.serial) return exec();
    const p = this._cadeia.then(exec, exec); this._cadeia = p.catch(() => {}); return p;
  }
  db(n) { if (!this.dbs.has(n)) this.dbs.set(n, Buffer.alloc(TAM_DB)); return this.dbs.get(n); }

  ler(addr) {
    const a = parseAddr(addr), b = this.db(a.db);
    switch (a.tipo) {
      case 'X': return ((b[a.byte] >> a.bit) & 1) === 1;
      case 'BYTE': return a.n == null ? b[a.ofs] : Array.from(b.subarray(a.ofs, a.ofs + a.n));
      case 'INT': return b.readInt16BE(a.ofs);
      case 'REAL': {
        if (a.n == null) return b.readFloatBE(a.ofs);
        const v = []; for (let i = 0; i < a.n; i++) v.push(b.readFloatBE(a.ofs + 4 * i)); return v;
      }
      case 'S': { const len = b[a.ofs + 1]; return b.toString('latin1', a.ofs + 2, a.ofs + 2 + len); }
    }
    throw new Error('tipo nao tratado: ' + a.tipo);
  }

  escrever(addr, valor) {
    const a = parseAddr(addr), b = this.db(a.db);
    this.escritas.push({ addr, valor: JSON.parse(JSON.stringify(valor)) });
    const flat = v => Array.isArray(v) ? v.flat(Infinity) : [v];
    switch (a.tipo) {
      case 'X': { const bit = a.bit; b[a.byte] = valor ? (b[a.byte] | (1 << bit)) : (b[a.byte] & ~(1 << bit)); return; }
      case 'BYTE': { const v = flat(valor); const cap = a.n == null ? 1 : a.n; for (let i = 0; i < Math.min(v.length, cap); i++) b[a.ofs + i] = (+v[i]) & 0xff; return; }
      case 'INT': b.writeInt16BE(Math.round(+valor), a.ofs); return;
      case 'REAL': { const v = flat(valor); const cap = a.n == null ? 1 : a.n; for (let i = 0; i < Math.min(v.length, cap); i++) b.writeFloatBE(+v[i] || 0, a.ofs + 4 * i); return; }
      case 'S': { const s = String(valor).slice(0, a.n); b[a.ofs] = a.n; b[a.ofs + 1] = s.length; b.write(s, a.ofs + 2, 'latin1'); return; }
    }
    throw new Error('tipo nao tratado: ' + a.tipo);
  }
}

module.exports = { PlcSimulado, parseAddr };
