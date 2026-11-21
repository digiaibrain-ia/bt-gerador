#!/usr/bin/env python3
"""17/11/2026 - Gera medidor_gerador_v1.10.217.html (de 1.10.216). Nao sobrescreve; aborta se um trecho esperado mudou.
Achado do Reginaldo (PC BT2): em Dados do ensaio nao aparece o campo de busca do modelo. Causa: com um gerador JA ESCOLHIDO (lembrado ao recarregar) a busca fica escondida e a ficha traz o botao "Trocar gerador";
a mensagem do catalogo automatico ("Catalogo atualizado sozinho...", v1.10.124) escrevia no mesmo elemento da ficha (data-c=m) e APAGAVA a ficha e o botao: sem busca e sem como trocar.
Correcao: a mensagem do catalogo vai para um elemento proprio (data-c=aviso); a ficha e o botao "Trocar gerador" nao sao mais apagados. So o modulo do catalogo (CATDSE.monta).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.217_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.216.html'), os.path.join(F, 'medidor_gerador_v1.10.217.html'); assert os.path.exists(o) and not os.path.exists(d)
t = open(o, encoding='utf-8').read()
t = troca(t, "host.innerHTML='<div class=\"cat-i\" data-c=\"m\">Nenhum gerador escolhido — digite abaixo parte do nome (ex.: 260 220 60).</div><div class=\"cat-b cat-busca\">",
             "host.innerHTML='<div class=\"cat-i\" data-c=\"m\">Nenhum gerador escolhido — digite abaixo parte do nome (ex.: 260 220 60).</div><div class=\"cat-i\" data-c=\"aviso\"></div><div class=\"cat-b cat-busca\">", 'html')
t = troca(t, "m=host.querySelector('[data-c=m]'),f=host.querySelector('[data-c=f]');", "m=host.querySelector('[data-c=m]'),av=host.querySelector('[data-c=aviso]'),f=host.querySelector('[data-c=f]');   // v1.10.217: av = mensagens do catalogo (nao apagam a ficha)", 'refs')
t = troca(t, "r.onload=()=>{try{const k=carrega(String(r.result));m.textContent='Catálogo carregado: '+k+' modelos (guardado neste navegador).'}catch(x){m.textContent='Não consegui ler o catálogo: '+x.message}};",
             "r.onload=()=>{try{const k=carrega(String(r.result));av.textContent='Catálogo carregado: '+k+' modelos (guardado neste navegador).'}catch(x){av.textContent='Não consegui ler o catálogo: '+x.message}};", 'onload')
t = troca(t, "const v={refresh,msg:t=>{m.textContent=t}};", "const v={refresh,msg:t=>{av.textContent=t}};/*v1.10.217: antes escrevia em m e apagava a ficha e o Trocar gerador*/", 'msg')
t = troca(t, '<meta name="app-version" content="1.10.216">', '<meta name="app-version" content="1.10.217">', 'meta')
t = troca(t, "const VERSAO='1.10.216', VERSAO_DATA='16/11/2026';\nconst HISTORICO=[\n",
 "const VERSAO='1.10.217', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.217\",d:\"17/11/2026\",i:[\n"
 "    'DADOS DO ENSAIO › CATÁLOGO DE MODELOS: corrigido o campo de busca que \"sumia\". Com um gerador já escolhido (lembrado ao recarregar), a busca fica escondida e o botão \"Trocar gerador\" volta a busca; mas a mensagem \"Catálogo atualizado sozinho\" apagava a ficha e esse botão, e não havia como trocar o gerador. Agora a mensagem tem lugar próprio e a ficha com \"Trocar gerador\" permanece. Resto igual à 1.10.216.'\n  ]},\n", 'hist')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.217.html ok')
