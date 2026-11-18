'use strict';
/* =====================================================================================================================
   tests/versoes.js — resolve QUAL versão de medidor/fluxo/ferramenta os testes usam (Passo 5 · A2/A3, 18/11/2026).

   PARA QUE SERVE (leigo): antes, cada teste tinha escrito o nome de uma versão antiga (ex.: medidor 1.10.176), o que impedia
   arquivar versões velhas. Agora: (1) por padrão o teste usa a versão MAIS NOVA que está na pasta de entrega;
   (2) só os poucos testes de "contra-prova" (que precisam provar que uma versão ANTIGA falha) leem a cópia guardada em
   tests/fixtures/. Quem quiser provar contra outra versão continua podendo (variáveis BT2_FASE4_HTML, BT2_MED, MEDIDOR).

   COMO FUNCIONA (técnico): medidorAtual() = maior medidor_gerador_v1.10.N.html em dashboard/ferramentas.
   caminhoFluxo(nome) procura primeiro em nodered/flows/bt2 e depois em tests/fixtures/fluxos.
   caminhoFerramenta(nome) procura em dashboard/ferramentas e depois em tests/fixtures/ferramentas.
   NÃO FAZ: não abre arquivo (só resolve caminhos), não depende de Node-RED nem de navegador.
   ===================================================================================================================== */
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..');
const FERRAMENTAS = path.join(RAIZ, 'dashboard', 'ferramentas');
const FLUXOS = path.join(RAIZ, 'nodered', 'flows', 'bt2');
const FIXTURES = path.join(__dirname, 'fixtures');
const num = s => s.split('.').map(Number);
const maior = (a, b) => { const x = num(a), y = num(b); for (let i = 0; i < Math.max(x.length, y.length); i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); return 0; };

/** Nome do medidor mais novo em dashboard/ferramentas (ex.: 'medidor_gerador_v1.10.228.html'). */
function medidorAtual() {
  const l = fs.readdirSync(FERRAMENTAS).map(f => /^medidor_gerador_v(1\.10\.\d+)\.html$/.exec(f)).filter(Boolean).sort((a, b) => maior(a[1], b[1]));
  if (!l.length) throw new Error('nenhum medidor_gerador_v1.10.N.html em dashboard/ferramentas');
  return l[l.length - 1][0];
}
const achar = (nome, dirs) => { for (const d of dirs) { const f = path.join(d, nome); if (fs.existsSync(f)) return f; } throw new Error('não achei ' + nome + ' em: ' + dirs.join(' | ')); };
/** Caminho completo de um fluxo (nome sem .json): pasta ativa primeiro, depois tests/fixtures/fluxos. */
const caminhoFluxo = nome => achar(nome + '.json', [FLUXOS, path.join(FIXTURES, 'fluxos')]);
/** Caminho completo de uma ferramenta (ex.: 'medidor_gerador_v1.10.176.html'): pasta ativa primeiro, depois tests/fixtures/ferramentas. */
const caminhoFerramenta = nome => achar(nome, [FERRAMENTAS, path.join(FIXTURES, 'ferramentas')]);
module.exports = { medidorAtual, caminhoFluxo, caminhoFerramenta, FERRAMENTAS, FLUXOS, FIXTURES };
