# Índice por área · 21/11/2026

Gerado por `scripts/docs/gerar_indice_por_area_v0.1.py`: **não edite à mão**, rode o script de novo quando entrar documento novo. Cada documento vivo tem um link aqui. De cada um aparece a **versão mais nova**, e as anteriores ficam ao lado. A pasta `arquivo` (histórico) fica de fora de propósito. Para começar, use o [00_COMECE_AQUI](00_COMECE_AQUI.md).

## Decisões (DEC)
_Cada decisão do Reginaldo, com data e motivo._

- [DEC-001 · Silenciar e Reconhecer cancelados](bt2/decisoes/DEC-001_silenciar_cancelado.md)
- [DEC-002 · Filtro automático de alarme de banco fora do teste](bt2/decisoes/DEC-002_filtro_automatico_banco_fora_do_teste.md)
- [DEC-003 · Tolerância de carga padrão de 3 pontos](bt2/decisoes/DEC-003_tolerancia_de_carga_3.md)
- [DEC-004 · Novo tipo de ocorrência: Informação](bt2/decisoes/DEC-004_tipo_informacao.md)
- [DEC-005 · Sugerir chaves só com o cronômetro parado](bt2/decisoes/DEC-005_sugerir_so_com_cronometro_parado.md)
- [DEC-006 · O Patamar liga só pelo Modo](bt2/decisoes/DEC-006_patamar_liga_so_pelo_modo.md)
- [DEC-007 · Falha de API repetida vira um registro só no log](bt2/decisoes/DEC-007_log_falha_repetida.md)
- [DEC-008 · O único limite de recusa é 110 % do kW a 100 % de cada gerador (degrau descartado)](bt2/decisoes/DEC-008_limite_unico_110_por_gerador.md)
- [DEC-009 · O modo "recusar" é um só e só liga depois da bancada](bt2/decisoes/DEC-009_modo_recusar_um_so_depois_da_bancada.md)
- [DEC-010 · Quando o DSE para de responder, as chaves caem (fail-safe)](bt2/decisoes/DEC-010_dse_cai_derruba_as_chaves.md)
- [DEC-011 · Os valores do perfil de combustível ficam como estão até conferir o datasheet](bt2/decisoes/DEC-011_perfil_de_combustivel_mantido_ate_o_datasheet.md)

## Promessas dos módulos (PRM)
_O que cada parte garante, em português. Você revisa a promessa; os testes conferem o código._

- [PRM-001 · O banco cai sem vida do 1515](bt2/promessas/PRM-001_banco_cai_sem_vida_do_1515.md)
- [PRM-002 · Comando de chave passa pela fila e pela confirmação](bt2/promessas/PRM-002_comando_de_chave_fila_e_confirmacao.md)
- [PRM-003 · Sugerir chaves só com o cronômetro parado](bt2/promessas/PRM-003_sugerir_so_com_cronometro_parado.md)
- [PRM-004 · O limite de capacidade nunca é passado, nem com comandos simultâneos](bt2/promessas/PRM-004_limite_de_capacidade_nunca_e_passado.md)
- [PRM-005 · A FB mãe do Patamar só comanda com o DSE respondendo e com a guarda liberando](bt2/promessas/PRM-005_fb_mae_so_comanda_com_dse_e_guarda.md)

## Auditoria, passos de 1 a 9 e provas
_Auditoria pelos 5 fundamentos, passos de correção, provas de teste, revisão independente e congelamento._

- [Passo 4: arquivar código legado (18/11/2026)](bt2/auditoria/ARQUIVO_PASSO_4_v0.1.md) · v0.1
- [Auditoria pelos 5 fundamentos (Mano Deyvin) — medidor 1.10.219, fluxo RNC v1.1, ET200 v0.7 · 17/11/2026](bt2/auditoria/AUDITORIA_5_FUNDAMENTOS_v0.1.md) · v0.1
- [Auditoria pelos 5 fundamentos — rodada 2 (código novo da 1.10.219/220) · 17/11/2026](bt2/auditoria/AUDITORIA_5_FUNDAMENTOS_RODADA2_v0.1.md) · v0.1
- [Decisões por pontuação — perfil de combustível (gás/biometano) e revisão do escalonamento · 17/11/2026 · medidor 1.10.220](bt2/auditoria/DECISOES_PERFIL_COMBUSTIVEL_E_ESCALONAMENTO_v0.1.md) · v0.1
- [Modos de operação do medidor — matriz observada · 17/11/2026 · medidor 1.10.220](bt2/auditoria/MODOS_DE_OPERACAO_v0.1.md) · v0.1
- [Passo 3: build modular do medidor (1.10.227) · 18/11/2026](bt2/auditoria/PASSO_3_BUILD_MODULAR_v0.1.md) · v0.1
- [Passo 5 · A1 a A3: fixtures de teste e testes sempre na versão mais nova · 18/11/2026](bt2/auditoria/PASSO_5_A_FIXTURES_v0.1.md) · v0.1
- [Passo 5 · B1+B2: falha ao desligar/zerar o PLC não fica silenciosa (medidor 1.10.228) · 18/11/2026](bt2/auditoria/PASSO_5_B1_B2_CATCH_DE_COMANDO_v0.1.md) · v0.1
- [Passo 5 · B3/B4: triagem dos `catch` vazios e trava no CI (medidor 1.10.229) · 19/11/2026](bt2/auditoria/PASSO_5_B3_B4_CATCH_VAZIO_v0.1.md) · v0.1
- [Passo 5 · C1: limite de capacidade no backend, só registrando · 19/11/2026](bt2/auditoria/PASSO_5_C1_CAPACIDADE_NO_BACKEND_v0.1.md) · v0.1
- [Passo 5 · C2: recusa por capacidade e por degrau no backend (desligada por padrão) · 19/11/2026](bt2/auditoria/PASSO_5_C2_RECUSA_DE_CAPACIDADE_E_DEGRAU_v0.1.md) · v0.1
- [Passo 6: debounce de alarmes e log limpo do Node-RED (medidor 1.10.231) · 19/11/2026](bt2/auditoria/PASSO_6_ALARMES_E_LOGS_v0.1.md) · v0.1
- [Passo 7: provar que os testes valem (propriedades + mutação) · 19/11/2026](bt2/auditoria/PASSO_7_PROVAR_OS_TESTES_v0.1.md) · v0.1
- [Passo 8: esteira final e congelamento · medidor 1.10.231 · 19/11/2026](bt2/auditoria/PASSO_8_CONGELAMENTO_v0.1.md) · v0.1
- [Passo 9: corrida do limite de capacidade (reserva na saída da fila) · 20/11/2026](bt2/auditoria/PASSO_9_CORRIDA_DE_CAPACIDADE_v0.1.md) · v0.1
- [O que cada módulo crítico promete (para revisão independente) · 19/11/2026](bt2/auditoria/PROMESSAS_DOS_MODULOS_v0.1.md) · v0.1
- [Passos 1 e 2: medir e congelar (medidor 1.10.226) · 18/11/2026](bt2/auditoria/RELATORIO_PASSO_1_2_MEDIR_E_CONGELAR_v0.1.md) · v0.1
- [Resultado da auditoria: estava como, ficou como · 19/11/2026](bt2/auditoria/RESULTADO_ANTES_E_DEPOIS_v0.1.md) · v0.1
- [Registro: revisão independente do Passo 7 e das promessas · 19/11/2026](bt2/auditoria/REVISAO_INDEPENDENTE_PASSO_7_v0.1.md) · v0.1

## Implantação, bancada e handoff
_Roteiros, checklists, estados da bancada e entregas. O roteiro e o checklist de go-live mais novos estão aqui._

- [Análise: 4 Bancos de Carga — visual + blocos PLC (flexível) — v0.2 (01/11/2026)](bt2/migracao/ANALISE_4_BANCOS_VISUAL_PLC_v0.2.md) · v0.2
- [Checklist de validação de bancada — v0.8 (10/11/2026)](bt2/migracao/CHECKLIST_BANCADA_v0.8.md) · v0.8 · anteriores: [v0.7](bt2/migracao/CHECKLIST_BANCADA_v0.7.md), [v0.6](bt2/migracao/CHECKLIST_BANCADA_v0.6.md), [v0.5](bt2/migracao/CHECKLIST_BANCADA_v0.5.md), [v0.4](bt2/migracao/CHECKLIST_BANCADA_v0.4.md), [v0.3](bt2/migracao/CHECKLIST_BANCADA_v0.3.md)
- [Checklist de entrada em produção · medidor 1.10.231 + pacote v1.28 · 19/11/2026](bt2/migracao/CHECKLIST_GO_LIVE_v0.1.md) · v0.1
- [Contexto para continuar — Projeto Bancada de Testes (BT2)](bt2/migracao/CONTEXTO_MEDIDOR_GERADOR.md)
- [Estado da bancada em 14/11/2026 e próximos passos (2 semanas sem acesso à fábrica)](bt2/migracao/ESTADO_BANCADA_2026-11-14.md)
- [Estado do ET200 (IM 151-8, projeto Gerador_BC015) em 16/11/2026 — registro para o backup](bt2/migracao/ESTADO_ET200_2026-11-16.md)
- [ET200 — previsibilidade (03/11/2026)](bt2/migracao/ET200_PREVISIBILIDADE_v0.1.md) · v0.1
- [Consolidação do repositório para a implantação (handoff) — v0.8 (10/11/2026)](bt2/migracao/HANDOFF_IMPLANTACAO_v0.8.md) · v0.8 · anteriores: [v0.7](bt2/migracao/HANDOFF_IMPLANTACAO_v0.7.md), [v0.6](bt2/migracao/HANDOFF_IMPLANTACAO_v0.6.md)
- [Consolidação do repositório para a TI (handoff) — v0.5 (10/11/2026)](bt2/migracao/HANDOFF_TI_v0.5.md) · v0.5 · anteriores: [v0.4](bt2/migracao/HANDOFF_TI_v0.4.md), [v0.3](bt2/migracao/HANDOFF_TI_v0.3.md), [v0.2](bt2/migracao/HANDOFF_TI_v0.2.md)
- [Implantação do C1 (limite de capacidade que só registra) + medidor 1.10.229 · checklist v0.1 · 19/11/2026](bt2/migracao/IMPLANTACAO_C1_CHECKLIST_v0.1.md) · v0.1
- [Implantação do C2 + Passo 6 + medidor 1.10.231 · checklist v0.1 · 19/11/2026](bt2/migracao/IMPLANTACAO_C2_PASSO6_CHECKLIST_v0.1.md) · v0.1
- [Roteiro de implantação BT2 — v0.11 (10/11/2026)](bt2/migracao/IMPLANTACAO_ROTEIRO_v0.11.md) · v0.11 · anteriores: [v0.10](bt2/migracao/IMPLANTACAO_ROTEIRO_v0.10.md), [v0.9](bt2/migracao/IMPLANTACAO_ROTEIRO_v0.9.md), [v0.8](bt2/migracao/IMPLANTACAO_ROTEIRO_v0.8.md), [v0.7](bt2/migracao/IMPLANTACAO_ROTEIRO_v0.7.md), [v0.6](bt2/migracao/IMPLANTACAO_ROTEIRO_v0.6.md), [v0.2](bt2/migracao/IMPLANTACAO_ROTEIRO_v0.2.md)
- [LEIA-ME ENTREGA IMPLANTACAO v1.30](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.30.txt) · v1.30 *(abre no programa do Windows)* · anteriores: [v1.29](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.29.txt), [v1.28](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.28.txt), [v1.27](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.27.txt), [v1.26](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.26.txt), [v1.25](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.25.txt), [v1.24](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.24.txt), [v1.23](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.23.txt), [v1.22](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.22.txt), [v1.21](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.21.txt), [v1.20](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.20.txt), [v1.19](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.19.txt), [v1.18](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.18.txt), [v1.17](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.17.txt), [v1.16](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.16.txt), [v1.15](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.15.txt), [v1.14](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.14.txt), [v1.13](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.13.txt), [v1.12](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.12.txt), [v1.11](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.11.txt), [v1.10](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.10.txt), [v1.9](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.9.txt), [v1.8](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.8.txt), [v1.7](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.7.txt), [v1.6](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.6.txt), [v1.5](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.5.txt), [v1.4](bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.4.txt)
- [LEIA-ME ENTREGA TI v1.3](bt2/migracao/LEIA-ME_ENTREGA_TI_v1.3.txt) · v1.3 *(abre no programa do Windows)* · anteriores: [v1.2](bt2/migracao/LEIA-ME_ENTREGA_TI_v1.2.txt), [v1.1](bt2/migracao/LEIA-ME_ENTREGA_TI_v1.1.txt), [v1.0](bt2/migracao/LEIA-ME_ENTREGA_TI_v1.0.txt)
- [LEIA-ME PACOTE ALEXANDRE 1200 v0.1](bt2/migracao/LEIA-ME_PACOTE_ALEXANDRE_1200_v0.1.txt) · v0.1 *(abre no programa do Windows)*
- [Migração BT2 — plano v0.5 (03/11/2026)](bt2/migracao/MIGRACAO_PLANO_v0.5.md) · v0.5
- [Revisão geral HTML × Node-RED × PLC — BT2 — 24/10/2026](bt2/migracao/REVISAO_GERAL_HTML_NODERED_PLC_2026-10-24.md)
- [Roteiro unico de atualizacao: PLC + Node-RED + HTML (pelo notebook) - v0.1](bt2/migracao/ROTEIRO_ATUALIZACAO_NOTEBOOK_v0.1.md) · v0.1
- [Roteiro de implantação (v0.2: fluxos com a correção da corrida de capacidade) · pacote v1.30 (medidor 1.10.231) · feito por mim, passo a pas](bt2/migracao/ROTEIRO_IMPLANTACAO_REGINALDO_v0.2.md) · v0.2 · anteriores: [v0.1](bt2/migracao/ROTEIRO_IMPLANTACAO_REGINALDO_v0.1.md)

## Arquitetura
_Quem fala com quem._

- [Análise da arquitetura BT2 (v0.1)](bt2/arquitetura/ANALISE_ARQUITETURA_BT2_v0.1.md) · v0.1
- [arquitetura bt2 v0.5 editavel](bt2/arquitetura/arquitetura_bt2_v0.5_editavel.html) *(abre no programa do Windows)*
- [arquitetura bt2 v0.6 editavel](bt2/arquitetura/arquitetura_bt2_v0.6_editavel.html) *(abre no programa do Windows)*
- [gerar arquitetura v0.6](bt2/arquitetura/gerar_arquitetura_v0.6.py) · v0.6 *(abre no programa do Windows)*
- [BT2: resumo para a reunião (17/11/2026)](bt2/arquitetura/RESUMO_ARQUITETURA_REUNIAO_v0.1.md) · v0.1

## PLC, blocos e numeração
_Blocos, DBs, plano de numeração, equipamentos e CPUs._

- [Setup das chaves por chaveamento — implementação (v0.2 · 25/10/2026)](bt2/plc/ANALISE_FORMULAS_SETUP_E_DB_POR_TENSAO_v0.2.md) · v0.2
- [Layout do DB SNAP (MANUAL e AUTO) — TIA Portal](bt2/plc/DB_SNAP_layout.md)
- [Equipamentos e CPUs do BT2 — v0.1 (14/11/2026)](bt2/plc/EQUIPAMENTOS_E_CPU_v0.1.md) · v0.1
- [ATUALIZACAO v2 (20/10/2026) - decisoes do usuario e numeracao nova (prevalecem sobre o texto abaixo)](bt2/plc/ESPECIFICACAO_CARD_CHAVES_DB55_FB200.md)
- [DB de batimento (heartbeat) — card Modo, BT2 — v0.2 (22/10/2026) — DB58 APROVADO](bt2/plc/ESPECIFICACAO_DB58_MODO_HEARTBEAT.md)
- [INFOGRAFICO CHAMADAS BLOCOS v0.7](bt2/plc/INFOGRAFICO_CHAMADAS_BLOCOS_v0.7.html) · v0.7 *(abre no programa do Windows)* · anteriores: [v0.6](bt2/plc/INFOGRAFICO_CHAMADAS_BLOCOS_v0.6.html), [v0.5](bt2/plc/INFOGRAFICO_CHAMADAS_BLOCOS_v0.5.html), [v0.4](bt2/plc/INFOGRAFICO_CHAMADAS_BLOCOS_v0.4.html), [v0.3](bt2/plc/INFOGRAFICO_CHAMADAS_BLOCOS_v0.3.html), [v0.2](bt2/plc/INFOGRAFICO_CHAMADAS_BLOCOS_v0.2.html), [v0.1](bt2/plc/INFOGRAFICO_CHAMADAS_BLOCOS_v0.1.html)
- [MAPA RENUMERACAO BT2 v0.1](bt2/plc/MAPA_RENUMERACAO_BT2_v0.1.csv) · v0.1 *(abre no programa do Windows)*
- [Memorial de Cálculo e Especificação Técnica — kW real e resistência por fase do banco de carga · v0.1 · 24/10/2026](bt2/plc/MEMORIAL_CALCULO_KW_REAL_E_RESISTENCIA_BANCO_CARGA_v0.1.md) · v0.1
- [Monitoramento de Comunicação HTML ↔ Node-RED ↔ PLC](bt2/plc/monitoramento-comunicacao-v1.md)
- [Troca de sinais entre CLPs — 1515 ⇄ ET200 (PUT/GET) — v4 (24/10/2026)](bt2/plc/PASSO_A_PASSO_PUT_GET_1515_ET200_v4.md) · v4
- [ATUALIZACAO v2 (20/10/2026 14:06) - decisoes do usuario (prevalecem sobre o texto abaixo)](bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC.md)
- [PLANO NUMERACAO BLOCOS PLC v7.3](bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v7.3.xlsx) · v7.3 *(abre no programa do Windows)* · anteriores: [v7.2](bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v7.2.xlsx), [v7.1](bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v7.1.xlsx), [v7](bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx)
- [PLANO NUMERACAO BLOCOS PLC v6 exemplo](bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v6_exemplo.xlsx) *(abre no programa do Windows)*
- [Proposta: FB mãe + FBs filhos (Manual guiado e Automático) — v0.1](bt2/plc/PROPOSTA_ARQUITETURA_FB_MAE_FILHOS_v0.1.md) · v0.1
- [Sinais "Ligar banco" e "seletora Local/Remoto" (BC56 e BC400) · v0.2 · 24/10/2026](bt2/plc/PROPOSTA_SINAIS_LIGAR_BANCO_E_SELETORA_v0.2.md) · v0.2
- [Proteção contra comando de chave "que sobra" (cbLigar persistente) — BT2 — v0.1 (22/10/2026)](bt2/plc/PROTECAO_COMANDOS_PERSISTENTES_CB.md)
- [Flow Node-RED "Chaves BC56 (DB150)" — registro (20/10/2026)](bt2/plc/REGISTRO_FLOW_CHAVES_BC56_DB150.md)
- [Regra de numeração de DB/FB/FC e Setup de chaves — BT2](bt2/plc/REGRA_NUMERACAO_DB_BT2.md)
- [Roteiro de explicação — PLC de Carga (S7-1214FC) — v1.2 (11/11/2026)](bt2/plc/ROTEIRO_EXPLICACAO_PROGRAMADOR_1200_v1.2.md) · v1.2 · anteriores: [v1.1](bt2/plc/ROTEIRO_EXPLICACAO_PROGRAMADOR_1200_v1.1.md), [v1.0](bt2/plc/ROTEIRO_EXPLICACAO_PROGRAMADOR_1200_v1.0.md)

## Módulos do medidor
_Como cada módulo do medidor funciona (alarmes, Central de registros, mapa dos FBs, RNC...)._

- [AJUDA v0.1 — botão e janela de ajuda padrão (29/10/2026)](bt2/modulos/AJUDA_v0.1.md) · v0.1
- [Medidor 1.10.127→1.10.132 — SIZE, Banco de Cargas e inspetor](bt2/modulos/AJUSTES_SIZE_BANCOS_INSPETOR_v1.10.132.md) · v1.10.132
- [Medidor 1.10.124 — ajustes de UI, catálogo automático e FB Tempos (31/10/2026)](bt2/modulos/AJUSTES_UI_TROCA_CATALOGO_FBTEMPOS_v1.10.124.md) · v1.10.124
- [Alarme inteligente v0.2 (18/11/2026)](bt2/modulos/ALARME_INTELIGENTE_v0.2.md) · v0.2 · anteriores: [v0.1](bt2/modulos/ALARME_INTELIGENTE_v0.1.md)
- [API_CARDS v0.1 — API interna dos cards (29/10/2026)](bt2/modulos/API_CARDS_v0.1.md) · v0.1
- [Medidor 1.10.122 — cabeçalho limpo, botões sem borda, placas dos bancos (30/10/2026)](bt2/modulos/BOTOES_SEM_BORDA_PLACAS_E_CABECALHO_v1.10.122.md) · v1.10.122
- [Central de registros v0.4 — botão Exportar ▾ (15/11/2026) · medidor 1.10.210](bt2/modulos/CENTRAL_REGISTROS_v0.4_EXPORTAR.md)
- [Dados do ensaio — opção "Por nº de série (MES)" (medidor 1.10.202)](bt2/modulos/DADOS_ENSAIO_POR_NS_v0.1.md) · v0.1
- [Decodificador de número de série MWM v0.1](bt2/modulos/DECODIFICA_SERIE_MWM_v0.1.md) · v0.1
- [DICA DE INTERFACE v0.1 — "que elemento é este?" (29/10/2026)](bt2/modulos/DICA_UI_v0.1.md) · v0.1
- [DSE simulado ideal (medidor 1.10.116)](bt2/modulos/DSE_SIMULADO_v0.1.md) · v0.1
- [ESCALONADOR DE ENTRADA (sub-degraus) — v0.1](bt2/modulos/ESCALONADOR_SUBDEGRAUS_v0.1.md) · v0.1
- [EXPORTAR ▾ UNIFICADO + IMPRESSÃO AUTOMÁTICA — v0.1](bt2/modulos/EXPORTAR_E_IMPRESSAO_AUTOMATICA_v0.1.md) · v0.1
- [FICHA DO BANCO — TENSÕES POR BANCO — v0.1](bt2/modulos/FICHA_BANCO_TENSOES_v0.1.md) · v0.1
- [index.html v0.2 (29/10/2026) — por que mostrava ✗ e o que mudou](bt2/modulos/INDEX_v0.2.md) · v0.2
- [Manual guiado + Catálogo DSE + Troca de resistência — v0.5 (medidor v1.9.89)](bt2/modulos/MANUAL_GUIADO_v0.5.md) · v0.5
- [MAPA_FBS v0.19 — área do diagrama no celular (14/11/2026) · medidor 1.10.209](bt2/modulos/MAPA_FBS_v0.19.md) · v0.19 · anteriores: [v0.18](bt2/modulos/MAPA_FBS_v0.18.md), [v0.17](bt2/modulos/MAPA_FBS_v0.17.md), [v0.10](bt2/modulos/MAPA_FBS_v0.10.md)
- [Maquete de layout v0.2 (`maquete_layout_v0.2.html`)](bt2/modulos/MAQUETE_LAYOUT_v0.2.md) · v0.2
- [Menu ☰ de desenvolvimento + catálogo de ferramentas + página de entrada — v0.1 (medidor v1.10.109)](bt2/modulos/MENU_DEV_E_CATALOGO_v0.1.md) · v0.1
- [Menu ☰ v0.2 · Janelas v0.3 · Gráfico v0.10 · Medidor 1.10.118 (30/10/2026)](bt2/modulos/MENU_DEV_v0.2_E_JANELAS_v0.3.md) · v0.3
- [Medidor 1.10.121 — clique na sugestão, Setup redesenhado, chaveamento liga/desliga · flows chaves v2.6 — 30/10/2026](bt2/modulos/PATAMAR_SETUP_CHAVEAMENTO_v1.10.121.md) · v1.10.121
- [Quatro bancos nos diálogos — medidor v1.10.126](bt2/modulos/QUATRO_BANCOS_NOS_DIALOGOS_v1.10.126.md) · v1.10.126
- [Medidor 1.10.125 + Mapa v0.14 — 4 bancos (visual) e mapa no celular (31/10/2026)](bt2/modulos/QUATRO_BANCOS_VISUAL_E_MAPA_MOBILE_v1.10.125.md) · v1.10.125
- [Registro do ensaio v1.10 + medidor 1.10.203 — nº de série](bt2/modulos/REGISTRO_ENSAIO_V1.10_NS.md)
- [Area RNC no medidor (1.10.216, 16/11/2026)](bt2/modulos/RNC_AREA_MEDIDOR_v0.1.md) · v0.1
- [Salvamento "Por patamar" — correção do conceito (medidor 1.10.120 · FBs virtuais v0.10 · mapa v0.13) — 30/10/2026](bt2/modulos/SALVAMENTO_POR_PATAMAR_v0.2.md) · v0.2
- [Medidor 1.10.123 — chaveamento sinalizado pelos Dados do ensaio (30/10/2026)](bt2/modulos/SINALIZACAO_CHAVEAMENTO_PELOS_DADOS_v1.10.123.md) · v1.10.123

## Ensaio e registro
_Dados do ensaio, registro, gráficos e analisador._

- [Analisador de gráfico do ensaio — v0.1](bt2/ensaio/ANALISADOR_GRAFICO_v0.1.md) · v0.1
- [Análise da coleta — 29/10/2026 (PLC 1515F, flow do DSE v3.4)](bt2/ensaio/ANALISE_COLETA_2026-10-29.md)
- [Checklist de decisão — preparação para o teste real do BT2 (4 geradores)](bt2/ensaio/CHECKLIST_DECISAO_TESTE_REAL_BT2.md)
- [Checklist — Validação do Ensaio Manual BT2 (v6 — 23/10/2026)](bt2/ensaio/CHECKLIST_VALIDACAO_ENSAIO_MANUAL_BT2_v6.md) · v6
- [Critérios de aprovação do ensaio × ISO 8528 / ISO 3046 · v0.1 · 24/10/2026](bt2/ensaio/CRITERIOS_APROVACAO_ENSAIO_vs_ISO8528_v0.1.md) · v0.1
- [Ensaio automático do BT2 — o que impede, e o simulador de Amostras (v0.1 · 25/10/2026)](bt2/ensaio/ENSAIO_AUTOMATICO_IMPEDIMENTOS_E_SIMULADOR_AMOSTRAS_v0.1.md) · v0.1
- [Página do gráfico do ensaio (segunda tela) — v0.1](bt2/ensaio/GRAFICO_ENSAIO_v0.1.md) · v0.1
- [Manual guiado + Catálogo DSE + Troca de resistência — v0.2 (medidor v1.9.83)](bt2/ensaio/MANUAL_GUIADO_v0.2.md) · v0.2
- [Matriz "isso pode / isso não pode" — clique em chaves (Demo local) — HTML v1.9.72](bt2/ensaio/MATRIZ_PODE_NAO_PODE_CHAVES_v1.9.72.md) · v1.9.72
- [OPERADOR SECRETO 1.10.141 headless 2026-11-03](bt2/ensaio/OPERADOR_SECRETO_1.10.141_headless_2026-11-03.txt) *(abre no programa do Windows)*
- [OPERADOR SECRETO 1.10.154 headless 2026-11-03](bt2/ensaio/OPERADOR_SECRETO_1.10.154_headless_2026-11-03.txt) *(abre no programa do Windows)*
- [OPERADOR SECRETO 1.10.159 headless 2026-11-03](bt2/ensaio/OPERADOR_SECRETO_1.10.159_headless_2026-11-03.txt) *(abre no programa do Windows)*
- [OPERADOR SECRETO 1.10.160 headless 2026-11-03](bt2/ensaio/OPERADOR_SECRETO_1.10.160_headless_2026-11-03.txt) *(abre no programa do Windows)*
- [OperadorSecreto](bt2/ensaio/OperadorSecreto.txt) *(abre no programa do Windows)*
- [Proposta: onde guardar o comportamento específico de cada modelo de gerador — v0.1 (29/10/2026)](bt2/ensaio/PROPOSTA_PERFIL_POR_MODELO_v0.1.md) · v0.1
- [Registro de Evento de Campo — STOP do gerador durante ensaio armado (BT2)](bt2/ensaio/REGISTRO_EVENTO_STOP_ENSAIO_BT2.md)
- [Rodízio, sugestão de chaves e entrada escalonada — v0.1](bt2/ensaio/RODIZIO_CHAVES_v0.1.md) · v0.1
- [Roteiro de hoje na fábrica — 29/10/2026 (v0.3 · atualizado 17:50)](bt2/ensaio/ROTEIRO_FABRICA_2026-10-29_v0.3.md) · v0.3
- [Roteiro de teste no Demo — Patamar com os 4 bancos (medidor 1.10.159)](bt2/ensaio/ROTEIRO_TESTE_DEMO_PATAMAR_v0.1.md) · v0.1
- [Teste automático no Demo — 5 geradores ideais, Patamar Auto (medidor 1.10.160, 03/11/2026)](bt2/ensaio/TESTE_GERADORES_IDEAIS_2026-11-03.md)

## Contratos de API
_As rotas HTTP do Node-RED e o que cada uma devolve._

- [Contrato HTTP HTML <-> Node-RED do card "Chaves do banco de carga" (v2.4 - rotas `/api/...`, 24/10/2026)](bt2/contratos/CONTRATO_HTTP_HTML_NODERED_CHAVES.md)
- [Contrato HTTP — HTML ⇄ Node-RED · Logs do desenvolvedor DEV.OBS (23/10/2026)](bt2/contratos/CONTRATO_HTTP_HTML_NODERED_DEV_LOGS.md)
- [Contrato HTTP HTML ↔ Node-RED do card "Registro do ensaio" (DB53) — v1.4 — rotas `/api/ensaio/*` (22/10/2026)](bt2/contratos/CONTRATO_HTTP_HTML_NODERED_REGISTRO_ENSAIO.md)
- [Contrato HTTP HTML ↔ Node-RED de seleção (como o HTML v1.9.0 implementa)](bt2/contratos/CONTRATO_HTTP_HTML_NODERED_SELECAO.md)
- [Padrão de rotas HTTP do Node-RED (decisão do operador, 21/10/2026; atualizado 23/10/2026)](bt2/contratos/PADRAO_ROTAS_API_NODERED.md)
- [Fluxo DSE → /api/gerador — v3.6 (29/10/2026)](bt2/contratos/servidor-deepsea-api-gerador-v3_6.md)

## Fase 3 (concorrência e fila)
_Estresse, concorrência e fechamento da fase._

- [Fase 3 - Condicoes de corrida e idempotencia: fechamento (v0.1)](bt2/fase3/FECHAMENTO_FASE3_v0.1.md) · v0.1
- [Fase 3, Portao 3 - Proposta de correcao (SEM implementar) - v0.1](bt2/fase3/PROPOSTA_CORRECAO_PORTAO3_v0.1.md) · v0.1

## Fase 4 (travas de segurança)
_Travas, portões e as correções da fase._

- [Portao A - A0 (comunicacao entre PLCs) e A1 (blocos novos do PLC) - v0.1 - RASCUNHO PARA REVISAO DO REGINALDO](bt2/fase4/A0_A1_COMUNICACAO_E_BLOCOS_v0.1.md) · v0.1
- [Checklist de bancada - Fase 4 (v0.2) - 06/11/2026](bt2/fase4/CHECKLIST_BANCADA_v0.2.md) · v0.2
- [LEIA-ME ENTREGA FASE4 v0.1](bt2/fase4/LEIA-ME_ENTREGA_FASE4_v0.1.txt) · v0.1 *(abre no programa do Windows)*
- [Plano: PLC 1200 do banco de cargas - v0.3 (06/11/2026) - CORRIGE a v0.2 (chaveamento); AGUARDA os DBs do programador](bt2/fase4/PLANO_1200_DB26_v0.3.md) · v0.3
- [Plano - "Dev/Operador oculto" (antigo Operador secreto) avancado - v0.1 - 07/11/2026 - AGUARDA OK](bt2/fase4/PLANO_DEV_OPERADOR_OCULTO_v0.1.md) · v0.1
- [Plano da Fase 4 - v0.2 (06/11/2026) - AGUARDA OK DO REGINALDO](bt2/fase4/PLANO_FASE4_v0.2.md) · v0.2
- [Relatorio - Central de registros nao fechava nem se movia (medidor 1.10.174) - v0.1 - 06/11/2026](bt2/fase4/RELATORIO_CENTRAL_FECHA_MOVE_v0.1.md) · v0.1
- [Relatorio - "gerador operando" com o DSE real (medidor 1.10.173) - v0.1 - 06/11/2026](bt2/fase4/RELATORIO_GERADOR_OPERANDO_v0.1.md) · v0.1
- [Relatorio do Portao A (Fase 4) - v0.1 - 06/11/2026](bt2/fase4/RELATORIO_PORTAO_A_v0.1.md) · v0.1
- [Relatorio do Portao B (Fase 4) - v0.1 - 06/11/2026 - clique da chave que "nao entende mais" (BANC-3)](bt2/fase4/RELATORIO_PORTAO_B_v0.1.md) · v0.1
- [Relatorio do Portao C (Fase 4) - v0.1 - 06/11/2026 - medidor 1.10.170](bt2/fase4/RELATORIO_PORTAO_C_v0.1.md) · v0.1
- [Relatorio do Portao D (Fase 4) - v0.1 - 06/11/2026 - Central de registros (medidor 1.10.171)](bt2/fase4/RELATORIO_PORTAO_D_v0.1.md) · v0.1
- [Relatorio - chaveamento do Setup vindo dos Dados do ensaio (medidor 1.10.172) - v0.1 - 06/11/2026](bt2/fase4/RELATORIO_SETUP_CHAVEAMENTO_AUTO_v0.1.md) · v0.1
- [Roteiro de atualizacao - Fase 4 (06/11/2026) - v0.1](bt2/fase4/ROTEIRO_ATUALIZACAO_FASE4_v0.1.md) · v0.1

## Análises

- [Atualização da análise geral (03/11/2026)](bt2/analise/ANALISE_ATUALIZACAO_v0.2.md) · v0.2
- [Análise geral do projeto BT2 — operação, HTML, FBs (03/11/2026)](bt2/analise/ANALISE_GERAL_v0.1.md) · v0.1
- [Botão direito (menu de contexto) no medidor — análise (03/11/2026)](bt2/analise/BOTAO_DIREITO_ANALISE_v0.1.md) · v0.1
- [Porte da sugestão de chaves para SCL — especificação (03/11/2026)](bt2/analise/ESPECIFICACAO_PORTE_SCL_SUGESTAO_v0.1.md) · v0.1

## Defeitos

- [Passagem de sessão: sistema de RNC e retrabalho do gerador (piloto sem SQL) - v0.1 (13/11/2026)](bt2/defeitos/PASSAGEM_SESSAO_RNC_v0.1.md) · v0.1

## Passagem entre sessões
_Para quem assume o trabalho._

- [Passagem para a nova sessão: revisão da qualidade do código HTML e Node-RED (18/11/2026)](bt2/passagem/PASSAGEM_REVISAO_CODIGO_v0.1.md) · v0.1

## Padrões do BT2
_Padrão de fluxos e de comentários._

- [Padrão de comentários SCL: //F funcionamento e //M montagem no TIA (v0.1)](bt2/padroes/PADRAO_COMENTARIOS_SCL_FM_v0.1.md) · v0.1
- [Padrão de fluxos Node-RED do BT2 — v0.2 (14/11/2026)](bt2/padroes/PADRAO_FLUXOS_NODERED_v0.2.md) · v0.2 · anteriores: [v0.1](bt2/padroes/PADRAO_FLUXOS_NODERED_v0.1.md)

## Padrões gerais

- [Gerenciador de revisão do padrão (código modular + comentários PT-BR + .MD) — v0.1 · 27/10/2026](padroes/GERENCIADOR_REVISAO_PADRAO_v0.1.md) · v0.1
- [MAPA DE VERSÕES — qual a função de cada número — v0.1 (28/10/2026)](padroes/MAPA_VERSOES_FUNCOES_v0.1.md) · v0.1
- [Padrão de Alertas e Falhas (ocorrências) — código + texto — v1.1 (28/10/2026)](padroes/PADRAO_OCORRENCIAS_ALERTAS_FALHAS_v1.1.md) · v1.1
- [Padrão — Siglas de Card e Subcard (23/10/2026)](padroes/PADRAO_SIGLAS_CARDS.md)
- [REGRA DO PROJETO — LAYOUT ESTÁVEL (indicadores visuais) — v0.1 (28/10/2026)](padroes/REGRA_LAYOUT_ESTAVEL_v0.1.md) · v0.1
- [REGRAS DE NOMES E VERSÕES — v0.2 (28/10/2026)](padroes/REGRAS_NOMES_E_VERSOES_v0.2.md) · v0.2

## Raiz do BT2

- [Análise de conclusão do BT2 — 10/11/2026](bt2/ANALISE_CONCLUSAO_2026-11-10.md)

## Módulos (documentos gerais)

- [Card "Banco de Cargas": só os bancos selecionados — v0.1 (13/11/2026)](modulos/BANCOS_VISIVEIS_v0.1.md) · v0.1
- [img bancos visiveis v1.10.205](modulos/img_bancos_visiveis_v1.10.205.png) · v1.10.205 *(abre no programa do Windows)*
- [Passagem de sessão: tudo o que foi feito no código (RNC e visibilidade dos bancos) — v0.1 (15/11/2026)](modulos/PASSAGEM_SESSAO_RNC_CODIGO_v0.1.md) · v0.1
- [Plano de juntada: branch do RNC × branch da sessão BT2 — v0.1 (13/11/2026)](modulos/PLANO_JUNTADA_RNC_BT2_v0.1.md) · v0.1
- [Relatório do piloto · RNC e retrabalho do gerador — v0.1 (13/11/2026)](modulos/RELATORIO_PILOTO_RNC_v0.1.md) · v0.1
- [RNC · Revisão de código antes da bancada — v0.1 (13/11/2026)](modulos/REVISAO_CODIGO_RNC_v0.1.md) · v0.1
- [RNC · Roteiro do teste de bancada — v0.2 (13/11/2026)](modulos/RNC_CHECKLIST_BANCADA_v0.2.md) · v0.2 · anteriores: [v0.1](modulos/RNC_CHECKLIST_BANCADA_v0.1.md)
- [RNC · Pacote de bancada v0.3 — LEIA-ME (13/11/2026)](modulos/RNC_LEIA-ME_BANCADA_v0.2.md) · v0.2 · anteriores: [v0.1](modulos/RNC_LEIA-ME_BANCADA_v0.1.md)
- [RNC e retrabalho do gerador — v0.2 (etapas 1, 2 e 4) · 13/11/2026](modulos/RNC_RETRABALHO_v0.2.md) · v0.2

## Geral

- [Arquitetura](geral/arquitetura.md)
- [Contexto do projeto — Bancos de teste de geradores diesel (BT2 / bancos de carga)](geral/CONTEXTO_PROJETO_PROMPT_v0.1.md) · v0.1
- [Dicionário de dados — Setup das chaves (v0.1 · 25/10/2026)](geral/DICIONARIO_DADOS_v0.1.md) · v0.1
- [Fluxo de trabalho: celular + GitHub + IA (sem PC da empresa)](geral/fluxo-mobile.md)
- [📚 Glossário Técnico — Projeto Banco de Testes de Gerador Diesel](geral/GLOSSARIO_TECNICO_PROJETO.md)
- [Lógica de transformação — Setup das chaves (v0.1 · 25/10/2026)](geral/LOGICA_TRANSFORMACAO_v0.1.md) · v0.1
- [Processo: Project (claude.ai) ⇄ GitHub ⇄ Sessão de código (Claude Web/Mobile) — v0.2 (01/11/2026)](geral/PROCESSO_SINCRONIZACAO_PROJECT_GITHUB_v0.2.md) · v0.2

## Segurança

- [Senha de testes "mwm": o que ela e e o que ela NAO e](seguranca/SENHA_TESTE_TRAVA_UX_v0.1.md) · v0.1

## Lições aprendidas

- [Decisões tomadas sem o Reginaldo (08/11/2026) — critério de pontuação](licoes/DECISOES_AUTONOMAS_2026-11-08.md)
- [Inventário Demo × Real (gerado por script)](licoes/INVENTARIO_AUTO_v1.10.190.md) · v1.10.190
- [inventario base](licoes/inventario_base.json) *(abre no programa do Windows)*
- [Inventário Demo × Real — medidor_gerador_v1.10.190 (v0.1, 08/11/2026)](licoes/INVENTARIO_DEMO_X_REAL_v0.1.md) · v0.1
- [Registro de Lições Aprendidas — BT2 (v0.1, 08/11/2026)](licoes/REGISTRO_LICOES_v0.1.md) · v0.1

## Criatividade

- [gerar rastreio v0.3](criatividade/gerar_rastreio_v0.3.py) · v0.3 *(abre no programa do Windows)* · anteriores: [v0.2](criatividade/gerar_rastreio_v0.2.py), [v0.1](criatividade/gerar_rastreio_v0.1.py)
- [Criatividade do projeto BT2 — pasta de trabalho (10/11/2026)](criatividade/LEIA-ME.md)
- [Prompt de extrato das sessões do Project — v1.0 (10/11/2026)](criatividade/PROMPT_EXTRATO_v1.0.md) · v1.0
- [RASTREIO IDEIAS v0.3](criatividade/RASTREIO_IDEIAS_v0.3.xlsx) · v0.3 *(abre no programa do Windows)* · anteriores: [v0.2](criatividade/RASTREIO_IDEIAS_v0.2.xlsx), [v0.1](criatividade/RASTREIO_IDEIAS_v0.1.xlsx)

## Criatividade: extratos

- [EXTRATO S07 — esta sessão (blocos do PLC de cargas 1200, medidor, criatividade) — 10/11/2026](criatividade/extratos/EXTRATO_S07_blocos_1200_medidor_2026-11-10.md)

## Modelos para novas notas
_Aponte a pasta de modelos do Obsidian para cá._

- [BK-XXX-00 · Título do achado](_modelos/MODELO_BACKLOG.md)
- [Checklist de bancada · AAAA-MM-DD](_modelos/MODELO_CHECKLIST_BANCADA.md)
- [DEC-000 · Título da decisão (uma frase)](_modelos/MODELO_DECISAO.md)
- [LL-000 · Título da lição](_modelos/MODELO_LICAO.md)
- [PRM-000 · O que este módulo garante (uma frase afirmativa)](_modelos/MODELO_PROMESSA_MODULO.md)

## Raiz da pasta docs

- [Comece aqui (BT2 · banco de cargas)](00_COMECE_AQUI.md)
- [Índice dos documentos — 10/11/2026](INDICE_DOCUMENTOS.md)

---
196 entradas (cada uma pode ter versões anteriores).
