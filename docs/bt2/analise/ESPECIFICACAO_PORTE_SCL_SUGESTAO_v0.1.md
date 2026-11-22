# Porte da sugestão de chaves para SCL — especificação (03/11/2026)

Base: `dashboard/modulos-fonte/rodizio_chaves_v0.5.js`. Referência de comportamento: `tests/fb/vetores/sugere_vetores_v0.1.json` (35 casos entrada → saída). **Nada disto foi compilado nem rodado em PLC.**

## Ideia
Para cada banco, uma tabela `custo[s]` = menor custo para somar exatamente `s` unidades de 0,5 kW usando só chaves habilitadas. Depois as tabelas dos bancos são combinadas em árvore (A+B, C+D, depois os dois), cortando tudo acima do teto (menor entre o alvo e o limite de capacidade). No fim escolhe-se a soma com menor erro e, em empate de erro, menor custo.

- **Custo de uma chave** = desgaste normalizado (se ligada) + 0,01 × (mudou de estado). Aditivo por chave, por isso a tabela é exata.
- **Unidade:** kW × 2 como inteiro (`DInt`). kW fora da grade de 0,5 kW **não** é suportado no PLC (o JavaScript tem um caminho de reserva só para o navegador).

## Tamanhos fixos (sugestão)
| Item | Valor |
|---|---|
| Chaves por banco | até 32 (mesmo limite do FB102) |
| Soma máxima por banco | 1 200 unidades (600 kW) — ajustar à maior potência futura |
| Teto de combinação | 2 400 unidades (1 200 kW) |
| Tabela por banco | `Array[0..1200] of Real` (custo) + 1 bit de "alcançável" |
| Escolha das chaves | `Array[0..1200] of DWord` por chave processada (reconstrução) ou lista de decisões por soma |
| Laços | por chave (≤32) × por soma (≤1201): ≈ 38 mil passos por banco |

Custo de CPU estimado: 4 bancos × 38 mil passos ≈ 150 mil iterações simples. No S7-1500 isso cabe em poucos ms, mas **só se calcula sob demanda** (clique em Sugerir ou mudança de etapa), nunca todo ciclo. Medir no PLCSIM Advanced antes de aceitar.

## Pseudocódigo por banco
```
custo[0] := 0; demais := INF
PARA cada chave j habilitada (peso w, custoLigada cOn, custoDesligada cOff):
    PARA s := S DOWNTO 0:                       // de trás para frente = 1 passada por chave, sem copiar a tabela
        SE custo[s] < INF:
            novo := custo[s] + cOn
            SE s + w <= S E novo < custo[s + w]: custo[s + w] := novo; pega[j][s + w] := 1
```
Atenção: o JavaScript usa duas tabelas (anterior/próxima) para somar `cOff` em todas as somas; no SCL, como `cOff` é constante por chave, some-o em um acumulador `fixo` e use só `cOn − cOff` na tabela (equivalente).

## Combinação de dois bancos
`out[a+b] := mínimo(out[a+b], A[a] + B[b])` para `a + b ≤ teto`: dois laços aninhados (≤ 1201 × 1201 ≈ 1,4 milhão de passos por combinação no pior caso). Reduzir limitando o teto ao alvo do patamar (tipicamente < 400 unidades) e guardando só as somas alcançáveis. **Esse é o ponto que mais precisa de medição.**

## Regras que o SCL precisa respeitar (cópia dos testes)
1. Nunca ligar chave desabilitada.
2. Nunca passar do alvo (modo "abaixo") nem do limite de capacidade; sem limite configurado a **guarda** bloqueia (a sugestão só respeita o alvo).
3. Entrada inválida (alvo negativo/NaN) → nada ligado + aviso, sem parar o ciclo.
4. Determinismo: mesma entrada, mesma saída. Em empate de custo qualquer seleção de mesmo custo é aceita; comparar `total`, `erro` e custo.
5. Resultado idêntico ao JavaScript nos 35 vetores (total e erro).

## FB mãe (máquina de estados) — pré-requisitos para portar
- Tolerância de confirmação = min(0,5 kW; metade da menor chave habilitada).
- Rearme explícito após FALHA; nunca automático; só com DSE ok.
- Assinatura de parâmetros inclui o conjunto de chaves habilitadas.
- Temporizadores por TON e ciclo conhecido (os testes usam relógio simulado de 1 s).
- Separar o núcleo (função pura estado+entradas → estado+saídas) da publicação (hoje `localStorage`/`BroadcastChannel`).
