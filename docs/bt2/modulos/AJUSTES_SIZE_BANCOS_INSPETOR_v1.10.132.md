# Medidor 1.10.127→1.10.132 — SIZE, Banco de Cargas e inspetor

## (a) Implementado e testado (Playwright, Chromium)
- **Janelas (⤢ Tamanho) v0.6** — `aplicaSt()`: ao reabrir, a janela INTEIRA fica dentro da tela atual (antes só 120 px da barra de título). Se for maior que a tela, encolhe. Reproduzido antes: salvo em 2304x1042, reaberto em 1536x695 → direita/baixo fora; depois: dentro.
- **Card Banco de Cargas**: legenda Ligado/Desligado/Comandada removida; botões e chips (seletora, Ligar/Desligar) sem borda, alinhados à esquerda (BC56, BC400 e os de consulta).
- **Dica de interface (Alt+I)**: só sobe de span/b/i/svg; `div.tile` → "Chave de resistência (tile)", `.bk` → "Banco de cargas (bloco)". Não mostra mais `#bancos`.

## (b) Assumido
- "Mover para esquerda sub as chaves de resistência" interpretado como alinhar à esquerda os controles/chips dos bancos. Se for outra coisa, avisar.
- Causa exata do desvio no seu PC não reproduzida; corrigida a causa provável (posição salva em tela maior/zoom diferente).

## (c) Pendente
- Teste no seu navegador. Exportações/PDF e mapa para BC59,5/BC550.

## Correção na 1.10.128
- SIZE: causa real = Salvar gravava zoom total (body --z × zoom da janela) → reaplicado em dobro. Agora grava `parseFloat(d.style.zoom)`; reabre e posiciona pela escala total (`zEf`). Teste com --z=0.8: antes/depois iguais (±1 px). Salvos antigos: salvar de novo.
- Inspetor: contorno/balão divididos pela escala real do body (medida com o elemento aberto).
- Controles do banco voltaram à posição original (revertido o alinhamento à esquerda).

## Ajustes na 1.10.129
- Janelas: chave localStorage `bt2.jan2.<app>.<id>` (a antiga `bt2.jan` guardava zoom total errado). Testadas as 26 janelas (`dialog[id]`), zoom da tela 100% e 80%, Salvar→fechar→abrir: iguais (±2 px). dlgDemo também testado com arraste real do mouse e recarga de página.
- Banco de Cargas: nome do banco no mesmo lugar; seletora/Ligar banco logo ao lado (esquerda).
- Pendente (aguarda definição do usuário): onde colocar o PATAMAR (junto/acima do card Banco de Cargas) e itens da maquete (card MODO, funções das caixinhas, setinha).

## 1.10.130
- Card **Patamar** próprio (ids `bGuiado`, `bGuiadoRun`, `bAplicaPat` mantidos), empilhado acima do Banco de Cargas.
- Falha de leitura: texto "SEM LEITURA do PLC" removido do card; nova falha **CHV-006** (card Banco de Cargas, por banco) no triângulo. Cabeçalho do banco mostra "— kW". Chaves seguem com "?".
- Janelas v0.7: max-width/max-height em px reais (dividido pela escala total). Antes, `92vh` era multiplicado pelo zoom do body e a janela (ex.: dlgDemo) nascia pequena e não crescia. Teste: --z 0,7 → maxHeight 980px.
- Pendente: documentar CHV-006 no documento de ocorrências do projeto.

## 1.10.131
- BC56/BC400: `div.bk` → `details.bk` (summary `.bkh` mantém seletora, Ligar banco e kW). Nascem abertos; estado em localStorage `medidor.bkAberto.v1`. Clicar nos botões não fecha o sub-card (testado).
- Card Patamar com corpo: Estado, Patamar (etapa/alvo), Chaves sugeridas por banco (G.sug), Próximo passo (aplicarInfo().motivo). Só leitura; atualizado no ciclo de 1 s do guiado.
- Pendente: validar com ensaio em andamento (textos do corpo do Patamar só testados parados).

## 1.10.132 — Patamar Guiado dentro do card
- O `<dialog id="dlgGuiado">` foi movido para dentro de `#patCard` e fica sempre `open` (inline): mesmos ids, mesmos eventos (`data-gd`), mesma lógica. `data-jw-ok="1"` impede o módulo janelas (⤢/arrastar) de preparar esse diálogo.
- Botão "Patamar Guiado" do cabeçalho = recolher/abrir o corpo. Se outro código fecha todos os `dialog[open]` (ex.: ligar Demo), o corpo reabre sozinho, salvo se o operador o recolheu.
- Emergência "Abrir TODAS as chaves" no topo do corpo (sem borda). Corpo em 2 colunas (CSS columns) para reduzir a altura.
- Removidas as 4 caixinhas da 1.10.131.
## (c) Pendente
- Altura: o card Patamar tem ~635 px (zoom 0,7); com Banco de Cargas e Registro a coluna 3 rola (1043/850 em 1536×694). Opções: recolher o Patamar quando ocioso, mover o Patamar para outra coluna, ou reorganizar (decidir na maquete).
- Testar com ensaio em andamento e guiado ligado.
