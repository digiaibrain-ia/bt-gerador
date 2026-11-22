# Roteiro de explicação — PLC de Carga (S7-1214FC) — v1.1 (10/11/2026)

Para o Reginaldo explicar ao programador do PLC de Carga. Acompanha o zip `entrega_1200_v0.9` (10 blocos). **v1.1: o lado do 1515 passou a ser `fb101_ComCarga` (era `fb101_ComEt200`, com nome e comentários do ET200; mesma lógica).** **Rascunho: nada foi compilado no TIA nem testado em PLC.** Hoje só existem os bancos **BC56 e BC400**.

## 1. Em uma frase
O 1515F (ensaio) manda comandos e o PLC de Carga **liga as contatoras de verdade** e devolve o retorno real. A comunicação é por **PUT/GET**, com um telegrama de 24 bytes por banco.

## 2. Quem faz o quê
| Equipamento | Papel | Observação |
|---|---|---|
| 1515F-2 PN (ensaio) | cliente: o PUT escreve o PEDIDO, o GET lê a RESPOSTA | quem decide o que ligar |
| PLC de Carga (1214FC) | servidor: aciona as saídas e lê os contatos auxiliares | o programador liga as E/S |
| ET200 (IM151-8) | faz o papel do PLC de Carga **provisoriamente**; o Reginaldo testa | os blocos do 1200 são o espelho dos do ET200 |

## 3. O que vem no zip (10 blocos)
**PLC_CARGA_1200 (carregar no 1214FC):**
- `fb_bancoCarga16`: um por banco, 1x por ciclo. Recebe só o **número do DB** (`DbCom : DB_ANY`) e trata os campos por offset (PEEK/POKE).
- `fb_supervisaoChaves16`: regra "SB some → CB cai" (chamado dentro do anterior).
- `db_ComBancos`: DB3007 (BC56) e DB3107 (BC400), sem otimização.
- `fc_bancosCarga1200`: copia as E/S físicas e chama os dois bancos. **Tags são nomes propostos** (`BC56_I01…`, `BC56_Q01…`, `BC56_SEL_AUTO`); você cria e liga os endereços reais.

**PLC_1515 (Reginaldo carrega no 1515):** `fb100_setupChaves` v0.4, `fb101_ComCarga` v0.9 (FB101), `db3000`/`db3100` v0.3 e as chamadas v0.5 de BC56/BC400 (instâncias `db3005i_BC56_ComCarga` e `db3105i_BC400_ComCarga`, remoto DB3007/DB3107 no 1200).

## 4. Números de DB (mesmos da 1500)
| Banco | Chaves reais | DB telegrama (1200) | Instância do `fb_bancoCarga16` | DB de chaves (1515) |
|---|---|---|---|---|
| BC56 | 13 de 16 | **DB3007** | DB3006 | DB3000 |
| BC400 | 13 de 16 | **DB3107** | DB3106 | DB3100 |

## 5. Telegrama (24 bytes, DB sem otimização)
| Sentido | Campo | Offset |
|---|---|---|
| PEDIDO (PUT do 1515) | `cmd[16]` | X0.0 |
| | `vida1515` (Int) | W2 |
| | `ligarBanco` | X4.0 |
| | `habPed[16]` | X6.0 |
| | `seq` (Int) | W8 |
| RESPOSTA (GET do 1515) | `fbk[16]` (contato auxiliar real) | X10.0 |
| | `vidaET` (Int) | W12 |
| | `seletoraAuto` | X14.0 |
| | `habResp[16]` | X16.0 |
| | `eco` (Int, cópia do `seq`) | W18 |
| | `falhaRetorno[16]` | X20.0 |
| | `contatorColado[16]` | X22.0 |

Ponteiros no 1515: PUT `P#DB3007.DBX0.0 BYTE 10`, GET `P#DB3007.DBX10.0 BYTE 14` (BC400: DB3107).
**Escritor único:** o PEDIDO só é escrito pelo PUT do 1515; a RESPOSTA só pelo `fb_bancoCarga16`. O bloco nunca escreve no PEDIDO.

## 6. Regras de segurança que o bloco cumpre
1. `vidaET` sobe a cada ~100 ms (prova ao 1515 que o PLC de Carga está vivo).
2. Sem vida nova do 1515 por **2 s** (o 1515 vigia 3 s): `ComOk` = FALSE e **todas as saídas FALSE**.
3. Depois de queda de comunicação (e no 1º ciclo após a partida) cada chave fica **travada**; só solta quando o comando cai a FALSE e é recomandado. **Nunca religa sozinha.**
4. Saída da contatora = `Cmd` E `ComOk` E `ligarBanco` E seletora em Auto E não travada E `Permite` (da supervisão).
5. **SB some → CB cai:** saída energizada e contato auxiliar em 0 por **T = 2 s** → `falhaRetorno` = TRUE, **travada**, a saída cai. Contator colado (saída 0, auxiliar 1 por T) → `contatorColado` = TRUE, travado. O rearme é só por novo comando.
6. Habilitar/desabilitar por chave: `habPed` → `habResp`; `eco` confirma o `seq` tratado.
7. `fbk` é sempre o contato auxiliar **real**, nunca cópia do comando.
8. DB inválido (número 0): nada liga.

## 7. O que o programador precisa fazer
1. Criar DB3007 e DB3107 **sem acesso otimizado** e as instâncias DB3006 e DB3106.
2. Criar as tags e ligar as entradas (contatos auxiliares, seletora Auto) e saídas (contatoras); ajustar `NumChaves` (13).
3. Chamar `fc_bancosCarga1200` 1x por ciclo (OB1 ou OB de tempo fixo).
4. Configurar a conexão S7 com o 1515 (ID, TSAP, conexões livres) e **habilitar PUT/GET** na CPU (servidor). O `ID_Conexao` nas chamadas do 1515 está `W#16#0`: **a preencher**.
5. **Conferir no TIA (1214FC):** nomes e parâmetros de `PEEK`, `POKE`, `PEEK_BOOL`, `POKE_BOOL`, `DB_ANY_TO_UINT`; `TON_TIME`; reação da CPU a DB inexistente.
6. Compilar e carregar junto com o 1515 (a mesma janela).

## 8. Fora do escopo agora (decidido pelo Reginaldo)
BC550 e BC59,5 (não existem), DB de competência, tensão de chaveamento, retorno do contator geral, monitoramento do ventilador (não trava nada), espelho para IHM, endereços físicos (o programador define), conexões S7 e proteção de acesso (assunto para depois).

## 9. Teste de bancada (carga de potência DESACOPLADA)
`vidaET` mudando e `ComOk` TRUE → comando de uma chave liga a saída → bloquear o retorno (SB): em ~2 s a falha trava e a saída cai → liberar o SB: não volta sozinha → parar a vida do 1515 por mais de 2 s: saídas FALSE → habilitar/desabilitar com `habResp`/`eco`. Repetir em BC56 e BC400.

## 10. Limites
Provado só com PLC simulado em memória (313 testes, 307 passam, 6 `todo` conhecidos) e conferência de offsets por script. **Não provado:** compilação no TIA, PEEK/POKE com DB dinâmico na 1214FC, driver S7 real, tempos e o comportamento em bancada.
