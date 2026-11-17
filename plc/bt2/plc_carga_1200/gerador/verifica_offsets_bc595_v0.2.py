#!/usr/bin/env python3
"""Verifica offsets do BC59,5 (32 chaves) sem TIA. v0.2. PROVA so consistencia entre arquivos; NAO prova compilacao nem comportamento."""
import os, sys, importlib.util
D = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sp = importlib.util.spec_from_file_location('v1', os.path.join(os.path.dirname(__file__), 'verifica_offsets_v0.1.py')); v1 = importlib.util.module_from_spec(sp); sp.loader.exec_module(v1)
erros = []
tp = open(os.path.join(D, 'tipos_ComBanco32_v0.2.scl'), encoding='utf-8').read()
com, tam = v1.layout(v1.le_campos(tp, 'typeComBanco32'))
for k, v in {'cmd': 0, 'vida1515': 4, 'ligarBanco': 6, 'habPed': 8, 'seq': 12, 'fbk': 14, 'vidaET': 18, 'seletoraAuto': 20, 'habResp': 22, 'eco': 26, 'falhaRetorno': 28, 'contatorColado': 32}.items():
    if com[k][0] != v: erros.append('typeComBanco32.%s esperado %d, calculado %d' % (k, v, com[k][0]))
if tam != 36: erros.append('typeComBanco32 deveria ter 36 B, tem %d' % tam)
if com['fbk'][0] != 14 or tam - com['fbk'][0] != 22: erros.append('PUT/GET deveriam ser 14/22')
esp, t = v1.layout([('cb', 'Bool', 32), ('sb', 'Bool', 32), ('habilitada', 'Bool', 32), ('setupOk', 'Bool', 32), ('kwReal', 'Real', 32), ('rMedidoOhm', 'Real', 32), ('rTeoricoOhm', 'Real', 32)])
for k, v in {'habilitada': 8, 'setupOk': 12, 'kwReal': 16, 'rMedidoOhm': 144, 'rTeoricoOhm': 272}.items():
    if esp[k][0] != v: erros.append('espelho.%s esperado %d, calculado %d' % (k, v, esp[k][0]))
if t != 400 or (136, 128, 128) != (144 - 8, 272 - 144, 400 - 272) or max((136, 128, 128)) > 212: erros.append('3 PUTs do espelho nao fecham 8..399 ou passam de 212 B')
# 1515: DB v0.3 tem sbRet nos offsets certos e fb103 usa 14/22
db = open(os.path.join(D, '..', 'bancos_cargas', 'db3200_BC595_Chaves_v0.3.db'), encoding='utf-8').read()
fb = open(os.path.join(D, '..', 'comunicacao_et200', 'fb103_ComEt200_32_v0.3.scl'), encoding='utf-8').read()
ch = open(os.path.join(D, 'chamadas_1515_PUTGET_BC595_para_1200_v0.2.scl'), encoding='utf-8').read()
cb = open(os.path.join(D, '..', 'bancos_cargas', 'chamadas_BC595_v0.3.scl'), encoding='utf-8').read()
for tx in ('sbRet', 'respEcoOk'):
    if tx not in db: erros.append('DB3200 v0.3 sem ' + tx)
for tx in ('BYTE 14', 'BYTE 22'):
    if tx not in fb or tx not in cb: erros.append('fb103/chamadas sem ' + tx)
for tx in ('DB3200.DBX8.0 BYTE 136', 'DB3200.DBX144.0 BYTE 128', 'DB3200.DBX272.0 BYTE 128', 'DB3208.DBX0.0 BYTE 8'):
    if tx not in ch: erros.append('chamada espelho sem ' + tx)
dbs = open(os.path.join(D, 'dbs_Banco595_v0.2.scl'), encoding='utf-8').read()
for n in (3200, 3207, 3208):
    if 'DATA_BLOCK "db%d_' % n not in dbs: erros.append('DB%d ausente' % n)
if erros: print('FALHOU:'); [print(' -', e) for e in erros]; sys.exit(1)
print('OK: typeComBanco32 = 36 B (PUT 14 / GET 22); espelho 8..399 em 3 PUTs (136/128/128 B); DB3200 v0.3 com sbRet; fb103/chamadas coerentes.')
