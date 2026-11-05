# Perfil do projeto — bt-gerador (adaptação do Reversa)

Leia este arquivo antes de analisar. Ele adapta o Reversa (pensado para software legado genérico) ao stack deste repositório: PLC Siemens S7 (SCL/DB), Node-RED, Modbus TCP e dashboard HTML. Em caso de conflito com instruções genéricas dos agentes, vale este perfil.

## O que é o "legado" aqui

Sistema de supervisão e controle dos bancos de teste de geradores diesel (BT1 e BT2). Fluxo: `DSE --Modbus TCP--> Node-RED --API HTTP /api/--> Dashboard HTML`; o Node-RED também lê/escreve DBs do PLC dos bancos de carga via S7. Contexto de negócio em `docs/CONTEXTO_PROJETO_PROMPT_v0.1.md`, `docs/arquitetura.md` (ADR-0001 a 0004) e `docs/GLOSSARIO_TECNICO_PROJETO.md`.

## Módulos para o plano (Fase 2 — Escavação)

O Scout deve propor estes módulos (ajuste só se o repositório mudou). Cada módulo vira uma tarefa do Arqueólogo.

| Módulo | Onde | O que extrair |
|---|---|---|
| `plc-bancos-carga` | `plc/bancos_cargas/` | FB100 (setup das chaves), DB150/152/158/160, DB53 (SNAP do ensaio): fórmulas de kW real, resistência, setup por tensão |
| `plc-comunicacao-et200` | `plc/comunicacao_et200/` | FB101, DB38/DB39, watchdog, FC de vida do ET200 (ComOk/tVida) |
| `plc-variaveis` | `plc/variaveis/` | Tabelas de tags e endpoints S7 (CSV/XLSX): endereços, tipos, direção leitura/escrita |
| `nodered-flows` | `nodered/flows/*.json` | Um flow por card: rotas `http in`, nós `s7 in/out`, cache e leitura de volta, regras de 503, buffers de log |
| `dashboard-core` | `dashboard/src/` e `dashboard/modulos-fonte/` | Regras de tela, cálculos (setup, rodízio de chaves), modo operador, menu dev, chamadas à API |
| `dashboard-ferramentas` | `dashboard/ferramentas/` | Ferramentas HTML auxiliares (gerenciador de logs, gráfico do ensaio, mapa de FBs, visor de cards, maquete) |
| `catalogo-dse` | `catalogo/` | Catálogo de modelos de gerador (CSV + script Python) |

`docs/` não é módulo de código: é a **intenção documentada** (contratos HTTP, padrões, especificações). Use-a para confrontar com o código, não como fonte de verdade.

## Como ler cada tipo de arquivo

- **`.scl` / `.db`**: código e DBs exportados em texto. Extraia FBs/FCs (entradas, saídas, estáticas), máquinas de estado, fórmulas e offsets. Padrão de comentários em `.claude/skills/padrao-comentarios-scl/` e sintaxe em `.claude/skills/scl-syntax/`.
- **Fluxos Node-RED (`.json`)**: array plano de nós. Rotas: `jq -r '.[] | select(.type=="http in") | "\(.method) \(.url)"'`. Valide com `.claude/skills/nodered-documentacao/scripts/validate_flow.py`. Documentação dos nós em `.claude/skills/nodered-documentacao/`.
- **CSV/XLSX de variáveis**: fonte dos endereços S7. Cruze com o que o fluxo `s7 in/out` usa.
- **Dashboard**: `index.html` mais módulos JS em `dashboard/modulos-fonte/`; build em `dashboard/build/build.js` (gera HTML único). Versão em `dashboard/src/versao.json`.

## Regras do projeto que os agentes devem respeitar

1. **Nunca inventar** endereço, tag, registrador, offset de DB ou rota. Sem evidência no repositório, registre como 🔴 LACUNA e pergunte.
2. **Sempre citar o arquivo de origem** (e linha, quando possível) ao mencionar tag, DB, rota ou função.
3. **BT1 e BT2 são sistemas distintos** (ADR-0004): nunca misturar tags, DBs ou flows entre eles; as specs também ficam separadas ou identificadas por banco. `BTG` = geral, comum aos dois bancos (escopo citado nos docs).
4. **O Node-RED é o único cliente Modbus do DSE** (ADR-0001); o HTML nunca fala direto com PLC ou DSE.
5. **Código PLC exportado é proposta até validado no TIA Portal** ("não compilado" nos docs). Não afirme que roda no PLC real sem evidência: use 🟡.
6. **Sem segredos nas specs**: não copie IPs de planta, credenciais nem dados reais de ensaio para `_reversa_sdd/`. Mascare (`<ip-plc>`). Obs.: alguns fluxos exportados ainda trazem endereço de rede; trate como achado para o usuário, não reproduza.
7. **Rotas HTTP só em `/api/`** (`docs/PADRAO_ROTAS_API_NODERED.md`); `/api/dev/` é só de desenvolvedor.
8. Idioma: chat `pt-br`, specs em Português. Siglas e termos conforme `docs/GLOSSARIO_TECNICO_PROJETO.md` e `docs/PADRAO_SIGLAS_CARDS.md`.

## Adaptações por agente

- **Scout**: linguagens = SCL, JavaScript, HTML, JSON de flows, Python (catálogo). "Entry points" = flows com `http in`, `dashboard/src/index.html`, `.github/workflows/build-release.yml`. Não há testes automatizados: registre a ausência. Sugestão de organização das specs: `module` (módulos acima).
- **Arqueólogo**: tratar FBs/FCs como "funções"; DBs e UDTs como estruturas de dados; fórmulas de `docs/LOGICA_TRANSFORMACAO_v0.1.md` devem ser conferidas contra `fb100_setupChaves` e `dashboard/modulos-fonte/calculos_setup_*.js`.
- **Detetive**: máquinas de estado = modo manual/automático do ensaio, ciclo ligar/habilitar/selecionar das chaves, comandos persistentes (`docs/PROTECAO_COMANDOS_PERSISTENTES_CB.md`). Em vez de RBAC, mapeie quem pode o quê (operador x modo dev/"operador secreto"); apoie-se em `docs/MATRIZ_PODE_NAO_PODE_CHAVES_*.md` e na skill `matriz-pode-nao-pode`. Arqueologia Git: tags `medidor-v*`, `nodered-v*`, `plc-bt2-v*`.
- **Arquiteto**: C4 com atores operador e desenvolvedor, sistemas externos DSE/PLC/ET200, containers Node-RED e dashboard. No lugar de ERD, produza o **mapa de DBs do PLC** (DB38, DB39, DB52, DB53, DB150, DB152, DB158, DB160 etc.) com origem do arquivo.
- **Data Master**: "banco de dados" = Data Blocks S7 e tabelas de tags, não SQL. Não há banco relacional. Analise `plc/**/*.db`, `docs/DB_SNAP_layout.md` e `docs/DICIONARIO_DADOS_v0.1.md`.
- **Redator**: OpenAPI deve sair das rotas reais dos flows cruzadas com `docs/contratos/CONTRATO_HTTP_*`; divergência vira 🔴. User stories: operador (medir, setup, ensaio) e desenvolvedor (logs, diagnóstico).
- **Revisor**: confronte specs com `docs/` e liste divergências docs x código. Resolva lacunas com o usuário, nunca por suposição.

## Fora do escopo desta instalação

Foram instalados apenas Reversa (orquestrador), Scout, Arqueólogo, Detetive, Arquiteto, Redator, Revisor e Data Master. Os fluxos forward/migrate (`/reversa-forward`, `/reversa-migrate`, `/reversa-sync`), pricing, UI e debugger do repositório original não foram trazidos. Referências a eles nos arquivos originais podem ser ignoradas.

## Onde ficam os artefatos

`.reversa/` (estado, plano, configuração) e `_reversa_sdd/` (specs). A regra do Reversa de só escrever nessas pastas se mantém.
