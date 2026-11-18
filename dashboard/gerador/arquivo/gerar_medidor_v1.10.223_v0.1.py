#!/usr/bin/env python3
"""17/11/2026 - Gera medidor_gerador_v1.10.223.html (de 1.10.222). Nao sobrescreve; aborta se um trecho esperado mudou.
Conceito corrigido pelo Reginaldo: a "Tolerancia de carga (+-%)" padrao de 10 faz as faixas de 100 % e 107 % se sobreporem (100+-10 inclui 107). Padrao passa a 3 pontos (antes da v1.9.29 era 3).
Quem ja salvou parametros no navegador/PC mantem o valor salvo (ajuste o campo em Etapas e salve).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.223_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas')
L = lambda p: open(p, encoding='utf-8').read()
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.222.html'), os.path.join(F, 'medidor_gerador_v1.10.223.html'); assert os.path.exists(o) and not os.path.exists(d)
t = L(o)
t = troca(t, "let TOL=10,MODO='iso';", "let TOL=3,MODO='iso';", 'TOL')
t = troca(t, "etapas:[[0,2],[30,1],[50,1],[100,5],[107,2],[0,1]],tol:10,estMin", "etapas:[[0,2],[30,1],[50,1],[100,5],[107,2],[0,1]],tol:3,estMin", 'PARAM_ISO')
t = troca(t, '<meta name="app-version" content="1.10.222">', '<meta name="app-version" content="1.10.223">', 'meta')
hist = ("  {v:\"1.10.223\",d:\"17/11/2026\",i:[\n"
 "    'Conceito corrigido pelo Reginaldo: o padrão de \"Tolerância de carga (± %)\" era 10, o que faz as faixas dos degraus 100 % e 107 % se sobreporem (100 ± 10 já inclui 107). O padrão passa a 3 pontos (era 3 antes da v1.9.29). Quem já salvou parâmetros neste navegador/PC mantém o valor salvo: ajuste o campo em Etapas e salve.'\n"
 "  ]},\n")
t = troca(t, "const VERSAO='1.10.222', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n", "const VERSAO='1.10.223', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n" + hist, 'versao')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.223.html ok')
