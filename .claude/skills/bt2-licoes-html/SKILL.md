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
- **Animação de atividade (pulso) só quando algo mudou de verdade**: ruído de medição, contadores de tempo e a primeira foto não contam; não muda tamanho nem posição; respeita "reduzir movimento". Estado nunca só por cor: símbolo de forma junto.
