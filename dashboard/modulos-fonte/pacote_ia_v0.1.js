/* =====================================================================================
   pacote_ia_v0.1.js — "Pacote para a IA": menu de BOTÃO DIREITO / TOQUE LONGO + captura de área + pacote em texto — v0.1 (03/11/2026)
   -------------------------------------------------------------------------------------
   O QUE É (leigo): botão direito (ou toque longo no celular) abre um menu. "Capturar para a IA" arma a captura: você arrasta um retângulo sobre a tela
   e abre uma janela com (nesta ordem) imagens, objetos da área, contexto, a sua pergunta e os botões. O pacote sai em texto (Markdown ou JSON) para
   você colar ou anexar na conversa com a IA. Gasta menos que um print quando o assunto é texto/posição/estado; para problema VISUAL anexe o print também.
   POR QUÊ (técnico): o medidor já conhece cada objeto (id, classe, texto, posição, estado); descrever isso em texto é mais preciso e mais barato do que
   pedir à IA que "adivinhe" o objeto numa imagem. O OCR (Tesseract local) só entra para imagens que vêm de fora (ex.: print do SAP, figura de referência).
   O QUE NÃO FAZ: não comanda nada (ligar/desligar/parar NUNCA ficam no menu), não envia nada sozinho (você vê a prévia e decide), não captura campo de senha,
   não substitui nenhuma função que já existe (botões, popups, ⤢ de tamanho e Alt+I continuam iguais; o menu só aponta para elas).
   ESTIMATIVA DE TOKENS: ~3,5 caracteres por token em português — é ESTIMATIVA, não medida real.
   ===================================================================================== */
(function (raiz) {
  'use strict';
  const D = raiz.document, $ = id => D.getElementById(id);
  const VER = '0.1';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const temPop = typeof HTMLElement !== 'undefined' && HTMLElement.prototype.hasOwnProperty('popover');
  const MAX_OBJ = 60;                     // limite de objetos por captura (evita pacote gigante)
  const LIM_ARMADO_MS = 60000;            // a captura armada desarma sozinha
  const ERROS = [];                       // últimos erros de JavaScript vistos depois que este módulo iniciou
  raiz.addEventListener('error', e => { ERROS.push((e.message || 'erro') + ' @' + String(e.filename || '').split('/').pop() + ':' + (e.lineno || '')); if (ERROS.length > 10) ERROS.shift(); });

  /* ---------------------------------- estilo ---------------------------------- */
  const css = D.createElement('style');
  css.textContent = `
  .pia-menu,.pia-faixa,.pia-over{margin:0;padding:0;border:0;background:none;overflow:visible}
  .pia-menu{position:fixed;min-width:210px;background:#fff;color:#1b2a3a;border:1px solid #9aa6b5;box-shadow:0 6px 22px rgba(0,0,0,.28);font:13px/1.2 system-ui,sans-serif;padding:4px 0;border-radius:6px;z-index:2147483000}
  .pia-menu button{display:block;width:100%;text-align:left;background:none;border:0;padding:9px 14px;font:inherit;color:inherit;cursor:pointer;min-height:36px}
  .pia-menu button:hover:not(:disabled),.pia-menu button:focus-visible{background:#e8f1fb;outline:none}
  .pia-menu button:disabled{opacity:.45;cursor:not-allowed}
  .pia-menu hr{border:0;border-top:1px solid #d7dde5;margin:4px 0}
  .pia-faixa{position:fixed;left:8px;top:8px;width:calc(100vw - 16px);box-sizing:border-box;background:#0f3b63;color:#fff;font:13px/1.3 system-ui,sans-serif;padding:8px 12px;border-radius:6px;display:flex;gap:10px;align-items:center;z-index:2147483001;box-shadow:0 4px 14px rgba(0,0,0,.3)}
  .pia-faixa b{flex:1}
  .pia-faixa button{background:#fff;color:#0f3b63;border:0;border-radius:4px;padding:6px 12px;font:inherit;font-weight:700;cursor:pointer}
  .pia-over{position:fixed;left:0;top:0;width:100vw;height:100vh;height:100dvh;cursor:crosshair;touch-action:none;background:rgba(15,59,99,.06);z-index:2147482999}   /* popover tem width/height 'fit-content' por padrão: tamanho explícito */
  .pia-ret{position:fixed;border:2px dashed #d92d20;background:rgba(217,45,32,.10);pointer-events:none}
  dialog.pia{padding:0;border:2px solid #1a4a78;background:#f2f5f9;color:#1b2a3a;font:13px/1.35 system-ui,sans-serif;width:min(880px,96vw);max-height:94vh;margin:auto;overflow:hidden}
  dialog.pia[open]{display:flex;flex-direction:column}
  .pia-top{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#1a4a78;color:#fff;padding:9px 12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:13px}
  .pia-x{flex:0 0 28px;width:28px;height:26px;border:1px solid #fff;background:transparent;color:#fff;font-size:14px;line-height:1;padding:0;cursor:pointer}
  .pia-body{flex:1 1 auto;overflow:auto;padding:10px 12px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
  .pia-body h4{margin:12px 0 6px;font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:#40526a;border-bottom:1px solid #c9d1db;padding-bottom:3px}
  .pia-body h4:first-child{margin-top:0}
  .pia-body small{color:#5b6672}
  .pia-imgs{display:flex;flex-wrap:wrap;gap:8px}
  .pia-img{border:1px solid #c9d1db;background:#fff;padding:6px;width:100%;max-width:300px}
  .pia-img img{max-width:100%;max-height:140px;display:block;margin:0 auto 6px}
  .pia-img input[type=text]{width:100%;box-sizing:border-box;margin-bottom:4px;font:inherit}
  .pia-img textarea{width:100%;box-sizing:border-box;height:56px;font:12px/1.3 ui-monospace,monospace}
  .pia-body .bt,.pia-foot .bt{border:1px solid #1a4a78;background:#fff;color:#1a4a78;border-radius:5px;padding:8px 12px;font:inherit;font-weight:700;cursor:pointer;min-height:36px}
  .pia-foot .bt.p{background:#1a4a78;color:#fff}
  .pia-lista{margin:0;padding:0;list-style:none}
  .pia-lista li{display:flex;gap:6px;align-items:flex-start;padding:4px 0;border-bottom:1px solid #e3e7ec;font-size:12px}
  .pia-lista code{font-size:11.5px;word-break:break-all}
  .pia-ctx label{display:flex;gap:6px;align-items:flex-start;padding:3px 0;font-size:12.5px}
  .pia-q textarea{width:100%;box-sizing:border-box;min-height:96px;font:14px/1.35 system-ui,sans-serif;padding:8px;border:1px solid #9aa6b5}
  .pia-prev pre{white-space:pre-wrap;word-break:break-word;background:#fff;border:1px solid #c9d1db;padding:8px;max-height:220px;overflow:auto;font:11.5px/1.35 ui-monospace,monospace}
  .pia-foot{flex:0 0 auto;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:8px 12px;background:#e6ebf2;border-top:1px solid #c9d1db}
  .pia-foot .tok{flex:1 1 100%;font-size:12px;color:#40526a}
  .pia-aviso{font-size:12px;color:#8a1c15}
  @media (max-width:760px){
    dialog.pia{width:100vw;max-width:100vw;height:var(--pia-h,100dvh);max-height:none;margin:0;border-width:0;position:fixed;inset:0}
    .pia-img{max-width:none}
    /* rodapé compacto no celular: "Copiar e fechar" em linha própria e os 3 outros lado a lado (antes ocupava ~25 % da tela) */
    .pia-foot{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:6px 10px}
    .pia-foot .tok{grid-column:1/-1;font-size:11px;line-height:1.25}
    .pia-foot #piaCopiar{grid-column:1/-1}
    .pia-foot .bt{padding:7px 4px;font-size:12.5px;min-height:34px}
    .pia-foot .pia-aviso{grid-column:1/-1}
  }`;
  D.head.appendChild(css);

  /* ------------------------------- peças flutuantes -------------------------------- */
  function cria(tag, classe) { const e = D.createElement(tag); e.className = classe; if (temPop) e.setAttribute('popover', 'manual'); D.body.appendChild(e); return e; }
  const abre = e => { if (temPop) { try { if (!e.matches(':popover-open')) e.showPopover(); } catch (x) {} } else e.style.display = 'block'; };
  const fecha = e => { if (!e) return; if (temPop) { try { e.hidePopover(); } catch (x) {} } else e.style.display = 'none'; };

  /* --------------------------- descrição de um objeto da tela --------------------------- */
  const ehSenha = e => e.tagName === 'INPUT' && /pass/i.test(e.type || '');
  function seletor(e) {
    let s = e.tagName.toLowerCase();
    if (e.id) s += '#' + e.id;
    const cl = [...(e.classList || [])].filter(c => !/^pia-/.test(c)).slice(0, 3);
    if (cl.length) s += '.' + cl.join('.');
    return s;
  }
  function visivel(e) {
    if (!e.getBoundingClientRect) return null;
    const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return null;
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return null;
    return { r, cs };
  }
  function descreveObj(e, ref) {
    const v = visivel(e); if (!v) return null;
    const r = v.r, cs = v.cs;
    const proprio = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).filter(Boolean).join(' ');
    let texto = proprio || (e.matches('button,a,select,label,summary,h1,h2,h3,h4,th,td') ? (e.innerText || '').trim() : '');
    if (ehSenha(e)) texto = '(campo de senha oculto)';
    else if (e.tagName === 'INPUT' || e.tagName === 'TEXTAREA') texto = (e.value || e.placeholder || '').toString();
    else if (e.tagName === 'SELECT') texto = e.options[e.selectedIndex] ? e.options[e.selectedIndex].text : '';
    texto = texto.replace(/\s+/g, ' ').slice(0, 90);
    const est = [];
    if (e.disabled) est.push('desabilitado');
    if (e.checked) est.push('marcado');
    if (e.open === true) est.push('aberto');
    if (e.getAttribute && e.getAttribute('aria-expanded')) est.push('expandido=' + e.getAttribute('aria-expanded'));
    const o = { sel: seletor(e), tipo: '', texto, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height),
      estado: est.join(', '), cor: cs.color, fundo: cs.backgroundColor, fonte: cs.fontSize };
    try { if (raiz.DICAUI && raiz.DICAUI.tipoDe) o.tipo = String(raiz.DICAUI.tipoDe(e) || ''); } catch (x) {}
    const t = e.getAttribute && e.getAttribute('title'); if (t) o.dica = t.slice(0, 120);
    if (ref) { o.xr = o.x - Math.round(ref.left); o.yr = o.y - Math.round(ref.top); }
    return o;
  }
  const interativo = e => e.matches('button,a,input,select,textarea,summary,[role=button],[tabindex],[data-i]');
  function objetosNaArea(rect) {
    const out = [], visto = new Set();
    const todos = D.body.querySelectorAll('*');
    for (const e of todos) {
      if (out.length >= MAX_OBJ) break;
      if (e.closest('.pia-menu,.pia-faixa,.pia-over,dialog.pia,.dicaui-tip,.dicaui-fixa,.dicaui-caixa,script,style,svg *')) continue;
      const v = visivel(e); if (!v) continue;
      const r = v.r;
      if (r.right < rect.left || r.left > rect.right || r.bottom < rect.top || r.top > rect.bottom) continue;
      if (r.width > innerWidth * 0.97 && r.height > innerHeight * 0.6) continue;   // contêineres gigantes não ajudam
      const proprio = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (!(proprio || interativo(e) || e.id || e.matches('img,canvas,h1,h2,h3,h4,th,td,label,.tile,.enschip'))) continue;
      const d = descreveObj(e, rect); if (!d || visto.has(d.sel + d.x + d.y)) continue;
      visto.add(d.sel + d.x + d.y); out.push(d);
    }
    return out.sort((a, b) => a.y - b.y || a.x - b.x);
  }

  /* ----------------------------------- contexto ----------------------------------- */
  function g(nome) { try { return (0, eval)(nome); } catch (e) { return undefined; } }   // lê variável global do medidor (let/const de script clássico) sem quebrar se não existir
  function itensContexto() {
    const L = [];
    const add = (id, rot, valor) => { if (valor != null && valor !== '') L.push({ id, rot, valor: String(valor), on: true }); };
    add('versao', 'Versão do medidor', g('VERSAO'));
    add('tela', 'Página', location.pathname.split('/').pop() + (location.search || ''));
    add('viewport', 'Tela', innerWidth + '×' + innerHeight + ' px · densidade ' + (devicePixelRatio || 1) + ' · ' + (matchMedia('(pointer:coarse)').matches ? 'toque (celular/tablet)' : 'mouse'));
    add('tema', 'Tema', D.documentElement.dataset.tema || 'claro');
    const dem = $('dmEstado'); if (dem && dem.textContent.trim()) add('modo', 'Modo (Demo/PLC)', dem.textContent.trim().replace(/\s+/g, ' ').slice(0, 140));
    const abertas = [...D.querySelectorAll('dialog[open]')].filter(d => d.id !== 'piaDlg').map(d => d.id).filter(Boolean);
    add('janelas', 'Janelas abertas', abertas.join(', ') || 'nenhuma');
    const T = g('T'); if (T && typeof T === 'object') add('ensaio', 'Ensaio', 'iniciado=' + !!T.started + ' · rodando=' + !!T.run + ' · etapa=' + ((T.et | 0) + 1) + ' · fim=' + !!T.fim);
    try { const f = JSON.parse(localStorage.getItem('medidor.fbv.v1') || 'null'); if (f) add('mae', 'FB mãe (Patamar)', f.estado + (f.msg ? ' — ' + f.msg : '') + (f.kw ? ' · alvo ' + (+f.kw.alvo).toFixed(1) + ' kW · sugerido ' + (+f.kw.sel).toFixed(1) + ' · comandado ' + (+f.kw.cmd).toFixed(1) : '')); } catch (e) {}
    try { const b = raiz.devObs && raiz.devObs.buf && raiz.devObs.buf(); if (b && b.length) L.push({ id: 'log', rot: 'Últimos eventos do log (' + Math.min(12, b.length) + ')', valor: b.slice(-12).map(x => { const t = v => (v != null && typeof v === 'object') ? JSON.stringify(v).slice(0, 160) : String(v == null ? '' : v); return Array.isArray(x) ? x.map(t).join(' | ') : (typeof x === 'object' ? [x.t || x.hora || '', x.card || '', x.tipo || '', x.acao || '', x.res || '', x.det || ''].map(t).filter(Boolean).join(' | ') : String(x)); }).join('\n'), on: false }); } catch (e) {}
    if (ERROS.length) L.push({ id: 'erros', rot: 'Erros de JavaScript (' + ERROS.length + ')', valor: ERROS.join('\n'), on: true });
    return L;
  }

  /* ----------------------------------- a janela ----------------------------------- */
  let dlg = null, S = null;   // S = estado do pacote aberto
  const novoEstado = () => ({ rect: null, objs: [], ctx: itensContexto(), imgs: [], pergunta: '' });
  function monta() {
    if (dlg) return;
    dlg = D.createElement('dialog'); dlg.id = 'piaDlg'; dlg.className = 'pia';
    dlg.innerHTML = `<div class="pia-top"><span>📦 Pacote para a IA</span><button type="button" class="pia-x" aria-label="Fechar" title="Fechar">✕</button></div>
      <div class="pia-body" id="piaBody">
        <h4>Imagens <small>(cole com Ctrl+V, arraste para cá ou escolha da galeria)</small></h4>
        <div class="pia-imgs" id="piaImgs"></div>
        <p><label class="bt" style="display:inline-block">＋ Anexar imagem<input type="file" id="piaFile" accept="image/*" multiple hidden></label>
        <small>Se o problema é VISUAL (cor, alinhamento, sobreposição), anexe o print também na conversa.</small></p>
        <h4>Objetos da área <small id="piaNObj"></small></h4>
        <div id="piaObjs"></div>
        <h4>Contexto</h4>
        <div class="pia-ctx" id="piaCtx"></div>
        <h4>Pergunta</h4>
        <div class="pia-q"><textarea id="piaQ" placeholder="O que você quer? Explique o que viu e o que espera."></textarea></div>
        <details class="pia-prev" id="piaPrevD"><summary>Prévia do pacote</summary><pre id="piaPrev"></pre></details>
      </div>
      <div class="pia-foot">
        <span class="tok" id="piaTok"></span>
        <button type="button" class="bt p" id="piaCopiar" title="Copia o pacote e fecha esta janela">Copiar e fechar</button>
        <button type="button" class="bt" id="piaMd">Salvar .md</button>
        <button type="button" class="bt" id="piaJson">Salvar .json</button>
        <button type="button" class="bt" id="piaFechar">Fechar</button>
        <span class="pia-aviso" id="piaAviso"></span>
      </div>`;
    D.body.appendChild(dlg);
    dlg.querySelector('.pia-x').onclick = tentaFechar; $('piaFechar').onclick = tentaFechar;
    dlg.addEventListener('cancel', e => { e.preventDefault(); tentaFechar(); });
    $('piaFile').onchange = () => { [...$('piaFile').files].forEach(addImg); $('piaFile').value = ''; };
    dlg.addEventListener('paste', colar); dlg.addEventListener('dragover', e => { e.preventDefault(); });
    dlg.addEventListener('drop', e => { e.preventDefault(); [...(e.dataTransfer ? e.dataTransfer.files : [])].filter(f => /^image\//.test(f.type)).forEach(addImg); });
    $('piaQ').addEventListener('input', () => { S.pergunta = $('piaQ').value; atualiza(); });
    $('piaCopiar').onclick = copiar; $('piaMd').onclick = () => salva('md'); $('piaJson').onclick = () => salva('json');
    if (raiz.visualViewport) { const aj = () => dlg.style.setProperty('--pia-h', raiz.visualViewport.height + 'px'); raiz.visualViewport.addEventListener('resize', aj); aj(); }
  }
  function colar(e) {
    const it = [...((e.clipboardData && e.clipboardData.items) || [])].filter(i => i.type && i.type.startsWith('image/'));
    if (!it.length) return; e.preventDefault(); it.forEach(i => { const f = i.getAsFile(); if (f) addImg(f); });
  }
  function addImg(file) {
    const n = S.imgs.length + 1;
    S.imgs.push({ file, url: URL.createObjectURL(file), nome: 'imagem' + n, legenda: '', ocr: '', lendo: false });
    desenha();
  }
  function lerOcr(i) {
    const im = S.imgs[i]; if (!im || im.lendo) return;
    if (typeof g('sapGetWorker') !== 'function') { $('piaAviso').textContent = 'OCR indisponível nesta página.'; return; }
    im.lendo = true; desenha();
    Promise.resolve().then(() => g('sapPrepImg')(im.file)).then(c => g('sapGetWorker')().then(w => w.recognize(c)))
      .then(r => { im.ocr = ((r && r.data && r.data.text) || '').trim(); })
      .catch(e => { $('piaAviso').textContent = 'OCR não rodou: ' + (e && e.message || e) + ' (os arquivos do Tesseract ficam em /tesseract/ no PC).'; })
      .finally(() => { im.lendo = false; desenha(); });
  }
  function desenha() {
    if (!dlg) return;
    $('piaImgs').innerHTML = S.imgs.length ? S.imgs.map((im, i) => `<div class="pia-img"><img src="${im.url}" alt="">
      <input type="text" data-i="${i}" data-k="legenda" placeholder="Legenda / o que esta imagem mostra" value="${esc(im.legenda)}">
      <button type="button" class="bt" data-ocr="${i}"${im.lendo ? ' disabled' : ''}>${im.lendo ? 'Lendo…' : 'Ler texto (OCR)'}</button>
      <button type="button" class="bt" data-rm="${i}">Remover</button>
      <textarea data-i="${i}" data-k="ocr" placeholder="Texto lido da imagem (você pode corrigir)">${esc(im.ocr)}</textarea></div>`).join('') : '<small>Nenhuma imagem anexada.</small>';
    $('piaNObj').textContent = S.rect ? '(' + S.objs.filter(o => o.on !== false).length + ' de ' + S.objs.length + ' · área ' + Math.round(S.rect.width) + '×' + Math.round(S.rect.height) + ' px)' : '';
    $('piaObjs').innerHTML = S.objs.length ? `<p><button type="button" class="bt" data-todos="1">Marcar todos</button> <button type="button" class="bt" data-todos="0">Limpar</button></p><ul class="pia-lista">` +
      S.objs.map((o, i) => `<li><input type="checkbox" data-o="${i}"${o.on !== false ? ' checked' : ''}><span><code>${esc(o.sel)}</code> ${o.texto ? '“' + esc(o.texto) + '”' : ''}<br><small>${o.w}×${o.h} em (${o.x},${o.y})${o.estado ? ' · ' + esc(o.estado) : ''}</small></span></li>`).join('') + '</ul>'
      : '<small>Nenhuma área capturada. Use "Capturar para a IA" no menu do botão direito para arrastar sobre a tela.</small>';
    $('piaCtx').innerHTML = S.ctx.map((c, i) => `<label><input type="checkbox" data-c="${i}"${c.on ? ' checked' : ''}><span><b>${esc(c.rot)}:</b> ${esc(c.valor.length > 120 ? c.valor.slice(0, 120) + '…' : c.valor).replace(/\n/g, '<br>')}</span></label>`).join('');
    atualiza();
  }
  // um único ouvinte para tudo que muda dentro do corpo da janela
  function ligaCorpo() {
    const corpo = $('piaBody');
    corpo.addEventListener('click', e => {
      const t = e.target;
      if (t.dataset.ocr != null) lerOcr(+t.dataset.ocr);
      else if (t.dataset.rm != null) { const i = +t.dataset.rm; try { URL.revokeObjectURL(S.imgs[i].url); } catch (x) {} S.imgs.splice(i, 1); desenha(); }
      else if (t.dataset.todos != null) { S.objs.forEach(o => o.on = t.dataset.todos === '1'); desenha(); }
    });
    corpo.addEventListener('change', e => {
      const t = e.target;
      if (t.dataset.o != null) { S.objs[+t.dataset.o].on = t.checked; atualiza(); $('piaNObj').textContent = '(' + S.objs.filter(o => o.on !== false).length + ' de ' + S.objs.length + ')'; }
      else if (t.dataset.c != null) { S.ctx[+t.dataset.c].on = t.checked; atualiza(); }
    });
    corpo.addEventListener('input', e => {
      const t = e.target; if (t.dataset.k == null) return;
      S.imgs[+t.dataset.i][t.dataset.k] = t.value; atualiza();
    });
  }

  /* --------------------------------- montagem do pacote --------------------------------- */
  const sufixo = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()); };
  function pacote() {
    const objs = S.objs.filter(o => o.on !== false), ctx = S.ctx.filter(c => c.on);
    return { gerado: new Date().toISOString(), pacoteIA: VER, pergunta: S.pergunta.trim(), contexto: ctx.map(c => ({ item: c.rot, valor: c.valor })),
      imagens: S.imgs.map((im, i) => ({ arquivo: 'pacote-' + S.sfx + '-img' + (i + 1) + '.png', legenda: im.legenda, textoOCR: im.ocr })),
      area: S.rect ? { x: Math.round(S.rect.left), y: Math.round(S.rect.top), w: Math.round(S.rect.width), h: Math.round(S.rect.height) } : null,
      objetos: objs.map(o => ({ seletor: o.sel, tipo: o.tipo, texto: o.texto, x: o.x, y: o.y, w: o.w, h: o.h, estado: o.estado, cor: o.cor, fundo: o.fundo, fonte: o.fonte, dica: o.dica })) };
  }
  function markdown(p) {
    const L = ['# Pacote para a IA — medidor ' + (g('VERSAO') || ''), ''];
    L.push('## Pergunta', '', p.pergunta || '(sem pergunta escrita)', '');
    if (p.contexto.length) { L.push('## Contexto', ''); p.contexto.forEach(c => L.push(c.valor.includes('\n') ? '- **' + c.item + ':**\n```\n' + c.valor + '\n```' : '- **' + c.item + ':** ' + c.valor)); L.push(''); }
    if (p.imagens.length) { L.push('## Imagens (anexadas à conversa como arquivos separados)', ''); p.imagens.forEach(im => { L.push('- `' + im.arquivo + '` — ' + (im.legenda || '(sem legenda)')); if (im.textoOCR) L.push('  - Texto lido (OCR):\n```\n' + im.textoOCR + '\n```'); }); L.push(''); }
    if (p.area) { L.push('## Área capturada', '', 'x=' + p.area.x + ', y=' + p.area.y + ', ' + p.area.w + '×' + p.area.h + ' px (coordenadas da janela do navegador).', ''); }
    if (p.objetos.length) { L.push('## Objetos (' + p.objetos.length + ')', '', '| seletor | texto | x,y | w×h | estado | cor / fundo |', '|---|---|---|---|---|---|');
      p.objetos.forEach(o => L.push('| `' + o.seletor + '`' + (o.tipo ? ' (' + o.tipo + ')' : '') + ' | ' + (o.texto || '').replace(/\|/g, '/') + ' | ' + o.x + ',' + o.y + ' | ' + o.w + '×' + o.h + ' | ' + (o.estado || '') + ' | ' + o.cor + ' / ' + o.fundo + ' |')); L.push(''); }
    return L.join('\n');
  }
  function atualiza() {
    if (!dlg || !S) return;
    const md = markdown(pacote()); $('piaPrev').textContent = md;
    const tok = Math.ceil(md.length / 3.5);
    $('piaTok').textContent = md.length + ' caracteres · ≈ ' + tok + ' tokens (estimativa)' + (S.imgs.length ? ' · as imagens vão como arquivos e contam à parte' : '');
  }
  function baixa(nome, texto, tipo) { const a = D.createElement('a'); a.href = URL.createObjectURL(new Blob([texto], { type: tipo })); a.download = nome; D.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
  function salva(tipo) {
    const p = pacote(), base = 'pacote-' + S.sfx;
    if (tipo === 'md') baixa(base + '.md', markdown(p), 'text/markdown'); else baixa(base + '.json', JSON.stringify(p, null, 1), 'application/json');
    S.imgs.forEach((im, i) => { const a = D.createElement('a'); a.href = im.url; a.download = base + '-img' + (i + 1) + '.png'; D.body.appendChild(a); setTimeout(() => { a.click(); a.remove(); }, 200 * (i + 1)); });
    $('piaAviso').textContent = 'Arquivo salvo (pasta Downloads).';
  }
  function copiar() {
    const md = markdown(pacote());
    const ok = () => { $('piaAviso').textContent = ''; fechaJanela(true); aviso('Pacote copiado (' + md.length + ' caracteres)'); };
    const plano = () => {   // plano B: o navegador bloqueia a área de transferência em páginas http:// — usa seleção + execCommand
      const ta = D.createElement('textarea'); ta.value = md; ta.style.cssText = 'position:fixed;left:-9999px;top:0'; dlg.appendChild(ta); ta.select();
      let r = false; try { r = D.execCommand('copy'); } catch (e) {} ta.remove();
      if (r) ok(); else { D.querySelector('#piaPrevD').open = true; const pre = $('piaPrev'); const rg = D.createRange(); rg.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(rg); $('piaAviso').textContent = 'Não consegui copiar sozinho: a prévia está selecionada, use Copiar do navegador (ou Salvar .md).'; }
    };
    if (navigator.clipboard && navigator.clipboard.writeText && isSecureContext) navigator.clipboard.writeText(md).then(ok, plano); else plano();
  }
  function aviso(t) {
    const f = cria('div', 'pia-faixa'); f.innerHTML = '<b>' + esc(t) + '</b>'; abre(f); setTimeout(() => { fecha(f); f.remove(); }, 2600);
  }
  function tentaFechar() {
    const sujo = S && (S.pergunta.trim() || S.imgs.length || S.imgs.some(i => i.legenda));
    if (sujo && !confirm('Fechar sem copiar? O que você escreveu e as imagens anexadas serão descartados.')) return;
    fechaJanela(false);
  }
  function fechaJanela() { if (dlg && dlg.open) dlg.close(); if (S) S.imgs.forEach(i => { try { URL.revokeObjectURL(i.url); } catch (e) {} }); }
  function abrePacote(rect, objs) {
    monta(); if (!dlg.__lig) { ligaCorpo(); dlg.__lig = true; }
    S = novoEstado(); S.sfx = sufixo(); S.rect = rect || null; S.objs = objs || [];
    $('piaQ').value = ''; $('piaAviso').textContent = '';
    desenha();
    if (!dlg.open) dlg.showModal();
    $('piaBody').scrollTop = 0;
  }

  /* ------------------------------ captura de área armada ------------------------------ */
  let faixa = null, over = null, ret = null, timer = null, armado = false;
  function arma() {
    if (armado) return; armado = true; fechaMenu();
    faixa = cria('div', 'pia-faixa'); faixa.innerHTML = '<b>📦 Captura ativa — arraste sobre a tela para escolher a área (toque curto = um objeto)</b><button type="button">Cancelar</button>';
    faixa.querySelector('button').onclick = desarma; abre(faixa);
    over = cria('div', 'pia-over'); abre(over);
    ret = D.createElement('div'); ret.className = 'pia-ret'; ret.hidden = true; over.appendChild(ret);
    let x0 = 0, y0 = 0, ativo = false;
    over.addEventListener('pointerdown', e => { ativo = true; x0 = e.clientX; y0 = e.clientY; ret.hidden = false; pinta(e); try { over.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault(); });
    const pinta = e => { const l = Math.min(x0, e.clientX), t = Math.min(y0, e.clientY); Object.assign(ret.style, { left: l + 'px', top: t + 'px', width: Math.abs(e.clientX - x0) + 'px', height: Math.abs(e.clientY - y0) + 'px' }); };
    over.addEventListener('pointermove', e => { if (ativo) pinta(e); });
    over.addEventListener('pointerup', e => {
      if (!ativo) return; ativo = false;
      const w = Math.abs(e.clientX - x0), h = Math.abs(e.clientY - y0);
      let rect;
      if (w < 8 && h < 8) {   // toque/clique simples: pega o objeto sob o ponto
        over.style.pointerEvents = 'none'; const alvo = D.elementsFromPoint(e.clientX, e.clientY).find(x => !x.closest('.pia-over,.pia-faixa,.pia-menu')); over.style.pointerEvents = '';
        const r = alvo ? alvo.getBoundingClientRect() : null; rect = r ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height } : null;
      } else rect = { left: Math.min(x0, e.clientX), top: Math.min(y0, e.clientY), right: Math.max(x0, e.clientX), bottom: Math.max(y0, e.clientY), width: w, height: h };
      desarma(); if (!rect) return;
      abrePacote(rect, objetosNaArea(rect));
    });
    over.addEventListener('contextmenu', e => { e.preventDefault(); desarma(); });
    D.addEventListener('keydown', escDesarma, true);
    D.addEventListener('paste', colaArmado, true);   // armado: colar uma imagem em qualquer lugar abre o pacote já com ela
    timer = setTimeout(desarma, LIM_ARMADO_MS);
  }
  const escDesarma = e => { if (e.key === 'Escape' && armado) { e.preventDefault(); desarma(); } };
  function colaArmado(e) {
    const it = [...((e.clipboardData && e.clipboardData.items) || [])].find(i => i.type && i.type.startsWith('image/')); if (!it) return;
    e.preventDefault(); desarma(); abrePacote(null, []); addImg(it.getAsFile());
  }
  function desarma() {
    armado = false; clearTimeout(timer); [faixa, over].forEach(x => { if (x) { fecha(x); x.remove(); } }); faixa = over = ret = null;
    D.removeEventListener('keydown', escDesarma, true); D.removeEventListener('paste', colaArmado, true);
  }

  /* ------------------------------------- o menu ------------------------------------- */
  let menu = null;
  function fechaMenu() { if (menu) { fecha(menu); menu.remove(); menu = null; } }
  function copiaTexto(t) { const ta = D.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;left:-9999px'; D.body.appendChild(ta); ta.select(); let r = false; try { r = D.execCommand('copy'); } catch (e) {} ta.remove(); if (!r && navigator.clipboard) navigator.clipboard.writeText(t).catch(() => {}); return r; }
  function abreMenu(x, y, alvo) {
    fechaMenu();
    const jan = alvo && alvo.closest && alvo.closest('dialog.jan'), jw = jan && jan.querySelector('.jwbtn');
    menu = cria('div', 'pia-menu');
    const itens = [
      ['📦 Capturar para a IA', () => arma(), false],
      ['📋 Abrir pacote (só imagem/texto)', () => abrePacote(null, []), false],
      ['—'],
      ['🔍 Inspecionar objetos (Alt+I)', () => { if (raiz.DICAUI) raiz.DICAUI.alterna(); }, !raiz.DICAUI],
      ['⧉ Copiar descrição deste objeto', () => { const d = alvo && descreveObj(alvo); if (d) { copiaTexto(JSON.stringify(d)); aviso('Descrição copiada'); } }, !alvo],
      ['⤢ Tamanho desta janela (⤢)', () => jw && jw.click(), !jw]
    ];
    menu.innerHTML = itens.map((it, i) => it[0] === '—' ? '<hr>' : `<button type="button" data-i="${i}"${it[2] ? ' disabled' : ''}>${esc(it[0])}</button>`).join('');
    menu.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; const f = itens[+b.dataset.i][1]; fechaMenu(); f(); });
    abre(menu);
    const r = menu.getBoundingClientRect();   // posiciona DENTRO da tela (lição do ✕ que saía da viewport)
    menu.style.left = Math.max(4, Math.min(innerWidth - r.width - 4, x)) + 'px'; menu.style.top = Math.max(4, Math.min(innerHeight - r.height - 4, y)) + 'px';
    const b0 = menu.querySelector('button:not(:disabled)'); if (b0) b0.focus({ preventScroll: true });
  }
  const ehCampo = e => e && e.closest && e.closest('input,textarea,select,[contenteditable=true]');
  D.addEventListener('contextmenu', e => {
    if (armado || (dlg && dlg.open && dlg.contains(e.target)) || ehCampo(e.target) || e.target.closest('.pia-menu')) return;   // nos campos de texto fica o menu normal do navegador
    e.preventDefault(); abreMenu(e.clientX, e.clientY, e.target);
  }, true);
  D.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu) { fechaMenu(); return; }
    if ((e.shiftKey && e.key === 'F10') || e.key === 'ContextMenu') { const a = D.activeElement && D.activeElement !== D.body ? D.activeElement : null; if (ehCampo(a)) return; e.preventDefault(); const r = a ? a.getBoundingClientRect() : { left: 40, bottom: 40 }; abreMenu(r.left, r.bottom, a); }
  }, true);
  D.addEventListener('pointerdown', e => { if (menu && !e.target.closest('.pia-menu')) fechaMenu(); }, true);
  raiz.addEventListener('scroll', fechaMenu, true);
  // toque longo (iOS não dispara contextmenu; no Android o contextmenu já cobre): 550 ms parado
  let tl = null, p0 = null, supressao = 0;
  D.addEventListener('touchstart', e => {
    if (armado || e.touches.length !== 1 || ehCampo(e.target) || e.target.closest('.pia-menu,dialog.pia')) return;
    const t = e.touches[0]; p0 = { x: t.clientX, y: t.clientY, alvo: e.target };
    tl = setTimeout(() => { supressao = Date.now() + 700; abreMenu(p0.x, p0.y, p0.alvo); }, 550);
  }, { passive: true, capture: true });
  const cancelaTl = () => { clearTimeout(tl); tl = null; };
  D.addEventListener('touchmove', e => { const t = e.touches[0]; if (tl && t && p0 && Math.hypot(t.clientX - p0.x, t.clientY - p0.y) > 10) cancelaTl(); }, { passive: true, capture: true });
  D.addEventListener('touchend', cancelaTl, true); D.addEventListener('touchcancel', cancelaTl, true);
  D.addEventListener('click', e => { if (Date.now() < supressao) { e.preventDefault(); e.stopPropagation(); } }, true);   // o toque que abriu o menu não aciona o botão por baixo

  raiz.PACOTE_IA = { versao: VER, arma, desarma, abre: abrePacote, objetosNaArea, abreMenu, fechaMenu, markdown: () => S ? markdown(pacote()) : '' };
})(window);
