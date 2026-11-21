# DEC-012 · Leitura do DB em blocos de byte e comando em lote por bit agora; máscara no PLC depois

- **Data:** 2026-11-21
- **Quem decidiu:** Reginaldo pediu a direção (tratar as chaves como WORD, atenção ao atraso entre as chaves do Patamar, manter o FB em JavaScript ou do PLC); os detalhes foram decididos por critério e pontuação durante a implementação, e **ficam para o Reginaldo confirmar**
- **Estado:** **parcialmente revista** · item 1 (leitura em blocos) sem ganho de requisições (ver Correção) · lote por bit e máscara mantidos · **não validada na bancada**
- **Versão onde vale (revista):** lote nos fluxos **v3.13 (BC56), v3.12 (BC400), v1.13 (BC550 e BC595)**, feitos sobre as versões de ANTES da leitura em blocos. As versões v3.11/v3.10/v1.11 (blocos) e v3.12/v3.11/v1.12 (lote com blocos) ficam no repositório como histórico e **não são recomendadas**

## Contexto
Os erros de leitura aparecem durante o Patamar, que muda várias chaves em sequência. O Node-RED lia 124 itens do DB a cada 200 ms (118 eram um bit cada) numa conexão que as escritas dos comandos também usam, e o Patamar manda um POST por chave, cada um esperando a sua vez e a leitura de volta.

## Decisão
1. **Leitura em blocos de byte** (124 → 8 itens por ciclo), com um nó que devolve os bits com os mesmos nomes; **escritas continuam bit a bit**, por nome, num endpoint próprio.
2. **Comando em lote** `POST /api/chaves/{banco}/lote`: um degrau do Patamar num comando só, tudo ou nada, com a capacidade conferida para o conjunto. Contrato: [CONTRATO_HTTP_COMANDO_EM_LOTE_v0.1](../contratos/CONTRATO_HTTP_COMANDO_EM_LOTE_v0.1.md).
3. **Escrever o comando como WORD pelo Node-RED: não.** O PLC também escreve nesses bits (o FB101 zera `CbLigar[]`), e um cache atrasado religaria chave que o PLC acabou de derrubar. A forma segura é a **máscara aplicada pelo PLC** (duas palavras e um contador), que fica como rascunho SCL com modelo em JavaScript provado; os fluxos ainda não a usam.
4. **O medidor ainda não usa o lote**: só depois de o lote ser validado na bancada. A pausa entre degraus continua com quem executa o Patamar (FB em JavaScript hoje; um bloco do PLC no futuro) e o contrato da API não muda.

## Por quê
A leitura em blocos e o lote atacam as duas causas visíveis no código (muitos pedidos miúdos e comandos em série) sem tocar no PLC nem nas regras de segurança. A escrita por WORD pelo Node-RED reabriria o risco de ler e reescrever. Trocar o medidor antes da bancada mexeria em estado de tela e em testes e2e sem prova real.

## O que isso muda
Fluxos novos de chaves (as versões anteriores ficam intactas). Uma conexão S7 a mais por banco. Nenhuma rota existente mudou de resposta. Ver [Passo 10](../auditoria/PASSO_10_LEITURA_EM_BLOCOS_E_LOTE_v0.1.md).

## Como conferir
`tests/propriedades/leitura_blocos.prop.test.js`, `tests/integracao/fase4/zz_lote.test.js` (com contra-prova na versão sem a rota), `tests/propriedades/capacidade_reserva.prop.test.js` e `tests/propriedades/lote_mascara.prop.test.js`.

## Provado × não provado
- Provado (PLC simulado): a leitura nova é idêntica à de antes nos 4 bancos; leitura inválida não atualiza o cache; o lote é tudo ou nada, respeita a capacidade, é cancelado por um Desligar banco e termina muito antes de comandos em sequência.
- Não provado (depende da bancada): que isso reduz os erros de leitura e os 504 do Patamar; o tempo real de ciclo; os recursos de conexão do 1515; o SCL (não compilado).

## Correção (21/11/2026, mesmo dia)
Ao ler o código do `node-red-contrib-s7` 3.1.3 (`@st-one-io/nodes7` 1.1.x) vi que a biblioteca **já agrupa itens vizinhos**: os 124 itens de antes já saíam em 1 a 3 requisições, e os 8 itens em blocos geram **as mesmas** requisições. **Revogo a decisão 1** (leitura em blocos) como medida de desempenho: ela só troca comparações no Node-RED e acrescenta uma conexão S7 por banco. Decisões 2 a 4 (lote, máscara no PLC, medidor depois) continuam. O lote deve ser reconstruído sobre os fluxos **sem** a leitura em blocos antes de ir para a bancada.

## Reconstrução (21/11/2026)
O lote foi gerado de novo sobre os fluxos sem a leitura em blocos (`nodered/gerador/gerar_lote_v0.2.py`): **chaves-56 v3.13, chaves-400 v3.12, chaves-550 v1.13, chaves-595 v1.13**. O nó de reserva e a rota são idênticos aos da versão com blocos; cada fluxo volta a ter 2 endpoints S7. Ver [análise da comunicação S7](../auditoria/ANALISE_COMUNICACAO_S7_E_GATEWAY_v0.1.md).
