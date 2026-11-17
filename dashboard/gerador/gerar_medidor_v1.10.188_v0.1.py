#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.188.html a partir da v1.10.187 (nao sobrescreve; aborta se um trecho esperado mudou).
Relatorio do Monkey no Poco (08/11/2026, arquivo aberto de Downloads = content://, navegador "wv" = WebView): 1225 acoes, mas 5 FALHAS = o mesmo erro nao tratado:
"SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document". Nesse modo o navegador PROIBE o armazenamento e o medidor lia
localStorage em varios pontos sem protecao (ex.: dentro de gestos do usuario). Isto e defeito do medidor (a tela precisa funcionar mesmo sem armazenamento).
Correcao: no inicio da pagina, se localStorage/sessionStorage estiverem bloqueados, entram versoes em MEMORIA (valem enquanto a aba estiver aberta). O robo avisa no relatorio.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.188_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.187.html', 'medidor_gerador_v1.10.188.html'
SHIM = r"""<script>
/* v1.10.188 · ARMAZENAMENTO SEGURO — arquivo aberto de Downloads (content://) ou WebView pode PROIBIR localStorage/sessionStorage (SecurityError ao ler).
   Se estiver bloqueado, entra uma versão em MEMÓRIA (vale enquanto a aba estiver aberta; as preferências não ficam guardadas). Se estiver liberado, nada muda. */
(function(){
  function mem(){var d={};return{getItem:function(k){return Object.prototype.hasOwnProperty.call(d,k)?d[k]:null},setItem:function(k,v){d[k]=String(v)},removeItem:function(k){delete d[k]},clear:function(){d={}},key:function(i){return Object.keys(d)[i]||null},get length(){return Object.keys(d).length}}}
  ['localStorage','sessionStorage'].forEach(function(n){
    var ok=true;try{var s=window[n];s.getItem('x')}catch(e){ok=false}
    if(!ok){try{Object.defineProperty(window,n,{value:mem(),configurable:true})}catch(e){}window.__semArmazenamento=true}
  });
})();
</script>
"""


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.187">', '<meta name="app-version" content="1.10.188">', 'meta')
    t = troca(t, "const VERSAO='1.10.187', VERSAO_DATA='08/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.188', VERSAO_DATA='08/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.188\",d:\"08/11/2026\",i:[\n"
              "    'Arquivo aberto de Downloads (content://) ou WebView do celular PROÍBE o armazenamento do navegador e o medidor dava erro não tratado (SecurityError ao ler localStorage). Agora, se estiver bloqueado, entra um armazenamento em memória (vale enquanto a aba estiver aberta) e a tela funciona normalmente; o robô avisa no relatório.',\n"
              "  ]},\n", 'historico')
    t = troca(t, '<meta charset="utf-8">', '<meta charset="utf-8">\n' + SHIM, 'shim')
    t = troca(t, "reg('ok','Preparação','perfil da tela',", "if(window.__semArmazenamento)aviso('Preparação','armazenamento do navegador bloqueado','arquivo aberto de Downloads (content://) ou WebView: preferências ficam só nesta aba; a tela funciona normalmente');\n    reg('ok','Preparação','perfil da tela',", 'aviso')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
