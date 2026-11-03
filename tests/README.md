# Testes dos FBs (JavaScript)

Requisito: Node 20+ (testado com 22). Sem dependências.

    node --test tests/fb/rodizio_chaves.test.js tests/fb/fbs_virtuais.test.js

- `rodizio_chaves.test.js`: sugestão de chaves (oráculo por força bruta, teste diferencial entre FBs, guarda, plano de entrada, bordas, desempenho).
- `fbs_virtuais.test.js`: máquina de estados da FB mãe com um host simulado. Os testes "ACHADO" estão marcados `todo`: descrevem o comportamento desejado e **falham de propósito** até o defeito ser corrigido (docs/bt2/analise/ANALISE_GERAL_v0.1.md, F3–F5).
- Fonte testada: `dashboard/modulos-fonte/rodizio_chaves_v0.5.js` e `fbs_virtuais_v0.12.js`. Se o código embutido no HTML mudar, sincronize o módulo antes (ver F6).
