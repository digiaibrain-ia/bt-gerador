# Comece aqui (BT2 · banco de cargas)

Atualizado em 21/11/2026. Serve a quem chega agora, pessoa ou IA. Os links são normais (funcionam no GitHub e no Obsidian). A lista completa e antiga de documentos está em [INDICE_DOCUMENTOS.md](INDICE_DOCUMENTOS.md) (gerada em 10/11).

## 1. O que é o projeto, em 5 linhas
Banco de cargas para ensaio de gerador. O **medidor** (um HTML) mostra e comanda; o **Node-RED** faz a ponte; o **PLC 1515** guarda o estado; o **ET200** (provisório) e depois o **PLC de Carga 1200** ligam as contatoras. A **segurança fica no PLC**. Regras de trabalho: [CLAUDE.md](../CLAUDE.md).

## 2. Leia primeiro
| Para quê | Arquivo |
|---|---|
| Arquitetura, quem fala com quem | [arquitetura v0.6](bt2/arquitetura/arquitetura_bt2_v0.6_editavel.html) · [resumo para reunião](bt2/arquitetura/RESUMO_ARQUITETURA_REUNIAO_v0.1.md) · [chamadas dos blocos v0.7](bt2/plc/INFOGRAFICO_CHAMADAS_BLOCOS_v0.7.html) |
| Revisão de qualidade do código (a conversa atual) | [passagem para a nova sessão](bt2/passagem/PASSAGEM_REVISAO_CODIGO_v0.1.md) |
| Auditoria pelos 5 fundamentos | [rodada 1](bt2/auditoria/AUDITORIA_5_FUNDAMENTOS_v0.1.md) · [rodada 2](bt2/auditoria/AUDITORIA_5_FUNDAMENTOS_RODADA2_v0.1.md) |
| Alarmes e vocabulário (alarme incômodo, inundação…) | [alarme inteligente v0.2](bt2/modulos/ALARME_INTELIGENTE_v0.2.md) |
| Perfil de gás e biometano | [decisões do perfil de combustível](bt2/auditoria/DECISOES_PERFIL_COMBUSTIVEL_E_ESCALONAMENTO_v0.1.md) |
| Padrão de comentários no PLC (//[F] e //[M]) | [padrão](bt2/padroes/PADRAO_COMENTARIOS_SCL_FM_v0.1.md) |
| Equipamentos e CPUs (limites do ET200) | [equipamentos e CPU](bt2/plc/EQUIPAMENTOS_E_CPU_v0.1.md) |
| Checklist de bancada | [checklist v0.8](bt2/migracao/CHECKLIST_BANCADA_v0.8.md) · [modelo para novos](_modelos/MODELO_CHECKLIST_BANCADA.md) |
| Lições aprendidas | [registro de lições](licoes/REGISTRO_LICOES_v0.1.md) |
| Pendências | [backlog](../BACKLOG_FORA_DE_ESCOPO.md) |

## 3. Decisões do Reginaldo (cada uma com data e motivo)
Pasta [bt2/decisoes](bt2/decisoes/). As mais recentes:
- [DEC-001 · Silenciar e Reconhecer cancelados](bt2/decisoes/DEC-001_silenciar_cancelado.md)
- [DEC-002 · Filtro automático de alarme de banco fora do teste](bt2/decisoes/DEC-002_filtro_automatico_banco_fora_do_teste.md)
- [DEC-003 · Tolerância de carga padrão de 3 pontos](bt2/decisoes/DEC-003_tolerancia_de_carga_3.md)
- [DEC-004 · Novo tipo de ocorrência: Informação](bt2/decisoes/DEC-004_tipo_informacao.md)
- [DEC-005 · Sugerir chaves só com o cronômetro parado](bt2/decisoes/DEC-005_sugerir_so_com_cronometro_parado.md)
- [DEC-006 · O Patamar liga só pelo Modo](bt2/decisoes/DEC-006_patamar_liga_so_pelo_modo.md)
- [DEC-007 · Falha de API repetida vira um registro só no log](bt2/decisoes/DEC-007_log_falha_repetida.md)

## 4. Promessas dos módulos (o que cada parte garante, em português)
Pasta [bt2/promessas](bt2/promessas/). A ideia: você revisa a **promessa**; os testes conferem se o código cumpre. Modelo: [MODELO_PROMESSA_MODULO](_modelos/MODELO_PROMESSA_MODULO.md).
- [PRM-001 · O banco cai sem vida do 1515](bt2/promessas/PRM-001_banco_cai_sem_vida_do_1515.md)
- [PRM-002 · Comando de chave passa pela fila e pela confirmação](bt2/promessas/PRM-002_comando_de_chave_fila_e_confirmacao.md)
- [PRM-003 · Sugerir chaves só com o cronômetro parado](bt2/promessas/PRM-003_sugerir_so_com_cronometro_parado.md)

### Auditoria e revisão (sessão de 19 a 21/11)
A sessão nova trabalhou na mesma branch e deixou estes documentos. **Eu não revisei o conteúdo deles ao montar este índice**: leia o estado ("provado" ou "não provado") dentro de cada um.
- [Promessas dos módulos críticos](bt2/auditoria/PROMESSAS_DOS_MODULOS_v0.1.md) (a lista por módulo; as notas PRM-001 a 003 acima são individuais e ligadas às decisões)
- [Resultado antes e depois](bt2/auditoria/RESULTADO_ANTES_E_DEPOIS_v0.1.md) · [Revisão independente do passo 7](bt2/auditoria/REVISAO_INDEPENDENTE_PASSO_7_v0.1.md) · [Passo 7: provar os testes](bt2/auditoria/PASSO_7_PROVAR_OS_TESTES_v0.1.md) · [Passo 8: congelamento](bt2/auditoria/PASSO_8_CONGELAMENTO_v0.1.md)
- [Alarmes e logs (passo 6)](bt2/auditoria/PASSO_6_ALARMES_E_LOGS_v0.1.md) · [Build modular (passo 3)](bt2/auditoria/PASSO_3_BUILD_MODULAR_v0.1.md) · [Medir e congelar (passos 1 e 2)](bt2/auditoria/RELATORIO_PASSO_1_2_MEDIR_E_CONGELAR_v0.1.md)
- [Roteiro de implantação do Reginaldo](bt2/migracao/ROTEIRO_IMPLANTACAO_REGINALDO_v0.1.md) · [Checklist de go-live](bt2/migracao/CHECKLIST_GO_LIVE_v0.1.md)

## 5. Onde fica o código
| Parte | Pasta |
|---|---|
| Medidor (versão mais nova na branch em 21/11: **1.10.231**) | `dashboard/ferramentas/medidor_gerador_v1.10.231.html` |
| Módulos-fonte e geradores do medidor | `dashboard/modulos-fonte/` · `dashboard/gerador/` |
| Fluxos Node-RED | `nodered/flows/bt2/` · geradores em `nodered/gerador/` |
| Blocos de PLC | `plc/bt2/entrega_1200_v0.17/` · `plc/bt2/entrega_et200_v0.7/` |
| Testes | `tests/e2e/` · `tests/integracao/` · `tests/fb/` |
| Pacotes de entrega | `scripts/pacote/gerar_pacote_implantacao_v1.29.py` (mais novo em 21/11) e o do Alexandre: `gerar_pacote_alexandre_1200_v0.1.py` |

## 6. Como usar com o Obsidian
Abra a pasta `docs` como cofre. Os modelos ficam em `_modelos` (em Configurações › Plugins principais › Modelos, aponte a pasta de modelos para `_modelos`). A pasta `.obsidian` é configuração pessoal e **não vai para o Git**.

## 7. Cuidados
- Nada de IP real, senha ou token nas notas (regra do projeto).
- Nada foi testado ainda no PC BT2 nem no PLC real, fora a bancada do ET200. A 1200 é rascunho (não compilada). Leia sempre o estado ("provado" ou "não provado") em cada nota.
