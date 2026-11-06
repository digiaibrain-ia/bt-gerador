#!/usr/bin/env python3
"""Fase 4, Portao A (A2) - gera as VERSOES NOVAS chaves-56-api-v3.5 e chaves-400-api-v3.5 a partir das v3.4. Nao sobrescreve nada.

O que muda (ver docs/bt2/fase4/PLANO_FASE4_v0.2.md e A0_A1_COMUNICACAO_E_BLOCOS_v0.1.md):
  A2-1  Le a struct nova sbRet do DB do banco (DBX464.0..470.0): HabResp1..16, FalhaRet1..16, ContColado1..16, RespEcoOk.
        O GET (cache e confere) devolve, de forma ADITIVA: habResp[], falhaRetorno[], contatorColado[], respEcoOk.
  A2-2  'ligar' recusa (409): contator colado (retorno ativo com falha travada), sem eco do PLC do banco, habilitacao nao confirmada.
        Falha de retorno travada NAO recusa (o novo comando e justamente o rearme). Mesmas regras na saida da fila (ESTADO_MUDOU).
  A2-3  'habilitar' so responde 200 depois que o PLC do banco CONFIRMA (habResp) quando ha comunicacao; sem comunicacao responde 200 com
        habConfirmadaBanco:false (o 'ligar' continua exigindo a confirmacao). Sem confirmacao na janela: 504 incerto (padrao P3-A4).
  F4-1  POST /tensao recusa com 503 ANTES de escrever se a leitura do DB do banco OU a do DB por tensao tiver mais de 2,5 s (antes 5 s).
  F4-2  /tensao: leitura de volta que nao confere vira 504 'incerto' (nao 500): nao sabemos se o PLC aplicara depois.
  P3-E1 Todo comando que NAO e de seguranca e recusado NA ENTRADA (503 LEITURA_VELHA) se a leitura do banco tem mais de 2,5 s; o que ja esta na fila
        tambem e recusado na saida. Comandos de seguranca (desligar chave, desligar banco, desselecionar, vigia) continuam passando sempre.
  F2-1  NAO corrigivel no fluxo: o 'http in' do Node-RED responde 500 fixo a corpo JSON invalido (errorHandler do proprio no). Fica como todo.
Uso: python3 nodered/gerador/gerar_fluxos_fase4a_v0.1.py
"""
import json, os, copy
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PASTA = os.path.join(RAIZ, 'nodered', 'flows', 'bt2')


def uma(texto, trecho, nome):
    assert texto.count(trecho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(texto.count(trecho))


def troca(texto, velho, novo, nome):
    uma(texto, velho, nome)
    return texto.replace(velho, novo, 1)


def por_nome(fl, nome):
    r = [n for n in fl if n.get('name') == nome]
    assert len(r) == 1, 'esperava 1 no chamado ' + nome + ', achei ' + str(len(r))
    return r[0]


def fase4a(fl, banco):
    p = 'chv' + banco
    ep = [n for n in fl if n['type'] == 's7 endpoint' and n['id'] == p + '_ep'][0]
    db = ep['vartable'][0]['addr'].split(',')[0]          # 'DB3000' / 'DB3100'
    # ---------- A2-1: variaveis novas no endpoint
    nomes = {v['name'] for v in ep['vartable']}
    novas = []
    for pref, base in (('HabResp', 464), ('FalhaRet', 466), ('ContColado', 468)):
        for i in range(1, 17):
            novas.append({'name': pref + str(i), 'addr': '%s,X%d.%d' % (db, base + (i - 1) // 8, (i - 1) % 8)})
    novas.append({'name': 'RespEcoOk', 'addr': db + ',X470.0'})
    for v in novas:
        assert v['name'] not in nomes, 'variavel ja existe: ' + v['name']
    ep['vartable'].extend(novas)
    # ---------- A2-1: GET aditivo (cache da leitura ciclica e GET da confere)
    campos = ("cbLigar: arr16('CbLigar'),\n"
              "  habResp: arr16('HabResp'),                  // FASE 4 (A2): habilitacao confirmada pelo PLC do banco\n"
              "  falhaRetorno: arr16('FalhaRet'),            // FASE 4 (A2): sem retorno por T, TRAVADA no PLC do banco ate novo comando (CHV-006)\n"
              "  contatorColado: arr16('ContColado'),        // FASE 4 (A2): retorno ativo sem comando, TRAVADO (CHV-007)\n"
              "  respEcoOk: read.RespEcoOk === true,         // FASE 4 (A2): o PLC do banco devolveu o eco do ultimo pacote\n")
    g = por_nome(fl, 'GET chaves (cache da leitura ciclica)')
    g['func'] = troca(g['func'], "cbLigar: arr16('CbLigar'),\n", campos.replace('\n  ', '\n  ') , 'cbLigar no GET (cache)')
    c = por_nome(fl, 'confere leitura x escrita')
    c['func'] = troca(c['func'], "    cbLigar: arr16('CbLigar'),\n", campos.replace('cbLigar:', '    cbLigar:', 1).replace('\n  ', '\n    '), 'cbLigar no GET (confere)')
    # ---------- A2-2: ligar (entrada)
    guarda_ligar = """  // FASE 4 (A2): regras do PLC do banco. Falha de retorno TRAVADA nao recusa: o novo comando e o rearme. Contator colado (retorno ativo) recusa.
  { const _i = b.indice;
    if (live['Ligada' + _i] === true && (live['FalhaRet' + _i] === true || live['ContColado' + _i] === true)) { msg.statusCode = 409; msg.payload = { ok: false, codigo: 'CONTATOR_COLADO', erro: 'chave ' + _i + ': retorno (SB) ativo sem comando - contator colado? verifique no campo antes de ligar' }; return [null, msg]; }
    if (live.ComEt200Ok === true && live.RespEcoOk !== true) { msg.statusCode = 409; msg.payload = { ok: false, codigo: 'SEM_ECO', erro: 'o PLC do banco nao confirmou o ultimo pacote (eco) - aguarde e tente de novo' }; return [null, msg]; }
    if (live.ComEt200Ok === true && live['HabResp' + _i] !== true) { msg.statusCode = 409; msg.payload = { ok: false, codigo: 'HAB_NAO_CONFIRMADA', erro: 'chave ' + _i + ': o PLC do banco ainda nao confirmou a habilitacao - aguarde e tente de novo' }; return [null, msg]; } }
"""
    v = por_nome(fl, 'valida ligar')
    v['func'] = troca(v['func'], "  if (live.ChaveSel) return falha('Setup em andamento (chave '", guarda_ligar + "  if (live.ChaveSel) return falha('Setup em andamento (chave '", 'valida ligar')
    # ---------- A2-2: ligar (saida da fila)
    r = por_nome(fl, 'revalida na saida da fila (P3-A2/A3)')
    ancora = "'o estado mudou enquanto o comando esperava na fila: Setup em andamento (chave ' + live.ChaveSel + ')');\n} else if (rota === 'SELECIONAR') {"
    novo = ("'o estado mudou enquanto o comando esperava na fila: Setup em andamento (chave ' + live.ChaveSel + ')');\n"
            "  // FASE 4 (A2): mesmas regras do PLC do banco da entrada\n"
            "  if (live['Ligada' + b.indice] === true && (live['FalhaRet' + b.indice] === true || live['ContColado' + b.indice] === true)) return falha(409, 'CONTATOR_COLADO', 'o estado mudou enquanto o comando esperava na fila: chave ' + b.indice + ' com retorno ativo sem comando (contator colado?)');\n"
            "  if (live.ComEt200Ok === true && (live.RespEcoOk !== true || live['HabResp' + b.indice] !== true)) return falha(409, 'ESTADO_MUDOU', 'o estado mudou enquanto o comando esperava na fila: o PLC do banco nao confirma a chave ' + b.indice);\n"
            "} else if (rota === 'SELECIONAR') {")
    r['func'] = troca(r['func'], ancora, novo, 'revalida LIGAR')
    # P3-E1: na saida da fila, comando que nao e de seguranca com leitura velha e recusado
    r['func'] = troca(r['func'], "if (!depende) return [msg, null];",
        "// FASE 4 (P3-E1): comando que NAO e de seguranca nao executa com a leitura velha (o cliente ja desistiu aos 10 s). Seguranca passa sempre.\n"
        "const seguranca = rota === 'ZERAR' || (rota === 'BANCO' && b.ligar === false) || (rota === 'LIGAR' && b.ligar === false) || (rota === 'SELECIONAR' && !(b.indice > 0));\n"
        "if (!seguranca) { const _t = flow.get('" + p + "_live_ts') || 0; if (!_t || Date.now() - _t > 2500) { flow.set('" + p + "_ctx', { rota, reqId: msg._reqId, fase: 'revalida', lerAgora: false, esp: { revalida: 'LEITURA_VELHA' } }); msg.statusCode = 503; msg.payload = { ok: false, codigo: 'LEITURA_VELHA', erro: 'sem leitura recente do PLC ao sair da fila - comando NAO executado' }; return [null, msg]; } }\n"
        "if (!depende) return [msg, null];", 'revalida depende')
    # ---------- A2-3: habilitar com confirmacao do PLC do banco
    cf = por_nome(fl, 'confere leitura x escrita')
    velho = ("if (ctx.rota === 'HABILITAR') {\n"
             "  const ok = read['Habilitada' + ctx.esp.indice] === ctx.esp.v;\n"
             "  return ok ? fim(200, { ok: true }) : nc({ ok: false, erro: 'leitura de volta nao conferiu: habilitada[' + ctx.esp.indice + ']' });\n}")
    novo = ("if (ctx.rota === 'HABILITAR') {\n"
            "  const ok = read['Habilitada' + ctx.esp.indice] === ctx.esp.v;\n"
            "  if (!ok) return nc({ ok: false, erro: 'leitura de volta nao conferiu: habilitada[' + ctx.esp.indice + ']' });\n"
            "  // FASE 4 (A2): pedido/resposta. Com comunicacao, so confirma quando o PLC do banco devolve habResp igual ao pedido com eco fresco.\n"
            "  if (read.ComEt200Ok === true) {\n"
            "    if (read['HabResp' + ctx.esp.indice] === ctx.esp.v && read.RespEcoOk === true) return fim(200, { ok: true, habConfirmadaBanco: true });\n"
            "    return nc({ ok: false, erro: 'o PLC do banco nao confirmou a habilitacao (habResp[' + ctx.esp.indice + '])' });\n"
            "  }\n"
            "  return fim(200, { ok: true, habConfirmadaBanco: false });   // sem comunicacao com o banco: gravado no 1515; o 'ligar' exige a confirmacao\n}")
    cf['func'] = troca(cf['func'], velho, novo, 'confere HABILITAR')
    # ---------- P3-E1: frescor na entrada (um no antes de cada valida de comando que nao e de seguranca)
    guardas = {n['id']: n for n in fl}
    alvos = ['valida habilitar', 'valida selecionar', 'valida salvar', 'valida usarKwReal', 'valida limpar', 'valida ligar', 'valida banco (ligar/desligar)']
    for nome in alvos:
        val = por_nome(fl, nome)
        assert len(val['wires']) == 2
        novo_id = val['id'].replace('_val_', '_fresco_', 1)
        assert novo_id != val['id'] and novo_id not in guardas
        rota = nome
        fr = {
            'id': novo_id, 'type': 'function', 'z': val['z'], 'name': 'frescor da leitura (P3-E1) - ' + nome.replace('valida ', ''), 'outputs': 2, 'noerr': 0, 'initialize': '', 'finalize': '',
            'libs': [], 'x': val.get('x', 0) - 130, 'y': val.get('y', 0), 'wires': [[val['id']], [p + '_out']],
            'func': ("// FASE 4 (P3-E1): comando que NAO e de seguranca e recusado NA ENTRADA com leitura velha (> 2,5 s), em vez de esperar o vigia de 8 s na fila.\n"
                     "// Desligar chave, desligar banco e desselecionar passam sempre (seguranca).\n"
                     "const b = msg.payload || {};\n"
                     "const rota = " + json.dumps(nome) + ";\n"
                     "const seguranca = (rota === 'valida ligar' && b.ligar === false) || (rota === 'valida banco (ligar/desligar)' && b.ligar === false) || (rota === 'valida selecionar' && !(b.indice > 0));\n"
                     "if (seguranca) return [msg, null];\n"
                     "const ts = flow.get('" + p + "_live_ts') || 0;\n"
                     "if (ts && Date.now() - ts <= 2500) return [msg, null];\n"
                     "if (!ts) return [msg, null];   // sem 1a leitura: a propria valida ja responde 'aguardando a 1a leitura'\n"
                     "msg.statusCode = 503; msg.headers = { 'Content-Type': 'application/json' };\n"
                     "msg.payload = { ok: false, codigo: 'LEITURA_VELHA', erro: 'sem leitura recente do PLC (ha ' + Math.round((Date.now() - ts) / 1000) + ' s) - comando NAO enviado', idadeMs: Date.now() - ts };\n"
                     "return [null, msg];"),
        }
        # quem apontava para a valida passa a apontar para o frescor
        achou = 0
        for n in fl:
            if n is val or n is fr or 'wires' not in n or not isinstance(n['wires'], list):
                continue
            for saida in n['wires']:
                if isinstance(saida, list):
                    for k, alvo in enumerate(saida):
                        if alvo == val['id']:
                            saida[k] = novo_id; achou += 1
        assert achou == 1, 'a valida ' + nome + ' deveria ter exatamente 1 entrada; achei ' + str(achou)
        fl.append(fr)
    # ---------- F4-1 / F4-2: tensao
    vt = por_nome(fl, 'valida tensao')
    vt['func'] = troca(vt['func'], "if (!ts2 || Date.now() - ts2 > 5000) return falha(",
        "const tsV = flow.get('" + p + "_live_ts') || 0;   // FASE 4 (F4-1): a leitura do DB do banco tambem tem que estar fresca (mesma regra do GET)\n"
        "if (!tsV || Date.now() - tsV > 2500) return falha('PLC sem leitura recente (> 2,5 s) - chaveamento NAO enviado', 503);\n"
        "if (!ts2 || Date.now() - ts2 > 2500) return falha(", 'valida tensao')
    ct = por_nome(fl, 'confere tensao')
    ct['func'] = troca(ct['func'], "msg.statusCode = ok ? 200 : 500;\n",
        "msg.statusCode = ok ? 200 : 504;   // FASE 4 (F4-2): leitura que nao confere = 'incerto' (o PLC pode aplicar depois), nao erro 500\n", 'confere tensao status')
    ct['func'] = troca(ct['func'], "{ ok: false, erro: 'leitura de volta nao conferiu: tensaoSel (lido '",
        "{ ok: false, incerto: true, erro: 'comando enviado, sem confirmacao do PLC: confira o estado antes de repetir. Leitura de volta nao conferiu: tensaoSel (lido '", 'confere tensao corpo')


def gera(banco):
    fonte = os.path.join(PASTA, 'chaves-%s-api-v3.4.json' % banco)
    saida = os.path.join(PASTA, 'chaves-%s-api-v3.5.json' % banco)
    assert os.path.exists(fonte), 'falta a origem v3.4'
    assert not os.path.exists(saida), 'ja existe (nao sobrescrevo): ' + os.path.basename(saida)
    fl = json.load(open(fonte, encoding='utf-8'))
    fase4a(fl, banco)
    for n in fl:
        if n.get('type') == 'tab':
            n['info'] = (n.get('info') or '') + '\n\nFase 4 / Portao A (gerado por gerar_fluxos_fase4a_v0.1.py): le sbRet (habResp/falhaRetorno/contatorColado/respEcoOk); ligar com regras do PLC do banco; habilitar confirmado pelo banco; F4-1, F4-2, P3-E1. EXIGE o PLC com os DBs v0.3 (sbRet em X464.0): com o DB antigo a leitura falha.'
    json.dump(fl, open(saida, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(os.path.basename(saida).ljust(34), 'ok')


if __name__ == '__main__':
    for b in ('56', '400'):
        gera(b)
