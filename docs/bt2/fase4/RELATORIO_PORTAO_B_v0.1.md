# Relatorio do Portao B (Fase 4) - v0.1 - 06/11/2026 - clique da chave que "nao entende mais" (BANC-3)

## Causa (o que esta provado e o que nao)
- Dado do Reginaldo: sem mensagem na tela e **o F5 destravava** -> o estado preso esta NA TELA, nao no PLC nem no fluxo.
- Em `medidor_gerador_v1.10.168`, o clique na chave tinha **dois retornos silenciosos**: (1) `CH_PEND` (chave "em envio") ignorava o clique sem avisar e sem limite de tempo; (2) `PATAMAR_PENDENTE` (Patamar manual esperando o Aplicar): o clique so edita a sugestao e nao comanda o PLC, tambem sem aviso.
- **Nao foi possivel provar qual dos dois ocorreu na bancada** (nao ha o log desse momento). Os dois somem com o F5, entao os dois sao candidatos; ambos foram tratados.

## Correcao (medidor 1.10.169; a 1.10.168 nao foi tocada; gerador `dashboard/gerador/gerar_medidor_v1.10.169_v0.1.py`)
1. Chave em envio: aviso "Comando anterior desta chave ainda em envio (N s). Aguarde." e, passados 12 s, o estado preso e solto e o clique segue.
2. Patamar manual pendente: aviso "o clique so edita a sugestao e NAO comanda o PLC. Aplique ou cancele o Patamar".
Nenhum comando novo vai ao PLC. `catalogo_ferramentas_v0.7.js` aponta para a 1.10.169.

## Provas
`tests/integracao/fase4/b_clique_travado.test.js` (Chromium + Node-RED de teste + PLC simulado): 4/4 passam na 1.10.169; **3 dos 4 falham na 1.10.168** (os tres casos do clique mudo/preso).
Limite: o estado preso foi simulado na pagina; a causa real na bancada nao foi reproduzida.

## Bancada
Ver o aviso ao clicar com o Patamar manual esperando o Aplicar; se o clique travar de novo, o aviso diz em qual dos dois estados esta. Se aparecer um terceiro caso, mandar a mensagem exata e o log.
