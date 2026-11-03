# Roteiro de implantação — BT2 (04/11/2026)

Tudo abaixo foi preparado em 03/11/2026 e **não foi compilado nem testado em PLC/Node-RED real**. Cada etapa é reversível: guarde os arquivos atuais antes.

**Regra de ouro:** PLC e Node-RED mudam juntos. Número de DB novo no PLC exige o fluxo novo correspondente (e vice-versa). Por isso a implantação é em duas etapas.

## Antes de começar (10 min)
1. No TIA do 1515: **snapshot** dos valores atuais de DB150, DB152, DB158, DB160 (Setup salvo por chave e por tensão) e DB53. Salve o projeto como cópia.
2. No Node-RED do PC BT2: Exportar tudo (Menu → Exportar → todos os fluxos) e guardar o JSON.
3. Copiar `html/` do pacote `bt2-1.10.156` para `public\html\` (não apague as versões antigas).

## Etapa 1 — renumerar o que já funciona (BC56, BC400, DSE, snap)
Mapa completo: `docs/bt2/plc/MAPA_RENUMERACAO_BT2_v0.1.csv`.

| Hoje | Novo |
|---|---|
| DB150 / DB152 / DB154 / DB155 (BC56) | DB3000 / 3002 / 3004 / 3005 |
| DB158 / DB160 / DB162 / DB163 (BC400) | DB3100 / 3102 / 3104 / 3105 |
| DB52 (DSE) | DB2000 |
| DB53 (snap manual) | DB2100 |

1. TIA: em cada DB, Propriedades → Número → novo número (isso **preserva os valores** e atualiza as chamadas pelo nome simbólico). Se o TIA recusar, importe os `.db` novos de `plc/bt2/bancos_cargas/` e aplique o snapshot como valores iniciais.
2. Renomear os DBs conforme o CSV (`db3000_BC56_Chaves` …) e compilar tudo. Se houver erro, me mande o texto.
3. Carregar no 1515 **com o gerador desligado e os bancos desligados**.
4. Node-RED: apagar as abas antigas de chaves, DSE e registro; importar (Menu → Importar), nesta ordem, os arquivos de `nodered/`: `chaves-56-api-v3.0`, `chaves-400-api-v3.0`, `cliente-156-dse-plc-carga-v2`, `cliente-31-seletor-plc-db2000-v3`, `registro-ensaio-db2100-api-v1.5`. Deploy. (`simulador-dse-demo-v4` só se usar o simulador.)
5. Medidor 1.10.156: conferir BC56 e BC400 com leitura ok, DSE ok, Registro ok. Na janela 🧪 Cards x flow tudo deve estar OK.
6. **Só siga se a etapa 1 estiver igual a antes.** Se algo falhar, volte os DBs aos números antigos e importe o JSON exportado no início.

## Etapa 2 — BC550 (12 chaves, FB100/FB101)
1. ET200: criar o DB41 `ComBC550` (layout igual ao DB38; arquivo `db41_ComBC550_v0.1.scl`) e fazer o FC4 comandar/ler as contatoras do BC550 nos mesmos bits do DB41. Se o número 41 estiver ocupado, use outro: altere `remoto` em `plc/bt2/gerador/bancos_bt2_v0.2.json`, rode o gerador e use as chamadas novas (`ET200_PREVISIBILIDADE_v0.1.md`).
2. 1515: importar `db3300_BC550_Chaves_v0.2.db`, `db3302_BC550_SetupPorTensao_v0.2.db`; criar instâncias `db3304i_BC550_SetupChaves` (FB100) e `db3305i_BC550_ComEt200` (FB101); colar as chamadas de `chamadas_BC550_v0.2.scl` no OB1.
3. Node-RED: importar `chaves-550-api-v1.1.json`, Deploy.
4. Teste com o banco **desligado**: chip de comunicação, seletora, uma chave de cada vez com a carga desconectada.
5. Medidor: abrir com `?novos=1` (ou Detalhes › Ajustes › "BC59,5 e BC550 já estão no PLC"). Isso liga os dois bancos novos; o BC59,5 ainda ficará "sem leitura" até a etapa 3.

## Etapa 3 — BC59,5 (18 chaves, FB102/FB103)
Igual à etapa 2, trocando: `fb102_setupChaves32_v0.1.scl` e `fb103_ComEt200_32_v0.1.scl` (importar os FBs antes), `db3200…`, `db3202…`, `chamadas_BC595_v0.2.scl`, remoto `db40_ComBC595_32_v0.2.scl` (16 bytes), fluxo `chaves-595-api-v1.1.json`. O FC4 do ET200 precisa tratar 32 bits de comando e 32 de feedback para este banco.

## O que me mandar depois de cada etapa
Erros do TIA (texto), o que o chip de comunicação mostra e a janela 🧪 Cards x flow. Com isso ajusto e gero nova versão.
