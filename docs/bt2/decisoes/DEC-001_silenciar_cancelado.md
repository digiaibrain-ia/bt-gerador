# DEC-001 · Silenciar e Reconhecer cancelados

- **Data:** 2026-11-18
- **Quem decidiu:** Reginaldo
- **Estado:** decidida
- **Versão onde vale:** nenhuma (a ideia nunca foi implementada)

## Contexto
No log da bancada de 17/11, `GET /api/gerador → 503` foi 56,5 % dos 7.490 eventos (DSE sem cabo). Foi proposto um botão **Silenciar** (e **Reconhecer**) no diálogo de Alertas e Falhas.

## Decisão
Cancelar os botões Silenciar e Reconhecer que escondem alarme por escolha do operador.

## Por quê
Esconder alarme por escolha do operador é arriscado: o que importa pode sumir junto com o ruído. O problema era repetição, e isso se resolve agrupando (DEC-007), sem esconder.

## O que isso muda
O plano da 1.10.226 deixou de ter Silenciar e Reconhecer. Ficam: filtro automático ([DEC-002](DEC-002_filtro_automatico_banco_fora_do_teste.md)), agrupamento no log ([DEC-007](DEC-007_log_falha_repetida.md)) e o tipo Informação ([DEC-004](DEC-004_tipo_informacao.md)). A área "Repetidas" (só para mostrar) é opcional e não foi feita.

## Como conferir
Não há o que conferir: o recurso não existe.

## Provado × não provado
- Provado: nada a provar.
- Referência: [alarme inteligente v0.2](../modulos/ALARME_INTELIGENTE_v0.2.md).
