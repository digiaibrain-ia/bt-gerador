---
name: comunicacao-s7-put-get
description: Comunicação entre CLPs — PUT/GET, Open User Communication, Modbus TCP e PROFIBUS DP para S7-300/400 e S7-1200/1500
---

# Comunicação entre CLPs — PUT/GET e Open User Communication

> **Autor:** REGINALDO LOBO | Referência interna da skill SIEMENS_S7_BLOCO
> **Aplica-se a:** S7-300/400 (STEP 7), S7-1200/1500 (TIA Portal)

---

## 1. Tipos de Conexão S7

| Tipo | Configuração | Plataforma | Característica |
|------|-------------|------------|----------------|
| **Conexão S7 configurada** | NetPro / Conexões TIA Portal | 300/400/1200/1500 | Configuração estática, LADDR fixo |
| **Conexão S7 programática** | T-CONNECT (SFB65) | 300/400 | Conexão dinâmica no programa |
| **Open User Communication (OUC)** | TCON/TSEND/TRECV | 1200/1500 | ISO-on-TCP, TCP, UDP, programático |
| **Modbus TCP** | MB_CLIENT/MB_SERVER | 1200/1500 | Protocolo Modbus sobre Ethernet |
| **PROFIBUS DP** | SFC14/SFC15 | 300/400/1500 | Leitura/escrita de slave DP |

---

## 2. PUT/GET — STEP 7 Clássico (SFB14 e SFB15)

### SFB14 GET — Leitura Remota

```pascal
// "SFB14: lê dados de um parceiro remoto S7 para um DB local"
// "Crie uma instância DB para cada conexão S7 que usar GET"

DATA_BLOCK DB_InstGET
  FB SFB14      // instância do SFB14
END_DATA_BLOCK

// No OB1 ou FC de comunicação:
CALL SFB14, DB_InstGET (
  REQ    := req_get,          // BOOL — borda de subida dispara requisição
  ID     := W#16#0001,        // WORD — ID da conexão S7 (configurada no NetPro)
  NDR    => novo_dado_pronto, // BOOL — TRUE quando dado chegou com sucesso
  ERROR  => erro_get,         // BOOL — TRUE em caso de erro
  STATUS => status_get,       // WORD — código de diagnóstico
  ADDR_1 := P#DB10.DBX 0.0 BYTE 20,  // fonte no parceiro remoto (DB10, 20 bytes)
  RD_1   := P#DB11.DBX 0.0 BYTE 20); // destino local (DB11, 20 bytes)

// "Tratamento de resultado — sempre verifique NDR ou ERROR antes de usar os dados"
IF novo_dado_pronto THEN
  // dados em DB11 são válidos e frescos — processe
ELSIF erro_get THEN
  // consulte status_get para diagnóstico
END_IF;
```

### SFB15 PUT — Escrita Remota

```pascal
// "SFB15: escreve dados locais para um DB no parceiro remoto"
// "Crie uma instância DB separada para cada conexão PUT"

DATA_BLOCK DB_InstPUT
  FB SFB15
END_DATA_BLOCK

CALL SFB15, DB_InstPUT (
  REQ    := req_put,          // BOOL — borda de subida dispara envio
  ID     := W#16#0001,        // mesmo ID de conexão
  DONE   => put_concluido,    // BOOL — TRUE quando escrita confirmada
  ERROR  => erro_put,
  STATUS => status_put,
  ADDR_1 := P#DB20.DBX 0.0 BYTE 10, // destino no parceiro remoto
  SD_1   := P#DB21.DBX 0.0 BYTE 10);// fonte local (dados a enviar)
```

### Tabela de Códigos STATUS

| STATUS | Significado |
|--------|-------------|
| `W#16#0000` | OK — operação concluída sem erro |
| `W#16#7002` | Em andamento — aguardando resposta do parceiro |
| `W#16#7003` | Aguardando dados do parceiro (GET) |
| `W#16#80C3` | Recursos insuficientes — muitos jobs simultâneos |
| `W#16#80B3` | Parceiro remoto não acessível / timeout |
| `W#16#80C4` | Comunicação em andamento — aguarde DONE |
| `W#16#8085` | Erro de parametrização — verifique ADDR e RD |

---

## 3. GET/PUT no TIA Portal — S7-1200/1500

No TIA Portal, GET e PUT são instruções equivalentes às SFB14/SFB15, mas configuradas de forma diferente.

### Pré-requisito de Segurança — CPU Properties

> **CRÍTICO:** Nas CPUs S7-1200 e S7-1500, o acesso via PUT/GET está **desabilitado
> por padrão** por razões de segurança. Para habilitar:
>
> TIA Portal → Propriedades da CPU → Proteção e segurança →
> **"Habilitar acesso PUT/GET de parceiro remoto"** → Ativar checkbox

```pascal
// TIA Portal SCL — GET (S7-1200/1500)
// "A instrução GET está disponível na biblioteca Communications"

GET_1(REQ    := req_get,
      ID     := 16#0001,            // ID de conexão S7 configurada em Conexões TIA
      NDR    => ndr_flag,
      ERROR  => erro_flag,
      STATUS => status_word,
      ADDR_1 := P#DB10.DBX0.0 BYTE 20,
      RD_1   := DB_Local.dados_recebidos);

// "Alternativa mais segura no TIA Portal S7-1500: Open User Communication (OUC)"
// "OUC não requer habilitação de PUT/GET — mais moderno e seguro"
```

---

## 4. Padrão de Polling com GET — Produtor/Consumidor

```pascal
// "Padrão: CPU-A (produtor) grava dados no DB10; CPU-B (consumidor) lê com GET"
// "CPU-B faz polling periódico — a cada N ciclos ou via OB de tempo"

// Em CPU-B, OB35 (100ms) ou FC chamada do OB1:
req_get := NOT req_get;  // gera borda a cada 2 ciclos → polling a cada 200ms

CALL SFB14, DB_InstGET (
  REQ    := req_get,
  ID     := W#16#0001,
  NDR    => ndr_flag,
  ERROR  => erro_flag,
  STATUS => status_get,
  ADDR_1 := P#DB10.DBX 0.0 BYTE 50,
  RD_1   := P#DB_Local.DBX 0.0 BYTE 50);

// "Se erro persistente, incremente contador de falhas de comunicação"
IF erro_flag THEN
  contagem_falha_com := contagem_falha_com + 1;
  IF contagem_falha_com >= 5 THEN
    alarme_com_perdida := TRUE;
  END_IF;
ELSE
  contagem_falha_com := 0;
  alarme_com_perdida := FALSE;
END_IF;
```

---

## 5. Open User Communication (OUC) — TIA Portal

OUC é o método recomendado para S7-1200/1500. Não exige configuração de conexão PUT/GET e é mais flexível.

### Protocolo ISO-on-TCP

```pascal
// "TCON: estabelece a conexão TCP. Chame uma vez — mantém até TDISCON"
// "TSEND: envia dados. TRECV: recebe dados. Não bloqueiam a CPU."

// Bloco de dados de conexão (ConnectionDB):
// TIA Portal cria automaticamente ao arrastar TCON na rede

TCON_1(REQ            := conn_req,          // borda de subida: inicia conexão
        ID             := 1,
        CONNECT        => "DB_ConnParam_1",  // DB de parâmetros de conexão
        DONE           => conn_pronta,
        BUSY           => conn_busy,
        ERROR          => conn_erro,
        STATUS         => conn_status);

// "Após DONE=TRUE, a conexão está ativa — use TSEND/TRECV"
IF conn_pronta AND NOT conn_busy THEN

  TSEND_1(REQ   := send_req,
           ID    := 1,
           LEN   := 100,              // bytes a enviar
           DATA  => "DB_SendBuffer".dados,
           DONE  => send_ok,
           BUSY  => send_busy,
           ERROR => send_erro);

  TRECV_1(EN_R  := TRUE,             // habilitação contínua de recepção
           ID    := 1,
           LEN   := 100,
           DATA  => "DB_RecvBuffer".dados,
           NDR   => recv_ok,
           BUSY  => recv_busy,
           ERROR => recv_erro);
END_IF;
```

### Protocolos Disponíveis no OUC

| Protocolo | Bloco | Uso típico |
|-----------|-------|-----------|
| ISO-on-TCP (RFC 1006) | TCON/TSEND/TRECV | Comunicação S7 clássica via Ethernet |
| TCP (raw) | TCON/TSEND/TRECV | Integração com sistemas de terceiros |
| UDP | TUSEND/TURCV | Broadcast, baixa latência, sem garantia |
| FTP (cliente) | FTP_CMD | Transferência de arquivos para servidor |

---

## 6. Modbus TCP — MB_CLIENT e MB_SERVER

```pascal
// "MB_CLIENT: CLP Siemens atua como Modbus master (cliente TCP)"
// "MB_SERVER: CLP Siemens atua como Modbus slave (servidor TCP)"
// "Disponível nativamente no TIA Portal para S7-1200/1500"

// MB_CLIENT — leitura de holding registers (FC03):
MB_CLIENT_1(REQ        := poll_req,
             DISCONNECT := FALSE,       // mantém conexão persistente
             MB_ADDR    := 1,           // endereço do slave Modbus
             MODE       := 0,           // 0=leitura, 1=escrita
             DATA_ADDR  := 40001,       // endereço Modbus (40001 = HR #1)
             DATA_LEN   := 10,          // quantidade de registradores
             DATA_PTR   => "DB_Modbus".hr_data,  // destino dos dados
             DONE       => mb_done,
             BUSY       => mb_busy,
             ERROR      => mb_erro,
             STATUS     => mb_status);

// "MB_SERVER: disponibiliza uma área de DB como Modbus registers"
MB_SERVER_1(DISCONNECT := FALSE,
             MB_HOLD_REG => "DB_HoldingRegs",  // DB que representa os registers
             CONNECT    => "DB_ConnParam_MB",
             NDR        => novo_dado_recebido,
             DR         => dado_enviado,
             ERROR      => mb_srv_erro,
             STATUS     => mb_srv_status);
```

---

## 7. PROFIBUS DP — SFC14 e SFC15 (S7-300/400)

```pascal
// "SFC14 DPRD_DAT: leitura consistente de slave DP (>4 bytes ou I&M access)"
// "SFC15 DPWR_DAT: escrita consistente para slave DP"
// "Use quando o telegrama de dados excede 4 bytes ou requer consistência garantida"

CALL SFC14 (
  LADDR  := W#16#0100,    // endereço lógico do slave DP (do HW Config)
  RET_VAL => sfcret,      // WORD — 0 = OK
  RECORD  := P#DB10.DBX 0.0 BYTE 20);  // buffer de destino

CALL SFC15 (
  LADDR  := W#16#0100,
  RECORD  := P#DB11.DBX 0.0 BYTE 20,   // dados a enviar
  RET_VAL => sfcret);
```

---

## 8. Boas Práticas de Comunicação

1. **Nunca use dado recebido sem verificar NDR/DONE primeiro** — o buffer pode conter lixo do ciclo anterior.
2. **PUT/GET desabilitado por padrão no S7-1200/1500** — habilite conscientemente e documente a decisão de segurança.
3. **Uma instância DB por conexão** — SFB14/SFB15 são stateful; compartilhar instâncias causa corrupção de dados.
4. **Use OUC em vez de PUT/GET para novos projetos no TIA Portal** — mais seguro, mais flexível e sem restrição de DBs otimizados.
5. **Monitore STATUS continuamente** — implemente contador de falhas e alarme por comunicação perdida.
6. **Evite polling muito rápido** — GET/PUT a cada ciclo OB1 (~10ms) sobrecarrega o stack de comunicação; use OB35 (100ms) ou similar.
7. **DBs otimizados (S7-1200/1500) são incompatíveis com PUT/GET** — desabilite a otimização no DB de comunicação se usar PUT/GET.
