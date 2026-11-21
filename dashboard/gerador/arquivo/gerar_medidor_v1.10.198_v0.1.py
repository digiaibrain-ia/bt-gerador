#!/usr/bin/env python3
"""10/11/2026 - gera medidor_gerador_v1.10.198.html a partir da 1.10.197 (nao sobrescreve; aborta se um trecho esperado mudou).
Pedido do Reginaldo: TODO balao do medidor deve ser "ultima camada" (fora do fluxo, sem mexer em tamanho/posicao dos cards). Inventario no codigo: so existem DOIS baloes em CSS (pseudo-elemento ::after):
.ibub (icone i; ja refeito na 1.10.197) e "#modoCard .lk" (os chips de estado do card Modo: PLC, DSE...). Os demais textos de ajuda sao title nativo do navegador (nao mexem no layout) ou a Dica de interface (Alt+I),
que ja e position:fixed/popover. Correcao: o balao unico em JS (#ibubTip) passa a servir tambem "#modoCard .lk" e o ::after dele e desligado.
Reproduzido (viewport do notebook 1536x694): na 1.10.196 o hover no icone i MUDA o layout dos cards (o balao absoluto aumenta a area de rolagem); na 1.10.197 nao.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.198_v0.1.py"""
import os
P = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')), 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
def main():
    o, d = os.path.join(P, 'medidor_gerador_v1.10.197.html'), os.path.join(P, 'medidor_gerador_v1.10.198.html'); assert os.path.exists(o) and not os.path.exists(d)
    t = open(o, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.197">', '<meta name="app-version" content="1.10.198">', 'meta')
    t = troca(t, "const VERSAO='1.10.197', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.198', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.198\",d:\"10/11/2026\",i:[\n"
              "    'Os chips de estado do card Modo (PLC, DSE…) também usam o balão de última camada (fora do fluxo, sem mexer no layout dos cards, texto selecionável). Agora TODOS os balões do medidor são assim: o ⓘ e esses chips eram os dois únicos feitos em CSS dentro do card.'\n  ]},\n", 'historico')
    t = troca(t, '.ibub::after{content:none!important;display:none!important}', '.ibub::after,#modoCard .lk::after{content:none!important;display:none!important}', 'css')
    t = troca(t, "const acha=e=>e.target&&e.target.closest?e.target.closest('.ibub'):null;", "const acha=e=>e.target&&e.target.closest?e.target.closest('.ibub,#modoCard .lk'):null;", 'acha')
    open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.198.html ok')
if __name__ == '__main__': main()
