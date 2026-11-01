# Análise: 4 Bancos de Carga — visual + blocos PLC (flexível) — v0.2 (01/11/2026)

> **Status: PROPOSTA/PLANEJAMENTO para aprovação. Nada foi criado, renomeado ou migrado no PLC.**
> Esta versão **substitui a v0.1** e corrige um erro de interpretação cometido naquela versão
> (confirmado pelo usuário em 01/11/2026 — ver histórico de conversa do mesmo dia). A v0.1 é mantida no
> repositório só como registro histórico do erro e da correção; não deve ser usada como referência.

## 0. O que a v0.1 errou, e a correção

**Erro da v0.1:** interpretou que "o 1515 deixa de comandar as chaves dos bancos de carga" e propôs um
modelo "somente leitura" (DB sem struct `cb`), com duas leituras alternativas L1/L2.

**Correção (texto do usuário, 01/11/2026):** *"Não vai mudar nada do que tá agora, não. A arquitetura da
1515, sim, continua do mesmo jeito. [...] No comandar, é comandar chave de comutação de carga de tensão de
220, 380, 440. A gente vai continuar enviando, sim [...] vai fazer o envio dos sinais igual a gente fez com
a ET200. Eu mando o sinal para lá, bate lá na 1200. A 1200 tem lá toda a parte de lógica dela [...] Mas, por
exemplo, se tiver sinal de emergência do lado de lá, não vai acionar a carga."*

Ou seja:
- **O 1515 continua comandando as chaves dos bancos de carga**, para os 4 bancos, do mesmo jeito que faz
  hoje com o ET200 via **FB101 "ComEt200"** (`fb101_ComEt200_v0.7.scl`) — isso não muda.
- O que muda é só o destino físico: hoje o 1515 fala com o ET200 (remoto); quando a 1200 entrar, o 1515
  passa a falar com a 1200, usando o **mesmo padrão** PUT/GET de envio de `cmd[]`/`ligarBanco`.
- A 1200 tem lógica própria (ex.: intertravamentos de segurança locais) que pode **não executar** um
  comando recebido mesmo que o 1515 o tenha enviado — e devolve essa condição por sinais de
  disponibilidade/liberação, separados do comando em si.
- O **struct `cb` (comando) continua existindo** nos DBs dos bancos de carga — não é removido. O modelo
  "somente leitura" da v0.1 está descartado.

**O que é novo de fato, e separado do comando de chaves:** a **comutação de tensão** (220/380/440V) passa
por um protocolo de duas etapas via **DB de competência** — ver seção 2. Isso é adicional ao comando de
chaves, não substitui ele.

## 1. Separação (regra 4 do projeto)

**(a) Confirmado**
- Hoje existem fisicamente só 2 bancos integrados ao PLC: **BC56** (DB150) e **BC400** (DB158), 13 chaves
  cada, com CB (comando)/SB (status)/Setup por chave (`ESPECIFICACAO_CARD_CHAVES_DB55_FB200.md`).
- O acionamento físico hoje passa pelo **FB101 "ComEt200"** (1515 → ET200, PUT/GET), que **envia**
  `cmd[1..16]` e `ligarBanco` e **recebe** `seletoraAuto`/`comEt200Ok` de volta
  (`PROPOSTA_SINAIS_LIGAR_BANCO_E_SELETORA_v0.2.md`).
- Existem mais 2 bancos só visuais/consulta no HTML desde a v1.10.125: **BC59,5** (18 chaves) e **BC550**
  (12 chaves) — camada de desenho separada (`#bancosVis`), sem clique, sem rota HTTP, sem DB
  (`QUATRO_BANCOS_VISUAL_E_MAPA_MOBILE_v1.10.125.md`, `QUATRO_BANCOS_NOS_DIALOGOS_v1.10.126.md`).
- Decisão de 29/10/2026: uma única CPU 1200 dedicada aos 4 bancos de carga (1 remota tipo ET200 por banco),
  substituindo o ET200 atual. A programação da 1200 fica com outro profissional.
- **Decisão de 01/11/2026 (corrigida):** o 1515 continua comandando as chaves dos 4 bancos, pelo mesmo
  padrão PUT/GET usado hoje com o ET200, agora direcionado à 1200. A ciência de qual chave ligar para
  atingir um kW alvo continua do lado do 1515/HTML (Manual Guiado / Patamar Guiado), igual hoje — **não
  passa a ser decisão da 1200**. A 1200 só pode recusar/bloquear localmente por motivo de segurança própria.
- **Decisão de 01/11/2026:** a comutação de tensão (220/380/440V) funciona em 2 estágios via DB de
  competência: o 1515 sinaliza uma *necessidade*, a 1200 processa autonomamente e responde com
  liberação/disponibilidade. Detalhado na seção 2.

**(b) Esclarecido hoje, por pergunta direta (01/11/2026):**
- Liberação de uma reserva de banco: **automática por padrão** (a 1200 detecta o fim do uso/patamar) **com
  opção de o operador forçar a liberação manualmente**.
- Cancelamento de uma solicitação pendente (ainda não confirmada pela 1200): **o operador pode desistir**
  antes da confirmação.

**(c) A desenvolver:** estrutura de DB de competência (bits detalhados na seção 2), camada visual
generalizada para 4 bancos no Patamar Guiado (seção 3), numeração v4 (ver
`PLANO_NUMERACAO_BLOCOS_PLC_v4_rascunho.csv`), reorganização do repositório GitHub.

## 2. DB de competência (handshake 1515 ⇄ 1200) — especificação funcional

Escopo: **só a comutação de tensão e a reserva/disponibilidade de banco entre BT1 e BT2** — não inclui o
comando de chaves em si (isso continua no DB de cada banco, via FB101, struct `cb`, inalterado).

Fluxo, com base no cenário descrito pelo usuário (broadcast de disponibilidade + reserva por solicitação):

1. **Disponibilidade (broadcast, 1200 → ambos os BTs):** 4 bits, um por banco, dizendo se aquele banco está
   livre. Lido tanto pelo BT1 quanto pelo BT2 — qualquer um dos dois vê o estado real dos 4 bancos.
2. **Solicitação (BT → 1200):** quando o operador seleciona um banco na tela, o HTML gera uma *solicitação*
   para aquele banco, específica do BT que está pedindo (BT1 ou BT2 têm bits de solicitação separados —
   nunca confundir os dois, regra 5 do projeto).
3. **Cancelamento (BT → 1200):** enquanto a solicitação está pendente (1200 ainda não confirmou), o
   operador pode cancelá-la — bit separado do de solicitação, para não ambiguar "nunca pedi" com "pedi e
   desisti".
4. **Reserva/processamento (1200):** a 1200 recebe a solicitação, reserva o banco (se disponível) e
   atualiza o bit de disponibilidade correspondente para os dois BTs.
5. **Liberação (1200 → ambos os BTs, ou operador → 1200):** ao fim do uso, a liberação acontece
   automaticamente (a 1200 detecta); existe também um bit de **forçar liberação**, para o operador destravar
   manualmente se precisar.
6. **Conflitos** (dois BTs pedindo o mesmo banco) são resolvidos por comunicação humana entre operadores,
   não por lógica no PLC — conforme definido pelo usuário.

**Esboço de estrutura (a desenvolver — nomes de tag e offsets exatos a confirmar antes de codar, regra 3):**

```scl
// RASCUNHO conceitual - NÃO é código final, faltam nomes de tag reais a confirmar
DATA_BLOCK "db5xx_CompetenciaBancos"
{ S7_Optimized_Access := 'FALSE' }
VAR
   disponibilidade : Struct          // escrito pela 1200, lido pelos dois BTs
      liberado[1..4] : Bool;
   END_STRUCT;
   bt1 : Struct                      // escrito pelo 1515/BT1, lido pela 1200
      solicita[1..4]       : Bool;
      cancelaSolicita[1..4]: Bool;
      forcarLiberacao[1..4]: Bool;
   END_STRUCT;
   bt2 : Struct                      // escrito pelo 1515/BT2, lido pela 1200 (DB separado do BT1 no 1515 - regra 5)
      solicita[1..4]       : Bool;
      cancelaSolicita[1..4]: Bool;
      forcarLiberacao[1..4]: Bool;
   END_STRUCT;
   heartbeat1515 : DInt;             // vida do lado 1515
   heartbeat1200 : DInt;             // vida do lado 1200
   comOk         : Bool;             // comunicação 1515 <-> 1200 OK
END_VAR
```

**Pendente de confirmação antes de codar:** nomes de tag definitivos, se BT1/BT2 ficam em um único DB
(como acima) ou em dois DBs físicos separados (mais alinhado à regra 5 de nunca misturar BT1/BT2), e a
faixa de numeração definitiva (ver CSV v4).

## 3. Parte visual (HTML) — o que muda

- O comando de chaves no HTML (clique para ligar/desligar, Patamar Guiado aplicando combinação) **continua
  existindo como hoje** — não é removido, diferente do que a v0.1 propunha.
- O que é novo: o **Patamar Guiado / Manual Guiado** (`fbs_virtuais_v0.11.js`) passa a **sempre considerar
  os 4 bancos** na sugestão de chaveamento, mesmo que hoje só 2 (BC56/BC400) tenham automação real — os
  outros 2 entram com dados simulados/fixos para fins de demonstração, por decisão explícita do usuário em
  01/11/2026 ("sempre considere os quatro bancos a partir de agora"). Esse ajuste é só JS/HTML, não depende
  da numeração do PLC nem da chegada da 1200, e pode avançar em paralelo.
- A seleção de banco pelo operador (parte da reserva/solicitação do DB de competência) é uma camada nova,
  acima do comando de chaves existente — não troca uma pela outra.

## 4. Numeração — ver documento separado

A proposta de faixas do DB de competência e dos bancos de carga foi movida para
`PLANO_NUMERACAO_BLOCOS_PLC_v4_rascunho.csv`, que substitui o `v3_rascunho.csv` (este último descartado,
mesma razão da v0.1 deste documento: baseado na premissa "somente leitura" já corrigida).

## 5. Pendências abertas antes de codar

1. Nomes de tag definitivos do DB de competência e decisão sobre 1 DB compartilhado vs. 2 DBs separados
   por BT.
2. Confirmação das faixas de numeração v4 (CSV) com o usuário.
3. BT2 primeiro, BT1 depois — este documento e o CSV já assumem essa ordem, mas a migração física só
   ocorre quando o usuário pedir explicitamente para "adiantar tudo do banco 2".
4. Reorganização de pastas do GitHub (`bt1/`, `bt2/`, `comum/`) junto com o item 3, não antes.
