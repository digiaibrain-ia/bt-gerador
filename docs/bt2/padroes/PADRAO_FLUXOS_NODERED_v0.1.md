# Padrão de fluxos Node-RED do BT2 — v0.1 (13/11/2026)

Decisão do Reginaldo (13/11/2026). Vale para todo fluxo novo e para toda versão nova de fluxo existente. Verificação automática: `python3 scripts/metodo/verifica_fluxos_padrao_v0.1.py <fluxo.json>`.

## 1. Nome e versão (um só número em todo lugar)
| Onde | Padrão | Exemplo |
|---|---|---|
| Nome do arquivo | `<tema>-<banco>-api-vX.Y.json` | `chaves-56-api-v3.6.json` |
| Nome da aba (label) | `<Nome> vX.Y` (só isso, sem data nem texto) | `Chaves BC56 (API) v3.6` |
| Info da aba, 1ª linha | `vX.Y (dd/mm/aaaa) — o que mudou` | `v3.6 (13/11/2026) — só documentação e layout` |
| Nota de cabeçalho | nó comment com `<Nome> vX.Y` no nome | `Chaves BC56 (API) v3.6 — ...` |
- A versão do **arquivo** manda: aba, info e nota têm que ter **a mesma**. Citações a versões antigas ficam só no histórico (dentro do info da aba ou dos comentários do código, como "v2.4: ...").
- **Não confundir:** o campo `flow` que a API devolve ao HTML (ex.: `chaves-v2.5`) é o **ID do contrato** HTML↔Node-RED, não a versão do arquivo. Só muda quando o contrato muda.
- Aba nova nunca reaproveita o número de uma versão já entregue.

## 2. Comentários e info
- **Todo nó de lógica** (function, http in/response, s7, delay, trigger, inject, catch) tem **info**: o que faz e por quê; de onde vem e para onde vai; o que acontece na falha. Sem descrição conhecida: `ASSUMIDO — a confirmar`.
- **Nota (comment) curta:** nome com no máximo **80 caracteres**. Texto maior vai no **info** (que quebra linha e aceita markdown) ou é dividido em várias notas.
- **Cabeçalho da aba:** para que serve, de onde vêm os dados, o que NÃO faz, versão e data (no info da aba).

## 3. Layout (visual organizado)
- **Uma faixa por rota de entrada** (http in / inject / catch), da esquerda para a direita; cada faixa é um **grupo** com o nome da rota.
- **Área compartilhada** (fila, PLC, respostas) em grupo próprio, abaixo das faixas, dobrada em linhas.
- **Nós link** (link out / link in) no lugar de fios longos entre as faixas e a área compartilhada. Não alteram a mensagem.
- Nomes de nó repetidos em faixas diferentes são aceitos enquanto o grupo identifica a rota.

## 4. Como gerar e provar (nunca à mão)
1. `python3 nodered/gerador/organiza_fluxo_v0.1.py <entrada.json> <saida.json> <versão> "<o que mudou>"` (não sobrescreve).
2. `python3 nodered/gerador/verifica_equivalencia_fluxo_v0.1.py <original.json> <novo.json>`: mesmos nós, mesmas propriedades e mesmas ligações (contando o caminho pelos links). Mutação: tirar uma ligação tem que reprovar.
3. Mesma bateria de testes nos dois, com `BT2_FLUXO_TROCA="chaves-56-api-v3.4=chaves-56-api-v3.5,chaves-56-api-v3.5=chaves-56-api-v3.6"` (o harness lê o fluxo novo no lugar do antigo). O resultado tem que ser o mesmo do controle.
4. `verifica_fluxos_padrao_v0.1.py` sem violação.

## 5. Limites
- A ferramenta só documenta e arruma posição/grupos/links; **não muda código nem comportamento**. A prova é por script e por testes com PLC simulado; **não** foi vista no editor do Node-RED do PC BT2 nem em bancada.
- O `info` extraído do comentário do código reflete o que está escrito lá; onde o código não tinha comentário, o texto é "ASSUMIDO — a confirmar".
