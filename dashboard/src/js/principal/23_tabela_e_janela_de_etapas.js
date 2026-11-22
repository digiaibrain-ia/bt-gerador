
/* ----- ligações da interface ----- */
(function(){
  ['manual','auto'].forEach(m=>$('ensM_'+m).onclick=()=>ensTrocaModo(m));
  $('ensPrea').onclick=()=>{
    if(!/clique/.test($('ensPrea').textContent))return;
    if(!DADOS.serie||!DADOS.versao){msgGer('Preencha os Dados do ensaio (nº de série e versão) antes de enviar.');return}
    ensEnviaPreench();
  };
  const info=()=>{
    document.querySelectorAll('input[name=srvFalha]').forEach(r=>r.checked=r.value===MOCK.falha);
    $('srvModoTroca').checked=MOCK.modoTroca;$('srvSemIdx').checked=MOCK.semIdx;
    $('srvMockBox').style.opacity=ensUsaMock()?'1':'.55';
  };
  $('dmFalhas').addEventListener('toggle',()=>{if($('dmFalhas').open){info();$('srvPre').style.display='none'}});
  document.querySelectorAll('input[name=srvFalha]').forEach(r=>r.onchange=()=>{if(r.checked)MOCK.falha=r.value});
  $('srvModoTroca').onchange=()=>{MOCK.modoTroca=$('srvModoTroca').checked};
  $('srvSemIdx').onchange=()=>{MOCK.semIdx=$('srvSemIdx').checked};
  $('srvLimpa').onclick=()=>{try{localStorage.removeItem('medidor.mock.plc')}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }$('srvPre').style.display='none';ensPoll()};
  $('srvVer').onclick=()=>{const p=$('srvPre');p.textContent=JSON.stringify(mockSnap(mockEstado()),null,1);p.style.display='block'};
  setInterval(ensVerFonte,500);
  setInterval(ensPoll,5000);
  ensVerFonte();ensDesenhaBarra();ensDesenhaStrip();ensPoll();
})();

/* ----- tabela do registro (linha "Salvar" por etapa + cabeçalho clicável) ----- */
function drawTabela(){
  ETAPAS.forEach((e,i)=>{
    const sv=SNAP[i],pd=ENS.pend[i],pEnv=!!pd&&pd.estado==='envia',pErr=!!pd&&pd.estado==='erro',cur=T.started&&!T.fim&&i===T.et,st=cur?'cur':sv?'done':'pend';
    const th=$('th'+i);setCls(th,pErr&&!sv?st+' err':st);
    setTxt(th.querySelector('small'),pEnv?'salvando…':pErr?(sv?'✓ salva · resalva falhou':'✗ não salva'):sv?(cur?'✓ salva · em andamento':'✓ salva'):cur?(T.run?'em andamento':'pausado'):'pendente');
    th.title=pErr?'Erro ao salvar: '+pd.erro:'Abrir o registro da etapa '+(i+1);
    LINHAS.forEach(([k,r,d])=>{
      const v=sv?sv[k]:cur?(k==='pc'?carga:MED[k]):null,c=$(`c_${k}_${i}`);
      setCls(c,st);setTxt(c,v==null||isNaN(v)?'–':pt(v,d));
    });
    const hc=$('c_estab_'+i),cc=$('c_cron_'+i);setCls(hc,st);setCls(cc,st);
    setTxt(hc,sv?(sv.estab==null?'–':pt(sv.estab,1)):cur?(T.estavel>=ESTAB[i]?pt(ESTAB[i],1):pt(T.estavel,1)+' / '+pt(ESTAB[i],1)):'–');
    setTxt(cc,sv&&!cur?fmt(sv.tempo!=null?sv.tempo:durS(i)):cur?fmt(T.el)+' / '+fmt(durS(i)):'meta '+fmt(durS(i)));
    const cs=$('c_sv_'+i),b=cs.firstChild;setCls(cs,st);
    if(pEnv){b.disabled=true;setCls(b,'svbtn');setTxt(b,'Salvando…');b.title='Gravando no Node-RED e conferindo a leitura de volta'}
    else if(sv){const ok=podeSalvar(i);b.disabled=!ok;setCls(b,'svbtn re');setTxt(b,'↻ Resalvar');b.title=ok?'Resalvar com a leitura atual (abre o registro da etapa)':`Para resalvar, ajuste a carga para ${e.alvo} % ± ${TOL}`}
    else if(cur){b.disabled=false;setCls(b,'svbtn'+(T.aguarda?' pede':''));setTxt(b,'Salvar');
      b.title=!faixaCarga(i)?`Ajuste a carga para ${e.alvo} % ± ${TOL} para salvar`:!liberadoTempo(i)?`SALVAR será liberado em ${fmt(Math.max(0,tempoLiberaSalvar(i)-T.el))}`:'Salvar os valores agora'}
    else if(pErr){b.disabled=false;setCls(b,'svbtn pede');setTxt(b,'↻ Reenviar');b.title='Reenviar os valores desta etapa. Erro anterior: '+pd.erro}
    else{b.disabled=true;setCls(b,'svbtn');setTxt(b,'Salvar');b.title=''}
  });
  ensDesenhaStrip();
  /* v1.10.163: a coluna da etapa em andamento fica À VISTA na tabela. POR QUÊ: em tela estreita (celular; 1280 px com 4 bancos) a tabela rola
     de lado e o "Salvar" das últimas etapas ficava escondido à direita. Só rola quando a etapa MUDA (o operador continua livre para rolar). */
  const tw=$('tb').parentElement;
  if(!T.started||T.fim)drawTabela.et=-1;
  else if(drawTabela.et!==T.et&&tw&&tw.clientWidth>0){
    drawTabela.et=T.et;
    const th=$('th'+T.et),c0=$('tb').querySelector('th');
    if(th&&c0&&tw.scrollWidth>tw.clientWidth+1)tw.scrollLeft=Math.max(0,th.offsetLeft-c0.offsetWidth-4);
  }
}
$('tb').onclick=e=>{
  const b=e.target.closest('.svbtn');
  if(b){
    if(b.disabled)return;
    const i=+b.dataset.i;
    if(SNAP[i])abreEtapa(i);
    else if(i===T.et&&T.started&&!T.fim){ if(podeSalvar(i))salvaEAvanca(i);else abreEtapa(i) }
    else if(ENS.pend[i]&&ENS.pend[i].estado==='erro')ensReenvia(i);
    return;
  }
  const th=e.target.closest('th[id^=th]');if(th)abreEtapa(+th.id.slice(2));
};
$('stages').onclick=e=>{const s=e.target.closest('.st');if(s)abreEtapa(+s.id.slice(2))};

/* ----- botões visíveis para abrir as janelas ----- */
const ICO=(p,n=15)=>`<svg viewBox="0 0 16 16" width="${n}" height="${n}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICONES={
  termo:ICO('<path d="M6.2 9.3V3.4a1.8 1.8 0 0 1 3.6 0v5.9a3.2 3.2 0 1 1-3.6 0z"/><path d="M8 5.2v5"/><circle cx="8" cy="11.6" r="1.1" fill="currentColor" stroke="none"/>'),   // limites da temperatura
  dados:ICO('<rect x="3" y="2.5" width="10" height="12" rx="1.5"/><path d="M6 2.5h4v2H6z"/><path d="M5.5 8h5M5.5 10.5h5"/>'),                                                  // dados do ensaio
  faixas:ICO('<path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"/><circle cx="5.5" cy="4.5" r="1.5" fill="currentColor"/><circle cx="10.5" cy="8" r="1.5" fill="currentColor"/><circle cx="6.5" cy="11.5" r="1.5" fill="currentColor"/>'),
  lista:ICO('<rect x="2.5" y="2.5" width="11" height="11" rx="1.5"/><path d="M5 6h6M5 8.5h6M5 11h3.5"/>',13)                                                                    // registro / resultado
};
$('bFaixaAgua').innerHTML=ICONES.termo;
(function(){
  const mk=(html,titulo,fn,cls)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.innerHTML=html;b.title=titulo;b.setAttribute('aria-label',titulo);b.onclick=e=>{e.stopPropagation();fn()};return b};
  // faixa do card "Etapas do ensaio": dados do ensaio
  $('ens').querySelector(':scope>h2').appendChild(mk(ICONES.dados+'<span>Dados do ensaio</span>','Abrir os dados do ensaio (nº de série, equipamento, tensão...)',()=>abreDados(false),'cfgbtn inl'));
  // faixa do card "Registro do ensaio": resultado
  $('tbTit').appendChild(mk(ICONES.lista+'<span>Resultado</span>','Abrir o resultado do ensaio (confira antes de gravar o relatório)',()=>abreResultado(),'cfgbtn inl'));
  // cabeçalho de cada etapa: registro da etapa
  /* v1.10.152: botões "Abrir" do cabeçalho do Registro retirados (a mesma função existe no card Etapas do ensaio) */
})();

/* ----- janela: registro da etapa ----- */
let janEtapa=0;
function abreEtapa(i){janEtapa=i;atualizaEtapa();const d=$('dlgEtapa');if(!d.open)d.showModal()}
function atualizaEtapa(){
  const i=janEtapa,e=ETAPAS[i],sv=SNAP[i],cur=T.started&&!T.fim&&i===T.et;
  const pendente=!sv&&!cur&&(i>T.et||(i===T.et&&!T.started));
  $('eTit').textContent=`Etapa ${i+1} · ${e.alvo} % — Registro`;
  // faixas de resumo
  const chips=[];
  chips.push(cur?`<span class="chip">Cronômetro ${fmt(T.el)} / ${fmt(durS(i))}</span>`
    :sv||i<T.et?`<span class="chip ok">Tempo cumprido ${fmt(sv&&sv.tempo!=null?sv.tempo:durS(i))}</span>`:`<span class="chip">Etapa não iniciada</span>`);
  if(sv){
    const n=sv.alAgua||0;
    chips.push(n===0?'<span class="chip ok">Sem alarmes ao salvar</span>'
      :`<span class="chip ${n===2?'cr':'av'}">Água em ${n===2?'estado crítico':'atenção'} ao salvar</span>`);
    chips.push(`<span class="chip">1ª gravação ${hhmm(sv.t1)} · última ${hhmm(sv.t2)} · ${sv.n?`resalva ${sv.n}×`:'sem resalva'}</span>`);
    chips.push('<span class="chip ok">Confirmada pela leitura de volta do PLC</span>');
  }else chips.push('<span class="chip">Sem registro salvo</span>');
  const pd=ENS.pend[i];
  if(pd&&pd.estado==='envia')chips.push('<span class="chip av">Gravando no Node-RED…</span>');
  if(pd&&pd.estado==='erro')chips.push('<span class="chip cr">✗ Erro ao salvar: '+esc(pd.erro)+'</span>');
  $('eChips').innerHTML=chips.join('');
  // tabela salvo × ao vivo
  const live=k=>k==='pc'?carga:MED[k];
  const cel=(v,d)=>v==null||isNaN(v)?'<td class="vz">–</td>':`<td>${pt(v,d)}</td>`;
  let h='<thead><tr><th>Grandeza</th><th>Salvo na etapa</th><th>Ao vivo</th></tr></thead><tbody>';
  LINHAS.forEach(([k,r,d])=>{
    const a=sv?sv[k]:null,b=live(k);
    h+=`<tr><td>${r}</td>${a==null||isNaN(a)?'<td class="vz">–</td>':`<td class="sv">${pt(a,d)}</td>`}${b==null||isNaN(b)?'<td class="vivo vz">–</td>':`<td class="vivo">${pt(b,d)}</td>`}</tr>`;
  });
  h+=`<tr><td>Tempo de estabilidade (s)</td>${sv?`<td class="sv">${pt(sv.estab,1)}</td>`:'<td class="vz">–</td>'}<td class="vivo">${cur?pt(Math.min(T.estavel,ESTAB[i]),1)+' / '+pt(ESTAB[i],1):'–'}</td></tr></tbody>`;
  $('eTab').innerHTML=h;
  // botão de salvar / resalvar
  const b=$('eRes'),faixa=faixaCarga(i),tempoOk=liberadoTempo(i),pode=faixa&&tempoOk;
  const verbo=sv?'Resalvar':'Salvar';
  if(pd&&pd.estado==='envia'){b.disabled=true;b.textContent='Gravando no Node-RED…'}
  else if(pendente){b.disabled=true;b.textContent='Etapa ainda não iniciada'}
  else if(!faixa){b.disabled=true;b.textContent=`${verbo} · ajuste a carga para ${e.alvo} % ± ${TOL}`}
  else if(!tempoOk){b.disabled=true;b.textContent=`Salvar liberado em ${fmt(Math.max(0,tempoLiberaSalvar(i)-T.el))}`}
  else{b.disabled=false;b.textContent=`${verbo} com a leitura atual`}
  $('eMsg').textContent=pendente||pode?'':(!faixa?'A leitura ao vivo precisa estar dentro da tolerância da etapa (e o gerador em operação) para gravar.':`Neste tipo de ensaio o SALVAR é liberado a partir de ${LIB} % do tempo da etapa (${fmt(tempoLiberaSalvar(i))}).`);
}
$('eRes').onclick=()=>{
  const i=janEtapa,sv=SNAP[i];if(!podeSalvar(i))return;
  if(sv){
    $('rsTit').textContent=`Substituir o registro da etapa ${i+1}?`;
    $('rsTxt').innerHTML=`O registro de <b>${hhmm(sv.t2)}</b> será substituído pela leitura atual.<br>A etapa passará a mostrar <b>resalva ${(sv.n||0)+1}×</b>; o horário da 1ª gravação é mantido.`;
    $('dlgResalva').showModal();
  }else salvaEAvanca(i).then(()=>atualizaEtapa());
};
$('rsOk').onclick=()=>{$('dlgResalva').close();gravaEtapa(janEtapa).then(()=>{atualizaEtapa();drawTabela()})};
