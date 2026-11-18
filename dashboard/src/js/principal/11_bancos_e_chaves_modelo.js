/* ===== BANCO DE CARGA, GERADOR E SIMULADOR (só no demo) ===== */
let KW_NOM=91;   // kW a 100% de carga (base do % de carga do DSE). v1.9.98: no DEMO acompanha o gerador escolhido (kW a 100 % do modelo) — ver sincKw()
/* v1.10.156: CHAVE "bancos novos já estão no PLC". Desligada (padrão): BC59,5 e BC550 ficam "semPlc" (só Demo local).
   Ligada: os dois passam a ter rota/polling/leitura como o BC56 e o BC400. Liga pelo botão em Detalhes › Ajustes, ou abrindo a página com ?novos=1
   (desliga com ?novos=0). Guarda a escolha no navegador (localStorage "medidor.plcNovos"). Pedido do operador em 03/11/2026: deixar pronto p/ virar na implantação. */
const PLC_NOVOS=(()=>{try{const q=new URLSearchParams(location.search).get('novos');if(q==='1'||q==='0')localStorage.setItem('medidor.plcNovos',q);return localStorage.getItem('medidor.plcNovos')==='1'}catch(e){return false}})();
const BANCOS=[     // kW de cada chave (em modo real o painel usa o campo "bancos" da API) — bancos físicos reais da BT2
  // v1.9.39: campo "id" acrescentado — pendência registrada em claude/CONTRATO_HTTP_HTML_NODERED_CHAVES.md
  // (seção "Identificador do banco"/"Pendências" item 1). O HTML usava só o índice 0/1 do array; o contrato
  // com o Node-RED fala "56"/"400" nas rotas (/chaves/{banco}/...). id = nome definido pelo operador em
  // 20/10/2026 (BC56 -> DB150, BC400 -> DB158). Ainda NÃO existe chamada HTTP real pro Node-RED aqui (o
  // card Chaves continua 100% localStorage/Demo, como já estava) — isto só prepara o identificador estável
  // pra quando a integração for construída, sem mudar o comportamento atual.
  // v1.9.74: ORDEM FÍSICA informada pelo operador (23/10/2026): a chave 1 é a de MENOR carga e a última a de maior (antes estava ao
  // contrário). A posição n daqui = bit n do cb.ligar[]/sb.ligada[] do DB do banco = "indice" das rotas /api/chaves/{banco}/...
  // Os DB150/DB158 (setup.nominal[]) e o FC4 do ET200 precisam seguir a MESMA ordem — ver claude/CONTRATO_HTTP_HTML_NODERED_CHAVES.md.
  {id:'56',nome:'Banco de 56 kW',db:3000,dbTens:3002,chaves:[5,5,5,5,5,4,4,4,4,4,4,4,3],tensoes:[220,380,440]}  /* v1.9.81: ordem física informada pelo operador em 27/10/2026 (tabela bc56bt01..13) */,
  {id:'400',nome:'Banco de 400 kW',db:3100,dbTens:3102,chaves:[5,5,10,10,10,10,50,50,50,50,50,50,50],tensoes:[220,380]},
  /* v1.10.140: BC59,5 e BC550 viram bancos de verdade no DEMO LOCAL (simulador, tiles, comando, FB mãe, Setup) — pedido do operador.
     semPlc:true = ainda SEM rota/DB no Node-RED/PLC: nada de polling, nada vai ao PLC; fora do Demo local suas chaves ficam sem leitura (comando bloqueado).
     Quando o PLC existir, basta tirar semPlc. kW das chaves informados pelo operador (30/10/2026). tensoes [220,380,440] = ASSUMIDO (sem ficha informada). */
  {id:'59,5',nome:'Banco de 59,5 kW',db:3200,dbTens:3202,chaves:[5,5,5,5,5,4,4,4,4,4,4,3,3,2,1,0.5,0.5,0.5],tensoes:[220,380,440],rota:'595',semPlc:!PLC_NOVOS},
  {id:'550',nome:'Banco de 550 kW',db:3300,dbTens:3302,chaves:[5,5,5,5,5,25,50,50,100,100,100,100],tensoes:[220,380,440],rota:'550',semPlc:!PLC_NOVOS}];
const rotaDe=id=>{const x=BANCOS.find(k=>k.id===id);return (x&&x.rota)||id};   // v1.10.155: parte da URL /api/chaves/{rota} (59,5 -> 595, sem virgula na URL; padrão = o próprio id)
const BANCOS_PLC=BANCOS.filter(b=>!b.semPlc);   // só estes têm rota /api/chaves/{id}, polling e leitura de PLC
const bancoIdPorNome=n=>{const b=BANCOS.find(x=>x.nome===n);return b?b.id:null};
const bancoPorId=id=>BANCOS.find(b=>b.id===id)||null;
/* =====================================================================================================================
   ficha_banco_v0.1.js — FICHA DO BANCO: quais chaveamentos de tensão (220 / 380 / 440 V) cada banco de carga atende
   Projeto bancos de teste · 29/10/2026 · trecho colado (inline) no medidor_gerador_v1.10.108.html, logo depois da lista BANCOS.

   PARA QUE SERVE (leigo): cada banco de carga é uma caixa física com resistências. Pela ligação física, nem todo banco funciona em
   todas as tensões: o BC56 atende 220, 380 e 440 V; o BC400 só 220 e 380 V. Esta "ficha" guarda isso num lugar só. Com ela a tela
   (a) não deixa escolher no Setup um chaveamento que o banco não tem e (b) não sugere/usa, no Patamar Guiado, um banco que não atende
   a tensão do gerador que está sendo testado.
   POR QUE (técnico): antes existia uma lista única TENS_V=[220,380,440] para todos os bancos; o BC400 oferecia 440 V sem existir.
   Se o retrofit passar o BC400 para 440 V, basta acrescentar 440 em tensoes:[...] na lista BANCOS — nenhuma outra linha muda.
   Quando o PLC 1200 dos bancos existir, a ficha passa a vir do próprio banco (ele informa o que atende) e esta lista vira só o padrão.

   REGRAS:
     - tensoes ausente na ficha = atende todas (compatível com bancos novos ainda sem ficha).
     - tensão do gerador = DADOS.tensao ("Dados do ensaio"). Só vale se for EXATAMENTE 220, 380 ou 440 (ASSUMIDO: outra tensão, ex. 400,
       não restringe banco nenhum — a tela só avisa).
     - banco elegível = tensão do gerador desconhecida OU o banco atende essa tensão.
     - um banco marcado mas inelegível NÃO é usado (nem sugerido nem comandado pelo Patamar); a marcação do operador é preservada.
   NÃO FAZ: não comanda chave, não fala com PLC/Node-RED, não muda DB nem rota.
   ===================================================================================================================== */
const TENS_CHAVEAMENTO = [220, 380, 440];                        // chaveamentos que existem no projeto (posição 0..2 = 1..3)
const bancoTensoes = b => (b && Array.isArray(b.tensoes) && b.tensoes.length) ? b.tensoes : TENS_CHAVEAMENTO;
const bancoAtende = (b, v) => bancoTensoes(b).includes(+v);
const tensaoGerador = () => { const v = +DADOS.tensao; return TENS_CHAVEAMENTO.includes(v) ? v : null; };   // null = não informada ou fora dos 3 chaveamentos
const bancoElegivel = b => { const v = tensaoGerador(); return v == null || bancoAtende(b, v); };
           // v1.9.39: para a futura integração Node-RED falar em "56"/"400"
const CH=[];BANCOS.forEach((b,bi)=>b.chaves.forEach(kw=>CH.push({b:bi,kw})));
/* v1.9.74: INTERLIGAÇÃO POR BANCO — seletora Local/Remoto do banco (sinal que o ET200 vai enviar) + botão "Ligar banco" (cbLigarBC56 / cbLigarBC400).
   Regra pedida pelo operador (23/10/2026): a seletora do banco precisa estar em Auto (remoto) para o botão "Ligar banco" funcionar, e só com o
   banco ligado as chaves respondem. Se a seletora sai de Auto, o banco desliga e as chaves dele abrem.
   sel: null = SEM SINAL (hoje no modo PLC: o sinal ainda não existe no PLC/ET200 -> a regra fica INATIVA e as chaves funcionam como antes)
        | 'auto' = Remoto | 'manual' = Local.
   Só o Demo local simula a seletora (clique no selo "Seletora" do banco: sem sinal -> Auto -> Manual). Nada disso é lembrado entre aberturas
   (nasce sem sinal e desligado). Nenhuma rota HTTP e nenhum endereço do PLC foram criados aqui. */
const BKS={};BANCOS.forEach(b=>{BKS[b.id]={sel:null,lig:false}});
window.BK_HOLD={}; // v1.9.77: id do banco -> até quando ignorar a leitura do PLC (logo depois de um Ligar/Desligar banco)
const bkDeCh=i=>BANCOS[CH[i].b].id;                                                   // id do banco ('56'/'400') de uma chave pelo índice global
const bkLiberado=id=>{const s=BKS[id];return !s||s.sel===null||(s.sel==='auto'&&s.lig)}; // regra inativa (sem sinal) = liberado
const bkMotivo=id=>BKS[id].sel==='semcom' // v1.9.77: flow v2.4 informa comunicação 1515-ET200 perdida (FB101 ComOk = FALSE)
  ?'Banco BC'+id+' sem comunicação PLC ↔ ET200: comando bloqueado (o PLC desligou o banco). Verifique o ET200/rede.'
  :BKS[id].sel==='manual'
  ?'Banco BC'+id+' em LOCAL (seletora em Manual): comando bloqueado. Gire a seletora do banco para Auto (remoto).'
  :'Banco BC'+id+' desligado: acione "Ligar banco" no card antes de operar as chaves.';
// v1.9.76: com ensaio em andamento (armado, contando ou pausado) a seletora e o "Ligar banco" ficam TRAVADOS — a regra é a mesma do Setup (T.started&&!T.fim).
// Exceção de segurança: "Desligar banco" continua liberado (saída de emergência; o PLC real terá a mesma regra).
const bkEnsaioTrava=()=>!!(typeof T!=='undefined'&&T&&T.started&&!T.fim);
const bkMotivoEnsaio='Ensaio em andamento: a seletora e o "Ligar banco" ficam travados até parar o ensaio (só "Desligar banco" continua liberado).';
// v1.9.75: libera os dois bancos de uma vez (seletora Auto + banco ligado) — usado quando a Simulação entra em AUTO no Demo local
// (o operador simulado precisa dos bancos liberados pra montar a carga sozinho) e ao ligar o Demo local já com a Simulação em AUTO.
function bkAutoLibera(){
  BANCOS.forEach(b=>{BKS[b.id].sel='auto';BKS[b.id].lig=true});
  for(const k in _ms)delete _ms[k];
  try{drawBanco(bancoSim())}catch(e){}
}
