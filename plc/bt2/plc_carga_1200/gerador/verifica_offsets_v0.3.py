#!/usr/bin/env python3
"""Verifica (sem TIA) se os offsets dos tipos/DBs gerados batem com o que o FB101 v0.8 do 1515 espera e com o plano. v0.1 (09/11/2026).
PROVA: consistencia de offsets e tamanhos entre os arquivos gerados. NAO PROVA: compilacao no TIA, deslocamentos reais do TIA (conferir na coluna 'Deslocamento'), comportamento do PLC.
Regras de layout usadas (DB nao otimizado, S7-1200): Array[1..n] of Bool = ceil(n/8) bytes a partir de um byte; Bool solto ocupa um bit (bools seguidos dividem o byte);
Int/Word comecam em byte par; Byte em qualquer byte; Real em byte par."""
import os, re, sys
D = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))


def layout(campos):
    """campos: lista (nome, tipo, n). Devolve {nome: (byte, bit)} e o tamanho total."""
    byte, bit, out = 0, 0, {}
    for nome, tp, n in campos:
        if tp == 'Bool' and n == 1:
            out[nome] = (byte, bit); bit += 1
            if bit == 8: byte += 1; bit = 0
            continue
        if bit: byte += 1; bit = 0
        if tp in ('Int', 'Word', 'Real') and byte % 2: byte += 1
        out[nome] = (byte, 0)
        byte += (-(-n // 8)) if tp == 'Bool' else n * {'Int': 2, 'Word': 2, 'Real': 4, 'Byte': 1}[tp]
    if bit: byte += 1
    return out, byte


def le_campos(texto, tipo):
    m = re.search(r'TYPE "%s".*?STRUCT(.*?)END_STRUCT' % tipo, texto, re.S)
    campos = []
    for l in m.group(1).split('\n'):
        l = l.split('//')[0].strip()
        mm = re.match(r'(\w+)\s*:\s*(Array\[1\.\.(\d+)\] of (\w+)|(\w+));', l)
        if not mm: continue
        if mm.group(3): campos.append((mm.group(1), mm.group(4), int(mm.group(3))))
        else: campos.append((mm.group(1), mm.group(5), 1))
    return campos


def main():
    erros = []
    tipos = open(os.path.join(D, 'tipos_ComBanco_v0.3.scl'), encoding='utf-8').read()
    com, tam = layout(le_campos(tipos, 'typeComBanco16'))
    esperado = {'cmd': 0, 'vida1515': 2, 'ligarBanco': 4, 'habPed': 6, 'seq': 8, 'fbk': 10, 'vidaET': 12, 'seletoraAuto': 14, 'habResp': 16, 'eco': 18, 'falhaRetorno': 20, 'contatorColado': 22}
    for k, v in esperado.items():
        if com[k][0] != v: erros.append('typeComBanco16.%s esperado byte %d, calculado %d' % (k, v, com[k][0]))
    if tam != 24: erros.append('typeComBanco16 deveria ter 24 bytes, tem %d' % tam)
    put_len, get_len = com['fbk'][0], tam - com['fbk'][0]
    if (put_len, get_len) != (10, 14): erros.append('PUT/GET deveriam ser 10/14 bytes (FB101 v0.8), sao %d/%d' % (put_len, get_len))
    cp, tamc = layout(le_campos(tipos, 'typeCompetenciaBanco'))
    if (cp['reservaW2'][0], cp['alarmes'][0], cp['vidaCompet'][0], tamc) != (2, 4, 6, 8): erros.append('typeCompetenciaBanco fora do esperado: %s tam %d' % (cp, tamc))
    esp, _ = layout([('res', 'Byte', 4), ('habilitada', 'Bool', 16), ('setupOk', 'Bool', 16), ('kwReal', 'Real', 16), ('rMedidoOhm', 'Real', 16), ('rTeoricoOhm', 'Real', 16)])
    for k, v in {'habilitada': 4, 'setupOk': 6, 'kwReal': 8, 'rMedidoOhm': 72, 'rTeoricoOhm': 136}.items():
        if esp[k][0] != v: erros.append('espelho.%s esperado byte %d, calculado %d' % (k, v, esp[k][0]))
    if esp['rTeoricoOhm'][0] + 64 - 4 != 196: erros.append('espelho nao fecha 196 bytes (bytes 4..199)')
    # chamadas do 1515 x DBs gerados
    dbs = open(os.path.join(D, 'dbs_Banco_v0.1.scl'), encoding='utf-8').read()
    ch = open(os.path.join(D, 'chamadas_1515_PUTGET_para_1200_v0.1.scl'), encoding='utf-8').read()
    for base in (3000, 3100, 3300):
        for numero in (base, base + 7, base + 8):
            if 'DATA_BLOCK "db%d_' % numero not in dbs: erros.append('DB%d nao esta em dbs_Banco' % numero)
        for trecho in ('P#DB%d.DBX0.0 BYTE 10' % (base + 7), 'P#DB%d.DBX10.0 BYTE 14' % (base + 7), 'P#DB%d.DBX4.0 BYTE 196' % base, 'P#DB%d.DBX0.0 BYTE 8' % (base + 8)):
            if trecho not in ch: erros.append('chamada do 1515 sem ' + trecho)
    # o FB101 v0.8 do repositorio usa os mesmos tamanhos?
    fb101 = open(os.path.join(D, '..', 'comunicacao_et200', 'fb101_ComEt200_v0.8.scl'), encoding='utf-8').read()
    if 'BYTE 10' not in fb101 or 'BYTE 14' not in fb101: erros.append('FB101 v0.8 nao cita BYTE 10/14 (conferir a mao)')
    if erros:
        print('FALHOU:'); [print(' -', e) for e in erros]; sys.exit(1)
    print('OK: typeComBanco16 = 24 B (PUT 10 / GET 14, igual ao FB101 v0.8); competencia = 8 B; espelho = bytes 4..199 (196 B); DBs e chamadas coerentes (BC56, BC400, BC550).')


if __name__ == '__main__':
    main()
