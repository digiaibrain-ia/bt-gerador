# Comunicação entre CLPs

> 💡 **Para times não técnicos:** CLPs diferentes (e equipamentos de outros
> fabricantes) precisam trocar dados. Esta referência mostra qual método usar e
> como tratar falhas de comunicação, que são normais em rede industrial.

## 1. Qual método usar

| Método | Blocos | Plataforma | Observação |
|---|---|---|---|
| S7 PUT/GET | SFB14/15 (clássico) ou GET/PUT (TIA) | 300/400/1200/1500 | habilitar manualmente no 1200/1500 |
| OUC ISO-on-TCP | TCON/TSEND/TRECV | 1200/1500 | preferencial — sem restrição de segurança |
| OUC TCP/UDP | TCON/TUSEND/TURCV | 1200/1500 | integração com terceiros |
| Modbus TCP | MB_CLIENT/MB_SERVER | 1200/1500 | padrão aberto |
| PROFIBUS DP | SFC14/15 | 300/400 | telegramas > 4 bytes / consistência |

## 2. S7 — GET/PUT

```scl
// GET lê de outro CLP; PUT escreve em outro CLP. SEMPRE verifique o STATUS:
//   16#0000 = OK         16#7002 = em andamento (aguarde próximo ciclo)
//   16#80xx = erro (investigue)     16#80B3 = timeout
IF statusGET = 16#0000 THEN
  dadosValidos := TRUE;
ELSIF statusGET >= 16#8000 THEN
  erroComunicacao := TRUE;   // registre para diagnóstico
END_IF;
```
```pascal
// STEP 7 clássico — SFB14 (GET) com ponteiro ANY:
CALL SFB14, DB_InstGET (REQ:=req, ID:=W#16#0001, NDR=>ndr, ERROR=>err, STATUS=>st,
  ADDR_1:=P#DB10.DBX 0.0 BYTE 20, RD_1:=P#DB11.DBX 0.0 BYTE 20);
IF ndr THEN /* dados em DB11 válidos */ END_IF;
```
> ⚠ **Segurança (S7-1200/1500 bloqueiam PUT/GET por padrão):**
> CPU → Properties → Protection → "Permit access with PUT/GET" (habilite com consciência).
> O DB usado em PUT/GET **não pode ser otimizado** — desative a otimização nesse DB.

## 3. OUC — Open User Communication (TIA Portal)

```pascal
// Comunicação TCP/IP genérica com qualquer dispositivo (PC, visão, impressora…).
// TCON estabelece a conexão; TSEND envia; TRECV recebe; TDISCON encerra.
// Todas são NÃO bloqueantes — verifique DONE/NDR no próximo ciclo.
TCON_1(REQ:=connReq, ID:=1, CONNECT:="DB_ConnParam", DONE=>connOK);
IF connOK THEN
  TSEND_1(REQ:=sendReq, ID:=1, LEN:=100, DATA:="DB_Send".dados, DONE=>sendOK);
  TRECV_1(EN_R:=TRUE, ID:=1, LEN:=100, DATA:="DB_Recv".dados, NDR=>recvOK);
END_IF;
```

## 4. Modbus TCP

```
MB_CLIENT — o CLP é mestre (inicia a comunicação)
MB_SERVER — o CLP é escravo (responde a clientes externos)

Códigos de função:
 FC01 Read Coils · FC02 Read Discrete Inputs · FC03 Read Holding Registers
 FC04 Read Input Registers · FC05 Write Single Coil · FC06 Write Single Register
 FC15 Write Multiple Coils · FC16 Write Multiple Registers
```

## 5. PROFIBUS DP consistente (S7-300/400)

```
SFC14 DPRD_DAT → leitura consistente   |   SFC15 DPWR_DAT → escrita consistente
POR QUÊ: módulos com dados > 4 bytes devem ser lidos/escritos de forma atômica,
senão bytes do mesmo telegrama poderiam vir de ciclos diferentes (dado corrompido).
```
