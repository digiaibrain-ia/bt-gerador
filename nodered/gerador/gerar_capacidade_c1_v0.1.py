#!/usr/bin/env python3
"""gerar_capacidade_c1_v0.1.py — Passo 5 (C1): gera as versões novas dos 4 fluxos de chaves com o LIMITE DE CAPACIDADE que só REGISTRA.

PARA QUE SERVE (leigo): o medidor impede passar do limite de carga do gerador, mas um comando enviado direto ao Node-RED passaria. Nesta
primeira etapa (C1) o Node-RED passa a CALCULAR quanto estaria comandado e a ANOTAR no log quando o limite seria passado. Ele NÃO recusa
nada ainda (a recusa é o C2, só com aprovação e teste de bancada). Também anota se o kW que o PLC informa difere do arquivo de espelho.

COMO FUNCIONA (técnico): lê a versão mais nova de cada fluxo e grava uma versão nova (a anterior fica intacta):
  chaves-56 v3.7 -> v3.8 | chaves-400 v3.6 -> v3.7 | chaves-550 v1.7 -> v1.8 | chaves-595 v1.7 -> v1.8
  1) nó "guarda leitura ao vivo (cache)": publica em global 'bt2_kw_<banco>' o kW comandado (Ligada ou CbLigar) a cada leitura (só leitura);
  2) nó novo "limite de capacidade (C1 - so registra)" entre "valida ligar" e "→ fila": calcula o total entre bancos e anota no log; SEMPRE devolve a
     mensagem inalterada (fail-open: erro aqui nunca impede o comando);
  3) cadeia nova: inject (1x) -> caminho -> file in -> valida e publica: carrega nodered/config/bancos_capacidade.json (ou BT2_CAPACIDADE_JSON) em global
     'bt2_capacidade'; sem arquivo/inválido usa o PADRÃO embutido (gerado do mesmo JSON).
NÃO FAZ: não recusa comando, não escreve no PLC, não muda resposta HTTP nem endereço S7, não toca no PC BT2.
USO: python3 nodered/gerador/gerar_capacidade_c1_v0.1.py        (REGRA: versão nova; nunca sobrescreve a anterior)
"""
import copy, json, os, re, sys

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FLUXOS = os.path.join(RAIZ, 'nodered', 'flows', 'bt2')
CONFIG = os.path.join(RAIZ, 'nodered', 'config', 'bancos_capacidade.json')
DATA = '19/11/2026'
BANCOS = [  # (rota/banco, fluxo de origem, fluxo novo, versao curta nova)
    ('56',  'chaves-56-api-v3.7',  'chaves-56-api-v3.8',  'v3.8'),
    ('400', 'chaves-400-api-v3.6', 'chaves-400-api-v3.7', 'v3.7'),
    ('550', 'chaves-550-api-v1.7', 'chaves-550-api-v1.8', 'v1.8'),
    ('595', 'chaves-595-api-v1.7', 'chaves-595-api-v1.8', 'v1.8'),
]

# ---- trecho comum: kW de uma chave (nominal do PLC se > 0, senão o espelho) e kW comandado do banco ----
KW_COMUM = r"""
const norm = (v) => (Array.isArray(v) && Array.isArray(v[0])) ? v[0] : (Array.isArray(v) ? v : []);
const kwChave = (live, cfgB, i) => { const nom = norm(live.Nominal)[i - 1]; if (typeof nom === 'number' && isFinite(nom) && nom > 0) return nom; const e = cfgB && cfgB.chaves_kw && cfgB.chaves_kw[i - 1]; return (typeof e === 'number' && isFinite(e)) ? e : 0; };
const kwComandado = (live, cfgB, n, extra) => { let kw = 0; for (let i = 1; i <= n; i++) if (live['Ligada' + i] === true || live['CbLigar' + i] === true || i === extra) kw += kwChave(live, cfgB, i); return Math.round(kw * 1000) / 1000; };
"""

PUBLICA_JS = r"""
// C1 (Passo 5, %(data)s): publica o kW COMANDADO deste banco (Ligada ou CbLigar) para a soma entre bancos. So leitura: nao muda nada do fluxo.
try {
  const PADRAO = %(padrao)s;
  const cfg = global.get('bt2_capacidade') || PADRAO;
%(comum)s
  global.set('bt2_kw_%(banco)s', { ts: Date.now(), kw: kwComandado(msg.payload || {}, (cfg.bancos || {})['%(banco)s'], %(n)d, 0) });
} catch (e) { /* so deixa de publicar; o cache acima ja foi atualizado */ }
return null;
"""

CAP_JS = r"""// C1 (Passo 5, %(data)s) - LIMITE DE CAPACIDADE: SO REGISTRA. Nao recusa, nao altera a mensagem, nao escreve no PLC.
// Fail-open: qualquer erro aqui vai so para o log do no e o comando segue exatamente como antes.
// Regra: limite = kw100 x pctLim / 100 (arquivo nodered/config/bancos_capacidade.json). kw100 = null -> limite NAO avaliado.
try {
  const b = msg.payload || {};
  if (b.ligar === true) {
    const PADRAO = %(padrao)s;
    const cfg = global.get('bt2_capacidade') || PADRAO;
%(comum)s
    const live = flow.get('%(p)s_live') || {};
    const cfgB = (cfg.bancos || {})['%(banco)s'];
    const agora = Date.now();
    const grava = (rota, dado, erro) => {        // mesmo formato do log do GET /api/logs/%(banco)s
      const logs = flow.get('%(p)s_logs') || [];
      logs.push({ t: new Date().toISOString(), rota, dado, status: 0, ok: false, ms: 0, erro });
      if (logs.length > 1000) logs.shift();
      flow.set('%(p)s_logs', logs);
    };
    const limitaLog = (k, ms) => { const t = flow.get('%(p)s_c1_' + k) || 0; if (agora - t < ms) return false; flow.set('%(p)s_c1_' + k, agora); return true; };
    // 1) espelho x PLC: o kW da chave que o PLC informa difere do arquivo?
    const nom = norm(live.Nominal)[b.indice - 1], esp = cfgB && cfgB.chaves_kw && cfgB.chaves_kw[b.indice - 1];
    if (typeof nom === 'number' && nom > 0 && typeof esp === 'number' && Math.abs(nom - esp) > 0.05 && limitaLog('div' + b.indice, 600000))
      grava('CAPACIDADE', 'chave ' + b.indice + ': PLC informa ' + nom + ' kW, espelho tem ' + esp + ' kW', 'NOMINAL_DIVERGE (C1: so registra)');
    // 2) carga comandada depois deste comando: este banco + os outros (valores publicados ha ate 5 s)
    const kwEste = kwComandado(live, cfgB, %(n)d, b.indice);
    let total = kwEste;
    for (const id of Object.keys(cfg.bancos || {})) { if (id === '%(banco)s') continue; const o = global.get('bt2_kw_' + id); if (o && agora - o.ts <= 5000 && isFinite(o.kw)) total += o.kw; }
    total = Math.round(total * 1000) / 1000;
    const kw100 = cfg.gerador && cfg.gerador.kw100, pct = Number(cfg.pctLim) || 110;
    if (!(kw100 > 0)) {
      if (limitaLog('semkw', 3600000)) node.warn('capacidade (C1): kw100 do gerador nao configurado - limite NAO avaliado (so registra). Total comandado agora: ' + total + ' kW');
    } else {
      const lim = Math.round(kw100 * pct) / 100;
      if (total > lim + 1e-9 && limitaLog('exc', 10000)) {
        grava('LIMITE', 'chave ' + b.indice + ': total comandado ' + total + ' kW > limite ' + lim + ' kW (kw100 ' + kw100 + ' x ' + pct + ' %%)', 'LIMITE_EXCEDIDO (C1: so registra; o comando NAO foi recusado)');
        node.warn('capacidade (C1): LIMITE_EXCEDIDO banco %(banco)s chave ' + b.indice + ': ' + total + ' kW > ' + lim + ' kW (so registra)');
      }
    }
  }
} catch (e) { node.warn('capacidade (C1): erro ao avaliar (comando segue normalmente): ' + e.message); }
return msg;
"""

PREPARA_JS = r"""// C1: caminho do arquivo de capacidade (variavel BT2_CAPACIDADE_JSON ou o padrao do repositorio).
msg.filename = env.get('BT2_CAPACIDADE_JSON') || 'nodered/config/bancos_capacidade.json';
return msg;
"""

CARREGA_JS = r"""// C1: valida o arquivo de capacidade e publica em global 'bt2_capacidade'. Invalido = continua o padrao embutido (nunca derruba o fluxo).
try {
  const j = JSON.parse(String(msg.payload));
  if (!(Number(j.pctLim) >= 50 && Number(j.pctLim) <= 200)) throw new Error('pctLim fora de 50 a 200');
  if (j.gerador && j.gerador.kw100 != null && !(Number(j.gerador.kw100) > 0)) throw new Error('gerador.kw100 deve ser null ou maior que 0');
  if (!j.bancos || typeof j.bancos !== 'object') throw new Error('falta bancos');
  for (const id of Object.keys(j.bancos)) { const a = j.bancos[id].chaves_kw; if (!Array.isArray(a) || !a.length || a.some(x => !(typeof x === 'number' && x >= 0))) throw new Error('banco ' + id + ': chaves_kw invalido'); }
  global.set('bt2_capacidade', j);
  node.status({ fill: 'green', shape: 'dot', text: 'config v' + j.versao + ' · kw100 ' + (j.gerador && j.gerador.kw100 != null ? j.gerador.kw100 : 'null') });
  node.warn('capacidade (C1): config carregada v' + j.versao + ' (pctLim ' + j.pctLim + ', kw100 ' + (j.gerador && j.gerador.kw100 != null ? j.gerador.kw100 : 'null') + ')');
} catch (e) {
  node.status({ fill: 'yellow', shape: 'ring', text: 'config invalida: padrao embutido' });
  node.warn('capacidade (C1): arquivo de configuracao invalido (' + e.message + ') - usando o padrao embutido no fluxo');
}
return null;
"""


def prefixo(nos):
    for n in nos:
        if n.get('type') == 'function':
            m = re.search(r"flow\.set\('(chv\d+)_live'", n.get('func', ''))
            if m: return m.group(1)
    raise SystemExit('prefixo chvNNN nao encontrado')


def gera(banco, origem, novo, vcurta, padrao):
    nos = json.load(open(os.path.join(FLUXOS, origem + '.json'), encoding='utf8'))
    nos = copy.deepcopy(nos); por = {n['id']: n for n in nos}
    P = prefixo(nos); tab = next(n for n in nos if n['type'] == 'tab'); T = tab['id']
    n_chaves = len(padrao['bancos'][banco]['chaves_kw'])
    fmt = dict(data=DATA, padrao=json.dumps(padrao, ensure_ascii=False), comum=KW_COMUM, banco=banco, p=P, n=n_chaves)
    # 1) publica kW comandado no no que ja guarda a leitura
    g = next(n for n in nos if n.get('name') == 'guarda leitura ao vivo (cache)')
    assert g['func'].rstrip().endswith('return null;'), 'guarda leitura mudou'
    corpo = g['func'].rstrip()[:-len('return null;')].rstrip()
    g['func'] = corpo + '\n' + (PUBLICA_JS % fmt).lstrip('\n')
    g['info'] = (g.get('info') or '') + ('\n\nC1 (%s): tambem publica em global bt2_kw_%s o kW comandado do banco (so leitura).' % (DATA, banco))
    # 2) no de limite entre "valida ligar" e "→ fila"
    val = next(n for n in nos if n.get('name') == 'valida ligar')
    alvo = val['wires'][0][0]
    cap_id = P + '_c1_limite'
    cap = {'id': cap_id, 'type': 'function', 'z': T, 'name': 'limite de capacidade (C1 - so registra)', 'func': CAP_JS % fmt,
           'outputs': 1, 'timeout': 0, 'noerr': 0, 'initialize': '', 'finalize': '', 'libs': [], 'wires': [[alvo]],
           'x': val['x'] + 260, 'y': val['y'] + 70,
           'info': 'Passo 5 · C1 (%s). Anota no log (GET /api/logs/%s) quando a carga comandada passaria de kw100 x pctLim / 100 e quando o kW do PLC difere do espelho. NAO recusa comando, NAO muda a mensagem (fail-open). Configuracao: nodered/config/bancos_capacidade.json.' % (DATA, banco)}
    val['wires'][0] = [cap_id]
    if val.get('g'):
        grp = por[val['g']]; grp['nodes'].append(cap_id); cap['g'] = val['g']; grp['h'] = grp.get('h', 100) + 80
    nos.append(cap)
    # 3) cadeia que carrega o arquivo de configuracao (1x ao subir)
    y0 = max(n.get('y', 0) for n in nos if n['type'] != 'group') + 140
    ids = [P + '_c1_ini', P + '_c1_cam', P + '_c1_arq', P + '_c1_cfg']
    nos += [
        {'id': ids[0], 'type': 'inject', 'z': T, 'name': 'ao subir: carregar capacidade', 'props': [{'p': 'payload'}], 'repeat': '', 'crontab': '', 'once': True, 'onceDelay': '2', 'topic': '', 'payload': '', 'payloadType': 'date', 'x': 200, 'y': y0, 'wires': [[ids[1]]], 'g': P + '_c1_g',
         'info': 'Dispara 1 vez, 2 s depois do deploy/reinicio, para ler o arquivo de capacidade.'},
        {'id': ids[1], 'type': 'function', 'z': T, 'name': 'caminho do arquivo', 'func': PREPARA_JS, 'outputs': 1, 'timeout': 0, 'noerr': 0, 'initialize': '', 'finalize': '', 'libs': [], 'x': 440, 'y': y0, 'wires': [[ids[2]]], 'g': P + '_c1_g',
         'info': 'Usa a variavel BT2_CAPACIDADE_JSON; sem ela, nodered/config/bancos_capacidade.json (relativo a pasta onde o Node-RED roda).'},
        {'id': ids[2], 'type': 'file in', 'z': T, 'name': 'ler bancos_capacidade.json', 'filename': 'filename', 'filenameType': 'msg', 'format': 'utf8', 'chunk': False, 'sendError': False, 'encoding': 'none', 'allProps': False, 'x': 690, 'y': y0, 'wires': [[ids[3]]], 'g': P + '_c1_g',
         'info': 'Le o arquivo inteiro como texto. Se nao existir, o Node-RED registra o erro e o fluxo segue com o padrao embutido.'},
        {'id': ids[3], 'type': 'function', 'z': T, 'name': 'valida e publica a capacidade', 'func': CARREGA_JS, 'outputs': 1, 'timeout': 0, 'noerr': 0, 'initialize': '', 'finalize': '', 'libs': [], 'x': 960, 'y': y0, 'wires': [[]], 'g': P + '_c1_g',
         'info': 'Confere pctLim (50 a 200), gerador.kw100 (null ou maior que 0) e chaves_kw de cada banco; guarda em global bt2_capacidade. Invalido = padrao embutido.'},
        {'id': P + '_c1_g', 'type': 'group', 'z': T, 'name': 'Capacidade (C1: carrega o arquivo de limites)', 'style': {'label': True, 'fill': '#fef3c7', 'stroke': '#64748b'}, 'nodes': ids, 'x': 150, 'y': y0 - 50, 'w': 940, 'h': 110},
    ]
    # 4) variavel de ambiente da aba, versao e rotulo
    tab.setdefault('env', []).append({'name': 'BT2_CAPACIDADE_JSON', 'value': '', 'type': 'str'})
    tab['label'] = re.sub(r'v\d+\.\d+', vcurta, tab['label'])
    tab['info'] = ('%s (%s) - C1 (Passo 5): limite de capacidade que SO REGISTRA (nao recusa comando) + carga de nodered/config/bancos_capacidade.json. '
                   'Nada mais mudou em relacao a %s.\n\n' % (vcurta, DATA, origem)) + (tab.get('info') or '')
    destino = os.path.join(FLUXOS, novo + '.json')
    if os.path.exists(destino): sys.exit('ja existe (versao nova nunca sobrescreve): ' + destino)
    json.dump(nos, open(destino, 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=4)
    open(destino, 'a').write('\n')
    print('gerado', os.path.relpath(destino, RAIZ), '(%d nos)' % len(nos))


if __name__ == '__main__':
    padrao = json.load(open(CONFIG, encoding='utf8'))
    for b, o, n, v in BANCOS: gera(b, o, n, v, padrao)
