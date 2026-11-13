# Protótipo do medidor inteiro — v0.1

**Arquivo:** `medidor_v0.1.html` (um arquivo só, sem internet). Plano de design: `PLANO_medidor_v0.1.md`.
**Situação:** PROTÓTIPO. Não é o medidor. Dados inventados. Não fala com PLC, Node-RED nem rede.

## O que tem
Etapa (relógio, lâmpada "o que fazer agora", régua de carga com o alvo, Iniciar/Pausar/Zerar, 6 etapas),
Banco de cargas (16 chaves como disjuntores, Automático/Manual, soma e diferença), Leitura do gerador,
Gráfico, Registro do ensaio. Claro e escuro. Botão "Animações".

## Como ver
Abra o arquivo no navegador e toque em **Iniciar**. A demonstração roda sozinha (tempo 10× mais rápido).
Toque em **Manual** para comandar as chaves: cada comando pede confirmação.
Para o celular: baixe o arquivo (Raw) e abra no navegador.

## Animações (liberadas, mas só com função)
Alavanca da chave e anel "esta chave mudou agora"; barra de carga; lâmpada que pulsa só quando é preciso
ajustar a carga; aviso de confirmação. Números ao vivo NÃO animam. Desliga pelo botão ou pela opção
"reduzir movimento" do aparelho.

## O que foi verificado (navegador do computador, 390 px e 1536 px, claro e escuro)
- Sem erro no console e sem rolagem horizontal.
- Todo botão visível tem pelo menos 48 px; nenhuma letra abaixo de 16 px; nenhum texto cortado.

## O que NÃO foi verificado / limitações
- Celular de verdade, luz de pátio, luva, leitor de tela.
- No celular as palavras "Desligada" e "Bloqueada" quase encostam na borda da chave (folga de ~1,5 px).
  Funciona, mas é o ponto mais apertado. Se for adotado, rever com os operadores.
- Fonte do sistema (Bahnschrift no Windows; outra no celular): a aparência muda um pouco entre aparelhos.
- No notebook (694 px de altura) a tela passa de uma tela; a parte de cima (etapa e banco) cabe.
- Faltam: Setup de kW real, rodízio, Patamar Guiado, Logs, Placas, exportar PDF, popups.
- As regras de ensaio (etapas, tolerância, "estabilizando") são simplificadas só para a demonstração.

## Para usar no medidor depois
Só à mão, em outra branch, com teste no medidor real e com `build.js` rodado por uma pessoa.
Os ids e o estado do medidor atual precisam ser mantidos. Comece por UM painel (ex.: Etapa), não pelos oito.
