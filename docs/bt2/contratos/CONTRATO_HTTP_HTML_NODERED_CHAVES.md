# Contrato HTTP HTML <-> Node-RED do card "Chaves do banco de carga" (v2.4 - rotas `/api/...`, 24/10/2026)


> **v2.4 (24/10/2026)** — flows `chaves-56-api-v2.4.json` / `chaves-400-api-v2.4.json` + HTML v1.9.77 + PLC `fb101_ComEt200_v0.4.scl`, `db150_BC56_Chaves_v0.2.db`, `db158_BC400_Chaves_v0.2.db`, ET200 `db38_db39_ComEt200_v0.2.scl` (decisões D1 = 1 bit, D2 = opção A, D3 = padrão cb/sb — ver `PROPOSTA_SINAIS_LIGAR_BANCO_E_SELETORA_v0.2.md`).
> - **(a) Implementado e testado em emulador (nrsim + emulação do FB101; nada em hardware):** variáveis novas no fim do DB150/DB158 — `LigarBanco` = `X460.0` (`cbBanco.ligar`), `SeletoraAuto` = `X462.0` (`sbBanco.seletoraAuto`), `ComEt200Ok` = `X462.1` (`sbBanco.comEt200Ok`). Offsets antigos intactos.
> - **GET `/api/chaves/{banco}`** ganha `bancoLigado:bool`, `comEt200Ok:bool` e `seletora:'auto'|'manual'|null` (`null` = PLC sem comunicação com o ET200). `flow:'chaves-v2.4'`.
> - **POST `/api/chaves/{banco}/banco`** `{ligar:bool}` → `{ok}`. Grava `cbBanco.ligar`. `ligar:true` → **409** se `comEt200Ok` falso ou seletora em Manual; `ligar:false` sempre permitido e também grava `cb.ligar[1..16] = false`. Leitura de volta (450 ms) confere `LigarBanco`; se o PLC zerou (seletora/ComOk) → 500 com o motivo.
> - **`/ligar` (true) e `/selecionar` (índice > 0)** → **409** com o banco desligado.
> - **Vigia "HTML sumiu"** também desliga o banco (`LigarBanco=false`).
> - **Prioridade na fila:** `/banco {ligar:false}` e o job interno do vigia entram na **frente** da fila de gravações (esperam só a gravação em curso).
> - **Ocorrências no HTML:** `COM-005` (`comEt200Ok` falso) e `CHV-005` (banco bloqueado pelo PLC) — `PADRAO_OCORRENCIAS_MENSAGENS_FALHAS.md`.
> - **Regra no PLC (FB101 v0.4):** seletora fora de Auto ou `ComOk` falso → zera `cbBanco.ligar`; banco desligado → zera `cb.ligar[]`. Nada religa sozinho.
> - **ORDEM DE CARGA:** (1) DB150/DB158 v0.2 (snapshot dos valores antes — o download reinicializa o DB); (2) FB101 v0.4 + chamadas; DB38/DB39 v0.2 + FC4 no ET200; (3) flows v2.4. Flow v2.4 com DB sem os membros novos = leitura S7 falha e todas as rotas param.
> - **HTML v1.9.77:** com flow v2.3 (sem `seletora`) a regra continua inativa ("sem sinal"); com v2.4 o chip mostra a seletora física e o botão usa `/banco`.

> **HTML v1.9.74 (23/10/2026) — ordem das chaves e interbloqueio por banco. Nenhuma rota nova, nenhum endereço novo no PLC, nenhum flow alterado.**
> - **(a) Implementado no HTML (testado no emulador/Demo local, nada em hardware):** (1) **ordem física das chaves**, informada pelo operador: a chave 1 é a de **menor** carga e a última a de **maior**. BC56 = 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5 kW; BC400 = 5, 5, 10, 10, 10, 10, 50, 50, 50, 50, 50, 50, 50 kW (antes estava ao contrário). A posição n continua sendo o `indice` (1-based, por banco) das rotas `/api/chaves/{banco}/...` e o bit n−1 de `cb.ligar[]`/`sb.ligada[]`. (2) Em cada banco do card Cargas (`bco`): chip **"Seletora: sem sinal / Auto (remoto) / Manual (local)"** e botão **"Ligar banco"**. Regra do operador: seletora em Auto **e** banco ligado → as chaves respondem; Manual (local) ou banco desligado → chaves apagadas e clique bloqueado com aviso. (3) O card Cargas passou a **nascer aberto**. (4) Tooltips no card.
> - **Trava de compatibilidade:** o interbloqueio só vale quando existe o sinal da seletora (`BKS[banco].sel !== null`). Com PLC real **ainda não há sinal** → chip "sem sinal" e as chaves funcionam como antes (nada é enviado ao PLC pelo chip/botão; eles só avisam). No Demo local o chip alterna sem sinal → Auto → Manual e o botão simula o comando.
> - **(b) Assumido / inferido (confirmar):** "Ligar banco" só **libera** o uso das chaves do banco (não liga nenhuma chave sozinho); ao mudar a seletora ou desligar o banco, a tela solta as chaves simuladas desse banco. A posição "Auto" = remoto e "Manual" = local vem da fala do operador (23/10/2026).
> - **(c) A desenvolver (depende de decisão — ver `claude/PROPOSTA_SINAIS_LIGAR_BANCO_E_SELETORA_v0.1.md`):** sinais `cbLigarBC56`/`cbLigarBC400` (1515 → ET200) e `cbBC56Manual/Auto`/`cbBC400Manual/Auto` (ET200 → 1515) no telegrama; campos novos no `GET /api/chaves/{banco}` e rota de "ligar banco"; intertravamento também no PLC (o do HTML é só conveniência); vigia "HTML sumiu" derrubar o `cbLigarBC`.
> - **Ordem e PLC (ATENÇÃO):** `setup.nominal[]` do DB150 está no arquivo `plc_bancos_cargas/db150_BC56_Chaves.db` na ordem **antiga** (5,5,5,5,5,4,4,4,4,4,4,4,3); o DB158 idem. Para bater com o HTML v1.9.74 os `nominal[]` de DB150/DB158 e o mapeamento do FC4 do ET200 (bit n−1 → contator da chave n) precisam seguir a nova ordem. O que o **navegador** tinha guardado de Setup (kW real simulado) e de Habilitar/Desabilitar foi descartado **uma vez** (eram por posição e vinham do `nominal` antigo). O que já está gravado no **PLC** (`kwReal[]`, `habilitada[]`) é por índice (contator físico) e **não** foi tocado: continua válido enquanto o FC4 não mudar o mapeamento índice → contator. Já o `rTeoricoOhm[]` foi calculado pelo FB100 a partir do `nominal[]` **antigo** (linha 149 do `fb100_setupChaves_v0.2.scl`): salve de novo o Setup das chaves cujo nominal mudou.
> - **Sobre "BC56 acionando BC400":** o HTML manda cada chave ao DB do **seu** banco (DB150 = BC56, DB158 = BC400; conferido nos flows v2.3). Nos prints do ET200 (DB38 `ComBC56`, DB39 `ComBC400`) o cruzamento, se existe, está do lado do FC4/fiação do ET200, não na tela.
> - **Canal × banco físico (24/10/2026):** o *canal* da API (`/api/chaves/56` → DB150 → instância DB155; `/api/chaves/400` → DB158 → DB163) é o que o HTML conhece (confirmado nos flows v2.3). O *banco físico* acionado depende do literal remoto `P#DBxx` do `fb101_ComEt200` por instância e do FC4/fiação no ET200 (DBs `DB38 ComBC56` / `DB39 ComBC400`, ver `PASSO_A_PASSO_PUT_GET_1515_ET200_v4.md`). **(b) Inferido:** a inversão relatada em campo está nessa camada (PLC/ET200), não no HTML nem no Node-RED. **Pendente de confirmação do usuário:** qual canal aponta para qual DB do ET200 após a troca DB38/DB39. O HTML mantém `canal 56 = "Banco de 56 kW"`.

> **v2.3 (22/10/2026 noite)** — flows `chaves-56-api-v2.3.json` e `chaves-400-api-v2.3.json` + HTML v1.9.65. **Nenhuma rota nova, nenhuma variável ou endereço novo.** Mudanças: (1) **vigia "HTML sumiu"**: se nenhum GET/POST chegou ao flow do banco por `WD_HTML_S` s (padrão 30; variável de ambiente da aba), e há `CbLigar` TRUE, e a leitura do PLC tem < 2,5 s, o flow escreve FALSE em `CbLigar1..16` pela fila (job interno `ZERAR`, com releitura e conferência); (2) o `GET` passa a devolver `flow:'chaves-v2.3'` e o campo informativo `wdZerou:{ts,qtd}|null` (último corte do vigia); (3) o log do banco ganha linhas `rota:'ZERAR'`. Detalhes, limites e testes: `claude/PROTECAO_COMANDOS_PERSISTENTES_CB.md`. Os trechos abaixo escritos "v2.2" continuam valendo, exceto o texto do campo `flow`.

> **Nota 22/10/2026:** HTML v1.9.64 usa os mesmos flows v2.2 (sem alteração); a tela mostra "não conectado"/"perdeu a conexão" e o triângulo de Mensagens e falhas.
>
> **v2.2 (22/10/2026)** — flows `claude/nodered/chaves-56-api-v2.2.json` e `chaves-400-api-v2.2.json`; HTML v1.9.63.
> - **GET `/api/chaves/{banco}` agora responde do CACHE da leitura cíclica** (`s7 in`, 200 ms), sem ler o PLC no pedido. Resposta traz `flow:'chaves-v2.2'`, `banco`, `idadeMs` (idade da leitura). Se não há leitura ou ela tem **> 2500 ms** → **HTTP 503** `{ok:false, flow, erro:'PLC sem leitura recente (ha N s) - verifique rede/PLC', idadeMs}`.
> - O campo **`flow`** permite ao HTML detectar flow antigo/duplicado (resposta sem `flow` = v2/v2.1).
> - **Correção BC400:** o GET do BC400 devolvia `"banco":"56"` (valor fixo no nó `confere`); agora `"400"`.
> - **Logs:** `GET /api/logs/{banco}` passou a incluir `flow` e traz os GETs que falharam (no máx. 1 registro por 10 s por banco, para não encher o log com a leitura de 1 s).
> - **Regra de operação:** o HTML **bloqueia comando** (sem chamar o PLC) enquanto o banco estiver "sem leitura" (GET falhando nos últimos 5 s) e mostra o banco apagado com "sem leitura do PLC".
> - **Instalação:** apagar **todas** as abas antigas "Chaves BC56/BC400 (API)" antes de importar (abas duplicadas respondem no lugar da nova).
>
> **v2 (21/10/2026)**: TODAS as rotas começam com `/api/` (ver `claude/PADRAO_ROTAS_API_NODERED.md`) e entrou `POST /api/chaves/{banco}/ligar` (liga/desliga UMA chave, escreve `cb.ligar[n]`).
>
> **FB100 v0.2:** a trava de `CbLigar` é **só por `EnsaioAtivo`** — chaves podem ser operadas com o gerador desligado (decisão do operador, 21/10/2026).
>
> **Terminologia**: estas são **rotas HTTP** (nós `http in`), não "endpoints S7". O *S7 endpoint* é o nó de configuração do PLC (IP/rack/slot + variáveis) usado por `s7 in`/`s7 out` (hoje "PLC da Carga", 172.17.209.135, rack 0, slot 1, ciclo 200 ms).

Modelo: mesmo padrão de `claude/CONTRATO_HTTP_HTML_NODERED_SELECAO.md` (POST só vale com HTTP 2xx e `ok:true`; leitura de volta confirma). Complementa `claude/ESPECIFICACAO_CARD_CHAVES_DB55_FB200.md` e `claude/PLANO_NUMERACAO_BLOCOS_PLC.md`.


## Flow v2.5 + HTML v1.9.78 — Setup por chaveamento 220/380/440 V (25/10/2026) — PROPOSTA, não testada no PLC real
Decisões do usuário (25/10/2026): o chaveamento é **informado pelo HTML/Node-RED** (o PLC não mede); a tensão de referência da identificação em kW (3/4/5 kW…) é **desconhecida e será descoberta na prática** pelo Setup; a resistência das chaves é a mesma nas 3 tensões.
- **POST /api/chaves/{56|400}/tensao** `{tensao:220|380|440}` -> `{ok, tensao, tensaoSel}` (NOVA). Escreve `TensaoSel` (1/2/3) no **DB152 (BC56) / DB160 (BC400)** e confere a releitura (espera 1,5 s). Erros: 400 tensão inválida; 409 chave selecionada no Setup; 503 DB sem leitura recente.
- **GET** ganhou: `tensaoSel` (0 = não informado, 1/2/3 = 220/380/440, `null` = DB por tensão sem leitura), `tensaoV:[220,380,440]`, `porTensao:{"220":{setupOk[16],kwReal[16],rMedidoOhm[16],vMedidaV[16]},"380":{…},"440":{…}}`. Os arrays 1D de sempre (`setupOk`, `kwReal`, `rMedidoOhm`) passam a ser o **espelho do chaveamento ativo** (feito pelo FB100 v0.3); `rTeoricoOhm` vem `null` (não calculado).
- **/salvar** -> 409 se o chaveamento não foi informado; **/limpar** apaga **só o chaveamento ativo** (409 se não informado).
- **Isolamento:** o DB152/DB160 é lido por um **2º `s7 endpoint`** (ciclo 1 s). Se o DB não existir no PLC, só o recurso por tensão fica indisponível (`/tensao`, `/salvar` e `/limpar` respondem 503); as demais rotas continuam. Custo: 1 conexão PG/OP a mais no 1515.
- `flow` nas respostas = `chaves-v2.5`. Com `chaves-v2.4` o HTML deixa o seletor inativo e trabalha como antes.
- Offsets do DB152/DB160 são **ASSUMIDOS** (conferir no TIA): tensaoSel INT 1356; kwReal REAL 6 (48); rMedidoOhm REAL 198 (48); vMedidaV REAL 390 (48); setupOk bits 1350.0 (6 bytes). Ver `plc_bancos_cargas/db152_BC56_SetupPorTensao_v0.2.db`.
- Não lido ainda pelo Node-RED: `setupData` (DTL) por tensão e `baseKw` — a coluna Data da comparação por tensão fica "—".

## Identificador do banco

`{banco}` na URL = `56` ou `400` (nomes definidos pelo usuário em 20/10/2026), mapeando para:
- `56` -> DB150 (`db150_BC56_Chaves`)
- `400` -> DB158 (`db158_BC400_Chaves`)

O HTML v1.9.63 usa o `id` ('56'/'400') de cada banco em **todas** as rotas (tela principal, Setup e Habilitar/Desabilitar). Os dois bancos são lidos a cada 1 s, cada um com o seu estado de erro.

## Rotas

- **GET /api/chaves/{banco}** -> `{flow, banco, habilitada:[16], ligada:[16] (feedback sb.ligada), cbLigar:[16] (comando cb.ligar), setupOk:[16], kwReal:[16], rMedidoOhm:[16], rTeoricoOhm:[16], nominal:[16], chaveSel, usarKwReal, idadeMs, lidoEm}`. Arrays sempre com 16 posições (13 reais + 3 reserva). **503** quando a leitura cíclica está velha/ausente (ver v2.2).
- **POST /api/chaves/{banco}/habilitar** `{indice:1..16, habilitada:bool}` -> `{ok}`. Grava `setup.habilitada[indice]` (ao desabilitar, também derruba `cb.ligar[indice]`). Bloqueado (400) se o gerador estiver ligado (ver `claude/REGRAS_ENSAIO_MANUAL_BT2.md`).
- **POST /api/chaves/{banco}/selecionar** `{indice:0..16}` -> `{ok}`. Grava `setup.chaveSel`. `0` = nenhuma. Bloqueado (400) se `EnsaioAtivo` ou chave `!habilitada[indice]`.
- **POST /api/chaves/{banco}/ligar** `{indice:1..16, ligar:bool}` -> `{ok}`. Grava `cb.ligar[indice]`. `ligar:true` bloqueado (400) se `!habilitada` e (409) se há chave selecionada no Setup; `ligar:false` sempre permitido. Releitura (450 ms) confirma. **`cb.ligar[]` tem 2 escritores**: esta rota e o FB100 (ao mudar `chaveSel`).
- **POST /api/chaves/{banco}/salvar** `{confirmado:true}` -> `{ok}`. Pulso em `setup.salvar` (borda lida pelo FB100). Exige `chaveSel <> 0`; o FB100 decide (precisa de `BaseOK`).
- **POST /api/chaves/{banco}/usarKwReal** `{usar:bool}` -> `{ok}`. Grava `setup.usarKwReal`.
- **POST /api/chaves/{banco}/limpar** `{confirmado:true}` -> `{ok}`. Zera `setupOk[]`, `kwReal[]`, `rMedidoOhm[]`, `rTeoricoOhm[]`, `setupData[]`. Não mexe em `habilitada[]` nem `nominal[]`.
- **POST /api/chaves/{banco}/banco** `{ligar:bool}` -> `{ok}` (v2.4). Grava `cbBanco.ligar`; ver bloco v2.4 no topo.
- **GET /api/logs/{banco}?limit=100** -> `{flow, banco, total, falhas, msMedio, msMax, lidoEm, logs:[{t,rota,dado,status,ok,ms,erro}]}`. Só POSTs e GETs que falharam. `ms` = do pedido até a resposta, já com a releitura. Memória do Node-RED (zera ao reiniciar/Deploy). Rejeições de validação (400/409/503 antes de ir ao PLC) **não** entram.

### Tempos (flow v2.2)
- Escrita: **fila** (uma por vez) → `s7 out` → atraso **450 ms** → releitura → resposta. Vigia (*watchdog*) de **8 s** → 503. Trava da fila: 10 s.
- HTML: POST aborta em **10 s**; GET em **4 s**. Doze POSTs simultâneos levam ≈ 5,4 s no pior caso (< 10 s).

## Regras do HTML
- POST só vale com HTTP 2xx e `ok:true`; a confirmação definitiva é a leitura seguinte.
- `indice` é 1-based = posição no array `chaves` de `BANCOS[banco]` (mesma ordem do DB).
- Tela principal lê `ligada[]` por polling próprio (1 s), independente da telemetria do DSE (`/api/gerador`).
- Comando em banco sem leitura recente é **bloqueado na tela** com mensagem (não enfileira no Node-RED).
- Janela de Logs avisa: (a) resposta sem `flow` = flow antigo; (b) tela enviou comandos e o log tem `total = 0` = aba duplicada/antiga (ou Deploy depois dos comandos).

## Pendências
1. **Heartbeat do PLC** (bolinha PLC real) — depende do DB de batimento; proposta em `claude/ESPECIFICACAO_DB58_MODO_HEARTBEAT.md` (aguardando OK).
2. **Expor `comOk` PLC↔ET200** (DB151 "status do banco", ainda "a definir") ao Node-RED → flow v2.3 (ver `claude/PASSO_A_PASSO_PUT_GET_1515_ET200_v2.md`).
3. `BaseKW`/`BaseOK` do FB100 não são expostos em nenhum DB (decidir se ficam internos).
4. `EnsaioAtivo` fixo FALSE até existir o DB "Dados do ensaio" (`ESPECIFICACAO_CARD_CHAVES_DB55_FB200.md`).
5. ~~Migrar `/ensaio/*` para `/api/ensaio/*`~~ — **feito em 22/10/2026** (flow `registro-ensaio-db53-api-v1.4.json` + HTML v1.9.64; ver `claude/CONTRATO_HTTP_HTML_NODERED_REGISTRO_ENSAIO.md`).
6. Falhas de comando (POST) e de leitura viram ocorrências `CHV-001`, `CHV-002`, `COM-001`, `COM-002` no HTML v1.9.64 (`claude/PADRAO_OCORRENCIAS_MENSAGENS_FALHAS.md`). Os flows v2.2 **não** mudaram.

## HTML v1.9.67 — "Usar o PLC real durante o Demo" exige PLC confirmado (23/10/2026)
- A opção só fica marcável depois que uma sonda própria confirma `GET /api/chaves/{56|400}` respondendo com `habilitada` no corpo — não basta estar no Demo nem ter a URL preenchida. Sem o PLC confirmado o campo some desabilitado, com aviso. A sonda roda a cada ~3 s só durante o Demo local (fora dele o PLC já é lido por outro caminho) e para assim que entra em Demo + PLC. Trocar a URL invalida a confirmação na hora (não espera os 8 s de validade). É opção só para o desenvolvedor (atrás da senha do botão Demo).

## HTML v1.9.66 — fonte e URL das chaves (23/10/2026)
- **Sem opção de fonte.** Fora do Demo as chaves vão **sempre** ao Node-RED real (`/api/chaves/{56|400}`). Dentro do Demo: **Demo local** = só na tela (nenhuma chamada a `/api/chaves`); **Demo + PLC** = chama o Node-RED real (confirmação ao ligar; ocorrência `CHV-003` enquanto durar).
- **Uma só URL** (botão **Demo** › **Servidor**), compartilhada com `/api/ensaio/*`; sem URL salva vale o mesmo endereço da página (http/https). A chave `medidor.chUrl` antiga é migrada para `medidor.srvUrl` na 1ª abertura; `medidor.chFonte`/`medidor.ensFonte` antigas são ignoradas.
- **Condição segura a cada troca de modo** (inclui o desligamento automático do Demo quando um DSE real responde): janelas fechadas; chave do Setup desmarcada (`POST /selecionar {indice:0}` no banco); e **`POST /ligar {indice:n, ligar:false}` para cada chave que a tela conhece como comandada (`cbLigar` TRUE da última leitura)**. Ao *entrar* em modo com PLC o desligamento é feito logo após a 1ª leitura de cada banco. Não há rota HTTP de "zerar tudo": o job `ZERAR` do vigia (flow v2.3) continua interno.
- Limite conhecido: o desligamento depende de a tela ter lido o `cbLigar`; o que a tela não leu (ou o Node-RED/PLC fora do ar na troca) fica para o vigia (≈ 30 s sem GET) — ver `claude/PROTECAO_COMANDOS_PERSISTENTES_CB.md`.
