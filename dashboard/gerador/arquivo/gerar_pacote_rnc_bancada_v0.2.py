#!/usr/bin/env python3
"""gerar_pacote_rnc_bancada_v0.2.py (13/11/2026) - v0.2: o medidor do pacote passa a ser a v1.10.203 (a 202 sai do pacote).
 monta o .zip do TESTE DE BANCADA do RNC a partir dos arquivos do repositorio (nada e copiado a mao).
Uso: python3 dashboard/gerador/gerar_pacote_rnc_bancada_v0.2.py [pasta-de-saida]     (padrao: dashboard/pacotes)
Gera <saida>/rnc-bancada-v0.2.zip com fluxo/, public/, testes/, docs/, LEIA-ME.md e SHA256SUMS.txt. So le o repositorio; nao toca PC, PLC nem DSE."""
import hashlib, os, sys, zipfile
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ITENS = [
    ('nodered/flows/rnc-api-v1.1.json', 'fluxo/rnc-api-v1.1.json'),
    ('dashboard/ferramentas/rnc_registro_v0.1.html', 'public/rnc_registro_v0.1.html'),
    ('dashboard/ferramentas/rnc_reparo_v0.2.html', 'public/rnc_reparo_v0.2.html'),
    ('dashboard/ferramentas/medidor_gerador_v1.10.203.html', 'public/medidor_gerador_v1.10.203.html'),
    ('tests/rnc_teste_bancada_v0.1.js', 'testes/rnc_teste_bancada_v0.1.js'),
    ('docs/modulos/RNC_CHECKLIST_BANCADA_v0.1.md', 'docs/RNC_CHECKLIST_BANCADA_v0.1.md'),
    ('docs/modulos/RNC_RETRABALHO_v0.2.md', 'docs/RNC_RETRABALHO_v0.2.md'),
    ('docs/modulos/RNC_LEIA-ME_BANCADA_v0.1.md', 'LEIA-ME.md'),
]
def main():
    saida = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(R, 'dashboard', 'pacotes')
    os.makedirs(saida, exist_ok=True); dest = os.path.join(saida, 'rnc-bancada-v0.2.zip'); soma = []
    with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED) as z:
        for orig, nome in ITENS:
            b = open(os.path.join(R, orig), 'rb').read(); z.writestr(nome, b); soma.append('%s  %s' % (hashlib.sha256(b).hexdigest(), nome))
        z.writestr('SHA256SUMS.txt', '\n'.join(soma) + '\n')
    print('gerado', dest, os.path.getsize(dest), 'bytes'); print('\n'.join(soma))
if __name__ == '__main__': main()
