# Tipos de Dados e Endereçamento

> 💡 **Para times não técnicos:** escolher o tipo errado desperdiça memória ou
> causa *overflow* (número maior do que o tipo aguenta). Esta referência ajuda a
> escolher o tipo certo e a entender como o CLP nomeia cada área de memória.

## 1. Guia de seleção rápida

```
Preciso armazenar...
├─ Sim/Não, Ligado/Desligado                 → Bool
├─ Inteiro -32.768..32.767                    → Int   ← padrão
├─ Inteiro maior                              → DInt
├─ Inteiro só positivo pequeno/grande         → USInt/UInt / UDInt
├─ Decimal, medida física                     → Real  ← padrão p/ analógicos
├─ Decimal alta precisão (servo, CNC)         → LReal (15 casas)
├─ Duração de tempo                           → Time (T#5s, T#100ms)
├─ Texto                                       → String[N] ← sempre com tamanho!
├─ Texto Unicode                              → WString
├─ Coleção do mesmo tipo                      → Array[0..N] of <tipo>
└─ Grupo de campos relacionados               → Struct / UDT (PLC Data Type)
```

## 2. Inteiros — faixas

| Tipo | Bits | Faixa | Uso |
|---|---|---|---|
| SInt | 8 | -128..127 | índices muito pequenos |
| **Int** | 16 | -32.768..32.767 | **padrão** |
| DInt | 32 | ±2,1 bi | contadores grandes, timestamps |
| LInt | 64 | ±9,2×10¹⁸ | raro |
| USInt/UInt/UDInt | 8/16/32 | sem sinal | bytes/words/contadores positivos |

## 3. Float — precisão

| Tipo | Bits | Casas | Uso |
|---|---|---|---|
| **Real** | 32 | 6-7 | **padrão p/ medidas** |
| LReal | 64 | 15-16 | servo de alta precisão, CNC |

⚠ **Regra de ouro do float:** nunca comparar com `=` — sempre tolerância (ver anti-patterns AP7).

## 4. Tempo — literais

```scl
T#5s   T#500ms   T#2m30s   T#1h15m   T#10ms
// STEP 7 clássico (SIMATIC): S5T#5S — formato BCD, faixa 0..9990s (ver step7-classico.md)
```

## 5. String — declaração correta

```scl
// POR QUÊ tamanho explícito: sem ele, String reserva 254 bytes — desperdício.
nome   : String[20] := 'Motor1';   // ✅ máx 20 chars
codigo : String[8];                // ✅
default: String;                   // ❌ usa 254 bytes
// concatenar é com CONCAT(), nunca + (ver funcoes-core.md)
```

## 6. Array e UDT

```scl
valvulas  : Array[1..24] of Bool;            // indexado de 1
buffer    : Array[0..99] of Real;            // indexado de 0
historico : Array[0..27] of "UDT_Cabecote";  // array de struct

// UDT — mude o tipo uma vez → todos os usos se atualizam automaticamente
TYPE "UDT_DadosMotor"
STRUCT
  velocidadeAtual : Real;   // RPM medido pelo encoder
  setpointVel     : Real;   // RPM desejado pelo operador
  corrente        : Real;   // Ampères (monitoramento)
  ligado          : Bool;   // TRUE = motor em operação
  emFalha         : Bool;   // TRUE = falha ativa
  codigoFalha     : Int;    // 0=OK; outros = código específico
END_STRUCT;
END_TYPE
```

## 7. Constantes — sem números mágicos

```scl
// POR QUÊ: mudança centralizada — altere uma vez, vale no programa todo.
VAR CONSTANT
  NUM_VALVULAS  : Int  := 24;       // total de válvulas do cabeçote
  TOL_POSICAO   : Real := 0.005;    // tolerância de posição ±5µm
  DWELL_STOPMOT : Time := T#100ms;  // dwell de stop motion
  TIMEOUT_SIVE  : Time := T#700ms;  // timeout de resposta da câmera SIVE
END_VAR
```

## 8. Endereçamento — áreas de memória

| Prefixo | Área | Detalhe |
|---|---|---|
| I / IB / IW / ID | Entradas | imagem de processo — atualiza no início do ciclo |
| Q / QB / QW / QD | Saídas | imagem de processo — copia p/ hardware no fim |
| M / MB / MW / MD | Marcas | flags internos — prefira DB global no TIA Portal |
| DB1.DBX/DBB/DBW/DBD | Data Block | acesso absoluto (só em bloco NÃO-otimizado) |
| PI / PQ | Periférico | acesso direto ao hardware (sem buffer de imagem) |
| T / C | Timer/Counter | apenas STEP 7 clássico (SIMATIC) |

- **TIA Portal otimizado:** apenas simbólico → `"MeuDB".velocidade`.
- **Slice access (TIA):** `palavra.%X5` (bit 5) · `.%B1` (byte 1) · `.%W1` (word 1).
- **Construct AT (STEP 7 clássico):** decompõe uma WORD em bits — ver `step7-classico.md`.

## 9. DTL — data/hora moderna (TIA Portal)

```scl
VAR timestamp : DTL; END_VAR
// timestamp.Year .Month .Day .Hour .Minute .Second .Nanosecond
// Substitui o antigo DATE_AND_TIME (DT) do STEP 7 clássico.
```
