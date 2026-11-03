'use strict';
// Auxiliares dos testes de integracao: enderecos S7 reais dos bancos (ficha bancos_bt2_v0.3.json), espera e chamadas HTTP.
const fs = require('fs');
const path = require('path');
const { sobe } = require('./harness.js');

const ENV_TESTE = { BT2_AMBIENTE_TESTE: 'local' };
const FICHA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'plc', 'bt2', 'gerador', 'bancos_bt2_v0.3.json'), 'utf8'));
// id do banco na URL -> ficha e fluxo de producao
const BANCOS = {
  '56':  { chave: 'BC56',  flow: 'chaves-56-api-v3.2',   db: 3000, dbTens: 3002, n: 13, N: 16 },
  '400': { chave: 'BC400', flow: 'chaves-400-api-v3.2',  db: 3100, dbTens: 3102, n: 13, N: 16 },
  '550': { chave: 'BC550', flow: 'chaves-550-api-v1.3',  db: 3300, dbTens: 3302, n: 12, N: 16 },
  '595': { chave: 'BC595', flow: 'chaves-595-api-v1.3',  db: 3200, dbTens: 3202, n: 18, N: 32 },
};

// mapa de bits/bytes do DB do banco (layout do gerador: 16 ou 32 chaves)
function enderecos(id) {
  const b = BANCOS[id], nb = b.N / 8;
  const bit = (base, i) => 'DB' + b.db + ',X' + (base + Math.floor((i - 1) / 8)) + '.' + ((i - 1) % 8);
  return {
    cb: i => bit(0, i),                 // CbLigar i
    sb: i => bit(nb, i),                // Ligada i
    hab: i => bit(2 * nb, i),           // Habilitada i
    setupOk: i => bit(3 * nb, i),       // SetupOk i
    cbBanco: 'DB' + b.db + ',X' + (b.N === 16 ? 460 : 916) + '.0',   // LigarBanco (comando Ligar banco)
    seletora: 'DB' + b.db + ',X' + (b.N === 16 ? 462 : 918) + '.0',  // SeletoraAuto
    comOk: 'DB' + b.db + ',X' + (b.N === 16 ? 462 : 918) + '.1',     // ComEt200Ok
    chaveSel: 'DB' + b.db + ',INT' + (b.N === 16 ? 456 : 912),
    tensaoSel: 'DB' + b.dbTens + ',INT' + (b.N === 16 ? 1356 : 2706),
  };
}

const espera = ms => new Promise(r => setTimeout(r, ms));
async function esperaAte(fn, ms = 5000, passo = 80) {
  const t = Date.now();
  while (Date.now() - t < ms) { try { if (await fn()) return true; } catch (e) { /* tenta de novo */ } await espera(passo); }
  return false;
}

// Por padrao a chamada imita a TELA (browser na mesma origem): manda Origin = endereco do servidor e Content-Type JSON.
// 'cabecalhos' sobrescreve/remove (valor undefined remove) - usado pelos testes do Portao 3 para simular origem externa, sem Origin etc.
async function chamada(h, metodo, rota, corpo, cabecalhos) {
  const opt = { method: metodo, headers: {} };
  if (metodo !== 'GET') opt.headers['Origin'] = h.url;
  if (corpo !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = typeof corpo === 'string' ? corpo : JSON.stringify(corpo); }
  for (const [k, v] of Object.entries(cabecalhos || {})) { if (v === undefined) { for (const c of Object.keys(opt.headers)) if (c.toLowerCase() === k.toLowerCase()) delete opt.headers[c]; } else opt.headers[k] = v; }
  const r = await fetch(h.url + rota, opt);
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) { /* nao e JSON */ }
  return { status: r.status, j, t };
}
const get = (h, rota) => chamada(h, 'GET', rota);
const post = (h, rota, corpo, cabecalhos) => chamada(h, 'POST', rota, corpo, cabecalhos);

module.exports = { ENV_TESTE, FICHA, BANCOS, enderecos, espera, esperaAte, get, post, sobe };
