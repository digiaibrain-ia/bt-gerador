'use strict';
// 10/11/2026 - SOLUCAO DEFINITIVA do catalogo: catalogo_ferramentas.js (sem versao no nome) gerado pela pasta.
// Prova: (1) cada ferramenta do catalogo gerado aponta para a MAIOR versao presente em dashboard/ferramentas; (2) o medidor 1.10.194 e o index_v0.7 carregam o nome estavel;
// (3) com um medidor NOVO (1.10.195) na pasta o gerador aponta para ele sem mudar mais nada (acabou a cadeia); (4) sem IP. O catalogo v0.8 (nome com versao) tem que FALHAR no item 1 (BT2_CAT=catalogo_ferramentas_v0.8.js).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path'), vm = require('vm'), cp = require('child_process');
const F = path.join(__dirname, '..', '..', '..', 'dashboard', 'ferramentas'), G = path.join(__dirname, '..', '..', '..', 'dashboard', 'gerador');
const CAT = process.env.BT2_CAT || 'catalogo_ferramentas.js';
const ler = n => { const w = {}; vm.runInNewContext(fs.readFileSync(path.join(F, n), 'utf8'), { window: w, localStorage: { getItem: () => null } }); return w.CATALOGO_FERRAMENTAS; };
const maior = pre => fs.readdirSync(F).filter(f => f.startsWith(pre) && /^\d+(\.\d+)*\.html$/.test(f.slice(pre.length))).sort((a, b) => { const x = a.slice(pre.length, -5).split('.').map(Number), y = b.slice(pre.length, -5).split('.').map(Number); for (let i = 0; i < Math.max(x.length, y.length); i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); } return 0; }).pop();
test('cada ferramenta aponta para a maior versao presente na pasta', () => {
  for (const i of ler(CAT).itens) { const pre = i.arquivo.replace(/\d+(\.\d+)*\.html$/, ''); assert.equal(i.arquivo, maior(pre), 'ferramenta ' + i.id + ' nao aponta para a maior versao (' + maior(pre) + ')'); assert.ok(fs.existsSync(path.join(F, i.arquivo))); }
});
test('medidor e index carregam o nome estavel e o catalogo nao tem IP', () => {
  const med = maior('medidor_gerador_v'), idx = maior('index_v');
  assert.ok(fs.readFileSync(path.join(F, med), 'utf8').includes('<script src="catalogo_ferramentas.js"></script>'), med + ' nao carrega catalogo_ferramentas.js');
  assert.ok(fs.readFileSync(path.join(F, idx), 'utf8').includes('catalogo_ferramentas.js') && !/catalogo_ferramentas_v/.test(fs.readFileSync(path.join(F, idx), 'utf8').replace(/catalogo_ferramentas_v0\.[0-9]+\.js — LISTA/g, '')), idx + ' ainda cita catalogo com versao');
  assert.ok(!/\b172\.17\.\d+\.\d+\b/.test(fs.readFileSync(path.join(F, 'catalogo_ferramentas.js'), 'utf8')));
});
test('um medidor novo na pasta e escolhido sem mudar medidor/index (fim da cadeia)', () => {
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'cat-')); for (const f of fs.readdirSync(F)) if (/^(medidor_gerador_v1\.10\.19[34]|grafico_ensaio_v0\.13|api_cards_visor_v0\.4|maquete_layout_v0\.5|mapa_fbs_v0\.16|gerenciador_logs_v1\.9|amostras_simulador_v0\.7)\.html$/.test(f) || f === 'catalogo_ferramentas_v0.8.js') fs.copyFileSync(path.join(F, f), path.join(tmp, f));
  fs.writeFileSync(path.join(tmp, 'medidor_gerador_v1.10.195.html'), '<html></html>');
  cp.execFileSync('python3', [path.join(G, 'gerar_catalogo_auto_v0.1.py'), tmp], { cwd: path.join(G, '..', '..') });
  const w = {}; vm.runInNewContext(fs.readFileSync(path.join(tmp, 'catalogo_ferramentas.js'), 'utf8'), { window: w, localStorage: { getItem: () => null } });
  assert.equal(w.CATALOGO_FERRAMENTAS.itens.find(i => i.id === 'medidor').arquivo, 'medidor_gerador_v1.10.195.html');
});
