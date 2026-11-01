/* =====================================================================================================================
   api_cards_v0.1.js — API INTERNA DOS CARDS (dentro do navegador) · projeto bancos de teste · 29/10/2026
   Fonte dos trechos colados (inline) em: medidor_gerador_v1.10.112 (publicador) e grafico_ensaio_v0.7 / api_cards_visor_v0.1 (clientes).

   PARA QUE SERVE (leigo): cada "card" da tela do medidor (tensões, correntes, potência, água, rotação, bateria, banco de cargas, modo, etapas...)
   passa a ser também uma "tomada" que os outros HTML (gráfico, mapa dos FBs, visor) podem ler, em tempo real, SEM ligar no PLC/Node-RED de novo.
   É SOMENTE LEITURA: nenhum HTML consegue comandar chave, gerador ou PLC por aqui.

   POR QUÊ (técnico): não cria rota nova no Node-RED (nenhum endereço inventado). O medidor já lê tudo; este módulo só RE-PUBLICA o que a tela já tem:
     (1) cards lidos do próprio DOM: cada <div class="card"> com um <div class="v" id="..."> vira {id, painel, rotulo, texto, valor, unidade, classes};
     (2) blocos estruturados fornecidos pelo medidor (usaFonte): ensaio, etapas, gerador, links (PLC/Node-RED/HTML) e operador.
   Canal: BroadcastChannel 'bt2-api' (mesmo navegador) — mesmo padrão do gráfico ('bt2-grafico'). O medidor só publica enquanto alguém "escuta":
     cliente → medidor: {k:'oi'} (batimento a cada 3 s) · {k:'pede'} (quer o estado já)
     medidor → cliente: {k:'snap', v:1, t, cards:{id:{...}}, links:{...}, ensaio:{...}, etapas:[...], gerador:{...}, operador:{...}}   (1 por segundo)
   Cada snapshot é COMPLETO (não incremental): perder um não corrompe nada (prevenção de registros perdidos/duplicados = o cliente sempre sobrescreve).
   Dado velho: o cliente marca "sem dados" se passar de 4 s sem snapshot (mesma regra do sinal do gráfico).
   LIMITES: só funciona entre páginas do MESMO navegador/origem (BroadcastChannel). Notebook em outro aparelho continua usando a leitura direta /api/gerador.
   ===================================================================================================================== */
(function (global) {
  'use strict';
  const CANAL = 'bt2-api', VERSAO_API = 1, PERIODO_MS = 1000, OUVINTE_MS = 6000, VELHO_MS = 4000;

  /* ---------- números: "1.234,5" / "98,2" / "—" → número ou null ---------- */
  function paraNumero(t) {
    if (t == null) return null;
    const m = String(t).replace(/\s/g, '').match(/-?\d+(?:[.,]\d+)*/);
    if (!m) return null;
    let s = m[0];
    if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.'); else if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, '');
    const n = parseFloat(s); return isFinite(n) ? n : null;
  }

  /* =======================  LADO DO MEDIDOR (publicador)  ======================= */
  let fonte = null, canal = null, ultOi = 0, timer = null, ultSnap = null;
  const assinantes = [];

  /** Lê os cards direto da tela. Só leitura do DOM; nada é escrito nela. */
  function leCards() {
    const out = {};
    document.querySelectorAll('section.panel .card').forEach(c => {
      const v = c.querySelector('.v[id]'); if (!v) return;
      const l = c.querySelector('.l'), u = v.querySelector('.u'), p = c.closest('section.panel');
      const tx = Array.from(v.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();   // só o texto do valor (sem a unidade)
      out[v.id] = { id: v.id, painel: p ? p.id : null, rotulo: l ? l.textContent.trim() : v.id, texto: tx || v.textContent.trim(), valor: paraNumero(tx), unidade: u ? u.textContent.trim() : '', classes: v.className || '' };
    });
    return out;
  }
  function leLinks() {
    const o = {};
    document.querySelectorAll('.lnk .lk[id]').forEach(e => { const s = e.querySelector('small'); o[e.id] = { estado: e.dataset.s || '', texto: s ? s.textContent.trim() : '' }; });
    return o;
  }
  /** Monta o snapshot completo. Qualquer erro na fonte do medidor é engolido: a API nunca derruba a tela. */
  function snapshot() {
    let extra = {};
    try { extra = fonte ? (fonte() || {}) : {}; } catch (e) { extra = { erroFonte: String(e && e.message || e) }; }
    return Object.assign({ k: 'snap', v: VERSAO_API, t: Date.now(), cards: leCards(), links: leLinks() }, extra);
  }
  function publica() {
    if (!canal) return;
    ultSnap = snapshot();
    try { canal.postMessage(ultSnap); } catch (e) { /* mensagem não clonável: ignora, o próximo ciclo reenvia */ }
    assinantes.forEach(fn => { try { fn(ultSnap); } catch (e) {} });
  }
  /** Liga o publicador. fonteFn() devolve os blocos estruturados do medidor (ensaio, etapas, gerador, operador). */
  function inicia(fonteFn) {
    fonte = fonteFn;
    try { if ('BroadcastChannel' in global) canal = new BroadcastChannel(CANAL); } catch (e) { canal = null; }
    if (canal) canal.onmessage = ev => {
      const m = ev.data; if (!m || typeof m !== 'object') return;
      if (m.k === 'oi') { ultOi = Date.now(); if (!timer) timer = setInterval(ciclo, PERIODO_MS); }
      else if (m.k === 'pede') { ultOi = Date.now(); publica(); }
      // QUALQUER outra mensagem (inclusive comandos) é ignorada de propósito: esta API é somente leitura.
    };
    return true;
  }
  function ciclo() {
    if (Date.now() - ultOi > OUVINTE_MS) { clearInterval(timer); timer = null; return; }   // ninguém escutando: não gasta nada
    publica();
  }

  /* =======================  LADO DO CLIENTE (outros HTML)  ======================= */
  /** cliente(fn, opc): chama fn(snapshot|null, info) a cada snapshot; fn(null,{semDados:true}) se passar de 4 s sem receber. */
  function cliente(fn, opc) {
    opc = opc || {}; let ch = null, ult = 0, ultS = null, velho = true;
    try { if ('BroadcastChannel' in global) ch = new BroadcastChannel(CANAL); } catch (e) {}
    if (!ch) { fn(null, { semCanal: true }); return { fecha() {}, ultimo: () => null }; }
    ch.onmessage = ev => { const m = ev.data; if (m && m.k === 'snap' && m.v === VERSAO_API) { ult = Date.now(); ultS = m; velho = false; fn(m, {}); } };
    const oi = () => { try { ch.postMessage({ k: 'oi' }); } catch (e) {} };
    oi(); try { ch.postMessage({ k: 'pede' }); } catch (e) {}
    const t1 = setInterval(oi, 3000), t2 = setInterval(() => { if (!velho && Date.now() - ult > VELHO_MS) { velho = true; fn(null, { semDados: true, ultimo: ultS }); } }, 1000);
    return { fecha() { clearInterval(t1); clearInterval(t2); try { ch.close(); } catch (e) {} }, ultimo: () => ultS };
  }

  global.BT2_API = { versao: VERSAO_API, inicia, snapshot, card: id => leCards()[id] || null, assina: fn => { assinantes.push(fn); }, cliente, paraNumero };
})(window);
