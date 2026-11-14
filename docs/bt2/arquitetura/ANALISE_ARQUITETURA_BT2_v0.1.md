# Análise da arquitetura BT2 (v0.1)

Gerada a partir do mesmo modelo de dados do HTML `arquitetura_bt2_v0.5_editavel.html`. Estado em 05/11/2026.

## 1. Quem conversa com quem

| De | Para | Como | Situação | Detalhe |
|---|---|---|---|---|
| Medidor gerador | Guarda de escrita | HTTP | em uso | HTTP + JSON. Leitura (GET) a cada 1 s e comandos (POST) com o cabeçalho Origin da própria página. |
| Gerenciador de logs | Guarda de escrita | — | em uso | HTTP: lê /api/dev/logs e /api/logs/{banco}; POST /api/dev/logs/limpar. |
| Gráfico do ensaio | Guarda de escrita | — | em uso | HTTP (leitura) quando precisa de dados do Node-RED. Os dados do ensaio chegam do medidor por canal do navegador. |
| Ferramentas de apoio | Guarda de escrita | — | em uso | HTTP (leitura) usado pelo visor da API e pelas outras ferramentas de apoio. |
| Guarda de escrita | Node-RED | — | em uso | Pedido aceito segue para os fluxos. |
| PM2 | Node-RED | mantém | em uso | O PM2 mantém o processo do Node-RED em execução. |
| Node-RED | Chaves BC56 · BC400 | — | em uso | Fluxos chaves-56 e chaves-400. |
| Node-RED | Logs de desenvolvedor | — | em uso | Fluxo dev-logs. |
| Node-RED | Registro do ensaio | — | em uso | Fluxo registro-ensaio. |
| Node-RED | Ler gerador (.156) | — | em uso | Fluxo Ler gerador (.156). |
| Node-RED | Deep Sea → REST | — | em uso | Fluxo Deep Sea → REST. |
| Node-RED | Chaves BC550 · BC595 | — | pendente | Fluxos chaves-550 e chaves-595, ainda não importados. |
| Ler gerador (.156) | Deep Sea → REST | HTTP | em uso | GET http://localhost:1880/api/gerador (a cada 2 s no modo automático). |
| Chaves BC56 · BC400 | DB3000 · DB3100 | S7 · 200 ms | em uso | S7 ISO-on-TCP: lê os DBs de chaves e escreve os comandos. |
| Chaves BC56 · BC400 | DB3002 · DB3102 | S7 · 1 s | em uso | S7: lê e grava o Setup por tensão. |
| Registro do ensaio | DB2100 | S7 | em uso | S7: grava o snapshot do ensaio em duas fases. |
| Ler gerador (.156) | DB2000 | S7 | em uso | S7: escreve os dados do DSE no DB2000. |
| Node-RED | SQL Server | assíncrono | futuro | Gravação assíncrona e com nova tentativa: a queda do SQL nunca atrasa um comando. |
| MES Four Elements | DB2100 | OPC | futuro | OPC: o MES Four Elements preenche os Dados de Ensaio (os mesmos campos do preenchimento do registro, gravados no DB2100). O caminho físico do OPC ainda é a definir. |
| PLC 1500 · Ensaio | ET200 / 1200 | PUT/GET | em diagnóstico | PUT/GET de 6 bytes: comando das chaves, vida do 1515 e Ligar banco; retorno com feedback, vida do ET200 e seletora em Auto. Hoje o ComOk está falso. |
| Sinais do DSE | ET200 / 1200 | futuro | futuro | Sinais do DSE para o banco de carga (futuro). |
| ET200 / 1200 | BC56 | — | em uso | Módulo do BC56. |
| ET200 / 1200 | BC400 | — | em uso | Módulo do BC400. |
| ET200 / 1200 | BC550 | — | pendente | Módulo do BC550 (Etapa 2). |
| ET200 / 1200 | BC595 | — | pendente | Módulo do BC595 (Etapa 3). |
| BC56 | Bancos de carga | contatores | em uso | Contatores e chaves de potência. Na bancada a carga fica desacoplada. |
| BC400 | Bancos de carga | — | em uso | Contatores do BC400. |
| BC550 | Bancos de carga | — | pendente | Contatores do BC550. |
| BC595 | Bancos de carga | — | pendente | Contatores do BC595. |
| Deep Sea → REST | DSE (controlador) | Modbus TCP | em diagnóstico | Modbus TCP (unit 10) entre o fluxo Deep Sea → REST e o DSE. Desligado hoje. |
| DSE (controlador) | Gerador | controle | em uso | Controle e medição do gerador. |
| Gerador | Bancos de carga | potência | em uso | Alimentação de potência dos bancos de carga. |

As telas também conversam entre si no mesmo navegador por canais (BroadcastChannel): bt2-dev-obs (logs), bt2-grafico (dados do ensaio) e fbv. Isso não passa pelo Node-RED.

## 2. Rotas do Node-RED, por fluxo

| Fluxo | Leitura (GET) | Comando (POST) | Logs | Situação |
|---|---|---|---|---|
| chaves-56 / chaves-400 (v3.4) | GET /api/chaves/{56/400} | POST /api/chaves/{id}/habilitar · selecionar · salvar · usarKwReal · limpar · ligar · banco · tensao | GET /api/logs/{id} | em uso |
| chaves-550 / chaves-595 (v1.5) | GET /api/chaves/{550/595} | mesmas rotas POST | GET /api/logs/{id} | pendente |
| registro-ensaio (v1.8) | GET /api/ensaio/modo · GET /api/ensaio/snap | POST /api/ensaio/modo · snap/preenchimento · snap/etapa · snap/limpar | — | em uso |
| dev-logs (v1.3) | GET /api/dev/logs | POST /api/dev/log-evento · POST /api/dev/logs/limpar | — | em uso |
| Deep Sea → REST (v3.6) | GET /api/gerador | — | — | em diagnóstico (DSE desligado) |
| simulador-dse (v7) | — | POST /api/simulador/dse | — | só bancada |

## 3. Ferramentas e infraestrutura

| Ferramenta | Para quê | Onde |
|---|---|---|
| Node-RED | 5.0.9 nos testes; versão do PC a confirmar | PC BT2 (.156) |
| PM2 | mantém o Node-RED; pasta C:\pm2-home | PC BT2 |
| TIA Portal | programa o PLC 1500 e o ET200/1200 | notebook |
| GitHub | repositório; o PC BT2 não o acessa (pacote .zip) | nuvem |
| Suíte de testes | 190 testes (Node.js + Playwright), PLC simulado | repositório |
| Navegador | roda as telas HTML; canais bt2-dev-obs, bt2-grafico, fbv | PC e celular |

## 4. Realidade e futuro

| Item | Situação |
|---|---|
| Medidor gerador | em uso |
| Gerenciador de logs | em uso |
| Gráfico do ensaio | em uso |
| Ferramentas de apoio | em uso |
| Guarda de escrita | em uso |
| Node-RED | em uso |
| PM2 | em uso |
| Chaves BC56 · BC400 | em uso |
| Logs de desenvolvedor | em uso |
| Registro do ensaio | em uso |
| Ler gerador (.156) | em uso |
| Deep Sea → REST | em diagnóstico |
| Chaves BC550 · BC595 | pendente |
| Simulador DSE | só bancada |
| DB3000 · DB3100 | em uso |
| DB3002 · DB3102 | em uso |
| DB2100 | em uso |
| DB2000 | em uso |
| PLC 1500 · Ensaio | em uso |
| MES Four Elements | futuro |
| SQL Server | futuro |
| ET200 / 1200 | em diagnóstico |
| Sinais do DSE | futuro |
| BC56 | em uso |
| BC400 | em uso |
| BC550 | pendente |
| BC595 | pendente |
| Bancos de carga | em uso |
| Gerador | em uso |
| DSE (controlador) | em diagnóstico |
| Servidor virtual (.31) | futuro |

## 5. Pontos a confirmar

- **Caminho físico do OPC (MES Four Elements).** O MES vai preencher os Dados de Ensaio por OPC (hoje digitados no medidor e gravados no DB2100). Falta definir se o OPC entra direto no PLC 1500 ou passa pelo Node-RED.
- **Comunicação PLC 1500 ↔ ET200.** ComOk falso: a vida do ET200 não chega ao FB101. Diagnóstico no db3005i_BC56_ComEt200 (ComOk, StatusPut, StatusGet, FalhaPut, FalhaGet).
- **DSE desligado.** O fluxo Deep Sea → REST responde sem dados. Os sinais do DSE para o ET200 são futuros.
- **Versão do Node-RED e PM2 do PC.** O PM2 não respondeu ao pm2 list nesta sessão do notebook (pasta C:\pm2-home).
- **Gráfico do ensaio.** A origem do campo dirUrl ainda não foi verificada.
- **SQL Server.** Futuro: gravação assíncrona, fora do caminho de comando.
- **BC550 e BC595.** Etapas 2 e 3: blocos do ET200/1200 e fluxos v1.5 ainda não importados.
