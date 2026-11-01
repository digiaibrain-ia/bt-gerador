# FICHA DO BANCO — TENSÕES POR BANCO — v0.1
Medidor v1.10.108 · módulo `ficha_banco_v0.1.js` · 29/10/2026

## 1. Problema (dito pelo operador)
Fisicamente o **BC56 atende 220, 380 e 440 V** e o **BC400 só 220 e 380 V**. Até a v1.10.107 existia uma lista única `TENS_V=[220,380,440]` para os dois: o BC400 oferecia 440 V sem existir. (No BT1 os dois bancos de 500 e 550 kVA atendem os três — ainda sem automação, fora do escopo.)

## 2. O que mudou
| Onde | Mudança |
|---|---|
| `BANCOS` (medidor) | campo novo `tensoes` por banco: BC56 `[220,380,440]`, BC400 `[220,380]`. Sem o campo = atende todas. |
| Setup › Chaveamento do banco | botão de tensão que o banco não tem fica **desabilitado** (mesmo tamanho, esmaecido) com balão explicando; selo de erro se já houver chaveamento guardado que o banco não tem; `tensSet` também recusa. |
| Patamar Guiado › Bancos | **elegibilidade** pela tensão do gerador (`DADOS.tensao`, "Dados do ensaio"): banco que não atende fica desabilitado "(não atende 440 V)", não entra na sugestão nem no comando; nota "Gerador em 440 V — atendem: BC56." |
| Sugerir/Aplicar | se nenhum banco marcado atende, mensagem diz quais atendem. |

## 3. Regras
- Tensão do gerador só restringe se for **exatamente 220, 380 ou 440** (ASSUMIDO). Outra (ex. 400) = sem restrição e a tela avisa.
- A marcação do operador (G.usa) é preservada: ao voltar a tensão, o banco volta como estava.
- Se o retrofit passar o BC400 para 440 V: acrescentar `440` em `tensoes` do BC400 (uma linha).
- Quando a 1200 dos bancos existir, a ficha passa a vir do banco (ele informa o que atende).

## 4. Não mudou
DB152/DB160 (continuam com 3 espaços de tensão; o de 440 V do BC400 fica "não disponível"), rotas e flows Node-RED, PLC.

## 5. Testado (Playwright, Demo)
Ficha lida (`56:220/380/440`, `400:220/380`); Setup do BC400 com 440 V desabilitado e do BC56 com os três; Patamar com 440 V: BC400 "[dis]" + nota; só BC400 marcado em 440 V → mensagem "Atendem: BC56 — marque-o."; ensaio completo em 220 V sem regressão (1 PDF automático, 6 etapas).

## 6. Pendente
Confirmar com a engenharia as tensões reais de cada banco após o retrofit; sem feedback hoje (operador informou só 220/380 para o BC400 no BT2).
