/* ===== RELATÓRIO EM PDF ===== */
// Dados padrão do ensaio (edite aqui; campos de digitação ficam para depois)
// Demo e ensaio real têm dados SEPARADOS: os modelos da simulação nunca podem vazar para um ensaio real (relatório e Amostras).
const DADOS_DEMO={
  serie:'DZFA00045', versao:'773323',
  equip:[['Motor','SDEC','4HTAA4.3-G21','-'],['Alternador','WEG','QYI 274C SA','-'],
         ['Controlador','DEEP SEA','DSE 4520MKII','-'],['Retificador','DEEP SEA','24V 5AMP','-'],
         ['RAT','-','-','-'],['Bateria','EXCELL','60AH','-']],
  fase:'Trifásico', freq:60, tensao:220, tamb:17, pot:100, data:''
};
const DADOS_REAL=()=>({serie:'',versao:'',equip:['Motor','Alternador','Controlador','Retificador','RAT','Bateria'].map(n=>[n,'','','']),fase:'Trifásico',freq:60,tensao:220,tamb:'',pot:'',data:''}); // ensaio real começa em branco: tem que vir do print do SAP ou ser digitado
const DADOS=JSON.parse(JSON.stringify(DADOS_DEMO));let DADOS_MODO=null;
var ULTIMO=null; // dados do último ensaio iniciado (do modo atual)
function carregaDados(){ // (re)carrega os dados do modo atual (demo ou real) — chamado ao abrir a página e ao trocar entre demo e real
  const m=$('demo').checked?'demo':'real';if(m===DADOS_MODO)return;DADOS_MODO=m;
  let j=null;try{j=JSON.parse(localStorage.getItem('medidor.dados.'+m)||'null')}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
  Object.keys(DADOS).forEach(k=>delete DADOS[k]);
  Object.assign(DADOS,m==='demo'?JSON.parse(JSON.stringify(DADOS_DEMO)):DADOS_REAL(),j&&typeof j==='object'?j:{});
  try{ULTIMO=JSON.parse(localStorage.getItem('medidor.dadosUltimo.'+m)||'null')}catch(e){ULTIMO=null}
}
let TENS_TOL=2.5;   // desvio máximo de tensão (%)
let T100_MIN=300;   // tempo mínimo em 100% (s)
let FREQ_TOL=5;     // v1.9.77: desvio máximo de frequência (%) — print do relatório de 24/10, origem a confirmar com a engenharia
let STBY_MIN=107;   // v1.9.77: Stand-by (etapa > 100 %): carga aplicada mínima (%) — idem
let JANELA_S=2;     // valor da etapa = média dos últimos 2 s
const nf=(v,d=1)=>v==null||isNaN(v)?'-':Number(v).toFixed(d).replace('.',',');

function valoresEtapa(i,agora){ // agora=true: valores do momento (etapa em andamento), para o salvar manual
  if(!agora&&!(i<T.et||(T.fim&&i===T.et)))return null; // etapa ainda não terminou
  const ps=C.pts.filter(p=>p.e===i); if(!ps.length)return null;
  const fim=agora?C.t:geom()[i].e, last=ps[ps.length-1], win=JANELA_S;
  let sel=ps.filter(p=>p.t>=fim-win); if(!sel.length)sel=[last];
  const r={};
  ['kw','tc','va','vb','vc','ia','ib','ic','rpm','bat'].forEach(k=>{
    const v=sel.map(p=>p.m[k]).filter(x=>x!=null&&!isNaN(x));
    r[k]=v.length?v.reduce((a,b)=>a+b,0)/v.length:null;
  });
  r.pc=sel.reduce((a,p)=>a+p.c,0)/sel.length; // carga real (%) - só para a tela
  return r;
}
function salvaEtapa(i){ // salvamento AUTOMÁTICO (etapa já terminada): só envia se o operador escolheu "Salvar etapa: automático"
  if(SNAP[i]||ENS.pend[i])return; // já salva, em envio, ou com erro (o operador reenvia pelo botão da tabela)
  const r=valoresEtapa(i);
  if(r){r.estab=ESTAB[i];r.t1=r.t2=new Date();r.n=0;r.alAgua=nivelAgua(r.tc);r.tempo=durS(i);ensEnviaEtapa(i,r,!salvaManualEt(i))}
}
function avancaEtapa(){ // depois de salvar a etapa em andamento: passa para a próxima (ou espera o FINALIZAR)
  if(T.fim)return;
  T.aguarda=false;
  // v1.9.26: BUG CONFIRMADO pelo operador (print mostrando o tempo contando sozinho na etapa 2, sem a carga ter
  // sido levada a 30%) — esta função resetava T.el e T.estavel ao avançar de etapa, mas esquecia de resetar
  // T.jaEstavel. Como T.jaEstavel ficava "true" (herdado da etapa anterior, ex.: aquecimento 0% que estabiliza
  // sozinho), passoUnit() pulava direto para acumular T.el na nova etapa sem nunca checar se a carga chegou no
  // novo alvo. O caminho automático (dentro de passoUnit(), usado quando "Salvar etapa: automático") já resetava
  // corretamente — só faltava aqui, no caminho manual (clique em SALVAR).
  if(T.et<ETAPAS.length-1){T.et++;T.el=0;T.estavel=0;T.jaEstavel=false;motorFalhaDegrau()}
  else T.aguardaFim=true;
}
function motorFalhaDegrau(){ // v1.9.13: dispara a falha sintética do motor (checkbox ③) só quando o ensaio simulado ENTRA no degrau de 30% — não antes, não continuamente
  if(SIM_FALHA_MOTOR_ARMADA&&!SIM_FALHA_MOTOR&&$('demo').checked&&ETAPAS[T.et].alvo===30)SIM_FALHA_MOTOR=true;
}
async function finalizaManual(){ // encerra o ensaio e mostra o resultado; etapas não salvas ficam sem registro
  if(!T.started||T.fim)return;
  if(!SNAP[T.et]&&!T.aguardaFim){await salvaAgora(T.et);if(!T.started||T.fim)return}
  T.parcial=!(T.aguardaFim&&ETAPAS.every((e,i)=>SNAP[i]));
  T.run=false;T.fim=true;
  if(RG.ativo)rgParar('ensaio finalizado');
  desenha();abreResultado();
  try{if(window.__autoImprime)window.__autoImprime()}catch(e){console.error('autoImprime',e)}   // v1.10.107
}
