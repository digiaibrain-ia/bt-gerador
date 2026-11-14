#!/usr/bin/env python3
"""14/11/2026 - Gera dashboard/ferramentas/mapa_fbs_v0.17.html (de v0.16). Nao sobrescreve; aborta se um trecho esperado mudou.
Pedido do Reginaldo (Mapa dos FBs, DEMO): "a iluminacao da animacao dos FB nao esta legal". Causa: o cartao so era pintado pelo ESTADO atual (ocioso/ok/contando/falha) com preenchimento muito claro;
nada mostrava QUANDO o bloco agiu, e as cores dos estados eram parecidas. Escolhas dele: pulso no cartao + cores mais fortes/distintas.
Mudancas: (1) PULSO: a cada foto nova dos FBs, compara estado/entradas/saidas de cada filho (e a mae) com a foto anterior; se mudou, o cartao ganha um halo ambar de ~1,2 s (atras do cartao, sem mudar
tamanho/posicao). Ruido de medicao (< max(0,5; 1 %)) e os contadores de tempo (filho 7) NAO contam como "agiu". A primeira foto, ou a volta depois de "sem sinal", nao pulsa.
(2) Cores dos estados mais fortes e distintas (claro e escuro) + simbolo de forma alem da cor: ■ ocioso, ✔ ok, ▶ contando, ▲ falha. (3) prefers-reduced-motion: sem animacao, anel fixo por ~1,2 s.
(4) Legenda ganha o significado; a exportacao (PDF/PNG/SVG) NAO leva o halo. Dados, pinos, fios e ajuda: iguais a v0.16.
Uso: python3 dashboard/gerador/gerar_mapa_fbs_v0.17_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); FE = os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)

CSS = """
/* v0.17: ESTADO e PULSO. Idle/ok/ativo/falha com preenchimento mais forte; halo ambar atras do cartao quando o bloco agiu (nao muda tamanho nem posicao). */
.bx.st-idle .corpo{fill:var(--idbg)}
.sy{font-weight:700}.sy.idle{fill:var(--mut)}.sy.ok{fill:#127a4f}.sy.ativo{fill:var(--blue)}.sy.falha{fill:var(--red)}
@media (prefers-color-scheme:dark){:root:where(:not([data-t=l])) .sy.ok{fill:#5fe0a8}}
.halo{fill:none;stroke:var(--pulso);stroke-width:4;opacity:0;pointer-events:none}
.pulso .halo{animation:pulsoHalo 1.2s ease-out backwards;animation-delay:var(--dly,0s)}
@keyframes pulsoHalo{0%{opacity:1;stroke-width:7}55%{opacity:.9;stroke-width:4.5}100%{opacity:0;stroke-width:1}}
.bx.pulso .corpo,.mae.pulso .corpo{animation:pulsoCorpo 1.2s ease-out backwards;animation-delay:var(--dly,0s)}
@keyframes pulsoCorpo{0%{stroke:var(--pulso);stroke-width:3.4}100%{stroke-width:1.6}}
@media (prefers-reduced-motion:reduce){.pulso .halo{animation:none;opacity:.9;stroke-width:3.5}.bx.pulso .corpo,.mae.pulso .corpo{animation:none;stroke:var(--pulso)}}
"""

JS = r"""/* v0.17: PULSO — quando o bloco AGIU (mudou estado, entrada ou saida entre duas fotos). Medicao com ruido pequeno e contadores de tempo nao contam. */
const DUR=1200,PULSO={},TOL_CONT={7:['tempo da etapa','tempo neste estado']};let tPulso=0;
const pulsoDt=id=>PULSO[id]?Date.now()-PULSO[id]:Infinity,pulsando=id=>pulsoDt(id)<DUR,pulsoSig=()=>Object.keys(PULSO).filter(k=>pulsando(+k)).join(',');
const difere=(a,b)=>{const x=num(a),y=num(b);if(x!=null&&y!=null)return Math.abs(x-y)>Math.max(0.5,Math.abs(x)*0.01);return String(a)!==String(b)};
function filhoAgiu(id,n,o){if(!n||!o)return false;if(n.estado!==o.estado)return true;const ig=TOL_CONT[id]||[];
  return ['ent','sai'].some(l=>{const a=n[l]||{},b=o[l]||{};return Object.keys(Object.assign({},a,b)).some(k=>ig.indexOf(k)<0&&difere(a[k],b[k]))})}
function maeAgiu(n,o){if(!n||!o)return false;if(n.estado!==o.estado)return true;const a=n.kw||{},b=o.kw||{};if(['alvo','sel','cmd','conf'].some(k=>difere(a[k],b[k])))return true;
  if(((n.etapa||{}).idx)!==((o.etapa||{}).idx))return true;const x=n.aplicar||{},y=o.aplicar||{};return x.modo!==y.modo||x.liberado!==y.liberado}
function registraPulsos(n){const o=vivoOk()?AO:null;if(!o||!n)return;const agora=Date.now();let algum=false;
  Object.keys(n.filhos||{}).forEach(id=>{if(filhoAgiu(+id,n.filhos[id],(o.filhos||{})[id])){PULSO[+id]=agora;algum=true}});
  if(maeAgiu(n,o)){PULSO[9]=agora;algum=true}
  if(algum){clearTimeout(tPulso);tPulso=setTimeout(()=>redesenha(),DUR+80)}}   // quando o pulso acaba, redesenha para tirar a classe (e o anel do modo "reduzir movimento")
function halo(g,id,x,y,w,h,rx){if(!pulsando(id))return;g.classList.add('pulso');g.style.setProperty('--dly',(-pulsoDt(id)/1000).toFixed(2)+'s');el('rect',{class:'halo',x:x,y:y,width:w,height:h,rx:rx},g)}
const SIMB={idle:'■',ok:'✔',ativo:'▶',falha:'▲'};
function recebe(f){if(f&&f.v===1){registraPulsos(f);AO=f;AO.rec=Date.now();if(f.fonte)modo=f.fonte==='virtual'?'sem':'com';redesenha()}}"""

def main():
    o, d = os.path.join(FE, 'mapa_fbs_v0.16.html'), os.path.join(FE, 'mapa_fbs_v0.17.html'); assert os.path.exists(o) and not os.path.exists(d)
    t = open(o, encoding='utf-8').read()
    t = troca(t, '<html lang="pt-BR">\n', '<html lang="pt-BR">\n<!-- mapa_fbs_v0.17 · 14/11/2026 — ILUMINAÇÃO: pulso âmbar no cartão quando o bloco age (mudou estado, entrada ou saída; ruído de medição e contadores de tempo não contam); cores dos estados mais fortes e diferentes, com símbolo de forma (■ ocioso, ✔ ok, ▶ contando, ▲ falha); sem animação com \"reduzir movimento\"; o halo não vai na exportação. Resto igual à v0.16. -->\n', 'cab')
    t = troca(t, '<meta name="app-version" content="0.16">', '<meta name="app-version" content="0.17">', 'meta')
    t = troca(t, ';--okbg:#e3f4ea;--atbg:#e1ecfa;--flbg:#fde7e5}', ';--okbg:#bfe8d2;--atbg:#c4dbf7;--flbg:#f7c4bf;--idbg:#e4e3de;--pulso:#f59e0b}', 'cores-claro')
    t = troca(t, '--okbg:#16382a;--atbg:#15304f;--flbg:#4a1d1d}}', '--okbg:#1f5a43;--atbg:#1f4a7d;--flbg:#7a2a2a;--idbg:#2e2e2c;--pulso:#fbbf24}}', 'cores-escuro')
    t = troca(t, '.bx.st-ok .corpo{fill:var(--okbg)}.bx.st-ativo .corpo{fill:var(--atbg)}.bx.st-falha .corpo{fill:var(--flbg)}', '.bx.st-ok .corpo{fill:var(--okbg)}.bx.st-ativo .corpo{fill:var(--atbg)}.bx.st-falha .corpo{fill:var(--flbg)}' + CSS.replace('\n', '\n', 1).rstrip('\n'), 'css')
    t = troca(t, "function recebe(f){if(f&&f.v===1){AO=f;AO.rec=Date.now();if(f.fonte)modo=f.fonte==='virtual'?'sem':'com';redesenha()}}", JS, 'recebe')
    # mae: halo e preenchimento de ocioso
    t = troca(t, "el('rect',{class:'corpo',x:mx,y:my,width:mw,height:mh,rx:10,style:fm?'fill:var(--'+({ok:'okbg',ativo:'atbg',falha:'flbg'}[fm.estado]||'sf')+')':''},gm);",
              "halo(gm,9,mx-5,my-5,mw+10,mh+10,14);\n  el('rect',{class:'corpo',x:mx,y:my,width:mw,height:mh,rx:10,style:fm?'fill:var(--'+({idle:'idbg',ok:'okbg',ativo:'atbg',falha:'flbg'}[fm.estado]||'sf')+')':''},gm);", 'mae')
    # blocos: halo
    t = troca(t, "    el('rect',{class:'corpo',x:b.x,y:b.y,width:W,height:b.h,rx:9},g);", "    halo(g,b.id,b.x-5,b.y-5,W+10,b.h+10,12);\n    el('rect',{class:'corpo',x:b.x,y:b.y,width:W,height:b.h,rx:9},g);", 'bloco')
    # simbolo de forma no estado
    a = "q=el('text',{x:b.x+12,y:b.y+HD+10,class:'est'},g);q.textContent='● '+(f?({idle:'ocioso',ok:'ok',ativo:'contando',falha:'falha'}[f.estado]||f.estado)+(f.txt?' · '+cut(f.txt,36):''):(vivoOk()?'sem dados deste filho':'sem sinal'));"
    b = ("q=el('text',{x:b.x+12,y:b.y+HD+10,class:'est'},g);{const sy=document.createElementNS(NS,'tspan');sy.setAttribute('class','sy '+(f?f.estado:'idle'));sy.textContent=(f?(SIMB[f.estado]||'●'):'●')+' ';q.appendChild(sy);\n"
         "      q.appendChild(document.createTextNode(f?({idle:'ocioso',ok:'ok',ativo:'contando',falha:'falha'}[f.estado]||f.estado)+(f.txt?' · '+cut(f.txt,36):''):(vivoOk()?'sem dados deste filho':'sem sinal')))}")
    t = troca(t, a, b, 'simbolo')
    # assinatura de redesenho inclui os pulsos ativos
    t = troca(t, "const sig=(on?JSON.stringify([AO.estado,AO.msg,AO.filhos,AO.kw,AO.etapa,AO.aplicar,modo,sel,aba]):'off'+modo+sel+aba)+zoom;", "const sig=(on?JSON.stringify([AO.estado,AO.msg,AO.filhos,AO.kw,AO.etapa,AO.aplicar,modo,sel,aba]):'off'+modo+sel+aba)+zoom+'|'+pulsoSig();", 'sig')
    # legenda
    t = troca(t, '<span><i class="p" style="background:#9a9990"></i>sem sinal</span>', '<span><i class="p" style="background:#9a9990"></i>sem sinal</span><span>■ ocioso ✔ ok ▶ contando ▲ falha</span><span><i style="border:3px solid #f59e0b;background:none"></i>âmbar: agiu agora</span>', 'legenda')
    # exportacao sem halo
    t = troca(t, "so.forEach((e,i)=>{const cs=getComputedStyle(e);PROPS.forEach(p=>{const v=cs.getPropertyValue(p);if(v)sc[i].style.setProperty(p,v)})});\n",
              "so.forEach((e,i)=>{const cs=getComputedStyle(e);PROPS.forEach(p=>{const v=cs.getPropertyValue(p);if(v)sc[i].style.setProperty(p,v)})});\n    sc.forEach(e=>{if(e.classList&&e.classList.contains('halo'))e.remove()});   // v0.17: o halo de atividade nao vai para o arquivo exportado\n", 'export')
    open(d, 'w', encoding='utf-8').write(t); print('mapa_fbs_v0.17.html ok')
if __name__ == '__main__': main()
