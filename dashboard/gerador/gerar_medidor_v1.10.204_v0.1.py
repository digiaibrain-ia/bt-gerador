#!/usr/bin/env python3
"""gerar_medidor_v1.10.204_v0.1.py (13/11/2026) - gera dashboard/ferramentas/medidor_gerador_v1.10.204.html a partir da v1.10.203 (nunca altera a 203).
Mudanca (so isto), vinda da REVISAO DE CODIGO antes da bancada: botao Registrar defeito v0.2 -> v0.3 (modulos-fonte/rnc_defeito_v0.3.js) e fase RNC do robo v0.3 -> v0.4
(modulos-fonte/robo_fase_rnc_v0.4.js). Detalhes em docs/modulos/REVISAO_CODIGO_RNC_v0.1.md. Resto igual a v1.10.203.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.204_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas'); M = os.path.join(R, 'dashboard', 'modulos-fonte')
L = lambda p: open(p, encoding='utf-8').read()
s = L(os.path.join(F, 'medidor_gerador_v1.10.203.html'))
def troca(txt, a, b):
    assert txt.count(a) == 1, 'ancora nao encontrada (ou repetida): ' + a[:60]; return txt.replace(a, b, 1)
s = troca(s, L(os.path.join(M, 'rnc_defeito_v0.2.js')), L(os.path.join(M, 'rnc_defeito_v0.3.js')))
s = troca(s, L(os.path.join(M, 'robo_fase_rnc_v0.3.js')), L(os.path.join(M, 'robo_fase_rnc_v0.4.js')))
s = troca(s, '<meta name="app-version" content="1.10.203">', '<meta name="app-version" content="1.10.204">')
s = troca(s, "const VERSAO='1.10.203', VERSAO_DATA='13/11/2026';", "const VERSAO='1.10.204', VERSAO_DATA='13/11/2026';")
s = troca(s, 'const HISTORICO=[\n', 'const HISTORICO=[\n  {v:"1.10.204",d:"13/11/2026",i:[\n'
  '    \'Revisão de código do RNC antes da bancada: (1) o aviso "RNC: BLOQUEADO" não consulta o servidor a cada 2 s quando o servidor está fora do ar ou a rota não existe (antes repetia sem parar; agora tenta de novo só na renovação de 30 s); (2) a chave que evita registrar duas vezes o mesmo defeito passa a valer só para aquele conteúdo (antes, depois de uma resposta perdida, registrar OUTRO defeito podia devolver a RNC antiga e mostrar "Salvo" sem gravar); (3) o robô fecha a janela "Registrar defeito" em qualquer saída da fase, lê a etapa de referência depois da espera da falha simulada e pausa o aviso enquanto o confere (teste antes instável). Resto IGUAL à v1.10.203.\'\n  ]},\n')
open(os.path.join(F, 'medidor_gerador_v1.10.204.html'), 'w', encoding='utf-8').write(s); print('gerado medidor_gerador_v1.10.204.html', len(s))
