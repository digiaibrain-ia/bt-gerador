#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.179.html a partir da v1.10.178 (nao sobrescreve; aborta se um trecho esperado mudou).
Pedidos do Reginaldo (07/11/2026, depois de rodar o robo no note DELL com zoom 100 % e 33 %):
 1) Barra do Dev/Operador oculto (a janelinha com Parar): ganha CRONOMETRO, pode ser ARRASTADA e REDIMENSIONADA (posicao e tamanho ficam guardados) e RECOLHIDA;
    nasce no canto inferior DIREITO (antes: no meio de baixo, em cima de "Ultima atualizacao" e dos cards).
 2) Visao do operador "Simples (so INICIAR)": nao mostra mais o card Patamar.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.179_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.178.html', 'medidor_gerador_v1.10.179.html'

CSS = """
  /* ===== v1.10.179 · barra do Dev/Operador oculto: cronometro, arrastar, redimensionar, recolher ===== */
  #opsBar{inset:auto 14px 14px auto;transform:none;resize:both;overflow:auto;min-width:250px;max-width:94vw}
  #opsBar .opsGrip{cursor:move;font-size:18px;line-height:1;opacity:.8;padding:0 2px;user-select:none;touch-action:none}
  #opsBar .opsCron{font-variant-numeric:tabular-nums;font-weight:700;background:#1e3a5f;border-radius:6px;padding:2px 8px;white-space:nowrap}
  #opsBar #opsMin{background:transparent;border:1px solid #6b86a6;padding:2px 9px}
  #opsBar.min .opsPasso,#opsBar.min .opsCnt{display:none}
  #opsBar.min{min-width:0;resize:none}
  /* v1.10.179: Visao do operador "Simples" nao mostra o card Patamar */
  body.opsimples #patCard{display:none!important}
"""
HTML_VELHO = '<div id="opsBar" role="status" aria-live="polite" hidden><div class="opsTxt"><span class="opsTit"></span><span class="opsPasso"></span></div><span class="opsCnt"></span>'
HTML_NOVO = '<div id="opsBar" role="status" aria-live="polite" hidden><span class="opsGrip" id="opsGrip" title="Arraste para mover (duplo clique volta ao canto)">⠿</span><div class="opsTxt"><span class="opsTit"></span><span class="opsPasso"></span></div><span class="opsCron" id="opsCron" title="Tempo desde o início do teste">00:00</span><span class="opsCnt"></span><button type="button" id="opsMin" title="Recolher / abrir">–</button>'

JS = r"""
  /* ===== v1.10.179 · barra do robô: cronômetro, arrastar, redimensionar, recolher (posição e tamanho guardados neste navegador) ===== */
  (function(){
    const bar=$('opsBar'),cron=$('opsCron'),grip=$('opsGrip'),mn=$('opsMin');if(!bar||!cron)return;
    const LS='bt2.dev.barra';let sv={};try{sv=JSON.parse(localStorage.getItem(LS)||'{}')||{}}catch(e){}
    const grava=()=>{try{localStorage.setItem(LS,JSON.stringify(sv))}catch(e){}};
    const zm=()=>{const r=bar.getBoundingClientRect();return(bar.offsetWidth?r.width/bar.offsetWidth:1)||1};
    const cabe=()=>{ // a barra inteira fica na tela
      const r=bar.getBoundingClientRect(),W=innerWidth,H=innerHeight,z=zm();let dx=0,dy=0;
      if(r.left<0)dx=-r.left;else if(r.right>W)dx=W-r.right;if(r.top<0)dy=-r.top;else if(r.bottom>H)dy=H-r.bottom;
      if(dx||dy){bar.style.left=((parseFloat(bar.style.left)||r.left/z)+dx/z)+'px';bar.style.top=((parseFloat(bar.style.top)||r.top/z)+dy/z)+'px'}
    };
    const aplica=()=>{if(sv.l!=null){bar.style.inset='auto';bar.style.left=sv.l+'px';bar.style.top=sv.t+'px'}if(sv.w){bar.style.width=sv.w+'px';bar.style.height=sv.h+'px'}bar.classList.toggle('min',!!sv.min);if(mn)mn.textContent=sv.min?'+':'–'};
    const mm=ms=>{const s=Math.max(0,Math.floor(ms/1000));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
    setInterval(()=>{
      if(typeof OPS==='undefined')return;
      if(OPS.rodando||OPS.fim){cron.textContent=mm((OPS.fim||Date.now())-(OPS.ini||Date.now()))}
      if(bar.matches&&bar.matches(':popover-open')&&!bar.dataset.ok){bar.dataset.ok='1';aplica();cabe()}
      if(!(bar.matches&&bar.matches(':popover-open')))delete bar.dataset.ok;
    },500);
    grip.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;const r=bar.getBoundingClientRect(),z=zm(),x0=e.clientX,y0=e.clientY;
      bar.style.inset='auto';bar.style.left=r.left/z+'px';bar.style.top=r.top/z+'px';try{grip.setPointerCapture(e.pointerId)}catch(x){}
      const mv=ev=>{bar.style.left=(r.left+ev.clientX-x0)/z+'px';bar.style.top=(r.top+ev.clientY-y0)/z+'px';cabe()};
      const up=()=>{grip.removeEventListener('pointermove',mv);grip.removeEventListener('pointerup',up);const q=bar.getBoundingClientRect();sv.l=Math.round(q.left/z);sv.t=Math.round(q.top/z);grava()};
      grip.addEventListener('pointermove',mv);grip.addEventListener('pointerup',up);
    });
    grip.addEventListener('dblclick',()=>{delete sv.l;delete sv.t;delete sv.w;delete sv.h;grava();bar.style.cssText='';delete bar.dataset.ok;bar.dataset.ok='1';aplica()});
    if(mn)mn.addEventListener('click',()=>{sv.min=!sv.min;grava();aplica();cabe()});
    if(window.ResizeObserver)new ResizeObserver(()=>{if(!bar.matches(':popover-open')||bar.classList.contains('min'))return;const q=bar.getBoundingClientRect(),z=zm();if(q.width>0&&bar.dataset.ok){sv.w=Math.round(q.width/z);sv.h=Math.round(q.height/z);grava()}}).observe(bar);
    addEventListener('resize',()=>{if(bar.matches(':popover-open'))cabe()});
  })();
"""


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.178">', '<meta name="app-version" content="1.10.179">', 'meta')
    t = troca(t, "const VERSAO='1.10.178', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.179', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.179\",d:\"07/11/2026\",i:[\n"
              "    'Barra do Dev/Operador oculto: ganhou CRONÔMETRO, pode ser ARRASTADA (⠿) e REDIMENSIONADA (posição e tamanho ficam guardados), pode ser RECOLHIDA (–) e agora nasce no canto inferior direito (antes ficava no meio, em cima de \"Última atualização\"). Visão do operador \"Simples (só INICIAR)\" não mostra mais o card Patamar.',\n"
              "  ]},\n", 'historico')
    t = troca(t, '</style>', CSS + '</style>', 'css') if t.count('</style>') == 1 else t.replace('  #opsBar .opsCnt{font-variant-numeric:tabular-nums;white-space:pre}', '  #opsBar .opsCnt{font-variant-numeric:tabular-nums;white-space:pre}' + CSS, 1)
    t = troca(t, HTML_VELHO, HTML_NOVO, 'html barra')
    t = troca(t, "  window.opSecreto={rodar,rodarAv,parar:", JS + "\n  window.opSecreto={rodar,rodarAv,parar:", 'js')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
