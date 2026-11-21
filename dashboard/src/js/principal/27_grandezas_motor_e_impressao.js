
/* ===== JANELA: TODAS AS GRANDEZAS E PARÂMETROS DO DSE (API /api/gerador v3.1) ===== */
// tipo: n = número (un, dec) · b = ligado/desligado · s = sim/não · t = texto · lista = alarmes · ecu = falhas ECU · blocos = diagnóstico
const GD_USADAS=[ // o que a tela usa hoje
  ['Medidas de carga e gerador',[
    ['percCarga','Carga medida (barra)','%',1],['kw','Potência ativa','kW',1],
    ['tensaoL1L2','Tensão L1-L2','V',1],['tensaoL2L3','Tensão L2-L3','V',1],['tensaoL3L1','Tensão L3-L1','V',1],
    ['correnteL1','Corrente L1','A',0],['correnteL2','Corrente L2','A',0],['correnteL3','Corrente L3','A',0]]],
  ['Motor e bateria',[
    ['tempAguaC','Temperatura da água','°C',1],['rpm','Rotação','rpm',0],['bateria','Tensão da bateria','V',2]]],
  ['Estado do gerador (LEDs e saídas)',[
    ['modo','Modo do controlador',,,'t'],['dse.modeloConfigurado','Modelo do DSE (configurado)',,,'t'],
    ['leds.stop','LED STOP',,,'b'],['leds.manual','LED MANUAL',,,'b'],['leds.teste','LED TESTE',,,'b'],['leds.auto','LED AUTO',,,'b'],
    ['leds.disjuntorGerador','LED disjuntor do gerador',,,'b'],['leds.geradorDisponivel','LED gerador disponível',,,'b'],
    ['saidaCombustivel','Saída de combustível',,,'b'],['saidaPartida','Saída de partida',,,'b']]],
  ['Qualidade da leitura',[
    ['ok','Leitura válida',,,'s'],['idadeSegundos','Idade da leitura','s',1]]]
];
const GD_DEMAIS=[ // mapeado pelo servidor Node-RED, ainda não usado na tela
  ['Motor e bateria',[
    ['alternador','Tensão do alternador de carga','V',1],['tempOleoC','Temperatura do óleo','°C',0],['tempAguaF','Temperatura da água','°F',1],
    ['pressaoOleoKpa','Pressão do óleo','kPa',0],['pressaoOleoBar','Pressão do óleo','bar',2],['nivelCombustivel','Nível de combustível','%',0]]],
  ['Gerador · frequência, tensões e correntes',[
    ['frequencia','Frequência','Hz',1],
    ['tensaoL1N','Tensão L1-N','V',1],['tensaoL2N','Tensão L2-N','V',1],['tensaoL3N','Tensão L3-N','V',1],
    ['tensaoFN','Tensão fase-neutro (L1)','V',1],['tensaoFF','Tensão fase-fase (L1-L2)','V',1],
    ['tensaoFNMedia','Tensão fase-neutro (média)','V',1],['tensaoFFMedia','Tensão fase-fase (média)','V',1],
    ['corrente','Corrente (média)','A',1],['correnteTerra','Corrente de terra','A',1],
    ['desequilibrioTensaoPct','Desequilíbrio de tensão','%',1],['desequilibrioCorrentePct','Desequilíbrio de corrente','%',1],
    ['rotacaoFases','Sequência de fases',,,'t']]],
  ['Potências e fator de potência',[
    ['kwL1','Potência ativa L1','kW',1],['kwL2','Potência ativa L2','kW',1],['kwL3','Potência ativa L3','kW',1],
    ['kvaL1','Potência aparente L1','kVA',1],['kvaL2','Potência aparente L2','kVA',1],['kvaL3','Potência aparente L3','kVA',1],
    ['kvarL1','Potência reativa L1','kvar',1],['kvarL2','Potência reativa L2','kvar',1],['kvarL3','Potência reativa L3','kvar',1],
    ['kva','Potência aparente total','kVA',1],['kvar','Potência reativa total','kvar',1],
    ['fpL1','Fator de potência L1',,2],['fpL2','Fator de potência L2',,2],['fpL3','Fator de potência L3',,2],['fp','Fator de potência total',,2],
    ['percKvar','Carga reativa','%',1]]],
  ['Energia e contadores',[
    ['kwh','Energia ativa (kWh)','kWh',1],['kwhNegativo','Energia ativa negativa','kWh',1],['kvah','Energia aparente','kVAh',1],['kvarh','Energia reativa','kvarh',1],
    ['horasMotor','Horas de motor','h',1],['horasMotorSegundos','Horas de motor (segundos)','s',0],['partidas','Número de partidas',,0],
    ['relogioDse','Relógio do DSE',,,'t']]],
  ['Estado e alarmes do controlador',[
    ['modoCodigo','Código do modo',,0],['temAlarme','Existe alarme ativo',,,'s'],
    ['alarmeAviso','Alarme de aviso',,,'s'],['alarmeDesligamento','Alarme de desligamento',,,'s'],
    ['alarmeTripEletrico','Trip elétrico',,,'s'],['alarmeDesligamentoControlado','Desligamento controlado',,,'s'],
    ['alarmes','Alarmes nomeados ativos',,,'lista']]],
  ['Motor via CAN / ECU (depende do motor)',[
    ['ecu.pressaoRefrigeranteKpa','Pressão do líquido de arrefecimento','kPa',0],['ecu.pressaoCombustivelKpa','Pressão do combustível','kPa',0],
    ['ecu.pressaoTurboKpa','Pressão do turbo','kPa',0],['ecu.tempAdmissaoC','Temperatura de admissão','°C',0],
    ['ecu.tempEscapeC','Temperatura de escape','°C',0],['ecu.consumoLh','Consumo de combustível','L/h',2],
    ['ecu.pressaoAtmosfericaKpa','Pressão atmosférica','kPa',0],['ecu.tempCombustivelC','Temperatura do combustível','°C',0],
    ['ecu.torquePct','Torque','%',0],['ecu.torqueDemandadoPct','Torque demandado','%',0],['ecu.cargaNaRotacaoPct','Carga na rotação','%',0],
    ['ecu.posicaoAceleradorPct','Posição do acelerador','%',0],['ecu.nivelOleoPct','Nível de óleo','%',0],
    ['ecu.pressaoCarterKpa','Pressão do cárter','kPa',2],['ecu.nivelRefrigerantePct','Nível do arrefecimento','%',0],
    ['falhasEcu','Falhas da ECU (códigos)',,,'ecu']]],
  ['Identidade do controlador',[
    ['dse.familiaAlarmes','Família de alarmes',,,'t'],['dse.fabricanteCodigo','Código do fabricante',,0],['dse.modeloCodigo','Código do modelo',,0],
    ['dse.serie','Número de série',,0],['dse.modeloTexto','Modelo (texto)',,,'t'],['dse.variante','Variante',,,'t'],
    ['dse.firmware','Firmware',,,'t'],['dse.firmwareCodigo','Código do firmware',,0]]],
  ['Diagnóstico da leitura e do servidor',[
    ['leituraEm','Leitura em',,,'t'],['geradoEm','Resposta gerada em',,,'t'],['diag.versaoApi','Versão da API',,,'t'],['diag.unitId','Unit ID Modbus',,0],
    ['diag.statusModbus','Status do Modbus',,,'t'],['diag.errosModbusTotal','Erros Modbus (total)',,0],
    ['diag.ultimoErro','Último erro',,,'t'],['diag.ultimoErroHa','Último erro há','s',1],['diag.ultimoErroBloco','Bloco do último erro',,,'t'],
    ['diag.blocos','Blocos de leitura (idade / falhas)',,,'blocos']]]
];
// Popup "Motor" (só tela, v1.9.8): mesmo conteúdo dos grupos "Motor e bateria" e "Motor via CAN / ECU" de
// GD_DEMAIS acima, reaproveitando os MESMOS campos/caminhos já mapeados pelo servidor — nada inventado aqui.
const GD_MOTOR=[GD_DEMAIS[0],GD_DEMAIS[5]];
const gdCaminho=(d,p)=>p.split('.').reduce((o,k)=>o==null?undefined:o[k],d);
function gdFormata(v,un,dec,tipo){ // devolve [texto, classe]
  const sem=['—','sem'];
  if(v===undefined||v===null)return sem;
  switch(tipo){
    case 'b':return v===true?['Ligado','gdbool on']:v===false?['Desligado','gdbool off']:sem;
    case 's':return v===true?['Sim','gdbool on']:v===false?['Não','gdbool off']:sem;
    case 'lista':return Array.isArray(v)?[v.length?v.map(a=>`${a.nome} (${a.nivel})`).join(' · '):'Nenhum alarme ativo','']:sem;
    case 'ecu':return v&&typeof v==='object'?[`${v.quantidade} falha(s)`+((v.codigos||[]).length?': '+v.codigos.map(c=>c.tipo+' '+(c.spn!=null?'SPN '+c.spn+'/FMI '+c.fmi:c.codigo)).join(', '):''),'']:sem;
    case 'blocos':return v&&typeof v==='object'?[Object.keys(v).map(k=>`${k}: ${v[k].idade==null?'sem dado':pt(v[k].idade,1)+' s'}${v[k].falhas?' ('+v[k].falhas+' falhas)':''}`).join(' · '),'']:sem;
    case 't':return [String(v),''];
  }
  if(typeof v==='number'&&isFinite(v))return [pt(v,dec==null?1:dec)+'','']; // un vai na coluna ao lado
  return [String(v),''];
}
function gdSecao(titulo,grupos,d,filtro,usada){
  let n=0,h='';
  grupos.forEach(([gnome,itens])=>{
    let linhas='';
    itens.forEach(([k,nome,un,dec,tipo])=>{
      const texto=(nome+' '+k+' '+(un||'')).toLowerCase();
      if(filtro&&!texto.includes(filtro))return;
      const [t,c]=gdFormata(gdCaminho(d,k),un,dec,tipo);
      linhas+=`<tr class="${c==='sem'?'sem':''}"><td>${esc(nome)}</td><td>${esc(k)}</td><td class="${c==='sem'?'':c}">${esc(t)}</td><td>${un?esc(un):''}</td></tr>`;
      n++;
    });
    if(linhas)h+=`<div class="gdgrp">${esc(gnome)}</div><table class="gdtab"><tbody>${linhas}</tbody></table>`;
  });
  return {n,html:`<section class="gdsec${usada?' usada':''}"><h4>${esc(titulo)}</h4>${h}</section>`};
}
function atualizaGrand(){
  const d=window.__ultimoDado||{},f=$('gdFiltro').value.trim().toLowerCase();
  const sem={n:0,html:''},a=$('gdUsa').checked?gdSecao('Usadas na tela',GD_USADAS,d,f,true):sem,b=$('gdMap').checked?gdSecao('Demais parâmetros mapeados do DSE (ainda não usados na tela)',GD_DEMAIS,d,f,false):sem;
  $('gdCorpo').innerHTML=(a.n?a.html:'')+(b.n?b.html:'')+(a.n+b.n?'':'<div class="gdvazio">Nenhum campo para mostrar: ajuste o filtro ou marque "usadas na tela" / "só mapeadas".</div>');
  const id=d.idadeSegundos;
  $('gdTag').textContent=d.ok===false||id==null?'sem leitura':`leitura há ${pt(id,1)} s`;
}
function abreGrand(){atualizaGrand();const x=$('dlgGrand');if(!x.open)x.showModal()}
$('gdFiltro').oninput=$('gdUsa').onchange=$('gdMap').onchange=atualizaGrand;
$('med').querySelector(':scope>h2').appendChild((()=>{
  const b=document.createElement('button');b.type='button';b.className='cfgbtn inl';
  b.innerHTML=ICONES.lista+'<span>Grandezas</span>';b.title='Ver todas as grandezas e parâmetros mapeados do DSE';
  b.setAttribute('aria-label','Todas as grandezas do DSE');b.onclick=e=>{e.stopPropagation();abreGrand()};return b;
})());

/* ----- popup Motor (v1.9.8): grupos de GD_MOTOR, mesma função de formatação do popup Grandezas ----- */
function atualizaMotor(){
  const d=window.__ultimoDado||{};
  const a=gdSecao('Motor',GD_MOTOR,d,'',false);
  $('mtCorpo').innerHTML=a.n?a.html:'<div class="gdvazio">Nenhum campo de motor na leitura atual.</div>';
  const id=d.idadeSegundos;
  $('mtTag').textContent=d.ok===false||id==null?'sem leitura':`leitura há ${pt(id,1)} s`;
}
function abreMotor(){atualizaMotor();const x=$('dlgMotor');if(!x.open)x.showModal()}
$('med').querySelector(':scope>h2').appendChild((()=>{
  const b=document.createElement('button');b.type='button';b.className='cfgbtn inl';
  b.innerHTML=ICONES.lista+'<span>Motor</span>';b.title='Temperatura/pressão de óleo, turbo, admissão/escape e falhas da ECU (só tela)';
  b.setAttribute('aria-label','Grandezas do motor');b.onclick=e=>{e.stopPropagation();abreMotor()};return b;
})());

/* v1.9.41: PDF (multi-página, sem imagem) para as popups "Grandezas" e "Motor" - reaproveita Pg/baixa
   já usados no relatório do ensaio e no Setup das chaves; GD_USADAS/GD_DEMAIS/GD_MOTOR/gdCaminho/gdFormata
   já existiam (popup em tela), aqui só viram linhas de tabela no PDF em vez de linhas de HTML. */
function pdfMulti(pgs){
  const enc=s=>{const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i)&255;return u};
  const ch=[],off=[];let len=0;const add=u=>{ch.push(u);len+=u.length};
  const N=4+2*pgs.length;
  add(enc('%PDF-1.4\n'));
  const obj=(n,body)=>{off[n]=len;add(enc(`${n} 0 obj\n${body}\nendobj\n`))};
  const stm=(n,bytes)=>{off[n]=len;add(enc(`${n} 0 obj\n<</Length ${bytes.length}>>\nstream\n`));add(bytes);add(enc('\nendstream\nendobj\n'))};
  obj(1,'<</Type/Catalog/Pages 2 0 R>>');
  obj(2,`<</Type/Pages/Kids[${pgs.map((_,i)=>`${6+2*i} 0 R`).join(' ')}]/Count ${pgs.length}>>`);
  obj(3,'<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>');
  obj(4,'<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>');
  pgs.forEach((p,i)=>{
    stm(5+2*i,enc(p.o.join('\n')));
    obj(6+2*i,`<</Type/Page/Parent 2 0 R/MediaBox[0 0 842 595]/Contents ${5+2*i} 0 R/Resources<</Font<</F1 3 0 R/F2 4 0 R>>>>>>`);
  });
  const xr=len;let x=`xref\n0 ${N+1}\n0000000000 65535 f \n`;
  for(let n=1;n<=N;n++)x+=String(off[n]).padStart(10,'0')+' 00000 n \n';
  x+=`trailer\n<</Size ${N+1}/Root 1 0 R>>\nstartxref\n${xr}\n%%EOF`;
  add(enc(x));
  return new Blob(ch,{type:'application/pdf'});
}
function pdfTabelaSecoes(titulo,grupos,tagLeitura){
  const agora=new Date(),p2=n=>String(n).padStart(2,'0');
  const dt=`${p2(agora.getDate())}/${p2(agora.getMonth()+1)}/${agora.getFullYear()} ${p2(agora.getHours())}:${p2(agora.getMinutes())}:${p2(agora.getSeconds())}`;
  const d=window.__ultimoDado||{};
  const X0=40,COLX=[X0,X0+330,X0+440,X0+535],COLW=[330,110,95,100],HJ=['l','l','l','l'];
  const HEAD=['Campo','Tag (caminho na API)','Valor','Unidade'];
  let pgs=[],pg,y;
  function novaPag(continuacao){
    pg=new Pg();pgs.push(pg);
    pg.t(X0,34,titulo.toUpperCase()+(continuacao?' (continuação)':''),13,true);
    pg.t(X0,56,'Origem: '+($('demo').checked?'DADOS DEMO (SIMULAÇÃO)':'DADOS REAIS (Node-RED/DSE)')+'  ·  '+(tagLeitura||'')+'  ·  Gerado em: '+dt,9);
    y=74;
    HEAD.forEach((h,i)=>pg.cell(COLX[i],y,COLW[i],16,h,{fill:.85,b:1,sz:8.5,al:HJ[i]}));y+=16;
  }
  novaPag(false);
  grupos.forEach(([gnome,itens])=>{
    if(!itens.length)return;
    if(y>556)novaPag(true);
    pg.t(X0,y+11,gnome,10,true);y+=15;
    itens.forEach(([k,nome,un,dec,tipo])=>{
      if(y>566){novaPag(true);pg.t(X0,y+11,gnome+' (continuação)',10,true);y+=15}
      let [t]=gdFormata(gdCaminho(d,k),un,dec,tipo);
      if(t.length>46)t=t.slice(0,45)+'…'; // campos tipo 'blocos'/'lista'/'ecu' podem virar um texto bem longo - trunca pra não vazar da célula no PDF (tela não é afetada)
      [nome,k,t,un||''].forEach((v,i)=>pg.cell(COLX[i],y,COLW[i],14,v,{sz:8,al:HJ[i]}));y+=14;
    });
    y+=6;
  });
  pg.t(X0,585,`Gerado em ${dt} · Medidor do Gerador v${VERSAO}${$('demo').checked?' · SIMULAÇÃO':''}`,7);
  return pdfMulti(pgs);
}
function nomeArq(prefixo,ext){ // v1.9.64: padrão único nome_DEMO|REAL_AAAAMMDD_HHMMSS.ext (antes havia 2 funções com o mesmo nome e PNG/CSV/relatório saíam com nome errado)
  const a=new Date(),p2=n=>String(n).padStart(2,'0');
  return `${prefixo}_${$('demo').checked?'DEMO':'REAL'}_${a.getFullYear()}${p2(a.getMonth()+1)}${p2(a.getDate())}_${p2(a.getHours())}${p2(a.getMinutes())}${p2(a.getSeconds())}.${ext||'pdf'}`;
}
/** v1.10.103: linhas [campo, tag, valor, unidade] de um conjunto de grupos (mesma lógica do PDF) — usado no TXT/MD. */
function linhasSecoes(grupos){
  const d=window.__ultimoDado||{},L=[];
  grupos.forEach(([gn,itens])=>itens.forEach(([k,nome,un,dec,tipo])=>{let [t]=gdFormata(gdCaminho(d,k),un,dec,tipo);L.push([gn+' › '+nome,k,t,un||''])}));
  return L;
}
$('gdImprimir').onclick=e=>{
  // respeita os mesmos filtros que estão na tela (checkboxes "usadas na tela"/"só mapeadas" + busca)
  const f=$('gdFiltro').value.trim().toLowerCase();
  const base=[];
  if($('gdUsa').checked)base.push(...GD_USADAS);
  if($('gdMap').checked)base.push(...GD_DEMAIS);
  const grupos=base.map(([gn,itens])=>[gn,itens.filter(([k,nome,un])=>!f||(nome+' '+k+' '+(un||'')).toLowerCase().includes(f))]);
  EXPO.menu(e.currentTarget,EXPO.itensTabela('Grandezas e parâmetros do DSE','grandezas_dse',()=>({cabec:['Campo','Tag (caminho na API)','Valor','Unidade'],linhas:linhasSecoes(grupos)}),()=>baixa(pdfTabelaSecoes('Grandezas e parâmetros do DSE',grupos,$('gdTag').textContent),nomeArq('grandezas_dse'))));
};
$('mtImprimir').onclick=e=>{
  EXPO.menu(e.currentTarget,EXPO.itensTabela('Motor','motor_dse',()=>({cabec:['Campo','Tag (caminho na API)','Valor','Unidade'],linhas:linhasSecoes(GD_MOTOR)}),()=>baixa(pdfTabelaSecoes('Motor',GD_MOTOR,$('mtTag').textContent),nomeArq('motor_dse'))));
};
