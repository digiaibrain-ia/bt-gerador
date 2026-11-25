#!/usr/bin/env python3
"""gerar_decifrador_ns_v0.1.py — monta dashboard/ferramentas/decifrador_ns_card_ensaio_v0.1.html (25/11/2026).

PARA QUE SERVE (leigo): junta num arquivo só (1) a página-modelo, (2) o decodificador do nº de série SEM ALTERAÇÃO
(dashboard/modulos-fonte/decodifica_serie_mwm_v0.3.js) e (3) a lista de PN da planilha "Mapeamento do produto gerador".
Assim a engenharia valida exatamente o código que depois vai para o medidor.

COMO RODAR (da raiz do repositório):
  python3 dashboard/gerador/gerar_decifrador_ns_v0.1.py "C:\\caminho\\Mapeamento_do_produto_gerador.xlsx"
Precisa de openpyxl (pip install openpyxl). Lê a 1a aba (Produto): colunas A combustível, B motor, C PN (aplicação), D kVA.
NÃO FAZ: não altera o medidor nem nenhum arquivo de produção; só escreve o HTML de saída. Não guarda senha nem rede.
"""
import json, sys, pathlib
import openpyxl

RAIZ = pathlib.Path(__file__).resolve().parents[2]
MODELO = RAIZ / 'dashboard/gerador/decifrador_ns_template_v0.1.html'
MODULO = RAIZ / 'dashboard/modulos-fonte/decodifica_serie_mwm_v0.3.js'
SAIDA = RAIZ / 'dashboard/ferramentas/decifrador_ns_card_ensaio_v0.1.html'

def le_planilha(xlsx):
    ws = openpyxl.load_workbook(xlsx, data_only=False).worksheets[0]
    linhas = []
    for r in ws.iter_rows(min_row=4, values_only=True):
        if r[0] and r[2]:
            linhas.append([str(r[2]).strip(), str(r[0]).strip(), str(r[1]).strip(), int(r[3])])
    return linhas

def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    pl = le_planilha(sys.argv[1])
    html = MODELO.read_text(encoding='utf-8')
    mod = MODULO.read_text(encoding='utf-8')
    assert '</script>' not in mod, 'módulo não pode conter </script>'
    assert '/*@@MODULO@@*/' in html and '/*@@PLANILHA@@*/[]' in html
    html = html.replace('/*@@MODULO@@*/', mod).replace('/*@@PLANILHA@@*/[]', json.dumps(pl, ensure_ascii=False, separators=(',', ':')))
    SAIDA.write_text(html, encoding='utf-8')
    print('OK:', SAIDA.relative_to(RAIZ), '·', len(pl), 'PN ·', len(html) // 1024, 'KB')

if __name__ == '__main__':
    main()
