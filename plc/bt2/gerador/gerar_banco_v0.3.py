#!/usr/bin/env python3
"""Gerador de blocos de um banco de carga do BT2 (v0.1, 03/11/2026).
Uso: python3 gerar_banco_v0.3.py <id> [pasta_saida]
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
            n['info'] = 'v%s (03/11/2026) - gerado por plc/bt2/gerador/gerar_banco_v0.3.py a partir do flow chaves-400 v2.6 (campo flow = chaves-v2.5, o contrato que o HTML confere). Banco %s (%d chaves, arrays de %d): DB%d e DB%d (numeracao v4). Rotas /api/chaves/%s/... e /api/logs/%s. Nao testado em PLC. ATENCAO AO IMPORTAR: apague a aba antiga do mesmo banco antes do Deploy (rotas iguais).' % (b['fluxo_ver'], nome, k, N, dbc, dbv, slug, slug)
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
//// db{n}_{tag}_Chaves (DB{n}) - GERADO por plc/bt2/gerador/gerar_banco_v0.3.py (03/11/2026) - nao compilado no TIA, nao testado
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
//// db{n}_{tag}_SetupPorTensao (DB{n}) - GERADO por plc/bt2/gerador/gerar_banco_v0.3.py (03/11/2026) - nao compilado, nao testado
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
// Banco {b['nome']} ({k} chaves) -> arrays de {N} -> {fb} / {fc}. GERADO por gerar_banco_v0.3.py (03/11/2026). Nao compilado.
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
    fic = json.load(open(os.path.join(AQUI, 'bancos_bt2_v0.3.json'))); b = dict(fic[idb]); b['id'] = idb
    N = tamanho(len(b['chaves'])); out = os.path.join(RAIZ, 'plc/bt2/bancos_cargas')
    for nome, txt in (('db%d_%s_Chaves_v%s.db' % (b['db'], idb, ver_db), db_chaves(b, N, ver_db)),
                      ('db%d_%s_SetupPorTensao_v%s.db' % (b['db'] + 2, idb, ver_db), db_tensao(b, N, ver_db)),
                      ('chamadas_%s_v%s.scl' % (idb, ver_db), chamadas(b, N))):
        open(os.path.join(out, nome), 'w', encoding='utf-8').write(txt); print('gerado', nome)


# ---------------------------------------------------------------- ET200 (FBs de banco) e FC de chamadas do 1515
def fb_et200_v02(N):
    """v0.3 do gerador: os FBs do ET200 vem dos arquivos v0.2 da auditoria de 03/11/2026 (trava de religamento apos queda, TON em vez de TON_TIME,
    sem S7_Optimized_Access). A funcao antiga fb_et200 (v0.1) fica abaixo so como historico: gerava o defeito E1."""
    return open(os.path.join(RAIZ, 'plc/bt2/comunicacao_et200/fb_bancoEt200_%d_v0.2.scl' % N), encoding='utf-8').read()

def fb_et200(N, ver='0.1'):
    nb = 6 if N == 16 else 8
    return f"""FUNCTION_BLOCK "fb_bancoEt200_{N}"
TITLE = fb_bancoEt200_{N} v{ver}
{{ S7_Optimized_Access := 'TRUE' }}
AUTHOR : 'RegLobo'
VERSION : {ver}
////====================================
//// fb_bancoEt200_{N}  -  RASCUNHO v{ver} (03/11/2026) GERADO por gerar_banco_v0.3.py - nao compilado, nao testado
//// ONDE RODA : ET200 (programa Gerador_BC015). 1 instancia por banco NOVO (BC550, BC59,5). BC56 e BC400 seguem no FC4 atual.
//// O QUE FAZ : lado ET200 do telegrama PUT/GET do banco (ate {N} chaves, {nb}+{nb} bytes):
////    1) vidaET incrementa a cada ~100 ms (prova ao 1515 que o ET200 esta vivo).
////    2) vida1515 parou de mudar por TempoPerdaMs -> ComOk=FALSE e TODAS as saidas vao a FALSE.
////    3) apos queda, a chave so religa depois de o comando cair a FALSE e ser recomandado (nao religa sozinha).
////    4) saida da contatora so liga com ComOk E LigarBanco E seletora em Auto (defesa extra; o 1515 ja zera o comando).
////    5) fbk[n] = contato auxiliar REAL; seletoraAuto = entrada fisica da seletora do banco (1 = Auto).
//// COMO CHAMAR: ver fc_bancosNovosEt200 (gerado). Entradas/saidas fisicas entram pelas tags da tabela tags_ET200_bancos.
////=====================================
   VAR_INPUT
      NumChaves        : Int;                       // chaves reais deste banco (1..{N})
      SeletoraEntrada  : Bool;                      // entrada fisica: seletora do banco em Auto (1 = Auto)
      TempoPerdaMs     : Time := T#2S;              // menor que o TempoVida do 1515 (3 s)
   END_VAR
   VAR_OUTPUT
      ComOk : Bool;
   END_VAR
   VAR_IN_OUT
      Cmd               : Array[1..{N}] of Bool;   // <DB remoto>.cmd       (PUT do 1515; so le)
      Vida1515          : Int;                     // <DB remoto>.vida1515  (so le)
      LigarBanco        : Bool;                    // <DB remoto>.ligarBanco (so le)
      VidaET            : Int;                     // <DB remoto>.vidaET    (escreve)
      Fbk               : Array[1..{N}] of Bool;   // <DB remoto>.fbk       (escreve)
      SeletoraAuto      : Bool;                    // <DB remoto>.seletoraAuto (escreve)
      SaidaContatora    : Array[1..{N}] of Bool;   // saidas fisicas (copiadas pelo fc_bancosNovosEt200)
      EntradaContatoAux : Array[1..{N}] of Bool;   // contatos auxiliares fisicos
   END_VAR
   VAR
      _tOsc100ms   : TON_TIME;
      _tPerda      : TON_TIME;
      _vida1515Ant : Int;
      _vidaMudou   : Bool;
      _comOkAnt    : Bool;
      _cmdAnt      : Array[1..{N}] of Bool;
      _rearmado    : Array[1..{N}] of Bool;
      i            : Int;
   END_VAR

BEGIN
   #_tOsc100ms(IN := NOT #_tOsc100ms.Q, PT := T#100MS);
   IF #_tOsc100ms.Q THEN
      #VidaET := #VidaET + 1;
      IF #VidaET >= 32767 THEN #VidaET := 0; END_IF;
   END_IF;

   IF #Vida1515 <> #_vida1515Ant THEN
      #_vida1515Ant := #Vida1515;
      #_vidaMudou := TRUE;
   ELSE
      #_vidaMudou := FALSE;
   END_IF;
   #_tPerda(IN := NOT #_vidaMudou, PT := #TempoPerdaMs);   // vida nova reseta; sem vida nova conta
   #ComOk := NOT #_tPerda.Q;

   IF #ComOk AND NOT #_comOkAnt THEN
      FOR #i := 1 TO #NumChaves DO
         #_rearmado[#i] := FALSE;
      END_FOR;
   END_IF;

   #SeletoraAuto := #SeletoraEntrada;

   FOR #i := 1 TO {N} DO
      IF #i <= #NumChaves THEN
         #Fbk[#i] := #EntradaContatoAux[#i];
         IF NOT #Cmd[#i] AND #_cmdAnt[#i] THEN
            #_rearmado[#i] := TRUE;
         END_IF;
         IF #ComOk AND #LigarBanco AND #SeletoraEntrada AND (#_comOkAnt OR #_rearmado[#i]) THEN
            #SaidaContatora[#i] := #Cmd[#i];
         ELSE
            #SaidaContatora[#i] := FALSE;
         END_IF;
         #_cmdAnt[#i] := #Cmd[#i];
      ELSE
         #Fbk[#i] := FALSE;
         #SaidaContatora[#i] := FALSE;
      END_IF;
   END_FOR;

   #_comOkAnt := #ComOk;
END_FUNCTION_BLOCK
"""

def dbrem_nome(b):
    return '"Com%s"' % b['nome'].replace(',', '')

def fc_et200_novos(bancos):
    ln = ["""FUNCTION "fc_bancosNovosEt200" : Void
TITLE = fc_bancosNovosEt200 v0.2
AUTHOR : 'RegLobo'
VERSION : 0.2
////====================================
//// fc_bancosNovosEt200 v0.2 (03/11/2026) - GERADO por gerar_banco_v0.3.py - RASCUNHO, nao compilado. v0.2: sem S7_Optimized_Access (o ET200 IM151-8 e S7-300). Usar com fb_bancoEt200_16/32 v0.2.
//// ONDE RODA : ET200 (Gerador_BC015). Chamar 1x por ciclo no OB1, junto do FC4 atual (que continua cuidando de BC56/BC400).
//// O QUE FAZ : para cada banco novo, copia as tags fisicas (tabela tags_ET200_bancos_v0.1.csv, enderecos A PREENCHER)
////             para arrays, chama o fb_bancoEt200_16/32 e devolve as saidas. Nao inventa endereco fisico.
//// ATENCAO   : criar no TIA do ET200 as instancias "fbEt200_<banco>" (DB de instancia) e as tags da tabela, com os enderecos reais.
////=====================================
   VAR_TEMP
      saida16 : Array[1..16] of Bool;
      aux16   : Array[1..16] of Bool;
      saida32 : Array[1..32] of Bool;
      aux32   : Array[1..32] of Bool;
   END_VAR
BEGIN"""]
    tags = []
    for k, b in bancos:
        n = len(b['chaves']); N = tamanho(n); rem = b['remoto']; dbn = dbrem_nome(b)
        sa, au = '#saida%d' % N, '#aux%d' % N
        ln.append('\n   // ---------------- %s (%d chaves, remoto DB%d) ----------------' % (b['nome'], n, rem))
        for i in range(1, N + 1):
            if i <= n:
                ln.append('   %s[%d] := "%s_I%02d";' % (au, i, k, i))
                tags.append(('%s_I%02d' % (k, i), 'Bool', '', 'contato auxiliar da contatora %d do %s' % (i, b['nome'])))
            else:
                ln.append('   %s[%d] := FALSE;' % (au, i))
        ln.append('   "fbEt200_%s"(NumChaves := %d, SeletoraEntrada := "%s_SEL_AUTO", Cmd := %s.cmd, Vida1515 := %s.vida1515, LigarBanco := %s.ligarBanco,' % (k, n, k, dbn, dbn, dbn))
        ln.append('       VidaET := %s.vidaET, Fbk := %s.fbk, SeletoraAuto := %s.seletoraAuto, SaidaContatora := %s, EntradaContatoAux := %s);' % (dbn, dbn, dbn, sa, au))
        tags.append(('%s_SEL_AUTO' % k, 'Bool', '', 'seletora do %s em Auto (1 = Auto)' % b['nome']))
        for i in range(1, n + 1):
            ln.append('   "%s_Q%02d" := %s[%d];' % (k, i, sa, i))
            tags.append(('%s_Q%02d' % (k, i), 'Bool', '', 'saida da contatora %d do %s' % (i, b['nome'])))
    ln.append('END_FUNCTION\n')
    return '\n'.join(ln), tags

def fc_1515(bancos):
    ln = ["""FUNCTION "fc_chamadasBancos_BT2" : Void
TITLE = fc_chamadasBancos_BT2 v0.2
{ S7_Optimized_Access := 'TRUE' }
AUTHOR : 'Reginaldo Lobo'
VERSION : 0.1
////====================================
//// fc_chamadasBancos_BT2 v0.1 (03/11/2026) - GERADO por gerar_banco_v0.3.py - RASCUNHO, nao compilado
//// ONDE RODA : 1515 (BT2). Chamar 1x por ciclo no OB1: "fc_chamadasBancos_BT2"();   (substitui colar chamadas uma a uma)
//// O QUE FAZ : para cada banco, 1) comunicacao com o ET200 (FB101/FB103) e 2) setup das chaves (FB100/FB102), nessa ordem.
//// OBS       : todos os bancos usam a MESMA conexao S7 (W#16#100), decisao do operador de 03/11/2026.
//// ATENCAO   : os DBs de instancia (db<base+4>i_<banco>_SetupChaves e db<base+5>i_<banco>_ComEt200, ex.: db3004i_BC56_SetupChaves, db3105i_BC400_ComEt200) precisam existir com esses nomes (criar no TIA como instancia dos FBs).
////=====================================
BEGIN"""]
    for k, b in bancos:
        N = tamanho(len(b['chaves'])); txt = chamadas(dict(b, id=k), N)
        txt = '\n'.join(l for l in txt.split('\n') if not l.startswith('//'))
        ln.append('\n   // ---------------- %s (%d chaves, FB%s) ----------------' % (b['nome'], len(b['chaves']), '100/101' if N == 16 else '102/103'))
        ln.append('\n'.join('   ' + l if l.strip() else l for l in txt.strip().split('\n')))
    ln.append('END_FUNCTION\n')
    return '\n'.join(ln)

def gera_extras():
    fic = json.load(open(os.path.join(AQUI, 'bancos_bt2_v0.3.json')))
    todos = [(k, dict(v, id=k)) for k, v in fic.items() if k.startswith('BC')]
    novos = [(k, v) for k, v in todos if v['db'] >= 3200]
    et = os.path.join(RAIZ, 'plc/bt2/comunicacao_et200'); bc = os.path.join(RAIZ, 'plc/bt2/bancos_cargas')
    for N in (16, 32):
        pass   # v0.3: os FBs do ET200 (v0.2) sao arquivos revisados; nao regerar
    txt, tags = fc_et200_novos(novos)
    open(os.path.join(et, 'fc_bancosNovosEt200_v0.2.scl'), 'w', encoding='utf-8').write(txt)
    with open(os.path.join(et, 'tags_ET200_bancos_v0.1.csv'), 'w', encoding='utf-8') as f:
        f.write('nome;tipo;endereco;comentario\n')
        for t in tags: f.write(';'.join(t) + '\n')
    open(os.path.join(bc, 'fc_chamadasBancos_BT2_v0.2.scl'), 'w', encoding='utf-8').write(fc_1515(todos))
    print('gerados: fb_bancoEt200_16/32, fc_bancosNovosEt200, tags (%d), fc_chamadasBancos_BT2' % len(tags))

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if '--extras' in sys.argv: gera_extras(); raise SystemExit
    if not args: raise SystemExit(__doc__)
    if '--extras' in sys.argv: gera_extras(); raise SystemExit
    if '--blocos' in sys.argv: gera_tudo(args[0]); raise SystemExit
    fic = json.load(open(os.path.join(AQUI, 'bancos_bt2_v0.3.json')))
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
