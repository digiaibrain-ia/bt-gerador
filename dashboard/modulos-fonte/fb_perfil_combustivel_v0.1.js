/* =====================================================================================================================
   fb_perfil_combustivel_v0.1.js — FB FILHO "PERFIL DE COMBUSTÍVEL": como subir (e descer) a carga conforme o gerador é diesel, a gás natural ou a biometano  ·  17/11/2026
   PARA QUE SERVE (leigo): motor a gás (e mais ainda a biometano/biogás) NÃO aceita um degrau grande de carga como o diesel: a rotação e a frequência caem, a tensão cai e ele
   pode desarmar. Este bloco diz (1) de quanto em quanto subir, (2) quanto esperar entre um degrau e o seguinte, (3) se pode dar o PRÓXIMO degrau agora (a frequência já recuperou?)
   e (4) como DESCER a carga sem rejeição brusca. O operador só escolhe o combustível; o resto vem do perfil.
   ENTRADAS do bloco (as mesmas que o FB terá no PLC): combustível (perfil), de/ate (%), tempo desde o último degrau (s), frequência medida e nominal (Hz), kW a 100 %, chaves ligadas.
   SAÍDAS: lista de sub-degraus (%), "pode dar o próximo degrau?" (+ motivo / "desistir"), plano de descida (grupos de chaves a abrir, com a pausa).
   REGRA SIMPLES (sem matemática para o operador): degraus IGUAIS e no máximo "passo máx." ; espera mínima entre degraus; só avança se a frequência >= o mínimo do perfil.
   POR QUE ASSIM (técnico): FUNÇÕES PURAS (sem DOM, sem tempo do relógio, sem rede): o chamador passa o tempo e as leituras; por isso o mesmo código roda no medidor (JS) e nos testes e vira SCL depois.
   Diesel = comportamento ATUAL do medidor (sem passo máximo, sem espera, sem portão): nada muda para quem usa diesel.
   VALORES = ASSUMIDOS (ordem de grandeza típica de motor a gás turboalimentado; a curva real é o gráfico de "aceitação de carga" do datasheet do motor): CONFIRMAR com a engenharia/fabricante.
   NÃO FAZ: não comanda chave, não lê DSE, não decide aprovação do ensaio. Falha segura: sem leitura de frequência o portão NÃO libera mais carga (nunca adiciona carga às cegas).
   ===================================================================================================================== */
(function (raiz) {
  'use strict';
  const arred = (x, d) => { const f = Math.pow(10, d == null ? 1 : d); return Math.round(x * f) / f; };

  /** Perfis. passoMaxPct = maior degrau (pontos % do kW a 100 %); pausaS = espera mínima entre degraus; freqMinPct = frequência mínima (% da nominal) para liberar o próximo;
   *  maxEsperaS = quanto esperar a recuperação (além da pausa) antes de DESISTIR (não adiciona carga); descida = degraus de queda de carga (pontos % e pausa). */
  const PERFIS = {
    diesel:    { id: 'diesel',    nome: 'Diesel (padrão)',    passoMaxPct: null, pausaS: null, portao: false, freqMinPct: null, maxEsperaS: null, descida: null,
                 resumo: 'Como sempre: degraus do escalonador atual, sem espera por recuperação.' },
    gas:       { id: 'gas',       nome: 'Gás natural',        passoMaxPct: 25,   pausaS: 10,   portao: true,  freqMinPct: 97,   maxEsperaS: 60, descida: { passoPct: 50, pausaS: 10 },
                 resumo: 'Sobe em degraus iguais de até 25 %, espera 10 s e só dá o próximo com a frequência recuperada; desce em 2 etapas.' },
    biometano: { id: 'biometano', nome: 'Biometano / biogás', passoMaxPct: 20,   pausaS: 15,   portao: true,  freqMinPct: 97.5, maxEsperaS: 90, descida: { passoPct: 25, pausaS: 15 },
                 resumo: 'Sobe em degraus iguais de até 20 %, espera 15 s e só dá o próximo com a frequência recuperada; desce em 4 etapas.' }
  };
  const get = id => PERFIS[id] || PERFIS.diesel;
  const ehDiesel = p => !p || p.id === 'diesel' || !p.passoMaxPct;

  /** Sub-degraus INTERMEDIÁRIOS (em %) para subir de `de` até `ate` (exclusivo dos extremos), em partes IGUAIS e no máximo passoMax.
   *  Ex.: gás (25): 0→30 = [15]; 50→100 = [75]; 30→50 = []; biometano (20): 50→100 = [66,7 ; 83,3]. Diesel: []. */
  function subDegraus(perfil, de, ate) {
    const p = typeof perfil === 'string' ? get(perfil) : perfil;
    if (ehDiesel(p) || !(ate > de)) return [];
    const n = Math.ceil((ate - de) / p.passoMaxPct - 1e-9);
    if (n <= 1) return [];
    const out = [];
    for (let k = 1; k < n; k++) out.push(arred(de + (ate - de) * k / n, 1));
    return out;
  }

  /** PORTÃO do próximo degrau. e = { esperouS, freqHz, freqNomHz }. Devolve { libera, desiste, motivo }.
   *  - diesel: sempre libera (comportamento atual);  - pausa mínima não cumprida: espera;  - sem leitura de frequência: espera (falha segura);
   *  - frequência abaixo do mínimo: espera;  - passou pausa + maxEspera sem recuperar: DESISTE (o chamador para o plano e NÃO adiciona carga). */
  function liberaProximo(perfil, e) {
    const p = typeof perfil === 'string' ? get(perfil) : perfil;
    if (ehDiesel(p) || !p.portao) return { libera: true, desiste: false, motivo: '' };
    const t = +e.esperouS || 0, f = +e.freqHz, fn = +e.freqNomHz;
    if (t < p.pausaS) return { libera: false, desiste: false, motivo: 'pausa mínima de ' + p.pausaS + ' s entre degraus (faltam ' + arred(p.pausaS - t, 0) + ' s)' };
    const semLeitura = !(isFinite(f) && f > 0) || !(isFinite(fn) && fn > 0);
    const minHz = semLeitura ? null : arred(fn * p.freqMinPct / 100, 2);
    const baixa = semLeitura || f < minHz;
    if (!baixa) return { libera: true, desiste: false, motivo: '' };
    const motivo = semLeitura ? 'sem leitura de frequência: não adiciona carga às cegas' : 'frequência ' + arred(f, 2) + ' Hz abaixo do mínimo de ' + minHz + ' Hz: espera recuperar';
    if (t > p.pausaS + p.maxEsperaS) return { libera: false, desiste: true, motivo: motivo + ' (esperou ' + arred(t, 0) + ' s, limite ' + (p.pausaS + p.maxEsperaS) + ' s)' };
    return { libera: false, desiste: false, motivo };
  }

  /** PLANO DE DESCIDA (queda planejada de carga, ex.: etapa final de 0 %). chaves = [{id, kw}] hoje comandadas. Devolve grupos [{abre:[ids], kwDepois}] em ordem, com `pausaS` entre eles.
   *  Cada grupo tira no máximo ~passoPct do kW a 100 % (pelo menos 1 chave); o último grupo leva tudo o que sobrar. Diesel: 1 grupo só (tudo de uma vez). */
  function planoDescida(perfil, kw100, chaves) {
    const p = typeof perfil === 'string' ? get(perfil) : perfil;
    const lista = (chaves || []).filter(c => c && c.kw > 0).map(c => ({ id: c.id, kw: +c.kw })).sort((a, b) => b.kw - a.kw);
    if (!lista.length) return { grupos: [], pausaS: 0 };
    if (ehDiesel(p) || !p.descida || !(kw100 > 0)) return { grupos: [{ abre: lista.map(c => c.id), kwDepois: 0 }], pausaS: 0 };
    const passoKw = kw100 * p.descida.passoPct / 100;
    let resto = lista.slice(), total = resto.reduce((s, c) => s + c.kw, 0);
    const grupos = [];
    while (resto.length) {
      if (total <= passoKw * 1.0001 || resto.length === 1) { grupos.push({ abre: resto.map(c => c.id), kwDepois: 0 }); break; }
      let tirado = 0; const abre = [];
      for (let i = 0; i < resto.length && tirado + resto[i].kw <= passoKw + 1e-9; i++) { abre.push(resto[i]); tirado += resto[i].kw; }
      if (!abre.length) abre.push(resto[0]);                                // chave maior que o passo: tira ela sozinha (sempre progride)
      const ids = new Set(abre.map(c => c.id)); resto = resto.filter(c => !ids.has(c.id)); total = resto.reduce((s, c) => s + c.kw, 0);
      grupos.push({ abre: abre.map(c => c.id), kwDepois: arred(total, 2) });
    }
    return { grupos, pausaS: p.descida.pausaS };
  }

  raiz.PERFIL_COMB = { PERFIS, get, ehDiesel, subDegraus, liberaProximo, planoDescida };
  if (typeof module !== 'undefined') module.exports = raiz.PERFIL_COMB;
})(typeof window !== 'undefined' ? window : globalThis);
