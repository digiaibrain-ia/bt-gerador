#!/usr/bin/env python3
"""Entrega do PLC de cargas 1200 v0.7 (10/11/2026; v0.6 sem o watchdog separado (decisao: usar o fb_bancoCarga16 completo), so BC56 e BC400) = MESMOS blocos do ET200 (fb_bancoEt200_16/32, fb_supervisaoChaves16, DBs ComBC) portados para o S7-1200.
Mudancas vs ET200: TON -> TON_TIME; DB do telegrama entra por DB_ANY (so o numero) e o bloco trata por offset (PEEK/POKE); numeros de DB = os da 1500 (x07).
Sem espelho, sem competencia, sem sinais fora do card. Gera so .scl/.db em plc/bt2/entrega_1200_v0.7/. Nao sobrescreve. RASCUNHO, nao compilado."""
import os, re, shutil
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ET, BC = os.path.join(R, 'comunicacao_et200'), os.path.join(R, 'bancos_cargas')
OUT = os.path.join(R, 'entrega_1200_v0.7'); P1200, P1515 = os.path.join(OUT, 'PLC_CARGA_1200'), os.path.join(OUT, 'PLC_1515')
BANCOS = [('BC56', 3000, 13, 16), ('BC400', 3100, 13, 16)]   # v0.7: so BC56 e BC400 (unicos bancos existentes; testes com gerador ON so neles)
LAY = {16: dict(CMD=0, VIDA=2, LIG=4, HAB=6, SEQ=8, FBK=10, VIDAET=12, SEL=14, HABR=16, ECO=18, FALHA=20, COL=22),
       32: dict(CMD=0, VIDA=4, LIG=6, HAB=8, SEQ=12, FBK=14, VIDAET=18, SEL=20, HABR=22, ECO=26, FALHA=28, COL=32)}
def le(p): return open(p, encoding='utf-8').read()
def grava(d, n, t):
    os.makedirs(d, exist_ok=True); p = os.path.join(d, n); assert not os.path.exists(p), p; open(p, 'w', encoding='utf-8').write(t); print('gerado', os.path.relpath(p, R))
def copia(src, d):
    os.makedirs(d, exist_ok=True); dst = os.path.join(d, os.path.basename(src)); assert not os.path.exists(dst); shutil.copy(src, dst); print('copiado', os.path.relpath(dst, R))
def bits(var, ofs, N, ler):
    if ler: l = '#%s[#_k] := PEEK_BOOL(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_%s + (#_k - 1) / 8, bitOffset := (#_k - 1) MOD 8);' % (var, ofs)
    else: l = 'POKE_BOOL(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_%s + (#_k - 1) / 8, bitOffset := (#_k - 1) MOD 8, value := #%s[#_k]);' % (ofs, var)
    return '   FOR #_k := 1 TO %d DO\n      %s\n   END_FOR;\n' % (N, l)

def supervisao(N):
    t = le(os.path.join(ET, 'fb_supervisaoChaves16_v0.1.scl'))
    t = t.replace('_tOsc100ms : TON;', '_tOsc100ms : TON_TIME;')
    if N == 32:
        t = re.sub(r'(Chaves|Banco|Carga)16', r'\g<1>32', t); t = re.sub(r'\b16\b', '32', t)
    assert 'TON_TIME' in t
    t = re.sub(r'//// COMO LIGAR NO PROGRAMA DO ET200:.*\n////    Saida\[i\].*\n', '//// COMO LIGAR: o fb_bancoCarga chama este FB e so energiza a saida de uma chave com Permite[i] = TRUE (SaidaQ = imagem da saida fisica, so leitura).\n', t)
    t = t.replace('(hoje o ET200 IM151-8, familia S7-300; depois o S7-1200)', '(S7-1200)')
    t = t.replace('PORTAVEL S7-300/1200: sem TON_TIME e sem arrays de temporizador; usa contagem de ticks de 100 ms (precisao +100 ms).', 'S7-1200: mesma logica do ET200; unica troca TON -> TON_TIME. Contagem de ticks de 100 ms (precisao +100 ms).')
    t = re.sub(r'VERSION : [0-9.]+', 'VERSION : 0.5', t, 1); t = re.sub(r'TITLE = (\S+) v[0-9.]+', r'TITLE = \1 v0.7 (1200)', t, 1)
    grava(P1200, 'fb_supervisaoChaves%d_v0.7.scl' % N, t)

def banco(N):
    t = le(os.path.join(ET, 'fb_bancoEt200_16_v0.3.scl'))   # a versao de 32 do ET200 e antiga (sem supervisao SB): 32 = a de 16 v0.3 com os tamanhos trocados
    if N == 32: t = re.sub(r'Chaves16', 'Chaves32', t); t = re.sub(r'\b16\b', '32', t)
    tipo = 'fb_bancoCarga%d' % N; L = LAY[N]
    cab = ('FUNCTION_BLOCK "%s"\nTITLE = %s v0.7 (1200)\nAUTHOR : \'RegLobo\'\nVERSION : 0.5\n'
           '////====================================\n'
           '//// %s v0.7 (09/11/2026) - RASCUNHO, nao compilado, nao testado no PLC. PORTE para o S7-1200 do fb_bancoEt200_%d (mesma logica; TON -> TON_TIME).\n'
           '//// ONDE RODA : PLC de cargas (S7-1200). 1 instancia por banco, 1x por ciclo.\n'
           '//// O QUE FAZ : lado do banco do telegrama PUT/GET do 1515 (ate %d chaves): vidaET a cada ~100 ms; sem vida do 1515 por TempoPerdaMs (2 s) = ComOk FALSE e saidas FALSE;\n'
           '////   religacao so com novo comando; saida = Cmd E ComOk E LigarBanco E seletora Auto E Permite (fb_supervisaoChaves%d: SB some -> CB cai em 2 s, falha travada).\n'
           '//// DB_ANY    : recebe SO o numero do DB do telegrama (DbCom). Le o PEDIDO por offset (PEEK) no inicio do ciclo e escreve so a RESPOSTA (POKE) no fim. Offsets = DB ComBC (%d B).\n'
           '//// ESCRITOR UNICO : PEDIDO so pelo PUT do 1515; RESPOSTA so por este FB. DB invalido (0) = nada liga.\n'
           '//// CONFERIR no TIA: parametros de PEEK/POKE na CPU; DB do telegrama com S7_Optimized_Access := FALSE.\n'
           '////====================================\n' % (tipo, tipo, tipo, N, N, N, 24 if N == 16 else 36))
    corpo = t[t.index('BEGIN\n'):]                       # logica do ET200, inalterada
    corpo = corpo.replace('#_n > 16', '#_n > %d' % N).replace('TO 16 DO', 'TO %d DO' % N)
    corpo = corpo.replace('BEGIN\n', ('BEGIN\n   // 0) DB_ANY -> numero. DB invalido = estado seguro (nada liga)\n   #_dbCom := DB_ANY_TO_UINT(#DbCom);\n'
        '   IF #_dbCom = 0 THEN\n      #ComOk := FALSE;\n      FOR #i := 1 TO %d DO #SaidaContatora[#i] := FALSE; END_FOR;\n      RETURN;\n   END_IF;\n'
        '   // 0b) LE O PEDIDO do DB (so leitura)\n' % N) + bits('Cmd', 'CMD', N, True) + bits('HabPed', 'HAB', N, True) +
        '   #Vida1515 := WORD_TO_INT(PEEK_WORD(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_VIDA));\n'
        '   #LigarBanco := PEEK_BOOL(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_LIG, bitOffset := 0);\n'
        '   #Seq := WORD_TO_INT(PEEK_WORD(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_SEQ));\n\n// ---- logica do ET200 (inalterada) ----\n', 1)
    esc = ('\n   // 9) ESCREVE A RESPOSTA no DB (so a faixa da RESPOSTA; o PEDIDO nunca e escrito aqui)\n' + bits('Fbk', 'FBK', N, False) + bits('HabResp', 'HABR', N, False)
           + bits('FalhaRetorno', 'FALHA', N, False) + bits('ContatorColado', 'COL', N, False) +
           '   POKE_WORD(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_VIDAET, value := INT_TO_WORD(#VidaET));\n'
           '   POKE_WORD(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_ECO, value := INT_TO_WORD(#Eco));\n'
           '   POKE_BOOL(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_SEL, bitOffset := 0, value := #SeletoraAuto);\nEND_FUNCTION_BLOCK\n')
    corpo = corpo.replace('END_FUNCTION_BLOCK\n', esc)
    corpo = corpo.replace('TON;', 'TON_TIME;')
    decl = ('   VAR_INPUT\n      DbCom            : DB_ANY;                    // NUMERO do DB do telegrama (ex.: DB3007)\n      NumChaves        : Int;                       // chaves reais deste banco (1..%d)\n'
            '      SeletoraEntrada  : Bool;                      // entrada fisica: seletora do banco em Auto (1 = Auto)\n      TempoPerdaMs     : Time := T#2S;              // menor que o TempoVida do 1515 (3 s)\n'
            '      TempoRetornoMs   : Int := 2000;               // T de verificacao do retorno SB (decisao do Reginaldo: 2 s)\n   END_VAR\n   VAR_OUTPUT\n      ComOk : Bool;\n   END_VAR\n'
            '   VAR_IN_OUT\n      SaidaContatora    : Array[1..%d] of Bool;   // saidas fisicas (copiadas pelo fc_bancosCarga1200)\n      EntradaContatoAux : Array[1..%d] of Bool;   // contatos auxiliares fisicos\n   END_VAR\n' % (N, N, N))
    estat = t[t.index('   VAR\n'):t.index('BEGIN\n')]
    estat = estat.replace('TON;', 'TON_TIME;').replace('Array[1..16]', 'Array[1..%d]' % N).replace('Array[1..32]', 'Array[1..%d]' % N)
    proprios = ''.join('      %s : %s;\n' % (n, tp) for n, tp in (
        [('Cmd', 'Array[1..%d] of Bool' % N), ('HabPed', 'Array[1..%d] of Bool' % N), ('Vida1515', 'Int'), ('LigarBanco', 'Bool'), ('Seq', 'Int'),
         ('HabResp', 'Array[1..%d] of Bool' % N), ('FalhaRetorno', 'Array[1..%d] of Bool' % N), ('ContatorColado', 'Array[1..%d] of Bool' % N), ('Fbk', 'Array[1..%d] of Bool' % N),
         ('Eco', 'Int'), ('VidaET', 'Int'), ('SeletoraAuto', 'Bool'), ('_dbCom', 'UInt'), ('_k', 'Int')]))
    estat = estat.replace('   END_VAR', proprios + '   END_VAR', 1)
    consts = '   VAR CONSTANT\n      AREA_DB : Byte := 16#84;   // area "bloco de dados" para PEEK/POKE\n' + ''.join('      OFS_%s : UInt := %d;\n' % (k, v) for k, v in L.items()) + '   END_VAR\n\n'
    grava(P1200, tipo + '_v0.7.scl', cab + decl + estat + consts + corpo)

def watchdog():
    L = LAY[16]
    cab = ('FUNCTION_BLOCK "fb_watchdogComCarga"\nTITLE = fb_watchdogComCarga v0.7 (1200)\nAUTHOR : \'RegLobo\'\nVERSION : 0.6\n'
           '////====================================\n'
           '//// fb_watchdogComCarga v0.7 (10/11/2026) - RASCUNHO, nao compilado, nao testado. PORTE para o S7-1200 do fb_watchdogComEt200 v0.1 (rascunho do ET200).\n'
           '//// CORRECAO vs o rascunho do ET200: o rascunho religava SOZINHO apos a queda ((comOkAnt OU rearmado) ja era TRUE no 2o ciclo; defeito achado na auditoria do fb_bancoEt200 v0.2).\n'
           '////   Aqui vale a regra corrigida: queda de comunicacao (ou 1o ciclo apos a partida) trava a chave; so solta quando o comando cai a FALSE e e recomandado.\n'
           '//// O QUE FAZ: (1) vidaET sobe a cada ~100 ms; (2) vida do 1515 parada por TempoPerdaMs (2 s) = ComOk FALSE e todas as saidas FALSE; (3) rearme so por novo comando;\n'
           '////   (4) fbk = contato auxiliar REAL, nunca copia do comando.\n'
           '//// ATENCAO: NAO chamar junto com o fb_bancoCarga16 do MESMO banco: o fb_bancoCarga16 ja contem estas funcoes (mais seletora Auto, Ligar banco e supervisao do retorno SB).\n'
           '////   Este bloco e o watchdog "puro" (sem seletora, sem Ligar banco, sem supervisao do retorno). Usar so se o banco for chamado sem o fb_bancoCarga16.\n'
           '//// DB_ANY: recebe so o numero do DB do telegrama (DbCom) e trata por offset (PEEK/POKE). Le cmd e vida1515; escreve so vidaET e fbk (escritor unico).\n'
           '//// CONFERIR no TIA: parametros de PEEK/POKE na CPU; DB do telegrama nao otimizado.\n'
           '////====================================\n')
    decl = ('   VAR_INPUT\n      DbCom : DB_ANY;               // NUMERO do DB do telegrama (ex.: DB3007)\n      NumChaves : Int;              // chaves reais do banco (1..16)\n      TempoPerdaMs : Time := T#2S;  // menor que o TempoVida do 1515 (3 s)\n   END_VAR\n'
            '   VAR_OUTPUT\n      ComOk : Bool;\n   END_VAR\n   VAR_IN_OUT\n      SaidaContatora    : Array[1..16] of Bool;   // saidas fisicas das contatoras\n      EntradaContatoAux : Array[1..16] of Bool;   // contatos auxiliares fisicos\n   END_VAR\n'
            '   VAR\n      _tOsc100ms : TON_TIME;\n      _tPerda : TON_TIME;\n      _vida1515Ant : Int;\n      _vidaMudou : Bool;\n      _bloq : Array[1..16] of Bool;   // TRUE = caiu a comunicacao (ou partida); so solta com Cmd[i] = FALSE\n      _partiu : Bool;\n'
            '      _n : Int;\n      i : Int;\n      _k : Int;\n      _dbCom : UInt;\n      Cmd : Array[1..16] of Bool;\n      Vida1515 : Int;\n      VidaET : Int;\n      Fbk : Array[1..16] of Bool;\n   END_VAR\n'
            '   VAR CONSTANT\n      AREA_DB : Byte := 16#84;\n' + ''.join('      OFS_%s : UInt := %d;\n' % (k, L[k]) for k in ('CMD', 'VIDA', 'FBK', 'VIDAET')) + '   END_VAR\n\n')
    corpo = ('BEGIN\n   #_dbCom := DB_ANY_TO_UINT(#DbCom);\n   IF #_dbCom = 0 THEN\n      #ComOk := FALSE;\n      FOR #i := 1 TO 16 DO #SaidaContatora[#i] := FALSE; END_FOR;\n      RETURN;\n   END_IF;\n'
             '   // le o PEDIDO (so leitura)\n' + bits('Cmd', 'CMD', 16, True) +
             '   #Vida1515 := WORD_TO_INT(PEEK_WORD(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_VIDA));\n\n'
             '   // 1) vidaET a cada ~100 ms\n   #_tOsc100ms(IN := NOT #_tOsc100ms.Q, PT := T#100MS);\n   IF #_tOsc100ms.Q THEN\n      #VidaET := #VidaET + 1;\n      IF #VidaET >= 32767 THEN #VidaET := 0; END_IF;\n   END_IF;\n\n'
             '   // 2) watchdog: vida do 1515 parada por TempoPerdaMs\n   IF #Vida1515 <> #_vida1515Ant THEN\n      #_vida1515Ant := #Vida1515;\n      #_vidaMudou := TRUE;\n   ELSE\n      #_vidaMudou := FALSE;\n   END_IF;\n'
             '   #_tPerda(IN := NOT #_vidaMudou, PT := #TempoPerdaMs);\n   #ComOk := NOT #_tPerda.Q;\n   #_n := #NumChaves;\n   IF #_n < 0 THEN #_n := 0; END_IF;\n   IF #_n > 16 THEN #_n := 16; END_IF;\n\n'
             '   // 3) queda (ou 1o ciclo) trava; cada chave so solta com Cmd = FALSE (rearme so por novo comando)\n   FOR #i := 1 TO 16 DO\n      IF NOT #ComOk OR NOT #_partiu THEN\n         #_bloq[#i] := TRUE;\n      ELSIF NOT #Cmd[#i] THEN\n         #_bloq[#i] := FALSE;\n      END_IF;\n   END_FOR;\n   #_partiu := TRUE;\n\n'
             '   // 4) feedback = contato auxiliar REAL; saida so com comunicacao viva e chave nao travada\n   FOR #i := 1 TO 16 DO\n      IF #i <= #_n THEN\n         #Fbk[#i] := #EntradaContatoAux[#i];\n         IF #ComOk AND NOT #_bloq[#i] THEN\n            #SaidaContatora[#i] := #Cmd[#i];\n         ELSE\n            #SaidaContatora[#i] := FALSE;\n         END_IF;\n'
             '      ELSE\n         #Fbk[#i] := FALSE;\n         #SaidaContatora[#i] := FALSE;\n      END_IF;\n   END_FOR;\n\n   // escreve so a faixa da RESPOSTA (vidaET e fbk)\n' + bits('Fbk', 'FBK', 16, False) +
             '   POKE_WORD(area := #AREA_DB, dbNumber := #_dbCom, byteOffset := #OFS_VIDAET, value := INT_TO_WORD(#VidaET));\nEND_FUNCTION_BLOCK\n')
    grava(P1200, 'fb_watchdogComCarga_v0.7.scl', cab + decl + corpo)

def dbs():
    t = ''
    for nome, base, n, N in BANCOS:
        L = LAY[N]; ob = 'DATA_BLOCK "db%d_%s_Com"\nTITLE = db%d_%s_Com v0.7 (DB%d)\n{ S7_Optimized_Access := \'FALSE\' }\nAUTHOR : \'RegLobo\'\nVERSION : 0.5\nNON_RETAIN\n' % (base + 7, nome, base + 7, nome, base + 7)
        ob += ('////====================================\n//// db%d_%s_Com (DB%d) v0.7 - RASCUNHO. Telegrama PEDIDO/RESPOSTA do %s (%d B). Mesmo layout do ComBC56 do ET200 (%s).\n'
               '//// PUT do 1515: P#DB%d.DBX0.0 BYTE %d | GET do 1515: P#DB%d.DBX%d.0 BYTE %d. Escritor unico: PEDIDO so pelo PUT; RESPOSTA so pelo fb_bancoCarga%d.\n////====================================\n'
               % (base + 7, nome, base + 7, nome, 24 if N == 16 else 36, 'ate 16 chaves' if N == 16 else 'ate 32 chaves', base + 7, L['FBK'], base + 7, L['FBK'], 14 if N == 16 else 22, N))
        ob += ('   STRUCT\n      cmd : Array[1..%d] of Bool;            // PEDIDO\n      vida1515 : Int;\n      ligarBanco : Bool;\n      resPut : Byte;\n      habPed : Array[1..%d] of Bool;\n      seq : Int;\n'
               '      fbk : Array[1..%d] of Bool;            // RESPOSTA\n      vidaET : Int;\n      seletoraAuto : Bool;\n      resGet : Byte;\n      habResp : Array[1..%d] of Bool;\n      eco : Int;\n'
               '      falhaRetorno : Array[1..%d] of Bool;\n      contatorColado : Array[1..%d] of Bool;\n   END_STRUCT;\nBEGIN\nEND_DATA_BLOCK\n\n' % ((N,) * 6))
        t += ob
    grava(P1200, 'db_ComBancos_v0.7.scl', t)

def fc():
    t = ('FUNCTION "fc_bancosCarga1200" : Void\nTITLE = fc_bancosCarga1200 v0.7\nAUTHOR : \'RegLobo\'\nVERSION : 0.5\n////====================================\n'
         '//// fc_bancosCarga1200 v0.7 (09/11/2026) - RASCUNHO, nao compilado. Equivalente do fc_bancosNovosEt200, agora com os 4 bancos no 1200. Chamar 1x por ciclo (OB1 ou OB de tempo fixo).\n'
         '//// Tags fisicos (<BANCO>_I01.., <BANCO>_Q01.., <BANCO>_SEL_AUTO) sao NOMES PROPOSTOS; o programador cria/ajusta. Instancias: "db<base+6>_<banco>_BancoCarga".\n////====================================\n'
         '   VAR_TEMP\n')
    for nome, base, n, N in BANCOS: t += '      saida%s : Array[1..%d] of Bool;\n      aux%s : Array[1..%d] of Bool;\n' % (nome, N, nome, N)
    t += '   END_VAR\nBEGIN\n'
    for nome, base, n, N in BANCOS:
        t += '\n   // ---------------- %s (%d chaves, telegrama DB%d) ----------------\n' % (nome, n, base + 7)
        for k in range(1, N + 1): t += '   #aux%s[%d] := %s;\n' % (nome, k, '"%s_I%02d"' % (nome, k) if k <= n else 'FALSE')
        t += ('   "db%d_%s_BancoCarga"(DbCom := "db%d_%s_Com", NumChaves := %d, SeletoraEntrada := "%s_SEL_AUTO", SaidaContatora := #saida%s, EntradaContatoAux := #aux%s);\n'
              % (base + 6, nome, base + 7, nome, n, nome, nome, nome))
        for k in range(1, n + 1): t += '   "%s_Q%02d" := #saida%s[%d];\n' % (nome, k, nome, k)
    t += 'END_FUNCTION\n'
    grava(P1200, 'fc_bancosCarga1200_v0.7.scl', t)

def lado1515():
    for nome, base, n, N in BANCOS:
        if nome in ('BC56', 'BC400'):
            t = le(os.path.join(BC, 'chamadas_%s_v0.3.scl' % nome))
            ant = 'DB38' if nome == 'BC56' else 'DB39'
            assert 'P#%s.DBX0.0 BYTE 10' % ant in t
            t = t.replace('P#%s.DBX0.0 BYTE 10, RemotoFb := P#%s.DBX10.0 BYTE 14' % (ant, ant), 'P#DB%d.DBX0.0 BYTE 10, RemotoFb := P#DB%d.DBX10.0 BYTE 14' % (base + 7, base + 7))
            t = t.replace('ID_Conexao := W#16#100,', 'ID_Conexao := W#16#0,   /* A PREENCHER: ID da conexao S7 com o PLC de cargas (1200) */')
            t = '// [v0.4 09/11/2026] remoto agora no PLC de cargas 1200: DB%d (era %s do ET200). Resto igual a v0.3. RASCUNHO, nao compilado.\n' % (base + 7, ant) + t
            grava(P1515, 'chamadas_%s_v0.4.scl' % nome, t)
        copia(os.path.join(BC, 'db%d_%s_Chaves_v0.3.db' % (base, nome)), P1515)
    copia(os.path.join(ET, 'fb101_ComEt200_v0.8.scl'), P1515)

if __name__ == '__main__':
    assert not os.path.exists(OUT), 'pasta ja existe'
    supervisao(16); banco(16); dbs(); fc(); lado1515()
