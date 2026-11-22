#!/usr/bin/env python3
"""gerar_lote_v0.1.py — Passo 10 (item 2): COMANDO EM LOTE das chaves (um degrau do Patamar num comando so).

PARA QUE SERVE (leigo): o Patamar liga varias chaves de uma vez (um "degrau"). Hoje o medidor manda UM comando por chave e cada um espera a sua vez na fila, e cada um espera a leitura
de volta (450 ms + leitura) antes de liberar o proximo: 8 chaves = 8 esperas em serie (e o medidor ja chegou a mandar 26 de uma vez). O lote manda o degrau inteiro em UM comando:
  POST /api/chaves/<banco>/lote   {"ligar":[1,2,5], "desligar":[7]}
O Node-RED valida tudo, confere a capacidade do conjunto (TUDO OU NADA), escreve todos os bits (cada bit continua atomico, um a um) e confere a leitura de volta UMA vez. A pausa entre degraus
continua sendo de quem executa o Patamar (o medidor em JavaScript hoje; um bloco do PLC no futuro): o contrato nao depende de quem executa.

COMO FUNCIONA (tecnico): le a versao do item 1 de cada fluxo e grava a versao nova (a anterior fica intacta):
  chaves-56 v3.11 -> v3.12 | chaves-400 v3.10 -> v3.11 | chaves-550 v1.11 -> v1.12 | chaves-595 v1.11 -> v1.12
  1) rota nova: http in + guarda D3 + frescor da leitura + "valida lote" (regras do "valida ligar" para CADA chave a ligar; desligar sempre permitido), entrando na MESMA fila e saindo pelo MESMO HTTP response;
  2) emendas pequenas nos nos compartilhados, para a rota nova "LOTE": fila (o lote com ligar tambem e cancelado por um Desligar banco), revalida (repete as regras na saida da fila),
     monta (escreve desligar primeiro e depois ligar), confere (confere todas as chaves de uma vez);
  3) no de reserva de capacidade (C2b) estendido: confere o CONJUNTO de chaves a ligar (tudo ou nada) e reserva todas; em modo registrar o lote so anota no log.
Nada muda nas rotas existentes. Falha de ancora (texto que nao bate) => o gerador para e nada e gravado.
USO: python3 nodered/gerador/gerar_lote_v0.1.py        (REGRA: versao nova; nunca sobrescreve a anterior)
"""
import copy, importlib.util, json, os, re, sys

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FLUXOS = os.path.join(RAIZ, 'nodered', 'flows', 'bt2')
CONFIG = os.path.join(RAIZ, 'nodered', 'config', 'bancos_capacidade.json')
DATA = '21/11/2026'
BANCOS = [('56', 'chaves-56-api-v3.11', 'chaves-56-api-v3.12', 'v3.12'), ('400', 'chaves-400-api-v3.10', 'chaves-400-api-v3.11', 'v3.11'),
          ('550', 'chaves-550-api-v1.11', 'chaves-550-api-v1.12', 'v1.12'), ('595', 'chaves-595-api-v1.11', 'chaves-595-api-v1.12', 'v1.12')]

_sp = importlib.util.spec_from_file_location('c1', os.path.join(os.path.dirname(__file__), 'gerar_capacidade_c1_v0.1.py'))
c1 = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(c1)   # KW_COMUM e prefixo()
_sp2 = importlib.util.spec_from_file_location('c2b', os.path.join(os.path.dirname(__file__), 'gerar_capacidade_c2b_reserva_v0.1.py'))
c2b = importlib.util.module_from_spec(_sp2); _sp2.loader.exec_module(c2b)   # RESV_COMUM

VALIDA_JS = r"""// Passo 10 (%(data)s) - VALIDA LOTE: POST /api/chaves/%(banco)s/lote  {"ligar":[indices], "desligar":[indices]}. Mesmas regras do "valida ligar" para CADA chave a ligar; desligar e sempre permitido (seguranca).
// Tudo ou nada: se UMA chave a ligar nao puder, o lote inteiro e recusado e nada e escrito. Um lote so com "desligar" passa sempre (como desligar uma chave).
const b = msg.payload || {};
const falha = (t, code) => { msg.statusCode = code || 400; msg.payload = { ok: false, erro: t }; return [null, msg]; };
const N = %(n)d;
const lig = b.ligar === undefined ? [] : b.ligar, des = b.desligar === undefined ? [] : b.desligar;
if (!Array.isArray(lig) || !Array.isArray(des)) return falha('ligar e desligar devem ser listas de indices');
const todos = lig.concat(des);
if (!todos.length) return falha('informe ao menos uma chave em ligar ou desligar');
if (todos.some(i => !Number.isInteger(i) || i < 1 || i > N)) return falha('indices devem ser inteiros de 1 a ' + N);
if (new Set(todos).size !== todos.length) return falha('uma chave nao pode aparecer duas vezes (nem em ligar e em desligar ao mesmo tempo)');
const live = flow.get('%(p)s_live');
if (!live) return falha('aguardando a 1a leitura do PLC - tente de novo em instantes', 503);
if (lig.length) {                    // desligar e sempre permitido (seguranca)
  if (live.LigarBanco !== true) return falha('banco %(bc)s desligado - acione "Ligar banco" antes (seletora em Auto)', 409);
  for (const i of lig) {
    if (live['Habilitada' + i] !== true) return falha('chave ' + i + ' esta desabilitada (habilite antes de ligar)');
    if (live['Ligada' + i] === true && (live['FalhaRet' + i] === true || live['ContColado' + i] === true)) { msg.statusCode = 409; msg.payload = { ok: false, codigo: 'CONTATOR_COLADO', erro: 'chave ' + i + ': retorno (SB) ativo sem comando - contator colado? verifique no campo antes de ligar' }; return [null, msg]; }
    if (live.ComEt200Ok === true && live['HabResp' + i] !== true) { msg.statusCode = 409; msg.payload = { ok: false, codigo: 'HAB_NAO_CONFIRMADA', erro: 'chave ' + i + ': o PLC do banco ainda nao confirmou a habilitacao - aguarde e tente de novo' }; return [null, msg]; }
  }
  if (live.ComEt200Ok === true && live.RespEcoOk !== true) { msg.statusCode = 409; msg.payload = { ok: false, codigo: 'SEM_ECO', erro: 'o PLC do banco nao confirmou o ultimo pacote (eco) - aguarde e tente de novo' }; return [null, msg]; }
  if (live.ChaveSel) return falha('Setup em andamento (chave ' + live.ChaveSel + ' selecionada) - desmarque no Setup antes de ligar outras', 409);
}
msg.payload = { ligar: lig, desligar: des };
msg._rota = 'LOTE';
return [msg, null];
"""

# no de reserva (C2b) estendido: aceita LIGAR (como antes) e LOTE (conjunto, tudo ou nada)
RESERVA2_JS = r"""// C2b+lote (%(data)s) - RESERVA DE CAPACIDADE NA SAIDA DA FILA, agora tambem para LOTE. Confere de novo o limite AQUI (fila serializada, leitura fresca) somando as reservas ainda em voo.
// LIGAR e LOTE: em modo "recusar" recusa (409 LIMITE_EXCEDIDO) e reserva o aceito. Para o LOTE a conta e do CONJUNTO (tudo ou nada). Modo "registrar": LIGAR nao faz nada; LOTE so anota no log.
// DESLIGAR nunca e recusado. Fail-open: erro => o comando segue. Sem kw100 conhecido => nunca recusa. Saidas: 1 = segue (monta + watchdog) | 2 = recusa -> responde.
try {
  const b = msg.payload || {};
  const unico = msg._rota === 'LIGAR' && b.ligar === true;
  const lote = msg._rota === 'LOTE' && Array.isArray(b.ligar) && b.ligar.length > 0;
  if (unico || lote) {
    const PADRAO = %(padrao)s;
    const cfg = global.get('bt2_capacidade') || PADRAO;
    const recusar = cfg.modo === 'recusar';
    if (recusar || lote) {
%(comum)s
%(resv)s
      const live = flow.get('%(p)s_live') || {};
      const cfgB = (cfg.bancos || {})['%(banco)s'];
      const agora = Date.now();
      const idxs = unico ? [b.indice] : b.ligar;
      const grava = (rota, dado, erro) => {        // mesmo formato do log do GET /api/logs/%(banco)s
        const logs = flow.get('%(p)s_logs') || [];
        logs.push({ t: new Date().toISOString(), rota, dado, status: 0, ok: false, ms: 0, erro });
        if (logs.length > 1000) logs.shift();
        flow.set('%(p)s_logs', logs);
      };
      const limitaLog = (k, ms) => { const t = flow.get('%(p)s_c1_' + k) || 0; if (agora - t < ms) return false; flow.set('%(p)s_c1_' + k, agora); return true; };
      const kwCom = (extra) => { let kw = 0; for (let i = 1; i <= %(n)d; i++) if (live['Ligada' + i] === true || live['CbLigar' + i] === true || extra.includes(i)) kw += kwChave(live, cfgB, i); return Math.round(kw * 1000) / 1000; };
      const ligada = (i) => live['Ligada' + i] === true || live['CbLigar' + i] === true;
      const ign = new Set(idxs);                                                      // as chaves deste comando ja entram em kwCom (extra)
      const vivas0 = reservasVivas(flow.get('%(p)s_resv'), live, agora, 0);           // reservas ainda nao refletidas, uma por chave
      const vivas = vivas0.filter(r => !ign.has(r.idx));
      const novas = idxs.filter(i => !ligada(i) && kwChave(live, cfgB, i) > 0);
      let total = kwCom(idxs) + somaResv(vivas);
      for (const id of Object.keys(cfg.bancos || {})) { if (id === '%(banco)s') continue; const o = global.get('bt2_kw_' + id); if (o && agora - o.ts <= 5000 && isFinite(o.kw)) total += o.kw; }
      total = Math.round(total * 1000) / 1000;
      const g = cfg.gerador || {}, cli = global.get('bt2_kw100_cliente'), validade = (Number(g.validade_s) || 180) * 1000;
      let kw100 = null, origem = null;
      if (g.kw100 > 0) { kw100 = Number(g.kw100); origem = 'arquivo'; }
      else if (cli && cli.kw100 > 0 && agora - cli.ts <= validade) { kw100 = Number(cli.kw100); origem = 'medidor'; }
      const pct = Number(cfg.pctLim) || 110;
      const lim = kw100 ? Math.round(kw100 * pct) / 100 : null;
      if (lim !== null && total > lim + 1e-9) {
        const quem = unico ? 'chave ' + b.indice : 'lote [' + idxs.join(',') + ']';
        const dado = quem + ': total comandado ' + total + ' kW > limite ' + lim + ' kW (kw100 ' + kw100 + ' x ' + pct + ' %%, origem ' + origem + ', com reservas em voo)';
        if (recusar) {
          if (limitaLog('recS', 2000)) { grava('LIMITE', dado, 'LIMITE_EXCEDIDO (C2: RECUSADO na saida da fila, nao foi enviado ao PLC)'); node.warn('capacidade (C2): RECUSADO na saida da fila, banco %(banco)s - ' + dado); }
          flow.set('%(p)s_ctx', { rota: msg._rota, reqId: msg._reqId, fase: 'reserva', lerAgora: false, esp: { reserva: 'LIMITE_EXCEDIDO' } });   // para o log de comunicacao do 'responde'
          msg.statusCode = 409; msg.headers = { 'Content-Type': 'application/json' };
          msg.payload = { ok: false, codigo: 'LIMITE_EXCEDIDO', erro: 'comando recusado: ' + dado, totalKw: total, limiteKw: lim, origemKw100: origem };
          return [null, msg];
        }
        if (limitaLog('excS', 10000)) { grava('LIMITE', dado, 'LIMITE_EXCEDIDO (so registra; o comando NAO foi recusado)'); node.warn('capacidade (C2): LIMITE_EXCEDIDO banco %(banco)s (so registra) - ' + dado); }
      }
      if (recusar) {
        for (const i of novas) vivas.push({ idx: i, kw: kwChave(live, cfgB, i), ts: agora });          // reserva ate o PLC mostrar a chave ligada
        flow.set('%(p)s_resv', vivas);
        global.set('bt2_kw_%(banco)s', { ts: agora, kw: Math.round((kwCom([]) + somaResv(vivas)) * 1000) / 1000 });   // os outros bancos enxergam a reserva na hora
      }
    }
  }
} catch (e) { node.warn('capacidade (C2 reserva): erro ao avaliar (o comando segue normalmente): ' + e.message); }
return [msg, null];
"""


def patch(texto, antigo, novo, rotulo, regex=False):
    n = len(re.findall(antigo, texto)) if regex else texto.count(antigo)
    assert n == 1, 'ancora "%s" encontrada %d vez(es) (esperado 1)' % (rotulo, n)
    return re.sub(antigo, lambda m: novo, texto, count=1) if regex else texto.replace(antigo, novo, 1)


def gera(banco, origem, novo, vcurta, padrao):
    nos = json.load(open(os.path.join(FLUXOS, origem + '.json'), encoding='utf8')); por = {n['id']: n for n in nos}
    P = c1.prefixo(nos); tab = next(n for n in nos if n['type'] == 'tab')
    nome = lambda s: next(n for n in nos if n.get('name') == s)
    por_prefixo = lambda s: next(n for n in nos if (n.get('name') or '').startswith(s))
    val_lig = nome('valida ligar'); n_chaves = int(re.search(r'b\.indice > (\d+)', val_lig['func']).group(1)); bc = re.search(r'banco (BC[0-9,.]+) desligado', val_lig['func']).group(1)
    assert n_chaves == len(padrao['bancos'][banco]['chaves_kw']) or banco == '595', 'numero de chaves diferente do arquivo de capacidade'
    lo_fila = val_lig['wires'][0]; lo_http = val_lig['wires'][1]
    c2 = next(n for n in nos if n['id'] == P + '_c2_limite'); lo_fila = c2['wires'][0]   # o que vai para a fila (link out)
    in_lig = por[P + '_in_lig']; d3 = por[P + '_in_lig_d3']; fresco = por[P + '_fresco_lig']
    # ---- 1) rota nova: http in -> D3 -> frescor -> valida lote -> (fila | http response) ----
    ymax = max(n.get('y', 0) for n in nos if n.get('z') == tab['id'] and n['type'] != 'group'); y0 = ymax + 160
    ids = lambda s: P + '_lote_' + s; rota = [i for i in banco.split(',')][0]
    url = in_lig['url'].replace('/ligar', '/lote')
    http_in = copy.deepcopy(in_lig); http_in.update({'id': ids('in'), 'name': 'POST ' + url, 'url': url, 'x': 265, 'y': y0, 'wires': [[ids('d3')]],
        'info': 'Rota HTTP **POST %s** (Passo 10). Corpo: {"ligar":[indices], "desligar":[indices]}. Um degrau do Patamar num comando so; tudo ou nada.\n\n**Envia para:** saida 1 -> guarda escrita (D3)' % url})
    d3n = copy.deepcopy(d3); d3n.update({'id': ids('d3'), 'x': 520, 'y': y0, 'wires': [[ids('fresco')], lo_http]})
    fr = copy.deepcopy(fresco)
    ftxt = patch(fr['func'], r'(?m)^const seguranca = .*$', "const seguranca = !(Array.isArray(b.ligar) && b.ligar.length > 0);   // lote so de DESLIGAR passa sempre (seguranca)", 'seguranca do frescor', regex=True)
    fr.update({'id': ids('fresco'), 'name': 'frescor da leitura (P3-E1) - lote', 'func': ftxt, 'x': 780, 'y': y0, 'wires': [[ids('valida')], lo_http]})
    vl = copy.deepcopy(val_lig); vl.update({'id': ids('valida'), 'name': 'valida lote', 'func': VALIDA_JS % dict(data=DATA, banco=banco, n=n_chaves, p=P, bc=bc), 'x': 1040, 'y': y0, 'wires': [lo_fila, lo_http],
        'info': 'Passo 10 (%s). Valida o corpo {ligar, desligar} e aplica as regras do "valida ligar" a CADA chave a ligar (tudo ou nada). Desligar e sempre permitido.' % DATA})
    novos = [http_in, d3n, fr, vl]
    gid = ids('g'); novos_ids = [n['id'] for n in novos]
    grp = {'id': gid, 'type': 'group', 'z': tab['id'], 'name': 'POST ' + url, 'style': {'label': True}, 'nodes': novos_ids, 'x': 215, 'y': y0 - 50, 'w': 940, 'h': 100}
    for n in novos: n['g'] = gid; n['z'] = tab['id']
    nos += novos + [grp]
    # ---- 2) emendas nos nos compartilhados ----
    fila = nome('fila (uma gravacao por vez)')
    fila['func'] = patch(fila['func'], "(m._rota === 'LIGAR' && b.ligar === true) ||", "(m._rota === 'LIGAR' && b.ligar === true) || (m._rota === 'LOTE' && Array.isArray(b.ligar) && b.ligar.length > 0) ||", 'dep da fila')
    rev = por_prefixo('revalida na saida da fila'); t = rev['func']
    t = patch(t, "(rota === 'LIGAR' && b.ligar === true) ||", "(rota === 'LIGAR' && b.ligar === true) || (rota === 'LOTE' && Array.isArray(b.ligar) && b.ligar.length > 0) ||", 'depende do revalida')
    t = patch(t, "(rota === 'LIGAR' && b.ligar === false) ||", "(rota === 'LIGAR' && b.ligar === false) || (rota === 'LOTE' && !(Array.isArray(b.ligar) && b.ligar.length > 0)) ||", 'seguranca do revalida')
    lote_rev = """} else if (rota === 'LOTE') {   // Passo 10: lote, repete as regras de entrada para CADA chave a ligar
  if (live.LigarBanco !== true) return falha(409, 'ESTADO_MUDOU', 'o estado mudou enquanto o comando esperava na fila: banco desligado');
  if (live.ChaveSel) return falha(409, 'ESTADO_MUDOU', 'o estado mudou enquanto o comando esperava na fila: Setup em andamento (chave ' + live.ChaveSel + ')');
  for (const i of b.ligar) {
    if (live['Habilitada' + i] !== true) return falha(409, 'ESTADO_MUDOU', 'o estado mudou enquanto o comando esperava na fila: chave ' + i + ' desabilitada');
    if (live['Ligada' + i] === true && (live['FalhaRet' + i] === true || live['ContColado' + i] === true)) return falha(409, 'CONTATOR_COLADO', 'o estado mudou enquanto o comando esperava na fila: chave ' + i + ' com retorno ativo sem comando (contator colado?)');
    if (live.ComEt200Ok === true && (live.RespEcoOk !== true || live['HabResp' + i] !== true)) return falha(409, 'ESTADO_MUDOU', 'o estado mudou enquanto o comando esperava na fila: o PLC do banco nao confirma a chave ' + i);
  }
} else if (rota === 'SELECIONAR') {"""
    t = patch(t, "} else if (rota === 'SELECIONAR') {", lote_rev, 'ramo SELECIONAR do revalida'); rev['func'] = t
    monta = nome('monta escritas por variavel'); t = monta['func']
    t = patch(t, "else if (rota === 'BANCO') {", """else if (rota === 'LOTE') {   // Passo 10: varias chaves num comando so (um degrau do Patamar); desligar primeiro (seguranca), depois ligar
  const b = msg.payload;
  ctx.esp = { lote: { ligar: b.ligar, desligar: b.desligar } };
  for (const i of b.desligar) writes.push({ variable: 'CbLigar' + i, payload: false });
  for (const i of b.ligar) writes.push({ variable: 'CbLigar' + i, payload: true });
}
else if (rota === 'BANCO') {""", 'ramo BANCO do monta')
    t = patch(t, "(rota === 'LIGAR' && b0.ligar === false) || rota === 'ZERAR';", "(rota === 'LIGAR' && b0.ligar === false) || (rota === 'LOTE' && !(Array.isArray(b0.ligar) && b0.ligar.length > 0)) || rota === 'ZERAR';", 'seg do monta'); monta['func'] = t
    conf = nome('confere leitura x escrita')
    conf['func'] = patch(conf['func'], "if (ctx.rota === 'HABILITAR') {", """if (ctx.rota === 'LOTE') {   // Passo 10: confere TODAS as chaves do lote numa leitura so
  const l = ctx.esp.lote, falta = l.ligar.filter(i => read['CbLigar' + i] !== true).concat(l.desligar.filter(i => read['CbLigar' + i] !== false));
  return falta.length ? nc({ ok: false, erro: 'leitura de volta nao conferiu: cbLigar[' + falta.join(',') + ']' }) : fim(200, { ok: true, ligadas: l.ligar, desligadas: l.desligar });
}

if (ctx.rota === 'HABILITAR') {""", 'ramo HABILITAR do confere')
    # ---- 3) no de reserva estendido ----
    res = next(n for n in nos if n['id'] == P + '_c2_reserva')
    fmt = dict(data=DATA, padrao=json.dumps(padrao, ensure_ascii=False), comum=c1.KW_COMUM, resv=c2b.RESV_COMUM, banco=banco, p=P, n=n_chaves)
    res['func'] = RESERVA2_JS % fmt
    res['info'] = (res.get('info') or '') + '\n\nPasso 10 (%s): tambem confere e reserva o CONJUNTO de chaves de um LOTE (tudo ou nada); em modo registrar o lote so anota no log.' % DATA
    tab['label'] = re.sub(r'v\d+\.\d+', vcurta, tab['label'])
    tab['info'] = ('%s (%s) - Passo 10: rota nova POST %s (comando em lote: um degrau do Patamar num comando so, tudo ou nada). As rotas existentes nao mudaram.\n\n' % (vcurta, DATA, url)) + (tab.get('info') or '')
    destino = os.path.join(FLUXOS, novo + '.json')
    if os.path.exists(destino): sys.exit('ja existe (versao nova nunca sobrescreve): ' + destino)
    json.dump(nos, open(destino, 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=4); open(destino, 'a').write('\n')
    print('gerado', os.path.relpath(destino, RAIZ), '(%d nos) | rota %s | %d chaves' % (len(nos), url, n_chaves))


if __name__ == '__main__':
    padrao = json.load(open(CONFIG, encoding='utf8'))
    for b, o, n, v in BANCOS: gera(b, o, n, v, padrao)
