# BT2: resumo para a reunião (17/11/2026)

Base: `arquitetura_bt2_v0.6_editavel.html` (3 estilos) e `INFOGRAFICO_CHAMADAS_BLOCOS_v0.7.html`. Tudo abaixo está nos arquivos do repositório; o que foi provado e o que não foi está separado no fim.

## 1. Quem fala com quem
| De | Para | Como | Para quê |
|---|---|---|---|
| Medidor (HTML, PC e celular) | Node-RED | HTTP + JSON. GET a cada 1 s, POST nos comandos. Cabeçalho Origin da própria página | Ler chaves e comandar. Sem IP digitado |
| Guarda de escrita | Node-RED | Confere Origin e Content-Type JSON; 403 se não bater | Impede que outra página escreva |
| Node-RED (PC BT2) | PLC 1500 (ensaio) | S7 ISO-on-TCP; chaves a cada 200 ms, setup a cada 1 s | Escreve o pedido, lê o retorno, grava DB2100 (registro) e DB2000 (DSE) |
| Node-RED | DSE | Modbus TCP, somente leitura | Grandezas do gerador (DSE desligado hoje) |
| Node-RED | RNC (aba própria, opcional) | HTTP; arquivo `rnc.jsonl`, único escritor, chave de idempotência | Registro de não conformidade (switch desligado por padrão) |
| PLC 1500 | ET200 (provisório) | PUT/GET, 24 bytes (DB38/DB39), FB101 | Comando das chaves, vida, Ligar Banco, seq; retorno, vida, eco, falhas |
| PLC 1500 | PLC de Carga 1200 (rascunho) | Mesmo telegrama (DB3007/DB3107), FB101 ComCarga | Igual ao ET200, depois do Retrofit |
| PLC 1500 | PLC de Carga 1200 | PUT de 136 bytes (DB2000), FB104 | Só informação para a tela WinCC; não é comando |
| ET200 ou 1200 | Contatoras | Saídas físicas | Liga as resistências dos bancos |
| MES Four Elements | PLC 1500 | OPC (futuro; caminho físico a definir) | Dados de ensaio |
| Node-RED | SQL Server | Assíncrono (futuro) | Histórico fora do caminho de comando |

## 2. O que combinamos (regras)
- **Escritor único.** Pedido: só o Node-RED, pelo 1515 e PUT. Resposta: só o banco. Saídas: só o FC/FB do banco.
- **Segurança fica no PLC do banco.** Vida do 1515 parada por 2 s derruba todas as saídas e o Ligar Banco. Depois de uma queda, nada religa sozinho: só com o comando caindo e vindo de novo.
- **Retorno da contatora some, a chave cai em 2 s**, com falha travada e rearme só por novo comando.
- **Node-RED:** fila de comandos, revalida ao sair da fila, confirma pelo eco do seq em 2 s; sem eco = 504 e quarentena.
- **FB com STAT, FC só organiza.** Uma chamada por ciclo. DB de instância entregue pronto (.db).
- **Nada vai ao PC, ao PLC 1515 ou ao DSE de produção a partir do repositório.** O PC recebe pacote .zip. Carga de potência desacoplada em qualquer teste. Simulador nunca vai para produção.
- **Comentários da 1200:** `//[F]` funcionamento, `//[M]` montagem no TIA (só 1200 por enquanto).
- **Medidor 1.10.220:** bancos visíveis só os selecionados; alarme inteligente; Patamar manual espera o Aplicar e a carga chegar ao degrau; perfil de combustível (diesel, gás, biometano) com pausa mínima, trava por frequência e descida escalonada.

## 3. Estado de cada parte
| Parte | Estado |
|---|---|
| Medidor 1.10.220, Node-RED (chaves-56 v3.7, chaves-400 v3.6, registro v1.10, logs, DSE), PLC 1500 | Em uso / validados em teste |
| ET200 v0.7 | **Provisório.** Validado na bancada. Retorno = a própria saída |
| PLC de Carga 1200 v0.17 | **Rascunho.** Não compilado no TIA, não testado. Com o Alexandre |
| RNC (rnc-api v1.2) | Pronto em teste, opcional, ainda não importado no PC |
| BC550 e BC595 | Etapas 2 e 3, não importados |
| MES (OPC) e SQL Server | Futuro |

## 4. Provado × não provado
**Provado na bancada (ET200):** 1515 em STOP derruba saídas e Ligar Banco; cabo de rede puxado derruba e só religa com novo comando; telegrama com seq/eco; wiring do `RespEcoOk`.
**Provado em teste automático (PLC simulado):** fluxos Node-RED, medidor, RNC, perfil de combustível. Isto não prova o PLC real.
**Não provado:** qualquer bloco da 1200 no TIA ou no 1214FC; contato auxiliar real; contator colado.

## 5. Pendências e riscos para falar na reunião
1. Heartbeat explícito para o 1515 em STOP (BK-PLC-02): aguarda OK e bancada.
2. O PLC ainda não limita capacidade nem degrau (BK-AUD-04 e 10): hoje só medidor/Node-RED.
3. Sem login (BK-AUD-05): a guarda confere origem, não identidade.
4. Valores de gás e biometano: confirmar com o datasheet do gerador.
5. Compilar a 1200 e ligar os tags reais (Alexandre).
6. RNC: importar e testar com PLC real; espelho no SQL só depois.
7. Cliques muito rápidos podem dar 504 (janela de 2 s, ajustável, não alterada).
8. Caminho físico do OPC do MES; versão do Node-RED e PM2 do PC a confirmar.
