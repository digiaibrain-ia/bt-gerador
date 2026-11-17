#!/usr/bin/env python3
"""10/11/2026 - PLANO_NUMERACAO_BLOCOS_PLC_v7.1.xlsx = v7 com a CPU do banco de carga = 1214FC (decisao do Reginaldo). So troca texto '1215 FC' -> '1214FC' e o titulo. Nao sobrescreve.
Depois de gerar, abrir/converter no LibreOffice (ou Excel) para gravar os valores calculados. Uso: python3 plc/bt2/gerador/gerar_plano_numeracao_v7_1.py"""
import os, openpyxl
D = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'docs', 'bt2', 'plc'))
src, dst = os.path.join(D, 'PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx'), os.path.join(D, 'PLANO_NUMERACAO_BLOCOS_PLC_v7.1.xlsx'); assert not os.path.exists(dst)
wb = openpyxl.load_workbook(src)
for ws in wb:
    for row in ws.iter_rows():
        for c in row:
            if isinstance(c.value, str) and '1215 FC' in c.value: c.value = c.value.replace('1215 FC', '1214FC')
wb['Regras']['A1'] = 'Numeração de blocos do PLC — BT2 — v7.1 — 10/11/2026 (PLC de cargas = S7-1214FC; só BC56 e BC400 com blocos)'
wb.save(dst); print('gerado', os.path.relpath(dst))
