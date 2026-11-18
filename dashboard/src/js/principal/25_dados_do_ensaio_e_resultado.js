function montaEquip(){
  $('dEquip').innerHTML='<thead><tr><th></th><th>Fabricante</th><th>Modelo</th><th>Nº de série</th></tr></thead><tbody>'+
    DADOS.equip.map((r,i)=>`<tr><td>${esc(r[0])}</td>`+[1,2,3].map(c=>`<td><input data-r="${i}" data-c="${c}" autocomplete="off"></td>`).join('')+'</tr>').join('')+'</tbody>';
}
function preencheDados(o){ // coloca os dados de "o" nos campos da janela
  $('dServ').value=o.serie||'';$('dVer').value=o.versao||'';$('dData').value=hojeTxt();
  montaEquip();
  (o.equip||[]).forEach((r,i)=>[1,2,3].forEach(c=>{const el=$('dEquip').querySelector(`input[data-r="${i}"][data-c="${c}"]`);if(el)el.value=r[c]==null?'':r[c]}));
  // Modelo do Controlador: não vem mais automático da API/gerador — só por print (OCR) ou digitado à mão.
  $('dlgDados').querySelectorAll('input[name=dFase]').forEach(r=>{r.checked=r.value===(o.fase||DADOS.fase)});
  $('dFreq').value=o.freq==null?'':o.freq;$('dTens').value=o.tensao==null?'':o.tensao;$('dTamb').value=o.tamb==null?'':o.tamb;$('dPot').value=o.pot==null?'':o.pot;
  $('dErr').textContent='';
  $('dlgDados').querySelectorAll('.duv').forEach(e=>e.classList.remove('duv'));
}
function abreDados(ini){
  const d=$('dlgDados');
  preencheDados(Object.assign({},DADOS,{data:DADOS.data||hojeTxt()}));
  if(DADOS.data)$('dData').value=DADOS.data;
  d.dataset.ini=ini?'1':'';$('dOk').textContent=ini?'Iniciar ensaio':'Salvar dados';
  $('sapLimpa').onclick();
  d.showModal();
}
$('dLimpa').onclick=()=>{ // apaga tudo (menos o que vem do DSE) para digitar do zero
  preencheDados({serie:'',versao:'',equip:DADOS.equip.map(r=>[r[0],'','','']),fase:DADOS.fase});
  $('dServ').focus();
};
$('dRepete').onclick=()=>{ // traz de volta os dados do último ensaio: o operador só corrige o que mudou
  preencheDados(ULTIMO||DADOS);$('dServ').focus();$('dServ').select();
};
$('bDados').onclick=()=>abreDados(false);
(function(){ // v1.10.103: painel do ⓘ (detalhes de conexão) — fecha com ✕, Esc ou clique fora
  const b=$('ensInfo'),p=$('ensInfoPop');if(!b||!p)return;
  const abre=v=>{p.classList.toggle('open',v);b.setAttribute('aria-expanded',v?'true':'false')};
  b.addEventListener('click',e=>{e.stopPropagation();abre(!p.classList.contains('open'))});
  $('ensInfoX').addEventListener('click',()=>abre(false));
  document.addEventListener('pointerdown',e=>{if(p.classList.contains('open')&&!p.contains(e.target)&&e.target!==b)abre(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&p.classList.contains('open'))abre(false)});
})();
// v1.10.103: Carregar gerador padrão — volta ao gerador do Demo (único preenchimento completo) e esquece o modelo do catálogo
$('dPadrao').onclick=()=>{
  window.DADOS_MODELO=null;window.__potAnterior='';
  try{localStorage.removeItem('medidor.modeloEscolhido')}catch(x){}
  const box=$('dCat'),f=box&&box.querySelector('[data-c=m]');
  if(f)f.innerHTML='Gerador padrão do Demo carregado (sem modelo do catálogo). Para outro gerador, digite abaixo parte do nome (ex.: 260 220 60).';
  if(box)box.classList.remove('escolhido');
  preencheDados(JSON.parse(JSON.stringify(DADOS_DEMO)));
  $('dErr').textContent='';
};
['dServ','dVer','dData','dFreq','dTens','dTamb','dPot'].forEach(id=>$(id).addEventListener('input',()=>{$('dErr').textContent=''}));
['aAt','aCr'].forEach(id=>$(id).addEventListener('input',()=>{$('aMsg').textContent=''}));
function novoEnsaio(){ // zera tudo para um ensaio novo (igual ao ZERAR)
  T={run:false,started:false,et:0,el:0,estavel:0,fim:false,parcial:false,sp:T.sp,last:Date.now()};SIM_FALHA_MOTOR=false;/*v1.9.13:zerou o ensaio,a falha volta a esperar o próximo degrau de 30%*/
  chartReset();sorteiaEstab();if(auto)simReset();msgGer('');desenha();
}
function iniciaEnsaio(){ // primeiro início de um ensaio novo confirma os dados; depois de pausar, retoma direto
  if(MODO==='carga'){iniciaCron();return} // só teste de carga: não pede dados nem registra
  if(T.fim&&!T.gravado)return; // terminou e ainda não foi gravado: use "Gravar ensaio" (ou ZERAR)
  if(!T.started||T.fim){
    if(dadosConfirmados()&&!$('dlgDados').open){iniciaComDadosSalvos();return} // v1.10.0: Dados do ensaio já confirmados nesta sessão: não reabre
    if(!$('dlgDados').open)abreDados(true)
  }else iniciaCron();
}
/* v1.10.0: "Dados do ensaio" confirmados -> INICIAR não reabre o diálogo. Guardado em sessionStorage (vale para esta aba/sessão, inclusive ao recarregar;
   não vale em outra aba nem no dia seguinte). Apaga-se ao GRAVAR o ensaio (gerador novo = dados novos). Para mudar: botão "Dados do ensaio". */
const dadosConfirmados=()=>{try{return sessionStorage.getItem('medidor.dadosConf.'+DADOS_MODO)==='1'}catch(x){return false}};
const dadosConfMarca=v=>{try{if(v)sessionStorage.setItem('medidor.dadosConf.'+DADOS_MODO,'1');else sessionStorage.removeItem('medidor.dadosConf.'+DADOS_MODO)}catch(x){}};
function iniciaComDadosSalvos(){ // mesmo caminho do botão "Iniciar ensaio" do diálogo, com os campos preenchidos pelos dados já salvos
  if(ENS.subm)return;ENS.subm=true;
  preencheDados(Object.assign({},DADOS,{data:DADOS.data||hojeTxt()}));if(DADOS.data)$('dData').value=DADOS.data;
  $('dlgDados').dataset.ini='1';
  fDadosSubmit().catch(x=>{msgGer('Não consegui iniciar com os dados salvos: '+ensMsgErro(x)+' — abra "Dados do ensaio".');dadosConfMarca(false)}).finally(()=>{ENS.subm=false});
}
$('bIni').onclick=clickIniciar; // v1.9.24: INICIAR assume a função completa (antes só chamava iniciaEnsaio(), sem ligar o gerador simulado no demo)
$('fDados').onsubmit=e=>{e.preventDefault();if(ENS.subm)return;ENS.subm=true;fDadosSubmit().catch(x=>{$('dErr').textContent='Erro: '+ensMsgErro(x)}).finally(()=>{ENS.subm=false})};
async function fDadosSubmit(){
  const serie=$('dServ').value.trim(),versao=$('dVer').value.trim(),data=$('dData').value.trim();
  const freq=NUM($('dFreq').value),tens=NUM($('dTens').value),tamb=NUM($('dTamb').value),pot=NUM($('dPot').value);
  // v1.9.18: a pedido do operador, "Dados do ensaio" não bloqueia mais START/confirmação por campo vazio/inválido,
  // nem no ensaio real — a janela sempre libera; só avisa (sem travar) o que ficou faltando, pra preencher depois.
  const dataOk=!data||/^\d{2}[./]\d{2}[./]\d{4}$/.test(data);
  const faltando=[];
  if(!serie)faltando.push('nº de série');
  if(!versao)faltando.push('versão do teste');
  if(!dataOk)faltando.push('data (formato inválido — ignorada)');
  if(isNaN(freq))faltando.push('frequência');
  if(isNaN(tens))faltando.push('tensão');
  if(isNaN(tamb))faltando.push('temperatura ambiente');
  if(isNaN(pot))faltando.push('potência');
  const ini=$('dlgDados').dataset.ini==='1';
  if(ini&&MODO!=='carga')await ensLimpaSilenciosa(); // novo ensaio: apaga o anterior no PLC sem perguntar (o operador já decidiu ao clicar em START ENSAIO)
  const equip=DADOS.equip.map((r,i)=>[r[0],...[1,2,3].map(c=>$('dEquip').querySelector(`input[data-r="${i}"][data-c="${c}"]`).value.trim()||'-')]);
  const fase=($('fDados').querySelector('input[name=dFase]:checked')||{}).value||DADOS.fase;
  const dataNorm=dataOk&&data?(data.replace(/\//g,'.')===hojeTxt()?'':data.replace(/\//g,'.')):'';
  Object.assign(DADOS,{serie,versao,data:dataNorm,equip,fase,freq,tensao:tens,tamb,pot});
  try{localStorage.setItem('medidor.dados.'+DADOS_MODO,JSON.stringify({serie:DADOS.serie,versao:DADOS.versao,data:DADOS.data,equip:DADOS.equip,fase:DADOS.fase,freq,tensao:tens,tamb,pot}))}catch(x){}
  ULTIMO={serie:DADOS.serie,versao:DADOS.versao,equip:DADOS.equip,fase:DADOS.fase,freq,tensao:tens,tamb,pot};
  try{localStorage.setItem('medidor.dadosUltimo.'+DADOS_MODO,JSON.stringify(ULTIMO))}catch(x){}
  dadosConfMarca(true);
  $('dlgDados').close();
  if(ini){ // ensaio novo: limpa o histórico do anterior, mas NÃO começa a contar ainda — fica "armado" esperando o operador dar START de novo (quando ligar o gerador, por exemplo)
    if(T.fim)novoEnsaio();
    T.started=true;T.run=false;T.last=Date.now();
    // v1.9.26: a pedido do operador — se o gerador JÁ está confirmadamente operando no instante em que ele confirma
    // esta janela (ex.: ele ligou o gerador antes de preencher os Dados), não faz sentido exigir um 2º clique em
    // INICIAR logo em seguida só pra constatar o que já se sabe: o próprio clique em "Confirmar/Iniciar ensaio" aqui
    // já é a ação manual e deliberada do operador. Continua 100% manual quando o gerador AINDA não está operando —
    // nesse caso fica ARMADO como antes e o botão INICIAR pisca até o clique.
    if(MODO!=='carga'&&GEN.run===true)iniciaCron();
    msgGer(T.run?'Dados enviados ao PLC. Gerador já operando — cronômetro iniciado.'
      :faltando.length?'Ensaio ARMADO sem preencher: '+faltando.join(', ')+'. Pode completar depois em "Dados do ensaio" — clique em INICIAR quando quiser começar a contar o tempo.'
      :'Dados enviados ao PLC. O ensaio está ARMADO — clique em INICIAR quando quiser começar a contar o tempo.',15000);
    desenha();
  }
  if(MODO!=='carga'){ // 1ª parte (preenchimento do SAP) → Node-RED; o OK desta janela é a confirmação do operador
    if(ini)ensEnviaPreench();
    else if(T.started&&!T.gravado){
      if(ENS.prea.estado==='ok'||ENS.prea.estado==='semConf'){if(confirm('Reenviar o preenchimento ao PLC? Isso substitui o que já foi gravado.'))ensEnviaPreench();else{ENS.prea.estado='desat';ensDesenhaBarra()}}
      else ensEnviaPreench();
    }
  }
}

/* ----- janela: resultado do ensaio (antes de gravar o relatório) ----- */
function abreResultado(){
  const A=avaliaEnsaio(),{rows,t100,vmax,vmin,r1,r2,r3,fmax,fmin,r4,r5,pcSb,alvoSb,r6,final,completo}=A;
  $('resTag').textContent=`Nº série ${DADOS.serie} · versão ${DADOS.versao}`;
  const cel=(v,d)=>v==null||isNaN(v)?'<td class="vz">–</td>':`<td>${pt(v,d)}</td>`;
  const dec={kw:1,tc:0,va:1,vb:1,vc:1,ia:0,ib:0,ic:0,rpm:0,bat:1};
  let h='<thead><tr><th>Etapa</th><th>Tempo</th><th>kW</th><th>°C motor</th><th>Va</th><th>Vb</th><th>Vc</th><th>Ia</th><th>Ib</th><th>Ic</th><th>RPM</th><th>Bat (V)</th></tr></thead><tbody>';
  const semReg=[];
  ETAPAS.forEach((e,i)=>{
    const r=rows[i];if(!r)semReg.push(i+1);
    const tempo=r?fmt(r.tempo!=null?r.tempo:durS(i)):'–';
    h+=`<tr><td>${e.alvo} %</td><td>${tempo}</td>`+['kw','tc','va','vb','vc','ia','ib','ic','rpm','bat'].map(k=>cel(r?r[k]:null,dec[k])).join('')+'</tr>';
  });
  $('resTab').innerHTML=h+'</tbody>';
  const av=$('resAviso');
  if(semReg.length){av.className='jmsg av';av.textContent=`Ensaio incompleto — etapa${semReg.length>1?'s':''} sem registro: ${semReg.join(', ')}.`}
  else{av.className='jmsg';av.textContent=''}
  const temTensaoRes=isFinite(DADOS.tensao)&&DADOS.tensao>0; // v1.9.18: tensão agora pode não ter sido informada
  const dev=v=>(v==null||!temTensaoRes)?'–':(v>=DADOS.tensao?'+':'−')+pt(Math.abs((v/DADOS.tensao-1)*100),1)+' %';
  const temFreqRes=isFinite(DADOS.freq)&&DADOS.freq>0; // v1.9.77
  const devF=v=>(v==null||!temFreqRes)?'–':pt(v,2)+' Hz ('+(v>=DADOS.freq?'+':'−')+pt(Math.abs((v/DADOS.freq-1)*100),1)+' %)';
  const bdg=r=>r==='N/A'?'<span class="bdg">não se aplica</span>':r==='APROVADO'?'<span class="bdg ok">APROVADO</span>':r==='REPROVADO'?'<span class="bdg cr">REPROVADO</span>':'<span class="bdg">a definir</span>';
  $('resCond').innerHTML=
    `<tr><td>Tempo em carga 100 % (mínimo ${fmt(T100_MIN)})</td><td>${fmt(t100)}</td><td>${bdg(r1)}</td></tr>`+
    `<tr><td>Tensão: desvio máximo de +${pt(TENS_TOL,1)} % sobre o nominal (${temTensaoRes?pt(DADOS.tensao,0)+' V':'tensão não informada'})</td><td>${dev(vmax)}</td><td>${bdg(r2)}</td></tr>`+
    `<tr><td>Tensão: desvio mínimo de −${pt(TENS_TOL,1)} % sob o nominal</td><td>${dev(vmin)}</td><td>${bdg(r3)}</td></tr>`+
    // v1.9.77: frequência e stand-by
    `<tr><td>Frequência: desvio máximo de +${pt(FREQ_TOL,1)} % sobre o nominal (${temFreqRes?pt(DADOS.freq,0)+' Hz':'frequência não informada'})</td><td>${devF(fmax)}</td><td>${bdg(r4)}</td></tr>`+
    `<tr><td>Frequência: desvio máximo de −${pt(FREQ_TOL,1)} % sob o nominal</td><td>${devF(fmin)}</td><td>${bdg(r5)}</td></tr>`+
    (alvoSb==null?'':`<tr><td>Potência em Stand-by (${alvoSb} %): mínimo ${pt(STBY_MIN,0)} % de carga aplicada</td><td>${pcSb==null?'–':pt(pcSb,1)+' %'}</td><td>${bdg(r6)}</td></tr>`);
  $('resFinal').textContent=`Resultado final: ${final}`+(completo?'':' (ensaio não concluído)')+(A.porDse?' · condições definidas pelo DSE simulado':'');
  const d=$('dlgRes');if(!d.open)d.showModal();
}
let gravadoComPdf=true; // usado só no texto do evento do Registro (Amostras) — não afeta a gravação em si
$('resOk').onclick=()=>{
  gravadoComPdf=true;if(!T.autoImp)gerarPdf();$('dlgRes').close();   // v1.10.107: se a impressão automática já gerou, não gera de novo
  if(T.fim){T.gravado=true;dadosConfMarca(false);try{if(window.PATAMAR_ENSAIO_GRAVADO)window.PATAMAR_ENSAIO_GRAVADO()}catch(x){console.error('Patamar Guiado: ensaio gravado',x)};desenha()} // gravado: cronômetro volta a 00:00 e o histórico fica na tela até o próximo START (v1.10.0: gerador novo = dados novos)
};
$('resOkSemPdf').onclick=()=>{ // grava o ensaio (entra no acervo/registro normalmente) sem gerar o PDF
  gravadoComPdf=false;$('dlgRes').close();
  if(T.fim){T.gravado=true;dadosConfMarca(false);try{if(window.PATAMAR_ENSAIO_GRAVADO)window.PATAMAR_ENSAIO_GRAVADO()}catch(x){console.error('Patamar Guiado: ensaio gravado',x)};desenha()}
};
$('resStop').onclick=()=>$('bGenStop').click(); // parar o gerador sem sair da janela
$('bPdf').onclick=abreResultado;

/* ----- finalizar ensaio: confirmação no padrão das janelas ----- */
$('fFim').onsubmit=e=>{e.preventDefault();$('dlgFim').close();finalizaManual()};
$('bFim').onclick=()=>{ // todas as etapas salvas: finaliza direto; senão pede confirmação
  if(!T.started||T.fim||!T.aguardaFim)return; // bloqueado até o final do teste
  if(ETAPAS.every((e,i)=>SNAP[i]))finalizaManual();else $('dlgFim').showModal();
};
