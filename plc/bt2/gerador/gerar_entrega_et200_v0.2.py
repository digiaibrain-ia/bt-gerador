#!/usr/bin/env python3
"""14/11/2026 - entrega ET200 v0.2 = v0.1 com os nomes simbolicos REAIS dos DBs do projeto do ET200 (vistos no TIA do Reginaldo na bancada): "db38_ComBC56" (DB38) e "db39_ComBC400" (DB39); a v0.1 trazia "ComBC56"/"ComBC400".
Tambem: exemplo dos tags da seletora vistos no FC4 atual e passos para tirar do FC4 as networks que escrevem seletoraAuto no DB (escritor unico). Layout dos DBs identico (24 B). Nao sobrescreve. RASCUNHO, nao compilado."""
import os, shutil, re
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); V1, V2 = os.path.join(R, 'entrega_et200_v0.1'), os.path.join(R, 'entrega_et200_v0.2'); assert os.path.exists(V1) and not os.path.exists(V2)
shutil.copytree(V1, V2); d = os.path.join(V2, 'PLC_ET200')
for num, velho, novo in ((38, 'ComBC56', 'db38_ComBC56'), (39, 'ComBC400', 'db39_ComBC400')):
    old = os.path.join(d, 'db%d_%s_v0.4.scl' % (num, velho)); t = open(old, encoding='utf-8').read(); os.remove(old)
    assert t.count('DATA_BLOCK "%s"' % velho) == 1
    t = t.replace('DATA_BLOCK "%s"' % velho, 'DATA_BLOCK "%s"' % novo, 1).replace('TITLE = %s v0.4 (DB%d)' % (velho, num), 'TITLE = %s v0.5 (DB%d)' % (novo, num), 1).replace('VERSION : 0.4', 'VERSION : 0.5', 1)
    t = t.replace('//// %s (DB%d) v0.4' % (velho, num), '//// v0.5 (14/11/2026): so o NOME simbolico passou a %s (o nome real do DB no projeto do ET200); layout IDENTICO ao v0.4 (24 bytes).\n//// %s (DB%d) v0.4' % (novo, velho, num), 1)
    assert novo in t; open(os.path.join(d, 'db%d_%s_v0.5.scl' % (num, novo.split('_', 1)[1])), 'w', encoding='utf-8').write(t)
old = os.path.join(d, 'fc_bancosEt200_v0.1.scl'); t = open(old, encoding='utf-8').read(); os.remove(old)
t = t.replace('"ComBC56"', '"db38_ComBC56"').replace('"ComBC400"', '"db39_ComBC400"').replace('TITLE = fc_bancosEt200 v0.1', 'TITLE = fc_bancosEt200 v0.2').replace('VERSION : 0.1', 'VERSION : 0.2', 1)
t = t.replace('//// fc_bancosEt200 v0.1 (13/11/2026)', '//// fc_bancosEt200 v0.2 (14/11/2026): nomes dos DBs = db38_ComBC56 / db39_ComBC400 (reais no projeto). v0.1 (13/11/2026)', 1)
ex = {'BC400': ('%I5.2', '"Banco de Carga 01 em Automatico"'), 'BC56': ('%I5.3', '"Banco de Carga 02 em Automatico"')}
for b, (adr, nm) in ex.items():
    a = '"<seu tag da seletora do %s em Auto (1 = Auto)>"' % b; assert t.count(a) == 1
    linha = [l for l in t.split('\n') if a in l][0]; t = t.replace(linha, '   // Seletora do %s vista no seu FC4 atual (TIA): %s %s - confirme.\n' % (b, adr, nm) + linha, 1)
open(os.path.join(d, 'fc_bancosEt200_v0.2.scl'), 'w', encoding='utf-8').write(t)
os.remove(os.path.join(V2, 'COMO_USAR.txt'))   # v0.1 chamava COMO_USAR.txt; agora COMO_USAR_et200.txt
open(os.path.join(V2, 'COMO_USAR_et200.txt'), 'w', encoding='utf-8').write('''COMO USAR - teste com o ET200 (IM151-8) - entrega ET200 v0.2   [rascunho: nao compilado]

O QUE E: o 1515 manda o comando de cada chave (PUT) e le o retorno (GET); o ET200 liga a contatora de verdade e devolve o contato auxiliar real.
So BC56 e BC400 (13 chaves cada). ET200 = teste provisorio. v0.2: os DBs agora tem o NOME REAL do seu projeto (db38_ComBC56 e db39_ComBC400).

PASTA PLC_ET200 (carregar no ET200), 1 DB por arquivo
  db38_ComBC56 / db39_ComBC400   DB de TELEGRAMA (24 bytes), numeros 38 e 39. O 1515 escreve o pedido; so o fb_bancoEt200_16 escreve a resposta.
  fb_supervisaoChaves16          regra "contato auxiliar some -> a chave cai em 2 s". Usado dentro do fb_bancoEt200_16.
  fb_bancoEt200_16               a logica do banco (1 por banco): VIDA do ET200, perda de comunicacao, religar so com novo comando, habilitar/desabilitar, SB/CB.
  fc_bancosEt200                 onde voce liga os SEUS tags. E o unico bloco que voce edita.
  DBs de INSTANCIA do fb_bancoEt200_16: NAO vem em arquivo; voce cria ao chamar o FB (passo 4).

PASSO A PASSO - ET200
 1. DB38 e DB39 JA EXISTEM com o layout antigo (12 bytes). Importe, um arquivo por vez, como FONTE EXTERNA, nesta ordem: db38_ComBC56, db39_ComBC400, fb_supervisaoChaves16, fb_bancoEt200_16, fc_bancosEt200.
    Os nomes ja batem com os do projeto. O layout novo (24 bytes) SUBSTITUI o antigo: carregue junto com o 1515 (mesma janela). Sem "Acesso otimizado".
 2. NO FC4 ATUAL, as networks que escrevem a RESPOSTA no DB saem (o fb_bancoEt200_16 passa a ser o unico escritor):
      - Network 31 e 32 ("DBX10.0 seletora do banco em Auto/remoto"): escrevem %DB39.DBX10.0 e %DB38.DBX10.0. APAGUE.
      - Network 33 (%DB39.DBX4.0 ligarBanco -> %Q8.0 "Ligar Banco Carga 01"): le o PEDIDO e aciona uma saida; NAO e escrita no DB. Pode ficar (e saida do banco inteiro, fora destes blocos). Confira se e isso que voce quer.
    Se o FC4 tiver outras networks que escrevam no DB38/DB39 (fbk, vida, habResp...), tambem saem.
 3. Abra o fc_bancosEt200: cada banco tem 3 trechos (1 de 3, 2 de 3, 3 de 3). Escreva os SEUS tags ja existentes: retorno (contato auxiliar) de cada resistencia, saida de cada contatora e a seletora em Auto.
    Seletoras vistas no seu FC4: BC400 = %I5.2 ("Banco de Carga 01 em Automatico"); BC56 = %I5.3 ("Banco de Carga 02 em Automatico"). Confirme.
 4. DB DE INSTANCIA: no trecho "2 de 3" de cada banco, insira a chamada do fb_bancoEt200_16 (arraste o FB), nome ibc56_fb_bancoEt200_16 / ibc400_fb_bancoEt200_16 (numero livre). Os parametros estao no comentario.
 5. Chame o fc_bancosEt200 1 vez por ciclo no OB1. O fb_bancoEt200_16 ja incrementa o VidaET: se existir fc_vidaET, NAO chame junto.
 6. Compile. Se der erro, mande a lista das mensagens (e o nome do bloco).

PASTA PLC_1515 (quem carrega e o Reginaldo)
 1. Importe: fb100_setupChaves, fb101_ComEt200, db3000_BC56_Chaves, db3100_BC400_Chaves, db3002/db3102 (setup por tensao).
 2. chamadas_BC56_ET200 e chamadas_BC400_ET200: PUT P#DB38.DBX0.0 BYTE 10 / GET P#DB38.DBX10.0 BYTE 14 (BC400: DB39). Preencha o ID_Conexao com o da conexao S7 do ET200 (Hab := TRUE).
 3. Carregue o 1515 e o ET200 na mesma janela.

COMO SABER SE A COMUNICACAO SUBIU (carga de potencia DESACOPLADA)
 - No ET200 (watch table): "db38_ComBC56".vidaET tem que MUDAR a cada ~100 ms; "db38_ComBC56".vida1515 tambem muda (vem do 1515).
 - No 1515: ComOk = TRUE; StatusPut e StatusGet = 0; FalhaPut e FalhaGet = FALSE. Se nao: me mande os valores de StatusPut/StatusGet.
 - No medidor: o chip de cada banco deixa de dizer "sem comunicacao ET200" e a seletora aparece (Auto/Manual).
 - Depois: comando de uma chave liga a saida; sem retorno por 2 s a chave cai e trava e nao volta sozinha; sem vida do 1515 por mais de 2 s todas as saidas caem. Repita em BC56 e BC400.
''')
print('ok', V2)
