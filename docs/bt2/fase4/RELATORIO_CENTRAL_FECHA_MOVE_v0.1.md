# Relatorio - Central de registros nao fechava nem se movia (medidor 1.10.174) - v0.1 - 06/11/2026

## O que aconteceu (evidencia: log do Reginaldo `bt2_logs_20261106_194246.md`)
O ✕ de `dlgCentral` foi clicado dezenas de vezes (17:15 a 17:19) e **nunca** apareceu "fechou popup dlgCentral"; nos outros dialogos todo ✕ e seguido de "fechou popup". A janela tambem nao se movia.

## Causa
O ✕ (`[data-fecha]`) e o arrastar da barra de titulo sao ligados **uma unica vez, quando a pagina carrega**, somente nos `<dialog class="jan">` que ja existem. O modulo da Central (1.10.171 a 1.10.173) **criava o dialogo na primeira abertura**, depois dessa ligacao: ficava sem ✕ e sem arrastar.

## Por que meus testes nao pegaram
O teste da Central fechava o dialogo por codigo (`d.close()`), nao com o clique no ✕, e nao arrastava a janela. Falha minha de cobertura.

## Correcao (medidor 1.10.174; a 1.10.173 nao foi tocada; gerador `dashboard/gerador/gerar_medidor_v1.10.174_v0.1.py`; modulo `central_registros_v0.2.js`)
O dialogo da Central passou a estar **no HTML**, como os demais, e o modulo usa o existente (se faltar, cria e liga o ✕ na hora). Agora: fecha pelo ✕, arrasta pela barra de titulo, Esc fecha, e o log registra "fechou popup dlgCentral".

## Provas
`tests/integracao/fase4/g_janelas_fecha_move.test.js` (mouse real: arrasta pela barra e clica no ✕, em **21 janelas**, incluindo a Central, mais reabrir 3 vezes e Esc): 22/22 passam na 1.10.174; na 1.10.173 **falham 2** (a Central). Regressao do front (f10, f11, s1, s3, A3, B, C, D, Setup, genInfo, janelas): **82/82 passam**.
Varredura anterior (101 botoes, 167 x 172): so diferiam os 2 botoes novos.

## Limites (honestos)
- Cobri o que consegui simular: janelas abrindo/fechando/movendo, clique de botoes, colar imagem, menu do botao direito, catalogo, estado salvo de uma versao anterior. **Nao reproduzi** os problemas do navegador normal (catalogo, colar, ✕ do Pacote): funcionam no InPrivate e nos meus testes; o suspeito e extensao do navegador.
- `dlgDados` e `dlgChSetup` ficaram de fora da varredura de janelas porque o meu jeito de abri-los (direto) nao e o do uso real; os cliques reais deles aparecem fechando no log do operador.
