/* =====================================================================================================================
   menu_dev_v0.2.js — MENU ☰ DE DESENVOLVIMENTO (abre as outras páginas do projeto)  ·  30/10/2026
   v0.2 (pedido do operador): botão "Atualizar" — procura na pasta as VERSÕES NOVAS de cada ferramenta (ex.: o catálogo diz mapa v0.11 mas você colocou v0.12) e passa a abrir a mais nova,
   lembrando isso neste navegador (localStorage 'medidor.dev.menu.arq'). O navegador NÃO consegue listar uma pasta; por isso o Atualizar testa, por HEAD, os próximos números de versão
   (patch+1…+8, minor+1, major+1) de cada arquivo do catálogo. Não é preciso editar o catálogo para abrir uma versão nova. "Esquecer" apaga o que foi lembrado.
   PARA QUE SERVE (leigo): um botão ☰ que lista as ferramentas do projeto e abre a que você escolher, sempre no endereço certo (o mesmo IP/porta da página
   em que você já está). Só aparece para o desenvolvedor: depois da senha do Demo, ou com ?dev=1 no endereço (fica lembrado neste navegador; ?dev=0 desliga).
   POR QUE (técnico): abrir o HTML com duplo clique usa file:///C:/Users/… e o navegador bloqueia as chamadas ao Node-RED. Os links daqui usam
   new URL(arquivo, location.href): herdam http://IP:1880/ da página atual. Se a página estiver em file://, o menu AVISA em vez de abrir um link que não funciona.
   DEPENDE DE: catalogo_ferramentas_v0.1.js (carregue antes). Se o catálogo não existir, o menu não aparece e nada mais muda.
   API (window.MENU_DEV):
     monta(host, {atual})  coloca o botão ☰ dentro do elemento host (fica escondido até mostra(true))
     mostra(bool)          mostra/esconde o botão (o medidor chama ao liberar/travar o modo de testes)
     automatico()          mostra se ?dev=1 ou se este navegador foi marcado como dev
     arquivo(id)           nome do arquivo no catálogo (ex.: arquivo('gerenciador')) — usado pelo medidor no lugar de nomes fixos
     url(id)               endereço completo (mesma origem)
   REGRA DE LAYOUT (REGRA_LAYOUT_ESTAVEL_v0.1): o painel é um popover por cima (camada de cima do navegador, acima de <dialog>); não empurra nada.
   NÃO FAZ: não comanda nada, não lê PLC/DSE; só guarda no navegador a marca "dev" (localStorage 'medidor.dev.menu') e abre abas.
   ===================================================================================================================== */
(function () {
  'use strict';
  const CAT = window.CATALOGO_FERRAMENTAS;
  if (!CAT || !CAT.itens) { window.MENU_DEV = { monta() {}, mostra() {}, automatico() {}, arquivo() { return null; }, url() { return null; } }; return; }
  const LS = 'medidor.dev.menu';
  const LSA = 'medidor.dev.menu.arq';   // v0.2: {id: arquivoMaisNovo} achado pelo botão Atualizar
  const lerArq = () => { try { return JSON.parse(localStorage.getItem(LSA) || '{}') || {}; } catch (e) { return {}; } };
  const gravaArq = o => { try { localStorage.setItem(LSA, JSON.stringify(o)); } catch (e) {} };
  const cmpVer = (a, b) => { for (let k = 0; k < Math.max(a.length, b.length); k++) { const d = (a[k] || 0) - (b[k] || 0); if (d) return d; } return 0; };
  const ach0 = id => CAT.itens.find(i => i.id === id) || null;
  const ach = id => { const i = ach0(id); if (!i) return null; const o = lerArq()[id]; if (!o) return i; return Object.assign({}, i, { arquivo: o, deCatalogo: i.arquivo }); };
  const emFile = () => location.protocol === 'file:';
  const url = id => { const i = ach(id); return i ? new URL(i.arquivo, location.href).href : null; };
  let btn = null, pan = null, atual = '';
  function css() {
    if (document.getElementById('mdv-css')) return;
    const s = document.createElement('style'); s.id = 'mdv-css';
    s.textContent =
      '.mdv-b{font:inherit;background:#1e3a5f;color:#fff;border:1px solid #406080;border-radius:6px;padding:3px 10px;min-height:28px;cursor:pointer;line-height:1.2}' +
      '.mdv-p{position:fixed;inset:auto;top:48px;right:12px;margin:0;width:min(440px,calc(100vw - 24px));max-height:calc(100vh - 64px);overflow:auto;border:1px solid #888;border-radius:10px;padding:10px 12px;background:#fff;color:#111;box-shadow:0 8px 28px rgba(0,0,0,.3);font:13px/1.4 system-ui,sans-serif}' +
      '@media (prefers-color-scheme:dark){.mdv-p{background:#1c1c1b;color:#eee;border-color:#555}}' +
      '.mdv-p h4{margin:0 0 6px;font-size:14px}.mdv-g{margin:10px 0 2px;font-size:12px;color:#777;font-weight:600}' +
      '.mdv-i{display:flex;gap:8px;align-items:flex-start;padding:6px 6px;border-radius:7px;cursor:pointer;text-decoration:none;color:inherit}.mdv-i:hover,.mdv-i:focus-visible{background:rgba(42,120,214,.15);outline:none}' +
      '.mdv-i small{display:block;color:#777}.mdv-i.leg{opacity:.55}.mdv-i .st{margin-left:auto;font-weight:700}' +
      '.mdv-w{background:#fde7e5;color:#7a1f1f;border:1px solid #d03b3b;border-radius:7px;padding:6px 8px;margin:6px 0;font-size:12.5px}' +
      '.mdv-f{display:flex;gap:6px;margin-top:8px}.mdv-f button{font:inherit;padding:3px 10px;border:1px solid #888;border-radius:6px;background:transparent;color:inherit;cursor:pointer}';
    document.head.appendChild(s);
  }
  /* v0.2: dado 'nome_v1.10.117.html', testa (HEAD) os próximos números e devolve o arquivo mais novo que existe (ou o próprio) */
  async function maisNova(arq) {
    const m = /^(.*?_v)(\d+(?:\.\d+)*)(\.[A-Za-z]+)$/.exec(arq); if (!m) return arq;
    const p = m[2].split('.').map(Number), cand = [], L = p.length - 1;
    for (let k = 1; k <= 8; k++) { const q = p.slice(); q[L] += k; cand.push(q); }
    if (L >= 1) for (let a = 0; a <= 3; a++) { const q = p.slice(); q[L - 1] += 1; q[L] = a; cand.push(q); }
    if (L >= 2) { const q = p.slice(); q[0] += 1; q[1] = 0; q[2] = 0; cand.push(q); }
    let melhor = p, achou = arq;
    const existe = async q => { const nome = m[1] + q.join('.') + m[3]; try { const r = await fetch(new URL(nome, location.href).href, { method: 'HEAD', cache: 'no-store' }); return r.ok ? nome : null; } catch (e) { return null; } };
    const res = await Promise.all(cand.map(async q => ({ q, nome: await existe(q) })));
    res.forEach(r => { if (r.nome && cmpVer(r.q, melhor) > 0) { melhor = r.q; achou = r.nome; } });
    return achou;
  }
  function lista() {
    let h = '<h4>Ferramentas do projeto</h4>';
    if (emFile()) h += '<div class="mdv-w"><b>Esta página foi aberta como arquivo (file://).</b> As ferramentas só funcionam abertas pelo Node-RED: <code>http://IP:1880/' + (ach(atual) ? ach(atual).arquivo : 'arquivo.html') + '</code>. Abra por esse endereço e use o menu de novo.</div>';
    else h += '<div style="color:#777;font-size:12px">Endereço base: ' + location.origin + '/ · catálogo de ' + CAT.atualizado + '</div>';
    let g = '';
    CAT.itens.map(i => ach(i.id)).forEach(i => {
      if (i.grupo !== g) { g = i.grupo; h += '<div class="mdv-g">' + g + '</div>'; }
      h += '<a class="mdv-i' + (i.legado ? ' leg' : '') + (i.id === atual ? ' aqui' : '') + '" data-id="' + i.id + '" href="' + (emFile() ? '#' : url(i.id)) + '" target="bt2_' + i.id + '" rel="noopener">' +
        '<span><b>' + i.nome + (i.id === atual ? ' (esta página)' : '') + '</b><small>' + i.arquivo + ' — ' + i.desc + (i.aviso ? ' <span style="font-style:italic">(' + i.aviso + ')</span>' : '') + '</small></span><span class="st" id="mdv-st-' + i.id + '"></span></a>';
    });
    h += '<div class="mdv-f"><button type="button" id="mdv-ver"' + (emFile() ? ' disabled' : '') + '>Verificar se os arquivos existem</button><button type="button" id="mdv-up"' + (emFile() ? ' disabled' : '') + ' title="Procura na pasta versões mais novas de cada ferramenta e passa a abrir a mais nova">Atualizar</button><button type="button" id="mdv-es" title="Esquece as versões achadas e volta ao que o catálogo diz">Esquecer</button><button type="button" id="mdv-fx">Fechar</button></div><div id="mdv-msg" style="font-size:12px;color:#777;margin-top:6px"></div>';
    pan.innerHTML = h;
    pan.querySelectorAll('.mdv-i').forEach(a => a.addEventListener('click', e => { if (emFile()) e.preventDefault(); }));
    pan.querySelector('#mdv-fx').onclick = () => fecha();
    pan.querySelector('#mdv-es').onclick = () => { gravaArq({}); lista(); };
    const up = pan.querySelector('#mdv-up');
    if (up) up.onclick = async () => {
      const msg = pan.querySelector('#mdv-msg'), achados = lerArq(); let n = 0; up.disabled = true;
      for (const it of CAT.itens) {
        msg.textContent = 'Procurando versões novas de ' + it.nome + '…';
        const novo = await maisNova(ach(it.id).arquivo);
        if (novo && novo !== ach(it.id).arquivo) { achados[it.id] = novo; gravaArq(achados); n++; }
      }
      lista(); const m2 = pan.querySelector('#mdv-msg'); if (m2) m2.textContent = n ? n + ' ferramenta(s) com versão mais nova na pasta — agora o clique abre a nova.' : 'Nada mais novo que o catálogo/versões já lembradas.';
    };
    const v = pan.querySelector('#mdv-ver');
    if (v) v.onclick = async () => {
      for (const i of CAT.itens) {       // HEAD: só pergunta se o arquivo existe na pasta public (não baixa)
        const el = pan.querySelector('#mdv-st-' + i.id); if (!el) continue; el.textContent = '…';
        try { const r = await fetch(url(i.id), { method: 'HEAD', cache: 'no-store' }); el.textContent = r.ok ? '✓' : '✗'; el.style.color = r.ok ? '#1b8a52' : '#d03b3b'; el.title = r.ok ? 'arquivo encontrado' : 'não encontrado (HTTP ' + r.status + ') — copie para a pasta public'; }
        catch (e) { el.textContent = '?'; el.title = 'sem resposta'; }
      }
    };
  }
  function abre() {
    if (!pan) { pan = document.createElement('div'); pan.className = 'mdv-p'; pan.setAttribute('popover', 'auto'); document.body.appendChild(pan); }
    lista();
    try { pan.showPopover(); } catch (e) { pan.style.display = 'block'; pan.style.zIndex = 99999; }   // sem popover (Chrome < 114): div fixo
  }
  function fecha() { if (!pan) return; try { pan.hidePopover(); } catch (e) { pan.style.display = 'none'; } }
  function monta(host, op) {
    if (!host || btn) return;
    css(); atual = (op && op.atual) || '';
    btn = document.createElement('button'); btn.type = 'button'; btn.className = 'mdv-b'; btn.textContent = '☰'; btn.style.display = 'none';
    btn.title = 'SÓ DESENVOLVEDOR: abre as outras ferramentas do projeto (catálogo de páginas)'; btn.setAttribute('aria-haspopup', 'menu');
    btn.onclick = () => abre(); host.appendChild(btn);
    automatico();
  }
  function mostra(b) { if (btn) btn.style.display = b ? '' : 'none'; if (!b) fecha(); }
  function automatico() {
    let on = false;
    try {
      const q = new URLSearchParams(location.search).get('dev');
      if (q === '1') localStorage.setItem(LS, '1'); else if (q === '0') localStorage.removeItem(LS);
      on = localStorage.getItem(LS) === '1';
    } catch (e) { on = /[?&]dev=1/.test(location.search); }
    if (on) mostra(true);
    return on;
  }
  window.MENU_DEV = { versao: '0.2', maisNova, monta, mostra, automatico, arquivo: id => (ach(id) || {}).arquivo || null, url };
})();
