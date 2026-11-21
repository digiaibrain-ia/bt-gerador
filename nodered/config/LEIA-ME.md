# nodered/config — parâmetros do backend que não são segredo

## bancos_capacidade.json (Passo 5, C1)
Espelho versionado da capacidade dos bancos e do limite de carga do gerador.

| Campo | O que é |
|---|---|
| `pctLim` | limite de segurança em % do kW a 100 % (padrão provisório 110, o mesmo `G.pctLim` do medidor) |
| `gerador.kw100` | kW a 100 % do gerador em ensaio. `null` = limite **não avaliado** |
| `bancos.<rota>.chaves_kw` | kW de cada chave, na ordem física (posição n = índice n da rota) |

**Verdade e espelho:** o kW de cada chave vive no PLC do banco (`setup.nominal[]`); o Node-RED lê esse valor em todo ciclo. Este arquivo é o **espelho**: serve de padrão quando o PLC não devolve o valor e para detectar divergência. O teste `v_capacidade_c1` confere o arquivo contra o medidor (`BANCOS`, `pctLim`) e contra o fluxo.

**Como o Node-RED carrega:** ao subir, cada fluxo de chaves lê o arquivo indicado pela variável `BT2_CAPACIDADE_JSON` (padrão `nodered/config/bancos_capacidade.json`, relativo à pasta em que o Node-RED roda). Se faltar ou estiver inválido, usa o padrão embutido no fluxo e avisa no log. Para mudar um parâmetro: edite o arquivo, versione e reinicie o Node-RED (sem reimportar fluxo).

**C1 só registra:** o fluxo **não recusa** nenhum comando por causa do limite. Quando `gerador.kw100` está preenchido e a carga comandada passaria de `kw100 × pctLim / 100`, grava `LIMITE_EXCEDIDO` no log do banco (`GET /api/logs/<banco>`). A recusa (HTTP 409) é o C2, só com aprovação do Reginaldo e teste de bancada.

**Segredos:** nada aqui é segredo. Não colocar senha, token ou chave.
