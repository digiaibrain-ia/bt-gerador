// Testes do FB em JavaScript (RodizioChaves) - rodar: node --test tests/fb/
// Estrategia: (1) oraculo por forca bruta em bancos pequenos, (2) testes diferenciais entre os FBs de 2/3/4/N bancos,
// (3) invariantes de seguranca (guarda, limite, habilitacao), (4) casos de borda, (5) orcamento de tempo com os 4 bancos reais.
// Modulo testado: v0.6 por padrao. Para provar que um teste novo NAO e vacuo, rode contra a versao antiga:
//   RODIZIO_MODULO=dashboard/modulos-fonte/rodizio_chaves_v0.5.js node --test tests/fb/rodizio_chaves.test.js
const test = require('node:test'), assert = require('node:assert/strict'), path = require('path');
const MOD = process.env.RODIZIO_MODULO ? path.resolve(process.env.RODIZIO_MODULO) : path.join(__dirname, '../../dashboard/modulos-fonte/rodizio_chaves_v0.6.js');
const R = require(MOD);
const R05 = require('../../dashboard/modulos-fonte/rodizio_chaves_v0.5.js');   // referencia congelada para o teste diferencial

// gerador pseudoaleatorio deterministico (mulberry32): mesmos casos em toda execucao
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const banco = (id, kws, habil) => ({ id, kws, habil: habil || kws.map(() => true), estado: { acion: kws.map(() => 0), horas: kws.map(() => 0) }, atual: kws.map(() => false) });
const REAIS = () => [banco('56', [5,5,5,5,5,4,4,4,4,4,4,4,3]), banco('400', [5,5,10,10,10,10,50,50,50,50,50,50,50]),
  banco('59,5', [5,5,5,5,5,4,4,4,4,4,4,3,3,2,1,.5,.5,.5]), banco('550', [5,5,5,5,5,25,50,50,100,100,100,100])];
const totalSel = (bancos, sel) => bancos.reduce((t, b) => t + b.kws.reduce((u, k, i) => u + (sel[b.id][i] ? k : 0), 0), 0);
// oraculo: menor erro possivel (modo abaixo, respeitando habilitacao e limite) por forca bruta
function melhorErroBruto(bancos, alvo, lim) {
  let somas = new Set([0]);
  for (const b of bancos) { const hab = b.kws.filter((_, i) => b.habil[i]); const nov = new Set();
    for (const s of somas) { for (let m = 0; m < 1 << hab.length; m++) { let k = 0; hab.forEach((v, j) => { if (m >> j & 1) k += v; }); nov.add(Math.round((s + k) * 1000) / 1000); } } somas = nov; }
  let melhor = Infinity; for (const s of somas) if (s <= alvo + 1e-9 && (lim == null || s <= lim + 1e-9)) melhor = Math.min(melhor, alvo - s); return melhor;
}

test('oraculo: sugere acha o menor erro possivel (bancos pequenos, 1 a 3 bancos, 200 casos)', () => {
  const r = rng(42);
  for (let c = 0; c < 200; c++) {
    const nb = 1 + Math.floor(r() * 3);
    const bancos = Array.from({ length: nb }, (_, i) => { const n = 2 + Math.floor(r() * 6); const kws = Array.from({ length: n }, () => [0.5,1,2,5,10,25][Math.floor(r() * 6)]); return banco('B' + i, kws, kws.map(() => r() > 0.2)); });
    const max = bancos.reduce((t, b) => t + b.kws.reduce((u, k, i) => u + (b.habil[i] ? k : 0), 0), 0);
    const alvo = Math.round(r() * max * 1.2 * 2) / 2;
    const s = R.sugere({ bancos, alvoKw: alvo });
    const tot = totalSel(bancos, s.selecao);
    assert.ok(tot <= alvo + 1e-9, `caso ${c}: passou do alvo (${tot} > ${alvo})`);
    assert.ok(Math.abs(tot - s.total) < 1e-9, `caso ${c}: total informado difere da soma`);
    bancos.forEach(b => b.kws.forEach((_, i) => { if (!b.habil[i]) assert.equal(s.selecao[b.id][i], false, `caso ${c}: ligou chave desabilitada`); }));
    assert.ok(Math.abs((alvo - tot) - melhorErroBruto(bancos, alvo, null)) < 1e-6, `caso ${c}: nao e o menor erro`);
  }
});

test('diferencial: FB de 2 bancos == FB N (arvore) em total e custo de resultado', () => {
  const r = rng(7);
  for (let c = 0; c < 60; c++) {
    const bancos = [0, 1].map(i => banco('B' + i, Array.from({ length: 3 + Math.floor(r() * 6) }, () => [1,2,5,10][Math.floor(r() * 4)])));
    const alvo = Math.round(r() * 60);
    // compara o caminho de 2 bancos com o de 3 bancos (3o banco todo desabilitado): mesma resposta
    const extra = banco('Z', [5], [false]);
    const a = R.sugere({ bancos, alvoKw: alvo }), b = R.sugere({ bancos: bancos.concat([extra]), alvoKw: alvo });
    assert.equal(a.total, b.total, `caso ${c}: totais diferem entre FB de 2 e FB de 3`);
  }
});

test('invariante: com limite de capacidade a sugestao nunca passa do limite', () => {
  const r = rng(99), bancos = REAIS();
  for (let c = 0; c < 40; c++) {
    const kw100 = 100 + Math.floor(r() * 900), pct = [100, 107, 112][Math.floor(r() * 3)], alvo = Math.round(r() * 1400);
    const s = R.sugere({ bancos, alvoKw: alvo, kw100, pctLimite: pct });
    assert.ok(totalSel(bancos, s.selecao) <= kw100 * pct / 100 + 1e-6, `caso ${c}: passou do limite`);
    assert.equal(R.guarda({ bancos, selecao: s.selecao, kw100, pctLimite: pct }).ok, true, `caso ${c}: a guarda barrou a propria sugestao`);
  }
});

test('guarda: falha segura sem limite, bloqueia acima, libera no limite exato', () => {
  const bancos = [banco('A', [10, 10])];
  assert.equal(R.guarda({ bancos, selecao: { A: [true, false] } }).ok, false, 'sem kw100/pct deve bloquear');
  assert.equal(R.guarda({ bancos, selecao: { A: [true, true] }, kw100: 15, pctLimite: 100 }).ok, false);
  assert.equal(R.guarda({ bancos, selecao: { A: [true, true] }, kw100: 20, pctLimite: 100 }).ok, true, 'igual ao limite pode');
  assert.equal(R.guarda({ bancos, selecao: { A: [true, true] }, kw100: 0, pctLimite: 100 }).ok, false, 'kw100 zero bloqueia');
  assert.equal(R.guarda({ bancos, selecao: { A: [true, true] }, kw100: NaN, pctLimite: 100 }).ok, false, 'NaN bloqueia');
  assert.equal(R.podeLigar({ bancos, selecao: { A: [true, false] }, kw100: 15, pctLimite: 100 }, 'A', 1).ok, false);
});

test('modo minimo: atinge o alvo dentro do excesso ou avisa', () => {
  const bancos = [banco('A', [5, 5, 10, 50])];
  const s = R.sugere({ bancos, alvoKw: 107, modoAlvo: 'minimo', excessoMaxKw: 3 });
  assert.ok(s.aviso, 'sem combinacao entre 107 e 110 deve avisar');
  const t = R.sugere({ bancos, alvoKw: 60, modoAlvo: 'minimo', excessoMaxKw: 0 });
  assert.equal(t.total, 60); assert.equal(t.dentro, true);
});

test('rodizio: entre somas iguais, escolhe as chaves menos usadas', () => {
  const b = banco('A', [5, 5]); b.estado.acion = [10, 0];
  const s = R.sugere({ bancos: [b], alvoKw: 5 });
  assert.deepEqual(s.selecao.A, [false, true]);
});

test('planoEntrada: cada chave aparece uma vez e o plano leva do estado atual ao desejado', () => {
  const r = rng(5);
  for (let c = 0; c < 60; c++) {
    const bancos = [banco('A', [5,5,10,10,50]), banco('B', [3,4,4,5])];
    const atual = {}, selecao = {};
    bancos.forEach(b => { atual[b.id] = b.kws.map(() => r() > 0.5); selecao[b.id] = b.kws.map(() => r() > 0.5); });
    const esc = { degrauMaxKw: [null, 0, 20][Math.floor(r() * 3)], pausaS: 2, desligaImediato: r() > 0.5, ligaAntes: r() > 0.5, janelaDesligaS: 1 };
    const plano = R.planoEntrada({ bancos, atual, selecao, escalonamento: esc });
    const est = JSON.parse(JSON.stringify(atual)), visto = new Set();
    plano.passos.forEach(p => { p.desliga.concat(p.liga).forEach(x => { const k = x.banco + ':' + x.idx; assert.ok(!visto.has(k), `caso ${c}: chave ${k} duplicada`); visto.add(k); });
      p.desliga.forEach(x => { est[x.banco][x.idx] = false; }); p.liga.forEach(x => { est[x.banco][x.idx] = true; }); });
    assert.deepEqual(est, selecao, `caso ${c}: plano nao chega na selecao`);
    const pico = R.picoPlano({ bancos, atual }, plano);
    assert.ok(pico + 1e-9 >= Math.max(totalSel(bancos, atual), totalSel(bancos, selecao)), `caso ${c}: pico menor que inicio/fim`);
    for (let i = 1; i < plano.passos.length; i++) assert.ok(plano.passos[i].t >= plano.passos[i - 1].t, `caso ${c}: tempo decrescente`);
  }
});

test('borda: entradas invalidas nao podem derrubar a sugestao (falha segura)', () => {
  const bancos = [banco('A', [5, 5])];
  for (const alvo of [NaN, undefined, -5, Infinity]) {
    let r; assert.doesNotThrow(() => { r = R.sugere({ bancos, alvoKw: alvo }); }, `alvo ${alvo} lancou excecao`);
    if (r) assert.ok(totalSel(bancos, r.selecao) <= 10 + 1e-9);
  }
  const nenhuma = banco('A', [5, 5], [false, false]);
  assert.equal(R.sugere({ bancos: [nenhuma], alvoKw: 50 }).total, 0, 'tudo desabilitado = nada ligado');
});

test('desempenho: 4 bancos reais (13+13+18+12 chaves) em ate 1 s', () => {
  const bancos = REAIS(), t = Date.now();
  for (const alvo of [30, 213.4, 600, 1000]) R.sugere({ bancos, alvoKw: alvo, kw100: 1000, pctLimite: 107 });
  assert.ok((Date.now() - t) / 4 < 1000, 'sugere acima de 1 s por chamada');
});

// ---------------- v0.5: programacao dinamica (sem enumeracao 2^n) ----------------
function custoSel(bancos, sel, pm = 0.01) {            // custo independente do codigo: desgaste normalizado (acion+horas) + pm por chave que mudou
  let c = 0;
  for (const b of bancos) { const n = b.kws.length, mA = Math.max(1, ...b.estado.acion), mH = Math.max(1, ...b.estado.horas);
    for (let i = 0; i < n; i++) { if (sel[b.id][i]) c += b.estado.acion[i] / mA + b.estado.horas[i] / mH; if (sel[b.id][i] !== !!b.atual[i]) c += pm; } }
  return c;
}
test('DP == exaustivo: mesmo total/erro e custo igual ou menor (150 casos com desgaste e estado atual)', () => {
  const r = rng(2026);
  for (let c = 0; c < 150; c++) {
    const nb = 1 + Math.floor(r() * 3);
    const bancos = Array.from({ length: nb }, (_, i) => { const n = 3 + Math.floor(r() * 6); const kws = Array.from({ length: n }, () => [0.5,1,2,5,10,25][Math.floor(r() * 6)]);
      const b = banco('B' + i, kws, kws.map(() => r() > 0.15)); b.estado = { acion: kws.map(() => Math.floor(r() * 20)), horas: kws.map(() => Math.floor(r() * 50)) }; b.atual = kws.map(() => r() > 0.5); return b; });
    const alvo = Math.round(r() * 80 * 2) / 2, ent = { bancos, alvoKw: alvo };
    const a = R.sugere(ent), e = R.sugereExaustivo(ent);
    assert.equal(a.total, e.total, `caso ${c}: total difere`);
    assert.ok(custoSel(bancos, a.selecao) <= custoSel(bancos, e.selecao) + 1e-6, `caso ${c}: DP com custo pior que a enumeracao`);
    bancos.forEach(b => b.kws.forEach((_, i) => { if (!b.habil[i]) assert.equal(a.selecao[b.id][i], false); }));
  }
});

test('escala: banco de 32 chaves + 4 bancos reais responde em ate 1 s (antes: inviavel)', () => {
  const grande = banco('G', Array.from({ length: 32 }, (_, i) => [0.5, 1, 2, 5, 10][i % 5]));
  const bancos = REAIS().concat([grande]);
  const t = Date.now(), s = R.sugere({ bancos, alvoKw: 777.5, kw100: 1500, pctLimite: 107 });
  assert.ok(Date.now() - t < 1000, `demorou ${Date.now() - t} ms`);
  assert.ok(totalSel(bancos, s.selecao) <= 777.5 + 1e-9);
  assert.equal(totalSel(bancos, s.selecao), s.total);
});

test('kW fora da grade de 0,1: (v0.6) DP com peso arredondado para cima continua achando o exato neste caso', () => {
  const b = banco('A', [0.25, 0.75, 1.5]); const s = R.sugere({ bancos: [b], alvoKw: 1 });
  assert.ok(Math.abs(s.total - 1) < 1e-9, `total ${s.total}`);
});

test('vetores congelados: o modulo atual reproduz os vetores de tests/fb/vetores (regressao e referencia para o SCL)', () => {
  const fs = require('fs');
  for (const arq of ['sugere_vetores_v0.1.json', 'sugere_vetores_v0.2.json']) {
    if (arq !== 'sugere_vetores_v0.1.json' && /v0\.5\.js$/.test(MOD)) continue;   // v0.2 inclui casos que so a v0.6 resolve (kW real, kW invalido)
    const v = JSON.parse(fs.readFileSync(__dirname + '/vetores/' + arq, 'utf8'));
    for (const c of v.casos) { const s = R.sugere(c.entrada); assert.equal(s.total, c.saida.total, arq + ' ' + c.nome + ': total'); assert.equal(s.erro, c.saida.erro, arq + ' ' + c.nome + ': erro');
      if (c.saida.selecao && v.versao !== 'v0.1') assert.deepEqual(s.selecao, c.saida.selecao, arq + ' ' + c.nome + ': selecao'); }
  }
});

// ---------------- auditoria 03/11/2026 (v0.6): achados A1-A6 ----------------
// A1 (alta): a guarda aprovava selecao com kW nao numerico ou negativo (total NaN passa em "total > limite").
test('A1 guarda: kW invalido (NaN, undefined, negativo, zero) numa chave SELECIONADA bloqueia (falha segura)', () => {
  const g = (kws, sel) => R.guarda({ bancos: [{ id: 'A', kws }], selecao: { A: sel }, kw100: 4, pctLimite: 100 });
  assert.equal(g([5, NaN], [true, true]).ok, false, 'NaN passou');
  assert.equal(g([5, undefined], [false, true]).ok, false, 'undefined passou');
  assert.equal(g([5, -3], [true, true]).ok, false, 'kW negativo subcontou e passou');
  assert.equal(g([5, 0], [false, true]).ok, false, 'kW zero passou');
  assert.equal(g([3, NaN], [true, false]).ok, true, 'chave invalida NAO selecionada nao deve bloquear');
});

// A1b (baixa): selecao de banco ausente da lista era ignorada (subcontagem); podeLigar lancava excecao.
test('A1b guarda: chave ligada em banco fora da lista bloqueia; podeLigar com banco desconhecido nao lanca excecao', () => {
  const ent = { bancos: [{ id: 'A', kws: [5] }], selecao: { A: [false], B: [true] }, kw100: 4, pctLimite: 100 };
  assert.equal(R.guarda(ent).ok, false, 'banco B ignorado');
  assert.equal(R.guarda(Object.assign({}, ent, { selecao: { A: [true], B: [false] } })).ok, false, '5 > 4 deve bloquear');
  assert.equal(R.guarda(Object.assign({}, ent, { kw100: 10, selecao: { A: [true], B: [false, false] } })).ok, true, 'banco fora da lista todo desligado nao bloqueia');
  let r; assert.doesNotThrow(() => { r = R.podeLigar({ bancos: [{ id: 'A', kws: [5] }], selecao: { A: [false] }, kw100: 10, pctLimite: 100 }, 'X', 0); });
  assert.equal(r.ok, false);
  assert.equal(R.podeLigar({ bancos: [{ id: 'A', kws: [5] }], selecao: { A: [false] }, kw100: 10, pctLimite: 100 }, 'A', 3).ok, false, 'indice de chave inexistente');
});

// A2 (media): chave com kW invalido (Setup que gravou kW real <= 0) entrava no calculo; agora fica fora (como desabilitada) e e desligada.
test('A2 sugere: chave com kW invalido nunca e ligada e, se estiver ligada, a sugestao a desliga', () => {
  for (const ruim of [NaN, -0.5, 0, undefined]) {
    const b = banco('A', [5, 5, ruim]); b.atual = [false, false, true];
    const s = R.sugere({ bancos: [b], alvoKw: 9.5 });
    assert.equal(s.selecao.A[2], false, `kW ${ruim} ligada`);
    assert.ok(Number.isFinite(s.total) && s.total <= 9.5 + 1e-9, `total ${s.total}`);
  }
});

// A3 (alta): com "Usar kW real" (kW medidos, fora da grade de 0,5/0,1 kW) a v0.5 voltava a enumerar 2^n:
// 2 bancos reais = 14 a 31 s e depois "Maximum call stack size exceeded"; 31/32 chaves = resultado vazio (1 << 32 === 1 em JS).
const kwReal = (r, k) => Math.round(k * (0.95 + 0.1 * r()) * 1000) / 1000;
test('A3 kW real (fora da grade): 4 bancos reais respondem em ate 1 s e nunca passam do alvo/limite', () => {
  const r = rng(3), bancos = REAIS(); bancos.forEach(b => { b.kws = b.kws.map(k => kwReal(r, k)); });
  for (const alvo of [30, 213.4, 600, 1000]) {
    const t = Date.now(), s = R.sugere({ bancos, alvoKw: alvo, kw100: 1000, pctLimite: 107 });
    assert.ok(Date.now() - t < 1000, `alvo ${alvo}: ${Date.now() - t} ms`);
    const tot = totalSel(bancos, s.selecao);
    assert.ok(tot <= alvo + 1e-9 && tot <= 1070 + 1e-9, `alvo ${alvo}: total ${tot}`);
    assert.ok(Math.abs(tot - s.total) < 1e-6, 'total informado difere da soma real');
    assert.ok(alvo - tot < 3, `alvo ${alvo}: erro ${alvo - tot} kW grande demais`);
  }
});
test('A3 kW real: banco de 31 e de 32 chaves fora da grade da uma sugestao valida (nao vazio silencioso)', () => {
  const r = rng(4);
  for (const n of [31, 32]) {
    const g = banco('G', Array.from({ length: n }, (_, i) => kwReal(r, [0.5, 1, 2, 5, 10][i % 5])));
    const s = R.sugere({ bancos: [g], alvoKw: 50 });
    const tot = totalSel([g], s.selecao);
    assert.ok(tot <= 50 + 1e-9 && tot > 48, `${n} chaves: total ${tot} (aviso: ${s.aviso})`);
  }
});
test('A3 kW real (oraculo): nunca passa do alvo nem do limite; erro perto do otimo (200 casos pequenos)', () => {
  const r = rng(11);
  let piorFolga = 0;
  for (let c = 0; c < 200; c++) {
    const nb = 1 + Math.floor(r() * 3);
    const bancos = Array.from({ length: nb }, (_, i) => { const n = 2 + Math.floor(r() * 4);
      const b = banco('B' + i, Array.from({ length: n }, () => kwReal(r, [0.5, 1, 2, 5, 10, 25][Math.floor(r() * 6)])), Array.from({ length: n }, () => r() > 0.2));
      b.estado = { acion: b.kws.map(() => Math.floor(r() * 9)), horas: b.kws.map(() => Math.floor(r() * 9)) }; b.atual = b.kws.map(() => r() > 0.5); return b; });
    const max = bancos.reduce((t, b) => t + b.kws.reduce((u, k, i) => u + (b.habil[i] ? k : 0), 0), 0);
    const alvo = Math.round(r() * max * 1.1 * 10) / 10, lim = r() > 0.5 ? null : Math.round(r() * max * 10) / 10;
    const ent = { bancos, alvoKw: alvo }; if (lim != null) { ent.kw100 = lim; ent.pctLimite = 100; }
    const s = R.sugere(ent), tot = totalSel(bancos, s.selecao);
    assert.ok(tot <= alvo + 1e-9, `caso ${c}: passou do alvo`); if (lim != null) assert.ok(tot <= lim + 1e-9, `caso ${c}: passou do limite`);
    bancos.forEach(b => b.kws.forEach((_, i) => { if (!b.habil[i]) assert.equal(s.selecao[b.id][i], false, `caso ${c}: ligou desabilitada`); }));
    const otimo = melhorErroBruto(bancos, alvo, lim), folga = (alvo - tot) - otimo;
    const nChaves = bancos.reduce((t, b) => t + b.kws.length, 0);
    assert.ok(folga <= nChaves * 0.1 + 1e-6, `caso ${c}: erro ${alvo - tot} contra otimo ${otimo}`);
    piorFolga = Math.max(piorFolga, folga);
  }
});

// A4 (regressao do porte): na grade de 0,5 kW a v0.6 da EXATAMENTE a mesma selecao da v0.5 (mesmo desempate).
test('A4 diferencial v0.6 x v0.5: kW na grade -> mesma selecao, total e erro (300 casos)', () => {
  const r = rng(77);
  for (let c = 0; c < 300; c++) {
    const nb = 1 + Math.floor(r() * 4);
    const bancos = Array.from({ length: nb }, (_, i) => { const n = 2 + Math.floor(r() * 10); const kws = Array.from({ length: n }, () => [0.5, 1, 2, 3, 4, 5, 10, 25, 50][Math.floor(r() * 9)]);
      const b = banco('B' + i, kws, kws.map(() => r() > 0.15)); b.estado = { acion: kws.map(() => Math.floor(r() * 5)), horas: kws.map(() => Math.floor(r() * 5)) }; b.atual = kws.map(() => r() > 0.5); return b; });
    const ent = { bancos, alvoKw: Math.round(r() * 300 * 2) / 2 }; if (r() > 0.4) { ent.kw100 = 50 + Math.floor(r() * 250); ent.pctLimite = 107; }
    if (r() > 0.8) { ent.modoAlvo = 'minimo'; ent.excessoMaxKw = Math.floor(r() * 4); }
    const a = R.sugere(ent), b = R05.sugere(ent);
    assert.equal(a.total, b.total, `caso ${c}: total`); assert.equal(a.erro, b.erro, `caso ${c}: erro`);
    assert.deepEqual(a.selecao, b.selecao, `caso ${c}: selecao diferente`);
  }
});

// A5 (baixa): pausa/degrau invalidos (NaN) no plano viravam "tudo de uma vez" com tempo NaN.
test('A5 planoEntrada: degrau NaN = uma chave por passo (conservador) e pausa NaN = 0; tempos sempre numericos', () => {
  const bancos = [banco('A', [5, 10, 50])], atual = { A: [false, false, false] }, selecao = { A: [true, true, true] };
  const p = R.planoEntrada({ bancos, atual, selecao, escalonamento: { degrauMaxKw: NaN, pausaS: 2 } });
  assert.equal(p.passos.length, 3, 'degrau invalido nao pode juntar tudo num degrau so');
  const q = R.planoEntrada({ bancos, atual, selecao, escalonamento: { degrauMaxKw: 0, pausaS: NaN } });
  q.passos.forEach(x => assert.ok(Number.isFinite(x.t), 'tempo NaN')); assert.ok(Number.isFinite(q.duracaoS));
});

// A6 (baixa): o oraculo exaustivo dava resultado errado acima de 30 chaves (1 << 31 < 0); agora recusa com excecao clara.
test('A6 sugereExaustivo: recusa banco grande demais em vez de errar em silencio', () => {
  const g = banco('G', Array.from({ length: 31 }, () => 1));
  assert.throws(() => R.sugereExaustivo({ bancos: [g], alvoKw: 3 }), /oráculo|oraculo|grande/i);
});
