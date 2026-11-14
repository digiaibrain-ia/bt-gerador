#!/usr/bin/env python3
"""14/11/2026 - entrega ET200 v0.3 = v0.2 + CORRECAO DO ERRO DE COMPILACAO da bancada: "Invalid parameter assignment" (7 erros, linha 44 do fb_bancoEt200_16 [FB2], IM 151-8 = S7-300).
Causa: o FB repassava seus proprios parametros IN_OUT do tipo ARRAY (Cmd, HabPed, SaidaContatora, EntradaContatoAux, HabResp, FalhaRetorno, ContatorColado) para os IN_OUT do fb_supervisaoChaves16 (multi-instancia);
no S7-300 um parametro formal de tipo complexo nao pode ser repassado assim. Correcao (fb_bancoEt200_16 v0.4): copiar para arrays ESTATICOS do proprio FB antes da chamada e devolver HabResp/FalhaRetorno/ContatorColado depois. Logica identica.
Tambem: nome da instancia ibc56_/ibc400_ no comentario do FC, linha do ComOk e lista de parametros obrigatorios, sem mencao ao fc_vidaET (nao e mais usado). Nao sobrescreve. RASCUNHO, nao compilado no TIA."""
import os, shutil, re
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); V2, V3 = os.path.join(R, 'entrega_et200_v0.2'), os.path.join(R, 'entrega_et200_v0.3'); assert os.path.exists(V2) and not os.path.exists(V3)
shutil.copytree(V2, V3); d = os.path.join(V3, 'PLC_ET200')
def troca(t, a, b, nome):
    assert t.count(a) == 1, (nome, t.count(a)); return t.replace(a, b, 1)
old = os.path.join(d, 'fb_bancoEt200_16_v0.3.scl'); t = open(old, encoding='utf-8').read(); os.remove(old)
t = troca(t, 'TITLE = fb_bancoEt200_16 v0.3', 'TITLE = fb_bancoEt200_16 v0.4', 'title'); t = troca(t, 'VERSION : 0.3', 'VERSION : 0.4', 'version')
t = troca(t, '////====================================\n', '////====================================\n//// VERSAO : 0.4 (14/11/2026) - corrige o erro de compilacao "Invalid parameter assignment" (S7-300): os arrays IN_OUT deste FB sao COPIADOS para arrays estaticos (_sCmd, _sHabPed, _sSaidaQ, _sAuxIn, _sHabResp, _sFalha, _sColado) antes de chamar o fb_supervisaoChaves16 e HabResp/FalhaRetorno/ContatorColado sao devolvidos depois. Logica igual a v0.3. O nome do bloco no TIA nao leva versao.\n', 'hist')
t = troca(t, '      _sup         : "fb_supervisaoChaves16";   // v0.3: supervisao do retorno SB (multi-instancia)\n',
          '      _sup         : "fb_supervisaoChaves16";   // v0.3: supervisao do retorno SB (multi-instancia)\n      _sCmd        : Array[1..16] of Bool;   // v0.4: copias ESTATICAS dos arrays (S7-300 nao repassa IN_OUT de tipo complexo)\n      _sHabPed     : Array[1..16] of Bool;\n      _sSaidaQ     : Array[1..16] of Bool;\n      _sAuxIn      : Array[1..16] of Bool;\n      _sHabResp    : Array[1..16] of Bool;\n      _sFalha      : Array[1..16] of Bool;\n      _sColado     : Array[1..16] of Bool;\n', 'vars')
chamada = '''   #_sup(NumChaves := #_n, TempoRetornoMs := #TempoRetornoMs, ComOk := #ComOk, Seq := #Seq,
         Cmd := #Cmd, HabPed := #HabPed, SaidaQ := #SaidaContatora, AuxIn := #EntradaContatoAux,
         HabResp := #HabResp, FalhaRetorno := #FalhaRetorno, ContatorColado := #ContatorColado);
'''
nova = '''   // v0.4: copia para os arrays estaticos, chama a supervisao e devolve a resposta (ver o cabecalho).
   FOR #i := 1 TO 16 DO
      #_sCmd[#i] := #Cmd[#i];
      #_sHabPed[#i] := #HabPed[#i];
      #_sSaidaQ[#i] := #SaidaContatora[#i];
      #_sAuxIn[#i] := #EntradaContatoAux[#i];
   END_FOR;
   #_sup(NumChaves := #_n, TempoRetornoMs := #TempoRetornoMs, ComOk := #ComOk, Seq := #Seq,
         Cmd := #_sCmd, HabPed := #_sHabPed, SaidaQ := #_sSaidaQ, AuxIn := #_sAuxIn,
         HabResp := #_sHabResp, FalhaRetorno := #_sFalha, ContatorColado := #_sColado);
   FOR #i := 1 TO 16 DO
      #HabResp[#i] := #_sHabResp[#i];
      #FalhaRetorno[#i] := #_sFalha[#i];
      #ContatorColado[#i] := #_sColado[#i];
   END_FOR;
'''
t = troca(t, chamada, nova, 'chamada')
# prova estrutural: a chamada da supervisao so usa arrays estaticos; os 3 arrays de resposta voltam
bloco = t[t.index('#_sup(NumChaves'):t.index('ContatorColado := #_sColado);')]
for f in ('#Cmd', '#HabPed', '#SaidaContatora', '#EntradaContatoAux', '#HabResp', '#FalhaRetorno', '#ContatorColado'): assert f not in bloco.replace('#_s', ''), f
open(os.path.join(d, 'fb_bancoEt200_16_v0.4.scl'), 'w', encoding='utf-8').write(t)
old = os.path.join(d, 'fc_bancosEt200_v0.2.scl'); f = open(old, encoding='utf-8').read(); os.remove(old)
f = f.replace('ibcbc56_', 'ibc56_').replace('ibcbc400_', 'ibc400_').replace('TITLE = fc_bancosEt200 v0.2', 'TITLE = fc_bancosEt200 v0.3').replace('VERSION : 0.2', 'VERSION : 0.3', 1)
f = troca(f, '//// fc_bancosEt200 v0.2 (14/11/2026)', '//// fc_bancosEt200 v0.3 (14/11/2026): nome da instancia ibc56_/ibc400_; linha do ComOk; parametros obrigatorios; sem fc_vidaET. v0.2 (14/11/2026)', 'fc hist')
f = f.replace('O fb_bancoEt200_16 ja incrementa o VidaET: nao chame o fc_vidaET junto.', 'O fb_bancoEt200_16 ja incrementa o VidaET.')
f = f.replace('sem fc_vidaET. v0.2', 'v0.2')
OBR = '   // OBRIGATORIOS (IN_OUT, o compilador exige todos): Cmd, Vida1515, LigarBanco, HabPed, Seq, HabResp, Eco, FalhaRetorno, ContatorColado, VidaET, Fbk, SeletoraAuto, SaidaContatora, EntradaContatoAux.\n   // OPCIONAL (saida): ComOk => <seu tag Bool>  (o TIA coloca "ComOk=> bool_out" ao arrastar o FB: troque pelo seu tag ou apague a linha).\n'
for b in ('BC56', 'BC400'):
    linha = [l for l in f.split('\n') if '// Parametros:' in l and '<seu tag da seletora do %s' % b in l][0]; f = f.replace(linha, OBR + linha, 1)
open(os.path.join(d, 'fc_bancosEt200_v0.3.scl'), 'w', encoding='utf-8').write(f)
cu = os.path.join(V3, 'COMO_USAR_et200.txt'); c = open(cu, encoding='utf-8').read()
c = c.replace('entrega ET200 v0.2', 'entrega ET200 v0.3').replace(' Os nomes ja batem com os do projeto.', ' Os nomes ja batem com os do projeto.')
c = c.replace(' 5. Chame o fc_bancosEt200 1 vez por ciclo no OB1. O fb_bancoEt200_16 ja incrementa o VidaET: se existir fc_vidaET, NAO chame junto.', ' 5. Chame o fc_bancosEt200 1 vez por ciclo no OB1. O fb_bancoEt200_16 ja incrementa o VidaET.')
c = c.replace('O QUE E:', 'v0.3 (14/11/2026): CORRIGE o erro de compilacao "Invalid parameter assignment" (7 erros) do fb_bancoEt200_16: agora e a v0.4 do FB. Se o FB2 ja esta no projeto, importe por cima (substituir) e, nas chamadas, botao direito > "Update block call" (a instancia ganhou variaveis estaticas).\n\nO QUE E:', 1)
assert 'fc_vidaET' not in c, 'ainda cita fc_vidaET'; open(cu, 'w', encoding='utf-8').write(c)
print('ok', V3)
