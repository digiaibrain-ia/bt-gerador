# dashboard/src — código-fonte do medidor (modular)

A partir da **1.10.227** o medidor é **montado** por `dashboard/build/build.js` a partir desta pasta. Antes, o arquivo `.html` (13 mil linhas) era ao mesmo tempo o produto e o código-fonte.

## Estrutura
| Caminho | O que é |
|---|---|
| `index.html` | Esqueleto: o HTML da tela, com a **lista dos módulos** de cada `<script>` e `<style>` (marcador `<!--@raw ... -->`, uma linha por arquivo, com um comentário do que faz). É o sumário. |
| `css/` | 9 arquivos de estilo, na ordem em que valem (o de layout por tamanho de tela fica por último). |
| `js/principal/` | 40 módulos do script principal, por assunto (`01_ensaio...` a `40_robo...`). A ordem do número é a ordem de carga. |
| `js/*.js` | Módulos menores que vinham colados no HTML (rodízio de chaves, API dos cards, janelas, Pacote para a IA, Central de registros, etc.). |
| `versao.json` | `nome`, `versao` e `data`. O build troca `@@VERSAO@@` e `@@DATA@@` no HTML e em `js/principal/18_versao.js`. |
| `../modulos-fonte/` | 4 módulos (`rnc_defeito`, `fb_perfil_combustivel`, `decodifica_serie_mwm`, `dados_ensaio_ns`) são usados direto daqui (uma fonte só). |

## Como trabalhar
1. Edite o módulo do assunto (ex.: alarmes = `js/principal/36_ocorrencias_e_alarmes.js`). Nunca edite o `.html` gerado.
2. Para uma versão nova: mude `versao.json` e acrescente o item **no topo** de `HISTORICO` em `js/principal/19_historico_de_versoes.js`.
3. Gere: `node dashboard/build/build.js --saida dashboard/ferramentas/medidor_gerador_v<versao>.html`
4. Gere o catálogo (`python3 dashboard/gerador/gerar_catalogo_auto_v0.2.2.py`) e rode os testes (`node --test tests/build_modular.test.js` primeiro).

## O que o teste `tests/build_modular.test.js` garante
O HTML entregue em `dashboard/ferramentas/` é idêntico ao build do `src`; nenhum arquivo órfão; nenhum módulo cortado no meio de um comando; nenhum `@@` sobrando.

## Cuidados
- **Não** coloque `</script>` dentro de um módulo JS (feche a tag só no esqueleto). Em strings, use `<\/script>`.
- Os módulos são colados **sem alterar nenhum caractere**; todos compartilham o mesmo escopo global (como antes). Mudar a ordem no esqueleto muda a ordem de carga.
- Os scripts `dashboard/gerador/gerar_medidor_v1.10.NNN*.py` (trocas de texto sobre o HTML anterior) **não valem mais** para versões novas. Ver `docs/bt2/auditoria/PASSO_3_BUILD_MODULAR_v0.1.md`.
