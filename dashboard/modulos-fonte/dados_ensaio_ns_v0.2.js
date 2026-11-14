/* =====================================================================================================================
   dados_ensaio_ns_v0.2.js — "DADOS DO ENSAIO" · OPÇÃO "POR Nº DE SÉRIE (MES)" · fluxo mesclado  ·  14/11/2026
   Colado (inline) no medidor 1.10.206, depois do decodificador (decodifica_serie_mwm_v0.3.js) e dos Dados do ensaio. Doc: docs/bt2/modulos/DADOS_ENSAIO_POR_NS_v0.1.md.

   PARA QUE SERVE (leigo): o operador escolhe "Por nº de série (MES)", digita ou lê o NS e a tela preenche Motor, Alternador e Controlador (só pelas normas
   ETD 091 rev.05 gerador / ETD 094 rev.00 torre). Depois ele usa a busca de modelo (catálogo: frequência, tensão, potência, controlador) e digita o que faltar.
   Cada campo mostra de onde veio (barra azul = NS, verde = catálogo, sem barra = digitado). O modo "Manual / print do SAP" é o padrão e fica idêntico ao original.

   REGRA DE TEXTO (pedido do Reginaldo): texto longo NÃO fica na tela. Sobra uma linha curta + o botão ⓘ; o detalhe (decodificação completa, avisos, conflito,
   campos alterados, legenda e EXEMPLOS DA NORMA) abre num painel suspenso (popover por cima do diálogo; fecha com ✕, Esc ou clique fora).

   REGRAS: NS fora da norma = nada é preenchido (o operador preenche à mão). Quem rodar por último vence (NS × catálogo); digitar à mão tira a marca do campo.
   Se o catálogo (sempre Deep Sea) contrariar o controlador do NS, aparece o aviso de conflito. NS novo válido preenche de novo; o mesmo NS não apaga a edição.
   COMO: usa MWM_SERIE.decodificaSerie. Sem textContent→HTML: o NS é texto digitado, tudo entra por textContent. Layout estável: o painel é popover/position:fixed.
   NÃO FAZ: não comanda nada, não fala com PLC/DSE/MES. Ao confirmar, guarda window.__DADOS_ORIGEM (origemDados + ns) para o medidor mandar ao registro.
   API: window.DADOS_ENSAIO_NS = { modo(), decodificado() } · window.__NS_DECOD · window.__NS_ALTERADOS · window.__DADOS_ORIGEM
   ===================================================================================================================== */
(function () {
  'use strict';
  const dlg = document.getElementById('dlgDados');
  if (!dlg || !window.MWM_SERIE) return;
  const $g = id => document.getElementById(id), box = $g('dNsBox');

  /* ---------- CSS próprio (sem ::after absoluto; hover não muda tamanho) ---------- */
  if (!$g('dns-css')) {
    const st = document.createElement('style'); st.id = 'dns-css';
    st.textContent = `
#dlgDados .dmodo{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;margin:0 0 10px;padding:8px 12px;border:1px solid var(--jazul,#2b6cb0);border-radius:8px}
#dlgDados .dmodo .dmodo-t{font-weight:600;font-size:12.5px}
#dlgDados .dmodo label{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;cursor:pointer}
#dlgDados .dnsbox{margin:0 0 10px;padding:6px 10px;border-left:4px solid var(--jazul,#2b6cb0);background:rgba(43,108,176,.07);font-size:13px;line-height:1.4}
#dlgDados .dnsbox[hidden]{display:none}
#dlgDados .dns-l1{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;min-width:0}
#dlgDados .dns-l1 .dns-t{font-weight:600;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
#dlgDados .dns-ok{color:inherit}#dlgDados .dns-er{color:#b42318}
#dlgDados .dns-chip{display:inline-block;padding:0 8px;border-radius:10px;border:1px solid var(--line,#b9c4d0);font-size:12px;white-space:nowrap}
#dlgDados .dns-chip.n{color:#3b6fd8;border-color:#3b6fd8}#dlgDados .dns-chip.c{color:#2e8b57;border-color:#2e8b57}#dlgDados .dns-chip.a{color:#9a6700;border-color:#c9a227}
#dlgDados .dns-i{margin-left:auto;border:1px solid var(--line,#b9c4d0);background:transparent;color:inherit;border-radius:50%;width:26px;height:26px;padding:0;font-size:15px;line-height:1;cursor:pointer}
#dlgDados.dns-ns .sapimp{display:none}
.jan input.dns-alt{outline:2px solid #3b6fd8;background:#eaf0ff}
.jan input.dns-o-ns{box-shadow:inset 4px 0 0 #3b6fd8}
.jan input.dns-o-cat{box-shadow:inset 4px 0 0 #2e8b57}
.dns-pop{position:fixed;margin:0;inset:auto;z-index:2147483000;width:min(440px,92vw);max-height:70vh;overflow:auto;padding:12px 14px 12px;border-radius:9px;border:1px solid var(--line,#8a97a6);background:var(--card,#fff);color:var(--ink,#16202b);box-shadow:0 8px 24px rgba(0,0,0,.35);font:13px/1.45 system-ui,Segoe UI,sans-serif;text-align:left}
.dns-pop{display:none}.dns-pop.dns-aberto{display:block}   /* a classe dns-aberto liga o painel com ou sem suporte a popover */
.dns-pop h5{margin:10px 0 3px;font-size:12.5px}.dns-pop h5:first-of-type{margin-top:0}
.dns-pop .dns-x{position:absolute;right:6px;top:6px;border:0;background:transparent;color:inherit;font-size:16px;cursor:pointer;padding:2px 6px}
.dns-pop ul{margin:0;padding-left:18px}.dns-pop li{margin:1px 0}
.dns-pop .dns-av{color:#9a6700}.dns-pop .dns-er{color:#b42318}
.dns-pop .dns-ex{display:flex;align-items:baseline;gap:8px;margin:2px 0}.dns-pop .dns-ex code{font-weight:700}
.dns-pop .dns-ex button{margin-left:auto;font-size:12px;padding:1px 8px;cursor:pointer}
`;
    document.head.appendChild(st);
  }

  /* ---------- estado ---------- */
  let modo = 'manual', aplicado = '', ultimo = null, conflito = '', aberto = false;
  const base = {};        // 'r|c' -> valor que o NS pôs (para marcar "alterado em relação ao NS")
  const ORIG = {};        // id do campo -> 'ns' | 'cat'
  let nomesAlt = [];
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  /* ---------- helpers de campo ---------- */
  const inpEq = (nome, c) => { const i = (DADOS.equip || []).findIndex(r => r[0] === nome); return i < 0 ? null : $g('dEquip').querySelector('input[data-r="' + i + '"][data-c="' + c + '"]'); };
  const chave = e => e.id || ('eq' + e.dataset.r + '_' + e.dataset.c);
  const camposOrig = () => [...$g('dEquip').querySelectorAll('input'), $g('dFreq'), $g('dTens'), $g('dPot')];
  function fabMod(cat, desc) { // descrição da tabela da norma -> [fabricante, modelo]
    if (/^Sem /i.test(desc)) return ['-', '-'];
    if (cat === 'motor') { const p = desc.split(' · '); if (/^S[ée]rie/i.test(p[0])) return ['MWM', desc]; return [p[0], p.slice(1).join(' · ') || '-']; }
    if (cat === 'alt') return [desc, '-'];
    let m = /^Deep Sea (\d+)/i.exec(desc); if (m) return ['DEEP SEA', 'DSE ' + m[1]];
    m = /^Deif (.+)/i.exec(desc); if (m) return ['DEIF', m[1]];
    return [desc, '-'];
  }
  const desc = (cp) => cp ? (cp.descricao || ('letra ' + cp.codigo + ' (desconhecida)')) : '';

  /* ---------- marcas na tela ---------- */
  function atualizaMarcas() { // compara cada campo com o que o NS pôs; marca os alterados
    nomesAlt = [];
    Object.keys(base).forEach(k => { const [r, c] = k.split('|'); const e = $g('dEquip').querySelector('input[data-r="' + r + '"][data-c="' + c + '"]'); if (!e) return;
      const alt = e.value.trim() !== base[k]; e.classList.toggle('dns-alt', alt);
      if (alt) { e.title = 'Alterado em relação ao NS (o NS indicava: ' + base[k] + ')'; nomesAlt.push((DADOS.equip[+r] || [])[0] + ' ' + (+c === 1 ? 'fabricante' : 'modelo')); } else if (/^Alterado em relação/.test(e.title)) e.removeAttribute('title'); });
    window.__NS_ALTERADOS = nomesAlt.slice();
  }
  function pintaOrigem() {
    let nn = 0, nc = 0;
    camposOrig().forEach(e => { e.classList.remove('dns-o-ns', 'dns-o-cat'); const o = modo === 'ns' ? ORIG[chave(e)] : null;
      if (o && e.value.trim() !== '') { e.classList.add('dns-o-' + o); if (o === 'ns') nn++; else nc++; if (!e.classList.contains('dns-alt')) e.title = 'Origem: ' + (o === 'ns' ? 'nº de série (MES)' : 'busca de modelo (catálogo)'); }
      else if (!e.classList.contains('dns-alt') && /^Origem: /.test(e.title)) e.removeAttribute('title'); });
    return [nn, nc];
  }
  function limpaMarcas() { Object.keys(base).forEach(k => delete base[k]); dlg.querySelectorAll('.dns-alt').forEach(e => { e.classList.remove('dns-alt'); if (/^Alterado em relação/.test(e.title)) e.removeAttribute('title'); }); nomesAlt = []; window.__NS_ALTERADOS = []; }
  const zeraOrigem = () => { Object.keys(ORIG).forEach(k => delete ORIG[k]); conflito = ''; };

  /* ---------- painel suspenso (ⓘ) ---------- */
  const pop = el('div', 'dns-pop'); pop.setAttribute('popover', 'manual'); pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Detalhes do nº de série'); dlg.appendChild(pop);
  const temPop = 'showPopover' in HTMLElement.prototype;
  let btnI = null;
  function posiciona() {
    if (!btnI || !aberto) return; const r = btnI.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
    let l = Math.min(Math.max(8, r.right - w), innerWidth - w - 8), t = r.bottom + 6; if (t + h > innerHeight - 8) t = Math.max(8, r.top - h - 6);
    pop.style.left = l + 'px'; pop.style.top = t + 'px';
  }
  function abrePop() { aberto = true; conteudoPop(); if (temPop) { try { pop.showPopover(); } catch (e) {} } pop.classList.add('dns-aberto'); posiciona(); if (btnI) btnI.setAttribute('aria-expanded', 'true'); }
  function fechaPop() { aberto = false; if (temPop) { try { pop.hidePopover(); } catch (e) {} } pop.classList.remove('dns-aberto'); if (btnI) btnI.setAttribute('aria-expanded', 'false'); }
  const secao = (t) => pop.appendChild(el('h5', null, t));
  const lista = (itens, cls) => { const u = el('ul'); itens.forEach(i => u.appendChild(el('li', cls, i))); pop.appendChild(u); };
  const EXEMPLOS = [['ETD 091 · 5.1', 'GDWAØ4447'], ['ETD 091 · 5.2', 'DRCBØ4447'], ['ETD 091 · 5.3', 'DTMFØ4447'], ['ETD 094 · 5.1', 'DTMØ4447'], ['ETD 094 · 5.2', 'SNNØ4447'], ['ETD 094 · 5.3', 'BNNØ4447']];
  function conteudoPop() {
    pop.textContent = ''; const r = ultimo; const x = el('button', 'dns-x', '✕'); x.type = 'button'; x.setAttribute('aria-label', 'Fechar'); x.onclick = fechaPop; pop.appendChild(x);
    secao('O que o nº de série diz');
    if (!r) lista(['Digite ou leia o nº de série do MES no campo "Nº de série". Motor, Alternador e Controlador serão preenchidos e continuam editáveis.']);
    else if (!r.valido) { lista(r.erros, 'dns-er'); lista(['Nenhum campo foi preenchido pelo NS. Use a busca de modelo ou preencha à mão.']); }
    else {
      const it = [(r.tipo === 'gerador' ? 'Gerador' : 'Torre de iluminação') + ' · ' + r.norma + ' · nº sequencial ' + r.sequencial];
      if (r.combustivel) it.push('Combustível: ' + desc(r.combustivel)); if (r.fonteEnergia) it.push('Fonte de energia: ' + desc(r.fonteEnergia));
      it.push('Motor: ' + desc(r.motor)); it.push('Alternador: ' + desc(r.alternador)); if (r.controlador) it.push('Controlador: ' + desc(r.controlador)); lista(it);
    }
    if (r && r.avisos && r.avisos.length) { secao('Avisos'); lista(r.avisos, 'dns-av'); }
    if (conflito) { secao('Conflito com o catálogo'); lista([conflito], 'dns-av'); }
    if (nomesAlt.length) { secao('Alterados em relação ao NS (' + nomesAlt.length + ')'); lista(nomesAlt); }
    secao('Origem dos campos'); lista(['Barra azul: veio do nº de série.', 'Barra verde: veio da busca de modelo (catálogo).', 'Sem barra: digitado. O que faltar, preencha à mão.', 'Quem rodar por último vence; digitar à mão tira a marca.']);
    secao('Exemplos da norma (clique em usar)');
    EXEMPLOS.forEach(([n, s]) => { const d = window.MWM_SERIE.decodificaSerie(s); const l = el('div', 'dns-ex'); l.appendChild(el('span', null, n)); l.appendChild(el('code', null, s));
      l.appendChild(el('span', null, d.valido ? (d.tipo === 'gerador' ? 'gerador' : 'torre') + ' · nº ' + d.sequencial : '')); const b = el('button', null, 'usar'); b.type = 'button';
      b.onclick = () => { const f = $g('dServ'); f.value = s; f.dispatchEvent(new Event('input', { bubbles: true })); }; l.appendChild(b); pop.appendChild(l); });
  }

  /* ---------- linha curta (sempre visível) ---------- */
  function render() {
    box.textContent = ''; btnI = null;
    if (modo !== 'ns') { box.hidden = true; fechaPop(); return; }
    box.hidden = false; const r = ultimo, [nn, nc] = pintaOrigem(); const l1 = el('div', 'dns-l1');
    if (!r) l1.appendChild(el('span', 'dns-t', 'Digite ou leia o nº de série do MES.'));
    else if (!r.valido) l1.appendChild(el('span', 'dns-t dns-er', 'Nº de série não reconhecido: preencha à mão ou use a busca de modelo.'));
    else l1.appendChild(el('span', 'dns-t dns-ok', (r.tipo === 'gerador' ? 'Gerador' : 'Torre') + ' · ' + r.norma + ' · nº ' + r.sequencial));
    if (r && r.valido) { l1.appendChild(el('span', 'dns-chip n', '■ NS ' + nn)); l1.appendChild(el('span', 'dns-chip c', '■ catálogo ' + nc)); }
    const nav = (r && r.avisos ? r.avisos.length : 0); if (nav) l1.appendChild(el('span', 'dns-chip a', '⚠ ' + nav + (nav > 1 ? ' avisos' : ' aviso')));
    if (conflito) l1.appendChild(el('span', 'dns-chip a', '⚠ conflito'));
    if (nomesAlt.length) l1.appendChild(el('span', 'dns-chip a', '✎ ' + nomesAlt.length + (nomesAlt.length > 1 ? ' alterados' : ' alterado')));
    const b = el('button', 'dns-i', 'ⓘ'); b.type = 'button'; b.title = 'Detalhes: o que o NS diz, avisos, origem dos campos e exemplos da norma'; b.setAttribute('aria-haspopup', 'dialog'); b.setAttribute('aria-expanded', aberto ? 'true' : 'false'); b.setAttribute('aria-label', 'Detalhes do nº de série');
    b.onclick = () => { aberto ? fechaPop() : abrePop(); }; l1.appendChild(b); btnI = b; box.appendChild(l1);
    if (aberto) { conteudoPop(); posiciona(); }
  }
  const refresca = () => { atualizaMarcas(); render(); };

  /* ---------- decodificação ---------- */
  function aplica(r) { // põe o que o NS diz na tabela de equipamento e guarda a base para marcar alterações
    limpaMarcas(); conflito = '';
    const itens = [['Motor', 'motor', r.motor], ['Alternador', 'alt', r.alternador]]; if (r.controlador) itens.push(['Controlador', 'ctrl', r.controlador]);
    itens.forEach(([nome, cat, cp]) => { if (!cp || !cp.conhecido) return; const fm = fabMod(cat, cp.descricao);
      [1, 2].forEach((c, k) => { const e = inpEq(nome, c); if (!e) return; e.value = fm[k]; base[e.dataset.r + '|' + c] = fm[k]; ORIG[chave(e)] = 'ns'; }); });
  }
  function decodifica() {
    if (modo !== 'ns') return;
    const txt = $g('dServ').value, n = window.MWM_SERIE.normaliza(txt);
    if (!n) { aplicado = ''; ultimo = null; window.__NS_DECOD = null; limpaMarcas(); refresca(); return; }
    const r = window.MWM_SERIE.decodificaSerie(txt); ultimo = r; window.__NS_DECOD = r;
    if (r.valido && n !== aplicado) { aplicado = n; aplica(r); }
    refresca();
  }
  function setModo(m) {
    modo = m; dlg.classList.toggle('dns-ns', m === 'ns'); dlg.dataset.dadosModo = m; zeraOrigem();
    const rd = dlg.querySelector('input[name=dModo][value=' + m + ']'); if (rd) rd.checked = true;
    if (m === 'ns') { aplicado = ''; decodifica(); }
    else { limpaMarcas(); aplicado = ''; ultimo = null; window.__NS_DECOD = null; fechaPop(); render(); }
  }

  /* ---------- ligações com a tela ---------- */
  dlg.querySelectorAll('input[name=dModo]').forEach(r => r.addEventListener('change', () => { if (r.checked) setModo(r.value); }));
  $g('dServ').addEventListener('input', decodifica);
  $g('dEquip').addEventListener('input', () => { if (modo === 'ns') refresca(); });
  ['dLimpa', 'dRepete', 'dPadrao'].forEach(id => { const b = $g(id); if (b) b.addEventListener('click', () => { if (modo === 'ns') { zeraOrigem(); limpaMarcas(); aplicado = ''; decodifica(); } }); }); // roda depois do clique original
  dlg.addEventListener('close', () => { if (modo !== 'manual') setModo('manual'); });
  dlg.addEventListener('cancel', e => { if (aberto) { e.preventDefault(); fechaPop(); } });          // Esc fecha primeiro o painel, não o diálogo
  document.addEventListener('pointerdown', e => { if (aberto && !pop.contains(e.target) && !(btnI && btnI.contains(e.target))) fechaPop(); }, true);
  window.addEventListener('resize', posiciona); dlg.addEventListener('scroll', posiciona, true);
  dlg.addEventListener('input', e => { if (modo !== 'ns' || !e.isTrusted) return; const t = e.target; // digitação real do operador = campo passa a ser "digitado"
    if (t === $g('dFreq') || t === $g('dTens') || t === $g('dPot')) delete ORIG[t.id]; else if (t.closest && t.closest('#dEquip')) delete ORIG[chave(t)]; else return; refresca(); });
  const fich0 = window.fichaModelo;   // o catálogo termina sempre chamando fichaModelo: gancho para marcar o que ele preencheu
  if (typeof fich0 === 'function') window.fichaModelo = function (d) {
    const r = fich0.apply(this, arguments);
    if (modo === 'ns' && d) {
      ['dFreq', 'dTens', 'dPot'].forEach(id => { if ($g(id).value.trim() !== '') ORIG[id] = 'cat'; });
      [1, 2].forEach(c => { const e = inpEq('Controlador', c); if (e && e.value.trim() !== '') ORIG[chave(e)] = 'cat'; });
      conflito = ''; const u = ultimo;
      if (u && u.valido && u.controlador && u.controlador.conhecido && !/^Deep Sea/i.test(u.controlador.descricao)) conflito = 'O nº de série indica o controlador "' + u.controlador.descricao + '", mas o modelo do catálogo é Deep Sea. O campo ficou com o do catálogo: confira.';
      refresca();
    }
    return r;
  };
  // ao confirmar (fase de captura: roda ANTES do tratamento original): normaliza o NS e guarda a origem dos dados para o envio ao registro
  $g('fDados').addEventListener('submit', () => {
    try { $g('dServ').value = window.MWM_SERIE.normaliza($g('dServ').value); } catch (x) {}
    if (modo === 'ns' && ultimo) window.__DADOS_ORIGEM = { origemDados: 'ns', ns: { valido: ultimo.valido === true, tipo: ultimo.tipo || '', prefixo: ultimo.prefixo || '', sequencial: ultimo.sequencial == null ? null : ultimo.sequencial, alterados: (window.__NS_ALTERADOS || []).slice(), avisos: (ultimo.avisos || []).concat(ultimo.erros || []) } };
    else window.__DADOS_ORIGEM = { origemDados: modo === 'ns' ? 'ns' : 'manual', ns: null };
  }, true);
  window.DADOS_ENSAIO_NS = { modo: () => modo, decodificado: () => ultimo };
})();
