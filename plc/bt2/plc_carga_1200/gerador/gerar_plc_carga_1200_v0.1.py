#!/usr/bin/env python3
"""Gera o pacote do PLC DE CARGAS (S7-1200 real) - v0.1 RASCUNHO (09/11/2026). Nao compila no TIA aqui; nao toca producao.
Numeros de DB = os MESMOS da 1500 (decisao do Reginaldo). Bancos de ate 16 chaves: BC56, BC400, BC550. (BC59,5 tem 18 chaves = 32: fica para depois, ver LEIA-ME.)
Uso: python3 plc/bt2/plc_carga_1200/gerador/gerar_plc_carga_1200_v0.1.py   (nao sobrescreve arquivo existente)
"""
import os, re
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
SAIDA = os.path.join(RAIZ, 'plc', 'bt2', 'plc_carga_1200')
ET = os.path.join(RAIZ, 'plc', 'bt2', 'comunicacao_et200')
VER, DATA = '0.1', '09/11/2026'
BANCOS = [  # id, nome, slug, base do DB, chaves reais
    dict(id='BC56', slug='56', base=3000, n=13),
    dict(id='BC400', slug='400', base=3100, n=13),
    dict(id='BC550', slug='550', base=3300, n=12),
]
CAB = ("////====================================\n"
       "//// {nome} v{ver} ({data}) - RASCUNHO, NAO compilado no TIA, NAO testado no PLC. Faz parte do pacote plc_carga_1200 (S7-1200 real).\n"
       "{corpo}"
       "////====================================\n")


def grava(nome, texto):
    p = os.path.join(SAIDA, nome)
    assert not os.path.exists(p), 'ja existe (nao sobrescrevo): ' + nome
    open(p, 'w', encoding='utf-8').write(texto)
    print('gerado', nome)


# ---------------------------------------------------------------- tipos (UDT)
def tipos():
    t = 'TYPE "typeComBanco16"\nTITLE = typeComBanco16 v%s\nVERSION : %s\n' % (VER, VER)
    t += CAB.format(nome='typeComBanco16', ver=VER, data=DATA, corpo=(
        "//// O QUE E : telegrama PEDIDO/RESPOSTA entre o 1515 (ensaio) e o PLC de cargas, ate 16 chaves, 24 bytes. LAYOUT IDENTICO ao ComBC56 v0.4 (DB38 do ET200):\n"
        "////           o FB101 v0.8 do 1515 funciona sem mudanca de logica; so mudam o numero do DB remoto e o ID da conexao.\n"
        "//// PUT do 1515 : DBX0.0 BYTE 10 (PEDIDO)    GET do 1515 : DBX10.0 BYTE 14 (RESPOSTA)\n"
        "//// ESCRITOR UNICO : PEDIDO so pelo PUT do 1515; RESPOSTA so pelo fb_bancoCarga16 (este PLC). Nunca espelhar o DB inteiro nos dois sentidos.\n"))
    t += ('   STRUCT\n'
          '      cmd : Array[1..16] of Bool;            // DBX0.0..1.7   PEDIDO   comando das contatoras (CB)\n'
          '      vida1515 : Int;                         // DBW2          PEDIDO   vida do 1515, 0..32766\n'
          '      ligarBanco : Bool;                      // DBX4.0        PEDIDO   Ligar banco\n'
          '      resPut : Byte;                          // DBB5          reserva\n'
          '      habPed : Array[1..16] of Bool;         // DBX6.0..7.7   PEDIDO   habilitar (1) / desabilitar (0)\n'
          '      seq : Int;                              // DBW8          PEDIDO   contador do pacote, 1..32766\n'
          '      fbk : Array[1..16] of Bool;            // DBX10.0..11.7 RESPOSTA contato auxiliar real (SB)\n'
          '      vidaET : Int;                           // DBW12         RESPOSTA vida deste PLC\n'
          '      seletoraAuto : Bool;                    // DBX14.0       RESPOSTA seletora do banco em Auto\n'
          '      resGet : Byte;                          // DBB15         reserva\n'
          '      habResp : Array[1..16] of Bool;        // DBX16.0..17.7 RESPOSTA habilitacao aplicada\n'
          '      eco : Int;                              // DBW18         RESPOSTA copia do seq\n'
          '      falhaRetorno : Array[1..16] of Bool;   // DBX20.0..21.7 RESPOSTA sem retorno por T, TRAVADA\n'
          '      contatorColado : Array[1..16] of Bool; // DBX22.0..23.7 RESPOSTA contator colado, TRAVADO\n'
          '   END_STRUCT;\nEND_TYPE\n\n')
    t += 'TYPE "typeCompetenciaBanco"\nTITLE = typeCompetenciaBanco v%s\nVERSION : %s\n' % (VER, VER)
    t += CAB.format(nome='typeCompetenciaBanco', ver=VER, data=DATA, corpo=(
        "//// O QUE E : DB DE COMPETENCIA do banco = sinais que SO este PLC conhece e o 1515/Node-RED/tela precisam ler (8 bytes, GET do 1515 a ~1 s).\n"
        "//// POR QUE SEPARADO do telegrama rapido: o telegrama de 24 bytes e o ciclo de COMANDO (~100 ms) e nao pode mudar de tamanho sem mudar fluxo e FB101;\n"
        "////           estes sinais mudam devagar e sao novos. Assim comando e seguranca continuam rapidos e iguais ao ensaiado.\n"
        "//// ASSUMIDO - A CONFIRMAR com o Reginaldo/programador: nomes, quais sinais existem fisicamente (ventilador, contator geral, chaveamento), significado dos bits de alarmes.\n"
        "//// GET do 1515 : DBX0.0 BYTE 8.   Escritor unico: fb_bancoCarga16.\n"))
    t += ('   STRUCT\n'
          '      bancoLiberado : Bool;        // DBX0.0 banco aceita comandos agora (comunicacao viva E seletora Auto E intertravamento ok E Ligar banco)\n'
          '      bancoLigadoFbk : Bool;       // DBX0.1 feedback REAL do contator geral do banco (hoje a tela mostra so o COMANDO)  [A PREENCHER]\n'
          '      intertravamentoOk : Bool;    // DBX0.2 emergencia/protecoes do banco ok\n'
          '      ventiladorOk : Bool;         // DBX0.3 ventilador do banco ok (licao BANC-1; so vale se UsaVentilador)  [A CONFIRMAR]\n'
          '      resB1 : Byte;                // DBB1  reserva\n'
          '      chaveamentoFisicoV : Int;    // DBW2  chaveamento FISICO lido pelo banco: 0 = nao sabe, 220, 380 ou 440  [A CONFIRMAR se existe sinal]\n'
          '      alarmes : Word;              // DBW4  bit0 sem comunicacao | bit1 falha de retorno | bit2 contator colado | bit3 intertravamento aberto | bit4 ventilador  [ASSUMIDO]\n'
          '      vidaCompet : Int;            // DBW6  contador de vida deste bloco, sobe a cada ~100 ms (prova que o PLC esta atualizando)\n'
          '   END_STRUCT;\nEND_TYPE\n')
    grava('tipos_ComBanco_v%s.scl' % VER, t)


# ---------------------------------------------------------------- DBs
def dbs():
    t = ''
    for b in BANCOS:
        base = b['base']
        t += ('DATA_BLOCK "db%d_%s_Com"\nTITLE = db%d_%s_Com v%s (DB%d)\n{ S7_Optimized_Access := \'FALSE\' }\nAUTHOR : \'RegLobo\'\nVERSION : %s\nNON_RETAIN\n' % (base + 7, b['id'], base + 7, b['id'], VER, base + 7, VER))
        t += CAB.format(nome='db%d_%s_Com (DB%d)' % (base + 7, b['id'], base + 7), ver=VER, data=DATA, corpo=(
            "//// O QUE FAZ : area de troca PUT/GET do banco %s com o 1515 (telegrama rapido de 24 bytes). Mesmo NUMERO do DB do 1515 (DB%d = base %d + 7).\n"
            "//// PUT do 1515 : P#DB%d.DBX0.0 BYTE 10    GET do 1515 : P#DB%d.DBX10.0 BYTE 14 (iguais aos do FB101 v0.8)\n" % (b['id'], base + 7, base, base + 7, base + 7)))
        t += '   VAR\n      com : "typeComBanco16";\n   END_VAR\nBEGIN\nEND_DATA_BLOCK\n\n'
        t += ('DATA_BLOCK "db%d_%s_Competencia"\nTITLE = db%d_%s_Competencia v%s (DB%d)\n{ S7_Optimized_Access := \'FALSE\' }\nAUTHOR : \'RegLobo\'\nVERSION : %s\nNON_RETAIN\n' % (base + 8, b['id'], base + 8, b['id'], VER, base + 8, VER))
        t += CAB.format(nome='db%d_%s_Competencia (DB%d)' % (base + 8, b['id'], base + 8), ver=VER, data=DATA, corpo=(
            "//// O QUE FAZ : DB DE COMPETENCIA de %s (sinais do banco para o 1515). NUMERO PROPOSTO (base %d + 8), mesmo no 1515. GET do 1515: P#DB%d.DBX0.0 BYTE 8.\n" % (b['id'], base, base + 8)))
        t += '   VAR\n      compet : "typeCompetenciaBanco";\n   END_VAR\nBEGIN\nEND_DATA_BLOCK\n\n'
        t += ('DATA_BLOCK "db%d_%s_Chaves"\nTITLE = db%d_%s_Chaves v%s (DB%d) ESPELHO\n{ S7_Optimized_Access := \'FALSE\' }\nAUTHOR : \'RegLobo\'\nVERSION : %s\nNON_RETAIN\n' % (base, b['id'], base, b['id'], VER, base, VER))
        t += CAB.format(nome='db%d_%s_Chaves (DB%d) ESPELHO' % (base, b['id'], base), ver=VER, data=DATA, corpo=(
            "//// O QUE FAZ : COPIA DE MAO UNICA do DB de chaves do 1515 (mesmo numero e MESMOS offsets), so para a IHM/Runtime deste PLC. NAO e usada para controle.\n"
            "////   bytes 0..3  (cb, sb): preenchidos AQUI pelo fc_chamadasBancosCarga a partir do DB%d (comando e feedback ao vivo).\n"
            "////   bytes 4..199 (habilitada, setupOk, kwReal, rMedidoOhm, rTeoricoOhm = 196 B): escritos pelo PUT do 1515 numa passada (P#DB%d.DBX4.0 BYTE 196, limite do PUT/GET ~212 B).\n"
            "////   Os demais campos do DB do 1515 (setupData, nominal, chaveSel, ...) NAO sao espelhados. Escritor unico por faixa. CONFERIR os deslocamentos no TIA.\n" % (base + 7, base)))
        t += ('   VAR\n      cb : Struct\n         ligar : Array[1..16] of Bool;   // X0.0\n      END_STRUCT;\n'
              '      sb : Struct\n         ligada : Array[1..16] of Bool;   // X2.0\n      END_STRUCT;\n'
              '      setup : Struct\n         habilitada : Array[1..16] of Bool;    // X4.0  (PUT 1515)\n         setupOk : Array[1..16] of Bool;       // X6.0  (PUT 1515)\n'
              '         kwReal : Array[1..16] of Real;        // D8    (PUT 1515)\n         rMedidoOhm : Array[1..16] of Real;    // D72   (PUT 1515)\n         rTeoricoOhm : Array[1..16] of Real;   // D136  (PUT 1515)\n      END_STRUCT;\n   END_VAR\nBEGIN\nEND_DATA_BLOCK\n\n')
    grava('dbs_Banco_v%s.scl' % VER, t)


# ---------------------------------------------------------------- FBs (portados do ET200 v0.3)
def fb_supervisao():
    src = open(os.path.join(ET, 'fb_supervisaoChaves16_v0.1.scl'), encoding='utf-8').read()
    src = src.replace('_tOsc100ms : TON;', '_tOsc100ms : TON_TIME;')   # S7-1200/1500: instancia do TON de tempo
    src = src.replace('TITLE = fb_supervisaoChaves16 v0.1', 'TITLE = fb_supervisaoChaves16 v0.2 (1200)').replace('VERSION : 0.1', 'VERSION : 0.2')
    nota = ('//// v0.2 (09/11/2026, pacote plc_carga_1200): PORTE para o S7-1200 real. Unica mudanca de codigo: instancia do temporizador TON -> TON_TIME. Logica identica a v0.1.\n'
            '////      (o ET200/S7-300 usava TON). CONFERIR no TIA o tipo aceito para a instancia (TON_TIME ou IEC_TIMER) na versao do firmware.\n')
    src = src.replace('////====================================\n', '////====================================\n' + nota, 1)
    assert 'TON_TIME' in src
    grava('fb_supervisaoChaves16_1200_v%s.scl' % VER, src)


def fb_banco():
    t = '''FUNCTION_BLOCK "fb_bancoCarga16"
TITLE = fb_bancoCarga16 v%s
AUTHOR : 'RegLobo'
VERSION : %s
''' % (VER, VER)
    t += CAB.format(nome='fb_bancoCarga16', ver=VER, data=DATA, corpo=(
        "//// ONDE RODA : PLC de cargas (S7-1200 real). 1 INSTANCIA POR BANCO (um FB para cada banco), 1x por ciclo, de preferencia em OB de tempo fixo.\n"
        "//// O QUE FAZ (lado do banco do telegrama PUT/GET de ate 16 chaves):\n"
        "////    1) vidaET sobe a cada ~100 ms (prova ao 1515 que este PLC esta vivo).\n"
        "////    2) vida1515 parou por TempoPerdaMs (2 s < 3 s do 1515) -> ComOk=FALSE e TODAS as saidas vao a FALSE; cada chave so volta com novo comando (FALSE e TRUE).\n"
        "////    3) regra SB some -> CB cai (T = TempoRetornoMs = 2 s), falha TRAVADA, rearme so por novo comando; contator colado travado (fb_supervisaoChaves16).\n"
        "////    4) saida da contatora = Cmd E banco liberado E nao bloqueada E Permite. fbk = contato auxiliar REAL, nunca copia do comando.\n"
        "////    5) preenche o DB de competencia (liberado, contator geral, intertravamento, ventilador, chaveamento fisico, alarmes, vida).\n"
        "//// ESCRITOR UNICO : le o PEDIDO (Com.cmd, vida1515, ligarBanco, habPed, seq); escreve a RESPOSTA e o DB de competencia. Nunca escreve o PEDIDO.\n"
        "//// FALHA/SEGURANCA : sem comunicacao, intertravamento aberto ou 1o ciclo apos partida da CPU = nada liga. IntertravamentoOk nasce FALSE (estado seguro):\n"
        "////    ligar ao sinal REAL de emergencia/protecoes; em bancada sem esse sinal, ligar TRUE de forma explicita e consciente (carga de potencia DESACOPLADA).\n"
        "//// ASSUMIDO - A CONFIRMAR: UsaVentilador (decisao de projeto, BANC-1), tempos (2 s / 3 s), tipo da instancia de temporizador no firmware.\n"))
    t += '''   VAR_INPUT
      NumChaves          : Int;                 // chaves reais do banco (1..16)
      SeletoraEntrada    : Bool;                // entrada fisica: seletora do banco em Auto (1 = Auto)
      IntertravamentoOk  : Bool := FALSE;       // emergencia/protecoes do banco OK. Nasce FALSE = nada liga (estado seguro)
      UsaVentilador      : Bool := FALSE;       // TRUE = so libera com ventilador ok (BANC-1, decisao de projeto pendente)
      VentiladorOk       : Bool;                // entrada do ventilador (so vale se UsaVentilador)
      ContatorGeralAux   : Bool;                // retorno REAL do contator geral do banco (A PREENCHER; se nao existir, deixar FALSE)
      ChaveamentoFisicoV : Int;                 // 0 = nao sabe, 220, 380 ou 440 (A CONFIRMAR se existe sinal)
      TempoPerdaMs       : Time := T#2S;        // sem vida nova do 1515 por este tempo = comunicacao perdida (menor que os 3 s do 1515)
      TempoRetornoMs     : Int := 2000;         // T de verificacao do retorno SB (decisao do Reginaldo: 2 s)
   END_VAR
   VAR_OUTPUT
      ComOk              : Bool;
      BancoLiberado      : Bool;
   END_VAR
   VAR_IN_OUT
      Com                : "typeComBanco16";
      Compet             : "typeCompetenciaBanco";
      SaidaContatora     : Array[1..16] of Bool;   // saidas fisicas (copiadas pelo fc_chamadasBancosCarga)
      EntradaContatoAux  : Array[1..16] of Bool;   // contatos auxiliares fisicos
   END_VAR
   VAR
      _tOsc100ms   : TON_TIME;
      _tPerda      : TON_TIME;
      _sup         : "fb_supervisaoChaves16";      // supervisao do retorno SB (multi-instancia)
      _vida1515Ant : Int;
      _vidaMudou   : Bool;
      _bloq        : Array[1..16] of Bool;          // TRUE = caiu a comunicacao (ou partida); so solta com Cmd[i] = FALSE
      _partiu      : Bool;                            // FALSE no 1o ciclo apos partida
      _liberado    : Bool;
      _n           : Int;
      _algumaFalhaRet : Bool;
      _algumColado : Bool;
      i            : Int;
   END_VAR

BEGIN
   // 1) vida do PLC de cargas e do bloco de competencia (a cada ~100 ms)
   #_tOsc100ms(IN := NOT #_tOsc100ms.Q, PT := T#100MS);
   IF #_tOsc100ms.Q THEN
      #Com.vidaET := #Com.vidaET + 1;
      IF #Com.vidaET >= 32767 THEN #Com.vidaET := 0; END_IF;
      #Compet.vidaCompet := #Compet.vidaCompet + 1;
      IF #Compet.vidaCompet >= 32767 THEN #Compet.vidaCompet := 0; END_IF;
   END_IF;

   // 2) deteccao de perda de comunicacao: vida do 1515 parada por TempoPerdaMs
   IF #Com.vida1515 <> #_vida1515Ant THEN
      #_vida1515Ant := #Com.vida1515;
      #_vidaMudou := TRUE;
   ELSE
      #_vidaMudou := FALSE;
   END_IF;
   #_tPerda(IN := NOT #_vidaMudou, PT := #TempoPerdaMs);
   #ComOk := NOT #_tPerda.Q;

   #_n := #NumChaves;
   IF #_n < 0 THEN #_n := 0; END_IF;
   IF #_n > 16 THEN #_n := 16; END_IF;

   // 3) queda de comunicacao (ou 1o ciclo) TRAVA todas as chaves; cada uma so solta quando o 1515 manda Cmd = FALSE
   FOR #i := 1 TO 16 DO
      IF NOT #ComOk OR NOT #_partiu THEN
         #_bloq[#i] := TRUE;
      ELSIF NOT #Com.cmd[#i] THEN
         #_bloq[#i] := FALSE;
      END_IF;
   END_FOR;
   #_partiu := TRUE;

   // 4) banco liberado
   #_liberado := #ComOk AND #Com.ligarBanco AND #SeletoraEntrada AND #IntertravamentoOk AND (NOT #UsaVentilador OR #VentiladorOk);
   #BancoLiberado := #_liberado;
   #Com.seletoraAuto := #SeletoraEntrada;

   // 5) supervisao do retorno SB (SB some -> CB cai, T = 2 s) e habilitar/desabilitar com resposta e eco do seq
   #_sup(NumChaves := #_n, TempoRetornoMs := #TempoRetornoMs, ComOk := #ComOk, Seq := #Com.seq,
         Cmd := #Com.cmd, HabPed := #Com.habPed, SaidaQ := #SaidaContatora, AuxIn := #EntradaContatoAux,
         HabResp := #Com.habResp, FalhaRetorno := #Com.falhaRetorno, ContatorColado := #Com.contatorColado);
   #Com.eco := #_sup.Eco;

   // 6) saidas das contatoras e feedback REAL
   #_algumaFalhaRet := FALSE;
   #_algumColado := FALSE;
   FOR #i := 1 TO 16 DO
      IF #i <= #_n THEN
         #Com.fbk[#i] := #EntradaContatoAux[#i];
         IF #_liberado AND NOT #_bloq[#i] AND #_sup.Permite[#i] THEN
            #SaidaContatora[#i] := #Com.cmd[#i];
         ELSE
            #SaidaContatora[#i] := FALSE;
         END_IF;
         IF #Com.falhaRetorno[#i] THEN #_algumaFalhaRet := TRUE; END_IF;
         IF #Com.contatorColado[#i] THEN #_algumColado := TRUE; END_IF;
      ELSE
         #Com.fbk[#i] := FALSE;
         #SaidaContatora[#i] := FALSE;
      END_IF;
   END_FOR;

   // 7) DB de competencia (sinais do banco para o 1515)
   #Compet.bancoLiberado := #_liberado;
   #Compet.bancoLigadoFbk := #ContatorGeralAux;
   #Compet.intertravamentoOk := #IntertravamentoOk;
   #Compet.ventiladorOk := #VentiladorOk;
   #Compet.chaveamentoFisicoV := #ChaveamentoFisicoV;
   #Compet.alarmes.%X0 := NOT #ComOk;
   #Compet.alarmes.%X1 := #_algumaFalhaRet;
   #Compet.alarmes.%X2 := #_algumColado;
   #Compet.alarmes.%X3 := NOT #IntertravamentoOk;
   #Compet.alarmes.%X4 := #UsaVentilador AND NOT #VentiladorOk;
END_FUNCTION_BLOCK
'''
    grava('fb_bancoCarga16_v%s.scl' % VER, t)


# ---------------------------------------------------------------- FC de chamadas + tags
def fc_chamadas_e_tags():
    linhas = ['"tag";"banco";"funcao";"tipo";"endereco_fisico (A PREENCHER)";"observacao"']
    t = 'FUNCTION "fc_chamadasBancosCarga" : Void\nTITLE = fc_chamadasBancosCarga v%s\nAUTHOR : \'RegLobo\'\nVERSION : %s\n' % (VER, VER)
    t += CAB.format(nome='fc_chamadasBancosCarga', ver=VER, data=DATA, corpo=(
        "//// ONDE RODA : PLC de cargas. Chamar 1x por ciclo (OB1 ou OB de tempo fixo). Chama um fb_bancoCarga16 por banco e liga as E/S fisicas.\n"
        "//// ATENCAO : os TAGS fisicos abaixo (\"BC56_K01_Aux\" etc.) sao NOMES PROPOSTOS; os enderecos reais vem do programador (tabela tags_IO_1200_A_PREENCHER_v0.1.csv). Nao inventar endereco.\n"
        "//// Instancias (DB de instancia do FB): criar no TIA como \"dbNNNNi_<banco>_BancoCarga\" (numeros propostos: base + 6).\n"))
    t += '   VAR_TEMP\n'
    for b in BANCOS:
        t += '      saida%s : Array[1..16] of Bool;\n      aux%s : Array[1..16] of Bool;\n      comOk%s : Bool;\n      lib%s : Bool;\n      chav%s : Int;\n' % ((b['id'],) * 5)
    t += '   END_VAR\nBEGIN\n'
    for b in BANCOS:
        i, base, n = b['id'], b['base'], b['n']
        t += '\n   // ===== %s (%d chaves reais) =====\n' % (i, n)
        for k in range(1, n + 1):
            t += '   #aux%s[%d] := "%s_K%02d_Aux";\n' % (i, k, i, k)
            linhas.append('"%s_K%02d_Aux";"%s";"retorno (contato auxiliar) da contatora %d";"Bool entrada";"";""' % (i, k, i, k))
            linhas.append('"%s_K%02d_Saida";"%s";"saida da contatora %d";"Bool saida";"";""' % (i, k, i, k))
        t += ('   #chav%s := 0;\n   IF "%s_Chaveamento_380V" THEN #chav%s := 380; ELSIF "%s_Chaveamento_220V" THEN #chav%s := 220; ELSIF "%s_Chaveamento_440V" THEN #chav%s := 440; END_IF;   // A CONFIRMAR se existe sinal\n'
              % ((i,) + (i, i) * 3))
        t += ('   "db%d_%s_BancoCarga"(NumChaves := %d, SeletoraEntrada := "%s_Seletora_Auto", IntertravamentoOk := "%s_Intertravamento_Ok",\n'
              '        UsaVentilador := FALSE, VentiladorOk := "%s_Ventilador_Ok", ContatorGeralAux := "%s_ContatorGeral_Aux", ChaveamentoFisicoV := #chav%s,\n'
              '        ComOk => #comOk%s, BancoLiberado => #lib%s,\n'
              '        Com := "db%d_%s_Com".com, Compet := "db%d_%s_Competencia".compet, SaidaContatora := #saida%s, EntradaContatoAux := #aux%s);\n'
              % (base + 6, i, n, i, i, i, i, i, i, i, base + 7, i, base + 8, i, i, i))
        for k in range(1, n + 1):
            t += '   "%s_K%02d_Saida" := #saida%s[%d];\n' % (i, k, i, k)
        t += ('   // espelho local para a IHM: comando e feedback ao vivo (os bytes 4..199 chegam pelo PUT do 1515)\n'
              '   "db%d_%s_Chaves".cb.ligar := "db%d_%s_Com".com.cmd;\n   "db%d_%s_Chaves".sb.ligada := "db%d_%s_Com".com.fbk;\n' % (base, i, base + 7, i, base, i, base + 7, i))
        for tag, fn, tp in [('Seletora_Auto', 'seletora do banco em Auto (1 = Auto)', 'Bool entrada'), ('Intertravamento_Ok', 'emergencia/protecoes do banco OK', 'Bool entrada'),
                            ('Ventilador_Ok', 'ventilador ok (BANC-1; so vale se UsaVentilador)', 'Bool entrada'), ('ContatorGeral_Aux', 'retorno real do contator geral do banco', 'Bool entrada'),
                            ('Chaveamento_220V', 'chaveamento fisico 220 V (se existir sinal)', 'Bool entrada'), ('Chaveamento_380V', 'chaveamento fisico 380 V (se existir sinal)', 'Bool entrada'),
                            ('Chaveamento_440V', 'chaveamento fisico 440 V (se existir sinal)', 'Bool entrada')]:
            linhas.append('"%s_%s";"%s";"%s";"%s";"";"A CONFIRMAR se existe"' % (i, tag, i, fn, tp))
    t += 'END_FUNCTION\n'
    grava('fc_chamadasBancosCarga_v%s.scl' % VER, t)
    grava('tags_IO_1200_A_PREENCHER_v%s.csv' % VER, '\n'.join(linhas) + '\n')


# ---------------------------------------------------------------- lado do 1515: chamadas PUT/GET
def lado_1515():
    t = '// ============================================================================\n'
    t += '// chamadas_1515_PUTGET_para_1200 v%s (%s) - RASCUNHO, NAO compilado. Lado do 1515: aponta o FB101 v0.8 (telegrama rapido) e o FB104 (espelho/competencia) para o PLC de cargas 1200.\n' % (VER, DATA)
    t += '// O FB101 v0.8 NAO muda: so mudam os enderecos remotos e o ID da conexao. Substitui, em cada banco, os parametros RemotoCmd/RemotoFb/ID_Conexao da chamada atual (ver chamadas_BC56_v0.3.scl).\n'
    t += '// ID_Conexao: ID LOCAL da conexao S7 do 1515 para o PLC de cargas = W#16#0 (A PREENCHER: anotar o ID real criado no TIA). IP/rack/slot: nao ficam aqui (configuracao de hardware).\n'
    t += '// ============================================================================\n'
    for b in BANCOS:
        i, base = b['id'], b['base']
        t += ('\n// ---- %s ----\n"db%di_%s_ComEt200"(Hab := TRUE, ID_Conexao := W#16#0,   // A PREENCHER: ID da conexao S7 com o PLC de cargas\n'
              '    RemotoCmd := P#DB%d.DBX0.0 BYTE 10, RemotoFb := P#DB%d.DBX10.0 BYTE 14,   // era DB38/DB39/DB41 no ET200; agora o DB%d do PLC de cargas\n'
              '    /* demais parametros: iguais a chamadas_%s_v0.3.scl */ );\n' % (i, base + 5, i, base + 7, base + 7, base + 7, i))
        t += ('"db%di_%s_Com1200Espelho"(Hab := TRUE, ID_Conexao := W#16#0,   // A PREENCHER (a mesma conexao do FB101 pode ser dividida; um job por vez)\n'
              '    LocalEspelho := P#DB%d.DBX4.0 BYTE 196, RemotoEspelho := P#DB%d.DBX4.0 BYTE 196,   // PUT: copia de mao unica do DB de chaves (habilitada..rTeoricoOhm)\n'
              '    RemotoCompet := P#DB%d.DBX0.0 BYTE 8,   // GET: DB de competencia do banco\n'
              '    Compet := "db%d_%s_Competencia".compet);   // DB local de competencia no 1515 (mesmo numero e mesmo tipo)\n' % (base + 9, i, base, base, base + 8, base + 8, i))
    grava('chamadas_1515_PUTGET_para_1200_v%s.scl' % VER, t)
    f = '''FUNCTION_BLOCK "fb104_Com1200Espelho"
TITLE = fb104_Com1200Espelho v%s
AUTHOR : 'RegLobo'
VERSION : %s
''' % (VER, VER)
    f += CAB.format(nome='fb104_Com1200Espelho', ver=VER, data=DATA, corpo=(
        "//// ONDE RODA : 1515 (ensaio). 1 instancia por banco do PLC de cargas. Complementa o FB101 v0.8 (telegrama RAPIDO de comando, nao mexe nele).\n"
        "//// O QUE FAZ : a cada Pausa (padrao 1 s, LENTO de proposito): (1) PUT do espelho do DB de chaves (196 bytes, habilitada..rTeoricoOhm) para a IHM do 1200;\n"
        "////             (2) GET do DB de competencia do banco (8 bytes) para o DB local de competencia (mesmo numero e tipo no 1515).\n"
        "//// POR QUE SEPARADO : comando e seguranca ficam rapidos (~100 ms) e iguais ao ensaiado; dados que mudam devagar nao concorrem com eles na conexao.\n"
        "//// ESCRITOR UNICO : o espelho e escrito so pelo 1515; a competencia so pelo 1200. Um job PUT/GET por vez por conexao.\n"
        "//// ATENCAO : NAO compilado. CONFIRMAR no TIA: ponteiro absoluto P#DBn.DBX4.0 BYTE 196 como VARIANT em SD_1 (DB de origem NAO otimizado); limite ~212 bytes por job.\n"))
    f += '''   VAR_INPUT
      Hab : Bool;
      ID_Conexao : Word;
      LocalEspelho : Variant;      // P#DB<base>.DBX4.0 BYTE 196 (origem do PUT, no proprio DB de chaves)
      RemotoEspelho : Remote;      // P#DB<base>.DBX4.0 BYTE 196 (destino no PLC de cargas)
      RemotoCompet : Remote;       // P#DB<base+8>.DBX0.0 BYTE 8 (origem do GET)
      Pausa : Time := T#1S;
   END_VAR
   VAR_OUTPUT
      StatusPut : Word;
      StatusGet : Word;
      FalhaPut : Bool;
      FalhaGet : Bool;
      CompetOk : Bool;             // TRUE depois do 1o GET bem-sucedido
   END_VAR
   VAR_IN_OUT
      Compet : "typeCompetenciaBanco";
   END_VAR
   VAR
      statPut : PUT;
      statGet : GET;
      estado : Int;                // 0 inicia PUT, 1 aguarda PUT, 2 inicia GET, 3 aguarda GET, 4 pausa
      reqPut : Bool;
      reqGet : Bool;
      putDone : Bool;
      putError : Bool;
      getNdr : Bool;
      getError : Bool;
      rx : "typeCompetenciaBanco";
      tPausa : TON_TIME;
   END_VAR
BEGIN
   #statPut(REQ := #reqPut, ID := #ID_Conexao, DONE => #putDone, ERROR => #putError, STATUS => #StatusPut, ADDR_1 := #RemotoEspelho, SD_1 := #LocalEspelho);
   #statGet(REQ := #reqGet, ID := #ID_Conexao, NDR => #getNdr, ERROR => #getError, STATUS => #StatusGet, ADDR_1 := #RemotoCompet, RD_1 := #rx);
   IF NOT #Hab THEN
      #estado := 0; #reqPut := FALSE; #reqGet := FALSE; #CompetOk := FALSE;
   ELSE
      CASE #estado OF
         0: #reqPut := TRUE; #estado := 1;
         1: IF #putDone OR #putError THEN #FalhaPut := #putError; #reqPut := FALSE; #estado := 2; END_IF;
         2: #reqGet := TRUE; #estado := 3;
         3: IF #getNdr OR #getError THEN
               #FalhaGet := #getError;
               IF #getNdr THEN #Compet := #rx; #CompetOk := TRUE; END_IF;   // so atualiza o DB local com leitura valida
               #reqGet := FALSE; #estado := 4;
            END_IF;
         4: #tPausa(IN := TRUE, PT := #Pausa);
            IF #tPausa.Q THEN #tPausa(IN := FALSE, PT := #Pausa); #estado := 0; END_IF;
      END_CASE;
   END_IF;
END_FUNCTION_BLOCK
'''
    grava('fb104_Com1200Espelho_v%s.scl' % VER, f)


if __name__ == '__main__':
    os.makedirs(SAIDA, exist_ok=True)
    tipos(); dbs(); fb_supervisao(); fb_banco(); fc_chamadas_e_tags(); lado_1515()
