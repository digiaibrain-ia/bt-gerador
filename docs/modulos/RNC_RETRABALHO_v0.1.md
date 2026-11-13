# RNC e retrabalho do gerador — v0.1 (etapas 1 e 2) · 13/11/2026

Controle de **qualidade e retrabalho do produto** (não é manutenção de máquina), por número de série. **Só informativo**: nada comanda PLC, chave ou DSE. Piloto **sem SQL**.

## O que existe nesta versão (etapas 1 e 2)
| Peça | Arquivo |
|---|---|
| Regras (puras, testadas) | `nodered/gerador/rnc/rnc_core_v1.0.js` |
| Gravação em arquivo, foto, backup | `nodered/gerador/rnc/rnc_io_v1.0.js` |
| Gerador do fluxo Node-RED | `nodered/gerador/gerar_rnc_v1.0.js` → `nodered/flows/rnc-api-v1.0.json` |
| Tela de Registro (operador do ensaio) | `dashboard/ferramentas/rnc_registro_v0.1.html` |
| Tela de Reparo (kanban: Aberta · Em reparo · Aguardando reteste · Liberado) | `dashboard/ferramentas/rnc_reparo_v0.1.html` |
| Testes | `tests/rnc_core.test.js` (`node --test tests/rnc_core.test.js`) |

**Ainda não feito:** teste completo do ciclo na bancada (3), botão "Registrar defeito" no medidor (4), indicadores/CSV (5).

## Fluxo e estados (da RNC)
`ABERTA` (já bloqueia expedição) → `EM_REPARO` → `AGUARDANDO_RETESTE` → `LIBERADO`. Reteste reprovado volta a `EM_REPARO`.
**Gerador (série):** `BLOQUEADO` se qualquer RNC dele não estiver `LIBERADO`; `LIBERADO` só quando todas estiverem; `SEM_RNC` se nunca teve.
Travas no servidor: `rev` velha recusada (409) · não pula estado (422) · reparo exige ação e responsável (peça é opcional) · só libera com reteste `APROVADO`.

## Dados: `rnc.jsonl` (uma linha por evento, só cresce, nunca se edita)
```json
{"event_id":"EVT-000001","rnc_id":"RNC-2026-0001","serial":"...","event":"RNC_ABERTA","timestamp":"2026-11-13T10:00:00.000Z",
 "actor":"Ana","rev":1,"schema_version":1,"banco":"BT2","idem":"<chave>","data":{"modelo":"..","tipo_nc":"DEFEITO","descricao":"..","ensaio_id":null}}
```
Eventos: `RNC_ABERTA`, `REPARO_INICIADO`, `REPARO_REGISTRADO` (data: acao, peca?), `RETESTE_REGISTRADO` (data: resultado, ensaio_id?), `FOTO_ANEXADA` (data: foto_ref, bytes; não muda `rev`).
**Evolução:** campo novo entra **dentro de `data`, opcional**; nunca alterar eventos antigos. O estado atual é recalculado dos eventos. Pronto para virar tabela de eventos no SQL depois.
Pasta (`RNC_DIR`): `rnc.jsonl` · `fotos/<rnc_id>/<n>.jpg|png|webp` (máx. 3 MB; a tela reduz antes) · `backup/rnc-AAAA-MM-DD.jsonl` (00:05, guarda 30).

## Rotas (padrão `/api/<recurso>`)
`POST /api/rnc/abrir` · `POST /api/rnc/evento` (`rnc_id, rev_esperado, event, data, actor`) · `GET /api/rnc?serial=&estado=&encerradas=1|todas&limit=` · `GET /api/rnc/serie/:serial` · `POST /api/rnc/foto/:rnc_id?actor=` (corpo = imagem) · `GET /api/rnc/foto/:rnc_id/:nome` · `GET /api/rnc/saude`.
Gravar só vale com HTTP 2xx e `ok:true`; a resposta vem **depois** do `fsync` no disco.

## Instalar (no PC do Node-RED — só com OK do Reginaldo e backup antes)
1. Backup do Node-RED exportado.
2. Variável de ambiente do PM2: `RNC_DIR` = pasta dos dados (caminho absoluto). Opcional: `RNC_SERIAL_REGEX`, `RNC_BANCOS`.
3. `settings.js` com `functionExternalModules` ligado (padrão) — o nó usa `fs` e `path`.
4. Importar `rnc-api-v1.0.json` como **nova aba** (não toca nas abas das chaves). Deploy.
5. Copiar `rnc_registro_v0.1.html` e `rnc_reparo_v0.1.html` para a pasta `public` do Node-RED (mesma origem; sem CORS) e abrir `http://<servidor>:1880/rnc_registro_v0.1.html?banco=BT2` (operador) e `http://<servidor>:1880/rnc_reparo_v0.1.html` (reparo).
6. Conferir `GET /api/rnc/saude`.
Fora da mesma origem, a página precisa de CORS (`httpNodeCors` no `settings.js`) e do campo "Servidor".

## Premissas assumidas (confirmar)
- **Formato do número de série:** assumido `^[A-Z0-9]{15,30}$` a partir de `M9MGD26060019SDFWA01715` (23 caracteres). Ajustar por `RNC_SERIAL_REGEX` quando o formato real for confirmado.
- Bancos válidos `BT1`,`BT2`; um serviço para os dois (campo `banco` por RNC). Piloto começa no BT2.
- Autoria = nome digitado (sem login). Quem libera = quem registra o reteste aprovado (nome digitado).
- Relógio do PC do Node-RED define a data/hora dos eventos.

## O que foi provado e o que falta (relatório honesto)
**Provado (simulado, sem PLC/DSE):** 10 testes automáticos das regras e da gravação (ciclo completo, `rev`, transições, idempotência, 1000 gravações seguidas, linha quebrada, foto, backup); **Node-RED 4 real** com o fluxo importado: abrir, repetir com a mesma chave, `rev` velha (409), pulo de estado (422), foto (ida e volta byte a byte), tentativa de ler fora da pasta (404), **60 aberturas simultâneas** sem ID repetido nem buraco, e reinício do Node-RED mantendo os 63 eventos; tela de Registro no navegador (celular), com erro de rede mantendo o formulário; tela de Reparo com **duas abas simultâneas** (a segunda recebe o aviso de conflito e não grava), ciclo completo (assumir, reparo sem ação recusado, reparo, reteste reprovado volta a Em reparo, segundo reparo, reteste aprovado libera), foto no detalhe e série com outra RNC pendente seguindo BLOQUEADA.
**Depende da bancada / TI:** o PC real do BT2 (versão do Node-RED, `RNC_DIR`, permissão de escrita, antivírus), a rede entre o PC de registro e o PC de reparo, o relógio do PC, a cópia do backup para fora do PC, o uso real pelos operadores.
**Limites conhecidos:** o reteste na tela de Reparo é só o REGISTRO do resultado (o ensaio em si é no medidor; o vínculo `ensaio_id` vem na etapa 4). Com o detalhe aberto a tela não atualiza sozinha (para não perder o que está sendo digitado).  o sistema é informativo; o bloqueio de expedição físico depende do processo da fábrica (etiqueta + conferência).
