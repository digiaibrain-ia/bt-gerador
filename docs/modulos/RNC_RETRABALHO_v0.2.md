# RNC e retrabalho do gerador — v0.2 (etapas 1, 2 e 4) · 13/11/2026

v0.2: contexto do ensaio (botão no medidor) e aviso de RNC pendente. O fluxo passa a v1.1 (v1.0 fica no repositório, **importar só um**).

Controle de **qualidade e retrabalho do produto** (não é manutenção de máquina), por número de série. **Só informativo**: nada comanda PLC, chave ou DSE. Piloto **sem SQL**.

## O que existe nesta versão (etapas 1, 2 e 4)
| Peça | Arquivo |
|---|---|
| Regras (puras, testadas) | `nodered/gerador/rnc/rnc_core_v1.1.js` (v1.0 mantida) |
| Gravação em arquivo, foto, backup | `nodered/gerador/rnc/rnc_io_v1.1.js` |
| Gerador do fluxo Node-RED | `nodered/gerador/gerar_rnc_v1.1.js` → `nodered/flows/rnc-api-v1.1.json` |
| Tela de Registro (operador do ensaio) | `dashboard/ferramentas/rnc_registro_v0.1.html` |
| Tela de Reparo (kanban: Aberta · Em reparo · Aguardando reteste · Liberado) | `dashboard/ferramentas/rnc_reparo_v0.2.html` (mostra o contexto do ensaio; v0.1 mantida) |
| **Botão "⚠ Registrar defeito" no medidor** + aviso de RNC pendente | `dashboard/ferramentas/medidor_gerador_v1.10.202.html` (**base: v1.10.201**, a mais nova, da sessão BT2; fonte do módulo: `dashboard/modulos-fonte/rnc_defeito_v0.2.js`). A `medidor_gerador_v1.10.135.html` é o mesmo botão sobre a base v1.10.134 (módulo v0.1) e fica só como alternativa. |
| Testes | `tests/rnc_core.test.js` (v1.0) e `tests/rnc_core_v1.1.test.js` (`node --test tests/*.test.js`) |

**Ainda não feito:** teste completo do ciclo na bancada (3; roteiro pronto em `docs/modulos/RNC_CHECKLIST_BANCADA_v0.1.md`), botão "Registrar defeito" no medidor (4), indicadores/CSV (5).

## Fluxo e estados (da RNC)
`ABERTA` (já bloqueia expedição) → `EM_REPARO` → `AGUARDANDO_RETESTE` → `LIBERADO`. Reteste reprovado volta a `EM_REPARO`.
**Gerador (série):** `BLOQUEADO` se qualquer RNC dele não estiver `LIBERADO`; `LIBERADO` só quando todas estiverem; `SEM_RNC` se nunca teve.
Travas no servidor: `rev` velha recusada (409) · não pula estado (422) · reparo exige ação e responsável (peça é opcional) · só libera com reteste `APROVADO`.

## Dados: `rnc.jsonl` (uma linha por evento, só cresce, nunca se edita)
```json
{"event_id":"EVT-000001","rnc_id":"RNC-2026-0001","serial":"...","event":"RNC_ABERTA","timestamp":"2026-11-13T10:00:00.000Z",
 "actor":"Ana","rev":1,"schema_version":1,"banco":"BT2","idem":"<chave>","data":{"modelo":"..","tipo_nc":"DEFEITO","descricao":"..","ensaio_id":null}}
```
`RNC_ABERTA` aceita `contexto` (opcional, objeto, ≤ 8000 caracteres) com a fotografia do ensaio: `{origem, versao_medidor, demo, tipo_ensaio, momento, modelo:{dse,dse_texto,gerador}, ensaio:{etapa, etapa_nome, alvo_pct, decorrido_s,...}, grandezas:{...}, alarmes:{temAlarme, aviso, desligamento, tripEletrico, lista:[]}, gerador_estado}`. Fica em `data.contexto` e não muda nenhuma regra.
Eventos: `RNC_ABERTA`, `REPARO_INICIADO`, `REPARO_REGISTRADO` (data: acao, peca?), `RETESTE_REGISTRADO` (data: resultado, ensaio_id?), `FOTO_ANEXADA` (data: foto_ref, bytes; não muda `rev`).
**Evolução:** campo novo entra **dentro de `data`, opcional**; nunca alterar eventos antigos. O estado atual é recalculado dos eventos. Pronto para virar tabela de eventos no SQL depois.
Pasta (`RNC_DIR`): `rnc.jsonl` · `fotos/<rnc_id>/<n>.jpg|png|webp` (máx. 3 MB; a tela reduz antes) · `backup/rnc-AAAA-MM-DD.jsonl` (00:05, guarda 30).

## Rotas (padrão `/api/<recurso>`)
`POST /api/rnc/abrir` · `POST /api/rnc/evento` (`rnc_id, rev_esperado, event, data, actor`) · `GET /api/rnc?serial=&estado=&encerradas=1|todas&limit=` · `GET /api/rnc/serie/:serial` · `POST /api/rnc/foto/:rnc_id?actor=` (corpo = imagem) · `GET /api/rnc/foto/:rnc_id/:nome` · `GET /api/rnc/saude`.
Gravar só vale com HTTP 2xx e `ok:true`; a resposta vem **depois** do `fsync` no disco.

## Menu ☰ do medidor (grupo "Operação")
O menu ☰ da v1.10.201/202 lê o `catalogo_ferramentas.js`, que é **gerado** (não se edita) a partir da maior versão de cada arquivo da pasta. Para as telas aparecerem no menu do **operador**:
- `dashboard/ferramentas/catalogo_ferramentas_v0.9.js` (base) = base v0.8 + `RNC · Registro de defeito` e `RNC · Reparo`, ambos no grupo **Operação**.
- `dashboard/gerador/gerar_catalogo_auto_v0.3.py` = gerador v0.2 apontando para a base v0.9 (9 ferramentas). Uso: `python3 dashboard/gerador/gerar_catalogo_auto_v0.3.py <pasta-do-pacote>`; escreve `catalogo_ferramentas.js` nessa pasta. Os `.html` das duas telas precisam estar na pasta (senão o gerador recusa).
- Provado em navegador (pasta montada com a v1.10.202 + `menu_dev_v0.3.js` + catálogo gerado): o menu do operador (`?dev=0`) lista Medidor, Gráfico, **RNC · Registro de defeito** e **RNC · Reparo**; clicar abre a tela certa; o modo dev lista também as ferramentas de desenvolvimento; 0 erro de JavaScript.
- **Atenção ao juntar com a sessão BT2:** o gerador do pacote de lá usa `gerar_catalogo_auto_v0.2.py` + base v0.8 (sem as telas RNC). É preciso passar a usar o v0.3/base v0.9 (ou acrescentar os dois itens à base que estiver valendo), senão o catálogo gerado volta a não listar as telas. Cosmético: a dica (tooltip) do botão ☰ do operador ainda diz "Medidor, Gráfico do ensaio" (texto fixo do `menu_dev_v0.3.js`; não alterado).

## Botão no medidor (v1.10.202; antes v1.10.135)
- "⚠ Registrar defeito" no cabeçalho abre a janela com série (campo Nº de série de *Dados do ensaio*), modelo, banco, tipo, descrição e nome. Anexa sozinho modelo, etapa, hora, grandezas e alarmes do DSE (lidos da memória da tela; **nada é lido ou escrito no PLC, nas chaves ou no DSE**). Usa a mesma URL de servidor do medidor.
- **Aviso informativo** (nunca bloqueia o ensaio): ao iniciar o ensaio, trocar de etapa ou informar a série, consulta `GET /api/rnc/serie/:serial` e mostra a faixa e a etiqueta "RNC: BLOQUEADO (n)". Sem servidor ou rota, fica silencioso.
- **Demo:** permitido para treino; descrição leva `[DEMO]` e o contexto `demo:true` (o Reparo destaca).
- "Salvo" só depois da confirmação do servidor; falha mantém a janela preenchida e o reenvio não duplica.

## Instalar (no PC do Node-RED — só com OK do Reginaldo e backup antes)
1. Backup do Node-RED exportado.
2. Variável de ambiente do PM2: `RNC_DIR` = pasta dos dados (caminho absoluto). Opcional: `RNC_SERIAL_REGEX`, `RNC_BANCOS`.
3. `settings.js` com `functionExternalModules` ligado (padrão) — o nó usa `fs` e `path`.
4. Importar `rnc-api-v1.1.json` (não importe a v1.0 junto: as rotas são as mesmas) como **nova aba** (não toca nas abas das chaves). Deploy.
5. Copiar `rnc_registro_v0.1.html`, `rnc_reparo_v0.2.html` e `medidor_gerador_v1.10.135.html` para a pasta `public` do Node-RED (mesma origem; sem CORS) e abrir `http://<servidor>:1880/rnc_registro_v0.1.html?banco=BT2` (operador) e `http://<servidor>:1880/rnc_reparo_v0.2.html` (reparo).
6. Conferir `GET /api/rnc/saude`.
Fora da mesma origem, a página precisa de CORS (`httpNodeCors` no `settings.js`) e do campo "Servidor".

## Premissas assumidas (confirmar)
- **Formato do número de série:** assumido `^[A-Z0-9]{15,30}$` a partir de `M9MGD26060019SDFWA01715` (23 caracteres). Ajustar por `RNC_SERIAL_REGEX` quando o formato real for confirmado.
- Bancos válidos `BT1`,`BT2`; um serviço para os dois (campo `banco` por RNC). Piloto começa no BT2.
- Autoria = nome digitado (sem login). Quem libera = quem registra o reteste aprovado (nome digitado).
- Relógio do PC do Node-RED define a data/hora dos eventos.

## O que foi provado e o que falta (relatório honesto)
**Provado (simulado, sem PLC/DSE):** 10 testes automáticos das regras e da gravação (ciclo completo, `rev`, transições, idempotência, 1000 gravações seguidas, linha quebrada, foto, backup); **Node-RED 4 real** com o fluxo importado: abrir, repetir com a mesma chave, `rev` velha (409), pulo de estado (422), foto (ida e volta byte a byte), tentativa de ler fora da pasta (404), **60 aberturas simultâneas** sem ID repetido nem buraco, e reinício do Node-RED mantendo os 63 eventos; tela de Registro no navegador (celular), com erro de rede mantendo o formulário; tela de Reparo com **duas abas simultâneas** (a segunda recebe o aviso de conflito e não grava), ciclo completo (assumir, reparo sem ação recusado, reparo, reteste reprovado volta a Em reparo, segundo reparo, reteste aprovado libera), foto no detalhe e série com outra RNC pendente seguindo BLOQUEADA.
**Etapa 4 (simulada, medidor v1.10.135 em navegador contra Node-RED 4 real):** botão presente; contexto capturado no Demo (22 grandezas, modelo do DSE, etapa, alarmes); RNC gravada com contexto e `[DEMO]`; etiqueta no cabeçalho; faixa de aviso ao iniciar o ensaio; série sem RNC não mostra nada; servidor fora do ar não quebra o medidor e a janela mantém o texto; sem erro de JavaScript; Reparo v0.2 exibe o contexto. 22 testes automáticos (v1.0 + v1.1) passam.
**Porte para a v1.10.202 (base v1.10.201):** só mudaram a versão, o histórico e o módulo novo (diff = 2 linhas removidas: versão e meta). Mesmos testes no navegador contra o Node-RED real: botão, contexto, registro, etiqueta, faixa ao iniciar o ensaio, 0 erro de JavaScript, e a v1.10.201 original sem o botão e sem erro (comparação). Ajustes do módulo v0.2: faixa de aviso no rodapé (não cobre o cabeçalho) e Esc fecha a janela. Uma vez apareceu "Falhas 2" no cabeçalho num teste; não se repetiu em 3 reexecuções (201 e 202) — tratado como passageiro, **conferir na bancada**.
**Não provado:** leitura de um DSE **real** (no Demo as grandezas vêm do simulador: com o motor parado vieram zeradas) e o medidor rodando no PC BT2 de produção.
**Depende da bancada / TI:** o PC real do BT2 (versão do Node-RED, `RNC_DIR`, permissão de escrita, antivírus), a rede entre o PC de registro e o PC de reparo, o relógio do PC, a cópia do backup para fora do PC, o uso real pelos operadores.
**Limites conhecidos:** o reteste na tela de Reparo é só o REGISTRO do resultado (o ensaio em si é no medidor; o vínculo `ensaio_id` vem na etapa 4). Com o detalhe aberto a tela não atualiza sozinha (para não perder o que está sendo digitado).  o sistema é informativo; o bloqueio de expedição físico depende do processo da fábrica (etiqueta + conferência).
