#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.185.html a partir da v1.10.184 (nao sobrescreve; aborta se um trecho esperado mudou).
Achado do Monkey no Poco (08/11/2026, arquivo aberto de Downloads = content://): o balao do robo some e nada aparece. Causa encontrada no codigo: a caixa "chkPlcNovos"
(popup Patamar > detalhes) faz location.reload() ao mudar; o Monkey a toca, a pagina recarrega e o robo morre (o Chrome do celular nao mostra o aviso de saida e,
em content://, o localStorage nao guarda o relatorio). Correcao: (1) a caixa de areia do robo bloqueia esse toque (conta como "navegacao"); (2) o relatorio tambem e guardado em window.name
(sobrevive a recarga da aba mesmo em content://), para a barra avisar "interrompido" e o Copiar funcionar.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.185_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.184.html', 'medidor_gerador_v1.10.185.html'


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.184">', '<meta name="app-version" content="1.10.185">', 'meta')
    t = troca(t, "const VERSAO='1.10.184', VERSAO_DATA='08/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.185', VERSAO_DATA='08/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.185\",d:\"08/11/2026\",i:[\n"
              "    'Dev/Operador oculto (Monkey no celular): achada a causa do balão sumir — a caixa \"chkPlcNovos\" (Patamar > detalhes) recarrega a página ao mudar; o robô a tocava e a página recarregava no meio do teste. Agora a caixa de areia bloqueia esse toque e o relatório também é guardado em window.name (sobrevive à recarga mesmo com o arquivo aberto de Downloads).',\n"
              "  ]},\n", 'historico')
    t = troca(t, "const sbClique=e=>{const a=", "const sbClique=e=>{if(e.target&&e.target.id==='chkPlcNovos'){e.preventDefault();e.stopImmediatePropagation();SB.c.navegacao++;return}const a=", 'sbClique')
    t = troca(t, "let PERS=null;try{PERS=JSON.parse(localStorage.getItem(LSREL)||'null')}catch(e){}",
              "let PERS=null;try{PERS=JSON.parse(localStorage.getItem(LSREL)||'null')}catch(e){}\n  if(!PERS){try{if(/^BT2REL:/.test(window.name))PERS=JSON.parse(window.name.slice(7))}catch(e){}}   // v1.10.185: arquivo aberto de Downloads (content://) pode não ter localStorage", 'pers init')
    t = troca(t, "localStorage.setItem(LSREL,JSON.stringify(o));PERS=o;", "try{localStorage.setItem(LSREL,JSON.stringify(o))}catch(x){}try{window.name='BT2REL:'+JSON.stringify(o)}catch(x){}PERS=o;", 'pers save')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
