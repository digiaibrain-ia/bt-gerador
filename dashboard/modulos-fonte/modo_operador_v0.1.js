/* =====================================================================================================================
   modo_operador_v0.1.js — VISÃO SIMPLES DO OPERADOR + liga a API dos cards · 29/10/2026
   Colado (inline) no medidor 1.10.112, num <script> próprio DEPOIS do script principal (usa as variáveis dele: T, MODO, salvarManual, ETAPAS, SNAP...).

   PARA QUE SERVE (leigo): uma tela "só com o essencial" para o operador: ele aperta INICIAR e o ensaio anda sozinho pelas etapas (0, 30, 50, 100, 107, 0 %),
   grava cada etapa e finaliza sozinho. Funciona igual com o PLC conectado ou no Demo. Quem comanda a carga continua sendo outra pessoa/painel;
   o operador só acompanha, pode ZERAR o degrau atual (volta o degrau) ou PARAR O ENSAIO.

   POR QUÊ (técnico): NÃO cria lógica de ensaio nova. Reaproveita o que o medidor já tem e foi validado:
     • tipo "Guiado" (MODO='iso')  • salvamento AUTOMÁTICO (salvarManual=false: a etapa é gravada e avança sozinha ao cumprir o tempo,
       e o ensaio finaliza sozinho quando todas as etapas estão gravadas e conferidas no PLC — medidor v1.10.103)
     • ZERAR = zera só o degrau ativo • PARAR ENSAIO = zera tudo.
   Esta visão só (1) prepara esses dois ajustes, com as MESMAS travas do popup ⚙ Modo (gerador ligado ou ensaio em andamento = não troca) e
   (2) esconde o que o operador não usa: Banco de Cargas/Patamar guiado, PAUSAR, SALVAR e FINALIZAR (finaliza sozinho).
   Se uma etapa falhar ao gravar no PLC o ensaio NÃO finaliza sozinho (regra do v1.10.103): o botão "Abrir/reenviar" da tabela de registro continua visível.
   Ligar: popup ⚙ Modo › "Visão do operador", ou ?op=1 no endereço (?op=0 desliga). Guarda a escolha em localStorage 'medidor.opsimples' (com try/catch).
   NÃO FAZ: não escreve nada novo no PLC, não muda rota, não toca no Demo/Node-RED. Sair da visão restaura o salvamento que o operador tinha antes.
   ===================================================================================================================== */
(function () {
  'use strict';
  const CH = 'medidor.opsimples', CH_ANT = 'medidor.opsimples.manualAnt';
  const OPS = { ativo: false };
  const ler = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const grava = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} };

  function visual() {
    document.body.classList.toggle('opsimples', OPS.ativo);
    const p = $('pOp'); if (p) p.style.display = OPS.ativo ? '' : 'none';
  }
  function marca() {   // atualiza os botões do popup (e os trava com as mesmas regras dos outros modos)
    const w = $('mdOp'); if (!w) return;
    const trava = genLigado() || (T.started && !T.fim);
    [...w.children].forEach(b => { b.classList.toggle('on', (b.dataset.v === '1') === OPS.ativo); b.disabled = trava; });
    $('mdOpNota').textContent = OPS.ativo
      ? 'Simples: só INICIAR. As etapas avançam e gravam sozinhas e o ensaio finaliza sozinho. Aparecem ZERAR (zera só o degrau atual) e PARAR ENSAIO (zera tudo).'
      : 'Completa: todos os botões (Banco de Cargas, Patamar guiado, PAUSAR, SALVAR, FINALIZAR).';
    if (genLigado()) $('mdOpNota').textContent += ' · ' + MSG_GEN_LIGADO;
    else if (T.started && !T.fim) $('mdOpNota').textContent += ' · Para trocar a visão, finalize ou use PARAR ENSAIO.';
  }
  /** Liga/desliga. Devolve true se mudou. Mesmas travas do ⚙ Modo: gerador ligado ou ensaio em andamento. */
  function troca(on) {
    on = !!on; if (on === OPS.ativo) return true;
    if (genLigado()) { msgGer(MSG_GEN_LIGADO); return false; }
    if (T.started && !T.fim) { msgGer('Pare o ensaio (PARAR ENSAIO) antes de trocar a visão.'); return false; }
    if (on) {
      if (MODO !== 'iso') { const b = $('mdTipo').querySelector('[data-m="iso"]'); if (b && !b.disabled) b.click(); }   // usa o próprio botão do popup: aplica parâmetros e guarda
      if (salvarManual) { grava(CH_ANT, '1'); window.__setSalvarManual(false); }
      if (MODO !== 'iso' || salvarManual) { msgGer('Não consegui preparar a visão simples (tipo Guiado + salvamento automático). Nada foi alterado.'); if (ler(CH_ANT) === '1' && !salvarManual) window.__setSalvarManual(true); grava(CH_ANT, null); return false; }
    } else {
      if (ler(CH_ANT) === '1') window.__setSalvarManual(true);   // devolve o salvamento manual que o operador tinha
      grava(CH_ANT, null);
    }
    OPS.ativo = on; grava(CH, on ? '1' : '0'); visual(); marca();
    try { window.__marcaModo && window.__marcaModo(); } catch (e) {}
    return true;
  }
  $('mdOp').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; troca(b.dataset.v === '1'); });
  $('bModo').addEventListener('click', marca);
  const m0 = window.__marcaModo; window.__marcaModo = () => { try { m0 && m0(); } catch (e) {} marca(); };   // o medidor chama isto a cada ciclo
  window.OPERADOR_SIMPLES = { ativo: () => OPS.ativo, troca };

  // estado inicial: ?op=1/0 manda; senão, o que ficou guardado — mas só vale se o medidor continua em Guiado + salvamento automático
  const q = new URLSearchParams(location.search).get('op'), guardado = ler(CH) === '1';
  if (q === '1' || (q == null && guardado)) {
    if (MODO === 'iso' && !salvarManual) { OPS.ativo = true; visual(); } else if (q === '1') troca(true); else grava(CH, '0');
  } else if (q === '0') { grava(CH, '0'); }
  visual(); marca();

  /* ---------------- API dos cards (api_cards_v0.1.js): o que o medidor publica além dos cards lidos da tela ---------------- */
  if (window.BT2_API) BT2_API.inicia(() => ({
    ensaio: { iniciado: !!T.started, rodando: !!T.run, fim: !!T.fim, parcial: !!T.parcial, aguardaFim: !!T.aguardaFim, etapa: T.et, decorrido: Math.round(T.el * 10) / 10, jaEstavel: !!T.jaEstavel,
      simulado: !!T.simulado, tipo: MODO, salvarManual: !!salvarManual, tolerancia: TOL, demo: !!$('demo').checked, versao: VERSAO },
    etapas: ETAPAS.map((e, i) => ({ i, alvo: e.alvo, min: e.min, nome: e.nome, salva: !!SNAP[i], estado: (i < T.et || (T.fim && i === T.et)) ? 'concluida' : (i === T.et && T.started) ? 'atual' : 'pendente' })),
    gerador: { estado: GEN.estado, leituraValida: !!dadoOk, cargaPct: carga },
    nominal: { tensao: (isFinite(DADOS.tensao) && DADOS.tensao > 0) ? DADOS.tensao : null, freq: (isFinite(DADOS.freq) && DADOS.freq > 0) ? DADOS.freq : null },
    operador: { simples: OPS.ativo }
  }));
})();
