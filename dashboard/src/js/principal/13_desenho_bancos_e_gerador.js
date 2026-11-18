const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function bancoDados(d){ // em modo real: d.bancos=[{nome,chaves:[{kw,st}]}] com st 1=ligada, 0=desligada
  if(CH_SRV.fonte==='nodered'){ // v1.9.63: OS DOIS bancos vêm do PLC de verdade (CH_LIG via GET /api/chaves/{56|400}); banco sem leitura recente fica marcado "off" (a tela não mostra estado velho como se fosse atual)
    return BANCOS.map((b,bi)=>({nome:b.nome,off:!LINK.bancoOk(b.id),chaves:CH.map((c,i)=>({c,i})).filter(x=>x.c.b===bi)
      .map(x=>({kw:kwEf(x.i),st:CH_LIG[x.i]?1:0,cmd:!!CH_CMD[x.i]}))}));
  }
  if($('demo').checked)return bancoSim();
  return Array.isArray(d.bancos)?d.bancos.map(b=>({nome:b.nome||'Banco',chaves:(b.chaves||[]).map(c=>({kw:Number(c.kw)||0,st:Number(c.st)===1?1:0}))})):null;
}
function setNum(id,t){const el=$(id),u=el.querySelector('.u');el.innerHTML=t+(u?u.outerHTML:'')}
/* v1.9.74: controles de cada banco (seletora Local/Remoto + botão "Ligar banco") — só texto/classe/atributo, e só quando mudou */
const bkEhDemoLocal=()=>$('demo').checked&&CH_SRV.fonte==='mock';
function bkAtualiza(box){
  const demoLocal=bkEhDemoLocal(),demoLocalOuPlc=true;
  box.querySelectorAll('.bk[data-bk]').forEach(el=>{
    const id=el.dataset.bk,s=BKS[id],chip=el.querySelector('.bkchip'),btn=el.querySelector('.bkbtn');if(!s||!chip||!btn)return;
    const tx=(e,t)=>{if(e.textContent!==t)e.textContent=t},cl=(e,c)=>{if(e.className!==c)e.className=c},at=(e,a,v)=>{if(e.getAttribute(a)!==v)e.setAttribute(a,v)};
    // v1.9.75: no Demo local a seletora nunca fica "sem sinal" (nasce em Manual, como a física) — o texto "⇄" convida a clicar.
    tx(chip,s.sel===null?'Seletora: sem sinal':s.sel==='semcom'?'Seletora: sem comunicação ET200':(demoLocal?'⇄ ':'')+'Seletora: '+(s.sel==='auto'?'Auto (remoto)':'Manual (local)'));
    cl(chip,'bkchip '+(s.sel===null||s.sel==='semcom'?'s-na':s.sel==='auto'?'s-auto':'s-man')+(demoLocal?' s-bt':''));
    const sinal='sbBanco.seletoraAuto';
    const tc=demoLocal
      ?'Simula a seletora Local/Remoto do banco BC'+id+' (no PLC real: '+sinal+' vindo do ET200). Clique para alternar entre Manual (local) e Auto (remoto) — exatamente como a seletora física.'
      :s.sel===null
      ?'Seletora do banco BC'+id+': sem sinal — o flow das chaves não é o v2.4 (ou o PLC ainda não foi lido). Enquanto isso o HTML não bloqueia as chaves (o PLC continua mandando).'
      :s.sel==='semcom'
      ?'Seletora do banco BC'+id+': o PLC está sem comunicação com o ET200 (FB101 ComOk = FALSE). O banco fica desligado até a comunicação voltar e o operador religar.'
      :'Posição da seletora física do banco BC'+id+' (lida do ET200, '+sinal+'): Auto = remoto (o PLC comanda), Manual = local. Só muda girando a seletora no banco de carga.';
    const trEns=bkEnsaioTrava()&&demoLocalOuPlc;
    cl(chip,chip.className.replace(/ trav/g,'')+(trEns?' trav':''));
    at(chip,'aria-disabled',trEns?'true':'false');
    at(chip,'title',trEns?bkMotivoEnsaio:tc);
    tx(btn,s.lig?'Desligar banco':'Ligar banco');
    const pode=s.lig||(s.sel==='auto'&&!trEns); // v1.9.77: "Desligar banco" sempre liberado
    cl(btn,'bkbtn'+(s.lig?' on':'')+(pode?'':' nao'));
    at(btn,'aria-disabled',pode?'false':'true');
    at(btn,'title',trEns&&!s.lig?bkMotivoEnsaio:s.sel===null?'Sem sinal da seletora do banco BC'+id+': botão inativo (as chaves seguem liberadas como antes).'
      :s.sel==='manual'?'Seletora do banco BC'+id+' em Manual (local): gire para Auto (remoto) para poder ligar o banco por aqui.'
      :s.sel==='semcom'&&!s.lig?'Sem comunicação PLC ↔ ET200: o banco BC'+id+' não pode ser ligado agora.'
      :demoLocal?'Simula o comando Ligar banco do BC'+id+' ('+(s.lig?'desliga':'liga')+' o banco). Com o banco ligado as chaves passam a responder.'
      :'Envia '+(s.lig?'Desligar':'Ligar')+' banco BC'+id+' ao PLC (POST /api/chaves/'+rotaDe(id)+'/banco → cbBanco.ligar). '+(s.lig?'Desligar abre todas as chaves do banco.':'Com o banco ligado as chaves passam a responder.'));
  });
}
function drawBanco(B){
  const box=$('bancos');
  if(!B){
    if(bancoSig!=='none'){
      let fi=0;const ref=BANCOS.map(b=>`<div class="bk"><div class="bkh"><span>${esc(b.nome)}</span></div><div class="sw">${b.chaves.map(kw=>{const q=fi++;return `<div class="tile ref${DIS[q]?' dis':''}" data-i="${q}"><i></i>${fmtKw(USAR_REAL&&KWR[q]?KWR[q].kw:kw)} kW</div>`}).join('')}</div></div>`).join('');
      box.innerHTML='<p class="note0">Banco de carga acionado manualmente: as chaves não são lidas pelo sistema. A carga do ensaio é acompanhada pela medição do DSE.</p>'+ref;
      bancoSig='none';
      fitZoom();
    }
    setNum('bkApl','—');setNum('bkDif','—');setNum('bkDse',MED.kw==null?'—':pt(MED.kw,1));$('bkDifCard').className='card';return;
  }
  const bkAberto=id=>{try{const m=JSON.parse(localStorage.getItem('medidor.bkAberto.v1')||'{}');return !id||(m[id]!==undefined?m[id]!==false:(window.bancoUsado?!!window.bancoUsado(id):true))}catch(e){return true}};   // v1.10.131; v1.10.153: sem escolha do operador, nasce aberto só o banco SELECIONADO em Detalhes
  const sig=B.map(b=>b.nome+':'+b.chaves.map(c=>c.kw).join(',')).join('|');
  /* v1.10.115: texto do motivo da falta de leitura + registro (1 linha) quando o banco perde/recupera a leitura — para achar a causa (carga do Node-RED, rede, PLC) */
  const semLeit=id=>{const L=(window.LINK&&LINK.banco[id])||{};return ' — SEM LEITURA do PLC, estado das chaves DESCONHECIDO ('+(L.ts?'última tentativa há '+Math.round((Date.now()-L.ts)/1000)+' s':'nunca lido')+(L.erro?': '+L.erro:(L.ok?': leitura com mais de 5 s':''))+')'};
  window.__bkOffAnt=window.__bkOffAnt||{};
  B.forEach((b,bi)=>{const id=bancoIdPorNome(b.nome);if(!id)return;const ant=window.__bkOffAnt[id];
    if(ant!==undefined&&ant!==!!b.off){try{window.devObs&&window.devObs.log('bco','sistema','BC'+id+(b.off?': PERDEU a leitura do PLC (chaves em "?")':': leitura do PLC VOLTOU'),b.off?'aviso':'ok',{motivo:((LINK.banco[id]||{}).erro)||'',idadeMs:(LINK.banco[id]||{}).idadeMs})}catch(e){}}
    window.__bkOffAnt[id]=!!b.off});
  // v1.9.74: só os dois bancos de verdade (BANCOS, mesma ordem e nomes) ganham os controles de seletora/"Ligar banco"; o formato antigo d.bancos[] (sem id de banco) não
  const ids=B.map(b=>bancoIdPorNome(b.nome));
  if(sig!==bancoSig){
    let fj=0;box.innerHTML=B.map((b,bi)=>{const id=ids[bi];
      return `<details class="bk"${id?` data-bk="${id}"`:''}${bkAberto(id)?' open':''}><summary class="bkh"><span>${esc(b.nome)}</span>${id?`<span class="bkctl"><button type="button" class="bkchip" data-act="sel" data-b="${id}"></button><button type="button" class="bkbtn" data-act="lig" data-b="${id}"></button></span>`:''}<b></b></summary><div class="sw">${b.chaves.map(c=>`<div class="tile" data-i="${fj++}"><i></i>${fmtKw(c.kw)} kW</div>`).join('')}</div></details>`}).join('');
    // v1.10.131: lembra aberto/fechado de cada banco (padrão: ABERTO — são os bancos operacionais)
    box.querySelectorAll('details.bk[data-bk]').forEach(d=>d.addEventListener('toggle',()=>{try{const m=JSON.parse(localStorage.getItem('medidor.bkAberto.v1')||'{}');m[d.dataset.bk]=d.open;localStorage.setItem('medidor.bkAberto.v1',JSON.stringify(m))}catch(e){}}));
    bancoSig=sig;
    fitZoom();
  }
  const tiles=box.querySelectorAll('.tile'),heads=box.querySelectorAll('.bkh b');
  let k=0,apl=0;
  B.forEach((b,bi)=>{let s=0,pos=0;const id=ids[bi],blk=!!id&&!bkLiberado(id);
    b.chaves.forEach(c=>{pos++;const t=tiles[k],cn='tile s'+(b.off?0:c.st)+(DIS[k]?' dis':'')+(c.cmd&&!b.off?' cmd':'')+(b.off?' unk':'')+(blk?' blk':'');
      if(t.className!==cn)t.className=cn;
      // v1.9.74: tooltip de cada chave (só grava quando o texto muda, para não mexer no DOM a cada ciclo de 1 s)
      const tip=(id?'BC'+id+' · chave '+pos+' de '+b.chaves.length+' · ':'')+fmtKw(c.kw)+' kW'+(b.off?(id?semLeit(id):' · sem leitura do PLC'):c.st===1?' · LIGADA':' · desligada')+(DIS[k]?' · DESABILITADA (Setup › Habilitar/Desabilitar)':'')+(blk?' · BLOQUEADA: '+bkMotivo(id):'');
      if(t.title!==tip)t.title=tip;
      k++;
      if(c.st===1&&!b.off){s+=c.kw;apl+=c.kw}});
    heads[bi].textContent=b.off?'— kW':pt(s,0)+' kW ligados';   // v1.10.130: o aviso de falta de leitura saiu do card; vai para o triângulo (CHV-006)
    const bk=heads[bi].closest('.bk');if(bk)bk.classList.toggle('semplc',!!b.off)});
  bkAtualiza(box);
  if(window.GUIADO)window.GUIADO.pinta(); // v1.9.81: desenha a sugestão (borda tracejada) nas chaves
  const algumOff=B.some(b=>b.off);   // v1.10.115: banco sem leitura => a soma seria incompleta (parece 0 kW): mostra "—", nunca um número falso
  const dse=MED.kw,dif=(dse==null||algumOff)?null:apl-dse;
  setNum('bkApl',algumOff?'—':pt(apl,1));setNum('bkDse',dse==null?'—':pt(dse,1));
  setNum('bkDif',dif==null?'—':(dif>0?'+':'')+pt(dif,1));
  $('bkDifCard').className='card'+(dif==null?'':Math.abs(dif)<=DIF_KW?' ok':' warn');
}

/* gerador: estado, LEDs do DSE e botões */
const LEDS=[['stop','STOP','red'],['manual','MANUAL'],['teste','TESTE'],['auto','AUTO'],['disjuntorGerador','DISJ. GERADOR'],
            ['geradorDisponivel','GERADOR DISP.'],['saidaCombustivel','COMBUSTÍVEL'],['saidaPartida','PARTIDA']];
$('leds').innerHTML=LEDS.map(([k,t,c])=>`<span class="led na${c?' '+c:''}" id="led_${k}"><i></i>${t}</span>`).join('');
function genInfo(d){ // estado do gerador a partir dos dados (leds, saídas e rotação)
  const L=findKey(d,'leds')||{},rpm=Number(find(d,'rpm')),temRpm=!isNaN(rpm),part=findKey(d,'saidaPartida'),comb=findKey(d,'saidaCombustivel'),disp=L.geradorDisponivel;
  if(!temRpm&&disp==null&&part==null&&L.manual==null)return {estado:'—',run:true}; // sem informação: não bloqueia o cronômetro
  // v1.9.22: a pedido do operador, confirmado em campo — o DSE dele (3 botões push: STOP vermelho, MANUAL/AUTO
  // branco — nasce em MANUAL —, START verde, sem seletora) acende o LED STOP ao conectar o cabo (parado/ocioso) e
  // acende o LED MANUAL quando o operador parte o gerador por ele. leds.manual===true é sinal confiável de
  // "gerador ligado" nesse painel — usa como sinal principal; geradorDisponivel/rpm continuam valendo como reserva.
  /* v1.10.173 (DSE REAL, 06/11/2026): o LED MANUAL só diz que o MODO é manual; "operando" exige também as GRANDEZAS quando existem:
     rotação >= 1400 rpm e tensão média das 3 fases >= 100 V (condições confirmadas pelo operador: DSE ligado, motor rodando, modo MANUAL, LED MANUAL on, STOP/AUTO off). */
  const vs=['tensaoL1L2','tensaoL2L3','tensaoL3L1'].map(k=>Number(find(d,k))),temV=vs.every(v=>!isNaN(v)&&v>=0),vMed=temV?(vs[0]+vs[1]+vs[2])/3:null;
  const ledRun=L.manual===true?true:typeof disp==='boolean'?disp:(temRpm&&rpm>=1400);
  const run=ledRun&&(!temRpm||rpm>=1400)&&(vMed==null||vMed>=100);
  const estado=run?'operando':part===true?'partindo':(temRpm&&rpm>50)?(comb===false?'parando':'partindo'):'parado';
  return {estado,run};
}
function drawGer(d){
  const L=findKey(d,'leds')||{};
  LEDS.forEach(([k,t,c])=>{const v=k in L?L[k]:findKey(d,k);setCls($('led_'+k),'led '+(v===true?'on':v===false?'off':'na')+(c?' '+c:''))});
  const e=GEN.estado,ch=$('gEstado');
  setTxt(ch,e==='—'?'sem dado':e.toUpperCase());setCls(ch,'gchip'+(e==='operando'?' operando':(e==='partindo'||e==='parando')?' partindo':''));
  botoesGer(e);
}
function botoesGer(e){ // START/STOP: demo simula o DSE; real só inicia o ensaio (sem STOP)
  e=e||GEN.estado;
  const bs=$('bGenStart'),bp=$('bGenStop'),bpe=$('bParaEns'),bi=$('bIni');
  const armado=T.started&&!T.run&&!T.fim;
  if($('demo').checked){ // demo: os botões simulam o que o operador faz na frente do DSE
    bs.textContent=armado?'▶ INICIAR CONTAGEM':'▶ START';
    bs.title=armado?'Ensaio ARMADO — clique para iniciar a contagem do cronômetro agora':'Demo: liga o gerador simulado e inicia o ensaio';
    bp.style.display='';
    bs.disabled=armado?(!!T.run||(T.fim&&!T.gravado)):!(e==='parado'||e==='—');
    bp.disabled=!(e==='partindo'||e==='operando'||e==='—');
    // v1.9.24: #bGenStart ficou oculto (botão redundante, a pedido do operador) — #bIni é agora o único controle
    // visível de início e precisa do mesmo cuidado que #bGenStart tinha antes de armado: só habilita quando o
    // gerador simulado está parado/— (pra não tentar partir um gerador já partindo/operando).
    bi.disabled=!!T.run||(T.fim&&!T.gravado);   // v1.10.0: antes também exigia gerador simulado parado/— e travava o INICIAR com o gerador já operando; clickIniciar já trata o gerador
  }else{ // real: ligar/desligar o gerador é feito na frente do DSE; aqui START só inicia (ou arma) o ensaio e não desliga o gerador
    bs.textContent=armado?'▶ INICIAR CONTAGEM':'▶ START ENSAIO';
    bs.title=armado?'Ensaio ARMADO — clique para iniciar a contagem do cronômetro agora':'Inicia o ensaio (o gerador é ligado e desligado no painel do DSE)';
    bp.style.display='none';
    bs.disabled=!!T.run||(T.fim&&!T.gravado);
    bi.disabled=!!T.run||(T.fim&&!T.gravado);
  }
  // v1.9.24: a pedido do operador — um único botão "INICIAR" (sem trocar de texto): pisca em azul pastel/branco
  // enquanto o ensaio está ARMADO aguardando o clique (substitui o antigo botão "INICIAR CONTAGEM" separado);
  // fica azul fixo ("ativo") enquanto o cronômetro está contando.
  bi.classList.toggle('pede',armado);
  bi.classList.toggle('ativo',!!T.run);
  bi.title=armado?'Ensaio ARMADO — clique para iniciar a contagem do cronômetro agora':T.run?'Cronômetro em andamento':'Inicia o ensaio'+($('demo').checked?' (liga o gerador simulado)':' (o gerador é ligado e desligado no painel do DSE)');
  bpe.disabled=!T.started||T.fim;
  // v1.9.76: Setup aberto trava o INICIAR; ensaio em andamento trava o botão Setup (os dois continuam clicáveis só para mostrar o motivo)
  const dsu=$('dlgChSetup'),setupAberto=!!(dsu&&dsu.open);
  bi.classList.toggle('nao',setupAberto);if(setupAberto)bi.title='Setup aberto: feche o popup Setup antes de iniciar o ensaio.';
  const bsu=$('btSetup'),trSu=T.started&&!T.fim;
  if(bsu){bsu.classList.toggle('nao',trSu);bsu.setAttribute('aria-disabled',trSu?'true':'false');bsu.title=trSu?'Setup bloqueado: há um ensaio em andamento (inclusive pausado). Use PARAR ENSAIO antes de calibrar as chaves.':'Calibra o kW real de cada chave (gerador em START, sem ensaio em andamento).'}
}
