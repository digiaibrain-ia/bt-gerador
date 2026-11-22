#!/usr/bin/env python3
"""10/11/2026 - gera medidor_gerador_v1.10.195.html a partir da 1.10.194 (nao sobrescreve; aborta se um trecho esperado mudou).
Defeito (relato do Reginaldo): no fim do ensaio (resultado -> parar gerador -> "Gravar sem relatorio"/"Gravar com relatorio") o card PATAMAR nao volta ao estado inicial: continua seguindo a ultima etapa
(Alvo 0 kW (0 %), "FBs virtuais: etapa sem carga - chaves abertas"), com o patamar e a selecao do ensaio anterior. Causa (codigo): o unico gancho que restabelece o Patamar (PATAMAR_GUIADO_PARA) so e chamado em
"ensaio PARADO pelo operador"; ao GRAVAR, T.started continua true e patIdx() segue a ultima etapa ate o proximo START.
Correcao: (1) ao GRAVAR (os dois botoes) chama o novo gancho PATAMAR_ENSAIO_GRAVADO: desarma a mae, limpa selecao/plano/mensagem e volta ao "sem patamar escolhido" (G.pat = -1, como no inicio); o liga/desliga do
Patamar continua como o operador deixou (regra v1.10.103: religa sozinho no proximo ensaio); (2) patIdx() deixa de acompanhar a etapa depois que o ensaio foi gravado. O historico do Registro continua na tela ate o proximo START.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.195_v0.1.py"""
import os
P = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')), 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
def main():
    o, d = os.path.join(P, 'medidor_gerador_v1.10.194.html'), os.path.join(P, 'medidor_gerador_v1.10.195.html'); assert os.path.exists(o) and not os.path.exists(d)
    t = open(o, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.194">', '<meta name="app-version" content="1.10.195">', 'meta')
    t = troca(t, "const VERSAO='1.10.194', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.195', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.195\",d:\"10/11/2026\",i:[\n"
              "    'Ao GRAVAR o ensaio (com ou sem relatório) o card PATAMAR volta ao estado inicial: sem patamar escolhido, sem seleção/plano/mensagem do ensaio anterior (antes continuava em \"Alvo 0 kW (0 %)\" / \"etapa sem carga\"). O liga/desliga do Patamar continua como o operador deixou. O Registro do ensaio continua na tela até o próximo INICIAR.'\n  ]},\n", 'historico')
    t = troca(t, "  const patIdx=()=>previaEt!=null?previaEt:T.started?Math.min(T.et,ETAPAS.length-1):G.pat;",
              "  const patIdx=()=>previaEt!=null?previaEt:(T.started&&!(T.fim&&T.gravado))?Math.min(T.et,ETAPAS.length-1):G.pat;", 'patIdx')   # v1.10.195: depois de GRAVADO nao acompanha mais a etapa
    ant = "  window.PATAMAR_GUIADO_PARA=m=>{try{mae.desarma(m||'ensaio parado')}catch(x){}limpaManual();G.plano=null;G.msg='';atualizaBtnRodar();desenha()};"
    novo = ("  window.PATAMAR_ENSAIO_GRAVADO=()=>{try{mae.desarma('ensaio gravado')}catch(x){}limpaManual();G.plano=null;G.msg='';G.pat=-1;previaEt=null;APL_ET=-1;salva();atualizaBtnRodar();desenha()};   // v1.10.195: gravar o ensaio devolve o card Patamar ao inicial (sem patamar escolhido); o liga/desliga fica como o operador deixou\n")
    t = troca(t, ant, novo + ant, 'gancho')
    gancho = "try{if(window.PATAMAR_ENSAIO_GRAVADO)window.PATAMAR_ENSAIO_GRAVADO()}catch(x){console.error('Patamar Guiado: ensaio gravado',x)}"
    t = troca(t, "  if(T.fim){T.gravado=true;dadosConfMarca(false);desenha()} // gravado:", "  if(T.fim){T.gravado=true;dadosConfMarca(false);" + gancho + ";desenha()} // gravado:", 'resOk')
    t = troca(t, "  if(T.fim){T.gravado=true;dadosConfMarca(false);desenha()}\n};", "  if(T.fim){T.gravado=true;dadosConfMarca(false);" + gancho + ";desenha()}\n};", 'resOkSemPdf')
    open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.195.html ok')
if __name__ == '__main__': main()
