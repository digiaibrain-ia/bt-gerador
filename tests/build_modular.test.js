'use strict';
/* =====================================================================================================================
   build_modular.test.js — guarda do build modular do medidor (Passo 3 da auditoria, 18/11/2026).

   PARA QUE SERVE (leigo): o medidor agora é montado a partir de pedaços em dashboard/src/. Este teste garante que:
   (1) o arquivo entregue em dashboard/ferramentas/ é EXATAMENTE o que o build produz (ninguém editou o HTML à mão e
       esqueceu o src, nem o contrário);
   (2) todo pedaço em src/ é usado pelo esqueleto (nenhum arquivo esquecido) e todo pedaço citado existe;
   (3) todo módulo JS é um trecho completo e válido (nenhum corte no meio de um comando);
   (4) não sobra marcador @@...@@ no HTML final.
   COMO RODAR: node --test tests/build_modular.test.js        (rápido, sem navegador, sem Node-RED)
   NÃO FAZ: não abre o medidor nem testa comportamento (isso é dos testes e2e e de integração).
   ===================================================================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path'), os = require('os'), vm = require('vm'), cp = require('child_process');

const RAIZ = path.join(__dirname, '..');
const SRC = path.join(RAIZ, 'dashboard', 'src');
const BUILD = path.join(RAIZ, 'dashboard', 'build', 'build.js');
const versao = JSON.parse(fs.readFileSync(path.join(SRC, 'versao.json'), 'utf8'));
const esqueleto = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
const lista = []; // arquivos citados nos marcadores @raw, na ordem
for (const m of esqueleto.matchAll(/<!--@raw\b([\s\S]*?)-->/g)) {
  for (const l of m[1].split('\n')) { const p = l.replace(/#.*$/, '').trim(); if (p) lista.push(p); }
}
const andar = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? andar(path.join(d, e.name)) : [path.join(d, e.name)]));

test('o HTML entregue em dashboard/ferramentas é exatamente o que o build produz do src', () => {
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'build-modular-')), 'saida.html');
  cp.execFileSync('node', [BUILD, '--saida', tmp], { stdio: 'pipe' });
  const entregue = path.join(RAIZ, 'dashboard', 'ferramentas', `${versao.nome}_v${versao.versao}.html`);
  assert.ok(fs.existsSync(entregue), 'falta o arquivo entregue: ' + path.relative(RAIZ, entregue) + ' (rode o build e copie para dashboard/ferramentas)');
  assert.equal(fs.readFileSync(tmp, 'utf8') === fs.readFileSync(entregue, 'utf8'), true,
    'o HTML entregue difere do build do src: regenere (node dashboard/build/build.js --saida ' + path.relative(RAIZ, entregue) + ')');
});

test('todo módulo citado existe e todo arquivo de src/js e src/css é citado no esqueleto', () => {
  const faltam = lista.filter(p => !fs.existsSync(path.join(SRC, p)));
  assert.deepEqual(faltam, [], 'citados no esqueleto mas inexistentes');
  const reais = andar(SRC).map(f => path.relative(SRC, f).split(path.sep).join('/')).filter(f => /^(js|css)\//.test(f));
  const citados = new Set(lista.map(p => path.normalize(p).split(path.sep).join('/')));
  assert.deepEqual(reais.filter(f => !citados.has(f)), [], 'arquivos em src sem uso (órfãos)');
  assert.equal(new Set(lista).size, lista.length, 'módulo citado duas vezes');
});

test('todo módulo JS é um trecho completo e válido (nenhum corte no meio de um comando)', () => {
  const ruins = [];
  for (const p of lista.filter(x => x.endsWith('.js'))) {
    try { new vm.Script(fs.readFileSync(path.join(SRC, p), 'utf8'), { filename: p }); } catch (e) { ruins.push(p + ': ' + e.message); }
  }
  assert.deepEqual(ruins, []);
});

test('o HTML final não traz marcador @@...@@ nem o marcador @raw', () => {
  const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'build-modular-')), 'saida.html');
  cp.execFileSync('node', [BUILD, '--saida', tmp], { stdio: 'pipe' });
  const h = fs.readFileSync(tmp, 'utf8');
  assert.ok(!/@@(VERSAO|DATA)@@/.test(h) && !h.includes('<!--@raw'));
  assert.ok(h.includes(`<meta name="app-version" content="${versao.versao}">`) && h.includes(`const VERSAO='${versao.versao}'`));
});
