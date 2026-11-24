const CMD_URL=''; // endpoint de comando do gerador (POST {acao:'start'|'stop'}); vazio = só funciona no demo
let msgTimer=null;
/* v1.10.163: mensagem de SUCESSO/andamento deixa de usar a cor de erro (vermelho só para o que deu errado). Lista FECHADA de inícios de frase
   conhecidos; qualquer outro texto continua vermelho, como antes (na dúvida, trata como aviso). */
const MSG_OK=/^(Dados enviados ao PLC|PLC limpo|BC\S+ (ligado|desligado): chaves|BC\S+ (incluído|retirado) do ensaio|Caminho copiado|Relatório gerado automaticamente|Troca de resistência registrada|Patamar rearmado|Simulação passou para MANUAL|Gerador operando — clique em INICIAR)/;
const msgGer=(t,ms=10000)=>{ // mensagem de aviso: some em 10 s, ao clicar nela, ao ligar o demo/aplicar, ao zerar ou quando o gerador muda de estado
  const e=$('gmsg');clearTimeout(msgTimer);e.textContent=t||'';e.classList.toggle('ok',!!t&&MSG_OK.test(t));
  if(t&&ms)msgTimer=setTimeout(()=>msgGer(''),ms);
};
$('gmsg').onclick=()=>msgGer('');
async function cmdGerador(acao){
  if(!CMD_URL){msgGer('Comando do gerador não configurado (CMD_URL). Disponível só no demo.');return false}
  if(acao==='stop'&&!confirm('Parar o gerador?'))return false;
  try{const r=await fetch(CMD_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({acao})});if(!r.ok)throw new Error('HTTP '+r.status);return true}
  catch(e){msgGer('Falha ao enviar o comando: '+e.message);return false}
}
async function clickIniciar(){ // v1.9.24: handler único do botão INICIAR — a pedido do operador, "INICIAR CONTAGEM"
  // (botão separado no painel GERADOR) foi removido da tela por ser redundante com este; INICIAR agora faz tudo:
  // no demo também liga o gerador simulado (função que antes só o #bGenStart, agora oculto, fazia).
  msgGer('');
  if($('dlgChSetup').open){msgGer('Setup aberto: feche o popup Setup (calibração das chaves) antes de iniciar o ensaio.');return} // v1.9.76 (decisão do operador: popup aberto trava o INICIAR)
  if($('demo').checked){if(SIM.gen==='parado'){SIM.gen='partindo';SIM.gt=0}}
  else if(GEN.estado!=='—'&&!GEN.run)msgGer('Gerador ainda não está em operação: o tempo do ensaio só conta com o gerador operando (ligar no painel do DSE).');
  iniciaEnsaio(); // ensaio novo: confirma os dados antes de contar o tempo
}
$('bGenStart').onclick=clickIniciar;
const ensaioEmAndamento=()=>MODO!=='carga'&&T.started&&!T.fim&&!T.aguardaFim; // etapas ainda sendo feitas (depois de salvar todas, o ensaio completo é preservado)
let msgFixaAte=0;
function descartaEnsaio(motivo){ // gerador desligou no meio do ensaio: o ensaio é perdido — tudo volta ao zero (as amostras do Registro já gravadas ficam)
  if(!ensaioEmAndamento())return false;
  if(RG.ativo)rgParar('ensaio descartado: '+motivo,true);
  novoEnsaio();
  msgFixaAte=Date.now()+60000;msgGer('Ensaio descartado: '+motivo+'. Para um novo ensaio, clique em START.',60000);
  return true;
}
function vigiaGerador(){ // v1.9.20: a pedido do operador — NÃO descarta mais o ensaio sozinho por o gerador aparentar ter parado
  // (um soluço de comunicação/Modbus pode ler "parado" por alguns segundos sem o gerador real ter parado, e descartar
  // nessa hora perdia etapas já salvas de verdade). Agora só avisa (uma vez); quem decide se é pra encerrar é o operador,
  // clicando em PARAR ENSAIO — o ensaio continua ARMADO caso contrário. Enquanto o gerador não estiver "operando",
  // passoUnit() já não conta tempo de etapa (genRun()), então nenhuma etapa inválida é salva mesmo sem descartar.
  if(!ensaioEmAndamento()){T.viuOp=false;T.paradoDesde=0;return}
  const e=GEN.estado;
  if(e==='operando'){T.viuOp=true;T.paradoDesde=0;return}
  if(T.viuOp&&dadoOk&&(e==='parando'||e==='parado')){
    if(!T.paradoDesde){T.paradoDesde=Date.now();msgGer('Gerador parece ter parado — o ensaio continua ARMADO (nada foi perdido). Se for mesmo o fim, clique em PARAR ENSAIO.',20000)}
  }else T.paradoDesde=0;
}
$('bGenStop').onclick=async()=>{ // STOP do gerador (demo): v1.9.35 — igual ao real: desliga o gerador simulado e o ensaio continua ARMADO, com as etapas já salvas preservadas
  msgGer('');
  if(!$('demo').checked)return; // real: sem função (desligar é no painel do DSE)
  if(SIM.gen==='partindo'||SIM.gen==='operando'){SIM.gen='parando';SIM.gt=0}
  if(typeof window.chSetupGeradorParou==='function')window.chSetupGeradorParou(); // v1.9.71
  if(ensaioEmAndamento())msgGer('Gerador parado — o ensaio continua ARMADO e as etapas salvas foram preservadas. Para continuar, ligue o gerador e clique em INICIAR; se for o fim, use PARAR ENSAIO.',15000);
};
$('bParaEns').onclick=pararEnsaio;
setInterval(passo,250);
addEventListener('beforeunload',e=>{if(MODO!=='carga'&&T.started&&!T.gravado){e.preventDefault();e.returnValue=''}}); // evita perder um ensaio não gravado
