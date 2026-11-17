# Memorial de Cálculo e Especificação Técnica — kW real e resistência por fase do banco de carga · v0.1 · 24/10/2026

> **Origem:** texto fornecido pelo usuário em 24/10/2026 (redigido por outra IA). Parte 1 (seções 1 a 3) transcrita do original, sem alterar o conteúdo técnico; só foram retiradas as frases de conversa do início e do fim e a notação LaTeX foi trocada por texto simples.
> **Status:** **NÃO validado e NÃO implementado.** Nada deste documento foi aplicado ao HTML, ao Node-RED ou ao PLC. As **Notas do revisor** (seção 4) são minhas, e não fazem parte do texto original.

---

## 1. Fundamentação teórica e correção matemática

### 1.1 O erro da abordagem anterior
A medição de potência e resistência em sistemas trifásicos reais não deve usar fórmulas simplificadas baseadas em tensões de linha puras se houver qualquer desequilíbrio de fase ou distorção harmônica. Além disso, o cálculo deve isolar as perdas fixas do próprio motor/gerador em vazio (kW sem carga).

### 1.2 Cálculo do kW real injetado
O controlador DSE calcula internamente a potência ativa total (integrando os vetores de tensão fase-neutro e corrente de cada fase). A medição deve usar diretamente a tag de potência ativa total (`kw`) disponibilizada pelo módulo.

```
kW_real = kW_com_chave − kW_sem_carga
```
- `kW_com_chave`: valor atual da tag `kw` lido do DSE após o acionamento do estágio.
- `kW_sem_carga`: valor de linha base da tag `kw` lido com o gerador em rotação nominal e **todas as chaves de carga desligadas**.

### 1.3 Cálculo da resistência medida (manutenção preditiva)
Como o banco de carga é puramente resistivo (fator de potência ≈ 1,00), a Lei de Ohm se aplica diretamente sobre os valores médios de fase. Para identificar desgaste ou degradação dos resistores independentemente da oscilação da rede, usa-se a tensão fase-neutro média e a corrente média fornecidas pelo DSE:

```
R_medido = V_FNMedia / I_corrente
```
- `V_FNMedia`: tag `tensaoFNMedia` (V) do DSE.
- `I_corrente`: tag `corrente` (A) — corrente média das três fases.

## 2. Diretrizes de correção para a IA de desenvolvimento

### 2.1 HTML
- **Mapeamento de IDs/tags:** os campos de texto do HTML devem estar vinculados às variáveis corretas do payload: `kw` para "kW com chave", `kW_sem_carga` para "kW sem carga" e `kw_real` para o resultado final subtraído.
- **Seção de resistências:** o campo "R medido" deve exibir o `R_medido` calculado pelo CLP. O campo "R teórico" deve exibir uma constante fixa (ex.: 38,72 Ω se o projeto base for 5 kW em 440 V em estrela) para permitir comparação visual do operador.

### 2.2 Node-RED
- O Node-RED atua como ponte de comunicação (Modbus TCP ou protocolo S7) que lê as tags do DSE e as escreve nos DBs do CLP Siemens. Também recebe o payload tratado do CLP para renderizar no painel HTML.
- Deve ter um gatilho associado ao botão **"Salvar Chave"** para congelar o valor de `kW_sem_carga` em uma variável de fluxo (`flow.set`) antes de calcular o degrau de carga.

### 2.3 Bloco de função (FB) em SCL (TIA Portal)
O FB processa a lógica matemática de forma determinística dentro do CLP.

**Interface**
- Inputs: `r_Tensão_FN_Media`, `r_Corrente_Media`, `r_kW_DSE_Atual`, `r_kW_Sem_Carga`, `r_R_Teorico` (todos Real).
- Outputs: `r_kW_Real` (Real), `r_R_Medido` (Real), `b_Alerta_Manutencao` (Bool).

**Código SCL sugerido (conforme o original, sem alteração)**
```scl
// Cálculo da Potência Real descontando a rotação em vazio
#r_kW_Real := #r_kW_DSE_Atual - #r_kW_Sem_Carga;

// Cálculo da Resistência Medida por Fase com proteção contra divisão por zero
IF #r_Corrente_Media > 0.5 THEN
    #r_R_Medido := #r_Tensão_FN_Media / #r_Corrente_Media;
ELSE
    #r_R_Medido := 0.0;
END_IF;

// Lógica de Manutenção: Alerta se o desvio for maior que 10% do valor de fábrica
IF #r_R_Medido > 0.0 AND #r_R_Teorico > 0.0 THEN
    IF (ABS(#r_R_Medido - #r_R_Teorico) / #r_R_Teorico) * 100.0 > 10.0 THEN
        #b_Alerta_Manutencao := TRUE; // Ativa flag de solicitação de troca no HTML
    ELSE
        #b_Alerta_Manutencao := FALSE;
    END_IF;
ELSE
    #b_Alerta_Manutencao := FALSE;
END_IF;
```

---

## 4. Notas do revisor (Claude, 24/10/2026) — comparação com o que o projeto já tem

**(a) Confirmado nos arquivos do projeto**
- `kW_real = kW_com_chave − kW_sem_carga` **já está implementado**: `fb100_setupChaves_v0.2.scl` (REGION 3: `KwReal := kWMedido − BaseKW`) e no HTML (`BASE`) — `ESPECIFICACAO_CARD_CHAVES_DB55_FB200.md`, seção 4.
- As tags `tensaoFNMedia` e `corrente` **existem** no payload do DSE (`medidor_gerador_v1.9.76.html`, linhas ~2374 e ~4168; `nodered/cliente-156-dse-plc-carga-v1.json`).
- O `R teórico = 38,72 Ω` do exemplo confere: 440² / 5000 = 38,72 Ω (5 kW, 440 V entre fases, estrela).
- Hoje o projeto calcula `R_medido = V_médio² / (kW_real × 1000)`, com `V_médio` = média de `tensaoL1L2/L2L3/L3L1` (fase-fase) — `fb100_setupChaves_v0.2.scl`; fórmula confirmada pelo usuário na v1.9.36 (`REGRA_NUMERACAO_DB_BT2.md`).

**(b) Inferido / divergências a decidir**
1. **Fórmulas de R medido:** `V_FN / I` (memorial) e `V_LL² / P` (projeto) dão o **mesmo valor** para carga resistiva equilibrada em estrela (V_FN/I = V_LL²/P). Divergem se houver desequilíbrio ou FP ≠ 1. A inferência é minha, a validar na bancada.
2. **R teórico como constante fixa (38,72 Ω):** vale só para uma chave de 5 kW a 440 V. O banco de 56 kW tem chaves de 3 a 5,5 kW e o de 400 kW de 5 a 50 kW (`ESPECIFICACAO_CARD_CHAVES_DB55_FB200.md`, seção 2). Hoje o R teórico é calculado por chave a partir de `nominal[]` e da tensão (assumido na v1.9.37, ainda não confirmado tecnicamente). Uma constante única não serve para todas as chaves.
3. **Novo FB duplicaria o `fb100_setupChaves`**, que já calcula `KwReal`, `RmedidoOhm` e `RteoricoOhm` por chave. Criar outro FB foge da numeração do `PLANO_NUMERACAO_BLOCOS_PLC.md` e da regra de preservar a arquitetura — só com decisão sua.
4. **Congelar `kW_sem_carga` com `flow.set` no "Salvar Chave":** hoje a base é uma média móvel contínua no FB100 (REGION 1) e o HTML também mantém `BASE`. A proposta mudaria onde a base é calculada.
5. **Alerta de manutenção a 10%** (`b_Alerta_Manutencao`): limite novo, não confirmado; sem campo correspondente em DB150/DB158 hoje.
6. **Nomes de tag do texto:** `kW_sem_carga` e `kw_real` não são nomes do projeto (HTML: `BASE`; PLC: `BaseKW` e `kwReal[]` do DB150/DB158). A tag de potência no PLC é `db52_BancoTeste2_DSE.potenciaKw` (não `.kw`) — `ESPECIFICACAO_CARD_CHAVES_DB55_FB200.md`, seção 8.
7. **Identificadores com acento** (`r_Tensão_FN_Media`) fogem do padrão de comentários/nomes do projeto (skill `padrao-comentarios-scl`).
8. O item 1.1 diz "erro da abordagem anterior" sem dizer qual erro. A fórmula do projeto não usa tensão de linha "pura"; usa a média das três tensões.

**(c) A desenvolver — só depois de decisão do usuário**
- Decidir se o texto entra como **ajuste** no que já existe (FB100/HTML/flows) ou como bloco novo.
- Definir fonte única do R teórico (por chave, com `nominal[]`) e confirmar a fórmula na bancada.
- Definir se haverá alerta de manutenção (limite, onde fica no DB, como aparece no HTML).

**Glossário (contexto)**
- **V_FN / V_LL:** tensão fase-neutro / tensão entre fases (linha).
- **Carga resistiva em estrela:** cada resistor liga uma fase ao neutro; P_total = 3 · V_FN² / R.
- **Manutenção preditiva:** detectar o desgaste do resistor pela deriva de R medido × R de fábrica.
