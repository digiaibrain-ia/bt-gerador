#!/usr/bin/env python3
"""Gera o fluxo Node-RED 'simulador-dse-demo-v5' (bancada, SEM DSE real) para os 4 bancos do BT2. v0.1 (03/11/2026).
Base: simulador-dse-demo-v4.json (so BC56, DB150->DB3000). Fonte dos bancos: plc/bt2/gerador/bancos_bt2_v0.2.json (mesma ficha do gerador de blocos).
Uso: python3 nodered/gerador/gerar_simulador_dse_v0.1.py
O que muda vs v4: le cb.ligar e escreve sb.ligada de TODOS os bancos (DB do banco = campo 'db' da ficha; offset de sb.ligada = N/8, N = 16 ou 32),
potenciaKw = base + soma dos kW nominais (ordem fisica da ficha) das chaves comandadas. DB2000 (DSE) igual a v4."""
import json, os
AQUI = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.abspath(os.path.join(AQUI, '..', '..'))
fic = json.load(open(os.path.join(RAIZ, 'plc/bt2/gerador/bancos_bt2_v0.2.json')))
bancos = [(k, v) for k, v in fic.items() if k.startswith('BC')]
base = json.load(open(os.path.join(RAIZ, 'nodered/flows/bt2/simulador-dse-demo-v4.json')))
N = lambda n: 16 if n <= 16 else 32
vt = []
for n in base:
    if n['type'] == 's7 endpoint':
        vt = [v for v in n['vartable'] if 'DB2000' in v['addr']]          # mantem ledManual, tensoes e potenciaKw do v4
        for k, b in bancos:
            nn, tam, db = len(b['chaves']), N(len(b['chaves'])), b['db']
            for i in range(1, nn + 1):
                vt.append({'name': '%s_Cb%d' % (k, i), 'addr': 'DB%d,X%d.%d' % (db, (i - 1) // 8, (i - 1) % 8)})
                vt.append({'name': '%s_Lig%d' % (k, i), 'addr': 'DB%d,X%d.%d' % (db, tam // 8 + (i - 1) // 8, (i - 1) % 8)})
        n['vartable'] = vt
tabela = {k: b['chaves'] for k, b in bancos}
for n in base:
    if n['type'] == 'tab':
        n['label'] = 'Simulador DSE (Demo) v5'
        n['info'] = ('Simula o DSE + a realimentacao das chaves dos 4 bancos (BC56 DB3000, BC400 DB3100, BC59,5 DB3200, BC550 DB3300) no PLC da Carga, '
                     'para teste em bancada SEM DSE real. v5 (03/11/2026), gerado por nodered/gerador/gerar_simulador_dse_v0.1.py a partir do v4 (que so tinha o BC56 no DB150).\n\n'
                     'POST /api/simulador/dse {ligado:true|false}: liga/desliga o gerador simulado (DB2000 ledManual, tensoes ~221 V). Ligado: potenciaKw = kW sem carga + soma dos kW '
                     'das chaves com cb.ligar=true em todos os bancos; sb.ligada = cb.ligar (feedback simulado).\n\n'
                     'USO SOMENTE EM BANCADA. Nao deixar ligado junto com o DSE real nem com o FB101/FB103 ativo (eles tambem escrevem sb.ligada a partir do ET200). '
                     'Encerrar: Desligar gerador (Demo) no HTML, ou desabilitar esta aba. ATENCAO AO IMPORTAR: apague a aba do v4 (mesma rota).')
    if n['type'] == 'function' and n['id'].endswith('_liga'):
        n['func'] = n['func'].replace("for (let i = 1; i <= 16; i++) w.push({ variable: 'Ligada' + i, payload: false }); // limpa o feedback simulado",
            "const TAB = " + json.dumps(tabela) + ";\n  for (const k in TAB) for (let i = 1; i <= TAB[k].length; i++) w.push({ variable: k + '_Lig' + i, payload: false }); // v5: limpa o feedback simulado dos 4 bancos")
        assert "k + '_Lig' + i" in n['func'], 'troca no liga/desliga falhou'
    if n['type'] == 'function' and n['id'].endswith('_calc'):
        n['func'] = ("// v5 (03/11/2026): os 4 bancos. Entrada: leitura ciclica (s7 in 'all', 200 ms). So age com o gerador SIMULADO ligado (flow 'simLigado').\n"
                     "// 1) <banco>_Lig<i> (sb.ligada) = <banco>_Cb<i> (cb.ligar) -> simula a realimentacao fisica; escreve so quando muda\n"
                     "// 2) potenciaKw = kW sem carga + soma dos kW nominais das chaves comandadas (todos os bancos); escrita no maximo 1x por segundo\n"
                     "if (!flow.get('simLigado')) return null;\nconst p = msg.payload;\nif (!p || typeof p !== 'object') return null;\n"
                     "const TAB = " + json.dumps(tabela) + ";   // kW por chave, ordem fisica (plc/bt2/gerador/bancos_bt2_v0.2.json)\n"
                     "const BASE = 0.8;   // kW sem carga SIMULADO\nconst out = [];\nlet carga = 0;\n"
                     "for (const k in TAB) for (let i = 1; i <= TAB[k].length; i++) {\n  const cmd = (p[k + '_Cb' + i] === true);\n  if (cmd) carga += TAB[k][i - 1];\n"
                     "  if (p[k + '_Lig' + i] !== cmd) out.push({ variable: k + '_Lig' + i, payload: cmd });\n}\n"
                     "const agora = Date.now();\nif (agora - (flow.get('simUltPot') || 0) >= 1000) {\n  flow.set('simUltPot', agora);\n"
                     "  out.push({ variable: 'potenciaKw', payload: Math.round((BASE + carga + (Math.random() - 0.5) * 0.1) * 100) / 100 });\n}\n"
                     "return out.length ? [out] : null;\n")
    if n['type'] == 's7 out': n['name'] = 'grava DB2000/DB3x00 (simulador)'
    if n['type'] == 's7 in': n['name'] = 'le cb.ligar/sb.ligada dos 4 bancos (ciclico 200 ms)'
txt = json.dumps(base, ensure_ascii=False, indent=2).replace('sdd2_', 'sdd5_')
open(os.path.join(RAIZ, 'nodered/flows/bt2/simulador-dse-demo-v5.json'), 'w', encoding='utf-8').write(txt)
print('gerado simulador-dse-demo-v5.json, variaveis:', len(vt))
