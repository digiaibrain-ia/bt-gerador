#!/usr/bin/env python3
"""14/11/2026 - Gera nodered/flows/bt2/registro-ensaio-db2100-api-v1.10.json (de v1.9). Nao sobrescreve; aborta se um trecho esperado mudou.
Causa (achada ao ligar o Dados do ensaio por NS ao registro): o fluxo limpa texto com S(), que troca qualquer caractere fora de ASCII por '?'.
O NS impresso na plaqueta usa 'Ø' (zero cortado) e o codigo de barras vem com '*' nas pontas: 'DTMFØ4447' ia ao PLC como 'DTMF?4447'.
Mudancas (so 3 funcoes + nomes; layout, ligacoes, enderecos S7 e DB2100 NAO mudam):
 1) valida preenchimento: normaliza campos.serie NO SERVIDOR (tira espacos e '*', Ø/ø/∅ -> 0, maiusculas). Aceita campos opcionais origemDados ('manual'|'ns') e ns (metadados do decodificador), recusa formato errado (400).
 2) monta escritas: guarda os metadados no contexto da requisicao (ctx.origem). Nada novo e escrito no PLC.
 3) confere leitura x escrita: so depois da fase 2 do preenchimento (flag TRUE confirmado) promove os metadados para o contexto do fluxo 'ens_origem' (MEMORIA do Node-RED: some se reiniciar);
    limpar apaga; GET snap devolve 'origem' somente se o NS lido do PLC for igual ao NS dos metadados (senao null).
Sem os campos novos o fluxo se comporta como a v1.9 (exceto a normalizacao do NS). Campos novos no DB2100 (gravar origem no PLC) ficam no BACKLOG_FORA_DE_ESCOPO.md (precisa da Etapa de PLC).
Uso: python3 nodered/gerador/gerar_registro_ensaio_v1.10_v0.1.py"""
import json, os, datetime
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); FL = os.path.join(R, 'nodered', 'flows', 'bt2')
ENT, SAI = os.path.join(FL, 'registro-ensaio-db2100-api-v1.9.json'), os.path.join(FL, 'registro-ensaio-db2100-api-v1.10.json')
assert os.path.exists(ENT) and not os.path.exists(SAI), SAI
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)

VALIDA_NOVO = r"""const campos = (msg.payload || {}).campos;
if (!campos || typeof campos !== 'object') {
  msg.statusCode = 400; msg.payload = { ok: false, erro: 'campos ausente' };
  return [null, msg];
}
// v1.10: NS normalizado NO SERVIDOR (nao confia no cliente). Plaqueta usa 'Ø' (zero cortado) e o codigo de barras vem com '*';
// sem isto o S() mais adiante trocava o 'Ø' por '?'. Tira espacos e '*', Ø/ø/∅ -> 0, maiusculas.
campos.serie = String(campos.serie == null ? '' : campos.serie).replace(/[\s*]/g, '').replace(/[Øø∅]/g, '0').toUpperCase();
// v1.10: metadados OPCIONAIS da origem dos dados (medidor 1.10.202+). Ausentes = cliente antigo = manual.
const bad = (erro) => { msg.statusCode = 400; msg.payload = { ok: false, erro }; return [null, msg]; };
if (campos.origemDados !== undefined && campos.origemDados !== 'manual' && campos.origemDados !== 'ns') return bad('origemDados deve ser manual ou ns');
let ns = null;
if (campos.ns !== undefined && campos.ns !== null) {
  if (typeof campos.ns !== 'object' || Array.isArray(campos.ns)) return bad('ns deve ser um objeto');
  const san = (v, n) => String(v == null ? '' : v).replace(/[^\x20-\x7E]/g, '?').slice(0, n);
  const lista = (v, n, t) => Array.isArray(v) ? v.slice(0, n).map(x => san(x, t)) : [];
  const sq = Number(campos.ns.sequencial);
  ns = { valido: campos.ns.valido === true, tipo: san(campos.ns.tipo, 10), prefixo: san(campos.ns.prefixo, 6), sequencial: Number.isFinite(sq) ? sq : null,
         alterados: lista(campos.ns.alterados, 20, 60), avisos: lista(campos.ns.avisos, 10, 120) };
}
msg._origem = { origemDados: campos.origemDados || 'manual', ns, serie: campos.serie, gravadoEm: new Date().toISOString() };
msg._selRota = 'POST_PREEN';
return [msg, null];
"""

def main():
    flow = json.load(open(ENT, encoding='utf-8')); d = {n['id']: n for n in flow}; hoje = datetime.date.today().strftime('%d/%m/%Y')
    # 1) valida preenchimento: substitui o corpo inteiro (confere o original antes)
    v = d['reg_fn_val_preen']; assert v['func'].strip().startswith("const campos = (msg.payload || {}).campos;") and "msg._selRota = 'POST_PREEN';" in v['func']; v['func'] = VALIDA_NOVO
    # 2) monta escritas
    p = d['reg_fn_prep']; p['func'] = troca(p['func'], "  ctx.esp = esp;\n", "  ctx.esp = esp;\n  ctx.origem = msg._origem || null;   // v1.10: metadados da origem dos dados (so memoria; nada novo vai ao PLC)\n", 'prep')
    # 3) confere
    c = d['reg_fn_conf']
    c['func'] = troca(c['func'],
        "  if (ctx.fase === 'valida') return read.preenchValido === true ? fim(200, { ok: true }) : fim(500, { ok: false, erro: 'leitura de volta nao conferiu: preenchValido' });\n",
        "  if (ctx.fase === 'valida') {\n    if (read.preenchValido !== true) return fim(500, { ok: false, erro: 'leitura de volta nao conferiu: preenchValido' });\n"
        "    flow.set('ens_origem', ctx.origem || null);   // v1.10: so agora (flag TRUE confirmado) a origem dos dados passa a valer\n    return fim(200, { ok: true });\n  }\n", 'conf-valida')
    c['func'] = troca(c['func'],
        "  return sujo ? fim(500, { ok: false, erro: 'leitura de volta apos limpar nao conferiu' }) : fim(200, { ok: true });\n",
        "  if (!sujo) flow.set('ens_origem', null);   // v1.10: limpou o snap, esquece a origem\n  return sujo ? fim(500, { ok: false, erro: 'leitura de volta apos limpar nao conferiu' }) : fim(200, { ok: true });\n", 'conf-limpar')
    c['func'] = troca(c['func'],
        "  return fim(200, { flow: 'registro-ensaio-v1.4', modo: flow.get('sel_modo') || 'manual', preenchimento, etapas, lidoEm: new Date().toISOString() });\n",
        "  const o = flow.get('ens_origem');   // v1.10: origem so vale se o NS lido do PLC e o mesmo dos metadados (memoria do Node-RED: some se reiniciar)\n"
        "  const origem = (preenchimento && o && o.serie === preenchimento.serie) ? o : null;\n"
        "  return fim(200, { flow: 'registro-ensaio-v1.4', modo: flow.get('sel_modo') || 'manual', preenchimento, origem, etapas, lidoEm: new Date().toISOString() });\n", 'conf-snap')
    # nomes e documentacao
    mudou = 'v1.10 (%s) - NS normalizado no servidor (Ø->0, sem *, maiusculas: antes o Ø virava ? no PLC) e metadados opcionais origemDados/ns guardados em memoria e devolvidos no GET snap (origem). Nada novo e escrito no DB2100.' % hoje
    t = next(n for n in flow if n['type'] == 'tab'); t['label'] = t['label'].replace('v1.9', 'v1.10'); t['info'] = mudou + '\n\n' + (t.get('info') or '')
    for n in flow:
        if n['type'] == 'comment' and 'v1.9' in (n.get('name') or ''): n['name'] = n['name'].replace('v1.9', 'v1.10')
    for i in ('reg_fn_val_preen', 'reg_fn_prep', 'reg_fn_conf'): d[i]['info'] = (d[i].get('info') or '') + '\n\nv1.10: ' + {'reg_fn_val_preen': 'normaliza o NS e valida origemDados/ns (opcionais).', 'reg_fn_prep': 'guarda ctx.origem (memoria).', 'reg_fn_conf': 'promove a origem para o contexto do fluxo depois do flag TRUE; limpar apaga; GET snap devolve origem.'}[i]
    json.dump(flow, open(SAI, 'w', encoding='utf-8'), ensure_ascii=False, indent=2); print('gerado', os.path.basename(SAI), '|', len(flow), 'itens')
if __name__ == '__main__': main()
