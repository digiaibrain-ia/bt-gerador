#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.186.html a partir da v1.10.185 (nao sobrescreve; aborta se um trecho esperado mudou).
Pedido do Reginaldo (08/11/2026): a Dica de interface (Alt+I) e recurso de PC (precisa de teclado); nao deve nascer ligada nem aparecer como opcao no celular.
 1) em aparelho de toque (pointer:coarse) a Dica NUNCA nasce ligada pela escolha guardada (so com ?ui=1 de proposito);
 2) a caixa "Inspecionar objetos (Alt+I)" do popup Demo (v1.10.184) some em aparelho de toque.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.186_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.185.html', 'medidor_gerador_v1.10.186.html'


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.185">', '<meta name="app-version" content="1.10.186">', 'meta')
    t = troca(t, "const VERSAO='1.10.185', VERSAO_DATA='08/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.186', VERSAO_DATA='08/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.186\",d:\"08/11/2026\",i:[\n"
              "    'Dica de interface (Alt+I) é recurso de PC: em celular/tablet (toque) ela nunca nasce ligada pela escolha guardada (só com ?ui=1) e a caixa \"Inspecionar objetos\" do popup Demo não aparece.',\n"
              "  ]},\n", 'historico')
    t = troca(t, "  if (/[?&]ui=1\\b/.test(location.search)) ligado = true;",
              "  try { if (matchMedia('(pointer:coarse)').matches) ligado = false; } catch (e) {}   // v1.10.186: celular/tablet: a escolha guardada não vale (recurso de PC)\n  if (/[?&]ui=1\\b/.test(location.search)) ligado = true;", 'coarse')
    t = troca(t, '  #opsBar .opsCnt{font-variant-numeric:tabular-nums;white-space:pre}', '  #opsBar .opsCnt{font-variant-numeric:tabular-nums;white-space:pre}\n  @media (pointer:coarse){label:has(#opsDica){display:none!important}}   /* v1.10.186: Dica Alt+I é só de PC */', 'css')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
