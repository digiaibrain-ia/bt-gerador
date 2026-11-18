
/* ----- gancho chamado a cada ciclo da tela ----- */
let salvarManual=true; // ensaio 100% manual: cada etapa só é salva (e avança) com o clique do operador
/* v1.10.120 — SALVAMENTO "POR PATAMAR" (corrige o conceito da 1.10.119).
   PARA QUE SERVE (leigo): são três jeitos de salvar — Manual (operador clica), Automático (tudo sozinho) e Por patamar. No "Por patamar" a etapa é salva
   e avança sozinha quando o tempo cumpre; cada patamar escolhe só como as CHAVES ENTRAM: Manual (operador aplica a sugestão) ou Auto (o sistema aplica).
   POR QUE ASSIM (técnico): salvarManual continua sendo o único gatilho do "esperar SALVAR" (false em Automático e em Por patamar), então o núcleo do ensaio
   não muda. PORPAT liga a regra nova; APLICA_PAT guarda o modo de cada patamar {índice da etapa: 'M'|'A'}, padrão 'M' (o operador decide). */
let PORPAT=false;
try{PORPAT=localStorage.getItem('medidor.porPatamar')==='1'}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
if(PORPAT)salvarManual=false;
const APLICA_PAT={};
try{Object.assign(APLICA_PAT,JSON.parse(localStorage.getItem('medidor.aplicaPat.v1')||'{}'))}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
let APL_ET=-1;   // etapa cujas chaves o operador (ou a mãe) já aplicou neste ensaio
const salvaManualEt=i=>salvarManual;
const modoAplicaEt=i=>PORPAT?(APLICA_PAT[i]==='A'?'A':'M'):'A';
/** Muda o modo de aplicação de UM patamar. Não mexe no patamar em andamento nem nos já passados (a mãe já decidiu). */
function setAplicaEt(i,m){
  if(!PORPAT||MODO==='carga')return false;
  if(T.started&&!T.fim&&i<=T.et){msgGer(i===T.et?'Este patamar está em andamento: o modo dele não muda agora.':'Este patamar já passou.',5000);return false}
  APLICA_PAT[i]=m==='A'?'A':'M';
  try{localStorage.setItem('medidor.aplicaPat.v1',JSON.stringify(APLICA_PAT))}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
  return true}
/** Situação do APLICAR (usada pelo botão do cabeçalho e publicada pela mãe virtual). liberado = há sugestão esperando o operador. */
function aplicarInfo(){
  const i=Math.min(T.et,ETAPAS.length-1),modo=modoAplicaEt(i),alvo=ETAPAS[i].alvo,r={et:i,modo,liberado:false,motivo:'',alvoPct:alvo,cargaPct:(typeof carga==='number'&&dadoOk)?carga:null};
  if(!T.started||T.fim){r.motivo='ensaio não iniciado';return r}
  if(!PORPAT){r.motivo='as chaves entram pelo Patamar Guiado (salvamento não é "Por patamar")';return r}
  if(alvo<=0){r.motivo='patamar sem carga';return r}
  if(modo!=='M'){r.motivo='patamar Auto: as chaves entram sozinhas';return r}
  if(APL_ET===i){r.motivo='sugestão aplicada';return r}
  r.liberado=true;r.motivo='sugestão tracejada no card Cargas: ajuste se quiser e clique em Aplicar';return r}
/** v1.10.218: true = patamar MANUAL ainda sem Aplicar: o relogio/estabilizacao da etapa espera (a carga do patamar anterior pode estar dentro da tolerancia do novo e contar sozinha). */
window.PATAMAR_AGUARDA_APLICAR=()=>{try{
  if(aplicarInfo().liberado===true)return true;   // manual e ainda sem Aplicar
  const i=Math.min(T.et,ETAPAS.length-1);
  if(!(PORPAT&&T.started&&!T.fim&&ETAPAS[i].alvo>0&&modoAplicaEt(i)==='M'))return false;
  if(typeof carga!=='number'||!dadoOk)return false;   // sem leitura valida: nao segura (o relogio ja nao corre sem leitura)
  const banda=window.PATAMAR_BANDA_PP?window.PATAMAR_BANDA_PP():3;
  return Math.abs(carga-ETAPAS[i].alvo)>banda;   // v1.10.219: aplicado, mas a carga ainda nao chegou ao degrau
}catch(e){return false}};
(function(){
  try{const v=localStorage.getItem('medidor.salvarManual');if(v!==null)salvarManual=v==='1'}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
  // v1.9.33: o botão "Salvar etapa: manual/automático" foi para o popup "⚙ Modo" (mdSalva); aqui só o estado
  /* v1.10.120: três modos — 'M' manual, 'A' automático, 'P' por patamar (grava e avança sozinho; o patamar escolhe como as chaves entram). */
  window.__setSalvaModo=m=>{if(genLigado()){msgGer(MSG_GEN_LIGADO);return}
    PORPAT=m==='P';salvarManual=m==='M';
    try{localStorage.setItem('medidor.salvarManual',salvarManual?'1':'0');localStorage.setItem('medidor.porPatamar',PORPAT?'1':'0')}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
    if(!salvarManual)T.aguarda=false;
    try{window.__aoMudarSalva&&window.__aoMudarSalva()}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }};
  window.__setSalvarManual=v=>window.__setSalvaModo(v?'M':'A');
  $('bSalv').onclick=()=>{ // salvar a etapa em andamento (dentro da tolerância); fora dela abre o registro explicando
    if(!T.started||T.fim)return;
    const i=T.et;
    if(podeSalvar(i))salvaEAvanca(i);else abreEtapa(i);
  };
})();
window.__atualizaJanelas=()=>{
  try{const gl=genLigado();if(gl!==window.__gl){window.__gl=gl;ensDesenhaBarra()}if($('dlgModo').open&&window.__marcaModo)window.__marcaModo()}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ } // v1.9.35/36: trava/destrava os modos conforme o gerador (defensivo: nunca trava o resto da tela)
  const bf=$('bFim');bf.classList.toggle('pede',!!T.aguardaFim&&!T.fim);
  /* v1.10.103: FINALIZAR na mesma condição do SALVAR. Salvamento AUTOMÁTICO: cumpridas e gravadas (conferidas no PLC) todas as etapas, o ensaio
     finaliza sozinho. Salvamento manual: continua no clique. Se alguma etapa não foi gravada, nada é feito sozinho (o botão segue disponível).
     INTERPRETAÇÃO do pedido "considere Finalizar na mesma condição do botão Salvar" — a confirmar com o operador. */
  if(!salvaManualEt(ETAPAS.length-1)&&MODO!=='carga'&&T.started&&T.aguardaFim&&!T.fim&&!T.afAgendado&&ETAPAS.every((e,i)=>SNAP[i])){
    T.afAgendado=true;const tt=T;
    setTimeout(()=>{if(T===tt&&!salvaManualEt(ETAPAS.length-1)&&T.aguardaFim&&!T.fim)finalizaManual()},1500);
  }
  const bs=$('bSalv');bs.disabled=!T.started||T.fim||!!T.aguardaFim||!!(ENS.pend[T.et]&&ENS.pend[T.et].estado==='envia');bs.classList.toggle('pede',!!T.aguarda&&!SNAP[T.et]&&!T.fim);
  bs.title=T.started&&!T.fim?'Salvar os valores da etapa '+(T.et+1):'Salvar os valores da etapa em andamento';
  $('bZerTudo').style.display=(T.fim&&MODO!=='carga')?'':'none'; // só aparece depois do ensaio finalizado; opcional, pro operador apagar tudo antes do próximo START
  if($('dlgEtapa').open)atualizaEtapa();
  if($('dlgGrand').open)atualizaGrand();
  if($('dlgMotor').open)atualizaMotor();
  $('resStop').style.display=$('demo').checked?'':'none';
  rgBotao();
  if($('dlgRes').open){$('resStop').disabled=$('bGenStop').disabled;const ge=$('gEstado').textContent;$('resGer').textContent='Gerador: '+ge;$('resGer').className='jger '+(/operando/i.test(ge)?'on':/partindo|parando/i.test(ge)?'part':'off')}
};
