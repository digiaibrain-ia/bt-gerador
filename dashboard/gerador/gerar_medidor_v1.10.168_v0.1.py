#!/usr/bin/env python3
"""Fase 4, Portao A (A3) - gera medidor_gerador_v1.10.168.html a partir da v1.10.167 (nao sobrescreve; aborta se um trecho esperado mudou).
O que muda: mostra no card do banco as falhas que vem do PLC do banco (flow chaves v3.5):
  CHV-007 (falha) chave SEM RETORNO (SB): o PLC derrubou o comando (CB); a chave fica travada ate novo comando.
  CHV-008 (falha) CONTATOR COLADO: retorno ativo sem comando; o PLC bloqueia a chave.
Sem os campos novos (flow antigo) nada muda. Ao clicar numa chave em falha de retorno, a tela avisa que e um rearme.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.168_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.167.html', 'medidor_gerador_v1.10.168.html'


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.167">', '<meta name="app-version" content="1.10.168">', 'meta versao')
    t = troca(t, "const VERSAO='1.10.167', VERSAO_DATA='03/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.168', VERSAO_DATA='06/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.168\",d:\"06/11/2026\",i:[\n"
              "    'FASE 4 / PORTÃO A (bancada de 06/11): novas falhas vindas do PLC do banco (flow chaves v3.5 + PLC com os DBs v0.3). CHV-007 \"Chave sem retorno (SB)\": o PLC derrubou o comando (CB) porque o retorno não veio em 2 s; a chave fica TRAVADA e só rearma com um novo clique. CHV-008 \"Contator colado\": retorno ativo sem comando; o PLC bloqueia a chave. Com o flow antigo (sem esses campos) nada muda.',\n"
              "    'Ao clicar numa chave que estava em falha de retorno, a tela avisa que é um rearme (o PLC só rearma com novo comando e retorno em 0).',\n"
              "  ]},\n", 'historico')
    t = troca(t, "const CH_LIG=CH.map(()=>false);",
              "const FALHA_RET=CH.map(()=>false), FALHA_COL=CH.map(()=>false); // v1.10.168: falha de retorno / contator colado por chave (do PLC do banco, flow v3.5)\nconst CH_LIG=CH.map(()=>false);", 'declara falhas')
    t = troca(t, "        if(Array.isArray(lg))CH_LIG[q]=!!lg[i];                    // feedback real (sb.ligada)\n",
              "        if(Array.isArray(lg))CH_LIG[q]=!!lg[i];                    // feedback real (sb.ligada)\n"
              "        FALHA_RET[q]=!!(j.falhaRetorno&&j.falhaRetorno[i]);FALHA_COL[q]=!!(j.contatorColado&&j.contatorColado[i]); // v1.10.168\n", 'le falhas')
    t = troca(t, "      // v1.9.78: chaveamento (flow v2.5). Sem o campo = flow antigo (recurso inativo)",
              "      // v1.10.168 (Fase 4, Portão A): falhas do PLC do banco, uma ocorrência por chave (some quando o PLC limpa a falha). Só com o campo (flow v3.5).\n"
              "      if(window.OCOR&&Array.isArray(j.falhaRetorno)){\n"
              "        for(let i=0;i<n;i++){const q=off+i,ref='BC'+id+'-'+(i+1);\n"
              "          if(FALHA_RET[q])window.OCOR.set('bco','CHV-007',nomeCh(q)+' (BC'+id+'): sem retorno (SB) — o PLC derrubou o comando (CB) e travou a chave. Confira o contator/retorno e clique de novo para tentar.',{ref});else window.OCOR.limpa('bco','CHV-007',ref);\n"
              "          if(FALHA_COL[q])window.OCOR.set('bco','CHV-008',nomeCh(q)+' (BC'+id+'): contator colado — retorno ativo sem comando. O PLC bloqueou a chave; verifique no campo antes de ligar.',{ref});else window.OCOR.limpa('bco','CHV-008',ref);\n"
              "        }\n"
              "      }\n"
              "      // v1.9.78: chaveamento (flow v2.5). Sem o campo = flow antigo (recurso inativo)", 'ocorrencias')
    t = troca(t, "      CH_CMD[i]=novo;CH_PEND.add(i);redesenha();\n",
              "      if(novo&&FALHA_RET[i])msgGer('Rearmando '+nomeCh(i)+' depois da falha de retorno (o PLC só rearma com novo comando e retorno em 0).',5000); // v1.10.168\n"
              "      CH_CMD[i]=novo;CH_PEND.add(i);redesenha();\n", 'aviso rearme')
    t = troca(t, "    'ENS-001':{t:'f',card:'reg', txt:'Dados do ensaio não gravados no PLC'},",
              "    'CHV-007':{t:'f',card:'bco', txt:'Chave sem retorno (SB): o PLC derrubou o comando e travou a chave'},   // v1.10.168 (Fase 4, Portão A)\n"
              "    'CHV-008':{t:'f',card:'bco', txt:'Contator colado: retorno ativo sem comando (chave bloqueada pelo PLC)'}, // v1.10.168\n"
              "    'ENS-001':{t:'f',card:'reg', txt:'Dados do ensaio não gravados no PLC'},", 'catalogo')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
