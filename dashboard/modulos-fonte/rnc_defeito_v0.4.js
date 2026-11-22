/* =====================================================================================================================
   rnc_defeito_v0.4.js — ÁREA "RNC" NO MEDIDOR (botão de ativação, registro de defeito, fila de envio e arquivo .csv)  ·  16/11/2026
   v0.4 (16/11/2026, pedido do Reginaldo): (1) o RNC vira uma ÁREA SEPARADA, com botão "RNC" no cabeçalho e um interruptor "Usar RNC" que nasce DESLIGADO (hoje o RNC é o cartão escrito; a automação é melhoria).
   Desligado = o medidor fica como era: sem botão "Registrar defeito", sem aviso "RNC: BLOQUEADO" e SEM nenhuma chamada a /api/rnc. Ligado = tudo da v0.3 + a área (pendentes, recentes, atalho do Reparo).
   (2) SEM REDE: se o servidor não responder (queda de rede ou erro 5xx), o registro NÃO se perde: entra numa fila e o medidor BAIXA um arquivo .csv (RNC_pendente_<série>_<data-hora>.csv, abre no Excel) como cópia durável.
   A fila é reenviada sozinha (a cada 30 s e quando a rede volta, com a página aberta) ou pelo botão "Enviar pendentes (.csv)". Reenviar usa a MESMA chave de idempotência: o servidor nunca cria duas RNCs.
   Recusa do servidor por dado inválido (400/409/413…) NÃO entra na fila: aparece o erro e a janela continua preenchida. Item recusado no reenvio fica visível como "recusada", nunca é descartado em silêncio.
   AVISO AO OPERADOR: registro na fila = "salvo SÓ neste aparelho, NÃO está no sistema": coloque a etiqueta BLOQUEADO. O gerador só fica bloqueado no sistema depois do servidor confirmar.
   LIMITE: se o arquivo .csv for apagado e a página fechada antes do envio, o registro pendente se perde. Fotos não vão pelo medidor (só pela tela rnc_registro).
   v0.3 (13/11/2026): BOTÃO "Registrar defeito" (RNC) NO MEDIDOR.
   v0.2 (13/11/2026): a faixa de aviso fica no RODAPÉ (não cobre mais os botões do cabeçalho) e Esc fecha a janela. Resto igual à v0.1.
   v0.3 (13/11/2026, revisão de código): (1) a consulta que falha (servidor fora do ar / rota ausente) NÃO é repetida a cada 2 s — a série fica marcada como já tentada e só a renovação de 30 s volta a tentar;
   (2) a chave de idempotência deixa de valer para outro conteúdo: se série, modelo, tipo ou descrição mudarem, nasce chave nova (antes o reenvio de OUTRO defeito podia devolver a RNC antiga);
   (3) RNC_DEFEITO.pausa(true|false) pausa o vigia (usado pelo robô para o teste do aviso não competir com o vigia). Resto igual à v0.2.
   Colado (inline) no medidor 1.10.135 (v0.1), 1.10.202/203 (v0.2), 1.10.204 (v0.3) e 1.10.216 (v0.4), num <script> próprio DEPOIS do modo_operador (usa as variáveis do medidor: T, ETAPAS, MODO, DADOS, DADOS_MODELO, GEN, VERSAO, $, find, srvBase).

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
  const LS_ON = 'medidor.rncAtivo';
  const R = { chave: null, sig: '', serieAviso: '', ultSit: null, ultEt: -1, ultIni: false, ultFetch: 0, faixaSerie: '', pausa: false, on: ler(LS_ON) === '1', enviando: false };
  const FILA = [];   // registros que não chegaram ao servidor: { chave, serial, modelo, banco, tipo_nc, descricao, actor, contexto, criado, estado:'pendente'|'recusada', erro }

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
    const sig = [serial, modelo, g('rncBanco').value, g('rncTipo').value, desc].join('|');   // chave de idempotência vale só para ESTE conteúdo
    if (!R.chave || R.sig !== sig) { R.chave = (self.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('k' + Date.now() + Math.random().toString(36).slice(2)); R.sig = sig; }
    g('rncEnv').disabled = true; msg('warn', 'Gravando…');
    try {
      const j = await api('/api/rnc/abrir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        serial, modelo, banco: g('rncBanco').value, tipo_nc: g('rncTipo').value, descricao: desc, actor: nome, contexto: ctx, idempotency_key: R.chave }) });
      grava('rnc_nome', nome); grava('rnc_banco', g('rncBanco').value);
      msg('ok', '<b>Salvo.</b> ' + esc(j.rnc.rnc_id) + ' · gerador <b>BLOQUEADO</b>. Coloque a etiqueta de bloqueio e encaminhe ao reparo.');
      R.chave = null; R.sig = ''; g('rncDesc').value = ''; consulta(serial, true);
    } catch (e) {
      if (semRede(e)) {   // v0.4: servidor fora/sem rede: guarda na fila e baixa o .csv
        const it = { chave: R.chave, serial, modelo, banco: g('rncBanco').value, tipo_nc: g('rncTipo').value, descricao: desc, actor: nome, contexto: ctx, criado: new Date().toISOString(), estado: 'pendente', erro: '' };
        FILA.push(it); grava('rnc_nome', nome); grava('rnc_banco', it.banco);
        const arq = baixaCsv([it], 'RNC_pendente_' + serial + '_' + selo() + '.csv');
        msg('warn', '<b>Salvo SÓ neste aparelho — ainda NÃO está no sistema.</b> O gerador <b>ainda não está bloqueado</b> no sistema: coloque a <b>etiqueta de bloqueio</b> agora. Arquivo baixado: <b>' + esc(arq) + '</b> (guarde-o). Será enviado sozinho quando a rede voltar (com esta página aberta) ou por <i>RNC › Enviar pendentes (.csv)</i>.');
        R.chave = null; R.sig = ''; g('rncDesc').value = ''; atualizaPend();
      } else msg('bad', '<b>NÃO foi salvo.</b> ' + esc(e.message) + ' — a janela continua preenchida; corrija e toque de novo (não duplica).');
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
    if (!R.on) return;
    R.ultFetch = Date.now();
    if (!serial || serial.length < 10) { etiqueta(null); return; }
    R.serieAviso = serial;   // tentativa feita: se falhar, NÃO repete a cada 2 s (a renovação de 30 s tenta de novo)
    if (!seguro(() => srvBase(), '')) return;
    try {
      const j = await api('/api/rnc/serie/' + encodeURIComponent(serial));
      etiqueta(j);
      const mudou = R.ultSit !== j.situacao || R.serieAviso !== serial;
      if (motivo && j.situacao === 'BLOQUEADO' && (mudou || forca)) faixa(j, motivo); else if (j.situacao !== 'BLOQUEADO') faixa(null);
      R.ultSit = j.situacao;
    } catch (e) { etiqueta(null, true); }   // sem servidor/rota: silencioso, o aviso é só informativo
  }
  // vigia: início do ensaio, troca de etapa, troca de série e renovação a cada 30 s
  function vigia() {
    if (!R.on || R.pausa) return;   // v0.4: RNC desligado = nenhuma consulta; o robô de teste pausa o vigia enquanto confere o aviso por conta própria
    const ini = !!seguro(() => T.started, false), et = seguro(() => T.et, 0), s = serieAtual();
    let motivo = '';
    if (ini && !R.ultIni) motivo = 'ensaio iniciado'; else if (ini && et !== R.ultEt) motivo = 'nova etapa'; else if (s !== R.serieAviso && s) motivo = 'série informada';
    R.ultIni = ini; R.ultEt = et;
    if (motivo) consulta(s, true, motivo); else if (Date.now() - R.ultFetch > 30000) consulta(s, false, '');
  }

  /* ---------------- botões no cabeçalho ---------------- */
  function monta() {
    const ref = document.getElementById('bDados'); if (!ref || document.getElementById('bRncArea')) return;
    const a = document.createElement('button'); a.id = 'bRncArea'; a.type = 'button'; a.textContent = 'RNC';
    a.title = 'Área do RNC (registro de defeito): ligar/desligar, pendentes de envio e recentes.'; a.onclick = abreArea; ref.insertAdjacentElement('afterend', a);
    const q = document.createElement('span'); q.id = 'pRncPend'; q.className = 'pill'; q.style.cssText = 'display:none;background:#c58b00;color:#fff;cursor:pointer'; q.onclick = abreArea;
    a.insertAdjacentElement('afterend', q);
    aplicaAtivo(R.on, true);
  }
  /* ---- liga/desliga: só mexe no que é do RNC (botão, aviso, consulta). Desligado = nada de rede. ---- */
  function aplicaAtivo(v, inicial) {
    R.on = !!v; if (!inicial) grava(LS_ON, R.on ? '1' : '0');
    const ref = document.getElementById('bRncArea'); if (!ref) return;
    let b = document.getElementById('bRnc'), p = document.getElementById('pRncAv');
    if (R.on) {
      if (!b) {
        b = document.createElement('button'); b.id = 'bRnc'; b.type = 'button'; b.textContent = '⚠ Registrar defeito';
        b.title = 'Registra um defeito/erro de montagem (RNC) deste gerador e o bloqueia para expedição. Anexa modelo, etapa, hora, grandezas e alarmes do DSE.';
        b.onclick = abre; ref.insertAdjacentElement('afterend', b);
      }
      if (!p) { p = document.createElement('span'); p.id = 'pRncAv'; p.className = 'pill'; p.style.cssText = 'display:none;background:#d64545;color:#fff'; p.textContent = 'RNC'; b.insertAdjacentElement('afterend', p); }
    } else {
      if (b) b.remove(); if (p) p.remove(); const f = document.getElementById('rncFaixa'); if (f) f.style.display = 'none'; R.serieAviso = ''; R.ultSit = null; R.ultEt = -1; R.ultIni = false;
    }
    ref.classList.toggle('on', R.on); ref.textContent = R.on ? 'RNC ✓' : 'RNC';
    const cb = document.getElementById('rncOn'); if (cb) cb.checked = R.on;
    areaEstado(); atualizaPend(); if (R.on && !inicial) vigia();
  }

  /* ---------------- fila de envio e arquivo .csv ---------------- */
  const semRede = e => !e || e.status == null || e.status >= 500 || e.status === 408 || e.status === 429;   // sem resposta do servidor (rede) ou servidor com problema
  const selo = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '_' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()); };
  const COLS = ['chave', 'serie', 'modelo', 'banco', 'tipo', 'descricao', 'nome', 'criado_em', 'contexto_json'];
  const csvCel = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  function csvTexto(itens) {
    return '\uFEFF' + [COLS.map(csvCel).join(';')].concat(itens.map(i => [i.chave, i.serial, i.modelo, i.banco, i.tipo_nc, i.descricao, i.actor, i.criado, i.contexto ? JSON.stringify(i.contexto) : ''].map(csvCel).join(';'))).join('\r\n') + '\r\n';
  }
  function baixaCsv(itens, nome) {
    try {
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csvTexto(itens)], { type: 'text/csv;charset=utf-8' })); a.download = nome;
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    } catch (e) { /* sem download: a fila em memória continua */ }
    return nome;
  }
  function parseCsv(txt) {   // separador ';', aspas duplas, quebra de linha dentro de aspas
    const out = []; let lin = [], cel = '', asp = false; txt = String(txt || '').replace(/^\uFEFF/, '');
    for (let i = 0; i < txt.length; i++) {
      const c = txt[i];
      if (asp) { if (c === '"') { if (txt[i + 1] === '"') { cel += '"'; i++; } else asp = false; } else cel += c; }
      else if (c === '"') asp = true;
      else if (c === ';') { lin.push(cel); cel = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && txt[i + 1] === '\n') i++; lin.push(cel); cel = ''; if (lin.length > 1 || lin[0] !== '') out.push(lin); lin = []; }
      else cel += c;
    }
    if (cel !== '' || lin.length) { lin.push(cel); out.push(lin); }
    return out;
  }
  function itensDoCsv(txt) {
    const l = parseCsv(txt); if (l.length < 2) return { itens: [], erros: ['arquivo sem linhas de dados'] };
    const ix = {}; l[0].forEach((h, i) => { ix[String(h).trim().toLowerCase()] = i; });
    const falta = ['chave', 'serie', 'modelo', 'descricao', 'nome'].filter(k => ix[k] == null); if (falta.length) return { itens: [], erros: ['colunas ausentes: ' + falta.join(', ')] };
    const itens = [], erros = [];
    l.slice(1).forEach((r, n) => {
      const g = k => (ix[k] == null ? '' : String(r[ix[k]] || '').trim());
      let ctx = null; if (g('contexto_json')) { try { ctx = JSON.parse(g('contexto_json')); } catch (e) { ctx = null; } }
      const it = { chave: g('chave'), serial: normSerie(g('serie')), modelo: g('modelo'), banco: g('banco') === 'BT1' ? 'BT1' : 'BT2', tipo_nc: g('tipo') || 'OUTRO', descricao: g('descricao'), actor: g('nome'), contexto: ctx, criado: g('criado_em') || new Date().toISOString(), estado: 'pendente', erro: '' };
      if (!it.chave || !it.serial || !it.modelo || it.descricao.length < 5 || !it.actor) erros.push('linha ' + (n + 2) + ': faltam campos'); else itens.push(it);
    });
    return { itens, erros };
  }
  const pendentes = () => FILA.filter(i => i.estado === 'pendente');
  function atualizaPend() {
    const q = document.getElementById('pRncPend'), n = pendentes().length, r = FILA.filter(i => i.estado === 'recusada').length;
    if (q) { q.style.display = (n || r) ? '' : 'none'; q.textContent = 'RNC a enviar: ' + n + (r ? ' · recusadas: ' + r : ''); q.title = 'Registros de defeito que ainda NÃO estão no sistema. Toque para ver.'; }
    const el = document.getElementById('rncFila'); if (!el) return;
    el.innerHTML = FILA.length ? '<table style="width:100%;font-size:12px">' + FILA.map(i => '<tr><td style="font-family:monospace">' + esc(i.serial) + '</td><td>' + esc(i.estado === 'pendente' ? 'a enviar' : 'RECUSADA') + '</td><td>' + esc(i.erro || i.descricao.slice(0, 40)) + '</td></tr>').join('') + '</table>' : '<span class="jnota">Nenhum registro pendente.</span>';
  }
  function notifica(html) {
    let f = document.getElementById('rncToast'); if (!f) { f = document.createElement('div'); f.id = 'rncToast'; f.setAttribute('role', 'status'); f.style.cssText = 'position:fixed;left:50%;bottom:34px;transform:translateX(-50%);z-index:9999;max-width:92vw;background:#e3f4ea;color:#12301f;border:1px solid #2e9a5f;border-radius:10px;padding:8px 12px;font-size:13px'; document.body.appendChild(f); }
    f.innerHTML = html; f.style.display = ''; clearTimeout(f._t); f._t = setTimeout(() => { f.style.display = 'none'; }, 8000);
  }
  async function reenvia() {
    if (R.enviando || !pendentes().length) return { enviados: 0, recusados: 0 }; R.enviando = true; let ok = 0, rec = 0;
    try {
      for (const it of pendentes()) {
        try {
          const j = await api('/api/rnc/abrir', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serial: it.serial, modelo: it.modelo, banco: it.banco, tipo_nc: it.tipo_nc, descricao: it.descricao, actor: it.actor, contexto: it.contexto || undefined, idempotency_key: it.chave }) });
          FILA.splice(FILA.indexOf(it), 1); ok++; notifica('<b>Enviada:</b> ' + esc(j.rnc.rnc_id) + ' (série ' + esc(it.serial) + ') — agora o gerador está <b>BLOQUEADO</b> no sistema.');
        } catch (e) { if (semRede(e)) break; it.estado = 'recusada'; it.erro = e.message; rec++; }
      }
    } finally { R.enviando = false; atualizaPend(); }
    if (ok && R.on) consulta(serieAtual(), true, 'envio pendente'); return { enviados: ok, recusados: rec };
  }

  /* ---------------- área RNC (janela) ---------------- */
  function areaEstado() {
    const on = document.getElementById('rncAreaOn'), nota = document.getElementById('rncOnNota'); if (!on) return;
    on.hidden = !R.on;
    nota.textContent = R.on ? 'Ligado: o botão "⚠ Registrar defeito" e o aviso "RNC: BLOQUEADO" aparecem no cabeçalho. É só informativo: não bloqueia o ensaio.' : 'Desligado: o RNC continua sendo o cartão escrito. O medidor não mostra botão nem aviso e não chama o servidor do RNC.';
  }
  function montaArea() {
    if (document.getElementById('dlgRncArea')) return;
    const d = document.createElement('dialog'); d.id = 'dlgRncArea'; d.className = 'jan'; d.style.setProperty('--w', '560px'); d.setAttribute('aria-labelledby', 'dlgRncAreaT');
    d.innerHTML = '<div class="jt"><span id="dlgRncAreaT">RNC · Registro de defeitos</span><button type="button" class="jx" data-fecha aria-label="Fechar" title="Fechar">✕</button></div>' +
      '<div class="jb" style="font-size:14px"><label style="display:flex;gap:8px;align-items:center;font-weight:700"><input type="checkbox" id="rncOn"> Usar RNC (automação do registro de defeito)</label><p class="jnota" id="rncOnNota"></p>' +
      '<div id="rncAreaOn" hidden><div class="jbtns"><button type="button" class="bt" id="rncAbreReg" style="flex:2;background:var(--ui-acento);color:#fff;border:0;font-weight:700">⚠ Registrar defeito</button><a class="bt s" id="rncLinkRep" target="_blank" rel="noopener" style="flex:1;text-align:center;text-decoration:none">Abrir Reparo ↗</a></div>' +
      '<h4 style="margin:12px 0 4px">Pendentes de envio</h4><div id="rncFila"></div>' +
      '<div class="jbtns"><button type="button" class="bt s" id="rncEnviaAgora">Enviar agora</button><button type="button" class="bt s" id="rncBaixaTodos">Baixar .csv</button><label class="bt s" style="cursor:pointer;text-align:center">Enviar pendentes (.csv)<input type="file" id="rncImp" accept=".csv,text/csv" hidden></label></div><div id="rncAreaMsg" role="status" aria-live="polite" class="jnota"></div>' +
      '<h4 style="margin:12px 0 4px">RNCs recentes não encerradas</h4><div id="rncRecentes" class="jnota">…</div></div></div>';
    document.body.appendChild(d);
    d.addEventListener('click', e => { if (e.target.closest('[data-fecha]')) d.close(); }); d.addEventListener('keydown', e => { if (e.key === 'Escape') d.close(); });
    document.getElementById('rncOn').onchange = e => aplicaAtivo(e.target.checked);
    document.getElementById('rncAbreReg').onclick = () => { d.close(); abre(); };
    document.getElementById('rncEnviaAgora').onclick = async () => { const r = await reenvia(); areaMsg(r.enviados + ' enviada(s)' + (r.recusados ? ', ' + r.recusados + ' recusada(s)' : '') + (pendentes().length ? ' · ainda pendentes: ' + pendentes().length + ' (sem rede?)' : '') + '.'); carregaRecentes(); };
    document.getElementById('rncBaixaTodos').onclick = () => { if (!FILA.length) { areaMsg('Nada pendente para baixar.'); return; } areaMsg('Baixado: ' + baixaCsv(FILA, 'RNC_pendentes_' + selo() + '.csv')); };
    document.getElementById('rncImp').onchange = async e => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return;
      const { itens, erros } = itensDoCsv(await f.text()); let novos = 0;
      itens.forEach(it => { if (!FILA.some(x => x.chave === it.chave)) { FILA.push(it); novos++; } });
      areaMsg(novos + ' registro(s) lido(s) do arquivo' + (itens.length - novos ? ' (' + (itens.length - novos) + ' já estavam na fila)' : '') + (erros.length ? ' · ' + erros.length + ' linha(s) ignorada(s): ' + erros.slice(0, 2).join('; ') : '') + '.'); atualizaPend();
      if (novos) { const r = await reenvia(); areaMsg(document.getElementById('rncAreaMsg').textContent + ' Enviadas: ' + r.enviados + (r.recusados ? ', recusadas: ' + r.recusados : '') + (pendentes().length ? ', ainda pendentes: ' + pendentes().length : '') + '.'); carregaRecentes(); }
    };
  }
  const areaMsg = t => { const el = document.getElementById('rncAreaMsg'); if (el) el.textContent = t; };
  async function carregaRecentes() {
    const el = document.getElementById('rncRecentes'); if (!el || !R.on) return;
    try { const j = await api('/api/rnc?limit=10'); el.innerHTML = j.rncs.length ? '<table style="width:100%;font-size:12px">' + j.rncs.map(r => '<tr><td>' + esc(r.rnc_id) + '</td><td style="font-family:monospace">' + esc(r.serial) + '</td><td>' + esc(r.estado.replace(/_/g, ' ').toLowerCase()) + '</td></tr>').join('') + '</table>' : 'Nenhuma RNC pendente no sistema.'; }
    catch (e) { el.textContent = 'Sem conexão com o servidor do RNC (' + e.message + ').'; }
  }
  function abreArea() {
    montaArea(); const d = document.getElementById('dlgRncArea');
    const ct = seguro(() => (window.CATALOGO_FERRAMENTAS.itens.find(i => i.id === 'rnc_reparo') || {}).arquivo, '') || '';
    const l = document.getElementById('rncLinkRep'); const srv = seguro(() => srvBase(), ''); l.href = ct ? ct + (srv ? '?srv=' + encodeURIComponent(srv) : '') : '#'; l.title = ct ? 'Abre a tela RNC · Reparo (quem conserta)' : 'Tela de reparo não encontrada no catálogo: abra rnc_reparo pelo menu ☰';
    document.getElementById('rncOn').checked = R.on; areaEstado(); atualizaPend(); if (!d.open) d.showModal(); carregaRecentes();
  }
  monta(); setInterval(vigia, 2000); setInterval(() => { if (R.on && pendentes().length) reenvia(); }, 30000); window.addEventListener('online', () => { if (R.on && pendentes().length) reenvia(); });
  window.RNC_DEFEITO = { abre, abreArea, captura, consulta: s => consulta(normSerie(s), true, 'consulta'), pausa: v => { R.pausa = !!v; }, ativo: () => R.on, ativa: v => aplicaAtivo(v), fila: () => FILA.map(i => Object.assign({}, i)), reenvia, csvTexto, itensDoCsv };
})();
