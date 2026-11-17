---
name: bt2-licoes-plc
description: Licoes aprendidas do projeto BT2 sobre PLC Siemens (intertravamento SB/CB, comunicacao entre PLCs, ET200/1200/1515, DBs). Use ao desenhar blocos SCL, DBs ou comunicacao entre o 1515 e o PLC do banco.
---

# Lições BT2 — PLC / segurança de comando
Fonte: `docs/licoes/REGISTRO_LICOES_v0.1.md` (LL-001, LL-002, LL-040).

## Regras
- **O intertravamento de segurança mora no PLC do banco**, nunca só no HTML ou no fluxo. SB some → CB cai (T = 2 s), falha travada, rearme só por novo comando. LL-001
- Cada campo do DB tem **um só dono** (pedido escrito pelo 1515, resposta escrita pelo banco; eco de `seq`).
- Ventilador do banco sem sinal: aberto, decisão de projeto. LL-002
- Bancada com carga **desacoplada**. Nada vai ao PLC 1515, ao ET200 nem ao DSE sem backup e OK explícito do Reginaldo.
- Blocos novos: versão dentro do bloco (TITLE, VERSION, histórico) e nomes reais do projeto TIA; o que não foi visto no TIA fica "CONFIRMAR".
- Demo × Real: o que foi provado no PLC simulado **não prova** o PLC real. LL-040/041
- **ET200 = IM 151-8 PN/DP CPU (família S7-300)** (`docs/bt2/plc/EQUIPAMENTOS_E_CPU_v0.1.md`): `TON` (não `TON_TIME`), sem `S7_Optimized_Access`, sem `DB_ANY`/`PEEK`/`POKE`, sem `REGION`; **parâmetro IN_OUT de ARRAY não é repassável a outro FB** (erro "Invalid parameter assignment"): copiar para arrays estáticos do próprio FB. Nomes reais no projeto do ET200: `db38_ComBC56` (DB38), `db39_ComBC400` (DB39), `fb_bancoEt200_16` [FB2], `fc_bancosEt200` [FC5]; `fc_vidaET` não é mais usado. LL-055.
- **PLCSIM não simula o ET200** (S7-300); para exercitar a lógica, os mesmos fontes SCL rodam em um S7-1500 simulado. Ponto de retomada da bancada: `docs/bt2/migracao/ESTADO_BANCADA_2026-11-14.md`.
- **Memoria de um ciclo para o outro = STAT de FB, nunca TEMP de FC.** FC so organiza tags (copia entrada -> DB, chama o FB, copia DB -> saida). Ex.: imagem das saidas usada na supervisao do retorno SB (ET200, entrega v0.4). LL-064
- **DB de instancia (S7-300/ET200, fonte externa .db) tem este formato exato** (exportado pelo TIA do Reginaldo; BOM UTF-8 + CRLF): `DATA_BLOCK "nomeDoDB"` / `{ S7_Optimized_Access := 'FALSE' }` / `AUTHOR : RegLobo` / `VERSION : 0.1` / `"nome_do_FB"` / linha em branco / `BEGIN` / linha em branco / `END_DATA_BLOCK`. O DB de instancia de um FB **e entregue pronto como .db** junto com o FB (ex.: ibancosEt200_v0.1.db para o fb_bancosEt200); o programador so importa. LL-065
- **Cada instancia de FB e chamada UMA vez por ciclo** (duas chamadas = o FB roda 2x: vida, TON e supervisao dobram). Saidas (OUTPUT) do FB ja ficam no DB de instancia: leia `"DBinst".Saida`; nao precisa `Saida => "DBinst".Saida` (redundante). Ao entregar um FC que o programador ja comecou a preencher, **parta do arquivo dele** e confira que nao duplica chamada. LL-065
- **Comentarios de bloco SCL em 2 etiquetas** (padrao `docs/bt2/padroes/PADRAO_COMENTARIOS_SCL_FM_v0.1.md`): `//[F]` = FUNCIONAMENTO (o que faz e por que; barra `=====`) e `//[M]` = MONTAGEM NO TIA (ordem de importacao, numero/nome do DB, sem acesso otimizado, onde ligar os tags; barra `-----`). TODA linha de comentario leva a etiqueta (grafia unica `//[F]`, sem espaco), so ASCII, cada bloco tem as duas, e o ponto a preencher vai como `//[M] <- seu tag ...`. Conferir com `tests/plc_modelo/comentarios_marcados.test.js`. LL-067
- **1200 espelha o ET200 validado**: wrapper FB com STAT (`fb_bancosCarga1200`) + FC que so organiza + DB de instancia pronto `.db` + "Ligar Banco" com ComOk e trava apos queda + 1 chamada por ciclo + telegrama acessado pelo NOME do campo. `PEEK/POKE/DB_ANY` (existem no 1200) nunca foram provados: nao usar ate haver teste de bancada.
