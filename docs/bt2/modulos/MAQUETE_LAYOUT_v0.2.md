# Maquete de layout v0.2 (`maquete_layout_v0.2.html`)
Substitui a v0.1 (criada em outra conversa; não reaproveitada como arquivo, só como ideia). Sem lógica de PLC/Node-RED.

## (a) Implementado e testado (Playwright)
- Cards: Modo (novo), Etapas, Gráfico, Leitura das grandezas, Patamar, Banco de Cargas, Registro — nas posições do HTML real 1.10.130 (1536×694).
- Por card: ▾ recolher · ⇧ frente · 🔓/🔒 travar · 👁 ocultar · ↺ restaurar.
- Por caixinha (BC56, BC400, BC59,5, BC550; PLC/Node-RED/HTML no Modo): ▸/▾ abrir, ↑ ↓ reordenar.
- Barra: Layouts ▾ (A empilhado = atual, B lado a lado, C faixa no topo), grade magnética (4/8/16 px), alinhar às colunas, abrir/recolher tudo, mostrar medidas, Salvar/Restaurar (localStorage), Exportar ▾ (TXT copia para a área de transferência, MD, JSON, PDF).
## (b) Assumido
- "Caixinhas" = sub-cards do card (bancos) e caixinhas do Modo; "setinha" = recolher/abrir.
- O conteúdo dos blocos é só representativo.
## (c) Pendente
- Aplicar no HTML real o arranjo que você escolher (só o Patamar-card empilhado já foi aplicado na 1.10.130).
