# Proposta: FB mãe + FBs filhos (Manual guiado e Automático) — v0.1

**Status:** PROPOSTA para aprovação. Nada foi criado no PLC. Nomes abaixo são **rótulos de função**, não nomes/números de bloco: a numeração segue `PLANO_NUMERACAO_BLOCOS_PLC.md` e **não será inventada** (pergunta P1).

## 1. Ideia (resumo)
Um FB mãe só **orquestra** (roteiro, estados, quem manda em quem). Cada tarefa fica num FB filho com entradas/saídas claras. Erro ou melhoria = mexe em **um** filho. Os mesmos filhos servem aos três modos; **só muda a origem das entradas**.

## 2. Separação (regra 4)
- **(a) Confirmado:** FB100 `setupChaves` v0.3 e DB152/DB160/DB154/DB162 já existem (`plc_bancos_cargas/`); faixa FB 100–149 = lógica do banco de carga, 1 FB com N instâncias (plano v2); pedido do usuário de FB mãe/filhos e de reuso no automático.
- **(b) Assumido:** que o motor de sugestão e o rodízio serão FB no PLC (hoje só há protótipo em JS a fazer); que o PLC dos bancos (1214) tem folga de memória (200 kB de trabalho, datasheet no plano).
- **(c) A desenvolver:** todos os filhos abaixo (exceto o FB100).

## 3. Filhos propostos (uma responsabilidade cada)
| # | Filho (função) | Entra | Sai | Origem do erro que ele isola |
|---|---|---|---|---|
| 1 | **Modelo/catálogo** | modelo escolhido (kW stand-by, V, Hz, I nom.) | valores nominais do ensaio | dado do gerador errado |
| 2 | **Origem dos dados** | modo + 3 fontes (virtual / DSE / real) | kW, V, Hz "oficiais" + qualidade | mistura de fontes |
| 3 | **Alvos do roteiro** | % do patamar + 100 % do modelo | kW alvo, faixa aceita | conta de patamar |
| 4 | **Motor de sugestão** | kW alvo, chaves habilitadas, limite "nunca acima" | combinação de chaves sugerida, erro previsto | escolha da combinação |
| 5 | **Rodízio/desgaste** | acionamentos e horas por chave | desempate entre combinações iguais | desgaste desigual |
| 6 | **Comando e retorno das chaves** | combinação confirmada, feedback físico | comandada / saída ativa / confirmada (3 estados separados), falha | divergência comando × realidade |
| 7 | **Tempos** | estado do patamar | cronômetros separados (estabilização, patamar, total) | contagem de tempo |
| 8 | **Supervisor de falhas** | qualidade das fontes, tempos | parada segura, alarme | falha de comunicação Modbus/DSE |
| 11 | **Guarda de capacidade (MANDATÓRIO)** | seleção, kW a 100 %, % de segurança | liberada/bloqueada + mensagem | sobrecarga do gerador |
| 10 | **Escalonador de entrada** | seleção confirmada, degrau máx., pausa | passos no tempo | degrau de carga mal dosado |
| 9 | **FB1xx mãe (orquestrador)** | botão do operador, roteiro | passo atual, pedidos aos filhos | sequência |

## 4. Reuso nos três modos
| Entrada \ Modo | Guiado sem DSE | Guiado com DSE | Automático |
|---|---|---|---|
| Origem de V/Hz/kW | gerador virtual ideal (do modelo) | DSE real | DSE real |
| Chaves | reais (PLC) | reais | reais |
| Quem confirma patamar | operador (botão) | operador (botão) | sistema |
Filhos 1, 3–8 **não mudam**; muda o filho 2 (seleção) e quem aciona o 9.

## 5. Visualizador gráfico dos FBs (resposta)
**Recomendo um HTML separado** (`mapa_fbs_vX.html`), pois é ferramenta de engenharia/manutenção, não do operador. Ele leria **uma descrição em JSON** dos blocos (caixas, entradas/saídas, estados) — a mesma descrição que documenta o SCL — e, opcionalmente, valores ao vivo do mesmo canal do medidor. **Só vale construir depois de aprovar a lista de filhos** (senão desenhamos caixas que vão mudar).

## 6. Riscos
Mais blocos = mais interfaces: padronizar um tipo de dados comum (UDT) para entrada/saída; filho nunca comanda saída física exceto o 6; falha do 2 ou do 8 leva a estado seguro (chaves mantidas, sem avançar patamar — **a confirmar com a engenharia**).

## 7. Perguntas (nada será presumido)
- **P1.** Numeração: filhos de lógica do banco ficam na faixa FB 100–149 (por banco) e o orquestrador/tempos na 50–99 (por BT)? Confirme ou indique faixa.
- **P2.** Rodízio: reinício do contador ao "chave trocada" fica no PLC (retentivo) ou no Node-RED?
- **P3.** Estado seguro em falha de DSE durante o guiado: manter chaves como estão ou voltar a zero?
- **P4.** Aprova construir o visualizador separado depois da lista de filhos?

## Glossário
**FB:** bloco de função com memória (instância). **FB mãe/filho:** o mãe chama os filhos. **UDT:** tipo de dado padrão do TIA. **Qualidade:** indicador de que a leitura é confiável.

## 8. Respostas do usuário (27/10/2026)
P1 numeração: seguir o plano de numeração. P2 rodízio: protótipo em JS agora (`rodizio_chaves_v0.1.js`), PLC depois. P3: DSE cai → chaves caem. P4: visualizador separado aprovado (`mapa_fbs_v0.1.html`). Lista de filhos aprovada. Novos requisitos: operador pode trocar a seleção sugerida; tempo entre grupos de chaves (filho 10), parâmetro a aprender com operadores.

## 9. Guarda de capacidade (pedido de 27/10, mandatório)
Filho 11: limite = kW a 100 % do gerador × % de segurança (parâmetro da engenharia; usuário citou ~107–112 %). Seleção **abaixo** do alvo é livre; **acima do limite é bloqueada** com mensagem. Vale para sugestão, seleção do operador e (futuro) automático; é a última barreira antes do filho 6. Sem capacidade informada → bloqueia.
