# Testes e entrega (referencia)

## Estrutura de tests/integracao
- `harness.js`: sobe o Node-RED 5.0.9 com fluxos de `nodered/flows/bt2/*.json` lidos do disco, troca so os nos S7 pelos de `nos_s7_teste/`; `sobe({fluxos, env, envAbas, servirHtml})`; expoe `h.url`, `h.plc`, `h.logs`, `h.para()`. Variaveis da ABA vem em `envAbas` (ex.: `CONF_JANELA_MS`, `QUARENTENA_MS`, `BT2_BANCADA`). Variaveis do PROCESSO (`PLC_IP`) so valem para `${...}` nas propriedades dos nos.
- `plc_simulado.js`: memoria do PLC; instrumentacao: `latencia` (escrita/leitura, jitter, `serial`), `atrasosEscrita`, `falhas.escritaApos`, `semente`, `trace`, `maxEmVoo`, `parar()`.
- `verificador.js`: `valoresAplicados`, `sobreposicoes`, `respostasEmDuplicidade`, `percentis`.
- `ajudas.js`: `BANCOS` (aponta para a versao ATUAL de cada fluxo), `enderecos(id)`, `post/get` (imitam a tela: mandam `Origin` e JSON).
- `trava_producao.js`: bloqueia qualquer conexao nao-loopback e IPs reais.
- Pastas: `f*.test.js` (Fase 1), `seguranca/` (Fase 2), `instrumentacao/`, `concorrencia/` (c2 a c5, e5 estresse).
- Padrao de achado: `test(nome, { todo: 'ACHADO P3-xx: ...' }, fn)` com a asserção do comportamento esperado.

## Convencoes
- Ao criar versao nova de fluxo: gerador em `nodered/gerador/gerar_fluxos_*.py`, apontar `ajudas.js` e os testes para a nova, rodar a suite, rodar a **mutacao** (copia temporaria do teste apontando para a versao anterior deve falhar), atualizar `BACKLOG_FORA_DE_ESCOPO.md` e `tests/integracao/LEIA-ME.md`.
- Codigos HTTP das rotas de chaves: 403 `D3_*`, 409 `CANCELADO_POR_DESLIGAR`/`ESTADO_MUDOU`, 503 `LEITURA_VELHA`/`AGUARDE_CONFIRMACAO`, 504 `incerto:true`, 500 erro explicito.

## Pacote de entrega
Montar em pasta temporaria (scratchpad), copiar fluxos/front/PLC/docs, gerar `MANIFESTO.sha256` (sha256sum), zipar, descompactar e conferir com `sha256sum -c`, enviar. O simulador (`simulador-dse-demo-v7`) vai em pasta separada e NUNCA para o PC de producao. Documentos de apoio: `docs/bt2/migracao/` (roteiros, checklist de bancada, handoff, roteiro unico de atualizacao pelo notebook).
Script para organizar o notebook como o GitHub: `scripts/notebook/organiza-pastas-bt2.ps1`.
