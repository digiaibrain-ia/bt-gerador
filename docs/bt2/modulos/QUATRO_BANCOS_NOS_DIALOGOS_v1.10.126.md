# Quatro bancos nos diálogos — medidor v1.10.126

Resumo: BC59,5 e BC550 (só consulta) agora aparecem, quando marcados em "Usar neste ensaio" no card Banco de Cargas, nas abas dos diálogos Chaves (Habilitar/Desabilitar e Setup), na Troca de resistência e no aviso do Patamar Guiado. Toda a lógica operacional continua só com BC56 e BC400.

## (a) Implementado e testado (Playwright, sem erros de página)
- Seletor `input[data-uso]` em cada banco de consulta; escolha guardada em `localStorage['medidor.bancosUso.v1']`.
- Abas extras (`button[data-cons]`) nos dois diálogos Chaves; ao clicar mostra painel somente leitura com as chaves nominais (kW) e total; voltar a uma aba de banco integrado restaura a grade normal.
- Troca de resistência: sub card fechado por banco de consulta (sem registro de troca, não há DB de desgaste).
- Patamar Guiado: aviso de que esses bancos não entram nas sugestões nem nos comandos.
- Mensagem de confirmação ao marcar/desmarcar.
- Arquitetura: camada de DESENHO (MutationObserver idempotente) sobre os diálogos; não toca BANCOS, CH, DIS, KWR nem rotas. Lista exposta em `window.BCONS` / `window.bancosUso()`.

## (b) Assumido
- Kw por chave de BC59,5 e BC550 conforme informado pelo operador em 30/10/2026 (ver v1.10.125).
- Padrão: nenhum banco de consulta marcado (geradores de baixa/média potência não mudam).

## (c) Ainda por fazer
- Mapa dos FBs (v0.14): faixa "Banco de cargas" ainda genérica, sem os 4 bancos.
- Exportações/PDF/Resultado (laços de impressão) ainda listam só BC56/BC400.
- Ficha de banco (tensões por banco) e Logs sem os bancos de consulta.
- Promoção a banco integrado (BANCOS) só quando houver PLC/Node-RED; aí generalizar os literais '56'/'400'.

## Como testar
Abrir a página, marcar "Usar neste ensaio" em BC550, abrir ⚙ Chaves → aba BC550; abrir 🔧 Troca de resistência → sub card BC550; recarregar e conferir que a marcação persiste.

## Versões mantidas
medidor 1.10.124 (última com 2 bancos) e mapa v0.13.
