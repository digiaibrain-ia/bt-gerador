#!/usr/bin/env python3
"""gerar_capacidade_c2b_reserva_v0.1.py — Passo 9: RESERVA DE CAPACIDADE NA SAIDA DA FILA (corrige a corrida do limite de capacidade do C2).

PARA QUE SERVE (leigo): o limite de carga do gerador (110 %) era conferido quando o pedido ENTRAVA no Node-RED, olhando o que o PLC ja tinha ligado. Dois pedidos quase ao mesmo
tempo (duplo clique, duas telas, dois bancos) enxergavam a mesma carga e os DOIS passavam, mesmo que juntos estourassem o limite (provado: com limite de 22 kW, duas chaves de 5 kW
sobre 15 kW ja ligados deram 25 kW). A correcao confere de novo na SAIDA da fila, onde os pedidos ja estao em fila unica, e RESERVA o kW da chave aceita ate o PLC mostrar a chave ligada.
So vale com "modo": "recusar". Com "registrar" (padrao) nada muda.

COMO FUNCIONA (tecnico): le a versao C2 de cada fluxo e grava a versao nova (a anterior fica intacta):
  chaves-56 v3.9 -> v3.10 | chaves-400 v3.8 -> v3.9 | chaves-550 v1.9 -> v1.10 | chaves-595 v1.9 -> v1.10
  1) NO NOVO "reserva de capacidade na saida da fila (C2)" entre "revalida na saida da fila" e "monta escritas": 2 saidas [segue -> monta e watchdog | recusa -> responde].
     Em modo recusar, para LIGAR: total = carga comandada (PLC) + reservas ainda nao refletidas + outros bancos; > limite => 409 LIMITE_EXCEDIDO (mesmo caminho de resposta do "revalida").
     Aceito => grava a reserva (flow <p>_resv) e publica na hora o kW do banco (global bt2_kw_<id>) com a reserva, para os outros bancos enxergarem.
  2) "guarda leitura ao vivo (cache)": o kW publicado em bt2_kw_<id> passa a ser carga comandada + reservas vivas (so some a reserva quando o PLC mostra a chave ligada ou apos 5 s).
  O no de entrada (C2) continua igual (recusa cedo, sem reservar). Fail-open: erro no no novo => o comando segue. Desligar nunca e recusado.
NAO FAZ: nao escreve no PLC, nao muda o arquivo de capacidade, nao toca no PC BT2.
USO: python3 nodered/gerador/gerar_capacidade_c2b_reserva_v0.1.py        (REGRA: versao nova; nunca sobrescreve a anterior)
"""
import importlib.util, json, os, re, sys

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FLUXOS = os.path.join(RAIZ, 'nodered', 'flows', 'bt2')
CONFIG = os.path.join(RAIZ, 'nodered', 'config', 'bancos_capacidade.json')
DATA = '20/11/2026'
BANCOS = [('56', 'chaves-56-api-v3.9', 'chaves-56-api-v3.10', 'v3.10'), ('400', 'chaves-400-api-v3.8', 'chaves-400-api-v3.9', 'v3.9'),
          ('550', 'chaves-550-api-v1.9', 'chaves-550-api-v1.10', 'v1.10'), ('595', 'chaves-595-api-v1.9', 'chaves-595-api-v1.10', 'v1.10')]

_sp = importlib.util.spec_from_file_location('c1', os.path.join(os.path.dirname(__file__), 'gerar_capacidade_c1_v0.1.py'))
c1 = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(c1)   # KW_COMUM (kW por chave) e prefixo()

# ajudantes compartilhados pelo no novo e pelo cache (mesmo texto nos dois)
RESV_COMUM = r"""
const RESV_MS = 5000;   // tempo maximo que uma reserva vale se o PLC nao mostrar a chave ligada (escrita + leitura de volta levam bem menos)
const reservasVivas = (resv, live, agora, ignora) => {   // reservas ainda NAO refletidas no PLC e nao vencidas (uma por chave)
  const vistos = {}, out = [];
  for (const r of (Array.isArray(resv) ? resv : [])) {
    if (!r || !(agora - r.ts <= RESV_MS)) continue;
    if (live['Ligada' + r.idx] === true || live['CbLigar' + r.idx] === true) continue;
    if (r.idx === ignora || vistos[r.idx]) continue;
    vistos[r.idx] = 1; out.push(r);
  }
  return out;
};
const somaResv = (v) => v.reduce((a, r) => a + (isFinite(r.kw) ? r.kw : 0), 0);
"""

RESERVA_JS = r"""// C2b (%(data)s) - RESERVA DE CAPACIDADE NA SAIDA DA FILA. Corrige a corrida: dois LIGAR quase juntos viam a mesma carga e os dois passavam do limite.
// So atua em modo "recusar" e so para LIGAR. Confere o limite de novo AQUI (fila ja serializada, leitura fresca) somando as reservas ainda em voo e reserva o kW aceito.
// DESLIGAR nunca e recusado. Fail-open: erro => o comando segue. Sem kw100 conhecido => nunca recusa. Saidas: 1 = segue (monta + watchdog) | 2 = recusa -> responde.
try {
  const b = msg.payload || {};
  if (msg._rota === 'LIGAR' && b.ligar === true) {
    const PADRAO = %(padrao)s;
    const cfg = global.get('bt2_capacidade') || PADRAO;
    if (cfg.modo === 'recusar') {
%(comum)s
%(resv)s
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
      const vivas = reservasVivas(flow.get('%(p)s_resv'), live, agora, b.indice);   // a propria chave ja entra em kwComandado (extra)
      const jaLigada = live['Ligada' + b.indice] === true || live['CbLigar' + b.indice] === true;
      const kwNova = jaLigada ? 0 : kwChave(live, cfgB, b.indice);
      let total = kwComandado(live, cfgB, %(n)d, b.indice) + somaResv(vivas);
      for (const id of Object.keys(cfg.bancos || {})) { if (id === '%(banco)s') continue; const o = global.get('bt2_kw_' + id); if (o && agora - o.ts <= 5000 && isFinite(o.kw)) total += o.kw; }
      total = Math.round(total * 1000) / 1000;
      const g = cfg.gerador || {}, cli = global.get('bt2_kw100_cliente'), validade = (Number(g.validade_s) || 180) * 1000;
      let kw100 = null, origem = null;
      if (g.kw100 > 0) { kw100 = Number(g.kw100); origem = 'arquivo'; }
      else if (cli && cli.kw100 > 0 && agora - cli.ts <= validade) { kw100 = Number(cli.kw100); origem = 'medidor'; }
      const pct = Number(cfg.pctLim) || 110;
      const lim = kw100 ? Math.round(kw100 * pct) / 100 : null;
      if (lim !== null && total > lim + 1e-9) {
        const dado = 'chave ' + b.indice + ': total comandado ' + total + ' kW > limite ' + lim + ' kW (kw100 ' + kw100 + ' x ' + pct + ' %%, origem ' + origem + ', com reservas em voo)';
        if (limitaLog('recS', 2000)) { grava('LIMITE', dado, 'LIMITE_EXCEDIDO (C2: RECUSADO na saida da fila, nao foi enviado ao PLC)'); node.warn('capacidade (C2): RECUSADO na saida da fila, banco %(banco)s - ' + dado); }
        flow.set('%(p)s_ctx', { rota: 'LIGAR', reqId: msg._reqId, fase: 'reserva', lerAgora: false, esp: { reserva: 'LIMITE_EXCEDIDO' } });   // para o log de comunicacao do 'responde'
        msg.statusCode = 409; msg.headers = { 'Content-Type': 'application/json' };
        msg.payload = { ok: false, codigo: 'LIMITE_EXCEDIDO', erro: 'comando recusado: ' + dado, totalKw: total, limiteKw: lim, origemKw100: origem };
        return [null, msg];
      }
      if (kwNova > 0) vivas.push({ idx: b.indice, kw: kwNova, ts: agora });             // reserva ate o PLC mostrar a chave ligada
      flow.set('%(p)s_resv', vivas);
      global.set('bt2_kw_%(banco)s', { ts: agora, kw: Math.round((kwComandado(live, cfgB, %(n)d, 0) + somaResv(vivas)) * 1000) / 1000 });   // os outros bancos enxergam a reserva na hora
    }
  }
} catch (e) { node.warn('capacidade (C2 reserva): erro ao avaliar (o comando segue normalmente): ' + e.message); }
return [msg, null];
"""


def gera_fluxo(banco, origem, novo, vcurta, padrao):
    nos = json.load(open(os.path.join(FLUXOS, origem + '.json'), encoding='utf8')); por = {n['id']: n for n in nos}
    P = c1.prefixo(nos); tab = next(n for n in nos if n['type'] == 'tab')
    n_chaves = len(padrao['bancos'][banco]['chaves_kw'])
    fmt = dict(data=DATA, padrao=json.dumps(padrao, ensure_ascii=False), comum=c1.KW_COMUM, resv=RESV_COMUM, banco=banco, p=P, n=n_chaves)
    por_nome = lambda nome: next(n for n in nos if n.get('name') == nome)
    # 1) cache: publica carga comandada + reservas vivas
    g = por_nome('guarda leitura ao vivo (cache)')
    padrao_pub = re.compile(r"global\.set\('bt2_kw_%s', \{ ts: Date\.now\(\), kw: kwComandado\(msg\.payload \|\| \{\}, \(cfg\.bancos \|\| \{\}\)\['%s'\], %d, 0\) \}\);" % (banco, banco, n_chaves))
    novo_pub = (RESV_COMUM.strip('\n') + "\n  const _vivas = reservasVivas(flow.get('%(p)s_resv'), msg.payload || {}, Date.now(), 0);\n"
                "  if ((flow.get('%(p)s_resv') || []).length !== _vivas.length) flow.set('%(p)s_resv', _vivas);   // limpa reservas ja refletidas ou vencidas\n"
                "  global.set('bt2_kw_%(banco)s', { ts: Date.now(), kw: Math.round((kwComandado(msg.payload || {}, (cfg.bancos || {})['%(banco)s'], %(n)d, 0) + somaResv(_vivas)) * 1000) / 1000 });   // C2b: carga comandada + reservas") % fmt
    g['func'], k = padrao_pub.subn(lambda m: novo_pub, g['func'], count=1); assert k == 1, 'linha de publicacao do cache mudou'
    g['info'] = (g.get('info') or '') + ('\n\nC2b (%s): o kW publicado em bt2_kw_%s inclui as reservas de capacidade ainda nao refletidas no PLC.' % (DATA, banco))
    # 2) no novo entre "revalida" e "monta"/"watchdog"
    rev = por_nome('revalida na saida da fila (P3-A2/A3)'); monta = por_nome('monta escritas por variavel'); wd = por_nome('watchdog 8s (PLC off/timeout)'); resp = por_nome('responde + libera fila')
    assert rev['wires'][0] == [monta['id'], wd['id']] and rev['wires'][1] == [resp['id']], 'fiacao do revalida mudou'
    rid = P + '_c2_reserva'
    cap = {'id': rid, 'type': 'function', 'z': rev['z'], 'g': rev.get('g'), 'name': 'reserva de capacidade na saida da fila (C2)', 'func': RESERVA_JS % fmt, 'outputs': 2, 'timeout': 0, 'noerr': 0,
           'initialize': '', 'finalize': '', 'libs': [], 'x': rev['x'] + 260, 'y': rev['y'], 'wires': [[monta['id'], wd['id']], [resp['id']]],
           'info': 'Passo 9 (%s). Em modo "recusar", confere de novo o limite de capacidade na SAIDA da fila somando as reservas ainda em voo e reserva o kW aceito (corrige a corrida de dois LIGAR quase juntos). '
                   'Modo "registrar" (padrao): nao faz nada. Desligar nunca e recusado. Sem kw100 conhecido nunca recusa. Fail-open.' % DATA}
    if not cap['g']: cap.pop('g')
    rev['wires'][0] = [rid]
    nos.append(cap)
    if rev.get('g'):
        grp = next(n for n in nos if n['id'] == rev['g']); grp['nodes'].append(rid)
    # 3) aba
    tab['label'] = re.sub(r'v\d+\.\d+', vcurta, tab['label'])
    tab['info'] = ('%s (%s) - Passo 9: reserva de capacidade na saida da fila (corrige a corrida do limite, so com "modo": "recusar"). Nada mais mudou em relacao a %s.\n\n' % (vcurta, DATA, origem)) + (tab.get('info') or '')
    destino = os.path.join(FLUXOS, novo + '.json')
    if os.path.exists(destino): sys.exit('ja existe (versao nova nunca sobrescreve): ' + destino)
    json.dump(nos, open(destino, 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=4); open(destino, 'a').write('\n')
    print('gerado', os.path.relpath(destino, RAIZ), '(%d nos)' % len(nos))


if __name__ == '__main__':
    padrao = json.load(open(CONFIG, encoding='utf8'))
    for b, o, n, v in BANCOS: gera_fluxo(b, o, n, v, padrao)
