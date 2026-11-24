#!/usr/bin/env python3
"""11/11/2026 - entrega 1200 v0.11 = v0.10 com os DBs de instancia no PADRAO DO PROJETO ("i" depois do numero: db3006i_BC56_BancoCarga, db3106i_BC400_BancoCarga; igual a db3005i_BC56_ComCarga, db3004i_BC56_SetupChaves)
e com um texto CURTO de uso (COMO_USAR.txt) dentro do zip. O fc_bancosCarga1200 passa a chamar os nomes com "i". Nao sobrescreve. RASCUNHO, nao compilado.
Uso: python3 plc/bt2/gerador/gerar_entrega_1200_v0.11.py"""
import os, re, shutil
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); V10, V11 = os.path.join(R, 'entrega_1200_v0.10'), os.path.join(R, 'entrega_1200_v0.11')
assert os.path.exists(V10) and not os.path.exists(V11)
shutil.copytree(V10, V11); d = os.path.join(V11, 'PLC_CARGA_1200')
# DBs de instancia com o "i"
t = open(os.path.join(d, 'db_InstanciasBancoCarga_v0.10.scl'), encoding='utf-8').read(); os.remove(os.path.join(d, 'db_InstanciasBancoCarga_v0.10.scl'))
t = re.sub(r'(db(?:3006|3106))_', r'\1i_', t); assert t.count('i_BC') >= 4
open(os.path.join(d, 'db_InstanciasBancoCarga_v0.11.scl'), 'w', encoding='utf-8').write(t.replace('DB de INSTANCIA', 'DB de INSTANCIA ("i" no nome = instancia, padrao do projeto)'))
# FC chamando os nomes com "i"
f = open(os.path.join(d, 'fc_bancosCarga1200_v0.8.scl'), encoding='utf-8').read(); os.remove(os.path.join(d, 'fc_bancosCarga1200_v0.8.scl'))
n = len(re.findall(r'"db(3006|3106)_', f)); f = re.sub(r'"db(3006|3106)_', r'"db\1i_', f); assert n == 2
f = re.sub(r'(db3006|db3106)_(BC56|BC400)_BancoCarga', r'\1i_\2_BancoCarga', f)
open(os.path.join(d, 'fc_bancosCarga1200_v0.11.scl'), 'w', encoding='utf-8').write(f)
uso = """COMO USAR - PLC de Carga (S7-1214FC) - entrega v0.11   [rascunho: nao compilado]

1) No TIA do PLC de Carga, importe como FONTE EXTERNA (Gerar blocos), NESTA ORDEM (pasta PLC_CARGA_1200):
   db_ComBancos > fb_supervisaoChaves16 > fb_bancoCarga16 > db_InstanciasBancoCarga > fc_bancosCarga1200
2) Cada banco tem 2 DBs:  telegrama (DB3007 BC56, DB3107 BC400)  e  instancia do FB (DB3006 BC56, DB3106 BC400; o "i" no nome = instancia).
   Se o TIA trocar o numero, corrija em Propriedades do bloco.
3) Crie os TAGS que o fc_bancosCarga1200 usa (ou troque pelos seus enderecos): BC56_I01..I13 (retorno das contatoras), BC56_Q01..Q13 (saidas),
   BC56_SEL_AUTO (seletora em Auto); o mesmo com BC400_.
4) Chame o fc_bancosCarga1200 1 vez por ciclo (OB1).
5) Habilite PUT/GET na CPU e crie a conexao S7 com o 1515 (o ID vai no 1515, em ID_Conexao).
6) Compile. Se der erro, mande a lista das mensagens.
Pasta PLC_1515 = blocos do 1515 (quem carrega e o Reginaldo).
"""
open(os.path.join(V11, 'COMO_USAR.txt'), 'w', encoding='utf-8').write(uso)
print('entrega_1200_v0.11 gerada'); print(sorted(os.listdir(d)))
