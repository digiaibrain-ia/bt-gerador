# Roteiro de implantacao BT2 - v0.4 (Portao 3 da Fase 2: guarda de escrita, D3)

Substitui a **v0.3** (mantida para historico). Vale tudo da v0.3 (backup, variaveis `PLC_IP`/`DSE_URL` no PM2, simulador fora do PC de producao); aqui mudam **quais fluxos importar** e entra a **guarda das rotas de escrita**.

**Estado: versoes preparadas e testadas no repositorio; NAO importadas no PC.** Suite: 93 testes, 90 passando, 0 falhando, 3 pendentes (F2-1, F4-1, F4-2 - achados ja registrados, nao relacionados a esta etapa).

## O que a guarda faz (D3)
CORS **nao** protege escrita: um site de fora consegue mandar um POST "simples" (`text/plain`) para o servidor mesmo sem poder ler a resposta, e o comando chega ao PLC. Por isso o **servidor** confere, em toda rota de escrita (POST/PUT/PATCH/DELETE):
1. **Origin** (ou, se nao houver, **Referer**) tem que ser da **mesma origem da pagina** (host igual ao cabecalho `Host`) ou estar na lista `BT2_ORIGENS_OK` da aba.
2. Sem Origin **e** sem Referer -> bloqueia (browser sempre manda um dos dois; so quem nao e browser nao manda).
3. **Content-Type** tem que ser `application/json` (aceita `; charset=...`).

Bloqueio = **HTTP 403** `{ok:false, codigo:'D3_origem_nao_permitida' | 'D3_sem_origem' | 'D3_content_type_invalido'}`; nada e gravado no PLC. Leituras (GET) **nao** mudam. O texto do bloqueio sai no log do Node-RED (`D3 bloqueado: ...`).

## Fluxos a importar (substituem a tabela da v0.3; apagar antes a aba com o mesmo nome)
| Arquivo novo | Substitui | Rotas de escrita protegidas |
|---|---|---|
| `chaves-56-api-v3.2.json` | `chaves-56-api-v3.1` | 8 |
| `chaves-400-api-v3.2.json` | `chaves-400-api-v3.1` | 8 |
| `chaves-550-api-v1.3.json` | `chaves-550-api-v1.2` | 8 |
| `chaves-595-api-v1.3.json` | `chaves-595-api-v1.2` | 8 |
| `registro-ensaio-db2100-api-v1.7.json` | `registro-ensaio-db2100-api-v1.6` | 4 |
| `dev-logs-api-v1.2.json` | `dev-logs-api-v1.1` | 2 |
| `cliente-156-dse-plc-carga-v3.json`, `cliente-31-seletor-plc-db2000-v4.json`, `servidor-deepsea-api-gerador-v3_7.json` | (v0.3, sem mudanca) | 0 (so leitura) |
| `simulador-dse-demo-v7.json` | `v6` | 1 - **so bancada; nao importar no PC de producao** |

## Variavel da aba (opcional): `BT2_ORIGENS_OK`
Cada aba protegida tem `BT2_ORIGENS_OK` vazia (padrao = so a mesma origem). Para liberar outra origem de proposito, preencher na aba com origens separadas por virgula, ex.: `http://painel:1880`. **Nao use `null`** no PC de producao (ver "Limites").

## Depois de importar (conferir no PC, com o medidor aberto por `http://<servidor>:1880/html/...`)
1. O medidor lê e comanda normalmente (as chamadas dele ja saem com Origin e JSON).
2. De outro computador/terminal (sem Origin), um POST de teste deve voltar **403**, por exemplo:
   `curl -i -X POST -H "Content-Type: application/json" -d "{}" http://<servidor>:1880/api/dev/logs/limpar`  (rota de log, sem efeito no PLC) -> `403 D3_sem_origem`.
3. Se algo legitimo for barrado, o log do Node-RED mostra o motivo; voltar a versao anterior (backup) e me avisar.

## Limites (o que a guarda NAO resolve) - para a TI
- **Quem usa a rede sem ser browser** (curl, script) e barrado por padrao; automacao interna que precise escrever teria que mandar `Origin` igual ao servidor (isso nao e autenticacao: so reduz o ataque por pagina web).
- **Nao substitui login.** Continua valendo: `adminAuth` no `settings.js` e protecao de rede (TI). Origin/Content-Type barram ataque **vindo de uma pagina web aberta no navegador do operador**.
- **DNS rebinding:** um site que aponte o proprio nome para o IP do servidor passa na comparacao "Origin = Host". Mitigacao e da TI (nome/rede); a guarda sozinha nao cobre.
- **Medidor aberto como arquivo local** (`file://`) manda `Origin: null` e e barrado. Abrir pelo endereco do servidor. `null` na lista libera tambem paginas isoladas de qualquer site: nao recomendado.
