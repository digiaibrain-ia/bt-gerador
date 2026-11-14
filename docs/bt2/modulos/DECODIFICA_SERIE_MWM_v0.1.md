# Decodificador de número de série MWM v0.1

Arquivo: `dashboard/modulos-fonte/decodifica_serie_mwm_v0.1.js` · Teste: `tests/serie/decodifica_serie_mwm.test.js`

Normas: ETD 091 rev.05 (gerador) e ETD 094 rev.00 (torre de iluminação).

## Formato
- Gerador: 9 caracteres = combustível, motor, alternador, controlador + 5 dígitos.
- Torre: 8 caracteres = fonte de energia, motor, alternador + 5 dígitos.
- O código de barras vem com `*` nas pontas; `Ø` (zero cortado) vale `0`.

## Uso
```js
const { decodificaSerie } = require('./decodifica_serie_mwm_v0.1.js'); // no navegador: window.MWM_SERIE
const r = decodificaSerie('*DTMFØ4447*', { dataFabricacao: '2026-11-14' });
// r.valido, r.tipo, r.combustivel.descricao, r.motor, r.alternador, r.controlador, r.sequencial, r.avisos, r.erros
```

## Regras
- Nunca lança erro. Entrada ruim devolve `valido:false` e `erros[]`.
- Letra fora das tabelas (motor, alternador, controlador) não invalida: `conhecido:false` e um aviso. As tabelas são "não exaustivas" na norma.
- Combustível/fonte fora da tabela I invalida.
- Avisos de data (só com `dataFabricacao`): antes de 29/12/2020 (estrutura antiga) e `G` antes de 14/12/2021 (pode ser biogás).

## Pendências
- ETD 009 (códigos de motor da torre) não foi recebida.
- Estrutura antiga (antes de 29/12/2020) não decodificada.
- Formato de entrega do MES (campo, data de fabricação) ainda não definido.
- Ligação ao registro de ensaio (`serie`) fica para versão nova do fluxo, depois do OK.
