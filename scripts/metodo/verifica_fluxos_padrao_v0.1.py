#!/usr/bin/env python3
"""13/11/2026 - VERIFICA O PADRAO DE FLUXOS NODE-RED DO BT2 (docs/bt2/padroes/PADRAO_FLUXOS_NODERED_v0.1.md). Para cada .json: (C1) a aba se chama "<Nome> vX.Y" e X.Y = versao do NOME DO ARQUIVO;
(C2) o info da aba comeca com "vX.Y (data)" da mesma versao; (C3) existe nota de cabecalho (comment) com a mesma versao; (C4) todo no de logica (function, http in/response, s7, delay, trigger, inject, catch) tem info;
(C5) nenhuma nota (comment) com nome acima de 80 caracteres (texto longo vai no info). O campo "flow" que a API devolve ao HTML e o ID do CONTRATO (ex.: chaves-v2.5), nao a versao do arquivo: nao entra aqui.
Uso: python3 scripts/metodo/verifica_fluxos_padrao_v0.1.py <fluxo.json> [...]   (saida 1 se houver violacao)"""
import json, os, re, sys
LOGICA = {'function', 'http in', 'http response', 's7 in', 's7 out', 'delay', 'trigger', 'inject', 'catch'}
def verifica(path):
    erros = []; n = json.load(open(path, encoding='utf-8')); base = os.path.basename(path)
    m = re.search(r'-v(\d+)[._](\d+)\.json$', base)
    if not m: return ['nome do arquivo sem versao (-vX.Y.json)']
    ver = '%s.%s' % m.groups(); abas = [x for x in n if x['type'] == 'tab']
    for t in abas:
        mm = re.fullmatch(r'(.+?) v(\d+(?:\.\d+)+)', t.get('label', ''))
        if not mm: erros.append('C1 aba "%s" sem o padrao "<Nome> vX.Y"' % t.get('label'))
        elif mm.group(2) != ver: erros.append('C1 aba "%s": versao %s diferente da do arquivo (%s)' % (t['label'], mm.group(2), ver))
        if not re.match(r'v%s\b' % re.escape(ver), (t.get('info') or '').strip()): erros.append('C2 info da aba "%s" nao comeca com v%s' % (t.get('label'), ver))
        notas = [x for x in n if x['type'] == 'comment' and x.get('z') == t['id']]
        if not any(('v' + ver) in (x.get('name') or '') for x in notas): erros.append('C3 aba "%s": sem nota de cabecalho com v%s' % (t.get('label'), ver))
        for x in n:
            if x.get('z') != t['id']: continue
            if x['type'] in LOGICA and not (x.get('info') or '').strip(): erros.append('C4 no sem info: %s (%s)' % (x.get('name') or x['id'], x['type']))
            if x['type'] == 'comment' and len(x.get('name') or '') > 80: erros.append('C5 nota com %d caracteres (max 80): %s...' % (len(x['name']), x['name'][:40]))
    return erros
def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    ruim = 0
    for p in sys.argv[1:]:
        e = verifica(p); print(('OK       ' if not e else 'VIOLACAO ') + os.path.basename(p) + ('' if not e else ' (%d)' % len(e)))
        for x in e[:8]: print('    -', x)
        if len(e) > 8: print('    ... +%d' % (len(e) - 8))
        ruim += bool(e)
    sys.exit(1 if ruim else 0)
if __name__ == '__main__': main()
