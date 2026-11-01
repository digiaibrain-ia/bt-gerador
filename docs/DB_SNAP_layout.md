# Layout do DB SNAP (MANUAL e AUTO) — TIA Portal
Derivado do HTML v1.8.9 (campos `DADOS`, `SNAP[i]`, `MED`) e da orientação do fluxo.
O layout é **idêntico** para o DB SNAP MANUAL (PLC Bancos de Carga) e o DB SNAP AUTO (PLC Ensaio Automático).
DB **não otimizado**, PUT/GET habilitado, endereçamento absoluto — igual ao DB52.

---

## Bloco 1 — Preenchimento (1 por ensaio, vem do print do SAP)

| Offset | Nome TIA Portal          | Tipo S7   | Bytes | Observação                            |
|--------|--------------------------|-----------|-------|---------------------------------------|
| 0.0    | Preench_Valido           | Bool      | —     | True = preenchimento gravado          |
| 2      | Serie                    | String[20]| 22    | Nº de série (ex: DZFA00045)           |
| 24     | Versao                   | String[12]| 14    | Versão do teste (ex: 773323)          |
| 38     | Data                     | String[10]| 12    | dd.mm.aaaa                            |
| 50     | Fase                     | String[12]| 14    | Monofasico / Trifasico                |
| 64     | FrequenciaHz             | Real      | 4     |                                       |
| 68     | TensaoV                  | Real      | 4     |                                       |
| 72     | TempAmbienteC            | Real      | 4     |                                       |
| 76     | PotenciaKw               | Real      | 4     |                                       |
| — Equipamentos (6 itens × 3 campos × String[20]) —                                       |
| 80     | Equip_Motor_Fabricante   | String[20]| 22    |                                       |
| 102    | Equip_Motor_Modelo       | String[20]| 22    |                                       |
| 124    | Equip_Motor_Serie        | String[20]| 22    |                                       |
| 146    | Equip_Alt_Fabricante     | String[20]| 22    |                                       |
| 168    | Equip_Alt_Modelo         | String[20]| 22    |                                       |
| 190    | Equip_Alt_Serie          | String[20]| 22    |                                       |
| 212    | Equip_Ctrl_Fabricante    | String[20]| 22    |                                       |
| 234    | Equip_Ctrl_Modelo        | String[20]| 22    |                                       |
| 256    | Equip_Ctrl_Serie         | String[20]| 22    |                                       |
| 278    | Equip_Ret_Fabricante     | String[20]| 22    |                                       |
| 300    | Equip_Ret_Modelo         | String[20]| 22    |                                       |
| 322    | Equip_Ret_Serie          | String[20]| 22    |                                       |
| 344    | Equip_RAT_Fabricante     | String[20]| 22    |                                       |
| 366    | Equip_RAT_Modelo         | String[20]| 22    |                                       |
| 388    | Equip_RAT_Serie          | String[20]| 22    |                                       |
| 410    | Equip_Bat_Fabricante     | String[20]| 22    |                                       |
| 432    | Equip_Bat_Modelo         | String[20]| 22    |                                       |
| 454    | Equip_Bat_Serie          | String[20]| 22    |                                       |

**Fim do bloco Preenchimento: offset 476.**

---

## Bloco 2 — Etapas (6 slots fixos, Etapa[1] a Etapa[6])

Cada slot = 60 bytes. Início do slot i (1-based): `476 + (i-1) * 60`.

| Off. dentro do slot | Nome TIA Portal    | Tipo S7 | Bytes | Observação                              |
|---------------------|--------------------|---------|-------|-----------------------------------------|
| 0.0                 | Salva              | Bool    | —     | Bit de confirmação (sobe por último)    |
| 2                   | Etapa              | Int     | 2     | % de carga alvo (0, 30, 50, 100, 107…) |
| 4                   | CargaReal          | Real    | 4     | % de carga medida (percCarga)           |
| 8                   | Potencia           | Real    | 4     | kW (MED.kw)                             |
| 12                  | TempMotor          | Real    | 4     | °C (MED.tc = tempAguaC)                 |
| 16                  | Va                 | Real    | 4     | V L1-L2 (MED.va)                        |
| 20                  | Vb                 | Real    | 4     | V L2-L3 (MED.vb)                        |
| 24                  | Vc                 | Real    | 4     | V L3-L1 (MED.vc)                        |
| 28                  | Ia                 | Real    | 4     | A L1 (MED.ia)                           |
| 32                  | Ib                 | Real    | 4     | A L2 (MED.ib)                           |
| 36                  | Ic                 | Real    | 4     | A L3 (MED.ic)                           |
| 40                  | Rpm                | Real    | 4     | (MED.rpm)                               |
| 44                  | Bateria            | Real    | 4     | V (MED.bat)                             |
| 48                  | TEstab             | Real    | 4     | s (SNAP[i].estab)                       |
| 52                  | Cronometro         | Real    | 4     | s (SNAP[i].tempo)                       |
| 56                  | (reserva)          | DWord   | 4     | Zero; alinha próximo slot               |

**Fim de cada slot: 60 bytes.**

### Offsets absolutos dos 6 slots

| Slot (indice) | Etapa padrão ISO | Início absoluto |
|---------------|-----------------|-----------------|
| 1             | 0 % (aquecimento)| 476             |
| 2             | 30 %            | 536             |
| 3             | 50 %            | 596             |
| 4             | 100 %           | 656             |
| 5             | 107 %           | 716             |
| 6             | 0 % (final)     | 776             |

**Tamanho total do DB SNAP: 836 bytes** (476 preench. + 6 × 60 etapas).

---

## Bloco 3 — DB seletor (novo, número a definir)

DB separado, simples. Fica no PLC que for mais acessível (sugestão: PLC Ensaio Automático).

| Offset | Nome TIA Portal | Tipo S7 | Observação                          |
|--------|-----------------|---------|-------------------------------------|
| 0.0    | CB_Manual       | Bool    | Command: o operador pediu manual    |
| 0.1    | CB_Auto         | Bool    | Command: o operador pediu auto      |
| 0.2    | SB_Manual       | Bool    | Status: PLC confirmou modo manual   |
| 0.3    | SB_Auto         | Bool    | Status: PLC confirmou modo auto     |

Os dois CBs nunca ficam em 1 juntos (o fluxo zera um antes de subir o outro).
A fonte da verdade para o roteamento é o **SB** (lido), não o CB (escrito).

---

## Tratamento de valores null do HTML

`REAL` no S7 não guarda `null`. Opções:
- **Simples (recomendado agora):** gravar `0.0` quando o HTML enviar `null`; o fluxo devolve `null` para o HTML quando o valor lido for exatamente `0.0` *e* o campo for conhecido por poder ser nulo.
- **Rigorosa (futuro):** acrescentar um `DWord Nulos` por slot (bit por campo); o fluxo seta o bit ao gravar `null` e devolve `null` ao ler se o bit estiver setado.

A opção simples é suficiente para rpm, bateria e tempMotor que nunca são exatamente 0 em operação. Para Va/Vb/Vc/Ia/Ib/Ic pode haver ambiguidade (ex.: etapa de 0 % com corrente nula). Decida antes de criar o DB.
