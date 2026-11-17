#!/usr/bin/env python3
"""10/11/2026 - RASTREIO_IDEIAS_v0.3.xlsx = v0.2 + coluna H "TIPO DO PEDIDO" (classificacao do ASSISTENTE, a revisar pelo Reginaldo) + blocos novos na aba Resumo (contagem por tipo e fonte x tipo).
Tipos: ACRESCENTA (pede algo novo/mais) | CORTA (reduz escopo, remove, limita, adia para o futuro) | CONSOLIDA (junta, unifica, organiza, sincroniza, sem tirar funcao) | CORRIGE (aponta erro, defeito ou retrabalho)
       | PERGUNTA (pede informacao, analise ou decisao) | OUTRO (aprovacao, contexto, ambiguo, sem pedido claro).
Hipotese a testar (NAO provada): os pedidos do Reginaldo tendem a CORTAR/CONSOLIDAR; as sugestoes do assistente tendem a ACRESCENTAR. Nao sobrescreve. Depois de gerar, recalcular no LibreOffice/Excel."""
import os, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
D = os.path.dirname(os.path.abspath(__file__)); src, dst = os.path.join(D, 'RASTREIO_IDEIAS_v0.2.xlsx'), os.path.join(D, 'RASTREIO_IDEIAS_v0.3.xlsx'); assert not os.path.exists(dst)
A, C, K, R, P, O = 'ACRESCENTA', 'CORTA', 'CONSOLIDA', 'CORRIGE', 'PERGUNTA', 'OUTRO'
T = {'S01': [P, P, P, R, R], 'S02': [P, P], 'S03': [A, A, A, P, P, O, A],
     'S04': [A, C, A, O, P, P, P, K, R, R, R, R, R, A, K, A],
     'S05': [R, O, A, K, P, P, P, A, A, P, K, P, P, K, P],
     'S06': [A, P, O, P, P, A, O, C, P],
     'S07': [A, C, A, C, R, R, C, O, A, P, C, C, K, C, P, P, R, K, P, A, P, O, K]}
wb = openpyxl.load_workbook(src); ws = wb['Rastreio']; H = Font(bold=True); HF = PatternFill('solid', fgColor='EEF1F5')
c = ws.cell(1, 8, 'TIPO DO PEDIDO (classificação do assistente; a revisar)'); c.font = H; c.fill = HF; c.alignment = Alignment(wrap_text=True, vertical='top')
n = 0
for r in range(2, ws.max_row + 1):
    s, i = ws.cell(r, 1).value, ws.cell(r, 2).value
    if not s: continue
    ws.cell(r, 8, T[s][i - 1]); n += 1
assert all(len(v) == sum(1 for r in range(2, ws.max_row + 1) if ws.cell(r, 1).value == k) for k, v in T.items()), 'tamanho da lista de tipos nao bate com as linhas'
ws.column_dimensions['H'].width = 22; ws.auto_filter.ref = 'A1:H%d' % ws.max_row
rs = wb['Resumo']; base = rs.max_row + 2
rs.cell(base, 1, 'TIPO DO PEDIDO'); rs.cell(base, 2, 'Todas'); rs.cell(base, 3, 'Só evidência A')
for j in (1, 2, 3): rs.cell(base, j).font = H; rs.cell(base, j).fill = HF
tipos = [A, C, K, R, P, O]
for k, t in enumerate(tipos, 1):
    rs.cell(base + k, 1, t); rs.cell(base + k, 2, '=COUNTIF(Rastreio!H:H,A%d)' % (base + k)); rs.cell(base + k, 3, '=COUNTIFS(Rastreio!H:H,A%d,Rastreio!F:F,"A")' % (base + k))
b2 = base + len(tipos) + 2
rs.cell(b2, 1, 'FONTE DA IDEIA × TIPO (só evidência A)')
for j, t in enumerate(tipos, 2): rs.cell(b2, j, t)
for j in range(1, len(tipos) + 2): rs.cell(b2, j).font = H; rs.cell(b2, j).fill = HF
for k, f in enumerate(['REGINALDO', 'SUGESTAO-ASSISTENTE', '—'], 1):
    rs.cell(b2 + k, 1, f)
    for j, t in enumerate(tipos, 2):
        rs.cell(b2 + k, j, '=COUNTIFS(Rastreio!E:E,$A%d,Rastreio!H:H,%s$%d,Rastreio!F:F,"A")' % (b2 + k, openpyxl.utils.get_column_letter(j), b2))
rs.cell(b2 + 5, 1, 'Classificação do TIPO feita pelo assistente (relato, não prova). Hipótese a testar: pedidos do Reginaldo tendem a CORTAR/CONSOLIDAR; sugestões do assistente tendem a ACRESCENTAR.')
rs.column_dimensions['A'].width = 52
wb.save(dst); print('gerado', os.path.relpath(dst), n, 'linhas classificadas')
