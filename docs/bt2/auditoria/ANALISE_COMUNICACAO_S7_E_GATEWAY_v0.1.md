# Análise da comunicação S7 e da ideia do "gateway S7" · 21/11/2026

Pedido do Reginaldo: pesquisar capacidade, quantidade e velocidade possíveis entre o PLC (TIA Portal) e o Node-RED por S7, e avaliar um "PROFINET virtual": um FB no PLC agrupando os dados num DB de interface, lido por **um** fluxo dedicado que distribui aos demais. Entradas: relatório do ChatGPT (recebido 4 vezes), relatório do Gemini, e o **código real** do `node-red-contrib-s7` 3.1.3 e do `@st-one-io/nodes7` 1.1.x, lido e simulado aqui. **Não consegui abrir as páginas da Siemens** (a rede desta sessão não alcança `support.industry.siemens.com`): todo número de CPU abaixo vem dos relatórios e **não foi verificado por mim**.

## 1. Fatos verificados no código (confiança alta)
| Fato | Onde |
|---|---|
| O pacote depende do `@st-one-io/nodes7` 1.1.x (reescrita). Não é o `nodes7` antigo nem o `node-snap7`. | `package.json` do `node-red-contrib-s7` 3.1.3 |
| **A leitura agrupa itens vizinhos em poucas requisições** (folga padrão de 5 bytes; payload de leitura = PDU − 18, de escrita = PDU − 12). Simulando o agrupamento real sobre o `vartable` do BC56: 124 itens = **1** requisição (PDU 960), 2 (480), 3 (240). Os 8 itens "em blocos" geram **as mesmas** requisições. | `s7itemGroup.js`; `scripts/diagnostico/simula_agrupamento_nodes7_v0.1.js` |
| O ciclo de leitura **pula** se a leitura anterior não terminou; ciclo mínimo 50 ms. | `red/s7.js` (`doCycle`) |
| Escritas são promessas **enfileiradas pela conexão**, com até 8 trabalhos em paralelo (`maxJobs`) e timeout de 2000 ms por requisição (padrão). Uma rajada de escritas **não é descartada** nesta versão. | `s7connection.js` |
| PDU máximo padrão do cliente = 960 (negociado com a CPU: vale o menor). | `s7connection.js` |
| O **504** é gerado pelo nosso nó `confere` (janela de confirmação, padrão 2000 ms), **não** pelo protocolo S7. O endpoint S7 tem outro timeout de 2000 ms: dois relógios competem. | `chaves-*-api` |
| O estado implantado tem **8** endpoints (2 por banco). Só as versões do Passo 10 com a leitura em blocos passaram a ter 12. | fluxos |

## 2. ChatGPT × Gemini × evidência
| Ponto | ChatGPT | Gemini | Meu veredito |
|---|---|---|---|
| Postura | Cautelosa: "não encontrado" onde não achou; "medir antes" | Confiante; vários números com fonte vaga | ChatGPT mais confiável |
| Dependência `nodes7` | Acerta (`@st-one-io/nodes7`) | Não trata | ChatGPT |
| "Escrita em andamento não chama callback" | Cita (é do `nodes7` **antigo**) | Não cita | **Não vale** para a 1.1.x (verificado no código) |
| Nº de endpoints | "12 hipotéticos" | "4 fluxos independentes" | O implantado tem 8 (ver acima) |
| Recursos de conexão do 1515 | 256 total / 128 na CPU | **192** (FAQ 78783481) | **Conflitam**; nenhum verificado. Conferir no TIA |
| PDU S7-1500 | 240/480/960 documentados | "240 a 480" (cita o manual de *tempos de ciclo*, que não trata de PDU) | Fonte do Gemini parece errada; medir (captura da negociação) |
| Taxa "50 a 150 leituras/s por endpoint" | Não afirma | Afirma, fonte "Industrial Monitor Direct / S7 Benchmarking Reference Guide" | **Não verificável**; descarto |
| Consistência / seqlock | Detalha, mas propõe **três leituras separadas** (fraco) | Quase não trata | O correto é **um bloco só** com os dois contadores dentro |
| STOP da CPU com leitura "ok" | Trata (heartbeat) | Só cita heartbeat | ChatGPT |
| PROFINET virtual | Responde: não de forma nativa | **Não responde** | ChatGPT |
| Pontuação | 78 / 72 / 71 / 60 / 60, **aritmética correta** | 81 / 78 / 69 / 67 / 58 (pesos somam 19, não 20; TSEND usa a soma bruta: normalizado seria 72,6) | Ambas são **opinião**, não medição |
| "O gargalo agora é a concorrência de fluxos competindo pelas conexões" | — | Afirma como fato | **Sem evidência** (cada endpoint tem a própria conexão; a simulação mostra que a leitura em blocos não mudou as requisições) |

Os dois recomendam o gateway/DB de interface **para bancada**, e o ChatGPT insiste em medir antes. Concordo com o **desenho** (cabeçalho com versão, contadores, batimento, máscara + contador de pedido, comando aceito ≠ executado), não com a **urgência**.

## 3. O que isso muda no projeto
1. **A leitura em blocos (item 1 do Passo 10) não ajuda e acrescenta uma conexão por banco.** O lote foi reconstruído sem ela (fluxos v3.13, v3.12, v1.13, v1.13 — `gerar_lote_v0.2.py`).
2. **O batimento do 1515 é a peça barata e útil do gateway** (BK-PLC-02, CPU em STOP com leitura "ok"): um contador incrementado por ciclo no DB existente (1 campo) e uma checagem no Node-RED que invalida o cache (503) se ele congelar. Não precisa do DB de interface inteiro.
3. **Máscara + contador: escrever os três campos num único item contíguo** (`SetMask`, `ClrMask`, `Seq`, 6 bytes seguidos) numa só escrita, para o PLC nunca ver contador novo com máscara antiga. Os offsets já propostos (472, 474, 476) são contíguos.
4. **Antes de qualquer gateway, medir** (item A8 do checklist). Sem isso não se sabe se o problema é a biblioteca, a CPU, a rede ou o nosso `confere`.

## 4. Plano de medição (bancada, carga desacoplada)
- **Versão exata** do `node-red-contrib-s7` no PC BT2 (Menu › Gerenciar paleta).
- **Captura Wireshark** `tcp.port == 102` durante um Patamar com erro: **PDU negociado** (quadro "Setup communication"), requisições por segundo, tempo de resposta (p50/p95/p99), retransmissões.
- **TIA**: tempo de ciclo e carga de comunicação da CPU durante o Patamar; recursos de conexão realmente usados (`Cycle load due to communication` só se mexe depois de medir).
- **Os 504 do log** (`GET /api/logs/<banco>`) separados por motivo: leitura de volta do 1515, ou confirmação do PLC do banco (eco e `HabResp`).
- Telemetria de latência por etapa nos fluxos (instante de entrada, escrita, leitura de volta, eco do banco, chave ligada): proposta, **ainda não implementada**.

## 5. Decisões em aberto (do Reginaldo)
- Implantar só o lote (sem blocos) e medir, ou também o batimento no DB existente (pequena mudança no PLC)?
- Quem mede o A8 e quando.
