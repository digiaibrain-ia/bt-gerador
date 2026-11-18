
/* ===== TIPO DE ENSAIO, FAIXAS E PARÂMETROS (tipo só muda antes de iniciar; o resto vale também durante) ===== */
const PARAM_ISO={modo:'iso',n:6,etapas:[[0,2],[30,1],[50,1],[100,5],[107,2],[0,1]],tol:3,estMin:1.5,estMax:4.5,janela:2,tens:2.5,t100:300,lib:90,freq:5,stby:107}; // v1.9.29: tol 3->10 (padrão), mantido igual ao "let TOL" inicial para não repetir a divergência do ACH-09 (LIB vs PARAM_ISO.lib)
const TIPOS={iso:'Padrão',carga:'Teste de carga'}; // v1.9.29: texto visível "ISO" removido a pedido do operador (chave interna "iso" mantida, não é texto de tela)
const TIPO_DESC={
  iso:'Padrão: 6 etapas (0, 30, 50, 100, 107 e 0 %). O SALVAR só é liberado perto do fim do tempo de cada etapa e o relatório faz a análise de aprovação.',
  carga:'Só teste de carga: sem etapas, sem salvar e sem relatório. Acompanha a carga e o tempo livremente.'};
let N_ETAPAS=6,LIB=98,PARAM_ETAPAS=PARAM_ISO.etapas.map(x=>x.slice()),tipoSel='iso';
const nomeEtapa=(i,n)=>{const a=ETAPAS[i].alvo;return a===0&&i===0?'aquecimento sem carga':a===0&&i===n-1&&n>1?'0% final':a+'% da carga'};
const tempoLiberaSalvar=i=>durS(i)*LIB/100;
function liberadoTempo(i){return !(i===T.et&&T.started&&!T.fim&&!T.aguardaFim)||T.el>=tempoLiberaSalvar(i)-0.001} // SALVAR da etapa em andamento só depois do tempo configurado
function faixaCarga(i){return dadoOk&&carga!=null&&genRun()&&Math.abs(carga-ETAPAS[i].alvo)<=TOL}
function paramAtuais(){return {modo:MODO,n:N_ETAPAS,etapas:PARAM_ETAPAS.map(x=>x.slice()),tol:TOL,estMin:ESTAB_MIN,estMax:ESTAB_MAX,janela:JANELA_S,tens:TENS_TOL,t100:T100_MIN,lib:LIB,freq:FREQ_TOL,stby:STBY_MIN}}

const mkBtn=(html,titulo,fn,cls)=>{const b=document.createElement('button');b.type='button';b.className=cls;b.innerHTML=html;b.title=titulo;b.setAttribute('aria-label',titulo);b.onclick=e=>{e.stopPropagation();fn()};return b};
function anexaBotoesRegistro(){ // a tabela é refeita quando muda o nº de etapas
  /* v1.10.154: chips "Abrir" do cabeçalho do Registro retirados (o clique no próprio degrau 0 %, 30 %… e no card Etapas do ensaio continua abrindo o registro da etapa) */
  $('tbTit').appendChild(mkBtn(ICONES.lista+'<span>Resultado</span>','Abrir o resultado do ensaio (confira antes de gravar o relatório)',()=>abreResultado(),'cfgbtn inl'));
}
function aplicaParametros(p){
  const estrutura=p.modo!==MODO||p.n!==N_ETAPAS||ETAPAS.length===0;
  MODO=p.modo;N_ETAPAS=p.n;LIB=p.lib;PARAM_ETAPAS=p.etapas.map(x=>x.slice());
  const n=MODO==='carga'?1:p.n;
  ETAPAS.length=0;PARAM_ETAPAS.slice(0,n).forEach(([a,m])=>ETAPAS.push({alvo:a,min:m,nome:''}));
  ETAPAS.forEach((e,i)=>{e.nome=nomeEtapa(i,n)});
  TOL=p.tol;ESTAB_MIN=p.estMin;ESTAB_MAX=p.estMax;JANELA_S=p.janela;TENS_TOL=p.tens;T100_MIN=p.t100;
  FREQ_TOL=isFinite(p.freq)&&p.freq>0?p.freq:PARAM_ISO.freq;STBY_MIN=isFinite(p.stby)&&p.stby>0?p.stby:PARAM_ISO.stby; // v1.9.77 (parâmetros antigos sem os campos usam o padrão)
  document.documentElement.classList.toggle('modo-carga',MODO==='carga');
  const h=$('ens').querySelector(':scope>h2');if(h&&h.firstChild)h.firstChild.nodeValue=MODO==='iso'?'Etapas do Ensaio':'Etapas do Ensaio · '+TIPOS[MODO];   // v1.10.103: sem o "· Padrão"
  const w=$('stages');w.innerHTML=''; // barra de etapas (largura proporcional à duração)
  ETAPAS.forEach((e,i)=>{
    const d=document.createElement('div');d.className='st';d.id='st'+i;d.style.flex=e.min;
    d.innerHTML=`<div class="t">${e.alvo}%</div><div class="b"><i></i></div><div class="m">${e.min}</div>`;w.appendChild(d);
  });
  $('clkTot').textContent='/ '+fmt(ETAPAS.reduce((a,e)=>a+e.min*60,0));
  buildTabela();anexaBotoesRegistro();
  if(estrutura||!T.started)sorteiaEstab();
  else for(let i=T.et+1;i<ETAPAS.length;i++)ESTAB[i]=Math.round((ESTAB_MIN+Math.random()*(ESTAB_MAX-ESTAB_MIN))*10)/10; // só das etapas que ainda não começaram
  desenha();
  if(window.__marcaModo)window.__marcaModo(); // v1.9.33: atualiza o rótulo/seletores do popup Modo
}
try{const j=JSON.parse(localStorage.getItem('medidor.params')||'null');
    if(j&&Array.isArray(j.etapas)&&j.etapas.length===6)aplicaParametros(Object.assign({},PARAM_ISO,j))}catch(e){}

const travaTipo=()=>T.started&&!(T.fim&&T.gravado); // depois de iniciar, só zerando/gravando é possível trocar de tipo
// Trocar de aba (ISO / Só teste de carga) NUNCA mexe nos valores dos campos: só mostra ou esconde
// o bloco de etapas (#pIsoCampos). Por isso não existe mais cache por tipo nem perigo de perder
// o que foi digitado ao navegar entre as abas.
function marcaTipo(m){
  tipoSel=m;
  [...$('pTipo').children].forEach(b=>{b.classList.toggle('on',b.dataset.m===m);b.disabled=travaTipo()||genLigado()});
  $('pTipoDesc').textContent=TIPO_DESC[m]+(travaTipo()?' · Para trocar o tipo, finalize/grave ou ZERE o ensaio.':'');
  $('pIsoCampos').style.display=m==='carga'?'none':'';
}
function preencheCampos(p){
  const ce=(k,i,v)=>`<td><input data-k="${k}" data-i="${i}" inputmode="decimal" value="${v}" autocomplete="off"></td>`;
  $('pEtapas').innerHTML='<thead><tr><th></th>'+p.etapas.map((e,i)=>`<th>Etapa ${i+1}</th>`).join('')+'</tr></thead><tbody>'+
    '<tr><td>Carga alvo (%)</td>'+p.etapas.map(([a],i)=>ce('a',i,a)).join('')+'</tr>'+
    '<tr><td>Duração (min)</td>'+p.etapas.map(([a,m],i)=>ce('m',i,m)).join('')+'</tr></tbody>';
  $('pLib').value=p.lib;$('pTol').value=p.tol;$('pEstMin').value=p.estMin;$('pEstMax').value=p.estMax;$('pJan').value=p.janela;
  $('pT100').value=p.t100/60;$('pTens').value=p.tens;
  $('pFreq').value=p.freq!=null?p.freq:PARAM_ISO.freq;$('pStby').value=p.stby!=null?p.stby:PARAM_ISO.stby; // v1.9.77
}
function abreParametros(){
  const p=paramAtuais();
  preencheCampos(p); // sempre os valores reais do ISO (único tipo com etapas configuráveis)
  $('pAt').value=FAIXAS.tempAguaC.ok[1];$('pCr').value=FAIXAS.tempAguaC.av[1];$('pErr').textContent='';
  // Abre sempre na aba ISO; exceção: ensaio em andamento, onde a troca de tipo está bloqueada
  // e por isso mostramos o tipo realmente em uso para não confundir o operador.
  marcaTipo(travaTipo()?p.modo:'iso');
  $('dlgParam').showModal();
}
$('pTipo').addEventListener('click',e=>{const b=e.target.closest('button');if(b&&!b.disabled)marcaTipo(b.dataset.m)});
$('pPadrao').onclick=()=>{ // volta ao ensaio padrão ISO (inclui água)
  preencheCampos(PARAM_ISO);$('pAt').value=AGUA_PADRAO.atencao;$('pCr').value=AGUA_PADRAO.critico;marcaTipo('iso');$('pErr').textContent='';
};
$('pFechar').onclick=()=>$('dlgParam').close();
$('dlgParam').addEventListener('input',()=>{$('pErr').textContent=''}); // só limpa o erro ao digitar; quem salva é o botão Aplicar
$('fParam').addEventListener('submit',e=>e.preventDefault()); // nunca envia o formulário (bloqueia o Enter)
function aplicaFaixas(){ // botão Aplicar: salva os valores da aba selecionada SEM fechar a popup
  const erro=t=>{$('pErr').textContent=t};
  const modo=tipoSel;
  const at=NUM($('pAt').value),cr=NUM($('pCr').value);
  if(isNaN(at)||isNaN(cr)||at<0||cr>200)return erro('Água: informe os dois limites (0 a 200 °C).');
  if(at>=cr)return erro('Água: o limite crítico precisa ser maior que o de atenção.');
  let p;
  if(modo==='carga'){
    // "Só teste de carga" não usa etapas nem os demais parâmetros: mantém o que já está
    // guardado para o ISO intacto (PARAM_ETAPAS), só muda o tipo ativo.
    p={modo,n:N_ETAPAS,etapas:PARAM_ETAPAS.map(x=>x.slice()),tol:TOL,estMin:ESTAB_MIN,estMax:ESTAB_MAX,janela:JANELA_S,t100:T100_MIN,tens:TENS_TOL,lib:LIB,freq:FREQ_TOL,stby:STBY_MIN};
  }else{
    const v=id=>NUM($(id).value);
    const etapas=[];
    for(let i=0;i<6;i++){
      const a=NUM($('pEtapas').querySelector(`input[data-k="a"][data-i="${i}"]`).value),m=NUM($('pEtapas').querySelector(`input[data-k="m"][data-i="${i}"]`).value);
      if(isNaN(a)||a<0||a>120)return erro(`Etapa ${i+1}: a carga alvo deve estar entre 0 e 120 %.`);
      if(isNaN(m)||m<=0||m>240)return erro(`Etapa ${i+1}: a duração deve estar entre 0,1 e 240 min.`);
      etapas.push([a,m]);
    }
    p={modo,n:6,etapas,tol:v('pTol'),estMin:v('pEstMin'),estMax:v('pEstMax'),janela:v('pJan'),t100:v('pT100')*60,tens:v('pTens'),lib:v('pLib'),freq:v('pFreq'),stby:v('pStby')};
    if(isNaN(p.tol)||p.tol<=0||p.tol>20)return erro('A tolerância de carga deve estar entre 0,1 e 20 %.');
    if(isNaN(p.lib)||p.lib<0||p.lib>100)return erro('A liberação do SALVAR deve ficar entre 0 e 100 % do tempo da etapa.');
    if(isNaN(p.estMin)||isNaN(p.estMax)||p.estMin<0||p.estMax<p.estMin||p.estMax>600)return erro('Estabilidade: informe o mínimo e o máximo (máximo ≥ mínimo, até 600 s).');
    if(isNaN(p.janela)||p.janela<0.5||p.janela>60)return erro('A média dos valores deve usar entre 0,5 e 60 s.');
    if(isNaN(p.t100)||p.t100<0)return erro('Informe o tempo mínimo em 100 % (pode ser 0).');
    if(isNaN(p.tens)||p.tens<=0||p.tens>30)return erro('O desvio máximo de tensão deve estar entre 0,1 e 30 %.');
    if(isNaN(p.freq)||p.freq<=0||p.freq>30)return erro('O desvio máximo de frequência deve estar entre 0,1 e 30 %.'); // v1.9.77
    if(isNaN(p.stby)||p.stby<=0||p.stby>120)return erro('Stand-by: a carga mínima aplicada deve estar entre 1 e 120 %.');
  }
  const muda=modo!==MODO;
  if(muda&&genLigado())return erro('Gerador ligado: pare o gerador para trocar o tipo de ensaio.');
  if(muda&&travaTipo())return erro('Para trocar o tipo de ensaio, finalize e grave ou ZERE o ensaio.');
  if(muda&&T.fim&&T.gravado)novoEnsaio(); // histórico do ensaio gravado sai da tela ao trocar o tipo
  aplicaParametros(p);
  defineFaixaAgua(at,cr);
  try{localStorage.setItem('medidor.params',JSON.stringify(p));localStorage.setItem('medidor.faixaAgua',JSON.stringify({atencao:at,critico:cr}))}catch(x){}
  if(window.__ultimoDado)aplicaAlarmes(window.__ultimoDado);
  erro(''); // limpa qualquer erro anterior; a popup continua aberta
}
$('pOk').onclick=aplicaFaixas;
$('med').querySelector(':scope>h2').appendChild(mkBtn(ICONES.faixas+'<span>Faixas</span>','Tipo de ensaio, faixas e parâmetros (carga, tolerância, tempos, aprovação, água)',abreParametros,'cfgbtn inl'));
