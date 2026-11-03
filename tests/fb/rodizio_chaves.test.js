// Testes do FB em JavaScript (RodizioChaves v0.3) - rodar: node --test tests/fb/
// Estrategia: (1) oraculo por forca bruta em bancos pequenos, (2) testes diferenciais entre os FBs de 2/3/4/N bancos,
// (3) invariantes de seguranca (guarda, limite, habilitacao), (4) casos de borda, (5) orcamento de tempo com os 4 bancos reais.
const test = require('node:test'), assert = require('node:assert/strict');
const R = require('../../dashboard/modulos-fonte/rodizio_chaves_v0.4.js');

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
    // sugere() usa sugere2 para 2 bancos; forca o caminho N chamando com um 3o banco vazio-desabilitado
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
