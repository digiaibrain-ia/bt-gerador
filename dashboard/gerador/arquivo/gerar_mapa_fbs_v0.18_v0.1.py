#!/usr/bin/env python3
"""14/11/2026 - Gera dashboard/ferramentas/mapa_fbs_v0.18.html (de v0.16; reaproveita da v0.17 as cores, os simbolos, a legenda e a exportacao). Nao sobrescreve; aborta se um trecho esperado mudou.
Pedido do Reginaldo sobre a v0.17: o contorno ambar "nao ficou legal" e "pisca". Causa: o anel acendia e apagava de uma vez (opacidade de 1 para 0 em 1,2 s) e, como o mapa recria o desenho a cada foto, a animacao reiniciava.
Ele pediu uma AUREOLA de fundo, como a iluminacao do card Modo quando ativo: vai e volta, sem zerar (algo como 40 % a 90 %).
Mudanca: o bloco em estado ATIVO ("contando") ganha uma aureola azul desfocada ATRAS do cartao que RESPIRA entre 40 % e 90 % (ida e volta suave, ciclo de 3,6 s) e nunca apaga enquanto o bloco esta ativo.
A fase da respiracao e GLOBAL (relogio), entao recriar o desenho nao reinicia a animacao: nada de salto. O desfoque e um filtro SVG (funciona tambem no Safari/iOS). Sem o anel/pulso da v0.17.
Mantido da v0.17: cores dos estados mais fortes (claro e escuro), simbolos ■ ✔ ▶ ▲, legenda curta, aureola fora da exportacao. "Reduzir movimento": aureola fixa em 70 %.
Uso: python3 dashboard/gerador/gerar_mapa_fbs_v0.18_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); FE = os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)

CSS = """
/* v0.18: ESTADO e AUREOLA. Idle/ok/ativo/falha com preenchimento mais forte; o bloco ATIVO ganha uma aureola de fundo que respira (40 % a 90 %, sem zerar). Nao muda tamanho nem posicao. */
.bx.st-idle .corpo{fill:var(--idbg)}
.sy{font-weight:700}.sy.idle{fill:var(--mut)}.sy.ok{fill:#127a4f}.sy.ativo{fill:var(--blue)}.sy.falha{fill:var(--red)}
@media (prefers-color-scheme:dark){:root:where(:not([data-t=l])) .sy.ok{fill:#5fe0a8}}
.aura{fill:var(--blue);opacity:.65;pointer-events:none;animation:auraRespira 1.8s ease-in-out infinite alternate}
@keyframes auraRespira{from{opacity:.4}to{opacity:.9}}
@media (prefers-reduced-motion:reduce){.aura{animation:none;opacity:.7}}
"""

JS = r"""/* v0.18: AUREOLA do bloco ativo. A fase da respiracao vem do relogio (global): o desenho e recriado a cada foto e isso NAO reinicia a animacao. O filtro de desfoque e SVG (vale tambem no Safari). */
const SIMB={idle:'■',ok:'✔',ativo:'▶',falha:'▲'},CICLO_AURA=3600;
function garanteFiltro(){if(document.getElementById('fAura'))return;const d=el('defs',{},$('svgm')),f=el('filter',{id:'fAura',x:'-30%',y:'-30%',width:'160%',height:'160%'},d);el('feGaussianBlur',{stdDeviation:6},f)}
function aura(g,x,y,w,h,rx){garanteFiltro();el('rect',{class:'aura',x:x,y:y,width:w,height:h,rx:rx,filter:'url(#fAura)',style:'animation-delay:-'+((Date.now()%CICLO_AURA)/1000).toFixed(2)+'s'},g)}
function recebe(f){if(f&&f.v===1){AO=f;AO.rec=Date.now();if(f.fonte)modo=f.fonte==='virtual'?'sem':'com';redesenha()}}"""

def main():
    o, d = os.path.join(FE, 'mapa_fbs_v0.16.html'), os.path.join(FE, 'mapa_fbs_v0.18.html'); assert os.path.exists(o) and not os.path.exists(d)
    t = open(o, encoding='utf-8').read()
    t = troca(t, '<html lang="pt-BR">\n', '<html lang="pt-BR">\n<!-- mapa_fbs_v0.18 · 14/11/2026 — ILUMINAÇÃO (substitui o contorno que piscava da v0.17): o bloco ATIVO ganha uma auréola azul de fundo que respira entre 40 % e 90 % (ida e volta suave, nunca apaga; fase do relógio, então o redesenho não reinicia a animação); estados com cores mais fortes e símbolo de forma (■ ✔ ▶ ▲); sem animação com \"reduzir movimento\"; a auréola não vai na exportação. Resto igual à v0.16. -->\n', 'cab')
    t = troca(t, '<meta name="app-version" content="0.16">', '<meta name="app-version" content="0.18">', 'meta')
    t = troca(t, ';--okbg:#e3f4ea;--atbg:#e1ecfa;--flbg:#fde7e5}', ';--okbg:#bfe8d2;--atbg:#c4dbf7;--flbg:#f7c4bf;--idbg:#e4e3de}', 'cores-claro')
    t = troca(t, '--okbg:#16382a;--atbg:#15304f;--flbg:#4a1d1d}}', '--okbg:#1f5a43;--atbg:#1f4a7d;--flbg:#7a2a2a;--idbg:#2e2e2c}}', 'cores-escuro')
    t = troca(t, '.bx.st-ok .corpo{fill:var(--okbg)}.bx.st-ativo .corpo{fill:var(--atbg)}.bx.st-falha .corpo{fill:var(--flbg)}', '.bx.st-ok .corpo{fill:var(--okbg)}.bx.st-ativo .corpo{fill:var(--atbg)}.bx.st-falha .corpo{fill:var(--flbg)}' + CSS.rstrip('\n'), 'css')
    t = troca(t, "function recebe(f){if(f&&f.v===1){AO=f;AO.rec=Date.now();if(f.fonte)modo=f.fonte==='virtual'?'sem':'com';redesenha()}}", JS, 'recebe')
    # mae: aureola e preenchimento de ocioso
    t = troca(t, "el('rect',{class:'corpo',x:mx,y:my,width:mw,height:mh,rx:10,style:fm?'fill:var(--'+({ok:'okbg',ativo:'atbg',falha:'flbg'}[fm.estado]||'sf')+')':''},gm);",
              "if(fm&&fm.estado==='ativo')aura(gm,mx-6,my-6,mw+12,mh+12,16);\n  el('rect',{class:'corpo',x:mx,y:my,width:mw,height:mh,rx:10,style:fm?'fill:var(--'+({idle:'idbg',ok:'okbg',ativo:'atbg',falha:'flbg'}[fm.estado]||'sf')+')':''},gm);", 'mae')
    # blocos: aureola atras do cartao
    t = troca(t, "    el('rect',{class:'corpo',x:b.x,y:b.y,width:W,height:b.h,rx:9},g);", "    if(f&&f.estado==='ativo')aura(g,b.x-6,b.y-6,W+12,b.h+12,14);\n    el('rect',{class:'corpo',x:b.x,y:b.y,width:W,height:b.h,rx:9},g);", 'bloco')
    # simbolo de forma no estado
    a = "q=el('text',{x:b.x+12,y:b.y+HD+10,class:'est'},g);q.textContent='● '+(f?({idle:'ocioso',ok:'ok',ativo:'contando',falha:'falha'}[f.estado]||f.estado)+(f.txt?' · '+cut(f.txt,36):''):(vivoOk()?'sem dados deste filho':'sem sinal'));"
    b = ("q=el('text',{x:b.x+12,y:b.y+HD+10,class:'est'},g);{const sy=document.createElementNS(NS,'tspan');sy.setAttribute('class','sy '+(f?f.estado:'idle'));sy.textContent=(f?(SIMB[f.estado]||'●'):'●')+' ';q.appendChild(sy);\n"
         "      q.appendChild(document.createTextNode(f?({idle:'ocioso',ok:'ok',ativo:'contando',falha:'falha'}[f.estado]||f.estado)+(f.txt?' · '+cut(f.txt,36):''):(vivoOk()?'sem dados deste filho':'sem sinal')))}")
    t = troca(t, a, b, 'simbolo')
    # legenda curta
    t = troca(t, '<span><i class="p" style="background:#9a9990"></i>sem sinal</span>', '<span><i class="p" style="background:#9a9990"></i>sem sinal</span><span>■ ocioso ✔ ok ▶ contando ▲ falha</span><span><i style="background:var(--blue);box-shadow:0 0 6px var(--blue)"></i>brilho: bloco ativo</span>', 'legenda')
    # exportacao sem aureola
    t = troca(t, "so.forEach((e,i)=>{const cs=getComputedStyle(e);PROPS.forEach(p=>{const v=cs.getPropertyValue(p);if(v)sc[i].style.setProperty(p,v)})});\n",
              "so.forEach((e,i)=>{const cs=getComputedStyle(e);PROPS.forEach(p=>{const v=cs.getPropertyValue(p);if(v)sc[i].style.setProperty(p,v)})});\n    sc.forEach(e=>{if(e.classList&&e.classList.contains('aura'))e.remove()});   // v0.18: a aureola de atividade nao vai para o arquivo exportado\n", 'export')
    open(d, 'w', encoding='utf-8').write(t); print('mapa_fbs_v0.18.html ok')
if __name__ == '__main__': main()
