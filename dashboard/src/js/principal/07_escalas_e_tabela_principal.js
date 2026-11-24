/* Tela única: se o conteúdo não couber na altura da janela (notebook menor, banco com muitas chaves),
   reduz a tela aos poucos até caber — assim nunca é preciso rolar. Em janela alta nada muda (zoom 1). */
const ESCALAS=[0.85,1,1.15,1.3,1.5]; // tamanhos da letra (botões A− / A+)
let iEsc=1;
function escalaMax(){ // a letra só cresce enquanto a largura útil (janela ÷ escala) ainda comporta o layout da faixa atual
  const w=innerWidth,lim=w>=1280?1280:w>=760?760:360;
  return Math.max(1,w/lim);
}
function fitZoom(){
  const root=document.documentElement,u=Math.min(ESCALAS[iEsc],escalaMax());
  if(window.rotEsc)rotEsc();
  root.classList.toggle('rolar',u>1);               // letra maior: deixa a tela rolar
  if(innerWidth<1280||u>1){root.style.setProperty('--z',u);return}
  const sobra=()=>[...document.querySelectorAll('.panel,.tbw')].some(e=>e.offsetParent&&e.scrollHeight>e.clientHeight+1);
  let z=u;root.style.setProperty('--z',z);
  while(z>0.7&&sobra()){z=Math.round((z-0.02)*100)/100;root.style.setProperty('--z',z)}
}
window.addEventListener('resize',()=>{fitZoom();drawScreen()});
if(window.ResizeObserver)new ResizeObserver(drawScreen).observe($('chart').parentElement); // card do gráfico mudou de tamanho

/* ===== TABELA DO ENSAIO ===== */
const LINHAS=[ // chave, rótulo, casas decimais, só-tela
  ['pc','Carga real (%)',1,true],
  ['kw','Potência (kW)',1],['tc','Temp. motor (°C)',0],
  ['va','Tensão Va (V)',1],['vb','Tensão Vb (V)',1],['vc','Tensão Vc (V)',1],
  ['ia','Corrente Ia (A)',0],['ib','Corrente Ib (A)',0],['ic','Corrente Ic (A)',0],
  ['rpm','Rotação (RPM)',0],['bat','Bateria (V)',1]];
function buildTabela(){
  let h='<thead><tr><th>Parâmetro</th>'+ETAPAS.map((e,i)=>`<th id="th${i}">${e.alvo} %<small></small></th>`).join('')+'</tr></thead><tbody>';
  LINHAS.forEach(([k,r,d,v])=>{h+=`<tr${v?' class="vis"':''}><td>${r}</td>`+ETAPAS.map((e,i)=>`<td id="c_${k}_${i}">–</td>`).join('')+'</tr>'});
  h+='<tr><td>Tempo de estabilidade (s)</td>'+ETAPAS.map((e,i)=>`<td id="c_estab_${i}">–</td>`).join('')+'</tr>';
  h+='<tr><td>Cronômetro (meta)</td>'+ETAPAS.map((e,i)=>`<td id="c_cron_${i}">–</td>`).join('')+'</tr>';
  h+='<tr class="sv vis"><td>Salvar valores da etapa</td>'+ETAPAS.map((e,i)=>`<td id="c_sv_${i}"><button class="svbtn" data-i="${i}" disabled>Salvar</button></td>`).join('')+'</tr></tbody>';
  $('tb').innerHTML=h;
  $('tbTit').textContent='Registro do ensaio'; // v1.9.29: título simplificado a pedido do operador (antes incluía "· valor no fim de cada etapa (média dos últimos Xs)")
}
function setTxt(el,t){if(el.textContent!==t)el.textContent=t}
function setCls(el,c){if(el.className!==c)el.className=c}
buildTabela();
