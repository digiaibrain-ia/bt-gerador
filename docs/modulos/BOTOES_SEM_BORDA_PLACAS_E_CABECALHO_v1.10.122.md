# Medidor 1.10.122 — cabeçalho limpo, botões sem borda, placas dos bancos (30/10/2026)

## Resumo
Atende ao pedido das 22:30: cabeçalho enxuto, tema por ícone, "Alertas ▲ Falhas", botões sem borda, link "Abrir Dados do ensaio" no Setup, réplica visual das placas dos 4 bancos, "SI-DSE:", painel de tamanho (⤢) redesenhado e remoção do pisca amarelo. Só aparência/atalhos — nenhuma lógica de ensaio, PLC ou API foi alterada.

## (a) Implementado e testado (Playwright, 0 erros de JS)
| Pedido | O que foi feito |
|---|---|
| Tirar "Modo guiado" e "Dados" do cabeçalho | Escondidos por CSS (continuam no DOM porque o código clica neles). **Onde ficaram:** "⚙ Alterar" (Modo) e "📋 Dados" no card **Modo**; link no Setup; botão já existente no Patamar. |
| Tirar "MANUAL" | Era a etiqueta `#pModo` (modo do controlador DSE). Escondida; o valor continua sendo lido. |
| Modo escuro → ícone | `#bTema`: lua (tema claro) / sol (tema escuro), com `title` e `aria-label`. |
| Alertas e Falhas | `Alertas ▲ Falhas` — triângulo vermelho com "!" branco. |
| Botões sem borda | Bloco CSS "v1.10.122: BOTÕES SEM BORDA": borda transparente (a largura fica → nada muda de tamanho) + fundo num tom acima (`--btn-bg`, claro/escuro). |
| "Abrir Dados do ensaio" no Setup | Link `#stAbreDados` abaixo do Chaveamento; abre o mesmo diálogo do botão Dados. |
| Placas | Ícone `#bPlacas` no card Banco de Cargas → diálogo `#dlgPlacas` com BC56, BC400, BC59,5 e BC550. |
| SI-DSE | Rótulo do card Simulação. |
| Janelas v0.4 | Painel ⤢ compacto e sem bordas; "Caber na tela" → **"Ajustar"**. |
| Pisca amarelo | CSS e observador removidos. |

## (b) Assumido / decidido por mim
- "Ajustar" para o botão sem preposição (alternativa: "Encaixar").
- Fora da regra "sem borda" de propósito: chaves do banco de carga (#bancos), campos de digitação, bolinha "i" e chips de estado (Seletora, erro) — cor/borda deles é sinal, não botão.
- Título da placa do BC59,5 deixado em branco (a foto não foi descrita); BC550: série `18?1308` (um dígito ilegível na foto, marcado com "i").
- Cor do fabricante/logos NÃO reproduzidos (só texto).

## (c) Pendente
- BC59,5 e BC550 aparecem como "só consulta": falta integrar ao `BANCOS` (ids de chaves, kW — já informados —, DBs, flows Node-RED).
- `janelas_v0.4` só está inline no medidor; gráfico/mapa/gerenciador/amostras continuam na v0.3.
- Placas: conferir digitação contra as fotos (série BC550).

## Como testar
1. Abrir o HTML: cabeçalho sem Modo/Dados/MANUAL; ícone de lua.
2. Card Banco de Cargas → ícone de placa → 4 placas.
3. Setup → link "Abrir Dados do ensaio".
4. ⤢ de qualquer janela → painel compacto com "Ajustar".
5. Alternar tema: botões continuam legíveis nos dois temas.
