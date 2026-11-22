#!/usr/bin/env python3
"""Fase 3, Etapa 4a - gera as VERSOES NOVAS dos 4 fluxos de chaves corrigindo P3-A1, P3-A2 e P3-A3 (condicoes de corrida da fila).
Causa: a validacao dos comandos acontece ANTES da fila e o "Desligar banco"/ZERAR passam na frente (unshift). Correcao:
 1) EXPURGO (na funcao 'fila', atomica): ao entrar um Desligar banco (ou ZERAR), saem da espera os comandos JA ACEITOS que dependem do
    banco ligado (BANCO ligar:true, LIGAR ligar:true, SELECIONAR indice>0, SALVAR) e cada um responde 409 CANCELADO_POR_DESLIGAR por um
    responder proprio que NAO libera a fila nem mexe no ctx. A prioridade de seguranca do desligar e preservada.
 2) REVALIDA NA SAIDA DA FILA: novo no entre fila/libera fila e 'monta escritas' repete as regras de entrada com o estado ATUAL
    (409 ESTADO_MUDOU; 503 LEITURA_VELHA se o cache do PLC tem mais de 2,5 s).
Nao sobrescreve nada; cada saida tem nome novo. Uso: python3 nodered/gerador/gerar_fluxos_portao4a_v0.1.py
"""
import json, os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PASTA = os.path.join(RAIZ, 'nodered', 'flows', 'bt2')
TROCAS = [  # (banco, origem, destino)
    ('56', 'chaves-56-api-v3.2.json', 'chaves-56-api-v3.3.json'),
    ('400', 'chaves-400-api-v3.2.json', 'chaves-400-api-v3.3.json'),
    ('550', 'chaves-550-api-v1.3.json', 'chaves-550-api-v1.4.json'),
    ('595', 'chaves-595-api-v1.3.json', 'chaves-595-api-v1.4.json'),
]
# trecho da funcao 'fila' que enfileira (igual nos 4 bancos, exceto o prefixo)
FILA_ANTIGO = """    if (prio) fila.unshift(msg); else fila.push(msg);
    flow.set('{P}_fila_espera', fila);
    return null;
  }
}
flow.set('{P}_fila_ocupado', { reqId, ts: Date.now() });
return msg;"""
FILA_NOVO = """    // PORTAO 4a (P3-A1): o desligar com prioridade CANCELA os comandos ja aceitos que dependem do banco ligado (senao um "ligar" mais antigo
    // executaria DEPOIS dele e o banco terminaria ligado). So sai o que estava na espera; o que chegar depois do desligar nao e afetado.
    let cancelados = [];
    if (prio) {
      const dep = m => { const b = m.payload || {}; return (m._rota === 'BANCO' && b.ligar === true) || (m._rota === 'LIGAR' && b.ligar === true) || (m._rota === 'SELECIONAR' && b.indice > 0) || m._rota === 'SALVAR'; };
      cancelados = fila.filter(dep);
      const resto = fila.filter(m => !dep(m)); fila.length = 0; resto.forEach(m => fila.push(m));
    }
    if (prio) fila.unshift(msg); else fila.push(msg);
    flow.set('{P}_fila_espera', fila);
    return [null, cancelados.length ? cancelados : null];
  }
}
flow.set('{P}_fila_ocupado', { reqId, ts: Date.now() });
return [msg, null];"""
REVALIDA = """// PORTAO 4a (P3-A2/A3) - REVALIDA NA SAIDA DA FILA. As rotas validam contra o cache ANTES de entrar na fila; o comando so executa depois
// dos que estavam na frente. Aqui repetem-se as regras de entrada com o estado ATUAL do PLC. Comando que nao depende do estado passa direto.
const rota = msg._rota, b = msg.payload || {};
const depende = (rota === 'BANCO' && b.ligar === true) || (rota === 'LIGAR' && b.ligar === true) || (rota === 'SELECIONAR' && b.indice > 0) || rota === 'SALVAR';
if (!depende) return [msg, null];
const falha = (code, codigo, txt) => {
  flow.set('{P}_ctx', { rota, reqId: msg._reqId, fase: 'revalida', lerAgora: false, esp: { revalida: codigo } });   // para o log de comunicacao do 'responde'
  msg.statusCode = code; msg.payload = { ok: false, codigo, erro: txt };
  return [null, msg];
};
const live = flow.get('{P}_live'), ts = flow.get('{P}_live_ts') || 0;
if (!live || Date.now() - ts > 2500) return falha(503, 'LEITURA_VELHA', 'sem leitura recente do PLC ao sair da fila - tente de novo');
if (rota === 'BANCO') {
  if (live.ComEt200Ok !== true) return falha(409, 'ESTADO_MUDOU', 'o estado mudou enquanto o comando esperava na fila: sem comunicacao 1515-ET200');
  if (live.SeletoraAuto !== true) return falha(409, 'ESTADO_MUDOU', 'o estado mudou enquanto o comando esperava na fila: seletora do banco em Manual');
} else if (rota === 'LIGAR') {
  if (live.LigarBanco !== true) return falha(409, 'ESTADO_MUDOU', 'o estado mudou enquanto o comando esperava na fila: banco desligado');
  if (live['Habilitada' + b.indice] !== true) return falha(409, 'ESTADO_MUDOU', 'o estado mudou enquanto o comando esperava na fila: chave ' + b.indice + ' desabilitada');
  if (live.ChaveSel) return falha(409, 'ESTADO_MUDOU', 'o estado mudou enquanto o comando esperava na fila: Setup em andamento (chave ' + live.ChaveSel + ')');
} else if (rota === 'SELECIONAR') {
  if (live.LigarBanco !== true) return falha(409, 'ESTADO_MUDOU', 'o estado mudou enquanto o comando esperava na fila: banco desligado');
  if (live['Habilitada' + b.indice] !== true) return falha(409, 'ESTADO_MUDOU', 'o estado mudou enquanto o comando esperava na fila: chave ' + b.indice + ' desabilitada');
} else if (rota === 'SALVAR') {
  if (live.ChaveSel !== msg._chaveSel) return falha(409, 'ESTADO_MUDOU', 'o estado mudou enquanto o comando esperava na fila: a chave selecionada mudou');
}
return [msg, null];"""
CANCELA = """// PORTAO 4a (P3-A1) - responde 409 aos comandos CANCELADOS pelo expurgo da fila (um Desligar banco foi aceito depois e tem prioridade).
// NAO usa 'responde + libera fila': aquele libera a fila e zera o ctx, e aqui outro comando pode estar em voo.
const reqId = msg._reqId;
const cache = flow.get('{P}_req_cache') || {};
const orig = cache[reqId];
if (!orig) return null;
delete cache[reqId]; flow.set('{P}_req_cache', cache);
try {
  const logs = flow.get('{P}_logs') || [];
  logs.push({ t: new Date().toISOString(), rota: msg._rota || '?', dado: JSON.stringify(msg.payload || {}), status: 409, ok: false, ms: Date.now() - parseInt(String(reqId).split('_')[0], 10), erro: 'cancelado: Desligar banco aceito depois' });
  if (logs.length > 1000) logs.shift();
  flow.set('{P}_logs', logs);
} catch (e) { node.warn('log: ' + e.message); }
msg.req = orig.req; msg.res = orig.res;
msg.statusCode = 409;
msg.payload = { ok: false, codigo: 'CANCELADO_POR_DESLIGAR', erro: 'comando cancelado: um "Desligar banco" foi aceito depois e tem prioridade (nada foi gravado no PLC)' };
msg.headers = { 'Content-Type': 'application/json' };
return msg;"""


def no_fn(p, id_, nome, func, outputs, wires, x, y, z):
    return {'id': p + id_, 'type': 'function', 'z': z, 'name': nome, 'func': func.replace('{P}', p.rstrip('_')), 'outputs': outputs, 'timeout': 0,
            'noerr': 0, 'initialize': '', 'finalize': '', 'libs': [], 'x': x, 'y': y, 'wires': wires}


def gera(b, origem, destino):
    fonte, saida = os.path.join(PASTA, origem), os.path.join(PASTA, destino)
    assert os.path.exists(fonte), 'falta a versao de origem: ' + origem
    assert not os.path.exists(saida), 'ja existe (nao sobrescrevo): ' + destino
    fl = json.load(open(fonte, encoding='utf-8'))
    p = 'chv' + b + '_'; P = 'chv' + b
    por = {n['id']: n for n in fl}
    fila, libera, resp = por[p + 'fila'], por[p + 'libera_fila'], por[p + 'responde']
    out = [n for n in fl if n['type'] == 'http response'][0]
    assert fila['wires'] == [[p + 'monta', p + 'wd']] and libera['wires'] == [[p + 'monta', p + 'wd']], 'ligacoes inesperadas em ' + origem
    antigo = FILA_ANTIGO.replace('{P}', P)
    assert antigo in fila['func'], "trecho da 'fila' mudou em " + origem + ': nao patcho'
    fila['func'] = fila['func'].replace(antigo, FILA_NOVO.replace('{P}', P)); fila['outputs'] = 2
    z = fila['z']
    rev = no_fn(p, 'revalida', 'revalida na saida da fila (P3-A2/A3)', REVALIDA, 2, [[p + 'monta', p + 'wd'], [resp['id']]], fila['x'] + 160, fila['y'] + 40, z)
    can = no_fn(p, 'cancela_resp', 'responde cancelados (P3-A1, sem mexer na fila)', CANCELA, 1, [[out['id']]], fila['x'] + 160, fila['y'] - 60, z)
    fila['wires'] = [[rev['id']], [can['id']]]
    libera['wires'] = [[rev['id']]]
    fl.extend([rev, can])
    for n in fl:
        if n.get('type') == 'tab':
            n['info'] = (n.get('info') or '') + '\n\nFase 3 / Etapa 4a (gerado por gerar_fluxos_portao4a_v0.1.py): corrige P3-A1/A2/A3 - expurgo dos comandos "ligar" pendentes quando entra um Desligar banco (409 CANCELADO_POR_DESLIGAR) e revalidacao na saida da fila (409 ESTADO_MUDOU / 503 LEITURA_VELHA). A prioridade de seguranca do desligar continua.'
    json.dump(fl, open(saida, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(destino.ljust(30), 'ok')


if __name__ == '__main__':
    for b, o, d in TROCAS: gera(b, o, d)
