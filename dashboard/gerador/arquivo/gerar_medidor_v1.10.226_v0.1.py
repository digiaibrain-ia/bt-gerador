#!/usr/bin/env python3
"""18/11/2026 - Gera medidor_gerador_v1.10.226.html (de 1.10.225). Nao sobrescreve; aborta se um trecho esperado mudou.
Pedido do Reginaldo (alarme inteligente): (1) novo TIPO de ocorrencia INFORMACAO (I): registrada junto com Alerta e Falha, mas NAO conta nos botoes/contadores de Alertas e Falhas nem no triangulo dos cards
(nao exige acao do operador); filtro "Informacoes" no dialogo e no historico. (2) DSE-001 "nao conectado" (nunca foi visto) passa a ser Informacao; "perdeu a conexao" continua Falha.
(3) explicacao dos nomes (alarme incomodo, inundacao, repetido, permanente, fugaz, bad actor, relacao sinal/ruido) dentro do dialogo de Alertas e Falhas, na Legenda.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.226_v0.1.py"""
import os, re
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas')
L = lambda p: open(p, encoding='utf-8').read()
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.225.html'), os.path.join(F, 'medidor_gerador_v1.10.226.html'); assert os.path.exists(o) and not os.path.exists(d)
t = L(o)
# --- regiao do registro de ocorrencias (OCOR)
a = t.index('const OCOR'); b = t.index('window.OCOR=OCOR'); s = t[a:b]
n1 = len(re.findall(r"(\b[\w.]+)==='f'\?'Falha':'Alerta'", s)); assert n1 == 6, n1
s = re.sub(r"(\b[\w.]+)==='f'\?'Falha':'Alerta'", r"nomeTipo(\1)", s)
n2 = len(re.findall(r"(\b[\w.]+)==='f'\?'tf':'tm'", s)); assert n2 == 2, n2
s = re.sub(r"(\b[\w.]+)==='f'\?'tf':'tm'", r"(\1==='f'?'tf':\1==='i'?'ti':'tm')", s)
t = t[:a] + s + t[b:]
# 1) tipo 'i' no registro
t = troca(t, "const tipo=opc.tipo?(String(opc.tipo)[0]==='m'?'m':'f'):(cat.t||'f');", "const _t0=opc.tipo?String(opc.tipo)[0]:(cat.t||'f'),tipo=_t0==='m'?'m':_t0==='i'?'i':'f';   /* v1.10.226: i = Informacao */", 'tipo')
t = troca(t, 'const codExib=(cod,tipo,ref)=>(tipo==="f"?"F":"A")+"-"', 'const nomeTipo=tp=>tp===\'f\'?\'Falha\':tp===\'i\'?\'Informação\':\'Alerta\';   // v1.10.226\n  const codExib=(cod,tipo,ref)=>(tipo==="f"?"F":tipo==="i"?"I":"A")+"-"', 'codExib')
# 2) contadores: informacao NAO conta em Alertas/Falhas, nem no triangulo dos cards
t = troca(t, "const at=ativas(),tot=at.length,nf=at.filter(o=>o.tipo==='f').length,na=tot-nf,bA=$('bAlertas'),bF=$('bFalhas');", "const at=ativas().filter(o=>o.tipo!=='i'),tot=at.length,nf=at.filter(o=>o.tipo==='f').length,na=tot-nf,bA=$('bAlertas'),bF=$('bFalhas');   /* v1.10.226: Informacao nao conta aqui */", 'contadores')
t = troca(t, "const t=TRI[card]||criaTri(card),n=ativas(card).length,h=cabecalho(sec);\n      {const nfc=ativas(card).filter(o=>o.tipo==='f').length;", "const t=TRI[card]||criaTri(card),n=ativas(card).filter(o=>o.tipo!=='i').length,h=cabecalho(sec);\n      {const nfc=ativas(card).filter(o=>o.tipo==='f').length;", 'triangulo')
# 3) dialogo: filtro Informacoes
t = troca(t, '<button type="button" data-t="m">Alertas</button><button type="button" data-t="f">Falhas</button></span>\n', '<button type="button" data-t="m">Alertas</button><button type="button" data-t="f">Falhas</button><button type="button" data-t="i">Informações</button></span>\n', 'btn')
t = troca(t, "let tiposOn={m:true,f:true};", "let tiposOn={m:true,f:true,i:false};", 'tiposOn')
t = troca(t, ".filter(o=>tiposOn[o.tipo==='f'?'f':'m']);", ".filter(o=>tiposOn[o.tipo==='i'?'i':(o.tipo==='f'?'f':'m')]);", 'vis')
t = troca(t, "nA=todas.filter(o=>o.ativa).length,nF=todas.filter(o=>o.ativa&&o.tipo==='f').length,nM=todas.filter(o=>o.ativa&&o.tipo==='m').length,nN=todas.length-nA;",
          "nA=todas.filter(o=>o.ativa&&o.tipo!=='i').length,nF=todas.filter(o=>o.ativa&&o.tipo==='f').length,nM=todas.filter(o=>o.ativa&&o.tipo==='m').length,nI=todas.filter(o=>o.ativa&&o.tipo==='i').length,nN=todas.length-todas.filter(o=>o.ativa).length;", 'nA')
t = troca(t, "st('Falhas ativas',nF,nF>0)+st('Alertas ativos',nM)+st('Normalizadas',nN);", "st('Falhas ativas',nF,nF>0)+st('Alertas ativos',nM)+st('Informações',nI)+st('Normalizadas',nN);", 'stats')
t = troca(t, "b.textContent=(b.dataset.t==='f'?'Falhas ':'Alertas ')+(b.dataset.t==='f'?nF:nM)", "b.textContent=(b.dataset.t==='f'?'Falhas ':b.dataset.t==='i'?'Informações ':'Alertas ')+(b.dataset.t==='f'?nF:b.dataset.t==='i'?nI:nM)", 'label')
t = troca(t, "tiposOn=tipo==='m'?{m:true,f:false}:tipo==='f'?{m:false,f:true}:{m:true,f:true};", "tiposOn=tipo==='m'?{m:true,f:false,i:false}:tipo==='f'?{m:false,f:true,i:false}:tipo==='i'?{m:false,f:false,i:true}:{m:true,f:true,i:false};", 'abre')
t = troca(t, "const t=b.dataset.t,o=t==='f'?'m':'f';if(tiposOn[t]&&!tiposOn[o])return;tiposOn[t]=!tiposOn[t];janela()", "const t=b.dataset.t;if(tiposOn[t]&&!['m','f','i'].some(k=>k!==t&&tiposOn[k]))return;tiposOn[t]=!tiposOn[t];janela()", 'toggle')
# 4) historico: filtro Informacoes
t = troca(t, '<button type="button" data-t="m">Alertas</button></span>', '<button type="button" data-t="m">Alertas</button><button type="button" data-t="i">Informações</button></span>', 'hbtn')
# 5) DSE-001: "nao conectado" (nunca visto) = Informacao; "perdeu a conexao" = Falha
t = troca(t, "const liga=(cond,cod,txt,ref)=>{if(cond)set(null,cod,txt,{ref});else limpa(null,cod,ref)};", "const liga=(cond,cod,txt,ref,tipo)=>{if(cond)set(null,cod,txt,tipo?{ref,tipo}:{ref});else limpa(null,cod,ref)};", 'liga')
t = troca(t, "não responde'));}", "não responde'),undefined,visto?'f':'i');}   /* v1.10.226: nunca conectou = Informacao; perdeu = Falha */", 'dse')
# 6) log da ocorrencia
t = troca(t, "r&&r.tipo==='m'?'aviso':'falha'", "r&&r.tipo==='i'?'info':(r&&r.tipo==='m'?'aviso':'falha')", 'log')
# 7) Central de registros (CSV)
t = troca(t, "x.tipo === 'f' ? 'Falha' : 'Alerta'", "x.tipo === 'f' ? 'Falha' : x.tipo === 'i' ? 'Informação' : 'Alerta'", 'central')
# 8) CSS
t = troca(t, "  #ocTipos button.on[data-t=f]{background:#fff4f2;border-color:#d92d20;color:#8a1c15;font-weight:700;box-shadow:inset 0 0 0 1px #d92d20}\n",
          "  #ocTipos button.on[data-t=f]{background:#fff4f2;border-color:#d92d20;color:#8a1c15;font-weight:700;box-shadow:inset 0 0 0 1px #d92d20}\n  #ocTipos button.on[data-t=i]{background:#e8f1fd;border-color:#3f82e8;color:#173e7a;font-weight:700}\n  #dlgOcor td.ti{color:#1f5fbf}\n  #dlgOcor .ocglos{margin-top:8px;font-size:12.5px;line-height:1.45}#dlgOcor .ocglos dt{font-weight:700;margin-top:6px}#dlgOcor .ocglos dd{margin:0 0 0 14px}\n", 'css')
# 9) legenda: tipo I + glossario dentro do dialogo
t = troca(t, "<b>T</b> = F (Falha: algo não funciona) ou A (Alerta: atenção/orientação)", "<b>T</b> = F (Falha: algo não funciona), A (Alerta: atenção/orientação) ou I (Informação: só registro, não exige ação)", 'leg1')
glos = ("  const GLOSSARIO='<details class=\"ocglos\"><summary><b>Entenda os nomes</b> (alarme incômodo, inundação, repetido…)</summary><dl>'"
 "+'<dt>Alarme incômodo (nuisance alarm)</dt><dd>Avisa demais, sem necessidade, ou não volta ao normal mesmo depois de o operador agir. Atrapalha e ensina o operador a ignorar.</dd>'"
 "+'<dt>Inundação de alarmes (alarm flood)</dt><dd>Chegam alarmes demais em pouco tempo para uma pessoa tratar (referência: mais de 10 em 10 minutos). O que importa fica escondido no meio.</dd>'"
 "+'<dt>Repetido (chattering)</dt><dd>Liga e desliga muitas vezes seguidas, ou a mesma falha se repete a cada consulta. Aqui vira um registro só, com contador, primeira e última ocorrência.</dd>'"
 "+'<dt>Permanente (standing / stale)</dt><dd>Fica ativo por horas e ninguém age. Candidato a virar Informação.</dd>'"
 "+'<dt>Fugaz (fleeting)</dt><dd>Aparece e some em poucos segundos, sem dar tempo de agir.</dd>'"
 "+'<dt>Alarme campeão (bad actor)</dt><dd>Um alarme que sozinho responde por boa parte do volume. Achar e tratar esse resolve a maior parte do ruído.</dd>'"
 "+'<dt>Relação sinal/ruído</dt><dd>Sinal = o que exige ação (a 1ª falha, a mudança de estado). Ruído = a mesma coisa repetida. O objetivo é mais sinal e menos ruído, sem jogar sinal fora.</dd>'"
 "+'<dt>Informação (I)</dt><dd>Fato que vale registrar mas não exige ação do operador (ex.: DSE que nunca foi conectado). Aparece neste diálogo e no histórico, mas não conta nos botões Alertas e Falhas.</dd>'"
 "+'<dt>Regra de ouro</dt><dd>Todo alarme deve ter uma ação que o operador possa tomar. O que não tem ação é Informação.</dd></dl></details>';\n")
t = troca(t, "  function legendaHtml(){\n    const cods=", glos + "  function legendaHtml(){return legendaBase()+GLOSSARIO}\n  function legendaBase(){\n    const cods=", 'leg2')
t = troca(t, '<meta name="app-version" content="1.10.225">', '<meta name="app-version" content="1.10.226">', 'meta')
hist = ("  {v:\"1.10.226\",d:\"18/11/2026\",i:[\n"
 "    'Alarme inteligente (pedido do Reginaldo): novo tipo de ocorrência INFORMAÇÃO (I), registrado junto com Alerta e Falha (diálogo e histórico, com filtro próprio), mas que NÃO conta nos botões Alertas/Falhas nem no triângulo dos cards, porque não exige ação do operador. DSE-001 \"não conectado\" (o DSE nunca foi visto, ex.: cabo não ligado) passa a ser Informação; \"perdeu a conexão\" continua Falha. A explicação dos nomes (alarme incômodo, inundação de alarmes, repetido, permanente, fugaz, alarme campeão, relação sinal/ruído) está dentro do diálogo, em ⓘ Legenda.'\n"
 "  ]},\n")
t = troca(t, "const VERSAO='1.10.225', VERSAO_DATA='18/11/2026';\nconst HISTORICO=[\n", "const VERSAO='1.10.226', VERSAO_DATA='18/11/2026';\nconst HISTORICO=[\n" + hist, 'versao')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.226.html ok')
