#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.189.html a partir da v1.10.188 (nao sobrescreve; aborta se um trecho esperado mudou).
Pedido do Reginaldo (08/11/2026, tablet): "arquivos de amostras estao sendo gerados no final do robo ... a mesma regra em todas as opcoes ... cancela qualquer impressao automatica no final do robo".
Causa provavel: a caixa de areia so bloqueava link que NAO abre em outra aba; o robo tocou em link do menu ☰ (target=_blank), abriu o Simulador de amostras em outra aba, que roda sozinho e
baixa amostras_sim_*.md/csv ao final. Alem disso o modo RAPIDO nem usava a caixa de areia, e a impressao automatica ao finalizar o ensaio (__autoImprime) nao era bloqueada.
Correcao: (1) a caixa de areia bloqueia TODO link que sai da pagina (inclusive target=_blank e download) e conta; (2) vale tambem no modo RAPIDO; (3) a impressao automatica (__autoImprime)
fica desligada enquanto o robo roda; (4) o download automatico do relatorio ao terminar (v1.10.187) foi REMOVIDO: agora so por botao (Baixar), a pedido.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.189_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.188.html', 'medidor_gerador_v1.10.189.html'


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.188">', '<meta name="app-version" content="1.10.189">', 'meta')
    t = troca(t, "const VERSAO='1.10.188', VERSAO_DATA='08/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.189', VERSAO_DATA='08/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.189\",d:\"08/11/2026\",i:[\n"
              "    'Dev/Operador oculto: nada é gerado, aberto ou impresso sozinho. A caixa de areia agora bloqueia TODO link que sai da página (inclusive os que abrem outra aba — era assim que o Simulador de amostras abria e baixava amostras_sim_*.md/csv no fim do robô), vale também no modo Rápido, e a impressão automática do fim do ensaio fica desligada enquanto o robô roda. O download automático do relatório (1.10.187) foi removido: agora só pelo botão Baixar da barra.',\n"
              "  ]},\n", 'historico')
    # (1) link bloqueado: todos (target=_blank, download, saida da pagina)
    t = troca(t, "if(a&&!/^#/.test(a.getAttribute('href')||'')&&!a.hasAttribute('download')&&a.target!=='_blank'){e.preventDefault();SB.c.navegacao++}",
              "if(a){if(a.hasAttribute('download')){e.preventDefault();SB.c.download++;return}if(!/^#/.test(a.getAttribute('href')||'')){e.preventDefault();if(a.target==='_blank')SB.c.janelaNova++;else SB.c.navegacao++}}", 'links')
    # (3) impressao automatica desligada durante o robo
    t = troca(t, "o.print=window.print;", "o.print=window.print;o.ai=window.__autoImprime;window.__autoImprime=function(){SB.c.print++};", 'liga ai')
    t = troca(t, "window.print=o.print;", "window.print=o.print;window.__autoImprime=o.ai;", 'desliga ai')
    # (4) tira o download automatico do relatorio
    i = t.index("if(!OPS.rodando){salvoFim=true;try{const nm="); j = t.index("setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}catch(e){}}}", i) + len("setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}catch(e){}}}")
    t = t[:i] + "if(!OPS.rodando)salvoFim=true}" + t[j:]
    # botao Baixar (so por toque do operador)
    t = troca(t, '<button type="button" id="opsBCop" class="fimOnly" title="Copia o relatório">Copiar</button>',
              '<button type="button" id="opsBCop" class="fimOnly" title="Copia o relatório">Copiar</button><button type="button" id="opsBBx" class="fimOnly" title="Baixa o relatório como arquivo .md (só quando você toca)">Baixar</button>', 'botao baixar')
    t = troca(t, "    if(cop)cop.onclick=copia;",
              "    if(cop)cop.onclick=copia;\n    const bx=$('opsBBx');if(bx)bx.onclick=()=>{try{const nm=(((document.getElementById('opsDisp')||{}).value)||'dispositivo').replace(/[^\\w\\-]+/g,'_'),d=new Date(),dt=d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2)+'_'+('0'+d.getHours()).slice(-2)+('0'+d.getMinutes()).slice(-2),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([textoRel()],{type:'text/markdown'}));a.download='dev_operador_oculto_'+nm+'_'+dt+'.md';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}catch(e){}};", 'handler baixar')
    # (2) modo Rapido tambem usa a caixa de areia
    t = troca(t, "    const est=snapEstado();\n    lg('info','Dev/Operador oculto: início',{modo,ensaio:ens,versao:VERSAO});", "    const est=snapEstado();sandboxLiga();\n    lg('info','Dev/Operador oculto: início',{modo,ensaio:ens,versao:VERSAO});", 'rapido liga')
    t = troca(t, "    await restaura(est);\n", "    await restaura(est);sandboxDesliga();\n", 'rapido desliga') if t.count("    await restaura(est);\n") == 1 else t
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
