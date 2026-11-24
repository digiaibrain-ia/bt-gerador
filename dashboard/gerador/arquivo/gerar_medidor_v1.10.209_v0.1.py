#!/usr/bin/env python3
"""14/11/2026 - Gera medidor_gerador_v1.10.209.html (de 1.10.208). Nao sobrescreve; aborta se um trecho esperado mudou.
Pedido do Reginaldo: "a area de visualizacao dos FB no celular e pequena, tem pouca altura". Medido na 1.10.208 (painel do Mapa dos FBs): o diagrama tinha 17 % da altura da tela em 390x844, 8 % em 360x740 e 34 % deitado.
Mudancas: (1) a copia EMBUTIDA do mapa passa da v0.18 para a v0.19 (cabecalho enxuto, faixa Gerador/Banco/Carga em uma linha, legenda no botao i). (2) painel do mapa em tela pequena (largura <= 700 px ou altura <= 520 px):
ocupa a tela inteira (100dvh, sem margem), barra de titulo em UMA linha (o botao "Janela propria" fica so com o icone) e o iframe usa todo o espaco que sobra (antes: altura fixa de 76vh). O PC nao muda.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.209_v0.1.py"""
import json, os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); FE = os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
def enc(x): return json.dumps(x, ensure_ascii=False).replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')

CSS = """  /* v1.10.209: painel do mapa em tela pequena = tela inteira, titulo em uma linha, iframe com todo o espaco que sobra (antes: altura fixa de 76vh). O PC nao muda. */
  @media (max-width:700px),(max-height:520px){
    dialog#dlgMapaFBs.jan.livre[open]{position:fixed;inset:0;width:100vw;max-width:100vw;height:100vh;height:100dvh;max-height:100vh;max-height:100dvh;margin:0;border-radius:0;resize:none}
    #dlgMapaFBs .jt{padding:4px 8px;gap:6px;flex-wrap:nowrap;min-height:0}
    #dlgMapaFBs .jt>span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #dlgMapaFBs .mjt{display:none}
    #dlgMapaFBs .jb{display:flex;flex:1 1 auto;min-height:0}
    #mapaFrame{flex:1 1 auto;height:auto;min-height:0}
  }
"""

def main():
    o, d = os.path.join(FE, 'medidor_gerador_v1.10.208.html'), os.path.join(FE, 'medidor_gerador_v1.10.209.html'); assert os.path.exists(o) and not os.path.exists(d)
    t = open(o, encoding='utf-8').read(); mapa = open(os.path.join(FE, 'mapa_fbs_v0.19.html'), encoding='utf-8').read()
    ini = t.index('window.EMB={grafico:') + len('window.EMB={grafico:'); _, n = json.JSONDecoder().raw_decode(t[ini:])
    assert t[ini + n:ini + n + len(',mapa:')] == ',mapa:'
    m0 = ini + n + len(',mapa:'); _, n2 = json.JSONDecoder().raw_decode(t[m0:]); assert t[m0 + n2] in '};,'
    t = t[:m0] + enc(mapa) + t[m0 + n2:]
    t = troca(t, '<meta name="app-version" content="1.10.208">', '<meta name="app-version" content="1.10.209">', 'meta')
    t = troca(t, "const VERSAO='1.10.208', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.209', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.209\",d:\"14/11/2026\",i:[\n"
              "    'MAPA DOS FBs NO CELULAR — MAIS ALTURA PARA O DIAGRAMA (pedido do Reginaldo): em celular em pé o diagrama tinha só 17 % da altura da tela (8 % em telas menores). Agora o painel do mapa ocupa a tela inteira, a barra de título fica em uma linha (o botão Janela própria vira só o ícone ↗) e dentro do mapa o cabeçalho ficou enxuto (botões de modo curtos, título escondido), a faixa Gerador/Banco/Carga virou uma linha de resumo com o botão ▸ para abrir o detalhe, e a legenda foi para o botão ⓘ (painel suspenso). O PC não muda. Mapa embutido: v0.19.'\n  ]},\n", 'hist')
    t = troca(t, "  #mapaFrame{width:100%;height:76vh;min-height:360px;border:0;background:#fff;display:block}\n", "  #mapaFrame{width:100%;height:76vh;min-height:360px;border:0;background:#fff;display:block}\n" + CSS, 'css')
    t = troca(t, '>↗ Janela própria</button>', '>↗<span class="mjt"> Janela própria</span></button>', 'btn')
    open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.209.html ok')
if __name__ == '__main__': main()
