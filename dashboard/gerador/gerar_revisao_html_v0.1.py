#!/usr/bin/env python3
"""Gera as versoes novas dos HTML auxiliares a partir da REVISAO UNIVERSAL (desktop + celular Poco X6 Pro) de 07/11/2026. Nao sobrescreve (aborta se o destino existe).
  maquete_layout_v0.4 -> v0.5 : menu Exportar fecha ao clicar fora/Esc/escolher (cobria botoes vizinhos); copiar para a area de transferencia sem erro quando o navegador nega; alvos de toque.
  mapa_fbs_v0.15      -> v0.16: area de toque do icone "i" dos blocos (7 px no celular -> maior); Ajuda v0.2 (arrasta e fica na tela); alvos de toque.
  gerenciador_logs_v1.7 -> v1.8, api_cards_visor_v0.3 -> v0.4: Ajuda v0.2; alvos de toque.
  grafico_ensaio_v0.11 -> v0.12: janela Ajuda ganha o botao fechar (X) no titulo; alvos de toque.
  index.html (nome fixo, versao no comentario): v0.2 -> v0.3: Ajuda v0.2.
Uso: python3 dashboard/gerador/gerar_revisao_html_v0.1.py
"""
import os, re
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
MODS = os.path.join(RAIZ, 'dashboard', 'modulos-fonte')
TOQUE = ("\n  /* revisao universal 07/11/2026: alvos de toque (so celular/tablet; o PC nao muda) */\n"
         "  @media (pointer:coarse){button,summary,select,.bt{min-height:40px}input[type=checkbox],input[type=radio]{width:22px;height:22px}}\n")


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def ajuda_v02(t):
    """troca o modulo Ajuda v0.1 colado no HTML pelo v0.2"""
    novo = open(os.path.join(MODS, 'ajuda_v0.2.js'), encoding='utf-8').read()
    i = t.index('/* =====================================================================================================================\n   ajuda_v0.1.js')
    fimtxt = 'global.AJUDA = { inicia, abre, fecha };\n})(window);'
    j = t.index(fimtxt, i) + len(fimtxt)
    return t[:i] + novo.rstrip() + t[j:]


def gera(orig, dest, fn):
    fonte, saida = os.path.join(PAST, orig), os.path.join(PAST, dest)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe: ' + dest
    t = fn(open(fonte, encoding='utf-8').read())
    open(saida, 'w', encoding='utf-8').write(t)
    print(dest, 'ok')


def maquete(t):
    t = troca(t, '<meta name="app-version" content="0.4">', '<meta name="app-version" content="0.5">', 'meta')
    t = troca(t, '<title>Maquete de layout v0.4</title>', '<title>Maquete de layout v0.5</title>', 'title')
    t = troca(t, '<html lang="pt-BR">\n', '<html lang="pt-BR">\n<!-- maquete_layout_v0.5 · 07/11/2026 — REVISÃO UNIVERSAL: o menu "Exportar ▾" fecha ao clicar fora, Esc ou escolher uma opção (antes ficava aberto e cobria botões vizinhos); copiar para a área de transferência não dá mais erro quando o navegador nega (usa cópia alternativa); alvos de toque no celular. Resto igual à v0.4. -->\n', 'comentario') if t.count('<html lang="pt-BR">\n') == 1 else t
    t = troca(t, "try { navigator.clipboard.writeText(t); msg('Copiado — cole no chat'); } catch (x) {}",
              "try { const ok = () => msg('Copiado — cole no chat'); const alt = () => { try { const ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); const r = document.execCommand('copy'); ta.remove(); if (r) ok(); } catch (y) {} }; if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, alt); else alt(); } catch (x) {}", 'clipboard')
    t = troca(t, '</style>', TOQUE + '</style>', 'css')
    t = troca(t, '</body>', """<script>
/* v0.5: menu "Exportar ▾" (details.menu) fecha ao clicar fora, Esc ou ao escolher uma opção */
(function(){
  const ms=()=>document.querySelectorAll('details.menu');
  document.addEventListener('pointerdown',e=>{ms().forEach(d=>{if(d.open&&!d.contains(e.target))d.open=false})});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')ms().forEach(d=>{d.open=false})});
  document.addEventListener('click',e=>{const b=e.target.closest('details.menu .lista button');if(b){const d=b.closest('details.menu');setTimeout(()=>{d.open=false},0)}});
})();
</script>
</body>""", 'menu js')
    return t


def mapa(t):
    t = troca(t, '<meta name="app-version" content="0.15">', '<meta name="app-version" content="0.16">', 'meta')
    t = troca(t, '<html lang="pt-BR">\n', '<html lang="pt-BR">\n<!-- mapa_fbs_v0.16 · 07/11/2026 — REVISÃO UNIVERSAL: o ícone "i" dos blocos ganhou área de toque maior (no celular tinha 7 px); Ajuda v0.2 (arrasta pelo título e fica inteira na tela); alvos de toque. Resto igual à v0.15. -->\n', 'comentario')
    t = troca(t, "    el('circle',{cx:b.x+W-40,cy:b.y+19,r:9},gi);",
              "    el('circle',{cx:b.x+W-40,cy:b.y+19,r:30,fill:'transparent',stroke:'none','pointer-events':'all'},gi);   /* v0.16: área de toque grande (invisível) */\n    el('circle',{cx:b.x+W-40,cy:b.y+19,r:9},gi);", 'info')
    t = troca(t, '</style>', TOQUE + '</style>', 'css')
    return ajuda_v02(t)


def simples(ver_old, ver_new, nome_old, nome_new):
    def f(t):
        t = troca(t, '<meta name="app-version" content="' + ver_old + '">', '<meta name="app-version" content="' + ver_new + '">', 'meta') if ver_old else t
        t = troca(t, '<html lang="pt-BR">\n', '<html lang="pt-BR">\n<!-- ' + nome_new + ' · 07/11/2026 — REVISÃO UNIVERSAL: Ajuda v0.2 (arrasta pelo título, fica inteira na tela, ✕ sempre alcançável) e alvos de toque no celular. Resto igual à ' + nome_old + '. -->\n', 'comentario')
        t = troca(t, '</style>', TOQUE + '</style>', 'css')
        return ajuda_v02(t)
    return f


def grafico(t):
    t = troca(t, '<meta name="app-version" content="0.11">', '<meta name="app-version" content="0.12">', 'meta')
    t = troca(t, '<html lang="pt-BR">\n', '<html lang="pt-BR">\n<!-- grafico_ensaio_v0.12 · 07/11/2026 — REVISÃO UNIVERSAL: a janela Ajuda ganhou o botão ✕ no título; alvos de toque no celular. Resto igual à v0.11. -->\n', 'comentario')
    t = troca(t, '<dialog id="dlgAjuda">\n  <h2>Como usar</h2>',
              '<dialog id="dlgAjuda">\n  <div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h2 style="margin:0">Como usar</h2><button type="button" class="jx" data-fecha aria-label="Fechar" title="Fechar" onclick="this.closest(\'dialog\').close()" style="min-width:34px">✕</button></div>', 'ajuda x')
    t = troca(t, '</style>', TOQUE + '</style>', 'css')
    return t


def index(t):
    t = troca(t, '<meta name="app-version" content="0.2">', '<meta name="app-version" content="0.3">', 'meta')
    t = troca(t, '<html lang="pt-BR">\n', '<html lang="pt-BR">\n<!-- index.html (v0.3) · 07/11/2026 — REVISÃO UNIVERSAL: Ajuda v0.2 (arrasta e fica inteira na tela) e alvos de toque no celular. Nome fixo de propósito. -->\n', 'comentario') if False else t
    t = troca(t, '<!-- index.html (v0.2) · 29/10/2026', '<!-- index.html (v0.3) · 07/11/2026 — REVISÃO UNIVERSAL: Ajuda v0.2 (arrasta e fica inteira na tela) e alvos de toque no celular. | index.html (v0.2) · 29/10/2026', 'comentario')
    t = troca(t, '</style>', TOQUE + '</style>', 'css')
    return ajuda_v02(t)


def main():
    gera('maquete_layout_v0.4.html', 'maquete_layout_v0.5.html', maquete)
    gera('mapa_fbs_v0.15.html', 'mapa_fbs_v0.16.html', mapa)
    gera('gerenciador_logs_v1.7.html', 'gerenciador_logs_v1.8.html', simples('1.7', '1.8', 'v1.7', 'gerenciador_logs_v1.8'))
    gera('api_cards_visor_v0.3.html', 'api_cards_visor_v0.4.html', simples(None, None, 'v0.3', 'api_cards_visor_v0.4'))
    gera('grafico_ensaio_v0.11.html', 'grafico_ensaio_v0.12.html', grafico)
    # index.html tem nome fixo: gera ao lado e o operador troca (o original fica como index_v0.2.html de seguranca)
    fonte = os.path.join(PAST, 'index.html'); novo = os.path.join(PAST, 'index_v0.3.html'); ant = os.path.join(PAST, 'index_v0.2.html')
    assert os.path.exists(fonte) and not os.path.exists(novo) and not os.path.exists(ant), 'index: destino ja existe'
    t = open(fonte, encoding='utf-8').read()
    open(ant, 'w', encoding='utf-8').write(t)
    open(novo, 'w', encoding='utf-8').write(index(t))
    print('index_v0.3.html ok (copie como index.html na pasta do Node-RED); backup index_v0.2.html')


if __name__ == '__main__':
    main()
