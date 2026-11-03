# Checklist de validacao de bancada (PC BT2 / TI) - v0.1

Complementa o `IMPLANTACAO_ROTEIRO_v0.5.md`. **Nada deste checklist foi possivel verificar no repositorio** (PLC simulado). Preencha a coluna "Resultado" e devolva o documento.
**Execucao conjunta (decisao do projeto):** a **Engenharia de Automacao** conduz as validacoes funcionais (tempos, regras de negocio, comportamento de seguranca no Node-RED e no PLC) e a **TI** conduz e valida a infraestrutura do PC BT2 (variaveis do PM2, `settings.js`/`adminAuth`, rede e origem). Cada bloco abaixo indica o lider.
**Ambiente:** o proprio **PC BT2 fisico**, com a **carga de potencia DESACOPLADA** (disjuntores/contatores de potencia abertos e sinalizacao de seguranca ativa). Confirmar tambem o procedimento de seguranca do local.
Regras: **nunca** importar o simulador no PC de producao; ao menor comportamento inesperado, voltar a versao anterior (secao 9). Como a carga esta desacoplada, bits de **retorno** (`Ligada`/`sb`) vindos de contatores/ET200 podem nao reagir como em operacao: **anotar** quando um item depender disso, sem forcar o equipamento.
Dados da execucao: data ____ / Engenharia (nome) ____ / TI (nome) ____ / versao do Node-RED ____ / versao do `node-red-contrib-s7` ____ / commit do pacote: `51481df` / medidor `1.10.167`.

| Bloco | Lider | Apoio |
|---|---|---|
| 0 (pre-condicoes) e 1 (importacao) | TI | Engenharia confere os `GET` |
| 2 (medicoes), 3 (driver S7), 5 (comportamento), 6 (falhas), 7 (soak) | Engenharia | TI acompanha rede/logs |
| 4 (protecao no PLC/TIA) | Engenharia (responsavel pelo PLC) | - |
| 8 (go/no-go) e 9 (voltar atras) | decisao conjunta; execucao do rollback pela TI | |

## 0. Pre-condicoes (todas obrigatorias)
| # | Item | Resultado |
|---|---|---|
| 0.1 | Backup feito (fluxos exportados, `settings.js`, `flows_cred.json`, `.node-red`, `public/html`) e restauracao testada ou ao menos listada | |
| 0.2 | `sha256sum -c MANIFESTO.sha256` sem erro (arquivos do pacote integros) | |
| 0.3 | Variaveis do processo (PM2): `PLC_IP`, `DSE_URL` preenchidas (`config/pc-bt2.env.example`) e Node-RED reiniciado | |
| 0.4 | `adminAuth` ativo no `settings.js` (login do editor) e porta do Node-RED acessivel so pela rede da planta | |
| 0.5 | **Nao existe** a aba "Simulador DSE (Demo)" no editor | |
| 0.6 | Anotadas as variaveis atuais de cada aba (`WD_HTML_S` etc.) | |
| 0.7 | **Carga de potencia DESACOPLADA**: disjuntores/contatores de potencia abertos, sinalizacao de seguranca ativa; conferido por (nome) ____ antes de qualquer comando | |
| 0.8 | Papeis combinados: lider da Engenharia ____ e lider da TI ____; quem pode interromper o teste (qualquer um dos dois) | |
| 0.9 | Estado seguro conhecido: sabem como colocar o banco em "desligado" fora do Node-RED (comando local/seletora em Manual) | |

## 1. Importacao (uma aba por vez; Deploy e conferencia antes da proxima)
| # | Aba | Conferencia apos o Deploy | Resultado |
|---|---|---|---|
| 1.1 | chaves-56 v3.4 | `GET /api/chaves/56` = 200 com leitura do PLC | |
| 1.2 | chaves-400 v3.4 | `GET /api/chaves/400` = 200 | |
| 1.3 | chaves-550 v1.5 | `GET /api/chaves/550` = 200 | |
| 1.4 | chaves-595 v1.5 | `GET /api/chaves/595` = 200 | |
| 1.5 | registro-ensaio v1.8 | `GET /api/ensaio/snap` = 200 | |
| 1.6 | dev-logs v1.3 | `GET /api/dev/logs` = 200 | |
| 1.7 | cliente-156 v3, cliente-31 v4, servidor v3_7 | `GET /api/gerador` responde (DSE via `DSE_URL`) | |
| 1.8 | medidor 1.10.167 em `public/html` | abre por `http://<servidor>:1880/html/...`; chip "PLC" = leitura ok | |

## 2. Medicoes que decidem parametros (anotar numeros)
| # | Medida | Como medir | Esperado / decisao | Valor medido |
|---|---|---|---|---|
| 2.1 | Tempo do **"Desligar banco" do BC595** (33 variaveis) | comandar e ler `ms` em `GET /api/logs/595` (rota `BANCO`) | < 2000 ms. Se maior: aumentar `CONF_JANELA_MS` da aba (ex.: 3000) e repetir | |
| 2.2 | Tempo do **"Desligar banco" do BC56/400/550** | idem em `/api/logs/56` etc. | < 2000 ms | |
| 2.3 | Tempo de **"habilitar"** e **"ligar chave"** | idem | < 1000 ms tipico | |
| 2.4 | Tempo do **preenchimento** e do **limpar** do registro (duas fases) | cronometrar a chamada no medidor / Network do navegador | preenchimento ~3-4 s; limpar < 2 s; **sem 500** | |
| 2.5 | Ciclo real de leitura do `s7 in` | observar a frequencia de atualizacao | ~200 ms (BC) | |

## 3. Driver S7 (decide a P3-A5)
| # | Verificar | Como | Resultado |
|---|---|---|---|
| 3.1 | O `node-red-contrib-s7` instalado aplica **escritas em serie** ou em **paralelo**? | ler a documentacao/codigo da versao instalada e/ou provar: enviar duas escritas seguidas na mesma variavel com valores diferentes e observar a ordem no PLC (Watch table / trace do TIA com carimbo de tempo) | |
| 3.2 | Escrita com PLC desconectado: o `s7 out` reporta erro (vai para o `catch`) ou fica mudo? | desconectar o cabo, comandar `habilitar`; esperado **500** (erro explicito) ou **504/503** (mudo) | |

## 4. Protecao no PLC (TIA) - o intertravamento definitivo
| # | Verificar | Como | Esperado | Resultado |
|---|---|---|---|---|
| 4.1 | **FB101 zera `CbLigar` com o banco desligado** | no TIA, forcar `CbLigar[2]=TRUE` com `LigarBanco=FALSE` | `CbLigar`/saida da chave nao energiza | |
| 4.2 | "Desligar" tem prioridade no PLC sobre "ligar" | forcar os dois no mesmo scan | desligado | |
| 4.3 | **Consumidores do DB2100** usam os dados so com `preenchValido=TRUE` | no TIA, procurar usos do DB2100; forcar `preenchValido=FALSE` com dados preenchidos | nenhum bloco usa os dados | |
| 4.4 | `ComEt200Ok` falso derruba o banco | simular perda do ET200 | `LigarBanco` volta a FALSE | |

## 5. Comportamento do Node-RED novo (com o medidor, PLC real/bancada)
| # | Cenario | Esperado | Resultado |
|---|---|---|---|
| 5.1 | Operacao normal: ligar banco, habilitar, selecionar, ligar chave, desligar chave, desligar banco | tudo 200; estado confere na tela | |
| 5.2 | Dois comandos rapidos: "Ligar banco" e logo "Desligar banco" | banco termina **desligado**; o "ligar" pode aparecer como recusa `CANCELADO_POR_DESLIGAR` (409) | |
| 5.3 | Habilitar:false numa chave e logo "selecionar" nela | `selecionar` recusado `ESTADO_MUDOU` (409); `ChaveSel` nao fica na chave desabilitada | |
| 5.4 | Origem externa: `curl -i -X POST -H "Content-Type: application/json" -d "{}" http://<servidor>:1880/api/dev/logs/limpar` | **403** `D3_sem_origem` | |
| 5.5 | Mesmo `curl` com `-H "Origin: http://<servidor>:1880"` | 200 (so log; sem efeito no PLC) | |
| 5.6 | Registro: preenchimento + etapa + limpar pelo medidor | 200; snapshot so "valido" depois da 2a fase | |
| 5.7 | `GET /api/dev/logs?desde=999999` | `cursorAdiante:true` | |

## 6. Falhas (anotar tempos; **nao e criterio de reprovacao**, e dado para os achados P3-E1/E2)
| # | Cenario | Como | Anotar | Resultado |
|---|---|---|---|---|
| 6.1 | PLC sem leitura 12 s com 2 comandos | desconectar o cabo, enviar 2 `habilitar`, reconectar depois de 12 s | tempo de cada resposta (referencia no simulador: 8,0 s e 12,1 s) | |
| 6.2 | Depois da volta, a fila atende o proximo comando em < 3 s e sem resposta duplicada | comandar | 200 rapido | |
| 6.3 | `504 incerto`: se aparecer em operacao normal, anotar a rota, o `ms` e o tamanho do banco | log `/api/logs/{id}` | | |
| 6.4 | Quarentena: apos um 504, repetir o mesmo comando antes de `QUARENTENA_MS` | 503 `AGUARDE_CONFIRMACAO` (+`Retry-After`); outra chave do mesmo banco continua livre | | |

## 7. Operacao assistida (soak)
30 minutos de operacao normal com o `gerenciador_logs` aberto. Contar POSTs com status diferente de 200 por tipo (409/503/504/500) e **qualquer timeout de 10 s do medidor**. Esperado: nenhum timeout; 409 apenas em cliques conflitantes; 504 raro. Resultado: ____

## 8. Criterios de aprovacao (go / no-go)
- **GO:** itens 0, 1, 4.1, 4.3, 5.1 a 5.6 aprovados; 2.1 a 2.4 dentro do esperado ou com `CONF_JANELA_MS` ajustado e repetido; soak sem timeout.
- **NO-GO (voltar a versao anterior):** qualquer chave energizada com banco desligado depois de um comando; "Desligar banco" que nao desliga; 500/504 frequentes em operacao normal; medidor sem leitura; aba do simulador presente.
- **Anotar e seguir (nao bloqueia):** 6.x (P3-E1/E2), 3.1 (so decide se a quarentena e necessaria).

## 9. Voltar atras
Reimportar a aba anterior (arquivo mantido), apagar a nova, Deploy e conferir o `GET` da rota. Restaurar variaveis das abas anotadas em 0.6. Abrir ocorrencia com o log do Node-RED e este checklist preenchido.
