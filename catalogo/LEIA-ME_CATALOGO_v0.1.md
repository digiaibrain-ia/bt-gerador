# Catálogo de modelos de gerador (a partir dos `.dse`) — v0.1

**Fonte:** Google Drive `ensaioAuto/Config` (zips de configuração dos controladores DSE).
**Script:** `catalogo_dse_v0.1.py` · **Saídas:** `catalogo_modelos_v0.1.csv` (1 linha por `.dse`), `catalogo_outros_arquivos_v0.1.csv` (pdf/frt/lnk/txt).
**Regra:** nada presumido. Cada coluna vem da tag do XML (ou do nome do arquivo, colunas `_nome`). Divergências só geram `alerta`.

## 1. Cobertura

| Família (zip) | Arquivos `.dse` lidos | Observação |
|---|---|---|
| DSEG-4501 | 525 | controlador G4500 |
| DSE 4520MKII | 581 | |
| DSE 4520MKII_BGD_EXPORTACAO | 177 | |
| DSE 7420MKII_GAS | 126 | |
| DSE 8610MKII_GAS | 119 | |
| DSE 8620MKII_GAS | 106 | |
| DSE 8660MKII | 29 | |
| **Total lido** | **1.663** | 108 com alerta (107 de kW/kVA fora de 0,7–0,9; 1 de Hz nome × XML) |

**NÃO lidos (pendência — o conector do Drive só baixa arquivo até 10 MB):** `DSE 7420MKII.zip` (18 MB), `DSE 8610MKII.zip` (15 MB), `DSE 8620MKII.zip` (11 MB), `DSE 8610MKII_MAR.zip` (8 MB, o download falhou) e `setup_usw3_3660…zip` (50 MB, software, não é configuração).
**Ação pedida ao usuário:** descompactar essas pastas no Drive (ou anexar aqui) para entrarem no catálogo.
**Pastas não-DSE vistas só pelo nome (nada extraído):** DEIF (AGC150, Z_SOFTWARE), L_SERIES, APLICACOES ESPECIAIS (CONTROLES 107, 5735_5736, 1887, 690490, 4250…), DSE 331 ATS, DSE 335 ATS, DSE 2520MKII e 2610MKII (painéis remotos), CALIBRAÇÕES ECU GÁS/BIOGÁS. Ficam para a etapa "não-DSE".

## 2. Dicionário de dados (colunas do CSV)

| Coluna | Origem | Significado |
|---|---|---|
| `familia_zip`, `pasta_modelo`, `arquivo`, `caminho` | arquivo | onde está o `.dse` |
| `ctrl_codigo`, `ctrl_descricao` | XML `ModuleTypeCode`, `Header/Description` | controlador |
| `kVA_nome`, `Hz_nome`, `V_nome`, `V_bateria_nome` | **nome do arquivo** | convenção de quem salvou (não é medição) |
| `V_fn_xml` | XML `Nominal_Voltage` | tensão **fase-neutro** (ex.: 220) |
| `V_ff_comentario` | atributo `Comment` do mesmo campo | tensão **de linha** (ex.: "381V PhPh" → 381) |
| `Hz_xml` | `Nominal_Frequency` | frequência nominal |
| `I_nom_A` | `Full_Load_Rating` / `Gen_Full_Load_Rating` / `Generator_Full_Load_Rating` | corrente nominal |
| `CT_prim_A` | `CT_Primary` | primário do TC |
| `kW_xml`, `kVAr_xml` | `kW_Rating`/`KWRating`, `kVArRating`/`KVARRating` | potências nominais |
| `salvo_em`, `bloco_lido` | `Header/Saved_on`, nome do bloco | quando foi salvo; qual configuração foi lida (principal) |
| `alerta` | calculado | divergências nome × XML; só aviso |

## 3. Lógica de transformação

1. Lê o XML; localiza o bloco da configuração **principal** (`Alternative_Config_Main` ou `*_0`). As configurações alternativas 1–3 **não** entram (outro arranjo de religação).
2. Cada dado é procurado por uma lista de nomes de tag (cada família grafa de um jeito).
3. O `Nominal_Voltage` é fase-neutro; a tensão de linha vem do `Comment`. Por isso **a coluna de linha é a que se compara com o nome do arquivo**.
4. Nome × XML: tensão e frequência concordaram em todos os arquivos, exceto 1 (`G4501AMF_MWMe_175KVA_60HZ_3T_12V`: nome 60 Hz × XML 50 Hz).
5. `kW/kVA` fora de 0,7–0,9 vira alerta (ex.: 40 kVA com 40 kW; 57 kVA com 52 kW). **Não é erro provado**: é sinal para a engenharia confirmar o que o `KW_Rating` representa (potência prime/standby?).

## 4. O que alimenta o quê (proposta, sem alterar nada ainda)

| Uso | Colunas candidatas | Status |
|---|---|---|
| Seletor de modelo em "Dados do ensaio" | `kVA_nome`, `V_ff_comentario`, `Hz_xml`, `kW_xml`, `ctrl_descricao` | a confirmar com o usuário quais campos preenchem o card |
| Gerador virtual ideal (Manual guiado sem DSE) | `kW_xml`, `V_ff_comentario`, `Hz_xml`, `I_nom_A` | 100 % = ? (kW de stand-by × 100/110 ou `kW_xml`): **depende da engenharia** |

## 5. Instruções

`python3 -I catalogo_dse_v0.1.py <pasta_dos_zips_extraidos> <pasta_de_saida>` → gera os dois CSV (abrem direto no Excel em português). Para incluir os zips pendentes: extraí-los na mesma pasta e rodar de novo.

## 6. Padrão de comentários

Igual ao de `modulos/ANALISADOR_GRAFICO_v0.1.md` §7 (o script segue: cabeçalho para equipe não técnica, "por quê" em cada função, nada presumido).

## Glossário

- **`.dse`:** arquivo de configuração do controlador DSE (texto XML).
- **Fase-neutro × de linha (PhPh):** 220 V entre fase e neutro ≈ 381 V entre duas fases.
- **KW_Rating:** potência ativa nominal gravada no controlador.
- **Configuração alternativa:** outro conjunto de valores (ex.: religação) guardado no mesmo arquivo.
