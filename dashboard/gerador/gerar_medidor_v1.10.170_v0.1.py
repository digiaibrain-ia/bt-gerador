#!/usr/bin/env python3
"""Fase 4, Portao C - gera medidor_gerador_v1.10.170.html a partir da v1.10.169 (nao sobrescreve; aborta se um trecho esperado mudou).
C1 animacao discreta dos triangulos (falha: brilho vermelho lento; alerta: ambar mais fraco; respeita "reduzir movimento").
C2 troubleshooter Efeito -> Causa -> Solucao por codigo (coluna "Roteiro" na janela Alertas e Falhas), com "Copiar diagnostico".
C3 legenda (botao "i Legenda") do catalogo de codigos, gerada do mesmo catalogo.
C4 "Cards x flow" abria ATRAS do Demo: dlgDemo e modal (camada de cima) e dlgDevCards era aberto como janela comum; agora tambem e modal.
C5 DSE-001 distingue "API fora" de "API no ar mas o Modbus do DSE nao conecta" (le o diag do corpo 503 do /api/gerador).
O roteiro de causas/solucoes e a v0.1 e precisa da validacao do Reginaldo (a tela avisa isso no rodape do painel).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.170_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.169.html', 'medidor_gerador_v1.10.170.html'


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


CSS = r"""
  /* v1.10.170 (Fase 4, Portão C): animação DISCRETA dos triângulos (só quando há ocorrência ativa; para com "reduzir movimento") */
  .ocb.f svg{animation:ocPulsoF 2.6s ease-in-out infinite}
  .ocb.m svg{animation:ocPulsoM 3.8s ease-in-out infinite}
  .ocb.novo.f svg{animation:ocbalanca .9s ease-out 1,ocPulsoF 2.6s ease-in-out .9s infinite}
  .ocb.novo.m svg{animation:ocbalanca .9s ease-out 1,ocPulsoM 3.8s ease-in-out .9s infinite}
  #bFalhas.tem svg{animation:ocPulsoF 2.6s ease-in-out infinite}
  #bAlertas.tem svg{animation:ocPulsoM 3.8s ease-in-out infinite}
  @keyframes ocPulsoF{0%,100%{filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}50%{filter:drop-shadow(0 0 5px rgba(217,45,32,.95)) drop-shadow(0 1px 1px rgba(0,0,0,.3))}}
  @keyframes ocPulsoM{0%,100%{filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}50%{filter:drop-shadow(0 0 3px rgba(224,160,0,.8)) drop-shadow(0 1px 1px rgba(0,0,0,.3))}}
  @media (prefers-reduced-motion:reduce){.ocb.f svg,.ocb.m svg,.ocb.novo.f svg,.ocb.novo.m svg,#bFalhas.tem svg,#bAlertas.tem svg{animation:none}}
  /* v1.10.170: troubleshooter (Efeito -> Causa -> Solução) e legenda na janela Alertas e Falhas */
  #dlgOcor td.tgl{white-space:nowrap}
  #dlgOcor .ocx{border:1px solid #c9a24a;background:#fff8e6;color:#6b4a00;border-radius:4px;padding:1px 7px;font-size:11.5px;cursor:pointer}
  #dlgOcor .ocx:focus-visible{outline:2px solid var(--blue);outline-offset:1px}
  #dlgOcor tr.oct>td{background:#fffaf0;border-top:0;padding:8px 10px 12px}
  #dlgOcor .ocp{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
  @media (max-width:900px){#dlgOcor .ocp{grid-template-columns:1fr}}
  #dlgOcor .ocp h4{margin:0 0 4px;font-size:12px;color:#5a4300;letter-spacing:.02em}
  #dlgOcor .ocp ol{margin:0;padding-left:18px}
  #dlgOcor .ocp li{margin:0 0 6px}
  #dlgOcor .ocp .mut{color:#51606f;font-size:11.5px}
  #dlgOcor .ocp .chip{display:inline-block;font-size:10.5px;border-radius:9px;padding:0 6px;margin-left:4px;white-space:nowrap}
  #dlgOcor .ocp .chip.pc{background:#dbeafe;color:#1a4a78}
  #dlgOcor .ocp .chip.tela{background:#e3f1e6;color:#1f6b3a}
  #dlgOcor .ocp .chip.bancada{background:#fde7c8;color:#8a4b00}
  #dlgOcor .ocrod{margin-top:8px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
  #dlgOcor .oclegenda{border:1px solid #c7d0da;background:#fff;padding:8px 10px;margin-bottom:8px;font-size:12px}
  #dlgOcor .oclegenda[hidden]{display:none}
  #dlgOcor .oclegenda table{margin-top:6px}
"""

TROUBLE_JS = r"""
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
  function causasDe(o){const T=TROUBLE[o.cod];if(!T)return [];let c=T.causas;if(typeof T.ordena==='function'){try{c=T.ordena(c.slice(),o)}catch(e){}}return c}
  function dinDe(o){const T=TROUBLE[o.cod];if(T&&typeof T.dyn==='function'){try{return T.dyn(o)||[]}catch(e){}}return []}
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
    L.push('Código: '+codExib(o.cod,o.tipo,o.ref)+' ('+(o.tipo==='f'?'Falha':'Alerta')+') · Card: '+nomeCard(o.card)+' · desde '+dataHora(o.desde)+' · '+o.vezes+' vez(es) · '+(o.ativa?'ATIVA':'normalizada'));
    L.push('Efeito: '+(T?T.efeito:o.txt));L.push('Texto: '+o.txt);din.forEach(x=>L.push('  - '+x));
    cs.forEach((c,i)=>{L.push('Causa '+(i+1)+': '+c.t);L.push('  Teste: '+c.teste);c.sol.forEach(s=>L.push('  Solução ['+(ONDE[s[1]]||s[1])+']: '+s[0]))});
    return L.join('\n');
  }
  function copiaDiag(o){
    const t=textoDiag(o),ok=()=>{$('ocStatus').textContent='Diagnóstico copiado às '+hhmmss(Date.now())};
    const fb=()=>{const a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(e){$('ocStatus').textContent='Não consegui copiar: selecione o texto e copie à mão'}a.remove()};
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,fb);else fb();
  }
  function legendaHtml(){
    const cods=Object.keys(CAT).sort();
    return '<b>Como ler o código</b> — formato <code>T-AAA-NNN</code>: <b>T</b> = F (Falha: algo não funciona) ou A (Alerta: atenção/orientação); <b>AAA</b> = a área (COM comunicação · DSE gerador · CHV chaves/banco · ENS ensaio · SIS a própria tela); <b>NNN</b> = o número. O triângulo do card pisca devagar quando há ocorrência ativa; ele some quando a causa some. Clique em “▸ Roteiro” na linha para ver Efeito → Causa → Solução.'
      +'<table><thead><tr><th>Código</th><th>Tipo</th><th>Card</th><th>O que significa</th></tr></thead><tbody>'
      +cods.map(c=>{const x=CAT[c];return '<tr><td class="cod">'+esc(codExib(c,x.t,''))+'</td><td>'+(x.t==='f'?'Falha':'Alerta')+'</td><td>'+esc(nomeCard(x.card))+'</td><td>'+esc(x.txt)+'</td></tr>'}).join('')+'</tbody></table>';
  }
"""

LISTENERS_JS = r"""
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
"""


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.169">', '<meta name="app-version" content="1.10.170">', 'meta')
    t = troca(t, "const VERSAO='1.10.169', VERSAO_DATA='06/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.170', VERSAO_DATA='06/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.170\",d:\"06/11/2026\",i:[\n"
              "    'ALERTAS E FALHAS VIRAM TROUBLESHOOTER: cada linha ganhou o botão \"▸ Roteiro\" com Efeito (o sintoma) → Causa (a raiz, com um teste rápido) → Solução (passos, marcados \"No PC / Node-RED\", \"Na tela\" ou \"Depende de bancada/TI\") e o botão \"Copiar diagnóstico\" para colar no chat. Roteiro v0.1: precisa da validação do Reginaldo. Nada aqui comanda PLC, DSE ou chaves.',\n"
              "    'Botão \"ⓘ Legenda\" na janela Alertas e Falhas: explica o formato do código (T-AAA-NNN) e lista todos os códigos do catálogo.',\n"
              "    'Animação discreta dos triângulos: pulso lento vermelho quando há FALHA ativa e âmbar mais fraco para alerta (não anima com \"reduzir movimento\" do sistema).',\n"
              "    'DSE-001 passou a diferenciar \"API fora do ar\" de \"API no ar, mas o Modbus do DSE não conecta\" (mostra o status e o último erro do Modbus; usa o diagnóstico que o /api/gerador devolve mesmo no 503).',\n"
              "    'CORREÇÃO: o popup \"Cards x flow\" (só desenvolvedor) abria ATRÁS do popup Demo; agora abre por cima.',\n"
              "  ]},\n", 'historico')
    # C1: CSS + classes f/m nos triangulos
    t = troca(t, "  .ocb.novo svg{animation:ocbalanca .9s ease-out 1}\n", "  .ocb.novo svg{animation:ocbalanca .9s ease-out 1}\n" + CSS, 'css')
    t = troca(t, "const t=TRI[card]||criaTri(card),n=ativas(card).length,h=cabecalho(sec);",
              "const t=TRI[card]||criaTri(card),n=ativas(card).length,h=cabecalho(sec);\n"
              "      {const nfc=ativas(card).filter(o=>o.tipo==='f').length;t.btn.classList.toggle('f',nfc>0);t.btn.classList.toggle('m',n>0&&nfc===0)} // v1.10.170: pulso discreto (falha vermelho / alerta âmbar)", 'tri classes')
    # C3 + C2: HTML da janela
    t = troca(t, '<button type="button" class="bt s" id="ocHist"',
              '<button type="button" class="bt s" id="ocLeg" aria-expanded="false" title="Legenda dos códigos (T-AAA-NNN)">ⓘ Legenda</button>\n      <button type="button" class="bt s" id="ocHist"', 'botao legenda')
    t = troca(t, '<div class="ocprt" id="ocPrt"></div>', '<div class="ocprt" id="ocPrt"></div>\n    <div class="oclegenda" id="ocLegenda" hidden></div>', 'container legenda')
    t = troca(t, '<thead><tr><th>Desde</th><th>Tipo</th><th>Card</th><th>Código</th><th>Texto</th><th>Estado</th><th>Vezes</th></tr></thead>',
              '<thead><tr><th>Desde</th><th>Tipo</th><th>Card</th><th>Código</th><th>Texto</th><th>Estado</th><th>Vezes</th><th>Roteiro</th></tr></thead>', 'thead')
    t = troca(t, '<td class="cod">${esc(codExib(o.cod,o.tipo,o.ref))}</td>', '<td class="cod" title="${esc((CAT[o.cod]||{}).txt||\'\')}">${esc(codExib(o.cod,o.tipo,o.ref))}</td>', 'tooltip codigo')
    t = troca(t, "<td>${o.vezes}</td></tr>`).join('');",
              "<td>${o.vezes}</td><td class=\"tgl\"><button type=\"button\" class=\"ocx\" data-k=\"${esc(KEY(o))}\" aria-expanded=\"${ABERTOS.has(KEY(o))?'true':'false'}\" title=\"Efeito, causa e solução\">${ABERTOS.has(KEY(o))?'▾':'▸'} Roteiro</button></td></tr>${ABERTOS.has(KEY(o))?painelLinha(o):''}`).join('');", 'linha')
    t = troca(t, "    'SIS-001':{t:'f',card:'app', txt:'Erro interno da tela'}\n  };\n", "    'SIS-001':{t:'f',card:'app', txt:'Erro interno da tela'}\n  };\n" + TROUBLE_JS, 'insere trouble')
    t = troca(t, "  function abre(card,tipo){   // tipo: 'm' (Alertas), 'f' (Falhas) ou nada (os dois, como antes)", LISTENERS_JS + "  function abre(card,tipo){   // tipo: 'm' (Alertas), 'f' (Falhas) ou nada (os dois, como antes)", 'listeners')
    # C4: Cards x flow por cima do Demo
    t = troca(t, "modais:['dlgDados','dlgFim','dlgResalva','dlgEtapa','dlgParam','dlgAgua','dlgDemo'],", "modais:['dlgDados','dlgFim','dlgResalva','dlgEtapa','dlgParam','dlgAgua','dlgDemo','dlgDevCards'],   // v1.10.170: dlgDevCards abre de dentro do Demo (modal): tem de ser modal tambem, senao fica ATRAS dele. Antes:", 'modais')
    # C5: diag do /api/gerador, mesmo no 503
    t = troca(t, "      if(!r.ok)throw new Error('HTTP '+r.status+' do servidor de telemetria');",
              "      LINK.dse.http=null;LINK.dse.diag=null;\n"
              "      if(!r.ok){LINK.dse.http=r.status;try{const jb=await r.json();LINK.dse.diag=(jb&&jb.diag)||null}catch(e){}throw new Error('HTTP '+r.status+' do servidor de telemetria')} // v1.10.170: o 503 do /api/gerador traz o diag (status do Modbus)", 'tick http')
    t = troca(t, "    LINK.dse.ok=true;LINK.dse.visto=true;LINK.dse.ts=Date.now();",
              "    LINK.dse.ok=true;LINK.dse.visto=true;LINK.dse.ts=Date.now();LINK.dse.http=200;LINK.dse.diag=(d&&d.diag)||null;", 'tick ok')
    t = troca(t, "(visto?'perdeu a conexão':'não conectado')+' — a API do gerador (/api/gerador) não responde');}",
              "(visto?'perdeu a conexão':'não conectado')+((LINK.dse.http&&LINK.dse.diag&&LINK.dse.diag.statusModbus)?' — a API responde (HTTP '+LINK.dse.http+'), mas o Modbus do DSE não conecta (status: '+LINK.dse.diag.statusModbus+(LINK.dse.diag.ultimoErro?'; último erro: '+LINK.dse.diag.ultimoErro:'')+')':' — a API do gerador (/api/gerador) não responde'));}", 'dse-001 texto')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
