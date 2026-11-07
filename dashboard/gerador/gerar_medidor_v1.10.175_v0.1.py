#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.175.html a partir da v1.10.174 (nao sobrescreve; aborta se um trecho esperado mudou).
Pedido do Reginaldo (07/11/2026): o botao "Operador secreto" passa a se chamar "Dev/Operador oculto" e ganha modo AVANCADO: simula TODOS os cliques/objetos de UI
(abre, onde abre, cabe na tela, por cima, fecha, reabre), configuracoes, menu do botao direito, Patamar guiado e ensaio; e modo MONKEY (aleatorio com semente fixa).
Com log ativo, caixa de areia (bloqueia rede de escrita, impressao, janela nova, download), SO em Demo LOCAL, para desktop e celular. A Central de registros ganha o item do relatorio do robo.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.175_v0.1.py
"""
import json, os, re
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
MODS = os.path.join(RAIZ, 'dashboard', 'modulos-fonte')
ORIG, DEST = 'medidor_gerador_v1.10.174.html', 'medidor_gerador_v1.10.175.html'


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    frag = open(os.path.join(MODS, 'dev_operador_oculto_v0.1.fragmento.js'), encoding='utf-8').read()
    c2, c3 = open(os.path.join(MODS, 'central_registros_v0.2.js'), encoding='utf-8').read(), open(os.path.join(MODS, 'central_registros_v0.3.js'), encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.174">', '<meta name="app-version" content="1.10.175">', 'meta')
    t = troca(t, "const VERSAO='1.10.174', VERSAO_DATA='06/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.175', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.175\",d:\"07/11/2026\",i:[\n"
              "    'O \"Operador secreto\" virou \"Dev/Operador oculto\" e ganhou 3 modos (popup Demo): RÁPIDO (as fases de antes), AVANÇADO (varredura de TODOS os objetos da tela — botões, campos, listas, abas, chaves, janelas — conferindo se dá para clicar, o que abre, ONDE abre, se cabe na tela, se fica por cima, se fecha pelo ✕/Esc/clique fora e se reabre; menu do botão direito; Patamar guiado; ensaio em várias velocidades) e MONKEY (cliques aleatórios com semente fixa, por alguns minutos). Só roda em DEMO LOCAL (nunca no real nem em Demo + PLC). Caixa de areia: bloqueia e conta envio de rede (POST/PUT/DELETE), impressão, janela nova, alerta, download e seletor de arquivo. Relatório com cobertura (X de Y objetos), perfil da tela (PC/celular) e achados; o relatório também sai pela Central de registros.',\n"
              "  ]},\n", 'historico')
    # ---- renomear (so no bloco do robo e no HTML do popup)
    ini = t.index("/* ===== v1.9.76 · OPERADOR SECRETO [DEV.OPS]")
    fim = t.index("window.opSecreto={rodar,parar:", ini)
    fim = t.index("\n", t.index("ui();\n})();", fim)) if "ui();\n})();" in t[fim:fim + 800] else fim
    bloco = t[ini:fim]
    bloco2 = bloco.replace('Operador secreto', 'Dev/Operador oculto').replace('OPERADOR SECRETO', 'DEV/OPERADOR OCULTO').replace('operador secreto', 'dev/operador oculto')
    t = t[:ini] + bloco2 + t[fim:]
    # ---- caixa do popup Demo
    m = re.search(r'<div id="opsBox"[^>]*>.*?<p id="opsInfo"', t, re.S)
    assert m, 'opsBox nao encontrado'
    nova_caixa = ('<div id="opsBox" style="border:1px solid var(--jborda,#c9d1db);padding:8px 10px;margin:0 0 12px">\n'
        '      <b style="font-size:12px">🕵️ Dev/Operador oculto <span style="font-weight:400;color:#6b6b66">[DEV.OPS] — robô de teste: aperta os botões como um operador e confere cada trava</span></b>\n'
        '      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:6px;font-size:12px">\n'
        '        <label style="display:flex;gap:6px;align-items:center">Modo <select id="opsModo" style="width:auto;font-size:12px;padding:3px 5px" title="Rápido = as fases de antes. Avançado = varredura de TODOS os objetos + menu do botão direito + Patamar guiado + ensaio (só Demo local). Monkey = cliques aleatórios com semente fixa (só Demo local).">'
        '<option value="rapido">Rápido (como antes)</option><option value="avancado">Avançado (todos os objetos + patamar + ensaio) — só Demo local</option><option value="monkey">Monkey (aleatório, com semente) — só Demo local</option></select></label>\n'
        '        <button type="button" class="bt p" id="opsIni" title="Aperta os botões como um operador e confere cada trava">▶ Iniciar o Dev/Operador oculto</button>\n'
        '        <button type="button" class="bt c" id="opsCopia" disabled title="Copia o relatório da última execução em Markdown">Copiar relatório</button>\n'
        '        <label style="display:flex;gap:6px;align-items:center;font-size:12px" title="Modo Rápido: percorre também um ensaio completo: INICIAR → Dados → 6 etapas com SALVAR → FINALIZAR → Gravar sem relatório. No Demo + PLC isso APAGA e regrava o DB53."><input type="checkbox" id="opsEnsaio" checked> Incluir o ensaio completo (até gravar)</label>\n'
        '        <label style="display:flex;gap:6px;align-items:center;font-size:12px" title="Monkey: mesma semente = mesma sequência de ações (reproduzível)">Semente <input type="number" id="opsSemente" value="20261107" style="width:105px"></label>\n'
        '        <label style="display:flex;gap:6px;align-items:center;font-size:12px" title="Monkey: duração em minutos">Minutos <input type="number" id="opsDur" value="3" min="1" max="30" style="width:56px"></label>\n'
        '      </div>\n      <p id="opsInfo"')
    t = t[:m.start()] + nova_caixa + t[m.end():]
    # ---- fragmento + ligacao dos botoes
    t = troca(t, "  window.opSecreto={rodar,parar:", frag + "\n  window.opSecreto={rodar,rodarAv,parar:", 'insere fragmento')
    t = troca(t, "md:relatorioMd,", "md:relatorioAv,", 'md exportado')
    t = troca(t, "async function copia(){\n    const md=relatorioMd();", "async function copia(){\n    const md=relatorioAv();", 'copia')
    t = troca(t, "const ini=$('opsIni');if(ini)ini.onclick=()=>{rodar({ensaio:$('opsEnsaio').checked})};",
              "const ini=$('opsIni');if(ini)ini.onclick=()=>{const m=($('opsModo')||{}).value||'rapido';if(m==='rapido')rodar({ensaio:$('opsEnsaio').checked});else rodarAv({tipo:m==='monkey'?'monkey':'avancado',semente:($('opsSemente')||{}).value,minutos:($('opsDur')||{}).value})};", 'botao iniciar')
    # ---- Esc: so a tecla REAL (isTrusted) para o robo; o Esc sintetico do proprio robo (fecha janelas) nao conta como Parar
    t = troca(t, "if(e.key==='Escape'&&OPS.rodando&&!OPS.parar){", "if(e.key==='Escape'&&e.isTrusted&&OPS.rodando&&!OPS.parar){", 'esc real')
    # ---- Central v0.2 -> v0.3
    t = troca(t, "/* ===== central_registros_v0.2 (Central de registros) — fonte: dashboard/modulos-fonte/central_registros_v0.2.js ===== */\n" + c2,
              "/* ===== central_registros_v0.3 (Central de registros) — fonte: dashboard/modulos-fonte/central_registros_v0.3.js ===== */\n" + c3, 'central v0.3')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
