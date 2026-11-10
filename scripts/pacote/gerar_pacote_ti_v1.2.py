#!/usr/bin/env python3
"""Gera o pacote da TI v1.2 (zip + MANIFESTO.sha256) FORA do Git. Nao contem IP/senha/token: confere isso antes de gravar.
Uso: python3 scripts/pacote/gerar_pacote_ti_v1.2.py <pasta_de_saida>   (nao sobrescreve)"""
import hashlib, os, re, sys, zipfile
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FL = 'nodered/flows/bt2/'
ARQ = [(FL + n + '.json', '01_fluxos_importar/' + n + '.json') for n in (
    'chaves-56-api-v3.5', 'chaves-400-api-v3.5', 'chaves-550-api-v1.6', 'chaves-595-api-v1.6', 'registro-ensaio-db2100-api-v1.8', 'dev-logs-api-v1.3',
    'cliente-156-dse-plc-carga-v3', 'cliente-31-seletor-plc-db2000-v4', 'servidor-deepsea-api-gerador-v3_7')]
ARQ += [(FL + 'simulador-dse-demo-v7.json', '02_somente_bancada/simulador-dse-demo-v7.json'),
        ('dashboard/ferramentas/medidor_gerador_v1.10.191.html', '03_front/medidor_gerador_v1.10.191.html'),
        ('dashboard/ferramentas/catalogo_ferramentas_v0.7.js', '03_front/catalogo_ferramentas_v0.7.js'),
        ('dashboard/modulos-fonte/menu_dev_v0.2.js', '03_front/menu_dev_v0.2.js'),
        ('config/pc-bt2.env.example', '04_config/pc-bt2.env.example')]
for d in ('IMPLANTACAO_ROTEIRO_v0.8.md', 'CHECKLIST_BANCADA_v0.5.md', 'HANDOFF_TI_v0.4.md'): ARQ.append(('docs/bt2/migracao/' + d, '05_documentos/' + d))
ARQ += [('docs/bt2/ANALISE_CONCLUSAO_2026-11-10.md', '05_documentos/ANALISE_CONCLUSAO_2026-11-10.md'), ('BACKLOG_FORA_DE_ESCOPO.md', '05_documentos/BACKLOG_FORA_DE_ESCOPO.md'),
        ('docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx', '05_documentos/PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx'),
        ('docs/bt2/migracao/LEIA-ME_ENTREGA_TI_v1.2.txt', 'LEIA-ME_PRIMEIRO.txt')]
EXT = ('.scl', '.db')
PLC = 'plc/bt2/entrega_1200_v0.8'
for sub in ('PLC_1515', 'PLC_CARGA_1200'):
    for n in sorted(os.listdir(os.path.join(RAIZ, PLC, sub))):
        if n.endswith(EXT): ARQ.append(('%s/%s/%s' % (PLC, sub, n), 'plc/%s/%s' % (sub, n)))
IP = re.compile(rb'\b(10|172\.(1[6-9]|2[0-9]|3[01])|192\.168)\.\d{1,3}\.\d{1,3}(\.\d{1,3})?\b')
def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    saida = os.path.abspath(sys.argv[1]); os.makedirs(saida, exist_ok=True)
    zp = os.path.join(saida, 'entrega_ti_bt2_v1.2.zip'); assert not os.path.exists(zp), 'ja existe: ' + zp
    itens = []
    for o, d in ARQ:
        p = os.path.join(RAIZ, o); assert os.path.exists(p), 'falta ' + o
        b = open(p, 'rb').read()
        if d.endswith(('.json', '.html', '.js', '.md', '.txt', '.scl', '.db', '.example')): assert not IP.search(b), 'IP real em ' + o
        itens.append((d, b))
    man = ''.join('%s  %s\n' % (hashlib.sha256(b).hexdigest(), d) for d, b in sorted(itens))
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
        for d, b in itens: z.writestr('entrega_ti_bt2/' + d, b)
        z.writestr('entrega_ti_bt2/MANIFESTO.sha256', man)
    print('gerado', zp, len(itens), 'arquivos')
if __name__ == '__main__': main()
