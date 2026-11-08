# Inventário Demo × Real — medidor_gerador_v1.10.190 (v0.1, 08/11/2026)

**Para que serve (leigo):** o Demo local é um simulador dentro do próprio HTML. Quando o código se comporta de um jeito no Demo e de outro no Real, o robô aprova no Demo e a bancada reprova (caso do Setup/Salvar, LL-040). Esta lista mostra **onde** o código muda por modo, para cada ponto ganhar um teste.
**Como foi feito:** busca no HTML por `$('demo').checked` e `modoSim()` (74 ocorrências de texto). **Li as linhas mais relevantes; não analisei cada fluxo de ponta a ponta.** Linhas são da v1.10.190 e mudam a cada versão. A classificação de risco é minha, **A CONFIRMAR** com o Reginaldo.
**Modos:** Real · Demo local (simula tudo no HTML) · Demo + PLC (simula o DSE, mas grava de verdade no PLC).

## Risco ALTO — a lógica operacional muda por modo (cada um precisa de teste com PLC simulado)
| Linha (v190) | O que muda | Por que importa |
|---|---|---|
| ~3473, 3478 | Leitura dos bancos: Demo usa `bancoSim()`; Real lê o PLC. `bkEhDemoLocal` | O Demo nunca exercita a rota nem a leitura do PLC |
| ~3590, 3641, 3669 | INICIAR/STOP: no Demo o botão **simula** o gerador (`SIM.gen`); no Real "desligar é no painel do DSE" | Fluxo de partida e parada só existe de verdade no Demo |
| ~7141, 7186, 7421 | **Setup e uso manual das chaves**: ligar gerador do Demo, `if(!demo)return`, mensagens diferentes | **Provável origem do caso "Salvar não funcionou"** (LL-040) |
| ~7873 | `KW_NOM = demo && p>0 ? p : 91` — no **Real a potência nominal fica fixa em 91 kW** | O % de carga no Real depende de 91 kW fixo; **A CONFIRMAR** se é intencional (comentário v1.9.98 diz que sim, "volta ao valor original") |
| ~2518, 2847, 3821 | Velocidade só no Demo; falha de motor simulada; dados vêm de `demoData()` | Ensaio acelerado e dados simulados não existem no Real |
| ~4881, 4882 | `srvUsaPlc`, `srvChave`: define qual modo está valendo; sonda o PLC só no Demo local | Decide para onde vai cada gravação |
| ~6916 | `genOn`: no Demo, gerador "parando/partindo" não conta como operando | Libera ou trava Setup e chaves |
| ~8821, 8998 | Registro encerra ao trocar Demo↔Real; "REC bloqueado em demo" | Evita misturar dado simulado com real |

## Risco BAIXO — rótulos e nomes (sem efeito na operação)
Títulos e nomes de arquivo de PDF/relatório (`DADOS DEMO (SIMULAÇÃO)`, prefixos `[DEMO]`, `_DEMO_`/`_REAL_`), textos de ajuda e `title` de botões: linhas ~6232, 6249, 6254, 8214, 8459, 8664, 8665, 8677, 8724, 8734, 11517, 11607 e vizinhas.

## Ainda não classificados
Ocorrências nas linhas acima de ~9000 (módulo do robô, Central, Ocorrências) e as que usam `SRVM.plc` / `demoOn()` sem passar por `$('demo').checked`.

## Próximos passos sugeridos (nada foi executado)
1. Para cada linha de risco ALTO: escrever o teste "mesma ação no Demo local e no Demo + PLC com PLC simulado" e comparar o resultado.
2. Conferir com o Reginaldo as condições reais do **Setup/Salvar** e o 91 kW fixo; só então fechar LL-040.
3. Repetir a varredura a cada versão nova (o gerador pode contar as bifurcações e avisar se o número mudou).
**Não prova:** o comportamento do PLC e do DSE reais — isso continua sendo da bancada.
