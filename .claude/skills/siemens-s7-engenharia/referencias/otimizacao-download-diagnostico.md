# Blocos Otimizados, Download Seguro e Diagnóstico

> 💡 **Para times não técnicos:** baixar um programa para um CLP em produção pode
> parar a máquina se feito errado. Esta referência cobre como organizar os blocos
> (otimizados), como fazer o download com segurança e como diagnosticar problemas.

## 1. Blocos otimizados × não-otimizados (TIA Portal)

| Característica | Não-Otimizado | **Otimizado** |
|---|---|---|
| Acesso | simbólico E absoluto (DB1.DBW4) | **só simbólico** |
| Retentividade | todo o DB ou nada | **tag por tag** |
| Tamanho máx (S7-1500) | 64 kB | **até 16 MB** |
| Download sem reinicializar | ❌ | ✅ |
| Performance | menor | **máxima** |
| Compatível com S7-300/400 | ✅ (necessário) | ❌ |

```scl
{ S7_Optimized_Access := 'TRUE' }   // padrão p/ projetos novos
{ S7_Optimized_Access := 'FALSE' }  // só quando precisar de acesso absoluto (ex.: PUT/GET)
```
> ⚠ Nunca misture otimizado e não-otimizado na mesma cadeia de chamada — o sistema
> copia dados para converter, com penalidade de performance.
> DBs de instância herdam a configuração do FB pai automaticamente.

**VARIANT × ANY:** no TIA Portal use `VARIANT` (tipado, erro detectado com código
claro). O `ANY` (10 bytes, não tipado) só em legado. `TypeOf(#var)` detecta o tipo
em runtime; nunca use VARIANT dentro de FOR/WHILE (lento — anti-pattern AP19).

## 2. Fluxo de download seguro

```
1. COMPILE ALL   → garante consistência de todos os blocos. Erros aqui = não prosseguir.
2. COMPARE       → (Online × Offline) veja o que mudou ANTES de baixar qualquer coisa.
3. DOWNLOAD SELETIVO → baixe só os blocos alterados; não afeta blocos em operação.
4. ONLINE CHANGE → só blocos otimizados (S7-1200 FW V4.0+/S7-1500). CPU fica em RUN.
                    Funciona: adicionar tags, mudar lógica.
                    NÃO funciona: alterar VAR_INPUT/VAR_OUTPUT → exige STOP.

REGRAS CRÍTICAS:
❌ NUNCA baixar OB1 vazio "para testar" — zera as saídas → parada imediata!
❌ NUNCA fazer download sem compilar antes.
✅ CPU foi a STOP no download → consulte o Diagnostic Buffer ANTES de qualquer ação.
✅ Reserve memória p/ Online Change (padrão 100 bytes, máx 2 MB — configure antes).
✅ Faça backup do programa atual antes.
```

## 3. Diagnostic Buffer

```
Onde: STEP 7 → Module Information → Diagnostic Buffer
      TIA Portal → Online & Diagnostics → Diagnostic buffer
→ Leia em ordem cronológica inversa — o TOPO é o que causou o STOP.
Mostra: código e descrição do erro, timestamp e endereço do bloco que falhou.
```

## 4. Watch Table (VAT)

```
MODIFY: escreve uma vez (o programa pode sobrescrever no ciclo seguinte).
FORCE : mantém o valor permanentemente — ⚠ DESATIVE após o teste!
S7-300: Force só em I, Q, PQ  ·  S7-400: também em M.
```

## 5. Tabela de diagnóstico — sintoma → causa → solução

| Sintoma | Causa provável | Solução |
|---|---|---|
| Timer nunca dispara (Q nunca TRUE) | timer em VAR_TEMP | mover para VAR (AP5) |
| Dado errado após mudar endereço | acesso absoluto hardcoded | migrar p/ simbólico |
| CPU STOP "ciclo excedido" | OB80 ausente / lógica pesada no OB1 | adicionar OB80; mover p/ OB35 |
| HMI não atualiza após mudar PLC | acesso absoluto no HMI | usar simbólico (Reference ID) |
| Dados sobrescritos misteriosamente | mistura otimizado/não-otimizado | uniformizar tipo de acesso |
| VARIANT lento em loop | VARIANT dentro de FOR | mover p/ fora do loop (AP19) |
| IDB com campos errados | FB alterado sem recompilar | Compile All → Download |
| Perda de dados após queda de energia | tag não Retain | configurar {Retain} |
| Contagem dupla no CTU | pulso duplo por varredura | FB com trava de confirmação (AP18) |
| String corrompida | concatenação com + | usar CONCAT() (AP6) |
| Média sempre errada | divisão inteira Int÷Int | TO_REAL() antes (AP9) |
| SQRT causa STOP | entrada negativa | validar >= 0.0 (AP15) |
| Estado desconhecido na state machine | ELSE ausente no CASE | adicionar ELSE: estado := 99 |
| PID oscila no OB1 | ciclo variável | mover p/ OB35 com CYCLE fixo |
| GET/PUT não funciona | permissão desabilitada | habilitar PUT/GET na CPU remota |
| Download causa STOP | interface do FB alterada | CPU precisa ir a STOP p/ atualizar IDB |
| Saída não responde | Force ativo na VAT | verificar e desativar Force |
| CPU STOP inesperado | OB de erro não carregado | carregar OB82/85/86/121/122 |
