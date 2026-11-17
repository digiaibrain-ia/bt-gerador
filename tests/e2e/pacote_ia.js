// Teste do menu de botao direito + "Pacote para a IA" (medidor 1.10.164).
// Uso: servir a pasta de teste na porta 8790 (medidor + link para dashboard/vendor/tesseract) e rodar
//   NODE_PATH=$(npm root -g) node tests/e2e/pacote_ia.js
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const URL = 'http://localhost:8790/' + (process.env.MEDIDOR || 'medidor_gerador_v1.10.164.html');
const R = []; const ok = (n, c, d) => { R.push({ n, ok: !!c, d: d || '' }); console.log((c ? 'OK   ' : 'FALHA') + ' ' + n + (d ? ' — ' + d : '')); };
(async () => {
  const b = await chromium.launch();
  for (const [nome, vp, mobile] of [['desktop 1280', { width: 1280, height: 800 }, false], ['celular 390', { width: 390, height: 844 }, true], ['celular 360', { width: 360, height: 800 }, true]]) {
    console.log('\n## ' + nome);
    const ctx = await b.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
    const p = await ctx.newPage(); const erros = []; p.on('pageerror', e => erros.push(e.message));
    p.on('dialog', d => d.accept(d.type() === 'prompt' ? 'mwm' : undefined));
    await p.route('**/api/**', r => r.fulfill({ status: 503, contentType: 'application/json', body: '{"ok":false}' }));
    await p.goto(URL); await p.waitForTimeout(1800);
    // 1) botao direito num objeto abre o menu dentro da tela
    const alvo = await p.evaluate(() => { const vis = [...document.querySelectorAll('button')].filter(x => { const r = x.getBoundingClientRect(); return r.width > 10 && r.height > 10 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && getComputedStyle(x).visibility !== 'hidden'; }); const e = vis[0]; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await p.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); e.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: x, clientY: y })); }, alvo);
    await p.waitForTimeout(300);
    const menu = await p.evaluate(() => { const m = document.querySelector('.pia-menu'); if (!m) return null; const r = m.getBoundingClientRect(); return { itens: [...m.querySelectorAll('button')].map(x => x.textContent.trim()), dentro: r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight, native: false }; });
    ok('menu abre no botao direito', menu && menu.itens.length === 5, menu && menu.itens.join(' | '));
    ok('menu fica dentro da tela', menu && menu.dentro);
    ok('menu NAO tem comando de chave/banco/gerador', menu && !menu.itens.some(t => /ligar|desligar|parar|stop|aplicar/i.test(t)));
    // 2) capturar: arma, faixa visivel, arrasta area
    await p.click('.pia-menu button:has-text("Capturar para a IA")'); await p.waitForTimeout(300);
    ok('captura armada mostra a faixa', await p.evaluate(() => !!document.querySelector('.pia-faixa') && !!document.querySelector('.pia-over')));
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok('Esc desarma a captura', await p.evaluate(() => !document.querySelector('.pia-over')));
    await p.evaluate(() => window.PACOTE_IA.arma()); await p.waitForTimeout(200);
    const W = vp.width, H = vp.height;
    await p.mouse.move(10, 60); await p.mouse.down(); await p.mouse.move(W * 0.6, H * 0.5, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(600);
    const est = await p.evaluate(() => { const d = document.getElementById('piaDlg'); if (!d || !d.open) return null;
      const ord = ['piaImgs', 'piaObjs', 'piaCtx', 'piaQ'].map(id => document.getElementById(id).getBoundingClientRect().top);
      const x = d.querySelector('.pia-x').getBoundingClientRect(), dr = d.getBoundingClientRect(), foot = d.querySelector('.pia-foot').getBoundingClientRect();
      return { ord, xDentro: x.right <= innerWidth && x.left >= 0, footVisivel: foot.bottom <= innerHeight + 1, dlgW: Math.round(dr.width), dlgH: Math.round(dr.height), nObj: document.querySelectorAll('#piaObjs li').length, ctx: document.querySelectorAll('#piaCtx label').length, senha: /senha oculto/.test(document.getElementById('piaPrev').textContent) }; });
    ok('janela do pacote abre apos arrastar', !!est);
    ok('ordem: imagens, objetos, contexto, pergunta (de cima para baixo)', est && est.ord[0] < est.ord[1] && est.ord[1] < est.ord[2] && est.ord[2] < est.ord[3], est && est.ord.map(Math.round).join('<'));
    ok('captura listou objetos da area', est && est.nObj > 0, est && est.nObj + ' objetos, ' + est.ctx + ' itens de contexto');
    ok('botao ✕ visivel e botoes do rodape dentro da tela', est && est.xDentro && est.footVisivel);
    if (mobile) ok('no celular a janela ocupa quase toda a tela (>=97 %)', est && est.dlgW >= vp.width * 0.97 && est.dlgH >= vp.height * 0.97, est && est.dlgW + 'x' + est.dlgH);
    // 3) pergunta + estimativa + prévia
    await p.fill('#piaQ', 'Mova este botao 10 px para a direita e troque o texto.');
    const tok = await p.textContent('#piaTok'); ok('estimativa de tokens aparece', /tokens/.test(tok), tok);
    ok('pergunta entra na previa', (await p.textContent('#piaPrev')).includes('Mova este botao'));
    // 4) desmarcar um objeto reduz o pacote
    const antes = (await p.textContent('#piaPrev')).length; await p.click('#piaObjs li input >> nth=0'); const depois = (await p.textContent('#piaPrev')).length; ok('desmarcar objeto reduz o pacote', depois < antes, antes + ' -> ' + depois);
    // 5) imagem: anexar + OCR
    const png = path.join(__dirname, 'amostra_ocr.png');
    if (!fs.existsSync(png)) { const sc = await p.screenshot({ clip: { x: 0, y: 0, width: Math.min(400, W), height: 160 } }); fs.writeFileSync(png, sc); }
    await p.setInputFiles('#piaFile', png); await p.waitForTimeout(400);
    ok('imagem anexada aparece com legenda e OCR', await p.evaluate(() => document.querySelectorAll('.pia-img').length === 1));
    await p.fill('.pia-img input[type=text]', 'referencia: topo da tela');
    if (nome === 'desktop 1280') { await p.click('[data-ocr="0"]'); await p.waitForFunction(() => { const t = document.querySelector('.pia-img textarea'); return t && t.value.length > 3; }, null, { timeout: 90000 }).catch(() => {}); const o = await p.inputValue('.pia-img textarea'); ok('OCR (Tesseract local) devolveu texto', o.length > 3, o.replace(/\s+/g, ' ').slice(0, 60)); }
    // 6) salvar .md e .json
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 8000 }), p.click('#piaMd')]); const nomeMd = dl.suggestedFilename(); const conteudo = fs.readFileSync(await dl.path(), 'utf8');
    ok('Salvar .md gera arquivo com pergunta, contexto e objetos', /\.md$/.test(nomeMd) && /Pergunta/.test(conteudo) && /Contexto/.test(conteudo) && /Objetos/.test(conteudo), nomeMd);
    ok('imagem vai com legenda no pacote', /referencia: topo da tela/.test(conteudo));
    ok('aviso para anexar o print quando o problema e visual', /VISUAL/.test(await p.textContent('#piaBody')));
    // 7) copiar e fechar (com area de transferencia)
    await p.click('#piaCopiar'); await p.waitForTimeout(600);
    ok('Copiar fecha a janela', await p.evaluate(() => !document.getElementById('piaDlg').open));
    const clip = await p.evaluate(() => navigator.clipboard.readText().catch(() => '')); ok('area de transferencia recebeu o pacote', /Pergunta/.test(clip) && /Mova este botao/.test(clip), clip.length + ' caracteres');
    // 8) plano B: sem navigator.clipboard (pagina http no PC)
    await p.evaluate(() => window.PACOTE_IA.abre(null, [])); await p.fill('#piaQ', 'teste do plano B');
    await p.evaluate(() => { Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }); });
    await p.click('#piaCopiar'); await p.waitForTimeout(500);
    ok('plano B (sem clipboard) fecha ou seleciona a previa', await p.evaluate(() => !document.getElementById('piaDlg').open || /selecionada|copiar/i.test(document.getElementById('piaAviso').textContent)));
    // 9) Fechar pergunta antes de descartar
    await p.evaluate(() => window.PACOTE_IA.abre(null, [])); await p.fill('#piaQ', 'nao perder'); let conf = 0; p.removeAllListeners('dialog'); p.on('dialog', d => { conf++; d.dismiss(); });
    await p.click('#piaFechar'); ok('Fechar com texto escrito pede confirmacao e Cancelar mantem aberta', conf === 1 && await p.evaluate(() => document.getElementById('piaDlg').open));
    p.removeAllListeners('dialog'); p.on('dialog', d => d.accept()); await p.click('#piaFechar'); ok('Fechar confirmado fecha', await p.evaluate(() => !document.getElementById('piaDlg').open));
    // 10) campo de texto mantem o menu do navegador
    const nativo = await p.evaluate(() => { const i = document.createElement('input'); i.type = 'text'; document.body.appendChild(i); const ev = new MouseEvent('contextmenu', { bubbles: true, cancelable: true }); i.dispatchEvent(ev); const r = ev.defaultPrevented; i.remove(); return r; });
    ok('em campo de texto o menu do navegador NAO e bloqueado', nativo === false);
    ok('nenhum erro de JavaScript', erros.length === 0, erros.slice(0, 2).join(' | '));
    await ctx.close();
  }
  await b.close();
  const f = R.filter(r => !r.ok); console.log('\nTOTAL ' + R.length + ' · FALHAS ' + f.length); process.exit(f.length ? 1 : 0);
})();
