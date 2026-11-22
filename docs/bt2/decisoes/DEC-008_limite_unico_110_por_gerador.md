# DEC-008 · O único limite de recusa é 110 % do kW a 100 % de cada gerador (degrau descartado)

- **Data:** 2026-11-19
- **Quem decidiu:** Reginaldo
- **Estado:** em uso
- **Versão onde vale:** `nodered/config/bancos_capacidade.json` v0.2 e fluxos de chaves C2 (chaves-56 v3.9 em diante; v3.10 com a reserva)

## Contexto
O C2 tinha dois limites possíveis: a capacidade total (kW a 100 % do gerador × 110 %) e um "degrau" (`degrau.max_kw`, quanta carga nova pode entrar em poucos segundos). O degrau estava em branco (`null`) por falta de valor normativo (BK-AUD-10). Chegou a se falar em 30 % como referência, mas as chaves têm tamanhos fixos (5, 10, 50 kW), então um percentual de degrau não se aplica bem.

## Decisão
O **único** limite de recusa é **110 % do kW a 100 % de cada gerador**. Cada gerador tem o seu limite, calculado a partir do seu kW. O degrau está **descartado**: `degrau.max_kw` fica `null` (o código existe, mas não avalia nada). As transições entre degraus ficam com o perfil de combustível do medidor.

## Por quê
Não há valor normativo para o degrau. A operação histórica mostra pouca oscilação na troca de degrau. Chaves de tamanho fixo tornam um percentual de degrau só uma referência, e recusar por ele bloquearia combinações que o operador usa normalmente.

## O que isso muda
Nada no código. O item B1 do [checklist de go-live](../migracao/CHECKLIST_GO_LIVE_v0.1.md) passou a "descartado" e o BK-AUD-10 deixa de ser meta.

## Como conferir
`tests/integracao/fase4/w_capacidade_c2.test.js` e `tests/propriedades/capacidade_c2.prop.test.js` (limite exato, kW do arquivo antes do medidor). Ver [PRM-004](../promessas/PRM-004_limite_de_capacidade_nunca_e_passado.md).

## Provado × não provado
- Provado: com `kw100` conhecido e modo `recusar`, passar de 110 % volta 409; sem `kw100` nada é recusado; desligar nunca é recusado (PLC simulado).
- Não provado (depende da bancada): o kW a 100 % real de cada gerador (catálogo) e o 110 % contra o datasheet.
