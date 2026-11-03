'use strict';
// Nos S7 de TESTE com os mesmos nomes dos nos de producao ('s7 endpoint', 's7 in', 's7 out').
// O endpoint NAO abre socket: le/escreve no PLC simulado guardado em global.__BT2_PLC__ (criado pelo harness).
const { ehLoopback } = require('../trava_producao.js');

module.exports = function (RED) {
  function endpoint(config) {
    RED.nodes.createNode(this, config);
    this.vartable = Array.isArray(config.vartable) ? config.vartable : [];
    this.cycletime = Math.max(20, +config.cycletime || 200);
    this.enderecoOriginal = config.address || '';
    this.reescrito = !ehLoopback(this.enderecoOriginal);   // endereco de producao foi trocado pelo simulado
    this.plc = () => global.__BT2_PLC__;
    this.nomeVar = Object.fromEntries(this.vartable.map(v => [v.name, v.addr]));
    this.on('close', () => { this.plc = () => null; });
  }
  RED.nodes.registerType('s7 endpoint', endpoint);

  function leitura(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const ep = RED.nodes.getNode(config.endpoint);
    if (!ep) { node.error('endpoint S7 de teste nao encontrado: ' + config.endpoint); return; }
    const tick = () => {
      const plc = ep.plc();
      if (!plc || plc.falhas.leitura) return;   // PLC "fora": nao entrega leitura nova (o cache envelhece)
      const payload = {};
      for (const v of ep.vartable) payload[v.name] = plc.ler(v.addr);
      node.send({ payload, topic: ep.name || 'PLC simulado' });
    };
    const h = setInterval(tick, ep.cycletime);
    this.on('close', () => clearInterval(h));
  }
  RED.nodes.registerType('s7 in', leitura);

  function escrita(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    const ep = RED.nodes.getNode(config.endpoint);
    if (!ep) { node.error('endpoint S7 de teste nao encontrado: ' + config.endpoint); return; }
    this.on('input', (msg, send, done) => {
      const plc = ep.plc();
      if (!plc) { done(new Error('PLC simulado nao iniciado')); return; }
      if (plc.falhas.escrita) { done(new Error('timeout de escrita no PLC (simulado)')); return; }
      const nome = msg.variable || msg.address;
      const addr = ep.nomeVar[nome] || (String(nome || '').startsWith('DB') ? nome : null);
      if (!addr) { done(new Error('variavel S7 desconhecida: ' + nome)); return; }
      try { plc.escrever(addr, msg.payload); done(); }
      catch (e) { done(e); }
    });
  }
  RED.nodes.registerType('s7 out', escrita);
};
