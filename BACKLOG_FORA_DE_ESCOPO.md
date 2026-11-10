# Backlog fora de escopo (regra 5)

Achados que **não** são corrigidos durante a Fase 1. Ficam aqui para tratarmos depois, em passo próprio e com "OK".
Achados que os testes da Fase 1 revelaram aparecem como testes **pendentes** (`todo`) com o ID; o comportamento esperado continua escrito no teste.

## Achados da Fase 1 (testes pendentes)

| ID | Gravidade | Onde | O que acontece | O que deveria acontecer | Teste |
|---|---|---|---|---|---|
| F4-2 | **Alta** | `POST /api/chaves/{56,400,550,595}/tensao`, fluxo `chaves-*` | Com o PLC sem resposta, a rota responde **erro 500** ("leitura de volta nao conferiu"), mas o chaveamento **já foi gravado** no PLC. A conferência lê o cache parado, não o PLC. O operador vê erro e o estado mudou. | Se a resposta é erro, o PLC não pode ter mudado. Conferir no PLC, não no cache. | `f4_setup_tensao.test.js` (ACHADO F4-2) |
| F4-1 | Média | mesma rota | A validação aceita dado de até **5 s** de idade (DB3002), enquanto o `GET` já recusa com **2,5 s**. Entre 2,5 e 5 s o POST tenta escrever sem PLC. | Recusar com 503 antes de escrever, com a mesma regra de idade do `GET`. | `f4_setup_tensao.test.js` (ACHADO F4-1) |
| F2-1 | Baixa | `http in` de todas as rotas de chaves | JSON malformado no corpo volta como **500** ("Internal Server Error"): erro do cliente tratado como erro do servidor. | 400. | `f2_comando_chaves.test.js` (ACHADO F2-1) |

## Achados do F11 (para a Fase 2)

| ID | Gravidade | Onde | Observação |
|---|---|---|---|
| F2-3 | ~~Média~~ **resolvido no Portão 1 (medidor 1.10.167)** | `medidor_gerador_v1.10.166.html` (antes) | O HTML traz **fixo o endereco real do DSE** (`[IP_PC_BT2]:1880`) e tenta falar com ele a cada consulta. Durante o teste o navegador foi bloqueado (a trava funcionou), mas o cliente conhece um endereco de producao. Tema da Fase 2 (nunca confiar no cliente). |

## Outros achados (anotados, sem teste ainda)

| ID | Gravidade | Onde | Observação |
|---|---|---|---|
| D-1 | Baixa | cabeçalho do fluxo `chv56_wd_html` (vigia "HTML sumiu") | O texto diz que o vigia só zera `CbLigar`. O código também desliga o banco (`LigarBanco`, v2.4). Corrigir o texto (documentação), não o código. |
| D-2 | Baixa | `WD_HTML_S` (tempo do vigia) | O limite é lido da **variável da aba** (Propriedades da aba). Conferir no PC BT2 que a aba tem o valor certo (padrão 30 s). |
| D-3 | Média | `s7 in` de todos os fluxos | O teste roda com o **Node-RED 5.0.9**. A versão do PC BT2 não foi confirmada; comportamento pode diferir. |

## Fase 2 - Portao 3 (D3): limites registrados

| ID | Gravidade | Onde | Observacao |
|---|---|---|---|
| D-4 | Media | rotas de escrita (D3) | A guarda de Origin/Content-Type **nao e login**. Continua dependendo da TI: `adminAuth` no `settings.js` e rede. Confirmar no PC. |
| D-5 | Baixa | rotas de escrita (D3) | DNS rebinding passa na comparacao Origin = Host. Mitigacao de rede/nome (TI). |
| D-6 | Baixa | uso do medidor como arquivo local | `Origin: null` e barrado; abrir pelo endereco do servidor. `BT2_ORIGENS_OK=null` existe mas libera paginas isoladas de qualquer site (nao recomendado). |
| D-7 | Baixa | `dev-logs` e simulador | Rotas de log/simulador estao sob a mesma guarda; o simulador continua so para bancada (D4). |

## Fase 3 - observacoes do Portao 1 (a CONFIRMAR no Portao 2; nada foi corrigido)

| ID | Observacao (explorando o BC56 v3.2 com a instrumentacao) | Estado |
|---|---|---|
| P3-o1 (confirmado como P3-A4) | Com latencia de escrita de **700 ms** (> espera de 450 ms do fluxo), os 6 comandos `habilitar` simultaneos responderam **500** (leitura de volta nao conferiu) enquanto o PLC simulado aplicou as escritas (5 de 6 ja aplicadas quando a resposta saiu, a 6a ainda em voo). Sinal de resposta **antes** da escrita terminar / falso erro que levaria o cliente a repetir. Relaciona-se a R2, R6 e ao F4-2. | hipotese; caracterizar no Portao 2 |
| P3-o2 | Com 6 comandos simultaneos e escrita serial, a fila atendeu **um por vez** (sem sobreposicao), com ~570 ms por comando (a ultima resposta a ~3,5 s). | informativo (I1 ok neste cenario) |

## Fase 3 - Portao 2: achados CONFIRMADOS (testes `todo` em `tests/integracao/concorrencia/c2_caracterizacao.test.js`; nada corrigido)

| ID | Gravidade | Hipotese | Onde | O que acontece (reproduzido) | O que deveria acontecer |
|---|---|---|---|---|---|
| ~~P3-A1~~ **corrigido na Etapa 4a** | **Alta** | R5/R1 | `chaves-*`, `fila` (prioridade do "Desligar banco") | "Ligar banco" aceito antes e "Desligar banco" depois: o desligar **fura a fila** (`unshift`) e o ligar mais antigo executa **depois**. As 3 respostas sao 200 e o banco termina **LIGADO**. | O ultimo comando aceito prevalece (banco desligado). |
| ~~P3-A2~~ **corrigido na Etapa 4a** | Media | R1 | `chaves-*`, `valida selecionar` fora da fila | `selecionar` e validado com a chave habilitada; um `habilitar:false` que ja estava na frente executa antes. Termina `ChaveSel=3` com `Habilitada3=false`. | Revalidar ao sair da fila ou recusar. |
| ~~P3-A3~~ **corrigido na Etapa 4a** | **Alta*** | R1+R5 | `chaves-*`, `valida ligar` + prioridade | `ligar chave` validado com banco ligado executa **depois** do "Desligar banco" prioritario: `CbLigar2=TRUE` com `LigarBanco=FALSE`. *Gravidade a confirmar com o FB101 no PLC (ele pode zerar). | Revalidar ao sair da fila. |
| ~~P3-A4~~ **corrigido na Etapa 4b** | Media | R2/R6 | `chaves-*`, espera de 450 ms + `confere` | Escrita mais lenta que 450 ms: resposta **500** ("leitura de volta nao conferiu") e a escrita e **aplicada depois** (9 s no teste). Falso erro: o cliente repete ou desiste. Ja tinha sido visto como P3-o1; relaciona-se ao F4-2 (mesmo padrao na rota `tensao`). | Resposta coerente com o estado final (ou "estado desconhecido, releia"). |
| ~~P3-A5~~ **corrigido na Etapa 4b** | **Alta (condicional ao driver)** | R2/R5, modo concorrente | `chaves-*` + driver S7 | So se o driver real aplicar escritas **concorrentes**: escrita antiga atrasada ultrapassa a nova e `CbLigar1` termina TRUE depois de `ligar:false` responder 200. No modo serial (suposicao) nao ocorre. | Confirmar o comportamento do driver S7 no PC; se concorrente, versionar/descartar escrita antiga. |
| ~~P3-B1~~ **corrigido na Etapa 4c** | Media | R7 | `registro-ensaio-db2100-api`, rota `preenchimento` | `preenchValido=TRUE` e gravado **primeiro**. Com queda do PLC apos 2 escritas ele fica TRUE, a serie gravada e o resto vazio (snapshot parcial "valido"). A `etapa` esta correta (bit Salva por ultimo). | Gravar `preenchValido` **por ultimo** (correcao possivel so no fluxo). Atomicidade total pode exigir mudanca de layout do DB2100: **limite de arquitetura (decisao do Gemini): so registrar**. |
| ~~P3-C1~~ **corrigido na Etapa 4c** | Baixa | R8 | `dev-logs-api` | Dedup por "maior n ja aceito": se o lote 4-6 chega antes do lote 1-3 (dois POSTs em voo), os eventos 1-3 sao **descartados em silencio** como duplicados. | Dedup por conjunto de n (ou aceitar fora de ordem). |
| ~~P3-C2~~ **corrigido na Etapa 4c** | Baixa | R8 | `dev-logs-api`, `GET /api/dev/logs` | Cursor `desde` **a frente** do ultimo seq (ex.: apos reinicio do Node-RED) devolve lista vazia sem sinal; so o campo `boot` permite perceber. | Sinalizar (`cursorAdiante`/`reiniciado`). |

**Etapa 4a (Fase 3):** P3-A1, A2 e A3 corrigidos nas versoes `chaves-56/400 v3.3` e `chaves-550/595 v1.4` (expurgo na fila + revalidacao na saida; testes `concorrencia/c3_etapa4a.test.js` nos 4 bancos; os mesmos testes **falham** nas versoes anteriores). Falta no PC: confirmar no TIA que o FB101 zera CbLigar com banco desligado (A3) e a importacao pela TI. O ramo `LEITURA_VELHA` (cache do PLC com mais de 2,5 s na saida da fila) so tem verificacao estatica; nao reproduzi de forma deterministica.

**Etapa 4b (Fase 3):** P3-A4 e P3-A5 corrigidos em `chaves-56/400 v3.4` e `chaves-550/595 v1.5` (gerador `gerar_fluxos_portao4b_v0.1.py`; testes `concorrencia/c4_etapa4b.test.js` nos 4 bancos; falham nas versoes anteriores). Variaveis da aba novas: `CONF_JANELA_MS` (2000) e `QUARENTENA_MS` (10000). **Limites desta etapa (a validar no PC):** (a) a reafirmacao limita o tempo com a chave indevidamente ligada (~1 a 3 s no teste), nao o elimina: uma escrita tardia ja enviada nao pode ser recolhida; (b) o `s7 in` de teste so emite por ciclo e ignora o gatilho de leitura: no PC o "retenta" forca uma leitura imediata, caminho nao exercitado pelo simulador (a avaliacao ocorre pela leitura ciclica); (c) quarentena e reafirmacao ficam so em memoria (somem no reinicio do Node-RED, como a fila); (d) `SALVAR` nao usa a janela (SetupOk e decisao do PLC) e a rota `tensao` nao foi tocada (F4-1/F4-2); (e) erro EXPLICITO de escrita agora responde 500 definitivo pelo `catch` (os pedidos de escrita passaram a carregar o `_reqId`), sem quarentena.

**Etapa 4c (Fase 3):** P3-B1, P3-C1 e P3-C2 corrigidos em `registro-ensaio v1.8` e `dev-logs v1.3` (gerador `gerar_fluxos_portao4c_v0.1.py`; testes `concorrencia/c5_etapa4c.test.js` e `c2`; falham nas versoes anteriores). **Limites:** (a) P3-B1: os dados em si continuam nao atomicos; o contrato e "so ler o snapshot quando `preenchValido=TRUE`" e **precisa ser confirmado no TIA** nos consumidores do DB2100 (atomicidade total exigiria mudar o layout: limite de arquitetura registrado, nao tocado); o preenchimento leva ~3 s; (b) P3-C1: a janela de dedup e de 500 `n` por sessao (n mais de 500 atras do maior e tratado como duplicado); eventos de lote antigo ganham `seq` maior (ordem de chegada; `n` e `t` corretos); (c) P3-C2: o gerenciador de logs ainda nao usa os sinais `cursorAdiante`/`reiniciado` (so o servidor foi alterado; ajuste do gerenciador seria uma versao nova do HTML, fora desta etapa).

**Situacao ao fim da Etapa 4c:** todos os achados P3-A1..A5, B1, C1, C2 estao corrigidos nas versoes novas; continuam pendentes **apenas** F2-1, F4-1 e F4-2 (mantidos de proposito). Falta a Etapa 5 (estresse, roteiro de implantacao v0.5) e a validacao no PC.

Comportamentos **corretos** confirmados (testes verdes): fila FIFO para comandos comuns sob jitter nos dois modos de escrita; fila liberada depois de falso 500 e depois de timeout 503 de 8 s, sem resposta duplicada; comandos absolutos idempotentes (chaves e registro); `etapa` sem estado parcial; registro serializado com estado final do ultimo aceito; logs sem perda com 30 lotes concorrentes, reenvio deduplicado e `limpar` sem ressuscitar eventos.

**Caracterizado, nao e achado:** cliente que desiste (aborta) com o comando ja na fila: o comando **ainda executa** (R9).

**Nao reproduzivel de forma deterministica (R4):** o vigia "HTML sumiu" so gera o `ZERAR` com a fila livre; a unica janela e de um tick entre a checagem do vigia e a entrada na `fila`. Analise por leitura: o `ZERAR` tambem tem prioridade (`unshift`), mesma mecanica do P3-A1/A3. Nao ha teste.

**Observacao sobre a `TRAVA_MAX` de 10 s:** o vigia de 8 s libera a fila antes; a trava antiga so seria "roubada" se o vigia falhasse. Nao reproduzido (fora do alcance sem falha do proprio Node-RED).

## Fase 3 - Etapa 5 (estresse): achados novos, observacoes e LIMITES DE ARQUITETURA

| ID | Gravidade | Onde | O que acontece (reproduzido) | O que deveria acontecer |
|---|---|---|---|---|
| P3-E1 | Media | `chaves-*`, fila + vigia de 8 s | Com o PLC sem leitura, o 1o comando comum espera o vigia de 8 s (503) e o 2o fica parado ate a leitura voltar (12,1 s no teste) ou ao proprio vigia. O front desiste aos 10 s e o comando ainda executa depois (R9). Teste `todo` em `concorrencia/e5c_estresse_queda_registro.test.js`. | Falha rapida para os comandos da fila quando a leitura esta velha (os de seguranca tentam mesmo assim). |
| P3-E2 | Baixa/Media (cond.) | `registro-ensaio-db2100-api` | Sem janela de confirmacao (so as chaves tem): `limpar` (42 variaveis) com 80 ms por escrita responde 500 e termina depois. Teste `todo`. | Janela de confirmacao como a das chaves. |
| P3-E3 | Observacao | `chaves-595`, janela de 2 s | "Desligar banco" do BC595 escreve 33 variaveis; com ~80 ms por variavel passa de 2 s e responde 504. Depende do tempo real do driver S7. | Medir na bancada e ajustar `CONF_JANELA_MS` da aba. |
| P3-E4 | Observacao | `registro-ensaio v1.8` | Cada chamada leva ~4 s (preenchimento era ~2 s; minha estimativa de ~3 s estava baixa). O front serializa as gravacoes do ensaio (OK); 3 operacoes simultaneas de clientes diferentes chegam a ~12 s (v1.7: ~10 s). | Aceitavel com um cliente; reavaliar se houver dois operadores gravando. |

**Limites de arquitetura (nao resolvidos no Node-RED; dependem de PLC/TI):**
1. **Driver S7 real:** nao sabemos se aplica escritas em serie ou em paralelo, nem o tempo real de escrita (decide P3-A5, P3-E3). Validar na bancada com a TI.
2. **FB101 (TIA):** confirmar que `CbLigar` e zerado com o banco desligado (P3-A3). O intertravamento definitivo deve estar no PLC (cb/sb); o Node-RED so mitiga.
3. **Consumidores do DB2100 (TIA):** confirmar que leem o snapshot **somente** com `preenchValido=TRUE` (P3-B1). Atomicidade total dos dados exigiria mudar o layout do DB (nao feito).
4. **Reafirmacao** limita (nao elimina) o tempo de chave ligada por escrita tardia: uma escrita ja enviada nao pode ser recolhida.
5. **Fila, quarentena e reafirmacao so em memoria** (somem se o Node-RED reiniciar).
6. **PLC simulado:** nao reproduz driver, tempo real do 1515/ET200 nem o Node-RED do PC (versao nao confirmada: D-3).
7. **Guarda de origem nao e login** (D-4) e **DNS rebinding** (D-5): TI.
8. **Itens mantidos de proposito:** F2-1, F4-1, F4-2 e a rota `tensao` (mesmo padrao do P3-A4).
9. `rid`/Idempotency-Key (etapa 4d) **adiado** por decisao: 504 `incerto`, quarentena e reafirmacao cobrem as repeticoes.

## CONGELAMENTO (decisao apos a Etapa 5)
Codigo congelado no commit `51481df`. **P3-E1 e P3-E2 permanecem abertos de proposito** (testes `todo`) ate haver os numeros reais da bancada (checklist `docs/bt2/migracao/CHECKLIST_BANCADA_v0.1.md`, itens 2.4 e 6.1). Proximo passo: validacao de bancada com o roteiro v0.5; so depois reavaliar E1/E2, F2-1, F4-1, F4-2.

## Itens já listados antes (sem mudança nesta fase)

- **Tipo `Remote` em `VAR_INPUT`** nos FBs de comunicação (FB101/FB103): a confirmar no TIA.
- **`EnsaioAtivo` fixo em FALSE** nas chamadas: a tag real ainda não existe no PLC.
- **FB100 v0.4 e FB102 v0.2:** os arquivos existem, mas a decisão de subir ao PLC é sua.
- **Gerador `gerar_banco`:** ainda não gera o FB100 v0.4 nem o FB102 v0.2 (só os FBs do ET200 v0.2).
- **Robô do Operador secreto:** 8 falhas no popup Setup, porque ele não informa o chaveamento (220/380/440 V) antes de selecionar a chave.
- **Cópia do gráfico embutida no medidor:** ainda na v0.10 (a versão separada é a v0.11).
- **FC de chamadas dos bancos:** nomes de instância genéricos no comentário.

## Limites da Fase 1 (o que os testes NÃO provam)
- O PLC é uma **simulação em memória**, não o driver S7 real nem o tempo real do 1515 ou do ET200.
- O **F11** (front real contra o Node-RED local, com Playwright) **ainda não foi feito**: fica para depois dos F1–F10.
- Segurança da senha de testes e rotas sem login são da **Fase 2**, não entram aqui.

## Achados da bancada (06/11/2026) — lições do teste do Setup
- **BANC-1 · Ventilador do banco sem monitoramento** (gravidade alta, só decisão de projeto): no Setup, uma chave foi ligada com o ventilador desligado e não há sinal do ventilador. Levar à reunião: monitoramentos e intertravamentos (ventilador, temperatura, proteção) têm de ser previstos e tratados no PLC 1200 do banco de cargas, não na tela.
- **BANC-2 · Comando sem retorno (CB sem SB) reenergiza sozinho** (gravidade alta, proposta em análise): com o SB bloqueado, o CB ficou em 1; ao liberar o SB, a chave voltou sozinha (partida automática). Proposta do Reginaldo: perdeu o SB, derruba o CB, com tempo de verificação. Falha travada, que só rearma com novo clique. Detalhes na análise de 06/11. Depende de mudança no PLC (backup e OK) e no fluxo.
- **BANC-3 · Chave não aceita mais o clique depois do teste acima** (gravidade média, causa não confirmada): faltam a mensagem da tela, o JSON de `/api/chaves/56` (cb/sb/hab) e o log do momento do clique.
- **BANC-4 · Tabela de potência do HTML mostra duas potências diferentes na mesma linha** (gravidade baixa): o Reginaldo vai enviar o print da tela. Os valores da `TAB60` já conferem com a foto da tabela da empresa.

## Fase 4 / Portao A - estado dos achados nos fluxos (06/11/2026)
- **F4-1, F4-2, P3-E1: corrigidos** em `chaves-56-api-v3.5` e `chaves-400-api-v3.5` (gerador `nodered/gerador/gerar_fluxos_fase4a_v0.1.py`; testes `tests/integracao/fase4/a2_sbret.test.js`, que falham na v3.4). `chaves-550/595` continuam na v1.5 (entram com as Etapas 2 e 3).
- **F2-1: NAO corrigivel no fluxo.** O no `http in` do Node-RED responde 500 fixo a corpo JSON invalido (errorHandler do proprio no). So muda com `httpNodeMiddleware` no `settings.js`, que nao tocamos. Continua `todo`.
- **P3-E2 (registro, `limpar`):** continua aberto (opcional).
- Codigos de ocorrencia: `CHV-006` ja existia (banco sem leitura). A falha de retorno e `CHV-007` e o contator colado `CHV-008` (os documentos da Fase 4 foram corrigidos).

## Revisão universal de HTML (07/11/2026) — itens abertos (desktop 1280×800 e celular Poco X6 Pro; viewport CSS do Poco ainda não confirmado: hipóteses 407×904 e 444×986)
Corrigidos na medidor 1.10.176 / maquete v0.5 / mapa v0.16 / gerenciador v1.8 / api_cards_visor v0.4 / gráfico v0.12 / index v0.3: janela saía da tela ao arrastar (✕ inalcançável), arrasto por toque, faixa de erro vazia por cima de campo, menu Exportar da maquete aberto cobrindo botões, cópia (clipboard) com erro, ícone "i" do mapa com 7 px, Ajuda sem arrastar/sem ✕. Relatórios: `tests/integracao/revisao/resultados/`.
- **REV-1 · Dados do ensaio (PC): campo do catálogo coberto pelo rodapé fixo** (gravidade média, causa não confirmada): só aparece depois de a revisão mexer no tamanho/zoom da janela pelo painel ⤢ (a janela fica com a altura menor que o conteúdo e o rodapé `.jbtns` sobrepõe o último campo). Janela recém-aberta está certa. Teste: `revisao.js --paginas medidor --perfis desktop --demo`.
- **REV-2 · Visor da API (celular): ✕ da Ajuda não fechou em um teste de toque** (gravidade média, não reproduzido isolado): isolado funciona; só falha dentro da sequência da revisão. Teste: `revisao.js --paginas apicards --perfis pocoA`.
- **REV-3 · Balão "ⓘ" do modo (medidor) só fecha com toque fora** (gravidade baixa, UX): enquanto aberto cobre o botão "Alterar"; o primeiro toque fora fecha o balão mas não aciona o botão de baixo.
- **REV-4 · Alvos de toque ainda abaixo de 44 px** (gravidade baixa): botões do cabeçalho do medidor (40 px, não 44) e caixas de marcar (22 px). Decisão de layout (ficaria apertado), não aplicada.
- **REV-5 · Mapa dos FBs no celular**: o desenho é reduzido para caber na largura (texto pequeno). Uma versão com rolagem horizontal pede decisão de layout.
- **REV-6 · (FECHADO em 08/11/2026, medidor 1.10.190 — era defeito do robô, não do card)**: fase Patamar mostrava "Alvo 30 kW" nos chips 50/100/107 % durante o teste sem ensaio iniciado (mostra o mesmo alvo nos 4 chips). Conferir com o Reginaldo se é esperado antes do ensaio.
- Limite honesto do teste: arrasto/toque reais só em Chromium (Playwright); não substitui o Poco real nem o Safari/Firefox.
- **REV-7 · Menu do botão direito (toque longo) no celular** (gravidade baixa, decisão do Reginaldo em 07/11/2026): "não ficou legal e não funciona direito". Não será ajustado agora ("bobagem gastar token"); o Dev/Operador oculto continua cobrindo só o menu de clique direito do PC.

## BKL — IP real ainda no Git (10/11/2026)
Documentos (.md/.scl) foram limpos: IPs viraram [IP_1515], [IP_ET200], [IP_PC_BT2]; usuário do Windows virou [USUARIO_WINDOWS]. **Continuam com IP real, de propósito, por precisarem dele ou serem histórico:**
- `tests/integracao/t0_trava_producao.test.js` (lista de bloqueio dos endereços de produção: sem o IP a trava não funciona).
- `nodered/flows/bt2/cliente-31-*.json`, `chaves-56-api-v2.6.json`, `chaves-400-api-v2.6.json` e outros fluxos antigos (IP dentro da configuração do nó). Regra do projeto: endereço vem de variável do PM2 (`PLC_IP`, `DSE_URL`). Trocar exige fluxo novo e **OK do Reginaldo** (produção).
- `dashboard/src/index.html` e HTML/pacotes antigos (`dashboard/arquivo`, `dashboard/pacotes`, `medidor_gerador_v1.10.1xx`): versões entregues, não alterar. O medidor atual (1.10.191) não tem IP.
- O histórico do Git ainda contém os IPs antigos. Reescrever histórico exige OK explícito.

## Decisões do Reginaldo (10/11/2026) — IP em fluxos antigos e FB100/FB102
- **IP em fluxos antigos (opção A):** 3 fluxos sem uso foram movidos para `nodered/flows/arquivo/` com o IP trocado por `${PLC_IP}`/`${IP_PC_BT2}`: `chaves-56-api-v2.6`, `cliente-156-dse-plc-carga-v1`, `cliente-31-seletor-plc-db52-v2`. **NÃO foram movidos** (geradores e testes ainda os leem como base; mover quebraria a regressão): `chaves-400-api-v2.6` (gerar_banco v0.2/v0.3), `chaves-56/400-api-v3.0`, `chaves-550/595-api-v1.1`, `cliente-156-...-v2`, `cliente-31-...-db2000-v3` (gerar_fluxos_portao2; teste `s1_dse_sem_ip_fixo`). Para tirá-los seria preciso mudar esses geradores/testes (passo próprio). O histórico do Git continua com os IPs.
- **HTML com IP** (`gerenciador_logs` v1.7/v1.8, `grafico_ensaio` v0.11/v0.12, `dashboard/src/index.html`, `medidor` ≤ 1.10.166): pendente, precisa de versão nova sem o IP.
- **FB100 v0.4: SIM** (entra no 1515, entrega 1200 v0.8, pacote da TI v1.2). **FB102 v0.2: NÃO** (só BC59,5, que não existe; fica no repositório).
- **(10/11/2026) HTML sem IP:** gerados `gerenciador_logs_v1.9.html` e `grafico_ensaio_v0.13.html` (gerador `dashboard/gerador/gerar_gerenciador_grafico_sem_ip_v0.1.py`; teste `tests/integracao/fase4/h_paginas_sem_ip.test.js`, falha nas versões antigas). **Pendente:** o `catalogo_ferramentas_v0.7.js` ainda aponta para `gerenciador_logs_v1.8` e `grafico_ensaio_v0.12` (o menu ☰ abre as antigas); trocar exige catálogo v0.8 e medidor novo. Restam com IP: `medidor` ≤ 1.10.166 (versões antigas) e `dashboard/src/index.html`.
- **(10/11/2026) Catálogo v0.8 e medidor 1.10.192 gerados** (`dashboard/gerador/gerar_catalogo_v0.8_e_medidor_v1.10.192_v0.1.py`; teste `fase4/i_catalogo_v08.test.js`, falha no catálogo v0.7/medidor 1.10.190). **Pendente:** `dashboard/ferramentas/index.html` (e `index_v0.2/0.3`) ainda cita `catalogo_ferramentas_v0.7.js` em vários pontos; precisa de versão própria do index. **CPU do banco = 1214FC** (decidido): documentos atualizados; `plc/bt2/plc_carga_1200/` (pacote antigo) ainda diz 1215 FC.
- **(10/11/2026) Front de operação x desenvolvimento (opção A):** pacote da TI v1.3 separa `03_front_operacao` (medidor 1.10.192 + `catalogo_modelos_v0.1.csv`) de `06_front_desenvolvimento`. Achados: (1) o gráfico do "Analisar" é uma cópia EMBUTIDA no medidor (v0.10), então o medidor funciona sozinho; (2) o `catalogo_modelos_v0.1.csv` é dado de operação (o medidor o carrega da mesma pasta) e **faltava** no pacote v1.2; (3) o gráfico embutido (v0.10) é mais antigo que o arquivo `grafico_ensaio_v0.13`: atualizar a cópia embutida exige medidor novo (não feito). Corrigido o `index_v0.6.html` (usa o catálogo v0.8). Teste: `fase4/j_pacote_operacao.test.js` (falha sem o CSV).
- **(10/11/2026) Teste intermitente:** `concorrencia/c2_caracterizacao.test.js` › "a fila NAO fica presa depois de um 504..." (C2 R2/R3/R6 BC56) falhou 1 vez na regressão completa com o medidor 1.10.193 (esperado 200, veio 504) e 1 vez de 4 repetições isoladas; nas outras passou. Ele só exercita o fluxo `chaves-56` com PLC simulado e atraso de escrita, depende do tempo (janela de confirmação de 2 s) e não usa o HTML. Causa não identificada (hipótese: carga de CPU do ambiente). Não foi enfraquecido; investigar em passo próprio. Regressão 1.10.193: 310 testes, 303 passam, 1 intermitente, 6 `todo`.
- **(10/11/2026) Renomeado:** "pacote da TI" → **pacote de implantação** (v1.4, mesmo conteúdo da v1.3). Os textos antigos que dizem "pacote da TI" (BACKLOG, análise de conclusão, handoffs e LEIA-MEs anteriores) ficam como histórico.
- **(10/11/2026) Catálogo x medidor:** o `catalogo_ferramentas_v0.8.js` lista o medidor 1.10.192 e o medidor 1.10.193 carrega esse catálogo; a cada medidor novo o catálogo fica um passo atrás (a entrada "medidor" aponta para a versão anterior). Solução permanente (a decidir): tirar a versão do nome do medidor no catálogo ou gerar o catálogo junto com cada medidor. O pacote v1.5 leva as duas versões do medidor na pasta de desenvolvimento para o link não quebrar.
- **(10/11/2026) Catálogo x medidor: RESOLVIDO.** `catalogo_ferramentas.js` (sem versão) é gerado pela pasta (maior versão de cada ferramenta); medidor 1.10.194 e index v0.7 o carregam; o gerador do pacote v1.6 gera o catálogo com os arquivos do pacote. Teste: `fase4/l_catalogo_auto.test.js` (falha no catálogo v0.8; prova que um medidor novo é escolhido sem mudar medidor/index). Regra para o futuro: ferramenta nova na pasta → rodar `gerar_catalogo_auto_v0.1.py` (ou o gerador do pacote); medidor e index não mudam.
