#!/usr/bin/env node
/* gera_alvos.js — extrai o codigo dos nos do Node-RED que decidem seguranca para arquivos .js comuns, para o teste de mutacao poder estragar (o Stryker so entende arquivo .js).
   Hoje: o no "limite de capacidade e degrau (C2)" do fluxo chaves-56 v3.9 -> tests/mutacao/alvos/cap_c2.js (funcao (msg, flow, global, env, node)). Gerado a cada execucao; nao editar. */
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..', '..'), SAIDA = path.join(__dirname, 'alvos');
fs.mkdirSync(SAIDA, { recursive: true });
const flow = JSON.parse(fs.readFileSync(path.join(RAIZ, 'nodered/flows/bt2/chaves-56-api-v3.9.json'), 'utf8')), no = flow.find(n => n.id === 'chv56_c2_limite');
fs.writeFileSync(path.join(SAIDA, 'cap_c2.js'), '// GERADO por tests/mutacao/gera_alvos.js a partir de chaves-56-api-v3.9.json (no chv56_c2_limite). Nao editar.\n(function (msg, flow, global, env, node) {' + no.func + '\n})\n');
// Passo 9: no "reserva de capacidade na saida da fila (C2)" do fluxo chaves-56 v3.10 -> tests/mutacao/alvos/cap_reserva.js
const flow10 = JSON.parse(fs.readFileSync(path.join(RAIZ, 'nodered/flows/bt2/chaves-56-api-v3.12.json'), 'utf8')), res = flow10.find(n => n.id === 'chv56_c2_reserva');
fs.writeFileSync(path.join(SAIDA, 'cap_reserva.js'), '// GERADO por tests/mutacao/gera_alvos.js a partir de chaves-56-api-v3.12.json (no chv56_c2_reserva). Nao editar.\n(function (msg, flow, global, env, node) {' + res.func + '\n})\n');
console.log('alvos gerados em', path.relative(RAIZ, SAIDA));
