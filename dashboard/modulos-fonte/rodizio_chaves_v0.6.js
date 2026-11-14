// v0.6 (03/11/2026, auditoria): (A1) guarda BLOQUEIA se uma chave selecionada tem kW inválido (NaN, vazio, <= 0), se há chave ligada em banco fora da lista
//   ou índice inexistente (antes: total NaN passava em "total > limite"); podeLigar não lança exceção. (A2) chave com kW inválido fica fora da sugestão (como
//   desabilitada) e é desligada, com aviso. (A3) kW fora da grade (kW REAL do Setup): DP com cada chave ARREDONDADA PARA CIMA na grade gradeKw (0,1 kW) —
//   nunca passa do alvo/limite (confere com o kW real), sem 2^n (antes: 2 bancos reais = 14 a 31 s e erro; 31/32 chaves = vazio). Combinação dos bancos
//   sem alocar por par. Na grade de 0,5 kW o resultado é IDÊNTICO à v0.5 (mesma seleção, teste A4). (A5) planoEntrada: degrau/pausa inválidos não viram
//   "tudo de uma vez". (A6) oráculo exaustivo recusa banco > 24 chaves. picoPlano devolve Infinity se algum kW é inválido (a guarda do plano bloqueia).
// v0.5 (03/11/2026): sugestão por PROGRAMAÇÃO DINÂMICA (sem 2^n); sugereExaustivo (antigo sugere2) fica exportado só como oráculo de teste. v0.4: sugere() com falha segura (alvo invalido nao lanca excecao). v0.3: sincronizado com o modulo embutido no medidor_gerador_v1.10.157.html (a v0.2 desta pasta estava defasada: sem sugere3/sugere4/sugereN). Fonte unica para os testes em tests/fb/.
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
    gradeKw: 0.1,            // v0.6: kW fora da grade (kW real) é arredondado PARA CIMA nesta grade (0,1 ou 0,5 kW). Seguro: nunca passa do alvo/limite. ASSUMIDO — a confirmar
    escalonamento: { degrauMaxKw: null, pausaS: 0, desligaImediato: true, ligaAntes: false, janelaDesligaS: 0 } // null = tudo de uma vez (tempo desconhecido; aprender com operadores). v0.2: ligaAntes=true → liga primeiro e desliga depois de janelaDesligaS segundos
  };

  const mescla = (a, b) => Object.assign({}, a, b || {});
  const soma = (kws, sel) => kws.reduce((t, k, i) => t + (sel[i] ? k : 0), 0);
  const arred = x => Math.round(x * 1000) / 1000;
  /** v0.6: kW utilizável = número finito e > 0. Por quê: o kW REAL do Setup é kW medido − base e pode sair 0, negativo ou vazio se a chave não fechou. */
  const kwValido = k => typeof k === 'number' && Number.isFinite(k) && k > 0;

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
    if (idx.length > 24) throw new Error('oráculo exaustivo: banco grande demais (' + idx.length + ' chaves habilitadas; máx. 24). Use sugere().');   // v0.6: 1 << 31 < 0 em JS
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
  /** FB de 2 bancos (lógica original, sem mudança de comportamento): enumera o produto das opções de cada banco. */
  function sugere2(ent) {
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

  /** v0.5 (03/11/2026) — PROGRAMAÇÃO DINÂMICA por soma. Substitui a enumeração de 2^n combinações (22 chaves = 1,8 s; 32 chaves = inviável)
   *  por uma tabela soma(kW em unidades de 0,5 kW) → melhor custo, O(n × somas). É o mesmo resultado de menor custo da enumeração, porque o custo é
   *  ADITIVO por chave: desgaste da chave (se ligada) + pesoMudanca × (mudou de estado). Chaves desabilitadas ficam fora (como antes).
   *  Em SCL: arrays de tamanho fixo [0..MAX_SOMA] de REAL/INT, 1 laço por chave — cabe no ciclo do PLC.
   *  v0.6: kW fora da grade de 0,5/0,1 kW (kW REAL do Setup) NÃO volta mais à enumeração 2^n: cada chave entra na tabela com o peso ARREDONDADO PARA
   *  CIMA na grade gradeKw (0,1 kW). A tabela guarda, por soma arredondada, a seleção de MAIOR kW real (empate: menor custo); toda soma é conferida
   *  com o kW REAL contra o teto, então nunca passa do alvo nem do limite. É aproximado (perde no máx. ~gradeKw por chave), não exato. */
  function escalaKw(kws) { for (const u of [2, 10]) if (kws.every(k => Math.abs(k * u - Math.round(k * u)) < 1e-9)) return u; return null; }
  /** Bloco de UM banco: lista (em ordem crescente de soma) das melhores seleções por soma. q = soma em décimos de kW (inteiro, chave de combinação). */
  function blocoDoBanco(b, p, tetoKw) {
    const n = b.kws.length;
    const hab = b.habil || b.kws.map(() => true), atual = b.atual || b.kws.map(() => false);
    const cust = custosDesgaste(b.estado, n, p.rodizio), pm = p.pesoMudanca;
    const idx = []; for (let i = 0; i < n; i++) if (hab[i] && kwValido(b.kws[i])) idx.push(i);   // v0.6: kW inválido fica fora, como desabilitada
    const escExata = escalaKw(idx.map(i => b.kws[i])), exato = !!escExata;
    const esc = exato ? escExata : (p.gradeKw === 0.5 ? 2 : 10);
    const peso = idx.map(i => exato ? Math.round(b.kws[i] * esc) : Math.ceil(b.kws[i] * esc - 1e-9));
    const folga = exato ? 0 : idx.length;                          // cada chave arredondada para cima soma < 1 unidade a mais que o kW real
    const teto = Number.isFinite(tetoKw) ? Math.floor(tetoKw * esc + 1e-6) + folga : Infinity;
    let total = 0; for (const w of peso) total += w; const S = Math.min(total, teto);
    const vazioB = { lista: [], qmax: 0, folga10: folga * (10 / esc) };
    if (!(S >= 0)) return vazioB;
    // custo constante das chaves desabilitadas (ou com kW inválido) que estão ligadas (não podem ser ligadas/mantidas: contam como mudança)
    let fixo = 0; const usa = new Set(idx); for (let i = 0; i < n; i++) if (!usa.has(i) && atual[i]) fixo += pm;
    const INF = Infinity;
    let dp = new Float64Array(S + 1).fill(INF), nx = new Float64Array(S + 1), kr = new Float64Array(S + 1), nkr = new Float64Array(S + 1); dp[0] = 0;
    const pega = idx.map(() => new Uint8Array(S + 1));            // pega[j][s] = 1 se a chave j foi LIGADA no melhor caminho até s
    // melhor(custo, kWreal, custoAnt, kWrealAnt): na grade exata o kW é igual dentro da soma (= regra da v0.5: só custo);
    // fora da grade vence o MAIOR kW real (erro primeiro: o rodízio só desempata), depois o menor custo.
    const melhor = exato ? (c, k, cA) => c < cA - 1e-12 : (c, k, cA, kA) => cA === INF || k > kA + 1e-9 || (Math.abs(k - kA) <= 1e-9 && c < cA - 1e-12);
    idx.forEach((i, j) => {
      const w = peso[j], k = b.kws[i], cOn = cust[i] + (atual[i] ? 0 : pm), cOff = atual[i] ? pm : 0;
      nx.fill(INF);
      for (let s = 0; s <= S; s++) {
        if (dp[s] === INF) continue;
        const off = dp[s] + cOff; if (melhor(off, kr[s], nx[s], nkr[s])) { nx[s] = off; nkr[s] = kr[s]; pega[j][s] = 0; }
        const t = s + w; if (t <= S) { const on = dp[s] + cOn, kon = kr[s] + k; if (melhor(on, kon, nx[t], nkr[t])) { nx[t] = on; nkr[t] = kon; pega[j][t] = 1; } }
      }
      let x = dp; dp = nx; nx = x; x = kr; kr = nkr; nkr = x;
    });
    const lista = []; let qmax = 0;
    for (let s = 0; s <= S; s++) {
      if (dp[s] === INF) continue;
      const sel = new Array(n).fill(false); let t = s;
      for (let j = idx.length - 1; j >= 0; j--) if (pega[j][t]) { sel[idx[j]] = true; t -= peso[j]; }
      let mud = 0, cd = 0, real = 0; for (let i = 0; i < n; i++) { if (sel[i] !== !!atual[i]) mud++; if (sel[i]) { cd += cust[i]; real += b.kws[i]; } }
      const kw = exato ? arred(s / esc) : arred(real), custo = dp[s] + fixo;
      if (!exato && kw > tetoKw + 1e-9) continue;                  // v0.6: confere com o kW REAL (o arredondado pode estar na folga acima do teto)
      const q = s * (10 / esc); qmax = Math.max(qmax, q);
      lista.push({ kw, q, partes: [{ kw, sel, custo, mud, cd }], custo });
    }
    return { lista, qmax, folga10: folga * (10 / esc) };
  }
  /** Une dois blocos (soma a soma), descartando o que passa do teto (alvo, ou limite de segurança). Soma kW é sempre crescente, então o corte é seguro.
   *  v0.6: indexado pela soma em décimos de kW (q) em arrays fixos, sem criar objeto por par (4 bancos com kW real: dezenas de milhões de pares).
   *  Mesma ordem de visita e mesmo desempate da v0.5 (na grade exata o resultado é idêntico). */
  function combinaBlocos(A, B, teto) {
    const folga10 = A.folga10 + B.folga10;
    let qmax = A.qmax + B.qmax; if (Number.isFinite(teto)) qmax = Math.min(qmax, Math.floor(teto * 10 + 1e-6) + folga10);
    if (!(qmax >= 0)) return { lista: [], qmax: 0, folga10 };
    const LA = A.lista, LB = B.lista, cM = new Float64Array(qmax + 1).fill(Infinity), kM = new Float64Array(qmax + 1), iA = new Int32Array(qmax + 1), iB = new Int32Array(qmax + 1), ordem = [];
    for (let x = 0; x < LA.length; x++) {
      const a = LA[x];
      for (let y = 0; y < LB.length; y++) {
        const b = LB[y], q = a.q + b.q; if (q > qmax) continue;
        const kw = arred(a.kw + b.kw); if (kw > teto + 1e-9) continue;
        const custo = a.custo + b.custo, ant = cM[q];
        if (ant === Infinity) ordem.push(q);
        else if (!(kw > kM[q] + 1e-9 || (Math.abs(kw - kM[q]) <= 1e-9 && custo < ant - 1e-9))) continue;
        cM[q] = custo; kM[q] = kw; iA[q] = x; iB[q] = y;
      }
    }
    let qm = 0; const lista = ordem.map(q => { qm = Math.max(qm, q); return { kw: kM[q], q, custo: cM[q], a: LA[iA[q]], b: LB[iB[q]] }; });
    return { lista, qmax: qm, folga10 };
  }
  const partesDe = e => e.partes || partesDe(e.a).concat(partesDe(e.b));   // monta a seleção por banco só da opção escolhida
  function preparo(ent) {
    const p = mescla(PADRAO, ent); p.rodizio = mescla(PADRAO.rodizio, ent.rodizio);
    const alvo = ent.alvoKw, lim = limiteKw(ent.kw100, ent.pctLimite);
    const teto = Math.min(p.modoAlvo === 'minimo' ? alvo + p.excessoMaxKw : alvo, lim == null ? Infinity : lim);
    return { p, alvo, lim, teto, blocos: ent.bancos.map(b => blocoDoBanco(b, p, teto)) };
  }
  /** Escolhe a melhor soma do bloco final (mesma regra do FB de 2 bancos) e devolve a seleção por banco. */
  function escolheDoBloco(ent, s, comb) {
    const { p, alvo, lim } = s;
    const valido = c => p.modoAlvo === 'minimo' ? (c.kw >= alvo - 1e-9 && c.kw <= alvo + p.excessoMaxKw + 1e-9) : c.kw <= alvo + 1e-9;
    const erroDe = c => Math.abs(c.kw - alvo);
    const noLimite = c => lim == null || c.kw <= lim + 1e-9;
    const todos = comb.lista;
    let cand = todos.filter(c => valido(c) && noLimite(c)), aviso = '';
    if (!cand.length) { cand = todos.filter(c => c.kw <= alvo + 1e-9 && noLimite(c)); aviso = 'Não há combinação que atinja o alvo com o excesso permitido; sugerido o mais próximo abaixo.'; }
    if (!cand.length) throw new Error('nenhuma combinação possível');
    let eMin = Infinity; for (const c of cand) eMin = Math.min(eMin, erroDe(c));   // v0.6: sem Math.min(...lista) (estourava a pilha com listas grandes)
    const grupo = cand.filter(c => erroDe(c) <= eMin + p.folgaErroKw + 1e-9).sort((a, b) => a.custo - b.custo || erroDe(a) - erroDe(b));
    const esc = grupo[0], partes = partesDe(esc), selecao = {};
    ent.bancos.forEach((b, i) => { selecao[b.id] = partes[i].sel; });
    // v0.6: avisa chaves habilitadas com kW inválido (ficaram fora do cálculo) e se o cálculo usou kW fora da grade (aproximado)
    const ruins = [], aprox = ent.bancos.some(b => !escalaKw((b.kws || []).filter((k, i) => (b.habil ? b.habil[i] : true) && kwValido(k))));
    ent.bancos.forEach(b => b.kws.forEach((k, i) => { if ((b.habil ? b.habil[i] : true) && !kwValido(k)) ruins.push('BC' + b.id + ' chave ' + (i + 1)); }));
    if (ruins.length) aviso = (aviso ? aviso + ' ' : '') + 'Chave(s) com kW inválido fora do cálculo: ' + ruins.join(', ') + ' (refazer o Setup ou usar o kW nominal).';
    return { selecao, total: esc.kw, erro: arred(esc.kw - alvo), dentro: erroDe(esc) <= (p.modoAlvo === 'minimo' ? p.excessoMaxKw : 0) + 1e-9, aviso, candidatos: grupo.length, aproximado: aprox };
  }
  /** FB de 3 bancos: (A+B) depois + C. */
  function sugere3(ent) {
    const s = preparo(ent), [A, B, C] = s.blocos;
    return escolheDoBloco(ent, s, combinaBlocos(combinaBlocos(A, B, s.teto), C, s.teto));
  }
  /** FB de 4 bancos: (A+B) e (C+D) em paralelo, depois une os dois. */
  function sugere4(ent) {
    const s = preparo(ent), [A, B, C, D] = s.blocos;
    return escolheDoBloco(ent, s, combinaBlocos(combinaBlocos(A, B, s.teto), combinaBlocos(C, D, s.teto), s.teto));
  }
  /** FB de 5 ou mais bancos: árvore de pares até sobrar um bloco só (mesma regra, mesmo corte). */
  function sugereN(ent) {
    const s = preparo(ent);
    let blocos = s.blocos;
    while (blocos.length > 1) {
      const nxt = [];
      for (let i = 0; i < blocos.length; i += 2) nxt.push(i + 1 < blocos.length ? combinaBlocos(blocos[i], blocos[i + 1], s.teto) : blocos[i]);
      blocos = nxt;
    }
    return escolheDoBloco(ent, s, blocos[0]);
  }
  /** SUGERE a seleção: escolhe sozinho o FB pelo número de bancos entrando no cálculo (2, 3, 4 ou 5+). */
  function sugere(ent) {
    const bancos = ent && Array.isArray(ent.bancos) ? ent.bancos : [], n = bancos.length;
    // v0.4 (03/11/2026): FALHA SEGURA. Alvo invalido (NaN, negativo, infinito) ou nenhuma combinacao possivel nao pode lancar excecao: devolve "nada ligado" + aviso.
    const vazio = aviso => ({ selecao: Object.fromEntries(bancos.map(b => [b.id, (b.kws || []).map(() => false)])), total: 0, erro: null, dentro: false, aviso, candidatos: 0 });
    if (!n) return vazio('Nenhum banco no cálculo: nada foi sugerido.');
    if (!(typeof ent.alvoKw === 'number' && isFinite(ent.alvoKw) && ent.alvoKw >= 0)) return vazio('Alvo inválido: nada foi sugerido.');
    try { return n === 1 ? sugereN(ent) : n === 2 ? sugereN(ent) : n === 3 ? sugere3(ent) : n === 4 ? sugere4(ent) : sugereN(ent); }   // v0.5: 1 e 2 bancos também por blocos (DP); sugere2 fica como oráculo
    catch (e) { return vazio('Não foi possível calcular a sugestão (' + (e && e.message || 'erro') + '): nada foi sugerido.'); }
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
    // v0.6: pausa inválida (NaN, negativa, texto) = 0; degrau inválido (NaN, negativo) = 0 = UMA CHAVE POR PASSO (o mais conservador). null continua = tudo junto.
    e.pausaS = Number.isFinite(+e.pausaS) && +e.pausaS > 0 ? +e.pausaS : 0;
    if (e.degrauMaxKw != null && !(Number.isFinite(+e.degrauMaxKw) && +e.degrauMaxKw >= 0)) e.degrauMaxKw = 0;
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
    // v0.6: kW inválido (NaN/negativo) numa chave ligada ou do plano = pico DESCONHECIDO -> Infinity (quem compara com o limite bloqueia)
    const ruim = (b, sel) => b.kws.some((k, i) => sel[i] && !kwValido(k));
    if (!Number.isFinite(pico) || ent.bancos.some(b => ruim(b, ent.atual[b.id] || [])) || plano.passos.some(p => p.liga.some(c => !kwValido(kwDe(c.banco, c.idx))))) return Infinity;
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
    const lim = limiteKw(ent.kw100, ent.pctLimite), bancos = ent.bancos || [], sel = ent.selecao || {};
    // v0.6: só soma kW VÁLIDO; chave selecionada com kW inválido, índice inexistente ou banco fora da lista = BLOQUEIA (antes: total NaN passava)
    const ruins = [], fora = [], ids = new Set(bancos.map(b => b.id));
    let soma6 = 0;
    bancos.forEach(b => { const s = sel[b.id] || [];
      b.kws.forEach((k, i) => { if (s[i]) { if (kwValido(k)) soma6 += k; else ruins.push('BC' + b.id + ' chave ' + (i + 1)); } });
      for (let i = b.kws.length; i < s.length; i++) if (s[i]) ruins.push('BC' + b.id + ' chave ' + (i + 1) + ' (não existe)'); });
    Object.keys(sel).forEach(id => { if (!ids.has(id) && (sel[id] || []).some(Boolean)) fora.push('BC' + id); });
    const total = arred(soma6);
    if (lim == null) return { ok: false, total, limiteKw: null, excessoKw: null, mensagem: 'Bloqueado: informe a capacidade do gerador (kW a 100 %) e o percentual de segurança.' };
    if (ruins.length) return { ok: false, total, limiteKw: lim, excessoKw: null, mensagem: 'Bloqueado: chave(s) com kW inválido ou inexistente: ' + ruins.join(', ') + '. Refaça o Setup ou use o kW nominal.' };
    if (fora.length) return { ok: false, total, limiteKw: lim, excessoKw: null, mensagem: 'Bloqueado: há chave ligada em banco fora do cálculo (' + fora.join(', ') + '): a carga dela não seria contada.' };
    if (total > lim + 1e-9) return { ok: false, total, limiteKw: lim, excessoKw: arred(total - lim), mensagem: 'Bloqueado: ' + total + ' kW passa do limite de segurança de ' + lim + ' kW (' + ent.pctLimite + ' % de ' + ent.kw100 + ' kW). Tire chaves.' };
    return { ok: true, total, limiteKw: lim, excessoKw: 0, mensagem: '' };
  }
  /** Pergunta ANTES de ligar uma chave: "se eu ligar esta, continua dentro do limite?" (usada pelo botão "pôr"). */
  function podeLigar(ent, bancoId, idx) {
    // v0.6: banco desconhecido ou índice inválido não lança exceção: a guarda BLOQUEIA (banco fora da lista / chave inexistente)
    const sel = {}, orig = ent.selecao || {};
    Object.keys(orig).forEach(k => { sel[k] = (orig[k] || []).slice(); }); (ent.bancos || []).forEach(b => { if (!sel[b.id]) sel[b.id] = []; });
    if (!(Number.isInteger(idx) && idx >= 0)) return { ok: false, total: null, limiteKw: limiteKw(ent.kw100, ent.pctLimite), excessoKw: null, mensagem: 'Bloqueado: chave inválida.' };
    if (!sel[bancoId]) sel[bancoId] = [];
    sel[bancoId][idx] = true;
    return guarda(Object.assign({}, ent, { selecao: sel }));
  }

  /** Registra o uso de uma chave (acionamento e/ou minutos ligada). Por quê separado: quem chama (HTML/PLC) decide quando contar. */
  function registraUso(estado, i, o) { estado.acion = estado.acion || []; estado.horas = estado.horas || [];
    estado.acion[i] = (estado.acion[i] || 0) + (o.acionamentos || 0); estado.horas[i] = arred((estado.horas[i] || 0) + (o.horas || 0)); return estado; }
  /** "Chave trocada" (manutenção/operador): zera o desgaste daquela chave. Por quê: chave nova não deve ser tratada como velha. */
  function chaveTrocada(estado, i) { estado.acion = estado.acion || []; estado.horas = estado.horas || []; estado.acion[i] = 0; estado.horas[i] = 0; return estado; }

  raiz.RodizioChaves = { TABELA_FISICA, PADRAO, sugere, sugereExaustivo: sugere2, avalia, planoEntrada, picoPlano, limiteKw, guarda, podeLigar, registraUso, chaveTrocada, soma };
  if (typeof module !== 'undefined') module.exports = raiz.RodizioChaves;
})(typeof window !== 'undefined' ? window : globalThis);
