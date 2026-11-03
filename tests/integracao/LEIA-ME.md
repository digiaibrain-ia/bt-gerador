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

| `f11_front_contra_back.test.js` | o medidor real (Chromium) contra o Node-RED de teste: chip do PLC, estado das chaves na tela, comando de ligar o banco, queda do PLC (503) com aviso, recuperacao. O navegador so acessa o Node-RED de teste; o resto e bloqueado |

## Trava de seguranca (4 camadas, `trava_producao.js`)
1. Configuracao so aceita localhost/127.0.0.1; IPs reais do projeto sao recusados.
2. Os fluxos de producao carregados com endereco S7 real sao listados e substituidos pelo simulado.
3. Guarda de rede: qualquer conexao TCP fora do localhost lanca erro antes de sair da maquina.
4. Recusa `NODE_ENV=production` e roda so com `BT2_AMBIENTE_TESTE=local` (o `npm test` faz isso).

## Achados pendentes
Testes marcados `todo` mostram o comportamento esperado e falham de proposito: **F4-2, F4-1, F2-1**. O F11 registra (sem falhar) o endereco real que o navegador tentou acessar: **F2-3**. Estao em `BACKLOG_FORA_DE_ESCOPO.md`.

## Arquivos que nao vao ao Git
`tests/integracao/runtime/` (instalacao do Node-RED e pasta temporaria de cada execucao).

## Portao 3 (D3) - guarda de escrita
`seguranca/s3_portao3.test.js` (13 testes): toda rota de escrita das versoes novas (chaves v3.2/v1.3, registro v1.7, dev-logs v1.2, simulador v7) exige Origin/Referer da mesma origem e `Content-Type: application/json`; origem externa, sem origem ou outro tipo de conteudo -> 403 e nada vai ao PLC. Inclui ataque real no Chromium (pagina de outra origem, POST `text/plain` no-cors).
O auxiliar `post()` de `ajudas.js` imita a tela (manda `Origin` do servidor); o 4o argumento sobrescreve/remove cabecalhos.

## Fase 3, Portao 1 - instrumentacao de concorrencia (so teste; nenhum fluxo de producao alterado)
Recursos novos do PLC simulado (`plc_simulado.js`) e do harness:
- `plc.latencia = { escritaMs, escritaJitterMs, leituraMs, leituraJitterMs, serial }` - latencia/jitter de escrita e de leitura. `serial:true` (padrao) = escritas uma apos a outra, como a fila de um driver; `false` = concorrentes (podem se ultrapassar).
- `plc.semente(n)` - jitter reproduzivel. `plc.atrasosEscrita.push(ms | fn)` - atraso explicito, um por escrita, na ordem.
- `plc.falhas.escritaApos = n` - depois de n escritas dos fluxos o PLC "cai" e as seguintes sao recusadas.
- `plc.trace` - escritas FEITAS PELOS FLUXOS: `{n, addr, valor, tChegada, tInicio, tAplicada, ok, ordem}`; `plc.maxEmVoo`. (`plc.escrever` direto do teste nao entra no trace.)
- `h.logs` - avisos/erros do Node-RED da execucao (para achar resposta em duplicidade).
- `verificador.js` - `valoresAplicados`, `sobreposicoes`, `ordemDeInicio`, `semRespostaPerdida`, `respostasEmDuplicidade`, `percentis`.
`instrumentacao/i1_instrumentacao.test.js` (15 testes) prova que o ambiente reproduz e mede; **nao** afirma nada sobre o comportamento dos fluxos (isso e o Portao 2).
Limite: a escrita **serial** e uma suposicao sobre o driver S7 real (nao confirmada); por isso o Portao 2 testa os dois modos.

## Fase 3, Portao 2 - caracterizacao de concorrencia (nenhum fluxo alterado)
`concorrencia/c2_caracterizacao.test.js` (20 testes: 12 verdes + 8 `todo` = achados P3-A1..A5, P3-B1, P3-C1, P3-C2). Cada `todo` escreve o comportamento ESPERADO; quando o fluxo for corrigido o teste passa a verde e o `todo` sai. Modo de escrita: serial (padrao) e concorrente so onde muda o resultado (P3-A5 e o teste de FIFO). Detalhes e gravidades no `BACKLOG_FORA_DE_ESCOPO.md`.
