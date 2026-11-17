#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.178.html a partir da v1.10.177 (nao sobrescreve; aborta se um trecho esperado mudou).
Pedido do Reginaldo (07/11/2026): saber em QUE DISPOSITIVO o Dev/Operador oculto rodou (PC, notebook, tablet, celular), para rodar em cada um e comparar.
O relatorio agora traz: NOME do dispositivo (campo no popup Demo, guardado no navegador), TIPO provavel (celular/tablet/PC-notebook), tela (largura x altura, DPR),
zoom aproximado do navegador, entrada (toque/mouse) e o navegador. Um navegador NAO sabe se e PC ou notebook: por isso o nome digitado vale mais que o palpite.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.178_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.177.html', 'medidor_gerador_v1.10.178.html'

PERFIL_VELHO = "const p={larg:innerWidth,alt:innerHeight,dpr:+(devicePixelRatio||1).toFixed(2),toque:matchMedia('(pointer:coarse)').matches,ua:navigator.userAgent.slice(0,90)};"
PERFIL_NOVO = ("const toque=matchMedia('(pointer:coarse)').matches,menor=Math.min(screen.width||innerWidth,screen.height||innerHeight),movel=!!(navigator.userAgentData&&navigator.userAgentData.mobile)||/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);\n"
    "    let nome='';try{nome=(localStorage.getItem('bt2.dev.nomeDisp')||'').trim()}catch(e){}\n"
    "    const tipo=(toque&&(movel||menor<600))?'celular':(toque&&menor<1100?'tablet':(toque?'PC/notebook com tela de toque':'PC/notebook (o navegador não distingue)'));\n"
    "    const zoomNav=(outerWidth&&innerWidth)?Math.round(outerWidth/innerWidth*100):0;\n"
    "    const p={larg:innerWidth,alt:innerHeight,dpr:+(devicePixelRatio||1).toFixed(2),toque,ua:navigator.userAgent.slice(0,90),nome,tipo,zoomNav,telaFisica:(screen.width||0)+'×'+(screen.height||0)};")


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.177">', '<meta name="app-version" content="1.10.178">', 'meta')
    t = troca(t, "const VERSAO='1.10.177', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.178', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.178\",d:\"07/11/2026\",i:[\n"
              "    'Dev/Operador oculto: o relatório agora diz em que DISPOSITIVO rodou — nome (campo no popup Demo, guardado no navegador), tipo provável (celular/tablet/PC-notebook), tela, DPR, zoom aproximado do navegador, toque ou mouse. O navegador não sabe se é PC ou notebook: vale o nome digitado.',\n"
              "  ]},\n", 'historico')
    t = troca(t, PERFIL_VELHO, PERFIL_NOVO, 'perfil')
    t = troca(t, "reg('ok','Preparação','perfil da tela',p.larg+'×'+p.alt+' px · DPR '+p.dpr+(p.toque?' · toque':' · mouse')+' · '+p.ua);",
              "reg('ok','Preparação','dispositivo',(p.nome?'\"'+p.nome+'\" · ':'(sem nome — digite no popup Demo) · ')+p.tipo+' · zoom do navegador ≈ '+p.zoomNav+' %');\n    reg('ok','Preparação','perfil da tela',p.larg+'×'+p.alt+' px (tela física '+p.telaFisica+') · DPR '+p.dpr+(p.toque?' · toque':' · mouse')+' · '+p.ua);", 'reg')
    t = troca(t, "\\n- Tela: '+(AV.perfil.larg||'?')",
              "\\n- Dispositivo: '+(AV.perfil.nome||'(sem nome)')+' · '+(AV.perfil.tipo||'?')+' · zoom do navegador ≈ '+(AV.perfil.zoomNav||'?')+' %\\n- Tela: '+(AV.perfil.larg||'?')", 'md')
    # campo do nome no popup Demo (depois de "Minutos")
    i = t.index('id="opsDur"'); j = t.index('</label>', i) + len('</label>')
    campo = ('\n        <label style="display:flex;gap:6px;align-items:center;font-size:12px" title="Nome deste aparelho (ex.: Notebook DELL, Tablet sala, Poco do Reginaldo). Aparece no relatório. Fica guardado neste navegador.">Dispositivo <input type="text" id="opsDisp" maxlength="40" placeholder="ex.: Notebook DELL" style="width:150px"></label>')
    t = t[:j] + campo + t[j:]
    t = troca(t, "const ini=$('opsIni');if(ini)ini.onclick=()=>{",
              "const dsp=$('opsDisp');if(dsp){try{dsp.value=localStorage.getItem('bt2.dev.nomeDisp')||''}catch(e){}dsp.addEventListener('input',()=>{try{localStorage.setItem('bt2.dev.nomeDisp',dsp.value.trim())}catch(e){}})}\n  const ini=$('opsIni');if(ini)ini.onclick=()=>{", 'ini')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
