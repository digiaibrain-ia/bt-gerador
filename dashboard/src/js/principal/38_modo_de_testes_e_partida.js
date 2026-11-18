
let testeDesbloqueado=false; // SÓ TESTE: senha única pra abrir a popup "Demo" nesta aba (v1.9.11)
/* v1.9.68: popup 🧪 Cards x flow — lista os flows do Node-RED de que o HTML depende. Usa os códigos de Card que já existem no HTML (CARDS/SEC/CAT: bco, reg). */
const DEV_FLOWS=[
  ...BANCOS.map(b=>({card:'bco',nome:'Cargas · BC'+b.id+' (chaves)',esp:'chaves-v2.5',visto:()=>(LINK.banco[b.id]||{}).flow||null,visivel:()=>!!LINK.banco[b.id]})),   // v1.10.156: um por banco
  {card:'reg',nome:'Registro do ensaio (DB53)',esp:'registro-ensaio-v1.4',visto:()=>ENS.modo.flow,visivel:()=>ENS.modo.estado!=='consulta'},
  {card:'DEV',nome:'Dev · Logs (observabilidade) [DEV.OBS]',esp:'dev-logs-v1.0',visto:()=>window.devObs?window.devObs.flowVisto():null,visivel:()=>!!(window.devObs&&window.devObs.publicou())}, // v1.9.73
];
const DEV_CARD_NOMES={bco:'Banco de Cargas',reg:'Registro do ensaio',DEV:'Ferramentas de desenvolvedor'}; // v1.9.68: cópia mínima dos rótulos (CARDS é const dentro do módulo OCOR, sem escopo global)
function devCardsRender(){
  $('devCardsCorpo').innerHTML=DEV_FLOWS.map(f=>{
    const nomeC=DEV_CARD_NOMES[f.card]||f.card,visto=f.visto();
    let st,cor;
    if(!f.visivel()){st='sem leitura ainda';cor='#8a94a3'}
    else if(visto==null){st='flow ANTIGO (sem campo flow)';cor='#b91c1c'}
    else if(visto!==f.esp){st='flow desatualizado';cor='#b45309'}
    else{st='OK';cor='#0f766e'}
    return `<tr style="border-bottom:1px solid var(--jborda,#e4e9ef)"><td style="padding:4px 6px">${esc(nomeC)} <small style="color:#8a94a3">[${f.card}]</small><br><small>${esc(f.nome)}</small></td><td style="padding:4px 6px"><code>${esc(f.esp)}</code></td><td style="padding:4px 6px"><code>${esc(visto==null?'—':visto)}</code></td><td style="padding:4px 6px;color:${cor};font-weight:600">${esc(st)}</td></tr>`;
  }).join('');
}
$('bDevCards').onclick=()=>{devCardsRender();$('dlgDevCards').showModal()};
setInterval(()=>{if($('dlgDevCards').open)devCardsRender()},1000);

function limpaIndicadoresDemo(){ // v1.9.15: esconde na hora os badges que só a leitura (demo ou real) preenche — sem isso eles ficam com o valor antigo
  // até a PRÓXIMA leitura real chegar (que pode demorar, falhar, ou nem chegar se a rede estiver ruim). Mesma limpeza do catch() do tick().
  $('pMotorAl').style.display='none';
  $('pModo').textContent='—';
  $('pModelo').textContent='—';
}
const ensaioRodando=()=>!!(T.started&&!T.fim);
/* v1.9.66: estado visível do popup e do botão Demo. O Demo fica TRAVADO enquanto o DSE real está conectado (dadoOk fora do Demo) ou com ensaio em andamento. */
function dmAtualiza(){
  const demo=$('demo').checked,mk=srvChave(),trav=!demo&&dadoOk,rod=ensaioRodando(),url=srvBase();
  $('dmTradicional').checked=demo;$('dmPlc').checked=demo&&SRVM.plc;$('dmMotor').checked=SIM_FALHA_MOTOR_ARMADA;
  const plcOk=plcAtivoAgora();
  $('dmTradicional').disabled=trav||rod;$('dmPlc').disabled=!demo||rod||!plcOk;$('dmMotor').disabled=trav||rod&&!demo;
  const pi=$('dmPlcInfo');
  pi.style.display=(demo&&!rod&&!plcOk)?'':'none';
  pi.textContent=srvBase()?'PLC ainda não confirmado em '+srvBase()+' — verificando… (não dá pra ligar o PLC real do Demo sem leitura confirmada)':'Sem URL do Servidor configurada — informe-a acima para poder usar o PLC real no Demo.';
  const tr=$('dmTrava');
  tr.style.display=(trav||rod)?'':'none';
  tr.textContent=trav?'🔒 Demo travado: o DSE real está conectado (leitura válida). Para simular, desconecte o DSE (ou pare a leitura real).':(rod?'🔒 Há um ensaio em andamento: pare o ensaio antes de trocar de modo.':'');
  const e=$('dmEstado');
  const T3={real:['MODO REAL — DSE real, chaves e registro do ensaio no PLC'+(url?' ('+url+')':''),'#0f766e'],
            demoLocal:['DEMO LOCAL — DSE simulado; NADA vai ao PLC (chaves e registro ficam só neste navegador)','#b45309'],
            demoPlc:['DEMO + PLC — DSE simulado, mas chaves e registro do ensaio gravam de VERDADE no PLC'+(url?' ('+url+')':''),'#b91c1c']};
  e.textContent=T3[mk][0];e.style.borderColor=T3[mk][1];e.style.color=T3[mk][1];
  const b=$('bDemo'),txt={real:'Demo',demoLocal:'DEMO local',demoPlc:'DEMO + PLC'}[mk];
  if(b.textContent!==txt)b.textContent=txt;
  b.style.background={real:'#2a2a2a',demoLocal:'#b45309',demoPlc:'#b91c1c'}[mk];
  const inf=$('srvInfo'),o=SRVM.urlOrigem;
  inf.textContent=(mk==='demoLocal'?'Não usado agora (Demo local). ':'')+(!url?'Sem URL: a página foi aberta como arquivo (file://). Informe o endereço do Node-RED (ex.: http://localhost:1880).'
    :o==='origem'?'Padrão: o mesmo endereço de onde esta página foi aberta ('+url+'). Só mude se o Node-RED do PLC estiver em outro endereço.'
    :'Salvo neste navegador: '+url+(o==='migrada'?' (trazido da configuração antiga).':'.')+' Apague o campo para voltar ao padrão (mesmo endereço da página).');
  if(document.activeElement!==$('srvUrl'))$('srvUrl').value=SRVM.urlOrigem==='origem'?'':url;
  $('srvUrl').placeholder=SRVM.urlOrigem==='origem'?'vazio = '+url+' (mesmo endereço da página)':'ex.: http://<servidor>:1880';
}
function demoDesliga(){ // v1.9.14: PARAR ENSAIO também desliga a simulação — volta ao modo REAL (v1.9.66: inclui o "PLC real do Demo")
  if(!$('demo').checked&&!SIM_FALHA_MOTOR_ARMADA)return; // já estava desligado: nada a fazer
  SIM_FALHA_MOTOR_ARMADA=false;SIM_FALHA_MOTOR=false;SRVM.plc=false;
  if($('demo').checked){$('demo').checked=false;limpaIndicadoresDemo();
    // v1.10.113: o estado do gerador SIMULADO ('operando') ficava para trás e travava o popup ⚙ Modo / modos de operação (genLigado) até chegar leitura real.
    GEN={estado:'—',run:true};MED={};carga=null;dadoOk=false;
    SRVM.manual=true;start()}
  try{if(window.__atualizaJanelas)__atualizaJanelas();if(window.__marcaModo)__marcaModo()}catch(x){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }
  dmAtualiza();
}
function demoAplica(){ // sincroniza as checkboxes da popup Demo com o estado real (#demo, SRVM.plc, SIM_FALHA_MOTOR_ARMADA) e reinicia o motor do app se precisar
  const quer=$('dmTradicional').checked,querPlc=quer&&$('dmPlc').checked;
  if(quer&&!$('demo').checked&&dadoOk){ // v1.9.18: com o DSE real conectado (fora do demo e com leitura válida/recente, mesma variável dadoOk de ingest()/tick()), não deixa ligar a simulação. Bloqueio total.
    alert('Não é possível ligar o Demo: o DSE real está conectado e a leitura está válida. Para simular, pare a leitura real primeiro (desligue a URL/rede do Node-RED) ou desligue o DSE.');
    dmAtualiza();desenha();return;
  }
  if(ensaioRodando()&&(quer!==$('demo').checked||querPlc!==(SRVM.plc&&$('demo').checked))){ // v1.9.66: trocar de modo no meio do ensaio mistura dados simulados com reais
    alert('Há um ensaio em andamento. Pare o ensaio antes de trocar de modo (Demo / Demo + PLC / real).');
    dmAtualiza();return;
  }
  if(querPlc&&!plcAtivoAgora()){
    alert('Não é possível ligar "Usar o PLC real durante o Demo": o PLC ainda não respondeu em '+(srvBase()||'(sem URL)')+'. Confira o endereço do Servidor e aguarde a confirmação.');
    dmAtualiza();return;
  }
  if(querPlc&&!(SRVM.plc&&$('demo').checked)&&!confirm('DEMO + PLC REAL\n\nO DSE continua simulado, mas as chaves e o registro do ensaio vão GRAVAR DE VERDADE no PLC ('+(srvBase()||'sem URL')+').\nHá algo fisicamente ligado nos bancos de carga? Os contatores vão acionar.\n\nContinuar?')){
    dmAtualiza();return;
  }
  SIM_FALHA_MOTOR_ARMADA=quer&&$('dmMotor').checked;
  if(!SIM_FALHA_MOTOR_ARMADA)SIM_FALHA_MOTOR=false; // desarmou: para a falha na hora, mesmo que já tivesse disparado no degrau de 30%
  SRVM.plc=querPlc;SRVM.manual=true;
  if($('demo').checked!==quer){if(!quer)limpaIndicadoresDemo();$('demo').checked=quer;start()}else{srvVerModo();desenha()}
  dmAtualiza();
}
$('dmTradicional').addEventListener('change',()=>{
  if(!$('dmTradicional').checked){$('dmMotor').checked=false;$('dmPlc').checked=false} // ③ e o PLC do Demo dependem de ①
  demoAplica();
});
$('dmPlc').addEventListener('change',demoAplica);
$('dmMotor').addEventListener('change',()=>{
  if($('dmMotor').checked)$('dmTradicional').checked=true; // v1.9.13: ③ sozinha já liga ① (não precisa marcar os dois)
  demoAplica();
});
$('srvUrl').addEventListener('change',()=>{
  const v=$('srvUrl').value.trim();
  if(v&&!/^https?:\/\/\S+$/i.test(v)){alert('Informe a URL completa, começando com http:// ou https:// (ex.: http://<servidor>:1880).');dmAtualiza();return}
  srvSalvaUrl(v);
});
$('srvUrl').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('srvUrl').blur()}});
/* v1.10.165: MODO OPERADOR é o padrão ao abrir a página. O botão Demo só aparece depois de digitar a senha na caixa ao lado (antes: prompt() ao clicar,
   que não abria no celular). A senha é uma trava contra uso por engano — NÃO é segurança (está no código da página); segurança de verdade é o login do Node-RED. */
function desbloqueiaTestes(){
  testeDesbloqueado=true;
  $('demoSenha').style.display='none';$('demoSenha').value='';
  $('bDemo').style.display='';
  $('bDemoLock').style.display='';
  $('bDevCards').style.display='';
  $('bDevObs').style.display='';
  try{window.MENU_DEV&&MENU_DEV.mostra(true)}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }   // v1.10.109: menu ☰ de desenvolvimento acompanha o modo de testes
}
$('demoSenha').addEventListener('input',()=>{if($('demoSenha').value.trim().toLowerCase()==='mwm')desbloqueiaTestes()});
$('demoSenha').addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;e.preventDefault();
  if($('demoSenha').value.trim().toLowerCase()==='mwm')desbloqueiaTestes();
  else{const c=$('demoSenha');c.value='';c.style.borderColor='#d92d20';setTimeout(()=>{c.style.borderColor='#666'},900)}
});
$('bDemo').addEventListener('click',()=>{
  if(!testeDesbloqueado)return;   // (o botão nem aparece antes de desbloquear)
  dmAtualiza();
  if(!srvUsaPlc())srvSondaPlc();
  $('dlgDemo').showModal();
});
$('bDemoLock').onclick=()=>{ // desliga a senha: sai do Demo (se estiver nele) e trava de novo o modo de testes
  testeDesbloqueado=false;
  $('bDemo').style.display='none';$('demoSenha').style.display='';   // v1.10.165: volta ao MODO OPERADOR (botão Demo some, a caixa de senha volta)
  $('bDemoLock').style.display='none';
  $('bDevCards').style.display='none';
  try{window.MENU_DEV&&!MENU_DEV.automatico()&&MENU_DEV.mostra(false)}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }   // v1.10.109: travou os testes = esconde o menu ☰ (salvo se este navegador estiver marcado como dev)
  $('bDevObs').style.display='none';$('obsAbre').value='manual'; // v1.9.73: travou os testes = volta a abertura Manual e para de publicar (a publicação exige a senha)
  if($('dlgDevCards').open)$('dlgDevCards').close();
  SIM_FALHA_MOTOR=false;SIM_FALHA_MOTOR_ARMADA=false;SRVM.plc=false;
  if($('demo').checked){limpaIndicadoresDemo();$('demo').checked=false;SRVM.manual=true;start()}else desenha();
  dmAtualiza();
  $('dlgDemo').close();
};
/* v1.9.66: com o Demo ligado, a tela consulta o endereço do DSE a cada 5 s. Leitura válida (ok:true e idade <= MAX_IDADE, o mesmo critério de dadoOk) = DSE real
   conectado: o Demo se desliga sozinho e a tela volta a uma condição segura (janelas fechadas, chaves desligadas, ensaio simulado encerrado). */
let _sondaBusy=false,_sondaUlt=0;
async function demoSondaDse(){
  if(!$('demo').checked||_sondaBusy)return;
  const agora=Date.now();if(agora-_sondaUlt<5000)return;_sondaUlt=agora;
  _sondaBusy=true;const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),2500);
  try{
    const r=await fetch(dseUrl(),{cache:'no-store',signal:ctl.signal});
    if(!r.ok)return;
    const d=await r.json(),idade=Number(find(d,'idadeSegundos'));
    if(find(d,'ok')===true&&!isNaN(idade)&&idade<=MAX_IDADE&&$('demo').checked)demoDseRealDetectado(dseUrl());
  }catch(e){ /* ignorado: texto inválido: segue com o valor padrão */ }
  finally{clearTimeout(t);_sondaBusy=false}
}
function demoDseRealDetectado(url){
  const rodava=pararEnsaioSilencioso();
  SIM_FALHA_MOTOR_ARMADA=false;SIM_FALHA_MOTOR=false;SRVM.plc=false;SRVM.manual=false; // false: no desligamento automático TODAS as janelas fecham (inclusive o popup Demo)
  limpaIndicadoresDemo();$('demo').checked=false;
  start();
  const txt='Demo desligado automaticamente: um DSE real respondeu em '+url+' com leitura válida. Modo REAL ativo; chaves desligadas e janelas fechadas.'+(rodava?' O ensaio simulado em andamento foi encerrado.':'');
  if(window.OCOR)window.OCOR.set('med','DSE-002',txt,{ev:true,expira:600000});
  msgGer(txt);
}
setInterval(demoSondaDse,1000);
$('go').onclick=start;$('demo').onchange=start;start();desenha();fitZoom();setInterval(()=>{if($('dlgDemo').open)dmAtualiza()},1000);
