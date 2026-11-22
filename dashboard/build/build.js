#!/usr/bin/env node
/* =====================================================================================================================
   build.js v0.2 — monta o HTML único (autônomo) do medidor a partir de dashboard/src/.
   v0.2 (18/11/2026): acrescenta o marcador @raw (cola o texto dos módulos SEM alterar nenhum byte), o token @@DATA@@
                      e a opção --saida. O comportamento da v0.1 (marcador @inline e token @@VERSAO@@) continua igual.

   PARA QUE SERVE (leigo): a tela do operador é UM arquivo .html. Para a gente conseguir ler e revisar o código, ele
   fica dividido em pedaços pequenos (um assunto por arquivo) dentro de dashboard/src/. Este script cola os pedaços
   na ordem certa e entrega o arquivo único, igual ao que o operador sempre recebeu.

   ENTRADA : dashboard/src/index.html (esqueleto) + dashboard/src/versao.json  { "nome", "versao", "data" }
   MARCADORES NO ESQUELETO
     <!-- @inline: caminho.js|.css -->   v0.1: vira <script>…</script> ou <style>…</style> (adiciona quebras de linha e
                                        protege "</script" dentro do texto). Mantido por compatibilidade.
     <!--@raw  caminho1  # comentário    v0.2: troca o marcador pelo TEXTO EXATO dos arquivos listados, um por linha,
              caminho2 ... -->          na ordem escrita. As tags <script>/<style> ficam no esqueleto. O texto "# ..."
                                        no fim da linha é só comentário. Caminhos são relativos a dashboard/src/.
   TOKENS   : @@VERSAO@@ -> versao.json "versao"   |   @@DATA@@ -> versao.json "data" (dd/mm/aaaa)
   SAÍDA    : dashboard/dist/<nome>_v<versao>.html   (ou o arquivo dado em --saida)
   USO      : node dashboard/build/build.js [--expect-version X.Y.Z] [--saida caminho.html]
              --expect-version : falha se a tag do Git não bater com versao.json (usado no CI)
   NÃO FAZ  : não lê PLC, DSE nem Node-RED; não altera nada em dashboard/src/.
   ===================================================================================================================== */
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..', 'src'), DIST = path.join(__dirname, '..', 'dist');
const v = JSON.parse(fs.readFileSync(path.join(SRC, 'versao.json'), 'utf8'));
const arg = nome => { const i = process.argv.indexOf(nome); return i > -1 ? process.argv[i + 1] : undefined; };
const esperada = arg('--expect-version');
if (esperada !== undefined && esperada !== v.versao) {
  console.error(`Versão da tag (${esperada}) difere de versao.json (${v.versao}).`); process.exit(1);
}
const lerModulo = rel => {
  const f = path.join(SRC, rel);
  if (!fs.existsSync(f)) { console.error('Módulo não encontrado: ' + rel); process.exit(1); }
  return fs.readFileSync(f, 'utf8');
};
let html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
// v0.2: @raw — texto exato, na ordem da lista (a lista é também o "sumário" dos módulos)
html = html.replace(/<!--@raw\b([\s\S]*?)-->/g, (_, lista) =>
  lista.split('\n').map(l => l.replace(/#.*$/, '').trim()).filter(Boolean).map(lerModulo).join(''));
// v0.1: @inline — mantido
html = html.replace(/<!--\s*@inline:\s*([^\s]+)\s*-->/g, (_, rel) => {
  const txt = lerModulo(rel).replace(/<\/(script|style)/gi, '<\\/$1'); // evita fechar a tag no meio do código
  return rel.endsWith('.css') ? `<style>\n${txt}\n</style>` : `<script>\n${txt}\n</script>`;
});
html = html.replace(/@@VERSAO@@/g, v.versao).replace(/@@DATA@@/g, v.data || '');
if (/@@(VERSAO|DATA)@@/.test(html)) { console.error('Ficou token sem trocar no HTML final.'); process.exit(1); }
if (/<script[^>]+src=/i.test(html)) console.warn('Aviso: há <script src> — o HTML não ficará 100% autocontido.');
const out = arg('--saida') ? path.resolve(arg('--saida')) : path.join(DIST, `${v.nome}_v${v.versao}.html`);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('Gerado: ' + path.relative(process.cwd(), out) + ' (' + html.length + ' caracteres)');
