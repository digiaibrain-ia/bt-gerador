# DEC-009 · O modo "recusar" é um só e só liga depois da bancada

- **Data:** 2026-11-19
- **Quem decidiu:** Reginaldo
- **Estado:** em uso
- **Versão onde vale:** `bancos_capacidade.json` v0.2 (`"modo": "registrar"` por padrão), fluxos de chaves C2

## Contexto
O arquivo de capacidade tem um `modo`: `registrar` (só anota no log quando o limite seria passado) ou `recusar` (o Node-RED responde 409 e não manda o comando ao PLC). Foi levantada a ideia de tratar o `recusar` por banco, individualmente.

## Decisão
**Manter um modo só** para todos os bancos. O padrão é `registrar`. A passagem para `recusar` só acontece **depois da bancada**, com carga desacoplada, e depois de cerca de **uma semana em `registrar`** olhando o log `LIMITE`/`CAPACIDADE`. Modo por banco fica para depois, se a operação pedir.

## Por quê
É o caminho de menor risco: o comportamento não muda na primeira implantação, e os dados reais do log mostram se o limite está realista antes de ele passar a recusar comandos.

## O que isso muda
Nada no código. O [roteiro de implantação](../migracao/ROTEIRO_IMPLANTACAO_REGINALDO_v0.2.md) e o [checklist](../migracao/CHECKLIST_GO_LIVE_v0.1.md) (item B2) trazem os passos e o retorno.

## Como conferir
Depois de mudar para `recusar` e reiniciar o Node-RED, o log mostra `config carregada v0.2 (modo recusar...)`. Na bancada, tentar passar do limite deve dar 409 sem o comando chegar ao PLC, e desligar sempre funciona. Para a corrida de comandos simultâneos, ver [PRM-004](../promessas/PRM-004_limite_de_capacidade_nunca_e_passado.md).

## Provado × não provado
- Provado: os dois modos, em PLC simulado.
- Não provado (depende da bancada): o comportamento real com o PLC e o tempo entre o comando e a chave aparecer ligada.
