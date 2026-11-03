'use strict';
// TRAVA DE SEGURANCA (Fase 1). Impede qualquer teste de falar com PLC, ET200, DSE ou Node-RED reais.
// 4 camadas: (1) configuracao so aceita loopback; (2) flows de producao so entram com endpoints S7 substituidos;
// (3) guarda de rede: qualquer conexao TCP fora do localhost lanca erro; (4) recusa NODE_ENV=production.
const net = require('net');

const LOOPBACK = new Set(['127.0.0.1', 'localhost', '::1', '::ffff:127.0.0.1']);
// enderecos de equipamento real do projeto (lista de bloqueio explicita, alem da regra de loopback)
const IPS_REAIS = ['172.17.209.135', '172.17.210.156', '172.17.209.158'];

class TravaProducao extends Error { constructor(msg) { super('[TRAVA DE PRODUCAO] ' + msg); this.name = 'TravaProducao'; } }

function ehLoopback(h) { return LOOPBACK.has(String(h || '').toLowerCase()); }

// camada 1 e 4: ambiente e configuracao
function verificaAmbiente(env = process.env, config = {}) {
  if (env.NODE_ENV === 'production') throw new TravaProducao('NODE_ENV=production. Os testes nunca rodam em producao.');
  if (env.BT2_AMBIENTE_TESTE !== 'local') throw new TravaProducao('defina BT2_AMBIENTE_TESTE=local (o "npm test" faz isso). Sem isso, nada roda.');
  for (const [nome, valor] of Object.entries(config)) {
    if (valor == null) continue;
    const host = String(valor).replace(/^[a-z]+:\/\//, '').replace(/[:/].*$/, '');
    if (IPS_REAIS.includes(host)) throw new TravaProducao(nome + '=' + valor + ' e um equipamento REAL do projeto.');
    if (!ehLoopback(host)) throw new TravaProducao(nome + '=' + valor + ' nao e localhost/127.0.0.1.');
  }
}

// camada 2: os fluxos carregados nao podem levar a um endpoint S7 real (o teste substitui todos)
function verificaFlows(flows) {
  const achados = [];
  for (const n of flows) {
    if (n && n.type === 's7 endpoint' && n.address && !ehLoopback(n.address)) achados.push(n.id + ' (' + n.address + ')');
  }
  // os enderecos reais dos fluxos de producao sao reescritos em memoria pelo harness; a lista e so para o relatorio
  return achados;
}

// camada 3: guarda de rede (qualquer socket TCP para fora do loopback falha)
let guardaInstalada = false;
function instalaGuardaRede() {
  if (guardaInstalada) return;
  guardaInstalada = true;
  const original = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function (...args) {
    const alvo = args[0] && typeof args[0] === 'object' ? args[0] : { port: args[0], host: args[1] };
    const host = alvo.host || 'localhost';
    if (!ehLoopback(host)) throw new TravaProducao('conexao TCP bloqueada para ' + host + ':' + alvo.port + ' (so localhost).');
    return original.apply(this, args);
  };
}

module.exports = { TravaProducao, verificaAmbiente, verificaFlows, instalaGuardaRede, ehLoopback, IPS_REAIS };
