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
  const SB={ativo:false,orig:{},c:{print:0,janelaNova:0,alerta:0,confirmacao:0,prompt:0,redeBloqueada:0,seletor:0,download:0}};
  function sandboxLiga(){
    if(SB.ativo)return;SB.ativo=true;Object.keys(SB.c).forEach(k=>SB.c[k]=0);const o=SB.orig;
    o.print=window.print;o.open=window.open;o.alert=window.alert;o.confirm=window.confirm;o.prompt=window.prompt;o.fetch=window.fetch;o.xo=XMLHttpRequest.prototype.open;o.xs=XMLHttpRequest.prototype.send;o.ac=HTMLAnchorElement.prototype.click;o.pk={};
    window.print=()=>{SB.c.print++};window.open=()=>{SB.c.janelaNova++;return null};window.alert=()=>{SB.c.alerta++};window.confirm=()=>{SB.c.confirmacao++;return true};window.prompt=(m,d)=>{SB.c.prompt++;return d||''};
    window.fetch=function(i,init){const m=String((init&&init.method)||(i&&i.method)||'GET').toUpperCase();if(m!=='GET'&&m!=='HEAD'){SB.c.redeBloqueada++;return Promise.resolve(new Response('{"ok":false,"erro":"bloqueado pela caixa de areia do Dev/Operador oculto"}',{status:503,headers:{'Content-Type':'application/json'}}))}return o.fetch.apply(this,arguments)};
    XMLHttpRequest.prototype.open=function(m){this.__m=String(m).toUpperCase();return o.xo.apply(this,arguments)};
    XMLHttpRequest.prototype.send=function(){if(this.__m&&this.__m!=='GET'&&this.__m!=='HEAD'){SB.c.redeBloqueada++;try{this.abort()}catch(e){}return}return o.xs.apply(this,arguments)};
    HTMLAnchorElement.prototype.click=function(){if(this.hasAttribute&&this.hasAttribute('download')){SB.c.download++;return}return o.ac.apply(this,arguments)};
    ['showDirectoryPicker','showOpenFilePicker','showSaveFilePicker'].forEach(k=>{if(window[k]){o.pk[k]=window[k];window[k]=async()=>{SB.c.seletor++;throw new DOMException('cancelado pela caixa de areia','AbortError')}}});
  }
  function sandboxDesliga(){
    if(!SB.ativo)return;SB.ativo=false;const o=SB.orig;
    window.print=o.print;window.open=o.open;window.alert=o.alert;window.confirm=o.confirm;window.prompt=o.prompt;window.fetch=o.fetch;XMLHttpRequest.prototype.open=o.xo;XMLHttpRequest.prototype.send=o.xs;HTMLAnchorElement.prototype.click=o.ac;
    Object.keys(o.pk).forEach(k=>{window[k]=o.pk[k]});
  }

  /* ---------- leitura da tela ---------- */
  function perfil(){
    const p={larg:innerWidth,alt:innerHeight,dpr:+(devicePixelRatio||1).toFixed(2),toque:matchMedia('(pointer:coarse)').matches,ua:navigator.userAgent.slice(0,90)};
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
    try{el.scrollIntoView({block:'center',inline:'center'})}catch(e){}
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
  const fecharTudo=()=>{document.querySelectorAll('dialog[open]').forEach(d=>{if(d.id!=='dlgGuiado'){try{d.close()}catch(e){}}});document.querySelectorAll('[popover]').forEach(e=>{try{if(e.matches(':popover-open')&&e.id!=='opsBar')e.hidePopover()}catch(x){}})};
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
    if(g.fx){try{g.fx.scrollIntoView({block:'nearest'})}catch(e){}g.fx.click();await pausa(220);fechou=!$(id).open}
    if(!fechou){ // Esc com foco dentro da janela
      try{const f=$(id).querySelector('button,input,select,summary');if(f)f.focus()}catch(e){}
      esc_();await pausa(220);const porEsc=!$(id).open;
      if(porEsc&&g.fx)achou(fase,obj+': o ✕ NÃO fechou (só o Esc fechou)','clique no botão fechar sem efeito');
      fechou=porEsc;
    }
    if(!fechou&&!('nofora' in $(id).dataset)){$(id).click();await pausa(200);fechou=!$(id).open}  // clique fora
    if(!fechou){achou(fase,obj+': NÃO fecha','nem ✕, nem Esc, nem clique fora');try{$(id).close()}catch(e){}}
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
      if(AV.perfil.toque){const r=el.getBoundingClientRect(),m=Math.min(r.width,r.height);if(m<24)aviso(fase,'alvo de toque muito pequeno: '+obj,Math.round(r.width)+'×'+Math.round(r.height)+' px (mínimo recomendado 44)');}
      if(el.disabled){AV.cob.nao.push(obj+' [desabilitado]');continue}
      const s=sonda(el);
      if(s.oculto){AV.cob.nao.push(obj+' [escondido agora]');AV.cob.total--;continue}
      if(!s.dentro){achou(fase,'inalcançável (fora da tela): '+obj,'mesmo rolando, o centro fica fora da tela '+innerWidth+'×'+innerHeight);AV.cob.nao.push(obj+' [fora da tela]');continue}
      if(!s.ok){achou(fase,'coberto por outro elemento: '+obj,'o clique cairia em '+s.cob);AV.cob.nao.push(obj+' [coberto por '+s.cob+']');continue}
      const a0=estadoRapido();let ef='';
      AV.ultimoObj=obj;
      try{ef=await aciona(el)}catch(e){achou(fase,'erro ao acionar '+obj,String(e&&e.message||e).slice(0,120));ef='erro'}
      AV.cob.acionados++;await pausa(110);
      const a1=estadoRapido();
      if(a1.ovx&&!a0.ovx)achou(fase,'rolagem horizontal criada por '+obj,a1.sw+' > '+innerWidth);
      const novas=a1.dlgs.filter(x=>!a0.dlgs.includes(x));
      if(novas.length){AV.efeitos[obj]='abriu '+novas.join(',');const gat=()=>document.contains(el)?el:null;await testaJanela(novas[0],gat,prof,fase)}
      if(a1.pops&&!a0.pops){esc_();await pausa(80)}
      if(/^Clique para (expandir|recolher)/.test(el.title||'')&&document.contains(el)){el.click();await pausa(90)}   // cabeçalho recolhível: devolve ao estado de antes (senão esconde o resto da tela)
      if(a1.ens==='andamento'&&a0.ens==='parado'){await pararSilencio()}   // um clique iniciou ensaio: encerra para não travar o resto da varredura
      const rest=estadoRapido();if(rest.dlgs.some(x=>!a0.dlgs.includes(x))||rest.pops>0){fecharTudo();await pausa(60)}
    }
    if(!escopoDlg&&prof===0&&!AV.segunda){AV.segunda=true;try{await varre('',0,null,fase)}finally{AV.segunda=false}}   // 2ª passada: objetos que só apareceram depois de abrir um grupo/lista
  }
  async function pararSilencio(){try{if(typeof pararEnsaioSilencioso==='function')pararEnsaioSilencioso()}catch(e){}await pausa(120)}

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
        try{if(window.PACOTE_IA&&PACOTE_IA.fechaMenu)PACOTE_IA.fechaMenu()}catch(e){}
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
    for(const p of pats.slice(0,6)){
      if(OPS.parar)throw ABORT;
      clica(p,'patamar '+nomeEl(p));await pausa(120);
      clica(btn('zera')||zera,'Limpar seleção');await pausa(100);
      clica(btn('sug')||sug,'Sugerir chaves');await pausa(200);
      const m1=msg(),s1=stats();
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
      try{dadosConfMarca(false)}catch(e){}   // 'Dados confirmados' vale por sessão: limpa para o INICIAR abrir o diálogo de novo
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
      const r=rnd(),el=pick(lista);
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
      if(n%40===0){fecharTudo();document.querySelectorAll('[popover]:popover-open').forEach(e=>{if(e.id!=='opsBar')try{e.hidePopover()}catch(x){}})}
    }
    fecharTudo();
    chk(F,n+' ações aleatórias sem erro de JavaScript',OPS.erroJs.length===erros0,OPS.erroJs.slice(erros0,erros0+3).join(' | '));
    return n;
  }

  /* ---------- orquestração dos modos avançados ---------- */
  /* Patamar Guiado: guarda a configuração do começo e devolve depois da varredura (a varredura marca/desmarca bancos, patamar, etc. e isso muda o ensaio seguinte) */
  const gSnap=()=>{try{return JSON.stringify(window.GUIADO_DBG.G)}catch(e){return null}};
  const salvaModo=()=>(typeof PORPAT!=='undefined'&&PORPAT)?'P':(typeof salvarManual!=='undefined'&&salvarManual)?'M':'A';
  function restauraG(){try{if(!AV.g0)return;if(AV.salva0&&salvaModo()!==AV.salva0&&window.__setSalvaModo)window.__setSalvaModo(AV.salva0);
    if(AV.salva0&&salvaModo()!==AV.salva0){PORPAT=AV.salva0==='P';salvarManual=AV.salva0==='M';try{localStorage.setItem('medidor.salvarManual',salvarManual?'1':'0');localStorage.setItem('medidor.porPatamar',PORPAT?'1':'0')}catch(e){}if(!salvarManual)T.aguarda=false;try{window.__aoMudarSalva&&window.__aoMudarSalva()}catch(e){}}const G=window.GUIADO_DBG.G;Object.assign(G,JSON.parse(AV.g0));G.guiadoOn=false;if(window.GUIADO_MAE&&window.GUIADO_MAE.armada)window.GUIADO_MAE.desarma('Dev/Operador oculto: base limpa');if(window.GUIADO&&window.GUIADO.pinta)window.GUIADO.pinta()}catch(e){}}
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
    AV.g0=gSnap();AV.salva0=salvaModo();
    sandboxLiga();
    lg('info','Dev/Operador oculto: início',{tipo,modo,semente:AV.semente,perfil:p,versao:VERSAO});
    reg('ok','Preparação','perfil da tela',p.larg+'×'+p.alt+' px · DPR '+p.dpr+(p.toque?' · toque':' · mouse')+' · '+p.ua);
    ui();try{if($('dlgDemo').open)$('dlgDemo').close()}catch(e){}
    try{
      if(tipo==='avancado'){
        const fa=x=>!opt.fases||String(opt.fases).split(',').includes(x);   // opt.fases ('U1,U2,U3,U4'): roda só estas fases (diagnóstico)
        if(fa('U1')){OPS.fase='U1 · Varredura da página';ui();passo('percorrendo todos os objetos');
          document.querySelectorAll('#bancos details').forEach(d=>{d.open=true});   // abre os bancos para varrer as chaves de todos (o operador faz o mesmo tocando no cabeçalho)
          await preparaChaves();await estabilizaHabil();
          await varre('',0,null,OPS.fase)}
        if(fa('U2')){OPS.fase='U2 · Menu do botão direito';ui();await faseMenuDireito()}
        await pararSilencio();fecharTudo();restauraG();await garanteGerador();   // base limpa: sem ensaio, configuração de antes, gerador simulado operando
        await preparaChaves();await estabilizaHabil();   // a varredura clicou em tudo (inclusive em chaves/seletoras): volta ao ponto de partida
        if(fa('U3')){OPS.fase='U3 · Patamar guiado';ui();await fasePatamar()}
        if(fa('U4')){OPS.fase='U4 · Ensaio (velocidades)';ui();await faseEnsaioVel()}
      }else{
        OPS.fase='M · Monkey';ui();await preparaChaves();await estabilizaHabil();
        await faseMonkey(+opt.minutos||3,AV.semente);
      }
    }catch(e){
      if(e===ABORT)aviso('Dev/Operador oculto','interrompido',(OPS.motivoAbort||'pelo desenvolvedor (Parar)')+(AV.ultimoObj?' · último objeto acionado: '+AV.ultimoObj:''));
      else reg('falha','Dev/Operador oculto','erro inesperado no próprio robô',String(e&&e.stack||e).slice(0,300));
    }
    OPS.fase='D · Restaurando';ui();
    const pf=OPS.parar;OPS.parar=false;fecharTudo();await restaura(est);OPS.parar=pf;
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
      md+='\n## Cobertura e contexto\n\n- Modo do robô: **'+AV.tipo+'** · semente '+AV.semente+'\n- Tela: '+(AV.perfil.larg||'?')+'×'+(AV.perfil.alt||'?')+' px · DPR '+(AV.perfil.dpr||'?')+(AV.perfil.toque?' · toque':' · mouse')+'\n- Objetos acionados: '+AV.cob.acionados+' de '+AV.cob.total+'\n- Caixa de areia (bloqueado/contado): '+JSON.stringify(SB.c)+'\n';
      if(AV.cob.nao.length)md+='\n### Não acionados ('+AV.cob.nao.length+')\n\n'+AV.cob.nao.slice(0,120).map(x=>'- '+x).join('\n')+'\n';
      const ja=Object.entries(AV.janelas);if(ja.length)md+='\n### Onde cada janela abriu\n\n'+ja.map(([k,v])=>'- `'+k+'` em '+v.l+','+v.t+' ('+v.w+'×'+v.h+')').join('\n')+'\n';
      const ef=Object.entries(AV.efeitos);if(ef.length)md+='\n### O que cada objeto abriu\n\n'+ef.slice(0,150).map(([k,v])=>'- '+k+' → '+v).join('\n')+'\n';
    }
    return md.replace('# Operador secreto — relatório','# Dev/Operador oculto — relatório');
  }
