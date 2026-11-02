# Kickstart e Arquitetura de Projeto

> 💡 **Para times não técnicos:** antes de programar, decide-se *onde* (qual CLP),
> *com o quê* (qual linguagem) e *como organizar* o código. Errar aqui custa caro
> depois. Esta referência é o "estudo de viabilidade" e o esqueleto do projeto.

## Índice
1. Checklist de viabilidade
2. Plataforma — S7-300/400 × S7-1200/1500
3. Linguagem — quando usar cada uma
4. Tipos de bloco e ordem de compilação
5. Estrutura padrão do bloco SCL (com REGION)
6. Nomenclatura padrão
7. Modos de CPU e restart (Warm/Cold/Hot, OB100)
8. Retentividade ({Retain})
9. Exemplo arquitetural recomendado
10. Checklist final de entrega

---

## 1. Checklist de viabilidade — responda antes de abrir o TIA Portal / STEP 7

```
[ ] 1. Plataforma?        S7-300/400 (STEP 7 V5.x) | S7-1200/1500 (TIA Portal V13+)
[ ] 2. CPU?               Memória Work/Load, nº de OBs, versão de firmware
[ ] 3. Rede?              PROFIBUS DP | PROFINET | Nenhuma | Mista
[ ] 4. HMI?               WinCC Flexible | Advanced | Unified | Sem HMI
[ ] 5. Safety?            SIL/PLr definidos? F-CPU + F-I/O no BOM?  → referencias/safety.md
[ ] 6. PID?               Quantas malhas? FB41/PID_Compact? Válvula motorizada?  → pid.md
[ ] 7. Sequenciamento?    GRAPH ou FB com CASE?  → graph.md
[ ] 8. Comunicação CLP↔CLP?  PUT/GET | OUC | Modbus | Nenhuma  → comunicacao.md
[ ] 9. Analógicos?        4-20mA | 0-10V | PT100 | Termopar — quantos canais?  → analogicos.md
[ ] 10. Nomenclatura?     Padrão FC_/FB_/DB_/UDT_ acordado com a equipe? (seção 6)
```

---

## 2. Plataforma — decisão inicial

| Critério | S7-300/400 (STEP 7) | S7-1200/1500 (TIA Portal) |
|---|---|---|
| Projeto novo | ❌ descontinuado | ✅ preferencial |
| Modernizar planta existente | ✅ manter se viável | ✅ migrar com plano (→ migracao.md) |
| Safety integrado | ✅ F-300/400 | ✅ F-1200/1500 (mais simples) |
| Alta densidade I/O (>1000) | ✅ S7-400 | ✅ S7-1500 |
| Budget restrito | ✅ S7-300 reaproveitado | ✅ S7-1200 |
| Motion/CNC | — | ✅ S7-1500T (Technology Objects) |

**Ferramentas:** STEP 7 V5.x → SIMATIC Manager + Editor SCL (pacote adicional, CPU mín. 314).
TIA Portal V13+ → ambiente unificado, SCL nativo em todos os blocos.

---

## 3. Linguagem — quando usar cada uma

| Linguagem | Melhor para | Evitar |
|---|---|---|
| **LAD** (Ladder) | Intertravamentos, equipes elétricas | Algoritmos matemáticos complexos |
| **FBD** | Lógica de sinal, equipes de eletrônica | Laços e iterações |
| **STL** (lista de instruções) | Legado S7-300/400, ponteiros, performance extrema | Código novo no TIA Portal |
| **SCL** (texto estruturado) | Algoritmos, PID, receitas, arrays, strings | — é a linguagem principal |
| **GRAPH** (SFC) | Sequenciamento de máquinas | Controle contínuo |

Disponibilidade: S7-300/400 → LAD/FBD/STL/SCL · S7-1200 → LAD/FBD/SCL (sem STL) ·
S7-1500 → LAD/FBD/SCL/STL (AR emulado — evite STL com registradores em código novo).

---

## 4. Tipos de bloco e ordem de compilação

| Necessidade | Bloco | Regra |
|---|---|---|
| Controle com memória entre ciclos | **FB** | Um IDB por instância; timers/contadores no `VAR` |
| Cálculo puro, sem estado | **FC** | Sem IDB; retorno = nome da FC |
| Dados globais | **DB global** | Otimizado no TIA Portal; substitui marcas M |
| Estrutura reutilizável | **UDT / PLC data type** | Altere uma vez → atualiza todos os usos |
| Programa principal | **OB1** | Só chama FBs/FCs; nenhuma lógica direta |
| Tempo fixo (PID, filtros) | **OB30..38** | Período configurável; PID NUNCA no OB1 |

**Ordem de compilação (STEP 7 clássico) — OB1 sempre por último:**
```
UDTs → DBs globais → FCs/FBs folha → FBs que os chamam → DBs de instância → OBs → OB1
```

---

## 5. Estrutura padrão do bloco SCL (TIA Portal, com REGION)

```scl
FUNCTION_BLOCK "FB_NomeDescritivo"
{ S7_Optimized_Access := 'TRUE' }
// ============================================================
// FB_NomeDescritivo — descrição funcional em 1 linha
// POR QUÊ FB: guarda estado entre ciclos.   Autor: REGINALDO LOBO  ·  v1.0
// ============================================================
VERSION : 1.0

VAR_INPUT  setpoint : Real; habilitar : Bool := TRUE; END_VAR
VAR_OUTPUT saida : Real; emFalha : Bool; END_VAR
VAR_IN_OUT dados : "UDT_MeuTipo"; END_VAR     // por referência — sem cópia (struct grande)
VAR
  timer1        : TON;             // multi-instância IEC
  ciclos        : DInt;            // contador retentivo (ver seção 8)
  primeiroCiclo : Bool := TRUE;    // executa inicialização só uma vez
END_VAR
VAR_TEMP calc : Real; END_VAR      // ⚠ inicialize antes de ler — não há valor garantido!
VAR CONSTANT MAX_SAIDA : Real := 100.0; END_VAR

BEGIN
  REGION "1 - Inicialização"
    // POR QUÊ primeiroCiclo: rotinas que só rodam uma vez (zera buffers, etc.)
    IF #primeiroCiclo THEN
      #primeiroCiclo := FALSE;
    END_IF;
  END_REGION

  REGION "2 - Lógica principal"
    // código aqui — comente cada decisão não óbvia
  END_REGION
END_FUNCTION_BLOCK
```
> `REGION ... END_REGION` agrupa o código em blocos dobráveis no editor do TIA Portal —
> melhora muito a leitura de blocos grandes. Sempre nomeie a região com o propósito.

---

## 6. Nomenclatura padrão (acorde com a equipe e documente)

```
FC_   → Functions:       FC_EscalaNivel, FC_CalculaVazao
FB_   → Function Blocks: FB_ControlePID, FB_MotorWYE
DB_   → Data Blocks:     DB_Producao, DB_Receitas, DB_Falhas
UDT_  → Tipos:           UDT_Motor, UDT_Tanque, UDT_Receita
I/O   → Dispositivo_Funcao: M1_BtnLiga, V3_SensorNivel, P1_PressaoBar
```
TIA Portal usa **PLC Tags** com *Reference ID* — renomear a tag NÃO quebra o vínculo
com o HMI (evita "relink"). No STEP 7 clássico, é a **Tabela de Símbolos**.

---

## 7. Modos de CPU e restart

| Modo | Saídas | Quando |
|---|---|---|
| RUN | programa controla | operação normal |
| STOP | zeradas | falha / download / manual |
| HOLD | mantidas | breakpoint ativo (debug) |
| STARTUP | zeradas | OB100 executando antes do RUN |

| | Warm | Cold | Hot (S7-400) |
|---|---|---|---|
| M volátil | zerada | zerada | mantida |
| M retentiva | mantida | **zerada** | mantida |
| DBs em RAM | valor de carga | valor de carga | mantidos |

**OB100 (Startup):** use para inicializar variáveis e fazer `COM_RST := TRUE` nos PIDs.

---

## 8. Retentividade ({Retain})

> 💡 Retentivo = sobrevive a uma queda de energia / warm restart. Use só no que
> precisa persistir, pois consome memória retentiva limitada.

Declare como Retain: contadores de produção, odômetros, calibrações/offsets de sensor,
setpoints de receita (se não houver sistema de receitas dedicado).

- **STEP 7 clássico:** CPU Properties → Memory Configuration → define MBs retentivos.
- **TIA Portal (otimizado):** declare `{Retain}` na variável do `VAR` do FB (não no IDB).
- **Reset:** chave MRES · TIA Portal Online → Memory reset · Display do S7-1500.

```scl
VAR  {Retain} ciclosBomba : DInt; END_VAR   // sobrevive a warm restart
```

---

## 9. Exemplo arquitetural recomendado

```
OB1 (ciclo principal — só chama FBs)
  ├── "FB_ControleTanque".DB10 (tanque 1)
  │     ├── VAR timerConfBomba : TON   ← multi-instância IEC
  │     ├── VAR_IN_OUT dados : UDT_Tanque   ← referência, sem cópia
  │     └── VAR {Retain} ciclosBomba : DInt ← sobrevive warm restart
  ├── "FB_ControleTanque".DB11 (tanque 2 — mesmo FB, dados independentes)
  └── "DB_Diag".tempoCiclo := OB1_PREV_CYCLE   ← monitor de performance

OB30..38 @ 100ms (cíclico — PID, filtros, analógicos)
  ├── "FB_PID_Nivel".DB_PID1
  └── "FC_EscalaAnalogicos"   ← lê e escala todos os AI

OB100 (startup — inicialização e reset de PIDs)
OB122 (erro de I/O — registra endereço em DB_Diag; NÃO para a CPU)
```

```scl
TYPE "UDT_Tanque"
STRUCT
  nivelAtual   : Real;   // nível medido [%], 0..100
  nivelSetpoint: Real;   // nível desejado [%]
  bombaLigada  : Bool;   // TRUE = bomba em operação
  valvulaSaida : Bool;   // TRUE = válvula de saída aberta
  emFalha      : Bool;   // TRUE = falha ativa
  codFalha     : Int;    // 0=OK; outros = código específico
  ciclosBomba  : DInt;   // contagem acumulada (retentivo)
END_STRUCT;
END_TYPE
```

---

## 10. Checklist final — antes de entregar o projeto

```
[ ] OBs de erro carregados: OB80, OB82, OB85, OB86, OB121, OB122 (→ obs-e-sfcs.md)
[ ] Todos os PIDs em OB cíclico (não no OB1); CYCLE = período exato do OB que os chama
[ ] Nenhum analógico escalado sem checar fio partido antes (→ analogicos.md)
[ ] Blocos otimizados ativados em todos os FBs/DBs (TIA Portal)
[ ] Nenhum timer/contador IEC fora do VAR do FB pai
[ ] VAR_TEMP inicializada antes de ler
[ ] Nenhum acesso absoluto (DBx.DBWy) em blocos otimizados
[ ] Diagnostic Buffer consultado e limpo
[ ] Force da Watch Table desativado em todos os pontos
[ ] Documentação de nomenclatura de tags entregue ao cliente/operador
[ ] OB100 inicializa variáveis críticas e faz COM_RST nos PIDs
[ ] Safety: F-Signature verificada e aceita pelo engenheiro de segurança
[ ] Comentários ricos em todos os blocos (cabeçalho/seção/variável/"POR QUÊ")
```
