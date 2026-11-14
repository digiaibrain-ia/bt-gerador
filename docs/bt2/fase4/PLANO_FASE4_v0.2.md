# Plano da Fase 4 - v0.2 (06/11/2026) - AGUARDA OK DO REGINALDO
Muda em relacao a `PLANO_FASE4_v0.1.md` (que continua valendo no que nao for citado aqui).

## Decisoes do Reginaldo (06/11)
1. Regra de seguranca: SB some -> CB cai, T = 2 s. Falha travada, rearma so com novo clique.
2. No DB das Chaves entra tambem o retorno (SB) de **habilitar/desabilitar**, no principio **Request/Response**.
3. O DB das Chaves vai **inteiro** para o PLC do Banco de Carga.
4. Com muita troca de sinais entre PLCs, **reavaliar a melhor comunicacao entre PLCs Siemens** antes de fixar.
5. Numeracao dos blocos: seguir a planilha (`docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v6_exemplo.xlsx`, faixa 3000-3099 por banco; offsets em uso: +0 chaves, +2 setup por tensao, +4 FB100, +5 FB101). Blocos novos entram nos offsets livres da faixa de cada banco (proposta: +6 supervisao, +7 intercambio), que o Reginaldo confirma na planilha.
6. Clique travado: a tela NAO mostrou mensagem. Valores do TIA (`ComOk` etc.): so depois, nos testes de bancada.

## A0 (novo) - Desenho da comunicacao entre PLCs, ANTES do bloco do Portao A
- Contar os sinais por banco na planilha (estimativa: bits de `cb`, `sb`, `hab`, resposta de `hab`, falhas, vida e eco, ate 32 chaves por banco = dezenas de bytes por banco; confirmar na planilha).
- Comparar as opcoes: (a) S7 PUT/GET (hoje); (b) Open User Communication (TSEND/TRCV); (c) PROFINET I-Device (controlador a controlador, ciclico, dado consistente, vigia nativo); (d) OPC UA e Modbus TCP so entram se houver motivo (latencia e complexidade).
- Preciso do modelo exato e do firmware da CPU do PLC do Banco de Carga (hoje ET200/1200 provisorio) para dizer o que ela suporta.
- Recomendacao provisoria: manter PUT/GET na bancada (ja funciona) com o desenho abaixo, que serve a qualquer transporte, e decidir o definitivo com os numeros do A0.

## A1 revisado - regra de ouro: cada campo tem UM dono
- **Bloco Pedido (1500 -> Banco, escrita pelo 1500):** `cb`, `habPed` (habilitar/desabilitar), `seq` (contador do pedido), `vida`.
- **Bloco Resposta (Banco -> 1500, escrita pelo Banco):** `sb`, `habResp` (habilitacao confirmada), `eco` (copia do `seq`), `falhaRetorno`, `contatorColado`, `vida` do banco.
- O 1500 so aceita a resposta se `eco = seq` e a vida do banco mudar (request/response de verdade). "Inteiro" = um DB contiguo por banco, mas cada metade escrita por um lado so; espelhar o DB todo nos dois sentidos faria a copia velha apagar o campo do outro.
- No PLC do Banco: temporizador T = 2 s por chave (SB some -> `cb:=0`, falha travada), contator colado, e **vigia da comunicacao**: se a vida do 1500 parar por mais que o tempo definido, o Banco derruba todos os CB por conta propria (hoje so o lado do 1500 vigia a vida; a seguranca nao pode depender do canal).
- Nenhum bloco existente e sobrescrito; campos novos no fim do DB; backup do TIA antes; OK explicito antes de gerar.

## B - Clique travado (atualizado)
- Sem mensagem na tela: o unico retorno silencioso do clique e `CH_PEND` (chave "em envio"). Hipotese principal: estado preso no medidor. Teste barato: recarregar a pagina (F5) e clicar de novo; se voltar, era estado preso na tela.
- Correcao no v1.10.168: aviso visivel + limite de tempo em `CH_PEND`; teste automatico.

## E - Achados dos fluxos
- Recomendo incluir **P3-E1** (a tela desiste aos 10 s mas o comando ainda executa depois: ligar chave sem o operador esperar). P3-E2 (limpar do registro, risco baixo) fica opcional.

## Fora de escopo / depois
- Valores do TIA do `ComOk`: depois, na bancada.
- Portao D: perguntas explicadas a parte (pasta local; salvar ao fim do ensaio).
