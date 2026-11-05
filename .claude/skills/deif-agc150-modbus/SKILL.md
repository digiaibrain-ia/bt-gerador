---
name: "deif-agc150-modbus"
description: "Use when calculating, explaining or validating endereços/registradores do protocolo Modbus da DEIF AGC 150 (controlador de gerador) neste projeto de banco de teste."
---

# DEIF AGC 150 — Modbus server

Fonte oficial: `agc-150-modbus-server-user-manual-4189341435-uk.pdf` (manual) + `agc-150-modbus-server-tables-4189341212-uk.xlsx` (tabela com TODOS os endereços) — ambos anexados ao projeto "NOde-red". **NUNCA invente um endereço Modbus da AGC 150** — se não estiver nesta tabela ou no manual, pare e peça pro usuário conferir na USW (Utility Software) da DEIF ou na planilha.

## O que é

> "The AGC 150 Modbus server is a large proprietary protocol, including live data, and parameter reading and writing." (manual, seção 1.1)

Não tem nome de marca separado (ao contrário do GenComm da DSE) — é só chamado "AGC 150 Modbus server". Roda sobre **Modbus TCP** (porta Ethernet do controlador) ou **RS485** (function codes padrão Modbus). O controlador DEIF é o **servidor/slave**; o Node-RED (ou SCADA) é o **cliente/master**.

## Áreas de endereço (por function code)

Cada "tipo de dado" (Enable, Values used, Output A, Fail class...) ocupa uma faixa fixa de 2000 endereços. O endereço final de um parâmetro = **endereço do parâmetro na USW + início da faixa**.

### Read coil — FC 01 (status ON/OFF)
| Dado | Faixa |
|---|---|
| Enable | 2000–3999 |

### Read discrete inputs — FC 02 (status ON/OFF)
| Dado | Faixa |
|---|---|
| Alarm active | 4000–5999 |
| Alarm acknowledge | 6000–7999 |
| Timer output | 8000–9999 |
| Timer running | 10000–11999 |

### Read holding registers — FC 03 (valores)
| Dado | Faixa |
|---|---|
| Timers used | 2000–3999 |
| Values used | 4000–5999 |
| Values minimum | 6000–7999 |
| Values maximum | 8000–9999 |
| Output A | 10000–11999 |
| Output B | 12000–13999 |
| Fail class used | 14000–15999 |
| Enable | 16000–17999 |
| Inhibit | 18000–19999 |

### Read input registers — FC 04 (valores, somente leitura)
| Dado | Faixa |
|---|---|
| Timers minimum | 2000–3999 |
| Timers maximum | 4000–5999 |
| Output A minimum | 6000–7999 |
| Output A maximum | 8000–9999 |
| Output B minimum | 10000–11999 |
| Output B maximum | 12000–13999 |
| Fail class minimum | 14000–15999 |
| Fail class maximum | 16000–17999 |
| Timers elapsed time | 20000–21999 |
| **Actual values** | **22000–23999** |

### Write single/multiple coils — FC 05/15
| Dado | Faixa |
|---|---|
| Enable | 2000–3999 |
| Acknowledge alarm | 6000–7999 |

### Write single/multiple holding registers — FC 06/16
| Dado | Faixa |
|---|---|
| Timers used | 2000–3999 |
| Values used | 4000–4999 |
| Output A | 10000–11999 |
| Output B | 12000–13999 |
| Fail class used | 14000–15999 |
| Enable | 16000–17999 |
| Inhibit | 18000–19999 |

### Configurable area (read only) — FC 04h, endereços 0–499
Permite mapear qualquer endereço 500–1999 pros primeiros 500 endereços ("Modbus Configurator" na USW) — compartilhado com Profibus. Útil quando o cliente Modbus só enxerga um bloco curto de endereços.

### Alarm list monitoring
FC 04, endereços **28000–28099**: cada posição devolve o "Address" (não o número do canal) do alarme ativo correspondente; cruzar com a aba Parameters da USW pra saber qual alarme é.

## Cálculo do endereço — passo a passo

```
Endereço Modbus = Address do parâmetro (aba Parameters/USW) + início da faixa (tabela acima)
```

**Exemplo — reconhecer alarme de sobretensão (parâmetro 1150, Address=12):**
1. Ler se já está reconhecido: FC 02, faixa "Alarm acknowledge" (6000) → endereço 6012.
2. Reconhecer: FC 05, mesmo endereço 6012, escreve 1.

**Exemplo — mudar frequência nominal (parâmetro 6001, Address=407):**
1. FC 06, faixa "Values used" (4000) → endereço 4407.
2. Escala 1 (ver abaixo): pra gravar 60,00 Hz, escreve o valor 600.

**Exemplo — ler tensão de bateria atual (parâmetro 4960, Address=315):**
1. FC 04, faixa "Actual values" (22000) → endereço 22315.
2. Valor lido 242, escala 1 → valor real = 24,2 V.

## Tipos de dado
- `BOOL` — booleano
- `INT16s` / `INT16u` — inteiro 16 bits com/sem sinal
- `INT32s` / `INT32u` — inteiro 32 bits com/sem sinal
- `INT8u` — inteiro 8 bits sem sinal
- `string` — texto

## Formato de dado (32 bits)
- `AB` — valor de 16 bits.
- `ABCD` — valor de 32 bits: **HI16 no endereço mais baixo, LO16 no mais alto** (atenção: é diferente da convenção big-endian simples — confira sempre no caso real).

## Escala (scaling) — fórmula
```
Valor real = valor do registrador × 10^(−escala)
```
Escalas típicas (nem todo parâmetro é escalado — confira a tabela):
| Tipo de parâmetro | Escala |
|---|---|
| Ângulo de fase | 1 |
| Tensão DC de alimentação | 1 |
| Frequência | 2 |
| cos φ | 2 |
| Fator de potência | 2 |

**Exemplo:** frequência nominal 50,00 Hz, escala 2 → registrador retorna 5000 (= 5000 × 10⁻²).

## Diferenças pro GenComm (DSE) — pra não confundir os dois
| | GenComm (DSE) | AGC 150 Modbus server (DEIF) |
|---|---|---|
| Organização | Páginas (página × 256 + offset) | Faixas fixas de 2000 endereços por tipo de dado |
| Cálculo do endereço | `(página × 256) + offset` | `Address (USW) + início da faixa` |
| Fonte oficial | `GENCOMM.doc` (sob pedido à DSE) | Manual público + planilha `AGC 150 Modbus server tables` |

## Regra de ouro
Sempre que precisar de um endereço específico (não genérico de faixa), **confira na planilha `agc-150-modbus-server-tables-4189341212-uk.xlsx`** (Discrete output coil, Digital input contact, Holding register, Input register) antes de informar ao usuário. Nunca calcule "de cabeça" sem checar o Address real do parâmetro na USW/planilha — o offset de cada parâmetro é específico, não segue um padrão previsível.