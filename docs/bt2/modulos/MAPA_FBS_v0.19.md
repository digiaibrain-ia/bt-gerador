# MAPA_FBS v0.19 — área do diagrama no celular (14/11/2026) · medidor 1.10.209

**Pedido (Reginaldo):** "a área de visualização no celular dos FB é pequena, tem pouca altura".
**Medido na 1.10.208 (painel do mapa, DEMO):** o DIAGRAMA tinha **142 px (17 % da tela)** em 390x844, **60 px (8 %)** em 360x740 e **134 px (34 %)** deitado em 844x390. O resto da altura era: título do painel em 2 linhas (84 px), cabeçalho do mapa em 3 linhas (173 px), faixa Gerador/Banco/Carga em 3 linhas (148 px) e legenda em 4 linhas (178 px). Além disso o iframe tinha altura fixa de 76vh e o zoom inicial travava em 40 % (ajuste pela largura), deixando o diagrama pequeno.

## O que mudou
**Mapa v0.19** (gerador `dashboard/gerador/gerar_mapa_fbs_v0.19_v0.1.py`, de v0.18), só em tela pequena (largura ≤ 760 px **ou** altura ≤ 520 px; o PC não muda):
- Título do mapa escondido (o painel já tem o título); botões de modo curtos ("sem DSE", "com DSE", "Automático"); pílula só com o estado da mãe ("EXECUTANDO"; o verde já diz que é ao vivo); o botão ⓘ sobe para a 1ª linha. Cabeçalho em 2 linhas.
- Faixa Gerador/Banco/Carga vira **uma linha de resumo** ("G 50,0 kW · Banco 50,0→50,0 kW · Carga 50,0 %") com o botão ▸/▾ para abrir o detalhe.
- **Legenda vai para o ⓘ** (painel suspenso; fecha com ✕, Esc ou toque fora): regra do projeto, texto longo não fica na tela.
- **Zoom:** "Ajustar" e o zoom inicial passam a ajustar pela **altura**, no máximo 60 % (sem o limite, em 100 % só cabia uma coluna e se perdia a visão geral).

**Medidor 1.10.209** (gerador `gerar_medidor_v1.10.209_v0.1.py`, de 1.10.208): mapa embutido v0.19; em tela pequena o painel do mapa ocupa a tela (menos a folga de 4 px por lado do módulo de janelas, LL-020), a barra de título fica em **uma linha** (o botão Janela própria vira só ↗) e o iframe usa todo o espaço que sobra.

## Resultado medido (antes → depois, diagrama / altura da tela)
| Tela | 1.10.208 | 1.10.209 |
|---|---|---|
| celular 390x844 | 142 px · 17 % | **639 px · 76 %** |
| celular 360x740 | 60 px · 8 % | **491 px · 66 %** |
| celular deitado 844x390 | 134 px · 34 % | **230 px · 59 %** |

## Testes
- `node tests/e2e/mapa_fbs_celular.js` (49): fração da tela que o diagrama ocupa (≥ 60 % em 390x844, ≥ 55 % em 360x740, ≥ 45 % deitado), cabeçalho curto, faixa em uma linha e ▸ abre/fecha, legenda no ⓘ (✕, Esc e toque fora), zoom ajustado pela altura (40 a 60 %) e diagrama inteiro cabendo, sem rolagem lateral da página, alvos de toque ≥ 34 px, e **o PC (1536x800) não muda**. Contra a v0.18 o teste falha (47 %, legenda de 156 px).
- `node tests/e2e/mapa_fbs_no_medidor.js` (28): mapa embutido é a versão mais nova da pasta; no celular o painel ocupa a tela, título em uma linha, iframe ≥ 90 % da altura e diagrama ≥ 60 %; no PC o painel é como antes (iframe 76vh, "Janela própria" com texto).
- `node tests/e2e/mapa_fbs_aura.js` na v0.19 (46) e `dados_ensaio_ns.js` na 1.10.209 (84): sem regressão.

## Limites
- O zoom inicial de 60 % mostra cerca de duas colunas de blocos de cada vez e o diagrama inteiro na altura; sobra espaço vazio embaixo no celular em pé. Se preferir maior (mais texto legível, menos visão geral), o teto é um número no gerador (v0.20).
- Só o painel do mapa foi tratado; outras janelas do medidor no celular não foram medidas.
- Medido no navegador de teste (Chromium com emulação de celular), não no aparelho do Reginaldo.
