#!/usr/bin/env python3
"""24/11/2026 - arquitetura BT2 v0.7 a partir da v0.6 (nao sobrescreve). NAO muda o desenho nem os dados; acrescenta, sobre o mesmo modelo:
  1) ALCANCE: clique num elemento e veja tudo a JUSANTE, a MONTANTE ou os dois (o resto esmaece);
  2) TRILHA: caminho passo a passo entre dois elementos (ex.: Medidor -> Contatoras), com as alternativas;
  3) EVIDENCIA: arquivos do repositorio de cada elemento no painel (o gerador confere que o arquivo existe);
  4) VALIDACAO no gerador: ids unicos, pontas de ligacao existentes, ligacao coerente com o estilo, evidencia existente.
Ideias vindas do Archify (tt-a1i/archify, Apache-2.0): foco a montante/jusante, trilha de rota, evidencia ligada ao repositorio e validacao antes de entregar.
Nenhum codigo do Archify foi copiado: a implementacao e propria, sobre o modelo de dados deste arquivo."""
import json, os, subprocess, sys
D = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.abspath(os.path.join(D, '..', '..', '..'))
src, dst = os.path.join(D, 'arquitetura_bt2_v0.6_editavel.html'), os.path.join(D, 'arquitetura_bt2_v0.7_editavel.html')
assert not os.path.exists(dst), 'v0.7 ja existe: nao sobrescrevo'
s = open(src, encoding='utf-8').read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:80]); s = s.replace(a, b)

# ---------- evidencia: elemento -> arquivos do repositorio (so o que existe; o gerador confere)
EVID = {
 'medidor': ['dashboard/ferramentas/medidor_gerador_v1.10.231.html', 'dashboard/src/js/principal/31_chaves_e_bancos_painel.js'],
 'gerenciador': ['dashboard/ferramentas/gerenciador_logs_v1.9.html'],
 'grafico': ['dashboard/ferramentas/grafico_ensaio_v0.13.html'],
 'guarda': ['nodered/flows/bt2/chaves-56-api-v3.13.json'],
 'nodered': ['nodered/flows/bt2/chaves-56-api-v3.13.json', 'nodered/flows/bt2/chaves-400-api-v3.12.json', 'nodered/config/bancos_capacidade.json'],
 'chaves': ['nodered/flows/bt2/chaves-56-api-v3.13.json', 'nodered/flows/bt2/chaves-400-api-v3.12.json', 'docs/bt2/contratos/CONTRATO_HTTP_COMANDO_EM_LOTE_v0.1.md'],
 'chaves2': ['nodered/flows/bt2/chaves-550-api-v1.13.json', 'nodered/flows/bt2/chaves-595-api-v1.13.json'],
 'logs': ['nodered/flows/bt2/dev-logs-api-v1.3.json'],
 'registro': ['nodered/flows/bt2/registro-ensaio-db2100-api-v1.10.json'],
 'cli156': ['nodered/flows/bt2/cliente-156-dse-plc-ensaio-v4.0.json'],
 'dse_srv': ['nodered/flows/bt2/servidor-deepsea-api-gerador-v3_8.json'],
 'rnc': ['nodered/flows/rnc-api-v1.2.json'],
 'plc': ['plc/bt2/entrega_1200_v0.17/PLC_1515/fb100_setupChaves_v0.4.scl', 'plc/bt2/entrega_1200_v0.17/PLC_1515/fb101_ComCarga_v0.9.scl', 'plc/bt2/entrega_1200_v0.17/PLC_1515/fb104_putDseCarga_v0.1.scl', 'plc/bt2/entrega_et200_v0.7/PLC_1515/fb101_ComEt200_v0.8.scl'],
 'db_chaves': ['plc/bt2/entrega_1200_v0.17/PLC_1515/db3000_BC56_Chaves_v0.3.db', 'plc/bt2/entrega_1200_v0.17/PLC_1515/db3100_BC400_Chaves_v0.3.db'],
 'db_setup': ['plc/bt2/bancos_cargas/db3002_BC56_SetupPorTensao_v0.2.db', 'plc/bt2/bancos_cargas/db3102_BC400_SetupPorTensao_v0.2.db'],
 'et200': ['plc/bt2/entrega_et200_v0.7/PLC_ET200/fb_bancosEt200_v0.2.scl', 'plc/bt2/entrega_et200_v0.7/PLC_ET200/fb_bancoEt200_16_v0.4.scl', 'plc/bt2/entrega_et200_v0.7/PLC_ET200/fc_bancosEt200_v0.7.scl', 'plc/bt2/entrega_et200_v0.7/PLC_ET200/db38_ComBC56_v0.5.scl'],
 'plc1200': ['plc/bt2/entrega_1200_v0.17/PLC_CARGA_1200/fb_bancosCarga1200_v0.1.scl', 'plc/bt2/entrega_1200_v0.17/PLC_CARGA_1200/fb_bancoCarga16_v0.9.scl', 'plc/bt2/entrega_1200_v0.17/PLC_CARGA_1200/db3007_BC56_Com_v0.13.scl'],
 'db2000c': ['plc/bt2/entrega_1200_v0.17/PLC_CARGA_1200/db2000_BancoTeste2_DSE_v0.2.scl'],
}

# ---------- ligacoes LOGICAS (invisiveis): so o alcance e a trilha usam. Os DBs vivem dentro do PLC 1500 (so o agrupamento mostra isso; sem elas nenhum caminho de comando chega ao ET200)
IMPL = [('db_chaves', 'plc'), ('db_setup', 'plc'), ('db2100', 'plc'), ('db2000', 'plc')]

# ---------- validacao do modelo (roda o bloco DADOS do proprio arquivo no Node)
a, b = s.index('/* ============================== DADOS'), s.index('/* ============================== ESTADO')
tmp = os.path.join(D, '.dados_tmp.js'); open(tmp, 'w').write(s[a:b] + "\nconsole.log(JSON.stringify({N:N,E:E,G:G}));")
try:
    r = subprocess.run(['node', tmp], capture_output=True, text=True, check=True)
finally:
    os.remove(tmp)
M = json.loads(r.stdout); N, E = M['N'], M['E']
erros, avisos = [], []
ids = [n['id'] for n in N]; eids = [e['id'] for e in E]
erros += ['id de elemento repetido: ' + i for i in set(ids) if ids.count(i) > 1]
erros += ['id de ligacao repetido: ' + i for i in set(eids) if eids.count(i) > 1]
por = {n['id']: n for n in N}
for e in E:
    for k in ('de', 'pa'):
        if e[k] not in por: erros.append('ligacao %s aponta para elemento inexistente: %s' % (e['id'], e[k]))
        elif e['sk'] not in por[e[k]]['in']: erros.append('ligacao %s (estilo %s) usa %s, que nao aparece nesse estilo' % (e['id'], e['sk'], e[k]))
for n in N:
    if not any(e['de'] == n['id'] or e['pa'] == n['id'] for e in E): avisos.append('elemento sem ligacao: ' + n['id'])
for x, y in IMPL:
    for k in (x, y):
        if k not in por: erros.append('ligacao logica usa elemento inexistente: ' + k)
for k, lst in EVID.items():
    if k not in por: erros.append('evidencia para elemento inexistente: ' + k)
    for p in lst:
        if not os.path.exists(os.path.join(RAIZ, p)): erros.append('evidencia %s: arquivo nao existe: %s' % (k, p))
for w in avisos: print('AVISO', w)
if erros:
    for x in erros: print('ERRO', x)
    sys.exit('validacao falhou: nada foi gerado')
print('validacao ok: %d elementos, %d ligacoes, %d evidencias' % (len(N), len(E), sum(len(v) for v in EVID.values())))

# ---------- identificacao
rep('<title>Arquitetura BT2 v0.6</title>', '<title>Arquitetura BT2 v0.7</title>')
rep('v0.6 · 17/11/2026', 'v0.7 · 24/11/2026')
# ---------- ligacoes e rotulos ganham o id (para o destaque)
rep("""'<g data-tt="'+esc(nome(o.a)+' → '+nome(o.b))+'\"""", """'<g data-e="'+e.id+'" data-tt="'+esc(nome(o.a)+' → '+nome(o.b))+'\"""")
rep("""html+='<g class="elab"><rect""", """html+='<g class="elab" data-e="'+e.id+'"><rect""")

CSS = """
/* ===== v0.7: alcance, trilha e evidencia ===== */
:root{--foco:#0E7490}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--foco:#22D3EE}}
:root[data-theme="dark"]{--foco:#22D3EE}
#cena.foco .nd:not(.em){opacity:.16;filter:grayscale(.7)}
#cena.foco .ed g:not(.em){opacity:.1}
#cena.foco .ed g.em .ln{stroke:var(--foco);stroke-width:3.2}
#cena.foco .ed g.em .hit{stroke:transparent}
#cena.foco .nd.em{box-shadow:0 0 0 2px var(--foco)}
#cena.foco .nd.orig{box-shadow:0 0 0 4px var(--foco)}
#cena:not(.edit) .nd{cursor:pointer}
#pn{position:fixed;right:14px;bottom:14px;z-index:55;width:min(380px,calc(100vw - 28px));max-height:70vh;overflow:auto;background:var(--panel);color:var(--fg);border:1px solid var(--line);border-radius:12px;padding:12px 14px;font-size:12.5px;line-height:1.45;box-shadow:0 8px 28px rgba(0,0,0,.25)}
#pn[hidden]{display:none}
#pn h3{margin:0 0 2px;font-size:14px}#pn .st{display:inline-block;font-size:11px;border:1px solid var(--line);border-radius:99px;padding:1px 8px;color:var(--muted);margin-bottom:6px}
#pn p{margin:4px 0;color:var(--muted)}#pn code{display:block;font-size:11px;word-break:break-all;background:var(--card);border:1px solid var(--line);border-radius:6px;padding:3px 6px;margin:3px 0;color:var(--fg)}
#pn .bt{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}#pn button{font:inherit;font-size:12px;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:8px;padding:4px 9px;cursor:pointer}
#pn button[aria-pressed="true"]{border-color:var(--foco);color:var(--foco);font-weight:700}
#pn ol{margin:4px 0 4px 18px;padding:0}#pn li{margin:2px 0}#pn .x{position:absolute;right:8px;top:6px;border:0;background:none;font-size:16px;color:var(--muted)}
"""
rep('</style>', CSS + '</style>')
rep('<div id="tip" hidden></div>', '<div id="tip" hidden></div>\n  <div id="pn" hidden></div>')

JS = r"""
/* ============================== ALCANCE, TRILHA E EVIDENCIA (v0.7) ============================== */
var EVID=__EVID__;
var IMPL=__IMPL__.map(function(p,k){return {id:'i'+k,de:p[0],pa:p[1],bi:1,rot:'',st:'real',impl:1}});
var F={sel:null,modo:null,ini:null,fim:null,res:null,cam:[],idx:0,skin:null};
function skAtual(){return S.skin==='agentes'?'a':'b'}
function noEm(i,sk){var n=nodoPorId(i);return !!n&&n.in.indexOf(sk)>=0}
function ligs(){var sk=skAtual();return E.filter(function(e){return e.sk===sk&&nodoPorId(e.de)&&nodoPorId(e.pa)}).concat(IMPL.filter(function(e){return noEm(e.de,sk)&&noEm(e.pa,sk)}))}
function passos(x,modo,e){var r=[];
  if(modo!=='mon'){if(e.de===x)r.push(e.pa);if(e.bi&&e.pa===x)r.push(e.de)}
  if(modo!=='jus'){if(e.pa===x)r.push(e.de);if(e.bi&&e.de===x)r.push(e.pa)}
  return r}
function alcance(id,modo){var L=ligs(),nos={},eds={},fila=[id];nos[id]=1;
  while(fila.length){var x=fila.shift();L.forEach(function(e){passos(x,modo,e).forEach(function(y){eds[e.id]=1;if(!nos[y]){nos[y]=1;fila.push(y)}})})}
  return {nos:nos,eds:eds}}
function caminhos(a,b){var L=ligs(),out=[],vis={};vis[a]=1;
  (function dfs(x,pe){if(out.length>=6)return;if(x===b){out.push(pe.slice());return}
    L.forEach(function(e){passos(x,'jus',e).forEach(function(y){if(vis[y])return;vis[y]=1;pe.push({e:e,de:x,pa:y});dfs(y,pe);pe.pop();vis[y]=0})})})(a,[]);
  out.sort(function(p,q){return p.length-q.length});return out}
function resTrilha(c){var nos={},eds={};if(!c)return null;nos[F.ini]=1;c.forEach(function(p){nos[p.pa]=1;eds[p.e.id]=1});return {nos:nos,eds:eds}}
function aplicaFoco(){if(!elCena)return;var r=F.res,i,L;
  elCena.classList.toggle('foco',!!r);
  L=elCena.querySelectorAll('.nd');for(i=0;i<L.length;i++){var id=L[i].dataset.id;L[i].classList.toggle('em',!!r&&!!r.nos[id]);L[i].classList.toggle('orig',!!r&&id===(F.ini||F.sel))}
  L=elCena.querySelectorAll('g[data-e]');for(i=0;i<L.length;i++)L[i].classList.toggle('em',!!r&&!!r.eds[L[i].dataset.e])}
function limpaFoco(){F.sel=F.modo=F.ini=F.fim=F.res=null;F.cam=[];painel()}
function lista(r){var t=Object.keys(r.nos).map(function(i){var n=nodoPorId(i);return n?nome(n):i});return t}
function painel(){var pn=document.getElementById('pn');if(!pn)return;
  if(!F.sel&&!F.ini){pn.hidden=true;aplicaFoco();return}
  var h='<button class="x" data-p="x" title="fechar">×</button>',n=nodoPorId(F.sel||F.ini);
  if(F.ini&&F.fim){var a=nodoPorId(F.ini),b=nodoPorId(F.fim);h+='<h3>Trilha: '+esc(nome(a))+' → '+esc(nome(b))+'</h3>';
    if(!F.cam.length)h+='<p>Não há caminho de comando entre os dois neste estilo (as ligações têm sentido).</p>';
    else{h+='<div class="bt">'+F.cam.map(function(c,k){return '<button data-p="c'+k+'" aria-pressed="'+(k===F.idx)+'">Caminho '+(k+1)+' ('+c.length+')</button>'}).join('')+'</div><ol>'+F.cam[F.idx].map(function(p){var A=nodoPorId(p.de),B=nodoPorId(p.pa);return '<li><b>'+esc(nome(A))+'</b> → <b>'+esc(nome(B))+'</b>'+(p.e.impl?' <i>(o DB fica dentro do PLC)</i>':(p.e.rot?' · '+esc(p.e.rot):'')+' <i>('+esc(ST[p.e.st])+')</i>')+'</li>'}).join('')+'</ol>'}
    h+='<div class="bt"><button data-p="nova">Nova trilha</button><button data-p="limpa">Limpar</button></div>'}
  else if(F.ini){h+='<h3>Trilha a partir de '+esc(nome(n))+'</h3><p>Clique no elemento de destino.</p><div class="bt"><button data-p="limpa">Cancelar</button></div>'}
  else{var st=stat(n),ev=EVID[n.id]||[];h+='<h3>'+esc(nome(n))+'</h3><span class="st">'+esc(ST[st])+'</span>'+(sub(n)?'<p><b>'+esc(sub(n))+'</b></p>':'')+'<p>'+esc(n.det||'')+'</p>';
    h+='<div class="bt"><button data-p="jus" aria-pressed="'+(F.modo==='jus')+'">Jusante</button><button data-p="mon" aria-pressed="'+(F.modo==='mon')+'">Montante</button><button data-p="amb" aria-pressed="'+(F.modo==='amb')+'">Ambos</button><button data-p="tri">Trilha daqui…</button><button data-p="limpa">Limpar</button></div>';
    if(F.res){var q=lista(F.res);h+='<p>'+(F.modo==='jus'?'A jusante (o que este elemento alimenta)':F.modo==='mon'?'A montante (o que alimenta este elemento)':'Montante e jusante')+': '+(q.length-1)+' elementos e '+Object.keys(F.res.eds).length+' ligações.</p>'}
    if(ev.length)h+='<p><b>Arquivos no repositório</b></p>'+ev.map(function(p){return '<code>'+esc(p)+'</code>'}).join('');else h+='<p><i>Sem arquivo de evidência ligado a este elemento.</i></p>'}
  pn.innerHTML=h;pn.hidden=false;aplicaFoco()}
function iniciaFoco(){
  var d0=desenha;desenha=function(){if(F.skin!==S.skin){F.skin=S.skin;F.sel=F.modo=F.ini=F.fim=F.res=null;F.cam=[];var pn=document.getElementById('pn');if(pn)pn.hidden=true}d0();aplicaFoco()};
  elCena.addEventListener('click',function(e){if(S.edit)return;var nd=e.target.closest('.nd');if(!nd)return;var id=nd.dataset.id;
    if(F.ini&&!F.fim){if(id===F.ini)return;F.fim=id;F.cam=caminhos(F.ini,F.fim);F.idx=0;F.res=resTrilha(F.cam[0]);painel();return}
    F.sel=id;F.modo=null;F.res=null;F.ini=F.fim=null;painel()});
  document.getElementById('pn').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var k=b.dataset.p;
    if(k==='x'||k==='limpa'){limpaFoco();return}
    if(k==='jus'||k==='mon'||k==='amb'){F.modo=k;F.res=alcance(F.sel,k);painel();return}
    if(k==='tri'){F.ini=F.sel;F.sel=null;F.res=null;F.fim=null;painel();return}
    if(k==='nova'){F.sel=F.ini;F.ini=F.fim=null;F.res=null;F.cam=[];painel();return}
    if(k&&k.charAt(0)==='c'){F.idx=+k.slice(1);F.res=resTrilha(F.cam[F.idx]);painel()}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')limpaFoco()})}
"""
rep('/* ============================== INICIO ============================== */', JS.replace('__EVID__', json.dumps(EVID, ensure_ascii=False)).replace('__IMPL__', json.dumps(IMPL)) + '\n/* ============================== INICIO ============================== */')
rep("carregaLocal();tooltip();iniciaInteracao();", "carregaLocal();tooltip();iniciaInteracao();iniciaFoco();")
rep("'Passe o mouse (ou toque) nas figuras e nas linhas para ver os detalhes.'", "'Passe o mouse nas figuras e nas linhas para ver os detalhes. Clique num elemento para ver o alcance, a trilha e os arquivos.'")
open(dst, 'w', encoding='utf-8').write(s)
print('gerado:', dst, len(s), 'bytes')
