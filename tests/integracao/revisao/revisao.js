'use strict';
// REVISAO UNIVERSAL DE UI (harness) - aciona, com MOUSE/TOQUE de verdade, todos os objetos interativos visiveis de uma pagina HTML e confere invariantes:
// alcancavel (nada cobre o objeto), toda janela abre/fecha/reabre/move, janela com titulo e fechar visiveis, sem erro JS/console, sem rolagem horizontal, alvo de toque.
// Perfis: desktop 1280x800 e Poco X6 Pro (aprox.: 1220x2712 px; viewport CSS nao confirmado -> duas hipoteses A e B). Pagina servida por um servidor local (sem rede externa).
// Uso: node revisao.js --paginas medidor,grafico --perfis desktop,pocoA --saida <pasta> [--demo] [--max 400] [--prof 2]
// NAO e a prova do PLC/DSE; e a revisao de interface. Saida: achados.json + RESUMO.md + cobertura (acionados x total, e por que o resto nao foi).
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RAIZ = path.join(__dirname, '..', '..', '..');
const PASTAS = [path.join(RAIZ, 'dashboard', 'ferramentas'), path.join(RAIZ, 'dashboard', 'modulos-fonte'), path.join(RAIZ, 'docs', 'bt2', 'arquitetura'), path.join(RAIZ, 'catalogo')];
const PAGINAS = {
  medidor: 'medidor_gerador_v1.10.190.html', grafico: 'grafico_ensaio_v0.12.html', maquete: 'maquete_layout_v0.5.html', mapa: 'mapa_fbs_v0.16.html',
  gerenciador: 'gerenciador_logs_v1.8.html', amostras: 'amostras_simulador_v0.7.html', apicards: 'api_cards_visor_v0.4.html', index: 'index.html',
  arquitetura: 'arquitetura_bt2_v0.5_editavel.html',
};
const UA_POCO = 'Mozilla/5.0 (Linux; Android 14; 23122PC0G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';
const PERFIS = {
  desktop: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  pocoA: { viewport: { width: 407, height: 904 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA_POCO },
  pocoB: { viewport: { width: 444, height: 986 }, deviceScaleFactor: 2.75, isMobile: true, hasTouch: true, userAgent: UA_POCO },
  notebook: { viewport: { width: 1536, height: 694 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },   // 11/11/2026: tela do notebook do Reginaldo (LL-047)
};
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true) : d; };
const MAX = +arg('max', 600), PROF = +arg('prof', 2), SAIDA = arg('saida', path.join(RAIZ, 'tests', 'integracao', 'revisao', 'saida'));
const SO_PAGINAS = String(arg('paginas', Object.keys(PAGINAS).join(','))).split(','), SO_PERFIS = String(arg('perfis', 'desktop,pocoA')).split(','), DEMO = !!arg('demo', false);

function servidor() {
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      const u = decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
      if (u.startsWith('api/')) { r.writeHead(503, { 'Content-Type': 'application/json' }); return r.end('{"ok":false,"erro":"sem backend (revisao)"}'); }
      if (q.method !== 'GET' && q.method !== 'HEAD') { r.writeHead(501); return r.end(); }
      for (const p of PASTAS) { const f = path.join(p, path.basename(u)); if (fs.existsSync(f) && fs.statSync(f).isFile()) { const ext = path.extname(f); r.writeHead(200, { 'Content-Type': ext === '.html' ? 'text/html; charset=utf-8' : ext === '.js' ? 'text/javascript' : ext === '.csv' ? 'text/csv' : 'application/octet-stream' }); return r.end(fs.readFileSync(f)); } }
      r.writeHead(404); r.end('nao achei');
    }).listen(0, '127.0.0.1', () => res(s));
  });
}

const STUBS = () => {
  window.__rev = { prints: 0, opens: [], alerts: [], confirms: [], prompts: [], pickers: [] };
  window.print = () => { window.__rev.prints++; };
  window.open = u => { window.__rev.opens.push(String(u)); return null; };
  window.alert = m => { window.__rev.alerts.push(String(m)); };
  window.confirm = m => { window.__rev.confirms.push(String(m)); return true; };
  window.prompt = (m, d) => { window.__rev.prompts.push(String(m)); return d || ''; };
  for (const k of ['showDirectoryPicker', 'showOpenFilePicker', 'showSaveFilePicker']) window[k] = async () => { window.__rev.pickers.push(k); throw new DOMException('cancelado', 'AbortError'); };
};

// ---------- funcoes executadas DENTRO da pagina ----------
const ENUM = () => {
  const sel = 'button,summary,input:not([type=hidden]),select,textarea,a[href],[role=button],[role=tab],.tile[data-i]';
  let n = window.__revN || 0; const out = [];
  document.querySelectorAll(sel).forEach(el => {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || r.width <= 0 || r.height <= 0) return;
    const dlg = el.closest('dialog'); if (dlg && !dlg.open) return;
    { const dt = el.closest('details'); if (dt && !dt.open && !el.closest('summary')) return; }   // dentro de <details> fechado: ninguem ve nem clica (o Chrome mantem o tamanho da caixa)
    if (!el.dataset.rev) el.dataset.rev = String(++n);
    const nome = (el.getAttribute('aria-label') || el.title || el.textContent || el.value || el.placeholder || el.id || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    out.push({ rev: el.dataset.rev, tag: el.tagName.toLowerCase(), tipo: el.type || '', id: el.id || '', nome, w: Math.round(r.width), h: Math.round(r.height), dlg: dlg ? dlg.id : '', off: !!el.disabled, semNome: !(el.getAttribute('aria-label') || el.title || (el.textContent || '').trim() || el.value || el.placeholder) });
  });
  window.__revN = n; return out;
};
const SONDA = rev => {
  const el = document.querySelector('[data-rev="' + rev + '"]'); if (!el) return { existe: false };
  el.scrollIntoView({ block: 'center', inline: 'center' });
  const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  const dentro = x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight;
  const top = dentro ? document.elementFromPoint(x, y) : null;
  const ok = !!top && (top === el || el.contains(top) || top.contains(el) || (el.labels && [...el.labels].some(l => l === top || l.contains(top))) || !!el.closest('label') && el.closest('label').contains(top));
  return { existe: true, x, y, w: r.width, h: r.height, dentro, ok, coberto: ok ? '' : (top ? top.tagName.toLowerCase() + (top.id ? '#' + top.id : '') + (top.className && typeof top.className === 'string' ? '.' + top.className.split(' ')[0] : '') + ' em (' + Math.round(x) + ',' + Math.round(y) + ') rect=' + [Math.round(top.getBoundingClientRect().left), Math.round(top.getBoundingClientRect().top), Math.round(top.getBoundingClientRect().width), Math.round(top.getBoundingClientRect().height)] + ' pos=' + getComputedStyle(top).position + ' z=' + getComputedStyle(top).zIndex + ' dlgPai=' + (top.closest('dialog') ? top.closest('dialog').id : '-') + ' scrollY=' + Math.round(scrollY) + ' obj=' + [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] + ' dlg(scrollTop/scrollH/clientH)=' + (el.closest('dialog') ? [el.closest('dialog').scrollTop, el.closest('dialog').scrollHeight, el.closest('dialog').clientHeight] : '-') : 'fora da tela') };
};
const ESTADO = () => ({
  dialogs: [...document.querySelectorAll('dialog[open]')].map(d => d.id || '(sem id)'),
  pops: [...document.querySelectorAll('[popover]')].filter(e => { try { return e.matches(':popover-open'); } catch (x) { return false; } }).map(e => e.id || e.className),
  overflowX: document.documentElement.scrollWidth > innerWidth + 1, scrollW: document.documentElement.scrollWidth, vw: innerWidth,
  url: location.href, hash: location.hash,
});
const GEOM = id => {
  const d = document.getElementById(id); if (!d) return null; const r = d.getBoundingClientRect();
  const hd = d.querySelector('.jt,header,.pia-top,h1,h2,h3') || d, hr = hd.getBoundingClientRect();
  const fx = d.querySelector('[data-fecha],.jx,.dlgx,button[aria-label="Fechar"]'), fr = fx ? fx.getBoundingClientRect() : null;
  const visivel = rr => !!rr && rr.width > 0 && rr.left >= -1 && rr.top >= -1 && rr.right <= innerWidth + 1 && rr.bottom <= innerHeight + 1;
  const cx = hr.left + Math.min(hr.width / 2, 60), cy = hr.top + hr.height / 2, top = document.elementFromPoint(Math.max(0, Math.min(innerWidth - 1, cx)), Math.max(0, Math.min(innerHeight - 1, cy)));
  return { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), tituloVisivel: visivel(hr), fecharVisivel: fx ? visivel(fr) : null, temFechar: !!fx, topo: !!top && !!top.closest && top.closest('dialog') === d, cabeNaLargura: r.width <= innerWidth + 1 };
};
const FECHA_TUDO = () => { document.querySelectorAll('dialog[open]').forEach(d => { if (d.id !== 'dlgGuiado') { try { d.close(); } catch (e) { } } }); document.querySelectorAll('[popover]').forEach(e => { try { if (e.matches(':popover-open')) e.hidePopover(); } catch (x) { } }); };

async function rodaPagina(browser, base, nomePag, perfNome, demo, log) {
  const perf = PERFIS[perfNome], ach = [], cob = { total: 0, acionados: 0, naoAcionados: [] };
  const ctx = await browser.newContext(Object.assign({}, perf, { acceptDownloads: false }));
  await ctx.addInitScript(STUBS);
  const page = await ctx.newPage();
  const erros = [];
  const achado = (tipo, sev, objeto, detalhe) => { const k = tipo + '|' + objeto; if (!ach.some(a => a.k === k)) ach.push({ k, pagina: nomePag, perfil: perfNome + (demo ? '+demo' : ''), tipo, sev, objeto, detalhe }); };
  page.on('pageerror', e => { erros.push('JS: ' + e.message); });
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) erros.push('console: ' + m.text().slice(0, 140)); });
  page.on('response', r => { if (r.status() >= 400 && !/\/api\//.test(r.url())) erros.push('HTTP ' + r.status() + ' ' + r.url().replace(base, '')); });
  const flush = (ctxo) => { while (erros.length) { const e = erros.shift(); if (/^HTTP/.test(e) && ctxo !== 'carga') continue;   // 404 apos a carga vem de enderecos digitados pelo harness (ex.: campo da URL da API), nao de recurso da pagina
      achado(/^JS:/.test(e) ? 'erro_js' : /^HTTP/.test(e) ? 'recurso_faltando' : 'console_erro', /^HTTP/.test(e) ? 'media' : 'alta', ctxo, e); } };
  await page.goto(base + '/' + PAGINAS[nomePag], { waitUntil: 'load' }); await page.waitForTimeout(1800);
  if (demo && nomePag === 'medidor') { await page.evaluate(() => { try { const d = document.getElementById('demo'); if (d) { d.checked = true; d.dispatchEvent(new Event('change', { bubbles: true })); } } catch (e) { } }); await page.waitForTimeout(1200); }
  flush('carga');
  const est0 = await page.evaluate(ESTADO);
  if (est0.overflowX) achado('overflow_x', 'media', 'pagina', 'rolagem horizontal da pagina: ' + est0.scrollW + ' > ' + est0.vw);
  const vistos = new Map(); let acoes = 0;
  const tocar = async (x, y) => { if (perf.hasTouch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); };
  const arrasta = async (hdr, dx, dy) => {
    if (!perf.hasTouch) { await page.mouse.move(hdr.x, hdr.y); await page.mouse.down(); await page.mouse.move(hdr.x + dx, hdr.y + dy, { steps: 6 }); await page.mouse.up(); return; }
    const c = await ctx.newCDPSession(page); const pt = (x, y) => ({ x, y, id: 1 });
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pt(hdr.x, hdr.y)] });
    for (let i = 1; i <= 6; i++) await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [pt(hdr.x + dx * i / 6, hdr.y + dy * i / 6)] });
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  };

  async function testaJanela(id, gatilho, prof) {
    const g = await page.evaluate(GEOM, id); if (!g) return;
    const obj = 'dialog#' + id;
    if (!g.tituloVisivel) achado('janela_titulo_fora_da_tela', 'alta', obj, 'a barra de titulo nao esta inteira dentro da tela: ' + JSON.stringify(g));
    if (g.temFechar && g.fecharVisivel === false) achado('janela_fechar_fora_da_tela', 'alta', obj, 'o botao fechar fica fora da tela: ' + JSON.stringify(g));
    if (!g.temFechar) achado('janela_sem_fechar', 'media', obj, 'sem botao fechar identificavel (data-fecha/.jx)');
    if (!g.topo) achado('janela_coberta', 'alta', obj, 'a barra de titulo esta COBERTA por outro elemento');
    if (!g.cabeNaLargura) achado('janela_mais_larga_que_a_tela', 'media', obj, 'largura ' + g.w + ' > tela');
    // mover (so uma vez por janela e perfil)
    const kmv = 'mv|' + id; if (!vistos.has(kmv)) {
      vistos.set(kmv, 1);
      const hdr = await page.evaluate(i => { const d = document.getElementById(i); const h = d.querySelector('.jt,.pia-top,header') || d; const t = [...h.querySelectorAll('span,b,h1,h2,h3,strong')].find(e => e.getBoundingClientRect().width > 8 && !e.closest('button')) || h; const r = t.getBoundingClientRect(); return { x: r.left + Math.min(r.width / 2, 40), y: r.top + r.height / 2, tem: !!d.querySelector('.jt,.pia-top') }; }, id);   // comeca o arrasto no TEXTO do titulo (um botao nao arrasta, por projeto)
      const cabeTudo = g && g.w >= 0.9 * perf.viewport.width && g.h >= 0.9 * perf.viewport.height;   // janela do tamanho da tela: nao ha para onde mover (regra de projeto: janela inteira na tela)
      if (hdr.tem && !cabeTudo) {
        await arrasta(hdr, 90, 60); await page.waitForTimeout(150);
        const g2 = await page.evaluate(GEOM, id);
        if (g2 && Math.abs(g2.l - g.l) < 20 && Math.abs(g2.t - g.t) < 20) achado('janela_nao_move', 'media', obj, 'arrastar a barra de titulo (' + (perf.hasTouch ? 'toque' : 'mouse') + ') nao moveu: ' + g.l + ',' + g.t + ' -> ' + g2.l + ',' + g2.t);
      }
    }
    // explorar dentro (1 nivel) antes de fechar
    if (prof < PROF) await explora('dialog#' + id + ' ', prof + 1, id, gatilho);
    // fechar
    const aindaAberta = () => page.evaluate(i => { const d = document.getElementById(i); return !!d && d.open; }, id);
    const fx = await page.evaluate(i => { const d = document.getElementById(i); const f = d.querySelector('[data-fecha],.jx,.dlgx,button[aria-label="Fechar"]'); if (!f) return null; f.scrollIntoView({ block: 'nearest' }); const r = f.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, id);
    let fechou = false;
    if (fx) { await tocar(fx.x, fx.y); await page.waitForTimeout(200); fechou = !(await aindaAberta()); }
    if (!fechou) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); const porEsc = !(await aindaAberta()); if (porEsc && fx) achado('janela_fechar_nao_responde', 'alta', obj, 'o clique no botao fechar nao fechou a janela (so o Esc fechou)'); fechou = porEsc; }
    if (!fechou) { achado('janela_nao_fecha', 'alta', obj, 'nem o botao fechar nem o Esc fecharam a janela'); await page.evaluate(FECHA_TUDO); }
    // reabrir pelo mesmo gatilho
    if (gatilho && fechou) { const s = await page.evaluate(SONDA, gatilho); if (s.existe && s.ok) { await tocar(s.x, s.y); await page.waitForTimeout(250); const reabriu = await page.evaluate(i => { const d = document.getElementById(i); return !!d && d.open; }, id); if (!reabriu) achado('janela_nao_reabre', 'media', obj, 'depois de fechada nao reabriu pelo mesmo botao'); await page.evaluate(FECHA_TUDO); } }
  }

  async function explora(escopo, prof, dlgId, gatilho) {
    const lista = (await page.evaluate(ENUM)).filter(d => (dlgId ? d.dlg === dlgId : true));
    for (const d of lista) {
      if (acoes >= MAX) return;
      if (dlgId) {   // a janela pode ter fechado por um botao legitimo (Cancelar/Aplicar): reabre pelo mesmo gatilho para seguir explorando
        let aberta = await page.evaluate(i => { const x = document.getElementById(i); return !!x && x.open; }, dlgId);
        if (!aberta && gatilho) { const sg = await page.evaluate(SONDA, gatilho); if (sg.existe && sg.ok) { await tocar(sg.x, sg.y); await page.waitForTimeout(250); aberta = await page.evaluate(i => { const x = document.getElementById(i); return !!x && x.open; }, dlgId); } }
        if (!aberta) { cob.naoAcionados.push('[' + dlgId + '] restante da janela [a janela fechou e nao reabriu]'); return; }
        if (d.rev && (await page.evaluate(r => { const e = document.querySelector('[data-rev="' + r + '"]'); return !!e && !!e.closest('[data-fecha],.jx,.dlgx,button[aria-label="Fechar"]') || (e && e.matches('[data-fecha],.jx,.dlgx,button[aria-label="Fechar"]')); }, d.rev))) { continue; }   // o botao fechar e testado em testaJanela
      }
      const chave = nomePag + '|' + perfNome + '|' + d.dlg + '|' + d.tag + '|' + d.tipo + '|' + d.id + '|' + d.nome;
      const rep = vistos.get(chave) || 0; if (rep >= 2) continue; vistos.set(chave, rep + 1);
      cob.total++;
      const objeto = (d.dlg ? '[' + d.dlg + '] ' : '') + d.tag + (d.id ? '#' + d.id : '') + ' "' + d.nome + '"';
      if (d.semNome) achado('sem_nome_acessivel', 'baixa', objeto, 'botao/controle sem texto, title nem aria-label');
      if (perf.hasTouch && Math.min(d.w, d.h) < 44) achado(Math.min(d.w, d.h) < 20 ? 'alvo_toque_muito_pequeno' : 'alvo_toque_pequeno', Math.min(d.w, d.h) < 20 ? 'media' : 'baixa', objeto, d.w + 'x' + d.h + ' px (minimo recomendado 44)');
      if (d.off) { cob.naoAcionados.push(objeto + ' [desabilitado]'); continue; }
      const s = await page.evaluate(SONDA, d.rev);
      if (!s.existe || s.w <= 0 || s.h <= 0) { cob.naoAcionados.push(objeto + ' [sumiu]'); continue; }
      if (!s.dentro) { achado('fora_da_tela_inalcancavel', 'alta', objeto, 'mesmo rolando, o centro do objeto fica fora da tela: centro em (' + Math.round(s.x) + ',' + Math.round(s.y) + ') tamanho ' + Math.round(s.w) + 'x' + Math.round(s.h) + ' tela ' + (await page.evaluate(() => innerWidth + 'x' + innerHeight)) + ' dialog=' + JSON.stringify(await page.evaluate(i => { const d = document.getElementById(i); if (!d) return null; const r = d.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round); }, d.dlg))); cob.naoAcionados.push(objeto + ' [fora da tela]'); continue; }
      if (!s.ok) { achado('coberto_por_outro', 'alta', objeto, 'o clique no centro cairia em: ' + s.coberto); cob.naoAcionados.push(objeto + ' [coberto por ' + s.coberto + ']'); continue; }
      const antes = await page.evaluate(ESTADO); acoes++; cob.acionados++;
      try {
        if (d.tag === 'input' && ['text', 'number', 'search', 'tel', 'email', ''].includes(d.tipo)) {
          const orig = await page.inputValue('[data-rev="' + d.rev + '"]').catch(() => '');
          for (const v of ['', '0', '-1', '999999', 'abc', '1e9', '9'.repeat(40), orig]) { await page.fill('[data-rev="' + d.rev + '"]', v, { timeout: 800 }).catch(() => { }); await page.dispatchEvent('[data-rev="' + d.rev + '"]', 'change').catch(() => { }); await page.waitForTimeout(40); }   // o ultimo valor devolve o original
        } else if (d.tag === 'input' && d.tipo === 'file') { cob.acionados--; cob.naoAcionados.push(objeto + ' [arquivo: nao simulado]'); }
        else if (d.tag === 'select') { const ops = await page.evaluate(r => [...document.querySelector('[data-rev="' + r + '"]').options].map(o => o.value), d.rev); for (const v of ops.slice(0, 12)) { await page.selectOption('[data-rev="' + d.rev + '"]', v, { timeout: 800 }).catch(() => { }); await page.waitForTimeout(40); } }
        else if (d.tag === 'input' && d.tipo === 'range') { for (const f of [0, 1, 0.5]) await page.evaluate(([r, f]) => { const e = document.querySelector('[data-rev="' + r + '"]'); e.value = +e.min + f * (+e.max - +e.min); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, [d.rev, f]); }
        else if (d.tag === 'input' && ['checkbox', 'radio'].includes(d.tipo)) { await tocar(s.x, s.y); await page.waitForTimeout(80); await tocar(s.x, s.y); }
        else { await tocar(s.x, s.y); }
      } catch (e) { achado('erro_ao_acionar', 'media', objeto, String(e.message).slice(0, 120)); }
      await page.waitForTimeout(130);
      flush(objeto);
      const dep = await page.evaluate(ESTADO);
      if (dep.url !== antes.url && dep.url.split('#')[0] !== antes.url.split('#')[0]) { cob.naoAcionados.push(objeto + ' [navegou para ' + dep.url.replace(base, '') + ']'); await page.goBack({ waitUntil: 'load' }).catch(() => { }); await page.waitForTimeout(800); continue; }
      if (dep.overflowX && !antes.overflowX) achado('overflow_x_apos_acao', 'media', objeto, 'a acao criou rolagem horizontal: ' + dep.scrollW + ' > ' + dep.vw);
      const novas = dep.dialogs.filter(x => !antes.dialogs.includes(x) && x !== '(sem id)');
      for (const id of novas.slice(0, 1)) await testaJanela(id, d.rev, prof);
      // limpa o que ficou aberto (popovers/menus) antes do proximo
      const resto = await page.evaluate(ESTADO); if (resto.pops.length || resto.dialogs.some(x => !antes.dialogs.includes(x))) { await page.keyboard.press('Escape'); await page.evaluate(FECHA_TUDO); await page.waitForTimeout(80); }
    }
  }
  try { await explora('', 0, ''); } catch (e) { achado('falha_do_harness', 'info', nomePag, String(e.stack || e).slice(0, 300)); }
  const final = await page.evaluate(() => ({ prints: window.__rev.prints, opens: window.__rev.opens.length, alerts: window.__rev.alerts.length, confirms: window.__rev.confirms.length, pickers: window.__rev.pickers.length })).catch(() => ({}));
  flush('final'); await ctx.close();
  log(nomePag + ' / ' + perfNome + (demo ? '+demo' : '') + ': ' + cob.acionados + ' acionados de ' + cob.total + ' | achados: ' + ach.length);
  return { pagina: nomePag, perfil: perfNome + (demo ? '+demo' : ''), cobertura: { total: cob.total, acionados: cob.acionados, naoAcionados: cob.naoAcionados }, efeitos: final, achados: ach.map(({ k, ...r }) => r) };
}

(async () => {
  fs.mkdirSync(SAIDA, { recursive: true });
  const srv = await servidor(), base = 'http://127.0.0.1:' + srv.address().port, browser = await chromium.launch();
  const out = []; const log = m => console.log(m);
  for (const p of SO_PAGINAS) for (const pf of SO_PERFIS) {
    if (!PAGINAS[p] || !PERFIS[pf]) continue;
    for (const demo of (p === 'medidor' && DEMO ? [false, true] : [false])) out.push(await rodaPagina(browser, base, p, pf, demo, log));
  }
  await browser.close(); srv.close();
  fs.writeFileSync(path.join(SAIDA, 'achados.json'), JSON.stringify(out, null, 1));
  const todos = out.flatMap(r => r.achados), cont = {}; todos.forEach(a => { const k = a.sev + ' ' + a.tipo; cont[k] = (cont[k] || 0) + 1; });
  const L = ['# Revisao universal de UI', '', 'Gerado em ' + new Date().toLocaleString('pt-BR'), '', '## Cobertura', '| pagina | perfil | acionados | total | nao acionados | achados |', '|---|---|---|---|---|---|'];
  out.forEach(r => L.push('| ' + r.pagina + ' | ' + r.perfil + ' | ' + r.cobertura.acionados + ' | ' + r.cobertura.total + ' | ' + r.cobertura.naoAcionados.length + ' | ' + r.achados.length + ' |'));
  L.push('', '## Achados por tipo', '| gravidade e tipo | qtd |', '|---|---|'); Object.entries(cont).sort().forEach(([k, v]) => L.push('| ' + k + ' | ' + v + ' |'));
  L.push('', '## Achados (alta e media)'); todos.filter(a => a.sev === 'alta' || a.sev === 'media').forEach(a => L.push('- **' + a.sev + '** ' + a.pagina + ' [' + a.perfil + '] `' + a.tipo + '` ' + a.objeto + ' — ' + a.detalhe));
  fs.writeFileSync(path.join(SAIDA, 'RESUMO.md'), L.join('\n'));
  console.log('\nSaida em ' + SAIDA + ' · achados: ' + todos.length + ' (alta ' + todos.filter(a => a.sev === 'alta').length + ')');
})();
