#!/usr/bin/env python3
"""17/11/2026 - infografico de chamadas v0.7 (nao sobrescreve a v0.6): 1515 + PLC de Carga 1200 v0.17 (wrapper fb_bancosCarga1200) + ET200 v0.7 (provisorio) + repasse do DB2000 (FB104)."""
import os
OUT = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'docs', 'bt2', 'plc', 'INFOGRAFICO_CHAMADAS_BLOCOS_v0.7.html')
assert not os.path.exists(OUT)
o = []
def box(c, x, y, w, h, t1, t2=''):
    o.append('<rect class="%s" x="%d" y="%d" width="%d" height="%d" rx="8"/><text class="t1" x="%d" y="%d" text-anchor="middle">%s</text>' % (c, x, y, w, h, x + w // 2, y + 21, t1))
    if t2: o.append('<text class="t2" x="%d" y="%d" text-anchor="middle">%s</text>' % (x + w // 2, y + 38, t2))
def ar(x1, y1, x2, y2, dash=False, lab='', lx=None, ly=None):
    o.append('<line class="ar%s" x1="%d" y1="%d" x2="%d" y2="%d" marker-end="url(#h)"/>' % (' dash' if dash else '', x1, y1, x2, y2))
    if lab: o.append('<text class="lb" x="%d" y="%d" text-anchor="middle">%s</text>' % (lx if lx is not None else (x1 + x2) // 2, ly if ly is not None else (y1 + y2) // 2 - 5, lab))
def txt(x, y, t, cl='nota', anc='middle'): o.append('<text class="%s" x="%d" y="%d" text-anchor="%s">%s</text>' % (cl, x, y, anc, t))
def zona(x, y, w, h): o.append('<rect class="zona" x="%d" y="%d" width="%d" height="%d" rx="10"/>' % (x, y, w, h))
# colunas
txt(190, 30, '1515F (ensaio) - Reginaldo', 'col'); txt(900, 30, 'PLC de Carga 1214FC v0.17 (RASCUNHO) - Alexandre', 'col')
zona(20, 45, 340, 470); zona(620, 45, 540, 470)
box('b15', 80, 65, 220, 46, 'OB1 / ciclo', 'chama as chamadas BC56 e BC400'); ar(190, 111, 190, 140)
box('b15', 60, 140, 260, 54, 'fb101_ComCarga v0.9', 'db3005i_BC56_ComCarga / db3105i_BC400'); ar(190, 194, 190, 230, False, 'le/grava')
box('bdb', 60, 230, 260, 54, 'db3000_BC56_Chaves', 'e db3100_BC400 (comandos e retornos)')
box('b15', 60, 310, 260, 54, 'fb100_setupChaves v0.4', 'db3004i (instancia)'); ar(190, 310, 190, 284, True, 'usa')
txt(190, 384, 'RespEcoOk := db3000...sbRet.respEcoOk (obrigatorio)')
box('b15', 60, 410, 260, 54, 'fb104_putDseCarga', 'db2001i_DSE_PutCarga - 1x por ciclo'); ar(190, 464, 190, 495, False, '')
txt(190, 508, 'le o DB2000 do 1515 (so informacao)')
# rede
box('brede', 395, 140, 200, 54, 'PUT: pedido 10 B', 'P#DB3007.DBX0.0 BYTE 10')
box('brede', 395, 230, 200, 54, 'GET: resposta 14 B', 'P#DB3007.DBX10.0 BYTE 14')
box('brede', 395, 410, 200, 54, 'PUT: DSE 136 B', 'P#DB2000.DBX0.0 BYTE 136')
ar(320, 167, 395, 167); ar(595, 167, 640, 167); txt(655, 150, 'grava no', 'lb', 'start'); txt(655, 162, 'db3007/3107', 'lb', 'start'); ar(640, 257, 595, 257); txt(655, 262, 'le do db3007/3107', 'lb', 'start'); ar(395, 257, 320, 257); ar(320, 437, 395, 437); ar(595, 437, 645, 437)
txt(495, 215, '(BC400: DB3107; fb_bancoCarga16 _bc56 e _bc400 usam os dois)', 'lb')
# 1200
box('b12', 650, 65, 200, 46, 'OB1 / ciclo', '1 vez por ciclo'); ar(750, 111, 750, 135)
box('b12', 650, 135, 250, 54, 'fc_bancosCarga1200 v0.16', 'SO ORGANIZA: copia tags <-> DB do FB'); ar(750, 189, 750, 225, False, '1 chamada')
box('b12', 650, 225, 250, 60, 'fb_bancosCarga1200 v0.1', 'inst. db3006i_BancosCarga1200 (STAT)')
ar(770, 285, 700, 330); ar(780, 285, 880, 330)
box('b12', 650, 330, 150, 60, 'fb_bancoCarga16', '_bc56 (multi-inst.)'); box('b12', 830, 330, 150, 60, 'fb_bancoCarga16', '_bc400 (multi-inst.)')
box('bdb', 1000, 330, 140, 60, 'db3007 / db3107', 'telegrama 24 B'); ar(980, 360, 1000, 360); txt(990, 345, 'le/grava', 'lb')
ar(905, 430, 905, 392, True, 'usa', 920, 412)
box('b12', 830, 430, 170, 54, 'fb_supervisaoChaves16', 'dentro de cada banco')
box('bdb', 650, 430, 160, 54, 'db2000 (DSE)', 'copia so leitura 136 B')
box('bio', 1015, 430, 130, 54, 'Seus tags', 'retorno/seletora/saidas')
txt(880, 505, 'saidas Q so pelo fc; "Ligar Banco" = LigarBancoBC56/BC400 (ComOk + trava)', 'lb')
# ET200
zona(20, 540, 1140, 270)
txt(590, 565, 'ET200 (IM151-8) v0.7 - PROVISORIO, validado na bancada (mesma estrutura, TON em vez de TON_TIME)', 'col')
box('b12', 60, 590, 210, 54, 'fc_bancosEt200 v0.7', 'so organiza (1 chamada)'); ar(270, 617, 310, 617)
box('b12', 310, 590, 240, 54, 'fb_bancosEt200 v0.2', 'inst. ibancosEt200 (STAT) - ComOk + trava'); ar(550, 617, 590, 617)
box('b12', 590, 590, 220, 54, 'fb_bancoEt200_16 v0.4 (x2)', '+ fb_supervisaoChaves16'); ar(810, 617, 850, 617)
box('bdb', 850, 590, 150, 54, 'db38 / db39', 'telegrama (ComBC56/400)')
box('bio', 60, 680, 330, 54, 'RETORNO PROVISORIO = a propria saida', 'sem contato auxiliar ainda: nao detecta contator colado')
box('bio', 420, 680, 330, 54, 'Na 1200 (Retrofit)', 'retorno = contato auxiliar REAL (so troca o bloco 1 de 3 do FC)')
txt(590, 772, 'Provado na bancada do ET200: 1515 em STOP derruba saidas e Ligar Banco; cabo de rede puxado derruba e so religa com novo comando.', 'nota')
txt(590, 790, 'NAO provado: nada da 1200 foi compilado no TIA nem testado no PLC.', 'nota')
body = ''.join(o)
html = '''<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chamadas dos blocos v0.7</title><style>
:root{--bg:#fff;--fg:#1d2733;--zona:#f3f6fa;--b15:#dbeafe;--b12:#dcfce7;--bdb:#fef3c7;--brede:#ede9fe;--bio:#fce7f3;--ln:#51607a}
@media (prefers-color-scheme:dark){:root{--bg:#10151c;--fg:#e6edf5;--zona:#18202b;--b15:#1e3a5f;--b12:#14532d;--bdb:#5a4510;--brede:#3b2f63;--bio:#5b2146;--ln:#9fb0c8}}
body{margin:0;background:var(--bg);color:var(--fg);font:14px system-ui,sans-serif}main{max-width:1180px;margin:0 auto;padding:16px}h1{font-size:20px;margin:0 0 8px}
svg{width:100%;height:auto}.zona{fill:var(--zona)}.b15{fill:var(--b15)}.b12{fill:var(--b12)}.bdb{fill:var(--bdb)}.brede{fill:var(--brede)}.bio{fill:var(--bio)}
rect{stroke:var(--ln);stroke-width:1}.zona{stroke:none}.t1{font-weight:600;font-size:13px;fill:var(--fg)}.t2{font-size:11px;fill:var(--fg)}.col{font-weight:700;font-size:15px;fill:var(--fg)}
.lb,.nota{font-size:11px;fill:var(--fg)}.ar{stroke:var(--ln);stroke-width:1.6;fill:none}.dash{stroke-dasharray:5 4}.leg{margin-top:10px;line-height:1.5}
</style></head><body><main><h1>Chamadas dos blocos v0.7: 1515F, PLC de Carga 1200 (rascunho) e ET200 (provisorio)</h1>
<svg viewBox="0 0 1180 820" role="img" aria-label="Quem chama quem"><defs><marker id="h" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8z" fill="#51607a"/></marker></defs>''' + body + '''</svg>
<p class="leg">Azul = blocos do 1515. Verde = blocos do PLC de Carga/ET200. Amarelo = DBs. Roxo = PUT/GET na rede. Rosa = o que o programador liga. Tracejado = "usa". No codigo da 1200: <b>//[F]</b> funcionamento e <b>//[M]</b> montagem no TIA.</p></main></body></html>'''
open(OUT, 'w', encoding='utf-8').write(html)
print('ok', OUT)
