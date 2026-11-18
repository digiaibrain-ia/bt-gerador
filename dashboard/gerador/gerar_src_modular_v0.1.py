#!/usr/bin/env python3
"""gerar_src_modular_v0.1.py — quebra o medidor 1.10.226 em módulos pequenos dentro de dashboard/src/ (Passo 3 da auditoria).

PARA QUE SERVE (leigo): o medidor é um arquivo gigante (13 mil linhas). Este script, rodado UMA vez, recorta esse arquivo
em pedaços por assunto (cada um um arquivo .js ou .css) e deixa um "esqueleto" index.html com a lista dos pedaços.
O build (dashboard/build/build.js) cola tudo de volta. Como só se corta e cola, SEM mudar nenhum caractere, o
arquivo montado tem que ser IDÊNTICO ao medidor 1.10.226 (a prova é feita por hash SHA-256, ver --provar).

COMO FUNCIONA (técnico): lê <style>/<script> inline do HTML, grava cada corpo em dashboard/src/css|js (o script principal,
de 790 KB, é cortado em linhas que começam um comando de topo, conforme a tabela MODULOS abaixo; o corte sobe até incluir
os comentários que antecedem o comando), troca cada corpo por um marcador <!--@raw ... --> e tokeniza a versão
(meta app-version e const VERSAO/VERSAO_DATA). Os 4 scripts que já existem IDÊNTICOS em dashboard/modulos-fonte/ são
referenciados de lá (uma fonte só, sem cópia).

USO   : python3 dashboard/gerador/gerar_src_modular_v0.1.py [--provar]
        sem opção : (re)grava dashboard/src/ a partir de dashboard/ferramentas/medidor_gerador_v1.10.226.html
        --provar  : depois de gravar, roda o build com a versão 1.10.226 e compara o hash com o original.
NÃO FAZ: não altera o medidor 1.10.226, não lê PLC/DSE/Node-RED. Sobrescreve dashboard/src/ (use git para voltar).
REGRA  : módulos NOVOS não nascem deste script; depois do Passo 3 edita-se dashboard/src/ direto.
"""
import hashlib, json, os, re, subprocess, sys

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
ORIGEM = os.path.join(RAIZ, 'dashboard', 'ferramentas', 'medidor_gerador_v1.10.226.html')
SRC = os.path.join(RAIZ, 'dashboard', 'src')
FONTES = os.path.join(RAIZ, 'dashboard', 'modulos-fonte')
VERSAO_BASE, DATA_BASE = '1.10.226', '18/11/2026'

# --- script principal: (linha em que o módulo começa, arquivo, o que faz). Linhas contadas dentro do script principal. ---
MODULOS = [
    (2,    '01_ensaio_etapas_e_cronometro',    'Etapas do ensaio, tolerâncias, estado, cronômetro, passo a passo, parar ensaio e zerar degrau'),
    (196,  '02_grafico_do_ensaio',             'Gráfico do ensaio (geometria, desenho, PNG e CSV)'),
    (338,  '03_dados_do_ensaio_e_etapas',      'Dados demo/reais, valores por etapa, salvar e avançar etapa'),
    (406,  '04_pdf_basico',                    'Gerador de PDF simples (classe Pg e pdfBlob)'),
    (448,  '05_dse_simulado',                  'Tela do DSE simulado (olhos, tabela, aplicar)'),
    (468,  '06_avaliacao_e_pdf_do_ensaio',     'Avaliação do ensaio (aprovado/reprovado) e PDF do relatório'),
    (577,  '07_escalas_e_tabela_principal',    'Escalas, zoom e tabela principal de leituras'),
    (614,  '08_finalizar_ensaio_manual',       'Finalizar o ensaio manual com confirmação'),
    (662,  '09_fbs_virtuais_mae',              'FBs virtuais (mãe e filhos do Patamar) — cópia embutida do módulo'),
    (829,  '10_modo_manual_automatico',        'Velocidade e modo Manual/Automático'),
    (844,  '11_bancos_e_chaves_modelo',        'Modelo dos bancos de carga e das chaves (BANCOS, CH, BKS, liberações)'),
    (924,  '12_simulacao_demo',                'Simulação do Demo (carga, gerador, ruído, passo da simulação)'),
    (1013, '13_desenho_bancos_e_gerador',      'Desenho dos bancos, LEDs e cartão do gerador'),
    (1166, '14_comandos_do_gerador',           'Comandos ao gerador (iniciar, parar, vigia)'),
    (1225, '15_alarmes_basicos_e_ingestao',    'Busca de dados, ingestão das leituras, alarmes básicos e leitura do PLC'),
    (1345, '16_render_tick_e_partida',         'Redesenho, ciclo principal (tick) e partida da tela'),
    (1450, '17_formatos_comuns',               'Formatadores de hora/data/número e janelas'),
    (1462, '18_versao',                        'VERSAO e VERSAO_DATA (preenchidos pelo build a partir de versao.json)'),
    (1463, '19_historico_de_versoes',          'HISTORICO: lista do que mudou em cada versão (dado; novo item vai NO TOPO)'),
    (2506, '20_servidor_e_url',                'Endereço do Node-RED, sondagem do PLC e fonte dos dados'),
    (2616, '21_ensaio_api_cliente',            'Cliente da API do ensaio (ens*: ler, enviar, sincronizar)'),
    (2945, '22_ensaio_mock',                   'Servidor de mentira do ensaio (Demo)'),
    (2987, '23_tabela_e_janela_de_etapas',     'Tabela das etapas e janela de uma etapa'),
    (3129, '24_leitura_de_imagem_sap_ocr',     'Importar print do SAP: OCR local e preenchimento'),
    (3493, '25_dados_do_ensaio_e_resultado',   'Janela Dados do ensaio, início do ensaio e janela de resultado'),
    (3668, '26_patamar_aplicar',               'Regras do Aplicar do Patamar (salvar manual, porpat, aplicar)'),
    (3746, '27_grandezas_motor_e_impressao',   'Janelas de grandezas do DSE e do motor, impressão e PDF'),
    (3949, '28_parametros_do_ensaio',          'Janela de parâmetros do ensaio e ajuste das faixas'),
    (4070, '29_janelas_e_cards_ui',            'Comportamento de janelas e cards (posição, recolher, seletor Manual/Auto)'),
    (4260, '30_demo_painel_simulacao',         'Painel do Demo (liga/desliga, carga simulada)'),
    (4359, '31_chaves_e_bancos_painel',        'Painel de chaves e bancos (seleção, comandos, fila, confirmação)'),
    (5127, '32_catalogo_dse_e_ficha',          'Catálogo de modelos de gerador, potência por modelo e ficha'),
    (5227, '33_patamar_guiado',                'Patamar Guiado (diálogo, plano de chaves, execução)'),
    (5815, '34_bancos_em_uso_e_setup',         'Bancos em uso (lista única) e Setup por tensão'),
    (5935, '35_exportar_e_logs',               'Exportar (menu), impressão com nome e janela de logs'),
    (6070, '36_ocorrencias_e_alarmes',         'Central de ocorrências: Alertas, Falhas e Informações (OCOR)'),
    (6457, '37_registro_do_ensaio',            'Registro do ensaio em arquivo (sessões, amostras, resumo, baixar)'),
    (6825, '38_modo_de_testes_e_partida',      'Modo de testes (senha, Demo, servidor) e partida final da tela'),
    (6998, '39_dev_observacao',                'Observação para desenvolvimento (buffer de eventos DEV.OBS)'),
    (7259, '40_robo_operador_secreto',         'Robô de inspeção (DEV.OPS), roteiros por fase, relatório'),
]

# --- demais scripts e estilos, na ordem em que aparecem no HTML: (rótulo do corpo, arquivo em src) ---
SCRIPTS_PEQUENOS = {
    1:  ('js/00_armazenamento_seguro.js',   'Armazenamento seguro (localStorage indisponível vira memória)'),
    2:  ('js/01_rodizio_chaves.js',         'Rodízio de chaves e entrada escalonada (cópia embutida)'),
    4:  ('js/02_api_cards.js',              'API interna dos cards'),
    5:  ('js/03_modo_operador.js',          'Visão simples do operador'),
    7:  ('js/04_bancos_visiveis.js',        'Card Banco de cargas: só os bancos selecionados'),
    9:  ('js/05_janelas.js',                'Janelas flutuantes e tamanho compacto'),
    12: ('js/06_paginas_embutidas.js',      'DADO: páginas embutidas (gráfico do ensaio etc., 236 KB em texto)'),
    13: ('js/07_dica_ui.js',                'Dica de interface (nome e id do elemento)'),
    14: ('js/08_pacote_ia.js',              'Menu do botão direito e Pacote para a IA'),
    15: ('js/09_central_registros.js',      'Central de registros'),
    16: ('js/10_balao_icone_info.js',       'Balão do ícone ⓘ'),
}
# nomes que ja existem IDENTICOS em dashboard/modulos-fonte (uma fonte só): indice do script -> arquivo
SCRIPTS_IDENTICOS = {6: 'rnc_defeito_v0.4.js', 8: 'fb_perfil_combustivel_v0.1.js',
                     10: 'decodifica_serie_mwm_v0.3.js', 11: 'dados_ensaio_ns_v0.2.js'}
# estilo principal: (linha em que começa, arquivo, o que faz), linhas contadas dentro do <style>
CSS = [
    (1,    'css/01_base.css',                             'Base: variáveis, cores, tipografia, botões'),
    (158,  'css/02_estrutura_gerador_cronometro.css',    'Estrutura, cartão do gerador, cronômetro e medidas'),
    (266,  'css/03_tabela_banco_grafico_celular.css',    'Tabela do ensaio, banco de carga, gráfico e celular'),
    (384,  'css/04_barra_alarmes_finalizar.css',         'Barra superior, alarmes por faixa e finalizar ensaio'),
    (411,  'css/05_janelas_flutuantes.css',              'Janelas flutuantes (estilo supervisório)'),
    (949,  'css/06_janela_agua_e_modo_escuro.css',       'Janela da água e modo escuro'),
    (1022, 'css/07_icones_grandezas_sap.css',            'Ícones das janelas, grandezas do DSE e importar print SAP'),
    (1112, 'css/08_layout_por_tamanho_de_tela.css',      'Layout por tamanho de tela (fica por último para valer)'),
    (1233, 'css/09_botoes_placas_correcoes_barra_dev.css', 'Botões sem borda, placas, correções da revisão, barra Dev'),
]


def escreve(rel, texto):
    f = os.path.join(SRC, rel)
    os.makedirs(os.path.dirname(f), exist_ok=True)
    with open(f, 'w', encoding='utf8', newline='') as fh:
        fh.write(texto)


def sobe_comentarios(linhas, i):
    """Dado o índice (0-based) da linha em que o módulo começa, sobe para incluir blocos de comentário e linhas em
    branco que ficam logo acima (eles pertencem ao módulo seguinte, não ao anterior)."""
    while i > 0:
        ant = linhas[i - 1].strip()
        if ant == '' or ant.startswith('//'):
            i -= 1
        elif ant.endswith('*/'):
            j = i - 1
            while j >= 0 and '/*' not in linhas[j]:
                j -= 1
            if j >= 0 and linhas[j].strip().startswith('/*') and not any('*/' in linhas[k] for k in range(j, i - 1)):
                i = j
            else:
                break
        else:
            break
    return i


def corta(texto, tabela, sobe=True):
    """Corta 'texto' nas linhas da tabela [(linha1based, arquivo, desc)]; devolve [(arquivo, desc, trecho)]."""
    linhas = texto.splitlines(keepends=True)
    inicios = []
    for (ln, arq, desc) in tabela:
        i = ln - 1
        inicios.append(sobe_comentarios([l for l in linhas], i) if (sobe and ln > 1) else i)
    inicios[0] = 0
    assert inicios == sorted(inicios), 'cortes fora de ordem'
    fins = inicios[1:] + [len(linhas)]
    return [(arq, desc, ''.join(linhas[a:b])) for (_, arq, desc), a, b in zip(tabela, inicios, fins)]


def main():
    html = open(ORIGEM, encoding='utf8', newline='').read()
    sha_origem = hashlib.sha256(html.encode('utf8')).hexdigest()
    # 1) acha os <script> e <style> inline (os com src ficam como estão no esqueleto)
    achados = [m for m in re.finditer(r'<(script|style)\b([^>]*)>(.*?)</\1>', html, re.S) if 'src=' not in m.group(2)]
    scripts = [m for m in achados if m.group(1) == 'script']
    estilos = [m for m in achados if m.group(1) == 'style']
    assert len(scripts) == 16 and len(estilos) == 2, (len(scripts), len(estilos))
    pedacos = {}   # inicio do corpo -> (fim, marcador)
    # 2) scripts
    for n, m in enumerate(scripts, 1):
        corpo = m.group(3)
        if n == 3:
            partes = corta(corpo, [(a, 'js/principal/' + b + '.js', c) for a, b, c in MODULOS])
            lista = []
            for arq, desc, trecho in partes:
                if arq.endswith('18_versao.js'):
                    novo = trecho.replace("const VERSAO='%s', VERSAO_DATA='%s';" % (VERSAO_BASE, DATA_BASE),
                                          "const VERSAO='@@VERSAO@@', VERSAO_DATA='@@DATA@@';")
                    assert novo != trecho, 'linha VERSAO nao encontrada'; trecho = novo
                escreve(arq, trecho); lista.append((arq, desc))
        elif n in SCRIPTS_IDENTICOS:
            nome = SCRIPTS_IDENTICOS[n]
            texto = open(os.path.join(FONTES, nome), encoding='utf8', newline='').read()
            k = corpo.find(texto); assert k >= 0, 'texto do módulo-fonte nao esta no HTML: ' + nome
            # as quebras de linha antes/depois do módulo ficam no esqueleto; o módulo-fonte entra byte a byte
            pedacos[m.start(3) + k] = (m.start(3) + k + len(texto), [('../modulos-fonte/' + nome, 'idêntico ao módulo-fonte (uma fonte só)')])
            continue
        else:
            arq, desc = SCRIPTS_PEQUENOS[n]; escreve(arq, corpo); lista = [(arq, desc)]
        pedacos[m.start(3)] = (m.end(3), lista)
    # 3) estilo principal (o pequeno ibubTipCss fica dentro do esqueleto por ter só 1 regra)
    for m in estilos:
        if 'ibubTipCss' in m.group(2):
            continue
        partes = corta(m.group(3), CSS, sobe=False)
        for arq, desc, trecho in partes:
            escreve(arq, trecho)
        pedacos[m.start(3)] = (m.end(3), [(a, d) for a, d, _ in partes])
    # 4) esqueleto: corpos viram marcadores
    saida, pos = [], 0
    for ini in sorted(pedacos):
        fim, lista = pedacos[ini]
        marcador = '<!--@raw\n' + '\n'.join('%-62s # %s' % (a, d) for a, d in lista) + '\n-->'
        saida.append(html[pos:ini]); saida.append(marcador); pos = fim
    saida.append(html[pos:])
    esqueleto = ''.join(saida)
    antigo = '<meta name="app-version" content="%s">' % VERSAO_BASE
    assert esqueleto.count(antigo) == 1
    esqueleto = esqueleto.replace(antigo, '<meta name="app-version" content="@@VERSAO@@">')
    escreve('index.html', esqueleto)
    escreve('versao.json', json.dumps({'nome': 'medidor_gerador', 'versao': VERSAO_BASE, 'data': DATA_BASE}, ensure_ascii=False) + '\n')
    print('src gravado: %d módulos JS principais, %d arquivos no total' % (len(MODULOS), sum(len(f) for _, _, f in os.walk(SRC))))
    if '--provar' in sys.argv:
        saida_teste = os.path.join(RAIZ, 'dashboard', 'dist', 'prova_equivalencia_226.html')
        subprocess.check_call(['node', os.path.join(RAIZ, 'dashboard', 'build', 'build.js'), '--saida', saida_teste])
        sha_novo = hashlib.sha256(open(saida_teste, encoding='utf8', newline='').read().encode('utf8')).hexdigest()
        print('original :', sha_origem); print('remontado:', sha_novo)
        print('IDENTICO' if sha_origem == sha_novo else 'DIFERENTE'); sys.exit(0 if sha_origem == sha_novo else 1)


if __name__ == '__main__':
    main()
