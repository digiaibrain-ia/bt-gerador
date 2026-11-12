#!/usr/bin/env python3
"""12/11/2026 - entrega 1200 v0.16 = v0.15 + REPASSE DO DB2000 (DSE) do 1515 para o PLC de Carga (so as grandezas da tela do operador, para o WinCC do programador).
Decisao do Reginaldo (12/11): 1 PUT dos bytes 0..135 (136 B) do db2000_BancoTeste2_DSE; MESMO numero (2000) e MESMOS offsets nos dois PLCs; o DB2000 fica no 1515 (Node-RED grava so la);
no 1200 o DB e so leitura (escrito apenas pelo PUT). Numeracao pelo plano v7.x: FB104 (proximo livre; 102/103 reservados p/ 32 chaves), instancia db2001i_DSE_PutCarga (faixa 2000-2099).
Confere por script os offsets do DB contra a lista REAIS do fluxo cliente-156-dse-plc-carga-v3. Nao sobrescreve. RASCUNHO, nao compilado."""
import os, shutil, json, re
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); V15, V16 = os.path.join(R, 'entrega_1200_v0.15'), os.path.join(R, 'entrega_1200_v0.16')
assert os.path.exists(V15) and not os.path.exists(V16)
# --- layout do DB2000 (bytes 0..135), igual ao do 1515 / vartable do fluxo ---
fl = json.load(open(os.path.join(R, '..', '..', 'nodered', 'flows', 'bt2', 'cliente-156-dse-plc-carga-v3.json'), encoding='utf-8'))
fn = [n for n in fl if n.get('name') == 'mapeia JSON -> DB2000'][0]['func']
REAIS = json.loads(re.search(r'const REAIS = (\[[^\]]*\])', fn).group(1))
campos = [('bitsStatus', 'Byte', 0, 'bit0 leituraOk, bit1 http200, bit2 automatico, bit3 dadosAntigos, bit4 servidorOnline'),
          ('bitsAlarmes', 'Byte', 1, 'bit0 temAlarme, bit1 aviso, bit2 desligamento, bit3 tripEletrico, bit4 desligamentoControlado'),
          ('bitsLeds', 'Byte', 2, 'bit0 STOP, bit1 MANUAL, bit2 TESTE, bit3 AUTO, bit4 disjuntorGerador, bit5 geradorDisponivel'),
          ('bitsSaidas', 'Byte', 3, 'bit0 saidaCombustivel, bit1 saidaPartida, bit2 falhaEcu'),
          ('modoCodigo', 'Int', 4, ''), ('idadeSegundos', 'Int', 6, 'idade do dado do DSE [s]'), ('seletor', 'Int', 8, ''), ('errosConsecutivos', 'Int', 10, ''),
          ('heartbeat', 'DInt', 12, 'soma 1 a cada resposta processada pelo Node-RED; se PARAR de mudar, o dado esta desatualizado'),
          ('horasMotorSegundos', 'DInt', 16, '[s]'), ('partidas', 'DInt', 20, ''), ('qtdNulos', 'Int', 24, ''), ('qtdAlarmes', 'Int', 26, '')]
campos += [(k, 'Real', 28 + 4 * i, '') for i, k in enumerate(REAIS[:27])]
TAM = {'Byte': 1, 'Int': 2, 'DInt': 4, 'Real': 4}
pos = 0
for nome, tp, off, _ in campos:   # confere: sem buraco, sem sobreposicao, alinhamento par fora de Byte (DB sem otimizacao)
    if tp != 'Byte' and pos % 2: pos += 1
    assert pos == off, (nome, pos, off); pos += TAM[tp]
assert pos == 136 and REAIS[26] == 'bateria' and campos[-1][2] == 132, pos
for k, o in (('tensaoL1L2', 28), ('correnteL1', 60), ('rpm', 80), ('kw', 84), ('percCarga', 100), ('tempAguaC', 128), ('bateria', 132)): assert dict((c[0], c[2]) for c in campos)[k] == o, k
shutil.copytree(V15, V16); d12, d15 = os.path.join(V16, 'PLC_CARGA_1200'), os.path.join(V16, 'PLC_1515')
db = 'DATA_BLOCK "db2000_BancoTeste2_DSE"\nTITLE = db2000_BancoTeste2_DSE v0.1 (DB2000) - copia no PLC de Carga\n{ S7_Optimized_Access := \'FALSE\' }\nAUTHOR : \'RegLobo\'\nVERSION : 0.1\nNON_RETAIN\n'
db += ('////====================================\n//// db2000_BancoTeste2_DSE (DB2000) v0.1 - RASCUNHO. COPIA SO DE LEITURA das grandezas do DSE para a tela (WinCC) do PLC de Carga. 136 bytes (DBB0..DBB135).\n'
       '//// MESMO numero e MESMOS offsets do DB2000 do 1515 (o Node-RED grava so la; o 1515 repassa por PUT P#DB2000.DBX0.0 BYTE 136). Escritor unico: o PUT do 1515. NAO escreva neste DB.\n'
       '//// Dado desatualizado: se "heartbeat" parar de mudar (ex.: 5 s), a tela deve avisar. Grandezas do card do operador: percCarga, tensaoL1L2/L2L3/L3L1, correnteL1/L2/L3, kw, tempAguaC, rpm, bateria.\n'
       '////====================================\n   STRUCT\n')
for nome, tp, off, com in campos: db += '      %s : %s;   // DBB%d%s\n' % (nome, tp, off, (' - ' + com) if com else '')
db += '   END_STRUCT;\nBEGIN\nEND_DATA_BLOCK\n'
open(os.path.join(d12, 'db2000_BancoTeste2_DSE_v0.1.scl'), 'w', encoding='utf-8').write(db)
fb = '''FUNCTION_BLOCK "fb104_putDseCarga"
TITLE = fb104_putDseCarga v0.1 (FB104)
{ S7_Optimized_Access := 'FALSE' }
AUTHOR : 'Reginaldo Lobo'
VERSION : 0.1
////====================================
//// fb104_putDseCarga (FB104) v0.1 (12/11/2026) - RASCUNHO, nao compilado. Lado do 1515: repassa as grandezas do DSE (DB2000, bytes 0..135) ao PLC de Carga por PUT, ciclico.
//// SO INFORMACAO PARA A TELA (WinCC): NAO e comando. Falha deste PUT nao pode afetar as contatoras (o telegrama dos bancos e outro FB e outro DB).
//// DB2000: o Node-RED grava so no 1515; este FB so le e envia. No PLC de Carga o db2000_BancoTeste2_DSE tem o MESMO numero e os mesmos offsets (somente leitura).
//// INSTANCIA : db2001i_DSE_PutCarga (DB2001, faixa 2000-2099 do plano). CHAMAR 1x por ciclo no OB ciclico (ver chamadas_DSE_v0.1.scl).
//// CONEXAO   : ID_Conexao pode ser o MESMO do telegrama dos bancos ou outro. CONFERIR no TIA se a conexao aceita 3 jobs de PUT/GET ao mesmo tempo; se nao aceitar, use uma 2a conexao S7.
//// CONFERIR no TIA: passar Origem (VARIANT) adiante para o SD_1 do PUT; ponteiro absoluto P#DB2000.DBX0.0 BYTE 136 no 1515 (DB2000 sem acesso otimizado).
////====================================
   VAR_INPUT
      Hab : Bool;   // TRUE = envia; FALSE = para
      ID_Conexao : Word;   // ID local da conexao S7 do 1515 com o PLC de Carga (a PREENCHER no TIA)
      Remoto : Remote;   // destino no PLC de Carga: P#DB2000.DBX0.0 BYTE 136
      Origem : Variant;   // origem no 1515: P#DB2000.DBX0.0 BYTE 136
      Pausa : Time := T#1S;   // intervalo entre PUTs (o Node-RED atualiza a cada 1 a 2 s)
   END_VAR
   VAR_OUTPUT
      StatusPut : Word;   // ultimo STATUS do PUT (0 = ok)
      FalhaPut : Bool;   // ultimo PUT terminou com ERROR
   END_VAR
   VAR
      statPut : PUT;   // multi-instancia do PUT
      estado : Int;   // 0 dispara o PUT, 1 aguarda DONE/ERROR, 2 pausa
      reqPut : Bool;
      putDone : Bool;
      putError : Bool;
      tPausa : TON_TIME;
   END_VAR
BEGIN
   REGION "1) Chamada da instrucao PUT"
      #statPut(REQ := #reqPut, ID := #ID_Conexao, DONE => #putDone, ERROR => #putError, STATUS => #StatusPut, ADDR_1 := #Remoto, SD_1 := #Origem);
   END_REGION
   REGION "2) Maquina de estados PUT -> pausa"
      IF NOT #Hab THEN
         #estado := 0;
         #reqPut := FALSE;
      ELSE
         CASE #estado OF
            0:
               #reqPut := TRUE;
               #estado := 1;
            1:
               IF #putDone OR #putError THEN
                  #FalhaPut := #putError;
                  #reqPut := FALSE;
                  #estado := 2;
               END_IF;
            2:
               IF #tPausa.Q THEN
                  #estado := 0;
               END_IF;
         END_CASE;
      END_IF;
      #tPausa(IN := #Hab AND (#estado = 2), PT := #Pausa);
   END_REGION
END_FUNCTION_BLOCK
'''
open(os.path.join(d15, 'fb104_putDseCarga_v0.1.scl'), 'w', encoding='utf-8').write(fb)
open(os.path.join(d15, 'chamadas_DSE_v0.1.scl'), 'w', encoding='utf-8').write('''////====================================
//// chamadas_DSE_v0.1 (12/11/2026) - RASCUNHO. Chamada no OB ciclico do 1515 (1x por ciclo). A instancia db2001i_DSE_PutCarga (DB2001) e criada ao inserir a chamada (numero e nome manuais).
////====================================
"db2001i_DSE_PutCarga"(Hab := TRUE, ID_Conexao := W#16#0,   /* A PREENCHER: ID da conexao S7 com o PLC de Carga */
    Remoto := P#DB2000.DBX0.0 BYTE 136,   // destino no PLC de Carga (DB2000, mesmo numero)
    Origem := P#DB2000.DBX0.0 BYTE 136);   // origem no 1515 (DB2000)
''')
t = open(os.path.join(V16, 'COMO_USAR.txt'), encoding='utf-8').read().replace('entrega v0.15', 'entrega v0.16')
t = t.replace('  fb_supervisaoChaves16 ', '  db2000_BancoTeste2_DSE               COPIA SO DE LEITURA das grandezas do DSE (136 B) para a SUA tela (WinCC). O 1515 grava por PUT.\n  fb_supervisaoChaves16 ', 1)
t = t.replace('importe, um arquivo por vez, como FONTE EXTERNA, nesta ordem: db3007, db3107,', 'importe, um arquivo por vez, como FONTE EXTERNA, nesta ordem: db2000, db3007, db3107,')
t = t.replace(' 3. TAGS:', ''' 2b. DB2000: numero MANUAL 2000, sem "Acesso otimizado". Nao escreva nele (so o PUT do 1515). Para a tela use: percCarga (carga %), tensaoL1L2/L2L3/L3L1, correnteL1/L2/L3,
    kw, tempAguaC (agua), rpm, bateria. Status: bitsStatus.0 = leitura OK. DADO VELHO: se o campo heartbeat nao mudar por ~5 s, mostre "dados do DSE desatualizados".
 3. TAGS:''', 1)
t = t.replace('Pasta PLC_1515 = blocos do 1515 (quem carrega e o Reginaldo).', 'Pasta PLC_1515 = blocos do 1515 (quem carrega e o Reginaldo; inclui o fb104_putDseCarga que envia o DB2000 ao 1200).')
open(os.path.join(V16, 'COMO_USAR.txt'), 'w', encoding='utf-8').write(t)
print('ok', V16, '| REAIS conferidos:', len(REAIS))
