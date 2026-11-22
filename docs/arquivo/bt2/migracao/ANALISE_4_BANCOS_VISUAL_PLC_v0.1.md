# Análise: 4 Bancos de Carga — visual + blocos PLC (flexível) — v0.1 (01/11/2026)

> **Status: PROPOSTA/PLANEJAMENTO para aprovação. Nada foi criado, renomeado ou migrado no PLC.**
> Este documento organiza o que já existe, o que mudou de decisão hoje e o que falta para suportar
> 4 bancos de carga de forma flexível, mantendo BT1/BT2 como sistemas distintos (regra 5 do projeto).

## 0. Separação (regra 4 do projeto)

**(a) Confirmado (código real/decisões já registradas)**
- Hoje existem fisicamente só 2 bancos integrados ao PLC: **BC56** (DB150) e **BC400** (DB158), 13 chaves cada,
  com CB (comando)/SB (status)/Setup por chave (`ESPECIFICACAO_CARD_CHAVES_DB55_FB200.md`).
- O acionamento físico hoje passa pelo **FB101 "ComEt200"** (1515 → ET200, PUT/GET), que **envia** `cmd[1..16]`
  e `ligarBanco` para o ET200 e **recebe** `seletoraAuto`/`comEt200Ok` de volta
  (`PROPOSTA_SINAIS_LIGAR_BANCO_E_SELETORA_v0.2.md`).
- Existem mais 2 bancos **só visuais/consulta** no HTML desde a v1.10.125: **BC59,5** (18 chaves) e **BC550**
  (12 chaves) — camada de desenho separada (`#bancosVis`), sem clique, sem rota HTTP, sem DB
  (`QUATRO_BANCOS_VISUAL_E_MAPA_MOBILE_v1.10.125.md`, `QUATRO_BANCOS_NOS_DIALOGOS_v1.10.126.md`).
- Decisão de 29/10/2026: uma única CPU 1200 dedicada aos 4 bancos de carga (1 remota tipo ET200 por banco),
  substituindo o ET200 atual; o retrofit automatiza chaves e chaveamento de tensão 220/380 nos 4 bancos.
  A programação da 1200 fica com outro profissional.

**(b) Mudança de decisão — HOJE (01/11/2026), precisa de confirmação explícita por escrito**
> **O 1515 deixa de comandar as chaves dos bancos de carga.** Ele passa a só **receber os sinais de
> liberação** enviados pelo PLC dos bancos de carga (a 1200). O comando de acionamento não parte mais
> do 1515/BT.

Isso **contradiz o texto registrado em 29/10/2026** (`claude/areas/nodered.md`): *"o 1515 só repassa ao
HTML, **envia o chaveamento correto** e recebe 'liberado'"* — ali o 1515 ainda enviava o comando de
chaveamento. Também contradiz o que está **implementado hoje** no FB101 (envia `cmd[]`/`ligarBanco` ao
ET200) e no FB100 (Setup grava `cb.ligar[]` para acionar uma chave de calibração).

**Este documento segue a instrução de hoje como a mais recente**, mas trata como **ASSUMIDO, não
confirmado em definitivo**, até você validar por escrito uma das duas leituras abaixo — não vou prosseguir
com a migração real sem essa confirmação (regra 3 do projeto):

| Leitura | O que muda | Escopo |
|---|---|---|
| **L1 — Só os 2 bancos novos (BC59,5/BC550) nascem "somente leitura"** | BC56/BC400 continuam como estão hoje (1515 comanda via FB101/ET200) até a retrofit da 1200 chegar neles também | Convivência temporária: 2 bancos comandados, 2 só liberação |
| **L2 — Os 4 bancos passam a ser "somente liberação" assim que a 1200 entrar, inclusive BC56/BC400** | FB101/ET200 e o acionamento do FB100 no Setup (`cb.ligar[]`) são **descontinuados** quando a 1200 assumir o BC56/BC400 também | Mudança estrutural grande, afeta código já em produção |

**(c) A desenvolver**: estrutura de DB flexível para N bancos (até 4, com folga), DB de competência
(handshake 1515 ⇄ 1200), camada visual generalizada, numeração v3, reorganização do repositório GitHub.

## 1. Modelo de dados proposto — "somente liberação" (genérico, flexível, N bancos)

Pensando na leitura L2 (mais abrangente — se for L1, o mesmo DB serve só para BC59,5/BC550 enquanto
BC56/BC400 mantêm o DB150/DB158 atual em paralelo):

```scl
// um DB por banco, mesmo gabarito, até 16 chaves (igual ao padrão atual)
DATA_BLOCK "db2xxx_BancoCargaN_Status"
{ S7_Optimized_Access := 'FALSE' }   // Node-RED precisa de offset fixo
VAR
   sb : Struct
      liberadoGeral   : Bool;        // banco liberado para uso (vem da 1200)
      liberada[1..16] : Bool;        // cada chave liberada/disponível (vem da 1200)
      ligada[1..16]   : Bool;        // status real de cada chave (feedback físico, via 1200)
      aplicadoKw      : Real;        // kW que a 1200 informa como realmente aplicado no banco
      comOk           : Bool;        // comunicação 1515 <-> 1200 (ou 1200 <-> remota do banco) OK
      vida1200        : DInt;        // heartbeat vindo da 1200 (contador incrementando)
   END_STRUCT;
   -- NENHUM struct "cb" (comando) neste DB: não há mais escrita de acionamento pelo 1515 --
END_VAR
```

**Por que (leigo):** como a 1200 é quem decide e aciona as chaves, o 1515 só precisa de um "placar" que
diz o que está liberado e o que está ligado agora — não precisa (nem deve) ter um campo de comando, porque
isso tiraria a 1200 do controle.

**Por que (técnico):** remover o struct `cb` evita a ambiguidade de "quem manda" que hoje existe em
`cb.ligar[]` (2 escritores: Node-RED e FB100 — ver `ESPECIFICACAO_CARD_CHAVES_DB55_FB200.md` seção 6).
Com leitura pura, só existe 1 escritor (a 1200, via GET/PUT do 1515) e o 1515 nunca disputa a mesma
variável com outro agente.

**Dado que NÃO pertence a este DB:** quem decide sequência de chaves, qual chave liga para atingir um kW
alvo, rodízio de desgaste — tudo isso é da 1200 agora (ou do colega responsável por ela). O que o Manual
Guiado e o Patamar Guiado (hoje em JS, `fbs_virtuais_v0.11.js`) fazem hoje — sugerir e aplicar combinação
de chaves — **precisa ser revisto**: hoje eles terminam com um `POST /api/chaves/{banco}/ligar`, que não
existiria mais nessa arquitetura. Ver seção 4 (pendência crítica).

## 2. DB de competência (handshake 1515 ⇄ 1200) — reservado, não especificado ainda

Você mencionou que isso fica para depois ("só vamos fazer um DB de competência para... estabelecer as
trocas de sinais"). Reservo a faixa (seção 5) e deixo registrado o que esse DB provavelmente precisa
resolver, para quando for especificado com você:

- Qual CPU é dona de quê: o 1515 continua sabendo qual BT está em uso (BT1 ou BT2) e qual(is) banco(s) de
  carga aquele BT está usando agora — isso é informação que só o 1515 tem (vem da IHM/HTML) e a 1200
  provavelmente precisa saber, para decidir se libera aquele banco para aquele ensaio.
- Status de vida (heartbeat) nos dois sentidos, para detectar queda de comunicação sem ambos os lados
  "travarem" liberado.
- Local para o 1515 **pedir** o uso de um banco (não comandar a chave, só pedir "preciso do BC550 agora")
  — se essa ponte for necessária; a confirmar com você e com o colega da 1200.

## 3. Parte visual (HTML) — o que muda

**(a) Confirmado/já pronto:** os 4 bancos já aparecem na tela principal e nos diálogos desde a v1.10.126
(card Banco de Cargas, Setup, Troca de resistência, Patamar Guiado com aviso) — ver seção "(a)
Feito/testado" dos docs `QUATRO_BANCOS_*`. Hoje isso é só visual/consulta para BC59,5/BC550; BC56/BC400
continuam com lógica plena (comando).

**(c) A desenvolver, dependendo da leitura L1/L2:**
- **Se L1:** nenhuma mudança visual adicional agora — os 2 bancos novos continuam "só consulta" até a 1200
  chegar neles. Quando a 1200 assumir cada banco, ele passa de "camada de desenho" (`#bancosVis`) para
  "banco integrado" (array `BANCOS`), mas **lendo liberação em vez de permitir clique de comando** — ou
  seja, o card perde o botão de ligar/desligar chave individual e ganha um indicador "liberado pela 1200 /
  bloqueado pela 1200".
- **Se L2:** o card Banco de Cargas de **todos os 4 bancos** perde os botões de clique em chave; vira um
  painel somente leitura (status), e qualquer ação de "aplicar uma combinação de chaves" deixa de existir
  no HTML — a 1200 decide sozinha. Isso muda a experiência do operador de forma relevante; **recomendo
  confirmar com você antes de tocar no HTML em produção**, porque é visível na bancada.

## 4. Pendência crítica a resolver antes de codar

O **Manual Guiado / Patamar Guiado** (arquitetura em `PROPOSTA_ARQUITETURA_FB_MAE_FILHOS_v0.1.md`,
filhos 4-6: motor de sugestão, rodízio, comando e retorno das chaves) foi desenhado assumindo que o 1515
(ou o HTML) decide **qual combinação de chaves ligar** para atingir um kW alvo. Se o comando passa a ser
só da 1200, essa função — ou passa para dentro da 1200 (fora do nosso escopo, é do colega), ou o 1515
continua **sugerindo** mas sem **aplicar** (precisaria de uma forma de comunicar a sugestão à 1200, que aí
sim decide aplicar ou não).

**Não vou assumir qual dos dois caminhos é o certo — preciso que você decida isso com o colega da 1200
antes de eu alterar o Manual/Patamar Guiado.**

## 5. Proposta de numeração — faixas (rascunho v3)

Incorporando a decisão de 29/10/2026 (1515 único para BT1+BT2+4 bancos; faixas de 1000 em 1000) e
reservando espaço para o handshake com a 1200:

| Faixa DB | Escopo | Conteúdo |
|---|---|---|
| 1-499 | COMUM | seletor global, safety (porta, disjuntores, exaustão), diagnóstico |
| 500-599 | COMUM | **DB de competência (handshake 1515 ⇄ 1200)** — reservado, não especificado |
| 600-999 | COMUM | reserva |
| 1000-1999 | BT1 | mesmo gabarito do BT2 (seção 4 do `PLANO_NUMERACAO_BLOCOS_PLC.md`, +950 de deslocamento) |
| 2000-2999 | BT2 | cards do BT2 (DSE, SNAP Manual, Parâmetros, Etapas, Dados do ensaio, Modo) |
| 3000-3399 | Bancos de carga — **status (somente leitura)** | 4 posições × 100 DBs de folga: BC1=3000-3099, BC2=3100-3199, BC3=3200-3299, BC4=3300-3399 |
| 3400+ | reserva | expansão futura (mais bancos) |

**Por que essa estrutura (técnico):** mantém a lógica da planilha v2 (gabarito idêntico entre BT1/BT2,
deslocamento fixo), mas migra as faixas de "dezenas" para "milhares" — como você decidiu em 29/10 — para
caber com folga os cards futuros (safety, monitoramento) sem reapertar tudo de novo. Os bancos de carga
saem da faixa 150-197 antiga (pensada para comando CB/SB) e entram numa faixa só de leitura (sem a
distinção `cb`/`sb`/`setup` antiga, que não existe mais nesse modelo).

**Isto é rascunho — não renomeia nada ainda.** Faltam decisões suas antes de aplicar:
- P1: confirmar leitura L1 ou L2 (seção 0b).
- P2: aprovar as faixas acima ou ajustar.
- P3: BC56/BC400 mantêm DB150/DB158 por enquanto (compatibilidade) ou já migram para a faixa 3000+?

## 6. Reorganização do repositório GitHub (proposta, sem mover nada ainda)

O README já descreve uma estrutura `bt1`/`bt2`/`shared` que ainda não existe fisicamente (ver
`docs/PROCESSO_SINCRONIZACAO_PROJECT_GITHUB_v0.2.md`, seção 6, pendência conhecida). Proposta alinhada a
este documento:

```
nodered/flows/
  comum/           -- config S7 comum, se vier a existir
  bt1/             -- flows específicos do BT1
  bt2/             -- flows atuais (chaves-56, chaves-400, etc.) — a mover
plc/
  bt1/
  bt2/
  bancos_carga/    -- status/leitura (novo modelo), em vez de "bancos_cargas" com DB de comando
  shared/          -- safety, DB de competência
docs/
  modulos/         -- já existe
  bancos_carga/    -- este documento + futuros specs de status/competência
```

**Não vou mover arquivos físicos ainda** — isso só faz sentido depois de resolver P1-P3 acima, porque a
pasta certa para BC56/BC400 depende da resposta.

## 7. Resumo do que preciso de você para avançar

1. Confirmar/corrigir a leitura L1 ou L2 (seção 0b) — é a decisão que mais afeta o resto.
2. Decidir, junto com o colega da 1200, quem faz a sugestão/aplicação de combinação de chaves (seção 4).
3. Aprovar ou ajustar as faixas de numeração v3 (seção 5) e responder P3.
4. Só depois disso eu aplico qualquer mudança em código (PLC, Node-RED, HTML) ou reorganizo pastas no
   GitHub — por ora isto é só análise e planejamento, como você pediu.
