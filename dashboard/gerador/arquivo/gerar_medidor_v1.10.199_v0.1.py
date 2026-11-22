#!/usr/bin/env python3
"""10/11/2026 - gera medidor_gerador_v1.10.199.html a partir da 1.10.198 (nao sobrescreve; aborta se um trecho esperado mudou).
Pedido do Reginaldo: o Dev/Operador oculto passa a fazer INSPECAO VISUAL DE DESIGN, porque quebras de visao (card que se desloca, balao que empurra, objeto travado depois do ensaio) atrapalham o operador e o Dev.
Novo no robo (modo Avancado e Rapido), SO LEITURA:
 (1) LAYOUT ESTAVEL AO FOCAR/PASSAR O MOUSE: antes de acionar cada objeto, tira uma "foto" do layout (posicao e tamanho dos paineis, colunas, cards e area de rolagem), foca o objeto e dispara mouseover, mede de novo
     e devolve o estado. Se algo mudou = FALHA "layout muda ao passar o mouse/focar" (com o que mudou). Se aparecer o balao (#ibubTip) fora da tela = AVISO. (CSS :hover real so o navegador de teste faz: o robo cobre :focus e eventos.)
 (2) ESTADO PÓS-ENSAIO: no ciclo completo (Rapido) guarda quais botoes da tela principal estao habilitados antes de INICIAR e, depois de "Gravar sem relatorio", confere que nenhum ficou DESABILITADO (e que os chips do Patamar
     voltaram a poder ser escolhidos). Diferenca = FALHA "ficou desabilitado depois de gravar".
Novo modo "Inspecao visual (rapida)" no popup do robo (so as inspecoes de design, sem clicar: ~1 min) e em opSecreto.rodarAv({tipo:'visual'}).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.199_v0.1.py"""
import os
P = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')), 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
FUNCOES = r'''
  /* ---------- v1.10.199: INSPEÇÃO VISUAL DE DESIGN (só leitura) ---------- */
  const fotoLayout=()=>[...document.querySelectorAll('section.panel,.col,.card,.hrow')].filter(e=>e.offsetParent).map(e=>{const r=e.getBoundingClientRect();return[(e.id||e.className||e.tagName).toString().slice(0,26),Math.round(r.top),Math.round(r.left),Math.round(r.width),Math.round(r.height)]}).concat([['rolagem',document.documentElement.scrollWidth,document.documentElement.scrollHeight,0,0]]);
  const difLayout=(a,b)=>{const out=[];const n=Math.max(a.length,b.length);for(let i=0;i<n;i++){const x=a[i]||[],y=b[i]||[];if(x.join()!==y.join())out.push((x[0]||y[0])+': '+x.slice(1).join(',')+' → '+y.slice(1).join(','))}return out};
  async function inspecionaLayout(el,obj,fase){ // foca/passa o mouse no objeto e confere que NADA se mexeu; devolve ao estado de antes
    try{
      const f0=fotoLayout();
      try{el.focus({preventScroll:true})}catch(e){}
      ['pointerover','mouseover'].forEach(t=>{try{el.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,view:window}))}catch(e){}});
      await pausa(180);
      const f1=fotoLayout(),d=difLayout(f0,f1),tip=document.getElementById('ibubTip');
      if(tip&&getComputedStyle(tip).display!=='none'){const q=tip.getBoundingClientRect();if(q.left<0||q.top<0||q.right>innerWidth||q.bottom>innerHeight)aviso(fase,'balão fora da tela: '+obj,Math.round(q.left)+','+Math.round(q.top)+' '+Math.round(q.width)+'×'+Math.round(q.height)+' na tela '+innerWidth+'×'+innerHeight)}
      ['pointerout','mouseout'].forEach(t=>{try{el.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,view:window}))}catch(e){}});try{el.blur()}catch(e){}
      await pausa(60);AV.insp=(AV.insp||0)+1;
      if(d.length){AV.inspRuim=(AV.inspRuim||0)+1;achou(fase,'layout muda ao passar o mouse/focar: '+obj,d.slice(0,4).join(' · ')+(d.length>4?' · …+'+(d.length-4):'')+' (tela '+innerWidth+'×'+innerHeight+')')}
    }catch(e){}
  }
  async function faseVisual(){ // modo "Inspeção visual (rápida)": só olha (foca/passa o mouse), não clica; página principal + janela ⚙ Modo
    const F='V · Inspeção visual';AV.insp=0;AV.inspRuim=0;
    const insp=async(esc)=>{const raiz=esc?$(esc):document;   // objetos clicáveis + PORTADORES DE BALÃO (ⓘ, chips com data-tip), que não são botões e por isso ficavam de fora
      const bal=[...raiz.querySelectorAll('.ibub,#modoCard .lk,[data-tip]')].filter(e=>vis(e)&&(esc?e.closest('dialog')===raiz:(!e.closest('dialog')||e.closest('dialog').id==='dlgGuiado'))&&!dentroDe(e,'#opsBar,#opsBox,#dlgDemo'));
      const vistos=new Set();for(const el of [...enumera(esc),...bal]){if(OPS.parar)throw ABORT;if(vistos.has(el))continue;vistos.add(el);if(!document.contains(el)||el.disabled)continue;const s=sonda(el);if(!s.dentro||s.oculto||!s.ok)continue;await inspecionaLayout(el,(esc?'['+esc+'] ':'')+idEl(el)+' "'+nomeEl(el)+'"',F)}};
    await insp('');
    const g=$('bModo');if(g&&vis(g)){clica(g,'abrir ⚙ Modo');await pausa(300);if($('dlgModo').open){await insp('dlgModo');fecharTudo();await pausa(100)}}
    reg(AV.inspRuim?'falha':'ok',F,'objetos inspecionados',AV.insp+' objetos · '+(AV.inspRuim||0)+' com layout instável ao passar o mouse/focar');
  }
  const desabilitadosTela=()=>{const m=new Map();document.querySelectorAll('button,input:not([type=hidden]),select').forEach(e=>{if(!vis(e)||e.closest('dialog')&&e.closest('dialog').id!=='dlgGuiado'||dentroDe(e,'#opsBar,#opsBox'))return;m.set(idEl(e)+'|'+nomeEl(e),!!e.disabled)});return m};
'''
def main():
    o, d = os.path.join(P, 'medidor_gerador_v1.10.198.html'), os.path.join(P, 'medidor_gerador_v1.10.199.html'); assert os.path.exists(o) and not os.path.exists(d)
    t = open(o, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.198">', '<meta name="app-version" content="1.10.199">', 'meta')
    t = troca(t, "const VERSAO='1.10.198', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.199', VERSAO_DATA='11/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.199\",d:\"11/11/2026\",i:[\n"
              "    'Dev/Operador oculto: INSPEÇÃO VISUAL DE DESIGN (só leitura). (1) Para cada objeto, foca e passa o mouse e confere que nenhum card/painel/área de rolagem muda de posição ou tamanho (falha: \"layout muda ao passar o mouse/focar\"); avisa se um balão aparece fora da tela. (2) No ciclo completo, depois de \"Gravar sem relatório\" confere que nenhum botão ficou DESABILITADO (e que os chips do Patamar voltam a poder ser escolhidos).'\n  ]},\n", 'historico')
    t = troca(t, "  async function varre(escopoDlg,prof,gatilhoPai,fase){", FUNCOES + "  async function varre(escopoDlg,prof,gatilhoPai,fase){", 'funcoes')
    t = troca(t, "      const a0=estadoRapido();let ef='';\n      AV.ultimoObj=obj;", "      await inspecionaLayout(el,obj,fase);   // v1.10.199: inspeção visual de design antes de acionar\n      const a0=estadoRapido();let ef='';\n      AV.ultimoObj=obj;", 'varre')
    t = troca(t, "    passo('ensaio: simulação AUTO a 10×');", "    const dis0=desabilitadosTela();   // v1.10.199: estado dos botões antes do ensaio (para conferir o pós-ensaio)\n    passo('ensaio: simulação AUTO a 10×');", 'dis0')
    t = troca(t, "    // --- travas devem soltar\n    passo('ensaio: conferindo que as travas soltaram');\n    await pausa(500);\n",
              "    // --- travas devem soltar\n    passo('ensaio: conferindo que as travas soltaram');\n    await pausa(500);\n"
              "    {const dis1=desabilitadosTela(),novos=[];dis1.forEach((v,k)=>{if(v&&dis0.has(k)&&dis0.get(k)===false)novos.push(k.split('|')[1]||k.split('|')[0])});\n"
              "     chk(F,'depois de gravar nenhum botão da tela ficou DESABILITADO (estado de antes do ensaio)',novos.length===0,novos.slice(0,8).join(' · '));\n"
              "     const chips=[...document.querySelectorAll('#patCard button.gd-chip')];chk(F,'depois de gravar os chips de patamar voltam a poder ser escolhidos',chips.length===0||chips.every(c=>!c.disabled),chips.filter(c=>c.disabled).map(c=>c.textContent.trim()).join(' · '))}\n", 'posensaio')
    t = troca(t, "      }else{\n        OPS.fase='M · Monkey';ui();await preparaChaves();await estabilizaHabil();",
              "      }else if(tipo==='visual'){\n        OPS.fase='V · Inspeção visual';ui();document.querySelectorAll('#bancos details').forEach(d=>{d.open=true});await preparaChaves();await estabilizaHabil();await faseVisual();\n      }else{\n        OPS.fase='M · Monkey';ui();await preparaChaves();await estabilizaHabil();", 'ramo visual')
    t = troca(t, '<option value="monkey">Monkey (aleatório, com semente) — só Demo local</option></select>', '<option value="monkey">Monkey (aleatório, com semente) — só Demo local</option><option value="visual">Inspeção visual (rápida: só olha, não clica) — só Demo local</option></select>', 'option')
    t = troca(t, "else rodarAv({tipo:m==='monkey'?'monkey':'avancado',", "else rodarAv({tipo:m==='monkey'?'monkey':m==='visual'?'visual':'avancado',", 'mapeia')
    t = troca(t, "          await varre('',0,null,OPS.fase)}\n        if(fa('U2'))", "          await varre('',0,null,OPS.fase);await faseVisual()}   // v1.10.199: + inspeção visual de design (portadores de balão incluídos)\n        if(fa('U2'))", 'u1')
    open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.199.html ok')
if __name__ == '__main__': main()
