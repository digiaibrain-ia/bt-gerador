# Fase 3 - Condicoes de corrida e idempotencia: fechamento (v0.1)

## Resultado por achado
| ID | Gravidade | O que era | Correcao | Versoes | Teste |
|---|---|---|---|---|---|
| P3-A1 | Alta | Desligar banco furava a fila e um Ligar banco mais antigo executava depois (banco terminava LIGADO) | expurgo dos "ligar" pendentes (409 `CANCELADO_POR_DESLIGAR`); prioridade do desligar preservada | chaves-56/400 v3.3, 550/595 v1.4 | `c3_etapa4a` (4 bancos) |
| P3-A2 | Media | `selecionar` validado antes e executado depois de `habilitar:false` | revalidacao na saida da fila (409 `ESTADO_MUDOU`) | idem | `c3_etapa4a` |
| P3-A3 | Alta* | `ligar chave` executava depois do Desligar banco | expurgo + revalidacao | idem | `c3_etapa4a` |
| P3-A4 | Media | falso 500 com escrita aplicada depois | janela de confirmacao 2 s; 504 `incerto:true` | chaves-56/400 v3.4, 550/595 v1.5 | `c4_etapa4b` |
| P3-A5 | Alta (cond.) | escrita antiga atrasada ultrapassava a nova | quarentena por variavel + reafirmacao dos comandos de seguranca | idem | `c4_etapa4b`, `c2` |
| P3-B1 | Media | `preenchValido=TRUE` gravado antes dos dados | preenchimento em duas fases | registro-ensaio v1.8 | `c5_etapa4c` |
| P3-C1 | Baixa | lote antigo descartado como duplicado | dedup por conjunto (500 `n`/sessao) | dev-logs v1.3 | `c5_etapa4c` |
| P3-C2 | Baixa | cursor a frente sem sinal | `cursorAdiante` e `reiniciado` (aditivo) | dev-logs v1.3 | `c5_etapa4c` |
*gravidade real depende do FB101 no PLC.
Todos os testes de correcao **falham nas versoes anteriores e passam nas novas** (verificacao por mutacao).

## Achados novos da Etapa 5 (NAO corrigidos; ficam como `todo`)
| ID | Gravidade | O que |
|---|---|---|
| P3-E1 | Media | Com o PLC sem leitura, a fila nao falha rapido: o 1o comando espera o vigia de 8 s e o 2o fica parado ate a leitura voltar (8,0 s e 12,1 s no teste); o front desiste aos 10 s e o comando ainda executa depois |
| P3-E2 | Baixa/Media (cond.) | O registro nao tem janela de confirmacao: `limpar` (42 variaveis) com escrita de 80 ms cada da falso 500 (as escritas terminam depois) |

## Medicoes do estresse (carga imitando o front: 3 POST simultaneos, GET a cada 1 s; 12 s por rodada)
| Perfil | POST p50 / p95 / max | Status | Observacao |
|---|---|---|---|
| normal | 1,7 s / 1,8 s / 1,8 s | 200, 409, 400 | fila serial, sem sobreposicao |
| jitter (escrita 80+-60, leitura 80+-60) | 1,7 s / 1,8 s / 1,8 s | 200, 409, 400 | |
| degradado (escrita 600+-400, leitura 300+-200) | 2,6 s / 6,6 s / 6,6 s | + 503 AGUARDE, 504 | quarentena e janela entram |
| escritas tardias de 3 s a cada 4 s, serial | 3,3 s / 6,5 s / 6,5 s | + 504, 409 cancelado | estado final seguro |
| idem, CONCORRENTE | 2,7 s / 3,4 s / 3,4 s | + 504, 503 | sem tempo indevido de chave ligada (reafirmacao) |
| BC595 (32 chaves), jitter | 1,2 s / 4,3 s / 4,4 s | + 504, 503 | desligar banco = 33 escritas; ver nota |
| registro sequencial (como o front) | ~4,0 s por chamada | 200 | preenchimento passou de ~2 s para ~4 s |
| PLC sem leitura 12 s, 2 comandos | 8,0 s e 12,1 s | 503, 200 | P3-E1 |
Em todos os perfis: 0 pedido sem resposta, 0 resposta em duplicidade, GET sempre < 25 ms, estado final seguro (banco desligado, 0 chave ligada).
**Nota (corrige uma estimativa minha):** o custo do preenchimento em duas fases foi ~4 s por chamada, nao ~3 s. Como o front serializa as gravacoes do ensaio, ainda fica abaixo de 10 s; **dois clientes ao mesmo tempo** (3 operacoes simultaneas) chegam a ~12 s (a v1.7 chegava a ~10 s).
**Nota (sensibilidade):** no BC595, com 80 ms por variavel, o "Desligar banco" (33 variaveis) passa da janela de 2 s e responde 504. Isso depende do tempo real do driver S7 (item 1 da bancada) e `CONF_JANELA_MS` e ajustavel por aba.

## Limites de arquitetura mapeados
Ver `BACKLOG_FORA_DE_ESCOPO.md` (Fase 3 - Etapa 5) e o roteiro v0.5, secoes 4 e 6.
