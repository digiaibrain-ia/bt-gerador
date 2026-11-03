# Consolidacao do repositorio para a TI (handoff) - v0.1

**Repositorio:** `digiaibrain-ia/bt-gerador`, branch `ccr-4f9e06b7-bw4qef`. **Codigo congelado no commit `51481df`** (depois dele so documentos). Nenhum arquivo foi implantado no PC BT2, no PLC ou no DSE a partir desta entrega.

## 1. O que foi feito (3 fases, todas no repositorio, com PLC simulado)
| Fase | Tema | Resultado |
|---|---|---|
| 1 | Testes de integracao dos fluxos reais (F1-F11) + trava de producao | 68 testes; achados F2-1, F4-1, F4-2 registrados (nao corrigidos) |
| 2 | "Nunca confie no cliente" | IP do DSE fora do front (medidor 1.10.167) e dos fluxos (variaveis); simulador travado por `BT2_BANCADA`; guarda de Origin/Content-Type nas 39 rotas de escrita (403); senha `mwm` documentada como trava de UX |
| 3 | Condicoes de corrida e idempotencia | 8 achados corrigidos (fila de chaves, janela de confirmacao 504, quarentena, registro em duas fases, logs) + estresse; 2 achados novos registrados (P3-E1, P3-E2) |
**Suite final:** 190 testes, 185 passando, 0 falhando, 5 pendentes (F2-1, F4-1, F4-2, P3-E1, P3-E2). Roda em ~9 min (`npm --prefix tests/integracao test`). Cada correcao tem teste que **falha na versao anterior**.

## 2. O que a TI recebe (pacote `entrega_ti_fase3`)
| Pasta | Conteudo |
|---|---|
| `01_fluxos_importar` | `chaves-56-api-v3.4`, `chaves-400-api-v3.4`, `chaves-550-api-v1.5`, `chaves-595-api-v1.5`, `registro-ensaio-db2100-api-v1.8`, `dev-logs-api-v1.3`, `cliente-156-dse-plc-carga-v3`, `cliente-31-seletor-plc-db2000-v4`, `servidor-deepsea-api-gerador-v3_7` |
| `02_somente_bancada` | `simulador-dse-demo-v7` (**NUNCA no PC de producao**) |
| `03_front` | `medidor_gerador_v1.10.167.html`, `catalogo_ferramentas_v0.7.js` (para `public/html`) |
| `04_config` | `pc-bt2.env.example` (so marcadores; sem enderecos reais) |
| `05_documentos` | roteiro v0.5, checklist de bancada, este handoff, fechamento da Fase 3, nota da senha, backlog |
| `MANIFESTO.sha256` | integridade dos arquivos |

## 3. O que a TI precisa fazer / decidir
1. **Variaveis do processo (PM2):** `PLC_IP`, `DSE_URL`. Sem elas os enderecos ficam `${PLC_IP}` (falha segura: nao conecta).
2. **Seguranca do Node-RED:** `adminAuth` no `settings.js`; porta acessivel so pela rede da planta; (opcional) HTTPS. A guarda de Origin **nao substitui login** e DNS rebinding passa nela (rede/nome sao da TI).
3. **Confirmar versao do Node-RED e do `node-red-contrib-s7`** do PC (a suite rodou no Node-RED 5.0.9).
4. **Executar o `CHECKLIST_BANCADA_v0.1.md` em conjunto com a Engenharia de Automacao**, no **PC BT2 fisico com a carga de potencia DESACOPLADA**, e devolver preenchido; ajustar `CONF_JANELA_MS` (BC595) se o item 2.1 pedir. A TI lidera os blocos 0 e 1 (infraestrutura) e acompanha os demais.
5. Importar **uma aba por vez**, conferindo o `GET` de cada rota; manter os arquivos antigos para voltar atras.

## 4. Mudancas visiveis de comportamento (para o suporte)
Novas respostas nas rotas de chaves: 409 `CANCELADO_POR_DESLIGAR` / `ESTADO_MUDOU`, 503 `LEITURA_VELHA` / `AGUARDE_CONFIRMACAO`, 504 `incerto:true` ("conferir o estado antes de repetir"), 403 `D3_*`. O medidor 1.10.167 trata qualquer nao-200 como recusa. Preenchimento do registro leva ~4 s (duas fases).

## 5. Riscos e limites conhecidos (resumo)
PLC simulado (nao o driver/tempo reais); escrita serial e suposicao; reafirmacao limita mas nao elimina tempo de chave ligada por escrita tardia; fila/quarentena so em memoria; **P3-E1** (fila nao falha rapido com PLC mudo) e **P3-E2** (registro sem janela de confirmacao) **nao corrigidos por decisao** ate haver numeros de bancada; F2-1/F4-1/F4-2 e a rota `tensao` inalterados; atomicidade dos dados do DB2100 exigiria mudar o layout (nao feito). Detalhes: `BACKLOG_FORA_DE_ESCOPO.md`.

## 6. Arquivos do PLC (fora desta entrega de Node-RED)
Blocos SCL em `plc/bt2/` (FB100 v0.4, FB102 v0.2, FBs ET200 v0.2 etc.) existem no repositorio, **nao testados em PLC**; a decisao de importar no TIA e do responsavel pelo PLC. A protecao definitiva (intertravamento) deve estar no PLC (item 4 do checklist).
