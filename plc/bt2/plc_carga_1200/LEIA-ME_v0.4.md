# PLC de cargas (S7-1200 real) - LEIA-ME v0.4 (09/11/2026) - RASCUNHO

**Este e o guia unico e atual.** Os roteiros v0.2 e v0.3 ficam como historico (contexto e decisoes). Se algo divergir, vale este arquivo.
**Nada aqui foi compilado no TIA nem testado em PLC.** Carga de potencia sempre DESACOPLADA em teste. Sem IP no Git: IP/rack/slot ficam na configuracao do hardware.

## 1. O que e
Blocos do PLC de cargas que conversam com o 1515 (ensaio) por PUT/GET. Bancos: **BC56, BC400, BC550** (ate 16 chaves) e **BC59,5** (ate 32 chaves). Numeros de DB = os mesmos da 1500; o programador revisa do lado dele.

## 2. Arquivos validos (ordem de carga no TIA)
| Ordem | Arquivo | O que e |
|---|---|---|
| 1 | `tipos_ComBanco_v0.3.scl` | tipos do telegrama de 16 chaves (24 B) e da competencia (8 B) |
| 1 | `tipos_ComBanco32_v0.2.scl` | tipo do telegrama de 32 chaves (36 B) |
| 2 | `dbs_Banco_v0.1.scl` | DBs de BC56, BC400, BC550 (x00 espelho, x07 telegrama, x08 competencia) |
| 2 | `dbs_Banco595_v0.2.scl` | DBs de BC59,5 (3200, 3207, 3208) |
| 3 | `fb_supervisaoChaves16_1200_v0.1.scl` / `fb_supervisaoChaves32_1200_v0.2.scl` | regra "SB some -> CB cai" (2 s), falha travada |
| 4 | `fb_bancoCarga16_v0.4.scl` / `fb_bancoCarga32_v0.4.scl` | bloco do banco: recebe so o **numero do DB** (DB_ANY) e trata por offset (PEEK/POKE) |
| 5 | `fc_chamadasBancosCarga_v0.4.scl` (BC56, BC400, BC550) e `fc_chamadasBanco595_v0.4.scl` | chamadas por banco e ligacao das E/S |
| 6 | `tags_IO_1200_A_PREENCHER_v0.3.csv` e `tags_IO_1200_BC595_A_PREENCHER_v0.2.csv` | nomes propostos de tags; enderecos fisicos a cargo do programador |
Chamar os dois FCs 1x por ciclo (OB1 ou OB de tempo fixo).

## 3. Lado do 1515 (nao e carregado no 1200)
`chamadas_1515_PUTGET_para_1200_v0.1.scl` + `fb104_Com1200Espelho_v0.1.scl` (16 chaves); `chamadas_1515_PUTGET_BC595_para_1200_v0.2.scl` + `fb105_Com1200Espelho32_v0.2.scl` (32 chaves). Em `plc/bt2/`: `comunicacao_et200/fb103_ComEt200_32_v0.3.scl` e `bancos_cargas/db3200/db3300 v0.3`, `chamadas_BC550/BC595 v0.3`. O PUT/GET continua com **ponteiro absoluto** (ex.: `P#DB3007.DBX0.0 BYTE 10`); `ID_Conexao` = A PREENCHER.

## 4. Telegrama e limites
- 16 chaves: PUT `DBX0.0 BYTE 10` (pedido), GET `DBX10.0 BYTE 14` (resposta).
- 32 chaves: PUT `BYTE 14`, GET `DBX14.0 BYTE 22`.
- Espelho para a IHM: 196 B em 1 PUT (16 chaves); 392 B em 3 PUTs de 136/128/128 B (32 chaves). Limite ~212 B por PUT.
- Escritor unico: o PEDIDO so o PUT do 1515; a RESPOSTA so o `fb_bancoCarga`.

## 5. Decisoes do Reginaldo
Firmware nao bloqueia. Enderecos fisicos: o programador liga as E/S aos DBs. Contator geral/tensao/corrente/temperatura, **ventilador (nao trava nada)** e **tensao de chaveamento (campo reservado `reservaW2`)**: futuro. DB26: nao vale; valem estes DBs. Conexoes S7/protecao de acesso: depois.

## 6. Conferir no TIA ao compilar
Nomes/parametros de `PEEK`, `POKE`, `PEEK_BOOL`, `POKE_BOOL`, `DB_ANY_TO_UINT` na CPU 1215 FC (firmware nao informado); `TON_TIME`; ponteiros absolutos como VARIANT nos PUTs; reacao da CPU a DB inexistente; DBs com `S7_Optimized_Access := FALSE`.

## 7. Verificadores (sem TIA)
`python3 gerador/verifica_offsets_v0.1.py`, `verifica_offsets_bc595_v0.2.py`, `verifica_offsets_dbany_v0.4.py`: conferem offsets e tamanhos entre tipos, DBs e chamadas. **Nao provam** compilacao nem comportamento.

## 8. Substituidos (nao usar)
`fb_bancoCarga16_v0.1/v0.3`, `fb_bancoCarga32_v0.2/v0.3`, `fc_chamadas*` v0.1 a v0.3, `tags_IO_1200_A_PREENCHER_v0.1`, `tipos_ComBanco_v0.1`: trazem o chaveamento e/ou o DB tipado. `MATRIZ_SINAIS_cardBancoCargas_v0.1.csv` ainda cita o chaveamento (desatualizada nessa linha).
## 9. Testes de bancada
Ver `ROTEIRO_..._v0.2.md`, secao de testes (carga DESACOPLADA).
