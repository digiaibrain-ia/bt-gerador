#!/usr/bin/env python3
"""12/11/2026 - PLANO_NUMERACAO_BLOCOS_PLC_v7.3.xlsx = v7.2 + repasse do DB2000 (DSE) do 1515 ao PLC de Carga: FB104 (fb104_putDseCarga), instancia DB2001 (db2001i_DSE_PutCarga)
e o db2000_BancoTeste2_DSE tambem no 1200 (mesmo numero, 136 B, so leitura). Nao sobrescreve. Uso: python3 plc/bt2/gerador/gerar_plano_numeracao_v7_3.py"""
import os, openpyxl
D = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'docs', 'bt2', 'plc'))
src, dst = os.path.join(D, 'PLANO_NUMERACAO_BLOCOS_PLC_v7.2.xlsx'), os.path.join(D, 'PLANO_NUMERACAO_BLOCOS_PLC_v7.3.xlsx'); assert not os.path.exists(dst)
wb = openpyxl.load_workbook(src)
m = wb['Mapa_BT2']
m.append(['(novo) FB104 fb104_putDseCarga', 104, 'fb104_putDseCarga', 'não', '1515: PUT cíclico do DB2000 (bytes 0..135) para o PLC de Carga (só grandezas da tela do operador). Decisão 12/11/2026. Próximo FB livre (102/103 reservados p/ 32 chaves).'])
m.append(['(novo) inst. FB104 (DSE)', '=Regras!B5+1', 'db2001i_DSE_PutCarga', 'não (só PLC)', 'instância do FB104 (faixa 2000-2099); criada ao inserir a chamada (nº e nome manuais).'])
m.append(['(novo) DB2000 no PLC de Carga (1200)', '=Regras!B5', 'db2000_BancoTeste2_DSE', 'não', 'MESMO número e offsets do DB2000 do 1515 (DBB0..DBB135), sem acesso otimizado, SÓ LEITURA (escrito só pelo PUT do 1515). O Node-RED grava só no 1515.'])
c = wb['PLC_Carga_1200']
c.append([]); c.append(['DSE para a tela do PLC de Carga (v7.3, 12/11/2026)'])
c.append(['db2000_BancoTeste2_DSE', 'DB', '1200: DB2000, 136 B, só leitura', 'PUT do 1515: P#DB2000.DBX0.0 BYTE 136', 'bloco do 1515: fb104_putDseCarga (FB104), instância db2001i_DSE_PutCarga (DB2001)'])
wb['Regras']['A1'] = 'Numeração de blocos do PLC — BT2 — v7.3 — 12/11/2026 (+ DSE: FB104, DB2001, DB2000 também no 1200)'
wb.save(dst); print('gerado', os.path.relpath(dst))
