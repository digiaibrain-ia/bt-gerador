# Relatorio do Portao C (Fase 4) - v0.1 - 06/11/2026 - medidor 1.10.170

Arquivo novo: `dashboard/ferramentas/medidor_gerador_v1.10.170.html` (gerador `dashboard/gerador/gerar_medidor_v1.10.170_v0.1.py`; a 1.10.169 nao foi tocada). `catalogo_ferramentas_v0.7.js` aponta para a 1.10.170.

## O que mudou
| Item | O que a tela faz agora |
|---|---|
| C1 animacao | Triangulo do card (e o icone dos botoes Alertas/Falhas) pulsa devagar: vermelho para FALHA ativa, ambar mais fraco para alerta. Para com "reduzir movimento" do sistema. |
| C2 troubleshooter | Cada linha de "Alertas e Falhas" ganhou **"▸ Roteiro"**: **Efeito** (sintoma) -> **Causa** (com teste rapido) -> **Solucao** (passos marcados "No PC / Node-RED", "Na tela" ou "Depende de bancada/TI"). Botao **Copiar diagnostico** (para colar no chat). Cobre 17 codigos. |
| C3 legenda | Botao **"ⓘ Legenda"**: formato `T-AAA-NNN`, areas (COM, DSE, CHV, ENS, SIS) e todos os codigos do catalogo (gerada do mesmo catalogo). |
| C4 Cards x flow | Abria atras do Demo (o Demo e modal; o Cards x flow era janela comum). Agora tambem e modal e abre por cima. Reproduzido antes de corrigir. |
| C5 DSE-001 | Distingue "API fora" de "API no ar (HTTP 503), mas o Modbus do DSE nao conecta (status ...; ultimo erro ...)". Usa o `diag` que o `/api/gerador` ja devolve no 503. Sem mudar o fluxo do servidor. |
| C7 lacuna de teste | Medidor com o PLC do banco (ET200) sem comunicacao: COM-005 aparece, o clique nao comanda o PLC e mostra mensagem. |
| C6 tabela | **Nao feito**: o Reginaldo vai mandar o print da tela com as duas potencias na mesma linha (os valores da `TAB60` ja conferem com a foto). A busca ja funciona. |

## Provas
`tests/integracao/fase4/c_medidor_troubleshooter.test.js`: 6/6 passam na 1.10.170 e **0/6 na 1.10.169**. Regressao do front (f10, f11, s1, s3, A3, B, C): **43/43 passam**; `tests/e2e/alertas_falhas.js` (desktop e celular): 0 falhas.

## Limites (honestos)
- O **texto das causas e solucoes e a v0.1**, escrito a partir dos casos da bancada e dos fluxos: **precisa da validacao do Reginaldo** (a tela avisa isso no painel). O teste prova que o painel funciona, nao que o texto esta certo.
- A tela so orienta; nao comanda PLC, DSE ou chaves.
- Para `DSE-001` com Modbus: depende de o servidor Deep Sea devolver `diag` no 503 (a v3_7 devolve).
- Os testes de animacao conferem a regra CSS aplicada (nome da animacao e "reduzir movimento"), nao a aparencia a olho.
