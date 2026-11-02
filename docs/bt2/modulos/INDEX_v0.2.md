# index.html v0.2 (29/10/2026) — por que mostrava ✗ e o que mudou
- **Causa provável (não confirmada no PC do banco):** o v0.1 só procurava cada arquivo na **mesma pasta do index** (aqui `/html/`). Se os arquivos estão na raiz `public` (ou em outra subpasta), tudo aparece ✗.
- **v0.2:** procura em 3 lugares (pasta do index, raiz do servidor, `/html/`), abre o arquivo onde achar, e quando não acha mostra **os endereços exatos que tentou**. Confere também os `.js` de apoio (`catalogo_ferramentas_v0.1.js`, `menu_dev_v0.1.js`) e avisa se faltam. Botão **Ajuda** com o passo a passo.
- Pasta pública do Node-RED no PC do banco (settings.js enviado): `C:\Users\b02raf\.node-red\public`; subpasta `html` = `/html/`.
- O catálogo perdeu o Simulador do rodízio e o Painel BT2 (sem função no projeto) e ganhou o campo `apoio`.
- Teste (Playwright, servidor com index em `/html/` e arquivos na raiz): ✓ com "aberto de /", ✗ com lista de endereços, Ajuda abre.
