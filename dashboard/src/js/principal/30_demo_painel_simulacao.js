/* ===== v1.9.38: CARD "MODO" (só leitura + botão Alterar) e PDF das grandezas ===== */
(function(){
  const dm=()=>$('demo').checked;
  // v1.9.64: bolinhas PLC / Node-RED / HTML. Verde=ativo, amarelo=parcial, CINZA=não conectado OU perdeu a conexão (o texto abaixo da bolinha diz qual).
  // O balão é CSS puro (data-tip): o texto só é trocado quando muda — antes era reescrito a cada segundo (title) e o balão ficava piscando.
  const setLk=(id,est,txt,tip)=>{const e=$(id);if(!e)return;if(e.dataset.s!==est)e.dataset.s=est;const sm=e.querySelector('small');if(sm.textContent!==txt)sm.textContent=txt;if(e.dataset.tip!==tip)e.dataset.tip=tip};
  const qual=visto=>visto?'perdeu a conexão':'não conectado';
  function atualizaLinks(){
    const C=window.CH_SRV,srv=!!(C&&C.fonte==='nodered'&&(C.url||'').trim()!==''),agora=Date.now(); // CH_SRV nasce no bloco das chaves (mais abaixo): att() roda 1x antes disso
    // PLC: o Node-RED conseguiu LER o PLC por S7 (flow v2.2 devolve 503 quando a leitura cíclica está velha). Ainda NÃO é batimento do programa do PLC.
    let ok=0,visto=0;const det=[];
    if(srv)BANCOS_PLC.forEach(b=>{const L=LINK.banco[b.id]||{},v=LINK.bancoOk(b.id);if(v)ok++;if(L.visto)visto++;
      det.push('BC'+b.id+': '+(v?'leitura ok'+(L.flow==null?' · flow ANTIGO (sem campo flow) — importe a v2.4':''):qual(L.visto)+' — '+(L.erro||'aguardando a 1ª leitura')))});
    if(!srv)setLk('lkPlc','off','não conectado','PLC: Demo local (nada vai ao PLC) ou sem URL do servidor (botão Demo › Servidor).');
    else{const n=BANCOS_PLC.length;setLk('lkPlc',ok===n?'ok':ok===0?'off':'parc',ok===n?'leitura ok':ok===0?qual(visto>0):'parcial',
      'PLC (leitura S7 feita pelo Node-RED)\n'+det.join('\n')+'\nObs.: ainda não há batimento (heartbeat) do programa do PLC; isto indica que a LEITURA funciona.')}
    // Node-RED: só conta os servidores realmente em uso (chaves/PLC, telemetria do DSE e registro do ensaio).
    const partes=[];
    if(srv){const v=LINK.chv.ok&&agora-LINK.chv.ts<5000;partes.push(['Chaves/PLC',v,v?'respondendo':qual(LINK.chv.visto)+' — '+(LINK.chv.msg||'sem resposta')])}
    if(!dm()){const v=LINK.dse.ok&&agora-LINK.dse.ts<5000;partes.push(['Telemetria do DSE',v,v?'respondendo':qual(LINK.dse.visto)+' — a API do gerador não responde'])}
    if(typeof ensUsaMock==='function'&&!ensUsaMock()){const v=ENS.modo.estado==='ok';partes.push(['Registro do ensaio',v,v?'respondendo':(ENS.modo.estado==='erro'?qual(ENS.modo.conf!=null||LINK.ensVisto)+' — '+ENS.modo.erro:'consultando…')]);if(v)LINK.ensVisto=true}
    if(!partes.length)setLk('lkNr','off',dm()?'simulação':'não conectado','Node-RED: nada em uso (Demo ligado e chaves em simulador local).');
    else{const n=partes.filter(p=>p[1]).length;if(n)LINK.nrVisto=true;
      setLk('lkNr',n===partes.length?'ok':n===0?'off':'parc',n===partes.length?'respondendo':n===0?qual(LINK.nrVisto):'parcial',
      'Node-RED\n'+partes.map(p=>p[0]+': '+p[2]).join('\n'))}
    setLk('lkHtml','ok','ativo','HTML: esta tela está rodando (ciclo de 1 s) · v'+VERSAO);
  }
  const att=()=>{
    $('bDemo').classList.toggle('demoOn',dm()); // v1.9.56: botão Demo (barra de cima) preto→laranja piscando enquanto Demo está ligado
    const f=$('mcFonte');f.textContent=dm()?'SIDSE':'DSE Real';f.title=dm()?'SIDSE: DSE simulado (Demo)':'DSE Real: leitura do DSE do gerador';f.className='v '+(dm()?'demo':'real');
    $('mcTipo').textContent=MODO==='carga'?'Livre (sem registro)':'Guiado';
    $('mcSalva').textContent=MODO==='carga'?'não salva':(PORPAT?'Patamar':salvarManual?'Manual':'Auto');
    {const t=($('ensModo').textContent||'').trim(),mm=/confirma:\s*(.+?)\s*·\s*\d\d:\d\d/.exec(t);
      // v1.10.215: valor CURTO; o texto completo vai no balao. Simulado quando o registro nao usa o Node-RED (Demo local), em vez de repetir um erro que nao se aplica.
      let s0;try{const M_=ENS.modo,mock=typeof ensUsaMock==='function'&&ensUsaMock();s0=mock?'Simulado':M_.estado==='ok'&&M_.conf?(ensRotuloModo(M_.conf)==='MANUAL'?'Manual ✓':ensRotuloModo(M_.conf)==='AUTOMÁTICO'?'Auto ✓':ensRotuloModo(M_.conf)+' ✓'):M_.estado==='erro'?'Sem confirmação':M_.estado==='envia'?'Enviando…':'Consultando…'}catch(e){s0='—'}
      $('mcNode').textContent=s0;$('mcNode').title=t||s0}
    $('mcGra').textContent=GRAF_MODO==='off'?'Sem gráfico':GRAF_MODO==='classico'?'Relógio (clássico)':'Tempo de ensaio';
    atualizaLinks();
  };
  const ab=mkBtn('<span>⚙ Alterar</span>','Alterar o modo de operação (abre o popup Modo)',()=>$('bModo').click(),'cfgbtn inl');
  ab.id='bModoCard';$('modoCard').querySelector(':scope>.hrow').appendChild(ab);
  // atualiza quando o texto do botão do topo (rotulo()), o chip do Node-RED ou o demo mudam
  const ob=new MutationObserver(att);
  ob.observe($('bModo'),{childList:true,characterData:true,subtree:true});
  ob.observe($('ensModo'),{childList:true,characterData:true,subtree:true});
  ob.observe($('bDemo'),{attributes:true});
  $('demo').addEventListener('change',att);
  setInterval(att,1000); // rede de segurança (demo é checkbox escondido; mudança por código não dispara 'change')
  att();

  // --- PDF das grandezas (valores atuais da tela + origem demo/real) ---
  const f=(v,d,u)=>v==null||isNaN(v)?'-':pt(v,d)+(u?' '+u:'');
  function pdfGrandezas(){
    const agora=new Date(),p2=n=>String(n).padStart(2,'0');
    const dt=`${p2(agora.getDate())}/${p2(agora.getMonth()+1)}/${agora.getFullYear()} ${p2(agora.getHours())}:${p2(agora.getMinutes())}:${p2(agora.getSeconds())}`;
    const demo=dm(),m=MED||{};
    const pg=new Pg(),X0=40;
    pg.r(X0,34,762,34,demo?0.93:0.9);
    pg.t(X0+8,56,'LEITURA DAS GRANDEZAS - MOTOR/GERADOR',14,true);
    pg.t(X0,92,'Origem dos dados:',11,true);
    pg.t(150,92,demo?'DADOS DEMO (SIMULAÇÃO) - não são do motor real':'DADOS REAIS (Node-RED/DSE)',11,true);
    pg.t(X0,108,'Capturado em: '+dt,10);
    if(!demo&&!dadoOk)pg.t(X0,124,'ATENÇÃO: DADO ANTIGO / SEM COMUNICAÇÃO - valores da última leitura recebida.',10,true);
    const linhas=[
      ['Tensão L1-L2',f(m.va,1,'V'),'Corrente L1',f(m.ia,1,'A')],
      ['Tensão L2-L3',f(m.vb,1,'V'),'Corrente L2',f(m.ib,1,'A')],
      ['Tensão L3-L1',f(m.vc,1,'V'),'Corrente L3',f(m.ic,1,'A')],
      ['Potência',f(m.kw,1,'kW'),'Carga',f(carga,1,'%')],
      ['Temp. água',f(m.tc,1,'°C'),'Rotação',f(m.rpm,0,'rpm')],
      ['Bateria',f(m.bat,1,'V'),'Gerador',String(GEN&&GEN.estado||'-')]
    ];
    let y=145;
    pg.cell(X0,y,190,22,'Grandeza',{fill:0.85,b:1,sz:10});pg.cell(X0+190,y,190,22,'Valor',{fill:0.85,b:1,sz:10});
    pg.cell(X0+380,y,190,22,'Grandeza',{fill:0.85,b:1,sz:10});pg.cell(X0+570,y,192,22,'Valor',{fill:0.85,b:1,sz:10});
    linhas.forEach(r=>{y+=22;
      pg.cell(X0,y,190,22,r[0],{al:'l',sz:10});pg.cell(X0+190,y,190,22,r[1],{b:1,sz:11});
      pg.cell(X0+380,y,190,22,r[2],{al:'l',sz:10});pg.cell(X0+570,y,192,22,r[3],{b:1,sz:11})});
    pg.t(X0,570,`Gerado em ${dt} · Medidor do Gerador v${VERSAO}${demo?' · SIMULAÇÃO':''}`,7);
    // PDF mínimo (1 página, sem imagem)
    const enc=t=>{const u=new Uint8Array(t.length);for(let i=0;i<t.length;i++)u[i]=t.charCodeAt(i)&255;return u};
    const ch=[],off=[];let len=0;const add=u=>{ch.push(u);len+=u.length};
    add(enc('%PDF-1.4\n'));
    const obj=(n,b)=>{off[n]=len;add(enc(`${n} 0 obj\n${b}\nendobj\n`))};
    const cont=enc(pg.o.join('\n'));
    obj(1,'<</Type/Catalog/Pages 2 0 R>>');obj(2,'<</Type/Pages/Kids[6 0 R]/Count 1>>');
    obj(3,'<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>');
    obj(4,'<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>');
    off[5]=len;add(enc(`5 0 obj\n<</Length ${cont.length}>>\nstream\n`));add(cont);add(enc('\nendstream\nendobj\n'));
    obj(6,'<</Type/Page/Parent 2 0 R/MediaBox[0 0 842 595]/Contents 5 0 R/Resources<</Font<</F1 3 0 R/F2 4 0 R>>>>>>');
    const xr=len;let x='xref\n0 7\n0000000000 65535 f \n';
    for(let n=1;n<=6;n++)x+=String(off[n]).padStart(10,'0')+' 00000 n \n';
    x+=`trailer\n<</Size 7/Root 1 0 R>>\nstartxref\n${xr}\n%%EOF`;add(enc(x));
    baixa(new Blob(ch,{type:'application/pdf'}),`grandezas_${demo?'DEMO':'REAL'}_${agora.getFullYear()}${p2(agora.getMonth()+1)}${p2(agora.getDate())}_${p2(agora.getHours())}${p2(agora.getMinutes())}${p2(agora.getSeconds())}.pdf`);
  }
  const bp=mkBtn('<span>📄 Gerar PDF</span>','Gera um PDF com os valores atuais da tela e informa se os dados são DEMO ou REAIS',pdfGrandezas,'cfgbtn inl');
  bp.id='bPdfGrand';bp.style.display='none';$('med').querySelector(':scope>.hrow').appendChild(bp);   // v1.10.113: botão retirado da tela (função mantida)
  window.__pdfGrandezas=pdfGrandezas;
})();
$('simCarga').oninput=e=>{$('simVal').textContent=pt(e.target.value)+'%'};
