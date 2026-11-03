# Testes de integracao (Fase 1)

Sobe o **Node-RED 5.0.9 local** com os **fluxos de producao lidos do disco** (sem editar os arquivos) e troca **so os nos S7** por nos de teste ligados a um **PLC simulado em memoria**.

## Como rodar
Uma vez, a instalacao local do Node-RED (ja feita; fica em `runtime/`, fora do Git):
    npm --prefix tests/integracao/runtime install node-red@5.0.9

Depois, a suite inteira:
    npm --prefix tests/integracao test

Um arquivo so:
    cd tests/integracao && BT2_AMBIENTE_TESTE=local node --test f5_vigia_html.test.js

## O que cobre
| Arquivo | Fluxo |
|---|---|
| `t0_trava_producao.test.js` | a trava: recusa producao, IP real e URL que nao e localhost |
| `f1_leitura_chaves.test.js` | leitura dos 4 bancos e PLC sem resposta |
| `f2_comando_chaves.test.js` | habilitar, ligar e desligar chaves (travas de banco e de chave) |
| `f3_banco_ligar_desligar.test.js` | ligar/desligar o banco (ET200 e seletora) |
| `f4_setup_tensao.test.js` | chaveamento 220/380/440 V e Setup |
| `f5_vigia_html.test.js` | vigia "HTML sumiu" |
| `f6_fila_gravacao.test.js` | comandos simultaneos, repeticao e recuperacao de erro |
| `f7_registro_ensaio.test.js` | registro do ensaio no DB2100 |
| `f8_logs.test.js` | log das chaves e log de desenvolvedor |
| `f9_simulador_bancada.test.js` | simulador de bancada (sem DSE real) |
| `f10_contrato_html_rotas.test.js` | toda rota que o HTML chama existe num fluxo |

F11 (front real com Playwright) **nao esta** nesta suite ainda.

## Trava de seguranca (4 camadas, `trava_producao.js`)
1. Configuracao so aceita localhost/127.0.0.1; IPs reais do projeto sao recusados.
2. Os fluxos de producao carregados com endereco S7 real sao listados e substituidos pelo simulado.
3. Guarda de rede: qualquer conexao TCP fora do localhost lanca erro antes de sair da maquina.
4. Recusa `NODE_ENV=production` e roda so com `BT2_AMBIENTE_TESTE=local` (o `npm test` faz isso).

## Achados pendentes
Testes marcados `todo` mostram o comportamento esperado e falham de proposito: **F4-2, F4-1, F2-1**. Estao em `BACKLOG_FORA_DE_ESCOPO.md`.

## Arquivos que nao vao ao Git
`tests/integracao/runtime/` (instalacao do Node-RED e pasta temporaria de cada execucao).
