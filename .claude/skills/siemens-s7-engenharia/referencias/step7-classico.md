# STEP 7 Clássico (S7-300/400)

> 💡 **Para times não técnicos:** plantas antigas usam o STEP 7 V5.x, que tem
> recursos próprios (timers SIMATIC, ponteiros, formato BCD) que NÃO existem no TIA
> Portal moderno. Esta referência cobre o que muda nesse mundo legado.

## 1. Timers e contadores SIMATIC (não-IEC)

```pascal
// S_ODT = on-delay (o mais usado); também S_PULSE, S_PEXT, S_ODTS, S_OFFDT.
// Use S5TIME (formato BCD, 0..9990s) e especifique sempre o T_NO.
resultado := S_ODT(T_NO := T3, IN := condicao, PT := S5T#5S, Q => saidaBool);

// Contadores S_CU / S_CD / S_CUD — preset em BCD (0..999):
bcd := S_CU(C_NO := C0, CU := borda, PV := 100, R := reset, CV => binVal, Q => ativo);
// Conversão necessária ao ler/escrever contadores:  BCD_TO_INT / INT_TO_BCD
```
> No código novo (e em S7-1200/1500) prefira os timers/contadores IEC
> (TON/TOF/TP, CTU/CTD/CTUD) como multi-instâncias — ver `funcoes-core.md`.

## 2. Chamada de blocos — clássico × TIA

```pascal
// FB com instância global (STEP 7 clássico):
FB10.DB20(setpoint := 75.0, saida => Q0.0, emFalha => ALARME);

// FB com instância local (TIA Portal — VAR meuFb : "FB_X"; END_VAR):
#meuFb(entrada := valor, saida => #resultado);

// FC com retorno — use direto em expressão:
volume := "FC_Area"(raio := 2.5) * altura;

// Flag OK (STEP 7 clássico) — detecta overflow aritmético:
OK := TRUE;  SOMA := A + B;   IF NOT OK THEN alarme := TRUE; END_IF;
```

**Call-by-value × reference (TIA Portal):**
- FC + Input + elementar → cópia
- FC + Input + struct/array → referência
- FC/FB + InOut → sempre referência ← use para structs grandes (evita cópia)

## 3. Ponteiros

| Tipo | Tamanho | Sintaxe | Uso |
|---|---|---|---|
| Ponteiro de memória | 32 bits | `P#10.0` | offset dentro de área aberta |
| Ponteiro de área | 32 bits | `P#M 10.3` | área + byte + bit |
| ANY pointer | 80 bits (10 bytes) | estrutura manual | SFCs genéricas |

```
ANY pointer — estrutura dos 10 bytes:
 Byte 0: B#16#10 (fixo) | Byte 1: tipo (01=Bool 02=Byte 04=Word 08=Int 09=DInt 0A=Real)
 Bytes 2-3: repetições  | Bytes 4-5: nº do DB (0 = M/I/Q) | Bytes 6-9: P#DBX offset
```
```pascal
// AR1/AR2 — varrer array em STL (legado):
OPN DB10 ; LAR1 P#DBX 0.0
// laco: L W[AR1,P#0.0] ; ... ; +AR1 P#2.0 ; LOOP laco
```

## 4. Construct AT — decompor uma WORD em bits (STEP 7 clássico)

```pascal
VAR  statusInv : Word;  bits AT statusInv : ARRAY[0..15] OF Bool; END_VAR
// bits[2] = TRUE → falha; manipula o bit diretamente sobre a WORD.
// NÃO existe no TIA Portal → use slice access: statusInv.%X2
```

## 5. TIA Portal — ARRAY[*] substitui ANY + AR1

```scl
// ARRAY[*] aceita array de qualquer tamanho; descubra os limites em runtime:
FUNCTION "FC_Soma" : DInt
VAR_IN_OUT arr : ARRAY[*] OF Int; END_VAR
VAR_TEMP i : DInt; soma : DInt; END_VAR
BEGIN
  soma := 0;
  FOR i := LOWER_BOUND(ARR := arr, DIM := 1) TO UPPER_BOUND(ARR := arr, DIM := 1) DO
    soma := soma + TO_DINT(arr[i]);
  END_FOR;
  #FC_Soma := soma;
END_FUNCTION
```

## 6. Consistência de blocos (STEP 7 clássico)

```
Problema: mudou a interface de um FB depois que o OB1 que o chama foi compilado → CONFLITO.
Solução rápida:     Edit → Check Block Consistency → Program → Compile
Solução definitiva: Generate Source → From Block → edite → Compile
Regra: o timestamp da INTERFACE do bloco chamado deve ser MAIS ANTIGO que o código do chamador.
```
