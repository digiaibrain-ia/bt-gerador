#!/usr/bin/env python3
"""16/11/2026 - Gera medidor_gerador_v1.10.214.html (de 1.10.212; a 1.10.213 foi descartada: o Reginaldo nao gostou do visual novo do card Modo).
Pedido: "faz somente uma reducao no tamanho dos objetos e mantem o visual igual". SO CSS: mesmas caixinhas, bordas, cores, pulso e baloes da 1.10.212; so menores (espacamento e fontes).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.214_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.212.html'), os.path.join(F, 'medidor_gerador_v1.10.214.html'); assert os.path.exists(o) and not os.path.exists(d)
t = open(o, encoding='utf-8').read()
ancora = "  #modoCard .v.demo{color:#b45309}#modoCard .v.real{color:var(--ok)}\n"
css = ancora + """  /* v1.10.214: card MODO menor (so tamanho; visual igual ao da 1.10.212) */
  #modoCard .lnk{gap:4px;margin-top:4px}
  #modoCard .lk{border-radius:7px;padding:2px 6px}
  #modoCard .lk .lkh{gap:5px;font-size:11px;line-height:1.15}
  #modoCard .lk .dot{width:8px;height:8px}
  #modoCard .lk small{font-size:9.5px;line-height:1.1;margin-top:0}
  #modoCard .mdgrid{grid-template-columns:repeat(auto-fit,minmax(105px,1fr));gap:4px;margin-top:4px}
  #modoCard .card{padding:2px 6px;border-radius:7px}
  #modoCard .card .l{font-size:9.5px;line-height:1.1}
  #modoCard .v{font-size:11.5px;line-height:1.15;margin-top:0}
"""
t = troca(t, ancora, css, 'css')
t = troca(t, '<meta name="app-version" content="1.10.212">', '<meta name="app-version" content="1.10.214">', 'meta')
t = troca(t, "const VERSAO='1.10.212', VERSAO_DATA='15/11/2026';\nconst HISTORICO=[\n",
 "const VERSAO='1.10.214', VERSAO_DATA='16/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.214\",d:\"16/11/2026\",i:[\n"
 "    'VISUAL (pedido do Reginaldo): card MODO MENOR, com o mesmo visual de antes. As caixinhas de comunicação (PLC, Node-RED, HTML) e as de configuração ficam iguais (bordas, cores, bolinha com pulso, balões); só diminuem o espaçamento e as letras. Substitui a tentativa da 1.10.213 (visual novo), que foi descartada. Resto igual à 1.10.212.'\n  ]},\n", 'hist')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.214.html ok')
