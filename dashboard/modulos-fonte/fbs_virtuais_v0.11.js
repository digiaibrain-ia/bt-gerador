/* =====================================================================================
   fbs_virtuais_v0.11.js — FB MÃE + FBs FILHOS VIRTUAIS (JavaScript) — v0.11  (medidor v1.10.124)
   v0.11: o filho 7 (Tempos) sinaliza assim que o ensaio inicia, mesmo com a mãe desarmada (antes ficava "sem sinal" no mapa).
   v0.10: CORRIGE o conceito da v0.9. Salvar a etapa é automático no modo "Por patamar"; o que o patamar escolhe (Manual/Auto) é como as CHAVES ENTRAM.
         Patamar MANUAL: a mãe sugere (tracejado) e fica em AGUARDA_APLICAR até o operador clicar Aplicar (host.aplicouEt); depois escalona/confirma como antes.
         Patamar AUTO: a mãe aplica sozinha. host: aplicaManual(i), aplicouEt(i), aplicarInfo().
   v0.9: SALVAMENTO POR PATAMAR. O host informa, por etapa, se o salvamento é Manual (M) ou Automático (A) e se o APLICAR do operador está liberado
         (host.salvamento(i), host.aplicarInfo()). A mãe NÃO decide nada com isso (continua sem salvar/avançar etapa): só mostra no filho 9
         ("salvamento do patamar", "aplicar liberado"), na mensagem e na foto (foto.aplicar) para o mapa e para a faixa Gerador→Carga.
   v0.8: a assinatura de parâmetros (chP) inclui os parâmetros do escalonador (escSig): mudou sub-degrau/janela/pausa DURANTE a etapa → recalcula e reaplica. O filho 10 mostra os sub-degraus (subTxt).
   v0.7: a fonte 'virtual' passa a se chamar SIDSE (Simulador Ideal DSE: valores teóricos, nunca gera falha de DSE).
   v0.6: antes de INICIAR a mãe fica em AGUARDA_INICIO (não mais FALHA) mesmo sem kW a 100 % ainda; o aviso vira "escolha o gerador em Dados do ensaio".
   v0.5: PRÉVIA DA PRÓXIMA ETAPA. Com o salvamento MANUAL, quando a etapa é cumprida e o sistema espera o SALVAR, a mãe já mostra (tracejado)
         as chaves que vão entrar na próxima etapa. Ao SALVAR, a mãe ACEITA essas mesmas chaves e as aplica (sem recalcular).
   v0.4: se kW a 100 % / limite % / degrau mudarem DURANTE a etapa, a mãe recalcula e reaplica (antes ficava com as chaves da conta antiga).
         No patamar, se as chaves ficarem diferentes do sugerido (ajuste manual?), a mãe AVISA, sem reaplicar.
   v0.3: mensagem correta quando NENHUMA combinação cabe (menor chave maior que o alvo) — antes dizia só "sem chaves habilitadas".
   v0.2: cada filho publica ENTRADAS e SAÍDAS com valores ao vivo (f.ent / f.sai) para o mapa "explodido"; host.extra() opcional.
   -------------------------------------------------------------------------------------
   O QUE É (leigo): um "ensaio de ensaio". O programa faz, em JavaScript, o mesmo que o FB mãe e os
   11 filhos vão fazer no PLC (arquitetura aprovada em PROPOSTA_ARQUITETURA_FB_MAE_FILHOS_v0.1.md),
   para podermos ver a lógica funcionando — no mapa dos FBs e no gráfico — ANTES de escrever SCL.
   POR QUÊ (técnico): validar o roteiro/estados/interfaces com o gerador virtual ideal (Demo) e só
   então portar para SCL. Nenhum endereço, DB ou rota é criado aqui; os "filhos" apenas descrevem
   entradas/saídas por rótulo. A numeração real dos blocos segue PLANO_NUMERACAO_BLOCOS_PLC.md.
   REGRAS QUE ELE RESPEITA:
     - só a mãe dispara; chaves só são comandadas pelo caminho que o operador já usa (host.aplica);
     - guarda de capacidade (filho 11) é a última barreira antes do comando (filho 6);
     - DSE caiu -> chaves caem (decisão do usuário, 27/10) — filho 8;
     - nunca avança etapa sozinho: SALVAR a etapa continua sendo ato do operador.
   COMO USAR: const mae = FBV.criaMae(host); chamar mae.ciclo() 1x/s; mae.arma()/mae.desarma().
   HOST (o que o medidor fornece; tudo por função, sem acesso direto ao DOM aqui):
     agora(), iniciado(), fimEnsaio(), etapa(), nEtapas(), alvoPct(i), kw100(), modelo(), fonte(),
     dseOk(), sugere()->{total,aviso}, guarda()->{ok,mensagem,total,limiteKw}, aplica(), duracaoPlanoS(),
     aguardaSalvar() -> true quando a etapa foi cumprida e espera o SALVAR do operador; sugerePrevia(idxEtapa) -> {total} (mostra sem aplicar);
     limpaPrevia() (volta ao tracejado da etapa atual); derruba(motivo), kwComandado(), kwConfirmado(), marco(txt), tempoEtapaS(),
     aplicaManual(i) opcional -> true se as chaves da etapa i só entram quando o operador clicar Aplicar; aplicouEt(i) -> true depois do Aplicar;
     aplicarInfo() opcional -> {et,modo:'M'|'A',liberado(=aguardando o operador aplicar),motivo,cargaPct,alvoPct}
     extra() opcional -> {pctLim, degrauKw, pausaS, nHabil, menorChaveKw, kwMed, vMed, hzMed, tolDseS, acion{56,400}, kva, V, Hz}
   ===================================================================================== */
(function (raiz) {
  'use strict';
  const CANAL = 'fbv', LS = 'medidor.fbv.v1';
  const NOMES = { 1: 'Modelo / catálogo', 2: 'Origem dos dados', 3: 'Alvos do roteiro', 4: 'Motor de sugestão', 5: 'Rodízio / desgaste',
    6: 'Comando / retorno chaves', 7: 'Tempos', 8: 'Supervisor de falhas', 9: 'Orquestrador (FB mãe)', 10: 'Escalonador de entrada', 11: 'Guarda de capacidade' };
  const TOL_CONF_KW = 0.5;        // ASSUMIDO: tolerância entre kW comandado e kW confirmado fisicamente
  const FOLGA_CONF_S = 20;        // ASSUMIDO: tempo extra além do plano para o retorno físico confirmar

  function criaMae(h) {
    let previa = null, chaveParam = '', tEstado = 0, armada = false, estado = 'PARADO', msg = '', etAplic = -1, tIni = 0, tConf = 0, planoS = 0, selKw = 0, alvoKw = 0, guarda = null, log = [];
    let canal = null; try { canal = new BroadcastChannel(CANAL); } catch (e) { /* sem canal: só localStorage */ }
    const F = {}; for (const k in NOMES) F[k] = { id: +k, nome: NOMES[k], estado: 'idle', txt: '', ent: {}, sai: {} };   // foto dos filhos (para o mapa)
    const set = (id, est, txt) => { F[id].estado = est; F[id].txt = txt || ''; };
    const reg = t => { log.unshift({ t: new Date(h.agora()).toLocaleTimeString('pt-BR'), m: t }); log.length = Math.min(log.length, 30); };
    function vai(novo, m) { if (novo !== estado) { estado = novo; tEstado = h.agora(); reg(novo + (m ? ' — ' + m : '')); if (h.marco) h.marco('FBs: ' + novo + (m ? ' · ' + m : '')); } msg = m || ''; }

    /** Foto publicada (mapa_fbs lê). Tudo o que aparece no mapa vem daqui. */
    /** v0.9: situação do APLICAR do operador (só leitura; vem do host). */
    function ap() { try { return h.aplicarInfo ? h.aplicarInfo() : null; } catch (e) { return null; } }
    function foto() {
      return { v: 1, ts: h.agora(), armada, estado, msg, fonte: h.fonte(), etapa: { idx: h.etapa(), alvoPct: h.iniciado() ? h.alvoPct(h.etapa()) : null, alvoKw },
        kw: { alvo: alvoKw, sel: selKw, cmd: h.kwComandado(), conf: h.kwConfirmado(), cap100: h.kw100() }, aplicar: ap(), filhos: F, log };
    }
    /** Preenche ENTRADAS/SAÍDAS ao vivo de cada filho (mapa explodido). Só leitura: não decide nada. */
    function io() {
      const ex = (h.extra && h.extra()) || {}, kw100 = +h.kw100(), ini = h.iniciado(), et = h.etapa(), pct = ini ? h.alvoPct(et) : null, m = h.modelo(), g = guarda || {};
      const n1 = (x, d) => (x == null || isNaN(x)) ? '—' : (+x).toFixed(d == null ? 1 : d), on = x => x ? 'sim' : 'não';
      F[1].ent = { 'modelo escolhido': m && m.arquivo ? m.arquivo : '—' }; F[1].sai = { 'kW a 100 %': n1(kw100), 'kVA': ex.kva || '—', 'V / Hz nominais': (ex.V || '—') + ' V / ' + (ex.Hz || '—') + ' Hz' };
      F[2].ent = { 'fonte': h.fonte() === 'virtual' ? 'SIDSE (Simulador Ideal DSE — valores teóricos)' : 'DSE real', 'DSE responde': on(h.dseOk()) };
      F[2].sai = { 'kW medido': n1(ex.kwMed), 'V medido': n1(ex.vMed), 'Hz medido': n1(ex.hzMed), 'qualidade': h.dseOk() ? 'boa' : 'ruim' };
      F[3].ent = { '% do patamar': pct == null ? '—' : pct + ' %', 'kW a 100 %': n1(kw100) }; F[3].sai = { 'kW alvo': n1(alvoKw), 'modo': pct > 100 ? 'mínimo (107 %)' : 'abaixo do alvo' };
      F[4].ent = { 'kW alvo': n1(alvoKw), 'chaves habilitadas': ex.nHabil == null ? '—' : ex.nHabil, 'limite (guarda)': g.limiteKw == null ? '—' : n1(g.limiteKw) };
      F[4].sai = { 'kW sugerido': n1(selKw), 'erro previsto': n1(selKw - alvoKw) + ' kW' };
      F[5].ent = { 'critério': 'acionamentos + horas' }; F[5].sai = { 'acionamentos BC56': ex.acion ? ex.acion['56'] : '—', 'acionamentos BC400': ex.acion ? ex.acion['400'] : '—' };
      F[6].ent = { 'passos do escalonador': planoS > 0 ? 'plano de ' + planoS + ' s' : 'tudo de uma vez', 'kW sugerido': n1(selKw) };
      F[6].sai = { 'kW comandado': n1(h.kwComandado()), 'kW confirmado': n1(h.kwConfirmado()), 'divergência': n1(h.kwComandado() - h.kwConfirmado()) + ' kW' };
      F[7].ent = { 'estado da mãe': estado }; F[7].sai = { 'tempo da etapa': Math.round(h.tempoEtapaS()) + ' s', 'tempo neste estado': tEstado ? Math.round((h.agora() - tEstado) / 1000) + ' s' : '—' };
      F[8].ent = { 'DSE responde': on(h.dseOk()), 'tolerância': (ex.tolDseS == null ? '—' : ex.tolDseS) + ' s' }; F[8].sai = { 'parada segura': on(estado === 'FALHA' && !h.dseOk()) };
      F[10].ent = { 'seleção liberada': n1(selKw) + ' kW', 'degrau máx.': n1(ex.degrauKw), 'pausa': (ex.pausaS == null ? '—' : ex.pausaS) + ' s', 'sub-degraus': ex.subTxt == null ? '—' : ex.subTxt }; F[10].sai = { 'duração do plano': planoS + ' s' };
      F[11].ent = { 'seleção': n1(selKw) + ' kW', 'kW a 100 %': n1(kw100), '% de segurança': ex.pctLim == null ? '—' : ex.pctLim + ' %' };
      F[11].sai = { 'limite': g.limiteKw == null ? '—' : n1(g.limiteKw) + ' kW', 'liberada': guarda ? on(g.ok) : '—', 'mensagem': g.ok === false ? g.mensagem : '—' };
      const a9 = ap(); F[9].ent = { 'armada': on(armada), 'ensaio iniciado': on(ini), 'etapa': ini ? (et + 1) + ' (' + pct + ' %)' : '—', 'aplicação do patamar': a9 ? (a9.modo === 'M' ? 'Manual' : 'Auto') : '—' };
      F[9].sai = { 'estado': estado, 'mensagem': msg || '—', 'aguardando aplicar': a9 && a9.modo === 'M' ? on(a9.liberado) : '—' };
    }
    function publica() { io(); const f = foto(); try { localStorage.setItem(LS, JSON.stringify(f)); } catch (e) {} if (canal) try { canal.postMessage(f); } catch (e) {} }

    function arma() { armada = true; etAplic = -1; previa = null; vai(h.iniciado() ? 'AGUARDA_ETAPA' : 'AGUARDA_INICIO', h.iniciado() ? '' : 'clique INICIAR (o operador inicia o ensaio)'); publica(); }
    function desarma(m) { armada = false; etAplic = -1; previa = null; vai('PARADO', m || ''); for (const k in F) set(k, 'idle'); publica(); }

    /** Um ciclo (chamar 1x/s). Ordem fixa, como num OB cíclico: 2 -> 8 -> 1 -> 3 -> 7 -> mãe. */
    function ciclo() {
      const kw100 = +h.kw100(), m = h.modelo();
      set(2, 'ok', 'fonte: ' + (h.fonte() === 'virtual' ? 'SIDSE (Simulador Ideal DSE — valores teóricos)' : 'DSE real'));
      set(1, kw100 > 0 ? 'ok' : 'falha', kw100 > 0 ? (m && m.arquivo ? m.arquivo + ' · ' : '') + kw100 + ' kW a 100 %' : 'sem kW a 100 % (Dados do ensaio)');
      set(5, 'ok', 'rodízio ativo (desempate por desgaste)');
      // v0.11: Tempos (filho 7) acompanha o ENSAIO, não a mãe — sinaliza mesmo com a mãe desarmada (antes ficava "sem sinal")
      if (h.iniciado()) set(7, 'ativo', 'etapa há ' + Math.round(h.tempoEtapaS()) + ' s'); else set(7, 'idle', 'ensaio não iniciado');
      if (!armada) { set(9, 'idle', 'desarmada'); return publica(); }
      // ---- filho 8: supervisor (DSE caiu -> chaves caem) ----
      if (!h.dseOk()) { set(8, 'falha', 'DSE sem resposta'); h.derruba('FBs virtuais: DSE sem resposta — chaves abertas por segurança.'); armada = false; vai('FALHA', 'DSE sem resposta; chaves abertas'); set(9, 'falha', 'parada segura'); return publica(); }
      set(8, 'ok', 'fontes confiáveis');
      if (!h.iniciado()) { vai('AGUARDA_INICIO', kw100 > 0 ? 'clique INICIAR' : 'escolha o gerador em Dados do ensaio, depois INICIAR'); set(9, 'ativo', estado); set(7, 'idle', 'ensaio não iniciado'); return publica(); }
      if (!(kw100 > 0)) { vai('FALHA', 'informe kW a 100 % em Dados do ensaio'); set(9, 'falha', msg); return publica(); }
      if (h.fimEnsaio()) { vai('FIM', 'ensaio concluído'); armada = false; set(9, 'ok', 'fim'); return publica(); }
      const et = h.etapa(), pct = h.alvoPct(et); alvoKw = kw100 * pct / 100;
      set(3, 'ok', 'etapa ' + (et + 1) + ' · ' + pct + ' % → ' + alvoKw.toFixed(1) + ' kW');
      set(7, 'ativo', 'etapa há ' + Math.round(h.tempoEtapaS()) + ' s');
      // ---- etapa nova: a mãe chama 4 -> 11 -> 10 -> 6 ----
      const exP = (h.extra && h.extra()) || {}, chP = kw100 + '|' + exP.pctLim + '|' + exP.degrauKw + '|' + exP.escSig;
      if (etAplic >= 0 && et === etAplic && chP !== chaveParam) { reg('parâmetros mudaram (kW a 100 %/limite/degrau): recalculando a etapa'); etAplic = -1; }   // v0.4
      chaveParam = chP;
      if (et !== etAplic) {   // v0.3: etapa nova SEMPRE tenta de novo (uma falha numa etapa não trava as seguintes)
        etAplic = et; tIni = h.agora();
        const previaVal = previa; previa = null;   // (a prévia só vale para a etapa seguinte à que a gerou)
        if (pct === 0) { h.derruba('FBs virtuais: etapa sem carga — chaves abertas.'); selKw = 0; vai('SEM_CARGA', 'chaves abertas'); set(6, 'ativo', 'abrindo todas'); }
        else {
          vai('SUGERINDO', 'etapa ' + (et + 1));
          const usaPrev = previaVal && previaVal.et === et && previaVal.ch === chP && previaVal.sel > 0;   // v0.5: o operador já viu estas chaves e SALVOU = aceitou
          let s;
          if (usaPrev) { s = { total: previaVal.sel }; reg('prévia aceita pelo SALVAR: ' + previaVal.sel.toFixed(1) + ' kW'); } else s = h.sugere();
          selKw = s.total || 0;
          set(4, selKw > 0 ? 'ok' : 'falha', selKw > 0 ? (usaPrev ? 'prévia aceita: ' : 'sugeriu ') + selKw.toFixed(1) + ' kW' : 'sem sugestão');
          guarda = h.guarda(); set(11, guarda.ok ? 'ok' : 'falha', guarda.ok ? 'liberada · limite ' + (guarda.limiteKw == null ? '—' : (+guarda.limiteKw).toFixed(1)) + ' kW' : guarda.mensagem);
          if (selKw <= 0) {
            const ex = (h.extra && h.extra()) || {}, semHab = !(ex.nHabil > 0);
            const m2 = semHab ? 'sem chaves habilitadas para a etapa' : 'nenhuma combinação cabe abaixo do alvo (menor chave habilitada: ' + (+ex.menorChaveKw).toFixed(1) + ' kW)';
            set(4, 'falha', m2); vai('FALHA', m2); set(9, 'falha', msg); return publica();
          }
          if (!guarda.ok) { vai('FALHA', 'guarda bloqueou: ' + guarda.mensagem); set(9, 'falha', msg); return publica(); }
          if (h.aplicaManual && h.aplicaManual(et)) {   // v0.10: patamar MANUAL — a sugestão fica no tracejado e o OPERADOR decide quando aplicar
            set(10, 'idle', 'aguarda o operador'); set(6, 'idle', 'aguarda o operador');
            vai('AGUARDA_APLICAR', 'sugestão ' + selKw.toFixed(1) + ' kW no tracejado: ajuste se quiser e clique em Aplicar');
          } else {
            h.aplica(); planoS = h.duracaoPlanoS(); set(10, 'ativo', planoS > 0 ? 'plano de ' + planoS + ' s' : 'tudo de uma vez'); set(6, 'ativo', 'comandando');
            vai('ESCALONANDO', 'plano de ' + planoS + ' s');
          }
        }
      }
      // v0.10: o operador clicou Aplicar → a seleção FINAL (com os ajustes dele) é a que vale
      if (estado === 'AGUARDA_APLICAR' && h.aplicouEt && h.aplicouEt(et)) {
        const g2 = h.guarda(); selKw = (g2 && g2.total) || selKw; planoS = h.duracaoPlanoS(); tIni = h.agora();
        set(10, 'ativo', planoS > 0 ? 'plano de ' + planoS + ' s' : 'tudo de uma vez'); set(6, 'ativo', 'comandando'); vai('ESCALONANDO', 'operador aplicou: ' + selKw.toFixed(1) + ' kW · plano de ' + planoS + ' s');
      }
      // ---- acompanhamento ----
      const dt = (h.agora() - tIni) / 1000;
      if (estado === 'ESCALONANDO' && dt >= planoS) { vai('CONFIRMANDO', 'aguardando retorno físico'); tConf = h.agora(); set(10, 'ok', 'plano concluído'); }
      if (estado === 'CONFIRMANDO') {
        const d = Math.abs(h.kwConfirmado() - selKw); set(6, d <= TOL_CONF_KW ? 'ok' : 'ativo', 'cmd ' + h.kwComandado().toFixed(1) + ' · conf ' + h.kwConfirmado().toFixed(1) + ' kW');
        if (d <= TOL_CONF_KW) vai('NO_PATAMAR', 'confirmado ' + h.kwConfirmado().toFixed(1) + ' kW');
        else if ((h.agora() - tConf) / 1000 > FOLGA_CONF_S) { vai('FALHA', 'retorno físico não confirmou (cmd × conf divergem)'); set(6, 'falha', msg); }
      }
      // ---- v0.5: PRÉVIA da próxima etapa (salvamento manual: etapa cumprida, esperando o SALVAR) ----
      const esperaSalvar = !!(h.aguardaSalvar && h.aguardaSalvar()) && et + 1 < h.nEtapas();
      if (esperaSalvar && (estado === 'NO_PATAMAR' || estado === 'SEM_CARGA' || estado === 'PREVIA')) {
        const nx = et + 1, pn = h.alvoPct(nx);
        if (!previa || previa.et !== nx || previa.ch !== chP) {
          if (pn === 0) { previa = { et: nx, sel: 0, ch: chP }; if (h.limpaTracejado) h.limpaTracejado(); vai('PREVIA', 'próxima etapa ' + (nx + 1) + ' (' + pn + ' %): SALVAR abre todas as chaves'); }
          else {
            const sp = h.sugerePrevia(nx), gp = h.guarda(); previa = { et: nx, sel: sp.total || 0, ch: chP };
            set(4, previa.sel > 0 ? 'ativo' : 'falha', 'prévia etapa ' + (nx + 1) + ': ' + previa.sel.toFixed(1) + ' kW'); set(11, gp.ok ? 'ok' : 'falha', gp.ok ? 'prévia liberada' : gp.mensagem);
            vai('PREVIA', 'próxima etapa ' + (nx + 1) + ' (' + pn + ' %) → ' + previa.sel.toFixed(1) + ' kW · SALVAR aplica');
          }
        }
      } else if (estado === 'PREVIA' && et + 1 < h.nEtapas() && !esperaSalvar && etAplic === et) {   // operador voltou (ex.: re-salvar): volta ao tracejado da etapa atual
        previa = null; if (h.limpaPrevia) h.limpaPrevia(); vai(selKw > 0 ? 'NO_PATAMAR' : 'SEM_CARGA', 'prévia cancelada');
      }
      if (estado === 'NO_PATAMAR') {   // v0.4: vigia divergência (só avisa; o operador pode ter ajustado à mão de propósito)
        const dv = Math.abs(h.kwComandado() - selKw);
        if (dv > TOL_CONF_KW) { msg = 'chaves ≠ sugerido (' + h.kwComandado().toFixed(1) + ' × ' + selKw.toFixed(1) + ' kW): ajuste manual?'; set(6, 'falha', msg); }
        else if (/^chaves ≠/.test(msg)) msg = 'confirmado ' + h.kwConfirmado().toFixed(1) + ' kW';
      }
      set(9, estado === 'FALHA' ? 'falha' : (estado === 'NO_PATAMAR' || estado === 'SEM_CARGA' ? 'ok' : 'ativo'), estado + (msg ? ' — ' + msg : ''));
      publica();
    }
    return { arma, desarma, ciclo, foto, get armada() { return armada; }, get estado() { return estado; } };
  }
  raiz.FBV = { criaMae, NOMES, CANAL, LS };
})(typeof window !== 'undefined' ? window : globalThis);
