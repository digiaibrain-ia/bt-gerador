# Relatório do piloto · RNC e retrabalho do gerador — v0.1 (13/11/2026)

Branch `ccr-69b3bd0c-yhr48g` (sem PR). Documentos de apoio: `RNC_RETRABALHO_v0.2.md` (contrato e instalação) e `RNC_CHECKLIST_BANCADA_v0.1.md` (roteiro de bancada).

## 1. Resumo
- **O que é:** controle de **qualidade e retrabalho do produto** (o gerador), por **número de série**: registrar defeito no ensaio, bloquear para expedição, reparar, **reteste**, liberar. Não é manutenção de máquina. **Só informativo:** nada comanda PLC, chave ou DSE. Piloto **sem SQL**.
- **Situação:** construído e provado **em simulado**. **Não foi provado em bancada** (PC BT2, DSE real, rede entre os PCs, operadores). Nada foi instalado no PC BT2.
- **Recomendação:** executar o roteiro de bancada (pacote `rnc-bancada-v0.2.zip`) com backup do Node-RED e OK do Reginaldo antes de qualquer uso real. Até lá, **não chamar de aprovado**.

## 2. Decisões
| Ponto | Situação |
|---|---|
| Hoje não existe controle nenhum | **Confirmado** pelo Reginaldo (por isso o escopo foi enxugado) |
| Reparo na mesma rede do PC BT2 | **Dito pelo Reginaldo ("estão na mesma rede")**; ainda **não testado** (T02) |
| Formato do nº de série | Exemplo dado (`M9MGD26060019SDFWA01715`, 23 caracteres). **Regra assumida** `^[A-Z0-9]{15,30}$` (configurável por `RNC_SERIAL_REGEX`); **confirmar o formato real** |
| Foto, Reparo na operação, aviso do medidor, piloto no BT2 | **Premissas do plano**, aceitas pelo Reginaldo ("siga com as suas sugestões"): foto opcional, Reparo na operação, aviso só informativo, piloto no BT2 com campo `banco` |
| Quem libera | **Em aberto.** Hoje = quem registra o reteste aprovado (nome digitado, sem login) |
| Volume mensal de geradores | **Não informado** (não afeta o piloto em arquivo) |
| Versão do medidor em uso no PC BT2 | **Assumida v1.10.201** (a mais nova do repositório; citada no documento de passagem). **Não confirmada** |

## 3. O que foi entregue
| Peça | Arquivo | Versão |
|---|---|---|
| Regras e gravação | `nodered/gerador/rnc/rnc_core_v1.1.js`, `rnc_io_v1.1.js` | v1.1 (v1.0 mantida) |
| Fluxo Node-RED (aba nova, separada das chaves) | `nodered/flows/rnc-api-v1.1.json` (gerado por `nodered/gerador/gerar_rnc_v1.1.js`) | v1.1 (v1.0 mantida) |
| Tela de Registro | `dashboard/ferramentas/rnc_registro_v0.1.html` | v0.1 |
| Tela de Reparo (kanban) | `dashboard/ferramentas/rnc_reparo_v0.2.html` | v0.2 (v0.1 mantida) |
| Medidor com botão "Registrar defeito" + aviso | `medidor_gerador_v1.10.203.html` (base v1.10.201) | 203 (135 e 202 mantidas) |
| Telas no menu ☰ do operador | `catalogo_ferramentas_v0.9.js` + `dashboard/gerador/gerar_catalogo_auto_v0.3.py` | v0.9 / v0.3 |
| Testes | `tests/rnc_core.test.js`, `rnc_core_v1.1.test.js`, `rnc_teste_bancada_v0.1.js` | — |
| Pacote de bancada | `dashboard/gerador/gerar_pacote_rnc_bancada_v0.2.py` → `rnc-bancada-v0.2.zip` | v0.2 |
Tudo em versão nova, sem sobrescrever as anteriores.

## 4. Como funciona
- **Estados da RNC:** Aberta (já bloqueia expedição) → Em reparo → Aguardando reteste → Liberado. Reteste reprovado volta a Em reparo.
- **Gerador (série):** BLOQUEADO se qualquer RNC dele não estiver Liberada; LIBERADO só quando todas estiverem.
- **Travas no servidor:** `rev` velha recusada (409) · não pula estado (422) · reparo exige ação e responsável (peça é opcional) · só libera com reteste APROVADO.
- **Dados:** `rnc.jsonl`, um evento imutável por linha (`event_id`, `schema_version`, `rev`, `banco`, `data`); campos novos entram em `data`, opcionais. Foto em pasta (máx. 3 MB). Backup diário 00:05 (30 dias). Node-RED é o único escritor; "Salvo" só depois do `fsync`.
- **Medidor:** botão anexa modelo, etapa, hora, grandezas e alarmes do DSE (fotografia da tela, sem ler/escrever PLC). Aviso informativo "RNC: BLOQUEADO (n)" ao iniciar ensaio/trocar de etapa/série; nunca bloqueia o ensaio.

## 5. O que foi provado (simulado)
| Evidência | Resultado |
|---|---|
| 22 testes automáticos (regras e gravação: ciclo completo, `rev`, transições, idempotência, 1000 gravações seguidas, linha quebrada, foto, backup, contexto) | 22 OK · 0 falha |
| Node-RED 4 real com o fluxo importado: 60 aberturas simultâneas, reinício mantendo os eventos, foto ida e volta idêntica, leitura fora da pasta recusada | OK |
| Script de bancada `rnc_teste_bancada_v0.1.js` (só roda em pasta de teste vazia) | 18 de 18 OK; recusa pasta sem "teste" no nome (nada gravado) |
| Telas no navegador (celular e desktop): registro com foto, recusa de inválidos, queda de rede mantendo o formulário, conflito entre 2 abas, ciclo completo | OK |
| Medidor v1.10.202/203 contra Node-RED real: botão, contexto, aviso, servidor fora do ar sem quebrar | OK, 0 erro de JavaScript |
| Menu ☰ do operador lista as duas telas RNC (pasta montada com o catálogo gerado) | OK |
| **Dev/Operador oculto, v1.10.203, Demo, pasta de teste:** fase "RNC · Registrar defeito" com falha simulada do alternador de carga | **186 OK · 8 FALHA · 1 AVISO**; as 19 conferências de RNC passaram |

## 6. O que NÃO foi provado (depende da bancada ou da TI)
- Leitura de **DSE real** pelo botão (T14/T15): no Demo as grandezas vêm do simulador.
- **PC BT2 de produção**: versão do Node-RED, `RNC_DIR`, permissão de escrita, antivírus, relógio do PC.
- **Rede entre o PC de registro e o de reparo** (T02) e firewall.
- Reinício real do PM2, queda de rede real, backup **para fora do PC**, uso por dois operadores por 30 minutos, conferência de expedição (T20–T27).
- Que a v1.10.201 é a versão em uso no PC BT2.

## 7. Riscos e limites
- **O software não impede a expedição física.** O bloqueio depende de etiqueta no gerador e da conferência na expedição (processo da fábrica).
- **Autoria sem login:** o nome é digitado; serve ao piloto, não é auditoria forte. "Quem libera" não tem controle de perfil.
- **Relógio do PC** define data/hora dos eventos.
- **Backup** só é útil se copiado para fora do PC (T24).
- **Disco único:** `rnc.jsonl` é só de acréscimo; não há edição nem exclusão de registros pela tela.
- **ISO 9001:** o piloto apoia a rastreabilidade e o controle de produto não conforme, mas **não garante conformidade** com a norma.
- **Colisão de versões** com a sessão BT2 (203/202) se ambas criarem arquivos diferentes com o mesmo número.

## 8. Achados fora do escopo (não corrigidos aqui)
| ID | Gravidade | Achado |
|---|---|---|
| **SETUP-ROBO-01** | média | 8 FALHAS do robô na fase Setup (BC56, BC400, BC59,5, BC550): "o popup explica o motivo (LOCAL)" e "chX ch1 fica selecionada para calibrar" ("Informe o chaveamento do banco… antes de selecionar uma chave"). **Já existiam** na v1.10.202 sem RNC (166 OK · 8 FALHA); o relatório antigo (v1.9.78) tinha 4 do mesmo tipo. Hipótese não provada: o robô não informa o chaveamento exigido pelo Setup. Avisado à sessão BT2 para o `BACKLOG_FORA_DE_ESCOPO.md` |
| — | baixa | "Falhas 2" apareceu uma vez no cabeçalho num teste e não se repetiu em 3 reexecuções; conferir na bancada |
| — | baixa | Dica (tooltip) do botão ☰ do operador ainda diz "Medidor, Gráfico do ensaio" (texto fixo do `menu_dev_v0.3.js`) |
| — | média | Gerador do pacote da sessão BT2 usa `gerar_catalogo_auto_v0.2.py` + base v0.8 (sem as telas RNC); precisa do v0.3/base v0.9 para o menu do operador listá-las |

## 9. Próximos passos (em ordem)
1. Confirmar com a sessão BT2/Reginaldo: **versão do medidor no PC BT2** e **formato real do nº de série**; definir **quem libera**.
2. Backup do Node-RED + **OK do Reginaldo**; instalar o pacote de bancada no PC BT2 (pasta de dados de **teste**).
3. Rodar o script (`rnc_teste_bancada_v0.1.js`: esperado 18 OK) e o roteiro manual (T14 em diante, com carga **desacoplada**); preencher a ficha da seção 7 do roteiro.
4. Registrar cada falha como `todo` com ID e gravidade; corrigir o que for do RNC.
5. Só depois de aprovado: virar `RNC_DIR` para a pasta real (vazia), orientar a produção (etiqueta + conferência) e combinar o backup externo.
6. Juntar as branches com a sessão BT2 (versões, catálogo, `SETUP-ROBO-01`).
7. Fases seguintes, só com o uso real: severidade/causa raiz, indicadores (FPY, reincidência), CSV, login, SQL.

## 10. Pareceres consultados (Perplexity, Gemini, ChatGPT)
As três concordaram com o desenho (Node-RED + JSONL como log de eventos, `rev` no servidor, reteste obrigatório, liberar só com todas as RNCs encerradas, medidor depois). Incorporado: `event_id`/`schema_version`, `banco`, `tipo_nc`, peça opcional, situação do gerador calculada pela série, teste do ciclo antes do medidor, backup na etapa 1. Não adotado: "JSONL schema-less basta" (mantidas versão de esquema e eventos imutáveis) e a ideia de que a gravação em arquivo é atômica por si só (a segurança vem do Node-RED como único escritor, **testado** com gravações simultâneas simuladas). Partes irrelevantes das respostas (citações) foram ignoradas.

## 11. Rastreabilidade
Branch `ccr-69b3bd0c-yhr48g`, 14 commits a partir de `3259fe4`: `6c61bc6` (fluxo) · `80cb6a2` (Registro) · `aaf4077` (contrato) · `0be31f2` (Reparo) · `a06fff9` (medidor 135) · `4ab2177` (roteiro) · `2f19b6c` (medidor 202) · `002c09c` (menu) · `2a7f42a` (script e pacote) · `24d3c8c`, `4e535cb`, `aa92e4c` (203 e robô) · `31a2f6f` (resultado Demo) · `1d0b613` (pacote v0.2).
