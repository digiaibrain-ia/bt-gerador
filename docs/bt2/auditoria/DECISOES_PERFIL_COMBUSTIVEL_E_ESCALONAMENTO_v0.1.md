# Decisões por pontuação — perfil de combustível (gás/biometano) e revisão do escalonamento · 17/11/2026 · medidor 1.10.220

**Contexto:** o Reginaldo saiu e pediu para decidir "por critério e avaliação técnica com pontuação". Cada decisão abaixo tem notas de 0 a 5 (5 = melhor) em critérios com peso. Valores de motor a gás são **ASSUMIDOS** (ordem de grandeza típica); **confirmar com o datasheet/curva de aceitação de carga do motor**.

## O problema (por que gás é diferente de diesel)
Diesel aceita degraus grandes de carga (a cremalheira entrega combustível na hora). Motor a gás — principalmente turboalimentado, e mais ainda com **biometano/biogás** (poder calorífico menor e variável) — responde devagar: ao receber um degrau grande a **rotação/frequência cai, a tensão cai e ele pode desarmar** por baixa rotação ou por detonação/empobrecimento da mistura. Por isso: degraus **menores**, **tempo de recuperação** entre eles, e **só dar o próximo degrau quando o motor recuperou** (frequência). A queda de carga também deve ser em degraus (rejeição brusca de 100 % pode causar sobrevelocidade/desarme).

## D1 — Como suportar gás/biometano (pesos: segurança 3, simplicidade p/ operador 3, reuso 2, testável 2, risco de regressão 2, esforço 1 = 13)
| Opção | Segurança | Simplicidade | Reuso | Testável | Risco regressão | Esforço | **Total /65** |
|---|---|---|---|---|---|---|---|
| A. Só presets nos parâmetros que já existem (passos, pausa) | 2 | 5 | 5 | 4 | 5 | 5 | 6+15+10+8+10+5 = **54** |
| **B. Presets + portão de recuperação (frequência) num FB filho novo, puro** | **5** | 4 | 4 | **5** | 4 | 3 | 15+12+8+10+8+3 = **56** |
| C. FB mãe reativo (sub-degraus dinâmicos conforme a frequência) | 5 | 2 | 2 | 3 | 2 | 1 | 15+6+4+6+4+1 = **36** |
**Escolhida: B.** A é mais simples mas não *vê* o motor (cego a uma queda de frequência); C é o mais "inteligente" porém complexo demais para o operador e para provar.

## D2 — Simplificar o escalonamento (pesos: operador consegue usar sem cálculo 4, risco 3, reuso de teste 2, esforço 1 = 10)
| Opção | Operador | Risco | Testes existentes | Esforço | **Total /50** |
|---|---|---|---|---|---|
| S1. **Manter o motor atual** e dar a ele um rosto simples: UM seletor "Combustível" (Diesel / Gás / Biometano) que escolhe tudo; o resto fica em "Ajustes avançados" | 5 | 5 | 5 | 5 | 20+15+10+5 = **50** |
| S2. Reescrever o algoritmo (degraus fixos por %) | 5 | 1 | 1 | 1 | 20+3+2+1 = **26** |
**Escolhida: S1.** O motor atual tem 8 parâmetros (ativo, liga antes, janela, pausa entre sub-degraus, sobreposição, peso de mudança, passos por trecho, degrau máx., pausa). Para o operador agora é: **escolher o combustível**. Diesel = comportamento de sempre (zero regressão: 132 testes de integração + os e2e).

## D3 — Valores dos perfis (ASSUMIDOS)
| Perfil | Degrau máx. | Pausa mín. entre degraus | Frequência mínima p/ liberar o próximo | Desiste após | Descida |
|---|---|---|---|---|---|
| Diesel | (atual) | (atual) | sem portão | — | tudo de uma vez (atual) |
| Gás natural | 25 pontos % | 10 s | 97 % da nominal (58,2 Hz em 60 Hz) | pausa + 60 s | 2 etapas (50 %) · pausa 10 s |
| Biometano / biogás | 20 pontos % | 15 s | 97,5 % (58,5 Hz) | pausa + 90 s | 4 etapas (25 %) · pausa 15 s |
Justificativa: motores a gás turboalimentados costumam aceitar uma fração de carga por degrau (da ordem de 20–30 % no primeiro) com recuperação de segundos; biogás/biometano, menor. **Isto é ordem de grandeza, não dado do fabricante.** Os números ficam em **um único lugar** (`PERFIS` em `fb_perfil_combustivel_v0.1.js`) para a engenharia ajustar.

## D4 — O que o portão mede (pesos: segurança 3, simples 3, disponível no DSE 2 = 8)
| Variável | Segurança | Simples | Disponível | **Total /40** |
|---|---|---|---|---|
| **Frequência (≈ rotação)** | 4 | 5 | 5 | 12+15+10 = **37** |
| Frequência + tensão | 5 | 3 | 5 | 15+9+10 = 34 |
| Rotação + pressão do coletor | 5 | 1 | 2 | 15+3+4 = 22 |
**Escolhida: frequência.** Falha segura: **sem leitura de frequência o portão não libera mais carga**; se não recuperar no limite, **desiste sem adicionar carga** (nunca insiste).

## D5 — "Liga antes, desliga depois" no gás
Esse modo (bom para diesel: a carga nunca cai) cria uma **sobreposição**: a carga passa por um valor *maior* que o do degrau (medido: 12 → 32 kW por 1 s num degrau de 8 kW). Num motor a gás isso **é um degrau extra**. **Decisão: no perfil gás/biometano, as chaves trocam no mesmo instante (sem sobreposição).** Achado pelo teste e corrigido.

## D6 — Descida
Queda **planejada** (etapa final de 0 %) desce em degraus nos perfis de gás. **Emergência** (DSE parou, limite de segurança, contator colado) continua **imediata** — segurança vem antes do conforto do motor. A mãe virtual v0.14 ganhou `descarrega()` opcional; sem ele, `derruba()` como sempre.

## O FB adicional: entradas e saídas (interface para o futuro SCL; número do bloco: **a definir na planilha de numeração**)
| Entradas | Saídas |
|---|---|
| combustível (perfil), de %, até %, kW a 100 %, tempo desde o último degrau (s), frequência medida e nominal (Hz), chaves comandadas (id, kW) | lista de sub-degraus (%), `libera` (bool), `desiste` (bool), motivo (texto), plano de descida (grupos de chaves + pausa) |
Funções puras (sem relógio, sem DOM): o chamador passa o tempo e as leituras. É exatamente o que vira FB no PLC.

## Revisão do escalonamento (o que ficou simples e o que ficou como era)
- **Para o operador:** 1 escolha (combustível) + o plano em linguagem simples já mostrado em Detalhes (sub-degraus e passos). Sem conta.
- **Sob o perfil gás/biometano o medidor ignora:** passos por trecho, janela, sobreposição, "liga antes", "ativo" e a pausa manual; usa os do perfil. Os ajustes avançados continuam valendo para diesel.
- **Persistência da pausa:** o relógio "último degrau que acrescentou carga" é do módulo: **clicar em Aplicar de novo (duplo clique) não fura a pausa** — achado do teste e corrigido.
- **Não mexi** no algoritmo de seleção (rodízio, banda do degrau do Patamar manual da 1.10.219): continua igual.

## Limites (honestos)
- Provado no **simulador** (Demo local, DSE simulado, chaves virtuais): sequência, pausas, portão por frequência (com gancho de teste `__perfilFreqOverride`), desistência e descida. **Não provado** com gerador a gás real nem com PLC real.
- Os valores dos perfis são assumidos; a engenharia deve confirmar com o datasheet.
- O portão e o perfil existem **só no medidor (HTML)**. O PLC e a API de chaves não limitam taxa de carga: um comando direto à API ou o operador clicando chave a chave no card pode ignorar o perfil → **BK-AUD-10** (limite de degrau no PLC; mesma interface acima).
