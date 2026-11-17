# Medidor 1.10.123 — chaveamento sinalizado pelos Dados do ensaio (30/10/2026)
Fonte da tensão: campo "Tensão (V)" (`dTens`) de Dados do ensaio, preenchido pelo modelo de gerador escolhido.
- (a) Feito/testado no Demo local: ao abrir o Setup, se o chaveamento está "não informado" e `dTens` ∈ {220,380,440} (e o banco atende), o chaveamento é marcado sozinho. Divergência entre Dados e chaveamento ativo → chip vermelho de ATENÇÃO.
- (b) Decidido: no modo PLC o HTML NÃO grava a tensão sozinho; só mostra a dica no chip.
- (c) Pendente: comportamento com DSE real (tensão vem do controlador; botões só indicadores).
- Placa BC550: série "18 1308" (espaço no lugar do caractere ilegível).
- Regra permanente: botões sem borda (tom acima do fundo) a aplicar nas próximas revisões dos outros HTML.
