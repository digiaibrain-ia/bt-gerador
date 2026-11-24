#!/usr/bin/env python3
"""Acrescenta o BC59,5 (32 chaves, 18 reais) ao pacote do PLC de cargas 1200 - v0.2 RASCUNHO (09/11/2026). Nao compila no TIA aqui; nao toca producao.
DBs = mesmos numeros da 1500: 3200 espelho, 3206 instancia, 3207 telegrama rapido, 3208 competencia. Nao sobrescreve. Os arquivos v0.1 (BC56/BC400/BC550) nao mudam.
Uso: python3 plc/bt2/plc_carga_1200/gerador/gerar_plc_carga_1200_bc595_v0.2.py"""
import os, re
D = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
VER, DATA, N, BASE = '0.2', '09/11/2026', 18, 3200
CAB = ("////====================================\n//// {nome} v{ver} ({data}) - RASCUNHO, NAO compilado no TIA, NAO testado no PLC. Pacote plc_carga_1200 (S7-1200 real), BC59,5.\n{corpo}////====================================\n")


def grava(nome, t):
    p = os.path.join(D, nome); assert not os.path.exists(p), 'ja existe: ' + nome
    open(p, 'w', encoding='utf-8').write(t); print('gerado', nome)


def le(nome): return open(os.path.join(D, nome), encoding='utf-8').read()


def para32(t):
    t = re.sub(r'(Chaves|Banco|Carga)16', r'\g<1>32', t)
    return re.sub(r'\b16\b', '32', t)


def tipo():
    t = 'TYPE "typeComBanco32"\nTITLE = typeComBanco32 v%s\nVERSION : %s\n' % (VER, VER)
    t += CAB.format(nome='typeComBanco32', ver=VER, data=DATA, corpo=(
        "//// O QUE E : telegrama PEDIDO/RESPOSTA do BC59,5 (ate 32 chaves), 36 bytes. Mesmo desenho do typeComBanco16, so maior.\n"
        "//// PUT do 1515 : DBX0.0 BYTE 14 (PEDIDO)    GET do 1515 : DBX14.0 BYTE 22 (RESPOSTA)   -> fb103_ComEt200_32 v0.3 do 1515.\n"
        "//// ESCRITOR UNICO : PEDIDO so pelo PUT do 1515; RESPOSTA so pelo fb_bancoCarga32 (este PLC).\n"))
    t += ('   STRUCT\n      cmd : Array[1..32] of Bool;            // DBX0.0..3.7   PEDIDO\n      vida1515 : Int;                         // DBW4\n'
          '      ligarBanco : Bool;                      // DBX6.0\n      resPut : Byte;                          // DBB7\n      habPed : Array[1..32] of Bool;         // DBX8.0..11.7\n'
          '      seq : Int;                              // DBW12\n      fbk : Array[1..32] of Bool;            // DBX14.0..17.7 RESPOSTA\n      vidaET : Int;                           // DBW18\n'
          '      seletoraAuto : Bool;                    // DBX20.0\n      resGet : Byte;                          // DBB21\n      habResp : Array[1..32] of Bool;        // DBX22.0..25.7\n'
          '      eco : Int;                              // DBW26\n      falhaRetorno : Array[1..32] of Bool;   // DBX28.0..31.7\n      contatorColado : Array[1..32] of Bool; // DBX32.0..35.7\n'
          '   END_STRUCT;\nEND_TYPE\n')
    grava('tipos_ComBanco32_v%s.scl' % VER, t)


def dbs():
    b = BASE
    t = ('DATA_BLOCK "db%d_BC595_Com"\nTITLE = db%d_BC595_Com v%s (DB%d)\n{ S7_Optimized_Access := \'FALSE\' }\nAUTHOR : \'RegLobo\'\nVERSION : %s\nNON_RETAIN\n' % (b + 7, b + 7, VER, b + 7, VER))
    t += CAB.format(nome='db%d_BC595_Com' % (b + 7), ver=VER, data=DATA, corpo="//// Telegrama rapido do BC59,5 (36 bytes). PUT do 1515: P#DB%d.DBX0.0 BYTE 14   GET: P#DB%d.DBX14.0 BYTE 22.\n" % (b + 7, b + 7))
    t += '   VAR\n      com : "typeComBanco32";\n   END_VAR\nBEGIN\nEND_DATA_BLOCK\n\n'
    t += ('DATA_BLOCK "db%d_BC595_Competencia"\nTITLE = db%d_BC595_Competencia v%s (DB%d)\n{ S7_Optimized_Access := \'FALSE\' }\nAUTHOR : \'RegLobo\'\nVERSION : %s\nNON_RETAIN\n' % (b + 8, b + 8, VER, b + 8, VER))
    t += CAB.format(nome='db%d_BC595_Competencia' % (b + 8), ver=VER, data=DATA, corpo="//// Competencia do BC59,5 (8 bytes, mesmo tipo dos outros bancos). GET do 1515: P#DB%d.DBX0.0 BYTE 8.\n" % (b + 8))
    t += '   VAR\n      compet : "typeCompetenciaBanco";\n   END_VAR\nBEGIN\nEND_DATA_BLOCK\n\n'
    t += ('DATA_BLOCK "db%d_BC595_Chaves"\nTITLE = db%d_BC595_Chaves v%s (DB%d) ESPELHO\n{ S7_Optimized_Access := \'FALSE\' }\nAUTHOR : \'RegLobo\'\nVERSION : %s\nNON_RETAIN\n' % (b, b, VER, b, VER))
    t += CAB.format(nome='db%d_BC595_Chaves ESPELHO' % b, ver=VER, data=DATA, corpo=(
        "//// Copia de mao unica do DB do 1515 (mesmos offsets do db3200_BC595_Chaves v0.3), so para a IHM. NAO e usada no controle.\n"
        "////   bytes 0..7 (cb, sb): preenchidos AQUI a partir do DB%d. bytes 8..399 (392 B) chegam por TRES PUTs do 1515 (limite ~212 B por job):\n"
        "////   PUT1 8..143 (habilitada, setupOk, kwReal = 136 B)  PUT2 144..271 (rMedidoOhm = 128 B)  PUT3 272..399 (rTeoricoOhm = 128 B).\n" % (b + 7)))
    t += ('   VAR\n      cb : Struct\n         ligar : Array[1..32] of Bool;   // X0.0\n      END_STRUCT;\n      sb : Struct\n         ligada : Array[1..32] of Bool;   // X4.0\n      END_STRUCT;\n'
          '      setup : Struct\n         habilitada : Array[1..32] of Bool;    // X8.0   (PUT1)\n         setupOk : Array[1..32] of Bool;       // X12.0  (PUT1)\n'
          '         kwReal : Array[1..32] of Real;        // D16    (PUT1)\n         rMedidoOhm : Array[1..32] of Real;    // D144   (PUT2)\n         rTeoricoOhm : Array[1..32] of Real;   // D272   (PUT3)\n'
          '      END_STRUCT;\n   END_VAR\nBEGIN\nEND_DATA_BLOCK\n')
    grava('dbs_Banco595_v%s.scl' % VER, t)


def fbs():
    s = para32(le('fb_supervisaoChaves16_1200_v0.1.scl'))
    s = s.replace('TITLE = fb_supervisaoChaves32 v0.2 (1200)', 'TITLE = fb_supervisaoChaves32 v0.2 (1200, 32 chaves)')
    grava('fb_supervisaoChaves32_1200_v%s.scl' % VER, '//// [v0.2 09/11/2026] Versao de 32 chaves (BC59,5), gerada da de 16 trocando so o tamanho dos vetores/lacos. Logica igual.\n' + s)
    b = para32(le('fb_bancoCarga16_v0.1.scl'))
    b = b.replace('TITLE = fb_bancoCarga32 v0.1', 'TITLE = fb_bancoCarga32 v0.2').replace('VERSION : 0.1', 'VERSION : %s' % VER, 1)
    b = b.replace('fb_supervisaoChaves32"', 'fb_supervisaoChaves32"')
    grava('fb_bancoCarga32_v%s.scl' % VER, '//// [v0.2 09/11/2026] Versao de 32 chaves (BC59,5) do fb_bancoCarga16. Logica igual; VENTILADOR NAO MONITORADO (decisao Reginaldo 09/11): deixar UsaVentilador = FALSE.\n' + b)


def fc_tags():
    i, b, n = 'BC595', BASE, N
    linhas = ['"tag";"banco";"funcao";"tipo";"endereco_fisico (A PREENCHER)";"observacao"']
    t = 'FUNCTION "fc_chamadasBanco595" : Void\nTITLE = fc_chamadasBanco595 v%s\nAUTHOR : \'RegLobo\'\nVERSION : %s\n' % (VER, VER)
    t += CAB.format(nome='fc_chamadasBanco595', ver=VER, data=DATA, corpo="//// Chamar 1x por ciclo, junto do fc_chamadasBancosCarga. Tags fisicos sao NOMES PROPOSTOS; o programador ajusta (enderecos nao sao da nossa conta).\n")
    t += '   VAR_TEMP\n      saida : Array[1..32] of Bool;\n      aux : Array[1..32] of Bool;\n      comOk : Bool;\n      lib : Bool;\n   END_VAR\nBEGIN\n'
    for k in range(1, 33):
        t += '   #aux[%d] := %s;\n' % (k, '"BC595_K%02d_Aux"' % k if k <= n else 'FALSE')
    for k in range(1, n + 1):
        linhas.append('"BC595_K%02d_Aux";"BC595";"retorno da contatora %d";"Bool entrada";"";""' % (k, k))
        linhas.append('"BC595_K%02d_Saida";"BC595";"saida da contatora %d";"Bool saida";"";""' % (k, k))
    t += ('   "db%d_BC595_BancoCarga"(NumChaves := %d, SeletoraEntrada := "BC595_Seletora_Auto", IntertravamentoOk := "BC595_Intertravamento_Ok",\n'
          '        UsaVentilador := FALSE, VentiladorOk := FALSE, ContatorGeralAux := FALSE, ChaveamentoFisicoV := 0,   // ventilador, contator geral e chaveamento: nao monitorados agora (futuro, DB de competencia)\n'
          '        ComOk => #comOk, BancoLiberado => #lib, Com := "db%d_BC595_Com".com, Compet := "db%d_BC595_Competencia".compet,\n'
          '        SaidaContatora := #saida, EntradaContatoAux := #aux);\n' % (b + 6, n, b + 7, b + 8))
    for k in range(1, n + 1):
        t += '   "BC595_K%02d_Saida" := #saida[%d];\n' % (k, k)
    t += '   "db%d_BC595_Chaves".cb.ligar := "db%d_BC595_Com".com.cmd;\n   "db%d_BC595_Chaves".sb.ligada := "db%d_BC595_Com".com.fbk;\nEND_FUNCTION\n' % (b, b + 7, b, b + 7)
    linhas += ['"BC595_Seletora_Auto";"BC595";"seletora do banco em Auto (1 = Auto)";"Bool entrada";"";""', '"BC595_Intertravamento_Ok";"BC595";"emergencia/protecoes do banco OK";"Bool entrada";"";"ate existir, TRUE explicito so em bancada DESACOPLADA"']
    grava('fc_chamadasBanco595_v%s.scl' % VER, t)
    grava('tags_IO_1200_BC595_A_PREENCHER_v%s.csv' % VER, '\n'.join(linhas) + '\n')


def espelho_1515():
    b = BASE
    f = 'FUNCTION_BLOCK "fb105_Com1200Espelho32"\nTITLE = fb105_Com1200Espelho32 v%s\nAUTHOR : \'RegLobo\'\nVERSION : %s\n' % (VER, VER)
    f += CAB.format(nome='fb105_Com1200Espelho32', ver=VER, data=DATA, corpo=(
        "//// ONDE RODA : 1515. Para o BC59,5 (32 chaves). Igual ao fb104, mas o espelho (392 B) vai em TRES PUTs em sequencia + 1 GET da competencia, a cada Pausa (1 s).\n"
        "//// PUT1 8..143  PUT2 144..271  PUT3 272..399 (ADDR/SD de cada um passados pela chamada). Um job por vez na conexao. NAO compilado; ponteiro absoluto como VARIANT a confirmar.\n"))
    f += '''   VAR_INPUT
      Hab : Bool;
      ID_Conexao : Word;
      Local1 : Variant;  Remoto1 : Remote;     // P#DB3200.DBX8.0 BYTE 136
      Local2 : Variant;  Remoto2 : Remote;     // P#DB3200.DBX144.0 BYTE 128
      Local3 : Variant;  Remoto3 : Remote;     // P#DB3200.DBX272.0 BYTE 128
      RemotoCompet : Remote;                   // P#DB3208.DBX0.0 BYTE 8
      Pausa : Time := T#1S;
   END_VAR
   VAR_OUTPUT
      Falha : Bool;
      CompetOk : Bool;
   END_VAR
   VAR_IN_OUT
      Compet : "typeCompetenciaBanco";
   END_VAR
   VAR
      p1 : PUT; p2 : PUT; p3 : PUT; g : GET;
      r1 : Bool; r2 : Bool; r3 : Bool; rg : Bool;
      d1 : Bool; e1 : Bool; d2 : Bool; e2 : Bool; d3 : Bool; e3 : Bool; ndr : Bool; eg : Bool;
      st1 : Word; st2 : Word; st3 : Word; stg : Word;
      estado : Int;
      rx : "typeCompetenciaBanco";
      tPausa : TON_TIME;
   END_VAR
BEGIN
   #p1(REQ := #r1, ID := #ID_Conexao, DONE => #d1, ERROR => #e1, STATUS => #st1, ADDR_1 := #Remoto1, SD_1 := #Local1);
   #p2(REQ := #r2, ID := #ID_Conexao, DONE => #d2, ERROR => #e2, STATUS => #st2, ADDR_1 := #Remoto2, SD_1 := #Local2);
   #p3(REQ := #r3, ID := #ID_Conexao, DONE => #d3, ERROR => #e3, STATUS => #st3, ADDR_1 := #Remoto3, SD_1 := #Local3);
   #g(REQ := #rg, ID := #ID_Conexao, NDR => #ndr, ERROR => #eg, STATUS => #stg, ADDR_1 := #RemotoCompet, RD_1 := #rx);
   IF NOT #Hab THEN
      #estado := 0; #r1 := FALSE; #r2 := FALSE; #r3 := FALSE; #rg := FALSE; #CompetOk := FALSE;
   ELSE
      CASE #estado OF
         0: #r1 := TRUE; #estado := 1;
         1: IF #d1 OR #e1 THEN #Falha := #e1; #r1 := FALSE; #estado := 2; END_IF;
         2: #r2 := TRUE; #estado := 3;
         3: IF #d2 OR #e2 THEN #Falha := #Falha OR #e2; #r2 := FALSE; #estado := 4; END_IF;
         4: #r3 := TRUE; #estado := 5;
         5: IF #d3 OR #e3 THEN #Falha := #Falha OR #e3; #r3 := FALSE; #estado := 6; END_IF;
         6: #rg := TRUE; #estado := 7;
         7: IF #ndr OR #eg THEN
               #Falha := #Falha OR #eg;
               IF #ndr THEN #Compet := #rx; #CompetOk := TRUE; END_IF;
               #rg := FALSE; #estado := 8;
            END_IF;
         8: #tPausa(IN := TRUE, PT := #Pausa);
            IF #tPausa.Q THEN #tPausa(IN := FALSE, PT := #Pausa); #estado := 0; END_IF;
      END_CASE;
   END_IF;
END_FUNCTION_BLOCK
'''
    grava('fb105_Com1200Espelho32_v%s.scl' % VER, f)
    c = ('// chamadas_1515_PUTGET_BC595 v%s (%s) - RASCUNHO. Lado do 1515 para o BC59,5. Telegrama rapido: ver chamadas_BC595_v0.3.scl (fb103 v0.3, P#DB%d.DBX0.0 BYTE 14 / DBX14.0 BYTE 22).\n'
         '"db%di_BC595_Com1200Espelho"(Hab := TRUE, ID_Conexao := W#16#0,   // A PREENCHER (pode ser a mesma conexao do FB103; um job por vez)\n'
         '    Local1 := P#DB%d.DBX8.0 BYTE 136,   Remoto1 := P#DB%d.DBX8.0 BYTE 136,\n'
         '    Local2 := P#DB%d.DBX144.0 BYTE 128, Remoto2 := P#DB%d.DBX144.0 BYTE 128,\n'
         '    Local3 := P#DB%d.DBX272.0 BYTE 128, Remoto3 := P#DB%d.DBX272.0 BYTE 128,\n'
         '    RemotoCompet := P#DB%d.DBX0.0 BYTE 8, Compet := "db%d_BC595_Competencia".compet);\n'
         % (VER, DATA, b + 7, b + 9, b, b, b, b, b, b, b + 8, b + 8))
    grava('chamadas_1515_PUTGET_BC595_para_1200_v%s.scl' % VER, c)


if __name__ == '__main__':
    tipo(); dbs(); fbs(); fc_tags(); espelho_1515()
