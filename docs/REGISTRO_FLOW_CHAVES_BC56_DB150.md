# Flow Node-RED "Chaves BC56 (DB150)" — registro (20/10/2026)

Arquivo: `nodered/chaves-56-db150-v1.json` (importar como flow novo no Node-RED — "Import" → "new flow").

Implementa `claude/CONTRATO_HTTP_HTML_NODERED_CHAVES.md` **só pro banco 56 (DB150)**, como combinado ("vamos testar um banco primeiro"). Arquitetura copiada 1:1 do flow `selecao-ensaio-v1.3.json` (fila de 1 gravação por vez, escreve → espera 1500 ms → lê de volta → confere → responde, watchdog 8 s, catch de erro não tratado) — mesmo "token"/jeito, como você pediu.

## (a) Confirmado — vem do seu export do DB150 (TIA, offset)

Todos os offsets abaixo são os que você mandou (coluna Offset do DB150 não otimizado), não inventei nenhum:

| Campo | Offset base | Tipo no flow |
|---|---|---|
| `sb.ligada[1..16]` | 2.0 | 16 bits individuais (`DB150,X2.0`…`X3.7`) |
| `setup.habilitada[1..16]` | 4.0 | 16 bits individuais (`DB150,X4.0`…`X5.7`) |
| `setup.setupOk[1..16]` | 6.0 | 16 bits individuais (`DB150,X6.0`…`X7.7`) |
| `setup.kwReal[1..16]` | 8.0 | 1 bloco (`DB150,REAL8.16`) |
| `setup.rMedidoOhm[1..16]` | 72.0 | 1 bloco (`DB150,REAL72.16`) |
| `setup.rTeoricoOhm[1..16]` | 136.0 | 1 bloco (`DB150,REAL136.16`) |
| `setup.setupData[1..16]` (DTL) | 200.0 | 192 bytes crus (`DB150,BYTE200.192`) — só zera, nunca decodifica |
| `setup.nominal[1..16]` | 392.0 | 1 bloco (`DB150,REAL392.16`), só leitura |
| `setup.chaveSel` | 456.0 | `DB150,INT456` |
| `setup.salvar` | 458.0 | `DB150,X458.0` |
| `setup.usarKwReal` | 458.1 | `DB150,X458.1` |

`cb.ligar[]` (offset 0.0) **não está no flow** — o contrato já definia isso como comando interno do FB100, não exposto ao Node-RED/HTML.

Endereçamento por bit individual (`X<byte>.<bit>`) e array de REAL em bloco (`REAL<offset>.<contagem>`) seguem exatamente o padrão já confirmado funcionando no seu `selecao-ensaio-v1.3.json` (`DB53,X0.0`, `DB53,REAL480.13` etc.) — não é uma sintaxe nova, só apliquei nos offsets do DB150.

IP/rack/slot do endpoint: copiei do `cliente-31-seletor-plc-db52-v2.json` (172.17.209.135, rack 0, slot 1) — mesmo PLC "da Carga" provisório (1515) que já falamos. **Confira se ainda é esse IP antes de testar.**

## (b) Rotas implementadas (6, iguais ao contrato pra banco=56)

- `GET /chaves/56`
- `POST /chaves/56/habilitar` `{indice:1..16, habilitada:bool}`
- `POST /chaves/56/selecionar` `{indice:0..16}`
- `POST /chaves/56/salvar` `{confirmado:true}`
- `POST /chaves/56/usarKwReal` `{usar:bool}`
- `POST /chaves/56/limpar` `{confirmado:true}`

Todas seguem o padrão do contrato: POST só vale com HTTP 2xx + `ok:true`, e a confirmação é sempre uma releitura real do PLC (nunca "aceito e já responde").

## (c) Assumido/inferido por mim — **favor validar**

1. **`setup.salvar` precisa ser despulsado pelo Node-RED.** Lendo o `fb100_setupChaves.scl`, o FB100 só grava `_cmdSalvarAnt := ComandoSalvar` no fim (nunca zera `ComandoSalvar` de volta) — então se o Node-RED deixasse `salvar=true` parado, a borda de subida nunca aconteceria de novo pra próxima chave. Por isso o flow faz 2 escritas: `salvar=true` → confere `SetupOk[chaveSel]` → `salvar=false` → confere. Se o comportamento pretendido do FB100 for outro (ex.: o PLC devia zerar sozinho), me avisa que eu ajusto o FB100 em vez do Node-RED.
2. **`POST /selecionar` bloqueia chave desabilitada** usando um cache da última leitura (`flow.chv56_live`, atualizado a cada ciclo de leitura) — não precisei de offset novo pra isso.

## (d) Pendências — não implementadas ainda, de propósito

1. **`POST /habilitar` e `/selecionar` não bloqueiam com o gerador ligado nem com `EnsaioAtivo`** — falta o offset de `GeradorOperando` (`db52.ledManual`, que eu não tenho) e o DB "Dados do ensaio" (que ainda não existe, mesma pendência já registrada no `ESPECIFICACAO_CARD_CHAVES_DB55_FB200.md`). **A segurança física real continua garantida pelo FB100** (ele mesmo zera `CbLigar` se `GeradorOperando=FALSE` ou `EnsaioAtivo=TRUE`) — então não há risco de a chave ligar fisicamente fora de hora, só falta o bloqueio "bonito" na API.
2. **BC400 (DB158) não está neste flow.** Você pediu pra testar um banco primeiro — depois de validar este, replico pro DB158. Os offsets do DB158 *deveriam* ser idênticos (mesma declaração SCL), mas não vou supor isso sem confirmar — me manda o mesmo export do DB158 (ou eu posso tentar inferir e te aviso que é inferência, sua escolha).
3. **O HTML (v1.9.40) ainda não fala com essas rotas** — o card Chaves continua 100% localStorage/Demo. Essa troca (HTML → Node-RED real) é um passo separado; não mexi nisso agora porque você só pediu o flow.

## (e) Como testar (antes de mexer no HTML)

Com o Node-RED rodando e o flow importado + deployado:
```
curl http://<ip-nodered>:1880/chaves/56
curl -X POST http://<ip-nodered>:1880/chaves/56/habilitar -H "Content-Type: application/json" -d '{"indice":1,"habilitada":true}'
curl -X POST http://<ip-nodered>:1880/chaves/56/selecionar -H "Content-Type: application/json" -d '{"indice":1}'
curl -X POST http://<ip-nodered>:1880/chaves/56/salvar -H "Content-Type: application/json" -d '{"confirmado":true}'
```
Cada POST deve responder `{"ok":true}` (ou um erro claro) em até ~2s. Se der 503 "timeout", confere se o PLC está online e se o DB150 realmente existe com esse número no projeto TIA.
