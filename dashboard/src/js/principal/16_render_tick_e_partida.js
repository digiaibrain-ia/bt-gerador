function render(d,idade){
  Object.keys(DEC).forEach(k=>set(k,find(d,k)));
  const ok=ingest(d,idade);
  window.__ultimoDado=d;aplicaAlarmes(d);
  drawBanco(bancoDados(d));
  drawGer(d);
  if(carga!=null){
    $('barCarga').style.width=Math.min(carga,120)/1.2+'%';
    $('txtCarga').textContent=pt(carga)+' %';
  }
  $('pModo').textContent=find(d,'modo')||'—';
  $('pModelo').textContent=find(d,'modeloConfigurado')||'—';
  const fe=findKey(d,'falhasEcu'),nfe=fe&&typeof fe==='object'?Number(fe.quantidade)||0:0,pm=$('pMotorAl');
  pm.style.display=nfe>0?'inline-block':'none';if(nfe>0)pm.textContent='⚠ MOTOR · '+nfe;
  pm.onclick=abreMotor;
  const p=$('pLeitura');p.className='pill '+(ok?'ok':'bad');
  p.textContent=ok?`Leitura ok · ${pt(idade)} s`:`Dado antigo · ${idade.toFixed(0)} s`;
  $('main').classList.toggle('stale',!ok);
  $('foot').textContent='Última atualização: '+new Date().toLocaleTimeString('pt-BR');
}
async function tick(){
  try{
    let d;
    if($('demo').checked)d=demoData();
    else{
      const r=await fetch(dseUrl(),{cache:'no-store'});
      LINK.dse.http=null;LINK.dse.diag=null;
      if(!r.ok){LINK.dse.http=r.status;try{const jb=await r.json();LINK.dse.diag=(jb&&jb.diag)||null}catch(e){}throw new Error('HTTP '+r.status+' do servidor de telemetria')} // v1.10.170: o 503 do /api/gerador traz o diag (status do Modbus) // v1.9.29 (ACH-13): antes não checava r.ok
      d=await r.json();
    }
    const idadeRaw=find(d,'idadeSegundos');
    // v1.9.29 (ACH-13): antes, "idadeSegundos" ausente virava 0 (parecia leitura fresca); agora exige o campo presente e numérico.
    if(idadeRaw==null||isNaN(Number(idadeRaw)))throw new Error('resposta sem "idadeSegundos" válido');
    LINK.dse.ok=true;LINK.dse.visto=true;LINK.dse.ts=Date.now();LINK.dse.http=200;LINK.dse.diag=(d&&d.diag)||null;
    render(d,Number(idadeRaw));
  }catch(e){
    LINK.dse.ok=false;LINK.dse.ts=Date.now();
    dadoOk=false;
    const p=$('pLeitura');p.className='pill bad';p.textContent='servidor/rede fora';
    $('main').classList.add('stale');
    $('foot').textContent='Erro: '+e.message+' (se for CORS, habilite no Node-RED)';
    // v1.9.12: sem dado novo, não dá pra confiar no que os badges mostravam antes (ex.: "⚠ MOTOR" de uma falha
    // simulada que já não existe mais) — esconde/zera em vez de deixar o último valor lido congelado na tela.
    $('pMotorAl').style.display='none';
    $('pModo').textContent='—';
    $('pModelo').textContent='—';
  }
}
function start(){
  carregaDados(); // demo/real têm dados próprios
  msgGer(''); // trocou demo/API (Aplicar): o aviso anterior não vale mais
  botoesGer();
  clearInterval(timer);
  $('sim').style.display=$('demo').checked?'block':'none';
  srvVerModo();dmAtualiza(); // v1.9.66: trocou demo/real (ou o Demo foi desligado): confere o modo e devolve a tela a uma condição segura
  fitZoom();
  timer=setInterval(tick,Math.max(500,$('seg').value*1000));tick();
}
/* ===== FERRAMENTAS DA BARRA SUPERIOR: modo escuro e tamanho da letra ===== */
(function(){
  const R=document.documentElement;
  const ler=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
  const gravar=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
  // modo escuro
  const setTema=(esc,salva)=>{
    if(esc)R.dataset.tema='escuro';else delete R.dataset.tema;
    $('bTema').setAttribute('aria-pressed',esc);{const bt=$('bTema');bt.innerHTML=esc?'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.3" fill="currentColor"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3 17 7M7 17l-1.7 1.7"/></g></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z" fill="currentColor"/></svg>';bt.title=esc?'Modo claro — clique para voltar ao tema claro':'Modo escuro — clique para ligar o tema escuro';bt.setAttribute('aria-label',esc?'Modo claro':'Modo escuro')}
    if(salva)gravar('medidor.tema',esc?'escuro':'claro');
    drawScreen();
  };
  $('bTema').onclick=()=>setTema(R.dataset.tema!=='escuro',true);
  setTema(ler('medidor.tema')==='escuro',false);
  // tamanho da letra
  const i0=parseInt(ler('medidor.escala'));if(i0>=0&&i0<ESCALAS.length)iEsc=i0;
  const rot=()=>{const m=escalaMax();$('bMenos').disabled=iEsc<=0;$('bMais').disabled=iEsc>=ESCALAS.length-1||ESCALAS[iEsc+1]>m+0.001;$('escTxt').textContent=Math.round(Math.min(ESCALAS[iEsc],m)*100)+'%'};window.rotEsc=rot;
  const muda=d=>{iEsc=Math.max(0,Math.min(ESCALAS.length-1,iEsc+d));gravar('medidor.escala',iEsc);rot();fitZoom();drawScreen()};
  $('bMenos').onclick=()=>muda(-1);$('bMais').onclick=()=>muda(1);rot();
})();

/* ===== LIMITES DA ÁGUA (janela de ajuste) ===== */
(function(){
  const dlg=$('dlgAgua');if(!dlg||!dlg.showModal)return;
  const msg=(t,ok)=>{$('aMsg').textContent=t;$('aMsg').classList.toggle('ok',!!ok)};
  $('bFaixaAgua').onclick=()=>{
    $('aAt').value=FAIXAS.tempAguaC.ok[1];$('aCr').value=FAIXAS.tempAguaC.av[1];msg('');
    dlg.showModal();$('aAt').select();
  };
  $('aFecha').onclick=()=>dlg.close();
  dlg.onclick=e=>{if(e.target===dlg)dlg.close()}; // clique fora da janela fecha
  $('aPadrao').onclick=()=>{$('aAt').value=AGUA_PADRAO.atencao;$('aCr').value=AGUA_PADRAO.critico;msg('')};
  $('fAgua').addEventListener('input',()=>msg('')); // v1.9.29: limpa o "✓ Salvo"/erro ao editar de novo (popup não fecha mais sozinha)
  $('fAgua').onsubmit=e=>{
    e.preventDefault(); // v1.9.29: Salvar (clique ou Enter) grava mas NÃO fecha mais a popup — fecha só pelo ✕ ou clique fora
    const at=Number($('aAt').value),cr=Number($('aCr').value);
    if(!isFinite(at)||!isFinite(cr)||$('aAt').value===''||$('aCr').value===''){msg('Preencha os dois valores.');return}
    if(at<0||cr>200){msg('Use valores entre 0 e 200 °C.');return}
    if(at>=cr){msg('O limite crítico precisa ser maior que o de atenção.');return}
    defineFaixaAgua(at,cr);
    try{localStorage.setItem('medidor.faixaAgua',JSON.stringify({atencao:at,critico:cr}))}catch(x){}
    if(window.__ultimoDado)aplicaAlarmes(window.__ultimoDado);
    msg('✓ Salvo.',true); // v1.9.29: popup continua aberta — operador fecha pelo ✕ quando quiser
  };
})();
