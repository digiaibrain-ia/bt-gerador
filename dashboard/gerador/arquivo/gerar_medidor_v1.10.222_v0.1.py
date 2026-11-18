#!/usr/bin/env python3
"""17/11/2026 - Gera medidor_gerador_v1.10.222.html (de 1.10.221). Nao sobrescreve; aborta se um trecho esperado mudou.
Teste de bancada: com o cronometro (INICIAR) ativo o botao Sugerir chaves continuava com cara de ligado (so mostrava aviso ao clicar). Agora o botao fica DESLIGADO de verdade (apagado,
desabilitado, com dica) enquanto o cronometro conta (T.run); com o cronometro parado ou pausado ele volta. O Aplicar continua livre.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.222_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas')
L = lambda p: open(p, encoding='utf-8').read()
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.221.html'), os.path.join(F, 'medidor_gerador_v1.10.222.html'); assert os.path.exists(o) and not os.path.exists(d)
t = L(o)
t = troca(t, '<button type="button" data-gd="sug" class="on">Sugerir chaves</button>',
          '<button type="button" data-gd="sug" class="\'+(T.run?\'\':\'on\')+\'"\'+(T.run?\' disabled title="Desligado: o cronômetro (INICIAR) está ativo. Sugerir chaves só funciona com ele parado ou pausado."\':\'\')+\'>Sugerir chaves</button>', 'botao')
t = troca(t, "if(a==='sug'){if(T.started&&!T.fim){", "if(a==='sug'){if(T.run){", 'guarda')
t = troca(t, "Sugerir chaves só funciona com o cronômetro desligado (Iniciar).", "Sugerir chaves só funciona com o cronômetro (INICIAR) parado ou pausado.", 'msg')
t = troca(t, '<meta name="app-version" content="1.10.221">', '<meta name="app-version" content="1.10.222">', 'meta')
hist = ("  {v:\"1.10.222\",d:\"17/11/2026\",i:[\n"
 "    'Teste de bancada: com o cronômetro (INICIAR) ativo o botão Sugerir chaves continuava com cara de ligado (só avisava ao clicar). Agora o botão fica DESLIGADO de verdade (apagado, sem clique, com dica) enquanto o cronômetro conta; parado ou pausado, volta ao normal. O Aplicar continua livre.'\n"
 "  ]},\n")
t = troca(t, "const VERSAO='1.10.221', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n", "const VERSAO='1.10.222', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n" + hist, 'versao')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.222.html ok')
