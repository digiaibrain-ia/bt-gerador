---
name: cinco-fundamentos-auditoria-codigo
description: Os 5 prompts de auditoria de codigo feito com IA (testes de integracao, nunca confie no cliente, race condition, idempotencia, separacao de responsabilidades), publicados pelo Mano Deyvin no Substack. Use ao auditar, endurecer ou refatorar um app ou fluxo, ou quando o usuario pedir "os 5 fundamentos". Inclui o mapa de adaptacao ao projeto BT2 (Node-RED, PLC, HTML) e o que ja foi executado.
---

# Os 5 fundamentos de auditoria de código

**Origem:** 5 prompts publicados pelo Mano Deyvin no Substack dele, entregues pelo Reginaldo. Os textos originais estão **na íntegra** em `references/` (não foram resumidos nem reescritos). Esta skill só organiza o uso.

## Quando usar
Auditar ou endurecer código feito com IA; antes de mexer em código legado; ao preparar uma refatoração; quando o usuário pedir "os 5 fundamentos".

## Ordem recomendada (do próprio material)
1. `references/05_testes_de_integracao.md` — primeiro, para travar o comportamento atual.
2. `references/03_nunca_confie_no_cliente.md` — segurança.
3. `references/01_race_condition.md` e `references/02_idempotencia.md` — consistência de dados.
4. `references/04_separacao_de_responsabilidades.md` — por último, já protegido pelos testes.

## Como usar
1. Ler o arquivo do fundamento e usar o prompt como roteiro. **Todos terminam com "mostre o plano antes de alterar"**: seguir isso à risca (plano → OK do usuário → executar).
2. Os prompts foram escritos para app web com banco (Stripe, Supabase, RLS, pedidos). Em outro tipo de projeto, **adaptar o vocabulário, mantendo a estrutura e as regras** (ver a tabela abaixo, que é o caso do BT2).
3. Nunca rodar teste contra produção; nunca apagar dado sozinho; migration/mudança de produção só com revisão e OK do usuário.

## Adaptação ao projeto BT2 (Node-RED + PLC + HTML)
| Fundamento | Equivalente no BT2 | Já executado? (evidência) |
|---|---|---|
| 5 Testes de integração | Fluxos de produção lidos do disco, só os nós S7 trocados por PLC simulado; trava contra produção (4 camadas) | Sim — Fase 1: `tests/integracao/` (F1–F11, `t0_trava_producao`) |
| 3 Nunca confie no cliente | Rotas de escrita exigem Origin/Referer e `application/json`; endereços reais só por variável do PM2; intertravamento de segurança no PLC, não no HTML | Em parte — Fase 2 (`s1`, `s2`, `s3`); falta login/senha das rotas (Fase 2 do projeto) |
| 1 Race condition | Ler-decidir-gravar na fila de comandos de chaves, Setup, registro; vários aparelhos ao mesmo tempo | Em parte — Fase 3: `docs/bt2/fase3/FECHAMENTO_FASE3_v0.1.md` (P3-A1…A5 fechados; P3-E1 e P3-E2 abertos). **Dois aparelhos comandando juntos: não testado** |
| 2 Idempotência | `seq`/eco no pedido-resposta; repetição de comando, regravação do registro | Em parte — Fase 3; aberto: o front desiste aos 10 s e o comando ainda executa (R9/P3-E1) |
| 4 Separação de responsabilidades | Medidor HTML grande (interface + regra do Guiado + acesso a dados) | **Não feito, de propósito.** Só com testes de caracterização e OK; módulos já saem de `dashboard/modulos-fonte` por gerador |

Lentes extras do projeto (não fazem parte dos 5 prompts): **Demo × Real** (`docs/licoes/INVENTARIO_DEMO_X_REAL_v0.1.md`) e **Lições Aprendidas** (`docs/licoes/REGISTRO_LICOES_v0.1.md`, skills `bt2-licoes-*`).

## Regras do projeto que valem junto (CLAUDE.md)
Nunca alterar PC BT2, PLC 1515 ou DSE a partir do repositório; versão nova em vez de sobrescrever, gerada por script; teste que falha vira `todo` com ID e gravidade; achado fora do escopo vai para `BACKLOG_FORA_DE_ESCOPO.md`; relatório honesto (provado no simulador × depende da bancada); carga sempre desacoplada na bancada.
