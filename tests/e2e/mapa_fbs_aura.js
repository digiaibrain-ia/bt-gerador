// Mapa dos FBs v0.18: AUREOLA de fundo no bloco ATIVO (respira 40 % a 90 %, nunca apaga, sem saltos mesmo com o desenho recriado a cada foto), estados com cor/simbolo, layout estavel, "reduzir movimento".
// Abre o arquivo direto (file://), sem servidor. Alimenta o mapa com fotos simuladas dos FBs. Uso: node tests/e2e/mapa_fbs_aura.js   (MAPA=nome.html; SHOTS=pasta para salvar capturas)
const { chromium } = require('playwright');
const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MAPA || 'mapa_fbs_v0.18.html');
const SHOTS = process.env.SHOTS || '';
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
const esp = ms => new Promise(r => setTimeout(r, ms));
const FOTO = `(k) => { const f = { v: 1, ts: Date.now(), fonte: 'virtual', estado: 'EXECUTANDO', msg: '', kw: { alvo: 50, sel: 50, cmd: 50, conf: 50, cap100: 100 }, etapa: { idx: 0, alvoPct: 50 }, aplicar: { modo: 'A', liberado: false }, filhos: {} };
  for (let i = 1; i <= 11; i++) f.filhos[i] = { estado: 'idle', txt: '', ent: {}, sai: {} };
  f.filhos[2].sai = { 'kW medido': 50, 'V medido': 220, 'Hz medido': 60, 'qualidade': 'boa' }; f.filhos[3].sai = { 'kW alvo': 50, 'modo': 'abaixo' }; f.filhos[7].sai = { 'tempo da etapa': 10, 'tempo neste estado': 3 };
  const m = k || {}; if (m.fil) for (const id in m.fil) { const a = f.filhos[id], b = m.fil[id]; if (b.estado) a.estado = b.estado; if (b.sai) Object.assign(a.sai, b.sai); } return f; }`;
const envia = (p, k) => p.evaluate(([F, k]) => recebe(eval(F)(k)), [FOTO, k || null]);
const auras = p => p.evaluate(() => [...document.querySelectorAll('.aura')].map(h => h.closest('g').getAttribute('aria-label').replace(/:.*/, '')));
const caixas = p => p.evaluate(() => [...document.querySelectorAll('.bx .corpo,.mae .corpo')].map(e => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].join(','); }).join('|'));
const rgb = s => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const contr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
(async () => {
  const b = await chromium.launch();
  const CEN = [['desktop claro', { width: 1536, height: 800 }, false, 'light', 'no-preference'], ['celular escuro', { width: 390, height: 844 }, true, 'dark', 'no-preference'], ['desktop reduzir movimento', { width: 1536, height: 800 }, false, 'light', 'reduce']];
  for (const [nome, vp, mobile, tema, mov] of CEN) {
    console.log('\n## ' + nome);
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, colorScheme: tema, reducedMotion: mov, deviceScaleFactor: 2 }); const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
    await p.goto('file://' + ARQ); await p.waitForTimeout(600);
    ok('sem foto: nenhuma aureola', (await auras(p)).length === 0);
    await envia(p, { fil: { 1: { estado: 'idle' }, 2: { estado: 'ok' }, 8: { estado: 'falha' } } }); await p.waitForTimeout(200);
    ok('so ocioso, ok e falha: nenhuma aureola (so o bloco ATIVO brilha)', (await auras(p)).length === 0, JSON.stringify(await auras(p)));
    const sem = await caixas(p);
    await envia(p, { fil: { 1: { estado: 'idle' }, 2: { estado: 'ok' }, 3: { estado: 'ativo' }, 8: { estado: 'falha' } } }); await p.waitForTimeout(200);
    const a1 = await auras(p);
    ok('filho 3 ativo: aureola SO no bloco 3', a1.length === 1 && /^Bloco 3\b/.test(a1[0]), JSON.stringify(a1));
    ok('layout estavel: posicao e tamanho dos cartoes iguais com a aureola ligada', (await caixas(p)) === sem);
    ok('aureola e desfocada por filtro SVG (funciona tambem no Safari/iOS) e fica ATRAS do cartao', await p.evaluate(() => { const a = document.querySelector('.aura'); return a.getAttribute('filter') === 'url(#fAura)' && !!document.querySelector('#fAura feGaussianBlur') && a.nextElementSibling && a.nextElementSibling.classList.contains('corpo'); }));
    await envia(p, { fil: { 1: { estado: 'idle' }, 2: { estado: 'ok' }, 3: { estado: 'ativo' }, 9: { estado: 'ativo' }, 8: { estado: 'falha' } } }); await p.waitForTimeout(200);
    const a2 = await auras(p);
    ok('mae (bloco 9) ativa: tambem ganha aureola, sem mexer nos outros', a2.length === 2 && a2.some(x => /Bloco 9|orquestrador/i.test(x)) && a2.some(x => /^Bloco 3\b/.test(x)), JSON.stringify(a2));
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'mapa18_' + nome.replace(/ /g, '_') + '_aura.png') });
    // RESPIRACAO: amostra a opacidade por ~4,6 s enquanto o desenho e RECRIADO a cada 400 ms (contador de tempo muda). Nao pode apagar nem dar salto.
    const amostras = []; let k = 0; const t0 = Date.now(); let tEnvio = 0;
    while (Date.now() - t0 < 4600) {
      if (Date.now() - tEnvio > 400) { tEnvio = Date.now(); k++; await envia(p, { fil: { 3: { estado: 'ativo' }, 7: { sai: { 'tempo da etapa': 10 + k } } } }); }
      amostras.push(await p.evaluate(() => { const a = document.querySelector('.aura'); return a ? +getComputedStyle(a).opacity : null; })); await esp(60);
    }
    const v = amostras.filter(x => x != null); const mn = Math.min(...v), mx = Math.max(...v); let salto = 0; for (let i = 1; i < v.length; i++) salto = Math.max(salto, Math.abs(v[i] - v[i - 1]));
    ok('a aureola esta presente em TODAS as amostras (nao some quando o desenho e recriado)', v.length === amostras.length && v.length > 40, v.length + '/' + amostras.length + ' amostras');
    if (mov === 'no-preference') {
      ok('respira: opacidade oscila e nunca apaga (min >= 0,37 e max <= 0,93)', mn >= 0.37 && mx <= 0.93, 'min ' + mn.toFixed(2) + ' max ' + mx.toFixed(2));
      ok('respira de verdade (amplitude >= 0,3 em ~4,6 s)', mx - mn >= 0.3, (mx - mn).toFixed(2));
      ok('sem pisca/salto entre amostras seguidas (maior degrau <= 0,12), mesmo recriando o desenho a cada 400 ms', salto <= 0.12, 'maior degrau ' + salto.toFixed(3));
    } else {
      ok('reduzir movimento: aureola fixa em 70 % e sem animacao', mn === mx && Math.abs(mn - 0.7) < 0.02 && await p.evaluate(() => getComputedStyle(document.querySelector('.aura')).animationName === 'none'), 'min ' + mn + ' max ' + mx);
    }
    // bloco deixa de estar ativo: aureola some
    await envia(p, { fil: { 3: { estado: 'ok' }, 9: { estado: 'ok' } } }); await p.waitForTimeout(200);
    ok('bloco que deixou de estar ativo perde a aureola', (await auras(p)).length === 0, JSON.stringify(await auras(p)));
    // estados: cores distintas, contraste, simbolos
    await envia(p, { fil: { 1: { estado: 'idle' }, 2: { estado: 'ok' }, 3: { estado: 'ativo' }, 8: { estado: 'falha' } } }); await p.waitForTimeout(200);
    const est = await p.evaluate(() => { const o = {}; [['idle', 1], ['ok', 2], ['ativo', 3], ['falha', 8]].forEach(([k, id]) => { const g = [...document.querySelectorAll('.bx')].find(x => new RegExp('^Bloco ' + id + '\\b').test(x.getAttribute('aria-label'))); o[k] = { fill: getComputedStyle(g.querySelector('.corpo')).fill, ink: getComputedStyle(g.querySelector('.tit')).fill, est: g.querySelector('.est').textContent }; }); return o; });
    const cor = {}; for (const kk in est) cor[kk] = rgb(est[kk].fill);
    const pares = []; const ks = Object.keys(cor); for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) pares.push([ks[i] + '/' + ks[j], dist(cor[ks[i]], cor[ks[j]])]);
    ok('os 4 estados tem preenchimento claramente diferente (distancia RGB >= 25 em todos os pares)', pares.every(x => x[1] >= 25), pares.map(x => x[0] + '=' + Math.round(x[1])).join(' '));
    ok('texto do titulo legivel em todos os estados (contraste >= 4,5)', ks.every(kk => contr(rgb(est[kk].ink), cor[kk]) >= 4.5), ks.map(kk => kk + '=' + contr(rgb(est[kk].ink), cor[kk]).toFixed(1)).join(' '));
    ok('cada estado tem simbolo de forma (■ ✔ ▶ ▲), nao so cor', est.idle.est.startsWith('■') && est.ok.est.startsWith('✔') && est.ativo.est.startsWith('▶') && est.falha.est.startsWith('▲'));
    ok('legenda curta: simbolos e "brilho: bloco ativo"', await p.evaluate(() => /■ ocioso/.test(document.querySelector('.lg').textContent) && /brilho: bloco ativo/.test(document.querySelector('.lg').textContent)));
    ok('sem erro de JavaScript na pagina', erros.length === 0, erros.join(' | '));
    await ctx.close();
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + (R.length - f) + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
