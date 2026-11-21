
/* ----- janela: dados do ensaio — importar print do SAP (OCR local, sem internet; ver instruções de instalação) ----- */
const SAP_BASE='./tesseract/'; // pasta com tesseract.min.js, worker.min.js, tesseract-core*.wasm.js e por.traineddata.gz
let sapImg=null,sapWorker=null,sapBusy=false;
function sapSetImg(file){
  sapImg=file;
  const url=URL.createObjectURL(file),img=$('sapPrev');
  if(img.src)URL.revokeObjectURL(img.src);
  img.src=url;img.hidden=false;img.classList.remove('amp');
  $('sapDropTxt').hidden=true;$('sapDropInfo').hidden=false;$('sapDrop').classList.add('comimg');
  $('sapLer').disabled=false;$('sapLimpa').disabled=false;
  $('sapStat').textContent='';$('sapBruto').hidden=true;$('sapTxt').textContent='';
}
$('sapFile').onchange=()=>{const f=$('sapFile').files[0];if(f)sapSetImg(f);$('sapFile').value=''};
$('sapDrop').addEventListener('click',e=>{
  if(e.target.closest('label'))return;
  if(e.target.id==='sapPrev'){e.target.classList.toggle('amp');return} // clique na miniatura: amplia/reduz em vez de trocar o arquivo
  if(!$('sapPrev').hidden)return; // já tem imagem: clicar no resto da caixa não reabre o seletor (evita trocar sem querer)
  $('sapFile').click();
});
$('sapDrop').addEventListener('dragover',e=>{e.preventDefault();$('sapDrop').classList.add('over')});
$('sapDrop').addEventListener('dragleave',()=>$('sapDrop').classList.remove('over'));
$('sapDrop').addEventListener('drop',e=>{e.preventDefault();$('sapDrop').classList.remove('over');const f=[...e.dataTransfer.files].find(f=>f.type.startsWith('image/'));if(f)sapSetImg(f)});
addEventListener('paste',e=>{ // cola com Ctrl+V: só reage quando a janela "Dados do ensaio" está aberta
  if(!$('dlgDados').open)return;
  const it=[...(e.clipboardData?.items||[])].find(i=>i.type.startsWith('image/'));
  if(it){e.preventDefault();sapSetImg(it.getAsFile())}
});
$('sapLimpa').onclick=()=>{
  sapImg=null;const img=$('sapPrev');if(img.src)URL.revokeObjectURL(img.src);img.src='';img.hidden=true;img.classList.remove('amp');
  $('sapDropTxt').hidden=false;$('sapDropInfo').hidden=true;$('sapDrop').classList.remove('comimg');
  $('sapLer').disabled=true;$('sapLimpa').disabled=true;
  $('sapStat').textContent='';$('sapBruto').hidden=true;
};
function sapLib(){ // carrega a biblioteca de OCR só quando precisa (arquivos locais, ver instruções)
  return window.Tesseract?Promise.resolve():new Promise((res,rej)=>{
    const s=document.createElement('script');
    s.src=SAP_BASE+'tesseract.min.js';s.onload=res;
    s.onerror=()=>rej(new Error('arquivos do OCR não encontrados em '+SAP_BASE));
    document.head.appendChild(s);
  });
}
const SAP_STATUS={'loading tesseract core':'Carregando mecanismo de leitura','initializing tesseract':'Iniciando leitor','loading language traineddata':'Carregando idioma (português)','initializing api':'Preparando','recognizing text':'Lendo o print'};
async function sapGetWorker(){
  if(sapWorker)return sapWorker;
  await sapLib();
  sapWorker=await Tesseract.createWorker('por',1,{
    workerPath:SAP_BASE+'worker.min.js',corePath:SAP_BASE,langPath:SAP_BASE,
    logger:m=>{if(m.status)$('sapStat').textContent=(SAP_STATUS[m.status]||m.status)+(m.progress!=null?' · '+Math.round(m.progress*100)+'%':'')}
  });
  await sapWorker.setParameters({preserve_interword_spaces:'1'}); // mantém espaçamento entre palavras (usado na montagem das células) — o modo de segmentação de página fica no padrão do mecanismo (automático), que lida melhor com o layout de formulário em caixinhas do que um modo forçado de "bloco único"
  return sapWorker;
}
function sapPrepImg(file){ // amplia o print antes de ler: prints colados do SAP costumam vir pequenos (ex. ~900px de largura), e nessa escala o texto fica baixo demais para o OCR reconhecer direito. Só amplia — testes mostraram que converter para preto-e-branco aqui apaga parte dos valores (ficam mais claros que os rótulos) e piora a leitura, por isso a imagem segue colorida mesmo.
  return new Promise((res,rej)=>{
    const img=new Image();
    img.onload=()=>{
      const alvo=2600,esc=Math.max(1,Math.min(4,alvo/img.naturalWidth)); // só amplia (nunca reduz) até ~2600px de largura
      const c=document.createElement('canvas');
      c.width=Math.round(img.naturalWidth*esc);c.height=Math.round(img.naturalHeight*esc);
      const ctx=c.getContext('2d');
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      ctx.drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(img.src);
      res(c);
    };
    img.onerror=()=>rej(new Error('não foi possível abrir a imagem para leitura'));
    img.src=URL.createObjectURL(file);
  });
}
const sapNorm=s=>(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
const SAP_BORDA=/^[\[\]{}|«»""'']+|[\[\]{}|«»""'']+$/g; // ruído do contorno das caixinhas do SAP, que o OCR às vezes cola na borda da palavra (ex. "[DEEP", "220]") — nunca mexe no meio da palavra (não afeta hífen de modelos como "229-3TCE")
function sapRows(data){ // agrupa as palavras lidas em "linhas" pela posição vertical (a segmentação do Tesseract separa colunas distantes como blocos diferentes)
  const ws=[];
  (data.blocks||[]).forEach(b=>(b.paragraphs||[]).forEach(p=>(p.lines||[]).forEach(l=>(l.words||[]).forEach(w=>{
    const t0=w.text&&w.text.trim();if(!t0)return;
    const t=t0.replace(SAP_BORDA,'')||t0; // se sobrar vazio (era só ruído), mantém o original — a limpeza de token "só pontuação" é feita depois, em sapCelTxt
    ws.push({t,n:sapNorm(t),x0:w.bbox.x0,x1:w.bbox.x1,yc:(w.bbox.y0+w.bbox.y1)/2,h:w.bbox.y1-w.bbox.y0});
  }))));
  if(!ws.length)return[];
  const hs=ws.map(w=>w.h).sort((a,b)=>a-b),medH=hs[Math.floor(hs.length/2)]||12;
  ws.sort((a,b)=>a.yc-b.yc);
  const rows=[];
  ws.forEach(w=>{
    let r=rows.find(r=>Math.abs(r.yc-w.yc)<medH*.6);
    if(!r){r={yc:w.yc,ws:[]};rows.push(r)}
    r.ws.push(w);r.yc=(r.yc*(r.ws.length-1)+w.yc)/r.ws.length;
  });
  rows.forEach(r=>r.ws.sort((a,b)=>a.x0-b.x0));
  return rows;
}
const SAP_UNIT=/^[\(\[]?[A-Za-zÀ-ÿºª°%]{1,5}[\)\]]?$/; // token tipo "(HZ)","(V)","(°C)","(ºC)","(KW)" colado ao rótulo — inclui º/ª (ordinais), que o OCR às vezes usa no lugar de °
const SAP_CONT=new Set(['DO','DA','DE','TESTE','AMBIENTE']); // palavras de ligação dos rótulos (ex.: "versão DO TESTE", "temperatura AMBIENTE")
function sapDist(a,b){ // distância de edição (Levenshtein) — tolera pequenos erros do OCR no rótulo, ex. "Versdo" por "Versão"
  const m=a.length,n=b.length,d=[];for(let i=0;i<=m;i++)d.push([i,...Array(n).fill(0)]);
  for(let j=0;j<=n;j++)d[0][j]=j;
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=a[i-1]===b[j-1]?d[i-1][j-1]:1+Math.min(d[i-1][j],d[i][j-1],d[i-1][j-1]);
  return d[m][n];
}
const sapTolDist=st=>Math.max(1,Math.round(st.length*0.25)); // tolerância proporcional ao tamanho do rótulo (~25% dos caracteres, no mínimo 1) — rótulos longos como "Frequência"/"Temperatura" aguentam mais erro do OCR que "Data"/"RAT"
function sapLabelAt(ws,i,stems){ // tenta casar 1 a 3 palavras a partir de i com algum dos 'stems' (já normalizados); devolve o índice da última palavra do rótulo (já pulando ligações/unidade) ou -1
  if(!ws[i].n)return -1; // token que não sobrou nada ao normalizar (só pontuação, ex. "|") não inicia rótulo — evita casamento fantasma ao "colar" com a palavra seguinte
  for(const st of stems)for(let n=1;n<=3&&ws[i+n-1];n++){
    let c='';for(let k=0;k<n;k++)c+=ws[i+k].n;
    if(c===st||(Math.abs(c.length-st.length)<=2&&sapDist(c,st)<=sapTolDist(st))){
      let j=i+n-1;
      while(ws[j+1]&&(SAP_CONT.has(ws[j+1].n)||SAP_UNIT.test(ws[j+1].t)))j++;
      return j;
    }
  }
  return -1;
}
function sapValorEntre(ws,i0,i1){ // texto das palavras entre dois rótulos; "-" sozinho conta como vazio (não sobrescreve)
  const t=ws.slice(i0,i1).map(w=>w.t).join(' ').trim();
  return /^-+$/.test(t)?'':t;
}
const SAP_PUNCT_SO=/^[()\[\]{}.,;:_\-–—~`'"©®]+$/; // token feito só de pontuação/ruído de borda (ex.: ")", "©)") — descartado das células de texto
function sapCelTxt(ws){ // texto de uma célula da tabela, sem os tokens que são só pontuação (ruído de borda dos campos do SAP)
  const t=ws.filter(w=>!SAP_PUNCT_SO.test(w.t)).map(w=>w.t).join(' ').trim();
  return /^-+$/.test(t)?'':t;
}
function sapNumTok(s){ // 1º número (com vírgula ou ponto decimal) achado no texto — ignora unidade/ruído junto, ex. "(ºC) 22"→"22", "[220]"→"220"
  const m=(s||'').match(/-?\d+(?:[.,]\d+)?/);
  return m?m[0].replace(',','.'):'';
}
function sapPreenche(data){
  const rows=sapRows(data);let n=0;
  const put=(id,v)=>{if(v&&$(id)){$(id).value=v;n++}};
  // ---- linha de identificação: nº de série · versão do teste · data ----
  const TOPO=[{id:'dServ',stems:['NSERIE','NDESERIE']},{id:'dVer',stems:['VERSAO']},{id:'dData',stems:['DATA']}];
  rows.forEach(r=>{
    const ws=r.ws,hits=[];
    ws.forEach((w,i)=>TOPO.forEach(f=>{const j=sapLabelAt(ws,i,f.stems);if(j>=0)hits.push({i,j,f})}));
    if(hits.length<2)return; // confirma que é a linha certa (pelo menos 2 destes 3 campos juntos) — 1 só arrisca confundir "Tensão"/"Versão" (1 letra de diferença) com a linha de grandezas
    hits.sort((a,b)=>a.i-b.i);
    hits.forEach((h,k)=>put(h.f.id,sapValorEntre(ws,h.j+1,k+1<hits.length?hits[k+1].i:ws.length)));
  });
  if($('dData').value)$('dData').value=$('dData').value.replace(/\s/g,''); // tira espaço que o OCR às vezes mete em "28.09.2026"
  // ---- grandezas: frequência · tensão · temperatura ambiente · potência ----
  const BASE=[{id:'dFreq',stems:['FREQUENCIA']},{id:'dTens',stems:['TENSAO']},{id:'dTamb',stems:['TEMPERATURA']},{id:'dPot',stems:['POTENCIA']}];
  rows.forEach(r=>{
    const ws=r.ws,hits=[];
    ws.forEach((w,i)=>BASE.forEach(f=>{const j=sapLabelAt(ws,i,f.stems);if(j>=0)hits.push({i,j,f})}));
    if(hits.length<2)return; // confirma que é a linha certa (pelo menos 2 destas grandezas juntas)
    hits.sort((a,b)=>a.i-b.i);
    hits.forEach((h,k)=>put(h.f.id,sapNumTok(sapValorEntre(ws,h.j+1,k+1<hits.length?hits[k+1].i:ws.length)))); // só números: descarta ruído de borda/unidade que tiver sobrado
  });
  // ---- dados do equipamento: cada linha começa com Motor/Alternador/Controlador/Retificador/RAT/Bateria ----
  const EQUIP=['MOTOR','ALTERNADOR','CONTROLADOR','RETIFICADOR','RAT','BATERIA'];
  const allWs=rows.flatMap(r=>r.ws);
  // coluna da fase (Mono/Bi/Trifásico): fica à direita da tabela — some com o OCR aí para não misturar com os valores
  const faseXs=allWs.filter(w=>/^(MONOFASICO|BIFASICO|TRIFASICO)/.test(w.n)).map(w=>w.x0);
  const faseX=faseXs.length?Math.min(...faseXs):Infinity;
  // posição (centro x) dos 3 títulos da tabela — usada para "ler" cada valor na coluna certa mesmo quando uma célula fica em branco no OCR.
  // "Modelo" e "Nº de série" precisam estar na MESMA linha para contar — evita confundir com o campo "Nº de série" lá em cima, fora da tabela.
  let fabX=null,modX=null,serX=null;
  rows.forEach(r=>{
    const ws=r.ws;let rMod=null,rSer=null,rFab=null;
    for(let i=0;i<ws.length;i++){
      if(ws[i].n==='MODELO')rMod=(ws[i].x0+ws[i].x1)/2;
      if(ws[i].n==='FABRICANTE')rFab=(ws[i].x0+ws[i].x1)/2;
      const j=sapLabelAt(ws,i,['NSERIE','NDESERIE']);
      if(j>=0)rSer=(ws[i].x0+ws[j].x1)/2;
    }
    if(rMod!=null&&rSer!=null){modX=rMod;serX=rSer;fabX=rFab}
  });
  if(modX!=null&&serX!=null&&fabX==null)fabX=modX-(serX-modX); // título "Fabricante" não leu: estima pelo espaçamento dos outros dois
  rows.forEach(r=>{
    const ws=r.ws;if(!ws.length)return;
    let idx=ws[0].n?EQUIP.indexOf(ws[0].n):-1;
    if(idx<0&&ws[0].n)idx=EQUIP.findIndex(st=>Math.abs(ws[0].n.length-st.length)<=2&&sapDist(ws[0].n,st)<=sapTolDist(st)); // tolera erro do OCR no nome do equipamento (ex. "Controtador" por "Controlador")
    if(idx<0)return; // linha não começa com um nome de equipamento conhecido
    const resto=ws.slice(1).filter(w=>w.x0<faseX-10);if(!resto.length)return;
    const cel=sapCelTxt;
    let grupos;
    if(fabX!=null&&modX!=null&&serX!=null){ // cabeçalho lido: cada palavra vai para a coluna (fabricante/modelo/nº série) mais próxima — não desloca quando uma célula vem em branco
      grupos=[[],[],[]];const centros=[fabX,modX,serX];
      resto.forEach(w=>{
        const xc=(w.x0+w.x1)/2;let k=0,md=Infinity;
        centros.forEach((c,ci)=>{const d=Math.abs(xc-c);if(d<md){md=d;k=ci}});
        grupos[k].push(w);
      });
    }else{ // sem o cabeçalho para se guiar: separa pelos maiores espaços horizontais (menos confiável se faltar alguma célula)
      const gaps=[];for(let i=1;i<resto.length;i++)gaps.push({i,g:resto[i].x0-resto[i-1].x1});
      const cortes=gaps.sort((a,b)=>b.g-a.g).slice(0,2).map(g=>g.i).sort((a,b)=>a-b);
      grupos=[];let a=0;cortes.concat(resto.length).forEach(c=>{grupos.push(resto.slice(a,c));a=c});
    }
    [1,2,3].forEach((c,k)=>{
      const v=cel(grupos[k]||[]),el=$('dEquip').querySelector(`input[data-r="${idx}"][data-c="${c}"]`);
      if(el&&v){el.value=v;n++}
    });
  });
  return n;
}
/* ----- leitura por caixinhas: acha cada campo do formulário do SAP na imagem e lê um por um (bem mais confiável que ler a página inteira) ----- */
function sapCarregaImg(file){ // devolve um canvas com a imagem em tamanho adequado (nunca muito pequena nem enorme)
  return new Promise((res,rej)=>{
    const img=new Image();
    img.onload=()=>{
      const w0=img.naturalWidth,k=w0<700?2:w0>2200?1800/w0:1;
      const c=document.createElement('canvas');c.width=Math.round(w0*k);c.height=Math.round(img.naturalHeight*k);
      const x=c.getContext('2d',{willReadFrequently:true});
      x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);
      x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';
      x.drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(img.src);res(c);
    };
    img.onerror=()=>rej(new Error('não foi possível abrir a imagem'));
    img.src=URL.createObjectURL(file);
  });
}
function sapComponentes(c){ // regiões brancas conectadas (as caixinhas de valor do SAP são brancas, o fundo é cinza-claro)
  const W=c.width,H=c.height,d=c.getContext('2d',{willReadFrequently:true}).getImageData(0,0,W,H).data;
  const m=new Uint8Array(W*H);
  for(let i=0,p=0;i<W*H;i++,p+=4)m[i]=(d[p]>=250&&d[p+1]>=250&&d[p+2]>=250)?1:0;
  const st=new Int32Array(W*H),out=[];
  for(let s=0;s<W*H;s++){
    if(m[s]!==1)continue;
    let sp=0;st[sp++]=s;m[s]=2;let x0=W,y0=H,x1=0,y1=0,a=0;
    while(sp){
      const q=st[--sp],x=q%W,y=(q-x)/W;a++;
      if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;
      if(x>0&&m[q-1]===1){m[q-1]=2;st[sp++]=q-1}
      if(x<W-1&&m[q+1]===1){m[q+1]=2;st[sp++]=q+1}
      if(y>0&&m[q-W]===1){m[q-W]=2;st[sp++]=q-W}
      if(y<H-1&&m[q+W]===1){m[q+W]=2;st[sp++]=q+W}
    }
    const w=x1-x0+1,h=y1-y0+1;
    if(w>=6&&h>=6&&w<W*.5&&h<H*.4&&a>=w*h*.4)out.push({x:x0,y:y0,w,h}); // area cheia: descarta os "halos" finos que imagens redimensionadas deixam em volta das letras
  }
  return {comps:out,d,W,H};
}
function sapEstrutura(R){ // organiza as caixinhas em linhas e confere o desenho esperado: 1 linha de 3 (série/versão/data), 6 de 3 (equipamentos) e 1 de 4 (frequência/tensão/temp./potência)
  const cand=R.comps.filter(b=>b.w>=b.h*.9&&b.h>=12);if(cand.length<20)return null;
  let H0=0,best=0;cand.forEach(b=>{const n=cand.filter(o=>Math.abs(o.h-b.h)<=1).length;if(n>best){best=n;H0=b.h}});
  const tol=Math.max(2,H0*.12);
  const bx=cand.filter(b=>Math.abs(b.h-H0)<=tol&&b.w<R.W*.4).sort((a,b)=>a.y-b.y||a.x-b.x);
  const rows=[];
  bx.forEach(b=>{const r=rows.find(r=>Math.abs((r[0].y+r[0].h/2)-(b.y+b.h/2))<H0*.5);if(r)r.push(b);else rows.push([b])});
  rows.forEach(r=>r.sort((a,b)=>a.x-b.x));
  let i0=-1,len=0;for(let i=0;i<rows.length;){ // maior sequência de linhas com 3 caixinhas: são os equipamentos (6), com a linha de série/versão/data (3) por cima, se o print a incluir
    if(rows[i].length!==3){i++;continue}
    let j=i;while(j<rows.length&&rows[j].length===3)j++;
    if(j-i>len){len=j-i;i0=i}i=j;
  }
  if(len!==6&&len!==7)return null;
  const topo=len===7?rows[i0]:null,equip=rows.slice(len===7?i0+1:i0,i0+len),base=rows[i0+len]&&rows[i0+len].length===4?rows[i0+len]:null;
  if(rows.length>(topo?1:0)+6+(base?1:0))return null; // sobrou caixinha fora do desenho esperado: não é o formulário
  const rd=R.comps.filter(b=>b.w>=H0*.45&&b.w<=H0*.9&&b.h>=H0*.45&&b.h<=H0*.9&&b.x>Math.max(...equip[0].map(o=>o.x+o.w))).sort((a,b)=>a.y-b.y);
  return {H0,topo,equip,base,rd};
}
function sapCrop(R,b,inset,altura,pad){ // recorta o interior de uma caixinha e amplia até "altura" px (com margem branca, que o OCR precisa)
  const x=b.x+inset,y=b.y+inset,w=b.w-2*inset,h=b.h-2*inset,k=altura/h;
  const c=document.createElement('canvas');c.width=Math.round(w*k)+2*pad;c.height=Math.round(h*k)+2*pad;
  const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(R.cv,x,y,w,h,pad,pad,Math.round(w*k),Math.round(h*k));
  return c;
}
function sapTinta(R,b,inset){ // procura "tinta" (pixels escuros) dentro da caixinha: vazia / só um traço "-" / texto
  let n=0,x0=1e9,x1=-1,y0=1e9,y1=-1;
  for(let y=b.y+inset;y<b.y+b.h-inset;y++)for(let x=b.x+inset;x<b.x+b.w-inset;x++){
    const p=(y*R.W+x)*4;
    if(R.d[p]<150||R.d[p+1]<150||R.d[p+2]<150){n++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  }
  if(!n)return {vazio:true};
  const iw=b.w-2*inset,ih=b.h-2*inset;
  return {vazio:false,traco:(y1-y0+1)<=ih*.22&&(x1-x0+1)<=iw*.3&&n<ih*iw*.05};
}
function sapLimpaTxt(t){ // tira ruído de borda/pontuação nas pontas e espaços repetidos
  return (t||'').replace(/[\r\n]+/g,' ').replace(/[|\[\]{}«»"“”'‘’_—–~`]/g,' ').replace(/\s+/g,' ').replace(/^[\s.,;:\-=]+|[\s.,;:\-=]+$/g,'').trim();
}
function sapDigitos(t){ // cauda numérica com letras parecidas (O/o→0, I/l→1) — só quando a cauda já tem algum dígito de verdade (ex. "BC9O"→"BC90"); letras como S/B ficam (podem ser reais, ex. "BR180S1")
  return t.split(' ').map(tk=>{
    const m=tk.match(/^([A-Za-z]*?)(\d[\dOoIl]*)$/);
    return m?m[1]+m[2].replace(/[Oo]/g,'0').replace(/[Il]/g,'1'):tk;
  }).join(' ');
}
const SAP_ALT_TXT=[36,44,52,60,66,76,88,100],SAP_ALT_NUM=[52,66,88]; // alturas (px) em que cada caixinha é ampliada para leitura — a letra que "pega" muda com o tamanho, então vale a leitura mais repetida
async function sapLeCaixa(worker,R,b,numerica){ // devolve {txt,alt,estado}; estado: ok | duvida | naolido | vazio
  const inset=Math.max(1,Math.round(b.h*.09)),ink=sapTinta(R,b,inset);
  if(ink.vazio)return {txt:'',alt:[],estado:'vazio'};
  if(ink.traco)return {txt:'-',alt:['-'],estado:'ok'};
  const alt=[],peso={};
  for(const a of (numerica?SAP_ALT_NUM:SAP_ALT_TXT)){
    const {data}=await worker.recognize(sapCrop(R,b,inset,a,30));
    const t=sapLimpaTxt(data.text);alt.push(t);
    if(t)peso[t]=(peso[t]||0)+Math.max(1,data.confidence||0);
  }
  const ts=Object.keys(peso);
  if(!ts.length)return {txt:'',alt,estado:'naolido'};
  let txt=ts[0];ts.forEach(t=>{if(peso[t]>peso[txt])txt=t});
  const tot=ts.reduce((a,t)=>a+peso[t],0),acordo=alt.filter(t=>t===txt).length/alt.length;
  return {txt,alt,estado:(acordo>=.5&&peso[txt]/tot>=.5)?'ok':'duvida'};
}
const SAP_NOMES={dServ:'Nº de série',dVer:'Versão do teste',dData:'Data',dFreq:'Frequência',dTens:'Tensão',dTamb:'Temp. ambiente',dPot:'Potência'};
const SAP_EQUIP=['Motor','Alternador','Controlador','Retificador','RAT','Bateria'],SAP_COLS=['','Fabricante','Modelo','Nº de série'];
async function sapPorCaixas(worker,file){ // devolve {n,conferir,relato} ou null se o print não tem o desenho esperado do formulário
  const cv=await sapCarregaImg(file),R=sapComponentes(cv);R.cv=cv;
  const est=sapEstrutura(R);if(!est)return null;
  const alvos=[];
  if(est.topo)alvos.push(['dServ',est.topo[0],'serie'],['dVer',est.topo[1],'num'],['dData',est.topo[2],'data']);
  for(let i=0;i<6;i++)for(let c=1;c<=3;c++)alvos.push([`eq${i}_${c}`,est.equip[i][c-1],'txt']);
  if(est.base)['dFreq','dTens','dTamb','dPot'].forEach((id,k)=>alvos.push([id,est.base[k],'num']));
  $('dlgDados').querySelectorAll('.duv').forEach(e=>e.classList.remove('duv'));
  const relato=[],conferir=[];let n=0,feito=0;
  for(const grupo of ['txt','serie','num','data']){ // agrupa por tipo: o filtro de caracteres do OCR só é trocado entre grupos
    const wl=grupo==='num'?'0123456789.,-':grupo==='data'?'0123456789./':'';
    await worker.setParameters({tessedit_pageseg_mode:'7',tessedit_char_whitelist:wl});
    for(const [id,b,tipo] of alvos){
      if(tipo!==grupo)continue;
      $('sapStat').textContent=`Lendo as caixinhas do print… ${++feito} de ${alvos.length}`;
      const rs=await sapLeCaixa(worker,R,b,tipo==='num'||tipo==='data');
      let v=rs.txt;
      if(tipo==='serie')v=v.replace(/\s+/g,'').toUpperCase().replace(/^([A-Z]{4})([0-9OIlSB]{5})$/,(m,a,t)=>a+t.replace(/O/g,'0').replace(/[Il]/g,'1').replace(/S/g,'5').replace(/B/g,'8'));
      else if(tipo==='data')v=v.replace(/\s+/g,'');
      else if(tipo==='num')v=id==='dVer'?v.replace(/\s+/g,''):sapNumTok(v);
      else v=sapDigitos(v);
      const eq=id.match(/^eq(\d)_(\d)$/),el=eq?$('dEquip').querySelector(`input[data-r="${eq[1]}"][data-c="${eq[2]}"]`):$(id);
      const nome=eq?SAP_EQUIP[+eq[1]]+' · '+SAP_COLS[+eq[2]]:SAP_NOMES[id];
      if(el)el.value=v; // sempre sobrescreve: nunca sobra valor antigo de outro ensaio
      if(v)n++;
      const duv=rs.estado==='duvida'||rs.estado==='naolido'||(!v&&rs.estado!=='vazio');
      if(el&&duv)el.classList.add('duv');
      if(duv)conferir.push(nome+(v?'':' (não li)'));
      const dif=new Set(rs.alt.filter(Boolean));
      relato.push(nome+': '+(v||(rs.estado==='vazio'?'(vazio)':'(não consegui ler)'))+(dif.size>1?'   ['+[...dif].join(' | ')+']':''));
    }
  }
  if(est.rd.length===3){ // fase: o botão de opção marcado tem o miolo escuro
    const lum=est.rd.map(b=>{let s=0,k=0;for(let y=Math.round(b.y+b.h/2)-1;y<=Math.round(b.y+b.h/2)+1;y++)for(let x=Math.round(b.x+b.w/2)-1;x<=Math.round(b.x+b.w/2)+1;x++){const p=(y*R.W+x)*4;s+=(R.d[p]+R.d[p+1]+R.d[p+2])/3;k++}return s/k});
    const ord=[...lum.keys()].sort((a,b)=>lum[a]-lum[b]),rr=[...$('dlgDados').querySelectorAll('input[name=dFase]')];
    if(lum[ord[0]]<170&&lum[ord[1]]>200&&rr[ord[0]]){rr[ord[0]].checked=true;n++;relato.push('Fase: '+rr[ord[0]].value)}
    else conferir.push('Fase');
  }else conferir.push('Fase');
  return {n,conferir,relato};
}
$('dlgDados').addEventListener('input',e=>{if(e.target.classList)e.target.classList.remove('duv')}); // o campo marcado em laranja volta ao normal quando o operador mexe nele
$('sapLer').onclick=async()=>{
  if(!sapImg||sapBusy)return;
  sapBusy=true;$('sapLer').disabled=true;$('sapStat').textContent='Carregando mecanismo de leitura…';
  try{
    const worker=await sapGetWorker();
    $('sapStat').textContent='Procurando as caixinhas do print…';
    let rc=null;
    try{rc=await sapPorCaixas(worker,sapImg)}catch(e){console.warn('leitura por caixinhas falhou',e);rc=null}
    if(rc){ // desenho do formulário reconhecido: cada campo foi lido separadamente
      $('sapTxt').textContent='Leitura por caixinhas (entre colchetes: as leituras diferentes quando houve dúvida)\n\n'+rc.relato.join('\n');$('sapBruto').hidden=false;
      $('sapStat').textContent=`${rc.n} campo(s) preenchido(s).`+(rc.conferir.length?` Confira (marcados em laranja): ${rc.conferir.join(', ')}.`:' Confira antes de salvar.');
    }else{ // não achou o desenho do formulário (print cortado/diferente): lê a página inteira como antes
      await worker.setParameters({tessedit_pageseg_mode:'3',tessedit_char_whitelist:''});
      $('sapStat').textContent='Preparando imagem…';
      const prep=await sapPrepImg(sapImg);
      const {data}=await worker.recognize(prep,{},{blocks:true});
      $('sapTxt').textContent=data.text||'(nada reconhecido)';$('sapBruto').hidden=false;
      ['dServ','dVer','dFreq','dTens','dTamb','dPot'].forEach(id=>{$(id).value=''});$('dEquip').querySelectorAll('input').forEach(e=>{e.value=''}); // não deixa sobrar valor antigo misturado com a leitura
      const n=sapPreenche(data);
      $('sapStat').textContent=n?`${n} campo(s) preenchido(s) — print fora do formato esperado, confira tudo antes de salvar.`:'Não reconheci os campos automaticamente — confira o texto bruto abaixo e preencha manualmente.';
    }
    $('dErr').textContent='';
  }catch(e){
    $('sapStat').textContent='Erro ao ler o print: '+(e&&e.message?e.message:e||'erro desconhecido');
  }finally{
    sapBusy=false;$('sapLer').disabled=false;
  }
};
