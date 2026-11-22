# Passagem de sessão: tudo o que foi feito no código (RNC e visibilidade dos bancos) — v0.1 (15/11/2026)

Documento **autossuficiente** para uma sessão nova. Branch: `ccr-69b3bd0c-yhr48g` (repositório `digiaibrain-ia/bt-gerador`), 20 commits desde a base `3259fe4`, **sem PR**. Último commit na hora da escrita: `fa27ccb`.
Documentos irmãos (leia depois deste, se precisar de detalhe): `RNC_RETRABALHO_v0.2.md` (contrato e instalação) · `RELATORIO_PILOTO_RNC_v0.1.md` (relatório) · `REVISAO_CODIGO_RNC_v0.1.md` (revisão de código) · `RNC_CHECKLIST_BANCADA_v0.2.md` + `RNC_LEIA-ME_BANCADA_v0.2.md` (bancada) · `BANCOS_VISIVEIS_v0.1.md` · `PLANO_JUNTADA_RNC_BT2_v0.1.md` (juntada com a sessão BT2).

## 0. Leia primeiro (resumo em 12 linhas)
1. **O que é o RNC:** controle de **qualidade e retrabalho do produto (o gerador)**, por **número de série** (RNC = Registro de Não Conformidade). **Não é manutenção de máquina (CMMS).** Fluxo: operador aponta o defeito no ensaio → gerador **bloqueado** para expedição → outro operador repara e registra → **reteste** do mesmo número de série → só então **liberado**.
2. **Só informativo:** nada comanda PLC, chave ou DSE. **Piloto sem SQL:** dados em arquivo `rnc.jsonl` (um evento por linha), gravado **só pelo Node-RED**, estruturado como tabela para o SQL entrar depois.
3. **Peças:** 1 fluxo Node-RED novo (`/api/rnc/*`, separado das chaves) + 2 telas HTML (Registro, Reparo) + botão "⚠ Registrar defeito" no medidor + fase de teste no robô "Dev/Operador oculto".
4. **Visibilidade dos bancos (v1.10.205):** o card "Banco de Cargas" passa a mostrar **só os bancos marcados** em "Detalhes do Patamar". **Ajuste só visual**, nada de lógica.
5. **Estado:** tudo provado **só em simulado** (testes automáticos, Node-RED 4 real, navegador, robô no Demo). **Nenhum teste de bancada foi feito** (PC BT2, DSE real, rede, operadores). Nada foi instalado no PC BT2.
6. **Medidor corrente desta branch: v1.10.205** (parte da v1.10.201 da sessão BT2). **Premissa NÃO confirmada:** que a v1.10.201 é a versão em uso no PC BT2.
7. **Regras do projeto (CLAUDE.md da branch BT2):** nunca alterar PC BT2/PLC/DSE a partir do repositório ou da sessão; backup + OK explícito do Reginaldo antes de mexer em produção; **mudança vai para versão nova (nunca sobrescrever)**; gerar por script; teste que falha vira `todo` com ID e gravidade (não apagar nem enfraquecer); achado fora do escopo vai para `BACKLOG_FORA_DE_ESCOPO.md` (arquivo da branch BT2); **relatório honesto** (dizer o que foi provado e o que depende da bancada/TI); respostas curtas em português; sem IP real/senha/token no Git. **Esses arquivos (CLAUDE.md, BACKLOG) estão na branch `ccr-4f9e06b7-bw4qef`, não na `main` nem aqui.**

## 1. Decisões do Reginaldo e premissas (histórico)
| Ponto | Situação |
|---|---|
| Escopo enxuto ("hoje não existe controle nenhum; algo simples e funcional") | **Decidido** pelo Reginaldo: plano v0.4 mínimo (4 estados, poucos campos); extras só com o uso |
| Reparo na mesma rede do PC BT2 | Dito ("estão na mesma rede"); **não testado** |
| Formato do nº de série | Exemplo `M9MGD26060019SDFWA01715` (23 car.). **Assumido** `^[A-Z0-9]{15,30}$` (`RNC_SERIAL_REGEX`); **confirmar** |
| Foto opcional · Reparo na operação · aviso do medidor só informativo · piloto no BT2 com campo `banco` · uma série pode ter várias RNCs · reteste sempre obrigatório | **Premissas do plano**, aceitas ("siga com as suas sugestões") |
| Quem libera | **Em aberto** (hoje = quem registra o reteste aprovado, nome digitado, sem login) |
| Teste real "agora não é possível" | **Decisão do Reginaldo:** testar no **Demo com o Dev/Operador oculto** |
| Falha simulada para o RNC | Escolhida: **alternador de carga** (não o alternador do gerador WEG) |
| Bancos | "Só uma sugestão, **não pode danificar o que já está pronto**, a ideia era melhorar o visual" → só visual |
| FB ordenador de cargas | **Só sugestão** (não implementada, PLC intacto): ordem **intercalada**, 32 posições/banco |
Consultadas 3 IAs (Perplexity, Gemini, ChatGPT) sobre o desenho; convergiram (Node-RED + JSONL como log de eventos, `rev` no servidor, reteste obrigatório, liberar só com todas as RNCs encerradas). Não adotado: "JSONL schema-less basta" e "gravação atômica só pelo JSONL" (a segurança vem do Node-RED como único escritor, **testado**).

## 2. Arquitetura do RNC (visão geral)
```
 Registro.html ─┐                      ┌─ rnc.jsonl  (eventos imutáveis, só cresce)
 Reparo.html  ──┼─ HTTP /api/rnc/* ──► Node-RED (aba "RNC · Qualidade e retrabalho (API) v1.1")
 Medidor (botão)┘                      ├─ fotos/<rnc_id>/<n>.jpg|png|webp   (≤ 3 MB)
                                       └─ backup/rnc-AAAA-MM-DD.jsonl         (00:05, guarda 30)
```
- **Node-RED é o ÚNICO escritor.** Tudo (ler cache → validar → gravar → atualizar cache) roda **síncrono** numa chamada do nó function, então pedidos simultâneos não se misturam. Gravação = `open(append)` + `write` + `fsync`; **só depois** o HTML mostra "Salvo".
- Pasta de dados: variável `RNC_DIR` (PM2); sem ela `./rnc-dados`. Opcionais: `RNC_SERIAL_REGEX`, `RNC_BANCOS` (padrão `BT1,BT2`). Requer `functionExternalModules` ligado (usa `fs`/`path` no nó function).
- Fluxo **gerado por script** a partir dos mesmos arquivos que os testes provam (nada digitado duas vezes).

## 3. Código do Node-RED (`nodered/gerador/`)
### 3.1 `rnc/rnc_core_v1.1.js` — regras puras (205 linhas; sem I/O)
Funções exportadas: `normalizaSerie`, `reconstruir(eventos)`, `situacaoSerie(rncs, serial)`, `processar(eventos, req, agora, cfg)`, constantes `CFG_PADRAO`, `ESTADOS`, `TRANSICOES`, `SCHEMA_VERSION=1`.
- **Estados da RNC:** `ABERTA → EM_REPARO → AGUARDANDO_RETESTE → LIBERADO`; reteste REPROVADO volta a `EM_REPARO`.
- **Situação do gerador (série):** `BLOQUEADO` se **qualquer** RNC dela não estiver `LIBERADO`; `LIBERADO` só quando todas estiverem; `SEM_RNC` se nunca teve.
- **Evento (uma linha do JSONL):** `{event_id:"EVT-000001", rnc_id:"RNC-AAAA-0001", serial, event, timestamp(ISO UTC), actor, rev, schema_version:1, banco, idem?, data:{…}}`.
- **Eventos:** `RNC_ABERTA` (data: modelo, tipo_nc, descricao, ensaio_id?, **contexto?**) · `REPARO_INICIADO` · `REPARO_REGISTRADO` (data: acao obrigatória, peca opcional) · `RETESTE_REGISTRADO` (data: resultado APROVADO|REPROVADO, ensaio_id?) · `FOTO_ANEXADA` (data: foto_ref, bytes; **não** incrementa `rev`).
- **`processar`** devolve `{status, body, evento}`; se `evento != null` o chamador **deve gravá-lo**. Ações: `abrir`, `evento`, `foto`.
- **Travas:** `rev_esperado` ≠ `rev` atual → **409** (com `rev_atual` e a RNC); transição fora da tabela → **422**; campos inválidos → **400** (série fora do regex, banco ∉ `bancos`, `tipo_nc` ∉ {DEFEITO, ERRO_MONTAGEM, FALHA_ENSAIO, OUTRO}, descrição < 5 ou > 1000, ator vazio, modelo vazio/>60, ação < 3, resultado inválido); RNC inexistente → 404.
- **IDs:** `rnc_id = RNC-<ano UTC>-<n 4 dígitos>` (n = RNCs já abertas naquele ano + 1); `event_id = EVT-<n 6 dígitos>` (n = eventos + 1).
- **Idempotência:** se `idempotency_key` já existe em algum evento (`idem`), devolve **200** `{repetido:true, rnc}` sem gravar.
- **v1.1 (contexto):** `RNC_ABERTA` aceita `contexto` (objeto, ≤ **8000** car. JSON, senão 400); vai em `data.contexto`; é só informativo e não muda regra. `reconstruir` o devolve na RNC (`contexto` ou `null`).
- Eventos órfãos (arquivo editado à mão) são ignorados, não quebram.

### 3.2 `rnc/rnc_io_v1.1.js` — gravação (113 linhas; idêntico à v1.0 em lógica)
`criarArmazem({fs, path, core, dir, cfg})` → `{executar, executarFoto, lerFoto, listar, backup, saude, carregar, dir}`.
- **Cache em memória** dos eventos; recarrega do disco se o **tamanho do arquivo mudou** (ex.: backup restaurado). Linha quebrada é contada em `linhasIgnoradas` e ignorada.
- `executarFoto`: tipos `image/jpeg|png|webp`, **415** outro tipo, **413** > 3 MB, 404 sem RNC; grava o arquivo (fsync) **antes** do evento.
- `lerFoto`: só serve foto **referenciada num evento** (impede ler caminho arbitrário).
- `backup(agora)`: copia `rnc.jsonl` para `backup/rnc-AAAA-MM-DD.jsonl` e mantém os 30 mais novos.
- `saude()`: `{ok, arquivo, eventos, linhasIgnoradas, ultimoEvento, serialRegex}`.

### 3.3 `gerar_rnc_v1.1.js` → `nodered/flows/rnc-api-v1.1.json` (15 nós)
- **Aba `rnc_tab`** "RNC · Qualidade e retrabalho (API) v1.1"; **separada das abas de chaves**; sem nós s7/modbus.
- **7 rotas `http in` → 1 nó function** (`rnc_fn`, com core e io **embutidos** como módulos, libs `fs`/`path`). Roteamento por `req.method + ' ' + req.route.path`. **Catch** → HTTP 500 JSON (a requisição não fica pendurada). **Inject cron 00:05** → backup.
- **Rotas:** `POST /api/rnc/abrir` (201) · `POST /api/rnc/evento` (`rnc_id, rev_esperado, event, data, actor`) · `GET /api/rnc?serial=&estado=&encerradas=&limit=` · `GET /api/rnc/serie/:serial` (`{situacao,total,pendentes,rncs}`) · `POST /api/rnc/foto/:rnc_id?actor=` (corpo = imagem; Node-RED entrega como Buffer) · `GET /api/rnc/foto/:rnc_id/:nome` · `GET /api/rnc/saude`. Respostas levam `flow:"rnc-v1.1"`.
- **Pegadinha de `GET /api/rnc`:** por padrão **exclui** as `LIBERADO`; `encerradas=1` **ou** `encerradas=todas` incluem todas; `estado=` filtra; ordena por `atualizado_em` decrescente; `limit` padrão 200, máx. 1000.
- **v1.0 foi mantida** (`rnc-api-v1.0.json`, `rnc_core/io_v1.0`): **importar só uma** (mesmas rotas).

## 4. Telas HTML (`dashboard/ferramentas/`)
Todas falam só com `/api/rnc/*`; nada de RNC fica no navegador (só o **nome** de quem digita e, no medidor, o banco, em `localStorage` por conveniência). Servidor: mesma origem do Node-RED (pasta `public`) ou campo "Servidor"/`?srv=`.
- **`rnc_registro_v0.2.html`** (v0.1 mantida): formulário curto (série, modelo, banco, tipo, descrição, foto opcional, nome). Série normalizada (maiúscula, sem espaços); aviso se a série já tem RNC; foto reduzida no navegador (canvas, lado máx. 1280 px, JPEG 0,72) e enviada **depois** de salvar a RNC (se a foto falhar, a RNC já está salva e a tela avisa). **"Salvo" só depois do servidor confirmar**; falha mantém o formulário. **v0.2:** a chave de idempotência passa a valer **só para o mesmo conteúdo** (série|modelo|banco|tipo|descrição); antes, depois de uma resposta perdida, registrar OUTRO defeito reaproveitava a chave e o servidor devolvia a RNC antiga (tela mostrava "Salvo" sem gravar).
- **`rnc_reparo_v0.3.html`** (v0.1 e v0.2 mantidas): kanban de 4 colunas (Aberta/bloqueada, Em reparo, Aguardando reteste, Liberado [20 mais recentes]); detalhe com o apontado, fotos, reparos, retestes, histórico e **Contexto do ensaio**; ações por estado (Assumir reparo; Registrar reparo [ação obrigatória, peça opcional]; Reteste Aprovado/Reprovado com `confirm`). Cada ação envia `rev_esperado`; 409 → fecha o detalhe, avisa e atualiza. Atualiza a cada 15 s **só com o detalhe fechado**. **v0.3:** (a) a mensagem "NÃO foi salvo" não some mais ao atualizar a tela; (b) lista = **pendentes completas** (`/api/rnc?limit=1000`) + **liberadas recentes** (`/api/rnc?estado=LIBERADO&encerradas=1&limit=50`), para o aviso "gerador segue BLOQUEADO" e os totais nunca dependerem de um corte único.

## 5. Medidor: botão "Registrar defeito" (módulo `dashboard/modulos-fonte/rnc_defeito_v0.3.js`)
Colado **inline** no medidor, num `<script>` próprio **depois** do bloco do `modo_operador` e **antes** do `janelas_v0.3.js`. Usa variáveis globais do medidor: `$`, `T`, `ETAPAS`, `MODO`, `DADOS`, `DADOS_MODELO` (window), `GEN`, `VERSAO`, `SNAP`, `carga`, `dadoOk`, `find`, `findKey`, `srvBase()`, `window.__ultimoDado`.
- **UI:** botão `#bRnc` ("⚠ Registrar defeito") inserido após `#bDados`; etiqueta `#pRncAv` ("RNC: BLOQUEADO (n)") antes de `#pModelo`; janela `#dlgRnc` (`<dialog class="jan">`, tem **Esc** próprio porque o `JANELAS` do medidor intercepta `showModal` e o Esc nativo **não** fecha); faixa de aviso `#rncFaixa` no **rodapé**.
- **`captura()` — o "contexto" anexado** (fotografia só leitura da tela, sem PLC/DSE): `{origem:'medidor', versao_medidor, demo, tipo_ensaio, momento(ISO), modelo:{dse, dse_texto, gerador:{arquivo,kVA,V,Hz,kW}}, ensaio:{iniciado,rodando,fim,etapa,etapa_nome,alvo_pct,decorrido_s,estavel_s,etapas_salvas}, grandezas:{…23 grandezas numéricas…, cargaPct}, alarmes:{temAlarme,aviso,desligamento,tripEletrico,lista:[{nome,nivel}]}, gerador_estado, leitura_valida}`. Grandezas lidas de `__ultimoDado` com `find` (tensões, correntes, kw/kva/kvar/fp, rpm, tempAgua/tempOleo, pressão do óleo, bateria, alternador, combustível, horas).
- **Envio:** `POST {srvBase()}/api/rnc/abrir` com `contexto` e `idempotency_key`. **Demo ligado** → descrição ganha prefixo `[DEMO]` e `contexto.demo=true`. Série pré-preenchida de `#dServ`/`DADOS.serie`.
- **Aviso informativo (nunca bloqueia o ensaio):** `vigia()` a cada 2 s detecta início do ensaio, troca de etapa e troca de série e chama `consulta()` (`GET /api/rnc/serie/:serial`); renovação a cada 30 s. **v0.3:** a consulta que falha **não** repete a cada 2 s (marca a série como já tentada) — antes, com servidor fora do ar ou rota ausente, **todo medidor** consultava a cada 2 s sem parar.
- **v0.3:** chave de idempotência por conteúdo (mesma correção do Registro). **API exposta:** `window.RNC_DEFEITO = {abre, captura, consulta, pausa}`; `pausa(true)` pausa o vigia (usado pelo robô).
- Versões do módulo: v0.1 (medidor 135), v0.2 (202/203), **v0.3 (204/205)**.

## 6. Robô "Dev/Operador oculto": fase RNC + falha simulada do alternador
O Dev/Operador oculto (antes "Operador secreto") é um robô de teste **dentro do medidor** (`window.opSecreto`: `rodar`, `md`, `contagem`…; só com a senha do Demo, **nunca roda no modo REAL**). Foi estendido na **v1.10.203** (e ajustado na 204):
- **`modulos-fonte/robo_fase_rnc_v0.4.js`** define `faseRncDurante()`, colada **dentro do módulo do robô**, logo antes de `async function rodar`. É chamada no loop de etapas do `faseEnsaio` quando `et===2` (etapa de 50 %), **antes** de salvar a etapa (variável `rncFeito`).
- **Segurança (trava dura):** a fase só grava se `GET /api/rnc/saude` mostrar pasta de dados com **"teste" no nome**; sem servidor, sem fluxo RNC ou pasta real → fase **pulada com AVISO** (não é falha).
- **Falha simulada do ALTERNADOR DE CARGA** (`SIM_FALHA_ALT`, só no Demo, **só o robô arma**, sem checkbox na tela): no simulador do Demo (`demoExtras`) → `alternador` 0 V (normal 28 V), `bateria` 24,8 V (normal 28,3), alarme `{nome:'Falha de carga do alternador', nivel:'aviso'}` com `temAlarme/alarmeAviso` verdadeiros. Desarmada no `finally`. (Três pontos de inserção no medidor: declaração junto de `SIM_FALHA_MOTOR`; `demoExtras`; expressão de `bateria`.)
- **Exceção na caixa de areia do robô:** a caixa de areia (`SB`, `sandboxLiga`) substitui `window.fetch` e **bloqueia todo envio que não seja GET/HEAD**. Foi aberta **uma** exceção: `POST /api/rnc/abrir`, só com `SB.rncPermite===true` (ligado pela fase só **depois** de confirmar pasta de teste e desligado no `finally`).
- **O que a fase confere (≈20 itens):** botão visível; falha do alternador aparece nos dados do DSE simulado; contexto com etapa/hora, ≥ 6 grandezas e kW > 0, modelo do DSE, alarmes, marca Demo e a falha do alternador; janela abre preenchida; sem descrição recusa e não grava; "Salvo" só após o servidor; **leitura de volta do servidor** (série BLOQUEADA, `[DEMO]`, contexto da etapa 3 com alternador 0 V + alarme); etiqueta/faixa aparecem e somem para série limpa (com o vigia **pausado**); o ensaio continua rodando; falha desarmada ao fim. Série de teste `OPSECRETO<AAAAMMDDHHMMSS>` (23 car.).
- v0.4 do fragmento: fecha a janela em qualquer saída; lê a etapa de referência **depois** da espera da falha; pausa o vigia.
- **Resultado (Demo, Node-RED 4 real, pasta de teste):** **186 OK · 8 FALHA · 1 AVISO**, 0 erro de JavaScript; fase RNC sem falha. **As 8 FALHAS são do Setup e NÃO são do RNC** (ver §10, `SETUP-ROBO-01`).

## 7. Visibilidade dos bancos de carga (v1.10.205) — `modulos-fonte/bancos_visiveis_v0.1.js` (67 linhas)
**Pedido:** mostrar no card "Banco de Cargas" só os bancos selecionados nos checks de "Detalhes do Patamar". **Só visual.**
- Colado inline (antes do `janelas_v0.3.js`). Usa só `window.bancoUsado(id)` (que lê `G.usa[id]`, a seleção de Detalhes; o módulo **não altera** a seleção).
- **Como:** adiciona a classe `bk-oculto` (`#bancos details.bk.bk-oculto{display:none}`) ao `<details class="bk" data-bk="id">`; o HTML do banco continua no lugar (robô, Setup, rotas e `drawBanco` não mudam). Reavalia: `MutationObserver` em `#bancos`, evento `change` dos checks (`input[data-gd="u"]`) e `setInterval` de 500 ms.
- **Regra de segurança:** banco desmarcado **reaparece** se tiver `.tile.s1` (chave ligada), `.tile.cmd` (comando pendente) ou `.tile.unk` (leitura perdida), e volta a ocultar ao soltar. **"Ligar banco" ativo NÃO conta** (só libera o comando das chaves; no Demo os 4 bancos têm `lig=true`, então se contasse nada sumiria — erro da 1ª versão da regra, corrigido antes de entregar).
- **UI:** botão `#bBkTodos` ("👁 n/N"; "👁 Todos") após o `<h2>` do card (`#bco .hrow h2`); estado em `localStorage 'medidor.bancosTodos'`; sem nenhum banco visível aparece `#bkNenhum` com instrução. Se o módulo falhar, o card fica como era.
- **Substitui** a decisão da v1.10.153 ("não selecionado = subcard FECHADO, continua visível").
- **Provas (Demo):** padrão 2/4 (BC56, BC400 selecionados); marcar/desmarcar mostra/oculta em ≤ 0,7 s; regra s1/cmd/unk; chave ligada de verdade no simulador (`SIM.ch[idx]=true`, BC550) → reaparece ("👁 3/4") e volta a ocultar; "Todos" lembrado ao recarregar; aviso sem nenhum selecionado; **robô na 205 = 186 OK · 8 FALHA · 1 AVISO, idêntico ao da 204** (nenhum item mudou). Imagem: `img_bancos_visiveis_v1.10.205.png`.
- **Não provado:** DSE/PLC real e o medidor no PC BT2.

## 8. Cadeia de versões do medidor (cada uma gerada por script a partir da anterior; nada sobrescrito, **exceto a 203 durante a validação**)
| Versão | Base | O que acrescenta | Gerador | Módulos |
|---|---|---|---|---|
| **1.10.135** | 1.10.134 (base antiga da `main`) | Botão RNC (1ª versão) | *(snippet inline, não salvo como script)* | `rnc_defeito_v0.1` |
| **1.10.202** | **1.10.201** (BT2) | Botão RNC portado | *(snippet inline, não salvo como script)* | `rnc_defeito_v0.2` |
| **1.10.203** | 202 | Fase RNC no robô + falha simulada do alternador + exceção na caixa de areia | `gerar_medidor_v1.10.203_v0.3.py` (v0.1 e v0.2 são tentativas anteriores) | `rnc_defeito_v0.2`, `robo_fase_rnc_v0.3` |
| **1.10.204** | 203 | Correções da revisão de código | `gerar_medidor_v1.10.204_v0.1.py` | `rnc_defeito_v0.3`, `robo_fase_rnc_v0.4` |
| **1.10.205** | 204 | Bancos selecionados | `gerar_medidor_v1.10.205_v0.1.py` | `bancos_visiveis_v0.1` |
Cada gerador lê a versão anterior e **recusa** (assert) se a âncora de texto não for encontrada exatamente uma vez. Cada versão traz entrada no `HISTORICO` e atualiza `<meta app-version>` e `VERSAO`/`VERSAO_DATA`. **Atenção:** a 203 foi regerada 3 vezes durante a validação (commits `24d3c8c`, `4e535cb`, `aa92e4c`, todos **antes** de qualquer pacote); o pacote de bancada **v0.2** já levou a 203 **final**. O pacote **v0.3** a substitui (medidor 204, com as correções da revisão): use o v0.3.
Os arquivos de módulo antigos (`rnc_defeito_v0.1/0.2`, `robo_fase_rnc_v0.1/0.2/0.3`) ficam no repositório como histórico.

## 9. Testes e como rodar
- **Automáticos (22):** `node --test tests/rnc_core.test.js tests/rnc_core_v1.1.test.js` (regras e gravação: ciclo completo com reprovação, `rev` 409, transições, validações, várias RNCs/série, idempotência, 1000 gravações seguidas, linha quebrada, foto, backup 30, contexto). Use `tests/*.test.js` (o diretório sozinho falha no Node 22).
- **Conferência de bancada (script):** `node tests/rnc_teste_bancada_v0.2.js http://<servidor>:1880` → 18 conferências (T01, T03–T13, T18, parte do T21). **Só roda em pasta de dados com "teste" no nome e vazia**; sem servidor mostra o resumo (v0.2 corrigiu o erro `fim`/TDZ da v0.1; T13b confere numeração 1..N sem buraco).
- **Ambiente que usei para provar (reproduzível):** `npm i node-red@4` numa pasta de teste; `settings.js` com `uiPort:1893, functionExternalModules:true, credentialSecret:false, httpNodeCors:{origin:'*'}`; `flows.json` = `rnc-api-v1.1.json`; `RNC_DIR=<pasta com "teste" no nome>`; arquivos estáticos do medidor por `python3 -m http.server`; navegador via Playwright (já instalado). Para o medidor falar com o servidor: `localStorage['medidor.srvUrl']='http://localhost:1893'`.
- **Robô:** no Playwright: abrir o medidor, ligar o Demo (`#demo` + `#go`), `testeDesbloqueado=true` (variável global `let`; **a senha do Demo não está em lugar nenhum do Git/pacote**), `await opSecreto.rodar({})` (~160 s), `opSecreto.md()` para o relatório.
- **Pegadinhas de teste:** `T`, `carga`, `BKS`, `SIM` etc. são `let/const` globais do medidor, **não** propriedades de `window` (use o nome direto em `evaluate`); `drawBanco` **reescreve as classes dos tiles a cada segundo**, então classes adicionadas à mão somem (use `BANCOS_VISIVEIS.aplica()` na hora ou `SIM.ch[i]=true`); o `JANELAS` do medidor transforma `showModal` em janela flutuante (Esc não fecha sozinho).

## 10. Achados, pendências e riscos
**Revisão de código (10 achados → 9 confirmados e corrigidos, 1 rejeitado)** — detalhes e provas em `REVISAO_CODIGO_RNC_v0.1.md`: (1) fase do robô deixava a janela aberta; (2) script de bancada escondia o resumo com servidor fora do ar; (3) **consulta repetida a cada 2 s** sem servidor; (4) robô competia com o vigia; (5) etapa de referência lida cedo; (6) Reparo perdia a mensagem de erro; (7) corte fixo de 1000 RNCs; (8) T13b não checava buraco; (9) **chave de idempotência reaproveitada** para outro defeito; (10, rejeitado) "Esc é redundante" — no medidor o Esc **não** fechava sem o handler.
**Fora do escopo (levar ao `BACKLOG_FORA_DE_ESCOPO.md` da BT2):**
- **`SETUP-ROBO-01` (média):** as 8 FALHAS do robô na fase Setup (BC56, BC400, BC59,5, BC550: "o popup explica o motivo (LOCAL)" e "chX ch1 fica selecionada para calibrar"; mensagem vista: "Informe o chaveamento do banco (220 / 380 / 440 V) antes de selecionar uma chave"). **Anteriores ao RNC:** reproduzidas na v1.10.202 sem a fase RNC (166 OK · 8 FALHA); o relatório antigo (`docs/OperadorSecreto.txt`, v1.9.78) já tinha 4 do mesmo tipo. Hipótese **não provada**: o robô não informa o chaveamento que o Setup passou a exigir.
- "Falhas 2" apareceu uma vez no cabeçalho num teste e não se repetiu em 3 reexecuções (conferir na bancada).
- A dica do botão ☰ do operador ainda diz "Medidor, Gráfico do ensaio" (texto fixo do `menu_dev_v0.3.js`, não alterado).
- Se houver outro catálogo gerado que não liste as telas RNC (ver §11).
**Riscos/limites:** o software **não impede a expedição física** (precisa de etiqueta BLOQUEADO + conferência na expedição); autoria sem login; relógio do PC define data/hora; backup só vale se copiado para fora do PC; o piloto **não garante** conformidade ISO 9001.
**Não provado (depende da bancada/TI):** leitura de **DSE real** pelo botão; PC BT2 (versão do Node-RED, `RNC_DIR`, permissões, antivírus, relógio); rede entre PC de registro e de reparo; reinício real do PM2, queda de rede real, backup externo, uso por dois operadores; que a v1.10.201 é a versão em uso.
**Decisões em aberto:** formato real do nº de série; **quem libera**; backup externo (quem/onde); versão do medidor no PC BT2.

## 11. Menu ☰, pacotes de bancada e juntada
- **Menu ☰ do operador:** `catalogo_ferramentas_v0.9.js` (base: v0.8 da BT2 + "RNC · Registro de defeito" e "RNC · Reparo" no grupo **Operação**) + `dashboard/gerador/gerar_catalogo_auto_v0.3.py` (gerador v0.2 da BT2 apontando para a base v0.9, **9** ferramentas). O `catalogo_ferramentas.js` (nome sem versão) é **gerado** a partir da maior versão de cada arquivo da pasta; **não se edita à mão**. Provado em navegador (operador lista 4 itens; dev lista todos).
- **Pacote de bancada** (`.zip`, **não versionado no Git**; regenerar): `python3 dashboard/gerador/gerar_pacote_rnc_bancada_v0.3.py <saida>` → `rnc-bancada-v0.3.zip` (fluxo v1.1, Registro v0.2, Reparo v0.3, medidor 204, script v0.2, roteiro v0.2, LEIA-ME, revisão, contrato, `SHA256SUMS.txt`). Antes: v0.1 (medidor 202) e v0.2 (medidor 203). O PC BT2 **não acessa o GitHub**: tudo chega por .zip.
- **Juntada com a branch BT2** (`PLANO_JUNTADA_RNC_BT2_v0.1.md`): ensaio feito numa cópia temporária, **nada juntado/enviado**. Só `.gitignore` é tocado nos dois lados; os docs do RNC colidem como "file location" porque a BT2 moveu `docs/modulos` → `docs/bt2/modulos` (aceitar o caminho novo); `gerar_pacote_rnc_bancada_v0.3.py` precisa trocar `docs/modulos/` por `docs/bt2/modulos/`; regenerar o catálogo com o gerador v0.3. 22 testes passam na árvore juntada. **Risco:** se a BT2 criar outra v1.10.202–205 com conteúdo diferente, os arquivos colidem (renumerar uma). Avisada duas vezes (mensagens à sessão `maestro-projeto`); **sem resposta**.

## 12. Sugestão de projeto, NÃO implementada: FB "ordenador de cargas"
Ideia do Reginaldo (PLC **intacto**): FB filho (entre "Motor de sugestão" e "Escalonador de entrada" de `docs/PROPOSTA_ARQUITETURA_FB_MAE_FILHOS_v0.1.md`) que ordena os passos pelos bancos selecionados, tratando cada banco como **32 posições** (normalização por percentual do banco; **não** resistores físicos — os bancos reais têm 13 chaves de kW diferentes). **Ordem intercalada:** `banco = k MOD N`, `posição = k DIV N` (banco-por-banco seria `k DIV 32`/`k MOD 32`); **congelar a ordem ao iniciar o ensaio**; o "Motor de sugestão" converte posições lógicas em chaves reais (mapeamento tolerante); a **Guarda de capacidade (mandatória)** continua mandando; numeração conforme `PLANO_NUMERACAO_BLOCOS_PLC.md` (não inventar); nada vai ao PLC sem backup e OK; primeiro protótipo em JS, depois SCL.

## 13. Como continuar (ordem sugerida)
1. Confirmar com o Reginaldo/BT2: versão do medidor no PC BT2, formato do nº de série, quem libera.
2. Bancada: backup do Node-RED + OK do Reginaldo → instalar `rnc-bancada-v0.3.zip` (pasta de dados de **teste**) → script (esperado 18 OK) → roteiro manual T14 em diante (carga **desacoplada**) → ficha da seção 7 → atualizar o relatório como v0.2 (falhas viram `todo` com ID e gravidade).
3. Juntar as branches seguindo `PLANO_JUNTADA_RNC_BT2_v0.1.md`.
4. Só depois do uso real: severidade/causa raiz, indicadores (FPY, reincidência), CSV, login, SQL.
5. Pergunta pendente ao Reginaldo: modo "Demo local" do RNC dentro do navegador (sem Node-RED, para celular)? Minha recomendação foi **não** (armazenamento isolado por arquivo no celular e não prova servidor/disco/rede); alternativa: celular na mesma rede de um Node-RED de teste.
