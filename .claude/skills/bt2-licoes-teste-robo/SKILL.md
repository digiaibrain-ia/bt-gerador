---
name: bt2-licoes-teste-robo
description: Licoes aprendidas do projeto BT2 sobre testes automaticos e o robo Dev/Operador oculto (harness Playwright, caixa de areia, balao, relatorio, falsos positivos). Use ao criar ou rodar testes, o robo ou revisoes de interface.
---

# Lições BT2 — Teste e robô Dev/Operador oculto
Fonte: `docs/licoes/REGISTRO_LICOES_v0.1.md` (LL-030 a LL-036, LL-041).

## Regras
- Evento criado pelo teste nunca vale como ação do operador (`isTrusted`). LL-030
- **O robô devolve toda preferência que mexer** (salvamento, Guiado, Dica…). LL-031
- **Caixa de areia total**, em todos os modos: nada abre, baixa ou imprime sozinho (links `_blank` e download incluídos). LL-032
- Lista de elementos guardada antes de um redesenho fica obsoleta: buscar de novo e conferir o resultado. LL-033
- Controle de emergência (Parar) fica **dentro** do popup modal aberto. LL-034
- Todo teste automático tem **fim visível** e relatório recuperável (Relatório/Copiar/Baixar, salvo no navegador). LL-035
- Falso positivo também é defeito do teste: registrar e corrigir o teste (`<details>` fechado, popups esquecidos). LL-036
- Testar só no Demo local não vê divergência Demo × Real: repetir contra o Node-RED + PLC simulado. LL-041
- Relatório honesto: o que foi provado (PLC simulado) × o que depende da bancada. Teste que falha vira `todo` com ID e gravidade, nunca apagado.
- Perfis de teste: desktop 1280×800, **notebook 1536×694**, Poco A/B. LL-047
- O robô Dev/Operador oculto tem o modo "Inspeção visual (rápida)" (~40 s, só olha): hover/foco sem quebra de layout; pseudo-elementos não são objetos: enumerar portadores de balão (`.ibub`, `[data-tip]`). LL-046/047
- Todo relatório diz primeiro o que o teste NÃO cobre. LL-049

