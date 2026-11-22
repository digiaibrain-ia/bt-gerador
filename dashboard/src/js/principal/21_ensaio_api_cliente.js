/* v1.9.66: URL base do Node-RED do registro do ensaio = a única URL do servidor (SRVM.url). Vazia só quando a página foi aberta como arquivo e ninguém informou. */
const ensBase=()=>srvBase();
const ensUsaMock=()=>ENS.fonte==='mock';
class ErroEns extends Error{constructor(tipo,msg){super(msg);this.tipo=tipo}}
const ensMsgErro=e=>e&&e.message?e.message:String(e);
const nz=x=>{if(x==null||x==='')return null;const n=Number(x);return isNaN(n)?null:n};
const hms=d=>{d=d instanceof Date?d:new Date(d);return isNaN(d)?'–':pad2(d.getHours())+':'+pad2(d.getMinutes())+':'+pad2(d.getSeconds())};

/* ----- chamada HTTP com timeout e validação ----- */
function ensValida(m,okHttp,status,j){
  const msg=j&&typeof j==='object'?(j.erro||j.error||j.msg||j.mensagem||j.motivo):null;
  if(!okHttp)throw new ErroEns('http',`Node-RED respondeu HTTP ${status}${msg?': '+msg:''}${status===404?' — a rota /api/ensaio/… não existe nesse Node-RED: importe o flow registro-ensaio-db53-api-v1.4 (e apague a aba antiga "Selecao do ensaio")':''}`);
  if(j===null||typeof j!=='object')throw new ErroEns('resposta','a resposta do Node-RED não é um JSON válido');
  if(m==='POST'&&j.ok!==true)throw new ErroEns('recusa',msg?String(msg):'o Node-RED respondeu ok:false');
  return j;
}
async function ensFetch(m,p,b){
  if(ensUsaMock()){const r=await mockFetch(m,p,b);return ensValida(m,r.status>=200&&r.status<300,r.status,r.json)}
  const base=ensBase();
  if(!base&&location.protocol==='file:')throw new ErroEns('semurl','o HTML foi aberto como arquivo (file://) e não há URL do Node-RED: abra o botão Demo (senha) e informe a URL no campo Servidor (ex.: http://localhost:1880)');
  const tmo=m==='GET'?ENS.tmoGet:ENS.tmoPost,ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),tmo);
  const tout=()=>new ErroEns('timeout',`sem resposta do Node-RED em ${tmo/1000} s (timeout)`);
  try{
    let r,j=null;
    try{
      r=await fetch(base+p,{method:m,cache:'no-store',signal:ctl.signal,headers:b!==undefined?{'Content-Type':'application/json'}:undefined,body:b!==undefined?JSON.stringify(b):undefined});
      try{j=await r.json()}catch(e){if(e&&e.name==='AbortError')throw e;j=null}
    }catch(e){throw e&&e.name==='AbortError'?tout():new ErroEns('rede','Node-RED fora do ar ou sem rede ('+(e&&e.message||'falha de conexão')+')')}
    return ensValida(m,r.ok,r.status,j);
  }finally{clearTimeout(t)}
}
function ensEscreve(fn){ // uma gravação de cada vez; o poll de leitura espera
  ENS.escrevendo++;ENS.seq++;
  const p=ENS.fila.then(fn);
  ENS.fila=p.catch(()=>{}).then(()=>{ENS.escrevendo--;ENS.seq++});
  return p;
}
async function ensGetSnap(){
  const j=await ensFetch('GET','/api/ensaio/snap');
  if(!Array.isArray(j.etapas))throw new ErroEns('resposta','a leitura de volta (GET /ensaio/snap) veio sem a lista "etapas"');
  return j;
}

/* ----- fonte (Node-RED real × simulador local): trocar de fonte limpa o que foi lido da outra ----- */
function ensVerFonte(){
  const f=ensUsaMock()?'mock':'nodered';
  if(ENS.fonteAtiva===f)return;
  const antes=ENS.fonteAtiva;ENS.fonteAtiva=f;
  if(antes===null)return;
  ENS.snap=null;ENS.snapErro='';ENS.snapEm=0;ENS.aviso='';ENS.pend={};ENS.meta={};
  ENS.modo={pedido:null,conf:null,bt:null,ts:null,flow:null,estado:'consulta',erro:'',em:0};
  ENS.prea={estado:'nenhum',erro:'',serie:''};
  SNAP.length=0;ensDesenhaBarra();ensDesenhaStrip();ensPoll();
}

/* ----- modo manual / automático ----- */
const ensNormModo=m=>{const s=String(m==null?'':m).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();return /^man/.test(s)?'manual':/^aut/.test(s)?'auto':s};
const ensRotuloModo=m=>m==='manual'?'MANUAL':m==='auto'?'AUTOMÁTICO':String(m||'?').toUpperCase();
const ensModoTravado=()=>MODO!=='carga'&&T.started&&!T.gravado;
async function ensLeModo(){
  try{
    const j=await ensFetch('GET','/api/ensaio/modo'),m=ensNormModo(j.modo);
    if(!m)throw new ErroEns('resposta','o Node-RED não informou o modo (campo "modo" vazio)');
    Object.assign(ENS.modo,{conf:m,bt:j.bt!=null?j.bt:null,ts:j.ts!=null?j.ts:null,flow:j.flow||null,estado:'ok',erro:'',em:Date.now()}); // v1.9.68: guarda o flow pro popup 🧪 Cards x flow
    return true;
  }catch(e){Object.assign(ENS.modo,{conf:null,bt:null,ts:null,estado:'erro',erro:ensMsgErro(e),em:Date.now()});return false}
  finally{ensDesenhaBarra()}
}
async function ensGarantiaModo(){ // antes de gravar: pergunta de novo ao Node-RED qual é o modo efetivo
  if(!(await ensLeModo()))throw new ErroEns('modo','modo manual/automático não confirmado — '+ENS.modo.erro);
}
async function ensTrocaModo(m){
  if(genLigado()){msgGer(MSG_GEN_LIGADO);return}
  if(ensModoTravado()){msgGer('O modo só pode ser trocado antes de iniciar o ensaio (ou depois de ZERAR / gravar o relatório).');return}
  ENS.modo.pedido=m;ENS.modo.estado='envia';ensDesenhaBarra();
  try{
    await ensEscreve(()=>ensFetch('POST','/api/ensaio/modo',{modo:m}));
    const ok=await ensLeModo(); // a confirmação é o GET, não a resposta do POST
    if(ok&&ENS.modo.conf!==m){ENS.modo.estado='erro';ENS.modo.erro=`foi pedido ${ensRotuloModo(m)}, mas o Node-RED informa ${ensRotuloModo(ENS.modo.conf)}`}
  }catch(e){
    const msg=ensMsgErro(e);
    await ensLeModo(); // mostra o modo que o Node-RED informa de verdade (ou o erro dessa leitura)
    ENS.modo.estado='erro';ENS.modo.erro=`o pedido de ${ensRotuloModo(m)} falhou: ${msg}`;
  }
  ensDesenhaBarra();
  await ensLeSnap();
}

/* ----- leitura de volta → SNAP[] (espelho) ----- */
const ensSalva=en=>!!en&&(en.salva===true||en.salva===1||en.salva==='true');
function ensMapa(j){ // liga cada etapa local (índice i) à entrada da leitura de volta
  const ets=(j.etapas||[]).filter(x=>x&&typeof x==='object'),temIdx=ets.some(x=>x.indice!=null),mapa=[];
  const dup=ETAPAS.some((e,i)=>ETAPAS.some((f,k)=>k!==i&&f.alvo===e.alvo));
  ETAPAS.forEach((e,i)=>{
    let en=null;
    if(temIdx)en=ets.find(x=>+x.indice===i+1)||null;
    else if(ets.length===ETAPAS.length)en=ets[i];
    else{const iguais=ETAPAS.map((f,k)=>k).filter(k=>ETAPAS[k].alvo===e.alvo),cand=ets.filter(x=>+x.etapa===e.alvo);en=cand[iguais.indexOf(i)]||null}
    if(en&&en.etapa!=null&&+en.etapa!==e.alvo)en=null; // nunca atribui uma etapa de outra carga
    mapa[i]=en;
  });
  ENS.aviso=(!temIdx&&dup&&ets.length)?'O Node-RED não devolveu "indice" nas etapas: as etapas de mesma carga (0 %) foram atribuídas por ordem. Peça para devolver o campo "indice".':'';
  return mapa;
}
function ensRecDeSnap(v,i,lidoEm){
  const r={kw:nz(v.potencia),tc:nz(v.tempMotor),va:nz(v.Va),vb:nz(v.Vb),vc:nz(v.Vc),ia:nz(v.Ia),ib:nz(v.Ib),ic:nz(v.Ic),rpm:nz(v.rpm),bat:nz(v.bateria),pc:nz(v.cargaReal),estab:nz(v.tEstab),tempo:nz(v.cronometro)};
  const m=ENS.meta[i],lt=lidoEm&&!isNaN(new Date(lidoEm))?new Date(lidoEm):new Date();
  r.t1=m?m.t1:lt;r.t2=m?m.t2:lt;r.n=m?m.n:0;r.alAgua=nivelAgua(r.tc);
  return r;
}
function ensAplicaSnap(j){
  ENS.snap=j;ENS.snapEm=Date.now();ENS.snapErro='';
  const mapa=ensMapa(j);
  ETAPAS.forEach((e,i)=>{const en=mapa[i];if(ensSalva(en))SNAP[i]=ensRecDeSnap(en.valores||{},i,j.lidoEm);else delete SNAP[i]});
  ensDesenhaStrip();
}
async function ensLeSnap(){ // poll: ignora a resposta se uma gravação começou/terminou enquanto ela viajava
  if(ENS.escrevendo)return false;
  const s0=ENS.seq;
  try{
    const j=await ensGetSnap();
    if(ENS.escrevendo||ENS.seq!==s0)return false;
    ensAplicaSnap(j);return true;
  }catch(e){
    if(!ENS.escrevendo&&ENS.seq===s0){ENS.snapErro=ensMsgErro(e);ensDesenhaStrip()}
    return false;
  }
}
async function ensPoll(){
  if(ENS.polling||ENS.escrevendo||ENS.modo.estado==='envia')return;
  ENS.polling=true;
  try{ensVerFonte();await ensLeModo();await ensLeSnap();desenha()}finally{ENS.polling=false}
}

/* ----- gravação da etapa (salvar / resalvar / reenviar) ----- */
function valoresAgora(){ // média dos últimos JANELA_S s lidos (qualquer etapa): vale para salvar e para resalvar
  const ps=C.pts;if(!ps.length)return null;
  let sel=ps.filter(p=>p.t>=C.t-JANELA_S);if(!sel.length)sel=[ps[ps.length-1]];
  const r={};
  ['kw','tc','va','vb','vc','ia','ib','ic','rpm','bat'].forEach(k=>{
    const v=sel.map(p=>p.m[k]).filter(x=>x!=null&&!isNaN(x));
    r[k]=v.length?v.reduce((a,b)=>a+b,0)/v.length:null;
  });
  r.pc=sel.reduce((a,p)=>a+p.c,0)/sel.length;
  return r;
}
function ensRecEtapa(i){ // registro desta etapa com a leitura atual (ainda NÃO gravado)
  const r=valoresAgora();if(!r)return null;
  const antes=SNAP[i],agora=new Date();
  r.estab=i===T.et?(T.estavel>=ESTAB[i]?ESTAB[i]:T.estavel):(antes?antes.estab:ESTAB[i]);
  r.t1=antes?antes.t1:agora;r.t2=agora;r.n=antes?(antes.n||0)+1:0;r.alAgua=nivelAgua(r.tc);
  r.tempo=i===T.et?T.el:(antes&&antes.tempo!=null?antes.tempo:durS(i)); // tempo realmente cumprido na etapa (s)
  return r;
}
function ensValoresDe(r){ // registro local → "valores" do contrato (s para tEstab e cronometro; ausente = null)
  const n=x=>x==null||isNaN(x)?null:Math.round(Number(x)*1000)/1000;
  return {cargaReal:n(r.pc),potencia:n(r.kw),tempMotor:n(r.tc),Va:n(r.va),Vb:n(r.vb),Vc:n(r.vc),Ia:n(r.ia),Ib:n(r.ib),Ic:n(r.ic),rpm:n(r.rpm),bateria:n(r.bat),tEstab:n(r.estab),cronometro:n(r.tempo)};
}
function ensConfere(env,got){ // '' se a leitura de volta bate com o enviado; senão o 1º campo que não bate
  for(const k of Object.keys(env)){
    const a=env[k];if(a==null)continue;const b=nz(got&&got[k]);
    if(b==null)return `${k}: enviado ${a}, a leitura de volta não trouxe valor`;
    if(Math.abs(a-b)>Math.max(0.05,Math.abs(a)*0.005))return `${k}: enviado ${a}, lido de volta ${b}`;
  }
  return '';
}
async function ensEnviaEtapa(i,rec,conf){ // nunca lança: devolve true só se a leitura de volta confirmou
  if(MODO==='carga')return false;
  const alvo=ETAPAS[i].alvo,valores=ensValoresDe(rec);
  ENS.pend[i]={estado:'envia',erro:'',rec,conf};desenha();
  try{
    await ensEscreve(async()=>{
      await ensGarantiaModo();
      await ensFetch('POST','/api/ensaio/snap/etapa',{etapa:alvo,indice:i+1,valores,confirmado:conf});
      const j=await ensGetSnap(),en=ensMapa(j)[i];
      if(!ensSalva(en)){ensAplicaSnap(j);throw new ErroEns('leitura','o Node-RED respondeu ok, mas a leitura de volta NÃO traz a etapa salva')}
      const dif=ensConfere(valores,en.valores);
      if(dif){ensAplicaSnap(j);throw new ErroEns('leitura','a leitura de volta não confere com o que foi enviado ('+dif+')')}
      ENS.meta[i]={t1:rec.t1,t2:rec.t2,n:rec.n};
      ensAplicaSnap(j);
    });
    delete ENS.pend[i];
    if(ensUsaMock())T.simulado=true; // gravou no simulador local: relatório sai marcado como simulação
    desenha();return true;
  }catch(e){
    ENS.pend[i]={estado:'erro',erro:ensMsgErro(e),rec,conf};
    msgGer(`Etapa ${i+1} (${alvo} %) NÃO foi salva: ${ensMsgErro(e)}`);
    desenha();return false;
  }
}
async function gravaEtapa(i,conf){ // clique do operador (conf=true) ou salvamento automático escolhido por ele
  if(conf===undefined)conf=true;
  if(ENS.pend[i]&&ENS.pend[i].estado==='envia')return false;
  const rec=ensRecEtapa(i);
  if(!rec){msgGer('Ainda não há leitura para salvar.');return false}
  return ensEnviaEtapa(i,rec,conf);
}
function ensReenvia(i){const p=ENS.pend[i];if(p&&p.estado==='erro')return ensEnviaEtapa(i,p.rec,true)}
async function salvaEAvanca(i){ // salvar a etapa em andamento e SÓ DEPOIS da confirmação passar para a próxima
  const ok=await gravaEtapa(i);
  if(ok&&i===T.et&&T.started&&!T.fim&&!T.aguardaFim)avancaEtapa();
  desenha();return ok;
}
function salvaAgora(i){return gravaEtapa(i)} // usado por FINALIZAR (o clique é a confirmação)
const podeSalvar=i=>faixaCarga(i)&&liberadoTempo(i);

/* ----- preenchimento (1ª parte, vem do SAP) ----- */
function ensCamposPreench(){
  const eq={},v=x=>(x==null||x==='-')?'':String(x);
  DADOS.equip.forEach(r=>{eq[String(r[0]).toLowerCase()]={fabricante:v(r[1]),modelo:v(r[2]),serie:v(r[3])}});
  return Object.assign({serie:DADOS.serie,versao:DADOS.versao,data:DADOS.data||hojeTxt(),fase:DADOS.fase,frequenciaHz:DADOS.freq,tensaoV:DADOS.tensao,tempAmbienteC:DADOS.tamb,potenciaKw:DADOS.pot,equipamentos:eq},window.__DADOS_ORIGEM||{}); // v1.10.203: + origemDados/ns (opcionais)
}
async function ensEnviaPreench(){
  const campos=ensCamposPreench();
  ENS.prea={estado:'envia',erro:'',serie:campos.serie};ensDesenhaBarra();
  try{
    await ensEscreve(async()=>{
      await ensGarantiaModo();
      await ensFetch('POST','/api/ensaio/snap/preenchimento',{campos});
      const j=await ensGetSnap();ensAplicaSnap(j);
      const p=j.preenchimento,c=p&&typeof p==='object'?(p.campos&&typeof p.campos==='object'?p.campos:p):null;
      if(!c||c.serie==null||c.serie==='')ENS.prea={estado:'semConf',erro:'a leitura de volta não trouxe o preenchimento',serie:campos.serie};
      else if(String(c.serie).trim()!==String(campos.serie).trim()||(c.versao!=null&&String(c.versao).trim()!==String(campos.versao).trim()))throw new ErroEns('leitura',`a leitura de volta traz série "${c.serie}" / versão "${c.versao}" e foi enviado "${campos.serie}" / "${campos.versao}"`);
      else ENS.prea={estado:'ok',erro:'',serie:campos.serie};
    });
    if(ensUsaMock())T.simulado=true;
  }catch(e){ENS.prea={estado:'erro',erro:ensMsgErro(e),serie:campos.serie};msgGer('Preenchimento NÃO gravado no PLC: '+ensMsgErro(e))}
  ensDesenhaBarra();ensDesenhaStrip();
}

/* ----- novo ensaio: confirmar com o operador e apagar o anterior no PLC (POST /ensaio/snap/limpar) ----- */
async function ensPreparaNovo(avisoLocal,confirmaLocal){ // true = pode seguir com o ensaio novo
  const s=ENS.snap,sabe=!!s&&!ENS.snapErro;
  const ets=s&&Array.isArray(s.etapas)?s.etapas.filter(ensSalva):[];
  const pre=!!(s&&s.preenchimento&&typeof s.preenchimento==='object');
  if(sabe&&!ets.length&&!pre)return confirmaLocal?confirm('Zerar o ensaio? '+avisoLocal):true;
  const onde=ENS.modo.conf?`DB SNAP ${ensRotuloModo(ENS.modo.conf)}`:'DB SNAP (modo não confirmado)';
  const o=sabe?`O PLC (${onde}) ainda guarda ${ets.length} etapa(s) salva(s)${pre?' e o preenchimento':''} do ensaio anterior.`
              :`Não foi possível ler o que o PLC guarda do ensaio anterior (${ENS.snapErro||'sem leitura'}).`;
  if(!confirm(`Novo ensaio\n\n${avisoLocal?avisoLocal+'\n\n':''}${o}\n\nApagar o ensaio anterior no PLC e começar de novo?`))return false;
  try{
    await ensEscreve(async()=>{
      await ensGarantiaModo();
      await ensFetch('POST','/api/ensaio/snap/limpar',{confirmado:true});
      const j=await ensGetSnap();ensAplicaSnap(j);
      if(j.etapas.some(ensSalva))throw new ErroEns('leitura','o Node-RED respondeu ok, mas a leitura de volta ainda mostra etapas salvas');
    });
    ENS.meta={};ENS.pend={};ENS.prea={estado:'nenhum',erro:'',serie:''};ensDesenhaBarra();
    return true;
  }catch(e){
    return confirm(`NÃO foi possível apagar o ensaio anterior no PLC:\n${ensMsgErro(e)}\n\nContinuar mesmo assim, só na tela? (as etapas antigas continuam no PLC e aparecem na tabela até serem apagadas)`);
  }
}
async function ensLimpaSilenciosa(){ // igual ao ensPreparaNovo, mas SEM perguntar: usada ao clicar START ENSAIO pra começar um ensaio novo (o operador já decidiu ao clicar). Nunca bloqueia o início.
  try{
    await ensEscreve(async()=>{
      await ensGarantiaModo();
      await ensFetch('POST','/api/ensaio/snap/limpar',{confirmado:true});
      const j=await ensGetSnap();ensAplicaSnap(j);
    });
    ENS.meta={};ENS.pend={};ENS.prea={estado:'nenhum',erro:'',serie:''};ensDesenhaBarra();
  }catch(e){
    msgGer('Aviso: não foi possível apagar o ensaio anterior no PLC agora ('+ensMsgErro(e)+'). O ensaio novo começa mesmo assim; use "ZERAR" se as etapas antigas continuarem aparecendo.',12000);
  }
}

/* ----- desenho: barra do modo e faixa sob a tabela ----- */
function ensDesenhaBarra(){
  const M=ENS.modo,rot=ensRotuloModo,trav=ensModoTravado();
  ['manual','auto'].forEach(m=>{
    const b=$('ensM_'+m),on=M.conf===m;
    b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');
    if(m==='auto'){
      // v1.9.29: a pedido do operador — "Automático" fica bloqueado por enquanto (prioridade é validar o MANUAL
      // do BT2). Só informação ao passar o mouse, sem popup/ação nenhuma; não mexe no estado confirmado pelo Node-RED.
      b.disabled=true;
      b.title='Modo automático: disponível futuramente. Por enquanto, use somente o Manual.';
    }else{
      b.disabled=M.estado==='envia'||trav||genLigado();
      b.title=genLigado()?MSG_GEN_LIGADO:trav?'O modo só pode ser trocado antes de iniciar o ensaio (ou depois de ZERAR / gravar o relatório)':`Pedir ao Node-RED o modo ${rot(m)} (a tela só mostra o que ele confirmar)`;
    }
  });
  const c=$('ensModo');let cls='enschip',t;
  if(M.estado==='envia')t=`Enviando ${rot(M.pedido)}… aguardando a confirmação do Node-RED`;
  else if(M.estado==='erro'){cls+=' err';t=M.conf?`✗ ${M.erro}`:`✗ SEM CONFIRMAÇÃO do Node-RED: ${M.erro}`}
  else if(M.conf){cls+=' ok';t=`Node-RED confirma: ${rot(M.conf)}${M.bt?' · '+M.bt:''} · ${hms(M.em)}`}
  else t='consultando o Node-RED…';
  if(c.className!==cls)c.className=cls;setTxt(c,t);c.title=M.ts!=null?'ts do Node-RED: '+M.ts:'';
  $('ensMock').style.display=ensUsaMock()?'':'none';
  const P=ENS.prea,pc=$('ensPrea');let pcls='enschip',pt_;
  const pre=ENS.snap&&ENS.snap.preenchimento&&typeof ENS.snap.preenchimento==='object'?(ENS.snap.preenchimento.campos||ENS.snap.preenchimento):null;
  if(P.estado==='envia')pt_='Preenchimento: enviando…';
  else if(P.estado==='ok'){pcls+=' ok';pt_=`Preenchimento ✓ conferido no PLC (série ${P.serie})`}
  else if(P.estado==='semConf'){pcls+=' err';pt_='Preenchimento ✗ enviado, mas a leitura de volta não trouxe a série — clique para reenviar'}
  else if(P.estado==='erro'){pcls+=' err';pt_='Preenchimento ✗ NÃO gravado: '+P.erro+' — clique para reenviar'}
  else if(P.estado==='desat'){pcls+=' err';pt_='Preenchimento: alterado na tela, não enviado ao PLC — clique para enviar'}
  else pt_=pre&&pre.serie?`Preenchimento no PLC: série ${pre.serie}`:'Preenchimento: ainda não enviado';
  if(pc.className!==pcls)pc.className=pcls;setTxt(pc,pt_);
  pc.style.cursor=/clique/.test(pt_)?'pointer':'';
  // v1.10.103: indicador discreto no cabeçalho (ⓘ ✓ / ⓘ ✗ / ⓘ SIM); o detalhe fica no painel do ⓘ
  const ib=$('ensInfo');
  if(ib){
    const errM=M.estado==='erro',errP=P.estado==='semConf'||P.estado==='erro'||P.estado==='desat',mock=ensUsaMock();
    let cl='enschip',tx;
    if(errM||errP){cl+=' err';tx='ⓘ ✗'}else if(mock){cl+=' mock';tx='ⓘ SIM'}else if(M.conf){cl+=' ok';tx='ⓘ ✓'}else tx='ⓘ …';
    if(ib.className!==cl)ib.className=cl;setTxt(ib,tx);
    ib.title=(mock?'SIMULADOR LOCAL (as gravações não vão ao PLC) · ':'')+t+' · '+pt_+' — clique para ver os detalhes';
  }
}
function ensDesenhaStrip(){
  const el=$('ensStrip');if(!el)return;
  const h=[];
  if(MODO==='carga'){el.innerHTML='';return}
  const s=ENS.snap;
  if(s){
    const n=ETAPAS.filter((e,i)=>SNAP[i]).length;
    h.push(`<span class="${ENS.snapErro?'':'k'}">Lido de volta do PLC (${esc(ensRotuloModo(ensNormModo(s.modo||ENS.modo.conf)))}) às ${hms(ENS.snapEm)} · ${n} de ${ETAPAS.length} etapas salvas${ensUsaMock()?' · SIMULADOR LOCAL':''}${!T.started&&n?' · (dados de ensaio anterior — INICIAR começa um ensaio novo e apaga estes dados do PLC)':''}</span>`);
  }else h.push(`<span class="a">${ENS.snapErro?'':'Aguardando a primeira leitura de volta do Node-RED… '}A tabela só mostra etapa como salva depois que o Node-RED a devolver.</span>`);
  if(ENS.snapErro)h.push(`<span class="e">✗ Sem leitura de volta agora: ${esc(ENS.snapErro)}${s?' — a tabela mostra a última leitura bem-sucedida':''}.</span>`);
  Object.keys(ENS.pend).map(Number).sort((a,b)=>a-b).forEach(i=>{
    const p=ENS.pend[i];if(!ETAPAS[i])return;
    if(p.estado==='erro')h.push(`<span class="e">✗ Etapa ${i+1} (${ETAPAS[i].alvo} %) NÃO salva: ${esc(p.erro)}</span>`);
    else h.push(`<span class="a">Etapa ${i+1} (${ETAPAS[i].alvo} %): gravando e conferindo a leitura de volta…</span>`);
  });
  if(ENS.aviso)h.push(`<span class="a">⚠ ${esc(ENS.aviso)}</span>`);
  const html=h.join('<br>');
  if(el.innerHTML!==html)el.innerHTML=html;
}
