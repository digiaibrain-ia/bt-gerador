# Funções Core — Referência Completa

> 💡 **Para times não técnicos:** estas são funções prontas do Siemens — como
> fórmulas de Excel. Use sempre as nativas em vez de reprogramar manualmente:
> são mais rápidas, testadas e livres de bugs.

Lembre-se da regra dos parâmetros nomeados: `:=` para entradas, `=>` para saídas.

## Índice
- Matemáticas: LIMIT, MIN, MAX, ABS, SQRT, SQR
- Timers (em VAR!): TON, TOF, TP
- Contadores (em VAR!): CTU, CTD, CTUD
- Bordas (em VAR!): R_TRIG, F_TRIG
- Seleção/bits: SEL, MUX, ROL, ROR, SHL, SHR
- Conversão: TRUNC, ROUND, CEIL, FLOOR, TO_REAL/TO_DINT/TO_INT/TO_WORD
- Strings: CONCAT, LEN, LEFT/RIGHT/MID, FIND, DELETE, INSERT, INT_TO_STRING
- Move/copy: MOVE_BLK, FILL_BLK
- Escalonamento: NORM_X + SCALE_X (detalhe em analogicos.md)
- Estruturas de controle (loops e armadilhas)

---

## Matemáticas

```scl
// LIMIT — prende o valor numa faixa segura.
// POR QUÊ: operador pode digitar 5000 RPM num motor de 3000 — LIMIT protege.
velocidade := LIMIT(MN := 0.0, IN := setpointBruto, MX := 3000.0);

// MIN / MAX — menor/maior entre até 32 entradas
tempMin  := MIN(IN1 := s1, IN2 := s2, IN3 := s3);
pico     := MAX(IN1 := valorAtual, IN2 := picoAnterior);

// ABS — valor absoluto (remove sinal). Útil para desvio/distância e tolerância.
erro := ABS(IN := setpoint - valorAtual);
IF ABS(IN := posicao - 333.80) < 0.005 THEN naPosicao := TRUE; END_IF;  // ±5µm

// SQRT — SEMPRE validar entrada >= 0 antes (raiz de negativo trava a CPU!)
IF arg >= 0.0 THEN dist := SQRT(IN := arg); ELSE dist := 0.0; erroCalc := TRUE; END_IF;

// SQR — quadrado (x²)
energia := (massa * SQR(IN := velocidade)) / 2.0;
```
Outras: `EXP · LN · LOG · SIN · COS · TAN · ASIN · ACOS · ATAN · ** (potência, só Real)`.

---

## Timers — SEMPRE em VAR, nunca VAR_TEMP

```scl
// TON — On-Delay (o mais usado). Q fica TRUE depois que IN ficou TRUE por PT.
//   IN: ___/‾‾‾‾‾‾\___      Q: _______/‾‾‾‾\___
VAR tonEspera : TON; END_VAR
#tonEspera(IN := condicao, PT := T#2s);    // espera 2s de condição estável
IF #tonEspera.Q THEN liberar(); END_IF;    // tempo decorrido: #tonEspera.ET

// TOF — Off-Delay. Q cai PT depois que IN caiu (mantém ligado mais um tempo).
// POR QUÊ: manter ventilador 30s após desligar o aquecedor (dissipa calor).
VAR tofVent : TOF; END_VAR
#tofVent(IN := aquecedor, PT := T#30s);
ventilador := #tofVent.Q;

// TP — Pulso de duração fixa. Ignora IN durante o pulso (anti múltiplos cliques).
VAR tpPulso : TP; END_VAR
#tpPulso(IN := gatilho, PT := T#200ms);
saida := #tpPulso.Q;     // exatamente 200ms
```

---

## Contadores — SEMPRE em VAR

```scl
// CTU — conta para cima. Q=TRUE quando CV >= PV.
VAR ctuPecas : CTU; END_VAR
#ctuPecas(CU := sensorPeca, R := resetBotao, PV := 100);  // CV em #ctuPecas.CV
IF #ctuPecas.Q THEN loteConcluido := TRUE; END_IF;

// CTD — conta para baixo. Q=TRUE quando CV <= 0. LD carrega o PV no CV.
VAR ctdReg : CTD; END_VAR
#ctdReg(CD := decrementar, LD := carregar, PV := 50);

// CTUD — bidirecional (controle de estoque: entra ↑, sai ↓).
VAR ctudEstoque : CTUD; END_VAR
#ctudEstoque(CU := entrada, CD := saida, R := reset, LD := FALSE, PV := 1000);
// QU=TRUE quando CV>=PV (cheio)   ·   QD=TRUE quando CV<=0 (vazio)
```

---

## Detecção de borda — SEMPRE em VAR

```scl
// R_TRIG — borda de subida (0→1): pega o MOMENTO do clique, não o nível.
// POR QUÊ: sem ele, um botão segurado executaria a ação centenas de vezes.
VAR trigSub : R_TRIG; END_VAR
#trigSub(CLK := sinal);
IF #trigSub.Q THEN acaoUnica(); END_IF;   // roda 1 scan (~10ms)

// F_TRIG — borda de descida (1→0): confirma, p.ex., que um cilindro voltou.
VAR trigDesc : F_TRIG; END_VAR
#trigDesc(CLK := sinal);
IF #trigDesc.Q THEN acaoNoRetorno(); END_IF;
```

---

## Seleção e bits

```scl
// SEL — IF ternário de uma linha: G=FALSE→IN0, G=TRUE→IN1
setpointAtivo := SEL(G := modoAuto, IN0 := spManual, IN1 := spAuto);

// MUX — seleciona entre N opções por índice K (0→IN0, 1→IN1…)
receita := MUX(K := numReceita, IN0 := r1, IN1 := r2, IN2 := r3, IN3 := r4);

// ROL/ROR — rotação de bits (varredura sequencial de saídas)
padrao := ROL(IN := 16#0F, N := 3);   // ROR é o inverso

// SHL/SHR — shift (SHL multiplica por 2^N; SHR divide)
mascara := SHL(IN := 16#01, N := bitPos);   // ativa um bit específico
```

---

## Conversão de tipos

```scl
inteiro  := TRUNC(IN := 45.89);  // 45 — trunca (em direção a zero)
count    := ROUND(IN := 7.5);    // 8  — arredonda (empate p/ cima)
lotes    := CEIL(IN := 3.1);     // 4  — sempre p/ cima
piso     := FLOOR(IN := 3.9);    // 3  — sempre p/ baixo

// TO_REAL — CRÍTICO antes de divisão (senão Int/Int trunca: 5/2=2, não 2.5)
media   := TO_REAL(soma) / TO_REAL(count);   // ✅
realVal := TO_REAL(intVal);
dintVal := TO_DINT(intVal);   // amplia — seguro
intVal  := TO_INT(dintVal);   // reduz — verifique overflow!
```

---

## Strings (todos os ambientes)

```scl
// CONCAT — concatenar. POR QUÊ não "+": o operador + não existe p/ string em SCL.
msg := CONCAT(IN1 := 'Erro na ', IN2 := nomeEquip);
comprimento := LEN(IN := nome);
prefixo := LEFT(IN := 'MOTOR_001', L := 5);     // 'MOTOR'
sufixo  := RIGHT(IN := 'MOTOR_001', L := 3);    // '001'
meio    := MID(IN := 'MOTOR_001', L := 3, P := 7); // '001' (P = posição base 1)
pos     := FIND(IN1 := texto, IN2 := 'ERR');    // 0 se não achou
texto   := DELETE(IN := 'Tanque', L := 3, P := 4);  // 'Tan'
texto   := INSERT(IN1 := 'Tan', IN2 := 'que', P := 4); // 'Tanque'
strNum  := INT_TO_STRING(IN := numValvula);     // 14 → '14'
// ⚠ declare sempre STRING[n] com folga — truncamento é SILENCIOSO.
```
Para comunicação serial/Modbus: `STRG_TO_CHARS` / `CHARS_TO_STRG`.

---

## Move / Copy (muito mais rápido que FOR)

```scl
// MOVE_BLK — copia array inteiro numa instrução (10-20× mais rápido que FOR).
MOVE_BLK(IN := origem[1], COUNT := 24, OUT => destino[1]);

// FILL_BLK — preenche/zera array inteiro (10-15× mais rápido que FOR).
FILL_BLK(IN := FALSE, COUNT := 24, OUT => valvulas[1]);
FILL_BLK(IN := 0.0,  COUNT := 10, OUT => temperaturas[0]);
```

---

## Estruturas de controle — loops e armadilhas

```scl
FOR i := 0 TO 9 DO temperaturas[i] := lerSensor(i); END_FOR;
FOR i := 10 DOWNTO 0 DO buffer[i] := 0; END_FOR;
FOR i := 0 TO 100 BY 5 DO processar(i); END_FOR;

// EXIT — sai do loop ao encontrar (não continua testando)
FOR i := 0 TO 99 DO
  IF dados[i] = procurado THEN indice := i; EXIT; END_IF;
END_FOR;

// CONTINUE — pula a iteração
FOR i := 0 TO 99 DO
  IF dados[i] < 0 THEN CONTINUE; END_IF;   // ignora negativos
  processar(dados[i]);
END_FOR;

WHILE c < 100 AND NOT erro DO c := c + 1; END_WHILE;   // testa ANTES

// ⚠ REPEAT termina quando a condição vira TRUE (oposto do WHILE!)
REPEAT
  valor := lerSensor(); tentativas := tentativas + 1;
UNTIL (valor > limiar) OR (tentativas >= maxTent)
END_REPEAT;
```
