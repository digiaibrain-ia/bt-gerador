#!/usr/bin/env python3
"""gerar_logs_limpos_v0.1.py — Passo 6: tira o ruído de log do fluxo do DSE (servidor-deepsea-api-gerador v3_7 -> v3_8).

PARA QUE SERVE (leigo): com o DSE falhando, o fluxo escrevia no log do Node-RED "bloco X incompleto ou desconhecido" a CADA resposta de CADA bloco, a cada segundo
(até 13 linhas por segundo). O log enchia e escondia o que importa. Agora cada bloco avisa UMA vez e repete o aviso só a cada 5 minutos, com o total de falhas.
A contagem de falhas (que o resto do fluxo usa) NÃO mudou.

COMO FUNCIONA (técnico): no nó "decodifica blocos" troca o node.warn por um aviso limitado por bloco (s.warnTs em global 'gerador_blk').
Só esse nó muda; resposta HTTP, contagem de falhas e valores lidos ficam iguais. Os demais avisos dos fluxos foram revisados e ficam (guarda D3 = evento de seguranca;
vigia/fila = ja limitados; capacidade = ja limitada): ver docs/bt2/auditoria/PASSO_6_ALARMES_E_LOGS_v0.1.md.
USO: python3 nodered/gerador/gerar_logs_limpos_v0.1.py        (REGRA: versao nova; nunca sobrescreve a anterior)
"""
import json, os, re, sys
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FL = os.path.join(RAIZ, 'nodered', 'flows', 'bt2')
ORIGEM, NOVO, V = 'servidor-deepsea-api-gerador-v3_7', 'servidor-deepsea-api-gerador-v3_8', 'v3_8'
ANTES = """  node.warn("bloco " + id + " incompleto ou desconhecido");
  s.falhas = (s.falhas || 0) + 1;
"""
DEPOIS = """  s.falhas = (s.falhas || 0) + 1;
  // Passo 6 (19/11/2026): 1 aviso por bloco e a cada 5 min, com o total de falhas, em vez de 1 por resposta (eram ate 13 por segundo com o DSE falhando).
  const _agora = Date.now();
  if (_agora - (s.warnTs || 0) > 300000) {
    node.warn("bloco " + id + " incompleto ou desconhecido (" + s.falhas + " falhas ate agora; este aviso so se repete a cada 5 min)");
    s.warnTs = _agora;
  }
"""
nos = json.load(open(os.path.join(FL, ORIGEM + '.json'), encoding='utf8'))
f = next(n for n in nos if n.get('name') == 'decodifica blocos')
assert f['func'].count(ANTES) == 1, 'trecho esperado nao encontrado'
f['func'] = f['func'].replace(ANTES, DEPOIS)
f['info'] = (f.get('info') or '') + '\n\nPasso 6 (19/11/2026): o aviso "bloco incompleto" e limitado a 1 por bloco a cada 5 min (com a contagem de falhas).'
tab = next(n for n in nos if n['type'] == 'tab')
tab['label'] = re.sub(r'v3[._]\d+', 'v3.8', tab['label']) if re.search(r'v3[._]\d+', tab['label']) else tab['label'] + ' v3.8'
tab['info'] = 'v3_8 (19/11/2026) - Passo 6: o aviso "bloco incompleto" do nó "decodifica blocos" passa a 1 por bloco a cada 5 min (antes 1 por resposta). Nada mais mudou em relacao a ' + ORIGEM + '.\n\n' + (tab.get('info') or '')
dest = os.path.join(FL, NOVO + '.json')
if os.path.exists(dest): sys.exit('ja existe (versao nova nunca sobrescreve): ' + dest)
json.dump(nos, open(dest, 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=4); open(dest, 'a').write('\n')
print('gerado', os.path.relpath(dest, RAIZ), '(%d nos)' % len(nos))
