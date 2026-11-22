function hzEtapa(i){ // v1.9.77: frequência (Hz) média da janela final da etapa i, das leituras desta tela (C.pts) — o DB53 não guarda frequência
  const ps=C.pts.filter(p=>p.e===i&&p.m&&p.m.hz!=null&&!isNaN(p.m.hz));if(!ps.length)return null;
  const fim=ps[ps.length-1].t;let sel=ps.filter(p=>p.t>=fim-JANELA_S);if(!sel.length)sel=[ps[ps.length-1]];
  return sel.reduce((a,p)=>a+p.m.hz,0)/sel.length;
}
function avaliaEnsaio(){ // condições de aprovação (usada no PDF e na janela "Resultado do ensaio")
  const rows=ETAPAS.map((e,i)=>SNAP[i]||null);
  const i100=ETAPAS.findIndex(e=>e.alvo===100);
  const t100=i100<0?0:(SNAP[i100]&&SNAP[i100].tempo!=null?SNAP[i100].tempo:(T.et>i100?durS(i100):(T.et===i100?T.el:0))); // tempo real em 100 %
  const vs=[];rows.forEach(r=>{if(r)['va','vb','vc'].forEach(k=>{if(r[k]!=null)vs.push(r[k])})});
  const temTensao=isFinite(DADOS.tensao)&&DADOS.tensao>0; // v1.9.18: "Dados do ensaio" não exige mais tensão preenchida —
  // sem isso, hi/lo ficavam NaN e "vmax>hi"/"vmin<lo" davam sempre false, aprovando (fimTxt) mesmo fora da faixa. Agora marca PENDENTE (não avaliado).
  const hi=temTensao?DADOS.tensao*(1+TENS_TOL/100):null,lo=temTensao?DADOS.tensao*(1-TENS_TOL/100):null;
  const vmax=vs.length?Math.max(...vs):null,vmin=vs.length?Math.min(...vs):null;
  const completo=T.fim&&!T.parcial; // finalizado manualmente antes do fim = incompleto
  const fimTxt=completo?'APROVADO':'PENDENTE';
  const r1=i100<0?'N/A':(t100>=T100_MIN?'APROVADO':(completo?'REPROVADO':'PENDENTE'));
  const r2=(!temTensao||vmax==null)?'PENDENTE':(vmax>hi?'REPROVADO':fimTxt);
  const r3=(!temTensao||vmin==null)?'PENDENTE':(vmin<lo?'REPROVADO':fimTxt);
  // v1.9.77: frequência (acima/abaixo do nominal DADOS.freq, tolerância FREQ_TOL) — só etapas com registro salvo
  const hzs=[];rows.forEach((r,i)=>{if(r){const h=hzEtapa(i);if(h!=null)hzs.push(h)}});
  const temFreq=isFinite(DADOS.freq)&&DADOS.freq>0;
  const hiF=temFreq?DADOS.freq*(1+FREQ_TOL/100):null,loF=temFreq?DADOS.freq*(1-FREQ_TOL/100):null;
  const fmax=hzs.length?Math.max(...hzs):null,fmin=hzs.length?Math.min(...hzs):null;
  const r4=(!temFreq||fmax==null)?'PENDENTE':(fmax>hiF?'REPROVADO':fimTxt);
  const r5=(!temFreq||fmin==null)?'PENDENTE':(fmin<loF?'REPROVADO':fimTxt);
  // v1.9.77: Stand-by = etapa de maior carga alvo acima de 100 %; carga aplicada (cargaReal do registro) >= STBY_MIN
  let iSb=-1;ETAPAS.forEach((e,i)=>{if(e.alvo>100&&(iSb<0||e.alvo>ETAPAS[iSb].alvo))iSb=i});
  const pcSb=iSb<0||!rows[iSb]||rows[iSb].pc==null?null:rows[iSb].pc;
  const r6=iSb<0?'N/A':pcSb==null?(completo?'REPROVADO':'PENDENTE'):(pcSb>=STBY_MIN?'APROVADO':'REPROVADO');
  const alvoSb=iSb<0?null:ETAPAS[iSb].alvo;
  let [R1,R2,R3,R4,R5,R6]=[r1,r2,r3,r4,r5,r6];
  const porDse=!!T.simulado; // v1.10.116: ensaio simulado => veredito vem do DSE simulado (ideal = tudo aprovado)
  if(porDse)[R1,R2,R3,R4,R5,R6]=dseSimAplica([r1,r2,r3,r4,r5,r6]);
  const rs=[R1,R2,R3,R4,R5,R6].filter(r=>r!=='N/A'),final=rs.includes('REPROVADO')?'REPROVADO':rs.every(r=>r==='APROVADO')?'APROVADO':'PENDENTE';
  return {rows,t100,vmax,vmin,hi,lo,r1:R1,r2:R2,r3:R3,fmax,fmin,hiF,loF,r4:R4,r5:R5,pcSb,alvoSb,r6:R6,final,completo,porDse};
}
function gerarPdf(opt){
  const h=new Date(),p2=n=>String(n).padStart(2,'0');
  const hojeStr=`${p2(h.getDate())}.${p2(h.getMonth()+1)}.${h.getFullYear()}`,dataTxt=DADOS.data||hojeStr;
  const {rows,t100,vmax,vmin,hi,lo,r1,r2,r3,fmax,fmin,hiF,loF,r4,r5,pcSb,alvoSb,r6,final}=avaliaEnsaio();
  const pg=new Pg(), X0=36;

  pg.t(X0,34,'RELATÓRIO DE ENSAIO - GRUPO GERADOR DIESEL',15,true);
  pg.t(806,34,T.fim&&!T.parcial?'Ensaio concluído':'Ensaio INCOMPLETO',9,true,'r');
  if(T.simulado)pg.t(806,48,'SIMULAÇÃO (DEMO) - SEM VALOR DE ENSAIO',9,true,'r');
  pg.t(X0,58,'Nº série:',9);pg.t(X0+46,58,DADOS.serie,10,true);
  pg.t(300,58,'Versão do teste:',9);pg.t(374,58,DADOS.versao,10,true);
  pg.t(620,58,'Data:',9);pg.t(646,58,dataTxt,10,true);

  pg.t(X0,84,'DADOS DO EQUIPAMENTO',10,true);
  const cx=[36,146,326,516],cw=[110,180,190,130];
  ['','Fabricante','Modelo','Nº de série'].forEach((t,j)=>pg.cell(cx[j],92,cw[j],13,t,{fill:.88,b:true}));
  DADOS.equip.forEach((r,i)=>r.forEach((v,j)=>pg.cell(cx[j],105+13*i,cw[j],13,v,{al:'l',b:j===0})));
  const nv=v=>isFinite(v)?v:'não informado'; // v1.9.18: "Dados do ensaio" pode ficar sem esses campos — não imprime "NaN" no relatório
  pg.t(X0,200,`Frequência (Hz): ${nv(DADOS.freq)}      Tensão (V): ${nv(DADOS.tensao)}      Temperatura ambiente (°C): ${nv(DADOS.tamb)}      Potência (kW): ${nv(DADOS.pot)}      Sistema: ${DADOS.fase}`,9);

  pg.t(X0,226,'DADOS DE TESTE',10,true);
  const w=[120,60,54,56,56,56,54,54,54,54,64],xs=[];let ax=36;w.forEach(v=>{xs.push(ax);ax+=v});
  const grp=[[0,0,'TEMPO'],[1,1,'POTÊNCIA'],[2,2,'T. MOTOR'],[3,5,'TENSÃO'],[6,8,'CORRENTE'],[9,10,'AUXILIARES']];
  grp.forEach(([a,b,t])=>pg.cell(xs[a],234,xs[b]+w[b]-xs[a],13,t,{fill:.88,b:true}));
  ['Minutos (carga)','KW','°C','Va (V)','Vb (V)','Vc (V)','Ia (A)','Ib (A)','Ic (A)','RPM','Bateria (V)']
    .forEach((t,j)=>pg.cell(xs[j],247,w[j],13,t,{fill:.94}));
  const keys=['kw','tc','va','vb','vc','ia','ib','ic','rpm','bat'],dec=[1,0,1,1,1,0,0,0,0,1];
  let ini=0;
  ETAPAS.forEach((e,i)=>{
    const y=260+14*i,fimMin=ini+e.min;
    pg.cell(xs[0],y,w[0],14,`${ini} - ${fimMin} (${e.alvo}%)`,{al:'l'});ini=fimMin;
    keys.forEach((k,j)=>pg.cell(xs[j+1],y,w[j+1],14,rows[i]?nf(rows[i][k],dec[j]):'-'));
  });
  pg.t(X0,352,`Cada valor = média dos últimos ${JANELA_S} s da etapa. "-" = etapa ainda não concluída.`,7);

  pg.t(X0,380,'CONDIÇÕES DE APROVAÇÃO',10,true);
  pg.t(X0,396,'Valores de Referência - (ISO8528 e ISO3046)',8);
  pg.t(420,396,'Valor obtido',8,true);pg.t(600,396,'RESULTADOS OBTIDOS',8,true);
  const cond=[
    [`Tempo em carga 100% maior ou igual a ${T100_MIN/60} minutos.`,fmt(t100),r1],
    [`Tensão: desvio máximo de ${nf(TENS_TOL)}% acima do valor nominal (limite ${nf(hi)} V).`,vmax==null?'-':nf(vmax)+' V',r2],
    [`Tensão: desvio mínimo de ${nf(TENS_TOL)}% abaixo do valor nominal (limite ${nf(lo)} V).`,vmin==null?'-':nf(vmin)+' V',r3],
    // v1.9.77: frequência e stand-by (print do relatório de 24/10/2026; a 2ª linha de frequência diz "abaixo" — o print repetia "acima")
    [`Frequência: desvio máximo de ${nf(FREQ_TOL)}% acima do valor nominal (limite ${nf(hiF,2)} Hz).`,fmax==null?'-':nf(fmax,2)+' Hz',r4],
    [`Frequência: desvio máximo de ${nf(FREQ_TOL)}% abaixo do valor nominal (limite ${nf(loF,2)} Hz).`,fmin==null?'-':nf(fmin,2)+' Hz',r5]];
  if(alvoSb!=null)cond.push([`Potência em Stand-by (${alvoSb}%): mínimo ${nf(STBY_MIN,0)}% carga aplicada.`,pcSb==null?'-':nf(pcSb)+' %',r6]);
  cond.forEach(([tx,vo,rr],i)=>{
    const y=402+20*i;
    pg.t(X0,y+12,tx,9);pg.t(420,y+12,vo,9);pg.cell(600,y,150,16,rr,{b:true,sz:9,fill:rr==='APROVADO'?.85:rr==='REPROVADO'?.7:1});
  });
  const yFim=402+20*cond.length+22; // v1.9.77: até 6 condições (antes 3, resultado fixo em y=480)
  pg.t(X0,yFim,'RESULTADO FINAL:',11,true);pg.t(150,yFim,final,11,true);
  pg.t(X0,570,`Gerado em ${hojeStr} ${p2(h.getHours())}:${p2(h.getMinutes())} · Medidor do Gerador v${VERSAO}${T.simulado?' · SIMULAÇÃO':''}`,7);

  // página 2: gráfico
  const pg2=new Pg();
  pg2.t(X0,30,'GRÁFICO DO ENSAIO - CARGA × TEMPO',12,true);
  pg2.t(806,30,`Nº série ${DADOS.serie} · Versão ${DADOS.versao} · ${dataTxt}`,8,false,'r');
  const cv=document.createElement('canvas');cv.width=1600;cv.height=900;
  drawChart(cv.getContext('2d'),1600,900,`Ensaio ${DADOS.serie} · carga × tempo`);
  const jpg=Uint8Array.from(atob(cv.toDataURL('image/jpeg',0.92).split(',')[1]),c=>c.charCodeAt(0));
  pg2.im(31,40,780,438.75);
  pg2.t(X0,496,statsTxt(),9);
  pg2.t(X0,510,`Faixas cinza: tolerância de ±${TOL}% em cada etapa. Faixas amarelas: ajuste e estabilização da carga (cronômetro sem contar). Tracejado: perfil planejado.`,8);

  const blob=pdfBlob([pg,pg2],jpg,1600,900),nome=nomeArq('relatorio_'+(DADOS.serie||'sem_serie'));
  if(!(opt&&opt.semSalvar))rgSalvaArq(blob,nome);   // v1.10.107: a impressão automática pede só o arquivo e decide sozinha onde salvar
  return{blob,nome};
}
$('bPdf').onclick=gerarPdf;
