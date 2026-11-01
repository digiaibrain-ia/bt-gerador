# ESCALONADOR DE ENTRADA (sub-degraus) — v0.1
Medidor v1.10.106 · módulos `rodizio_chaves_v0.2.js` e `fbs_virtuais_v0.8.js` · 29/10/2026
Tudo em JavaScript (sem PLC). Parametrização = organizada no JS (objeto `G.esc`, Ajustes avançados do Patamar Guiado).

## 1. O que faz (leigo)
Ao subir de um patamar para outro (ex.: 30 → 50 %), o Patamar Guiado não troca todas as chaves de uma vez. Ele passa por pontos intermediários (35, 40, 45, 50 %), ligando as chaves novas **antes** e desligando as antigas **depois** de uma janela curta. O motor não sente um degrau brusco.

## 2. Parâmetros (`G.esc`) — todos ASSUMIDOS, a engenharia confirma
| Campo | Valor padrão | Significado |
|---|---|---|
| `ativo` | true | liga/desliga os sub-degraus |
| `ligaAntes` | true | liga as novas antes de desligar as antigas |
| `janelaS` | 1 s | tempo entre ligar e desligar |
| `pausaSubS` | 1 s | pausa entre sub-degraus |
| `sobrePts` | 5 pts % | sobreposição máxima acima do sub-degrau (teto) |
| `pesoMudanca` | 5 | penaliza trocar chaves já ligadas (evita "vai e vem") |
| `trechos` | 30→50: `5` · 50→100: `10` · 100→107: `3,4` | passos em pontos % (valores acumulados a partir do patamar anterior) |

Fonte dos passos: pedido do usuário (29/10/2026). Nenhuma fonte normativa: a ISO 8528/3046 completa não é pública; só se confirmou 110 % de sobrecarga por 1 h (ISO 3046-1).

## 3. Regras
1. Só sobe: descidas e retorno a 0 % não têm sub-degrau.
2. Só atua com ensaio iniciado (`T.started`) e a partir do 2º patamar.
3. Cada sub-degrau encadeia da seleção anterior (`sugere` com `b.atual`), sem passar do total final.
4. Teto por trecho: `min(limite de segurança, kW100 × (pct + sobrePts)/100)`. Se o pico da sobreposição passar o teto, **aquele trecho** cai na ordem antiga (troca no mesmo instante) com aviso ⚠ na lista de passos.
5. Antes de CADA passo o transitório é conferido contra o limite de segurança (110 % provisório); se passar, interrompe e registra `falha`.
6. O cronômetro não acumula estabilidade enquanto escalona (`PATAMAR_ESCALONANDO()`).

## 4. Limitação conhecida
Com chaves grandes (BC400 de 50 kW) a sobreposição pode passar de 5 pts; o trecho cai na ordem antiga e avisa. Ajustar `sobrePts` ou os passos se a engenharia aceitar mais.

## 5. Patamar Guiado com salvamento automático
`autoOk = auto===true && (salvarManual===true || sidse())`. Em SIDSE (simulador ideal do DSE) o salvamento automático é permitido. Com DSE real continua exigindo o salvamento manual.

## 6. Outros itens da v1.10.106
- Mapa dos FBs em janela própria (`↗ Janela própria`; `↗ Mapa em outra janela` no Patamar). Aviso: em um monitor só, a janela pode ir para trás ao clicar na principal.
- `grafico_ensaio_v0.4` e `mapa_fbs_v0.6` publicam log [DEV.OBS] (só depois que o gerenciador pede).
- `gerenciador_logs_v1.3`: abas Medidor | Gráfico | Mapa dos FBs; JSON/Markdown levam todas as abas (campo `app`).

## 7. Como testar
1. Demo (senha) → SIDSE → Operador Auto + salvamento automático + velocidade 10×.
2. Informar a potência do gerador, escolher 30 → 50 %: a lista de passos mostra "Sub-degraus: 35/40/45/50" e rótulos `[35 %]`.
3. Abrir o gerenciador pelo popup Demo: conferir o plano em `bco` e as abas.
4. Provocar teto: `sobrePts` = 0 → trechos com chaves grandes mostram ⚠ e usam a ordem antiga.
5. Diagnóstico no console: `GUIADO_DBG.planoDe()`.

## 8. Pendências
- Confirmar valores assumidos (passos, janela, pausa, sobrePts, 110 %).
- Sequência de ensaio (0/30/50/100/107/0, 5 min em 100 %) sem fonte: engenharia da fábrica.
- Sinal para o PLC liberado pelo Patamar: sem definição (opções 1/2/3 abertas).
- Teste E2E do salvamento manual com prévia ainda não executado.
