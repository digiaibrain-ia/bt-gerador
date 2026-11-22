#!/usr/bin/env python3
"""v0.3 (14/11/2026): as NOTAS (comment) que ja existiam no fluxo original vao para um grupo "Notas do fluxo" empilhado embaixo, alinhado, sem cobrir faixas nem a nota de cabecalho (na v0.2 ficavam no lugar antigo e se sobrepunham aos grupos: visto pelo Reginaldo no registro-ensaio v1.9).
v0.2 (14/11/2026): nota de cabecalho sempre com no maximo 80 caracteres (v0.1 podia passar). Base v0.1 abaixo.
13/11/2026 - ORGANIZADOR DE FLUXO NODE-RED v0.1 (padrao de fluxos do BT2). Le um fluxo .json e gera uma VERSAO NOVA com: (1) aba com o nome padrao "<Nome> vX.Y" (versao = a do arquivo),
(2) info em todo no (extraido do comentario que ja existe no codigo; onde nao ha: "ASSUMIDO - a confirmar"), (3) nota de cabecalho curta, (4) layout em faixas (uma por rota de entrada) + area compartilhada,
(5) grupos com titulo, (6) nos "link" no lugar dos fios longos entre faixa e area compartilhada. NAO muda codigo, propriedades nem comportamento: so documentacao, posicao, grupos e fios via link.
A equivalencia e PROVADA por nodered/gerador/verifica_equivalencia_fluxo_v0.1.py (mesmos nos/propriedades e mesmas ligacoes, contando o caminho pelos links).
Uso: python3 nodered/gerador/organiza_fluxo_v0.3.py <entrada.json> <saida.json> <versao> "<o que mudou>"   (nao sobrescreve)"""
import json, os, re, sys, datetime
LARG_NOTA = 80
def largura(n): return max(110, 7 * len(n.get('name') or n.get('type', '')) + 55)
def alvos(n): return [[w for w in o] for o in n.get('wires', [])]
def info_no(n, por_id, entradas):
    t = n['type']; partes = []
    if t == 'function':
        linhas, em_bloco = [], False
        for l in (n.get('func') or '').split('\n'):
            s = l.strip()
            if em_bloco:
                if '*/' in s: em_bloco = False; s = s.split('*/')[0].strip()
                if s: linhas.append(s.lstrip('* '))
                continue
            if s.startswith('/*'):
                em_bloco = '*/' not in s; s = s[2:].split('*/')[0].strip()
                if s: linhas.append(s.lstrip('* '))
                continue
            if s.startswith('//'): linhas.append(s.lstrip('/ ').rstrip()); continue
            if not s and not linhas: continue
            break
        linhas = [x for x in linhas if x and not set(x) <= set('=-*# ')]
        partes.append('**O que faz (do comentário do código):**\n' + '\n'.join('- ' + x for x in linhas) if linhas else 'ASSUMIDO — a confirmar: este nó não tinha comentário no código; descrever na revisão.')
    elif t == 'http in': partes.append('Rota HTTP **%s %s**. Entrada da API; o contrato com o HTML está em docs/bt2/contratos/.' % (n.get('method', '').upper(), n.get('url')))
    elif t == 'http response': partes.append('Devolve a resposta HTTP ao chamador (HTML/Node-RED). Recebe o status e o corpo montados pelos nós anteriores.')
    elif t == 's7 in': partes.append('Lê do PLC (nó S7, endpoint **%s**, modo **%s**). Falha de leitura = a leitura fica velha e o watchdog/guardas recusam comandos.' % (n.get('endpoint'), n.get('mode')))
    elif t == 's7 out': partes.append('Grava no PLC (nó S7, endpoint **%s**). Só recebe mensagens já validadas pela fila.' % n.get('endpoint'))
    elif t == 'delay': partes.append('Espera **%s %s** antes de seguir (dar tempo ao ciclo do S7 antes de reler).' % (n.get('timeout'), n.get('timeoutUnits')))
    elif t == 'trigger': partes.append('Temporizador (watchdog): dispara **%s** após **%s %s** sem nova mensagem; usado para detectar PLC fora/timeout.' % (n.get('op2'), n.get('duration'), n.get('units')))
    elif t == 'inject': partes.append('Dispara sozinho a cada **%s s** (repetição)%s.' % (n.get('repeat'), ', e uma vez ao iniciar' if n.get('once') else ''))
    elif t == 'catch': partes.append('Captura erros não tratados dos nós da aba e manda para a resposta de erro (estado seguro: responde 500).')
    elif t == 'comment': return n.get('info', '')
    else: partes.append('ASSUMIDO — a confirmar: sem descrição para o tipo %s.' % t)
    saidas = ['saída %d → %s' % (i + 1, ', '.join(por_id[w].get('name') or por_id[w]['type'] for w in o)) for i, o in enumerate(alvos(n)) if o]
    ent = entradas.get(n['id'], [])
    if ent: partes.append('**Recebe de:** ' + ', '.join(sorted({por_id[e].get('name') or por_id[e]['type'] for e in ent})))
    if saidas: partes.append('**Envia para:** ' + '; '.join(saidas))
    base = (n.get('info') or '').strip()
    return ('\n\n'.join(partes) + ('\n\n' + base if base else ''))
def organiza(flow, versao, mudou, hoje):
    por_id = {n['id']: n for n in flow}; tab = next(n for n in flow if n['type'] == 'tab'); z = tab['id']
    nos = [n for n in flow if n.get('z') == z and n['type'] != 'group']; ids = {n['id'] for n in nos}
    entradas = {}
    for n in nos:
        for o in alvos(n):
            for w in o: entradas.setdefault(w, []).append(n['id'])
    # --- faixas: o que e alcancado por UMA so entrada (sem seguir arestas de retorno) fica na faixa; o resto e area compartilhada
    fontes = [n for n in nos if n['id'] not in entradas and n['type'] != 'comment']
    ordem_f = sorted(fontes, key=lambda n: (n['y'], n['x']))
    alc = {n['id']: set() for n in nos}
    for f in ordem_f:
        pilha, vis = [f['id']], set()
        while pilha:
            u = pilha.pop()
            if u in vis: continue
            vis.add(u); alc[u].add(f['id'])
            for o in alvos(por_id[u]): pilha.extend(w for w in o if w in ids)
    dono = {i: next(iter(s)) for i, s in alc.items() if len(s) == 1}
    compart = [n for n in nos if n['id'] not in dono and n['type'] != 'comment']
    # --- camadas por caminho mais longo (DAG): arestas de retorno (achadas por DFS) sao ignoradas
    def camadas(conj):
        conj_ids = {n['id'] for n in conj}; cor, ret = {}, set()
        def dfs(u):
            cor[u] = 1
            for o in alvos(por_id[u]):
                for w in o:
                    if w not in conj_ids: continue
                    if cor.get(w) == 1: ret.add((u, w))
                    elif w not in cor: dfs(w)
            cor[u] = 2
        for n in sorted(conj, key=lambda n: (n['x'], n['y'])):
            if n['id'] not in cor: dfs(n['id'])
        cam = {i: 0 for i in conj_ids}
        for _ in range(len(conj_ids) + 1):
            mudou = False
            for u in conj_ids:
                for o in alvos(por_id[u]):
                    for w in o:
                        if w in conj_ids and (u, w) not in ret and cam[w] < cam[u] + 1: cam[w] = cam[u] + 1; mudou = True
            if not mudou: break
        return cam
    novos, grupos, pos = [], [], {}
    cores = ['#dbeafe', '#dcfce7', '#fef3c7', '#ede9fe', '#fce7f3', '#e0f2fe']; y = 110
    lanes = []
    for k, f in enumerate(ordem_f):
        membros = [n for n in nos if dono.get(n['id']) == f['id']]
        if not membros: continue
        lanes.append((f, membros))
    X0, PASSO = 150, 70
    link_out_por = {}   # (faixa, destino) -> no link out
    link_in_por = {}    # destino -> no link in
    for k, (f, membros) in enumerate(lanes):
        cam = camadas(membros); por_cam = {}
        for n in sorted(membros, key=lambda n: (cam[n['id']], n['y'], n['x'])): por_cam.setdefault(cam[n['id']], []).append(n)
        topo = y; x = X0; maxy = y
        for c in sorted(por_cam):
            col = por_cam[c]; w = max(largura(n) for n in col)
            for j, n in enumerate(col): pos[n['id']] = (x + w // 2, y + j * 44); maxy = max(maxy, y + j * 44)
            x += w + 60
        lanes[k] = (f, membros, topo, maxy, x)
        y = max(maxy, topo + 44) + 100   # espaco p/ ate 2 linhas de nos link
    y_comp = y + 90
    band_top = {}
    if compart:
        cam = camadas(compart); por_cam = {}
        for n in sorted(compart, key=lambda n: (cam[n['id']], n['y'], n['x'])): por_cam.setdefault(cam[n['id']], []).append(n)
        x = X0 + 140; maxy = y_comp; faixa_y = y_comp; LIM = 2300; linhas_max = 1
        for c in sorted(por_cam):
            col = por_cam[c]; w = max(largura(n) for n in col)
            if x + w > LIM and x > X0 + 140:      # dobra a area compartilhada em outra linha (evita uma fileira de 3000 px)
                faixa_y += linhas_max * 56 + 130; x = X0 + 140; linhas_max = 1
            for j, n in enumerate(col): pos[n['id']] = (x + w // 2, faixa_y + j * 56); band_top[n['id']] = faixa_y; maxy = max(maxy, faixa_y + j * 56)
            linhas_max = max(linhas_max, len(col)); x += w + 70
        topo_comp, base_comp = y_comp, maxy
    # --- notas (comment) do fluxo original: coluna alinhada embaixo de tudo
    notas = sorted([n for n in nos if n['type'] == 'comment'], key=lambda n: (n['y'], n['x']))
    if notas:
        y_notas = (max(p[1] for p in pos.values()) if pos else y) + 130
        for i, n in enumerate(notas): pos[n['id']] = (X0 + largura(n) // 2, y_notas + i * 44)   # alinhadas a esquerda
    # --- links: arestas faixa -> compartilhada
    novos_links = []
    def novo_link(tipo, nome, xx, yy, grupo):
        i = '%s_%s_%d' % (z, 'lo' if tipo == 'link out' else 'li', len(novos_links) + 1)
        n = {'id': i, 'type': tipo, 'z': z, 'name': nome, 'links': [], 'x': xx, 'y': yy, 'wires': [] if tipo == 'link out' else [[]], 'g': grupo}
        if tipo == 'link out': n['mode'] = 'link'
        novos_links.append(n); return n
    gid_faixa = {f['id']: '%s_g_f%d' % (z, k + 1) for k, (f, *_ ) in enumerate(lanes)}; gid_comp = z + '_g_comp'
    for k, (f, membros, topo, maxy, xfim) in enumerate(lanes):
        saidas_ext = {}
        for n in membros:
            for p, o in enumerate(alvos(n)):
                for w in o:
                    if w in ids and dono.get(w) != f['id']: saidas_ext.setdefault(w, []).append((n['id'], p))
        for j, (dest, orig) in enumerate(sorted(saidas_ext.items(), key=lambda kv: pos[kv[0]][1])):
            nm = '→ ' + (por_id[dest].get('name') or por_id[dest]['type'])
            lo = novo_link('link out', nm, xfim + 90, topo + j * 44, gid_faixa[f['id']]); pos[lo['id']] = (xfim + 90, topo + j * 44)
            if dest not in link_in_por:
                li = novo_link('link in', '← ' + (por_id[dest].get('name') or por_id[dest]['type']), 0, 0, gid_comp)
                pos[li['id']] = (li['x'], li['y']); li['wires'] = [[dest]]; link_in_por[dest] = li
            li = link_in_por[dest]; lo['links'].append(li['id']); li['links'].append(lo['id'])
            for (src, p) in orig: lo.setdefault('_srcs', []).append((src, p, dest))
    # --- nos link in: fileira PROPRIA acima de cada linha da area compartilhada (nunca em cima de outro no); mesma coluna = desloca 150 px
    por_banda = {}
    for dest, li in link_in_por.items(): por_banda.setdefault(band_top[dest], []).append((pos[dest][0], dest, li))
    for topo_b, itens in por_banda.items():
        ult = -10**9
        for xd, dest, li in sorted(itens, key=lambda it: it[0]):
            xx = max(xd, ult + 150); li['x'], li['y'] = xx, topo_b - 56; pos[li['id']] = (xx, topo_b - 56); ult = xx
    # --- reescreve fios e posicoes
    saida = []
    for n in flow:
        if n['id'] in pos and n.get('z') == z:
            n = dict(n); n['x'], n['y'] = pos[n['id']]
        saida.append(n)
    por_id2 = {n['id']: n for n in saida}
    for lo in [l for l in novos_links if l['type'] == 'link out']:
        for (src, p, dest) in lo.pop('_srcs', []):
            o = por_id2[src]['wires'][p]; idx = o.index(dest); o[idx] = lo['id']
        # remove duplicatas mantendo a ordem
    for n in saida:
        if 'wires' in n and n.get('z') == z:
            n['wires'] = [list(dict.fromkeys(o)) for o in n['wires']]
    saida += novos_links; por_id2 = {n['id']: n for n in saida}
    # --- grupos (caixa = limites dos membros + margem)
    def caixa(mem):
        xs0 = [pos[m][0] - largura(por_id2[m]) // 2 if m in por_id2 and 'name' in por_id2[m] else pos[m][0] - 60 for m in mem]
        xs1 = [pos[m][0] + largura(por_id2[m]) // 2 for m in mem]; ys0 = [pos[m][1] - 22 for m in mem]; ys1 = [pos[m][1] + 22 for m in mem]
        return min(xs0) - 25, min(ys0) - 30, max(xs1) + 25 - (min(xs0) - 25), max(ys1) + 25 - (min(ys0) - 30)
    for k, (f, membros, topo, maxy, xfim) in enumerate(lanes):
        mem = [n['id'] for n in membros] + [l['id'] for l in novos_links if l['g'] == gid_faixa[f['id']]]
        gx, gy, gw, gh = caixa(mem)
        grupos.append({'id': gid_faixa[f['id']], 'type': 'group', 'z': z, 'name': f.get('name') or f['type'], 'style': {'label': True, 'fill': cores[k % 5 if k % 5 != 2 else 5], 'stroke': '#64748b'}, 'nodes': mem, 'x': gx, 'y': gy, 'w': gw, 'h': gh})
        for m in mem: por_id2[m]['g'] = gid_faixa[f['id']]
    if compart:
        mem = [n['id'] for n in compart] + [l['id'] for l in novos_links if l['g'] == gid_comp]
        gx, gy, gw, gh = caixa(mem)
        grupos.append({'id': gid_comp, 'type': 'group', 'z': z, 'name': 'Fila de escrita, PLC e respostas (área compartilhada)', 'style': {'label': True, 'fill': '#fef3c7', 'stroke': '#a16207'}, 'nodes': mem, 'x': gx, 'y': gy, 'w': gw, 'h': gh})
        for m in mem: por_id2[m]['g'] = gid_comp
    if notas:
        gid_notas = z + '_g_notas'; mem = [n['id'] for n in notas]; gx, gy, gw, gh = caixa(mem)
        grupos.append({'id': gid_notas, 'type': 'group', 'z': z, 'name': 'Notas do fluxo', 'style': {'label': True, 'fill': '#f1f5f9', 'stroke': '#94a3b8'}, 'nodes': mem, 'x': gx, 'y': gy, 'w': gw, 'h': gh})
        for m in mem: por_id2[m]['g'] = gid_notas
    saida += grupos; por_id2 = {n['id']: n for n in saida}
    # --- info em todos os nos, aba e nota de cabecalho
    ent2 = {}
    for n in saida:
        for o in n.get('wires', []) if n.get('z') == z else []:
            for w in o: ent2.setdefault(w, []).append(n['id'])
    for n in saida:
        if n.get('z') == z and n['type'] in ('function', 'http in', 'http response', 's7 in', 's7 out', 'delay', 'trigger', 'inject', 'catch'):
            n['info'] = info_no(n, por_id2, ent2)
        if n['type'] == 'link out': n['info'] = 'Liga esta faixa à área compartilhada (no lugar de um fio longo). Não altera a mensagem.'
        if n['type'] == 'link in': n['info'] = 'Recebe das faixas das rotas (nós link). Não altera a mensagem.'
    nome = re.sub(r'\s+v\d+(?:\.\d+)+.*$', '', tab['label']).strip()
    hist = (tab.get('info') or '').strip()
    tab = next(n for n in saida if n['type'] == 'tab'); tab['label'] = '%s v%s' % (nome, versao)
    tab['info'] = ('v%s (%s) — %s\n\n**Padrão de fluxos do BT2:** nome da aba = "%s vX.Y" = versão do arquivo; cada nó tem info (ícone i); notas curtas; faixas por rota à esquerda e área compartilhada à direita; nós link no lugar de fios longos.\n\n## Histórico das versões anteriores (texto original preservado)\n\n%s' % (versao, hoje, mudou, nome, hist))
    cab = {'id': z + '_nota_cab', 'type': 'comment', 'z': z, 'name': ('%s v%s — leia o info (ícone i)' % (nome, versao)) if len('%s v%s — leia o info (ícone i)' % (nome, versao)) <= LARG_NOTA else ('%s v%s' % (nome, versao))[:LARG_NOTA], 'info': tab['info'].split('\n\n')[0], 'x': 150 + 200, 'y': 25, 'wires': []}
    saida.append(cab)
    return saida
def main():
    if len(sys.argv) < 5: sys.exit(__doc__)
    ent, sai, versao, mudou = sys.argv[1:5]; assert os.path.exists(ent) and not os.path.exists(sai), 'saida ja existe ou entrada falta'
    hoje = datetime.date.today().strftime('%d/%m/%Y')
    out = organiza(json.load(open(ent, encoding='utf-8')), versao, mudou, hoje)
    json.dump(out, open(sai, 'w', encoding='utf-8'), ensure_ascii=False, indent=2); print('gerado', sai, len(out), 'itens')
if __name__ == '__main__': main()
