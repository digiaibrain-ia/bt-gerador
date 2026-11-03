# Testes dos FBs (JavaScript)

Requisito: Node 20+ (testado com 22). Sem dependências.

    node --test tests/fb/rodizio_chaves.test.js tests/fb/fbs_virtuais.test.js tests/fb/plc_et200.test.js

- `rodizio_chaves.test.js`: sugestão de chaves (oráculo por força bruta, diferencial v0.6 × v0.5, guarda, plano de entrada, kW real fora da grade, bordas, desempenho, vetores congelados v0.1 e v0.2).
- `fbs_virtuais.test.js`: máquina de estados da FB mãe com host simulado e relógio falso (F3–F5, M1–M5).
- `plc_et200.test.js`: regra "nada religa sozinho" do `fb_bancoEt200_16/32` (ET200), transcrita do SCL e conferida contra o texto do arquivo.
- Fonte testada: `rodizio_chaves_v0.6.js`, `fbs_virtuais_v0.13.js`, `fb_bancoEt200_*_v0.2.scl`. Para ver os achados falharem na versão antiga:
  `RODIZIO_MODULO=dashboard/modulos-fonte/rodizio_chaves_v0.5.js`, `FBV_MODULO=dashboard/modulos-fonte/fbs_virtuais_v0.12.js`, `ET200_VER=0.1`.
- Vetores para o SCL: `tests/fb/vetores/sugere_vetores_v0.2.json` (gerado por `node tests/fb/gera_vetores.js`; não sobrescreve versão existente).
