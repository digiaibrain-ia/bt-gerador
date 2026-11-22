
/* ----- leitura da API ----- */
function find(o,k){
  if(o==null||typeof o!=='object')return undefined;
  if(k in o&&typeof o[k]!=='object')return o[k];
  for(const x of Object.values(o)){const r=find(x,k);if(r!==undefined)return r}
}
function findKey(o,k){ // procura a chave em qualquer nível (devolve também objetos)
  if(o==null||typeof o!=='object')return undefined;
  if(k in o)return o[k];
  for(const x of Object.values(o)){const r=findKey(x,k);if(r!==undefined)return r}
}
function set(k,v){
  const el=$(k);if(!el)return;
  const u=el.querySelector('.u');
  el.innerHTML=(v==null||isNaN(v)?'—':Number(v).toFixed(DEC[k]))+(u?u.outerHTML:'');
}
let SIM_FALHA_ALT=false; // v1.10.203: falha SIMULADA do alternador de carga (so Demo; so o Dev/Operador oculto arma): alternador 0 V, bateria 24,8 V, alarme 'Falha de carga do alternador'
let SIM_FALHA_MOTOR=false; // v1.9.9: fica true a partir do momento em que a falha realmente está "ativa" (ver SIM_FALHA_MOTOR_ARMADA) — é o que demoExtras() lê
let SIM_FALHA_MOTOR_ARMADA=false; // v1.9.13: checkbox ③ da popup Demo — "armada" (vai disparar quando o ensaio simulado chegar no degrau de 30%), ainda não necessariamente ativa
function demoExtras(S,L,I,V,op){ // campos da API v3.1 que a tela ainda não usa (só para o demo)
  const on=S.rpm>1000,kw=Math.max(0,L*KW_NOM/100),fp=on&&kw>1?0.99:(on?1:null),kva=fp?kw/fp:0,kvar=Math.sqrt(Math.max(kva*kva-kw*kw,0));
  const r1=v=>Math.round(v*10)/10,fn=b=>on?r1(V(b)/1.732):0,tri=v=>[r1(v/3),r1(v/3),r1(v/3)];
  const [w1,w2,w3]=tri(kw),[a1,a2,a3]=tri(kva),[v1,v2,v3]=tri(kvar),pOleo=S.rpm>300?Math.round(150+250*Math.min(1,S.rpm/1800)):0;
  const agora=new Date().toISOString(),blocos={};['A','B','D','R','C','E','L','J','G1','G2','V','S1','S2'].forEach(k=>blocos[k]={idade:0.4,falhas:0,suspenso:false,ultimoErro:null});
  return {
    alternador:on?(SIM_FALHA_ALT?0:28):0,tempOleoC:Math.round(S.temp+(SIM_FALHA_MOTOR?35:8)),tempAguaF:r1(S.temp*9/5+32),
    pressaoOleoKpa:SIM_FALHA_MOTOR?0:pOleo,pressaoOleoBar:SIM_FALHA_MOTOR?0:Math.round(pOleo)/100,nivelCombustivel:78,
    frequencia:on?r1(S.rpm/30):0,tensaoL1N:fn(221.1),tensaoL2N:fn(220.8),tensaoL3N:fn(221.3),tensaoFN:fn(221.1),tensaoFF:on?r1(V(221.1)):0,
    tensaoFNMedia:fn(221.1),tensaoFFMedia:on?r1(V(221.1)):0,corrente:r1(I),correnteTerra:0,
    desequilibrioTensaoPct:on?0.2:null,desequilibrioCorrentePct:I>5?0.6:null,rotacaoFases:'L1-L2-L3',
    kwL1:w1,kwL2:w2,kwL3:w3,kvaL1:a1,kvaL2:a2,kvaL3:a3,kvarL1:v1,kvarL2:v2,kvarL3:v3,
    kva:r1(kva),kvar:r1(kvar),fpL1:fp,fpL2:fp,fpL3:fp,fp,percKvar:r1(kvar/KW_NOM*100),
    kwh:1234.5,kwhNegativo:0,kvah:1290.2,kvarh:210.4,horasMotor:r1(456+S.t/3600),horasMotorSegundos:Math.round(1641600+S.t),partidas:87,relogioDse:agora,
    modoCodigo:2,temAlarme:!!SIM_FALHA_ALT,alarmeAviso:!!SIM_FALHA_ALT,alarmeDesligamento:false,alarmeTripEletrico:false,alarmeDesligamentoControlado:false,alarmes:SIM_FALHA_ALT?[{nome:'Falha de carga do alternador',nivel:'aviso'}]:[],
    ecu:{pressaoRefrigeranteKpa:on?120:0,pressaoCombustivelKpa:on?380:0,pressaoTurboKpa:on?Math.round(L*1.2):0,tempAdmissaoC:Math.round(S.temp-5),
         tempEscapeC:on?Math.round(250+L*2):0,consumoLh:on?Math.round((6+L*0.22)*100)/100:0,pressaoAtmosfericaKpa:101,tempCombustivelC:35,
         torquePct:on?Math.round(L*0.9):0,torqueDemandadoPct:on?Math.round(L*0.9):0,cargaNaRotacaoPct:on?Math.round(L*0.95):0,
         posicaoAceleradorPct:on?Math.round(10+L*0.8):0,nivelOleoPct:SIM_FALHA_MOTOR?18:82,pressaoCarterKpa:0.05,nivelRefrigerantePct:96},
    // SIM_FALHA_MOTOR (só demo): pressão de óleo cai a 0 e entra 1 falha sintética — não é um código SPN/FMI real, é só pra exercitar o alerta e a popup Motor
    falhasEcu:SIM_FALHA_MOTOR?{quantidade:1,lampadas:{mil:'acesa',parada:'apagada',aviso:'acesa',protecao:'apagada'},codigos:[{tipo:'Simulado',codigo:'TESTE-PRESSAO-OLEO'}],truncado:false}
                             :{quantidade:0,lampadas:{mil:'apagada',parada:'apagada',aviso:'apagada',protecao:'apagada'},codigos:[],truncado:false},
    leituraEm:agora,geradoEm:agora,
    dse:{modeloConfigurado:'DSE 4520',familiaAlarmes:'4xxx',fabricanteCodigo:2,modeloCodigo:4520,serie:12345678,modeloTexto:'DSE4520 MKII',variante:'',firmwareCodigo:1792,firmware:'7.0'},
    diag:{versaoApi:'3.1',unitId:10,blocos,statusModbus:'active',errosModbusTotal:0,ultimoErro:null,ultimoErroHa:null,ultimoErroBloco:null}
  };
}
function demoData(){
  const S=SIM,L=S.meas,k=L/100,on=Math.min(1,L/10),g=gauss,I=2.35*L;
  const vf=Math.max(0,Math.min(1,(S.rpm-900)/800)),V=b=>vf>0?vf*(b+0.4*k)+0.12*g()*vf:0;
  const op=S.gen==='operando',crank=S.gen==='partindo'&&S.gt<GT.crank;
  return {ok:true,idadeSegundos:0.2,modo:'MANUAL',dse:{modeloConfigurado:'DSE 4520'},
    tensaoL1L2:V(221.1),tensaoL2L3:V(220.8),tensaoL3L1:V(221.3),
    correnteL1:Math.max(0,I*0.996+0.3*on*g()),correnteL2:Math.max(0,I+0.3*on*g()),correnteL3:Math.max(0,I*1.004+0.3*on*g()),
    kw:Math.max(0,L*KW_NOM/100+0.15*on*g()),tempAguaC:S.temp,rpm:Math.round(S.rpm+(S.rpm>1500?0.6*g():0)),
    bateria:(S.rpm>1000?(SIM_FALHA_ALT?24.8:28.3):crank?22.5:25.6)+0.02*g(),percCarga:L,
    leds:{stop:S.gen==='parado',manual:S.gen!=='parado',teste:false,auto:false,disjuntorGerador:S.brk,geradorDisponivel:op}, // v1.9.22: antes "manual" vinha sempre true (fixo) — não representava o gerador simulado ligado/desligado; agora acompanha S.gen (igual ao DSE real descrito pelo operador: STOP aceso parado/ocioso, MANUAL aceso ao partir)
    saidaCombustivel:S.gen==='partindo'||op,saidaPartida:crank,...demoExtras(S,L,I,V,op)};
}
function ingest(d,idade){ // atualiza só o estado (sem mexer na tela)
  const nn=k=>{const v=Number(find(d,k));return isNaN(v)?null:v};
  MED={kw:nn('kw'),tc:nn('tempAguaC'),va:nn('tensaoL1L2'),vb:nn('tensaoL2L3'),vc:nn('tensaoL3L1'),
       ia:nn('correnteL1'),ib:nn('correnteL2'),ic:nn('correnteL3'),rpm:nn('rpm'),bat:nn('bateria'),hz:nn('frequencia')}; // v1.9.77: hz para a condição de frequência do relatório
  const pc=Number(find(d,'percCarga'));
  // v1.9.29 (ACH-13 da auditoria): antes, campo "ok" ausente (não só "false") passava como leitura válida,
  // e "idadeSegundos" ausente virava idade=0 (leitura "instantaneamente fresca"). Agora exige "ok"
  // explicitamente true — se o Node-RED real não mandar esse campo em toda resposta, a tela vai passar a
  // mostrar "Dado antigo"/pílula vermelha sempre; se isso acontecer, avise que precisamos revisar esta linha.
  dadoOk=find(d,'ok')===true&&idade<=MAX_IDADE; carga=isNaN(pc)?null:pc;
  const estAnt=GEN.estado;GEN=genInfo(d);
  if(GEN.estado!==estAnt&&Date.now()>msgFixaAte)msgGer(''); // o gerador mudou de estado: o comando funcionou (não apaga o aviso de ensaio descartado)
  if(MODO!=='carga'&&T.started&&!T.run&&!T.fim&&GEN.estado==='operando'){
    opSeq++; // debounce: só confia depois de 2 leituras seguidas "operando" (contra 1 leitura isolada/ruído do Modbus)
    if(opSeq>=2&&!T.avisouOp){
      // v1.9.23: a pedido do operador (testou em campo e no demo) — o cronômetro NÃO inicia mais sozinho.
      // Até a v1.9.22, ao detectar "operando" o app chamava iniciaCron() automaticamente (pulava o clique em
      // INICIAR). O operador quer manter esse clique sempre manual e deliberado; aqui só avisa, uma vez, que
      // o gerador já está operando e que o cronômetro espera o INICIAR/▶ INICIAR CONTAGEM. O bug de raiz que
      // motivou o início automático no demo (botão preso desabilitado) foi corrigido direto em botoesGer().
      msgGer('Gerador operando — clique em INICIAR (▶ INICIAR CONTAGEM) quando quiser começar a contar o tempo.',8000);
      T.avisouOp=true;opSeq=0;
    }
  }else{opSeq=0;if(GEN.estado!=='operando')T.avisouOp=false}
  return dadoOk;
}
function aplicaAlarmes(d){ // cartão da água muda de cor (e ganha ▲) quando passa dos limites
  Object.keys(FAIXAS).forEach(k=>{
    const el=$(k),c=el&&el.closest('.card');if(!c)return;
    const f=FAIXAS[k],raw=find(d,k),v=Number(raw);
    c.title=`Normal: até ${f.ok[1]} ${f.un} · Atenção: até ${f.av[1]} ${f.un} · Crítico: acima disso`;
    let n=0,txt='';
    if(dadoOk&&raw!=null&&!isNaN(v)&&v>f.ok[1]){n=v>f.av[1]?2:1;txt='▲ '+(n===2?'CRÍTICO':'ATENÇÃO')}
    c.classList.toggle('al-av',n===1);c.classList.toggle('al-cr',n===2);
    if(txt)c.dataset.al=txt;else delete c.dataset.al;
  });
}
// v1.9.57: o polling do PLC da Carga (GET /api/chaves/56 -> CH_LIG/DIS/KWR) saiu do render() e virou timer próprio,
// independente da telemetria do DSE (/api/gerador). Antes, com o servidor do DSE fora, render() nunca rodava e as
// chaves da tela principal ficavam congeladas/vazias mesmo com o PLC respondendo.
let _pollPlcBusy=false;
async function pollPlcPrincipal(){
  if(_pollPlcBusy||typeof CH_SRV==='undefined'||CH_SRV.fonte!=='nodered'||typeof chAtualizaDoPlc!=='function')return;
  _pollPlcBusy=true;
  try{await chAtualizaDoPlc(true);drawBanco(bancoDados(window.__ultimoDado||{}))}
  catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }
  finally{_pollPlcBusy=false}
}
/* v1.9.65: o relógio do poll agora vem de um Web Worker. Motivo: aba escondida > 5 min => o Chrome limita setInterval da página a ~1x/min
   ("intensive throttling"); o Node-RED (vigia v2.3) entenderia que a tela sumiu e zeraria as chaves com o operador ainda lá.
   O Worker não sofre esse limite; o setInterval abaixo fica como reserva e só dispara o poll se o Worker não bateu nos últimos 3 s. */
let _ultTickW=0;
(function(){
  try{
    const src='let t=null;onmessage=function(e){if(e.data==="start"&&!t)t=setInterval(function(){postMessage(1)},1000);if(e.data==="stop"){clearInterval(t);t=null}}';
    const w=new Worker(URL.createObjectURL(new Blob([src],{type:'application/javascript'})));
    w.onmessage=function(){_ultTickW=Date.now();pollPlcPrincipal()};
    w.onerror=function(){_ultTickW=0;try{w.terminate()}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }};   // Worker não carregou (ex.: política do navegador): vale o setInterval
    w.postMessage('start');
    window.__tickWorker=w;
  }catch(e){_ultTickW=0}
})();
setInterval(function(){if(Date.now()-_ultTickW>3000)pollPlcPrincipal()},1000); // v1.9.59: 2 s -> 1 s (v1.9.65: reserva do Worker)
