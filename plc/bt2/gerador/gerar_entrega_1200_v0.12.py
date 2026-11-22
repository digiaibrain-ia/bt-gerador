#!/usr/bin/env python3
"""11/11/2026 - entrega 1200 v0.12 = v0.11 com CADA DB EM UM ARQUIVO (pedido do programador do 1200: arquivo unico com varios DBs
fazia o TIA compilar os DBs de instancia junto). Nao sobrescreve. RASCUNHO, nao compilado. Uso: python3 plc/bt2/gerador/gerar_entrega_1200_v0.12.py"""
import os, re, shutil
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); V11, V12 = os.path.join(R, 'entrega_1200_v0.11'), os.path.join(R, 'entrega_1200_v0.12')
assert os.path.exists(V11) and not os.path.exists(V12)
shutil.copytree(V11, V12); d = os.path.join(V12, 'PLC_CARGA_1200')
def separa(arq, sufixo):
    t = open(os.path.join(d, arq), encoding='utf-8').read(); os.remove(os.path.join(d, arq))
    for m in re.finditer(r'^DATA_BLOCK "([^"]+)".*?^END_DATA_BLOCK[ \t]*\n?', t, re.S | re.M):
        nome = m.group(1); open(os.path.join(d, '%s_%s.scl' % (nome, sufixo)), 'w', encoding='utf-8').write(m.group(0).rstrip() + '\n'); print('gerado', nome)
separa('db_ComBancos_v0.8.scl', 'v0.12'); separa('db_InstanciasBancoCarga_v0.11.scl', 'v0.12')
open(os.path.join(V12, 'COMO_USAR.txt'), 'w', encoding='utf-8').write("""COMO USAR - PLC de Carga (S7-1214FC) - entrega v0.12   [rascunho: nao compilado]

1) Cada DB vem em UM arquivo. No TIA importe como FONTE EXTERNA (Gerar blocos), um de cada vez, NESTA ORDEM (pasta PLC_CARGA_1200):
   1. db3007_BC56_Com        (DB de telegrama)
   2. db3107_BC400_Com       (DB de telegrama)
   3. fb_supervisaoChaves16
   4. fb_bancoCarga16
   5. db3006i_BC56_BancoCarga   (DB de INSTANCIA do fb_bancoCarga16: so depois do FB)
   6. db3106i_BC400_BancoCarga  (DB de INSTANCIA: so depois do FB)
   7. fc_bancosCarga1200
2) Cada banco tem 2 DBs: telegrama (DB3007 BC56, DB3107 BC400) e instancia do FB (DB3006 BC56, DB3106 BC400; o "i" no nome = instancia).
   Se o TIA trocar o numero, corrija em Propriedades do bloco.
3) Crie os TAGS que o fc_bancosCarga1200 usa (ou troque pelos seus enderecos): BC56_I01..I13 (retorno das contatoras), BC56_Q01..Q13 (saidas),
   BC56_SEL_AUTO (seletora em Auto); o mesmo com BC400_.
4) Chame o fc_bancosCarga1200 1 vez por ciclo (OB1).
5) Habilite PUT/GET na CPU e crie a conexao S7 com o 1515 (o ID vai no 1515, em ID_Conexao).
6) Compile. Se der erro, mande a lista das mensagens.
Pasta PLC_1515 = blocos do 1515 (quem carrega e o Reginaldo).
""")
print('ok', V12)
