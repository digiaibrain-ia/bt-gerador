# Contrato HTTP — HTML ⇄ Node-RED · Logs do desenvolvedor [DEV.OBS] (23/10/2026)

**O que é**: o medidor (HTML ≥ v1.9.73) registra o que o teste faz e o que a tela responde; o flow `dev-logs-v1.0` guarda em memória; o `gerenciador_logs_v1.html` mostra ao vivo e exporta JSON + Markdown para mandar de volta ao Claude. **Só observa**: não comanda chave, gerador, ensaio nem PLC; não usa DB52/53/150/158; não tem nó s7/modbus.

## (a) Confirmado (decisões do operador, 23/10/2026)
- HTML é o orquestrador: o Node-RED guarda e devolve; o HTML/gerenciador monta os arquivos. Formato JSON **e** Markdown.
- Gerenciador = `gerenciador_logs_v1.html` (arquivo à parte, aberto à mão pelo botão 📋 do popup Demo `DEV.DEM`). Abertura **nasce Manual**; opção Automático (abre ao finalizar o ensaio).
- Sigla `DEV.OBS` (escolha delegada ao Claude).
- Granularidade: eventos do operador, transições e resultado de transação; **não** cada leitura Modbus nem cada ciclo.

## (b) Testado só no emulador (nada em hardware real)
- `t24.js` (Playwright + mini-runtime Node-RED): 54 verificações — travado não publica; Demo local não publica; Demo+PLC publica; sem duplicar; filtros; JSON/Markdown; F5; reenvio; limite 5000; perdidos; reinício do Node-RED; limpar; abertura Manual/Automática; travar de novo.

## (c) A desenvolver
- Logs próprios nos flows de Registro do ensaio, Gerador (DSE) e Modo (hoje só os de chaves têm `GET /api/logs/56|400`; os demais aparecem pelo lado do HTML, como `tipo: api`).
- Geração automática da Matriz Ação × Estado a partir dos eventos.
- Persistência em disco no Node-RED (hoje só memória: reiniciar zera o buffer; o HTML e o gerenciador guardam cópia).

## Rotas (flow `dev-logs-v1.0`, arquivo `nodered/dev-logs-api-v1.0.json`)
| Rota | Corpo / query | Resposta |
|---|---|---|
| `POST /api/dev/log-evento` | `{"eventos":[...]}` até 200 por lote | `{ok:true, flow, boot, recebidos, aceitos, duplicados, invalidos, ultimoSeq, guardados}`; 400 se corpo inválido ou lote > 200 |
| `GET /api/dev/logs` | `?desde=<seq>&limit=<1..2000, padrão 500>` | `{ok:true, flow, boot, total, ultimo, descartados, perdidos, truncado, lidoEm, eventos:[...]}` — com `desde`, eventos `seq > desde` em ordem crescente; sem `desde`, os `limit` últimos |
| `POST /api/dev/logs/limpar` | `{}` | `{ok:true, flow, limpos, ultimoSeq}` — esvazia o buffer; `seq` e a lista de sessões continuam (o HTML não ressuscita o que foi limpo) |

## Evento
`{sessao, n, t, ms, v, modo, card, tipo, acao, res, det, est}` (+ `seq`, `rx` colocados pelo Node-RED)
- `sessao` + `n`: identificam o evento (uma sessão = uma carga da página; `n` cresce de 1 em 1). **Chave de deduplicação**.
- `t` ISO UTC; `ms` desde a carga da página; `v` versão do HTML; `modo` = `real` | `demoLocal` | `demoPlc`.
- `card`: sigla do `PADRAO_SIGLAS_CARDS.md`. `tipo`: `clique` | `alteracao` | `transicao` | `mensagem` | `ocorrencia` | `api` | `erro` | `sistema` (+ `flow` e `nota`, criados só no gerenciador).
- `res`: `ok` | `info` | `aviso` | `falha`. `det`: detalhes pequenos (≤ 800 caracteres no HTML, ≤ 1500 no flow). `est`: foto do estado no momento (modo, gerador, simulação AUTO/MANUAL, ensaio, etapa, chaves ligadas `ch`, comandadas `cmd`, chave do Setup, popups abertos, bolinhas de comunicação).

## Regras de integridade (regra 7 do projeto)
1. **Sem duplicar**: o flow só aceita `n` maior que o último da `sessao`; o gerenciador deduplica por `sessao|n` (o mesmo evento chega por servidor, canal local e janela-pai).
2. **Sem perder**: o HTML só avança o cursor de envio com HTTP 2xx **e** `ok:true`; senão reenvia. Lotes de 100, 1 por segundo. Fila no HTML: 4000 eventos (descarte do mais antigo é contado e mostrado).
3. **Buraco avisado**: se o gerenciador leu atrasado e o buffer (5000) já descartou, `GET` devolve `perdidos`; o gerenciador grava um evento de falha "N eventos perdidos".
4. **Reinício**: `boot` muda quando o Node-RED reinicia; o gerenciador marca "Node-RED reiniciou" e recomeça o cursor em 0.

## Quando o HTML publica
- Só com a **senha do Demo** (`testeDesbloqueado`) e com a caixa "Enviar eventos ao Node-RED" marcada; travar de novo para a publicação e volta a abertura para Manual.
- **Nunca no Demo local** (`srvChave()==='demoLocal'`): a regra "nada sai do navegador" continua valendo. No Demo local o gerenciador recebe pelo **canal local**. Em Demo+PLC e Real, publica.
- Sem Node-RED com o flow importado: o log continua na tela e no canal local; o popup Demo mostra o erro (ex.: 404 "importe nodered/dev-logs-api-v1.0.json").

## Canal local (mesmo navegador)
`BroadcastChannel('bt2-dev-obs')` + `postMessage` entre a página e a aba que ela abriu. Mensagens: `pede` (gerenciador → medidor), `backlog` (medidor → gerenciador, até 4000 eventos), `ev` (evento ao vivo), `bloqueado` (medidor travado). O medidor só responde à janela que ele mesmo abriu. **Não verificado**: BroadcastChannel entre arquivos abertos como `file://` em Edge/Firefox (por isso o padrão é abrir tudo pelo mesmo endereço http do Node-RED).

## Privacidade e segurança
- A senha do Demo **não** é registrada (o `prompt` não é interceptado; teste confere que `mwm` não aparece em nenhum evento).
- Leituras OK periódicas (GET de 1 s) não são registradas; GET que falha: no máximo 1 a cada 10 s por rota, com contagem das omitidas.
- Exige `/api/dev/` só em ferramenta de desenvolvedor; CORS segue o mesmo padrão das outras rotas (mesma origem, ou `httpNodeCors` no `settings.js`).

## Atualização 23/10/2026 (noite) — HTML v1.9.74 + gerenciador v1.1 (a partir do log `bt2_logs_20261023_170541`)
- **(a) Implementado, testado no emulador:** o log passou a trazer **banco + posição** nas chaves (ver `claude/PADRAO_SIGLAS_CARDS.md`, seção "Texto dos eventos de chave"); `est` ganhou `chL`, `cmdL`, `setupL`, `sel56`, `lig56`, `sel400`, `lig400`; transições novas `seletora BC56/BC400 (simulada)` e `BC56/BC400 ligado (cbLigarBC.. simulado)` (card `bco`); o texto dos cliques ganhou espaço entre os pedaços e o popup nos botões sem id.
- **Gerenciador v1.1 (arquivo continua `gerenciador_logs_v1.html`):** (1) falhas/avisos **iguais** repetidos ≥ 3× viram uma linha "×N" (N soma as `det.omitidas`; no log analisado: 182 linhas = **592** falhas reais de `GET /api/gerador → 404`), com caixa **Diagnóstico** (404/503/400/409/5xx/sem resposta) — só afirma o que o status HTTP já diz; (2) tooltips em tudo (legendas de Card/Tipo/Res./Origem; também por toque); (3) painel de detalhe com **abrir/fechar** e **divisória arrastável** (mouse, toque, teclado ↑ ↓ Home End, Enter abre/fecha, duplo clique), estado em `localStorage` (`bt2.devobs.ui`); (4) olhos animados "em observação" (fecham com a tela pausada, arregalam com falha/aviso, ficam parados com `prefers-reduced-motion`); (5) Markdown exportado com falhas repetidas agrupadas (JSON continua completo); (6) resumo "Avisos e falhas mais repetidos" conta as ocorrências reais e não funde 404 com 503.
- **(b) Assumido:** o texto de diagnóstico é genérico por status HTTP; **a causa do `GET /api/gerador → 404` não foi identificada** (nenhum flow importado atende essa rota, ou a rota tem outro nome) — precisa conferir no Node-RED.
- **(c) A desenvolver:** nenhum item do log mostra ainda a diferença entre o que a tela mandou e o que o flow recebeu (as linhas `flow` e `api` são mostradas lado a lado, sem correlação automática).

## Como validar no real (pendente)
- [ ] Importar `dev-logs-api-v1.0.json` (sem apagar as abas existentes); Deploy; `🧪 Cards x flow` mostra "Dev · Logs … OK".
- [ ] Demo + PLC: popup Demo mostra "✓ recebendo (flow dev-logs-v1.0)"; abrir 📋; clicar uma chave; ver `clique`, `transicao (chaves ligadas/comandadas)` e `api POST /api/chaves/56/ligar` no gerenciador.
- [ ] Real: repetir, e puxar o cabo de rede do PLC: aparecem `transicao` "comunicação BC56: OK → FALHA" e `ocorrencia COM-001`.
- [ ] Conferir se o aviso de pop-up bloqueado aparece no modo Automático com o navegador do PC da fábrica.
- [ ] Baixar JSON e Markdown e mandar de volta.
