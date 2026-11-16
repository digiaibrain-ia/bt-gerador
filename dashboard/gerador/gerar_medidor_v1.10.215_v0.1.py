#!/usr/bin/env python3
"""16/11/2026 - Gera medidor_gerador_v1.10.215.html (de 1.10.214). Nao sobrescreve; aborta se um trecho esperado mudou.
Pedido do Reginaldo: (1) card Banco de Cargas visivel SO o selecionado, demais ocultos (bancos_visiveis v0.1 -> v0.2: PLC nunca lido deixa de manter o banco visivel);
(2) card Modo, "Fonte dos dados": SIDSE (Demo) ou DSE Real; "Salvamento": Manual, Auto ou Patamar; (3) "Node-RED tem dois objetos, tem coisa errada, avaliar":
o indicador Node-RED (3 servidores) e a caixa "Node-RED (confirmado)" (modo do registro) tinham o mesmo nome, mostravam o erro cru e cortado ("SEM CONFIRMACAO do Node-RED: o HTML foi aberto como arquivo")
e contradiziam o indicador no Demo. Agora a caixa chama "Registro no Node-RED" com valor curto: Simulado / Manual ✓ / Auto ✓ / Sem confirmação / Enviando… / Consultando…; o texto completo fica no balao (title).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.215_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas'); M = os.path.join(R, 'dashboard', 'modulos-fonte')
L = lambda p: open(p, encoding='utf-8').read()
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.214.html'), os.path.join(F, 'medidor_gerador_v1.10.215.html'); assert os.path.exists(o) and not os.path.exists(d)
t = L(o)
v1, v2 = L(os.path.join(M, 'bancos_visiveis_v0.1.js')), L(os.path.join(M, 'bancos_visiveis_v0.2.js')); assert '</script' not in v2.lower()
t = troca(t, v1, v2, 'modulo bancos')
t = troca(t, "f.textContent=dm()?'DEMO (simulação)':'REAL (Node-RED/DSE)';", "f.textContent=dm()?'SIDSE':'DSE Real';f.title=dm()?'SIDSE: DSE simulado (Demo)':'DSE Real: leitura do DSE do gerador';", 'fonte')
t = troca(t, "$('mcSalva').textContent=MODO==='carga'?'não salva':(PORPAT?'Por patamar':salvarManual?'Manual (operador)':'Automático');", "$('mcSalva').textContent=MODO==='carga'?'não salva':(PORPAT?'Patamar':salvarManual?'Manual':'Auto');", 'salva')
a = "      const s0=mm?mm[1]:(t?t.replace(/^✗\\s*/,''):'—');$('mcNode').textContent=s0.length>60?s0.slice(0,59)+'…':s0;$('mcNode').title=t||s0}"
b = ("      // v1.10.215: valor CURTO; o texto completo vai no balao. Simulado quando o registro nao usa o Node-RED (Demo local), em vez de repetir um erro que nao se aplica.\n"
     "      let s0;try{const M_=ENS.modo,mock=typeof ensUsaMock==='function'&&ensUsaMock();s0=mock?'Simulado':M_.estado==='ok'&&M_.conf?(ensRotuloModo(M_.conf)==='MANUAL'?'Manual ✓':ensRotuloModo(M_.conf)==='AUTOMÁTICO'?'Auto ✓':ensRotuloModo(M_.conf)+' ✓'):M_.estado==='erro'?'Sem confirmação':M_.estado==='envia'?'Enviando…':'Consultando…'}catch(e){s0='—'}\n"
     "      $('mcNode').textContent=s0;$('mcNode').title=t||s0}")
t = troca(t, a, b, 'node')
t = troca(t, '<div class="l">Node-RED (confirmado)</div>', '<div class="l">Registro no Node-RED</div>', 'rotulo')
t = troca(t, '<meta name="app-version" content="1.10.214">', '<meta name="app-version" content="1.10.215">', 'meta')
t = troca(t, "const VERSAO='1.10.214', VERSAO_DATA='16/11/2026';\nconst HISTORICO=[\n",
 "const VERSAO='1.10.215', VERSAO_DATA='16/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.215\",d:\"16/11/2026\",i:[\n"
 "    'BANCO DE CARGAS: mostra SÓ os bancos selecionados em Detalhes do Patamar; os demais ficam ocultos (antes, com o PLC não conectado, todos apareciam porque as chaves ficam com \"?\"). Segurança: um banco desmarcado continua visível se tiver chave ligada, comando pendente ou se a leitura dele FOI perdida depois de existir. 👁 n/N mostra todos.'\n"
 "    ,'MODO › Fonte dos dados: \"SIDSE\" (Demo) ou \"DSE Real\". Salvamento: \"Manual\", \"Auto\" ou \"Patamar\".'\n"
 "    ,'MODO › Node-RED: a caixa \"Node-RED (confirmado)\" virou \"Registro no Node-RED\" (é o modo Manual/Auto do registro que o Node-RED confirma, diferente do indicador Node-RED, que resume os servidores). Mostra valor curto (Simulado, Manual ✓, Auto ✓, Sem confirmação, Enviando…, Consultando…) e o texto completo no balão; no Demo local não repete mais um erro que não se aplica.'\n  ]},\n", 'hist')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.215.html ok')
