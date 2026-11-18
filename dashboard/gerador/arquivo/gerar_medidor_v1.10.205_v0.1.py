#!/usr/bin/env python3
"""14/11/2026 - Gera medidor_gerador_v1.10.205.html (de 1.10.204). Nao sobrescreve; aborta se um trecho esperado mudou.
Fluxo MESCLADO pedido pelo Reginaldo: MES -> decifrador (so as normas) preenche Motor/Alternador/Controlador -> operador busca o modelo no catalogo (frequencia, tensao, potencia, controlador) -> o que faltar e digitado.
Mudancas: (1) decodificador v0.3 ESTRITO (sem a tolerancia do 'S' da v0.2); NS fora da norma nao preenche nada e a tela diz para preencher a mao.
(2) ORIGEM de cada campo na tela (NS = barra azul, catalogo = barra verde, digitado = sem barra) com legenda; regra de precedencia: quem rodar por ultimo vence; mexer a mao tira a marca.
(3) Aviso quando o catalogo (sempre Deep Sea) contraria o controlador indicado pelo NS (ex.: NS diz Deif AGC150).
So atua no modo "Por no de serie (MES)"; o modo Manual continua identico ao original.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.205_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); MF, FE = os.path.join(R, 'dashboard', 'modulos-fonte'), os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)

CSS = """#dlgDados .dnsbox .dns-leg{margin-top:4px;font-size:12px}
#dlgDados .dnsbox .dns-leg b.n{color:#3b6fd8}
#dlgDados .dnsbox .dns-leg b.c{color:#2e8b57}
.jan input.dns-o-ns{box-shadow:inset 4px 0 0 #3b6fd8}
.jan input.dns-o-cat{box-shadow:inset 4px 0 0 #2e8b57}
"""

JS = r"""  // v1.10.205: ORIGEM de cada campo (NS / catálogo) e regra de precedência: quem rodar por último vence; mexer à mão tira a marca. Só no modo "Por nº de série".
  const ORIG={}; let conflito='';
  const chave=el=>el.id||('eq'+el.dataset.r+'_'+el.dataset.c);
  const camposOrig=()=>[...$g('dEquip').querySelectorAll('input'),$g('dFreq'),$g('dTens'),$g('dPot')];
  function pintaOrigem(){
    let nn=0,nc=0;
    camposOrig().forEach(el=>{ el.classList.remove('dns-o-ns','dns-o-cat'); const o=modo==='ns'?ORIG[chave(el)]:null;
      if(o&&el.value.trim()!==''){ el.classList.add('dns-o-'+o); if(o==='ns')nn++; else nc++; if(!el.classList.contains('dns-alt'))el.title='Origem: '+(o==='ns'?'nº de série (MES)':'busca de modelo (catálogo)'); }
      else if(!el.classList.contains('dns-alt')&&/^Origem: /.test(el.title))el.removeAttribute('title'); });
    box.querySelectorAll('.dns-leg,.dns-conf').forEach(e=>e.remove());
    if(modo!=='ns'||box.hidden)return;
    if(conflito){ const c=document.createElement('div'); c.className='dns-av dns-conf'; c.textContent='⚠ '+conflito; box.appendChild(c); }
    const l=document.createElement('div'); l.className='dns-leg'; l.appendChild(document.createTextNode('Origem dos campos: '));
    const mk=(cls,t)=>{ const b=document.createElement('b'); b.className=cls; b.textContent=t; l.appendChild(b); };
    mk('n','■ NS ('+nn+')'); l.appendChild(document.createTextNode(' · ')); mk('c','■ catálogo ('+nc+')'); l.appendChild(document.createTextNode(' · sem barra = digitado. O que faltar, preencha à mão.')); box.appendChild(l);
  }
  const fich0=window.fichaModelo;   // o catálogo termina sempre chamando fichaModelo: é o gancho para marcar o que ele preencheu
  if(typeof fich0==='function')window.fichaModelo=function(d){
    const r=fich0.apply(this,arguments);
    if(modo==='ns'&&d){
      ['dFreq','dTens','dPot'].forEach(id=>{ if($g(id).value.trim()!=='')ORIG[id]='cat'; });
      [1,2].forEach(c=>{ const el=inpEq('Controlador',c); if(el&&el.value.trim()!=='')ORIG[chave(el)]='cat'; });
      conflito=''; const u=ultimo;
      if(u&&u.valido&&u.controlador&&u.controlador.conhecido&&!/^Deep Sea/i.test(u.controlador.descricao))conflito='O nº de série indica o controlador "'+u.controlador.descricao+'", mas o modelo do catálogo é Deep Sea. O campo ficou com o do catálogo: confira.';
      atualizaMarcas(); pintaOrigem();
    }
    return r;
  };
  dlg.addEventListener('input',e=>{ if(modo!=='ns'||!e.isTrusted)return; const t=e.target; // digitação real do operador = campo passa a ser "digitado"
    if(t===$g('dFreq')||t===$g('dTens')||t===$g('dPot'))delete ORIG[t.id]; else if(t.closest&&t.closest('#dEquip'))delete ORIG[chave(t)]; else return; pintaOrigem(); });
"""

def medidor():
    o, d = os.path.join(FE, 'medidor_gerador_v1.10.204.html'), os.path.join(FE, 'medidor_gerador_v1.10.205.html'); assert os.path.exists(o) and not os.path.exists(d)
    t = open(o, encoding='utf-8').read()
    v2 = open(os.path.join(MF, 'decodifica_serie_mwm_v0.2.js'), encoding='utf-8').read(); v3 = open(os.path.join(MF, 'decodifica_serie_mwm_v0.3.js'), encoding='utf-8').read()
    t = troca(t, v2, v3, 'decodificador')
    t = troca(t, '<meta name="app-version" content="1.10.204">', '<meta name="app-version" content="1.10.205">', 'meta')
    t = troca(t, "const VERSAO='1.10.204', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.205', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.205\",d:\"14/11/2026\",i:[\n"
              "    'DADOS DO ENSAIO, FLUXO MESCLADO (pedido do Reginaldo): 1) o nº de série do MES é decifrado só pelas normas (ETD 091 rev.05 gerador, 9 caracteres; ETD 094 rev.00 torre, 8) e preenche Motor, Alternador e Controlador; 2) o operador usa a busca de modelo (catálogo), que preenche frequência, tensão, potência e controlador; 3) o que faltar é digitado. A tolerância da 1.10.204 (aceitar S na frente) foi REMOVIDA: NS fora da norma não preenche nada e a tela manda preencher à mão.'\n"
              "    ,'Cada campo mostra de onde veio: barra azul = nº de série, barra verde = catálogo, sem barra = digitado (legenda no quadro do NS). Quem rodar por último vence; mexer à mão tira a marca. Se o catálogo (sempre Deep Sea) contrariar o controlador do NS (ex.: Deif AGC150), aparece um aviso. Só vale no modo \"Por nº de série (MES)\"; o modo Manual continua idêntico.'\n  ]},\n", 'hist')
    t = troca(t, '#dlgDados.dns-ns .sapimp{display:none}\n', '#dlgDados.dns-ns .sapimp{display:none}\n' + CSS, 'css')
    t = troca(t, "if(!r.valido){ linha('dns-er','Nº de série não reconhecido: '+r.erros.join(' ')); r.avisos.forEach(a=>linha('dns-av',a)); return; }",
              "if(!r.valido){ linha('dns-er','Nº de série não reconhecido: '+r.erros.join(' ')); r.avisos.forEach(a=>linha('dns-av',a)); linha('','Nenhum campo foi preenchido pelo NS. Use a busca de modelo ou preencha à mão.'); return; }", 'invalido')
    # origem dos campos preenchidos pelo NS
    t = troca(t, "el.value=fm[k]; base[el.dataset.r+'|'+c]=fm[k]; }); });\n  }", "el.value=fm[k]; base[el.dataset.r+'|'+c]=fm[k]; ORIG[chave(el)]='ns'; }); });\n    conflito='';\n  }", 'aplica')
    t = troca(t, "    modo=m; dlg.classList.toggle('dns-ns',m==='ns'); dlg.dataset.dadosModo=m;\n", "    modo=m; dlg.classList.toggle('dns-ns',m==='ns'); dlg.dataset.dadosModo=m; Object.keys(ORIG).forEach(k=>delete ORIG[k]); conflito='';   // v1.10.205: trocar de modo zera a origem dos campos\n", 'setmodo0')
    t = troca(t, "b.addEventListener('click',()=>{ if(modo==='ns'){ limpaMarcas(); aplicado=''; decodifica(); } });", "b.addEventListener('click',()=>{ if(modo==='ns'){ Object.keys(ORIG).forEach(k=>delete ORIG[k]); conflito=''; limpaMarcas(); aplicado=''; decodifica(); } });", 'botoes')
    t = troca(t, "    atualizaMarcas();\n  }\n  function setModo(m){", "    atualizaMarcas(); pintaOrigem();\n  }\n  function setModo(m){", 'decod')
    t = troca(t, "    else { box.hidden=true; box.textContent=''; limpaMarcas(); aplicado=''; ultimo=null; window.__NS_DECOD=null; }\n  }",
              "    else { box.hidden=true; box.textContent=''; limpaMarcas(); aplicado=''; ultimo=null; window.__NS_DECOD=null; pintaOrigem(); }\n  }", 'setmodo')
    # ORIG/conflito/pintaOrigem precisam existir antes de limpaMarcas ser chamada: declara junto das variaveis de estado do modulo
    t = troca(t, "  let ultimo=null;                               // último resultado do decodificador (para o registro futuro)\n",
              "  let ultimo=null;                               // último resultado do decodificador (para o registro futuro)\n  const ORIG={}; let conflito='';                // v1.10.205: origem de cada campo ('ns'|'cat') e aviso de conflito NS x catálogo\n", 'estado')
    jsx = JS.replace("  const ORIG={}; let conflito='';\n", '')
    t = troca(t, "  // v1.10.203: ao confirmar (fase de captura", jsx + "  // v1.10.203: ao confirmar (fase de captura", 'js')
    open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.205.html ok')
if __name__ == '__main__': medidor()
