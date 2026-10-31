#!/usr/bin/env node
/* Monta o HTML único do dashboard.
   Entrada : dashboard/src/index.html + dashboard/src/versao.json
   Marcador: <!-- @inline: caminho/relativo.js --> -> vira <script>…</script>
             <!-- @inline: caminho/relativo.css --> -> vira <style>…</style>
   Token   : @@VERSAO@@ -> versão de versao.json
   Saída   : dashboard/dist/<nome>_v<versao>.html (um arquivo, sem <script src>)
   Uso     : node dashboard/build/build.js [--expect-version X.Y.Z]  (falha se a tag não bater com versao.json) */
const fs = require('fs'), path = require('path');
const SRC = path.join(__dirname, '..', 'src'), DIST = path.join(__dirname, '..', 'dist');
const v = JSON.parse(fs.readFileSync(path.join(SRC, 'versao.json'), 'utf8'));
const i = process.argv.indexOf('--expect-version');
if (i > -1 && process.argv[i + 1] !== v.versao) {
  console.error(`Versão da tag (${process.argv[i + 1]}) difere de versao.json (${v.versao}).`); process.exit(1);
}
let html = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
html = html.replace(/<!--\s*@inline:\s*([^\s]+)\s*-->/g, (_, rel) => {
  const f = path.join(SRC, rel);
  if (!fs.existsSync(f)) { console.error('Módulo não encontrado: ' + rel); process.exit(1); }
  const txt = fs.readFileSync(f, 'utf8').replace(/<\/(script|style)/gi, '<\\/$1'); // evita fechar a tag no meio do código
  return rel.endsWith('.css') ? `<style>\n${txt}\n</style>` : `<script>\n${txt}\n</script>`;
}).replace(/@@VERSAO@@/g, v.versao);
if (/<script[^>]+src=/i.test(html)) console.warn('Aviso: há <script src> — o HTML não ficará 100% autocontido.');
fs.mkdirSync(DIST, { recursive: true });
const out = path.join(DIST, `${v.nome}_v${v.versao}.html`);
fs.writeFileSync(out, html);
console.log('Gerado: ' + path.relative(process.cwd(), out) + ' (' + html.length + ' bytes)');
