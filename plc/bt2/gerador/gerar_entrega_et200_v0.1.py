#!/usr/bin/env python3
"""13/11/2026 - ENTREGA ET200 v0.1 (teste provisorio do Reginaldo): blocos do 1515 (PUT/GET com o ET200) + blocos do ET200 (IM151-8, familia S7-300), so BC56 e BC400.
Mesmo metodo da entrega 1200: 1 DB por arquivo, sem DB de instancia em arquivo, FC com orientacao por comentarios (sem nome de tag sugerido), COMO_USAR.txt completo.
ET200: DB38/DB39 e FC4 ja existem no projeto (numeracao livre, teste provisorio) -> remoto DB38/DB39; FC novo nao usa o numero 4. Logica = a mesma do 1200 (supervisao: so TON x TON_TIME difere; conferido por script).
Nao sobrescreve. RASCUNHO, nao compilado. Uso: python3 plc/bt2/gerador/gerar_entrega_et200_v0.1.py"""
import os, re, shutil
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); E = os.path.join(R, 'entrega_et200_v0.1'); assert not os.path.exists(E)
ET, V16 = os.path.join(R, 'comunicacao_et200'), os.path.join(R, 'entrega_1200_v0.16')
d300, d15 = os.path.join(E, 'PLC_ET200'), os.path.join(E, 'PLC_1515'); os.makedirs(d300); os.makedirs(d15)
t = open(os.path.join(ET, 'db38_db39_ComEt200_v0.4.scl'), encoding='utf-8').read(); n = 0
for m in re.finditer(r'^DATA_BLOCK "([^"]+)".*?^END_DATA_BLOCK[ \t]*\n?', t, re.S | re.M):
    num = {'ComBC56': 38, 'ComBC400': 39}[m.group(1)]; open(os.path.join(d300, 'db%d_%s_v0.4.scl' % (num, m.group(1))), 'w', encoding='utf-8').write(m.group(0).rstrip() + '\n'); n += 1
assert n == 2
for f in ('fb_supervisaoChaves16_v0.1.scl', 'fb_bancoEt200_16_v0.3.scl'): shutil.copy(os.path.join(ET, f), d300)
def fc(b, num):
    return '''
   //=====================================================================
   // %(b)s - 1 de 3: RETORNO das contatoras (contato auxiliar REAL)
   //=====================================================================
   // Para cada resistencia n (1 a 13) escreva o SEU tag do contato auxiliar (retorno) da contatora (os que o FC4 ja usa):
   //    #aux%(b)s[n] := "<seu tag do retorno da resistencia n>";
   // Nao use o tag do comando como retorno: tem que ser o contato auxiliar real.
   #aux%(b)s[14] := FALSE;
   #aux%(b)s[15] := FALSE;
   #aux%(b)s[16] := FALSE;

   //=====================================================================
   // %(b)s - 2 de 3: CHAMADA do fb_bancoEt200_16 (insira no TIA)
   //=====================================================================
   // Arraste o fb_bancoEt200_16 para ca. DB de instancia: nome  ibc%(l)s_fb_bancoEt200_16  (numero livre: o ET200 e teste provisorio).
   // Parametros:  NumChaves := 13, SeletoraEntrada := "<seu tag da seletora do %(b)s em Auto (1 = Auto)>", TempoPerdaMs := T#2S, TempoRetornoMs := 2000,
   //   Cmd := "Com%(b)s".cmd, Vida1515 := "Com%(b)s".vida1515, LigarBanco := "Com%(b)s".ligarBanco, HabPed := "Com%(b)s".habPed, Seq := "Com%(b)s".seq,
   //   VidaET := "Com%(b)s".vidaET, Fbk := "Com%(b)s".fbk, SeletoraAuto := "Com%(b)s".seletoraAuto, HabResp := "Com%(b)s".habResp, Eco := "Com%(b)s".eco,
   //   FalhaRetorno := "Com%(b)s".falhaRetorno, ContatorColado := "Com%(b)s".contatorColado, SaidaContatora := #saida%(b)s, EntradaContatoAux := #aux%(b)s

   //=====================================================================
   // %(b)s - 3 de 3: SAIDA das contatoras
   //=====================================================================
   // Para cada resistencia n (1 a 13) escreva o SEU tag da saida (bobina da contatora):
   //    "<seu tag da saida da resistencia n>" := #saida%(b)s[n];
   // Depois disto, so este FC pode escrever nessas saidas (retire a escrita do FC4 atual, senao ha 2 escritores).
''' % dict(b=b, l=b.lower())
open(os.path.join(d300, 'fc_bancosEt200_v0.1.scl'), 'w', encoding='utf-8').write('''FUNCTION "fc_bancosEt200" : Void
TITLE = fc_bancosEt200 v0.1
AUTHOR : 'RegLobo'
VERSION : 0.1
////====================================
//// fc_bancosEt200 v0.1 (13/11/2026) - RASCUNHO, nao compilado. ET200 (IM151-8, familia S7-300): BC56 e BC400, 13 chaves cada. Chamar 1x por ciclo no OB1.
//// NAO ha nomes de tag sugeridos: em cada trecho escreva os tags que JA existem no projeto (os do FC4). Sem tags escritos compila, mas nada liga.
//// Os DBs de instancia NAO vem no pacote: crie ao inserir a chamada do FB (nome no COMO_USAR.txt). Sem REGION (S7-300): os titulos sao banners de comentario.
//// ESCRITOR UNICO: depois disto o FC4 nao pode escrever nas mesmas saidas. O fb_bancoEt200_16 ja incrementa o VidaET: nao chame o fc_vidaET junto.
////====================================
   VAR_TEMP
      saidaBC56 : Array[1..16] of Bool;
      auxBC56 : Array[1..16] of Bool;
      saidaBC400 : Array[1..16] of Bool;
      auxBC400 : Array[1..16] of Bool;
   END_VAR
BEGIN
''' + fc('BC56', 38) + fc('BC400', 39) + '\nEND_FUNCTION\n')
for f in ('fb100_setupChaves_v0.4.scl', 'db3000_BC56_Chaves_v0.3.db', 'db3100_BC400_Chaves_v0.3.db'): shutil.copy(os.path.join(V16, 'PLC_1515', f), d15)
shutil.copy(os.path.join(ET, 'fb101_ComEt200_v0.8.scl'), d15)
for b, old, new in (('BC56', 3007, 38), ('BC400', 3107, 39)):
    s = open(os.path.join(V16, 'PLC_1515', 'chamadas_%s_v0.5.scl' % b), encoding='utf-8').read()
    s = s.replace('DB%d' % old, 'DB%d' % new).replace('ComCarga', 'ComEt200').replace('fb101_ComEt200 v0.9', 'fb101_ComEt200 v0.8').replace('PLC de CARGA (1214FC)', 'ET200 (IM151-8)')
    s = s.replace('PLC de cargas (1200)', 'ET200').replace('PLC de Carga', 'ET200').replace('chamadas_%s v0.5' % b, 'chamadas_%s_ET200 v0.1' % b)
    assert 'DB%d' % old not in s and 'ComCarga' not in s and 'P#DB%d.DBX0.0 BYTE 10' % new in s, b
    open(os.path.join(d15, 'chamadas_%s_ET200_v0.1.scl' % b), 'w', encoding='utf-8').write(s)
open(os.path.join(E, 'COMO_USAR.txt'), 'w', encoding='utf-8').write('''COMO USAR - teste com o ET200 (IM151-8) - entrega ET200 v0.1   [rascunho: nao compilado]

O QUE E: o 1515 manda o comando de cada chave (PUT) e le o retorno (GET); o ET200 liga a contatora de verdade e devolve o contato auxiliar real.
Mesma logica do PLC de Carga (1200). So BC56 e BC400 (13 chaves cada). ET200 = teste provisorio; DB38/DB39 e FC4 ja existem no projeto.

PASTA PLC_ET200 (carregar no ET200), 1 DB por arquivo
  db38_ComBC56 / db39_ComBC400   DB de TELEGRAMA (24 bytes). O 1515 escreve o pedido e le a resposta. Ninguem mais escreve nele.
  fb_supervisaoChaves16          regra "contato auxiliar some -> a chave cai em 2 s". Usado dentro do fb_bancoEt200_16.
  fb_bancoEt200_16               a logica do banco (1 por banco): vida, perda de comunicacao, religar so com novo comando, habilitar/desabilitar, SB/CB.
  fc_bancosEt200                 onde voce liga os SEUS tags (os do FC4). E o unico bloco que voce edita.
  DBs de INSTANCIA do fb_bancoEt200_16: NAO vem em arquivo; voce cria ao chamar o FB (passo 4).

PASSO A PASSO - ET200
 1. Importe, um arquivo por vez, como FONTE EXTERNA, nesta ordem: db38, db39, fb_supervisaoChaves16, fb_bancoEt200_16, fc_bancosEt200.
 2. DB38 e DB39 JA EXISTEM com o layout antigo (12 bytes). O layout novo tem 24 bytes e SUBSTITUI o antigo: so carregue junto com o 1515 (mesma janela). Sem "Acesso otimizado".
 3. Abra o fc_bancosEt200: cada banco tem 3 trechos (titulo "1 de 3", "2 de 3", "3 de 3"). Siga o comentario e escreva os SEUS tags ja existentes:
    retorno (contato auxiliar) de cada resistencia, saida de cada contatora e a seletora em Auto.
 4. DB DE INSTANCIA: no trecho "2 de 3" de cada banco, insira a chamada do fb_bancoEt200_16 (arraste o FB), nome ibc56_fb_bancoEt200_16 / ibc400_fb_bancoEt200_16
    (numero livre). Os parametros estao no comentario. Apague as linhas de comentario da chamada depois.
 5. SAIDAS: depois disto so o fc_bancosEt200 escreve nas saidas das contatoras do BC56/BC400. Retire essa escrita do FC4 atual (senao ha 2 escritores).
 6. Chame o fc_bancosEt200 1 vez por ciclo no OB1. O fb_bancoEt200_16 ja incrementa o VidaET: se existir fc_vidaET, NAO chame junto.
 7. Se a CPU tiver a opcao de acesso PUT/GET, habilite. A conexao S7 com o 1515 e criada no 1515 (o ID vai la, em ID_Conexao).
 8. Compile. Se der erro, mande a lista das mensagens (e o nome do bloco).

PASTA PLC_1515 (quem carrega e o Reginaldo)
 1. Importe: fb100_setupChaves, fb101_ComEt200, db3000_BC56_Chaves, db3100_BC400_Chaves (mesmos do PLC de Carga; so mudam o remoto e o nome da comunicacao).
 2. chamadas_BC56_ET200 e chamadas_BC400_ET200: PUT P#DB38.DBX0.0 BYTE 10 / GET P#DB38.DBX10.0 BYTE 14 (BC400: DB39). Preencha o ID_Conexao com o da conexao S7 do ET200.
    As instancias (db3005i_BC56_ComEt200, db3105i_BC400_ComEt200, db3004i/db3104i ...) sao criadas ao inserir a chamada, com numero e nome manuais.
 3. Carregue o 1515 e o ET200 na mesma janela.

TESTE (carga de potencia DESACOPLADA): vidaET mudando e ComOk TRUE; comando de uma chave liga a saida; sem retorno por 2 s a chave cai e trava e nao volta sozinha;
sem vida do 1515 por mais de 2 s todas as saidas caem; habilitar/desabilitar (habResp e eco). Repita em BC56 e BC400.
''')
print('ok', E)
