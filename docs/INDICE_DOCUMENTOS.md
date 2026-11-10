# Índice dos documentos — 10/11/2026

Gerado por `scripts/docs/gerar_indice_documentos_v0.1.py`. **Nada foi apagado:** os superados foram movidos (git mv) para `docs/arquivo/` na mesma subpasta; para voltar, `git mv` de volta.

## Comece por aqui
| O que | Arquivo |
|---|---|
| Onde estamos e o que falta | `docs/bt2/ANALISE_CONCLUSAO_2026-11-10.md` |
| Como implantar (ordem, rollback) | `docs/bt2/migracao/IMPLANTACAO_ROTEIRO_v0.9.md` |
| Checklist de bancada | `docs/bt2/migracao/CHECKLIST_BANCADA_v0.6.md` |
| Consolidação para a TI | `docs/bt2/migracao/HANDOFF_TI_v0.5.md` |
| Numeração de blocos e DBs (inclui o PLC de cargas 1200) | `docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx` |
| Pendências e achados | `BACKLOG_FORA_DE_ESCOPO.md` |
| Regras do projeto | `CLAUDE.md` |
| Criatividade (rastreio de ideias) | `docs/criatividade/LEIA-ME.md` |

## Versões atuais fora de `docs/`
- Medidor: `dashboard/ferramentas/medidor_gerador_v1.10.192.html` (+ `catalogo_ferramentas_v0.8.js`, `dashboard/modulos-fonte/menu_dev_v0.2.js`).
- Fluxos: `nodered/flows/bt2/` — `chaves-56/400-api-v3.5`, `chaves-550/595-api-v1.6`, `registro-ensaio-db2100-api-v1.8`, `dev-logs-api-v1.3`, `cliente-156-...-v3`, `cliente-31-...-db2000-v4`, `servidor-deepsea-api-gerador-v3_7`.
- PLC (rascunhos, não compilados): `plc/bt2/entrega_1200_v0.8/` (BC56 e BC400: 1515 + PLC de cargas 1200).

## Documentos válidos por pasta

### `docs/bt2/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `ANALISE_CONCLUSAO_2026-11-10.md` | Análise de conclusão do BT2 — 10/11/2026 |  |

### `docs/bt2/analise/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `ANALISE_ATUALIZACAO_v0.2.md` | Atualização da análise geral (03/11/2026) |  |
| `ANALISE_GERAL_v0.1.md` | Análise geral do projeto BT2 — operação, HTML, FBs (03/11/2026) |  |
| `BOTAO_DIREITO_ANALISE_v0.1.md` | Botão direito (menu de contexto) no medidor — análise (03/11/2026) |  |
| `ESPECIFICACAO_PORTE_SCL_SUGESTAO_v0.1.md` | Porte da sugestão de chaves para SCL — especificação (03/11/2026) |  |

### `docs/bt2/arquitetura/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `ANALISE_ARQUITETURA_BT2_v0.1.md` | Análise da arquitetura BT2 (v0.1) |  |
| `arquitetura_bt2_v0.5_editavel.html` |  |  |

### `docs/bt2/contratos/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `CONTRATO_HTTP_HTML_NODERED_CHAVES.md` | Contrato HTTP HTML <-> Node-RED do card "Chaves do banco de carga" (v2.4 - rotas `/api/...`, 24/10/2026) |  |
| `CONTRATO_HTTP_HTML_NODERED_DEV_LOGS.md` | Contrato HTTP — HTML ⇄ Node-RED · Logs do desenvolvedor [DEV.OBS] (23/10/2026) |  |
| `CONTRATO_HTTP_HTML_NODERED_REGISTRO_ENSAIO.md` | Contrato HTTP HTML ↔ Node-RED do card "Registro do ensaio" (DB53) — v1.4 — rotas `/api/ensaio/*` (22/10/2026) |  |
| `CONTRATO_HTTP_HTML_NODERED_SELECAO.md` | Contrato HTTP HTML ↔ Node-RED de seleção (como o HTML v1.9.0 implementa) |  |
| `PADRAO_ROTAS_API_NODERED.md` | Padrão de rotas HTTP do Node-RED (decisão do operador, 21/10/2026; atualizado 23/10/2026) |  |
| `servidor-deepsea-api-gerador-v3_6.md` | Fluxo DSE → /api/gerador — v3.6 (29/10/2026) |  |

### `docs/bt2/diagramas/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `fluxograma-arquitetura-v21.html` |  |  |

### `docs/bt2/ensaio/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `ANALISADOR_GRAFICO_v0.1.md` | Analisador de gráfico do ensaio — v0.1 |  |
| `ANALISE_COLETA_2026-10-29.md` | Análise da coleta — 29/10/2026 (PLC 1515F, flow do DSE v3.4) |  |
| `CHECKLIST_DECISAO_TESTE_REAL_BT2.md` | Checklist de decisão — preparação para o teste real do BT2 (4 geradores) |  |
| `CHECKLIST_VALIDACAO_ENSAIO_MANUAL_BT2_v6.md` | Checklist — Validação do Ensaio Manual BT2 (v6 — 23/10/2026) |  |
| `CRITERIOS_APROVACAO_ENSAIO_vs_ISO8528_v0.1.md` | Critérios de aprovação do ensaio × ISO 8528 / ISO 3046 · v0.1 · 24/10/2026 |  |
| `ENSAIO_AUTOMATICO_IMPEDIMENTOS_E_SIMULADOR_AMOSTRAS_v0.1.md` | Ensaio automático do BT2 — o que impede, e o simulador de Amostras (v0.1 · 25/10/2026) |  |
| `GRAFICO_ENSAIO_v0.1.md` | Página do gráfico do ensaio (segunda tela) — v0.1 |  |
| `MANUAL_GUIADO_v0.2.md` | Manual guiado + Catálogo DSE + Troca de resistência — v0.2 (medidor v1.9.83) |  |
| `MATRIZ_PODE_NAO_PODE_CHAVES_v1.9.72.md` | Matriz "isso pode / isso não pode" — clique em chaves (Demo local) — HTML v1.9.72 |  |
| `OPERADOR_SECRETO_1.10.141_headless_2026-11-03.txt` |  |  |
| `OPERADOR_SECRETO_1.10.154_headless_2026-11-03.txt` |  |  |
| `OPERADOR_SECRETO_1.10.159_headless_2026-11-03.txt` |  |  |
| `OPERADOR_SECRETO_1.10.160_headless_2026-11-03.txt` |  |  |
| `OperadorSecreto.txt` |  |  |
| `PROPOSTA_PERFIL_POR_MODELO_v0.1.md` | Proposta: onde guardar o comportamento específico de cada modelo de gerador — v0.1 (29/10/2026) |  |
| `REGISTRO_EVENTO_STOP_ENSAIO_BT2.md` | Registro de Evento de Campo — STOP do gerador durante ensaio armado (BT2) |  |
| `RODIZIO_CHAVES_v0.1.md` | Rodízio, sugestão de chaves e entrada escalonada — v0.1 |  |
| `ROTEIRO_FABRICA_2026-10-29_v0.3.md` | Roteiro de hoje na fábrica — 29/10/2026 (v0.3 · atualizado 17:50) |  |
| `ROTEIRO_TESTE_DEMO_PATAMAR_v0.1.md` | Roteiro de teste no Demo — Patamar com os 4 bancos (medidor 1.10.159) |  |
| `TESTE_GERADORES_IDEAIS_2026-11-03.md` | Teste automático no Demo — 5 geradores ideais, Patamar Auto (medidor 1.10.160, 03/11/2026) |  |

### `docs/bt2/fase3/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `FECHAMENTO_FASE3_v0.1.md` | Fase 3 - Condicoes de corrida e idempotencia: fechamento (v0.1) |  |
| `PROPOSTA_CORRECAO_PORTAO3_v0.1.md` | Fase 3, Portao 3 - Proposta de correcao (SEM implementar) - v0.1 |  |

### `docs/bt2/fase4/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `A0_A1_COMUNICACAO_E_BLOCOS_v0.1.md` | Portao A - A0 (comunicacao entre PLCs) e A1 (blocos novos do PLC) - v0.1 - RASCUNHO PARA REVISAO DO REGINALDO |  |
| `CHECKLIST_BANCADA_v0.2.md` | Checklist de bancada - Fase 4 (v0.2) - 06/11/2026 | SUPERADO, mantido: lido por scripts/pacote/gerar_pacote_fase4_v0.1.py (substituido por CHECKLIST_BANCADA_v0.3) |
| `LEIA-ME_ENTREGA_FASE4_v0.1.txt` |  | SUPERADO, mantido: lido por gerar_pacote_fase4_v0.1.py (substituido por LEIA-ME_ENTREGA_TI_v1.0) |
| `PLANO_1200_DB26_v0.3.md` | Plano: PLC 1200 do banco de cargas - v0.3 (06/11/2026) - CORRIGE a v0.2 (chaveamento); AGUARDA os DBs do progr | SUPERADO, mantido: lido por gerar_pacote_fase4_v0.1.py (DB26 nao vale mais) |
| `PLANO_DEV_OPERADOR_OCULTO_v0.1.md` | Plano - "Dev/Operador oculto" (antigo Operador secreto) avancado - v0.1 - 07/11/2026 - AGUARDA OK |  |
| `PLANO_FASE4_v0.2.md` | Plano da Fase 4 - v0.2 (06/11/2026) - AGUARDA OK DO REGINALDO |  |
| `RELATORIO_CENTRAL_FECHA_MOVE_v0.1.md` | Relatorio - Central de registros nao fechava nem se movia (medidor 1.10.174) - v0.1 - 06/11/2026 |  |
| `RELATORIO_GERADOR_OPERANDO_v0.1.md` | Relatorio - "gerador operando" com o DSE real (medidor 1.10.173) - v0.1 - 06/11/2026 |  |
| `RELATORIO_PORTAO_A_v0.1.md` | Relatorio do Portao A (Fase 4) - v0.1 - 06/11/2026 |  |
| `RELATORIO_PORTAO_B_v0.1.md` | Relatorio do Portao B (Fase 4) - v0.1 - 06/11/2026 - clique da chave que "nao entende mais" (BANC-3) |  |
| `RELATORIO_PORTAO_C_v0.1.md` | Relatorio do Portao C (Fase 4) - v0.1 - 06/11/2026 - medidor 1.10.170 |  |
| `RELATORIO_PORTAO_D_v0.1.md` | Relatorio do Portao D (Fase 4) - v0.1 - 06/11/2026 - Central de registros (medidor 1.10.171) |  |
| `RELATORIO_SETUP_CHAVEAMENTO_AUTO_v0.1.md` | Relatorio - chaveamento do Setup vindo dos Dados do ensaio (medidor 1.10.172) - v0.1 - 06/11/2026 |  |
| `ROTEIRO_ATUALIZACAO_FASE4_v0.1.md` | Roteiro de atualizacao - Fase 4 (06/11/2026) - v0.1 | SUPERADO, mantido: lido por gerar_pacote_fase4_v0.1.py (substituido por IMPLANTACAO_ROTEIRO_v0.6) |

### `docs/bt2/migracao/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `ANALISE_4_BANCOS_VISUAL_PLC_v0.2.md` | Análise: 4 Bancos de Carga — visual + blocos PLC (flexível) — v0.2 (01/11/2026) |  |
| `CHECKLIST_BANCADA_v0.6.md` | Checklist de validação de bancada — v0.3 (10/11/2026) |  |
| `CONTEXTO_MEDIDOR_GERADOR.md` | Contexto para continuar — Projeto Bancada de Testes (BT2) |  |
| `ET200_PREVISIBILIDADE_v0.1.md` | ET200 — previsibilidade (03/11/2026) |  |
| `HANDOFF_TI_v0.5.md` | Consolidação do repositório para a TI (handoff) — v0.2 (10/11/2026) |  |
| `IMPLANTACAO_ROTEIRO_v0.2.md` | Roteiro de implantação — BT2 (04/11/2026) — v0.2 | SUPERADO, mantido: citado dentro de dashboard/pacotes/bt2-1.10.166.zip (pacote ja entregue) |
| `IMPLANTACAO_ROTEIRO_v0.9.md` | Roteiro de implantação BT2 — v0.6 (10/11/2026) |  |
| `LEIA-ME_ENTREGA_TI_v1.0.txt` |  |  |
| `MIGRACAO_PLANO_v0.5.md` | Migração BT2 — plano v0.5 (03/11/2026) |  |
| `REVISAO_GERAL_HTML_NODERED_PLC_2026-10-24.md` | Revisão geral HTML × Node-RED × PLC — BT2 — 24/10/2026 |  |
| `ROTEIRO_ATUALIZACAO_NOTEBOOK_v0.1.md` | Roteiro unico de atualizacao: PLC + Node-RED + HTML (pelo notebook) - v0.1 |  |

### `docs/bt2/modulos/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `AJUDA_v0.1.md` | AJUDA v0.1 — botão e janela de ajuda padrão (29/10/2026) |  |
| `AJUSTES_SIZE_BANCOS_INSPETOR_v1.10.132.md` | Medidor 1.10.127→1.10.132 — SIZE, Banco de Cargas e inspetor |  |
| `AJUSTES_UI_TROCA_CATALOGO_FBTEMPOS_v1.10.124.md` | Medidor 1.10.124 — ajustes de UI, catálogo automático e FB Tempos (31/10/2026) |  |
| `API_CARDS_v0.1.md` | API_CARDS v0.1 — API interna dos cards (29/10/2026) |  |
| `BOTOES_SEM_BORDA_PLACAS_E_CABECALHO_v1.10.122.md` | Medidor 1.10.122 — cabeçalho limpo, botões sem borda, placas dos bancos (30/10/2026) |  |
| `DICA_UI_v0.1.md` | DICA DE INTERFACE v0.1 — "que elemento é este?" (29/10/2026) |  |
| `DSE_SIMULADO_v0.1.md` | DSE simulado ideal (medidor 1.10.116) |  |
| `ESCALONADOR_SUBDEGRAUS_v0.1.md` | ESCALONADOR DE ENTRADA (sub-degraus) — v0.1 |  |
| `EXPORTAR_E_IMPRESSAO_AUTOMATICA_v0.1.md` | EXPORTAR ▾ UNIFICADO + IMPRESSÃO AUTOMÁTICA — v0.1 |  |
| `FICHA_BANCO_TENSOES_v0.1.md` | FICHA DO BANCO — TENSÕES POR BANCO — v0.1 |  |
| `INDEX_v0.2.md` | index.html v0.2 (29/10/2026) — por que mostrava ✗ e o que mudou |  |
| `MANUAL_GUIADO_v0.5.md` | Manual guiado + Catálogo DSE + Troca de resistência — v0.5 (medidor v1.9.89) |  |
| `MAPA_FBS_v0.10.md` | MAPA_FBS v0.10 — mudanças sobre a v0.9 (29/10/2026) |  |
| `MAQUETE_LAYOUT_v0.2.md` | Maquete de layout v0.2 (`maquete_layout_v0.2.html`) |  |
| `MENU_DEV_E_CATALOGO_v0.1.md` | Menu ☰ de desenvolvimento + catálogo de ferramentas + página de entrada — v0.1 (medidor v1.10.109) |  |
| `MENU_DEV_v0.2_E_JANELAS_v0.3.md` | Menu ☰ v0.2 · Janelas v0.3 · Gráfico v0.10 · Medidor 1.10.118 (30/10/2026) |  |
| `PATAMAR_SETUP_CHAVEAMENTO_v1.10.121.md` | Medidor 1.10.121 — clique na sugestão, Setup redesenhado, chaveamento liga/desliga · flows chaves v2.6 — 30/10 |  |
| `QUATRO_BANCOS_NOS_DIALOGOS_v1.10.126.md` | Quatro bancos nos diálogos — medidor v1.10.126 |  |
| `QUATRO_BANCOS_VISUAL_E_MAPA_MOBILE_v1.10.125.md` | Medidor 1.10.125 + Mapa v0.14 — 4 bancos (visual) e mapa no celular (31/10/2026) |  |
| `SALVAMENTO_POR_PATAMAR_v0.2.md` | Salvamento "Por patamar" — correção do conceito (medidor 1.10.120 · FBs virtuais v0.10 · mapa v0.13) — 30/10/2 |  |
| `SINALIZACAO_CHAVEAMENTO_PELOS_DADOS_v1.10.123.md` | Medidor 1.10.123 — chaveamento sinalizado pelos Dados do ensaio (30/10/2026) |  |

### `docs/bt2/plc/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `ANALISE_FORMULAS_SETUP_E_DB_POR_TENSAO_v0.2.md` | Setup das chaves por chaveamento — implementação (v0.2 · 25/10/2026) |  |
| `DB_SNAP_layout.md` | Layout do DB SNAP (MANUAL e AUTO) — TIA Portal |  |
| `ESPECIFICACAO_CARD_CHAVES_DB55_FB200.md` | ATUALIZACAO v2 (20/10/2026) - decisoes do usuario e numeracao nova (prevalecem sobre o texto abaixo) |  |
| `ESPECIFICACAO_DB58_MODO_HEARTBEAT.md` | DB de batimento (heartbeat) — card Modo, BT2 — v0.2 (22/10/2026) — DB58 APROVADO |  |
| `MAPA_RENUMERACAO_BT2_v0.1.csv` |  |  |
| `MEMORIAL_CALCULO_KW_REAL_E_RESISTENCIA_BANCO_CARGA_v0.1.md` | Memorial de Cálculo e Especificação Técnica — kW real e resistência por fase do banco de carga · v0.1 · 24/10/ |  |
| `PASSO_A_PASSO_PUT_GET_1515_ET200_v4.md` | Troca de sinais entre CLPs — 1515 ⇄ ET200 (PUT/GET) — v4 (24/10/2026) |  |
| `PLANO_NUMERACAO_BLOCOS_PLC.md` | ATUALIZACAO v2 (20/10/2026 14:06) - decisoes do usuario (prevalecem sobre o texto abaixo) |  |
| `PLANO_NUMERACAO_BLOCOS_PLC_v6_exemplo.xlsx` |  | SUPERADO, mantido: lido por plc/bt2/gerador/gerar_plano_numeracao_v7.py (origem da v7) |
| `PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx` |  |  |
| `PROPOSTA_ARQUITETURA_FB_MAE_FILHOS_v0.1.md` | Proposta: FB mãe + FBs filhos (Manual guiado e Automático) — v0.1 |  |
| `PROPOSTA_SINAIS_LIGAR_BANCO_E_SELETORA_v0.2.md` | Sinais "Ligar banco" e "seletora Local/Remoto" (BC56 e BC400) · v0.2 · 24/10/2026 |  |
| `PROTECAO_COMANDOS_PERSISTENTES_CB.md` | Proteção contra comando de chave "que sobra" (cbLigar persistente) — BT2 — v0.1 (22/10/2026) |  |
| `REGISTRO_FLOW_CHAVES_BC56_DB150.md` | Flow Node-RED "Chaves BC56 (DB150)" — registro (20/10/2026) |  |
| `REGRA_NUMERACAO_DB_BT2.md` | Regra de numeração de DB/FB/FC e Setup de chaves — BT2 |  |
| `monitoramento-comunicacao-v1.md` | Monitoramento de Comunicação HTML ↔ Node-RED ↔ PLC |  |

### `docs/criatividade/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `LEIA-ME.md` | Criatividade do projeto BT2 — pasta de trabalho (10/11/2026) |  |
| `PROMPT_EXTRATO_v1.0.md` | Prompt de extrato das sessões do Project — v1.0 (10/11/2026) |  |
| `RASTREIO_IDEIAS_v0.1.xlsx` |  |  |
| `RASTREIO_IDEIAS_v0.2.xlsx` |  |  |
| `gerar_rastreio_v0.1.py` |  |  |
| `gerar_rastreio_v0.2.py` |  |  |

### `docs/criatividade/extratos/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `EXTRATO_S07_blocos_1200_medidor_2026-11-10.md` | EXTRATO S07 — esta sessão (blocos do PLC de cargas 1200, medidor, criatividade) — 10/11/2026 |  |

### `docs/geral/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `CONTEXTO_PROJETO_PROMPT_v0.1.md` | Contexto do projeto — Bancos de teste de geradores diesel (BT2 / bancos de carga) |  |
| `DICIONARIO_DADOS_v0.1.md` | Dicionário de dados — Setup das chaves (v0.1 · 25/10/2026) |  |
| `GLOSSARIO_TECNICO_PROJETO.md` | 📚 Glossário Técnico — Projeto Banco de Testes de Gerador Diesel |  |
| `LOGICA_TRANSFORMACAO_v0.1.md` | Lógica de transformação — Setup das chaves (v0.1 · 25/10/2026) |  |
| `PROCESSO_SINCRONIZACAO_PROJECT_GITHUB_v0.2.md` | Processo: Project (claude.ai) ⇄ GitHub ⇄ Sessão de código (Claude Web/Mobile) — v0.2 (01/11/2026) |  |
| `arquitetura.md` | Arquitetura |  |
| `fluxo-mobile.md` | Fluxo de trabalho: celular + GitHub + IA (sem PC da empresa) |  |

### `docs/licoes/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `DECISOES_AUTONOMAS_2026-11-08.md` | Decisões tomadas sem o Reginaldo (08/11/2026) — critério de pontuação |  |
| `INVENTARIO_AUTO_v1.10.190.md` | Inventário Demo × Real (gerado por script) |  |
| `INVENTARIO_DEMO_X_REAL_v0.1.md` | Inventário Demo × Real — medidor_gerador_v1.10.190 (v0.1, 08/11/2026) |  |
| `REGISTRO_LICOES_v0.1.md` | Registro de Lições Aprendidas — BT2 (v0.1, 08/11/2026) |  |
| `inventario_base.json` |  |  |

### `docs/padroes/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `GERENCIADOR_REVISAO_PADRAO_v0.1.md` | Gerenciador de revisão do padrão (código modular + comentários PT-BR + .MD) — v0.1 · 27/10/2026 |  |
| `MAPA_VERSOES_FUNCOES_v0.1.md` | MAPA DE VERSÕES — qual a função de cada número — v0.1 (28/10/2026) |  |
| `PADRAO_OCORRENCIAS_ALERTAS_FALHAS_v1.1.md` | Padrão de Alertas e Falhas (ocorrências) — código + texto — v1.1 (28/10/2026) |  |
| `PADRAO_SIGLAS_CARDS.md` | Padrão — Siglas de Card e Subcard (23/10/2026) |  |
| `REGRAS_NOMES_E_VERSOES_v0.2.md` | REGRAS DE NOMES E VERSÕES — v0.2 (28/10/2026) |  |
| `REGRA_LAYOUT_ESTAVEL_v0.1.md` | REGRA DO PROJETO — LAYOUT ESTÁVEL (indicadores visuais) — v0.1 (28/10/2026) |  |

### `docs/seguranca/`
| Arquivo | Assunto | Observação |
|---|---|---|
| `SENHA_TESTE_TRAVA_UX_v0.1.md` | Senha de testes "mwm": o que ela e e o que ela NAO e |  |

## Arquivados (movidos para `docs/arquivo/`)
| Antes | Agora | Substituído por |
|---|---|---|
| `docs/bt2/migracao/IMPLANTACAO_ROTEIRO_v0.1.md` | `docs/arquivo/bt2/migracao/IMPLANTACAO_ROTEIRO_v0.1.md` | IMPLANTACAO_ROTEIRO_v0.6 |
| `docs/bt2/migracao/IMPLANTACAO_ROTEIRO_v0.3.md` | `docs/arquivo/bt2/migracao/IMPLANTACAO_ROTEIRO_v0.3.md` | IMPLANTACAO_ROTEIRO_v0.6 |
| `docs/bt2/migracao/IMPLANTACAO_ROTEIRO_v0.4.md` | `docs/arquivo/bt2/migracao/IMPLANTACAO_ROTEIRO_v0.4.md` | IMPLANTACAO_ROTEIRO_v0.6 |
| `docs/bt2/migracao/IMPLANTACAO_ROTEIRO_v0.5.md` | `docs/arquivo/bt2/migracao/IMPLANTACAO_ROTEIRO_v0.5.md` | IMPLANTACAO_ROTEIRO_v0.6 |
| `docs/bt2/migracao/MIGRACAO_PLANO_v0.1.md` | `docs/arquivo/bt2/migracao/MIGRACAO_PLANO_v0.1.md` | MIGRACAO_PLANO_v0.5 |
| `docs/bt2/migracao/MIGRACAO_PLANO_v0.2.md` | `docs/arquivo/bt2/migracao/MIGRACAO_PLANO_v0.2.md` | MIGRACAO_PLANO_v0.5 |
| `docs/bt2/migracao/MIGRACAO_PLANO_v0.3.md` | `docs/arquivo/bt2/migracao/MIGRACAO_PLANO_v0.3.md` | MIGRACAO_PLANO_v0.5 |
| `docs/bt2/migracao/MIGRACAO_PLANO_v0.4.md` | `docs/arquivo/bt2/migracao/MIGRACAO_PLANO_v0.4.md` | MIGRACAO_PLANO_v0.5 |
| `docs/bt2/migracao/ANALISE_4_BANCOS_VISUAL_PLC_v0.1.md` | `docs/arquivo/bt2/migracao/ANALISE_4_BANCOS_VISUAL_PLC_v0.1.md` | ANALISE_4_BANCOS_VISUAL_PLC_v0.2 |
| `docs/bt2/migracao/CHECKLIST_BANCADA_v0.1.md` | `docs/arquivo/bt2/migracao/CHECKLIST_BANCADA_v0.1.md` | CHECKLIST_BANCADA_v0.3 |
| `docs/bt2/migracao/HANDOFF_TI_v0.1.md` | `docs/arquivo/bt2/migracao/HANDOFF_TI_v0.1.md` | HANDOFF_TI_v0.2 |
| `docs/bt2/migracao/LEIA-ME_ENTREGA_v0.2.txt` | `docs/arquivo/bt2/migracao/LEIA-ME_ENTREGA_v0.2.txt` | LEIA-ME_ENTREGA_TI_v1.0.txt |
| `docs/bt2/fase4/PLANO_FASE4_v0.1.md` | `docs/arquivo/bt2/fase4/PLANO_FASE4_v0.1.md` | PLANO_FASE4_v0.2 |
| `docs/bt2/fase4/PLANO_1200_DB26_v0.1.md` | `docs/arquivo/bt2/fase4/PLANO_1200_DB26_v0.1.md` | blocos do 1200 em plc/bt2/entrega_1200_v0.5 (DB26 nao vale mais) |
| `docs/bt2/fase4/PLANO_1200_DB26_v0.2.md` | `docs/arquivo/bt2/fase4/PLANO_1200_DB26_v0.2.md` | blocos do 1200 em plc/bt2/entrega_1200_v0.5 (DB26 nao vale mais) |
| `docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v4.xlsx` | `docs/arquivo/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v4.xlsx` | PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx |
| `docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v4_rascunho.csv` | `docs/arquivo/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v4_rascunho.csv` | PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx |
| `docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v5_exemplo.xlsx` | `docs/arquivo/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v5_exemplo.xlsx` | PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx |
| `docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v5.1_exemplo.xlsx` | `docs/arquivo/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v5.1_exemplo.xlsx` | PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx |
| `docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v5.2_exemplo.xlsx` | `docs/arquivo/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v5.2_exemplo.xlsx` | PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx |
| `docs/bt2/arquitetura/arquitetura_bt2_v0.1.html` | `docs/arquivo/bt2/arquitetura/arquitetura_bt2_v0.1.html` | arquitetura_bt2_v0.5_editavel.html |
| `docs/bt2/arquitetura/arquitetura_bt2_v0.1.mmd` | `docs/arquivo/bt2/arquitetura/arquitetura_bt2_v0.1.mmd` | arquitetura_bt2_v0.5_editavel.html |
| `docs/bt2/arquitetura/arquitetura_bt2_mermaid_v0.1.html` | `docs/arquivo/bt2/arquitetura/arquitetura_bt2_mermaid_v0.1.html` | arquitetura_bt2_v0.5_editavel.html |
| `docs/bt2/arquitetura/arquitetura_bt2_v0.2_tradicional_com_MES.html` | `docs/arquivo/bt2/arquitetura/arquitetura_bt2_v0.2_tradicional_com_MES.html` | arquitetura_bt2_v0.5_editavel.html |
| `docs/bt2/arquitetura/arquitetura_bt2_v0.3_ilustrada.html` | `docs/arquivo/bt2/arquitetura/arquitetura_bt2_v0.3_ilustrada.html` | arquitetura_bt2_v0.5_editavel.html |
| `docs/bt2/arquitetura/arquitetura_bt2_v0.4_ilustrada.html` | `docs/arquivo/bt2/arquitetura/arquitetura_bt2_v0.4_ilustrada.html` | arquitetura_bt2_v0.5_editavel.html |

## Ainda a revisar (não movidos, sem substituto claro)
- `docs/bt2/contratos/servidor-deepsea-api-gerador-v3_6.md`: descreve o v3_6; o fluxo atual é v3_7 sem documento próprio.
- `docs/bt2/ensaio/OPERADOR_SECRETO_*_headless_*.txt`: resultados antigos do robô; úteis só como histórico.
- `docs/bt2/plc/PASSO_A_PASSO_PUT_GET_1515_ET200_v4.md`: ainda descreve o ET200 provisório; confirmar o modelo do 1515 (FN03 x FM02) antes de reusar.
- Documentos sem versão no nome (ex.: `CONTEXTO_MEDIDOR_GERADOR.md`) não foram avaliados quanto à validade: precisam da sua leitura.

## Nota de 10/11/2026 (pacote da TI v1.1)
Roteiro v0.7, checklist v0.4 e handoff v0.3 substituem os v0.6, v0.3 e v0.2 (que continuam nas pastas porque o gerador do pacote v1.0 os lê). Só existem os bancos BC56 e BC400.

## Nota de 10/11/2026 (pacote da TI v1.2)
Roteiro v0.8, checklist v0.5 e handoff v0.4 substituem os v0.7, v0.4 e v0.3. Entra o `fb100_setupChaves` v0.4 no 1515. Fluxos antigos com IP: ver `BACKLOG_FORA_DE_ESCOPO.md`.

## Nota de 10/11/2026 (pacote da TI v1.3)
Roteiro v0.9, checklist v0.6 e handoff v0.5. O front da operação é só `03_front_operacao` (medidor + catálogo de modelos); `06_front_desenvolvimento` (index, catálogo de ferramentas, menu ☰ e ferramentas) não vai para o PC de operação.
