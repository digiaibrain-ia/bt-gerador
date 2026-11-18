#!/usr/bin/env python3
"""10/11/2026 - gera catalogo_ferramentas_v0.8.js e medidor_gerador_v1.10.192.html (nao sobrescreve; aborta se um trecho esperado mudou).
Catalogo v0.7 -> v0.8: aponta para medidor 1.10.192, grafico_ensaio v0.13 e gerenciador_logs v1.9 (as duas ultimas sem IP real); apoio = catalogo v0.8 + menu_dev v0.2.
Medidor 1.10.191 -> 1.10.192: so carrega o catalogo v0.8 (o menu ☰ passa a abrir as versoes novas). Nada mais muda.
O index.html da pasta ferramentas ainda cita catalogo_ferramentas_v0.7.js (fica para versao propria do index).
Uso: python3 dashboard/gerador/gerar_catalogo_v0.8_e_medidor_v1.10.192_v0.1.py"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); P = os.path.join(RAIZ, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
def le(n): return open(os.path.join(P, n), encoding='utf-8').read()
def grava(n, t):
    p = os.path.join(P, n); assert not os.path.exists(p), 'ja existe: ' + n; open(p, 'w', encoding='utf-8').write(t); print('gerado', n)
def main():
    c = le('catalogo_ferramentas_v0.7.js')
    c = troca(c, "atualizado: '03/11/2026'", "atualizado: '10/11/2026'", 'data')
    c = troca(c, "apoio: ['catalogo_ferramentas_v0.7.js', 'menu_dev_v0.2.js']", "apoio: ['catalogo_ferramentas_v0.8.js', 'menu_dev_v0.2.js']", 'apoio')
    c = troca(c, "arquivo: 'medidor_gerador_v1.10.190.html'", "arquivo: 'medidor_gerador_v1.10.192.html'", 'medidor')
    c = troca(c, "arquivo: 'grafico_ensaio_v0.12.html'", "arquivo: 'grafico_ensaio_v0.13.html'", 'grafico')
    c = troca(c, "arquivo: 'gerenciador_logs_v1.8.html'", "arquivo: 'gerenciador_logs_v1.9.html'", 'gerenciador')
    c = troca(c, 'catalogo_ferramentas_v0.7.js — LISTA', 'catalogo_ferramentas_v0.8.js — LISTA', 'cab')
    grava('catalogo_ferramentas_v0.8.js', c)
    t = le('medidor_gerador_v1.10.191.html')
    t = troca(t, '<meta name="app-version" content="1.10.191">', '<meta name="app-version" content="1.10.192">', 'meta')
    t = troca(t, "const VERSAO='1.10.191', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.192', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.192\",d:\"10/11/2026\",i:[\n"
              "    'Carrega o catálogo de ferramentas v0.8 (menu ☰ abre gerenciador de logs v1.9 e gráfico v0.13, sem IP real). Nada mais mudou.'\n  ]},\n", 'historico')
    t = troca(t, '<script src="catalogo_ferramentas_v0.7.js"></script>', '<script src="catalogo_ferramentas_v0.8.js"></script>', 'script')
    grava('medidor_gerador_v1.10.192.html', t)
if __name__ == '__main__': main()
