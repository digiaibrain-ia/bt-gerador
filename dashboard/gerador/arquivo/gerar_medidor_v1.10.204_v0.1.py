#!/usr/bin/env python3
"""14/11/2026 - Gera medidor_gerador_v1.10.204.html (de 1.10.203). Nao sobrescreve; aborta se um trecho esperado mudou.
So troca o decodificador colado inline (decodifica_serie_mwm v0.1 -> v0.2): aceita o NS do MES com 10 caracteres = 'S' + NS da ETD 091 (ex.: SDFWA01715), com aviso do prefixo.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.204_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); MF, FE = os.path.join(R, 'dashboard', 'modulos-fonte'), os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(FE, 'medidor_gerador_v1.10.203.html'), os.path.join(FE, 'medidor_gerador_v1.10.204.html'); assert os.path.exists(o) and not os.path.exists(d)
t = open(o, encoding='utf-8').read()
v1 = open(os.path.join(MF, 'decodifica_serie_mwm_v0.1.js'), encoding='utf-8').read(); v2 = open(os.path.join(MF, 'decodifica_serie_mwm_v0.2.js'), encoding='utf-8').read()
t = troca(t, v1, v2, 'decodificador')
t = troca(t, '<meta name="app-version" content="1.10.203">', '<meta name="app-version" content="1.10.204">', 'meta')
t = troca(t, "const VERSAO='1.10.203', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n",
          "const VERSAO='1.10.204', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.204\",d:\"14/11/2026\",i:[\n"
          "    'NÚMERO DE SÉRIE DO MES COM \"S\" NA FRENTE: o Dados do ensaio por nº de série agora aceita o NS de 10 caracteres do MES (ex.: SDFWA01715 = S + DFWA01715). O S não consta na ETD 091 rev.05: aparece como aviso (significado a confirmar com a engenharia) e o resto é decodificado pela norma. Qualquer outra letra na frente continua recusada.'\n  ]},\n", 'hist')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.204.html ok')
