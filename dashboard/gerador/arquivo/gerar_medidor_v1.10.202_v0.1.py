#!/usr/bin/env python3
"""14/11/2026 - Gera medidor_gerador_v1.10.202.html (de 1.10.201). Nao sobrescreve; aborta se um trecho esperado mudou.
Pedido do Reginaldo: manter "Dados do ensaio" ORIGINAL e criar uma SEGUNDA OPCAO dentro do mesmo dialogo: "Por no de serie (MES)".
O NS (ETD 091 / ETD 094) e decodificado e preenche Motor, Alternador e Controlador (editaveis; o que o operador muda fica marcado).
Modo padrao = Manual/print do SAP, identico ao original. Cola inline o decodifica_serie_mwm_v0.1.js (o medidor e um arquivo so).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.202_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); MF, FE = os.path.join(R, 'dashboard', 'modulos-fonte'), os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)

CSS = """<style id="dns-css">
/* v1.10.202: opcao "Por no de serie (MES)" dos Dados do ensaio. Nada muda no modo Manual. Sem ::after absoluto; hover nao muda tamanho (LL-046/047). */
#dlgDados .dmodo{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;margin:0 0 10px;padding:8px 12px;border:1px solid var(--jazul,#2b6cb0);border-radius:8px}
#dlgDados .dmodo .dmodo-t{font-weight:600;font-size:12.5px}
#dlgDados .dmodo label{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;cursor:pointer}
#dlgDados .dnsbox{margin:0 0 10px;padding:8px 12px;border-left:4px solid var(--jazul,#2b6cb0);background:rgba(43,108,176,.07);font-size:13px;line-height:1.45}
#dlgDados .dnsbox[hidden]{display:none}
#dlgDados .dnsbox .dns-ok{font-weight:600}
#dlgDados .dnsbox .dns-av{color:#9a6700}
#dlgDados .dnsbox .dns-er{color:#b42318;font-weight:600}
#dlgDados .dnsbox .dns-alt-l{color:#1f4fbf}
#dlgDados.dns-ns .sapimp{display:none}
.jan input.dns-alt{outline:2px solid #3b6fd8;background:#eaf0ff}
</style>
"""

MODO_HTML = """    <div class="jb">
      <div class="dmodo" id="dModoBox" role="radiogroup" aria-label="Origem dos Dados do ensaio">
        <span class="dmodo-t">Origem dos dados:</span>
        <label><input type="radio" name="dModo" value="manual" checked> Manual / print do SAP (original)</label>
        <label><input type="radio" name="dModo" value="ns"> Por nº de série (MES)</label>
      </div>
      <div class="dnsbox" id="dNsBox" hidden></div>
      <div class="dcols">
"""

JS = r"""<script>
/* =====================================================================================================================
   dados_ensaio_ns_v0.1 (colado inline no medidor 1.10.202) — SEGUNDA OPCAO dos "Dados do ensaio": Por nº de série (MES)  ·  14/11/2026
   PARA QUE SERVE (leigo): o operador escolhe "Por nº de série (MES)", digita ou le o NS (ex.: DTMFØ4447) e a tela preenche sozinha
   Motor, Alternador e Controlador. Tudo continua editavel; o que o operador mudar fica com contorno azul e e contado no aviso.
   Potencia, tensao, frequencia, temperatura e versao NAO vem do NS: continuam digitados (ou do catalogo do DSE).
   O modo "Manual / print do SAP" e o PADRAO e nao muda nada. Ao fechar o dialogo, volta para Manual.
   COMO: usa MWM_SERIE.decodificaSerie (norma ETD 091 rev.05 gerador, ETD 094 rev.00 torre). So preenche quando o NS e valido.
   NS novo valido => preenche de novo (zera as marcas). Mesmo NS => nao sobrescreve a edicao do operador.
   NAO FAZ: nao comanda nada, nao fala com PLC/DSE/MES, nao grava no registro (isso vem com o fluxo de registro novo).
   ===================================================================================================================== */
(function(){
  'use strict';
  const dlg=document.getElementById('dlgDados'); if(!dlg||!window.MWM_SERIE)return;
  const $g=id=>document.getElementById(id), box=$g('dNsBox');
  let modo='manual', aplicado='', base={};       // base: {chave 'r|c' -> valor que o NS pôs}
  let ultimo=null;                               // último resultado do decodificador (para o registro futuro)
  const NOMES={Motor:0,Alternador:1,Controlador:2};
  const inpEq=(nome,c)=>{ const i=(DADOS.equip||[]).findIndex(r=>r[0]===nome); return i<0?null:$g('dEquip').querySelector('input[data-r="'+i+'"][data-c="'+c+'"]'); };
  function fabMod(cat,desc){ // converte a descrição da tabela da norma em [fabricante, modelo]
    if(/^Sem /i.test(desc))return ['-','-'];
    if(cat==='motor'){ const p=desc.split(' · '); if(/^S[ée]rie/i.test(p[0]))return ['MWM',desc]; return [p[0],p.slice(1).join(' · ')||'-']; }
    if(cat==='alt')return [desc,'-'];
    let m=/^Deep Sea (\d+)/i.exec(desc); if(m)return ['DEEP SEA','DSE '+m[1]];
    m=/^Deif (.+)/i.exec(desc); if(m)return ['DEIF',m[1]];
    return [desc,'-'];
  }
  function limpaMarcas(){ dlg.querySelectorAll('.dns-alt').forEach(e=>{e.classList.remove('dns-alt');e.removeAttribute('title')}); base={}; }
  function atualizaMarcas(){ // compara cada campo com o que o NS pôs; marca os alterados
    let n=0, nomes=[];
    Object.keys(base).forEach(k=>{ const [r,c]=k.split('|'); const el=$g('dEquip').querySelector('input[data-r="'+r+'"][data-c="'+c+'"]'); if(!el)return;
      const alt=el.value.trim()!==base[k]; el.classList.toggle('dns-alt',alt); if(alt){n++;el.title='Alterado em relação ao NS (o NS indicava: '+base[k]+')'}else el.removeAttribute('title'); if(alt)nomes.push((DADOS.equip[+r]||[])[0]+' '+(+c===1?'fabricante':'modelo')); });
    const l=box.querySelector('.dns-alt-l'); if(l)l.textContent=n?('Alterados em relação ao NS ('+n+'): '+nomes.join(', ')+'.'):'';
  }
  function linha(cls,txt){ const d=document.createElement('div'); if(cls)d.className=cls; d.textContent=txt; box.appendChild(d); return d; }
  function mostra(r){ // painel com o resultado da decodificação (só textContent: o NS é texto digitado)
    box.hidden=false; box.textContent='';
    if(!r){ linha('','Digite ou leia o nº de série do MES no campo "Nº de série". Motor, Alternador e Controlador serão preenchidos (e continuam editáveis).'); return; }
    if(!r.valido){ linha('dns-er','Nº de série não reconhecido: '+r.erros.join(' ')); r.avisos.forEach(a=>linha('dns-av',a)); return; }
    const t=r.tipo==='gerador'?'Gerador':'Torre de iluminação';
    linha('dns-ok',t+' · '+r.norma+' · nº sequencial '+r.sequencial);
    if(r.combustivel)linha('','Combustível: '+r.combustivel.descricao);
    if(r.fonteEnergia)linha('','Fonte de energia: '+r.fonteEnergia.descricao);
    linha('','Motor: '+(r.motor.descricao||('letra '+r.motor.codigo+' (desconhecida)'))+' · Alternador: '+(r.alternador.descricao||('letra '+r.alternador.codigo+' (desconhecida)'))+(r.controlador?' · Controlador: '+(r.controlador.descricao||('letra '+r.controlador.codigo+' (desconhecida)')):''));
    r.avisos.forEach(a=>linha('dns-av','⚠ '+a));
    linha('dns-alt-l','');
  }
  function aplica(r){ // põe o que o NS diz na tabela de equipamento e guarda a base para marcar alterações
    limpaMarcas();
    const itens=[['Motor','motor',r.motor],['Alternador','alt',r.alternador]]; if(r.controlador)itens.push(['Controlador','ctrl',r.controlador]);
    itens.forEach(([nome,cat,cp])=>{ if(!cp||!cp.conhecido)return; const fm=fabMod(cat,cp.descricao);
      [1,2].forEach((c,k)=>{ const el=inpEq(nome,c); if(!el)return; el.value=fm[k]; base[el.dataset.r+'|'+c]=fm[k]; }); });
  }
  function decodifica(){
    if(modo!=='ns')return;
    const txt=$g('dServ').value; const n=window.MWM_SERIE.normaliza(txt);
    if(!n){ aplicado=''; ultimo=null; window.__NS_DECOD=null; limpaMarcas(); mostra(null); return; }
    const r=window.MWM_SERIE.decodificaSerie(txt);
    ultimo=r; window.__NS_DECOD=r;
    mostra(r);
    if(r.valido&&n!==aplicado){ aplicado=n; aplica(r); mostra(r); }
    atualizaMarcas();
  }
  function setModo(m){
    modo=m; dlg.classList.toggle('dns-ns',m==='ns'); dlg.dataset.dadosModo=m;
    const rd=dlg.querySelector('input[name=dModo][value='+m+']'); if(rd)rd.checked=true;
    if(m==='ns'){ aplicado=''; decodifica(); }
    else { box.hidden=true; box.textContent=''; limpaMarcas(); aplicado=''; ultimo=null; window.__NS_DECOD=null; }
  }
  dlg.querySelectorAll('input[name=dModo]').forEach(r=>r.addEventListener('change',()=>{ if(r.checked)setModo(r.value); }));
  $g('dServ').addEventListener('input',decodifica);
  $g('dEquip').addEventListener('input',()=>{ if(modo==='ns')atualizaMarcas(); });
  ['dLimpa','dRepete','dPadrao'].forEach(id=>{ const b=$g(id); if(b)b.addEventListener('click',()=>{ if(modo==='ns'){ limpaMarcas(); aplicado=''; decodifica(); } }); }); // roda depois do clique original: o NS (se válido) preenche de novo
  dlg.addEventListener('close',()=>{ if(modo!=='manual')setModo('manual'); }); // fechou: volta ao original
  window.DADOS_ENSAIO_NS={ modo:()=>modo, decodificado:()=>ultimo };
})();
</script>
"""

def medidor():
    o, d = os.path.join(FE, 'medidor_gerador_v1.10.201.html'), os.path.join(FE, 'medidor_gerador_v1.10.202.html'); assert os.path.exists(o) and not os.path.exists(d)
    t = open(o, encoding='utf-8').read()
    dec = open(os.path.join(MF, 'decodifica_serie_mwm_v0.1.js'), encoding='utf-8').read()
    assert '</script>' not in dec
    t = troca(t, '<meta name="app-version" content="1.10.201">', '<meta name="app-version" content="1.10.202">', 'meta')
    t = troca(t, "const VERSAO='1.10.201', VERSAO_DATA='13/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.202', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.202\",d:\"14/11/2026\",i:[\n"
              "    'DADOS DO ENSAIO — SEGUNDA OPÇÃO \"Por nº de série (MES)\" (pedido do Reginaldo): no topo do diálogo Dados do ensaio há agora o seletor \"Origem dos dados\". \"Manual / print do SAP (original)\" é o padrão e continua idêntico. \"Por nº de série (MES)\": digite ou leia o NS (geradores ETD 091 rev.05, 9 caracteres; torres ETD 094 rev.00, 8 caracteres; o Ø vale 0 e os * do código de barras são ignorados) e a tela preenche Motor, Alternador e Controlador. Tudo continua editável: o que você mudar fica com contorno azul e é contado no aviso. Letra que a norma não lista não trava: aparece como desconhecida e o campo fica para digitar. Potência, tensão, frequência, temperatura e versão continuam digitados. Ao fechar o diálogo, volta para Manual. Ainda não grava no registro (virá com o fluxo de registro novo).'\n  ]},\n", 'hist')
    t = troca(t, '    <div class="jb">\n      <div class="dcols">\n        <div class="dcl">\n          <div class="sapimp">', MODO_HTML + '        <div class="dcl">\n          <div class="sapimp">', 'modo')
    marca = '</script>\n<script>\n/* v1.9.97: PÁGINAS EMBUTIDAS'
    t = troca(t, marca, '</script>\n' + CSS + '<script>\n' + dec + '\n</script>\n' + JS + '<script>\n/* v1.9.97: PÁGINAS EMBUTIDAS', 'script')
    open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.202.html ok')
if __name__ == '__main__': medidor()
