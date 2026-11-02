---
name: ponteiros-enderecos-indiretos
description: Ponteiros e Endereçamento Indireto em STEP 7 Clássico — P#, ANY, AR1/AR2 e equivalentes TIA Portal VARIANT/ARRAY[*]
---

# Ponteiros e Endereçamento Indireto — STEP 7 Clássico (S7-300/400)

> **Autor:** REGINALDO LOBO | Referência interna da skill SIEMENS_S7_BLOCO
> **Aplica-se a:** STEP 7 V5.x — STL e SCL para S7-300/400
> **TIA Portal S7-1200/1500:** use VARIANT e ARRAY[*] — veja seção 7 deste arquivo

---

## 1. Tipos de Ponteiro no STEP 7

| Tipo | Tamanho | Sintaxe | Uso |
|------|---------|---------|-----|
| **Ponteiro de memória** | 32 bits (DWORD) | `P#byte.bit` | Endereço sem área — relativo ao DB/L aberto |
| **Ponteiro de área** | 32 bits + área | `P#I 0.0`, `P#M 10.0` | Inclui a área de memória |
| **ANY pointer** | 80 bits (10 bytes) | estrutura manual | Descreve bloco tipado completo |

---

## 2. Ponteiro de Memória — P#byte.bit

```pascal
// Ponteiro de memória: referencia offset dentro de uma área já aberta (OPN DB, L)
// Armazenado em DWORD — byte * 8 + bit

// Em STL: carrega ponteiro e usa com AR1/AR2
L  P#10.0      // carrega ponteiro para offset byte 10, bit 0
T  AR1         // armazena no Registrador de Endereço 1

// Acesso indireto via AR1 (registrador de área interna):
L  DBW[AR1, P#0.0]   // lê word no offset apontado por AR1 (byte 10)
L  DBW[AR1, P#2.0]   // lê word 2 bytes depois (byte 12)
T  DBW[AR1, P#4.0]   // escreve word 4 bytes depois (byte 14)

// Incrementa o ponteiro para varrer estruturas:
L  AR1
L  P#4.0       // offset de 4 bytes (tamanho de DWORD)
+D             // soma (DINT add)
T  AR1         // ponteiro avançado 4 bytes
```

---

## 3. Ponteiro de Área — Inclui a Área de Memória

```pascal
// Ponteiro de área: 32 bits que codifica área + byte + bit
// Bit 31..24: área (I=0x81, Q=0x82, M=0x83, DB=0x84, L=0x86)
// Bit 18..3 : endereço de byte
// Bit 2..0  : endereço de bit

// Exemplos de ponteiros de área em STL:
L  P#I  0.0    // ponteiro para byte 0 das entradas
L  P#Q  4.0    // ponteiro para byte 4 das saídas
L  P#M  10.3   // ponteiro para bit 3 do byte 10 das marcas
L  P#DB20.DBX 0.0   // ponteiro para DB20, byte 0, bit 0

// Uso com instrução SFC (ex: SFC20 BLKMOV):
CALL SFC20     // BLKMOV — copia bloco de memória
  SRCBLK := P#DB10.DBX0.0 BYTE 20   // fonte: DB10, 20 bytes a partir de DBX0.0
  DSTBLK := P#DB11.DBX0.0 BYTE 20   // destino: DB11
  RET_VAL := MW100                   // código de retorno
```

---

## 4. ANY Pointer — Estrutura de 10 Bytes

O ANY pointer é um ponteiro genérico de 10 bytes que descreve completamente um bloco de dados tipado. É necessário para SFCs e SFBs que aceitam dados de qualquer tipo.

### Estrutura dos 10 Bytes

| Bytes | Conteúdo | Valor típico |
|-------|----------|-------------|
| 0 | Sintaxe (sempre 16#10) | `B#16#10` |
| 1 | Tipo de dado (código IEC) | veja tabela abaixo |
| 2–3 | Número de repetições (WORD) | ex: `W#16#0001` |
| 4–5 | Número do DB (WORD; 0 = área M/I/Q) | ex: `W#16#000A` (DB10) |
| 6–9 | Ponteiro de área (DWORD) | ex: `P#DBX 0.0` |

### Códigos de Tipo de Dado (Byte 1)

| Código | Tipo | | Código | Tipo |
|--------|------|-|--------|------|
| 16#01 | BOOL | | 16#07 | DWORD |
| 16#02 | BYTE | | 16#08 | INT |
| 16#03 | CHAR | | 16#09 | DINT |
| 16#04 | WORD | | 16#0A | REAL |
| 16#05 | INT (=WORD) | | 16#0E | DATE_AND_TIME |
| 16#06 | DWORD | | 16#13 | STRING |

### Montagem Manual de ANY em STL

```pascal
// Objetivo: ANY apontando para DB10.DBW20 — 5 elementos INT
// Bytes: 10#16#10, tipo_INT=16#02, count=5, DB=10, P#DBX20.0

// Em STL, montando no byte 0 de DB50 (buffer ANY):
L  B#16#10         // sintaxe
T  DB50.DBB0
L  B#16#02         // tipo BYTE (ou 16#08 para INT)
T  DB50.DBB1
L  W#16#0005       // 5 repetições
T  DB50.DBW2
L  W#16#000A       // DB10
T  DB50.DBW4
L  P#DBX 20.0      // offset byte 20 do DB
T  DB50.DBD6       // 4 bytes do ponteiro de área
```

### ANY em SCL para Chamada de SFC

```pascal
// Declarando ANY como parâmetro de SFC em SCL
// "Em SCL, use a palavra-chave ANY para o tipo — o compilador monta os 10 bytes"

FUNCTION FC_CopiaBloco : VOID
VAR_INPUT
  fonte   : ANY;    // ponteiro ANY para a fonte
  destino : ANY;    // ponteiro ANY para o destino
END_VAR
BEGIN
  CALL SFC20 (      // BLKMOV
    SRCBLK := fonte,
    DSTBLK := destino,
    RET_VAL := MW100);
END_FUNCTION

// Chamando com referência de DB:
FC_CopiaBloco(
  fonte   := DB10.dados_brutos,  // SCL converte automaticamente para ANY
  destino := DB11.dados_copia);
```

---

## 5. Registradores de Endereço AR1 e AR2

Os registradores `AR1` e `AR2` são registradores internos da CPU de 32 bits usados para endereçamento indireto em STL.

```pascal
// ── Carregamento de AR ───────────────────────────────────────────────────
L  P#M 100.0   // carrega ponteiro de área para M100
T  AR1         // armazena em AR1

LAR1           // carrega AR1 diretamente do acumulador (sem L/T intermediário)
LAR2  P#DB10.DBX 0.0  // carrega AR2 com ponteiro imediato

// ── Acesso indireto com AR ────────────────────────────────────────────────
L  B[AR1, P#0.0]   // lê BYTE no endereço de AR1 + 0
L  W[AR1, P#2.0]   // lê WORD em AR1 + 2 bytes
L  D[AR1, P#0.0]   // lê DWORD em AR1

L  DBW[AR2, P#4.0] // lê WORD no DB aberto, offset AR2 + 4

// ── Aritmética de ponteiro ────────────────────────────────────────────────
// Para avançar 4 bytes no ponteiro (equivale a próximo DWORD):
L  AR1
L  P#4.0        // offset = 4 bytes × 8 bits = 32 em representação ponteiro
+D              // soma DINT — avança AR1 de 4 bytes
T  AR1

// ── Exemplo: varrer array de 10 INTs no DB e somar ────────────────────────
OPN DB10
LAR1  P#DBX 0.0    // aponta para início do DB10
L  0
T  MW200           // inicializa acumulador

// Loop STL — 10 iterações
L  10
T  MW202           // contador de iterações

laco:
L  W[AR1, P#0.0]   // lê INT no offset atual
L  MW200
+I                  // soma ao acumulador
T  MW200

L  AR1
L  P#2.0            // avança 2 bytes (tamanho de INT)
+D
T  AR1

L  MW202
LOOP laco           // decrementa MW202 e volta se > 0
```

---

## 6. Exemplo Prático — FC Genérica de Escalonamento com ANY

```pascal
// "FC que escala qualquer array de INT para REAL usando ANY pointer"
// "No STEP 7 clássico, esta era a forma de criar funções verdadeiramente genéricas"

FUNCTION FC_EscalaArray : VOID
VAR_INPUT
  fonte   : ANY;    // array de INT a escalar
  destino : ANY;    // array de REAL destino (mesmo tamanho)
  raw_lo  : REAL;
  raw_hi  : REAL;
  eu_lo   : REAL;
  eu_hi   : REAL;
END_VAR
VAR_TEMP
  i      : INT;
  n      : INT;    // número de elementos (extraído do ANY)
  raw_v  : INT;
  eu_v   : REAL;
END_VAR
BEGIN
  // "Em STL, extrairia o count do byte 2-3 do ANY"
  // "Em SCL, o compilador resolve o acesso — aqui simplificado com count explícito"
  // Para uso real, inspecione os bytes do ANY ou passe count separado
END_FUNCTION
```

---

## 7. Equivalentes no TIA Portal (S7-1200/1500)

No TIA Portal, **não use ANY pointer**. Use:

| Funcionalidade | STEP 7 Clássico | TIA Portal (S7-1200/1500) |
|---------------|-----------------|---------------------------|
| Ponteiro genérico | ANY (10 bytes) | VARIANT (ponteiro tipado verificado) |
| Acesso a arrays de tamanho variável | ANY + AR1/AR2 | `ARRAY[*]` com `LOWER_BOUND`/`UPPER_BOUND` |
| Cópia de bloco de memória | SFC20 BLKMOV + ANY | `MOVE_BLK_VARIANT` |
| Tipo do dado em runtime | `TypeOf()` não disponível | `TypeOf(#variante)` no CASE |
| Acesso a bit dentro de WORD | Shift + AND em STL | Slice access `.%X5` |

```pascal
// TIA Portal — ARRAY[*] substitui o padrão ANY + loop STL:
FUNCTION FC_EscalaArrayTIA : VOID
VAR_IN_OUT
  fonte   : ARRAY[*] OF INT;   // qualquer tamanho de array INT
  destino : ARRAY[*] OF REAL;  // mesmo número de elementos
  raw_lo  : REAL;
  raw_hi  : REAL;
  eu_lo   : REAL;
  eu_hi   : REAL;
END_VAR
VAR_TEMP
  i     : DINT;
  lower : DINT;
  upper : DINT;
END_VAR
BEGIN
  lower := LOWER_BOUND(ARR := #fonte, DIM := 1);
  upper := UPPER_BOUND(ARR := #fonte, DIM := 1);
  FOR i := lower TO upper DO
    destino[i] := ((INT_TO_REAL(fonte[i]) - raw_lo) /
                   (raw_hi - raw_lo)) * (eu_hi - eu_lo) + eu_lo;
  END_FOR;
END_FUNCTION
```

> **Regra:** No TIA Portal, evite código que use offsetting manual de ponteiros.
> Use ARRAY[*], VARIANT e TypeOf() — são seguros, legíveis e verificados em compilação.
