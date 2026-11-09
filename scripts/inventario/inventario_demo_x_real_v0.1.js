#!/usr/bin/env node
/* =====================================================================================================================
   inventario_demo_x_real_v0.1.js — INVENTÁRIO DAS BIFURCAÇÕES DEMO × REAL do medidor (08/11/2026)
   PARA QUE SERVE (leigo): o medidor tem um simulador (Demo) dentro dele. Cada vez que o código "pergunta" em qual modo está (Demo local, Demo + PLC, Real)
   e muda o comportamento, existe um risco: o Demo aprovar o que a bancada reprova (ex.: Setup/Salvar). Este script acha todos esses pontos, classifica o risco
   e, a cada versão nova, AVISA o que apareceu ou sumiu em relação à versão anterior.
   COMO USAR:
     node scripts/inventario/inventario_demo_x_real_v0.1.js <medidor.html>                       → imprime o relatório
     node ... <medidor.html> --md docs/licoes/INVENTARIO_AUTO.md --json inv.json                 → grava Markdown e JSON
     node ... <medidor.html> --baseline docs/licoes/inventario_base.json                         → compara com a base e AVISA (saída 2 se houver ponto ALTO novo)
     node ... <medidor.html> --grava-baseline docs/licoes/inventario_base.json                   → grava a base desta versão
   O QUE FAZ (técnico): procura por padrões de teste de modo (lista PADROES), acha a função que envolve cada ocorrência (heurística por texto: 'function x(' / 'const x=' / '$('id').onclick'),
   classifica por palavras de efeito (ALTO = muda ação/dado/trava; BAIXO = só rótulo/nome de arquivo) e identifica cada ponto por uma ASSINATURA estável (função + trecho normalizado),
   que não muda quando só o número da linha muda.
   O QUE NÃO FAZ: não executa o HTML, não prova que o comportamento está certo, não enxerga o que NÃO está no código (requisito esquecido, condição só do equipamento real).
   A classificação é uma SUSPEITA por heurística: quem decide é o Reginaldo/a bancada. Valores e palavras-chave abaixo: ASSUMIDO — a confirmar.
   ===================================================================================================================== */
'use strict';
const fs = require('fs');
const crypto = require('crypto');

/* ---------- parâmetros num lugar só (ASSUMIDO — a confirmar) ---------- */
// Padrões que indicam "o código pergunta o modo". Cada um com um nome curto para o relatório.
const PADROES = [
  { id: 'demo.checked', re: /\$\('demo'\)\s*\.checked|\$\("demo"\)\s*\.checked|\$\('demo'\)\s*&&\s*\$\('demo'\)\.checked/g },
  { id: 'modoSim()', re: /\bmodoSim\(\)/g },
  { id: 'srvChave()', re: /\bsrvChave\(\)/g },
  { id: 'demoOn()', re: /\bdemoOn\(\)/g },
  { id: 'SRVM.plc', re: /\bSRVM\.plc\b/g },
  { id: 'srvUsaPlc()', re: /\bsrvUsaPlc\(\)/g },
  { id: 'chPlcAtivo()', re: /\bchPlcAtivo\(\)/g },
  { id: "=== 'demoLocal'/'demoPlc'", re: /['"]demo(Local|Plc)['"]/g },
  { id: 'bkEhDemoLocal', re: /\bbkEhDemoLocal\b/g },
  { id: 'tensFeat()', re: /\btensFeat\(/g },
];
// Palavras que, na MESMA linha, indicam que o ponto muda uma AÇÃO, um DADO ou uma TRAVA (risco ALTO).
const EFEITO = /\b(return\b|disabled|onclick|\.click\(|fetch\(|chFetch|POST|SIM\.|bancoSim|demoData|KW_NOM|setVel|=\s*true\b|=\s*false\b|\?\s*[^:]+:|msgGer|confirm\(|alert\()/;
// Palavras que indicam só RÓTULO / NOME DE ARQUIVO (risco BAIXO) quando NÃO há palavra de efeito.
const ROTULO = /(DEMO|REAL|SIMULA|\[DEMO\]|pg\.t\(|textContent|title|tit\b|prefixo|imprimeComNome|nomeBase|stamp|\.push\(|L\.push|' · |Gerado em|Origem:)/;

/* ---------- leitura do HTML ---------- */
function lerLinhas(arq) { return fs.readFileSync(arq, 'utf8').split('\n'); }

// Acha o nome da função que envolve a linha i: sobe até uma declaração conhecida.
function funcaoDe(L, i) {
  const DECL = [
    /function\s+([A-Za-z0-9_$]+)\s*\(/, /(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z0-9_$]+)\s*=>/,
    /\$\('([A-Za-z0-9_]+)'\)\.on(?:click|change|input)\s*=/, /\$\('([A-Za-z0-9_]+)'\)\.addEventListener\('([a-z]+)'/,
    /window\.([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?function/, /(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*function/,
  ];
  for (let k = i; k >= Math.max(0, i - 120); k--) {
    for (const d of DECL) { const m = d.exec(L[k]); if (m) return m[1] + (m[2] ? '.' + m[2] : ''); }
  }
  return '(raiz)';
}
const norm = s => s.replace(/\s+/g, ' ').replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '').trim().slice(0, 140);

/* ---------- varredura ---------- */
function varre(arq) {
  const L = lerLinhas(arq), pontos = [];
  // ignora o miolo de HTML embutido (window.EMB = {...}) e linhas gigantes: não são código de decisão do medidor
  L.forEach((lin, i) => {
    if (lin.length > 4000 || /^window\.EMB\s*=/.test(lin)) return;
    for (const p of PADROES) {
      p.re.lastIndex = 0;
      if (p.re.test(lin)) {
        const trecho = norm(lin), fn = funcaoDe(L, i);
        const efeito = EFEITO.test(lin), rotulo = ROTULO.test(lin);
        const risco = efeito && !(rotulo && !/\b(return\b|disabled|onclick|fetch\(|chFetch|POST|SIM\.|bancoSim|demoData|KW_NOM|setVel)/.test(lin)) ? 'ALTO' : (rotulo ? 'BAIXO' : 'MEDIO');
        const assinatura = crypto.createHash('sha1').update(fn + '|' + p.id + '|' + trecho).digest('hex').slice(0, 10);
        pontos.push({ linha: i + 1, padrao: p.id, funcao: fn, risco, trecho, assinatura });
        break; // uma linha conta uma vez
      }
    }
  });
  return pontos;
}

/* ---------- comparação com a base ---------- */
function compara(atual, base) {
  const a = new Map(atual.map(p => [p.assinatura, p])), b = new Map(base.pontos.map(p => [p.assinatura, p]));
  return { novos: atual.filter(p => !b.has(p.assinatura)), sumiram: base.pontos.filter(p => !a.has(p.assinatura)) };
}

/* ---------- relatório ---------- */
function relatorio(arq, pontos, cmp, baseNome) {
  const cont = r => pontos.filter(p => p.risco === r).length, porFn = new Map();
  pontos.forEach(p => { const k = p.funcao; (porFn.get(k) || porFn.set(k, []).get(k)).push(p); });
  const o = [];
  o.push('# Inventário Demo × Real (gerado por script)', '', `- Arquivo: \`${arq}\``, `- Gerado em: ${new Date().toISOString()}`, `- Pontos: **${pontos.length}** (ALTO ${cont('ALTO')} · MÉDIO ${cont('MEDIO')} · BAIXO ${cont('BAIXO')})`, '- Classificação por heurística (**suspeita**, não veredito). O script não executa o HTML nem enxerga o que não está no código.', '');
  if (cmp) {
    o.push(`## Mudanças desde a base (\`${baseNome}\`)`, '', `- **Novos: ${cmp.novos.length}** · Sumiram: ${cmp.sumiram.length}`, '');
    cmp.novos.forEach(p => o.push(`- ➕ [${p.risco}] \`${p.funcao}\` (linha ${p.linha}, ${p.padrao}): \`${p.trecho}\``));
    cmp.sumiram.forEach(p => o.push(`- ➖ [${p.risco}] \`${p.funcao}\` (${p.padrao}): \`${p.trecho}\``));
    o.push('');
  }
  o.push('## Pontos de risco ALTO (cada um merece teste Demo local × Demo + PLC)', '', '| Linha | Função | Padrão | Trecho |', '|---|---|---|---|');
  pontos.filter(p => p.risco === 'ALTO').forEach(p => o.push(`| ${p.linha} | \`${p.funcao}\` | ${p.padrao} | \`${p.trecho.replace(/\|/g, '\\|')}\` |`));
  o.push('', '## Por função (mais bifurcações primeiro)', '', '| Função | Pontos | ALTO |', '|---|---|---|');
  [...porFn.entries()].sort((x, y) => y[1].length - x[1].length).slice(0, 25).forEach(([f, ps]) => o.push(`| \`${f}\` | ${ps.length} | ${ps.filter(p => p.risco === 'ALTO').length} |`));
  o.push('', '## Pontos de risco MÉDIO e BAIXO', '', `MÉDIO: ${cont('MEDIO')} · BAIXO: ${cont('BAIXO')} (veja o JSON para a lista completa).`);
  return o.join('\n') + '\n';
}

/* ---------- linha de comando ---------- */
function main() {
  const args = process.argv.slice(2), arq = args.find(a => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'));
  const opt = n => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : null; };
  if (!arq || !fs.existsSync(arq)) { console.error('uso: node inventario_demo_x_real_v0.1.js <medidor.html> [--md f] [--json f] [--baseline f] [--grava-baseline f]'); process.exit(1); }
  const pontos = varre(arq);
  let cmp = null, baseNome = opt('baseline');
  if (baseNome) { if (!fs.existsSync(baseNome)) { console.error('base não encontrada: ' + baseNome); process.exit(1); } cmp = compara(pontos, JSON.parse(fs.readFileSync(baseNome, 'utf8'))); }
  const md = relatorio(arq, pontos, cmp, baseNome);
  if (opt('md')) fs.writeFileSync(opt('md'), md);
  const dados = { arquivo: arq, geradoEm: new Date().toISOString(), total: pontos.length, pontos };
  if (opt('json')) fs.writeFileSync(opt('json'), JSON.stringify(dados, null, 1));
  if (opt('grava-baseline')) fs.writeFileSync(opt('grava-baseline'), JSON.stringify(dados, null, 1));
  console.log(md.split('\n').slice(0, 14).join('\n'));
  if (cmp) { console.log(`\nMUDANÇAS: +${cmp.novos.length} / -${cmp.sumiram.length}`); if (cmp.novos.some(p => p.risco === 'ALTO')) { console.log('⚠ há ponto ALTO NOVO: precisa de teste Demo × Real antes de entregar.'); process.exit(2); } }
}
if (require.main === module) main();
module.exports = { varre, compara, PADROES };
