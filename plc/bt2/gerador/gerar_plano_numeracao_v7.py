#!/usr/bin/env python3
"""Gera PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx (10/11/2026) a partir da v6: mantem TODAS as abas e acrescenta os numeros do PLC de cargas 1200
(formulas ligadas as abas Bancos/Regras). Nao sobrescreve. Uso: python3 plc/bt2/gerador/gerar_plano_numeracao_v7.py"""
import os, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
D = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'docs', 'bt2', 'plc'))
src, dst = os.path.join(D, 'PLANO_NUMERACAO_BLOCOS_PLC_v6_exemplo.xlsx'), os.path.join(D, 'PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx')
assert not os.path.exists(dst), dst
wb = openpyxl.load_workbook(src)
HF, HFILL, BLUE, VERDE = Font(bold=True), PatternFill('solid', fgColor='EEF1F5'), PatternFill('solid', fgColor='DDEBF7'), PatternFill('solid', fgColor='E2F0D9')
def cab(ws, row, vals, col0=1):
    for j, v in enumerate(vals, col0):
        c = ws.cell(row, j, v); c.font = HF; c.fill = HFILL; c.alignment = Alignment(wrap_text=True, vertical='top')

# ---- Regras: titulo + parametros do 1200 no fim (nenhuma linha existente muda)
ws = wb['Regras']
ws['A1'] = 'Numeração de blocos do PLC — BT2 — v7 — 10/11/2026 (inclui o PLC de cargas 1200)'
ws['A2'] = 'v7 = v6 + PLC de cargas 1200 (abas PLC_Carga_1200 e Telegrama_1200; colunas P a R em Bancos). Faixa v4 (bancos em 3000+). Células azuis são editáveis.'
r = ws.max_row + 2
cab(ws, r, ['Parâmetro (PLC de cargas 1200)', 'Valor', 'Origem'])
for i, (a, b, c) in enumerate([
        ('Offset: instância do bloco do banco no 1200 (fb_bancoCarga)', 6, 'decisão 09/11/2026: mesmos números da 1500 (base + 6)'),
        ('Offset: DB do telegrama PEDIDO/RESPOSTA no 1200', 7, 'decisão 09/11/2026 (base + 7): DB3007, DB3107, DB3207, DB3307'),
        ('Bytes do telegrama, até 16 chaves (PUT + GET)', '10 + 14', 'PUT P#DBn.DBX0.0 BYTE 10 / GET P#DBn.DBX10.0 BYTE 14 (FB101 v0.8)'),
        ('Bytes do telegrama, 17 a 32 chaves (PUT + GET)', '14 + 22', 'PUT P#DBn.DBX0.0 BYTE 14 / GET P#DBn.DBX14.0 BYTE 22 (FB103 v0.3)')], 1):
    ws.cell(r + i, 1, a); ws.cell(r + i, 2, b).fill = BLUE; ws.cell(r + i, 3, c)
R_INST, R_TEL = r + 1, r + 2   # linhas de Regras com offset 6 e 7

# ---- Bancos: colunas novas P, Q, R (formulas)
ws = wb['Bancos']
cab(ws, 1, ['DB inst. fb_bancoCarga (1200)', 'DB telegrama (1200)', 'Bytes PUT+GET (1200)'], 16)
for k in range(2, 6):
    ws.cell(k, 16, '=G%d+Regras!$B$%d' % (k, R_INST)).fill = VERDE
    ws.cell(k, 17, '=G%d+Regras!$B$%d' % (k, R_TEL)).fill = VERDE
    ws.cell(k, 18, '=IF(C%d<=Regras!$B$15,"10 + 14","14 + 22")' % k).fill = VERDE
for col in 'PQR': ws.column_dimensions[col].width = 18

# ---- ET200: status atualizado (coluna nova)
ws = wb['ET200']
cab(ws, 1, ['Atualização v7 (10/11/2026)'], 8)
notas = {2: 'ET200 provisório do 1200. Telegrama atual 10+14 B (ComBC56 v0.4). No 1200: DB3007 (mesmo layout).',
         3: 'Telegrama atual 10+14 B (ComBC400 v0.4). No 1200: DB3107.',
         4: 'No 1200 direto: DB3207, 14+22 B (FB103 v0.3). DB40 do ET200 (8+8) é rascunho antigo.',
         5: 'No 1200 direto: DB3307, 10+14 B (FB101 v0.8). DB41 do ET200 (6+6) é rascunho antigo.'}
for k, t in notas.items(): ws.cell(k, 8, t)
ws.column_dimensions['H'].width = 70

# ---- Pendencias
ws = wb['Pendencias']; n = ws.max_row
for i, (it, sit, q) in enumerate([
        ('Papel do PLC de cargas 1200: blocos = os mesmos do ET200 portados (fb_bancoCarga16/32, fb_supervisaoChaves16/32, DBs de telegrama, fc_bancosCarga1200); 1515 só ajusta as chamadas.', 'decidido em 09/11/2026 (entrega 1200 v0.5)', '—'),
        ('DB do telegrama entra por DB_ANY (só o número); PUT/GET continua com ponteiro absoluto P#DBn.', 'decidido em 09/11/2026', '—'),
        ('Fora do escopo agora: espelho para IHM, DB de competência, contator geral, ventilador, tensão de chaveamento (futuro).', 'decidido em 09/11/2026', '—'),
        ('PEEK/POKE com DB dinâmico na CPU 1215 FC (firmware não informado): confirmar nomes/parâmetros no TIA.', 'ABERTA — conferir ao compilar', 'Programador'),
        ('ID da conexão S7 (ID_Conexao), conexões livres e proteção de acesso da CPU 1215 FC.', 'ABERTA — o Reginaldo chama o assunto depois', 'Reginaldo'),
        ('Números de FB/FC do 1200: nomes fixos, números a definir no TIA (não atribuídos aqui).', 'ABERTA', 'Programador')], 1):
    ws.cell(n + i, 1, n + i - 1); ws.cell(n + i, 2, it); ws.cell(n + i, 3, sit); ws.cell(n + i, 4, q)

# ---- Nova aba: PLC_Carga_1200
ws = wb.create_sheet('PLC_Carga_1200')
ws['A1'] = 'PLC de cargas (S7-1200) — números usados (v7, 10/11/2026) — mesmos números da 1500 (base + 7 / base + 6)'; ws['A1'].font = HF
cab(ws, 3, ['Banco', 'Chaves reais', 'Tamanho do FB', 'DB telegrama (1200)', 'Nome do DB', 'DB inst. bloco do banco', 'Nome da instância', 'DB de chaves no 1515 (referência)', 'Bytes PUT+GET', 'PUT do 1515 (ponteiro)', 'GET do 1515 (ponteiro)'])
for i, (b, k) in enumerate([('BC56', 2), ('BC400', 3), ('BC59,5', 4), ('BC550', 5)]):
    r = 4 + i; sl = b.replace(',', '').replace('.', '')
    ws.cell(r, 1, b); ws.cell(r, 2, '=Bancos!C%d' % k); ws.cell(r, 3, '=IF(B%d<=Regras!$B$15,16,32)' % r)
    ws.cell(r, 4, '=Bancos!Q%d' % k).fill = VERDE; ws.cell(r, 5, '="db"&D%d&"_%s_Com"' % (r, sl))
    ws.cell(r, 6, '=Bancos!P%d' % k).fill = VERDE; ws.cell(r, 7, '="db"&F%d&"_%s_BancoCarga"' % (r, sl))
    ws.cell(r, 8, '=Bancos!H%d' % k); ws.cell(r, 9, '=Bancos!R%d' % k)
    ws.cell(r, 10, '="P#DB"&D%d&".DBX0.0 BYTE "&IF(C%d=16,10,14)' % (r, r)); ws.cell(r, 11, '="P#DB"&D%d&".DBX"&IF(C%d=16,10,14)&".0 BYTE "&IF(C%d=16,14,22)' % (r, r, r))
ws['A9'] = 'Blocos do 1200 (nomes fixos; números de FB/FC a definir no TIA)'; ws['A9'].font = HF
cab(ws, 10, ['Bloco', 'Tipo', 'Usado por', 'O que faz'])
for i, row in enumerate([
        ('fb_bancoCarga16', 'FB (1 instância por banco)', 'BC56, BC400, BC550', 'lado do banco do telegrama; entra só o nº do DB (DB_ANY), PEEK/POKE por offset'),
        ('fb_bancoCarga32', 'FB (1 instância por banco)', 'BC59,5', 'idem, 32 chaves'),
        ('fb_supervisaoChaves16', 'FB (multi-instância)', 'fb_bancoCarga16', 'regra SB some → CB cai em 2 s, falha travada'),
        ('fb_supervisaoChaves32', 'FB (multi-instância)', 'fb_bancoCarga32', 'idem, 32 chaves'),
        ('db_ComBancos', 'DBs (4)', 'DB3007, DB3107, DB3307, DB3207', 'telegrama PEDIDO/RESPOSTA (24 B ou 36 B), sem otimização'),
        ('fc_bancosCarga1200', 'FC', 'OB1 / OB de tempo fixo', 'copia as E/S físicas e chama os 4 bancos')], 11):
    for j, v in enumerate(row, 1): ws.cell(i + 11, j, v)
for col, w in zip('ABCDEFGHIJK', (16, 14, 16, 18, 24, 22, 26, 22, 14, 26, 26)): ws.column_dimensions[col].width = w

# ---- Nova aba: Telegrama_1200 (layouts)
ws = wb.create_sheet('Telegrama_1200')
ws['A1'] = 'Layout do telegrama (DB x07) — PEDIDO escrito pelo PUT do 1515; RESPOSTA escrita só pelo fb_bancoCarga'; ws['A1'].font = HF
cab(ws, 3, ['Campo', 'Sentido', '16 chaves (24 B)', '32 chaves (36 B)', 'Tipo'])
L = [('cmd', 'PEDIDO', 'X0.0', 'X0.0', 'Bool[n]'), ('vida1515', 'PEDIDO', 'W2', 'W4', 'Int'), ('ligarBanco', 'PEDIDO', 'X4.0', 'X6.0', 'Bool'),
     ('reserva', '—', 'B5', 'B7', 'Byte'), ('habPed', 'PEDIDO', 'X6.0', 'X8.0', 'Bool[n]'), ('seq', 'PEDIDO', 'W8', 'W12', 'Int'),
     ('fbk', 'RESPOSTA', 'X10.0', 'X14.0', 'Bool[n]'), ('vidaET', 'RESPOSTA', 'W12', 'W18', 'Int'), ('seletoraAuto', 'RESPOSTA', 'X14.0', 'X20.0', 'Bool'),
     ('reserva', '—', 'B15', 'B21', 'Byte'), ('habResp', 'RESPOSTA', 'X16.0', 'X22.0', 'Bool[n]'), ('eco', 'RESPOSTA', 'W18', 'W26', 'Int'),
     ('falhaRetorno', 'RESPOSTA', 'X20.0', 'X28.0', 'Bool[n]'), ('contatorColado', 'RESPOSTA', 'X22.0', 'X32.0', 'Bool[n]')]
for i, row in enumerate(L): 
    for j, v in enumerate(row, 1): ws.cell(4 + i, j, v)
for col, w in zip('ABCDE', (18, 12, 18, 18, 12)): ws.column_dimensions[col].width = w
wb.save(dst); print('gerado', os.path.relpath(dst))
