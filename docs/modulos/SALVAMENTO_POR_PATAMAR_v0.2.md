# Salvamento "Por patamar" — correção do conceito (medidor 1.10.120 · FBs virtuais v0.10 · mapa v0.13) — 30/10/2026
Substitui o entendimento da 1.10.119 (que misturava SALVAR com APLICAR).

## Regra (decisão do operador, 30/10)
- ⚙ Modo › Salvamento tem 3 modos: **Manual** (clique em SALVAR), **Automático**, **Por patamar**.
- **Por patamar:** a etapa é salva e o ensaio avança sozinho ao cumprir o tempo (igual ao Automático). Cada patamar escolhe como as **chaves entram**:
  - **Manual:** ao entrar no patamar a mãe sugere (tracejado no card Cargas) e fica em `AGUARDA_APLICAR`. O operador ajusta e clica **Aplicar** (botão ao lado de Patamar Guiado, ou "Confirmar e aplicar" no diálogo). Entram as chaves selecionadas; ele liga à mão as que tirou até a carga atingir o degrau; o tempo corre normalmente.
  - **Auto:** a mãe aplica sozinha (como antes).
- Padrão de cada patamar: Manual. Patamar em andamento/passado não muda.
- Em "Por patamar" o Patamar Guiado liga sozinho (não exige Operador = Auto do Demo).

## (a) Implementado e testado
Playwright: modo Por patamar liga o guiado, cartões Manual/Auto gravam em `medidor.aplicaPat.v1`, botão Aplicar aparece, sem erro de JS. Mãe (Node, host simulado): patamar Manual espera, aplica após `aplicouEt`, patamar Auto aplica sozinho.
## (b) Assumido
- Aplicar não exige carga na faixa (a carga sobe depois, pelo operador); o cronômetro do patamar já só conta com a carga na faixa (regra existente).
- Se kW a 100 %/limite/degrau mudarem durante a espera, a sugestão é recalculada (regra da v0.4 da mãe) e descarta ajustes não aplicados.
- Ajustes do operador na seleção valem porque o Aplicar usa a seleção atual (G.sel) — **não validado em campo**.
## (c) A desenvolver
SCL dos FBs reais; teste com gerador real; decisão kVA→kW (189,1 × 208 kW).
