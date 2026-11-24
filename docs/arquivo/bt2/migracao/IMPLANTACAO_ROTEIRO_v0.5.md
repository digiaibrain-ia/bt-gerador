# Roteiro de implantacao BT2 - v0.5 (fechamento da Fase 3)

Substitui a **v0.4** (mantida para historico). Vale tudo da v0.3/v0.4 (backup antes de tudo, variaveis do PROCESSO no PM2, simulador fora do PC de producao, guarda de escrita). Aqui entram as correcoes de concorrencia da Fase 3 e uma **validacao de bancada obrigatoria antes do PC**.

**Estado: versoes preparadas e testadas no repositorio (PLC simulado). NAO importadas no PC. Nada aqui foi validado em PLC real.**

## 1. Quais fluxos importar (apagar antes a aba com o mesmo nome; manter o arquivo antigo para voltar atras)
| Arquivo novo | Substitui | Observacao |
|---|---|---|
| `chaves-56-api-v3.4.json` | `v3.1` (ou a que estiver no PC) | Fase 2 + D3 + Fase 3 (4a e 4b) |
| `chaves-400-api-v3.4.json` | idem | idem |
| `chaves-550-api-v1.5.json` | `v1.2` | idem |
| `chaves-595-api-v1.5.json` | `v1.2` | idem (32 chaves) |
| `registro-ensaio-db2100-api-v1.8.json` | `v1.6` | preenchimento em duas fases (~4 s) |
| `dev-logs-api-v1.3.json` | `v1.1` | dedup por conjunto + sinais no GET |
| `cliente-156-dse-plc-carga-v3.json`, `cliente-31-seletor-plc-db2000-v4.json`, `servidor-deepsea-api-gerador-v3_7.json` | v0.3 | sem mudanca de logica |
| `simulador-dse-demo-v7.json` | - | **SO bancada. NAO importar no PC de producao.** |

## 2. Variaveis
**Processo (PM2), uma vez:** `PLC_IP`, `DSE_URL` (ver `config/pc-bt2.env.example`).
**Da ABA (Propriedades da aba > Variaveis de ambiente):**
| Variavel | Padrao | Onde | O que faz |
|---|---|---|---|
| `BT2_ORIGENS_OK` | vazia | todas as abas protegidas | origens extras aceitas nas rotas de escrita (D3). Nao usar `null` |
| `CONF_JANELA_MS` | 2000 | abas de chaves | tempo ate a confirmacao do PLC; depois responde **504 incerto** |
| `QUARENTENA_MS` | 10000 | abas de chaves | quarentena da variavel apos um 504 |
| `WD_HTML_S` | 30 | abas de chaves | vigia "HTML sumiu" |
| `BT2_BANCADA` | 0 | so no simulador | 1 = simulador liga (somente bancada) |
Atencao: `CONF_JANELA_MS` precisa ser **medido** na bancada (ver 4): um banco de 32 chaves escreve 33 variaveis num "Desligar banco".

## 3. Respostas novas das rotas de chaves (o medidor 1.10.167 trata qualquer nao-200 como recusa; nenhuma mudanca de front foi feita)
| Codigo | Quando |
|---|---|
| 403 `D3_*` | origem externa / sem origem / nao-JSON (Fase 2) |
| 409 `CANCELADO_POR_DESLIGAR` | comando "ligar" pendente cancelado porque um Desligar banco foi aceito depois (a prioridade do desligar continua) |
| 409 `ESTADO_MUDOU` | o estado mudou enquanto o comando esperava na fila (banco desligou, chave desabilitada, etc.) |
| 503 `LEITURA_VELHA` | leitura do PLC com mais de 2,5 s ao sair da fila |
| 503 `AGUARDE_CONFIRMACAO` (+`Retry-After`) | variavel em quarentena apos um 504 |
| 504 `incerto:true` | comando enviado, PLC nao confirmou na janela: **reler o estado antes de repetir** |
| 500 | erro explicito do PLC/driver (definitivo, sem quarentena) |
Desligar chave, Desligar banco e o ZERAR do vigia **passam** pela quarentena e sao reafirmados.

## 4. VALIDACAO DE BANCADA (antes do PC de producao) - nada disto foi possivel verificar daqui
| # | Verificar | Esperado | Por que importa |
|---|---|---|---|
| 1 | **Tempo real de escrita S7**: "Desligar banco" do BC595 (33 variaveis) e "limpar" do registro (42 variaveis) | cabem em `CONF_JANELA_MS` (2 s) / 1,5 s | senao 504 / 500 falsos; ajustar a variavel da aba |
| 2 | **Driver S7 aplica escritas em serie ou em paralelo?** | anotar | decide se P3-A5 (escrita antiga ultrapassa a nova) pode ocorrer |
| 3 | **FB101**: com banco desligado, `CbLigar` e zerado? | sim | P3-A3: correcao no Node-RED vale, mas a protecao real e do PLC |
| 4 | **Consumidores do DB2100** leem os dados do snapshot so com `preenchValido=TRUE`? | sim | P3-B1: os dados em si nao sao atomicos |
| 5 | Com a leitura do PLC fora (cabo/queda) 12 s e dois comandos na fila | anotar tempos | P3-E1: a fila nao falha rapido; o front desiste aos 10 s |
| 6 | Medidor 1.10.167 comanda normalmente (ligar banco, habilitar, selecionar, ligar chave, setup, ensaio, registro) | tudo OK; um 504/503 raro e reportado como erro de comunicacao | compatibilidade |
| 7 | Rodar `BT2_ESTRESSE_S=600` na maquina de teste e comparar latencias | abaixo de 10 s | soak |

## 5. Passo a passo no PC (somente depois da bancada)
1. Backup (manifesto do backup `pre-portao2`) e anotar as variaveis das abas.
2. Variaveis do processo (PM2) e `settings.js` com `adminAuth` (TI).
3. Importar **uma aba por vez**, fazer Deploy e conferir o GET da rota e o chip "PLC" do medidor antes da proxima.
4. Conferir que **nao existe** a aba do simulador.
5. Teste de bloqueio: `curl -i -X POST -H "Content-Type: application/json" -d "{}" http://<servidor>:1880/api/dev/logs/limpar` => 403.
6. Se algo divergir: voltar a aba antiga (arquivo mantido) e abrir ocorrencia com o log do Node-RED.

## 6. Limites (resumo; detalhes no `BACKLOG_FORA_DE_ESCOPO.md`)
PLC simulado em memoria, nao o driver/tempo reais; escrita serial como padrao e suposicao; a reafirmacao limita (nao elimina) o tempo de chave ligada indevidamente; quarentena/reafirmacao/fila ficam so em memoria; guarda de origem nao e login; F2-1, F4-1, F4-2 e a rota `tensao` continuam como estavam.
