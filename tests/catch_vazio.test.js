'use strict';
/* =====================================================================================================================
   catch_vazio.test.js — nenhum `catch` VAZIO sem motivo no medidor (Passo 5 · B4, 19/11/2026).
   PARA QUE SERVE (leigo): um erro engolido em silêncio é perigoso numa tela que comanda carga. Depois da triagem (B3), todo `catch(e){}` que sobrou
   tem um comentário "ignorado: motivo" dentro do bloco. Este teste barra qualquer `catch` vazio NOVO: quem precisar ignorar um erro tem que escrever o motivo
   (ou, melhor, avisar o operador / registrar no log).
   COMO FUNCIONA (técnico): varre dashboard/src/js (exceto o dado embutido 06_paginas_embutidas.js) procurando catch com bloco sem nenhum caractere. Os módulos
   de dashboard/modulos-fonte usados direto pelo build são VERSIONADOS e ainda têm alguns catch vazios antigos: a contagem de cada um fica travada abaixo
   (a versão nova do módulo traz o comentário e o número cai).
   COMO RODAR: node --test tests/catch_vazio.test.js        (rápido, sem navegador)
   ===================================================================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..', 'dashboard', 'src');
const VAZIO = /catch\s*(?:\([^)]*\))?\s*\{\s*\}/g;
const andar = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => (e.isDirectory() ? andar(path.join(d, e.name)) : [path.join(d, e.name)]));
const linhaDe = (s, i) => s.slice(0, i).split('\n').length;

test('nenhum catch vazio sem motivo em dashboard/src/js', () => {
  const achados = [];
  for (const f of andar(path.join(SRC, 'js')).filter(x => x.endsWith('.js') && !x.includes('06_paginas_embutidas'))) {
    const s = fs.readFileSync(f, 'utf8');
    for (const m of s.matchAll(VAZIO)) achados.push(path.relative(SRC, f) + ':' + linhaDe(s, m.index));
  }
  assert.deepEqual(achados, [], 'catch vazio sem motivo (escreva "/* ignorado: motivo */" dentro do bloco, ou trate o erro):\n  ' + achados.join('\n  '));
});

test('os módulos-fonte usados direto pelo build não ganham catch vazio novo (contagem travada)', () => {
  const esperado = { 'rnc_defeito_v0.4.js': 2, 'dados_ensaio_ns_v0.2.js': 3, 'fb_perfil_combustivel_v0.1.js': 0, 'decodifica_serie_mwm_v0.3.js': 0 };
  for (const [nome, n] of Object.entries(esperado)) {
    const s = fs.readFileSync(path.join(SRC, '..', 'modulos-fonte', nome), 'utf8');
    assert.equal([...s.matchAll(VAZIO)].length, n, nome + ': a contagem de catch vazios mudou');
  }
  const esqueleto = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  for (const nome of Object.keys(esperado)) assert.ok(esqueleto.includes('../modulos-fonte/' + nome), nome + ' deixou de ser usado: atualize este teste');
});

test('o motor de alarmes e o desarmar da mãe não engolem erro (viram SIS-001 / log de erro)', () => {
  const al = fs.readFileSync(path.join(SRC, 'js', 'principal', '36_ocorrencias_e_alarmes.js'), 'utf8');
  assert.equal([...al.matchAll(/try\{varre\(\)\}catch\(x\)\{sis\(/g)].length, 2, 'varre() deve reportar a falha via sis() nos 2 pontos');
  const pg = fs.readFileSync(path.join(SRC, 'js', 'principal', '33_patamar_guiado.js'), 'utf8');
  assert.equal([...pg.matchAll(/catch\(x\)\{maeFalhaDesarmar\(x\)\}/g)].length, 2, 'mae.desarma deve reportar a falha nos 2 pontos');
});
