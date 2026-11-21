/* =====================================================================================================================
   rnc_defeito_v0.2.js — BOTÃO "Registrar defeito" (RNC) NO MEDIDOR  ·  13/11/2026
   v0.2 (13/11/2026): a faixa de aviso fica no RODAPÉ (não cobre mais os botões do cabeçalho) e Esc fecha a janela. Resto igual à v0.1.
   Colado (inline) no medidor 1.10.135 (v0.1) e 1.10.202 (v0.2), num <script> próprio DEPOIS do modo_operador (usa as variáveis do medidor: T, ETAPAS, MODO, DADOS, DADOS_MODELO, GEN, VERSAO, $, find, srvBase).

   PARA QUE SERVE (leigo): durante o ensaio o operador toca em "⚠ Registrar defeito". Abre uma janela já com o que o medidor sabe (modelo, etapa do
   ensaio, hora, grandezas elétricas e alarmes do DSE). Ele só confere o número de série, escolhe o tipo, descreve o defeito e confirma. O gerador fica
   BLOQUEADO para expedição na RNC. O reparo é feito por outra pessoa, na tela "RNC · Reparo".
   TAMBÉM AVISA (só informativo, nunca bloqueia o ensaio): ao iniciar o ensaio, ao trocar de etapa ou ao mudar o nº de série, consulta se a série já tem RNC
   pendente e mostra uma faixa e uma etiqueta no cabeçalho ("RNC: BLOQUEADO (n)").

   POR QUE (técnico): fala SÓ com o Node-RED pelas rotas /api/rnc/* (fluxo rnc-api-v1.1), na mesma URL de servidor do medidor (srvBase()). NÃO lê nem escreve no PLC,
   nas chaves, no DSE: o "contexto" é uma FOTOGRAFIA do que a tela já tem na memória (window.__ultimoDado, T, ETAPAS...). Só aparece "Salvo" depois que o servidor
   confirma a gravação no disco; se falhar, a janela continua preenchida e o reenvio usa a mesma chave (não duplica).
   DEMO: com o Demo ligado os dados são simulados. O envio é permitido (para treinar/testar), mas a descrição leva o prefixo "[DEMO]" e o contexto marca demo:true.
   NÃO FAZ: não decide liberação, não altera o ensaio, não comanda nada, não guarda RNC no navegador (só o NOME de quem digita, conveniência).
   Contexto enviado (limite 8000 caracteres no servidor): { origem, versao_medidor, demo, tipo_ensaio, momento, modelo:{dse,dse_texto,gerador}, ensaio:{...}, grandezas:{...}, alarmes:{...}, gerador_estado }.
   ===================================================================================================================== */
(function () {
  'use strict';
  const ler = k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } };
  const grava = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const seguro = (fn, pad) => { try { const v = fn(); return v === undefined ? pad : v; } catch (e) { return pad; } };
  const R = { chave: null, serieAviso: '', ultSit: null, ultEt: -1, ultIni: false, ultFetch: 0, faixaSerie: '' };

  /* ---------------- contexto: fotografia do que a tela já tem (só leitura) ---------------- */
  const GRANDEZAS = ['tensaoL1N', 'tensaoL2N', 'tensaoL3N', 'tensaoL1L2', 'tensaoL2L3', 'tensaoL3L1', 'frequencia',
    'correnteL1', 'correnteL2', 'correnteL3', 'kw', 'kva', 'kvar', 'fp', 'rpm', 'tempAguaC', 'tempOleoC', 'pressaoOleoBar', 'bateria', 'alternador', 'nivelCombustivel', 'horasMotor'];
  function captura() {
    const d = window.__ultimoDado || null;
    const num = v => (typeof v === 'number' && isFinite(v)) ? Math.round(v * 100) / 100 : null;
    const grand = {};
    if (d) GRANDEZAS.forEach(k => { const v = num(find(d, k)); if (v != null) grand[k] = v; });
    const cargaPct = seguro(() => (typeof carga === 'number' && isFinite(carga)) ? Math.round(carga * 10) / 10 : null, null);
    if (cargaPct != null) grand.cargaPct = cargaPct;
    const alarmesLista = seguro(() => { const a = findKey(d, 'alarmes'); return Array.isArray(a) ? a.slice(0, 30).map(x => ({ nome: String(x.nome || x).slice(0, 80), nivel: String(x.nivel || '').slice(0, 20) })) : []; }, []);
    const modelo = seguro(() => DADOS_MODELO, null) || window.DADOS_MODELO || null;
    return {
      origem: 'medidor', versao_medidor: seguro(() => VERSAO, null), demo: !!seguro(() => $('demo').checked, false), tipo_ensaio: seguro(() => MODO, null),
      momento: new Date().toISOString(),
      modelo: {
        dse: d ? (find(d, 'modeloConfigurado') || null) : null, dse_texto: d ? (find(d, 'modeloTexto') || null) : null,
        gerador: modelo ? { arquivo: modelo.arquivo || null, kVA: modelo.kVA || null, V: modelo.V || null, Hz: modelo.Hz || null, kW: modelo.kW || null } : null
      },
      ensaio: seguro(() => ({
        iniciado: !!T.started, rodando: !!T.run, fim: !!T.fim, etapa: T.et, etapa_nome: (ETAPAS[T.et] && ETAPAS[T.et].nome) || null,
        alvo_pct: (ETAPAS[T.et] && ETAPAS[T.et].alvo != null) ? ETAPAS[T.et].alvo : null, decorrido_s: Math.round(T.el * 10) / 10, estavel_s: Math.round((T.estavel || 0) * 10) / 10,
        etapas_salvas: ETAPAS.map((e, i) => SNAP[i] ? i : -1).filter(i => i >= 0)
      }), null),
      grandezas: grand,
      alarmes: {
        temAlarme: d ? !!find(d, 'temAlarme') : null, aviso: d ? !!find(d, 'alarmeAviso') : null, desligamento: d ? !!find(d, 'alarmeDesligamento') : null,
        tripEletrico: d ? !!find(d, 'alarmeTripEletrico') : null, lista: alarmesLista
      },
      gerador_estado: seguro(() => GEN.estado, null),
      leitura_valida: seguro(() => !!dadoOk, null)
    };
  }

  /* ---------------- servidor ---------------- */
  async function api(caminho, opc) {
    const base = seguro(() => srvBase(), '');
    if (!base) throw new Error('Servidor (Node-RED) não informado. Use ⚙ Demo e Servidor.');
    const r = await fetch(base + caminho, Object.assign({ cache: 'no-store' }, opc || {}));
    let j = null; try { j = await r.json(); } catch (e) {}
    if (!r.ok || !j || j.ok === false) { const e = new Error((j && j.erro) || ('HTTP ' + r.status)); e.status = r.status; throw e; }
    return j;
  }
  const normSerie = s => String(s || '').replace(/\s+/g, '').toUpperCase();
  const serieAtual = () => normSerie(seguro(() => $('dServ').value, '') || seguro(() => DADOS.serie, ''));

  /* ---------------- janela ---------------- */
  function montaJanela() {
    if (document.getElementById('dlgRnc')) return;
    const dlg = document.createElement('dialog');
    dlg.id = 'dlgRnc'; dlg.className = 'jan'; dlg.style.setProperty('--w', '620px'); dlg.setAttribute('aria-labelledby', 'dlgRncT');
    dlg.innerHTML =
      '<div class="jt"><span id="dlgRncT">Registrar defeito (RNC)</span><button type="button" class="jx" data-fecha aria-label="Fechar" title="Fechar">✕</button></div>' +
      '<div class="jb" style="font-size:14px">' +
      '<p style="margin:0 0 8px;color:var(--mut)">O gerador fica <b>bloqueado para expedição</b> até ser consertado e aprovado no reteste. O medidor anexa sozinho modelo, etapa, hora, grandezas e alarmes do DSE.</p>' +
      '<div id="rncDemo" class="jnota" style="display:none;color:#9a6700"></div>' +
      '<div class="jlin jl3"><label>Nº de série<input id="rncSerie" autocomplete="off" style="text-transform:uppercase"></label>' +
      '<label>Modelo<input id="rncModelo" autocomplete="off" maxlength="60"></label>' +
      '<label>Banco<select id="rncBanco"><option>BT1</option><option>BT2</option></select></label></div>' +
      '<div id="rncAvSerie"></div>' +
      '<label style="display:block;margin-top:8px">Tipo<select id="rncTipo" style="width:100%"><option value="DEFEITO">Defeito</option><option value="ERRO_MONTAGEM">Erro de montagem</option><option value="FALHA_ENSAIO" selected>Falha no ensaio</option><option value="OUTRO">Outro</option></select></label>' +
      '<label style="display:block;margin-top:8px">O que aconteceu? (5 a 1000 caracteres)<textarea id="rncDesc" rows="3" maxlength="1000" style="width:100%"></textarea></label>' +
      '<label style="display:block;margin-top:8px">Seu nome<input id="rncNome" maxlength="60" style="width:100%" placeholder="quem está registrando"></label>' +
      '<details style="margin-top:8px"><summary>O que será anexado (automático)</summary><pre id="rncCtx" style="max-height:180px;overflow:auto;font-size:11px;white-space:pre-wrap"></pre></details>' +
      '<div id="rncRes" role="status" aria-live="polite" style="margin-top:8px"></div>' +
      '<div class="jbtns"><button type="button" class="bt" id="rncEnv" style="flex:2;background:var(--ui-acento);color:#fff;border:0;font-weight:700">Registrar e bloquear gerador</button>' +
      '<button type="button" class="bt s" data-fecha style="flex:1">Cancelar</button></div></div>';
    document.body.appendChild(dlg);
    dlg.addEventListener('click', e => { if (e.target.closest('[data-fecha]')) dlg.close(); });
    dlg.addEventListener('keydown', e => { if (e.key === 'Escape') dlg.close(); });
    document.getElementById('rncEnv').onclick = envia;
    document.getElementById('rncSerie').addEventListener('input', () => { clearTimeout(R.tAv); R.tAv = setTimeout(avisoNaJanela, 400); });
  }
  const msg = (cls, html) => { const el = document.getElementById('rncRes'); if (el) el.innerHTML = html ? '<div style="padding:8px 10px;border-radius:8px;border:1px solid ' + (cls === 'ok' ? '#2e9a5f' : cls === 'bad' ? '#d64545' : '#c58b00') + '">' + html + '</div>' : ''; };

  function abre() {
    montaJanela();
    const c = captura(), dlg = document.getElementById('dlgRnc');
    R.chave = R.chave || ((self.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('k' + Date.now() + Math.random().toString(36).slice(2)));
    document.getElementById('rncSerie').value = serieAtual();
    document.getElementById('rncModelo').value = (c.modelo.gerador && c.modelo.gerador.arquivo) || c.modelo.dse_texto || c.modelo.dse || '';
    const b = (new URLSearchParams(location.search).get('banco') || ler('rnc_banco') || 'BT2').toUpperCase(); document.getElementById('rncBanco').value = (b === 'BT1' ? 'BT1' : 'BT2');
    document.getElementById('rncNome').value = ler('rnc_nome');
    document.getElementById('rncCtx').textContent = JSON.stringify(c, null, 1);
    const dm = document.getElementById('rncDemo'); dm.style.display = c.demo ? '' : 'none'; dm.textContent = c.demo ? 'Demo ligado: os dados são SIMULADOS. O registro vai com o prefixo [DEMO] (use só para treino/teste).' : '';
    msg('', ''); avisoNaJanela();
    if (!dlg.open) dlg.showModal();
  }

  async function envia() {
    const g = id => document.getElementById(id);
    const ctx = captura(), demo = ctx.demo;
    let desc = g('rncDesc').value.trim(); const serial = normSerie(g('rncSerie').value), modelo = g('rncModelo').value.trim(), nome = g('rncNome').value.trim();
    if (!serial || !modelo || desc.length < 5 || !nome) { msg('bad', 'Preencha série, modelo, descrição (mín. 5 letras) e seu nome.'); return; }
    if (demo && !/^\[DEMO\]/.test(desc)) desc = '[DEMO] ' + desc;
    g('rncEnv').disabled = true; msg('warn', 'Gravando…');
    try {
      const j = await api('/api/rnc/abrir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        serial, modelo, banco: g('rncBanco').value, tipo_nc: g('rncTipo').value, descricao: desc, actor: nome, contexto: ctx, idempotency_key: R.chave }) });
      grava('rnc_nome', nome); grava('rnc_banco', g('rncBanco').value);
      msg('ok', '<b>Salvo.</b> ' + esc(j.rnc.rnc_id) + ' · gerador <b>BLOQUEADO</b>. Coloque a etiqueta de bloqueio e encaminhe ao reparo.');
      R.chave = null; g('rncDesc').value = ''; consulta(serial, true);
    } catch (e) {
      msg('bad', '<b>NÃO foi salvo.</b> ' + esc(e.message) + ' — a janela continua preenchida; corrija e toque de novo (não duplica).');
    } finally { g('rncEnv').disabled = false; }
  }

  /* ---------------- aviso informativo: série com RNC pendente ---------------- */
  async function avisoNaJanela() {
    const s = normSerie(document.getElementById('rncSerie').value), el = document.getElementById('rncAvSerie'); el.innerHTML = '';
    if (s.length < 10) return;
    try {
      const j = await api('/api/rnc/serie/' + encodeURIComponent(s));
      if (j.total) el.innerHTML = '<div class="jnota" style="color:' + (j.situacao === 'BLOQUEADO' ? '#d64545' : '#2e9a5f') + '">Esta série já tem <b>' + j.total + '</b> RNC(s) · <b>' + esc(j.situacao) + '</b>' + (j.pendentes.length ? ' (pendente: ' + j.pendentes.map(p => esc(p.rnc_id) + ' ' + esc(p.estado.replace(/_/g, ' ').toLowerCase())).join(', ') + ')' : '') + '</div>';
    } catch (e) { /* sem servidor: o aviso é só informativo */ }
  }
  function etiqueta(j, erro) {
    const pill = document.getElementById('pRncAv'); if (!pill) return;
    if (erro || !j || j.situacao !== 'BLOQUEADO') { pill.style.display = 'none'; return; }
    pill.textContent = 'RNC: BLOQUEADO (' + j.pendentes.length + ')'; pill.style.display = '';
    pill.title = 'Série ' + j.serial + ': ' + j.pendentes.map(p => p.rnc_id + ' ' + p.estado.replace(/_/g, ' ').toLowerCase()).join(' · ') + '. Informativo: não impede o ensaio.';
  }
  function faixa(j, motivo) {
    let f = document.getElementById('rncFaixa');
    if (!j || j.situacao !== 'BLOQUEADO') { if (f) f.style.display = 'none'; return; }
    if (!f) {
      f = document.createElement('div'); f.id = 'rncFaixa'; f.setAttribute('role', 'status');
      f.style.cssText = 'position:fixed;left:50%;bottom:34px;transform:translateX(-50%);z-index:9999;max-width:92vw;background:#fff4d6;color:#4a3500;border:1px solid #c58b00;border-radius:10px;padding:8px 12px;font-size:13px;box-shadow:0 4px 14px rgba(0,0,0,.25)';
      f.innerHTML = '<span id="rncFaixaT"></span> <button type="button" id="rncFaixaX" style="margin-left:8px" aria-label="Fechar aviso">✕</button>';
      document.body.appendChild(f); document.getElementById('rncFaixaX').onclick = () => { f.style.display = 'none'; };
    }
    const aguard = j.pendentes.some(p => p.estado === 'AGUARDANDO_RETESTE');
    document.getElementById('rncFaixaT').innerHTML = '<b>Atenção (' + esc(motivo) + '):</b> a série ' + esc(j.serial) + ' tem <b>' + j.pendentes.length + '</b> RNC pendente(s) — gerador <b>BLOQUEADO</b> para expedição' +
      (aguard ? ' · há reteste aguardando: registre o resultado na tela <i>RNC · Reparo</i> depois deste ensaio' : '') + '. Só informativo: o ensaio não é bloqueado.';
    f.style.display = '';
  }
  async function consulta(serial, forca, motivo) {
    if (!serial || serial.length < 10) { etiqueta(null); return; }
    if (!seguro(() => srvBase(), '')) return;
    R.ultFetch = Date.now();
    try {
      const j = await api('/api/rnc/serie/' + encodeURIComponent(serial));
      etiqueta(j);
      const mudou = R.ultSit !== j.situacao || R.serieAviso !== serial;
      if (motivo && j.situacao === 'BLOQUEADO' && (mudou || forca)) faixa(j, motivo); else if (j.situacao !== 'BLOQUEADO') faixa(null);
      R.ultSit = j.situacao; R.serieAviso = serial;
    } catch (e) { etiqueta(null, true); }   // sem servidor/rota: silencioso, o aviso é só informativo
  }
  // vigia: início do ensaio, troca de etapa, troca de série e renovação a cada 30 s
  function vigia() {
    const ini = !!seguro(() => T.started, false), et = seguro(() => T.et, 0), s = serieAtual();
    let motivo = '';
    if (ini && !R.ultIni) motivo = 'ensaio iniciado'; else if (ini && et !== R.ultEt) motivo = 'nova etapa'; else if (s !== R.serieAviso && s) motivo = 'série informada';
    R.ultIni = ini; R.ultEt = et;
    if (motivo) consulta(s, true, motivo); else if (Date.now() - R.ultFetch > 30000) consulta(s, false, '');
  }

  /* ---------------- botões no cabeçalho ---------------- */
  function monta() {
    const ref = document.getElementById('bDados'); if (!ref || document.getElementById('bRnc')) return;
    const b = document.createElement('button'); b.id = 'bRnc'; b.type = 'button'; b.textContent = '⚠ Registrar defeito';
    b.title = 'Registra um defeito/erro de montagem (RNC) deste gerador e o bloqueia para expedição. Anexa modelo, etapa, hora, grandezas e alarmes do DSE.';
    b.onclick = abre; ref.insertAdjacentElement('afterend', b);
    const p = document.createElement('span'); p.id = 'pRncAv'; p.className = 'pill'; p.style.cssText = 'display:none;background:#d64545;color:#fff'; p.textContent = 'RNC';
    const alvo = document.getElementById('pModelo'); if (alvo) alvo.insertAdjacentElement('beforebegin', p); else b.insertAdjacentElement('afterend', p);
  }
  monta(); setInterval(vigia, 2000);
  window.RNC_DEFEITO = { abre, captura, consulta: s => consulta(normSerie(s), true, 'consulta') };
})();
