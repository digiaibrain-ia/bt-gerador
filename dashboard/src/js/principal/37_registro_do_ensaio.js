
/* ===== REGISTRO DE APRENDIZADO =====
   Grava 1 amostra por segundo (leituras + estado do ensaio) e os eventos do operador, organizados
   por modelo de DSE e de gerador. Serve para comparar com o ensaio manual e, depois, montar o
   ensaio automático no PLC. Arquivos: resumo (TXT, fácil de colar na conversa) e amostras (CSV). */
const RG_MIN=60; // amostras mínimas para a sessão contar como "ensaio" no acervo
const RG={ativo:false,atual:null,sujo:false,bkErro:false,tabT:0,linhas:[]};
let RG_SES=[],RG_AMO=[],RG_EV=[],RG_IDX={};
const RG_COLS=[['sessao'],['hora'],['t_s',1],['relogio_s',1],['tipo_ensaio'],['etapa',0],['alvo_pct',0],['cron_s',0],['estado_cron'],['gerador'],
  ['carga_pct',2],['kw',1],['va',1],['vb',1],['vc',1],['ia',0],['ib',0],['ic',0],['agua_c',1],['rpm',0],['bat_v',2],
  ['freq_hz',2],['kva',1],['kvar',1],['fp',2],['consumo_lh',2],['nivel_agua',0],['simulado',0]];
const rgP2=n=>String(n).padStart(2,'0');
const rgHora=ms=>{const d=new Date(ms);return rgP2(d.getHours())+':'+rgP2(d.getMinutes())+':'+rgP2(d.getSeconds())};
const rgData=ms=>{const d=new Date(ms);return rgP2(d.getDate())+'/'+rgP2(d.getMonth()+1)+'/'+d.getFullYear()+' '+rgHora(ms)};
const rgChave=(dse,ger)=>dse+' | '+ger;
(function(){
  try{RG_IDX=JSON.parse(localStorage.getItem('medidor.aprend.indice')||'{}')||{}}catch(e){RG_IDX={}}
  try{const b=JSON.parse(localStorage.getItem('medidor.aprend.buf')||'null');
    if(b&&Array.isArray(b.ses)){RG_SES=b.ses;RG_AMO=b.amo||[];RG_EV=b.ev||[];RG_SES.forEach(s=>{if(s.fim==null)s.fim=s.ult||s.ini})}}catch(e){}
})();
const rgSalvaIdx=()=>{try{localStorage.setItem('medidor.aprend.indice',JSON.stringify(RG_IDX))}catch(e){}};
function rgBackup(){
  if(!RG.sujo)return;
  try{localStorage.setItem('medidor.aprend.buf',JSON.stringify({ses:RG_SES,amo:RG_AMO,ev:RG_EV}));RG.bkErro=false;RG.sujo=false}
  catch(e){RG.bkErro=true}
}
setInterval(rgBackup,15000);
addEventListener('beforeunload',e=>{rgBackup();if(RG.bkErro&&RG_AMO.length){e.preventDefault();e.returnValue=''}});

/* identificação: automática (API + janela Dados) ou digitada */
function rgAuto(){
  const dem=$('demo').checked,pre=dem?'[DEMO] ':'';
  const eq=n=>DADOS.equip.find(r=>new RegExp(n,'i').test(r[0]));
  let dse=($('pModelo').textContent||'').trim();
  if(!dse||dse==='—'){const c=eq('controlador');dse=c&&c[2]&&c[2]!=='-'?c[2]:''}
  const ok=v=>v&&v!=='-',m=eq('motor'),a=eq('alternador');
  const ger=[m&&ok(m[2])?m[2]:'',a&&ok(a[2])?a[2]:''].filter(Boolean).join(' + ');
  return{dse:dse?pre+dse:'',ger:ger?pre+ger:''};
}
function rgOver(){try{return JSON.parse(localStorage.getItem('medidor.aprend.ids')||'{}')||{}}catch(e){return{}}}
function rgIds(){
  const au=rgAuto(),ov=rgOver(),pre=$('demo').checked?'[DEMO] ':'';
  const f=(o,a)=>o&&o.trim()?(pre&&!o.startsWith(pre)?pre:'')+o.trim():a;
  return{dse:f(ov.dse,au.dse),ger:f(ov.ger,au.ger)};
}
const rgMeta=()=>{const n=parseInt(localStorage.getItem('medidor.aprend.meta')||'100',10);return n>0?n:100};

/* sessão */
function rgIniciar(){
  if(rgBloqDemo()){abreReg('Registro bloqueado: "demo" está marcado e a trava "Não gravar amostras no demo" está ligada. Desmarque a trava (em Comportamento) se quiser gravar mesmo assim.');return}
  const id=rgIds(),semId=!id.dse||!id.ger; // v1.9.17: a pedido do operador, não é mais função do HTML travar o Registro
  // por falta de modelo do DSE/gerador digitado — isso é só identificação do arquivo, não condição pra gravar.
  // Sem modelo informado, grava mesmo assim em "não identificado"; dá pra corrigir depois em rgDse/rgGer.
  const dse=id.dse||'não identificado',ger=id.ger||'não identificado';
  const now=Date.now(),d=new Date(now);
  const ses={id:'S'+d.getFullYear()+rgP2(d.getMonth()+1)+rgP2(d.getDate())+'_'+rgP2(d.getHours())+rgP2(d.getMinutes())+rgP2(d.getSeconds()),
    dse,ger,serie:DADOS.serie,versao:DADOS.versao,ini:now,fim:null,ult:now,n:0,semDado:0,demo:$('demo').checked,modo:MODO,
    par:{tol:TOL,estMin:ESTAB_MIN,estMax:ESTAB_MAX,janela:JANELA_S,lib:LIB,t100:T100_MIN,tens:TENS_TOL,etapas:ETAPAS.map(e=>[e.alvo,e.min])},baixada:false,contada:false,prev:null};
  RG_SES.push(ses);RG.atual=ses;RG.ativo=true;
  RG_EV.push([ses.id,now,'Registro iniciado'+(semId?' (sem modelo informado)':'')]);RG.sujo=true;rgBotao();
}
function rgParar(motivo,semEnsaio){
  if(!RG.ativo)return;
  const s=RG.atual,now=Date.now();
  s.fim=now;s.prev=null;
  if(s.n===0){RG_SES=RG_SES.filter(x=>x!==s);RG_EV=RG_EV.filter(e=>e[0]!==s.id)}
  else{RG_EV.push([s.id,now,'Registro encerrado'+(motivo?' ('+motivo+')':'')]);rgContaEnsaio(s,semEnsaio)}
  RG.ativo=false;RG.atual=null;RG.sujo=true;rgBotao();rgBackup();
}
function rgContaEnsaio(s,semEnsaio){ // conta a sessão no acervo (ensaios/amostras) assim que ela termina, sem esperar o download
  if(s.contada)return;
  const k=rgChave(s.dse,s.ger),e=RG_IDX[k]||(RG_IDX[k]={dse:s.dse,ger:s.ger,ensaios:0,amostras:0,ultima:0});
  e.amostras+=s.n;if(!semEnsaio&&s.n>=RG_MIN)e.ensaios++; // ensaio descartado: as amostras contam, mas ele não conta como ensaio feito
 e.ultima=Math.max(e.ultima,s.ini);
  s.contada=true;rgSalvaIdx();
}
function rgBotao(){
  const b=$('bReg'),n=RG.atual?RG.atual.n:0,bloq=!RG.ativo&&rgBloqDemo();
  b.classList.toggle('on',RG.ativo);
  b.classList.toggle('bloq',bloq); // v1.9.16: NÃO desabilita mais o botão — um botão disabled não dispara onclick,
  // então clicar nele enquanto bloqueado não fazia nada e não mostrava nenhum aviso (parecia "não funcionar").
  // Agora o clique sempre chama rgIniciar(), que abre o painel Amostras com a explicação do bloqueio.
  // v1.9.17: removido o "bloq" por falta de modelo do DSE/gerador — rgIniciar() não trava mais por isso (ver histórico).
  b.innerHTML='<span class="dot"></span>Registro'+(RG.ativo?' · '+n:'');
  b.title=RG.ativo?'Gravando amostras ('+n+'). Clique para parar o registro.':bloq?'Bloqueado: "demo" ligado + trava "Não gravar amostras no demo" ativa (em Comportamento). Clique para ver/mudar.':'Registro desligado. Clique para começar a gravar amostras do ensaio.';
  $('pReg').style.display=RG.ativo?'inline-block':'none';
}
const rgNum=k=>{const v=Number(find(window.__ultimoDado||{},k));return window.__ultimoDado&&find(window.__ultimoDado,k)!=null&&!isNaN(v)?v:null};
function rgEstadoCron(){
  if(MODO==='carga')return T.run?'livre':'parado';
  if(!T.started)return 'parado';
  if(T.fim)return 'fim';
  if(!T.run)return 'pausa';
  if(T.aguardaFim)return 'aguardando_finalizar';
  if(T.aguarda&&!SNAP[T.et])return 'aguardando_salvar';
  if(!genRun())return 'aguardando_gerador';
  return T.estavel>=ESTAB[T.et]?'contando':'estabilizando';
}
function rgEventos(s){
  const ev=tx=>{RG_EV.push([s.id,Date.now(),tx]);RG.sujo=true};
  const P=s.prev,nS=SNAP.filter(Boolean).length,na=nivelAgua(MED.tc);
  const agora={started:T.started,run:T.run,et:T.et,aguarda:!!T.aguarda,aguardaFim:!!T.aguardaFim,fim:!!T.fim,gravado:!!T.gravado,gen:GEN.estado,na,dadoOk,nS,modo:MODO};
  if(P){
    if(agora.modo!==P.modo)ev('Tipo de ensaio alterado para '+TIPOS[agora.modo]);
    if(agora.started&&!P.started)ev('Ensaio iniciado (cronômetro)');
    if(!agora.started&&P.started)ev('Ensaio zerado');
    if(agora.started&&P.started){
      if(agora.run&&!P.run)ev('Cronômetro retomado');
      if(!agora.run&&P.run)ev('Cronômetro pausado');
    }
    if(MODO!=='carga'&&agora.started){
      if(agora.et!==P.et&&ETAPAS[agora.et])ev('Etapa '+(agora.et+1)+' iniciada (alvo '+ETAPAS[agora.et].alvo+'%)');
      if(agora.aguarda&&!P.aguarda)ev('Tempo da etapa '+(agora.et+1)+' cumprido (aguardando SALVAR)');
      if(nS>P.nS)ev('Etapa salva ('+nS+' de '+ETAPAS.length+')');
      if(agora.aguardaFim&&!P.aguardaFim)ev('Todas as etapas salvas (aguardando FINALIZAR)');
      if(agora.fim&&!P.fim)ev('Ensaio finalizado'+(T.parcial?' (incompleto)':''));
    }
    if(agora.gravado&&!P.gravado)ev('Ensaio gravado'+(gravadoComPdf?' (relatório)':' (sem relatório)'));
    if(agora.gen!==P.gen)ev('Gerador: '+agora.gen);
    if(na!==P.na)ev('Água: '+['normal','atenção','crítico'][na]+(MED.tc!=null?' ('+MED.tc+' °C)':''));
    if(agora.dadoOk!==P.dadoOk)ev(agora.dadoOk?'Leitura voltou':'Leitura sem dado ou antiga');
  }
  s.prev=agora;
  return agora;
}
function rgAmostra(){
  if(!RG.ativo||!RG.atual)return;
  const s=RG.atual,now=Date.now();
  if($('demo').checked!==s.demo){rgParar('trocou entre demo e real');abreReg('Registro encerrado: o modo demo/real mudou. Ative de novo para começar outra sessão.');return}
  const ag=rgEventos(s);
  if(ag.gravado&&!s.gravadoVisto){ // ensaio gravado: encerra a sessão
    s.gravadoVisto=true;rgParar('ensaio gravado');return;
  }
  if(!dadoOk||carga==null){s.semDado++;rgBotao();return}
  const iso=MODO!=='carga'&&T.started&&ETAPAS[T.et];
  const row=[s.id,rgHora(now),+((now-s.ini)/1000).toFixed(1),+C.t.toFixed(1),MODO,iso?T.et+1:null,iso?ETAPAS[T.et].alvo:null,T.started?Math.round(cronAtual()):null,rgEstadoCron(),GEN.estado,
    carga,MED.kw,MED.va,MED.vb,MED.vc,MED.ia,MED.ib,MED.ic,MED.tc,MED.rpm,MED.bat,
    rgNum('frequencia'),rgNum('kva'),rgNum('kvar'),rgNum('fp'),rgNum('consumoLh'),nivelAgua(MED.tc),s.demo?1:0];
  RG_AMO.push(row);s.n++;s.ult=now;RG.sujo=true;rgBotao();
}
setInterval(rgAmostra,1000);
$('bReg').onclick=()=>{RG.ativo?rgParar():rgIniciar()};
$('bAmo').onclick=()=>abreReg();

/* arquivos */
const rgSlug=t=>String(t).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Za-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,40)||'x';
function rgNomeBase(ses){
  const ks=[...new Set(ses.map(s=>s.dse+'|'+s.ger))],d=new Date();
  const m=ks.length===1?rgSlug(ses[0].dse)+'_'+rgSlug(ses[0].ger):'varios_modelos';
  return 'aprendizado_'+m+'_'+d.getFullYear()+rgP2(d.getMonth()+1)+rgP2(d.getDate())+'_'+rgP2(d.getHours())+rgP2(d.getMinutes());
}
const rgSessoes=()=>RG_SES.filter(s=>!s.baixada);
const rgFmtNum=(v,d)=>v==null||v===''||(typeof v==='number'&&isNaN(v))?'':typeof v==='number'?v.toFixed(d==null?1:d).replace('.',','):String(v);
function rgCsvTxt(ses){
  const ids=new Set(ses.map(s=>s.id));
  const lin=[RG_COLS.map(c=>c[0]).join(';')];
  RG_AMO.filter(a=>ids.has(a[0])).forEach(a=>lin.push(a.map((v,i)=>rgFmtNum(v,RG_COLS[i][1])).join(';')));
  return '﻿'+lin.join('\r\n');
}
const rgMedia=a=>{a=a.filter(v=>v!=null&&!isNaN(v));return a.length?a.reduce((x,y)=>x+y,0)/a.length:null};
const rgDesvio=a=>{a=a.filter(v=>v!=null&&!isNaN(v));if(a.length<2)return null;const m=rgMedia(a);return Math.sqrt(a.reduce((x,y)=>x+(y-m)*(y-m),0)/(a.length-1))};
const rgF=(v,d=1,u='')=>v==null||isNaN(v)?'-':v.toFixed(d).replace('.',',')+u;
const rgMS=s=>s==null||isNaN(s)?'-':fmt(Math.max(0,Math.round(s)));
function rgPatamares(rows){ // trechos em que a carga ficou parada (±2,5 pontos) por pelo menos 8 s
  const seg=[];let cur=null;
  rows.forEach(a=>{
    const c=a[10],t=a[2];if(c==null)return;
    if(cur&&Math.abs(c-cur.soma/cur.n)<=2.5){cur.soma+=c;cur.n++;cur.fim=t;cur.kw+=(a[11]||0);cur.min=Math.min(cur.min,c);cur.max=Math.max(cur.max,c)}
    else{if(cur)seg.push(cur);cur={ini:t,fim:t,soma:c,n:1,kw:a[11]||0,min:c,max:c}}
  });
  if(cur)seg.push(cur);
  return seg.filter(s=>s.fim-s.ini>=8);
}
function rgResumoSessao(s){
  const rows=RG_AMO.filter(a=>a[0]===s.id),L=[];
  const evs=RG_EV.filter(e=>e[0]===s.id);
  L.push('SESSÃO '+s.id+(s.demo?'  (SIMULAÇÃO - DEMO)':''));
  L.push('  DSE: '+s.dse+'   Gerador: '+s.ger+'   Série: '+s.serie+'   Versão: '+s.versao);
  L.push('  Início: '+rgData(s.ini)+'   Fim: '+(s.fim?rgData(s.fim):'em andamento')+'   Duração: '+rgMS(((s.fim||s.ult)-s.ini)/1000));
  L.push('  (Os tempos deste resumo são em segundos de registro: 1 amostra por segundo.)');
  L.push('  Amostras: '+rows.length+'   Sem dado: '+s.semDado+'   Tipo de ensaio no início: '+TIPOS[s.modo]);
  const p=s.par;
  L.push('  Parâmetros no início: tolerância ±'+rgF(p.tol,1)+'%, estabilidade '+rgF(p.estMin,1)+' a '+rgF(p.estMax,1)+' s, média '+rgF(p.janela,1)+' s, liberar SALVAR '+p.lib+'%, mín. em 100%: '+rgF(p.t100/60,1)+' min, desvio tensão ±'+rgF(p.tens,1)+'%');
  if(s.modo!=='carga')L.push('  Etapas planejadas (alvo%/min): '+p.etapas.map(e=>e[0]+'/'+e[1]).join('  '));
  if(!rows.length){L.push('  (sem amostras)');return L}
  const agua=rows.map(a=>a[18]);
  L.push('  Água: início '+rgF(agua.find(v=>v!=null),1,' °C')+', máxima '+rgF(agua.filter(v=>v!=null).reduce((x,y)=>Math.max(x,y),-Infinity),1,' °C')+', fim '+rgF([...agua].reverse().find(v=>v!=null),1,' °C')+
    '; tempo em atenção '+rgMS(rows.filter(a=>a[26]===1).length)+', crítico '+rgMS(rows.filter(a=>a[26]===2).length));
  // por etapa
  const et=[...new Set(rows.map(a=>a[5]).filter(v=>v!=null))].sort((a,b)=>a-b);
  if(et.length){
    L.push('');L.push('  POR ETAPA (valores na ordem da tela; tempos em mm:ss)');
    et.forEach(n=>{
      const r=rows.filter(a=>a[5]===n),alvo=r[0][6],t0=r[0][2],tf=r[r.length-1][2];
      const na=r.find(a=>a[10]!=null&&Math.abs(a[10]-alvo)<=p.tol);
      const ct=r.filter(a=>a[8]==='contando'),es=r.filter(a=>a[8]==='estabilizando');
      const base=ct.length?ct:r,cs=base.map(a=>a[10]);
      const fin=r.slice(-10);
      // v1.10.162: "maior excesso sobre o alvo". Etapa que SOBE: vale tudo (ultrapassar o alvo durante a subida é overshoot de verdade). Etapa que DESCE
      // (ex.: 107 % -> 0 %): as amostras de "estabilizando" ainda trazem a carga da etapa anterior e não são excesso — antes davam 106 pt em etapa de 0 %.
      const rAnt=rows.find(a=>a[5]===n-1),desce=!!rAnt&&rAnt[6]>alvo,baseEx=(desce&&ct.length)?ct:r;
      L.push('   Etapa '+n+' (alvo '+alvo+'%): relógio '+rgMS(t0)+' a '+rgMS(tf)+', entrou na faixa após '+(na?rgMS(na[2]-t0):'nunca')+
        ', contando '+rgMS(ct.length)+', estabilizando '+rgMS(es.length));
      L.push('     carga média '+rgF(rgMedia(cs),2,'%')+' (mín '+rgF(Math.min(...cs),2)+', máx '+rgF(Math.max(...cs),2)+', desvio '+rgF(rgDesvio(cs),2)+'), maior excesso sobre o alvo '+rgF(Math.max(...baseEx.map(a=>a[10]))-alvo,2,' pt'));
      L.push('     fim da etapa: '+rgF(rgMedia(fin.map(a=>a[11])),1,' kW')+', tensão média '+rgF(rgMedia(fin.flatMap(a=>[a[12],a[13],a[14]])),1,' V')+', corrente média '+rgF(rgMedia(fin.flatMap(a=>[a[15],a[16],a[17]])),0,' A')+
        ', água '+rgF(rgMedia(fin.map(a=>a[18])),1,' °C')+', rpm '+rgF(rgMedia(fin.map(a=>a[19])),0)+', freq '+rgF(rgMedia(fin.map(a=>a[21])),2,' Hz')+', fp '+rgF(rgMedia(fin.map(a=>a[24])),2));
    });
  }
  // patamares de carga (mostra como o operador sobe e mantém a carga)
  const pat=rgPatamares(rows);
  L.push('');L.push('  PATAMARES DE CARGA (carga parada por 8 s ou mais) e TRANSIÇÕES');
  if(!pat.length)L.push('   nenhum patamar identificado');
  pat.forEach((x,i)=>{
    L.push('   '+(i+1)+') início '+rgMS(x.ini)+', duração '+rgMS(x.fim-x.ini)+', carga '+rgF(x.soma/x.n,1,'%')+' (mín '+rgF(x.min,1)+', máx '+rgF(x.max,1)+'), '+rgF(x.kw/x.n,1,' kW'));
    if(pat[i+1])L.push('      transição para '+rgF(pat[i+1].soma/pat[i+1].n,1,'%')+' em '+rgF(pat[i+1].ini-x.fim,0,' s'));
  });
  L.push('');L.push('  EVENTOS (tempo desde o início da sessão)');
  evs.forEach(e=>L.push('   '+rgMS((e[1]-s.ini)/1000)+'  '+e[2]));
  return L;
}
function rgResumoTxt(ses){
  const L=['REGISTRO DE APRENDIZADO - Medidor do Gerador v'+VERSAO,'Gerado em '+rgData(Date.now()),'Sessões: '+ses.length,'======================================================================'];
  ses.forEach(s=>{L.push('');rgResumoSessao(s).forEach(x=>L.push(x));L.push('----------------------------------------------------------------------')});
  L.push('');L.push('Colunas do CSV: '+RG_COLS.map(c=>c[0]).join(', '));
  return L.join('\r\n');
}
/* pasta de salvamento automático (opcional, só em Chrome/Edge no PC — File System Access API) */
let RG_DIR=null;
async function rgSalvaArq(blob,nome){ // salva na pasta escolhida (se houver) além do download normal
  baixa(blob,nome);
  if(!RG_DIR)return;
  try{
    const fh=await RG_DIR.getFileHandle(nome,{create:true}),w=await fh.createWritable();
    await w.write(blob);await w.close();
  }catch(e){rgErro('Não consegui salvar na pasta escolhida: '+(e.message||e)+'. O download normal funcionou.')}
}
if('showDirectoryPicker' in window){
  $('rgPastaBox').style.display='flex';
  $('rgPasta').onclick=async()=>{
    try{
      RG_DIR=await window.showDirectoryPicker({mode:'readwrite'});
      $('rgPastaNome').textContent='Salvando também em: '+RG_DIR.name;if(window.__aimpPasta)window.__aimpPasta(true);
    }catch(e){/* cancelado pelo usuário */}
  };
}
function rgBaixa(tipo){
  const ses=rgSessoes();
  if(!ses.length){rgErro('Não há amostras para baixar.');return}
  const base=rgNomeBase(ses);
  if(tipo==='txt'||tipo==='tudo')rgSalvaArq(new Blob([rgResumoTxt(ses)],{type:'text/plain;charset=utf-8'}),base+'_resumo.txt');
  if(tipo==='csv'||tipo==='tudo'){
    const csv=rgCsvTxt(ses);
    setTimeout(()=>{rgSalvaArq(new Blob([csv],{type:'text/csv'}),base+'_amostras.csv');rgCommit()},tipo==='tudo'?400:0);
  }
  rgErro('');
}
function rgCommit(){ // depois do download: sessões encerradas saem da fila de pendentes (o acervo já foi contado ao finalizar)
  RG_SES.filter(s=>!s.baixada&&s.fim!=null&&s!==RG.atual).forEach(s=>{rgContaEnsaio(s);s.baixada=true}); // rgContaEnsaio() não duplica se já contada
  const feitas=new Set(RG_SES.filter(s=>s.baixada).map(s=>s.id));
  RG_AMO=RG_AMO.filter(a=>!feitas.has(a[0]));RG_EV=RG_EV.filter(e=>!feitas.has(e[0]));RG_SES=RG_SES.filter(s=>!s.baixada);
  rgSalvaIdx();RG.sujo=true;rgBackup();RG.tabT=0;
}

/* popup */
const rgErro=t=>{$('rgErr').textContent=t||''};
function rgPendentes(){return RG_SES.filter(s=>!s.baixada).reduce((a,s)=>a+s.n,0)}
function atualizaReg(forca){
  const s=RG.atual,id=rgIds(),now=Date.now();
  $('rgTag').textContent=RG.ativo?'GRAVANDO':'DESLIGADO';
  $('rgDse').disabled=$('rgGer').disabled=RG.ativo;
  const au=rgAuto();$('rgDse').placeholder=au.dse||'(sem modelo automático)';$('rgGer').placeholder=au.ger||'(preencha a janela Dados)';
  $('rgNota').textContent=RG.ativo?'Gravando como: DSE '+s.dse+' · Gerador '+s.ger+(s.demo?' (simulação)':''):'Será gravado como: DSE '+(id.dse||'?')+' · Gerador '+(id.ger||'?');
  const ev=s?RG_EV.filter(e=>e[0]===s.id).length:0;
  const card=(v,t)=>'<div><b>'+v+'</b><span>'+t+'</span></div>';
  $('rgCards').innerHTML=card(s?s.n:'—','Amostras da sessão')+card(s?rgMS((now-s.ini)/1000):'—','Duração')+card(s?ev:'—','Eventos')+
    card(s?s.semDado:'—','Sem dado')+card(rgPendentes(),'Pendentes de download')+card(s&&s.n?rgHora(s.ult):'—','Última amostra');
  if(!forca&&now-RG.tabT<2000)return;
  RG.tabT=now;
  const m=new Map();
  Object.entries(RG_IDX).forEach(([k,e])=>m.set(k,{dse:e.dse,ger:e.ger,ens:e.ensaios,amo:e.amostras,pen:0,ult:e.ultima}));
  RG_SES.filter(x=>!x.baixada).forEach(x=>{const k=rgChave(x.dse,x.ger),e=m.get(k)||{dse:x.dse,ger:x.ger,ens:0,amo:0,pen:0,ult:0};e.pen+=x.n;e.ult=Math.max(e.ult,x.ini);m.set(k,e)});
  const meta=rgMeta();
  RG.linhas=[...m.entries()].sort((a,b)=>b[1].ult-a[1].ult);
  $('rgTab').innerHTML='<thead><tr><th>DSE</th><th>Gerador</th><th>Ensaios (meta '+meta+')</th><th>Amostras</th><th>Arquivo pendente</th><th>Último</th><th></th></tr></thead><tbody>'+
    (RG.linhas.length?RG.linhas.map(([k,e],i)=>'<tr'+(id.dse&&k===rgChave(id.dse,id.ger)?' class="atual"':'')+'><td>'+rgEsc(e.dse)+'</td><td>'+rgEsc(e.ger)+'</td><td>'+e.ens+' / '+meta+
      '<span class="rgbar"><i style="width:'+Math.min(100,e.ens/meta*100)+'%"></i></span></td><td>'+e.amo+'</td><td>'+e.pen+'</td><td>'+(e.ult?rgData(e.ult).slice(0,10):'-')+
      '</td><td>'+(RG_IDX[k]?'<button type="button" class="bt s" data-z="'+i+'" title="Zerar a contagem baixada deste modelo">Zerar</button>':'')+'</td></tr>').join(''):
      '<tr><td colspan="7" style="text-align:center;color:#6b7a8c">Nenhuma amostra ainda. Ative o registro e rode um ensaio.</td></tr>')+'</tbody>';
}
const rgEsc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function abreReg(msg){
  const ov=rgOver();
  $('rgDse').value=ov.dse||'';$('rgGer').value=ov.ger||'';$('rgMeta').value=rgMeta();
  rgErro(msg||'');atualizaReg(true);
  if(!$('dlgReg').open)$('dlgReg').showModal();
}
['rgDse','rgGer'].forEach(i=>$(i).addEventListener('input',()=>{
  try{localStorage.setItem('medidor.aprend.ids',JSON.stringify({dse:$('rgDse').value,ger:$('rgGer').value}))}catch(e){}
  rgErro('');atualizaReg(true);
}));
$('rgMeta').addEventListener('input',()=>{const n=parseInt($('rgMeta').value,10);if(n>0){try{localStorage.setItem('medidor.aprend.meta',String(n))}catch(e){}atualizaReg(true)}});
$('rgAuto').onchange=()=>{try{localStorage.setItem('medidor.aprend.auto',$('rgAuto').checked?'1':'0')}catch(e){}};
try{$('rgAuto').checked=(localStorage.getItem('medidor.aprend.auto')||'1')==='1'}catch(e){}
$('rgSemDemo').onchange=()=>{try{localStorage.setItem('medidor.aprend.semDemo',$('rgSemDemo').checked?'1':'0')}catch(e){}rgBotao()};
try{$('rgSemDemo').checked=(localStorage.getItem('medidor.aprend.semDemo')||'1')==='1'}catch(e){}
const rgBloqDemo=()=>$('rgSemDemo').checked&&$('demo').checked; // true = REC não pode ligar agora (demo + trava ativada)
$('rgFecha').onclick=()=>$('dlgReg').close();
$('rgBaixaTudo').onclick=()=>rgBaixa('tudo');$('rgBaixaTxt').onclick=()=>rgBaixa('txt');$('rgBaixaCsv').onclick=()=>rgBaixa('csv');
/* ===== v1.10.107: IMPRESSÃO AUTOMÁTICA ao fim do ensaio =====
   Leigo: marcando a caixa, quando o ensaio termina o relatório PDF sai sozinho (salvo na pasta escolhida; se não houver pasta, vai para Downloads) e, se quiser, a impressão do navegador abre junto.
   Técnico: chamada por finalizaManual() -> window.__autoImprime(). Usa gerarPdf({semSalvar:true}); grava com File System Access (RG_DIR, a MESMA pasta do Registro).
   O navegador NÃO deixa uma página gravar em caminho digitado/colado: o campo é referência (mensagem + Log). T.autoImp evita gerar 2× o mesmo ensaio.
   O handle da pasta é guardado no IndexedDB deste navegador; depois de reabrir pode ser preciso "Autorizar pasta" (exige um clique). */
(function(){
  const LS='medidor.autoImp',CFG={on:false,prt:false,cam:''};
  try{Object.assign(CFG,JSON.parse(localStorage.getItem(LS)||'{}'))}catch(e){}
  const salva=()=>{try{localStorage.setItem(LS,JSON.stringify(CFG))}catch(e){}};
  const idb=(op,v)=>new Promise(ok=>{try{const r=indexedDB.open('medidor-auto',1);r.onupgradeneeded=()=>r.result.createObjectStore('k');
    r.onsuccess=()=>{const t=r.result.transaction('k',op==='get'?'readonly':'readwrite'),st=t.objectStore('k'),q=op==='get'?st.get('pasta'):st.put(v,'pasta');q.onsuccess=()=>ok(q.result);q.onerror=()=>ok(null)};r.onerror=()=>ok(null)}catch(e){ok(null)}});
  const sup='showDirectoryPicker' in window;
  let perm='prompt';
  async function consulta(){perm='prompt';if(RG_DIR){try{perm=await RG_DIR.queryPermission({mode:'readwrite'})}catch(e){perm='prompt'}}}
  async function atualiza(){
    await consulta();
    $('aimpOn').checked=!!CFG.on;$('aimpPrt').checked=!!CFG.prt;$('aimpCam').value=CFG.cam||'';
    $('aimpPasta').hidden=!sup;$('aimpAut').hidden=!(sup&&RG_DIR&&perm!=='granted');
    $('aimpPastaNome').textContent=!sup?'este navegador não escolhe pasta':RG_DIR?RG_DIR.name+(perm==='granted'?'':' (precisa autorizar)'):'nenhuma pasta escolhida';
    $('aimpNota').textContent=(!sup?'Este navegador não permite escolher pasta: o PDF vai para Downloads. ':RG_DIR&&perm==='granted'?'O PDF é salvo direto na pasta escolhida. ':RG_DIR?'Clique em "Autorizar pasta" para salvar direto; sem isso o PDF vai para Downloads. ':'Sem pasta escolhida, o PDF vai para Downloads. ')+
      'O campo de caminho é só referência (o navegador não grava em caminho digitado): aparece na mensagem final e no Log. A pasta é a mesma do Registro de aprendizado.';
    const rp=$('rgPastaNome');if(rp&&RG_DIR&&!rp.textContent)rp.textContent='Salvando também em: '+RG_DIR.name;
  }
  window.__aimpPasta=async()=>{if(RG_DIR)await idb('put',RG_DIR);atualiza()};
  $('aimpOn').onchange=e=>{CFG.on=e.target.checked;salva()};
  $('aimpPrt').onchange=e=>{CFG.prt=e.target.checked;salva()};
  $('aimpCam').oninput=e=>{CFG.cam=e.target.value.trim();salva()};
  $('aimpCopia').onclick=async()=>{try{await navigator.clipboard.writeText(CFG.cam||'');msgGer('Caminho copiado.',3000)}catch(e){$('aimpCam').select()}};
  $('aimpPasta').onclick=()=>$('rgPasta').click();   // mesma pasta e mesma lógica do Registro
  $('aimpAut').onclick=async()=>{try{perm=await RG_DIR.requestPermission({mode:'readwrite'})}catch(e){}atualiza()};
  document.getElementById('bModo').addEventListener('click',()=>setTimeout(atualiza,0));
  if(sup)idb('get').then(h=>{if(h&&!RG_DIR){RG_DIR=h;atualiza()}});
  const log=(r,t,d)=>{try{window.devObs&&window.devObs.log('ens','sistema',t,r,d)}catch(e){}};
  window.__autoImprime=async function(){
    if(!CFG.on||T.autoImp)return;
    await consulta();
    let r;try{r=gerarPdf({semSalvar:true})}catch(e){msgGer('Impressão automática: não consegui gerar o relatório ('+(e&&e.message||e)+').',12000);log('falha','impressão automática: falhou ao gerar o PDF',{erro:String(e&&e.message||e)});return}
    T.autoImp=true;
    let onde='Downloads';
    if(RG_DIR&&perm==='granted'){
      try{const fh=await RG_DIR.getFileHandle(r.nome,{create:true}),w=await fh.createWritable();await w.write(r.blob);await w.close();onde='pasta "'+RG_DIR.name+'"'}
      catch(e){baixa(r.blob,r.nome);onde='Downloads (a pasta falhou: '+(e&&e.message||e)+')'}
    }else baixa(r.blob,r.nome);
    if(CFG.prt){
      try{const u=URL.createObjectURL(r.blob),f=document.createElement('iframe');f.style.cssText='position:fixed;width:0;height:0;border:0;visibility:hidden';f.src=u;
        f.onload=()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){window.open(u)}};document.body.appendChild(f);setTimeout(()=>{f.remove();URL.revokeObjectURL(u)},120000)}catch(e){}
    }
    msgGer('Relatório gerado automaticamente: '+r.nome+' → '+onde+(CFG.cam?'. Destino de referência: '+CFG.cam:'')+(CFG.prt?'. Impressão aberta.':'.'),15000);
    log('ok','impressão automática: '+r.nome+' → '+onde,{pasta:RG_DIR?RG_DIR.name:null,permissao:perm,referencia:CFG.cam||null,imprimir:!!CFG.prt});
  };
  atualiza();
})();
$('rgExp').onclick=e=>EXPO.menu(e.currentTarget,[   // v1.10.107: 3 botões -> 1 menu
  {rot:'Tudo (TXT + CSV)',dica:'resumo e amostras',fn:()=>rgBaixa('tudo')},
  {rot:'Só resumo (.txt)',dica:'uma página por sessão',fn:()=>rgBaixa('txt')},
  {rot:'Só amostras (.csv)',dica:'todas as amostras, para planilha',fn:()=>rgBaixa('csv')}]);
$('rgTab').addEventListener('click',e=>{
  const b=e.target.closest('button[data-z]');if(!b)return;
  const l=RG.linhas[+b.dataset.z];if(!l)return;
  if(!confirm('Zerar a contagem baixada de "'+l[1].dse+' | '+l[1].ger+'"? As amostras pendentes não são afetadas.'))return;
  delete RG_IDX[l[0]];rgSalvaIdx();atualizaReg(true);
});
setInterval(()=>{if($('dlgReg').open)atualizaReg()},500);
rgBotao();
