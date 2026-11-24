# Auditoria pelos 5 fundamentos — rodada 2 (código novo da 1.10.219/220) · 17/11/2026

Escopo: **perfil de combustível** (FB `fb_perfil_combustivel_v0.1`), execução encadeada com portão de frequência, descida em degraus, mãe virtual v0.14 e a regra do Patamar manual (1.10.219). Rodada 1 (RNC/D3/idempotência): `AUDITORIA_5_FUNDAMENTOS_v0.1.md` (corrigida na rnc-api v1.2).

| # | Fundamento | Resultado | Prova |
|---|---|---|---|
| 5 | **Testes de integração** | **OK.** Unitário puro do FB (8), mãe v0.14 (+1; falha na v0.13), e2e do gás (7; **falha na 1.10.219**), Patamar manual (4+4), matriz dos modos, fase 4 (132/132), e2e de tela (todos verdes) | comando único na seção abaixo |
| 1 | **Race condition** | **Achado e corrigido.** Clicar **Aplicar duas vezes** reiniciava a cadeia e o "último degrau" voltava a zero: o 2º degrau saía 0,3 s depois (furava a pausa de 10 s). Correção: `ultAddPerfil` é do módulo (não reinicia). Teste: duplo Aplicar na etapa 1 → 5 kW em 13,5 s e 12 kW em 23,4 s (**9,9 s**) | `perfil_combustivel_gas.js` |
| 2 | **Idempotência** | **OK.** Reaplicar o mesmo patamar recalcula o plano a partir do estado atual (não repete chaves já ligadas); a pausa persiste; `Aplicar` com "nada a mudar" não comanda | idem |
| 3 | **Nunca confie no cliente** | **Achado (não corrigido, por escopo):** o perfil e o portão existem **só no HTML**; API de chaves e PLC não limitam a taxa de carga (**BK-AUD-10**). Falha segura no cliente: sem leitura de frequência **não adiciona carga**; sem recuperar, **desiste** | docs/DECISOES… |
| 4 | **Separação de responsabilidades** | **OK.** Regra nova em **módulo puro** (`modulos-fonte/fb_perfil_combustivel_v0.1.js`, sem DOM/relógio); no medidor só um adaptador de ~60 linhas. O medidor monolítico não cresceu em lógica | — |

**Também achados pelo teste (corrigidos):** (a) "liga antes, desliga depois" criava um degrau extra (12 → 32 kW por 1 s num degrau de 8 kW): desligado no perfil gás; (b) a pausa era do Aplicar, não do motor (item 1).

## Comando único (sem produção)
```
node --test tests/fb/*.test.js tests/plc_modelo/*.test.js tests/rnc_core.test.js tests/rnc_core_v1.1.test.js tests/serie/decodifica_serie_mwm_v0.3.test.js
cd tests/integracao && BT2_AMBIENTE_TESTE=local BT2_FASE4_HTML=medidor_gerador_v1.10.220.html node --test fase4/*.test.js seguranca/*.test.js     # + BT2_RNC_FLUXO padrao rnc-api-v1.2
for t in dados_ensaio_ns rnc_area_fila modo_textos_e_bancos alarme_inteligente central_exportar mapa_fbs_no_medidor rnc_e_bancos_visiveis modo_discreto catalogo_trocar_gerador patamar_manual_sem_aplicar patamar_manual_espera_aplicar perfil_combustivel_gas; do MEDIDOR=medidor_gerador_v1.10.220.html node tests/e2e/$t.js; done
```
