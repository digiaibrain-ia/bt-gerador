# Menu ☰ v0.2 · Janelas v0.3 · Gráfico v0.10 · Medidor 1.10.118 (30/10/2026)

## Menu ☰ (menu_dev_v0.2.js)
- **Atualizar:** o navegador não lista pastas; o botão testa (HEAD) os próximos números de versão de cada arquivo do catálogo (patch +1…+8, minor +1, major +1) e lembra o mais novo em `localStorage 'medidor.dev.menu.arq'`. O clique no menu abre esse arquivo. **Esquecer** apaga a memória.
- Limite: só acha versões "próximas" ao nome do catálogo. Para listar a pasta de verdade seria preciso uma rota nova no Node-RED (a decidir).
- Botões Popup/Analisar e Mapa em janela (medidor 1.10.118) abrem o arquivo real; a cópia embutida (EMB) é só reserva.
- Arquivos em `C:\Users\b02raf\.node-red\public\html`: `catalogo_ferramentas_v0.1.js` + `menu_dev_v0.2.js` ao lado do medidor.

## Janelas v0.3 (janelas_v0.3.js)
- O balão do ⤢ não fecha mais ao clicar fora (✕, Esc ou ⤢). Atualiza a cada 200 ms (largura, altura, x, y). x/y editáveis.
- Soltar o mouse depois de mover grava `{x,y}` em `localStorage 'bt2.jan.<app>.<id>'`; a janela nasce ali. Restaurar apaga z/w/h/x/y.
- Usado por: medidor e gráfico (os únicos com o módulo inline).

## Gráfico v0.10
- Topo compacto (barra, leituras, condições, legenda), tabela de estatísticas mais baixa; desenho ~50 % mais alto. Olhos de observador no cabeçalho.

## Medidor 1.10.118
- Ícone do DSE simulado = senoide ideal (vermelha/pontilhada quando há condição reprovada).
