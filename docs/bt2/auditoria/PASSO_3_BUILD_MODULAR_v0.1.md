# Passo 3: build modular do medidor (1.10.227) · 18/11/2026

Decisão do Reginaldo (18/11/2026): autorizado a partir da 1.10.226, com prova de equivalência e a bateria de testes como esteira.

## O que mudou
- O medidor deixa de ser editado como um arquivo único. Fica em `dashboard/src/` (esqueleto + 9 CSS + 40 módulos JS por assunto + módulos menores) e é **montado** por `dashboard/build/build.js` (v0.2).
- `dashboard/src/` antigo (1.10.126, desatualizado) foi para `dashboard/arquivo/src_index_v1.10.126.html` e `src_versao_v1.10.126.json`.
- `dashboard/ferramentas/medidor_gerador_v1.10.227.html` é **gerado** (não editar à mão). Catálogo regenerado.
- Nenhuma regra, tela ou rota mudou. A 1.10.227 só difere da 1.10.226 em 3 pontos: `<meta app-version>`, `const VERSAO` e o novo item do histórico.

## Prova de equivalência
1. `python3 dashboard/gerador/gerar_src_modular_v0.1.py --provar` recorta a 1.10.226, remonta com `versao 1.10.226` e compara:
   `840c51e140869d981dba956e56fbd8c9f765ca0f44af6da42bfc8dfdceb4ba52` (original) = `840c51e140869d981dba956e56fbd8c9f765ca0f44af6da42bfc8dfdceb4ba52` (remontado). **IDÊNTICO.**
2. Os 51 módulos JS parseiam sozinhos (os cortes caem em início de comando).
3. Diferença 226 → 227 (diff do HTML): só `app-version`, `VERSAO` e o item novo de `HISTORICO`.
4. Teste permanente `tests/build_modular.test.js` (4 testes): HTML entregue = build do `src`; sem órfãos; módulos válidos; sem `@@`.
5. Bateria completa contra a 1.10.227 (PLC simulado, igual à linha de base da 1.10.226): unitários **132/132**; integração **250 testes, 247 passam, 0 falham, 3 `todo`**; e2e **24 de 25** (única falha: `pacote_ia`, pendência já conhecida: menu com 6 itens contra 5 esperados e OCR). Nenhuma regressão.

## Mapa dos módulos do script principal (40)
Ver `dashboard/src/index.html` (cada linha tem um comentário) e `dashboard/src/LEIA-ME.md`.

## O que ainda NÃO foi resolvido (vai para o Passo 4)
1. **Cópias embutidas divergem de `dashboard/modulos-fonte/`.** Em `src/js/`, o texto que vai no HTML é a fonte de verdade. Comparando com os arquivos de `modulos-fonte/`: rodizio_chaves v0.2 tem 171 linhas diferentes, janelas v0.5 49, central_registros v0.4 37, dica_ui 33, pacote_ia v0.2 9, bancos_visiveis v0.2 6, api_cards e modo_operador 4. `modulos-fonte/` tem várias versões de cada módulo (v0.1 a v0.6). Decidir o que arquivar.
2. Dois trechos do script principal repetem módulos-fonte inteiros (`ficha_banco_v0.1`, linhas ~870-895 do script, e `robo_fase_rnc_v0.5`, ~7732-7819). Ficaram onde estavam (dentro de módulos maiores) para não mudar bytes.
3. **Os 72 scripts `dashboard/gerador/gerar_medidor_*`** (trocar texto sobre o HTML anterior) não servem mais para versões novas: arquivar.
4. O módulo `js/06_paginas_embutidas.js` (236 KB) é dado: páginas HTML embutidas como texto. Ideal gerar do `ferramentas/` no build (depois).
5. Os módulos grandes continuam grandes: `40_robo_operador_secreto` (1.121 linhas), `19_historico_de_versoes` (dado), `31_chaves_e_bancos_painel` (757, um único bloco de função imediata), `33_patamar_guiado` (589). Dividir exige mexer no código (Passo 4/5), não é só cortar.
6. Há `<script src>` para `catalogo_ferramentas.js` e `menu_dev_v0.3.js`: continuam (o HTML depende desses dois arquivos na mesma pasta, como na 1.10.226).

## Decisões para registrar (Obsidian)
- Fonte de verdade do medidor = `dashboard/src/` (a partir da 1.10.227). O `.html` em `ferramentas/` é produto gerado.
- Mudança só por módulo; versão nova = `versao.json` + item no topo do `HISTORICO` + build + catálogo + testes.
- Módulos são colados sem alterar caracteres; equivalência provada por SHA-256 e por teste permanente.
- Cortes por assunto, só em início de comando; sem refatorar lógica neste passo.
