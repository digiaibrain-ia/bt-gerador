#!/usr/bin/env python3
"""11/11/2026 - VERIFICA O PACOTE DE BLOCOS SCL ANTES DE ENTREGAR (fecho de dependencias). Nasceu do erro da entrega 1200 v0.9: o fc_bancosCarga1200 chamava "db3106_BC400_BancoCarga" e esse DB de instancia nao existia em nenhum arquivo.
Para uma pasta de blocos (.scl/.db): (1) lista o que o pacote DEFINE (FUNCTION_BLOCK, FUNCTION, DATA_BLOCK, TYPE); (2) lista os simbolos "entre aspas" USADOS no codigo (fora de comentarios);
(3) ERRO se um simbolo com cara de BLOCO (db<numero>_..., fb_..., fc_..., type...) e usado e nao e definido; (4) AVISO (lista) dos demais simbolos externos (tags, DBs de outro projeto): o programador precisa ter/criar.
(5) confere a ORDEM de importacao sugerida (quem usa vem depois de quem e usado). Saida 1 se houver ERRO. Uso: python3 plc/bt2/gerador/verifica_pacote_scl_v0.1.py <pasta>   (ex.: plc/bt2/entrega_1200_v0.10/PLC_CARGA_1200)"""
import os, re, sys
DEF = re.compile(r'^\s*(FUNCTION_BLOCK|FUNCTION|DATA_BLOCK|TYPE|ORGANIZATION_BLOCK)\s+"([^"]+)"', re.M)
BLOCO = re.compile(r'^(db\d+i?_|fb\d*_|fc\d*_|fb|fc|type|udt)', re.I)
def sem_comentarios(t):
    t = re.sub(r'\(\*.*?\*\)', '', t, flags=re.S); t = re.sub(r'/\*.*?\*/', '', t, flags=re.S)
    return '\n'.join(re.sub(r'//.*$', '', l) for l in t.split('\n'))
def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    pasta = sys.argv[1]; arqs = sorted(f for f in os.listdir(pasta) if f.endswith(('.scl', '.db'))); assert arqs, 'sem .scl/.db em ' + pasta
    defs, usos, uso_em = {}, {}, {}
    for f in arqs:
        t = open(os.path.join(pasta, f), encoding='utf-8').read()
        for k, n in DEF.findall(sem_comentarios(t)): defs[n] = (k, f)
    for f in arqs:
        c = sem_comentarios(open(os.path.join(pasta, f), encoding='utf-8').read())
        # tira as proprias declaracoes de cabecalho (TITLE/AUTHOR) e pega "simbolos"
        for n in set(re.findall(r'"([A-Za-z_][\w\.]*)"', re.sub(r'^\s*(TITLE|AUTHOR)\s*=.*$', '', c, flags=re.M))):
            if n in defs and defs[n][1] == f and re.search(r'^\s*(FUNCTION_BLOCK|FUNCTION|DATA_BLOCK|TYPE)\s+"%s"' % re.escape(n), c, re.M) and c.count('"%s"' % n) == 1: continue
            usos.setdefault(n, set()).add(f)
    erros, avisos = [], []
    for n, fs in sorted(usos.items()):
        if n in defs: continue
        (erros if BLOCO.match(n) else avisos).append('%s  (usado em %s)' % (n, ', '.join(sorted(fs))))
    # ordem: quem usa depois de quem e usado
    ordem = []
    for f in arqs:
        d = [n for n, (k, ff) in defs.items() if ff == f]; u = {x for n, fs in usos.items() if f in fs and n in defs and defs[n][1] != f for x in [defs[n][1]]}; ordem.append((f, u))
    print('Pasta:', pasta); print('DEFINIDOS (%d): %s' % (len(defs), ', '.join(sorted(defs))))
    print('ORDEM de importacao sugerida (quem e usado vem antes):')
    feitos, resto = [], dict(ordem)
    while resto:
        p = [f for f, u in resto.items() if u <= set(feitos)]
        if not p: erros.append('dependencia circular entre ' + ', '.join(resto)); break
        for f in sorted(p): feitos.append(f); resto.pop(f)
    for i, f in enumerate(feitos, 1): print('  %d. %s' % (i, f))
    if avisos: print('EXTERNOS que o programador precisa ter/criar (%d): %s' % (len(avisos), ' | '.join(a.split('  ')[0] for a in avisos)))
    if erros: print('ERRO (simbolo de bloco usado e NAO definido no pacote):'); [print('  -', e) for e in erros]; sys.exit(1)
    print('OK: todo bloco usado esta definido no pacote.')
if __name__ == '__main__': main()
