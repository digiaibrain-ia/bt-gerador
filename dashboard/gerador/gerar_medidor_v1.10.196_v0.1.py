#!/usr/bin/env python3
"""10/11/2026 - gera medidor_gerador_v1.10.196.html a partir da 1.10.195 (nao sobrescreve; aborta se um trecho esperado mudou).
Defeito (Reginaldo, depois da 1.10.195): com o ensaio GRAVADO ("Ensaio gravado - aguardando START") os chips do Patamar (30 %, 50 %...) ficam DESABILITADOS e nao dao para clicar. Causa: o card trata
"ensaio em curso" como T.started, que continua true depois de gravar. Correcao: helper emCurso() = T.started E NAO (fim E gravado), usado no chip (desabilitado/atual), no clique do chip, no apagar da sombra,
no religar da mae ("religa depois de ZERAR/gravar") e no reset de APL_ET. Resto igual a 1.10.195.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.196_v0.1.py"""
import os
P = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')), 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
def main():
    o, d = os.path.join(P, 'medidor_gerador_v1.10.195.html'), os.path.join(P, 'medidor_gerador_v1.10.196.html'); assert os.path.exists(o) and not os.path.exists(d)
    t = open(o, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.195">', '<meta name="app-version" content="1.10.196">', 'meta')
    t = troca(t, "const VERSAO='1.10.195', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.196', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.196\",d:\"10/11/2026\",i:[\n"
              "    'Depois de GRAVAR o ensaio (\"Ensaio gravado · aguardando START\") os chips de patamar (30 %, 50 %, 100 %, 107 %) voltam a poder ser escolhidos (ficavam desabilitados, como se o ensaio ainda estivesse em curso), e o Patamar Guiado religa sozinho se estava ligado.'\n  ]},\n", 'historico')
    t = troca(t, "  const patIdx=()=>previaEt!=null?previaEt:(T.started&&!(T.fim&&T.gravado))?Math.min(",
              "  const emCurso=()=>T.started&&!(T.fim&&T.gravado);   // v1.10.196: ensaio gravado = NAO esta mais em curso (T.started continua true ate o proximo START)\n  const patIdx=()=>previaEt!=null?previaEt:emCurso()?Math.min(", 'emCurso')
    t = troca(t, "data-k=\"'+k+'\"'+(T.started?' disabled':'')+' aria-pressed=", "data-k=\"'+k+'\"'+(emCurso()?' disabled':'')+' aria-pressed=", 'chip')
    t = troca(t, "(T.started&&k===Math.min(T.et,ETAPAS.length-1)?' cur':'')", "(emCurso()&&k===Math.min(T.et,ETAPAS.length-1)?' cur':'')", 'cur')
    t = troca(t, "if(a==='pat'){if(!T.started){const k=", "if(a==='pat'){if(!emCurso()){const k=", 'clique')
    t = troca(t, "if(mae.armada&&!T.started&&!G.manualSug", "if(mae.armada&&!emCurso()&&!G.manualSug", 'sombra')
    t = troca(t, "if(G.guiadoOn&&!mae.armada&&!T.started&&!T.fim)mae.arma();", "if(G.guiadoOn&&!mae.armada&&!emCurso()&&(!T.fim||T.gravado))mae.arma();", 'religa')
    t = troca(t, "if(!T.started)APL_ET=-1;", "if(!emCurso())APL_ET=-1;", 'apl')
    open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.196.html ok')
if __name__ == '__main__': main()
