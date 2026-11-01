# MAPA_FBS v0.10 — mudanças sobre a v0.9 (29/10/2026)
**Pedido:** "interligações ainda estão ruins, não podem ter contato com os cards, faz igual circuito de placa eletrônica".
- **Ligações como trilhas de placa:** o fio só anda (1) nos **canais verticais** entre colunas, (2) numa **pista horizontal abaixo dos blocos** e (3) no pequeno trecho que liga o canal ao pino. Ângulos retos com cantos a 45°. **Nunca passa por cima de cartão.**
- Fios entre colunas vizinhas usam só o canal; os demais descem por um canal, correm na pista e sobem por outro. Cada fio tem **trilha própria** no canal (x) e **pista própria** (y).
- Rótulo do fio aceso: no meio do trecho mais longo; se vertical, o texto gira e cabe no canal. Passar o mouse sobre um fio mostra "origem (pino) → destino (pino)".
- A altura do diagrama cresce o necessário para as pistas (`nLong × 10 px`).
- Dados, pinos e lista **FIOS** inalterados. Mantém: ícone "i", clique no cartão acende/apaga, "Apagar destaques".
- Traz a **Dica de interface** (`dica_ui_v0.1.js`).
**Teste (Playwright):** 13 fios; varredura ponto a ponto de cada fio (a cada 3 px) → **0 pontos dentro de qualquer cartão**; 3 blocos acesos sem erros. **Limite:** onde 2 trilhas se cruzam (canal × pista) o cruzamento é simples, sem "ponte"; com muitos fios no mesmo canal as trilhas ficam a ~11 px.
