# ET200 — previsibilidade (03/11/2026)

O 1515 só conhece o ET200 por dois endereços por banco, em `RemotoCmd` e `RemotoFb`. O número do DB no ET200 é **livre**: pode ser qualquer DB não otimizado.

| Banco | Chaves | FB | Remoto sugerido | Layout | Estado |
|---|---|---|---|---|---|
| BC56 | 13 | FB101 | DB38 `ComBC56` | 12 B | existe |
| BC400 | 13 | FB101 | DB39 `ComBC400` | 12 B | existe |
| BC550 | 12 | FB101 | DB41 `ComBC550` | 12 B (igual DB38) | a criar |
| BC59,5 | 18 | FB103 | DB40 `ComBC595` | 16 B | a criar |

## Se um número estiver ocupado
1. Escolha outro DB livre no ET200.
2. Altere o campo `remoto` do banco em `plc/bt2/gerador/bancos_bt2_v0.2.json`.
3. Rode `python3 plc/bt2/gerador/gerar_banco_v0.2.py <BANCO> --blocos`. Nada mais muda: as chamadas saem com o endereço novo.
4. Atualize o DB do ET200 (renomeie o arquivo `db4x_...` para o número escolhido).

## Layouts
- 12 bytes (≤16 chaves): `cmd[16]` DBX0.0, `vida1515` DBW2, `ligarBanco` DBX4.0 | `fbk[16]` DBX6.0, `vidaET` DBW8, `seletoraAuto` DBX10.0.
- 16 bytes (17–32 chaves): `cmd[32]` DBX0.0–3.7, `vida1515` DBW4, `ligarBanco` DBX6.0 | `fbk[32]` DBX8.0–11.7, `vidaET` DBW12, `seletoraAuto` DBX14.0.

## Lado ET200 dos bancos novos — já escrito (03/11/2026, rascunho, não compilado)
O FC4 atual continua cuidando de BC56 e BC400 (não foi tocado). Para os bancos novos:
- `fb_bancoEt200_16_v0.1.scl` (BC550) e `fb_bancoEt200_32_v0.1.scl` (BC59,5): vidaET a cada 100 ms; sem vida do 1515 por 2 s derruba todas as saídas; só religa depois de o comando cair e ser recomandado; saída só liga com ComOk **e** LigarBanco **e** seletora em Auto; feedback = contato auxiliar real.
- `fc_bancosNovosEt200_v0.1.scl`: FC de chamada (1x por ciclo no OB1 do ET200). Copia as tags físicas para arrays, chama o FB de cada banco e devolve as saídas.
- `tags_ET200_bancos_v0.1.csv`: 62 tags (entrada do contato auxiliar `BCxxx_Inn`, saída da contatora `BCxxx_Qnn`, seletora `BCxxx_SEL_AUTO`) com a coluna **endereco em branco**: eu não conheço os endereços físicos do ET200 e não invento. Preencha a coluna (ou crie as tags no TIA com esses nomes).
- Criar no TIA do ET200 as instâncias `fbEt200_BC550` (FB `fb_bancoEt200_16`) e `fbEt200_BC595` (FB `fb_bancoEt200_32`).

## Conexão S7
Os 4 bancos usam a mesma conexão (`ID_Conexao = W#16#100`). Decisão do operador em 03/11/2026: é assim que fica; só reabrir se `StatusPut/StatusGet` mostrar recurso ocupado no teste.
