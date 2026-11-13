#!/usr/bin/env python3
"""gerar_medidor_v1.10.205_v0.1.py (13/11/2026) - gera dashboard/ferramentas/medidor_gerador_v1.10.205.html a partir da v1.10.204 (nunca altera a 204).
Mudanca (so isto, VISUAL): o card "Banco de Cargas" passa a mostrar so os bancos selecionados em Detalhes do Patamar (modulos-fonte/bancos_visiveis_v0.1.js).
Banco desmarcado e sem carga some; banco com chave ligada / comando pendente / sem leitura continua visivel; botao "👁 n/N" alterna para Todos. Nada de logica, chaves, PLC ou sugestao muda.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.205_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas'); M = os.path.join(R, 'dashboard', 'modulos-fonte')
L = lambda p: open(p, encoding='utf-8').read()
s = L(os.path.join(F, 'medidor_gerador_v1.10.204.html')); mod = L(os.path.join(M, 'bancos_visiveis_v0.1.js'))
assert '</script' not in mod.lower()
def troca(txt, a, b):
    assert txt.count(a) == 1, 'ancora nao encontrada (ou repetida): ' + a[:60]; return txt.replace(a, b, 1)
s = troca(s, '<meta name="app-version" content="1.10.204">', '<meta name="app-version" content="1.10.205">')
s = troca(s, "const VERSAO='1.10.204', VERSAO_DATA='13/11/2026';", "const VERSAO='1.10.205', VERSAO_DATA='13/11/2026';")
s = troca(s, 'const HISTORICO=[\n', 'const HISTORICO=[\n  {v:"1.10.205",d:"13/11/2026",i:[\n'
  '    \'VISUAL (pedido do Reginaldo): o card "Banco de Cargas" passa a mostrar SÓ os bancos selecionados em "Detalhes do Patamar" (os checks BC56/BC400/BC59,5/BC550). Antes os não selecionados apareciam fechados; agora ficam ocultos. SEGURANÇA: um banco desmarcado só some se estiver sem carga — continua visível se tiver chave ligada, comando pendente ou leitura perdida ("Ligar banco" ativo não conta: só libera o comando das chaves). O botão "👁 n/N" no cabeçalho do card mostra quantos bancos estão visíveis e alterna para "Todos" (lembrado neste navegador). Sem nenhum banco visível aparece um aviso. É só visual: nada muda na lógica, nas chaves, no PLC, no Setup ou na sugestão do Patamar (o HTML dos bancos continua no lugar, só recebe display:none). Resto IGUAL à v1.10.204. Módulo-fonte: modulos-fonte/bancos_visiveis_v0.1.js.\'\n  ]},\n')
marca = "</script>\n<script>\n/* =====================================================================================================================\n   janelas_v0.3.js"
s = troca(s, marca, "</script>\n<script>\n" + mod + "\n" + marca)
open(os.path.join(F, 'medidor_gerador_v1.10.205.html'), 'w', encoding='utf-8').write(s); print('gerado medidor_gerador_v1.10.205.html', len(s))
