# Checklist de decisão — preparação para o teste real do BT2 (4 geradores)

**Objetivo deste documento:** separar o que é essencial decidir **antes** de começar a testar com gerador real do que pode esperar, e levantar as perguntas que eu **não posso responder sozinho** (endereço de DB, estrutura de dados no PLC) sem inventar dado técnico — conforme a regra do projeto. Nenhuma linha de código foi alterada ainda; isso é só o roteiro de decisão. Responda cada pergunta (pode ser só a letra) e eu sigo com as correções na ordem que você priorizar.

Peço só que leia a **Parte 0** primeiro — é a única pergunta que muda a arquitetura dos demais itens.

---

## Parte 0 — Como os 4 geradores vão ser operados? (decide o resto)

Hoje o HTML não tem nenhum identificador de ensaio/gerador no protocolo — só a URL da API (`#url`) configurada manualmente na tela (achado ACH‑12 da auditoria). Com 4 geradores em paralelo isso passa a importar de verdade, não é só teórico.

**P0.1 — Cada gerador vai ter sua própria aba/cópia do HTML aberta (uma URL por aba), ou vai existir um seletor de gerador dentro do mesmo HTML?**
- (a) Uma aba por gerador, cada uma com sua URL própria — **mais simples, não exige mudança de arquitetura agora**. Risco do ACH‑12 fica restrito a "o operador trocar de aba e confundir qual gerador está vendo", não a mistura de dados no PLC.
- (b) Um seletor dentro do mesmo HTML (trocar de gerador sem trocar de aba) — exige bem mais trabalho (reorganizar `ENS`/`T`/`SNAP` por gerador) e só faz sentido se for assim que vocês realmente vão operar.

*Recomendação: (a) para o teste real já — é o que o app já faz hoje, só abrindo 4 abas/janelas.*

---

## Parte 1 — Achados da auditoria: o que resolver antes do teste real

Nem todo achado P1 da auditoria precisa virar código antes de amanhã. Priorizei pelo que *muda o resultado do ensaio* vs. o que é só robustez/segurança de uso indevido.

**P1.1 — ACH‑12 (limpeza do PLC não bloqueia novo ensaio / sem ID de ensaio):** com 4 geradores, isso ganha peso — se o operador trocar de aba/gerador rápido demais e a limpeza do PLC anterior falhar, dá pra herdar etapa de outro ensaio.
- (a) **Corrigir agora, versão simples:** trocar `ensLimpaSilenciosa()` para bloquear o início (em vez de só avisar) quando a limpeza falhar — é só frontend, baixo risco de regressão, dá pra fazer antes do teste real.
- (b) Deixar como está por enquanto e reforçar isso como **procedimento do operador** (conferir a tabela de etapas ao abrir cada aba, antes de iniciar).
- (c) Fazer a correção completa (ID de ensaio no protocolo) — **não dá pra fazer agora**, depende de mudar o Node‑RED/PLC também.

*Recomendação: (a) — é pequena e reduz justamente o risco que mais cresce com 4 geradores em paralelo.*

**P1.2 — ACH‑13 (leitura da API não valida `r.ok`/`idadeSegundos` ausente):** correção só de frontend, baixo risco.
- (a) Corrigir agora.
- (b) Deixar para depois do teste real.

*Recomendação: (a) — é rápida e evita a tela mostrar "Leitura ok" quando na verdade a resposta veio incompleta.*

**P1.3 — ACH‑04 (Forçar Salvar grava de verdade no PLC, só protegido por senha no HTML):** com 4 geradores e mais gente podendo mexer na tela, o risco de clique errado em campo aumenta.
- (a) Remover esse botão da versão que vai para o teste real (reativa só quando precisar validar bancada).
- (b) Manter, mas exigir confirmar explicitamente qual gerador antes de liberar (reforça o intertravamento existente).
- (c) Deixar como está.

**P1.4 — ACH‑01 (tempo em carga não reavalia tolerância após 1ª estabilização):** essa é a única que é **decisão de engenharia de processo**, não de código — já registrada assim na auditoria.
- (a) Manter como está (operador supervisiona e usa "Resalvar" se notar oscilação) — é o que já está documentado no HISTORICO do app.
- (b) Quer que eu implemente uma segunda contagem ("tempo fora da tolerância") antes do teste real, mesmo sendo mudança na lógica central do cronômetro?

*Recomendação: (a) para já começar — (b) é mudança de maior risco de regressão, melhor não misturar com a preparação pro teste real.*

---

## Parte 2 — Pedidos desta mensagem

### 2.1 — Card "CARGAS · BANCO DE CARGA" nascer escondido

Hoje ele abre expandido (imagem que você mandou). Antes de mexer:

**P2.1 — "Escondido" = começa recolhido (só o título, clique pra abrir), igual um acordeão, ou começa oculto por completo (só aparece se o operador clicar em algum botão "mostrar")?**
- (a) Recolhido por padrão, com a setinha/clique para expandir (acordeão) — **mais simples e reversível**.
- (b) Oculto por completo até acionar um botão em outro lugar da tela.

**P2.2 — Isso vale só para a 1ª vez que a tela abre, ou o app deve lembrar se o operador deixou aberto/fechado (salvar no navegador) entre sessões?**
- (a) Sempre nasce fechado, independente do que o operador fez da última vez.
- (b) Lembra o último estado (fica salvo no `localStorage` do navegador).

*Recomendação: (a)+(a) — simples e não exige persistência nova.*

### 2.2 — Aumentar a fonte das grandezas

Confirmado pela imagem 2: tensão, corrente, potência, água, rotação, bateria e carga medida já usam fonte grande, mas dá pra crescer mais.

**P2.3 — Só os números das grandezas (V, A, kW, °C, rpm, bateria, % de carga) ou também os rótulos ("TENSÃO", "CORRENTE" etc.)?**

**P2.4 — Quanto maior? Dá uma referência prática: "day a day" tipo +20% (visível, mas cabe igual), +40% (bem maior, pode exigir reduzir algo do layout) ou você aponta um tamanho em px que já viu em algum outro painel?**

*Sem essa referência eu teria que chutar um valor — prefiro perguntar a inventar.*

### 2.3 — Limites de água: mudar padrão para 90/95

A auditoria já tinha pego isso (ACH‑14): o padrão hoje no código é `atencao:85, critico:95`, marcado no próprio comentário como "PROVISÓRIO". Pela imagem 3, o popup já está mostrando 90/95 — mas isso pode ser porque alguém já ajustou pela tela (fica salvo em `localStorage`, não no código).

**P2.5 — Confirma: trocar o padrão de fábrica no código de `85/95` para `90/95` (isso só muda o valor inicial de quem nunca mexeu no popup; quem já ajustou manualmente continua com o que ajustou)?**
- (a) Sim, troca o padrão no código.
- (b) Não, só queria confirmar que o popup está certo (nesse caso não precisa mexer em nada).

*Essa é baixo risco — simples troca de constante. Só confirmando antes de mexer.*

### 2.4 — Enter / clique em SALVAR não deve fechar a popup

Essa eu preciso entender melhor o alcance antes de mexer, porque "todo botão SALVAR do HTML" inclui popups bem diferentes entre si (Dados do ensaio, Parâmetros, Resalvar, Limites da água, Forçar Salvar, etc.) — algumas fecham por `<form>`/`submit()` nativo do navegador (é aí que o Enter age), outras fecham só pelo `onclick` do botão.

**P2.6 — O comportamento que você quer é: depois de clicar SALVAR (ou apertar Enter), a popup *permanece aberta* mostrando que salvou (ex.: um "✓ salvo" por 1-2s), e o operador fecha manualmente clicando no X? Ou ela deve só *não fechar sozinha no Enter*, mas o botão SALVAR continua fechando normalmente?**
- (a) Nenhuma popup fecha sozinha (nem por Enter, nem pelo clique em SALVAR) — fecha só pelo X/Cancelar.
- (b) Só o Enter do teclado não deve disparar fechamento (evita fechar sem querer); o clique no botão SALVAR continua fechando como hoje.

**P2.7 — Isso vale para TODAS as popups com botão salvar (inclusive "Dados do ensaio", que hoje fecha e já inicia o ensaio ao confirmar), ou só nas popups de **parâmetro/configuração** (água, tolerância, etc.)?**

*Essa distinção importa porque mudar o comportamento de "Dados do ensaio" myda o fluxo de início do ensaio manual, que é a prioridade #1 do projeto — prefiro não tocar nisso sem confirmar.*

### 2.5 — Tolerância de carga padrão: 3% → 10%

**P2.8 — Confirma: é o valor de `TOL` (hoje `3`, linha ~998 do HTML) que deve virar `10`? Isso afeta TODAS as etapas do ensaio (não dá pra ter tolerância diferente por etapa hoje, é um valor único global) — tudo bem assim?**
- (a) Sim, `TOL=10` global.
- (b) Não, preciso de tolerância diferente por etapa/faixa — nesse caso me diga quais etapas/valores, porque isso é mudança maior (estrutura de dado nova, não só trocar uma constante).

*Recomendação: (a), se for só esse valor único — é troca de uma linha, baixo risco.*

### 2.6 — Parâmetros indo para um DB novo no PLC (DB54 "DB parâmetros")

Esta é a que eu **não posso avançar sozinho** — seria inventar endereço/estrutura de DB, o que a regra do projeto proíbe explicitamente. Preciso de informação sua (ou de quem define o PLC) antes de qualquer proposta de código.

**P2.9 — O DB54 já existe no PLC com alguma estrutura definida, ou é um DB novo que ainda vai ser criado do zero?**
- (a) Já existe — me passe a definição (endereços/offsets, tipos de dado) que eu tenho hoje, mesmo que incompleta, pra eu não inventar nada.
- (b) Ainda não existe — nesse caso eu posso te ajudar a **propor** uma estrutura (que tags, que tipos, agrupamento), mas ela teria que ser validada e implementada por quem programa o PLC antes de eu apontar o HTML/Node‑RED pra lá.

**P2.10 — Quais parâmetros exatamente devem ir para esse DB? Pelo que você escreveu, pelo menos: limites de água (atenção/crítico), tolerância de carga (`TOL`), e "tags da etapa de ensaio" — isso é `ETAPAS[]` inteiro (nome, alvo, duração de cada etapa) ou só alguns campos dele?**

**P2.11 — Sobre os botões de salvar dos parâmetros, três formatos possíveis — qual prefere?**
- (a) Um botão "Salvar" por parâmetro individual (grava assim que o operador mexe naquele campo específico).
- (b) Parâmetros agrupados em cards por assunto (ex.: card "Água", card "Carga/Tolerância", card "Etapas") — um botão Salvar por card.
- (c) Um único "Salvar tudo" no fim da tela de parâmetros, como é hoje (`dlgParam`), só que agora gravando também no PLC além do `localStorage`.

*Recomendação: (b) — card por assunto é o meio-termo: não precisa clicar 10 vezes como em (a), mas também não arrisca gravar um parâmetro errado que não terminou de editar, como em (c).*

---

## Resumo — o que eu recomendo fazer **antes** do teste real desta tarde/semana, se você topar as recomendações acima

1. P0.1(a) — seguir com uma aba por gerador, sem mudar arquitetura.
2. P1.1(a) — bloquear início de ensaio se a limpeza do PLC falhar.
3. P1.2(a) — corrigir validação de `r.ok`/`idadeSegundos` (ACH‑13).
4. P2.1/P2.2 — card de chaves recolhido por padrão.
5. P2.5(a) — água 90/95 como padrão.
6. P2.8(a) — tolerância 10% como padrão.
7. Fonte maior (depende da sua resposta em P2.4).

**Fica para depois (não bloqueia o teste real):** P1.3 (Forçar Salvar), P1.4 (ACH‑01, decisão de processo), P2.6/P2.7 (comportamento de fechar popups — precisa da sua resposta pra não mexer errado no fluxo de "Dados do ensaio"), e tudo da Parte 2.6 (DB54) — que depende de informação de PLC que só você/a engenharia tem.
