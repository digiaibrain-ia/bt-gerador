#!/usr/bin/env python3
import subprocess
"""v1.27 (19/11/2026): medidor 1.10.229 + fluxos de chaves com o limite de capacidade C1 (so registra) + arquivo bancos_capacidade.json.
Gera o pacote de implantacao v1.27 (antes "pacote da TI") (zip + MANIFESTO.sha256) FORA do Git. Nao contem IP/senha/token: confere isso antes de gravar.
Uso: python3 scripts/pacote/gerar_pacote_implantacao_v1.27.py <pasta_de_saida>   (nao sobrescreve)"""
import hashlib, os, re, sys, zipfile
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FL = 'nodered/flows/bt2/'
ARQ = [(FL + n + '.json', '01_fluxos_importar/' + n + '.json') for n in (
    'chaves-56-api-v3.8', 'chaves-400-api-v3.7', 'chaves-550-api-v1.8', 'chaves-595-api-v1.8', 'registro-ensaio-db2100-api-v1.10', 'dev-logs-api-v1.3',
    'cliente-156-dse-plc-ensaio-v4.0', 'servidor-deepsea-api-gerador-v3_7')]
ARQ.append(('nodered/flows/rnc-api-v1.2.json', '01_fluxos_importar/rnc-api-v1.2.json'))   # v1.27: RNC (opcional, aba propria, sem nos s7)
ARQ += [(FL + 'simulador-dse-demo-v7.json', '02_somente_bancada/simulador-dse-demo-v7.json'),
        ('dashboard/ferramentas/medidor_gerador_v1.10.229.html', '03_front_operacao/medidor_gerador_v1.10.229.html'),
        ('catalogo/catalogo_modelos_v0.1.csv', '03_front_operacao/catalogo_modelos_v0.1.csv'),
        ('dashboard/modulos-fonte/menu_dev_v0.3.js', '03_front_operacao/menu_dev_v0.3.js'),
        ('dashboard/ferramentas/grafico_ensaio_v0.13.html', '03_front_operacao/grafico_ensaio_v0.13.html'),
        ('dashboard/ferramentas/medidor_gerador_v1.10.229.html', '06_front_desenvolvimento/medidor_gerador_v1.10.229.html'),
        ('dashboard/ferramentas/index_v0.7.html', '06_front_desenvolvimento/index.html'),
        ('dashboard/modulos-fonte/menu_dev_v0.3.js', '06_front_desenvolvimento/menu_dev_v0.3.js'),
        ('catalogo/catalogo_modelos_v0.1.csv', '06_front_desenvolvimento/catalogo_modelos_v0.1.csv'),
        ('dashboard/ferramentas/gerenciador_logs_v1.9.html', '06_front_desenvolvimento/gerenciador_logs_v1.9.html'),
        ('dashboard/ferramentas/grafico_ensaio_v0.13.html', '06_front_desenvolvimento/grafico_ensaio_v0.13.html'),
        ('dashboard/ferramentas/mapa_fbs_v0.19.html', '06_front_desenvolvimento/mapa_fbs_v0.19.html'),
        ('dashboard/ferramentas/maquete_layout_v0.5.html', '06_front_desenvolvimento/maquete_layout_v0.5.html'),
        ('dashboard/ferramentas/api_cards_visor_v0.4.html', '06_front_desenvolvimento/api_cards_visor_v0.4.html'),
        ('dashboard/ferramentas/amostras_simulador_v0.7.html', '06_front_desenvolvimento/amostras_simulador_v0.7.html'),
        ('dashboard/ferramentas/rnc_reparo_v0.3.html', '03_front_operacao/rnc_reparo_v0.3.html'), ('dashboard/ferramentas/rnc_registro_v0.2.html', '03_front_operacao/rnc_registro_v0.2.html'),
        ('dashboard/ferramentas/rnc_reparo_v0.3.html', '06_front_desenvolvimento/rnc_reparo_v0.3.html'), ('dashboard/ferramentas/rnc_registro_v0.2.html', '06_front_desenvolvimento/rnc_registro_v0.2.html'),
        ('docs/modulos/RNC_LEIA-ME_BANCADA_v0.2.md', '08_rnc/RNC_LEIA-ME_BANCADA_v0.2.md'), ('docs/modulos/RNC_CHECKLIST_BANCADA_v0.2.md', '08_rnc/RNC_CHECKLIST_BANCADA_v0.2.md'),
        ('docs/modulos/RNC_RETRABALHO_v0.2.md', '08_rnc/RNC_RETRABALHO_v0.2.md'), ('tests/rnc_teste_bancada_v0.3.js', '08_rnc/rnc_teste_bancada_v0.3.js'), ('docs/bt2/auditoria/AUDITORIA_5_FUNDAMENTOS_v0.1.md', '05_documentos/AUDITORIA_5_FUNDAMENTOS_v0.1.md'), ('docs/bt2/auditoria/AUDITORIA_5_FUNDAMENTOS_RODADA2_v0.1.md', '05_documentos/AUDITORIA_5_FUNDAMENTOS_RODADA2_v0.1.md'), ('docs/bt2/auditoria/DECISOES_PERFIL_COMBUSTIVEL_E_ESCALONAMENTO_v0.1.md', '05_documentos/DECISOES_PERFIL_COMBUSTIVEL_E_ESCALONAMENTO_v0.1.md'), ('docs/bt2/auditoria/MODOS_DE_OPERACAO_v0.1.md', '05_documentos/MODOS_DE_OPERACAO_v0.1.md'),
        ('config/pc-bt2.env.example', '04_config/pc-bt2.env.example'),
        ('nodered/config/bancos_capacidade.json', '04_config/bancos_capacidade.json'),   # v1.27 (C1): arquivo de capacidade lido pelos fluxos de chaves (BT2_CAPACIDADE_JSON)
        ('nodered/config/LEIA-ME.md', '04_config/LEIA-ME_bancos_capacidade.md'),
        ('docs/bt2/migracao/IMPLANTACAO_C1_CHECKLIST_v0.1.md', '05_documentos/IMPLANTACAO_C1_CHECKLIST_v0.1.md'),
        ('docs/bt2/auditoria/PASSO_5_B1_B2_CATCH_DE_COMANDO_v0.1.md', '05_documentos/PASSO_5_B1_B2_CATCH_DE_COMANDO_v0.1.md'),
        ('docs/bt2/auditoria/PASSO_5_C1_CAPACIDADE_NO_BACKEND_v0.1.md', '05_documentos/PASSO_5_C1_CAPACIDADE_NO_BACKEND_v0.1.md'),
        ('docs/bt2/auditoria/PASSO_5_B3_B4_CATCH_VAZIO_v0.1.md', '05_documentos/PASSO_5_B3_B4_CATCH_VAZIO_v0.1.md'),
        ('docs/bt2/auditoria/PASSO_3_BUILD_MODULAR_v0.1.md', '05_documentos/PASSO_3_BUILD_MODULAR_v0.1.md')]
for d in ('IMPLANTACAO_ROTEIRO_v0.11.md', 'CHECKLIST_BANCADA_v0.8.md', 'HANDOFF_IMPLANTACAO_v0.8.md'): ARQ.append(('docs/bt2/migracao/' + d, '05_documentos/' + d))
ARQ += [('docs/bt2/ANALISE_CONCLUSAO_2026-11-10.md', '05_documentos/ANALISE_CONCLUSAO_2026-11-10.md'), ('BACKLOG_FORA_DE_ESCOPO.md', '05_documentos/BACKLOG_FORA_DE_ESCOPO.md'),
        ('docs/bt2/modulos/DADOS_ENSAIO_POR_NS_v0.1.md', '05_documentos/DADOS_ENSAIO_POR_NS_v0.1.md'), ('docs/bt2/modulos/REGISTRO_ENSAIO_V1.10_NS.md', '05_documentos/REGISTRO_ENSAIO_V1.10_NS.md'),
        ('docs/bt2/modulos/DECODIFICA_SERIE_MWM_v0.1.md', '05_documentos/DECODIFICA_SERIE_MWM_v0.1.md'),
        ('docs/bt2/modulos/ALARME_INTELIGENTE_v0.1.md', '05_documentos/ALARME_INTELIGENTE_v0.1.md'), ('docs/bt2/modulos/ALARME_INTELIGENTE_v0.2.md', '05_documentos/ALARME_INTELIGENTE_v0.2.md'), ('docs/bt2/modulos/CENTRAL_REGISTROS_v0.4_EXPORTAR.md', '05_documentos/CENTRAL_REGISTROS_v0.4_EXPORTAR.md'),
        ('docs/bt2/modulos/RNC_AREA_MEDIDOR_v0.1.md', '05_documentos/RNC_AREA_MEDIDOR_v0.1.md'), ('docs/modulos/BANCOS_VISIVEIS_v0.1.md', '05_documentos/BANCOS_VISIVEIS_v0.1.md'),
        ('docs/bt2/modulos/MAPA_FBS_v0.18.md', '05_documentos/MAPA_FBS_v0.18.md'), ('docs/bt2/modulos/MAPA_FBS_v0.19.md', '05_documentos/MAPA_FBS_v0.19.md'),
        ('docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v7.3.xlsx', '05_documentos/PLANO_NUMERACAO_BLOCOS_PLC_v7.3.xlsx'),
        ('docs/bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.27.txt', 'LEIA-ME_PRIMEIRO.txt')]
EXT = ('.scl', '.db')
PLC = 'plc/bt2/entrega_1200_v0.17'
for sub in ('PLC_1515', 'PLC_CARGA_1200'):
    for n in sorted(os.listdir(os.path.join(RAIZ, PLC, sub))):
        if n.endswith(EXT): ARQ.append(('%s/%s/%s' % (PLC, sub, n), 'plc/%s/%s' % (sub, n)))
ET = 'plc/bt2/entrega_et200_v0.7'   # v1.27: ET200 v0.7 (fb_bancosEt200 v0.2 com Ligar Banco seguro, fc v0.7, ibancosEt200.db)   # v1.9: blocos do ET200 (teste provisorio) + 1515 para o ET200
for sub in ('PLC_1515', 'PLC_ET200'):
    for n in sorted(os.listdir(os.path.join(RAIZ, ET, sub))):
        if n.endswith(EXT): ARQ.append(('%s/%s/%s' % (ET, sub, n), 'plc_et200/%s/%s' % (sub, n)))
ARQ.append((ET + '/COMO_USAR_et200.txt', 'plc_et200/COMO_USAR_et200.txt'))
# v1.11: DBs de setup por tensao (o fluxo le o DB3002/DB3102) em cada pasta do 1515; padrao de fluxos e infografico; teste S7 isolado (diagnostico, usa ${PLC_IP})
for _d in ('plc/PLC_1515', 'plc_et200/PLC_1515'):
    for _n in ('db3002_BC56_SetupPorTensao_v0.2.db', 'db3102_BC400_SetupPorTensao_v0.2.db'): ARQ.append(('plc/bt2/bancos_cargas/' + _n, _d + '/' + _n))
ARQ += [('docs/bt2/padroes/PADRAO_FLUXOS_NODERED_v0.1.md', '05_documentos/PADRAO_FLUXOS_NODERED_v0.1.md'), ('docs/bt2/plc/INFOGRAFICO_CHAMADAS_BLOCOS_v0.6.html', '05_documentos/INFOGRAFICO_CHAMADAS_BLOCOS_v0.6.html'),
        (FL + 'teste-s7-isolado-v0.1.json', '07_diagnostico/teste-s7-isolado-v0.1.json')]
ARQ.append((PLC + '/COMO_USAR.txt', 'plc/COMO_USAR_1200.txt'))
# ---- v1.27 (17/11/2026): catalogo DSE, todos os .js do projeto, pacote do Alexandre (1200 v0.17), arquitetura v0.6, infografico v0.7, resumo
ARQ += [('scripts/catalogo/catalogo_dse_v0.1.py', '10_catalogo_dse/catalogo_dse_v0.1.py'),
        ('docs/bt2/arquitetura/arquitetura_bt2_v0.6_editavel.html', '05_documentos/arquitetura_bt2_v0.6_editavel.html'),
        ('docs/bt2/plc/INFOGRAFICO_CHAMADAS_BLOCOS_v0.7.html', '05_documentos/INFOGRAFICO_CHAMADAS_BLOCOS_v0.7.html'),
        ('docs/bt2/arquitetura/RESUMO_ARQUITETURA_REUNIAO_v0.1.md', '05_documentos/RESUMO_ARQUITETURA_REUNIAO_v0.1.md'),
        ('docs/bt2/arquitetura/arquitetura_bt2_v0.6_editavel.html', '06_front_desenvolvimento/arquitetura_bt2_v0.6_editavel.html'),
        ('docs/bt2/plc/INFOGRAFICO_CHAMADAS_BLOCOS_v0.7.html', '06_front_desenvolvimento/INFOGRAFICO_CHAMADAS_BLOCOS_v0.7.html'),
        ('docs/bt2/migracao/LEIA-ME_PACOTE_ALEXANDRE_1200_v0.1.txt', '12_para_alexandre/LEIA-ME_PACOTE_ALEXANDRE_1200_v0.1.txt'),
        ('plc/bt2/entrega_1200_v0.17/COMO_USAR.txt', '12_para_alexandre/COMO_USAR.txt'),
        ('plc/bt2/entrega_1200_v0.17/PLC_CARGA_1200/fb_bancosCarga1200_v0.1.scl', '12_para_alexandre/PLC_CARGA_1200/fb_bancosCarga1200_v0.1.scl')]
# bibliotecas de terceiros usadas pelo projeto (OCR tesseract) e o exemplo sintetico do catalogo
_vendor = subprocess.run(['git', '-C', RAIZ, 'ls-files', 'dashboard/vendor/'], capture_output=True, text=True, check=True).stdout.split()
ARQ += [(v, '13_vendor/' + v[len('dashboard/vendor/'):]) for v in _vendor]
ARQ += [('catalogo/exemplo_SINTETICO_amostras.csv', '14_exemplo_sintetico/exemplo_SINTETICO_amostras.csv'), ('catalogo/exemplo_SINTETICO_resumo.txt', '14_exemplo_sintetico/exemplo_SINTETICO_resumo.txt')]
# todos os .js do projeto (node_modules fora; bibliotecas de terceiros estao em 13_vendor)

_js = subprocess.run(['git', '-C', RAIZ, 'ls-files', '*.js'], capture_output=True, text=True, check=True).stdout.split()
# guardas de producao com IPs reais escritos no codigo: NAO vao para o pacote (ver BACKLOG: IP real no Git)
_EXCLUIR_IP = {'tests/integracao/t0_trava_producao.test.js', 'tests/integracao/trava_producao.js'}
_js = [j for j in _js if '/node_modules/' not in j and j not in _EXCLUIR_IP]
ARQ += [(j, '09_todos_os_js/' + j) for j in _js]
IP = re.compile(rb'\b(10|172\.(1[6-9]|2[0-9]|3[01])|192\.168)\.\d{1,3}\.\d{1,3}(\.\d{1,3})?\b')
def _zip_alexandre(itens):
    import io
    b = io.BytesIO()
    with zipfile.ZipFile(b, 'w', zipfile.ZIP_DEFLATED) as z:
        for d, c in itens: z.writestr('pacote_alexandre_1200/' + d, c)
        z.writestr('pacote_alexandre_1200/MANIFESTO.sha256', ''.join('%s  %s\n' % (hashlib.sha256(c).hexdigest(), d) for d, c in sorted(itens)))
    return b.getvalue()

def _versao(nome):
    m = re.search(r'_v(\d+(?:[._]\d+)*)\.js$', nome)
    return tuple(int(x) for x in re.split(r'[._]', m.group(1))) if m else ()
def _base(nome):
    return re.sub(r'_v\d+(?:[._]\d+)*(?=\.js$)', '', nome)
def filtra(arq):
    """v1.27: pacote por categoria. Corta versoes antigas, duplicatas e testes; mantem a versao atual de cada modulo JS."""
    cont = {}
    for o, d in arq:
        cont.setdefault(d, o)
    out, vistos = [], set()
    # 06_front_desenvolvimento mantem as ferramentas: o catalogo do menu (gerado a partir dela) precisa delas la
    # 2) fontes JS: so a versao atual de cada modulo, sem testes e sem bibliotecas
    js_atual = {}
    for o, d in arq:
        if d.startswith('09_todos_os_js/'):
            continue
    fontes = subprocess.run(['git', '-C', RAIZ, 'ls-files', 'dashboard/modulos-fonte/*.js', 'nodered/gerador/*.js', 'nodered/gerador/rnc/*.js'], capture_output=True, text=True, check=True).stdout.split()
    for f in fontes:
        k = _base(os.path.basename(f))
        if k not in js_atual or _versao(f) > _versao(js_atual[k]):
            js_atual[k] = f
    for o, d in arq:
        if d.startswith('09_todos_os_js/') or d.startswith('12_para_alexandre/'):
            continue   # substituidos abaixo (fontes atuais) e pelo zip do programador
        if d.startswith('08_rnc/') and d.endswith('.js') and not d.endswith('rnc_teste_bancada_v0.3.js'):
            continue   # so a versao atual do teste de bancada do RNC
        if (o.startswith('tests/') or '/tests/' in o) and not d.startswith('08_rnc/'):   # o teste de bancada do RNC e usado na bancada: fica
            continue
        out.append((o, d))
    for k, f in sorted(js_atual.items()):
        out.append((f, '09_fontes_js_atuais/' + os.path.basename(f)))
    out.append(('plc/bt2/entrega_1200_v0.17/COMO_USAR.txt', '12_para_alexandre/COMO_USAR.txt'))
    out.append(('docs/bt2/migracao/LEIA-ME_PACOTE_ALEXANDRE_1200_v0.1.txt', '12_para_alexandre/LEIA-ME_PACOTE_ALEXANDRE_1200_v0.1.txt'))
    return out

def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    saida = os.path.abspath(sys.argv[1]); os.makedirs(saida, exist_ok=True)
    zp = os.path.join(saida, 'entrega_implantacao_bt2_v1.27.zip'); assert not os.path.exists(zp), 'ja existe: ' + zp
    itens = []
    import importlib.util as _u
    _sp = _u.spec_from_file_location('alx', os.path.join(RAIZ, 'scripts', 'pacote', 'gerar_pacote_alexandre_1200_v0.1.py')); _alx = _u.module_from_spec(_sp); _sp.loader.exec_module(_alx)
    for o, d in filtra(ARQ):
        p = os.path.join(RAIZ, o); assert os.path.exists(p), 'falta ' + o
        b = open(p, 'rb').read()
        if d.endswith(('.json', '.html', '.js', '.md', '.txt', '.scl', '.db', '.example')): assert not IP.search(b), 'IP real em ' + o
        itens.append((d, b))
    itens += [('11_pacote_alexandre_zip/pacote_alexandre_1200_v0.17.zip', _zip_alexandre(_alx.monta_itens()))]   # o zip do programador, pronto para enviar
    # catalogo de ferramentas GERADO a partir dos arquivos da pasta de desenvolvimento deste pacote (maior versao de cada ferramenta; nome sem versao)
    import importlib.util
    sp = importlib.util.spec_from_file_location('cat', os.path.join(RAIZ, 'dashboard', 'gerador', 'gerar_catalogo_auto_v0.2.2.py')); cat = importlib.util.module_from_spec(sp); sp.loader.exec_module(cat)
    dev = [d.split('/')[-1] for d, _ in itens if d.startswith('06_front_desenvolvimento/')]
    cj = cat.monta(open(os.path.join(cat.PASTA, cat.BASE), encoding='utf-8').read(), dev, 'pacote v1.27').encode('utf-8')
    itens.append(('06_front_desenvolvimento/catalogo_ferramentas.js', cj)); itens.append(('03_front_operacao/catalogo_ferramentas.js', cj))   # v1.9: o menu da operacao tambem precisa do catalogo
    man = ''.join('%s  %s\n' % (hashlib.sha256(b).hexdigest(), d) for d, b in sorted(itens))
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
        for d, b in itens: z.writestr('entrega_implantacao_bt2/' + d, b)
        z.writestr('entrega_implantacao_bt2/MANIFESTO.sha256', man)
    print('gerado', zp, len(itens), 'arquivos')
if __name__ == '__main__': main()
