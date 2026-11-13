# Plano de design — medidor inteiro (v0.1)

Feito com a skill `frontend-design` (plano -> revisão -> construção -> crítica).
`taste-skill`: só o README público foi lido; NÃO instalada (hook executa código).
`transitions.dev`: site inacessível pela rede da sessão; usei CSS próprio com a mesma regra
(só animar o que mostra uma mudança, e respeitar "reduzir movimento").

## Assunto, público, trabalho principal
Console de bancada para ensaio de gerador diesel. Operador 35+, celular na mão, perto de máquina barulhenta.
Trabalho principal: **saber se a carga está no alvo da etapa, e o que fazer agora** (ligar/desligar chave).

## Cores (as do medidor, sem inventar paleta)
- Tinta `#1a4a78` (barra, ação principal) · Laranja `#ec7000` (alvo, seleção)
- Fundo `#f3f5f8` / escuro `#16171a` · Verde/amarelo/vermelho = SÓ sinal de estado

## Tipo
Uma família do sistema (Bahnschrift/Segoe/system-ui), números tabulares. Base 18 px, mínimo 16 px.
Frases com inicial maiúscula (sem caixa-alta de rótulo), peso 700 só no que importa.

## Layout
Celular: uma coluna na ordem de decisão — Etapa (+ régua de carga) → Banco de chaves → Instrumentos → Gráfico → Registro.
Notebook: 3 colunas (Etapa | Instrumentos | Banco), gráfico largo embaixo.
Alinhamento: tudo à esquerda; números à direita, tabulares.

## A única coisa memorável (onde gastei a ousadia)
1. **Régua de carga** com o alvo da etapa marcado — é o que o operador olha o tempo todo.
2. **Chaves como disjuntores de verdade**: alavanca em cima = ligada, embaixo = desligada,
   no MEIO = desarmou (falha). É o que o operador já conhece do quadro.
Todo o resto fica quieto: um quadro de instrumentos de linhas finas em vez de 10 cartões iguais.

## Movimento (liberado, mas industrial)
Só onde MOSTRA o que mudou ou pede ação:
- alavanca da chave desliza (0,18 s) + anel que some em 1,4 s = "esta mudou agora";
- barra de carga acompanha o valor (0,5 s), para ver a direção;
- lâmpada pulsa SÓ quando é preciso ajustar a carga;
- aviso de confirmação surge (0,15 s).
Nunca: números ao vivo, fundo, entrada de seção, efeito de passar o mouse.
Botão "Animações" desliga tudo; "reduzir movimento" do aparelho também.

## Revisão contra o brief (o que mudei no plano)
- Primeira ideia: 9 cartões iguais com cantos redondos e sombra -> trocado por UM quadro de linhas finas (cara de painel).
- Primeira ideia: rótulos em caixa-alta acima de cada bloco -> removidos (frase normal).
- Primeira ideia: estado só por cor -> palavra + símbolo + posição da alavanca.
