
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
    if(tip.textContent!==t)tip.textContent=t;tip.style.display='block';try{if(!tip.matches(':popover-open'))tip.showPopover()}catch(e){ /* ignorado: popover já no estado pedido ou sem suporte */ }posiciona()}
  function fecha(){clearTimeout(tFecha);if(!tip)return;tip.style.display='none';try{if(tip.matches(':popover-open'))tip.hidePopover()}catch(e){ /* ignorado: popover já no estado pedido ou sem suporte */ }alvo=null}
  function agenda(){clearTimeout(tFecha);tFecha=setTimeout(()=>{if(!sel())fecha()},350)}
  const acha=e=>e.target&&e.target.closest?e.target.closest('.ibub,#modoCard .lk'):null;
  document.addEventListener('mouseover',e=>{const el=acha(e);if(el)mostra(el)},true);
  document.addEventListener('mouseout',e=>{if(acha(e))agenda()},true);
  document.addEventListener('focusin',e=>{const el=acha(e);if(el)mostra(el)},true);
  document.addEventListener('focusout',e=>{if(acha(e))agenda()},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')fecha()},true);
  window.addEventListener('scroll',()=>{if(tip&&tip.style.display==='block')posiciona()},true);
  window.addEventListener('resize',()=>{if(tip&&tip.style.display==='block')posiciona()});
})();
