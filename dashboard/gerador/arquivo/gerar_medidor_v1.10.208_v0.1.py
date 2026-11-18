#!/usr/bin/env python3
"""14/11/2026 - Gera medidor_gerador_v1.10.208.html (de 1.10.207). Nao sobrescreve; aborta se um trecho esperado mudou.
Unica mudanca funcional: a copia EMBUTIDA do Mapa dos FBs (window.EMB.mapa) passa da v0.17 para a v0.18. Pedido do Reginaldo: o contorno ambar que "piscava" (v0.17) sai; entra uma AUREOLA de fundo,
azul e desfocada, no bloco ATIVO, que respira entre 40 % e 90 % (ida e volta suave, nunca apaga) como a iluminacao do card Modo. A fase vem do relogio: recriar o desenho a cada foto nao reinicia a animacao.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.208_v0.1.py"""
import json, os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); FE = os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
def enc(x): return json.dumps(x, ensure_ascii=False).replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
o, d = os.path.join(FE, 'medidor_gerador_v1.10.207.html'), os.path.join(FE, 'medidor_gerador_v1.10.208.html'); assert os.path.exists(o) and not os.path.exists(d)
t = open(o, encoding='utf-8').read(); mapa = open(os.path.join(FE, 'mapa_fbs_v0.18.html'), encoding='utf-8').read()
ini = t.index('window.EMB={grafico:') + len('window.EMB={grafico:'); _, n = json.JSONDecoder().raw_decode(t[ini:])
pre = t[ini + n:ini + n + len(',mapa:')]; assert pre == ',mapa:', repr(pre)
m0 = ini + n + len(',mapa:'); _, n2 = json.JSONDecoder().raw_decode(t[m0:])
assert t[m0 + n2] in '};,', repr(t[m0 + n2:m0 + n2 + 10])
t = t[:m0] + enc(mapa) + t[m0 + n2:]
t = troca(t, '<meta name="app-version" content="1.10.207">', '<meta name="app-version" content="1.10.208">', 'meta')
t = troca(t, "const VERSAO='1.10.207', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n",
          "const VERSAO='1.10.208', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.208\",d:\"14/11/2026\",i:[\n"
          "    'MAPA DOS FBs — AURÉOLA NO BLOCO ATIVO (pedido do Reginaldo; substitui o contorno que piscava da 1.10.207): o bloco em estado ATIVO (contando) ganha uma auréola azul de fundo, desfocada, que respira entre 40 % e 90 % (ida e volta suave, nunca apaga) enquanto estiver ativo, no mesmo estilo da iluminação do card Modo. A respiração segue o relógio, então o mapa recriar o desenho a cada foto não reinicia nem faz saltos. Cores dos estados mais fortes e símbolo de forma (■ ✔ ▶ ▲) continuam. Com \"reduzir movimento\" ligado no aparelho a auréola fica fixa. A exportação do mapa não leva a auréola.'\n  ]},\n", 'hist')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.208.html ok')
