#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.184.html a partir da v1.10.183 (nao sobrescreve; aborta se um trecho esperado mudou).
Relato do Reginaldo (08/11/2026, celular): a pagina "nasce" com a Dica de interface (Alt+I) LIGADA e no celular nao ha como desligar (nao existe tecla Alt).
Causa: a escolha da Dica fica guardada no navegador (bt2.dicaui). O robo (Monkey/Avancado, menu do botao direito) tocou no item "Inspecionar objetos (Alt+I)" e ligou a Dica sem devolver no fim.
Correcao: (1) o robo anota se a Dica estava ligada e DEVOLVE o estado de antes ao terminar; (2) caixa "Inspecionar objetos (Alt+I)" no popup Demo (liga/desliga com toque);
(3) endereco com ?ui=0 desliga e apaga a escolha guardada.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.184_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.183.html', 'medidor_gerador_v1.10.184.html'


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.183">', '<meta name="app-version" content="1.10.184">', 'meta')
    t = troca(t, "const VERSAO='1.10.183', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.184', VERSAO_DATA='08/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.184\",d:\"08/11/2026\",i:[\n"
              "    'Dica de interface (Alt+I) nascia LIGADA depois de um teste do robô (ele tocava no item do menu e não devolvia) e no celular não havia como desligar. Agora: o robô devolve o estado de antes; há a caixa \"Inspecionar objetos (Alt+I)\" no popup Demo (toque); e o endereço com ?ui=0 desliga e apaga a escolha guardada.',\n"
              "  ]},\n", 'historico')
    t = troca(t, "  if (/[?&]ui=1\\b/.test(location.search)) ligado = true;",
              "  if (/[?&]ui=1\\b/.test(location.search)) ligado = true;\n  if (/[?&]ui=0\\b/.test(location.search)) { ligado = false; try { localStorage.setItem(CHAVE, '0'); } catch (e) {} }   // v1.10.184: ?ui=0 desliga e apaga a escolha guardada", 'ui=0')
    t = troca(t, "AV.g0=gSnap();AV.salva0=salvaModo();", "AV.g0=gSnap();AV.salva0=salvaModo();AV.dica0=window.DICAUI?window.DICAUI.ativo():undefined;", 'snap dica')
    t = troca(t, "if(AV.salva0)setSalva(AV.salva0);", "if(AV.salva0)setSalva(AV.salva0);try{if(window.DICAUI&&AV.dica0!==undefined&&window.DICAUI.ativo()!==AV.dica0)window.DICAUI.liga(AV.dica0,false)}catch(e){}", 'devolve dica')
    # caixa no popup Demo (depois do campo Dispositivo)
    i = t.index('id="opsDisp"'); j = t.index('</label>', i) + len('</label>')
    t = t[:j] + '\n        <label style="display:flex;gap:6px;align-items:center;font-size:12px" title="Mostra o nome técnico (tipo, id, coordenadas) do objeto ao passar o mouse; Alt+clique fixa. No celular, desligue aqui."><input type="checkbox" id="opsDica"> Inspecionar objetos (Alt+I)</label>' + t[j:]
    t = troca(t, "    if(fim)fim.onclick=()=>{FIMBAR.fechado=true;FIMBAR.on=false;ui()};",
              "    if(fim)fim.onclick=()=>{FIMBAR.fechado=true;FIMBAR.on=false;ui()};\n    const dc=$('opsDica');if(dc){dc.onchange=()=>{try{window.DICAUI&&window.DICAUI.liga(dc.checked,false)}catch(e){}};setInterval(()=>{try{if(window.DICAUI&&document.activeElement!==dc)dc.checked=!!window.DICAUI.ativo()}catch(e){}},700)}", 'liga caixa')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
