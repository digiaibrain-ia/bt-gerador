#!/usr/bin/env python3
"""15/11/2026 - Gera medidor_gerador_v1.10.211.html (de 1.10.210). Nao sobrescreve; aborta se um trecho esperado mudou.
Junta na nossa cadeia o que a outra sessao fez (branch ccr-69b3bd0c-yhr48g, medidores 1.10.202-205), SEM merge e sem tocar nas versoes 202-210:
 (1) botao "Registrar defeito" + aviso "RNC: BLOQUEADO" (modulos-fonte/rnc_defeito_v0.3.js, so informativo; fala so com /api/rnc/*);
 (2) card Banco de Cargas mostra so os bancos selecionados (modulos-fonte/bancos_visiveis_v0.1.js);
 (3) fase RNC do Dev/Operador oculto (robo_fase_rnc_v0.4.js) + falha simulada do alternador no Demo (SIM_FALHA_ALT) + excecao da caixa de areia para POST /api/rnc/abrir.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.211_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas'); M = os.path.join(R, 'dashboard', 'modulos-fonte')
L = lambda p: open(p, encoding='utf-8').read()
def troca(txt, a, b):
    assert txt.count(a) == 1, 'ancora nao encontrada (ou repetida): ' + a[:60]; return txt.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.210.html'), os.path.join(F, 'medidor_gerador_v1.10.211.html'); assert os.path.exists(o) and not os.path.exists(d)
s = L(o)
rnc, bk, frag = L(os.path.join(M, 'rnc_defeito_v0.3.js')), L(os.path.join(M, 'bancos_visiveis_v0.1.js')), L(os.path.join(M, 'robo_fase_rnc_v0.4.js'))
for m in (rnc, bk, frag): assert '</script' not in m.lower()
s = troca(s, "if(m!=='GET'&&m!=='HEAD'){SB.c.redeBloqueada++;return Promise.resolve(new Response('{\"ok\":false,\"erro\":\"bloqueado pela caixa de areia do Dev/Operador oculto\"}'", "if(m!=='GET'&&m!=='HEAD'&&!(SB.rncPermite&&m==='POST'&&/\\/api\\/rnc\\/abrir(\\?|$)/.test(String((i&&i.url)||i)))){SB.c.redeBloqueada++;return Promise.resolve(new Response('{\"ok\":false,\"erro\":\"bloqueado pela caixa de areia do Dev/Operador oculto\"}'")
s = troca(s, "let SIM_FALHA_MOTOR=false; // v1.9.9:", "let SIM_FALHA_ALT=false; // v1.10.203: falha SIMULADA do alternador de carga (so Demo; so o Dev/Operador oculto arma): alternador 0 V, bateria 24,8 V, alarme 'Falha de carga do alternador'\nlet SIM_FALHA_MOTOR=false; // v1.9.9:")
s = troca(s, "alternador:on?28:0,tempOleoC:", "alternador:on?(SIM_FALHA_ALT?0:28):0,tempOleoC:")
s = troca(s, "modoCodigo:2,temAlarme:false,alarmeAviso:false,alarmeDesligamento:false,alarmeTripEletrico:false,alarmeDesligamentoControlado:false,alarmes:[],", "modoCodigo:2,temAlarme:!!SIM_FALHA_ALT,alarmeAviso:!!SIM_FALHA_ALT,alarmeDesligamento:false,alarmeTripEletrico:false,alarmeDesligamentoControlado:false,alarmes:SIM_FALHA_ALT?[{nome:'Falha de carga do alternador',nivel:'aviso'}]:[],")
s = troca(s, "bateria:(S.rpm>1000?28.3:crank?22.5:25.6)+0.02*g(),", "bateria:(S.rpm>1000?(SIM_FALHA_ALT?24.8:28.3):crank?22.5:25.6)+0.02*g(),")

s = troca(s, "    const tMax=Date.now()+420000;let sig='',sigT=Date.now(),etSalva=-1;", "    const tMax=Date.now()+420000;let sig='',sigT=Date.now(),etSalva=-1,rncFeito=false;")
s = troca(s, "        etSalva=et;msgGer('');clica(b,'Salvar (etapa '+(et+1)+')');", "        if(et===2&&!rncFeito){rncFeito=true;await faseRncDurante()}   // v1.10.211: fase RNC (só com pasta de dados de TESTE)\n        etSalva=et;msgGer('');clica(b,'Salvar (etapa '+(et+1)+')');")
s = troca(s, "  async function rodar(opt){\n    opt=opt||{};\n    if(OPS.rodando)return false;", frag + "  async function rodar(opt){\n    opt=opt||{};\n    if(OPS.rodando)return false;")
marca = "</script>\n<script>\n/* =====================================================================================================================\n   janelas_v0.3.js"
s = troca(s, marca, "</script>\n<script>\n" + rnc + "\n</script>\n<script>\n" + bk + "\n" + marca)
s = troca(s, '<meta name="app-version" content="1.10.210">', '<meta name="app-version" content="1.10.211">')
s = troca(s, "const VERSAO='1.10.210', VERSAO_DATA='15/11/2026';\nconst HISTORICO=[\n",
  "const VERSAO='1.10.211', VERSAO_DATA='15/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.211\",d:\"15/11/2026\",i:[\n"
  "    'RNC (Registro de Não Conformidade) JUNTADO (veio da outra sessão): botão \"⚠ Registrar defeito\" no cabeçalho e aviso informativo \"RNC: BLOQUEADO\" quando a série tem RNC pendente. Só informa: nunca bloqueia o ensaio nem comanda PLC, chaves ou DSE; fala só com /api/rnc/* do Node-RED (fluxo rnc-api-v1.1).'\n"
  "    ,'BANCOS VISÍVEIS: o card \"Banco de Cargas\" mostra só os bancos selecionados em Detalhes do Patamar. Banco desmarcado só some se estiver sem carga; com chave ligada, comando pendente ou sem leitura continua visível. Botão 👁 n/N alterna para Todos.'\n"
  "    ,'Dev/Operador oculto: fase \"RNC · Registrar defeito\" (só grava se a pasta de dados do RNC for de TESTE) e falha simulada do alternador no Demo. Resto igual à 1.10.210.'\n  ]},\n")
open(d, 'w', encoding='utf-8').write(s); print('medidor_gerador_v1.10.211.html ok', len(s))
