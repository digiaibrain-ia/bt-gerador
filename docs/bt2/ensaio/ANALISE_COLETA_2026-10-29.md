# Análise da coleta — 29/10/2026 (PLC 1515F, flow do DSE v3.4)

## (a) Confirmado pelos arquivos/fotos
**CPU:** `6ES7 515-2FN03-0AB0`, "CPU 1515F-2 PN", fail-safe, firmware V3.1 (foto Catalog information). Coerente com `OB123 FOB_RTG1` e `Main_Safety_RTG1 [FB1]/[DB1]` na árvore.
**Program blocks (foto):** OB1 Main · FC100 `fc100_cardBancoCargas_BT2` · FB100 `fb100_setupChaves` · FB101 `fb101_ComEt200` · DB20 `db20_exemploStruct` · DB52 `db52_BancoTeste2_DSE` · DB53 `db53_BancoTeste2_SNAP_MANUAL` · DB150 `db150_BC56_Chaves` · DB152 `db152_BC56_SetupPorTensao` · DB154 `db154_BC56_SetupChaves` · **DB155 `db155i_BC56_ComEt200`** · DB158 `db158_BC400_Chaves` · DB160 `db160_BC400_SetupPorTensao` · DB162 `db162_BC400_SetupChaves` · **DB163 `db163i_BC400_ComEt200`** · OB123 · FB1/DB1 (safety).
**External source files (foto):** `db38_db39_ComEt200_v0.3.scl`, `db52_BancoTeste2_DSE.db`, `db53_BancoTeste2_SNAP_MANUAL-v0.1.db`, `db150_BC56_Chaves_v0.3.db`, `db152_BC56_SetupPorTensao_v0.2.db`, `db158_BC400_Chaves_v0.3.db`, `db160_BC400_SetupPorTensao_v0.2.db`, `exemplo_chamada_fb100.scl`, `fb100_setupChaves_v0.3.scl`, `fb101_ComEt200_chamadas_v0.6.scl`, `fb101_ComEt200_v0.6.scl`. (Arquivo-fonte ≠ bloco compilado: a versão compilada não aparece na árvore.)
**Flow `servidor-deepsea-api-gerador-v3_4.json`** (1 aba, 14 nós): inject 1 s → `agenda leituras` → `modbus-flex-getter` (FC03, somente leitura) → `decodifica blocos` → contexto global; `GET /api/gerador` → `monta JSON` → resposta (200 se ok, 503 se não). Comentário do nó: "O arquivo não traz o nó 'DSE (TCP)'"; modelo vem da variável `DSE_MODELO`, unit id `DSE_UNIT_ID` (padrão 10).

## (b) Achados (relevantes para o projeto)
1. **Bloco de medidas A/B é lido a cada 2 s** (`per: 2`), embora o inject dispare a cada 1 s e o medidor consulte a cada 1 s. Logo o dado novo chega a cada ~2 s: pontos repetidos em pares. Explica por que "a cada 1 s" no cabeçalho confundia (retirado no 1.10.111). Impacta janela de 2 s do medidor/gráfico (média de ~1 amostra nova).
2. **`ok`** = blocos A e B lidos há ≤ 10 s; senão HTTP **503** com corpo igual. Confere com `MAX_IDADE=10` do medidor.
3. **`percCarga`** = registrador **1558** (página 6), ×0,1, com sinal: "% da potência nominal" **definida no DSE**. A base (100 % = kW nominal configurado no DSE) segue **não confirmada**. `kw` = `wTotal`(1536, 32 bits)/1000.
4. Escalas confirmadas no flow: tensões e correntes ×0,1 (32 bits), frequência ×0,1, bateria ×0,1, kW = W/1000.
5. **Sem CORS** no nó `http response` (só `Cache-Control: no-store`). O gráfico em "API direto" aberto de outra origem (arquivo local ou outra porta) depende de `httpNodeCors` no `settings.js` (não visível aqui). Abrindo por `http://IP:1880/...` (mesma origem) funciona.
6. **Versão:** aba e monitor dizem v3.4, mas o JSON devolve `diag.versaoApi: "3.2"` (cosmético). v3.4 só acrescentou o **monitor de queda** (nó `gen_mon`: avisa na queda e na volta do DSE).
7. **FC4 não está no 1515**: a árvore tem `FC100 fc100_cardBancoCargas_BT2`, não FC4. Os documentos falam de "FC4 do ET200" (outro PLC, `Gerador_BC015`) — correto; o item do roteiro ("FC4") era do ET200.
8. **Nome das instâncias:** no TIA são `db155i_…` e `db163i_…` (com "i"); os arquivos `fb101_ComEt200_chamadas_v0.4` do projeto chamam `"db155_BC56_ComEt200"`/`"db163_BC400_ComEt200"`. Conferir o nome usado na chamada v0.6 (se a chamada for por nome simbólico e o bloco tiver "i", não compila).
9. Fonte do ET200 `db38_db39_ComEt200_v0.3.scl` aparece na árvore do 1515 (apenas arquivo de apoio); o projeto claude.ai tem v0.2.

## (c) Pendente
- Versão compilada do FB101 (v0.4 no projeto × v0.6 no TIA) e conteúdo da chamada v0.6 — enviar `fb101_ComEt200_v0.6.scl` e `_chamadas_v0.6.scl` para eu comparar.
- Nó "DSE (TCP)" (IP, porta, timeout) e `settings.js` (`httpNodeCors`).
- Base do `percCarga` (medir em teste: % lido × kW × kW nominal configurado no DSE).

## Respostas do operador e desdobramentos (29/10/2026, noite)
| # | Achado | Decisão do operador | Feito / pendente |
|---|---|---|---|
| 1 | Leitura A/B a cada 2 s | mudar para 1 s | **Feito** no fluxo **v3.5** (`servidor-deepsea-api-gerador-v3_5.json`): A e B `per:1` + tolerância 100 ms no agendador. O inject já era de 1 s; o 2 s vinha do `per` dos blocos. Falta testar no Node-RED real (ver `falhas` em `diag.blocos`). |
| 2 | Base do `percCarga` | vai imprimir "Grandeza online" amanhã e enviar | **Pendente** (dado do operador) — não assumir base. |
| 3 | Sem CORS | enviou `settings.js` | `httpNodeCors` **comentado**; `httpStatic` = `C:\Users\b02raf\.node-red\public` **ativo**. Caminho sem CORS: copiar os HTML para essa pasta e abrir em `http://IP:1880/<arquivo>.html`. Habilitar CORS fica como decisão (TI). |
| 4 | Nome das instâncias | acrescentar regra "i" no MD | **Feito**: `REGRAS_NOMES_E_VERSOES_v0.3.md` §6. **Novo achado:** a `chamadas_v0.6` tem os nomes do banco trocados (`db155i_BC400`, `db163i_BC56`); o TIA tem `db155i_BC56` / `db163i_BC400` → gerei `fb101_ComEt200_chamadas_v0.7.scl` e `fb101_ComEt200_v0.7.scl` (só nomes/comentários). |
| 5 | FC4 × FC100 | confirmado | FC4 = ET200; 1515 = `fc100_cardBancoCargas_BT2` (REGRAS §7). |
| 6 | `versaoApi` "3.2" | atualizar + melhorar comentários do fluxo | **Feito** (`"3.5"`; info da aba e do agendador). Comentários dos demais nós: melhorar nas próximas revisões. |
