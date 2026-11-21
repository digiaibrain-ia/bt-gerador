# Implantação do C1 (limite de capacidade que só registra) + medidor 1.10.229 · checklist v0.1 · 19/11/2026

Para a TI e a Engenharia. **Eu (a sessão de código) não implanto**: nada aqui foi importado no PC BT2, no PLC ou no DSE. Regras do `CLAUDE.md`: backup antes, uma aba por vez, carga de potência **desacoplada** em qualquer teste, OK explícito do Reginaldo.

## O que muda
| Parte | De | Para |
|---|---|---|
| Fluxos de chaves | `chaves-56 v3.7`, `chaves-400 v3.6`, `chaves-550 v1.7`, `chaves-595 v1.7` | `chaves-56 v3.8`, `chaves-400 v3.7`, `chaves-550 v1.8`, `chaves-595 v1.8` |
| Medidor | 1.10.226 | 1.10.229 |
| Arquivo novo | — | `bancos_capacidade.json` (`04_config/`) |
| PLC / ET200 / DSE / outros fluxos | — | **nada muda** (sem download no PLC) |

O que os fluxos novos fazem a mais: anotam no log do banco (`GET /api/logs/<banco>`) quando a carga comandada passaria do limite e quando o kW do PLC difere do arquivo. **Não recusam comando e não mudam resposta HTTP.** Com `gerador.kw100 = null` (padrão do arquivo) o limite **não é avaliado**: só aparece um aviso no log do Node-RED ("capacidade (C1): kw100 do gerador nao configurado").
O que o medidor novo faz a mais: avisa quando o PLC não confirma o desligamento ao trocar de modo (alerta CHV-009), mostra erro do motor de alarmes como SIS-001 e traz as correções de código das versões 227 a 229 (nenhuma regra nova de comando).

## Antes
1. **Backup**: exportar do Node-RED as 4 abas de chaves (ou o `flows.json`), copiar a pasta `public\html` e o `settings.js`. Guardar os `.json` antigos (v3.7, v3.6, v1.7, v1.7) e o `medidor_gerador_v1.10.226.html`.
2. Colocar `bancos_capacidade.json` numa pasta do PC e anotar o caminho completo. (Sem caminho configurado, os fluxos procuram `nodered/config/bancos_capacidade.json` relativo à pasta onde o Node-RED roda; se não achar, usam o padrão embutido e avisam no log. **Não é erro.**)
3. Carga de potência **desacoplada**.

## Ordem
1. Importar `chaves-56-api-v3.8` apagando antes a aba `Chaves BC56 (API) v3.7` (uma aba por vez). Se usou caminho próprio, preencher a variável da aba `BT2_CAPACIDADE_JSON` com o caminho completo. As variáveis `BT2_ORIGENS_OK`, `WD_HTML_S`, `CONF_JANELA_MS` e `QUARENTENA_MS` voltam com os valores padrão da aba nova: **reaplicar os valores que o PC usa hoje**.
2. Deploy. Conferir no log do Node-RED: `capacidade (C1): config carregada v0.1 (pctLim 110, kw100 null)`.
3. Conferir que o `GET /api/chaves/56` responde igual a antes (mesmos campos) e que o medidor mostra "leitura ok".
4. Repetir 1 a 3 para BC400, BC550 e BC595.
5. Copiar `medidor_gerador_v1.10.229.html` e `catalogo_ferramentas.js` para `public\html` (sem apagar a versão anterior).
6. Teste de bancada (carga desacoplada): ligar e desligar uma chave de cada banco pelo medidor e conferir que o comportamento é o de sempre; `GET /api/logs/<banco>` **sem** entradas novas `LIMITE` ou `CAPACIDADE`.

## Prova do "só registra" na bancada (opcional, carga desacoplada)
1. Copiar o arquivo, editar `"kw100": 10` (limite 11 kW), reiniciar o Node-RED.
2. Pelo medidor ligar chaves do BC56 até passar de 11 kW (5 + 5 + 4 kW): **o comando tem que ser executado normalmente** e aparecer `LIMITE_EXCEDIDO` em `GET /api/logs/56`.
3. Voltar `kw100` para `null` e reiniciar.

## Retorno (rollback)
Apagar as abas novas, reimportar as 4 abas antigas, voltar o medidor 1.10.226 e o catálogo anterior. O arquivo `bancos_capacidade.json` pode ficar (ninguém o lê nas versões antigas). Quem executa: TI com a Engenharia.

## O que NÃO está provado
Compilação no TIA e comportamento no PLC real (esta entrega não mexe no PLC), versão do Node-RED do PC (D-3), nó `file in` com o caminho do PC, tempos reais de leitura. Os testes rodaram contra Node-RED 5.0.9 e PLC **simulado**.
