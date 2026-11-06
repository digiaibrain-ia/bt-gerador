#!/usr/bin/env python3
"""Fase 4, Portao D - gera medidor_gerador_v1.10.171.html a partir da v1.10.170 (nao sobrescreve; aborta se um trecho esperado mudou).
Central de registros (modulo dashboard/modulos-fonte/central_registros_v0.1.js, embutido): janela com caixas de selecao (alertas, monitoramento, amostras, logs,
dados do ensaio) para SALVAR numa pasta escolhida uma vez (subpasta por ensaio e por tipo + RESUMO.md + AGRUPADO.md), ou em Downloads (um .md agrupado), e IMPRIMIR.
Entradas: chip "Registros" no cabecalho, botao direito (menu do Pacote para a IA) e, no fim do ensaio, um aviso que so PERGUNTA.
Pequenos ganchos de leitura: window.OBS_LOG (eventos da tela) e OCOR.diag (texto do diagnostico). Nada comanda PLC/DSE/chaves.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.171_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
MOD = os.path.join(RAIZ, 'dashboard', 'modulos-fonte', 'central_registros_v0.1.js')
ORIG, DEST = 'medidor_gerador_v1.10.170.html', 'medidor_gerador_v1.10.171.html'


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    modulo = open(MOD, encoding='utf-8').read()
    assert '</script' not in modulo.lower() and '</style' not in modulo.lower(), 'o modulo nao pode conter fechamento de script/style'
    t = troca(t, '<meta name="app-version" content="1.10.170">', '<meta name="app-version" content="1.10.171">', 'meta')
    t = troca(t, "const VERSAO='1.10.170', VERSAO_DATA='06/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.171', VERSAO_DATA='06/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.171\",d:\"06/11/2026\",i:[\n"
              "    'CENTRAL DE REGISTROS (chip \"🗂 Registros\" no cabeçalho, botão direito → \"Central de registros\", ou o aviso do fim do ensaio): uma janela só com caixas de seleção para juntar Alertas e Falhas (com Efeito/Causa/Solução), Monitoramento (estado agora), Amostras, Logs (tela + comunicação do Node-RED) e Dados do ensaio. Salva numa PASTA escolhida UMA vez (BT2_registros/ensaio_data_hora_modelo/, subpasta por tipo + RESUMO.md + AGRUPADO.md para colar na conversa) ou em Downloads (um arquivo agrupado .md). Também IMPRIME na hora e copia o resumo.',\n"
              "    'No fim do ensaio a tela só PERGUNTA \"Salvar os registros agora?\" — nada é gravado sozinho. A Central não apaga nem baixa as amostras pendentes (o fluxo de Amostras continua igual) e não comanda PLC, DSE ou chaves.',\n"
              "  ]},\n", 'historico')
    t = troca(t, '<button id="bAmo" type="button" title="Painel do registro de aprendizado: amostras por modelo de DSE e gerador">Amostras</button>',
              '<button id="bAmo" type="button" title="Painel do registro de aprendizado: amostras por modelo de DSE e gerador">Amostras</button>\n'
              '    <button id="bCentral" type="button" title="Central de registros: salvar ou imprimir logs, amostras, monitoramento e alertas (também no botão direito)">🗂 Registros</button>', 'chip')
    t = troca(t, "  const snapSafe=()=>{try{return snap()}catch(e){return null}};\n",
              "  const snapSafe=()=>{try{return snap()}catch(e){return null}};\n"
              "  window.OBS_LOG={eventos:()=>BUF.slice(),descartados:()=>DESCART,sessao:()=>SESSAO}; // v1.10.171: leitura para a Central de registros (só lê)\n", 'obs_log')
    t = troca(t, "return{set,limpa,ativas,lista,abre,abreH,historico:()=>H.slice(),CAT,CARDS};",
              "return{set,limpa,ativas,lista,abre,abreH,historico:()=>H.slice(),CAT,CARDS,diag:textoDiag};", 'ocor diag')
    t = troca(t, "      ['📋 Abrir pacote (só imagem/texto)', () => abrePacote(null, []), false],\n",
              "      ['📋 Abrir pacote (só imagem/texto)', () => abrePacote(null, []), false],\n"
              "      ['🗂 Central de registros…', () => { if (raiz.CENTRAL_REG) raiz.CENTRAL_REG.abre(); }, !raiz.CENTRAL_REG],\n", 'menu direito')
    t = troca(t, "\n</script>\n</body>\n</html>", "\n</script>\n<script>\n/* ===== central_registros_v0.1 (Central de registros) — fonte: dashboard/modulos-fonte/central_registros_v0.1.js ===== */\n" + modulo + "\n</script>\n</body>\n</html>", 'inline modulo')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
