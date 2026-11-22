# Roteiro de teste no Demo — Patamar com os 4 bancos (medidor 1.10.159)

Pensado para fazer **pelo celular**. Você roda, exporta o log e manda o arquivo; eu comparo com a coluna "esperado" abaixo (calculada pelo mesmo módulo do medidor, com os 4 bancos marcados, limite 107 %, sem desgaste e todas as chaves desligadas no início).

## 1. Geradores da lista (escolhidos pela potência, 60 Hz, 380 V, kW lido do arquivo .dse)
| Ordem | Modelo (pasta · arquivo) | kW a 100 % | Por que este |
|---|---|---|---|
| 1 | `MWM_40KVA_eletr` · `G4501AMF_MWMe_40KVA_60HZ_380V_12V.dse` | 29 | só bancos pequenos; passos de 0,5 kW (BC59,5) |
| 2 | `MWM_150KVA` · `G4501AMF_MWM_150KVA_60HZ_380V_12V.dse` | 109 | 107 % (116,6 kW) **passa** da soma BC56+BC59,5 (115,5): obriga a entrar o BC400 |
| 3 | `SCA_500KVA` · `G4501AMF_SCA_500KVA_60HZ_380V_24V.dse` | 364 | combina BC400 com os pequenos |
| 4 | `SCA_800KVA` · `G4501AMF_SCA_800KVA_60HZ_380V_24V.dse` | 582 | o de 800 kVA que você já usou; BC400 + BC550 |
| 5 | `8660_1250KVA_60HZ_380V_24V_V7.7.dse` (pasta `380V`) | 909 | perto do total dos bancos (1 065,5 kW): limite de capacidade |

Se faltar algum no seletor, pegue o de potência mais próxima.

## 2. Como rodar cada um (mesmo roteiro nos 5)
1. Abra o medidor, **Demo e Servidor** (senha de testes) → modo Demo local.
2. Em **Dados do ensaio** escolha o modelo da tabela. Confira "100 % = … kW".
3. No **Patamar**, marque os **4 bancos**. Escolha **Auto** no patamar de 30 %.
4. Ligue **Patamar: On**, clique **INICIAR** e deixe o ensaio andar patamar por patamar: 30, 50, 75, 100 e 107 %. Em Manual, clique **Aplicar** quando o tracejado aparecer.
5. Em cada patamar anote (ou deixe o log registrar) o kW sugerido e os bancos usados.
6. Ao fim: **Exportar** o log (Gerenciador de logs → Exportar ▾ → JSON) e, se puder, o relatório do ensaio.
7. Extra no gerador 1: clique **Sugerir chaves** com o alvo vazio ou 0 e confira que não trava (correção 1.10.158).

## 3. Esperado por gerador e patamar (kW sugerido · erro · bancos)
**1 — 40 kVA (29 kW):** 30 % 8,5 (−0,2) 59,5+550 · 50 % 14,5 (0) 400+59,5 · 75 % 21,5 (−0,25) 400+59,5 · 100 % 29 (0) 59,5+550 · 107 % 31 (−0,03) aviso.
**2 — 150 kVA (109 kW):** 32,5 (−0,2) · 54,5 (0) · 81,5 (−0,25) · 109 (0) · 107 %: 116,5 (−0,13) com 400+59,5+550, aviso.
**3 — 500 kVA (364 kW):** 109 (−0,2) · 182 (0) · 273 (0) · 364 (0) · 107 %: 389 (−0,48), aviso.
**4 — 800 kVA (582 kW):** 174,5 (−0,1) · 291 (0) · 436,5 (0) · 582 (0) · 107 %: 622,5 (−0,24), aviso.
**5 — 1250 kVA (909 kW):** 272,5 (−0,2) · 454,5 (0) · 681,5 (−0,25) · 909 (0) · 107 %: 972,5 (−0,13), aviso.

A escolha **exata das chaves** pode variar quando há empate de custo; o que deve bater é **kW sugerido, erro e que nunca passe de 107 % do kW a 100 %**.

## 4. O que eu preciso receber (em ordem de utilidade)
1. **JSON do Gerenciador de logs** de cada rodada (traz estados da FB mãe, comandos, falhas, comunicação dos 4 bancos).
2. **Relatório do Operador secreto** (Demo → ▶ Iniciar o Operador secreto → Copiar relatório): confere as travas de seletora/Ligar banco. Rode **uma vez** com `?novos=0` e uma com `?novos=1`.
3. **Print** só se algo estiver visualmente errado.
4. Anote em uma linha: gerador, patamar em que algo estranho aconteceu e o que você esperava.

## 5. Automático
O Operador secreto já é automático (aperta os botões e confere as travas). Os patamares com geradores eu já rodei aqui em simulação isolada do módulo (tabela acima). **Ainda não existe** um robô que percorra o ensaio completo no Demo com cada gerador; se os logs mostrarem problema no Patamar, eu o crio com Playwright para repetir sem você.

## 6. Observação sobre a complexidade
A combinação (banco × gerador × patamar × Manual/Auto × guarda × desgaste) é grande. Por isso o roteiro fixa 5 geradores que cobrem as faixas e os limites, e os resultados esperados saem do mesmo módulo que roda no medidor: se um número diferir, é defeito de integração (tela/FB mãe), não do cálculo.
