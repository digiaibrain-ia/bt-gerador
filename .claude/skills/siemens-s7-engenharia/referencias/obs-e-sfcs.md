# OBs, Variáveis de Sistema e SFC/SFB

> 💡 **Para times não técnicos:** OBs (Organization Blocks) são os "horários de
> trabalho" do CLP — cada um tem uma prioridade e é chamado pelo sistema operacional
> em momentos específicos (no ciclo, num intervalo fixo, quando há um erro, etc.).

## 1. Tabela de OBs e prioridades

| OB | Tipo | Prioridade | Quando é chamado |
|---|---|---|---|
| **OB1** | Ciclo principal | 1 (mais baixa) | repetidamente, sempre |
| OB10..17 | Alarme de hora | 2 | na hora/data configurada |
| OB20..23 | Atraso de tempo | 3..6 | após delay (SFC32) |
| OB30..38 | Alarme cíclico | 7..15 | a cada N ms (PID/filtros aqui!) |
| OB40..47 | Alarme de hardware | 16..23 | evento de módulo I/O |
| OB80 | Erro de ciclo | 26 | ciclo excedeu o watchdog |
| OB82 | Erro de diagnóstico | 26 | módulo reportou falha |
| OB85 | Erro de execução de prog. | 26 | OB não carregado, etc. |
| OB86 | Erro de rack/estação | 26 | falha de comunicação |
| OB100/101/102 | Startup | 27 | na partida (inicialize aqui) |
| OB121 | Erro síncrono de prog. | 28 | acesso inválido a DB/FC |
| OB122 | Erro síncrono de I/O | 29 | acesso inválido a módulo |

> **OBs de erro obrigatórios — carregue SEMPRE (mesmo vazios):**
> `OB80, OB82, OB85, OB86, OB121, OB122`. Sem eles, a CPU vai a STOP no primeiro erro.

## 2. Variáveis de contexto fornecidas pelo SO (VAR_TEMP de cada OB)

| OB | Variável | Uso típico |
|---|---|---|
| OB1 | `OB1_PREV_CYCLE` (Int, ms) | monitor de tempo de ciclo no HMI |
| OB30..38 | `OB3x_EXC_FREQ` (Word) | verificar o período configurado |
| OB40..47 | `OB40_POINT_ADDR` (DWord) | qual entrada gerou a interrupção |
| OB121 | `OB121_BLK_TYPE` (Byte) | tipo do bloco com erro (FB=1, FC=2) |
| OB122 | `OB122_MDL_ADDR` (Word) | endereço do módulo com falha de I/O |
| Todos | `OBxx_DATE_TIME` (DT) | timestamp do evento |

## 3. SFCs mais usadas (STEP 7 clássico)

| SFC | Nome | Uso |
|---|---|---|
| SFC0 | SET_CLK | acerta relógio (chame no OB100) |
| SFC1 | READ_CLK | timestamp em DT → logs de evento |
| SFC14/15 | DPRD_DAT / DPWR_DAT | PROFIBUS consistente (> 4 bytes) |
| SFC20 | BLKMOV | copia área de memória (com ANY) |
| SFC21 | FILL | inicializa área com valor fixo |
| SFC28/29 | SET_TINT / CAN_TINT | configura/cancela alarme de hora (OB10) |
| SFC32/33 | SRT_DINT / CAN_DINT | dispara/cancela OB20-23 após N ms |
| SFC36/37 | MSK_FLT / DMSK_FLT | mascara/desmascara classe de erros |
| SFC46 | STP | coloca CPU em STOP (segurança crítica) |
| SFC47 | WAIT | aguarda N microssegundos |
| SFC51 | RDSYSST | lê SZL — inventário e diagnóstico de módulos |
| SFC58/59 | WR_REC / RD_REC | parametriza/lê registro de módulo I/O |
| SFC64 | TIME_TCK | lê ms do sistema — mede tempo de execução |

**SFBs IEC (STEP 7 clássico — exigem DB de instância próprio):**
`SFB4=TON · SFB5=TOF · SFB3=TP · SFB0=CTU · SFB1=CTD · SFB2=CTUD`

**Equivalentes TIA Portal:** `RD_SYS_T/WR_SYS_T · MOVE_BLK_VARIANT · FILL_BLK · STP · DPRD_DAT`.
