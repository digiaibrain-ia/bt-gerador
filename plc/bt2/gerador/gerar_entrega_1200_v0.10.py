#!/usr/bin/env python3
"""11/11/2026 - entrega 1200 v0.10 = v0.9 + os DBs de INSTANCIA do fb_bancoCarga16 (db3006_BC56_BancoCarga, db3106_BC400_BancoCarga).
Motivo (programador do 1200, erro na importacao; foto do TIA): o fc_bancosCarga1200 chama "db3106_BC400_BancoCarga" (sublinhado ondulado = simbolo inexistente), mas esse DB de instancia nao vinha em nenhum
arquivo (so estava citado no comentario). Cada banco usa DOIS DBs no 1200: o de TELEGRAMA (db3007/db3107, em db_ComBancos) e o de INSTANCIA do FB (db3006/db3106, novo arquivo).
Nao sobrescreve. RASCUNHO, nao compilado. Uso: python3 plc/bt2/gerador/gerar_entrega_1200_v0.10.py"""
import os, shutil
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); V9, V10 = os.path.join(R, 'entrega_1200_v0.9'), os.path.join(R, 'entrega_1200_v0.10')
assert os.path.exists(V9) and not os.path.exists(V10)
shutil.copytree(V9, V10); print('copiado entrega_1200_v0.9 -> v0.10')
t = ''
for nome, base in (('BC56', 3000), ('BC400', 3100)):
    n = base + 6
    t += ('DATA_BLOCK "db%d_%s_BancoCarga"\nTITLE = db%d_%s_BancoCarga (DB%d)\nAUTHOR : \'RegLobo\'\nVERSION : 0.1\n'
          '////====================================\n'
          '//// DB de INSTANCIA do fb_bancoCarga16 para o banco %s. Numero DB%d (base %d + 6). Importe DEPOIS do fb_bancoCarga16 e ANTES do fc_bancosCarga1200.\n'
          '//// (o outro DB do banco e o de TELEGRAMA, db%d_%s_Com, em db_ComBancos.) Se o TIA numerar diferente, ajuste o numero nas propriedades do bloco (numeracao manual).\n'
          '////====================================\n'
          '"fb_bancoCarga16"\nBEGIN\nEND_DATA_BLOCK\n\n') % (n, nome, n, nome, n, nome, n, base, base + 7, nome)
d = os.path.join(V10, 'PLC_CARGA_1200')
open(os.path.join(d, 'db_InstanciasBancoCarga_v0.10.scl'), 'w', encoding='utf-8').write(t)
print('gerado PLC_CARGA_1200/db_InstanciasBancoCarga_v0.10.scl')
