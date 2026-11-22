---
name: bt2-licoes-html
description: Licoes aprendidas do projeto BT2 sobre os HTML (medidor, janelas, celular/tablet, armazenamento, copia, zoom, Ajuda). Use ao criar ou revisar qualquer HTML do projeto.
---

# Lições BT2 — HTML / medidor
Fonte: `docs/licoes/REGISTRO_LICOES_v0.1.md` (LL-020 a LL-029) e `docs/licoes/INVENTARIO_DEMO_X_REAL_v0.1.md`.

## Regras
- **Janela sempre inteira na tela**; título e ✕ nunca fora. Todo diálogo novo liga o próprio ✕. LL-020/021
- Elemento posicionado dentro de `body` com zoom (tela ≥ 2400 px) **compensa o zoom**. LL-022
- **Nunca dizer "copiado" sem poder provar**; o campo temporário da cópia nasce dentro do popup modal; mostrar o texto na tela e oferecer Compartilhar. LL-023
- **Todo acesso a storage em try/catch**; a tela funciona sem storage (arquivo aberto de Downloads/WebView). LL-024
- Controle que recarrega a página (`location.reload`) não entra em teste automático. LL-025
- **Recurso que precisa de teclado (Alt+I) não vale em aparelho de toque.** LL-026
- Elemento vazio não ocupa lugar nem captura clique. LL-027
- Alvos de toque: mínimo só em `pointer:coarse`; 44 px não aplicado por decisão do Reginaldo. LL-028
- Para teste longo no celular, preferir página servida pelo Node-RED (arquivo de Downloads não recarrega). LL-029
- Bifurcação Demo × Real: ler o inventário antes de mexer no Setup, chaves, INICIAR/STOP e leitura dos bancos. LL-040
- Mudança = versão nova gerada por script em `dashboard/gerador/`; Ajuda e comentários em PT-BR.
- Balão/dica = "última camada": fora do fluxo (`position:fixed`/popover), nunca `::after` absoluto dentro de card; texto selecionável. LL-046
- Toda tela: passar o mouse/focar NÃO muda posição nem tamanho de nada; testar em 1536×694 (notebook do Reginaldo). LL-047
- "Em curso" é calculado (iniciado e não gravado), nunca uma flag solta; depois de gravar nada fica travado. LL-048
- **Texto longo não fica na tela: vira janela suspensa (popover) com o ícone ⓘ.** Na tela só um resumo curto; detalhe, avisos e exemplos no painel (fecha com ✕, Esc ou clique fora). LL-056
- **Número de série/identificação: normalizar no servidor** (Ø→0, sem `*`/espaços, maiúsculas) e decodificar só o que a norma define. Exemplos de teste e de tela: só os da norma. LL-057/058
- **Ferramenta embutida no medidor (gráfico, mapa): ao mudar o arquivo, o medidor sai em versão nova com a cópia embutida atualizada**; teste compara a cópia com a versão mais nova da pasta. LL-059
- **Destaque de bloco ativo = auréola de fundo que respira sem zerar (40–90 %), nunca pisca** (o anel que acende e apaga foi rejeitado). Se a tela recria o desenho a cada atualização, a fase da animação vem do relógio (senão reinicia a cada foto). Não muda tamanho nem posição; respeita "reduzir movimento". Estado nunca só por cor: símbolo de forma junto. LL-060
- **Tela pequena: o conteúdo principal ocupa >= 55-60 % da altura** (título, botões e legenda de apoio em 1-2 linhas; o resto vai para o ⓘ). Medir a fração da tela antes e depois em 390x844, 360x740 e deitado 844x390; o PC não pode mudar. Painéis do medidor respeitam a folga de 4 px por lado do módulo de janelas. LL-061
- **Tela que gera relatório tem o menu Exportar ▾ padrão** (EXPO). PDF/impressão é um resumo para ler (tabelas curtas), nunca despeja JSON/log bruto; dado bruto vai para .md/.csv/.json. Teste mede as páginas do PDF com volume realista (milhares de eventos). LL-062
- **Alarme novo declara modo, escopo e causa-raiz.** Vale so no modo certo (Demo local = sem PLC), so para banco em uso, e some se a causa maior ja esta ativa (COM-002 cobre COM-001/CHV-006/COM-003). Seguranca (CHV-005/007/008, COM-005) nunca e suprimida; na duvida, em uso. Teste cria a propria ocorrencia, nao depende de alarme falso. LL-063
- **Pausa entre degraus de carga e do MOTOR, nao do clique:** guarde o instante do ultimo degrau no modulo (nao dentro do Aplicar), senao duplo clique fura a pausa. Em gerador a gas nao use 'liga antes, desliga depois' (a sobreposicao e um degrau extra). LL-066

