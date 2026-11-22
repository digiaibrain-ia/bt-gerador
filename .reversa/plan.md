# Plano de Exploração — bt-gerador

> Adaptado ao stack do projeto (PLC Siemens S7, Node-RED, dashboard HTML). Perfil e regras: `.claude/skills/reversa/references/perfil-bt-gerador.md`.
> Leia também `CLAUDE.md` (regras do projeto). Marque cada tarefa com ✅ quando concluída. Edite à vontade antes de começar.

---

## Fase 1: Reconhecimento 🔍

- [ ] **Scout** — Estrutura de pastas e tecnologias (SCL, JS, HTML, JSON de flows, Python), ignorando `arquivo/`
- [ ] **Scout** — Dependências (nós Node-RED, `package.json` se houver) e CI (`.github/workflows/build-release.yml`)
- [ ] **Scout** — Entry points: flows com `http in`, `dashboard/src/index.html`, build do dashboard, `tests/`

## Decisão de organização das specs 🗂️

> Sugestão do perfil: por módulo. A escolha é gravada em `.reversa/config.toml` (`[specs]`).

## Fase 2: Escavação 🏗️

- [ ] **Arqueólogo** — `plc-bt2` (`plc/bt2/`: entregas 1200/1515, `bancos_cargas/`, manifesto)
- [ ] **Arqueólogo** — `plc-comunicacao-et200` (`plc/bt2/comunicacao_et200/`, `entrega_et200_v*`)
- [ ] **Arqueólogo** — `plc-variaveis` (`plc/bt2/variaveis/`: tags e endpoints S7)
- [ ] **Arqueólogo** — `nodered-flows` (`nodered/flows/bt2/`: só a versão mais nova de cada flow)
- [ ] **Arqueólogo** — `nodered-gerador` (`nodered/gerador/`, `nodered/gerador/rnc/`)
- [ ] **Arqueólogo** — `dashboard-core` (`dashboard/src/`, `dashboard/modulos-fonte/`)
- [ ] **Arqueólogo** — `dashboard-ferramentas` (`dashboard/ferramentas/`, `dashboard/gerador/`, `dashboard/pacotes/`)
- [ ] **Arqueólogo** — `catalogo-dse` (`catalogo/`)
- [ ] **Arqueólogo** — `testes` (`tests/`: o que cada teste prova e o que está `todo`)

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
