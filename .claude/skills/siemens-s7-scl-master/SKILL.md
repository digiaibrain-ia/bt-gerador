---
name: siemens-s7-scl-master
description: "Skill mestre para programação Siemens S7 e WinCC Unified em PT-BR. Cobre SCL, JavaScript WinCC Unified, comunicação industrial, PID, GRAPH e migração S7-300/400 para S7-1200/1500. Ative ao programar, revisar ou depurar código Siemens/WinCC.\n"
---

## Metadados completos

- **Autor**: Reginaldo Lobo
- **Versão**: 3.0
- **Idioma**: PT-BR
- **Aplicável a**: `*.scl` `*.awl` `*.lad` `*.fbd` `*.db` `*.udt` `*.s7p` `*.js`
- **Plataformas**: S7-300/400 STEP 7 V5.x · S7-1200/1500 TIA Portal V13-V20+ · WinCC Unified V17-V20+

**Referências oficiais:**
- Entry ID 109758536 — JS Style Guide + Tips&Tricks WinCC Unified
- Entry ID 109827603 — Engineering Guideline WinCC Unified
- Entry ID 81318674 — Programming Guideline S7-1200/1500
- SCL S7-300/400 Manual 6ES7811-1CA02-8BA0
- SIEMENS_S7_BLOCO v1.0 (29 seções)
- analogicos-escalonamento.md · comunicacao-s7-put-get.md · graph-sequenciadores.md · ponteiros-enderecos-indiretos.md · pid-controle.md

## Quando ativar esta skill

Ative esta skill quando o usuário:
- Programar SCL/STL para S7-300/400 no STEP 7 clássico
- Programar SCL para S7-1200/1500 no TIA Portal
- Criar OB, FB, FC, DB, UDT em qualquer plataforma Siemens
- Desenvolver scripts JavaScript para WinCC Unified
- Implementar escalonamento de sinais analógicos (AI/AO)
- Configurar comunicação GET/PUT, OUC, Modbus TCP, PROFIBUS DP
- Implementar PID (FB41, PID_Compact, PID_3Step)
- Programar sequenciadores com S7-GRAPH / SFC
- Usar ponteiros, ANY pointer ou VARIANT / ARRAY[*]
- Revisar, depurar ou otimizar código existente
- Planejar ou executar migração S7-300/400 → S7-1200/1500
- Implementar state machines, contadores com trava, anti-pulso duplo
- Integrar HMI ↔ PLC via Tags / OPC UA

Responda sempre em português do Brasil com código comentado, explicando o "porquê" de cada instrução e decisão de programação.

---

# SIEMENS S7 + WinCC UNIFIED — MASTER SKILL
**Autor:** REGINALDO LOBO
**Versão:** 2.0
**Idioma:** Português do Brasil (PT-BR)
**Plataformas:** S7-300/400 · S7-1200/1500 · TIA Portal V17-V20+ · WinCC Unified

> 💡 **Para times não técnicos:** Esta skill gera código industrial para CLPs Siemens
> e telas WinCC. Um CLP é o "cérebro" de uma máquina de produção. Os comentários `//`
> dentro do código explicam em linguagem simples o que cada parte faz e **por que**
> aquela abordagem foi escolhida — não apenas o "como".

---

## ÍNDICE

1.  [Workflow em 3 Passos](#1-workflow-em-3-passos)
2.  [Mapa das Plataformas](#2-mapa-das-plataformas)
3.  [Regras Críticas — Nunca Violar](#3-regras-críticas--nunca-violar)
4.  [Decision Tree — FC vs FB vs DB](#4-decision-tree--fc-vs-fb-vs-db)
5.  [Templates Padrão Comentados](#5-templates-padrão-comentados)
6.  [Estruturas de Controle](#6-estruturas-de-controle)
7.  [Funções Core — 34 Referências Completas](#7-funções-core--34-referências-completas)
8.  [Anti-Patterns — 22 Erros Comuns](#8-anti-patterns--22-erros-comuns)
9.  [Tipos de Dados — Referência Completa](#9-tipos-de-dados--referência-completa)
10. [Sinais Analógicos — Escalonamento Completo](#10-sinais-analógicos--escalonamento-completo)
11. [Comunicação entre CLPs — Completo](#11-comunicação-entre-clps--completo)
12. [PID — Controle de Processo](#12-pid--controle-de-processo)
13. [GRAPH — Sequenciadores SFC](#13-graph--sequenciadores-sfc)
14. [Ponteiros e Endereçamento Indireto](#14-ponteiros-e-endereçamento-indireto)
15. [OBs e Variáveis de Sistema](#15-obs-e-variáveis-de-sistema)
16. [SFCs de Sistema — Referência](#16-sfcs-de-sistema--referência)
17. [JavaScript — WinCC Unified](#17-javascript--wincc-unified)
18. [Blocos Otimizados vs Não-Otimizados](#18-blocos-otimizados-vs-não-otimizados)
19. [Download Seguro e Diagnóstico](#19-download-seguro-e-diagnóstico)
20. [Migração S7-300/400 → S7-1200/1500](#20-migração-s7-300400--s7-12001500)
21. [Checklist Universal Pre-Commit](#21-checklist-universal-pre-commit)
22. [Quick Reference — Keywords e Operadores](#22-quick-reference--keywords-e-operadores)
23. [REGION / END_REGION — Organização de Blocos](#23-region--end_region--organização-de-blocos)
24. [Bibliotecas Siemens — LGF](#24-bibliotecas-siemens--lgf-library-general-functions)
25. [Versionamento de Blocos — Rastreabilidade](#25-versionamento-de-blocos--rastreabilidade)
26. [SIMATIC Memory Card — Backup e Restauração](#26-simatic-memory-card--backup-e-restauração)
27. [Safety — F-CPU Conceitos Essenciais](#27-safety--f-cpu-conceitos-essenciais)
28. [SiVArc — Geração Automática de Telas HMI](#28-sivarc--geração-automática-de-telas-hmi)
29. [Checklist Específico para GRAPH](#29-checklist-específico-para-graph)

---

## 1. WORKFLOW EM 3 PASSOS

> 💡 **Para times não técnicos:** Siga sempre essa sequência antes de programar qualquer
> bloco. Evita retrabalho e garante que o código funcione na primeira compilação.

```
┌─────────────────────────────────────────────────────────────────────┐
│ PASSO 1 — IDENTIFICA O TIPO DE BLOCO                                │
│                                                                     │
│ Preciso guardar informações entre ciclos de varredura do CLP?       │
│ (Ex: estado de motor, acumulador, timer em andamento, posição)      │
│                                                                     │
│   NÃO → FC (Function)     SIM → FB (Function Block)                │
│          Calculadora              Objeto com memória                │
│          Sem estado               Com estado                        │
│          Conversões, fórmulas     Motores, sequências, timers       │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ PASSO 2 — CONSULTA AS FUNÇÕES NATIVAS                               │
│   → Seção 7:  34 Funções Core com exemplos                         │
│   → Seção 10: Escalonamento analógico (NORM_X / SCALE_X / FC)      │
│   → Seção 11: Comunicação (GET/PUT, OUC, Modbus)                   │
│   → Seção 12: PID (FB41 / PID_Compact)                             │
│   → Seção 13: GRAPH (S7-GRAPH / SFC)                               │
│   → Seção 14: Ponteiros (ANY / VARIANT / ARRAY[*])                 │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ PASSO 3 — VALIDA COM CHECKLIST                                      │
│   → Seção 21: Checklist Universal Pre-Commit                        │
│   → Seção 8:  22 Anti-Patterns para evitar                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. MAPA DAS PLATAFORMAS

> 💡 **Para times não técnicos:** Siemens tem duas gerações de CLPs. Esta tabela mostra
> qual ferramenta usar para cada geração e quais linguagens estão disponíveis.

| Plataforma | Ferramenta | Linguagens | Observação |
|---|---|---|---|
| **S7-300 / S7-400** | STEP 7 V5.x (SIMATIC Manager) | LAD, FBD, STL, SCL* | SCL é pacote opcional |
| **S7-1200 / S7-1500** | TIA Portal V13-V20+ | LAD, FBD, SCL, STL** | STL apenas no S7-1500 |
| **WinCC Unified** | TIA Portal V17-V20+ | JavaScript (ES6+) | Style Guide Entry ID 109758536 |

### Tipos de Bloco — Todos os Ambientes

| Bloco | Tem memória? | Função | Analogia |
|---|---|---|---|
| **OB** | Não | Chamado pelo SO da CPU; estrutura de execução | "Agenda do programa" |
| **FB** | Sim (IDB) | Bloco com estado — lembra ciclos anteriores | "Objeto com estado" |
| **FC** | Não | Cálculo puro sem memória entre chamadas | "Calculadora" |
| **DB** | Sim | Área de dados: global ou de instância | "Planilha de dados" |
| **UDT** | N/A | Tipo de dado estruturado reutilizável | "Modelo de formulário" |
| **SFB/SFC** | — | Funções de sistema integradas na CPU | "Biblioteca padrão" |

---

## 3. REGRAS CRÍTICAS — NUNCA VIOLAR

> 💡 **Para times não técnicos:** Estas são as regras de ouro da programação SCL Siemens.
> Violar qualquer uma causa erro de compilação ou comportamento imprevisível na máquina.

### 🚨 R1 — Parâmetros Nomeados SEMPRE
```scl
// POR QUÊ: O compilador SCL exige que cada parâmetro seja identificado pelo nome.
// Sem isso, o código não compila. É como preencher um formulário — cada campo
// precisa do rótulo correto para que o sistema saiba onde colocar cada valor.

// ✅ CORRETO — cada parâmetro identificado com := (entrada) ou => (saída)
resultado := LIMIT(MN := 0, IN := valor, MX := 100);
#Motor1(Start := botaoPartida, Speed := setpoint, Running => motorOK, Error => alarme);
#timer1(IN := condicao, PT := T#2s);
#trig1(CLK := sinal);

// ❌ ERRADO — ERRO DE COMPILAÇÃO! Parâmetros sem nome
resultado := LIMIT(0, valor, 100);   // não compila!
```

### 🚨 R2 — Timer / Counter / Trigger em VAR — NUNCA em VAR_TEMP
```scl
// POR QUÊ: VAR_TEMP é apagada a cada ciclo do CLP (~10ms).
// Um timer em VAR_TEMP nunca chega a completar seu tempo porque é zerado antes
// de terminar. É como zerar um cronômetro a cada segundo tentando medir 5s —
// nunca vai conseguir chegar ao fim.

// ❌ ERRADO — timer reseta todo ciclo, nunca dispara (Q nunca fica TRUE)
VAR_TEMP
  meuTimer : TON;     // ERRADO! — zerado a cada ~10ms
  meuTrig  : R_TRIG;  // ERRADO! — perde as bordas entre ciclos
  meuCTU   : CTU;     // ERRADO! — contagem zerada sempre
END_VAR

// ✅ CORRETO — memória persistente entre ciclos de varredura
VAR
  meuTimer : TON;     // OK — valor mantido entre ciclos
  meuTrig  : R_TRIG;  // OK — captura a borda corretamente
  meuCTU   : CTU;     // OK — acumula corretamente ao longo do tempo
END_VAR
// VAR_STAT também é válido — mesma persistência que VAR dentro de FB
```

### 🚨 R3 — ELSIF (nunca ELSEIF)
```scl
// POR QUÊ: A sintaxe SCL usa ELSIF (sem E no meio).
// ELSEIF é de outras linguagens (Python, VB) e causa erro de compilação em SCL.

// ✅ CORRETO
IF temperatura < 0.0 THEN
  estado := 'CONGELADO';
ELSIF temperatura < 100.0 THEN    // ← ELSIF! Não ELSEIF
  estado := 'LIQUIDO';
ELSE
  estado := 'VAPOR';
END_IF;
```

### 🚨 R4 — := para entrada, => para saída
```scl
// POR QUÊ: O CLP precisa saber qual parâmetro está recebendo um valor (entrada :=)
// e qual está enviando um valor de volta (saída =>). Misturar causa erro de compilação.

// ✅ CORRETO
#Motor1(
  Start    := botaoPartida,   // → ENTRA no bloco (uso :=)
  Speed    := setpointVel,    // → ENTRA no bloco (uso :=)
  Running  => motorLigado,    // ← SAI do bloco (uso =>)
  Error    => alarmeMotor     // ← SAI do bloco (uso =>)
);
```

### 🚨 R5 — State Machine com CASE OF (nunca IF-ELSIF longo)
```scl
// POR QUÊ: Uma sequência longa de IF-ELSIF é difícil de ler e mais lenta de executar.
// O CASE OF funciona como um mapa — o CLP vai diretamente ao estado correto
// sem verificar todos os anteriores (O(1) vs O(n)).
// SEMPRE incluir ELSE com estado de erro (99) — protege contra estados desconhecidos.

// ✅ CORRETO — com ELSE obrigatório
CASE estado OF
  0: IF iniciar THEN estado := 1; END_IF;
  1: executar(); IF concluido THEN estado := 2; END_IF;
  2: finalizar(); estado := 0;
  ELSE: estado := 99; // Sempre incluir! Estado desconhecido → erro
END_CASE;
```

### 🚨 R6 — Nunca comparar FLOAT com = (tolerância obrigatória)
```scl
// POR QUÊ: Números decimais em computadores são aproximações binárias (IEEE 754).
// 0.1 + 0.2 em binário não é exatamente 0.3 — é 0.30000000000000004.
// Comparar diretamente com = pode NUNCA ser verdadeiro, causando comportamento
// imprevisível na máquina. Sempre usar uma faixa de tolerância.

// ❌ ERRADO — pode nunca ser TRUE
IF posicao = 333.80 THEN dispararCamera(); END_IF;

// ✅ CORRETO — sempre usar tolerância explícita
IF ABS(IN := posicao - 333.80) < 0.005 THEN  // ±5µm de tolerância
  dispararCamera();
END_IF;
```

---

## 4. DECISION TREE — FC VS FB VS DB

> 💡 **Para times não técnicos:** Escolher o tipo errado de bloco causa bugs difíceis
> de encontrar. Esta árvore de decisão guia a escolha certa em qualquer situação.

```
Meu bloco precisa LEMBRAR algo entre um ciclo e o próximo?
(estado de motor, contagem acumulada, timer em andamento, histórico...)

         NÃO                              SIM
          ↓                               ↓
    FC — Function                   FB — Function Block
    "Calculadora pura"              "Objeto com memória"

    ✔ Cálculos matemáticos          ✔ Controle de motores
    ✔ Conversão de unidades         ✔ Timers com lógica
    ✔ Escalonamento analógico       ✔ Sequenciadores
    ✔ Lookup tables                 ✔ State machines
    ✔ Converter contador→válvula    ✔ Anti-pulso duplo
    ✔ Remapeamento de sinais        ✔ Acumuladores de dados
    ✔ Validação de entradas         ✔ Monitoramento SRMV

    Não tem VAR (só VAR_INPUT,      Tem VAR para memória
    VAR_OUTPUT, VAR_TEMP)           persistente entre ciclos

    ↓ QUANDO USAR DB GLOBAL:
    Dados que precisam ser acessados por múltiplos FBs/FCs,
    dados de receitas, configurações, histórico de produção.
```

---

## 5. TEMPLATES PADRÃO COMENTADOS

### Estrutura Completa de Bloco SCL — Atributos
```scl
FUNCTION_BLOCK "fb91_NomeDoBloco"
{ S7_Optimized_Access := 'FALSE' }
// ============================================================
// TITLE = 'Descrição breve do bloco'
// VERSION : '1.0'         — versão para controle de revisão
// AUTHOR  : ReginaldoLobo — máx 8 chars no STEP 7 clássico
// NAME    : fb91_NomeBloco
// FAMILY  : Controle
// KNOW_HOW_PROTECT       — descomente para proteger o código
//
// O QUÊ FAZ: [descreva o propósito em 1 linha]
// POR QUÊ FB: precisa guardar o estado atual entre ciclos
//
// ESTADOS DA MÁQUINA:
//   0  = Idle — aguardando comando
//   1  = Iniciando — preparação
//   2  = Executando — operação normal
//   3  = Finalizando — encerramento seguro
//   99 = Erro — aguarda reset do operador
//
// Projeto: [nome do projeto]
// Autor: REGINALDO LOBO
// Data: [data]
// ============================================================
VERSION : 0.1
```

### Template FB — State Machine Completa
```scl
FUNCTION_BLOCK "fb_NomeDoBloco"
{ S7_Optimized_Access := 'FALSE' }
VERSION : 0.1

VAR_INPUT
  iStart          : Bool;   // Comando de início (usar borda R_TRIG)
  iStop           : Bool;   // Comando de parada (nível alto = parar)
  iSetpoint       : Real;   // Valor de referência (unidade: especificar)
  iReset          : Bool;   // Reset de erro — retorna ao estado Idle
END_VAR

VAR_OUTPUT
  oRodando        : Bool;   // TRUE = bloco em operação
  oCompleto       : Bool;   // TRUE = ciclo concluído com sucesso
  oErro           : Bool;   // TRUE = falha ativa — verificar oDiagEstado
  oDiagEstado     : Int;    // Estado atual (0,1,2,3,99) para diagnóstico
END_VAR

VAR
  // ── MEMÓRIA DE ESTADO ─────────────────────────────────────
  _estado         : Int;    // Variável principal da state machine

  // ── TIMERS — OBRIGATÓRIO em VAR, nunca em VAR_TEMP! ──────
  // POR QUÊ: timer em VAR_TEMP é zerado a cada ciclo (~10ms) e nunca dispara
  _tonInicio      : TON;

  // ── DETECÇÃO DE BORDA — OBRIGATÓRIO em VAR ───────────────
  // POR QUÊ R_TRIG: detecta o MOMENTO EXATO do clique, não o sinal contínuo
  _trigStart      : R_TRIG;
  _trigStop       : R_TRIG;

  _contadorErros  : Int;    // Conta erros para análise de tendência
END_VAR

VAR_TEMP
  // Apenas cálculos que não precisam ser lembrados entre ciclos
  _tempCalc       : Real;
END_VAR

BEGIN

  // ══════════════════════════════════════════════════════════
  // 1. DETECÇÃO DE BORDA — sempre no início do BEGIN
  // POR QUÊ primeiro: bordas precisam ser capturadas antes de qualquer lógica
  // ══════════════════════════════════════════════════════════
  _trigStart(CLK := iStart);
  _trigStop (CLK := iStop);

  // ══════════════════════════════════════════════════════════
  // 2. RESET GLOBAL — alta prioridade, RETURN imediato
  // POR QUÊ RETURN: se operador pediu reset, não executa mais nada neste ciclo
  // ══════════════════════════════════════════════════════════
  IF iReset THEN
    _estado        := 0;
    _contadorErros := 0;
    oRodando       := FALSE;
    oCompleto      := FALSE;
    oErro          := FALSE;
    _tonInicio(IN := FALSE, PT := T#0ms); // Reseta o timer explicitamente
    RETURN;
  END_IF;

  // ══════════════════════════════════════════════════════════
  // 3. STATE MACHINE PRINCIPAL
  // POR QUÊ CASE OF: mais eficiente que IF-ELSIF longo.
  // ELSE obrigatório — protege contra estado desconhecido.
  // ══════════════════════════════════════════════════════════
  CASE _estado OF

    0: // ── IDLE — aguardando comando
      oRodando  := FALSE;
      oCompleto := FALSE;
      IF _trigStart.Q AND NOT iStop THEN
        _estado := 1;
        _tonInicio(IN := FALSE, PT := T#0ms); // Garante timer resetado
      END_IF;

    1: // ── INICIANDO — período de preparação com timer
      // POR QUÊ timer: equipamentos precisam estabilizar antes de operar
      _tonInicio(IN := TRUE, PT := T#2s);
      oRodando := TRUE;
      IF _tonInicio.Q THEN _estado := 2; END_IF;
      IF _trigStop.Q  THEN _estado := 0; END_IF;

    2: // ── EXECUTANDO — operação normal
      oRodando := TRUE;
      // LIMIT garante que o setpoint nunca saia da faixa segura
      _tempCalc := LIMIT(MN := 0.0, IN := iSetpoint, MX := 3000.0);
      IF _trigStop.Q THEN
        _estado  := 3;
        oRodando := FALSE;
      END_IF;

    3: // ── FINALIZANDO — encerramento seguro
      oRodando  := FALSE;
      oCompleto := TRUE;
      _estado   := 0;

    99: // ── ERRO — aguarda ação do operador
      oRodando := FALSE;
      oErro    := TRUE;

    ELSE:
      // Estado desconhecido — proteção contra corrupção de memória
      _estado := 99;

  END_CASE;

  oDiagEstado := _estado;

END_FUNCTION_BLOCK
```

### Template FC — Função Pura
```scl
FUNCTION "fc_NomeDaFuncao" : REAL
{ S7_Optimized_Access := 'FALSE' }
// POR QUÊ FC: não precisa guardar nada entre ciclos — calcula e retorna
VERSION : 0.1

VAR_INPUT
  iValor  : Real;   // Valor a ser processado
  iCount  : Int;    // Quantidade de amostras (1..N)
END_VAR

VAR_TEMP
  // Variáveis temporárias — existem APENAS durante a execução
  // NUNCA colocar timers ou triggers aqui!
  tSoma   : Real;
  tIndex  : Int;
END_VAR

BEGIN
  // ── VALIDAÇÃO — sempre antes de calcular
  // POR QUÊ: entradas inválidas causam divisão por zero ou overflow
  IF iCount <= 0 THEN
    #fc_NomeDaFuncao := 0.0;
    RETURN; // Sai imediatamente — código abaixo só executa se válido
  END_IF;

  tSoma := 0.0;
  FOR tIndex := 0 TO iCount - 1 DO
    tSoma := tSoma + iValor;
  END_FOR;

  // POR QUÊ TO_REAL: soma e count são Int — divisão inteira trunca resultado
  // Ex: 5 / 2 = 2 (Int) mas queremos 2.5 (Real)
  #fc_NomeDaFuncao := tSoma / TO_REAL(iCount);
END_FUNCTION
```

---

## 6. ESTRUTURAS DE CONTROLE

### IF — Condicional
```scl
// Simples
IF pressao > 10.0 THEN alarme := TRUE; END_IF;

// Completo — use ELSIF (não ELSEIF!)
IF pressao < 1.0 THEN
  status := 'BAIXA';
ELSIF pressao > 10.0 THEN
  status := 'ALTA';
ELSE
  status := 'NORMAL';
END_IF;
```

### CASE OF — State Machine e Seleção
```scl
// POR QUÊ CASE: O CLP vai direto ao estado correto — não testa IF anteriores.
// ELSE obrigatório — sempre incluir estado de erro!
CASE estado OF
  0: Running := FALSE; IF Start THEN estado := 1; END_IF;
  1: Running := TRUE;  IF completo THEN estado := 2; END_IF;
  2: finalizar(); estado := 0;
  ELSE: estado := 99; erro := TRUE; // Sempre incluir!
END_CASE;
```

### FOR — Loop com Contador
```scl
FOR i := 0 TO 9 DO temperaturas[i] := lerSensor(i); END_FOR;
FOR i := 10 DOWNTO 0 DO buffer[i] := 0; END_FOR; // Decrescente
FOR i := 0 TO 100 BY 5 DO processar(i); END_FOR;  // Passo 5

// EXIT — saída antecipada (para ao encontrar o valor)
FOR i := 0 TO 99 DO
  IF dados[i] = valorProcurado THEN
    indice := i;
    EXIT; // POR QUÊ EXIT: para o loop imediatamente — não continua testando
  END_IF;
END_FOR;

// CONTINUE — pula iteração atual
FOR i := 0 TO 99 DO
  IF dados[i] < 0 THEN CONTINUE; END_IF; // Pula negativos
  processarPositivo(dados[i]);
END_FOR;
```

### WHILE e REPEAT
```scl
// WHILE — testa ANTES (pode não executar nenhuma vez)
WHILE contador < 100 AND NOT erro DO contador := contador + 1; END_WHILE;

// REPEAT — testa DEPOIS (executa pelo menos uma vez)
// ⚠️ ATENÇÃO: termina quando a condição é TRUE (oposto do WHILE!)
REPEAT
  valor     := lerSensor();
  tentativas := tentativas + 1;
UNTIL (valor > limiar) OR (tentativas >= maxTent)
END_REPEAT;
```

### RETURN — Saída Antecipada
```scl
// POR QUÊ RETURN: valida no início, sai se inválido — código mais limpo
IF entradaInvalida THEN
  resultado := 0.0;
  flagErro  := TRUE;
  RETURN; // Sai imediatamente — o resto só executa se entrada válida
END_IF;
```

---

## 7. FUNÇÕES CORE — 34 REFERÊNCIAS COMPLETAS

> 💡 **Para times não técnicos:** Funções prontas do Siemens — como fórmulas em Excel.
> Sempre usar as nativas em vez de programar manualmente — mais rápidas e sem bugs.

### ─── MATEMÁTICAS ───

#### 1. LIMIT — Limitar Valor dentro de uma Faixa
```scl
// POR QUÊ: impede que um valor saia da faixa segura de operação
// Ex: operador digita 5000 RPM mas motor suporta só 3000 — LIMIT protege
velocidade := LIMIT(MN := 0.0, IN := setpointBruto, MX := 3000.0);
angulo     := LIMIT(MN := -90.0, IN := anguloCmd, MX := 90.0);
// ❌ NÃO reimplementar manualmente — LIMIT é 3× mais eficiente
```

#### 2. MIN — Valor Mínimo entre N valores
```scl
// Até IN32 parâmetros de entrada
tempMin  := MIN(IN1 := sensor1, IN2 := sensor2, IN3 := sensor3);
cargaSeg := MIN(IN1 := cargaMax, IN2 := cargaAtual);
```

#### 3. MAX — Valor Máximo entre N valores
```scl
pressMax := MAX(IN1 := p1, IN2 := p2, IN3 := p3, IN4 := p4);
pico     := MAX(IN1 := valorAtual, IN2 := picoAnterior);
```

#### 4. ABS — Valor Absoluto
```scl
// POR QUÊ ABS: verifica distância ou desvio sem importar a direção
erro := ABS(IN := setpoint - valorAtual);
// Verificar tolerância de posição:
IF ABS(IN := posicao - 333.80) < 0.005 THEN naPosicao := TRUE; END_IF;
```

#### 5. SQRT — Raiz Quadrada
```scl
// ⚠️ SEMPRE validar entrada >= 0 antes! Raiz negativa causa crash no CLP.
IF valor >= 0.0 THEN
  resultado  := SQRT(IN := valor);
ELSE
  resultado  := 0.0;
  erroCalculo := TRUE; // Sinaliza para investigação
END_IF;
```

#### 6. SQR — Quadrado (x²)
```scl
energia    := (massa * SQR(IN := velocidade)) / 2.0;
hipotenusa := SQRT(IN := SQR(IN := a) + SQR(IN := b));
```

### ─── TIMERS ─── (SEMPRE em VAR, nunca VAR_TEMP!)

#### 7. TON — Timer On-Delay (mais usado)
```
// Diagrama de tempo:
// IN:  ___/‾‾‾‾‾‾‾‾‾‾\___
// Q:   _______/‾‾‾‾‾‾\___
//              |<-PT->|
// ET: sobe até PT, zera quando IN cai
```
```scl
VAR tonEspera : TON; END_VAR
// POR QUÊ TON: equipamentos precisam de estabilização antes de operar
#tonEspera(IN := condicaoAtiva, PT := T#2s);
IF #tonEspera.Q THEN liberarOperacao(); END_IF;
// Acessar tempo decorrido: #tonEspera.ET
```

#### 8. TOF — Timer Off-Delay
```
// Diagrama de tempo:
// IN:  ‾‾‾\___________/‾‾
// Q:   ‾‾‾‾‾‾‾\________/‾
//               |<-PT->|
```
```scl
VAR tofVentilador : TOF; END_VAR
// POR QUÊ TOF: mantém ventilador ligado 30s após desligar o aquecedor
// para dissipar calor residual e proteger o motor
#tofVentilador(IN := aquecedorLigado, PT := T#30s);
ventiladorRodando := #tofVentilador.Q;
```

#### 9. TP — Pulso de Duração Fixa
```
// Diagrama de tempo:
// IN:  ___/‾‾‾‾‾‾‾‾‾‾‾‾‾\
// Q:   ___/‾‾‾‾\__________
//           PT → ignora IN durante o pulso
```
```scl
VAR tpPulso : TP; END_VAR
// POR QUÊ TP: garante pulso de duração exata, ignorando múltiplos cliques
#tpPulso(IN := gatilho, PT := T#200ms);
saidaPulso := #tpPulso.Q;
```

### ─── CONTADORES ─── (SEMPRE em VAR, nunca VAR_TEMP!)

#### 10. CTU — Count Up
```scl
VAR ctuPecas : CTU; END_VAR
#ctuPecas(CU := sensorPeca, R := resetBotao, PV := 100);
IF #ctuPecas.Q THEN loteConcluido := TRUE; END_IF;
// .CV = valor atual | .Q = TRUE quando CV >= PV
```

#### 11. CTD — Count Down
```scl
VAR ctdReg : CTD; END_VAR
#ctdReg(CD := decrementar, LD := carregar, PV := 50);
// .Q = TRUE quando CV <= 0
```

#### 12. CTUD — Count Up/Down (bidirecional)
```scl
VAR ctudEstoque : CTUD; END_VAR
// POR QUÊ CTUD: controle de estoque — incrementa entrada, decrementa saída
#ctudEstoque(CU := entrada, CD := saida, R := reset, LD := FALSE, PV := 1000);
// .QU = TRUE quando CV >= PV (estoque cheio)
// .QD = TRUE quando CV <= 0  (estoque vazio)
```

### ─── DETECÇÃO DE BORDA ─── (SEMPRE em VAR, nunca VAR_TEMP!)

#### 13. R_TRIG — Borda de Subida (0→1)
```scl
VAR trigSubida : R_TRIG; END_VAR
// POR QUÊ R_TRIG: detecta o MOMENTO EXATO do clique — não o sinal contínuo.
// Sem R_TRIG, um botão pressionado por 1s executaria a ação ~100 vezes!
#trigSubida(CLK := sinalEntrada);
IF #trigSubida.Q THEN acaoUnicaNaSubida(); END_IF; // Executa APENAS 1 scan
// ❌ NÃO usar: IF NOT prevSinal AND sinalAtual THEN... (perde bordas rápidas!)
```

#### 14. F_TRIG — Borda de Descida (1→0)
```scl
VAR trigDescida : F_TRIG; END_VAR
// POR QUÊ F_TRIG: detecta quando o sinal CAI — útil para confirmar retorno
// de cilindro, fim de ciclo, término de operação
#trigDescida(CLK := sinalEntrada);
IF #trigDescida.Q THEN acaoUnicaNaDescida(); END_IF;
```

### ─── SELEÇÃO E COMPARAÇÃO ───

#### 15. SEL — Seletor Binário
```scl
// POR QUÊ SEL: substitui IF-THEN-ELSE de uma linha — mais limpo e eficiente
// SEL(G=FALSE → retorna IN0, G=TRUE → retorna IN1)
setpointAtivo := SEL(G := modoAuto, IN0 := spManual, IN1 := spAuto);
turno         := SEL(G := (hora >= 6 AND hora < 15), IN0 := 2, IN1 := 1);
corLED        := SEL(G := statusOK, IN0 := 16#FF0000, IN1 := 16#00FF00);
```

#### 16. MUX — Multiplexer (seleciona entre N opções)
```scl
// POR QUÊ MUX: seleciona receita, modo ou configuração por índice
// K=0→IN0, K=1→IN1, K=2→IN2, etc. (até IN31)
receitaAtiva := MUX(K := numeroReceita,
                    IN0 := receita1, IN1 := receita2,
                    IN2 := receita3, IN3 := receita4);
```

#### 17. ROL — Rotação de Bits à Esquerda
```scl
// POR QUÊ ROL: varredura sequencial de saídas (lâmpadas, solenoides)
padrao := ROL(IN := 16#0F, N := 3); // 0000_1111 → 0111_1000
```

#### 18. ROR — Rotação de Bits à Direita
```scl
padrao := ROR(IN := 16#F0, N := 4); // 1111_0000 → 0000_1111
```

#### 19. SHL — Shift Left (multiplica por 2^N)
```scl
// POR QUÊ SHL: criação de máscaras de bit para controle de saídas
mascara := SHL(IN := 16#01, N := bitPosicao);
result  := SHL(IN := 5, N := 3);    // 5 × 8 = 40
```

### ─── CONVERSÃO DE TIPOS ───

#### 20. TRUNC — Trunca em direção a zero
```scl
inteiro  := TRUNC(IN := 45.89);  // = 45
negativo := TRUNC(IN := -2.9);   // = -2 (em direção a zero, não para baixo!)
```

#### 21. ROUND — Arredonda para o mais próximo
```scl
count := ROUND(IN := 7.4); // = 7
count := ROUND(IN := 7.6); // = 8
count := ROUND(IN := 7.5); // = 8 (arredonda para cima no empate)
```

#### 22. CEIL — Arredonda para cima (teto)
```scl
// POR QUÊ CEIL: calcular número de lotes necessários (sempre arredonda para cima)
lotes := CEIL(IN := totalPecas / TO_REAL(tamanhLote)); // 3.1 → 4
```

#### 23. FLOOR — Arredonda para baixo (piso)
```scl
lotes := FLOOR(IN := ratio); // 3.9 → 3
```

#### 24. TO_REAL — Converte para Real (CRÍTICO antes de divisão!)
```scl
// POR QUÊ TO_REAL: sem conversão, 5 / 2 = 2 (divisão inteira, trunca!)
// Com conversão: TO_REAL(5) / TO_REAL(2) = 2.5 (resultado correto)

// ✅ CORRETO
media := TO_REAL(soma) / TO_REAL(count);

// ❌ ERRADO — resultado truncado (5/2=2, não 2.5)
media := soma / count;

// Outras conversões:
dintVal  := TO_DINT(intVal);     // widening — sempre seguro
intVal   := TO_INT(dintVal);     // narrowing — verificar overflow!
wordVal  := TO_WORD(intVal);
```

### ─── STRINGS ───

#### 25. CONCAT — Concatenar Strings
```scl
// POR QUÊ CONCAT e não +: operador + NÃO funciona em SCL para strings!
mensagem := CONCAT(IN1 := 'Erro na ', IN2 := nomeEquipamento);
// Múltiplas: temp := CONCAT(IN1 := a, IN2 := b); result := CONCAT(IN1 := temp, IN2 := c);
```

#### 26. LEN — Comprimento da String
```scl
comprimento := LEN(IN := nomeOperador);
IF comprimento > 20 THEN stringMuitoLonga := TRUE; END_IF;
```

#### 27. LEFT / RIGHT / MID — Substrings
```scl
prefixo := LEFT(IN := 'MOTOR_001', L := 5);              // = 'MOTOR'
sufixo  := RIGHT(IN := 'MOTOR_001', L := 3);             // = '001'
meio    := MID(IN := 'MOTOR_001', L := 3, P := 7);       // = '001' (P=posição inicial 1-based)
```

#### 28. FIND — Buscar Substring
```scl
posicao := FIND(IN1 := textoCompleto, IN2 := 'ERR');
IF posicao > 0 THEN erroEncontrado := TRUE; END_IF; // 0 = não encontrado
```

#### 29. INT_TO_STRING — Número para String
```scl
// POR QUÊ: exibir valores numéricos em mensagens de alarme ou HMI
strNum   := INT_TO_STRING(IN := numeroValvula); // 14 → '14'
mensagem := CONCAT(IN1 := 'Valvula_', IN2 := strNum); // 'Valvula_14'
```

### ─── MOVE / COPY ───

#### 30. MOVE_BLK — Copiar Array (~10-20× mais rápido que FOR)
```scl
// POR QUÊ: copiar 24 booleans com FOR leva 24 ciclos de loop.
// MOVE_BLK copia tudo em uma única instrução de CPU.
MOVE_BLK(IN := resultadoRetentor[1], COUNT := 24, OUT => historicoRetentor[1]);
// ❌ NÃO: FOR i:=1 TO 24 DO dest[i]:=orig[i]; END_FOR;
```

#### 31. FILL_BLK — Preencher/Zerar Array (~10-15× mais rápido que FOR)
```scl
// POR QUÊ: inicializa arrays inteiros em uma instrução de CPU
FILL_BLK(IN := FALSE, COUNT := 24, OUT => resultadoValvulas[1]);
FILL_BLK(IN := 0,     COUNT := 100, OUT => buffer[0]);
// ❌ NÃO: FOR i:=0 TO 99 DO arr[i]:=0; END_FOR;
```

### ─── ESCALONAMENTO ANALÓGICO ───

#### 32. NORM_X + SCALE_X — Pipeline ADC → Engenharia (TIA Portal)
```scl
// POR QUÊ: converter leitura bruta do módulo analógico para unidade de engenharia
// Passo 1: Normaliza raw (0..27648) para (0.0..1.0)
normalizado := NORM_X(MIN := 0.0, VALUE := TO_REAL(rawADC), MAX := 27648.0);
// Passo 2: Escala para a unidade de engenharia
pressaoBar  := SCALE_X(MIN := 0.0, VALUE := normalizado, MAX := 16.0); // 0-16 bar
```

#### 33. LOWER_BOUND / UPPER_BOUND — Limites de Array Dinâmico (TIA Portal)
```scl
// POR QUÊ: determinar tamanho de ARRAY[*] em runtime — substitui ANY pointer
lower := LOWER_BOUND(ARR := meuArray, DIM := 1);
upper := UPPER_BOUND(ARR := meuArray, DIM := 1);
FOR i := lower TO upper DO processar(meuArray[i]); END_FOR;
```

#### 34. TypeOf — Verificar Tipo em Runtime (TIA Portal com VARIANT)
```scl
// POR QUÊ: VARIANT pode conter qualquer tipo — verificar antes de acessar
IF TypeOf(#variante) = Int THEN
  valor := #variante; // acesso seguro após verificação de tipo
END_IF;
```

---

## 8. ANTI-PATTERNS — 22 ERROS COMUNS

> 💡 **Para times não técnicos:** Um anti-pattern é uma solução que parece certa
> mas causa problemas sérios. Esta lista tem os 22 erros mais frequentes.

| # | ❌ Anti-Pattern | ✅ Correto | Por que é importante |
|---|---|---|---|
| AP1 | IF manual para LIMIT | `LIMIT()` | 3× mais eficiente — instrução única de CPU |
| AP2 | `prevSinal` manual para borda | `R_TRIG`/`F_TRIG` | Não perde bordas em varreduras rápidas |
| AP3 | FOR loop para copiar array | `MOVE_BLK` | 10-20× mais rápido |
| AP4 | FOR loop para zerar array | `FILL_BLK` | 10-15× mais rápido |
| AP5 | Timer/Counter/Trig em `VAR_TEMP` | Em `VAR` ou `VAR_STAT` | VAR_TEMP reseta TODO ciclo ~10ms |
| AP6 | `str1 + str2` para concatenar | `CONCAT()` | Operador `+` não suportado em SCL |
| AP7 | `IF valor = 25.0` (float) | `ABS(a-b) < tolerância` | IEEE 754 — pode NUNCA ser TRUE |
| AP8 | Parâmetros posicionais | Parâmetros nomeados `:=` `=>` | Obrigatório em SCL — erro de compilação |
| AP9 | `avg := soma / count` (int÷int) | `TO_REAL(soma) / TO_REAL(count)` | Divisão inteira trunca resultado |
| AP10 | `ELSEIF` | `ELSIF` | Erro de sintaxe SCL |
| AP11 | Output FB com `:=` externamente | Leitura somente via interface | Output de FB é read-only externamente |
| AP12 | IF-ELSIF longo para state machine | `CASE OF` com `ELSE` | Mais legível e O(1) vs O(n) |
| AP13 | `CASE OF` sem `ELSE` | Sempre incluir `ELSE: estado := 99` | Estado desconhecido causa comportamento imprevisível |
| AP14 | IF manual para MIN/MAX | `MIN()`/`MAX()` | Nativo até IN32, otimizado |
| AP15 | SQRT sem validar entrada | `IF val >= 0.0 THEN` | Crash em runtime — para o CLP! |
| AP16 | Divisão sem validar denominador | `IF denom <> 0 THEN` | Divisão por zero — crash! |
| AP17 | Comparar posição de eixo com `=` | Janela `±tolerância` | IEEE 754 + vibração mecânica |
| AP18 | Pulso de contador sem trava | FB com confirmação de ciclo | Varredura rápida gera duplo pulso — pula válvula |
| AP19 | ANY pointer no TIA Portal | `VARIANT` e `ARRAY[*]` | ANY não suportado em blocos otimizados |
| AP20 | Escalonamento manual por fórmula | `NORM_X` + `SCALE_X` | Nativo otimizado — sem erro de cálculo |
| AP21 | GET/PUT em DBs otimizados | DB não-otimizado para comunicação | DBs otimizados incompatíveis com GET/PUT |
| AP22 | Polling GET/PUT a cada ciclo OB1 | OB35 (100ms) ou similar | Sobrecarrega stack de comunicação |

---

## 9. TIPOS DE DADOS — REFERÊNCIA COMPLETA

> 💡 **Para times não técnicos:** Escolher o tipo errado desperdiça memória ou causa
> overflow (número maior do que o tipo suporta). Esta seção guia a escolha correta.

### Guia de Seleção Rápida
```
Preciso armazenar...
├─ Sim/Não, TRUE/FALSE                      → Bool
├─ Número inteiro -32.768 a +32.767         → Int  ← padrão
├─ Número inteiro maior                      → DInt
├─ Número sempre positivo pequeno            → USInt (0-255) ou UInt (0-65.535)
├─ Número sempre positivo grande             → UDInt (0-4,3 bilhões)
├─ Número decimal, medida física             → Real  ← padrão para analógicos
├─ Número decimal alta precisão (servo, CNC) → LReal (15 casas decimais)
├─ Duração de tempo, delay                   → Time
├─ Texto, mensagem                           → String[N] ← sempre com tamanho!
├─ Texto Unicode                             → WString
├─ Coleção de valores do mesmo tipo          → Array[0..N] of <tipo>
└─ Grupo de campos relacionados              → Struct / UDT
```

### Inteiros — Faixas Completas
| Tipo | Bits | Faixa | Uso típico |
|---|---|---|---|
| SInt | 8 | -128..127 | Índices muito pequenos |
| **Int** | **16** | **-32.768..32.767** | **← padrão para contadores** |
| DInt | 32 | ±2,1 bilhões | Contadores grandes, timestamps |
| LInt | 64 | ±9,2×10¹⁸ | Raramente necessário |
| USInt | 8 | 0..255 | Bytes sem sinal |
| UInt | 16 | 0..65.535 | Words sem sinal |
| UDInt | 32 | 0..4,3 bilhões | Contadores industriais sem sinal |

### Float
| Tipo | Bits | Casas decimais | Uso |
|---|---|---|---|
| **Real** | **32** | **6-7** | **← padrão para medidas** |
| LReal | 64 | 15-16 | Servo de alta precisão, CNC |

⚠️ **Regra de ouro: NUNCA comparar float com `=` — sempre usar tolerância!**

### Time — Literais
```scl
T#5s      // 5 segundos
T#500ms   // 500 milissegundos
T#2m30s   // 2 minutos e 30 segundos
T#100ms   // dwell típico de stop motion
T#700ms   // timeout típico de câmera (ex: SIVE)
T#10ms    // filtro de debounce
```

### String
```scl
// POR QUÊ tamanho explícito: sem tamanho usa 254 bytes — desperdício de memória
nome    : String[20] := 'Motor1';  // ✅ máximo 20 chars
codigo  : String[8];               // ✅ código de 8 chars
// Concatenar: CONCAT(), não +!
```

### Constantes
```scl
// POR QUÊ constantes: sem "números mágicos" espalhados — mudança centralizada
VAR CONSTANT
  NUM_VALVULAS  : Int  := 24;
  FE_BANDA      : Real := 0.01;    // Following error máximo (10µm)
  TOL_POSICAO   : Real := 0.005;   // Tolerância de posição (±5µm)
  TIMEOUT_SIVE  : Time := T#700ms; // Timeout resposta câmera SIVE
  TURNO1_INICIO : Int  := 6;       // Turno 1: início às 06h
  TURNO1_FIM    : Int  := 15;      // Turno 1: fim às 15h (exclusive)
END_VAR
```

### Enumerações (S7-1500)
```scl
TYPE "TipoEstado"
  (IDLE := 0, INICIANDO := 1, EXECUTANDO := 2, FINALIZANDO := 3, ERRO := 99);
END_TYPE
VAR estado : "TipoEstado"; END_VAR
estado := "TipoEstado".IDLE;
```

---

## 10. SINAIS ANALÓGICOS — ESCALONAMENTO COMPLETO

> 💡 **Para times não técnicos:** Módulos analógicos convertem sinais físicos (pressão,
> temperatura) em números que o CLP entende. Esta seção mostra como converter esse número
> de volta para a unidade real de engenharia — e como detectar falhas de sensor.

### Tabela de Raw/EU por Tipo de Sinal — Correção Crítica
| Sinal | Raw Mín | Raw Máx | Fio Partido (raw <) | Observação |
|---|---|---|---|---|
| 0–20 mA | 0 | 27.648 | N/A | Faixa unipolar completa |
| **4–20 mA** | **6.912** | **27.648** | **1.380 (~1mA)** | **6912 = 25% de 27648** |
| 0–10 V | 0 | 27.648 | N/A | — |
| 1–5 V | 5.530 | 27.648 | 1.380 | — |
| -10..+10 V (bipolar) | -27.648 | +27.648 | N/A | Zero = 0 raw |
| PT100 / PT1000 | varia | varia | — | Retorna centésimos de °C |
| Faixa estendida (+5%) | 27.649 | 32.511 | — | Acima do máximo configurado |
| Overflow | 32.512 | 32.767 | — | Curto-circuito ou defeito |
| Underflow | -32.512 | -32.511 | — | Abaixo do mínimo absoluto |

> ⚠️ **Regra de ouro:** raw < 1380 em circuito 4-20mA = fio partido.
> **Não escale** — declare falha de instrumentação imediatamente.

### Fórmula de Escalonamento Linear
```
EU = ((raw - raw_min) / (raw_max - raw_min)) × (eu_max - eu_min) + eu_min
```

### FC_Escala — S7-300/400 (STEP 7 Clássico)
```scl
FUNCTION FC_Escala : REAL
TITLE = 'Escalonamento Analógico Linear'
VERSION : '1.0'
AUTHOR  : ReginaldoLobo

VAR_INPUT
  raw    : INT;    // valor bruto lido do módulo AI
  raw_lo : REAL;   // contagem mínima (ex: 6912 para 4-20mA)
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

  // POR QUÊ verificar span: configuração inválida causa divisão por zero
  IF raw_span = 0.0 THEN
    FC_Escala := eu_lo;
    RETURN;
  END_IF;

  FC_Escala := ((raw_real - raw_lo) / raw_span) * (eu_hi - eu_lo) + eu_lo;

  // POR QUÊ LIMIT: protege contra ruído ou saturação do sensor
  IF FC_Escala > eu_hi THEN FC_Escala := eu_hi; END_IF;
  IF FC_Escala < eu_lo THEN FC_Escala := eu_lo; END_IF;
END_FUNCTION
```

### FC_Escala — Exemplos de Uso
```scl
// Sensor de pressão 4-20mA → 0.0 a 10.0 bar
pressao_bar := FC_Escala(raw:=IW4, raw_lo:=6912.0, raw_hi:=27648.0,
                          eu_lo:=0.0, eu_hi:=10.0);

// PT100 0-150°C — SM331 retorna em centésimos de grau
temperatura := FC_Escala(raw:=IW8, raw_lo:=0.0, raw_hi:=15000.0,
                          eu_lo:=0.0, eu_hi:=150.0);

// Nível 4-20mA → 0.0 a 5.0 metros
nivel_m := FC_Escala(raw:=MW200, raw_lo:=6912.0, raw_hi:=27648.0,
                      eu_lo:=0.0, eu_hi:=5.0);
```

### TIA Portal — NORM_X + SCALE_X (método nativo preferido)
```scl
// POR QUÊ NORM_X+SCALE_X: funções nativas otimizadas — sem erro de cálculo manual

// Passo 1: normaliza raw para 0.0..1.0
// POR QUÊ TO_REAL: NORM_X espera REAL, módulo entrega INT
normalizado := NORM_X(MIN := 6912,    // 4mA (não 5530! — ver tabela acima)
                       VALUE := rawADC,
                       MAX := 27648);  // 20mA

// Passo 2: escala para EU
pressaoBar  := SCALE_X(MIN := 0.0, VALUE := normalizado, MAX := 16.0);  // 0-16 bar
tempCelsius := SCALE_X(MIN := -10.0, VALUE := normalizado, MAX := 150.0); // -10..150°C
```

### Detecção de Fio Partido e Overflow
```scl
// POR QUÊ validar ANTES de escalar: dado inválido não deve chegar ao controle!

// Fio partido — sinal abaixo do mínimo absoluto de 4mA
IF rawADC < 1380 THEN        // ~1mA — limiar padrão para 4-20mA
  dados.em_falha  := TRUE;
  dados.cod_falha := 10;     // 10 = fio partido / sensor desconectado
  RETURN;
END_IF;

// Overflow — sensor saturado ou curto-circuito
IF rawADC > 32511 THEN
  dados.em_falha  := TRUE;
  dados.cod_falha := 11;     // 11 = overflow analógico
  RETURN;
END_IF;

// Dado válido — processa normalmente
pressao := FC_Escala(raw := rawADC, ...);
```

### FC_EscalaInversa — Saída Analógica (AO)
```scl
// POR QUÊ: converte EU de volta para raw do módulo AO
// Usado para escrever setpoints de PID em módulos analógicos

FUNCTION FC_EscalaInversa : INT
VAR_INPUT
  eu     : REAL;    // valor em EU a converter
  eu_lo  : REAL;    // EU mínima
  eu_hi  : REAL;    // EU máxima
  raw_lo : REAL;    // raw mínimo do módulo AO (ex: 6912 para 4-20mA)
  raw_hi : REAL;    // raw máximo (ex: 27648 para 20mA)
END_VAR
VAR_TEMP eu_span : REAL; raw_real : REAL; END_VAR
BEGIN
  eu_span := eu_hi - eu_lo;
  IF eu_span = 0.0 THEN FC_EscalaInversa := REAL_TO_INT(raw_lo); RETURN; END_IF;
  raw_real := ((eu - eu_lo) / eu_span) * (raw_hi - raw_lo) + raw_lo;
  raw_real := LIMIT(MN := raw_lo, IN := raw_real, MX := raw_hi);
  FC_EscalaInversa := REAL_TO_INT(raw_real);
END_FUNCTION

// Uso: saída PID 0..100% → válvula 4-20mA (6912..27648):
QW4 := FC_EscalaInversa(eu:=saida_pid, eu_lo:=0.0, eu_hi:=100.0,
                          raw_lo:=6912.0, raw_hi:=27648.0);
```

### FB_FiltroMedia — Média Móvel
```scl
FUNCTION_BLOCK FB_FiltroMedia
VAR_INPUT
  entrada : REAL;       // sinal de entrada (EU escalado)
  N       : INT := 8;   // janela de amostras (1..32)
  // POR QUÊ filtro: elimina ruído de alta frequência.
  // N maior = menos ruído, mais atraso. N=8 com OB35(100ms) = filtro de 800ms
END_VAR
VAR_OUTPUT
  saida   : REAL;
END_VAR
VAR
  buffer  : ARRAY[0..31] OF REAL; // buffer circular
  indice  : INT := 0;
END_VAR
VAR_TEMP soma : REAL; i : INT; n_efet : INT; END_VAR
BEGIN
  n_efet         := LIMIT(MN := 1, IN := N, MX := 32);
  buffer[indice] := entrada;
  indice         := (indice + 1) MOD n_efet;
  soma           := 0.0;
  FOR i := 0 TO n_efet - 1 DO soma := soma + buffer[i]; END_FOR;
  saida := soma / INT_TO_REAL(n_efet);
END_FUNCTION_BLOCK
```

### FB_FiltroPT1 — Passa-Baixa de Primeira Ordem
```scl
FUNCTION_BLOCK FB_FiltroPT1
// POR QUÊ PT1: resposta exponencial ao degrau — mais eficiente que média móvel
// alpha = dt / (tau + dt)
//   dt  = período de amostragem (ex: 0.1 para OB35 de 100ms)
//   tau = constante de tempo desejada (ex: 1.0 para filtro de 1s)
//   Exemplo: tau=1s, dt=100ms → alpha = 0.1 / (1.0 + 0.1) ≈ 0.091
VAR_INPUT
  entrada : REAL;
  alpha   : REAL := 0.1;  // fator de suavização 0.0..1.0
END_VAR
VAR_OUTPUT saida : REAL; END_VAR
VAR
  saida_ant  : REAL;
  inicializa : BOOL := TRUE;
END_VAR
BEGIN
  IF inicializa THEN
    saida_ant  := entrada;  // POR QUÊ: evita spike no arranque
    inicializa := FALSE;
  END_IF;
  // y[n] = alpha * x[n] + (1 - alpha) * y[n-1]
  saida     := alpha * entrada + (1.0 - alpha) * saida_ant;
  saida_ant := saida;
END_FUNCTION_BLOCK
```

### Tabela de Módulos Analógicos por Plataforma
| Plataforma | Módulo | Canais | Resolução | Tipos de sinal |
|---|---|---|---|---|
| S7-300 | SM 331 AI 8×12bit | 8 | 12 bits | U, I, RTD, TC |
| S7-300 | SM 332 AO 4×12bit | 4 | 12 bits | 0/4-20mA, 0/1-10V |
| S7-400 | SM 431 AI 16×16bit | 16 | 16 bits | Alta densidade |
| S7-1200 | SM 1231 AI 4/8ch | 4-8 | 12/13 bits | U, I |
| S7-1200 | SM 1231 RTD 4ch | 4 | 16 bits | PT100/PT1000/Ni |
| S7-1500 | AI 8×U/I/RTD/TC | 8 | 16 bits | Auto-tipo por canal |
| ET200SP | AI 4×U/I 2-wire | 4 | 13 bits | Módulo compacto |

---

## 11. COMUNICAÇÃO ENTRE CLPs — COMPLETO

> 💡 **Para times não técnicos:** CLPs diferentes precisam trocar dados entre si.
> Esta seção explica quando usar cada método e como implementar corretamente.

### Tipos de Conexão S7
| Tipo | Plataforma | Característica |
|---|---|---|
| **SFB14/15 GET/PUT** | S7-300/400 (STEP 7) | Configuração estática no NetPro |
| **GET/PUT TIA** | S7-1200/1500 | Requer habilitação explícita na CPU |
| **OUC (TCON/TSEND/TRECV)** | S7-1200/1500 | ISO-on-TCP, TCP, UDP — recomendado |
| **Modbus TCP** | S7-1200/1500 | MB_CLIENT/MB_SERVER |
| **PROFIBUS DP** | S7-300/400/1500 | SFC14/SFC15 para dados > 4 bytes |

### SFB14 GET — Leitura Remota (S7-300/400)
```scl
// POR QUÊ uma instância DB por conexão: SFB14/15 são stateful — compartilhar
// instâncias causa corrupção de dados!

DATA_BLOCK DB_InstGET
  FB SFB14   // instância dedicada para esta conexão
END_DATA_BLOCK

CALL SFB14, DB_InstGET (
  REQ    := req_get,           // borda de subida dispara requisição
  ID     := W#16#0001,         // ID da conexão S7 (configurada no NetPro)
  NDR    => novo_dado_pronto,  // TRUE quando dado chegou com sucesso
  ERROR  => erro_get,          // TRUE em caso de erro
  STATUS => status_get,        // código de diagnóstico — verificar sempre!
  ADDR_1 := P#DB10.DBX 0.0 BYTE 20,  // fonte no parceiro remoto
  RD_1   := P#DB11.DBX 0.0 BYTE 20); // destino local

// POR QUÊ verificar NDR: buffer pode conter dados do ciclo anterior
IF novo_dado_pronto THEN
  processarDados(); // dados em DB11 são válidos
ELSIF erro_get THEN
  registrarFalha(status_get); // consultar STATUS para diagnóstico
END_IF;
```

### SFB15 PUT — Escrita Remota (S7-300/400)
```scl
DATA_BLOCK DB_InstPUT
  FB SFB15
END_DATA_BLOCK

CALL SFB15, DB_InstPUT (
  REQ    := req_put,
  ID     := W#16#0001,
  DONE   => put_concluido,
  ERROR  => erro_put,
  STATUS => status_put,
  ADDR_1 := P#DB20.DBX 0.0 BYTE 10,  // destino no parceiro remoto
  SD_1   := P#DB21.DBX 0.0 BYTE 10); // fonte local (dados a enviar)
```

### Tabela de Códigos STATUS — GET/PUT
| STATUS | Significado |
|---|---|
| `W#16#0000` | OK — operação concluída sem erro |
| `W#16#7002` | Em andamento — aguardar resposta do parceiro |
| `W#16#7003` | Aguardando dados do parceiro (GET) |
| `W#16#80C3` | Recursos insuficientes — muitos jobs simultâneos |
| `W#16#80B3` | Parceiro remoto não acessível / timeout |
| `W#16#80C4` | Comunicação em andamento — aguardar DONE |
| `W#16#8085` | Erro de parametrização — verificar ADDR e RD |

### GET/PUT TIA Portal — S7-1200/1500
```scl
// ⚠️ CRÍTICO: PUT/GET está DESABILITADO por padrão no S7-1200/1500!
// Para habilitar: TIA Portal → CPU → Properties → Protection →
// "Habilitar acesso PUT/GET de parceiro remoto" → Ativar checkbox

// ⚠️ DBs otimizados NÃO funcionam com PUT/GET!
// Desabilitar otimização no DB usado para comunicação:
// DB Properties → Optimized block access → OFF

GET_1(REQ    := req_get,
      ID     := 16#0001,
      NDR    => ndr_flag,
      ERROR  => erro_flag,
      STATUS => status_word,
      ADDR_1 := P#DB10.DBX0.0 BYTE 20,
      RD_1   := "DB_Local".dados_recebidos);
```

### Padrão de Polling — Produtor/Consumidor
```scl
// POR QUÊ polling no OB35 (não OB1): polling a cada ciclo OB1 (~10ms)
// sobrecarrega o stack de comunicação — use OB35 com período adequado (100ms)

// Em OB35 (100ms):
req_get := NOT req_get;  // alterna a cada chamada → polling a cada 200ms

CALL SFB14, DB_InstGET (
  REQ    := req_get,
  ID     := W#16#0001,
  NDR    => ndr_flag,
  ERROR  => erro_flag,
  STATUS => status_get,
  ADDR_1 := P#DB10.DBX 0.0 BYTE 50,
  RD_1   := P#DB_Local.DBX 0.0 BYTE 50);

// POR QUÊ contador de falhas: um único erro pode ser transitório — alarmar após N falhas
IF erro_flag THEN
  contagem_falha_com := contagem_falha_com + 1;
  IF contagem_falha_com >= 5 THEN
    alarme_com_perdida := TRUE;
  END_IF;
ELSE
  contagem_falha_com := 0;
  alarme_com_perdida := FALSE;
END_IF;
```

### OUC — Open User Communication (TIA Portal — Recomendado)
```scl
// POR QUÊ OUC em vez de GET/PUT: não exige configuração de conexão PUT/GET,
// mais seguro, mais flexível e compatível com DBs otimizados.

// TCON: estabelece a conexão TCP (chame uma vez — mantém até TDISCON)
TCON_1(REQ     := conn_req,
        ID      := 1,
        CONNECT => "DB_ConnParam_1",  // TIA Portal cria automaticamente
        DONE    => conn_pronta,
        BUSY    => conn_busy,
        ERROR   => conn_erro,
        STATUS  => conn_status);

IF conn_pronta AND NOT conn_busy THEN
  // TSEND: envia dados (não bloqueante — verifica DONE no próximo ciclo)
  TSEND_1(REQ  := send_req,
           ID   := 1,
           LEN  := 100,
           DATA => "DB_SendBuffer".dados,
           DONE => send_ok,
           BUSY => send_busy,
           ERROR => send_erro);

  // TRECV: recebe dados (habilitação contínua)
  TRECV_1(EN_R := TRUE,
           ID   := 1,
           LEN  := 100,
           DATA => "DB_RecvBuffer".dados,
           NDR  => recv_ok,
           BUSY => recv_busy,
           ERROR => recv_erro);
END_IF;
```

### Modbus TCP — MB_CLIENT e MB_SERVER
```scl
// POR QUÊ Modbus TCP: comunicação com equipamentos não-Siemens
// (inversores, medidores, câmeras, sistemas legados)

// Funções Modbus:
// FC01 = Read Coils (bits saída) | FC02 = Read Discrete Inputs (bits entrada)
// FC03 = Read Holding Registers  | FC04 = Read Input Registers
// FC05 = Write Single Coil       | FC06 = Write Single Register
// FC15 = Write Multiple Coils    | FC16 = Write Multiple Registers

// MB_CLIENT — CLP como mestre Modbus
MB_CLIENT_1(REQ       := poll_req,
             DISCONNECT := FALSE,       // mantém conexão persistente
             MB_ADDR   := 1,            // endereço do slave Modbus
             MODE      := 0,            // 0=leitura
             DATA_ADDR := 40001,        // registrador Modbus (40001 = HR #1)
             DATA_LEN  := 10,           // quantidade de registradores
             DATA_PTR  => "DB_Modbus".hr_data,
             DONE      => mb_done,
             BUSY      => mb_busy,
             ERROR     => mb_erro,
             STATUS    => mb_status);

// MB_SERVER — CLP como escravo Modbus
MB_SERVER_1(DISCONNECT := FALSE,
             MB_HOLD_REG => "DB_HoldingRegs",
             CONNECT    => "DB_ConnParam_MB",
             NDR        => novo_dado_recebido,
             DR         => dado_enviado,
             ERROR      => mb_srv_erro,
             STATUS     => mb_srv_status);
```

### PROFIBUS DP — SFC14 e SFC15
```scl
// POR QUÊ SFC14/15: leitura/escrita consistente de slave DP quando
// telegrama > 4 bytes (garante que todos os bytes são do mesmo ciclo)
CALL SFC14 (
  LADDR   := W#16#0100,           // endereço lógico do slave DP (do HW Config)
  RET_VAL => sfcret,              // WORD — 0 = OK
  RECORD  := P#DB10.DBX 0.0 BYTE 20);

CALL SFC15 (
  LADDR   := W#16#0100,
  RECORD  := P#DB11.DBX 0.0 BYTE 20,
  RET_VAL => sfcret);
```

### Boas Práticas de Comunicação
1. **Nunca usar dado recebido sem verificar NDR/DONE** — buffer pode conter lixo do ciclo anterior
2. **PUT/GET desabilitado por padrão no S7-1200/1500** — habilitar conscientemente e documentar a decisão
3. **Uma instância DB por conexão** — SFB14/SFB15 são stateful; compartilhar corrompe dados
4. **Usar OUC em vez de GET/PUT para novos projetos** — mais seguro, compatível com DBs otimizados
5. **Monitorar STATUS continuamente** — implementar contador de falhas e alarme
6. **Evitar polling rápido** — GET/PUT a cada ciclo OB1 sobrecarrega o stack; usar OB35 (100ms)
7. **DBs otimizados incompatíveis com PUT/GET** — desabilitar otimização no DB de comunicação

---

## 12. PID — CONTROLE DE PROCESSO

> 💡 **Para times não técnicos:** PID mantém uma variável (temperatura, pressão, nível)
> em um valor desejado (setpoint). P corrige o erro atual, I elimina o erro acumulado,
> D antecipa variações futuras.

### FB41 CONT_C — S7-300/400
```scl
// Parâmetros principais do FB41:
// COM_RST → FALSE em operação normal; TRUE para reset completo
// MAN_ON  → FALSE = automático; TRUE = manual (operador controla LMN)
// P_SEL   → TRUE = habilita ação Proporcional
// I_SEL   → TRUE = habilita ação Integral
// D_SEL   → TRUE = habilita ação Derivativa
// GAIN    → ganho proporcional (Kp)
// TI      → tempo integral em segundos (maior = integrador mais lento)
// TD      → tempo derivativo em segundos
// PV_IN   → valor do processo medido (REAL, já escalado para EU)
// SP_INT  → setpoint interno (REAL)
// LMN     → saída de controle (REAL, 0.0 a 100.0 = 0 a 100%)
// LMN_HLM → limite máximo da saída (ex: 100.0)
// LMN_LLM → limite mínimo da saída (ex: 0.0)

// POR QUÊ bumpless transfer: ao trocar manual→automático, o PID inicializa
// o integrador com o valor manual atual — evita salto brusco na saída
```

### PID_Compact — TIA Portal (com auto-tuning)
```scl
// POR QUÊ PID_Compact: versão moderna com auto-sintonia automática.
// O CLP determina P, I, D automaticamente — sem cálculo manual.

// Modos de operação:
// 0 = Inactive    — PID desabilitado
// 1 = Pretuning   — sintonia grosseira (oscilação controlada)
// 2 = FinetuningTuning — sintonia fina (resposta ao degrau)
// 3 = Automatic   — controle normal em malha fechada
// 4 = Manual      — operador controla a saída diretamente

// Recursos incluídos:
// Anti-windup: limitação automática do integrador quando saída saturada
// Bumpless transfer: troca suave manual↔automático sem salto na saída
// PID_3Step: para válvulas motorizadas (sem realimentação analógica)
// PID_Temp: otimizado para controle de temperatura
```

### PID em Cascata e Feedforward
```scl
// POR QUÊ cascata: dois laços aninhados — mestre controla escravo
// Ex: temperatura (mestre) ajusta vazão de refrigeração (escravo)
pidEscravo_SP := pidMestre_LMN; // Saída mestre → setpoint escravo

// POR QUÊ feedforward: compensação antecipada de perturbações conhecidas
// Ex: compensar variação de vazão antes que afete a temperatura
lmn_feedforward := lmn_pid + ganho_ff * perturbacao;
```

### Sintonia — Ziegler-Nichols (referência)
```
// Método da oscilação para FB41 / PID_Compact manual:
// 1. Desabilitar I e D (I_SEL=FALSE, D_SEL=FALSE)
// 2. Aumentar GAIN até obter oscilação sustentada (Ku = ganho crítico)
// 3. Medir período de oscilação Tu
// 4. Calcular parâmetros:
//    PID: Kp = 0.6×Ku, Ti = Tu/2, Td = Tu/8
//    PI:  Kp = 0.45×Ku, Ti = Tu/1.2
//    P:   Kp = 0.5×Ku
```

---

## 13. GRAPH — SEQUENCIADORES SFC

> 💡 **Para times não técnicos:** GRAPH é uma linguagem visual para programar sequências
> de processo — como uma receita de produção onde cada "passo" só avança quando as
> condições são atendidas.

### Tipos de Ação por Passo
| Qualificador | Nome | Comportamento |
|---|---|---|
| **N** | Non-stored | Ativa enquanto passo ativo; desativa ao sair |
| **S** | Set | Ativa na entrada — permanece até ação R explícita |
| **R** | Reset | Desativa saída previamente setada com S |
| **D** | Time-delayed | Ativa após atraso (como TON) |
| **L** | Time-limited | Ativa na entrada; desativa após tempo limite (como TP) |
| **P** | Pulse | Ativo apenas no primeiro scan do passo |
| **C** | Condition | Ativo somente enquanto condição booleana adicional for TRUE |

### Variáveis Automáticas por Passo
| Variável | Tipo | Descrição |
|---|---|---|
| `Sx.X` | BOOL | TRUE quando o passo Sx está ativo |
| `Sx.T` | TIME | Tempo decorrido desde que o passo ficou ativo |
| `Sx.U` | DINT | Número de vezes que o passo foi ativado |

```scl
// POR QUÊ Sx.T: detectar passo lento (timeout) — gerar alerta de tendência
IF FB_Envase.S3.X AND FB_Envase.S3.T > T#30S THEN
  alarme_timeout_s3 := TRUE; // Passo 3 ativo por mais de 30s
END_IF;

// POR QUÊ Sx.U: contar ciclos para manutenção preventiva
IF FB_Envase.S1.U > 500 THEN
  solicitar_manutencao := TRUE; // Mais de 500 ciclos → preventiva
END_IF;
```

### Interface do FB GRAPH
| Parâmetro | Direção | Função |
|---|---|---|
| `INIT_SQ` | IN | Borda de subida: força retorno ao passo inicial |
| `ACK_EF` | IN | Borda de subida: confirma erro de supervisão S2 |
| `S_PREV` | IN | Borda de subida: retrocede ao passo anterior (manual) |
| `S_NEXT` | IN | Borda de subida: avança ao próximo passo (manual/bypass) |
| `OFF_SQ` | IN | TRUE: desativa todos os passos (estado neutro) |
| `SW_AUTO` | IN | TRUE: modo automático (transições normais) |
| `SW_MAN` | IN | TRUE: modo manual (S_PREV/S_NEXT válidos) |
| `SW_TAP` | IN | TRUE: modo tap (avança um passo por pulso em S_NEXT) |
| `SQ_STOPPED` | OUT | TRUE quando sequência está parada |
| `SQ_ACTIVE` | OUT | TRUE quando algum passo está ativo |
| `ERR_FLT` | OUT | TRUE quando há erro de supervisão ativo |

```scl
// Chamada típica do FB GRAPH:
FB_Envase.DB1(
  INIT_SQ := pulso_init,         // botão REINICIAR
  ACK_EF  := pulso_ack_erro,     // botão CONFIRMAR ERRO
  S_NEXT  := pulso_step_fwd,     // botão avançar passo (manual)
  S_PREV  := pulso_step_bwd,     // botão recuar passo (manual)
  OFF_SQ  := parada_emergencia,  // botão STOP
  SW_AUTO := modo_auto,
  SW_MAN  := modo_manual);
```

### Supervisão S1 e S2
```
// S1 — Interlock: bloqueia AVANÇO de transição
//   → Use para condições de segurança que podem resolver-se sozinhas
//   → Ex: porta aberta, pressão fora da faixa → passo fica em HOLD

// S2 — Supervision: monitora TEMPO no passo
//   → Use para detectar timeout de resposta de sensor ou atuador
//   → Quando condição S2 for FALSE → ERR_FLT=TRUE → passo de erro
```

### Tratamento de Erro S2
```scl
// Fluxo completo de tratamento de falha S2:
// 1. S2 dispara → ERR_FLT=TRUE → sequência vai para passo de ERRO
// 2. No passo de ERRO: desligar saídas críticas, acionar alarme
// 3. Operador investiga e pressiona botão ACK
// 4. ACK_EF → borda de subida → GRAPH libera

IF FB_Envase.ERR_FLT THEN
  hmi_mensagem := 'FALHA SUPERVISÃO — verifique e confirme';
  hmi_btn_ack  := TRUE;
END_IF;

IF hmi_operador_confirmou THEN
  FB_Envase.ACK_EF := TRUE; // pulso de 1 ciclo
END_IF;
```

### Ramificações
```
// Divergência ALTERNATIVA (XOR — apenas UMA branch):
//   T4 ou T5 — primeira verdadeira vence. S4 OU S5, nunca ambos.

// Divergência SIMULTÂNEA (AND — TODAS em paralelo):
//   Linha dupla (═══) = paralelo. Todas as branches devem concluir
//   antes de avançar para o próximo passo após a convergência.
```

### Boas Práticas GRAPH
1. **Nomear cada passo e transição** — nomes descritivos facilitam diagnóstico
2. **S2 para timeouts de processo** (válvula não abriu, sensor não respondeu)
3. **S1 para condições de segurança** que podem resolver-se sozinhas
4. **Um GRAPH FB por sequência independente** — não misturar máquinas
5. **Reservar S0 para estado de espera** — facilita integração com receitas
6. **Monitorar Sx.T** para detectar passos lentos antes de virarem erros

---

## 14. PONTEIROS E ENDEREÇAMENTO INDIRETO

> 💡 **Para times não técnicos:** Ponteiros são "endereços que apontam para outros dados".
> No S7-300/400 (legacy), são necessários para processar arrays genéricos.
> No TIA Portal, use VARIANT e ARRAY[*] — mais seguro e mais simples.

### Tipos de Ponteiro no STEP 7 Clássico
| Tipo | Tamanho | Sintaxe | Uso |
|---|---|---|---|
| **Ponteiro de memória** | 32 bits (DWORD) | `P#byte.bit` | Offset dentro de área já aberta |
| **Ponteiro de área** | 32 bits | `P#I 0.0`, `P#M 10.0` | Inclui a área de memória |
| **ANY pointer** | 80 bits (10 bytes) | estrutura manual | Descreve bloco tipado completo |

### Ponteiro de Memória — P#byte.bit
```pascal
// POR QUÊ P#: permite varrer estruturas de dados em STL de forma genérica
// O ponteiro aponta para um offset dentro da área corrente (DB aberto, L etc.)

// Em STL: carrega ponteiro e usa com AR1/AR2
L  P#10.0      // carrega ponteiro para offset byte 10, bit 0
T  AR1         // armazena no Registrador de Endereço 1

// Acesso indireto via AR1:
L  DBW[AR1, P#0.0]   // lê word no offset de AR1 (byte 10)
L  DBW[AR1, P#2.0]   // lê word 2 bytes depois (byte 12)
T  DBW[AR1, P#4.0]   // escreve word 4 bytes depois (byte 14)

// Incrementa ponteiro para avançar na estrutura:
L  AR1
L  P#4.0       // offset de 4 bytes (tamanho de DWORD)
+D             // soma (DINT add)
T  AR1         // ponteiro avançado 4 bytes
```

### ANY Pointer — Estrutura de 10 Bytes
| Bytes | Conteúdo | Valor típico |
|---|---|---|
| 0 | Sintaxe (sempre 16#10) | `B#16#10` |
| 1 | Tipo de dado (código IEC) | ver tabela |
| 2–3 | Número de repetições (WORD) | ex: `W#16#0005` (5 elementos) |
| 4–5 | Número do DB (WORD; 0 = M/I/Q) | ex: `W#16#000A` (DB10) |
| 6–9 | Ponteiro de área (DWORD) | ex: `P#DBX 0.0` |

### Tabela de Códigos de Tipo — ANY Pointer (Byte 1)
| Código | Tipo | | Código | Tipo |
|---|---|-|---|---|
| 16#01 | BOOL | | 16#07 | DWORD |
| 16#02 | BYTE | | 16#08 | INT |
| 16#03 | CHAR | | 16#09 | DINT |
| 16#04 | WORD | | 16#0A | REAL |
| 16#06 | DWORD | | 16#0E | DATE_AND_TIME |
| | | | 16#13 | STRING |

```pascal
// ANY em SCL para chamada de SFC (compilador monta os 10 bytes automaticamente)
FC_CopiaBloco(
  fonte   := DB10.dados_brutos,  // SCL converte para ANY automaticamente
  destino := DB11.dados_copia);
```

### Equivalentes no TIA Portal — Use Sempre em Novos Projetos
| Funcionalidade | STEP 7 Clássico | TIA Portal (S7-1200/1500) |
|---|---|---|
| Ponteiro genérico | ANY (10 bytes) | VARIANT (verificado em compilação) |
| Arrays de tamanho variável | ANY + AR1/AR2 | `ARRAY[*]` com `LOWER_BOUND`/`UPPER_BOUND` |
| Cópia de bloco genérica | SFC20 BLKMOV + ANY | `MOVE_BLK_VARIANT` |
| Tipo do dado em runtime | não disponível | `TypeOf(#variante)` no CASE |
| Acesso a bit dentro de WORD | Shift + AND em STL | Slice access `.%X5` |

```scl
// TIA Portal — ARRAY[*] substitui o padrão ANY + loop STL:
FUNCTION "FC_EscalaArray" : VOID
VAR_IN_OUT
  fonte   : ARRAY[*] OF INT;   // qualquer tamanho de array INT
  destino : ARRAY[*] OF REAL;
  raw_lo  : REAL; raw_hi : REAL; eu_lo : REAL; eu_hi : REAL;
END_VAR
VAR_TEMP i : DINT; lower : DINT; upper : DINT; END_VAR
BEGIN
  lower := LOWER_BOUND(ARR := #fonte, DIM := 1);
  upper := UPPER_BOUND(ARR := #fonte, DIM := 1);
  FOR i := lower TO upper DO
    destino[i] := ((INT_TO_REAL(fonte[i]) - raw_lo) /
                   (raw_hi - raw_lo)) * (eu_hi - eu_lo) + eu_lo;
  END_FOR;
END_FUNCTION
// POR QUÊ ARRAY[*]: a mesma FC funciona com arrays de qualquer tamanho —
// sem precisar de ANY pointer ou código específico por tamanho
```

### Slice Access — TIA Portal (substitui construct AT)
```scl
// POR QUÊ Slice Access: acessa bytes, words ou bits dentro de variáveis maiores
// sem precisar de construct AT do STEP 7 clássico

palavra.%X5 := TRUE;    // bit 5 da palavra
palavra.%B1 := 16#FF;   // byte 1 da palavra (byte mais significativo)
dword.%W1   := 16#ABCD; // word 1 do dword
```

---

## 15. OBS E VARIÁVEIS DE SISTEMA

> 💡 **Para times não técnicos:** OBs são os "horários de trabalho" do CLP — cada um
> é chamado pelo sistema operacional em momentos específicos e com prioridades diferentes.

### Tabela de OBs e Prioridades
| OB | Tipo | Prioridade | Quando é chamado |
|---|---|---|---|
| **OB1** | **Ciclo principal** | **1 (mais baixa)** | **Repetidamente, sempre** |
| OB10..17 | Alarme de hora | 2 | Na hora/data configurada |
| OB20..23 | Atraso de tempo | 3..6 | Após delay configurado |
| OB30..38 | Alarme cíclico | 7..15 | A cada N ms (OB35 = 100ms padrão) |
| OB40..47 | Alarme de hardware | 16..23 | Evento de módulo I/O |
| OB80 | Erro de ciclo | 26 | Ciclo excedeu watchdog |
| OB82 | Erro de diagnóstico | 26 | Módulo reportou falha |
| OB86 | Erro de rack | 26 | Falha de comunicação |
| OB121 | Erro síncrono prog. | 28 | Acesso inválido a DB/FC |
| OB122 | Erro síncrono I/O | 28 | Acesso inválido a módulo |

### Variáveis do Sistema Operacional
```scl
// Disponíveis como VAR_TEMP em cada OB:
OB1_PREV_CYCLE    // Tempo do ciclo anterior em ms — monitorar performance
OB35_PHASE_OFFSET // Offset de fase do OB cíclico
OB40_POINT_ADDR   // Endereço do módulo que gerou interrupção de hardware
OB122_MDL_ADDR    // Endereço do módulo com erro de acesso I/O

// DTL — tipo moderno de data/hora (substituto de Date_And_Time no TIA Portal)
VAR timestamp : DTL; END_VAR
// timestamp.Year / .Month / .Day / .Hour / .Minute / .Second / .Nanosecond
```

---

## 16. SFCS DE SISTEMA — REFERÊNCIA

| SFC | Nome | Função | Uso típico |
|---|---|---|---|
| SFC0 | SET_CLK | Ajusta relógio da CPU | Sincronização de hora |
| SFC1 | READ_CLK | Lê data/hora atual | Timestamps de eventos |
| SFC14 | DPRD_DAT | Leitura PROFIBUS consistente | Módulos com dados > 4 bytes |
| SFC15 | DPWR_DAT | Escrita PROFIBUS consistente | idem |
| SFC20 | BLKMOV | Move bloco de dados | Cópia de área de memória |
| SFC21 | FILL | Preenche área com valor | Inicialização de buffers |
| SFC28 | SET_TINT | Configura alarme de hora | Ativar OB10 em hora específica |
| SFC29 | CAN_TINT | Cancela alarme de hora | — |
| SFC32 | SRT_DINT | Inicia alarme de atraso | Ativar OB20 após N ms |
| SFC33 | CAN_DINT | Cancela alarme de atraso | — |
| SFC36 | MSK_FLT | Mascara classe de erros | Supressão temporária |
| SFC37 | DMSK_FLT | Desmascara classe de erros | — |
| SFC46 | STP | Coloca CPU em STOP | Parada de emergência |
| SFC47 | WAIT | Aguarda N microssegundos | Sincronização fina |
| SFC51 | RDSYSST | Lê lista de estado do sistema | Diagnóstico avançado |
| SFC58 | WR_REC | Escreve registro de dados | Parametrização de módulos I/O |
| SFC59 | RD_REC | Lê registro de dados | Diagnóstico de módulo |
| SFC64 | TIME_TCK | Lê contador de tempo (ms) | Medição de tempo de execução |

---

## 17. JAVASCRIPT — WINCC UNIFIED

> 💡 **Para times não técnicos:** JavaScript é a linguagem das telas WinCC Unified.
> É executado no HMI (touch screen ou PC), não no CLP. Serve para criar animações,
> ler tags do CLP e atualizar a tela automaticamente em resposta ao processo.

### Regras Absolutas — Proibições WinCC
```javascript
// ✅ SEMPRE — sintaxe correta para WinCC Unified
const nome = 'valor';         // aspas SIMPLES obrigatórias
let contador = 0;             // let para variável mutável
const fixo = 42;              // const para constante imutável

// ❌ NUNCA — causam erros ou comportamento imprevisível
var x = 1;                    // var — escopo imprevisível
eval('codigo');               // proibido pela Siemens — risco de segurança
console.log('debug');         // NÃO EXISTE no WinCC Unified!
setTimeout(fn, 1000);         // não suportado — usar Task Scheduler no TIA
setInterval(fn, 1000);        // não suportado — usar Task Scheduler no TIA
"aspas duplas";               // não segue Style Guide Siemens

// Debug correto:
HMIRuntime.Trace('Mensagem');              // ✅ único método válido
HMIRuntime.Trace(`Valor: ${variavel}`);   // ✅ template string funciona
// Remover HMIRuntime.Trace antes de produção — impacta performance
```

### Leitura de Tags — SEMPRE usar TagSet para múltiplas tags
```javascript
// POR QUÊ TagSet: lê múltiplas tags em UMA ÚNICA requisição OPC.
// Sem TagSet, cada Tags().Read() é uma requisição separada — sobrecarrega
// a comunicação e torna a tela lenta.

async function lerDadosProcesso() {
  try {
    // ── Uma única requisição ao CLP
    const ts = HMIRuntime.Tags.CreateTagSet();
    ts.Add('DB455.Axes_Parados_OK');
    ts.Add('DB_SRMV.ValvulaAtual');
    ts.Add('DB_SRMV.FotoEmMovimento');
    ts.Add('DB_SRMV.FE_Eixo1');
    await ts.Read(); // Uma única comunicação

    // ── Extrai valores após leitura
    const axesOK  = ts.Item('DB455.Axes_Parados_OK').Value;
    const valvula = ts.Item('DB_SRMV.ValvulaAtual').Value;
    const fotoMov = ts.Item('DB_SRMV.FotoEmMovimento').Value;
    const fe1     = ts.Item('DB_SRMV.FE_Eixo1').Value;

    // ── Atualiza tela
    Screen.Items('led_AxesOK').BackColor  = axesOK ? '#00C853' : '#FF1744';
    Screen.Items('txt_Valvula').Text      = `Válvula: ${valvula}`;
    Screen.Items('Alert_FotoMov').Visible = fotoMov;
    Screen.Items('txt_FE1').Text          = `FE1: ${fe1.toFixed(4)} µm`;

  } catch (err) {
    // POR QUÊ try/catch: erros de comunicação são normais em redes industriais
    HMIRuntime.Trace(`[Processo] Erro leitura: ${err}`);
  }
}

// ❌ ERRADO — N requisições OPC separadas — sobrecarrega comunicação
// for (const tag of lista) { await Tags(tag).Read(); }
```

### Escrita de Tag
```javascript
async function escreverTag(tagName, valor) {
  try {
    await Tags(tagName).Write(valor);
  } catch (err) {
    HMIRuntime.Trace(`[Escrita] ${tagName}: ${err}`);
  }
}
```

### Paleta de Cores Padrão Industrial
```javascript
// POR QUÊ centralizar: mesma lógica de cor em todas as telas — consistência visual
const CORES = {
  OK      : '#00C853',  // Verde — operação normal
  NOK     : '#FF1744',  // Vermelho — falha, reprovado
  ALERTA  : '#FFB300',  // Âmbar — atenção, marginal, fio partido
  INFO    : '#00C8FF',  // Azul ciano — informação
  INATIVO : '#6272A4',  // Cinza azulado — desabilitado
  AGUARD  : '#4A5568',  // Cinza escuro — aguardando
};

Screen.Items('led_Status').BackColor = statusOK ? CORES.OK : CORES.NOK;
Screen.Items('led_Alerta').BackColor = marginal  ? CORES.ALERTA : CORES.OK;
```

### Template de Script de Tela — Padrão Completo
```javascript
// ============================================================
// Script: [NomeTela]_[NomeEvento]
// O QUÊ FAZ: [descreva em 1 linha]
// QUANDO EXECUTA: [evento — Load, Click, Change, etc.]
// Autor: REGINALDO LOBO
// WinCC: Unified V19
// Projeto: [nome do projeto]
// ============================================================

(async function() {
  'use strict'; // Modo estrito — detecta erros comuns de JS

  // ── Constantes de tags — nunca hardcode inline no código
  // POR QUÊ constantes: se o nome da tag mudar, altera só aqui
  const TAG_VALOR  = 'DB_xxx.Campo';
  const TAG_STATUS = 'DB_xxx.Status';

  try {
    const ts = HMIRuntime.Tags.CreateTagSet();
    ts.Add(TAG_VALOR);
    ts.Add(TAG_STATUS);
    await ts.Read();

    const valor  = ts.Item(TAG_VALOR).Value;
    const status = ts.Item(TAG_STATUS).Value;

    if (status === 1) {
      Screen.Items('led_Status').BackColor = '#00C853';
      Screen.Items('txt_Valor').Text       = `${valor.toFixed(2)} bar`;
    } else {
      Screen.Items('led_Status').BackColor = '#FF1744';
    }

  } catch (err) {
    HMIRuntime.Trace(`[${Screen.Name}] Erro: ${err}`);
  }
}()); // IIFE — executa imediatamente e isola o escopo
```

### Módulo Global — Funções Compartilhadas
```javascript
// GlobalModule_NomeModulo
// POR QUÊ módulo global: funções usadas em várias telas ficam aqui.
// Mudança em um lugar → funciona em todas as telas.

const utilSRMV = (function() {
  'use strict';

  function corPorStatus(ok, alerta) {
    if (alerta) return '#FFB300';
    if (ok)     return '#00C853';
    return '#FF1744';
  }

  async function lerTagSegura(tagName) {
    if (!tagName || tagName.length === 0) return null;
    try {
      return await Tags(tagName).Read();
    } catch (err) {
      HMIRuntime.Trace(`[utilSRMV] ${tagName}: ${err}`);
      return null;
    }
  }

  return { corPorStatus, lerTagSegura }; // Expõe apenas o necessário
}());
```

### Timer (único disparo)
```javascript
// POR QUÊ SetTimeout e não setInterval: setInterval não é suportado no WinCC.
// Para ações recorrentes, configure Scheduled Task no TIA Portal Engineering.
HMIRuntime.Timers.SetTimeout(function() {
  atualizarTela();
}, 2000); // ms — dispara uma vez após 2s
```

### Alarmes
```javascript
HMIRuntime.Alarming
  .GetActiveAlarms(1046, "AlarmClassName = 'Alarm'") // 1046=pt-BR, 1033=en-US
  .then(function(alarms) {
    Tags('TotalAlarmes').Write(alarms.length);
  })
  .catch(function(err) {
    HMIRuntime.Trace(`[Alarmes] ${err}`);
  });
```

---

## 18. BLOCOS OTIMIZADOS VS NÃO-OTIMIZADOS

> 💡 **Para times não técnicos:** Blocos otimizados são a versão moderna e eficiente.
> Blocos não-otimizados existem por compatibilidade com equipamentos antigos.

### Comparação Objetiva
| Característica | Não-Otimizado | Otimizado |
|---|---|---|
| Acesso | Simbólico E absoluto (`DB1.DBW4`) | **Apenas simbólico** |
| Retentividade | Todo o DB ou nada | **Tag por tag** |
| Tamanho máximo (S7-1500) | 64 kB | **até 16 MB** |
| Download sem reinicializar | ❌ | ✅ Online Change |
| Compatível com PUT/GET | ✅ | ❌ |
| Performance | Menor | **Máxima** |

```scl
{ S7_Optimized_Access := 'TRUE'  }  // padrão para novos projetos
{ S7_Optimized_Access := 'FALSE' }  // quando necessário acesso absoluto ou PUT/GET

// ⚠️ NUNCA misturar otimizado e não-otimizado na mesma cadeia de chamada!
```

---

## 19. DOWNLOAD SEGURO E DIAGNÓSTICO

> 💡 **Para times não técnicos:** Baixar um programa para o CLP em produção pode parar
> a máquina se feito incorretamente. Esta sequência garante segurança.

### Fluxo de Download Seguro
```
1. COMPILE ALL → garante consistência — zero erros antes de prosseguir
2. COMPARE (Online vs Offline) → verifica diferenças e viabilidade de Online Change
3. DELTA DOWNLOAD → baixa apenas blocos modificados
4. ONLINE CHANGE → CPU permanece em RUN (apenas blocos otimizados)

REGRAS CRÍTICAS:
❌ NUNCA baixar OB1 vazio — CPU vai a STOP imediatamente!
❌ NUNCA fazer download sem compilar antes
✅ Consultar Diagnostic Buffer se CPU está em STOP antes de agir
✅ Fazer backup do programa antes de qualquer download em produção
✅ Usar Online Change quando disponível — zero impacto na produção
```

### Tabela de Diagnóstico — 20 Sintomas e Soluções
| Sintoma | Causa provável | Solução |
|---|---|---|
| Timer nunca dispara | Timer em VAR_TEMP | Mover para VAR |
| Dado errado após mudar endereço | Acesso absoluto hardcoded | Migrar para simbólico |
| CPU STOP — "ciclo excedido" | OB80 ausente | Adicionar OB80 ao projeto |
| HMI não atualiza após mudar PLC | Acesso absoluto no HMI | Usar simbólico (Reference ID) |
| Dados sobrescritos misteriosamente | Mistura otimizado/não-otimizado | Uniformizar tipo de acesso |
| IDB com campos errados | FB alterado sem recompilar | Compile All → Download |
| Perda de dados após queda de energia | Tag não Retain | Configurar Retain no FB |
| Contagem dupla no CTU | Pulso duplo por varredura rápida | FB com trava de confirmação |
| Eixo pula válvula na serpentina | Pulso sem posição confirmada | Verificar _posicaoConfirmadaAntePulso |
| Foto em movimento câmera | Trigger sem standstill | Verificar DB455.DBX44.0 |
| Download falha em RUN | Bloco não-otimizado | Usar blocos otimizados |
| GET/PUT não funciona | Permissão desabilitada | Habilitar PUT/GET na CPU remota |
| GET/PUT com DB otimizado | DB otimizado incompatível | Desabilitar otimização no DB |
| String corrompida | Concatenação com `+` | Usar CONCAT() |
| Média sempre errada | Divisão inteira Int÷Int | TO_REAL() antes da divisão |
| SQRT causa STOP | Entrada negativa | Validar >= 0.0 antes de chamar |
| Estado desconhecido na state machine | ELSE ausente no CASE | Adicionar `ELSE: estado := 99` |
| Polling sobrecarrega comunicação | GET/PUT a cada ciclo OB1 | Mover para OB35 (100ms) |
| Escalonamento analógico errado | Raw mínimo incorreto para 4-20mA | Usar 6912 (não 5530) para 4-20mA |
| Filtro não suaviza ruído | FB_FiltroPT1 sem inicialização | Usar flag `inicializa` para evitar spike |

---

## 20. MIGRAÇÃO S7-300/400 → S7-1200/1500

| Recurso S7-300/400 | Equivalente S7-1200/1500 | Observação |
|---|---|---|
| Timers SIMATIC (S_ODT, S_PULSE...) | TON, TOF, TP como multi-instâncias | IEC timers — hardware-independentes |
| Contadores SIMATIC (S_CU, S_CUD...) | CTU, CTD, CTUD como multi-instâncias | IEC counters |
| Marcas de memória M, MB, MW | DB global com campos simbólicos | Mais portável |
| Symbol table | PLC tags | Mesmo conceito |
| `DB1.DBW4` (endereço absoluto) | `"MeuDB".minha_word` (simbólico) | Otimizado: apenas simbólico |
| ANY pointer | VARIANT e ARRAY[*] | Mais seguro — verificação de tipo em compilação |
| Construct AT | Slice access `.%X`, `.%B`, `.%W` | Mais simples |
| STL com AR1/AR2 | Evitar — emulado, mais lento | Usar SCL ou LAD |
| FC_Escala (fórmula manual) | NORM_X + SCALE_X nativos | Mais robusto |
| SFB14/15 GET/PUT | GET/PUT TIA ou OUC | Habilitar explicitamente |
| NetPro para conexões | Conexões no TIA Portal | Mesma lógica, nova interface |
| FB em STEP 7: instância por DB | TIA Portal: multi-instância em VAR | Menos DBs, mais organização |

---

## 21. CHECKLIST UNIVERSAL PRE-COMMIT

> 💡 **Para times não técnicos:** Esta lista deve ser verificada ANTES do download
> para o CLP. Como lista de checagem de voo — cada item evita um problema.

### SCL — Antes de entregar qualquer código
- [ ] **Parâmetros nomeados:** `:=` (IN) e `=>` (OUT) em TODAS as funções nativas
- [ ] **Timer/Counter/Trig:** em `VAR` ou `VAR_STAT` — NUNCA em `VAR_TEMP`
- [ ] **ELSIF:** usado `ELSIF` (não `ELSEIF`)
- [ ] **State machine:** usa `CASE OF` com `ELSE: estado := 99` obrigatório
- [ ] **Funções nativas:** LIMIT, MIN, MAX usados (não reimplementados)
- [ ] **Escalonamento:** NORM_X/SCALE_X ou FC_Escala (não fórmula inline)
- [ ] **Edge detection:** R_TRIG / F_TRIG (não `prevSinal` manual)
- [ ] **Array copy:** MOVE_BLK (não FOR loop)
- [ ] **Array init:** FILL_BLK (não FOR loop)
- [ ] **String concat:** CONCAT() (não operador `+`)
- [ ] **Float comparison:** ABS() com tolerância (não `=` direto)
- [ ] **Integer division:** TO_REAL() antes da divisão quando resultado deve ser Real
- [ ] **SQRT e divisão:** protegidos contra input inválido (>= 0 e <> 0)
- [ ] **ELSE no CASE:** sempre presente — estado de erro explícito (estado 99)
- [ ] **Reset global:** RETURN imediato após reset — antes de qualquer outra lógica
- [ ] **Block type:** FC para stateless, FB para stateful
- [ ] **Raw 4-20mA:** usar 6912 como mínimo (não 5530) para módulos Siemens
- [ ] **Comentários:** lógica complexa comentada com "POR QUÊ" — não apenas "o quê"

### JavaScript WinCC — Antes de entregar qualquer código
- [ ] Sem `var` — apenas `const` / `let`
- [ ] Sem `eval()`, `console.log()`, `setTimeout()` / `setInterval()` nativos
- [ ] Aspas simples obrigatórias
- [ ] `async/await` com `try/catch` em TODA operação assíncrona
- [ ] `TagSet` para múltiplas tags (não chamadas individuais em loop)
- [ ] `HMIRuntime.Trace()` para debug (removido antes de produção)
- [ ] Template IIFE como ponto de partida
- [ ] Paleta CORES usada para consistência visual
- [ ] Constantes para nomes de tags (não hardcode inline)

### Download — Antes de compilar e enviar
- [ ] Compile All executado — zero erros ou warnings críticos
- [ ] Diagnostic Buffer consultado se CPU estava em STOP
- [ ] OB80 presente no projeto (evita STOP por ciclo excedido)
- [ ] Backup do programa atual feito
- [ ] Online Change quando disponível (mantém produção em RUN)
- [ ] PUT/GET habilitado na CPU remota (se necessário)
- [ ] DB de comunicação com otimização desabilitada (se usar PUT/GET)

---

## 22. QUICK REFERENCE — KEYWORDS E OPERADORES

### Seções de Variáveis
| Seção | Persiste? | Uso |
|---|---|---|
| `VAR_INPUT` | N/A | Parâmetros de entrada |
| `VAR_OUTPUT` | N/A | Parâmetros de saída |
| `VAR_IN_OUT` | N/A | Bidirecional — lido e modificado |
| **`VAR`** | **✅ Sim** | **Memória interna — TIMERS AQUI!** |
| `VAR_STAT` | ✅ Sim | Estática — mesma persistência que VAR |
| **`VAR_TEMP`** | **❌ Não** | **Apagada a cada ciclo — nunca timers!** |
| `VAR CONSTANT` | ✅ Imutável | Constantes — sem números mágicos |

### Estruturas de Controle
| Estrutura | Sintaxe completa |
|---|---|
| Condicional | `IF` ... `THEN` ... `ELSIF` ... `ELSE` ... `END_IF;` |
| Seleção | `CASE` ... `OF` ... `ELSE` ... `END_CASE;` |
| Loop contador | `FOR` ... `TO` ... `DOWNTO` ... `BY` ... `END_FOR;` |
| Loop pré-teste | `WHILE` ... `DO` ... `END_WHILE;` |
| Loop pós-teste | `REPEAT` ... `UNTIL` ... `END_REPEAT;` |
| Sair do loop | `EXIT;` |
| Pular iteração | `CONTINUE;` |
| Sair do bloco | `RETURN;` |

### Operadores
| Operador | Uso |
|---|---|
| `:=` | Atribuição / Parâmetro de entrada |
| `=>` | Parâmetro de saída de FB |
| `=` | Comparação de igualdade |
| `<>` | Diferente (not equal) |
| `<` `>` `<=` `>=` | Comparação numérica |
| `AND` / `OR` / `NOT` | Lógicos booleanos |
| `&` / `\|` / `XOR` | Bitwise |
| `+` `-` `*` `/` | Aritméticos |
| `MOD` | Módulo — resto da divisão inteira |
| `**` | Potenciação (apenas Real) |

### Literais Especiais
```scl
16#FF          // Hexadecimal
2#11110000     // Binário
T#5s           // Time — 5 segundos
T#100ms        // Time — 100 milissegundos
TRUE / FALSE   // Booleano
'texto'        // String — aspas simples!
B#16#10        // Byte hexadecimal (ANY pointer sintaxe)
W#16#0001      // Word hexadecimal (ID de conexão)
P#DB10.DBX0.0 BYTE 20  // ANY pointer / ponteiro de área
```

---

## 23. REGION / END_REGION — ORGANIZAÇÃO DE BLOCOS

> 💡 **Para times não técnicos:** REGION é como dividir um documento longo em capítulos.
> No editor TIA Portal, cada REGION pode ser dobrada/recolhida — facilita navegar em
> blocos grandes sem se perder no código.

```scl
FUNCTION_BLOCK "fb91_GerenciaMontagem"
{ S7_Optimized_Access := 'FALSE' }
VERSION : 0.1

BEGIN

  REGION Detecção de Borda
  // POR QUÊ primeiro: bordas capturadas antes de qualquer lógica
    _trigTrava    (CLK := iPulsoTravaCompleto);
    _trigStart    (CLK := iStart);
    _trigStop     (CLK := iStop);
  END_REGION

  REGION Reset Global
  // POR QUÊ RETURN: se reset pedido, não executa mais nada neste ciclo
    IF iResetContador THEN
      _estado               := 0;
      oPulsoValidado        := FALSE;
      oDiagPulsosBloqueados := 0;
      RETURN;
    END_IF;
  END_REGION

  REGION Tabela Serpentina — Inicialização única
  // POR QUÊ flag: inicializa apenas no primeiro scan após download
    IF NOT _tabelaIniciada THEN
      _tabelaValvulas[1]  := 1;  _tabelaValvulas[2]  := 4;
      _tabelaValvulas[3]  := 5;  _tabelaValvulas[4]  := 8;
      // ... restante da tabela
      _tabelaIniciada := TRUE;
    END_IF;
  END_REGION

  REGION State Machine Principal
    CASE _estado OF
      0: // Idle
      1: // AguardandoPosicao
      2: // AguardandoTrava
      3: // LiberandoPulso — 1 scan
      99: // Erro
      ELSE: _estado := 99;
    END_CASE;
  END_REGION

  REGION Saídas de Diagnóstico
    oDiagEstado           := _estado;
    oDiagCicloEmAndamento := _cicloEmAndamento;
  END_REGION

END_FUNCTION_BLOCK

// BOAS PRÁTICAS DE REGION:
// ✅ Use para separar: Inicialização / Detecção de Borda / Reset /
//    State Machine / Saídas / Diagnóstico
// ✅ Nomes descritivos — explica o propósito do bloco de código
// ❌ Não criar REGIONs de apenas 1-2 linhas — overhead sem benefício
// ❌ Não aninhar mais de 2 níveis de REGION
```

---

## 24. BIBLIOTECAS SIEMENS — LGF (Library General Functions)

> 💡 **Para times não técnicos:** A LGF é a "biblioteca padrão" da Siemens — funções
> prontas e testadas que você pode usar diretamente no seu projeto, sem programar do zero.
> Entry ID: 109479728

### Categorias Disponíveis na LGF
| Categoria | Funções úteis | Quando usar |
|---|---|---|
| **Math** | LGF_Hysteresis, LGF_DeadBand, LGF_RampFunction | Suavização de setpoint, zona morta |
| **String** | LGF_StringToArray, LGF_ArrayToString, LGF_FindAndReplace | Parsing de strings industriais |
| **Conversion** | LGF_BCD_To_Int, LGF_Int_To_BCD, LGF_GrayToBin | Encoders BCD/Gray code |
| **Time** | LGF_HourMeter, LGF_DateTimeToString | Horímetro, timestamp formatado |
| **Diagnosis** | LGF_ErrorHandling, LGF_QualityCode | Tratamento padronizado de erros |
| **Motion** | LGF_PositionMonitoring, LGF_CamSwitch | Monitoramento de posição, came eletrônico |
| **PID** | LGF_Totalizer, LGF_MovingAverage | Totalizador de fluxo, média móvel otimizada |

### Como instalar a LGF no TIA Portal
```
1. Baixar em: support.industry.siemens.com/cs/document/109479728
2. Abrir TIA Portal → Menu Options → Global libraries → Open library
3. Selecionar o arquivo .zal baixado
4. Arrastar os blocos necessários para o projeto (não precisa copiar todos)
5. Os blocos aparecem em: Program blocks → External source files
```

### Exemplo — LGF_HourMeter (Horímetro)
```scl
// POR QUÊ LGF_HourMeter em vez de código próprio:
// Já trata reinício da CPU, overflow de contador e dados retentivos

"LGF_HourMeter_DB"(
  Enable     := motorLigado,      // conta enquanto TRUE
  Reset      := resetHorimetro,   // zera o contador
  Hours      => horasOperacao,    // horas acumuladas (REAL)
  Minutes    => minutosOperacao); // minutos na hora atual (INT)

// Monitoramento de manutenção preventiva:
IF horasOperacao >= 2000.0 THEN
  alertaManutencao := TRUE; // Troca de óleo a cada 2000h
END_IF;
```

---

## 25. VERSIONAMENTO DE BLOCOS — RASTREABILIDADE

> 💡 **Para times não técnicos:** Versionar blocos é como colocar número de revisão
> em um documento técnico. Em auditorias ISO/IATF, é obrigatório saber qual versão
> do programa estava rodando em cada máquina em cada data.

### Atributos Padrão de Bloco
```scl
FUNCTION_BLOCK "fb91_GerenciaMontagem"
{ S7_Optimized_Access := 'FALSE' }
// ============================================================
// IDENTIFICAÇÃO DO BLOCO — preencher SEMPRE
// ============================================================
// TITLE   = 'Gerenciamento de Montagem Serpentina — Posto 2'
// VERSION : '1.2'              ← incrementar a cada alteração
// AUTHOR  : ReginaldoLobo     ← máx 8 chars (STEP 7 clássico)
// NAME    : fb91_GerM          ← abreviação do nome
// FAMILY  : M1604              ← nome do projeto/máquina
//
// HISTÓRICO DE REVISÕES:
// v0.1 — 2026-04-10 — R.Lobo — Criação inicial
// v1.0 — 2026-05-01 — R.Lobo — Adicionada trava anti-pulso duplo
// v1.1 — 2026-05-15 — R.Lobo — F_TRIG em M104.1 validado (30 cabeçotes)
// v1.2 — 2026-05-23 — R.Lobo — Proteção contra tranco mecânico
// ============================================================
VERSION : 0.1
```

### Convenção de Nomenclatura — Padrão MWM
```
Formato: fb[número]_[NomeDoBloco]
                    ↑ PascalCase — sem espaços, sem acentos

Exemplos:
  fb91_GerenciaMontagem    ← FB principal do posto
  fb92_ControleContador    ← FB de controle do contador
  fb93_MonitorSRMV         ← FB de monitoramento SRMV
  fc91_RemapeiaPos         ← FC de remapeamento de posições
  fc92_ContadorParaValvula ← FC de lookup table serpentina
  db91_GerenciaMontagem    ← DB de instância do fb91 (gerado auto)
  db100_SRMV_Semana01      ← DB de dados SRMV semana 1

Faixas de numeração sugeridas:
  FB 91-99   → Posto 2 — M1604 (lógica principal)
  FB 100-109 → SRMV (rastreabilidade)
  FB 200-209 → Comunicação / Supervisório
  FC 91-99   → Funções auxiliares Posto 2
  DB 91-99   → Instâncias dos FBs do Posto 2
  DB 100-119 → DBs de dados SRMV (semanas/meses)
```

---

## 26. SIMATIC MEMORY CARD — BACKUP E RESTAURAÇÃO

> 💡 **Para times não técnicos:** O Memory Card é como um pendrive especial da Siemens.
> Permite fazer backup do programa e restaurar em campo sem precisar de laptop com
> TIA Portal instalado — essencial para manutenção rápida e troca de CPU.

### Tipos de Memory Card
| Tipo | Cor | Uso | Observação |
|---|---|---|---|
| **Program** | Laranja/Amarelo | Programa do usuário | Padrão para produção |
| **Firmware** | Verde | Atualização de firmware da CPU | Usar com cuidado |
| **Transfer** | Azul | Apenas transferência (não retém) | Para download temporário |

### Operações com Memory Card — S7-1200/1500
```
BACKUP (CPU → Card):
1. Inserir Memory Card com CPU em STOP
2. TIA Portal → Online → Backup do dispositivo → Para arquivo .wbk
   — OU —
   Botão na CPU (hold 3s) → LED pisca → backup automático para o card

RESTAURAÇÃO (Card → CPU):
1. Inserir Memory Card com programa novo
2. CPU detecta automaticamente na inicialização
3. CPU copia programa do card para memória interna
4. Remover card → CPU entra em RUN automaticamente

CAMPO SEM LAPTOP:
1. CPU com defeito: inserir card na CPU nova (mesmo tipo/versão)
2. CPU copia programa e configuração de hardware automaticamente
3. Verificar endereço IP (pode precisar ajustar conforme a rede local)
```

### Boas Práticas de Memory Card
```
✅ SEMPRE manter um card atualizado por máquina em produção
✅ Etiquetar o card com: máquina, versão do programa, data do backup
✅ Testar o backup restaurando em bancada antes da necessidade real
✅ Para S7-1200: card de 2MB ou 4MB — verificar compatibilidade
✅ Para S7-1500: card de 2MB, 32MB ou 2GB — programa determina tamanho
❌ Não usar card de firmware para programa — CPU pode atualizar firmware inadvertidamente
❌ Não remover o card com a CPU em RUN (risco de corrupção)
```

---

## 27. SAFETY — F-CPU (CONCEITOS ESSENCIAIS)

> 💡 **Para times não técnicos:** Safety (F-CPU) é a versão "à prova de falhas" do CLP.
> É usado quando uma falha no programa pode causar risco para pessoas ou equipamentos.
> Segue a norma IEC 61508 e é certificado para SIL 2 e SIL 3.

### Conceitos Fundamentais
```
F-CPU = CPU com runtime safety integrado (F-runtime group)
F-DB  = Data Block de segurança — dados validados com checksum
F-FB  = Function Block de segurança — código certificado pela Siemens

F-Signature: número que identifica univocamente a configuração de segurança.
  → Muda sempre que qualquer bloco F é alterado
  → Deve ser aceito pelo operador antes de entrar em produção
  → É registrado no Diagnostic Buffer com timestamp

Value Status: bit adicional que acompanha cada sinal de segurança.
  → 0 = sinal inválido (falha de sensor, curto, fio partido)
  → 1 = sinal válido — usar normalmente
  → SEMPRE verificar Value Status antes de usar o sinal!
```

### Regras que Causam STOP do F-CPU
```
❌ Discrepância entre canais redundantes por mais do tempo configurado
❌ F-Signature não aceito após download
❌ Watchdog do F-runtime excedido (código Safety muito pesado)
❌ Falha de CRC em F-DB (memória corrompida)
❌ Troca de dados Standard↔Safety sem DB dedicado
❌ Chamar FB Standard dentro de FB Safety (proibido — fluxo de informação)

✅ CORRETO — troca Standard → Safety via F-DB:
   F-DB criado automaticamente pelo TIA Portal para cada FB Safety
   Dados Standard escrevem no F-DB.Inputs
   F-runtime valida CRC antes de usar em código Safety
```

### Estrutura de Programa com Safety
```
OB1 (Standard) ──→ chama FBs Standard
                ──→ escreve em F-DB.Inputs (interface com Safety)

F-OB1 (Safety) ──→ chama F-FBs apenas
               ──→ lê F-DB.Inputs validados
               ──→ escreve saídas de segurança (Q Safety)

NUNCA:
  F-OB1 → chamar FC/FB Standard
  OB1   → escrever diretamente em saídas Safety (Q.%X Safety)
```

---

## 28. SIVARC — GERAÇÃO AUTOMÁTICA DE TELAS HMI

> 💡 **Para times não técnicos:** SiVArc (Siemens Virtual Arc) lê o programa do PLC
> e gera as telas HMI automaticamente — reduz drasticamente o tempo de engenharia
> em projetos com muitos equipamentos repetitivos (motores, válvulas, inversores).

### Quando usar SiVArc
```
✅ Projetos com muitas instâncias do mesmo tipo de equipamento
   Ex: 24 válvulas iguais, 8 motores com o mesmo FB, 16 inversores
✅ Quando tela HMI deve refletir automaticamente adição de equipamentos no PLC
✅ Projetos que seguem padrão modular (mesmo FB para cada equipamento)
❌ Projetos com telas altamente customizadas (SiVArc gera telas padrão)
❌ Projetos pequenos com poucos equipamentos (overhead não compensa)
```

### Funcionamento Básico
```
1. Programar o PLC com FBs padronizados (ex: fb_Motor para todos os motores)
2. Adicionar atributos SiVArc aos FBs e DBs de instância no TIA Portal
3. SiVArc lê a estrutura de chamadas e gera automaticamente:
   → Uma tela de overview com todos os equipamentos
   → Uma tela de detalhe por instância (com faceplate)
   → Tags HMI ligadas automaticamente ao DB de cada instância
4. Ao adicionar novo equipamento (nova instância do FB):
   → Regenerar com SiVArc → tela atualizada automaticamente
```

### Exemplo de Atributo SiVArc em FB
```scl
FUNCTION_BLOCK "fb_Motor"
{ S7_Optimized_Access := 'TRUE' }
// Atributo que informa ao SiVArc qual faceplate usar para este FB:
// {InstructionName := 'LMotor01'}  ← nome do faceplate na biblioteca HMI

VAR_INPUT
  Start   : Bool;
  Stop    : Bool;
END_VAR
VAR_OUTPUT
  Running : Bool;
  Error   : Bool;
END_VAR
```

---

## 29. CHECKLIST ESPECÍFICO PARA GRAPH

> 💡 **Para times não técnicos:** Este checklist é específico para sequenciadores GRAPH.
> Antes de colocar qualquer sequenciador em produção, verificar todos os itens.

### Antes de Criar o Sequenciador
- [ ] Definir claramente início e fim da sequência
- [ ] Identificar todas as condições de parada de emergência (`OFF_SQ`)
- [ ] Definir qual passo é o "estado seguro" de retorno (normalmente S1)
- [ ] Mapear todos os timeouts necessários — qual passo pode travar?
- [ ] Decidir: divergência alternativa (XOR) ou simultânea (AND)?

### Durante a Programação
- [ ] Cada passo tem nome descritivo (ex: `S3_ConfirmarNivel`, não `S3`)
- [ ] Cada transição tem nome descritivo (ex: `T3_NivelOK`, não `T3`)
- [ ] S2 Supervision configurada em TODOS os passos com atuadores
- [ ] Tempo S2 > tempo real esperado + 50% de margem
- [ ] S1 Interlock configurada para condições de segurança reversíveis
- [ ] Passo de erro (`S_ERR`) implementado com ações de fail-safe
- [ ] `OFF_SQ` conectado ao sinal de parada de emergência
- [ ] `INIT_SQ` conectado ao botão de reinício correto
- [ ] `ACK_EF` conectado ao botão de confirmação do operador

### Antes de Colocar em Produção
- [ ] Testar modo manual (S_NEXT / S_PREV) em bancada
- [ ] Simular timeout de cada S2 e verificar comportamento no erro
- [ ] Verificar que `OFF_SQ` leva a estado seguro (saídas desligadas)
- [ ] Monitorar `Sx.T` em operação real e comparar com tempo esperado
- [ ] Confirmar que `Sx.U` incrementa corretamente (conta ciclos)
- [ ] Documentar os parâmetros de cada S2 (tempo, condição)
- [ ] Validar com o operador o fluxo de ACK após erro

---

## 30. REFERÊNCIAS OFICIAIS SIEMENS — MANUAIS E LINKS DIRETOS

> 💡 **Para times não técnicos:** Esta seção reúne os links oficiais dos manuais Siemens
> usados como base desta skill, para consulta ou verificação de qualquer detalhe não
> coberto aqui. Todos são fontes públicas em support.industry.siemens.com.

### Manuais de SCL (Structured Control Language)
| Documento | Plataforma | Link |
|---|---|---|
| **S7-SCL V5.3 for S7-300/400 — Programming Manual** | S7-300/400 (STEP 7 clássico) | https://cache.industry.siemens.com/dl/files/793/5581793/att_66783/v1/SCL_e.pdf |
| **SCL for S7-300/S7-400 — Programming (Part 3: Language Description)** | S7-300/400 | https://support.industry.siemens.com/cs/attachments/1137188/SCLV4_e.pdf |
| **High Level Language Programming with S7-SCL** (material de treinamento SCE) | S7-300/400 | https://www.automation.siemens.com/sce-static/learning-training-documents/classic/programming-languages/c02-s7scl-en.pdf |
| SCL para S7-1200/1500 | TIA Portal | Não há manual isolado — o conteúdo está dentro do Programming Guideline (abaixo) e da documentação online do TIA Portal |

### Guias de Programação S7-1200/S7-1500
| Documento | Entry ID | Link |
|---|---|---|
| **Programming Guideline for S7-1200/S7-1500** | 81318674 | https://support.industry.siemens.com/cs/ww/en/view/81318674 |
| **Programming Styleguide for S7-1200/S7-1500** | 81318674 | https://cache.industry.siemens.com/dl/files/084/109478084/att_851379/v1/81318674_Programming_Styleguide_DOCU_v11_en.pdf |
| **Safety Programming Guideline for SIMATIC S7-1200/1500** | 109750255 | https://support.industry.siemens.com/cs/ww/en/view/109750255 |
| Documentação online TIA Portal — "Programming a PLC" | — | https://docs.tia.siemens.cloud/r/en-us/v21/programming-a-plc |

### Outras referências citadas nesta skill
| Documento | Entry ID |
|---|---|
| JS Style Guide + Tips&Tricks WinCC Unified | 109758536 |
| Engineering Guideline WinCC Unified | 109827603 |
| Library General Functions (LGF) | 109479728 |

---

**Nome da Skill:** siemens_s7_wincc_master
**Autor:** REGINALDO LOBO (skill original) + revisão/validação assistida por Claude
**Versão:** 3.1-dev (cópia de trabalho derivada da v3.0 original — não substitui o original)
**Data:** 2026-10-15
**Idioma:** Português do Brasil (PT-BR)
**Target:** S7-300/400 STEP 7 · S7-1200/1500 TIA Portal V17-V20+ · WinCC Unified V17-V20+
**Padrão:** IEC 61131-3 · Siemens JS Style Guide V1.0
**Seções:** 30 seções (29 originais + 1 nova: Referências Oficiais com links diretos)
**Referências:**
- Entry ID 109758536 — JS Style Guide + Tips&Tricks WinCC Unified
- Entry ID 109827603 — Engineering Guideline WinCC Unified
- Entry ID 81318674  — Programming Guideline S7-1200/1500
- Entry ID 109750255 — Safety Programming Guideline S7-1200/1500
- Entry ID 109479728 — Library General Functions (LGF)
- SCL S7-300/400 Manual 6ES7811-1CA02-8BA0 (links diretos na Seção 30)
- SIEMENS_S7_BLOCO v1.0 (29 seções)
- analogicos-escalonamento.md
- comunicacao-s7-put-get.md
- graph-sequenciadores.md
- ponteiros-enderecos-indiretos.md
- pid-controle.md
