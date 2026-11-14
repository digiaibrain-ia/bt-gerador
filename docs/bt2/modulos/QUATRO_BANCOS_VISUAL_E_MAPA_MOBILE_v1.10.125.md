# Medidor 1.10.125 + Mapa v0.14 — 4 bancos (visual) e mapa no celular (31/10/2026)
## Estratégia (análise)
- A. Pôr BC59,5/BC550 em `BANCOS` agora — REJEITADA: `BANCOS` alimenta o polling `/api/chaves/{id}`, o Patamar Guiado (sugeriria chaves sem PLC), o rodízio, o Setup e as somas de kW; ~53 literais '56'/'400' no código.
- B. Camada visual separada — ESCOLHIDA: lista própria só desenhada (`#bancosVis`), sem clique, sem rota, sem DB. Zero efeito na lógica dos 2 bancos reais. Promoção para `BANCOS` só quando houver PLC/Node-RED.
- Ordem: 1) card Banco de Cargas (feito); 2) Placas (já tinha); 3) Setup e Troca de resistência (acordeão já pronto, falta listar os bancos); 4) Mapa (faixa Banco de cargas) e demais HTML.
## (a) Feito/testado
- Card Banco de Cargas: BC59,5 (18 chaves, 59,5 kW) e BC550 (12 chaves, 550 kW) como sub cards fechados, "só consulta". Chaves: BC59,5 = 5×5, 4×6, 3, 3, 2, 1, 0,5×3; BC550 = 5×5, 25, 50, 50, 100×4 (informadas pelo operador em 30/10).
- Mapa v0.14 (e embutido no medidor): no celular a faixa Gerador → Banco → Carga quebra em linhas e a barra de cima fica compacta; botões sem borda.
## (b) Assumido
- "Dashboard" = tela principal do medidor. Os 2 bancos novos só aparecem na tela principal por enquanto.
## (c) Pendente
- Setup/Troca/Mapa com 4 bancos; integração real (DBs, flows, ids); versões com 2 bancos mantidas: medidor 1.10.124 e mapa v0.13.
