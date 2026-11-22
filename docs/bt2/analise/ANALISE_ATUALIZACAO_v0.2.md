# Atualização da análise geral (03/11/2026)

Situação dos achados de `ANALISE_GERAL_v0.1.md`:

| # | Situação |
|---|---|
| F1 alvo inválido | corrigido (1.10.158) |
| F2 cálculo exponencial | **corrigido (1.10.159)**: programação dinâmica; 4 bancos reais 2–40 ms; banco de 32 chaves viável; 150 casos conferidos contra o cálculo antigo |
| F3 tolerância 0,5 kW | **corrigido (1.10.159)**: min(0,5 kW; metade da menor chave habilitada) |
| F4 FALHA sem saída | **corrigido (1.10.159)**: `rearma()` explícito; na tela, o 1º clique no chip "Patamar: On" em FALHA rearma |
| F5 habilitação não recalcula | **corrigido (1.10.159)** |
| F6 fonte defasada | **corrigido** para os dois módulos: `rodizio_chaves_v0.5.js` e `fbs_virtuais_v0.12.js` são exatamente o código embutido no 1.10.159 |
| F7 `TABELA_FISICA` só 2 bancos | aberto (sem efeito: o HTML usa `BANCOS`) |
| F8 lógica misturada com E/S | aberto (pré-requisito do porte; ver especificação) |
| F9 tempo em ms × ciclo do PLC | aberto (testes já usam relógio simulado) |

Testes: `node --test tests/fb/rodizio_chaves.test.js tests/fb/fbs_virtuais.test.js` → 26 de 26. Os testes novos de F3/F4/F5 foram conferidos contra o módulo antigo e **falham nele** (não são vacuosos).

Novo: vetores congelados para o SCL (`tests/fb/vetores/sugere_vetores_v0.1.json`, 35 casos, gerados por `tests/fb/gera_vetores.js`) e `ESPECIFICACAO_PORTE_SCL_SUGESTAO_v0.1.md`.

Não verificado: SCL (não existe ainda), PLCSIM/PLC, interface completa em Demo com ensaio (os módulos foram testados isolados e o carregamento da página sem erros).
