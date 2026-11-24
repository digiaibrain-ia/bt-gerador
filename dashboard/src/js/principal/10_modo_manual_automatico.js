








function setVel(x){T.sp=x;document.querySelectorAll('#velSeg button').forEach(b=>b.classList.toggle('on',+b.dataset.v===x))}
document.querySelectorAll('#velSeg button').forEach(b=>b.onclick=()=>setVel(+b.dataset.v));
let auto=false;
function setModo(a){
  if(!a&&auto){$('simCarga').value=SIM.sw;$('simVal').textContent=pt(SIM.sw)+'%'}
  auto=a;$('mMan').classList.toggle('on',!a);$('mAuto').classList.toggle('on',a);
  $('rowSlider').style.display=a?'none':'flex';$('autoInfo').style.display=a?'flex':'none';
  if(a){SIM.tgt=SIM.sw;SIM.lastTgt=SIM.sw}
  // v1.9.75: Simulação AUTO = operador simulado monta a carga sozinho; com os bancos nascendo em Manual (bloqueados,
  // como a seletora física) ele não teria chave nenhuma disponível. Ao entrar em AUTO no Demo local, libera os dois.
  if(a&&typeof bkEhDemoLocal==='function'&&bkEhDemoLocal())bkAutoLibera();
}
$('mMan').onclick=()=>setModo(false);$('mAuto').onclick=()=>setModo(true);
$('bInfo').onclick=()=>{const o=$('note').classList.toggle('open');$('bInfo').setAttribute('aria-expanded',o)};
