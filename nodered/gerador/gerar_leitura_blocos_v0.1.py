#!/usr/bin/env python3
"""gerar_leitura_blocos_v0.1.py — Passo 10 (item 1): LEITURA DAS CHAVES EM BLOCOS DE BYTE (em vez de bit a bit).

PARA QUE SERVE (leigo): hoje o Node-RED le o DB de cada banco pedindo ao PLC 124 itens a cada 200 ms (118 deles sao UM bit cada). Isso e muito pedido miudo, e a leitura disputa a mesma
conexao com as escritas dos comandos (principalmente no Patamar, que manda varias chaves seguidas). Aqui os 118 bits passam a ser lidos em 2 blocos de bytes (8 itens no total) e um no
"decodifica" devolve os bits com os MESMOS nomes de antes (CbLigar1, Ligada3...), entao o resto do fluxo nao muda. As ESCRITAS continuam bit a bit, por nome (cada bit e atomico: nada de
ler-e-reescrever uma palavra, que apagaria o que o PLC fez no mesmo byte).

COMO FUNCIONA (tecnico): le a versao atual de cada fluxo de chaves e grava a versao nova (a anterior fica intacta):
  chaves-56 v3.10 -> v3.11 | chaves-400 v3.9 -> v3.10 | chaves-550 v1.10 -> v1.11 | chaves-595 v1.10 -> v1.11
  1) endpoint de LEITURA (o de antes): o vartable troca os itens X<byte>.<bit> por blocos DBn,BYTE<ofs>.<n> (blocos derivados do vartable: bytes de bit com folga <= 4 se fundem);
     os itens que ja eram arrays/INT (KwReal, Nominal, SetupData, ChaveSel...) ficam como estavam;
  2) endpoint de ESCRITA novo (<p>_epw, mesmo PLC, ciclo 500 ms) com os itens que o fluxo ESCREVE, por nome (CbLigar, Habilitada, SetupOk, Salvar, UsarKwReal, LigarBanco, ChaveSel, arrays do Setup);
  3) no "decodifica blocos" entre o "s7 in" e os nos "confere leitura" e "guarda leitura ao vivo": expande os bits com os nomes antigos; bloco invalido => NAO atualiza o cache
     (o cache envelhece e as rotas respondem 503 LEITURA_VELHA, em vez de tratar leitura ruim como "tudo desligado");
  4) o "s7 out" do DB passa a usar o endpoint de escrita.
NAO FAZ: nao muda o PLC, nao muda o DB, nao muda nenhuma rota nem resposta HTTP, nao toca no PC BT2. So vale depois da bancada medir o ganho (checklist, item A8).
USO: python3 nodered/gerador/gerar_leitura_blocos_v0.1.py        (REGRA: versao nova; nunca sobrescreve a anterior)
"""
import copy, json, os, re, sys

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FLUXOS = os.path.join(RAIZ, 'nodered', 'flows', 'bt2')
DATA = '21/11/2026'
BANCOS = [('chaves-56-api-v3.10', 'chaves-56-api-v3.11', 'v3.11'), ('chaves-400-api-v3.9', 'chaves-400-api-v3.10', 'v3.10'),
          ('chaves-550-api-v1.10', 'chaves-550-api-v1.11', 'v1.11'), ('chaves-595-api-v1.10', 'chaves-595-api-v1.11', 'v1.11')]
FOLGA = 4          # bytes de folga que ainda fundem dois bits no mesmo bloco
ESCRITOS = re.compile(r'^(CbLigar\d+|Habilitada\d+|SetupOk\d+|Salvar|UsarKwReal|LigarBanco|ChaveSel|KwReal|RmedidoOhm|RteoricoOhm|SetupData)$')   # nomes que o fluxo escreve no DB
BIT = re.compile(r'^DB(\d+),X(\d+)\.([0-7])$')

DECOD_JS = r"""// Passo 10 (%(data)s) - DECODIFICA OS BLOCOS DE BYTE lidos do DB e devolve os bits com os MESMOS nomes de antes (CbLigar1, Ligada3, HabResp5...). Tudo depois daqui segue igual.
// Leitura invalida (bloco ausente, curto ou com valor que nao e numero) => NAO repassa: o cache envelhece e as rotas respondem 503 LEITURA_VELHA (nunca "tudo desligado").
const BLOCOS = %(blocos)s;   // [{nome, tam, bits: [[nome, byte, bit], ...]}] gerado a partir do vartable de antes
const p = msg.payload;
const ruim = (t) => { const agora = Date.now(), k = '%(p)s_decod_aviso'; if ((flow.get(k) || 0) + 60000 < agora) { flow.set(k, agora); node.warn('leitura em blocos invalida (' + t + '): cache NAO atualizado'); } return null; };
if (!p || typeof p !== 'object') return ruim('sem dados');
const out = Object.assign({}, p);
for (const b of BLOCOS) {
  const v = p[b.nome];
  if (!Array.isArray(v) || v.length < b.tam || v.slice(0, b.tam).some(x => typeof x !== 'number' || !isFinite(x))) return ruim(b.nome);
  delete out[b.nome];
  for (const [nome, by, bit] of b.bits) out[nome] = ((v[by] >> bit) & 1) === 1;
}
msg.payload = out;
return msg;
"""


def blocos_de(vartable):
    """Agrupa os itens de bit (DBn,X<byte>.<bit>) em blocos de bytes contiguos (folga <= FOLGA). Devolve (blocos, itens_nao_bit)."""
    bits, outros = [], []
    for v in vartable:
        m = BIT.match(v['addr'])
        if m: bits.append((int(m.group(1)), int(m.group(2)), int(m.group(3)), v['name']))
        else: outros.append(v)
    assert bits, 'sem itens de bit'
    dbs = {b[0] for b in bits}; assert len(dbs) == 1, 'bits em mais de um DB'
    db = dbs.pop()
    bytes_usados = sorted({b[1] for b in bits}); grupos = [[bytes_usados[0]]]
    for x in bytes_usados[1:]:
        if x - grupos[-1][-1] <= FOLGA: grupos[-1].append(x)
        else: grupos.append([x])
    blocos = []
    for i, g in enumerate(grupos):
        ini, fim = g[0], g[-1]; nome = 'Bits' + 'ABCDEFGH'[i]
        blocos.append({'nome': nome, 'db': db, 'ini': ini, 'tam': fim - ini + 1, 'bits': [[b[3], b[1] - ini, b[2]] for b in bits if ini <= b[1] <= fim]})
    return blocos, outros


def gera(origem, novo, vcurta):
    nos = json.load(open(os.path.join(FLUXOS, origem + '.json'), encoding='utf8')); por = {n['id']: n for n in nos}
    tab = next(n for n in nos if n['type'] == 'tab')
    ep = next(n for n in nos if n['type'] == 's7 endpoint' and any(BIT.match(v['addr']) for v in n.get('vartable', [])))
    leitura = next(n for n in nos if n['type'] == 's7 in' and n.get('endpoint') == ep['id'])
    escrita = next(n for n in nos if n['type'] == 's7 out' and n.get('endpoint') == ep['id'])
    P = re.match(r'^(chv\d+)_', leitura['id']).group(1)
    blocos, outros = blocos_de(ep['vartable'])
    nomes_vt = {v['name'] for v in ep['vartable']}
    # 1) endpoint de escrita novo: so o que o fluxo ESCREVE, por nome (itens identicos aos de antes)
    escritos = [copy.deepcopy(v) for v in ep['vartable'] if ESCRITOS.match(v['name'])]
    assert len(escritos) >= 40, 'poucos itens de escrita encontrados'
    texto = ' '.join((n.get('func') or '') for n in nos)
    nomes_esc = {v['name'] for v in escritos}
    nomes_outros_ep = {v['name'] for n in nos if n['type'] == 's7 endpoint' and n['id'] != ep['id'] for v in n.get('vartable', [])}   # ex.: DB por tensao (OkLin, KwLin...), que tem endpoint proprio
    for m in re.finditer(r"variable:\s*'([A-Za-z0-9_]+)'", texto):          # todo nome escrito pelo fluxo (inteiro ou prefixo de 'Nome' + indice) tem que estar no endpoint de escrita
        nome = m.group(1)
        if nome in nomes_outros_ep or any(o.startswith(nome) for o in nomes_outros_ep): continue
        assert nome in nomes_esc or any(e.startswith(nome) for e in nomes_esc), 'o fluxo escreve ' + nome + ' mas ele nao esta no endpoint de escrita'
    epw = copy.deepcopy(ep); epw['id'] = P + '_epw'; epw['name'] = ep['name'] + ' (escrita do DB)'; epw['vartable'] = escritos; epw['cycletime'] = '500'
    epw['info'] = ('Passo 10 (%s): conexao S7 so para ESCREVER o DB (mesmos enderecos e nomes de antes, bit a bit). A leitura passou para o endpoint "%s", em blocos de byte. Ciclo 500 ms: so serve para o no perceber a queda da conexao.' % (DATA, ep['name']))
    # 2) endpoint de leitura: blocos no lugar dos bits
    itens_blocos = [{'addr': 'DB%d,BYTE%d.%d' % (b['db'], b['ini'], b['tam']), 'name': b['nome']} for b in blocos]
    ep['vartable'] = itens_blocos + outros
    ep['info'] = (ep.get('info') or '') + ('\n\nPasso 10 (%s): os itens de bit (118 em cada DB de 16 chaves) foram trocados por %d blocos de byte (%s); o no "decodifica blocos" devolve os bits com os mesmos nomes. As escritas usam o endpoint "%s".' % (DATA, len(blocos), ', '.join('%s=BYTE%d.%d' % (b['nome'], b['ini'], b['tam']) for b in blocos), epw['name']))
    # 3) no decodificador entre o s7 in e os consumidores
    consumidores = leitura['wires'][0]
    did = P + '_decod'
    decod = {'id': did, 'type': 'function', 'z': leitura['z'], 'name': 'decodifica blocos (bits com os nomes de antes)', 'func': DECOD_JS % dict(data=DATA, p=P, blocos=json.dumps(blocos, separators=(',', ':'))),
             'outputs': 1, 'timeout': 0, 'noerr': 0, 'initialize': '', 'finalize': '', 'libs': [], 'x': leitura['x'] + 230, 'y': leitura['y'], 'wires': [list(consumidores)],
             'info': 'Passo 10 (%s). Transforma os blocos de byte lidos do DB nos bits com os nomes de antes (CbLigar1, Ligada3...). Leitura invalida nao e repassada (o cache envelhece e as rotas respondem 503 LEITURA_VELHA).' % DATA}
    if leitura.get('g'): decod['g'] = leitura['g']
    leitura['wires'] = [[did]]
    nos.append(decod)
    if leitura.get('g'):
        grp = next(n for n in nos if n['id'] == leitura['g']); grp['nodes'].append(did)
    # 4) o s7 out passa a usar o endpoint de escrita
    escrita['endpoint'] = epw['id']
    nos.append(epw)
    tab['label'] = re.sub(r'v\d+\.\d+', vcurta, tab['label'])
    tab['info'] = ('%s (%s) - Passo 10: leitura do DB em blocos de byte (8 itens em vez de 124) e escrita em endpoint proprio, bit a bit. Nenhuma rota nem resposta mudou em relacao a %s.\n\n' % (vcurta, DATA, origem)) + (tab.get('info') or '')
    destino = os.path.join(FLUXOS, novo + '.json')
    if os.path.exists(destino): sys.exit('ja existe (versao nova nunca sobrescreve): ' + destino)
    json.dump(nos, open(destino, 'w', encoding='utf8', newline='\n'), ensure_ascii=False, indent=4); open(destino, 'a').write('\n')
    print('gerado', os.path.relpath(destino, RAIZ), '| itens de leitura: %d -> %d | escrita: %d itens | blocos: %s' % (len(nomes_vt), len(ep['vartable']), len(escritos), ', '.join('%s=BYTE%d.%d' % (b['nome'], b['ini'], b['tam']) for b in blocos)))


if __name__ == '__main__':
    for o, n, v in BANCOS: gera(o, n, v)
