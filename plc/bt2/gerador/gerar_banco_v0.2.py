#!/usr/bin/env python3
"""Gerador de blocos de um banco de carga do BT2 (v0.1, 03/11/2026).
Uso: python3 gerar_banco_v0.2.py <id> [pasta_saida]
Escolhe o tamanho N do banco pelo numero de chaves: <=16 -> N=16 (FB100/FB101), <=32 -> N=32 (FB102/FB103).
Gera: fluxo Node-RED, texto de offsets e chamadas. Os DBs .db dos bancos novos ja foram gerados na mao;
este script e a fonte unica para os proximos e para conferir offsets (modo --offsets)."""
import json, sys, os, re
AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..', '..'))

def tamanho(k):
    if k <= 16: return 16
    if k <= 32: return 32
    raise SystemExit('banco com %d chaves: acima de 32, criar FB maior' % k)

def offs(N):
    nb = N // 8
    o = dict(cb=0, sb=nb, hab=2*nb, setupOk=3*nb, kwReal=4*nb)
    o['rMed'] = o['kwReal'] + 4*N; o['rTeo'] = o['rMed'] + 4*N; o['setupData'] = o['rTeo'] + 4*N
    o['nominal'] = o['setupData'] + 12*N; o['chaveSel'] = o['nominal'] + 4*N
    o['salvar'] = o['chaveSel'] + 2; o['cbBanco'] = o['salvar'] + 2; o['sbBanco'] = o['cbBanco'] + 2
    p = 3*N
    t = dict(kwReal=6); t['rMed'] = 6 + 4*p; t['vMed'] = 6 + 8*p; t['base'] = 6 + 12*p
    t['setupData'] = 6 + 16*p; t['setupOk'] = t['setupData'] + 12*p; t['tensaoSel'] = t['setupOk'] + p // 8
    return o, t

def vartables(N, dbc, dbv):
    o, t = offs(N); nb = N // 8; v = []
    for nome, base in (('CbLigar', o['cb']), ('Ligada', o['sb']), ('Habilitada', o['hab']), ('SetupOk', o['setupOk'])):
        for i in range(1, N+1):
            v.append({'name': '%s%d' % (nome, i), 'addr': 'DB%d,X%d.%d' % (dbc, base + (i-1)//8, (i-1) % 8)})
    v += [{'name': 'KwReal', 'addr': 'DB%d,REAL%d.%d' % (dbc, o['kwReal'], N)},
          {'name': 'RmedidoOhm', 'addr': 'DB%d,REAL%d.%d' % (dbc, o['rMed'], N)},
          {'name': 'RteoricoOhm', 'addr': 'DB%d,REAL%d.%d' % (dbc, o['rTeo'], N)},
          {'name': 'Nominal', 'addr': 'DB%d,REAL%d.%d' % (dbc, o['nominal'], N)},
          {'name': 'SetupData', 'addr': 'DB%d,BYTE%d.%d' % (dbc, o['setupData'], 12*N)},
          {'name': 'ChaveSel', 'addr': 'DB%d,INT%d' % (dbc, o['chaveSel'])},
          {'name': 'Salvar', 'addr': 'DB%d,X%d.0' % (dbc, o['salvar'])},
          {'name': 'UsarKwReal', 'addr': 'DB%d,X%d.1' % (dbc, o['salvar'])},
          {'name': 'LigarBanco', 'addr': 'DB%d,X%d.0' % (dbc, o['cbBanco'])},
          {'name': 'SeletoraAuto', 'addr': 'DB%d,X%d.0' % (dbc, o['sbBanco'])},
          {'name': 'ComEt200Ok', 'addr': 'DB%d,X%d.1' % (dbc, o['sbBanco'])}]
    w = [{'name': 'TensaoSel', 'addr': 'DB%d,INT%d' % (dbv, t['tensaoSel'])},
         {'name': 'KwRealV', 'addr': 'DB%d,REAL%d.%d' % (dbv, t['kwReal'], 3*N)},
         {'name': 'RmedidoV', 'addr': 'DB%d,REAL%d.%d' % (dbv, t['rMed'], 3*N)},
         {'name': 'VmedidaV', 'addr': 'DB%d,REAL%d.%d' % (dbv, t['vMed'], 3*N)},
         {'name': 'SetupOkV', 'addr': 'DB%d,BYTE%d.%d' % (dbv, t['setupOk'], 3*N//8)}]
    for c in (1, 2, 3):
        w += [{'name': 'OkLin%d' % c, 'addr': 'DB%d,BYTE%d.%d' % (dbv, t['setupOk'] + nb*(c-1), nb)},
              {'name': 'KwLin%d' % c, 'addr': 'DB%d,REAL%d.%d' % (dbv, 6 + 4*N*(c-1), N)},
              {'name': 'RmLin%d' % c, 'addr': 'DB%d,REAL%d.%d' % (dbv, t['rMed'] + 4*N*(c-1), N)}]
    return v, w

def fluxo(b, N, dbc, dbv, modelo):
    slug, nome, k = b['slug'], b['nome'], len(b['chaves'])
    txt = json.dumps(modelo, ensure_ascii=False)
    txt = txt.replace('chv3_', 'chv%s_' % slug).replace('/api/chaves/400', '/api/chaves/' + slug).replace('/api/logs/400', '/api/logs/' + slug)
    txt = txt.replace("banco: '400'", "banco: '%s'" % slug).replace('BC400', nome).replace('DB158', 'DB%d' % dbc).replace('DB160', 'DB%d' % dbv)
    f = json.loads(txt)
    for n in f:
        if n['type'] == 'function':
            c = n['func']
            if N != 16:
                for a, z in (('i <= 16', 'i <= %d' % N), ('new Array(16)', 'new Array(%d)' % N), ('new Array(192)', 'new Array(%d)' % (12*N)),
                             ('c * 16 + 16', 'c * %d + %d' % (N, N)), ('c * 16', 'c * %d' % N), ('k < 16', 'k < %d' % N),
                             ('payload: [[0, 0]]', 'payload: [[%s]]' % ', '.join(['0']*(N//8)))):
                    c = c.replace(a, z)
                c = c.replace('das 16 chaves', 'das %d chaves' % N).replace('1..16', '1..%d' % N)
            c = c.replace('b.indice > 16', 'b.indice > %d' % k).replace('de 1 a 16', 'de 1 a %d' % k).replace('de 0 a 16', 'de 0 a %d' % k)
            n['func'] = c
        if n['type'] == 'tab':
            n['label'] = 'Chaves %s (API) v%s' % (nome, b['fluxo_ver'])
            n['info'] = 'v%s (03/11/2026) - gerado por plc/bt2/gerador/gerar_banco_v0.2.py a partir do flow chaves-400 v2.6 (campo flow = chaves-v2.5, o contrato que o HTML confere). Banco %s (%d chaves, arrays de %d): DB%d e DB%d (numeracao v4). Rotas /api/chaves/%s/... e /api/logs/%s. Nao testado em PLC. ATENCAO AO IMPORTAR: apague a aba antiga do mesmo banco antes do Deploy (rotas iguais).' % (b['fluxo_ver'], nome, k, N, dbc, dbv, slug, slug)
        if n['type'] == 's7 endpoint':
            v, w = vartables(N, dbc, dbv)
            n['vartable'] = v if n['id'].endswith('_ep') else w
    return f


# ---------------------------------------------------------------- DBs e chamadas (v0.1)
def db_chaves(b, N, ver):
    o, _ = offs(N); n, tag, nome, k = b['db'], b['id'], b['nome'], len(b['chaves'])
    nom = '\n'.join('   setup.nominal[%d] := %s;' % (i, float(v)) for i, v in enumerate(b['chaves'], 1))
    return f"""DATA_BLOCK "db{n}_{tag}_Chaves"
TITLE = db{n}_{tag}_Chaves v{ver} (DB{n})
{{ S7_Optimized_Access := 'FALSE' }}
AUTHOR : 'Reginaldo Lobo'
VERSION : {ver}
NON_RETAIN
////====================================
//// db{n}_{tag}_Chaves (DB{n}) - GERADO por plc/bt2/gerador/gerar_banco_v0.2.py (03/11/2026) - nao compilado no TIA, nao testado
//// O QUE FAZ : mesmo papel do db150_BC56_Chaves v0.3, arrays de {N} chaves. Banco {nome}: {k} chaves reais, {N-k} reserva. FB: {'FB100/FB101' if N == 16 else 'FB102/FB103'}.
//// OFFSETS (calculados; CONFERIR na coluna "Deslocamento" do TIA): cb.ligar X{o['cb']}.0 | sb.ligada X{o['sb']}.0 | habilitada X{o['hab']}.0 | setupOk X{o['setupOk']}.0
////    kwReal D{o['kwReal']} | rMedidoOhm D{o['rMed']} | rTeoricoOhm D{o['rTeo']} | setupData B{o['setupData']} (12 bytes cada) | nominal D{o['nominal']}
////    chaveSel W{o['chaveSel']} | salvar X{o['salvar']}.0 | usarKwReal X{o['salvar']}.1 | cbBanco.ligar X{o['cbBanco']}.0 | sbBanco.seletoraAuto X{o['sbBanco']}.0 | comEt200Ok X{o['sbBanco']}.1
//// kW nominal na ordem fisica das chaves (informado pelo operador em 30/10/2026).
////=====================================
   VAR
      cb : Struct
         ligar : Array[1..{N}] of Bool;
      END_STRUCT;

      sb : Struct
         ligada : Array[1..{N}] of Bool;
      END_STRUCT;

      setup : Struct
         habilitada   : Array[1..{N}] of Bool;
         setupOk      : Array[1..{N}] of Bool;
         kwReal       : Array[1..{N}] of Real;
         rMedidoOhm   : Array[1..{N}] of Real;
         rTeoricoOhm  : Array[1..{N}] of Real;
         setupData    : Array[1..{N}] of DTL;
         nominal      : Array[1..{N}] of Real;
         chaveSel     : UInt;
         salvar       : Bool;
         usarKwReal   : Bool;
      END_STRUCT;

      cbBanco : Struct   // DBX{o['cbBanco']}.0
         ligar : Bool;
      END_STRUCT;

      sbBanco : Struct   // DBX{o['sbBanco']}.0
         seletoraAuto : Bool;
         comEt200Ok : Bool;
      END_STRUCT;
   END_VAR


BEGIN
{nom}
   // {k+1}..{N}: reserva, 0.0

END_DATA_BLOCK
"""

def db_tensao(b, N, ver):
    _, t = offs(N); n = b['db'] + 2; tag, nome = b['id'], b['nome']
    return f"""DATA_BLOCK "db{n}_{tag}_SetupPorTensao"
TITLE = db{n}_{tag}_SetupPorTensao v{ver} (DB{n})
{{ S7_Optimized_Access := 'FALSE' }}
AUTHOR : 'Reginaldo Lobo'
VERSION : {ver}
////====================================
//// db{n}_{tag}_SetupPorTensao (DB{n}) - GERADO por plc/bt2/gerador/gerar_banco_v0.2.py (03/11/2026) - nao compilado, nao testado
//// O QUE FAZ : mesmo papel do db152_BC56_SetupPorTensao v0.2, {N} chaves por chaveamento (1=220, 2=380, 3=440 V). Banco {nome}.
//// p = (chaveamento-1)*{N} + (chave-1)  (0..{3*N-1})
//// OFFSETS (calculados; CONFERIR no TIA): tensaoV W0/2/4 | kwReal D{t['kwReal']}+4p | rMedidoOhm D{t['rMed']}+4p | vMedidaV D{t['vMed']}+4p
////    baseKw D{t['base']}+4p | setupData B{t['setupData']}+12p | setupOk X{t['setupOk']}.0+p | selV.tensaoSel W{t['tensaoSel']}
//// RETENTIVIDADE : precisa sobreviver a reinicio da CPU; conferir no TIA.
////=====================================
   VAR
      setupV : Struct
         tensaoV     : Array[1..3] of Int;
         kwReal      : Array[1..3, 1..{N}] of Real;
         rMedidoOhm  : Array[1..3, 1..{N}] of Real;
         vMedidaV    : Array[1..3, 1..{N}] of Real;
         baseKw      : Array[1..3, 1..{N}] of Real;
         setupData   : Array[1..3, 1..{N}] of DTL;
         setupOk     : Array[1..3, 1..{N}] of Bool;
      END_STRUCT;
      selV : Struct
         tensaoSel   : Int;
      END_STRUCT;
   END_VAR


BEGIN
   setupV.tensaoV[1] := 220;
   setupV.tensaoV[2] := 380;
   setupV.tensaoV[3] := 440;
   selV.tensaoSel := 0;   // NAO informado ate o operador escolher no HTML

END_DATA_BLOCK
"""

def chamadas(b, N):
    n, tag, k, rem = b['db'], b['id'], len(b['chaves']), b['remoto']
    d = '"db%d_%s_Chaves"' % (n, tag); v = '"db%d_%s_SetupPorTensao"' % (n + 2, tag)
    fb, fc = ('fb100_setupChaves', 'fb101_ComEt200') if N == 16 else ('fb102_setupChaves32', 'fb103_ComEt200_32')
    by = 6 if N == 16 else 8; off = 6 if N == 16 else 8
    return f"""// ============================================================================
// Banco {b['nome']} ({k} chaves) -> arrays de {N} -> {fb} / {fc}. GERADO por gerar_banco_v0.2.py (03/11/2026). Nao compilado.
// Ordem no OB1: 1) comunicacao ({fc}) 2) setup ({fb}). Instancias = DBs de instancia dos FBs (criar como "{fc}" e "{fb}" no TIA).
// ============================================================================
"db{n+5}i_{tag}_ComEt200"(Hab := TRUE, ID_Conexao := W#16#100,
    RemotoCmd := P#DB{rem}.DBX0.0 BYTE {by}, RemotoFb := P#DB{rem}.DBX{off}.0 BYTE {by},
    ComOk => {d}.sbBanco.comEt200Ok, SeletoraAuto => {d}.sbBanco.seletoraAuto,
    CbLigar := {d}.cb.ligar, SbLigada := {d}.sb.ligada, LigarBanco := {d}.cbBanco.ligar);

"db{n+4}i_{tag}_SetupChaves"(
    NumChaves := {k}, GeradorOperando := "db52_BancoTeste2_DSE".ledManual, EnsaioAtivo := FALSE,   // TODO: tag real do DB "Dados do ensaio"
    kWMedido := "db52_BancoTeste2_DSE".potenciaKw, VaMedido := "db52_BancoTeste2_DSE".tensaoL1L2,
    VbMedido := "db52_BancoTeste2_DSE".tensaoL2L3, VcMedido := "db52_BancoTeste2_DSE".tensaoL3L1,
    TensaoSel := {v}.selV.tensaoSel, ChaveSelecionada := {d}.setup.chaveSel, ComandoSalvar := {d}.setup.salvar,
    kWNominal := {d}.setup.nominal, CbLigar := {d}.cb.ligar, SbLigada := {d}.sb.ligada, Habilitada := {d}.setup.habilitada,
    SetupOk := {d}.setup.setupOk, KwReal := {d}.setup.kwReal, RmedidoOhm := {d}.setup.rMedidoOhm,
    RteoricoOhm := {d}.setup.rTeoricoOhm, SetupData := {d}.setup.setupData,
    KwRealV := {v}.setupV.kwReal, RmedidoV := {v}.setupV.rMedidoOhm, VmedidaV := {v}.setupV.vMedidaV,
    BaseKwV := {v}.setupV.baseKw, SetupDataV := {v}.setupV.setupData, SetupOkV := {v}.setupV.setupOk);
"""

def gera_tudo(idb, ver_db='0.2', ver_flow='1.1'):
    fic = json.load(open(os.path.join(AQUI, 'bancos_bt2_v0.2.json'))); b = dict(fic[idb]); b['id'] = idb
    N = tamanho(len(b['chaves'])); out = os.path.join(RAIZ, 'plc/bt2/bancos_cargas')
    for nome, txt in (('db%d_%s_Chaves_v%s.db' % (b['db'], idb, ver_db), db_chaves(b, N, ver_db)),
                      ('db%d_%s_SetupPorTensao_v%s.db' % (b['db'] + 2, idb, ver_db), db_tensao(b, N, ver_db)),
                      ('chamadas_%s_v%s.scl' % (idb, ver_db), chamadas(b, N))):
        open(os.path.join(out, nome), 'w', encoding='utf-8').write(txt); print('gerado', nome)

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if not args: raise SystemExit(__doc__)
    if '--blocos' in sys.argv: gera_tudo(args[0]); raise SystemExit
    fic = json.load(open(os.path.join(AQUI, 'bancos_bt2_v0.2.json')))
    b = fic[args[0]]; N = tamanho(len(b['chaves']))
    dbc = b['db']; dbv = dbc + 2
    modelo = json.load(open(os.path.join(RAIZ, 'nodered/flows/bt2/chaves-400-api-v2.6.json')))
    f = fluxo(b, N, dbc, dbv, modelo)
    saida = args[1] if len(args) > 1 else os.path.join(RAIZ, 'nodered/flows/bt2')
    p = os.path.join(saida, 'chaves-%s-api-v%s.json' % (b['slug'], b['fluxo_ver']))
    json.dump(f, open(p, 'w'), ensure_ascii=False, indent=2)
    o, t = offs(N)
    print('banco', b['nome'], 'chaves', len(b['chaves']), '-> arrays de', N, '-> FB', 'FB100/FB101' if N == 16 else 'FB102/FB103')
    print('offsets DB chaves:', o); print('offsets DB tensao:', t); print('fluxo:', p)
