#!/usr/bin/env python3
"""Fase 3, Etapa 4b - gera as VERSOES NOVAS dos 4 fluxos de chaves corrigindo P3-A4 e P3-A5. Parte das versoes da Etapa 4a; nao sobrescreve nada.

P3-A4 (falso 500 com escrita aplicada depois): o 'confere' fazia UMA leitura apos 450 ms e respondia 500 se nao batesse, liberando a fila, e a
  escrita chegava depois. Agora ha uma JANELA de confirmacao (variavel da aba CONF_JANELA_MS, padrao 2000 ms): a primeira leitura que bater
  vira 200; se nao bater, o 'confere' tenta de novo (retenta a cada 200 ms) e so no fim da janela responde 504 {ok:false, incerto:true}
  ("enviado, sem confirmacao do PLC: confira o estado antes de repetir"). SALVAR nao muda (o SetupOk e decisao do PLC, nao latencia).
P3-A5 (escrita antiga atrasada ultrapassa a nova; so se o driver aplicar escritas concorrentes): apos um 504 as VARIAVEIS daquele comando
  entram em QUARENTENA (QUARENTENA_MS, padrao 10 s). Comandos comuns que escrevem nelas respondem 503 AGUARDE_CONFIRMACAO (+Retry-After);
  as outras variaveis do banco continuam livres. Comandos de seguranca (Desligar banco, desligar chave, ZERAR) PASSAM e sao REAFIRMADOS:
  a cada 1 s confere-se a leitura e, se uma escrita tardia desfez o desligado, o mesmo comando e reescrito.
Uso: python3 nodered/gerador/gerar_fluxos_portao4b_v0.1.py
"""
import json, os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PASTA = os.path.join(RAIZ, 'nodered', 'flows', 'bt2')
TROCAS = [  # (banco, origem, destino)
    ('56', 'chaves-56-api-v3.3.json', 'chaves-56-api-v3.4.json'),
    ('400', 'chaves-400-api-v3.3.json', 'chaves-400-api-v3.4.json'),
    ('550', 'chaves-550-api-v1.4.json', 'chaves-550-api-v1.5.json'),
    ('595', 'chaves-595-api-v1.4.json', 'chaves-595-api-v1.5.json'),
]
# ---------- confere ----------
FIM_ANTIGO = "const fim = (code, body) => [null, { _reqId: ctx.reqId, statusCode: code, payload: body }];"
FIM_NOVO = FIM_ANTIGO + """
// PORTAO 4b (P3-A4): janela de confirmacao. Leitura que nao bate DENTRO da janela nao e erro: tenta de novo. So no fim da janela vira 504 'incerto'
// (nao sabemos se o PLC vai aplicar) e as variaveis do comando entram em QUARENTENA (P3-A5). SALVAR continua como antes.
const JANELA = Number(env.get('CONF_JANELA_MS')) || 2000;
const nc = (corpo) => {
  if (Date.now() - (ctx.t0 || 0) < JANELA) { ctx.lerAgora = false; flow.set('{P}_ctx', ctx); return [null, null, { _reqId: ctx.reqId, payload: null }]; }
  const q = flow.get('{P}_quar') || {};
  const ate = Date.now() + (Number(env.get('QUARENTENA_MS')) || 10000);
  for (const v of (ctx.vars || [])) q[v] = { ate, rota: ctx.rota, reqId: ctx.reqId };
  flow.set('{P}_quar', q);
  corpo.incerto = true;
  corpo.erro = 'comando enviado, sem confirmacao do PLC em ' + JANELA + ' ms: confira o estado antes de repetir (' + corpo.erro + ')';
  return fim(504, corpo);
};"""
# ---------- monta ----------
MONTA_ANTIGO = """flow.set('{P}_ctx', ctx);
return [writes, { payload: null, _reqId: ctx.reqId }, null, w2];"""
MONTA_NOVO = """// PORTAO 4b (P3-A5): QUARENTENA POR VARIAVEL. Se uma variavel que este comando vai escrever esta em quarentena (comando anterior ficou 'incerto'),
// o comando COMUM e recusado (503) para nao ultrapassar a escrita antiga. Comando de SEGURANCA (desligar banco, desligar chave, ZERAR) passa e e REAFIRMADO.
ctx.t0 = Date.now();
ctx.vars = writes.concat(w2).map(w => w.variable);
// erro EXPLICITO de escrita (s7 out falhou): o 'catch' ja sabe de qual pedido e (via _reqId) e responde 500 DEFINITIVO, sem quarentena (nada vai chegar depois)
for (const w of writes) w._reqId = ctx.reqId;
for (const w of w2) w._reqId = ctx.reqId;
const q = flow.get('{P}_quar') || {};
for (const k of Object.keys(q)) if (q[k].ate <= ctx.t0) delete q[k];
flow.set('{P}_quar', q);
const hit = ctx.vars.filter(v => q[v]);
if (hit.length) {
  const b0 = msg.payload || {};
  const seg = (rota === 'BANCO' && b0.ligar === false) || (rota === 'LIGAR' && b0.ligar === false) || rota === 'ZERAR';
  const ate = Math.max(...hit.map(v => q[v].ate));
  if (!seg) {
    ctx.esp = { quarentena: hit.slice(0, 4) };
    flow.set('{P}_ctx', ctx);
    return [null, null, null, null, { _reqId: ctx.reqId, statusCode: 503, headers: { 'Retry-After': String(Math.max(1, Math.ceil((ate - ctx.t0) / 1000))) },
      payload: { ok: false, codigo: 'AGUARDE_CONFIRMACAO', erro: 'um comando anterior sobre ' + hit[0] + ' ficou sem confirmacao do PLC: aguarde ' + Math.max(1, Math.ceil((ate - ctx.t0) / 1000)) + ' s e confira o estado antes de repetir', retryAfterS: Math.max(1, Math.ceil((ate - ctx.t0) / 1000)) } }];
  }
  if (!msg._reafirma) {
    const l = flow.get('{P}_reafirma') || [];
    l.push({ rota, payload: msg.payload || null, ate }); if (l.length > 20) l.shift();
    flow.set('{P}_reafirma', l);
  }
}
flow.set('{P}_ctx', ctx);
return [writes, { payload: null, _reqId: ctx.reqId }, null, w2, null];"""
RETENTA = """// PORTAO 4b (P3-A4) - proxima leitura de confirmacao dentro da janela. So vale se o comando ainda e o mesmo (nao respondeu / nao entrou outro).
const ctx = flow.get('{P}_ctx');
if (!ctx || ctx.reqId !== msg._reqId) return null;
ctx.lerAgora = true;
flow.set('{P}_ctx', ctx);
return msg;"""
REAFIRMA = """// PORTAO 4b (P3-A5) - REAFIRMACAO de comandos de seguranca aceitos durante uma quarentena. Uma escrita ANTIGA atrasada pode chegar ao PLC e desfazer
// o desligado. A cada 1 s: se o estado deixou de ser o desligado, reescreve o MESMO comando (idempotente) pela fila. Vigia ate 1,5 s depois do fim da quarentena.
const lista = flow.get('{P}_reafirma') || [];
if (!lista.length) return null;
const agora = Date.now();
const resto = lista.filter(r => agora <= r.ate + 1500);
if (resto.length !== lista.length) flow.set('{P}_reafirma', resto);
const live = flow.get('{P}_live'), ts = flow.get('{P}_live_ts') || 0;
if (!live || agora - ts > 2500) return null;
if (flow.get('{P}_fila_ocupado')) return null;
if (agora - (flow.get('{P}_reafirma_ult') || 0) < 1500) return null;
const algumaLigada = () => { for (let i = 1; i <= 64; i++) if (live['CbLigar' + i] === true) return true; return false; };
const desvio = r => (r.rota === 'LIGAR' ? live['CbLigar' + (r.payload || {}).indice] !== false : (algumaLigada() || live.LigarBanco !== false));
const r = resto.find(desvio);
if (!r) return null;
flow.set('{P}_reafirma_ult', agora);
node.warn('reafirmando comando de seguranca (' + r.rota + ') apos escrita tardia detectada');
return { _rota: r.rota, payload: r.payload || null, _reafirma: true, _qtd: 0 };"""


def patch_confere(func, P):
    assert FIM_ANTIGO.replace('{P}', P) in func, "linha 'fim' mudou"
    func = func.replace(FIM_ANTIGO, FIM_NOVO.replace('{P}', P), 1)
    # 500 de "nao conferiu" vira nc() fora do bloco SALVAR (Setup e decisao do PLC) e fora do fallback 'rota nao tratada'
    i_salvar = func.index("if (ctx.rota === 'SALVAR') {")
    i_banco = func.index("if (ctx.rota === 'BANCO') {")
    antes, salvar, depois = func[:i_salvar], func[i_salvar:i_banco], func[i_banco:]
    def troca(trecho):
        out = []
        for ln in trecho.split('\n'):
            if 'rota nao tratada' not in ln: ln = ln.replace('fim(500, { ok: false, erro:', 'nc({ ok: false, erro:')
            out.append(ln)
        return '\n'.join(out)
    # o trecho 'antes' contem a definicao de nc/fim e as rotas LIGAR/HABILITAR/SELECIONAR; so troca apos a definicao
    i_def = antes.index('const nc = ')
    i_fim_def = antes.index('};', i_def) + 2
    antes = antes[:i_fim_def] + troca(antes[i_fim_def:])
    return antes + salvar + troca(depois)


def no_fn(P, sufixo, nome, func, outputs, wires, x, y, z):
    return {'id': P + '_' + sufixo, 'type': 'function', 'z': z, 'name': nome, 'func': func.replace('{P}', P), 'outputs': outputs, 'timeout': 0,
            'noerr': 0, 'initialize': '', 'finalize': '', 'libs': [], 'x': x, 'y': y, 'wires': wires}


def gera(b, origem, destino):
    fonte, saida = os.path.join(PASTA, origem), os.path.join(PASTA, destino)
    assert os.path.exists(fonte), 'falta a versao de origem: ' + origem
    assert not os.path.exists(saida), 'ja existe (nao sobrescrevo): ' + destino
    fl = json.load(open(fonte, encoding='utf-8'))
    P = 'chv' + b
    por = {n['id']: n for n in fl}
    conf, monta, resp, fila = por[P + '_confere'], por[P + '_monta'], por[P + '_responde'], por[P + '_fila']
    s7r = por[P + '_s7_read']; z = conf['z']
    assert conf['wires'] == [[P + '_monta'], [P + '_responde']] and len(monta['wires']) == 4, 'ligacoes inesperadas em ' + origem
    conf['func'] = patch_confere(conf['func'], P); conf['outputs'] = 3
    antigo = MONTA_ANTIGO.replace('{P}', P)
    assert monta['func'].count(antigo) == 1, "fim da 'monta' mudou em " + origem
    monta['func'] = monta['func'].replace(antigo, MONTA_NOVO.replace('{P}', P)); monta['outputs'] = 5
    monta['wires'] = monta['wires'] + [[resp['id']]]
    atraso = {'id': P + '_conf_retry', 'type': 'delay', 'z': z, 'name': 'retenta confirmacao em 200 ms (janela P3-A4)', 'pauseType': 'delay', 'timeout': '200', 'timeoutUnits': 'milliseconds',
              'rate': '1', 'nbRateUnits': '1', 'rateUnits': 'second', 'randomFirst': '1', 'randomLast': '5', 'randomUnits': 'seconds', 'drop': False, 'allowrate': False,
              'outputs': 1, 'x': conf['x'] + 200, 'y': conf['y'] + 70, 'wires': [[P + '_retenta']]}
    ret = no_fn(P, 'retenta', 'retenta leitura (mesmo comando)', RETENTA, 1, [[s7r['id']]], conf['x'] + 440, conf['y'] + 70, z)
    conf['wires'] = [[P + '_monta'], [P + '_responde'], [atraso['id']]]
    inj = {'id': P + '_reafirma_inj', 'type': 'inject', 'z': z, 'name': 'a cada 1 s (reafirmacao P3-A5)', 'props': [{'p': 'payload'}], 'repeat': '1', 'crontab': '', 'once': True,
           'onceDelay': '6', 'topic': '', 'payload': '', 'payloadType': 'date', 'x': 140, 'y': 720, 'wires': [[P + '_reafirma']]}
    rea = no_fn(P, 'reafirma', 'reafirma comando de seguranca (P3-A5)', REAFIRMA, 1, [[fila['id']]], 420, 720, z)
    fl.extend([atraso, ret, inj, rea])
    for n in fl:
        if n.get('type') == 'tab':
            env = [e for e in (n.get('env') or []) if e.get('name') not in ('CONF_JANELA_MS', 'QUARENTENA_MS')]
            env += [{'name': 'CONF_JANELA_MS', 'value': '2000', 'type': 'num'}, {'name': 'QUARENTENA_MS', 'value': '10000', 'type': 'num'}]
            n['env'] = env
            n['info'] = (n.get('info') or '') + '\n\nFase 3 / Etapa 4b (gerado por gerar_fluxos_portao4b_v0.1.py): P3-A4 janela de confirmacao CONF_JANELA_MS (2000 ms; 504 incerto:true no fim) e P3-A5 quarentena por variavel QUARENTENA_MS (10000 ms; 503 AGUARDE_CONFIRMACAO; comandos de seguranca passam e sao reafirmados).'
    json.dump(fl, open(saida, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(destino.ljust(30), 'ok')


if __name__ == '__main__':
    for b, o, d in TROCAS: gera(b, o, d)
