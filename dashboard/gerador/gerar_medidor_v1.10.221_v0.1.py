#!/usr/bin/env python3
"""17/11/2026 - Gera medidor_gerador_v1.10.221.html (de 1.10.220). Nao sobrescreve; aborta se um trecho esperado mudou.
Teste de bancada do Reginaldo (Patamar com PLC + SIDSE): (1) a chave desmarcada e marcada de novo nao refletia no tracejado (G.sug nao acompanhava o clique do operador depois do Aplicar);
(2) o tracejado "sugerido" deve SUMIR 10 s depois que a carga chegou ao degrau (evita confusao visual); (3) o botao Sugerir chaves nao funciona com o cronometro (Iniciar) ativo, so com ele desligado
(Aplicar continua livre, para o operador poder desmarcar/marcar chaves); (4) um unico controle de ligar o Patamar: o do MODO (Salvamento Por patamar); no dialogo o botao Ligar/Desligar sai e fica so a sinalizacao.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.221_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas')
L = lambda p: open(p, encoding='utf-8').read()
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.220.html'), os.path.join(F, 'medidor_gerador_v1.10.221.html'); assert os.path.exists(o) and not os.path.exists(d)
t = L(o)
# 1) clique do operador acompanha o tracejado (sugestao) quando o Patamar esta ligado
t = troca(t, "    if(e.isTrusted&&window.PATAMAR_PENDENTE&&window.PATAMAR_PENDENTE()){window.PATAMAR_EDITA(+t.dataset.i);",
          "    if(e.isTrusted&&window.PATAMAR_SINC_CLIQUE)window.PATAMAR_SINC_CLIQUE(+t.dataset.i);   /* v1.10.221: o tracejado acompanha a escolha do operador (desmarcou/marcou de novo) */\n"
          "    if(e.isTrusted&&window.PATAMAR_PENDENTE&&window.PATAMAR_PENDENTE()){window.PATAMAR_EDITA(+t.dataset.i);", 'clique')
t = troca(t, "  window.PATAMAR_EDITA=i=>{",
          "  /** v1.10.221: clique do operador numa chave com o Patamar ligado: a sugestao (tracejado) passa a refletir o novo estado desejado. Nao comanda nada (o comando segue o caminho de sempre). */\n"
          "  window.PATAMAR_SINC_CLIQUE=i=>{try{if(!mae.armada)return;const alvo=bancosAtivos().find(({b,bi})=>i>=off(bi)&&i<off(bi)+b.chaves.length);if(!alvo||DIS[i])return;const b=alvo.b,j=i-off(alvo.bi);\n"
          "    const s=(G.sug[b.id]=G.sug[b.id]||b.chaves.map(()=>false));s[j]=!cmdDe(i);atingiuDesde=0;ultA='';pinta()}catch(x){}};\n"
          "  window.PATAMAR_EDITA=i=>{", 'sinc')
# 2) tracejado some 10 s depois que a carga chegou ao degrau
t = troca(t, "  function pinta(){bkNascimento();\n",
          "  /* v1.10.221: o tracejado (sugestao) some 10 s depois que a carga CHEGOU ao degrau (aplicado e dentro da banda); volta se a carga sair da banda ou o operador mexer numa chave. */\n"
          "  let atingiuDesde=0,atingiuEt=-1;\n"
          "  function tracejadoVencido(){try{const ai=aplicarInfo();if(!T.started||T.fim||ai.liberado||typeof carga!=='number'||!dadoOk||!(ai.alvoPct>0)){atingiuDesde=0;return false}\n"
          "    const banda=window.PATAMAR_BANDA_PP?window.PATAMAR_BANDA_PP():3;if(atingiuEt!==ai.et){atingiuEt=ai.et;atingiuDesde=0}\n"
          "    if(Math.abs(carga-ai.alvoPct)<=banda){if(!atingiuDesde)atingiuDesde=Date.now();return Date.now()-atingiuDesde>=10000/Math.max(1,T.sp||1)}   /* 10 s de ensaio: no acelerado (Demo 10x) encolhe junto com o relogio */atingiuDesde=0;return false}catch(x){return false}}\n"
          "  function pinta(){bkNascimento();\n", 'pinta1')
t = troca(t, "document.querySelectorAll('#bancos .tile[data-i]').forEach(t=>t.classList.toggle('sug',(dlg.open||mae.armada)&&marca.has(+t.dataset.i)));",
          "{const venc=tracejadoVencido();document.querySelectorAll('#bancos .tile[data-i]').forEach(t=>t.classList.toggle('sug',(dlg.open||mae.armada)&&marca.has(+t.dataset.i)&&!venc))}", 'pinta2')
# 3) Sugerir chaves so com o cronometro (Iniciar) desligado
t = troca(t, "if(a==='sug'){G.manualSug=true;sugere()}",
          "if(a==='sug'){if(T.started&&!T.fim){G.msg='Sugerir chaves só funciona com o cronômetro desligado (Iniciar). Durante o ensaio, o Patamar escolhe as chaves; use Aplicar ou clique nas chaves para ajustar.';msgGer(G.msg,6000);desenha();return}G.manualSug=true;sugere()}", 'sug')
# 4) um unico controle de ligar o Patamar: o do MODO. O dialogo so sinaliza.
a = t.index('<button type="button" data-gd="rodar"'); b = t.index('</button>', a) + 9
t = t[:a] + "<span class=\"gd-estado\" title=\"Estado do Patamar Guiado. Para ligar ou desligar: ⚙ Modo › Salvamento › Por patamar.\">'+(mae.armada?'Patamar: On':'Patamar: Off')+'</span>" + t[b:]
t = troca(t, "  if(PORPAT&&!G.guiadoOn)G.guiadoOn=true;\n", "  G.guiadoOff=false;   /* v1.10.221: sem botao Ligar/Desligar no dialogo, o que ficou guardado como desligado manualmente nao pode prender o Patamar */\n  if(PORPAT&&!G.guiadoOn)G.guiadoOn=true;\n", 'guiadoOff')
# 2b) o tracejado precisa ser reavaliado a cada ciclo de 1 s (antes so repintava quando o dialogo mexia)
t = troca(t, "    try{mae.ciclo()}catch(x){console.error('FBs virtuais',x)}\n", "    try{mae.ciclo()}catch(x){console.error('FBs virtuais',x)}\n    try{if(mae.armada)pinta()}catch(x){}   /* v1.10.221: reavalia o tracejado (some 10 s depois que a carga chegou ao degrau) */\n", 'ciclo')
# versao
t = troca(t, '<meta name="app-version" content="1.10.220">', '<meta name="app-version" content="1.10.221">', 'meta')
hist = ("  {v:\"1.10.221\",d:\"17/11/2026\",i:[\n"
 "    'Teste de bancada (Patamar com PLC + SIDSE): (1) desmarcou uma chave, aplicou e clicou nela de novo: o tracejado (sugestão) não acompanhava o clique; agora acompanha a escolha do operador (desmarcar tira, marcar de novo devolve). (2) O tracejado some 10 s (de ensaio; no Demo acelerado encolhe com o relogio) depois que a carga chegou ao degrau (aplicado e dentro da banda); volta se a carga sair da banda ou se o operador mexer numa chave. (3) Sugerir chaves só funciona com o cronômetro (Iniciar) desligado; durante o ensaio mostra aviso. Aplicar continua livre. (4) O Ligar/Desligar Patamar Guiado saiu do diálogo: o controle é só o do ⚙ Modo (Salvamento › Por patamar); o diálogo e o cabeçalho só sinalizam Patamar: On/Off.'\n"
 "  ]},\n")
t = troca(t, "const VERSAO='1.10.220', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n", "const VERSAO='1.10.221', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n" + hist, 'versao')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.221.html ok')
