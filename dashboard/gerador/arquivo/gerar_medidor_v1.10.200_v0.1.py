#!/usr/bin/env python3
"""11/11/2026 - gera medidor_gerador_v1.10.200.html a partir da 1.10.199 (nao sobrescreve; aborta se um trecho esperado mudou).
Relatorio do Reginaldo (Dev/Operador oculto, Poco X6 Pro, 1.10.199): "FALHA o ensaio continua progredindo - parado ha 45 s na etapa 2 (carga 0.0%)" + "ciclo incompleto".
Causa (REPRODUZIDA em Chromium/Poco: com o salvamento "Por patamar" a falha aparece; sem ele nao): com "Por patamar" o Patamar Guiado liga SOZINHO e, com o chip de 30 % em manual, a mae espera o operador clicar
"Aplicar": o operador simulado em Auto nao fecha as chaves (o Patamar e o dono delas) e a carga fica em 0 %. O robo supunha o operador Auto livre. NAO e defeito do ensaio: e o robo que nao normalizava o estado.
Correcao (so no robo): na fase Ensaio o robo (1) DESLIGA o Patamar Guiado (se estiver ligado) e (2) coloca o SALVAMENTO em Manual (o Avancado ja fazia; o Rapido nao), avisando; no fim (restaura) devolve os dois como o operador deixou.
Sem (2), com "Por patamar" o ciclo chegava ao fim mas falhavam "todas as 6 etapas ficaram salvas" e "Ligar banco fica TRAVADO" (verificacoes feitas para o salvamento Manual). API de teste: opSecreto.normalizaPatamar() / restauraPatamar().
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.200_v0.1.py"""
import os
P = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')), 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
FUNC = r'''
  /* v1.10.200: o Patamar Guiado LIGADO (ex.: salvamento "Por patamar" liga sozinho) é dono das chaves: com o patamar em manual a mãe espera o "Aplicar" e o operador simulado em Auto não sobe a carga.
     O robô desliga o Patamar para o ensaio dele e religa no fim (como o operador deixou). */
  let GUI_DESLIGOU=false;
  function normalizaPatamar(){try{const G=window.GUIADO_DBG&&window.GUIADO_DBG.G;if(!G||!G.guiadoOn)return false;G.guiadoOn=false;G.guiadoOff=true;GUI_DESLIGOU=true;if(window.PATAMAR_GUIADO_PARA)window.PATAMAR_GUIADO_PARA('Dev/Operador oculto: ensaio com operador Auto');return true}catch(e){return false}}
  let SALVA_ROBO=null;
  function normalizaSalvamento(){try{const a=salvaModo();if(a==='M')return false;SALVA_ROBO=a;setSalva('M');return true}catch(e){return false}}
  function restauraSalvamento(){try{if(!SALVA_ROBO)return false;const a=SALVA_ROBO;SALVA_ROBO=null;setSalva(a);return true}catch(e){return false}}
  function restauraPatamar(){try{const G=window.GUIADO_DBG&&window.GUIADO_DBG.G;if(!GUI_DESLIGOU||!G)return false;GUI_DESLIGOU=false;G.guiadoOn=true;G.guiadoOff=false;return true}catch(e){return false}}
'''
def main():
    o, d = os.path.join(P, 'medidor_gerador_v1.10.199.html'), os.path.join(P, 'medidor_gerador_v1.10.200.html'); assert os.path.exists(o) and not os.path.exists(d)
    t = open(o, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.199">', '<meta name="app-version" content="1.10.200">', 'meta')
    t = troca(t, "const VERSAO='1.10.199', VERSAO_DATA='11/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.200', VERSAO_DATA='11/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.200\",d:\"11/11/2026\",i:[\n"
              "    'Dev/Operador oculto (Rápido): se o Patamar Guiado estiver LIGADO (o salvamento \"Por patamar\" liga sozinho) o robô o desliga durante o ensaio dele e religa no fim. Antes o ensaio parava na etapa 2 com a carga em 0 % porque, com o 30 % em manual, o Patamar esperava o \"Aplicar\" e o operador simulado em Auto não subia a carga (falha \"o ensaio continua progredindo\").'\n  ]},\n", 'historico')
    t = troca(t, "  const desabilitadosTela=()=>", FUNC + "  const desabilitadosTela=()=>", 'funcoes')
    t = troca(t, "    if(T.fim&&!T.gravado){aviso(F,'fase pulada','há um ensaio finalizado e NÃO gravado: grave ou zere antes de rodar o operador');return}\n",
              "    if(T.fim&&!T.gravado){aviso(F,'fase pulada','há um ensaio finalizado e NÃO gravado: grave ou zere antes de rodar o operador');return}\n"
              "    if(normalizaPatamar())aviso(F,'Patamar Guiado estava LIGADO (salvamento \"Por patamar\")','o robô desligou o Patamar durante o ensaio dele (senão o 30 % em manual espera o \"Aplicar\" e a carga não sobe) e religa no fim');   // v1.10.200\n"
              "    if(normalizaSalvamento())aviso(F,'salvamento das etapas estava em outro modo (Por patamar/Automático)','o robô usa Manual durante o ensaio dele (as conferências são do salvamento Manual) e devolve no fim');\n", 'normaliza')
    t = troca(t, "      if(est.auto!==auto){clica(est.auto?$('mAuto'):$('mMan'));}", "      if(est.auto!==auto){clica(est.auto?$('mAuto'):$('mMan'));}\n      restauraSalvamento();restauraPatamar();   // v1.10.200: devolve o salvamento e religa o Patamar Guiado se o robô mudou", 'restaura')
    t = troca(t, "window.opSecreto={rodar,rodarAv,", "window.opSecreto={normalizaPatamar,restauraPatamar,normalizaSalvamento,restauraSalvamento,rodar,rodarAv,", 'api')
    open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.200.html ok')
if __name__ == '__main__': main()
