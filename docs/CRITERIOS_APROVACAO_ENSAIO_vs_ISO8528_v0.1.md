# Critérios de aprovação do ensaio × ISO 8528 / ISO 3046 · v0.1 · 24/10/2026

**Escopo:** só a seção "CONDIÇÕES DE APROVAÇÃO" do relatório (botão gerar relatório do `medidor_gerador_v1.9.76.html`). Os "dados de ensaio" (tabela) estão fora deste documento — o usuário já os corrige no HTML.
**Status:** comparação de análise. **Nada foi alterado no HTML.** Os valores da ISO vêm de fontes secundárias (fabricantes); **não tenho o texto oficial da ISO 8528/3046** — confirmar na edição da norma usada pela fábrica.

## 1. O que está implementado (confirmado)
`gerarPdf()` e `avaliaEnsaio()` — `medidor_gerador_v1.9.76.html`, linhas ~1896–1960. O relatório avalia hoje **3 condições**:

| # | Texto no relatório | Cálculo |
|---|---|---|
| 1 | `Tempo em carga 100% maior ou igual a ${T100_MIN/60} minutos.` | `t100 >= T100_MIN` (r1) |
| 2 | `Tensão: desvio máximo de ${TENS_TOL}% acima do valor nominal (limite … V).` | `vmax > DADOS.tensao·(1+TENS_TOL/100)` → REPROVADO (r2) |
| 3 | `Tensão: desvio mínimo de ${TENS_TOL}% abaixo do valor nominal (limite … V).` | `vmin < DADOS.tensao·(1−TENS_TOL/100)` → REPROVADO (r3) |

`TENS_TOL` é configurável (campo "Desvio máx. tensão (± %)"). Sem `DADOS.tensao` informada o resultado fica PENDENTE. **Não há condição de Frequência nem de Potência Stand-by.**

## 2. O que o print novo mostra (versão que "está valendo", segundo o usuário)
1. Tempo em carga 100% ≥ 5 minutos.
2. Tensão: desvio máximo de 2,5% acima do nominal.
3. Tensão: desvio mínimo de 2,5% abaixo do nominal.
4. Frequência: desvio máximo de 5% acima do valor nominal.
5. Frequência: desvio máximo de 5% acima do valor nominal — **texto repetido**; pelo padrão da tensão, a linha 5 deveria ser "abaixo" (**a confirmar com o usuário**).
6. Potência em Stand-by (110%): mínimo 107% da carga aplicada.

Linhas 4, 5 e 6 **não existem** no HTML v1.9.76.

## 3. Comparação com a ISO 8528-5 (limites em regime permanente por classe)
Fonte secundária: Avtron, *Testing Diesel Gen-sets to ISO8528*.

| Critério | Relatório (print) | G1 | G2 | G3 |
|---|---|---|---|---|
| Desvio de tensão em regime permanente | **2,5%** | 5% | **2,5%** | 1% |
| Faixa de frequência em regime permanente | **5%** | 2,5% | 1,5% | 0,5% |

- **Tensão 2,5% = classe G2** (confere).
- **Frequência 5% não bate com G1, G2 nem G3** — o mais próximo é G1 (2,5%). Origem do 5% a confirmar.
- **Tempo ≥ 5 min em 100% e Stand-by 110% / mínimo 107%:** não encontrei esses números nas fontes consultadas. Parecem critério interno ou de procedimento de ensaio; **não afirmar que são texto literal da ISO** sem confirmação.

## 4. Pendências
**(b) Inferido**
- "RPM" ligado à condição de frequência no print (setas da imagem) é interpretação minha da imagem; a frequência em Hz é outra grandeza.
- A linha 6 ("mínimo 107%") pode significar: ao comandar 110%, a carga real aplicada precisa chegar a pelo menos 107% (tolerância de −3 pontos). Não confirmado.

**(c) A confirmar com a engenharia da fábrica (o usuário vai perguntar)**
1. Origem do 5% de frequência (norma? procedimento interno?) e se são "acima e abaixo".
2. Significado de **DPP** (aparece no texto da Observação do relatório).
3. Origem dos 5 min em 100% e dos 107% / 110%.
4. Classe de desempenho exigida (G1/G2/G3) e edição da ISO usada.

**(c) A desenvolver — só com autorização do usuário**
- Condições de Frequência e Potência Stand-by no `gerarPdf()` e na janela "Resultado do ensaio" (linhas ~4090), no padrão `r1/r2/r3` → `r4…`.
- Corrigir o texto duplicado da frequência.
- Ver se `DADOS.freq` (já impressa no cabeçalho, linha ~1931) ganha tolerância configurável como `TENS_TOL`.

## Glossário (contexto)
- **Classe G1/G2/G3 (ISO 8528-5):** nível de qualidade da energia; quanto maior o número, mais apertada a tolerância.
- **Standby power:** potência de emergência, com sobrecarga permitida por tempo limitado.
- **Regime permanente:** condição estável, depois do transitório de carga.

## Fontes
- [Testing Diesel Gen-sets to ISO8528 — Avtron](https://avtronpower.com/resources/articles/testing-diesel-gen-sets-to-iso8528/)
- [Understanding ISO8528 G3 Generator Set Performance Class — AGG Power](https://www.aggpower.com/news/understanding-iso8528-g3-generator-set-performance-class/)
