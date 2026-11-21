# DEC-011 · Os valores do perfil de combustível ficam como estão até conferir o datasheet

- **Data:** 2026-11-19
- **Quem decidiu:** Reginaldo (com a revisão independente de 19/11)
- **Estado:** em uso · pendente de conferência
- **Versão onde vale:** `fb_perfil_combustivel_v0.1.js`, `rodizio_chaves_v0.6.js`

## Contexto
Os degraus e pausas do gás e do biometano foram **assumidos** como conservadores: gás 25 % de degrau máximo e 10 s de pausa; biometano 20 % e 15 s. Também o limite de 110 % e o kW a 100 % do catálogo são valores assumidos.

## Decisão
**Não mudar esses valores no código agora.** Ficam travados por teste (mudar um deles exige decisão explícita) e entram no [checklist de go-live](../migracao/CHECKLIST_GO_LIVE_v0.1.md) como item de conferência com o datasheet do motor MWM em ensaio. Se o motor real pedir degraus menores, o ajuste é uma revisão explícita de parâmetro.

## Por quê
São valores seguros para motores estacionários, e mexer neles sem o datasheet seria trocar um palpite por outro. Pausa 0 funde os passos no mesmo instante (por desenho) e foi aceita como coerente.

## O que isso muda
Nada no código. Pendência: conferir com o datasheet antes da plena carga.

## Como conferir
`tests/propriedades/perfil_combustivel.prop.test.js` e `tests/propriedades/rodizio_chaves.prop.test.js`.

## Provado × não provado
- Provado: nenhum degrau passa do máximo do perfil; sem leitura de frequência nunca libera mais carga.
- Não provado: que os números batem com o datasheet do motor em ensaio.
