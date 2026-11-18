#!/usr/bin/env python3
"""Fase 4 - gera medidor_gerador_v1.10.172.html a partir da v1.10.171 (nao sobrescreve; aborta se um trecho esperado mudou).
Pedido do Reginaldo (06/11/2026): no card SETUP o chaveamento (220/380/440 V) deve vir SOZINHO da tensao do gerador dos "Dados do ensaio"
(o Setup so funciona com o gerador ligado e a configuracao ja foi escolhida nos Dados do ensaio); sem selecao manual.
- Modo PLC: informa ao PLC (POST /tensao) sozinho, SO com os Dados do ensaio CONFIRMADOS na sessao (o valor padrao do formulario nao conta) e a tensao
  em 220/380/440 que o banco atenda. Nao tenta em laco (espera 10 s para repetir o mesmo valor); com chave selecionada nao troca (o fluxo recusa) e avisa.
- Demo local: igual a antes (marca pela tensao digitada nos Dados).
- Botoes 220/380/440 ficam SOMENTE LEITURA (mostram o chaveamento ativo); o chip explica a origem.
- 208 V ou 480 V (fora dos tres chaveamentos): SO SINALIZACAO no Setup ("Gerador em 208 V ... sem chaveamento correspondente"); nada e gravado no PLC
  e o Setup continua sem salvar (a regra do fluxo exige chaveamento). A definir com o operador.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.172_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.171.html', 'medidor_gerador_v1.10.172.html'


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


NOVO_RENDER = r"""  /* v1.10.172: chaveamento do Setup vem dos DADOS DO ENSAIO (somente leitura) */
  const tensVDados=()=>{ // tensão do gerador: no PLC só vale a dos Dados do ensaio JÁ CONFIRMADOS (o valor padrão do formulário não conta); no Demo local, a digitada
    const v=(tensFeat(bidAtivo())==='ok')?(dadosConfirmados()?+DADOS.tensao:0):NUM(($('dTens')||{}).value);
    return (v>0&&!isNaN(v))?v:0};
  function tensRender(){
    tensRenderBase();
    const id=bidAtivo(),f=tensFeat(id),seg=$('stTensSeg'),chip=$('stTensChip');if(!seg||!chip)return;
    seg.querySelectorAll('button').forEach(b=>{b.disabled=true;b.title='Definido pela tensão do gerador nos Dados do ensaio (somente leitura)'});
    if(!(f==='local'||f==='ok'))return;                    // 'antigo'/'semdb'/sem leitura: mantém os avisos do render base
    const c=tensAtiva(id),vd=tensVDados(),cd=TENS_V.indexOf(vd)+1;
    if(vd&&!cd){chip.textContent='Gerador em '+vd+' V (Dados do ensaio) — sem chaveamento 220/380/440 correspondente: só sinalização. O Setup não grava sem chaveamento (a definir com o operador).';chip.className='enschip err';return}
    if(!c&&!vd){chip.textContent='NÃO INFORMADO — '+(f==='ok'&&!dadosConfirmados()?'confirme os Dados do ensaio (a tensão do gerador define o chaveamento)':'informe a tensão do gerador nos Dados do ensaio (ela define o chaveamento)');chip.className='enschip err';return}
    if(c&&cd&&c!==cd&&SEL!=null){chip.textContent+=' — desmarque a chave para atualizar o chaveamento';return}
    if(cd&&c===cd&&f==='ok')chip.textContent='Chaveamento ativo: '+vd+' V (PLC) · definido pela tensão do gerador nos Dados do ensaio';
  }
  const tensAutoUlt={};   // id do banco -> {v,t,busy}: evita repetir em laço o mesmo valor
  async function tensAuto(){
    if(!$('dlgChSetup').open)return;
    const id=bidAtivo(),f=tensFeat(id),vd=tensVDados(),cd=TENS_V.indexOf(vd)+1;
    if(!(f==='local'||f==='ok')||!cd||SEL!=null||tensAtiva(id)===cd||!bancoAtende(bancoPorId(id),vd))return;
    const u=tensAutoUlt[id]||{};if(u.busy||(u.v===vd&&Date.now()-u.t<10000))return;
    tensAutoUlt[id]={v:vd,t:Date.now(),busy:true};
    try{await tensSet(vd)}finally{tensAutoUlt[id].busy=false}
  }
  setInterval(()=>{try{tensAuto()}catch(e){}},2000);
"""

NOVO_OBS = r"""  new MutationObserver(()=>{
    if(!$('dlgChSetup').open)return;
    tensAuto();   // v1.10.172: informa o chaveamento sozinho (PLC: só com Dados confirmados; Demo local: como antes)
    tensRender();
  }).observe($('dlgChSetup'),{attributes:true,attributeFilter:['open']});
"""


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.171">', '<meta name="app-version" content="1.10.172">', 'meta')
    t = troca(t, "const VERSAO='1.10.171', VERSAO_DATA='06/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.172', VERSAO_DATA='06/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.172\",d:\"06/11/2026\",i:[\n"
              "    'SETUP: o chaveamento (220/380/440 V) agora vem SOZINHO da tensão do gerador dos Dados do ensaio (pedido do operador: o Setup só funciona com o gerador ligado e a configuração já foi escolhida nos Dados do ensaio). No modo PLC a tela informa o chaveamento ao PLC sozinha, só com os Dados do ensaio CONFIRMADOS e uma tensão que o banco atenda; os botões 220/380/440 viraram somente leitura (mostram o ativo). Com chave selecionada o chaveamento não troca (a tela avisa para desmarcar).',\n"
              "    'Tensão do gerador de 208 V ou 480 V (fora dos três chaveamentos): o Setup só SINALIZA a tensão (\"sem chaveamento correspondente\"); nada é gravado no PLC e o Setup continua sem salvar. A definir com o operador.',\n"
              "  ]},\n", 'historico')
    t = troca(t, "  function tensRender(){ // v1.9.78: seletor 220/380/440 V do popup Setup", "  function tensRenderBase(){ // v1.9.78: seletor 220/380/440 V do popup Setup (v1.10.172: tensRender() embrulha este)", 'renomeia render')
    t = troca(t, "  async function tensSet(v){\n", NOVO_RENDER + "  async function tensSet(v){\n", 'insere novo render')
    velho_obs = ("  new MutationObserver(()=>{\n"
                 "    if(!$('dlgChSetup').open)return;\n"
                 "    const id=bidAtivo(),cd=tensDados();\n"
                 "    if(tensFeat(id)==='local'&&!tensAtiva(id)&&cd&&SEL==null&&bancoAtende(bancoPorId(id),TENS_V[cd-1]))tensSet(TENS_V[cd-1]);\n"
                 "    tensRender();\n"
                 "  }).observe($('dlgChSetup'),{attributes:true,attributeFilter:['open']});\n")
    t = troca(t, velho_obs, NOVO_OBS, 'observer')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
