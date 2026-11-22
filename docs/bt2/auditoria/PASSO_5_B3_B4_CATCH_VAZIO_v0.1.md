# Passo 5 · B3/B4: triagem dos `catch` vazios e trava no CI (medidor 1.10.229) · 19/11/2026

Decisão de critério técnico (autorizada pelo Reginaldo em 18/11/2026: "as pendências seguem critério técnico"). Mudança só na tela; nenhum comando mudou e nada é bloqueado.

## B3: triagem
Medição por AST: 283 `catch` vazios em `dashboard/src/js` (sem o dado embutido). Resultado:
- **264 inofensivos** receberam um comentário com o motivo dentro do bloco (`/* ignorado: ... */`), por categoria: armazenamento do navegador indisponível (92), ferramenta de diagnóstico/teste (46), atualização de tela opcional (39), popover já no estado pedido (21), API opcional do navegador (13), janela/canal já fechado (12), diálogo/seletor cancelado (12), elemento ausente (12), texto inválido (9), log de desenvolvimento opcional (6), sem BroadcastChannel (3), sondagem opcional (1). Só comentário; o código não mudou. Ferramenta: `dashboard/gerador/comentar_catch_vazio_v0.1.js` (usa `espree`; idempotente).
- **Mudaram de comportamento (os que de fato escondiam erro):**
  1. **Motor de alarmes (`varre`)**: o ciclo de 1 s engolia qualquer erro, e os alarmes podiam parar de atualizar sem ninguém saber. Agora a falha vira **SIS-001 "Erro interno da tela"** (mecanismo que a tela já tinha).
  2. **Desarmar a "mãe" do Patamar** (`PATAMAR_ENSAIO_GRAVADO`, `PATAMAR_GUIADO_PARA`): se falhar, a mãe poderia continuar armada e voltar a comandar chaves. Agora o erro vai para o log de desenvolvimento (DEV.OBS) como erro.
  3. Os de comando de carga já tinham sido tratados na 1.10.228 (CHV-009).
- **Fora do escopo:** 3 `catch` vazios em módulos-fonte versionados (`rnc_defeito_v0.4`: 2; `dados_ensaio_ns_v0.2`: 3 contando popovers); a contagem fica travada no teste e cai quando sair a versão nova do módulo.
- Os 7 `.catch(()=>null)`/`.catch(()=>{})` de promessas ficaram como estão: são `json().catch(() => null)` de resposta inválida e a continuação da fila do ensaio, cujo erro quem chamou já trata.

## B4: trava
- `tests/catch_vazio.test.js` (3 testes, sem navegador): nenhum `catch` vazio sem motivo em `dashboard/src/js`; a contagem dos módulos-fonte travada; e a presença do tratamento do `varre` e do desarmar da mãe.
- O CI (`build-release.yml` v4) roda `build_modular` e `catch_vazio` antes do build.
- `tests/integracao/fase4/u_alarmes_erro_interno.test.js`: faz a leitura que o `varre` usa lançar erro **só quando quem lê é o `varre`** e confere o SIS-001. A mesma bateria na 1.10.228 falha.

## Pendências resolvidas por critério técnico
- **`i_catalogo_v08`** (teste histórico que fixava o medidor 1.10.192 e o catálogo v0.8): **aposentado** (`.test.js.aposentado`). Estava superado por `l_catalogo_auto`, que prova a regra definitiva (o catálogo aponta para a maior versão da pasta). Não estava falhando; o motivo é que ele travava o arquivamento de versões.
- **Medidores antigos:** 28 foram para `dashboard/ferramentas/arquivo/`. Ficam 226 (gerador do `src` e pacote v1.26), 227, 228 e 229. `tests/versoes.js` e o harness também procuram em `arquivo/`, então a contra-prova por variável (`BT2_FASE4_HTML=medidor_gerador_v1.10.190.html`) continua funcionando.
- **Texto do Setup** ("O PLC NÃO confirmou a desmarcação"): continua sem teste. Selecionar uma chave no Setup exige gerador operando, chaveamento informado e banco liberado; o custo de simular isso supera o valor (o texto é anexado depois do aviso CHV-001, já coberto). Conferido por leitura do código.
- **`pacote_ia` (e2e):** continua pendente, sem dono técnico claro (menu com 6 itens no lugar de 5 e OCR dependente de ambiente). Não bloqueia.
