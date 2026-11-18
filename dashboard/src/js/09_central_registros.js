
/* ===== central_registros_v0.4 (Central de registros) — fonte: dashboard/modulos-fonte/central_registros_v0.4.js ===== */
/* =====================================================================================
   central_registros_v0.4.js — "Central de registros" do medidor — v0.4 (15/11/2026): o botão "Imprimir agora" (que despejava JSON e logs brutos: 26 páginas e 23 MB no registro do Reginaldo) dá lugar ao menu "Exportar ▾": PDF organizado e curto (resumo, ocorrências, monitoramento, falhas agrupadas e dados do ensaio em tabelas), Markdown agrupado (.md), planilha de alertas (.csv), monitoramento (.json) e amostras (.csv). Salvar selecionados e Copiar resumo não mudam. Inclui o ajuste da 1.10.191 (chave "perguntar ao fim do ensaio", CEN_PERGUNTA_FIM) que só existia no medidor — v0.3 (07/11/2026): novo item "Dev/Operador oculto" (relatório do robô) — v0.2 (06/11/2026): o dialogo passa a estar no HTML (corrige o ✕ e o arrastar) — v0.1 (Portão D)
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
  const VER = '0.4';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const p2 = n => String(n).padStart(2, '0');
  const sel = (n, d) => { try { return typeof eval(n) !== 'undefined' ? eval(n) : d; } catch (e) { return d; } };   // lê uma variável global do medidor sem quebrar se não existir
  const stamp = (d = new Date()) => d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + '_' + p2(d.getHours()) + p2(d.getMinutes()) + p2(d.getSeconds());
  const slug = t => String(t == null ? '' : t).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'x';
  const CORPO = "<div class=\"jt\"><span id=\"cenT\">Central de registros</span><div class=\"jr\"><button type=\"button\" class=\"jx\" data-fecha aria-label=\"Fechar\" title=\"Fechar\">✕</button></div></div><div class=\"jb cenb\"><p id=\"cenMsg\" hidden></p><b>O que salvar / exportar</b><div class=\"cenit\" id=\"cenLista\"></div><div class=\"cenpasta\"><b>Onde salvar</b><div id=\"cenDest\"><label><input type=\"radio\" name=\"cenDest\" value=\"pasta\"> Pasta escolhida: <b id=\"cenPastaNome\">—</b> <button type=\"button\" class=\"bt s\" id=\"cenEscolhe\">Escolher pasta…</button></label><label><input type=\"radio\" name=\"cenDest\" value=\"down\"> Downloads (um arquivo agrupado .md)</label></div><label><input type=\"checkbox\" id=\"cenAgr\"> Também gerar o arquivo agrupado único (AGRUPADO.md) na pasta</label><small>Dentro da pasta: <code>BT2_registros/ensaio_AAAAMMDD_HHMMSS_modelo/</code> com uma subpasta por tipo e o <code>RESUMO.md</code>.</small></div><div class=\"cenbtn\"><button type=\"button\" class=\"bt\" id=\"cenSalva\">Salvar selecionados</button><button type=\"button\" class=\"bt s\" id=\"cenExporta\" aria-haspopup=\"menu\" title=\"PDF, Markdown, planilha ou JSON\">Exportar ▾</button><button type=\"button\" class=\"bt s\" id=\"cenCopia\">Copiar resumo</button></div><div id=\"cenSt\" role=\"status\" aria-live=\"polite\"></div></div>";   // corpo do dialogo (o gerador do medidor usa este MESMO texto no HTML estatico)
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
        out.push({ nome: 'alertas_falhas_historico.csv', conteudo: '﻿' + csv([['Data e hora', 'Evento', 'Tipo', 'Card', 'Código', 'Referência', 'Texto', 'Modo']].concat(h.map(x => [dh(x.t), x.e, x.tipo === 'f' ? 'Falha' : x.tipo === 'i' ? 'Informação' : 'Alerta', x.card, x.cod, x.ref, x.txt, x.m]))) });
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
  /* ----------------------------- exportar (v0.4) ----------------------------- */
  const run = f => Promise.resolve().then(f).catch(e => msg('Não consegui exportar: ' + (e && e.message ? e.message : e)));
  const htmlTab = (cabec, linhas) => '<table><thead><tr>' + cabec.map(c => '<th>' + esc(c) + '</th>').join('') + '</tr></thead><tbody>' + linhas.map(l => '<tr>' + l.map(c => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table>';
  const parte = a => { try { return JSON.parse(String(a.conteudo).replace(/^﻿/, '')); } catch (e) { return null; } };
  const primeiras = (a, n) => String(a.conteudo).replace(/^﻿/, '').split('\n').slice(0, n).join('\n');
  const sec = (t, corpo) => '<h3>' + esc(t) + '</h3>' + corpo;
  const hm = t => { try { return new Date(t).toLocaleTimeString('pt-BR'); } catch (e) { return ''; } };
  const nz = v => (v === null || v === undefined || v === '') ? '—' : (typeof v === 'boolean' ? (v ? 'sim' : 'não') : v);
  const estadoEns = e => e ? (e.finalizado ? 'finalizado' : e.rodando ? 'em andamento' : e.iniciado ? 'armado' : 'não iniciado') : '—';

  function secAlertas() {
    const O = raiz.OCOR, at = O.ativas(), h = O.historico(), MAXH = 40;
    let c = at.length ? htmlTab(['Código', 'Card / ref.', 'Texto', 'Desde', 'Vezes'], at.map(x => [x.cod, x.card + (x.ref ? ' · ' + x.ref : ''), x.txt, dh(x.desde), x.vezes])) : '<p>Nenhuma ocorrência ativa no momento.</p>';
    c += '<h4>Histórico da sessão (últimos ' + Math.min(MAXH, h.length) + ' de ' + h.length + ')</h4>';
    c += h.length ? htmlTab(['Hora', 'Evento', 'Código', 'Ref.', 'Texto'], h.slice(-MAXH).map(x => [dh(x.t), x.e, x.cod, x.ref, x.txt])) : '<p>Sem eventos no histórico.</p>';
    return sec('Alertas e falhas', c);
  }
  function secMonit(arqs) {
    const a = arqs.find(x => x.nome === 'monitoramento_instantaneo.json'), o = a && parte(a); if (!o) return '';
    const l = o.link || {};
    let c = htmlTab(['Item', 'Valor'], [['Modo', o.demo ? 'DEMO' : 'REAL'], ['DSE (API do gerador)', l.dse ? 'ok: ' + nz(l.dse.ok) + ' · HTTP ' + nz(l.dse.http) : '—'],
      ['Chaves (Node-RED)', l.chv ? 'ok: ' + nz(l.chv.ok) + ' · HTTP ' + nz(l.chv.http) + (l.chv.msg ? ' · ' + l.chv.msg : '') : '—'], ['Ensaio', o.ensaio ? estadoEns(o.ensaio) + ' · etapa ' + nz(o.ensaio.etapa) : '—']]);
    if (o.bancos && o.bancos.length) c += '<h4>Bancos</h4>' + htmlTab(['Banco', 'Leitura do PLC', 'Seletora', 'Ligado'], o.bancos.map(b => ['BC' + b.id, nz(b.leituraOk), nz(b.seletora), nz(b.bancoLigado)]));
    if (o.chaves && o.chaves.length) {
      const g = {}; o.chaves.forEach(k => { const r = g[k.banco] = g[k.banco] || { n: 0, hab: 0, cmd: 0, ret: 0, fr: 0, cc: 0 }; r.n++; if (k.habilitada) r.hab++; if (k.comando) r.cmd++; if (k.retorno) r.ret++; if (k.falhaRetorno) r.fr++; if (k.contatorColado) r.cc++; });
      c += '<h4>Chaves (resumo por banco)</h4>' + htmlTab(['Banco', 'Chaves', 'Habilitadas', 'Comandadas', 'Retorno ligado', 'Falha de retorno', 'Contator colado'], Object.keys(g).map(b => [b && b !== 'undefined' ? 'BC' + b : '—', g[b].n, g[b].hab, g[b].cmd, g[b].ret, g[b].fr, g[b].cc]));
    }
    if (o.dse && typeof o.dse === 'object') { const kv = Object.keys(o.dse).filter(k => typeof o.dse[k] !== 'object').slice(0, 24); if (kv.length) c += '<h4>Última leitura do DSE</h4>' + htmlTab(['Grandeza', 'Valor'], kv.map(k => [k, nz(o.dse[k])])); }
    return sec('Monitoramento (estado agora)', c);
  }
  function secLogs(arqs) {
    let c = ''; const ev = arqs.find(x => x.nome === 'eventos_tela.jsonl');
    if (ev) {
      const E = []; String(ev.conteudo).split('\n').forEach(l => { if (l) { try { E.push(JSON.parse(l)); } catch (e) { } } });
      const cnt = k => { const m = {}; E.forEach(e => { m[e[k]] = (m[e[k]] || 0) + 1; }); return Object.keys(m).sort((a, b) => m[b] - m[a]).map(x => x + ' ' + m[x]).join(' · '); };
      c += '<p>' + E.length + ' evento(s)' + (E.length ? ' de ' + dh(E[0].t) + ' a ' + dh(E[E.length - 1].t) : '') + '.<br>Por resultado: ' + esc(cnt('res')) + '.<br>Por tipo: ' + esc(cnt('tipo')) + '.</p>';
      const g = {}; E.filter(e => e.res === 'falha' || e.res === 'aviso').forEach(e => { const k = e.res + '|' + e.acao; const r = g[k] = g[k] || { res: e.res, acao: e.acao, n: 0, a: e.t, z: e.t }; r.n++; r.z = e.t; });
      const top = Object.keys(g).map(k => g[k]).sort((a, b) => b.n - a.n).slice(0, 15);
      c += top.length ? '<h4>Falhas e avisos agrupados (' + top.length + ' de ' + Object.keys(g).length + ')</h4>' + htmlTab(['Resultado', 'Ação', '×', '1ª vez', 'Última'], top.map(r => [r.res, r.acao, r.n, hm(r.a), hm(r.z)])) : '<p>Nenhuma falha ou aviso nos eventos.</p>';
    }
    arqs.filter(x => /^log_comunicacao_/.test(x.nome)).forEach(a => { c += '<h4>' + esc(a.nome) + '</h4><pre>' + esc(primeiras(a, 12)) + '</pre>'; });
    return sec('Logs (tela e comunicação)', c || '<p>Nada disponível.</p>');
  }
  function secDados(arqs) {
    const a = arqs.find(x => x.nome === 'dados_do_ensaio.json'), r = a && parte(a), d = r && r.dados; if (!d) return '';
    let c = htmlTab(['Campo', 'Valor'], [['Nº de série', d.serie], ['Versão do teste', d.versao], ['Data', d.data || 'hoje'], ['Fase', d.fase], ['Frequência (Hz)', d.freq], ['Tensão (V)', d.tensao], ['Temp. ambiente (°C)', d.tamb], ['Potência (kW)', d.pot]].map(l => [l[0], nz(l[1])]));
    if (d.equip) c += '<h4>Equipamento</h4>' + htmlTab(['Item', 'Fabricante', 'Modelo', 'Nº de série'], d.equip.map(e => e.map(nz)));
    if (r.estado) c += '<p>Ensaio: ' + estadoEns(r.estado) + (r.etapasGravadas ? ' · etapas gravadas: ' + r.etapasGravadas.filter(x => x.gravada).length + ' de ' + r.etapasGravadas.length : '') + '.</p>';
    return sec('Dados do ensaio', c);
  }
  const secTexto = (t, a, n) => a ? sec(t, '<pre>' + esc(primeiras(a, n)) + '</pre>') : '';

  /** PDF organizado: tabelas curtas (nada de JSON/JSONL bruto). Abre a impressão do navegador: escolha "Salvar como PDF". */
  async function pdfOrganizado() {
    const s = lerSelTela(); gravaSel(s);
    if (!ITENS.some(it => s[it.id] && it.ok())) { msg('Marque pelo menos um item.'); return; }
    msg('Preparando o PDF…');
    const ens = nomeEnsaio(), { arqs, falhas } = await coleta(s);
    let pr = $('prCentral'); if (!pr) { pr = D.createElement('div'); pr.id = 'prCentral'; D.body.appendChild(pr); }
    let at = []; try { at = raiz.OCOR.ativas(); } catch (e) { }
    let modo = '—'; try { modo = $('demo').checked ? 'DEMO' : 'REAL'; } catch (e) { }
    let ensT = '—'; try { const T = sel('T', {}); ensT = T.started ? (T.fim ? 'finalizado' : (T.run ? 'em andamento' : 'armado')) : 'não iniciado'; } catch (e) { }
    let h = '<h2>Registros do medidor — ' + esc(ens) + '</h2>' + htmlTab(['Item', 'Valor'], [['Gerado em', new Date().toLocaleString('pt-BR')], ['Medidor', 'v' + sel('VERSAO', '?') + ' · Central de registros v' + VER], ['Modo', modo], ['Ensaio', ensT],
      ['Ocorrências ativas', at.length ? at.length + ' (' + at.map(x => x.cod + (x.ref ? ' ' + x.ref : '')).join(', ') + ')' : 'nenhuma'], ['Itens incluídos', ITENS.filter(it => s[it.id] && it.ok()).map(it => it.rot).join(' · ')]]);
    const B = { alertas: () => secAlertas(), monit: () => secMonit(arqs), amostras: () => secTexto('Amostras (registro de aprendizado)', arqs.find(a => /_resumo\.txt$/.test(a.nome)), 60), logs: () => secLogs(arqs), robo: () => secTexto('Dev/Operador oculto (relatório do robô)', arqs.find(a => /^dev_operador_oculto/.test(a.nome)), 60), dados: () => secDados(arqs) };
    ITENS.forEach(it => { if (s[it.id] && it.ok() && B[it.id]) { try { h += B[it.id](); } catch (e) { falhas.push(it.rot + ': ' + (e && e.message ? e.message : e)); } } });
    if (falhas.length) h += '<h3>Não foi possível gerar</h3><ul>' + falhas.map(f => '<li>' + esc(f) + '</li>').join('') + '</ul>';
    h += '<p class="rodape">Dados completos: Exportar ▸ Markdown agrupado, ou Salvar selecionados. Nada aqui comanda PLC, DSE ou chaves.</p>';
    pr.innerHTML = h; msg('');
    if (typeof sel('imprimeComNome') === 'function') sel('imprimeComNome')('registros_' + ens, 'prCentral'); else raiz.print();
  }
  /** Markdown agrupado: tudo o que esta marcado, num arquivo so (independe da pasta escolhida). */
  async function baixaMd() {
    const s = lerSelTela(); gravaSel(s);
    if (!ITENS.some(it => s[it.id] && it.ok())) { msg('Marque pelo menos um item.'); return; }
    msg('Reunindo os registros…');
    const ens = nomeEnsaio(), { arqs, falhas } = await coleta(s);
    if (!arqs.length) { msg('Nada para exportar.'); return; }
    baixa(agrupadoMd(resumoMd(ens, arqs, falhas, 'Exportar (arquivo agrupado)'), arqs), 'bt2_registros_' + ens + '_agrupado.md', 'text/markdown;charset=utf-8');
    msg('Baixado: 1 arquivo agrupado (.md). Para me enviar, anexe esse arquivo.');
  }
  async function baixaCsvAlertas() {
    const it = ITENS.find(i => i.id === 'alertas');
    if (!it.ok()) { msg('Alertas e Falhas não estão disponíveis agora.'); return; }
    const a = (await it.gera()).find(x => /\.csv$/.test(x.nome));
    baixa(a.conteudo, nomeEnsaio() + '_alertas.csv', 'text/csv;charset=utf-8'); msg('Baixado: planilha de alertas (.csv).');
  }
  function baixaJsonMonit() { baixa(JSON.stringify(monitoramento(), null, 2), nomeEnsaio() + '_monitoramento.json', 'application/json;charset=utf-8'); msg('Baixado: monitoramento (.json).'); }
  function baixaAmostras() {
    const ses = sel('rgSessoes')(), base = sel('rgNomeBase')(ses);
    baixa(sel('rgCsvTxt')(ses), base + '_amostras.csv', 'text/csv'); msg('Baixado: amostras (.csv).');
  }
  /** Menu Exportar ▾ (mesmo menu EXPO dos outros dialogos do medidor). */
  function exportaMenu(btn) {
    const itens = [
      { rot: 'PDF organizado (imprimir)', dica: 'resumo, ocorrências e dados do ensaio em poucas páginas — escolha “Salvar como PDF”', fn: () => run(pdfOrganizado) },
      { rot: 'Markdown agrupado (.md)', dica: 'tudo o que está marcado num arquivo só, para colar na conversa', fn: () => run(baixaMd) },
      { rot: 'Planilha de alertas (.csv)', dica: 'histórico de alertas e falhas, para o Excel', fn: () => run(baixaCsvAlertas) },
      { rot: 'Monitoramento (.json)', dica: 'estado agora: DSE, PLC, bancos, chaves, ensaio e ocorrências ativas', fn: () => run(baixaJsonMonit) }
    ];
    try { if (ITENS.find(i => i.id === 'amostras').ok()) itens.push({ rot: 'Amostras (.csv)', dica: 'registro de aprendizado: sessões pendentes, para planilha', fn: () => run(baixaAmostras) }); } catch (e) { }
    const E = sel('EXPO', null);
    if (E && typeof E.menu === 'function') E.menu(btn, itens); else itens[0].fn();
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
      @media print{ body.prCentral>*:not(#prCentral){display:none!important} body.prCentral #prCentral{display:block!important;font-size:11px;color:#000}
        body.prCentral #prCentral pre{white-space:pre-wrap;word-break:break-word;font-size:9.5px;border:1px solid #bbb;padding:4px 6px}
        body.prCentral #prCentral h2{font-size:15px;margin:0 0 6px} body.prCentral #prCentral h3{font-size:12.5px;margin:12px 0 4px;border-bottom:2px solid #1a4a78;page-break-after:avoid} body.prCentral #prCentral h4{font-size:11px;margin:8px 0 3px;page-break-after:avoid}
        body.prCentral #prCentral table{border-collapse:collapse;width:100%;font-size:9.5px;margin-bottom:4px} body.prCentral #prCentral th,body.prCentral #prCentral td{border:1px solid #888;padding:2px 4px;text-align:left;vertical-align:top;word-break:break-word} body.prCentral #prCentral th{background:#e3e9f0} body.prCentral #prCentral tr{page-break-inside:avoid}
        body.prCentral #prCentral .rodape{margin-top:10px;font-size:9.5px;color:#444} }`;
    D.head.appendChild(st);
    dlg = $('dlgCentral');   // v0.2: o dialogo agora ESTA NO HTML (como os outros) para receber o fechar (✕) e o arrastar que sao ligados ao carregar a pagina
    if (!dlg) {              // reserva: se o HTML nao trouxer o dialogo, cria e liga o ✕ aqui
      dlg = D.createElement('dialog'); dlg.id = 'dlgCentral'; dlg.className = 'jan livre'; dlg.setAttribute('data-nofora', ''); dlg.style.setProperty('--w', '640px'); dlg.setAttribute('aria-labelledby', 'cenT');
      dlg.innerHTML = CORPO; D.body.appendChild(dlg);
      dlg.querySelectorAll('[data-fecha]').forEach(b => b.addEventListener('click', () => dlg.close()));
    }
    $('cenSalva').onclick = salvar; $('cenExporta').onclick = e => exportaMenu(e.currentTarget); $('cenCopia').onclick = copiaResumo;
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
      fimVisto = true; if (raiz.CEN_PERGUNTA_FIM !== false) mostraAviso();   // v1.10.191: chave em ⚙ Modo
    } catch (e) { }
  }, 1000);

  /* ----------------------------- entradas: chip e menu do botão direito ----------------------------- */
  const iniciaChip = () => { const b = $('bCentral'); if (b) b.addEventListener('click', () => abre()); };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', iniciaChip); else iniciaChip();
  raiz.CENTRAL_REG = { versao: VER, abre, itens: ITENS.map(i => i.id), coleta: s => coleta(s || lerSel()), monitoramento };
})(window);


/* ===== v1.10.191 · PERGUNTAR AO FINAL DO ENSAIO (Modo) =====
   POR QUE: ao terminar o ensaio a tela mostra "Salvar os registros agora?". Quem não quer essa pergunta (ex.: rodadas de Demo) pode desligá-la.
   O QUE FAZ: botões Sim/Não em ⚙ Modo. Padrão SIM. Guarda em localStorage 'medidor.cen.perguntaFim' ('0' = não pergunta; com try/catch). O botão "Registros" continua abrindo a Central. Não grava nada, não comanda PLC. */
(function(){
  const K='medidor.cen.perguntaFim';
  function pinta(){const w=document.getElementById('mdPf');if(!w)return;const v=window.CEN_PERGUNTA_FIM!==false?'1':'0';[...w.children].forEach(b=>b.classList.toggle('on',b.dataset.v===v));
    const n=document.getElementById('mdPfNota');if(n)n.textContent=v==='1'?'Ao terminar o ensaio a tela pergunta "Salvar os registros agora?". Nada é gravado sozinho.':'Ao terminar o ensaio a tela NÃO pergunta. Os registros continuam disponíveis no botão "Registros".'}
  try{window.CEN_PERGUNTA_FIM=localStorage.getItem(K)!=='0'}catch(e){window.CEN_PERGUNTA_FIM=true}
  const w=document.getElementById('mdPf');
  if(w){w.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;window.CEN_PERGUNTA_FIM=b.dataset.v==='1';try{localStorage.setItem(K,window.CEN_PERGUNTA_FIM?'1':'0')}catch(x){}pinta()});pinta()}
})();

/* ===== v1.10.176 · GUARDA "JANELA NA TELA" =====
   POR QUE: a posição guardada de uma janela (ou o zoom/ampliar do Gráfico) podia deixá-la com o ✕ e botões fora da tela (ex.: Gráfico ampliado abria com a borda direita cortada).
   O QUE FAZ: quando uma janela aberta muda de tamanho/posição ou a tela muda (girar o celular), empurra a janela só o suficiente para ela caber inteira na tela. Não mexe em janela centralizada pelo navegador. */
(function(){
  function garante(d){
    if(!d.open)return;
    const r=d.getBoundingClientRect();if(r.width<=0||r.height<=0)return;
    if(!d.style.left&&!d.style.top)return;
    const z=d.offsetWidth?r.width/d.offsetWidth:1,W=innerWidth,H=innerHeight;let dx=0,dy=0;
    if(r.width<=W){if(r.left<0)dx=-r.left;else if(r.right>W)dx=W-r.right}else{if(r.left>0)dx=-r.left;else if(r.right<W)dx=W-r.right}
    if(r.height<=H){if(r.top<0)dy=-r.top;else if(r.bottom>H)dy=H-r.bottom}else{if(r.top>0)dy=-r.top;else if(r.bottom<H)dy=H-r.bottom}
    if(Math.abs(dx)<1&&Math.abs(dy)<1)return;
    d.style.left=((parseFloat(d.style.left)||r.left/z)+dx/z)+'px';d.style.top=((parseFloat(d.style.top)||r.top/z)+dy/z)+'px';
  }
  const ro=window.ResizeObserver?new ResizeObserver(es=>es.forEach(e=>garante(e.target))):null;
  const mo=new MutationObserver(ms=>ms.forEach(m=>garante(m.target)));
  document.querySelectorAll('dialog.jan').forEach(d=>{if(ro)ro.observe(d);mo.observe(d,{attributes:true,attributeFilter:['open','style']})});
  addEventListener('resize',()=>document.querySelectorAll('dialog.jan[open]').forEach(garante));
})();
