# Passo 7: provar que os testes valem (propriedades + mutação) · 19/11/2026

Autorizado pelo Reginaldo (19/11/2026). Só testes e documentos: nenhum módulo, fluxo ou medidor foi alterado (continua 1.10.231).

## Por quê
"Teste que passa só prova que o código faz o que a IA entendeu", e os testes são da mesma IA que escreveu o código. Duas respostas independentes do autor:
1. **Teste de propriedades (fast-check):** o computador inventa milhares de casos, inclusive absurdos, e confere regras que nunca podem falhar. Quando falha, mostra o menor caso.
2. **Teste de mutação (Stryker):** estraga o código de propósito (`>` vira `>=`, apaga uma linha, inverte um `if`) e conta quantas estragadas algum teste percebe. **Mutante sobrevivente = buraco na prova.**

## Resultado (módulos puros que decidem o que é comandado)
Pontuação de mutação (mutantes mortos ÷ mutantes avaliados; texto de mensagem fora; lento demais para o CI, rodado à mão):
| Módulo | Trecho medido | Antes | Depois | Testes novos |
|---|---|---|---|---|
| `fb_perfil_combustivel_v0.1` (degraus do gás/biometano) | tudo | 69,5 % | **93,7 %** | 18 |
| `decodifica_serie_mwm_v0.3` (série MWM) | tudo | 60,1 % | **92,0 %** | 8 |
| `rodizio_chaves_v0.6` (**guarda de capacidade**, plano de entrada, pico) | linhas 267-358 | 56,0 % | **87,5 %** | 12 |
| `fbs_virtuais_v0.14` (**FB mãe do Patamar**) | só a lógica de decisão (sem o texto/estado dos filhos do mapa) | 45,8 % | **69,9 %** | 18 |
**Nenhum bug de produção foi achado**: todas as propriedades de segurança valem no código atual. O ganho é de **confiança**: antes, 30 a 55 % dos estragos passavam despercebidos; agora a guarda, o plano e a mãe têm prova de que mudar a regra quebra um teste.

## Propriedades provadas (por módulo)
- **Guarda (rodízio):** libera **exatamente** quando não há kW inválido, nem chave fora do cálculo, e o total cabe no limite; **sem limite configurado nada é liberado**; kW inválido (NaN, 0, negativo, texto) bloqueia; **acrescentar chaves nunca transforma bloqueio em liberação**; `podeLigar` = guarda da seleção com a chave a mais e não altera a entrada.
- **Plano de entrada:** cada chave a ligar/desligar aparece **uma vez**, passos em ordem estrita no tempo, e o degrau máximo vale em cada passo.
- **FB mãe (planta simulada, sequências aleatórias de até 45 eventos):** só comanda **armada, com o DSE respondendo e com a guarda liberando**; DSE sem resposta **derruba as chaves no mesmo ciclo** e vai para FALHA; **depois de FALHA de execução nada é comandado de novo** até armar/rearmar; rearmar só em FALHA com o DSE respondendo; desarmada nunca comanda; patamar manual nunca chama `aplica()`; carga confirmada acima do limite + tolerância derruba **uma vez** só.
- **Perfil de combustível:** nenhum degrau passa do máximo do perfil; **sem leitura de frequência nunca libera mais carga**; a descida abre cada chave uma vez, da maior para a menor.
- **Série MWM:** nunca lança erro com qualquer entrada; só aceita o formato da norma; combustível desconhecido invalida, os outros só avisam; avisos de data nos dias certos (2020-12-29 e 2021-12-14).
Valores de segurança **assumidos** (passo máximo, pausa, frequência mínima) ficam travados por teste: mudar um deles exige decisão explícita.

## Achados do processo
1. **O código provado é o que vai no medidor?** O medidor embute cópias dos módulos em `dashboard/src/js`. Novo `tests/modulos_entregues.test.js` compara (sem comentários nem espaços) o módulo testado com a cópia entregue: rodízio e FB mãe **são idênticos**. Qualquer divergência futura derruba o teste. (Antes não havia como saber: já havíamos achado 171 linhas diferentes em cópias antigas de outros módulos.)
2. **Armadilha do Stryker com `vm`:** módulos carregados por `vm` precisam receber `process` no contexto, senão o mutante nunca é ativado e o teste "sobrevive" por engano. Corrigido nos testes do FB mãe e documentado em `tests/mutacao/rodar_mutacao.js`.
3. **O código instrumentado é ~40 vezes mais lento:** os testes de tempo (orçamento de 1 s do rodízio) e as buscas exaustivas ficam de fora da medição; a guarda e o plano são medidos com os testes rápidos.

## Sobreviventes que sobraram (não são buracos de segurança, por classificação)
- **Equivalentes:** código de empacotamento (`typeof module`, `typeof window`), valores iniciais de variáveis, fallbacks `[]`/`{}` que o host nunca aciona, fronteiras mascaradas por tolerância (`total > lim + 1e-9`, `1.0001`), `n <= 1` quando o laço seguinte já não roda.
- **FB mãe, 125 sobreviventes de 415:** cerca de 75 são o texto/estado dos filhos do mapa (`set`/`reg`/`vai`, só apresentação) e o resto são ramos opcionais do host (`limpaPrevia`, `limpaTracejado`, `extra`), a prévia da próxima etapa em combinações raras e valores iniciais. Os de segurança (comando, guarda, DSE, rearme, limite confirmado, folga de 20 s, tolerância) estão cobertos.
- **Rodízio, 41 de 328:** fallbacks de entrada ausente e arredondamentos; não foram classificados um a um além disso.

## Como rodar
```
npm --prefix tests/propriedades ci && node --test tests/propriedades/*.test.js tests/modulos_entregues.test.js     # rápido, no CI
npm --prefix tests/mutacao ci && node tests/mutacao/rodar_mutacao.js [perfil|serie|fbv|rodizio]          # lento, à mão (1 a 6 min por módulo)
```
`FC_RUNS` e `FC_SEED` mudam o número de casos e a semente (padrão: 300 a 500 casos, semente fixa para repetir).

## Segunda opinião independente
O quarto item da passagem ("pedir uma segunda opinião independente") **não pode ser feito por mim**: é a mesma IA. Preparei o que um revisor humano ou outra IA precisa: `docs/bt2/auditoria/PROMESSAS_DOS_MODULOS_v0.1.md` (o que cada módulo promete, onde está provado e o que não está).

## Passo 7b: a mesma prova em mais dois módulos (19/11/2026)

| Módulo | Teste novo | Mutação antes → depois |
|---|---|---|
| Núcleo do RNC (`nodered/gerador/rnc/rnc_core_v1.2.js`) | `tests/propriedades/rnc_core_v1.2.prop.test.js` (14 testes: máquina de estados, idempotência 200/409, revisão, transição 422, numeração por ano, limites) | 88,4 % → **99,1 %** (3 sobreviventes equivalentes) |
| Nó "limite de capacidade e degrau (C2)" do fluxo `chaves-56-api-v3.9` | `tests/propriedades/capacidade_c2.prop.test.js` (o código REAL do nó roda em `vm`; comparado com um oráculo escrito à parte; 16 testes) | 66,9 % → **92,9 %** (19 sobreviventes, todos equivalentes, ver abaixo) |

- Regras provadas no C2: só recusa em modo `recusar` e só com kW a 100 % conhecido (arquivo > medidor dentro da validade de 180 s); desligar nunca é recusado; modo `registrar` nunca recusa; soma entre bancos só com leitura de até 5 s; qualquer erro interno deixa o comando seguir (fail-open); logs limitados (2 s recusa, 10 s registro, 10 min divergência, 1 h aviso "kW desconhecido", máx. 1000 registros); degrau só conta comandos que seguiram, máx. 200.
- Guarda de embutimento (`tests/modulos_entregues.test.js`): o núcleo do RNC colado nos 2 nós do fluxo `rnc-api-v1.2` é idêntico ao arquivo testado.
- Nenhum bug de produção encontrado; o ganho foi de cobertura de prova.
- Sobreviventes do C2, por classificação: 12 são o objeto `PADRAO` embutido (só vale sem arquivo de capacidade carregado; o aviso "Total comandado 0 kW" é testado), 1 fallback `[]` do `norm` (a chave de fora do vetor nunca é número), 1 fallback `[]` do histórico (`undefined` já é filtrado), `>=` contra `> + 1e-9` no limite e no degrau (equivalentes por causa da tolerância e do arredondamento a 3 casas) e `typeof esp` (com `esp` indefinido a comparação já dá falso).
- Como rodar: `node tests/mutacao/rodar_mutacao.js rnc` ou `cap` (o `cap` gera `tests/mutacao/alvos/cap_c2.js` a partir do fluxo; a pasta `alvos/` não vai para o Git).
- Fora do escopo por não valerem a prova: `dados_ensaio_ns_v0.2` (depende de DOM, só e2e) e `calculos_setup_v0.1` (não entregue).
