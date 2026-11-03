// Gera vetores de teste (entrada -> saida) do FB de sugestao para o futuro SCL. Uso: node tests/fb/gera_vetores.js
// O SCL deve reproduzir `total`, `erro` e a seleção (em empate de custo qualquer seleção de mesmo custo é aceita: comparar total e custo).
const R = require('../../dashboard/modulos-fonte/rodizio_chaves_v0.5.js'), fs = require('fs');
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const mk = (id, kws, o = {}) => Object.assign({ id, kws, habil: kws.map(() => true), estado: { acion: kws.map(() => 0), horas: kws.map(() => 0) }, atual: kws.map(() => false) }, o);
const REAIS = () => [mk('56', [5,5,5,5,5,4,4,4,4,4,4,4,3]), mk('400', [5,5,10,10,10,10,50,50,50,50,50,50,50]), mk('59,5', [5,5,5,5,5,4,4,4,4,4,4,3,3,2,1,.5,.5,.5]), mk('550', [5,5,5,5,5,25,50,50,100,100,100,100])];
const r = rng(20261103), casos = [];
const add = (nome, ent) => { const s = R.sugere(ent); casos.push({ nome, entrada: ent, saida: { total: s.total, erro: s.erro, dentro: s.dentro, aviso: s.aviso, selecao: s.selecao } }); };
for (const a of [0, 0.5, 5, 30, 50, 100, 213.4, 300, 600, 1000, 1100]) add('4 bancos reais, alvo ' + a, { bancos: REAIS(), alvoKw: a, kw100: 1000, pctLimite: 107 });
add('limite abaixo do alvo', { bancos: REAIS(), alvoKw: 900, kw100: 500, pctLimite: 107 });
add('sem limite configurado (a guarda bloqueia, a sugestao so respeita o alvo)', { bancos: REAIS(), alvoKw: 100 });
for (let i = 0; i < 20; i++) {
  const bancos = REAIS(); bancos.forEach(b => { b.habil = b.kws.map(() => r() > 0.2); b.estado = { acion: b.kws.map(() => Math.floor(r() * 30)), horas: b.kws.map(() => Math.floor(r() * 80)) }; b.atual = b.kws.map(() => r() > 0.6); });
  add('desgaste/habilitacao/estado atual #' + i, { bancos, alvoKw: Math.round(r() * 1100 * 2) / 2, kw100: 1000, pctLimite: 107 });
}
add('modo minimo 107 %', { bancos: REAIS(), alvoKw: 107, modoAlvo: 'minimo', excessoMaxKw: 2, kw100: 100, pctLimite: 112 });
add('alvo invalido (NaN vira null no JSON)', { bancos: REAIS(), alvoKw: -1 });
fs.writeFileSync(__dirname + '/vetores/sugere_vetores_v0.1.json', JSON.stringify({ versao: 'v0.1', modulo: 'rodizio_chaves_v0.5', gerado: '2026-11-03', casos }, null, 1));
console.log('vetores:', casos.length);
