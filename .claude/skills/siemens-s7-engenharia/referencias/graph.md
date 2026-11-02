# GRAPH — Sequenciadores (SFC)

> 💡 **Para times não técnicos:** GRAPH é uma linguagem visual para programar
> sequências de processo — como uma receita onde cada "passo" só avança para o
> próximo quando as condições (transições) são atendidas.

GRAPH compila como um FB com *steps*, *transitions* e *actions* (SFC da IEC 61131-3).

## 1. Estrutura

```
Step S1 ──[Ação N: LigarMotor := TRUE]
   ↓
Transition T1 ──[Condição: MotorLigado AND PressaoOK]
   ↓
Step S2 ──[Ação N: AbrirValvula := TRUE]
   ↓
Transition T2 ──[Condição: NivelAlvo OR Timeout (S2.T > T#30s)]
```

## 2. Variáveis automáticas de cada passo Sx

```
Sx.X  (Bool) = TRUE quando o passo Sx está ATIVO
Sx.T  (Time) = tempo desde que o passo ficou ativo
Sx.U  (DInt) = quantas vezes o passo foi ativado
```
```scl
// Uso típico — detectar passo lento (supervisão de tempo manual):
IF "FB_Envase".S3.X AND "FB_Envase".S3.T > T#30s THEN alarmeLento := TRUE; END_IF;
```

## 3. Qualificadores de ação

| N | S | R | D | L | P |
|---|---|---|---|---|---|
| ativa só enquanto o passo está ativo | Set (permanece) | Reset (limpa o S) | Delay (como TON) | Limited (como TP) | Pulse (1 scan na ativação) |

## 4. Supervisão

- **S1 — Interlock:** bloqueia o AVANÇO da transição (HOLD). Use para condições de
  segurança que devem estar OK (porta fechada, pressão na faixa).
- **S2 — Supervision:** monitora o TEMPO no passo. Excedeu → `ERR_FLT = TRUE` e vai
  para o passo de erro. Use para detectar travamentos.

## 5. Interface do FB GRAPH

```scl
// INIT_SQ → inicializa no passo inicial (use na partida / OB100)
// ACK_EF  → acknowledge de erro do sequenciador
// OFF_SQ  → desativa o sequenciador (todos os passos inativos)
// SW_AUTO / SW_MAN → modo automático / manual ·  S_NEXT → avança um passo
"FB_Envase".DB1(INIT_SQ := reiniciar, ACK_EF := confirmarErro, S_NEXT := avancar,
                OFF_SQ := emergencia, SW_AUTO := modoAuto, SW_MAN := modoManual);
IF "FB_Envase".ERR_FLT THEN /* supervisão S2 disparou → aguardar ACK_EF */ END_IF;
```
