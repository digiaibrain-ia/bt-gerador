# Gerenciador de revisão do padrão (código modular + comentários PT-BR + .MD) — v0.1 · 27/10/2026

**Objetivo:** no FIM do projeto, revisar em lote o que já existe, sem gastar token agora. Entregas novas já nascem no padrão (skill `padrao-codigo-modular-documentado`).
**Regra da revisão:** só comentários, Ajuda e .MD; **não muda lógica**; gera arquivo com versão nova; um lote por vez; o usuário escolhe a ordem.

## 1. Checklist por artefato (marcar S / N / n.a.)
| # | Critério |
|---|---|
| C1 | Cabeçalho: para que serve, de onde vêm os dados, o que NÃO faz, versão/data |
| C2 | Cada função/bloco/nó com "o que faz" + "porquê" |
| C3 | Constantes com origem ou "ASSUMIDO — a confirmar" |
| C4 | Falha/estado seguro descrito |
| C5 | Modular (parâmetros num lugar; adaptador separado) |
| C6 | .MD: dicionário de dados + lógica + instruções + padrão de comentários + glossário |
| C7 | Ajuda dentro do HTML explica o "porquê" (e não bloqueia a tela principal) |
| C8 | SCL: também segue `padrao-comentarios-scl` (moldura, REGION, nomes) |

## 2. Situação (a preencher; "conforme" = já nasceu no padrão)
| Grupo | Artefatos | Situação | Prioridade sugerida |
|---|---|---|---|
| Catálogo | `CATALOGO_GERADORES_v0.1/*` | conforme | — |
| Contexto | `CONTEXTO_v0.1/*` | conforme | — |
| Gráfico | `modulos/analisador_grafico_v0.2.js`, `grafico_ensaio_v0.1.html`, `.md` | conforme | — |
| Rodízio/guarda | `modulos/rodizio_chaves_v0.1.js`, `simulador_rodizio_v0.1.html`, `mapa_fbs_v0.1.html`, `.md` | conforme (Ajuda por tela: pendente, ver §3) | — |
| Medidor | `medidor_gerador_v1.9.80.html` (+ anteriores) | **a revisar** (trechos novos conformes; legado não verificado) | 1 |
| Node-RED | `nodered/*.json` (v2.5 chaves, dev-logs, registro-ensaio, simulador-dse) | **a revisar** (info dos nós + .MD irmão) | 2 |
| PLC SCL | `plc_bancos_cargas/fb100_setupChaves_v0.3.scl`, `fb101_*`, `db*_*.db`, `db38_db39_*`, `fb_watchdog_*` | **a revisar** (C8 incluso) | 3 |
| Ferramentas | `ferramentas/amostras_simulador_v0.4.html`, `painel_bt2_v0.2.html`, `gerenciador_logs_v1.2.html`, `simulador-dse-standalone/*` | **a revisar** | 4 |
| Documentos .md antigos | contratos HTTP, checklists, especificações | **a revisar** só se faltar dicionário/lógica/instruções | 5 |

## 3. Pendências já decididas para o fim do projeto
1. **Ajuda por tela:** o botão "Ajuda" do amostras-simulador (e do medidor) bloqueia a tela principal. Plano: um HTML de ajuda por tela = réplica do frontend (imagem + mesma interação, sem backend); depois juntar tudo numa ajuda única com índice (estilo ajuda de software, visual moderno).
2. **Percentual de segurança** da guarda de capacidade (hoje 110 % provisório; critério único para todos os geradores).
3. **Limpeza do Project** (excede o limite de conhecimento): ver versões antigas candidatas à remoção.

## 4. Como usar este gerenciador
Dizer "revisar lote N": eu abro só os arquivos do lote, aplico o checklist, entrego versões novas e atualizo a coluna Situação. Quem não for revisado fica registrado aqui (nada se perde).

## Glossário
**Legado:** o que já existia antes do padrão. **Lote:** grupo de arquivos revisado de uma vez. **Conforme:** já atende C1–C8.
