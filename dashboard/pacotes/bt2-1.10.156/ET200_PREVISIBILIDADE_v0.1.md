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

## O que o FC4 do ET200 precisa fazer por banco (nunca visto aqui: fonte do FC4 não está no repositório)
1. Copiar `cmd[n]` do DB para a saída da contatora n **somente se** a vida do 1515 estiver mudando (derrubar tudo se parar > 3 s — comportamento já existente para BC56/BC400).
2. Copiar a entrada do contato auxiliar da contatora n para `fbk[n]`.
3. Incrementar `vidaET` a cada ciclo e copiar a seletora do banco para `seletoraAuto` (1 = Auto).
4. A ordem das chaves 1..n é a ordem física da ficha (menor kW primeiro conforme `bancos_bt2_v0.2.json`).

## Conexão S7
Os 4 bancos usam a mesma conexão (`ID_Conexao = W#16#100`). Cada instância faz PUT e GET em sequência, mas as 4 podem pedir ao mesmo tempo. Se `StatusPut/StatusGet` mostrar recurso ocupado, aumentar `Pausa` (100 ms → 200 ms) ou criar uma segunda conexão para os bancos novos. Só o teste real mostra.
