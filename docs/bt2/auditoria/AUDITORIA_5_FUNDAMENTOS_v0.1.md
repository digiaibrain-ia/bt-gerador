# Auditoria pelos 5 fundamentos (Mano Deyvin) — medidor 1.10.219, fluxo RNC v1.1, ET200 v0.7 · 17/11/2026

**Escopo:** o que mudou desde as Fases 1 a 3 (RNC, fila e area RNC do medidor, ET200, Patamar, alarme inteligente). **Modo: leitura + provas em simulador.** Nada foi alterado no Node-RED, no PLC nem no PC BT2. Sem login/senha nas rotas (D-4, TI): fora do escopo.
Provas rodadas contra o fluxo REAL no Node-RED 5.x do harness (pasta de dados temporaria), nao contra mocks.

## Status (17/11/2026, apos o OK do Reginaldo)
**AUD-1, AUD-2 e AUD-3 CORRIGIDOS** em `nodered/flows/rnc-api-v1.2.json` (gerado por `nodered/gerador/gerar_rnc_v1.2.js`; core `rnc_core_v1.2.js`; a v1.1 fica intacta). Prova: `tests/integracao/seguranca/s4_rnc_d3.test.js` = **17 de 17 na v1.2 e 10 falhas na v1.1** (verificacao por mutacao); script de bancada `tests/rnc_teste_bancada_v0.3.js` 18 de 18; medidor x fluxo real `rnc_medidor_fila_real.js` 5 de 5. AUD-4, AUD-5 e AUD-9 no backlog (BK-AUD-04/05/09). Segunda opiniao tecnica (Gemini) concordou com as 4 recomendacoes; correcao minha: repeticao com o MESMO conteudo devolve 200 (nao 409).
**Para usar no PC BT2:** medidor servido pelo Node-RED (mesma origem) funciona sem ajuste; medidor aberto como arquivo (Origin `null`) precisa da variavel `BT2_ORIGENS_OK=null` na aba/PM2. Scripts de teste precisam enviar `Origin` (v0.3).

## Resultado
| ID | Fundamento | Gravidade | Achado | Prova | Acao proposta |
|---|---|---|---|---|---|
| **AUD-1** | 3 Nunca confie no cliente | **Alta** | As rotas de ESCRITA do RNC (`/api/rnc/abrir`, `/evento`, `/foto`) **nao tem a guarda D3** (Origin/Referer + `application/json`) que as rotas de chaves e do registro tem. Qualquer pagina aberta no navegador do operador pode enviar um formulario "simples" (sem preflight) e **abrir RNC ou mudar o estado de uma RNC** (ate `LIBERADO`, se acertar `rnc_id` e `rev`, que sao sequenciais). | `form-urlencoded` com `Origin: http://evil.example` -> **HTTP 201**, RNC criada; JSON com Origin estranho -> 201; sem Origin -> 201. | Fluxo `rnc-api-v1.2` com a guarda D3 nas 3 rotas de escrita + teste `s4_rnc_d3` (falha na v1.1, passa na v1.2). |
| **AUD-2** | 2 Idempotencia | Media | `idempotency_key` e **opcional** no `abrir`: um cliente sem chave (curl, script, segunda tela) duplica a RNC se repetir. | Revisao do core (`if (idem)`); medidor e telas avulsas enviam a chave, o servidor nao a exige. | Servidor passa a exigir a chave no `abrir` (400 sem ela). Telas e medidor ja enviam; o script de bancada tambem. |
| **AUD-3** | 2 Idempotencia | Baixa | A mesma chave com **outro conteudo** devolve a RNC antiga como se fosse a nova (so a tela compensa, gerando chave nova por conteudo). | Revisao do core. | Servidor compara serie/tipo/descricao: chave igual + conteudo diferente = **409** `CHAVE_REUTILIZADA`. |
| **AUD-4** | 3 Nunca confie no cliente | Media | **Guarda de capacidade (limite de kW) existe so no HTML.** Um `POST /api/chaves/56/ligar` direto (com Origin valido) passa do limite; o servidor nao conhece o kW a 100 %. A protecao fisica continua sendo o intertravamento SB/CB do PLC e o carregamento do banco. | `chaves-56 v3.7`: nenhuma regra de capacidade/kW no fluxo. | **Nao corrigir agora**: exige o kW do gerador no servidor (DB2100) e/ou PLC. Backlog `BK-AUD-04`; decidir com o Reginaldo. |
| **AUD-5** | 3 Nunca confie no cliente | Baixa | O nome (`actor`) vem digitado no navegador: a trilha "por quem" nao e autenticada. Mesma raiz de D-4 (login). | Revisao. | Registrado (TI/login). Nao corrigir aqui. |
| AUD-6 | 1 Race condition | **OK** | RNC: **4 `abrir` simultaneos com a mesma chave -> 1 so RNC**; **3 `evento` simultaneos com a mesma `rev` -> 1x200 + 2x409**; numeracao sem buraco (T13b da bancada). Node-RED e de uma thread so e o RNC grava de forma sincrona (leitura, decisao e gravacao sem `await`). | Rodado agora contra o fluxo real. | Virar teste de regressao (`rnc_concorrencia`). |
| AUD-7 | 3 Nunca confie no cliente | **OK** | Leitura de foto nao aceita caminho arbitrario (so referencia que existe no historico): `..%2f`, `%2e%2e`, `/etc/passwd` -> 404. | Rodado agora. | Entra no mesmo teste de regressao. |
| AUD-8 | 5 Testes de integracao | Info | Cobertura forte (Fase 4: 132; e2e de tela; RNC contra o fluxo real). Falta: um comando unico; os blocos SCL do ET200 **so se provam no TIA/ET200** (tem so o modelo em JS). | `tests/`. | Documentar o comando unico (secao abaixo). SCL: bancada. |
| AUD-9 | 4 Separacao de responsabilidades | Info | Medidor HTML ~1,4 MB (UI + regra do Guiado + acesso a dados). **Nao refatorar agora**: versao em fechamento. Os modulos ja saem de `dashboard/modulos-fonte` por gerador e ha teste e2e de caracterizacao. | -- | Fazer depois da liberacao, com plano e OK (skill: um passo por vez). |

## Plano de correcao proposto (precisa de OK antes de alterar)
1. **AUD-1 + AUD-2 + AUD-3 → `nodered/flows/rnc-api-v1.2.json`** (gerado por `nodered/gerador/gerar_rnc_v1.2.js`; a v1.1 fica intacta). A guarda D3 e copiada da que ja existe (chaves/registro), com as mesmas variaveis (`BT2_ORIGENS_OK`). `abrir`/`evento`: exige `application/json`; `foto`: exige `image/*`. Leituras (GET) nao mudam.
2. **Compatibilidade:** medidor, `rnc_reparo`, `rnc_registro` falam com o MESMO servidor que os serve (Origin = Host): passam. Quem usa o medidor aberto como arquivo (Origin `null`) precisa de `BT2_ORIGENS_OK=null` na aba (como ja e hoje nas chaves). O `rnc_teste_bancada_v0.2.js` (Node, sem Origin) ganha o cabecalho `Origin` = servidor (v0.3).
3. **Testes** (todos contra o fluxo real, e a mesma bateria **tem que falhar na v1.1**): `s4_rnc_d3` (form/JSON/sem origem/Origin estranho/foto), `rnc_concorrencia` (AUD-6/AUD-7), idempotencia (sem chave = 400; chave repetida = mesma RNC; chave com outro conteudo = 409).
4. Pacote v1.19 com a rnc-api-v1.2; medidor 1.10.219 nao muda.
5. **Fora desta rodada (backlog):** AUD-4 (limite no servidor/PLC), AUD-5 (login), AUD-9 (refatoracao).

## Comando unico para rodar os testes (sem producao)
```
cd tests/integracao && BT2_AMBIENTE_TESTE=local BT2_FASE4_HTML=medidor_gerador_v1.10.219.html node --test fase4/*.test.js        # 132 (Node-RED real + PLC simulado)
node --test tests/fb/*.test.js tests/plc_modelo/*.test.js tests/rnc_core.test.js tests/rnc_core_v1.1.test.js tests/serie/decodifica_serie_mwm_v0.3.test.js   # unitarios
for t in dados_ensaio_ns rnc_area_fila modo_textos_e_bancos alarme_inteligente central_exportar mapa_fbs_no_medidor rnc_e_bancos_visiveis modo_discreto catalogo_trocar_gerador patamar_manual_sem_aplicar patamar_manual_espera_aplicar; do MEDIDOR=medidor_gerador_v1.10.219.html node tests/e2e/$t.js; done   # telas (Chromium)
cd tests/integracao && BT2_AMBIENTE_TESTE=local node rnc_medidor_fila_real.js    # medidor x fluxo RNC real
```
Trava de producao: `t0_trava_producao` (4 camadas) segue valendo; os testes novos usam pasta de dados temporaria com "teste" no nome.
