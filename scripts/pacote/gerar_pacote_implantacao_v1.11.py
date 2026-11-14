#!/usr/bin/env python3
"""Gera o pacote de implantacao v1.11 (antes "pacote da TI") (zip + MANIFESTO.sha256) FORA do Git. Nao contem IP/senha/token: confere isso antes de gravar.
Uso: python3 scripts/pacote/gerar_pacote_implantacao_v1.11.py <pasta_de_saida>   (nao sobrescreve)"""
import hashlib, os, re, sys, zipfile
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FL = 'nodered/flows/bt2/'
ARQ = [(FL + n + '.json', '01_fluxos_importar/' + n + '.json') for n in (
    'chaves-56-api-v3.6', 'chaves-400-api-v3.5', 'chaves-550-api-v1.6', 'chaves-595-api-v1.6', 'registro-ensaio-db2100-api-v1.8', 'dev-logs-api-v1.3',
    'cliente-156-dse-plc-ensaio-v4.0', 'servidor-deepsea-api-gerador-v3_7')]
ARQ += [(FL + 'simulador-dse-demo-v7.json', '02_somente_bancada/simulador-dse-demo-v7.json'),
        ('dashboard/ferramentas/medidor_gerador_v1.10.201.html', '03_front_operacao/medidor_gerador_v1.10.201.html'),
        ('catalogo/catalogo_modelos_v0.1.csv', '03_front_operacao/catalogo_modelos_v0.1.csv'),
        ('dashboard/modulos-fonte/menu_dev_v0.3.js', '03_front_operacao/menu_dev_v0.3.js'),
        ('dashboard/ferramentas/grafico_ensaio_v0.13.html', '03_front_operacao/grafico_ensaio_v0.13.html'),
        ('dashboard/ferramentas/medidor_gerador_v1.10.201.html', '06_front_desenvolvimento/medidor_gerador_v1.10.201.html'),
        ('dashboard/ferramentas/index_v0.7.html', '06_front_desenvolvimento/index.html'),
        ('dashboard/modulos-fonte/menu_dev_v0.3.js', '06_front_desenvolvimento/menu_dev_v0.3.js'),
        ('catalogo/catalogo_modelos_v0.1.csv', '06_front_desenvolvimento/catalogo_modelos_v0.1.csv'),
        ('dashboard/ferramentas/gerenciador_logs_v1.9.html', '06_front_desenvolvimento/gerenciador_logs_v1.9.html'),
        ('dashboard/ferramentas/grafico_ensaio_v0.13.html', '06_front_desenvolvimento/grafico_ensaio_v0.13.html'),
        ('dashboard/ferramentas/mapa_fbs_v0.16.html', '06_front_desenvolvimento/mapa_fbs_v0.16.html'),
        ('dashboard/ferramentas/maquete_layout_v0.5.html', '06_front_desenvolvimento/maquete_layout_v0.5.html'),
        ('dashboard/ferramentas/api_cards_visor_v0.4.html', '06_front_desenvolvimento/api_cards_visor_v0.4.html'),
        ('dashboard/ferramentas/amostras_simulador_v0.7.html', '06_front_desenvolvimento/amostras_simulador_v0.7.html'),
        ('config/pc-bt2.env.example', '04_config/pc-bt2.env.example')]
for d in ('IMPLANTACAO_ROTEIRO_v0.11.md', 'CHECKLIST_BANCADA_v0.8.md', 'HANDOFF_IMPLANTACAO_v0.8.md'): ARQ.append(('docs/bt2/migracao/' + d, '05_documentos/' + d))
ARQ += [('docs/bt2/ANALISE_CONCLUSAO_2026-11-10.md', '05_documentos/ANALISE_CONCLUSAO_2026-11-10.md'), ('BACKLOG_FORA_DE_ESCOPO.md', '05_documentos/BACKLOG_FORA_DE_ESCOPO.md'),
        ('docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v7.3.xlsx', '05_documentos/PLANO_NUMERACAO_BLOCOS_PLC_v7.3.xlsx'),
        ('docs/bt2/migracao/LEIA-ME_ENTREGA_IMPLANTACAO_v1.11.txt', 'LEIA-ME_PRIMEIRO.txt')]
EXT = ('.scl', '.db')
PLC = 'plc/bt2/entrega_1200_v0.16'
for sub in ('PLC_1515', 'PLC_CARGA_1200'):
    for n in sorted(os.listdir(os.path.join(RAIZ, PLC, sub))):
        if n.endswith(EXT): ARQ.append(('%s/%s/%s' % (PLC, sub, n), 'plc/%s/%s' % (sub, n)))
ET = 'plc/bt2/entrega_et200_v0.1'   # v1.9: blocos do ET200 (teste provisorio) + 1515 para o ET200
for sub in ('PLC_1515', 'PLC_ET200'):
    for n in sorted(os.listdir(os.path.join(RAIZ, ET, sub))):
        if n.endswith(EXT): ARQ.append(('%s/%s/%s' % (ET, sub, n), 'plc_et200/%s/%s' % (sub, n)))
ARQ.append((ET + '/COMO_USAR.txt', 'plc_et200/COMO_USAR_et200.txt'))
# v1.11: DBs de setup por tensao (o fluxo le o DB3002/DB3102) em cada pasta do 1515; padrao de fluxos e infografico; teste S7 isolado (diagnostico, usa ${PLC_IP})
for _d in ('plc/PLC_1515', 'plc_et200/PLC_1515'):
    for _n in ('db3002_BC56_SetupPorTensao_v0.2.db', 'db3102_BC400_SetupPorTensao_v0.2.db'): ARQ.append(('plc/bt2/bancos_cargas/' + _n, _d + '/' + _n))
ARQ += [('docs/bt2/padroes/PADRAO_FLUXOS_NODERED_v0.1.md', '05_documentos/PADRAO_FLUXOS_NODERED_v0.1.md'), ('docs/bt2/plc/INFOGRAFICO_CHAMADAS_BLOCOS_v0.6.html', '05_documentos/INFOGRAFICO_CHAMADAS_BLOCOS_v0.6.html'),
        (FL + 'teste-s7-isolado-v0.1.json', '07_diagnostico/teste-s7-isolado-v0.1.json')]
ARQ.append((PLC + '/COMO_USAR.txt', 'plc/COMO_USAR_1200.txt'))
IP = re.compile(rb'\b(10|172\.(1[6-9]|2[0-9]|3[01])|192\.168)\.\d{1,3}\.\d{1,3}(\.\d{1,3})?\b')
def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    saida = os.path.abspath(sys.argv[1]); os.makedirs(saida, exist_ok=True)
    zp = os.path.join(saida, 'entrega_implantacao_bt2_v1.11.zip'); assert not os.path.exists(zp), 'ja existe: ' + zp
    itens = []
    for o, d in ARQ:
        p = os.path.join(RAIZ, o); assert os.path.exists(p), 'falta ' + o
        b = open(p, 'rb').read()
        if d.endswith(('.json', '.html', '.js', '.md', '.txt', '.scl', '.db', '.example')): assert not IP.search(b), 'IP real em ' + o
        itens.append((d, b))
    # catalogo de ferramentas GERADO a partir dos arquivos da pasta de desenvolvimento deste pacote (maior versao de cada ferramenta; nome sem versao)
    import importlib.util
    sp = importlib.util.spec_from_file_location('cat', os.path.join(RAIZ, 'dashboard', 'gerador', 'gerar_catalogo_auto_v0.2.1.py')); cat = importlib.util.module_from_spec(sp); sp.loader.exec_module(cat)
    dev = [d.split('/')[-1] for d, _ in itens if d.startswith('06_front_desenvolvimento/')]
    cj = cat.monta(open(os.path.join(cat.PASTA, cat.BASE), encoding='utf-8').read(), dev, 'pacote v1.11').encode('utf-8')
    itens.append(('06_front_desenvolvimento/catalogo_ferramentas.js', cj)); itens.append(('03_front_operacao/catalogo_ferramentas.js', cj))   # v1.9: o menu da operacao tambem precisa do catalogo
    man = ''.join('%s  %s\n' % (hashlib.sha256(b).hexdigest(), d) for d, b in sorted(itens))
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
        for d, b in itens: z.writestr('entrega_implantacao_bt2/' + d, b)
        z.writestr('entrega_implantacao_bt2/MANIFESTO.sha256', man)
    print('gerado', zp, len(itens), 'arquivos')
if __name__ == '__main__': main()
