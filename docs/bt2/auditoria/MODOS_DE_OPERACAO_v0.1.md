# Modos de operação do medidor — matriz observada · 17/11/2026 · medidor 1.10.220

**Como foi feito:** `tests/e2e/modos_operacao_matriz.js` (Demo local, só BC56, 40 kW a 100 %, ensaio a 10x, 40 s por combinação). **Não afirma o "certo"**: registra o que cada combinação faz. Dados: Salvamento (Manual / Automático / Por patamar) × Operador (Manual / Auto). Sem erro de JavaScript em nenhuma.

| Salvamento | Operador | Mãe (Patamar Guiado) | Chaves entram sozinhas? | A etapa precisa do operador? | Observação |
|---|---|---|---|---|---|
| **Manual** | Manual ou Auto | PARADA (guiado desligado) | Não | **SALVAR** em cada etapa (o relógio para em "aguardando SALVAR") | Operador "Auto" do Demo só entra se houver chaves a operar (aqui, nenhuma) |
| **Automático** | Manual | PARADA | Não | Não: avança sozinho **se a carga estiver na faixa**; sem chaves fica esperando carga | O operador liga as chaves à mão (card) |
| **Automático** | Auto (Demo) | PARADA | **Sim** (o operador simulado clica as chaves) | Não | Só existe no Demo (simula a pessoa) |
| **Por patamar** | Manual ou Auto | **LIGA SOZINHA** | Não até o operador clicar **Aplicar** (padrão por patamar = Manual) | **Aplicar** em cada patamar; a etapa grava e avança sozinha | Desde a 1.10.219 o relógio só solta com Aplicar **e** carga no degrau |

## Regras extraídas do código (e provadas pela matriz)
1. `Por patamar` **força** o Patamar Guiado ligado e o salvar-manual desligado (`PORPAT ⇒ guiadoOn`, `salvarManual=false`).
2. `modoAplicaEt(i)` = `Por patamar ? (APLICA_PAT[i]==='A' ? 'A' : 'M') : 'A'`: fora do Por patamar a Mãe **aplica sozinha** quando está ligada; dentro dele, **padrão Manual** (o operador decide).
3. O modo Auto/Manual de **um patamar** não muda no patamar em andamento nem nos passados (`setAplicaEt`).
4. **Operador "Auto" do Demo é ignorado no Por patamar** (as chaves esperam o Aplicar): comportamento coerente, mas vale saber ao treinar no Demo.
5. O **perfil de combustível** (gás/biometano) só atua quando o plano é executado pelo **Aplicar / Mãe** (Patamar Guiado). Em Manual e Automático com o guiado desligado, o operador clica chave a chave **fora do perfil** (ver BK-PERF-01).

## Achados desta análise
| ID | Gravidade | O que | Ação |
|---|---|---|---|
| MOD-1 | Média | Gerador a gás com o Patamar Guiado desligado: clique chave a chave no card ignora o perfil (degrau e pausa) | Backlog BK-PERF-01 (aviso na tela quando perfil ≠ diesel e o guiado está desligado) e BK-AUD-10 (limite de degrau no PLC) |
| MOD-2 | Baixa | "Operador Auto" do Demo não tem efeito no Por patamar | Registrado; sem correção (é do simulador) |
| MOD-3 | Info | Nenhuma combinação gerou erro de JavaScript nem estado travado sem saída | — |
