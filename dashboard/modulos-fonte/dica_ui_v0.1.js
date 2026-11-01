/* =====================================================================================================================
   dica_ui_v0.1.js — DICA DE INTERFACE: "que elemento é este?" (nome do tipo + id de programação + coordenadas) · 29/10/2026
   Colado (inline) em todos os HTML do projeto (medidor, gráfico, mapa dos FBs, gerenciador de logs, amostras, simulador de rodízio,
   visor da API, painel BT2). Documento: modulos/DICA_UI_v0.1.md.

   PARA QUE SERVE (leigo): para conversar com a programação sem dizer "aquele botãozinho lá". Ligando este modo, ao passar o mouse sobre
   qualquer coisa da tela aparece uma etiqueta com (1) o NOME DO TIPO do elemento (Botão, Chip, Card, Janela…), (2) o ID usado no código
   (ex.: #bAnalisar, #cardBancoCargas) e (3) as COORDENADAS na tela. Alt + clique "fixa" a etiqueta: ela fica aberta até você fechar (✕ ou Esc)
   e tem o botão "Copiar" para colar numa mensagem. Um contorno tracejado mostra exatamente qual é o elemento.

   COMO LIGAR: tecla  Alt + I  (liga/desliga; lembra a escolha) · ou abrir a página com  ?ui=1  · ou  DICAUI.liga(true)  pelo console.
   Desligado por padrão: o operador não vê nada diferente (a dica é ferramenta de quem desenvolve/valida).

   NOME CORRETO DOS ELEMENTOS (pergunta do operador): a etiqueta que aparece ao passar o mouse e some ao sair = "tooltip" (dica de ferramenta).
   A que fica aberta até ser fechada, sem travar a tela = "popover" (é o que o Alt+clique cria, e o aviso de risco do módulo JANELAS).
   A mensagem que aparece num canto e some sozinha = "toast" (snackbar). Janela que trava a tela de trás = "diálogo modal".

   POR QUE ASSIM (técnico): usa o atributo popover="manual" (camada de cima do navegador) para a etiqueta aparecer ACIMA de <dialog> abertos; se o
   navegador não tiver popover, cai para position:fixed com z-index alto. O contorno é uma <div> fixa sobre o retângulo do elemento — NÃO mexe no
   elemento, então não muda o layout (REGRA_LAYOUT_ESTAVEL_v0.1). Enquanto o modo está ligado, o atributo title do elemento sob o mouse é guardado
   e o texto vai para dentro da etiqueta (evita duas dicas empilhadas); é devolvido ao sair.
   O que ele NÃO faz: não altera nenhum dado, não lê PLC/Node-RED, não envia nada para fora. Clique normal continua funcionando; só Alt+clique é
   capturado (para fixar). Coordenadas: "tela" = posição na janela do navegador (px); "mouse" = cursor na janela; "monitor" = cursor no monitor.
   ===================================================================================================================== */
(function (global) {
  'use strict';
  if (global.DICAUI) return;
  const CHAVE = 'bt2.dicaui';
  let ligado = false, tip = null, caixa = null, fixa = null, ult = null, tmr = 0;
  try { ligado = localStorage.getItem(CHAVE) === '1'; } catch (e) {}
  if (/[?&]ui=1\b/.test(location.search)) ligado = true;
  const temPop = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

  /* ---------- CSS próprio (injetado uma vez; cores neutras, legíveis em tema claro e escuro) ---------- */
  const css = document.createElement('style');
  css.textContent = `
  .dicaui-tip,.dicaui-fixa{position:fixed;margin:0;inset:auto;z-index:2147483200;max-width:min(360px,92vw);padding:6px 9px;border-radius:7px;border:1px solid #5d6b7a;
    background:#10202f;color:#eaf2fa;font:12px/1.35 system-ui,Segoe UI,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.4);pointer-events:none;overflow:visible}
  .dicaui-fixa{pointer-events:auto;padding-right:30px}
  .dicaui-tip b,.dicaui-fixa b{color:#8fd0ff}.dicaui-tip i,.dicaui-fixa i{font-style:normal;color:#ffd27a}
  .dicaui-tip small,.dicaui-fixa small{display:block;color:#aebccb;font-size:11px}
  .dicaui-fixa .x{position:absolute;top:3px;right:4px;width:20px;height:20px;border:0;border-radius:4px;background:transparent;color:#eaf2fa;cursor:pointer;font:700 13px/1 system-ui}
  .dicaui-fixa .x:hover{background:rgba(255,255,255,.18)}
  .dicaui-fixa .cp{margin-top:5px;font:600 11px system-ui;padding:2px 8px;border-radius:5px;border:1px solid #8fd0ff;background:transparent;color:#8fd0ff;cursor:pointer}
  .dicaui-caixa{position:fixed;margin:0;inset:auto;z-index:2147483100;pointer-events:none;border:2px dashed #ff9f1c;background:rgba(255,159,28,.08);box-sizing:border-box;padding:0}
  `;
  (document.head || document.documentElement).appendChild(css);

  /* ---------- nome do tipo (PT-BR) a partir da tag, do papel (role) e das classes ---------- */
  const cls = e => { const c = e.getAttribute && e.getAttribute('class'); return c ? String(c) : ''; };
  function tipoDe(e) {
    const t = (e.tagName || '').toLowerCase(), c = cls(e), role = e.getAttribute && e.getAttribute('role');
    if (e.classList && e.classList.contains('jwbtn')) return 'Botão de tamanho da janela (⤢)';
    if (t === 'dialog') return e.hasAttribute('open') && e.classList.contains('jflut') ? 'Janela flutuante (dialog)' : 'Janela (dialog)';
    if (/\b(chip|enschip|gchip|gd-chip)\b/.test(c)) return 'Chip';
    if (t === 'section' && /\bpanel\b/.test(c)) return 'Painel (seção de cards)';
    if (/\bcard\b/.test(c)) return 'Card';
    if (/\bbx\b/.test(c)) return 'Bloco FB (cartão do mapa)';
    if (/\binfo\b/.test(c) && e.closest && e.closest('.bx')) return 'Ícone de informação (i)';
    if (/\bjt\b/.test(c)) return 'Barra de título da janela';
    if (t === 'button' || role === 'button' || (t === 'input' && /^(button|submit|reset)$/.test(e.type))) return 'Botão';
    if (t === 'select') return 'Lista suspensa (select)';
    if (t === 'textarea') return 'Campo de texto longo';
    if (t === 'input') return e.type === 'checkbox' ? 'Caixa de seleção' : e.type === 'radio' ? 'Opção (radio)' : e.type === 'range' ? 'Controle deslizante' : 'Campo de entrada (' + (e.type || 'text') + ')';
    if (role === 'tab') return 'Aba';
    if (t === 'a') return 'Link';
    if (t === 'canvas') return 'Gráfico (canvas)';
    if (t === 'table') return 'Tabela';
    if (t === 'svg') return 'Desenho (svg)';
    if (/^h[1-6]$/.test(t)) return 'Título (' + t + ')';
    if (t === 'label') return 'Rótulo';
    if (t === 'iframe') return 'Quadro embutido (iframe)';
    if (/\b(popover|jwtip|expmenu)\b/.test(c) || e.hasAttribute && e.hasAttribute('popover')) return 'Popover / menu';
    return 'Elemento <' + t + '>';
  }
  const conhecido = e => { const t = (e.tagName || '').toLowerCase(); return !!(e.id || /^(button|input|select|textarea|a|dialog|table|canvas|label|iframe)$/.test(t) || /\b(chip|enschip|gchip|card|bx|jwbtn|jt|panel)\b/.test(cls(e)) || (e.getAttribute && /^(button|tab)$/.test(e.getAttribute('role') || ''))); };
  /* sobe da folha (um <span> de texto, por exemplo) até o primeiro elemento que tenha id ou seja de um tipo conhecido */
  function alvoDe(e) { let x = e; for (let i = 0; x && i < 8; i++, x = x.parentElement) if (conhecido(x)) return x; return e; }

  function descreve(e, ev) {
    const r = e.getBoundingClientRect(), id = e.id || '', pai = !id && e.closest ? e.closest('[id]') : null;
    const t = e.dataset && e.dataset.dicauiT != null ? e.dataset.dicauiT : (e.getAttribute && e.getAttribute('title')) || e.getAttribute && e.getAttribute('aria-label') || '';
    const n = v => Math.round(v);
    return { tipo: tipoDe(e), id, pai: pai ? pai.id : '', dica: t, x: n(r.left), y: n(r.top), w: n(r.width), h: n(r.height),
             mx: ev ? n(ev.clientX) : null, my: ev ? n(ev.clientY) : null, sx: ev ? n(ev.screenX) : null, sy: ev ? n(ev.screenY) : null };
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function html(d) {
    return '<b>' + esc(d.tipo) + '</b> · ' + (d.id ? '<i>#' + esc(d.id) + '</i>' : '<i>(sem id)</i>' + (d.pai ? ' dentro de <i>#' + esc(d.pai) + '</i>' : '')) +
      '<small>tela x ' + d.x + ' · y ' + d.y + ' · ' + d.w + '×' + d.h + ' px</small>' +
      (d.mx != null ? '<small>mouse ' + d.mx + ',' + d.my + ' · monitor ' + d.sx + ',' + d.sy + '</small>' : '') +
      (d.dica ? '<small>dica: ' + esc(d.dica) + '</small>' : '');
  }
  const texto = d => d.tipo + ' ' + (d.id ? '#' + d.id : '(sem id)' + (d.pai ? ' dentro de #' + d.pai : '')) + ' | tela x=' + d.x + ' y=' + d.y + ' ' + d.w + 'x' + d.h + 'px' + (d.mx != null ? ' | mouse ' + d.mx + ',' + d.my + ' monitor ' + d.sx + ',' + d.sy : '') + (d.dica ? ' | dica: ' + d.dica : '') + ' | página ' + (location.pathname.split('/').pop() || '');

  /* ---------- peças visuais ---------- */
  function cria(classe, pop) {
    const d = document.createElement('div'); d.className = classe; if (pop && temPop) d.setAttribute('popover', 'manual'); (document.body || document.documentElement).appendChild(d); return d;
  }
  const abre = d => { if (temPop) { try { if (!d.matches(':popover-open')) d.showPopover(); } catch (e) {} } else d.style.display = 'block'; };
  const fecha = d => { if (!d) return; if (temPop) { try { d.hidePopover(); } catch (e) {} } else d.style.display = 'none'; };
  function iniPecas() {
    if (!tip) { tip = cria('dicaui-tip', true); caixa = cria('dicaui-caixa', true); fecha(tip); fecha(caixa); }
  }
  function posiciona(el, x, y) {
    const w = el.offsetWidth || 240, h = el.offsetHeight || 60;
    el.style.left = Math.max(4, Math.min(innerWidth - w - 4, x + 14)) + 'px';
    el.style.top = Math.max(4, Math.min(innerHeight - h - 4, y + 18)) + 'px';
  }
  function contorna(e) { const r = e.getBoundingClientRect(); Object.assign(caixa.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' }); abre(caixa); }

  /* ---------- eventos ---------- */
  function devolveTitle() { if (ult && ult.dataset && ult.dataset.dicauiT != null) { ult.setAttribute('title', ult.dataset.dicauiT); delete ult.dataset.dicauiT; } }
  function mover(ev) {
    if (!ligado) return;
    const crua = ev.target; if (!crua || (crua.closest && crua.closest('.dicaui-tip,.dicaui-fixa,.dicaui-caixa'))) return;
    const e = alvoDe(crua);
    if (e !== ult) {
      devolveTitle(); ult = e;
      if (e.getAttribute && e.hasAttribute('title') && !(e.dataset && e.dataset.dicauiT != null)) { e.dataset.dicauiT = e.getAttribute('title'); e.removeAttribute('title'); }
      contorna(e);
    }
    const d = descreve(e, ev); tip.innerHTML = html(d); abre(tip); posiciona(tip, ev.clientX, ev.clientY);
  }
  function sair() { fecha(tip); fecha(caixa); devolveTitle(); ult = null; }
  function fixar(ev) {
    if (!ligado || !ev.altKey) return;
    const e = alvoDe(ev.target); if (e.closest && e.closest('.dicaui-fixa')) return;
    ev.preventDefault(); ev.stopPropagation();                 // Alt+clique é só para fixar: não aciona o botão por baixo
    const d = descreve(e, ev); fechaFixa();
    fixa = cria('dicaui-fixa', true); fixa.innerHTML = html(d) + '<button type="button" class="cp">Copiar</button><button type="button" class="x" aria-label="Fechar">✕</button>';
    fixa.querySelector('.x').onclick = fechaFixa;
    fixa.querySelector('.cp').onclick = ev2 => { const t = texto(d); try { navigator.clipboard.writeText(t); ev2.target.textContent = 'Copiado'; } catch (x) { ev2.target.textContent = 'Selecione e copie'; } };
    abre(fixa); posiciona(fixa, ev.clientX, ev.clientY); contorna(e);
  }
  function fechaFixa() { if (fixa) { fecha(fixa); fixa.remove(); fixa = null; } fecha(caixa); }
  document.addEventListener('mousemove', mover, true);
  document.addEventListener('mouseleave', sair, true);
  document.addEventListener('click', fixar, true);
  document.addEventListener('keydown', ev => {
    if (ev.altKey && !ev.ctrlKey && !ev.metaKey && (ev.key === 'i' || ev.key === 'I')) { ev.preventDefault(); liga(!ligado, true); }
    else if (ev.key === 'Escape' && fixa) fechaFixa();
  }, true);

  function liga(b, avisa) {
    ligado = !!b; try { localStorage.setItem(CHAVE, ligado ? '1' : '0'); } catch (e) {}
    iniPecas();
    if (!ligado) { sair(); fechaFixa(); }
    if (avisa) { tip.innerHTML = '<b>Dica de interface ' + (ligado ? 'ligada' : 'desligada') + '</b><small>Alt+I liga/desliga · Alt+clique fixa a etiqueta</small>'; abre(tip); posiciona(tip, innerWidth / 2 - 130, 40); setTimeout(() => { if (!ult) fecha(tip); }, 1800); }
  }
  const inicia = () => { iniPecas(); if (ligado) liga(true, false); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
  global.DICAUI = { liga, alterna: () => liga(!ligado, true), ativo: () => ligado, descreve, tipoDe };
})(window);
