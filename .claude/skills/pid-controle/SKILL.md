---
name: pid-controle
description: PID — Controle de Processo — FB41/FB42/FB43, PID_Compact, PID_3Step, sintonia Ziegler-Nichols, cascata, feedforward e anti-windup
---

# PID — Controle de Processo: Referência Completa

> **Autor:** REGINALDO LOBO | Referência interna da skill SIEMENS_S7_BLOCO
> **Aplica-se a:** S7-300/400 (STEP 7 — FB41/FB42/FB43) · S7-1200/1500 (TIA Portal — PID_Compact/PID_3Step)

---

## 1. Seleção do Bloco PID

| Plataforma | Bloco | Tipo de saída | Quando usar |
|------------|-------|--------------|-------------|
| S7-300/400 | **FB41 CONT_C** | REAL 0–100% (contínua) | Válvula analógica, inversor de frequência |
| S7-300/400 | **FB42 CONT_S** | Pulsos ABRIR / FECHAR | Válvula motorizada sem encoder de posição |
| S7-300/400 | **FB43 PULSEGEN** | PWM em saída digital | Converter saída REAL do FB41 em pulso digital |
| S7-1200 | **PID_Compact** | REAL 0–100% + auto-tuning | Maioria das aplicações de controle |
| S7-1500 | **PID_Compact** | REAL 0–100% + auto-tuning | Maior resolução e faixa de tempo |
| TIA Portal | **PID_3Step** | Pulsos ABRIR/FECHAR ou posição | Válvula motorizada com ou sem encoder |
| TIA Portal | **PID_Temp** | REAL 0–100% | Loops de temperatura — pré-ajustado para processos térmicos |

> **Regra universal:** chame **sempre em OB cíclico** (OB35..38 no STEP 7 / OB30..38 no TIA Portal).
> **NUNCA no OB1** — período variável degenera os cálculos integral e derivativo.

---

## 2. FB41 CONT_C — Todos os Parâmetros (S7-300/400)

```pascal
// OBRIGATÓRIO: chame em OB35. Defina CYCLE = período exato do OB35.
// Um DB de instância por malha de controle. Ex: FB41 + DB41 = malha de nível.

CALL FB41, DB41
// ─── CONTROLE ───────────────────────────────────────────────────────────
  COM_RST    := FALSE      // TRUE: reinicia PID completo (zera integral e derivativa)
                           // Use COM_RST=TRUE no OB100 para arranque limpo
  MAN_ON     := manual_on  // TRUE: LMN := MAN (bypass total — modo manual do operador)
  PVPER_ON   := FALSE      // TRUE: PV lida de PIW (periférico) em vez de PV_IN REAL
                           // Se TRUE: use PV_PER := PIW_x; PVPER_ON := TRUE
  P_SEL      := TRUE       // TRUE: ação proporcional habilitada (quase sempre TRUE)
  I_SEL      := TRUE       // TRUE: ação integral habilitada (FALSE = apenas P puro)
  INT_HOLD   := FALSE      // TRUE: congela o integrador sem zerar (anti-windup manual)
  I_ITL_ON   := FALSE      // TRUE: pré-carrega o integrador com I_ITLVAL (bumpless)
  I_ITLVAL   := 0.0        // valor de pré-carga do integrador — use para bumpless transfer
  D_SEL      := FALSE      // TRUE: ação derivativa — adiciona ruído; use com TM_LAG
  CYCLE      := T#100MS   // período de amostragem — DEVE ser exatamente o período do OB35

// ─── SETPOINT E VARIÁVEL DE PROCESSO ────────────────────────────────────
  SP_INT     := setpoint   // setpoint interno em EU (ex: %, bar, °C)
  PV_IN      := pv_real    // PV escalada em EU (mesma unidade do SP)
  PV_FAC     := 1.0        // fator de ganho no PV (normalmente 1.0)
  PV_OFF     := 0.0        // offset no PV (normalmente 0.0)

// ─── PARÂMETROS DE SINTONIA ──────────────────────────────────────────────
  GAIN       := kp         // ganho proporcional Kp (adimensional)
  TI         := ti         // tempo integral Ti (TIME) — maior = efeito mais fraco
  TD         := td         // tempo derivativo Td (TIME) — T#0S = derivativa desabilitada
  TM_LAG     := T#2S      // filtro passa-baixa da derivativa (recomendado: TD / 10)
  DEADB_W    := 0.0        // banda morta em torno do SP em EU (0.0 = desabilitado)
  PFAC_SP    := 0.0        // 0=P calculado sobre erro / 1=P calculado sobre PV
                           // PFAC_SP=1 evita spike na saída ao mudar o setpoint (set-point kick)

// ─── LIMITES DE SAÍDA ────────────────────────────────────────────────────
  LMN_HLM    := 100.0      // limite superior da saída (%)
  LMN_LLM    := 0.0        // limite inferior da saída (%)

// ─── MODO MANUAL ─────────────────────────────────────────────────────────
  MAN        := saida_m    // saída em modo manual quando MAN_ON=TRUE (0.0 a 100.0 %)

// ─── SAÍDAS ──────────────────────────────────────────────────────────────
  LMN        => saida_pid   // saída do PID (0.0 a 100.0 %)
  LMN_P      => parcela_p   // contribuição proporcional — útil para diagnóstico
  LMN_I      => parcela_i   // contribuição integral
  LMN_D      => parcela_d   // contribuição derivativa
  ER         => erro_pid    // erro atual: SP - PV (para display no HMI)
  PV         => pv_intern   // PV após fator e offset (para monitoramento)
  QPVR       => alarm_pv    // TRUE se PV fora dos limites PV_HLM/PV_LLM configurados
  LMN_A      => saida_periferico  // saída convertida para QW (se LMNPER_ON=TRUE)
```

### Inicialização no OB100 — Arranque Limpo

```pascal
// No OB100 (warm restart): inicializa o PID sem spike na saída
CALL FB41, DB41
  COM_RST := TRUE   // reinicia estado interno do PID
  MAN_ON  := TRUE   // começa em manual para operador confirmar antes do auto
  MAN     := 0.0;   // saída zero no arranque

// No OB1, lógica de transição manual → automático:
IF operador_autorizou_auto THEN
  DB41.MAN_ON := FALSE;  // libera para modo automático
END_IF;
```

### Bumpless Transfer — Transferência Suave Manual→Auto

```pascal
// "Bumpless": ao passar de manual para automático, o integrador é pré-carregado
// com o valor manual atual para evitar salto brusco na saída

DB41.I_ITL_ON  := MAN_ON;          // pré-carrega enquanto estiver em manual
DB41.I_ITLVAL  := saida_atual;     // integrador = valor atual de saída
DB41.MAN_ON    := MAN_ON;
// Quando MAN_ON vai a FALSE: o PID começa com integrador = saída_manual → sem bump
```

---

## 3. FB42 CONT_S — Válvula Motorizada Passo a Passo

```pascal
// FB42: controla válvula motorizada por pulsos ABRIR/FECHAR
// Sem encoder: estima posição com base no tempo de acionamento (integração de tempo)
// Com encoder: realimenta a posição real via PV_IN

CALL FB42, DB42
  COM_RST  := FALSE
  MAN_ON   := FALSE
  P_SEL    := TRUE
  I_SEL    := TRUE
  D_SEL    := FALSE
  GAIN     := kp           // Kp — normalmente 1.0..5.0 para válvulas
  TI       := ti           // Ti — normalmente T#10S..T#60S
  TD       := T#0S
  CYCLE    := T#100MS     // igual ao OB35
  SP_INT   := posicao_sp  // setpoint de posição 0..100%
  PV_IN    := posicao_atual // posição medida (encoder) ou estimada
  MTR_TM   := T#30S       // tempo de curso completo: 0% → 100% (cronometrar físicamente)
  PULSE_TM := T#200MS     // pulso mínimo de abertura/fechamento (mecânica da válvula)
  DEADB_W  := 2.0         // banda morta de 2% — evita caça/fadiga do motor
  LMN_HLM  := 100.0
  LMN_LLM  := 0.0
  ER       => erro_pos
  QPOS_P   => cmd_abrir   // pulso para contator/relé de abertura (Q digital)
  QNEG_P   => cmd_fechar  // pulso para contator/relé de fechamento (Q digital)
  POS      => posicao_est // posição estimada (se sem encoder, retorna integração interna)
```

---

## 4. FB43 PULSEGEN — PWM para Saída Digital

```pascal
// FB43: converte saída REAL 0-100% do FB41 em pulso de largura variável (PWM)
// Útil quando não há módulo AO disponível (ex: controle de resistência elétrica)

// Exemplo: saída do PID de temperatura → controla relé de resistência elétrica
CALL FB43, DB43
  INV      := FALSE       // FALSE: saída direta; TRUE: lógica invertida
  PER_TM   := T#5S       // período do PWM — ciclo completo ON+OFF
                          // Exemplo: PER_TM=T#5S, LMNR_IN=60% → 3s ON / 2s OFF
  P_B_TM   := T#200MS   // tempo mínimo de pulso ligado — protege o atuador
  MAN_ON   := FALSE
  MAN      := 0.0
  LMNR_IN  := saida_pid  // entrada: saída do FB41 (0.0 a 100.0 %)
  QPULSE   => Q_resist   // saída digital → relé ou SSR (Solid State Relay)
```

---

## 5. PID_Compact — TIA Portal (S7-1200/1500)

```pascal
// Declare como multi-instância no VAR do FB pai — sem DB separado
// Chame OBRIGATORIAMENTE em OB cíclico — nunca no OB1

FUNCTION_BLOCK FB_ControleMalha
VAR
  pid     : PID_Compact;   // multi-instância — dados no IDB do FB pai
END_VAR

BEGIN
  #pid(
    Setpoint           := #sp,             // setpoint em EU
    Input              := #pv_escalada,    // PV: use sempre Input (REAL escalada)
                                           // NUNCA use Input_PER — converte internamente
    ManualEnable       := #modo_manual,    // TRUE: saída = ManualValue
    ManualValue        := #saida_manual,   // 0.0 a 100.0 % em modo manual
    Output             => #saida,          // saída 0.0 a 100.0 %
    OutputUpperLimit   := 100.0,
    OutputLowerLimit   := 0.0,
    Reset              := #reset,          // borda de subida: reinicia estado interno
    ErrorBits          => #erro_bits,      // bits de diagnóstico — veja tabela abaixo
    State              => #estado);        // estado atual do PID
END_FUNCTION_BLOCK

// Estados do PID_Compact:
// 0 = Inativo (Reset=TRUE)
// 1 = Modo automático (controle normal)
// 2 = Modo manual (ManualEnable=TRUE)
// 3 = Pre-tuning — faz degrau no SP e mede resposta
// 4 = Fine-tuning — oscilação controlada para ajuste fino
```

### Configuração de Parâmetros PID_Compact

Os parâmetros ficam no subelemento `Retain` do DB de instância:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `Retain.Kp` | REAL | Ganho proporcional |
| `Retain.Ti` | REAL | Tempo integral em segundos |
| `Retain.Td` | REAL | Tempo derivativo em segundos |
| `Retain.TdFilterCoefficient` | REAL | Coeficiente do filtro D (5..20 — padrão: 5) |
| `Retain.Cycle` | REAL | Período de amostragem em segundos (deve = período do OB) |
| `Config.InputUpperLimit` | REAL | Limite superior da PV para alarme |
| `Config.InputLowerLimit` | REAL | Limite inferior da PV para alarme |

### Bits de Diagnóstico — ErrorBits

| Bit | Valor | Significado |
|-----|-------|-------------|
| 0 | 16#0001 | Erro: instrução não chamada em OB cíclico |
| 1 | 16#0002 | Erro: Input fora do limite configurado |
| 3 | 16#0008 | Erro: PID em saturação de integrador |
| 4 | 16#0010 | Erro: Output fora dos limites |
| 7 | 16#0080 | Erro: período de amostragem inválido |

### Auto-Tuning — Procedimento Completo

```
Pré-condições para auto-tuning bem-sucedido:
  • Processo em estado estável (SP ≈ PV, sem perturbações externas ativas)
  • Limites de saída corretos configurados (OutputUpperLimit/LowerLimit)
  • PV escalada corretamente (0..100% ou unidade de engenharia real)
  • OB cíclico com período correto configurado em Retain.Cycle

Procedimento:
  1. Coloque o processo em setpoint operacional (não no limite)
  2. TIA Portal → Online → Technology objects → PID_Compact → Start tuning
  3. Selecione "Pre-tuning" → confirme (State vai para 3)
     → O PID faz degrau no SP e mede a resposta dinâmica do processo
  4. Após pre-tuning: selecione "Fine-tuning" → confirme (State vai para 4)
     → Oscilação controlada para ajuste fino dos parâmetros
  5. TIA sugerirá Kp, Ti, Td — analise e aceite ou ajuste manualmente
  6. Clique "Apply" → parâmetros gravados no Retain do DB → State volta para 1

Obs: se o processo for muito lento (tanques grandes, fornos), o pre-tuning pode
     demorar 10-30 minutos. Não interrompa.
```

---

## 6. PID_3Step — Válvula Motorizada no TIA Portal

```pascal
// PID_3Step: para válvulas motorizadas — com ou sem feedback de posição (encoder)
// Gera pulsos ABRIR/FECHAR ou posição alvo (se encoder disponível)

FUNCTION_BLOCK FB_ControleValvula
VAR
  pid_valvula : PID_3Step;
END_VAR

BEGIN
  // Com feedback de posição (encoder ou potenciômetro):
  #pid_valvula(
    Setpoint        := #posicao_sp,      // posição alvo 0..100%
    Feedback        := #posicao_atual,   // posição lida do encoder 0..100%
    FeedbackPerEn   := FALSE,            // FALSE: Feedback em %; TRUE: de periférico INT
    Actuator_H      => #cmd_abrir,       // TRUE: pulso para motor de abertura
    Actuator_L      => #cmd_fechar,      // TRUE: pulso para motor de fechamento
    Reset           := #reset_pid,
    State           => #estado);
END_FUNCTION_BLOCK

// Parâmetros críticos no Retain do DB de instância:
// MotorTimeUp      : REAL — segundos para ir de 0% a 100% (meça fisicamente)
// MotorTimeDown    : REAL — segundos para ir de 100% a 0%
// MinimumDeadband  : REAL — banda morta em % (padrão: 2.5% — evita caça)
// DeadTime         : REAL — tempo morto do processo em segundos
```

---

## 7. Diagnóstico de Malhas PID — Sintomas e Soluções

| Sintoma | Causa provável | Ação corretiva |
|---------|---------------|----------------|
| Oscilação constante com período regular | Kp muito alto | Reduza Kp em 20%; verifique se Ti não está muito pequeno |
| Resposta lenta — SP nunca alcançado | Kp muito baixo ou Ti muito alto | Aumente Kp; reduza Ti |
| Overshoot excessivo | Ti muito pequeno | Aumente Ti; considere adicionar Td com filtro |
| Saída satura mas SP nunca alcança | Restrição mecânica no atuador | Verifique limites físicos; verifique se LMN_LLM/HLM estão corretos |
| Oscilação em alta frequência (ruído) | Ação D sem filtro ou PV ruidosa | Aumente TM_LAG; adicione filtro PT1 antes do PV |
| Integrador satura sem convergir | Anti-windup não configurado | Use INT_HOLD=TRUE quando atuador saturar; verifique limites |
| PID vai a manual sozinho | MAN_ON ativado por lógica | Rastreie o sinal MAN_ON na Watch Table |
| FB41: saída fixa e ER≠0 | I_SEL=FALSE ou INT_HOLD travado | Verifique I_SEL e a condição de INT_HOLD |
| PID_Compact ErrorBits ≠ 0 | Configuração incorreta | Decodifique os bits conforme tabela acima |
| Setpoint kick — spike ao mudar SP | PFAC_SP=0 no FB41 | Mude para PFAC_SP=1.0 (P sobre PV, não sobre erro) |
| OB35 sobrecarregado | Muitas malhas PID no mesmo OB | Distribua malhas em OB35 e OB36 (períodos diferentes) |

---

## 8. PID em Cascata — Malha Mestre e Escravo

```
Arquitetura:
  SP_externo → [PID mestre] → SP_interno → [PID escravo] → Atuador → Processo → PV_externa
                                                                              ↑
                                                                         Sensor interno → PV_interna

Exemplo prático:
  Mestre: malha de temperatura (lenta — OB35 @ 1s)
  Escravo: malha de fluxo de vapor (rápida — OB35 @ 100ms)

Regra: malha escravo deve ser 4x a 10x mais rápida que a malha mestre
  • Se mestre em OB35 @ 500ms → escravo em OB35 ou OB36 @ 50ms..100ms
  • Se ambos no mesmo OB: chame o escravo primeiro, depois o mestre
```

```pascal
// Código — limitação do SP do escravo (saída do mestre):
sp_escravo := LIMIT(MN := 0.0, IN := saida_pid_mestre, MX := 100.0);

// Inicialização da cascata — evita salto ao habilitar:
IF NOT modo_cascata THEN
  // Modo single loop: cada malha opera independentemente
  DB_PID_mestre.MAN_ON := TRUE;
ELSE
  // Cascata ativa: mestre controla o SP do escravo
  DB_PID_mestre.MAN_ON := FALSE;
  DB_PID_escravo.SP_INT := saida_pid_mestre; // saída do mestre → SP do escravo
END_IF;
```

---

## 9. Feedforward — Compensação de Perturbação Conhecida

```pascal
// Feedforward: adiciona sinal de compensação à saída do PID
// Reduz impacto de perturbações conhecidas antes que o PID precise corrigir
// Resultado: resposta mais rápida a distúrbios sem aumentar Kp (sem instabilidade)

// Exemplo: tanque com alimentação variável — compensar variação de vazão de entrada
//          Mais alimentação → válvula de saída abre mais para manter o nível

CONST
  FATOR_FF : REAL := 0.8; // ajustar empiricamente (% de abertura por % de vazão)
END_CONST

feedforward := vazao_entrada_normalizada * FATOR_FF; // 0.0 a 100.0 %

// Combina saída PID (feedback) com feedforward:
saida_combinada := LIMIT(
  MN := 0.0,
  IN := saida_pid + feedforward,
  MX := 100.0);

// Converte para raw do módulo AO (4-20mA):
QW_valvula := FC_EscalaInversa(
  eu     := saida_combinada,
  eu_lo  := 0.0,
  eu_hi  := 100.0,
  raw_lo := 6912.0,   // 4mA
  raw_hi := 27648.0); // 20mA
```

---

## 10. Sintonia — Métodos e Tabelas de Referência

### Método Ziegler-Nichols — Malha Fechada (Mais Usado)

```
Pré-requisito: processo estável em malha fechada

Passo 1: desabilite I e D (I_SEL=FALSE, D_SEL=FALSE ou Ti=∞, Td=0)
Passo 2: aumente Kp lentamente até oscilação sustentada (amplitude constante)
Passo 3: anote Ku (Kp crítico) e Tu (período da oscilação em segundos)
Passo 4: calcule parâmetros finais:

  Controlador   Kp              Ti                  Td
  ─────────────────────────────────────────────────────────────────────────
  P             0.50 × Ku       ∞ (desabilitado)    0
  PI            0.45 × Ku       0.83 × Tu           0
  PD            0.80 × Ku       ∞                   0.125 × Tu
  PID           0.60 × Ku       0.50 × Tu           0.125 × Tu
  PID (menos ov.)0.33 × Ku      0.50 × Tu           0.33 × Tu  (Tyreus-Luyben)
```

### Método Cohen-Coon — Para Processos com Tempo Morto

```
Aplica-se quando: tempo morto (Td) é significativo em relação à constante de tempo (τ)
Identificação: faça degrau em malha aberta e meça:
  K  = ganho estático (ΔPV / ΔSaída em estado estacionário)
  τ  = constante de tempo (tempo para 63% da variação)
  θ  = tempo morto (atraso antes da resposta)

  Razão θ/τ > 0.5 → processo difícil de controlar → considere Smith Predictor

PI Cohen-Coon:
  Kp = (1/K) × (τ/θ) × (0.9 + θ/(12τ))
  Ti = θ × (30 + 3θ/τ) / (9 + 20θ/τ)
```

---

## 11. Anti-Windup — Proteção do Integrador

```pascal
// Anti-windup: evita que o integrador continue acumulando quando a saída está saturada
// Sem anti-windup: ao sair da saturação, o PID demora muito para responder
// (o integrador acumulou muito — precisa "desacumular" antes de sair da saturação)

// Método 1 — INT_HOLD (FB41): congela o integrador quando saída satura
IF saida_pid >= 100.0 AND erro_pid > 0.0 THEN
  // "Saída no limite superior e erro positivo (SP > PV) — não deixa integrador crescer"
  DB41.INT_HOLD := TRUE;
ELSIF saida_pid <= 0.0 AND erro_pid < 0.0 THEN
  // "Saída no limite inferior e erro negativo (SP < PV) — não deixa integrador diminuir"
  DB41.INT_HOLD := TRUE;
ELSE
  DB41.INT_HOLD := FALSE;
END_IF;

// Método 2 — Back-calculation (PID_Compact): automático
// O PID_Compact implementa anti-windup por back-calculation internamente
// Parâmetro: Retain.PWeighting / Retain.DWeighting controlam o comportamento
// (configurar via TIA Portal → Technology objects → PID → Advanced settings)
```
