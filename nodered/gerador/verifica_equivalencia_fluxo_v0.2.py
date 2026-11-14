#!/usr/bin/env python3
"""13/11/2026 - PROVA DE EQUIVALENCIA entre dois fluxos Node-RED (original x organizado). Passa so se: (1) todo no do original existe no novo com as MESMAS propriedades (menos x, y, info, wires, g e, na aba, label/info);
(2) o novo so acrescenta nos de tipo link in/link out/group/comment; (3) o conjunto de ligacoes (origem, saida, destino), seguindo os caminhos pelos nos link, e IGUAL ao do original.
v0.2: opcao --ignora nome1,nome2 (propriedades extras a ignorar; ex.: name, quando o novo SO renomeia nos). Uso: python3 nodered/gerador/verifica_equivalencia_fluxo_v0.2.py <original.json> <novo.json> [--ignora name,label]   (saida 1 se diferente)"""
import json, sys
IGN = {'x', 'y', 'info', 'wires', 'g'}
def arestas(flow, expande):
    por = {n['id']: n for n in flow}; out = set()
    def finais(t, vis=()):
        n = por.get(t)
        if n and n['type'] == 'link out' and expande:
            r = set()
            for li in n.get('links', []):
                if li in vis: continue
                for o in por[li].get('wires', []):
                    for w in o: r |= finais(w, vis + (li,))
            return r
        if n and n['type'] == 'link in' and expande:
            r = set()
            for o in n.get('wires', []):
                for w in o: r |= finais(w, vis)
            return r
        return {t}
    for n in flow:
        if n['type'] in ('link in', 'link out', 'group', 'comment'): continue
        for p, o in enumerate(n.get('wires', [])):
            for w in o:
                for d in finais(w): out.add((n['id'], p, d))
    return out
def main():
    extra = set(sys.argv[sys.argv.index('--ignora') + 1].split(',')) if '--ignora' in sys.argv else set()
    a = json.load(open(sys.argv[1], encoding='utf-8')); b = json.load(open(sys.argv[2], encoding='utf-8')); erros = []
    pa, pb = {n['id']: n for n in a}, {n['id']: n for n in b}
    for i, n in pa.items():
        if i not in pb: erros.append('no sumiu: %s (%s)' % (i, n.get('name'))); continue
        ign = IGN | extra | ({'label'} if n['type'] == 'tab' else set())
        x, y = {k: v for k, v in n.items() if k not in ign}, {k: v for k, v in pb[i].items() if k not in ign}
        if x != y: erros.append('propriedade mudou em %s (%s): %s' % (i, n.get('name'), sorted(k for k in set(x) | set(y) if x.get(k) != y.get(k))))
    for i, n in pb.items():
        if i not in pa and n['type'] not in ('link in', 'link out', 'group', 'comment'): erros.append('no novo inesperado: %s (%s)' % (i, n['type']))
    ea, eb = arestas(a, False), arestas(b, True)
    for e in sorted(ea - eb): erros.append('ligacao perdida: %s' % (e,))
    for e in sorted(eb - ea): erros.append('ligacao nova: %s' % (e,))
    print('nos originais: %d | nos novos: %d | ligacoes originais: %d | ligacoes (via links) novas: %d' % (len(pa), len(pb), len(ea), len(eb)))
    if erros: print('DIFERENTE:'); [print('  -', e) for e in erros[:30]]; sys.exit(1)
    print('EQUIVALENTE: mesmos nos, mesmas propriedades e mesmas ligacoes.')
if __name__ == '__main__': main()
