# -*- coding: utf-8 -*-
"""
catalogo_dse_v0.1.py  —  Catálogo de modelos de gerador a partir dos arquivos .dse

PARA QUE SERVE (leitura para equipes não técnicas)
  Os controladores DSE guardam a configuração de cada gerador num arquivo .dse
  (um texto XML). Este programa lê todos os .dse de uma pasta e monta uma tabela
  (CSV) com: kVA, kW, Hz, tensão, corrente nominal, etc. Essa tabela alimenta o
  seletor de modelo do card "Dados do ensaio" e o gerador virtual do Manual guiado.

REGRA DE OURO (regra 3 do projeto): NADA É PRESUMIDO.
  Cada coluna vem do XML (a tag é o que manda) ou do NOME do arquivo (colunas com
  sufixo _nome). Quando os dois discordam o programa só AVISA na coluna 'alerta';
  nunca corrige sozinho — quem decide é a engenharia.

COMO USAR
  python3 -I catalogo_dse_v0.1.py <pasta_com_os_zips_extraidos> <pasta_de_saida>

SAÍDAS
  catalogo_modelos_v0.1.csv         1 linha por .dse
  catalogo_outros_arquivos_v0.1.csv .pdf/.frt/.lnk/.txt (não são configuração)

MODULAR: cada função abaixo faz uma coisa só (ler nome, ler XML, checar, gravar).
"""
import csv
import os
import re
import sys
import xml.etree.ElementTree as ET

# ---------------------------------------------------------------------------
# 1) TAGS PROCURADAS NO XML
#    Cada família de controlador escreve o mesmo dado com um nome diferente
#    (ex.: kW_Rating no 4520, KWRating no 8620). Listamos todas as variantes
#    já vistas; se aparecer uma nova, é só acrescentar aqui (nada mais muda).
# ---------------------------------------------------------------------------
TAGS = {
    'V_fn_xml':   ['Nominal_Voltage'],           # ATENÇÃO: valor é FASE-NEUTRO
    'Hz_xml':     ['Nominal_Frequency'],
    'I_nom_A':    ['Full_Load_Rating', 'Gen_Full_Load_Rating', 'Generator_Full_Load_Rating'],
    'CT_prim_A':  ['CT_Primary'],
    'kW_xml':     ['kW_Rating', 'KWRating'],
    'kVAr_xml':   ['kVArRating', 'KVARRating'],
}


def numero(texto):
    """Extrai o primeiro número de um texto ('381V PhPh' -> 381.0). Vírgula vira ponto."""
    m = re.search(r'-?\d+(?:[.,]\d+)?', texto or '')
    return float(m.group(0).replace(',', '.')) if m else None


def achar_tag(raiz, nomes):
    """
    Procura a PRIMEIRA ocorrência (na ordem do documento) de qualquer tag de 'nomes'.
    Devolve (valor, comentario) ou None.
    Por quê o 'Comment': o ConfigSuite grava ali o valor já traduzido para o
    operador (ex.: valor 220 = fase-neutro, Comment '381V PhPh' = tensão de linha).
    """
    alvo = {n.lower() for n in nomes}
    for el in raiz.iter():
        if el.tag.lower() in alvo and (el.text or '').strip() != '':
            return el.text.strip(), el.attrib.get('Comment', '')
    return None


def bloco_principal(raiz):
    """
    O .dse tem várias configurações (principal + alternativas 1, 2, 3...).
    Só a PRINCIPAL vale para o ensaio normal; por isso procuramos primeiro o
    bloco 'Alternative_Config*Main' ou '*_0'. Se não achar, lê o documento todo.
    """
    for el in raiz.iter():
        t = el.tag.lower()
        if t.startswith('alternative_config') and ('main' in t or t.endswith('_0') or '_0_' in t):
            return el
    return raiz


def dados_do_nome(nome):
    """
    Lê do NOME do arquivo (ex.: 4520AMF_MWM_75KVA_60HZ_380V_12V.dse).
    Marcado como 'nome' no CSV: é uma convenção de quem salvou o arquivo,
    NÃO uma medição — por isso é conferida contra o XML mais adiante.
    """
    partes = re.split(r'[_ ]+', nome)
    kva = re.search(r'(\d+(?:[.,]\d+)?)\s*KVA\w*', nome, re.I)
    hz = re.search(r'(\d{2})\s*HZ', nome, re.I)
    return {
        'kVA_nome': kva.group(1).replace(',', '.') if kva else '',
        'Hz_nome': hz.group(1) if hz else '',
        # 3 dígitos + V = tensão da rede; 2 dígitos + V = bateria (12 V / 24 V)
        'V_nome': next((p[:-1] for p in partes if re.fullmatch(r'\d{3}V', p, re.I)), ''),
        'V_bateria_nome': next((p[:-1] for p in partes if re.fullmatch(r'\d{2}V', p, re.I)), ''),
    }


def conferir(r):
    """
    Compara nome × XML e devolve avisos. NUNCA altera valores.
    kW/kVA fora de 0,7–0,9 é só um sinal de atenção (fator de potência usual
    de gerador é 0,8) — não é critério de aprovação.
    """
    av = []
    try:
        if r['Hz_nome'] and r['Hz_xml'] != '' and abs(float(r['Hz_nome']) - r['Hz_xml']) > 0.5:
            av.append('Hz nome≠xml')
        if r['V_nome'] and r['V_ff_comentario'] != '' and abs(float(r['V_nome']) - r['V_ff_comentario']) > 12:
            av.append('V nome≠xml(PhPh)')
        if r['kVA_nome'] and r['kW_xml'] != '':
            q = r['kW_xml'] / float(r['kVA_nome'])
            if not 0.7 <= q <= 0.9:
                av.append('kW/kVA=%.2f fora de 0,7–0,9' % q)
    except (ValueError, ZeroDivisionError):
        pass
    if r['kW_xml'] == '':
        av.append('sem kW no XML')
    return '; '.join(av)


def ler_dse(caminho_abs, rel):
    """Lê um .dse e devolve um dicionário (uma linha do CSV)."""
    nome = os.path.basename(caminho_abs)
    r = {'familia_zip': rel.split(os.sep)[0], 'caminho': rel, 'arquivo': nome,
         'pasta_modelo': os.path.basename(os.path.dirname(caminho_abs))}
    r.update(dados_do_nome(nome[:-4]))
    try:
        raiz = ET.parse(caminho_abs).getroot()
    except ET.ParseError as e:                       # arquivo corrompido não derruba o lote
        r['alerta'] = 'XML ilegível: %s' % e
        return r
    cfg = raiz.find('ConfigurationFile')
    r['ctrl_codigo'] = raiz.attrib.get('ModuleTypeCode') or (cfg.attrib.get('ModuleTypeCode', '') if cfg is not None else '')
    d, s = raiz.find('.//Header/Description'), raiz.find('.//Header/Saved_on')
    r['ctrl_descricao'] = (d.text or '').strip() if d is not None else ''
    r['salvo_em'] = (s.text or '').strip() if s is not None else ''
    blk = bloco_principal(raiz)
    r['bloco_lido'] = blk.tag if blk is not raiz else '(documento)'
    for coluna, tags in TAGS.items():
        a = achar_tag(blk, tags) or achar_tag(raiz, tags)   # 2ª tentativa: documento todo
        r[coluna] = numero(a[0]) if a else ''
        if coluna == 'V_fn_xml':
            r['V_ff_comentario'] = numero(a[1]) if a else ''   # tensão de LINHA (o que o operador vê)
    r['alerta'] = conferir(r)
    return r


COLUNAS = ['familia_zip', 'pasta_modelo', 'arquivo', 'ctrl_codigo', 'ctrl_descricao',
           'kVA_nome', 'Hz_nome', 'V_nome', 'V_bateria_nome', 'V_fn_xml', 'V_ff_comentario',
           'Hz_xml', 'I_nom_A', 'CT_prim_A', 'kW_xml', 'kVAr_xml', 'salvo_em', 'bloco_lido',
           'alerta', 'caminho']


def principal(raiz_dir, saida):
    """Percorre as pastas, lê cada .dse e grava os dois CSVs."""
    linhas, outros = [], []
    for dp, _, arqs in os.walk(raiz_dir):
        for f in sorted(arqs):
            p = os.path.join(dp, f)
            rel = os.path.relpath(p, raiz_dir)
            if f.lower().endswith('.dse'):
                linhas.append(ler_dse(p, rel))
            else:                                    # PDF/frt/lnk: só listamos, não são modelo
                outros.append([rel.split(os.sep)[0], rel, os.path.splitext(f)[1].lstrip('.').lower(), os.path.getsize(p)])
    # utf-8-sig + ';' = abre direto no Excel em português
    with open(os.path.join(saida, 'catalogo_modelos_v0.1.csv'), 'w', newline='', encoding='utf-8-sig') as fh:
        w = csv.DictWriter(fh, fieldnames=COLUNAS, delimiter=';', extrasaction='ignore')
        w.writeheader()
        w.writerows(linhas)
    with open(os.path.join(saida, 'catalogo_outros_arquivos_v0.1.csv'), 'w', newline='', encoding='utf-8-sig') as fh:
        w = csv.writer(fh, delimiter=';')
        w.writerow(['familia_zip', 'caminho', 'extensao', 'bytes'])
        w.writerows(outros)
    print('modelos:', len(linhas), '| com alerta:', sum(1 for x in linhas if x.get('alerta')))


if __name__ == '__main__':
    principal(sys.argv[1], sys.argv[2])
