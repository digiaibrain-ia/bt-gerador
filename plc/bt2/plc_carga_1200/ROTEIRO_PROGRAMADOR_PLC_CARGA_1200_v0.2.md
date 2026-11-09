# Roteiro para o programador do PLC de cargas (S7-1200 real) — v0.2 (09/11/2026)

**RASCUNHO.** Nada foi compilado no TIA nem testado no PLC. Substitui o roteiro de 07/11 (`ROTEIRO_PROGRAMADOR_PLC_CARGAS_2026-11-07`, que descreve um DB de 12 bytes e ficou desatualizado).
Este documento não traz IP nem senha: use `[IP_1515]` e `[IP_CARGAS]` na sua configuração. Carga de potência **sempre DESACOPLADA** em qualquer teste de bancada.

## 1. Contexto em 6 linhas
1. O **1515F** (ensaio) decide o que ligar e manda o comando. O **PLC de cargas (1215 FC)** aciona as contatoras e devolve o **retorno real** (contato auxiliar).
2. A troca é **S7 PUT/GET iniciado pelo 1515**; o PLC de cargas é **passivo** (só libera o acesso e fornece os DBs).
3. **Escritor único por campo**: o 1515 escreve o PEDIDO; o PLC de cargas escreve a RESPOSTA. Nunca espelhar o DB inteiro nos dois sentidos.
4. **Regra de segurança (decidida pelo Reginaldo):** se o retorno (SB) some com a saída energizada por **2 s**, a falha fica **travada**, a saída cai e só rearma por **novo comando**. O retorno voltar sozinho **não** religa.
5. **Sem comunicação, nada liga:** se a vida do 1515 parar por 2 s, todas as saídas vão a FALSE; cada chave só volta com novo comando.
6. Os **números de DB são os mesmos do 1515** (decisão do Reginaldo), para o mesmo nome significar a mesma coisa nos dois projetos.

## 2. DBs (todos NÃO otimizados: `S7_Optimized_Access := 'FALSE'`)
| DB (BC56 / BC400 / BC550) | Nome | Função | Quem escreve | Tamanho |
|---|---|---|---|---|
| 3007 / 3107 / 3307 | `dbNNNN_BCxx_Com` | Telegrama **rápido** de comando e segurança | PEDIDO: 1515 · RESPOSTA: PLC de cargas | 24 B (PUT 10 + GET 14) |
| 3008 / 3108 / 3308 | `dbNNNN_BCxx_Competencia` | Sinais **do banco** para o 1515 (lento) — **número proposto** | PLC de cargas | 8 B |
| 3000 / 3100 / 3300 | `dbNNNN_BCxx_Chaves` | **Espelho** de mão única do DB de chaves do 1515, só para a IHM | bytes 0–3: PLC de cargas · bytes 4–199: PUT do 1515 | 196 B recebidos |
| 3006 / 3106 / 3306 (`...i_`) | `dbNNNNi_BCxx_BancoCarga` | Instância do `fb_bancoCarga16` (um por banco) | TIA | — |
**Por que separei** o telegrama rápido do DB de competência: o comando e a segurança andam a ~100 ms e têm tamanho fixo (24 B, igual ao já ensaiado, **sem mudar fluxo nem FB101**). Os sinais do banco (estado real, intertravamento, ventilador, chaveamento físico, alarmes) mudam devagar, são novos e podem crescer — lidos a ~1 s por um GET separado, não concorrem com o comando.

## 3. Sinais do card Bancos de Cargas
Ver `MATRIZ_SINAIS_cardBancoCargas_v0.1.csv`. Resumo do que **faltava** e entrou no DB de competência: **estado real do banco** (hoje a tela mostra só o *comando* Ligar banco), **banco liberado**, **intertravamento (emergência/proteções)**, **ventilador** (lição BANC-1, decisão pendente), **chaveamento físico**, **alarmes** e a vida do bloco. Os 9 sinais do comando e da segurança **já existiam** e não mudaram.

## 4. Telegrama rápido (`typeComBanco16`, DB3007)
| Byte/bit | Campo | Dono | Sentido |
|---|---|---|---|
| X0.0–1.7 | `cmd[1..16]` | 1515 | 1515→cargas |
| W2 | `vida1515` | 1515 | 1515→cargas |
| X4.0 | `ligarBanco` | 1515 | 1515→cargas |
| X6.0–7.7 | `habPed[1..16]` | 1515 | 1515→cargas |
| W8 | `seq` | 1515 | 1515→cargas |
| X10.0–11.7 | `fbk[1..16]` (**contato auxiliar real**, nunca cópia do comando) | cargas | cargas→1515 |
| W12 | `vidaET` | cargas | cargas→1515 |
| X14.0 | `seletoraAuto` | cargas | cargas→1515 |
| X16.0–17.7 | `habResp[1..16]` | cargas | cargas→1515 |
| W18 | `eco` (= `seq`) | cargas | cargas→1515 |
| X20.0–21.7 | `falhaRetorno[1..16]` (travada) | cargas | cargas→1515 |
| X22.0–23.7 | `contatorColado[1..16]` (travado) | cargas | cargas→1515 |
PUT do 1515: `DBX0.0 BYTE 10` · GET do 1515: `DBX10.0 BYTE 14`. **Conferir os deslocamentos na coluna "Deslocamento" do TIA.**

## 5. Blocos entregues (pasta `plc/bt2/plc_carga_1200/`)
| Arquivo | O que é |
|---|---|
| `tipos_ComBanco_v0.1.scl` | UDT `typeComBanco16` (24 B) e `typeCompetenciaBanco` (8 B) |
| `dbs_Banco_v0.1.scl` | DBs de BC56, BC400, BC550 (Com, Competência, Espelho) |
| `fb_supervisaoChaves16_1200_v0.1.scl` | Regra SB some → CB cai (T = 2 s). Porte do ET200: só o tipo do temporizador mudou |
| `fb_bancoCarga16_v0.1.scl` | **Um FB por banco**: vida, perda de comunicação, bloqueio pós-queda, saídas, retorno real, competência |
| `fc_chamadasBancosCarga_v0.1.scl` | Chama os FBs e liga as E/S físicas (nomes de tag **propostos**) |
| `tags_IO_1200_A_PREENCHER_v0.1.csv` | Tags físicos com endereço **A PREENCHER** (quem sabe os endereços é o programador) |
| `chamadas_1515_PUTGET_para_1200_v0.1.scl` | Lado do **1515**: parâmetros do FB101 v0.8 e do novo `fb104` apontando para o 1200 |
| `fb104_Com1200Espelho_v0.1.scl` | **1515**: PUT do espelho (196 B) + GET da competência (8 B), a cada 1 s |
BC59,5 (18 chaves, layout de 32) **não** está neste pacote: depende da Etapa 3 do lado do 1515.

## 6. Configuração PUT/GET
**No PLC de cargas (1200) — você:**
1. Propriedades da CPU → Proteção e segurança → Mecanismos de conexão → marcar **"Permitir acesso com comunicação PUT/GET de parceiro remoto"**. (Sem isso o PUT/GET volta erro.)
2. Os DBs acima **não otimizados** (offsets fixos). Não reordenar campos.
3. Não é preciso criar instrução PUT/GET no 1200: quem inicia é o 1515. Anote a **proteção de acesso** da CPU: se houver senha de leitura/escrita, o PUT/GET precisa ser compatível (a definir).
**No 1515 — nós:**
1. Criar a **conexão S7** para o PLC de cargas na configuração de rede. Anotar o **ID da conexão**. Rack/slot do 1200: normalmente 0/1 (**confirmar** na configuração de hardware, não chutar).
2. Colocar o ID e os endereços de `chamadas_1515_PUTGET_para_1200_v0.1.scl` nas chamadas dos FBs.
3. **Um job PUT/GET por vez por conexão**: o FB101 (rápido) e o FB104 (lento) devem dividir a conexão sem se sobrepor (ou usar conexões separadas).
Limite do PUT/GET: ~212 bytes por job; o espelho usa 196 B.

## 7. Ordem de carga (com backup antes e OK do Reginaldo)
1. Backup do TIA (1515 e 1200). 2. Importar `tipos`, `dbs`, `fb_supervisaoChaves16`, `fb_bancoCarga16`, `fc_chamadasBancosCarga`; criar as instâncias; preencher as tags. 3. Compilar e conferir os deslocamentos. 4. Carregar o 1200. 5. No 1515: DBs de competência locais, `fb104`, conexão e chamadas. 6. Conferir no monitor. **Carregar os dois lados na mesma janela; rollback = recarregar o backup.**

## 8. Testes de bancada (carga de potência DESACOPLADA)
| Teste | Esperado |
|---|---|
| Comando de uma chave | contatora liga, `fbk` volta a TRUE em < 1 s |
| Bloquear o retorno (SB) com a chave ligada | em ~2 s `falhaRetorno`=TRUE, saída cai, CB cai no 1515 |
| Liberar o retorno | **a chave NÃO liga** |
| Novo clique | liga (rearme só por novo comando) |
| Contator colado simulado | `contatorColado`=TRUE, chave bloqueada |
| Desabilitar a chave | `habResp` cai e a saída não energiza |
| Tirar o cabo de rede / parar a CPU do 1515 | em ~2 s todas as saídas a FALSE; ao voltar, **nada religa sozinho** |
| Intertravamento aberto (emergência) | `bancoLiberado`=FALSE, nenhuma saída |
| Seletora fora de Auto | `seletoraAuto`=FALSE, nenhuma saída |

## 9. Perguntas para o programador (preciso destas respostas)
1. Firmware real da CPU (a CPU é a 6ES7 215-1AF40-0XB0; o tipo do temporizador `TON_TIME` e o PUT/GET com ponteiro absoluto dependem disso).
2. **Endereços físicos** das contatoras, retornos, seletora, emergência/proteções, ventilador, contator geral e chaveamento (tabela `tags_IO_1200_A_PREENCHER`).
3. Existe **retorno do contator geral** do banco? Existe **sinal de chaveamento físico**? O banco **mede** tensão/corrente/temperatura? (o que a IHM do banco precisa)
4. O ventilador **bloqueia** a carga (`UsaVentilador := TRUE`) ou só alarma? (decisão do Reginaldo, BANC-1)
5. Os DBs dele (DB26 com todos os bancos?) vão **substituir** estes ou conviver? Nomes simbólicos ou não?
6. O 1200 precisa da tensão de chaveamento **informada pelo ensaio** (hoje no DB3002 do 1515)? Em qual DB/campo?
7. Conexões S7 livres na 1215 FC e proteção de acesso da CPU.

## 10. O que está provado e o que não está
- **Provado aqui:** consistência de offsets e tamanhos (script `gerador/verifica_offsets_v0.1.py`): `typeComBanco16` = 24 B, PUT 10 / GET 14 = FB101 v0.8; competência = 8 B; espelho = bytes 4–199 (196 B); chamadas do 1515 coerentes com os DBs. A **lógica de supervisão** (SB some → CB cai) é a do ET200, com 14 vetores no modelo em JS (15 testes passam).
- **NÃO provado:** compilação no TIA, S7-1200 × S7-300 (a instância do temporizador), tempo real do contator, comportamento do PUT/GET, o `fb_bancoCarga16` (lógica nova de competência e liberação) e o `fb104`. **Bancada obrigatória.**
