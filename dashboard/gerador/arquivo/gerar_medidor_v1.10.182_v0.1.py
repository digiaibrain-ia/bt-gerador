#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.182.html a partir da v1.10.181 (nao sobrescreve; aborta se um trecho esperado mudou).
Relato do Reginaldo (07/11/2026, Monkey no celular): "iniciou, e depois de um tempo o balao do robo some. Nao sei se o teste acabou e nao tem como imprimir o log".
Causas possiveis: o teste terminou (ou foi interrompido) e a barra simplesmente se escondia, sem avisar; ou a pagina recarregou no meio do teste (no celular o navegador nao mostra o aviso de saida) e o relatorio se perdia.
Correcao: (1) ao terminar/interromper, a barra FICA na tela dizendo "concluido" ou "interrompido (motivo)", com a contagem e os botoes Relatorio / Copiar / Fechar;
(2) o relatorio e salvo no navegador a cada 4 s durante o teste; se a pagina recarregar, ao voltar a barra avisa "interrompido (a pagina recarregou)" e Copiar / Central de registros / Imprimir usam o relatorio salvo.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.182_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.181.html', 'medidor_gerador_v1.10.182.html'

DECL = r"""  /* ===== v1.10.182 · fim visível + relatório salvo no navegador ===== */
  const LSREL='bt2.dev.ultimoRel';let PERS=null;try{PERS=JSON.parse(localStorage.getItem(LSREL)||'null')}catch(e){}
  const FIMBAR={on:false,fechado:false,tit:'',msg:'',cnt:''};
  if(PERS&&PERS.rodando){FIMBAR.on=true;FIMBAR.tit='interrompido';FIMBAR.msg='a página recarregou ou fechou no meio do teste · último relatório salvo às '+new Date(PERS.t).toLocaleTimeString('pt-BR');FIMBAR.cnt='✔ '+((PERS.cnt||{}).ok||0)+'  ✖ '+((PERS.cnt||{}).falha||0)+'  ⚠ '+((PERS.cnt||{}).aviso||0)}
  const textoRel=()=>OPS.rel.length?relatorioAv():((PERS&&PERS.md)||'');
"""
CSS = """
  /* v1.10.182: barra do robô no fim do teste */
  #opsBar .fimOnly{display:none}
  #opsBar.fim .fimOnly{display:inline-block}
  #opsBar.fim #opsParar{display:none}
  #opsBar.fim{border-color:#2e7d32;background:#10281a}
  #opsBar.fim.bad{border-color:#b42318;background:#3a1210}
"""
BTN_VELHO = '<button type="button" id="opsMin" title="Recolher / abrir">–</button>'
BTN_NOVO = BTN_VELHO + '<button type="button" id="opsBRel" class="fimOnly" title="Abre o popup Demo com o relatório">Relatório</button><button type="button" id="opsBCop" class="fimOnly" title="Copia o relatório">Copiar</button><button type="button" id="opsBFim" class="fimOnly" title="Fechar este aviso">✕</button>'
LIGA = r"""
  (function(){ // v1.10.182: botões do fim, salvamento periódico do relatório e Central/Imprimir com o relatório salvo
    const rel=$('opsBRel'),cop=$('opsBCop'),fim=$('opsBFim');let salvoFim=false;
    if(rel)rel.onclick=()=>{try{$('bDemo').click()}catch(e){}};
    if(cop)cop.onclick=copia;
    if(fim)fim.onclick=()=>{FIMBAR.fechado=true;FIMBAR.on=false;ui()};
    setInterval(()=>{try{
      if(OPS.rodando){salvoFim=false;FIMBAR.on=false;FIMBAR.fechado=false}
      if(OPS.rodando||(OPS.fim&&!salvoFim&&OPS.rel.length)){const o={t:Date.now(),rodando:!!OPS.rodando,md:relatorioAv(),cnt:cont()};localStorage.setItem(LSREL,JSON.stringify(o));PERS=o;if(!OPS.rodando)salvoFim=true}
    }catch(e){}},4000);
    ui();
  })();
"""


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.181">', '<meta name="app-version" content="1.10.182">', 'meta')
    t = troca(t, "const VERSAO='1.10.181', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.182', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.182\",d:\"07/11/2026\",i:[\n"
              "    'Dev/Operador oculto: ao terminar ou ser interrompido, a barra do robô FICA na tela (\"concluído\" ou \"interrompido\" + motivo, contagem e botões Relatório / Copiar / ✕) em vez de sumir; o relatório é salvo no navegador a cada 4 s e, se a página recarregar no meio do teste, a barra avisa \"interrompido (a página recarregou)\" e Copiar / Central de registros / Imprimir usam o relatório salvo.',\n"
              "  ]},\n", 'historico')
    t = troca(t, '  #opsBar .opsCnt{font-variant-numeric:tabular-nums;white-space:pre}', '  #opsBar .opsCnt{font-variant-numeric:tabular-nums;white-space:pre}' + CSS, 'css')
    t = troca(t, BTN_VELHO, BTN_NOVO, 'botoes')
    t = troca(t, "  function ui(){\n    try{\n      const c=cont(),bar=$('opsBar')", DECL + "  function ui(){\n    try{\n      const c=cont(),bar=$('opsBar')", 'decl')
    t = troca(t, "        bar.hidden=!OPS.rodando;\n        if(OPS.rodando){\n          bar.querySelector('.opsTit').textContent='🕵️ Dev/Operador oculto · '+(OPS.fase||'…');\n          bar.querySelector('.opsPasso').textContent=OPS.passo||'';\n          bar.querySelector('.opsCnt').textContent='✔ '+c.ok+'  ✖ '+c.falha+'  ⚠ '+c.aviso;\n          bar.classList.toggle('bad',c.falha>0);",
              "        if(!OPS.rodando&&OPS.fim&&!FIMBAR.fechado&&!FIMBAR.on&&!(PERS&&PERS.rodando&&!OPS.rel.length)){FIMBAR.on=true;FIMBAR.tit=OPS.motivoAbort?'interrompido':'concluído';FIMBAR.msg=(OPS.motivoAbort||'fim normal')+' · '+hms(OPS.fim-OPS.ini)+' · toque em Relatório'}\n"
              "        const mostra=OPS.rodando||FIMBAR.on;bar.hidden=!mostra;bar.classList.toggle('fim',!OPS.rodando&&FIMBAR.on);\n        if(mostra){\n"
              "          bar.querySelector('.opsTit').textContent='🕵️ Dev/Operador oculto · '+(OPS.rodando?(OPS.fase||'…'):FIMBAR.tit);\n"
              "          bar.querySelector('.opsPasso').textContent=OPS.rodando?(OPS.passo||''):FIMBAR.msg;\n"
              "          bar.querySelector('.opsCnt').textContent=(!OPS.rodando&&!OPS.rel.length&&FIMBAR.cnt)?FIMBAR.cnt:'✔ '+c.ok+'  ✖ '+c.falha+'  ⚠ '+c.aviso;\n"
              "          bar.classList.toggle('bad',c.falha>0||(!OPS.rodando&&!OPS.rel.length&&/✖ [1-9]/.test(FIMBAR.cnt)));", 'ui')
    t = troca(t, "const md=relatorioAv();let ok=false,via='';", "const md=textoRel();let ok=false,via='';", 'copia')
    t = troca(t, "text:relatorioAv()", "text:textoRel()", 'share')
    t = troca(t, "md:relatorioAv,", "md:()=>textoRel(),", 'md export')
    t = troca(t, "  const sh=$('opsShare');if(sh){if(navigator.share)sh.hidden=false;sh.onclick=compartilha}", "  const sh=$('opsShare');if(sh){if(navigator.share)sh.hidden=false;sh.onclick=compartilha}" + LIGA, 'liga')
    t = troca(t, "const bc=$('opsCopia');if(bc)bc.disabled=!OPS.rel.length;", "const bc=$('opsCopia');if(bc)bc.disabled=!OPS.rel.length&&!(PERS&&PERS.md);", 'copia habilita')
    t = troca(t, "const r=rnd(),el=pick(lista);", "const r=rnd(),el=pick(lista);AV.ultimoObj='monkey: '+idEl(el)+' \"'+nomeEl(el)+'\"';", 'ultima acao monkey')
    t = troca(t, "const sbSai=e=>{SB.c.navegacao++;e.preventDefault();e.returnValue=''};", "const sbSai=e=>{SB.c.navegacao++;try{localStorage.setItem('bt2.dev.ultimaAcao',AV.ultimoObj||'')}catch(x){}e.preventDefault();e.returnValue=''};", 'ultima acao ao sair')
    t = troca(t, "FIMBAR.msg='a página recarregou ou fechou no meio do teste · último relatório salvo às '+new Date(PERS.t).toLocaleTimeString('pt-BR');", "FIMBAR.msg='a página recarregou ou fechou no meio do teste · último relatório salvo às '+new Date(PERS.t).toLocaleTimeString('pt-BR')+(function(){try{const u=localStorage.getItem('bt2.dev.ultimaAcao');return u?' · última ação antes de sair: '+u:''}catch(e){return ''}})();", 'msg ultima acao')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
