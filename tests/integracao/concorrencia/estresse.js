'use strict';
// AUXILIAR DE ESTRESSE (Fase 3, Etapa 5): gera carga parecida com a do medidor real contra um banco de chaves e mede latencias e invariantes.
// O front manda no maximo 3 POST de chave ao mesmo tempo (chPostVaga) com timeout de 10 s e le (GET) a cada ~1 s: a carga imita isso.
const { BANCOS, enderecos, get, post } = require('../ajudas.js');

const dorme = ms => new Promise(r => setTimeout(r, ms));
function prng(sem) { let a = sem | 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const DURACAO_S = Number(process.env.BT2_ESTRESSE_S) || 12;        // duracao de cada rodada (aumente na bancada: BT2_ESTRESSE_S=600)
const TIMEOUT_FRONT_MS = 10000;                                     // timeout dos POST de chave no medidor 1.10.167

function percentis(v) { if (!v.length) return { n: 0 }; const s = [...v].sort((a, b) => a - b), p = q => s[Math.min(s.length - 1, Math.floor(q * s.length))]; return { n: s.length, min: s[0], p50: p(0.5), p95: p(0.95), max: s[s.length - 1] }; }

// sorteia um comando valido em formato (nao em estado): o fluxo decide se aceita (200) ou recusa (409/400)
function sorteia(rnd, id) {
  const n = BANCOS[id].n, i = 1 + Math.floor(rnd() * n), r = rnd();
  if (r < 0.28) return ['habilitar', { indice: i, habilitada: rnd() < 0.7 }];
  if (r < 0.48) return ['ligar', { indice: i, ligar: rnd() < 0.55 }];
  if (r < 0.66) return ['banco', { ligar: rnd() < 0.55 }];
  if (r < 0.84) return ['selecionar', { indice: rnd() < 0.3 ? 0 : i }];
  return ['usarKwReal', { usar: rnd() < 0.5 }];
}

// roda a carga: 'simultaneos' trabalhadores (como o front: 3) mandam POST em sequencia aleatoria por 'duracaoS' segundos; 1 leitor faz GET a cada 1 s.
// 'perturba(t)' (opcional) e chamada a cada 250 ms com o tempo decorrido (ms) para injetar falhas durante a carga.
async function carga({ h, id, duracaoS = DURACAO_S, simultaneos = 3, semente = 1, perturba, amostra }) {
  const rnd = prng(semente), e = enderecos(id), fim = Date.now() + duracaoS * 1000, t0 = Date.now();
  const lat = [], porStatus = {}, porCodigo = {}, erros = [], gets = []; let enviados = 0, respondidos = 0, estouroFront = 0;
  let violAtual = null; const violacoes = [];           // A3: CbLigar TRUE com o banco desligado
  const viola = () => { if (h.plc.ler(e.cbBanco) === true) return false; const N = BANCOS[id].N; for (let i = 1; i <= N; i++) if (h.plc.ler(e.cb(i)) === true) return true; return false; };
  const amostrador = setInterval(() => { const v = viola(), agora = Date.now();
    if (v && !violAtual) violAtual = agora; if (!v && violAtual) { violacoes.push(agora - violAtual); violAtual = null; } if (amostra) amostra(h, e); }, 40);
  const pert = perturba ? setInterval(() => perturba(Date.now() - t0), 250) : null;
  const trab = async () => {
    while (Date.now() < fim) {
      const [rota, corpo] = sorteia(rnd, id), ini = Date.now(); enviados++;
      let r; try { r = await post(h, '/api/chaves/' + id + '/' + rota, corpo); } catch (x) { erros.push(String(x)); continue; }
      const ms = Date.now() - ini; respondidos++; lat.push(ms); if (ms >= TIMEOUT_FRONT_MS) estouroFront++;
      porStatus[r.status] = (porStatus[r.status] || 0) + 1; const c = r.j && r.j.codigo; if (c) porCodigo[c] = (porCodigo[c] || 0) + 1;
      await dorme(Math.floor(rnd() * 120));
    }
  };
  const leitor = async () => { while (Date.now() < fim) { const ini = Date.now(); try { await get(h, '/api/chaves/' + id); gets.push(Date.now() - ini); } catch (x) { erros.push('GET ' + x); } await dorme(1000); } };
  await Promise.all([...Array.from({ length: simultaneos }, trab), leitor()]);
  clearInterval(amostrador); if (pert) clearInterval(pert);
  if (violAtual) violacoes.push(Date.now() - violAtual);
  return { enviados, respondidos, perdidos: enviados - respondidos, erros, lat: percentis(lat), gets: percentis(gets), porStatus, porCodigo, estouroFront, violacoes, violMax: Math.max(0, ...violacoes) };
}

// depois da carga: espera as escritas tardias/quarentenas acabarem, manda o comando de seguranca e confere o estado final
async function encerra({ h, id, esperaMs = 6000 }) {
  const e = enderecos(id); await dorme(esperaMs);
  const ini = Date.now(); const r = await post(h, '/api/chaves/' + id + '/banco', { ligar: false }); const ms = Date.now() - ini;
  await dorme(1500);
  const N = BANCOS[id].N; let ligadas = 0; for (let i = 1; i <= N; i++) if (h.plc.ler(e.cb(i)) === true) ligadas++;
  return { status: r.status, ms, bancoLigado: h.plc.ler(e.cbBanco), cbLigadas: ligadas };
}
module.exports = { carga, encerra, percentis, DURACAO_S, TIMEOUT_FRONT_MS, dorme };
