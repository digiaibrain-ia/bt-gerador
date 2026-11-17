#!/usr/bin/env python3
"""14/11/2026 - Gera medidor_gerador_v1.10.207.html (de 1.10.206). Nao sobrescreve; aborta se um trecho esperado mudou.
Unica mudanca funcional: a copia EMBUTIDA do Mapa dos FBs (window.EMB.mapa, a que o botao "Mapa dos FBs" abre primeiro; no PC de operacao e a unica, o pacote nao leva o mapa na pasta de
operacao) estava na v0.14. Passa para a v0.17: pulso no cartao quando o bloco age, estados com cores fortes e simbolo, "reduzir movimento". Como a v0.15 e a v0.16 tambem nao estavam embutidas,
vem junto: i de toque maior e Ajuda v0.2 (mapa v0.16).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.207_v0.1.py"""
import json, os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); FE = os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
def enc(x): return json.dumps(x, ensure_ascii=False).replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
o, d = os.path.join(FE, 'medidor_gerador_v1.10.206.html'), os.path.join(FE, 'medidor_gerador_v1.10.207.html'); assert os.path.exists(o) and not os.path.exists(d)
t = open(o, encoding='utf-8').read(); mapa = open(os.path.join(FE, 'mapa_fbs_v0.17.html'), encoding='utf-8').read()
ini = t.index('window.EMB={grafico:') + len('window.EMB={grafico:'); _, n = json.JSONDecoder().raw_decode(t[ini:])
pre = t[ini + n:ini + n + len(',mapa:')]; assert pre == ',mapa:', repr(pre)
m0 = ini + n + len(',mapa:'); _, n2 = json.JSONDecoder().raw_decode(t[m0:])
assert t[m0 + n2] in '};,', repr(t[m0 + n2:m0 + n2 + 10])
t = t[:m0] + enc(mapa) + t[m0 + n2:]
t = troca(t, '<meta name="app-version" content="1.10.206">', '<meta name="app-version" content="1.10.207">', 'meta')
t = troca(t, "const VERSAO='1.10.206', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n",
          "const VERSAO='1.10.207', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.207\",d:\"14/11/2026\",i:[\n"
          "    'MAPA DOS FBs — ILUMINAÇÃO (pedido do Reginaldo): o cartão do bloco ganha um contorno âmbar por cerca de 1 s sempre que o bloco age (mudou estado, entrada ou saída entre duas fotos); ruído de medição e contadores de tempo não contam, e abrir a tela ou voltar de \"sem sinal\" não acende tudo. Os estados (ocioso, ok, contando, falha) ganharam cores mais fortes e diferentes, nos temas claro e escuro, e um símbolo de forma além da cor (■ ✔ ▶ ▲). Com \"reduzir movimento\" ligado no aparelho não há animação (anel fixo). A exportação do mapa não leva o halo.'\n"
          "    ,'A cópia do mapa embutida no medidor estava na v0.14 (é a que o operador vê no PC de operação); agora é a v0.17, e traz junto o ícone i com área de toque maior e a Ajuda nova da v0.16.'\n  ]},\n", 'hist')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.207.html ok')
