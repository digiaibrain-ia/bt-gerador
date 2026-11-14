#!/usr/bin/env python3
"""11/11/2026 - PLANO_NUMERACAO_BLOCOS_PLC_v7.2.xlsx = v7.1 com os nomes dos DBs de instancia do fb_bancoCarga16 no padrao do projeto (db3006i_BC56_BancoCarga, db3106i_BC400_BancoCarga; "i" = instancia).
Nao sobrescreve. Depois de gerar, recalcular no LibreOffice/Excel. Uso: python3 plc/bt2/gerador/gerar_plano_numeracao_v7_2.py"""
import os, openpyxl
D = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'docs', 'bt2', 'plc'))
src, dst = os.path.join(D, 'PLANO_NUMERACAO_BLOCOS_PLC_v7.1.xlsx'), os.path.join(D, 'PLANO_NUMERACAO_BLOCOS_PLC_v7.2.xlsx'); assert not os.path.exists(dst)
wb = openpyxl.load_workbook(src); n = 0
for ws in wb:
    for row in ws.iter_rows():
        for c in row:
            if isinstance(c.value, str) and '_BancoCarga"' in c.value and c.value.startswith('="db"&F'):
                c.value = c.value.replace('="db"&F', '="db"&F', 1).replace('&"_', '&"i_', 1); n += 1
assert n == 4, n
wb['Regras']['A1'] = 'Numeração de blocos do PLC — BT2 — v7.2 — 11/11/2026 (DBs de instância do 1200 com "i": db3006i_..., db3106i_...)'
wb.save(dst); print('gerado', os.path.relpath(dst), n, 'formulas ajustadas')
