#!/usr/bin/env python3
"""10/11/2026 - entrega 1200 v0.9: lado do 1515 (S7-1500) ESPECIFICO para comunicar com o PLC de Carga 1200 (pedido do Reginaldo: o FB101 vinha com nome/comentarios do ET200).
Mudancas vs v0.8 (so no PLC_1515): fb101_ComEt200 v0.8 -> fb101_ComCarga v0.9 (MESMA LOGICA; so nome e comentarios; conferido por script); instancias db3005i_BC56_ComCarga / db3105i_BC400_ComCarga;
chamadas v0.5 (remoto DB3007/DB3107; "db52_BancoTeste2_DSE" -> "db2000_BancoTeste2_DSE", nome do plano de numeracao). PLC_CARGA_1200 e fb100/db3000/db3100 iguais a v0.8 (copiados).
Nao sobrescreve. RASCUNHO, nao compilado. Uso: python3 plc/bt2/gerador/gerar_entrega_1200_v0.9.py"""
import os, re, shutil
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')); V8, V9 = os.path.join(R, 'entrega_1200_v0.8'), os.path.join(R, 'entrega_1200_v0.9')
ET = os.path.join(R, 'comunicacao_et200'); assert os.path.exists(V8) and not os.path.exists(V9)
def le(p): return open(p, encoding='utf-8').read()
def grava(sub, n, t):
    d = os.path.join(V9, sub); os.makedirs(d, exist_ok=True); open(os.path.join(d, n), 'w', encoding='utf-8').write(t); print('gerado', sub + '/' + n)
def copia(sub, n):
    d = os.path.join(V9, sub); os.makedirs(d, exist_ok=True); shutil.copy(os.path.join(V8, sub, n), os.path.join(d, n)); print('copiado', sub + '/' + n)
for n in sorted(os.listdir(os.path.join(V8, 'PLC_CARGA_1200'))): copia('PLC_CARGA_1200', n)
for n in ('fb100_setupChaves_v0.4.scl', 'db3000_BC56_Chaves_v0.3.db', 'db3100_BC400_Chaves_v0.3.db'): copia('PLC_1515', n)
# ---- FB101 -> fb101_ComCarga v0.9
o = le(os.path.join(ET, 'fb101_ComEt200_v0.8.scl')); corpo = o[o.index('   VAR_INPUT'):]
corpo_n = corpo.replace('ET200', 'PLC de Carga').replace('BC56: P#DB38.DBX0.0 BYTE 10', 'BC56: P#DB3007.DBX0.0 BYTE 10').replace('BC56: P#DB38.DBX10.0 BYTE 14', 'BC56: P#DB3007.DBX10.0 BYTE 14').replace('ID local da conexao S7 (W#16#100, mesma para os 2 bancos)', 'ID local da conexao S7 do 1515 com o PLC de Carga (a PREENCHER no TIA; o mesmo para os 2 bancos)')
cab = ('FUNCTION_BLOCK "fb101_ComCarga"\nTITLE = fb101_ComCarga v0.9 (FB101)\n{ S7_Optimized_Access := \'FALSE\' }\nAUTHOR : \'Reginaldo Lobo\'\nVERSION : 0.9\n'
       '////====================================\n'
       '//// fb101_ComCarga (FB101) v0.9 (10/11/2026) - RASCUNHO, nao compilado, nao testado no PLC. Lado do 1515 (S7-1500) para o PLC de CARGA (S7-1214FC).\n'
       '////   = fb101_ComEt200 v0.8 com o nome e os comentarios trocados para o PLC de Carga. A LOGICA E IDENTICA (conferido por script: o codigo da v0.8 e da v0.9 sao iguais depois de trocar o nome).\n'
       '//// O QUE FAZ : troca de sinais 1515 <-> PLC de Carga por S7 PUT/GET, um banco por instancia: PUT 10 bytes (PEDIDO: cmd[16], vida do 1515, ligarBanco, habPed[16], seq)\n'
       '////             e GET 14 bytes (RESPOSTA: fbk[16], vida do PLC de Carga, seletoraAuto, habResp[16], eco, falhaRetorno[16], contatorColado[16]).\n'
       '////             Habilitar/desabilitar com confirmacao (habPed/habResp), seq/eco (RespEcoOk) e regra "SB some -> CB cai" (o PLC de Carga trava a falha; este FB zera o CbLigar da chave).\n'
       '//// REMOTO    : BC56 = DB3007; BC400 = DB3107 no PLC de Carga (tipo ComBanco, 24 bytes, sem acesso otimizado). PUT P#DB3007.DBX0.0 BYTE 10 / GET P#DB3007.DBX10.0 BYTE 14.\n'
       '////             O PLC de Carga precisa do fb_bancoCarga16 + db_ComBancos (entrega 1200) e os DBs db3000/db3100 v0.3 (com sbRet) no 1515. Carregar os dois PLCs na mesma janela.\n'
       '//// INSTANCIAS: db3005i_BC56_ComCarga (DB3005) e db3105i_BC400_ComCarga (DB3105). ID_Conexao: a PREENCHER (ID da conexao S7 criada no TIA para o PLC de Carga).\n'
       '//// COMO OPERA: chamar 1x por ciclo no OB ciclico, ANTES do fb100_setupChaves. IN_OUT: CbLigar[] escrito pelo FB100/Node-RED e ZERADO por este FB quando o banco nao esta liberado;\n'
       '////             LigarBanco escrito pelo Node-RED e ZERADO por este FB se a seletora sai de Auto ou a comunicacao cai; SbLigada[] escrito so por este FB.\n'
       '//// FALHA     : sem vida nova do PLC de Carga por TempoVida (3 s) -> ComOk=FALSE, SbLigada[] zerado, SeletoraAuto=FALSE, LigarBanco e CbLigar[] zerados (sem religamento automatico).\n'
       '//// HISTORICO : v0.8 (06/11/2026) pedido/resposta e SB some -> CB cai; v0.9: so nome e comentarios (PLC de Carga em vez do ET200). O nome do bloco no TIA nao leva versao: a versao fica aqui.\n'
       '////=====================================\n')
grava('PLC_1515', 'fb101_ComCarga_v0.9.scl', cab + corpo_n)
# conferencia: logica identica
def codigo(t): return [re.sub(r'\s*//.*$', '', l).rstrip() for l in t.split('\n') if re.sub(r'\s*//.*$', '', l).strip()]
a = [l.replace('fb101_ComEt200', 'X') for l in codigo(corpo)]; b = [l.replace('fb101_ComCarga', 'X') for l in codigo(corpo_n)]
assert a == b, 'o codigo do FB101 mudou alem dos comentarios'
print('FB101: codigo identico ao v0.8 (%d linhas de codigo)' % len(a))
# ---- chamadas v0.5
for nome, base in (('BC56', 3000), ('BC400', 3100)):
    t = le(os.path.join(V8, 'PLC_1515', 'chamadas_%s_v0.4.scl' % nome))
    t = re.sub(r'^(// .*\n)+', '', t)   # tira os comentarios antigos (v0.3/v0.4)
    t = t.replace('"db%di_%s_ComEt200"' % (base + 5, nome), '"db%di_%s_ComCarga"' % (base + 5, nome)).replace('fb101_ComEt200', 'fb101_ComCarga').replace('db52_BancoTeste2_DSE', 'db2000_BancoTeste2_DSE')
    assert 'ComEt200' not in t.replace('comEt200Ok', ''), 'sobrou ComEt200 em ' + nome
    h = ('// chamadas_%s v0.5 (10/11/2026) - RASCUNHO, nao compilado. Lado do 1515 para o PLC de CARGA (1214FC): fb101_ComCarga v0.9 + fb100_setupChaves v0.4.\n'
         '// Banco %s (13 chaves) -> arrays de 16. Remoto no PLC de Carga: DB%d (PUT BYTE 10 / GET BYTE 14). ID_Conexao: a PREENCHER (conexao S7 do 1515 com o PLC de Carga).\n'
         '// Ordem no OB1: 1) comunicacao (fb101_ComCarga) 2) setup (fb100_setupChaves). Instancias: criar como "fb101_ComCarga" (DB%d) e "fb100_setupChaves" (DB%d).\n'
         '// "db2000_BancoTeste2_DSE" = o antigo db52 renumerado (plano de numeracao v7.1): CONFERIR o nome do DB e os campos ledManual, potenciaKw, tensaoL1L2/L2L3/L3L1 no TIA.\n'
         '// Campo "comEt200Ok" do DB de chaves: nome mantido (so simbolico; renomear quebraria as referencias do FC100/card); significa "comunicacao com o PLC de Carga ok".\n') % (nome, nome, base + 7, base + 5, base + 4)
    grava('PLC_1515', 'chamadas_%s_v0.5.scl' % nome, h + t)
