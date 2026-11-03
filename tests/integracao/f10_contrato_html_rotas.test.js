'use strict';
// F10 - Contrato HTML <-> rotas: toda rota que o medidor chama existe em algum fluxo de producao (estatico, sem subir o Node-RED).
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..', '..');
const HTML = path.join(RAIZ, 'dashboard', 'ferramentas', 'medidor_gerador_v1.10.167.html');
const FLUXOS = path.join(RAIZ, 'nodered', 'flows', 'bt2');
const ARQ_FLUXOS = ['chaves-56-api-v3.0', 'chaves-400-api-v3.0', 'chaves-550-api-v1.1', 'chaves-595-api-v1.1', 'cliente-156-dse-plc-carga-v2', 'cliente-31-seletor-plc-db2000-v3', 'registro-ensaio-db2100-api-v1.5', 'simulador-dse-demo-v5', 'dev-logs-api-v1.1', 'servidor-deepsea-api-gerador-v3_6'];

function rotasDosFluxos() {
  const rotas = [];
  for (const a of ARQ_FLUXOS) for (const n of JSON.parse(fs.readFileSync(path.join(FLUXOS, a + '.json'), 'utf8'))) {
    if (n.type === 'http in') rotas.push({ metodo: String(n.method).toUpperCase(), url: n.url, arq: a });
  }
  return rotas;
}
const normaliza = u => u.replace(/\/(56|400|550|595)(?=\/|$)/, '/{banco}');

describe('F10 contrato HTML <-> rotas do Node-RED', () => {
  const html = fs.readFileSync(HTML, 'utf8');
  const rotas = rotasDosFluxos();

  test('caminhos de API que o HTML usa existem em algum fluxo', () => {
    // literais que comecam com /api/ (prefixo ate a primeira aspa, crase ou sinal de +)
    const prefixos = new Set([...html.matchAll(/['"`](\/api\/[^'"`+]*)/g)].map(m => m[1]));
    assert.ok(prefixos.size > 5, 'a varredura do HTML achou poucos caminhos (' + prefixos.size + ')');
    const faltando = [];
    for (const p of prefixos) {
      const ok = rotas.some(r => normaliza(r.url).startsWith(p.replace(/\/$/, '')) || normaliza(r.url) === p);
      if (!ok) faltando.push(p);
    }
    assert.deepEqual(faltando, [], 'o HTML chama caminhos que nenhum fluxo atende');
  });

  test('cada acao do banco que o HTML chama (rotaCh) existe no fluxo de chaves', () => {
    const acoes = new Set([...html.matchAll(/rotaCh\([^,]+,\s*'(\w+)'\)/g)].map(m => m[1]));
    assert.ok(acoes.size >= 5, 'poucas acoes achadas: ' + [...acoes]);
    const doBanco = new Set(rotas.filter(r => /^\/api\/chaves\/\d+\/\w+$/.test(r.url) || /^\/api\/chaves\/\d+\/\w+$/.test(r.url.replace(/\{.*\}/, '56'))).map(r => r.url.split('/').pop()));
    const faltando = [...acoes].filter(a => !doBanco.has(a));
    assert.deepEqual(faltando, [], 'acoes chamadas pelo HTML sem rota no fluxo de chaves');
  });

  test('o HTML so usa os ids de banco que existem na ficha (56, 400, 595, 550)', () => {
    const ids = new Set([...html.matchAll(/rotaDe\(\w+\)|id:'([\d,.]+)'/g)].map(m => m[1]).filter(Boolean));
    const ficha = new Set(['56', '400', '59,5', '550']);
    for (const i of ids) assert.ok(ficha.has(i), 'id de banco fora da ficha: ' + i);
  });
});
