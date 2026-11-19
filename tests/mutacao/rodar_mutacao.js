#!/usr/bin/env node
/* =====================================================================================================================
   rodar_mutacao.js — TESTE DE MUTACAO (Stryker) dos modulos puros do medidor · Passo 7 · 19/11/2026.
   PARA QUE SERVE (leigo): um teste que passa nao prova que o teste e BOM. O teste de mutacao estraga o codigo de proposito (troca > por >=, apaga uma linha, inverte um if)
   milhares de vezes e conta quantas vezes ALGUM teste percebe. "Mutante sobrevivente" = o codigo foi estragado e todos os testes continuaram verdes: ha um buraco na prova.
   COMO RODAR:  npm --prefix tests/mutacao ci && npm --prefix tests/propriedades ci
                node tests/mutacao/rodar_mutacao.js [perfil|serie|fbv|rodizio|todos]        (leva de 1 a 6 minutos por modulo; NAO roda no CI)
                relatorio JSON em tests/mutacao/relatorios/<modulo>.json (fora do Git)
   O QUE MEDE: so a logica de decisao (FBV: sem o texto/estado dos filhos do mapa) e so mutantes que nao sao texto de mensagem (StringLiteral ignorado).
   NOTAS: (1) o codigo instrumentado e ~40x mais lento: a GUARDA e o plano do rodizio sao medidos com os testes rapidos; os testes de tempo (orcamento de 1 s) ficam de fora.
          (2) modulos carregados por vm precisam receber `process` no contexto (o Stryker liga o mutante ativo por process.env); os testes ja fazem isso.
   ===================================================================================================================== */
const { spawnSync } = require('child_process');
const fs = require('fs'), path = require('path');
const RAIZ = path.join(__dirname, '..', '..');
const NP = path.join(RAIZ, 'tests', 'propriedades', 'node_modules'), REL = path.join(__dirname, 'relatorios');
const NT = 'NODE_PATH=' + NP + ' node --test --test-timeout=280000';
const MODULOS = {
  perfil:   { mutate: ['dashboard/modulos-fonte/fb_perfil_combustivel_v0.1.js'], teste: 'tests/fb/perfil_combustivel.test.js tests/propriedades/perfil_combustivel.prop.test.js' },
  serie:    { mutate: ['dashboard/modulos-fonte/decodifica_serie_mwm_v0.3.js'], teste: 'tests/serie/decodifica_serie_mwm_v0.3.test.js tests/propriedades/decodifica_serie_mwm.prop.test.js' },
  fbv:      { mutate: ['dashboard/modulos-fonte/fbs_virtuais_v0.14.js:59-72', 'dashboard/modulos-fonte/fbs_virtuais_v0.14.js:101-203'], teste: 'tests/fb/fbs_virtuais.test.js tests/propriedades/fbs_virtuais.prop.test.js' },
  rodizio:  { mutate: ['dashboard/modulos-fonte/rodizio_chaves_v0.6.js:267-358'], teste: '--test-name-pattern="guarda|A1|A5|planoEntrada|borda|limiteKw|podeLigar|picoPlano|registraUso" tests/fb/rodizio_chaves.test.js tests/propriedades/rodizio_chaves.prop.test.js' },
};
const alvo = process.argv[2] || 'todos', lista = alvo === 'todos' ? Object.keys(MODULOS) : [alvo];
fs.mkdirSync(REL, { recursive: true });
const bin = path.join(__dirname, 'node_modules', '.bin', 'stryker');
if (!fs.existsSync(bin)) { console.error('Stryker nao instalado: npm --prefix tests/mutacao ci'); process.exit(2); }
for (const k of lista) {
  const m = MODULOS[k]; if (!m) { console.error('modulo desconhecido: ' + k); process.exit(2); }
  const conf = path.join(REL, k + '.stryker.json');
  fs.writeFileSync(conf, JSON.stringify({ testRunner: 'command', commandRunner: { command: NT + ' ' + m.teste }, mutate: m.mutate, coverageAnalysis: 'off', reporters: ['json', 'clear-text'],
    jsonReporter: { fileName: path.join(REL, k + '.json') }, mutator: { excludedMutations: ['StringLiteral'] }, concurrency: 4, timeoutMS: 250000, timeoutFactor: 2, cleanTempDir: true,
    ignorePatterns: ['node_modules', '.git', 'dashboard/ferramentas', 'dashboard/pacotes', 'dashboard/arquivo', 'docs', 'plc', 'tests/integracao/runtime', 'tests/fixtures', 'tests/mutacao/relatorios'] }, null, 1));
  console.log('\n=== ' + k + ' ===');
  const r = spawnSync(bin, ['run', conf], { cwd: RAIZ, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
}
