#!/usr/bin/env python3
"""Portao 2 (Fase 2) - gera as VERSOES NOVAS dos fluxos do BT2 sem enderecos fixos.
- Endereco do PLC nos nos s7 endpoint -> '${PLC_IP}' (variavel de AMBIENTE DO PROCESSO no PC, via PM2).
- Textos com IP (info/comentarios) -> '<IP do PLC>' / '<IP do DSE>' (so documentacao).
- Simulador de bancada (v6): trava por variavel da ABA 'BT2_BANCADA' (padrao '0'); sem '1' ele nao responde nem comanda.
Nao sobrescreve nenhum arquivo: cada saida tem nome novo. Uso: python3 nodered/gerador/gerar_fluxos_portao2_v0.1.py
"""
import json, os, re
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PASTA = os.path.join(RAIZ, 'nodered', 'flows', 'bt2')
PLC, DSE = '172.17.209.135', '172.17.210.156'
TROCAS = [  # (origem, destino)
    ('chaves-56-api-v3.0.json', 'chaves-56-api-v3.1.json'),
    ('chaves-400-api-v3.0.json', 'chaves-400-api-v3.1.json'),
    ('chaves-550-api-v1.1.json', 'chaves-550-api-v1.2.json'),
    ('chaves-595-api-v1.1.json', 'chaves-595-api-v1.2.json'),
    ('cliente-156-dse-plc-carga-v2.json', 'cliente-156-dse-plc-carga-v3.json'),
    ('cliente-31-seletor-plc-db2000-v3.json', 'cliente-31-seletor-plc-db2000-v4.json'),
    ('registro-ensaio-db2100-api-v1.5.json', 'registro-ensaio-db2100-api-v1.6.json'),
    ('simulador-dse-demo-v5.json', 'simulador-dse-demo-v6.json'),
    ('servidor-deepsea-api-gerador-v3_6.json', 'servidor-deepsea-api-gerador-v3_7.json'),
]
def troca_textos(s, relatorio):
    if PLC in s: relatorio['txt_plc'] += s.count(PLC); s = s.replace(PLC, '<IP do PLC>')
    if DSE in s: relatorio['txt_dse'] += s.count(DSE); s = s.replace(DSE, '<IP do DSE>')
    return s
def troca_profundo(o, relatorio):
    """Percorre dicts/listas: texto com IP vira placeholder (info, comentarios, regras)."""
    if isinstance(o, dict): return {k: troca_profundo(v, relatorio) for k, v in o.items()}
    if isinstance(o, list): return [troca_profundo(v, relatorio) for v in o]
    if isinstance(o, str): return troca_textos(o, relatorio)
    return o
def regra_dse_por_variavel(n, relatorio):
    """nó change que monta msg.url com o endereco do DSE: passa a LER a variavel de ambiente DSE_URL (tipo env)."""
    if n.get('type') != 'change': return
    for r in n.get('rules', []):
        if isinstance(r.get('to'), str) and DSE in r['to']:
            r['to'] = 'DSE_URL'; r['tot'] = 'env'; relatorio['dse_url_env'] = relatorio.get('dse_url_env', 0) + 1
def gera(origem, destino):
    fonte = os.path.join(PASTA, origem); saida = os.path.join(PASTA, destino)
    assert not os.path.exists(saida), 'ja existe (nao sobrescrevo): ' + destino
    fl = json.load(open(fonte, encoding='utf-8'))
    rel = {'endpoints': 0, 'txt_plc': 0, 'txt_dse': 0}
    for n in fl:
        if n.get('type') == 's7 endpoint' and n.get('address') == PLC:
            n['address'] = '${PLC_IP}'; rel['endpoints'] += 1
        regra_dse_por_variavel(n, rel)
        for k, v in list(n.items()):
            if k in ('address', 'rules'): continue
            n[k] = troca_profundo(v, rel)
        if n.get('type') == 'tab' and 'simulador' in destino:
            n['env'] = [e for e in (n.get('env') or []) if e.get('name') != 'BT2_BANCADA'] + [{'name': 'BT2_BANCADA', 'value': '0', 'type': 'str'}]
    if 'simulador' in destino:
        for n in fl:
            if n.get('type') != 'function': continue
            f = n.get('func', '')
            if n.get('name') == 'liga/desliga DSE simulado':
                guarda = ("// PORTAO 2 (trava de bancada): sem BT2_BANCADA='1' na aba, o simulador NAO liga nem comanda o PLC.\n"
                          "if (String(env.get('BT2_BANCADA') || '0') !== '1') { msg.statusCode = 404; msg.payload = { ok: false, erro: 'simulador de bancada desligado (BT2_BANCADA != 1 na aba)' }; return [null, msg]; }\n")
                n['func'] = guarda + f; rel['trava_liga'] = 1
            if n.get('name') == 'calcula potencia + feedback simulado':
                n['func'] = "// PORTAO 2: so age com a trava de bancada ligada\nif (String(env.get('BT2_BANCADA') || '0') !== '1') return null;\n" + f; rel['trava_calc'] = 1
    # verificacao: nenhum IP de producao sobrou nos nos
    txt = json.dumps(fl, ensure_ascii=False)
    sobra = [ip for ip in (PLC, DSE) if ip in txt]
    assert not sobra, 'IP de producao sobrou em ' + destino + ': ' + str(sobra)
    json.dump(fl, open(saida, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(destino.ljust(42), rel)
if __name__ == '__main__':
    for o, d in TROCAS: gera(o, d)
