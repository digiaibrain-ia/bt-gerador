#!/usr/bin/env python3
"""gerar_indice_por_area_v0.1.py — gera docs/INDICE_POR_AREA.md (21/11/2026).

PARA QUE SERVE (leigo): o cofre do Obsidian (a pasta docs) tinha mais de 200 notas, e so umas 50 estavam ligadas ao indice; as outras apareciam soltas no grafo. Este script monta
um indice por AREA (arquitetura, PLC, implantacao, auditoria, medidor...) em que CADA documento vivo tem um link. De cada documento mostra a versao MAIS NOVA e deixa as anteriores ao lado.
A pasta docs/arquivo (historico) fica de fora DE PROPOSITO.

COMO FUNCIONA (tecnico): percorre docs/ (menos docs/arquivo), agrupa por (pasta, nome sem versao _vN.N, extensao), ordena as versoes e escreve os links relativos. O titulo vem do primeiro '# ' do .md.
Arquivos que o Obsidian nao abre (xlsx, html, txt, csv) tambem entram, marcados, e abrem no programa do Windows. Nao escreve em nenhuma outra pasta.
USO: python3 scripts/docs/gerar_indice_por_area_v0.1.py        (refaz docs/INDICE_POR_AREA.md; pode rodar de novo quando entrar documento novo)
"""
import os, re, sys, urllib.parse

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DOCS = os.path.join(RAIZ, 'docs')
SAIDA = os.path.join(DOCS, 'INDICE_POR_AREA.md')
DATA = '21/11/2026'
# (pasta relativa a docs, nome da area, para que serve) na ordem em que aparecem
AREAS = [
    ('bt2/decisoes', 'Decisões (DEC)', 'Cada decisão do Reginaldo, com data e motivo.'),
    ('bt2/promessas', 'Promessas dos módulos (PRM)', 'O que cada parte garante, em português. Você revisa a promessa; os testes conferem o código.'),
    ('bt2/auditoria', 'Auditoria, passos de 1 a 9 e provas', 'Auditoria pelos 5 fundamentos, passos de correção, provas de teste, revisão independente e congelamento.'),
    ('bt2/migracao', 'Implantação, bancada e handoff', 'Roteiros, checklists, estados da bancada e entregas. O roteiro e o checklist de go-live mais novos estão aqui.'),
    ('bt2/arquitetura', 'Arquitetura', 'Quem fala com quem.'),
    ('bt2/plc', 'PLC, blocos e numeração', 'Blocos, DBs, plano de numeração, equipamentos e CPUs.'),
    ('bt2/modulos', 'Módulos do medidor', 'Como cada módulo do medidor funciona (alarmes, Central de registros, mapa dos FBs, RNC...).'),
    ('bt2/ensaio', 'Ensaio e registro', 'Dados do ensaio, registro, gráficos e analisador.'),
    ('bt2/contratos', 'Contratos de API', 'As rotas HTTP do Node-RED e o que cada uma devolve.'),
    ('bt2/fase3', 'Fase 3 (concorrência e fila)', 'Estresse, concorrência e fechamento da fase.'),
    ('bt2/fase4', 'Fase 4 (travas de segurança)', 'Travas, portões e as correções da fase.'),
    ('bt2/analise', 'Análises', ''), ('bt2/defeitos', 'Defeitos', ''), ('bt2/passagem', 'Passagem entre sessões', 'Para quem assume o trabalho.'),
    ('bt2/padroes', 'Padrões do BT2', 'Padrão de fluxos e de comentários.'), ('padroes', 'Padrões gerais', ''),
    ('bt2', 'Raiz do BT2', ''),
    ('modulos', 'Módulos (documentos gerais)', ''), ('geral', 'Geral', ''), ('seguranca', 'Segurança', ''),
    ('licoes', 'Lições aprendidas', ''), ('criatividade', 'Criatividade', ''), ('criatividade/extratos', 'Criatividade: extratos', ''),
    ('_modelos', 'Modelos para novas notas', 'Aponte a pasta de modelos do Obsidian para cá.'),
]
ABRE = {'.md'}
VER = re.compile(r'_v(\d+(?:[._]\d+)*)(?=(?:\.[A-Za-z0-9]+)+$)')


def versao(nome):
    m = VER.search(nome)
    return tuple(int(x) for x in re.split(r'[._]', m.group(1))) if m else ()


def base(nome):
    return VER.sub('', nome)


def titulo(caminho, nome):
    if nome.endswith('.md'):
        try:
            for l in open(caminho, encoding='utf-8'):
                if l.startswith('# '):
                    t = l[2:].strip()
                    return re.sub(r'[\[\]]', '', t)[:140]
        except Exception:
            pass
    return os.path.splitext(nome)[0].replace('_', ' ')


def link(rel, texto):
    return '[%s](%s)' % (texto.replace('|', '/'), urllib.parse.quote(rel.replace(os.sep, '/'), safe='/'))


def lista_pasta(rel_pasta):
    p = os.path.join(DOCS, rel_pasta)
    if not os.path.isdir(p):
        return []
    arqs = [f for f in sorted(os.listdir(p)) if os.path.isfile(os.path.join(p, f)) and f != '.gitkeep']
    grupos = {}
    for f in arqs:
        if rel_pasta == '' and f in ('INDICE_POR_AREA.md',):
            continue
        grupos.setdefault((base(f), os.path.splitext(f)[1].lower()), []).append(f)
    linhas = []
    for (b, ext), fs in sorted(grupos.items(), key=lambda kv: kv[0][0].lower()):
        fs.sort(key=lambda x: (versao(x), x), reverse=True)
        novo = fs[0]; cam = os.path.join(p, novo); rel = os.path.relpath(cam, DOCS)
        marca = '' if ext in ABRE else ' *(abre no programa do Windows)*'
        ver = ('v' + '.'.join(str(x) for x in versao(novo))) if versao(novo) else ''
        linha = '- %s%s%s' % (link(rel, titulo(cam, novo)), (' · ' + ver) if ver else '', marca)
        if len(fs) > 1:
            ant = ', '.join(link(os.path.relpath(os.path.join(p, x), DOCS), 'v' + '.'.join(str(y) for y in versao(x)) if versao(x) else x) for x in fs[1:])
            linha += ' · anteriores: ' + ant
        linhas.append(linha)
    return linhas


def main():
    out = ['# Índice por área · %s' % DATA, '',
           'Gerado por `scripts/docs/gerar_indice_por_area_v0.1.py`: **não edite à mão**, rode o script de novo quando entrar documento novo. Cada documento vivo tem um link aqui. De cada um aparece a **versão mais nova**, e as anteriores ficam ao lado. A pasta `arquivo` (histórico) fica de fora de propósito. Para começar, use o [00_COMECE_AQUI](00_COMECE_AQUI.md).', '']
    total = 0
    for rel, nome, desc in AREAS:
        ls = lista_pasta(rel)
        if rel == 'bt2':
            ls = [l for l in ls]   # so os arquivos soltos da raiz (as subpastas sao areas)
        if not ls:
            continue
        out += ['## %s' % nome, ('_%s_' % desc) if desc else '', ''] if desc else ['## %s' % nome, '']
        out += ls + ['']
        total += len(ls)
    raiz = lista_pasta('')
    out += ['## Raiz da pasta docs', ''] + raiz + ['']
    total += len(raiz)
    out += ['---', '%d entradas (cada uma pode ter versões anteriores).' % total, '']
    open(SAIDA, 'w', encoding='utf-8', newline='\n').write('\n'.join(out))
    print('gerado', os.path.relpath(SAIDA, RAIZ), total, 'entradas')


if __name__ == '__main__':
    main()
