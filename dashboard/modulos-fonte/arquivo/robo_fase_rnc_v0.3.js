  /* =====================================================================================================================
     robo_fase_rnc_v0.3.js — FASE "RNC · Registrar defeito" do Dev/Operador oculto  ·  13/11/2026
     FRAGMENTO colado DENTRO do módulo do Operador oculto (usa reg, chk, aviso, ate, pausa, passo, clica, OPS, T, ETAPAS, srvBase, $).
     PARA QUE SERVE (leigo): no meio do ensaio simulado (etapa de 50 %), o robô aperta "⚠ Registrar defeito" como o operador: confere o que o botão anexa
     (modelo, etapa, hora, grandezas, alarmes), preenche e registra, confere que o servidor guardou e que o aviso "RNC: BLOQUEADO" aparece e some.
     v0.2 (13/11/2026): a caixa de areia do robô bloqueia todo envio que não seja leitura; esta fase abre UMA exceção — POST /api/rnc/abrir — só enquanto roda e só depois de confirmar que a pasta de dados é de teste (SB.rncPermite). Resto igual à v0.1.
     v0.3 (13/11/2026): o defeito simulado é FALHA DO ALTERNADOR DE CARGA (pedido do Reginaldo): a fase arma SIM_FALHA_ALT (só no Demo): tensão do alternador 0 V com o motor em marcha, bateria
       descendo (24,8 V) e alarme "Falha de carga do alternador" no DSE simulado. O robô confere que o contexto anexado mostra a falha, que o servidor a guardou e que a falha é desarmada ao fim.
     SEGURANÇA: só grava se GET /api/rnc/saude disser que a pasta de dados tem "teste" no nome (nunca na pasta real). Sem servidor, sem fluxo RNC ou pasta
     real = a fase é PULADA com um AVISO no relatório (não é falha). Só fala com /api/rnc/*; NÃO toca PLC, chaves nem DSE.
     O registro de teste leva série OPSECRETO<data/hora> e o prefixo [DEMO] (o Demo está ligado); fica na pasta de teste como evidência (o arquivo é só de acréscimo).
     ===================================================================================================================== */
  async function faseRncDurante(){
    const F='RNC · Registrar defeito';
    passo('RNC: conferindo o servidor (só roda com pasta de dados de TESTE)');
    let base='';try{base=srvBase()}catch(e){}
    if(!base){aviso(F,'fase pulada','sem URL do servidor (Node-RED) no medidor');return}
    let sa=null;
    try{const r=await fetch(base+'/api/rnc/saude',{cache:'no-store'});sa=r.ok?await r.json():null}catch(e){}
    if(!sa||!sa.ok){aviso(F,'fase pulada','o serviço RNC não respondeu em /api/rnc/saude (fluxo rnc-api-v1.1 importado e URL do servidor certa?)');return}
    if(!/teste/i.test(String(sa.arquivo||''))){aviso(F,'fase pulada por segurança','a pasta de dados do RNC (…'+String(sa.arquivo||'').slice(-40)+') não tem "teste" no nome: o robô não grava na pasta real');return}
    if(!window.RNC_DEFEITO||!$('bRnc')){chk(F,'botão "Registrar defeito" existe na tela',false,'módulo RNC ausente nesta versão do medidor');return}
    SIM_FALHA_ALT=true;   // falha de alternador de carga simulada (só Demo); desarmada no finally
    SB.rncPermite=true;   // exceção da caixa de areia: só POST /api/rnc/abrir, só nesta fase, só com pasta de TESTE confirmada
    try{
    const api=async c=>{const r=await fetch(base+c,{cache:'no-store'});return r.json()};
    const serie='OPSECRETO'+new Date().toISOString().replace(/\D/g,'').slice(0,14);   // 23 caracteres A-Z0-9
    const et=T.et;

    chk(F,'o botão "⚠ Registrar defeito" está visível no cabeçalho',$('bRnc').offsetParent!==null,$('bRnc').textContent);
    passo('RNC: simulando falha do alternador de carga (Demo)');
    const falhaAlt=()=>{const k=window.RNC_DEFEITO.captura();return k.alarmes&&k.alarmes.temAlarme===true&&(k.grandezas||{}).alternador===0};
    chk(F,'Demo: falha do alternador de carga aparece nos dados do DSE simulado (alternador 0 V + alarme)',await ate(falhaAlt,8000),JSON.stringify((window.RNC_DEFEITO.captura().alarmes)||null).slice(0,120));
    // 1) o que o botão vai anexar (fotografia da tela)
    const c=window.RNC_DEFEITO.captura(),g=c.grandezas||{};
    chk(F,'contexto: etapa e hora do ensaio',c.ensaio&&c.ensaio.iniciado===true&&c.ensaio.etapa===et&&c.ensaio.etapa_nome===ETAPAS[et].nome&&!!c.momento,JSON.stringify(c.ensaio||null).slice(0,160));
    chk(F,'contexto: grandezas elétricas lidas (≥ 6) e potência > 0 na etapa de '+ETAPAS[et].alvo+' %',Object.keys(g).length>=6&&g.kw>0,'n='+Object.keys(g).length+' kw='+g.kw+' carga%='+g.cargaPct);
    chk(F,'contexto: modelo do DSE e alarmes presentes',!!(c.modelo&&(c.modelo.dse||c.modelo.dse_texto))&&c.alarmes&&Array.isArray(c.alarmes.lista),JSON.stringify(c.modelo||null).slice(0,100));
    chk(F,'contexto: marca Demo (os dados são simulados)',c.demo===true,'demo='+c.demo);
    {const cc=window.RNC_DEFEITO.captura(),gg=cc.grandezas||{},nomes=((cc.alarmes||{}).lista||[]).map(x=>x.nome);
     chk(F,'contexto: anexa a falha do alternador (alternador 0 V, bateria < 26 V, alarme "Falha de carga do alternador")',gg.alternador===0&&gg.bateria<26&&nomes.includes('Falha de carga do alternador'),'alternador='+gg.alternador+' bateria='+gg.bateria+' alarmes='+nomes.join('|'))}
    // 2) abre a janela e confere o preenchimento automático
    passo('RNC: abrindo "Registrar defeito"');
    clica($('bRnc'),'Registrar defeito');
    const abriu=await ate(()=>$('dlgRnc')&&$('dlgRnc').open,4000);
    if(!chk(F,'o botão abre a janela "Registrar defeito"',abriu,'dlgRnc aberta='+abriu))return;
    chk(F,'a janela já traz o modelo e mostra o aviso de Demo',($('rncModelo').value||'').length>0&&$('rncDemo').style.display!=='none','modelo="'+$('rncModelo').value+'"');
    chk(F,'a janela mostra o que será anexado (JSON da tela)',/"etapa"/.test($('rncCtx').textContent)&&/"grandezas"/.test($('rncCtx').textContent),'');
    // 3) validação: sem descrição não grava
    const antes=(await api('/api/rnc/saude')).eventos;
    $('rncSerie').value=serie;$('rncSerie').dispatchEvent(new Event('input',{bubbles:true}));
    $('rncDesc').value='';$('rncNome').value='Operador oculto';
    clica($('rncEnv'),'Registrar (sem descrição)');await pausa(500);
    chk(F,'sem descrição: recusa e não grava',/Preencha/.test($('rncRes').textContent)&&(await api('/api/rnc/saude')).eventos===antes,$('rncRes').textContent.trim().slice(0,70));
    // 4) registra
    $('rncTipo').value='DEFEITO';
    $('rncDesc').value='Falha do alternador de carga: tensão do alternador 0 V com o motor em marcha, bateria descendo (24,8 V) e alarme "Falha de carga do alternador" no DSE, na etapa de '+ETAPAS[et].alvo+' % (registro automático do Operador oculto)';
    passo('RNC: registrando o defeito');
    clica($('rncEnv'),'Registrar e bloquear gerador');
    const salvou=await ate(()=>/Salvo\./.test($('rncRes').textContent),8000);
    if(!chk(F,'"Salvo" só aparece depois do servidor confirmar',salvou,$('rncRes').textContent.trim().slice(0,100))){try{$('dlgRnc').close()}catch(e){};return}
    // 5) o servidor realmente guardou (leitura de volta, sem confiar na tela)
    const s=await api('/api/rnc/serie/'+serie),r=(s.rncs||[])[0]||{},cx=r.contexto||{};
    chk(F,'servidor: série ficou BLOQUEADA com 1 RNC aberta',s.situacao==='BLOQUEADO'&&s.total===1&&r.estado==='ABERTA',s.situacao+' total='+s.total+' estado='+r.estado);
    chk(F,'servidor: descrição com prefixo [DEMO] e banco/tipo gravados',/^\[DEMO\]/.test(r.descricao||'')&&!!r.banco&&!!r.tipo_nc,(r.descricao||'').slice(0,40)+' | '+r.banco+' | '+r.tipo_nc);
    chk(F,'servidor: guardou a falha do alternador no contexto (alternador 0 V + alarme) e a descrição cita o alternador',/alternador/i.test(r.descricao||'')&&r.tipo_nc==='DEFEITO'&&((cx.grandezas||{}).alternador===0)&&((cx.alarmes||{}).lista||[]).some(x=>x.nome==='Falha de carga do alternador'),JSON.stringify((cx.alarmes||{}).lista||[]).slice(0,100)+' alternador='+(cx.grandezas||{}).alternador);
    chk(F,'servidor: o contexto da etapa '+(et+1)+' foi gravado (etapa, modelo, grandezas, alarmes)',cx.ensaio&&cx.ensaio.etapa===et&&cx.modelo&&Object.keys(cx.grandezas||{}).length>=6&&cx.alarmes&&cx.demo===true,JSON.stringify(cx.ensaio||null).slice(0,120));
    // 6) aviso: etiqueta + faixa aparecem para a série com RNC e somem para uma série limpa
    passo('RNC: conferindo o aviso "RNC: BLOQUEADO"');
    try{$('dlgRnc').close()}catch(e){}
    window.RNC_DEFEITO.consulta(serie);
    const vis=id=>{const e=document.getElementById(id);return !!e&&getComputedStyle(e).display!=='none'};
    const apareceu=await ate(()=>vis('pRncAv')&&vis('rncFaixa'),5000);
    chk(F,'aviso: etiqueta "RNC: BLOQUEADO (n)" e faixa aparecem para a série com RNC pendente',apareceu&&/BLOQUEADO/.test($('pRncAv').textContent),$('pRncAv').textContent);
    window.RNC_DEFEITO.consulta('OPSECRETOLIMPA0000000');
    const sumiu=await ate(()=>!vis('pRncAv')&&!vis('rncFaixa'),5000);
    chk(F,'aviso: some para uma série sem RNC',sumiu,'etiqueta='+vis('pRncAv')+' faixa='+vis('rncFaixa'));
    chk(F,'o ensaio simulado continuou rodando (o aviso não bloqueia o ensaio)',T.started&&!T.fim,'started='+T.started+' fim='+T.fim);
    }finally{SB.rncPermite=false;SIM_FALHA_ALT=false}
    chk(F,'a falha simulada do alternador foi desarmada ao fim da fase (dados voltam ao normal)',await ate(()=>{const k=window.RNC_DEFEITO.captura();return k.alarmes&&k.alarmes.temAlarme===false&&(k.grandezas||{}).alternador>20},8000),JSON.stringify((window.RNC_DEFEITO.captura().grandezas||{}).alternador));
  }

