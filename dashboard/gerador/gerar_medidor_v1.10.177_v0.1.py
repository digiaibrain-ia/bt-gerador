#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.177.html a partir da v1.10.176 (nao sobrescreve; aborta se um trecho esperado mudou).
Achado do robo Dev/Operador oculto no note DELL do Reginaldo (07/11/2026, tela 3072x1390): o menu do botao direito (pacote_ia) abria FORA da tela.
Causa: com tela larga (>= 2400 px) o <body> tem zoom CSS de 1,5x (2x acima de 3200 px) e o menu, que vive dentro do body, recebia left/top em px
SEM dividir pelo zoom -> aparecia 1,5x mais longe (e o limite 'dentro da tela' era calculado na escala errada).
Correcao: left/top divididos pelo zoom efetivo do menu e limites calculados na mesma escala.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.177_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.176.html', 'medidor_gerador_v1.10.177.html'


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.176">', '<meta name="app-version" content="1.10.177">', 'meta')
    t = troca(t, "const VERSAO='1.10.176', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.177', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.177\",d:\"07/11/2026\",i:[\n"
              "    'Menu do botão direito (pacote para a IA) abria FORA da tela em monitor largo (a partir de 2400 px a tela tem zoom 1,5×; acima de 3200 px, 2×): agora a posição leva o zoom em conta e o menu fica sempre inteiro na tela. Achado do robô Dev/Operador oculto no note DELL.',\n"
              "  ]},\n", 'historico')
    t = troca(t, "    const r = menu.getBoundingClientRect();   // posiciona DENTRO da tela (lição do ✕ que saía da viewport)\n    menu.style.left = Math.max(4, Math.min(innerWidth - r.width - 4, x)) + 'px'; menu.style.top = Math.max(4, Math.min(innerHeight - r.height - 4, y)) + 'px';",
              "    const r = menu.getBoundingClientRect();   // posiciona DENTRO da tela (lição do ✕ que saía da viewport)\n"
              "    const zm = (menu.offsetWidth ? r.width / menu.offsetWidth : 1) || 1;   // v1.10.177: zoom do <body> (1,5× em tela >= 2400 px): left/top são em unidades do zoom\n"
              "    menu.style.left = Math.max(4, Math.min(innerWidth - r.width - 4, x)) / zm + 'px'; menu.style.top = Math.max(4, Math.min(innerHeight - r.height - 4, y)) / zm + 'px';", 'menu')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
