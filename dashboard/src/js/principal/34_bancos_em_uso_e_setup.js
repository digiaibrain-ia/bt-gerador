
/* v1.10.122: (removido) o pisca amarelo dos números das fórmulas do Setup — não ficou bom no teste do operador. */
/* ===== v1.10.125: BANCOS SÓ DE CONSULTA (BC59,5 e BC550) — inclusão VISUAL no card Banco de Cargas =====
   POR QUÊ: pedido do operador — geradores de alta potência usam até 4 bancos; melhor ter o layout pronto agora, antes de integrar.
   ESTRATÉGIA: estes bancos NÃO entram em BANCOS (que alimenta polling /api/chaves, Patamar Guiado, rodízio, Setup, somas de kW). Se entrassem, o sistema
   consultaria rotas que não existem e o Guiado poderia SUGERIR chaves sem PLC. Ficam numa lista própria, só desenhada — sem clique, sem rota, sem DB.
   Quando houver PLC/Node-RED, o banco é promovido para BANCOS (aí vale generalizar os literais '56'/'400').
   FONTE DAS CHAVES: kW de cada chave informados pelo operador (30/10/2026): BC59,5 = 5×5, 4×6, 3, 3, 2, 1, 0,5×3 (59,5 kW); BC550 = 5×5, 25, 50, 50, 100×4 (550 kW). */
(function(){
  /* v1.10.126: lista única dos bancos SÓ DE CONSULTA + seleção "Usar neste ensaio" (localStorage 'medidor.bancosUso.v1').
     window.BCONS = lista; window.bancosUso() = ids marcados. Quem consome (abas, Troca, Guiado) só DESENHA — nunca comanda. */
  const BV=[];   // v1.10.140: BC59,5/BC550 agora estão em BANCOS (bancos de verdade no Demo local) — a camada só-consulta fica vazia
  const KEY='medidor.bancosUso.v1';
  let USO=new Set();try{(JSON.parse(localStorage.getItem(KEY)||'[]')||[]).forEach(i=>{if(BV.some(b=>b.id===i))USO.add(i)})}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
  const f=n=>String(+n.toFixed(2)).replace('.',',');
  window.BCONS=BV;window.bancosUso=()=>BV.filter(b=>USO.has(b.id));window.fKwC=f;
  /* v1.10.135: toggle único (chamado daqui e também da linha "Bancos" do Patamar, ver chkBancosCons/data-gd="uc") */
  window.bancosUsoToggle=(id,on)=>{if(!BV.some(b=>b.id===id))return;on?USO.add(id):USO.delete(id);
    try{localStorage.setItem(KEY,JSON.stringify([...USO]))}catch(x){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
    const c=document.querySelector('[data-uso="'+id+'"]');if(c)c.checked=on;
    if(typeof msgGer==='function')msgGer('BC'+id+(on?' incluído no ensaio.':' retirado do ensaio.'),5000);
    document.dispatchEvent(new CustomEvent('bancosuso'))};
  const host=$('bancosVis');if(!host)return;
  host.innerHTML=BV.map(b=>{const tot=b.chaves.reduce((a,x)=>a+x,0);
    return '<details class="bkv" data-bv="'+b.id+'"><summary><b>BC'+b.id+'</b><small>'+b.chaves.length+' chaves · '+f(tot)+' kW</small>'
      +'<label title="Marcado: o banco entra no ensaio (Chaves, Troca de resistência e Patamar Guiado)."><input type="checkbox" data-uso="'+b.id+'"'+(USO.has(b.id)?' checked':'')+'> Usar neste ensaio</label>'
      +'</summary>'
      +'<div class="sw">'+b.chaves.map((kw,i)=>'<div class="tile ref" data-cons="'+b.id+'" data-j="'+i+'" title="BC'+b.id+' · chave '+(i+1)+' de '+b.chaves.length+' · '+f(kw)+' kW"><i></i>'+f(kw)+' kW</div>').join('')+'</div></details>'}).join('');
  host.addEventListener('change',e=>{const c=e.target.closest('input[data-uso]');if(!c)return;
    window.bancosUsoToggle(c.dataset.uso,c.checked)});
})();

/* ===== v1.10.126: BANCOS DE CONSULTA nos diálogos (abas Chaves, Troca de resistência, Patamar Guiado) =====
   POR QUÊ: pedido do operador — levar os 4 bancos a tudo que for necessário. ESTRATÉGIA: camada de DESENHO por cima dos diálogos existentes
   (MutationObserver reinsere os itens quando o diálogo redesenha). Não toca BANCOS/CH/DIS/KWR, não chama rota, não grava DB. */
(function(){
  const uso=()=>window.bancosUso?window.bancosUso():[];let CONS=null;
  const E=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const tot=b=>b.chaves.reduce((a,x)=>a+x,0);
  /* --- abas dos diálogos Chaves (Habilitar/Desabilitar e Setup) --- */
  const dlgs=['dlgChHD','dlgChSetup'].map(i=>$(i)).filter(Boolean);
  function painel(b){return '<div class="consp" data-consp><h4>BC'+E(b.id)+' · '+b.chaves.length+' chaves · '+window.fKwC(tot(b))+' kW <span class="enschip">só consulta</span></h4>'
    +'<div class="sw">'+b.chaves.map((kw,i)=>'<div class="tile ref" title="Chave '+(i+1)+' · '+window.fKwC(kw)+' kW"><i></i>'+window.fKwC(kw)+' kW</div>').join('')+'</div>'
    +'<p class="jnota">Banco sem PLC/Node-RED: habilitar/desabilitar, Setup (kW real) e calibração não se aplicam. Só mostra a configuração nominal das chaves.</p></div>'}
  function aplicaModo(){
    dlgs.forEach(d=>{const jb=d.querySelector('.jb.chpk');if(!jb)return;
      jb.querySelectorAll('[data-consp]').forEach(x=>x.remove());
      const b=CONS&&uso().find(x=>x.id===CONS);
      d.classList.toggle('modo-cons',!!b);
      if(b)jb.insertAdjacentHTML('beforeend',painel(b));
      d.querySelectorAll('[data-chtabs] button[data-bi]').forEach(t=>{if(b)t.classList.remove('on')});
      d.querySelectorAll('[data-chtabs] button[data-cons]').forEach(t=>t.classList.toggle('on',!!b&&t.dataset.cons===CONS))});
  }
  function injetaAbas(el){
    const u=uso();if(CONS&&!u.some(b=>b.id===CONS))CONS=null;
    el.querySelectorAll('button[data-cons]').forEach(x=>x.remove());
    u.forEach(b=>{const t=document.createElement('button');t.type='button';t.dataset.cons=b.id;
      t.innerHTML='<b>BC'+E(b.id)+'</b><small>'+window.fKwC(tot(b))+' kW · só consulta</small>';el.appendChild(t)});
    aplicaModo();
  }
  document.querySelectorAll('[data-chtabs]').forEach(el=>{
    // idempotente: só mexe nos filhos se faltar aba (evita laço do observer e corrida com o redesenho do renderTabs)
    new MutationObserver(()=>{const ids=uso().map(b=>b.id).join('|'),tem=[...el.querySelectorAll('button[data-cons]')].map(x=>x.dataset.cons).join('|');if(ids!==tem||(!ids&&false))injetaAbas(el)}).observe(el,{childList:true});
    el.addEventListener('click',e=>{
      const c=e.target.closest('button[data-cons]');
      if(c){e.stopPropagation();CONS=c.dataset.cons;aplicaModo();return}
      const bi=e.target.closest('button[data-bi]');if(bi&&CONS){CONS=null;setTimeout(()=>{aplicaModo();if(bi.isConnected)bi.classList.add('on')},0)}
    },true);
    injetaAbas(el);
  });
  /* --- Troca de resistência: sub cards extras (fechados), sem registro --- */
  const trC=$('trCorpo'),abertos=new Set();
  function injetaTroca(){
    if(!trC)return;trC.querySelectorAll('[data-trcons]').forEach(x=>x.remove());
    const ref=trC.querySelector('.gd-row');if(!ref)return;
    uso().forEach(b=>{const d=document.createElement('details');d.className='gd-bk tr-bk trcons';d.dataset.trcons=b.id;if(abertos.has(b.id))d.open=true;
      d.innerHTML='<summary><h4 style="display:inline">BC'+E(b.id)+'</h4> <small>'+b.chaves.length+' chaves · só consulta</small></summary><div class="gd-ch" style="grid-template-columns:repeat(auto-fill,minmax(64px,1fr))">'
        +b.chaves.map(kw=>'<div class="tile ref"><i></i>'+window.fKwC(kw)+' kW</div>').join('')+'</div><p class="jnota" style="padding:0 10px 8px">Sem DB de desgaste para este banco: a troca não é registrada aqui.</p>';
      d.addEventListener('click',e=>{e.stopPropagation()});   // não deixa o clique chegar no tratador do acordeão dos bancos integrados
      d.addEventListener('toggle',()=>{d.open?abertos.add(b.id):abertos.delete(b.id)});
      ref.parentNode.insertBefore(d,ref)});
  }
  if(trC){new MutationObserver(()=>{const ids=uso().map(b=>b.id).join('|'),tem=[...trC.querySelectorAll('[data-trcons]')].map(x=>x.dataset.trcons).join('|');if(ids!==tem&&trC.querySelector('.gd-row'))injetaTroca()}).observe(trC,{childList:true});injetaTroca()}
  /* --- Patamar Guiado: aviso --- */
  const mg=$('mgCorpo');
  function injetaGuiado(){
    /* v1.10.135: a pedido do operador, tirado o aviso "Manual (sem PLC)" do topo do Patamar — os 4 bancos
       agora aparecem lado a lado (checkbox na linha "Bancos", ver chkBancosCons). */
    if(!mg)return;mg.querySelectorAll('[data-guicons]').forEach(x=>x.remove());
  }
  if(mg){new MutationObserver(()=>{const tem=mg.querySelector('[data-guicons]');if(uso().length?!tem:!!tem)injetaGuiado()}).observe(mg,{childList:true});injetaGuiado()}
  document.addEventListener('bancosuso',()=>{dlgs.length&&document.querySelectorAll('[data-chtabs]').forEach(injetaAbas);injetaTroca();injetaGuiado()});
})();

/* ===== v1.10.122: link "Abrir Dados do ensaio" no Setup + RÉPLICA DAS PLACAS dos bancos de carga =====
   POR QUÊ: pedido do operador — (1) abrir os Dados do ensaio sem sair do Setup; (2) ter a placa de cada banco à mão, igual à foto.
   FONTE DOS DADOS DAS PLACAS: fotos enviadas pelo operador em 30/10/2026 (transcrição). Campo que não estava legível NÃO foi inventado (marcado com ?).
   Só informativo: não comanda PLC, não lê/grava DB e não mexe em BANCOS/chaves. */
(function(){
  try{$('stAbreDados').addEventListener('click',()=>$('bDados').click())}catch(e){ /* ignorado: elemento ausente ou sem suporte */ }
  /* cada placa: id (nome usado pelo projeto), integrado (já existe no sistema?), fab, sub, titulo, linhas [rótulo, valor, destaque?], pat */
  const PLACAS=[
    {id:'BC56',integrado:true,fab:'Eletele',sub:'',titulo:'Resistor de carga trifásica',
      l:[['Modelo','3VF56TM'],['Série','20I3649'],['Potência','56 kW',1],['Tensão trifásica','220 / 380 / 440 V'],['Tensão monofásica','220 V'],['DES. Nº','CMP-LIQ20I3649']],pat:'Patrimônio MWM'},
    {id:'BC400',integrado:true,fab:'Maginot',sub:'Proind ingeniería',titulo:'Banco de carga resistivo',
      l:[['Modelo','BC400-400-H'],['Nº RC','RC057/12'],['Serviço','PERMANENTE'],['Potência','400 kW',1],['U nom','3 × 400 V ± 5 %'],['I nom','580 A'],['Frequência','50 Hz'],['Peso','520 kg'],['Máx. alt. oper.','1000 msnm']],pat:'Patrimônio 021884'},
    {id:'BC59,5',integrado:false,fab:'Eletele',sub:'',titulo:'',
      l:[['Modelo','3VF59.5TM'],['Série','22I5799'],['Potência','59,5 kW',1],['Tensão trifásica','220 / 380 / 440 V'],['Tensão monofásica','220 V'],['DES. Nº','CMP-VF22I5799']],pat:'Patrimônio 022693'},
    {id:'BC550',integrado:false,fab:'Eletele',sub:'',titulo:'Resistor de carga com ventilação forçada',
      l:[['Série','18 1308'],['Fase','Trifásico'],['Frequência','60 Hz'],['Tensão do ventilador','380 Vac'],['Fabricação','2019'],['Tensões da carga','220 V / 380 V / 440 V'],['Potência','550 kW (em 220 / 380 / 440 V)',1],['Massa aprox.','980 kg']],pat:''}
  ];
  const E=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const g=$('plGrid');if(!g)return;
  g.innerHTML=PLACAS.map(p=>'<div class="plWrap"><div class="plTag"><b>'+E(p.id)+'</b><span>'+(p.integrado?'integrado ao sistema':'ainda não integrado')+'</span><span class="plSt'+(p.integrado?' ok':'')+'">'+(p.integrado?'em uso':'só consulta')+'</span></div>'
    +'<div class="plQ"><i class="rv"></i><i class="rv"></i><i class="rv"></i><i class="rv"></i>'
    +'<div class="fab">'+E(p.fab)+(p.sub?'<small>'+E(p.sub)+'</small>':'')+'</div>'
    +(p.titulo?'<div class="tit">'+E(p.titulo)+'</div>':'<div class="tit" style="border-top:0;padding:0;margin:4px 0"></div>')
    +p.l.map(r=>'<div class="ln'+(r[2]===1?' gr':'')+'"><span>'+E(r[0])+'</span><b>'+E(r[1])+(typeof r[2]==='string'?'<span class="ibub" tabindex="0" data-tip="'+E(r[2])+'">i</span>':'')+'</b></div>').join('')
    +(p.pat?'<div class="pat">'+E(p.pat)+'</div>':'')+'</div></div>').join('');
  $('bPlacas').addEventListener('click',e=>{e.stopPropagation();const d=$('dlgPlacas');if(!d.open)d.showModal()});
})();

/* ===== v1.9.64: nome sugerido ao imprimir / salvar PDF =====
   O Chrome usa o título da página como nome do arquivo no "Salvar como PDF": troca o título só durante a impressão. Padrão: nome_DEMO|REAL_AAAAMMDD_HHMMSS */
function seloDataHora(){const a=new Date(),p=n=>String(n).padStart(2,'0');return a.getFullYear()+p(a.getMonth()+1)+p(a.getDate())+'_'+p(a.getHours())+p(a.getMinutes())+p(a.getSeconds())}
