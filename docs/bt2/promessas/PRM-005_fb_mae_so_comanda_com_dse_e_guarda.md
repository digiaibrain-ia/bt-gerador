# PRM-005 · A FB mãe do Patamar só comanda com o DSE respondendo e com a guarda liberando

- **Módulo:** `fbs_virtuais_v0.14.js` e `rodizio_chaves_v0.6.js` (medidor 1.10.231)
- **Quem revisa a promessa:** Reginaldo
- **Estado da promessa:** verificada em planta simulada · parcialmente validada na bancada

## A promessa
A FB mãe só comanda chaves **armada**, com o **DSE respondendo** e com a **guarda de capacidade** liberando a seleção final. Se o DSE para de responder, derruba as chaves no mesmo ciclo, desarma e vai para FALHA ([DEC-010](../decisoes/DEC-010_dse_cai_derruba_as_chaves.md)). Depois de uma FALHA de execução (retorno físico não confirmou em 20 s, carga acima do limite ou DSE) nada é comandado de novo até o operador armar e rearmar, e rearmar só com o DSE respondendo. No Patamar manual quem aplica é o operador: a mãe nunca aplica sozinha nem avança a etapa sozinha.
A guarda libera uma seleção só se todas as chaves têm kW válido e a soma **não passa** de `kW a 100 % × percentual / 100` (liberada no valor exato); sem limite configurado nada é liberado.

## O que NÃO é prometido
- O comportamento com o PLC e o retorno físico reais (a planta dos testes é simulada).
- Que o percentual (110 %) e o kW a 100 % do catálogo estejam certos ([DEC-011](../decisoes/DEC-011_perfil_de_combustivel_mantido_ate_o_datasheet.md)).

## Verificado por
| Teste | Onde | O que prova |
|---|---|---|
| `fbs_virtuais.prop.test.js` | `tests/propriedades/` | sequências aleatórias de até 45 eventos numa planta simulada (mutação 69,9 % no que decide; o resto é apresentação) |
| `rodizio_chaves.prop.test.js` | `tests/propriedades/` | a guarda libera exatamente quando cabe; acrescentar chaves nunca libera o que estava bloqueado (mutação 87,5 %) |
| `modulos_entregues.test.js` | `tests/` | o código testado é idêntico ao embutido no medidor |

## Se a promessa falhar
O medidor mostra a FALHA do Patamar com o motivo. Rearmar só com o DSE respondendo.

## Provado × não provado
- Provado: as regras acima, em planta simulada; o código testado é o entregue.
- Não provado (depende da bancada): PLC e retorno físico reais; a prévia da próxima etapa em combinações raras.
