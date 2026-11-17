# Análise de conclusão do BT2 — 10/11/2026

**Pergunta:** estamos na fase de conclusão ou falta algo a criar? **Resposta curta:** o lado do repositório (fluxos, HTML, testes com PLC simulado) está em fase de conclusão. O projeto **não está concluído**: faltam validações que só a bancada e a TI fazem, 4 decisões do Reginaldo e alguns documentos/pacotes a atualizar.

## 1. O que foi testado agora (regressão completa, medidor 1.10.191)
`npm --prefix tests/integracao test` com `BT2_FASE4_HTML=medidor_gerador_v1.10.191.html`: **300 testes, 294 passam, 0 falham, 0 cancelados, 6 `todo`** (achados conhecidos mantidos de propósito: P3-E1, P3-E2, F2-1, DR-1 e mais 2 do mesmo tipo "ACHADO"). Antes (08/11, medidor 1.10.190): 274 testes, 268 passam, 6 `todo`. O aumento vem dos testes novos (sbRet nos bancos 550/595, opção "perguntar ao final do ensaio"). Nenhum teste novo ficou vermelho. O PLC é simulado em memória.

## 2. Onde estamos na "Ordem da atualização" (CLAUDE.md)
| # | Etapa | Estado | Quem fecha |
|---|---|---|---|
| 1 | Backup (TIA e Node-RED exportado) | não feito (é no PC/TIA) | Reginaldo / TI |
| 2 | Etapa 1 do PLC: renumerar DBs (DB150 → DB3000…) | blocos e planilha v7 prontos (rascunho, **não compilado no TIA**) | Reginaldo / programador |
| 3 | Importar os JSON no Node-RED, uma aba por vez | fluxos prontos e testados: `chaves-56/400 v3.5`, `chaves-550/595 v1.6`; **o pacote da TI ainda lista versões antigas** (v3.4/v1.5, medidor 1.10.167) | falta atualizar o pacote (ver 4) |
| 4 | Etapas 2 e 3 (BC550, BC595) com blocos ET200/1200 | rascunho 1200 v0.5 entregue (blocos do ET200 portados, DB_ANY); lado do 1515 gerado; **não compilado, não testado no PLC** | programador / bancada |
| 5 | Checklist de bancada | `CHECKLIST_BANCADA_v0.1` desatualizado e **não executado** | Reginaldo + TI |

## 3. O que está provado e o que não está
**Provado (PLC simulado, Chromium):** rotas de chaves nos 4 bancos com a regra "SB some → CB cai" (sbRet), fila/janela de confirmação/idempotência, guarda de escrita, medidor 1.10.191 (robô Dev/Operador, Demo × Real no Setup, opção de aviso final), offsets dos telegramas de 16 e 32 chaves (scripts de verificação).
**Não provado:** compilação no TIA; PEEK/POKE com DB dinâmico na CPU do banco (firmware não informado); driver S7 real e tempos reais (`CONF_JANELA_MS`, BC595 com 33 escritas); Node-RED do PC BT2 (versão não confirmada, D-3); login/`adminAuth` e rede (D-4, D-5, TI); Poco X6 Pro real, Safari e Firefox; comportamento do 1200 em bancada.

## 4. O que ainda falta CRIAR (não é decisão, é entrega)
1. **Pacote da TI atualizado** (fluxos v3.5/v1.6, medidor 1.10.191, roteiro v0.6, checklist v0.2 com os testes do sbRet e dos DBs do 1200, `MANIFESTO.sha256`). O handoff atual (`HANDOFF_TI_v0.1`) e o roteiro v0.5 ainda citam v3.4/v1.5 e o medidor 1.10.167.
2. **Documentos desatualizados:** índice dos documentos válidos e mover os superados para `docs/arquivo/` (pedido do Reginaldo; nada foi apagado).
3. **Endereços fixos nos fluxos antigos** (`cliente-31`, `chaves-56/400 v2.6`): regra do projeto manda variável do PM2; trocar exige fluxo novo e OK (produção). Ver `BACKLOG_FORA_DE_ESCOPO.md`.
4. **FB100 v0.4 e FB102 v0.2:** arquivos existem; subir ao PLC é decisão do Reginaldo. O gerador `gerar_banco` ainda não os gera.
5. **`EnsaioAtivo`** fixo em FALSE nas chamadas (a tag real não existe no PLC).
6. **Controle remoto Start/Stop do DSE:** fluxos e documento de arquitetura estão só no Project (sessão S06), não no repositório; teste não visível; endereço dos LEDs (Page 14 × 190) não confirmado. Comando de gerador: segurança, nada em produção sem OK.

## 5. Decisões e confirmações do Reginaldo que travam o fechamento
- CPU do banco de carga: **1214FC** (decidido pelo Reginaldo em 10/11/2026, depois desta análise; o rascunho do 1200 foi escrito sem depender do modelo exato, mas PEEK/POKE e `TON_TIME` ainda precisam ser conferidos no TIA para a 1214FC).
- Modelo do 1515: `6ES7 515-2FN03-0AB0` (passo a passo) ou `6ES7 515-2FM02-0AB0` (1515F-2 PN, informado)?
- BANC-1 (ventilador sem monitoramento): decidido "futuro, não trava agora"; manter registrado como risco.
- Conexões S7 livres, ID da conexão e proteção de acesso da CPU do banco: "depois".

## 6. Parecer
Estamos em **fase de conclusão do desenvolvimento em repositório**. O próximo passo não é codar mais funções: é (a) fechar os itens 1 e 2 da seção 4, (b) o Reginaldo responder as duas dúvidas de modelo de CPU, (c) levar o pacote à bancada com a carga de potência **desacoplada**, backup antes e OK explícito. Só depois da bancada o BT2 pode ser dado como concluído. Esta análise é relato do assistente, com base no repositório e na regressão de hoje.
