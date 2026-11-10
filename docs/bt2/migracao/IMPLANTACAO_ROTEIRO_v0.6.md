# Roteiro de implantação BT2 — v0.6 (10/11/2026)

Substitui a v0.5 (e o `ROTEIRO_ATUALIZACAO_FASE4_v0.1`), mantidas só para histórico. **Estado: tudo preparado e testado no repositório com PLC simulado (300 testes, 294 passam, 0 falham, 6 `todo` conhecidos). NADA foi importado no PC BT2, no PLC ou no DSE. Nada aqui foi validado em PLC real nem compilado no TIA.**
Regras (CLAUDE.md): backup antes de tudo; uma aba por vez; **carga de potência sempre DESACOPLADA** em teste; o simulador (`simulador-dse-demo-v7`) nunca vai para o PC de produção; nenhum IP, senha ou token no Git (endereços vêm de variável do PM2: `PLC_IP`, `DSE_URL`); qualquer mudança em PLC ou Node-RED de produção só com backup e **OK explícito do Reginaldo**.

## 1. O que muda
| Parte | Versão | Observação |
|---|---|---|
| Medidor (HTML) | `medidor_gerador_v1.10.191.html` + `catalogo_ferramentas_v0.7.js` + `menu_dev_v0.2.js` | novo: ⚙ Modo › "Perguntar ao final do ensaio" |
| Fluxos de chaves | `chaves-56-api-v3.5`, `chaves-400-api-v3.5`, `chaves-550-api-v1.6`, `chaves-595-api-v1.6` | regra "SB some → CB cai"; **leem DB3000/3100/3300/3200** (DBs renumerados) |
| Outros fluxos | `registro-ensaio-db2100-api-v1.8`, `dev-logs-api-v1.3`, `cliente-156-dse-plc-carga-v3`, `cliente-31-seletor-plc-db2000-v4`, `servidor-deepsea-api-gerador-v3_7` | **leem DB2000/DB2100** (renumerados) |
| Somente bancada | `simulador-dse-demo-v7` | NUNCA no PC de produção |
| PLC | pasta `plc/` (rascunhos, não compilados): lado do 1515 e blocos do PLC de cargas 1200 | quem carrega: Reginaldo / programador |

## 2. Ordem (com pontos de parada)
1. **Backup**: TIA (1515 e ET200; e o 1200 quando existir) e Node-RED exportado (fluxos, `settings.js`, `flows_cred.json`, `public/html`). Guardar as versões antigas.
2. **Etapa 1 do PLC (só no 1515): renumerar os DBs** conforme `PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx`: DB52 → 2000, DB53 → 2100, DB150 → 3000, DB152 → 3002, DB158 → 3100, DB160 → 3102 (e instâncias). **Parada:** conferir os números no TIA. Daqui em diante o Node-RED antigo deixa de ler: **o fluxo novo entra logo depois** (o PLC e o Node-RED mudam juntos).
3. **Variáveis do processo (PM2):** `PLC_IP`, `DSE_URL` (modelo em `04_config/pc-bt2.env.example`; a TI preenche). Reiniciar o Node-RED.
4. **Importar os fluxos, uma aba por vez** (apagar antes a aba de mesmo nome; manter o arquivo antigo para voltar). Depois de cada Deploy, conferir o `GET` (ver o checklist, bloco 1). Ordem: `chaves-56` → `chaves-400` → `registro-ensaio` → `dev-logs` → `cliente-156`, `cliente-31`, `servidor` → `chaves-550` → `chaves-595`.
5. **Medidor:** copiar `medidor_gerador_v1.10.191.html` e os dois `.js` para `public\html` (os três na mesma pasta; sem apagar as versões anteriores) e abrir pelo endereço do servidor (não por arquivo). Só o Demo não precisa do menu ☰.
6. **PLC, Etapas 2 e 3 (BC550 e BC59,5) e PLC de cargas 1200:** com os blocos da pasta `plc/` (rascunho; o programador compila e confere o que está marcado "CONFERIR no TIA": `PEEK`/`POKE`, `Remote` em `VAR_INPUT`, offsets, ID da conexão S7). **Parada:** `ComOk` TRUE, `RespEcoOk` TRUE, `vidaET` mudando.
7. **Checklist de bancada** (`CHECKLIST_BANCADA_v0.3.md`), com a carga desacoplada.

## 3. Acoplamentos
- Fluxo novo com PLC antigo (DB sem `sbRet` ou DB antigo): leitura falha e a tela mostra "banco sem leitura" (falha segura).
- PLC novo com o fluxo antigo: o fluxo antigo lê DB150: sem leitura. Importar o fluxo novo logo depois.
- FB101 v0.8 / FB103 v0.3 pedem o telegrama novo no PLC do banco (24 B ou 36 B): carregar os dois PLCs na mesma janela.

## 4. Variáveis da ABA (Propriedades da aba)
`BT2_ORIGENS_OK` (vazia; não usar `null`), `CONF_JANELA_MS` (2000; **medir na bancada**, BC595 escreve 33 variáveis), `QUARENTENA_MS` (10000), `WD_HTML_S` (30), `BT2_BANCADA` (0; só 1 no simulador, só bancada).

## 5. Rollback
Recarregar o backup do TIA; reimportar os fluxos antigos; voltar o medidor e os `.js` para a versão anterior. Quem executa: TI, com a Engenharia.

## 6. Limites (o que este roteiro não prova)
Compilação no TIA, driver S7 real e tempos, versão do Node-RED do PC (D-3), `adminAuth`/rede (D-4, D-5: TI), PEEK/POKE com DB dinâmico na CPU do banco, comportamento do PLC de cargas.
