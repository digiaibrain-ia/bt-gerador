
/* ----- simulador local do Node-RED de seleção (teste da interface, sem PLC) ----- */
const MOCK={falha:'nenhuma',semIdx:false,modoTroca:false,lat:300};
const espera=ms=>new Promise(r=>setTimeout(r,ms));
function mockEstado(){let s=null;try{s=JSON.parse(localStorage.getItem('medidor.mock.plc')||'null')}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }if(!s||typeof s!=='object')s={modo:'manual',pre:null,etapas:{}};return s}
function mockSalva(s){try{localStorage.setItem('medidor.mock.plc',JSON.stringify(s))}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }}
function mockSnap(s){
  const ets=Object.keys(s.etapas).map(Number).sort((a,b)=>a-b).map(k=>{const e=s.etapas[k],o={etapa:e.etapa,salva:true,valores:e.valores};if(!MOCK.semIdx&&e.indice!=null)o.indice=e.indice;return o});
  return {modo:s.modo,preenchimento:s.pre?{campos:s.pre}:null,etapas:ets,lidoEm:new Date().toISOString()};
}
async function mockFetch(m,p,b){
  await espera(MOCK.lat);
  const tmo=(m==='GET'?ENS.tmoGet:ENS.tmoPost)/1000;
  if(MOCK.falha==='fora')throw new ErroEns('rede','Node-RED fora do ar ou sem rede (simulado)');
  if(MOCK.falha==='timeout'){await espera(1500);throw new ErroEns('timeout',`sem resposta do Node-RED em ${tmo} s (timeout, simulado)`)}
  const R=(j,st)=>({status:st||200,json:j});
  if(MOCK.falha==='http500')return R({erro:'erro interno simulado'},500);
  const s=mockEstado();
  if(p==='/api/ensaio/modo'){
    if(m==='GET')return R({modo:s.modo,bt:'BT2',ts:Date.now()});
    if(MOCK.falha==='okfalse')return R({ok:false,erro:'modo recusado (simulado)'});
    if(!b||!/^(manual|auto)$/.test(b.modo))return R({ok:false,erro:'modo inválido'});
    if(!MOCK.modoTroca){s.modo=b.modo;mockSalva(s)}
    return R({ok:true,modo:s.modo});
  }
  if(p==='/api/ensaio/snap'&&m==='GET')return R(mockSnap(s));
  if(m==='POST'){
    if(MOCK.falha==='okfalse')return R({ok:false,erro:'gravação recusada (simulado)'});
    if(p==='/api/ensaio/snap/preenchimento'){if(MOCK.falha!=='naoGrava'){s.pre=b.campos;mockSalva(s)}return R({ok:true})}
    if(p==='/api/ensaio/snap/etapa'){
      if(b.confirmado!==true)return R({ok:false,erro:'etapa sem a confirmação do operador'});
      if(MOCK.falha!=='naoGrava'){s.etapas[b.indice!=null?b.indice:b.etapa]={etapa:b.etapa,indice:b.indice,valores:b.valores};mockSalva(s)}
      return R({ok:true});
    }
    if(p==='/api/ensaio/snap/limpar'){
      if(b.confirmado!==true)return R({ok:false,erro:'limpar sem a confirmação do operador'});
      if(MOCK.falha!=='naoGrava'){s.pre=null;s.etapas={};mockSalva(s)}
      return R({ok:true});
    }
  }
  return R({erro:'rota desconhecida: '+m+' '+p},404);
}
