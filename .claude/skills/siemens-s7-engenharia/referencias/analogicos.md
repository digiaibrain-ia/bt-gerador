# Sinais Analógicos e Escalonamento

> 💡 **Para times não técnicos:** módulos analógicos convertem grandezas físicas
> (pressão, temperatura, posição) em números brutos (*raw*) que o CLP entende.
> Esta referência mostra como transformar esse número de volta na unidade real
> (bar, °C, mm) e como detectar fiação rompida e filtrar ruído.

## 1. Tabela raw → engenharia (módulos Siemens)

| Sinal | Raw mín | Raw máx | Observação |
|---|---|---|---|
| 0-20 mA | 0 | 27.648 | — |
| **4-20 mA** | 5.530 / 6.912 * | 27.648 | **fio partido se raw < 1.380** |
| 0-10 V | 0 | 27.648 | — |
| Bipolar ±10 V | -27.648 | 27.648 | zero = 0 |
| PT100 (-200..+850°C) | -2.000 | 8.500 | valor = temperatura × 10 |
| Faixa estendida (+5%) | 27.649 | 32.511 | sobrefaixa |
| Overflow / curto | 32.512 | 32.767 | falha |

\* O raw correspondente a 4 mA varia conforme o módulo/parametrização (5.530 em
muitos manuais, 6.912 em outros). **Confirme no datasheet do seu módulo** e use o
valor de 4 mA como `MIN` do `NORM_X` quando quiser que 4 mA = início da escala.

## 2. Pipeline TIA Portal — NORM_X + SCALE_X

```scl
// POR QUÊ NORM_X+SCALE_X: converte o raw na unidade de engenharia de forma nativa.
// Passo 1 — normaliza o raw para 0.0..1.0
normalizado := NORM_X(MIN := 0.0, VALUE := TO_REAL(rawADC), MAX := 27648.0);
// Passo 2 — escala 0.0..1.0 para a unidade física
pressaoBar  := SCALE_X(MIN := 0.0,   VALUE := normalizado, MAX := 16.0);   // 0-16 bar
tempCelsius := SCALE_X(MIN := -10.0, VALUE := normalizado, MAX := 150.0);  // -10..150°C
posicaoMM   := SCALE_X(MIN := 0.0,   VALUE := normalizado, MAX := 500.0);  // 0-500mm
```

## 3. Detecção de fio partido — SEMPRE antes de escalar

```scl
// POR QUÊ 1380: ≈ 5% do fundo de escala ≈ 3 mA. Abaixo de 4 mA = fio rompido.
// Detectar isto evita que o processo opere com leitura falsa de "zero".
IF rawADC < 1380 THEN
  fioPartido := TRUE;
  dados.emFalha := TRUE;  dados.codFalha := 10;
  pressaoBar := 0.0;      // valor seguro
  RETURN;
END_IF;
```

## 4. STEP 7 clássico — escala por fórmula (FC)

```scl
// Sem NORM_X/SCALE_X no STEP 7 antigo: regra de três direta.
FC_Escala := ((INT_TO_REAL(raw) - rawLo) / (rawHi - rawLo)) * (euHi - euLo) + euLo;
```

## 5. Filtro digital PT1 (passa-baixa)

```scl
// POR QUÊ filtrar: sinal analógico tem ruído elétrico. O filtro suaviza variações
// rápidas mantendo a tendência real. T_filtro grande = mais suave/lento.
VAR filtrado : Real; END_VAR
// y(k) = y(k-1) + (x(k) - y(k-1)) × (T_ciclo / (T_ciclo + T_filtro))
filtrado := filtrado + (entradaBruta - filtrado) * (0.1 / (0.1 + 2.0));
// T_ciclo = 0.1s (100ms), T_filtro = 2.0s → suavização de ~2 segundos
```

## 6. Média móvel (janela)

```scl
// POR QUÊ média móvel: elimina picos esporádicos melhor que o PT1.
VAR
  buffer : Array[0..9] of Real;   // janela de 10 amostras
  soma   : Real;  indice : Int;  media : Real;
END_VAR
soma          := soma - buffer[indice] + entradaBruta;
buffer[indice]:= entradaBruta;
indice        := (indice + 1) MOD 10;   // índice circular
media         := soma / 10.0;
```

## 7. Saída analógica (AO) — escala inversa

```scl
// Engenharia → raw, para enviar a um conversor D/A (válvula proporcional, inversor):
norm := NORM_X(MIN := 0.0, VALUE := saidaEU, MAX := 100.0);   // 0..100% → 0..1
rawAO := REAL_TO_INT(SCALE_X(MIN := 0.0, VALUE := norm, MAX := 27648.0));
```
