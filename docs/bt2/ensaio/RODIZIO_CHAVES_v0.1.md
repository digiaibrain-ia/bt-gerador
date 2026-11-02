# Rodízio, sugestão de chaves e entrada escalonada — v0.1

**Arquivos:** `modulos/rodizio_chaves_v0.1.js` (motor, funções puras) · `simulador_rodizio_v0.1.html` (teste sem PLC) · `mapa_fbs_v0.1.html` (mapa dos FBs).
**Natureza:** protótipo em JS. Não fala com PLC/Node-RED nem liga chave. Vira FB(s) depois (filhos 4, 5 e 10 do mapa).

## 1. Separação (regra 4)
| | Item |
|---|---|
| **(a) Confirmado** | kW por chave (tabela física do usuário): BC400 = 5,5,10,10,10,10,50×7 (400 kW); BC56 = 5×5, 4×7, 3 (56 kW). Rodízio por acionamentos **e** horas, com reinício "chave trocada". Rodízio macio (erro menor primeiro). Só chaves habilitadas. Nunca acima do alvo. Operador pode trocar a seleção sem pergunta de liga/desliga. DSE cai → chaves caem (decisão 27/10). 107 %: tolerância discutida (±2 %) |
| **(b) Assumido (a confirmar)** | `excessoMaxKw` no modo "mínimo" (107 %); `folgaErroKw` = 0; `pesoMudanca` = 0,01; desligamento imediato; maiores chaves entram primeiro no escalonamento; 100 % do modelo é **entrada digitada** (regra "kW stand-by ÷ 1,1" não confirmada) |
| **(c) A desenvolver** | Integração no medidor (botão Manual guiado, animação na chavinha, botão Confirmar); FBs no PLC; tempos reais por modelo (aprender com operadores); contagem de horas no ensaio real |

**Guarda de capacidade (filho 11, mandatório):** `limiteKw(kw100,pct)`, `guarda({bancos,selecao,kw100,pctLimite}) → {ok,total,limiteKw,excessoKw,mensagem}`, `podeLigar(ent,banco,idx)`. Limite = kW a 100 % × % de segurança (**ASSUMIDO — a confirmar**; simulador usa 110 % provisório). Abaixo do alvo = livre; acima do limite = bloqueado com mensagem; sem dados = bloqueado. `sugere` também respeita o limite.

## 2. Dicionário de dados
`banco` `{id,kws[],habil[],estado:{acion[],horas[]},atual[]}` — `kws` kW por chave na ordem física · `habil` habilitada · `estado` desgaste acumulado · `atual` ligada agora.
Parâmetros: `modoAlvo` 'abaixo'|'minimo' · `excessoMaxKw` · `folgaErroKw` · `rodizio{criterio:'acion'|'horas'|'ambos', pesoAcion, pesoHoras}` · `pesoMudanca` · `escalonamento{degrauMaxKw|null, pausaS, desligaImediato}`.
Saídas: `sugere → {selecao{id:[bool]}, total, erro, dentro, aviso, candidatos}` · `avalia → {total, dif, acima, abaixoDoMinimo}` · `planoEntrada → {passos:[{t,liga[],desliga[]}], duracaoS}`.
Estados de cada chave (3 coisas distintas): **pedida** → **saída ativa** → **confirmada** (retorno físico; no simulador é atrasado de propósito).

## 3. Lógica (o "porquê")
1. Para cada banco enumera as combinações das habilitadas (≤ 8192) e guarda, para cada soma de kW, a de **menor desgaste** → nunca perde a melhor e é rápido.
2. Combina bancos (BC56+BC400) e escolhe: **menor erro**; entre erros iguais (ou dentro da folga) o **menor desgaste**; depois **menos chaves mudando**.
3. Modo mínimo (107 %): o total tem de ficar entre alvo e alvo+excesso; se impossível, cai para o mais próximo abaixo **e avisa**.
4. Seleção manual: só calcula e avisa se passou do alvo; não bloqueia (o operador decide).
5. Plano de entrada: liga em grupos de até `degrauMaxKw` com `pausaS` entre eles (gerador mecânico com GOV precisa de tempo para estabilizar a rotação). `null` = todas juntas.

## 4. Instruções / teste
Abrir `simulador_rodizio_v0.1.html` → **Sugerir** → editar chaves (pôr/tirar) → **Confirmar e aplicar**. **Simular 10 ensaios** mostra o rodízio (contadores de ac/h ficam parecidos entre chaves iguais). Testes de borda executados: alvo exato, chaves desabilitadas, 2 bancos, modo mínimo, seleção acima do alvo, escalonamento, distribuição em 40 ensaios.
**Riscos:** alvo inatingível por granularidade (ex.: 450 kW com BC56+BC400 só chega a 449) — o sistema mostra o erro; contadores precisam persistir (PLC retentivo ou Node-RED) na versão real.

## 5. Padrão de comentários
Igual a `ANALISADOR_GRAFICO_v0.1.md` §7.

## Glossário
**Rodízio:** revezar chaves iguais para gastar por igual. **GOV:** regulador que simula a rotação eletrônica em motores mecânicos. **Degrau:** quantidade de carga que entra de uma vez. **Habilitada:** chave liberada para uso. **Retorno físico:** sinal que confirma que a chave realmente fechou.
