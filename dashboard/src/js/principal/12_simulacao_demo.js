const GT={crank:3,subida:5,disp:1.5}; // partida do gerador (s): motor de partida girando, subida de rotação, até ficar disponível
const SIM={gen:'parado',gt:0,rpm:0,brk:false,fimZ:false,sw:0,tgt:0,lastTgt:0,gain:1+(Math.random()-.5)*0.016,
  x:0,v:0,n1:0,meas:0,temp:30,t:0,nextSw:0,ch:CH.map(()=>0)};
const W_N=4,Z=0.7;   // resposta da medição: frequência natural (rad/s) e amortecimento -> pequeno sobressinal
function gauss(){let u=0;while(!u)u=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*Math.random())}
const FAT=CH.map((c,i)=>1+(((i*37)%11)-5)/250); // Demo: cada chave 'física' tem kW ±2% diferente do nominal (pra o Setup ter o que medir)
const kwChaves=()=>CH.reduce((a,c,i)=>a+(SIM.ch[i]?c.kw*FAT[i]:0),0);
// v1.9.33: chaves desabilitadas pelo operador (popup "Chaves"). Índice = ordem de CH. Só tela/Demo por enquanto (DB55 ainda não definido).
const KWR={};const KWRT={};const TENS={};let USAR_REAL=false; // v1.9.78: KWRT[q][1..3] = Setup de cada chave por chaveamento (1=220, 2=380, 3=440 V); TENS[idBanco] = chaveamento ativo (0 = não informado); KWR continua sendo a visão do chaveamento ATIVO
// (comentário original:) // v1.9.34: kW REAL de cada chave (Setup: gerador em START, uma chave por vez, kW lido do DSE menos o kW sem carga). Por ora só no navegador; depois vira FB no PLC.
// v1.9.74: a ordem das chaves mudou (chave 1 = menor carga). Os índices guardados no navegador (habilitadas e kW real, por posição) da ordem
// antiga não valem mais: são descartados UMA vez. No modo PLC os dois voltam do PLC na 1ª leitura; no Demo local eram só dados de teste.
try{if(localStorage.getItem('medidor.chavesOrdem')!=='fisica-2026-10-27'){['medidor.chavesReal','medidor.chavesDes','medidor.usarReal'].forEach(k=>localStorage.removeItem(k));localStorage.setItem('medidor.chavesOrdem','fisica-2026-10-27')}}catch(e){}
try{Object.assign(KWR,JSON.parse(localStorage.getItem('medidor.chavesReal')||'{}'));USAR_REAL=localStorage.getItem('medidor.usarReal')==='1'}catch(e){}
try{Object.assign(KWRT,JSON.parse(localStorage.getItem('medidor.chavesRealT')||'{}'));Object.assign(TENS,JSON.parse(localStorage.getItem('medidor.chavesTens')||'{}'))}catch(e){} // v1.9.78
const kwEf=i=>USAR_REAL&&KWR[i]?KWR[i].kw:CH[i].kw;
const fmtKw=x=>Number.isInteger(x)?String(x):pt(x,1);
const DIS=CH.map(()=>false);
const CH_CMD=CH.map(()=>false); // v1.9.59: COMANDO por chave (cb.ligar[] do DB150, vindo de GET /api/chaves/56 -> cbLigar). Laranja = comandada; verde = CH_LIG (feedback sb.ligada)
const CH_PEND_T={};            // v1.10.169: hora em que cada chave entrou em "em envio" (solta o estado preso depois de 12 s)
const CH_PEND=new Set();         // v1.9.59: chaves com POST /ligar em andamento — o polling não sobrescreve o estado otimista delas
let CH_SELPLC=null; // v1.9.58: índice global (em CH) da chave que o PLC tem SELECIONADA/COMANDADA agora (setup.chaveSel do DB150) — null = nenhuma. Diferente de CH_LIG (status/feedback sb.ligada).
const LINK={banco:{},dse:{ok:false,ts:0},chv:{ok:false,ts:0,http:0,msg:''}, // v1.9.63: estado das comunicações (alimenta bolinhas do card Modo, aviso "sem leitura do PLC" e o bloqueio de comando)
  bancoOk(id){const L=this.banco[id];return !!(L&&L.ok&&Date.now()-L.ts<5000)}};window.LINK=LINK;
const FALHA_RET=CH.map(()=>false), FALHA_COL=CH.map(()=>false); // v1.10.168: falha de retorno / contator colado por chave (do PLC do banco, flow v3.5)
const CH_LIG=CH.map(()=>false); // v1.9.53: estado real "ligada" de cada chave (sb.ligada[], vindo do GET /api/chaves/56) — fonte única pra tela principal, Setup e Habilitar/Desabilitar baterem com o PLC de verdade
try{const j=JSON.parse(localStorage.getItem('medidor.chavesDes')||'null');if(Array.isArray(j)&&j.length===CH.length)j.forEach((v,i)=>DIS[i]=!!v)}catch(e){}
function setCh(i,v){SIM.ch[i]=(DIS[i]||!bkLiberado(bkDeCh(i)))?0:v} // v1.9.74: banco bloqueado (seletora em Manual / banco desligado) também não fecha chave
function melhorConjunto(alvo){ // alvo em DÉCIMOS de kW; chaves cuja soma chega mais perto do alvo; empate: menos chaves (v1.9.34: usa o kW efetivo — real, se habilitado)
  const W=CH.map((c,i)=>Math.round(kwEf(i)*10));
  const N=CH.length,M=W.reduce((a,w)=>a+w,0),INF=99,dp=[new Array(M+1).fill(INF)];dp[0][0]=0;
  for(let i=0;i<N;i++){const w=W[i],pr=dp[i],nx=pr.slice();if(DIS[i]||!bkLiberado(bkDeCh(i))){dp.push(nx);continue}for(let s=w;s<=M;s++)if(pr[s-w]+1<nx[s])nx[s]=pr[s-w]+1;dp.push(nx)}
  let best=0,bd=1e9;
  for(let s=0;s<=M;s++)if(dp[N][s]<INF){const d=Math.abs(s-alvo);if(d<bd||(d===bd&&dp[N][s]<dp[N][best])){bd=d;best=s}}
  const set=CH.map(()=>0);let s=best;
  for(let i=N;i>0;i--)if(dp[i][s]!==dp[i-1][s]){set[i-1]=1;s-=W[i-1]}
  return set;
}
const _ms={};
function alvoSet(kw){const k=Math.max(0,Math.round(kw*10));return _ms[k]||(_ms[k]=melhorConjunto(k))}
function fillKw(kw){alvoSet(kw).forEach((v,i)=>setCh(i,v))}
function simReset(){Object.assign(SIM,{sw:0,tgt:0,lastTgt:0,x:0,v:0,n1:0,meas:0,nextSw:0,fimZ:false,refill:true});SIM.ch.fill(0)}
function genStep(dt){ // partida e parada do gerador
  const S=SIM;S.gt+=dt;
  if(S.gen==='partindo'){
    const t=S.gt,c=GT.crank,u=GT.subida;
    if(t<c)S.rpm=250*t/c;
    else if(t<c+u){const x=(t-c)/u;S.rpm=250+1550*x*x*(3-2*x)}
    else S.rpm=1800;
    if(t>=c+u+GT.disp){S.gen='operando';S.gt=0}
  }else if(S.gen==='operando')S.rpm=1800;
  else if(S.gen==='parando'){S.rpm*=Math.exp(-dt/1.8);if(S.rpm<5){S.rpm=0;S.gen='parado';S.gt=0}}
  S.brk=S.gen==='operando'&&S.gt>=0.8; // o disjuntor fecha logo depois de o gerador ficar disponível
}
function simStep(dt){ // dt em segundos de simulação
  const S=SIM; S.t+=dt; genStep(dt);
  if(T.fim){if(!S.fimZ){S.fimZ=true;S.refill=true;$('simCarga').value=0;$('simVal').textContent='0,0%'}}else S.fimZ=false; // fim do ensaio: zera a carga (o gerador continua ligado)
  const ssel=typeof window.chSetupSel==='function'?window.chSetupSel():null; // v1.9.69: chave selecionada no popup Setup (bco.SU)
  if(ssel!=null){for(let j=0;j<CH.length;j++)S.ch[j]=j===ssel?1:0;S.refill=false;S.lastTgt=S.tgt=kwChaves()/KW_NOM*100} // v1.9.69: Setup manda — nada (potenciômetro, Auto, fim de ensaio) apaga a chave em calibração
  else if(SETUP){for(let j=0;j<CH.length;j++)S.ch[j]=(SETUP.fase===1&&j===SETUP.i&&!DIS[j])?1:0} // v1.9.34: Setup da chave — só a chave em calibração fica ligada, as demais ficam bloqueadas
  else if(window.PATAMAR_GUIADO_ON&&window.PATAMAR_GUIADO_ON()){S.refill=false} // v1.10.2: o Patamar Guiado comanda as chaves; o simulador só deixa a carga seguir as chaves (antes o Operador Auto escolhia outras)
  else if(auto){
    if(T.fim||!S.brk)S.tgt=0;else if(T.run)S.tgt=ETAPAS[T.et].alvo;
    if(S.tgt!==S.lastTgt){S.lastTgt=S.tgt;S.gain=1+(Math.random()-.5)*0.016} // erro de ganho do banco: ±0,8%
    const alvoKw=S.tgt*KW_NOM/100,a=alvoSet(alvoKw);
    if(S.t>=S.nextSw){ // operador fecha/abre uma chave por vez (as maiores primeiro) até chegar ao conjunto do alvo
      const subir=kwChaves()<alvoKw,idx=CH.map((c,i)=>i),maior=(x,y)=>CH[y].kw-CH[x].kw||x-y;
      const fechar=idx.filter(i=>a[i]&&!S.ch[i]).sort(maior),abrir=idx.filter(i=>!a[i]&&S.ch[i]).sort(maior);
      const i=subir?(fechar.length?fechar[0]:abrir[0]):(abrir.length?abrir[0]:fechar[0]);
      if(i!==undefined){setCh(i,a[i]);S.nextSw=S.t+(a[i]?0.35+Math.random()*0.5:0.12+Math.random()*0.18)} // transição mais ágil: menos tempo "perdido" fechando chaves uma a uma
    }
    S.refill=true; // ao voltar pro manual, as chaves seguem o potenciômetro
  } else if(S.refill){S.refill=false;fillKw(+$('simCarga').value*KW_NOM/100)} // manual (v1.9.33): o potenciômetro monta o conjunto UMA vez; depois o operador pode clicar nas chaves
  /* v1.10.105: em DEMO + PLC as chaves quem liga é o PLC (CH_LIG = feedback real); o DSE simulado precisa enxergar essa carga. Demo local: continua SIM.ch.
     Por quê (técnico): kwChaves() soma SIM.ch (simulador); o Patamar/clique comandam o PLC e SIM.ch ficava zerado -> kW medido 0 -> estabilização nunca começava. */
  S.sw=(CH_SRV.fonte==='nodered'?CH.reduce((a,c,i)=>a+(CH_LIG[i]?c.kw*FAT[i]:0),0):kwChaves())/KW_NOM*100;
  const ref=S.brk?S.sw*S.gain:0,n=Math.max(1,Math.ceil(dt/0.05)),h=dt/n; // sem gerador em operação não há carga
  for(let i=0;i<n;i++){S.v+=(W_N*W_N*(ref-S.x)-2*Z*W_N*S.v)*h;S.x+=S.v*h}
  const k=Math.exp(-dt/5);S.n1=S.n1*k+0.35*Math.sqrt(1-k*k)*gauss(); // oscilação lenta + ruído rápido, limitado a ±1,3%
  const ruido=Math.max(-1.3,Math.min(1.3,S.n1+0.3*gauss()))*Math.min(1,S.x/10);
  S.meas=Math.max(0,S.x+ruido);
  const quente=S.rpm>1000,alvoT=quente?35+40*Math.pow(Math.min(S.meas,115)/107,1.8):DADOS.tamb;
  S.temp+=(alvoT-S.temp)*(1-Math.exp(-dt/(quente?120:900)));
}
function bancoSim(){return BANCOS.map((b,bi)=>({nome:b.nome,chaves:CH.map((c,i)=>({c,i})).filter(x=>x.c.b===bi).map(x=>({kw:kwEf(x.i),st:SIM.ch[x.i]?1:0}))}))}

/* painel do banco de carga (chaves) */
const DIF_KW=3;      // diferença chaves − DSE aceitável (kW)
let bancoSig='';
