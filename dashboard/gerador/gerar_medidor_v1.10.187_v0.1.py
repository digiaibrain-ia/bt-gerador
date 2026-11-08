#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.187.html a partir da v1.10.186 (nao sobrescreve; aborta se um trecho esperado mudou).
Relato do Reginaldo (08/11/2026, Monkey no Poco, arquivo aberto de Downloads = content://): o Monkey TERMINOU ("concluido", 03:01, 6 OK / 0 falha / 1 aviso), mas
 (a) os botoes Copiar e ✕ da barra ficaram FORA da tela (a barra media 477 px numa tela de 406) e
 (b) um minuto depois a aba mostrou ERR_FILE_NOT_FOUND: um arquivo aberto de Downloads (content://) nao pode ser recarregado (o Android perde a permissao) e o Chrome recarrega a aba
     descartada por falta de memoria (38 abas abertas) -> o relatorio se perdia.
Correcao: (1) barra em celular quebra linha: titulo em cima, botoes embaixo, tudo dentro da largura; (2) ao terminar, o relatorio e BAIXADO sozinho como arquivo .md (vai para Downloads,
a prova de aba descartada), alem de ficar no balao / Central / window.name.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.187_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.186.html', 'medidor_gerador_v1.10.187.html'
CSS = """
  /* v1.10.187: barra do robô cabe no celular (título em cima, botões embaixo) */
  @media (max-width:700px){
    #opsBar{flex-wrap:wrap;row-gap:6px;max-width:calc(100vw - 8px);box-sizing:border-box}
    #opsBar .opsTxt{flex:1 1 55%;min-width:120px;order:1}
    #opsBar .opsGrip{order:0}
    #opsBar .opsCron{order:2}#opsBar .opsCnt{order:3}
    #opsBar #opsMin,#opsBar #opsParar,#opsBar .fimOnly{order:4}
    #opsBar .opsTit{font-size:12px}
  }
"""


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.186">', '<meta name="app-version" content="1.10.187">', 'meta')
    t = troca(t, "const VERSAO='1.10.186', VERSAO_DATA='08/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.187', VERSAO_DATA='08/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.187\",d:\"08/11/2026\",i:[\n"
              "    'Dev/Operador oculto no celular: a barra agora cabe na largura (os botões Copiar e ✕ ficavam fora da tela) e, ao terminar, o relatório é BAIXADO sozinho como arquivo .md (vai para Downloads) — arquivo aberto de Downloads (content://) não pode ser recarregado se o Android descartar a aba.',\n"
              "  ]},\n", 'historico')
    t = troca(t, '  #opsBar .opsCnt{font-variant-numeric:tabular-nums;white-space:pre}', '  #opsBar .opsCnt{font-variant-numeric:tabular-nums;white-space:pre}' + CSS, 'css')
    t = troca(t, "if(!OPS.rodando)salvoFim=true}",
              "if(!OPS.rodando){salvoFim=true;try{const nm=((PERS&&0)||(document.getElementById('opsDisp')||{}).value||'dispositivo').replace(/[^\\w\\-]+/g,'_'),d=new Date(),dt=d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2)+'_'+('0'+d.getHours()).slice(-2)+('0'+d.getMinutes()).slice(-2),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([o.md],{type:'text/markdown'}));a.download='dev_operador_oculto_'+nm+'_'+dt+'.md';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000)}catch(e){}}}", 'baixa')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
