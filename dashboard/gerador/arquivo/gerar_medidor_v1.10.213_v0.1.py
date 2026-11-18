#!/usr/bin/env python3
"""16/11/2026 - Gera medidor_gerador_v1.10.213.html (de 1.10.212). Nao sobrescreve; aborta se um trecho esperado mudou.
Pedido do Reginaldo: "refazer o visual do cardModo, quero um visual discreto". SO CSS (o HTML e o JS do card ficam como estao: mesmos ids, mesmos textos, mesmos baloes).
Antes: 3 caixinhas de comunicacao + 6 caixinhas de configuracao, bolinha com pulso. Agora: 3 colunas de comunicacao (bolinha + nome, estado embaixo, sem caixa, sem pulso)
e uma lista fina "rotulo ........ valor" em colunas, com linha pontilhada; cor so onde ha significado (REAL verde, DEMO ambar, estado de comunicacao).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.213_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.212.html'), os.path.join(F, 'medidor_gerador_v1.10.213.html'); assert os.path.exists(o) and not os.path.exists(d)
t = open(o, encoding='utf-8').read()
ancora = "  #modoCard .v.demo{color:#b45309}#modoCard .v.real{color:var(--ok)}\n"
css = ancora + """  /* v1.10.213: card MODO discreto (so CSS). Comunicacao em 1 linha sem caixas; configuracao em lista fina rotulo/valor. Ids, textos e baloes (data-tip) iguais. */
  #modoCard .lnk{grid-template-columns:repeat(3,minmax(0,1fr));gap:0 12px;margin-top:2px;padding-bottom:5px;border-bottom:1px solid var(--line)}
  #modoCard .lk{border:0;border-radius:0;padding:1px 0;background:none;min-width:0}
  #modoCard .lk .lkh{gap:5px;font-size:12px;font-weight:600}
  #modoCard .lk .dot{width:8px;height:8px}
  #modoCard .lk small{display:block;margin:0 0 0 13px;font-size:10.5px}
  #modoCard .lk[data-s=ok] .dot{animation:none}
  #modoCard .mdgrid{grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:0 18px;margin-top:3px}
  #modoCard .mdgrid .card{display:flex;align-items:baseline;justify-content:space-between;gap:10px;border:0;border-bottom:1px dotted var(--line);border-radius:0;background:none;box-shadow:none;padding:3px 0}
  #modoCard .mdgrid .card .l{flex:none;font-size:11px;color:var(--mut)}
  #modoCard .mdgrid .card .v{margin:0;min-width:0;font-size:12px;font-weight:600;text-align:right}
"""
t = troca(t, ancora, css, 'css')
t = troca(t, '<meta name="app-version" content="1.10.212">', '<meta name="app-version" content="1.10.213">', 'meta')
t = troca(t, "const VERSAO='1.10.212', VERSAO_DATA='15/11/2026';\nconst HISTORICO=[\n",
 "const VERSAO='1.10.213', VERSAO_DATA='16/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.213\",d:\"16/11/2026\",i:[\n"
 "    'VISUAL (pedido do Reginaldo): card MODO mais discreto. As 3 caixinhas de comunicação (PLC, Node-RED, HTML) ficaram sem caixa e sem pulso, lado a lado, com bolinha, nome e estado. As 6 caixinhas de configuração (Fonte dos dados, Tipo de ensaio, Salvamento, Node-RED confirmado, Gráfico, Visão do operador) viraram uma lista fina \"rótulo ... valor\". Só visual: textos, cores de significado (REAL verde, DEMO âmbar), balões e triângulo de alertas iguais.'\n  ]},\n", 'hist')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.213.html ok')
