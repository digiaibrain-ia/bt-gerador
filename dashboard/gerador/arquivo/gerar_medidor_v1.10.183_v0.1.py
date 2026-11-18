#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.183.html a partir da v1.10.182 (nao sobrescreve; aborta se um trecho esperado mudou).
Relato do Reginaldo (07/11/2026, Poco X6 Pro):
 1) o bloco do Dev/Operador oculto no popup Demo nao se ajusta a largura do celular (lista de modo e campos cortados) -> no celular tudo ocupa a largura inteira.
 2) no Monkey o balao do robo so aparece no comeco (no Avancado funciona): no Monkey quase nada chama a atualizacao da tela, e um popup aberto DEPOIS (topo da pilha) fica por cima do balao
    -> a barra e re-elevada a cada 0,25 s enquanto o robo roda.
Fora do pedido (decisao do Reginaldo): o menu do botao direito em celular fica como esta; nao foi alterado.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.183_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.182.html', 'medidor_gerador_v1.10.183.html'
CSS = """
  /* v1.10.183: bloco do Dev/Operador oculto cabe na largura do celular */
  @media (max-width:700px){
    #opsBox,#obsBox{max-width:100%;box-sizing:border-box;overflow:hidden}
    #opsBox>div,#obsBox>div{flex-direction:column;align-items:stretch!important}
    #opsBox label,#obsBox label{flex-wrap:wrap;width:100%}
    #opsBox select,#opsBox input[type=text],#opsBox input[type=number],#obsBox select,#obsBox input[type=text],#obsBox input[type=number]{width:100%!important;max-width:100%;box-sizing:border-box;min-width:0}
    #opsBox button,#obsBox button{width:100%}
  }
"""


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.182">', '<meta name="app-version" content="1.10.183">', 'meta')
    t = troca(t, "const VERSAO='1.10.182', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.183', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.183\",d:\"07/11/2026\",i:[\n"
              "    'Dev/Operador oculto: o bloco do popup Demo agora cabe na largura do celular; no modo Monkey o balão do robô não fica mais escondido atrás de um popup aberto depois dele (a barra é re-elevada a cada 0,25 s enquanto o robô roda).',\n"
              "  ]},\n", 'historico')
    t = troca(t, '  #opsBar .opsCnt{font-variant-numeric:tabular-nums;white-space:pre}', '  #opsBar .opsCnt{font-variant-numeric:tabular-nums;white-space:pre}' + CSS, 'css')
    t = troca(t, "    if(fim)fim.onclick=()=>{FIMBAR.fechado=true;FIMBAR.on=false;ui()};",
              "    if(fim)fim.onclick=()=>{FIMBAR.fechado=true;FIMBAR.on=false;ui()};\n    setInterval(()=>{if(OPS.rodando){try{const b=$('opsBar');if(b){let coberta=!b.matches(':popover-open');if(!coberta){const r=b.getBoundingClientRect(),t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);coberta=!t||!b.contains(t)}if(coberta){ui();if(b.matches(':popover-open')){b.hidePopover();b.showPopover()}}}}catch(e){}}},250);", 'rele')
    # com popup MODAL aberto o resto da pagina fica inerte (o botao Parar do balao nao recebia toque): o balao passa para dentro do popup modal aberto e volta ao <body> quando ele fecha
    t = troca(t, "const b=$('opsBar');if(b){let coberta=!b.matches(':popover-open');",
              "const b=$('opsBar');if(b){const mods=[...document.querySelectorAll('dialog[open]')].filter(d=>{try{return d.matches(':modal')}catch(e){return false}}),alvo=mods.length?mods[mods.length-1]:document.body;if(b.parentElement!==alvo){const abertoAntes=b.matches(':popover-open');try{if(abertoAntes)b.hidePopover()}catch(e){}alvo.appendChild(b);try{if(abertoAntes)b.showPopover()}catch(e){}}let coberta=!b.matches(':popover-open');", 'reparent')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
