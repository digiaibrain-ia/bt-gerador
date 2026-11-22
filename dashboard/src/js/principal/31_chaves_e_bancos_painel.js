/* ===== v1.9.36: POPUP DAS CHAVES — card 1: habilitar/desabilitar · card 2: Setup (kW real + resistência Ω, chave a chave, sem passos manuais) ===== */
(function(){
  const salvaDis=()=>{try{localStorage.setItem('medidor.chavesDes',JSON.stringify(DIS))}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }};
  const salvaReal=()=>{try{localStorage.setItem('medidor.chavesReal',JSON.stringify(KWR));localStorage.setItem('medidor.usarReal',USAR_REAL?'1':'0');localStorage.setItem('medidor.chavesRealT',JSON.stringify(KWRT));localStorage.setItem('medidor.chavesTens',JSON.stringify(TENS))}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }};
  const nomeCh=i=>{let k=0;for(const b of BANCOS){if(i<k+b.chaves.length)return b.nome.replace('Banco de ','')+' · Ch '+(i-k+1);k+=b.chaves.length}return 'Ch '+(i+1)};
  // v1.9.40: abas por banco - offset(bi) = índice global (em CH) da 1ª chave do banco bi
  const offsetBanco=bi=>{let k=0;for(let j=0;j<bi;j++)k+=BANCOS[j].chaves.length;return k};
  let BANCO_ATIVO=0;
  try{const v=+localStorage.getItem('medidor.chavesBanco');if(BANCOS[v])BANCO_ATIVO=v}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
  /* v1.9.42: Banco de Carga - comunicação real com o Node-RED (rotas /api/chaves/56/... do flow chaves-56-db150-v1.json,
     confirmadas em claude/REGISTRO_FLOW_CHAVES_BC56_DB150.md e no próprio JSON do flow). Fonte independente de ①/②/③
     (popup Demo) — só o Banco de 56 kW tem flow; o Banco de 400 kW (DB158) continua só no simulador local. */
  const CH_SRV={get fonte(){return srvUsaPlc()?'nodered':'mock'},set fonte(v){},get url(){return SRVM.url},set url(v){}}; // v1.9.66: derivados do modo e da URL única (SRVM); 'mock' só no Demo local
  window.CH_SRV=CH_SRV; // v1.9.57: CORREÇÃO — bancoDados()/render() (escopo global) usam CH_SRV desde a v1.9.53 e davam ReferenceError a cada ciclo ("servidor/rede fora"); mesmo objeto, só visível de fora agora
  let chErro='';
  // v1.9.43: o Node-RED do PLC (Chaves/DB150) é um servidor diferente do Node-RED do DSE (campo "URL" no topo) -
  // confirmado pelo operador em 20/10/2026 (flow "Chaves BC56 (DB150)" online no Node-RED do PLC, mas HTML dava
  // "Failed to fetch" porque chBase() reaproveitava a origem do campo #url, que é do DSE). Agora é um campo próprio,
  // salvo em localStorage, configurado no popup "⚙ Servidor" do Banco de Carga. Sem valor ainda -> para e avisa
  // (não inventa endereço de PLC).
  const chBase=()=>srvBase();
  // v1.9.63: os DOIS bancos têm flow no Node-RED (/api/chaves/56 e /api/chaves/400). DB de cada banco: PLANO_NUMERACAO_BLOCOS_PLC (BC56=DB150, BC400=DB158).
  const DB_BANCO=Object.fromEntries(BANCOS.map(b=>[b.id,b.db]));   // v1.10.156: vem de BANCOS (numeração v4: 3000/3100/3200/3300)
  /* v1.9.78: Setup por chaveamento. DB por tensão: BC56=DB152, BC400=DB160 (PLANO_NUMERACAO_BLOCOS_PLC.md: "reserva +2" do banco; a registrar na planilha). */
  const DB_TENS=Object.fromEntries(BANCOS.map(b=>[b.id,b.dbTens]));
  const TENS_V=[220,380,440];                // posição 0..2 = chaveamento 1..3
  const TENS_PLC={};                         // id do banco -> 'ok' | 'semdb' (DB por tensão sem leitura) | 'antigo' (flow v2.4, recurso inativo)
  // 'local' (Demo local) | 'ok' | 'semdb' | 'antigo' | undefined (1ª leitura do PLC ainda não veio)
  const tensFeat=id=>chPlcAtivo()?TENS_PLC[id]:'local';
  const tensAtiva=id=>(TENS[id]>=1&&TENS[id]<=3)?TENS[id]:0;
  const tensExige=id=>{const f=tensFeat(id);return f==='local'||f==='ok'||f==='semdb'};   // recurso ativo (o flow antigo/1ª leitura não bloqueia)
  const tensMsg=id=>tensFeat(id)==='semdb'?('DB'+DB_TENS[id]+' (Setup por chaveamento) sem leitura no PLC — baixe o DB'+DB_TENS[id]+' v0.2 e o FB100 v0.3 e confira o Node-RED.'):'Informe o chaveamento do banco (220 / 380 / 440 V) antes de selecionar uma chave.';
  // Demo local: monta KWR (visão do chaveamento ativo) a partir de KWRT. No modo PLC o KWR já vem espelhado pelo FB100.
  function tensAplicaLocal(id){
    const bi=BANCOS.findIndex(x=>x.id===id);if(bi<0)return;const off=offsetBanco(bi),c=tensAtiva(id);
    for(let i=0;i<BANCOS[bi].chaves.length;i++){const q=off+i,r=c&&KWRT[q]&&KWRT[q][c];
      if(r)KWR[q]={kw:r.kw,ohm:r.ohm,ohmTeo:null,data:r.data};else delete KWR[q]}
  }
  BANCOS.forEach(b=>{if(!(b.id in TENS))TENS[b.id]=0});
  try{BANCOS.forEach(b=>tensAplicaLocal(b.id))}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ } // v1.9.78: dados antigos do Demo local (sem chaveamento) não aparecem como se valessem para alguma tensão
  const bidAtivo=()=>BANCOS[BANCO_ATIVO].id;           // id do banco da aba ativa nos popups
  const bidDeCh=q=>BANCOS[CH[q].b].id;                  // id do banco a que pertence a chave global q
  const rotaCh=(id,s)=>'/api/chaves/'+rotaDe(id)+(s?'/'+s:'');  // rota SEMPRE por banco
  const chPlcAtivo=()=>CH_SRV.fonte==='nodered';
  const CH_POSTS=window.CH_POSTS={};                    // comandos (POST) enviados por esta tela, por banco — a janela de Logs compara com o total do log
  const CH_ERRO={};                                     // último erro de leitura por banco ('' = ok)
  const WD_VISTO={};                                    // v1.9.65: ts do último corte do vigia já noticiado, por banco
  class ErroCh extends Error{constructor(tipo,msg,status,flow){super(msg);this.tipo=tipo;this.status=status||0;this.flow=flow||null}}
  function chValida(m,okHttp,status,j){
    const msg=j&&typeof j==='object'?(j.erro||j.error):null;
    if(!okHttp)throw new ErroCh('http',`Node-RED respondeu HTTP ${status}${msg?': '+msg:''}`,status,j&&j.flow);
    if(j===null||typeof j!=='object')throw new ErroCh('resposta','a resposta do Node-RED não é um JSON válido');
    if(m==='POST'&&j.ok!==true)throw new ErroCh('recusa',msg?String(msg):'o Node-RED respondeu ok:false');
    return j;
  }
  let _postAtivos=0;const _postFila=[];
  function chPostVaga(){return new Promise(res=>{if(_postAtivos<3){_postAtivos++;res()}else _postFila.push(res)})}
  function chPostLibera(){const nx=_postFila.shift();if(nx)nx();else _postAtivos--} // passa a vaga direto ao próximo da fila (ordem preservada)
  async function chFetchRaw(m,p,b){
    if(!chBase())throw new ErroCh('semurl','informe a URL do Node-RED do PLC no botão Demo (campo Servidor)');
    if(m==='POST'){const mm=/^\/api\/chaves\/(\d+)\//.exec(p);if(mm)CH_POSTS[mm[1]]=(CH_POSTS[mm[1]]||0)+1}
    /* v1.10.117: FILA de POST de chave (máx. 3 simultâneos). POR QUÊ: a troca de etapa disparava até 26 POST juntos; o navegador só abre ~6 conexões por servidor,
       então o GET de leitura esperava na fila, estourava os 4 s e o banco aparecia "sem leitura". Com no máx. 3 POST, sempre sobra conexão para o GET. */
    let libera=null;
    if(m==='POST'){await chPostVaga();libera=chPostLibera}
    const tmo=m==='GET'?6000:10000,ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),tmo);
    try{
      let r,j=null;
      try{
        r=await fetch(chBase()+p,{method:m,cache:'no-store',signal:ctl.signal,headers:b!==undefined?{'Content-Type':'application/json'}:undefined,body:b!==undefined?JSON.stringify(b):undefined});
        LINK.chv.ok=true;LINK.chv.visto=true;LINK.chv.ts=Date.now();LINK.chv.http=r.status;LINK.chv.msg=''; // qualquer resposta HTTP (até 503) prova que o Node-RED está de pé
        try{j=await r.json()}catch(e){if(e&&e.name==='AbortError')throw e;j=null}
      }catch(e){
        const msg=e&&e.name==='AbortError'?`sem resposta do Node-RED em ${tmo/1000} s (timeout)`:'Node-RED fora do ar ou sem rede ('+(e&&e.message||'falha de conexão')+')';
        LINK.chv.ok=false;LINK.chv.ts=Date.now();LINK.chv.msg=msg;
        throw new ErroCh(e&&e.name==='AbortError'?'timeout':'rede',msg)}
      return chValida(m,r.ok,r.status,j);
    }finally{clearTimeout(t);if(libera)libera()}
  }
  // v1.9.64: todo POST de chave passa por aqui — falha vira ocorrência CHV-001 (card Cargas); o próximo POST que der certo no mesmo banco normaliza.
  async function chFetch(m,p,b){
    if(m!=='POST')return chFetchRaw(m,p,b);
    const mm=/^\/api\/chaves\/(\d+)\/([A-Za-z]+)/.exec(p),bid=mm?mm[1]:null;
    try{const r=await chFetchRaw(m,p,b);if(bid&&window.OCOR)window.OCOR.limpa('bco','CHV-001','BC'+bid);return r}
    catch(e){if(bid&&window.OCOR)window.OCOR.set('bco','CHV-001','BC'+bid+': comando "'+mm[2]+'" não executado — '+(e&&e.message?e.message:e),{ref:'BC'+bid,ev:true});throw e}
  }
  // v1.9.63: lê UM banco (GET /api/chaves/{id}); só mexe nos índices desse banco. Erro de um banco não derruba o outro.
  function bkDoPlc(id,j){ // v1.9.77: traduz o GET do flow v2.4 para BKS (null = sem sinal; 'semcom' = PLC sem comunicação com o ET200)
    const s=BKS[id];if(!s)return;
    if((window.BK_HOLD[id]||0)>Date.now())return; // comando "Ligar/Desligar banco" em andamento ou recém-confirmado: a leitura pode ser anterior a ele
    const sel=!('seletora' in j)?null:(j.seletora==='auto'||j.seletora==='manual')?j.seletora:'semcom';
    const lig=('bancoLigado' in j)?!!j.bancoLigado:false;
    if(s.sel===sel&&s.lig===lig)return;
    const antes=bkLiberado(id);
    s.sel=sel;s.lig=lig;
    for(const k in _ms)delete _ms[k];
    if(window.OCOR){ // v1.9.77: COM-005 = PLC sem comunicação com o ET200 (estado); CHV-005 = banco bloqueado pelo PLC com o banco antes liberado
      if(sel==='semcom')window.OCOR.set('modo','COM-005','BC'+id+': PLC sem comunicação com o ET200 (FB101 ComOk = FALSE) — banco desligado pelo PLC',{ref:'BC'+id});else window.OCOR.limpa('modo','COM-005','BC'+id);
      if(antes&&!bkLiberado(id))window.OCOR.set('bco','CHV-005','BC'+id+': banco bloqueado pelo PLC — '+bkMotivo(id),{ref:'BC'+id,ev:true});else if(bkLiberado(id))window.OCOR.limpa('bco','CHV-005','BC'+id);
    }
    if($('dlgChSetup').open){try{grade()}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }}
  }
  async function chAtualizaUm(id){
    const bi=BANCOS.findIndex(x=>x.id===id);if(bi<0)return;
    const off=offsetBanco(bi),n=BANCOS[bi].chaves.length,L=LINK.banco[id]=LINK.banco[id]||{};
    try{
      const j=await chFetch('GET',rotaCh(id));
      const hab=j.habilitada||[],cb=j.cbLigar,lg=j.ligada,sok=j.setupOk||[],kwr=j.kwReal||[],rm=j.rMedidoOhm||[],rt=j.rTeoricoOhm||[];
      for(let i=0;i<n;i++){
        const q=off+i;
        DIS[q]=hab[i]===false;
        if(Array.isArray(cb)&&!CH_PEND.has(q))CH_CMD[q]=!!cb[i]; // comando (cb.ligar)
        if(Array.isArray(lg))CH_LIG[q]=!!lg[i];                    // feedback real (sb.ligada)
        FALHA_RET[q]=!!(j.falhaRetorno&&j.falhaRetorno[i]);FALHA_COL[q]=!!(j.contatorColado&&j.contatorColado[i]); // v1.10.168
        if(sok[i]&&kwr[i]!=null)KWR[q]={kw:kwr[i],ohm:rm[i],ohmTeo:null,data:j.lidoEm?new Date(j.lidoEm).toLocaleDateString('pt-BR'):'—'}; // v1.9.78: sem R teórico
        else delete KWR[q];
      }
      // v1.10.168 (Fase 4, Portão A): falhas do PLC do banco, uma ocorrência por chave (some quando o PLC limpa a falha). Só com o campo (flow v3.5).
      if(window.OCOR&&Array.isArray(j.falhaRetorno)){
        for(let i=0;i<n;i++){const q=off+i,ref='BC'+id+'-'+(i+1);
          if(FALHA_RET[q])window.OCOR.set('bco','CHV-007',nomeCh(q)+' (BC'+id+'): sem retorno (SB) — o PLC derrubou o comando (CB) e travou a chave. Confira o contator/retorno e clique de novo para tentar.',{ref});else window.OCOR.limpa('bco','CHV-007',ref);
          if(FALHA_COL[q])window.OCOR.set('bco','CHV-008',nomeCh(q)+' (BC'+id+'): contator colado — retorno ativo sem comando. O PLC bloqueou a chave; verifique no campo antes de ligar.',{ref});else window.OCOR.limpa('bco','CHV-008',ref);
        }
      }
      // v1.9.78: chaveamento (flow v2.5). Sem o campo = flow antigo (recurso inativo); tensaoSel:null = DB por tensão sem leitura no PLC.
      if(!('tensaoSel' in j))TENS_PLC[id]='antigo';
      else if(j.tensaoSel==null||!j.porTensao)TENS_PLC[id]='semdb';
      else{
        TENS_PLC[id]='ok';TENS[id]=j.tensaoSel|0;
        TENS_V.forEach((v,c)=>{const pt_=j.porTensao[String(v)];if(!pt_)return;
          for(let i=0;i<n;i++){const q=off+i;KWRT[q]=KWRT[q]||{};
            if(pt_.setupOk&&pt_.setupOk[i]&&pt_.kwReal&&pt_.kwReal[i]!=null)KWRT[q][c+1]={kw:pt_.kwReal[i],ohm:pt_.rMedidoOhm?pt_.rMedidoOhm[i]:null,vmed:pt_.vMedidaV?pt_.vMedidaV[i]:null,data:'—'};
            else delete KWRT[q][c+1]}});
      }
      if(BANCO_ATIVO===bi){ // seleção e "usar kW real" são por banco: só a aba ativa dos popups manda na tela
        CH_SELPLC=j.chaveSel>0?off+(j.chaveSel-1):null;SEL=j.chaveSel>0?off+(j.chaveSel-1):null;USAR_REAL=!!j.usarKwReal;
      }
      // v1.9.77: seletora física e "Ligar banco" (flow v2.4). Sem o campo (flow antigo) a regra fica INATIVA ("sem sinal").
      bkDoPlc(id,j);
      // v1.9.65: o vigia do flow v2.3 informa o último corte ({ts,qtd}); avisa 1x por corte, e só se for recente (<= 10 min)
      if(j.wdZerou&&j.wdZerou.ts&&window.OCOR){
        const tz=Date.parse(j.wdZerou.ts);
        if(tz&&WD_VISTO[id]!==tz){WD_VISTO[id]=tz;
          if(Date.now()-tz<600000)window.OCOR.set('bco','CHV-004','BC'+id+': o Node-RED zerou '+(j.wdZerou.qtd||'?')+' chave(s) comandada(s) às '+new Date(tz).toLocaleTimeString('pt-BR')+' porque nenhuma tela consultou o PLC (vigia de segurança). Se precisar, comande de novo.',{ref:'BC'+id,tipo:'msg',expira:180000})}
      }
      L.ok=true;L.visto=true;L.ts=Date.now();L.flow=j.flow||null;L.idadeMs=j.idadeMs==null?null:Number(j.idadeMs);L.erro='';L.status=200;
      CH_ERRO[id]='';
    }catch(e){
      const msg=e instanceof ErroCh?e.message:String(e);
      L.ok=false;L.ts=Date.now();L.erro=msg;L.status=(e&&e.status)||0;L.flow=(e&&e.flow)||L.flow||null;
      CH_ERRO[id]=msg;
    }
  }
  let _pollN=0;
  async function chAtualizaDoPlc(silencioso){ // lê os dois bancos em paralelo (cada GET responde do cache do flow v2.2: não pesa no PLC)
    if(CH_SRV.fonte!=='nodered')return;
    _pollN=(_pollN+1)%3;   // v1.10.212: banco fora de uso e lido a cada 3 s (continua sob vigia; a leitura nao fica velha: o limite e 5 s)
    await Promise.all(BANCOS_PLC.filter(b=>_pollN===0||!window.bancoEmUso||window.bancoEmUso(b.id)).map(b=>chAtualizaUm(b.id)));
    await chZeraPendentes(); // v1.9.66: entrou em modo com PLC: desliga o que a primeira leitura mostrou ligado
    salvaDis();salvaReal();
    chErro=CH_ERRO[bidAtivo()]||'';
    chAtualizaChip();
    if(!silencioso){grade();resumo();renderTabs();live()}
  }
  window.chAtualizaDoPlc=chAtualizaDoPlc; // v1.9.57: usada pelo timer global pollPlcPrincipal() (tela principal)
  function chAtualizaChip(){
    const c=$('chSrvChip');if(!c)return;
    if(CH_SRV.fonte!=='nodered'){c.textContent='Demo local: nada vai ao PLC';c.className='enschip mock';return}
    if(!chBase()){c.textContent='PLC: informe a URL no botão Demo';c.className='enschip err';return}
    const id=bidAtivo(),L=LINK.banco[id]||{},rot='PLC BC'+id;
    if(chErro){c.textContent=rot+': '+chErro;c.className='enschip err';return}
    if(!L.ok){c.textContent=rot+': aguardando a 1ª leitura…';c.className='enschip mock';return}
    if(L.flow==null){c.textContent=rot+': OK · flow ANTIGO — importe a v2.4';c.className='enschip mock';return}
    if(L.flow==='chaves-v2.4'){c.textContent=rot+': OK · flow v2.4 sem chaveamento 220/380/440 — importe a v2.5';c.className='enschip mock';return}
    if(L.flow!=='chaves-v2.5'){c.textContent=rot+': OK · flow '+L.flow+' sem seletora/Ligar banco — importe a v2.5';c.className='enschip mock';return}
    if(TENS_PLC[id]==='semdb'){c.textContent=rot+': OK · DB'+DB_TENS[id]+' (por chaveamento) sem leitura';c.className='enschip err';return}
    c.textContent=rot+': OK';c.className='enschip ok';
  }
  /* v1.9.66: CONDIÇÃO SEGURA a cada troca de modo (real / Demo local / Demo + PLC) e no desligamento automático do Demo.
     Fecha janelas, desmarca o Setup (e avisa o PLC), desliga as chaves locais e — se o PLC estava em uso — desliga no PLC todo cbLigar que a tela conhece.
     Entrando em modo com PLC, o desligamento é feito logo depois da PRIMEIRA leitura (só então se sabe o que está ligado). */
  const zerarPend={};
  /* v1.10.228 (Passo 5, B1): a falha ao desligar/zerar no PLC NÃO fica mais só no CHV-001 (que some quando qualquer outro POST do mesmo banco dá certo).
     Aqui se guarda o que NÃO foi confirmado por banco e se abre o Alerta CHV-009, que só sai quando um desligamento do mesmo banco der certo por inteiro.
     Não bloqueia nada e não muda o comando enviado: só avisa o operador (a proteção real continua no PLC). */
  function chAvisaZeroNaoConfirmado(tentou,falhas){
    if(!window.OCOR)return;
    tentou.forEach(bid=>{
      if(falhas[bid])window.OCOR.set('bco','CHV-009','BC'+bid+': ao voltar ao estado seguro NÃO consegui desligar no PLC — '+falhas[bid].join('; ')+'. Confira na bancada e tente de novo.',{ref:'BC'+bid,ev:true});
      else window.OCOR.limpa('bco','CHV-009','BC'+bid);
    });
  }
  async function chZeraPlc(selAntigo,soBid){
    const bids=new Set(),tentou=new Set(),falhas={};
    const falhou=(bid,o,e)=>{(falhas[bid]=falhas[bid]||[]).push(o+(e&&e.message?' ('+e.message+')':''))};
    if(selAntigo!=null)bids.add(bidDeCh(selAntigo));
    if(CH_SELPLC!=null)bids.add(bidDeCh(CH_SELPLC));
    for(const bid of bids){if(soBid&&bid!==soBid)continue;tentou.add(bid);try{await chFetch('POST',rotaCh(bid,'selecionar'),{indice:0})}catch(e){falhou(bid,'seleção da chave não foi zerada',e)}}
    for(let q=0;q<CH.length;q++){
      if(!CH_CMD[q])continue;const bid=bidDeCh(q);if(soBid&&bid!==soBid)continue;
      tentou.add(bid);
      try{await chFetch('POST',rotaCh(bid,'ligar'),{indice:q-offsetBanco(CH[q].b)+1,ligar:false});CH_CMD[q]=false}catch(e){falhou(bid,nomeCh(q)+' continua comandada',e)}
    }
    chAvisaZeroNaoConfirmado(tentou,falhas);
  }
  async function chZeraPendentes(){
    for(const b of BANCOS_PLC){if(!zerarPend[b.id]||!LINK.bancoOk(b.id))continue;delete zerarPend[b.id];await chZeraPlc(null,b.id)}
  }
  window.chModoSeguro=async function(o){
    o=o||{};
    document.querySelectorAll('dialog[open]').forEach(d=>{if(o.manterDemo&&d.id==='dlgDemo')return;try{d.close()}catch(e){ /* ignorado: diálogo/seletor já fechado, cancelado ou sem permissão */ }});
    const selAntigo=SEL;SEL=null;BASE=null;BASE_OK=false;liga(null);CH_PEND.clear();
    // v1.9.75: troca de modo volta ao estado seguro. Fora do Demo local (real ou Demo+PLC) o sinal da seletora ainda não existe
    // no PLC -> regra INATIVA ("sem sinal"), como antes. No Demo local a seletora passa a nascer em Manual (bloqueado), como a
    // seletora física de verdade - o operador precisa girar pra Auto e acionar "Ligar banco" antes de operar as chaves.
    BANCOS.forEach(b=>{if(o.serPlc){BKS[b.id].sel=null;BKS[b.id].lig=false}else{BKS[b.id].sel='auto';BKS[b.id].lig=true}}); // v1.9.76: Demo local nasce em AUTO e com o banco LIGADO (pedido do operador); dá para girar pra Manual e testar o bloqueio
    for(const k in _ms)delete _ms[k];
    const st=$('stTxt');if(st)st.textContent='';
    if(o.serPlc&&!o.eraPlc)BANCOS.forEach(b=>{zerarPend[b.id]=true});else if(!o.serPlc)Object.keys(zerarPend).forEach(k=>delete zerarPend[k]);
    if(o.eraPlc&&chBase()){try{await chZeraPlc(selAntigo)}catch(e){/* chZeraPlc já trata cada POST e abre o CHV-009; aqui só um erro inesperado de programação */}}
    else CH_CMD.fill(false);
    try{grade();resumo();renderTabs();live()}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }
    try{drawBanco(bancoDados(window.__ultimoDado||{}))}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }
    if(o.serPlc)chAtualizaDoPlc();
    chAtualizaChip();
  };

  // v1.9.43: duas abas de banco agora (uma em cada popup, dlgChHD e dlgChSetup) - [data-chtabs] em vez do id único #chTabs
  function renderTabs(){
    const html=BANCOS.map((b,bi)=>{
      const off=offsetBanco(bi),qtd=b.chaves.length,nomT=b.chaves.reduce((a,x)=>a+x,0);
      let realT=0,nSetup=0;for(let q=off;q<off+qtd;q++)if(KWR[q]){realT+=KWR[q].kw;nSetup++}
      return `<button type="button" data-bi="${bi}" class="${bi===BANCO_ATIVO?'on':''}"><b>${esc(b.nome)}</b><small>${fmtKw(nomT)} kW nominal${nSetup?' · '+nSetup+'/'+qtd+' com Setup':''}</small></button>`;
    }).join('');
    document.querySelectorAll('[data-chtabs]').forEach(el=>el.innerHTML=html);
  }
  document.querySelectorAll('[data-chtabs]').forEach(el=>el.addEventListener('click',e=>{
    const b=e.target.closest('button[data-bi]');if(!b)return;
    const bi=+b.dataset.bi;if(bi===BANCO_ATIVO)return;
    // v1.9.44: a pedido do operador, troca de banco agora é BLOQUEADA (não mais cancelada em silêncio)
    // se tiver uma chave selecionada/ligada pra calibração no banco atual.
    if(SEL!=null){alert('Tem a '+nomeCh(SEL)+' selecionada/ligada para calibração. Clique nela de novo para desligar antes de trocar de banco.');return}
    BANCO_ATIVO=bi;try{localStorage.setItem('medidor.chavesBanco',BANCO_ATIVO)}catch(x){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
    renderTabs();grade();resumo();live();chAtualizaChip();
    if(chPlcAtivo())chAtualizaDoPlc();
  }));
  let SEL=null; // chave em calibração (índice global em CH) ou null
  let BASE=null,BASE_OK=false; // v1.9.36: "kW sem carga" — média móvel contínua enquanto gerador operando e NENHUMA chave ligada; não precisa de passo manual
  const genOn=()=>GEN.estado==='operando'&&!($('demo').checked&&SIM.gen!=='operando'); // v1.9.71: no Demo, gerador desacelerando (parando/partindo) NÃO conta como operando — o painel ainda mostra OPERANDO por ~10 s depois do STOP
  function aplicaDis(){
    for(let i=0;i<CH.length;i++)if(DIS[i])SIM.ch[i]=0;
    for(const k in _ms)delete _ms[k];
    SIM.refill=true;bancoSig='';
    try{drawBanco($('demo').checked?bancoSim():null)}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }
  }
  // v1.9.41: selo "real" sem a palavra "real" repetida (fica só a legenda única no topo do popup) - selo verde transparente
  const tile=(q,kw,extra,inner)=>`<div class="tile${DIS[q]?' dis':''}${KWR[q]?' real':''}${extra||''}" title="${nomeCh(q)}${KWR[q]?' · kW real '+fmtKw(KWR[q].kw)+' (Setup '+KWR[q].data+')':''}">${inner}${fmtKw(kw)} kW${KWR[q]?`<span class="realval"><b>${fmtKw(KWR[q].kw)}</b> <small>kW</small></span>`:''}</div>`;
  // v1.9.41: card 1 em lista vertical "Chave 1, Chave 2..." (em vez de grade de tiles) - sobra espaço horizontal pro card 2
  const rowChave=(q,kw,i)=>`<label class="chrow${DIS[q]?' dis':''}${KWR[q]?' real':''}" title="${nomeCh(q)}${KWR[q]?' · kW real '+fmtKw(KWR[q].kw)+' (Setup '+KWR[q].data+')':''}">
    <input type="checkbox" data-i="${q}" ${DIS[q]?'':'checked'} aria-label="Habilitar Chave ${i+1}">
    <span class="chrowtxt">Chave ${i+1}</span>
    <span class="chrowkw">${KWR[q]?`<span class="realval"><b>${fmtKw(KWR[q].kw)}</b> kW</span> `:''}${fmtKw(kw)} kW</span>
  </label>`;
  function grade(){
    const b=BANCOS[BANCO_ATIVO],off=offsetBanco(BANCO_ATIVO),id=bidAtivo(),bancoBloq=!bkLiberado(id); // v1.9.75
    $('chGrade').innerHTML=b.chaves.map((kw,i)=>rowChave(off+i,kw,i)).join('');
    $('chSel').innerHTML='<div class="sw">'+b.chaves.map((kw,i)=>{const q=off+i,bloq=DIS[q]||(SEL!=null&&SEL!==q)||(bancoBloq&&SEL!==q);
      return tile(q,kw,(SEL===q?' sel':'')+(bloq?' bloq':''),'')}).join('')+'</div>';
    $('chUsaReal').checked=USAR_REAL;
    const n=DIS.slice(off,off+b.chaves.length).filter(Boolean).length;
    $('chNota').textContent=(bancoBloq?bkMotivo(id)+' ':'') // v1.9.75: mesma regra da seletora/"Ligar banco" do card Cargas vale aqui
      +(n?`${n} chave(s) desabilitada(s) neste banco. `:'Todas habilitadas neste banco. ')
      +(chPlcAtivo()?'Vão de verdade pro PLC (DB'+DB_BANCO[bidAtivo()]+') a cada clique.':'Valem na tela e no Demo; ainda não vão ao PLC (sem modo PLC ativo).');
  }
  const f1=x=>x==null||isNaN(x)?'—':pt(x,1);
  function tensRenderBase(){ // v1.9.78: seletor 220/380/440 V do popup Setup (v1.10.172: tensRender() embrulha este)
    const id=bidAtivo(),f=tensFeat(id),c=tensAtiva(id),seg=$('stTensSeg'),chip=$('stTensChip');if(!seg||!chip)return;
    const inativo=!(f==='local'||f==='ok');
    seg.querySelectorAll('button').forEach((b,k)=>{b.classList.toggle('on',c===k+1);const nao=!bancoAtende(bancoPorId(id),TENS_V[k]);b.disabled=inativo||SEL!=null||nao;   // v1.10.108: ficha do banco
      b.title=nao?('Este banco não tem chaveamento '+TENS_V[k]+' V (ficha do banco: '+bancoTensoes(bancoPorId(id)).join(' / ')+' V).'):inativo?(f==='semdb'?tensMsg(id):'Disponível com o flow v2.5 (modo PLC) ou no Demo local.'):(SEL!=null?'Desmarque a chave antes de mudar o chaveamento.':c===k+1?'Clique de novo para DESLIGAR o chaveamento (volta para não informado).':'Informar chaveamento '+TENS_V[k]+' V')});
    if(f==='antigo'||f===undefined){chip.textContent=f==='antigo'?'flow v2.4: Setup sem chaveamento':'aguardando o PLC…';chip.className='enschip mock'}
    else if(f==='semdb'){chip.textContent='DB'+DB_TENS[id]+' sem leitura';chip.className='enschip err'}
    else if(c&&!bancoAtende(bancoPorId(id),TENS_V[c-1])){chip.textContent='Chaveamento '+TENS_V[c-1]+' V NÃO existe neste banco ('+bancoTensoes(bancoPorId(id)).join(' / ')+' V) — escolha outro';chip.className='enschip err'}
    else if(!c){const cd=tensDados();chip.textContent='NÃO INFORMADO — '+(cd?'Dados do ensaio indica '+TENS_V[cd-1]+' V; ':'')+'escolha o chaveamento para liberar as chaves';chip.className='enschip err'}
    else{const cd=tensDados();chip.textContent='Chaveamento ativo: '+TENS_V[c-1]+' V'+(f==='ok'?' (PLC)':' (Demo local)')+(cd&&cd!==c?' · ATENÇÃO: Dados do ensaio indica '+TENS_V[cd-1]+' V':'');chip.className=(cd&&cd!==c)?'enschip err':'enschip ok'}
  }
  /* v1.10.172: chaveamento do Setup vem dos DADOS DO ENSAIO (somente leitura) */
  const tensVDados=()=>{ // tensão do gerador: no PLC só vale a dos Dados do ensaio JÁ CONFIRMADOS (o valor padrão do formulário não conta); no Demo local, a digitada
    const v=(tensFeat(bidAtivo())==='ok')?(dadosConfirmados()?+DADOS.tensao:0):NUM(($('dTens')||{}).value);
    return (v>0&&!isNaN(v))?v:0};
  function tensRender(){
    tensRenderBase();
    const id=bidAtivo(),f=tensFeat(id),seg=$('stTensSeg'),chip=$('stTensChip');if(!seg||!chip)return;
    seg.querySelectorAll('button').forEach(b=>{b.disabled=true;b.title='Definido pela tensão do gerador nos Dados do ensaio (somente leitura)'});
    if(!(f==='local'||f==='ok'))return;                    // 'antigo'/'semdb'/sem leitura: mantém os avisos do render base
    const c=tensAtiva(id),vd=tensVDados(),cd=TENS_V.indexOf(vd)+1;
    if(vd&&!cd){chip.textContent='Gerador em '+vd+' V (Dados do ensaio) — sem chaveamento 220/380/440 correspondente: só sinalização. O Setup não grava sem chaveamento (a definir com o operador).';chip.className='enschip err';return}
    if(!c&&!vd){chip.textContent='NÃO INFORMADO — '+(f==='ok'&&!dadosConfirmados()?'confirme os Dados do ensaio (a tensão do gerador define o chaveamento)':'informe a tensão do gerador nos Dados do ensaio (ela define o chaveamento)');chip.className='enschip err';return}
    if(c&&cd&&c!==cd&&SEL!=null){chip.textContent+=' — desmarque a chave para atualizar o chaveamento';return}
    if(cd&&c===cd&&f==='ok')chip.textContent='Chaveamento ativo: '+vd+' V (PLC) · definido pela tensão do gerador nos Dados do ensaio';
  }
  const tensAutoUlt={};   // id do banco -> {v,t,busy}: evita repetir em laço o mesmo valor
  async function tensAuto(){
    if(!$('dlgChSetup').open)return;
    const id=bidAtivo(),f=tensFeat(id),vd=tensVDados(),cd=TENS_V.indexOf(vd)+1;
    if(!(f==='local'||f==='ok')||!cd||SEL!=null||tensAtiva(id)===cd||!bancoAtende(bancoPorId(id),vd))return;
    const u=tensAutoUlt[id]||{};if(u.busy||(u.v===vd&&Date.now()-u.t<10000))return;
    tensAutoUlt[id]={v:vd,t:Date.now(),busy:true};
    try{await tensSet(vd)}finally{tensAutoUlt[id].busy=false}
  }
  setInterval(()=>{try{tensAuto()}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }},2000);
  async function tensSet(v){
    const id=bidAtivo(),f=tensFeat(id),st=$('stTxt');
    if(SEL!=null){st.textContent='Desmarque a chave antes de mudar o chaveamento.';return}
    if(v&&tensAtiva(id)===TENS_V.indexOf(v)+1)v=0;   // v1.10.121: clicar na tensão ativa DESLIGA (volta para "não informado")
    const c=v?TENS_V.indexOf(v)+1:0;
    if(v&&!bancoAtende(bancoPorId(id),v)){st.textContent='Este banco não tem chaveamento '+v+' V.';return}   // v1.10.108
    if(f==='local'){TENS[id]=c;tensAplicaLocal(id);salvaReal();st.textContent=v?'Chaveamento '+v+' V (Demo local, guardado no navegador).':'Chaveamento desligado (não informado).';grade();resumo();renderTabs();live();return}
    if(f!=='ok'){st.textContent=f==='semdb'?tensMsg(id):'Chaveamento exige o flow v2.5 no Node-RED.';return}
    st.textContent=v?'Informando '+v+' V ao PLC (DB'+DB_TENS[id]+')…':'Desligando o chaveamento no PLC (DB'+DB_TENS[id]+')…';
    try{await chFetch('POST',rotaCh(id,'tensao'),{tensao:v});chErro='';await chAtualizaDoPlc();st.textContent=v?'Chaveamento '+v+' V informado e confirmado pelo PLC (DB'+DB_TENS[id]+').':'Chaveamento desligado e confirmado pelo PLC (DB'+DB_TENS[id]+').'}
    catch(err){chErro=err instanceof ErroCh?err.message:String(err);st.textContent='PLC não aceitou o chaveamento: '+chErro+(v===0?' — desligar exige o flow v2.6 (aceita tensao 0).':'')}
    chAtualizaChip();live();
  }
  $('stTensSeg').addEventListener('click',e=>{const b=e.target.closest('button[data-tv]');if(b&&!b.disabled)tensSet(+b.dataset.tv)});
  /* v1.10.123: SINALIZA o chaveamento pela tensão do "Dados do ensaio" (dTens, vinda do modelo de gerador escolhido).
     POR QUÊ: pedido do operador — o modelo já traz 220/380/440; ao abrir o Setup o chaveamento deve aparecer sinalizado.
     SÓ NO DEMO LOCAL marca sozinho (nada vai ao PLC). No modo PLC não escreve a tensão: só mostra a dica no chip (decisão de gravar fica para o DSE real). */
  const tensDados=()=>{const v=NUM(($('dTens')||{}).value);return TENS_V.indexOf(v)+1}   // 0 = sem tensão válida nos Dados
  new MutationObserver(()=>{
    if(!$('dlgChSetup').open)return;
    tensAuto();   // v1.10.172: informa o chaveamento sozinho (PLC: só com Dados confirmados; Demo local: como antes)
    tensRender();
  }).observe($('dlgChSetup'),{attributes:true,attributeFilter:['open']});
  const todasChavesOff=()=>CH.every((c,q)=>DIS[q]||!SIM.ch[q]);
  function live(){
    if($('dlgChSetup').open){
      // v1.9.55: segurança — se o gerador parar (real ou demo) com uma chave selecionada no Setup, desmarca sozinho (evita travar os cliques)
      if(SEL!=null&&!genOn()){
        const selAntigo=SEL;SEL=null;liga(null);grade(); // v1.9.70: redesenha os quadrados (antes o azul SELECIONADA ficava)
        // v1.10.228: a falha já vira CHV-001 dentro de chFetch; aqui só se avisa no texto do Setup que o PLC não confirmou
        if(chPlcAtivo())chFetch('POST',rotaCh(bidDeCh(selAntigo),'selecionar'),{indice:0}).catch(()=>{const s2=$('stTxt');if(s2)s2.textContent+=' O PLC NÃO confirmou a desmarcação (veja CHV-001).'});
        const st=$('stTxt');if(st)st.textContent='Chave '+nomeCh(selAntigo)+' desmarcada automaticamente (gerador parado).';
      }
      if(!genOn()&&BASE_OK){BASE=null;BASE_OK=false} // v1.9.70: gerador parado invalida o "kW sem carga" (valor velho não vale para a próxima calibração)
      tensRender();
      const gd=$('stGenDemo');gd.hidden=!$('demo').checked;
      if(!gd.hidden)gd.textContent=(SIM.gen==='operando'||SIM.gen==='partindo')?'Desligar gerador (Demo)':'Ligar gerador (Demo)';
      const ce=$('stGenEst');ce.textContent='Gerador: '+(GEN.estado==='—'?'sem dado':GEN.estado.toUpperCase());ce.className='enschip'+(genOn()?' ok':' err');
      // v1.9.36: baseline "kW sem carga" — atualiza sozinha (média móvel leve) sempre que: gerador operando, leitura válida e NENHUMA chave ligada
      const be=$('stBaseEst');
      if(genOn()&&dadoOk&&MED.kw!=null&&todasChavesOff()){BASE=BASE==null?MED.kw:BASE*0.8+MED.kw*0.2;BASE_OK=true}
      be.textContent=BASE_OK?'kW sem carga: '+pt(BASE,2)+' kW':'kW sem carga: aguardando (gerador ligado e TODAS as chaves desligadas)';
      be.className='enschip'+(BASE_OK?' ok':' mock');
      const T_=[['kW','kw',MED.kw,1],['Carga %','percCarga',carga,1],['Va (V)','tensaoL1L2',MED.va,1],['Vb (V)','tensaoL2L3',MED.vb,1],['Vc (V)','tensaoL3L1',MED.vc,1],
        ['Ia (A)','correnteL1',MED.ia,0],['Ib (A)','correnteL2',MED.ib,0],['Ic (A)','correnteL3',MED.ic,0],['RPM','rpm',MED.rpm,0]];
      $('stLive').innerHTML=T_.map(([n,tag,v,d])=>`<div><small>${n} · tag ${tag}</small><b>${v==null?'—':pt(v,d)}</b></div>`).join('');
      const i=SEL,nom=i==null?null:CH[i].kw;
      const bx=(t,v,c)=>`<div class="box${c?' '+c:''}"><small>${t}</small>${v}</div>`;
      // v1.9.46: fórmula animada (kW com chave - kW sem carga = kW real)
      const fDiv=$('stFormula');
      if(i==null||!BASE_OK){ // v1.9.62: fórmula SEMPRE visível (com "—" até selecionar uma chave e ter o kW sem carga)
        $('fKwChave').textContent='—';$('fKwBase').textContent=BASE_OK?pt(BASE,1):'—';$('fKwReal').textContent='—';
        fDiv.style.display='block';
      }else{
        const real=(MED.kw!=null)?MED.kw-BASE:null;
        $('fKwChave').textContent=MED.kw==null?'—':pt(MED.kw,1);
        $('fKwBase').textContent=pt(BASE,1);
        $('fKwReal').textContent=real==null?'—':pt(real,1);
        fDiv.style.display='block';
      }
      // v1.9.46: botão "Limpar esta chave" - só aparece se tem Setup salvo
      const limpaBtn=$('stLimpa');
      if(i==null||!KWR[i]){
        limpaBtn.style.display='none';
      }else{
        limpaBtn.style.display='inline-block';
      }
      // v1.9.47: resistências animadas (R medido e R teórico com valores ao vivo)
      // v1.9.48: R teórico usa V nominal (do campo "Dados do ensaio" - dTens) em vez de V ao vivo
      const rDiv=$('stResistencias');
      if(i==null||!BASE_OK){ // v1.9.62: resistências também sempre visíveis
        ['fRmedV','fRmedKw','fRmedRes','fRteoV','fRteoKw','fRteoReal','fRteoRes'].forEach(id=>{$(id).textContent='—'});
        rDiv.style.display='block';
      }else{
        const real=(MED.kw!=null)?MED.kw-BASE:null;
        const vMed=(MED.va!=null&&MED.vb!=null&&MED.vc!=null)?(MED.va+MED.vb+MED.vc)/3:null;
        const rMed=(real!=null&&real>0.05&&vMed!=null)?(vMed*vMed)/(real*1000):null;
        const vref=(real!=null&&real>0.05&&vMed!=null&&nom)?vMed*Math.sqrt(nom/real):null; // v1.9.78: V ref. estimada = V medida × √(kW placa ÷ kW real)
        $('fRmedV').textContent=vMed==null?'—':pt(vMed,1);
        $('fRmedKw').textContent=real==null?'—':pt(real,1);
        $('fRmedRes').textContent=rMed==null?'—':pt(rMed,2);
        $('fRteoV').textContent=vMed==null?'—':pt(vMed,1);
        $('fRteoKw').textContent=nom==null?'—':fmtKw(nom);
        $('fRteoReal').textContent=real==null?'—':pt(real,1);
        $('fRteoRes').textContent=vref==null?'—':pt(vref,0);
        rDiv.style.display='block';
      }
      if(chPlcAtivo()){
        // v1.9.42: modo PLC real - o kW real/resistência quem calcula e grava é o próprio FB100 (tem sua própria
        // leitura/baseline "kW sem carga"), não a conta local (MED.kw-BASE) daqui. Não finjo saber esse número
        // antes do PLC confirmar - só mostro o que o GET /api/chaves/56 trouxe de volta (ver chAtualizaDoPlc/resumo()).
        $('stForm').innerHTML=i==null?'<i class="jnota">Clique numa chave acima para selecionar no PLC.</i>'
          :bx('Chave selecionada',nomeCh(i))+'<span class="op">→</span>'+bx('kW nominal',fmtKw(nom)+' kW')+'<span class="op">→</span>'+bx('Setup',KWR[i]?('kW real '+fmtKw(KWR[i].kw)+' kW (salvo)'):'aguardando "Salvar esta chave"','res');
        $('stSalva').disabled=i==null;
      }else{
        const real=(i!=null&&BASE_OK&&MED.kw!=null)?MED.kw-BASE:null;
        const vMed=(MED.va!=null&&MED.vb!=null&&MED.vc!=null)?(MED.va+MED.vb+MED.vc)/3:null; // tensão média das 3 fases (tags tensaoL1L2/L2L3/L3L1)
        const ohm=(real!=null&&real>0.05&&vMed!=null)?(vMed*vMed)/(real*1000):null; // R = V²/P (P em W) — v1.9.36 a pedido do operador
        const vref=(real!=null&&real>0.05&&vMed!=null&&nom)?vMed*Math.sqrt(nom/real):null; // v1.9.78: V ref. estimada (substitui o R teórico)
        $('stForm').innerHTML=i==null?'<i class="jnota">Clique numa chave acima para calibrar.</i>'
          :bx('kW com a chave (tag kw)',f1(MED.kw)+' kW')+'<span class="op">−</span>'+bx('kW sem carga (base)',f1(BASE)+' kW')+'<span class="op">=</span>'
          +bx('kW real · '+nomeCh(i),f1(real)+' kW','res')+bx('R medido (V²/P)',ohm==null?'—':pt(ohm,2)+' Ω','res')+bx('V ref. estimada',vref==null?'—':pt(vref,0)+' V')+bx('nominal',fmtKw(nom)+' kW')+bx('desvio',real==null?'—':((real-nom)/nom*100>=0?'+':'')+pt((real-nom)/nom*100,1)+' %');
        $('stSalva').disabled=i==null||real==null||!BASE_OK;
      }
    }
  }
  // v1.9.78: comparação por chaveamento — a resistência (Ω) deveria ser igual nas 3 tensões; V ref. est. deveria ser a mesma em todas as chaves/tensões
  function tabelaPorTensao(bi,off,qtd){
    const id=BANCOS[bi].id;if(!tensExige(id))return '';
    let temAlgum=false,linhas='';
    for(let i=0;i<qtd;i++){const q=off+i,m=KWRT[q]||{};if(!(m[1]||m[2]||m[3]))continue;temAlgum=true;
      const cel=c=>m[c]?`<td>${fmtKw(m[c].kw)}</td><td>${m[c].ohm==null?'—':pt(m[c].ohm,2)}</td><td>${m[c].vmed&&m[c].kw>0.05?pt(m[c].vmed*Math.sqrt(CH[q].kw/m[c].kw),0):'—'}</td>`:'<td>—</td><td>—</td><td>—</td>';
      const oh=[1,2,3].map(c=>m[c]&&m[c].ohm).filter(x=>x>0),dv=oh.length>1?(Math.max(...oh)-Math.min(...oh))/(oh.reduce((a,b)=>a+b,0)/oh.length)*100:null;
      linhas+=`<tr><td>${nomeCh(q)}</td><td>${fmtKw(CH[q].kw)}</td>${cel(1)}${cel(2)}${cel(3)}<td>${dv==null?'—':pt(dv,1)+' %'}</td></tr>`}
    if(!temAlgum)return '<p class="jnota">Comparação por chaveamento: nenhuma chave com Setup salvo ainda em nenhuma tensão.</p>';
    return '<table class="ent"><tr><th rowspan="2">Chave</th><th rowspan="2">Nominal (kW)</th><th colspan="3">220 V</th><th colspan="3">380 V</th><th colspan="3">440 V</th><th rowspan="2">Variação de R</th></tr><tr>'+'<th>kW real</th><th>R (Ω)</th><th>V ref. est.</th>'.repeat(3)+'</tr>'+linhas+'<tr><th colspan="12">Se a resistência está certa, a "Variação de R" fica perto de 0 % e a "V ref. est." é parecida entre as chaves e as tensões — esse valor é a tensão em que a identificação em kW da placa foi dada (a descobrir na prática).</th></tr></table>';
  }
  function resumo(){ // v1.9.40: só o banco ativo (aba) - tabela inteira cabe sem scroll
    const off=offsetBanco(BANCO_ATIVO),qtd=BANCOS[BANCO_ATIVO].chaves.length,fim=off+qtd;
    const idx=Object.keys(KWR).map(Number).filter(q=>q>=off&&q<fim).sort((a,b)=>a-b);
    if(!idx.length){$('stRes').innerHTML='<p class="jnota">Nenhuma chave deste banco com Setup salvo '+(tensAtiva(BANCOS[BANCO_ATIVO].id)?'no chaveamento '+TENS_V[tensAtiva(BANCOS[BANCO_ATIVO].id)-1]+' V ':'')+'ainda.</p>'+tabelaPorTensao(BANCO_ATIVO,off,qtd);return}
    let nomT=0,realT=0;for(let q=off;q<fim;q++){if(DIS[q])continue;nomT+=CH[q].kw;realT+=KWR[q]?KWR[q].kw:CH[q].kw}
    const idB=BANCOS[BANCO_ATIVO].id,cB=tensAtiva(idB),vrefDe=(q,r)=>{const m=KWRT[q]&&cB&&KWRT[q][cB];return m&&m.vmed&&r.kw>0.05?m.vmed*Math.sqrt(CH[q].kw/r.kw):null};
    $('stRes').innerHTML='<table><tr><th>Chave</th><th>Nominal (kW)</th><th>Real (kW)'+(cB?' a '+TENS_V[cB-1]+' V':'')+'</th><th>R medido (Ω)</th><th>V ref. est. (V)</th><th>Desvio</th><th>Data</th></tr>'
      +idx.map(q=>{const r=KWR[q],n=CH[q].kw,d=(r.kw-n)/n*100,vr=vrefDe(q,r);return `<tr><td>${nomeCh(q)}${DIS[q]?' (desab.)':''}</td><td>${fmtKw(n)}</td><td>${fmtKw(r.kw)}</td><td>${r.ohm==null?'—':pt(r.ohm,2)}</td><td>${vr==null?'—':pt(vr,0)}</td><td>${d>=0?'+':''}${pt(d,1)} %</td><td>${r.data}</td></tr>`}).join('')
      +`<tr><th colspan="7">Carga disponível neste banco (chaves habilitadas): nominal ${fmtKw(Math.round(nomT*10)/10)} kW · com kW real ${fmtKw(Math.round(realT*10)/10)} kW (chave sem Setup usa o nominal)</th></tr></table>`+tabelaPorTensao(BANCO_ATIVO,off,qtd);
  }
  window.chSetupSel=()=>SEL;
  // v1.9.71: o gerador acabou de receber comando de parada (STOP) — cancela a calibração AGORA, sem esperar o painel mostrar PARADO
  window.chSetupGeradorParou=function(){
    const selAntigo=SEL;BASE=null;BASE_OK=false;
    if(selAntigo!=null){
      SEL=null;liga(null);
      // v1.10.228: a falha já vira CHV-001 dentro de chFetch; aqui só se avisa no texto do Setup que o PLC não confirmou
      if(chPlcAtivo())chFetch('POST',rotaCh(bidDeCh(selAntigo),'selecionar'),{indice:0}).catch(()=>{const s2=$('stTxt');if(s2)s2.textContent+=' O PLC NÃO confirmou a desmarcação (veja CHV-001).'});
      const st=$('stTxt');if(st)st.textContent='Chave '+nomeCh(selAntigo)+' desmarcada: gerador parado (STOP).';
    }
    try{grade();live()}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }
  }; // v1.9.69: leitura do SEL pelo simulador (fora desta IIFE)
  function liga(i){ // liga só a chave i (as demais, respeitando DIS, ficam desligadas) — Demo: direto; real: a chave física já deve estar sendo ligada manualmente pelo operador
    SIM.ch.fill(0);if(i!=null)SIM.ch[i]=1;
    // v1.9.54: sincroniza o potenciômetro virtual (painel Simulação) com as chaves — antes, ao abrir o Setup
    // (que zera as chaves via liga(null)), o slider ficava com o valor antigo, destoando das chaves na tela.
    const v=Math.min(120,Math.round(kwChaves()/KW_NOM*100*2)/2);
    SIM.sw=v;SIM.tgt=v;SIM.lastTgt=v;
    try{$('simCarga').value=v;$('simVal').textContent=pt(v)+'%'}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }
    try{ // v1.9.69: com chave selecionada no Setup, a carga simulada é a dela — potenciômetro e Auto ficam travados (senão apagavam a chave e a fórmula congelava em 0)
      const trav=i!=null,msg=trav?'Travado: há uma chave selecionada no Setup. Desmarque a chave (ou feche o Setup) para usar.':'';
      ['simCarga','mAuto'].forEach(id=>{const el=$(id);if(el){if(el.dataset.t0===undefined)el.dataset.t0=el.title||'';el.disabled=trav;el.title=trav?msg:el.dataset.t0}});
    }catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }
    try{drawBanco($('demo').checked?bancoSim():null)}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }
  }
  $('chSel').addEventListener('click',async e=>{
    const t=e.target.closest('.tile');if(!t)return;
    const q=offsetBanco(BANCO_ATIVO)+[...$('chSel').querySelectorAll('.tile')].indexOf(t); // v1.9.40: índice local da aba + offset do banco ativo = índice absoluto em CH
    if(DIS[q])return;
    { // v1.9.78: sem chaveamento informado (ou DB por tensão ausente) não seleciona chave nova
      const bidT=bidDeCh(q);
      if(SEL!==q&&tensExige(bidT)&&!(tensFeat(bidT)==='ok'||tensFeat(bidT)==='local'?tensAtiva(bidT):0)){$('stTxt').textContent=tensMsg(bidT);return}
    }
    // v1.9.75: Setup segue a MESMA regra do card "Cargas" — banco em Manual (local) ou desligado não deixa selecionar chave pra calibrar
    // (deixa desmarcar a que já estava selecionada, caso o banco tenha sido bloqueado DEPOIS dela ter sido escolhida).
    if(SEL!==q&&!bkLiberado(bidDeCh(q))){$('stTxt').textContent=bkMotivo(bidDeCh(q));return}
    if(!T.started||T.fim){}else{$('stTxt').textContent='Setup não pode ser feito com ensaio em andamento. Pare o ensaio antes.';return}
    if(!genOn()){$('stTxt').textContent='Setup só com o gerador em START (operando). '+($('demo').checked?'Use "Ligar gerador (Demo)".':'Ligue no painel do DSE.');return}
    const real_=chPlcAtivo(),indiceApi=q-offsetBanco(BANCO_ATIVO)+1; // v1.9.42: "indice" do contrato é 1..16 LOCAL ao banco (não o índice absoluto q)
    if(SEL===q){ // clicar de novo: desliga e libera a próxima
      SEL=null;liga(null);$('stTxt').textContent='';grade();live();
      if(real_){try{await chFetch('POST',rotaCh(bidDeCh(q),'selecionar'),{indice:0});chErro=''}catch(err){chErro=err instanceof ErroCh?err.message:String(err);$('stTxt').textContent='Aviso: não consegui avisar o PLC que desmarquei a chave ('+chErro+').'}chAtualizaChip()}
      return;
    }
    if(!real_&&!BASE_OK){$('stTxt').textContent='Aguardando a medição de "kW sem carga" — confira se TODAS as chaves estão desligadas com o gerador operando.';return}
    if(real_){
      $('stTxt').textContent='Selecionando '+nomeCh(q)+' no PLC…';
      try{
        await chFetch('POST',rotaCh(bidDeCh(q),'selecionar'),{indice:indiceApi});chErro='';
        SEL=q;liga(q);$('stTxt').textContent='Chave '+nomeCh(q)+' selecionada no PLC. Espere estabilizar e clique em "Salvar esta chave".';
      }catch(err){chErro=err instanceof ErroCh?err.message:String(err);$('stTxt').textContent='Não consegui selecionar no PLC: '+chErro}
      grade();live();chAtualizaChip();return;
    }
    SEL=q;liga(q);$('stTxt').textContent='Calibrando '+nomeCh(q)+'… pode esperar estabilizar e repetir quantas vezes quiser antes de Salvar.';
    grade();live();
  });
  $('stSalva').onclick=async()=>{
    if(SEL==null)return;
    { const bidT=bidDeCh(SEL);
      if(tensExige(bidT)&&!tensAtiva(bidT)){$('stTxt').textContent=tensMsg(bidT);return} // v1.9.78
    }
    if(chPlcAtivo()){
      $('stSalva').disabled=true;$('stTxt').textContent='Gravando no PLC (Ch '+nomeCh(SEL)+')…';
      try{
        await chFetch('POST',rotaCh(bidDeCh(SEL),'salvar'),{confirmado:true});chErro='';
        $('stTxt').textContent='PLC confirmou o Setup de '+nomeCh(SEL)+'. Atualizando a tabela…';
        await chAtualizaDoPlc();
        $('stTxt').textContent='Chave '+nomeCh(SEL)+': Setup salvo no PLC. Clique na chave de novo para desligar e escolher a próxima.';
      }catch(err){chErro=err instanceof ErroCh?err.message:String(err);$('stTxt').textContent='PLC recusou/não confirmou o Setup: '+chErro}
      $('stSalva').disabled=SEL==null;chAtualizaChip();live();return;
    }
    if(!BASE_OK)return;
    const real=MED.kw-BASE,nom=CH[SEL].kw;
    if(real<nom*0.5||real>nom*1.5){if(!confirm(`Resultado ${pt(real,1)} kW bem diferente do nominal (${fmtKw(nom)} kW). Confira se só esta chave está ligada. Salvar mesmo assim?`))return}
    const vMed=(MED.va+MED.vb+MED.vc)/3,ohm=(vMed*vMed)/(real*1000);
    const idT=bidDeCh(SEL),cT=tensAtiva(idT),dataT=new Date().toLocaleDateString('pt-BR'); // v1.9.78: salva POR CHAVEAMENTO (sem R teórico)
    if(tensExige(idT)&&cT){KWRT[SEL]=KWRT[SEL]||{};KWRT[SEL][cT]={kw:Math.round(real*10)/10,ohm:Math.round(ohm*100)/100,vmed:Math.round(vMed*10)/10,data:dataT}}
    KWR[SEL]={kw:Math.round(real*10)/10,ohm:Math.round(ohm*100)/100,ohmTeo:null,data:dataT};salvaReal();
    $('stTxt').textContent='Chave '+nomeCh(SEL)+': '+pt(real,1)+' kW real salvo (R '+pt(ohm,2)+' Ω). Clique na chave de novo para desligar e escolher a próxima.';
    grade();resumo();renderTabs();live();
  };
  $('stGenDemo').onclick=async()=>{ // só Demo: liga/desliga o gerador simulado (+ v1.9.52: se o modo PLC estiver ativo, força o DB52 de verdade pro FB100 ter o que ler, já que sem isso o DSE real não está conectado)
    if(!$('demo').checked)return;
    const ligando=SIM.gen==='parado';
    if(ligando){SIM.gen='partindo';SIM.gt=0}
    else if(SIM.gen==='partindo'||SIM.gen==='operando'){SIM.gen='parando';SIM.gt=0;if(SEL!=null){SEL=null;liga(null);$('stTxt').textContent='Gerador desligado — calibração cancelada.'}BASE_OK=false;BASE=null}
    grade();live();
    if(chPlcAtivo()){
      try{await chFetch('POST','/api/simulador/dse',{ligado:ligando});chErro=''}
      catch(err){chErro=err instanceof ErroCh?err.message:String(err);$('stTxt').textContent='Aviso: não consegui avisar o simulador do DSE no Node-RED: '+chErro}
    }
  };
  $('chUsaReal').onchange=async e=>{
    const novo=e.target.checked,antes=USAR_REAL;
    USAR_REAL=novo;salvaReal();grade();aplicaDis();live();
    if(!chPlcAtivo())return;
    try{await chFetch('POST',rotaCh(bidAtivo(),'usarKwReal'),{usar:novo});chErro=''}
    catch(err){chErro=err instanceof ErroCh?err.message:String(err);USAR_REAL=antes;salvaReal();grade();aplicaDis();live();alert('Não foi possível avisar o PLC sobre "usar kW real": '+chErro)}
    chAtualizaChip();
  };
  $('chLimpaReal').onclick=async()=>{ // v1.9.40: agora só limpa o banco da aba ativa (antes apagava os 2 bancos juntos)
    const off=offsetBanco(BANCO_ATIVO),fim=off+BANCOS[BANCO_ATIVO].chaves.length;
    const temNesteBanco=Object.keys(KWR).map(Number).some(q=>q>=off&&q<fim);
    if(!temNesteBanco&&!chPlcAtivo())return;
    const cL=tensAtiva(bidAtivo()),eTens=tensExige(bidAtivo());
    if(eTens&&!cL){$('stTxt').textContent='Informe o chaveamento (220/380/440 V): o Setup é guardado por chaveamento e a limpeza vale só para o ativo.';return}
    if(!confirm('Apagar os kW reais de todas as chaves do '+BANCOS[BANCO_ATIVO].nome+(eTens?' no chaveamento '+TENS_V[cL-1]+' V':'')+(chPlcAtivo()?' NO PLC (DB'+(eTens?DB_TENS[bidAtivo()]:DB_BANCO[bidAtivo()])+')':'')+'?'))return;
    if(chPlcAtivo()){
      $('stTxt').textContent='Limpando no PLC…';
      try{await chFetch('POST',rotaCh(bidAtivo(),'limpar'),{confirmado:true});chErro='';await chAtualizaDoPlc();$('stTxt').textContent='Setup do '+BANCOS[BANCO_ATIVO].nome+' limpo no PLC.'}
      catch(err){chErro=err instanceof ErroCh?err.message:String(err);$('stTxt').textContent='PLC não confirmou a limpeza: '+chErro}
      chAtualizaChip();return;
    }
    for(let q=off;q<fim;q++){delete KWR[q];if(eTens&&KWRT[q])delete KWRT[q][cL]}
    salvaReal();grade();resumo();renderTabs();aplicaDis();live();
  };
  // v1.9.46: limpar Setup de uma chave específica (ao contrário de chLimpaReal que apaga TODAS)
  $('stLimpa').onclick=()=>{
    if(SEL==null||!KWR[SEL])return;
    if(!confirm('Apagar o Setup (kW real, resistência) de apenas '+nomeCh(SEL)+'?'))return;
    const chaveAntiga=SEL;
    delete KWR[SEL];
    // v1.9.49: Limpar Chave agora limpa TUDO — valor salvo (Setup) E o cálculo ao vivo (desseleciona a
    // chave, volta pro estado "clique numa chave para calibrar"). A pedido do operador: antes a chave
    // ficava selecionada mostrando o cálculo recalculando sozinho, o que não é o comportamento desejado.
    SEL=null;liga(null);
    salvaReal();grade();resumo();renderTabs();aplicaDis();live();
    $('stTxt').textContent='Setup de '+nomeCh(chaveAntiga)+' apagado. Clique numa chave para calibrar.';
  };
  // v1.9.40: mini-relatório em PDF do Setup (kW real/resistência) dos 2 bancos - mesmo gerador de PDF sem biblioteca usado em pdfGrandezas/gerarPdf
  function pdfChaves(modo){   // v1.10.107: modo 'txt' | 'md' devolve a tabela em texto; sem modo gera o PDF
    const LIN=[];
    const agora=new Date(),p2=n=>String(n).padStart(2,'0');
    const dt=`${p2(agora.getDate())}/${p2(agora.getMonth()+1)}/${agora.getFullYear()} ${p2(agora.getHours())}:${p2(agora.getMinutes())}:${p2(agora.getSeconds())}`;
    const demo=$('demo').checked;
    const pg=new Pg(),X0=40;
    pg.r(X0,34,762,34,demo?0.93:0.9);
    pg.t(X0+8,56,'SETUP DAS CARGAS - kW REAL E RESISTÊNCIA (CHAVE A CHAVE)',13,true);
    pg.t(X0,90,'Origem: '+(demo?'DADOS DEMO (SIMULAÇÃO)':'DADOS REAIS (Node-RED/DSE)')+'  ·  Gerado em: '+dt,10);
    const COLX=[X0,X0+150,X0+235,X0+320,X0+415,X0+510,X0+590],COLW=[150,85,85,95,95,80,172],HJ=['l','c','c','c','c','c','c'];
    const HEAD=['Chave','Nominal (kW)','Real (kW)','R medido (ohm)','V ref. est. (V)','Desvio','Data do Setup']; // "ohm" por extenso: a fonte do PDF (WinAnsi) não tem o símbolo Ω — vira "?" se usar o símbolo
    let y=112;
    BANCOS.forEach((b,bi)=>{
      const off=offsetBanco(bi),qtd=b.chaves.length,fim=off+qtd;
      const idx=Object.keys(KWR).map(Number).filter(q=>q>=off&&q<fim).sort((a,c)=>a-c);
      pg.t(X0,y+13,b.nome.toUpperCase()+' ('+qtd+' chaves)'+(tensAtiva(b.id)?' - CHAVEAMENTO '+TENS_V[tensAtiva(b.id)-1]+' V':''),11,true);y+=20;
      HEAD.forEach((h,i)=>pg.cell(COLX[i],y,COLW[i],18,h,{fill:0.85,b:1,sz:8.5,al:HJ[i]}));y+=18;
      if(!idx.length){pg.t(X0+4,y+13,'Nenhuma chave deste banco com Setup salvo ainda.',9);y+=22}
      else idx.forEach(q=>{
        const r=KWR[q],n=CH[q].kw,d=(r.kw-n)/n*100;
        const row=[nomeCh(q)+(DIS[q]?' (desab.)':''),fmtKw(n),fmtKw(r.kw),r.ohm==null?'-':pt(r.ohm,2),(()=>{const m=KWRT[q]&&tensAtiva(b.id)&&KWRT[q][tensAtiva(b.id)];return m&&m.vmed&&r.kw>0.05?pt(m.vmed*Math.sqrt(n/r.kw),0):'-'})(),(d>=0?'+':'')+pt(d,1)+'%',r.data];
        LIN.push([b.nome].concat(row));
        row.forEach((v,i)=>pg.cell(COLX[i],y,COLW[i],16,v,{sz:8.5,al:HJ[i]}));y+=16;
      });
      let nomT=0,realT=0;for(let q=off;q<fim;q++){if(DIS[q])continue;nomT+=CH[q].kw;realT+=KWR[q]?KWR[q].kw:CH[q].kw}
      pg.t(X0+4,y+12,'Carga disponível (habilitadas): nominal '+fmtKw(Math.round(nomT*10)/10)+' kW · com kW real '+fmtKw(Math.round(realT*10)/10)+' kW',8.5,true);
      y+=28;
    });
    if(modo==='txt'||modo==='md'){const cab=['Banco'].concat(HEAD),tit='Setup das cargas - kW real e resistência (chave a chave)';
      EXPO.baixaTxt('setup_chaves',modo,modo==='md'?EXPO.tabMd(tit,cab,LIN):EXPO.tabTxt(tit,cab,LIN));return}
    pg.t(X0,570,`Gerado em ${dt} · Medidor do Gerador v${VERSAO}${demo?' · SIMULAÇÃO':''}`,7);
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
    baixa(new Blob(ch,{type:'application/pdf'}),`setup_chaves_${demo?'DEMO':'REAL'}_${agora.getFullYear()}${p2(agora.getMonth()+1)}${p2(agora.getDate())}_${p2(agora.getHours())}${p2(agora.getMinutes())}${p2(agora.getSeconds())}.pdf`);
  }
  $('chImprimir').onclick=e=>EXPO.menu(e.currentTarget,[
    {rot:'PDF (.pdf)',dica:'tabela de Setup dos 2 bancos, A4 paisagem',fn:()=>pdfChaves()},
    {rot:'Texto (.txt)',dica:'simples, para colar em e-mail ou conversa',fn:()=>pdfChaves('txt')},
    {rot:'Markdown (.md)',dica:'tabela formatada, para documentação',fn:()=>pdfChaves('md')}]);
  // v1.9.43: popup único "⚙ Chaves" virou dois botões independentes - "⚙ Chaves" (só Habilitar/Desabilitar,
  // card 1) e "Setup" (só calibração/kW real, card 2). Ambos .show() (não-modal) em vez de .showModal(),
  // então não travam a tela de fundo e os dois podem ficar abertos ao mesmo tempo (conferido com o operador).
  const bHD=mkBtn('<span>⚙ Chaves</span>','Habilitar/desabilitar cada chave (não trava a tela principal)',()=>{
    renderTabs();grade();chAtualizaChip();$('dlgChHD').show();
    if(chPlcAtivo())chAtualizaDoPlc();
  },'cfgbtn inl');
  bHD.id='bChaves';$('bco').querySelector(':scope>.hrow').appendChild(bHD);
  const bSetup=mkBtn('<span>🛠 Setup</span>','Setup do kW real/resistência, chave a chave (não trava a tela principal)',()=>{
    if(T.started&&!T.fim){msgGer('Setup bloqueado: há um ensaio em andamento (inclusive pausado). Use PARAR ENSAIO antes de calibrar as chaves.');return} // v1.9.62: vale também no Demo, igual ao teste real
    if(chPlcAtivo())chAtualizaDoPlc(); // atualiza do PLC ANTES de desselecionar, para não sobrescrever o reset
    SEL=null;liga(null);$('stTxt').textContent=''; // desseleciona chave e limpa mensagem ao abrir popup Setup
    if(!chPlcAtivo())tensAplicaLocal(bidAtivo()); // v1.9.78: Demo local: visão KWR do chaveamento ativo
    renderTabs();grade();resumo();chAtualizaChip();$('dlgChSetup').show();
    // v1.9.50: live() SÓ depois do .show() — a função só recalcula "kW sem carga" (BASE_OK) quando
    // $('dlgChSetup').open já é true; chamada antes do show() virava no-op e deixava BASE_OK desatualizado,
    // fazendo o 1º clique na chave falhar com "Aguardando a medição de kW sem carga" (precisava clicar 2x).
    live();
  },'cfgbtn inl');
  bSetup.id='btSetup';$('bco').querySelector(':scope>.hrow').appendChild(bSetup);
  let tmr=null,tmrPlc=null;
  const chAtualizaIntervalos=()=>{
    clearInterval(tmr);clearInterval(tmrPlc);
    const abertoSetup=$('dlgChSetup').open,abertoAlgum=abertoSetup||$('dlgChHD').open;
    if(abertoSetup)tmr=setInterval(live,500);
    if(abertoAlgum)tmrPlc=setInterval(()=>{if(chPlcAtivo())chAtualizaDoPlc()},3000);
  };
  $('dlgChSetup').addEventListener('close',()=>{if(SEL!=null){SEL=null;liga(null);grade()}chAtualizaIntervalos()});
  $('dlgChHD').addEventListener('close',chAtualizaIntervalos);
  new MutationObserver(chAtualizaIntervalos).observe($('dlgChHD'),{attributes:true,attributeFilter:['open']});
  new MutationObserver(chAtualizaIntervalos).observe($('dlgChSetup'),{attributes:true,attributeFilter:['open']});
  // v1.9.78: Setup aberto = tela principal BLOQUEADA (cortina por trás do popup, como no início). Clique na cortina só avisa.
  const stBloqSync=()=>{const ab=$('dlgChSetup').open;$('stBloq').hidden=!ab;document.body.classList.toggle('stAtivo',ab)};
  new MutationObserver(stBloqSync).observe($('dlgChSetup'),{attributes:true,attributeFilter:['open']});
  $('dlgChSetup').addEventListener('close',stBloqSync);
  $('stBloq').addEventListener('click',()=>{const t=$('stTxt');if(t)t.textContent='Setup ativo: a tela principal está bloqueada. Feche o popup Setup (✕) para voltar a ela.';const d=$('dlgChSetup');d.classList.remove('stPisca');void d.offsetWidth;d.classList.add('stPisca')});
  stBloqSync();
  $('chGrade').addEventListener('change',async e=>{
    const c=e.target.closest('input[data-i]');if(!c)return;
    const q=+c.dataset.i,habilitada=c.checked;
    DIS[q]=!habilitada;if(DIS[q]&&SEL===q){SEL=null;liga(null)}salvaDis();grade();aplicaDis();live();
    if(!chPlcAtivo())return;
    const indiceApi=q-offsetBanco(BANCO_ATIVO)+1;
    try{await chFetch('POST',rotaCh(bidAtivo(),'habilitar'),{indice:indiceApi,habilitada});chErro=''}
    catch(err){chErro=err instanceof ErroCh?err.message:String(err);DIS[q]=habilitada;salvaDis();grade();aplicaDis();live();alert('Não foi possível habilitar/desabilitar no PLC: '+chErro)}
    chAtualizaChip();
  });
  // Demo manual: clicar na chave liga/desliga (o potenciômetro continua valendo) — fora do popup de chaves, direto no card Cargas
  let _cliqueBusy=false;
  // v1.9.74: seletora Local/Remoto (chip) e "Ligar banco" (botão) de cada banco.
  // v1.9.77: fora do Demo local os dois vêm do PLC (flow chaves v2.4): a seletora é só leitura (física) e o botão envia
  // POST /api/chaves/{banco}/banco {ligar}. Com flow antigo (sem o campo "seletora") o chip fica "sem sinal" e nada é enviado.
  const BK_PEND={};
  async function bkCliqueCtlPlc(act,id){
    const s=BKS[id];
    if(act==='sel'){msgGer(s.sel===null?'Seletora do BC'+id+': sem sinal — importe o flow chaves v2.4 (e FB101 v0.4 no PLC) para ler a seletora física.':'A seletora do BC'+id+' é física: gire-a no banco de carga (a tela só mostra a posição lida do ET200).');return}
    if(act!=='lig')return;
    if(BK_PEND[id])return;
    const ligar=!s.lig;
    if(ligar&&!LINK.bancoOk(id)){msgGer('Sem leitura do PLC do BC'+id+'. Comando NÃO enviado.');return} // desligar tenta sempre (segurança)
    if(ligar&&s.sel===null){msgGer('Sem sinal da seletora do BC'+id+' (flow sem seletora): "Ligar banco" fica inativo.');return}
    if(ligar&&s.sel!=='auto'){msgGer(bkMotivo(id));return}
    BK_PEND[id]=true;window.BK_HOLD[id]=Date.now()+60000; // enquanto o POST viaja, a leitura periódica não mexe no estado do banco
    try{
      await chFetch('POST',rotaCh(id,'banco'),{ligar});
      s.lig=ligar;if(!ligar)CH.forEach((c,i)=>{if(BANCOS[c.b].id===id){CH_CMD[i]=false}}); // otimista; a leitura do PLC confirma
      for(const k in _ms)delete _ms[k];
      msgGer('BC'+id+' '+(ligar?'ligado: chaves liberadas.':'desligado: chaves abertas.'),6000);
    }catch(err){msgGer('Não consegui '+(ligar?'ligar':'desligar')+' o banco BC'+id+' no PLC: '+(err instanceof ErroCh?err.message:String(err)))}
    finally{delete BK_PEND[id];window.BK_HOLD[id]=Date.now()+1500;try{drawBanco(bancoDados(window.__ultimoDado||{}))}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }if($('dlgChSetup').open){try{grade()}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }}}
  }
  function bkCliqueCtl(act,id){
    const s=BKS[id];if(!s)return;
    const demoLocal=bkEhDemoLocal(),bi=BANCOS.findIndex(b=>b.id===id);
    if(bkEnsaioTrava()&&(act==='sel'||(act==='lig'&&!s.lig))){msgGer(bkMotivoEnsaio);return} // v1.9.76
    if(!demoLocal&&CH_SRV.fonte==='nodered'){bkCliqueCtlPlc(act,id);return} // v1.9.77
    if(act==='sel'){
      if(!demoLocal){msgGer('Seletora do BC'+id+': sem sinal fora do Demo local e do PLC.');return}
      // v1.9.75: no Demo local a seletora nasce em Manual (nunca "sem sinal") e alterna só Manual <-> Auto, como a seletora física de verdade.
      s.sel=s.sel==='auto'?'manual':'auto';
    }else if(act==='lig'){
      if(s.sel!=='auto'&&!s.lig){msgGer(s.sel==='manual'?bkMotivo(id):'Sem sinal da seletora do BC'+id+': o botão fica inativo.');return}
      if(!demoLocal){msgGer('Ligar banco: sem PLC configurado — comando NÃO enviado.');return}
      s.lig=!s.lig;
    }else return;
    // mudou a seletora ou o estado do banco: banco sai de "liberado" → solta as chaves SIMULADAS dele (nada fica ligado sem comando)
    if(act==='sel'||!s.lig)CH.forEach((c,i)=>{if(c.b===bi)SIM.ch[i]=0});
    if(act==='sel')s.lig=false;
    // v1.9.75: se o banco acabou de BLOQUEAR (Manual ou desligado) e havia uma chave DELE selecionada no Setup, cancela a calibração —
    // a mesma lógica do STOP do gerador (chSetupGeradorParou), só que disparada pela seletora/"Ligar banco" em vez do gerador.
    if(!bkLiberado(id)&&SEL!=null&&bidDeCh(SEL)===id){
      const selAntigo=SEL;SEL=null;liga(null);
      const st=$('stTxt');if(st)st.textContent='Chave '+nomeCh(selAntigo)+' desmarcada: banco BC'+id+' bloqueado (seletora/"Ligar banco").';
      try{grade()}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }
    }
    for(const k in _ms)delete _ms[k]; // o cache de combinações depende de quais bancos estão liberados
    // v1.9.76 (achado do Operador secreto): com o popup Setup ABERTO e nenhuma chave selecionada, a seletora/"Ligar banco" mudava o estado mas a nota e as chaves cinza
    // do popup só atualizavam no próximo grade() — a regra valia no clique, mas a tela mostrava o banco ainda liberado. Agora redesenha sempre que o popup está aberto.
    if($('dlgChSetup').open){try{grade()}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }}
    const v=Math.min(120,Math.round(kwChaves()/KW_NOM*100*2)/2);
    $('simCarga').value=v;$('simVal').textContent=pt(v)+'%';
    msgGer(act==='sel'?'Seletora do BC'+id+' (simulada): '+(s.sel===null?'sem sinal — chaves liberadas como antes.':s.sel==='auto'?'Auto (remoto) — acione "Ligar banco" para operar as chaves.':'Manual (local) — comando bloqueado.'):'BC'+id+' '+(s.lig?'ligado (Ligar banco simulado): chaves liberadas.':'desligado: chaves soltas.'),6000);
    try{drawBanco(bancoSim())}catch(x){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }
  }
  $('bancos').addEventListener('click',async e=>{
    const ab=e.target.closest('button[data-act][data-b]');if(ab){bkCliqueCtl(ab.dataset.act,ab.dataset.b);return}
    const t=e.target.closest('.tile[data-i]');if(!t)return;
    /* v1.10.121: Patamar MANUAL esperando o Aplicar → o clique do OPERADOR (isTrusted) só edita a sugestão (tira/põe a chave), não comanda o PLC.
       Cliques do sistema (t.click() de Abrir TODAS, parada por falha do DSE, plano do Aplicar) não são "trusted" e passam direto: a segurança nunca é interceptada. */
    if(e.isTrusted&&window.PATAMAR_SINC_CLIQUE)window.PATAMAR_SINC_CLIQUE(+t.dataset.i);   /* v1.10.221: o tracejado acompanha a escolha do operador (desmarcou/marcou de novo) */
    if(e.isTrusted&&window.PATAMAR_PENDENTE&&window.PATAMAR_PENDENTE()){window.PATAMAR_EDITA(+t.dataset.i);msgGer('Patamar manual esperando o Aplicar: o clique só edita a sugestão e NÃO comanda o PLC. Aplique ou cancele o Patamar para comandar a chave.',6000);return} // v1.10.169: aviso
    // v1.9.58: com o servidor "Node-RED real" o clique vai de verdade pro PLC (POST /api/chaves/56/selecionar — mesma rota do Setup;
    // o FB100 aciona cb.ligar da chave selecionada). Só 1 chave por vez (é o que a rota/chaveSel suporta). A tela pinta de
    // LARANJA (comandada) na hora e fica VERDE só quando o feedback do PLC (sb.ligada) confirmar.
    if(CH_SRV.fonte==='nodered'){
      const i=+t.dataset.i,bi=CH[i].b,bid=BANCOS[bi].id; // v1.9.63: banco da PRÓPRIA chave clicada (BC56 ou BC400)
      const off=offsetBanco(bi);
      if(!chBase()){msgGer('Informe a URL do PLC no botão Demo (campo Servidor).');return}
      if(!LINK.bancoOk(bid)){msgGer('Sem leitura do PLC do '+BANCOS[bi].nome+' ('+(CH_ERRO[bid]||'aguardando a 1ª leitura')+'). Comando NÃO enviado.');if(window.OCOR)window.OCOR.set('bco','CHV-002','BC'+bid+': comando bloqueado — banco sem leitura do PLC ('+(CH_ERRO[bid]||'aguardando a 1ª leitura')+')',{ref:'BC'+bid,tipo:'msg',ev:true,expira:30000});return}
      if($('dlgChSetup').open&&SEL!=null){msgGer('Setup em andamento — termine/desmarque a chave no popup Setup antes.');return}
      if(DIS[i]){msgGer('Chave desabilitada (card Cargas › ⚙ Chaves).');return}
      if(!bkLiberado(bid)){msgGer(bkMotivo(bid));return} // v1.9.74: só age quando existir o sinal da seletora (BKS[...].sel !== null)
      if(CH_PEND.has(i)){ // esta chave ainda está sendo enviada; as outras podem ser clicadas em paralelo
        const dtp=Date.now()-(CH_PEND_T[i]||0); // v1.10.169: nunca ignorar em silêncio e nunca travar para sempre (o POST tem timeout de 10 s)
        if(dtp<12000){msgGer('Comando anterior desta chave ainda em envio ('+Math.ceil(dtp/1000)+' s). Aguarde.',3000);return}
        CH_PEND.delete(i);
      }
      // liga/desliga CADA chave (POST /api/chaves/{banco}/ligar -> cb.ligar[n]); atualização OTIMISTA: pinta na hora e reverte se o PLC recusar
      const novo=!CH_CMD[i],idx=i-off+1,redesenha=()=>{try{drawBanco(bancoDados(window.__ultimoDado||{}))}catch(x){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }};
      if(novo&&FALHA_RET[i])msgGer('Rearmando '+nomeCh(i)+' depois da falha de retorno (o PLC só rearma com novo comando e retorno em 0).',5000); // v1.10.168
      CH_CMD[i]=novo;CH_PEND.add(i);CH_PEND_T[i]=Date.now();redesenha();
      try{
        await chFetch('POST',rotaCh(bid,'ligar'),{indice:idx,ligar:novo});chErro='';
      }catch(err){CH_CMD[i]=!novo;chErro=err instanceof ErroCh?err.message:String(err);msgGer('Não consegui '+(novo?'ligar':'desligar')+' a '+nomeCh(i)+' no PLC: '+chErro)}
      finally{CH_PEND.delete(i)}
      chAtualizaChip();redesenha();
      return;
    }
    if(!$('demo').checked)return;
    if(SEL!=null){msgGer('Setup em andamento — desmarque a chave no popup Setup antes de usar as chaves aqui.');return} // v1.9.72: antes ignorava em silêncio
    if(auto&&!(window.PATAMAR_GUIADO_ON&&window.PATAMAR_GUIADO_ON())){ // v1.10.2: com o Patamar Guiado ligado ele é o dono das chaves (cliques dele passam e o Auto não vira Manual). v1.9.72: Simulação em AUTO = operador simulado dono das chaves. Sem ensaio ativo o clique assume (como o operador no real); com ensaio ativo avisa
      if(T.started&&!T.fim){msgGer('Simulação em AUTO com ensaio ativo: o operador simulado controla as chaves. Troque a Simulação para MANUAL (painel Demo) para ligar à mão.');return}
      setModo(false);msgGer('Simulação passou para MANUAL: você assumiu as chaves.',6000);
    }
    const i=+t.dataset.i;if(DIS[i]){msgGer('Chave desabilitada (card Cargas › ⚙ Chaves).');return}
    if(!bkLiberado(bkDeCh(i))){msgGer(bkMotivo(bkDeCh(i)));return} // v1.9.74: banco em Manual (local) ou desligado
    SIM.ch[i]=SIM.ch[i]?0:1;
    const v=Math.min(120,Math.round(kwChaves()/KW_NOM*100*2)/2);
    $('simCarga').value=v;$('simVal').textContent=pt(v)+'%';
    try{drawBanco(bancoSim())}catch(x){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }
  });
  $('simCarga').addEventListener('input',()=>{SIM.refill=true});
  chAtualizaChip(); // v1.9.42: mostra o chip "Banco de Carga: simulador local / Node-RED real" desde o carregamento, mesmo com o popup Chaves fechado
})();
