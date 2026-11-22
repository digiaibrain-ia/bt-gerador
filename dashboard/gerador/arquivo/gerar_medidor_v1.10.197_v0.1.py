#!/usr/bin/env python3
"""10/11/2026 - gera medidor_gerador_v1.10.197.html a partir da 1.10.196 (nao sobrescreve; aborta se um trecho esperado mudou).
Relato do Reginaldo (Patamar, icone "i"): o balao desloca os cards para baixo, nao da para selecionar/copiar o texto do balao e a parte esquerda da tela "vibra" com o mouse em cima.
Causa provavel (codigo): o balao era um pseudo-elemento CSS (.ibub::after, position:absolute dentro do card): faz parte do fluxo de rolagem do card, some quando o mouse sai do icone (nao deixa selecionar)
e pode mexer no layout/scroll. NAO reproduzi o deslocamento/vibracao em Chromium (layout igual antes e durante o hover): a correcao remove a classe inteira de causas possiveis.
Correcao: balao unico em JS (#ibubTip), popover (camada superior: fica acima de janelas modais), position:fixed (nunca mexe no layout), dentro da tela, com texto SELECIONAVEL, que continua aberto enquanto o mouse esta
nele (ou ha texto selecionado) e fecha com Esc ou ao sair. O .ibub::after fica desligado. O texto continua vindo de data-tip. Nada mais muda.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.197_v0.1.py"""
import os
P = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')), 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
BLOCO = r'''<style id="ibubTipCss">.ibub::after{content:none!important;display:none!important}
#ibubTip{position:fixed;margin:0;inset:auto;border:0;display:none;max-width:min(340px,calc(100vw - 24px));background:#1f2937;color:#fff;font:400 12px/1.45 system-ui,Segoe UI,sans-serif;padding:8px 10px;border-radius:8px;box-shadow:0 4px 14px rgba(0,0,0,.28);user-select:text;-webkit-user-select:text;cursor:text;white-space:normal;overflow:visible}
#ibubTip::selection{background:#3b82f6;color:#fff}</style>
<script>
/* ===== v1.10.197 · BALÃO DO ÍCONE ⓘ (um só, fora do fluxo) =====
   PARA QUE SERVE (leigo): o balãozinho que aparece no ⓘ não empurra mais os cards, o texto dele pode ser selecionado e copiado (Ctrl+C) e ele não some quando você leva o mouse até ele.
   COMO FUNCIONA (técnico): um <div popover="manual" id="ibubTip"> position:fixed (camada superior, acima de diálogos modais), preenchido com o data-tip do .ibub sob o mouse/foco; fecha 350 ms depois de o mouse sair do ícone
   e do balão (não fecha enquanto houver texto selecionado dentro dele); Esc fecha. Somente leitura: não comanda nada. */
(function(){
  let tip=null,alvo=null,tFecha=0;
  const sel=()=>{try{const s=window.getSelection();return !!(s&&String(s).length&&tip&&tip.contains(s.anchorNode))}catch(e){return false}};
  function cria(){tip=document.createElement('div');tip.id='ibubTip';tip.setAttribute('role','tooltip');tip.setAttribute('popover','manual');document.body.appendChild(tip);
    tip.addEventListener('mouseenter',()=>clearTimeout(tFecha));tip.addEventListener('mouseleave',agenda)}
  function posiciona(){if(!alvo||!tip)return;const r=alvo.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;
    let x=Math.min(Math.max(8,r.left),Math.max(8,innerWidth-w-8)),y=r.bottom+6;if(y+h>innerHeight-8)y=Math.max(8,r.top-h-6);tip.style.left=x+'px';tip.style.top=y+'px'}
  function mostra(el){const t=el.getAttribute('data-tip');if(!t)return;if(!tip)cria();clearTimeout(tFecha);alvo=el;
    if(tip.textContent!==t)tip.textContent=t;tip.style.display='block';try{if(!tip.matches(':popover-open'))tip.showPopover()}catch(e){}posiciona()}
  function fecha(){clearTimeout(tFecha);if(!tip)return;tip.style.display='none';try{if(tip.matches(':popover-open'))tip.hidePopover()}catch(e){}alvo=null}
  function agenda(){clearTimeout(tFecha);tFecha=setTimeout(()=>{if(!sel())fecha()},350)}
  const acha=e=>e.target&&e.target.closest?e.target.closest('.ibub'):null;
  document.addEventListener('mouseover',e=>{const el=acha(e);if(el)mostra(el)},true);
  document.addEventListener('mouseout',e=>{if(acha(e))agenda()},true);
  document.addEventListener('focusin',e=>{const el=acha(e);if(el)mostra(el)},true);
  document.addEventListener('focusout',e=>{if(acha(e))agenda()},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')fecha()},true);
  window.addEventListener('scroll',()=>{if(tip&&tip.style.display==='block')posiciona()},true);
  window.addEventListener('resize',()=>{if(tip&&tip.style.display==='block')posiciona()});
})();
</script>
'''
def main():
    o, d = os.path.join(P, 'medidor_gerador_v1.10.196.html'), os.path.join(P, 'medidor_gerador_v1.10.197.html'); assert os.path.exists(o) and not os.path.exists(d)
    t = open(o, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.196">', '<meta name="app-version" content="1.10.197">', 'meta')
    t = troca(t, "const VERSAO='1.10.196', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.197', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.197\",d:\"10/11/2026\",i:[\n"
              "    'Balão do ícone ⓘ refeito: um só, fora do fluxo da tela (não empurra mais os cards nem mexe no layout), com texto que dá para SELECIONAR e copiar, que não some quando o mouse vai até ele, acima de janelas modais e dentro da tela. Esc fecha.'\n  ]},\n", 'historico')
    t = troca(t, '</body>', BLOCO + '</body>', 'body')
    open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.197.html ok')
if __name__ == '__main__': main()
