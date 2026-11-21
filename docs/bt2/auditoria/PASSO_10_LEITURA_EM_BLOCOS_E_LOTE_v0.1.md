# Passo 10: leitura das chaves em blocos, comando em lote e lote por máscara no PLC · 21/11/2026

Pedido do Reginaldo: os erros de leitura acontecem **durante o Patamar** (lotes de chaves), vale tratar as chaves como WORD, há um atraso entre as chaves para compor o patamar, e a opção de rodar com o FB em JavaScript ou, no futuro, com o FB do PLC tem que continuar aberta. As dúvidas foram decididas por critério e pontuação (ver "Decisões"). **Tudo provado em PLC simulado; nada foi validado na bancada e nada foi implantado.**

## O que o código mostrava (antes de mexer)
- Cada fluxo de banco lia **124 itens** do DB a cada 200 ms (o banco de 32 chaves, 236): **118 deles eram um bit cada**. Leitura e escrita dividiam o **mesmo** endpoint S7, então a leitura disputava a conexão com as escritas do Patamar.
- O Patamar executa cada degrau **clicando nas chaves uma a uma**, e cada clique vira um `POST .../ligar` na fila de uma gravação por vez; cada comando espera 450 ms mais a leitura de volta antes de liberar o próximo. O próprio histórico do medidor registra que na troca de etapa ele chegou a disparar **26 POST no mesmo milissegundo** (hoje limitado a 3 por vez no navegador).
- O registro PRM-002 anota que em 17/11 houve **seis respostas 504 em cinco chaves do BC56** (BK-PLC-03): a confirmação do PLC (eco do pacote, em até 2 s) não veio a tempo. **A causa exata só a bancada mostra.**

## Decisões (critério e pontuação, 21/11/2026)
| Dúvida | Opções | Escolha e motivo |
|---|---|---|
| Como ler como WORD/byte | (A) blocos de byte no endpoint de leitura + escrita em endpoint próprio; (B) trocar o endpoint inteiro por blocos | **A.** As escritas usam o nome do bit (`CbLigar3`), que precisa existir no `vartable`; em B elas quebrariam. Custo: uma conexão S7 a mais por banco (checar na bancada). |
| Escrever o comando como WORD pelo Node-RED | (A) ler o cache e reescrever a palavra; (B) manter um bit por escrita; (C) máscaras aplicadas pelo PLC | **B agora, C no futuro.** Em A o PLC também escreve nesses bits (o FB101 zera `CbLigar[]`), e um cache atrasado **religaria** chave que o PLC acabou de derrubar. C é a forma segura de ter WORD (item 3). |
| Leitura inválida | (A) tratar como "tudo desligado"; (B) não atualizar o cache | **B.** O cache envelhece e as rotas respondem 503 `LEITURA_VELHA`; nunca se assume chave desligada por leitura ruim. |
| Ciclo do endpoint de escrita | 200 ms, 500 ms, 10 s | **500 ms.** Só serve para perceber a queda da conexão; 10 s atrasaria a reconexão e poderia falhar um desligar de segurança logo após uma queda. |
| Lote: onde conferir a capacidade | só na entrada; só na saída da fila | **Na saída da fila** (estado fresco, fila serializada), tudo ou nada, com reserva (Passo 9). |
| Lote: trocar o medidor agora | sim; não | **Não agora.** O medidor comanda as chaves clicando em cada uma e isso mexe no estado da tela e nos testes e2e do patamar. A rota fica pronta e provada; o medidor passa a usá-la **depois** de o lote ser validado na bancada. |
| PLC: compilar o bloco | tentar; só rascunho | **Rascunho.** Não há TIA aqui. Entra com modelo em JavaScript provado por propriedades (a conformidade que o SCL tem que cumprir). |

## Item 1: leitura em blocos de byte
Versões novas (as anteriores ficam intactas), geradas por `nodered/gerador/gerar_leitura_blocos_v0.1.py`: **chaves-56 v3.11, chaves-400 v3.10, chaves-550 v1.11, chaves-595 v1.11**.
- Endpoint de **leitura**: os 118 bits viram 2 blocos de byte (`BYTE0.8` e `BYTE458.13` nos bancos de 16 chaves; `BYTE0.16` e `BYTE914.19` no de 32), derivados do `vartable`. **124 → 8 itens** (236 → 8 no BC59,5). Os arrays e o INT ficam como estavam; o ciclo continua 200 ms.
- Endpoint de **escrita** novo (`<p>_epw`, mesmo PLC, ciclo 500 ms) com os 56 itens que o fluxo escreve (104 no BC59,5), por nome, bit a bit. O `s7 out` do DB passa a usá-lo.
- Nó **decodifica blocos** entre o `s7 in` e os nós `confere` e cache: devolve os bits com **os mesmos nomes**, então nada depois dele muda.
- O gerador **falha se o fluxo escrever um nome que não esteja no endpoint de escrita**.
Provas: `tests/propriedades/leitura_blocos.prop.test.js` (13 testes: com memória aleatória o resultado novo é **idêntico** ao de antes nos 4 bancos, leitura inválida não atualiza o cache, todo nome escrito existe, contra-prova com o bit invertido derruba 4 testes) e a bateria de integração inteira rodando contra os fluxos novos no lugar dos antigos: a bateria completa (57 arquivos) foi rodada contra os fluxos do lote (v3.12 etc., que **contêm** a leitura em blocos): **410 passam, 0 falham, 5 `todo`** (os mesmos 5 de antes). Uma rodada isolada só com os fluxos do item 1 foi interrompida aos 14 arquivos, sem falhas, por ser coberta por essa.

## Item 2: comando em lote
Versões novas, geradas por `nodered/gerador/gerar_lote_v0.1.py` sobre as do item 1: **chaves-56 v3.12, chaves-400 v3.11, chaves-550 v1.12, chaves-595 v1.12**. Rota nova `POST /api/chaves/{banco}/lote` com `{ "ligar": [...], "desligar": [...] }`, **tudo ou nada**, na mesma fila, com a capacidade conferida para o conjunto e reserva. Contrato completo: [CONTRATO_HTTP_COMANDO_EM_LOTE_v0.1](../contratos/CONTRATO_HTTP_COMANDO_EM_LOTE_v0.1.md).
Provas: `tests/integracao/fase4/zz_lote.test.js` (12 de 12; a contra-prova na versão sem a rota derruba os 8 testes de execução), `tests/propriedades/capacidade_reserva.prop.test.js` estendido (18 de 18: os 14 de LIGAR viram teste de regressão e passam também no nó anterior, mais 4 do lote; mutação do nó de reserva estendido **84,6 %** (os 44 sobreviventes são em sua maioria equivalentes: o objeto `PADRAO` embutido e a função `kwComandado` do trecho comum, que o nó novo não usa mais, além de fallbacks de lista e de `>=` mascarado pela tolerância de 1e-9)) e a bateria de integração contra os fluxos do lote (a mesma bateria completa: 410 passam, 0 falham, 5 `todo`; unitários e propriedades 317 de 317). Velocidade medida no PLC simulado (escrita de 40 ms): um lote de 8 chaves levou **473 ms** contra **4.805 ms** de oito comandos em sequência (cerca de 10 vezes mais rápido).

## Item 3: lote por máscara no PLC (rascunho)
`plc/bt2/entrega_lote_v0.1/`: `fb105_loteMascara` (até 16 chaves) e `fb106_loteMascara32` (17 a 32), campos novos no fim dos DBs e `COMO_USAR.txt`, **não compilados no TIA**. A regra está em `tests/plc_modelo/modelo_lote_mascara.js` e provada por `tests/propriedades/lote_mascara.prop.test.js` (equivalência com o lote bit a bit, segurança, idempotência) e `tests/plc_modelo/lote_mascara_scl.test.js` (o SCL escreve a regra do modelo). Os fluxos **não** usam as máscaras ainda: adicionar itens de um DB que ainda não existe no PLC quebraria a leitura cíclica.

## O que NÃO está provado e riscos
- **Que a leitura em blocos reduz os erros do Patamar.** É a hipótese mais forte (menos pedidos, leitura em conexão própria), mas só a bancada mede. Medir antes e depois: erros de leitura, 504 e o tempo de um Patamar de várias chaves (checklist A8).
- **Uma conexão S7 a mais por banco** (4 a mais no 1515). Conferir os recursos de conexão da CPU (checklist A8).
- O endpoint de escrita percebe a queda da conexão em até 500 ms (antes 200 ms).
- O lote por bit continua escrevendo as chaves **uma por uma** (cada bit atômico, rápido, mas não no mesmo ciclo do PLC). A mudança **simultânea** só vem com a máscara.
- O medidor ainda não usa o lote; o lote por máscara e o bloco SCL não foram compilados.
