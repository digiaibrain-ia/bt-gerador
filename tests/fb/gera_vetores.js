// Gera vetores de teste (entrada -> saida) do FB de sugestao para o futuro SCL. Uso: node tests/fb/gera_vetores.js
// v0.2 (03/11/2026, auditoria): usa rodizio_chaves_v0.6 e grava sugere_vetores_v0.2.json (NAO sobrescreve a v0.1). Casos novos: kW real fora da grade
// (gradeKw 0,1 e 0,5), chave com kW invalido, banco de 32 chaves. Os 35 casos da v0.1 continuam iguais (a v0.6 reproduz a v0.1).
// O SCL deve reproduzir `total`, `erro` e a seleção (em empate de custo qualquer seleção de mesmo custo é aceita: comparar total e custo).
const R = require('../../dashboard/modulos-fonte/rodizio_chaves_v0.6.js'), fs = require('fs');
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
// ---- v0.2: casos novos ----
const r2 = rng(20261104), real = k => Math.round(k * (0.95 + 0.1 * r2()) * 1000) / 1000;
for (let i = 0; i < 6; i++) {
  const bancos = REAIS(); bancos.forEach(b => { b.kws = b.kws.map(real); b.estado = { acion: b.kws.map(() => Math.floor(r2() * 30)), horas: b.kws.map(() => Math.floor(r2() * 80)) }; b.atual = b.kws.map(() => r2() > 0.6); });
  const alvo = Math.round(r2() * 1000 * 2) / 2;
  add('kW real fora da grade #' + i + ' (gradeKw 0,1)', { bancos, alvoKw: alvo, kw100: 1000, pctLimite: 107 });
  add('kW real fora da grade #' + i + ' (gradeKw 0,5, grade sugerida para o PLC)', { bancos, alvoKw: alvo, kw100: 1000, pctLimite: 107, gradeKw: 0.5 });
}
{ const bancos = REAIS(); bancos[2].kws[15] = 0; bancos[2].kws[16] = -0.4; bancos[0].kws[3] = null; bancos[2].atual[16] = true;
  add('chaves com kW invalido (0, negativo, vazio) ficam fora e sao desligadas', { bancos, alvoKw: 100, kw100: 1000, pctLimite: 107 }); }
add('banco de 32 chaves na grade', { bancos: [mk('G', Array.from({ length: 32 }, (_, i) => [0.5, 1, 2, 5, 10][i % 5]))], alvoKw: 77.5, kw100: 1000, pctLimite: 107 });
const ARQ = __dirname + '/vetores/sugere_vetores_v0.2.json';
if (fs.existsSync(ARQ)) { console.error('ja existe: ' + ARQ + ' (regra do projeto: nao sobrescrever; crie a proxima versao)'); process.exit(1); }
fs.writeFileSync(ARQ, JSON.stringify({ versao: 'v0.2', modulo: 'rodizio_chaves_v0.6', gerado: '2026-11-03', nota: 'gradeKw: kW fora da grade e arredondado PARA CIMA nessa grade; comparar total, erro e selecao (em empate de custo, qualquer selecao de mesmo custo)', casos }, null, 1));
console.log('vetores:', casos.length);
