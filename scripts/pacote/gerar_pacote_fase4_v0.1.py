#!/usr/bin/env python3
"""Gera o pacote de entrega da Fase 4 (zip + MANIFESTO.sha256) FORA do Git.
Uso:  python3 scripts/pacote/gerar_pacote_fase4_v0.1.py <pasta_de_saida> [--ip-plc 1.2.3.4]
 - entrega_fase4_bt2_v0.1.zip : fluxos v3.5 (com ${PLC_IP}), medidor 1.10.172, PLC (rascunhos), documentos, manifesto.
 - json_PC_BT2_fase4_com_IP.zip: SO se --ip-plc for dado (ou variavel PLC_IP_PC): fluxos "-PC.json" com o IP escrito. NUNCA vai para o Git nem fica em public.
O IP real nunca e escrito neste script nem no repositorio: vem da linha de comando.
"""
import hashlib, json, os, shutil, sys, zipfile

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FLOWS = os.path.join(RAIZ, 'nodered', 'flows', 'bt2')
FERR = os.path.join(RAIZ, 'dashboard', 'ferramentas')
PLC = os.path.join(RAIZ, 'plc', 'bt2')
DOC4 = os.path.join(RAIZ, 'docs', 'bt2', 'fase4')

ARQ = [  # (origem relativa a RAIZ, destino dentro do pacote)
    ('nodered/flows/bt2/chaves-56-api-v3.5.json', '01_fluxos_importar/chaves-56-api-v3.5.json'),
    ('nodered/flows/bt2/chaves-400-api-v3.5.json', '01_fluxos_importar/chaves-400-api-v3.5.json'),
    ('dashboard/ferramentas/medidor_gerador_v1.10.172.html', '03_front/medidor_gerador_v1.10.172.html'),
    ('dashboard/ferramentas/catalogo_ferramentas_v0.7.js', '03_front/catalogo_ferramentas_v0.7.js'),
    # PLC - ET200 / banco (rascunhos, nao compilados)
    ('plc/bt2/comunicacao_et200/db38_db39_ComEt200_v0.4.scl', 'plc/01_ET200_banco/db38_db39_ComEt200_v0.4.scl'),
    ('plc/bt2/comunicacao_et200/fb_supervisaoChaves16_v0.1.scl', 'plc/01_ET200_banco/fb_supervisaoChaves16_v0.1.scl'),
    ('plc/bt2/comunicacao_et200/fb_bancoEt200_16_v0.3.scl', 'plc/01_ET200_banco/fb_bancoEt200_16_v0.3.scl'),
    ('plc/bt2/comunicacao_et200/chamadas_ET200_BC56_BC400_v0.1.scl', 'plc/01_ET200_banco/chamadas_ET200_BC56_BC400_v0.1.scl'),
    # PLC - 1515
    ('plc/bt2/comunicacao_et200/fb101_ComEt200_v0.8.scl', 'plc/02_1515/fb101_ComEt200_v0.8.scl'),
    ('plc/bt2/bancos_cargas/db3000_BC56_Chaves_v0.3.db', 'plc/02_1515/db3000_BC56_Chaves_v0.3.db'),
    ('plc/bt2/bancos_cargas/db3100_BC400_Chaves_v0.3.db', 'plc/02_1515/db3100_BC400_Chaves_v0.3.db'),
    ('plc/bt2/bancos_cargas/chamadas_BC56_v0.3.scl', 'plc/02_1515/chamadas_BC56_v0.3.scl'),
    ('plc/bt2/bancos_cargas/chamadas_BC400_v0.3.scl', 'plc/02_1515/chamadas_BC400_v0.3.scl'),
    # documentos
    ('docs/bt2/fase4/ROTEIRO_ATUALIZACAO_FASE4_v0.1.md', '05_documentos/ROTEIRO_ATUALIZACAO_FASE4_v0.1.md'),
    ('docs/bt2/fase4/CHECKLIST_BANCADA_v0.2.md', '05_documentos/CHECKLIST_BANCADA_v0.2.md'),
    ('docs/bt2/fase4/PLANO_FASE4_v0.2.md', '05_documentos/PLANO_FASE4_v0.2.md'),
    ('docs/bt2/fase4/A0_A1_COMUNICACAO_E_BLOCOS_v0.1.md', '05_documentos/A0_A1_COMUNICACAO_E_BLOCOS_v0.1.md'),
    ('docs/bt2/fase4/RELATORIO_PORTAO_A_v0.1.md', '05_documentos/RELATORIO_PORTAO_A_v0.1.md'),
    ('docs/bt2/fase4/RELATORIO_PORTAO_B_v0.1.md', '05_documentos/RELATORIO_PORTAO_B_v0.1.md'),
    ('docs/bt2/fase4/RELATORIO_PORTAO_C_v0.1.md', '05_documentos/RELATORIO_PORTAO_C_v0.1.md'),
    ('docs/bt2/fase4/RELATORIO_PORTAO_D_v0.1.md', '05_documentos/RELATORIO_PORTAO_D_v0.1.md'),
    ('docs/bt2/fase4/RELATORIO_SETUP_CHAVEAMENTO_AUTO_v0.1.md', '05_documentos/RELATORIO_SETUP_CHAVEAMENTO_AUTO_v0.1.md'),
    ('docs/bt2/fase4/PLANO_1200_DB26_v0.3.md', '05_documentos/PLANO_1200_DB26_v0.3.md'),
    ('BACKLOG_FORA_DE_ESCOPO.md', '05_documentos/BACKLOG_FORA_DE_ESCOPO.md'),
    ('docs/bt2/fase4/LEIA-ME_ENTREGA_FASE4_v0.1.txt', 'LEIA-ME_PRIMEIRO.txt'),
]


def sha(b):
    return hashlib.sha256(b).hexdigest()


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args:
        sys.exit(__doc__)
    saida = os.path.abspath(args[0]); os.makedirs(saida, exist_ok=True)
    ip = os.environ.get('PLC_IP_PC')
    if '--ip-plc' in sys.argv:
        ip = sys.argv[sys.argv.index('--ip-plc') + 1]
    # ---- pacote principal
    pasta = 'entrega_fase4_bt2'
    itens = []
    for orig, dest in ARQ:
        p = os.path.join(RAIZ, orig)
        assert os.path.exists(p), 'falta ' + orig
        itens.append((dest, open(p, 'rb').read()))
    man = ''.join('%s  %s\n' % (sha(b), d) for d, b in sorted(itens))
    zp = os.path.join(saida, 'entrega_fase4_bt2_v0.1.zip')
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
        for d, b in itens:
            z.writestr(pasta + '/' + d, b)
        z.writestr(pasta + '/MANIFESTO.sha256', man)
    print('gerado:', zp, len(itens), 'arquivos')
    # ---- pacote do PC com IP (fora do Git)
    if ip:
        zpc = os.path.join(saida, 'json_PC_BT2_fase4_com_IP.zip')
        with zipfile.ZipFile(zpc, 'w', zipfile.ZIP_DEFLATED) as z:
            for n in ('chaves-56-api-v3.5', 'chaves-400-api-v3.5'):
                t = open(os.path.join(FLOWS, n + '.json'), encoding='utf-8').read()
                assert '${PLC_IP}' in t, 'esperava ${PLC_IP} em ' + n
                z.writestr('PC_BT2/' + n + '-PC.json', t.replace('${PLC_IP}', ip))
            z.writestr('LEIA-ME.txt', 'Fluxos com o IP do PLC 1515 ja escrito (nao usam a variavel PLC_IP). SO para o PC BT2. NUNCA colocar no Git nem em public.\nImporte uma aba por vez, DEPOIS de o PLC estar carregado com os DBs v0.3 (ver ROTEIRO_ATUALIZACAO_FASE4_v0.1.md).\n')
        print('gerado:', zpc, '(contem IP: nao versionar)')
    else:
        print('sem --ip-plc: pacote do PC (-PC.json) NAO gerado')


if __name__ == '__main__':
    main()
