#!/usr/bin/env python3
"""gerar_medidor_v1.10.203_v0.1.py (13/11/2026) - gera dashboard/ferramentas/medidor_gerador_v1.10.203.html a partir da v1.10.202.
Mudanca (so isto): o Dev/Operador oculto ganha a FASE "RNC - Registrar defeito" (fragmento dashboard/modulos-fonte/robo_fase_rnc_v0.1.js), chamada no ensaio
simulado na etapa 3 (50 %) antes de salvar a etapa. A fase so grava se a pasta de dados do RNC for de TESTE; senao e pulada com AVISO. Resto igual a v1.10.202.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.203_v0.1.py       (le a 202 e escreve a 203; nunca altera a 202)"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas')
s = open(os.path.join(F, 'medidor_gerador_v1.10.202.html'), encoding='utf-8').read()
frag = open(os.path.join(R, 'dashboard', 'modulos-fonte', 'robo_fase_rnc_v0.1.js'), encoding='utf-8').read()
assert '</script' not in frag.lower()
def troca(txt, a, b):
    assert txt.count(a) == 1, 'ancora nao encontrada (ou repetida): ' + a[:60]; return txt.replace(a, b, 1)
s = troca(s, '<meta name="app-version" content="1.10.202">', '<meta name="app-version" content="1.10.203">')
s = troca(s, "const VERSAO='1.10.202', VERSAO_DATA='13/11/2026';", "const VERSAO='1.10.203', VERSAO_DATA='13/11/2026';")
s = troca(s, 'const HISTORICO=[\n', 'const HISTORICO=[\n  {v:"1.10.203",d:"13/11/2026",i:[\n'
  '    \'Dev/Operador oculto: NOVA FASE "RNC · Registrar defeito" dentro do ensaio simulado (etapa de 50 %, antes de salvar a etapa). O robô aperta "⚠ Registrar defeito" como o operador e confere: o que o botão anexa (etapa, hora, ≥ 6 grandezas com potência > 0, modelo do DSE, alarmes, marca Demo); a janela abre já preenchida; sem descrição não grava; "Salvo" só depois do servidor confirmar; o servidor guardou a RNC (série BLOQUEADA, contexto da etapa, prefixo [DEMO]); a etiqueta/faixa "RNC: BLOQUEADO" aparece para a série com RNC e some para uma série limpa; o ensaio continua rodando. SEGURANÇA: só grava se a pasta de dados do RNC (GET /api/rnc/saude) tiver "teste" no nome; sem servidor, sem o fluxo RNC ou com pasta real a fase é PULADA com AVISO. Só fala com /api/rnc/*; não toca PLC, chaves nem DSE.\',\n'
  '    \'Resto IGUAL à v1.10.202. Fragmento-fonte: modulos-fonte/robo_fase_rnc_v0.1.js.\'\n  ]},\n')
s = troca(s, "    const tMax=Date.now()+420000;let sig='',sigT=Date.now(),etSalva=-1;", "    const tMax=Date.now()+420000;let sig='',sigT=Date.now(),etSalva=-1,rncFeito=false;")
s = troca(s, "        etSalva=et;msgGer('');clica(b,'Salvar (etapa '+(et+1)+')');", "        if(et===2&&!rncFeito){rncFeito=true;await faseRncDurante()}   // v1.10.203: fase RNC (só com pasta de dados de TESTE)\n        etSalva=et;msgGer('');clica(b,'Salvar (etapa '+(et+1)+')');")
s = troca(s, "  async function rodar(opt){\n    opt=opt||{};\n    if(OPS.rodando)return false;", frag + "  async function rodar(opt){\n    opt=opt||{};\n    if(OPS.rodando)return false;")
open(os.path.join(F, 'medidor_gerador_v1.10.203.html'), 'w', encoding='utf-8').write(s); print('gerado medidor_gerador_v1.10.203.html', len(s))
