#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.180.html a partir da v1.10.179 (nao sobrescreve; aborta se um trecho esperado mudou).
Achados do log do Poco X6 Pro (07/11/2026, Chrome/Android, viewport real 406x848 CSS, tela fisica 407x904, DPR 3): 109 OK / 8 FALHA / 111 AVISO.
 - 8 FALHAS = a mesma causa: o navegador do celular guardava o salvamento 'Por patamar' (a varredura tambem clica nele no popup Modo); no modo Por patamar o ensaio salva as etapas
   sozinho e o robo, que confere o ensaio MANUAL, via a 6a etapa nao salva e o 'Ligar banco' sem trava. Correcao (so do robo): antes de cada ensaio forca o salvamento Manual e, no fim, devolve o que estava.
 - AVISOS falsos: 'alvo de toque 0x0' vinha de objeto escondido; agora so mede objeto que existe.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.180_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.179.html', 'medidor_gerador_v1.10.180.html'
SETSALVA = ("  function setSalva(m){try{if(!m||salvaModo()===m)return;PORPAT=m==='P';salvarManual=m==='M';try{localStorage.setItem('medidor.salvarManual',salvarManual?'1':'0');localStorage.setItem('medidor.porPatamar',PORPAT?'1':'0')}catch(e){}if(!salvarManual)T.aguarda=false;try{window.__aoMudarSalva&&window.__aoMudarSalva()}catch(e){}}catch(e){}}   // robô (só Demo local): troca o salvamento direto, mesmo com o gerador ligado\n")


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.179">', '<meta name="app-version" content="1.10.180">', 'meta')
    t = troca(t, "const VERSAO='1.10.179', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.180', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.180\",d:\"07/11/2026\",i:[\n"
              "    'Dev/Operador oculto (achados do Poco X6 Pro): o robô força o salvamento MANUAL antes de cada ensaio e devolve o salvamento de antes no fim (no celular o navegador guardava \"Por patamar\", que salva as etapas sozinho e fazia o robô acusar 8 falhas que não eram do medidor); aviso de \"alvo de toque 0×0\" só para objetos que existem.',\n"
              "  ]},\n", 'historico')
    t = troca(t, "  const salvaModo=()=>", SETSALVA + "  const salvaModo=()=>", 'setSalva')
    t = troca(t, "restauraG();await garanteGerador();", "restauraG();setSalva('M');await garanteGerador();", 'forca M')
    t = troca(t, "await restaura(est);OPS.parar=pf;", "await restaura(est);if(AV.salva0)setSalva(AV.salva0);OPS.parar=pf;", 'devolve')
    t = troca(t, "if(m<24)aviso(fase,'alvo de toque", "if(m>0&&m<24)aviso(fase,'alvo de toque", 'toque 0x0')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
