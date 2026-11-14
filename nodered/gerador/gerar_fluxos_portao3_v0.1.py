#!/usr/bin/env python3
"""Portao 3 (Fase 2, D3) - gera as VERSOES NOVAS dos fluxos com a GUARDA nas rotas de escrita.
Para cada 'http in' de metodo post/put/patch/delete insere um no function "guarda escrita (D3)" entre o http in e o resto do fluxo:
  - Origin (ou, sem Origin, Referer) tem que ser da MESMA origem da pagina (host igual ao cabecalho Host) ou estar em BT2_ORIGENS_OK (variavel da ABA, lista separada por virgula);
  - sem Origin e sem Referer -> bloqueia (browser sempre manda um dos dois em POST; so cliente que nao e browser nao manda);
  - Content-Type tem que ser application/json.
Bloqueio -> HTTP 403 {ok:false, codigo:'D3_...'} pelo http response do proprio fluxo. Nada alem disso e alterado.
Parte das versoes do Portao 2 e NAO sobrescreve nada. Uso: python3 nodered/gerador/gerar_fluxos_portao3_v0.1.py
"""
import json, os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PASTA = os.path.join(RAIZ, 'nodered', 'flows', 'bt2')
TROCAS = [  # (origem, destino)
    ('chaves-56-api-v3.1.json', 'chaves-56-api-v3.2.json'),
    ('chaves-400-api-v3.1.json', 'chaves-400-api-v3.2.json'),
    ('chaves-550-api-v1.2.json', 'chaves-550-api-v1.3.json'),
    ('chaves-595-api-v1.2.json', 'chaves-595-api-v1.3.json'),
    ('registro-ensaio-db2100-api-v1.6.json', 'registro-ensaio-db2100-api-v1.7.json'),
    ('dev-logs-api-v1.1.json', 'dev-logs-api-v1.2.json'),
    ('simulador-dse-demo-v6.json', 'simulador-dse-demo-v7.json'),
]
METODOS_ESCRITA = ('post', 'put', 'patch', 'delete')
GUARDA = r"""// PORTAO 3 (D3) - "Nunca confie no cliente": rota de ESCRITA so aceita pedido que veio da PROPRIA tela e em JSON.
// CORS sozinho NAO protege (o browser envia o POST mesmo assim); por isso o servidor confere Origin/Referer e Content-Type.
// Origem permitida = mesmo host da pagina (cabecalho Host) ou item de BT2_ORIGENS_OK (variavel da ABA, ex.: http://servidor:1880,null).
const h = (msg.req && msg.req.headers) || {};
const host = String(h.host || '').toLowerCase();
const extras = String(env.get('BT2_ORIGENS_OK') || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
const hostDe = u => { try { return new URL(String(u)).host.toLowerCase(); } catch (e) { return null; } };
const origemDe = u => { try { return new URL(String(u)).origin.toLowerCase(); } catch (e) { return null; } };
let motivo = null;
if (h.origin !== undefined) {
  const o = String(h.origin).toLowerCase();
  if (!((host && hostDe(o) === host) || extras.includes(o))) motivo = 'origem_nao_permitida';
} else if (h.referer !== undefined) {
  const r = origemDe(h.referer);
  if (!((host && hostDe(h.referer) === host) || (r && extras.includes(r)))) motivo = 'origem_nao_permitida';
} else {
  motivo = 'sem_origem';
}
if (!motivo && !/^application\/json\s*(;|$)/i.test(String(h['content-type'] || ''))) motivo = 'content_type_invalido';
if (motivo) {
  node.warn('D3 bloqueado: ' + motivo + ' | ' + String((msg.req && msg.req.method) || '') + ' ' + String((msg.req && msg.req.url) || '').slice(0, 80) + ' | origin=' + String(h.origin || h.referer || '-').slice(0, 80));
  msg.statusCode = 403;
  msg.payload = { ok: false, codigo: 'D3_' + motivo, erro: 'pedido recusado: so e aceito da propria tela do medidor, em JSON (' + motivo + ')' };
  return [null, msg];
}
return [msg, null];
"""

def gera(origem, destino):
    fonte = os.path.join(PASTA, origem); saida = os.path.join(PASTA, destino)
    assert os.path.exists(fonte), 'falta a versao de origem: ' + origem
    assert not os.path.exists(saida), 'ja existe (nao sobrescrevo): ' + destino
    fl = json.load(open(fonte, encoding='utf-8'))
    ids = {n['id'] for n in fl}
    resp = {}   # aba -> primeiro http response
    for n in fl:
        if n.get('type') == 'http response' and n.get('z') not in resp: resp[n['z']] = n['id']
    novos, n_rotas = [], 0
    for n in fl:
        if n.get('type') != 'http in' or str(n.get('method', '')).lower() not in METODOS_ESCRITA: continue
        assert n['z'] in resp, 'aba sem http response: ' + n['z']
        gid = n['id'] + '_d3'; assert gid not in ids
        novos.append({'id': gid, 'type': 'function', 'z': n['z'], 'name': 'guarda escrita (D3)', 'func': GUARDA, 'outputs': 2, 'timeout': 0,
                      'noerr': 0, 'initialize': '', 'finalize': '', 'libs': [], 'x': n['x'] + 90, 'y': n['y'] + 34,
                      'wires': [list(n['wires'][0]), [resp[n['z']]]]})
        n['wires'] = [[gid]]; n_rotas += 1
    fl.extend(novos)
    for n in fl:   # variavel da aba (lista de origens extras; vazia = so a mesma origem)
        if n.get('type') == 'tab':
            n['env'] = [e for e in (n.get('env') or []) if e.get('name') != 'BT2_ORIGENS_OK'] + [{'name': 'BT2_ORIGENS_OK', 'value': '', 'type': 'str'}]
    # verificacao: toda rota de escrita passa pela guarda antes de qualquer outro no
    por_id = {n['id']: n for n in fl}
    for n in fl:
        if n.get('type') == 'http in' and str(n.get('method', '')).lower() in METODOS_ESCRITA:
            assert n['wires'][0] == [n['id'] + '_d3'] and por_id[n['wires'][0][0]]['name'] == 'guarda escrita (D3)'
    json.dump(fl, open(saida, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(destino.ljust(42), 'rotas de escrita protegidas:', n_rotas)

if __name__ == '__main__':
    for o, d in TROCAS: gera(o, d)
