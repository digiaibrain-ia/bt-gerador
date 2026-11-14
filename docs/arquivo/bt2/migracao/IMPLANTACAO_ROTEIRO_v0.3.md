# Roteiro de implantacao BT2 - v0.3 (Portao 2 da Fase 2)

Substitui a v0.2 para as partes de **fluxos do Node-RED** e **variaveis**. As etapas de renumeracao do PLC (v0.2) continuam valendo.

**Estado: versoes preparadas no repositorio, NAO importadas no PC.** Testadas no Node-RED de teste (suite: 80 testes).

## 0. Antes de tudo (obrigatorio)
1. Backup do PC (ver `backup-bt2-20261103-pre-portao2/MANIFESTO.md`): exportar todos os fluxos, copiar `settings.js`, `flows_cred.json`, a pasta `.node-red` e `public/html/`.
2. Anotar os valores atuais das variaveis de cada aba.
3. A TI valida o `settings.js` (login do Node-RED ativo) e as variaveis de ambiente.

## 1. Variaveis do PROCESSO (PM2), uma vez
Preencher `config/pc-bt2.env.example` (copia fora do Git) com `PLC_IP` e `DSE_URL` e carregar no PM2 **antes** de subir o Node-RED.
- Sem `PLC_IP`: os enderecos ficam `${PLC_IP}`, que nao e uma rede valida. A conexao falha sem ir a lugar nenhum (falha segura).
- Sem `DSE_URL`: o cliente do DSE fica sem endereco e a consulta falha sem ir a lugar nenhum (falha segura).

## 2. Fluxos a importar (nesta ordem; apagar antes as abas com o mesmo nome)
| Arquivo novo | Substitui | Observacao |
|---|---|---|
| `chaves-56-api-v3.1.json` | `chaves-56-api-v3.0` | enderecos por `${PLC_IP}` |
| `chaves-400-api-v3.1.json` | `chaves-400-api-v3.0` | idem |
| `chaves-550-api-v1.2.json` | `chaves-550-api-v1.1` | idem |
| `chaves-595-api-v1.2.json` | `chaves-595-api-v1.1` | idem |
| `registro-ensaio-db2100-api-v1.6.json` | `registro-ensaio-db2100-api-v1.5` | idem |
| `cliente-156-dse-plc-carga-v3.json` | `cliente-156-dse-plc-carga-v2` | idem |
| `cliente-31-seletor-plc-db2000-v4.json` | `cliente-31-seletor-plc-db2000-v3` | DSE vem de `DSE_URL` |
| `servidor-deepsea-api-gerador-v3_7.json` | `servidor-deepsea-api-gerador-v3_6` | so textos (sem mudanca de logica) |

`dev-logs-api-v1.1.json` nao muda. **Nao importar `simulador-dse-demo-v6` no PC de producao.** Ele so vai para a bancada de teste.

## 3. Simulador de bancada (D4)
- A aba do simulador tem `BT2_BANCADA=0`. Com 0 ele responde **404** e nao comanda o PLC.
- No PC de producao: **conferir no editor que nao existe a aba "Simulador DSE (Demo)"**. Se existir, apagar antes de implantar.

## 4. Depois de importar
1. Deploy. Conferir `GET /api/chaves/56` (deve responder 200 com o PLC real) e o chip "PLC" do medidor.
2. Conferir o cliente do DSE (cliente-31): a consulta sai de `DSE_URL`.
3. Se algo nao responder, voltar a versao antiga com o backup do passo 0.

## Limites
- Os testes rodam com o PLC simulado. O comportamento no PC real (driver S7 e variaveis do PM2) precisa de validacao da TI.
- Pendente (Portao 3): verificacao de `Origin` e de `Content-Type` nas rotas de escrita. Ainda nao implementado.
