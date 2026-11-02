# Contrato HTTP HTML ↔ Node-RED do card "Registro do ensaio" (DB53) — v1.4 — rotas `/api/ensaio/*` (22/10/2026)

**Substitui** `claude/CONTRATO_HTTP_HTML_NODERED_SELECAO.md` (HTML v1.9.0, rotas `/ensaio/*`).
**Flow:** `claude/nodered/registro-ensaio-db53-api-v1.4.json` — aba **"Registro do Ensaio DB53 (API)"**. **HTML:** v1.9.64 (os dois entram juntos).

> **Resumo.** A lógica do flow é a mesma do `selecao-ensaio-v1.3` (que era o validado do ensaio manual); mudaram só as **rotas** (agora com `/api/`, padrão de 21/10) e o campo **`flow`** nas respostas dos GET. Verifiquei no emulador que, para a mesma sequência de pedidos, as respostas de v1.3 e v1.4 são idênticas (10 de 10) e que o número de escritas no PLC é o mesmo. **Não** testado contra o PLC real.

## 1. O que está confirmado / assumido / a desenvolver

**Confirmado** (arquivos `selecao-ensaio-v1.3.json` ×2 enviados em 22/10 — são **idênticos**; o `_2` é só o mesmo flow importado duas vezes)
- Endpoint S7 do flow: 172.17.209.135, rack 0, slot 1, ciclo 1000 ms. Variáveis do DB53 (vartable): `preenchValido X0.0`, `serie S2.20`, `versao S24.12`, `data S38.10`, `fase S50.12`, `preenchNums REAL64.4`, `equip* S80…S454`, `etapaNSalva/Perc/Vals` em 476/532/588/644/700/756…
- Gravação: fila → escrita → espera 1500 ms → leitura de volta → comparação; etapa grava de novo o bit "Salva" depois de conferir; vigia de 8 s → HTTP 503.

**Assumido por mim**
- O modo manual/automático continua **dentro deste flow** (memória de flow), por transição, para não mexer no que foi validado. Pela regra "cada card tem o seu DB e o seu flow" ele deve migrar para o flow do card **Modo** quando o DB58 existir — **decisão pendente (pergunta ao usuário)**.

**A desenvolver**
- Flow "Modo (API)" + DB58 (heartbeat e, depois, modo manual/auto).
- Rotas `/api/ensaio/*` para o card Etapas (DB56…/DB57 "Dados do ensaio") só quando esses DBs existirem.

## 2. Rotas

| Rota | Corpo / resposta |
|---|---|
| `GET /api/ensaio/modo` | `{flow, modo, bt, ts}` — a tela só mostra como "efetivo" o que vem daqui. Aceita "manual"/"auto" ("automático"); outro valor é mostrado como veio. |
| `POST /api/ensaio/modo` `{modo:'manual'\|'auto'}` | `{ok, modo}` — depois do POST o HTML faz GET; se o modo devolvido ≠ pedido, mostra erro. |
| `POST /api/ensaio/snap/preenchimento` `{campos:{serie, versao, data, fase, frequenciaHz, tensaoV, tempAmbienteC, potenciaKw, equipamentos:{motor\|alternador\|controlador\|retificador\|rat\|bateria:{fabricante,modelo,serie}}}}` | `{ok}` — campo vazio = `""`. |
| `POST /api/ensaio/snap/etapa` `{etapa:<alvo %>, indice:<1..N>, valores:{cargaReal, potencia, tempMotor, Va, Vb, Vc, Ia, Ib, Ic, rpm, bateria, tEstab, cronometro}, confirmado:true}` | `{ok}` — `tEstab` e `cronometro` em segundos; sem leitura = `null`. |
| `GET /api/ensaio/snap` | `{flow, modo, preenchimento, etapas:[{etapa, indice, salva, valores}], lidoEm}` — `salva` precisa ser `true`; `indice` é obrigatório na prática (etapa 0 % aparece duas vezes). |
| `POST /api/ensaio/snap/limpar` `{confirmado:true}` | `{ok}` |

## 3. Regras do HTML (v1.9.64)
- POST só vale com HTTP 2xx e `ok:true`; "✓ salva" só aparece se o GET seguinte trouxer a etapa com `salva:true` e valores conferindo (tolerância 0,5 % ou 0,05).
- Antes de cada gravação o HTML consulta `GET /api/ensaio/modo`; sem confirmação do modo, não grava. (É a mensagem "modo manual/automático não confirmado — … Failed to fetch" quando o Node-RED não é alcançado.)
- Timeouts: GET 4 s, POST 10 s. Gravações serializadas; o poll (5 s) é descartado se uma gravação ocorreu no meio.
- **URL base (muda na v1.9.66):** existe **uma só URL de servidor**, no botão **Demo** (campo **Servidor**, pede a senha), e ela vale para `/api/chaves/*` **e** `/api/ensaio/*`. Ordem: URL salva neste navegador (`medidor.srvUrl`) → URL antiga das chaves/registro (aproveitada 1x e salva) → mesma origem da página (só quando aberta por http/https) → vazio. Com a página aberta como arquivo (`file://`) e sem URL, a tela avisa em vez de falhar com "Failed to fetch". *(v1.9.64/65: campo próprio do registro no `⚙ Servidor` do card Registro — removido.)*
- **CORS:** se o HTML não for servido pelo próprio Node-RED (outra origem ou `file://`), o Node-RED precisa permitir CORS no `settings.js` (`httpNodeCors`) — os flows **não** acrescentam esse cabeçalho. *Não verificado no seu Node-RED.*
- Falhas viram ocorrências: `COM-003`, `ENS-001`, `ENS-002`, `ENS-003` (`PADRAO_OCORRENCIAS_MENSAGENS_FALHAS.md`).
- **Fonte do registro (v1.9.66)** deduzida do modo, sem opção manual: **Real** e **Demo + PLC** gravam no Node-RED/PLC; **Demo local** usa o simulador local (localStorage; o relatório sai marcado como simulação; nada vai ao PLC). Não existe PLC simulado. O **"Forçar salvar (teste)"** e a opção ② do Demo foram **removidos**.

## 4. Instalação (ordem)
1. Node-RED: **apagar** a aba antiga "Selecao do ensaio (manual/auto)" (e qualquer cópia — duas abas com as mesmas rotas: responde a primeira registrada).
2. Importar `registro-ensaio-db53-api-v1.4.json` → **Deploy**.
3. `GET http://<node-red>/api/ensaio/modo` no navegador deve devolver `"flow":"registro-ensaio-v1.4"`.
4. Abrir o HTML v1.9.66; botão **Demo** (senha) → campo **Servidor** → conferir/preencher a URL (vazio = mesmo endereço da página).
