# Registro de Evento de Campo — STOP do gerador durante ensaio armado (BT2)

**Data/hora do evento:** 17/10/2026, ~21:35 (horário de Brasília), durante ensaio manual no BT2.
**Natureza deste documento:** registro textual do ocorrido + ideia futura levantada pelo operador. **Nenhuma alteração de código foi feita** — versão do app permanece inalterada (v1.9.30). Este documento é insumo para elaborar uma solução depois, conforme combinado.

---

## 1. O que aconteceu (relato do operador, confirmado)

1. Operador esqueceu de ligar o diesel antes de iniciar a sequência do ensaio.
2. Ao perceber, entrou no Banco de Teste e apertou **STOP** diretamente no gerador (painel/DSE).
3. O **ensaio permaneceu armado** — comportamento considerado correto pelo operador.
4. A etapa em andamento no momento era a de **30%** de carga.
5. O **cronômetro da etapa continuou contando** normalmente durante o STOP, somando os **3:00 min** previstos para aquela etapa composta por:
   - **2 min** de aquecimento (tempo de estabilidade antes do patamar valer), +
   - **1 min** do patamar de 30% propriamente dito.
6. Ou seja, o tempo de etapa não foi pausado nem resetado pelo STOP do gerador — seguiu rodando "no vazio" enquanto o motor estava parado.

## 2. Classificação (conforme regra do projeto: separar confirmado / assumido / a desenvolver)

**(a) Confirmado/implementado hoje (comportamento atual do app, sem alteração):**
- O cronômetro de etapa é amarrado ao tempo decorrido, não ao estado real do gerador/carga. Ele não verifica se o motor está rodando nem se a carga está de fato estabilizada no patamar antes de contar o tempo da etapa.
- O ensaio não desarma automaticamente com um STOP manual no gerador (ponto que o operador considerou correto — não é um defeito, é a regra vigente).

**(b) Assumido/inferido (não verificado em código nesta conversa — precisa confirmação antes de qualquer implementação):**
- Que o cronômetro realmente não pausa em nenhuma condição de perda de carga/gerador parado (comportamento relatado em campo, ainda não cruzado linha a linha com o código do contador de etapa).
- Que o gráfico do ensaio (carga × tempo) registrou o intervalo do STOP/retomada como queda real de carga (plausível, mas não confirmado nesta sessão — se quiser, cruzo com o código do `GRÁFICO DO ENSAIO` antes de desenhar qualquer solução).

**(c) Ainda precisa ser desenvolvido (ideia levantada pelo operador, NÃO projetada nem implementada):**
- Repensar o botão **ZERAR** para que, em vez de zerar a etapa inteira, ele possa **resetar apenas o tempo do patamar de 30%** — hipótese do operador: "mudar os 3 min para 2 min" e deixar o cronômetro **aguardando a carga realmente chegar a 30%** antes de voltar a contar.
- Em paralelo, garantir que esse reset **não apareça no gráfico** como um desligamento/retomada (ou seja, o evento de STOP + reset não deve gerar um "dente" visível no gráfico de carga × tempo).
- Nenhum endereço, tag, função ou fluxo foi definido para isso — fica como ideia registrada, a amadurecer numa próxima etapa, por pedido explícito do operador ("só faz o registro do texto, depois elaboramos uma ideia").

## 3. Perguntas em aberto para quando formos desenhar a solução

1. O reset do tempo de etapa deve disparar automaticamente ao detectar STOP/gerador parado, ou continuar sendo uma ação manual do operador (botão)?
2. "Mudar os 3 min para 2 min" — é uma correção pontual do tempo padrão da etapa de 30% (ajuste de parâmetro), ou é especificamente sobre descontar o 1 min de aquecimento já cumprido antes do STOP?
3. Qual critério define "carga chegou em 30%" para retomar a contagem — leitura atual de carga medida, carga do DSE, ou ambas (igual à lógica já usada em `CARGA MEDIDA` / `Medido no DSE` do app)?
4. Para não aparecer no gráfico: a ideia é **não plotar pontos** durante o intervalo parado/reset, ou **remover retroativamente** o trecho do STOP até a retomada? São soluções de desenho bem diferentes.

---
*Documento gerado a pedido do operador em 17/10/2026, sem alteração de código ou de versão do app.*
