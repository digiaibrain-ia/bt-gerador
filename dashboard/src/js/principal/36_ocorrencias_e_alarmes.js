
/* ===== v1.9.64: MENSAGENS E FALHAS (padrão de ocorrências: CÓDIGO + TEXTO) =====
   Uma "ocorrência" = código AAA-NNN + texto curto em português + card onde o operador enxerga o sintoma.
   Estado: ATIVA enquanto a causa existir; NORMALIZOU sozinha quando a causa some (ou quando passa o tempo "expira" nas de evento).
   Quem alimenta:
     - varre() (1x por segundo): lê o estado já existente (LINK, ENS, CH_SRV) e liga/desliga as ocorrências de ESTADO (COM-*, DSE-001, ENS-*).
     - OCOR.set()/OCOR.limpa(): chamadas pontuais do código de comando (CHV-001, CHV-002) e do tratador de erros (SIS-001).
   Os códigos novos entram na tabela CAT abaixo e em claude/PADRAO_OCORRENCIAS_MENSAGENS_FALHAS.md.
   A lista fica só na memória da página (zera ao recarregar) — não grava nada no PLC, não muda nenhum comando. */
const OCOR=(function(){
  // ---- cards (id do <section> da tela → nome mostrado) ----
  const CARDS=[['modo','Modo'],['ens','Etapas do Ensaio'],['gra','Gráfico'],['med','Leitura das grandezas'],['bco','Banco de Cargas'],['reg','Registro do ensaio'],['app','Aplicação (geral)']];
  const SEC={modo:'modoCard',ens:'ens',gra:'gra',med:'med',bco:'bco',reg:'reg'}; // app = sem card: só no botão geral
  const nomeCard=id=>(CARDS.find(c=>c[0]===id)||[0,id])[1];
  // ---- catálogo: tipo f=falha (algo não funciona) / m=mensagem (aviso, nada quebrou) ----
  const CAT={
    'COM-001':{t:'f',card:'modo',txt:'PLC sem leitura'},
    'COM-002':{t:'f',card:'modo',txt:'Node-RED das chaves não responde'},
    'COM-003':{t:'f',card:'modo',txt:'Node-RED do registro do ensaio não responde'},
    'DSE-001':{t:'f',card:'med', txt:'Sem leitura do DSE'},
    'DSE-002':{t:'m',card:'med', txt:'Demo desligado: DSE real detectado'},
    'COM-005':{t:'f',card:'modo',txt:'PLC sem comunicação com o ET200 (banco desligado)'}, // v1.9.77
    'CHV-001':{t:'f',card:'bco', txt:'Comando de chave não executado'},
    'CHV-006':{t:'f',card:'bco', txt:'Banco sem leitura do PLC — chaves desconhecidas'},   // v1.10.130: antes era texto dentro do card
    'CHV-002':{t:'m',card:'bco', txt:'Comando bloqueado: banco sem leitura do PLC'},
    'CHV-003':{t:'m',card:'bco', txt:'Demo + PLC: as chaves comandam o PLC de verdade'},
    'CHV-004':{t:'m',card:'bco', txt:'Node-RED zerou as chaves (tela ausente)'},
    'CHV-005':{t:'f',card:'bco', txt:'Banco desligado/bloqueado pelo PLC (seletora em Manual ou sem comunicação com o ET200)'}, // v1.9.77
    'CHV-009':{t:'m',card:'bco', txt:'Estado seguro NÃO confirmado: não consegui desligar/zerar no PLC'},   // v1.10.228 (Passo 5, B1)
    'CHV-007':{t:'f',card:'bco', txt:'Chave sem retorno (SB): o PLC derrubou o comando e travou a chave'},   // v1.10.168 (Fase 4, Portão A)
    'CHV-008':{t:'f',card:'bco', txt:'Contator colado: retorno ativo sem comando (chave bloqueada pelo PLC)'}, // v1.10.168
    'ENS-001':{t:'f',card:'reg', txt:'Dados do ensaio não gravados no PLC'},
    'ENS-002':{t:'f',card:'reg', txt:'Etapa não gravada no PLC'},
    'ENS-003':{t:'m',card:'reg', txt:'Gravou, mas sem leitura de volta do registro'},
    'SIS-001':{t:'f',card:'app', txt:'Erro interno da tela'}
  };

  /* ===== v1.10.170 (Fase 4, Portão C): TROUBLESHOOTER — Efeito (o sintoma) -> Causa (a raiz) -> Solução (a correção) =====
     ROTEIRO v0.1: causas e passos escritos a partir dos casos reais da bancada e dos fluxos; PRECISAM da validação do Reginaldo.
     Cada causa traz um TESTE RÁPIDO. Cada passo diz ONDE se resolve: 'pc' (no PC / Node-RED), 'tela' ou 'bancada' (depende de bancada/TI).
     Para acrescentar um código: uma entrada nova em TROUBLE (efeito, causas[{t,teste,sol:[[passo,onde]]}], dyn/ordena opcionais). NÃO comanda nada. */
  const TROUBLE={
    'COM-001':{efeito:'Sem leitura do PLC deste banco: as chaves ficam com "?" e o banco não aceita comando.',causas:[
      {t:'O Node-RED das chaves está fora do ar ou a aba não foi implementada.',teste:'Abra no navegador http://localhost:1880/api/chaves/56 (ou /400): deve voltar um JSON com "banco".',sol:[['Abra o Node-RED, confira a aba do banco e clique em Implementar (Deploy).','pc']]},
      {t:'O PLC 1515 não está acessível pela rede (cabo, energia ou faixa de IP).',teste:'No PowerShell do PC BT2: ping no IP do PLC. Sem resposta = rede.',sol:[['Confira cabo e energia do PLC e se o PC está na faixa de rede do PLC.','bancada'],['Se o ping responde e o Node-RED não lê, abra o nó "PLC da Carga" e confira Host, Rack e Slot.','pc']]},
      {t:'O DB do banco não existe, ou tem outra numeração, no PLC.',teste:'No TIA, online: o DB do banco (planilha de numeração) existe com acesso padrão (não otimizado)?',sol:[['Carregue os DBs na numeração do plano e importe o fluxo da MESMA versão.','bancada']]}]},
    'COM-002':{efeito:'O Node-RED das chaves não responde à tela.',causas:[
      {t:'Node-RED parado ou página aberta num endereço errado.',teste:'Abra http://localhost:1880 no PC BT2. Abre o editor?',sol:[['Suba o Node-RED (o PM2 do PC) e recarregue a página da tela.','pc']]},
      {t:'Fluxo de chaves não importado ou com erro no Deploy.',teste:'No Node-RED, a aba "chaves" existe e sem nós em vermelho?',sol:[['Importe o JSON da versão correta (uma aba por vez) e implemente.','pc']]}]},
    'COM-003':{efeito:'O Node-RED do registro do ensaio não responde.',causas:[
      {t:'Fluxo "registro do ensaio" ausente ou parado.',teste:'Abra http://localhost:1880/api/ensaio/modo: deve voltar um JSON.',sol:[['Importe e implemente o fluxo de registro do ensaio.','pc']]}]},
    'COM-005':{efeito:'O 1515 está sem comunicação com o PLC do banco (ET200/1200): o PLC desligou o banco.',causas:[
      {t:'Cabo, energia ou rede entre o 1515 e o PLC do banco.',teste:'No TIA, online: o ComOk do FB101 do banco está FALSE? StatusPut/StatusGet com erro?',sol:[['Confira cabo, energia e IP do PLC do banco.','bancada']]},
      {t:'O PLC do banco parou de atualizar a vida (programa em STOP ou sem o bloco de vida).',teste:'No TIA, online no PLC do banco: o contador vidaET muda a cada segundo?',sol:[['Coloque o PLC do banco em RUN e confira o bloco que incrementa a vida.','bancada']]},
      {t:'Layout dos DBs diferente entre os dois PLCs (carga só de um lado).',teste:'O PUT/GET usa o mesmo tamanho (ex.: 10 e 14 bytes) nos dois lados?',sol:[['Carregue os dois PLCs na mesma janela, com os DBs da mesma versão.','bancada']]}]},
    'DSE-001':{efeito:'Sem leitura do DSE (gerador).',causas:[
      {t:'O servidor do gerador (/api/gerador) está fora do ar ou a aba não foi implementada.',teste:'Abra http://localhost:1880/api/gerador. Sem resposta = Node-RED/aba.',sol:[['Suba o Node-RED e implemente a aba "Deep Sea → REST /api/gerador".','pc']]},
      {t:'A API está no ar, mas o Node-RED não consegue falar com o DSE por Modbus TCP (status "retrying" / erro de conexão).',teste:'No PowerShell: ping no IP do DSE e Test-NetConnection IP -Port 502. Falhou = rede ou DSE.',sol:[['A placa de rede do PC que fala com o DSE precisa de IP FIXO na faixa do DSE (máscara 255.255.255.0, sem gateway).','pc'],['No nó "DSE (TCP)" do Node-RED, confira IP, porta 502 e Unit-Id.','pc'],['Confira se o DSE está ligado, com o cabo de rede e com o Modbus TCP habilitado.','bancada']]},
      {t:'DSE desligado ou sem alimentação.',teste:'O painel do DSE está aceso?',sol:[['Ligue o DSE e aguarde a reconexão (até 5 s por tentativa).','bancada']]}],
      dyn:o=>{const d=LINK.dse,dg=d&&d.diag,l=[];l.push(d&&d.http?'A API respondeu HTTP '+d.http+'.':'A API do gerador não respondeu (servidor/rede fora).');
        if(dg){l.push('Modbus do DSE: status '+(dg.statusModbus||'?')+' · erros: '+(dg.errosModbusTotal==null?'?':dg.errosModbusTotal));if(dg.ultimoErro)l.push('Último erro: '+dg.ultimoErro+(dg.ultimoErroHa!=null?' (há '+Math.round(dg.ultimoErroHa)+' s)':''))}return l},
      ordena:c=>{const dg=LINK.dse&&LINK.dse.diag;return dg?[c[1],c[0],c[2]]:c}},
    'DSE-002':{efeito:'Demo desligado, mas a tela detectou um DSE real.',causas:[
      {t:'Havia um DSE real respondendo enquanto o Demo estava ligado.',teste:'O gerador real está conectado?',sol:[['Desligue o Demo (botão Demo) para a tela voltar ao modo real.','tela']]}]},
    'CHV-001':{efeito:'Um comando de chave foi enviado e NÃO foi executado.',causas:[
      {t:'O PLC ou o Node-RED recusou ou não confirmou (veja o texto da ocorrência).',teste:'O texto da ocorrência traz o motivo (409, 503 ou 504). Tente ler o estado da chave antes de repetir.',sol:[['Releia o estado (a chave está no que você pediu?) e só então repita o comando.','tela'],['Se repetir, abra o Gerenciador de logs e veja a resposta do Node-RED.','pc']]}]},
    'CHV-009':{efeito:'Ao trocar de modo (ou parar o gerador) a tela mandou desligar chaves e zerar a seleção no PLC, e o PLC/Node-RED NÃO confirmou. Algumas chaves podem continuar comandadas.',causas:[
      {t:'Node-RED fora do ar, PLC sem leitura recente (503) ou comando recusado (veja o texto da ocorrência).',teste:'O chip "PLC" mostra "leitura ok"? As chaves do banco estão no estado que você espera?',sol:[['Confira na bancada quais chaves estão ligadas e desligue pelo painel local se precisar.','bancada'],['Resolva a falta de comunicação e repita a troca de modo: o alerta sai sozinho quando o desligamento do banco der certo por inteiro.','tela']]}]},
    'CHV-002':{efeito:'Comando bloqueado: o banco está sem leitura do PLC.',causas:[
      {t:'Sem leitura do PLC (veja COM-001 / CHV-006).',teste:'O chip "PLC" da tela mostra "leitura ok"?',sol:[['Resolva primeiro a falta de leitura (roteiro de COM-001).','pc']]}]},
    'CHV-004':{efeito:'O Node-RED zerou as chaves porque nenhuma tela consultou o PLC (vigia de segurança).',causas:[
      {t:'A tela ficou fechada ou sem rede por mais do tempo do vigia.',teste:'A tela estava aberta no PC BT2 neste período?',sol:[['Mantenha a tela aberta durante o ensaio; religue as chaves que precisar.','tela']]}]},
    'CHV-005':{efeito:'Banco desligado/bloqueado pelo PLC (seletora em Manual ou sem comunicação com o PLC do banco).',causas:[
      {t:'Seletora do banco em Manual (local).',teste:'Gire a seletora do banco para Auto (remoto).',sol:[['Gire a seletora do banco para Auto e acione "Ligar banco".','bancada']]},
      {t:'Sem comunicação 1515 ↔ PLC do banco (veja COM-005).',teste:'Existe a ocorrência COM-005 ativa?',sol:[['Resolva o COM-005 e depois acione "Ligar banco".','bancada']]}]},
    'CHV-006':{efeito:'Banco sem leitura do PLC: o estado das chaves é desconhecido.',causas:[
      {t:'O mesmo de COM-001 (Node-RED, rede ou DB).',teste:'Veja o roteiro de COM-001.',sol:[['Siga o roteiro de COM-001.','pc']]}]},
    'CHV-007':{efeito:'Chave sem retorno (SB): o comando foi enviado e o retorno não veio em 2 s. O PLC derrubou o comando (CB) e travou a chave.',causas:[
      {t:'Contator não fechou (bobina, alimentação de comando, térmico ou intertravamento).',teste:'Com a carga DESACOPLADA: a saída do PLC energiza? A bobina do contator recebe tensão?',sol:[['Corrija a causa no campo e depois clique de novo na chave (só rearma com novo comando).','bancada']]},
      {t:'Contato auxiliar ou fiação do retorno (SB) com defeito.',teste:'O contator fecha mas o retorno não chega? Verifique o contato auxiliar e a entrada.',sol:[['Repare o contato/fiação e clique de novo.','bancada']]},
      {t:'Ventilador do banco desligado (sem monitoramento hoje): pode ser intertravamento por fora do PLC.',teste:'O ventilador está ligado? Há intertravamento por fora do PLC?',sol:[['Ligue o ventilador e tente de novo; o monitoramento do ventilador é item para o PLC do banco.','bancada']]}]},
    'CHV-008':{efeito:'Contator colado: o retorno está ativo sem comando. O PLC bloqueou a chave.',causas:[
      {t:'Contator soldado/travado mecanicamente.',teste:'Com a carga DESACOPLADA e sem comando: o retorno continua ativo?',sol:[['Troque ou repare o contator. NÃO insista em ligar.','bancada']]},
      {t:'Retorno (SB) em curto ou fiação errada.',teste:'Desligue o contator na mão: o retorno cai?',sol:[['Corrija a fiação e depois clique de novo na chave.','bancada']]}]},
    'ENS-001':{efeito:'Os dados do ensaio não foram gravados no PLC.',causas:[
      {t:'Registro do ensaio sem comunicação (veja COM-003).',teste:'Existe COM-003 ativa?',sol:[['Resolva o COM-003 e grave de novo.','pc']]},
      {t:'PLC sem leitura (veja COM-001).',teste:'O chip do PLC mostra "leitura ok"?',sol:[['Resolva a leitura do PLC e grave de novo.','pc']]}]},
    'ENS-002':{efeito:'Uma etapa do ensaio não foi gravada no PLC.',causas:[
      {t:'Falha ao gravar a etapa (veja o texto da ocorrência).',teste:'O texto traz o erro devolvido pelo Node-RED.',sol:[['Resolva a comunicação (COM-003/COM-001) e use "Resalvar" da etapa.','tela']]}]},
    'ENS-003':{efeito:'Gravou, mas a leitura de volta do registro não confirmou.',causas:[
      {t:'Escrita lenta ou perda de leitura logo depois de gravar.',teste:'Releia o registro (card Registro): os valores estão no PLC?',sol:[['Confira os valores lidos; se divergem, grave de novo.','tela']]}]},
    'SIS-001':{efeito:'Erro interno da tela (JavaScript).',causas:[
      {t:'Defeito no programa da tela ou dado inesperado.',teste:'O texto traz a mensagem do erro. Ele se repete?',sol:[['Recarregue a página (F5). Se repetir, copie o diagnóstico e envie à engenharia.','tela']]}]}
  };
  const KEY=o=>o.cod+'|'+(o.ref||'');
  const ABERTOS=new Set();
  const ONDE={pc:'No PC / Node-RED',tela:'Na tela',bancada:'Depende de bancada/TI'};
  function causasDe(o){const T=TROUBLE[o.cod];if(!T)return [];let c=T.causas;if(typeof T.ordena==='function'){try{c=T.ordena(c.slice(),o)}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }}return c}
  function dinDe(o){const T=TROUBLE[o.cod];if(T&&typeof T.dyn==='function'){try{return T.dyn(o)||[]}catch(e){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }}return []}
  function painelLinha(o){
    const T=TROUBLE[o.cod],cs=causasDe(o),din=dinDe(o);
    const ef='<div><h4>1 · Efeito (o sintoma)</h4><p>'+esc(T?T.efeito:o.txt)+'</p><p class="mut">'+esc(o.txt)+'</p><p class="mut">Card: '+esc(nomeCard(o.card))+' · desde '+esc(dataHora(o.desde))+' · '+o.vezes+' vez(es)</p>'+din.map(x=>'<p class="mut">'+esc(x)+'</p>').join('')+'</div>';
    const ca='<div><h4>2 · Causa (a raiz)</h4>'+(cs.length?'<ol>'+cs.map(c=>'<li>'+esc(c.t)+'<br><span class="mut">Teste rápido: '+esc(c.teste)+'</span></li>').join('')+'</ol>':'<p class="mut">Sem roteiro cadastrado para este código ainda.</p>')+'</div>';
    const so='<div><h4>3 · Solução (a correção)</h4>'+(cs.length?'<ol>'+cs.map(c=>c.sol.map(s=>'<li>'+esc(s[0])+' <span class="chip '+s[1]+'">'+esc(ONDE[s[1]]||s[1])+'</span></li>').join('')).join('')+'</ol>':'<p class="mut">Use “Copiar diagnóstico” e envie à engenharia.</p>')+'</div>';
    return '<tr class="oct"><td colspan="8"><div class="ocp">'+ef+ca+so+'</div><div class="ocrod"><button type="button" class="bt s" data-copia="'+esc(KEY(o))+'">Copiar diagnóstico</button><span class="mut">Roteiro v0.1 — sujeito à validação da engenharia. A tela só orienta: nada aqui comanda PLC, DSE ou chaves.</span></div></td></tr>';
  }
  function textoDiag(o){
    const cs=causasDe(o),din=dinDe(o),T=TROUBLE[o.cod],L=[];
    L.push('DIAGNÓSTICO — Medidor do Gerador v'+VERSAO+' — '+new Date().toLocaleString('pt-BR'));
    L.push('Código: '+codExib(o.cod,o.tipo,o.ref)+' ('+(nomeTipo(o.tipo))+') · Card: '+nomeCard(o.card)+' · desde '+dataHora(o.desde)+' · '+o.vezes+' vez(es) · '+(o.ativa?'ATIVA':'normalizada'));
    L.push('Efeito: '+(T?T.efeito:o.txt));L.push('Texto: '+o.txt);din.forEach(x=>L.push('  - '+x));
    cs.forEach((c,i)=>{L.push('Causa '+(i+1)+': '+c.t);L.push('  Teste: '+c.teste);c.sol.forEach(s=>L.push('  Solução ['+(ONDE[s[1]]||s[1])+']: '+s[0]))});
    return L.join('\n');
  }
  function copiaDiag(o){
    const t=textoDiag(o),ok=()=>{$('ocStatus').textContent='Diagnóstico copiado às '+hhmmss(Date.now())};
    const fb=()=>{const a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';(document.querySelector('dialog[open]')||document.body).appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(e){$('ocStatus').textContent='Não consegui copiar: selecione o texto e copie à mão'}a.remove()};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,fb);else fb();
  }
  const GLOSSARIO='<details class="ocglos"><summary><b>Entenda os nomes</b> (alarme incômodo, inundação, repetido…)</summary><dl>'+'<dt>Alarme incômodo (nuisance alarm)</dt><dd>Avisa demais, sem necessidade, ou não volta ao normal mesmo depois de o operador agir. Atrapalha e ensina o operador a ignorar.</dd>'+'<dt>Inundação de alarmes (alarm flood)</dt><dd>Chegam alarmes demais em pouco tempo para uma pessoa tratar (referência: mais de 10 em 10 minutos). O que importa fica escondido no meio.</dd>'+'<dt>Repetido (chattering)</dt><dd>Liga e desliga muitas vezes seguidas, ou a mesma falha se repete a cada consulta. Aqui vira um registro só, com contador, primeira e última ocorrência.</dd>'+'<dt>Permanente (standing / stale)</dt><dd>Fica ativo por horas e ninguém age. Candidato a virar Informação.</dd>'+'<dt>Fugaz (fleeting)</dt><dd>Aparece e some em poucos segundos, sem dar tempo de agir.</dd>'+'<dt>Alarme campeão (bad actor)</dt><dd>Um alarme que sozinho responde por boa parte do volume. Achar e tratar esse resolve a maior parte do ruído.</dd>'+'<dt>Relação sinal/ruído</dt><dd>Sinal = o que exige ação (a 1ª falha, a mudança de estado). Ruído = a mesma coisa repetida. O objetivo é mais sinal e menos ruído, sem jogar sinal fora.</dd>'+'<dt>Informação (I)</dt><dd>Fato que vale registrar mas não exige ação do operador (ex.: DSE que nunca foi conectado). Aparece neste diálogo e no histórico, mas não conta nos botões Alertas e Falhas.</dd>'+'<dt>Regra de ouro</dt><dd>Todo alarme deve ter uma ação que o operador possa tomar. O que não tem ação é Informação.</dd></dl></details>';
  function legendaHtml(){return legendaBase()+GLOSSARIO}
  function legendaBase(){
    const cods=Object.keys(CAT).sort();
    return '<b>Como ler o código</b> — formato <code>T-AAA-NNN</code>: <b>T</b> = F (Falha: algo não funciona), A (Alerta: atenção/orientação) ou I (Informação: só registro, não exige ação); <b>AAA</b> = a área (COM comunicação · DSE gerador · CHV chaves/banco · ENS ensaio · SIS a própria tela); <b>NNN</b> = o número. O triângulo do card pisca devagar quando há ocorrência ativa; ele some quando a causa some. Clique em “▸ Roteiro” na linha para ver Efeito → Causa → Solução.'
      +'<table><thead><tr><th>Código</th><th>Tipo</th><th>Card</th><th>O que significa</th></tr></thead><tbody>'
      +cods.map(c=>{const x=CAT[c];return '<tr><td class="cod">'+esc(codExib(c,x.t,''))+'</td><td>'+(nomeTipo(x.t))+'</td><td>'+esc(nomeCard(x.card))+'</td><td>'+esc(x.txt)+'</td></tr>'}).join('')+'</tbody></table>';
  }
  const GRACA=8000;      // ms depois de abrir a página antes de acusar "ainda não conectou" (dá tempo da 1ª leitura)
  const MAX=300;         // limite de linhas guardadas
  const L=new Map();     // chave cod|ref → ocorrência
  let ver=0;             // sobe a cada mudança (a janela só redesenha quando muda)
  const T0=Date.now();
  /* ---- v1.10.103: HISTÓRICO (BUFFER CIRCULAR) em localStorage ----
     Cada vez que uma ocorrência LIGA ou NORMALIZA, entra uma linha aqui. Máx. HMAX linhas (as mais antigas saem). Grava no máx. a cada 2 s
     (não pesa) e ao sair da página. Se o navegador não deixar gravar (modo privado/cheio), o histórico segue só na memória — nunca trava a tela. */
  const HK='medidor.alertasHist.v1',HMAX=500;
  let H=[],hSujo=false,hVer=0;
  try{const j=JSON.parse(localStorage.getItem(HK)||'[]');if(Array.isArray(j))H=j.filter(x=>x&&x.t&&x.cod).slice(-HMAX)}catch(e){H=[]}
  const hSalva=()=>{if(!hSujo)return;hSujo=false;try{localStorage.setItem(HK,JSON.stringify(H))}catch(e){ /* ignorado: armazenamento do navegador indisponível; a preferência não é guardada */ }};
  function hReg(ev,o){
    H.push({t:Date.now(),e:ev,cod:o.cod,ref:o.ref||'',tipo:o.tipo,card:o.card,txt:o.txt,m:($('demo')&&$('demo').checked)?'DEMO':'REAL'});
    if(H.length>HMAX)H.splice(0,H.length-HMAX);
    hSujo=true;hVer++;
  }
  setInterval(hSalva,2000);addEventListener('pagehide',hSalva);
  const p2=n=>String(n).padStart(2,'0');
  const hhmmss=ms=>{const d=new Date(ms);return p2(d.getHours())+':'+p2(d.getMinutes())+':'+p2(d.getSeconds())};
  const dataHora=ms=>{const d=new Date(ms),h=new Date();return (d.toDateString()===h.toDateString()?'':p2(d.getDate())+'/'+p2(d.getMonth()+1)+' ')+hhmmss(ms)};

  /* ---- API ---- */
  // Liga (ou atualiza) uma ocorrência. opc: {ref:'BC56' (separa a mesma falha em bancos diferentes), tipo:'f'|'m'|'falha'|'msg', ev:true (evento: soma "vezes" a cada chamada), expira:ms (normaliza sozinha se não for renovada)}
  function setImediato(card,cod,texto,opc){
    opc=opc||{};
    if((cod==='CHV-005'||cod==='CHV-006')&&opc.ref&&window.BANCOS_VISIVEIS&&window.BANCOS_VISIVEIS.silencia&&window.BANCOS_VISIVEIS.silencia(String(opc.ref).replace(/^BC/,'')))return;   /* v1.10.224: ruido de banco fora do teste */
    const k=cod+'|'+(opc.ref||''),agora=Date.now(),cat=CAT[cod]||{};
    const _t0=opc.tipo?String(opc.tipo)[0]:(cat.t||'f'),tipo=_t0==='m'?'m':_t0==='i'?'i':'f';   /* v1.10.226: i = Informacao */
    let o=L.get(k);
    if(!o||!o.ativa){ // nova (ou voltou depois de normalizar)
      if(o)L.delete(k);
      o={k,cod,ref:opc.ref||'',card:card||cat.card||'app',tipo,txt:texto||cat.txt||cod,desde:agora,ult:agora,fim:0,vezes:1,ativa:true,expira:opc.expira||0};
      L.set(k,o);ver++;apara();hReg('ativou',o);
    }else{
      if(opc.ev)o.vezes++;
      if(texto&&texto!==o.txt){o.txt=texto;ver++}
      o.ult=agora;if(opc.expira)o.expira=opc.expira;
      if(opc.ev)ver++;
    }
    return o;
  }
  function limpaImediato(card,cod,ref){ // causa sumiu → "Normalizou"
    const o=L.get(cod+'|'+(ref||''));
    if(o&&o.ativa){o.ativa=false;o.fim=Date.now();ver++;hReg('normalizou',o)}
  }
  /* ===== v1.10.231 (Passo 6): DEBOUNCE E HISTERESE DE ALARMES POR CRITICIDADE =====
     PARA QUE SERVE (leigo): no log da bancada de 17/11, 45 de 88 ciclos "ativou → normalizou" duraram menos de 10 s (sobretudo na troca de modo): o operador via alarmes piscando.
     Agora, para as ocorrências de COMUNICAÇÃO e DISPONIBILIDADE, a causa precisa durar 10 s antes de virar ocorrência (debounce) e, depois de ativa, precisa ficar 5 s
     normal antes de "normalizar" (histerese). Uma causa que some antes dos 10 s nunca aparece (só conta em OCOR.fugazes()).
     NUNCA SE ATRASA (tempo real, fora das tabelas abaixo): chave sem retorno e contator colado (CHV-007/008), comando não executado (CHV-001), Node-RED zerou as chaves (CHV-004),
     estado seguro não confirmado (CHV-009), comando bloqueado (CHV-002), dados do ensaio não gravados (ENS-001/002/003), erro interno (SIS-001) e os alarmes/proteções do DSE.
     COMO FUNCIONA (técnico): set()/limpa() públicos viram porteiros de setImediato()/limpaImediato(). Causa nova de código com debounce fica em PEND até durar o tempo;
     limpa() antes disso cancela (fugaz). Causa ativa que "some" fica em SAIDA até durar o tempo da histerese; se voltar, cancela a saída. promove() roda 1x/s no varre().
     OCOR_DEBOUNCE_ESCALA (window): 1 = padrão; 0 = tudo imediato (só para teste/diagnóstico). Os tempos são ASSUMIDOS (10 s / 5 s): a Engenharia confirma por categoria. */
  const DEB_S={'COM-001':10,'COM-002':10,'COM-003':10,'COM-005':10,'DSE-001':10,'DSE-002':10,'CHV-005':10,'CHV-006':10};
  const HIS_S={'COM-001':5,'COM-002':5,'COM-003':5,'COM-005':5,'DSE-001':5,'DSE-002':5,'CHV-005':5,'CHV-006':5};
  const ESC=()=>{const e=window.OCOR_DEBOUNCE_ESCALA;return typeof e==='number'&&e>=0?e:1};
  const PEND=new Map(),SAIDA=new Map();let FUG=0;
  const ativaK=k=>{const o=L.get(k);return !!(o&&o.ativa)};
  function set(card,cod,texto,opc){
    opc=opc||{};
    const s=(DEB_S[cod]||0)*ESC();
    if(!(s>0))return setImediato(card,cod,texto,opc);
    const k=cod+'|'+(opc.ref||'');
    SAIDA.delete(k);                                  // a causa voltou: cancela a saída pendente
    if(ativaK(k))return setImediato(card,cod,texto,opc);
    const p=PEND.get(k);
    if(!p)PEND.set(k,{a:[card,cod,texto,opc],ini:Date.now()});else p.a=[card,cod,texto,opc];   // ainda esperando: só atualiza o texto
    return null;
  }
  function limpa(card,cod,ref){
    const k=cod+'|'+(ref||'');
    if(PEND.delete(k))FUG++;                          // sumiu antes de durar o tempo: fugaz, nunca virou ocorrência
    const h=(HIS_S[cod]||0)*ESC();
    if(h>0&&ativaK(k)){if(!SAIDA.has(k))SAIDA.set(k,{a:[card,cod,ref],ini:Date.now()});return}
    limpaImediato(card,cod,ref);
  }
  function promove(){
    const agora=Date.now();
    PEND.forEach((p,k)=>{if(agora-p.ini>=(DEB_S[p.a[1]]||0)*ESC()*1000){PEND.delete(k);setImediato(p.a[0],p.a[1],p.a[2],p.a[3])}});
    SAIDA.forEach((s,k)=>{if(agora-s.ini>=(HIS_S[s.a[1]]||0)*ESC()*1000){SAIDA.delete(k);limpaImediato(s.a[0],s.a[1],s.a[2])}});
  }
  function apara(){ // mantém no máx. MAX linhas: descarta as normalizadas mais antigas
    if(L.size<=MAX)return;
    [...L.values()].filter(o=>!o.ativa).sort((a,b)=>a.fim-b.fim).slice(0,L.size-MAX).forEach(o=>L.delete(o.k));
  }
  const lista=()=>[...L.values()];
  const ativas=card=>lista().filter(o=>o.ativa&&(!card||o.card===card));

  /* ===== v1.10.212 ALARME INTELIGENTE: so alarma o que esta em uso e so no contexto certo =====
     EM USO = banco selecionado (Detalhes do Patamar), ligado, ou com alguma chave ligada. Erro ao decidir = trata como EM USO (nunca esconde por engano).
     NAO MEXE em CHV-005/007/008 nem COM-005 (seguranca). */
  const T_USO={};
  const emUsoBanco=id=>{try{return !!((window.bancoUsado&&window.bancoUsado(id))||(typeof BKS!=='undefined'&&BKS[id]&&BKS[id].lig)||CH.some((c,i)=>CH_LIG[i]&&bkDeCh(i)===id))}catch(e){return true}};
  window.bancoEmUso=emUsoBanco;
  const monitText=(srv,demo,real)=>{
    const us=BANCOS_PLC.filter(b=>emUsoBanco(b.id)).map(b=>'BC'+b.id),nu=BANCOS_PLC.filter(b=>!emUsoBanco(b.id)).map(b=>'BC'+b.id);
    const p=[];
    p.push(srv?('PLC: '+(us.length?us.join(', '):'nenhum banco em uso')+(nu.length?' (fora de uso, sem alarme: '+nu.join(', ')+')':'')):'PLC: não monitorado (Demo local, nada vai ao PLC)');
    p.push(demo?'DSE: simulado':'DSE: real');p.push(real?'Registro do ensaio: servidor real':'Registro do ensaio: simulado');
    return 'Monitorando — '+p.join(' · ');
  };

  /* ---- varredura de estado (1x por segundo) ---- */
  function varre(){
    promove();                                         // v1.10.231: debounce/histerese (PEND e SAIDA) a cada segundo
    const agora=Date.now(),demo=!!($('demo')&&$('demo').checked),gr=agora-T0>GRACA;
    const C=window.CH_SRV,srv=!!(C&&C.fonte==='nodered'&&(C.url||'').trim()!==''); // chaves no Node-RED real?
    const liga=(cond,cod,txt,ref,tipo)=>{if(cond)set(null,cod,txt,tipo?{ref,tipo}:{ref});else limpa(null,cod,ref)};
    // v1.10.212 (alarme inteligente): COM-002 (Node-RED das chaves) e a CAUSA; COM-001 (PLC do banco) e CHV-006 (chaves '?') sao DEPENDENTES e so aparecem sozinhos.
    const okChv=LINK.chv.ok&&agora-LINK.chv.ts<5000,visChv=!!LINK.chv.visto,com002=srv&&!okChv&&(visChv||gr);
    const emUso=[];
    BANCOS_PLC.forEach(b=>{
      const l=LINK.banco[b.id]||{},ok=LINK.bancoOk(b.id),visto=!!l.visto,uso=emUsoBanco(b.id);
      if(uso){if(!T_USO[b.id])T_USO[b.id]=agora;emUso.push('BC'+b.id)}else T_USO[b.id]=0;
      const maduro=uso&&agora-T_USO[b.id]>4000;            // banco recem-selecionado: espera a 1a leitura (4 s) antes de alarmar
      const falha=srv&&maduro&&!ok&&(visto||gr)&&!com002;
      liga(falha,'COM-001','BC'+b.id+': '+(visto?'perdeu a conexão':'não conectado')+' — '+(l.erro||'aguardando a 1ª leitura do PLC')+' (as chaves do banco ficam com "?")','BC'+b.id);
      // CHV-006 (v1.10.130): so quando NAO ha causa maior (COM-002/COM-001 ja explicam) e so no modo com PLC
      liga(srv&&maduro&&gr&&!ok&&!falha&&!com002,'CHV-006','BC'+b.id+': sem leitura do PLC — estado das chaves DESCONHECIDO (as chaves aparecem com "?")','BC'+b.id);
    });
    liga(com002,'COM-002',(visChv?'perdeu a conexão':'não conectado')+' — '+(LINK.chv.msg||'sem resposta do Node-RED das chaves')+(emUso.length?' (afeta também: '+emUso.join(', ')+' e o registro do ensaio, que usa o mesmo servidor)':' (afeta também o registro do ensaio, que usa o mesmo servidor)'));
    // CHV-003 (v1.9.65): Demo ligado, mas ⚙ Servidor das chaves em "Node-RED real" -> cliques nas chaves vão para o PLC de verdade
    // v1.9.86: CHV-005 acompanha o ESTADO ATUAL de cada banco (antes só era atualizada quando a leitura do PLC mudava, e a leitura "otimista" do botão Ligar banco impedia a normalização).
    // POR QUÊ: banco liberado (seletora em Auto E ligado) = a causa sumiu -> "Normalizou"; ainda bloqueado = o texto mostra o motivo de agora, sem somar "vezes".
    if(typeof BANCOS!=='undefined'&&window.BANCOS_VISIVEIS&&window.BANCOS_VISIVEIS.silencia)BANCOS.forEach(b=>{if(window.BANCOS_VISIVEIS.silencia(b.id))['CHV-005','CHV-006'].forEach(c=>{if(lista().find(x=>x.cod===c&&x.ref==='BC'+b.id&&x.ativa))limpa(null,c,'BC'+b.id)})});   /* v1.10.224 */
    if(typeof BANCOS!=='undefined'&&typeof bkLiberado==='function'&&typeof bkMotivo==='function')BANCOS.forEach(b=>{
      const ref='BC'+b.id,o=lista().find(x=>x.cod==='CHV-005'&&x.ref===ref&&x.ativa);if(!o||!BKS[b.id])return;
      if(bkLiberado(b.id))limpa(null,'CHV-005',ref);
      else set('bco','CHV-005',ref+': banco bloqueado pelo PLC — '+bkMotivo(b.id),{ref});});
    liga(demo&&srv,'CHV-003','Modo DEMO + PLC: o DSE é simulado, mas clicar numa chave comanda o PLC de verdade ('+C.url+'). Para só demonstrar, abra o botão Demo e desmarque "Usar o PLC real".');
    // DSE-001: telemetria do DSE (só no modo real)
    {const ok=LINK.dse.ok&&agora-LINK.dse.ts<5000,visto=!!LINK.dse.visto;
      liga(!demo&&!ok&&(visto||gr),'DSE-001',(visto?'perdeu a conexão':'não conectado')+((LINK.dse.http&&LINK.dse.diag&&LINK.dse.diag.statusModbus)?' — a API responde (HTTP '+LINK.dse.http+'), mas o Modbus do DSE não conecta (status: '+LINK.dse.diag.statusModbus+(LINK.dse.diag.ultimoErro?'; último erro: '+LINK.dse.diag.ultimoErro:'')+')':' — a API do gerador (/api/gerador) não responde'),undefined,visto?'f':'i');}   /* v1.10.226: nunca conectou = Informacao; perdeu = Falha */
    // COM-003 / ENS-*: registro do ensaio — só com fonte real
    const real=typeof ensUsaMock==='function'&&!ensUsaMock();
    liga(real&&ENS.modo.estado==='erro'&&!com002,'COM-003',(ENS.modo.erro||'sem resposta')+' (GET /api/ensaio/modo)');
    {const P=ENS.prea,erro=real&&P&&(P.estado==='erro'||P.estado==='semConf');
      liga(erro&&P.estado==='erro','ENS-001','Preenchimento NÃO gravado no PLC: '+(P&&P.erro||''));
      liga(erro&&P.estado==='semConf','ENS-003','Dados do ensaio: '+(P&&P.erro||'sem leitura de volta'));}
    ETAPAS.forEach((e,i)=>{const pd=ENS.pend[i];
      liga(real&&!!pd&&pd.estado==='erro','ENS-002','Etapa '+(i+1)+' ('+e.alvo+' %) NÃO gravada no PLC: '+(pd&&pd.erro||''),'E'+(i+1));});
    {const m=$('ocMonit');if(m){const tx=monitText(srv,demo,real);if(m.textContent!==tx)m.textContent=tx}}   // v1.10.212
    // expiração das ocorrências de evento (CHV-001/002, SIS-001): se ninguém renovou, normaliza
    lista().forEach(o=>{if(o.ativa&&o.expira&&agora-o.ult>o.expira){o.ativa=false;o.fim=agora;ver++;hReg('normalizou',o)}});
  }

  /* ---- triângulos nos cabeçalhos dos cards ---- */
  const SVG='<svg viewBox="0 0 24 22" aria-hidden="true"><path d="M12 1.6 23 20.4H1Z" fill="#f5c400" stroke="#141414" stroke-width="1.5" stroke-linejoin="round"/><rect x="10.9" y="7.4" width="2.2" height="7" rx=".6" fill="#141414"/><circle cx="12" cy="17.3" r="1.35" fill="#141414"/></svg>';
  const TRI={}; // card → {btn,n}
  function cabecalho(sec){return sec.querySelector(':scope>.hrow h2')||sec.querySelector(':scope>h2:first-child')||sec.querySelector(':scope>.hrow')}
  function criaTri(card){
    const b=document.createElement('button');b.type='button';b.className='ocb';b.hidden=true;b.dataset.card=card;
    b.innerHTML=SVG+'<span class="ocn">0</span>';
    const ab=e=>{e.stopPropagation()};
    b.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();abre(card)});
    b.addEventListener('keydown',e=>{e.stopPropagation()}); // Enter/Espaço no triângulo não pode recolher o card
    b.addEventListener('mousedown',ab);
    TRI[card]={btn:b,n:-1};return TRI[card];
  }
  function desenhaCards(){
    Object.keys(SEC).forEach(card=>{
      const sec=document.getElementById(SEC[card]);if(!sec)return;
      const t=TRI[card]||criaTri(card),n=ativas(card).filter(o=>o.tipo!=='i').length,h=cabecalho(sec);
      {const nfc=ativas(card).filter(o=>o.tipo==='f').length;t.btn.classList.toggle('f',nfc>0);t.btn.classList.toggle('m',n>0&&nfc===0)} // v1.10.170: pulso discreto (falha vermelho / alerta âmbar)
      if(h&&t.btn.parentNode!==h)h.appendChild(t.btn); // o app reescreve alguns títulos (ex.: #tbTit): recoloca o triângulo se foi apagado
      if(n!==t.n){
        const cresceu=n>t.n&&t.n>=0;t.n=n;
        t.btn.hidden=n===0;
        t.btn.querySelector('.ocn').textContent=n;
        const tit=n+(n===1?' ocorrência ativa':' ocorrências ativas')+' em "'+nomeCard(card)+'" — clique para ver';
        t.btn.title=tit;t.btn.setAttribute('aria-label',tit);
        if(cresceu){t.btn.classList.remove('novo');void t.btn.offsetWidth;t.btn.classList.add('novo')}
      }
    });
    const at=ativas().filter(o=>o.tipo!=='i'),tot=at.length,nf=at.filter(o=>o.tipo==='f').length,na=tot-nf,bA=$('bAlertas'),bF=$('bFalhas');   /* v1.10.226: Informacao nao conta aqui */
    if(bA&&bF){
      const n=$('ocN');if(n.textContent!==String(tot))n.textContent=tot;
      /* v1.10.166: DOIS botões independentes, cada um com a sua contagem e cor (cor não é o único sinal: o número e o nome estão no botão) */
      setTxt(bA.querySelector('span'),'Alertas '+na);setTxt(bF.querySelector('span'),'Falhas '+nf);
      bA.classList.toggle('tem',na>0);bF.classList.toggle('tem',nf>0);
      const ta=na?na+(na===1?' alerta ativo':' alertas ativos')+' — clique para ver':'Sem alertas ativos. Clique para ver o histórico desta sessão.',
            tf=nf?nf+(nf===1?' falha ativa':' falhas ativas')+' — clique para ver':'Sem falhas ativas. Clique para ver o histórico desta sessão.';
      if(bA.title!==ta)bA.title=ta;if(bF.title!==tf)bF.title=tf;
    }
  }

  /* ---- janela "Alertas e Falhas" ---- */
  const nomeTipo=tp=>tp==='f'?'Falha':tp==='i'?'Informação':'Alerta';   // v1.10.226
  const codExib=(cod,tipo,ref)=>(tipo==="f"?"F":tipo==="i"?"I":"A")+"-"+cod+(ref?" · "+ref:"");   // v1.10.103: T-AAA-NNN (T = F de Falha / A de Alerta)
  let ultVis=[];
  let filtro='a',cardSel='',verJanela=-1;
  let tiposOn={m:true,f:true,i:false};   // v1.10.166: tipos mostrados na janela (independentes; sempre pelo menos um ligado)
  const dlg=()=>$('dlgOcor');
  function opcoesCard(){
    const s=$('ocCard');if(s.options.length)return;
    s.innerHTML='<option value="">Todos os cards e a aplicação</option>'+CARDS.map(c=>`<option value="${c[0]}">${esc(c[1])}</option>`).join('');
  }
  function janela(){
    const d=dlg();if(!d||!d.open)return;
    verJanela=ver;
    const todas=lista().filter(o=>!cardSel||o.card===cardSel);
    const ordem=todas.slice().sort((a,b)=>(b.ativa-a.ativa)||(b.desde-a.desde));
    const vis=(filtro==='a'?ordem.filter(o=>o.ativa):ordem).filter(o=>tiposOn[o.tipo==='i'?'i':(o.tipo==='f'?'f':'m')]);
    const nA=todas.filter(o=>o.ativa&&o.tipo!=='i').length,nF=todas.filter(o=>o.ativa&&o.tipo==='f').length,nM=todas.filter(o=>o.ativa&&o.tipo==='m').length,nI=todas.filter(o=>o.ativa&&o.tipo==='i').length,nN=todas.length-todas.filter(o=>o.ativa).length;
    const st=(l,v,bad)=>`<div class="ocst"><small>${l}</small><b${bad?' class="bad"':''}>${v}</b></div>`;
    $('ocStats').innerHTML=st('Ativas',nA,nA>0)+st('Falhas ativas',nF,nF>0)+st('Alertas ativos',nM)+st('Informações',nI)+st('Normalizadas',nN);
    $('ocTag').textContent=nA+(nA===1?' ativa':' ativas');
    $('ocCorpo').innerHTML=vis.map(o=>`<tr class="${o.ativa?'':'nrm'}"><td>${esc(dataHora(o.desde))}</td><td class="${(o.tipo==='f'?'tf':o.tipo==='i'?'ti':'tm')}">${nomeTipo(o.tipo)}</td><td>${esc(nomeCard(o.card))}</td><td class="cod" title="${esc((CAT[o.cod]||{}).txt||'')}">${esc(codExib(o.cod,o.tipo,o.ref))}</td><td>${esc(o.txt)}</td><td>${o.ativa?'<b>Ativa</b>':'Normalizou às '+esc(hhmmss(o.fim))}</td><td>${o.vezes}</td><td class="tgl"><button type="button" class="ocx" data-k="${esc(KEY(o))}" aria-expanded="${ABERTOS.has(KEY(o))?'true':'false'}" title="Efeito, causa e solução">${ABERTOS.has(KEY(o))?'▾':'▸'} Roteiro</button></td></tr>${ABERTOS.has(KEY(o))?painelLinha(o):''}`).join('');
    ultVis=vis;
    const v=$('ocVazio');
    v.hidden=vis.length>0;
    v.textContent=vis.length?'':(filtro==='a'?(todas.length?'Nenhuma ocorrência ativa agora. Use “Todas” para ver as que já normalizaram.':'Nenhuma ocorrência nesta sessão.'):'Nenhuma ocorrência registrada nesta sessão.');
    $('ocStatus').textContent='Atualizado às '+hhmmss(Date.now())+' · '+vis.length+' linha(s)';
    $('ocFiltro').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.f===filtro));
    $('ocTipos').querySelectorAll('button').forEach(b=>{b.classList.toggle('on',!!tiposOn[b.dataset.t]);b.setAttribute('aria-pressed',tiposOn[b.dataset.t]?'true':'false');b.textContent=(b.dataset.t==='f'?'Falhas ':b.dataset.t==='i'?'Informações ':'Alertas ')+(b.dataset.t==='f'?nF:b.dataset.t==='i'?nI:nM)});
  }

  // v1.10.170: Roteiro (troubleshooter), copiar diagnóstico e legenda
  $('ocCorpo').addEventListener('click',e=>{
    const b=e.target.closest('button.ocx');
    if(b){const k=b.dataset.k;if(ABERTOS.has(k))ABERTOS.delete(k);else ABERTOS.add(k);janela();return}
    const c=e.target.closest('button[data-copia]');
    if(c){const o=lista().find(x=>KEY(x)===c.dataset.copia);if(o)copiaDiag(o)}
  });
  $('ocLeg').addEventListener('click',()=>{
    const l=$('ocLegenda'),abrir=l.hidden;
    if(abrir)l.innerHTML=legendaHtml();
    l.hidden=!abrir;$('ocLeg').setAttribute('aria-expanded',abrir?'true':'false');
  });
  function abre(card,tipo){   // tipo: 'm' (Alertas), 'f' (Falhas) ou nada (os dois, como antes)
    opcoesCard();
    tiposOn=tipo==='m'?{m:true,f:false,i:false}:tipo==='f'?{m:false,f:true,i:false}:tipo==='i'?{m:false,f:false,i:true}:{m:true,f:true,i:false};
    cardSel=card||'';$('ocCard').value=cardSel;
    if(!card)filtro=ativas().length?'a':'t'; // abrindo pelo botão geral sem nada ativo: mostra o histórico
    const d=dlg();if(!d.open)d.show();
    janela();
  }

  /* ---- v1.10.103: janela do HISTÓRICO (buffer) ---- */
  let hCard='',hTipo='',hVerJ=-1;
  const hDlg=()=>$('dlgOcHist');
  const hVis=()=>H.filter(x=>(!hCard||x.card===hCard)&&(!hTipo||x.tipo===hTipo)).slice().reverse();
  function janelaH(forca){
    const d=hDlg();if(!d||!d.open)return;
    if(!forca&&hVerJ===hVer)return;hVerJ=hVer;
    const vis=hVis();
    $('ohTag').textContent=H.length+(H.length===1?' evento':' eventos')+' / '+HMAX;
    $('ohCorpo').innerHTML=vis.map(x=>`<tr class="${x.e==='ativou'?'':'nrm'}"><td>${esc(new Date(x.t).toLocaleString('pt-BR'))}</td><td>${x.e==='ativou'?'Ativou':'Normalizou'}</td><td class="${(x.tipo==='f'?'tf':x.tipo==='i'?'ti':'tm')}">${nomeTipo(x.tipo)}</td><td>${esc(nomeCard(x.card))}</td><td class="cod">${esc(codExib(x.cod,x.tipo,x.ref))}</td><td>${esc(x.txt)}</td><td>${esc(x.m||'')}</td></tr>`).join('');
    const v=$('ohVazio');v.hidden=vis.length>0;v.textContent=vis.length?'':(H.length?'Nenhum evento com esses filtros.':'Histórico vazio: ainda não houve alerta nem falha neste navegador.');
    $('ohStatus').textContent='Atualizado às '+hhmmss(Date.now())+' · '+vis.length+' linha(s)';
    $('ohTipo').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.t===hTipo));
  }
  function abreH(){
    const s=$('ohCard');if(!s.options.length)s.innerHTML='<option value="">Todos os cards e a aplicação</option>'+CARDS.map(c=>`<option value="${c[0]}">${esc(c[1])}</option>`).join('');
    s.value=hCard;const d=hDlg();if(!d.open)d.show();janelaH(true);
  }

  /* ---- ligações ---- */
  function init(){
    const d=dlg();if(!d)return;
    opcoesCard();
    /* v1.10.166: cada botão abre a janela com o SEU tipo; clicar de novo no mesmo fecha; clicar no outro troca para ele (a janela continua aberta).
       Dentro da janela os chips Alertas/Falhas ligam e desligam cada tipo (os dois juntos, se quiser). */
    const clicaTipo=t=>{const d=dlg();if(d.open&&!cardSel&&tiposOn[t]&&!tiposOn[t==='f'?'m':'f']){d.close();return}abre('',t)};
    $('bAlertas').addEventListener('click',()=>clicaTipo('m'));$('bFalhas').addEventListener('click',()=>clicaTipo('f'));
    $('ocTipos').addEventListener('click',e=>{const b=e.target.closest('button[data-t]');if(!b)return;const t=b.dataset.t;if(tiposOn[t]&&!['m','f','i'].some(k=>k!==t&&tiposOn[k]))return;tiposOn[t]=!tiposOn[t];janela()});   // nunca desliga os dois
    $('ocCard').addEventListener('change',()=>{cardSel=$('ocCard').value;janela()});
    $('ocFiltro').addEventListener('click',e=>{const b=e.target.closest('button[data-f]');if(!b)return;filtro=b.dataset.f;janela()});
    $('ocLimpa').addEventListener('click',()=>{[...L.values()].filter(o=>!o.ativa).forEach(o=>L.delete(o.k));ver++;janela()});
    $('ocImprime').addEventListener('click',e=>{ // v1.10.103: Exportar ▾ (TXT / MD / PDF)
      const c=cardSel?nomeCard(cardSel):'todos os cards e a aplicação',tit='Alertas e Falhas — '+c+' — '+(tiposOn.m&&tiposOn.f?'alertas e falhas':tiposOn.f?'somente falhas':'somente alertas')+' — '+(filtro==='a'?'somente ativas':'todas');
      const dados=()=>({cabec:['Desde','Tipo','Card','Código','Texto','Estado','Vezes'],
        linhas:ultVis.map(o=>[new Date(o.desde).toLocaleString('pt-BR'),nomeTipo(o.tipo),nomeCard(o.card),codExib(o.cod,o.tipo,o.ref),o.txt,o.ativa?'Ativa':'Normalizou ('+hhmmss(o.fim)+')',o.vezes])});
      EXPO.menu(e.currentTarget,EXPO.itensTabela(tit,'alertas_falhas',dados,()=>{
        $('ocPrt').textContent=tit+' — gerado em '+new Date().toLocaleString('pt-BR')+' — Medidor do Gerador v'+VERSAO+(($('demo')&&$('demo').checked)?' — SIMULAÇÃO (DEMO)':'');
        imprimeComNome('alertas_falhas_'+(($('demo')&&$('demo').checked)?'DEMO':'REAL')+'_'+seloDataHora(),'prOcor');
      }));
    });
    // ---- Histórico (buffer) ----
    $('ocHist').addEventListener('click',()=>{abreH()});
    $('ohCard').addEventListener('change',()=>{hCard=$('ohCard').value;janelaH(true)});
    $('ohTipo').addEventListener('click',e=>{const b=e.target.closest('button[data-t]');if(!b)return;hTipo=b.dataset.t;janelaH(true)});
    $('ohLimpa').addEventListener('click',()=>{if(!H.length)return;if(!confirm('Apagar TODO o histórico de alertas e falhas guardado neste navegador ('+H.length+' eventos)?'))return;H=[];hSujo=true;hSalva();hVer++;janelaH(true)});
    $('ohExp').addEventListener('click',e=>{
      const tit='Histórico de Alertas e Falhas'+(hCard?' — '+nomeCard(hCard):'')+(hTipo?' — '+(hTipo==='f'?'só falhas':'só alertas'):'');
      EXPO.menu(e.currentTarget,EXPO.itensTabela(tit,'alertas_falhas_historico',()=>({cabec:['Data e hora','Evento','Tipo','Card','Código','Texto','Modo'],linhas:hVis().map(x=>[new Date(x.t).toLocaleString('pt-BR'),x.e==='ativou'?'Ativou':'Normalizou',nomeTipo(x.tipo),nomeCard(x.card),codExib(x.cod,x.tipo,x.ref),x.txt,x.m||''])}),()=>{
        $('ohPrt').textContent=tit+' — '+hVis().length+' evento(s) — gerado em '+new Date().toLocaleString('pt-BR')+' — Medidor do Gerador v'+VERSAO;
        imprimeComNome('alertas_falhas_historico_'+(($('demo')&&$('demo').checked)?'DEMO':'REAL')+'_'+seloDataHora(),'prOcHist');
      }));
    });
    // erros não tratados da própria tela viram SIS-001 (evento: some sozinho depois de 60 s sem repetir)
    const sis=m=>{try{m=String(m||'desconhecido');if(/^ResizeObserver loop/.test(m))return; // aviso inofensivo do navegador, não é erro do programa
      set('app','SIS-001','Erro interno da tela: '+m.slice(0,160),{ev:true,expira:60000})}catch(x){ /* ignorado: atualização de tela opcional: o próximo ciclo refaz */ }};
    addEventListener('error',e=>sis(e&&e.message));
    addEventListener('unhandledrejection',e=>sis(e&&e.reason&&e.reason.message?e.reason.message:e&&e.reason));
    // ciclo: varre o estado 1x/s e redesenha só o que mudou
    // v1.10.229 (Passo 5, B3): se o motor de alarmes (varre) falhar, o erro NAO some mais: vira SIS-001 (antes era engolido e os alarmes podiam parar de atualizar em silencio)
    setInterval(()=>{try{varre()}catch(x){sis(x&&x.message?x.message:x)}desenhaCards();if(dlg().open&&verJanela!==ver)janela();janelaH(false)},1000);
    try{varre()}catch(x){sis(x&&x.message?x.message:x)}desenhaCards();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  return{set,limpa,ativas,lista,abre,abreH,historico:()=>H.slice(),CAT,CARDS,diag:textoDiag,fugazes:()=>FUG,pendentes:()=>PEND.size,debounce:{DEB_S,HIS_S}};
})();
window.OCOR=OCOR;
