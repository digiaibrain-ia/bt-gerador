# Passo 5 · A1 a A3: fixtures de teste e testes sempre na versão mais nova · 18/11/2026

Aprovado pelo Reginaldo (18/11/2026): testes que passam na versão atual passam a usar a mais nova; só o mínimo irredutível de contra-prova vira fixture.

## A1: como se descobriu o mínimo
Experimento automático: cada teste que cita fluxo antigo rodou como estava e com todos os fluxos trocados pela versão mais nova (`BT2_FLUXO_TROCA`). Resultado: **21 de 27** passam com os fluxos novos; **6** só passam nas versões antigas (caracterização das etapas 4a/4b, estresse, instrumentação e a prova da guarda D3): `c2_caracterizacao`, `c3_etapa4a`, `c4_etapa4b`, `e5c_estresse_queda_registro`, `i1_instrumentacao`, `s3_portao3`. Os testes A2 (`a2_sbret*`) também passam nos fluxos novos.
O experimento não pegava os testes que leem fluxo por caminho de arquivo e conferem "a versão anterior está intacta" (`c5_etapa4c`, `s2_portao2`, `f7b`): aparecem na primeira rodada completa e foram mantidos nas versões que citam.

## A2: o que foi para `tests/fixtures/fluxos/` (22 fluxos, via `git mv`)
- `chaves-400-api-v3.1`
- `chaves-400-api-v3.2`
- `chaves-400-api-v3.3`
- `chaves-400-api-v3.4`
- `chaves-550-api-v1.2`
- `chaves-550-api-v1.3`
- `chaves-550-api-v1.4`
- `chaves-550-api-v1.5`
- `chaves-56-api-v3.1`
- `chaves-56-api-v3.2`
- `chaves-56-api-v3.3`
- `chaves-56-api-v3.4`
- `chaves-595-api-v1.2`
- `chaves-595-api-v1.3`
- `chaves-595-api-v1.4`
- `chaves-595-api-v1.5`
- `dev-logs-api-v1.1`
- `dev-logs-api-v1.2`
- `registro-ensaio-db2100-api-v1.6`
- `registro-ensaio-db2100-api-v1.7`
- `registro-ensaio-db2100-api-v1.8`
- `simulador-dse-demo-v6`

## A3: o que mudou nos testes
- Novo `tests/versoes.js`: `medidorAtual()` (maior medidor em `dashboard/ferramentas`), `caminhoFluxo()` e `caminhoFerramenta()` (pasta ativa primeiro, depois fixtures).
- `harness.js`: procura o fluxo na pasta ativa e depois em `tests/fixtures/fluxos`; serve também `tests/fixtures/ferramentas`.
- 44 arquivos de teste (e2e e integração) deixam de apontar para um medidor fixo e usam `medidorAtual()` por padrão (as variáveis de ambiente continuam mandando).
- 19 testes passam a citar os fluxos mais novos; `a2_sbret*` escolhem a versão mais nova de cada banco (56: v3.7, 400: v3.6, 550/595: v1.7).
- `f10`, `f11`, `s1` deixam de fixar a 1.10.176. `f10` agora também lê as rotas do `rnc-api-v1.2` (o medidor novo chama `/api/rnc`) e ignora a query string (`?limit=10`), que não faz parte da rota.
- `i_catalogo_v08` (teste histórico do catálogo v0.8 + medidor 1.10.192) **continua fixo**: depende desses arquivos na pasta ativa. Está superado por `l_catalogo_auto`; recomendo aposentar com sua aprovação.
- Também foram para `nodered/flows/arquivo/` 17 fluxos antigos que nenhum teste nem script cita. `nodered/flows/bt2/` fica com 13 arquivos: só o que vale.

## Prova
Rodada completa em modo padrão (sem variáveis apontando para a versão nova): unitários + `build_modular` 136/136; integração 50 arquivos, **351 testes verdes**, 0 falhas (os 3 `todo` de sempre); e2e 24 de 25 (só `pacote_ia`, pendência conhecida). `t_zera_plc_falha` ficou estável em 6 de 6 execuções com a máquina carregada depois de esperar o Node-RED refletir o comando antes de acionar a volta ao estado seguro.

## O que não foi feito
- 29 medidores antigos continuam em `dashboard/ferramentas/` (citados em comentários, no `i_catalogo_v08`, em `revisao.js`/`robo_cli.js` e por mensagens de contra-prova). Arquivar o resto é um passo seguinte, com revisão dessas referências.
- Os 3 `todo` e o `pacote_ia`.
