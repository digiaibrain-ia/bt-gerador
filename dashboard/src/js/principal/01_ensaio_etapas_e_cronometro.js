
const $=id=>document.getElementById(id);
/* ===== AJUSTES DO ENSAIO ===== */
const ETAPAS=[
  {alvo:0,  min:2, nome:'aquecimento sem carga'},
  {alvo:30, min:1, nome:'30% da carga'},
  {alvo:50, min:1, nome:'50% da carga'},
  {alvo:100,min:5, nome:'100% da carga'},
  {alvo:107,min:2, nome:'107% da carga'},
  {alvo:0,  min:1, nome:'0% final'}
];
let TOL=3,MODO='iso'; // MODO do ensaio: iso | carga (ver Faixas)        // tolerância de carga (pontos percentuais) — v1.9.29: padrão 3->10 a pedido do operador
let ESTAB_MIN=1.5,ESTAB_MAX=4.5; // tempo de estabilidade exigido em cada etapa (s), sorteado entre estes valores
const ESTAB=[];function sorteiaEstab(){ESTAB.length=0;ETAPAS.forEach(()=>ESTAB.push(Math.round((ESTAB_MIN+Math.random()*(ESTAB_MAX-ESTAB_MIN))*10)/10))}
sorteiaEstab();
/* ----- ALARME DA TEMPERATURA DA ÁGUA -----
   O usuário muda os limites pelo botão ⚙ do cartão "Água" (fica salvo no navegador).
   Os valores padrão abaixo (v1.9.29: 90/95, antes 85/95) seguem marcados como PROVISÓRIOS
   pela engenharia — ver pasta PENDENCIAS; mudar o número não substitui a validação formal. */
const AGUA_PADRAO={atencao:90,critico:95};   // °C — v1.9.29: padrão 85->90 a pedido do operador (o valor "crítico" 95 não mudou)
const FAIXAS={tempAguaC:{ok:[0,AGUA_PADRAO.atencao],av:[0,AGUA_PADRAO.critico],un:'°C'}};
function defineFaixaAgua(at,cr){FAIXAS.tempAguaC.ok=[0,at];FAIXAS.tempAguaC.av=[0,cr]}
try{const j=JSON.parse(localStorage.getItem('medidor.faixaAgua')||'null');
    if(j&&isFinite(j.atencao)&&isFinite(j.critico)&&j.atencao<j.critico)defineFaixaAgua(+j.atencao,+j.critico)}catch(e){}
const MAX_IDADE=10; // dado mais velho que isso = sem dado
/* ============================== */
const DEC={tensaoL1L2:1,tensaoL2L3:1,tensaoL3L1:1,correnteL1:0,correnteL2:0,correnteL3:0,kw:1,tempAguaC:1,rpm:0,bateria:2};
const fmt=(s)=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0');
const pt=(n,d=1)=>Number(n).toFixed(d).replace('.',',');
const durS=i=>ETAPAS[i].min*60;
const totS=ETAPAS.reduce((a,e)=>a+e.min*60,0);

let carga=null, dadoOk=false, timer=null;
let GEN={estado:'—',run:true}; const genRun=()=>GEN.run;
const genLigado=()=>['operando','partindo','parando'].includes(GEN.estado); // v1.9.35: com o gerador ligado os MODOS DE OPERAÇÃO (tipo de ensaio, salvamento, Node-RED manual/auto) ficam travados
const MSG_GEN_LIGADO='Gerador ligado: pare o gerador para trocar o modo de operação.'; // estado do gerador (vem da API ou do simulador)
let opSeq=0; // v1.9.20: contador de leituras seguidas "operando" com o ensaio ARMADO, usado em ingest() pra só confiar e iniciar sozinho após 2 leituras seguidas
let T={run:false,started:false,et:0,el:0,estavel:0,fim:false,parcial:false,sp:1,last:0}; // sp = velocidade da simulação (1, 5, 8 ou 10)

/* ----- montagem da barra de etapas ----- */
const stWrap=$('stages');
ETAPAS.forEach((e,i)=>{
  const d=document.createElement('div');d.className='st';d.id='st'+i;d.style.flex=e.min;
  d.innerHTML=`<div class="t">${e.alvo}%</div><div class="b"><i></i></div><div class="m">${e.min}</div>`;
  stWrap.appendChild(d);
});
$('clkTot').textContent='/ '+fmt(totS);

/* ----- cronômetro ----- */
function estadoLampada(){
  if(!T.run||T.fim) return {c:'',t:''};
  if(MODO==='carga') return !dadoOk||carga==null?{c:'alerta',t:'!'}:{c:'cont',t:''};
  if(!dadoOk||carga==null) return {c:'alerta',t:'!'};
  if(!genRun()) return {c:'estab',t:''}; // aguardando o gerador
  if(T.aguarda&&!SNAP[T.et]) return {c:'cont',t:'✓'}; // etapa cumprida: salvar para avançar
  if(T.aguardaFim) return {c:'cont',t:'✓'}; // todas as etapas feitas: finalizar
  const a=ETAPAS[T.et].alvo;
  if(carga<a-TOL) return {c:'ajuste',t:'▲'};
  if(carga>a+TOL) return {c:'ajuste',t:'▼'};
  return T.estavel<ESTAB[T.et]?{c:'estab',t:''}:{c:'cont',t:''};
}
function passo(){
  const now=Date.now(); const dt=Math.min((now-T.last)/1000,5); T.last=now;
  const demo=$('demo').checked; if(!demo&&T.sp!==1)setVel(1); // fora do demo o tempo é sempre real (1×)
  if(demo&&T.started)T.simulado=true; // marca o ensaio como simulação
  const sp=T.sp, n=Math.max(1,Math.ceil(dt*sp/0.5-1e-9));
  for(let i=0;i<n;i++){ // sub-passos de no máximo 0,5 s de relógio: simulação e gráfico têm a mesma resolução em qualquer velocidade
    const d=dt/n;
    if(demo){simStep(d*sp);ingest(demoData(),0.2)}
    passoUnit(d,sp);
  }
  if(demo)render(demoData(),0.2);
  vigiaGerador();
  desenha();
}
function passoUnit(dt,sp){
  if(MODO==='carga'){ // só acompanha: cronômetro livre, sem etapas, sem salvar
    if(T.run&&dadoOk&&genRun())T.el+=dt*sp;
    registra(dt);return;
  }
  if(T.run&&!T.fim&&!T.aguardaFim&&dadoOk&&carga!=null&&genRun()){
    const a=ETAPAS[T.et].alvo;
    // até alcançar a estabilidade (1ª vez na etapa), a carga precisa estar dentro da tolerância; depois de alcançada,
    // o cronômetro não reseta mais sozinho — quem decide se uma oscilação invalida a leitura é o operador (ex.: Resalvar)
    if(!T.jaEstavel){
      if(Math.abs(carga-a)<=TOL&&!(window.PATAMAR_ESCALONANDO&&window.PATAMAR_ESCALONANDO())&&!(window.PATAMAR_AGUARDA_APLICAR&&window.PATAMAR_AGUARDA_APLICAR())) T.estavel+=dt*sp; else T.estavel=0;   // v1.10.218: patamar MANUAL espera o Aplicar antes de contar   // v1.10.106: durante os sub-degraus a carga ainda está subindo; só estabiliza depois do último passo
      if(T.estavel>=ESTAB[T.et])T.jaEstavel=true;
    }
    if(T.jaEstavel){
      T.el+=dt*sp;
      if(T.el>=durS(T.et)){
        if(salvaManualEt(T.et)&&!SNAP[T.et]){T.el=durS(T.et);T.aguarda=true} // ensaio manual: o tempo foi cumprido, espera o clique em SALVAR
        else{
          T.aguarda=false;
          if(T.et<ETAPAS.length-1){T.et++;T.el=0;T.estavel=0;T.jaEstavel=false;motorFalhaDegrau()}
          else{T.el=durS(T.et);T.aguardaFim=true;if(!SNAP[T.et])gravaEtapa(T.et,!salvaManualEt(T.et))} // última etapa cumprida: o ensaio só termina no botão FINALIZAR
        }
      }
    }
  } else if(T.run){T.estavel=0;T.jaEstavel=false}
  registra(dt);
}
function desenha(){
  try{botoesGer()}catch(x){}   // v1.10.0: recalcula INICIAR/PARAR ENSAIO a cada atualização (antes só quando o estado do gerador mudava)
  let dec=0; for(let i=0;i<T.et;i++)dec+=durS(i);
  $('clk').textContent=fmt(T.gravado?0:dec+T.el);
  ETAPAS.forEach((e,i)=>{
    const s=$('st'+i); s.className='st'+(T.gravado?'':(i<T.et||(T.fim&&i===T.et)?' done':i===T.et?' cur':''));
    s.querySelector('i').style.width=!T.gravado&&i===T.et&&!T.fim?(T.el/durS(i)*100)+'%':'';
  });
  $('etLbl').textContent=MODO==='carga'?'Teste de carga · sem registro':T.gravado?'Ensaio gravado · aguardando START':(T.aguarda&&!SNAP[T.et])?`Etapa ${T.et+1} cumprida · SALVAR`:T.aguardaFim?'Etapas salvas · FINALIZAR':T.fim?(T.parcial?'Finalizado (incompleto)':'Ensaio concluído'):`Etapa ${T.et+1} de ${ETAPAS.length} · ${ETAPAS[T.et].nome}`;
  $('etLbl').classList.toggle('pedeTxt',!!((T.aguarda&&!SNAP[T.et])||T.aguardaFim));
  $('etPct').textContent=carga==null?'—':pt(carga)+'%';
  const a=ETAPAS[T.et].alvo, tg=$('tg');
  tg.style.left=Math.max(a-TOL,0)/1.2+'%'; tg.style.width=((a+TOL)-Math.max(a-TOL,0))/1.2+'%';
  $('mk').style.left=carga==null?'0':Math.min(Math.max(carga,0),120)/1.2+'%';
  const L=estadoLampada(), lp=$('lamp'); lp.className=L.c; lp.textContent=L.t;
  const fb=$('bFim');fb.disabled=!(T.started&&T.aguardaFim&&!T.fim); // FINALIZAR só libera quando todas as etapas foram cumpridas e salvas
  fb.title=(T.aguardaFim&&!T.fim)?'Todas as etapas foram salvas: finalizar e ver o resultado':'Só libera ao final do teste (todas as etapas cumpridas e salvas). Para recomeçar, use ZERAR.';
  drawTabela();
  drawScreen();
  if(window.__atualizaJanelas)__atualizaJanelas();
}
function iniciaCron(){if(T.fim)return;T.run=true;T.started=true;T.last=Date.now();if(!RG.ativo&&$('rgAuto').checked&&!rgBloqDemo())rgIniciar()}
$('bPau').onclick=()=>{T.run=false};
async function pararEnsaio(){ // STOP do ENSAIO (diferente do start/stop do gerador, que é feito no painel do DSE)
  if(!T.started||T.fim)return;
  // v1.10.163: 1º pergunta SE quer parar. Antes havia uma pergunta só e o "Cancelar" TAMBÉM parava o ensaio: não dava para desistir de um toque errado.
  if(!confirm('PARAR o ensaio em andamento?\n\nO cronômetro e as etapas da tela voltam ao início.\n\nOK = parar o ensaio\nCancelar = NÃO parar (o ensaio continua)'))return;
  if(RG.ativo)rgParar('ensaio parado pelo operador',true); // o Registro de amostras sempre para junto, nunca fica sozinho gravando
  T.run=false;
  let limpaPlc=false;
  if(MODO!=='carga')limpaPlc=confirm('Ensaio parado.\n\nTambém apagar o que já foi gravado no PLC (DB SNAP) e começar do zero na próxima vez?\n\nOK = apagar o PLC também\nCancelar = manter no PLC (o que já foi gravado continua lá até você gravar por cima ou usar ZERAR depois)');
  /* v1.10.103: PRIMEIRO restabelece a tela (cronômetro, Patamar Guiado, gráfico, chaves), DEPOIS limpa o PLC em segundo plano.
     Por quê (técnico): antes o reset ficava atrás de um "await" do PLC; se o PLC/Node-RED demorava, T não era zerado e o diálogo do Patamar
     Guiado seguia atualizando um ensaio "morto" (parecia congelado até dar F5). Leigo: primeiro a tela volta ao normal; limpar o PLC é um
     trabalho à parte, com limite de 10 s e aviso. */
  T={run:false,started:false,et:0,el:0,estavel:0,fim:false,parcial:false,sp:T.sp,last:Date.now()};SIM_FALHA_MOTOR=false;/*v1.9.13:zerou o ensaio,a falha volta a esperar o próximo degrau de 30%*/
  try{if(window.PATAMAR_GUIADO_PARA)window.PATAMAR_GUIADO_PARA('ensaio parado pelo operador')}catch(x){console.error('Patamar Guiado: parar',x)}
  chartReset();sorteiaEstab();if(auto)simReset();desenha();
  demoDesliga(); // v1.9.14: PARAR ENSAIO também desliga a simulação (①/③) — a pedido do operador, pra não ficar "rodando" em segundo plano depois de parar
  if(limpaPlc){
    msgGer('Ensaio parado. Apagando o que foi gravado no PLC…',8000);
    try{
      const lim=new Promise((_,rej)=>setTimeout(()=>rej(new Error('o PLC/Node-RED não respondeu em 10 s')),10000));
      await Promise.race([ensEscreve(async()=>{await ensGarantiaModo();await ensFetch('POST','/api/ensaio/snap/limpar',{confirmado:true});const j=await ensGetSnap();ensAplicaSnap(j)}),lim]);
      msgGer('PLC limpo: ensaio zerado.',6000);
    }catch(e){msgGer('Ensaio parado, mas não foi possível limpar o PLC: '+ensMsgErro(e))}
  }
}
function pararEnsaioSilencioso(){ // v1.9.66: encerra o ensaio SIMULADO sem perguntar e sem mexer no PLC (usado quando o Demo é desligado sozinho)
  if(!T.started||T.fim)return false;
  if(RG.ativo)rgParar('Demo desligado automaticamente (DSE real detectado)',true);
  T={run:false,started:false,et:0,el:0,estavel:0,fim:false,parcial:false,sp:T.sp,last:Date.now()};SIM_FALHA_MOTOR=false;
  chartReset();sorteiaEstab();if(auto)simReset();desenha();
  return true;
}
$('bZer').onclick=async()=>{
  if(MODO==='carga'){ // ensaio livre: cronômetro livre, sem etapas — ZERAR continua zerando tudo (sem PLC)
    if(RG.ativo)rgParar('ZERAR',true);
    T={run:false,started:false,et:0,el:0,estavel:0,fim:false,parcial:false,sp:T.sp,last:Date.now()};chartReset();sorteiaEstab();if(auto)simReset();desenha();return;
  }
  zeraDegrau(); // v1.9.33: ZERAR = zera SÓ o degrau ativo (sem popup). O "zerar tudo / apagar PLC" agora é o PARAR ENSAIO.
};
function zeraDegrau(){ // v1.9.33
  if(!T.started||T.fim||T.aguardaFim){msgGer('ZERAR zera só o degrau ativo — não há degrau em andamento.');return}
  if(!confirm('ZERAR o degrau atual ('+ETAPAS[T.et].nome+')?\n\nIsso descarta o tempo e as leituras já contadas nesta etapa e volta para o início do aquecimento/estabilização. As etapas anteriores já salvas não são afetadas.\n\nOK = zerar este degrau\nCancelar = continuar sem zerar'))return; // v1.9.39: confirmação pedida pelo operador, pra evitar clique involuntário
  const i=T.et;
  T.el=0;T.estavel=0;T.jaEstavel=false;T.aguarda=false; // volta ao aquecimento/estabilização do degrau e espera a carga igualar o alvo
  C.pts.forEach(p=>{if(p.e===i)p.z=true}); // v1.9.34: pontos do degrau zerado deixam de valer no gráfico "Tempo de ensaio" (o clássico mostra tudo, é o relógio real)
  desenha();
}
$('bZerTudo').onclick=async()=>{ // opcional: só aparece depois do ensaio finalizado. Apaga de vez (tela + PLC) antes do próximo START, se o operador quiser.
  if(!T.fim)return;
  if(MODO!=='carga'){
    if(!confirm('Zerar por completo o ensaio finalizado?\n\nIsso apaga da tela E do PLC (DB SNAP) os valores deste ensaio que acabou de terminar.\n\nSe você não fizer nada, os valores ficam na tela normalmente até o próximo START ENSAIO (que já limpa o PLC sozinho).'))return;
    try{
      await ensEscreve(async()=>{await ensGarantiaModo();await ensFetch('POST','/api/ensaio/snap/limpar',{confirmado:true});const j=await ensGetSnap();ensAplicaSnap(j)});
      ENS.meta={};ENS.pend={};ENS.prea={estado:'nenhum',erro:'',serie:''};ensDesenhaBarra();
    }catch(e){msgGer('Não foi possível apagar o ensaio no PLC agora: '+ensMsgErro(e));return}
  }
  if(RG.ativo)rgParar('ZERAR POR COMPLETO',true);
  T={run:false,started:false,et:0,el:0,estavel:0,fim:false,parcial:false,sp:T.sp,last:Date.now()};SIM_FALHA_MOTOR=false;/*v1.9.13:zerou o ensaio,a falha volta a esperar o próximo degrau de 30%*/chartReset();sorteiaEstab();if(auto)simReset();desenha();
};
/* ===== GRÁFICO (tempo de relógio × carga) ===== */
// estado de cada ponto: 0 = cronômetro contando, 1 = rodando mas sem contar (ajuste/estabilizando/sem dado), 2 = pausa do operador
const C={t:0,pts:[],starts:[0],stopped:0,lastEt:0};
// v1.9.34: 3 opções de gráfico — 'off' (sem), 'ensaio' (tempo de ensaio/cronômetro, sem faixas de ajuste/pausa) e 'classico' (v1.9.32: relógio, com ajuste e pausa)
let SETUP=null; // v1.9.34: calibração de uma chave em andamento {i,fase:0|1,base}
let GRAF_MODO='ensaio';try{const v=localStorage.getItem('medidor.graficoModo');if(['off','ensaio','classico'].includes(v))GRAF_MODO=v}catch(e){}
const gModo=()=>GRAF_MODO==='classico'?'classico':'ensaio'; // exportações (PNG/PDF) usam o modo escolhido; 'sem gráfico' exporta o de tempo de ensaio
const SNAP=[]; // espelho da LEITURA DE VOLTA do PLC (GET /ensaio/snap): só tem a etapa quando o Node-RED a devolveu como salva
var ENS=null; // estado da ligação com o Node-RED de seleção (definido mais abaixo)
let MED={}; // última medição lida (usada no relatório)
function chartReset(){C.t=0;C.pts=[];C.starts=[0];C.stopped=0;C.lastEt=0;SNAP.length=0;if(ENS){ENS.meta={};ENS.pend={}}}
