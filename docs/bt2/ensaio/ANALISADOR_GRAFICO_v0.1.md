# Analisador de gráfico do ensaio — v0.1

**Arquivos:** `modulos/analisador_grafico_v0.1.js` (módulo único) · usado em `medidor_gerador_v1.9.79.html` (botão **📈 Analisar** no card do gráfico) e `amostras_simulador_v0.4.html` (aba **Análise (zoom)**).
**Natureza:** somente leitura. Não comanda chave, não escreve no PLC, não altera aprovação do ensaio.

## 1. Para que serve (leitura para equipes não técnicas)

Mostra o ensaio **ao longo do tempo**, em faixas empilhadas com o mesmo eixo de tempo. Quem opera consegue:
aproximar e afastar, andar pelo tempo, ler todos os valores de um instante, marcar dois instantes (A e B) e ver a diferença, e ver **quanto do tempo cada grandeza ficou dentro da tolerância**.

## 2. O que existe × o que foi assumido × o que falta (regra 4 do projeto)

| | Item |
|---|---|
| **(a) Implementado e testado em navegador (Playwright, dados sintéticos e simulador)** | Módulo, popup no medidor, aba no simulador, zoom (roda/botões/teclado/pinça), mover, zoom de área, ir para etapa, cursor, marcadores A/B, estatística por janela, "ao vivo", legenda clicável, PNG, tema claro/escuro (medidor) |
| **(b) Assumido** | Tolerâncias desenhadas = as que o medidor já usa (`TOL`, `TENS_TOL`, `FREQ_TOL`) e o nominal de "Dados do ensaio" (`DADOS.tensao`, `DADOS.freq`). A tensão nominal comparada é a de **linha** (média de L1-L2, L2-L3, L3-L1), como o relatório do medidor já faz. A frequência nominal do simulador é 60 Hz (como no código dele) |
| **(c) Falta** | Teste com ensaio real no BT2 (só dados sintéticos e simulação); confirmar com a engenharia os valores de tolerância (as divergências com a ISO ficam para discussão, conforme combinado em 27/10/2026) |

## 3. Dicionário de dados (formato que o hospedeiro entrega)

`dados()` devolve:

| Campo | Tipo | Significado | Origem no medidor | Origem no simulador |
|---|---|---|---|---|
| `tMax` | s | fim do eixo "tudo" | `max(60, fim do plano de `geom()`, C.t)` | `max(60, RUN.pl.t)` |
| `etapas[]` | `{t0,t1,rotulo}` | degraus do roteiro | `geom()` + `ETAPAS[i].alvo` | `RUN.seg` |
| `faixasX[]` | `{t0,t1,cor,rotulo}` | sombreado vertical (ajuste/estabilização/pausa) | estados `C.pts[].s` (1 e 2) | não usa |
| `marcos[]` | `{t,rotulo}` | riscos verticais | não usa | `RUN.man` (manobras de chave) |
| `tracks[]` | faixas | ver abaixo | ver §5 | ver §5 |
| `infoExtra(t)` | função | texto extra no cursor | etapa e estado do cronômetro | etapa e estado do controlador |

Cada **track**: `id, titulo, unidade, dec, peso, y:{fixo|spanMin}, bandas[], linhasH[], series[]`.
Cada **serie**: `id, nome, cor (texto ou {claro,escuro}), tipo ('linha'|'pontos'|'degrau'), largura, dados[[t,valor|null]], faixa{lo,hi}, ocultaInicial`.

## 4. Lógica de transformação (o "porquê")

| Passo | O que faz | Por quê |
|---|---|---|
| Faixas empilhadas, eixo X comum | Carga, desvio, tensão, frequência... uma sobre a outra | comparar causa e efeito no mesmo instante sem misturar unidades |
| Eixo Y automático por faixa | Ajusta à janela visível (incluindo os limites) | um desvio pequeno de tensão não some ao lado de uma carga de 0–120 % |
| "Foco nos dados" (clique no título da faixa) | Ignora os limites no eixo Y | quando a tolerância é bem maior que a oscilação real, para ver o detalhe |
| Decimação min/máx por coluna de pixel | Mantém primeiro, mínimo, máximo e último de cada coluna | milhares de pontos sem lentidão e **sem apagar picos** (um pico pode ser a falha) |
| Tolerância como faixa sombreada | Retângulo entre limite inferior e superior | fora da faixa é visível de longe |
| Estatística por janela | n, mín, média, máx, desvio-padrão, % dentro da faixa | enxergar o desvio sem abrir planilha. O % é **por amostra** (amostras em ritmo quase constante), simples de explicar |
| Marcadores A/B | 1º clique = A, 2º = B, 3º recomeça | medir diferença entre dois instantes sem adivinhar |
| "Ao vivo" | Se o fim está visível, a janela acompanha o fim | operador mantém o zoom escolhido e continua vendo o presente |
| Limite de taxa (250 ms) | Redesenha no máximo 4×/s | dado chega a cada ≈0,4 s; mais que isso só gasta processador |

## 5. Faixas por aplicação

**Medidor (v1.9.79):** Carga (medida × perfil planejado, com faixa ±`TOL`) · Desvio da carga (medida − alvo; duas séries: todas as leituras e só "cronômetro contando") · Tensão média (+ L1-L2/L2-L3/L3-L1 ocultas, faixa ±`TENS_TOL` **só se** `DADOS.tensao` informado) · Frequência (faixa ±`FREQ_TOL` **só se** `DADOS.freq` informado) · kW do DSE.
**Simulador (v0.4):** Carga (lida, filtrada, alvo, faixa da etapa) · Desvio (lida/filtrada − alvo) · Tensão · Frequência · Chaves fechadas (feedback).

## 6. Instruções de uso

| Ação | Como |
|---|---|
| Aproximar/afastar no tempo | Roda do mouse, botões **＋ －**, teclas `+` `-`, pinça no celular |
| Zoom vertical de uma faixa | `Shift` + roda sobre a faixa |
| Mover | Arrastar (modo **Mover**), setas ← → |
| Zoom de área | Botão **Zoom de área** e arrastar, ou `Shift` + arrastar |
| Ir para uma etapa | **◀ Etapa**, **Etapa ▶** ou a lista "Ir para a etapa" |
| Medir | Clique = **A**, outro clique = **B**; a tabela mostra valor em A, em B e B − A, e estatística entre A e B |
| Foco nos dados | Clique no título da faixa |
| Ajustar tudo | Botão **Ajustar tudo**, tecla `Home` ou duplo clique |
| Ocultar série | Clique no nome na legenda |
| Exportar | **⬇ PNG** (sempre em tema claro, para impressão) |

**Como testar:** abrir o medidor em modo Demo, iniciar um ensaio, clicar **📈 Analisar**; ou rodar uma simulação no `amostras_simulador_v0.4.html` e abrir a aba **Análise (zoom)**. Conferir: a tabela muda ao aproximar; A/B mostram diferença; "Ao vivo" acompanha o fim.

**Riscos/dependências:** nenhuma dependência externa (funciona offline). Só lê `C.pts`, `ETAPAS`, `TOL`, `TENS_TOL`, `FREQ_TOL`, `DADOS` (medidor) e `RUN` (simulador). Se um desses nomes mudar numa versão futura, só o **adaptador** de cada HTML precisa ser ajustado; o módulo não muda.

## 7. Padrão de comentários (mandatório para todo código do projeto)

1. **Cabeçalho do arquivo:** para que serve (em linguagem de equipe não técnica), o que lê, o que **não** faz.
2. **Cada função:** uma linha dizendo **o que** faz e, em seguida, o **porquê** (a razão operacional, não a sintaxe).
3. **Constantes e limites:** de onde vêm (arquivo/parâmetro de origem) ou "ASSUMIDO — a confirmar".
4. **Nada presumido em dado técnico:** tag, endereço, registrador, DB ou rota sem fonte citada é proibido (regra 3 do projeto).
5. **Português do Brasil**, sem jargão desnecessário; sigla só com significado ao lado na primeira vez.
6. **Código modular:** uma responsabilidade por função; dados na entrada, resultado na saída; adaptador separado do módulo.
7. Todo código novo acompanha um `.md` com dicionário de dados, lógica de transformação, instruções e este padrão.

## Glossário

- **Desvio:** diferença entre o valor medido e o alvo.
- **Tolerância / faixa:** limite aceito acima e abaixo do alvo ou do nominal.
- **Decimação:** reduzir a quantidade de pontos desenhados sem esconder picos.
- **Adaptador:** trecho pequeno que traduz os dados de um programa para o formato do módulo.
- **Desvio-padrão:** medida de quanto o valor oscila em torno da média.
