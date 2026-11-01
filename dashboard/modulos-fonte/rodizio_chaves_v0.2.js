/* =============================================================================
   rodizio_chaves_v0.2.js — Sugestão de chaves, rodízio de desgaste e entrada escalonada.  v0.2 · 29/10/2026
   v0.2: planoEntrada ganha ligaAntes + janelaDesligaS (LIGA primeiro, DESLIGA depois de uma janela: a carga não cai no meio da subida) e nasce picoPlano()
         (maior carga que o plano atinge passo a passo, para a guarda conferir a sobreposição). Padrão continua igual ao v0.1 (ligaAntes:false).
   (v0.1 · 27/10/2026)
   -----------------------------------------------------------------------------
   PARA QUE SERVE (equipe não técnica)
     Dado o alvo de carga em kW, sugere QUAIS chaves do banco ligar, de modo que:
       1) o erro em relação ao alvo seja o MENOR possível;
       2) as chaves de mesmo kW sejam usadas em RODÍZIO (as menos usadas primeiro) — de forma "macia":
          o rodízio só desempata, nunca aumenta o erro;
       3) mexa o MÍNIMO possível nas chaves que já estão ligadas (menos tempo).
     Também (a) avalia uma seleção feita à mão pelo operador e (b) monta o PLANO DE ENTRADA: se o gerador precisa
     de tempo entre um grupo de chaves e outro (ex.: gerador mecânico com regulador GOV que dispara no degrau a seco),
     a carga entra em degraus com pausa entre eles. O tempo é parâmetro: 0 = tudo de uma vez.
   O QUE ESTE ARQUIVO NÃO FAZ
     Não fala com PLC/Node-RED, não liga chave, não decide aprovação do ensaio. Só calcula (funções puras):
     é o protótipo que depois vira FB(s) no PLC (ver PROPOSTA_ARQUITETURA_FB_MAE_FILHOS_v0.1.md, filhos 4, 5, 10 e 11).
   DE ONDE VÊM OS DADOS
     kW de cada chave = tabela física confirmada pelo usuário em 27/10/2026 (TABELA_FISICA abaixo).
     Todo o resto (folgas, pesos, tempos) é PARÂMETRO: o valor padrão é marcado "ASSUMIDO — a confirmar".
   ============================================================================= */
(function (raiz) {
  'use strict';

  /** kW de cada chave, na ORDEM FÍSICA (= ordem das "chavinhas" e do PLC). Fonte: tabela enviada pelo usuário (27/10/2026).
   *  Por quê aqui: um único lugar; se a engenharia corrigir, só muda esta tabela. BC56 e BC400 são sistemas distintos. */
  const TABELA_FISICA = {
    BC400: [5, 5, 10, 10, 10, 10, 50, 50, 50, 50, 50, 50, 50],   // soma 400
    BC56:  [5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 3]               // soma 56
  };

  /** Parâmetros padrão. Tudo que é número aqui é AJUSTÁVEL pela engenharia/operadores. */
  const PADRAO = {
    modoAlvo: 'abaixo',      // 'abaixo' = nunca passar do alvo (regra do usuário) · 'minimo' = tem de atingir o alvo (ex.: 107 %)
    excessoMaxKw: 0,         // só no modo 'minimo': quanto acima do alvo é aceito. ASSUMIDO — a confirmar (±2 % de 107 % vem da conversa de 27/10)
    folgaErroKw: 0,          // diferença de erro (kW) em que o rodízio ainda pode decidir. 0 = só desempata. ASSUMIDO — a confirmar
    rodizio: { criterio: 'ambos', pesoAcion: 1, pesoHoras: 1 }, // 'acion' | 'horas' | 'ambos' (os DOIS existem, como pedido)
    pesoMudanca: 0.01,       // custo de cada chave que muda de estado (menos tempo/menos manobra). ASSUMIDO — a confirmar
    escalonamento: { degrauMaxKw: null, pausaS: 0, desligaImediato: true, ligaAntes: false, janelaDesligaS: 0 } // null = tudo de uma vez (tempo desconhecido; aprender com operadores). v0.2: ligaAntes=true → liga primeiro e desliga depois de janelaDesligaS segundos
  };

  const mescla = (a, b) => Object.assign({}, a, b || {});
  const soma = (kws, sel) => kws.reduce((t, k, i) => t + (sel[i] ? k : 0), 0);
  const arred = x => Math.round(x * 1000) / 1000;

  /** Custo de desgaste de uma chave (0..~2): quanto MAIS usada, MAIOR o custo.
   *  Por quê normalizar: acionamentos e horas têm escalas diferentes; dividimos pelo maior valor do banco. */
  function custosDesgaste(estado, n, cfg) {
    const ac = estado && estado.acion || [], hr = estado && estado.horas || [];
    const maxA = Math.max(1, ...Array.from({ length: n }, (_, i) => ac[i] || 0));
    const maxH = Math.max(1, ...Array.from({ length: n }, (_, i) => hr[i] || 0));
    const c = [];
    for (let i = 0; i < n; i++) {
      const a = (ac[i] || 0) / maxA, h = (hr[i] || 0) / maxH;
      c.push(cfg.criterio === 'acion' ? a * cfg.pesoAcion : cfg.criterio === 'horas' ? h * cfg.pesoHoras : a * cfg.pesoAcion + h * cfg.pesoHoras);
    }
    return c;
  }

  /** Para UM banco: lista, para cada soma de kW possível, a MELHOR seleção (menor desgaste; depois menos mudanças).
   *  Por quê: são no máx. 2^13 = 8192 combinações por banco — rápido, e nunca deixa escapar a melhor. Só chaves HABILITADAS entram. */
  function opcoesDoBanco(b, p) {
    const n = b.kws.length, hab = b.habil || b.kws.map(() => true);
    const idx = []; for (let i = 0; i < n; i++) if (hab[i]) idx.push(i);
    const cust = custosDesgaste(b.estado, n, p.rodizio), atual = b.atual || b.kws.map(() => false);
    const melhor = new Map();
    for (let m = 0; m < (1 << idx.length); m++) {
      const sel = new Array(n).fill(false); let kw = 0, cd = 0, mud = 0;
      for (let j = 0; j < idx.length; j++) if (m & (1 << j)) { sel[idx[j]] = true; kw += b.kws[idx[j]]; cd += cust[idx[j]]; }
      for (let i = 0; i < n; i++) if (sel[i] !== !!atual[i]) mud++;
      const k = arred(kw), custo = cd + p.pesoMudanca * mud, ant = melhor.get(k);
      if (!ant || custo < ant.custo - 1e-9) melhor.set(k, { kw: k, sel, custo, mud, cd });
    }
    return melhor;
  }

  /** SUGERE a seleção de chaves para o alvo (kW) usando 1 ou 2 bancos combinados (BC56 + BC400).
   *  Entrada: { bancos:[{id,kws,habil[],estado:{acion[],horas[]},atual[]}], alvoKw, ...parâmetros }
   *  Saída: { selecao:{id:[bool]}, total, erro, dentro, aviso, candidatos } */
  function sugere(ent) {
    const p = mescla(PADRAO, ent); p.rodizio = mescla(PADRAO.rodizio, ent.rodizio);
    const alvo = ent.alvoKw, ops = ent.bancos.map(b => opcoesDoBanco(b, p));
    // combina os bancos: cada banco escolhe 1 soma; guardamos a soma total e o custo somado
    let comb = [{ kw: 0, partes: [], custo: 0 }];
    ops.forEach((m, bi) => {
      const novo = [];
      comb.forEach(c => m.forEach(o => novo.push({ kw: arred(c.kw + o.kw), partes: c.partes.concat([o]), custo: c.custo + o.custo })));
      comb = novo;
    });
    // erro: 'abaixo' = alvo - total (total <= alvo) · 'minimo' = total - alvo (alvo <= total <= alvo+excesso)
    const valido = c => p.modoAlvo === 'minimo' ? (c.kw >= alvo - 1e-9 && c.kw <= alvo + p.excessoMaxKw + 1e-9) : c.kw <= alvo + 1e-9;
    const erroDe = c => Math.abs(c.kw - alvo);
    const lim = limiteKw(ent.kw100, ent.pctLimite);               // a sugestão também respeita a guarda de capacidade
    const noLimite = c => lim == null || c.kw <= lim + 1e-9;
    let cand = comb.filter(c => valido(c) && noLimite(c)), aviso = '';
    if (!cand.length) { // modo 'minimo' sem solução: cai para o maior valor possível e AVISA (nunca silencioso)
      cand = comb.filter(c => c.kw <= alvo + 1e-9 && noLimite(c)); aviso = 'Não há combinação que atinja o alvo com o excesso permitido; sugerido o mais próximo abaixo.';
    }
    const eMin = Math.min(...cand.map(erroDe));
    const grupo = cand.filter(c => erroDe(c) <= eMin + p.folgaErroKw + 1e-9).sort((a, b) => a.custo - b.custo || erroDe(a) - erroDe(b));
    const esc = grupo[0], selecao = {};
    ent.bancos.forEach((b, i) => { selecao[b.id] = esc.partes[i].sel; });
    return { selecao, total: esc.kw, erro: arred(esc.kw - alvo), dentro: erroDe(esc) <= (p.modoAlvo === 'minimo' ? p.excessoMaxKw : 0) + 1e-9, aviso, candidatos: grupo.length };
  }

  /** AVALIA uma seleção feita à mão pelo operador (sem pedir confirmação de liga/desliga: o operador manda).
   *  Só informa: total, diferença para o alvo e se passou do alvo (aviso, não bloqueio). */
  function avalia(ent) {
    const total = arred(ent.bancos.reduce((t, b) => t + soma(b.kws, ent.selecao[b.id] || []), 0));
    const dif = arred(total - ent.alvoKw), p = mescla(PADRAO, ent);
    const acima = dif > 1e-9 && !(p.modoAlvo === 'minimo' && dif <= p.excessoMaxKw + 1e-9);
    return { total, dif, acima, abaixoDoMinimo: p.modoAlvo === 'minimo' && dif < -1e-9 };
  }

  /** PLANO DE ENTRADA: transforma "estado atual → seleção nova" numa lista de passos no tempo.
   *  Por quê: alguns geradores (mecânicos com GOV) disparam se a carga entra de uma vez. O operador dá um tempo para
   *  observar a rotação entre grupos. Aqui o tempo é PARÂMETRO (pausaS) e o tamanho do grupo também (degrauMaxKw).
   *  degrauMaxKw null → tudo no mesmo instante (milissegundos não são perceptíveis). 0 → uma chave por passo.
   *  Desligar: por padrão imediato (aliviar carga é seguro); pode ser escalonado também (desligaImediato:false). */
  function planoEntrada(ent) {
    const e = mescla(PADRAO.escalonamento, ent.escalonamento), passos = [];
    const liga = [], desliga = [];
    ent.bancos.forEach(b => b.kws.forEach((kw, i) => {
      const a = !!(ent.atual[b.id] || [])[i], n = !!(ent.selecao[b.id] || [])[i];
      if (n && !a) liga.push({ banco: b.id, idx: i, kw }); else if (!n && a) desliga.push({ banco: b.id, idx: i, kw });
    }));
    const agrupa = lista => {
      lista.sort((x, y) => y.kw - x.kw);                               // maiores primeiro: o degrau mais pesado entra com o gerador "descansado"
      if (e.degrauMaxKw == null) return lista.length ? [lista] : [];
      const gs = []; let g = [], s = 0;
      lista.forEach(c => { if (g.length && s + c.kw > e.degrauMaxKw) { gs.push(g); g = []; s = 0; } g.push(c); s += c.kw; });
      if (g.length) gs.push(g); return gs;
    };
    let t = 0;
    if (e.ligaAntes) {
      // v0.2 — LIGA PRIMEIRO, DESLIGA DEPOIS. Por quê (técnico): trocar chaves tirando antes de pôr faz a carga CAIR e depois subir (o motor sente a oscilação);
      // pondo antes, a carga só sobe. Leigo: primeiro acrescenta as chaves novas, espera um instante, e só então tira as que não servem mais.
      agrupa(liga).forEach(g => { passos.push({ t, liga: g, desliga: [] }); t += e.pausaS; });
      if (desliga.length) {
        let td = passos.length ? passos[passos.length - 1].t + (+e.janelaDesligaS || 0) : 0;   // sem nada a ligar: desliga já
        if (e.desligaImediato) passos.push({ t: td, liga: [], desliga });
        else agrupa(desliga).forEach(g => { passos.push({ t: td, liga: [], desliga: g }); td += e.pausaS; });
      }
    } else {
      if (e.desligaImediato) { if (desliga.length) passos.push({ t: 0, liga: [], desliga }); }
      else agrupa(desliga).forEach(g => { passos.push({ t, liga: [], desliga: g }); t += e.pausaS; });
      agrupa(liga).forEach((g, i) => { if (i > 0 || passos.length) t = Math.max(t, 0); passos.push({ t, liga: g, desliga: [] }); t += e.pausaS; });
    }
    // passos que caem no mesmo instante são fundidos (ex.: desligamento imediato + 1º grupo de ligação)
    const fund = []; passos.forEach(s => { const u = fund[fund.length - 1]; if (u && u.t === s.t) { u.liga = u.liga.concat(s.liga); u.desliga = u.desliga.concat(s.desliga); } else fund.push(s); });
    return { passos: fund, duracaoS: fund.length ? fund[fund.length - 1].t : 0 };
  }

  /** PICO DO PLANO (v0.2): maior carga (kW) que o plano atinge, passo a passo, partindo do estado atual (ent.atual).
   *  Por quê: com "liga antes, desliga depois" as chaves antigas e as novas ficam ligadas juntas por um instante; a guarda precisa saber esse máximo.
   *  Ordem dentro de um passo = a mesma do comando (primeiro desliga, depois liga). */
  function picoPlano(ent, plano) {
    const kwDe = (id, i) => { const b = ent.bancos.find(x => x.id === id); return b ? (b.kws[i] || 0) : 0; };
    let tot = ent.bancos.reduce((a, b) => a + soma(b.kws, ent.atual[b.id] || []), 0), pico = tot;
    plano.passos.forEach(p => { p.desliga.forEach(c => { tot -= kwDe(c.banco, c.idx); }); p.liga.forEach(c => { tot += kwDe(c.banco, c.idx); }); pico = Math.max(pico, tot); });
    return arred(pico);
  }

  /** LIMITE DE SEGURANÇA em kW = capacidade teórica do gerador (kW a 100 %) × percentual de segurança.
   *  Por quê: ligar todas as chaves de um banco maior que o gerador pode derrubá-lo ou danificá-lo. O percentual é
   *  PARÂMETRO da engenharia (o usuário citou algo entre 107 % e 112 %): ASSUMIDO — a confirmar. Sem os dois dados → null (e a guarda BLOQUEIA). */
  function limiteKw(kw100, pct) { return (isFinite(kw100) && kw100 > 0 && isFinite(pct) && pct > 0) ? arred(kw100 * pct / 100) : null; }

  /** GUARDA DE CAPACIDADE (filho 11): última barreira antes de qualquer comando de chave.
   *  Regra do usuário (27/10): carga ABAIXO do alvo é permitida (o operador completa depois); ACIMA do limite é BLOQUEADO com mensagem.
   *  Falha segura: sem limite configurado, nada é liberado. Vale para sugestão, seleção manual, plano e (futuro) automático. */
  function guarda(ent) {
    const lim = limiteKw(ent.kw100, ent.pctLimite);
    const total = arred(ent.bancos.reduce((t, b) => t + soma(b.kws, ent.selecao[b.id] || []), 0));
    if (lim == null) return { ok: false, total, limiteKw: null, excessoKw: null, mensagem: 'Bloqueado: informe a capacidade do gerador (kW a 100 %) e o percentual de segurança.' };
    if (total > lim + 1e-9) return { ok: false, total, limiteKw: lim, excessoKw: arred(total - lim), mensagem: 'Bloqueado: ' + total + ' kW passa do limite de segurança de ' + lim + ' kW (' + ent.pctLimite + ' % de ' + ent.kw100 + ' kW). Tire chaves.' };
    return { ok: true, total, limiteKw: lim, excessoKw: 0, mensagem: '' };
  }
  /** Pergunta ANTES de ligar uma chave: "se eu ligar esta, continua dentro do limite?" (usada pelo botão "pôr"). */
  function podeLigar(ent, bancoId, idx) {
    const sel = {}; ent.bancos.forEach(b => { sel[b.id] = (ent.selecao[b.id] || []).slice(); }); sel[bancoId][idx] = true;
    return guarda(Object.assign({}, ent, { selecao: sel }));
  }

  /** Registra o uso de uma chave (acionamento e/ou minutos ligada). Por quê separado: quem chama (HTML/PLC) decide quando contar. */
  function registraUso(estado, i, o) { estado.acion = estado.acion || []; estado.horas = estado.horas || [];
    estado.acion[i] = (estado.acion[i] || 0) + (o.acionamentos || 0); estado.horas[i] = arred((estado.horas[i] || 0) + (o.horas || 0)); return estado; }
  /** "Chave trocada" (manutenção/operador): zera o desgaste daquela chave. Por quê: chave nova não deve ser tratada como velha. */
  function chaveTrocada(estado, i) { estado.acion = estado.acion || []; estado.horas = estado.horas || []; estado.acion[i] = 0; estado.horas[i] = 0; return estado; }

  raiz.RodizioChaves = { TABELA_FISICA, PADRAO, sugere, avalia, planoEntrada, picoPlano, limiteKw, guarda, podeLigar, registraUso, chaveTrocada, soma };
  if (typeof module !== 'undefined') module.exports = raiz.RodizioChaves;
})(typeof window !== 'undefined' ? window : globalThis);
