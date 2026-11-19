'use strict';
/* =====================================================================================================================
   modulos_entregues.test.js — o codigo que os testes provam e o MESMO que vai no medidor (Passo 7, 19/11/2026).
   PARA QUE SERVE (leigo): os testes de propriedades e de mutacao rodam contra os arquivos de dashboard/modulos-fonte. O medidor entregue usa copias desses modulos dentro de
   dashboard/src/js. Se as duas copias divergirem, os testes passariam a provar um codigo que NAO e o que o operador usa. Este teste compara as duas, ignorando comentarios e espacos.
   COMO RODAR: node --test tests/modulos_entregues.test.js        (rapido, sem dependencias)
   COMO FUNCIONA (tecnico): um leitor simples tira comentarios de linha e de bloco respeitando strings e templates, tira os espacos e compara texto contra texto.
   NAO FAZ: nao executa nada; nao cobre comentarios (eles podem diferir).
   ===================================================================================================================== */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..');
const ler = p => fs.readFileSync(path.join(RAIZ, p), 'utf8');

function semComentarios(src) {
  let out = '', i = 0, est = 'cod', q = '';
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (est === 'cod') {
      if (c === '/' && n === '/') { est = 'lin'; i += 2; continue; }
      if (c === '/' && n === '*') { est = 'blo'; i += 2; continue; }
      if (c === '"' || c === "'" || c === '`') { est = 'str'; q = c; out += c; i++; continue; }
      out += c; i++;
    } else if (est === 'str') {
      out += c; if (c === '\\') { out += src[i + 1] || ''; i += 2; continue; } if (c === q) est = 'cod'; i++;
    } else if (est === 'lin') { if (c === '\n') { est = 'cod'; out += '\n'; } i++; }
    else { if (c === '*' && n === '/') { est = 'cod'; i += 2; out += ' '; continue; } i++; }
  }
  return out.replace(/\s+/g, '');                      // sem NENHUM espaco: `{}` e `{ }` (sobra de um comentario retirado) contam como iguais
}

const PARES = [
  ['dashboard/modulos-fonte/rodizio_chaves_v0.6.js', 'dashboard/src/js/01_rodizio_chaves.js'],
  ['dashboard/modulos-fonte/fbs_virtuais_v0.14.js', 'dashboard/src/js/principal/09_fbs_virtuais_mae.js'],
];
for (const [testado, entregue] of PARES) {
  test('o modulo testado ' + path.basename(testado) + ' e o mesmo codigo (sem comentarios) que o medidor entrega em ' + entregue, () => {
    const a = semComentarios(ler(testado)), b = semComentarios(ler(entregue));
    if (a !== b) { let i = 0; while (i < a.length && a[i] === b[i]) i++; assert.fail('divergem a partir do caractere ' + i + ':\n  testado : ...' + a.slice(Math.max(0, i - 60), i + 100) + '\n  entregue: ...' + b.slice(Math.max(0, i - 60), i + 100)); }
  });
}

test('os modulos usados direto pelo build (perfil de combustivel e decodificador de serie) sao exatamente os testados', () => {
  const esq = ler('dashboard/src/index.html');
  for (const m of ['fb_perfil_combustivel_v0.1.js', 'decodifica_serie_mwm_v0.3.js']) assert.ok(esq.includes('../modulos-fonte/' + m), m + ' deixou de ser usado pelo build direto de modulos-fonte');
});

test('os testes de propriedades e de mutacao apontam para os mesmos arquivos (sem versao antiga por engano)', () => {
  const t = {
    'tests/propriedades/rodizio_chaves.prop.test.js': 'rodizio_chaves_v0.6.js', 'tests/propriedades/fbs_virtuais.prop.test.js': 'fbs_virtuais_v0.14.js',
    'tests/propriedades/perfil_combustivel.prop.test.js': 'fb_perfil_combustivel_v0.1.js', 'tests/propriedades/decodifica_serie_mwm.prop.test.js': 'decodifica_serie_mwm_v0.3.js',
  };
  for (const [teste, modulo] of Object.entries(t)) assert.ok(ler(teste).includes(modulo), teste + ' deveria usar ' + modulo);
});
