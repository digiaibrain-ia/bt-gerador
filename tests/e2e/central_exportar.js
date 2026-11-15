// Central de registros (medidor 1.10.210): botao EXPORTAR ▾ (era "Imprimir agora"). Cenario REALISTA no Demo: ensaio armado e iniciado com o Mapa dos FBs aberto (gera milhares de eventos, como no registro do Reginaldo).
// Confere o menu, cada formato (PDF organizado, Markdown agrupado, planilha de alertas, monitoramento .json), que a selecao das caixas manda, que PDF NAO despeja JSON bruto e que ele fica curto (paginas medidas com page.pdf).
// Abre o arquivo direto (file://), sem servidor. Uso: node tests/e2e/central_exportar.js   (MEDIDOR=nome.html; SHOTS=pasta para capturas). Contra a 1.10.209 o teste falha (nao ha #cenExporta).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ARQ = path.resolve(__dirname, '..', '..', 'dashboard', 'ferramentas', process.env.MEDIDOR || 'medidor_gerador_v1.10.210.html');
const SHOTS = process.env.SHOTS || '';
const R = []; const ok = (n, c, d) => { R.push(!!c); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
const esp = ms => new Promise(r => setTimeout(r, ms));
const paginas = buf => (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
(async () => {
  const b = await chromium.launch();
  for (const [nome, vp, mobile] of [['desktop 1280x900', { width: 1280, height: 900 }, false], ['celular 390x844', { width: 390, height: 844 }, true]]) {
    console.log('\n## ' + nome);
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, acceptDownloads: true }); const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
    await p.addInitScript(() => { window.__prints = 0; window.print = () => { window.__prints++; }; });
    await p.route('**/api/**', r => r.fulfill({ status: 404, body: '{}' })); await p.goto('file://' + ARQ); await p.waitForTimeout(2200);
    // cenario: Demo + Operador Auto + Patamar Guiado + ensaio iniciado + mapa aberto (muitos eventos)
    await p.evaluate(() => { const d = document.getElementById('demo'); d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(700);
    await p.evaluate(() => { const a = document.getElementById('mAuto'); if (a) a.click(); }); await p.waitForTimeout(300);
    await p.evaluate(() => document.getElementById('bPatDet').click()); await p.waitForTimeout(300); await p.evaluate(() => document.querySelector('[data-gd=mapa]').click()); await p.waitForTimeout(800);
    await p.evaluate(() => document.querySelector('[data-gd=rodar]').click()); await p.waitForTimeout(400);
    await p.evaluate(() => iniciaEnsaio()); await p.waitForTimeout(600); if (await p.evaluate(() => document.getElementById('dlgDados').open)) { await p.evaluate(() => document.getElementById('dOk').click()); await p.waitForTimeout(600); } await p.evaluate(() => iniciaEnsaio());
    await p.waitForTimeout(10000);   // ensaio rodando + ocorrencias (CHV-006) + eventos do mapa
    await p.evaluate(() => { document.getElementById('dlgMapaFBs').close(); document.getElementById('dlgPatDet').close(); });
    // volume parecido com o registro do Reginaldo (3085 eventos, a maioria do Mapa; centenas de falhas de API repetidas). Compara-se: o "Imprimir agora" antigo deu 32 paginas e 236 mil caracteres neste mesmo volume.
    await p.evaluate(() => { for (let i = 0; i < 2700; i++) devObs.log('mapa', 'transicao', 'bloco ' + (i % 11) + ': estado ' + (i % 4) + ' → ' + ((i + 1) % 4), 'info', { campo: 'estado', de: i, para: i + 1 }); for (let i = 0; i < 380; i++) devObs.log('bco', 'api', 'GET /api/chaves/' + (i % 2 ? 56 : 400) + ' → 404', 'falha', { rota: 'GET /api/chaves/56', status: 404, ms: 5 }); });
    await p.evaluate(() => window.CENTRAL_REG.abre()); await p.waitForTimeout(500);
    const nev = await p.evaluate(() => window.OBS_LOG ? window.OBS_LOG.eventos().length : 0);
    console.log('   (cenario: ' + nev + ' eventos de tela registrados)');
    // ---- botoes ----
    ok('existe o botao "Exportar ▾" e NAO existe mais "Imprimir agora"', await p.evaluate(() => { const e = document.getElementById('cenExporta'); return !!e && /Exportar ▾/.test(e.textContent) && !document.getElementById('cenImprime') && !/Imprimir agora/.test(document.getElementById('dlgCentral').textContent); }));
    ok('Salvar selecionados e Copiar resumo continuam na Central', await p.evaluate(() => !!document.getElementById('cenSalva') && !!document.getElementById('cenCopia')));
    // ---- menu ----
    await p.click('#cenExporta'); await p.waitForSelector('.expmenu');
    const itens = await p.evaluate(() => [...document.querySelectorAll('.expmenu button[role=menuitem]')].map(b => b.firstChild.textContent.trim()));
    ok('o menu traz PDF organizado, Markdown agrupado, Planilha de alertas e Monitoramento (.json)', ['PDF organizado (imprimir)', 'Markdown agrupado (.md)', 'Planilha de alertas (.csv)', 'Monitoramento (.json)'].every(x => itens.includes(x)), itens.join(' | '));
    ok('o menu cabe na tela', await p.evaluate(() => { const r = document.querySelector('.expmenu').getBoundingClientRect(); return r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1; }));
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'central210_' + nome.replace(/ /g, '_') + '_menu.png') });
    await p.keyboard.press('Escape'); await p.waitForTimeout(100);
    const item = async t => { await p.click('#cenExporta'); await p.waitForSelector('.expmenu'); await p.click('.expmenu button:has-text("' + t + '")'); };
    // ---- Markdown agrupado ----
    let [dl] = await Promise.all([p.waitForEvent('download', { timeout: 15000 }), item('Markdown agrupado')]);
    let t = fs.readFileSync(await dl.path(), 'utf8');
    ok('Markdown agrupado: baixa 1 arquivo .md com resumo e todos os itens marcados', /^bt2_registros_ensaio_.*_agrupado\.md$/.test(dl.suggestedFilename()) && /# Registros do medidor/.test(t) && /## alertas\/alertas_falhas_historico\.csv/.test(t) && /## logs\/eventos_tela\.jsonl/.test(t) && /## ensaio\/dados_do_ensaio\.json/.test(t), dl.suggestedFilename() + ' (' + t.length + ' caracteres)');
    // ---- planilha de alertas ----
    [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), item('Planilha de alertas')]);
    t = fs.readFileSync(await dl.path(), 'utf8');
    ok('Planilha de alertas: .csv com cabecalho e as ocorrencias (CHV-006) — e abre no Excel (BOM + ;)', /_alertas\.csv$/.test(dl.suggestedFilename()) && t.startsWith('﻿Data e hora;Evento;Tipo;Card;Código;Referência;Texto;Modo') && /CHV-006/.test(t), dl.suggestedFilename());
    // ---- monitoramento ----
    [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), item('Monitoramento')]);
    let j = null; try { j = JSON.parse(fs.readFileSync(await dl.path(), 'utf8')); } catch (e) { }
    ok('Monitoramento: .json valido com versao do medidor, Demo e ocorrencias ativas', !!j && /_monitoramento\.json$/.test(dl.suggestedFilename()) && j.medidor === (String(ARQ).match(/v(1\.10\.\d+)\.html/)||[])[1] && j.demo === true && Array.isArray(j.ocorrenciasAtivas) && j.ocorrenciasAtivas.length > 0, j ? 'medidor ' + j.medidor + ', ' + (j.ocorrenciasAtivas || []).length + ' ocorrencia(s)' : 'JSON invalido');
    // ---- PDF organizado ----
    let antes = await p.evaluate(() => window.__prints);
    await item('PDF organizado'); await p.waitForFunction(n => window.__prints === n + 1, antes, { timeout: 8000 });
    const pdf = await p.evaluate(() => { const e = document.getElementById('prCentral'); return { txt: e.textContent, h3: [...e.querySelectorAll('h3')].map(h => h.textContent), tabelas: e.querySelectorAll('table').length, pre: [...e.querySelectorAll('pre')].map(x => x.textContent.length) }; });
    ok('PDF organizado: tem as secoes (Alertas, Monitoramento, Logs, Dados do ensaio) em TABELAS', ['Alertas e falhas', 'Monitoramento (estado agora)', 'Logs (tela e comunicação)', 'Dados do ensaio'].every(x => pdf.h3.includes(x)) && pdf.tabelas >= 8, pdf.h3.join(' | ') + ' · ' + pdf.tabelas + ' tabelas');
    ok('PDF organizado: NAO despeja JSON/JSONL bruto (nada de "blocos", "{"sessao"…, "idade")', !/"blocos"|\{"sessao"|"idade"|"unitId"/.test(pdf.txt), pdf.txt.length + ' caracteres');
    ok('PDF organizado: conteudo curto (< 30 mil caracteres, nenhum bloco de texto bruto > 3 mil)', pdf.txt.length < 30000 && pdf.pre.every(n => n < 3000), pdf.txt.length + ' car., maior bloco ' + Math.max(0, ...pdf.pre));
    const buf = await p.pdf({ format: 'A4' }); const pg = paginas(buf);
    ok('PDF organizado: no maximo 8 paginas A4 neste volume (o "Imprimir agora" antigo deu 32 paginas no mesmo cenario e 26 no registro real)', pg >= 1 && pg <= 8, pg + ' pagina(s), ' + Math.round(buf.length / 1024) + ' KB, com ' + nev + ' eventos de tela');
    await p.evaluate(() => document.body.classList.remove('prCentral'));
    if (SHOTS && !mobile) fs.writeFileSync(path.join(SHOTS, 'central210_pdf.pdf'), buf);
    // ---- a selecao das caixas manda ----
    await p.evaluate(() => document.querySelectorAll('#dlgCentral input[data-it]').forEach(c => { c.checked = c.dataset.it === 'dados'; }));
    antes = await p.evaluate(() => window.__prints);
    await item('PDF organizado'); await p.waitForFunction(n => window.__prints === n + 1, antes, { timeout: 8000 });
    const so = await p.evaluate(() => [...document.querySelectorAll('#prCentral h3')].map(h => h.textContent)); await p.evaluate(() => document.body.classList.remove('prCentral'));
    ok('com so "Dados do ensaio" marcado, o PDF so traz essa secao', so.length === 1 && so[0] === 'Dados do ensaio', so.join(' | '));
    [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), item('Markdown agrupado')]);
    t = fs.readFileSync(await dl.path(), 'utf8');
    ok('com so "Dados do ensaio" marcado, o Markdown so traz esse arquivo', /## ensaio\/dados_do_ensaio\.json/.test(t) && !/## logs\//.test(t) && !/## alertas\//.test(t));
    // ---- nada marcado ----
    await p.evaluate(() => document.querySelectorAll('#dlgCentral input[data-it]').forEach(c => { c.checked = false; }));
    antes = await p.evaluate(() => window.__prints); let baixou = false; p.once('download', () => { baixou = true; });
    await item('PDF organizado'); await p.waitForTimeout(500); const m1 = await p.evaluate(() => document.getElementById('cenSt').textContent);
    await item('Markdown agrupado'); await p.waitForTimeout(500);
    ok('nada marcado: PDF e Markdown avisam "Marque pelo menos um item", sem imprimir nem baixar', /Marque pelo menos um item/.test(m1) && (await p.evaluate(() => window.__prints)) === antes && !baixou, m1);
    // ---- Salvar selecionados (Downloads) continua igual ----
    await p.evaluate(() => { document.querySelectorAll('#dlgCentral input[data-it]').forEach(c => { c.checked = c.dataset.it === 'monit'; }); document.querySelector('#cenDest input[value="down"]').checked = true; });
    [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), p.click('#cenSalva')]);
    ok('Salvar selecionados (Downloads) continua baixando o agrupado .md', /^bt2_registros_ensaio_.*_agrupado\.md$/.test(dl.suggestedFilename()));
    ok('sem erro de JavaScript na pagina', erros.length === 0, erros.join(' | '));
    await ctx.close();
  }
  await b.close(); const f = R.filter(x => !x).length; console.log('\n' + (R.length - f) + ' ok, ' + f + ' falha(s)'); process.exit(f ? 1 : 0);
})();
