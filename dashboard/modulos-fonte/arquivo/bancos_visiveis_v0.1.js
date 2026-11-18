/* =====================================================================================================================
   bancos_visiveis_v0.1.js — CARD "BANCO DE CARGAS": MOSTRA SÓ OS BANCOS SELECIONADOS  ·  13/11/2026
   Colado (inline) no medidor 1.10.205, num <script> próprio DEPOIS do modo_operador (usa: window.bancoUsado, que o medidor já tem).

   PARA QUE SERVE (leigo): em "Detalhes do Patamar" você marca quais bancos entram no ensaio (BC56, BC400, BC59,5, BC550). Este módulo faz o card
   "Banco de Cargas" mostrar SÓ esses bancos, para a tela ficar mais limpa. É um ajuste VISUAL: nada muda na lógica, nas chaves, no PLC ou na sugestão do Patamar.
   REGRAS DE SEGURANÇA (um banco desmarcado SÓ some se estiver realmente parado, sem carga):
     • continua VISÍVEL se tiver alguma chave LIGADA, comando de chave PENDENTE, ou se o medidor perdeu a leitura dele (estado desconhecido);
     • "Ligar banco" ativo NÃO conta: ele só LIBERA o comando das chaves (não energiza carga) e fica ativo nos quatro bancos do Demo; se contasse, nenhum banco poderia sumir.
       Se uma chave de um banco oculto ligar (por qualquer motivo), o banco reaparece na hora;
     • o botão "👁 n/N" no cabeçalho do card mostra QUANTOS estão visíveis e, ao tocar, alterna para "Todos" (lembrado neste navegador, chave 'medidor.bancosTodos');
     • sem nenhum banco visível aparece um aviso explicando como mostrar todos.
   POR QUE ASSIM (técnico): só acrescenta a classe CSS "bk-oculto" (display:none) ao <details class="bk" data-bk="id"> — o HTML do banco continua no lugar (o robô de teste,
   o Setup, as rotas e o desenho do card não mudam). Reavalia ao mudar a seleção, ao redesenhar o card e a cada 0,5 s (barato: 4 bancos).
   NÃO FAZ: não liga/desliga nada, não altera a seleção (G.usa), não lê PLC/DSE. Se o módulo falhar, o card fica como era (todos visíveis).
   ===================================================================================================================== */
(function () {
  'use strict';
  const LS = 'medidor.bancosTodos';
  const ler = k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const grava = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const R = { todos: ler(LS) === '1' };
  const st = document.createElement('style');
  st.textContent = '#bancos details.bk.bk-oculto{display:none}#bBkTodos.on{outline:2px solid var(--ui-acento,#ec7000)}#bkNenhum{margin:8px 0;font-size:13px;opacity:.85}';
  document.head.appendChild(st);

  const parado = d => !d.querySelector('.tile.s1,.tile.cmd,.tile.unk');   // nenhuma chave ligada/pendente e leitura ok
  function aplica() {
    try {
      const box = document.getElementById('bancos'); if (!box) return;
      const dets = [...box.querySelectorAll('details.bk[data-bk]')];
      if (!dets.length) return;   // card em outro formato (sem id de banco): nada a filtrar
      let vis = 0;
      dets.forEach(d => {
        const id = d.dataset.bk;
        const sel = !!(window.bancoUsado && window.bancoUsado(id));
        const mostra = R.todos || sel || !parado(d);
        d.classList.toggle('bk-oculto', !mostra);
        if (mostra) vis++;
      });
      const b = document.getElementById('bBkTodos');
      if (b) {
        b.textContent = R.todos ? '👁 Todos' : '👁 ' + vis + '/' + dets.length;
        b.classList.toggle('on', R.todos);
        b.title = R.todos ? 'Mostrando TODOS os bancos. Toque para mostrar só os selecionados em Detalhes do Patamar.'
          : 'Mostrando ' + vis + ' de ' + dets.length + ' bancos (os selecionados em Detalhes do Patamar, mais qualquer banco com chave ligada, comando pendente ou leitura perdida). Toque para mostrar todos.';
      }
      let n = document.getElementById('bkNenhum');
      if (!vis && !R.todos) {
        if (!n) { n = document.createElement('p'); n.id = 'bkNenhum'; box.insertAdjacentElement('afterend', n); }
        n.textContent = 'Nenhum banco selecionado em Detalhes do Patamar. Toque em 👁 para mostrar todos.';
      } else if (n) n.remove();
    } catch (e) { /* o card nunca pode quebrar por causa deste ajuste visual */ }
  }
  function monta() {
    const h2 = document.querySelector('#bco .hrow h2'); if (!h2 || document.getElementById('bBkTodos')) return;
    const b = document.createElement('button'); b.type = 'button'; b.id = 'bBkTodos'; b.className = 'cfgbtn inl'; b.textContent = '👁';
    b.onclick = () => { R.todos = !R.todos; grava(LS, R.todos ? '1' : '0'); aplica(); };
    h2.insertAdjacentElement('afterend', b);
  }
  monta();
  const box = document.getElementById('bancos');
  if (box && window.MutationObserver) new MutationObserver(aplica).observe(box, { childList: true });
  document.addEventListener('change', e => { if (e.target && e.target.matches && e.target.matches('input[data-gd="u"]')) setTimeout(aplica, 30); }, true);
  setInterval(aplica, 500); aplica();
  window.BANCOS_VISIVEIS = { aplica, todos: v => { R.todos = !!v; grava(LS, R.todos ? '1' : '0'); aplica(); } };
})();
