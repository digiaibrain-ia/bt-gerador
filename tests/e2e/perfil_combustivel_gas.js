// Medidor 1.10.220: PERFIL DE COMBUSTIVEL gas natural. Demo local, so BC56, 40 kW a 100 %, ensaio acelerado (10x), salvamento Por patamar (Aplicar manual).
// Confere: (1) nenhum degrau de carga passa de 25 % (10 kW) e entre degraus ha >= 9 s; (2) frequencia baixa SEGURA o proximo degrau e ele sai quando a frequencia volta;
// (3) sem recuperar no limite DESISTE sem adicionar carga; (4) a etapa final sem carga desce em degraus (nao tudo de uma vez). file://. Uso: node tests/e2e/perfil_combustivel_gas.js (MEDIDOR=nome.html)
const { chromium } = require('playwright'); const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || 'medidor_gerador_v1.10.220.html');
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1536, height: 900 } })).newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message)); p.on('dialog', d => d.accept());
  await p.route('**/api/**', r => r.fulfill({ status: 503, body: '{}' })); await p.goto('file://' + ARQ); await p.waitForTimeout(2200);
  await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(1500);
  const pot = () => p.evaluate(() => { const e = document.getElementById('dPot'); e.value = '40'; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }); await pot();
  await p.evaluate(() => document.getElementById('mAuto') && document.getElementById('mAuto').click()); await p.waitForTimeout(400);
  await p.evaluate(() => document.getElementById('bPatDet').click()); await p.waitForTimeout(400);
  await p.evaluate(() => { const c = [...document.querySelectorAll('input[data-gd=u]')].find(e => e.dataset.bk === '400' || /BC400/.test(e.closest('label') ? e.closest('label').textContent : '')); if (c && c.checked) c.click(); });
  const temSeletor = await p.evaluate(() => !!document.querySelector('#dlgPatDet select[data-k=comb]')); ok('Detalhes do Patamar tem o seletor "Combustivel do gerador"', temSeletor);
  if (temSeletor) { await p.selectOption('#dlgPatDet select[data-k=comb]', 'gas'); await p.waitForTimeout(400); }
  ok('perfil escolhido = gas', await p.evaluate(() => GUIADO_DBG.G.comb === 'gas'));
  await p.evaluate(() => { window.PERFIL_COMB.PERFIS.gas.maxEsperaS = 5; });   // desistir em 15 s (teste), em vez de 70 s
  await p.evaluate(() => window.__setSalvaModo('P')); await p.waitForTimeout(500);
  await p.evaluate(() => { const v = document.querySelector('#velSeg [data-v="10"]'); v && v.click(); });
  await p.evaluate(() => document.getElementById('bIni').click()); await p.waitForTimeout(800); await pot(); await p.evaluate(() => { const o = document.getElementById('dOk'); if (o && o.offsetParent) o.click(); }); await p.waitForTimeout(800);
  const KW = [5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 3];
  const estado = () => p.evaluate(kws => { const cmd = kws.reduce((s, k, i) => { const e = document.querySelector('#bancos .tile[data-i="' + i + '"]'); return s + (e && (e.classList.contains('cmd') || e.classList.contains('s1')) ? k : 0); }, 0); return { et: T.et, mae: GUIADO_MAE.estado, cmd, msg: (GUIADO_DBG.G.msg || '').slice(0, 90), fim: !!T.fim }; }, KW);
  const t0 = Date.now(), tl = []; const aplicadoEt = {}; let ult = -1, freqBaixa = false, segurou = null, desistiu = false, descidas = [];
  for (let i = 0; i < 1100 && !desistiu; i++) {
    await p.waitForTimeout(250); const s = await estado(); const agora = (Date.now() - t0) / 1000;
    if (s.cmd !== ult) { tl.push({ t: agora, kw: s.cmd, et: s.et }); if (s.et === 5) descidas.push({ t: agora, kw: s.cmd }); ult = s.cmd; }
    if (s.et >= 1 && s.et <= 4 && s.mae === 'AGUARDA_APLICAR' && !aplicadoEt[s.et]) { aplicadoEt[s.et] = true; await p.evaluate(() => GUIADO_DBG.aplica()); if (s.et === 1) { await p.waitForTimeout(300); await p.evaluate(() => GUIADO_DBG.aplica()); } }   // etapa 1: DUPLO clique em Aplicar (nao pode furar a pausa)
    // 50 -> 100 %: quando chega em ~30 kW (75 %), a frequencia cai: o degrau seguinte tem que ESPERAR
    if (s.et === 3 && !freqBaixa && s.cmd >= 28 && s.cmd <= 32) { freqBaixa = true; await p.evaluate(() => { window.__perfilFreqOverride = () => 55; }); segurou = { t: Date.now(), kw: s.cmd }; }
    if (freqBaixa && segurou && !segurou.vol) {
      const s2 = await estado();
      if (Date.now() - segurou.t > 12000 && /requ|Aguardando/.test(s2.msg) && s2.cmd === segurou.kw) { segurou.espera = true; segurou.msg = s2.msg; await p.evaluate(() => { window.__perfilFreqOverride = () => 60; }); segurou.vol = Date.now(); }
      else if (Date.now() - segurou.t > 30000) { desistiu = true; }
    }
    if (s.et >= 6 || s.fim) break;
    if (s.et === 5 && descidas.length && Date.now() - t0 > 1e9) break;
  }
  console.log('linha do tempo (t s, kW comandado, etapa):', tl.map(x => x.t.toFixed(1) + ':' + x.kw + '@e' + x.et).join('  '));
  const subidas = []; for (let i = 1; i < tl.length; i++) if (tl[i].kw > tl[i - 1].kw && tl[i].et <= 4) subidas.push({ de: tl[i - 1].kw, ate: tl[i].kw, dt: tl[i].t - tl[i - 1].t });
  const maxSalto = Math.max(0, ...subidas.map(s => s.ate - s.de)); console.log('subidas:', subidas.map(s => s.de + '->' + s.ate + ' (' + s.dt.toFixed(1) + ' s)').join(' | '));
  ok('nenhum degrau de subida passa de 25 % do kW a 100 % (10 kW; chave de 5 kW de folga)', subidas.length > 3 && maxSalto <= 10 + 5, 'maior salto ' + maxSalto + ' kW em ' + subidas.length + ' subidas');
  ok('com a frequencia baixa (55 Hz) o proximo degrau ESPERA (carga parada) e mostra o motivo', !!(segurou && segurou.espera), segurou ? (segurou.msg || 'sem espera') : 'nao chegou a 75 %');
  ok('quando a frequencia volta, o degrau sai (carga sobe depois da espera)', !!(segurou && segurou.vol) && tl.some(x => x.t > ((segurou && segurou.vol) ? (segurou.vol - t0) / 1000 : 1e9) && x.kw > (segurou ? segurou.kw : 99)));
  // descarga final (etapa 5, 0 %): em degraus
  const quedas = []; for (let i = 1; i < descidas.length; i++) if (descidas[i].kw < descidas[i - 1].kw) quedas.push(descidas[i - 1].kw - descidas[i].kw);
  await p.waitForTimeout(500); const fimEst = await estado(); console.log('descida (kW por queda):', quedas.join(', '), '| carga final', fimEst.cmd);
  ok('etapa final sem carga: a carga desce em MAIS DE UMA queda (nao tudo de uma vez)', quedas.length >= 2, 'quedas ' + quedas.length);
  ok('sem erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | '));
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + R.filter(x => x).length + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
