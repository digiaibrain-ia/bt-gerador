#!/usr/bin/env python3
"""12/11/2026 (v0.4 = v0.2 + 1 exemplo de network simples; substitui o v0.3) - gera docs/bt2/plc/INFOGRAFICO_CHAMADAS_BLOCOS_v0.4.html (quem chama quem: 1515 -> PUT/GET -> 1214FC). Sem IP. Nao sobrescreve."""
import os
out = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'docs', 'bt2', 'plc', 'INFOGRAFICO_CHAMADAS_BLOCOS_v0.4.html'); assert not os.path.exists(out)
def box(x, y, w, h, cls, t1, t2=''):
    s = '<rect class="%s" x="%d" y="%d" width="%d" height="%d" rx="8"/><text class="t1" x="%d" y="%d" text-anchor="middle">%s</text>' % (cls, x, y, w, h, x + w // 2, y + 22, t1)
    if t2: s += '<text class="t2" x="%d" y="%d" text-anchor="middle">%s</text>' % (x + w // 2, y + 40, t2)
    return s
def arr(x1, y1, x2, y2, lab='', dash=False):
    s = '<line class="ar%s" x1="%d" y1="%d" x2="%d" y2="%d" marker-end="url(#h)"/>' % (' dash' if dash else '', x1, y1, x2, y2)
    if lab: s += '<text class="lb" x="%d" y="%d" text-anchor="middle">%s</text>' % ((x1 + x2) // 2, (y1 + y2) // 2 - 6, lab)
    return s
S = ''
# colunas
S += '<text class="col" x="190" y="30" text-anchor="middle">1515F (ensaio) - Reginaldo</text><text class="col" x="880" y="30" text-anchor="middle">PLC de Carga 1214FC - programador</text>'
S += '<rect class="zona" x="20" y="45" width="340" height="560" rx="10"/><rect class="zona" x="620" y="45" width="520" height="560" rx="10"/>'
# 1515
S += box(80, 70, 220, 46, 'b15', 'OB1 / ciclo', 'chama as chamadas_BC56 e BC400')
S += arr(190, 116, 190, 150)
S += box(60, 150, 260, 54, 'b15', 'fb101_ComCarga', 'db3005i_BC56_ComCarga (instancia)')
S += arr(190, 204, 190, 240, 'le/grava')
S += box(60, 240, 260, 54, 'bdb', 'db3000_BC56_Chaves', 'DB de chaves (comandos e retornos)')
S += box(60, 340, 260, 54, 'b15', 'fb100_setupChaves', 'db3004i_BC56_SetupChaves (instancia)')
S += arr(190, 340, 190, 294, 'usa', True)
S += '<text class="nota" x="190" y="430" text-anchor="middle">O mesmo para o BC400 (db3100 e db3107)</text><text class="nota" x="190" y="446" text-anchor="middle"></text>'
# rede
S += box(400, 150, 190, 54, 'brede', 'PUT: pedido 10 B', 'P#DB3007.DBX0.0 BYTE 10')
S += box(400, 260, 190, 54, 'brede', 'GET: resposta 14 B', 'P#DB3007.DBX10.0 BYTE 14')
S += arr(320, 177, 400, 177) + arr(590, 177, 628, 177) + arr(628, 287, 590, 287) + arr(400, 287, 320, 287)
# 1200
S += box(650, 70, 220, 46, 'b12', 'OB1 / ciclo', '1 vez por ciclo')
S += arr(760, 116, 760, 150)
S += box(650, 150, 260, 54, 'b12', 'fc_bancosCarga1200', 'copia entradas/saidas fisicas')
S += arr(760, 204, 760, 240)
S += '<path class="ar" d="M650 177 H640 V370 H650" fill="none" marker-end="url(#h)"/>'
S += box(650, 240, 260, 60, 'b12', 'fb_bancoCarga16', 'BC56: db3006i_BC56_BancoCarga (DB 3006)')
S += box(650, 340, 260, 60, 'b12', 'fb_bancoCarga16', 'BC400: db3106i_BC400_BancoCarga (DB 3106)')
S += arr(760, 204, 760, 240)
S += box(960, 240, 160, 60, 'bdb', 'db3007_BC56_Com', 'telegrama 24 B')
S += box(960, 340, 160, 60, 'bdb', 'db3107_BC400_Com', 'telegrama 24 B')
S += arr(910, 270, 960, 270, 'le/grava') + arr(910, 370, 960, 370, 'le/grava')
S += '<text class="nota" x="1040" y="214" text-anchor="middle">O PUT e o GET do 1515</text><text class="nota" x="1040" y="228" text-anchor="middle">leem/gravam estes 2 DBs</text>'
S += box(650, 440, 260, 54, 'b12', 'fb_supervisaoChaves16', 'dentro do fb_bancoCarga16 (nao chame)')
S += arr(760, 400, 760, 440, 'usa', True)
S += box(650, 520, 125, 54, 'bio', 'Entradas', 'seus tags (retorno)')
S += box(785, 520, 125, 54, 'bio', 'Saidas', 'seus tags (contatoras)')
S += '<text class="nota" x="1040" y="500" text-anchor="middle">Tags do projeto do programador:</text><text class="nota" x="1040" y="518" text-anchor="middle">retorno, saidas e seletora Auto,</text><text class="nota" x="1040" y="536" text-anchor="middle">ligados nas REGIONs do fc</text>'

S += '<text class="col" x="580" y="650" text-anchor="middle">Exemplo de network: o bit CB nosso comanda a saida fisica dele</text>'
S += '<line class="ar" x1="120" y1="690" x2="120" y2="750"/><line class="ar" x1="1040" y1="690" x2="1040" y2="750"/>'
S += '<line class="ar" x1="120" y1="720" x2="420" y2="720"/><line class="ar" x1="480" y1="720" x2="700" y2="720"/><line class="ar" x1="760" y1="720" x2="1040" y2="720"/>'
S += '<line class="ar" x1="420" y1="704" x2="420" y2="736"/><line class="ar" x1="480" y1="704" x2="480" y2="736"/>'
S += '<path class="ar" d="M708 704 Q694 720 708 736"/><path class="ar" d="M752 704 Q766 720 752 736"/>'
S += '<text class="t1" x="450" y="690" text-anchor="middle">#saidaBC56[1]</text><text class="t2" x="450" y="758" text-anchor="middle">CB nosso: saida do banco da resistencia 1</text>'
S += '<text class="t1" x="730" y="690" text-anchor="middle">&lt;seu tag da saida da resistencia 1&gt;</text><text class="t2" x="730" y="758" text-anchor="middle">saida fisica dele (contatora)</text>'
S += '<text class="nota" x="580" y="782" text-anchor="middle">So isso: 1 bit nosso liga 1 saida dele. Ele pode montar em network, em FC ou em um FB proprio, como preferir.</text>'
leg = ('<div class="leg"><b>Como ler:</b> seta cheia = chamada ou troca de dados; tracejada = usado por dentro. '
       '<b>Quem edita no 1200:</b> so o fc_bancosCarga1200 (os seus tags e a inclusao das 2 chamadas do FB). Os DBs de telegrama (3007 e 3107) tem numero fixo, porque o 1515 acessa por esses numeros. '
       'Escritor unico: o pedido so e escrito pelo PUT do 1515; a resposta so pelo fb_bancoCarga16. Rascunho: nada foi compilado no TIA.</div>')
html = '''<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chamadas dos blocos - PLC de Carga</title><style>
:root{--bg:#fff;--fg:#1d2733;--zona:#f3f6fa;--b15:#dbeafe;--b12:#dcfce7;--bdb:#fef3c7;--brede:#ede9fe;--bio:#fce7f3;--ln:#51607a}
@media (prefers-color-scheme:dark){:root{--bg:#10151c;--fg:#e6edf5;--zona:#18202b;--b15:#1e3a5f;--b12:#14532d;--bdb:#5a4510;--brede:#3b2f63;--bio:#5b2146;--ln:#9fb0c8}}
body{margin:0;background:var(--bg);color:var(--fg);font:14px system-ui,sans-serif}main{max-width:1180px;margin:0 auto;padding:16px}h1{font-size:20px;margin:0 0 8px}
svg{width:100%;height:auto}.zona{fill:var(--zona)}.b15{fill:var(--b15)}.b12{fill:var(--b12)}.bdb{fill:var(--bdb)}.brede{fill:var(--brede)}.bio{fill:var(--bio)}
rect{stroke:var(--ln);stroke-width:1}.zona{stroke:none}.t1{font-weight:600;font-size:13px;fill:var(--fg)}.t2{font-size:11px;fill:var(--fg)}.col{font-weight:700;font-size:15px;fill:var(--fg)}
.lb,.nota{font-size:11px;fill:var(--fg)}.ar{stroke:var(--ln);stroke-width:1.6;fill:none}.dash{stroke-dasharray:5 4}.leg{margin-top:10px;line-height:1.5}
</style></head><body><main><h1>Chamadas dos blocos: 1515F e PLC de Carga (BC56 como exemplo)</h1>
<svg viewBox="0 0 1160 790" role="img" aria-label="Quem chama quem"><defs><marker id="h" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8z" fill="#51607a"/></marker></defs>''' + S + '</svg>' + leg + '</main></body></html>\n'
open(out, 'w', encoding='utf-8').write(html); print('ok', os.path.abspath(out))
