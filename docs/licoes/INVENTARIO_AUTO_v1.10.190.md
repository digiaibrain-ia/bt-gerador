# Inventário Demo × Real (gerado por script)

- Arquivo: `dashboard/ferramentas/medidor_gerador_v1.10.190.html`
- Gerado em: 2026-11-09T03:46:09.812Z
- Pontos: **134** (ALTO 51 · MÉDIO 66 · BAIXO 17)
- Classificação por heurística (**suspeita**, não veredito). O script não executa o HTML nem enxerga o que não está no código.

## Pontos de risco ALTO (cada um merece teste Demo local × Demo + PLC)

| Linha | Função | Padrão | Trecho |
|---|---|---|---|
| 2518 | `passo` | demo.checked | `const demo=$('demo').checked; if(!demo&&T.sp!==1)setVel(1);` |
| 2803 | `carregaDados` | demo.checked | `const m=$('demo').checked?'demo':'real';if(m===DADOS_MODO)return;DADOS_MODO=m;` |
| 2847 | `motorFalhaDegrau` | demo.checked | `if(SIM_FALHA_MOTOR_ARMADA&&!SIM_FALHA_MOTOR&&$('demo').checked&&ETAPAS[T.et].alvo===30)SIM_FALHA_MOTOR=true;` |
| 3473 | `bancoDados` | demo.checked | `if($('demo').checked)return bancoSim();` |
| 3480 | `bkAtualiza` | bkEhDemoLocal | `const demoLocal=bkEhDemoLocal(),demoLocalOuPlc=true;` |
| 3641 | `clickIniciar` | demo.checked | `if($('demo').checked){if(SIM.gen==='parado'){SIM.gen='partindo';SIM.gt=0}}` |
| 3669 | `bGenStop` | demo.checked | `if(!$('demo').checked)return;` |
| 3821 | `tick` | demo.checked | `if($('demo').checked)d=demoData();` |
| 3851 | `start` | demo.checked | `$('sim').style.display=$('demo').checked?'block':'none';` |
| 4882 | `srvChave` | demo.checked | `const srvChave=()=>!$('demo').checked?'real':(SRVM.plc?'demoPlc':'demoLocal');` |
| 4918 | `srvVerModo` | srvChave() | `const novo=srvChave(),antes=SRVM.mk,manual=SRVM.manual;SRVM.manual=false;` |
| 4939 | `srvVerModo` | srvUsaPlc() | `get fonte(){return srvUsaPlc()?'nodered':'mock'},set fonte(v){},` |
| 6066 | `bSalv` | demo.checked | `$('resStop').style.display=$('demo').checked?'':'none';` |
| 6254 | `nomeArq` | demo.checked | `return `${prefixo}_${$('demo').checked?'DEMO':'REAL'}_${a.getFullYear()}${p2(a.getMonth()+1)}${p2(a.getDate())}_${p2(a.getHours())}${p2(a.ge` |
| 6695 | `offsetBanco` | srvUsaPlc() | `const CH_SRV={get fonte(){return srvUsaPlc()?'nodered':'mock'},set fonte(v){},get url(){return SRVM.url},set url(v){}};` |
| 6713 | `tensExige` | tensFeat() | `const tensExige=id=>{const f=tensFeat(id);return f==='local'\|\|f==='ok'\|\|f==='semdb'};` |
| 6916 | `genOn` | demo.checked | `const genOn=()=>GEN.estado==='operando'&&!($('demo').checked&&SIM.gen!=='operando');` |
| 6921 | `aplicaDis` | demo.checked | `try{drawBanco($('demo').checked?bancoSim():null)}catch(e){}` |
| 6944 | `tensRenderBase` | tensFeat() | `const id=bidAtivo(),f=tensFeat(id),c=tensAtiva(id),seg=$('stTensSeg'),chip=$('stTensChip');if(!seg\|\|!chip)return;` |
| 6960 | `tensRender` | tensFeat() | `const id=bidAtivo(),f=tensFeat(id),seg=$('stTensSeg'),chip=$('stTensChip');if(!seg\|\|!chip)return;` |
| 7008 | `live` | chPlcAtivo() | `if(chPlcAtivo())chFetch('POST',rotaCh(bidDeCh(selAntigo),'selecionar'),{indice:0}).catch(()=>{});` |
| 7111 | `chSetupGeradorParou` | chPlcAtivo() | `if(chPlcAtivo())chFetch('POST',rotaCh(bidDeCh(selAntigo),'selecionar'),{indice:0}).catch(()=>{});` |
| 7127 | `liga` | demo.checked | `try{drawBanco($('demo').checked?bancoSim():null)}catch(e){}` |
| 7135 | `chSel.click` | tensFeat() | `if(SEL!==q&&tensExige(bidT)&&!(tensFeat(bidT)==='ok'\|\|tensFeat(bidT)==='local'?tensAtiva(bidT):0)){$('stTxt').textContent=tensMsg(bidT);retu` |
| 7141 | `chSel.click` | demo.checked | `if(!genOn()){$('stTxt').textContent='Setup só com o gerador em START (operando). '+($('demo').checked?'Use "Ligar gerador (Demo)".':'Ligue n` |
| 7186 | `stGenDemo` | demo.checked | `if(!$('demo').checked)return;` |
| 7199 | `chUsaReal` | chPlcAtivo() | `if(!chPlcAtivo())return;` |
| 7207 | `chLimpaReal` | chPlcAtivo() | `if(!temNesteBanco&&!chPlcAtivo())return;` |
| 7210 | `chLimpaReal` | chPlcAtivo() | `if(!confirm('Apagar os kW reais de todas as chaves do '+BANCOS[BANCO_ATIVO].nome+(eTens?' no chaveamento '+TENS_V[cL-1]+' V':'')+(chPlcAtivo` |
| 7325 | `chGrade.change` | chPlcAtivo() | `if(!chPlcAtivo())return;` |
| 7421 | `bancos.click` | demo.checked | `if(!$('demo').checked)return;` |
| 7873 | `sincKw` | demo.checked | `const demo=$('demo')&&$('demo').checked;KW_NOM=demo&&p>0?p:91}` |
| 7932 | `desenha` | demoOn() | `'<div class="pd-sec"><h4>Fonte do DSE</h4><div class="gd-row"><button type="button" data-gd="fSidse" class="'+(sidse()?'on':'')+'" title="SI` |
| 8821 | `rgAmostra` | demo.checked | `if($('demo').checked!==s.demo){rgParar('trocou entre demo e real');abreReg('Registro encerrado: o modo demo/real mudou. Ative de novo para c` |
| 9123 | `demoDesliga` | demo.checked | `if(!$('demo').checked&&!SIM_FALHA_MOTOR_ARMADA)return;` |
| 9124 | `demoDesliga` | SRVM.plc | `SIM_FALHA_MOTOR_ARMADA=false;SIM_FALHA_MOTOR=false;SRVM.plc=false;` |
| 9125 | `demoDesliga` | demo.checked | `if($('demo').checked){$('demo').checked=false;limpaIndicadoresDemo();` |
| 9151 | `demoAplica` | SRVM.plc | `SRVM.plc=querPlc;SRVM.manual=true;` |
| 9201 | `bDemoLock` | SRVM.plc | `SIM_FALHA_MOTOR=false;SIM_FALHA_MOTOR_ARMADA=false;SRVM.plc=false;` |
| 9202 | `bDemoLock` | demo.checked | `if($('demo').checked){limpaIndicadoresDemo();$('demo').checked=false;SRVM.manual=true;start()}else desenha();` |
| 9210 | `demoSondaDse` | demo.checked | `if(!$('demo').checked\|\|_sondaBusy)return;` |
| 9223 | `demoDseRealDetectado` | SRVM.plc | `SIM_FALHA_MOTOR_ARMADA=false;SIM_FALHA_MOTOR=false;SRVM.plc=false;SRVM.manual=false;` |
| 9224 | `demoDseRealDetectado` | demo.checked | `limpaIndicadoresDemo();$('demo').checked=false;` |
| 9278 | `tl` | srvChave() | `return{modo:srvChave(),gen:demo?SIM.gen:GEN.estado,sim:demo?(auto?'AUTO':'MANUAL'):null,ens,et:T.started?T.et:null,` |
| 9291 | `log` | srvChave() | `modo:(()=>{try{return srvChave()}catch(x){return '?'}})(),card:card\|\|'app',tipo,acao:trunc(acao,300),res:res\|\|'info',det:limpa(det),est:opt.` |
| 9437 | `publica` | srvChave() | `if(pubBusy\|\|!lib()\|\|!$('obsEnvia').checked\|\|srvChave()==='demoLocal')return;` |
| 9471 | `infoObs` | srvChave() | `const nr=!$('obsEnvia').checked?'envio ao Node-RED desligado':(srvChave()==='demoLocal'?'Demo local — nada sai do navegador (o gerenciador r` |
| 9590 | `estabilizaHabil` | modoSim() | `if(modoSim()!=='demoPlc'\|\|!OPS.habilitei\|\|!OPS.habilitei.length)return;` |
| 9815 | `travasEnsaio` | modoSim() | `if(modoSim()!=='demoLocal')return;` |
| 9961 | `rodar` | demo.checked | `if(modo==='real'\|\|!$('demo').checked){alert('O Dev/Operador oculto só roda com o Demo ligado (Demo local ou Demo + PLC). No modo REAL ele nã` |
| 10375 | `rodarAv` | demo.checked | `if(modo!=='demoLocal'\|\|!$('demo').checked){alert('O Dev/Operador oculto AVANÇADO/MONKEY só roda em DEMO LOCAL (nunca no REAL e nunca em Demo` |

## Por função (mais bifurcações primeiro)

| Função | Pontos | ALTO |
|---|---|---|
| `demoAplica` | 6 | 1 |
| `rodar` | 4 | 1 |
| `ui` | 4 | 0 |
| `srvVerModo` | 3 | 2 |
| `chSel.click` | 3 | 2 |
| `chLimpaReal` | 3 | 2 |
| `chImprimir` | 3 | 0 |
| `dmAtualiza` | 3 | 0 |
| `demoDesliga` | 3 | 3 |
| `restaura` | 3 | 0 |
| `botoesGer` | 2 | 0 |
| `nivelAgua` | 2 | 0 |
| `srvSalvaUrl` | 2 | 0 |
| `novaPag` | 2 | 0 |
| `live` | 2 | 1 |
| `stGenDemo` | 2 | 1 |
| `varre` | 2 | 0 |
| `dados` | 2 | 0 |
| `bDemoLock` | 2 | 2 |
| `demoSondaDse` | 2 | 1 |
| `demoDseRealDetectado` | 2 | 2 |
| `tl` | 2 | 1 |
| `faseEnsaio` | 2 | 0 |
| `rodarAv` | 2 | 1 |
| `passo` | 1 | 1 |

## Pontos de risco MÉDIO e BAIXO

MÉDIO: 66 · BAIXO: 17 (veja o JSON para a lista completa).
