const {chromium}=require('playwright');const fs=require('fs');
const R=require('/home/user/bt-gerador/dashboard/modulos-fonte/rodizio_chaves_v0.5.js');
const GERS=[['MWM_40KVA_eletr','G4501AMF_MWMe_40KVA_60HZ_380V_12V.dse'],['MWM_150KVA','G4501AMF_MWM_150KVA_60HZ_380V_12V.dse'],['SCA_500KVA','G4501AMF_SCA_500KVA_60HZ_380V_24V.dse'],['SCA_800KVA','G4501AMF_SCA_800KVA_60HZ_380V_24V.dse'],['380V','8660_1250KVA_60HZ_380V_24V_V7.7.dse']];
const sel=process.argv[2]?process.argv[2].split(',').map(Number):[0,1,2,3,4];
const BANCOS=[['56',[5,5,5,5,5,4,4,4,4,4,4,4,3]],['400',[5,5,10,10,10,10,50,50,50,50,50,50,50]],['59,5',[5,5,5,5,5,4,4,4,4,4,4,3,3,2,1,.5,.5,.5]],['550',[5,5,5,5,5,25,50,50,100,100,100,100]]];
const mk=()=>BANCOS.map(([id,k])=>({id,kws:k,habil:k.map(()=>true),estado:{acion:k.map(()=>0),horas:k.map(()=>0)},atual:k.map(()=>false)}));
// roda dentro da pagina: anda pelas etapas, salvando cada uma, e devolve o que a FB mae fez em cada patamar
const LOOP=async()=>{
  const out=[],pausa=ms=>new Promise(r=>setTimeout(r,ms));const t0=Date.now();let etSalva=-1;
  while(!T.aguardaFim&&!T.fim){
    if(Date.now()-t0>400000){out.push({erro:'tempo esgotado na etapa '+(T.et+1)});break}
    if(T.started&&!T.run&&!T.fim&&!T.aguarda&&SIM.gen==='operando'){document.getElementById('bIni').click();await pausa(300)}
    if(T.aguarda&&!SNAP[T.et]&&etSalva!==T.et){
      await pausa(400);
      const et=T.et;let f={};try{f=JSON.parse(localStorage.getItem('medidor.fbv.v1')||'{}')}catch(e){}
      const idx=[...document.querySelectorAll('#bancos .tile[data-i]')].filter(t=>t.classList.contains('cmd')).map(t=>+t.dataset.i);
      out.push({et:et+1,alvoPct:ETAPAS[et].alvo,estado:f.estado,msg:f.msg,alvoKw:f.kw&&f.kw.alvo,sel:f.kw&&f.kw.sel,cmd:f.kw&&f.kw.cmd,conf:f.kw&&f.kw.conf,cap:f.kw&&f.kw.cap100,idx});
      const b=document.querySelector('#c_sv_'+et+' .svbtn');
      if(!b||b.disabled||b.offsetParent===null){out.push({erro:'Salvar indisponivel na etapa '+(et+1)});break}
      etSalva=et;b.click();
      const t1=Date.now();while(!(T.et>et||T.aguardaFim||T.fim)&&Date.now()-t1<25000)await pausa(200);
    }
    await pausa(250);
  }
  return {out,fim:T.fim,aguardaFim:T.aguardaFim};
};
(async()=>{const b=await chromium.launch();const resumo=[];
for(const gi of sel){const [pasta,arq]=GERS[gi];const ctx=await b.newContext({viewport:{width:1400,height:900}});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('dialog',async d=>{await d.accept(d.type()==='prompt'?'mwm':undefined)});
 await p.route('**/api/**',r=>r.fulfill({status:503,contentType:'application/json',body:'{"ok":false}'}));
 await p.goto('http://localhost:8772/medidor_gerador_v1.10.160.html?novos=1');await p.waitForTimeout(1800);
 await p.click('#bDemo');await p.check('#dmTradicional');await p.waitForTimeout(500);await p.evaluate(()=>document.getElementById('dlgDemo').close());
 await p.click('#mAuto').catch(()=>{});await p.click('#velSeg button[data-v="10"]');await p.waitForTimeout(300);
 const gen=await p.evaluate(()=>SIM.gen);if(gen!=='parado'){await p.click('#bGenStop').catch(()=>{});await p.waitForFunction(()=>SIM.gen==='parado',null,{timeout:40000})}
 await p.click('#bIni');await p.waitForTimeout(500);
 await p.setInputFiles('#dCat input[data-c=f]','/home/user/bt-gerador/catalogo/catalogo_modelos_v0.1.csv');await p.waitForTimeout(1200);
 await p.fill('#dCat input[data-c=q]',arq.replace('.dse',''));await p.waitForTimeout(600);
 for(const bt of await p.$$('#dCat .cat-l button')){const t=await bt.textContent();if(t.includes(pasta)&&t.includes(arq)){await bt.click();break}}
 await p.waitForTimeout(500);const kw100=+(await p.inputValue('#dPot'));
 await p.fill('#dServ','AUTO-'+gi);await p.fill('#dVer','teste ideal');await p.click('#dOk');
 await p.waitForFunction(()=>!document.getElementById('dlgDados').open&&T.started,null,{timeout:25000}).catch(()=>{});
 // Patamar guiado: todos os patamares em Auto e ligado
 await p.click('#bGuiado');await p.waitForTimeout(500);
 await p.evaluate(()=>{const d=document.getElementById('dlgGuiado');const ams=[...d.querySelectorAll('[data-gd=am]')];ams.forEach((a,i)=>{if(i%2===1)a.click()});});
 await p.waitForTimeout(300);
 await p.evaluate(()=>document.querySelector('#dlgGuiado [data-gd=rodar]').click());await p.waitForTimeout(500);
 await p.evaluate(()=>{const d=document.getElementById('dlgGuiado');if(d&&d.open)d.close()});
 const ligado=await p.evaluate(()=>window.PATAMAR_GUIADO_ON&&window.PATAMAR_GUIADO_ON());
 await p.waitForFunction(()=>SIM.gen==='operando',null,{timeout:60000}).catch(()=>{});
 await p.waitForTimeout(500);
 let par={pct:110,exc:2};try{par=await p.evaluate(()=>({pct:+G.pctLim,exc:+G.exc}))}catch(e){par.erro='G inacessivel'}
 const r=await p.evaluate(LOOP);
 // esperado: o mesmo modulo, com os 4 bancos, limite 107 % e modo do patamar
 const linhas=[];let falhas=0;
 for(const o of r.out){
  if(o.erro){linhas.push({erro:o.erro});falhas++;continue}
  let esperado=null;
  if(o.alvoPct>0){const m=o.alvoPct>100?'minimo':'abaixo';const s=R.sugere({bancos:mk(),alvoKw:kw100*o.alvoPct/100,kw100,pctLimite:par.pct,modoAlvo:m,excessoMaxKw:m==='minimo'?kw100*par.exc/100:0});esperado=s.total}
  else esperado=0;
  const lim=kw100*par.pct/100;
  const okSel=esperado!==null&&Math.abs((o.sel||0)-esperado)<=0.51;      // tolerancia de 1 chave de 0,5 kW por empate/ordem
  const okLim=(o.cmd||0)<=lim+1e-6;
  const okConf=Math.abs((o.cmd||0)-(o.conf||0))<=0.51;
  if(!(okSel&&okLim&&okConf))falhas++;
  linhas.push({et:o.et,pct:o.alvoPct,alvoKw:+(o.alvoKw||0).toFixed(1),esperado:+(+esperado).toFixed(1),sel:+(o.sel||0).toFixed(1),cmd:+(o.cmd||0).toFixed(1),conf:+(o.conf||0).toFixed(1),estado:o.estado,okSel,okLim,okConf,chavesCmd:o.idx.length});
 }
 const item={gerador:arq,kw100,limitePct:par.pct,excessoPct:par.exc,parErro:par.erro,patamarLigado:ligado,etapas:linhas,fim:r.fim||r.aguardaFim,falhas,errosJS:errs.slice(0,3)};
 resumo.push(item);console.log(JSON.stringify(item));
 await ctx.close()}
await b.close();fs.writeFileSync('tests/e2e/resultado_geradores_ideais.json',JSON.stringify(resumo,null,1))})()
