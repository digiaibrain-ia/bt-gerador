'use strict';
// VERIFICADOR DE INVARIANTES (Fase 3, Portao 1) - funcoes puras sobre o trace do PLC simulado, as respostas HTTP e os logs do Node-RED.
// Nao conhece os fluxos: o teste diz como agrupar enderecos em "comandos". Usado nos testes de caracterizacao (Portao 2).

// escritas aplicadas (ok) em um endereco, na ordem em que foram APLICADAS (campo ordem; o trace guarda na ordem de INICIO)
const valoresAplicados = (trace, addr) => trace.filter(t => t.ok && t.addr === addr).sort((a, b) => a.ordem - b.ordem).map(t => t.valor);

// I1/I2: janelas [primeiro inicio, ultima aplicacao] de cada grupo (= comando) NAO podem se sobrepor.
// grupos: { nome: addr => bool }. Devolve a lista de pares que se sobrepoem (vazia = ok).
function sobreposicoes(trace, grupos) {
  const jan = {};
  for (const [nome, fn] of Object.entries(grupos)) {
    const ts = trace.filter(t => fn(t.addr));
    if (ts.length) jan[nome] = { ini: Math.min(...ts.map(t => t.tInicio)), fim: Math.max(...ts.map(t => t.tAplicada)) };
  }
  const nomes = Object.keys(jan), r = [];
  for (let i = 0; i < nomes.length; i++) for (let j = i + 1; j < nomes.length; j++) {
    const a = jan[nomes[i]], b = jan[nomes[j]];
    if (a.ini < b.fim && b.ini < a.fim) r.push([nomes[i], nomes[j]]);
  }
  return r;
}

// ordem em que os grupos COMECARAM a escrever (primeiro inicio de cada um), para comparar com a ordem de aceitacao
function ordemDeInicio(trace, grupos) {
  const ini = Object.entries(grupos).map(([nome, fn]) => { const ts = trace.filter(t => fn(t.addr)); return ts.length ? [nome, Math.min(...ts.map(t => t.tInicio))] : null; }).filter(Boolean);
  return ini.sort((a, b) => a[1] - b[1]).map(x => x[0]);
}

// I3: cada pedido recebeu exatamente UMA resposta com status valido (respostas = [{status}|null])
const semRespostaPerdida = respostas => respostas.filter(r => !r || !(r.status >= 100)).length;

// I3/I4: avisos do Node-RED que indicam resposta em duplicidade ou no que falhou (logs = h.logs)
const PADRAO_DUPLICIDADE = /headers already sent|ERR_HTTP_HEADERS_SENT|already sent|response already|Cannot set headers|write after end/i;
const respostasEmDuplicidade = logs => logs.filter(l => PADRAO_DUPLICIDADE.test(l.msg));

// estatisticas de latencia de uma lista de ms
function percentis(ms) {
  const v = [...ms].sort((a, b) => a - b), p = q => v[Math.min(v.length - 1, Math.floor(q * v.length))];
  return { n: v.length, min: v[0], p50: p(0.5), p95: p(0.95), max: v[v.length - 1] };
}

module.exports = { valoresAplicados, sobreposicoes, ordemDeInicio, semRespostaPerdida, respostasEmDuplicidade, percentis };
