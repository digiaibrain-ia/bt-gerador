# PRM-006 · O comando em lote das chaves é tudo ou nada e nunca passa do limite

- **Módulo:** rota `POST /api/chaves/{banco}/lote` dos fluxos `chaves-56-api-v3.12`, `chaves-400-api-v3.11`, `chaves-550-api-v1.12` e `chaves-595-api-v1.12` (Node-RED)
- **Quem revisa a promessa:** Reginaldo
- **Estado da promessa:** verificada em PLC simulado · **não validada na bancada**

## A promessa
Um lote `{ "ligar": [...], "desligar": [...] }` é **tudo ou nada**: se uma chave a ligar não pode (desabilitada, banco desligado, contator colado, sem confirmação do PLC do banco, Setup em andamento), o lote inteiro é recusado e **nada é escrito**. Em modo `recusar`, o total do conjunto (carga comandada, reservas em voo e outros bancos) nunca passa de 110 % do kW a 100 % do gerador ([PRM-004](PRM-004_limite_de_capacidade_nunca_e_passado.md)); dois lotes simultâneos não estouram o limite. **Desligar nunca é recusado**, e um lote só de desligar passa sempre. Os bits são escritos um a um, desligar primeiro e depois ligar, e uma leitura de volta confere todas as chaves (senão 504 "incerto"). Um "Desligar banco" aceito depois cancela o lote que espera na fila.

## O que NÃO é prometido
- Que as chaves mudem **no mesmo ciclo do PLC**: os bits chegam um a um (rápido, mas em sequência). A mudança simultânea só vem com a máscara no PLC (rascunho, não compilado).
- O tempo real de escrita e leitura, e que isso reduza os erros do Patamar: só a bancada mede.
- Que o medidor use o lote: **ainda não usa**.

## Verificado por
| Teste | Onde | O que prova |
|---|---|---|
| `zz_lote.test.js` | `tests/integracao/fase4/` | caminho feliz, validação, tudo ou nada, D3 e leitura velha, capacidade (conjunto e simultâneos), velocidade, cancelamento por Desligar banco, banco de 18 chaves; contra-prova na versão sem a rota |
| `capacidade_reserva.prop.test.js` | `tests/propriedades/` | com o PLC "congelado" a carga aceita por qualquer sequência de lotes nunca passa do limite, e lote recusado não deixa rastro |
| `lote_mascara.prop.test.js` | `tests/propriedades/` | o modelo da máscara equivale ao lote bit a bit (conformidade do SCL futuro) |

## Se a promessa falhar
O medidor (quando usar o lote) mostra o motivo da recusa (400, 409, 503 ou 504). Em 504, conferir o estado das chaves antes de repetir. Voltar ao comando por chave (`POST .../ligar`) continua funcionando.

## Provado × não provado
- Provado (PLC simulado): as regras acima; um lote de 8 chaves levou 473 ms contra 4.805 ms de oito comandos em sequência.
- Não provado (depende da bancada): tempos reais, os 504 do Patamar, e o PLC e o ET200 reais.
