---
name: graph-sequenciadores
description: GRAPH — Linguagem de Sequenciadores SFC com steps, transitions, supervisão S1/S2 e automação de máquinas para S7-300/400 e S7-1500
---

# GRAPH — Linguagem de Sequenciadores (S7-GRAPH)

> **Autor:** REGINALDO LOBO | Referência interna da skill SIEMENS_S7_BLOCO
> **Disponibilidade:** STEP 7 V5.x (add-on S7-GRAPH); TIA Portal V13+ (S7-1500 nativo)
> **Baseado em:** SFC (Sequential Function Chart) IEC 61131-3

---

## 1. Conceito Fundamental

GRAPH estrutura a lógica de máquina como **sequência de passos (Steps)** e **condições de transição (Transitions)**. Cada GRAPH é compilado como um **Function Block (FB)** com interface padrão.

```
┌─────────────────────────────────────────────────────────────┐
│  Sequência GRAPH básica                                      │
│                                                              │
│   ○── [Passo inicial S1] ──→ ações (N/S/R/D/L/P)          │
│   │                                                          │
│   └── T1: condição booleana (ex: sensor_ok AND tempo_ok)   │
│   │                                                          │
│   ○── [Passo S2] ──→ ações                                 │
│   │                                                          │
│   └── T2: outra condição                                    │
│   │                                                          │
│   ○── [Passo S3] ──→ voltar ao S1 (loop) ou finalizar      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Tipos de Ação por Passo

| Qualificador | Nome | Comportamento |
|-------------|------|---------------|
| **N** | Non-stored | Ativa enquanto o passo estiver ativo; desativa ao sair do passo |
| **S** | Set | Ativa na entrada do passo — permanece ativo até ação R explícita |
| **R** | Reset | Desativa uma saída previamente setada por S |
| **D** | Time-delayed | Ativa após atraso (comportamento como TON) |
| **L** | Time-limited | Ativa na entrada; desativa após tempo limite (como TP) |
| **P** | Pulse | Ativo apenas no primeiro scan em que o passo está ativo |
| **C** | Condition | Ativo somente enquanto uma condição booleana adicional for TRUE |

### Exemplos de Ação em GRAPH (como representado em STL interno)

```pascal
// Passo S3 — ações:
//   N: manter motor ligado enquanto no passo
//   D 5s: ligar alarme somente após 5s neste passo
//   S: travar válvula aberta (permanece mesmo após sair do passo)

// Em termos de variáveis, acessadas externamente via:
//   S3.X  = TRUE quando passo S3 está ativo
//   S3.T  = TIME decorrido desde que S3 ficou ativo
//   S3.U  = DINT contagem de vezes que S3 foi ativado (ciclo de vida)
```

---

## 3. Variáveis Automáticas por Passo

Para cada passo Sx, o GRAPH gera automaticamente três variáveis acessíveis no FB e externamente:

| Variável | Tipo | Descrição |
|----------|------|-----------|
| `Sx.X` | BOOL | TRUE quando o passo Sx está ativo |
| `Sx.T` | TIME | Tempo decorrido desde que o passo ficou ativo |
| `Sx.U` | DINT | Número de vezes que o passo foi ativado |

```pascal
// Uso típico das variáveis de passo em supervisão:
IF FB_Envase.S3.X AND FB_Envase.S3.T > T#30S THEN
  // passo 3 ativo por mais de 30s → alarme de timeout
  alarme_passo3_timeout := TRUE;
END_IF;

// Verificação de execução para contagem de ciclos:
IF FB_Envase.S1.U > 500 THEN
  // mais de 500 ciclos → solicitar manutenção preventiva
  solicitar_manutencao := TRUE;
END_IF;
```

---

## 4. Interface do FB GRAPH

O GRAPH gera um FB com parâmetros de controle padrão:

| Parâmetro | Tipo | Direção | Função |
|-----------|------|---------|--------|
| `INIT_SQ` | BOOL | IN | Borda de subida: força retorno ao passo inicial (reinicia sequência) |
| `ACK_EF` | BOOL | IN | Borda de subida: confirma (acknowledgment) erro de supervisão S2 |
| `S_PREV` | BOOL | IN | Borda de subida: força retrocesso ao passo anterior (modo manual) |
| `S_NEXT` | BOOL | IN | Borda de subida: força avanço ao próximo passo (bypass de transição) |
| `OFF_SQ` | BOOL | IN | TRUE: desativa todos os passos (sem passo ativo — estado neutro) |
| `SW_AUTO` | BOOL | IN | TRUE: modo automático (transições normais) |
| `SW_MAN` | BOOL | IN | TRUE: modo manual (S_PREV/S_NEXT válidos) |
| `SW_TAP` | BOOL | IN | TRUE: modo tap (avança um passo por pulso em S_NEXT) |
| `SQ_STOPPED` | BOOL | OUT | TRUE quando sequência está parada (OFF_SQ ou nenhum passo ativo) |
| `SQ_ACTIVE` | BOOL | OUT | TRUE quando algum passo está ativo |
| `ERR_FLT` | BOOL | OUT | TRUE quando há erro de supervisão ativo |

```pascal
// Chamada típica do FB GRAPH no OB1:
FB_Envase.DB1(
  INIT_SQ := pulso_init,         // botão REINICIAR
  ACK_EF  := pulso_ack_erro,     // botão CONFIRMAR ERRO
  S_NEXT  := pulso_step_fwd,     // botão avançar passo (manual)
  S_PREV  := pulso_step_bwd,     // botão recuar passo (manual)
  OFF_SQ  := parada_emergencia,  // botão STOP
  SW_AUTO := modo_auto,          // seletor AUTO
  SW_MAN  := modo_manual);       // seletor MANUAL
```

---

## 5. Supervisão de Passos — S1 Interlock e S2 Supervision

Cada passo pode ter até dois tipos de supervisão:

| Tipo | Nome | Comportamento quando condição for FALSE |
|------|------|----------------------------------------|
| **S1** | Interlock (ILO) | Passo vai para modo HOLD — operador deve retomar manualmente |
| **S2** | Supervision (SV) | Gera evento de erro → `ERR_FLT=TRUE` → salta para passo de erro |

```pascal
// Exemplo: S2 Supervision no passo S4 — válvula deve abrir em 10s:
// Condição S2: valvula_aberta OR (S4.T < T#10S)
// Se valvula_aberta não ativou em 10s → supervisão FALSE → erro S2

// Tratamento de erro S2:
IF FB_Envase.ERR_FLT THEN
  // 1. Executar passo de erro (definido no GRAPH como "erro step")
  // 2. Delicar e aguardar ACK_EF
  log_erro := FB_Envase.S_ERR.X;        // passo de erro ativo
  tempo_no_erro := FB_Envase.S_ERR.T;   // tempo no estado de erro
END_IF;

// Reconhecimento (acknowledgment) do erro:
IF operador_confirmou_erro THEN
  pulso_ack_erro := TRUE;   // borda de subida em ACK_EF → libera sequência
END_IF;
```

---

## 6. Ramificações — Divergência e Convergência

### Divergência Alternativa (XOR — apenas uma branch)

```
     ○ S3
     |
  ───┬───────
  T4 |    T5 |
  ───    ───
  ○ S4   ○ S5
```
Apenas a primeira transição verdadeira é ativada. S4 OU S5, nunca ambos.

### Divergência Simultânea (AND — todas as branches em paralelo)

```
     ○ S3
     |
  ═══╪═══════   ← linha dupla = simultânea
     |      |
   ○ S4   ○ S6
   |       |
   T5     T7
   |       |
  ═══╪═══════   ← convergência simultânea
     |
   ○ S8 (avança somente quando S5 E T7 forem ambos TRUE)
```
Todas as branches paralelas devem completar antes de avançar.

---

## 7. Exemplo Completo — Sequência de Envase de Garrafas

```
Processo: aguardar garrafa → encher → confirmar nível → drenar excesso → limpar → voltar
Passos: S1..S5 | Ações: válvulas e motores | Supervisão S2 em S2 e S3
```

### Descrição dos Passos e Transições

| Passo | Nome | Ações (N) | Transição de saída |
|-------|------|-----------|-------------------|
| S1 | Aguardar Garrafa | — | T1: `sensor_garrafa AND sw_auto` |
| S2 | Encher | N: `valvula_entrada=TRUE` | T2: `nivel_alto OR S2.T > T#60S` |
| S3 | Confirmar Nível | N: aguarda estabilizar | T3: `nivel_ok AND S3.T > T#3S` |
| S4 | Drenar Excesso | N: `valvula_dreno=TRUE` | T4: `nivel_ok AND NOT nivel_alto` |
| S5 | Limpar Bico | N: `pulso_limpeza=TRUE`, L 2s | T5: `S5.T >= T#2S` |

### FB GRAPH gerado em SCL (representação lógica equivalente)

```pascal
// "Na prática, o código GRAPH é gerado pelo S7-GRAPH compiler"
// "Este exemplo ilustra a lógica equivalente em SCL para compreensão"

FUNCTION_BLOCK FB_EnvaseGarrafas
VAR_INPUT
  INIT_SQ     : BOOL;
  ACK_EF      : BOOL;
  S_NEXT      : BOOL;
  S_PREV      : BOOL;
  OFF_SQ      : BOOL;
  SW_AUTO     : BOOL;
  // sinais do processo:
  sensor_garrafa : BOOL;
  nivel_alto     : BOOL;
  nivel_ok       : BOOL;
END_VAR

VAR_OUTPUT
  valvula_entrada : BOOL;
  valvula_dreno   : BOOL;
  pulso_limpeza   : BOOL;
  SQ_ACTIVE       : BOOL;
  ERR_FLT         : BOOL;
END_VAR

VAR
  passo_ativo : INT := 1;       // passo atual (1..5)
  passo_T     : TIME;           // tempo decorrido no passo
  passo_start : TIME;           // marca de tempo de entrada no passo
  ciclos      : DINT;           // contador de ciclos completos
END_VAR

// "A lógica de transição real é gerenciada pelo runtime GRAPH"
// "Aqui mostramos o padrão de programação manual equivalente"
BEGIN
  IF INIT_SQ THEN passo_ativo := 1; END_IF;
  IF OFF_SQ  THEN passo_ativo := 0; SQ_ACTIVE := FALSE; RETURN; END_IF;

  SQ_ACTIVE := passo_ativo > 0;
  passo_T   := CURRENT_TIME - passo_start;  // pseudo — use TIME_TCK() real

  // Limpa saídas antes de ativar as do passo atual
  valvula_entrada := FALSE;
  valvula_dreno   := FALSE;
  pulso_limpeza   := FALSE;

  CASE passo_ativo OF
    1: // S1 — Aguardar Garrafa
       IF sensor_garrafa AND SW_AUTO THEN
         passo_ativo := 2; passo_start := CURRENT_TIME;
       END_IF;

    2: // S2 — Encher (N: valvula_entrada)
       valvula_entrada := TRUE;
       // Supervisão S2: nível alto em 60s
       IF nivel_alto THEN
         passo_ativo := 3; passo_start := CURRENT_TIME;
       ELSIF passo_T > T#60S THEN
         ERR_FLT := TRUE; // timeout — supervisão disparou
       END_IF;

    3: // S3 — Confirmar Nível (aguarda 3s de nível OK)
       IF nivel_ok AND passo_T > T#3S THEN
         passo_ativo := 4; passo_start := CURRENT_TIME;
       END_IF;

    4: // S4 — Drenar Excesso
       valvula_dreno := TRUE;
       IF nivel_ok AND NOT nivel_alto THEN
         passo_ativo := 5; passo_start := CURRENT_TIME;
       END_IF;

    5: // S5 — Limpar Bico (L 2s — ativo apenas 2s)
       IF passo_T <= T#2S THEN pulso_limpeza := TRUE; END_IF;
       IF passo_T >= T#2S THEN
         ciclos := ciclos + 1;
         passo_ativo := 1; passo_start := CURRENT_TIME;
       END_IF;
  END_CASE;
END_FUNCTION_BLOCK
```

---

## 8. Tratamento de Erro S2 — Padrão Recomendado

```pascal
// "Fluxo completo de tratamento de falha de supervisão S2 em GRAPH"

// 1. Supervisão dispara: ERR_FLT = TRUE, sequência vai para passo de ERRO
// 2. No passo de ERRO (S_ERR): desligar saídas críticas, acionar alarme
// 3. Operador investiga e pressiona botão de ACK
// 4. ACK_EF → borda de subida → GRAPH libera e vai para INIT_SQ
// 5. INIT_SQ reinicia a sequência do início

// Código na tela de supervisão (SCADA / HMI):
IF FB_Envase.ERR_FLT THEN
  hmi_mensagem   := 'FALHA SUPERVISÃO — verifique processo e confirme';
  hmi_btn_ack    := TRUE;   // exibe botão ACK na tela do operador
END_IF;

IF hmi_operador_confirmou THEN
  FB_Envase.ACK_EF := TRUE;  // pulso de 1 ciclo
END_IF;
```

---

## 9. Dicas de Programação GRAPH

1. **Nomeie cada passo e transição** — use nomes descritivos (ex: `S3_ConfirmarNivel`, `T3_NivelOK`) para rastreabilidade no diagnóstico.
2. **Use S2 Supervision para falhas de processo** (timeout de abertura de válvula, falta de resposta de sensor) — nunca use S1 para isso.
3. **Use S1 Interlock para condições de segurança** (porta aberta, nível crítico) que podem resolver-se sozinhas.
4. **Monitore Sx.T para detectar passos lentos** — compare com limites no OB1 para gerar alertas de tendência.
5. **Um GRAPH FB por sequência independente** — não tente colocar múltiplas máquinas em um único GRAPH.
6. **Reserve o passo S0/S_INIT para estado de espera de permissão de início** — facilita integração com sistemas de receita.
7. **Documente as variáveis de interface** — INIT_SQ, ACK_EF e OFF_SQ devem ter fonte claramente definida (HMI, safety relay, etc.).
