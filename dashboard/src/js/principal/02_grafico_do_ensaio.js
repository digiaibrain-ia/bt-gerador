function registra(dt){
  if(!T.started)return;
  if(T.et!==C.lastEt){const ant=C.lastEt;C.starts[T.et]=C.t;C.lastEt=T.et;salvaEtapa(ant)}
  if(T.fim){if(!SNAP[T.et])salvaEtapa(T.et);return}
  const sp=T.sp, dtc=dt*sp; C.t+=dtc;
  const cont=T.run&&dadoOk&&carga!=null&&genRun()&&T.estavel>=ESTAB[T.et];
  const s=!T.run?2:(cont||MODO==='carga')?0:1;
  if(s===1)C.stopped+=dtc;
  const last=C.pts[C.pts.length-1];
  // v1.9.34: k = tempo de CRONÔMETRO do ponto; n = ponto "válido" pro gráfico "Tempo de ensaio" (só quando o cronômetro realmente conta)
  const n=cont&&!T.aguarda&&!T.aguardaFim;
  if(carga!=null&&(!last||C.t-last.t>=0.4))C.pts.push({t:C.t,c:carga,s,e:T.et,sp,m:{...MED},k:cronAtual(),n});
}
function geom(){ // início/fim real das etapas feitas e projeção das que faltam
  const g=[];
  for(let i=0;i<ETAPAS.length;i++){
    let s,e;
    if(i<T.et){s=C.starts[i]??0;e=C.starts[i+1]??s}
    else if(i===T.et){s=C.starts[i]??C.t;e=T.fim?C.t:C.t+Math.max(durS(i)-T.el,0)}
    else{s=g[i-1].e;e=s+durS(i)}
    g.push({s,e,a:ETAPAS[i].alvo});
  }
  return g;
}
function cronAtual(){let d=0;for(let i=0;i<T.et;i++)d+=durS(i);return d+T.el}
function statsTxt(comRelogio){ // resumo de tempos: na tela mostra também o relógio; no relatório/export só cronômetro e estabilização
  if(!T.started&&!C.pts.length)return '';
  const txt='Cronômetro '+fmt(cronAtual())+' · Estabilização '+fmt(C.stopped);
  return comRelogio?('Relógio '+fmt(C.t)+' · '+txt):txt;
}
function geomPlano(){ // v1.9.34: perfil planejado em tempo de ensaio (soma das durações das etapas)
  const g=[];let ac=0;for(let i=0;i<ETAPAS.length;i++){const d=durS(i);g.push({s:ac,e:ac+d,a:ETAPAS[i].alvo});ac+=d}return g}
function drawChart(ctx,W,H,title){
  const GM=gModo(),CL=GM==='classico';
  const g=CL?geom():geomPlano(), k=Math.max(1,W/800);
  const PTS=CL?C.pts:C.pts.filter(p=>p.n&&!p.z).map(p=>({t:p.k,c:p.c,e:p.e})); // 'ensaio': só o que o cronômetro contou, no eixo do cronômetro
  const esc=!title&&document.documentElement.dataset.tema==='escuro'; // exportações (PNG/PDF) ficam sempre claras
  const P=esc?{bg:'#1b1c1f',txt:'#b8b9b3',g1:'#34363b',g2:'#2a2c30',frame:'#6a6c72',leg:'#d6d7d2',dash:'#cfcfca',line:'#5aa2f0'}
             :{bg:'#fff',txt:'#555',g1:'#e4e4e0',g2:'#efefec',frame:'#999',leg:'#333',dash:'#444',line:'#2f7fd8'};
  const xmax=Math.max(60,Math.ceil(g[g.length-1].e/60)*60,Math.ceil(((CL?C.t:cronAtual())+1)/60)*60);
  let LEG=[['line',P.line,'Carga medida'],['dash',P.dash,'Perfil planejado'],['box','rgba(120,120,120,.35)','Tolerância ±'+TOL+'%'],['box','rgba(241,184,28,.55)','Ajuste e estabilização'],['box','rgba(140,140,140,.35)','Pausa']];
  if(!CL)LEG=LEG.filter(x=>!/Ajuste|Pausa/.test(x[2])); // v1.9.34: sem faixas de ajuste/pausa
  ctx.font=`${11*k}px system-ui,Arial`;
  let rows=1,lx0=50*k;  // linhas que a legenda ocupa (gráfico estreito = mais linhas)
  LEG.forEach(([,,tx])=>{const w=ctx.measureText(tx).width+34*k;if(lx0+w>W-14*k&&lx0>50*k){rows++;lx0=50*k}lx0+=w+10*k});
  const mL=50*k,mR=14*k,mT=(title?78:16)*k,mB=(rows>1?44+15*rows:66)*k,pw=W-mL-mR,ph=H-mT-mB;
  const X=t=>mL+t/xmax*pw, Y=v=>mT+ph-(Math.min(Math.max(v,0),120)/120)*ph;
  ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);
  ctx.font=`${11*k}px system-ui,Arial`;ctx.textBaseline='middle';
  if(title){
    ctx.fillStyle='#111';ctx.textAlign='left';ctx.font=`bold ${20*k}px system-ui,Arial`;ctx.fillText(title,mL,24*k);
    ctx.font=`${12*k}px system-ui,Arial`;ctx.fillStyle=P.txt;
    ctx.fillText(`${$('pModelo').textContent} · ${new Date().toLocaleString('pt-BR')}`,mL,46*k);
    ctx.fillText(statsTxt(),mL,62*k);ctx.font=`${11*k}px system-ui,Arial`;
  }
  // grade horizontal
  ctx.lineWidth=1;ctx.textAlign='right';
  [0,30,50,100,107,120].forEach(v=>{
    ctx.strokeStyle=P.g1;ctx.beginPath();ctx.moveTo(mL,Y(v));ctx.lineTo(mL+pw,Y(v));ctx.stroke();
    const dy=ph<200*k?(v===107?-4*k:v===100?4*k:0):0; // 100 e 107 ficam muito juntos em gráfico baixo
    ctx.fillStyle=P.txt;ctx.fillText(v,mL-6*k,Y(v)+dy);
  });
  // grade vertical
  const step=xmax<=600?60:xmax<=1800?120:300;ctx.textAlign='center';
  for(let t=0;t<=xmax;t+=step){
    ctx.strokeStyle=P.g2;ctx.beginPath();ctx.moveTo(X(t),mT);ctx.lineTo(X(t),mT+ph);ctx.stroke();
    ctx.fillStyle=P.txt;ctx.fillText(fmt(t),X(t),mT+ph+12*k);
  }
  ctx.fillStyle=P.txt;ctx.fillText(CL?'Tempo de relógio (mm:ss)':'Tempo de ensaio — cronômetro (mm:ss)',mL+pw/2,mT+ph+26*k);
  ctx.save();ctx.translate(13*k,mT+ph/2);ctx.rotate(-Math.PI/2);ctx.fillText('Carga (%)',0,0);ctx.restore();
  // intervalos de ajuste e estabilização (amarelo) ou pausado (cinza)
  let run=null;
  const fecha=(t1)=>{if(!run)return;ctx.fillStyle=run.s===1?'rgba(241,184,28,.38)':'rgba(140,140,140,.22)';ctx.fillRect(X(run.t0),mT,Math.max(X(t1)-X(run.t0),1),ph);run=null};
  let prevT=0;
  if(CL)C.pts.forEach(p=>{
    if(!run||run.s!==p.s||p.s===0){ if(run)fecha(prevT); if(p.s!==0)run={s:p.s,t0:prevT} }
    prevT=p.t;
  });
  if(CL)fecha(prevT);
  // faixas de tolerância
  if(MODO!=='carga')g.forEach(e=>{
    ctx.fillStyle='rgba(120,120,120,.22)';
    const lo=Math.max(e.a-TOL,0),hi=e.a+TOL;
    ctx.fillRect(X(e.s),Y(hi),Math.max(X(e.e)-X(e.s),1),Y(lo)-Y(hi));
  });
  // perfil planejado (tracejado)
  if(MODO!=='carga'){ctx.save();ctx.setLineDash([6*k,4*k]);ctx.strokeStyle=P.dash;ctx.lineWidth=1.5*k;ctx.beginPath();
  g.forEach((e,i)=>{ if(i===0)ctx.moveTo(X(e.s),Y(e.a));else ctx.lineTo(X(e.s),Y(e.a)); ctx.lineTo(X(e.e),Y(e.a)); });
  ctx.stroke();ctx.restore()}
  // carga medida — v1.9.39: o traço NUNCA liga um ponto de uma etapa ao ponto de outra etapa com uma
  // reta (isso é o que criava a "rampa" diagonal entre degraus, mesmo já tendo os pontos de
  // ajuste/estabilização excluídos pelo filtro p.n acima: o canvas ligava o ÚLTIMO ponto válido do
  // degrau anterior ao PRIMEIRO ponto válido do novo degrau com uma linha reta). Cada etapa agora
  // desenha o próprio traço isolado (moveTo na troca de etapa) — nunca pode "parecer" o perfil
  // planejado tracejado, que é só leitura de referência (sem relação com estes pontos medidos).
  if(PTS.length){
    ctx.strokeStyle=P.line;ctx.lineWidth=2*k;ctx.lineJoin='round';ctx.beginPath();
    let prevE=null;
    PTS.forEach(p=>{(p.e===prevE)?ctx.lineTo(X(p.t),Y(p.c)):ctx.moveTo(X(p.t),Y(p.c));prevE=p.e});
    ctx.stroke();
  }
  ctx.strokeStyle=P.frame;ctx.lineWidth=1;ctx.strokeRect(mL,mT,pw,ph);
  // legenda
  ctx.textAlign='left';let lx=mL,ly=H-18*k-(rows-1)*15*k;
  LEG.forEach(([ty,col,tx])=>{
    const w=ctx.measureText(tx).width+34*k;
    if(lx+w>W-mR){lx=mL;ly+=15*k}
    ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=2*k;
    if(ty==='box')ctx.fillRect(lx,ly-5*k,14*k,10*k);
    else{ctx.save();if(ty==='dash')ctx.setLineDash([4*k,3*k]);ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx+14*k,ly);ctx.stroke();ctx.restore()}
    ctx.fillStyle=P.leg;ctx.fillText(tx,lx+19*k,ly);lx+=w+10*k;
  });
}
function drawScreen(){
  const cv=$('chart');if(!cv)return;
  const fit=getComputedStyle(cv).position==='absolute'; // tela larga: o gráfico ocupa o espaço que sobra no card
  const w=cv.clientWidth||600,h=fit?(cv.clientHeight||200):Math.round(w*0.62),dpr=window.devicePixelRatio||1;
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
  cv.style.height=fit?'':h+'px';
  const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
  drawChart(ctx,w,h,null);
  $('chStat').textContent=statsTxt(true);
  if(window.GRAF_PUB)window.GRAF_PUB.tick(); // v1.9.80: publica para a página do gráfico (só se ela estiver ouvindo)
}
function baixa(blob,n){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=n;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
$('bExpGra').onclick=e=>EXPO.menu(e.currentTarget,[   // v1.10.107: relatório PDF + imagem + dados no mesmo menu
  ...(document.documentElement.classList.contains('modo-carga')?[]:[{rot:'Relatório do ensaio (PDF)',dica:'resultado, condições de aprovação e gráfico (A4 paisagem)',fn:()=>$('bPdf').click()},'-']),
  {rot:'Gráfico (.png)',dica:'o gráfico como figura',fn:()=>$('bPng').click()},
  {rot:'Dados (.csv)',dica:'tempo × carga, para planilha',fn:()=>$('bCsv').click()}]);   // v1.10.103
$('bPng').onclick=()=>{
  const cv=document.createElement('canvas');cv.width=1600;cv.height=900;
  drawChart(cv.getContext('2d'),1600,900,'Ensaio do gerador · carga × tempo');
  cv.toBlob(b=>baixa(b,nomeArq('grafico_ensaio','png')),'image/png');
};
$('bCsv').onclick=()=>{
  const est=['contando','estabilizando','pausa'];
  const lin=['tempo_s;carga_pct;estado;etapa'].concat(C.pts.map(p=>[p.t.toFixed(1),p.c.toFixed(2),est[p.s],p.e+1].join(';').replace(/\.(\d)/g,',$1')));
  baixa(new Blob(['\ufeff'+lin.join('\r\n')],{type:'text/csv'}),nomeArq('grafico_ensaio','csv'));
};
