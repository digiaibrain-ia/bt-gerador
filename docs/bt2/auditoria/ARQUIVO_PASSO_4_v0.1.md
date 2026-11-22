# Passo 4: arquivar código legado (18/11/2026)

Decisão do Reginaldo (18/11/2026): autorizado mover versões antigas para `arquivo/` (o histórico completo continua no Git).

## Regra usada
Só se move um arquivo se **todas** as condições valerem:
1. não é a versão mais nova da sua família;
2. **nenhum** teste, script ativo (pacote v1.26, catálogo v0.2.2, `gerar_src_modular`), CI (`.github`), build, `dashboard/src` ou `CLAUDE.md`/`README.md` o cita pelo nome.
Foi feito com `git mv` (cada arquivo mantém o histórico; para voltar, `git mv` de volta ou `git log --follow`).

## O que foi movido (130 arquivos)
| De | Para | Arquivos |
|---|---|---|
| `dashboard/ferramentas/` | `dashboard/ferramentas/arquivo/` | 45 (36 versões antigas do medidor + 9 de outras ferramentas) |
| `dashboard/gerador/` | `dashboard/gerador/arquivo/` | 67 (57 `gerar_medidor_*` + 10 geradores de ferramentas/catálogo/pacote antigos) |
| `dashboard/modulos-fonte/` | `dashboard/modulos-fonte/arquivo/` | 16 versões antigas de módulos |
| `nodered/flows/bt2/` | `nodered/flows/arquivo/` | 2 (`chaves-400-api-v2.6`, `chaves-56-api-v3.6`) |

Fica na pasta ativa: a versão mais nova de cada família (medidor 1.10.227, mapa_fbs 0.19, gráfico 0.13, gerenciador 1.9, RNC reparo 0.3, RNC registro 0.2, maquete 0.5, API cards 0.4, amostras 0.7, index 0.7, catálogo 0.9) e o que os testes ainda usam.

## O que NÃO foi movido e por quê (travado por testes)
- **Medidor:** 29 versões antigas (1.10.164 a 1.10.226) seguem em `dashboard/ferramentas/` porque testes apontam para elas por nome. Alguns sem variável de ambiente para trocar (`f10_contrato_html_rotas`, `f11_front_contra_back`, `s1_dse_sem_ip_fixo` usam a 1.10.176) e outros usam a versão anterior como contra-prova ("a mesma bateria na versão N-1 tem que falhar").
- **Fluxos Node-RED:** 39 versões antigas seguem em `nodered/flows/bt2/` por serem fixtures de teste (`chaves-56 v3.4` aparece 15 vezes nos testes, `registro-ensaio-db2100 v1.8` 9 vezes etc.).
- `dashboard/pacotes/` e `dashboard/arquivo/` (pacotes e versões já entregues): não mexi.
- **PLC (`plc/`)**: não mexi; é o seu território (blocos SCL).

## Prova de que nada quebrou
Bateria completa depois da mudança (PLC simulado, medidor 1.10.227): unitários 132/132; integração 247 passam, 0 falham, 3 `todo`; e2e 24 de 25 (só `pacote_ia`, pendência conhecida); `build_modular` 4/4. Igual à linha de base.

## Recomendação (próxima decisão)
Para arquivar o resto, os testes precisam deixar de apontar para versões fixas. Duas opções: (a) copiar as versões que servem de contra-prova para `tests/fixtures/` e fazer os testes lerem de lá; (b) passar os testes para a versão mais nova (a esteira já prova o comportamento). Só faço com sua aprovação, porque altera testes.

## Lista dos arquivos movidos
**Ferramentas:** `api_cards_visor_v0.3.html`, `gerenciador_logs_v1.7.html`, `grafico_ensaio_v0.11.html`, `index_v0.3.html`, `mapa_fbs_v0.15.html`, `maquete_layout_v0.4.html`, `medidor_gerador_v1.10.162.html`, `medidor_gerador_v1.10.163.html`, `medidor_gerador_v1.10.165.html`, `medidor_gerador_v1.10.167.html`, `medidor_gerador_v1.10.168.html`, `medidor_gerador_v1.10.172.html`, `medidor_gerador_v1.10.173.html`, `medidor_gerador_v1.10.174.html`, `medidor_gerador_v1.10.175.html`, `medidor_gerador_v1.10.177.html`, `medidor_gerador_v1.10.178.html`, `medidor_gerador_v1.10.179.html`, `medidor_gerador_v1.10.180.html`, `medidor_gerador_v1.10.181.html`, `medidor_gerador_v1.10.182.html`, `medidor_gerador_v1.10.183.html`, `medidor_gerador_v1.10.184.html`, `medidor_gerador_v1.10.185.html`, `medidor_gerador_v1.10.186.html`, `medidor_gerador_v1.10.187.html`, `medidor_gerador_v1.10.188.html`, `medidor_gerador_v1.10.189.html`, `medidor_gerador_v1.10.194.html`, `medidor_gerador_v1.10.197.html`, `medidor_gerador_v1.10.202.html`, `medidor_gerador_v1.10.203.html`, `medidor_gerador_v1.10.204.html`, `medidor_gerador_v1.10.205.html`, `medidor_gerador_v1.10.207.html`, `medidor_gerador_v1.10.208.html`, `medidor_gerador_v1.10.211.html`, `medidor_gerador_v1.10.213.html`, `medidor_gerador_v1.10.218.html`, `medidor_gerador_v1.10.222.html`, `medidor_gerador_v1.10.223.html`, `medidor_gerador_v1.10.225.html`, `rnc_registro_v0.1.html`, `rnc_reparo_v0.1.html`, `rnc_reparo_v0.2.html`.

**Geradores:** 57 arquivos `gerar_medidor_*` e: `gerar_catalogo_auto_v0.2.1.py`, `gerar_catalogo_v0.8_e_medidor_v1.10.192_v0.1.py`, `gerar_gerenciador_grafico_sem_ip_v0.1.py`, `gerar_index_v0.6_v0.1.py`, `gerar_mapa_fbs_v0.17_v0.1.py`, `gerar_mapa_fbs_v0.18_v0.1.py`, `gerar_menu_v0.3_e_medidor_v1.10.201_v0.1.py`, `gerar_pacote_rnc_bancada_v0.1.py`, `gerar_pacote_rnc_bancada_v0.2.py`, `gerar_revisao_html_v0.1.py`.

**Módulos-fonte:** `ajuda_v0.1.js`, `bancos_visiveis_v0.1.js`, `central_registros_v0.1.js`, `central_registros_v0.2.js`, `central_registros_v0.3.js`, `fbs_virtuais_v0.11.js`, `pacote_ia_v0.1.js`, `rnc_defeito_v0.1.js`, `rnc_defeito_v0.2.js`, `rnc_defeito_v0.3.js`, `robo_fase_rnc_v0.1.js`, `robo_fase_rnc_v0.2.js`, `robo_fase_rnc_v0.3.js`, `robo_fase_rnc_v0.4.js`, `rodizio_chaves_v0.3.js`, `rodizio_chaves_v0.4.js`.

**Fluxos:** `chaves-400-api-v2.6.json`, `chaves-56-api-v3.6.json`.
