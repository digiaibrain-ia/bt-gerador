# Consolidação do repositório para a implantação (handoff) — v0.6 (10/11/2026)

Substitui a v0.5 (antes chamado "handoff para a TI"). **Mudança da v0.6: o pacote passa a se chamar "pacote de implantação" (a TI é uma das equipes que o usa, junto com a Engenharia e o programador do PLC).** O conteúdo é o mesmo da v1.3. **O `fb100_setupChaves` v0.4 entra no 1515; FB102 não sobe.** **Só existem os bancos BC56 e BC400; blocos de PLC só deles (PLC de cargas 1200 com o `fb_bancoCarga16` completo).** **Código e blocos prontos no repositório (PLC simulado); nada implantado no PC BT2, no PLC ou no DSE.**
**Repositório:** `digiaibrain-ia/bt-gerador`, branch `ccr-4f9e06b7-bw4qef`. O PC BT2 não acessa o GitHub: tudo chega por pacote .zip.

## O que o pacote de implantação traz (`entrega_implantacao_bt2_v1.4`)
| Pasta | Conteúdo |
|---|---|
| `01_fluxos_importar` | `chaves-56/400-api-v3.5`, `chaves-550/595-api-v1.6`, `registro-ensaio-db2100-api-v1.8`, `dev-logs-api-v1.3`, `cliente-156-dse-plc-carga-v3`, `cliente-31-seletor-plc-db2000-v4`, `servidor-deepsea-api-gerador-v3_7` |
| `02_somente_bancada` | `simulador-dse-demo-v7` (**NUNCA no PC de produção**) |
| `03_front_operacao` | `medidor_gerador_v1.10.192.html` e `catalogo_modelos_v0.1.csv` (juntos em `public\html`; o gráfico já vem embutido no medidor) |
| `06_front_desenvolvimento` | index, catálogo de ferramentas, `menu_dev`, gerenciador de logs, gráfico, mapa, maquete, visor e simulador de amostras: **só para desenvolvimento; NÃO vai para o PC de operação** |
| `04_config` | `pc-bt2.env.example` (só marcadores; sem endereços reais) |
| `05_documentos` | roteiro v0.9, checklist v0.6, este handoff, análise de conclusão, backlog |
| `plc/` | rascunhos para o Reginaldo/programador (BC56 e BC400: lado do 1515 e PLC de cargas 1200 v0.8): **não é da TI (é da Engenharia e do programador)** |
| `MANIFESTO.sha256` | integridade dos arquivos |

## O que a TI precisa fazer ou decidir
1. **Variáveis do processo (PM2):** `PLC_IP`, `DSE_URL`. Sem elas os endereços ficam `${PLC_IP}` (falha segura: não conecta).
2. **Segurança do Node-RED:** `adminAuth` no `settings.js`; porta acessível só pela rede da planta; (opcional) HTTPS. A guarda de Origin **não substitui login** e DNS rebinding passa nela.
3. **Confirmar a versão do Node-RED do PC** (os testes rodaram na 5.0.9) e do `node-red-contrib-s7` (D-3).
4. **Ordem:** seguir o `IMPLANTACAO_ROTEIRO_v0.9.md`. O PLC e o Node-RED mudam juntos.

## Limites
Provado só com PLC simulado em memória (300 testes, 294 passam, 6 `todo` conhecidos). Não provado: driver S7 real e tempos, compilação no TIA, PLC de cargas 1200, Node-RED do PC. Ver `ANALISE_CONCLUSAO_2026-11-10.md` e `BACKLOG_FORA_DE_ESCOPO.md`.
