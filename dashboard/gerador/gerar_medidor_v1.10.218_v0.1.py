#!/usr/bin/env python3
"""17/11/2026 - Gera medidor_gerador_v1.10.218.html (de 1.10.217). Nao sobrescreve; aborta se um trecho esperado mudou.
Achado do Reginaldo (bancada, Patamar com PLC real): na passagem 100 % -> 107 % o patamar em modo MANUAL nao esperou o operador e "foi em auto".
Causa (log 23:12-23:13): no salvamento 'Por patamar' o relogio da etapa nao dependia do APLICAR. A tolerancia e +-10 pontos e a carga do 100 % ja cai dentro da faixa do 107 %,
entao o relogio do 107 % contou sozinho, a etapa avancou e foi salva sem o operador aplicar a sugestao (so o escalonamento segurava o relogio).
Correcao: patamar MANUAL com carga alvo > 0 e ainda NAO aplicado (aplicarInfo().liberado) segura o relogio/estabilizacao da etapa, como ja faz o escalonamento. Clicar em Aplicar solta o relogio
(mesmo quando "nada a mudar": o clique conta como decisao do operador). Patamar AUTO e salvamento nao-"Por patamar" nao mudam.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.218_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.217.html'), os.path.join(F, 'medidor_gerador_v1.10.218.html'); assert os.path.exists(o) and not os.path.exists(d)
t = open(o, encoding='utf-8').read()
t = troca(t, "if(Math.abs(carga-a)<=TOL&&!(window.PATAMAR_ESCALONANDO&&window.PATAMAR_ESCALONANDO())) T.estavel+=dt*sp; else T.estavel=0;",
             "if(Math.abs(carga-a)<=TOL&&!(window.PATAMAR_ESCALONANDO&&window.PATAMAR_ESCALONANDO())&&!(window.PATAMAR_AGUARDA_APLICAR&&window.PATAMAR_AGUARDA_APLICAR())) T.estavel+=dt*sp; else T.estavel=0;   // v1.10.218: patamar MANUAL espera o Aplicar antes de contar",
             'relogio')
t = troca(t, "r.liberado=true;r.motivo='sugestão tracejada no card Cargas: ajuste se quiser e clique em Aplicar';return r}\n",
             "r.liberado=true;r.motivo='sugestão tracejada no card Cargas: ajuste se quiser e clique em Aplicar';return r}\n"
             "/** v1.10.218: true = patamar MANUAL ainda sem Aplicar: o relogio/estabilizacao da etapa espera (a carga do patamar anterior pode estar dentro da tolerancia do novo e contar sozinha). */\n"
             "window.PATAMAR_AGUARDA_APLICAR=()=>{try{return aplicarInfo().liberado===true}catch(e){return false}};\n", 'funcao')
t = troca(t, '<meta name="app-version" content="1.10.217">', '<meta name="app-version" content="1.10.218">', 'meta')
t = troca(t, "const VERSAO='1.10.217', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n",
 "const VERSAO='1.10.218', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.218\",d:\"17/11/2026\",i:[\n"
 "    'PATAMAR MANUAL ESPERA O APLICAR (achado do Reginaldo na bancada): no salvamento \"Por patamar\", um patamar em modo Manual agora SEGURA o relógio da etapa até o operador clicar em Aplicar. Antes, na passagem 100 % → 107 % a carga do 100 % já estava dentro da tolerância (±10 pontos) do 107 %, o relógio contou sozinho, a etapa avançou e foi salva sem aplicar a sugestão (\"foi em auto\"). Clicar em Aplicar solta o relógio, também quando não há nada a mudar. Patamar Auto e os outros modos de salvamento não mudam.'\n  ]},\n", 'hist')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.218.html ok')
