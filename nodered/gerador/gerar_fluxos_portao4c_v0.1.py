#!/usr/bin/env python3
"""Fase 3, Etapa 4c - gera as VERSOES NOVAS: registro-ensaio v1.8 (P3-B1) e dev-logs v1.3 (P3-C1 e P3-C2). Nao sobrescreve nada.

P3-B1 (registro, rota preenchimento): o flag preenchValido era gravado PRIMEIRO (TRUE) e os dados depois; uma queda do PLC no meio deixava
  "valido" com dados incompletos. Agora sao DUAS FASES (mesmo padrao que a 'etapa' ja usa com o bit Salva):
  fase 1: grava preenchValido=FALSE + todos os dados e CONFERE (inclusive que o flag esta FALSE);
  fase 2: so entao grava preenchValido=TRUE e confere. 200 apenas depois da fase 2. Queda em qualquer ponto => flag FALSE.
  Limite: os dados em si nao sao atomicos; o contrato passa a ser "so ler os dados quando preenchValido=TRUE".
P3-C1 (dev-logs, POST): dedup por "maior n ja aceito" descartava em silencio o lote mais antigo que chegasse depois do mais novo. Agora cada sessao
  guarda a JANELA dos ultimos 500 n vistos: so a repeticao exata (ou n mais de 500 atras do maior) e descartada.
P3-C2 (dev-logs, GET): resposta ganha, de forma ADITIVA, cursorAdiante (desde > ultimo seq) e reiniciado (boot= enviado e diferente do atual).
Uso: python3 nodered/gerador/gerar_fluxos_portao4c_v0.1.py
"""
import json, os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PASTA = os.path.join(RAIZ, 'nodered', 'flows', 'bt2')


def unico(texto, trecho, nome):
    assert texto.count(trecho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(texto.count(trecho))
    return texto


def registro(fl):
    por = {n['id']: n for n in fl}
    prep, conf = por['reg_fn_prep'], por['reg_fn_conf']
    # --- monta: fase 2 e flag FALSE na fase 1
    f = prep['func']
    unico(f, "const rota = msg._selRota;", 'ancora rota')
    f = f.replace("const rota = msg._selRota;", """// PORTAO 4c (P3-B1) - FASE 2 do preenchimento: os dados ja foram gravados e conferidos; so agora o flag preenchValido sobe para TRUE.
if (msg._selFase === 'valida') {
  ctx = flow.get('sel_ctx');
  if (!ctx) return null;
  ctx.fase = 'valida';
  ctx.lerAgora = false;
  flow.set('sel_ctx', ctx);
  return [[{ variable: 'preenchValido', payload: true }], { payload: null, _selReqId: ctx.reqId }, null];
}

const rota = msg._selRota;""", 1)
    unico(f, "  writes.push({ variable: 'preenchValido', payload: true });", 'flag true')
    f = f.replace("  writes.push({ variable: 'preenchValido', payload: true });",
                  "  writes.push({ variable: 'preenchValido', payload: false });   // PORTAO 4c (P3-B1): fase 1 INVALIDA o snapshot e grava os dados; o TRUE so vem na fase 2", 1)
    prep['func'] = f
    # --- confere: fase 1 confere dados e invalidacao, fase 2 confere o flag
    c = conf['func']
    velho = "  if (read.preenchValido !== true) return fim(500, { ok: false, erro: 'leitura de volta nao conferiu: preenchValido' });"
    unico(c, velho, 'confere flag')
    c = c.replace(velho, """  // PORTAO 4c (P3-B1): fase 2 (flag TRUE) e fase 1 (dados + invalidacao)
  if (ctx.fase === 'valida') return read.preenchValido === true ? fim(200, { ok: true }) : fim(500, { ok: false, erro: 'leitura de volta nao conferiu: preenchValido' });
  if (read.preenchValido !== false) return fim(500, { ok: false, erro: 'a invalidacao do snapshot anterior nao foi confirmada (preenchValido)' });""", 1)
    fim200 = "  return fim(200, { ok: true });\n}\n\nif (ctx.rota === 'POST_LIMPAR')"
    unico(c, fim200, 'fim do bloco POST_PREEN')
    c = c.replace(fim200, "  return [{ _selFase: 'valida', _selReqId: ctx.reqId, payload: null }, null];   // dados conferem -> sobe o flag (fase 2) e confere de novo\n}\n\nif (ctx.rota === 'POST_LIMPAR')", 1)
    conf['func'] = c


def devlogs(fl):
    por = {n['id']: n for n in fl}
    post, get = por['devlog_fn_post'], por['devlog_fn_get']
    f = post['func']
    unico(f, "  if ((ult[e.sessao] || 0) >= e.n) { dup++; continue; }\n  ult[e.sessao] = e.n;\n", 'dedup')
    f = f.replace("  if ((ult[e.sessao] || 0) >= e.n) { dup++; continue; }\n  ult[e.sessao] = e.n;\n", """  // PORTAO 4c (P3-C1): dedup por CONJUNTO. So e duplicado o n ja visto ou mais de JAN atras do maior; lote mais antigo que chega depois do mais novo e ACEITO.
  let vs = vis[e.sessao];
  if (!vs) vs = vis[e.sessao] = { max: ult[e.sessao] || 0, n: [] };
  if (e.n <= vs.max - JAN || vs.n.includes(e.n)) { dup++; continue; }
  vs.n.push(e.n); if (e.n > vs.max) vs.max = e.n;
  ult[e.sessao] = vs.max;
""", 1)
    unico(f, "const ult = flow.get('devlog_ult') || {};", 'ult')
    f = f.replace("const ult = flow.get('devlog_ult') || {};", "const ult = flow.get('devlog_ult') || {};\nconst vis = flow.get('devlog_vistos') || {};   // PORTAO 4c: sessao -> {max, n:[ultimos JAN n vistos]}\nconst JAN = 500;", 1)
    unico(f, "const ks = Object.keys(ult);\nif (ks.length > 50) delete ult[ks[0]];", 'sessoes')
    f = f.replace("const ks = Object.keys(ult);\nif (ks.length > 50) delete ult[ks[0]];",
                  "for (const s of Object.keys(vis)) vis[s].n = vis[s].n.filter(x => x > vis[s].max - JAN);\nconst ks = Object.keys(ult);\nif (ks.length > 50) { delete ult[ks[0]]; delete vis[ks[0]]; }", 1)
    unico(f, "flow.set('devlog_ult', ult);", 'set ult')
    f = f.replace("flow.set('devlog_ult', ult);", "flow.set('devlog_ult', ult); flow.set('devlog_vistos', vis);", 1)
    post['func'] = f
    g = get['func']
    unico(g, "let out, truncado = false, perdidos = 0;", 'get out')
    g = g.replace("let out, truncado = false, perdidos = 0;", "// PORTAO 4c (P3-C2): sinais ADITIVOS (cliente antigo ignora). cursorAdiante: o cursor 'desde' passou do ultimo seq (ex.: Node-RED reiniciou). reiniciado: o cliente mandou boot= de outra execucao.\nconst cursorAdiante = !isNaN(desde) && desde > seq;\nconst reiniciado = q.boot !== undefined && String(q.boot) !== boot;\nlet out, truncado = false, perdidos = 0;", 1)
    unico(g, "boot: boot, total: ev.length", 'payload get')
    g = g.replace("boot: boot, total: ev.length", "boot: boot, cursorAdiante: cursorAdiante, reiniciado: reiniciado, total: ev.length", 1)
    get['func'] = g


def gera(origem, destino, fn, nota):
    fonte, saida = os.path.join(PASTA, origem), os.path.join(PASTA, destino)
    assert os.path.exists(fonte), 'falta a versao de origem: ' + origem
    assert not os.path.exists(saida), 'ja existe (nao sobrescrevo): ' + destino
    fl = json.load(open(fonte, encoding='utf-8'))
    fn(fl)
    for n in fl:
        if n.get('type') == 'tab': n['info'] = (n.get('info') or '') + '\n\nFase 3 / Etapa 4c (gerado por gerar_fluxos_portao4c_v0.1.py): ' + nota
    json.dump(fl, open(saida, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(destino.ljust(36), 'ok')


if __name__ == '__main__':
    gera('registro-ensaio-db2100-api-v1.7.json', 'registro-ensaio-db2100-api-v1.8.json', registro, 'P3-B1 preenchimento em duas fases (dados com preenchValido=FALSE, confere, depois TRUE e confere).')
    gera('dev-logs-api-v1.2.json', 'dev-logs-api-v1.3.json', devlogs, 'P3-C1 dedup por conjunto dos ultimos 500 n por sessao; P3-C2 GET devolve cursorAdiante e reiniciado.')
