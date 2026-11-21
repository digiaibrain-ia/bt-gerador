#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.176.html a partir da v1.10.175 (nao sobrescreve; aborta se um trecho esperado mudou).
Correcoes achadas pela REVISAO UNIVERSAL (desktop + celular Poco X6 Pro) pedida pelo Reginaldo em 07/11/2026:
 1) arrastar janela: o limite deixava a janela sair pela direita/baixo e o X ficava fora da tela (nao dava mais para fechar) -> agora a janela inteira (titulo e X) fica na tela;
 2) arrastar por TOQUE nao funcionava (o navegador roubava o gesto para rolar a pagina) -> cabecalho com touch-action:none;
 3) faixa vermelha de erro vazia (div.jerr) ficava por cima de campos (ex.: catalogo em Dados do ensaio) -> some quando vazia e nao captura clique;
 4) celular: alvos de toque pequenos (13 a 22 px) -> tamanho minimo de toque nos dispositivos de toque (pointer:coarse). PC nao muda.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.176_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.175.html', 'medidor_gerador_v1.10.176.html'

CSS = """
  /* ===== v1.10.176 · correcoes da revisao universal (desktop + celular) ===== */
  .jan .jt{touch-action:none}                                   /* arrastar a janela por TOQUE (antes a pagina rolava no lugar) */
  .jan .jerr{pointer-events:none}                               /* a faixa de erro nao pode capturar clique de campo vizinho */
  .jan .jerr:empty{display:none;min-height:0;margin:0}          /* vazia = nao ocupa lugar */
  @media (pointer:coarse){                                      /* so celular/tablet: alvo de toque confortavel (o PC nao muda) */
    button,.bt,.cfgbtn,summary,select{min-height:40px}
    .jan .jx{width:40px;height:40px}
    input[type=checkbox],input[type=radio]{width:22px;height:22px}
    #bMenos,#bMais{min-width:44px}
  }
"""

GUARDA = r"""
/* ===== v1.10.176 · GUARDA "JANELA NA TELA" =====
   POR QUE: a posição guardada de uma janela (ou o zoom/ampliar do Gráfico) podia deixá-la com o ✕ e botões fora da tela (ex.: Gráfico ampliado abria com a borda direita cortada).
   O QUE FAZ: quando uma janela aberta muda de tamanho/posição ou a tela muda (girar o celular), empurra a janela só o suficiente para ela caber inteira na tela. Não mexe em janela centralizada pelo navegador. */
(function(){
  function garante(d){
    if(!d.open)return;
    const r=d.getBoundingClientRect();if(r.width<=0||r.height<=0)return;
    if(!d.style.left&&!d.style.top)return;
    const z=d.offsetWidth?r.width/d.offsetWidth:1,W=innerWidth,H=innerHeight;let dx=0,dy=0;
    if(r.width<=W){if(r.left<0)dx=-r.left;else if(r.right>W)dx=W-r.right}else{if(r.left>0)dx=-r.left;else if(r.right<W)dx=W-r.right}
    if(r.height<=H){if(r.top<0)dy=-r.top;else if(r.bottom>H)dy=H-r.bottom}else{if(r.top>0)dy=-r.top;else if(r.bottom<H)dy=H-r.bottom}
    if(Math.abs(dx)<1&&Math.abs(dy)<1)return;
    d.style.left=((parseFloat(d.style.left)||r.left/z)+dx/z)+'px';d.style.top=((parseFloat(d.style.top)||r.top/z)+dy/z)+'px';
  }
  const ro=window.ResizeObserver?new ResizeObserver(es=>es.forEach(e=>garante(e.target))):null;
  const mo=new MutationObserver(ms=>ms.forEach(m=>garante(m.target)));
  document.querySelectorAll('dialog.jan').forEach(d=>{if(ro)ro.observe(d);mo.observe(d,{attributes:true,attributeFilter:['open','style']})});
  addEventListener('resize',()=>document.querySelectorAll('dialog.jan[open]').forEach(garante));
})();
"""


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.175">', '<meta name="app-version" content="1.10.176">', 'meta')
    t = troca(t, "const VERSAO='1.10.175', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.176', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.176\",d:\"07/11/2026\",i:[\n"
              "    'Correções da revisão universal (PC e celular): (1) arrastar uma janela não a deixa mais sair da tela — o ✕ e o título ficam sempre visíveis; (2) arrastar por TOQUE passou a funcionar; (3) a faixa de erro vazia não cobre mais campos (ex.: catálogo em Dados do ensaio); (4) no celular os botões, caixas de marcar e ✕ ganharam tamanho mínimo de toque (o PC não muda).',\n"
              "  ]},\n", 'historico')
    # 1) limite do arrasto: janela inteira dentro da tela (se for mais larga que a tela, ainda alcanca as duas bordas)
    t = troca(t, "        const l=Math.min(Math.max(l0+(ev.clientX-x0)/z,120-d.offsetWidth),W-120);\n        const t=Math.min(Math.max(t0+(ev.clientY-y0)/z,0),H-40);",
              "        const dw=d.offsetWidth,dh=d.offsetHeight;   // v1.10.176: a janela INTEIRA fica na tela (X, título e botões do rodapé sempre alcançáveis); se for maior que a tela, alcança as duas bordas\n"
              "        const l=Math.min(Math.max(l0+(ev.clientX-x0)/z,Math.min(0,W-dw)),Math.max(0,W-dw));\n"
              "        const t=Math.min(Math.max(t0+(ev.clientY-y0)/z,Math.min(0,H-dh)),Math.max(0,H-dh));", 'clamp')
    t = troca(t, "\n</script>\n</body>", "\n" + GUARDA + "</script>\n</body>", 'guarda')
    t = troca(t, "</style>", CSS + "</style>", 'css')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
