# Checklist de entrada em produção · medidor 1.10.231 + pacote v1.28 · 19/11/2026

Para o Reginaldo e a TI. **Eu não implanto nada**: nada foi importado no PC BT2, no PLC ou no DSE. Marcar cada item com data e quem fez. Detalhe passo a passo da implantação: `IMPLANTACAO_C2_PASSO6_CHECKLIST_v0.1.md` (e o do C1). Estado dos testes: unitários e propriedades verdes, integração 247 + 3 `todo`, e2e 24 de 25.

## A. Bloqueadores (não entrar em produção sem fechar)
| # | Item | Quem | Status |
|---|---|---|---|
| A1 | Backup do PC BT2 (fluxos, `bancos_capacidade.json`, `public\html`, medidor anterior) e plano de retorno testado | TI | [ ] |
| A2 | Bancada com **carga desacoplada**: PLC/ET200 reais, compilação no TIA, tempos de leitura, ligar/desligar por banco | Engenharia | [ ] |
| A3 | Implantar o pacote v1.28 **em modo `registrar`** (padrão), uma aba por vez, conferindo o log e `GET /api/chaves/<banco>` | TI | [ ] |
| A3b | **Opcional (fecha o F2-1):** copiar `nodered/config/bt2_json_invalido_400_v0.1.js` para a pasta do `settings.js`, acrescentar `httpNodeMiddleware: require('./bt2_json_invalido_400_v0.1.js'),`, reiniciar e testar: corpo `{abc` em `/api/chaves/56/habilitar` deve dar 400 `{"ok":false,"erro":"corpo JSON invalido"}`. Retorno: tirar a linha. Sem isso, o erro de corpo ruim continua 500 (sem efeito de segurança) | TI | [ ] |
| A4 | Alarmes novos na bancada: comunicação aparece até 10 s depois e sai até 5 s depois; segurança é imediato (COM-001/002/003/005, DSE-001/002, CHV-005/006 contra CHV-007/008, CHV-001/004/009) | Engenharia | [ ] |
| A5 | Conferir o catálogo de kW a 100 % do gerador em ensaio e o 110 % (decisão: ficam como padrão) | Engenharia | [ ] |
| A6 | Valores do perfil de combustível contra o datasheet do MWM: 25 % / 10 s (gás), 20 % / 15 s (biometano). Mudar só por revisão explícita | Engenharia | [ ] |

## B. Decisões suas antes de ligar a recusa (C2 `recusar`)
| # | Item | Observação |
|---|---|---|
| B1 | ~~Degrau (BK-AUD-10)~~ **Descartado por decisão do Reginaldo (19/11/2026)** | A única regra de limite é **110 % do kW a 100 % de cada gerador** (o limite é de cada gerador, cada um com a sua conta). Transições entre degraus ficam com o perfil do medidor. `degrau.max_kw` continua `null` (não avaliado); nenhum código a mudar |
| B2 | Passar `"modo": "recusar"` | **Decisão do Reginaldo: o modo é tratado por banco, individualmente** (hoje o arquivo tem um `modo` único para todos).  Só depois de A2 a A5, com carga desacoplada: tentar passar do limite deve dar **409** sem chegar ao PLC; abaixo do limite normal; desligar sempre funciona. Retorno: voltar a `registrar` e reiniciar |
| B3 | O fail-open do C2 (erro interno deixa o comando seguir) é o desejado? | Hoje sim: a segurança final está no PLC |

## C. Riscos conhecidos que entram aceitos (decidir se aceita)
- **BK-AUD-04:** o PLC não limita capacidade; hoje limitam o medidor e o Node-RED.
- **BK-AUD-10 (degrau):** descartado por decisão; só vale o limite de 110 % por gerador.
- **BK-AUD-05:** sem login (a guarda confere origem, não identidade).
- O medidor informa o próprio kW a 100 %; o valor do arquivo sempre vence e há teto (`kw100_max` 1000) e validade (180 s).
- **276 `catch` vazios** no medidor, comentados; 23 envolvem rede. O desligamento de chave que falha não avisa o operador (a chave não é marcada como desligada, a segurança está no PLC).

## D. Pendências de teste (não bloqueiam)
1. ~~JSON malformado devolve 500 em vez de 400 (F2-1)~~ **Fechado em 19/11/2026**: o 500 vem do nó `http in` do Node-RED, não do fluxo; middleware `nodered/config/bt2_json_invalido_400_v0.1.js` + teste F2 (10 de 10) + contra-prova. Falta só a implantação opcional (A3b).
2. ~~E2E `pacote_ia`~~ **Fechado**: menu com 6 itens (esperava 5) corrigido; o OCR falhava por falha do meu servidor de teste (`./tesseract/` na raiz), não do medidor. 3 resoluções, tudo verde.
3. Teste do texto do Setup ("O PLC NÃO confirmou a desmarcação") e demais `todo`.

## E. Congelamento
- [ ] Esteira completa verde (unitários, integração, e2e, build modular, propriedades) no commit entregue.
- [ ] Mutação rodada à mão nos módulos (`node tests/mutacao/rodar_mutacao.js todos`).
- [ ] Hash do HTML 1.10.231 e do pacote v1.28 anotados no `LEIA-ME_ENTREGA`.
- [ ] Depois do go-live: acompanhar o log `LIMITE`/`CAPACIDADE` por 1 semana em modo `registrar` antes de B2.
