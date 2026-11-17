#!/usr/bin/env node
/* =====================================================================================================================
   gerar_rnc_v1.1.js — GERA o fluxo Node-RED do RNC:  nodered/flows/rnc-api-v1.1.json  ·  13/11/2026
   PARA QUE SERVE (leigo): monta, a partir dos arquivos de regras (rnc_core / rnc_io), o arquivo que você importa no Node-RED.
   Assim o código que roda no Node-RED é o MESMO que os testes provaram (nada é digitado duas vezes).
   v1.1: o fluxo passa a aceitar e guardar o contexto do ensaio enviado pelo medidor (campo `contexto` em POST /api/rnc/abrir). Importar SÓ UM: v1.0 OU v1.1 (mesmas rotas).
   COMO USAR:  node nodered/gerador/gerar_rnc_v1.1.js        (gera/atualiza o JSON; mudou a regra? rode de novo e dê nova versão ao arquivo)
   O FLUXO: uma aba própria "RNC · Qualidade e retrabalho (API) v1.1", SEPARADA das abas das chaves. Só informativo:
   NÃO tem nó s7/modbus, NÃO escreve em PLC/DB/DSE. Grava só em arquivo (rnc.jsonl) e fotos, na pasta RNC_DIR.
   ROTAS (padrão /api/<recurso>, ver docs/PADRAO_ROTAS_API_NODERED.md):
     POST /api/rnc/abrir · POST /api/rnc/evento · GET /api/rnc · GET /api/rnc/serie/:serial
     POST /api/rnc/foto/:rnc_id · GET /api/rnc/foto/:rnc_id/:nome · GET /api/rnc/saude
   ===================================================================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');

const VERSAO = 'v1.1';
const FLOW = 'rnc-' + VERSAO;
const aqui = __dirname;
const raiz = path.resolve(aqui, '..', '..');
const src = (nome) => fs.readFileSync(path.join(aqui, 'rnc', nome), 'utf8');
// Embrulha um módulo CommonJS para colar dentro do nó function (que não tem require dos nossos arquivos).
const modulo = (nome, texto) => `const ${nome} = (function () { const module = { exports: {} };\n${texto}\nreturn module.exports; })();\n`;

const CORE = src('rnc_core_v1.1.js');
const IO = src('rnc_io_v1.1.js');

const HANDLER = `// ${FLOW} · atende todas as rotas /api/rnc/*. Node-RED é o ÚNICO escritor do rnc.jsonl; tudo abaixo é síncrono (sem corrida).
// NÃO escreve em PLC/chave/DSE. Só arquivo.
${modulo('core', CORE)}${modulo('criarArmazem', IO)}
const FLOW = '${FLOW}';
let arm = context.get('arm');
if (!arm) {
  const cfg = {};
  if (env.get('RNC_SERIAL_REGEX')) cfg.serialRegex = env.get('RNC_SERIAL_REGEX');
  if (env.get('RNC_BANCOS')) cfg.bancos = env.get('RNC_BANCOS').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  arm = criarArmazem({ fs, path, core, dir: env.get('RNC_DIR') || 'rnc-dados', cfg });
  context.set('arm', arm);
}
const req = msg.req || {};
const rota = String(req.method || '').toUpperCase() + ' ' + (req.route && req.route.path || '');
const body = (msg.payload && typeof msg.payload === 'object' && !Buffer.isBuffer(msg.payload)) ? msg.payload : {};
const q = req.query || {};
const prm = req.params || {};
const H = { 'Content-Type': 'application/json' };
const resp = (r) => { msg.statusCode = r.status; msg.headers = H; msg.payload = Object.assign({ flow: FLOW }, r.body); return msg; };

if (rota === 'POST /api/rnc/abrir') {
  return resp(arm.executar(Object.assign({}, body, { acao: 'abrir' })));
}
if (rota === 'POST /api/rnc/evento') {
  return resp(arm.executar(Object.assign({}, body, { acao: 'evento', event: body.event })));
}
if (rota === 'GET /api/rnc') {
  let lista = Object.values(arm.listar());
  if (q.serial) { const s = core.normalizaSerie(q.serial); lista = lista.filter(r => r.serial === s); }
  if (q.estado) lista = lista.filter(r => r.estado === String(q.estado).toUpperCase());
  if (q.encerradas !== '1') lista = lista.filter(r => r.estado !== 'LIBERADO' || q.encerradas === 'todas');
  lista.sort((a, b) => (a.atualizado_em < b.atualizado_em ? 1 : -1));
  const limit = Math.min(Math.max(parseInt(q.limit, 10) || 200, 1), 1000);
  return resp({ status: 200, body: { ok: true, total: lista.length, rncs: lista.slice(0, limit) } });
}
if (rota === 'GET /api/rnc/serie/:serial') {
  const s = core.normalizaSerie(prm.serial);
  return resp({ status: 200, body: Object.assign({ ok: true }, core.situacaoSerie(arm.listar(), s)) });
}
if (rota === 'POST /api/rnc/foto/:rnc_id') {
  const ct = (req.headers && req.headers['content-type']) || '';
  return resp(arm.executarFoto(prm.rnc_id, String(q.actor || ''), ct, msg.payload));
}
if (rota === 'GET /api/rnc/foto/:rnc_id/:nome') {
  const f = arm.lerFoto(prm.rnc_id, prm.nome);
  if (!f) return resp({ status: 404, body: { ok: false, erro: 'foto não encontrada' } });
  msg.statusCode = 200; msg.headers = { 'Content-Type': f.tipo, 'Cache-Control': 'max-age=3600' }; msg.payload = f.buffer; return msg;
}
if (rota === 'GET /api/rnc/saude') {
  return resp({ status: 200, body: arm.saude() });
}
return resp({ status: 404, body: { ok: false, erro: 'rota desconhecida: ' + rota } });
`;

const BACKUP = `// ${FLOW} · cópia diária do rnc.jsonl (00:05). Mantém os 30 mais novos. Só arquivo.
${modulo('core', CORE)}${modulo('criarArmazem', IO)}
let arm = context.get('arm');
if (!arm) arm = criarArmazem({ fs, path, core, dir: env.get('RNC_DIR') || 'rnc-dados' });
const r = arm.backup(new Date());
node.status({ fill: 'green', shape: 'dot', text: r.copiado ? r.arquivo : 'sem dados ainda' });
return null;
`;

const ERRO = `// ${FLOW} · qualquer exceção desta aba vira HTTP 500 (a requisição não fica pendurada e o HTML NÃO mostra "salvo").
msg.statusCode = 500;
msg.headers = { 'Content-Type': 'application/json' };
msg.payload = { ok: false, flow: '${FLOW}', erro: (msg.error && msg.error.message) || 'erro interno' };
return msg;
`;

const TAB = 'rnc_tab';
const libs = [{ var: 'fs', module: 'fs' }, { var: 'path', module: 'path' }];
const fn = (id, name, func, x, y, wires, extra) => Object.assign({ id, type: 'function', z: TAB, name, func, outputs: 1, timeout: 0, noerr: 0, initialize: '', finalize: '', libs, x, y, wires: [wires] }, extra || {});

const rotas = [
  ['POST', '/api/rnc/abrir'], ['POST', '/api/rnc/evento'], ['GET', '/api/rnc'], ['GET', '/api/rnc/serie/:serial'],
  ['POST', '/api/rnc/foto/:rnc_id'], ['GET', '/api/rnc/foto/:rnc_id/:nome'], ['GET', '/api/rnc/saude'],
];

const nos = [
  {
    id: TAB, type: 'tab', label: 'RNC · Qualidade e retrabalho (API) ' + VERSAO, disabled: false,
    info: `${FLOW} (13/11/2026). RNC (Registro de Não Conformidade) e retrabalho do GERADOR, por número de série. Só informativo.\n` +
      'NÃO tem nós s7/modbus; NÃO comanda PLC, chave nem DSE; flow SEPARADO das abas de chaves. Só grava arquivo.\n' +
      'Variáveis de ambiente (PM2): RNC_DIR (pasta dos dados; sem ela usa ./rnc-dados), RNC_SERIAL_REGEX (opcional), RNC_BANCOS (opcional, ex.: BT1,BT2).\n' +
      'Arquivos: rnc.jsonl (um evento por linha, só cresce) · fotos/<rnc_id>/ · backup/ (diário 00:05, 30 dias).\n' +
      'Rotas: POST /api/rnc/abrir · POST /api/rnc/evento · GET /api/rnc · GET /api/rnc/serie/:serial · POST|GET /api/rnc/foto/... · GET /api/rnc/saude.\n' +
      'Requer no settings.js do Node-RED: functionExternalModules ligado (padrão) para os módulos fs/path do nó function.',
  },
  { id: 'rnc_c', type: 'comment', z: TAB, name: 'RNC · só arquivo · não toca PLC/chave/DSE', info: '', x: 220, y: 40, wires: [] },
];
rotas.forEach(([m, u], i) => {
  nos.push({ id: 'rnc_in_' + i, type: 'http in', z: TAB, name: m + ' ' + u, url: u, method: m.toLowerCase(), upload: false, swaggerDoc: '', x: 190, y: 100 + i * 50, wires: [['rnc_fn']] });
});
nos.push(fn('rnc_fn', 'RNC · atende as rotas', HANDLER, 520, 220, ['rnc_out']));
nos.push({ id: 'rnc_out', type: 'http response', z: TAB, name: 'HTTP response', statusCode: '', headers: {}, x: 800, y: 220, wires: [] });
nos.push({ id: 'rnc_catch', type: 'catch', z: TAB, name: 'erro nesta aba', scope: null, uncaught: true, x: 190, y: 500, wires: [['rnc_fn_erro']] });
nos.push(fn('rnc_fn_erro', 'responde 500', ERRO, 520, 500, ['rnc_out']));
nos.push({ id: 'rnc_cron', type: 'inject', z: TAB, name: 'backup diário 00:05', props: [{ p: 'payload' }], repeat: '', crontab: '05 00 * * *', once: false, onceDelay: 0.1, topic: '', payload: '', payloadType: 'date', x: 190, y: 580, wires: [['rnc_fn_bkp']] });
nos.push(fn('rnc_fn_bkp', 'copia rnc.jsonl', BACKUP, 520, 580, []));

const dest = path.join(raiz, 'nodered', 'flows', 'rnc-api-' + VERSAO + '.json');
fs.writeFileSync(dest, JSON.stringify(nos, null, 2) + '\n');
console.log('gerado:', path.relative(raiz, dest), '(' + nos.length + ' nós)');
