# Roteiro de implantação BT2 — v0.11 (10/11/2026)

Substitui a v0.10 (e anteriores), mantidas só para histórico. **Mudança da v0.11: o catálogo de ferramentas (só desenvolvimento) passou a ser `catalogo_ferramentas.js` (sem versão no nome), gerado a partir dos arquivos da pasta; o documento não cita mais o número do medidor: vale o único `medidor_gerador_v*.html` da pasta.** **Mudança da v0.9: o front da OPERAÇÃO é só o medidor atual + `catalogo_modelos_v0.1.csv` (pasta `03_front_operacao`); index, catálogo de ferramentas, `menu_dev` e as ferramentas de desenvolvimento ficam na pasta `06_front_desenvolvimento`, que NÃO vai para o PC de operação.** **Mudança da v0.8: o `fb100_setupChaves` v0.4 entra no 1515 (decisão do Reginaldo, 10/11/2026); o FB102 v0.2 (só BC59,5) NÃO sobe.** **Mudança da v0.7: só existem os bancos BC56 e BC400; os testes com gerador ligado serão só neles. Os blocos de PLC (pasta `plc/`) cobrem só BC56 e BC400 (PLC de cargas 1200 com o `fb_bancoCarga16` completo).** **Estado: tudo preparado e testado no repositório com PLC simulado (300 testes, 294 passam, 0 falham, 6 `todo` conhecidos). NADA foi importado no PC BT2, no PLC ou no DSE. Nada aqui foi validado em PLC real nem compilado no TIA.**
Regras (CLAUDE.md): backup antes de tudo; uma aba por vez; **carga de potência sempre DESACOPLADA** em teste; o simulador (`simulador-dse-demo-v7`) nunca vai para o PC de produção; nenhum IP, senha ou token no Git (endereços vêm de variável do PM2: `PLC_IP`, `DSE_URL`); qualquer mudança em PLC ou Node-RED de produção só com backup e **OK explícito do Reginaldo**.

## 1. O que muda
| Parte | Versão | Observação |
|---|---|---|
| Medidor (HTML) | o arquivo `medidor_gerador_v*.html` + `catalogo_modelos_v0.1.csv` (operação); ferramentas de desenvolvimento à parte | ⚙ Modo › "Perguntar ao final do ensaio"; menu ☰ só no desenvolvimento |
| Fluxos de chaves | `chaves-56-api-v3.5`, `chaves-400-api-v3.5`, `chaves-550-api-v1.6`, `chaves-595-api-v1.6` | regra "SB some → CB cai"; **leem DB3000/3100/3300/3200** (DBs renumerados) |
| Outros fluxos | `registro-ensaio-db2100-api-v1.8`, `dev-logs-api-v1.3`, `cliente-156-dse-plc-carga-v3`, `cliente-31-seletor-plc-db2000-v4`, `servidor-deepsea-api-gerador-v3_7` | **leem DB2000/DB2100** (renumerados) |
| Somente bancada | `simulador-dse-demo-v7` | NUNCA no PC de produção |
| PLC | pasta `plc/` (rascunhos, não compilados): lado do 1515 (BC56 e BC400, com `fb100_setupChaves` v0.4) e blocos do PLC de cargas 1200 (`fb_bancoCarga16`, `fb_supervisaoChaves16`, DBs 3007/3107, `fc_bancosCarga1200`) | quem carrega: Reginaldo / programador |

## 2. Ordem (com pontos de parada)
1. **Backup**: TIA (1515 e ET200; e o 1200 quando existir) e Node-RED exportado (fluxos, `settings.js`, `flows_cred.json`, `public/html`). Guardar as versões antigas.
2. **Etapa 1 do PLC (só no 1515): renumerar os DBs** conforme `PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx`: DB52 → 2000, DB53 → 2100, DB150 → 3000, DB152 → 3002, DB158 → 3100, DB160 → 3102 (e instâncias). Na mesma janela, trocar o `fb100_setupChaves` para a **v0.4** (mesma interface da v0.3; 3 correções: `NumChaves` limitado a 16, chave desabilitada ou de reserva com `CbLigar` zerado a cada ciclo, Salvar com kW real ≤ 0,05 grava `SetupOk` = FALSE e R = 0). **Parada:** conferir os números no TIA. Daqui em diante o Node-RED antigo deixa de ler: **o fluxo novo entra logo depois** (o PLC e o Node-RED mudam juntos).
3. **Variáveis do processo (PM2):** `PLC_IP`, `DSE_URL` (modelo em `04_config/pc-bt2.env.example`; a TI preenche). Reiniciar o Node-RED.
4. **Importar os fluxos, uma aba por vez** (apagar antes a aba de mesmo nome; manter o arquivo antigo para voltar). Depois de cada Deploy, conferir o `GET` (ver o checklist, bloco 1). Ordem: `chaves-56` → `chaves-400` → `registro-ensaio` → `dev-logs` → `cliente-156`, `cliente-31`, `servidor`. **`chaves-550` e `chaves-595` só quando esses bancos existirem** (hoje só BC56 e BC400; sem o banco a tela mostraria "banco sem leitura").
5. **Medidor (operação):** copiar o conteúdo de `03_front_operacao` (o arquivo `medidor_gerador_v*.html` e `catalogo_modelos_v0.1.csv`) para `public\html`, na mesma pasta (sem apagar as versões anteriores), e abrir pelo endereço do servidor (não por arquivo). O gráfico já vem embutido no medidor (botão "Analisar"). **Não copiar** a pasta `06_front_desenvolvimento` para o PC de operação (index, catálogo de ferramentas, menu ☰, gerenciador de logs, mapa, maquete, visor, simulador de amostras).
6. **PLC de cargas 1200 (BC56 e BC400):** com os blocos da pasta `plc/` (BC550 e BC59,5 não têm blocos nesta entrega) (rascunho; o programador compila e confere o que está marcado "CONFERIR no TIA": `PEEK`/`POKE`, `Remote` em `VAR_INPUT`, offsets, ID da conexão S7). **Parada:** `ComOk` TRUE, `RespEcoOk` TRUE, `vidaET` mudando.
7. **Checklist de bancada** (`CHECKLIST_BANCADA_v0.8.md`), com a carga desacoplada.

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
