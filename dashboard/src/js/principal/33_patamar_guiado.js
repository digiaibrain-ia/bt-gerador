
/* ===== v1.9.81 (reorganizado na v1.9.82): MANUAL GUIADO — ASSISTENTE DE SELEÇÃO DE CHAVES =====
   PARA QUE SERVE (equipe não técnica): em cada patamar do ensaio (sem carga → 30 → 50 → 100 → 107 → sem carga) o assistente
   calcula QUAIS chaves ligar para chegar perto do alvo, desenha a sugestão nas chaves do card Cargas, e SÓ comanda quando o
   operador clica em "Confirmar e aplicar". O operador pode trocar a seleção; carga acima do limite de segurança é bloqueada.
   COMO COMANDA: clica na própria chave do card Cargas (mesmo caminho do clique do operador) — assim valem TODAS as travas que
   já existem (banco ligado/seletora, chave habilitada, ensaio, leitura do PLC). Não existe rota, DB ou endereço novo aqui.
   MOTOR DE CÁLCULO: módulo RodizioChaves (rodizio_chaves_v0.1.js, embutido acima). Este bloco é só o ADAPTADOR + TELA.
   NÃO FAZ (a desenvolver): não pausa o cronômetro do ensaio; não gera registros do ensaio; "sem DSE" = só usa o modelo. */
(function(){
  const dlg=$('dlgGuiado'),corpo=$('mgCorpo'),topo=$('mgTop'),bt=$('bGuiado'),dTr=$('dlgTroca'),trC=$('trCorpo'),bTr=$('bTroca');
  if(!dlg||!corpo||!topo||!bt||!window.RodizioChaves||!window.CATDSE)return;
  const R=window.RodizioChaves,LS='medidor.guiado.v1',LSR='medidor.guiado.rodizio.v1';
  /* ---- estado do assistente (parâmetros em UM lugar; "ASSUMIDO" = a engenharia confirma) ---- */
  /* ===== v1.10.106 · ESCALONADOR DE ENTRADA (FB filho 10) — PARÂMETROS EM UM LUGAR SÓ =====
     PARA QUE SERVE (leigo): em vez de dar um "tranco" de 30 % para 50 %, a carga sobe em pedaços pequenos (35, 40, 45, 50 %), com uma pausa curta entre eles,
     para o motor diesel não sentir oscilação. Dentro de cada pedaço, as chaves novas entram primeiro e as que não servem mais saem depois.
     POR QUÊ (técnico): reduz o degrau de carga aplicado ao gerador (queda transitória de rotação/tensão). Estes são os MESMOS parâmetros que o FB filho 10
     terá no PLC (hoje só em JavaScript — decisão do operador 29/10/2026: "parametrização para o FB filhos").
     VALORES = ASSUMIDOS pelo operador, a confirmar com a engenharia: passos 30→50 de 5 pts, 50→100 de 10 pts, 100→107 em 3 e 4 pts; janela 1 s; pausa 1 s. */
  function ESC_PADRAO(){return{
    ativo:true,            // sub-degraus entre etapas (só com o ensaio iniciado)
    ligaAntes:true,        // liga as chaves novas ANTES de tirar as antigas
    janelaS:1,             // segundos entre ligar as novas e desligar as antigas
    pausaSubS:1,           // segundos entre um sub-degrau e o próximo
    sobrePts:5,            // sobreposição máxima: enquanto as chaves antigas e as novas estão ligadas juntas, a carga pode passar do nível do sub-degrau em no máximo estes pontos % (ASSUMIDO — a confirmar)
    pesoMudanca:5,         // custo de trocar uma chave já ligada nos sub-degraus (alto = mantém o que já está ligado e só acrescenta; o rodízio só desempata). Interno.
    trechos:[{de:30,ate:50,passos:'5'},{de:50,ate:100,passos:'10'},{de:100,ate:107,passos:'3,4'}]   // passos em pontos %; vários separados por vírgula (o último se repete)
  }}
  /** Garante o formato certo mesmo com valor antigo/estranho guardado no navegador. */
  function escNorm(e){const p=ESC_PADRAO();if(!e||typeof e!=='object')return p;
    const n=(v,d)=>{v=+v;return isFinite(v)&&v>=0?v:d};
    return{ativo:e.ativo!==false,ligaAntes:e.ligaAntes!==false,janelaS:n(e.janelaS,p.janelaS),pausaSubS:n(e.pausaSubS,p.pausaSubS),sobrePts:n(e.sobrePts,p.sobrePts),pesoMudanca:n(e.pesoMudanca,p.pesoMudanca),
      trechos:p.trechos.map((t,i)=>({de:t.de,ate:t.ate,passos:(e.trechos&&e.trechos[i]&&typeof e.trechos[i].passos==='string')?e.trechos[i].passos:t.passos}))}}
  const listaPassos=txt=>String(txt==null?'':txt).split(/[;,\s]+/).map(Number).filter(n=>isFinite(n)&&n>0);
  const G={kw100:'',vFF:'',hz:'',pctLim:110,   // limite 110 % = ASSUMIDO (provisório, único para todos os geradores)
    exc:2.5,                                                    // pontos % aceitos acima de 100 % no modo "atingir o mínimo" (107 %): 107+2,5 = 109,5 % (< limite 110 %). Decisão do operador 28/10
    usa:Object.fromEntries(BANCOS.map(b=>[b.id,!b.semPlc])),pat:-1,   /* v1.10.2: nasce SEM patamar escolhido */
    crit:'ambos',pa:1,ph:1,folga:0,deg:'',pausa:5,desl:true,esc:ESC_PADRAO(),comb:'diesel',   // v1.9.82: rodízio FIXO em 'ambos' (acionamentos + horas), sem controle na tela
    modelo:'',
    guiadoOn:false,fonteDse:'SIDSE',tolDseS:5,                                                  // segundos sem DSE antes de abrir as chaves. ASSUMIDO — a confirmar
    sel:Object.fromEntries(BANCOS.map(b=>[b.id,[]])),sug:Object.fromEntries(BANCOS.map(b=>[b.id,null])),selCons:{},msg:'',plano:null};   // v1.10.134: selCons = seleção sugerida para os bancos só-consulta (BC59,5/BC550) — nunca persistida, nunca comandada
  try{const j=JSON.parse(localStorage.getItem(LS)||'null');if(j)['kw100','pctLim','exc','deg','pausa','desl','tolDseS','modelo','fonteDse','esc','comb'].forEach   /* v1.10.1: guiadoOn NÃO é restaurado: o guiado automático sempre nasce desligado */(k=>{if(j[k]!==undefined)G[k]=j[k]});if(G.exc===2)G.exc=2.5 /* v1.9.88: o valor antigo (2) vira o novo padrão (2,5) */;if(j&&j.usa&&typeof j.usa==='object')BANCOS.forEach(b=>{if(typeof j.usa[b.id]==='boolean')G.usa[b.id]=j.usa[b.id]})}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }   // v1.10.153: a seleção dos bancos também é lembrada
  G.esc=escNorm(G.esc);
  const salva=()=>{try{localStorage.setItem(LS,JSON.stringify(G))}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }};
  const sugVazio=()=>Object.fromEntries(BANCOS.map(b=>[b.id,null]));
  const RD=Object.fromEntries(BANCOS.map(b=>[b.id,{acion:[],horas:[]}]));   // desgaste por chave (rodízio)
  try{const j=JSON.parse(localStorage.getItem(LSR)||'null');if(j)for(const k in RD)if(j[k])RD[k]=j[k]}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
  const salvaR=()=>{try{localStorage.setItem(LSR,JSON.stringify(RD))}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }};
  let ultA='';                                           // cache do último HTML desenhado (ultH: legado, usado para forçar redesenho)
  const DATAS=Object.fromEntries(BANCOS.map(b=>[b.id,[]]));                                        // v1.9.82: data da última troca de resistência por chave (ISO)
  try{const j=JSON.parse(localStorage.getItem('medidor.guiado.trocas.v1')||'null');if(j)for(const k in DATAS)if(Array.isArray(j[k]))DATAS[k]=j[k]}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }

  /* ---- ponte com o resto do medidor (leitura) ---- */
  const off=bi=>{let k=0;for(let j=0;j<bi;j++)k+=BANCOS[j].chaves.length;return k};
  const real=()=>CH_SRV.fonte==='nodered';
  const cmdDe=i=>real()?!!CH_CMD[i]:!!SIM.ch[i];          // comando pedido
  const ligDe=i=>real()?!!CH_LIG[i]:!!SIM.ch[i];          // chave realmente ligada (feedback)
  /* v1.10.153: o card Banco de Cargas segue a seleção de Detalhes: banco selecionado = subcard ABERTO, não selecionado = FECHADO (continua visível e operável:
     a liberação das chaves — seletora Auto + Ligar banco — não depende de o subcard estar aberto). Abrir/fechar à mão continua livre. */
  window.bancoUsado=id=>!!G.usa[id];
  const bancoNasce=(id,aberto)=>{try{const m=JSON.parse(localStorage.getItem('medidor.bkAberto.v1')||'{}');m[id]=!!aberto;localStorage.setItem('medidor.bkAberto.v1',JSON.stringify(m))}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
    const d=document.querySelector('#bancos details.bk[data-bk="'+id+'"]');if(d)d.open=!!aberto};
  const bancosAtivos=()=>BANCOS.map((b,bi)=>({b,bi})).filter(x=>G.usa[x.b.id]&&bancoElegivel(x.b));   // v1.10.108: só bancos que atendem a tensão do gerador
  /* v1.10.134: bancos SÓ CONSULTA (BC59,5/BC550) — a pedido do operador, agora ENTRAM na sugestão e no total do Patamar,
     mas continuam sem PLC/Node-RED: nunca são comandados por aqui (sem tile no card Cargas, sem plano/escalonador).
     O cálculo usa 2 etapas: 1) os bancos com PLC (bancosAtivos) tentam sozinhos, como antes; 2) o que sobrar do alvo
     é repassado para estes bancos (dentro da folga de segurança que ainda resta) e o operador liga/desliga À MÃO.
     ASSUMIDO: sem ficha de tensão para eles (não têm campo "tensoes") — contam como elegíveis sempre que marcados
     "Usar neste ensaio" (card Banco de Cargas), independente da tensão do gerador; a engenharia confirma. */
  const bancosConsAtivos=()=>(window.bancosUso?window.bancosUso():[]);
  /* v1.10.135: a pedido do operador, o toggle "entra no Patamar?" destes bancos também aparece AQUI na linha
     "Bancos" (antes só dava pra marcar lá no card Banco de Cargas, "Usar neste ensaio"). É o MESMO estado —
     marcar aqui ou lá dá no mesmo (persistido em 'medidor.bancosUso.v1', ver bloco BCONS mais abaixo). */
  const chkBancosCons=()=>(window.BCONS||[]).map(b=>{const on=bancosConsAtivos().some(x=>x.id===b.id);
    return '<label style="display:inline"><input type="checkbox" data-gd="uc" data-b="'+b.id+'"'+(on?' checked':'')+' style="width:auto"> BC'+b.id+'</label>'}).join(' ');
  const consSelTotal=()=>bancosConsAtivos().reduce((s,b)=>s+b.chaves.reduce((a,kw,j)=>a+((G.selCons[b.id]||[])[j]?kw:0),0),0);
  const entradaCons=()=>({bancos:bancosConsAtivos().map(b=>({id:b.id,kws:b.chaves.slice(),habil:b.chaves.map(()=>true),atual:b.chaves.map(()=>false)}))});
  /** Igual a guardaAtual(), mas SÓ para exibição (cartão de resultado do Patamar): soma também os bancos só-consulta.
   *  NUNCA usar isto para liberar/bloquear comando de PLC (aplica()/planoDe() continuam com guardaAtual() — só bancos reais). */
  const guardaExibicao=()=>{
    const g=guardaAtual(),ct=consSelTotal();
    if(!(ct>1e-9))return g;
    const lim=g.limiteKw,total=Math.round((g.total+ct)*1000)/1000;
    if(lim==null)return Object.assign({},g,{total});
    const sobre=total>lim+1e-9;
    return Object.assign({},g,{total,ok:g.ok&&!sobre,excessoKw:sobre?Math.round((total-lim)*1000)/1000:0,
      mensagem:sobre?('Bloqueado: '+fmtKw(total)+' kW (chaves do PLC + bancos manuais) passa do limite de segurança de '+fmtKw(lim)+' kW. Tire chaves.'):g.mensagem});
  };
  /** v1.10.108: texto quando a tensão do gerador deixa SEM banco (nenhum marcado atende). '' = tudo bem. */
  /** v1.10.108: caixa de seleção de um banco; inelegível (não atende a tensão do gerador) fica desabilitada e explica. A marcação G.usa é preservada. */
  const chkBanco=id=>{const b=bancoPorId(id),ok=bancoElegivel(b);
    return '<label style="display:inline"'+(ok?'':' title="Este banco não tem chaveamento de '+tensaoGerador()+' V (ficha do banco: '+bancoTensoes(b).join(' / ')+' V)."')+'><input type="checkbox" data-gd="u" data-b="'+id+'"'+(G.usa[id]&&ok?' checked':'')+(ok?'':' disabled')+' style="width:auto"> BC'+id+(ok?'':' (não atende '+tensaoGerador()+' V)')+'</label>'};
  const notaTens=()=>{const v=+DADOS.tensao;if(!(v>0))return '';const g=tensaoGerador();
    return g==null?'<div class="jnota">Tensão do gerador ('+v+' V) não é um chaveamento conhecido (220/380/440): sem restrição de banco.</div>'
      :'<div class="jnota">Gerador em '+g+' V — atendem: '+BANCOS.filter(b=>bancoAtende(b,g)).map(b=>'BC'+b.id).join(' e ')+'.</div>'};
  const semBancoMsg=(soReais)=>{const v=tensaoGerador();if(v==null||bancosAtivos().length||(!soReais&&bancosConsAtivos().length))return '';const ok=BANCOS.filter(b=>bancoAtende(b,v)).map(b=>'BC'+b.id);
    return 'Nenhum banco marcado atende o chaveamento de '+v+' V do gerador (Dados do ensaio). '+(ok.length?'Atendem: '+ok.join(' e ')+' — marque-'+(ok.length>1?'os':'o')+'.':'Nenhum banco desta BT atende essa tensão.')};
  /** Monta a entrada do motor para os bancos escolhidos. Por quê kwEf: usa o kW REAL do Setup quando habilitado. */
  function entrada(comAtual){
    return{bancos:bancosAtivos().map(({b,bi})=>({id:b.id,kws:b.chaves.map((_,j)=>kwEf(off(bi)+j)),
      habil:b.chaves.map((_,j)=>!DIS[off(bi)+j]&&bkLiberado(b.id)),estado:RD[b.id],atual:b.chaves.map((_,j)=>comAtual?cmdDe(off(bi)+j):false)})),
      kw100:+G.kw100,pctLimite:+G.pctLim,
      rodizio:{criterio:G.crit,pesoAcion:+G.pa,pesoHoras:+G.ph},folgaErroKw:+G.folga};
  }
  let janMapa=null;   // v1.9.97: janela do mapa dos FBs (recebe a foto por postMessage). v1.10.103: agora é um "pseudo-janela" do painel interno
  /* v1.10.103: o mapa abre num <dialog> não-modal com <iframe srcdoc> (mesma origem: BroadcastChannel/localStorage/postMessage funcionam).
     Por quê: window.open() criava outra janela do navegador; ao clicar no medidor (SALVAR) ela ia para trás e parecia ter fechado. */
  function abrePainelMapa(){
    const d=$('dlgMapaFBs'),f=$('mapaFrame');if(!d||!f||!(window.EMB&&window.EMB.mapa))return null;
    if(!f.dataset.ok){f.srcdoc=window.EMB.mapa;f.dataset.ok='1'   // v1.10.118: começa com a cópia embutida e troca pelo arquivo real assim que confirmar que ele existe
      window.arquivoReal('mapa').then(u=>{if(u){f.removeAttribute('srcdoc');f.src=u}})}
    if(!d.open)d.show();
    return{get closed(){return !d.open},postMessage:(m,o)=>{try{if(f.contentWindow)f.contentWindow.postMessage(m,'*')}catch(x){ /* ignorado: janela ou canal já fechado */ }}};
  }
  /* v1.10.106: o mapa também pode ir para uma JANELA PRÓPRIA (segunda tela), como o gráfico. O painel dentro da página continua existindo.
     A foto da mãe chega por postMessage (daqui) e também pelo canal 'fbv'/localStorage que o mapa já escuta. */
  let janMapaExt=null;
  function abreMapaJanela(){
    try{janMapaExt=window.abreEmb(window.EMB&&window.EMB.mapa,'bt2_mapa_fbs','popup=yes,width=1280,height=820','mapa')}catch(e){janMapaExt=null}
    if(!janMapaExt){msgGer('O navegador bloqueou a janela do mapa. Permita pop-ups para esta página e clique de novo.',9000);return}
    try{janMapaExt.postMessage(mae.foto(),'*')}catch(x){ /* ignorado: janela ou canal já fechado */ }
    const d=$('dlgMapaFBs');if(d&&d.open)d.close();   // não deixa dois mapas abertos ao mesmo tempo
  }
  {const bj=$('mapaJan');if(bj)bj.onclick=abreMapaJanela}
  let previaEt=null;   // v1.9.96: etapa cuja PRÉVIA está na tela (null = etapa atual)
  const emCurso=()=>T.started&&!(T.fim&&T.gravado);   // v1.10.196: ensaio gravado = NAO esta mais em curso (T.started continua true ate o proximo START)
  const patIdx=()=>previaEt!=null?previaEt:emCurso()?Math.min(T.et,ETAPAS.length-1):G.pat;   // v1.9.88: ensaio iniciado = acompanha a etapa (sem opção); parado = à mão
  const pctAlvo=()=>{const i=patIdx();return i>=0&&ETAPAS[i]?ETAPAS[i].alvo:0};
  const alvoKw=()=>(+G.kw100)*pctAlvo()/100;
  const selObj=()=>Object.fromEntries(bancosAtivos().map(({b})=>[b.id,G.sel[b.id]]));

  /* ---- ações ---- */
  function sugere(soReais){   // soReais=true: chamada do FB mãe (Auto) — só bancos com PLC, os únicos que ela consegue comandar e medir
    sincKw();   // v1.9.87: kW a 100 % = Potência (kW) de Dados do ensaio
    if(!(+G.kw100>0)){G.msg='Informe a Potência (kW) do gerador em “Dados do ensaio” (ou escolha um modelo lá).';return desenha()}
    {const m=semBancoMsg(soReais);if(m){G.msg=m;return desenha()}}   // v1.10.108
    if(patIdx()<0){G.msg='Escolha o patamar (%) antes de sugerir.';return desenha()}
    /* v1.10.136: UM cálculo com todos os bancos marcados (PLC e só-consulta). R.sugere escolhe o FB pelo número de bancos
       (2, 3, 4 ou 5+). Bancos só-consulta entram no cálculo, mas o comando de PLC continua só nos bancos com rota. */
    const e=entrada(true);if(!soReais)e.bancos=e.bancos.concat(entradaCons().bancos);e.alvoKw=alvoKw();
    if(pctAlvo()>100){e.modoAlvo='minimo';e.excessoMaxKw=(+G.exc)/100*(+G.kw100)}else e.modoAlvo='abaixo';
    const r=R.sugere(e);
    bancosAtivos().forEach(({b})=>{G.sel[b.id]=r.selecao[b.id].slice();G.sug[b.id]=r.selecao[b.id].slice()});
    bancosConsAtivos().forEach(b=>{G.selCons[b.id]=soReais?b.chaves.map(()=>false):(r.selecao[b.id]||b.chaves.map(()=>false)).slice()});
    G.msg=(r.aviso||'')+' Sugerido '+fmtKw(r.total)+' kW para o alvo de '+pt(alvoKw(),1)+' kW ('+pctAlvo()+' %).';
    planoDe();desenha();pinta();   // v1.10.133: faltava pinta() aqui — a seleção era calculada (G.sel/G.sug) mas as chaves sugeridas não apareciam tracejadas no card Cargas até outra ação (zera/pat) chamar pinta()
  }
  /** v1.10.106: percentuais INTERMEDIÁRIOS entre a etapa anterior e a etapa atual (ex.: 30→50 de 5 em 5 → [35,40,45]). Vazio = sem sub-degraus.
   *  Só com o ensaio iniciado e só nas transições que existem em G.esc.trechos (de→ate); descidas nunca têm sub-degrau (aliviar carga é seguro). */
  function pctsIntermediarios(){
    {const pf=perfilAtual();if(pf){if(!T.started)return[];const i0=patIdx();if(!(i0>0)||!ETAPAS[i0]||!ETAPAS[i0-1])return[];return window.PERFIL_COMB.subDegraus(pf,+ETAPAS[i0-1].alvo,+ETAPAS[i0].alvo)}}   // v1.10.220: perfil gas/biometano
    const E=G.esc;if(!E||!E.ativo||!T.started)return[];
    const i=patIdx();if(!(i>0)||!ETAPAS[i]||!ETAPAS[i-1])return[];
    const de=+ETAPAS[i-1].alvo,ate=+ETAPAS[i].alvo,tr=(E.trechos||[]).find(x=>+x.de===de&&+x.ate===ate);if(!tr)return[];
    const ps=listaPassos(tr.passos);if(!ps.length)return[];
    const out=[];let p=de;for(let k=0;k<200;k++){p+=ps[Math.min(k,ps.length-1)];if(p>=ate-1e-9)break;out.push(Math.round(p*100)/100)}
    return out;
  }
  /** PLANO = sequência de seleções (sub-degraus + a seleção final) transformada em passos no tempo.
   *  1) Para cada percentual intermediário, o motor de sugestão escolhe as chaves PARTINDO da seleção anterior (por isso aproveita as que já estão ligadas).
   *     Só entra se a carga SOBE em relação ao sub-degrau anterior e não passa da carga final (assim a carga nunca desce no meio da subida).
   *  2) Cada trecho vira passos pelo planoEntrada (liga antes, desliga depois da janela) e os trechos são encadeados com a pausa entre sub-degraus.
   *  3) Trava: se a sobreposição (antigas + novas) passar do teto (limite de segurança, ou alvo da etapa quando há sub-degraus), AQUELE trecho volta à ordem antiga
   *     (troca no mesmo instante) e o aviso vai para a lista de passos e para o Log. */
  function planoDe(){
    const bs=bancosAtivos(),e=entrada(true);
    const atual0=Object.fromEntries(bs.map(({b,bi})=>[b.id,b.chaves.map((_,j)=>cmdDe(off(bi)+j))]));
    const fin=selObj();
    const pf0=perfilAtual(),base={degrauMaxKw:degrauKw(),pausaS:T.started?0:(pf0?pf0.pausaS:+G.pausa),desligaImediato:!!G.desl};   // v1.9.88: pausa entre degraus só com o ensaio PARADO
    const E=pf0?Object.assign({},G.esc,{pausaSubS:pf0.pausaS,ativo:true,ligaAntes:false}):G.esc   /* perfil gas: NAO liga antes (a sobreposicao seria um degrau extra de carga); troca no mesmo instante */,lig=!!E.ligaAntes,kw100=+G.kw100,lim=R.limiteKw(kw100,+G.pctLim);
    const kwSel=(ent,sel)=>ent.bancos.reduce((t,b)=>t+R.soma(b.kws,sel[b.id]||[]),0);
    const copia=o=>Object.fromEntries(Object.keys(o).map(k=>[k,(o[k]||[]).slice()]));
    const inter=pctsIntermediarios(),seq=[];
    let prev=atual0,prevKw=kwSel(e,prev);const totFin=kwSel(e,fin);
    inter.forEach(p=>{
      const ei=entrada(true);ei.bancos.forEach(b=>{b.atual=(prev[b.id]||[]).slice()});
      ei.alvoKw=kw100*p/100;ei.pesoMudanca=+E.pesoMudanca;
      if(p>100){ei.modoAlvo='minimo';ei.excessoMaxKw=(+G.exc)/100*kw100}else ei.modoAlvo='abaixo';
      let r;try{r=R.sugere(ei)}catch(x){return}
      const tot=kwSel(ei,r.selecao);
      if(tot>prevKw+1e-9&&tot<=totFin+1e-9){seq.push({rot:p+' %',pct:p,sel:r.selecao});prev=r.selecao;prevKw=tot}
    });
    /* seleção FINAL: com sub-degraus ela é recalculada PARTINDO do último sub-degrau (assim o último passo só faz pequenos ajustes, em vez de trocar tudo).
       Só vale se o total for igual ao da seleção já mostrada/guardada (fin); senão (ex.: seleção feita à mão) fica a fin. */
    let finSel=fin;
    if(inter.length){
      const ef=entrada(true);ef.bancos.forEach(b=>{b.atual=(prev[b.id]||[]).slice()});ef.alvoKw=alvoKw();ef.pesoMudanca=+E.pesoMudanca;
      if(pctAlvo()>100){ef.modoAlvo='minimo';ef.excessoMaxKw=(+G.exc)/100*kw100}else ef.modoAlvo='abaixo';
      try{const r=R.sugere(ef);if(Math.abs(kwSel(ef,r.selecao)-totFin)<1e-6)finSel=r.selecao}catch(x){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }
    }
    seq.push({rot:null,pct:null,sel:finSel});
    /* TETO da sobreposição (antigas + novas ligadas juntas) de CADA trecho: nível do sub-degrau + sobrePts pontos %, e nunca acima do limite de segurança.
       Sem sub-degraus (plano comum) vale só o limite de segurança, como sempre. */
    const tetoDe=pct=>{let t=lim==null?Infinity:lim;if(inter.length&&pct!=null)t=Math.min(t,kw100*(pct+(+E.sobrePts||0))/100);return t};
    const passos=[],avisos=[];let tOff=0;prev=atual0;
    seq.forEach(item=>{
      const ent=Object.assign({},e,{atual:copia(prev),selecao:item.sel});
      const mk=la=>R.planoEntrada(Object.assign({},ent,{escalonamento:Object.assign({},base,{ligaAntes:la,janelaDesligaS:+E.janelaS||0})}));
      let pl=mk(lig);
      const teto=tetoDe(item.pct!=null?item.pct:pctAlvo());
      if(lig&&R.picoPlano(ent,pl)>teto+1e-9){
        avisos.push((item.rot?'Sub-degrau '+item.rot:'Trecho final')+': ligar antes passaria de '+fmtKw(teto)+' kW (sobreposição); trocou as chaves no mesmo instante.');
        pl=mk(false);
      }
      pl.passos.forEach(p=>passos.push({t:tOff+p.t,liga:p.liga,desliga:p.desliga,rot:item.rot||(inter.length?'final':null)}));
      if(pl.passos.length)tOff+=pl.duracaoS+(+E.pausaSubS||0);
      prev=item.sel;
    });
    G.plano={passos,finalSel:finSel,duracaoS:passos.length?passos[passos.length-1].t:0,avisos,nSub:seq.length,rots:inter.length?inter.map(x=>x+' %').join(' → ')+' → '+pctAlvo()+' %':''};
  }
  const guardaAtual=()=>R.guarda(Object.assign(entrada(true),{selecao:selObj()}));
  let tm=[],escAte=0;   // escAte: até quando os sub-degraus estão em curso (ms); 0 = nenhum
  /** Executa o plano: cada passo clica nas chaves (mesmo caminho do operador). Rechecka a guarda antes de CADA passo. */
  function aplica(){
    {const m=semBancoMsg();if(m){G.msg=m;return desenha()}}   // v1.10.108
    if(patIdx()<0){G.msg='Escolha o patamar (%) antes de aplicar.';return desenha()}
    const g=guardaAtual();if(!g.ok){G.msg=g.mensagem;return desenha()}
    if(T.started&&!T.fim)APL_ET=Math.min(T.et,ETAPAS.length-1);   // v1.10.120: marca o patamar como aplicado (Manual: libera a mãe)
    planoDe();tm.forEach(clearTimeout);tm=[];
    {const fs=G.plano&&G.plano.finalSel;if(fs&&fs!==selObj()&&Object.keys(fs).every(k=>(G.sel[k]||[]).length===fs[k].length)){bancosAtivos().forEach(({b})=>{G.sel[b.id]=fs[b.id].slice();if(G.sug[b.id])G.sug[b.id]=fs[b.id].slice()});pinta()}}   // v1.10.106: a seleção final do plano (mesmo total) vira a seleção/tracejado
    const pl=G.plano;if(!pl.passos.length){G.msg='Nada a mudar: as chaves já estão como a seleção.';return desenha()}
    escAte=pl.nSub>1?Date.now()+pl.duracaoS*1000+500:0;
    try{if(window.devObs)window.devObs.log('bco','sistema','Escalonador: plano com '+pl.passos.length+' passo(s) em '+pl.duracaoS+' s'+(pl.nSub>1?' · '+pl.nSub+' trechos ('+pl.rots+')':''),(pl.avisos&&pl.avisos.length)?'aviso':'info',{duracaoS:pl.duracaoS,trechos:pl.nSub,avisos:pl.avisos})}catch(x){ /* ignorado: o log de desenvolvimento é opcional */ }
    const clica=(banco,idx)=>{const bi=BANCOS.findIndex(b=>b.id===banco),i=off(bi)+idx,t=document.querySelector('#bancos .tile[data-i="'+i+'"]');if(t)t.click()};
    const passoFn=(p,n)=>{
      const g2=guardaAtual();if(!g2.ok){G.msg='Interrompido: '+g2.mensagem;desenha();return}
      {/* v1.10.106: com 'liga antes, desliga depois' a carga passa por um valor MAIOR que o da seleção final; confere esse transitório contra o limite de segurança antes de mexer nas chaves */
       const lim=R.limiteKw(+G.kw100,+G.pctLim),idx=c=>off(BANCOS.findIndex(b=>b.id===c.banco))+c.idx;let tot=somaKw(cmdDe);
       p.desliga.forEach(c=>{if(cmdDe(idx(c)))tot-=kwEf(idx(c))});p.liga.forEach(c=>{if(!cmdDe(idx(c)))tot+=kwEf(idx(c))});
       if(lim!=null&&tot>lim+1e-9){G.msg='Interrompido: o passo '+(n+1)+' levaria a carga a '+fmtKw(tot)+' kW, acima do limite de segurança de '+fmtKw(lim)+' kW.';try{if(window.devObs)window.devObs.log('bco','sistema','Escalonador: passo interrompido pela guarda (transitório acima do limite)','falha',{passo:n+1,kw:tot,limite:lim})}catch(x){ /* ignorado: o log de desenvolvimento é opcional */ }desenha();return}}
      p.desliga.forEach(c=>{const i=off(BANCOS.findIndex(b=>b.id===c.banco))+c.idx;if(cmdDe(i))clica(c.banco,c.idx)});
      p.liga.forEach(c=>{const i=off(BANCOS.findIndex(b=>b.id===c.banco))+c.idx;if(!cmdDe(i))clica(c.banco,c.idx)});
      if(n===pl.passos.length-1){G.msg='Aplicado: patamar '+pctAlvo()+' % ('+fmtKw(g2.total)+' kW). Aguarde a confirmação física das chaves.';
        if(window.GRAF_PUB)window.GRAF_PUB.marco('Guiado: '+pctAlvo()+' % → '+fmtKw(g2.total)+' kW')}
      desenha()};
    const pfG=perfilAtual();
    if(!pfG){pl.passos.forEach((p,n)=>tm.push(setTimeout(()=>passoFn(p,n),p.t*1000)))}
    else{   /* v1.10.220: gas/biometano — ENCADEADO: cada degrau que ACRESCENTA carga espera a pausa e a frequencia recuperar; sem recuperar no limite = DESISTE (nao adiciona carga) */
      escAte=Date.now()+36e5;const fimEsc=()=>{escAte=0};   /* ultAddPerfil e do MODULO (nao reinicia a cada Aplicar): clicar Aplicar de novo NAO fura a pausa */
      const vai=n=>{
        if(n>=pl.passos.length){fimEsc();return}
        const p=pl.passos[n],gap=n===0?0:Math.max(0,(p.t-pl.passos[n-1].t))*1000;
        const tenta=()=>{
          if(p.liga.length){
            const r=window.PERFIL_COMB.liberaProximo(pfG,{esperouS:(Date.now()-ultAddPerfil)/1000,freqHz:freqPerfil(),freqNomHz:freqNomPerfil()});
            if(r.desiste){fimEsc();G.msg='Interrompido: '+r.motivo+'. Nenhuma carga nova foi adicionada; confira o gerador e clique em Aplicar de novo.';try{if(window.devObs)window.devObs.log('bco','sistema','Perfil '+pfG.nome+': degrau '+(n+1)+' desistiu — '+r.motivo,'falha',{passo:n+1})}catch(x){ /* ignorado: o log de desenvolvimento é opcional */ }desenha();return}
            if(!r.libera){G.msg='Aguardando para o degrau '+(n+1)+' de '+pl.passos.length+': '+r.motivo;desenha();tm.push(setTimeout(tenta,1000));return}
            ultAddPerfil=Date.now();
          }
          passoFn(p,n);vai(n+1)};
        tm.push(setTimeout(tenta,gap))};
      vai(0)}
    G.msg='Aplicando '+pl.passos.length+' passo(s), duração '+pl.duracaoS+' s…';desenha();
  }
  /* ===== v1.10.220: PERFIL DE COMBUSTIVEL (fb_perfil_combustivel_v0.1.js). Diesel = null = comportamento de sempre. ===== */
  let ultAddPerfil=0;   /* ms do ultimo degrau que ACRESCENTOU carga no perfil gas/biometano (persiste entre Aplicar) */
  function perfilAtual(){try{const P=window.PERFIL_COMB;if(!P)return null;const p=P.get(G.comb);return P.ehDiesel(p)?null:p}catch(e){return null}}
  /** Frequencia medida (Hz). window.__perfilFreqOverride = gancho SO de teste/diagnostico. Sem leitura = null (o portao NAO libera carga). */
  function freqPerfil(){try{if(typeof window.__perfilFreqOverride==='function')return window.__perfilFreqOverride();const d=window.__ultimoDado,f=d?find(d,'frequencia'):null;return(typeof f==='number'&&isFinite(f)&&f>0)?f:null}catch(e){return null}}
  function freqNomPerfil(){const h=+G.hz||+(window.DADOS_MODELO&&window.DADOS_MODELO.Hz);return h>0?h:60}
  function combHtml(){const P=window.PERFIL_COMB;if(!P)return'';const cur=P.get(G.comb);
    return '<div class="pd-sec"><h4>Combustível do gerador</h4><div class="gd-row"><select data-gd="f" data-k="comb" aria-label="Combustível do gerador">'+Object.values(P.PERFIS).map(p=>'<option value="'+p.id+'"'+(p.id===cur.id?' selected':'')+'>'+esc(p.nome)+'</option>').join('')+'</select></div><div class="cat-i">'+esc(cur.resumo)+(P.ehDiesel(cur)?'':' Valores assumidos: confirmar com o datasheet do motor.')+'</div></div>'}
  /** Queda PLANEJADA de carga (etapa sem carga) em degraus, no perfil gas/biometano. Emergencia (DSE, limite) segue pela derrubaTudo(): imediata. */
  function descarregaPerfil(motivo,pf){
    tm.forEach(clearTimeout);tm=[];escAte=Date.now()+36e5;
    const lig=[];BANCOS.forEach((b,bi)=>b.chaves.forEach((_,j)=>{const i=off(bi)+j;if(cmdDe(i))lig.push({id:i,kw:kwEf(i)})}));
    const pd=window.PERFIL_COMB.planoDescida(pf,+G.kw100,lig);
    if(!pd.grupos.length){escAte=0;G.msg=motivo;desenha();return}
    pd.grupos.forEach((g,n)=>tm.push(setTimeout(()=>{g.abre.forEach(i=>{if(cmdDe(i)){const tl=document.querySelector('#bancos .tile[data-i="'+i+'"]');if(tl)tl.click()}});
      if(n===pd.grupos.length-1){escAte=0;G.msg='Carga retirada em '+pd.grupos.length+' etapa(s) ('+pf.nome+').'}else G.msg='Retirando carga ('+pf.nome+'): etapa '+(n+1)+' de '+pd.grupos.length+', restam '+fmtKw(g.kwDepois)+' kW.';
      desenha()},n*pd.pausaS*1000)));
    G.msg=motivo+' Descida em '+pd.grupos.length+' etapa(s) ('+pf.nome+').';if(typeof msgGer==='function')msgGer(G.msg,12000);desenha();
  }
  function derrubaTudo(motivo){
    tm.forEach(clearTimeout);tm=[];escAte=0;
    BANCOS.forEach((b,bi)=>b.chaves.forEach((_,j)=>{const i=off(bi)+j;if(cmdDe(i)){const t=document.querySelector('#bancos .tile[data-i="'+i+'"]');if(t)t.click()}}));
    G.msg=motivo;if(typeof msgGer==='function')msgGer(motivo,12000);desenha();
  }
  /* ---- Rodar ensaio (v1.9.90): FB mãe virtual. O módulo só decide; AQUI ficam os braços (adaptadores) do medidor. ---- */
  const demoOn=()=>!!($('demo')&&$('demo').checked);
  /* v1.10.0: SIDSE = Simulador Ideal DSE (valores teóricos). É a fonte PADRÃO do Manual guiado: nunca gera falha de DSE. O DSE real só vale se o operador
     escolher "DSE real" no diálogo (só habilita com o DSE conectado e fora do Demo). No Demo é sempre SIDSE. */
  const dseConectado=()=>!!(LINK.dse.ok&&Date.now()-LINK.dse.ts<5000);
  const sidse=()=>demoOn()||G.fonteDse!=='REAL';
  const somaKw=f=>bancosAtivos().reduce((s,{b,bi})=>s+b.chaves.reduce((a,_,j)=>a+(f(off(bi)+j)?kwEf(off(bi)+j):0),0),0);
  let ultDseOk=Date.now();
  const mae=window.FBV.criaMae({
    divergentes:()=>bancosAtivos().reduce((n,{b,bi})=>n+b.chaves.filter((_,j)=>cmdDe(off(bi)+j)!==ligDe(off(bi)+j)).length,0),   // v1.10.163: confirmação chave a chave (FB mãe v0.13, achado M2)
    agora:()=>Date.now(),iniciado:()=>!!T.started,fimEnsaio:()=>!!T.fim,etapa:()=>Math.min(T.et,ETAPAS.length-1),nEtapas:()=>ETAPAS.length,
    alvoPct:i=>ETAPAS[i].alvo,kw100:()=>{sincKw();return +G.kw100},modelo:()=>window.DADOS_MODELO||null,fonte:()=>sidse()?'virtual':'dse',
    dseOk:()=>{const ok=sidse()||dseConectado(),t=Date.now();if(ok)ultDseOk=t;return ok||t-ultDseOk<=(+G.tolDseS)*1000},   // mesma tolerância (tolDseS) da proteção do DSE: não derruba por falha de 1 leitura nem logo após abrir a página
    sugere:()=>{previaEt=null;sugere();return{total:guardaAtual().total}},guarda:()=>guardaAtual(),
    aguardaSalvar:()=>!!(T.aguarda&&!SNAP[T.et]),aplicaManual:i=>modoAplicaEt(i)==='M',aplicouEt:i=>APL_ET===i,aplicarInfo:()=>aplicarInfo(),sugerePrevia:et=>{previaEt=et;sugere();return{total:guardaAtual().total}},
    limpaPrevia:()=>{previaEt=null;sugere()},limpaTracejado:()=>{G.sug=sugVazio();pinta()},
    aplica:()=>{previaEt=null;aplica()},duracaoPlanoS:()=>G.plano?+G.plano.duracaoS||0:0,descarrega:m=>{const pf=perfilAtual();if(pf&&pf.descida)descarregaPerfil(m,pf);else derrubaTudo(m);G.sug=sugVazio();G.sel=Object.fromEntries(BANCOS.map(b=>[b.id,[]]));bancosAtivos().forEach(({b})=>{G.sel[b.id]=b.chaves.map(()=>false)});pinta()},derruba:m=>{derrubaTudo(m);G.sug=sugVazio();G.sel=Object.fromEntries(BANCOS.map(b=>[b.id,[]]));bancosAtivos().forEach(({b})=>{G.sel[b.id]=b.chaves.map(()=>false)});pinta()},
    extra:()=>{const m=window.DADOS_MODELO||{};return{pctLim:+G.pctLim,degrauKw:degrauKw(),pausaS:T.started?0:+G.pausa,tolDseS:+G.tolDseS,
      escSig:JSON.stringify([G.esc.ativo,G.esc.ligaAntes,G.esc.janelaS,G.esc.pausaSubS,G.esc.sobrePts,G.esc.trechos.map(x=>x.passos),G.comb]),subTxt:(()=>{const p=pctsIntermediarios();return p.length?p.join(' → ')+' → '+pctAlvo()+' %':'sem sub-degraus'})(),
      menorChaveKw:Math.min(...bancosAtivos().flatMap(({b,bi})=>b.chaves.map((_,j)=>(DIS[off(bi)+j]||!bkLiberado(b.id))?Infinity:kwEf(off(bi)+j)))),
      nHabil:bancosAtivos().reduce((s,{b,bi})=>s+b.chaves.filter((_,j)=>!DIS[off(bi)+j]&&bkLiberado(b.id)).length,0),
      kwMed:MED.kw,vMed:MED.va,hzMed:MED.hz,kva:m.kVA,V:m.V,Hz:m.Hz,acion:Object.fromEntries(BANCOS.map(b=>[b.id,(RD[b.id].acion||[]).reduce((a,x)=>a+(x||0),0)]))}},
    kwComandado:()=>somaKw(cmdDe),kwConfirmado:()=>somaKw(ligDe),tempoEtapaS:()=>+T.el||0,
    marco:t=>{if(/^FBs: (AGUARDA|SUGERINDO|ESCALONANDO|CONFIRMANDO|PARADO)/.test(t))return;   // v1.9.92: no gráfico só o que importa (patamar confirmado, sem carga, falha, fim)
      if(window.GRAF_PUB)window.GRAF_PUB.marco(t)}});
  const maeMsg=()=>mae.foto().msg;
  /** Liga/desliga o GUIADO (uma só decisão, guardada). Ligado = a mãe fica armada e religa sozinha depois de ZERAR/gravar. */
  /* v1.10.1: o guiado AUTOMÁTICO só funciona com Operador = Auto (card Simulação) E salvamento manual (cabeçalho). `auto` e `salvarManual` são os mesmos
     controles que o operador já usa. Fora disso fica desligado (o Manual guiado — Sugerir/Aplicar — continua valendo normalmente). */
  const autoOk=()=>PORPAT||(auto===true&&(salvarManual===true||sidse()));   // v1.10.120: em 'Por patamar' o operador é de verdade e o guiado liga sozinho   // v1.10.106: salvamento AUTOMÁTICO também vale, desde que a fonte seja o SIDSE
  const MSG_AUTO='Patamar Guiado: use o salvamento "Por patamar" (⚙ Modo) ou, no Demo, OPERADOR = Auto (card Simulação) com salvamento manual — ou automático, só com a fonte SIDSE.';
  function limpaManual(){G.manualSug=false;G.selCons={};G.sug=sugVazio();bancosAtivos().forEach(({b})=>{G.sel[b.id]=b.chaves.map(()=>false)});pinta()}   // tira tracejado/seleção do uso manual
  function alternaRodar(){
    if(!G.guiadoOn&&!autoOk()){G.msg=MSG_AUTO;msgGer(MSG_AUTO,8000);atualizaBtnRodar();desenha();return}
    if(G.guiadoOn&&mae.estado==='FALHA'&&mae.rearma()){msgGer('Patamar rearmado pelo operador: recalculando a etapa.',5000);atualizaBtnRodar();desenha();return}   // v1.10.159: em FALHA o 1º clique REARMA (não desliga)
    G.guiadoOn=!G.guiadoOn;G.guiadoOff=!G.guiadoOn;   // não é guardado: a cada abertura da página nasce desligado
    if(G.guiadoOn){limpaManual();mae.arma()}else{mae.desarma('guiado desligado pelo operador');limpaManual()}
    atualizaBtnRodar();desenha()}
  function atualizaBtnRodar(){const b=$('bGuiadoRun');if(!b)return;const on=!!G.guiadoOn,e=mae.estado;
    b.style.pointerEvents='none';
    {const f0=$('gFicha');if(f0)f0.hidden=true;const gb=$('bGuiado');if(gb){if(gb.textContent!=='🧭 Patamar Guiado')gb.textContent='🧭 Patamar Guiado';gb.classList.toggle('gdrun-on',on)}}   // v1.10.103: o estado vai no chip "Patamar: On/Off"; a ficha do gerador vai no tooltip do chip
    /* v1.10.103: chip curto "Patamar: On/Off" (On/Off = convenção do projeto para chips de estado). Detalhes (aguardando INICIAR, FALHA, chaves ≠ sugerido…) ficam no tooltip. */
    const t=on?'Patamar: On':'Patamar: Off';
    const det=on?'Patamar Guiado LIGADO'+(e==='AGUARDA_INICIO'?' · aguardando INICIAR':e==='FALHA'?' · FALHA — clique em Patamar para REARMAR':e==='PREVIA'?' · '+maeMsg():e==='NO_PATAMAR'?(/^chaves ≠/.test(mae.foto().msg)?' · chaves ≠ sugerido':' · no patamar'):e==='FIM'?' · fim':''):(T.started&&!T.fim?'Patamar Guiado DESLIGADO — nada será sugerido neste ensaio':'Patamar Guiado desligado');
    if(b.textContent!==t)b.textContent=t;
    const cl='enschip'+(on?(e==='FALHA'?' err':' ok'):(T.started&&!T.fim?' mock':''));
    if(b.className!==cl)b.className=cl;
    /* ficha do gerador escolhido (a "teoria" que o Patamar usa): kVA · V · Hz · 100 % = kW — agora no tooltip */
    const dm=window.DADOS_MODELO,k=+G.kw100,ft=dm?(dm.kVA+' kVA · '+dm.V+' V · '+Math.round(+dm.Hz)+' Hz · 100 % = '+(k>0?String(k).replace('.',','):'?')+' kW'+(k>0?' → 30 % '+(k*.3).toFixed(1).replace('.',',')+' · 50 % '+(k*.5).toFixed(1).replace('.',',')+' · 107 % '+(k*1.07).toFixed(1).replace('.',','):'')):(k>0?'Potência 100 % = '+k+' kW (sem modelo do catálogo)':'escolha o gerador em Dados do ensaio');
    let fi=$('gFicha');if(!fi){fi=document.createElement('span');fi.id='gFicha';fi.hidden=true;b.insertAdjacentElement('afterend',fi)}
    const tt=det+'\n'+ft+' · DSE: '+(sidse()?'SIDSE':'real');
    if(b.title!==tt)b.title=tt;
    if(fi.textContent!==ft)fi.textContent=ft}
  /* v1.10.2: o liga/desliga fica SÓ no diálogo; o chip do cabeçalho apenas mostra o estado (não clica) */
  /** v1.10.219: BANDA (pontos %) em que a carga conta como 'chegou ao degrau' no patamar manual = max(3, melhor erro possivel do banco para o alvo + 1,5). */
  let _bandaK='',_bandaV=3;
  window.PATAMAR_BANDA_PP=()=>{try{
    const i=Math.min(T.et,ETAPAS.length-1),al=+ETAPAS[i].alvo,kw100=+G.kw100;if(!(kw100>0)||!(al>0))return 3;
    const e=entrada(true),sig=[i,kw100,G.pctLim,G.exc,e.bancos.map(b=>b.id+':'+(b.habil||[]).map(x=>x?1:0).join('')).join(',')].join('|');
    if(sig!==_bandaK){_bandaK=sig;const e2=Object.assign({},e,{alvoKw:kw100*al/100});
      if(al>100){e2.modoAlvo='minimo';e2.excessoMaxKw=(+G.exc)/100*kw100}else e2.modoAlvo='abaixo';
      let er=0;try{er=Math.abs(R.sugere(e2).erro)/kw100*100}catch(x){er=0}
      _bandaV=Math.max(3,er+1.5)}
    return _bandaV}catch(x){return 3}};
  window.PATAMAR_ESCALONANDO=()=>Date.now()<escAte;   // v1.10.106: true enquanto os sub-degraus estão sendo aplicados (o cronômetro da etapa espera)
  window.GUIADO_MAE=mae;   // para testes/diagnóstico
  window.GUIADO_DBG={G,planoDe:()=>{planoDe();return G.plano},inter:()=>pctsIntermediarios(),sugere:()=>sugere(),aplica:()=>aplica(),esc:()=>G.esc};   // v1.10.106: só leitura/diagnóstico do escalonador (testes e Log)
  window.PATAMAR_GUIADO_ON=()=>!!G.guiadoOn&&mae.armada;
  /* v1.10.229 (Passo 5, B3): se desarmar a "mãe" falhar, o Patamar pode continuar armado e voltar a comandar chaves. Antes o erro era engolido; agora vai para o log de desenvolvimento (DEV.OBS) como erro. */
  const maeFalhaDesarmar=x=>{try{if(window.devObs)window.devObs.log('bco','sistema','Patamar: falha ao DESARMAR a mãe (ela pode continuar armada) — '+(x&&x.message?x.message:x),'erro')}catch(y){/* o próprio log é opcional */}};
  window.PATAMAR_ENSAIO_GRAVADO=()=>{try{mae.desarma('ensaio gravado')}catch(x){maeFalhaDesarmar(x)}limpaManual();G.plano=null;G.msg='';G.pat=-1;previaEt=null;APL_ET=-1;salva();atualizaBtnRodar();desenha()};   // v1.10.195: gravar o ensaio devolve o card Patamar ao inicial (sem patamar escolhido); o liga/desliga fica como o operador deixou
  window.PATAMAR_GUIADO_PARA=m=>{try{mae.desarma(m||'ensaio parado')}catch(x){maeFalhaDesarmar(x)}limpaManual();G.plano=null;G.msg='';atualizaBtnRodar();desenha()};   // v1.10.103: PARAR ENSAIO restabelece o Patamar (o liga/desliga continua como o operador deixou: religa sozinho no próximo ensaio)   // v1.10.2: o simulador consulta isto para não escolher chaves por conta própria
  /* ---- catálogo: agora é o módulo CATDSE (acima), compartilhado com "Dados do ensaio" ---- */

  /* ---- tela ---- */
  /* v1.9.87: o catálogo saiu daqui. O modelo/kW vêm de "Dados do ensaio" (fonte única). O topo só mostra o que já foi escolhido lá. */
  const abreDados=()=>{const d=$('dlgDados'),b=$('bDados');if(d&&!d.open&&b)b.click()};   // só abre (nunca fecha)
  /** kW a 100 %: SEMPRE a Potência (kW) de Dados do ensaio quando preenchida (evita duas fontes); senão o último valor salvo. */
  /** v1.9.89: degrau máximo por CÁLCULO TEÓRICO. Campo vazio = 30 % de kW a 100 % (ASSUMIDO — a engenharia confirma); número digitado vence.
      POR QUÊ: o degrau não pode ser maior que o gerador aguenta de uma vez (segurança). Para 'tudo junto' digite um valor alto. */
  const DEGRAU_TEORICO_PCT=30;
  const degrauKw=()=>{const kw=+G.kw100;if(G.deg!==''&&G.deg!=null&&!isNaN(+G.deg))return +G.deg;const pf=perfilAtual();return kw>0?Math.round(kw*(pf?pf.passoMaxPct:DEGRAU_TEORICO_PCT))/100:null};
  /* ---- Tabela de potência (v1.9.89): consulta. Regra (260 kVA x 0,8 = 208 kW = 110 % -> 100 % = 189 = kW_xml do catálogo): 110 % = 100 % x 1,1;
         30/50/107 % são frações do 100 %. Dados: catálogo DSE 60 Hz. NÃO comanda nada. ---- */
  const TABPOT=[[9,[9.3,12.5,15.5]],[11,[15.5]],[13,[14]],[15,[15,17]],[16,[22]],[18,[25]],[20,[27,27.5]],[23,[25]],[24,[33]],[25,[27,30]],[26,[29,36]],[27,[30]],[29,[40]],[32,[40]],[35,[48]],[36,[40]],[38,[42,53]],[39,[53]],[40,[40,44,55]],[47,[65]],[50,[55]],[52,[57]],[54,[75]],[55,[75]],[58,[80]],[62,[68,85]],[69,[95]],[73,[100]],[75,[94]],[76,[94]],[80,[100,110]],[84,[92]],[87,[120]],[91,[100,120,125]],[94,[100,130]],[98,[135]],[102,[140]],[104,[143]],[108,[135]],[109,[120,150,225]],[116,[160]],[124,[136,170]],[132,[165]],[138,[190]],[145,[170,200]],[156,[215]],[164,[225]],[172,[215]],[189,[260]],[200,[275]],[221,[305]],[229,[315]],[233,[320]],[247,[340]],[249,[343]],[251,[343]],[254,[350]],[258,[355]],[262,[360]],[280,[350]],[282,[353]],[291,[400]],[318,[438]],[327,[450]],[331,[415]],[332,[415]],[334,[500]],[364,[500]],[366,[504]],[378,[520]],[400,[550]],[404,[504]],[407,[560]],[411,[565]],[454,[625]],[455,[625]],[458,[630]],[473,[650]],[487,[670]],[492,[615]],[494,[680]],[495,[680]],[496,[620]],[524,[720]],[545,[750]],[560,[770]],[582,[800]],[727,[1000]],[800,[1100]],[909,[1250]],[945,[1300]],[1047,[1440]],[1091,[1500]],[1358,[1698]],[1364,[1875]],[1418,[1950]],[1571,[2160]],[1818,[2500]],[2393,[3291]]];   // [kW placa, [kVA dos modelos]]
  function abreTabPot(){
    const d=$('dlgTabPot'),c=$('tpCorpo');if(!d||!c)return;
    const m=window.DADOS_MODELO,placa=m&&+m.kW>0?+m.kW:(+G.kw100>0?+G.kw100:0);
    const f=x=>pt(x,1);
    c.innerHTML='<p style="font-size:12.5px;margin:0 0 6px">Linha em destaque = gerador dos Dados do ensaio. <b>100 % = kW_xml do catálogo</b> (o mesmo valor de “kW a 100 %”); 30 / 50 / 107 % são frações do 100 %; <b>110 % = 100 % × 1,1</b> (limite de segurança).</p>'+
      '<div style="max-height:62vh;overflow:auto"><table class="tp"><thead><tr><th>kVA</th><th>30 %</th><th>50 %</th><th>100 %</th><th>107 %</th><th>110 %</th></tr></thead><tbody>'+
      TABPOT.map(r=>{const k100=r[0],k=k100*1.1;return '<tr'+(k100===placa?' class="tp-at" id="tpAt"':'')+'><td>'+r[1].join(' / ')+'</td><td>'+f(k100*.30)+'</td><td>'+f(k100*.50)+'</td><td>'+f(k100)+'</td><td>'+f(k100*1.07)+'</td><td>'+f(k)+'</td></tr>'}).join('')+
      '</tbody></table></div><div class="cat-i">Fonte: catálogo DSE (kW_xml, 60 Hz; ex.: 260 kVA → 189 kW a 100 % → 208 kW a 110 %). Para conferir com a tabela impressa, compare a linha do seu gerador.</div>';
    d.show();
    const g=$('dlgGuiado');if(g&&g.open){const r=g.getBoundingClientRect();d.style.margin='0';d.style.position='fixed';d.style.top=Math.max(8,r.top)+'px';d.style.left=Math.max(8,Math.min(innerWidth-660,r.right+10))+'px'}   // abre ao lado do Guiado, sem cobri-lo
    const at=$('tpAt');if(at&&at.scrollIntoView)at.scrollIntoView({block:'center'});
  }
  /** v1.9.95: kW a 100 % = o do MODELO escolhido em Dados do ensaio (kW_xml do catálogo); só sem modelo vale a Potência (kW) digitada.
      POR QUÊ: o Guiado deve seguir o modelo do ensaio (uma fonte só). Antes seguia só a Potência digitada, que podia diferir do modelo
      (ex.: Potência 90 e modelo 100 -> chaves de 27 kW com sugestão de 30 kW). */
  const kwDoModelo=()=>{const m=window.DADOS_MODELO;const v=m?+m.kW:0;return v>0?v:0};   // v1.10.0: DADOS_MODELO.kW já vem da tabela 60 Hz (ou do .dse) — ver potModelo()
  const kwDigitado=()=>{const p=window.CATDSE.num(($('dPot')||{}).value);return p>0?p:0};
  function sincKw(){const p=kwDoModelo()||kwDigitado();if(p>0&&p!==+G.kw100){G.kw100=p;salva()}
    /* v1.9.98: o gerador SIMULADO (Demo) passa a ter a potência do gerador ESCOLHIDO. Antes a base era fixa em 91 kW, e o % de carga lido
       (110 % com 100 kW ligados) não batia com as etapas. Fora do Demo o % vem do DSE real: volta ao valor original. */
    const demo=$('demo')&&$('demo').checked;KW_NOM=demo&&p>0?p:91}
  /* v1.10.103: TAMANHO do diálogo — zoom manual do conteúdo (A− / A+) e leitura das medidas para o operador copiar e informar na revisão.
     Por quê: o operador ajusta a janela do jeito que gosta e passa os números; eu fixo como padrão na versão seguinte. */
  /* v1.10.113: a barra A−/A+/100 %/COPIAR MEDIDAS saiu; o tamanho agora é o botão ⤢ da barra de título (janelas_v0.1.js), igual em todas as janelas. */
  topo.insertAdjacentHTML('afterbegin','<div id="mgMod"></div>');
  const modBox=$('mgMod');let modH='';
  function desenhaMod(){
    sincKw();const m=window.DADOS_MODELO,kw=+G.kw100;
    const H='<div class="gd-mod"><span class="ibub" tabindex="0" data-tip="O gerador é definido em Dados do ensaio (modelo do catálogo ou potência digitada). O kW a 100 % é a base de todos os cálculos.">i</span><span>'+(m?'Modelo: <b>'+esc(m.arquivo)+'</b>':(G.modelo?'Modelo: <b>'+esc(G.modelo)+'</b>':'<b>Nenhum modelo escolhido</b>'))+'</span><span>kW a 100 %: <b>'+(kw>0?fmtKw(kw):'—')+'</b> <small style="opacity:.7">'+(kwDoModelo()?'(do modelo)':(kwDigitado()?'(digitado, sem modelo)':''))+'</small>'+(kwDoModelo()&&kwDigitado()&&Math.abs(kwDoModelo()-kwDigitado())>0.001?' <small style="color:var(--ui-acento-esc)" title="A Potência digitada em Dados do ensaio é diferente do modelo; o Guiado usa a do modelo.">⚠ Potência digitada: '+fmtKw(kwDigitado())+'</small>':'')+'</span><button type="button" data-gd="dados">Dados do ensaio</button></div>'+(kw>0?'':'<div class="cat-i" style="margin-bottom:4px">Preencha a <b>Potência (kW)</b> (ou escolha um modelo) em Dados do ensaio.</div>');
    if(H!==modH){modBox.innerHTML=H;modH=H}
  }
  /** Resumo da sugestão por banco (as chaves em si aparecem tracejadas no card Cargas — sem lista duplicada aqui). */
  const resumo=()=>{const L=bancosAtivos().map(({b,bi})=>{const k=[];(G.sel[b.id]||[]).forEach((v,j)=>{if(v)k.push('#'+(j+1)+' ('+fmtKw(kwEf(off(bi)+j))+')')});return '<b>BC'+b.id+':</b> '+(k.length?k.join(', '):'nenhuma chave')});
    /* v1.10.135: BC59,5/BC550 entram na mesma lista, no mesmo formato dos outros bancos (sem rótulo "manual" — a
       pedido do operador). Ainda não têm tile no card Cargas (isso é a próxima etapa da migração, com Node-RED/PLC);
       até lá, esta linha é como o operador sabe quais chaves ligar nesses dois bancos. */
    const LC=bancosConsAtivos().map(b=>{const k=[];(G.selCons[b.id]||[]).forEach((v,j)=>{if(v)k.push('#'+(j+1)+' ('+fmtKw(b.chaves[j])+')')});
      return k.length?'<b>BC'+b.id+':</b> '+k.join(', '):''}).filter(Boolean);
    return '<div class="gd-resumo">'+L.join('<br>')+(LC.length?'<br>'+LC.join('<br>'):'')+' <span class="ibub" tabindex="0" data-tip="As chaves sugeridas aparecem tracejadas (laranja) no card Cargas; o rodízio escolhe quais. BC59,5/BC550 ainda não têm tile (migração em andamento): ligue/desligue as chaves listadas aqui.">i</span></div>'};
  /** Opções do Patamar SEM 0 % (v1.9.87): o roteiro só pede carga; o retorno sem carga é "Abrir TODAS as chaves".
      Se o ensaio estiver numa etapa de 0 % e "Seguir" marcado, essa etapa aparece desabilitada só para o seletor não ficar em branco. */
  /** v1.10.2: Patamar em botões de marcar (✓): só as %, sem 0 %. Nasce sem nenhum marcado; clicar no marcado desmarca. Com o ensaio iniciado acompanha a etapa (desabilitado). */
  const chipsPatamar=()=>{
    /* v1.10.120: um cartão por patamar = [% (marca/desmarca a sugestão)] + [Manual | Auto] = COMO AS CHAVES ENTRAM neste patamar.
       Só vale no salvamento "Por patamar". Patamar em andamento/passado não muda. */
    return ETAPAS.map((e,k)=>({e,k})).filter(x=>x.e.alvo>0).map(x=>{
      const k=x.k,m=modoAplicaEt(k),on=patIdx()===k,trava=!PORPAT||MODO==='carga'||(T.started&&!T.fim&&k<=T.et);
      const bt=(v,t,tt)=>'<button type="button" data-gd="am" data-k="'+k+'" data-m="'+v+'" class="'+(m===v&&PORPAT?'on':'')+'"'+(trava?' disabled':'')+' aria-pressed="'+(m===v&&PORPAT)+'" title="'+esc(tt)+'">'+t+'</button>';
      return '<div class="gd-pc'+(on?' on':'')+(emCurso()&&k===Math.min(T.et,ETAPAS.length-1)?' cur':'')+'">'+
        '<button type="button" class="gd-chip'+(on?' on':'')+'" data-gd="pat" data-k="'+k+'"'+(emCurso()?' disabled':'')+' aria-pressed="'+on+'" title="'+esc((x.e.nome||'')+' · '+x.e.min+' min')+'">'+(on?'✓ ':'')+x.e.alvo+' %</button>'+
        '<div class="gd-sv" role="group" aria-label="Entrada das chaves no patamar '+x.e.alvo+' %">'+bt('M','✋','Manual: o sistema mostra a sugestão (tracejada) e espera você clicar Aplicar')+bt('A','<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" style="vertical-align:-3px"><path d="M17.6 8.5A7 7 0 0 0 6 7.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M6.4 15.5A7 7 0 0 0 18 16.5" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M17 4.5v4h-4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 19.5v-4h4" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>','Auto: o sistema aplica a sugestão sozinho')+'</div>'+
        '</div>'}).join('')};
  const opsPatamar=()=>ETAPAS.map((e,k)=>({e,k})).filter(x=>x.e.alvo>0||(patIdx()===x.k))
    .map(x=>'<option value="'+x.k+'"'+(patIdx()===x.k?' selected':'')+(x.e.alvo>0?'':' disabled')+'>'+(x.k+1)+'. '+x.e.alvo+' % ('+x.e.min+' min)</option>').join('');
  function desenha(){
    if(!dlg.open)return;
    desenhaMod();
    if(dlg.contains(document.activeElement)&&/INPUT|SELECT/.test(document.activeElement.tagName))return;   // não atrapalha quem está digitando
    const g=guardaExibicao(),sel=g.total,al=alvoKw(),dif=sel-al;   // v1.10.134: exibição conta PLC + bancos manuais; aplica()/planoDe() continuam com guardaAtual() (só PLC) para liberar comando
    const cl=!g.ok?'gd-bad':(dif>0.0001&&pctAlvo()<=100?'gd-warn':'gd-ok');
    const H=
     '<div class="gd-pat" role="group" aria-label="Patamar">'+chipsPatamar()+'<button type="button" class="gd-emerg" data-gd="drop" title="Emergência / reinício: abre TODAS as chaves ligadas ou comandadas, nos dois bancos, sem esperar o plano.">⛔ Abrir TODAS as chaves</button></div>'+
     (!PORPAT?'<div class="gd-row" style="margin:4px 0 0"><button type="button" data-gd="porpat" title="Muda o salvamento para Por patamar: a etapa grava sozinha e cada patamar escolhe como as chaves entram">Usar salvamento “Por patamar”</button></div>':'')+
     '<div class="gd-row" style="align-items:center"><button type="button" data-gd="sug" class="'+(T.run?'':'on')+'"'+(T.run?' disabled title="Desligado: o cronômetro (INICIAR) está ativo. Sugerir chaves só funciona com ele parado ou pausado."':'')+'>Sugerir chaves</button><button type="button" data-gd="zera">Limpar seleção</button><button type="button" data-gd="ap" class="on" title="Comanda as chaves sugeridas, uma a uma, pelos mesmos botões do card Cargas (valem todas as travas)">Aplicar</button><span class="gd-estado" title="Estado do Patamar Guiado. Para ligar ou desligar: ⚙ Modo › Salvamento › Por patamar.">'+(mae.armada?'Patamar: On':'Patamar: Off')+'</span><span class="ibub" tabindex="0" data-tip="Cada cartão: o % do degrau e como as chaves entram nele. Manual = o sistema sugere e você clica Aplicar. Auto = entram sozinhas. Só vale com o salvamento Por patamar (⚙ Modo).'+(T.started?' Ensaio iniciado: o patamar acompanha a etapa; a cada etapa nova clique em Sugerir e Aplicar.':'')+'">i</span></div>'+
     '<div class="gd-res '+cl+'">'+(g.ok?'':'<p class="gd-res-msg">'+esc(g.mensagem)+'</p>')+'<div class="gd-res-stats"><span>Seleção <b>'+fmtKw(sel)+' kW</b></span><span>Alvo <b>'+pt(al,1)+' kW</b> ('+pctAlvo()+' %)</span><span>Diferença <b>'+(dif>0?'+':'')+pt(dif,1)+' kW</b></span><span>Limite <b>'+(g.limiteKw==null?'—':fmtKw(g.limiteKw)+' kW')+'</b></span></div></div>'+
     '<div style="font-size:12.5px">'+esc(G.msg||'')+'</div>';
    const HA2=
     '<details style="margin-top:8px"><summary style="cursor:pointer;font-size:12.5px">Ajustes avançados (valores provisórios — a engenharia confirma)</summary><div class="gd-g" style="margin-top:6px">'+
      '<label title="Percentual provisório e único para todos os geradores">Limite de segurança (%) <input data-gd="f" data-k="pctLim" type="number" step="1" value="'+G.pctLim+'"></label>'+
      '<label>Excesso no 107 % (pontos %) <input data-gd="f" data-k="exc" type="number" step="0.5" value="'+G.exc+'"></label>'+
      '<label title="Vazio = cálculo teórico: '+DEGRAU_TEORICO_PCT+' % de kW a 100 % (provisório)">Degrau máx. (kW) <input data-gd="f" data-k="deg" type="number" step="5" placeholder="teórico: '+(degrauKw()==null?'—':fmtKw(degrauKw()))+'" value="'+esc(String(G.deg))+'"></label>'+
      '<label title="Só vale com o ensaio PARADO; com o ensaio iniciado os degraus entram sem pausa">Pausa entre degraus (s) <input data-gd="f" data-k="pausa" type="number" step="1" value="'+G.pausa+'"></label>'+
      '</div>'+escHtml()+'<div class="cat-i">Se o DSE parar de responder, as chaves abrem sozinhas (obrigatório, vale para qualquer controlador; fora do modo Demo).</div></details>'+
     '<p style="font-size:11.5px;opacity:.75;margin:6px 0 0">Só comanda ao clicar em “Aplicar”. O rodízio das chaves é automático; para informar troca de resistência use o botão “🔧 Troca de resistência” do card Cargas.</p>';
    const PLANOHTML='<pre style="font-size:11.5px;max-height:110px;overflow:auto;margin:6px 0 0">'+(G.plano&&G.plano.passos.length?(G.plano.nSub>1?'Sub-degraus: '+G.plano.rots+'\n':'')+(G.plano.avisos||[]).map(a=>'⚠ '+a+'\n').join('')+G.plano.passos.map(p=>'t='+p.t+' s  '+(p.rot?'['+p.rot+'] ':'')+(p.desliga.length?'ABRE '+p.desliga.map(c=>'BC'+c.banco+'#'+(c.idx+1)).join(', ')+'  ':'')+(p.liga.length?'FECHA '+p.liga.map(c=>'BC'+c.banco+'#'+(c.idx+1)).join(', '):'')).join('\n'):'(sem passos)')+'</pre>';
    const DET=combHtml()+'<div class="pd-sec"><h4>Bancos</h4><div class="gd-row">'+BANCOS.map(b=>chkBanco(b.id)).join(' ')+'</div></div>'+
     '<div class="pd-sec"><h4>Resumo por banco</h4>'+resumo()+'</div>'+
     '<div class="pd-sec"><h4>Plano de passos</h4>'+PLANOHTML+'</div>'+
     '<div class="pd-sec"><h4>Operador e salvamento</h4><div class="gd-row"><span class="enschip '+(auto===true?'ok':'err')+'" title="Card Simulação › Operador. Só existe no Demo.">'+(auto===true?'✓':'✗')+' Operador: Auto</span><span class="enschip '+(salvarManual===true||sidse()?'ok':'err')+'" title="Cabeçalho › ⚙ Modo › Salvamento. Manual vale sempre; automático só com a fonte SIDSE (simulador ideal do DSE).">'+(salvarManual===true||sidse()?'✓':'✗')+' Salvamento: '+(salvarManual===true?'manual':(sidse()?'automático (SIDSE)':'automático (exige SIDSE)'))+'</span></div></div>'+
     '<div class="pd-sec"><h4>Fonte do DSE</h4><div class="gd-row"><button type="button" data-gd="fSidse" class="'+(sidse()?'on':'')+'" title="SIDSE = Simulador Ideal DSE: valores teóricos, nunca gera falha de DSE. Padrão.">SIDSE (simulador ideal)</button><button type="button" data-gd="fReal" class="'+(!sidse()?'on':'')+'"'+((demoOn()||!dseConectado())&&sidse()?' disabled':'')+' title="'+(demoOn()?'No Demo o DSE é sempre o SIDSE':!dseConectado()?'DSE real não conectado agora':'Usa o DSE real: se ele parar de responder, as chaves abrem por segurança')+'">DSE real</button></div></div>'+
     '<div class="pd-sec"><h4>Ferramentas</h4><div class="gd-row"><button type="button" data-gd="mapa" title="Abre o mapa dos FBs com o estado ao vivo">🗺 Mapa dos FBs</button><button type="button" data-gd="mapaJan" title="Abre o mapa numa janela separada, para arrastar à segunda tela (como o gráfico)">↗ Mapa em outra janela</button><button type="button" data-gd="tabpot" title="Consulta: kW de cada patamar por potência de gerador">📋 Tabela de potência</button></div></div>'+
     '<div class="pd-sec"><h4>Ajustes</h4>'+HA2+'<label class="gd-chk" style="display:flex;gap:6px;margin-top:8px;font-size:12.5px"><input type="checkbox" id="chkPlcNovos"'+(PLC_NOVOS?' checked':'')+'> BC59,5 e BC550 já estão no PLC (recarrega a página)</label></div>';
    window.__patDet=DET;atualizaDet(false);const HA=H;if(HA!==ultA){corpo.innerHTML=HA;ultA=HA}   // só mexe no DOM quando algo mudou (não perde o clique do operador)
  }

  /* v1.10.151: Detalhes do Patamar = janela fixa no HTML (dlgPatDet), com ⤢ de tamanho, posição lembrada e seções. */
  function abreDetalhes(){const d=$('dlgPatDet');atualizaDet(true);if(!d.open)d.show()}
  let detAnt='';
  function atualizaDet(forca){
    const d=$('dlgPatDet'),cp=$('dlgPatDetCp');if(!d||!cp||(!forca&&!d.open))return;
    const f=document.activeElement;if(!forca&&f&&cp.contains(f)&&(f.tagName==='SELECT'||f.tagName==='TEXTAREA'||(f.tagName==='INPUT'&&f.type!=='checkbox')))return;   // não atrapalha quem está digitando
    if(forca||window.__patDet!==detAnt){cp.innerHTML=window.__patDet||'';detAnt=window.__patDet}
  }
  {const bd=$('bPatDet');if(bd)bd.onclick=abreDetalhes}
  /* ---- Troca de resistência (v1.9.82): o operador só INFORMA; o desgaste da chave volta a zero ---- */
  const trSel=new Set();let trMsg='',trH='',trAb=null;   // trAb = id do banco aberto (nenhum ao abrir)
  const dataBr=iso=>{const m=/^(\d{4})-(\d\d)-(\d\d)/.exec(iso||'');return m?m[3]+'/'+m[2]+'/'+m[1]:'—'};
  function desenhaTroca(){
    if(!dTr.open)return;
    const H='<p style="font-size:12.5px;margin:0 0 6px">Marque a(s) chave(s) cuja <b>resistência foi trocada</b> e clique em registrar. O sistema zera o desgaste dessas chaves (o rodízio passa a tratá-las como novas). Não liga nem desliga nada.</p>'+
      BANCOS.map(b=>{const nSel=[...trSel].filter(k=>k.split(':')[0]===String(b.id)).length;   /* v1.10.124: cada banco é um sub card (nasce fechado; abre um por vez) */
        return'<details class="gd-bk tr-bk" data-bk="'+b.id+'"'+(trAb===String(b.id)?' open':'')+'><summary><h4 style="display:inline">BC'+b.id+'</h4> <small>'+b.chaves.length+' chaves'+(nSel?' · '+nSel+' marcada(s)':'')+'</small></summary><div class="gd-ch" style="grid-template-columns:repeat(auto-fill,minmax(64px,1fr))">'+b.chaves.map((c,j)=>'<button type="button" class="tr-ch'+(trSel.has(b.id+':'+j)?' on':'')+'" data-tr="t" data-b="'+b.id+'" data-j="'+j+'"><b>'+fmtKw(kwEf(off(BANCOS.indexOf(b))+j))+'</b><small>#'+(j+1)+'</small><small>troca: '+dataBr((DATAS[b.id]||[])[j])+'</small></button>').join('')+'</div></details>'}).join('')+
      '<div class="gd-row"><button type="button" data-tr="ok" class="on"'+(trSel.size?'':' disabled')+'>Registrar troca ('+trSel.size+' chave(s))</button><button type="button" data-tr="lim">Limpar marcação</button></div><div style="font-size:12.5px">'+esc(trMsg)+'</div>';
    if(H!==trH){trC.innerHTML=H;trH=H}
  }
  bTr.onclick=()=>{if(dTr.open)dTr.close();else{dTr.show();trAb=null;trH='';desenhaTroca()}};
  trC.addEventListener('click',e=>{const sm=e.target.closest('summary');if(sm){e.preventDefault();const id=sm.parentNode.dataset.bk;trAb=trAb===id?null:id;trH='';desenhaTroca();return}   // v1.10.124: acordeão — abre um banco, fecha o outro
    const t=e.target.closest('[data-tr]');if(!t)return;const a=t.dataset.tr;
    if(a==='t'){const k=t.dataset.b+':'+t.dataset.j;trSel.has(k)?trSel.delete(k):trSel.add(k);trMsg=''}
    else if(a==='lim'){trSel.clear();trMsg=''}
    else if(a==='ok'){const hoje=new Date().toISOString().slice(0,10);let n=0;
      trSel.forEach(k=>{const [id,j]=k.split(':');R.chaveTrocada(RD[id],+j);(DATAS[id]=DATAS[id]||[])[+j]=hoje;n++});
      salvaR();try{localStorage.setItem('medidor.guiado.trocas.v1',JSON.stringify(DATAS))}catch(x){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
      if(typeof msgGer==='function')msgGer('Troca de resistência registrada em '+n+' chave(s): desgaste zerado.',8000);
      trMsg='Registrado: '+n+' chave(s) com desgaste zerado em '+dataBr(hoje)+'.';trSel.clear();ultA=''}
    trH='';desenhaTroca()});
  /** Campos do escalonador (v1.10.106). 'e' = valor simples, 'et' = texto dos passos de cada transição. */
  function escHtml(){
    const E=G.esc,tr=E.trechos.map((t,i)=>'<label title="Passos, em pontos percentuais, para subir de '+t.de+' % até '+t.ate+' %. Vários valores separados por vírgula (o último se repete). Vazio = sem sub-degraus nesta transição.">'+t.de+' → '+t.ate+' % · passos (pts) <input data-gd="et" data-i="'+i+'" type="text" value="'+esc(t.passos)+'" style="width:86px"></label>').join('');
    return'<div class="gd-p" style="margin-top:8px">Escalonador de entrada <span style="font-weight:400;opacity:.75">— FB filho 10 (valores assumidos)</span></div><div class="gd-g">'+
      '<label title="A carga sobe em sub-degraus entre as etapas (só com o ensaio iniciado)."><input data-gd="e" data-k="ativo" type="checkbox"'+(E.ativo?' checked':'')+' style="width:auto"> Sub-degraus ligados</label>'+
      '<label title="Liga as chaves novas ANTES de tirar as que não servem mais, para a carga nunca cair no meio da subida."><input data-gd="e" data-k="ligaAntes" type="checkbox"'+(E.ligaAntes?' checked':'')+' style="width:auto"> Ligar antes, desligar depois</label>'+
      '<label title="Tempo entre ligar as chaves novas e desligar as antigas.">Janela ligar→desligar (s) <input data-gd="e" data-k="janelaS" type="number" step="0.5" min="0" value="'+E.janelaS+'"></label>'+
      '<label title="Tempo entre um sub-degrau e o próximo.">Pausa entre sub-degraus (s) <input data-gd="e" data-k="pausaSubS" type="number" step="0.5" min="0" value="'+E.pausaSubS+'"></label>'+
      '<label title="Enquanto as chaves antigas e as novas estão ligadas juntas, a carga pode passar do nível do sub-degrau em no máximo estes pontos percentuais. Passou disso: aquele sub-degrau troca as chaves no mesmo instante.">Sobreposição máx. (pts) <input data-gd="e" data-k="sobrePts" type="number" step="0.5" min="0" value="'+E.sobrePts+'"></label>'+tr+'</div>';
  }
  /** Desenha a sugestão (borda tracejada) nas chaves do card Cargas. */
  let bkNasceu=false;
  function bkNascimento(){if(bkNasceu)return;const caixa=document.querySelectorAll('#bancos details.bk[data-bk]');if(!caixa.length)return;bkNasceu=true;
    let m={};try{m=JSON.parse(localStorage.getItem('medidor.bkAberto.v1')||'{}')}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
    caixa.forEach(d=>{const id=d.dataset.bk;if(m[id]===undefined)d.open=!!G.usa[id]})}
  /* v1.10.221: o tracejado (sugestao) some 10 s depois que a carga CHEGOU ao degrau (aplicado e dentro da banda); volta se a carga sair da banda ou o operador mexer numa chave. */
  let atingiuDesde=0,atingiuEt=-1;
  function tracejadoVencido(){try{const ai=aplicarInfo();if(!T.started||T.fim||ai.liberado||typeof carga!=='number'||!dadoOk||!(ai.alvoPct>0)){atingiuDesde=0;return false}
    const banda=window.PATAMAR_BANDA_PP?window.PATAMAR_BANDA_PP():3;if(atingiuEt!==ai.et){atingiuEt=ai.et;atingiuDesde=0}
    if(Math.abs(carga-ai.alvoPct)<=banda){if(!atingiuDesde)atingiuDesde=Date.now();return Date.now()-atingiuDesde>=10000/Math.max(1,T.sp||1)}   /* 10 s de ensaio: no acelerado (Demo 10x) encolhe junto com o relogio */atingiuDesde=0;return false}catch(x){return false}}
  function pinta(){bkNascimento();
    const marca=new Set();bancosAtivos().forEach(({b,bi})=>{if(G.sug[b.id])G.sug[b.id].forEach((v,j)=>{if(v)marca.add(off(bi)+j)})});
    {const venc=tracejadoVencido();document.querySelectorAll('#bancos .tile[data-i]').forEach(t=>t.classList.toggle('sug',(dlg.open||mae.armada)&&marca.has(+t.dataset.i)&&!venc))}
    /* v1.10.137: bancos só-consulta (sem PLC) também mostram o tracejado da sugestão — só análise visual, nada é comandado. */
    document.querySelectorAll('#bancosVis .tile[data-cons]').forEach(t=>{const sel=(G.selCons[t.dataset.cons]||[])[+t.dataset.j],ativo=bancosConsAtivos().some(b=>b.id===t.dataset.cons);t.classList.toggle('sug',!!(dlg.open&&ativo&&sel))});
  }
  window.GUIADO={pinta,chaveTrocada:(id,j)=>{R.chaveTrocada(RD[id],j);(DATAS[id]=DATAS[id]||[])[j]=new Date().toISOString().slice(0,10);salvaR()}};

  /* v1.10.120: ao mudar o salvamento (⚙ Modo). Em "Por patamar" o guiado liga sozinho; saindo dele, volta ao critério antigo (a vigia desliga se não valer). */
  window.__aoMudarSalva=()=>{if(PORPAT&&!G.guiadoOn&&!T.fim){G.guiadoOn=true;if(!mae.armada)mae.arma()}atualizaBtnRodar();ultA='';desenha()};
  $('bAplicaPat').onclick=()=>aplica();
  window.PATAMAR_PENDENTE=()=>{try{return aplicarInfo().liberado}catch(x){return false}};
  /** v1.10.221: clique do operador numa chave com o Patamar ligado: a sugestao (tracejado) passa a refletir o novo estado desejado. Nao comanda nada (o comando segue o caminho de sempre). */
  window.PATAMAR_SINC_CLIQUE=i=>{try{if(!mae.armada)return;const alvo=bancosAtivos().find(({b,bi})=>i>=off(bi)&&i<off(bi)+b.chaves.length);if(!alvo||DIS[i])return;const b=alvo.b,j=i-off(alvo.bi);
    const s=(G.sug[b.id]=G.sug[b.id]||b.chaves.map(()=>false));s[j]=!cmdDe(i);atingiuDesde=0;ultA='';pinta()}catch(x){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }};
  window.PATAMAR_EDITA=i=>{
    const alvo=bancosAtivos().find(({b,bi})=>i>=off(bi)&&i<off(bi)+b.chaves.length);if(!alvo)return;
    const b=alvo.b,j=i-off(alvo.bi);
    if(DIS[i]){msgGer('Chave desabilitada (card Cargas › ⚙ Chaves).');return}
    const sel=(G.sel[b.id]=G.sel[b.id]||b.chaves.map(()=>false)),novo=!sel[j];sel[j]=novo;G.sug[b.id]=sel.slice();
    G.msg='Sugestão ajustada: chave #'+(j+1)+' do BC'+b.id+(novo?' ENTRA':' fica DE FORA')+'. Nada foi comandado — clique em Aplicar quando estiver pronto.';
    planoDe();ultA='';desenha();pinta()};
  G.guiadoOff=false;   /* v1.10.221: sem botao Ligar/Desligar no dialogo, o que ficou guardado como desligado manualmente nao pode prender o Patamar */
  if(PORPAT&&!G.guiadoOn)G.guiadoOn=true;
  if(G.guiadoOn)mae.arma();   // religa o guiado guardado (depois de tudo definido: a mãe já usa degrauKw/RD)
  /* ---- eventos ---- */
  const onClickGd=e=>{const t=e.target.closest('[data-gd]');if(!t)return;const a=t.dataset.gd;
    if(a==='pat'){if(!emCurso()){const k=+t.dataset.k;G.pat=G.pat===k?-1:k;if(G.pat<0){G.sug=sugVazio();G.selCons={}}planoDe();ultA='';desenha();pinta()}return}
    if(a==='am'){if(setAplicaEt(+t.dataset.k,t.dataset.m)){ultA='';desenha()}return}   // v1.10.120: Manual/Auto de UM patamar
    if(a==='porpat'){window.__setSalvaModo('P');return}
    if(a==='sug'){if(T.run){G.msg='Sugerir chaves só funciona com o cronômetro (INICIAR) parado ou pausado. Durante o ensaio, o Patamar escolhe as chaves; use Aplicar ou clique nas chaves para ajustar.';msgGer(G.msg,6000);desenha();return}G.manualSug=true;sugere()}else if(a==='ap')aplica();
    else if(a==='zera'){G.manualSug=false;bancosAtivos().forEach(({b})=>{G.sel[b.id]=b.chaves.map(()=>false)});G.sug=sugVazio();G.selCons={};planoDe();desenha();pinta()}
    else if(a==='drop')derrubaTudo('Todas as chaves comandadas foram abertas.');
    else if(a==='det')abreDetalhes();
    else if(a==='dados')abreDados();
    else if(a==='tabpot')abreTabPot();
    else if(a==='fSidse'||a==='fReal'){if(a==='fReal'&&(demoOn()||!dseConectado())){G.msg='DSE real indisponível agora (Demo ligado ou DSE sem leitura).'}else{G.fonteDse=a==='fReal'?'REAL':'SIDSE';salva();G.msg='Fonte do DSE: '+(G.fonteDse==='REAL'?'DSE real (proteção de DSE ativa)':'SIDSE (simulador ideal)')}atualizaBtnRodar();desenha()}
    else if(a==='uc'){if(window.bancosUsoToggle)window.bancosUsoToggle(t.dataset.b,t.checked);desenha()}   // v1.10.135: toggle dos bancos manuais (BC59,5/BC550) direto na linha "Bancos" do Patamar
    else if(a==='rodar')alternaRodar();
    else if(a==='mapaJan')abreMapaJanela();
    else if(a==='mapa'){janMapa=abrePainelMapa();try{if(janMapa)janMapa.postMessage(mae.foto(),'*')}catch(x){ /* ignorado: janela ou canal já fechado */ }}   // v1.10.103: painel dentro da página (a janela separada ia para trás ao clicar em SALVAR)
    };
  const detDlg=$('dlgPatDet');
  dlg.addEventListener('click',onClickGd);detDlg.addEventListener('click',onClickGd);   // v1.10.151: a janela Detalhes usa os mesmos botões
  const onChangeGd=e=>{const t=e.target,a=t.dataset.gd;if(!a)return;
    if(a==='f'){G[t.dataset.k]=t.type==='number'&&t.value!==''?+t.value:t.value}
    else if(a==='e'){const k=t.dataset.k;G.esc[k]=t.type==='checkbox'?t.checked:Math.max(0,+t.value||0)}   // v1.10.106
    else if(a==='et'){G.esc.trechos[+t.dataset.i].passos=t.value}
    else if(a==='u'){G.usa[t.dataset.b]=t.checked;bancoNasce(t.dataset.b,t.checked)}
    else if(a==='p'){G.pat=+t.value}
    salva();planoDe();desenha();pinta()};
  dlg.addEventListener('change',onChangeGd);detDlg.addEventListener('change',onChangeGd);
  detDlg.addEventListener('change',e=>{if(e.target&&e.target.id==='chkPlcNovos'){try{localStorage.setItem('medidor.plcNovos',e.target.checked?'1':'0')}catch(x){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }location.reload()}});   // v1.10.156
  /* v1.10.132: o diálogo virou o CORPO do card Patamar (inline). O botão "Patamar Guiado" recolhe/abre esse corpo. Quando outro código fecha
     todos os dialog[open] (ex.: ligar o Demo), o corpo volta sozinho — só fica fechado se o operador o recolheu. */
  let patRec=false;
  const patAbre=()=>{dlg.setAttribute('open','');planoDe();desenha();pinta()};
  bt.onclick=()=>{patRec=!patRec;if(patRec){dlg.close()}else patAbre();bt.setAttribute('aria-expanded',String(!patRec))};
  dlg.addEventListener('close',()=>{pinta();if(!patRec)setTimeout(()=>{if(!dlg.open)dlg.setAttribute('open','')},0)});

  /* ---- vigia de 1 s: rodízio (contagem), proteção do DSE e atualização da tela ---- */
  const antes={};let semDseDesde=0,ult=Date.now();
  setInterval(()=>{
    const agora=Date.now(),dt=(agora-ult)/3600000;ult=agora;
    BANCOS.forEach((b,bi)=>b.chaves.forEach((_,j)=>{const i=off(bi)+j,l=ligDe(i);
      if(l&&!antes[i]){R.registraUso(RD[b.id],j,{acionamentos:1})}          // contou 1 acionamento quando a chave CONFIRMOU ligada
      if(l)R.registraUso(RD[b.id],j,{horas:dt});antes[i]=l}));
    if(Math.round(agora/1000)%10===0)salvaR();
    // proteção OBRIGATÓRIA (decisão do operador 28/10): DSE parou de responder → abre as chaves, para qualquer controlador e com a janela aberta ou fechada.
    // Fora do Demo: no Demo (local ou com PLC) o DSE é SIMULADO, não há DSE real que possa cair.
    if(!sidse()){   // v1.10.0: só com o DSE REAL escolhido (no SIDSE/Demo não há DSE que possa cair)
      const dseOk=LINK.dse.ok&&agora-LINK.dse.ts<5000;
      if(dseOk)semDseDesde=0;else{if(!semDseDesde)semDseDesde=agora;
        if(agora-semDseDesde>(+G.tolDseS)*1000&&BANCOS.some((b,bi)=>b.chaves.some((_,j)=>cmdDe(off(bi)+j)))){semDseDesde=0;derrubaTudo('DSE sem resposta há mais de '+G.tolDseS+' s: chaves abertas por segurança (Manual guiado).')}}
    }
    sincKw();   // mantém kW a 100 % e a base do gerador simulado em dia, mesmo com o diálogo fechado
    if(G.guiadoOn&&!autoOk()){G.guiadoOn=false;mae.desarma('guiado desligado: Operador/Salvamento mudou');G.msg=MSG_AUTO;msgGer('Patamar Guiado desligado: '+MSG_AUTO.replace('Patamar Guiado: ',''),9000);atualizaBtnRodar()}
    if(mae.armada&&!emCurso()&&!G.manualSug&&BANCOS.some(b=>G.sug[b.id]))limpaManual();   // v1.10.2: ensaio parado/terminado: tira a sombra (tracejado) e a seleção
    if(PORPAT&&!G.guiadoOn&&!G.guiadoOff&&!T.fim)G.guiadoOn=true;
    if(G.guiadoOn&&!mae.armada&&!emCurso()&&(!T.fim||T.gravado))mae.arma();   // religa depois de ZERAR/gravar
    try{mae.ciclo()}catch(x){console.error('FBs virtuais',x)}
    try{if(mae.armada)pinta()}catch(x){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }   /* v1.10.221: reavalia o tracejado (some 10 s depois que a carga chegou ao degrau) */
    atualizaBtnRodar();   // 1 ciclo da mãe por segundo (como um OB cíclico)
    if(!emCurso())APL_ET=-1;
    {const ai=aplicarInfo(),ba=$('bAplicaPat');if(ba){ba.hidden=!ai.liberado;if(ai.liberado)ba.textContent='✔ Aplicar ('+ai.alvoPct+' %)'}}
   // v1.10.120: só aparece quando há sugestão esperando o operador
    try{if(janMapa&&!janMapa.closed)janMapa.postMessage(mae.foto(),'*')}catch(x){ /* ignorado: janela ou canal já fechado */ }   // v1.9.97: mapa dos FBs ao vivo (sem servidor)
    try{if(janMapaExt&&!janMapaExt.closed)janMapaExt.postMessage(mae.foto(),'*')}catch(x){ /* ignorado: janela ou canal já fechado */ }   // v1.10.106: mapa em janela própria
    desenha();pinta();desenhaTroca();
  },1000);
})();
