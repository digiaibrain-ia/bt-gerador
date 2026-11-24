#!/usr/bin/env python3
"""17/11/2026 - Gera medidor_gerador_v1.10.219.html (de 1.10.218). Nao sobrescreve; aborta se um trecho esperado mudou.
Pedido do Reginaldo: o relogio do patamar MANUAL so deve soltar quando a carga ATINGIR o degrau (e nao so quando o operador clica em Aplicar); o operador continua podendo
desmarcar uma chave, aplicar e depois clicar na chave que falta (a mesma ou outra).
Regra: patamar manual (Por patamar, alvo > 0) segura o relogio ate (a) o operador aplicar E (b) a carga estar dentro da BANDA do degrau.
BANDA = max(3 pontos, melhor erro possivel do banco para aquele alvo + 1,5): so um degrau realmente alcancavel libera; chave grossa (erro minimo grande) nao trava o ensaio.
Ex.: 107 % com 40 kW a 100 %: 39 kW (97,5 %) segura, 40 kW (100 %) segura, 42 kW (105 %) e 43 kW (107,5 %) soltam. A tolerancia de estabilidade (TOL) continua valendo depois.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.219_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.218.html'), os.path.join(F, 'medidor_gerador_v1.10.219.html'); assert os.path.exists(o) and not os.path.exists(d)
t = open(o, encoding='utf-8').read()
# 1) funcao global: segura se manual sem aplicar OU aplicado mas carga fora da banda do degrau
velha = "window.PATAMAR_AGUARDA_APLICAR=()=>{try{return aplicarInfo().liberado===true}catch(e){return false}};\n"
nova = ("window.PATAMAR_AGUARDA_APLICAR=()=>{try{\n"
        "  if(aplicarInfo().liberado===true)return true;   // manual e ainda sem Aplicar\n"
        "  const i=Math.min(T.et,ETAPAS.length-1);\n"
        "  if(!(PORPAT&&T.started&&!T.fim&&ETAPAS[i].alvo>0&&modoAplicaEt(i)==='M'))return false;\n"
        "  if(typeof carga!=='number'||!dadoOk)return false;   // sem leitura valida: nao segura (o relogio ja nao corre sem leitura)\n"
        "  const banda=window.PATAMAR_BANDA_PP?window.PATAMAR_BANDA_PP():3;\n"
        "  return Math.abs(carga-ETAPAS[i].alvo)>banda;   // v1.10.219: aplicado, mas a carga ainda nao chegou ao degrau\n"
        "}catch(e){return false}};\n")
t = troca(t, velha, nova, 'funcao')
# 2) banda: dentro do modulo do Patamar (usa entrada(), R, G); calculada 1x por combinacao etapa/kW/limite/chaves habilitadas
ancora = "  window.PATAMAR_ESCALONANDO=()=>Date.now()<escAte;"
banda = ("  /** v1.10.219: BANDA (pontos %) em que a carga conta como 'chegou ao degrau' no patamar manual = max(3, melhor erro possivel do banco para o alvo + 1,5). */\n"
         "  let _bandaK='',_bandaV=3;\n"
         "  window.PATAMAR_BANDA_PP=()=>{try{\n"
         "    const i=Math.min(T.et,ETAPAS.length-1),al=+ETAPAS[i].alvo,kw100=+G.kw100;if(!(kw100>0)||!(al>0))return 3;\n"
         "    const e=entrada(true),sig=[i,kw100,G.pctLim,G.exc,e.bancos.map(b=>b.id+':'+(b.habil||[]).map(x=>x?1:0).join('')).join(',')].join('|');\n"
         "    if(sig!==_bandaK){_bandaK=sig;const e2=Object.assign({},e,{alvoKw:kw100*al/100});\n"
         "      if(al>100){e2.modoAlvo='minimo';e2.excessoMaxKw=(+G.exc)/100*kw100}else e2.modoAlvo='abaixo';\n"
         "      let er=0;try{er=Math.abs(R.sugere(e2).erro)/kw100*100}catch(x){er=0}\n"
         "      _bandaV=Math.max(3,er+1.5)}\n"
         "    return _bandaV}catch(x){return 3}};\n")
t = troca(t, ancora, banda + ancora, 'banda')
t = troca(t, '<meta name="app-version" content="1.10.218">', '<meta name="app-version" content="1.10.219">', 'meta')
t = troca(t, "const VERSAO='1.10.218', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n",
 "const VERSAO='1.10.219', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.219\",d:\"17/11/2026\",i:[\n"
 "    'PATAMAR MANUAL: O RELÓGIO SÓ SOLTA QUANDO A CARGA CHEGA AO DEGRAU (pedido do Reginaldo). Na 1.10.218 o relógio soltava assim que o operador clicava em Aplicar. Agora, no patamar manual (Por patamar), o relógio da etapa espera DUAS coisas: o Aplicar e a carga dentro da banda do degrau (a banda é o maior entre 3 pontos e o melhor erro que o banco consegue para aquele alvo + 1,5 ponto, para chave grossa não travar o ensaio). Continua valendo desmarcar uma chave, aplicar e depois clicar na chave que falta (a mesma ou outra): o relógio solta quando a carga chegar. Ex.: 107 % com 40 kW a 100 %: 39 kW e 40 kW seguram; 42 kW e 43 kW soltam. Patamar Auto e os outros salvamentos não mudam.'\n  ]},\n", 'hist')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.219.html ok')
