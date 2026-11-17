# Lógica de transformação — Setup das chaves (v0.1 · 25/10/2026)
Este documento explica **o que o sistema faz com cada número** e **por que**. Serve para revisão técnica e para a equipe não técnica entender os resultados da tela.

## 1. Fluxo geral
1. **Medir o gerador** (DSE → Node-RED do DSE → HTML, a cada leitura).
2. **Achar o kW sem carga** (base): com gerador ligado e todas as chaves desligadas, a média móvel acompanha o consumo do próprio gerador.
3. **Selecionar uma chave**: o PLC liga só ela (`cb.ligar`).
4. **Esperar estabilizar** e clicar em **Salvar**.
5. **Calcular** kW real, R medido e V ref. estimada, e gravar no DB do chaveamento ativo.
6. **Espelhar** o chaveamento ativo nos arrays que o Node-RED e o HTML leem.

## 2. Regras de cálculo (com o porquê)
### 2.1 Tensão média
- **Fórmula:** `vMedia = (Va + Vb + Vc) / 3`
- **Por quê:** as três tensões de linha diferem pouco. A média dá uma tensão única para a resistência.

### 2.2 kW sem carga (base)
- **Fórmula:** `base = base × 0,8 + kW × 0,2`, só quando o gerador está operando e nenhuma chave está ligada. A primeira leitura válida vira o valor inicial.
- **Por quê:** o gerador consome energia sozinho. Esse consumo precisa ser descontado. A média móvel suaviza oscilações.
- **Reinício:** o FB100 zera a base quando o gerador para (borda de desligamento). No HTML, a base também é zerada se o gerador parar.
- **Assumido:** o início de um novo START refaz a base do zero (comentário no FB100 v0.2/v0.3).

### 2.3 kW real da chave
- **Fórmula:** `kwReal = kWMedido − base`
- **Trava de ruído:** se o resultado for menor que 0,05 kW, não se calcula a resistência.
- **Por quê:** a diferença entre "com a chave" e "sem a chave" é o consumo real da chave.

### 2.4 Resistência medida
- **Fórmula:** `R = vMedia² / (kwReal × 1000)` (kW convertido em W)
- **Por quê:** P = V²/R, isolando R. É a resistência equivalente em estrela por fase.
- **Teste de validação:** a mesma chave deve dar o mesmo R nas 3 tensões. Se a variação passar de alguns %, a premissa de resistência constante não vale nessa chave ou a medição tem ruído.

### 2.5 Tensão de referência estimada (V ref.)
- **Fórmula:** `V_ref = vMedia × √(kwPlaca / kwReal)`
- **Por quê:** a placa diz `kwPlaca` numa V_ref desconhecida. Com R constante, `kwPlaca / V_ref² = kwReal / vMedia²`. Daí a fórmula.
- **Como ler:** se V_ref dá parecido em todas as chaves e tensões, é a tensão da placa. Se variar muito, a premissa de carga resistiva não vale ou o kW de placa não corresponde ao que se mede.
- **Estado:** estimativa, a confirmar na prática (decisão do operador em 25/10/2026).

### 2.6 R teórico (REMOVIDO)
- A versão anterior calculava `vMedida² / kwPlaca`. Foi removida porque mistura a tensão medida com uma potência de placa cuja tensão de referência é desconhecida. O campo `rTeoricoOhm` agora é sempre 0.0 (ou `null` no GET).

### 2.7 Variação de R entre tensões
- **Fórmula:** `(máx − mín) / média × 100`
- **Por quê:** número único para avaliar o teste do item 2.4.

## 3. Regras de gravação (Setup por tensão)
1. Só grava se o **chaveamento estiver informado** (1..3). Sem ele, o PLC recusa o Salvar.
2. Grava na linha do chaveamento ativo (`p = (c−1)·16 + (k−1)`).
3. Espelha o chaveamento ativo nos arrays do DB do banco. Com chaveamento não informado, o espelho fica **sem Setup** (kW real = 0, SetupOk = FALSE), para nunca usar kW de outra tensão.
4. "Limpar kW reais" apaga só a linha do chaveamento ativo.

## 4. Regras de segurança e integridade
- **Ligar banco / seletora:** seletora fora de Auto ou comunicação com o ET200 perdida **desliga** o banco. Nada religa sozinho.
- **Vigia do Node-RED:** se nenhuma tela consulta o PLC por um tempo, o Node-RED zera os comandos de ligar (`cbLigar`).
- **Fila de escrita:** uma gravação por vez; comandos de desligamento passam na frente.
- **Releitura:** toda escrita é conferida na leitura seguinte. Sem confirmação, a resposta é erro.
- **Ensaio em andamento:** o Setup não abre e não seleciona chave durante ensaio.
- **Duplicidade:** cada requisição tem um identificador (`reqId`) para não responder duas vezes.

## 5. Exemplo com números inventados (para entender)
Chave de 3 kW, base de 0,7 kW, gerador a 380 V:
- kW com a chave = 3,7 kW → kW real = 3,7 − 0,7 = **3,0 kW**
- vMedia = 380 V → R = 380² / (3,0 × 1000) = **48,1 Ω**
- V_ref = 380 × √(3 / 3,0) = **380 V**
- Em 220 V, o kW real cai para ~1,0 kW, mas R continua ~48,1 Ω → **variação de R = 0 %**.
Os valores são inventados e servem só para mostrar a conta. Veja `calculos_setup_v0.1.js`.

## 6. Pendências
- Confirmar a V ref. na prática (Setup nas 3 tensões).
- Confirmar a retentividade do DB152/DB160 no TIA.
- Decidir se o chaveamento vai vir do campo "Tensão" de Dados do ensaio (hoje é informado no Setup).
- Confirmar se o início de um novo START refaz a base (hoje assumido).
