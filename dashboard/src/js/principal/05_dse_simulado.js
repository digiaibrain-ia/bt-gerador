

/* ===== v1.10.116 — DSE SIMULADO IDEAL (só Demo/ensaio simulado) =====
   POR QUÊ: o simulador gerava valores "quase ideais" e o ensaio reprovava sozinho (stand-by 106,6 % < 107 %). O pedido é que o DSE simulado seja IDEAL
   (tudo aprovado) e que, para testar o fluxo de reprovação, o operador escolha à mão qual condição reprova. Não toca em dado real: avaliaEnsaio só usa
   isto quando T.simulado. Índices = r1..r6 de avaliaEnsaio (tempo 100 %, V máx, V mín, Hz máx, Hz mín, stand-by). */
const DSE_SIM={apr:[true,true,true,true,true,true]};
const DSE_ROT=()=>[`Tempo em carga 100 % (mínimo ${fmt(T100_MIN)})`,`Tensão: desvio máximo de +${pt(TENS_TOL,1)} % sobre o nominal`,`Tensão: desvio mínimo de −${pt(TENS_TOL,1)} % sob o nominal`,
  `Frequência: desvio máximo de +${pt(FREQ_TOL,1)} % sobre o nominal`,`Frequência: desvio máximo de −${pt(FREQ_TOL,1)} % sob o nominal`,`Potência em Stand-by: mínimo ${pt(STBY_MIN,0)} % de carga aplicada`];
function dseSimAplica(rs){ // rs=[r1..r6] calculados; devolve a lista com o veredito do DSE simulado (N/A fica N/A)
  return rs.map((r,i)=>r==='N/A'?r:(DSE_SIM.apr[i]?'APROVADO':'REPROVADO'));
}
function dseSimAtualizaOlhos(){
  const n=DSE_SIM.apr.filter(x=>!x).length,o=$('dseOlhos');if(!o)return;
  o.classList.toggle('rep',n>0);$('dseTxt').textContent=n?`${n} reprovada${n>1?'s':''}`:'tudo aprovado';
}
function dseSimDesenha(){
  const rot=DSE_ROT();
  $('dseTab').innerHTML='<tbody>'+rot.map((t,i)=>`<tr><td>${t}</td><td style="width:190px"><span class="dseSeg" data-i="${i}"><button type="button" data-a="1" class="${DSE_SIM.apr[i]?'on ok':''}">Aprovado</button><button type="button" data-a="0" class="${DSE_SIM.apr[i]?'':'on cr'}">Reprovado</button></span></td></tr>`).join('')+'</tbody>';
  dseSimAtualizaOlhos();
}
$('dseTab').addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b)return;const i=+b.parentNode.dataset.i;DSE_SIM.apr[i]=b.dataset.a==='1';dseSimDesenha();
  if(window.devObs)window.devObs.log('sim','sistema','DSE simulado: condição '+(i+1)+' = '+(DSE_SIM.apr[i]?'APROVADO':'REPROVADO'),'ok')});
$('dseTodos').onclick=()=>{DSE_SIM.apr=[true,true,true,true,true,true];dseSimDesenha()};
const dseAbre=()=>{dseSimDesenha();const d=$('dlgDseSim');if(!d.open)d.showModal()};
$('dseOlhos').onclick=dseAbre;$('dseOlhos').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();dseAbre()}};
