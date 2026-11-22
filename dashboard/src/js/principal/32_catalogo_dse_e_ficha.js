




/* ===== v1.9.82: CATÁLOGO DE MODELOS DSE (módulo compartilhado) =====
   PARA QUE SERVE (equipe não técnica): lista os modelos de gerador/controlador DSE que a engenharia já extraiu dos arquivos .dse
   (catalogo_dse_v0.1.py gera o .csv). O operador digita parte do nome ("40 kva 220 mwm"), clica no modelo e os campos são preenchidos.
   POR QUE .csv: para incluir modelo novo basta gerar o .csv de novo e carregar aqui — sem mexer no código.
   ONDE É USADO: janela "Dados do ensaio" (preenche Hz/V/Controlador) e janela "Manual guiado" (kW a 100 %).
   GUARDA no navegador (localStorage 'medidor.catalogo.v1') só os campos usados, para não pedir o .csv a cada dia. Se o navegador
   recusar (modo privado/cheio), o catálogo vale só até recarregar a página. NÃO comanda nada. */
window.CATDSE=(function(){
  const LS='medidor.catalogo.v1',CAMPOS=['familia_zip','pasta_modelo','arquivo','ctrl_codigo','ctrl_descricao','kVA_nome','Hz_nome','V_nome','V_ff_comentario','Hz_xml','kW_xml','alerta'];
  let L=[];const vistas=[];
  const norm=t=>String(t==null?'':t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const prep=m=>{m._h=norm([m.pasta_modelo,m.arquivo,m.familia_zip,m.kVA_nome+' kva',m.V_nome+' v',m.Hz_nome+' hz',m.ctrl_descricao].join(' '));return m};
  /** Lê o texto do .csv (separador ';' ou ','; aspas; BOM). Devolve lista de objetos {coluna:valor}. */
  function csv(txt){
    txt=txt.replace(/^﻿/,'');const l0=txt.split('\n')[0],sep=(l0.match(/;/g)||[]).length>(l0.match(/,/g)||[]).length?';':',';
    const Ls=[];let c='',r=[],q=false;
    for(let i=0;i<txt.length;i++){const ch=txt[i];
      if(q){if(ch==='"'){if(txt[i+1]==='"'){c+='"';i++}else q=false}else c+=ch}
      else if(ch==='"')q=true;else if(ch===sep){r.push(c);c=''}else if(ch==='\n'){r.push(c.replace(/\r$/,''));Ls.push(r);r=[];c=''}else c+=ch}
    if(c||r.length){r.push(c);Ls.push(r)}
    const h=Ls.shift();return Ls.filter(x=>x.length===h.length).map(x=>Object.fromEntries(h.map((k,i)=>[k,x[i]])));
  }
  function carrega(txt){
    const lista=csv(txt);if(!lista.length||!('arquivo' in lista[0]))throw new Error('o arquivo não tem a coluna "arquivo" — é o catalogo_modelos_*.csv?');
    L=lista.map(m=>prep(Object.fromEntries(CAMPOS.map(k=>[k,m[k]==null?'':m[k]]))));
    try{localStorage.setItem(LS,JSON.stringify(L.map(m=>CAMPOS.map(k=>m[k]))))}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }
    vistas.forEach(v=>v.refresh());return L.length;
  }
  try{const j=JSON.parse(localStorage.getItem(LS)||'null');if(Array.isArray(j))L=j.map(a=>prep(Object.fromEntries(CAMPOS.map((k,i)=>[k,a[i]]))))}catch(e){L=[]}
  /** Todos os termos digitados precisam aparecer (E). Termo vazio = tudo. */
  const busca=q=>{const t=norm(q).split(/\s+/).filter(Boolean);return t.length?L.filter(m=>t.every(x=>m._h.includes(x))):L};
  const num=v=>{const n=parseFloat(String(v).replace(',','.'));return isFinite(n)?n:null};
  /** Desenha o seletor dentro de "host" (elemento FIXO, nunca re-renderizado). opc.aoEscolher(modelo). */
  function monta(host,opc){
    host.innerHTML='<div class="cat-i" data-c="m">Nenhum gerador escolhido — digite abaixo parte do nome (ex.: 260 220 60).</div><div class="cat-i" data-c="aviso"></div><div class="cat-b cat-busca"><label>Catálogo (.csv) <input type="file" accept=".csv,text/csv" data-c="f"></label><input type="search" data-c="q" placeholder="digite parte do nome: 40 kva 220 mwm…" autocomplete="off"><span class="cat-i" data-c="n"></span></div><div class="cat-l" data-c="l" hidden></div>';   /* v1.10.0: ficha (m) no topo; busca e lista ficam abaixo e somem depois de escolher */
    const q=host.querySelector('[data-c=q]'),l=host.querySelector('[data-c=l]'),n=host.querySelector('[data-c=n]'),m=host.querySelector('[data-c=m]'),av=host.querySelector('[data-c=aviso]'),f=host.querySelector('[data-c=f]');   // v1.10.217: av = mensagens do catalogo (nao apagam a ficha)
    let achados=[];
    const refresh=()=>{
      achados=busca(q.value);
      n.textContent=L.length?(q.value.trim()?achados.length+' de '+L.length+' modelos':L.length+' modelos no catálogo — digite para filtrar'):'Sem catálogo: carregue o .csv.';
      const ver=L.length&&(q.value.trim()||false);l.hidden=!ver;
      l.innerHTML=ver?achados.slice(0,60).map((x,i)=>'<button type="button" data-i="'+i+'">'+esc(x.pasta_modelo+' · '+x.arquivo)+'<small>'+esc(x.kVA_nome+' kVA · '+x.V_nome+' V · '+x.Hz_nome+' Hz')+'</small></button>').join('')+(achados.length>60?'<div class="cat-i" style="padding:3px 8px">Mostrando 60 de '+achados.length+' — digite mais termos para refinar.</div>':'')+(achados.length?'':'<div class="cat-i" style="padding:3px 8px">Nenhum modelo com esses termos.</div>'):'';
    };
    const escolhe=x=>{if(!x)return;m.textContent='';l.querySelectorAll('button').forEach(b=>b.classList.toggle('on',achados[+b.dataset.i]===x));if(opc&&opc.aoEscolher)opc.aoEscolher(x);q.value='';refresh()};   // v1.10.0: limpa a busca (a lista some junto)
    host.addEventListener('click',e=>{if(e.target.closest('[data-c=troca]')){host.classList.remove('escolhido');q.focus()}});
    q.addEventListener('input',refresh);
    q.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();escolhe(achados[0])}});   // Enter = primeiro da lista
    l.addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(b)escolhe(achados[+b.dataset.i])});
    f.addEventListener('change',()=>{const a=f.files[0];if(!a)return;const r=new FileReader();
      r.onload=()=>{try{const k=carrega(String(r.result));av.textContent='Catálogo carregado: '+k+' modelos (guardado neste navegador).'}catch(x){av.textContent='Não consegui ler o catálogo: '+x.message}};r.readAsText(a)});
    const v={refresh,msg:t=>{av.textContent=t}};/*v1.10.217: antes escrevia em m e apagava a ficha e o Trocar gerador*/vistas.push(v);refresh();return v;
  }
  return{monta,carrega,busca,num,tamanho:()=>L.length,avisa:t=>vistas.forEach(v=>v.msg(t))};
})();
/* v1.10.124: CATÁLOGO AUTOMÁTICO. Quando a página é servida por http(s) (ex.: pelo Node-RED), procura o catalogo_modelos_v0.1.csv na MESMA pasta
   do HTML e atualiza sozinho. POR QUÊ: pedido do operador (não ter que escolher o arquivo toda vez). LIMITE: aberta como arquivo (file://) o navegador
   NÃO deixa a página ler outro arquivo do disco — aí vale o botão "Escolher arquivo". Falha em silêncio (não gera erro nem aviso). */
(async()=>{
  if(!/^https?:$/.test(location.protocol))return;
  for(const u of ['catalogo_modelos_v0.1.csv','CATALOGO_GERADORES_v0.1/catalogo_modelos_v0.1.csv']){
    try{const r=await fetch(u,{cache:'no-cache'});if(!r.ok)continue;const k=window.CATDSE.carrega(await r.text());window.CATDSE.avisa('Catálogo atualizado sozinho ('+u+'): '+k+' modelos.');return}catch(e){ /* ignorado: sondagem opcional: a próxima tentativa refaz */ }
  }
})();

/* v1.10.0: TABELA DE POTÊNCIA DE GERADORES (60 Hz) da empresa (foto 28/10/2026; arquivo claude/TABELA_POTENCIA_GERADORES_60HZ_v0.1.md).
   Regra da própria tabela: kW = kVA × 0,8 (este kW é o de 110 %); 100 % = kW ÷ 1,1; 30/50/107 % = frações do 100 %. Colunas: [kW, 30 %, 50 %, 100 %, 107 %, 110 %]. */
window.TAB60={12.5:[10,2.7,4.5,9.1,9.7,10],15.5:[12.4,3.4,5.6,11.3,12.1,12.4],22:[17.6,4.8,8,16,17.1,17.6],27.5:[22,6,10,20,21.4,22],40:[32,8.7,14.5,29.1,31.1,32],53:[42.4,11.6,19.3,38.5,41.2,42.4],55:[44,12,20,40,42.8,44],75:[60,16.4,27.3,54.5,58.4,60],85:[68,18.5,30.9,61.8,66.1,68],100:[80,21.8,36.4,72.7,77.8,80],125:[100,27.3,45.5,90.9,97.3,100],150:[120,32.7,54.5,109.1,116.7,120],170:[136,37.1,61.8,123.6,132.3,136],200:[160,43.6,72.7,145.5,155.6,160],260:[208,56.7,94.5,189.1,202.3,208],315:[252,68.7,114.5,229.1,245.1,252],360:[288,78.5,130.9,261.8,280.1,288],400:[320,87.3,145.5,290.9,311.3,320],450:[360,98.2,163.6,327.3,350.2,360],500:[400,109.1,181.8,363.6,389.1,400],550:[440,120,200,400,428,440],625:[500,136.4,227.3,454.5,486.4,500],650:[520,141.8,236.4,472.7,505.8,520],680:[544,148.4,247.3,494.5,529.2,544],720:[576,157.1,261.8,523.6,560.3,576],750:[600,163.6,272.7,545.5,583.6,600],770:[616,168,280,560,599.2,616],800:[640,174.5,290.9,581.8,622.5,640],1250:[1000,272.7,454.5,909.1,972.7,1000]};
/** kW a 100 % do modelo: tabela 60 Hz (se o kVA está nela e o modelo é 60 Hz); senão kW do catálogo (.dse). Devolve {kw, origem, kwDse, difere}. */
window.potModelo=function(m){
  if(!m)return null;const kva=parseFloat(String(m.kVA_nome!=null?m.kVA_nome:m.kVA).replace(',','.')),hz=Math.round(parseFloat(m.Hz_xml!=null?m.Hz_xml:m.Hz)),dse=window.CATDSE.num(m.kW_xml!=null?m.kW_xml:m.kW)||0;
  const r=window.TAB60[kva];
  if(r&&hz===60)return{kw:r[3],origem:'tabela de potência 60 Hz',kwDse:dse,difere:dse>0&&Math.abs(dse-r[3])>0.6};
  return{kw:dse,origem:dse>0?'catálogo (.dse)'+(hz===60?' — kVA fora da tabela':' — tabela é só 60 Hz'):'sem dado',kwDse:dse,difere:false};
};

/* v1.9.82: modelo do DSE escolhido no catálogo -> preenche Frequência, Tensão e Controlador (Fabricante/Modelo) em "Dados do ensaio".
   Potência (kW) só se estiver VAZIA: o kW do .dse ainda não está confirmado como o "100 %" do ensaio (vira dica). Não comanda nada. */
/** Ficha do gerador escolhido (sobe para o topo do sub card; a busca some). Usada ao escolher e ao recarregar a página. */
window.fichaModelo=function(d){
  const box=$('dCat'),f=box.querySelector('[data-c=m]');if(!f||!d)return;
  const kw=window.CATDSE.num(d.kW),dse=window.CATDSE.num(d.kWdse),dif=dse>0&&kw>0&&Math.abs(dse-kw)>0.6,fm=v=>String(v).replace('.',',');
  f.innerHTML='<div class="cat-ficha"><b>'+esc(d.kVA)+' kVA</b><b>'+esc(d.V)+' V</b><b>'+esc(String(Math.round(+d.Hz)))+' Hz</b><b>100 % = '+(kw>0?fm(kw):'?')+' kW</b>'
   +'<span>'+esc(d.arquivo||'')+'</span><span>Origem do kW a 100 %: '+esc(d.origemKw||'catálogo')+(dif?' · <u>⚠ o .dse diz '+fm(dse)+' kW — conferir com a engenharia</u>':'')+'</span>'
   +'<button type="button" class="bt s" data-c="troca">Trocar gerador</button></div>';
  box.classList.add('escolhido');
};
window.CATDSE.monta($('dCat'),{aoEscolher:m=>{
  const pm=window.potModelo(m);window.DADOS_MODELO={arquivo:m.arquivo,pasta:m.pasta_modelo,kVA:m.kVA_nome,V:m.V_nome,Hz:m.Hz_xml,kW:(pm&&pm.kw>0?pm.kw:m.kW_xml),kWdse:m.kW_xml,origemKw:pm?pm.origem:'',vFF:m.V_ff_comentario};try{localStorage.setItem('medidor.modeloEscolhido',JSON.stringify(window.DADOS_MODELO))}catch(x){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ } // v1.9.87: o Manual guiado só LÊ isto (a escolha do modelo é feita só aqui)
  const set=(id,v)=>{const el=$(id);if(!el||v==null||v==='')return;el.value=v;el.classList.remove('duv');el.dispatchEvent(new Event('input',{bubbles:true}))};
  const nz=v=>{const n=window.CATDSE.num(v);return n==null?'':String(n)};
  set('dFreq',nz(m.Hz_xml)||nz(m.Hz_nome));set('dTens',nz(m.V_nome)||nz(m.V_ff_comentario));
  const kw=nz(window.DADOS_MODELO.kW);if(kw){const ant=$('dPot').value.trim();set('dPot',kw);window.__potAnterior=ant&&ant!==kw?ant:''}   // v1.9.99: o modelo escolhido manda na Potência (antes só preenchia se vazia)
  const ctrl=i=>$('dEquip').querySelector('input[data-r="2"][data-c="'+i+'"]');   // linha 2 = Controlador
  if(ctrl(1)&&ctrl(2)){ctrl(1).value='Deep Sea';ctrl(2).value=m.familia_zip||m.ctrl_descricao||''}
  window.fichaModelo(window.DADOS_MODELO);
}});

try{const dm=JSON.parse(localStorage.getItem('medidor.modeloEscolhido')||'null');if(dm&&dm.arquivo){window.DADOS_MODELO=dm;window.fichaModelo(dm)}}catch(x){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }   // v1.10.0: lembra o gerador escolhido ao recarregar
