// Mapa dos FBs v0.17: pulso quando o bloco AGE, estados com cores/simbolos distintos, layout estavel, "reduzir movimento". Abre o arquivo direto (file://), sem servidor.
// Alimenta o mapa com fotos simuladas dos FBs (mesmo formato que o medidor publica). Uso: node tests/e2e/mapa_fbs_pulso.js   (MAPA=nome.html; SHOTS=pasta para salvar capturas)
const { chromium } = require('playwright');
const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MAPA || 'mapa_fbs_v0.17.html');
const SHOTS = process.env.SHOTS || '';
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
const esp = ms => new Promise(r => setTimeout(r, ms));
// foto base: todos os filhos 1..11; 'k' sobrescreve partes
const FOTO = `(k) => { const f = { v: 1, ts: Date.now(), fonte: 'virtual', estado: 'EXECUTANDO', msg: '', kw: { alvo: 50, sel: 50, cmd: 50, conf: 50, cap100: 100 }, etapa: { idx: 0, alvoPct: 50 }, aplicar: { modo: 'A', liberado: false }, filhos: {} };
  for (let i = 1; i <= 11; i++) f.filhos[i] = { estado: 'idle', txt: '', ent: {}, sai: {} };
  f.filhos[2].sai = { 'kW medido': 50, 'V medido': 220, 'Hz medido': 60, 'qualidade': 'boa' }; f.filhos[3].sai = { 'kW alvo': 50, 'modo': 'abaixo' }; f.filhos[7].sai = { 'tempo da etapa': 10, 'tempo neste estado': 3 };
  const m = k || {}; if (m.estado) f.estado = m.estado; if (m.kw) Object.assign(f.kw, m.kw); if (m.fil) for (const id in m.fil) { const a = f.filhos[id]; const b = m.fil[id]; if (b.estado) a.estado = b.estado; if (b.sai) Object.assign(a.sai, b.sai); if (b.ent) Object.assign(a.ent, b.ent); } return f; }`;
const envia = (p, k) => p.evaluate(([F, k]) => recebe(eval(F)(k)), [FOTO, k || null]);
const halos = p => p.evaluate(() => [...document.querySelectorAll('.halo')].map(h => { const g = h.closest('g'); return g.getAttribute('aria-label'); }));
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
    ok('sem foto: nenhum halo', (await halos(p)).length === 0);
    await envia(p); await p.waitForTimeout(150);
    ok('primeira foto NAO pulsa ninguem (abrir a tela nao acende tudo)', (await halos(p)).length === 0);
    await envia(p); await p.waitForTimeout(150);
    ok('foto igual (so o relogio muda): nenhum halo', (await halos(p)).length === 0);
    // ruido de medicao e contador de tempo nao contam
    await envia(p, { fil: { 2: { sai: { 'kW medido': 50.2 } }, 7: { sai: { 'tempo da etapa': 11, 'tempo neste estado': 4 } } } }); await p.waitForTimeout(150);
    ok('ruido de medicao (50,0 -> 50,2) e contadores de tempo NAO pulsam', (await halos(p)).length === 0, JSON.stringify(await halos(p)));
    const antes = await caixas(p);
    // o filho 3 muda uma saida: pulsa so ele
    await envia(p, { fil: { 3: { sai: { 'kW alvo': 80 } } } }); await p.waitForTimeout(120);
    const h3 = await halos(p);
    ok('mudou a saida do filho 3 (kW alvo 50 -> 80): pulsa SO o bloco 3', h3.length === 1 && /^Bloco 3\b/.test(h3[0]), JSON.stringify(h3));
    if (mov === 'no-preference') ok('durante o pulso o halo esta animado (pulsoHalo)', await p.evaluate(() => getComputedStyle(document.querySelector('.halo')).animationName === 'pulsoHalo'));
    else ok('reduzir movimento: halo SEM animacao e visivel (anel fixo)', await p.evaluate(() => { const c = getComputedStyle(document.querySelector('.halo')); return c.animationName === 'none' && +c.opacity >= 0.8; }));
    ok('layout estavel: posicao e tamanho de todos os cartoes iguais durante o pulso', (await caixas(p)) === antes);
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'mapa17_' + nome.replace(/ /g, '_') + '_pulso.png') });
    await esp(1500);
    ok('depois de ~1,5 s o halo some (nenhum halo, nenhum .pulso)', (await halos(p)).length === 0 && await p.evaluate(() => document.querySelectorAll('.pulso').length === 0));
    ok('layout estavel: igual depois do pulso', (await caixas(p)) === antes);
    // medicao com salto real pulsa o bloco 2; a mae pulsa quando o comandado muda
    await envia(p, { fil: { 2: { sai: { 'kW medido': 58 } } } }); await p.waitForTimeout(120);
    ok('salto real de medicao (50 -> 58 kW) pulsa o bloco 2', (await halos(p)).some(x => /^Bloco 2\b/.test(x)), JSON.stringify(await halos(p)));
    await esp(1500);
    await envia(p, { kw: { cmd: 80 }, fil: { 2: { sai: { 'kW medido': 58 } } } }); await p.waitForTimeout(120);
    ok('comandado da mae mudou (50 -> 80): a mae pulsa', (await halos(p)).some(x => /orquestrador|Bloco 9/i.test(x)), JSON.stringify(await halos(p)));
    await esp(1500);
    // estado do filho muda: pulsa
    await envia(p, { fil: { 8: { estado: 'falha' } } }); await p.waitForTimeout(120);
    ok('estado do filho 8 mudou (ocioso -> falha): pulsa o bloco 8', (await halos(p)).some(x => /^Bloco 8\b/.test(x)));
    await esp(1500);
    // volta de "sem sinal" nao pulsa tudo
    await p.evaluate(() => { AO.ts = Date.now() - 20000; });
    await envia(p, { fil: { 3: { sai: { 'kW alvo': 30 } } } }); await p.waitForTimeout(120);
    ok('volta depois de "sem sinal" NAO pulsa (foto anterior velha)', (await halos(p)).length === 0, JSON.stringify(await halos(p)));
    // estados: cores distintas, contraste, simbolos
    await envia(p, { fil: { 1: { estado: 'idle' }, 2: { estado: 'ok' }, 3: { estado: 'ativo' }, 8: { estado: 'falha' } } }); await esp(1500);
    await envia(p, { fil: { 1: { estado: 'idle' }, 2: { estado: 'ok' }, 3: { estado: 'ativo' }, 8: { estado: 'falha' } } }); await p.waitForTimeout(200);
    const est = await p.evaluate(() => { const o = {}; [['idle', 1], ['ok', 2], ['ativo', 3], ['falha', 8]].forEach(([k, id]) => { const g = [...document.querySelectorAll('.bx')].find(x => new RegExp('^Bloco ' + id + '\\b').test(x.getAttribute('aria-label'))); o[k] = { fill: getComputedStyle(g.querySelector('.corpo')).fill, ink: getComputedStyle(g.querySelector('.tit')).fill, est: g.querySelector('.est').textContent }; }); return o; });
    const cor = {}; for (const k in est) cor[k] = rgb(est[k].fill);
    const pares = []; const ks = Object.keys(cor); for (let i = 0; i < ks.length; i++) for (let j = i + 1; j < ks.length; j++) pares.push([ks[i] + '/' + ks[j], dist(cor[ks[i]], cor[ks[j]])]);
    ok('os 4 estados tem preenchimento claramente diferente (distancia RGB >= 25 em todos os pares)', pares.every(x => x[1] >= 25), pares.map(x => x[0] + '=' + Math.round(x[1])).join(' '));
    ok('texto do titulo legivel em todos os estados (contraste >= 4,5)', ks.every(k => contr(rgb(est[k].ink), cor[k]) >= 4.5), ks.map(k => k + '=' + contr(rgb(est[k].ink), cor[k]).toFixed(1)).join(' '));
    ok('cada estado tem simbolo de forma (■ ✔ ▶ ▲), nao so cor', est.idle.est.startsWith('■') && est.ok.est.startsWith('✔') && est.ativo.est.startsWith('▶') && est.falha.est.startsWith('▲'), ks.map(k => est[k].est.slice(0, 12)).join(' | '));
    ok('legenda explica o simbolo e o ambar (texto curto)', await p.evaluate(() => /■ ocioso/.test(document.querySelector('.lg').textContent) && /âmbar: agiu agora/.test(document.querySelector('.lg').textContent)));
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'mapa17_' + nome.replace(/ /g, '_') + '_estados.png') });
    ok('sem erro de JavaScript na pagina', erros.length === 0, erros.join(' | '));
    await ctx.close();
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + (R.length - f) + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
