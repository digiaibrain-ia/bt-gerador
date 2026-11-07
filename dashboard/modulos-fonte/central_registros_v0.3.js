/* =====================================================================================
   central_registros_v0.3.js — "Central de registros" do medidor — v0.3 (07/11/2026): novo item "Dev/Operador oculto" (relatório do robô) — v0.2 (06/11/2026): o dialogo passa a estar no HTML (corrige o ✕ e o arrastar) — v0.1 (Portão D)
   -------------------------------------------------------------------------------------
   O QUE É (leigo): uma janela única para juntar logs, amostras, monitoramento, alertas e dados do ensaio. Você marca o que quer, escolhe a pasta
   UMA VEZ e salva tudo organizado (uma pasta por ensaio, uma subpasta por tipo + um RESUMO.md para colar na conversa). Também imprime na hora.
   Abre pelo chip "🗂 Registros", pelo botão direito (menu) ou, no fim do ensaio, pelo aviso "Salvar registros agora?".
   POR QUÊ: antes cada coisa tinha o seu botão (Amostras, Gerenciador de logs, Alertas...). Juntar numa lista com caixas de seleção é mais fácil
   de organizar e de devolver para a engenharia.
   O QUE NÃO FAZ: não comanda PLC, DSE ou chaves; não grava nada sozinho (no fim do ensaio só PERGUNTA); não apaga nem "baixa" as amostras pendentes
   (o fluxo normal de Amostras continua igual); não envia nada pela rede (só lê o log de comunicação do Node-RED, como a janela de Logs).
   PASTA: usa o seletor de pasta do navegador (Chrome/Edge). O navegador guarda a escolha; ao reabrir ele pode pedir para liberar de novo (um clique).
   Sem pasta (ou sem suporte): "Downloads" = UM arquivo agrupado .md com tudo + o CSV das amostras.
   ===================================================================================== */
(function (raiz) {
  'use strict';
  const D = raiz.document, $ = id => D.getElementById(id);
  const VER = '0.3';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const p2 = n => String(n).padStart(2, '0');
  const sel = (n, d) => { try { return typeof eval(n) !== 'undefined' ? eval(n) : d; } catch (e) { return d; } };   // lê uma variável global do medidor sem quebrar se não existir
  const stamp = (d = new Date()) => d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + '_' + p2(d.getHours()) + p2(d.getMinutes()) + p2(d.getSeconds());
  const slug = t => String(t == null ? '' : t).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'x';
  const CORPO = "<div class=\"jt\"><span id=\"cenT\">Central de registros</span><div class=\"jr\"><button type=\"button\" class=\"jx\" data-fecha aria-label=\"Fechar\" title=\"Fechar\">✕</button></div></div><div class=\"jb cenb\"><p id=\"cenMsg\" hidden></p><b>O que salvar / imprimir</b><div class=\"cenit\" id=\"cenLista\"></div><div class=\"cenpasta\"><b>Onde salvar</b><div id=\"cenDest\"><label><input type=\"radio\" name=\"cenDest\" value=\"pasta\"> Pasta escolhida: <b id=\"cenPastaNome\">—</b> <button type=\"button\" class=\"bt s\" id=\"cenEscolhe\">Escolher pasta…</button></label><label><input type=\"radio\" name=\"cenDest\" value=\"down\"> Downloads (um arquivo agrupado .md)</label></div><label><input type=\"checkbox\" id=\"cenAgr\"> Também gerar o arquivo agrupado único (AGRUPADO.md) na pasta</label><small>Dentro da pasta: <code>BT2_registros/ensaio_AAAAMMDD_HHMMSS_modelo/</code> com uma subpasta por tipo e o <code>RESUMO.md</code>.</small></div><div class=\"cenbtn\"><button type=\"button\" class=\"bt\" id=\"cenSalva\">Salvar selecionados</button><button type=\"button\" class=\"bt s\" id=\"cenImprime\">Imprimir agora</button><button type=\"button\" class=\"bt s\" id=\"cenCopia\">Copiar resumo</button></div><div id=\"cenSt\" role=\"status\" aria-live=\"polite\"></div></div>";   // corpo do dialogo (o gerador do medidor usa este MESMO texto no HTML estatico)
  const LS = 'bt2.central.sel.v1', DB = 'bt2.central.v1';
  const MAX_AGRUPADO = 400000;                 // caracteres por arquivo dentro do agrupado (acima disso, corta e avisa)

  /* ----------------------------- o que pode ser salvo ----------------------------- */
  const csv = linhas => linhas.map(l => l.map(c => { const s = String(c == null ? '' : c); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(';')).join('\r\n');
  const dh = t => { const d = new Date(t); return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR'); };

  function monitoramento() {
    const o = { gerado: new Date().toISOString(), medidor: sel('VERSAO', null) };
    try { o.demo = !!$('demo').checked; } catch (e) { }
    try { const l = sel('LINK', null); o.link = { dse: { ok: l.dse.ok, http: l.dse.http, ts: l.dse.ts, diag: l.dse.diag || null }, chv: { ok: l.chv.ok, http: l.chv.http, ts: l.chv.ts, msg: l.chv.msg }, banco: l.banco }; } catch (e) { }
    try { o.bancos = sel('BANCOS_PLC', []).map(b => ({ id: b.id, leituraOk: !!sel('LINK').bancoOk(b.id), seletora: sel('BKS')[b.id].sel, bancoLigado: sel('BKS')[b.id].lig })); } catch (e) { }
    try {
      const CH = sel('CH', []), BANCOS = sel('BANCOS', []), DIS = sel('DIS', []), CMD = sel('CH_CMD', []), LIG = sel('CH_LIG', []), FR = sel('FALHA_RET', []), FC = sel('FALHA_COL', []);
      o.chaves = CH.map((c, i) => ({ i, banco: BANCOS[c.b] && BANCOS[c.b].id, kw: c.kw, habilitada: !DIS[i], comando: !!CMD[i], retorno: !!LIG[i], falhaRetorno: !!FR[i], contatorColado: !!FC[i] }));
    } catch (e) { }
    try { o.ocorrenciasAtivas = raiz.OCOR.ativas().map(x => ({ cod: x.cod, tipo: x.tipo, card: x.card, ref: x.ref, txt: x.txt, desde: new Date(x.desde).toISOString(), vezes: x.vezes })); } catch (e) { }
    try { o.ensaio = { iniciado: !!sel('T').started, rodando: !!sel('T').run, finalizado: !!sel('T').fim, etapa: sel('T').et }; } catch (e) { }
    try { o.dse = raiz.__ultimoDado || null; } catch (e) { }
    return o;
  }

  const ITENS = [
    { id: 'alertas', rot: 'Alertas e Falhas', dica: 'ativas (com Efeito/Causa/Solução) e histórico da sessão', pasta: 'alertas',
      ok: () => !!raiz.OCOR,
      gera: async () => {
        const O = raiz.OCOR, h = O.historico(), at = O.ativas(), out = [];
        out.push({ nome: 'alertas_falhas_historico.csv', conteudo: '﻿' + csv([['Data e hora', 'Evento', 'Tipo', 'Card', 'Código', 'Referência', 'Texto', 'Modo']].concat(h.map(x => [dh(x.t), x.e, x.tipo === 'f' ? 'Falha' : 'Alerta', x.card, x.cod, x.ref, x.txt, x.m]))) });
        out.push({ nome: 'alertas_falhas_ativas.txt', conteudo: at.length ? at.map(x => (O.diag ? O.diag(x) : x.cod + ' ' + x.txt)).join('\n\n----------------------------------------\n\n') : 'Nenhuma ocorrência ativa no momento.' });
        return out;
      } },
    { id: 'monit', rot: 'Monitoramento (estado agora)', dica: 'DSE, PLC, bancos, chaves, ensaio e ocorrências ativas', pasta: 'monitoramento',
      ok: () => true, gera: async () => [{ nome: 'monitoramento_instantaneo.json', conteudo: JSON.stringify(monitoramento(), null, 2) }] },
    { id: 'amostras', rot: 'Amostras (registro de aprendizado)', dica: 'sessões ainda pendentes de arquivo: resumo e CSV', pasta: 'amostras',
      ok: () => { try { return sel('rgSessoes')().length > 0; } catch (e) { return false; } },
      gera: async () => {
        const ses = sel('rgSessoes')(), base = sel('rgNomeBase')(ses);
        return [{ nome: base + '_resumo.txt', conteudo: sel('rgResumoTxt')(ses) }, { nome: base + '_amostras.csv', conteudo: sel('rgCsvTxt')(ses) }];
      } },
    { id: 'logs', rot: 'Logs (tela e comunicação)', dica: 'eventos da tela neste navegador + log de comunicação do Node-RED (BC56/BC400)', pasta: 'logs',
      ok: () => true,
      gera: async () => {
        const out = [], obs = raiz.OBS_LOG;
        if (obs) { const ev = obs.eventos(); out.push({ nome: 'eventos_tela.jsonl', conteudo: ev.map(e => JSON.stringify(e)).join('\n') + (ev.length ? '\n' : '') }); if (obs.descartados() > 0) out.push({ nome: 'eventos_tela_AVISO.txt', conteudo: obs.descartados() + ' evento(s) antigo(s) foram descartados pelo limite do buffer da tela.' }); }
        const bancos = sel('BANCOS_PLC', []), srvBase = sel('srvBase', null), base = srvBase ? srvBase() : '';
        if (base) for (const b of bancos) {
          const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 6000);
          try { const r = await fetch(base + '/api/logs/' + b.id, { cache: 'no-store', signal: ctl.signal }); if (!r.ok) throw new Error('HTTP ' + r.status); const j = await r.json(); out.push({ nome: 'log_comunicacao_BC' + b.id + '.json', conteudo: JSON.stringify(j, null, 2) }); }
          catch (e) { out.push({ nome: 'log_comunicacao_BC' + b.id + '_ERRO.txt', conteudo: 'Não consegui ler /api/logs/' + b.id + ': ' + (e && e.message ? e.message : e) }); }
          finally { clearTimeout(t); }
        }
        if (!out.length) out.push({ nome: 'logs_vazio.txt', conteudo: 'Nada disponível para salvar.' });
        return out;
      } },
    { id: 'robo', rot: 'Dev/Operador oculto (relatório do robô)', dica: 'relatório da última execução do robô de teste (Demo): achados, cobertura e o que foi bloqueado', pasta: 'robo',
      ok: () => { try { return !!(raiz.opSecreto && raiz.opSecreto.relatorio().length); } catch (e) { return false; } },
      gera: async () => [{ nome: 'dev_operador_oculto_relatorio.md', conteudo: raiz.opSecreto.md() }] },
    { id: 'dados', rot: 'Dados do ensaio', dica: 'modelo, equipamento, condições e estado do ensaio', pasta: 'ensaio',
      ok: () => !!sel('DADOS', null),
      gera: async () => {
        const T = sel('T', {}), r = { gerado: new Date().toISOString(), dados: sel('DADOS', null), estado: { iniciado: !!T.started, rodando: !!T.run, finalizado: !!T.fim, parcial: !!T.parcial, etapa: T.et }, etapasGravadas: null };
        try { r.etapasGravadas = (sel('SNAP', []) || []).map((s, i) => ({ etapa: i + 1, gravada: !!s })); } catch (e) { }
        return [{ nome: 'dados_do_ensaio.json', conteudo: JSON.stringify(r, null, 2) }];
      } }
  ];

  /* ----------------------------- escolha lembrada ----------------------------- */
  const lerSel = () => { try { const j = JSON.parse(localStorage.getItem(LS) || 'null'); if (j && typeof j === 'object') return j; } catch (e) { } return { alertas: true, monit: true, amostras: true, logs: true, robo: true, dados: true, destino: 'pasta', agrupado: true }; };
  const gravaSel = s => { try { localStorage.setItem(LS, JSON.stringify(s)); } catch (e) { } };

  /* ----------------------------- pasta (guardada no IndexedDB) ----------------------------- */
  const idb = () => new Promise((res, rej) => { try { const q = indexedDB.open(DB, 1); q.onupgradeneeded = () => q.result.createObjectStore('h'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); } catch (e) { rej(e); } });
  const idbGet = async k => { try { const d = await idb(); return await new Promise(r => { const q = d.transaction('h').objectStore('h').get(k); q.onsuccess = () => r(q.result || null); q.onerror = () => r(null); }); } catch (e) { return null; } };
  const idbSet = async (k, v) => { try { const d = await idb(); await new Promise(r => { const t = d.transaction('h', 'readwrite'); t.objectStore('h').put(v, k); t.oncomplete = () => r(); t.onerror = () => r(); }); } catch (e) { } };
  let PASTA = null;
  const temSeletor = () => typeof raiz.showDirectoryPicker === 'function';
  async function permissao(h, pede) {
    try { const o = { mode: 'readwrite' }; if ((await h.queryPermission(o)) === 'granted') return true; return pede ? (await h.requestPermission(o)) === 'granted' : false; } catch (e) { return false; }
  }

  /* ----------------------------- montagem dos arquivos ----------------------------- */
  const nomeEnsaio = () => {
    let m = 'sem_modelo';
    try { const id = sel('rgIds')(); m = slug(id.dse) + '_' + slug(id.ger); } catch (e) { }
    return 'ensaio_' + stamp() + '_' + m;
  };
  async function coleta(s) {
    const arqs = [], falhas = [];
    for (const it of ITENS) {
      if (!s[it.id] || !it.ok()) continue;
      try { (await it.gera()).forEach(a => arqs.push(Object.assign({ pasta: it.pasta, item: it.id }, a))); } catch (e) { falhas.push(it.rot + ': ' + (e && e.message ? e.message : e)); }
    }
    return { arqs, falhas };
  }
  function resumoMd(ens, arqs, falhas, destino) {
    const L = [];
    L.push('# Registros do medidor — ' + ens);
    L.push('');
    L.push('- Gerado em: ' + new Date().toLocaleString('pt-BR') + ' · Medidor v' + sel('VERSAO', '?') + ' · Central de registros v' + VER);
    try { L.push('- Modo: ' + ($('demo').checked ? 'DEMO' : 'REAL')); } catch (e) { }
    L.push('- Destino: ' + destino);
    try { const T = sel('T', {}); L.push('- Ensaio: ' + (T.started ? (T.fim ? 'finalizado' : (T.run ? 'em andamento' : 'armado')) : 'não iniciado')); } catch (e) { }
    try { const at = raiz.OCOR.ativas(); L.push('- Ocorrências ativas: ' + at.length + (at.length ? ' (' + at.map(x => x.cod + (x.ref ? ' ' + x.ref : '')).join(', ') + ')' : '')); } catch (e) { }
    L.push('');
    L.push('## Arquivos');
    arqs.forEach(a => L.push('- `' + a.pasta + '/' + a.nome + '` (' + String(a.conteudo).length + ' caracteres)'));
    if (falhas.length) { L.push(''); L.push('## Não foi possível gerar'); falhas.forEach(f => L.push('- ' + f)); }
    L.push('');
    L.push('Para a engenharia: cole este arquivo (ou o agrupado) na conversa. Nada aqui comanda PLC, DSE ou chaves.');
    return L.join('\n');
  }
  function agrupadoMd(resumo, arqs) {
    const L = [resumo, ''];
    arqs.forEach(a => {
      let c = String(a.conteudo).replace(/^﻿/, ''), cortou = false;
      if (c.length > MAX_AGRUPADO) { c = c.slice(0, MAX_AGRUPADO); cortou = true; }
      L.push('', '---', '', '## ' + a.pasta + '/' + a.nome, '', '```', c, '```');
      if (cortou) L.push('', '_(cortado em ' + MAX_AGRUPADO + ' caracteres; o arquivo completo está na pasta)_');
    });
    return L.join('\n');
  }
  function baixa(conteudo, nome, tipo) {
    const a = D.createElement('a'); a.href = URL.createObjectURL(new Blob([conteudo], { type: tipo || 'text/plain;charset=utf-8' })); a.download = nome; D.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ----------------------------- ações ----------------------------- */
  const msg = t => { const e = $('cenSt'); if (e) e.textContent = t || ''; };
  async function salvar() {
    const s = lerSelTela(); gravaSel(s);
    if (!ITENS.some(it => s[it.id] && it.ok())) { msg('Marque pelo menos um item.'); return; }
    msg('Reunindo os registros…');
    const ens = nomeEnsaio(), { arqs, falhas } = await coleta(s);
    if (!arqs.length) { msg('Nada para salvar.'); return; }
    if (s.destino === 'pasta' && temSeletor()) {
      if (!PASTA) { msg('Escolha a pasta primeiro (botão “Escolher pasta…”) ou use Downloads.'); return; }
      if (!(await permissao(PASTA, true))) { msg('O navegador não liberou a pasta. Clique em “Escolher pasta…” de novo ou use Downloads.'); return; }
      try {
        const base = await PASTA.getDirectoryHandle('BT2_registros', { create: true }), dir = await base.getDirectoryHandle(ens, { create: true });
        const resumo = resumoMd(ens, arqs, falhas, 'pasta “' + PASTA.name + '/BT2_registros/' + ens + '”');
        const todos = arqs.concat([{ pasta: '.', nome: 'RESUMO.md', conteudo: resumo }]);
        if (s.agrupado) todos.push({ pasta: '.', nome: 'AGRUPADO.md', conteudo: agrupadoMd(resumo, arqs) });
        for (const a of todos) {
          const d = a.pasta === '.' ? dir : await dir.getDirectoryHandle(a.pasta, { create: true });
          const fh = await d.getFileHandle(a.nome, { create: true }), w = await fh.createWritable(); await w.write(a.conteudo); await w.close();
        }
        msg('Salvo em ' + PASTA.name + '/BT2_registros/' + ens + ' (' + todos.length + ' arquivo(s)). Para me enviar, anexe o RESUMO.md ou o AGRUPADO.md.');
      } catch (e) { msg('Não consegui salvar na pasta: ' + (e && e.message ? e.message : e) + '. Use Downloads.'); }
      return;
    }
    const resumo = resumoMd(ens, arqs, falhas, 'Downloads (arquivo agrupado)');
    baixa(agrupadoMd(resumo, arqs), 'bt2_registros_' + ens + '_agrupado.md', 'text/markdown;charset=utf-8');
    const am = arqs.find(a => a.nome.endsWith('_amostras.csv'));
    if (am) setTimeout(() => baixa(am.conteudo, am.nome, 'text/csv'), 500);
    msg('Baixado: 1 arquivo agrupado (.md)' + (am ? ' + o CSV das amostras' : '') + '. Para me enviar, anexe o .md.');
  }
  async function copiaResumo() {
    const s = lerSelTela(); const ens = nomeEnsaio(), { arqs, falhas } = await coleta(s);
    const t = agrupadoMd(resumoMd(ens, arqs, falhas, 'área de transferência'), arqs);
    try { await navigator.clipboard.writeText(t); msg('Resumo agrupado copiado (' + t.length + ' caracteres).'); } catch (e) { msg('Não consegui copiar; use “Salvar selecionados”.'); }
  }
  async function imprime() {
    const s = lerSelTela(); msg('Preparando a impressão…');
    const ens = nomeEnsaio(), { arqs, falhas } = await coleta(s);
    let pr = $('prCentral'); if (!pr) { pr = D.createElement('div'); pr.id = 'prCentral'; D.body.appendChild(pr); }
    const lim = t => String(t).replace(/^﻿/, '').split('\n').slice(0, 400).join('\n');
    pr.innerHTML = '<h2>Registros do medidor — ' + esc(ens) + '</h2><pre>' + esc(resumoMd(ens, arqs, falhas, 'impressão')) + '</pre>'
      + arqs.filter(a => /\.(txt|json|csv|jsonl)$/.test(a.nome)).map(a => '<h3>' + esc(a.pasta + '/' + a.nome) + '</h3><pre>' + esc(lim(a.conteudo)) + '</pre>').join('');
    msg('');
    if (typeof sel('imprimeComNome') === 'function') sel('imprimeComNome')('registros_' + ens, 'prCentral'); else raiz.print();
  }

  /* ----------------------------- janela ----------------------------- */
  let dlg = null;
  function lerSelTela() {
    const s = { destino: ($('cenDest').querySelector('input:checked') || {}).value || 'pasta', agrupado: $('cenAgr').checked };
    ITENS.forEach(it => { const c = dlg.querySelector('input[data-it="' + it.id + '"]'); s[it.id] = !!(c && c.checked && !c.disabled); });
    return s;
  }
  async function pintaPasta() {
    const n = $('cenPastaNome'); if (!n) return;
    if (!temSeletor()) { n.textContent = 'este navegador não oferece escolha de pasta — use Downloads'; return; }
    if (!PASTA) PASTA = await idbGet('pasta');
    if (!PASTA) { n.textContent = 'nenhuma pasta escolhida'; return; }
    n.textContent = PASTA.name + ((await permissao(PASTA, false)) ? '' : ' (o navegador vai pedir para liberar)');
  }
  function monta() {
    if (dlg) return;
    const st = D.createElement('style');
    st.textContent = `
      #dlgCentral .cenb{padding:10px 14px 12px;font-size:13px}
      #dlgCentral .cenit{display:grid;gap:4px;margin:6px 0 10px}
      #dlgCentral .cenit label{display:flex;gap:8px;align-items:flex-start;padding:5px 8px;border:1px solid #d3dbe4;background:#fff;cursor:pointer}
      #dlgCentral .cenit label.off{opacity:.5;cursor:not-allowed}
      #dlgCentral .cenit small{display:block;color:#51606f;font-size:11.5px}
      #dlgCentral .cenpasta{border:1px solid #c7d0da;background:#f7f9fb;padding:8px 10px;margin-bottom:10px}
      #dlgCentral .cenpasta label{display:flex;gap:6px;align-items:center;margin:2px 0}
      #dlgCentral .cenbtn{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
      #dlgCentral #cenSt{margin-top:8px;font-size:12px;color:#1f4b7a;min-height:1.3em}
      #dlgCentral #cenMsg{margin:0 0 8px;font-weight:700;color:#8a4b00}
      #prCentral{display:none}
      @media print{ body.prCentral>*:not(#prCentral){display:none!important} body.prCentral #prCentral{display:block!important;font-size:11px} body.prCentral #prCentral pre{white-space:pre-wrap;word-break:break-word;font-size:10.5px} }`;
    D.head.appendChild(st);
    dlg = $('dlgCentral');   // v0.2: o dialogo agora ESTA NO HTML (como os outros) para receber o fechar (✕) e o arrastar que sao ligados ao carregar a pagina
    if (!dlg) {              // reserva: se o HTML nao trouxer o dialogo, cria e liga o ✕ aqui
      dlg = D.createElement('dialog'); dlg.id = 'dlgCentral'; dlg.className = 'jan livre'; dlg.setAttribute('data-nofora', ''); dlg.style.setProperty('--w', '640px'); dlg.setAttribute('aria-labelledby', 'cenT');
      dlg.innerHTML = CORPO; D.body.appendChild(dlg);
      dlg.querySelectorAll('[data-fecha]').forEach(b => b.addEventListener('click', () => dlg.close()));
    }
    $('cenSalva').onclick = salvar; $('cenImprime').onclick = imprime; $('cenCopia').onclick = copiaResumo;
    $('cenEscolhe').onclick = async () => {
      if (!temSeletor()) { msg('Este navegador não oferece escolha de pasta. Use Downloads.'); return; }
      try { PASTA = await raiz.showDirectoryPicker({ id: 'bt2-registros', mode: 'readwrite' }); await idbSet('pasta', PASTA); dlg.querySelector('input[value="pasta"]').checked = true; await pintaPasta(); msg('Pasta escolhida: ' + PASTA.name); } catch (e) { /* cancelado */ }
    };
  }
  function pintaLista() {
    const s = lerSel(), L = $('cenLista');
    L.innerHTML = ITENS.map(it => { const ok = it.ok(); return '<label class="' + (ok ? '' : 'off') + '"><input type="checkbox" data-it="' + it.id + '"' + (ok && s[it.id] !== false ? ' checked' : '') + (ok ? '' : ' disabled') + '><span><b>' + esc(it.rot) + '</b><small>' + esc(ok ? it.dica : it.dica + ' — nada disponível agora') + '</small></span></label>'; }).join('');
    dlg.querySelector('input[value="' + (temSeletor() && s.destino !== 'down' ? 'pasta' : 'down') + '"]').checked = true;
    $('cenAgr').checked = s.agrupado !== false;
  }
  async function abre(motivo) {
    monta(); pintaLista(); msg('');
    const m = $('cenMsg'); m.hidden = !motivo; m.textContent = motivo || '';
    await pintaPasta();
    if (!dlg.open) { try { dlg.showModal(); } catch (e) { dlg.show(); } }
  }

  /* ----------------------------- fim do ensaio: só PERGUNTA ----------------------------- */
  let fimVisto = false, banner = null;
  function mostraAviso() {
    if (banner) return;
    banner = D.createElement('div'); banner.setAttribute('popover', 'manual'); banner.id = 'cenAviso';
    banner.style.cssText = 'position:fixed;inset:auto auto 16px 50%;transform:translateX(-50%);margin:0;max-width:min(92vw,560px);padding:10px 14px;border:2px solid #1a4a78;background:#0f2438;color:#fff;font:13px/1.35 system-ui,sans-serif;border-radius:8px;display:flex;gap:10px;align-items:center;flex-wrap:wrap';
    banner.innerHTML = '<b style="flex:1 1 220px">Ensaio finalizado. Salvar os registros agora?</b><button type="button" id="cenAvSim" style="padding:6px 12px;font-weight:700;cursor:pointer">Salvar registros…</button><button type="button" id="cenAvNao" style="padding:6px 12px;cursor:pointer">Agora não</button>';
    D.body.appendChild(banner); try { banner.showPopover(); } catch (e) { }
    const fecha = () => { try { banner.hidePopover(); } catch (e) { } banner.remove(); banner = null; };
    $('cenAvSim').onclick = () => { fecha(); abre('Ensaio finalizado: confira o que salvar. Nada é gravado até você clicar em Salvar.'); };
    $('cenAvNao').onclick = fecha;
  }
  setInterval(() => {
    try {
      const T = sel('T', null); if (!T) return;
      if (!(T.started && T.fim)) { fimVisto = false; return; }
      if (fimVisto) return;
      const f = $('dlgFim'); if (f && f.open) return;   // espera o resultado do ensaio fechar
      fimVisto = true; mostraAviso();
    } catch (e) { }
  }, 1000);

  /* ----------------------------- entradas: chip e menu do botão direito ----------------------------- */
  const iniciaChip = () => { const b = $('bCentral'); if (b) b.addEventListener('click', () => abre()); };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', iniciaChip); else iniciaChip();
  raiz.CENTRAL_REG = { versao: VER, abre, itens: ITENS.map(i => i.id), coleta: s => coleta(s || lerSel()), monitoramento };
})(window);
