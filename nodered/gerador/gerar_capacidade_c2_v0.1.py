#!/usr/bin/env python3
"""gerar_capacidade_c2_v0.1.py — Passo 5 (C2): limite de capacidade e de degrau que podem RECUSAR (HTTP 409), desligados por padrão.

PARA QUE SERVE (leigo): o C1 só anotava no log quando o limite de carga do gerador seria passado. O C2 acrescenta a RECUSA: com "modo": "recusar" no arquivo
nodered/config/bancos_capacidade.json o Node-RED recusa (HTTP 409) o comando de LIGAR uma chave que levaria a carga acima do limite do gerador (kw100 x pctLim / 100)
ou acima do degrau permitido. DESLIGAR nunca é recusado. Com o padrão ("modo": "registrar") o comportamento é o do C1: só anota. Também nasce a rota
POST/GET /api/gerador/capacidade, por onde o medidor informa o kW a 100 % do gerador em ensaio.

COMO FUNCIONA (técnico): lê a versão do C1 de cada fluxo e grava a versão nova (a anterior fica intacta):
  chaves-56 v3.8 -> v3.9 | chaves-400 v3.7 -> v3.8 | chaves-550 v1.8 -> v1.9 | chaves-595 v1.8 -> v1.9
  1) troca o nó "limite de capacidade (C1)" por "(C2)" com 2 saídas: [segue para a fila, recusa -> HTTP response]; fail-open (erro => segue);
  2) atualiza a validação do arquivo e o padrão embutido (modo, kw100_max, validade_s, degrau);
  3) cria o fluxo gerador-capacidade-api-v1.0 (POST com guarda D3 + GET) que guarda o kw100 do medidor em global 'bt2_kw100_cliente'.
Prioridade do kw100: arquivo (se preenchido) > valor do medidor (se recente) > nenhum (limite NÃO avaliado; nunca recusa sem saber o limite).
NÃO FAZ: não recusa nada com o padrão do arquivo, não escreve no PLC, não toca no PC BT2.
USO: python3 nodered/gerador/gerar_capacidade_c2_v0.1.py        (REGRA: versão nova; nunca sobrescreve a anterior)
"""
import copy, importlib.util, json, os, re, sys

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FLUXOS = os.path.join(RAIZ, 'nodered', 'flows', 'bt2')
CONFIG = os.path.join(RAIZ, 'nodered', 'config', 'bancos_capacidade.json')
DATA = '19/11/2026'
BANCOS = [('56', 'chaves-56-api-v3.8', 'chaves-56-api-v3.9', 'v3.9'), ('400', 'chaves-400-api-v3.7', 'chaves-400-api-v3.8', 'v3.8'),
          ('550', 'chaves-550-api-v1.8', 'chaves-550-api-v1.9', 'v1.9'), ('595', 'chaves-595-api-v1.8', 'chaves-595-api-v1.9', 'v1.9')]

_sp = importlib.util.spec_from_file_location('c1', os.path.join(os.path.dirname(__file__), 'gerar_capacidade_c1_v0.1.py'))
c1 = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(c1)   # reaproveita KW_COMUM (kW por chave) do C1

CAP2_JS = r"""// C2 (Passo 5, %(data)s) - LIMITE DE CAPACIDADE E DEGRAU. Modo "registrar": so anota (como o C1). Modo "recusar": RECUSA ligar com HTTP 409.
// DESLIGAR nunca e recusado. Fail-open: qualquer erro aqui => o comando segue (saida 1) exatamente como antes. Sem kw100 conhecido => nunca recusa.
// Saidas: 1 = segue para a fila | 2 = recusa -> HTTP response.
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
      grava('CAPACIDADE', 'chave ' + b.indice + ': PLC informa ' + nom + ' kW, espelho tem ' + esp + ' kW', 'NOMINAL_DIVERGE (so registra)');
    // 2) carga comandada depois deste comando: este banco + os outros (valores publicados ha ate 5 s)
    const jaLigada = live['Ligada' + b.indice] === true || live['CbLigar' + b.indice] === true;
    const kwNova = jaLigada ? 0 : kwChave(live, cfgB, b.indice);
    let total = kwComandado(live, cfgB, %(n)d, b.indice);
    for (const id of Object.keys(cfg.bancos || {})) { if (id === '%(banco)s') continue; const o = global.get('bt2_kw_' + id); if (o && agora - o.ts <= 5000 && isFinite(o.kw)) total += o.kw; }
    total = Math.round(total * 1000) / 1000;
    // 3) kW a 100 %% efetivo: arquivo (se preenchido) > valor informado pelo medidor (se recente)
    const g = cfg.gerador || {}, cli = global.get('bt2_kw100_cliente'), validade = (Number(g.validade_s) || 180) * 1000;
    let kw100 = null, origem = null;
    if (g.kw100 > 0) { kw100 = Number(g.kw100); origem = 'arquivo'; }
    else if (cli && cli.kw100 > 0 && agora - cli.ts <= validade) { kw100 = Number(cli.kw100); origem = 'medidor'; }
    const pct = Number(cfg.pctLim) || 110, recusa = cfg.modo === 'recusar';
    const lim = kw100 ? Math.round(kw100 * pct) / 100 : null;
    let motivo = null;
    if (lim !== null) {
      if (total > lim + 1e-9) motivo = { codigo: 'LIMITE_EXCEDIDO', dado: 'chave ' + b.indice + ': total comandado ' + total + ' kW > limite ' + lim + ' kW (kw100 ' + kw100 + ' x ' + pct + ' %%, origem ' + origem + ')' };
    } else if (limitaLog('semkw', 3600000)) node.warn('capacidade: kw100 do gerador desconhecido (arquivo e medidor) - limite NAO avaliado, nada e recusado. Total comandado agora: ' + total + ' kW');
    // 4) degrau: carga NOVA ligada dentro da janela
    const dg = cfg.degrau || {}, jan = (Number(dg.janela_s) || 10) * 1000;
    const rec = (flow.get('%(p)s_c2_deg') || []).filter(e => agora - e.ts <= jan);
    const somaDeg = Math.round((rec.reduce((a, e) => a + e.kw, 0) + kwNova) * 1000) / 1000;
    if (!motivo && Number(dg.max_kw) > 0 && somaDeg > Number(dg.max_kw) + 1e-9)
      motivo = { codigo: 'DEGRAU_EXCEDIDO', dado: 'chave ' + b.indice + ': ' + somaDeg + ' kW novos em ' + (jan / 1000) + ' s > degrau maximo ' + dg.max_kw + ' kW' };
    if (motivo) {
      if (recusa) {
        if (limitaLog('rec' + motivo.codigo, 2000)) { grava('LIMITE', motivo.dado, motivo.codigo + ' (C2: comando RECUSADO, nao foi enviado ao PLC)'); node.warn('capacidade (C2): RECUSADO banco %(banco)s - ' + motivo.dado); }
        msg.statusCode = 409; msg.headers = { 'Content-Type': 'application/json' };
        msg.payload = { ok: false, codigo: motivo.codigo, erro: 'comando recusado: ' + motivo.dado, totalKw: total, limiteKw: lim, origemKw100: origem };
        return [null, msg];
      }
      if (limitaLog('exc' + motivo.codigo, 10000)) { grava('LIMITE', motivo.dado, motivo.codigo + ' (so registra; o comando NAO foi recusado)'); node.warn('capacidade (C2): ' + motivo.codigo + ' banco %(banco)s (so registra) - ' + motivo.dado); }
    }
    if (kwNova > 0) flow.set('%(p)s_c2_deg', rec.concat([{ ts: agora, kw: kwNova }]).slice(-200));   // o degrau so conta comandos que seguiram
  }
} catch (e) { node.warn('capacidade (C2): erro ao avaliar (o comando segue normalmente): ' + e.message); }
return [msg, null];
"""

CARREGA2_JS = r"""// C2: valida o arquivo de capacidade e publica em global 'bt2_capacidade'. Invalido = continua o padrao embutido (nunca derruba o fluxo).
try {
  const j = JSON.parse(String(msg.payload));
  if (!(Number(j.pctLim) >= 50 && Number(j.pctLim) <= 200)) throw new Error('pctLim fora de 50 a 200');
  if (j.modo !== undefined && j.modo !== 'registrar' && j.modo !== 'recusar') throw new Error('modo deve ser "registrar" ou "recusar"');
  const g = j.gerador || {};
  if (g.kw100 != null && !(Number(g.kw100) > 0)) throw new Error('gerador.kw100 deve ser null ou maior que 0');
  if (g.kw100_max != null && !(Number(g.kw100_max) > 0)) throw new Error('gerador.kw100_max deve ser maior que 0');
  if (g.validade_s != null && !(Number(g.validade_s) >= 10)) throw new Error('gerador.validade_s deve ser 10 ou mais');
  const d = j.degrau || {};
  if (d.max_kw != null && !(Number(d.max_kw) > 0)) throw new Error('degrau.max_kw deve ser null ou maior que 0');
  if (d.janela_s != null && !(Number(d.janela_s) >= 1 && Number(d.janela_s) <= 300)) throw new Error('degrau.janela_s deve ser de 1 a 300');
  if (!j.bancos || typeof j.bancos !== 'object') throw new Error('falta bancos');
  for (const id of Object.keys(j.bancos)) { const a = j.bancos[id].chaves_kw; if (!Array.isArray(a) || !a.length || a.some(x => !(typeof x === 'number' && x >= 0))) throw new Error('banco ' + id + ': chaves_kw invalido'); }
  global.set('bt2_capacidade', j);
  node.status({ fill: j.modo === 'recusar' ? 'red' : 'green', shape: 'dot', text: 'config v' + j.versao + ' · modo ' + (j.modo || 'registrar') + ' · kw100 ' + (g.kw100 != null ? g.kw100 : 'null') });
  node.warn('capacidade: config carregada v' + j.versao + ' (modo ' + (j.modo || 'registrar') + ', pctLim ' + j.pctLim + ', kw100 ' + (g.kw100 != null ? g.kw100 : 'null') + ', degrau ' + (d.max_kw != null ? d.max_kw + ' kW/' + (d.janela_s || 10) + ' s' : 'nao avaliado') + ')');
} catch (e) {
  node.status({ fill: 'yellow', shape: 'ring', text: 'config invalida: padrao embutido' });
  node.warn('capacidade: arquivo de configuracao invalido (' + e.message + ') - usando o padrao embutido no fluxo');
}
return null;
"""

POST_JS = r"""// C2: o medidor informa o kW a 100 %% do gerador em ensaio. Guardado em global 'bt2_kw100_cliente' (vale por gerador.validade_s; o medidor reenvia a cada minuto).
const PADRAO = %(padrao)s;
const cfg = global.get('bt2_capacidade') || PADRAO;
const max = Number(cfg.gerador && cfg.gerador.kw100_max) || 1000;
const b = msg.payload || {};
const kw = Number(b.kw100);
msg.headers = { 'Content-Type': 'application/json' };
if (!(typeof b.kw100 === 'number' || (typeof b.kw100 === 'string' && b.kw100.trim() !== '')) || !isFinite(kw) || !(kw > 0) || kw > max) {
  msg.statusCode = 400; msg.payload = { ok: false, codigo: 'KW100_INVALIDO', erro: 'kw100 deve ser um numero maior que 0 e ate ' + max + ' kW' };
  return msg;
}
const modelo = String(b.modelo || '').slice(0, 80);
global.set('bt2_kw100_cliente', { kw100: kw, modelo, ts: Date.now() });
msg.statusCode = 200; msg.payload = { ok: true, kw100: kw, modelo, validadeS: Number(cfg.gerador && cfg.gerador.validade_s) || 180 };
return msg;
"""

GET_JS = r"""// C2: mostra qual kW a 100 %% o Node-RED esta usando para o limite e de onde veio.
const PADRAO = %(padrao)s;
const cfg = global.get('bt2_capacidade') || PADRAO, g = cfg.gerador || {}, cli = global.get('bt2_kw100_cliente'), agora = Date.now();
const validade = Number(g.validade_s) || 180;
const idadeS = cli ? Math.round((agora - cli.ts) / 1000) : null;
const medidorValido = !!(cli && cli.kw100 > 0 && idadeS <= validade);
const efetivo = g.kw100 > 0 ? { kw100: Number(g.kw100), origem: 'arquivo' } : (medidorValido ? { kw100: Number(cli.kw100), origem: 'medidor' } : { kw100: null, origem: null });
const pct = Number(cfg.pctLim) || 110;
msg.statusCode = 200; msg.headers = { 'Content-Type': 'application/json' };
msg.payload = { ok: true, modo: cfg.modo || 'registrar', pctLim: pct, kw100Arquivo: g.kw100 != null ? g.kw100 : null,
  kw100Medidor: cli ? { kw100: cli.kw100, modelo: cli.modelo, idadeS, valido: medidorValido } : null,
  efetivo, limiteKw: efetivo.kw100 ? Math.round(efetivo.kw100 * pct) / 100 : null, degrau: cfg.degrau || null };
return msg;
"""


def gera_fluxo(banco, origem, novo, vcurta, padrao):
    nos = json.load(open(os.path.join(FLUXOS, origem + '.json'), encoding='utf8')); por = {n['id']: n for n in nos}
    P = c1.prefixo(nos); tab = next(n for n in nos if n['type'] == 'tab'); T = tab['id']
    n_chaves = len(padrao['bancos'][banco]['chaves_kw'])
    fmt = dict(data=DATA, padrao=json.dumps(padrao, ensure_ascii=False), comum=c1.KW_COMUM, banco=banco, p=P, n=n_chaves)
    # 1) padrao embutido novo no no que publica o kW comandado
    g = next(n for n in nos if n.get('name') == 'guarda leitura ao vivo (cache)')
    novo_func, k = re.subn(r"const PADRAO = \{.*?\};\n", lambda m: 'const PADRAO = ' + fmt['padrao'] + ';\n', g['func'], count=1, flags=re.S)
    assert k == 1; g['func'] = novo_func
    # 2) no de limite: C1 (1 saida) -> C2 (2 saidas)
    velho = por[P + '_c1_limite']; val = next(n for n in nos if n.get('name') == 'valida ligar')
    erro_alvo = val['wires'][1][0]; seguir = velho['wires'][0][0]
    cap_id = P + '_c2_limite'
    cap = dict(velho); cap.update({'id': cap_id, 'name': 'limite de capacidade e degrau (C2)', 'func': CAP2_JS % fmt, 'outputs': 2, 'wires': [[seguir], [erro_alvo]],
        'info': 'Passo 5 · C2 (%s). Modo "registrar" (padrao): so anota no log, como o C1. Modo "recusar" (nodered/config/bancos_capacidade.json): responde HTTP 409 LIMITE_EXCEDIDO ou DEGRAU_EXCEDIDO e NAO envia o comando ao PLC. Desligar nunca e recusado. Sem kw100 conhecido nunca recusa. Fail-open.' % DATA})
    nos = [n for n in nos if n['id'] != velho['id']]; nos.append(cap)
    val = next(n for n in nos if n.get('name') == 'valida ligar'); val['wires'][0] = [cap_id]
    if val.get('g'):
        grp = next(n for n in nos if n['id'] == val['g']); grp['nodes'] = [cap_id if i == velho['id'] else i for i in grp['nodes']]
    # 3) validacao do arquivo
    ld = next(n for n in nos if n['id'] == P + '_c1_cfg'); ld['func'] = CARREGA2_JS; ld['name'] = 'valida e publica a capacidade (C2)'
    ld['info'] = 'Confere modo, pctLim (50 a 200), gerador (kw100, kw100_max, validade_s), degrau (max_kw, janela_s) e chaves_kw de cada banco; guarda em global bt2_capacidade. Invalido = padrao embutido.'
    # 4) aba
    tab['label'] = re.sub(r'v\d+\.\d+', vcurta, tab['label'])
    tab['info'] = ('%s (%s) - C2 (Passo 5): o limite de capacidade e o degrau podem RECUSAR (HTTP 409) com "modo": "recusar" no arquivo de capacidade; padrao "registrar" (so anota). '
                   'Nada mais mudou em relacao a %s.\n\n' % (vcurta, DATA, origem)) + (tab.get('info') or '')
    destino = os.path.join(FLUXOS, novo + '.json')
    if os.path.exists(destino): sys.exit('ja existe (versao nova nunca sobrescreve): ' + destino)
    json.dump(nos, open(destino, 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=4); open(destino, 'a').write('\n')
    print('gerado', os.path.relpath(destino, RAIZ), '(%d nos)' % len(nos))


def gera_api(padrao):
    base = json.load(open(os.path.join(FLUXOS, 'chaves-56-api-v3.8.json'), encoding='utf8')); by = {n['id']: n for n in base}
    d3 = copy.deepcopy(by['chv56_in_lig_d3']); http_in = copy.deepcopy(by['chv56_in_lig']); http_out = copy.deepcopy(by['chv56_out'])
    fmt = dict(padrao=json.dumps(padrao, ensure_ascii=False))
    T = 'cap_tab'; ids = lambda s: 'cap_' + s
    tab = {'id': T, 'type': 'tab', 'label': 'Capacidade do gerador (API) v1.0', 'disabled': False,
           'info': 'v1.0 (%s) - Passo 5 (C2): POST/GET /api/gerador/capacidade. O medidor informa o kW a 100 %% do gerador em ensaio; os fluxos de chaves usam esse valor (se o arquivo bancos_capacidade.json nao o define) para o limite de capacidade. Escrita com a guarda D3 (so a propria tela, em JSON). Sem enderecos S7.' % DATA,
           'env': [{'name': 'BT2_ORIGENS_OK', 'value': '', 'type': 'str'}]}
    def no(base_no, nid, nome, x, y, wires, **kw):
        n = copy.deepcopy(base_no); n.update({'id': nid, 'z': T, 'name': nome, 'x': x, 'y': y, 'wires': wires}); n.pop('g', None); n.update(kw); return n
    r_post = no(http_in, ids('in_post'), 'POST /api/gerador/capacidade', 250, 100, [[ids('d3')]], url='/api/gerador/capacidade', method='post')
    d3n = no(d3, ids('d3'), 'guarda escrita (D3)', 520, 100, [[ids('post')], [ids('out')]])
    d3n['info'] = (d3n.get('info') or '') + ' (copia da guarda dos fluxos de chaves)'
    post = {'id': ids('post'), 'type': 'function', 'z': T, 'name': 'valida e guarda o kW a 100 por cento', 'func': POST_JS % fmt, 'outputs': 1, 'timeout': 0, 'noerr': 0, 'initialize': '', 'finalize': '', 'libs': [], 'x': 800, 'y': 100, 'wires': [[ids('out')]],
            'info': 'Aceita {kw100, modelo}. kw100 numero maior que 0 e ate gerador.kw100_max (padrao 1000); senao 400 KW100_INVALIDO. Guarda em global bt2_kw100_cliente com a hora.'}
    r_get = no(http_in, ids('in_get'), 'GET /api/gerador/capacidade', 250, 220, [[ids('get')]], url='/api/gerador/capacidade', method='get')
    get = {'id': ids('get'), 'type': 'function', 'z': T, 'name': 'qual kW a 100 % esta valendo', 'func': GET_JS % fmt, 'outputs': 1, 'timeout': 0, 'noerr': 0, 'initialize': '', 'finalize': '', 'libs': [], 'x': 560, 'y': 220, 'wires': [[ids('out')]],
           'info': 'So leitura: modo, pctLim, kw100 do arquivo, kw100 informado pelo medidor (e a idade), o efetivo e o limite em kW.'}
    out = no(http_out, ids('out'), 'HTTP response', 1080, 160, [])
    nos = [tab, r_post, d3n, post, r_get, get, out]
    for n in nos:
        if n['type'] != 'tab' and not n.get('info'): n['info'] = 'Passo 5 · C2.'
    destino = os.path.join(FLUXOS, 'gerador-capacidade-api-v1.0.json')
    if os.path.exists(destino): sys.exit('ja existe: ' + destino)
    json.dump(nos, open(destino, 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=4); open(destino, 'a').write('\n')
    print('gerado', os.path.relpath(destino, RAIZ), '(%d nos)' % len(nos))


if __name__ == '__main__':
    padrao = json.load(open(CONFIG, encoding='utf8'))
    for b, o, n, v in BANCOS: gera_fluxo(b, o, n, v, padrao)
    gera_api(padrao)
