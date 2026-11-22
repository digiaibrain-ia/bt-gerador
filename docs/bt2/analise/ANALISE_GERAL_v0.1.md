# Análise geral do projeto BT2 — operação, HTML, FBs (03/11/2026)

Escopo pedido: potencial de melhora na operação, nos HTML (dashboard, diagnóstico, análise) e, com mais energia, nos FBs ainda em JavaScript antes de ir ao PLC; e quem deve fazer a verificação.

## 1. Resumo
O que existe é mais sólido do que parece (a lógica de sugestão é correta nos testes e a guarda falha para o lado seguro), mas há **três riscos reais antes de portar para SCL** e **cinco ganhos de operação** de custo baixo. Todos os números abaixo foram medidos nesta sessão; o que é opinião está marcado.

## 2. O que foi medido (reproduzível)
Comando: `node --test tests/fb/rodizio_chaves.test.js tests/fb/fbs_virtuais.test.js` — 20 testes: **17 passam** e **3 são achados conhecidos** (marcados `todo`, falham de propósito).
- Sugestão (`sugere`), 200 casos aleatórios de 1 a 3 bancos pequenos comparados com **força bruta**: sempre achou o menor erro possível; nunca passou do alvo; nunca ligou chave desabilitada.
- Teste diferencial FB de 2 bancos × caminho de N bancos: mesmos totais em 60 casos.
- Com limite de capacidade: 40 casos, nunca passou do limite, e a guarda sempre aceitou a própria sugestão.
- Plano de entrada: 60 casos, cada chave aparece uma vez, o plano chega exatamente na seleção, pico ≥ início/fim, tempo não decresce.
- Desempenho com os 4 bancos reais (13+13+18+12 chaves): ≈ 150 ms por sugestão no navegador.

## 3. FBs em JavaScript (prioridade máxima)

| # | Achado | Gravidade | Situação |
|---|---|---|---|
| F1 | `sugere` lançava exceção com alvo inválido (vazio, NaN, negativo). | média | **corrigido** no medidor 1.10.158 e em `rodizio_chaves_v0.4.js` (falha segura: nada ligado + aviso) |
| F2 | **Não escala:** a sugestão enumera 2^n combinações por banco. Medido: 22 chaves → 1,8 s; um banco de 32 chaves → 4 bilhões, inviável (e no PLC impossível). BC59,5 (18 chaves) ainda passa. | alta p/ o PLC | aberto. Solução: programação dinâmica por soma, em passos de 0,5 kW (kW×2 como inteiro): O(n × somas), poucos milhares de passos, cabe em SCL com arrays fixos |
| F3 | `TOL_CONF_KW = 0,5 kW` é igual à menor chave do BC59,5 (0,5 kW): uma chave de 0,5 kW que não confirmou passa como "confirmada" (teste A1). | média | aberto. Tolerância deveria ser menor que a menor chave **do banco** (ou por contagem de chaves divergentes, não por kW) |
| F4 | `FALHA` por retorno físico é terminal: se o retorno volta ao normal, a mãe continua em FALHA até a etapa mudar (teste A2). No PLC isso vira um estado sem saída. | média | aberto. Precisa de rearme explícito (ack do operador) e regra de quem pode rearmar |
| F5 | Habilitar chaves depois de "nenhuma combinação cabe" **não** recalcula a etapa (teste A3): a assinatura de parâmetros (`chP`) não inclui habilitação. | baixa | aberto. Incluir o conjunto de chaves habilitadas na assinatura |
| F6 | **Fonte duplicada e defasada:** `dashboard/modulos-fonte/rodizio_chaves_v0.2.js` não tinha `sugere3/4/N`; `fbs_virtuais_v0.11.js` ainda tem "acionamentos BC56/BC400" fixos. O código que roda é o embutido no HTML. | média | parcialmente tratado: criei `rodizio_chaves_v0.3/v0.4.js` sincronizados e os testes usam essa fonte. `fbs_virtuais` precisa do mesmo tratamento |
| F7 | `TABELA_FISICA` só conhece BC56 e BC400. | baixa | aberto (os 4 bancos hoje vêm de `BANCOS` no HTML) |
| F8 | A FB mãe mistura **lógica** com **E/S** (usa `localStorage` e `BroadcastChannel` dentro do núcleo). Para portar a SCL, o núcleo precisa ser função pura de (estado, entradas) → (novo estado, saídas). | alta p/ o PLC | aberto. Já há uma boa interface (`host`); falta separar `publica()` |
| F9 | O tempo da mãe é relógio em ms; no PLC será por ciclo/TON. Estados `ESCALONANDO`/`CONFIRMANDO` dependem de ordem dos ciclos. | média | aberto. Definir tempo de ciclo e testar com relógio simulado (os testes já fazem isso) |

**Recomendação (opinião):** antes de escrever SCL, fazer F2 (DP), F3, F4 e F8 em JavaScript, congelar um conjunto de **vetores de teste** (entradas → saídas esperadas) exportado dos testes, e exigir que o SCL passe nos mesmos vetores no PLCSIM Advanced.

## 4. Operação e HTML

| # | Achado (medido) | Proposta |
|---|---|---|
| O1 | Medidor = 1 arquivo de 10 097 linhas, 1,1 MB. 107 `catch(e){}` vazios (erros engolidos), 30 `setInterval`, 24 `setTimeout`, 63 chaves de `localStorage`. | Telemetria mínima nos `catch` vazios (contador visível no Detalhes), um agendador único para os timers, namespace e versão para as chaves salvas |
| O2 | `dashboard/ferramentas` tem 37 versões do medidor (29 MB). | Mover versões antigas para `arquivo/` (o repositório já tem as tags/branches) e deixar só as 2 últimas |
| O3 | Não havia teste automático do código de decisão. | Agora existe `tests/fb/`; falta rodar em cada commit (CI simples com `node --test`) e um teste de interface com Playwright para os fluxos críticos |
| O4 | O HTML e os fluxos dependem de nomes soltos entre si (rotas, `flow:'chaves-v2.5'`, números de DB). | Uma "ficha de contrato" única (JSON) lida pelo gerador, pelo HTML e pelos testes. O gerador já faz metade disso |
| O5 | Id de banco `59,5` tem vírgula (já contornado com `rota`). | Trocar o id interno para `595` quando houver uma janela de migração dos dados salvos |
| O6 | A senha do Demo está no código do navegador. | É proteção de tela, não segurança: tratar como tal. Segurança de verdade = login do Node-RED (`adminAuth`) e rede, com a TI |

**Ganhos de operação (opinião, ordem de valor/custo):**
1. **Painel de prontidão pré-ensaio:** um checklist automático (4 bancos com comunicação ok, vidas do 1515/ET200 mudando, seletoras em Auto, DSE respondendo, limite configurado, cadastro de chaves habilitadas). Hoje essas informações existem espalhadas em chips.
2. **"Por que sugeriu isso?":** mostrar na tela o motivo da seleção (alvo, erro, desgaste, limite) — o `sugere` já calcula; falta expor.
3. **Alarmes priorizados e reconhecíveis** (padrão ISA-18.2): hoje há avisos e falhas, mas sem fila, prioridade ou reconhecimento.
4. **Central de diagnóstico única** unindo gerenciador de logs, visor de API e mapa dos FBs (hoje 3 páginas).
5. **Injeção de falhas no Demo** (DSE cai, chave não confirma, PLC lento, comunicação perdida): é o jeito de testar F3/F4 e as travas sem arriscar o equipamento.
6. **Relatório do ensaio** exportável (PDF/CSV) com chaves usadas, desgaste, tempos e ocorrências.

## 5. Riscos para a ida ao PLC (em ordem)
1. Algoritmo exponencial (F2) → trocar antes de portar.
2. Máquina de estados sem rearme (F4) e tolerância inadequada (F3) → definir antes de escrever o SCL.
3. Fonte de verdade duplicada (F6) → um único módulo gerando o código embutido (o `dashboard/build/build.js` pode fazer isso).
4. Quatro bancos na mesma conexão S7 → só o teste real mostra (decisão do operador).
5. Nada do SCL novo foi compilado.

## 6. Quem deve fazer a verificação (perfis)
Detalhe e instruções prontas em `.claude/agents/`.
1. **Engenheiro de verificação de software de controle** (o principal): testes baseados em propriedades, vetores de teste, PLCSIM Advanced / hardware-in-the-loop, rastreabilidade requisito → teste. Agente: `especialista-fbs-verificacao`.
2. **Engenheiro de automação sênior S7-1500/SCL** (revisor do porte): arrays fixos, ciclo de scan, REAL × inteiro, instâncias, comunicação PUT/GET, segurança funcional básica. Coberto pelo mesmo agente na fase de revisão; para o comissionamento, humano.
3. **Especialista em IHM/operação industrial (ISA-101 / ISA-18.2)**: painel de prontidão, alarmes, tela do operador. Agente: `especialista-operacao-hmi`.
4. **Engenheiro de potência / ensaio de geradores (ISO 8528)**: valida tolerâncias, limite de 107–112 %, degraus e o comportamento do regulador (GOV). Humano da casa (não substituível por agente).
5. **Segurança OT (IEC 62443)**: login do Node-RED, segmentação, acesso remoto. Humano/TI.

## 7. O que entreguei agora
- `tests/fb/` (20 testes), `tests/README.md`.
- `dashboard/modulos-fonte/rodizio_chaves_v0.3.js` e `v0.4.js`.
- Medidor 1.10.158 (correção F1) e pacote `bt2-1.10.158`.
- Dois agentes especialistas em `.claude/agents/`.
- Este relatório.

## 8. Não verificado
Compilação em TIA; PLC/ET200/Node-RED reais; desempenho em tablet/celular do operador; comportamento de `fbs_virtuais` embutido (os testes cobrem a cópia em `modulos-fonte`, que pode diferir do embutido — ver F6).
