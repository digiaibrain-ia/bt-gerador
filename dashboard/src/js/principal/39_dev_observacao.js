
/* ===== v1.9.73 · DEV.OBS — observabilidade para o desenvolvedor (par do gerenciador_logs_v1.4.html) =====
   O QUE FAZ: registra, só na memória do navegador (até 4000 eventos), o que o teste faz e o que a tela responde: cliques, mudanças de estado
   (modo, gerador, simulação, ensaio, chaves ligadas/comandadas, chave do Setup, popups, bolinhas de comunicação), mensagens ao operador
   (#gmsg, alert, confirm), ocorrências (OCOR) e chamadas /api/ (todo POST e GET que falhou, no máximo 1 falha de GET a cada 10 s por rota).
   O QUE NÃO FAZ: não comanda nada, não escreve no PLC/DB53, não registra a senha (prompt não é tocado) e não registra as leituras OK de 1 s.
   Só PUBLICA (canal local + POST /api/dev/log-evento) depois da senha do Demo, e o POST nunca sai no Demo local. Qualquer falha aqui dentro é engolida: o log nunca atrapalha a tela. */
(function(){
  'use strict';
  const MAXBUF=4000,SESSAO='s'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),T0=performance.now();
  const BUF=[],OCSET=new Set(),GETF={},OUV=new Set();
  let N=0,DESCART=0,ENV_ATE=0,pubOk=null,flowVisto=null,ultErro='',pubBusy=false,obsWin=null,prev=null,prevLib=false;
  let CAN=null;try{if(typeof BroadcastChannel==='function')CAN=new BroadcastChannel('bt2-dev-obs')}catch(e){ /* ignorado: navegador sem BroadcastChannel */ }
  const trunc=(s,n)=>{s=String(s==null?'':s);return s.length>n?s.slice(0,n-1)+'…':s};
  const lib=()=>testeDesbloqueado===true;
  const limpa=o=>{if(o==null)return null;try{const x=JSON.stringify(o);return x.length<=800?JSON.parse(x):{_truncado:x.slice(0,799)+'…'}}catch(e){return null}};
  /* sigla do Card/Subcard (PADRAO_SIGLAS_CARDS.md) a partir do elemento: popup primeiro, depois a seção da tela. Fora disso = app */
  const DLG={dlgPatDet:'bco',dlgChSetup:'bco.SU',dlgDseSim:'sim.DSE',dlgChHD:'bco.HD',dlgLogs:'bco.LOG',dlgDados:'ens.DAD',dlgModo:'modo.POP',dlgMotor:'med.MOT',dlgAgua:'med.FX',dlgParam:'med.FX',dlgGrand:'med',dlgDemo:'DEV.DEM',dlgDevCards:'DEV.CARDS',dlgReg:'reg',dlgGrafico:'gra',dlgGuiado:'bco',dlgTabPot:'bco',dlgEtapa:'ens',dlgRes:'ens',dlgFim:'ens'};
  const SECC={modoCard:'modo',ens:'ens',gra:'gra',med:'med',bco:'bco',reg:'reg'};
  function area(el){try{const d=el&&el.closest?el.closest('dialog'):null;if(d)return d.id||'dialog';const c=el&&el.closest?el.closest('section[id]'):null;return c?c.id:'tela'}catch(e){return 'tela'}}
  function cardDe(el){try{const d=el&&el.closest?el.closest('dialog'):null;if(d)return DLG[d.id]||'app';const c=el&&el.closest?el.closest('section[id]'):null;return (c&&SECC[c.id])||'app'}catch(e){return 'app'}}

  /* v1.9.74: o log antigo dizia "clique na chave #0" e "[0,1,2]" (índice GLOBAL, base 0) enquanto a API/flow usam indice 1-based POR BANCO — o que levou a confundir
     BC56 com BC400 ao ler o log. Agora o texto sempre vem com o banco e a posição dentro dele (a mesma do "indice" de /api/chaves/{banco}/ligar). */
  const posBanco=i=>{const c=CH[i];if(!c)return null;const off=CH.findIndex(x=>x.b===c.b);return{id:BANCOS[c.b].id,pos:i-off+1,de:CH.filter(x=>x.b===c.b).length}};
  // v1.9.74: texto do elemento com ESPAÇO entre os pedaços (o log antigo dizia "Banco de 400 kW400 kW nominal" por juntar <b> e <small> sem espaço)
  const txtDe=el=>{try{const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),a=[];let n;while((n=w.nextNode()))a.push(n.nodeValue);return a.join(' ').replace(/\s+/g,' ').trim()}catch(e){return String(el.textContent||'').replace(/\s+/g,' ').trim()}};
  const chL=arr=>{
    if(!Array.isArray(arr))return fmt(arr);
    if(!arr.length)return 'nenhuma';
    const g={},ord=[];
    arr.forEach(i=>{const p=posBanco(i);if(!p)return;if(!g[p.id]){g[p.id]=[];ord.push(p.id)}g[p.id].push(p.pos)});
    return ord.map(id=>'BC'+id+' '+g[id].join(',')).join(' · ');
  };
  const txSel=v=>v===null||v===undefined?'sem sinal':v==='semcom'?'sem comunicação ET200':v==='auto'?'Auto (remoto)':'Manual (local)'; // v1.9.85: 'semcom' tem rótulo próprio (antes caía em Manual)

  /* ---- foto do estado (só leitura de variáveis e do DOM) ---- */
  function snap(){
    const demo=$('demo').checked;
    let ens='sem ensaio';
    if(T.started)ens=!T.fim?(T.run?'rodando':'armado'):(T.gravado?'finalizado+gravado':'finalizado');
    const tl=cl=>[...document.querySelectorAll('#bancos .tile[data-i]')].filter(t=>t.classList.contains(cl)).map(t=>+t.dataset.i);
    let setup=null;try{if(typeof window.chSetupSel==='function')setup=window.chSetupSel()}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }
    const com=Object.assign({dse:null},Object.fromEntries(BANCOS_PLC.map(b=>['b'+rotaDe(b.id),null])));   // v1.10.157: um por banco no PLC
    try{com.dse=!!LINK.dse.ok;if(srvUsaPlc())BANCOS_PLC.forEach(b=>{com['b'+rotaDe(b.id)]=!!LINK.bancoOk(b.id)})}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }
    const ch=tl('s1'),cmd=tl('cmd');
    return{modo:srvChave(),gen:demo?SIM.gen:GEN.estado,sim:demo?(auto?'AUTO':'MANUAL'):null,ens,et:T.started?T.et:null,
      ch,cmd,chL:chL(ch),cmdL:chL(cmd), // v1.9.74: chL/cmdL = o mesmo conteúdo em texto "BC56 1,2 · BC400 1" (banco + posição no banco)
      ...Object.fromEntries(BANCOS.flatMap(b=>[['sel'+rotaDe(b.id),BKS[b.id].sel],['lig'+rotaDe(b.id),BKS[b.id].lig]])), // v1.9.74: seletora/“Ligar banco” (v1.9.77: no PLC vêm do flow v2.4)
      setup,pop:[...document.querySelectorAll('dialog[open]')].map(d=>d.id).filter(Boolean),com};
  }
  const snapSafe=()=>{try{return snap()}catch(e){return null}};
  window.OBS_LOG={eventos:()=>BUF.slice(),descartados:()=>DESCART,sessao:()=>SESSAO}; // v1.10.171: leitura para a Central de registros (só lê)

  /* ---- registro ---- */
  /* v1.10.225: falha de API REPETIDA nao vira um evento por tentativa. 1a falha entra inteira; repeticoes iguais (mesmo card e acao, a cada <30 s) so contam; a cada 60 s entra UM resumo
     (primeira, ultima, contador). A consulta continua normal; so o registro muda. Sucesso/outra rota/outro status = evento normal e a serie recomeca. */
  const REP={}, REP_JANELA=30000, REP_RESUMO=60000;
  window.__obsRepForca=()=>{Object.keys(REP).forEach(k=>{REP[k].emit=0})};   // gancho SO de teste: forca o proximo resumo
  function log(card,tipo,acao,res,det,opt){
    try{
      opt=opt||{};
      if(tipo==='api'&&res==='falha'&&!opt.ts){const rk=(card||'app')+'|'+acao,ag=Date.now(),r=REP[rk];
        if(r&&ag-r.ult<REP_JANELA){r.n++;r.ult=ag;if(ag-r.emit<REP_RESUMO)return null;r.emit=ag;
          const hh=ms=>new Date(ms).toTimeString().slice(0,8);acao=acao+' — repetido ×'+r.n+' desde '+hh(r.t0);det=Object.assign({},det||{},{vezes:r.n,primeira:new Date(r.t0).toISOString(),ultima:new Date(ag).toISOString()})}
        else REP[rk]={t0:ag,ult:ag,n:1,emit:ag}}
      const e={sessao:SESSAO,n:++N,t:new Date(opt.ts||Date.now()).toISOString(),ms:Math.round(performance.now()-T0),v:VERSAO,
        modo:(()=>{try{return srvChave()}catch(x){return '?'}})(),card:card||'app',tipo,acao:trunc(acao,300),res:res||'info',det:limpa(det),est:opt.est||snapSafe()};
      BUF.push(e);if(BUF.length>MAXBUF){BUF.shift();DESCART++}
      emite(e);return e;
    }catch(err){return null}
  }
  function emite(e){ // canal local (mesmo navegador) e janela aberta pelo botão — só com a senha do Demo
    if(!lib())return;
    try{if(CAN)CAN.postMessage({k:'ev',e})}catch(x){ /* ignorado: janela ou canal já fechado */ }
    OUV.forEach(w=>{try{if(w.closed)OUV.delete(w);else w.postMessage({k:'ev',e},'*')}catch(x){OUV.delete(w)}});
  }
  function responde(dest){ // pedido de backlog do gerenciador
    const m=lib()?{k:'backlog',sessao:SESSAO,eventos:BUF.slice()}:{k:'bloqueado',sessao:SESSAO};
    try{if(dest)dest.postMessage(m,'*');else if(CAN)CAN.postMessage(m)}catch(x){ /* ignorado: janela ou canal já fechado */ }
  }
  if(CAN)CAN.onmessage=m=>{const d=m&&m.data;if(d&&d.k==='pede')responde(null)};
  window.addEventListener('message',m=>{const d=m&&m.data;if(!d||d.k!=='pede'||!obsWin||m.source!==obsWin)return;OUV.add(obsWin);responde(obsWin)}); // só responde à janela que ESTE botão abriu

  /* ---- transições de estado (varre a cada 300 ms; não depende de cada handler) ---- */
  const ROT={modo:'modo',gen:'gerador',sim:'simulação',ens:'ensaio',et:'etapa',setup:'chave no Setup',ch:'chaves ligadas (verde)',cmd:'chaves comandadas (laranja)','com.dse':'comunicação DSE'};
  BANCOS.forEach(b=>{const r=rotaDe(b.id);ROT['sel'+r]='seletora BC'+b.id;ROT['lig'+r]='BC'+b.id+' ligado (cbBanco.ligar)';ROT['com.b'+r]='comunicação BC'+b.id});   // v1.10.157
  const CARDC={modo:'DEV.DEM',gen:'app',sim:'app',ens:'ens',et:'ens',setup:'bco.SU',ch:'bco',cmd:'bco','com.dse':'modo'};
  BANCOS.forEach(b=>{const r=rotaDe(b.id);CARDC['sel'+r]='bco';CARDC['lig'+r]='bco';CARDC['com.b'+r]='modo'});
  const fmt=v=>v===null||v===undefined?'—':(Array.isArray(v)?'['+v.join(',')+']':(v===true?'OK':(v===false?'FALHA':String(v))));
  function transicao(c,de,para,s){
    let res='info';
    if(c.indexOf('com.')===0){if(de===null||para===null)return;res=para?'ok':'falha'}
    const f=(c==='ch'||c==='cmd')?chL:(c.indexOf('sel')===0?txSel:(c.indexOf('lig')===0?(v=>v?'LIGADO':'desligado'):fmt));
    log(CARDC[c]||'app','transicao',ROT[c]+': '+f(de)+' → '+f(para),res,{campo:c,de,para},{est:s});
    if(c==='ens'&&/^finalizado/.test(String(para))&&!/^finalizado/.test(String(de))&&lib()&&$('obsAbre').value==='auto')abreGerenciador('auto');
  }
  function tick(){
    try{
      const s=snap();
      if(!prev)log('app','sistema','estado inicial','info',null,{est:s});
      else{
        ['modo','gen','sim','ens','et','setup'].forEach(c=>{if(s[c]!==prev[c])transicao(c,prev[c],s[c],s)});
        ['ch','cmd'].forEach(c=>{if(JSON.stringify(s[c])!==JSON.stringify(prev[c]))transicao(c,prev[c],s[c],s)});
        BANCOS.flatMap(b=>['sel'+rotaDe(b.id),'lig'+rotaDe(b.id)]).forEach(c=>{if(s[c]!==prev[c])transicao(c,prev[c],s[c],s)});
        ['dse',...BANCOS_PLC.map(b=>'b'+rotaDe(b.id))].forEach(c=>{if(s.com[c]!==prev.com[c])transicao('com.'+c,prev.com[c],s.com[c],s)});
        s.pop.filter(x=>prev.pop.indexOf(x)<0).forEach(x=>log(DLG[x]||'app','transicao','abriu popup '+x,'info',{campo:'pop',id:x},{est:s}));
        prev.pop.filter(x=>s.pop.indexOf(x)<0).forEach(x=>log(DLG[x]||'app','transicao','fechou popup '+x,'info',{campo:'pop',id:x},{est:s}));
      }
      prev=s;
      const l=lib();if(l&&!prevLib)responde(null); // acabou de destravar: oferece o que já aconteceu
      prevLib=l;
    }catch(e){ /* ignorado: texto inválido: segue com o valor padrão */ }
  }

  /* ---- cliques e alterações do operador (captura: vem antes dos handlers da tela) ---- */
  document.addEventListener('click',e=>{
    try{
      const el=e.target&&e.target.closest?e.target.closest('.tile,button,summary,a[href]'):null;if(!el)return;
      let acao,det={area:area(el)};
      if(el.classList.contains('tile')){
        const i=el.dataset&&el.dataset.i!==undefined?+el.dataset.i:null,pb=i!==null?posBanco(i):null;
        // v1.9.74: "clique na chave BC56 #3 (4 kW)" = banco + posição DENTRO do banco (1-based, igual ao "indice" da API). det.chave segue o índice global só para depuração.
        acao='clique na chave'+(pb?' BC'+pb.id+' #'+pb.pos+' de '+pb.de:(i!==null?' #'+i:''))+' ('+trunc(txtDe(el),20)+')';
        det.chave=i;det.cls=el.className;if(pb){det.banco=pb.id;det.pos=pb.pos}
      }else{
        const tx=trunc(txtDe(el)||el.title||el.getAttribute('aria-label')||'',50);
        // v1.9.74: botão sem id (ex.: "✕", "Fechar") agora diz de que popup/card é — antes só dava para saber pelo campo "area"
        acao='clique em '+(el.id?'#'+el.id:'botão')+(tx?' "'+tx+'"':'')+(!el.id&&det.area&&det.area!=='tela'?' ['+det.area+']':'');det.id=el.id||null;
        if(el.dataset&&el.dataset.act){det.act=el.dataset.act;det.banco=el.dataset.b||null} // v1.9.74: botões da seletora / "Ligar banco" de cada banco
      }
      log(cardDe(el),'clique',acao,'info',det);
    }catch(x){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }
  },true);
  document.addEventListener('change',e=>{
    try{
      const el=e.target;if(!el||!el.tagName)return;
      if(el.tagName!=='INPUT'&&el.tagName!=='SELECT'&&el.tagName!=='TEXTAREA')return;
      if(el.type==='password')return;
      const v=(el.type==='checkbox'||el.type==='radio')?(el.checked?'marcado':'desmarcado'):trunc(el.value,80);
      log(cardDe(el),'alteracao','alterou '+(el.id?'#'+el.id:(el.name||el.type||el.tagName))+' = '+v,'info',{id:el.id||null,name:el.name||null,valor:v,area:area(el)});
    }catch(x){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }
  },true);

  /* ---- mensagens ao operador: #gmsg (msgGer), alert e confirm. prompt NÃO é tocado (é a senha) ---- */
  try{
    const g=$('gmsg');let ult='';
    if(g&&window.MutationObserver)new MutationObserver(()=>{const t=(g.textContent||'').trim();if(t&&t!==ult)log('app','mensagem',trunc(t,300),'aviso',{onde:'gmsg'});ult=t}).observe(g,{childList:true,characterData:true,subtree:true});
  }catch(e){ /* ignorado: API opcional do navegador */ }
  try{
    const al=window.alert.bind(window),cf=window.confirm.bind(window);
    window.alert=function(m){log('app','mensagem','alert: '+trunc(m,300),'aviso',{onde:'alert'});return al(m)};
    window.confirm=function(m){const r=cf(m);log('app','mensagem','confirm: '+trunc(m,200)+' → '+(r?'SIM':'NÃO'),'info',{onde:'confirm',resposta:r});return r};
  }catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }

  /* ---- ocorrências (módulo OCOR): nova ocorrência, repetição (no máx. 1 a cada 10 s) e "normalizou" ---- */
  try{
    if(window.OCOR&&window.OCOR.set){
      const o0=window.OCOR.set.bind(window.OCOR),l0=window.OCOR.limpa.bind(window.OCOR),ult={};
      window.OCOR.set=function(card,cod,texto,opc){
        const r=o0(card,cod,texto,opc);
        try{
          const k=cod+'|'+((opc&&opc.ref)||''),ag=Date.now();
          if(!OCSET.has(k)||(opc&&opc.ev&&ag-(ult[k]||0)>10000)){OCSET.add(k);ult[k]=ag;
            log(card||(r&&r.card)||'app','ocorrencia',cod+': '+trunc(texto||(r&&r.txt),200),r&&r.tipo==='i'?'info':(r&&r.tipo==='m'?'aviso':'falha'),{cod,ref:(opc&&opc.ref)||null,vezes:r&&r.vezes})}
        }catch(x){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }
        return r;
      };
      window.OCOR.limpa=function(card,cod,ref){
        const r=l0(card,cod,ref);
        try{const k=cod+'|'+(ref||'');if(OCSET.has(k)){OCSET.delete(k);log(card||'app','ocorrencia',cod+': normalizou','ok',{cod,ref:ref||null})}}catch(x){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }
        return r;
      };
    }
  }catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }

  /* ---- chamadas /api/: todo POST (ok ou falha) e GET que falhou. Nunca registra /api/dev/ (o próprio log). ---- */
  const F0=window.fetch.bind(window);
  const cardRota=c=>c.indexOf('/api/chaves')===0?'bco':(c.indexOf('/api/ensaio')===0?'reg':(c.indexOf('/api/logs')===0?'bco.LOG':((c.indexOf('/api/gerador')===0||c.indexOf('/api/simulador')===0)?'med':'app')));
  function apiEvt(m,c,st,ok,ms,corpo,r,err,ts){
    let omit=0;
    if(m==='GET'){ // leituras periódicas: no máximo 1 falha a cada 10 s por rota (conta as omitidas)
      const x=GETF[c]||(GETF[c]={ult:0,omit:0}),ag=Date.now();
      if(ag-x.ult<10000){x.omit++;return}
      omit=x.omit;x.omit=0;x.ult=ag;
    }
    const det={rota:m+' '+c,status:st,ms};
    if(omit)det.omitidas=omit;
    if(corpo)det.corpo=trunc(corpo,300);
    if(err)det.erro=trunc((err.name||'Erro')+(err.message?': '+err.message:''),120);
    const fim=j=>{
      if(j&&typeof j==='object'){if('ok' in j)det.ok=j.ok;if(j.erro)det.erroSrv=trunc(j.erro,160);if(j.flow)det.flow=j.flow}
      log(cardRota(c),'api',m+' '+c+' → '+(st||'sem resposta'),(ok&&det.ok!==false)?'ok':'falha',det,{ts});
    };
    if(r){try{r.clone().text().then(tx=>{let j=null;try{j=JSON.parse(tx)}catch(x){ /* ignorado: texto inválido: segue com o valor padrão */ }fim(j)},()=>fim(null))}catch(x){fim(null)}}else fim(null);
  }
  window.fetch=function(input,init){
    let url='',m='GET';
    try{url=typeof input==='string'?input:((input&&input.url)||'');m=String((init&&init.method)||(input&&input.method)||'GET').toUpperCase()}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }
    if(url.indexOf('/api/')<0||url.indexOf('/api/dev/')>=0)return F0(input,init);
    const t0=performance.now(),c=url.replace(/^https?:\/\/[^/]+/,'').replace(/\?.*$/,''),corpo=init&&typeof init.body==='string'?init.body:null,ts=Date.now();
    const p=F0(input,init);
    p.then(r=>{try{if(m!=='GET'||!r.ok)apiEvt(m,c,r.status,r.ok,Math.round(performance.now()-t0),corpo,r,null,ts)}catch(x){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }},
           er=>{try{apiEvt(m,c,0,false,Math.round(performance.now()-t0),corpo,null,er,ts)}catch(x){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }});
    return p;
  };

  /* ---- erros da própria página ---- */
  window.addEventListener('error',e=>log('app','erro','erro JS: '+trunc(e.message,200),'falha',{arq:trunc(e.filename||'',80),lin:e.lineno}));
  window.addEventListener('unhandledrejection',e=>log('app','erro','promessa rejeitada: '+trunc(e.reason&&e.reason.message||e.reason,200),'falha'));

  /* ---- publicação no Node-RED: lote de até 100, só avança o cursor com HTTP 2xx e ok:true; o flow descarta duplicados (sessao+n) ---- */
  async function publica(){
    if(pubBusy||!lib()||!$('obsEnvia').checked||srvChave()==='demoLocal')return; // Demo local: nada sai do navegador (o gerenciador recebe pelo canal local)
    const base=srvBase();if(!base)return;
    const pend=BUF.filter(e=>e.n>ENV_ATE);if(!pend.length)return;
    const lote=pend.slice(0,100);pubBusy=true;
    const ctl=new AbortController(),tm=setTimeout(()=>ctl.abort(),3000);
    try{
      const r=await F0(base+'/api/dev/log-evento',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({eventos:lote}),signal:ctl.signal});
      const j=await r.json().catch(()=>null);
      if(r.ok&&j&&j.ok===true){ENV_ATE=lote[lote.length-1].n;pubOk=true;flowVisto=j.flow||null;ultErro=''}
      else{pubOk=false;ultErro='HTTP '+r.status+(j&&j.erro?': '+j.erro:(r.status===404?' — a rota /api/dev/log-evento não existe: importe nodered/dev-logs-api-v1.0.json no Node-RED':''))}
    }catch(e){pubOk=false;ultErro=(e&&e.name==='AbortError')?'sem resposta em 3 s':String(e&&e.message||e)}
    finally{clearTimeout(tm);pubBusy=false}
  }

  /* ---- abrir o gerenciador (botão do popup Demo, ou automático ao finalizar o ensaio) ---- */
  function abreGerenciador(origem){
    if(!lib())return false;
    if(obsWin&&!obsWin.closed){try{obsWin.focus()}catch(e){ /* ignorado: elemento ausente ou sem suporte */ }return true}
    obsWin=window.open(((window.MENU_DEV&&MENU_DEV.arquivo('gerenciador'))||'gerenciador_logs_v1.6.html')+'?srv='+encodeURIComponent(srvBase()||'')+'&sessao='+SESSAO,'bt2_gerenciador_logs');
    if(!obsWin){
      log('DEV.DEM','sistema','o navegador bloqueou o pop-up do gerenciador ('+origem+')','aviso');
      msgGer('O navegador bloqueou a janela do Gerenciador de logs. Libere pop-ups para esta página, ou clique em "📋 Gerenciador de logs" no popup Demo.');
      return false;
    }
    log('DEV.DEM','sistema','gerenciador de logs aberto ('+origem+')','info');
    return true;
  }
  const bo=$('bDevObs');if(bo)bo.onclick=()=>abreGerenciador('botão');
  try{window.MENU_DEV&&MENU_DEV.monta($('menuDevHost'),{atual:'medidor'})}catch(e){ /* ignorado: ferramenta de diagnóstico/teste: a falha não afeta a operação */ }   // v1.10.109: monta o botão ☰ (escondido até o modo de testes ou ?dev=1)

  /* ---- texto de estado na caixa do popup Demo ---- */
  function infoObs(){
    const el=$('obsInfo');if(!el)return;
    const pend=BUF.filter(e=>e.n>ENV_ATE).length,srv=srvBase();
    const nr=!$('obsEnvia').checked?'envio ao Node-RED desligado':(srvChave()==='demoLocal'?'Demo local — nada sai do navegador (o gerenciador recebe pelo canal local)':!srv?'sem URL do Servidor — só o canal local (mesmo navegador)':(pubOk===null?(pend?'ainda não enviou':'nada a enviar'):(pubOk?'✓ recebendo (flow '+flowVisto+')':'✕ '+ultErro)));
    el.textContent=BUF.length+' eventos no navegador ('+DESCART+' descartados por limite) · '+pend+' aguardando envio · Node-RED: '+nr+(obsWin&&!obsWin.closed?' · gerenciador aberto':'');
  }
  setInterval(()=>{if($('dlgDemo').open)infoObs()},1000);

  window.devObs={sessao:SESSAO,log,snap,buf:()=>BUF.slice(),abre:abreGerenciador,publica,flowVisto:()=>flowVisto,publicou:()=>pubOk===true,erro:()=>ultErro,pendentes:()=>BUF.filter(e=>e.n>ENV_ATE).length,descartados:()=>DESCART};
  log('app','sistema','HTML iniciado','info',{versao:VERSAO,url:location.protocol+'//'+(location.host||'arquivo local'),ua:trunc(navigator.userAgent,90)});
  tick();setInterval(tick,300);setInterval(publica,1000);
})();
