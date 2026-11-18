
/* ===== JANELAS FLUTUANTES ARRASTÁVEIS (pela barra de título) ===== */
(function(){
  const pos=new Map(); // lembra onde o operador deixou cada janela
  const nativoModal=HTMLDialogElement.prototype.showModal;
  const nativoShow=HTMLDialogElement.prototype.show;
  const aplica=(d,p)=>{
    if(p){d.style.position='fixed';d.style.margin='0';d.style.right='auto';d.style.bottom='auto';d.style.left=p.l+'px';d.style.top=p.t+'px'}
    else{['position','margin','right','bottom','left','top'].forEach(k=>d.style[k]='')}
  };
  HTMLDialogElement.prototype.showModal=function(){nativoModal.call(this);aplica(this,pos.get(this.id))};
  // v1.9.43: .show() (popups não-modais: Chaves/Setup/Gráfico) também lembra a posição salva, igual .showModal()
  HTMLDialogElement.prototype.show=function(){nativoShow.call(this);aplica(this,pos.get(this.id))};
  function arrastavel(d,hdr){
    hdr.title=(hdr.title||'')+(hdr.title?' · ':'')+'Arraste para mover (duplo clique volta ao centro)';
    hdr.addEventListener('dblclick',e=>{if(e.target.closest('button,input'))return;pos.delete(d.id);aplica(d,null)});
    hdr.addEventListener('pointerdown',e=>{
      if(e.button!==0||e.target.closest('button,input,select,textarea,a'))return;
      const r=d.getBoundingClientRect(),z=d.offsetWidth?r.width/d.offsetWidth:1; // z = zoom efetivo da tela
      const x0=e.clientX,y0=e.clientY,l0=r.left/z,t0=r.top/z;
      aplica(d,{l:l0,t:t0});hdr.setPointerCapture(e.pointerId);
      const mv=ev=>{
        const W=innerWidth/z,H=innerHeight/z;
        const dw=d.offsetWidth,dh=d.offsetHeight;   // v1.10.176: a janela INTEIRA fica na tela (X, título e botões do rodapé sempre alcançáveis); se for maior que a tela, alcança as duas bordas
        const l=Math.min(Math.max(l0+(ev.clientX-x0)/z,Math.min(0,W-dw)),Math.max(0,W-dw));
        const t=Math.min(Math.max(t0+(ev.clientY-y0)/z,Math.min(0,H-dh)),Math.max(0,H-dh));
        pos.set(d.id,{l,t});aplica(d,{l,t});
      };
      const up=()=>{hdr.removeEventListener('pointermove',mv);hdr.removeEventListener('pointerup',up);hdr.removeEventListener('pointercancel',up)};
      hdr.addEventListener('pointermove',mv);hdr.addEventListener('pointerup',up);hdr.addEventListener('pointercancel',up);
    });
  }
  document.querySelectorAll('dialog.jan').forEach(d=>{const h=d.querySelector('.jt');if(h)arrastavel(d,h)});
  const agua=$('dlgAgua');if(agua){const h=agua.querySelector('.dlgtop');if(h)arrastavel(agua,h)}
})();

/* ===== v1.9.43: POPUP DO GRÁFICO (não-modal, arrastável) =====
   O card "Gráfico do ensaio" (section#gra) é fisicamente movido pra dentro de #dlgGrafico ao clicar
   "⤢ Popup", e volta pro lugar de origem na tela principal quando o popup fecha. "Zoom" = clique no
   gráfico ou no botão "🔍 Zoom" alterna um tamanho maior pro popup - mesma ideia (clique amplia/reduz)
   do recurso já usado no print do SAP em "Dados de ensaio" (.sapdrop img.amp, linha ~714/2335). */
(function(){
  const gra=$('gra');if(!gra)return;
  const origPai=gra.parentElement,origProx=gra.nextElementSibling;
  const dlg=$('dlgGrafico'),corpo=$('graPopBody');
  const noPopup=()=>gra.parentElement===corpo;
  function abre(){
    corpo.appendChild(gra);
    dlg.show();
    $('graPop').textContent='⤢ Popup (aberto)';
    requestAnimationFrame(()=>{fitZoom();drawScreen()});
  }
  function volta(){
    if(!noPopup())return;
    if(origProx&&origProx.parentElement===origPai)origPai.insertBefore(gra,origProx);else origPai.appendChild(gra);
    dlg.classList.remove('ampliado');
    $('graPop').textContent='⤢ Popup';
    requestAnimationFrame(()=>{fitZoom();drawScreen()});
  }
  $('graPop').onclick=()=>{if(noPopup())dlg.close();else abre()};
  dlg.addEventListener('close',volta);
  // --w é setado inline no <dialog> (style="--w:900px"), que tem prioridade sobre a regra CSS
  // #dlgGrafico.ampliado{--w:1500px} - por isso o toggle precisa setar a variável direto via JS, não só a classe.
  function alternaZoom(){
    const amp=dlg.classList.toggle('ampliado');
    dlg.style.setProperty('--w',amp?'1500px':'900px');
    requestAnimationFrame(()=>{fitZoom();drawScreen()});
  }
  $('graZoom').onclick=alternaZoom;
  $('chart').addEventListener('click',()=>{if(noPopup())alternaZoom()});
  // obs.: o ResizeObserver que já existia em .cvw (linha ~1659) continua redesenhando o gráfico
  // sozinho quando o popup muda de tamanho (zoom/arrasto) - não precisa de outro aqui.
})();

/* ===== v1.9.80: PUBLICADOR PARA A PÁGINA DO GRÁFICO (grafico_ensaio_v0.1.html) =====
   POR QUÊ: o gráfico em janela própria (segunda tela) não lê PLC nem DSE: ele só desenha o que o medidor JÁ registra.
   Este bloco apenas COPIA para a página os pontos de C.pts + o estado do cronômetro. Somente leitura — nada aqui comanda
   chave, escreve no PLC ou muda aprovação.
   COMO FALA: (1) window.open → postMessage para a janela aberta; (2) BroadcastChannel 'bt2-grafico' (mesma origem).
   QUANDO ENVIA: só se a página mandou {k:'oi'} nos últimos 8 s (ninguém vendo = custo zero).
   SEM DUPLICAR/PERDER: cada lote leva o índice do 1º ponto ("de"); a página ignora repetidos e, se faltar pedaço, manda {k:'pede'}. */
(function(){
  const URL_PAG=(window.MENU_DEV&&MENU_DEV.arquivo('grafico'))||'grafico_ensaio_v0.9.html', NOME_JAN='bt2_grafico';
  let jan=null, canal=null, enviados=0, ultOi=0, ultEnvio=0;
  try{if('BroadcastChannel' in window)canal=new BroadcastChannel('bt2-grafico')}catch(e){ /* ignorado: navegador sem BroadcastChannel */ }
  const bt=$('graAnalisar'); if(!bt)return;

  /** Manda a mensagem pelos dois caminhos. Falha de um não derruba o outro. */
  function manda(m){
    try{if(jan&&!jan.closed)jan.postMessage(m,'*')}catch(e){ /* ignorado: janela ou canal já fechado */ }
    try{if(canal)canal.postMessage(m)}catch(e){ /* ignorado: janela ou canal já fechado */ }
  }
  /** Ponto no formato enxuto da página: só o que o gráfico usa (tensões de linha, frequência, kW). */
  const enxuga=p=>{const m=p.m||{};return{t:p.t,c:p.c,s:p.s,e:p.e,n:p.n?1:0,va:m.va==null?null:m.va,vb:m.vb==null?null:m.vb,vc:m.vc==null?null:m.vc,hz:m.hz==null?null:m.hz,kw:m.kw==null?null:m.kw}};
  /** Estado do ensaio e parâmetros (mesmas variáveis que a tela já usa: ETAPAS, T, TOL, TENS_TOL, FREQ_TOL, DADOS). */
  function estado(){
    return{par:{modo:MODO==='carga'?'carga':'iso',tol:TOL,tensTol:TENS_TOL,freqTol:FREQ_TOL},
      nominal:{tensao:(isFinite(DADOS.tensao)&&DADOS.tensao>0)?DADOS.tensao:null,freq:(isFinite(DADOS.freq)&&DADOS.freq>0)?DADOS.freq:null},
      etapas:ETAPAS.map(e=>({alvo:e.alvo,min:e.min,nome:e.nome})),plano:geom(),crit:{t100:T100_MIN,stby:STBY_MIN},
      et:T.et,el:T.el,cron:cronAtual(),iniciado:!!T.started,run:!!T.run,fim:!!T.fim,t:C.t};
  }
  /** Envia o que falta (e o estado, no mínimo 1×/s para o cronômetro andar mesmo sem ponto novo). */
  function envia(forca){
    const agora=Date.now();
    if(C.pts.length<enviados){manda({k:'reset'});enviados=0}          // ensaio zerado no medidor: página recomeça
    const novos=C.pts.length>enviados;
    if(!novos&&!forca&&agora-ultEnvio<1000)return;
    manda({k:'lote',de:enviados,pts:C.pts.slice(enviados).map(enxuga),estado:estado()});
    enviados=C.pts.length;ultEnvio=agora;
  }
  const ouvindo=()=>Date.now()-ultOi<8000;

  function recebe(m){
    if(!m||typeof m!=='object')return;
    if(m.k==='oi'){ultOi=Date.now()}
    else if(m.k==='pede'){ultOi=Date.now();enviados=0;envia(true)}      // página nova (ou com falha): manda tudo desde o início
  }
  if(canal)canal.onmessage=ev=>recebe(ev.data);
  window.addEventListener('message',ev=>{if(jan&&ev.source===jan)recebe(ev.data)});

  window.GRAF_PUB={tick(){if(ouvindo())envia(false)},marco(rotulo){if(ouvindo())manda({k:'marco',t:C.t,rotulo:String(rotulo||'')})}, // v1.9.81: risco vertical no gráfico
    _estado:()=>({enviados,ouvindo:ouvindo(),jan:!!(jan&&!jan.closed)})};
  bt.onclick=()=>{
    try{jan=window.abreEmb(window.EMB&&window.EMB.grafico,NOME_JAN,'popup=yes,width=1280,height=860','grafico')||window.open(URL_PAG,NOME_JAN,'popup=yes,width=1280,height=860')}catch(e){jan=null}   // v1.9.97: página embutida (sem arquivo vizinho)
    if(!jan)alert('O navegador bloqueou a janela do gráfico. Permita pop-ups para esta página e clique de novo.');
  };
})();

/* ===== RECOLHER / EXPANDIR CARDS ===== */
(function(){
  const KEY='medidor.cardsRecolhidos';
  let salvos=[];try{salvos=JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
  document.querySelectorAll('.panel').forEach(p=>{
    const h=p.querySelector(':scope>.hrow, :scope>h2:first-child');if(!h)return; // a Simulação (só demo) não tem título
    h.classList.add('ph');h.tabIndex=0;h.setAttribute('role','button');
    const set=min=>{p.classList.toggle('min',min);h.setAttribute('aria-expanded',!min);h.title=p.id==='reg'?(min?'Clique para ver todos os parâmetros':'Clique para mostrar só o resumo (degrau, status e carga real)'):(min?'Clique para expandir':'Clique para recolher')};
    // v1.9.74: a pedido do desenvolvedor (23/10/2026) o card "Cargas · banco de carga" (#bco) agora sempre NASCE ABERTO, com as
    // chaves visíveis (inclusive no Demo 100% local), independente do que foi salvo — antes (v1.9.29) nascia sempre recolhido.
    // Dá para recolher à mão durante a sessão; os demais painéis continuam lembrando o último estado normalmente.
    set(p.id==='bco'?false:(p.id==='reg'?true:salvos.includes(p.id)));   // v1.10.151: o Registro nasce COMPACTO (degrau, status e carga real); clique no título alterna compacto/completo
    const alterna=()=>{
      set(!p.classList.contains('min'));
      try{localStorage.setItem(KEY,JSON.stringify([...document.querySelectorAll('.panel.min')].map(x=>x.id)))}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
      fitZoom();drawScreen();
    };
    // v1.10.113: botões/campos dentro da faixa do título (Analisar, Popup, Patamar, Grandezas...) NÃO recolhem o card: só o clique na faixa em si.
    const noControle=e=>{const c=e.target.closest&&e.target.closest('button,a,input,select,label,[role=button]');return !!c&&c!==h};
    h.onclick=e=>{if(noControle(e))return;alterna()};
    h.onkeydown=e=>{if(noControle(e))return;if(e.key==='Enter'||e.key===' '){e.preventDefault();alterna()}};
  });
})();

/* ===== v1.9.33: POPUP "MODO DE OPERAÇÃO" (reúne tipo de ensaio, salvamento, gráfico e modo do Node-RED) ===== */
(function(){
  // o seletor Manual/Automático do Node-RED sai da barra e vem pra cá (mesmos ids: a lógica existente continua valendo)
  const seg=document.querySelector('#ensbar .ensseg');if(seg)$('mdNode').appendChild(seg);
  const rotulo=()=>{
    const t=MODO==='carga'?'Livre':'Guiado';
    $('bModo').textContent='⚙ Modo: '+t+(MODO==='carga'?'':' · '+(PORPAT?'salva por patamar':salvarManual?'salva manual':'salva auto'))+(GRAF_MODO==='off'?' · sem gráfico':GRAF_MODO==='classico'?' · gráfico relógio':'');
  };
  const marca=()=>{
    [...$('mdTipo').children].forEach(b=>{b.classList.toggle('on',b.dataset.m===MODO);b.disabled=travaTipo()||genLigado()});
    $('mdTipoNota').textContent=MODO==='carga'?'Livre: só acompanha as medições com cronômetro livre. Não tem etapas, não salva nada no PLC.'
      :'Guiado: segue as etapas (carga alvo, estabilidade e tempo) e registra cada uma.';
    if(genLigado())$('mdTipoNota').textContent+=' · '+MSG_GEN_LIGADO;
    else if(travaTipo())$('mdTipoNota').textContent+=' · Para trocar o tipo, finalize/grave ou PARE o ensaio.';
    [...$('mdSalva').children].forEach(b=>{const v=b.dataset.v;b.classList.toggle('on',v==='P'?PORPAT:(!PORPAT&&(v==='1')===salvarManual));b.disabled=MODO==='carga'||genLigado()});
    $('mdSalvaNota').textContent=PORPAT?'Por patamar: a etapa é salva e o ensaio avança sozinho ao cumprir o tempo. Cada patamar (Patamar Guiado) escolhe como as chaves entram: Manual (o operador aplica a sugestão) ou Auto.'
      :salvarManual?'Manual: o operador clica em SALVAR para gravar cada etapa e avançar.':'Automático: a etapa é gravada e avança sozinha ao fim do tempo.';
    [...$('mdGra').children].forEach(b=>b.classList.toggle('on',b.dataset.v===GRAF_MODO));
    $('mdGraNota').textContent=GRAF_MODO==='off'?'Sem gráfico: o card some da tela; o registro continua (relatório/exportação usam o de tempo de ensaio).'
      :GRAF_MODO==='ensaio'?'Tempo de ensaio: eixo = cronômetro. Só aparece o que foi contado; pausa, STOP do gerador, ajuste/estabilização e ZERAR de degrau não deixam marca.'
      :'Relógio (clássico, v1.9.32): eixo = tempo real, com faixas amarelas de ajuste/estabilização e cinza de pausa.';
    rotulo();
  };
  const aplicaGrafico=()=>{const g=$('gra');if(g)g.style.display=GRAF_MODO==='off'?'none':'';try{fitZoom();drawScreen()}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }};
  $('mdTipo').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled||b.dataset.m===MODO||genLigado())return;
    const p=Object.assign(paramAtuais(),{modo:b.dataset.m});
    if(T.fim&&T.gravado)novoEnsaio();
    aplicaParametros(p);
    try{localStorage.setItem('medidor.params',JSON.stringify(p))}catch(x){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
    marca()});
  $('mdSalva').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;window.__setSalvaModo(b.dataset.v==='P'?'P':b.dataset.v==='1'?'M':'A');marca()});
  try{new MutationObserver(()=>document.querySelectorAll('#dlgModo [data-nota]').forEach(x=>{const p=$(x.dataset.nota);x.dataset.tip=p?p.textContent:''})).observe($('dlgModo'),{childList:true,characterData:true,subtree:true})}catch(e){ /* ignorado: API opcional do navegador */ }   // v1.10.120: o texto de cada nota alimenta o ícone i
  $('mdGra').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;GRAF_MODO=b.dataset.v;try{localStorage.setItem('medidor.graficoModo',GRAF_MODO)}catch(x){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }aplicaGrafico();marca()});
  $('bModo').onclick=()=>{marca();$('dlgModo').showModal()};
  window.__marcaModo=marca;
  aplicaGrafico();marca();
  // o card do gráfico nasce recolhido (a pedido do operador), independente do estado salvo
  const gp=$('gra');if(gp&&!gp.classList.contains('min')){gp.classList.add('min');const h=gp.querySelector(':scope>.hrow, :scope>h2:first-child');if(h){h.setAttribute('aria-expanded','false');h.title='Clique para expandir'}}
})();
