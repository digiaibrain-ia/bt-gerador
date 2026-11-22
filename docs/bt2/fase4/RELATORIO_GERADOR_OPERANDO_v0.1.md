# Relatorio - "gerador operando" com o DSE real (medidor 1.10.173) - v0.1 - 06/11/2026

## Condicoes confirmadas pelo Reginaldo (DSE real ligado e motor rodando)
Modo MANUAL; LED MANUAL ligado; LED STOP desligado; LED AUTO desligado; LED TESTE sem dado. Ele autorizou usar tambem as grandezas (rotacao e tensoes) como condicao.

## Regra nova (medidor 1.10.173; a 1.10.172 nao foi tocada; gerador `dashboard/gerador/gerar_medidor_v1.10.173_v0.1.py`)
"Operando" = (LED MANUAL ou `geradorDisponivel`) **E** rotacao >= 1400 rpm **E** tensao media das 3 fases >= 100 V, **quando esses valores existem** na leitura. Sem rotacao/tensao, vale so o LED (como antes).
Motor parado com o DSE em Manual: "parado" (rpm <= 50) ou "partindo" (50 a 1400 rpm, ou ainda sem tensao).
Por que: o LED MANUAL diz o MODO do controlador, nao que o motor gira (duvida desde a v1.9.21).

## Provas
`tests/integracao/fase4/f_gerador_operando.test.js`: 6/6 passam na 1.10.173; 3 dos 6 falham na 1.10.172 (motor parado, partindo, sem tensao). Regressao do front (f10, f11, s1, s3, A3, B, C, D, Setup, genInfo): **60/60 passam**. `tests/e2e/alertas_falhas.js`: 0 falhas. `tests/e2e/modo_operador.js`: 1 falha ("secao Referencias lista o indice - 0 itens"), **igual na 1.10.167 e na 1.10.172** (nao e regressao).

## Limites
- Limiares (1400 rpm e 100 V) sao uma escolha minha para 60 Hz/4 polos; o caso real (1869 rpm, ~382 V) passa. Se o DSE usar outra rotacao nominal, ajustar.
- **O PLC nao mudou:** o `FB100` continua usando `db2000.ledManual` como "gerador operando" (BaseOK/kW sem carga). Mudar isso e uma versao nova do `FB100`, so com o seu OK e backup.
- O Setup que falhou em salvar na 167 tem outra causa provavel: o fluxo "Ler gerador (.156, local)" comeca DESLIGADO a cada Deploy e o DB2000 fica sem atualizar. Clicar em "AUTOMATICO" e conferir `ledManual`/`potenciaKw` no DB2000 e o proximo passo.
