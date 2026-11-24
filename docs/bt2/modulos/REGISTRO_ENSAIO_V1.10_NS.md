# Registro do ensaio v1.10 + medidor 1.10.203 — nº de série

Gerador do fluxo: `nodered/gerador/gerar_registro_ensaio_v1.10_v0.1.py` (de v1.9; a v1.9 não é alterada).
Gerador do medidor: `dashboard/gerador/gerar_medidor_v1.10.203_v0.1.py` (de 1.10.202).

## Causa
O fluxo limpava texto com `S()`, que troca caractere fora de ASCII por `?`. O NS da plaqueta usa `Ø` e o código de barras vem com `*`: `DTMFØ4447` ia ao PLC como `DTMF?4447`. O medidor ainda comparava o que enviou com a leitura de volta e acusaria erro.

## O que mudou
- **Fluxo v1.10:** normaliza `campos.serie` no servidor (sem espaços e `*`, `Ø/ø/∅`→`0`, maiúsculas). Aceita `origemDados` (`manual`|`ns`) e `ns` (opcionais; formato errado = 400). Guarda a origem em `flow 'ens_origem'` só depois do flag `preenchValido=TRUE` confirmado; limpar apaga; `GET /api/ensaio/snap` devolve `origem` (só se o NS lido do PLC for igual ao dos metadados).
- **Medidor 1.10.203:** normaliza o NS ao confirmar (qualquer modo) e envia `origemDados`/`ns` (decodificação e campos alterados).
- **Não muda:** layout do fluxo, ligações, endereços S7, DB2100 (nenhum campo novo no PLC).

## Compatibilidade
Medidor 1.10.203 com fluxo v1.9: funciona; a v1.9 ignora os campos novos (mas o `Ø` continua indo como `?` no PLC e a leitura de volta pode acusar divergência: usar o fluxo v1.10).
Medidor antigo com fluxo v1.10: funciona; origem = `manual`.

## Limites (honesto)
- A origem fica na memória do Node-RED (some se reiniciar). Gravar no PLC = BK-NS-01 no backlog.
- Os metadados `ns` são declarados pelo cliente; o servidor só sanea tamanho e formato, não decodifica de novo.

## Testes
- `tests/integracao/f7b_registro_ns_v1.10.test.js` (8): falham na v1.9, passam na v1.10.
- `f7`, `c5_etapa4c`, `f10`, `f11` rodados contra a v1.10 com `BT2_FLUXO_TROCA="registro-ensaio-db2100-api-v1.8=registro-ensaio-db2100-api-v1.10"`.
- `node tests/e2e/dados_ensaio_ns.js` (tela, desktop e celular).
