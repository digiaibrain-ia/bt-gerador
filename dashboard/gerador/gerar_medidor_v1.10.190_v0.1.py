#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.190.html a partir da v1.10.189 (nao sobrescreve; aborta se um trecho esperado mudou).
Duvida do Reginaldo (08/11/2026) sobre o card Patamar: "Alvo 30 kW (30 %)" nos quatro chips (30/50/100/107 %) durante o robo.
Analise tecnica no codigo: parado, patIdx() = G.pat (o chip escolhido) e alvoKw = kw100 x pctAlvo/100 -> o card esta CERTO. Com o ensaio iniciado, patIdx() acompanha a etapa (T.et).
O defeito era do ROBO: ele guardava a lista dos 4 chips uma vez; o 1o clique redesenha o card (desenha()) e os outros 3 chips da lista viravam elementos soltos da pagina (clique sem efeito) -> o alvo ficava no 1o chip.
Correcao (so do robo): busca o chip de novo a cada volta e CONFERE que o alvo mostrado e o do chip clicado.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.190_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.189.html', 'medidor_gerador_v1.10.190.html'


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.189">', '<meta name="app-version" content="1.10.190">', 'meta')
    t = troca(t, "const VERSAO='1.10.189', VERSAO_DATA='08/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.190', VERSAO_DATA='08/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.190\",d:\"08/11/2026\",i:[\n"
              "    'Dev/Operador oculto (fase Patamar): o robô buscava os chips de patamar uma vez só e, depois do 1º clique (que redesenha o card), os outros viravam elementos soltos — por isso mostrava o mesmo alvo (30 kW) nos quatro. O card estava certo (parado: alvo = chip escolhido; ensaio iniciado: acompanha a etapa). Agora o robô busca o chip a cada volta e confere que o alvo mostrado é o do chip.',\n"
              "  ]},\n", 'historico')
    t = troca(t, "    for(const p of pats.slice(0,6)){\n      if(OPS.parar)throw ABORT;\n      clica(p,'patamar '+nomeEl(p));await pausa(120);",
              "    for(const p0 of pats.slice(0,6)){\n      if(OPS.parar)throw ABORT;\n      const p=document.querySelector('#patCard [data-gd=\"pat\"][data-k=\"'+p0.dataset.k+'\"]')||p0;   // v1.10.190: o card é redesenhado a cada clique: busca o chip de novo\n      clica(p,'patamar '+nomeEl(p));await pausa(120);", 'chips')
    t = troca(t, "      const m1=msg(),s1=stats();",
              "      const m1=msg(),s1=stats();\n      {const esperado=parseInt((/^\\s*(\\d+)/.exec(String(nomeEl(p)))||[])[1],10),mostrado=(/\\((\\d+) ?%\\)/.exec(s1)||[])[1];if(!isNaN(esperado)&&!T.started)chk(F,'chip '+esperado+' %: o alvo mostrado é o do chip (parado = o escolhido)',+mostrado===esperado,'mostrou '+(mostrado||'—')+' %')}", 'confere')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
