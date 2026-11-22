---
name: analogicos-escalonamento
description: Escalonamento de Sinais Analógicos — Fórmulas, FC genéricas, NORM_X/SCALE_X, filtros e detecção de falhas para S7-300/400 e TIA Portal
---

# Escalonamento de Sinais Analógicos — S7-300/400 e S7-1200/1500

> **Autor:** REGINALDO LOBO | Referência interna da skill SIEMENS_S7_BLOCO

---

## 1. Contagens Brutas por Tipo de Sinal

| Sinal | Raw Mín | Raw Máx | Fio Partido (<) | Observação |
|-------|---------|---------|-----------------|------------|
| 0–20 mA | 0 | 27648 | N/A | Faixa unipolar completa |
| 4–20 mA | 6912 | 27648 | 1380 (~1 mA) | 6912 = 25% de 27648 |
| 0–10 V | 0 | 27648 | N/A | |
| 1–5 V | 5530 | 27648 | 1380 | |
| -10–+10 V | -27648 | +27648 | N/A | Bipolar |
| PT100 / PT1000 | varia | varia | — | Retorna centésimos de °C |
| Faixa estendida (+5%) | 27649 | 32511 | — | Acima do máximo configurado |
| Overflow | 32512 | 32767 | — | Curto-circuito ou defeito |
| Underflow | -32512 | -32511 | — | Abaixo do mínimo absoluto |

> **Regra de ouro:** raw < 1380 em circuito 4-20mA = fio partido.
> Não escale — declare falha de instrumentação imediatamente.

---

## 2. Fórmula de Escalonamento Linear

```
EU = ((raw - raw_min) / (raw_max - raw_min)) × (eu_max - eu_min) + eu_min
```

---

## 3. FC de Escalonamento — STEP 7 Clássico (SCL)

```pascal
(* FC genérica de escalonamento — S7-300/400 SCL                        *)
(* Inclui proteção contra divisão por zero e limitação de faixa          *)

FUNCTION FC_Escala : REAL
TITLE = 'Escalonamento Analógico Linear'
VERSION : '1.0'
AUTHOR  : ReginaldoLobo

VAR_INPUT
  raw    : INT;    // valor bruto lido do módulo AI
  raw_lo : REAL;   // contagem mínima (ex: 0 para 0-20mA, 6912 para 4-20mA)
  raw_hi : REAL;   // contagem máxima (normalmente 27648)
  eu_lo  : REAL;   // unidade de engenharia mínima (ex: 0.0)
  eu_hi  : REAL;   // unidade de engenharia máxima (ex: 100.0)
END_VAR

VAR_TEMP
  raw_real : REAL;
  raw_span : REAL;
END_VAR

BEGIN
  raw_real := INT_TO_REAL(raw);
  raw_span := raw_hi - raw_lo;

  // "Proteção contra divisão por zero — configuração de span inválida"
  IF raw_span = 0.0 THEN
    FC_Escala := eu_lo;
    RETURN;
  END_IF;

  // "Fórmula de escalonamento linear"
  FC_Escala := ((raw_real - raw_lo) / raw_span) * (eu_hi - eu_lo) + eu_lo;

  // "Limita à faixa declarada — protege contra ruído ou saturação do sensor"
  IF FC_Escala > eu_hi THEN FC_Escala := eu_hi; END_IF;
  IF FC_Escala < eu_lo THEN FC_Escala := eu_lo; END_IF;
END_FUNCTION
```

### Exemplos de Uso da FC_Escala

```pascal
// Sensor de pressão 4-20mA → 0.0 a 10.0 bar
pressao_bar := FC_Escala(
  raw    := IW4,
  raw_lo := 6912.0,
  raw_hi := 27648.0,
  eu_lo  := 0.0,
  eu_hi  := 10.0);

// PT100 0-150°C — SM331 retorna em centésimos de grau (15000 = 150.00°C)
temperatura := FC_Escala(
  raw    := IW8,
  raw_lo := 0.0,
  raw_hi := 15000.0,
  eu_lo  := 0.0,
  eu_hi  := 150.0);

// Nível 4-20mA → 0.0 a 5.0 metros
nivel_m := FC_Escala(
  raw    := MW200,
  raw_lo := 6912.0,
  raw_hi := 27648.0,
  eu_lo  := 0.0,
  eu_hi  := 5.0);
```

---

## 4. TIA Portal — NORM_X + SCALE_X

```pascal
// "NORM_X: normaliza raw para 0.0..1.0 dentro da faixa MIN..MAX"
// "SCALE_X: expande 0.0..1.0 para a faixa de EU desejada"
// Equivalente à FC_Escala mas usando funções de sistema nativas do TIA Portal

VAR
  raw_int  : INT;
  norm     : REAL;   // intermediário normalizado 0.0..1.0
  pressao  : REAL;   // resultado em unidade de engenharia
END_VAR

raw_int := "AI_Pressao_Tag"; // tag configurada no hardware config do TIA Portal

// Passo 1 — normaliza
norm := NORM_X(MIN := 6912,       // 4 mA
               VALUE := raw_int,
               MAX := 27648);     // 20 mA

// Passo 2 — escala para EU
pressao := SCALE_X(MIN := 0.0,   // 0.0 bar
                   VALUE := norm,
                   MAX := 10.0); // 10.0 bar

// "NORM_X aceita INT diretamente no TIA Portal — conversão implícita"
// "Para 0-10V: MIN := 0, MAX := 27648"
// "Para bipolar -10..+10V: MIN := -27648, MAX := 27648"
```

---

## 5. Detecção de Fio Partido e Overflow

```pascal
// "Execute ANTES de escalar — dado inválido não deve chegar ao controle"

CONST
  LIMITE_FIO_PARTIDO : INT := 1380;  // ~1mA — limiar padrão para 4-20mA
  LIMITE_OVERFLOW    : INT := 32511; // limite superior da faixa estendida
END_CONST

// Fio partido — abaixo do mínimo absoluto
IF raw_int < LIMITE_FIO_PARTIDO THEN
  dados.em_falha  := TRUE;
  dados.cod_falha := 10;    // código 10 = fio partido / sensor desconectado
  RETURN;
END_IF;

// Overflow — sensor saturado ou curto-circuito
IF raw_int > LIMITE_OVERFLOW THEN
  dados.em_falha  := TRUE;
  dados.cod_falha := 11;    // código 11 = overflow analógico
  RETURN;
END_IF;

// Dado válido — processa normalmente
pressao := FC_Escala(raw := raw_int, ...);
```

---

## 6. Filtro de Média Móvel (Moving Average)

```pascal
// "Remove ruído de alta frequência — ideal para sinais com interferência EM"
// "N = número de amostras: maior N = menos ruído, mais atraso de resposta"
// "Recomendado: N = 4..16 para ciclos de 5ms a 100ms"

FUNCTION_BLOCK FB_FiltroMedia
TITLE = 'Filtro de Média Móvel Analógica'
VERSION : '1.0'
AUTHOR  : ReginaldoLobo

VAR_INPUT
  entrada : REAL;       // sinal de entrada (já escalado para EU)
  N       : INT := 8;   // janela de amostras (1..32)
END_VAR

VAR_OUTPUT
  saida   : REAL;       // valor filtrado
END_VAR

VAR
  buffer  : ARRAY[0..31] OF REAL; // buffer circular
  indice  : INT := 0;
  n_efet  : INT := 0;
END_VAR

VAR_TEMP
  i    : INT;
  soma : REAL;
END_VAR

BEGIN
  n_efet := LIMIT(MN := 1, IN := N, MX := 32);

  buffer[indice] := entrada;
  indice := (indice + 1) MOD n_efet;

  soma := 0.0;
  FOR i := 0 TO n_efet - 1 DO
    soma := soma + buffer[i];
  END_FOR;

  saida := soma / INT_TO_REAL(n_efet);
END_FUNCTION_BLOCK
```

---

## 7. Filtro PT1 — Passa-Baixa de Primeira Ordem

```pascal
// "Mais eficiente que média móvel — resposta exponencial ao degrau"
// "alpha próximo de 1.0 = responsivo (pouco filtro)"
// "alpha próximo de 0.0 = suave (muito filtro, atraso maior)"
// "Cálculo de alpha: alpha = dt / (tau + dt)"
// "  dt  = período de amostragem em segundos (ex: 0.1 para OB35 de 100ms)"
// "  tau = constante de tempo desejada em segundos (ex: 1.0 para 1s)"
// "  Exemplo: tau=1s, dt=100ms → alpha = 0.1 / (1.0 + 0.1) ≈ 0.091"

FUNCTION_BLOCK FB_FiltroPT1
TITLE = 'Filtro PT1 Passa-Baixa de 1ª Ordem'
VERSION : '1.0'
AUTHOR  : ReginaldoLobo

VAR_INPUT
  entrada : REAL;
  alpha   : REAL := 0.1; // fator de suavização 0.0..1.0
END_VAR

VAR_OUTPUT
  saida   : REAL;
END_VAR

VAR
  saida_ant  : REAL;
  inicializa : BOOL := TRUE;
END_VAR

BEGIN
  IF inicializa THEN
    // "Inicializa com o valor atual para evitar spike no arranque"
    saida_ant := entrada;
    inicializa := FALSE;
  END_IF;

  // "y[n] = alpha * x[n] + (1 - alpha) * y[n-1]"
  saida     := alpha * entrada + (1.0 - alpha) * saida_ant;
  saida_ant := saida;
END_FUNCTION_BLOCK
```

---

## 8. Escalonamento Inverso — Saída Analógica (AO)

```pascal
// "Converte unidade de engenharia de volta para contagem raw do módulo AO"
// "Usado para escrever setpoints e saídas de PID em módulos analógicos"

FUNCTION FC_EscalaInversa : INT
TITLE = 'Escalonamento Inverso para Saída Analógica'
VERSION : '1.0'
AUTHOR  : ReginaldoLobo

VAR_INPUT
  eu     : REAL;    // valor em unidade de engenharia a converter
  eu_lo  : REAL;    // EU mínima (ex: 0.0)
  eu_hi  : REAL;    // EU máxima (ex: 100.0)
  raw_lo : REAL;    // contagem raw mínima do módulo AO (ex: 6912 para 4-20mA)
  raw_hi : REAL;    // contagem raw máxima (ex: 27648 para 20mA)
END_VAR

VAR_TEMP
  raw_real : REAL;
  eu_span  : REAL;
END_VAR

BEGIN
  eu_span := eu_hi - eu_lo;

  IF eu_span = 0.0 THEN
    FC_EscalaInversa := REAL_TO_INT(raw_lo);
    RETURN;
  END_IF;

  raw_real := ((eu - eu_lo) / eu_span) * (raw_hi - raw_lo) + raw_lo;

  // "Limita à faixa válida do módulo AO"
  raw_real := LIMIT(MN := raw_lo, IN := raw_real, MX := raw_hi);

  FC_EscalaInversa := REAL_TO_INT(raw_real);
END_FUNCTION

// Exemplo — saída PID 0..100% → válvula 4-20mA (6912..27648):
QW4 := FC_EscalaInversa(
  eu     := saida_pid,    // 0.0 a 100.0 %
  eu_lo  := 0.0,
  eu_hi  := 100.0,
  raw_lo := 6912.0,       // 4mA
  raw_hi := 27648.0);     // 20mA
```

---

## 9. Tabela de Módulos Analógicos por Plataforma

| Plataforma | Módulo | Canais | Resolução | Tipos de sinal |
|------------|--------|--------|-----------|----------------|
| S7-300 | SM 331 AI 8×12bit | 8 | 12 bits | U, I, RTD, TC |
| S7-300 | SM 331 AI 8×16bit | 8 | 16 bits | Alta precisão |
| S7-300 | SM 332 AO 4×12bit | 4 | 12 bits | 0/4-20mA, 0/1-10V |
| S7-400 | SM 431 AI 16×16bit | 16 | 16 bits | Alta densidade |
| S7-1200 | SM 1231 AI 4/8ch | 4 ou 8 | 12/13 bits | U, I |
| S7-1200 | SM 1231 RTD 4ch | 4 | 16 bits | PT100/PT1000/Ni |
| S7-1500 | AI 8×U/I/RTD/TC | 8 | 16 bits | Auto-tipo por canal |
| ET200SP | AI 4×U/I 2-wire | 4 | 13 bits | Módulo compacto |

> **Leitura consistente em PROFIBUS/PROFINET:** quando o telegrama do módulo AI
> excede 4 bytes, use SFC14 (DPRD_DAT) / DPRD_DAT (TIA) em vez de leitura
> direta via PIW para garantir consistência dos dados multi-byte.
