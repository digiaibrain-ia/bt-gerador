
/* ===== v1.9.76 · DEV/OPERADOR OCULTO [DEV.OPS] — "cliente oculto" do desenvolvedor =====
   O QUE FAZ: percorre sozinho as funções do card Cargas (seletora / "Ligar banco" / chaves), do popup Setup e de UM ENSAIO COMPLETO
   (INICIAR → Dados do ensaio → 6 etapas com SALVAR → FINALIZAR → Gravar), apertando os MESMOS botões que o operador aperta (element.click()) e
   conferindo, depois de cada ação, o que a tela e o estado interno respondem. Cada conferência vira OK / FALHA / AVISO na lista do popup Demo e
   um evento no Log de desenvolvimento (card DEV.OPS, tipo "teste") — o gerenciador de logs mostra tudo.
   ONDE RODA: só com a senha do Demo, em "Demo local" (100% navegador, localStorage) e em "Demo + PLC" (a tela simula o DSE, mas as chaves e o
   registro do ensaio gravam de VERDADE no PLC → confirmação obrigatória). NUNCA roda no modo REAL (botão bloqueado e checagem dupla no código).
   O QUE NÃO FAZ: não escreve nada no PLC por conta própria (só pelos mesmos botões/rotas da tela), não calibra/salva kW real no Setup, não
   habilita/desabilita chaves, não gera PDF (grava "sem relatório"), não mexe no DSE real. Parar: botão "Parar" da barra flutuante ou a tecla Esc.
   AO TERMINAR (ou ser interrompido) devolve a tela ao estado de antes: chaves soltas, seletora/Ligar banco como estavam, Setup fechado,
   simulação/velocidade/gerador como estavam, "Dados do ensaio" originais. */
(function(){
  'use strict';
  const CARD='DEV.OPS',ABORT={abortado:true};
  const OPS={rodando:false,parar:false,rel:[],fase:'',passo:'',modo:null,ini:0,fim:0,seq:0,erroJs:[],motivoAbort:''};
  const dorme=ms=>new Promise(r=>setTimeout(r,ms));
  const lg=(res,acao,det)=>{try{if(window.devObs)window.devObs.log(CARD,'teste',acao,res,det)}catch(e){ /* ignorado: o log de desenvolvimento é opcional */ }};

  /* ---------- registro das conferências ---------- */
  function reg(res,fase,nome,det){
    const r={n:++OPS.seq,t:Date.now(),fase,nome,res,det:det==null?'':String(det)};
    OPS.rel.push(r);
    lg(res,fase+' · '+nome,r.det?{det:r.det.slice(0,300)}:null);
    ui();return r;
  }
  const chk=(f,n,cond,det)=>reg(cond?'ok':'falha',f,n,det).res==='ok';
  const aviso=(f,n,d)=>reg('aviso',f,n,d);
  const cont=()=>({ok:OPS.rel.filter(r=>r.res==='ok').length,falha:OPS.rel.filter(r=>r.res==='falha').length,aviso:OPS.rel.filter(r=>r.res==='aviso').length});

  /* ---------- esperas que obedecem ao "Parar" ---------- */
  async function ate(cond,ms,passo){
    const t0=Date.now();
    for(;;){
      if(OPS.parar)throw ABORT;
      if(OPS.modo&&srvChave()!==OPS.modo){OPS.motivoAbort='o modo da tela mudou durante o teste ('+OPS.modo+' → '+srvChave()+')';throw ABORT}
      let v=false;try{v=cond()}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }
      if(v)return true;
      if(Date.now()-t0>=ms)return false;
      await dorme(passo||80);
    }
  }
  const pausa=ms=>ate(()=>false,ms);
  const passo=t=>{OPS.passo=t;ui()};

  /* ---------- leitura da tela (o "olho" do operador) ---------- */
  const tile=i=>document.querySelector('#bancos .tile[data-i="'+i+'"]');
  const lig=i=>{const t=tile(i);return !!t&&t.classList.contains('s1')};
  const cmd=i=>{const t=tile(i);return !!t&&t.classList.contains('cmd')};
  const chip=id=>document.querySelector('#bancos .bkchip[data-b="'+id+'"]');
  const btnL=id=>document.querySelector('#bancos .bkbtn[data-b="'+id+'"]');
  const idxBanco=bi=>CH.map((c,i)=>i).filter(i=>CH[i].b===bi);
  const gmsg=()=>{const e=$('gmsg');return e?e.textContent.trim():''};
  const nChLig=ids=>ids.filter(lig).length;
  const nome=i=>{const c=CH[i],b=BANCOS[c.b];return 'BC'+b.id+' ch'+(i-CH.findIndex(x=>x.b===c.b)+1)};
  function clica(el,quem){if(!el)throw new Error('elemento não encontrado: '+(quem||'?'));el.click()}
  async function clicaMsg(el,quem,ms){msgGer('');clica(el,quem);await pausa(ms||180);return gmsg()}
  const modoSim=()=>srvChave(); // 'demoLocal' | 'demoPlc' | 'real'

  /* ---------- ações-base (pelo botão, nunca mexendo no estado direto) ---------- */
  async function paraSel(id,quer){if(BKS[id].sel===quer)return true;clica(chip(id),'seletora BC'+id);await pausa(150);return BKS[id].sel===quer}
  async function paraLig(id,quer){if(BKS[id].lig===quer)return true;clica(btnL(id),'Ligar banco BC'+id);await pausa(150);return BKS[id].lig===quer}
  async function simManual(){if(auto){clica($('mMan'),'MANUAL');await pausa(150)}return !auto}
  async function soltaTudoLocal(){ // solta todas as chaves simuladas (Demo local) clicando nas que estão ligadas
    for(let i=0;i<CH.length;i++)if(lig(i)){clica(tile(i),nome(i));await pausa(60)}
  }


  /* =================== FASE 0 — ⚙ Chaves (habilitar para o teste e devolver depois) =================== */
  // O Demo herda do navegador (localStorage "medidor.chavesDes") a lista de chaves desabilitadas que o modo PLC leu do DB150/DB158; se estiverem
  // todas desabilitadas nada pode ser acionado. O operador habilita pelo MESMO popup ⚙ Chaves e desabilita de novo no fim. No Demo + PLC isso
  // grava o bit "habilitada" de cada chave no DB do banco (rota /habilitar) — o texto da confirmação avisa.
  async function trocaHabil(q,quer){ // quer=true habilita; devolve true quando DIS[q] chegou ao valor pedido
    const bi=CH[q].b,dlg=$('dlgChHD');
    if(!dlg.open){clica($('bChaves'),'⚙ Chaves');await pausa(300)}
    const tab=dlg.querySelector('[data-chtabs] button[data-bi="'+bi+'"]');
    if(tab&&!tab.classList.contains('on')){clica(tab,'aba do banco');await pausa(250)}
    const cb=dlg.querySelector('#chGrade input[data-i="'+q+'"]');
    if(!cb)return false;
    if(cb.checked===quer&&DIS[q]===!quer)return true;
    cb.checked=quer;cb.dispatchEvent(new Event('change',{bubbles:true}));
    return ate(()=>DIS[q]===!quer,12000);
  }
  async function preparaChaves(){
    const F='Chaves (⚙)';
    OPS.habilitei=[];
    const des=idxAll().filter(q=>DIS[q]);
    if(!des.length){aviso(F,'chaves já habilitadas','todas as '+CH.length+' chaves estavam habilitadas: nada a mudar');return}
    passo('⚙ Chaves: '+des.length+' desabilitadas');
    aviso(F,des.length+' de '+CH.length+' chaves estavam DESABILITADAS ao começar','o Demo herda do navegador a lista lida do PLC (localStorage medidor.chavesDes); o operador habilita para testar e desabilita de novo no fim');
    // uma chave desabilitada não pode ser acionada (mensagem manda ir em ⚙ Chaves)
    const q0=des[0],id0=bkDeCh(q0);
    if(modoSim()==='demoPlc'&&!LINK.bancoOk(id0))aviso(F,nome(q0)+': bloqueio de chave desabilitada não conferido','banco sem leitura do PLC (a mensagem de "sem leitura" vem antes)');
    else{
      await simManual();
      const m=await clicaMsg(tile(q0),nome(q0),250);
      chk(F,nome(q0)+' desabilitada: o clique não liga',!lig(q0)&&!cmd(q0)&&SIM.ch[q0]===0);
      chk(F,nome(q0)+' desabilitada: a mensagem manda usar ⚙ Chaves',/desabilitada/i.test(m),m.slice(0,90));
    }
    for(const q of des){
      if(await trocaHabil(q,true))OPS.habilitei.push(q);
      else{chk(F,'habilitar '+nome(q),false,'DIS continua true · '+gmsg().slice(0,80));break}
    }
    if($('dlgChHD').open)$('dlgChHD').close();
    chk(F,OPS.habilitei.length+' chaves habilitadas para o teste',OPS.habilitei.length===des.length,OPS.habilitei.length+' de '+des.length);
  }
  // v1.9.76 (achado do Dev/Operador oculto, 2ª execução em Demo + PLC): o GET periódico regrava DIS[] com o que o PLC devolveu; uma leitura que estava
  // em voo (ou o cache de 200 ms do flow) ainda traz "habilitada=false" por 1–2 s DEPOIS do POST /habilitar e a tela volta a mostrar a chave
  // desabilitada por instantes. O operador espera a leitura confirmar e registra a oscilação como aviso.
  async function estabilizaHabil(){
    if(modoSim()!=='demoPlc'||!OPS.habilitei||!OPS.habilitei.length)return;
    const F='Chaves (⚙)',lim=Date.now()+12000;let t0=null,oscilou=0;
    while(Date.now()<lim){
      const ok=OPS.habilitei.every(i=>!DIS[i]);
      if(!ok){if(t0!=null)oscilou++;t0=null}else if(t0==null)t0=Date.now();
      if(t0!=null&&Date.now()-t0>=2500)break;
      await pausa(200);
    }
    if(t0==null||Date.now()-t0<2500)aviso(F,'o PLC não confirmou as habilitações','a tela continua mostrando chaves desabilitadas 12 s depois do POST /habilitar');
    else if(oscilou)aviso(F,'depois de habilitar, a tela voltou a mostrar chave desabilitada por instantes','o GET periódico traz "habilitada" antigo por 1–2 s (leitura em voo/cache do flow); estabilizou em seguida');
  }
  async function restauraChaves(){
    if(!OPS.habilitei||!OPS.habilitei.length)return;
    passo('⚙ Chaves: devolvendo as chaves ao estado de antes');
    let falhou=0;
    for(const q of OPS.habilitei.slice().reverse()){if(!(await trocaHabil(q,false)))falhou++}
    if($('dlgChHD').open)$('dlgChHD').close();
    if(falhou)aviso('Restauração',falhou+' chave(s) não voltaram a ficar desabilitadas','desabilite à mão em ⚙ Chaves');
    else reg('ok','Restauração','chaves desabilitadas de novo, como estavam',OPS.habilitei.length+' chaves');
    OPS.habilitei=[];
  }

  /* =================== FASE A — card Cargas =================== */
  async function faseCargasLocal(){
    const F='Cargas (Demo local)';
    passo('card Cargas: seletora Auto/Manual e "Ligar banco"');
    chk(F,'simulação em MANUAL para operar as chaves à mão',await simManual());
    await soltaTudoLocal();
    for(let bi=0;bi<BANCOS.length;bi++){
      const id=BANCOS[bi].id,idx=idxBanco(bi),i0=idx.find(i=>!DIS[i]),i1=idx.filter(i=>!DIS[i])[1];
      if(i0===undefined){aviso(F,'BC'+id,'todas as chaves do banco estão desabilitadas (⚙ Chaves): nada a testar');continue}
      const B='BC'+id+': ';
      // 1) seletora em Manual (local)
      passo(B+'seletora em Manual');
      await paraSel(id,'manual');
      chk(F,B+'seletora Manual desliga o banco',BKS[id].sel==='manual'&&BKS[id].lig===false,'sel='+BKS[id].sel+' lig='+BKS[id].lig);
      chk(F,B+'chip mostra "Manual"',/Manual/i.test(chip(id).textContent),chip(id).textContent);
      chk(F,B+'"Ligar banco" aparece inativo em Manual',btnL(id).classList.contains('nao'),btnL(id).className);
      let m=await clicaMsg(tile(i0),nome(i0));
      chk(F,B+'Manual bloqueia a chave',!lig(i0)&&SIM.ch[i0]===0,'ligada='+lig(i0));
      chk(F,B+'a mensagem explica o bloqueio (LOCAL)',/LOCAL|Manual/i.test(m),m.slice(0,90));
      m=await clicaMsg(btnL(id),'Ligar banco BC'+id);
      chk(F,B+'"Ligar banco" em Manual não liga',BKS[id].lig===false,m.slice(0,90));
      // 2) Auto, mas banco desligado
      passo(B+'seletora em Auto, banco desligado');
      await paraSel(id,'auto');
      chk(F,B+'Auto NÃO liga o banco sozinho',BKS[id].sel==='auto'&&BKS[id].lig===false);
      chk(F,B+'"Ligar banco" fica ativo em Auto',!btnL(id).classList.contains('nao'),btnL(id).className);
      m=await clicaMsg(tile(i0),nome(i0));
      chk(F,B+'Auto sem "Ligar banco" bloqueia a chave',!lig(i0),m.slice(0,90));
      chk(F,B+'a mensagem pede para ligar o banco',/desligado|Ligar banco/i.test(m),m.slice(0,90));
      // 3) banco ligado → chaves respondem
      passo(B+'Ligar banco e operar chaves');
      await paraLig(id,true);
      chk(F,B+'"Ligar banco" liga',BKS[id].lig===true);
      chk(F,B+'o botão passa a dizer "Desligar banco"',/Desligar/.test(btnL(id).textContent),btnL(id).textContent);
      await clicaMsg(tile(i0),nome(i0));
      chk(F,B+'chave liga com o banco ligado',lig(i0)&&SIM.ch[i0]===1,'ligada='+lig(i0));
      if(i1!==undefined){await clicaMsg(tile(i1),nome(i1));chk(F,B+'2ª chave liga junto',lig(i0)&&lig(i1))}
      const kw=Math.round(kwChaves()*10)/10;
      chk(F,B+'a potência do card acompanha as chaves ligadas',kw>0,kw+' kW');
      await clicaMsg(tile(i0),nome(i0));
      chk(F,B+'clicar de novo desliga a chave',!lig(i0));
      if(i1!==undefined&&lig(i1)){clica(tile(i1));await pausa(80)}
      // 4) seletora volta a Manual com chave ligada → solta tudo
      passo(B+'seletora para Manual com chave ligada');
      await clicaMsg(tile(i0),nome(i0));
      const antes=lig(i0);
      await paraSel(id,'manual');
      chk(F,B+'seletora para Manual SOLTA as chaves do banco',antes&&!lig(i0)&&nChLig(idx)===0&&BKS[id].lig===false,'ligada antes='+antes+' agora='+lig(i0));
      // 5) "Desligar banco" com chave ligada → solta tudo
      passo(B+'Desligar banco com chave ligada');
      await paraSel(id,'auto');await paraLig(id,true);
      await clicaMsg(tile(i0),nome(i0));
      const antes2=lig(i0);
      await paraLig(id,false);
      chk(F,B+'"Desligar banco" SOLTA as chaves do banco',antes2&&!lig(i0)&&nChLig(idx)===0&&BKS[id].lig===false);
      await paraLig(id,true); // deixa liberado para o próximo passo
    }
    // 6) bancos independentes: bloquear um não pode afetar o outro
    if(BANCOS.length>1){
      passo('independência entre os bancos');
      const a=BANCOS[0].id,b=BANCOS[1].id,ia=idxBanco(0).find(i=>!DIS[i]),ib=idxBanco(1).find(i=>!DIS[i]);
      if(ia!==undefined&&ib!==undefined){
        await paraSel(a,'manual');await paraSel(b,'auto');await paraLig(b,true);
        await clicaMsg(tile(ib),nome(ib));await clicaMsg(tile(ia),nome(ia));
        chk('Cargas (Demo local)','BC'+a+' em Manual não impede o BC'+b+' de operar',lig(ib)&&!lig(ia),'BC'+b+'='+lig(ib)+' BC'+a+'='+lig(ia));
        await soltaTudoLocal();
        await paraSel(a,'auto');await paraLig(a,true);
      }
    }
    await soltaTudoLocal();
  }

  const OPS_LIGOU={}; // v1.9.77: bancos que o operador ligou no PLC (desliga ao restaurar)
  async function faseCargasPlc(){
    const F='Cargas (Demo + PLC)';
    passo('card Cargas via PLC: uma chave por banco');
    for(let bi=0;bi<BANCOS.length;bi++){
      const id=BANCOS[bi].id,idx=idxBanco(bi),i0=idx.find(i=>!DIS[i]),B='BC'+id+': ';
      // v1.9.77: no PLC a seletora é física (só leitura) e o "Ligar banco" vai ao PLC (flow v2.4)
      const sel0=BKS[id].sel;
      let m=await clicaMsg(chip(id),'seletora BC'+id);
      chk(F,B+'clicar na seletora NÃO muda a posição (é física)',BKS[id].sel===sel0,'sel '+sel0+'→'+BKS[id].sel+' · '+m.slice(0,80));
      chk(F,B+'a mensagem explica a seletora',/física|sem sinal/i.test(m),m.slice(0,90));
      if(sel0===null){
        m=await clicaMsg(btnL(id),'Ligar banco BC'+id);
        chk(F,B+'"Ligar banco" sem sinal não envia comando',BKS[id].lig===false,m.slice(0,90));
      }else if(sel0==='auto'&&!BKS[id].lig){
        passo(B+'Ligar banco no PLC');
        await clicaMsg(btnL(id),'Ligar banco BC'+id,250);
        const ligou=await ate(()=>BKS[id].lig,6000);
        chk(F,B+'"Ligar banco" liga o banco no PLC (cbBanco.ligar)',ligou,gmsg().slice(0,90));
        if(ligou)OPS_LIGOU[id]=true;
      }else if(sel0!=='auto'){
        aviso(F,B+'chaves','seletora '+(sel0==='manual'?'em Manual (local)':'sem comunicação ET200')+': banco bloqueado, nada a acionar');continue;
      }
      if(i0===undefined){aviso(F,B+'chaves',' todas desabilitadas: nada a acionar');continue}
      if(!LINK.bancoOk(id)){aviso(F,B+'comando de chave pulado','banco sem leitura do PLC ('+((window.CH_ERRO&&window.CH_ERRO[id])||'aguardando leitura')+')');continue}
      passo(B+'acionando '+nome(i0)+' no PLC');
      await clicaMsg(tile(i0),nome(i0),250);
      const comandou=await ate(()=>cmd(i0)||lig(i0),4000);
      chk(F,B+nome(i0)+': comando aparece na tela (laranja)',comandou,gmsg().slice(0,90));
      const confirmou=await ate(()=>lig(i0),10000);
      chk(F,B+nome(i0)+': o PLC confirma (verde = feedback sb.ligada)',confirmou,confirmou?'':gmsg().slice(0,90));
      await ate(()=>!CH_PEND.has(i0),15000); // v1.9.77: espera a resposta do POST /ligar (com a fila do Node-RED cheia o feedback chega antes; clique durante o envio é ignorado)
      await clicaMsg(tile(i0),nome(i0),250);
      const soltou=await ate(()=>!lig(i0)&&!cmd(i0),10000);
      chk(F,B+nome(i0)+': desliga e o PLC confirma',soltou);
    }
    await soltaTudoPlc();
  }
  async function soltaTudoPlc(){ // best effort: tudo que estiver comandado/ligado é clicado de novo
    for(let i=0;i<CH.length;i++)if(cmd(i)||lig(i)){try{clica(tile(i))}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }await pausa(120)}
    await ate(()=>idxAll().every(i=>!lig(i)&&!cmd(i)),8000);
  }
  const idxAll=()=>CH.map((c,i)=>i);

  /* =================== FASE B — popup Setup =================== */
  async function garanteGerador(){ // o Setup só trabalha com o gerador (simulado) operando
    if(SIM.gen==='operando')return true;
    if(SIM.gen==='parado'||SIM.gen==='parando'){await ate(()=>SIM.gen==='parado'||SIM.gen==='operando',8000);if(SIM.gen==='parado')clica($('stGenDemo'),'ligar gerador (Demo)')}
    return ate(()=>SIM.gen==='operando',40000);
  }
  async function faseSetup(){
    const F='Setup';
    passo('popup Setup: abrir e ligar o gerador (Demo)');
    if(T.started&&!T.fim){aviso(F,'fase pulada','já existe ensaio em andamento (o Setup fica bloqueado)');return}
    await soltaTudoLocalOuPlc();
    const dlg=$('dlgChSetup');
    await clicaMsg($('btSetup'),'botão Setup',400);
    if(!chk(F,'botão Setup abre o popup (sem ensaio)',dlg.open,gmsg().slice(0,90)))return;
    const gerOk=await garanteGerador();
    chk(F,'gerador simulado ligado para a calibração',gerOk,'SIM.gen='+SIM.gen);
    if(!gerOk){dlg.close();return}
    passo('popup Setup: aguardando a medição de "kW sem carga"');
    const base=await ate(()=>/kW sem carga: [\d.,]+ kW/.test($('stBaseEst').textContent),30000);
    chk(F,'baseline "kW sem carga" medida',base,$('stBaseEst').textContent);
    const local=modoSim()==='demoLocal';
    for(let bi=0;bi<BANCOS.length;bi++){
      const id=BANCOS[bi].id,B='BC'+id+': ',off=idxBanco(bi)[0],qtd=BANCOS[bi].chaves.length;
      const tab=dlg.querySelector('[data-chtabs] button[data-bi="'+bi+'"]');
      if(!tab){aviso(F,B+'aba do banco não encontrada');continue}
      clica(tab,'aba '+id);await pausa(250);
      const tiles=()=>[...dlg.querySelectorAll('#chSel .tile')];
      const k=tiles().findIndex((t,j)=>!DIS[off+j]); // 1ª chave habilitada do banco
      if(k<0){aviso(F,B+'todas as chaves desabilitadas');continue}
      if(local){
        passo(B+'Setup com o banco em Manual');
        await paraSel(id,'manual');await pausa(700);
        chk(F,B+'nota do popup cita o banco em LOCAL',/LOCAL/i.test($('chNota').textContent),$('chNota').textContent.slice(0,90));
        chk(F,B+'chaves do banco aparecem bloqueadas (cinza)',dlg.querySelectorAll('#chSel .tile.bloq').length===qtd,dlg.querySelectorAll('#chSel .tile.bloq').length+' de '+qtd);
        clica(tiles()[k],'chave do Setup');await pausa(500);
        chk(F,B+'clique na chave não seleciona nada em Manual',window.chSetupSel()===null);
        chk(F,B+'o popup explica o motivo (LOCAL)',/LOCAL/i.test($('stTxt').textContent),$('stTxt').textContent.slice(0,90));
        await paraSel(id,'auto');await paraLig(id,true);await pausa(700);
        chk(F,B+'liberado: a nota não cita mais LOCAL',!/LOCAL/i.test($('chNota').textContent),$('chNota').textContent.slice(0,90));
      }
      passo(B+'Setup: selecionar '+nome(off+k));
      clica(tiles()[k],'chave do Setup');
      const sel=await ate(()=>window.chSetupSel()===off+k,8000);
      chk(F,B+nome(off+k)+' fica selecionada para calibrar',sel,'chSetupSel='+window.chSetupSel()+' · '+$('stTxt').textContent.slice(0,70));
      if(sel){
        // INICIAR bloqueado com o Setup aberto
        passo(B+'INICIAR com o Setup aberto');
        const bi_=$('bIni'),iniciadoAntes=T.started;
        chk(F,B+'botão INICIAR aparece bloqueado com o Setup aberto',bi_.classList.contains('nao'),bi_.className);
        let m;
        if(bi_.disabled){ // Demo: com o gerador simulado ligado o INICIAR já está desabilitado — a trava do Setup é exercitada chamando o handler (clickIniciar) direto
          aviso(F,B+'INICIAR já está desabilitado no Demo (gerador ligado)','a trava "Setup aberto" é conferida chamando o handler clickIniciar() direto');
          msgGer('');await clickIniciar();await pausa(250);m=gmsg();
        }else m=await clicaMsg(bi_,'INICIAR',300);
        chk(F,B+'INICIAR não abre "Dados do ensaio" nem arma o ensaio',!$('dlgDados').open&&T.started===iniciadoAntes,'dlgDados='+$('dlgDados').open+' T.started='+T.started);
        chk(F,B+'a mensagem manda fechar o Setup',/Setup/i.test(m),m.slice(0,90));
        if(local){
          // bloquear o banco com a chave selecionada cancela a calibração
          passo(B+'bloquear o banco com a chave selecionada');
          await paraSel(id,'manual');await pausa(500);
          chk(F,B+'seletora para Manual CANCELA a calibração da chave',window.chSetupSel()===null,'chSetupSel='+window.chSetupSel());
          chk(F,B+'o popup avisa que o banco bloqueou',/bloqueado/i.test($('stTxt').textContent),$('stTxt').textContent.slice(0,90));
          await paraSel(id,'auto');await paraLig(id,true);await pausa(400);
        }else{
          clica(tiles()[k],'chave do Setup');
          chk(F,B+'clicar de novo desmarca a chave',await ate(()=>window.chSetupSel()===null,8000),'chSetupSel='+window.chSetupSel());
        }
      }
    }
    dlg.close();await pausa(500);
    // v1.9.76: em Demo + PLC/real o GET periódico regrava SEL com o chaveSel que o PLC devolveu (medidor: chAtualizaUm); uma leitura em voo antes do
    // POST /selecionar zerar traz a chave antiga e ela "reaparece" selecionada por 1–2 s. Falha só se não se resolver sozinha.
    {const t1=Date.now(),sumiu=await ate(()=>window.chSetupSel()===null,5000),lag=Date.now()-t1;
     chk(F,'fechar o popup deixa nenhuma chave selecionada',sumiu,'chSetupSel='+window.chSetupSel());
     if(sumiu&&lag>150)aviso(F,'a chave selecionada reapareceu por '+lag+' ms depois de fechar o popup','o GET periódico traz chaveSel antigo (leitura em voo antes do POST /selecionar zerar); some sozinha na leitura seguinte')}
    if(modoSim()==='demoPlc')await soltaTudoPlc();
  }
  async function soltaTudoLocalOuPlc(){modoSim()==='demoPlc'?await soltaTudoPlc():await soltaTudoLocal()}

  /* =================== FASE C — um ensaio completo =================== */
  async function travasEnsaio(F,mom){
    await pausa(500); // a tela repinta os botões a cada 250 ms (passo())
    const bs=$('btSetup');
    chk(F,mom+': botão Setup aparece bloqueado',bs.classList.contains('nao')&&bs.getAttribute('aria-disabled')==='true',bs.className);
    let m=await clicaMsg(bs,'Setup',300);
    chk(F,mom+': clicar em Setup não abre o popup',!$('dlgChSetup').open,m.slice(0,90));
    if($('dlgChSetup').open)$('dlgChSetup').close();
    if(modoSim()!=='demoLocal')return;
    for(const b of BANCOS){
      const id=b.id,s0=BKS[id].sel,l0=BKS[id].lig;
      chk(F,mom+': seletora do BC'+id+' aparece travada',chip(id).classList.contains('trav'),chip(id).className);
      m=await clicaMsg(chip(id),'seletora BC'+id);
      chk(F,mom+': seletora do BC'+id+' não muda durante o ensaio',BKS[id].sel===s0&&BKS[id].lig===l0,'sel '+s0+'→'+BKS[id].sel+' · '+m.slice(0,70));
    }
  }
  async function faseEnsaio(){
    const F='Ensaio';
    if(MODO==='carga'){aviso(F,'fase pulada','tipo de ensaio "Teste de carga" (sem etapas nem registro) — o ciclo completo exige o ensaio ISO');return}
    if(T.started&&!T.fim){chk(F,'sem ensaio em andamento antes de começar',false,'termine ou pare o ensaio atual');return}
    if(T.fim&&!T.gravado){aviso(F,'fase pulada','há um ensaio finalizado e NÃO gravado: grave ou zere antes de rodar o operador');return}
    if(normalizaPatamar())aviso(F,'Patamar Guiado estava LIGADO (salvamento "Por patamar")','o robô desligou o Patamar durante o ensaio dele (senão o 30 % em manual espera o "Aplicar" e a carga não sobe) e religa no fim');   // v1.10.200
    if(normalizaSalvamento())aviso(F,'salvamento das etapas estava em outro modo (Por patamar/Automático)','o robô usa Manual durante o ensaio dele (as conferências são do salvamento Manual) e devolve no fim');
    const dis0=desabilitadosTela();   // v1.10.199: estado dos botões antes do ensaio (para conferir o pós-ensaio)
    passo('ensaio: simulação AUTO a 10×');
    if(!auto){clica($('mAuto'),'AUTO');await pausa(200)}
    chk(F,'simulação em AUTO',auto===true);
    clica(document.querySelector('#velSeg button[data-v="10"]'),'10×');await pausa(150);
    chk(F,'velocidade 10×',T.sp===10,'sp='+T.sp);
    // No Demo o INICIAR só habilita com o gerador simulado PARADO (botoesGer): se o Setup deixou o gerador ligado, o operador aperta STOP antes.
    if(SIM.gen!=='parado'){
      passo('ensaio: parando o gerador simulado (o INICIAR do Demo só habilita com o gerador parado)');
      const dis0=$('bIni').disabled;
      if(dis0)aviso(F,'INICIAR fica DESABILITADO com o gerador simulado ligado (Demo)','sem tooltip explicando; no modo REAL o INICIAR arma o ensaio com o gerador já operando — comportamento diferente entre Demo e real');
      if(!$('bGenStop').disabled){clica($('bGenStop'),'STOP (Demo)')}
      chk(F,'gerador simulado parou (STOP do Demo)',await ate(()=>SIM.gen==='parado',40000),'SIM.gen='+SIM.gen);
      await pausa(300);
    }
    // --- INICIAR → Dados do ensaio
    passo('ensaio: INICIAR → Dados do ensaio');
    msgGer('');clica($('bIni'),'INICIAR');
    const dAbriu=await ate(()=>$('dlgDados').open,4000);
    if(!chk(F,'INICIAR abre "Dados do ensaio"',dAbriu,gmsg().slice(0,90)))return;
    const hh=new Date().toTimeString().slice(0,8).replace(/:/g,'');
    $('dServ').value='OPS-'+hh;$('dServ').dispatchEvent(new Event('input',{bubbles:true}));
    $('dVer').value='dev/operador oculto';$('dVer').dispatchEvent(new Event('input',{bubbles:true}));
    chk(F,'o botão do popup diz "Iniciar ensaio"',/Iniciar ensaio/i.test($('dOk').textContent),$('dOk').textContent);
    clica($('dOk'),'Iniciar ensaio');
    const armou=await ate(()=>!$('dlgDados').open&&T.started,25000);
    if(!chk(F,'confirmar os dados arma o ensaio',armou,'dlgDados='+$('dlgDados').open+' T.started='+T.started+' · '+($('dErr').textContent||gmsg()).slice(0,90)))return;
    await travasEnsaio(F,'ensaio armado');
    // --- gerador operando → cronômetro
    passo('ensaio: aguardando o gerador simulado');
    chk(F,'gerador simulado operando',await ate(()=>SIM.gen==='operando',40000),'SIM.gen='+SIM.gen);
    if(!T.run){await pausa(300);if(T.started&&!T.run&&!T.fim)clica($('bIni'),'INICIAR (cronômetro)')}
    chk(F,'cronômetro conta (T.run)',await ate(()=>T.run,6000),'T.run='+T.run);
    // --- 6 etapas
    const tMax=Date.now()+420000;let sig='',sigT=Date.now(),etSalva=-1,rncFeito=false;
    while(!T.aguardaFim&&!T.fim){
      if(OPS.parar)throw ABORT;
      if(Date.now()>tMax){chk(F,'ciclo termina no tempo previsto (7 min a 10×)',false,'etapa '+(T.et+1));break}
      passo('ensaio: etapa '+(T.et+1)+'/'+ETAPAS.length+' ('+ETAPAS[T.et].nome+') · carga '+(carga==null?'—':carga.toFixed(1))+'%');
      if(T.started&&!T.run&&!T.fim&&!T.aguarda&&SIM.gen==='operando'){clica($('bIni'),'INICIAR (retomar)');await pausa(300)}
      if(T.aguarda&&!SNAP[T.et]&&etSalva!==T.et){
        const et=T.et,alvo=ETAPAS[et].alvo;
        await pausa(300);
        chk(F,'etapa '+(et+1)+' ('+alvo+'%): carga dentro da tolerância do alvo',carga!=null&&Math.abs(carga-alvo)<=TOL+2,'carga='+(carga==null?'—':carga.toFixed(1))+'% alvo='+alvo+'% TOL='+TOL);
        const b=document.querySelector('#c_sv_'+et+' .svbtn'),vis=!!b&&b.offsetParent!==null&&!b.disabled;
        chk(F,'etapa '+(et+1)+' cumprida: botão Salvar da tabela disponível e piscando',vis&&b.classList.contains('pede'),b?('class='+b.className+' disabled='+b.disabled+' texto='+b.textContent):'sem botão');
        if(!vis)break;
        if(et===2&&!rncFeito){rncFeito=true;await faseRncDurante()}   // v1.10.211: fase RNC (só com pasta de dados de TESTE)
        etSalva=et;msgGer('');clica(b,'Salvar (etapa '+(et+1)+')');
        const avancou=await ate(()=>T.et>et||T.aguardaFim||T.fim,25000);
        chk(F,'etapa '+(et+1)+': SALVAR grava e o ensaio avança',avancou&&!!SNAP[et],'SNAP='+!!SNAP[et]+' T.et='+(T.et+1)+' · '+gmsg().slice(0,90));
        if(!avancou)break;
      }
      const s=T.et+':'+Math.floor(T.el)+':'+T.estavel.toFixed(1)+':'+(T.aguarda?1:0);
      if(s!==sig){sig=s;sigT=Date.now()}else if(Date.now()-sigT>45000){chk(F,'o ensaio continua progredindo',false,'parado há 45 s na etapa '+(T.et+1)+' (carga '+(carga==null?'—':carga.toFixed(1))+'%)');break}
      if(SIM.gen!=='operando'&&!T.fim){chk(F,'gerador simulado permanece operando durante o ensaio',false,'SIM.gen='+SIM.gen);break}
      await pausa(150);
    }
    if(!T.aguardaFim){ // não chegou ao fim: sai (o restante da limpeza é feito em restaura())
      aviso(F,'ciclo incompleto','parou na etapa '+(T.et+1)+' — conferências finais não executadas');return;
    }
    passo('ensaio: etapas cumpridas, aguardando FINALIZAR');
    chk(F,'todas as '+ETAPAS.length+' etapas ficaram salvas',ETAPAS.every((e,i)=>!!SNAP[i]),ETAPAS.map((e,i)=>SNAP[i]?'✔':'✖').join(''));
    chk(F,'FINALIZAR libera ao final das etapas',!$('bFim').disabled);
    await travasEnsaio(F,'etapas cumpridas (antes de FINALIZAR)');
    if(modoSim()==='demoLocal'){
      // exceção de segurança: "Desligar banco" continua liberado durante o ensaio; "Ligar banco" não
      for(const b of BANCOS){
        const id=b.id;
        if(!BKS[id].lig){aviso(F,'BC'+id+': Desligar/Ligar banco','o banco já estava desligado; nada a testar');continue}
        let m=await clicaMsg(btnL(id),'Desligar banco BC'+id);
        chk(F,'BC'+id+': "Desligar banco" continua liberado durante o ensaio',BKS[id].lig===false&&nChLig(idxBanco(BANCOS.indexOf(b)))===0,'lig='+BKS[id].lig+' · '+m.slice(0,70));
        m=await clicaMsg(btnL(id),'Ligar banco BC'+id);
        chk(F,'BC'+id+': "Ligar banco" fica TRAVADO durante o ensaio',BKS[id].lig===false&&/Ensaio em andamento/i.test(m),'lig='+BKS[id].lig+' · '+m.slice(0,80));
      }
    }else aviso(F,'Desligar/Ligar banco','no Demo + PLC o "Desligar banco" durante o ensaio não é testado (derrubaria a carga real)');
    // --- FINALIZAR → resultado → gravar
    passo('ensaio: FINALIZAR');
    msgGer('');clica($('bFim'),'FINALIZAR');
    const fechou=await ate(()=>T.fim&&$('dlgRes').open,25000);
    chk(F,'FINALIZAR encerra o ensaio e abre o resultado',fechou,'T.fim='+T.fim+' dlgRes='+$('dlgRes').open+' · '+gmsg().slice(0,90));
    if(!fechou)return;
    chk(F,'o resultado traz o "Resultado final"',/Resultado final/i.test($('resFinal').textContent),$('resFinal').textContent);
    chk(F,'resultado sem etapas faltando',!($('resAviso').textContent||'').trim(),$('resAviso').textContent.trim().slice(0,90));
    passo('ensaio: gravar sem relatório');
    clica($('resOkSemPdf'),'Gravar sem relatório');
    chk(F,'"Gravar sem relatório" grava o ensaio',await ate(()=>T.gravado&&!$('dlgRes').open,6000),'T.gravado='+T.gravado);
    // --- travas devem soltar
    passo('ensaio: conferindo que as travas soltaram');
    await pausa(500);
    {const dis1=desabilitadosTela(),novos=[];dis1.forEach((v,k)=>{if(v&&dis0.has(k)&&dis0.get(k)===false)novos.push(k.split('|')[1]||k.split('|')[0])});
     chk(F,'depois de gravar nenhum botão da tela ficou DESABILITADO (estado de antes do ensaio)',novos.length===0,novos.slice(0,8).join(' · '));
     const chips=[...document.querySelectorAll('#patCard button.gd-chip')];chk(F,'depois de gravar os chips de patamar voltam a poder ser escolhidos',chips.length===0||chips.every(c=>!c.disabled),chips.filter(c=>c.disabled).map(c=>c.textContent.trim()).join(' · '))}
    const bs=$('btSetup');
    chk(F,'depois de gravar, o botão Setup volta a ficar liberado',!bs.classList.contains('nao'),bs.className);
    if(modoSim()==='demoLocal'){
      for(const b of BANCOS){
        const id=b.id;
        chk(F,'BC'+id+': seletora destravada',!chip(id).classList.contains('trav'),chip(id).className);
        await paraSel(id,'auto');const r=await paraLig(id,true);
        chk(F,'BC'+id+': seletora e "Ligar banco" voltam a funcionar',BKS[id].sel==='auto'&&r,'sel='+BKS[id].sel+' lig='+BKS[id].lig);
      }
    }
  }

  /* =================== restauração do estado =================== */
  async function restaura(est){
    passo('restaurando o estado da tela');
    try{
      if($('dlgDados').open&&!T.started)$('dlgDados').close();
      if(T.started&&!T.fim){pararEnsaioSilencioso();aviso('Restauração','ensaio interrompido','o ensaio do operador foi encerrado só na tela (sem apagar nada do PLC; se gravou etapas no DB53, use PARAR ENSAIO para limpar)')}
      if($('dlgRes').open)$('dlgRes').close();
      if($('dlgChSetup').open)$('dlgChSetup').close();
      if(modoSim()==='demoPlc')await soltaTudoPlc();else await soltaTudoLocal();
      await restauraChaves();
      if(modoSim()==='demoLocal'&&est.bks){for(const id in est.bks){if(BKS[id]){await paraSel(id,est.bks[id].sel);if(est.bks[id].sel==='auto')await paraLig(id,est.bks[id].lig)}}}
      if(modoSim()==='demoPlc'){for(const id in OPS_LIGOU){if(BKS[id]&&BKS[id].lig){clica(btnL(id),'Desligar banco BC'+id);if(!(await ate(()=>!BKS[id].lig,15000)))aviso('Restauração','BC'+id+': banco continua ligado','use "Desligar banco" no card Cargas')}delete OPS_LIGOU[id]}} // v1.9.77
      if(est.vel&&T.sp!==est.vel){const b=document.querySelector('#velSeg button[data-v="'+est.vel+'"]');if(b)b.click()}
      if(est.auto!==auto){clica(est.auto?$('mAuto'):$('mMan'));}
      restauraSalvamento();restauraPatamar();   // v1.10.200: devolve o salvamento e religa o Patamar Guiado se o robô mudou
      if(est.gen==='parado'&&(SIM.gen==='operando'||SIM.gen==='partindo')&&!(T.started&&!T.fim)){clica($('stGenDemo'),'desligar gerador (Demo)');await pausa(200)}
      const gd=est.dados;if(gd){Object.assign(DADOS,gd.DADOS);ULTIMO=gd.ULTIMO;try{for(const k in gd.ls){if(gd.ls[k]==null)localStorage.removeItem(k);else localStorage.setItem(k,gd.ls[k])}}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }}
    }catch(e){if(e!==ABORT)aviso('Restauração','falha ao restaurar',String(e&&e.message||e))}
  }

  /* =================== orquestração =================== */
  const snapEstado=()=>{
    const ls={};try{['medidor.dados.'+DADOS_MODO,'medidor.dadosUltimo.'+DADOS_MODO].forEach(k=>{ls[k]=localStorage.getItem(k)})}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
    const bks={};BANCOS.forEach(b=>{bks[b.id]={sel:BKS[b.id].sel,lig:BKS[b.id].lig}});
    return{auto,vel:T.sp,gen:SIM.gen,bks,dados:{DADOS:JSON.parse(JSON.stringify(DADOS)),ULTIMO:ULTIMO?JSON.parse(JSON.stringify(ULTIMO)):ULTIMO,ls}};
  };
  const onErro=ev=>{if(!OPS.rodando)return;const m=(ev&&(ev.message||(ev.reason&&ev.reason.message)||String(ev.reason)))||'erro';OPS.erroJs.push(m);reg('falha','JavaScript','erro não tratado durante o teste',String(m).slice(0,200))};
  window.addEventListener('error',onErro);window.addEventListener('unhandledrejection',onErro);
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&e.isTrusted&&OPS.rodando&&!OPS.parar){OPS.parar=true;OPS.motivoAbort='tecla Esc';ui()}},true);

  /* =====================================================================================================================
     robo_fase_rnc_v0.5.js — FASE "RNC · Registrar defeito" do Dev/Operador oculto  ·  13/11/2026
     FRAGMENTO colado DENTRO do módulo do Operador oculto (usa reg, chk, aviso, ate, pausa, passo, clica, OPS, T, ETAPAS, srvBase, $).
     PARA QUE SERVE (leigo): no meio do ensaio simulado (etapa de 50 %), o robô aperta "⚠ Registrar defeito" como o operador: confere o que o botão anexa
     (modelo, etapa, hora, grandezas, alarmes), preenche e registra, confere que o servidor guardou e que o aviso "RNC: BLOQUEADO" aparece e some.
     v0.2 (13/11/2026): a caixa de areia do robô bloqueia todo envio que não seja leitura; esta fase abre UMA exceção — POST /api/rnc/abrir — só enquanto roda e só depois de confirmar que a pasta de dados é de teste (SB.rncPermite). Resto igual à v0.1.
     v0.3 (13/11/2026): o defeito simulado é FALHA DO ALTERNADOR DE CARGA (pedido do Reginaldo): a fase arma SIM_FALHA_ALT (só no Demo): tensão do alternador 0 V com o motor em marcha, bateria
       descendo (24,8 V) e alarme "Falha de carga do alternador" no DSE simulado. O robô confere que o contexto anexado mostra a falha, que o servidor a guardou e que a falha é desarmada ao fim.
     v0.5 (16/11/2026): se o RNC estiver DESLIGADO (interruptor da área RNC, medidor 1.10.216), a fase é PULADA com AVISO (o robô não liga o RNC por conta própria). Resto igual à v0.4.
     v0.4 (13/11/2026, revisão de código): (1) fecha a janela "Registrar defeito" em qualquer saída da fase; (2) a etapa de referência é lida DEPOIS da espera da falha simulada;
       (3) pausa o vigia do botão (RNC_DEFEITO.pausa) enquanto confere o aviso, para o teste não competir com ele (antes podia ser instável). Resto igual à v0.3.
     SEGURANÇA: só grava se GET /api/rnc/saude disser que a pasta de dados tem "teste" no nome (nunca na pasta real). Sem servidor, sem fluxo RNC ou pasta
     real = a fase é PULADA com um AVISO no relatório (não é falha). Só fala com /api/rnc/*; NÃO toca PLC, chaves nem DSE.
     O registro de teste leva série OPSECRETO<data/hora> e o prefixo [DEMO] (o Demo está ligado); fica na pasta de teste como evidência (o arquivo é só de acréscimo).
     ===================================================================================================================== */
  async function faseRncDurante(){
    const F='RNC · Registrar defeito';
    passo('RNC: conferindo o servidor (só roda com pasta de dados de TESTE)');
    let base='';try{base=srvBase()}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }
    if(!base){aviso(F,'fase pulada','sem URL do servidor (Node-RED) no medidor');return}
    let sa=null;
    try{const r=await fetch(base+'/api/rnc/saude',{cache:'no-store'});sa=r.ok?await r.json():null}catch(e){ /* ignorado: texto inválido: segue com o valor padrão */ }
    if(!sa||!sa.ok){aviso(F,'fase pulada','o serviço RNC não respondeu em /api/rnc/saude (fluxo rnc-api-v1.1 importado e URL do servidor certa?)');return}
    if(!/teste/i.test(String(sa.arquivo||''))){aviso(F,'fase pulada por segurança','a pasta de dados do RNC (…'+String(sa.arquivo||'').slice(-40)+') não tem "teste" no nome: o robô não grava na pasta real');return}
    if(window.RNC_DEFEITO&&window.RNC_DEFEITO.ativo&&!window.RNC_DEFEITO.ativo()){aviso(F,'fase pulada','o RNC está DESLIGADO (botão RNC › Usar RNC); o robô não liga sozinho');return}   // v0.5: respeita o interruptor
    if(!window.RNC_DEFEITO||!$('bRnc')){chk(F,'botão "Registrar defeito" existe na tela',false,'módulo RNC ausente nesta versão do medidor');return}
    SIM_FALHA_ALT=true;   // falha de alternador de carga simulada (só Demo); desarmada no finally
    SB.rncPermite=true;   // exceção da caixa de areia: só POST /api/rnc/abrir, só nesta fase, só com pasta de TESTE confirmada
    try{
    const api=async c=>{const r=await fetch(base+c,{cache:'no-store'});return r.json()};
    const serie='OPSECRETO'+new Date().toISOString().replace(/\D/g,'').slice(0,14);   // 23 caracteres A-Z0-9

    chk(F,'o botão "⚠ Registrar defeito" está visível no cabeçalho',$('bRnc').offsetParent!==null,$('bRnc').textContent);
    passo('RNC: simulando falha do alternador de carga (Demo)');
    const falhaAlt=()=>{const k=window.RNC_DEFEITO.captura();return k.alarmes&&k.alarmes.temAlarme===true&&(k.grandezas||{}).alternador===0};
    chk(F,'Demo: falha do alternador de carga aparece nos dados do DSE simulado (alternador 0 V + alarme)',await ate(falhaAlt,8000),JSON.stringify((window.RNC_DEFEITO.captura().alarmes)||null).slice(0,120));
    const et=T.et;   // etapa de referência, lida DEPOIS da espera da falha simulada
    // 1) o que o botão vai anexar (fotografia da tela)
    const c=window.RNC_DEFEITO.captura(),g=c.grandezas||{};
    chk(F,'contexto: etapa e hora do ensaio',c.ensaio&&c.ensaio.iniciado===true&&c.ensaio.etapa===et&&c.ensaio.etapa_nome===ETAPAS[et].nome&&!!c.momento,JSON.stringify(c.ensaio||null).slice(0,160));
    chk(F,'contexto: grandezas elétricas lidas (≥ 6) e potência > 0 na etapa de '+ETAPAS[et].alvo+' %',Object.keys(g).length>=6&&g.kw>0,'n='+Object.keys(g).length+' kw='+g.kw+' carga%='+g.cargaPct);
    chk(F,'contexto: modelo do DSE e alarmes presentes',!!(c.modelo&&(c.modelo.dse||c.modelo.dse_texto))&&c.alarmes&&Array.isArray(c.alarmes.lista),JSON.stringify(c.modelo||null).slice(0,100));
    chk(F,'contexto: marca Demo (os dados são simulados)',c.demo===true,'demo='+c.demo);
    {const cc=window.RNC_DEFEITO.captura(),gg=cc.grandezas||{},nomes=((cc.alarmes||{}).lista||[]).map(x=>x.nome);
     chk(F,'contexto: anexa a falha do alternador (alternador 0 V, bateria < 26 V, alarme "Falha de carga do alternador")',gg.alternador===0&&gg.bateria<26&&nomes.includes('Falha de carga do alternador'),'alternador='+gg.alternador+' bateria='+gg.bateria+' alarmes='+nomes.join('|'))}
    // 2) abre a janela e confere o preenchimento automático
    passo('RNC: abrindo "Registrar defeito"');
    clica($('bRnc'),'Registrar defeito');
    const abriu=await ate(()=>$('dlgRnc')&&$('dlgRnc').open,4000);
    if(!chk(F,'o botão abre a janela "Registrar defeito"',abriu,'dlgRnc aberta='+abriu))return;
    chk(F,'a janela já traz o modelo e mostra o aviso de Demo',($('rncModelo').value||'').length>0&&$('rncDemo').style.display!=='none','modelo="'+$('rncModelo').value+'"');
    chk(F,'a janela mostra o que será anexado (JSON da tela)',/"etapa"/.test($('rncCtx').textContent)&&/"grandezas"/.test($('rncCtx').textContent),'');
    // 3) validação: sem descrição não grava
    const antes=(await api('/api/rnc/saude')).eventos;
    $('rncSerie').value=serie;$('rncSerie').dispatchEvent(new Event('input',{bubbles:true}));
    $('rncDesc').value='';$('rncNome').value='Operador oculto';
    clica($('rncEnv'),'Registrar (sem descrição)');await pausa(500);
    chk(F,'sem descrição: recusa e não grava',/Preencha/.test($('rncRes').textContent)&&(await api('/api/rnc/saude')).eventos===antes,$('rncRes').textContent.trim().slice(0,70));
    // 4) registra
    $('rncTipo').value='DEFEITO';
    $('rncDesc').value='Falha do alternador de carga: tensão do alternador 0 V com o motor em marcha, bateria descendo (24,8 V) e alarme "Falha de carga do alternador" no DSE, na etapa de '+ETAPAS[et].alvo+' % (registro automático do Operador oculto)';
    passo('RNC: registrando o defeito');
    clica($('rncEnv'),'Registrar e bloquear gerador');
    const salvou=await ate(()=>/Salvo\./.test($('rncRes').textContent),8000);
    if(!chk(F,'"Salvo" só aparece depois do servidor confirmar',salvou,$('rncRes').textContent.trim().slice(0,100))){try{$('dlgRnc').close()}catch(e){ /* ignorado: diálogo/seletor já fechado, cancelado ou sem permissão */ };return}
    // 5) o servidor realmente guardou (leitura de volta, sem confiar na tela)
    const s=await api('/api/rnc/serie/'+serie),r=(s.rncs||[])[0]||{},cx=r.contexto||{};
    chk(F,'servidor: série ficou BLOQUEADA com 1 RNC aberta',s.situacao==='BLOQUEADO'&&s.total===1&&r.estado==='ABERTA',s.situacao+' total='+s.total+' estado='+r.estado);
    chk(F,'servidor: descrição com prefixo [DEMO] e banco/tipo gravados',/^\[DEMO\]/.test(r.descricao||'')&&!!r.banco&&!!r.tipo_nc,(r.descricao||'').slice(0,40)+' | '+r.banco+' | '+r.tipo_nc);
    chk(F,'servidor: guardou a falha do alternador no contexto (alternador 0 V + alarme) e a descrição cita o alternador',/alternador/i.test(r.descricao||'')&&r.tipo_nc==='DEFEITO'&&((cx.grandezas||{}).alternador===0)&&((cx.alarmes||{}).lista||[]).some(x=>x.nome==='Falha de carga do alternador'),JSON.stringify((cx.alarmes||{}).lista||[]).slice(0,100)+' alternador='+(cx.grandezas||{}).alternador);
    chk(F,'servidor: o contexto da etapa '+(et+1)+' foi gravado (etapa, modelo, grandezas, alarmes)',cx.ensaio&&cx.ensaio.etapa===et&&cx.modelo&&Object.keys(cx.grandezas||{}).length>=6&&cx.alarmes&&cx.demo===true,JSON.stringify(cx.ensaio||null).slice(0,120));
    // 6) aviso: etiqueta + faixa aparecem para a série com RNC e somem para uma série limpa
    passo('RNC: conferindo o aviso "RNC: BLOQUEADO"');
    try{$('dlgRnc').close()}catch(e){ /* ignorado: diálogo/seletor já fechado, cancelado ou sem permissão */ }
    window.RNC_DEFEITO.pausa(true);   // o vigia do botão fica quieto durante a conferência do aviso
    window.RNC_DEFEITO.consulta(serie);
    const vis=id=>{const e=document.getElementById(id);return !!e&&getComputedStyle(e).display!=='none'};
    const apareceu=await ate(()=>vis('pRncAv')&&vis('rncFaixa'),5000);
    chk(F,'aviso: etiqueta "RNC: BLOQUEADO (n)" e faixa aparecem para a série com RNC pendente',apareceu&&/BLOQUEADO/.test($('pRncAv').textContent),$('pRncAv').textContent);
    window.RNC_DEFEITO.consulta('OPSECRETOLIMPA0000000');
    const sumiu=await ate(()=>!vis('pRncAv')&&!vis('rncFaixa'),5000);
    chk(F,'aviso: some para uma série sem RNC',sumiu,'etiqueta='+vis('pRncAv')+' faixa='+vis('rncFaixa'));
    chk(F,'o ensaio simulado continuou rodando (o aviso não bloqueia o ensaio)',T.started&&!T.fim,'started='+T.started+' fim='+T.fim);
    }finally{SB.rncPermite=false;SIM_FALHA_ALT=false;try{window.RNC_DEFEITO.pausa(false)}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }try{const d=$('dlgRnc');if(d&&d.open)d.close()}catch(e){ /* ignorado: diálogo/seletor já fechado, cancelado ou sem permissão */ }}   // (1) janela fechada em qualquer saída
    chk(F,'a falha simulada do alternador foi desarmada ao fim da fase (dados voltam ao normal)',await ate(()=>{const k=window.RNC_DEFEITO.captura();return k.alarmes&&k.alarmes.temAlarme===false&&(k.grandezas||{}).alternador>20},8000),JSON.stringify((window.RNC_DEFEITO.captura().grandezas||{}).alternador));
  }

  async function rodar(opt){
    opt=opt||{};
    if(OPS.rodando)return false;
    const modo=modoSim();
    if(modo==='real'||!$('demo').checked){alert('O Dev/Operador oculto só roda com o Demo ligado (Demo local ou Demo + PLC). No modo REAL ele não roda.');return false}
    if(!testeDesbloqueado)return false;
    if(T.started&&!T.fim){alert('Há um ensaio em andamento. Pare ou finalize o ensaio antes de rodar o Dev/Operador oculto.');return false}
    if($('dlgChSetup').open){alert('Feche o popup Setup antes de rodar o Dev/Operador oculto.');return false}
    const plc=modo==='demoPlc',ens=opt.ensaio!==false;
    if(plc){
      const txt='DEV/OPERADOR OCULTO em Demo + PLC\n\nEle vai apertar os botões de VERDADE no PLC:\n'
        +'• acionar UMA chave de cada banco de carga (liga e desliga) e selecionar chaves no Setup;\n'
        +(ens?'• rodar um ENSAIO COMPLETO: APAGA e REGRAVA o DB53 (registro do ensaio) e grava as 6 etapas.\n':'• (sem ensaio completo: o DB53 não é tocado)\n')
        +'\nConfirme que o DSE real está DESLIGADO e que nenhuma carga/gerador está conectado aos bancos. Continuar?';
      if(!confirm(txt))return false;
    }
    Object.assign(OPS,{rodando:true,parar:false,rel:[],fase:'',passo:'',modo,ini:Date.now(),fim:0,seq:0,erroJs:[],motivoAbort:''});
    const est=snapEstado();sandboxLiga();
    lg('info','Dev/Operador oculto: início',{modo,ensaio:ens,versao:VERSAO});
    ui();try{if($('dlgDemo').open)$('dlgDemo').close()}catch(e){ /* ignorado: diálogo/seletor já fechado, cancelado ou sem permissão */ }
    try{
      OPS.fase='0 · Chaves';ui();await preparaChaves();await estabilizaHabil();
      OPS.fase='A · Cargas';ui();
      if(modo==='demoLocal')await faseCargasLocal();else await faseCargasPlc();
      OPS.fase='B · Setup';ui();await faseSetup();
      if(ens){OPS.fase='C · Ensaio completo';ui();await faseEnsaio()}
      else aviso('Ensaio','fase não executada','desmarcada pelo desenvolvedor');
    }catch(e){
      if(e===ABORT)aviso('Operador','interrompido',OPS.motivoAbort||'pelo desenvolvedor (Parar)');
      else reg('falha','Operador','erro inesperado no próprio operador',String(e&&e.stack||e).slice(0,300));
    }
    OPS.fase='D · Restaurando';ui();
    const pararFlag=OPS.parar;OPS.parar=false;
    await restaura(est);sandboxDesliga();
    OPS.parar=pararFlag;
    chk('JavaScript','nenhum erro de JavaScript durante o teste',OPS.erroJs.length===0,OPS.erroJs.slice(0,3).join(' | '));
    OPS.rodando=false;OPS.fim=Date.now();OPS.fase='Concluído';OPS.passo='';
    const c=cont();
    lg(c.falha?'falha':'ok','Dev/Operador oculto: fim',{ok:c.ok,falha:c.falha,aviso:c.aviso,segundos:Math.round((OPS.fim-OPS.ini)/1000)});
    ui();
    return true;
  }

  /* =================== relatório e interface =================== */
  const hms=ms=>{const s=Math.round(ms/1000);return Math.floor(s/60)+'min '+String(s%60).padStart(2,'0')+'s'};
  function relatorioMd(){
    const c=cont();
    let md='# Dev/Operador oculto — relatório\n\n- Versão do HTML: '+VERSAO+'\n- Modo: '+(OPS.modo==='demoPlc'?'Demo + PLC':'Demo local')+'\n- Duração: '+hms((OPS.fim||Date.now())-OPS.ini)+'\n- Resultado: **'+c.ok+' OK · '+c.falha+' FALHA · '+c.aviso+' AVISO**\n\n';
    const por={};OPS.rel.forEach(r=>{(por[r.fase]=por[r.fase]||[]).push(r)});
    for(const f in por){md+='## '+f+'\n\n';por[f].forEach(r=>{md+='- '+(r.res==='ok'?'✔':r.res==='falha'?'✖ **FALHA**':'⚠')+' '+r.nome+(r.det?' — `'+r.det.replace(/`/g,"'")+'`':'')+'\n'});md+='\n'}
    return md;
  }
  const ic={ok:'✔',falha:'✖',aviso:'⚠'};let ultSg='';
  /* ===== v1.10.182 · fim visível + relatório salvo no navegador ===== */
  const LSREL='bt2.dev.ultimoRel';let PERS=null;try{PERS=JSON.parse(localStorage.getItem(LSREL)||'null')}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
  if(!PERS){try{if(/^BT2REL:/.test(window.name))PERS=JSON.parse(window.name.slice(7))}catch(e){ /* ignorado: texto inválido: segue com o valor padrão */ }}   // v1.10.185: arquivo aberto de Downloads (content://) pode não ter localStorage
  const FIMBAR={on:false,fechado:false,tit:'',msg:'',cnt:''};
  if(PERS&&PERS.rodando){FIMBAR.on=true;FIMBAR.tit='interrompido';FIMBAR.msg='a página recarregou ou fechou no meio do teste · último relatório salvo às '+new Date(PERS.t).toLocaleTimeString('pt-BR')+(function(){try{const u=localStorage.getItem('bt2.dev.ultimaAcao');return u?' · última ação antes de sair: '+u:''}catch(e){return ''}})();FIMBAR.cnt='✔ '+((PERS.cnt||{}).ok||0)+'  ✖ '+((PERS.cnt||{}).falha||0)+'  ⚠ '+((PERS.cnt||{}).aviso||0)}
  const textoRel=()=>OPS.rel.length?relatorioAv():((PERS&&PERS.md)||'');
  function ui(){
    try{
      const c=cont(),bar=$('opsBar'),res=$('opsRes'),btn=$('opsIni'),info=$('opsInfo');
      if(bar){
        if(!OPS.rodando&&OPS.fim&&!FIMBAR.fechado&&!FIMBAR.on&&!(PERS&&PERS.rodando&&!OPS.rel.length)){FIMBAR.on=true;FIMBAR.tit=OPS.motivoAbort?'interrompido':'concluído';FIMBAR.msg=(OPS.motivoAbort||'fim normal')+' · '+hms(OPS.fim-OPS.ini)+' · toque em Relatório'}
        const mostra=OPS.rodando||FIMBAR.on;bar.hidden=!mostra;bar.classList.toggle('fim',!OPS.rodando&&FIMBAR.on);
        if(mostra){
          bar.querySelector('.opsTit').textContent='🕵️ Dev/Operador oculto · '+(OPS.rodando?(OPS.fase||'…'):FIMBAR.tit);
          bar.querySelector('.opsPasso').textContent=OPS.rodando?(OPS.passo||''):FIMBAR.msg;
          bar.querySelector('.opsCnt').textContent=(!OPS.rodando&&!OPS.rel.length&&FIMBAR.cnt)?FIMBAR.cnt:'✔ '+c.ok+'  ✖ '+c.falha+'  ⚠ '+c.aviso;
          bar.classList.toggle('bad',c.falha>0||(!OPS.rodando&&!OPS.rel.length&&/✖ [1-9]/.test(FIMBAR.cnt)));
          try{ // fica por cima dos popups modais (top layer); só re-eleva quando muda a pilha de popups abertos
            if(typeof bar.showPopover==='function'){
              if(!bar.hasAttribute('popover'))bar.setAttribute('popover','manual');
              const sg=[...document.querySelectorAll('dialog[open]')].map(d=>d.id).join('|');
              if(!bar.matches(':popover-open')||sg!==ultSg){ultSg=sg;if(bar.matches(':popover-open'))bar.hidePopover();bar.showPopover()}
            }
          }catch(e){ /* ignorado: popover já no estado pedido ou sem suporte */ }
        }else{try{if(bar.hasAttribute('popover')&&bar.matches(':popover-open'))bar.hidePopover()}catch(e){ /* ignorado: popover já no estado pedido ou sem suporte */ }}
      }
      if(btn){
        const real=!$('demo').checked||modoSim()==='real';
        btn.disabled=OPS.rodando||real;
        btn.title=real?'Só roda com o Demo ligado (Demo local ou Demo + PLC) — nunca no modo REAL.':'Aperta os botões como um operador e confere cada trava';
      }
      if(info){
        const c2=cont(),m=OPS.modo||modoSim();
        info.textContent=OPS.rodando?('Rodando — '+(OPS.fase||'')+' · '+(OPS.passo||'')+' · Esc ou "Parar" interrompe.')
          :OPS.fim?('Última execução: '+(OPS.modo==='demoPlc'?'Demo + PLC':'Demo local')+' · '+hms(OPS.fim-OPS.ini)+' · '+c2.ok+' OK · '+c2.falha+' FALHA · '+c2.aviso+' AVISO. Os eventos estão no Log (card DEV.OPS).')
          :(m==='real'||!$('demo').checked?'Ligue o Demo (① Demo) para liberar o Dev/Operador oculto. No modo REAL ele não roda.':(m==='demoPlc'?'Demo + PLC: vai acionar chaves e (se marcado) regravar o DB53 de VERDADE no PLC — pede confirmação.':'Demo local: tudo 100% no navegador (localStorage), nada sai para o PLC.'));
      }
      if(res){
        const falhas=OPS.rel.filter(r=>r.res!=='ok').slice(-60);
        const ult=OPS.rel.slice(-4);
        const lista=(OPS.rodando?ult:falhas);
        res.innerHTML=(OPS.rel.length?'<div class="opsSum"><b>'+c.ok+'</b> OK · <b class="'+(c.falha?'bad':'')+'">'+c.falha+'</b> FALHA · <b>'+c.aviso+'</b> AVISO</div>':'')
          +lista.map(r=>'<div class="opsLin '+r.res+'"><span>'+ic[r.res]+'</span><span><b>'+esc(r.fase)+'</b> · '+esc(r.nome)+(r.det?'<small> — '+esc(r.det.slice(0,160))+'</small>':'')+'</span></div>').join('');
        const bc=$('opsCopia');if(bc)bc.disabled=!OPS.rel.length&&!(PERS&&PERS.md);
      }
    }catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
  }
  async function copia(){
    const md=textoRel();let ok=false,via='';
    try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(md);ok=true;via='área de transferência'}}catch(e){ /* ignorado: API opcional do navegador */ }
    if(!ok){try{const host=document.querySelector('dialog[open]')||document.body;   // v1.10.181: com popup modal aberto o <body> é inerte: o campo temporário tem de nascer dentro do popup
      const ta=document.createElement('textarea');ta.value=md;ta.setAttribute('readonly','');ta.style.cssText='position:absolute;left:0;top:0;width:1px;height:1px;opacity:0';host.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,md.length);ok=document.execCommand('copy');ta.remove();via='cópia alternativa'}catch(e){ /* ignorado: elemento ausente ou sem suporte */ }}
    const tx=$('opsTexto');if(tx){tx.value=md;tx.hidden=false}   // sempre mostra o texto: se a cópia falhar, é só tocar e segurar > Selecionar tudo > Copiar
    const b=$('opsCopia');if(b){const t=b.dataset.rot||b.textContent;b.dataset.rot=t;b.textContent=ok?'Copiado! (confira colando)':'Não consegui copiar — use o texto abaixo';setTimeout(()=>{b.textContent=t},2600)}
  }
  async function compartilha(){try{await navigator.share({title:'Relatório Dev/Operador oculto',text:textoRel()})}catch(e){ /* ignorado: API opcional do navegador */ }}
  const dsp=$('opsDisp');if(dsp){try{dsp.value=localStorage.getItem('bt2.dev.nomeDisp')||''}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }dsp.addEventListener('input',()=>{try{localStorage.setItem('bt2.dev.nomeDisp',dsp.value.trim())}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }})}
  const ini=$('opsIni');if(ini)ini.onclick=()=>{const m=($('opsModo')||{}).value||'rapido';if(m==='rapido')rodar({ensaio:$('opsEnsaio').checked});else rodarAv({tipo:m==='monkey'?'monkey':m==='visual'?'visual':'avancado',semente:($('opsSemente')||{}).value,minutos:($('opsDur')||{}).value})};
  const pa=$('opsParar');if(pa)pa.onclick=()=>{if(OPS.rodando){OPS.parar=true;OPS.motivoAbort='botão Parar';ui()}};
  const co=$('opsCopia');if(co)co.onclick=copia;
  const sh=$('opsShare');if(sh){if(navigator.share)sh.hidden=false;sh.onclick=compartilha}
  (function(){ // v1.10.182: botões do fim, salvamento periódico do relatório e Central/Imprimir com o relatório salvo
    const rel=$('opsBRel'),cop=$('opsBCop'),fim=$('opsBFim');let salvoFim=false;
    if(rel)rel.onclick=()=>{try{$('bDemo').click()}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }};
    if(cop)cop.onclick=copia;
    const bx=$('opsBBx');if(bx)bx.onclick=()=>{try{const nm=(((document.getElementById('opsDisp')||{}).value)||'dispositivo').replace(/[^\w\-]+/g,'_'),d=new Date(),dt=d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2)+'_'+('0'+d.getHours()).slice(-2)+('0'+d.getMinutes()).slice(-2),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([textoRel()],{type:'text/markdown'}));a.download='dev_operador_oculto_'+nm+'_'+dt+'.md';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}catch(e){ /* ignorado: API opcional do navegador */ }};
    if(fim)fim.onclick=()=>{FIMBAR.fechado=true;FIMBAR.on=false;ui()};
    const dc=$('opsDica');if(dc){dc.onchange=()=>{try{window.DICAUI&&window.DICAUI.liga(dc.checked,false)}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }};setInterval(()=>{try{if(window.DICAUI&&document.activeElement!==dc)dc.checked=!!window.DICAUI.ativo()}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }},700)}
    setInterval(()=>{if(OPS.rodando){try{const b=$('opsBar');if(b){const mods=[...document.querySelectorAll('dialog[open]')].filter(d=>{try{return d.matches(':modal')}catch(e){return false}}),alvo=mods.length?mods[mods.length-1]:document.body;if(b.parentElement!==alvo){const abertoAntes=b.matches(':popover-open');try{if(abertoAntes)b.hidePopover()}catch(e){ /* ignorado: popover já no estado pedido ou sem suporte */ }alvo.appendChild(b);try{if(abertoAntes)b.showPopover()}catch(e){ /* ignorado: popover já no estado pedido ou sem suporte */ }}let coberta=!b.matches(':popover-open');if(!coberta){const r=b.getBoundingClientRect(),t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);coberta=!t||!b.contains(t)}if(coberta){ui();if(b.matches(':popover-open')){b.hidePopover();b.showPopover()}}}}catch(e){ /* ignorado: popover já no estado pedido ou sem suporte */ }}},250);
    setInterval(()=>{try{
      if(OPS.rodando){salvoFim=false;FIMBAR.on=false;FIMBAR.fechado=false}
      if(OPS.rodando||(OPS.fim&&!salvoFim&&OPS.rel.length)){const o={t:Date.now(),rodando:!!OPS.rodando,md:relatorioAv(),cnt:cont()};try{localStorage.setItem(LSREL,JSON.stringify(o))}catch(x){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }try{window.name='BT2REL:'+JSON.stringify(o)}catch(x){ /* ignorado: texto inválido: segue com o valor padrão */ }PERS=o;if(!OPS.rodando)salvoFim=true}
    }catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }},4000);
    ui();
  })();

  setInterval(()=>{if($('dlgDemo').open)ui()},1000);
  /* =================== DEV/OPERADOR OCULTO — modos AVANÇADO e MONKEY (v1.10.175) =================== */
  /* FRAGMENTO inserido DENTRO do módulo do Operador secreto (usa OPS, reg, chk, aviso, ate, pausa, passo, ABORT, modoSim, snapEstado, restaura, faseEnsaio, garanteGerador).
     O QUE FAZ (leigo): além das fases de antes (modo RÁPIDO), percorre TODOS os objetos da tela (botões, campos, listas, abas, chaves, janelas), com estes passos para cada um:
       confere se dá para clicar (nada cobre), aciona, vê o que mudou (janela que abriu, onde abriu, se cabe na tela, se fecha pelo ✕/Esc/clique fora e se reabre), e confere os erros.
       Também testa o menu do botão direito, o Patamar guiado e o ensaio. Modo MONKEY: cliques aleatórios com SEMENTE fixa (reproduzível) por alguns minutos.
     ONDE RODA: SÓ em Demo LOCAL (nunca REAL, nunca Demo + PLC: cliques em massa gravariam no PLC). Fica numa CAIXA DE AREIA: bloqueia e CONTA envio de rede (POST/PUT/DELETE), impressão,
       janela nova, alerta/confirmação, download e seletor de arquivo/pasta. Parar: botão "Parar" ou Esc. No fim devolve a tela ao estado de antes.
     LIMITE (honesto): o robô clica por dentro da página (element.click()); ARRASTAR janela com mouse/dedo de verdade é provado pelo teste externo (Playwright), não por aqui. */
  const AV={cob:{total:0,acionados:0,nao:[]},efeitos:{},semente:20261107,vistos:new Map(),perfil:{},fase:'',janelas:{},achados:0};
  const mulberry=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const NAO_CLICAR=new Set(['demo','dmPlc','demoSenha','bDemoLock','srvUrl','srvLimpa','url','go','opsIni','opsParar','opsCopia','opsEnsaio','opsModo','opsSemente','opsDur','bDevObs','obsAbre','bParaEns']);
  const SEL_INT='button,summary,input:not([type=hidden]),select,textarea,[role=button],[role=tab],.tile[data-i]';
  const dentroDe=(el,sel)=>!!(el.closest&&el.closest(sel));
  const vis=el=>{const r=el.getBoundingClientRect(),cs=getComputedStyle(el);return cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0&&r.height>0};

  /* ---------- caixa de areia ---------- */
  const SB={ativo:false,orig:{},c:{print:0,janelaNova:0,alerta:0,confirmacao:0,prompt:0,redeBloqueada:0,seletor:0,download:0,navegacao:0}};
  const sbClique=e=>{if(e.target&&e.target.id==='chkPlcNovos'){e.preventDefault();e.stopImmediatePropagation();SB.c.navegacao++;return}const a=e.target&&e.target.closest&&e.target.closest('a[href]');if(a){if(a.hasAttribute('download')){e.preventDefault();SB.c.download++;return}if(!/^#/.test(a.getAttribute('href')||'')){e.preventDefault();if(a.target==='_blank')SB.c.janelaNova++;else SB.c.navegacao++}}};   // link que sairia da página
  const sbSai=e=>{SB.c.navegacao++;try{localStorage.setItem('bt2.dev.ultimaAcao',AV.ultimoObj||'')}catch(x){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }e.preventDefault();e.returnValue=''};   // reload/location: pede para ficar
  function sandboxLiga(){
    if(SB.ativo)return;SB.ativo=true;Object.keys(SB.c).forEach(k=>SB.c[k]=0);const o=SB.orig;
    o.print=window.print;o.ai=window.__autoImprime;window.__autoImprime=function(){SB.c.print++};o.open=window.open;o.alert=window.alert;o.confirm=window.confirm;o.prompt=window.prompt;o.fetch=window.fetch;o.xo=XMLHttpRequest.prototype.open;o.xs=XMLHttpRequest.prototype.send;o.ac=HTMLAnchorElement.prototype.click;o.pk={};
    window.print=()=>{SB.c.print++};window.open=()=>{SB.c.janelaNova++;return null};window.alert=()=>{SB.c.alerta++};window.confirm=()=>{SB.c.confirmacao++;return true};window.prompt=(m,d)=>{SB.c.prompt++;return d||''};
    window.fetch=function(i,init){const m=String((init&&init.method)||(i&&i.method)||'GET').toUpperCase();if(m!=='GET'&&m!=='HEAD'&&!(SB.rncPermite&&m==='POST'&&/\/api\/rnc\/abrir(\?|$)/.test(String((i&&i.url)||i)))){SB.c.redeBloqueada++;return Promise.resolve(new Response('{"ok":false,"erro":"bloqueado pela caixa de areia do Dev/Operador oculto"}',{status:503,headers:{'Content-Type':'application/json'}}))}return o.fetch.apply(this,arguments)};
    XMLHttpRequest.prototype.open=function(m){this.__m=String(m).toUpperCase();return o.xo.apply(this,arguments)};
    XMLHttpRequest.prototype.send=function(){if(this.__m&&this.__m!=='GET'&&this.__m!=='HEAD'){SB.c.redeBloqueada++;try{this.abort()}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }return}return o.xs.apply(this,arguments)};
    HTMLAnchorElement.prototype.click=function(){if(this.hasAttribute&&this.hasAttribute('download')){SB.c.download++;return}return o.ac.apply(this,arguments)};
    document.addEventListener('click',sbClique,true);window.addEventListener('beforeunload',sbSai);
    ['showDirectoryPicker','showOpenFilePicker','showSaveFilePicker'].forEach(k=>{if(window[k]){o.pk[k]=window[k];window[k]=async()=>{SB.c.seletor++;throw new DOMException('cancelado pela caixa de areia','AbortError')}}});
  }
  function sandboxDesliga(){
    if(!SB.ativo)return;SB.ativo=false;const o=SB.orig;
    window.print=o.print;window.__autoImprime=o.ai;window.open=o.open;window.alert=o.alert;window.confirm=o.confirm;window.prompt=o.prompt;window.fetch=o.fetch;XMLHttpRequest.prototype.open=o.xo;XMLHttpRequest.prototype.send=o.xs;HTMLAnchorElement.prototype.click=o.ac;
    Object.keys(o.pk).forEach(k=>{window[k]=o.pk[k]});
    document.removeEventListener('click',sbClique,true);window.removeEventListener('beforeunload',sbSai);
  }

  /* ---------- leitura da tela ---------- */
  function perfil(){
    const toque=matchMedia('(pointer:coarse)').matches,menor=Math.min(screen.width||innerWidth,screen.height||innerHeight),movel=!!(navigator.userAgentData&&navigator.userAgentData.mobile)||/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
    let nome='';try{nome=(localStorage.getItem('bt2.dev.nomeDisp')||'').trim()}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
    const tipo=(toque&&(movel||menor<600))?'celular':(toque&&menor<1100?'tablet':(toque?'PC/notebook com tela de toque':'PC/notebook (o navegador não distingue)'));
    const zoomNav=(outerWidth&&innerWidth)?Math.round(outerWidth/innerWidth*100):0;
    const p={larg:innerWidth,alt:innerHeight,dpr:+(devicePixelRatio||1).toFixed(2),toque,ua:navigator.userAgent.slice(0,90),nome,tipo,zoomNav,telaFisica:(screen.width||0)+'×'+(screen.height||0)};
    AV.perfil=p;return p;
  }
  const idEl=el=>el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(el.dataset&&el.dataset.gd?'[gd='+el.dataset.gd+(el.dataset.k?':'+el.dataset.k:'')+']':'');
  const nomeEl=el=>String(el.getAttribute('aria-label')||el.title||el.textContent||el.value||el.placeholder||el.id||'').replace(/\s+/g,' ').trim().slice(0,38);
  function enumera(escopoDlg){ // objetos interativos VISÍVEIS (da página principal, ou de uma janela aberta)
    const out=[];
    document.querySelectorAll(SEL_INT).forEach(el=>{
      if(!vis(el))return;
      const dlg=el.closest('dialog'),ido=dlg?dlg.id:'';
      if(dlg&&!dlg.open)return;
      if(escopoDlg){if(ido!==escopoDlg)return}else if(ido&&ido!=='dlgGuiado')return;
      if(NAO_CLICAR.has(el.id)||dentroDe(el,'#opsBar,#opsBox,#dlgDemo'))return;
      {const dt=el.closest('details');if(dt&&!dt.open&&!el.closest('summary'))return}   // dentro de <details> fechado: o operador não vê nem clica (abre-se pelo summary; a 2ª passada pega o que apareceu)
      if(el.type==='file'||el.hasAttribute('data-ops-skip'))return;
      out.push(el);
    });
    return out;
  }
  const estadoRapido=()=>({dlgs:[...document.querySelectorAll('dialog[open]')].map(d=>d.id).filter(Boolean),pops:[...document.querySelectorAll('[popover]')].filter(e=>{try{return e.id!=='opsBar'&&e.matches(':popover-open')}catch(x){return false}}).length,
    msg:(typeof gmsg==='function')?gmsg():'',ovx:document.documentElement.scrollWidth>innerWidth+1,sw:document.documentElement.scrollWidth,ev:(window.OBS_LOG?window.OBS_LOG.eventos().length:0),gen:SIM.gen,ens:T.started?(T.fim?'fim':'andamento'):'parado'});
  function sonda(el){ // dá para clicar? (nada cobre o centro do objeto). A barra flutuante do PRÓPRIO robô fica invisível durante a medida (não conta como cobertura).
    try{el.scrollIntoView({block:'center',inline:'center'})}catch(e){ /* ignorado: elemento ausente ou sem suporte */ }
    const bar=$('opsBar'),vb=bar?bar.style.visibility:'';if(bar)bar.style.visibility='hidden';
    {const dt=el.closest('details');if(dt&&!dt.open&&!el.closest('summary')){if(bar)bar.style.visibility=vb;return{oculto:true,dentro:true,ok:true}}}   // grupo recolhido: não está na tela
    const r=el.getBoundingClientRect();
    if(r.width<=0||r.height<=0){if(bar)bar.style.visibility=vb;return{oculto:true,dentro:true,ok:true}}   // o objeto sumiu/escondeu (ex.: botão de outro modo): não é cobertura
    const x=r.left+r.width/2,y=r.top+r.height/2,dentro=x>=0&&y>=0&&x<=innerWidth&&y<=innerHeight;
    const top=dentro?document.elementFromPoint(x,y):null;
    if(bar)bar.style.visibility=vb;
    const ok=!!top&&(top===el||el.contains(top)||top.contains(el)||(el.labels&&[...el.labels].some(l=>l===top||l.contains(top)))||(!!el.closest('label')&&el.closest('label').contains(top)));
    return{dentro,ok,x,y,w:r.width,h:r.height,cob:ok?'':(top?idEl(top)+(top.closest('dialog')?' (em '+top.closest('dialog').id+')':'')+' ret='+[top.getBoundingClientRect().left,top.getBoundingClientRect().top,top.getBoundingClientRect().width,top.getBoundingClientRect().height].map(Math.round)+' objeto='+[r.left,r.top,r.width,r.height].map(Math.round)+' scrollY='+Math.round(scrollY)+' html='+top.outerHTML.slice(0,70).replace(/\s+/g,' '):'fora da tela')};
  }
  function geomJanela(d){
    const r=d.getBoundingClientRect(),hd=d.querySelector('.jt,.pia-top,header')||d,hr=hd.getBoundingClientRect(),fx=d.querySelector('[data-fecha],.jx,.dlgx'),fr=fx?fx.getBoundingClientRect():null;
    const vok=rr=>!!rr&&rr.width>0&&rr.left>=-1&&rr.top>=-1&&rr.right<=innerWidth+1&&rr.bottom<=innerHeight+1;
    const cx=Math.max(0,Math.min(innerWidth-1,hr.left+Math.min(hr.width/2,60))),cy=Math.max(0,Math.min(innerHeight-1,hr.top+hr.height/2)),top=document.elementFromPoint(cx,cy);
    return{l:Math.round(r.left),t:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),tituloOk:vok(hr),fecharOk:fx?vok(fr):null,temFechar:!!fx,topo:!!top&&top.closest&&top.closest('dialog')===d,cabeLarg:r.width<=innerWidth+1,fx};
  }
  const achou=(fase,nome,det)=>{AV.achados++;return reg('falha',fase,nome,det)};
  const fecharTudo=()=>{document.querySelectorAll('dialog[open]').forEach(d=>{if(d.id!=='dlgGuiado'){try{d.close()}catch(e){ /* ignorado: diálogo/seletor já fechado, cancelado ou sem permissão */ }}});document.querySelectorAll('[popover]').forEach(e=>{try{if(e.matches(':popover-open')&&e.id!=='opsBar')e.hidePopover()}catch(x){ /* ignorado: popover já no estado pedido ou sem suporte */ }})};
  const esc_=()=>{const ev={key:'Escape',code:'Escape',keyCode:27,bubbles:true,cancelable:true};document.dispatchEvent(new KeyboardEvent('keydown',ev));document.dispatchEvent(new KeyboardEvent('keyup',ev))};

  /* ---------- janelas: onde abre, cabe, por cima, fecha (✕, Esc, fora), reabre ---------- */
  async function testaJanela(id,gatilho,prof,fase){
    const d=$(id);if(!d||!d.open)return;
    const g=geomJanela(d),obj='janela '+id;
    AV.janelas[id]={l:g.l,t:g.t,w:g.w,h:g.h};
    if(!g.tituloOk)achou(fase,obj+': barra de título fora da tela','posição '+g.l+','+g.t+' tamanho '+g.w+'×'+g.h+' na tela '+innerWidth+'×'+innerHeight);
    if(g.temFechar&&g.fecharOk===false)achou(fase,obj+': botão ✕ fora da tela','posição '+g.l+','+g.t+' tamanho '+g.w+'×'+g.h+' na tela '+innerWidth+'×'+innerHeight+' — o operador não consegue fechar');
    if(!g.temFechar)aviso(fase,obj+': sem botão ✕ identificável','data-fecha/.jx ausentes');
    if(!g.topo)achou(fase,obj+': título coberto por outro elemento','nada recebe o clique na barra de título');
    if(!g.cabeLarg)aviso(fase,obj+': mais larga que a tela',g.w+' > '+innerWidth);
    if(prof<2&&id!=='dlgDemo')await varre(id,prof+1,gatilho,fase);
    if(!$(id).open&&gatilho){const t=gatilho();if(t&&vis(t)){clica(t,'reabrir '+id);await pausa(220)}}
    if(!$(id).open)return;
    // fechar: ✕
    let fechou=false;
    if(g.fx){try{g.fx.scrollIntoView({block:'nearest'})}catch(e){ /* ignorado: elemento ausente ou sem suporte */ }g.fx.click();await pausa(220);fechou=!$(id).open}
    if(!fechou){ // Esc com foco dentro da janela
      try{const f=$(id).querySelector('button,input,select,summary');if(f)f.focus()}catch(e){ /* ignorado: elemento ausente ou sem suporte */ }
      esc_();await pausa(220);const porEsc=!$(id).open;
      if(porEsc&&g.fx)achou(fase,obj+': o ✕ NÃO fechou (só o Esc fechou)','clique no botão fechar sem efeito');
      fechou=porEsc;
    }
    if(!fechou&&!('nofora' in $(id).dataset)){$(id).click();await pausa(200);fechou=!$(id).open}  // clique fora
    if(!fechou){achou(fase,obj+': NÃO fecha','nem ✕, nem Esc, nem clique fora');try{$(id).close()}catch(e){ /* ignorado: diálogo/seletor já fechado, cancelado ou sem permissão */ }}
    // reabrir pelo mesmo gatilho
    if(fechou&&gatilho){const t=gatilho();if(t&&vis(t)){clica(t,'reabrir '+id);await pausa(250);if(!$(id).open)aviso(fase,obj+': depois de fechada não reabre pelo mesmo botão','');fecharTudo();await pausa(100)}}
  }

  /* ---------- aciona um objeto ---------- */
  const VALORES=['','0','-1','999999','abc','1e9','9'.repeat(30)];
  async function aciona(el){
    const tag=el.tagName.toLowerCase(),tp=el.type||'';
    if(tag==='input'&&['text','number','search','tel','email',''].includes(tp)){
      const orig=el.value;
      for(const v of VALORES.concat([orig])){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));await pausa(25)}
      return 'campo: '+VALORES.length+' valores';
    }
    if(tag==='select'){const ops=[...el.options].map(o=>o.value).slice(0,12),orig=el.value;for(const v of ops){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));await pausa(30)}el.value=orig;el.dispatchEvent(new Event('change',{bubbles:true}));return 'lista: '+ops.length+' opções'}
    if(tag==='input'&&tp==='range'){const orig=el.value;for(const f of [0,1,0.5]){el.value=+el.min+f*(+el.max-+el.min);el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}el.value=orig;el.dispatchEvent(new Event('input',{bubbles:true}));return 'deslizante: mín/máx/meio'}
    if(tag==='input'&&(tp==='checkbox'||tp==='radio')){el.click();await pausa(60);if(tp==='checkbox')el.click();return tp+': alternou'}
    el.click();return 'clique';
  }

  /* ---------- varredura (página principal ou dentro de uma janela) ---------- */

  /* ---------- v1.10.199: INSPEÇÃO VISUAL DE DESIGN (só leitura) ---------- */
  const fotoLayout=()=>[...document.querySelectorAll('section.panel,.col,.card,.hrow')].filter(e=>e.offsetParent).map(e=>{const r=e.getBoundingClientRect();return[(e.id||e.className||e.tagName).toString().slice(0,26),Math.round(r.top),Math.round(r.left),Math.round(r.width),Math.round(r.height)]}).concat([['rolagem',document.documentElement.scrollWidth,document.documentElement.scrollHeight,0,0]]);
  const difLayout=(a,b)=>{const out=[];const n=Math.max(a.length,b.length);for(let i=0;i<n;i++){const x=a[i]||[],y=b[i]||[];if(x.join()!==y.join())out.push((x[0]||y[0])+': '+x.slice(1).join(',')+' → '+y.slice(1).join(','))}return out};
  async function inspecionaLayout(el,obj,fase){ // foca/passa o mouse no objeto e confere que NADA se mexeu; devolve ao estado de antes
    try{
      const f0=fotoLayout();
      try{el.focus({preventScroll:true})}catch(e){ /* ignorado: elemento ausente ou sem suporte */ }
      ['pointerover','mouseover'].forEach(t=>{try{el.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,view:window}))}catch(e){ /* ignorado: API opcional do navegador */ }});
      await pausa(180);
      const f1=fotoLayout(),d=difLayout(f0,f1),tip=document.getElementById('ibubTip');
      if(tip&&getComputedStyle(tip).display!=='none'){const q=tip.getBoundingClientRect();if(q.left<0||q.top<0||q.right>innerWidth||q.bottom>innerHeight)aviso(fase,'balão fora da tela: '+obj,Math.round(q.left)+','+Math.round(q.top)+' '+Math.round(q.width)+'×'+Math.round(q.height)+' na tela '+innerWidth+'×'+innerHeight)}
      ['pointerout','mouseout'].forEach(t=>{try{el.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,view:window}))}catch(e){ /* ignorado: API opcional do navegador */ }});try{el.blur()}catch(e){ /* ignorado: elemento ausente ou sem suporte */ }
      await pausa(60);AV.insp=(AV.insp||0)+1;
      if(d.length){AV.inspRuim=(AV.inspRuim||0)+1;achou(fase,'layout muda ao passar o mouse/focar: '+obj,d.slice(0,4).join(' · ')+(d.length>4?' · …+'+(d.length-4):'')+' (tela '+innerWidth+'×'+innerHeight+')')}
    }catch(e){ /* ignorado: elemento ausente ou sem suporte */ }
  }
  async function faseVisual(){ // modo "Inspeção visual (rápida)": só olha (foca/passa o mouse), não clica; página principal + janela ⚙ Modo
    const F='V · Inspeção visual';AV.insp=0;AV.inspRuim=0;
    const insp=async(esc)=>{const raiz=esc?$(esc):document;   // objetos clicáveis + PORTADORES DE BALÃO (ⓘ, chips com data-tip), que não são botões e por isso ficavam de fora
      const bal=[...raiz.querySelectorAll('.ibub,#modoCard .lk,[data-tip]')].filter(e=>vis(e)&&(esc?e.closest('dialog')===raiz:(!e.closest('dialog')||e.closest('dialog').id==='dlgGuiado'))&&!dentroDe(e,'#opsBar,#opsBox,#dlgDemo'));
      const vistos=new Set();for(const el of [...enumera(esc),...bal]){if(OPS.parar)throw ABORT;if(vistos.has(el))continue;vistos.add(el);if(!document.contains(el)||el.disabled)continue;const s=sonda(el);if(!s.dentro||s.oculto||!s.ok)continue;await inspecionaLayout(el,(esc?'['+esc+'] ':'')+idEl(el)+' "'+nomeEl(el)+'"',F)}};
    await insp('');
    const g=$('bModo');if(g&&vis(g)){clica(g,'abrir ⚙ Modo');await pausa(300);if($('dlgModo').open){await insp('dlgModo');fecharTudo();await pausa(100)}}
    reg(AV.inspRuim?'falha':'ok',F,'objetos inspecionados',AV.insp+' objetos · '+(AV.inspRuim||0)+' com layout instável ao passar o mouse/focar');
  }

  /* v1.10.200: o Patamar Guiado LIGADO (ex.: salvamento "Por patamar" liga sozinho) é dono das chaves: com o patamar em manual a mãe espera o "Aplicar" e o operador simulado em Auto não sobe a carga.
     O robô desliga o Patamar para o ensaio dele e religa no fim (como o operador deixou). */
  let GUI_DESLIGOU=false;
  function normalizaPatamar(){try{const G=window.GUIADO_DBG&&window.GUIADO_DBG.G;if(!G||!G.guiadoOn)return false;G.guiadoOn=false;G.guiadoOff=true;GUI_DESLIGOU=true;if(window.PATAMAR_GUIADO_PARA)window.PATAMAR_GUIADO_PARA('Dev/Operador oculto: ensaio com operador Auto');return true}catch(e){return false}}
  let SALVA_ROBO=null;
  function normalizaSalvamento(){try{const a=salvaModo();if(a==='M')return false;SALVA_ROBO=a;setSalva('M');return true}catch(e){return false}}
  function restauraSalvamento(){try{if(!SALVA_ROBO)return false;const a=SALVA_ROBO;SALVA_ROBO=null;setSalva(a);return true}catch(e){return false}}
  function restauraPatamar(){try{const G=window.GUIADO_DBG&&window.GUIADO_DBG.G;if(!GUI_DESLIGOU||!G)return false;GUI_DESLIGOU=false;G.guiadoOn=true;G.guiadoOff=false;return true}catch(e){return false}}
  const desabilitadosTela=()=>{const m=new Map();document.querySelectorAll('button,input:not([type=hidden]),select').forEach(e=>{if(!vis(e)||e.closest('dialog')&&e.closest('dialog').id!=='dlgGuiado'||dentroDe(e,'#opsBar,#opsBox'))return;m.set(idEl(e)+'|'+nomeEl(e),!!e.disabled)});return m};
  async function varre(escopoDlg,prof,gatilhoPai,fase){
    const lista=enumera(escopoDlg||'');
    for(const el of lista){
      if(OPS.parar)throw ABORT;
      if(!document.contains(el))continue;
      const chave=(escopoDlg||'')+'|'+el.tagName+'|'+el.type+'|'+el.id+'|'+nomeEl(el)+'|'+(el.dataset&&el.dataset.gd||'');
      const n=AV.vistos.get(chave)||0;if(n>=2)continue;AV.vistos.set(chave,n+1);
      if(escopoDlg&&!$(escopoDlg).open){ // a janela fechou (botão legítimo): reabre
        if(gatilhoPai){const t=gatilhoPai();if(t&&vis(t)){clica(t,'reabrir '+escopoDlg);await pausa(250)}}
        if(!$(escopoDlg).open){AV.cob.nao.push('['+escopoDlg+'] restante da janela [fechou e não reabriu]');return}
      }
      if(escopoDlg&&el.matches('[data-fecha],.jx,.dlgx'))continue;  // o ✕ é testado em testaJanela
      AV.cob.total++;
      const obj=(escopoDlg?'['+escopoDlg+'] ':'')+idEl(el)+' "'+nomeEl(el)+'"';
      if(AV.perfil.toque){const r=el.getBoundingClientRect(),m=Math.min(r.width,r.height);if(m>0&&m<24)aviso(fase,'alvo de toque muito pequeno: '+obj,Math.round(r.width)+'×'+Math.round(r.height)+' px (mínimo recomendado 44)');}
      if(el.disabled){AV.cob.nao.push(obj+' [desabilitado]');continue}
      if(!escopoDlg&&document.querySelector('dialog[open]:not(#dlgGuiado)')){fecharTudo();await pausa(70)}   // sobrou janela aberta de um passo anterior: fecha antes de medir (senão ela 'cobre' a tela)
      let s=sonda(el);
      if(!s.ok&&/gmsg/.test(String(s.cob))){AV.toast=(AV.toast||0)+1;if(AV.toast===1)aviso(fase,'a faixa de mensagem (#gmsg) fica por cima de botões enquanto aparece','ex.: '+obj+' — some sozinha em alguns segundos; no celular cobre parte do fim da tela');try{msgGer('')}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }await pausa(150);s=sonda(el)}   // aviso transitório: limpa e mede de novo
      if(s.oculto){AV.cob.nao.push(obj+' [escondido agora]');AV.cob.total--;continue}
      if(!s.dentro){achou(fase,'inalcançável (fora da tela): '+obj,'mesmo rolando, o centro fica fora da tela '+innerWidth+'×'+innerHeight);AV.cob.nao.push(obj+' [fora da tela]');continue}
      if(!s.ok){achou(fase,'coberto por outro elemento: '+obj,'o clique cairia em '+s.cob);AV.cob.nao.push(obj+' [coberto por '+s.cob+']');continue}
      await inspecionaLayout(el,obj,fase);   // v1.10.199: inspeção visual de design antes de acionar
      const a0=estadoRapido();let ef='';
      AV.ultimoObj=obj;
      try{ef=await aciona(el)}catch(e){achou(fase,'erro ao acionar '+obj,String(e&&e.message||e).slice(0,120));ef='erro'}
      AV.cob.acionados++;await pausa(110);
      const a1=estadoRapido();
      if(a1.ovx&&!a0.ovx)achou(fase,'rolagem horizontal criada por '+obj,a1.sw+' > '+innerWidth);
      const novas=a1.dlgs.filter(x=>!a0.dlgs.includes(x));
      if(novas.length){AV.efeitos[obj]='abriu '+novas.join(',');const gat=()=>document.contains(el)?el:null;await testaJanela(novas[0],gat,prof,fase)}
      if(a1.pops&&!a0.pops){esc_();await pausa(80)}
      {const ip=document.getElementById('ensInfoPop');if(ip&&getComputedStyle(ip).display!=='none'&&document.contains(el)&&el.id==='ensInfo'){el.click();await pausa(70)}}   // balão de informação do modo: toca de novo para fechar (liga/desliga)
      if(/^Clique para (expandir|recolher)/.test(el.title||'')&&document.contains(el)){el.click();await pausa(90)}   // cabeçalho recolhível: devolve ao estado de antes (senão esconde o resto da tela)
      if(a1.ens==='andamento'&&a0.ens==='parado'){await pararSilencio()}   // um clique iniciou ensaio: encerra para não travar o resto da varredura
      const rest=estadoRapido();if(rest.dlgs.some(x=>!a0.dlgs.includes(x))||rest.pops>0){fecharTudo();await pausa(60)}
    }
    if(!escopoDlg&&prof===0&&!AV.segunda){AV.segunda=true;try{await varre('',0,null,fase)}finally{AV.segunda=false}}   // 2ª passada: objetos que só apareceram depois de abrir um grupo/lista
  }
  async function pararSilencio(){try{if(typeof pararEnsaioSilencioso==='function')pararEnsaioSilencioso()}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }await pausa(120)}

  /* ---------- menu do botão direito ---------- */
  async function faseMenuDireito(){
    const F='Menu do botão direito';
    const alvos=[['corpo da página',document.body],['cabeçalho',document.querySelector('header')||document.body],['chave do banco',document.querySelector('#bancos .tile[data-i="0"]')],['card de grandezas',document.querySelector('.card')],['janela Dados do ensaio (título)',null]].filter(a=>a[1]||a[0].startsWith('janela'));
    const cantos=[[10,10],[innerWidth-10,10],[10,innerHeight-10],[innerWidth-10,innerHeight-10],[Math.round(innerWidth/2),Math.round(innerHeight/2)]];
    let n=0,bad=0;
    for(const [nome,el] of alvos){
      if(!el)continue;
      for(const [x,y] of cantos){
        if(OPS.parar)throw ABORT;
        const alvo=document.elementFromPoint(x,y)||el;
        if(dentroDe(alvo,'input,textarea,select,[contenteditable=true]')){continue}   // nos campos de texto fica o menu normal do navegador (por projeto)
        alvo.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:x,clientY:y,button:2}));
        await pausa(60);n++;
        const m=document.querySelector('.pia-menu');
        if(!m){bad++;achou(F,'o menu NÃO abriu ('+nome+' em '+x+','+y+')','contextmenu sem efeito');continue}
        const r=m.getBoundingClientRect();
        if(r.left<-1||r.top<-1||r.right>innerWidth+1||r.bottom>innerHeight+1){bad++;achou(F,'o menu abre FORA da tela ('+nome+' em '+x+','+y+')','menu em '+Math.round(r.left)+','+Math.round(r.top)+' '+Math.round(r.width)+'×'+Math.round(r.height)+' tela '+innerWidth+'×'+innerHeight)}
        try{if(window.PACOTE_IA&&PACOTE_IA.fechaMenu)PACOTE_IA.fechaMenu()}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }
        await pausa(40);
        if(document.querySelector('.pia-menu')){bad++;achou(F,'o menu NÃO fecha','fechaMenu() sem efeito')}
      }
    }
    chk(F,'menu do botão direito abriu e fechou em '+n+' posições',bad===0,bad?bad+' problema(s)':'');
  }

  /* ---------- Patamar guiado ---------- */
  async function fasePatamar(){
    const F='Patamar guiado';
    const q=s=>document.querySelector('#patCard '+s),btn=(gd,k)=>document.querySelector('#patCard [data-gd="'+gd+'"]'+(k!=null?'[data-k="'+k+'"]':''));
    if(!q('#dlgGuiado')){aviso(F,'card do Patamar guiado não encontrado','');return}
    try{await garanteGerador()}catch(e){if(e===ABORT)throw e}
    const msg=()=>{const e=document.querySelector('#patCard .gd-res-msg');return e?e.textContent.trim():''};
    const stats=()=>{const e=document.querySelector('#patCard .gd-res-stats');return e?e.textContent.replace(/\s+/g,' ').trim():''};
    // botões de cada patamar (30/50/100/107 %), manual/auto por patamar, salvamento por patamar
    const pats=[...document.querySelectorAll('#patCard [data-gd="pat"]')];
    chk(F,'há chips de patamar (30/50/100/107 %)',pats.length>=4,pats.length+' chip(s)');
    const sug=btn('sug'),zera=btn('zera'),ap=btn('ap'),drop=btn('drop');
    for(const p0 of pats.slice(0,6)){
      if(OPS.parar)throw ABORT;
      const p=document.querySelector('#patCard [data-gd="pat"][data-k="'+p0.dataset.k+'"]')||p0;   // v1.10.190: o card é redesenhado a cada clique: busca o chip de novo
      clica(p,'patamar '+nomeEl(p));await pausa(120);
      clica(btn('zera')||zera,'Limpar seleção');await pausa(100);
      clica(btn('sug')||sug,'Sugerir chaves');await pausa(200);
      const m1=msg(),s1=stats();
      {const esperado=parseInt((/^\s*(\d+)/.exec(String(nomeEl(p)))||[])[1],10),mostrado=(/\((\d+) ?%\)/.exec(s1)||[])[1];if(!isNaN(esperado)&&!T.started)chk(F,'chip '+esperado+' %: o alvo mostrado é o do chip (parado = o escolhido)',+mostrado===esperado,'mostrou '+(mostrado||'—')+' %')}
      reg('ok',F,'patamar '+nomeEl(p)+': sugerir → '+(m1?'bloqueio/aviso: '+m1.slice(0,70):'sugestão ok'),s1.slice(0,120));
      if(!m1){ // sem bloqueio: aplicar comanda as chaves pelos botões do card Cargas
        clica(btn('ap')||ap,'Aplicar');await pausa(900);
        const nLig=[...document.querySelectorAll('#bancos .tile.s1,#bancos .tile.cmd')].length;
        aviso(F,'patamar '+nomeEl(p)+': Aplicar comandou '+nLig+' chave(s)',stats().slice(0,100));
      }
      clica(btn('drop')||drop,'Abrir TODAS (emergência)');await pausa(500);
      const nAind=[...document.querySelectorAll('#bancos .tile.s1,#bancos .tile.cmd')].length;
      chk(F,'⛔ Abrir TODAS deixa 0 chave ligada/comandada ('+nomeEl(p)+')',nAind===0,nAind+' ainda ligada(s)');
    }
    // alternar manual/auto de cada patamar e salvamento por patamar (cliques de configuração)
    for(const am of [...document.querySelectorAll('#patCard [data-gd="am"]')].slice(0,8)){if(OPS.parar)throw ABORT;if(!am.disabled){clica(am,'manual/auto');await pausa(60)}}
    const pp=btn('porpat');if(pp&&!pp.disabled){clica(pp,'Usar salvamento Por patamar');await pausa(120)}
    // Patamar Guiado (mãe): liga e desliga
    const rodar=btn('rodar');if(rodar&&!rodar.disabled){clica(rodar,'Ligar Patamar Guiado');await pausa(300);const r2=btn('rodar');if(r2&&/Desligar/.test(r2.textContent)){clica(r2,'Desligar Patamar Guiado');await pausa(300)}}
    // campos de ajuste avançado (limite, excesso, degrau, pausa): valores válidos, limite e inválidos, devolvendo o original
    for(const f of [...document.querySelectorAll('#patCard [data-gd="f"]')]){const orig=f.value;for(const v of ['','0','-5','500','abc',orig]){f.value=v;f.dispatchEvent(new Event('input',{bubbles:true}));f.dispatchEvent(new Event('change',{bubbles:true}));await pausa(40)}}
    clica(btn('drop')||drop,'Abrir TODAS');await pausa(300);
  }

  /* ---------- ensaio completo em velocidades diferentes ---------- */
  async function faseEnsaioVel(){
    for(const v of [10,5]){
      if(OPS.parar)throw ABORT;
      const b=document.querySelector('#velSeg button[data-v="'+v+'"]');if(b){b.click();await pausa(120)}
      OPS.fase='Ensaio '+v+'×';ui();
      await pararSilencio();fecharTudo();   // cada velocidade começa de um ensaio novo
      try{dadosConfMarca(false)}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }   // 'Dados confirmados' vale por sessão: limpa para o INICIAR abrir o diálogo de novo
      await garanteGerador();await faseEnsaio();
    }
  }

  /* ---------- MONKEY: cliques/entradas aleatórios com semente (reproduzível) ---------- */
  async function faseMonkey(min,semente){
    const F='Monkey (semente '+semente+')';const rnd=mulberry(semente),fim=Date.now()+min*60000;let n=0,erros0=OPS.erroJs.length,ult=0;
    const pick=a=>a[Math.floor(rnd()*a.length)];
    while(Date.now()<fim){
      if(OPS.parar)throw ABORT;
      if(n%20===0||!ult){ult=1}
      const abertas=[...document.querySelectorAll('dialog[open]')].map(d=>d.id).filter(i=>i&&i!=='dlgGuiado'&&i!=='dlgDemo');
      const escopo=abertas.length&&rnd()<0.7?pick(abertas):'';
      const lista=enumera(escopo).filter(e=>!e.disabled&&vis(e));
      if(!lista.length){fecharTudo();await pausa(80);continue}
      const r=rnd(),el=pick(lista);AV.ultimoObj='monkey: '+idEl(el)+' "'+nomeEl(el)+'"';
      try{
        if(r<0.80){const s=sonda(el);if(s.dentro&&s.ok){await aciona(el)}}
        else if(r<0.88){const x=Math.floor(rnd()*innerWidth),y=Math.floor(rnd()*innerHeight);(document.elementFromPoint(x,y)||document.body).dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:x,clientY:y,button:2}))}
        else if(r<0.94){esc_()}
        else{const x=Math.floor(rnd()*innerWidth),y=Math.floor(rnd()*innerHeight);const t=document.elementFromPoint(x,y);if(t&&!dentroDe(t,'#opsBar,#dlgDemo'))t.click()}
      }catch(e){reg('falha',F,'erro ao acionar',String(e&&e.message||e).slice(0,120))}
      n++;await pausa(25+Math.floor(rnd()*70));
      const ab=document.querySelectorAll('dialog[open]').length;
      if(ab>9){aviso(F,'muitas janelas abertas ao mesmo tempo ('+ab+')','ação nº '+n);fecharTudo()}
      if(T.started&&!T.fim&&n%60===0)await pararSilencio();
      if(n%40===0){fecharTudo();document.querySelectorAll('[popover]:popover-open').forEach(e=>{if(e.id!=='opsBar')try{e.hidePopover()}catch(x){ /* ignorado: popover já no estado pedido ou sem suporte */ }})}
    }
    fecharTudo();
    chk(F,n+' ações aleatórias sem erro de JavaScript',OPS.erroJs.length===erros0,OPS.erroJs.slice(erros0,erros0+3).join(' | '));
    return n;
  }

  /* ---------- orquestração dos modos avançados ---------- */
  /* Patamar Guiado: guarda a configuração do começo e devolve depois da varredura (a varredura marca/desmarca bancos, patamar, etc. e isso muda o ensaio seguinte) */
  const gSnap=()=>{try{return JSON.stringify(window.GUIADO_DBG.G)}catch(e){return null}};
  function setSalva(m){try{if(!m||salvaModo()===m)return;PORPAT=m==='P';salvarManual=m==='M';try{localStorage.setItem('medidor.salvarManual',salvarManual?'1':'0');localStorage.setItem('medidor.porPatamar',PORPAT?'1':'0')}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }if(!salvarManual)T.aguarda=false;try{window.__aoMudarSalva&&window.__aoMudarSalva()}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }}   // robô (só Demo local): troca o salvamento direto, mesmo com o gerador ligado
  const salvaModo=()=>(typeof PORPAT!=='undefined'&&PORPAT)?'P':(typeof salvarManual!=='undefined'&&salvarManual)?'M':'A';
  function restauraG(){try{if(!AV.g0)return;if(AV.salva0&&salvaModo()!==AV.salva0&&window.__setSalvaModo)window.__setSalvaModo(AV.salva0);
    if(AV.salva0&&salvaModo()!==AV.salva0){PORPAT=AV.salva0==='P';salvarManual=AV.salva0==='M';try{localStorage.setItem('medidor.salvarManual',salvarManual?'1':'0');localStorage.setItem('medidor.porPatamar',PORPAT?'1':'0')}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }if(!salvarManual)T.aguarda=false;try{window.__aoMudarSalva&&window.__aoMudarSalva()}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }}const G=window.GUIADO_DBG.G;Object.assign(G,JSON.parse(AV.g0));G.guiadoOn=false;if(window.GUIADO_MAE&&window.GUIADO_MAE.armada)window.GUIADO_MAE.desarma('Dev/Operador oculto: base limpa');if(window.GUIADO&&window.GUIADO.pinta)window.GUIADO.pinta()}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }}
  async function rodarAv(opt){
    opt=opt||{};
    if(OPS.rodando)return false;
    const modo=modoSim(),tipo=opt.tipo||'avancado';
    if(modo!=='demoLocal'||!$('demo').checked){alert('O Dev/Operador oculto AVANÇADO/MONKEY só roda em DEMO LOCAL (nunca no REAL e nunca em Demo + PLC: os cliques em massa gravariam no PLC). Desmarque "Usar o PLC real durante o Demo".');return false}
    if(!testeDesbloqueado)return false;
    if(T.started&&!T.fim){alert('Há um ensaio em andamento. Pare ou finalize o ensaio antes.');return false}
    if($('dlgChSetup').open){alert('Feche o popup Setup antes de rodar.');return false}
    Object.assign(OPS,{rodando:true,parar:false,rel:[],fase:'',passo:'',modo,ini:Date.now(),fim:0,seq:0,erroJs:[],motivoAbort:''});
    AV.cob={total:0,acionados:0,nao:[]};AV.efeitos={};AV.vistos=new Map();AV.janelas={};AV.achados=0;AV.semente=+opt.semente||20261107;AV.tipo=tipo;
    const est=snapEstado(),p=perfil();
    AV.g0=gSnap();AV.salva0=salvaModo();AV.dica0=window.DICAUI?window.DICAUI.ativo():undefined;
    sandboxLiga();
    lg('info','Dev/Operador oculto: início',{tipo,modo,semente:AV.semente,perfil:p,versao:VERSAO});
    reg('ok','Preparação','dispositivo',(p.nome?'"'+p.nome+'" · ':'(sem nome — digite no popup Demo) · ')+p.tipo+' · zoom do navegador ≈ '+p.zoomNav+' %');
    if(window.__semArmazenamento)aviso('Preparação','armazenamento do navegador bloqueado','arquivo aberto de Downloads (content://) ou WebView: preferências ficam só nesta aba; a tela funciona normalmente');
    reg('ok','Preparação','perfil da tela',p.larg+'×'+p.alt+' px (tela física '+p.telaFisica+') · DPR '+p.dpr+(p.toque?' · toque':' · mouse')+' · '+p.ua);
    ui();try{if($('dlgDemo').open)$('dlgDemo').close()}catch(e){ /* ignorado: diálogo/seletor já fechado, cancelado ou sem permissão */ }
    try{
      if(tipo==='avancado'){
        const fa=x=>!opt.fases||String(opt.fases).split(',').includes(x);   // opt.fases ('U1,U2,U3,U4'): roda só estas fases (diagnóstico)
        if(fa('U1')){OPS.fase='U1 · Varredura da página';ui();passo('percorrendo todos os objetos');
          document.querySelectorAll('#bancos details').forEach(d=>{d.open=true});   // abre os bancos para varrer as chaves de todos (o operador faz o mesmo tocando no cabeçalho)
          await preparaChaves();await estabilizaHabil();
          await varre('',0,null,OPS.fase);await faseVisual()}   // v1.10.199: + inspeção visual de design (portadores de balão incluídos)
        if(fa('U2')){OPS.fase='U2 · Menu do botão direito';ui();await faseMenuDireito()}
        await pararSilencio();fecharTudo();restauraG();setSalva('M');await garanteGerador();   // base limpa: sem ensaio, configuração de antes, gerador simulado operando
        await preparaChaves();await estabilizaHabil();   // a varredura clicou em tudo (inclusive em chaves/seletoras): volta ao ponto de partida
        if(fa('U3')){OPS.fase='U3 · Patamar guiado';ui();await fasePatamar()}
        if(fa('U4')){OPS.fase='U4 · Ensaio (velocidades)';ui();await faseEnsaioVel()}
      }else if(tipo==='visual'){
        OPS.fase='V · Inspeção visual';ui();document.querySelectorAll('#bancos details').forEach(d=>{d.open=true});await preparaChaves();await estabilizaHabil();await faseVisual();
      }else{
        OPS.fase='M · Monkey';ui();await preparaChaves();await estabilizaHabil();
        await faseMonkey(+opt.minutos||3,AV.semente);
      }
    }catch(e){
      if(e===ABORT)aviso('Dev/Operador oculto','interrompido',(OPS.motivoAbort||'pelo desenvolvedor (Parar)')+(AV.ultimoObj?' · último objeto acionado: '+AV.ultimoObj:''));
      else reg('falha','Dev/Operador oculto','erro inesperado no próprio robô',String(e&&e.stack||e).slice(0,300));
    }
    OPS.fase='D · Restaurando';ui();
    const pf=OPS.parar;OPS.parar=false;fecharTudo();await restaura(est);if(AV.salva0)setSalva(AV.salva0);try{if(window.DICAUI&&AV.dica0!==undefined&&window.DICAUI.ativo()!==AV.dica0)window.DICAUI.liga(AV.dica0,false)}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }OPS.parar=pf;
    const cb=AV.cob;
    reg('ok','Cobertura',tipo==='avancado'?cb.acionados+' de '+cb.total+' objetos acionados ('+(cb.total?Math.round(100*cb.acionados/cb.total):0)+' %); '+cb.nao.length+' não acionados':'monkey: sem contagem de cobertura','');
    reg('ok','Caixa de areia','efeitos bloqueados/contados',JSON.stringify(SB.c));
    sandboxDesliga();
    chk('JavaScript','nenhum erro de JavaScript durante o teste',OPS.erroJs.length===0,OPS.erroJs.slice(0,3).join(' | '));
    OPS.rodando=false;OPS.fim=Date.now();OPS.fase='Concluído';OPS.passo='';
    const c=cont();lg(c.falha?'falha':'ok','Dev/Operador oculto: fim',{ok:c.ok,falha:c.falha,aviso:c.aviso,cobertura:cb,segundos:Math.round((OPS.fim-OPS.ini)/1000)});
    ui();return true;
  }
  function relatorioAv(){
    let md=relatorioMd();
    if(AV.tipo){
      md+='\n## Cobertura e contexto\n\n- Modo do robô: **'+AV.tipo+'** · semente '+AV.semente+'\n- Dispositivo: '+(AV.perfil.nome||'(sem nome)')+' · '+(AV.perfil.tipo||'?')+' · zoom do navegador ≈ '+(AV.perfil.zoomNav||'?')+' %\n- Tela: '+(AV.perfil.larg||'?')+'×'+(AV.perfil.alt||'?')+' px · DPR '+(AV.perfil.dpr||'?')+(AV.perfil.toque?' · toque':' · mouse')+'\n- Objetos acionados: '+AV.cob.acionados+' de '+AV.cob.total+'\n- Caixa de areia (bloqueado/contado): '+JSON.stringify(SB.c)+'\n';
      if(AV.cob.nao.length)md+='\n### Não acionados ('+AV.cob.nao.length+')\n\n'+AV.cob.nao.slice(0,120).map(x=>'- '+x).join('\n')+'\n';
      const ja=Object.entries(AV.janelas);if(ja.length)md+='\n### Onde cada janela abriu\n\n'+ja.map(([k,v])=>'- `'+k+'` em '+v.l+','+v.t+' ('+v.w+'×'+v.h+')').join('\n')+'\n';
      const ef=Object.entries(AV.efeitos);if(ef.length)md+='\n### O que cada objeto abriu\n\n'+ef.slice(0,150).map(([k,v])=>'- '+k+' → '+v).join('\n')+'\n';
    }
    return md.replace('# Operador secreto — relatório','# Dev/Operador oculto — relatório');
  }


  /* ===== v1.10.179 · barra do robô: cronômetro, arrastar, redimensionar, recolher (posição e tamanho guardados neste navegador) ===== */
  (function(){
    const bar=$('opsBar'),cron=$('opsCron'),grip=$('opsGrip'),mn=$('opsMin');if(!bar||!cron)return;
    const LS='bt2.dev.barra';let sv={};try{sv=JSON.parse(localStorage.getItem(LS)||'{}')||{}}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
    const grava=()=>{try{localStorage.setItem(LS,JSON.stringify(sv))}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }};
    const zm=()=>{const r=bar.getBoundingClientRect();return(bar.offsetWidth?r.width/bar.offsetWidth:1)||1};
    const cabe=()=>{ // a barra inteira fica na tela
      const r=bar.getBoundingClientRect(),W=innerWidth,H=innerHeight,z=zm();let dx=0,dy=0;
      if(r.left<0)dx=-r.left;else if(r.right>W)dx=W-r.right;if(r.top<0)dy=-r.top;else if(r.bottom>H)dy=H-r.bottom;
      if(dx||dy){bar.style.left=((parseFloat(bar.style.left)||r.left/z)+dx/z)+'px';bar.style.top=((parseFloat(bar.style.top)||r.top/z)+dy/z)+'px'}
    };
    const aplica=()=>{if(sv.l!=null){bar.style.inset='auto';bar.style.left=sv.l+'px';bar.style.top=sv.t+'px'}if(sv.w){bar.style.width=sv.w+'px';bar.style.height=sv.h+'px'}bar.classList.toggle('min',!!sv.min);if(mn)mn.textContent=sv.min?'+':'–'};
    const mm=ms=>{const s=Math.max(0,Math.floor(ms/1000));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
    setInterval(()=>{
      if(typeof OPS==='undefined')return;
      if(OPS.rodando||OPS.fim){cron.textContent=mm((OPS.fim||Date.now())-(OPS.ini||Date.now()))}
      if(bar.matches&&bar.matches(':popover-open')&&!bar.dataset.ok){bar.dataset.ok='1';aplica();cabe()}
      if(!(bar.matches&&bar.matches(':popover-open')))delete bar.dataset.ok;
    },500);
    grip.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;const r=bar.getBoundingClientRect(),z=zm(),x0=e.clientX,y0=e.clientY;
      bar.style.inset='auto';bar.style.left=r.left/z+'px';bar.style.top=r.top/z+'px';try{grip.setPointerCapture(e.pointerId)}catch(x){ /* ignorado: elemento ausente ou sem suporte */ }
      const mv=ev=>{bar.style.left=(r.left+ev.clientX-x0)/z+'px';bar.style.top=(r.top+ev.clientY-y0)/z+'px';cabe()};
      const up=()=>{grip.removeEventListener('pointermove',mv);grip.removeEventListener('pointerup',up);const q=bar.getBoundingClientRect();sv.l=Math.round(q.left/z);sv.t=Math.round(q.top/z);grava()};
      grip.addEventListener('pointermove',mv);grip.addEventListener('pointerup',up);
    });
    grip.addEventListener('dblclick',()=>{delete sv.l;delete sv.t;delete sv.w;delete sv.h;grava();bar.style.cssText='';delete bar.dataset.ok;bar.dataset.ok='1';aplica()});
    if(mn)mn.addEventListener('click',()=>{sv.min=!sv.min;grava();aplica();cabe()});
    if(window.ResizeObserver)new ResizeObserver(()=>{if(!bar.matches(':popover-open')||bar.classList.contains('min'))return;const q=bar.getBoundingClientRect(),z=zm();if(q.width>0&&bar.dataset.ok){sv.w=Math.round(q.width/z);sv.h=Math.round(q.height/z);grava()}}).observe(bar);
    addEventListener('resize',()=>{if(bar.matches(':popover-open'))cabe()});
  })();

  window.opSecreto={normalizaPatamar,restauraPatamar,normalizaSalvamento,restauraSalvamento,rodar,rodarAv,parar:()=>{OPS.parar=true},rodando:()=>OPS.rodando,relatorio:()=>OPS.rel.slice(),contagem:cont,md:()=>textoRel(),estado:()=>({fase:OPS.fase,passo:OPS.passo,modo:OPS.modo})};
  ui();
})();
