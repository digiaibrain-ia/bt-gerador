#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.174.html a partir da v1.10.173 (nao sobrescreve; aborta se um trecho esperado mudou).
CORRECAO (log do Reginaldo, 06/11/2026): na Central de registros o botao ✕ NAO fechava (dezenas de cliques sem "fechou popup dlgCentral" no log) e a janela
NAO se movia. Causa: o ✕ e o arrastar sao ligados UMA VEZ, quando a pagina carrega, so nos <dialog class="jan"> que ja existem; a Central criava o dialogo
depois (na 1a abertura) e ficava sem os dois. Agora o dialogo da Central fica NO HTML (mesmo texto do modulo central_registros_v0.2.js) e o modulo v0.2 usa o existente.
O teste antigo fechava o dialogo por codigo (d.close()), por isso nao pegou: o novo clica no ✕ e arrasta a barra de titulo com o mouse de verdade.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.174_v0.1.py
"""
import json, os, re
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
MOD1 = os.path.join(RAIZ, 'dashboard', 'modulos-fonte', 'central_registros_v0.1.js')
MOD2 = os.path.join(RAIZ, 'dashboard', 'modulos-fonte', 'central_registros_v0.2.js')
ORIG, DEST = 'medidor_gerador_v1.10.173.html', 'medidor_gerador_v1.10.174.html'


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    m1, m2 = open(MOD1, encoding='utf-8').read(), open(MOD2, encoding='utf-8').read()
    corpo = json.loads(re.search(r'const CORPO = ("(?:[^"\\]|\\.)*");', m2).group(1))
    t = troca(t, '<meta name="app-version" content="1.10.173">', '<meta name="app-version" content="1.10.174">', 'meta')
    t = troca(t, "const VERSAO='1.10.173', VERSAO_DATA='06/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.174', VERSAO_DATA='06/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.174\",d:\"06/11/2026\",i:[\n"
              "    'CORREÇÃO (log do operador): a janela \"Central de registros\" não fechava (o ✕ não respondia) e não se movia. O ✕ e o arrastar são ligados ao carregar a página só nas janelas que já existem; a Central era criada depois e ficava sem os dois. Agora ela está no HTML como as outras janelas (fecha com ✕, arrasta pela barra de título, Esc). O teste novo clica no ✕ e arrasta a barra de verdade.',\n"
              "  ]},\n", 'historico')
    # dialogo estatico (antes do dlgOcor, para receber o fechar/arrastar ligados no carregamento)
    estatico = ('<dialog id="dlgCentral" class="jan" data-nofora style="--w:640px" aria-labelledby="cenT">' + corpo + '</dialog>\n\n')
    t = troca(t, '<dialog id="dlgOcor" class="jan livre" data-nofora style="--w:1040px" aria-labelledby="ocTit">',
              estatico + '<dialog id="dlgOcor" class="jan livre" data-nofora style="--w:1040px" aria-labelledby="ocTit">', 'dialogo estatico')
    # troca o modulo embutido v0.1 pelo v0.2
    velho_cab = "/* ===== central_registros_v0.1 (Central de registros) — fonte: dashboard/modulos-fonte/central_registros_v0.1.js ===== */\n" + m1
    novo_cab = "/* ===== central_registros_v0.2 (Central de registros) — fonte: dashboard/modulos-fonte/central_registros_v0.2.js ===== */\n" + m2
    t = troca(t, velho_cab, novo_cab, 'modulo v0.1 -> v0.2')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
