# DEC-010 · Quando o DSE para de responder, as chaves caem (fail-safe)

- **Data:** 2026-10-27 (decisão original); confirmada em 2026-11-19 na revisão independente
- **Quem decidiu:** Reginaldo
- **Estado:** em uso
- **Versão onde vale:** `fbs_virtuais_v0.14.js` (medidor 1.10.231)

## Contexto
Com o controlador DSE sem resposta, o medidor perde a leitura de frequência, tensão e estado do gerador e fica "cego" sobre a estabilidade da máquina.

## Decisão
Se o DSE não responde, a FB mãe do Patamar **derruba todas as chaves no mesmo ciclo**, desarma e vai para FALHA. Só volta a comandar depois que o operador **arma de novo** (rearme explícito) e **com o DSE respondendo**.

## Por quê
Manter cargas ligadas sem supervisão do gerador arrisca subfrequência, sobrecarga ou dano mecânico. É a filosofia fail-safe do projeto: na dúvida, desliga.

## O que isso muda
O comportamento já existe. A revisão independente de 19/11 aprovou como regra inviolável (ver [revisão independente](../auditoria/REVISAO_INDEPENDENTE_PASSO_7_v0.1.md)).

## Como conferir
`tests/propriedades/fbs_virtuais.prop.test.js` e `tests/fb/fbs_virtuais.test.js` (sequências aleatórias de eventos). Ver [PRM-005](../promessas/PRM-005_fb_mae_so_comanda_com_dse_e_guarda.md).

## Provado × não provado
- Provado: em planta simulada, DSE sem resposta derruba as chaves no mesmo ciclo e nada é comandado de novo até rearmar.
- Não provado (depende da bancada): o comportamento com o PLC e o retorno físico reais.
