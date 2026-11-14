# Botão direito (menu de contexto) no medidor — análise (03/11/2026)

**Dá para implementar?** Sim. Hoje o medidor **não usa** o evento `contextmenu` (0 ocorrências): o botão direito abre o menu padrão do navegador. Um menu próprio é só HTML/JS no mesmo arquivo, sem mudar PLC nem Node-RED. Eu consigo testar com Playwright (o clique direito e o toque longo são simuláveis).

## Ponto crítico: o operador usa o celular
No celular não existe botão direito. O equivalente é o **toque longo** (~500 ms) no mesmo elemento. Regra de projeto: **toda ação do menu também precisa ter caminho sem ele** (hoje já existe, pelos botões e popups). O menu é atalho, nunca o único caminho. Também precisa abrir por teclado (tecla de menu / Shift+F10) para acessibilidade.

## Onde aproveitar (valor × risco)
| # | Onde | Itens do menu | Valor | Risco |
|---|---|---|---|---|
| 1 | **Chave (tile) do card Cargas** | Habilitar/Desabilitar · Abrir Setup desta chave · Troca de resistência · Ver histórico (acionamentos/horas) · Copiar kW real | Alto: hoje isso exige abrir 2–3 popups e escolher a chave de novo | Baixo para itens de consulta; **Ligar/Desligar nunca no menu** (comando de risco só pelo clique normal, com as travas) |
| 2 | **Cabeçalho do banco (BC56…BC550)** | Marcar/desmarcar no Patamar · Seletora/Ligar banco · Abrir Detalhes · Ver log só deste banco | Alto com 4 bancos | Baixo; "Ligar banco" já tem trava |
| 3 | **Linha/célula do Registro do ensaio** | Salvar esta etapa · Copiar valor · Ver amostras da etapa | Médio | Baixo |
| 4 | **Cartão de patamar (30/50/100/107)** | Manual/Auto · Sugerir para este patamar · Aplicar | Médio | Médio (Aplicar comanda chaves: manter a mesma confirmação) |
| 5 | **Gráfico / log** | Copiar linha · Exportar trecho · Marcar evento | Médio | Baixo |
| 6 | **Chip de comunicação (DSE, PLC, ET200)** | Ver detalhe do erro · Copiar diagnóstico · Abrir 🧪 Cards x flow | Alto para suporte | Baixo |

## O que NÃO fazer
- Comando de chave/banco/gerador (ligar, desligar, parar) dentro do menu de contexto: um toque longo sem querer não pode acionar carga.
- Substituir o menu padrão do navegador em campos de texto (colar/copiar) — manter o padrão nos inputs.
- Itens diferentes do botão direito em cada tela sem padrão: usar o mesmo estilo (janela leve, itens curtos, ✕ ou toque fora fecha).

## Como seria (técnica)
1. Um único componente `MenuCtx` no medidor: recebe a lista de itens do elemento (`data-ctx="chave"`, `"banco"`, `"etapa"`…) e posiciona o menu dentro da viewport (nunca fora da tela, como o ✕ das janelas na 1.10.161).
2. Abre por `contextmenu` (mouse), toque longo (celular, cancelando se o dedo mexer, para não atrapalhar a rolagem) e Shift+F10 (teclado).
3. Fecha com Esc, toque fora, ou rolagem. Layout estável: o menu flutua; não muda a posição de nada.
4. Cada item chama a mesma função que o botão equivalente já chama (sem lógica nova de comando).
5. Testes: Playwright em 390/360/1280 px (abrir, fechar, itens, não sair da tela) + garantia de que nenhum item comanda chave.

## Esforço e recomendação
- Primeira versão (componente + menu da **chave** + do **banco** + do **chip de comunicação**): pequena a média; cabe numa versão 1.10.164.
- Recomendo começar pelos itens 1, 2 e 6 (mais valor, só consulta/atalho de popup), depois medir com o operador se o toque longo atrapalha a rolagem no celular antes de espalhar para o resto.

## Não verificado
Não testei ainda em celular real nem em iOS/Safari (toque longo e menu nativo de imagem/link se comportam diferente).
