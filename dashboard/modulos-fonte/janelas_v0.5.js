/* =====================================================================================================================
   janelas_v0.5.js — JANELAS (<dialog>) FLUTUANTES + CONTROLE DE TAMANHO COMPACTO, iguais em todos os HTML · 30/10/2026
   v0.5 (31/10): botão "Salvar" no painel de tamanho — grava tamanho, posição e zoom no localStorage (a janela nasce assim).
   v0.4 (pedido do operador, 30/10, 22:30): painel de tamanho (⤢) REDESENHADO e compacto, sem bordas (botões em tom acima do fundo); "Caber na tela" virou "Ajustar" (sem preposição); botão ⤢ da barra sem borda.
   v0.3 (pedido do operador, 30/10): (1) o balãozinho do ⤢ FICA ABERTO enquanto você arrasta/redimensiona a janela (só fecha no ✕, Esc ou ⤢) e se atualiza
   AO VIVO (largura, altura e posição esquerda/topo); (2) mostra e permite digitar a POSIÇÃO (esquerda/topo, em px de tela); (3) a posição é SALVA SOZINHA
   ao soltar o mouse depois de mover a janela (localStorage {x,y}) e a janela já NASCE ali nas próximas vezes; "Restaurar" apaga tamanho, zoom e posição.
   v0.2: o aviso de risco fica aberto até fechar (✕/Esc/clique fora) e mostra "Janela (dialog) #id". v0.1: criação.
   Colado (inline) em: medidor_gerador_v1.10.113, grafico_ensaio_v0.8, mapa_fbs_v0.9, gerenciador_logs, amostras_simulador (cada um chama JANELAS.config).

   PARA QUE SERVE (leigo): toda janela do sistema passa a ter (1) um botão pequeno "⤢" na barra de título que abre um mini-painel de tamanho
   (zoom − / + , largura e altura em pixels, caber na tela, restaurar, copiar medidas); (2) o canto inferior direito arrastável para
   redimensionar à mão; (3) o tamanho e o zoom que você deixar ficam LEMBRADOS para a próxima vez; (4) janelas que não oferecem risco abrem
   FLUTUANTES (não congelam a tela de trás) e podem ficar várias abertas; as que oferecem risco continuam travando a tela, ou nem abrem.
   Substitui a barra grande "A− A+ 100 % … COPIAR MEDIDAS" que ocupava espaço no rodapé do Patamar guiado.

   REGRA ADOTADA (pedido do operador, 29/10/2026): "janela que não oferece risco durante a operação real não precisa congelar a tela; janela
   que oferece risco nem deve abrir — só uma mensagem pequena e discreta (tooltip)". Quem decide é cada HTML, por JANELAS.config:
     modais : ids que continuam travando a tela (decisão/edição que não pode ser feita "de lado"); todo o resto vira flutuante.
     risco  : {ids:[...], bloqueado:() => texto|''}  — se devolver texto, a janela NÃO abre e o texto aparece como tooltip discreto.
     arrasta: true (padrão) = este módulo põe o arrastar pela barra de título; o medidor já tem o seu e passa false.

   POR QUÊ (técnico): intercepta HTMLDialogElement.show/showModal (encadeando com quem já interceptou) — não muda o HTML das janelas.
   Zoom = CSS zoom na própria <dialog> (a posição é corrigida pelo fator efetivo). Persistência: localStorage 'bt2.jan.<app>.<id>' {z,w,h,x,y}
   sempre em try/catch (pode vir vazio/bloqueado). O mini-painel usa popover="manual" para aparecer acima de janelas modais.
   NÃO FAZ: não comanda nada, não lê PLC/Node-RED, não altera o conteúdo das janelas.
   ===================================================================================================================== */
(function (global) {
  'use strict';
  if (global.JANELAS) return;
  const APP = (location.pathname.split('/').pop() || 'pagina').replace(/\.html?$/i, '').replace(/[_-]?v?\d+(\.\d+)*$/i, '') || 'pagina';
  const CFG = { modais: [], risco: null, arrasta: true, livresPorPadrao: true };
    let zTopo = 60, pop = null, popDe = null;

  const lerSt = d => { try { return JSON.parse(localStorage.getItem('bt2.jan.' + APP + '.' + (d.id || '')) || '{}') || {}; } catch (e) { return {}; } };
  const gravaSt = (d, st) => { if (!d.id) return; try { localStorage.setItem('bt2.jan.' + APP + '.' + d.id, JSON.stringify(st)); } catch (e) {} };

  /* ---------- CSS comum (injetado uma vez) ---------- */
  const css = document.createElement('style');
  css.textContent = `
  dialog.jwin{resize:both;overflow:auto;min-width:240px;min-height:110px}
  dialog.jwin.jflut{box-shadow:0 10px 36px rgba(5,20,40,.45)}
  .jwbtn{font:600 13px/1 system-ui,sans-serif;width:24px;height:24px;padding:0;margin:0 4px;border:1px solid transparent;background:rgba(255,255,255,.16);color:inherit;border-radius:5px;cursor:pointer;flex:none}
  .jwbtn:hover{background:rgba(128,128,128,.25)}
  .jwbtn.jfix{position:absolute;top:4px;right:34px;z-index:3}
  #jwPop{position:fixed;inset:auto;margin:0;border:0;border-radius:10px;background:#fff;color:#14202e;padding:8px 10px 10px;font:12px/1.3 system-ui,sans-serif;width:252px;box-shadow:0 8px 28px rgba(0,0,0,.35)}
  @media (prefers-color-scheme:dark){#jwPop{background:#1f262e;color:#e8edf2}}
  #jwPop .jh{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;font-size:12px}
  #jwPop .r{display:flex;align-items:center;gap:6px;margin:5px 0}
  #jwPop .r>span{width:58px;color:#6b7785}
  #jwPop label{display:inline-flex;align-items:center;gap:3px;color:#6b7785}
  #jwPop button{font:inherit;padding:4px 9px;border:0;border-radius:6px;background:rgba(107,119,133,.20);color:inherit;cursor:pointer}
  #jwPop button:hover{background:rgba(107,119,133,.34)}
  #jwPop .jc{width:22px;height:22px;padding:0}
  #jwPop .bt3{flex-wrap:wrap}
  #jwPop .bt3 button{flex:1 1 44%;padding:5px 4px}
  #jwPop input{width:54px;font:inherit;padding:3px 5px;border:0;border-radius:5px;background:rgba(107,119,133,.16);color:inherit}
  #jwPop .z{min-width:44px;text-align:center;font-weight:600}
  #jwPop .t{font-size:11px;color:#6b7785;margin-top:4px;word-break:break-all}
  .jwtip{position:fixed;margin:0;inset:auto;z-index:2147483000;max-width:280px;padding:4px 24px 4px 8px;border-radius:5px;border:0;background:rgba(30,36,44,.95);color:#fff;font:11px/1.3 system-ui,sans-serif;overflow:visible}
  .jwtip .jwtx{position:absolute;top:1px;right:2px;width:18px;height:18px;border:0;background:transparent;color:#fff;font:700 11px/1 system-ui;cursor:pointer;border-radius:4px}
  .jwtip .jwtx:hover{background:rgba(255,255,255,.2)}
  .jwtip small{display:block;color:#a9b8c8;font-size:10px}`;
  document.head.appendChild(css);

  /* ---------- tooltip discreto (janela de risco não abre) ---------- */
  /* v0.2: o aviso FICA ABERTO até o operador fechar (✕, Esc ou clique fora) — antes sumia sozinho em 2,6 s e a pessoa não conseguia ler/copiar.
     Nome do elemento: "popover" (aviso não modal que permanece aberto); o "tooltip" comum some ao tirar o mouse. A 2ª linha traz o tipo + id
     de programação do elemento ao qual o aviso se refere (ex.: Janela #dlgModo) para facilitar a conversa com quem programa. */
  let tipAtivo = null;
  function fechaDica() { if (tipAtivo) { try { tipAtivo.hidePopover(); } catch (e) {} tipAtivo.remove(); tipAtivo = null; } }
  function dica(txt, perto, ref) {
    fechaDica();
    const t = document.createElement('div'); t.className = 'jwtip'; t.setAttribute('role', 'status');
    if ('showPopover' in HTMLElement.prototype) t.setAttribute('popover', 'manual');
    const m = document.createElement('span'); m.textContent = txt; t.appendChild(m);
    if (ref && ref.id) { const q = document.createElement('small'); q.textContent = 'Janela (dialog) #' + ref.id; t.appendChild(q); }
    const x = document.createElement('button'); x.type = 'button'; x.className = 'jwtx'; x.textContent = '✕'; x.setAttribute('aria-label', 'Fechar aviso'); x.onclick = fechaDica; t.appendChild(x);
    document.body.appendChild(t); tipAtivo = t; try { t.showPopover(); } catch (e) {}
    const r = (perto && perto.getBoundingClientRect) ? perto.getBoundingClientRect() : { left: innerWidth / 2 - 100, bottom: 80 };
    t.style.left = Math.max(6, Math.min(innerWidth - 290, r.left)) + 'px'; t.style.top = Math.min(innerHeight - 50, r.bottom + 6) + 'px';
    const fora = ev => { if (tipAtivo && !tipAtivo.contains(ev.target)) { fechaDica(); document.removeEventListener('pointerdown', fora, true); } };
    setTimeout(() => document.addEventListener('pointerdown', fora, true), 0);   // o clique que abriu o aviso não pode fechá-lo
  }
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && tipAtivo) fechaDica(); }, true);

  /* ---------- tamanho / zoom ---------- */
  const zEf = d => { const r = d.getBoundingClientRect(); return d.offsetWidth ? (r.width / d.offsetWidth) || 1 : 1; };
  function aplicaSt(d, st) {
    if (st.z) d.style.zoom = st.z; else d.style.zoom = '';
    if (st.w) { d.style.width = st.w + 'px'; d.style.maxWidth = '98vw'; }
    if (st.h) { d.style.height = st.h + 'px'; d.style.maxHeight = '98vh'; }
    if (st.x != null && st.y != null && d.open) {   // v0.3: posição lembrada (px de tela, limitada para a barra de título nunca sair da tela)
      const z = st.z || 1, x = Math.min(Math.max(st.x, 120 - (st.w || 400) * z), innerWidth - 120), y = Math.min(Math.max(st.y, 0), innerHeight - 40);
      d.style.position = 'fixed'; d.style.margin = '0'; d.style.right = 'auto'; d.style.bottom = 'auto'; d.style.left = x / z + 'px'; d.style.top = y / z + 'px'; d.dataset.jwPos = '1';
    }
  }
  function medidas(d) { const r = d.getBoundingClientRect(), z = zEf(d); return (d.id || 'janela') + ': largura=' + Math.round(r.width / z) + 'px altura=' + Math.round(r.height / z) + 'px esquerda=' + Math.round(r.left) + 'px topo=' + Math.round(r.top) + 'px zoom=' + Math.round(z * 100) + '% tela=' + innerWidth + 'x' + innerHeight; }
  function centraSePrecisa(d) {
    if (d.style.left || d.dataset.jwPos) return;
    const r = d.getBoundingClientRect(), z = zEf(d);
    d.style.position = 'fixed'; d.style.margin = '0'; d.style.right = 'auto'; d.style.bottom = 'auto';
    d.style.left = Math.max(4, (innerWidth - r.width) / 2) / z + 'px'; d.style.top = Math.max(6, (innerHeight - r.height) * 0.12) / z + 'px';
  }
  function trazFrente(d) { d.style.zIndex = ++zTopo; }

  /* ---------- mini-painel de tamanho (um só, reaproveitado) ---------- */
  function montaPop() {
    pop = document.createElement('div'); pop.id = 'jwPop'; pop.setAttribute('popover', 'manual');
    pop.innerHTML = '<div class="jh"><b>Tamanho da janela</b><button data-a="x" class="jc" title="Fechar este painel">✕</button></div>' +
      '<div class="r"><span>Zoom</span><button data-a="z-" title="Diminui o conteúdo">−</button><b class="z" data-k="z">100%</b><button data-a="z+" title="Aumenta o conteúdo">+</button><button data-a="z0" title="Volta a 100 %">↺</button></div>' +
      '<div class="r"><span>Posição</span><label>x<input type="number" data-k="x" step="10"></label><label>y<input type="number" data-k="y" step="10"></label></div>' +
      '<div class="r"><span>Tamanho</span><label>L<input type="number" data-k="w" min="240" step="10"></label><label>A<input type="number" data-k="h" min="110" step="10"></label><span style="width:auto">px</span></div>' +
      '<div class="r bt3"><button data-a="cabe" title="Ajusta a janela para caber na tela">Ajustar</button><button data-a="rest" title="Volta ao tamanho original">Restaurar</button><button data-a="cp" title="Copia as medidas para você informar">Copiar</button><button data-a="salv" title="Guarda tamanho, posição e zoom desta janela neste navegador (localStorage): ela abre assim da próxima vez">Salvar</button></div><div class="t" data-k="t"></div>';
    document.body.appendChild(pop);
    pop.addEventListener('click', e => { const b = e.target.closest('button[data-a]'); if (b && popDe) acao(popDe, b.dataset.a); });
    pop.addEventListener('input', e => { const i = e.target.closest('input[data-k]'); if (!i || !popDe) return; const v = parseInt(i.value, 10); const k = i.dataset.k; if (k === 'x' || k === 'y') { if (isNaN(v)) return; const st = lerSt(popDe), r = popDe.getBoundingClientRect(); if (st.x == null) st.x = Math.round(r.left); if (st.y == null) st.y = Math.round(r.top); st[k] = v; gravaSt(popDe, st); aplicaSt(popDe, st); return; } if (!(v > 0)) return; const st = lerSt(popDe); st[k] = v; gravaSt(popDe, st); aplicaSt(popDe, st); });
    // v0.3: NÃO fecha mais ao clicar fora — o operador mexe na janela com o painel aberto. Fecha no ✕, no Esc ou no próprio ⤢.
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && pop.matches(':popover-open')) fechaPop(); });
  }
  let salvoAte = 0;   // v0.5: até quando mostrar o "✔ Salvo" no painel
  const fechaPop = () => { try { pop.hidePopover(); } catch (e) {} popDe = null; };
  function atualizaPop() {
    if (!popDe) return; const d = popDe, z = zEf(d), r = d.getBoundingClientRect();
    pop.querySelector('[data-k=z]').textContent = Math.round(z * 100) + '%';
    const w = pop.querySelector('input[data-k=w]'), h = pop.querySelector('input[data-k=h]');
    if (document.activeElement !== w) w.value = Math.round(r.width / z); if (document.activeElement !== h) h.value = Math.round(r.height / z);
    const ix = pop.querySelector('input[data-k=x]'), iy = pop.querySelector('input[data-k=y]');
    if (document.activeElement !== ix) ix.value = Math.round(r.left); if (document.activeElement !== iy) iy.value = Math.round(r.top);
    pop.querySelector('[data-k=t]').textContent = (Date.now() < salvoAte ? '✔ Salvo neste navegador · ' : '') + medidas(d);
  }
  setInterval(() => { if (popDe && pop && pop.matches(':popover-open')) atualizaPop(); }, 200);   // v0.3: acompanha o arrastar/redimensionar ao vivo
  function acao(d, a) {
    const st = lerSt(d);
    if (a === 'z-' || a === 'z+') { const z0 = st.z || 1; st.z = Math.min(1.8, Math.max(.6, Math.round((z0 + (a === 'z+' ? .1 : -.1)) * 10) / 10)); if (st.z === 1) delete st.z; }
    else if (a === 'z0') { delete st.z; }
    else if (a === 'x') { fechaPop(); return; }
    else if (a === 'rest') { ['z', 'w', 'h', 'x', 'y'].forEach(k => delete st[k]); d.style.width = d.style.height = d.style.maxWidth = d.style.maxHeight = ''; }
    else if (a === 'cabe') { const z = st.z || 1; st.w = Math.floor((innerWidth - 16) / z); st.h = Math.floor((innerHeight - 16) / z); d.style.left = (8 / z) + 'px'; d.style.top = (8 / z) + 'px'; d.style.position = 'fixed'; d.style.margin = '0'; d.dataset.jwPos = '1'; }
    else if (a === 'salv') {   // v0.5: grava tamanho, posição e zoom ATUAIS como padrão desta janela (localStorage)
      const z = zEf(d), r = d.getBoundingClientRect(); st.w = Math.round(r.width / z); st.h = Math.round(r.height / z); st.x = Math.round(r.left); st.y = Math.round(r.top); if (z !== 1) st.z = z; else delete st.z;
      salvoAte = Date.now() + 3500; gravaSt(d, st); atualizaPop(); return;
    }
    else if (a === 'cp') { const t = medidas(d); try { navigator.clipboard.writeText(t).then(() => { pop.querySelector('[data-k=t]').textContent = 'Copiado: ' + t; }, () => {}); } catch (e) {} return; }
    gravaSt(d, st); aplicaSt(d, st); atualizaPop();
  }
  function abrePop(d, btn) {
    if (!pop) montaPop();
    popDe = d; atualizaPop();
    try { pop.showPopover(); } catch (e) {}
    const r = btn.getBoundingClientRect();
    pop.style.left = Math.max(6, Math.min(innerWidth - 244, r.right - 232)) + 'px'; pop.style.top = Math.min(innerHeight - 150, r.bottom + 6) + 'px';
  }

  /* ---------- prepara uma janela (uma vez): botão, canto redimensionável, arrastar, memória ---------- */
  function prepara(d) {
    if (d.dataset.jwOk) return; d.dataset.jwOk = '1'; d.classList.add('jwin');
    const hdr = d.querySelector('.jt') || d.querySelector('.dlgtop') || d.querySelector('h1,h2,h3');
    const b = document.createElement('button'); b.type = 'button'; b.className = 'jwbtn'; b.textContent = '⤢'; b.title = 'Tamanho da janela: zoom, largura, altura';
    b.setAttribute('aria-label', 'Tamanho da janela');
    b.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); if (popDe === d && pop && pop.matches(':popover-open')) fechaPop(); else abrePop(d, b); });
    const fecha = hdr && hdr.querySelector('[data-fecha],.jx');
    if (hdr && fecha) fecha.parentNode.insertBefore(b, fecha); else if (hdr && hdr.classList.contains('jt')) hdr.appendChild(b); else { b.classList.add('jfix'); d.appendChild(b); }
    let p0 = null;
    d.addEventListener('pointerdown', () => { trazFrente(d); const r = d.getBoundingClientRect(); p0 = { x: r.left, y: r.top }; });
    d.addEventListener('pointerup', () => {   // v0.3: se a janela mudou de lugar (arrasto do módulo ou do medidor), guarda a posição para ela nascer ali
      if (!p0 || !d.id) return; const r = d.getBoundingClientRect(); if (Math.abs(r.left - p0.x) < 3 && Math.abs(r.top - p0.y) < 3) return;
      const st = lerSt(d); st.x = Math.round(r.left); st.y = Math.round(r.top); gravaSt(d, st); p0 = null; atualizaPop();
    });
    d.addEventListener('pointerup', () => { if (!d.style.width && !d.style.height) return; const st = lerSt(d); const z = zEf(d); const w = parseInt(d.style.width, 10), h = parseInt(d.style.height, 10); if (w) st.w = w; if (h) st.h = h; gravaSt(d, st); atualizaPop(); });
    if (CFG.arrasta && hdr) arrasta(d, hdr);
    d.addEventListener('close', () => { if (popDe === d) fechaPop(); });
  }
  function arrasta(d, hdr) {
    hdr.style.cursor = 'move'; hdr.title = (hdr.title ? hdr.title + ' · ' : '') + 'Arraste para mover';
    hdr.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('button,input,select,textarea,a')) return;
      const r = d.getBoundingClientRect(), z = zEf(d), x0 = e.clientX, y0 = e.clientY, l0 = r.left / z, t0 = r.top / z;
      d.style.position = 'fixed'; d.style.margin = '0'; d.style.right = 'auto'; d.style.bottom = 'auto'; d.style.left = l0 + 'px'; d.style.top = t0 + 'px'; d.dataset.jwPos = '1';
      hdr.setPointerCapture(e.pointerId);
      const mv = ev => { d.style.left = Math.min(Math.max(l0 + (ev.clientX - x0) / z, 120 / z - d.offsetWidth), innerWidth / z - 120 / z) + 'px'; d.style.top = Math.min(Math.max(t0 + (ev.clientY - y0) / z, 0), innerHeight / z - 40 / z) + 'px'; };
      const up = () => { hdr.removeEventListener('pointermove', mv); hdr.removeEventListener('pointerup', up); hdr.removeEventListener('pointercancel', up); };
      hdr.addEventListener('pointermove', mv); hdr.addEventListener('pointerup', up); hdr.addEventListener('pointercancel', up);
    });
  }

  const showAnt = HTMLDialogElement.prototype.show, modalAnt = HTMLDialogElement.prototype.showModal;   // quem já interceptou (medidor: lembra posição) continua valendo
  /* ---------- intercepta abrir (risco → não abre; modal x flutuante) ---------- */
  const ehModal = d => CFG.modais.includes(d.id);
  const ehRisco = d => CFG.risco && CFG.risco.ids.includes(d.id);
  function abre(d, comoModal, orig) {
    if (ehRisco(d)) { let m = ''; try { m = CFG.risco.bloqueado(d) || ''; } catch (e) {} if (m) { dica(m, document.activeElement, d); return; } }
    prepara(d); const st = lerSt(d);
    if (comoModal && !ehModal(d) && CFG.livresPorPadrao) { showAnt.call(d); d.classList.add('jflut'); }   // vira flutuante: não trava a tela
    else orig.call(d);
    aplicaSt(d, st); if (d.classList.contains('jflut')) centraSePrecisa(d); trazFrente(d);
  }
  HTMLDialogElement.prototype.show = function () { abre(this, false, showAnt); };
  HTMLDialogElement.prototype.showModal = function () { abre(this, true, modalAnt); };
  document.addEventListener('keydown', e => {   // Esc fecha a janela flutuante em foco (as modais o navegador já fecha)
    if (e.key !== 'Escape') return; const d = document.activeElement && document.activeElement.closest && document.activeElement.closest('dialog.jflut[open]'); if (d) { try { d.close(); } catch (x) {} }
  });
  const varre = () => document.querySelectorAll('dialog').forEach(prepara);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', varre); else varre();

  global.JANELAS = { versao: '0.5',  config(o) { Object.assign(CFG, o || {}); }, prepara, dica, medidas, app: APP };
})(window);
