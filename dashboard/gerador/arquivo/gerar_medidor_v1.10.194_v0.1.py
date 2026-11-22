#!/usr/bin/env python3
"""10/11/2026 - gera medidor_gerador_v1.10.194.html a partir da 1.10.193 (nao sobrescreve; aborta se um trecho esperado mudou) e index_v0.7.html a partir do index_v0.6.html.
Solucao definitiva do catalogo: os dois passam a carregar catalogo_ferramentas.js (nome SEM versao, gerado pela pasta). Nada mais muda.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.194_v0.1.py"""
import os
P = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')), 'dashboard', 'ferramentas')
def troca(t, a, b, nome, n=1):
    assert t.count(a) == n, 'trecho esperado %dx (%s): achei %d' % (n, nome, t.count(a)); return t.replace(a, b)
def grava(o, d, f):
    po, pd = os.path.join(P, o), os.path.join(P, d); assert os.path.exists(po) and not os.path.exists(pd), 'origem ausente ou destino existe: ' + d
    open(pd, 'w', encoding='utf-8').write(f(open(po, encoding='utf-8').read())); print(d, 'ok')
def med(t):
    t = troca(t, '<meta name="app-version" content="1.10.193">', '<meta name="app-version" content="1.10.194">', 'meta')
    t = troca(t, "const VERSAO='1.10.193', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.194', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.194\",d:\"10/11/2026\",i:[\n"
              "    'Carrega catalogo_ferramentas.js (nome sem versão, gerado pela pasta): a lista de ferramentas nunca mais fica uma versão atrás. Nada mais mudou.'\n  ]},\n", 'historico')
    return troca(t, '<script src="catalogo_ferramentas_v0.8.js"></script>', '<script src="catalogo_ferramentas.js"></script>', 'script')
def idx(t):
    t = troca(t, '<meta name="app-version" content="0.6">', '<meta name="app-version" content="0.7">', 'meta')
    t = troca(t, '<!-- index_v0.6 ·', '<!-- index_v0.7 · 10/11/2026 — carrega catalogo_ferramentas.js (nome sem versão, gerado pela pasta). Resto igual a v0.6. | index_v0.6 ·', 'cab')
    return troca(t, 'catalogo_ferramentas_v0.8.js', 'catalogo_ferramentas.js', 'catalogo', 13)
if __name__ == '__main__':
    grava('medidor_gerador_v1.10.193.html', 'medidor_gerador_v1.10.194.html', med); grava('index_v0.6.html', 'index_v0.7.html', idx)
