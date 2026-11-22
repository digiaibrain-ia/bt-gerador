#!/usr/bin/env python3
"""Etapas 2 e 3 (BC550 e BC59,5) - lado do 1515: DBs v0.3 (com sbRet), FB103 v0.3 (32 chaves, pedido/resposta) e chamadas v0.3. v0.1 (09/11/2026) RASCUNHO, nao compilado.
Nao sobrescreve. Os remotos apontam para o PLC DE CARGAS (1200): DB3307 (BC550) e DB3207 (BC59,5). Uso: python3 plc/bt2/gerador/gerar_etapas23_1515_v0.1.py"""
import os, re
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
BC = os.path.join(RAIZ, 'plc', 'bt2', 'bancos_cargas')
ET = os.path.join(RAIZ, 'plc', 'bt2', 'comunicacao_et200')


def grava(p, t):
    assert not os.path.exists(p), 'ja existe (nao sobrescrevo): ' + p
    open(p, 'w', encoding='utf-8').write(t); print('gerado', os.path.relpath(p, RAIZ))


def db_v03(nome, n, base, x):   # x = offsets (habResp, falha, colado, eco)
    t = open(os.path.join(BC, nome + '_v0.2.db'), encoding='utf-8').read()
    t = t.replace('TITLE = %s v0.2' % nome, 'TITLE = %s v0.3' % nome).replace('VERSION : 0.2', 'VERSION : 0.3', 1)
    nota = ('//// v0.3 (09/11/2026, Fase 4 / Etapas 2 e 3, RASCUNHO): so ACRESCENTA a struct sbRet no fim (X%d.0..X%d.0), IGUAL ao BC56/BC400 v0.3. Nenhum offset existente muda.\n'
            '////      Escritor unico: FB101 v0.8 / FB103 v0.3. CONFERIR os offsets no TIA.\n' % (x[0], x[3]))
    t = t.replace('////====================================\n//// ' + nome, '////====================================\n' + nota + '//// ' + nome, 1) if ('//// ' + nome) in t else t
    sb = ('\n      sbRet : Struct   // v0.3: resposta do PLC do banco. Escritor unico: FB de comunicacao. CONFERIR offsets no TIA (esperado DBX%d.0)\n'
          '         habResp        : Array[1..%d] of Bool;   // X%d.0 habilitacao confirmada pelo PLC do banco (pedido = setup.habilitada)\n'
          '         falhaRetorno   : Array[1..%d] of Bool;   // X%d.0 sem retorno (SB) por T = 2 s, TRAVADA ate novo comando\n'
          '         contatorColado : Array[1..%d] of Bool;   // X%d.0 contator colado (SB=1 sem comando), TRAVADO\n'
          '         respEcoOk      : Bool;                   // X%d.0 eco do PLC do banco acompanha o seq (resposta fresca)\n'
          '      END_STRUCT;\n' % (x[0], n, x[0], n, x[1], n, x[2], x[3]))
    assert t.count('   END_VAR') == 1
    t = t.replace('   END_VAR', sb + '   END_VAR', 1)
    grava(os.path.join(BC, nome + '_v0.3.db'), t)


def fb103():
    t = open(os.path.join(ET, 'fb101_ComEt200_v0.8.scl'), encoding='utf-8').read()
    t = t.replace('FUNCTION_BLOCK "fb101_ComEt200"', 'FUNCTION_BLOCK "fb103_ComEt200_32"').replace('TITLE = fb101_ComEt200 v0.8 (FB101)', 'TITLE = fb103_ComEt200_32 v0.3 (FB103)').replace('VERSION : 0.8', 'VERSION : 0.3', 1)
    t = t.replace('Array[1..16]', 'Array[1..32]').replace('1 TO 16', '1 TO 32')
    cab = ('////=====================================\n'
           '//// fb103_ComEt200_32 v0.3 (09/11/2026, Fase 4 / Etapa 3) - RASCUNHO, nao compilado. PORTE do FB101 v0.8 para 32 chaves (BC59,5 tem 18). MESMA LOGICA (pedido/resposta, seq/eco,\n'
           '////   habilitar com confirmacao, falha travada e CiclosGraca). Muda so o tamanho: PEDIDO 14 bytes (PUT) e RESPOSTA 22 bytes (GET), total 36 no DB remoto.\n'
           '////   PEDIDO : cmd[1..32] X0.0..3.7 | vida1515 W4 | ligarBanco X6.0 | reserva B7 | habPed[1..32] X8.0..11.7 | seq W12.\n'
           '////   RESPOSTA: fbk[1..32] X14.0..17.7 | vidaET W18 | seletoraAuto X20.0 | reserva B21 | habResp X22.0..25.7 | eco W26 | falhaRetorno X28.0..31.7 | contatorColado X32.0..35.7.\n'
           '////   RemotoCmd = P#DBn.DBX0.0 BYTE 14 ; RemotoFb = P#DBn.DBX14.0 BYTE 22. Remoto = DB3207 no PLC de cargas (1200). Substitui o fb103 v0.2 (telegrama de 16 bytes) so apos o OK de carga.\n')
    t = t.replace('////=====================================\n', cab, 1)
    # structs tx/rx no layout de 32
    tx = re.search(r'      tx : Struct.*?END_STRUCT;\n', t, re.S).group(0)
    rx = re.search(r'      rx : Struct.*?END_STRUCT;\n', t, re.S).group(0)
    t = t.replace(tx, ('      tx : Struct   // 1515 -> PLC de cargas, 14 bytes (PEDIDO)\n         cmd : Array[1..32] of Bool;   // DBX0.0..3.7 remoto\n         vida : Int;   // DBW4 remoto\n'
                       '         ligarBanco : Bool;   // DBX6.0 remoto\n         reserva : Byte;   // DBB7\n         habPed : Array[1..32] of Bool;   // DBX8.0..11.7 remoto\n         seq : Int;   // DBW12 remoto\n      END_STRUCT;\n'))
    t = t.replace(rx, ('      rx : Struct   // PLC de cargas -> 1515, 22 bytes (RESPOSTA)\n         fbk : Array[1..32] of Bool;   // DBX14.0..17.7 remoto\n         vida : Int;   // DBW18 remoto\n'
                       '         seletoraAuto : Bool;   // DBX20.0 remoto\n         reserva : Byte;   // DBB21\n         habResp : Array[1..32] of Bool;   // DBX22.0..25.7 remoto\n         eco : Int;   // DBW26 remoto\n'
                       '         falhaRetorno : Array[1..32] of Bool;   // DBX28.0..31.7 remoto\n         contatorColado : Array[1..32] of Bool;   // DBX32.0..35.7 remoto\n      END_STRUCT;\n'))
    t = t.replace('BC56: P#DB38.DBX0.0 BYTE 10', 'BC59,5: P#DB3207.DBX0.0 BYTE 14').replace('BC56: P#DB38.DBX10.0 BYTE 14', 'BC59,5: P#DB3207.DBX14.0 BYTE 22')
    grava(os.path.join(ET, 'fb103_ComEt200_32_v0.3.scl'), t)


def chamadas(nome, n, base, fb, rem_db, ET_NOME):
    t = open(os.path.join(BC, nome + '_v0.2.scl'), encoding='utf-8').read()
    m = re.search(r'"db%di_%s_ComEt200"\(.*?\);\n' % (base + 5, ET_NOME), t, re.S)
    assert m, 'chamada ComEt200 nao encontrada em ' + nome
    db = 'db%d_%s_Chaves' % (base, ET_NOME)
    nova = ('"db%di_%s_ComEt200"(Hab := TRUE, ID_Conexao := W#16#0,   // A PREENCHER: ID da conexao S7 com o PLC de cargas (1200)\n'
            '    RemotoCmd := P#DB%d.DBX0.0 BYTE %d, RemotoFb := P#DB%d.DBX%d.0 BYTE %d,   // v0.3: PEDIDO / RESPOSTA no DB%d do PLC de cargas\n'
            '    ComOk => "%s".sbBanco.comEt200Ok, SeletoraAuto => "%s".sbBanco.seletoraAuto, RespEcoOk => "%s".sbRet.respEcoOk,\n'
            '    CbLigar := "%s".cb.ligar, SbLigada := "%s".sb.ligada, LigarBanco := "%s".cbBanco.ligar,\n'
            '    HabilitadaPed := "%s".setup.habilitada, HabResp := "%s".sbRet.habResp,\n'
            '    FalhaRetorno := "%s".sbRet.falhaRetorno, ContatorColado := "%s".sbRet.contatorColado);\n'
            % ((base + 5, ET_NOME, rem_db) + ((10, rem_db, 10, 14, rem_db) if n == 16 else (14, rem_db, 14, 22, rem_db)) + (db,) * 10))
    t = t.replace(m.group(0), nova)
    t = t.replace('FB: fb101_ComEt200', 'FB: ' + fb)
    t = ('// [v0.3 09/11/2026, Fase 4 / Etapa %d, RASCUNHO: chamada do %s v0.%s com pedido/resposta, apontando para o PLC de cargas 1200; resto igual a v0.2. Nao compilado.]\n' % (2 if n == 16 else 3, 'FB101' if n == 16 else 'FB103', '8' if n == 16 else '3')) + t
    grava(os.path.join(BC, nome + '_v0.3.scl'), t)


if __name__ == '__main__':
    db_v03('db3300_BC550_Chaves', 16, 3300, (464, 466, 468, 470))
    db_v03('db3200_BC595_Chaves', 32, 3200, (920, 924, 928, 932))
    fb103()
    chamadas('chamadas_BC550', 16, 3300, 'fb101_ComEt200 v0.8', 3307, 'BC550')
    chamadas('chamadas_BC595', 32, 3200, 'fb103_ComEt200_32 v0.3', 3207, 'BC595')
