#!/usr/bin/env python3
"""17/11/2026 - entrega 1200 v0.17 = v0.16 + (a) PADRAO DE COMENTARIOS MARCADOS //[F] funcionamento e //[M] montagem no TIA,
(b) blocos atualizados com o que foi validado no ET200 (fb_bancosEt200 v0.2 / fc v0.7): wrapper FB com STAT, FC so organiza, DB de instancia pronto (.db),
    "Ligar Banco" com ComOk + trava apos queda, 1 chamada por ciclo, acesso simbolico ao DB do telegrama (sem PEEK/POKE, que nunca foi provado).
Nao sobrescreve a v0.16. Nao altera o ET200. RASCUNHO, nao compilado no TIA."""
import os, shutil
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
V16, V17 = os.path.join(R, 'entrega_1200_v0.16'), os.path.join(R, 'entrega_1200_v0.17')
assert os.path.exists(V16) and not os.path.exists(V17)
shutil.copytree(V16, V17)
D = os.path.join(V17, 'PLC_CARGA_1200')
for f in os.listdir(D): os.remove(os.path.join(D, f))   # recria so os blocos novos (nomes com a versao nova)
def w(nome, txt, bom=False, crlf=False):
    txt = txt.replace('// [F]', '//[F]').replace('// [M]', '//[M]')   # grafia unica da etiqueta (facilita o Localizar do TIA)
    if crlf: txt = txt.replace('\n', '\r\n')
    open(os.path.join(D, nome), 'w', encoding='utf-8-sig' if bom else 'utf-8', newline='').write(txt)

LEGENDA = '''//[F]==============================================================
//[F] LEGENDA: //[F] (barra =====) = FUNCIONAMENTO: o que o codigo faz e por que.
//[M]--------------------------------------------------------------
//[M] LEGENDA: //[M] (barra -----) = MONTAGEM NO TIA: como importar, numerar, ligar tags.
//[F]==============================================================
'''

# ------------------------------------------------------------------ DBs de telegrama
def db_com(num, banco, nome):
    return '''DATA_BLOCK "%(nome)s"
TITLE = %(nome)s v0.13 (DB%(num)s)
{ S7_Optimized_Access := 'FALSE' }
AUTHOR : 'RegLobo'
VERSION : 0.6
NON_RETAIN
''' % dict(nome=nome, num=num) + LEGENDA + '''//[F]==============================================================
//[F] FUNCIONAMENTO - Telegrama PEDIDO/RESPOSTA do %(banco)s (24 bytes, ate 16 chaves). E a "caixa de correio" entre o 1515 e este PLC.
//[F]   PEDIDO   (bytes 0..9)  : o 1515 ESCREVE por PUT: cmd (comando de cada chave), vida1515 (contador de vida), ligarBanco, habPed, seq.
//[F]   RESPOSTA (bytes 10..23): este PLC ESCREVE (fb_bancoCarga16) e o 1515 LE por GET: fbk (contato auxiliar), vidaET, seletoraAuto, habResp, eco, falhaRetorno, contatorColado.
//[F]   ESCRITOR UNICO: o PEDIDO so muda pelo PUT do 1515; a RESPOSTA so muda pelo fb_bancoCarga16. Ninguem mais escreve (nem WinCC, nem outro FC).
//[F]   Mesmo layout do ComBC do ET200 (db38/db39): o 1515 usa o mesmo FB de comunicacao para os dois PLCs.
//[M]--------------------------------------------------------------
//[M] MONTAGEM NO TIA - 1) Importar como FONTE EXTERNA ANTES do fb_bancoCarga16 (ele acessa estes campos pelo nome).
//[M]   2) Numero MANUAL %(num)s: botao direito no DB > Propriedades > Geral > Numero. O 1515 acessa por P#DB%(num)s (PUT ...DBX0.0 BYTE 10 | GET ...DBX10.0 BYTE 14).
//[M]   3) SEM "Acesso otimizado" (atributo S7_Optimized_Access := FALSE ja vem no arquivo; confira nas Propriedades). Com otimizado o ponteiro P# do 1515 nao funciona.
//[M]   4) NAO escreva neste DB. Para depurar, use tabela de observacao so em modo leitura.
//[M]--------------------------------------------------------------
   STRUCT
      cmd : Array[1..16] of Bool;            // [F] PEDIDO: comando de cada chave (1 = ligar). Byte 0..1
      vida1515 : Int;                        // [F] PEDIDO: contador que o 1515 incrementa; parou de mudar por 2 s = comunicacao perdida
      ligarBanco : Bool;                     // [F] PEDIDO: comando "Ligar banco" (habilita o banco inteiro)
      resPut : Byte;                         // [F] reservado (alinhamento)
      habPed : Array[1..16] of Bool;         // [F] PEDIDO: habilitar (1) / desabilitar (0) cada chave
      seq : Int;                             // [F] PEDIDO: numero do pacote; este PLC devolve o mesmo valor em "eco"
      fbk : Array[1..16] of Bool;            // [F] RESPOSTA: contato auxiliar REAL de cada contatora
      vidaET : Int;                          // [F] RESPOSTA: contador de vida deste PLC (+1 a cada ~100 ms); o 1515 confere que muda
      seletoraAuto : Bool;                   // [F] RESPOSTA: seletora fisica do banco em Auto
      resGet : Byte;                         // [F] reservado (alinhamento)
      habResp : Array[1..16] of Bool;        // [F] RESPOSTA: habilitacao realmente aplicada
      eco : Int;                             // [F] RESPOSTA: copia de seq (o 1515 confere que o pacote foi tratado)
      falhaRetorno : Array[1..16] of Bool;   // [F] RESPOSTA: saida ligada e contato auxiliar sem voltar por 2 s (travada)
      contatorColado : Array[1..16] of Bool; // [F] RESPOSTA: saida desligada e contato auxiliar ligado por 2 s (travado)
   END_STRUCT;
BEGIN
END_DATA_BLOCK
''' % dict(num=num, banco=banco)
w('db3007_BC56_Com_v0.13.scl', db_com(3007, 'BC56', 'db3007_BC56_Com'))
w('db3107_BC400_Com_v0.13.scl', db_com(3107, 'BC400', 'db3107_BC400_Com'))

# ------------------------------------------------------------------ DB2000 (so comentarios novos; layout igual)
old = open(os.path.join(V16, 'PLC_CARGA_1200', 'db2000_BancoTeste2_DSE_v0.1.scl'), encoding='utf-8').read()
corpo = old[old.index('   STRUCT'):]
corpo = corpo.replace('//', '// [F]').replace('// [F] [F]', '// [F]')
cab = '''DATA_BLOCK "db2000_BancoTeste2_DSE"
TITLE = db2000_BancoTeste2_DSE v0.2 (DB2000) - copia no PLC de Carga
{ S7_Optimized_Access := 'FALSE' }
AUTHOR : 'RegLobo'
VERSION : 0.2
NON_RETAIN
''' + LEGENDA + '''//[F]==============================================================
//[F] FUNCIONAMENTO - COPIA SO DE LEITURA das grandezas do DSE (136 bytes, DBB0..DBB135) para a tela (WinCC) do PLC de Carga.
//[F]   O Node-RED grava o DB2000 no 1515; o fb104_putDseCarga do 1515 envia por PUT. Aqui so chega. MESMO numero e MESMOS offsets nos dois PLCs.
//[F]   Dado desatualizado: se "heartbeat" parar de mudar por ~5 s, a tela deve mostrar "dados do DSE desatualizados". bitsStatus.0 = leitura OK.
//[F]   Grandezas do card do operador: percCarga, tensaoL1L2/L2L3/L3L1, correnteL1/L2/L3, kw, tempAguaC, rpm, bateria.
//[M]--------------------------------------------------------------
//[M] MONTAGEM NO TIA - numero MANUAL 2000, SEM "Acesso otimizado". NAO escreva neste DB (so o PUT do 1515). Use os campos na tela WinCC apenas como leitura.
//[M]--------------------------------------------------------------
'''
w('db2000_BancoTeste2_DSE_v0.2.scl', cab + corpo)

# ------------------------------------------------------------------ fb_supervisaoChaves16
old = open(os.path.join(V16, 'PLC_CARGA_1200', 'fb_supervisaoChaves16_v0.8.scl'), encoding='utf-8').read()
body = old[old.index('BEGIN'):]
sup_head = '''FUNCTION_BLOCK "fb_supervisaoChaves16"
TITLE = fb_supervisaoChaves16 v0.9 (1200)
AUTHOR : 'RegLobo'
VERSION : 0.6
''' + LEGENDA + '''//[F]==============================================================
//[F] FUNCIONAMENTO - RASCUNHO v0.9 (17/11/2026), nao compilado. Logica IGUAL a v0.8 (so comentarios novos). 1 instancia por banco, 1x por ciclo.
//[F] POR QUE EXISTE (bancada de 06/11/2026): com o retorno (contato auxiliar, SB) bloqueado o comando (CB) ficou em 1; ao voltar o SB a chave LIGOU SOZINHA.
//[F]   Regra do Reginaldo: SB some -> CB cai, tempo de verificacao T = 2 s, falha TRAVADA ate novo comando.
//[F] O QUE FAZ, por chave (1..NumChaves):
//[F]   1) FALHA DE RETORNO : saida energizada (SaidaQ=1) e contato auxiliar (AuxIn) em 0 por T -> FalhaRetorno=1 (TRAVADA) e Permite=0.
//[F]   2) CONTATOR COLADO  : saida em 0 e contato auxiliar em 1 por T -> ContatorColado=1 (TRAVADO), Permite=0.
//[F]   3) REARME so por novo comando: borda de subida de Cmd com AuxIn=0. Nunca rearma sozinho quando o SB volta.
//[F]   4) HABILITAR/DESABILITAR (pedido/resposta): HabResp = copia de HabPed (so com ComOk); chave desabilitada tem Permite=0.
//[F]   5) Eco := Seq (o 1515 confere que o pacote foi tratado). Sem ComOk: HabResp=0, contadores zerados, Permite=0.
//[F] Contagem em ticks de 100 ms (TON_TIME do S7-1200); precisao +100 ms. T = 0 desliga a supervisao (nao usar). Reiniciar a CPU zera as falhas (nao retentivo).
//[F] ESCRITOR UNICO: escreve HabResp, Eco, FalhaRetorno, ContatorColado (RESPOSTA do 1515). Le Cmd, HabPed, Seq (PEDIDO).
//[M]--------------------------------------------------------------
//[M] MONTAGEM NO TIA - nao e chamado por voce: o fb_bancoCarga16 o chama como MULTI-INSTANCIA (variavel _sup). Importe este FB ANTES do fb_bancoCarga16.
//[M]   Nome no TIA sem versao: fb_supervisaoChaves16. SaidaQ recebe a imagem das saidas do ciclo anterior (STAT do fb_bancosCarga1200); AuxIn, os contatos auxiliares fisicos.
//[M]--------------------------------------------------------------
   VAR_INPUT
      NumChaves       : Int := 16;                 // [M] chaves reais do banco (1..16); o fb_bancoCarga16 passa 13
      TempoRetornoMs  : Int := 2000;               // [F] T de verificacao do retorno em ms (minimo util 200)
      ComOk           : Bool;                      // [F] comunicacao com o 1515 viva (vem do vigia de vida do fb_bancoCarga16)
      Seq             : Int;                       // [F] PEDIDO: numero do pacote do 1515 (campo seq do DB de telegrama)
   END_VAR
   VAR_OUTPUT
      Eco             : Int;                       // [F] RESPOSTA: copia de Seq
      Permite         : Array[1..16] of Bool;      // [F] TRUE = o fb_bancoCarga16 pode energizar a saida desta chave
   END_VAR
   VAR_IN_OUT
      Cmd             : Array[1..16] of Bool;      // [F] PEDIDO: comando das chaves (so le)
      HabPed          : Array[1..16] of Bool;      // [F] PEDIDO: habilitar (1) / desabilitar (0) (so le)
      SaidaQ          : Array[1..16] of Bool;      // [F] imagem das saidas fisicas do ciclo anterior (so le)
      AuxIn           : Array[1..16] of Bool;      // [F] contatos auxiliares fisicos = SB (so le)
      HabResp         : Array[1..16] of Bool;      // [F] RESPOSTA: habilitacao aplicada (escreve)
      FalhaRetorno    : Array[1..16] of Bool;      // [F] RESPOSTA: sem retorno, travada (escreve)
      ContatorColado  : Array[1..16] of Bool;      // [F] RESPOSTA: contator colado, travado (escreve)
   END_VAR
   VAR
      _tOsc100ms : TON_TIME;                       // [F] gera o tick de 100 ms
      _tick      : Bool;                           // [F] pulso de 1 ciclo a cada 100 ms
      _cmdAnt    : Array[1..16] of Bool;           // [F] comando do ciclo anterior (para achar a borda de subida)
      _cRet      : Array[1..16] of Int;            // [F] ticks com saida=1 e aux=0
      _cCol      : Array[1..16] of Int;            // [F] ticks com saida=0 e aux=1
      _lim       : Int;                            // [F] T em ticks de 100 ms
      _n         : Int;                            // [F] NumChaves limitado a 0..16
      i          : Int;
   END_VAR

'''
# comenta a logica (mantem os // existentes como [F])
import re
def marca(linha):
    m = re.match(r'^(\s*)(.*?)(\s*)//\s*(.*)$', linha)
    if m and not m.group(4).startswith('['):
        return '%s%s%s// [F] %s' % m.groups()
    return linha
body = '\n'.join(marca(l) for l in body.split('\n'))
body = body.replace('BEGIN\n', '''BEGIN
   // [F] A logica abaixo e a mesma validada no ET200 (so TON -> TON_TIME). Ordem: tick 100 ms > limites > por chave (habilitar, rearme, contagem, Permite).
''', 1)
w('fb_supervisaoChaves16_v0.9.scl', sup_head + body)

# ------------------------------------------------------------------ fb_bancoCarga16 v0.9 (porte do fb_bancoEt200_16 v0.4)
fb = '''FUNCTION_BLOCK "fb_bancoCarga16"
TITLE = fb_bancoCarga16 v0.9 (1200)
AUTHOR : 'RegLobo'
VERSION : 0.6
''' + LEGENDA + '''//[F]==============================================================
//[F] FUNCIONAMENTO - RASCUNHO v0.9 (17/11/2026), nao compilado, nao testado no PLC. PORTE do fb_bancoEt200_16 v0.4 (ja validado na bancada do ET200).
//[F] O QUE FAZ: lado do banco do telegrama PUT/GET do 1515 (ate 16 chaves). 1 instancia por banco, chamada pelo fb_bancosCarga1200 (multi-instancia).
//[F]   1) vidaET sobe +1 a cada ~100 ms (prova ao 1515 que este PLC esta vivo).
//[F]   2) vida1515 parou de mudar por TempoPerdaMs (2 s) -> ComOk = FALSE e TODAS as saidas vao a FALSE.
//[F]   3) apos queda (ou partida da CPU) cada chave fica TRAVADA e so solta quando o 1515 manda Cmd = FALSE e depois recomanda. Nao religa sozinha.
//[F]   4) saida da contatora = Cmd E ComOk E LigarBanco E seletora Auto E nao travada E Permite (fb_supervisaoChaves16: SB some -> CB cai em 2 s, falha travada).
//[F]   5) Fbk[n] = contato auxiliar REAL; SeletoraAuto = entrada fisica da seletora (1 = Auto).
//[F] MUDANCAS v0.9 (vindas do ET200): (a) sem DB_ANY/PEEK/POKE: o telegrama entra pelos parametros IN_OUT, ligados aos campos do DB pelo nome (o que foi provado no ET200);
//[F]   (b) sem as copias _s* do S7-300 (no 1200 o array IN_OUT pode ser repassado direto ao supervisor); (c) removidos _cmdAnt/_comOkAnt (nao eram usados).
//[F] ESCRITOR UNICO: PEDIDO so pelo PUT do 1515; RESPOSTA so por este FB. SaidaContatora so deve ser escrita por aqui (via fb_bancosCarga1200).
//[M]--------------------------------------------------------------
//[M] MONTAGEM NO TIA - voce NAO chama este FB direto: o fb_bancosCarga1200 o chama (multi-instancia _bc56 e _bc400). Importe depois do fb_supervisaoChaves16.
//[M]   Os parametros IN_OUT (Cmd, Vida1515...) sao ligados no fb_bancosCarga1200 aos campos de "db3007_BC56_Com" / "db3107_BC400_Com". Nome no TIA sem versao: fb_bancoCarga16.
//[M]   Se aparecer "tipo de parametro invalido" ao repassar array IN_OUT para o supervisor: copie para arrays STAT como no ET200 (fb_bancoEt200_16 v0.4) e avise.
//[M]--------------------------------------------------------------
   VAR_INPUT
      NumChaves        : Int;                       // [M] chaves reais deste banco (1..16); BC56 e BC400 = 13
      SeletoraEntrada  : Bool;                      // [F] entrada fisica: seletora do banco em Auto (1 = Auto)
      TempoPerdaMs     : Time := T#2S;              // [F] sem vida nova do 1515 por este tempo = comunicacao perdida (menor que o TempoVida do 1515, 3 s)
      TempoRetornoMs   : Int := 2000;               // [F] T de verificacao do retorno (decisao do Reginaldo: 2 s)
   END_VAR
   VAR_OUTPUT
      ComOk : Bool;                                 // [F] TRUE = 1515 vivo
   END_VAR
   VAR_IN_OUT
      Cmd               : Array[1..16] of Bool;   // [M] <DB telegrama>.cmd        (PEDIDO, so le)
      Vida1515          : Int;                     // [M] <DB telegrama>.vida1515   (PEDIDO, so le)
      LigarBanco        : Bool;                    // [M] <DB telegrama>.ligarBanco (PEDIDO, so le)
      HabPed            : Array[1..16] of Bool;   // [M] <DB telegrama>.habPed     (PEDIDO, so le)
      Seq               : Int;                     // [M] <DB telegrama>.seq        (PEDIDO, so le)
      HabResp           : Array[1..16] of Bool;   // [M] <DB telegrama>.habResp    (RESPOSTA, escreve)
      Eco               : Int;                     // [M] <DB telegrama>.eco        (RESPOSTA, escreve)
      FalhaRetorno      : Array[1..16] of Bool;   // [M] <DB telegrama>.falhaRetorno   (RESPOSTA, escreve; travada ate novo comando)
      ContatorColado    : Array[1..16] of Bool;   // [M] <DB telegrama>.contatorColado (RESPOSTA, escreve; travado)
      VidaET            : Int;                     // [M] <DB telegrama>.vidaET     (RESPOSTA, escreve)
      Fbk               : Array[1..16] of Bool;   // [M] <DB telegrama>.fbk        (RESPOSTA, escreve)
      SeletoraAuto      : Bool;                    // [M] <DB telegrama>.seletoraAuto (RESPOSTA, escreve)
      SaidaContatora    : Array[1..16] of Bool;   // [M] imagem das saidas (STAT do fb_bancosCarga1200; o FC copia para os tags Q)
      EntradaContatoAux : Array[1..16] of Bool;   // [M] contatos auxiliares (STAT do fb_bancosCarga1200; o FC copia dos tags I)
   END_VAR
   VAR
      _tOsc100ms   : TON_TIME;                     // [F] gera o tick de 100 ms do vidaET
      _sup         : "fb_supervisaoChaves16";      // [M] multi-instancia: supervisao do retorno SB (nao precisa de DB avulso)
      _tPerda      : TON_TIME;                     // [F] conta o tempo sem vida nova do 1515
      _vida1515Ant : Int;                          // [F] vida do ciclo anterior
      _vidaMudou   : Bool;                         // [F] TRUE no ciclo em que a vida do 1515 mudou
      _bloq        : Array[1..16] of Bool;         // [F] TRUE = caiu a comunicacao (ou partida); so solta com Cmd[i] = FALSE
      _partiu      : Bool;                         // [F] FALSE no 1o ciclo apos partida
      _n           : Int;                          // [F] NumChaves limitado a 0..16
      i            : Int;
   END_VAR

BEGIN
   // [F] 1) VIDA DESTE PLC: +1 a cada 100 ms; volta a 0 antes de estourar o Int.
   #_tOsc100ms(IN := NOT #_tOsc100ms.Q, PT := T#100MS);
   IF #_tOsc100ms.Q THEN
      #VidaET := #VidaET + 1;
      IF #VidaET >= 32767 THEN #VidaET := 0; END_IF;
   END_IF;

   // [F] 2) VIGIA DA VIDA DO 1515: valor novo reseta o tempo; sem novidade por TempoPerdaMs = ComOk FALSE.
   IF #Vida1515 <> #_vida1515Ant THEN
      #_vida1515Ant := #Vida1515;
      #_vidaMudou := TRUE;
   ELSE
      #_vidaMudou := FALSE;
   END_IF;
   #_tPerda(IN := NOT #_vidaMudou, PT := #TempoPerdaMs);
   #ComOk := NOT #_tPerda.Q;

   // [F] limita NumChaves a 0..16 (fora disso o laco escreveria fora do array)
   #_n := #NumChaves;
   IF #_n < 0 THEN #_n := 0; END_IF;
   IF #_n > 16 THEN #_n := 16; END_IF;

   // [F] 3) TRAVA POS-QUEDA: sem comunicacao (ou 1o ciclo apos partida) trava todas as chaves; cada uma so solta quando o 1515 manda Cmd = FALSE.
   FOR #i := 1 TO 16 DO
      IF NOT #ComOk OR NOT #_partiu THEN
         #_bloq[#i] := TRUE;
      ELSIF NOT #Cmd[#i] THEN
         #_bloq[#i] := FALSE;
      END_IF;
   END_FOR;
   #_partiu := TRUE;

   #SeletoraAuto := #SeletoraEntrada;   // [F] devolve ao 1515 o estado da seletora fisica

   // [F] 4) SUPERVISAO DO RETORNO: SB some -> CB cai (T = TempoRetornoMs); habilita/desabilita com resposta; eco do seq.
   // [F]    SaidaQ = imagem das saidas do ciclo anterior (SaidaContatora); AuxIn = contatos auxiliares fisicos.
   #_sup(NumChaves := #_n, TempoRetornoMs := #TempoRetornoMs, ComOk := #ComOk, Seq := #Seq,
         Cmd := #Cmd, HabPed := #HabPed, SaidaQ := #SaidaContatora, AuxIn := #EntradaContatoAux,
         HabResp := #HabResp, FalhaRetorno := #FalhaRetorno, ContatorColado := #ContatorColado);
   #Eco := #_sup.Eco;

   // [F] 5) SAIDAS: so liga com TODAS as condicoes. Qualquer uma falhando = FALSE (estado seguro). Chaves alem de NumChaves ficam sempre FALSE.
   FOR #i := 1 TO 16 DO
      IF #i <= #_n THEN
         #Fbk[#i] := #EntradaContatoAux[#i];
         IF #ComOk AND #LigarBanco AND #SeletoraEntrada AND NOT #_bloq[#i] AND #_sup.Permite[#i] THEN   // [F] Permite = habilitada E sem falha travada
            #SaidaContatora[#i] := #Cmd[#i];
         ELSE
            #SaidaContatora[#i] := FALSE;
         END_IF;
      ELSE
         #Fbk[#i] := FALSE;
         #SaidaContatora[#i] := FALSE;
      END_IF;
   END_FOR;
END_FUNCTION_BLOCK
'''
w('fb_bancoCarga16_v0.9.scl', fb)

# ------------------------------------------------------------------ fb_bancosCarga1200 (wrapper novo)
def chamada(tag, db, sel):
    return '''   #_%(t)s(NumChaves := 13,
          SeletoraEntrada := #%(sel)s,
          TempoPerdaMs := T#2S,
          TempoRetornoMs := 2000,
          ComOk => #ComOk%(T)s,
          Cmd := "%(db)s".cmd,
          Vida1515 := "%(db)s".vida1515,
          LigarBanco := "%(db)s".ligarBanco,
          HabPed := "%(db)s".habPed,
          Seq := "%(db)s".seq,
          HabResp := "%(db)s".habResp,
          Eco := "%(db)s".eco,
          FalhaRetorno := "%(db)s".falhaRetorno,
          ContatorColado := "%(db)s".contatorColado,
          VidaET := "%(db)s".vidaET,
          Fbk := "%(db)s".fbk,
          SeletoraAuto := "%(db)s".seletoraAuto,
          SaidaContatora := #saida%(T)s,
          EntradaContatoAux := #aux%(T)s);
''' % dict(t=tag.lower(), T=tag, db=db, sel=sel)
def trava(T, db):
    return '''   // [F] "Ligar banco" %(T)s seguro: no 1o ciclo apos partida o ComOk e FALSE, entao a trava ja nasce ligada.
   // [F] Queda de comunicacao trava; so solta quando o comando "Ligar banco" do 1515 cair a FALSE (religar exige novo comando).
   IF NOT #ComOk%(T)s THEN
      #_bloq%(T)s := TRUE;
   ELSIF NOT "%(db)s".ligarBanco THEN
      #_bloq%(T)s := FALSE;
   END_IF;
   #LigarBanco%(T)s := "%(db)s".ligarBanco AND #ComOk%(T)s AND NOT #_bloq%(T)s;
''' % dict(T=T, db=db)
wr = '''FUNCTION_BLOCK "fb_bancosCarga1200"
TITLE = fb_bancosCarga1200 v0.1
{ S7_Optimized_Access := 'FALSE' }
AUTHOR : 'RegLobo'
VERSION : 0.1
''' + LEGENDA + '''//[F]==============================================================
//[F] FUNCIONAMENTO - NOVO em v0.17 (17/11/2026), RASCUNHO, nao compilado. Espelho do fb_bancosEt200 v0.2 (validado na bancada do ET200).
//[F] O QUE FAZ: guarda as imagens de SAIDA e de RETORNO (variaveis STAT) dos bancos BC56 e BC400 e chama o fb_bancoCarga16 uma vez por banco (multi-instancia).
//[F] POR QUE FB COM STAT (e nao FC com TEMP): o fb_bancoCarga16 usa SaidaContatora como IMAGEM DO CICLO ANTERIOR (a supervisao do retorno compara o comando
//[F]   com o que foi escrito no ciclo passado). Variavel TEMP de FC nasce com lixo a cada chamada; STAT guarda de um ciclo para o outro.
//[F] LIGAR BANCO SEGURO: saidas LigarBancoBC56/BC400 = comando "Ligar banco" do 1515 E ComOk E (desde a ultima queda o comando CAIU a FALSE e foi dado de novo).
//[F]   Motivo (teste do ET200, 1515 em STOP): as saidas das chaves cairam mas a saida fisica "Ligar Banco", ligada direto ao bit do DB, ficou LIGADA.
//[F] ESCRITOR UNICO: depois disto so o fc_bancosCarga1200 escreve nas saidas das contatoras e no "Ligar Banco" destes bancos.
//[M]--------------------------------------------------------------
//[M] MONTAGEM NO TIA - 1) Importe depois de db3007, db3107, fb_supervisaoChaves16 e fb_bancoCarga16.
//[M]   2) DB de INSTANCIA pronto no pacote: db3006i_BancosCarga1200_v0.1.db (importe como fonte externa; numero MANUAL 3006). Substitui os antigos db3006i e db3106i.
//[M]   3) O fc_bancosCarga1200 chama este FB UMA vez por ciclo. Duas chamadas da mesma instancia = o FB roda 2x por ciclo (vida, tempos e supervisao dobram).
//[M]   4) Os ComOk ficam no proprio DB de instancia: leia "db3006i_BancosCarga1200".ComOkBC56 / .ComOkBC400 onde precisar (nao precisa de "=>").
//[M]   5) NumChaves = 13 e T#2S / 2000 ms estao escritos nas chamadas abaixo; mude aqui se o numero de chaves ou os tempos mudarem.
//[M]--------------------------------------------------------------
   VAR_INPUT
      SeletoraBC56  : Bool;          // [M] entrada fisica: seletora do BC56 em Auto (1 = Auto). O FC liga o seu tag.
      SeletoraBC400 : Bool;          // [M] entrada fisica: seletora do BC400 em Auto (1 = Auto). O FC liga o seu tag.
   END_VAR
   VAR_OUTPUT
      ComOkBC56  : Bool;             // [F] 1515 vivo para o BC56
      ComOkBC400 : Bool;             // [F] 1515 vivo para o BC400
      LigarBancoBC56  : Bool;        // [M] use ESTA saida para a saida fisica "Ligar Banco" do BC56 (se existir)
      LigarBancoBC400 : Bool;        // [M] idem BC400
   END_VAR
   VAR
      saidaBC56  : Array[1..16] of Bool;   // [M] SAIDA das contatoras: o FC copia daqui para os tags Q. STAT = guarda o ciclo anterior.
      auxBC56    : Array[1..16] of Bool;   // [M] RETORNO real (contato auxiliar): o FC copia dos tags I para ca ANTES da chamada.
      saidaBC400 : Array[1..16] of Bool;
      auxBC400   : Array[1..16] of Bool;
      _bc56      : "fb_bancoCarga16";      // [M] multi-instancia (nao precisa de DB avulso)
      _bc400     : "fb_bancoCarga16";
      _bloqBC56  : Bool;                   // [F] trava apos perda de comunicacao: so solta quando o "Ligar banco" cair a FALSE
      _bloqBC400 : Bool;
   END_VAR

BEGIN
   // [F] BC56: chama o banco ligando cada parametro ao campo de mesmo nome do DB de telegrama db3007_BC56_Com.
''' + chamada('BC56', 'db3007_BC56_Com', 'SeletoraBC56') + '''
   // [F] BC400: idem, DB de telegrama db3107_BC400_Com.
''' + chamada('BC400', 'db3107_BC400_Com', 'SeletoraBC400') + '\n' + trava('BC56', 'db3007_BC56_Com') + '\n' + trava('BC400', 'db3107_BC400_Com') + 'END_FUNCTION_BLOCK\n'
wr = wr.replace('#_bc56(', '#_bc56(').replace('#_bc400(', '#_bc400(').replace('#_bc56(NumChaves', '#_bc56(NumChaves')
wr = wr.replace('#_bloqBC56', '#_bloqBC56')
w('fb_bancosCarga1200_v0.1.scl', wr)
w('db3006i_BancosCarga1200_v0.1.db', '''DATA_BLOCK "db3006i_BancosCarga1200"
{ S7_Optimized_Access := 'FALSE' }
AUTHOR : RegLobo
VERSION : 0.1
"fb_bancosCarga1200"

BEGIN

END_DATA_BLOCK
''', bom=True, crlf=True)

# ------------------------------------------------------------------ fc_bancosCarga1200 v0.16
def aux(B):
    s = ''.join('      //[M]   "ibanco".aux%s[%d] := FALSE;   <- troque FALSE pelo SEU tag do contato auxiliar da resistencia %d\n' % (B, n, n) for n in (1,))
    return s
def regioes(B, tag):
    I = '"db3006i_BancosCarga1200"'
    return '''
   REGION %(B)s - 1 de 3: RETORNO das contatoras (contato auxiliar REAL) -> copia para o DB do FB
      //[F] O retorno e o contato auxiliar REAL da contatora (nunca o tag do comando): e ele que prova que a chave fechou. Chaves 14 a 16 nao existem (FALSE).
      //[M] Para cada resistencia n (1 a 13) troque FALSE pelo SEU tag de ENTRADA do contato auxiliar. Enquanto estiver FALSE o banco compila, mas a supervisao acusa falha de retorno em 2 s.
%(aux)s      //[M]   formato:  %(I)s.aux%(B)s[n] := "<seu tag do retorno da resistencia n>";
''' % dict(B=B, I=I, aux='') + ''.join('      %s.aux%s[%d] := FALSE;   //[M] <- seu tag do retorno da resistencia %d\n' % (I, B, n, n) for n in range(1, 14)) + ''.join('      %s.aux%s[%d] := FALSE;   //[F] chave inexistente\n' % (I, B, n) for n in (14, 15, 16)) + '''   END_REGION
'''
fc = '''FUNCTION "fc_bancosCarga1200" : Void
TITLE = fc_bancosCarga1200 v0.16
{ S7_Optimized_Access := 'FALSE' }
AUTHOR : RegLobo
VERSION : 0.7
''' + LEGENDA + '''//[F]==============================================================
//[F] FUNCIONAMENTO - v0.16 (17/11/2026), RASCUNHO, nao compilado. O FC so ORGANIZA: copia tags fisicos -> DB do FB, chama o FB 1x, copia DB do FB -> tags fisicos.
//[F]   A logica e as imagens (STAT) ficam no fb_bancosCarga1200 (DB de instancia db3006i_BancosCarga1200). Mudanca da v0.15: antes o FC tinha VAR_TEMP e 2 DBs de instancia
//[F]   avulsos; agora e 1 chamada so (modelo validado no ET200). Sem tag escrito o bloco compila, mas nada liga (retorno FALSE, seletora FALSE, saidas nao copiadas).
//[F]   Na 1200 o retorno e o contato auxiliar REAL (diferente do ET200, onde ainda e a propria saida em carater provisorio).
//[M]--------------------------------------------------------------
//[M] MONTAGEM NO TIA - 1) Importe o db3006i_BancosCarga1200 (.db) e o fb_bancosCarga1200 antes deste FC.
//[M]   2) Preencha so os pontos marcados "<- seu tag" nas 3 REGIONs. NAO ha nomes sugeridos: use os tags que JA existem no seu projeto.
//[M]   3) Chame este FC 1x por ciclo no OB1 (ou OB de tempo fixo). Nao chame o fb_bancosCarga1200 em outro lugar.
//[M]   4) ESCRITOR UNICO: tire a escrita das mesmas saidas do FC7 (Resistencias) e do FC8 (Saidas Digitais) atuais; senao ha 2 escritores e a contatora pode ser acionada fora do comando do 1515.
//[M]--------------------------------------------------------------
BEGIN
''' + regioes('BC56', 'bc56') + regioes('BC400', 'bc400')
# regioes 2 e 3 (chamada unica e saidas)
fc = fc.replace('''   END_REGION

   REGION BC400 - 1 de 3''', '''   END_REGION

   REGION BC400 - 1 de 3''')
fc += '''
   REGION CHAMADA - 2 de 3: UMA chamada do fb_bancosCarga1200 (ele chama os dois bancos)
      //[F] UMA chamada so por ciclo. Duas chamadas da instancia = o FB roda 2x (vida, tempos e supervisao dobram).
      //[M] Troque FALSE pelo SEU tag da seletora do banco em Auto (1 = Auto). Com FALSE o banco nunca liga (estado seguro).
      "db3006i_BancosCarga1200"(SeletoraBC56 := FALSE,     //[M] <- tag da seletora do BC56 em Auto
                                SeletoraBC400 := FALSE);   //[M] <- tag da seletora do BC400 em Auto
   END_REGION

   REGION SAIDAS - 3 de 3: SAIDA das contatoras (bobinas) e "Ligar Banco" <- copia do DB do FB. Unico escritor.
      //[F] Os tags Q so sao escritos aqui. O valor ja vem com todas as protecoes (ComOk, Ligar banco, seletora Auto, travas, supervisao do retorno).
      //[M] Para cada resistencia n (1 a 13) escreva o SEU tag de saida:
      //[M]    "<seu tag da saida da resistencia n>" := "db3006i_BancosCarga1200".saidaBC56[n];     (BC56)
      //[M]    "<seu tag da saida da resistencia n>" := "db3006i_BancosCarga1200".saidaBC400[n];    (BC400)
      //[M] "Ligar Banco" fisico (se o PLC de carga tiver essa saida): use as saidas com ComOk e trava, NAO o bit do DB direto (senao ela fica ligada com o 1515 em STOP):
      //[M]    "<seu tag Ligar Banco BC56>"  := "db3006i_BancosCarga1200".LigarBancoBC56;
      //[M]    "<seu tag Ligar Banco BC400>" := "db3006i_BancosCarga1200".LigarBancoBC400;
      //[M] ComOk para sinalizacao/WinCC: "db3006i_BancosCarga1200".ComOkBC56 e .ComOkBC400.
   END_REGION

END_FUNCTION
'''
w('fc_bancosCarga1200_v0.16.scl', fc)

# ------------------------------------------------------------------ COMO_USAR (novo)
cu = '''COMO USAR - PLC de Carga (S7-1214FC) - entrega v0.17   [rascunho: NAO compilado no TIA, nao testado no PLC]

O QUE MUDOU DA v0.16 PARA A v0.17
 1) COMENTARIOS MARCADOS em todos os blocos. Cada linha de comentario comeca com uma etiqueta:
      //[F]  FUNCIONAMENTO  (barra de ====)  o que o codigo faz e por que
      //[M]  MONTAGEM NO TIA (barra de ----)  como importar, numerar, ligar tags, ordem de chamada
    Dica: no TIA use "Localizar" por  //[M]  para ver so o roteiro de montagem, ou  //[F]  para ler so a logica.
 2) Blocos atualizados com o que foi validado no ET200 (16/11): wrapper FB com STAT (fb_bancosCarga1200), FC so organiza, DB de instancia pronto (.db),
    "Ligar Banco" com ComOk + trava apos queda, UMA chamada por ciclo, telegrama acessado pelo NOME do campo (sem PEEK/POKE, que nunca foi provado).
 3) Os dois DBs de instancia antigos (db3006i e db3106i) viram UM: db3006i_BancosCarga1200 (numero 3006). Nao use mais o fb_bancoCarga16 v0.8 solto.
 4) PLC_1515 igual a v0.16 (nada mudou ali). ET200 nao foi alterado.

ORDEM DE IMPORTACAO (fonte externa, um arquivo por vez)
  1. db3007_BC56_Com_v0.13 e db3107_BC400_Com_v0.13 (numero MANUAL 3007 e 3107, sem acesso otimizado)
  2. db2000_BancoTeste2_DSE_v0.2 (numero MANUAL 2000; so leitura)
  3. fb_supervisaoChaves16_v0.9
  4. fb_bancoCarga16_v0.9
  5. fb_bancosCarga1200_v0.1
  6. db3006i_BancosCarga1200_v0.1.db (instancia pronta do fb_bancosCarga1200; numero MANUAL 3006)
  7. fc_bancosCarga1200_v0.16  -> preencha os tags marcados "<- seu tag" (retornos, seletoras, saidas, Ligar Banco)
  8. OB1: chame o fc_bancosCarga1200 1x por ciclo. Tire das mesmas saidas a escrita do FC7/FC8 atuais.
  9. CPU: Protecao e seguranca > Mecanismos de conexao > "Permitir acesso via PUT/GET". A conexao S7 e criada no 1515.
 10. Compile. Se der erro, mande a lista das mensagens e o nome do bloco.
  Se o TIA reclamar de "tipo de parametro invalido" ao repassar array para o supervisor, avise: o remedio ja existe (copias STAT, como no ET200).

1515 (quem carrega e o Reginaldo): igual a v0.16. LEMBRETE vindo do ET200: RespEcoOk := "db3000_BC56_Chaves".sbRet.respEcoOk (e o equivalente do BC400) tem que estar ligado na chamada do FB101.

TESTE (carga de potencia DESACOPLADA): 1515 em Run: ComOk TRUE e vidaET mudando; comando de uma chave liga a saida; contato auxiliar nao volta em 2 s = a chave cai e trava;
1515 sem vida por mais de 2 s = todas as saidas e o "Ligar Banco" caem; ao voltar, nada liga sozinho (so com novo comando). Repita os testes de STOP do 1515 e de cabo de rede feitos no ET200.
HONESTO: nada disto foi compilado no TIA nem rodou no 1214FC. A logica e a mesma do ET200 (provada na bancada, la com retorno provisorio); o retorno real so aparece aqui.
'''
open(os.path.join(V17, 'COMO_USAR.txt'), 'w', encoding='utf-8').write(cu)
print('ok', sorted(os.listdir(D)))
