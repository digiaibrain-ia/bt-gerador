# Contexto do projeto — Bancos de teste de geradores diesel (BT2 / bancos de carga)
Versão 0.1 · 25/10/2026 · Português do Brasil · Use este arquivo como prompt de contexto para IA ou para integrar um novo membro da equipe.

## 1. Para que serve o sistema (explicação para não técnicos)
O sistema mede e controla bancos de teste de geradores diesel. Um **banco de carga** é um conjunto de resistências (chaves) que consome a energia do gerador durante o ensaio, para simular uma carga real. Cada chave tem uma potência de identificação em kW (ex.: 3 kW, 4 kW, 5 kW).

O sistema responde a três perguntas:
1. **Quanto de carga o gerador está suportando agora?** (medição do gerador, via DSE e Modbus TCP)
2. **Quais chaves estão ligadas e quanto cada uma consome de verdade?** (Setup das chaves, feito pelo operador com o gerador em START)
3. **O ensaio foi aprovado?** (critérios de tensão, frequência, carga e tempo, conforme o relatório)

O ponto de atenção desta versão: **o kW que está escrito na chave não é necessariamente o kW real**. A identificação só vale numa tensão de referência que ainda não conhecemos. Por isso o sistema mede o kW real de cada chave em cada tensão (220, 380 e 440 V) e estima essa tensão de referência (V ref.). Os cálculos estão em `LOGICA_TRANSFORMACAO_v0.1.md` e no código `calculos_setup_v0.1.js`.

## 2. Arquitetura (fluxo dos dados)
```
DSE (no gerador) --Modbus TCP--> Node-RED do DSE (leitura, mapeamento, API)
                                        |
                                        v
Interface HTML (medidor_gerador_vX.html): medições, cronômetro, registro do operador
                                        |
                                        v  HTTP (/api/chaves/56|400 ...)
Node-RED do PLC (flow chaves-vX.Y.json) --S7 (node-red-contrib-s7)--> PLC dos bancos de carga
                                                                        |
                                                                        v
                  DB150 (BC56) / DB158 (BC400)  +  FB100 (Setup)  +  DB152 / DB160 (Setup por tensão)
```
- **BT1 e BT2 são sistemas distintos.** Nunca misturar tags, DBs ou flows entre eles.
- O HTML não fala com o PLC diretamente: sempre passa pelo Node-RED.

## 3. Mapa de arquivos
| Arquivo | Função | Status |
|---|---|---|
| `medidor_gerador_v1.9.78.html` | Tela do operador (medições, Setup, ensaio) | Versão atual |
| `nodered/chaves-56-api-v2.5.json` | Flow das chaves do banco 56 kW (DB150/DB152) | Proposta, não testada no PLC real |
| `nodered/chaves-400-api-v2.5.json` | Flow das chaves do banco 400 kW (DB158/DB160) | Proposta, não testada no PLC real |
| `plc_bancos_cargas/fb100_setupChaves_v0.3.scl` | Setup no PLC (kW sem carga, kW real, R, espelho por tensão) | Não compilado no TIA |
| `plc_bancos_cargas/db152_BC56_SetupPorTensao_v0.2.db` | Setup por tensão do banco 56 kW | Não compilado no TIA |
| `plc_bancos_cargas/db160_BC400_SetupPorTensao_v0.2.db` | Setup por tensão do banco 400 kW | Não compilado no TIA |
| `ANALISE_FORMULAS_SETUP_E_DB_POR_TENSAO_v0.2.md` | Decisões e pendências do Setup | Atual |
| `CONTRATO_HTTP_HTML_NODERED_CHAVES.md` | Rotas HTTP entre HTML e Node-RED | Atual (bloco v2.5 é proposta) |
| `CONTEXTO_v0.1/DICIONARIO_DADOS_v0.1.md` | Dicionário de dados | Este pacote |
| `CONTEXTO_v0.1/LOGICA_TRANSFORMACAO_v0.1.md` | Regras de cálculo e transformação | Este pacote |
| `CONTEXTO_v0.1/calculos_setup_v0.1.js` | Código comentado dos cálculos, com teste | Este pacote |

## 4. Regras de trabalho (obrigatórias)
1. **Sempre citar o arquivo de origem** ao referenciar uma tag, endereço, DB, rota ou função.
2. **Nunca inventar** endereço, tag, registrador, offset de DB ou rota. Se faltar dado, parar e perguntar.
3. **Separar** sempre: (a) confirmado, (b) assumido/inferido, (c) a desenvolver.
4. **Preservar a arquitetura.** Não refatorar sem pedido explícito.
5. **Não compilar nem testar no PLC** a partir de um arquivo: indicar sempre que o código é proposta até validação no TIA.
6. **Downloads de DB não otimizado** podem reinicializar os dados. Antes de baixar um DB com membros novos, confirmar se já há dados salvos nele.
7. **Versão no nome do arquivo** (`_vX.Y`). Não sobrescrever a versão anterior.
8. Ao propor código, entregar exemplo completo, comentado, com riscos, dependências e como testar.

## 5. Instruções de uso (para a equipe e para IA)
### Para o operador (tela)
1. Abrir o medidor (versão 1.9.78 ou mais nova).
2. Em **Chaves → Setup**, escolher o **chaveamento do banco** (220, 380 ou 440 V) **antes** de selecionar qualquer chave.
3. Ligar o gerador (START). Com todas as chaves desligadas, o sistema mede o "kW sem carga" sozinho.
4. Selecionar uma chave, esperar estabilizar, clicar em **Salvar Chave**.
5. Repetir para as 13 chaves e para as outras tensões.
6. Usar a tabela comparativa para checar se a resistência bate entre as tensões. Se a "Variação de R" estiver perto de 0 %, a premissa vale.
7. **Limpar kW reais** apaga só o chaveamento escolhido.

### Para o time de automação (PLC e Node-RED)
1. Compilar o FB100 v0.3 e os DB152/DB160 v0.2 no TIA, sem alterar os DB150/DB158.
2. Registrar o DB152/DB160 na aba "Blocos_novos" do plano de numeração.
3. Conferir a retentividade do DB152/DB160 no TIA.
4. Importar o flow `chaves-56-api-v2.5.json` **apagando antes a aba v2.4** (rotas iguais; a primeira aba registrada responde).
5. Testar `POST /api/chaves/56/tensao` e conferir `TensaoSel` no DB152 online.

### Para IA que for continuar o trabalho
- Ler antes: este arquivo, `DICIONARIO_DADOS_v0.1.md` e `LOGICA_TRANSFORMACAO_v0.1.md`.
- Não tratar `R teórico` como válido: ele foi removido porque depende de uma tensão de referência desconhecida.
- Não tratar `V ref. estimada` como valor definitivo: é uma estimativa a confirmar na prática.
- Em caso de dúvida sobre tag ou offset, perguntar ao usuário.

## 6. Glossário (para leigos)
- **Banco de carga:** conjunto de resistências que simula a carga elétrica para o gerador.
- **Chave:** uma resistência do banco, ligada ou desligada pelo PLC.
- **Chaveamento:** posição física de ligação do banco (220, 380 ou 440 V). Muda a tensão em que as resistências trabalham.
- **kW de placa (identificação):** potência escrita na chave (ex.: 3 kW). Só vale numa tensão de referência.
- **kW sem carga (base):** consumo do próprio gerador com todas as chaves desligadas.
- **kW real:** consumo medido de uma chave = kW com a chave − kW sem carga.
- **R medido (Ω):** resistência equivalente calculada a partir da tensão e do kW real.
- **V ref. estimada (V):** tensão de referência da placa, estimada a partir do kW medido.
- **Setup:** procedimento de medir o kW real de cada chave e guardar o resultado.
- **DSE:** controlador do gerador que fornece as medições por Modbus.
- **PLC / DB:** controlador industrial e a área de memória onde os dados ficam guardados.
- **Node-RED:** ferramenta que liga o HTML ao PLC e ao DSE por rotas HTTP.
- **S7 / Snap7 / node-red-contrib-s7:** protocolo e biblioteca usados para ler e escrever nos DB do PLC.
