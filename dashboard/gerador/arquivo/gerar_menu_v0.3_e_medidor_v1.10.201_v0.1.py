#!/usr/bin/env python3
"""13/11/2026 - MENU ☰ para OPERACAO e DEV. Gera modulos-fonte/menu_dev_v0.3.js (de v0.2) e medidor_gerador_v1.10.201.html (de 1.10.200). Nao sobrescreve; aborta se um trecho esperado mudou.
Pedido do Reginaldo: o menu ☰ tem que existir na OPERACAO (so as ferramentas do operador: grupo "Operacao" do catalogo = Medidor e Grafico do ensaio) e, no DEV, ter mais funcoes
(todas as ferramentas, Verificar, Atualizar, Esquecer e o link para o index.html, que so existe na pasta de desenvolvimento). Antes (v0.2): o botao so aparecia para o dev (senha do Demo ou ?dev=1).
Regra: o botao fica sempre visivel; "dev" = senha do Demo / ?dev=1 (lembrado no navegador; ?dev=0 desliga). O medidor so troca o carregamento do .js e a versao.
Uso: python3 dashboard/gerador/gerar_menu_v0.3_e_medidor_v1.10.201_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); MF, FE = os.path.join(R, 'dashboard', 'modulos-fonte'), os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
def menu():
    o, d = os.path.join(MF, 'menu_dev_v0.2.js'), os.path.join(MF, 'menu_dev_v0.3.js'); assert os.path.exists(o) and not os.path.exists(d)
    t = open(o, encoding='utf-8').read()
    t = troca(t, 'menu_dev_v0.2.js — MENU ☰ DE DESENVOLVIMENTO (abre as outras páginas do projeto)  ·  30/10/2026',
              'menu_dev_v0.3.js — MENU ☰ (OPERAÇÃO e DESENVOLVIMENTO)  ·  13/11/2026\n   v0.3 (pedido do Reginaldo): o botão ☰ agora aparece SEMPRE. OPERAÇÃO: lista só as ferramentas do grupo "Operação" do catálogo (Medidor e Gráfico do ensaio), sem Verificar/Atualizar/Esquecer.\n   DEV (senha do Demo ou ?dev=1; lembrado no navegador; ?dev=0 desliga): todas as ferramentas, Verificar, Atualizar, Esquecer e o link para o index.html (só existe na pasta de desenvolvimento).\n   mostra(true/false) agora liga/desliga o MODO DEV do menu (o botão não some mais). Abaixo, o texto da v0.2.', 'cab')
    t = troca(t, "    let h = '<h4>Ferramentas do projeto</h4>';", "    let h = '<h4>' + (dev ? 'Ferramentas do projeto' : 'Ferramentas') + '</h4>';", 'titulo')
    t = troca(t, "    else h += '<div style=\"color:#777;font-size:12px\">Endereço base: '", "    else if (dev) h += '<div style=\"color:#777;font-size:12px\">Endereço base: '", 'base')
    t = troca(t, "    CAT.itens.map(i => ach(i.id)).forEach(i => {", "    CAT.itens.filter(i => dev || i.grupo === 'Operação').map(i => ach(i.id)).forEach(i => {", 'filtro')
    t = troca(t, "    h += '<div class=\"mdv-f\"><button type=\"button\" id=\"mdv-ver\"",
              "    if (dev) h += '<a class=\"mdv-i\" data-id=\"index\" href=\"' + (emFile() ? '#' : new URL('index.html', location.href).href) + '\" target=\"bt2_index\" rel=\"noopener\"><span><b>Índice das ferramentas (index.html)</b><small>index.html — só na pasta de desenvolvimento</small></span></a>';\n"
              "    h += '<div class=\"mdv-f\">' + (!dev ? '' : '<button type=\"button\" id=\"mdv-ver\"", 'barra')
    t = troca(t, "Esquecer</button><button type=\"button\" id=\"mdv-fx\">Fechar</button></div>", "Esquecer</button>') + '<button type=\"button\" id=\"mdv-fx\">Fechar</button></div>", 'barra2')
    t = troca(t, "    pan.querySelector('#mdv-es').onclick = () => { gravaArq({}); lista(); };", "    const es = pan.querySelector('#mdv-es'); if (es) es.onclick = () => { gravaArq({}); lista(); };", 'esq')
    t = troca(t, "  let btn = null, pan = null, atual = '';", "  let btn = null, pan = null, atual = '', dev = false;", 'dev')
    t = troca(t, "btn.style.display = 'none';\n    btn.title = 'SÓ DESENVOLVEDOR: abre as outras ferramentas do projeto (catálogo de páginas)';",
              "btn.title = TIT_OP;", 'btn')
    t = troca(t, "  function mostra(b) { if (btn) btn.style.display = b ? '' : 'none'; if (!b) fecha(); }",
              "  function mostra(b) { dev = !!b; if (btn) btn.title = dev ? TIT_DEV : TIT_OP; if (pan && pan.matches && pan.matches(':popover-open')) lista(); }   // v0.3: liga/desliga o MODO DEV; o botão não some", 'mostra')
    t = troca(t, "  let btn = null, pan = null,", "  const TIT_OP = 'Abre as ferramentas do operador (Medidor, Gráfico do ensaio)', TIT_DEV = 'DEV: abre todas as ferramentas do projeto (catálogo de páginas) e o índice';\n  let btn = null, pan = null,", 'tit')
    t = troca(t, "versao: '0.2',", "versao: '0.3',", 'ver')
    open(d, 'w', encoding='utf-8').write(t); print('menu_dev_v0.3.js ok')
def medidor():
    o, d = os.path.join(FE, 'medidor_gerador_v1.10.200.html'), os.path.join(FE, 'medidor_gerador_v1.10.201.html'); assert os.path.exists(o) and not os.path.exists(d)
    t = open(o, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.200">', '<meta name="app-version" content="1.10.201">', 'meta')
    t = troca(t, "const VERSAO='1.10.200', VERSAO_DATA='11/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.201', VERSAO_DATA='13/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.201\",d:\"13/11/2026\",i:[\n"
              "    'MENU ☰ também na OPERAÇÃO (pedido do Reginaldo): o botão ☰ agora aparece sempre e, para o operador, abre só o Medidor e o Gráfico do ensaio. No modo DEV (senha do Demo ou ?dev=1) o menu mostra todas as ferramentas, Verificar, Atualizar e o link para o index.html. Arquivo do menu: menu_dev_v0.3.js (junto do catalogo_ferramentas.js na mesma pasta; sem eles a tela abre normalmente, sem o ☰).'\n  ]},\n", 'hist')
    t = troca(t, '<script src="menu_dev_v0.2.js"></script>', '<script src="menu_dev_v0.3.js"></script>', 'script')
    open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.201.html ok')
if __name__ == '__main__': menu(); medidor()
