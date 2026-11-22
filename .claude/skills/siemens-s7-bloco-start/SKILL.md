---
name: siemens-s7-bloco-start
description: START de projeto — Avaliação e Arranque S7-300/400 e S7-1200/1500 com checklist de viabilidade, blocos, SCL, comunicação, PID, Safety e boas práticas
---

# START DE PROJETO — Avaliação e Arranque S7

> **Baseado em:** SIEMENS_S7_BLOCO v1.0 — Guia Unificado de Programação S7
> **Autor:** REGINALDO LOBO | Uso: avaliação de viabilidade e kickstart de novos projetos

---

## CHECKLIST DE VIABILIDADE — Responda antes de abrir o TIA Portal ou STEP 7

```
[ ] 1. Plataforma definida?          S7-300/400 (STEP 7 V5.x) | S7-1200/1500 (TIA Portal V13+)
[ ] 2. CPU selecionada?              Verifique memória Work/Load, nº de OBs, FW version
[ ] 3. Rede definida?                PROFIBUS DP | PROFINET | Nenhuma | Mista
[ ] 4. HMI planejado?                WinCC Flexible | WinCC Advanced | WinCC Unified | Sem HMI
[ ] 5. Safety requerido?             SIL/PLr definidos? F-CPU + F-I/O no BOM?
[ ] 6. PID necessário?               Quantas malhas? FB41/PID_Compact? Válvulas motorizadas?
[ ] 7. Sequenciamento?               GRAPH necessário ou SCL/FB com CASE?
[ ] 8. Comunicação entre CLPs?       PUT/GET | OUC | Modbus TCP | Nenhuma
[ ] 9. Analógicos mapeados?          4-20mA | 0-10V | PT100 | Termopar — quantos canais?
[ ] 10. Nomenclatura acordada?       Padrão FC_/FB_/DB_/UDT_ definido com a equipe?
```

---

## 1. PLATAFORMA — Decisão Inicial

| Critério | S7-300/400 (STEP 7) | S7-1200/1500 (TIA Portal) |
|----------|--------------------|-----------------------------|
| Projeto novo | ❌ Evitar — descontinuado | ✅ Preferencial |
| Modernização de planta existente | ✅ Manter se possível | ✅ Migrar com planejamento |
| Safety integrado | ✅ F-300/400 | ✅ F-1200/1500 (mais simples) |
| Alto canal count (>1000 I/O) | ✅ S7-400 | ✅ S7-1500 |
| Budget restrito | ✅ S7-300 reaproveitado | ✅ S7-1200 |
| Motion/CNC | — | ✅ S7-1500T (Technology Objects) |

**Ferramentas:**
- STEP 7 V5.x → SIMATIC Manager + Editor SCL (SCL = pacote adicional, CPU mín. 314)
- TIA Portal V13+ → ambiente unificado; SCL nativo em todos os blocos

**Linguagens disponíveis:**
- S7-300/400: LAD, FBD, STL, SCL
- S7-1200: LAD, FBD, SCL *(STL não disponível)*
- S7-1500: LAD, FBD, SCL, STL *(AR emulado — evite em código novo)*

---

## 2. TIPOS DE BLOCO — Mapa de Decisão

| Necessidade | Bloco | Regra |
|-------------|-------|-------|
| Controle com memória entre ciclos | **FB** | Um IDB por instância; declare timers/contadores no VAR |
| Cálculo puro, sem estado | **FC** | Sem IDB; valor de retorno = nome da FC |
| Armazenar dados globais | **DB global** | Otimizado no TIA Portal; substitui marcas M |
| Estrutura de dado reutilizável | **UDT / PLC data type** | Altere uma vez → atualiza todos os usos |
| Programa principal | **OB1** | Apenas chama FBs/FCs; nenhuma lógica direta |
| Ciclo de tempo fixo (PID, filtros) | **OB35..38** | Configure período; evite OB1 para PID |

**Ordem de compilação no STEP 7 clássico:**
```
UDTs → DBs globais → FCs/FBs folha → FBs que os chamam → DBs de instância → OBs
OB1 SEMPRE por último
```

---

## 3. ESTRUTURA DO BLOCO SCL — Template de Referência

```pascal
FUNCTION_BLOCK FB_NomeDescritivo
TITLE = 'Descrição funcional'
VERSION : '1.0'
AUTHOR  : ReginaldoLobo   // máx 8 chars no STEP 7 clássico

VAR_INPUT   setpoint : REAL; habilitar : BOOL := TRUE; END_VAR
VAR_OUTPUT  saida : REAL; em_falha : BOOL; END_VAR
VAR_IN_OUT  dados : UDT_MeuTipo; END_VAR   // por referência — sem cópia
VAR
  timer1 : TON;           // multi-instância IEC (TIA Portal)
  {Retain} ciclos : DINT; // retentivo — sobrevive warm restart
  primeiro_ciclo : BOOL := TRUE;
END_VAR
VAR_TEMP  calc : REAL; END_VAR  // ATENÇÃO: inicialize antes de ler!
CONST MAX_SAIDA := 100.0; END_CONST

BEGIN
  REGION "1. Inicialização"
    IF #primeiro_ciclo THEN ... #primeiro_ciclo := FALSE; END_IF;
  END_REGION
  REGION "2. Lógica"
    // código aqui
  END_REGION
END_FUNCTION_BLOCK
```

---

## 4. OBs — MAPA DE PRIORIDADES E VARIÁVEIS DE CONTEXTO

```
Alta prioridade (interrompe baixa):
  OB40-47  (16-23) — Interrupção de hardware
  OB30-38  (7-15)  — Interrupção cíclica (PID, filtros — configure aqui)
  OB20-23  (3-6)   — Interrupção por atraso (SFC32)
  OB10-17  (2)     — Interrupção por hora do dia
  OB1      (1)     — Ciclo principal
  OB90     (mín)   — Background

Startup e erro (prioridade máxima quando chamados):
  OB100/101/102 (27) — Startup: inicialize variáveis aqui
  OB80-87   (26)    — Erros assíncronos
  OB121     (28)    — Erro síncrono de programação
  OB122     (29)    — Erro de acesso a I/O
```

**OBs de erro obrigatórios — carregue SEMPRE (mesmo vazios):**
```
OB80, OB82, OB85, OB86, OB121, OB122
Sem eles: CPU vai a STOP no primeiro erro!
```

**Variáveis de contexto fornecidas pelo SO (VAR_TEMP dos OBs):**

| OB | Variável | Uso típico |
|----|----------|-----------|
| OB1 | `OB1_PREV_CYCLE` (INT, ms) | Monitor de tempo de ciclo no HMI |
| OB35..38 | `OB3x_EXC_FREQ` (WORD) | Verificar período configurado |
| OB40..47 | `OB40_POINT_ADDR` (DWORD) | Identificar qual entrada gerou a interrupção |
| OB121 | `OB121_BLK_TYPE` (BYTE) | Tipo do bloco com erro (FB=1, FC=2) |
| OB122 | `OB122_MDL_ADDR` (WORD) | Endereço do módulo com falha de I/O |
| Todos | `OBxx_DATE_TIME` (DT) | Timestamp do evento |

---

## 5. TIPOS DE DADO — REFERÊNCIA RÁPIDA

**Elementares — todos os ambientes:**

| Tipo | Bits | Faixa | Literal |
|------|------|-------|---------|
| BOOL | 1 | TRUE/FALSE | `TRUE` |
| BYTE/WORD/DWORD | 8/16/32 | hex | `B#16#FF`, `W#16#ABCD` |
| INT / DINT | 16/32 | ±32767 / ±2.147M | `1000`, `L#-1000000` |
| REAL | 32 | ±3.4e38 | `3.14` |
| TIME | 32 | T#-24d..+24d | `T#1H_30M` |
| S5TIME | 16 | S5T#0..9990S | `S5T#5S` (STEP 7 clássico) |
| STRING | variável | até 254 chars | `'Texto'` — declare `STRING[n]` |
| DATE_AND_TIME | 64 | timestamp | `DT#2024-01-15-08:00:00` |

**Somente TIA Portal (S7-1200/1500):**

| Tipo | Bits | Uso |
|------|------|-----|
| SInt/USInt | 8 | -128..127 / 0..255 |
| UInt/UDInt | 16/32 | sem sinal |
| LReal | 64 | dupla precisão |
| DTL | 96 | timestamp com `.Year/.Month/.Hour/.Nanosecond` |
| VARIANT | ponteiro | substitui ANY — verificação em runtime |
| LWORD/LInt | 64 | S7-1500 |

**Tipos complexos:**
```pascal
temperaturas : ARRAY[1..10] OF REAL;       // acesso: temperaturas[5]
motor1 : STRUCT velocidade: REAL; END_STRUCT; // acesso: motor1.velocidade
TYPE UDT_Motor STRUCT ... END_STRUCT END_TYPE // reutilizável em múltiplos DBs
```

---

## 6. ENDEREÇAMENTO — REFERÊNCIA DE ÁREA

| Prefixo | Área | Detalhe |
|---------|------|---------|
| I / IB / IW / ID | Entradas | Imagem de processo — atualiza no início do ciclo |
| Q / QB / QW / QD | Saídas | Imagem de processo — copia para hardware no fim |
| M / MB / MW / MD | Marcas | Flags internos — prefira DB global no TIA Portal |
| DB1.DBX / DBB / DBW / DBD | Data Block | Acesso absoluto (não-otimizado) |
| PI / PQ | Periférico | Acesso direto ao hardware (sem buffer de imagem) |
| T / C | Timer / Counter | Apenas STEP 7 clássico (SIMATIC timers) |

**TIA Portal — blocos otimizados:** apenas simbólico: `"MeuDB".velocidade`
**Slice Access (TIA):** `palavra.%X5` (bit 5) · `palavra.%B1` (byte 1) · `dupla.%W1` (word 1)
**Construct AT (STEP 7):** `bits AT status_word : ARRAY[0..15] OF BOOL` — decompõe WORD em BOOLs

---

## 7. LINGUAGENS — QUANDO USAR CADA UMA

| Linguagem | Melhor para | Evitar |
|-----------|------------|--------|
| **LAD** | Lógica de intertravamento, equipes elétricas | Algoritmos matemáticos complexos |
| **FBD** | Lógica de sinal, equipes eletrônica | Laços e iterações |
| **STL** | Legado S7-300/400, ponteiros, performance extrema | Código novo no TIA Portal |
| **SCL** | Algoritmos, PID, receitas, arrays, strings | Nada — é a linguagem principal |
| **GRAPH** | Sequenciamento de máquinas | Lógica de controle contínuo |

---

## 8. SCL — CONTROLE DE FLUXO (PADRÕES ESSENCIAIS)

```pascal
// Estruturas básicas:
IF cond THEN ... ELSIF cond THEN ... ELSE ... END_IF;
CASE cod OF 1: ...; 2,3: ...; 10..20: ...; ELSE: ...; END_CASE;
FOR i := 1 TO 10 DO ... END_FOR;          // passo negativo: BY -1
WHILE NOT ok DO ... END_WHILE;
REPEAT ... UNTIL contador >= 10; END_REPEAT;
EXIT;    // sai do loop
RETURN;  // sai do bloco

// Padrão booleano direto (não use IF para isso):
bomba := sensor_nivel AND NOT falha;      // ✅
// IF sensor_nivel THEN bomba:=TRUE; ELSE bomba:=FALSE; END_IF;  ❌

// Detecção de borda — padrão manual (ambos os ambientes):
borda_subida  := sinal AND NOT sinal_ant;
borda_descida := NOT sinal AND sinal_ant;
sinal_ant     := sinal;

// TIA Portal — R_TRIG / F_TRIG como multi-instância:
VAR r_trig1 : R_TRIG; END_VAR
#r_trig1(CLK := #btn_liga);
IF #r_trig1.Q THEN // executa 1 scan após a borda de subida
```

---

## 9. TEMPORIZADORES E CONTADORES

**STEP 7 Clássico — SIMATIC (S7-300/400):**
```pascal
// S_ODT = on-delay (o mais usado); S_PULSE, S_PEXT, S_ODTS, S_OFFDT
resultado := S_ODT(T_NO:=T3, IN:=condicao, PT:=S5T#5S, Q=>saida_bool);
// S_CU / S_CD / S_CUD — contadores; preset BCD 0..999
bcd := S_CU(C_NO:=C0, CU:=borda, PV:=100, R:=reset, CV=>bin_val, Q=>ativo);
// BCD_TO_INT / INT_TO_BCD — conversão necessária para ler/escrever contadores
```

**TIA Portal — IEC (multi-instâncias obrigatórias):**
```pascal
// SEMPRE declare no VAR do FB pai — nunca como DB separado
VAR
  tmr : TON;    // TON=on-delay | TOF=off-delay | TP=pulso
  cnt : CTU;    // CTU=crescente | CTD=decrescente | CTUD=bidirecional
END_VAR
#tmr(IN:=#habilitar, PT:=T#5S);  saida := #tmr.Q;
#cnt(CU:=borda, R:=reset, PV:=100);  valor := #cnt.CV;
```

---

## 10. CHAMADA DE BLOCOS — REGRAS DE PASSAGEM

```pascal
// FB com instância global (STEP 7):
FB10.DB20(setpoint:=75.0, saida=>Q0.0, em_falha=>ALARME);

// FB com instância local (TIA Portal — VAR meu_fb : FB_X; END_VAR):
#meu_fb(entrada:=valor, saida=>#resultado);

// FC com retorno — use diretamente em expressão:
volume := FC_Area(raio:=2.5) * altura;

// Flag OK (STEP 7 clássico):
OK := TRUE; SOMA := A + B;   // OK=FALSE se overflow
IF NOT OK THEN alarme := TRUE; END_IF;
```

**Call-by-Value vs. Reference (TIA Portal):**
- FC + Input + elementar → **cópia**
- FC + Input + struct/array → **referência**
- FC ou FB + InOut → **sempre referência** ← use para structs grandes

---

## 11. BLOCOS OTIMIZADOS — REGRA DE OURO (TIA Portal)

**Sempre ative "Optimized block access" — benefícios:**

| | Padrão | **Otimizado** |
|--|--------|--------------|
| Acesso | absoluto + simbólico | **somente simbólico** |
| Retentividade | todo o DB | **tag por tag** |
| Tamanho máx (S7-1500) | 64 kB | **16 MB** |
| Download sem reiniciar | ❌ | **✅** |
| Performance | menor | **máxima** |

```
Ativar: Árvore do projeto → bloco → Properties → Optimized block access ✅
DBs de instância herdam a configuração do FB pai automaticamente
NUNCA misture otimizado e não-otimizado na mesma cadeia de chamada
```

**VARIANT vs. ANY:**
- ANY: 10 bytes, não tipado, erro vira dado corrompido → use somente em legado
- VARIANT: tipado, erro detectado com código claro → use sempre no TIA Portal
- `TypeOf(#var)` detecta o tipo em runtime; nunca use VARIANT dentro de FOR/WHILE

---

## 12. MODOS DE CPU E RESTART

| Modo | Saídas | Quando |
|------|--------|--------|
| RUN | Programa controla | Operação normal |
| STOP | Zeradas | Falha / download / manual |
| HOLD | Mantidas | Breakpoint ativo (debug) |
| STARTUP | Zeradas | OB100 executando antes de RUN |

| | Warm | Cold | Hot (S7-400) |
|--|------|------|--------------|
| M volatile | Zeradas | Zeradas | Mantidas |
| M retain | Mantidas | **Zeradas** | Mantidas |
| DBs RAM | Valor EPROM | Valor EPROM | Mantidos |

**OB100** = use para inicializar variáveis e definir `COM_RST=TRUE` nos PIDs.

---

## 13. NOMENCLATURA PADRÃO

```
FC_   → Functions:       FC_EscalaNivel, FC_CalculaVazao
FB_   → Function Blocks: FB_ControlePID, FB_MotorWYE
DB_   → Data Blocks:     DB_Producao, DB_Receitas, DB_Falhas
UDT_  → Tipos:           UDT_Motor, UDT_Tanque, UDT_Receita
I/O:  Dispositivo_Funcao: M1_BtnLiga, V3_SensorNivel, P1_PressaoBar

Tabela de Símbolos (STEP 7):  Motor1_Liga   I0.0  BOOL  Botão Liga Motor 1
PLC Tags (TIA Portal):         mesmo conceito — Reference ID evita relink do HMI
```

---

## 14. RETENTIVIDADE — DECISÃO DE PROJETO

**O que declarar como Retain:**
- Contadores de produção / contagem de ciclos / odômetros
- Calibrações e offsets de sensor
- Setpoints de receita (se não houver sistema de receitas dedicado)

**Como configurar:**
- STEP 7 clássico: CPU Properties → Memory Configuration → MB retentivos
- TIA Portal (otimizado): declarar `{Retain}` no VAR do FB (NÃO no IDB)

**Como resetar:** chave MRES · TIA Portal Online → Memory reset · Display S7-1500

---

## 15. CONSISTÊNCIA DE BLOCOS (STEP 7 CLÁSSICO)

```
Problema: mudou a interface do FB50 depois que OB1 foi compilado → CONFLITO
Solução rápida:    Edit > Check Block Consistency → Program > Compile
Solução definitiva: Generate Source > From Block → edite → Compile
Regra: timestamp da INTERFACE do chamado deve ser MAIS ANTIGO que o código do chamador
```

---

## 16. FUNÇÕES SCL — REFERÊNCIA RÁPIDA

**Conversão numérica:**
```pascal
REAL_TO_INT(3.7)    // = 4 (arredonda)    TRUNC(3.7)     // = 3 (trunca)
INT_TO_REAL(42)     // = 42.0             INT_TO_DINT(n) // expansão segura
```

**Matemática:** `ABS · SQR · EXP · LN · LOG · SIN · COS · TAN · ASIN · ACOS · ATAN`
`MAX(IN1:=a, IN2:=b) · MIN · LIMIT(MN:=0.0, IN:=v, MX:=100.0)`
`SHL · SHR · ROL · ROR`

**Aritmética de tempo (TIA Portal):** `diferenca := t_fim - t_inicio` (→ TIME, sem função especial)

**Strings — todos os ambientes:**
```pascal
LEN('Texto')                              // 5
CONCAT(IN1:='T_', IN2:='K1')             // 'T_K1'
LEFT(IN:='Tanque1', L:=6)                // 'Tanque'
RIGHT(IN:='Tanque1', L:=1)               // '1'
MID(IN:='Tanque1', L:=3, P:=4)          // 'que'  (P=posição base 1)
FIND(IN1:='Tanque', IN2:='an')           // 2
DELETE(IN:='Tanque', L:=3, P:=4)        // 'Tan'
INSERT(IN1:='Tan', IN2:='que', P:=4)    // 'Tanque'
INT_TO_STRING(42) · REAL_TO_STRING(3.14) · STRING_TO_INT('42')
STRG_TO_CHARS / CHARS_TO_STRG           // para Modbus e comunicação serial
// ⚠ STRING[80] — truncamento SILENCIOSO — declare sempre com folga!
```

---

## 17. DIAGNÓSTICO — PROTOCOLO DE CAMPO

**Primeiro passo sempre:**
```
STEP 7:    SIMATIC Manager → online → Module Information → Diagnostic Buffer
TIA Portal: Online & Diagnostics → Diagnostic buffer
→ Leia em ordem cronológica inversa — o TOPO é o que causou o STOP
```

**VAT (Watch Table):**
- MODIFY: escreve uma vez (programa pode sobrescrever no ciclo seguinte)
- FORCE: mantém permanentemente — ⚠ DESATIVE após o teste
- S7-300: Force só em I, Q, PQ · S7-400: também M

**Tabela de sintomas frequentes:**

| Sintoma | Causa | Solução |
|---------|-------|---------|
| CPU vai a STOP inesperado | OB de erro não carregado | Carregue OB82/85/86/121/122 |
| VAR_TEMP com valor errado | Lida antes de inicializar | Inicialize no início do bloco |
| Timer não funciona (SIMATIC) | T_NO não especificado | `T_NO := T3` explicitamente |
| INT/INT resultado errado | Divisão inteira trunca | Converta para REAL antes |
| IDB com campos errados | FB alterado sem recompilar | Apague e recrie o DB instância |
| Saída não responde ao Q | Force ativo na VAT | Verifique e desative Force |
| PID oscila no OB1 | Ciclo variável — integral errada | Mova para OB35 com CYCLE fixo |
| OB85 ativo | Ciclo do OB1 excedido | Mova lógica pesada para OB35-38 |
| Dado errado após mudar I/O | Acesso absoluto obsoleto | Use acesso simbólico |
| Download causa STOP | Interface FB alterada | CPU deve ir a STOP para atualizar IDB |

---

## 18. MIGRAÇÃO S7-300/400 → S7-1200/1500

| S7-300/400 | S7-1200/1500 | Notas |
|------------|-------------|-------|
| SIMATIC timers T1..T255 | TON/TOF/TP multi-instância | IEC — sem número físico |
| SIMATIC counters C0..C255 | CTU/CTD/CTUD multi-instância | IEC |
| UDT | PLC data type | Atualização automática em todos os usos |
| Tabela de símbolos | PLC Tags | Reference ID evita relink do HMI |
| DB1.DBW4 (absoluto) | "MeuDB".campo (simbólico) | Otimizado = só simbólico |
| ANY pointer | VARIANT | Tipo verificado em runtime |
| AT construct | `.%X` `.%B` `.%W` Slice Access | Mais direto |
| Marcas M globais | DB global otimizado | Portável entre CPUs |
| Clock Memory (M254) | FB gerador de pulso | Independente de hardware |
| OB1 único | OB1 + OB200, OB300... | Grupos de programa independentes |
| DATE_AND_TIME / DT | DTL | Acesso por campo `.Year .Month .Hour` |

---

## 19. SAFETY — CHECKLIST INICIAL

```
[ ] F-CPU selecionada? (S7-315F / S7-317F / S7-1516F / S7-1518F)
[ ] F-I/O mapeados e tipo de fiação definido? (1oo1 / 1oo2 / 2oo2)
[ ] SIL / PLr calculado pelo engenheiro de segurança?
[ ] Proof test interval definido (T_proof)?
[ ] Pasta "System blocks" do F-CPU: NUNCA editar manualmente
[ ] F-FBs chamados no safety program? (IDB de F-FB não chamado → STOP)
[ ] Maximum cycle time do F-runtime group calculado? (máx 20.000ms)
[ ] Main Safety Block sem parâmetros? (obrigatório)
[ ] Outputs de F-FCs inicializados?

Arquitetura de troca Safety ↔ Standard:
  DB_ParaSafety  ← Standard escreve → Safety lê  (dados de permissivo)
  DB_DoSafety    ← Safety escreve  → Standard lê (estados/alarmes safety)
  (mudanças no Standard não afetam o F-runtime — CPU não vai a STOP)

F Signature: impressão digital do bloco — muda só quando a lógica muda
Value Status: 1=dado válido no canal, 0=valor substituto
Nomeie tags VS com sufixo: TagIn1VS, TagIn2VS
```

---

## 20. AS 10 REGRAS DE OURO — COLE NO PROJETO

```
 1. BLOCOS OTIMIZADOS sempre (TIA Portal) — melhor performance, Online Change
 2. VARIANT em vez de ANY — tipo verificado em runtime
 3. ENDEREÇAMENTO SIMBÓLICO sempre — legível, manutenível
 4. IEC Timers/Counters como MULTI-INSTÂNCIAS no VAR do FB pai
 5. PLC DATA TYPES / UDTs — uma mudança atualiza todos os usos
 6. ARRAY para acesso indexado — mais seguro que pointer manual
 7. OBs DE ERRO carregados SEMPRE (OB82, OB85, OB86, OB121, OB122)
 8. ORGANIZAÇÃO por área funcional — FB por função (motor, válvula, PID)
 9. COMENTE o PORQUÊ, não o COMO — o código já explica o como
10. DB GLOBAIS em vez de Marcas M (TIA Portal) — portáveis e sem conflito
```

---

## 21. SFCs E SFBs — REFERÊNCIA RÁPIDA

**SFCs mais usadas — STEP 7 clássico:**

| SFC | Nome | Uso |
|-----|------|-----|
| SFC0 | SET_CLK | Acerta relógio da CPU (chamar no OB100) |
| SFC1 | READ_CLK | Timestamp em DT → logs de evento |
| SFC14 | DPRD_DAT | Lê escravo PROFIBUS consistentemente (>4 bytes) |
| SFC15 | DPWR_DAT | Escreve escravo PROFIBUS consistentemente |
| SFC20 | BLKMOV | Copia área de memória (use com ANY pointer) |
| SFC21 | FILL | Inicializa array com valor fixo |
| SFC32 | SRT_DINT | Dispara OB20-23 após X ms |
| SFC46 | STP | Para CPU — condição de segurança crítica |
| SFC51 | RDSYSST | Lê SZL — inventário e diagnóstico de módulos |
| SFC64 | TIME_TCK | Lê ms do sistema — mede tempo de ciclo |

**SFBs IEC (STEP 7 clássico — exigem DB de instância próprio):**
`SFB4=TON · SFB5=TOF · SFB3=TP · SFB0=CTU · SFB1=CTD · SFB2=CTUD`

**Equivalentes TIA Portal:** `RD_SYS_T/WR_SYS_T · MOVE_BLK_VARIANT · FILL_BLK · STP · DPRD_DAT`

---

## 22. EXEMPLO ARQUITETURAL — PADRÃO RECOMENDADO

```
OB1 (ciclo principal — apenas chama FBs)
  ├── FB_ControleTanque.DB10 (tanque 1)
  │     ├── VAR: timer_conf_bomba: TON  ← multi-instância IEC
  │     ├── VAR: timer_watchdog:   TON
  │     ├── VAR_IN_OUT: dados: UDT_Tanque  ← referência, sem cópia
  │     └── {Retain} ciclos_bomba: DINT   ← sobrevive warm restart
  ├── FB_ControleTanque.DB11 (tanque 2 — mesmo FB, dados independentes)
  └── DB_Diag.tempo_ciclo := OB1_PREV_CYCLE

OB35 @ 100ms (lógica cíclica — PID, filtros, analógicos)
  ├── FB_PID_Nivel.DB_PID1 (malha de nível)
  └── FC_EscalaAnalogicos (leitura e escalonamento de todos os AI)

OB100 (startup — inicialização e reset de PIDs)
OB122 (erro I/O — registra endereço em DB_Diag — NÃO para a CPU)
```

**UDT_Tanque — tipo base do exemplo:**
```pascal
TYPE UDT_Tanque STRUCT
  nivel_atual  : REAL;  nivel_setpoint : REAL;
  bomba_ligada : BOOL;  valvula_saida  : BOOL;
  em_falha     : BOOL;  cod_falha      : INT;
  ciclos_bomba : DINT;
END_STRUCT END_TYPE
```

---

## 23. ANALÓGICOS — REFERÊNCIA DE ESCALONAMENTO

**Contagens raw por tipo de sinal:**

| Sinal | Raw Mín | Raw Máx | Fio Partido (<) |
|-------|---------|---------|-----------------|
| 0–20 mA | 0 | 27648 | N/A |
| **4–20 mA** | **6912** | **27648** | **< 1380** |
| 0–10 V | 0 | 27648 | N/A |
| −10..+10 V | −27648 | +27648 | N/A |
| PT100/1000 | var | var | — (centésimos de °C) |
| Faixa estendida (+5%) | 27649 | 32511 | — |
| Overflow / curto | 32512 | 32767 | — |

**Detecção de fio partido — SEMPRE antes de escalar:**
```pascal
IF raw_int < 1380 THEN dados.em_falha:=TRUE; dados.cod_falha:=10; RETURN; END_IF;
```

**FC_Escala (STEP 7 clássico):**
```pascal
FC_Escala := ((INT_TO_REAL(raw)-raw_lo)/(raw_hi-raw_lo))*(eu_hi-eu_lo)+eu_lo;
```

**TIA Portal — NORM_X + SCALE_X:**
```pascal
norm    := NORM_X(MIN:=6912,  VALUE:=raw_int, MAX:=27648);
pressao := SCALE_X(MIN:=0.0, VALUE:=norm,    MAX:=10.0);
```

---

## 24. PONTEIROS — STEP 7 CLÁSSICO

| Tipo | Tamanho | Sintaxe | Uso |
|------|---------|---------|-----|
| Ponteiro memória | 32 bits | `P#10.0` | Offset dentro de área aberta |
| Ponteiro de área | 32 bits | `P#M 10.3` | Área + byte + bit |
| ANY pointer | 80 bits (10 bytes) | estrutura manual | SFCs genéricas |

**AR1/AR2 — varrer array em STL:**
```pascal
OPN DB10 ; LAR1 P#DBX 0.0
// ... laco: L W[AR1,P#0.0] ; L AR1 ; L P#2.0 ; +D ; T AR1 ; LOOP laco
```

**ANY pointer — estrutura dos 10 bytes:**
```
Byte 0: B#16#10 (fixo) | Byte 1: tipo (01=BOOL 02=BYTE 04=WORD 08=INT 09=DINT 0A=REAL)
Bytes 2-3: repetições | Bytes 4-5: número do DB (0=M/I/Q) | Bytes 6-9: P#DBX offset
```

**Construct AT (STEP 7 clássico):**
```pascal
VAR  status_inv : WORD;  bits AT status_inv : ARRAY[0..15] OF BOOL; END_VAR
// bits[2] = TRUE → falha; modifica bit diretamente no WORD
// NÃO disponível no TIA Portal → use status_inv.%X2
```

**TIA Portal — ARRAY[*] substitui ANY + AR1:**
```pascal
FUNCTION FC_Soma : DINT
VAR_IN_OUT arr : ARRAY[*] OF INT; END_VAR
FOR i:=LOWER_BOUND(ARR:=arr,DIM:=1) TO UPPER_BOUND(ARR:=arr,DIM:=1) DO
  soma := soma + INT_TO_DINT(arr[i]);
END_FOR;
```

---

## 25. COMUNICAÇÃO ENTRE CLPs

| Método | Blocos | Plataforma | Observação |
|--------|--------|------------|-----------|
| S7 PUT/GET | SFB14/SFB15 | 300/400/1200/1500 | Habilitar manualmente em 1200/1500 |
| OUC ISO-on-TCP | TCON/TSEND/TRECV | 1200/1500 | Preferencial — sem restrição de segurança |
| OUC TCP/UDP | TCON/TUSEND/TURCV | 1200/1500 | Integração com sistemas de terceiros |
| Modbus TCP | MB_CLIENT/MB_SERVER | 1200/1500 | Padrão aberto |
| PROFIBUS DP | SFC14/SFC15 | 300/400 | Telegramas >4 bytes ou consistência |

**⚠ SEGURANÇA — S7-1200/1500 bloqueiam PUT/GET por padrão:**
```
CPU Properties → Protection → "Permit access with PUT/GET..." → habilitar com consciência
DBs otimizados são incompatíveis com PUT/GET — desabilite otimização no DB de comunicação
```

**GET — SFB14 (STEP 7 clássico):**
```pascal
CALL SFB14, DB_InstGET (REQ:=req, ID:=W#16#0001, NDR=>ndr, ERROR=>err, STATUS=>st,
  ADDR_1:=P#DB10.DBX 0.0 BYTE 20, RD_1:=P#DB11.DBX 0.0 BYTE 20);
IF ndr THEN // dados em DB11 válidos
```

**STATUS codes:** `W#16#0000`=OK · `W#16#7002`=em andamento · `W#16#80B3`=timeout

**OUC (TIA Portal):**
```pascal
TCON_1(REQ:=conn_req, ID:=1, CONNECT=>"DB_ConnParam", DONE=>conn_ok);
IF conn_ok THEN
  TSEND_1(REQ:=send_req, ID:=1, LEN:=100, DATA=>"DB_Send".dados, DONE=>send_ok);
  TRECV_1(EN_R:=TRUE, ID:=1, LEN:=100, DATA=>"DB_Recv".dados, NDR=>recv_ok);
END_IF;
```

---

## 26. GRAPH — SEQUENCIADORES SFC

**Conceito:** GRAPH compila como FB com steps, transitions e actions (SFC IEC 61131-3).

**Variáveis automáticas por passo Sx:**
```
Sx.X (BOOL) = passo Sx ativo | Sx.T (TIME) = tempo no passo | Sx.U (DINT) = contagem de ativações
```

**Qualificadores de ação:**

| N | S | R | D | L | P |
|---|---|---|---|---|---|
| Ativo enquanto no passo | Set (permanece) | Reset (limpa S) | Delay (como TON) | Limited (como TP) | Pulse (1 scan) |

**Supervisão:** S1=Interlock (HOLD) · S2=Supervision (ERR_FLT=TRUE → passo de erro)

**Interface do FB GRAPH:**
```pascal
FB_Envase.DB1(INIT_SQ:=reiniciar, ACK_EF:=confirmar_erro, S_NEXT:=avancar,
              OFF_SQ:=emergencia, SW_AUTO:=modo_auto, SW_MAN:=modo_manual);
IF FB_Envase.S3.X AND FB_Envase.S3.T > T#30S THEN alarme_lento := TRUE; END_IF;
IF FB_Envase.ERR_FLT THEN // supervisão S2 disparou → aguardar ACK_EF
```

---

## 27. FLUXO DE DOWNLOAD SEGURO

**Sequência obrigatória — NUNCA pule etapas:**

```
1. COMPILE ALL      → STEP 7: Program > Compile All
                      TIA:    Compile > Software (rebuild all)

2. COMPARE          → TIA: Online > Compare
                      STEP 7: PLC > Compare Blocks
                      LEIA as diferenças antes de baixar qualquer coisa

3. DOWNLOAD SELETIVO → baixe somente blocos alterados
                        não afeta blocos em operação que não foram modificados

4. ONLINE CHANGE    → apenas blocos otimizados, S7-1200 FW V4.0+ / S7-1500
   (CPU em RUN)       Funciona: adicionar tags, modificar lógica
                       NÃO funciona: alterar VAR_INPUT / VAR_OUTPUT → STOP necessário
```

**Regras críticas:**
- NUNCA baixe OB1 vazio "para testar" — zera todas as saídas → parada imediata
- CPU foi a STOP durante download → consulte Diagnostic Buffer ANTES de qualquer ação
- Reserve de memória para Online Change: padrão 100 bytes · máximo 2 MB (configure antes)

---

## 28. PID — SELEÇÃO E KICKSTART

**Seleção do bloco:**

| Plataforma | Saída analógica | Válvula motorizada | PWM digital |
|------------|----------------|-------------------|-------------|
| S7-300/400 | **FB41 CONT_C** | **FB42 CONT_S** | **FB43 PULSEGEN** |
| TIA Portal | **PID_Compact** | **PID_3Step** | FB43 ou lógica PWM |
| Temperatura | PID_Compact | PID_3Step | **PID_Temp** |

**Regra absoluta:** PID NUNCA no OB1 — use OB35..38 com período fixo.

**FB41 CONT_C — parâmetros mínimos para o primeiro teste:**
```pascal
CALL FB41, DB41
  COM_RST := TRUE   // no OB100 — reseta estado interno
  CYCLE   := T#100MS // = período exato do OB35
  SP_INT  := setpoint; PV_IN := pv_escalada
  GAIN := 1.0; TI := T#30S; TD := T#0S  // ponto de partida conservador
  LMN_HLM := 100.0; LMN_LLM := 0.0
  LMN => saida_pid; ER => erro
```

**PID_Compact — kickstart TIA Portal:**
```pascal
VAR pid : PID_Compact; END_VAR  // multi-instância no FB pai
#pid(Setpoint:=#sp, Input:=#pv, Output=>#saida,
     OutputUpperLimit:=100.0, OutputLowerLimit:=0.0,
     ManualEnable:=#modo_manual, ManualValue:=#saida_manual,
     Reset:=#reset, State=>#estado);
// State: 0=inativo 1=auto 2=manual 3=pre-tuning 4=fine-tuning
// Auto-tuning: TIA Online → Technology objects → PID → Start tuning
```

**Sintonia Ziegler-Nichols — ponto de partida:**
```
1. I_SEL=FALSE, D_SEL=FALSE (apenas P)
2. Aumente Kp até oscilar com amplitude constante → Kp=Ku
3. Meça o período Tu (segundos)
   PI:  Kp = 0.45×Ku  Ti = 0.83×Tu
   PID: Kp = 0.60×Ku  Ti = 0.50×Tu  Td = 0.12×Tu
```

---

## 29. REFERÊNCIAS ADICIONAIS

Consulte documentação oficial Siemens em https://support.industry.siemens.com

---

## CHECKLIST FINAL — ANTES DE ENTREGAR O PROJETO

```
[ ] OBs de erro carregados: OB80, OB82, OB85, OB86, OB121, OB122
[ ] Todos os PIDs em OB cíclico (não no OB1)
[ ] CYCLE dos PIDs = período exato do OB35 que os chama
[ ] Nenhum dado analógico escalado sem verificar fio partido antes
[ ] Blocos otimizados ativados em todos os FBs e DBs (TIA Portal)
[ ] Nenhum timer/counter IEC declarado fora do VAR do FB pai
[ ] VAR_TEMP inicializadas antes de ler (não presuma valor inicial)
[ ] Nenhum acesso absoluto (DBx.DBWy) em blocos otimizados
[ ] Diagnostic Buffer consultado e limpo antes da entrega
[ ] Force da VAT desativado em todos os pontos
[ ] Documentação de nomenclatura de tags entregue ao cliente/operador
[ ] OB100 inicializa variáveis críticas e faz COM_RST nos PIDs
[ ] Safety: F-Signature verificada e aceita pelo engenheiro de segurança
```
