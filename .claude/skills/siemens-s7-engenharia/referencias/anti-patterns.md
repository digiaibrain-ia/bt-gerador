# Anti-Patterns — 20 Erros Comuns

> 💡 **Para times não técnicos:** um *anti-pattern* é uma solução que parece certa
> mas causa problema. Esta tabela lista os 20 erros mais frequentes, a correção e
> — o mais importante — por que cada um importa.

| # | ❌ Errado | ✅ Correto | Por que importa |
|---|---|---|---|
| AP1 | IF manual para limitar faixa | `LIMIT()` | 3× mais eficiente, instrução única |
| AP2 | `prevSinal` manual para borda | `R_TRIG`/`F_TRIG` | não perde bordas em varredura rápida |
| AP3 | FOR para copiar array | `MOVE_BLK` | 10-20× mais rápido |
| AP4 | FOR para zerar array | `FILL_BLK` | 10-15× mais rápido |
| AP5 | Timer/Contador/Trig em `VAR_TEMP` | Em `VAR`/`VAR_STAT` | VAR_TEMP zera a cada ~10ms |
| AP6 | `str1 + str2` | `CONCAT()` | `+` não existe p/ string em SCL |
| AP7 | `IF valor = 25.0` (float) | `ABS(a-b) < tol` | IEEE 754: pode nunca ser TRUE |
| AP8 | Parâmetros posicionais | Nomeados `:=` `=>` | obrigatório — erro de compilação |
| AP9 | `media := soma / count` (Int) | `TO_REAL(soma)/TO_REAL(count)` | divisão inteira trunca |
| AP10 | `ELSEIF` | `ELSIF` | erro de sintaxe SCL |
| AP11 | Escrever no Output de FB externamente | controlar via Inputs | Output de FB é read-only fora |
| AP12 | IF-ELSIF longo p/ state machine | `CASE OF` com `ELSE` | legível e O(1) vs O(n) |
| AP13 | FOR p/ state machine | `CASE OF` com `ELSE` | estado de erro explícito |
| AP14 | IF manual p/ MIN/MAX | `MIN()`/`MAX()` | nativo até 32 entradas |
| AP15 | `SQRT` sem validar | validar `>= 0.0` antes | crash em runtime — para a CPU! |
| AP16 | Divisão sem checar denominador | `IF denom <> 0 THEN` | divisão por zero — crash! |
| AP17 | Comparar posição de eixo com `=` | janela `±tolerância` | IEEE 754 + vibração mecânica |
| AP18 | Pulso de contador sem trava | FB com confirmação de ciclo | varredura rápida gera pulso duplo |
| AP19 | VARIANT dentro de FOR/WHILE | resolver tipo fora do loop | VARIANT em loop é lento |
| AP20 | Marcas M para tudo | DBs globais simbólicos | portabilidade e acesso simbólico |

---

## Os mais críticos, em detalhe

### AP5 — Timer em VAR_TEMP (o mais comum e grave)
```scl
// ❌ Q NUNCA será TRUE: PT=5s, ciclo=10ms → o timer reseta 500× antes de completar.
VAR_TEMP meuTimer : TON; END_VAR
#meuTimer(IN := trigger, PT := T#5s);

// ✅ memória persistente — acumula corretamente entre ciclos
VAR meuTimer : TON; END_VAR
#meuTimer(IN := trigger, PT := T#5s);
IF #meuTimer.Q THEN acaoApos5s(); END_IF;
```

### AP15 + AP16 — operações sem validação (causam STOP da CPU)
```scl
// ❌ trava se entrada negativa ou denominador zero
resultado := SQRT(IN := entrada);
divisao   := numerador / denominador;

// ✅ protegido — sinaliza o erro para o operador investigar
IF entrada >= 0.0 THEN resultado := SQRT(IN := entrada);
ELSE resultado := 0.0; erroCalculo := TRUE; END_IF;

IF denominador <> 0 THEN divisao := TO_REAL(numerador) / TO_REAL(denominador);
ELSE divisao := 0.0; erroDivisao := TRUE; END_IF;
```

### AP18 — pulso duplo em contador industrial
```scl
// ❌ tranco mecânico ou ruído elétrico gera 2 pulsos → contagem errada
#ctu(CU := qualquerPulso, R := reset, PV := 25);

// ✅ um FB que só incrementa após confirmar:
//   1) o eixo estava parado na posição ANTES do pulso
//   2) o ciclo físico completou (avançou → inseriu → retornou)
// Encapsule essa trava num FB dedicado em vez de contar o pulso cru.
```

### AP7 / AP17 — comparar float ou posição com "="
```scl
// ❌ pode nunca disparar (e vibração mecânica piora)
IF posicao = 333.80 THEN dispararCamera(); END_IF;

// ✅ janela de tolerância
VAR CONSTANT TOL_POS : Real := 0.005; END_VAR   // ±5µm
IF ABS(IN := posicao - 333.80) < TOL_POS THEN dispararCamera(); END_IF;
```
