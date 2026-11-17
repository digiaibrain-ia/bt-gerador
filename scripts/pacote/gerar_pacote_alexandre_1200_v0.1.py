#!/usr/bin/env python3
"""Pacote enxuto para o programador do banco de carga (PLC de Carga 1200 + 1515 para consulta). FORA do Git, sem IP/senha/token (confere).
Uso: python3 scripts/pacote/gerar_pacote_alexandre_1200_v0.1.py <pasta_de_saida>   (nao sobrescreve)"""
import hashlib, os, re, sys, zipfile
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
E = 'plc/bt2/entrega_1200_v0.17/'
IP = re.compile(rb'\b(10|172\.(1[6-9]|2[0-9]|3[01])|192\.168)\.\d{1,3}\.\d{1,3}(\.\d{1,3})?\b')
def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    saida = os.path.abspath(sys.argv[1]); os.makedirs(saida, exist_ok=True)
    zp = os.path.join(saida, 'pacote_alexandre_1200_v0.17.zip'); assert not os.path.exists(zp), 'ja existe'
    itens = [('COMO_USAR.txt', open(RAIZ + '/' + E + 'COMO_USAR.txt', 'rb').read()),
             ('LEIA-ME.txt', open(RAIZ + '/docs/bt2/migracao/LEIA-ME_PACOTE_ALEXANDRE_1200_v0.1.txt', 'rb').read())]
    for pasta, destino in (('PLC_CARGA_1200', '1_PLC_CARGA_1200'), ('PLC_1515', '2_PLC_1515')):
        for n in sorted(os.listdir(RAIZ + '/' + E + pasta)):
            itens.append((destino + '/' + n, open(RAIZ + '/' + E + pasta + '/' + n, 'rb').read()))
    for d, b in itens: assert not IP.search(b), 'IP real em ' + d
    man = ''.join('%s  %s\n' % (hashlib.sha256(b).hexdigest(), d) for d, b in sorted(itens))
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
        for d, b in itens: z.writestr('pacote_alexandre_1200/' + d, b)
        z.writestr('pacote_alexandre_1200/MANIFESTO.sha256', man)
    print('gerado', zp, len(itens), 'arquivos')
if __name__ == '__main__': main()
