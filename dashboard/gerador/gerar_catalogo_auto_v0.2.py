#!/usr/bin/env python3
"""v0.2 (13/11/2026): apoio = menu_dev_v0.3.js (menu para operacao e dev). Base v0.1 abaixo.
10/11/2026 - SOLUCAO DEFINITIVA do catalogo de ferramentas: catalogo_ferramentas.js (nome SEM versao) e GERADO a partir dos arquivos que existem na pasta:
para cada ferramenta usa a MAIOR versao presente. Assim nenhum medidor/index precisa mudar quando uma ferramenta ganha versao nova (acabou a cadeia medidor -> catalogo -> medidor).
Os dados das ferramentas (id, grupo, nome, descricao, prefixo do arquivo) vem do catalogo_ferramentas_v0.8.js (base). Nao edite o catalogo_ferramentas.js a mao: gere de novo.
Uso: python3 dashboard/gerador/gerar_catalogo_auto_v0.1.py [pasta]      (padrao: dashboard/ferramentas; reescreve catalogo_ferramentas.js dessa pasta)"""
import os, re, sys
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); PASTA = os.path.join(RAIZ, 'dashboard', 'ferramentas')
BASE = 'catalogo_ferramentas_v0.8.js'
ITEM = re.compile(r"\{ id: '(\w+)',\s+grupo: '([^']*)',\s+nome: '([^']*)',\s+arquivo: '([^']+)',\s+desc: '([^']*)'( ,?\s*legado:\s*true)? \}")
VER = re.compile(r'^(?P<pre>.+_v)(?P<v>\d+(?:\.\d+)*)\.html$')
def vkey(v): return tuple(int(x) for x in v.split('.'))
def itens_base(texto):
    out = []
    for m in ITEM.finditer(texto):
        mv = VER.match(m.group(4)); assert mv, 'arquivo sem versao no nome: ' + m.group(4)
        out.append(dict(id=m.group(1), grupo=m.group(2), nome=m.group(3), pre=mv.group('pre'), desc=m.group(5)))
    assert len(out) == 7, 'esperava 7 ferramentas no catalogo base, achei %d' % len(out); return out
def monta(base_texto, presentes):
    """presentes: nomes de arquivo existentes. Devolve o texto do catalogo gerado."""
    its = itens_base(base_texto); linhas = []
    for i in its:
        c = [(vkey(VER.match(f).group('v')), f) for f in presentes if f.startswith(i['pre']) and VER.match(f) and VER.match(f).group('pre') == i['pre']]
        assert c, 'nenhum arquivo da ferramenta %s (%s*.html) na pasta' % (i['id'], i['pre']); arq = max(c)[1]
        linhas.append("    { id: '%s', grupo: '%s', nome: '%s', arquivo: '%s', desc: '%s' }," % (i['id'], i['grupo'], i['nome'], arq, i['desc']))
    corpo = base_texto
    ini = corpo.index('window.CATALOGO_FERRAMENTAS = {'); fim = corpo.index('/* v0.7.1')
    cab = ('/* =====================================================================================================================\n'
           '   catalogo_ferramentas.js - GERADO (nao editar a mao). Nome SEM versao de proposito: medidor e index carregam sempre este nome.\n'
           '   Cada ferramenta aponta para a MAIOR versao do arquivo presente na pasta (gerado por dashboard/gerador/gerar_catalogo_auto_v0.2.py, tambem rodado pelo gerador do pacote).\n'
           '   Para trocar a versao de uma ferramenta: copie o arquivo novo para a pasta e gere de novo (ou, so neste navegador, use "Escolher arquivo..." no index).\n'
           '   NAO FAZ: nao le PLC, DSE nem Node-RED; nao grava nada. So descreve arquivos.\n'
           '   ===================================================================================================================== */\n')
    meio = ("window.CATALOGO_FERRAMENTAS = {\n  atualizado: '10/11/2026 (gerado)',\n  apoio: ['catalogo_ferramentas.js', 'menu_dev_v0.3.js'],   // .js que o medidor carrega da MESMA pasta; o index confere se estao la\n  itens: [\n"
            + '\n'.join(linhas) + '\n  ]\n};\n')
    return cab + meio + corpo[fim:]
def main():
    pasta = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else PASTA
    base = open(os.path.join(PASTA, BASE), encoding='utf-8').read()
    t = monta(base, os.listdir(pasta)); d = os.path.join(pasta, 'catalogo_ferramentas.js')
    open(d, 'w', encoding='utf-8').write(t); print('gerado', d)
if __name__ == '__main__': main()
