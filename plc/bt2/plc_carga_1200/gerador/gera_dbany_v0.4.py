#!/usr/bin/env python3
"""v0.4 (09/11/2026): os FBs do banco recebem so o NUMERO do DB (DB_ANY) e tratam os campos por offset com PEEK/POKE DENTRO do bloco.
Escopo (decisao do Reginaldo): SOMENTE o uso de DB_ANY, no PLC de cargas. Logica (supervisao, travas, 2 s) NAO muda. 1515 nao muda. Nao sobrescreve. RASCUNHO, nao compilado.
PEEK/POKE leem o PEDIDO para um buffer local no inicio do ciclo e so escrevem a faixa da RESPOSTA (escritor unico)."""
import os, re
D = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
LAY = {16: dict(cmd=0, vida=2, lig=4, hab=6, seq=8, fbk=10, vidaET=12, sel=14, habR=16, eco=18, falha=20, col=22),
       32: dict(cmd=0, vida=4, lig=6, hab=8, seq=12, fbk=14, vidaET=18, sel=20, habR=22, eco=26, falha=28, col=32)}
def le(n): return open(os.path.join(D, n), encoding='utf-8').read()
def grava(n, t):
    p = os.path.join(D, n); assert not os.path.exists(p), n; open(p, 'w', encoding='utf-8').write(t); print('gerado', n)
def bits(var, ofs, N, ler):
    f = 'PEEK_BOOL' if ler else 'POKE_BOOL'
    if ler: lin = '#_com.%s[#_k] := PEEK_BOOL(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_%s + (#_k - 1) / 8, bitOffset := (#_k - 1) MOD 8);' % (var, ofs)
    else: lin = 'POKE_BOOL(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_%s + (#_k - 1) / 8, bitOffset := (#_k - 1) MOD 8, value := #_com.%s[#_k]);' % (ofs, var)
    return '   FOR #_k := 1 TO %d DO\n      %s\n   END_FOR;\n' % (N, lin)
def fb(N):
    t = le('fb_bancoCarga%d_v0.3.scl' % N); o = LAY[N]; Tipo = '"typeComBanco%d"' % N
    t = t.replace('TITLE = fb_bancoCarga%d v' % N, 'TITLE = fb_bancoCarga%d (DB_ANY) v' % N)
    t = re.sub(r'VERSION : [0-9.]+', 'VERSION : 0.4', t, 1)
    t = re.sub(r'.*Com +: "typeComBanco%d";\n' % N, '', t); t = re.sub(r'.*Compet +: "typeCompetenciaBanco";\n', '', t)
    t = t.replace('   VAR_INPUT\n', '   VAR_INPUT\n      DbCom              : DB_ANY;              // NUMERO do DB do telegrama rapido (ex.: DB3007). O bloco trata os campos por offset (PEEK/POKE)\n'
                  '      DbCompet           : DB_ANY;              // NUMERO do DB de competencia (ex.: DB3008)\n', 1)
    consts = ('   VAR CONSTANT\n      AREA_DB : Byte := 16#84;   // area "bloco de dados" para PEEK/POKE\n'
              + ''.join('      OFS_%s : UInt := %d;\n' % (k.upper(), v) for k, v in o.items()) + '   END_VAR\n')
    stat = ('      _com         : %s;                    // copia local do telegrama (PEDIDO lido do DB no inicio do ciclo; RESPOSTA escrita no DB no fim)\n'
            '      _compet      : "typeCompetenciaBanco";   // copia local da competencia (escrita no DB no fim)\n      _dbCom       : UInt;\n      _dbCmp       : UInt;\n      _k           : Int;\n      _w           : Word;\n   END_VAR\n') % Tipo
    t = t.replace('      i            : Int;\n   END_VAR\n', '      i            : Int;\n' + stat + consts, 1)
    t = t.replace('#Com.', '#_com.').replace('#Compet.', '#_compet.')
    ler = ('BEGIN\n   // 0) DB_ANY -> numero; DB invalido = nada liga (estado seguro)\n   #_dbCom := DB_ANY_TO_UINT(#DbCom);\n   #_dbCmp := DB_ANY_TO_UINT(#DbCompet);\n'
           '   IF #_dbCom = 0 OR #_dbCmp = 0 THEN\n      #ComOk := FALSE; #BancoLiberado := FALSE;\n      FOR #i := 1 TO %d DO #SaidaContatora[#i] := FALSE; END_FOR;\n      RETURN;\n   END_IF;\n\n'
           '   // 0b) LE O PEDIDO do DB (so leitura): cmd, vida1515, ligarBanco, habPed, seq\n' % N
           + bits('cmd', 'CMD', N, True) + bits('habPed', 'HAB', N, True) +
           '   #_com.vida1515 := WORD_TO_INT(PEEK_WORD(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_VIDA));\n'
           '   #_com.ligarBanco := PEEK_BOOL(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_LIG, bitOffset := 0);\n'
           '   #_com.seq := WORD_TO_INT(PEEK_WORD(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_SEQ));\n\n')
    t = t.replace('BEGIN\n', ler, 1)
    esc = ('\n   // 8) ESCREVE A RESPOSTA no DB (SO a faixa da RESPOSTA; o PEDIDO nunca e escrito aqui) e a competencia\n'
           + bits('fbk', 'FBK', N, False) + bits('habResp', 'HABR', N, False) + bits('falhaRetorno', 'FALHA', N, False) + bits('contatorColado', 'COL', N, False) +
           '   POKE_WORD(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_VIDAET, value := INT_TO_WORD(#_com.vidaET));\n'
           '   POKE_WORD(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_ECO, value := INT_TO_WORD(#_com.eco));\n'
           '   POKE_BOOL(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_SEL, bitOffset := 0, value := #_com.seletoraAuto);\n'
           '   POKE_BOOL(area := #AREA_DB, dbNumber := #_dbCmp, byteOffset := 0, bitOffset := 0, value := #_compet.bancoLiberado);\n'
           '   POKE_BOOL(area := #AREA_DB, dbNumber := #_dbCmp, byteOffset := 0, bitOffset := 1, value := #_compet.bancoLigadoFbk);\n'
           '   POKE_BOOL(area := #AREA_DB, dbNumber := #_dbCmp, byteOffset := 0, bitOffset := 2, value := #_compet.intertravamentoOk);\n'
           '   POKE_BOOL(area := #AREA_DB, dbNumber := #_dbCmp, byteOffset := 0, bitOffset := 3, value := #_compet.ventiladorOk);\n'
           '   POKE_WORD(area := #AREA_DB, dbNumber := #_dbCmp, byteOffset := 4, value := #_compet.alarmes);\n'
           '   POKE_WORD(area := #AREA_DB, dbNumber := #_dbCmp, byteOffset := 6, value := INT_TO_WORD(#_compet.vidaCompet));\n'
           'END_FUNCTION_BLOCK\n')
    t = t.replace('END_FUNCTION_BLOCK\n', esc)
    cab = '//// [v0.4 09/11/2026] DB_ANY: este bloco recebe SO o numero do DB (DbCom, DbCompet) e trata os campos por offset (PEEK/POKE) dentro. Logica igual a v0.3. NAO compilado: conferir nomes/parametros de PEEK/POKE no TIA. Offsets = tipos_ComBanco (ver verifica_offsets_dbany_v0.4.py).\n'
    grava('fb_bancoCarga%d_v0.4.scl' % N, cab + t)
def fc(src, dst):
    t = le(src)
    t, n = re.subn(r'Com := "(db\d+_\w+_Com)"\.com, Compet := "(db\d+_\w+_Competencia)"\.compet', r'DbCom := "\1", DbCompet := "\2"', t)
    assert n >= 1, src; grava(dst, '//// [v0.4 09/11/2026] chamadas passam so o NUMERO do DB (DB_ANY).\n' + t)
if __name__ == '__main__':
    fb(16); fb(32); fc('fc_chamadasBancosCarga_v0.3.scl', 'fc_chamadasBancosCarga_v0.4.scl'); fc('fc_chamadasBanco595_v0.3.scl', 'fc_chamadasBanco595_v0.4.scl')
