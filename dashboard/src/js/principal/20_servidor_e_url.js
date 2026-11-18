(function(){
  $('pVer').textContent='v'+VERSAO;
  $('footVer').textContent=' · Versão '+VERSAO+' ('+VERSAO_DATA+')';
  $('verAtual').innerHTML='Versão em uso: <b>'+VERSAO+'</b> · '+VERSAO_DATA;
  $('verLista').innerHTML=HISTORICO.map(h=>'<p style="margin:10px 0 3px"><b>v'+h.v+'</b> <span style="opacity:.7">· '+h.d+'</span></p><ul style="margin:0;padding-left:18px">'+h.i.map(t=>'<li>'+t+'</li>').join('')+'</ul>').join('');
  $('pVer').onclick=()=>$('dlgVer').showModal();
})();

/* ----- nível do alarme da água no momento de salvar ----- */
function nivelAgua(v){const f=FAIXAS.tempAguaC;if(v==null||isNaN(v))return 0;return v>f.av[1]?2:v>f.ok[1]?1:0}

/* ===== v1.9.66: UM SÓ SERVIDOR E TRÊS MODOS =====
   Modos (deduzidos de #demo + SRVM.plc, nunca guardados): 'real' (padrão: DSE real + PLC) | 'demoLocal' (DSE simulado, nada vai ao PLC) | 'demoPlc' (DSE simulado, mas chaves e registro vão ao PLC).
   Não existe PLC simulado: tudo que grava no PLC (chaves e registro do ensaio) exige PLC ativo. Fora do Demo as duas fontes são SEMPRE o Node-RED real.
   Uma única URL (SRVM.url) serve às rotas /api/chaves/... e /api/ensaio/... . Ordem: URL salva neste navegador (medidor.srvUrl) → URL antiga das chaves/registro (migrada) →
   mesma origem da página (só quando aberta por http/https) → vazia (file://: é preciso informar). */
const SRVM={plc:false,url:'',urlOrigem:'nenhuma',mk:'real',manual:false,plcOk:false,plcOkTs:0};
/* v1.9.67: "PLC ativo" para liberar "Usar o PLC real durante o Demo". Fora do Demo local a tela já lê o PLC pra outras coisas (LINK.bancoOk);
   dentro do Demo local ninguém faz essa leitura (chPlcAtivo()=false), então existe uma sonda própria (srvSondaPlc) só pra isto — não toca
   em CH_LIG/DIS/KWR/LINK.banco (não deve mudar nada do que a tela mostra enquanto o Demo local está "nada vai ao PLC"). */
const plcAtivoAgora=()=>srvUsaPlc()?BANCOS_PLC.some(b=>LINK.bancoOk(b.id)):(SRVM.plcOk&&Date.now()-SRVM.plcOkTs<8000);
let _plcSondaBusy=false;
async function srvSondaPlc(){
  const base=srvBase();
  if(!base){SRVM.plcOk=false;if($('dlgDemo').open)dmAtualiza();return}
  if(_plcSondaBusy)return;_plcSondaBusy=true;
  try{
    const rs=await Promise.all(BANCOS_PLC.map(async b=>{
      const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),2500);
      try{const r=await fetch(base+'/api/chaves/'+rotaDe(b.id),{cache:'no-store',signal:ctl.signal});clearTimeout(t);
        if(!r.ok)return false;const j=await r.json().catch(()=>null);return !!(j&&Array.isArray(j.habilitada));}
      catch(e){clearTimeout(t);return false}
    }));
    SRVM.plcOk=rs.some(Boolean);SRVM.plcOkTs=Date.now();
  }catch(e){SRVM.plcOk=false}
  finally{_plcSondaBusy=false;if($('dlgDemo').open)dmAtualiza()}
}
setInterval(()=>{if($('demo').checked&&!srvUsaPlc())srvSondaPlc()},3000); // só sonda quando precisa (Demo local): fora dele o PLC já é lido por outro caminho

const srvUsaPlc=()=>!$('demo').checked||SRVM.plc;
const srvChave=()=>!$('demo').checked?'real':(SRVM.plc?'demoPlc':'demoLocal');
const srvUrlPadrao=()=>(location.protocol==='http:'||location.protocol==='https:')&&location.origin&&location.origin!=='null'?location.origin:'';
const srvLimpaUrl=u=>String(u||'').trim().replace(/\/+$/,'');
(function(){
  const ler=k=>{try{return srvLimpaUrl(localStorage.getItem(k))}catch(e){return ''}};
  const salvo=ler('medidor.srvUrl'),antiga=ler('medidor.chUrl')||ler('medidor.ensUrl'),pad=srvLimpaUrl(srvUrlPadrao());
  if(salvo){SRVM.url=salvo;SRVM.urlOrigem='salva'}
  else if(antiga){SRVM.url=antiga;SRVM.urlOrigem='migrada';try{localStorage.setItem('medidor.srvUrl',antiga)}catch(e){}}
  else if(pad){SRVM.url=pad;SRVM.urlOrigem='origem'}
})();
const srvBase=()=>srvLimpaUrl(SRVM.url);
/* v1.10.167 (segurança, achado F2-3): o endereço do DSE NÃO tem IP fixo no HTML. Por padrão ele é a própria origem da página
   (/api/gerador no mesmo Node-RED que serve esta tela). Uma customização vai só para o localStorage do navegador (chave medidor.dseUrl). */
const DSE_CHAVE='medidor.dseUrl';
const dseUrlPadrao=()=>(location.protocol==='http:'||location.protocol==='https:')&&location.origin&&location.origin!=='null'?location.origin+'/api/gerador':'';
const dseUrl=()=>{try{const c=srvLimpaUrl(localStorage.getItem(DSE_CHAVE));if(c)return c}catch(e){}return dseUrlPadrao()};
function dseSalvaUrl(v){ // v vazio ou igual ao padrão = volta ao padrão (remove a customização)
  const t=srvLimpaUrl(v);
  try{if(!t||t===dseUrlPadrao())localStorage.removeItem(DSE_CHAVE);else localStorage.setItem(DSE_CHAVE,t)}catch(e){}
  $('url').value=dseUrl();
}
(()=>{const i=$('url');if(i){i.value=dseUrl();i.addEventListener('change',()=>dseSalvaUrl(i.value))}})();   // campo mostra o endereço efetivo; edição manual vai ao localStorage
function srvSalvaUrl(v){ // v vazio = volta ao padrão (mesma origem da página)
  v=srvLimpaUrl(v);
  try{if(v)localStorage.setItem('medidor.srvUrl',v);else localStorage.removeItem('medidor.srvUrl')}catch(e){}
  if(v){SRVM.url=v;SRVM.urlOrigem='salva'}
  else{const p=srvLimpaUrl(srvUrlPadrao());SRVM.url=p;SRVM.urlOrigem=p?'origem':'nenhuma'}
  if(typeof ensDesenhaBarra==='function'){ensDesenhaBarra();ensPoll()}
  if(srvUsaPlc()&&typeof window.chAtualizaDoPlc==='function')window.chAtualizaDoPlc();
  SRVM.plcOk=false;SRVM.plcOkTs=0; // v1.9.67: URL mudou -> invalida a confirmação anterior na hora (senão plcAtivoAgora() ficava "ok" por até 8 s com o endereço ERRADO)
  if(typeof dmAtualiza==='function')dmAtualiza();
  if(!srvUsaPlc())srvSondaPlc();
}
/* Troca de modo: devolve a tela a uma condição segura (janelas fechadas, Setup desmarcado, chaves desligadas, falha de motor desarmada). Chamada por start() e por demoAplica().
   SRVM.manual=true quando a troca foi pedida pelo operador dentro do popup Demo (ele continua aberto); no desligamento automático tudo fecha. */
function srvVerModo(){
  const novo=srvChave(),antes=SRVM.mk,manual=SRVM.manual;SRVM.manual=false;
  if(novo===antes)return false;
  SRVM.mk=novo;
  SIM_FALHA_MOTOR=false;if(novo==='real')SIM_FALHA_MOTOR_ARMADA=false;
  if(typeof window.chModoSeguro==='function')window.chModoSeguro({eraPlc:antes!=='demoLocal',serPlc:novo!=='demoLocal',manterDemo:manual});
  else document.querySelectorAll('dialog[open]').forEach(d=>{if(!(manual&&d.id==='dlgDemo')){try{d.close()}catch(e){}}});
  return true;
}

/* ===== NODE-RED DE SELEÇÃO: modo manual/automático, gravação das etapas e LEITURA DE VOLTA =====
   Tudo que a tela mostra como "salvo" vem de GET /api/ensaio/snap (SNAP[] é só um espelho dessa leitura).
   Contrato HTTP (mesma origem do HTML):
     (v1.9.64: rotas no padrão /api/; flow registro-ensaio-db53-api-v1.4.json)
     GET  /api/ensaio/modo                 -> {flow, modo, bt, ts}
     POST /api/ensaio/modo {modo}          -> {ok, modo}                    modo = 'manual' | 'auto'
     POST /api/ensaio/snap/preenchimento {campos:{...}}                     -> {ok}
     POST /api/ensaio/snap/etapa {etapa:<alvo %>, indice:<1..N>, valores:{...}, confirmado:true} -> {ok}
     GET  /api/ensaio/snap                 -> {flow, modo, preenchimento, etapas:[{etapa, indice, salva, valores}], lidoEm}
     POST /api/ensaio/snap/limpar {confirmado:true}                         -> {ok}
   Os POST só valem com ok:true; mesmo assim a etapa só é marcada "salva" se a leitura de volta trouxer a etapa. */
ENS={
  get fonte(){return srvUsaPlc()?'nodered':'mock'},set fonte(v){}, // v1.9.66: derivada do modo (Demo local = 'mock'; real e Demo + PLC = 'nodered')
  fonteAtiva:null,
  base:'',                      // (obsoleto desde a v1.9.64: usar ensBase())
  url:'',                       // (obsoleto desde a v1.9.66: a URL é a única SRVM.url / srvBase())
  tmoGet:4000,tmoPost:10000,    // timeouts (ms)
  modo:{pedido:null,conf:null,bt:null,ts:null,flow:null,estado:'consulta',erro:'',em:0}, // estado: consulta | envia | ok | erro; flow = v1.9.68
  snap:null,snapEm:0,snapErro:'',
  pend:{},                      // i -> {estado:'envia'|'erro',erro,rec,conf}
  meta:{},                      // i -> {t1,t2,n} (horários/resalvas que ESTA tela registrou; o contrato não os carrega)
  prea:{estado:'nenhum',erro:'',serie:''}, // nenhum | envia | ok | semConf | erro | desat
  aviso:'',fila:Promise.resolve(),escrevendo:0,seq:0,subm:false,polling:false
};
