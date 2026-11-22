# Perfil do projeto — bt-gerador (adaptação do Reversa)

Leia este arquivo antes de analisar. Ele adapta o Reversa (pensado para software legado genérico) ao stack deste repositório: PLC Siemens S7 (SCL/DB), Node-RED, Modbus TCP e dashboard HTML. Em caso de conflito com instruções genéricas dos agentes, vale este perfil.

## O que é o "legado" aqui

Sistema de supervisão e controle dos bancos de teste de geradores diesel. Hoje só o **BT2** está em desenvolvimento (`bt1/` é reservada). Fluxo: `DSE --Modbus TCP--> Node-RED --API HTTP /api/--> Dashboard HTML`; o Node-RED também lê/escreve DBs dos PLCs (1515 e 1200 dos bancos de carga) via S7. Leia antes: `CLAUDE.md` (regras de trabalho), `README.md` (mapa de pastas), `docs/geral/arquitetura.md` (ADR-0001 a 0004), `docs/geral/CONTEXTO_PROJETO_PROMPT_v0.1.md` e `docs/geral/GLOSSARIO_TECNICO_PROJETO.md`. Os textos de documentos antigos citam caminhos anteriores; vale a tabela do README.

## Módulos para o plano (Fase 2 — Escavação)

O Scout deve propor estes módulos (ajuste se o repositório mudou). Cada módulo vira uma tarefa do Arqueólogo. Pastas `arquivo/` guardam versões antigas: ignore-as, exceto para arqueologia Git. Em cada família de arquivo versionado (`nome-vX.Y`), analise só a **versão mais nova**.

| Módulo | Onde | O que extrair |
|---|---|---|
| `plc-bt2` | `plc/bt2/` (`bancos_cargas/`, `entrega_1200_v*`, `entrega_et200_v*`, `entrega_lote_*`, `MANIFESTO_PLC_1515_BT2.md`) | FBs/FCs/DBs SCL do 1515 e do 1200: setup e supervisão das chaves, comunicação entre PLCs, intertravamentos, DBs numerados (DB3xxx, DB2xxx) |
| `plc-comunicacao-et200` | `plc/bt2/comunicacao_et200/` e `entrega_et200_v*` | Blocos do ET200 e regra "nada religa sozinho", ComOk/tVida, watchdog |
| `plc-variaveis` | `plc/bt2/variaveis/` | Tabelas de tags e endpoints S7 (CSV/XLSX): endereços, tipos, direção leitura/escrita |
| `nodered-flows` | `nodered/flows/bt2/*.json` (e `nodered/config/`) | Um flow por card/banco (BC56, BC400, BC550, BC595, DSE, ensaio, capacidade, dev-logs): rotas `http in`, nós `s7 in/out`, fila de comandos, cache, leitura de volta, 503 |
| `nodered-gerador` | `nodered/gerador/` e `nodered/gerador/rnc/` | Scripts Python que geram os fluxos (fonte da verdade dos JSON) e o núcleo de regras (RNC/capacidade) |
| `dashboard-core` | `dashboard/src/` (`js/`, `css/`, `index.html`, `versao.json`) e `dashboard/modulos-fonte/` | Regras de tela, rodízio de chaves, cálculos, modo operador, chamadas à API |
| `dashboard-ferramentas` | `dashboard/ferramentas/`, `dashboard/gerador/`, `dashboard/pacotes/` | Ferramentas HTML auxiliares, geradores e pacotes de entrega |
| `catalogo-dse` | `catalogo/` | Catálogo de modelos de gerador (CSV) |
| `testes` | `tests/` (`fb/`, `integracao/`, `e2e/`, `mutacao/`, `plc_modelo/`) | Casos de teste como evidência do comportamento esperado (registrar o que está `todo`) |

`docs/` (`geral/`, `padroes/`, `bt2/`) não é módulo de código: é a **intenção documentada** (contratos HTTP, decisões, padrões, especificações). Use-a para confrontar com o código, não como fonte de verdade. `scripts/`, `config/` e `referencias/` são apoio.

## Como ler cada tipo de arquivo

- **`.scl` / `.db`**: código e DBs exportados em texto. Extraia FBs/FCs (entradas, saídas, estáticas), máquinas de estado, fórmulas e offsets. Padrão de comentários em `.claude/skills/padrao-comentarios-scl/` e sintaxe em `.claude/skills/scl-syntax/`.
- **Fluxos Node-RED (`.json`)**: gerados por script em `nodered/gerador/` (a fonte é o script); array plano de nós. Rotas: `jq -r '.[] | select(.type=="http in") | "\(.method) \(.url)"'`. Valide com `.claude/skills/nodered-documentacao/scripts/validate_flow.py`. Documentação dos nós em `.claude/skills/nodered-documentacao/`.
- **CSV/XLSX de variáveis**: fonte dos endereços S7. Cruze com o que o fluxo `s7 in/out` usa.
- **Dashboard**: `index.html` mais módulos JS em `dashboard/modulos-fonte/`; build em `dashboard/build/build.js` (gera HTML único). Versão em `dashboard/src/versao.json`.

## Regras do projeto que os agentes devem respeitar

1. **Nunca inventar** endereço, tag, registrador, offset de DB ou rota. Sem evidência no repositório, registre como 🔴 LACUNA e pergunte.
2. **Sempre citar o arquivo de origem** (e linha, quando possível) ao mencionar tag, DB, rota ou função.
3. **BT1 e BT2 são sistemas distintos** (ADR-0004; hoje só o BT2 tem código): nunca misturar tags, DBs ou flows entre eles; as specs também ficam separadas ou identificadas por banco. `BTG` = geral, comum aos dois bancos (escopo citado nos docs).
4. **O Node-RED é o único cliente Modbus do DSE** (ADR-0001); o HTML nunca fala direto com PLC ou DSE.
5. **Código PLC exportado é proposta até validado no TIA Portal** ("não compilado" nos docs). Não afirme que roda no PLC real sem evidência: use 🟡.
6. **Sem segredos nas specs**: não copie IPs de planta, credenciais nem dados reais de ensaio para `_reversa_sdd/`. Mascare (`<ip-plc>`). Obs.: alguns fluxos exportados ainda trazem endereço de rede; trate como achado para o usuário, não reproduza.
7. **Regras do `CLAUDE.md` valem para o Reversa**: nunca alterar PC BT2, PLC 1515 ou DSE de produção; mudanças vão em versão nova e por script; falha de teste vira `todo`, nunca apagada; achado fora de escopo vai para `BACKLOG_FORA_DE_ESCOPO.md` (peça ao usuário, o Reversa só escreve em `.reversa/` e `_reversa_sdd/`). Skills do projeto `bt2-*` e `cinco-fundamentos-auditoria-codigo` complementam; consulte-as ao tocar em HTML, Node-RED, PLC ou testes.
8. **Rotas HTTP só em `/api/`** (`docs/bt2/contratos/PADRAO_ROTAS_API_NODERED.md`); `/api/dev/` é só de desenvolvedor.
9. Idioma: chat `pt-br`, specs em Português. Siglas e termos conforme `docs/geral/GLOSSARIO_TECNICO_PROJETO.md` e `docs/padroes/PADRAO_SIGLAS_CARDS.md`.

## Adaptações por agente

- **Scout**: linguagens = SCL, JavaScript, HTML, JSON de flows, Python (catálogo). "Entry points" = flows com `http in`, `dashboard/src/index.html`, `.github/workflows/build-release.yml`. Há testes em `tests/` (Node `--test`, integração, e2e, mutação): use-os como evidência e registre o que está `todo`. Sugestão de organização das specs: `module` (módulos acima).
- **Arqueólogo**: tratar FBs/FCs como "funções"; DBs e UDTs como estruturas de dados; fórmulas de `docs/geral/LOGICA_TRANSFORMACAO_v0.1.md` devem ser conferidas contra `fb100_setupChaves` e `dashboard/modulos-fonte/` (módulos de cálculo).
- **Detetive**: máquinas de estado = modo manual/automático do ensaio, ciclo ligar/habilitar/selecionar das chaves, comandos persistentes (`docs/bt2/plc/PROTECAO_COMANDOS_PERSISTENTES_CB.md`). Em vez de RBAC, mapeie quem pode o quê (operador x modo dev/"operador secreto"); apoie-se em `docs/bt2/ensaio/MATRIZ_PODE_NAO_PODE_CHAVES_*.md` e na skill `matriz-pode-nao-pode`. Arqueologia Git: tags `medidor-v*`, `nodered-v*`, `plc-bt2-v*`.
- **Arquiteto**: C4 com atores operador e desenvolvedor, sistemas externos DSE/PLC/ET200, containers Node-RED e dashboard. No lugar de ERD, produza o **mapa de DBs do PLC** (DB38, DB39, DB52, DB53, DB150, DB152, DB158, DB160 etc.) com origem do arquivo.
- **Data Master**: "banco de dados" = Data Blocks S7 e tabelas de tags, não SQL. Não há banco relacional. Analise `plc/bt2/**/*.db`, `docs/bt2/plc/DB_SNAP_layout.md` e `docs/geral/DICIONARIO_DADOS_v0.1.md`.
- **Redator**: OpenAPI deve sair das rotas reais dos flows cruzadas com `docs/bt2/contratos/CONTRATO_HTTP_*`; divergência vira 🔴. User stories: operador (medir, setup, ensaio) e desenvolvedor (logs, diagnóstico).
- **Revisor**: confronte specs com `docs/` e liste divergências docs x código. Resolva lacunas com o usuário, nunca por suposição.

## Fora do escopo desta instalação

Foram instalados apenas Reversa (orquestrador), Scout, Arqueólogo, Detetive, Arquiteto, Redator, Revisor e Data Master. Os fluxos forward/migrate (`/reversa-forward`, `/reversa-migrate`, `/reversa-sync`), pricing, UI e debugger do repositório original não foram trazidos. Referências a eles nos arquivos originais podem ser ignoradas.

## Onde ficam os artefatos

`.reversa/` (estado, plano, configuração) e `_reversa_sdd/` (specs). A regra do Reversa de só escrever nessas pastas se mantém.
