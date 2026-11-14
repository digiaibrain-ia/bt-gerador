#!/usr/bin/env python3
"""12/11/2026 - entrega 1200 v0.15 = v0.14 SEM nomes de tag inventados (BC56_I01.. etc.). O fc_bancosCarga1200 passa a ter REGIONs com titulo e comentario dizendo o que ligar;
o programador escreve os tags que JA existem no projeto dele. Sem tags escritos o FC compila (retornos FALSE, saidas nao copiadas). Nao sobrescreve. RASCUNHO, nao compilado."""
import os, shutil
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); V14, V15 = os.path.join(R, 'entrega_1200_v0.14'), os.path.join(R, 'entrega_1200_v0.15')
assert os.path.exists(V14) and not os.path.exists(V15)
shutil.copytree(V14, V15); d = os.path.join(V15, 'PLC_CARGA_1200'); os.remove(os.path.join(d, 'fc_bancosCarga1200_v0.14.scl'))
t = '''FUNCTION "fc_bancosCarga1200" : Void
TITLE = fc_bancosCarga1200 v0.15
AUTHOR : 'RegLobo'
VERSION : 0.6
////====================================
//// fc_bancosCarga1200 v0.15 (12/11/2026) - RASCUNHO, nao compilado. Chamar 1x por ciclo (OB1 ou OB de tempo fixo). BC56 e BC400 (13 chaves cada).
//// NAO ha nomes de tag sugeridos: em cada REGION escreva os tags que JA existem no seu projeto (resistencias, contatoras, seletora). Leia o titulo e o comentario de cada REGION.
//// Sem tags escritos o bloco compila, mas nada liga (retornos = FALSE e saidas nao sao copiadas).
//// Os DBs de instancia NAO vem no pacote: crie ao inserir a chamada do FB (numero e nome no COMO_USAR.txt).
////====================================
   VAR_TEMP
      saidaBC56 : Array[1..16] of Bool;
      auxBC56 : Array[1..16] of Bool;
      saidaBC400 : Array[1..16] of Bool;
      auxBC400 : Array[1..16] of Bool;
   END_VAR
BEGIN
'''
for b, dbc, inst, n in (('BC56', 3007, 'db3006i_BC56_BancoCarga', 3006), ('BC400', 3107, 'db3106i_BC400_BancoCarga', 3106)):
    t += '''
   REGION %(b)s - 1 de 3: RETORNO das contatoras (contato auxiliar REAL)
      // Para cada resistencia n (1 a 13) escreva o SEU tag do contato auxiliar (retorno) da contatora:
      //    #aux%(b)s[n] := "<seu tag do retorno da resistencia n>";
      // Nao use o tag do comando como retorno: tem que ser o contato auxiliar real.
      #aux%(b)s[14] := FALSE;
      #aux%(b)s[15] := FALSE;
      #aux%(b)s[16] := FALSE;
   END_REGION

   REGION %(b)s - 2 de 3: CHAMADA do fb_bancoCarga16 (insira no TIA)
      // Arraste o fb_bancoCarga16 para ca. No DB de instancia: numero MANUAL %(n)d, nome %(inst)s.
      // Parametros:  DbCom := "db%(dbc)d_%(b)s_Com", NumChaves := 13, SeletoraEntrada := "<seu tag da seletora do %(b)s em Auto (1 = Auto)>",
      //              SaidaContatora := #saida%(b)s, EntradaContatoAux := #aux%(b)s
   END_REGION

   REGION %(b)s - 3 de 3: SAIDA das contatoras
      // Para cada resistencia n (1 a 13) escreva o SEU tag da saida (bobina da contatora):
      //    "<seu tag da saida da resistencia n>" := #saida%(b)s[n];
      // Depois disto, so este FC pode escrever nessas saidas (retire a escrita do FC7/FC8 atuais, senao ha 2 escritores).
   END_REGION
''' % dict(b=b, dbc=dbc, inst=inst, n=n)
t += '\nEND_FUNCTION\n'
open(os.path.join(d, 'fc_bancosCarga1200_v0.15.scl'), 'w', encoding='utf-8').write(t)
open(os.path.join(V15, 'COMO_USAR.txt'), 'w', encoding='utf-8').write("""COMO USAR - PLC de Carga (S7-1214FC) - entrega v0.15   [rascunho: nao compilado]

O QUE E: o 1515 manda o comando de cada chave (PUT) e le o retorno (GET). Estes blocos, no 1214FC, ligam a contatora de verdade
e devolvem o contato auxiliar real. Sao 2 bancos: BC56 e BC400 (13 chaves cada).

BLOCOS (pasta PLC_CARGA_1200, 1 DB por arquivo)
  db3007_BC56_Com / db3107_BC400_Com   DB de TELEGRAMA (24 bytes). O 1515 escreve o pedido e le a resposta. Voce NAO escreve nele.
  fb_supervisaoChaves16                regra "contato auxiliar some -> a chave cai em 2 s". Usado dentro do fb_bancoCarga16.
  fb_bancoCarga16                      a logica do banco (1 por banco). Recebe o numero do DB de telegrama.
  fc_bancosCarga1200                   onde voce liga os SEUS tags (resistencias, contatoras, seletora). E o unico bloco que voce edita.
  DBs de INSTANCIA do fb_bancoCarga16: NAO vem em arquivo. Voce cria ao chamar o FB (passo 4).

PASSO A PASSO
 1. Importe, um arquivo por vez, como FONTE EXTERNA, nesta ordem: db3007, db3107, fb_supervisaoChaves16, fb_bancoCarga16, fc_bancosCarga1200.
 2. NUMERO DOS DBs de telegrama (o TIA numera sozinho DB1, DB2...): botao direito no DB > Propriedades > Geral > Numero (manual):
      db3007_BC56_Com = 3007 | db3107_BC400_Com = 3107
    Tem que ser esses: o 1515 acessa por P#DB3007 e P#DB3107. Sem "Acesso otimizado".
 3. TAGS: nao ha nomes sugeridos. Abra o fc_bancosCarga1200: cada banco tem 3 REGIONs (titulo "1 de 3", "2 de 3", "3 de 3"). Siga o comentario de cada uma
    e escreva os SEUS tags ja existentes: retorno (contato auxiliar) de cada resistencia, saida de cada contatora e a seletora em Auto.
 4. DB DE INSTANCIA: na REGION "2 de 3" de cada banco, insira a chamada do fb_bancoCarga16 (arraste o FB). Na janela do DB de instancia digite NUMERO MANUAL e NOME:
      BC56 : nome  db3006i_BC56_BancoCarga   numero 3006
      BC400: nome  db3106i_BC400_BancoCarga  numero 3106
    Os parametros estao no comentario da REGION (DbCom, NumChaves := 13, SeletoraEntrada com o seu tag, SaidaContatora, EntradaContatoAux).
 5. SAIDAS: depois disto, so o fc_bancosCarga1200 pode escrever nas saidas das contatoras. Se o FC7 (Resistencias) ou o FC8 (Saidas Digitais)
    atuais escrevem nas mesmas saidas, tire essa escrita (senao ha 2 escritores e a contatora pode ser acionada fora do comando do 1515).
 6. Chame o fc_bancosCarga1200 1 vez por ciclo no OB1 (ele ja chama os 2 bancos).
 7. Na CPU: Protecao e seguranca > Mecanismos de conexao > marque "Permitir acesso via PUT/GET". A conexao S7 com o 1515 e criada no 1515 (o ID vai la, em ID_Conexao).
 8. Compile. Se der erro, mande a lista das mensagens (e o nome do bloco).

TESTE (carga de potencia DESACOPLADA): no 1515 com o PLC em Run, ComOk deve ficar TRUE e a vida (vidaET) mudando; comando de uma chave liga a saida;
se o contato auxiliar nao voltar em 2 s a chave cai e trava; se o 1515 ficar mais de 2 s sem vida, todas as saidas caem.

Pasta PLC_1515 = blocos do 1515 (quem carrega e o Reginaldo).
""")
print('ok', V15)
