# O que cada módulo crítico promete (para revisão independente) · 19/11/2026

Para o Reginaldo (ou outra pessoa / outra IA) **revisar a promessa**, não o código linha a linha: se a promessa estiver errada, o teste que a prova também está. Cada item diz onde está provado e o que **não** está. Pontuação de mutação: ver `PASSO_7_PROVAR_OS_TESTES_v0.1.md`.

## Guarda de capacidade (`rodizio_chaves` → `guarda`, `podeLigar`, `limiteKw`) — a última barreira no medidor
1. Sem kW a 100 % e percentual de segurança válidos, **nenhuma seleção é liberada**.
2. Uma seleção só é liberada se **todas** as chaves selecionadas têm kW válido (>0), existem no banco e o banco está no cálculo, e a soma **não passa** de `kW a 100 % × percentual / 100` (liberada no valor exato).
3. Acrescentar chaves a uma seleção já bloqueada nunca a libera.
4. `podeLigar` responde como a guarda responderia com a chave a mais e não altera nada.
**Provado em:** `tests/propriedades/rodizio_chaves.prop.test.js`, `tests/fb/rodizio_chaves.test.js`. **Não provado:** que o percentual (110 %, assumido) e o kW a 100 % do catálogo estão certos; que o PLC respeita o mesmo limite (BK-AUD-04).
**Pergunta ao revisor:** a regra "carga abaixo do alvo é permitida, acima do limite é bloqueada" está do jeito que a operação quer?

## FB mãe do Patamar (`fbs_virtuais`) — decide quando comandar chaves no medidor
1. Só comanda armada, com o DSE respondendo e com a guarda liberando a seleção final.
2. DSE sem resposta: derruba as chaves no mesmo ciclo, desarma, FALHA.
3. FALHA de execução (retorno físico não confirmou em 20 s, carga confirmada acima do limite + tolerância, DSE): nada é comandado de novo até o operador armar/rearmar; rearmar só com o DSE respondendo.
4. Patamar manual: quem aplica é o operador; a mãe nunca chama `aplica()` sozinha. Nunca avança a etapa sozinha.
**Provado em:** `tests/propriedades/fbs_virtuais.prop.test.js` (planta simulada), `tests/fb/fbs_virtuais.test.js`. **Não provado:** o comportamento com o PLC e o retorno físico reais (a planta é simulada); a prévia da próxima etapa em combinações raras.
**Pergunta ao revisor:** derrubar todas as chaves quando o DSE cai (decisão de 27/10) é o que a operação quer em todos os casos?

## Perfil de combustível (`fb_perfil_combustivel`) — degraus de gás e biometano
1. Nenhum degrau passa do máximo do perfil (gás 25 %, biometano 20 %); espera mínima entre degraus (10 s / 15 s).
2. **Sem leitura de frequência válida nunca libera o próximo degrau.** Frequência abaixo do mínimo espera; passou pausa + espera máxima, desiste (não adiciona carga).
3. A descida abre cada chave uma vez, da maior para a menor, em grupos de até o passo.
**Provado em:** `tests/propriedades/perfil_combustivel.prop.test.js`. **Não provado (e ASSUMIDO):** todos os números do perfil (curva real do motor: datasheet).
**Pergunta ao revisor:** os valores dos perfis batem com o datasheet do motor a gás e a biometano usado?

## Plano de entrada (`rodizio_chaves` → `planoEntrada`, `picoPlano`)
Cada chave a ligar ou desligar aparece uma vez, em passos ordenados; o degrau máximo vale por passo (com pausa maior que 0); o pico é o maior valor que o plano atinge (ou "infinito" se algum kW usado é inválido, e então a guarda bloqueia).
**Provado em:** `tests/propriedades/rodizio_chaves.prop.test.js`. **Pergunta:** pausa 0 funde os passos no mesmo instante (por desenho): é aceitável?

## Decodificador de série MWM (`decodifica_serie_mwm`)
Nunca falha; só aceita o formato da norma (ETD 091 rev.05 e ETD 094 rev.00); combustível desconhecido invalida; avisos de data. **Provado em:** `tests/propriedades/decodifica_serie_mwm.prop.test.js`. **Não provado:** que as tabelas da norma estão completas (a norma diz "relação não exaustiva").

## O que NENHUM teste automático prova
Compilação no TIA, PLC/ET200 reais, tempos reais de leitura, valores assumidos (110 %, degraus, pausas, debounce de 10 s/5 s), e a intenção da operação. Isso é bancada e decisão sua.

## Decisões da revisão independente (19/11/2026, ver `REVISAO_INDEPENDENTE_PASSO_7_v0.1.md`)
| Pergunta | Decisão | Pendente |
|---|---|---|
| Guarda: "abaixo do alvo permitido, acima do limite bloqueado" | **Sim.** Liberada no valor exato. | Conferir o catálogo de kW a 100 % e o 110 % antes da plena carga |
| FB mãe: derrubar todas as chaves quando o DSE cai | **Sim, regra inviolável (fail-safe).** Rearme explícito do operador. | — |
| Perfil de combustível: valores batem com o datasheet? | **Mantidos como conservadores**, travados por teste. | **Conferir com o datasheet do MWM em ensaio.** Mudança só por revisão explícita |
| Plano de entrada: pausa 0 funde os passos | **Aceitável.** | — |
| Decodificador MWM: avisar (não travar) para código válido e não mapeado | **Aprovado.** | — |

## Promessas acrescentadas no Passo 7b
### Núcleo do RNC (`rnc_core_v1.2`, usado pelo fluxo `rnc-api-v1.2`)
1. Estados só mudam por transição permitida (senão 422); revisão desatualizada dá 409/400.
2. Abrir exige `idempotency_key`: mesma chave e mesmo conteúdo devolve o mesmo resultado (200), conteúdo diferente com a mesma chave dá 409 `CHAVE_REUTILIZADA`; vale também para eventos.
3. Numeração por ano; o estado é reconstruído a partir dos eventos.
**Provado em:** `tests/propriedades/rnc_core_v1.2.prop.test.js` (mutação 99,1 %); o código colado nos nós do fluxo é idêntico ao testado (`tests/modulos_entregues.test.js`). **Não provado:** o armazenamento em disco no PC BT2.

### Nó de capacidade e degrau (C2, `chaves-56-api-v3.9` e iguais nos outros bancos)
1. Só recusa (HTTP 409) em modo `recusar` e só quando o kW a 100 % é conhecido (arquivo > medidor dentro de 180 s); sem kW conhecido nunca recusa.
2. **Desligar nunca é recusado.** Modo `registrar` nunca recusa.
3. Qualquer erro interno deixa o comando seguir (fail-open) e só avisa no log.
4. A soma inclui os outros bancos (leitura de até 5 s); o degrau só conta comandos que seguiram.
**Provado em:** `tests/propriedades/capacidade_c2.prop.test.js` (mutação 92,9 %), código real do nó. **Não provado:** o PLC real, a bancada e o valor do degrau (`max_kw` null). **Pergunta ao revisor:** fail-open (erro interno deixa ligar) é o desejado, dado que a segurança final continua no PLC?

**Decisão posterior (19/11/2026):** o limite do degrau do C2 está descartado; a única regra de recusa é o limite de capacidade (110 % do kW a 100 % de cada gerador). O código de degrau segue inerte com `degrau.max_kw = null`.
