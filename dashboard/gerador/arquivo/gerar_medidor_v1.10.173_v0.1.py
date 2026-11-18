#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.173.html a partir da v1.10.172 (nao sobrescreve; aborta se um trecho esperado mudou).
Pedido do Reginaldo (06/11/2026, DSE real): condicoes verdadeiras com o DSE ligado e o motor rodando = modo MANUAL, LED MANUAL ligado, LED STOP e LED AUTO desligados.
O LED MANUAL diz o MODO do controlador, nao que o motor gira (duvida desde a v1.9.21). Por isso "operando" passa a exigir tambem as GRANDEZAS
quando elas existem: rotacao >= 1400 rpm e tensao media das tres fases >= 100 V. Sem rotacao/tensao na leitura, vale so o LED (como antes).
Com o motor parado e o DSE em Manual o estado e "parado" (rpm <= 50) ou "partindo" (rpm entre 50 e 1400, ou sem tensao ainda).
NAO muda o PLC: o FB100 continua usando db2000.ledManual como "gerador operando" (versao nova do FB100 so com OK).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.173_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.172.html', 'medidor_gerador_v1.10.173.html'


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.172">', '<meta name="app-version" content="1.10.173">', 'meta')
    t = troca(t, "const VERSAO='1.10.172', VERSAO_DATA='06/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.173', VERSAO_DATA='06/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.173\",d:\"06/11/2026\",i:[\n"
              "    'GERADOR \"OPERANDO\" com o DSE REAL: a partir de agora o estado também usa as GRANDEZAS. O LED MANUAL só diz que o modo do controlador é Manual (não que o motor gira). Condições confirmadas pelo operador com o DSE real ligado e o motor rodando: modo MANUAL, LED MANUAL ligado, LED STOP e LED AUTO desligados. \"Operando\" = LED (ou geradorDisponivel) E rotação ≥ 1400 rpm E tensão média das 3 fases ≥ 100 V (quando esses valores existem na leitura; sem eles vale só o LED, como antes). Motor parado com o DSE em Manual agora aparece \"parado\"; entre 50 e 1400 rpm, ou sem tensão ainda, \"partindo\". O PLC (FB100) continua usando o ledManual; mudar isso é versão nova do FB100, só com o OK do Reginaldo.',\n"
              "  ]},\n", 'historico')
    velho = """  const run=L.manual===true?true:typeof disp==='boolean'?disp:(temRpm&&rpm>=1400);
  const estado=run?'operando'"""
    novo = """  /* v1.10.173 (DSE REAL, 06/11/2026): o LED MANUAL só diz que o MODO é manual; "operando" exige também as GRANDEZAS quando existem:
     rotação >= 1400 rpm e tensão média das 3 fases >= 100 V (condições confirmadas pelo operador: DSE ligado, motor rodando, modo MANUAL, LED MANUAL on, STOP/AUTO off). */
  const vs=['tensaoL1L2','tensaoL2L3','tensaoL3L1'].map(k=>Number(find(d,k))),temV=vs.every(v=>!isNaN(v)&&v>=0),vMed=temV?(vs[0]+vs[1]+vs[2])/3:null;
  const ledRun=L.manual===true?true:typeof disp==='boolean'?disp:(temRpm&&rpm>=1400);
  const run=ledRun&&(!temRpm||rpm>=1400)&&(vMed==null||vMed>=100);
  const estado=run?'operando'"""
    t = troca(t, velho, novo, 'genInfo')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
