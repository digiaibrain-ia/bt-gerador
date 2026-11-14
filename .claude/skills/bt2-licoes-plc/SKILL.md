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
