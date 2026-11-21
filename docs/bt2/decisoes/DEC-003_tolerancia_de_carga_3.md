# DEC-003 · Tolerância de carga padrão de 3 pontos

- **Data:** 2026-11-17
- **Quem decidiu:** Reginaldo
- **Estado:** em uso
- **Versão onde vale:** medidor 1.10.223 em diante

## Contexto
O padrão era **10** (mudado de 3 para 10 na versão 1.9.29, a pedido do operador). Com ± 10, as faixas dos degraus 100 % e 107 % se sobrepõem (100 ± 10 já inclui 107), e o relógio podia contar antes da carga chegar ao degrau.

## Decisão
Padrão de 3 pontos (o Reginaldo falou em 3,5; a decisão final foi **3**).

## Por quê
Entre 100 % e 107 % a diferença é de 7 pontos. Com ± 3,5 as faixas só se encostam (96,5–103,5 e 103,5–110,5); com 3 há uma folga entre elas.

## O que isso muda
`TOL` e `PARAM_ISO.tol` passam a 3. Quem já salvou parâmetros no navegador ou no PC **mantém o valor salvo**: ajustar o campo em Etapas e salvar.

## Como conferir
Abrir Etapas e ver "Tolerância de carga (± %)" = 3 em instalação limpa.

## Provado × não provado
- Provado: valor inicial 3 e sem erro de JavaScript; a regressão de 14 testes passou.
- Não provado: comportamento no PC BT2 com os parâmetros que já estavam salvos.
