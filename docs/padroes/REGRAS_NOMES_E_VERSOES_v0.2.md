# REGRAS DE NOMES E VERSÕES — v0.2 (28/10/2026)

> **Mudanças da v0.2 (medidor v1.10.103):** (1) o último número do medidor volta a ser **contador de entrega crescente** (1.10.103) e o número do meio é o **grupo de funções** — mapa em `MAPA_VERSOES_FUNCOES_v0.1.md`; (2) **chips de estado usam On/Off** (seção 3); (3) **indicadores visuais não mudam o layout** (`REGRA_LAYOUT_ESTAVEL_v0.1.md`); (4) **Exportar ▾** com TXT/MD/PDF (seção 4); (5) nomes de card: **Banco de Cargas**, **Etapas do Ensaio**, **Alertas e Falhas**.

## 1. Versionamento dos arquivos (como já é usado + o que passa a valer)
**Medidor (`medidor_gerador_vMAIOR.MENOR.ENTREGA.html`)** — regra escrita no próprio HTML (bloco "CONTROLE DE VERSÃO"), revista em 28/10/2026:
- **MAIOR** (1): geração da arquitetura (HTML único, sem servidor). Só muda se a arquitetura mudar.
- **MENOR** (10): **grupo de funções** (o "assunto" da fase). Sobe quando nasce um grupo de funções novo (ex.: 1.8 importar print do SAP, 1.9 chaves/ensaio manual BT2, 1.10 Patamar Guiado).
- **ENTREGA** (103): **contador de entrega, sempre crescente, nunca zera** (1.9.98 → 1.9.99 → 1.10.103…). Cada arquivo entregue ganha número novo; **nunca se sobrescreve** uma versão já entregue. 1.10.0/1/2 valem as entregas 100/101/102 (os arquivos não foram renomeados). Se nascer grupo novo: `1.11.104`, sem zerar.
- A cada versão: trocar `VERSAO`/`VERSAO_DATA`, item NO TOPO de `HISTORICO` e `<meta app-version>`.
- Supera a regra de 28/10 (manhã) "função nova zera a CORREÇÃO": o operador preferiu o contador crescente e o número do meio como indicador de função.
- O explorador de arquivos ordena por texto (`1.10.103` antes de `1.9.99`): use ordenação natural/por data. O mapa "qual função de cada número" está em `MAPA_VERSOES_FUNCOES_v0.1.md`.

**Módulos e ferramentas (`nome_v0.N.js/.html`)** — `0.` = em desenvolvimento, ainda NÃO validado em campo; N sobe a cada alteração (v0.6 → v0.7). Sai do 0.x só quando validado no equipamento real (vira 1.0).
**Documentos `.md`** — numeração própria (v0.N), sobe a cada revisão do texto; não precisa coincidir com a do módulo. O módulo e o medidor citam a versão do módulo embutido.
**Embutidos**: o medidor v1.10.103 traz inline fbs_virtuais_v0.7, gráfico v0.3 e mapa v0.5; o histórico do HTML diz quais.

## 2. Nomes de elementos de tela e blocos PLC (decisão do operador, 28/10/2026)
Objetivo: quem olha o PLC reconhece de qual tela/elemento/fluxo o bloco trata. Vale para blocos NOVOS ou REVISADOS; nada existente é renomeado sozinho.

| Tipo | Prefixo | Exemplo |
|---|---|---|
| Card (bloco principal da tela) | `card` | `cardDadosEnsaio`, `cardBancoDeCargas`, `cardRegistroEnsaio` |
| Sub card (parte dentro de um card) | `subCard` | `subCardSelecaoGerador`, `subCardBanco56` |
| Diálogo / janela | `dlg` | `dlgDadosEnsaio`, `dlgManualGuiado`, `dlgSetupChaves` |
| Chip (etiqueta de estado) | `chip` | `chipGeradorEstado`, `chipSeletora` |
| Fluxo (sequência/processo) | `fluxo` | `fluxoEnsaioManual`, `fluxoGuiado` |

**No PLC (proposta — a confirmar antes de aplicar; números de bloco seguem o PLANO_NUMERACAO_BLOCOS_PLC.md, sem inventar):**
- Nome do bloco = tipo de bloco + nome da tela: `FB_cardBancoDeCargas`, `DB_cardBancoDeCargas`, `FC_fluxoEnsaioManual`.
- Dentro do DB/UDT do card, um STRUCT por parte: `subCardBanco56 : STRUCT … END_STRUCT`, `dlgSetupChaves : STRUCT …`, `chipSeletora : STRUCT …` — assim o caminho do tag já diz onde aparece na tela (`DB_cardBancoDeCargas.subCardBanco56.chave[3]`).
- Comentários em PT-BR seguem o padrão já adotado (porquê técnico + versão leiga).

**No HTML** os ids atuais (ex.: `dlgDados`, `dlgGuiado`, `dlgChSetup`, `dlgRes`, `bIni`) continuam como estão; a correspondência com os nomes novos será listada na revisão final (ASSUMIDO — não renomear agora, evita regressão).


## 3. Chips de estado: On / Off (decisão do operador, 28/10/2026)
Chip que mostra um estado liga/desliga usa **"Nome: On"** / **"Nome: Off"** (On/Off é inglês, mas universal e usual na indústria; ocupa menos espaço que "ligado/desligado"). Detalhes (aguardando INICIAR, falha…) vão no tooltip, não no texto do chip. Já aplicado: **Patamar: On/Off** (card Banco de Cargas). Cores: neutro = Off; verde = On; vermelho = On com falha; amarelo = Off mas o ensaio está iniciado (nada será sugerido). Chips de conexão ficam no ícone **ⓘ** do cabeçalho (só ⓘ ✓ / ⓘ ✗ / ⓘ SIM à vista).
No PLC o estado equivalente segue a regra da seção 2 (`chipPatamarGuiado : STRUCT` com `on : BOOL`).

## 4. Exportar (padrão desde a v1.10.103)
Um botão **Exportar ▾** por janela, com **Texto (.txt)**, **Markdown (.md)** e **PDF** — só os formatos que fazem sentido (gráfico: só PNG e CSV). **JSON** não entra no Exportar: é formato de máquina e fica separado, onde for necessário.

## 5. Nomes de card na tela (28/10/2026)
`Banco de Cargas` (antes "Cargas · banco de carga") · `Etapas do Ensaio` (antes "Etapas do ensaio · Padrão") · `Alertas e Falhas` (antes "Mensagens e falhas"; "Mensagem" fica para orientações ao operador). Siglas de card (`bco`, `ens`…) **não mudam**.
