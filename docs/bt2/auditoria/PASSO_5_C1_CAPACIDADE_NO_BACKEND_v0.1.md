# Passo 5 · C1: limite de capacidade no backend, só registrando · 19/11/2026

Aprovado pelo Reginaldo (18/11/2026): verdade no PLC (`setup.nominal[]`), espelho em JSON versionado, `pctLim` 110 % como padrão provisório. **Nada foi implantado**: são versões novas de fluxo no repositório. Pelo `CLAUDE.md`, subir no PC BT2 exige backup e OK explícito do Reginaldo (e um pacote novo; o v1.26 ainda leva os fluxos anteriores).

## O que foi feito
- `nodered/config/bancos_capacidade.json` (+ `LEIA-ME.md`): kW de cada chave dos 4 bancos (espelho do medidor e do PLC), `pctLim` 110 e `gerador.kw100` (`null` = limite não avaliado).
- `nodered/gerador/gerar_capacidade_c1_v0.1.py` gera as versões novas: **chaves-56 v3.8, chaves-400 v3.7, chaves-550 v1.8, chaves-595 v1.8** (as anteriores ficam intactas).
- Em cada fluxo:
  1. o nó "guarda leitura ao vivo" publica o kW comandado do banco (Ligada ou CbLigar) em `global` (só leitura);
  2. novo nó **"limite de capacidade (C1 - so registra)"** entre "valida ligar" e a fila: soma este banco + os outros e **anota no log** (`GET /api/logs/<banco>`) `LIMITE_EXCEDIDO` quando passaria de `kw100 × pctLim / 100`, e `NOMINAL_DIVERGE` quando o kW do PLC difere do espelho. **Sempre devolve a mensagem inalterada** (fail-open); o comando continua sendo executado;
  3. cadeia que lê o arquivo ao subir (variável `BT2_CAPACIDADE_JSON`; padrão `nodered/config/bancos_capacidade.json`). Arquivo ausente/inválido: segue com o padrão embutido e avisa no log.
- O kW usado por chave é o **do PLC** (`Nominal`) quando maior que 0; senão o do espelho.

## Prova
`tests/integracao/fase4/v_capacidade_c1.test.js` (11 testes):
- S1: o JSON bate com o medidor (kW das chaves, DBs, `pctLim` do `G.pctLim`).
- S2: cada fluxo novo só difere do anterior em: o nó de publicação, o fio de saída de "valida ligar" (e o grupo dele) e a aba; mais 6 nós novos do C1. **Nenhum outro nó mudou.** O padrão embutido é igual ao arquivo.
- R1: abaixo do limite nada é anotado; acima anota `LIMITE_EXCEDIDO` e **o comando é aceito (200) e chega ao PLC**.
- R2: `kw100 = null`: nada anotado. R3: arquivo ausente/inválido/`pctLim` fora da faixa: o fluxo funciona. R4: nominal do PLC diferente do espelho: `NOMINAL_DIVERGE` e a soma usa o do PLC. R5: soma entre bancos (BC400 + BC56).
- Contra-prova: com os fluxos anteriores (sem C1) R1, R4 e R5 falham.
Esteira inteira contra os fluxos novos: unitários 136/136; integração 51 arquivos verdes (0 falhas); e2e 24/25 (só `pacote_ia`).

## Limites e riscos que ficam para o C2
- **De onde vem o `kw100`:** o catálogo de modelos fica no medidor; o backend não sabe qual gerador está na bancada e a bancada testa geradores diferentes. Por isso `kw100` vem `null`: **nada é avaliado em produção até alguém preencher o arquivo**. A fonte automática (o ensaio/gerador gravado no backend, validado contra o catálogo) é a decisão do C2.
- **DB2100 não é DB de configuração:** neste repositório é o registro do ensaio (`registro-ensaio-db2100`), sem campo de capacidade. A verdade por chave já está nos DBs dos bancos (`Nominal`, `REAL392.16`).
- O C1 **não recusa nada**. A recusa (HTTP 409 `LIMITE_EXCEDIDO`) e o limite de degrau (BK-AUD-10) só com aprovação do Reginaldo e teste de bancada com carga desacoplada.
- A soma entre bancos usa a leitura publicada há até 5 s; se um banco estiver sem leitura recente, ele não entra na soma (subestima, nunca superestima).
