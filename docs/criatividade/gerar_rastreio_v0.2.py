#!/usr/bin/env python3
"""Gera RASTREIO_IDEIAS_v0.2.xlsx (10/11/2026): uma linha por pedido do Reginaldo, vindo dos extratos das sessoes do Project (relato do assistente, NAO prova).
Niveis de evidencia: A = mensagem original visivel + prompt final; B = mensagem original visivel + formato antigo (sem FONTE DA IDEIA, causas sem fonte); C = veio de resumo (segunda mao).
Nao sobrescreve. Uso: python3 docs/criatividade/gerar_rastreio_v0.1.py"""
import os, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment
D = os.path.dirname(os.path.abspath(__file__)); dst = os.path.join(D, 'RASTREIO_IDEIAS_v0.2.xlsx'); assert not os.path.exists(dst)
NR = 'NÃO-REGISTRADA'
SESS = [
 ('S01', 'DSE855: identificação e alimentação', 'COMPLETA (curta)', 'antigo', 'B', 'Hardware; sem ideia nova do projeto.'),
 ('S02', 'Open IE e faixa de numeração (datasheet CPU)', 'COMPLETA (curta)', 'antigo', 'B', 'Duas perguntas técnicas; sem ideia nova.'),
 ('S03', 'Skills / ambiente (notebook da empresa)', 'COMPLETA (curta)', 'antigo', 'B', 'Ambiente e ferramentas; restrição: empresa não libera Claude Code no notebook.'),
 ('S04', 'Medidor: layout, janelas, GitHub (Project)', 'PARCIAL + RESUMO (literal só de 01/11 22:18 a 02/11 02:19)', 'antigo', 'C/B', 'Linhas 1-8 vêm de resumo (C); 9-16 literais (B).'),
 ('S05', 'Numeração de blocos, Patamar/maquete, Software Units', 'RESUMO + trecho final visível', 'final', 'C/A', 'Linhas 1-11 vêm de resumo (C); 12-15 literais (A).'),
 ('S06', 'DSE: controle remoto Start/Stop (Modbus)', 'PARCIAL (original)', 'final', 'A', 'Teste de Start/Stop: resultado não visível. Endereço dos LEDs (Page 14 x 190) é inferência do assistente.'),
 ('S07', 'Blocos do 1200, medidor, criatividade (esta sessão)', 'RESUMO + trecho final visível', 'final', 'C/A', 'Linhas 1-3 vêm de resumo (C); 4-23 literais (A). Extrato em extratos/.'),
]
R = []  # sessao, N, pedido, origem, fonte, evidencia, obs
def add(s, n, p, o, f, e, ob=''): R.append((s, n, p, o, f, e, ob))
for n, p, o in [(1, 'Informações e alimentação do dispositivo DSE (2 fotos)', 'BANCADA'), (2, 'Posso ligar em 24 Vdc', 'REGRA-EQUIPAMENTO'), (3, 'É esse módulo igual? (foto de conector)', 'BANCADA'),
                (4, 'O cabo é roxo, é cabo de rede ligado no RJ45', 'REGRA-EQUIPAMENTO'), (5, '"Você é teimoso, hein?"', 'USO')]: add('S01', n, p, o, NR, 'B')
add('S02', 1, 'Open IE e faixa de numeração FC/FB/DB (datasheet)', 'REGRA-EQUIPAMENTO', NR, 'B'); add('S02', 2, 'Open IE pode ajudar Node-RED e HTML?', 'IDEIA-NOVA', NR, 'B')
for n, p, o in [(1, 'Rodar /gsd:new-project', 'IDEIA-NOVA'), (2, 'Rodar /paul:help', 'IDEIA-NOVA'), (3, 'Rodar script que copia skills', 'USO'), (4, 'Investigar .claude/ e skills.json', 'USO'),
                (5, 'Quais são as skills agora (notebook)?', 'USO'), (6, 'Empresa não libera Claude Code no notebook', 'USO'), (7, 'Quero instalar novas skills', 'IDEIA-NOVA')]: add('S03', n, p, o, NR, 'B')
S4 = [('BC59,5 e BC550 só para consulta, "Usar neste ensaio"', 'IDEIA-NOVA', 'C'), ('Salvar/mover arquivos (Drive/GitHub) para liberar espaço do Project', 'USO', 'C'),
 ('Estruturar o projeto (pastas, README, .gitignore, workflows)', 'IDEIA-NOVA', 'C'), ('Colou respostas de outra IA (perguntas, prompt, pacote inicial)', 'QUALIDADE', 'C'),
 ('"Você não tem conector para GitHub"', 'USO', 'C'), ('Celular ou PC? Usar conta existente ou outra', 'USO', 'C'), ('Dezenas de perguntas de tela do GitHub', 'USO', 'C'),
 ('Atualizar quais versões são as atuais; "perdido"', 'USO', 'C'), ('SIZE do dlgGuiado fora da tela; legenda; mover à esquerda; inspetor', 'USO', 'B'),
 ('Retângulo laranja do inspetor fora do botão', 'USO', 'B'), ('"A correção do SIZE ficou pior"', 'USO', 'B'), ('dlgDemo com SIZE errado; testar todas as janelas; maquete', 'USO', 'B'),
 ('Altura do dlgDemo; falha no triângulo; cadê a maquete; Patamar acima do Banco', 'USO', 'B'), ('BC56 e BC400 como cards com setinha; Patamar "quase acertou"', 'IDEIA-NOVA', 'B'),
 ('Tudo do diálogo Patamar dentro do card', 'USO', 'B'), ('Instalar repositório de skills GSAP', 'IDEIA-NOVA', 'B')]
for i, (p, o, e) in enumerate(S4, 1): add('S04', i, p, o, NR, e, 'texto vem de resumo (paráfrase)' if e == 'C' else '')
S5 = [('Rejeitou a planilha de numeração do assistente', 'QUALIDADE', '—', 'C'), ('Enviou os documentos reais (plano .md e .xlsx v4); aguardar "ACABOU"', 'QUALIDADE', '—', 'C'),
 ('Nova distribuição de números de bloco (faixa S7-1500)', 'IDEIA-NOVA', 'REGINALDO', 'C'), ('Subir ao GitHub os arquivos que faltavam', 'IDEIA-NOVA', 'REGINALDO', 'C'),
 ('Refinar numeração (OB, cards HTML futuros)', 'DECISAO-PENDENTE', NR, 'C'), ('Quem migra primeiro: PLC? e depois?', 'DECISAO-PENDENTE', 'REGINALDO', 'C'), ('"Então o que vamos agora?"', 'DECISAO-PENDENTE', 'REGINALDO', 'C'),
 ('Patamar visível na tela principal junto do card Bancos de Cargas', 'IDEIA-NOVA', 'REGINALDO', 'C'), ('Maquete em outro HTML com o novo layout', 'IDEIA-NOVA', 'REGINALDO', 'C'),
 ('"Você está atualizando os arquivos no GitHub?"', 'QUALIDADE', '—', 'C'), ('"Quero" (sincronizar Project → GitHub)', 'IDEIA-NOVA', 'SUGESTAO-ASSISTENTE', 'C'),
 ('Diferença entre usar por aqui e no Claude Code (eficiência e custo)', 'DECISAO-PENDENTE', 'REGINALDO', 'A'), ('Onde fica o arquivo baixado (mobile)', 'USO', '—', 'A'),
 ('Anexou medidor v1.10.134 (sem texto)', 'DECISAO-PENDENTE', 'SUGESTAO-ASSISTENTE', 'A'), ('Software Units (S7-1500): vale usar no projeto?', 'DECISAO-PENDENTE', NR, 'A')]
for i, (p, o, f, e) in enumerate(S5, 1): add('S05', i, p, o, f, e, 'link da Siemens com utm_source=chatgpt.com (pista, não prova)' if i == 15 else ('texto vem de resumo (paráfrase)' if e == 'C' else ''))
S6 = [('Modbus do DSE permite comando de Start e Stop', 'IDEIA-NOVA', 'REGINALDO'), ('"Eu te enviei as documentações?"', 'USO', '—'), ('"Agora tem no contexto protocolo DSE"', 'IDEIA-NOVA', 'REGINALDO'),
 ('Certeza sobre sinais de LED; dá para partida remota?', 'BANCADA (REGRA-EQUIPAMENTO)', 'REGINALDO'), ('Estender o recurso para toda a família DeepSea?', 'DECISAO-PENDENTE', 'REGINALDO'),
 ('Fluxo atual continua; fluxo novo só de escrita (DSE e HTML)', 'IDEIA-NOVA (DECISAO-PENDENTE)', 'REGINALDO'), ('"Pode fazer como você falou... vamos seguir nesse caminho"', 'IDEIA-NOVA', 'SUGESTAO-ASSISTENTE'),
 ('Só Start e Stop; Automático não precisa', 'IDEIA-NOVA', 'REGINALDO'), ('Plano de teste: partir pelo DSE e mandar Stop pelo fluxo', 'DECISAO-PENDENTE', 'SUGESTAO-ASSISTENTE')]
for i, (p, o, f) in enumerate(S6, 1): add('S06', i, p, o, f, 'A')

S7 = [('Elaborar blocos para a ET200 e a 1200 e passar ao outro programador', 'IDEIA-NOVA', 'REGINALDO', 'C'), ('Só blocos do 1200 real; sinais do card; DB = número da 1500; mandar PUT/GET', 'IDEIA-NOVA', 'REGINALDO', 'C'),
 ('Incluir BC59,5; o que tem na etapa 3; DB26 esquecido; as 7 perguntas', 'DECISAO-PENDENTE', 'REGINALDO', 'C'), ('Respostas às 7 perguntas (firmware, endereços, ventilador, futuro)', 'REGRA-EQUIPAMENTO (DECISAO-PENDENTE)', 'REGINALDO', 'A'),
 ('"Por que DB3208? Eu falei que saía para o futuro"', 'QUALIDADE', '—', 'A'), ('Focar só no assunto da pergunta; sem achismo', 'QUALIDADE', '—', 'A'), ('Pode atualizar (tirar chaveamento); só sinais de pedido do card; muito token', 'QUALIDADE', 'REGINALDO', 'A'),
 ('"Número do BBB ... top 7 dentro" (ambíguo)', 'DECISAO-PENDENTE', NR, 'A'), ('Número do DB na entrada, bloco trata por dentro (DB_ANY)', 'IDEIA-NOVA', 'REGINALDO', 'A'),
 ('Analisar exemplo DB_ANY de outra sessão contra o projeto', 'DECISAO-PENDENTE', 'SUGESTAO-ASSISTENTE', 'A'), ('"Somente uso do DB_any"', 'DECISAO-PENDENTE', 'REGINALDO', 'A'),
 ('PUT/GET continua ponteiro? "Prefiro como ficou"', 'DECISAO-PENDENTE', 'REGINALDO', 'A'), ('Zip tem arquivo explicando como usar? "Mais lógica, evita confusão"', 'QUALIDADE', 'SUGESTAO-ASSISTENTE', 'A'),
 ('1200 = mesmos blocos do ET200; só os blocos que vou usar, sem versões antigas nem texto', 'QUALIDADE (REGRA-EQUIPAMENTO)', 'REGINALDO', 'A'), ('Rodar o medidor em outro PC: precisa de algum .js?', 'USO', '—', 'A'),
 ('Só o Demo: sem catálogo? "Cadê os 3 para baixar"', 'USO', '—', 'A'), ('CSV com acentos quebrados', 'USO', '—', 'A'), ('Planilha com todas as abas da distribuição de números incluindo o 1200', 'IDEIA-NOVA', 'REGINALDO', 'A'),
 ('Demo 100% DSE auto: por que o diálogo "Salvar registros" no fim?', 'USO', '—', 'A'), ('"Quero esta opção" (perguntar ao final do ensaio: sim/não)', 'IDEIA-NOVA', 'SUGESTAO-ASSISTENTE', 'A'),
 ('Voltar ao assunto da criatividade: onde paramos?', 'DECISAO-PENDENTE', 'REGINALDO', 'A'), ('"Só me manda o prompt"', 'USO', '—', 'A'), ('Considerar sessões com prompt antigo; criar pasta no GitHub', 'IDEIA-NOVA', 'REGINALDO', 'A')]
for i, (p, o, f, e) in enumerate(S7, 1): add('S07', i, p, o, f, e, 'texto vem de resumo (paráfrase)' if e == 'C' else '')

wb = openpyxl.Workbook(); H = Font(bold=True); HF = PatternFill('solid', fgColor='EEF1F5')
def cab(ws, vals):
    for j, v in enumerate(vals, 1): c = ws.cell(1, j, v); c.font = H; c.fill = HF; c.alignment = Alignment(wrap_text=True, vertical='top')
ws = wb.active; ws.title = 'Sessoes'; cab(ws, ['Sessão', 'Assunto', 'Cobertura', 'Formato do extrato', 'Evidência', 'Observação', 'Pedidos'])
for i, s in enumerate(SESS, 2):
    for j, v in enumerate(s, 1): ws.cell(i, j, v)
    ws.cell(i, 7, '=COUNTIF(Rastreio!A:A,A%d)' % i)
for k, w in zip('ABCDEFG', (8, 46, 40, 14, 10, 70, 9)): ws.column_dimensions[k].width = w
ws = wb.create_sheet('Rastreio'); cab(ws, ['Sessão', 'N', 'Pedido do Reginaldo (curto)', 'ORIGEM', 'FONTE DA IDEIA', 'Evidência', 'Observação'])
for i, r in enumerate(R, 2):
    for j, v in enumerate(r, 1): ws.cell(i, j, v)
for k, w in zip('ABCDEFG', (8, 5, 70, 28, 22, 10, 55)): ws.column_dimensions[k].width = w
ws.freeze_panes = 'A2'; ws.auto_filter.ref = 'A1:G%d' % (len(R) + 1)
ws = wb.create_sheet('Resumo'); ws['A1'] = 'Contagens (fórmulas sobre a aba Rastreio). Relato do assistente, não prova; evidência A = melhor, C = segunda mão.'; ws['A1'].font = H
cab2 = ['ORIGEM (contém; linha com 2 origens conta nas duas)', 'Todas', 'Só evidência A']; 
for j, v in enumerate(cab2, 1): c = ws.cell(3, j, v); c.font = H; c.fill = HF
for i, o in enumerate(['BANCADA', 'REGRA-EQUIPAMENTO', 'USO', 'IDEIA-NOVA', 'DECISAO-PENDENTE', 'QUALIDADE'], 4):
    ws.cell(i, 1, o); ws.cell(i, 2, '=COUNTIF(Rastreio!D:D,"*"&A%d&"*")' % i); ws.cell(i, 3, '=COUNTIFS(Rastreio!D:D,"*"&A%d&"*",Rastreio!F:F,"A")' % i)
for j, v in enumerate(['FONTE DA IDEIA', 'Todas', 'Só evidência A'], 1): c = ws.cell(11, j, v); c.font = H; c.fill = HF
for i, f in enumerate(['REGINALDO', 'SUGESTAO-ASSISTENTE', 'OUTRA-PESSOA', 'EQUIPAMENTO', NR, '—'], 12):
    ws.cell(i, 1, f); ws.cell(i, 2, '=COUNTIF(Rastreio!E:E,A%d)' % i); ws.cell(i, 3, '=COUNTIFS(Rastreio!E:E,A%d,Rastreio!F:F,"A")' % i)
ws.column_dimensions['A'].width = 50; ws.column_dimensions['B'].width = 10; ws.column_dimensions['C'].width = 16
wb.save(dst); print('gerado', os.path.relpath(dst), len(R), 'linhas')
