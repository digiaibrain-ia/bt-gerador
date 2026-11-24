# Alarme inteligente v0.2 (18/11/2026)

Continuação de `ALARME_INTELIGENTE_v0.1.md`. Decisões do Reginaldo na conversa de 17 e 18/11/2026, depois da bancada com PLC + SIDSE.

## 1. Decisões
| Decisão | Estado |
|---|---|
| Cancelado: botão **Silenciar** e **Reconhecer** que escondem alarme por escolha do operador | decidido |
| Mantido: **filtro automático** (1.10.224): CHV-005 e CHV-006 de um banco **não selecionado** em Detalhes do Patamar **e parado** não são criados | em uso |
| Mantido: consulta do DSE continua normal; só o **registro** deixa de ter uma linha por tentativa (1.10.225) | em uso |
| Novo tipo **Informação (I)**, registrado junto com Alerta e Falha (1.10.226) | em uso |
| Explicação dos nomes **dentro do diálogo** de Alertas e Falhas, em ⓘ Legenda (1.10.226) | em uso |
| Opcional, ainda não feito: área **"Repetidas"** (só mostra contador, primeira e última; sem silenciar) | a decidir |

## 2. Vocabulário (o mesmo texto está no diálogo)
- **Alarme incômodo (nuisance alarm):** avisa demais, sem necessidade, ou não volta ao normal mesmo depois de o operador agir.
- **Inundação de alarmes (alarm flood):** alarmes demais em pouco tempo para uma pessoa tratar. Referência da ISA-18.2: mais de 10 em 10 minutos. Valor de literatura, para ajustar ao BT2.
- **Repetido (chattering):** liga e desliga muitas vezes, ou a mesma falha se repete a cada consulta.
- **Permanente (standing/stale):** fica ativo por horas e ninguém age.
- **Fugaz (fleeting):** aparece e some em poucos segundos.
- **Alarme campeão (bad actor):** um alarme que sozinho responde por boa parte do volume.
- **Relação sinal/ruído (SNR):** sinal = o que exige ação; ruído = repetição. Melhorar sem descartar sinal.
- **Informação (I):** vale registrar, não exige ação. Não conta nos botões Alertas e Falhas nem no triângulo dos cards.
- **Regra de ouro:** todo alarme deve ter uma ação que o operador possa tomar. O que não tem ação é Informação.

## 3. Tipos de ocorrência no medidor 1.10.226
| Tipo | Código | Conta nos botões/triângulos | Exemplo |
|---|---|---|---|
| Falha (F) | `F-CHV-001` | sim | comando de chave não executado |
| Alerta (A) | `A-CHV-003` | sim | Modo DEMO + PLC comanda o PLC de verdade |
| Informação (I) | `I-DSE-001` | **não** | DSE nunca conectado (cabo não ligado) |

DSE-001: "não conectado" (o DSE nunca foi visto) = Informação. "Perdeu a conexão" (já tinha respondido antes) = Falha.

## 4. Contagem dos logs da bancada (17/11/2026)
Fontes: `bt2_logs_20261117_191439` (log de observação, 4222 eventos, 05/11 a 17/11) e `AGRUPADO` (registro do ensaio DEMO das 19:11, histórico de ocorrências com 242 registros).

**Log de observação (contando as repetições ×N):** 7.490 eventos.
| Item | Quantidade | % |
|---|---|---|
| `GET /api/gerador → 503` | 4.234 | **56,5 %** |
| `POST /api/chaves/56/ligar → 200` | 181 | 2,4 % |
| `GET /api/chaves/56 → 503` | 165 | 2,2 % |
| `GET /api/chaves/400 → 503` | 160 | 2,1 % |
| Os 5 mais repetidos juntos | 4.810 | **64,2 %** |

Falhas de API repetidas (tipo `api`, resultado `falha`): 4.626 eventos. É o alarme campeão (bad actor): o DSE sem cabo.

**Histórico de ocorrências (alarmes):** 154 ativações de 05/11 a 17/11.
| Código | Ativações | % |
|---|---|---|
| CHV-005 BC400 (banco bloqueado) | 28 | 18,2 % |
| CHV-005 BC56 | 27 | 17,5 % |
| DSE-001 (sem leitura do DSE) | 21 | 13,6 % |
| CHV-006 BC400 / BC56 (banco sem leitura) | 14 / 13 | 9,1 % / 8,4 % |
| CHV-003 (Demo + PLC) | 12 | 7,8 % |
| COM-001 BC56 / BC400 | 11 / 11 | 7,1 % cada |
Os 3 primeiros somam 49,4 % das ativações.

**Inundação:** pico de **32 ativações em 10 minutos** em 12/11 (18:55 a 19:05), acima da referência de 10 em 10 min. Em 17/11 o pico foi de 9 em 10 minutos (abaixo da referência).

**Fugazes e permanentes (88 ciclos ativou → normalizou):** 45 duraram **menos de 10 s** (CHV-005: 14, COM-001: 10, CHV-006: 7, DSE-001: 7, CHV-001: 5). Só 1 durou mais de 30 min (CHV-003). Há ocorrências de 12/11 sem normalização registrada no histórico (o histórico guarda só os últimos 500 eventos, então não dá para afirmar que ficaram ativas).

**Leitura:** o problema é de **volume repetido e alarmes fugazes**, não de alarmes permanentes. As mudanças 1.10.224 (banco fora do teste), 1.10.225 (falha repetida no log) e 1.10.226 (Informação) atacam exatamente os campeões acima.

## 5. O que falta
- Medir de novo depois de um ensaio com a 1.10.225/226 e comparar com esta contagem.
- Os 45 alarmes fugazes (<10 s) em troca de modo: avaliar um tempo mínimo de confirmação antes de criar a ocorrência (a decidir).
- Área "Repetidas" (opcional).
