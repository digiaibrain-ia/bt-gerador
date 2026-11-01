/* =====================================================================================================================
   ajuda_v0.1.js — BOTÃO "AJUDA" PADRÃO + JANELA DE AJUDA, igual em todo HTML do projeto · 29/10/2026
   Colado (inline) em: mapa_fbs_v0.11, gerenciador_logs_v1.6, api_cards_visor_v0.3, index.html v0.2 (o medidor, o gráfico e o simulador de amostras
   já têm a própria Ajuda). Documento: modulos/AJUDA_v0.1.md.

   REGRA DO PROJETO (decisão do operador, 29/10/2026): "toda HTML tem que vir com AJUDA". Este módulo é o jeito mais barato de cumprir a regra:
   cada página só informa o TEXTO (AJUDA.inicia({...})); o botão, a janela, o fechar (✕ no canto direito, Esc) e a seção padrão da
   "Dica de interface (Alt+I)" já vêm prontos.

   PARA QUE SERVE (leigo): um botão "Ajuda" que abre uma janelinha dizendo, em português simples, para que serve a tela, como usar, o que cada
   botão faz e o significado das palavras técnicas (glossário).

   COMO USAR (programação):
     AJUDA.inicia({ titulo:'Mapa dos FBs', resumo:'texto curto', secoes:[{t:'Como usar', l:['passo 1','passo 2']}], glossario:[['FB','bloco de função']],
                    onde:'header' })      // onde = seletor CSS do lugar do botão; sem ele (ou não achado) o botão fica fixo no canto superior direito
   POR QUE ASSIM (técnico): <dialog> aberto com show() (não modal): não trava a tela de trás, e quem tem o módulo JANELAS ganha o ⤢ automaticamente.
   Sem JANELAS a janela ainda se redimensiona pelo canto (resize:both). Não altera dados, não lê PLC/Node-RED, não envia nada.
   ===================================================================================================================== */
(function (global) {
  'use strict';
  if (global.AJUDA) return;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let dlg = null;
  const css = document.createElement('style');
  css.textContent = `
  #dlgAjuda{position:fixed;top:8vh;left:50%;transform:translateX(-50%);margin:0;width:min(640px,94vw);max-height:84vh;overflow:auto;resize:both;padding:0;
    border:1px solid #7a8794;border-radius:10px;background:#fff;color:#16222e;font:14px/1.45 system-ui,"Segoe UI",sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.4);z-index:2147482000}
  @media (prefers-color-scheme:dark){#dlgAjuda{background:#1b2229;color:#e8edf2;border-color:#4d5964}}
  #dlgAjuda .jt{display:flex;align-items:center;gap:8px;padding:8px 10px 8px 14px;border-bottom:1px solid rgba(128,128,128,.4);position:sticky;top:0;background:inherit}
  #dlgAjuda .jt b{flex:1;font-size:15px}
  #dlgAjuda .jx{width:28px;height:28px;border:1px solid rgba(128,128,128,.55);border-radius:6px;background:transparent;color:inherit;cursor:pointer;font:700 14px/1 system-ui}
  #dlgAjuda .jx:hover{background:rgba(128,128,128,.25)}
  #dlgAjuda .cp{padding:6px 16px 14px}
  #dlgAjuda h3{font-size:13px;margin:14px 0 4px;color:#2a6fb3}
  @media (prefers-color-scheme:dark){#dlgAjuda h3{color:#7db7f0}}
  #dlgAjuda ul{margin:4px 0 4px 18px;padding:0}#dlgAjuda li{margin:2px 0}
  #dlgAjuda dt{font-weight:650;margin-top:4px}#dlgAjuda dd{margin:0 0 2px 0;color:inherit;opacity:.85}
  #dlgAjuda kbd{border:1px solid rgba(128,128,128,.6);border-bottom-width:2px;border-radius:4px;padding:0 5px;font:12px system-ui}
  #bAjudaPadrao{font:600 13px system-ui,sans-serif;padding:5px 12px;border:1px solid #7a8794;border-radius:7px;background:transparent;color:inherit;cursor:pointer}
  #bAjudaPadrao:hover{background:rgba(128,128,128,.22)}
  #bAjudaPadrao.fixo{position:fixed;top:8px;right:10px;z-index:2147481000;background:#fff;color:#16222e}
  @media (prefers-color-scheme:dark){#bAjudaPadrao.fixo{background:#1b2229;color:#e8edf2}}`;
  (document.head || document.documentElement).appendChild(css);

  function inicia(c) {
    c = c || {};
    const corpo = '<p>' + esc(c.resumo || '') + '</p>' +
      (c.secoes || []).map(s => '<h3>' + esc(s.t) + '</h3><ul>' + s.l.map(x => '<li>' + x + '</li>').join('') + '</ul>').join('') +
      ((c.glossario && c.glossario.length) ? '<h3>Glossário</h3><dl>' + c.glossario.map(g => '<dt>' + esc(g[0]) + '</dt><dd>' + g[1] + '</dd>').join('') + '</dl>' : '') +
      '<h3>Descobrir o nome de qualquer elemento da tela</h3><ul><li>Tecle <kbd>Alt</kbd>+<kbd>I</kbd>: ao passar o mouse aparece o tipo (Botão, Chip, Card…), o <b>id de programação</b> e as coordenadas. <kbd>Alt</kbd>+clique fixa a etiqueta e tem o botão Copiar. <kbd>Alt</kbd>+<kbd>I</kbd> de novo desliga.</li></ul>';
    dlg = document.createElement('dialog'); dlg.id = 'dlgAjuda'; dlg.className = 'jan livre';
    dlg.innerHTML = '<div class="jt"><b>Ajuda · ' + esc(c.titulo || document.title) + '</b><button type="button" class="jx" data-fecha aria-label="Fechar">✕</button></div><div class="cp">' + corpo + '</div>';
    document.body.appendChild(dlg);
    dlg.querySelector('.jx').onclick = fecha;
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && dlg.open) fecha(); });
    const b = document.createElement('button'); b.type = 'button'; b.id = 'bAjudaPadrao'; b.textContent = 'Ajuda'; b.setAttribute('aria-haspopup', 'dialog');
    b.title = 'Para que serve esta tela e como usar'; b.onclick = () => (dlg.open ? fecha() : abre());
    const onde = c.onde && document.querySelector(c.onde);
    if (onde) onde.appendChild(b); else { b.classList.add('fixo'); document.body.appendChild(b); }
  }
  const abre = () => { if (dlg && !dlg.open) dlg.show(); };
  const fecha = () => { if (dlg && dlg.open) dlg.close(); };
  global.AJUDA = { inicia, abre, fecha };
})(window);
