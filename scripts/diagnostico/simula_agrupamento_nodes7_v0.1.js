/* simula_agrupamento_nodes7_v0.1.js - DIAGNOSTICO (21/11/2026). Conta quantas REQUISICOES S7 o @st-one-io/nodes7 1.1.x faz para ler o vartable de um endpoint, para cada tamanho de PDU (240/480/960).
   PARA QUE SERVE (leigo): a biblioteca que o Node-RED usa agrupa sozinha os itens vizinhos em poucas requisicoes. Este script mostra isso com o codigo real da biblioteca, sem abrir nenhuma conexao com PLC.
   COMO USAR: npm pack @st-one-io/nodes7 (extrair numa pasta VAZIA, rodar `npm install --ignore-scripts --omit=dev` dentro de package/), copiar os fluxos para a mesma pasta, ajustar os caminhos abaixo e `node simula_agrupamento_nodes7_v0.1.js`.
   RESULTADO MEDIDO (BC56): 124 itens = 1 requisicao (PDU 960), 2 (480), 3 (240); os 8 itens em blocos do Passo 10 = exatamente as MESMAS requisicoes. */
const path=require('path'), fs=require('fs'); const B=__dirname+'/b/package/src/';
const { S7ItemGroup } = (()=>{ try { return { S7ItemGroup: require(B+'s7itemGroup.js') }; } catch(e){ console.log('ERRO',e.message); process.exit(1);} })();
const EE=require('events');
function pacotes(arq, ep, pdu, extra){
  const fl=JSON.parse(fs.readFileSync(__dirname+'/'+arq+'.json','utf8')); const e=fl.find(n=>n.type==='s7 endpoint'&&n.id===ep); const vt=e.vartable;
  const end=new EE(); end.pduSize=pdu; const G=new (S7ItemGroup.S7ItemGroup||S7ItemGroup)(end, extra||{});
  for(const v of vt) G.addItems(v.addr, v.name);
  G._prepareReadPackets(); const pk=G._readPackets;
  return { itens: vt.length, requisicoes: pk.length, partes: pk.reduce((a,p)=>a+(p.parts?p.parts.length:0),0) };
}
for (const [arq,ep,rot] of [['chaves-56-api-v3.10','chv56_ep','BC56 ANTES (124 itens)'],['chaves-56-api-v3.11','chv56_ep','BC56 DEPOIS (8 itens)'],['chaves-595-api-v1.10','chv595_ep','BC59,5 ANTES (236 itens)'],['chaves-595-api-v1.11','chv595_ep','BC59,5 DEPOIS (8 itens)']])
  for (const pdu of [240,480,960]) { try { console.log(rot.padEnd(26),'PDU',pdu,JSON.stringify(pacotes(arq,ep,pdu))); } catch(e){ console.log(rot,pdu,'ERRO',e.message.slice(0,120)); } }
