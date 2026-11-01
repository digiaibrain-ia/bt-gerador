/* =====================================================================================================================
   exportar_menu_v0.1.js — MENU ÚNICO "Exportar ▾" + gerador mínimo de PDF (sem biblioteca, funciona offline)
   Projeto bancos de teste · 29/10/2026 · fonte dos trechos que vão colados (inline) em: grafico_ensaio_v0.5, mapa_fbs_v0.7, gerenciador_logs_v1.4.

   PARA QUE SERVE (leigo): um botão só, "Exportar ▾", que abre uma listinha com TODOS os formatos daquela tela (PDF, imagem, planilha, texto…).
   Antes cada tela tinha botões soltos e o menu aparecia ATRÁS das janelas; agora ele aparece sempre por cima.

   POR QUE (técnico): janelas <dialog> abertas com showModal() ficam na "camada de cima" (top layer) do navegador; um <div> comum, mesmo com
   z-index enorme, fica por baixo delas. A solução é o atributo popover (showPopover()), que também entra na camada de cima.
   Se o navegador não tiver popover (Chrome < 114), cai no modo antigo (div fixo com z-index alto).

   API:
     EXPMENU.menu(botao, [{rot, dica, fn}, ...])   abre o menu embaixo do botão (Esc ou clique fora fecha; setas ↑ ↓ navegam)
     EXPMENU.baixa(blob, nome)                      download de um Blob
     PDFMIN.imagem(canvas, titulo, linhas[])        -> Blob de um PDF A4 paisagem de 1 página: título, linhas de texto e a imagem do canvas
   NÃO FAZ: não comanda nada, não lê PLC/DSE, não grava em disco sozinho (só o navegador, no download).
   ===================================================================================================================== */
const EXPMENU = (function () {
  'use strict';
  let m = null;
  /* estilo próprio (a página não precisa ter CSS do menu). Cores neutras, legíveis em tema claro e escuro. */
  (function () {
    if (document.getElementById('expmenu-css')) return;
    const s = document.createElement('style'); s.id = 'expmenu-css';
    s.textContent = '.expmenu{position:fixed;margin:0;inset:auto;z-index:2147483000;background:#fff;color:#1b2a3a;border:1px solid #9aa5b1;border-radius:6px;box-shadow:0 6px 18px rgba(0,0,0,.35);display:flex;flex-direction:column;min-width:210px;max-width:min(340px,96vw);padding:3px;overflow:visible;font:13px system-ui,Segoe UI,Arial,sans-serif}' +
      '.expmenu button{border:0;background:none;text-align:left;padding:7px 10px;font:inherit;color:inherit;cursor:pointer;border-radius:4px}' +
      '.expmenu button:hover,.expmenu button:focus-visible{background:#e8eef6;outline:none}' +
      '.expmenu small{display:block;color:#51606f;font-size:11px}' +
      '.expmenu hr{border:0;border-top:1px solid #d3d9e0;margin:3px 2px;width:auto}';
    document.head.appendChild(s);
  })();
  const fecha = () => {
    if (m) { try { if (m.hidePopover && m.matches(':popover-open')) m.hidePopover(); } catch (e) {} m.remove(); m = null; }
    document.removeEventListener('pointerdown', fora, true); document.removeEventListener('keydown', tecla, true);
  };
  const fora = e => { if (m && !m.contains(e.target)) fecha(); };
  const tecla = e => {
    if (e.key === 'Escape') { fecha(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const bs = [...m.querySelectorAll('button')], i = bs.indexOf(document.activeElement);
      bs[(i + (e.key === 'ArrowDown' ? 1 : bs.length - 1)) % bs.length].focus(); e.preventDefault();
    }
  };
  function menu(btn, itens) {
    fecha();
    m = document.createElement('div'); m.className = 'expmenu'; m.setAttribute('role', 'menu');
    itens.forEach(it => {
      if (it === '-') { m.appendChild(document.createElement('hr')); return; }
      const b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'menuitem');
      b.innerHTML = it.rot + (it.dica ? '<small>' + it.dica + '</small>' : '');
      b.onclick = () => { fecha(); try { it.fn(); } catch (e) { console.error('Exportar', e); alert('Não foi possível exportar: ' + (e && e.message || e)); } };
      m.appendChild(b);
    });
    m.setAttribute('popover', 'manual'); document.body.appendChild(m);
    try { m.showPopover(); } catch (e) { /* sem popover: fica o z-index alto do CSS */ }
    const r = btn.getBoundingClientRect();
    m.style.left = Math.max(4, Math.min(r.left, innerWidth - m.offsetWidth - 8)) + 'px';
    m.style.top = Math.max(4, Math.min(r.bottom + 2, innerHeight - m.offsetHeight - 8)) + 'px';
    setTimeout(() => { document.addEventListener('pointerdown', fora, true); document.addEventListener('keydown', tecla, true); }, 0);
    const p = m.querySelector('button'); if (p) p.focus();
  }
  function baixa(blob, nome) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  return { menu, baixa, fecha };
})();

/* ---------- gerador mínimo de PDF (A4 paisagem 842×595 pt; fonte Helvetica; 1 imagem JPEG por documento) ---------- */
const PDFMIN = (function () {
  'use strict';
  const esc = s => String(s).replace(/[–—]/g, '-').replace(/[^\x00-\xFF]/g, '?').replace(/[\\()]/g, '\\$&');
  function Pg() { this.o = []; }
  /* texto: x,y em pt a partir do canto SUPERIOR esquerdo; b = negrito */
  Pg.prototype.t = function (x, y, s, sz, b) { this.o.push('BT /' + (b ? 'F2' : 'F1') + ' ' + sz + ' Tf ' + x.toFixed(2) + ' ' + (595 - y).toFixed(2) + ' Td (' + esc(s) + ') Tj ET'); };
  Pg.prototype.im = function (x, y, w, h) { this.o.push('q ' + w.toFixed(2) + ' 0 0 ' + h.toFixed(2) + ' ' + x.toFixed(2) + ' ' + (595 - y - h).toFixed(2) + ' cm /Im1 Do Q'); };
  function blob(pgs, jpg, iw, ih) {
    const enc = s => { const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 255; return u; };
    const ch = [], off = []; let len = 0; const add = u => { ch.push(u); len += u.length; };
    const N = 5 + 2 * pgs.length;
    add(enc('%PDF-1.4\n'));
    const obj = (n, body) => { off[n] = len; add(enc(n + ' 0 obj\n' + body + '\nendobj\n')); };
    const stm = (n, dict, bytes) => { off[n] = len; add(enc(n + ' 0 obj\n<<' + dict + '/Length ' + bytes.length + '>>\nstream\n')); add(bytes); add(enc('\nendstream\nendobj\n')); };
    obj(1, '<</Type/Catalog/Pages 2 0 R>>');
    obj(2, '<</Type/Pages/Kids[' + pgs.map((_, i) => (7 + 2 * i) + ' 0 R').join(' ') + ']/Count ' + pgs.length + '>>');
    obj(3, '<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>');
    obj(4, '<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>');
    stm(5, '/Type/XObject/Subtype/Image/Width ' + iw + '/Height ' + ih + '/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode', jpg);
    pgs.forEach((p, i) => {
      stm(6 + 2 * i, '', enc(p.o.join('\n')));
      obj(7 + 2 * i, '<</Type/Page/Parent 2 0 R/MediaBox[0 0 842 595]/Contents ' + (6 + 2 * i) + ' 0 R/Resources<</Font<</F1 3 0 R/F2 4 0 R>>/XObject<</Im1 5 0 R>>>>>>');
    });
    const xr = len; let x = 'xref\n0 ' + (N + 1) + '\n0000000000 65535 f \n';
    for (let n = 1; n <= N; n++) x += String(off[n]).padStart(10, '0') + ' 00000 n \n';
    x += 'trailer\n<</Size ' + (N + 1) + '/Root 1 0 R>>\nstartxref\n' + xr + '\n%%EOF';
    add(enc(x));
    return new Blob(ch, { type: 'application/pdf' });
  }
  /** PDF de 1 página: título, linhas de texto e a imagem do canvas (proporção preservada, cabe no A4 paisagem). */
  function imagem(cv, titulo, linhas) {
    const pg = new Pg(); pg.t(36, 34, titulo, 14, true);
    let y = 52; (linhas || []).forEach(l => { pg.t(36, y, l, 8.5); y += 12; });
    const iw = cv.width, ih = cv.height, top = y + 4, maxW = 770, maxH = 595 - top - 30;
    let w = maxW, h = w * ih / iw; if (h > maxH) { h = maxH; w = h * iw / ih; }
    pg.im(36, top, w, h);
    pg.t(36, 575, 'Gerado em ' + new Date().toLocaleString('pt-BR'), 7);
    const jpg = Uint8Array.from(atob(cv.toDataURL('image/jpeg', 0.92).split(',')[1]), c => c.charCodeAt(0));
    return blob([pg], jpg, iw, ih);
  }
  return { Pg, blob, imagem };
})();
