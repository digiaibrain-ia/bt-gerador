/* ===== v1.10.103: EXPORTAR ▾ — um botão só com TXT / Markdown / PDF (onde fizer sentido) =====
   Por quê: economizar espaço (antes cada janela tinha "Imprimir / PDF" e, em alguns cards, outros botões soltos). JSON NÃO entra aqui:
   é formato de máquina e fica separado, onde for necessário. Funcionamento: EXPO.menu(botão,[{rot,fn},…]) abre um pequeno menu embaixo do botão. */
const EXPO=(function(){
  let m=null;
  const fecha=()=>{if(m){try{if(m.matches(':popover-open'))m.hidePopover()}catch(e){}m.remove();m=null}document.removeEventListener('pointerdown',fora,true);document.removeEventListener('keydown',tecla,true)};
  const fora=e=>{if(m&&!m.contains(e.target))fecha()};
  const tecla=e=>{if(e.key==='Escape')fecha()};
  function menu(btn,itens){
    fecha();m=document.createElement('div');m.className='expmenu';m.setAttribute('role','menu');
    itens.forEach(it=>{if(it==='-'){m.appendChild(document.createElement('hr'));return}const b=document.createElement('button');b.type='button';b.setAttribute('role','menuitem');b.innerHTML=it.rot+(it.dica?'<small>'+it.dica+'</small>':'');
      b.onclick=()=>{fecha();try{it.fn()}catch(e){console.error('Exportar',e);if(typeof msgGer==='function')msgGer('Não foi possível exportar: '+(e&&e.message||e),8000)}};m.appendChild(b)});
    m.setAttribute('popover','manual');document.body.appendChild(m);try{m.showPopover()}catch(e){}  // v1.10.107: popover = camada de cima do navegador (acima dos <dialog> modais)
    const r=btn.getBoundingClientRect();
    m.style.left=Math.max(4,Math.min(r.left,innerWidth-m.offsetWidth-8))+'px';
    m.style.top=Math.min(r.bottom+2,innerHeight-m.offsetHeight-8)+'px';
    setTimeout(()=>{document.addEventListener('pointerdown',fora,true);document.addEventListener('keydown',tecla,true)},0);
    const p=m.querySelector('button');if(p)p.focus();
  }
  const demoTxt=()=>($('demo')&&$('demo').checked)?'SIMULAÇÃO (DEMO)':'DADOS REAIS';
  const cab=tit=>tit+'\nGerado em '+new Date().toLocaleString('pt-BR')+' · Medidor do Gerador v'+VERSAO+' · '+demoTxt();
  /** Tabela (cabeçalhos + linhas de texto) -> TXT com colunas alinhadas. */
  function tabTxt(tit,cabec,linhas){
    const w=cabec.map((c,i)=>Math.min(46,Math.max(c.length,...linhas.map(l=>String(l[i]==null?'':l[i]).length))));
    const f=(l)=>l.map((v,i)=>{const t=String(v==null?'':v).replace(/\s+/g,' ');return i===l.length-1?t:t.padEnd(w[i])}).join('  ').replace(/\s+$/,'');   // última coluna sem corte: nada de texto se perde
    return cab(tit)+'\n\n'+f(cabec)+'\n'+w.map(n=>'-'.repeat(n)).join('  ')+'\n'+linhas.map(f).join('\n')+'\n';
  }
  /** Tabela -> Markdown (tabela com barras). */
  function tabMd(tit,cabec,linhas){
    const e=v=>String(v==null?'':v).replace(/\|/g,'\\|').replace(/\s+/g,' ');
    return '# '+tit+'\n\n_'+cab('').trim().replace(/\n/g,' ')+'_\n\n| '+cabec.map(e).join(' | ')+' |\n|'+cabec.map(()=>' --- ').join('|')+'|\n'+linhas.map(l=>'| '+l.map(e).join(' | ')+' |').join('\n')+'\n';
  }
  /** Lê uma <table> do DOM (as linhas visíveis) -> {cabec,linhas}. */
  function lerTabela(t){
    const cabec=[...t.querySelectorAll('thead th')].map(x=>x.textContent.trim());
    const linhas=[...t.querySelectorAll('tbody tr')].filter(r=>r.offsetParent!==null||r.getClientRects().length).map(r=>[...r.children].map(c=>c.textContent.trim()));
    return{cabec,linhas};
  }
  const baixaTxt=(base,ext,txt)=>baixa(new Blob(['\ufeff'+txt],{type:(ext==='md'?'text/markdown':'text/plain')+';charset=utf-8'}),nomeArq(base,ext));
  /** Monta os 3 itens padrão (TXT, MD, PDF) para uma tabela. dados():{cabec,linhas}; pdf():função que imprime. */
  function itensTabela(tit,base,dados,pdf){
    return[
      {rot:'Texto (.txt)',dica:'simples, para colar em e-mail ou conversa',fn:()=>{const d=dados();baixaTxt(base,'txt',tabTxt(tit,d.cabec,d.linhas))}},
      {rot:'Markdown (.md)',dica:'tabela formatada, para documentação',fn:()=>{const d=dados();baixaTxt(base,'md',tabMd(tit,d.cabec,d.linhas))}},
      {rot:'PDF (imprimir)',dica:'abre a impressão do navegador — escolha “Salvar como PDF”',fn:pdf}
    ];
  }
  return{menu,cab,tabTxt,tabMd,lerTabela,baixaTxt,itensTabela,demoTxt};
})();

function imprimeComNome(nome,classe){
  const tit0=document.title;let feito=false;
  const fim=()=>{if(feito)return;feito=true;document.title=tit0;if(classe)document.body.classList.remove(classe);window.removeEventListener('afterprint',fim)};
  document.title=nome;if(classe)document.body.classList.add(classe);
  window.addEventListener('afterprint',fim);
  try{window.print()}finally{setTimeout(fim,2000)}
}

/* ===== v1.9.63: JANELA DE LOGS (padrão jan, não-modal, arrastável) =====
   Lê GET /api/logs/{56|400} do Node-RED das chaves (URL = a do "⚙ Servidor" do Banco de Carga).
   Termos: "dialog" = janela sobre a tela; "fetch" = pedido HTTP ao Node-RED; "flow" = conjunto de nós do Node-RED. */
(function(){
  const dlg=$('dlgLogs');if(!dlg)return;
  let banco=BANCOS_PLC[0].id,tmr=null,busy=false;
  $('logBanco').innerHTML=BANCOS_PLC.map(b=>'<button type="button" data-b="'+b.id+'">BC'+b.id+'</button>').join('');   // v1.10.156
  try{const b=localStorage.getItem('medidor.logBanco');if(BANCOS_PLC.some(x=>x.id===b))banco=b;$('logAuto').checked=localStorage.getItem('medidor.logAuto')==='1'}catch(e){}
  const base=()=>((window.CH_SRV&&window.CH_SRV.url)||'').trim();
  const hora=d=>d.toLocaleTimeString('pt-BR');
  const aviso=(cls,html)=>{const a=$('lgAviso');a.className='lgaviso '+cls;a.innerHTML=html;a.hidden=!html};
  const stats=(j)=>{
    const st=(l,v,bad)=>`<div class="lgst"><small>${l}</small><b${bad?' class="bad"':''}>${v}</b></div>`;
    $('logResumo').innerHTML=j?st('Registros',j.total)+st('Com falha',j.falhas,j.falhas>0)+st('Tempo médio (ms)',j.msMedio)+st('Máximo (ms)',j.msMax):'';
  };
  const vazio=(t)=>{const v=$('lgVazio');v.textContent=t||'';v.hidden=!t};
  function marcaBanco(){dlg.querySelectorAll('#logBanco button').forEach(b=>b.classList.toggle('on',b.dataset.b===banco))}
  function tag(){const u=base();$('lgTag').textContent=u?u.replace(/^https?:\/\//,''):'sem URL'}
  async function carrega(manual){
    if(busy)return;busy=true;
    const btn=$('logAtualiza'),st=$('lgStatus'),tb=$('logCorpo'),b=banco;
    tag();btn.disabled=true;if(manual)btn.textContent='Atualizando…';st.textContent='Consultando o Node-RED…';
    const fim=(txt)=>{st.textContent=txt;st.classList.remove('flash');void st.offsetWidth;st.classList.add('flash')};
    try{
      if(!base()){
        tb.innerHTML='';stats(null);
        aviso('warn','<b>Falta a URL do Node-RED das chaves.</b> Abra o botão Demo (no topo, pede a senha), preencha o campo Servidor e volte aqui.');
        vazio('');fim('Sem URL — '+hora(new Date()));return;
      }
      const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),5000);
      let r,j;
      try{r=await fetch(base()+'/api/logs/'+rotaDe(b)+'?limit='+$('logLimit').value,{cache:'no-store',signal:ctl.signal});j=await r.json().catch(()=>null)}
      catch(e){throw new Error(e&&e.name==='AbortError'?'o Node-RED não respondeu em 5 s':'Node-RED fora do ar ou sem rede ('+(e&&e.message||'falha')+')')}
      finally{clearTimeout(t)}
      if(!r.ok)throw new Error('HTTP '+r.status+(r.status===404?' — a rota /api/logs/'+b+' não existe: importe o flow v2.4 deste banco (apague antes as abas antigas)':(j&&j.erro?': '+j.erro:'')));
      if(!j||!Array.isArray(j.logs))throw new Error('resposta do Node-RED sem a lista de logs');
      stats(j);
      const logs=j.logs.slice().sort((x,y)=>new Date(y.t)-new Date(x.t));
      tb.innerHTML=logs.map(x=>`<tr class="${x.ok?'':'lgerr'}"><td>${esc(hora(new Date(x.t)))}</td><td>${esc(x.rota)}</td><td>${esc(x.dado)}</td><td>${esc(x.ms)}</td><td class="${x.ok?'lgok':'lgno'}">${x.ok?'OK':'ERRO '+esc(x.status)}</td><td>${esc(x.erro)}</td></tr>`).join('');
      const posts=(window.CH_POSTS&&window.CH_POSTS[b])||0;
      if(j.flow==null)aviso('err','<b>O Node-RED respondeu com um flow ANTIGO neste banco (sem o campo “flow”).</b> Se o log está vazio mesmo com comandos enviados, uma aba antiga/duplicada está respondendo as rotas. No Node-RED: apague <b>todas</b> as abas “Chaves BC… (API)” e importe a v2.3 deste banco; depois Deploy.');
      else if(posts>0&&j.total===0)aviso('warn','<b>Esta tela enviou '+posts+' comando(s) ao BC'+esc(b)+', mas o log do Node-RED está vazio.</b> Normalmente é aba duplicada/antiga respondendo antes da v2.2 — ou o Node-RED reiniciou/recebeu Deploy depois dos comandos (o log zera). Se não reiniciou, apague as abas antigas.');
      else if(j.falhas>0)aviso('warn','<b>'+j.falhas+' registro(s) com falha.</b> Veja a coluna Erro.');
      else aviso('','');
      vazio(logs.length?'':(posts>0?'':'Nenhum registro ainda. Acione uma chave (ou use Setup/Habilitar) e clique em Atualizar — leituras que deram certo não entram no log.'));
      fim('Atualizado às '+hora(new Date())+' · '+logs.length+' registro(s) listado(s)');
    }catch(e){
      tb.innerHTML='';stats(null);vazio('');
      aviso('err','<b>Não consegui ler o log do BC'+esc(b)+':</b> '+esc(e.message));
      fim('Falhou às '+hora(new Date()));
    }finally{busy=false;btn.disabled=false;btn.textContent='Atualizar'}
  }
  function auto(){clearInterval(tmr);tmr=null;if(dlg.open&&$('logAuto').checked)tmr=setInterval(()=>carrega(false),3000)}
  $('bLogs').addEventListener('click',()=>{ // abre/fecha (não-modal: dá para clicar nas chaves com o log aberto)
    if(dlg.open){dlg.close();return}
    marcaBanco();tag();dlg.show();carrega(true);auto();
  });
  $('logAtualiza').addEventListener('click',()=>carrega(true));
  $('logBanco').addEventListener('click',e=>{const b=e.target.closest('button[data-b]');if(!b||b.dataset.b===banco)return;banco=b.dataset.b;try{localStorage.setItem('medidor.logBanco',banco)}catch(x){}marcaBanco();carrega(true)});
  $('logLimit').addEventListener('change',()=>carrega(true));
  $('logAuto').addEventListener('change',()=>{try{localStorage.setItem('medidor.logAuto',$('logAuto').checked?'1':'0')}catch(x){}auto()});
  dlg.addEventListener('close',()=>{clearInterval(tmr);tmr=null});
  $('logImprime').addEventListener('click',e=>{ // v1.10.103: Exportar ▾ (TXT / MD / PDF)
    const tit='Log da comunicação das chaves — BC'+banco;
    EXPO.menu(e.currentTarget,EXPO.itensTabela(tit,'log_chaves_BC'+banco,()=>EXPO.lerTabela($('logTab')),()=>{
      $('lgPrt').textContent=tit+' — gerado em '+new Date().toLocaleString('pt-BR')+' — Medidor do Gerador v'+VERSAO;
      imprimeComNome('log_chaves_BC'+banco+'_REAL_'+seloDataHora(),'prLogs'); // v1.9.64: o log vem sempre do Node-RED/PLC real
    }));
  });
  marcaBanco();
})();
