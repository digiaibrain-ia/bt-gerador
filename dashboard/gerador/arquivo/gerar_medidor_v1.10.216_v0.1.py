#!/usr/bin/env python3
"""16/11/2026 - Gera medidor_gerador_v1.10.216.html (de 1.10.215). Nao sobrescreve; aborta se um trecho esperado mudou.
Pedido do Reginaldo: area RNC SEPARADA no medidor, com botao de ativacao (nasce DESLIGADA: hoje o RNC e o cartao escrito), e, sem rede, guardar o registro em arquivo .csv e enviar quando a rede voltar.
Troca o modulo rnc_defeito v0.3 -> v0.4 e a fase RNC do robo v0.4 -> v0.5 (pula quando o RNC esta desligado). Resto igual a 1.10.215.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.216_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas'); M = os.path.join(R, 'dashboard', 'modulos-fonte')
L = lambda p: open(p, encoding='utf-8').read()
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.215.html'), os.path.join(F, 'medidor_gerador_v1.10.216.html'); assert os.path.exists(o) and not os.path.exists(d)
t = L(o)
for velho, novo in (('rnc_defeito_v0.3.js', 'rnc_defeito_v0.4.js'), ('robo_fase_rnc_v0.4.js', 'robo_fase_rnc_v0.5.js')):
    a, b = L(os.path.join(M, velho)), L(os.path.join(M, novo)); assert '</script' not in b.lower(); t = troca(t, a, b, velho)
t = troca(t, '<meta name="app-version" content="1.10.215">', '<meta name="app-version" content="1.10.216">', 'meta')
t = troca(t, "const VERSAO='1.10.215', VERSAO_DATA='16/11/2026';\nconst HISTORICO=[\n",
 "const VERSAO='1.10.216', VERSAO_DATA='16/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.216\",d:\"16/11/2026\",i:[\n"
 "    'ÁREA RNC SEPARADA (pedido do Reginaldo): botão \"RNC\" no cabeçalho abre a área do RNC, com o interruptor \"Usar RNC\", que nasce DESLIGADO (hoje o RNC é o cartão escrito; a automação é melhoria). Desligado = o medidor fica como era: sem botão \"Registrar defeito\", sem aviso \"RNC: BLOQUEADO\" e sem nenhuma chamada ao servidor do RNC. Ligado = botão \"⚠ Registrar defeito\", aviso, lista de pendentes de envio, RNCs recentes e atalho para a tela de Reparo.'\n"
 "    ,'SEM REDE: se o servidor não responder, o registro NÃO se perde: entra numa fila e o medidor baixa um arquivo .csv (RNC_pendente_<série>_<data-hora>.csv, abre no Excel). A fila é reenviada sozinha (a cada 30 s e quando a rede volta, com a página aberta) ou por \"Enviar pendentes (.csv)\"; a mesma chave evita duplicar. A tela avisa: salvo SÓ neste aparelho, ainda NÃO está no sistema, coloque a etiqueta BLOQUEADO. Recusa por dado inválido não entra na fila (o erro aparece e a janela continua preenchida).'\n"
 "    ,'Dev/Operador oculto: a fase RNC é pulada (com aviso) quando o RNC está desligado. Resto igual à 1.10.215.'\n  ]},\n", 'hist')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.216.html ok')
