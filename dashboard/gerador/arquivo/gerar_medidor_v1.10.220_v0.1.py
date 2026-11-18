#!/usr/bin/env python3
"""17/11/2026 - Gera medidor_gerador_v1.10.220.html (de 1.10.219). Nao sobrescreve; aborta se um trecho esperado mudou.
PERFIL DE COMBUSTIVEL (pedido do Reginaldo): gerador a GAS / BIOMETANO nao aceita degrau grande de carga como o diesel. Novo FB filho (modulos-fonte/fb_perfil_combustivel_v0.1.js, funcoes puras) com ENTRADAS
(combustivel, de/ate, tempo desde o ultimo degrau, frequencia medida e nominal, chaves ligadas) e SAIDAS (sub-degraus iguais, "pode dar o proximo degrau?", plano de descida).
No medidor: seletor "Combustivel do gerador" em Detalhes do Patamar (Diesel = comportamento atual, nada muda); Gas/Biometano: sobe em degraus iguais <= passo maximo, espera a pausa e SO da o proximo degrau
com a frequencia recuperada (desiste sem adicionar carga se nao recuperar; sem leitura de frequencia nao adiciona carga); a etapa final sem carga desce em degraus (queda planejada), emergencia continua imediata.
Mae virtual v0.13 -> v0.14 (descarrega opcional). Decisoes e pontuacao: docs/bt2/auditoria/DECISOES_PERFIL_COMBUSTIVEL_E_ESCALONAMENTO_v0.1.md.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.220_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas'); M = os.path.join(R, 'dashboard', 'modulos-fonte')
L = lambda p: open(p, encoding='utf-8').read()
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.219.html'), os.path.join(F, 'medidor_gerador_v1.10.220.html'); assert os.path.exists(o) and not os.path.exists(d)
t = L(o); mod = L(os.path.join(M, 'fb_perfil_combustivel_v0.1.js')); assert '</script' not in mod.lower()
# 1) modulo como <script> proprio (antes do modulo de janelas)
marca = "</script>\n<script>\n/* =====================================================================================================================\n   janelas_v0.3.js"
t = troca(t, marca, "</script>\n<script>\n" + mod + "\n" + marca, 'modulo')
# 2) estado G.comb (persistido)
t = troca(t, "crit:'ambos',pa:1,ph:1,folga:0,deg:'',pausa:5,desl:true,esc:ESC_PADRAO(),", "crit:'ambos',pa:1,ph:1,folga:0,deg:'',pausa:5,desl:true,esc:ESC_PADRAO(),comb:'diesel',", 'G')
t = troca(t, "'tolDseS','modelo','fonteDse','esc']", "'tolDseS','modelo','fonteDse','esc','comb']", 'persistencia')
# 3) auxiliares do perfil (declaracoes de funcao: sobem no escopo do modulo do Patamar)
aux = ("  /* ===== v1.10.220: PERFIL DE COMBUSTIVEL (fb_perfil_combustivel_v0.1.js). Diesel = null = comportamento de sempre. ===== */\n"
       "  let ultAddPerfil=0;   /* ms do ultimo degrau que ACRESCENTOU carga no perfil gas/biometano (persiste entre Aplicar) */\n  function perfilAtual(){try{const P=window.PERFIL_COMB;if(!P)return null;const p=P.get(G.comb);return P.ehDiesel(p)?null:p}catch(e){return null}}\n"
       "  /** Frequencia medida (Hz). window.__perfilFreqOverride = gancho SO de teste/diagnostico. Sem leitura = null (o portao NAO libera carga). */\n"
       "  function freqPerfil(){try{if(typeof window.__perfilFreqOverride==='function')return window.__perfilFreqOverride();const d=window.__ultimoDado,f=d?find(d,'frequencia'):null;return(typeof f==='number'&&isFinite(f)&&f>0)?f:null}catch(e){return null}}\n"
       "  function freqNomPerfil(){const h=+G.hz||+(window.DADOS_MODELO&&window.DADOS_MODELO.Hz);return h>0?h:60}\n"
       "  function combHtml(){const P=window.PERFIL_COMB;if(!P)return'';const cur=P.get(G.comb);\n"
       "    return '<div class=\"pd-sec\"><h4>Combustível do gerador</h4><div class=\"gd-row\"><select data-gd=\"f\" data-k=\"comb\" aria-label=\"Combustível do gerador\">'+Object.values(P.PERFIS).map(p=>'<option value=\"'+p.id+'\"'+(p.id===cur.id?' selected':'')+'>'+esc(p.nome)+'</option>').join('')+'</select></div><div class=\"cat-i\">'+esc(cur.resumo)+(P.ehDiesel(cur)?'':' Valores assumidos: confirmar com o datasheet do motor.')+'</div></div>'}\n"
       "  /** Queda PLANEJADA de carga (etapa sem carga) em degraus, no perfil gas/biometano. Emergencia (DSE, limite) segue pela derrubaTudo(): imediata. */\n"
       "  function descarregaPerfil(motivo,pf){\n"
       "    tm.forEach(clearTimeout);tm=[];escAte=Date.now()+36e5;\n"
       "    const lig=[];BANCOS.forEach((b,bi)=>b.chaves.forEach((_,j)=>{const i=off(bi)+j;if(cmdDe(i))lig.push({id:i,kw:kwEf(i)})}));\n"
       "    const pd=window.PERFIL_COMB.planoDescida(pf,+G.kw100,lig);\n"
       "    if(!pd.grupos.length){escAte=0;G.msg=motivo;desenha();return}\n"
       "    pd.grupos.forEach((g,n)=>tm.push(setTimeout(()=>{g.abre.forEach(i=>{if(cmdDe(i)){const tl=document.querySelector('#bancos .tile[data-i=\"'+i+'\"]');if(tl)tl.click()}});\n"
       "      if(n===pd.grupos.length-1){escAte=0;G.msg='Carga retirada em '+pd.grupos.length+' etapa(s) ('+pf.nome+').'}else G.msg='Retirando carga ('+pf.nome+'): etapa '+(n+1)+' de '+pd.grupos.length+', restam '+fmtKw(g.kwDepois)+' kW.';\n"
       "      desenha()},n*pd.pausaS*1000)));\n"
       "    G.msg=motivo+' Descida em '+pd.grupos.length+' etapa(s) ('+pf.nome+').';if(typeof msgGer==='function')msgGer(G.msg,12000);desenha();\n"
       "  }\n")
t = troca(t, "  function derrubaTudo(motivo){", aux + "  function derrubaTudo(motivo){", 'aux')
# 4) sub-degraus do perfil (sobem em partes iguais; ignora o escalonador antigo quando ha perfil)
t = troca(t, "const E=G.esc;if(!E||!E.ativo||!T.started)return[];",
          "{const pf=perfilAtual();if(pf){if(!T.started)return[];const i0=patIdx();if(!(i0>0)||!ETAPAS[i0]||!ETAPAS[i0-1])return[];return window.PERFIL_COMB.subDegraus(pf,+ETAPAS[i0-1].alvo,+ETAPAS[i0].alvo)}}   // v1.10.220: perfil gas/biometano\n"
          "    const E=G.esc;if(!E||!E.ativo||!T.started)return[];", 'inter')
t = troca(t, "const base={degrauMaxKw:degrauKw(),pausaS:T.started?0:+G.pausa,desligaImediato:!!G.desl};",
          "const pf0=perfilAtual(),base={degrauMaxKw:degrauKw(),pausaS:T.started?0:(pf0?pf0.pausaS:+G.pausa),desligaImediato:!!G.desl};", 'base')
t = troca(t, "const E=G.esc,lig=!!E.ligaAntes,kw100=+G.kw100,lim=R.limiteKw(kw100,+G.pctLim);",
          "const E=pf0?Object.assign({},G.esc,{pausaSubS:pf0.pausaS,ativo:true,ligaAntes:false}):G.esc   /* perfil gas: NAO liga antes (a sobreposicao seria um degrau extra de carga); troca no mesmo instante */,lig=!!E.ligaAntes,kw100=+G.kw100,lim=R.limiteKw(kw100,+G.pctLim);", 'E')
t = troca(t, "const degrauKw=()=>{const kw=+G.kw100;if(G.deg!==''&&G.deg!=null&&!isNaN(+G.deg))return +G.deg;return kw>0?Math.round(kw*DEGRAU_TEORICO_PCT)/100:null};",
          "const degrauKw=()=>{const kw=+G.kw100;if(G.deg!==''&&G.deg!=null&&!isNaN(+G.deg))return +G.deg;const pf=perfilAtual();return kw>0?Math.round(kw*(pf?pf.passoMaxPct:DEGRAU_TEORICO_PCT))/100:null};", 'degrau')
t = troca(t, "G.esc.sobrePts,G.esc.trechos.map(x=>x.passos)])", "G.esc.sobrePts,G.esc.trechos.map(x=>x.passos),G.comb])", 'escSig')
# 5) execucao: diesel = timers de sempre; perfil = encadeado com portao de frequencia
t = troca(t, "pl.passos.forEach((p,n)=>tm.push(setTimeout(()=>{", "const passoFn=(p,n)=>{", 'passoFn')
agenda = ("desenha()};\n"
 "    const pfG=perfilAtual();\n"
 "    if(!pfG){pl.passos.forEach((p,n)=>tm.push(setTimeout(()=>passoFn(p,n),p.t*1000)))}\n"
 "    else{   /* v1.10.220: gas/biometano — ENCADEADO: cada degrau que ACRESCENTA carga espera a pausa e a frequencia recuperar; sem recuperar no limite = DESISTE (nao adiciona carga) */\n"
 "      escAte=Date.now()+36e5;const fimEsc=()=>{escAte=0};   /* ultAddPerfil e do MODULO (nao reinicia a cada Aplicar): clicar Aplicar de novo NAO fura a pausa */\n"
 "      const vai=n=>{\n"
 "        if(n>=pl.passos.length){fimEsc();return}\n"
 "        const p=pl.passos[n],gap=n===0?0:Math.max(0,(p.t-pl.passos[n-1].t))*1000;\n"
 "        const tenta=()=>{\n"
 "          if(p.liga.length){\n"
 "            const r=window.PERFIL_COMB.liberaProximo(pfG,{esperouS:(Date.now()-ultAddPerfil)/1000,freqHz:freqPerfil(),freqNomHz:freqNomPerfil()});\n"
 "            if(r.desiste){fimEsc();G.msg='Interrompido: '+r.motivo+'. Nenhuma carga nova foi adicionada; confira o gerador e clique em Aplicar de novo.';try{if(window.devObs)window.devObs.log('bco','sistema','Perfil '+pfG.nome+': degrau '+(n+1)+' desistiu — '+r.motivo,'falha',{passo:n+1})}catch(x){}desenha();return}\n"
 "            if(!r.libera){G.msg='Aguardando para o degrau '+(n+1)+' de '+pl.passos.length+': '+r.motivo;desenha();tm.push(setTimeout(tenta,1000));return}\n"
 "            ultAddPerfil=Date.now();\n"
 "          }\n"
 "          passoFn(p,n);vai(n+1)};\n"
 "        tm.push(setTimeout(tenta,gap))};\n"
 "      vai(0)}\n")
t = troca(t, "desenha()},p.t*1000)));\n    G.msg='Aplicando '", agenda + "    G.msg='Aplicando '", 'agenda')
# 6) descarrega no host da mae + painel Combustivel + mae inline v0.14
t = troca(t, "derruba:m=>{derrubaTudo(m);", "descarrega:m=>{const pf=perfilAtual();if(pf&&pf.descida)descarregaPerfil(m,pf);else derrubaTudo(m);G.sug=sugVazio();G.sel=Object.fromEntries(BANCOS.map(b=>[b.id,[]]));bancosAtivos().forEach(({b})=>{G.sel[b.id]=b.chaves.map(()=>false)});pinta()},derruba:m=>{derrubaTudo(m);", 'host')
t = troca(t, "const DET='<div class=\"pd-sec\"><h4>Bancos</h4>", "const DET=combHtml()+'<div class=\"pd-sec\"><h4>Bancos</h4>", 'det')
t = troca(t, "if (pct === 0) { h.derruba('FBs virtuais: etapa sem carga — chaves abertas.'); selKw = 0;", "if (pct === 0) { (h.descarrega || h.derruba).call(h, 'FBs virtuais: etapa sem carga — chaves abertas.'); selKw = 0;   /* v0.14: descarrega() opcional = queda PLANEJADA */", 'mae')
t = troca(t, '<meta name="app-version" content="1.10.219">', '<meta name="app-version" content="1.10.220">', 'meta')
t = troca(t, "const VERSAO='1.10.219', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n",
 "const VERSAO='1.10.220', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.220\",d:\"17/11/2026\",i:[\n"
 "    'PERFIL DE COMBUSTÍVEL (pedido do Reginaldo): gerador a GÁS NATURAL ou BIOMETANO não aceita degrau grande de carga como o diesel. Novo FB filho em JavaScript (fb_perfil_combustivel_v0.1, funções puras, com entradas: combustível, de/até, tempo desde o último degrau, frequência medida e nominal, chaves ligadas). Seletor \"Combustível do gerador\" em Detalhes do Patamar: Diesel (padrão, nada muda), Gás natural, Biometano/biogás. Gás/biometano: sobe em degraus IGUAIS de até 25 %/20 %, espera a pausa (10/15 s) e SÓ dá o próximo degrau com a frequência recuperada; se não recuperar no limite, DESISTE sem adicionar carga; sem leitura de frequência não adiciona carga. A etapa final sem carga desce em degraus (queda planejada); emergência (DSE parou, limite) continua imediata. Valores ASSUMIDOS: confirmar com o datasheet do motor. Mãe virtual v0.14 (descarrega opcional).'\n  ]},\n", 'hist')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.220.html ok')
