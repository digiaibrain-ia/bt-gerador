'use strict';
// PLC SIMULADO EM MEMORIA. Guarda DBs como bytes reais (big-endian, como o S7) e le/escreve os enderecos
// no mesmo formato que os fluxos usam: DBn,X<byte>.<bit> | DBn,BYTE<ofs>.<n> | DBn,INT<ofs> | DBn,REAL<ofs>[.<n>] | DBn,S<ofs>.<max>
// Nao e o driver S7 real: e a memoria do PLC para o teste. Falhas injetaveis: falhas.leitura / falhas.escrita.

const TAM_DB = 4096;

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
    this.falhas = { leitura: false, escrita: false };
    this.escritas = [];   // historico de escritas (para os testes conferirem a ordem)
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
