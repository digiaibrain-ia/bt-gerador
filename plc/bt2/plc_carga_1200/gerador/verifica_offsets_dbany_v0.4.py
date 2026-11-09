#!/usr/bin/env python3
"""v0.4: confere se as constantes OFS_* dos FBs DB_ANY batem com o layout calculado dos tipos. PROVA so consistencia; NAO prova compilacao nem PEEK/POKE na CPU."""
import os, re, sys, importlib.util
D = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sp = importlib.util.spec_from_file_location('v1', os.path.join(os.path.dirname(__file__), 'verifica_offsets_v0.1.py')); v1 = importlib.util.module_from_spec(sp); sp.loader.exec_module(v1)
mapa = {'CMD': 'cmd', 'VIDA': 'vida1515', 'LIG': 'ligarBanco', 'HAB': 'habPed', 'SEQ': 'seq', 'FBK': 'fbk', 'VIDAET': 'vidaET', 'SEL': 'seletoraAuto', 'HABR': 'habResp', 'ECO': 'eco', 'FALHA': 'falhaRetorno', 'COL': 'contatorColado'}
erros = []
for N, tipos, tipo in ((16, 'tipos_ComBanco_v0.3.scl', 'typeComBanco16'), (32, 'tipos_ComBanco32_v0.2.scl', 'typeComBanco32')):
    lay, _ = v1.layout(v1.le_campos(open(os.path.join(D, tipos), encoding='utf-8').read(), tipo))
    fb = open(os.path.join(D, 'fb_bancoCarga%d_v0.4.scl' % N), encoding='utf-8').read()
    for k, campo in mapa.items():
        m = re.search(r'OFS_%s : UInt := (\d+);' % k, fb)
        if not m or int(m.group(1)) != lay[campo][0]: erros.append('FB%d OFS_%s=%s, tipo %s=%s' % (N, k, m and m.group(1), campo, lay[campo][0]))
    for tx in ('DbCom', 'DbCompet', 'DB_ANY_TO_UINT'):
        if tx not in fb: erros.append('FB%d sem %s' % (N, tx))
    if re.search(r'POKE\w*\(.*OFS_(CMD|VIDA|LIG|HAB|SEQ)\b', fb): erros.append('FB%d escreve no PEDIDO (escritor unico violado)' % N)
if erros: print('FALHOU:'); [print(' -', e) for e in erros]; sys.exit(1)
print('OK: OFS_* dos FBs DB_ANY (16 e 32 chaves) = layout dos tipos; nenhum POKE no PEDIDO.')
