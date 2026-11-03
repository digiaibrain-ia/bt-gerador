'use strict';
// HARNESS: sobe o Node-RED 5.0.9 local (tests/integracao/runtime) com os fluxos de PRODUCAO lidos do disco
// (sem alterar os arquivos), trocando so os nos S7 pelos de teste, ligados a um PLC simulado em memoria.
const fs = require('fs');
const path = require('path');
const http = require('http');
const { once } = require('events');
const { PlcSimulado } = require('./plc_simulado.js');
const { verificaAmbiente, verificaFlows, instalaGuardaRede } = require('./trava_producao.js');

const RUNTIME = path.join(__dirname, 'runtime');
const FLUXOS = path.join(__dirname, '..', '..', 'nodered', 'flows', 'bt2');
const RED = require(path.join(RUNTIME, 'node_modules', 'node-red'));
const express = require(path.join(RUNTIME, 'node_modules', 'express'));

async function sobe({ fluxos = [], fluxosCaminho = [], plc = new PlcSimulado(), env = {}, envAbas = {}, servirHtml = false } = {}) {
  verificaAmbiente(Object.assign({}, process.env, env), {});
  instalaGuardaRede();
  Object.assign(process.env, env);                       // ex.: WD_HTML_S reduzido nos testes do vigia
  const userDir = path.join(RUNTIME, 'tmp', Date.now() + '-' + Math.random().toString(36).slice(2, 7));
  fs.mkdirSync(path.join(userDir, 'node_modules'), { recursive: true });
  fs.writeFileSync(path.join(userDir, 'package.json'), JSON.stringify({ name: 'teste-integracao', version: '0.0.0', dependencies: { 'bt2-nos-s7-teste': '0.1.0' } }));
  fs.symlinkSync(path.join(__dirname, 'nos_s7_teste'), path.join(userDir, 'node_modules', 'bt2-nos-s7-teste'), 'dir');
  const flows = [];
  for (const f of fluxos) flows.push(...JSON.parse(fs.readFileSync(path.join(FLUXOS, f + '.json'), 'utf8')));
  for (const c of fluxosCaminho) flows.push(...JSON.parse(fs.readFileSync(c, 'utf8')));   // caminho explicito (uso de teste/probe)
  // variaveis de ambiente DA ABA (como o operador faz em Propriedades > Variaveis de ambiente), trocadas so na copia em memoria
  for (const aba of flows.filter(n => n.type === 'tab')) {
    aba.env = aba.env || [];
    for (const [nome, valor] of Object.entries(envAbas)) {
      const ex = aba.env.find(v => v.name === nome);
      if (ex) ex.value = String(valor); else aba.env.push({ name: nome, value: String(valor), type: 'num' });
    }
  }
  const reescritos = verificaFlows(flows);              // informativo: enderecos reais que serao substituidos
  fs.writeFileSync(path.join(userDir, 'flows.json'), JSON.stringify(flows));
  global.__BT2_PLC__ = plc;

  const app = express();
  const server = http.createServer(app);
  const settings = {
    userDir, flowFile: 'flows.json', httpAdminRoot: false, httpNodeRoot: '/', credentialSecret: 'teste-local-nao-usar',
    telemetryEnabled: false, editorTheme: { projects: { enabled: false } }, logging: { console: { level: process.env.BT2_LOG_NIVEL || 'error', metrics: false, audit: false } },
  };
  RED.init(server, settings);
  // (opcional, so para o F11) serve o HTML do medidor a partir da copia de DISCO do repositorio, na mesma origem do Node-RED de teste
  if (servirHtml) app.use('/html', express.static(path.join(__dirname, '..', '..', 'dashboard', 'ferramentas'), { index: false }));
  app.use(settings.httpNodeRoot, RED.httpNode);
  await RED.start();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = 'http://127.0.0.1:' + server.address().port;

  return {
    url, plc, reescritos, red: RED,
    async para() {
      await RED.stop();
      await new Promise(r => server.close(r));
      global.__BT2_PLC__ = null;
      fs.rmSync(userDir, { recursive: true, force: true });   // limpa a instalacao temporaria desta execucao
    },
  };
}

module.exports = { sobe };
