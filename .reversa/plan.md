# Plano de Exploração — bt-gerador

> Adaptado ao stack do projeto (PLC Siemens S7, Node-RED, dashboard HTML). Perfil e regras: `.claude/skills/reversa/references/perfil-bt-gerador.md`.
> Marque cada tarefa com ✅ quando concluída. Edite à vontade antes de começar.

---

## Fase 1: Reconhecimento 🔍

- [ ] **Scout** — Estrutura de pastas e tecnologias (SCL, JS, HTML, JSON de flows, Python)
- [ ] **Scout** — Dependências (nós Node-RED, `package.json` se houver) e CI (`.github/workflows/build-release.yml`)
- [ ] **Scout** — Entry points: flows com `http in`, `dashboard/src/index.html`, build do dashboard

## Decisão de organização das specs 🗂️

> Sugestão do perfil: por módulo. A escolha é gravada em `.reversa/config.toml` (`[specs]`).

## Fase 2: Escavação 🏗️

- [ ] **Arqueólogo** — `plc-bancos-carga` (`plc/bancos_cargas/`: FB100, DB150/152/158/160, DB53)
- [ ] **Arqueólogo** — `plc-comunicacao-et200` (`plc/comunicacao_et200/`: FB101, DB38/39, watchdog)
- [ ] **Arqueólogo** — `plc-variaveis` (`plc/variaveis/`: tags e endpoints S7)
- [ ] **Arqueólogo** — `nodered-flows` (`nodered/flows/*.json`)
- [ ] **Arqueólogo** — `dashboard-core` (`dashboard/src/`, `dashboard/modulos-fonte/`)
- [ ] **Arqueólogo** — `dashboard-ferramentas` (`dashboard/ferramentas/`)
- [ ] **Arqueólogo** — `catalogo-dse` (`catalogo/`)

## Fase 3: Interpretação 🧠

- [ ] **Detetive** — Histórico Git (tags `medidor-v*`, `nodered-v*`, `plc-bt2-v*`) e ADRs retroativos
- [ ] **Detetive** — Regras de negócio e máquinas de estado (modo manual/automático, chaves, comandos persistentes)
- [ ] **Detetive** — Matriz pode/não pode por perfil (operador x desenvolvedor)
- [ ] **Arquiteto** — C4 (Contexto, Containers, Componentes)
- [ ] **Arquiteto** — Mapa de DBs do PLC e integrações (DSE, ET200, S7)
- [ ] **Arquiteto** — Spec Impact Matrix

## Fase 4: Geração 📝

- [ ] **Redator** — Specs SDD por módulo
- [ ] **Redator** — OpenAPI das rotas `/api/` (flows x `docs/contratos/`)
- [ ] **Redator** — User Stories (operador e desenvolvedor)
- [ ] **Redator** — Code/Spec Matrix

## Fase 5: Revisão ✅

- [ ] **Revisor** — Revisão cruzada de specs e divergências docs x código
- [ ] **Revisor** — Resolução de lacunas com o usuário
- [ ] **Revisor** — Relatório de confiança final

---

## Agentes Independentes

- [ ] **Data Master** — Mapa dos Data Blocks S7 (não há banco SQL)
