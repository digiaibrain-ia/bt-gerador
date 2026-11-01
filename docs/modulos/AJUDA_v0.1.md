# AJUDA v0.1 — botão e janela de ajuda padrão (29/10/2026)
**Arquivo:** `modulos/ajuda_v0.1.js`. **Regra do operador:** *toda HTML tem que vir com AJUDA.*
- Colado em: mapa_fbs_v0.11, gerenciador_logs_v1.6, api_cards_visor_v0.3, index.html v0.2. (Medidor, gráfico e amostras já tinham a Ajuda própria.)
- Uso: `AJUDA.inicia({titulo, resumo, secoes:[{t, l:[...]}], glossario:[[termo, def]], onde:'seletor'})`. Sem `onde` (ou não achado) o botão fica fixo no canto superior direito.
- Janela não modal (`dialog.show()`), ✕ no canto direito, Esc fecha, redimensiona pelo canto. Toda ajuda traz a seção "Dica de interface (Alt+I)".
- Não lê PLC/Node-RED, não envia nada.
- **Regra para HTML novo:** nasce com `AJUDA.inicia` (ou Ajuda própria) preenchida: para que serve, como usar, glossário.
- Teste (Playwright): botão abre, Esc fecha, sem erros nas 4 páginas.
