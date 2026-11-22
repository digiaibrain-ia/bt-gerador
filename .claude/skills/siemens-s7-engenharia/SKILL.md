---
name: "siemens-s7-engenharia"
description: "Skill de engenharia para automação Siemens S7 em PT-BR, do arranque do projeto à entrega. Cobre SCL/STL, WinCC Unified JS, comunicação, PID, GRAPH, Safety, analógicos, migração e boas práticas, com comentários ricos em cada bloco. Ative para CLP/HMI industrial Siemens."
---

# SIEMENS S7 — ENGENHARIA COMPLETA

**Autor:** Reginaldo Lobo · **Versão:** 2.1 · **Idioma:** PT-BR
**Plataformas:** S7-300/400 (STEP 7) · S7-1200/1500 (TIA Portal V17-V20+) · WinCC Unified
**Padrão:** IEC 61131-3 · Siemens JS Style Guide V1.0

> 💡 **Para times não técnicos:** esta skill gera código industrial para CLPs Siemens.
> Um CLP (Controlador Lógico Programável) é o "cérebro" de uma máquina de produção.
> Os comentários `//` dentro do código explicam, em linguagem simples, **o que** cada
> parte faz e — principalmente — **por que** aquela abordagem foi escolhida.

---

## COMO USAR ESTA SKILL (mapa de navegação)

O `SKILL.md` traz o que se usa em quase todo bloco: workflow, regras críticas,
decisão FC×FB, templates comentados e o padrão obrigatório de comentários.
O conteúdo profundo está em `referencias/` — **leia o arquivo do tema antes de
escrever o código daquele tema**, pois cada um traz restrições específicas que não
estão na sua memória de treino:

| Preciso de... | Leia o arquivo |
|---|---|
| Iniciar projeto, escolher CPU/linguagem, arquitetura, nomenclatura, entrega | `referencias/kickstart-e-arquitetura.md` |
| Funções nativas (LIMIT, NORM_X, MOVE_BLK, CONCAT, timers, contadores…) | `referencias/funcoes-core.md` |
| Os 20 erros comuns e como evitá-los | `referencias/anti-patterns.md` |
| Tipos de dados, faixas, UDT, endereçamento, slice access | `referencias/tipos-dados-e-enderecamento.md` |
| Sinais analógicos: escalonamento, fio partido, filtros | `referencias/analogicos.md` |
| Comunicação entre CLPs: GET/PUT, OUC, Modbus, PROFIBUS | `referencias/comunicacao.md` |
| Controle PID: seleção de bloco, sintonia, cascata | `referencias/pid.md` |
| Sequenciadores GRAPH (SFC) | `referencias/graph.md` |
| OBs, prioridades, variáveis de sistema, SFC/SFB | `referencias/obs-e-sfcs.md` |
| STEP 7 clássico: S5TIME, BCD, ANY, AR1/AR2, AT, consistência | `referencias/step7-classico.md` |
| Blocos otimizados, download seguro, diagnóstico, Watch Table | `referencias/otimizacao-download-diagnostico.md` |
| Migração S7-300/400 → S7-1200/1500 | `referencias/migracao.md` |
| Segurança funcional (F-CPU, SIL/PLr, F-Signature) | `referencias/safety.md` |
| JavaScript do WinCC Unified (telas, TagSet, cores) | `referencias/wincc-javascript.md` |

Para uma verificação automática do código antes de entregar, use o validador:
`python3 scripts/validar_scl.py <arquivo.scl>` (detecta os anti-patterns mais comuns).

---

## 1. WORKFLOW EM 4 PASSOS

> 💡 **Para times não técnicos:** seguir esta sequência evita retrabalho e garante
> que o código funcione já na primeira compilação.

```
PASSO 1 — ARRANQUE (só em projeto novo)
  Defina plataforma, CPU, linguagem e arquitetura.
  → referencias/kickstart-e-arquitetura.md

PASSO 2 — ESCOLHA O TIPO DE BLOCO
  Preciso LEMBRAR algo entre um ciclo de varredura e o próximo?
  (estado de motor, contagem, timer em andamento, última posição…)
     NÃO → FC (Function)      |      SIM → FB (Function Block)
     "calculadora pura"       |      "objeto com memória"

PASSO 3 — USE AS FUNÇÕES NATIVAS (nunca reimplemente)
  → referencias/funcoes-core.md · analogicos.md · pid.md

PASSO 4 — VALIDE
  → seção 5 (Regras Críticas) · referencias/anti-patterns.md
  → scripts/validar_scl.py  ·  Checklist de entrega no kickstart
```

---

## 2. DECISÃO FC × FB (a mais importante)

> 💡 **Para times não técnicos:** FC é uma calculadora (recebe dados, calcula,
> devolve o resultado e esquece tudo). FB é um equipamento com memória (lembra o
> estado anterior, acumula valores, controla sequências). Escolher errado gera
> bugs difíceis de achar — por exemplo, um timer que nunca dispara.

```
Meu bloco precisa LEMBRAR algo entre um ciclo e o próximo?

        NÃO                                  SIM
         ↓                                    ↓
   FC — Function                       FB — Function Block
   "calculadora pura"                  "objeto com memória"
   ✔ cálculos, conversões              ✔ controle de motores
   ✔ escalonamento analógico           ✔ timers e contadores com lógica
   ✔ validação de dados                ✔ state machines / sequenciadores
   ✔ média de valores                  ✔ acumuladores, anti-pulso-duplo
   Só VAR_INPUT/OUTPUT/TEMP            Tem VAR para memória persistente
```

Regra de ouro: **timer, contador e detector de borda SEMPRE moram num FB, na seção
`VAR`** — nunca em `VAR_TEMP` (que é apagada a cada ciclo).

---

## 3. PADRÃO OBRIGATÓRIO DE COMENTÁRIOS  ⭐ (núcleo desta skill)

> 💡 **Para times não técnicos:** o código precisa "se explicar". Um operador, um
> técnico de manutenção ou um gestor deve conseguir abrir o bloco e entender o que
> ele faz sem precisar ser programador.

**Todo FB, FC, DB, UDT e OB gerado por esta skill DEVE conter comentários.** Não é
opcional — é o que diferencia o código entregue aqui. Comente o **PORQUÊ**, não o
óbvio "COMO" (o código já mostra o como). As regras:

1. **Cabeçalho de bloco** — todo bloco começa com um cabeçalho explicando:
   o que faz, por que é FC ou FB, autor (Reginaldo Lobo), versão, projeto e — em
   state machines — a lista de estados.

2. **Comentário por seção** (FB/FC/OB; não vale para o STRUCT de DB) — separe o `BEGIN` em blocos lógicos
   (`// ── DETECÇÃO DE BORDA ──`, `// ── STATE MACHINE ──`, `// ── SAÍDAS ──`)
   com uma linha explicando o propósito daquela seção.

3. **Comentário por variável** — cada declaração ganha um comentário curto com a
   unidade física e a faixa esperada (`iPressao : Real;  // Pressão medida [bar], 0..16`).
   No DB use o template DB da seção 6 e a seção 12 da skill padrao-comentarios-scl
   (cabeçalho `////` após NON_RETAIN, sem seções no STRUCT).

4. **Comentário "POR QUÊ" nas decisões não óbvias** — toda vez que houver uma
   escolha técnica que poderia surpreender (usar `TO_REAL` antes de dividir, validar
   antes de `SQRT`, comparar float com tolerância, `RETURN` após reset…), explique
   a razão em 1-2 linhas, em linguagem que um leigo entenda.

5. **Comentário em cada `case` da state machine** — diga em que situação física
   aquele estado representa (`2: // EXECUTANDO — operação normal`).

6. **Nomenclatura de blocos e autor** — nome = prefixo do tipo em minúsculas + número +
   `_` + descrição em PascalCase (`fc10_EscalaNivel`, `fb91_ControleMotor`,
   `db52_BancoTeste2_DSE`). Autor sempre `Reginaldo Lobo`, em todos os projetos. Esta
   regra prevalece sobre o `FC_/FB_/DB_/UDT_` citado em `referencias/kickstart-e-arquitetura.md`.

7. **Nada de "números mágicos"** — todo valor fixo vira `VAR CONSTANT` com nome
   descritivo e comentário (`TIMEOUT_CAMERA : Time := T#700ms; // timeout SIVE`).

Os templates da seção 6 e todos os exemplos das referências já seguem este padrão —
use-os como modelo de densidade de comentários.

---

## 4. ESTRUTURAS DE CONTROLE (resumo)

```scl
// IF — note ELSIF (nunca ELSEIF, que é de outras linguagens!)
IF p < 1.0 THEN s := 'BAIXA';
ELSIF p > 10.0 THEN s := 'ALTA';      // ← ELSIF: erro de compilação se escrever ELSEIF
ELSE s := 'NORMAL'; END_IF;

// CASE — state machines; SEMPRE com ELSE (estado de erro explícito)
CASE estado OF
  0: IF iniciar THEN estado := 1; END_IF;     // aguardando
  1: executar(); IF ok THEN estado := 2; END_IF;
  ELSE: estado := 99;   // proteção contra corrupção de memória
END_CASE;

FOR i := 0 TO 9 DO ... END_FOR;        // BY 5 / DOWNTO / EXIT / CONTINUE
WHILE c < 100 AND NOT erro DO ... END_WHILE;   // testa ANTES
REPEAT ... UNTIL pronto END_REPEAT;            // testa DEPOIS (termina quando TRUE!)
RETURN;   // sai do bloco — use após validação para evitar aninhamento profundo
```

Detalhes, loops e armadilhas: `referencias/funcoes-core.md`.

---

## 5. REGRAS CRÍTICAS — NUNCA VIOLAR

> 💡 **Para times não técnicos:** são as regras de ouro do SCL Siemens. Violar
> qualquer uma causa erro de compilação ou comportamento imprevisível na máquina.

```scl
// R1 — PARÂMETROS NOMEADOS SEMPRE (:= entra, => sai)
// POR QUÊ: o compilador exige o nome de cada parâmetro. Sem isso, não compila.
resultado := LIMIT(MN := 0, IN := valor, MX := 100);   // ✅
// resultado := LIMIT(0, valor, 100);                  // ❌ erro de compilação

// R2 — TIMER/CONTADOR/TRIGGER em VAR, NUNCA em VAR_TEMP
// POR QUÊ: VAR_TEMP é apagada a cada ~10ms; um timer ali nunca completa o tempo.
VAR  t : TON; END_VAR     // ✅      VAR_TEMP t : TON; END_VAR   // ❌ Q nunca fica TRUE

// R3 — ELSIF, nunca ELSEIF (ver seção 4).

// R4 — := para entrada, => para saída de FB (ver R1).

// R5 — STATE MACHINE com CASE OF, nunca IF-ELSIF longo (ver seção 4).

// R6 — NUNCA comparar Real com "=" — use tolerância
// POR QUÊ: 0.1+0.2 em binário não é exatamente 0.3; "=" pode nunca ser TRUE.
IF ABS(IN := temperatura - 25.0) < 0.1 THEN ligaAr(); END_IF;   // ✅
// IF temperatura = 25.0 THEN ...                               // ❌ pode nunca disparar

// R7 — VALIDE antes de SQRT e antes de dividir (evita STOP da CPU)
IF entrada >= 0.0 THEN r := SQRT(IN := entrada); ELSE r := 0.0; erro := TRUE; END_IF;
IF denom <> 0 THEN q := TO_REAL(num) / TO_REAL(denom); ELSE q := 0.0; erro := TRUE; END_IF;

// R8 — DIVISÃO inteira trunca — converta para Real quando o resultado é decimal
media := TO_REAL(soma) / TO_REAL(count);   // ✅ 5/2 = 2.5     soma/count → 2 ❌

// R9 — STRINGS concatenam com CONCAT(), nunca com "+"
msg := CONCAT(IN1 := 'Valv_', IN2 := codigo);   // ✅   'a' + 'b' ❌ não existe em SCL
```

A lista completa de 20 anti-patterns (com a correção e o porquê de cada): `referencias/anti-patterns.md`.

---

## 6. TEMPLATES COMENTADOS

> 💡 Estes três templates (FC, FB e DB) são o ponto de partida. Repare na densidade
> de comentários — é exatamente esse o padrão exigido (seção 3).

### Template FC — Função Pura (sem memória)
```scl
FUNCTION "fc10_NomeDaFuncao" : Real
{ S7_Optimized_Access := 'TRUE' }
// ============================================================
// fc10_NomeDaFuncao
// O QUÊ FAZ : [propósito em 1 linha]
// POR QUÊ FC: não guarda nada entre ciclos — recebe, calcula e devolve.
// Autor: Reginaldo Lobo  ·  Versão: 0.1  ·  Projeto: [nome]
// ============================================================
VERSION : 0.1

VAR_INPUT
  iValor : Real;   // Valor a processar [unidade]
  iCount : Int;    // Quantidade de amostras (1..N)
END_VAR
VAR_TEMP
  // Temporárias: existem só durante esta chamada. Nunca timers/triggers aqui!
  tSoma  : Real;   // acumulador local
  tIndex : Int;    // índice do loop
END_VAR

BEGIN
  // ── VALIDAÇÃO DE ENTRADA ───────────────────────────────────
  // POR QUÊ: entrada inválida causaria divisão por zero. Validar e sair cedo.
  IF iCount <= 0 THEN
    #fc10_NomeDaFuncao := 0.0;
    RETURN;                       // sai imediatamente — resto do código fica limpo
  END_IF;

  // ── LÓGICA PRINCIPAL ───────────────────────────────────────
  tSoma := 0.0;
  FOR tIndex := 0 TO iCount - 1 DO
    tSoma := tSoma + iValor;
  END_FOR;

  // ── RETORNO ────────────────────────────────────────────────
  // POR QUÊ TO_REAL: soma/count em Int truncaria (5/2=2). Queremos 2.5.
  #fc10_NomeDaFuncao := tSoma / TO_REAL(iCount);
END_FUNCTION
```

### Template FB — State Machine (com memória)
```scl
FUNCTION_BLOCK "fb10_NomeDoBloco"
{ S7_Optimized_Access := 'TRUE' }
// ============================================================
// fb10_NomeDoBloco
// O QUÊ FAZ : [propósito em 1 linha]
// POR QUÊ FB: precisa lembrar o estado atual entre ciclos.
// ESTADOS: 0=Idle  1=Iniciando  2=Executando  3=Finalizando  99=Erro
// Autor: Reginaldo Lobo  ·  Versão: 0.1  ·  Projeto: [nome]
// ============================================================
VERSION : 0.1

VAR_INPUT
  iStart    : Bool;   // comando de início (a borda de subida é que conta)
  iStop     : Bool;   // comando de parada (nível alto = parar)
  iSetpoint : Real;   // referência [unidade]
  iReset    : Bool;   // reset de erro — volta ao Idle
END_VAR
VAR_OUTPUT
  oRodando    : Bool;  // TRUE = em operação
  oCompleto   : Bool;  // TRUE = ciclo concluído com sucesso
  oErro       : Bool;  // TRUE = falha ativa
  oDiagEstado : Int;   // estado atual, exposto para diagnóstico no HMI
END_VAR
VAR
  // ── MEMÓRIA DE ESTADO (por isto é FB) ──
  _estado     : Int;
  // ── TIMERS — OBRIGATÓRIO em VAR (ver R2) ──
  _tonInicio  : TON;   // espera no estado Iniciando
  // ── DETECÇÃO DE BORDA — OBRIGATÓRIO em VAR ──
  // POR QUÊ R_TRIG: captura o MOMENTO do clique. Sem ele, um botão segurado
  // por 1s dispararia a ação ~100 vezes (uma por ciclo de 10ms).
  _trigStart  : R_TRIG;
  _trigStop   : R_TRIG;
END_VAR

BEGIN
  // 1. BORDAS — sempre primeiro, para capturá-las antes de qualquer lógica
  _trigStart(CLK := iStart);
  _trigStop (CLK := iStop);

  // 2. RESET GLOBAL — prioridade máxima; RETURN encerra o ciclo aqui
  IF iReset THEN
    _estado := 0; oRodando := FALSE; oCompleto := FALSE; oErro := FALSE;
    _tonInicio(IN := FALSE, PT := T#0ms);
    RETURN;
  END_IF;

  // 3. STATE MACHINE — CASE é mais rápido e legível que IF-ELSIF longo
  CASE _estado OF
    0:  // IDLE — aguardando o operador
      oRodando := FALSE; oCompleto := FALSE;
      IF _trigStart.Q AND NOT iStop THEN _estado := 1; END_IF;
    1:  // INICIANDO — espera de estabilização (pressurizar/aquecer)
      _tonInicio(IN := TRUE, PT := T#2s);
      oRodando := TRUE;
      IF _tonInicio.Q THEN _estado := 2; END_IF;
      IF _trigStop.Q THEN _estado := 0; END_IF;
    2:  // EXECUTANDO — operação normal
      oRodando := TRUE;
      // LIMIT protege contra setpoint absurdo vindo do HMI
      _tonInicio(IN := FALSE, PT := T#0ms);
      IF _trigStop.Q THEN _estado := 3; END_IF;
    3:  // FINALIZANDO — encerramento seguro
      oRodando := FALSE; oCompleto := TRUE; _estado := 0;
    99: // ERRO — só sai com iReset (tratado acima)
      oRodando := FALSE; oErro := TRUE;
    ELSE:
      _estado := 99;   // estado desconhecido → vai para erro
  END_CASE;

  // 4. DIAGNÓSTICO — sempre por último: expõe o estado para Watch Table/HMI
  oDiagEstado := _estado;
END_FUNCTION_BLOCK
```

### Template DB — Bloco de Dados Global (estrutura padrão da empresa)
Estrutura obrigatória do DB (ver skill padrao-comentarios-scl, seção 12): TITLE, atributo,
AUTHOR, VERSION, NON_RETAIN, cabeçalho `////` depois do NON_RETAIN, STRUCT sem comentários
de seção, BEGIN vazio. Texto ASCII, membros em camelCase.
```scl
DATA_BLOCK "db10_Producao"
TITLE = db10_Producao (DB10)
{ S7_Optimized_Access := 'TRUE' }
AUTHOR : 'Reginaldo Lobo'
VERSION : 0.1
NON_RETAIN
////====================================
//// db10_Producao (DB10)
//// O QUE FAZ : guarda dados de producao compartilhados entre blocos e HMI.
//// POR QUE DB GLOBAL : substitui as antigas marcas M, e simbolico e portavel.
//// ESCRITOR UNICO : FB de producao. Tela e demais blocos apenas leem.
//// Autor: Reginaldo Lobo  -  Versao: 0.1  -  Projeto: [nome]
////=====================================
   STRUCT 
      pecasOk : DInt;   // Pecas aprovadas no turno (acumulado)
      pecasNok : DInt;   // Pecas reprovadas no turno
      tempoCiclo : Int;   // Tempo do ultimo ciclo do OB1 [ms]
      receitaAtiva : Int;   // Indice da receita em producao, 1 a N
      linhaParada : Bool;   // TRUE = linha em parada (qualquer causa)
      codFalha : Int;   // 0 = sem falha; outros = codigo especifico
   END_STRUCT;


BEGIN

END_DATA_BLOCK
```


---

## 7. CHECKLIST RELÂMPAGO (antes de entregar SCL)

- [ ] Parâmetros nomeados (`:=` / `=>`) em todas as funções nativas
- [ ] Timer/Contador/Trigger em `VAR` (nunca `VAR_TEMP`)
- [ ] `ELSIF` (não `ELSEIF`)  ·  `CASE` com `ELSE`
- [ ] Funções nativas usadas (LIMIT, MIN/MAX, NORM_X/SCALE_X, MOVE_BLK, CONCAT…)
- [ ] `R_TRIG`/`F_TRIG` para bordas  ·  Float comparado com tolerância (`ABS`)
- [ ] `TO_REAL` antes de divisão decimal  ·  `SQRT`/divisão validadas
- [ ] FC para sem-estado, FB para com-estado
- [ ] **Comentários ricos** em todo FB/FC/OB (cabeçalho, seção, variável, "POR QUÊ") — seção 3
- [ ] **DB** no formato padrão (TITLE, AUTHOR, cabeçalho `////` após NON_RETAIN, sem seções no STRUCT)
- [ ] **Nome do bloco** em `fcNN_` / `fbNN_` / `dbNN_` + descrição, autor `Reginaldo Lobo`
- [ ] Sem números mágicos (usar `VAR CONSTANT`)

Checklist de entrega de projeto completo (OBs de erro, PID em OB cíclico, Safety,
Force desativado…): `referencias/kickstart-e-arquitetura.md` e `referencias/safety.md`.

---

**SIEMENS_S7_ENGENHARIA · v2.1 · Reginaldo Lobo · PT-BR**
Funde e amplia SIEMENS_S7_MASTER v1.0 + START DE PROJETO (SIEMENS_S7_BLOCO).