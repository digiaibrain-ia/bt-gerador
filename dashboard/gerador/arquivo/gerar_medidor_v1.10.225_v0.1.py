#!/usr/bin/env python3
"""18/11/2026 - Gera medidor_gerador_v1.10.225.html (de 1.10.224). Nao sobrescreve; aborta se um trecho esperado mudou.
Pedido do Reginaldo (ruido no log): a mesma falha de API repetida (ex.: GET /api/gerador -> 503 a cada ciclo, DSE sem cabo) nao pode virar um evento por tentativa (2291 de 3091 eventos, 74 %, no log da bancada).
O medidor CONTINUA consultando normalmente; so o REGISTRO muda: a 1a falha entra inteira; as repeticoes iguais (mesmo card e mesma acao, a cada <30 s) so contam; a cada 60 s entra UM resumo
com primeira ocorrencia, ultima e contador. Sucesso, outra rota ou outro status = evento normal (a serie recomeca). Eventos que nao sao falha de API nao mudam.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.225_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas')
L = lambda p: open(p, encoding='utf-8').read()
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.224.html'), os.path.join(F, 'medidor_gerador_v1.10.225.html'); assert os.path.exists(o) and not os.path.exists(d)
t = L(o)
t = troca(t, "  function log(card,tipo,acao,res,det,opt){\n    try{\n      opt=opt||{};\n      const e={sessao:SESSAO,n:++N,",
 "  /* v1.10.225: falha de API REPETIDA nao vira um evento por tentativa. 1a falha entra inteira; repeticoes iguais (mesmo card e acao, a cada <30 s) so contam; a cada 60 s entra UM resumo\n"
 "     (primeira, ultima, contador). A consulta continua normal; so o registro muda. Sucesso/outra rota/outro status = evento normal e a serie recomeca. */\n"
 "  const REP={}, REP_JANELA=30000, REP_RESUMO=60000;\n"
 "  window.__obsRepForca=()=>{Object.keys(REP).forEach(k=>{REP[k].emit=0})};   // gancho SO de teste: forca o proximo resumo\n"
 "  function log(card,tipo,acao,res,det,opt){\n    try{\n      opt=opt||{};\n"
 "      if(tipo==='api'&&res==='falha'&&!opt.ts){const rk=(card||'app')+'|'+acao,ag=Date.now(),r=REP[rk];\n"
 "        if(r&&ag-r.ult<REP_JANELA){r.n++;r.ult=ag;if(ag-r.emit<REP_RESUMO)return null;r.emit=ag;\n"
 "          const hh=ms=>new Date(ms).toTimeString().slice(0,8);acao=acao+' — repetido ×'+r.n+' desde '+hh(r.t0);det=Object.assign({},det||{},{vezes:r.n,primeira:new Date(r.t0).toISOString(),ultima:new Date(ag).toISOString()})}\n"
 "        else REP[rk]={t0:ag,ult:ag,n:1,emit:ag}}\n"
 "      const e={sessao:SESSAO,n:++N,", 'log')
t = troca(t, '<meta name="app-version" content="1.10.224">', '<meta name="app-version" content="1.10.225">', 'meta')
hist = ("  {v:\"1.10.225\",d:\"18/11/2026\",i:[\n"
 "    'Menos ruído no log (pedido do Reginaldo): a mesma falha de API repetida (ex.: GET /api/gerador → 503 a cada ciclo, com o DSE sem cabo; eram 2291 de 3091 eventos no log da bancada) deixa de gerar um evento por tentativa. O medidor continua consultando normalmente; só o registro muda: a 1ª falha entra inteira, as repetições iguais só contam e a cada 60 s entra UM resumo com a primeira ocorrência, a última e o contador. Sucesso, outra rota ou outro status = evento normal.'\n"
 "  ]},\n")
t = troca(t, "const VERSAO='1.10.224', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n", "const VERSAO='1.10.225', VERSAO_DATA='18/11/2026';\nconst HISTORICO=[\n" + hist, 'versao')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.225.html ok')
