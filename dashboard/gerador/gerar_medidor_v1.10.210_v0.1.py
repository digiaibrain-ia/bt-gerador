#!/usr/bin/env python3
"""15/11/2026 - Gera medidor_gerador_v1.10.210.html (de 1.10.209). Nao sobrescreve; aborta se um trecho esperado mudou.
Pedido do Reginaldo: "a Central de registros ficou sem a funcao do botao Exportar". As outras telas (Grafico, Mapa, Logs) tem o menu "Exportar ▾"; a Central so tinha Salvar selecionados, Imprimir agora e Copiar resumo,
e o "Imprimir agora" despejava JSON e logs brutos (no registro do Reginaldo: PDF de 26 paginas e 23 MB). Decisao dele: menu Exportar ▾ com formatos, no lugar do Imprimir agora; Salvar e Copiar resumo ficam.
Mudancas: (1) modulo central_registros v0.3 -> v0.4 (arquivo modulos-fonte/central_registros_v0.4.js; ja inclui o ajuste da 1.10.191 CEN_PERGUNTA_FIM, que antes so existia dentro do medidor);
(2) o dialogo estatico da Central troca o botao "Imprimir agora" por "Exportar ▾". Menu: PDF organizado e curto, Markdown agrupado, planilha de alertas (.csv), monitoramento (.json), amostras (.csv, quando houver).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.210_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); MF, FE = os.path.join(R, 'dashboard', 'modulos-fonte'), os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)

o, d = os.path.join(FE, 'medidor_gerador_v1.10.209.html'), os.path.join(FE, 'medidor_gerador_v1.10.210.html'); assert os.path.exists(o) and not os.path.exists(d)
t = open(o, encoding='utf-8').read()
v03 = open(os.path.join(MF, 'central_registros_v0.3.js'), encoding='utf-8').read(); v04 = open(os.path.join(MF, 'central_registros_v0.4.js'), encoding='utf-8').read()
M03 = '/* ===== central_registros_v0.3 (Central de registros) — fonte: dashboard/modulos-fonte/central_registros_v0.3.js ===== */\n'
M04 = '/* ===== central_registros_v0.4 (Central de registros) — fonte: dashboard/modulos-fonte/central_registros_v0.4.js ===== */\n'
# 1) bloco antigo inline = v0.3 + o ajuste da 1.10.191 (confere ANTES de trocar, para nao perder outro ajuste escondido)
ini = t.index(M03); fim = t.index('})(window);', ini) + len('})(window);')
antigo = t[ini:fim]
esperado = M03 + v03.replace("      fimVisto = true; mostraAviso();", "      fimVisto = true; if (raiz.CEN_PERGUNTA_FIM !== false) mostraAviso();   // v1.10.191: chave em ⚙ Modo")
assert antigo.rstrip() == esperado.rstrip(), 'o modulo embutido NAO e o v0.3 + ajuste da 1.10.191: ha outra diferenca; confira antes de trocar'
t = t[:ini] + M04 + v04.rstrip('\n') + t[fim:]
# 2) dialogo estatico: Exportar no lugar de Imprimir agora
t = troca(t, '<button type="button" class="bt s" id="cenImprime">Imprimir agora</button>', '<button type="button" class="bt s" id="cenExporta" aria-haspopup="menu" title="PDF, Markdown, planilha ou JSON">Exportar ▾</button>', 'botao')
t = troca(t, '<b>O que salvar / imprimir</b>', '<b>O que salvar / exportar</b>', 'titulo')
t = troca(t, '<meta name="app-version" content="1.10.209">', '<meta name="app-version" content="1.10.210">', 'meta')
t = troca(t, "const VERSAO='1.10.209', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n",
          "const VERSAO='1.10.210', VERSAO_DATA='15/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.210\",d:\"15/11/2026\",i:[\n"
          "    'CENTRAL DE REGISTROS — BOTÃO EXPORTAR ▾ (pedido do Reginaldo): a Central ganhou o menu Exportar ▾, como o Gráfico, o Mapa e os Logs, no lugar do \"Imprimir agora\". Itens: PDF organizado (imprimir) — resumo, ocorrências, monitoramento resumido, falhas e avisos agrupados e dados do ensaio em tabelas curtas; Markdown agrupado (.md) — tudo o que está marcado num arquivo só; Planilha de alertas (.csv); Monitoramento (.json); e Amostras (.csv) quando houver sessões pendentes. Salvar selecionados e Copiar resumo continuam iguais.'\n"
          "    ,'O \"Imprimir agora\" antigo despejava o JSON e os logs brutos no papel (no registro do Reginaldo deu um PDF de 26 páginas e 23 MB). O PDF organizado só imprime tabelas e resumos; os dados completos ficam no Markdown agrupado e no Salvar selecionados. Também entrou no código-fonte da Central o ajuste da 1.10.191 (chave \"perguntar ao fim do ensaio\"), que antes só existia dentro do medidor.'\n  ]},\n", 'hist')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.210.html ok')
