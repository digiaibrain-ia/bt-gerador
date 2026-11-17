#!/usr/bin/env python3
"""10/11/2026 - gera index_v0.6.html (ferramentas de DESENVOLVIMENTO) a partir do index.html (v0.5): so troca catalogo_ferramentas_v0.7.js -> v0.8 (13 citacoes) e a versao.
O index e so do desenvolvimento (decisao do Reginaldo, 10/11): nao vai para o PC de operacao. No pacote entra como 06_front_desenvolvimento/index.html. Nao sobrescreve."""
import os
P = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')), 'dashboard', 'ferramentas')
o, d = os.path.join(P, 'index.html'), os.path.join(P, 'index_v0.6.html'); assert os.path.exists(o) and not os.path.exists(d)
t = open(o, encoding='utf-8').read(); n = t.count('catalogo_ferramentas_v0.7.js'); assert n == 13, n
t = t.replace('catalogo_ferramentas_v0.7.js', 'catalogo_ferramentas_v0.8.js')
a = '<meta name="app-version" content="0.5">'; assert t.count(a) == 1; t = t.replace(a, '<meta name="app-version" content="0.6">')
a = '<!-- index.html (v0.5) ·'; assert t.count(a) == 1; t = t.replace(a, '<!-- index_v0.6 · 10/11/2026 — SO DESENVOLVIMENTO (nao vai para o PC de operacao); usa o catalogo v0.8. Resto igual a v0.5. | index.html (v0.5) ·')
open(d, 'w', encoding='utf-8').write(t); print('gerado index_v0.6.html')
