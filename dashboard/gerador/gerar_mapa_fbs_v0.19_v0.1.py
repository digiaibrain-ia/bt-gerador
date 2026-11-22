#!/usr/bin/env python3
"""14/11/2026 - Gera dashboard/ferramentas/mapa_fbs_v0.19.html (de v0.18). Nao sobrescreve; aborta se um trecho esperado mudou.
Pedido do Reginaldo: "a area de visualizacao dos FB no celular e pequena, tem pouca altura". Medido (medidor 1.10.208, painel do mapa): em 390x844 o DIAGRAMA tinha 142 px (17 % da tela); em 360x740, 60 px (8 %);
deitado (844x390), 134 px (34 %). O resto era: cabecalho do mapa (3 linhas, 173 px), faixa Gerador/Banco/Carga (148 px) e legenda (178 px).
Mudancas (so em tela pequena: largura <= 760 px OU altura <= 520 px; o PC nao muda): (1) titulo do mapa escondido (o painel ja tem o titulo); botoes de modo curtos ("sem DSE", "com DSE", "Automatico");
pilula so com o estado da mae ("EXECUTANDO"; o verde ja diz que e ao vivo); o i da legenda sobe para a 1a linha (o cabecalho cabe em 2 linhas). ZOOM: "Ajustar" e o zoom inicial passam a ajustar pela ALTURA, no maximo 60 % (antes: pela largura, que no celular
travava em 40 % e deixava o diagrama pequeno com espaco vazio embaixo; sem o limite, em 100 % so cabia uma coluna e se perdia a visao geral). (2) faixa Gerador/Banco/Carga vira UMA linha de resumo ("G 50,0 kW · Banco 50,0→50,0 kW · Carga 50,0 %") com botao ▸ para abrir o detalhe.
(3) legenda sai da tela e vira o botao ⓘ (painel suspenso; fecha com ✕, Esc ou toque fora) — regra do projeto: texto longo vai para o ⓘ. Desenho dos FBs, fios, aureola, cores e Ajuda: iguais a v0.18.
Uso: python3 dashboard/gerador/gerar_mapa_fbs_v0.19_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); FE = os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)

CSS = """
/* ===== v0.19: AREA DO DIAGRAMA NO CELULAR (pedido do Reginaldo, 14/11/2026) =====
   POR QUE: em 390x844 o diagrama tinha 142 px (17 % da tela); em 360x740, 60 px. O cabecalho (3 linhas), a faixa Gerador/Banco/Carga (3 linhas) e a legenda (4 linhas) comiam o resto.
   COMO: so em tela pequena (largura <= 760 px ou altura <= 520 px): titulo escondido, botoes de modo curtos, faixa vira uma linha de resumo (▸ abre o detalhe) e a legenda vira o botao ⓘ. O PC nao muda. */
.gcT,.gcS,#bLeg,.legpop{display:none}
.legc{display:flex;flex-wrap:wrap;gap:6px 16px}.legc span{display:inline-flex;gap:5px;align-items:center}.legc i{width:12px;height:12px;border-radius:3px;display:inline-block}.legc i.p{border-radius:50%}
.legpop .legx{position:absolute;right:6px;top:6px;border:0;background:transparent;font-size:16px;padding:2px 8px;min-height:0}
@media (max-width:760px),(max-height:520px){
  h1{display:none}
  header{padding:4px 8px;gap:4px 6px}
  .seg .lg1,.mae-l,.vv{display:none}
  .seg button{padding:3px 9px}
  #vivo{white-space:nowrap}
  .lg{display:none}
  #bLeg{display:inline-flex;align-items:center;justify-content:center;min-width:36px}
  #gc{padding:3px 8px;gap:6px;min-height:0}
  #gc .gcT{display:inline-flex;align-items:center;justify-content:center;min-width:34px;flex:none}
  #gc.min .gcb,#gc.min .gcw,#gc.min .gcp{display:none}
  #gc.min .gcS{display:block;flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
  #gc:not(.min) .gcS{display:none}
  .legpop.on{display:block;position:fixed;left:8px;right:8px;bottom:8px;z-index:60;max-height:60vh;overflow:auto;padding:30px 14px 12px;background:var(--sf);border:1px solid var(--ln);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.35);font-size:12.5px;color:var(--ink2)}
}
"""

JS = r"""/* v0.19: modo compacto (celular): detalhe da faixa Gerador/Banco/Carga (▸/▾) e legenda no painel do ⓘ. A legenda e a mesma do rodape (sem texto duplicado no codigo). */
try{(function(){const T=$('gcT'),G=$('gc'),B=$('bLeg'),P=$('legPop'),fecha=()=>{P.classList.remove('on');B.setAttribute('aria-expanded','false')};
  T.onclick=()=>{const m=G.classList.toggle('min');T.textContent=m?'▸':'▾';T.setAttribute('aria-expanded',m?'false':'true')};
  B.onclick=e=>{e.stopPropagation();if(P.classList.contains('on')){fecha();return}P.innerHTML='<button type="button" class="legx" aria-label="Fechar">✕</button><div class="legc">'+document.querySelector('.lg').innerHTML+'</div>';P.querySelector('.legx').onclick=fecha;P.classList.add('on');B.setAttribute('aria-expanded','true')};
  document.addEventListener('pointerdown',e=>{if(P.classList.contains('on')&&!P.contains(e.target)&&e.target!==B)fecha()},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&P.classList.contains('on')){fecha();e.stopPropagation()}},true)})()}catch(e){}
"""

def main():
    o, d = os.path.join(FE, 'mapa_fbs_v0.18.html'), os.path.join(FE, 'mapa_fbs_v0.19.html'); assert os.path.exists(o) and not os.path.exists(d)
    t = open(o, encoding='utf-8').read()
    t = troca(t, '<html lang="pt-BR">\n', '<html lang="pt-BR">\n<!-- mapa_fbs_v0.19 · 14/11/2026 — CELULAR: o diagrama ganha altura. Em tela pequena (largura ≤ 760 px ou altura ≤ 520 px) o título some, os botões de modo ficam curtos, a faixa Gerador/Banco/Carga vira uma linha de resumo (▸ abre o detalhe) e a legenda vira o botão ⓘ (painel suspenso). O PC não muda. Resto igual à v0.18. -->\n', 'cab')
    t = troca(t, '<meta name="app-version" content="0.18">', '<meta name="app-version" content="0.19">', 'meta')
    t = troca(t, "  #gc .gcp{margin-left:0;flex:1 1 100%;text-align:center}\n}\n", "  #gc .gcp{margin-left:0;flex:1 1 100%;text-align:center}\n}\n" + CSS, 'css')
    # botoes de modo curtos no celular
    t = troca(t, '<button data-m="sem" aria-pressed="true">Guiado sem DSE</button><button data-m="com" aria-pressed="false">Guiado com DSE</button>',
              '<button data-m="sem" aria-pressed="true"><span class="lg1">Guiado </span>sem DSE</button><button data-m="com" aria-pressed="false"><span class="lg1">Guiado </span>com DSE</button>', 'seg')
    # botao da legenda (ⓘ) no cabecalho
    t = troca(t, 'Exportar ▾</button><span id="vivo" class="off">sem sinal</span>', 'Exportar ▾</button><button type="button" id="bLeg" aria-haspopup="dialog" aria-expanded="false" title="Legenda: cores, símbolos e brilho">ⓘ</button><span id="vivo" class="off">sem sinal</span>', 'bleg')
    # faixa: nasce recolhida (so vale em tela pequena) + botao e resumo
    t = troca(t, '<div id="gc" role="group"', '<div id="gc" class="min" role="group"', 'gc')
    t = troca(t, 'o % de carga">\n <div class="gcb"><svg class="gen" id="gcIco"', 'o % de carga">\n <button type="button" class="gcT" id="gcT" aria-expanded="false" title="Mostra ou esconde o detalhe de Gerador, Banco e Carga">▸</button><span class="gcS" id="gcS">sem sinal</span>\n <div class="gcb"><svg class="gen" id="gcIco"', 'gcT')
    t = troca(t, '<aside id="dr" hidden', '<div class="legpop" id="legPop" role="dialog" aria-label="Legenda"></div>\n<aside id="dr" hidden', 'legpop')
    # resumo da faixa
    a = "  p.textContent=!a||!a.modo?'aplicação: —':(a.modo==='M'?'Manual · '+(a.liberado?'aguardando o operador aplicar':'aplicado'):'Auto');\n}\nfunction redesenha"
    t = troca(t, a, "  p.textContent=!a||!a.modo?'aplicação: —':(a.modo==='M'?'Manual · '+(a.liberado?'aguardando o operador aplicar':'aplicado'):'Auto');\n  $('gcS').textContent=on?'G '+f1(kwM)+' kW · Banco '+f1(AO.kw.alvo)+'→'+f1(AO.kw.conf)+' kW · Carga '+f1(pct)+' %':'sem sinal';   // v0.19: resumo de uma linha (celular)\n}\nfunction redesenha", 'resumo')
    # pilula AO VIVO: "mae:" some no celular
    t = troca(t, "v.textContent=on?'AO VIVO · mãe: '+AO.estado:(AO?'sem sinal (último: '+AO.estado+')':'sem sinal');",
              "v.textContent='';if(on){const vv=document.createElement('span');vv.className='vv';vv.textContent='AO VIVO · ';const ml=document.createElement('span');ml.className='mae-l';ml.textContent='mãe: ';v.append(vv,ml,AO.estado)}else v.append(AO?'sem sinal (último: '+AO.estado+')':'sem sinal');", 'vivo')
    # zoom inicial e "Ajustar": em tela pequena pela ALTURA disponivel (a largura travava em 40 % e sobrava espaco vazio embaixo)
    t = troca(t, "function ajusta(){const G=geometria();zoom=Math.max(.4,Math.min(1.6,($('cv').clientWidth-8)/G.w));aplicaZoom(G)}",
              "function ajusta(){const G=geometria(),comp=window.matchMedia('(max-width:760px),(max-height:520px)').matches;zoom=comp?Math.max(.4,Math.min(.6,($('cv').clientHeight-8)/G.h)):Math.max(.4,Math.min(1.6,($('cv').clientWidth-8)/G.w));aplicaZoom(G)}   /* v0.19: no celular ajusta pela altura (maximo 60 %) */", 'ajusta')
    t = troca(t, 'title="Cabe na largura da janela">Ajustar', 'title="Ajusta o diagrama à janela (no celular, pela altura)">Ajustar', 'zA')
    # JS do modo compacto: junto do bloco da aureola
    t = troca(t, "function recebe(f){if(f&&f.v===1){AO=f;AO.rec=Date.now();if(f.fonte)modo=f.fonte==='virtual'?'sem':'com';redesenha()}}", JS + "function recebe(f){if(f&&f.v===1){AO=f;AO.rec=Date.now();if(f.fonte)modo=f.fonte==='virtual'?'sem':'com';redesenha()}}", 'js')
    open(d, 'w', encoding='utf-8').write(t); print('mapa_fbs_v0.19.html ok')
if __name__ == '__main__': main()
