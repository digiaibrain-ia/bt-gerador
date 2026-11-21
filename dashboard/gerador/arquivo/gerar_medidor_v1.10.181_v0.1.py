#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.181.html a partir da v1.10.180 (nao sobrescreve; aborta se um trecho esperado mudou).
Achado do Reginaldo no Poco X6 Pro (07/11/2026): o botao "Copiar relatorio" do Dev/Operador oculto mostrou "Copiado!", mas ao colar veio um texto ANTIGO da area de transferencia (um codigo Pix).
Causa provavel: o popup Demo e um <dialog> modal; a copia alternativa criava o campo de texto no <body>, que fica INERTE com modal aberto -> a selecao nao pega e a copia sai vazia/antiga,
e o botao dizia "Copiado!" sem conferir. Correcao: (1) o campo temporario nasce DENTRO do dialog aberto; (2) o relatorio tambem aparece num campo de texto na propria tela (selecionar tudo e copiar a mao);
(3) botao "Compartilhar" (Android/iOS) manda o texto para outro app sem passar pela area de transferencia; (4) a mesma correcao no Diagnostico das Ocorrencias e no menu do botao direito.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.181_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.180.html', 'medidor_gerador_v1.10.181.html'

COPIA = r"""  async function copia(){
    const md=relatorioAv();let ok=false,via='';
    try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(md);ok=true;via='área de transferência'}}catch(e){}
    if(!ok){try{const host=document.querySelector('dialog[open]')||document.body;   // v1.10.181: com popup modal aberto o <body> é inerte: o campo temporário tem de nascer dentro do popup
      const ta=document.createElement('textarea');ta.value=md;ta.setAttribute('readonly','');ta.style.cssText='position:absolute;left:0;top:0;width:1px;height:1px;opacity:0';host.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,md.length);ok=document.execCommand('copy');ta.remove();via='cópia alternativa'}catch(e){}}
    const tx=$('opsTexto');if(tx){tx.value=md;tx.hidden=false}   // sempre mostra o texto: se a cópia falhar, é só tocar e segurar > Selecionar tudo > Copiar
    const b=$('opsCopia');if(b){const t=b.dataset.rot||b.textContent;b.dataset.rot=t;b.textContent=ok?'Copiado! (confira colando)':'Não consegui copiar — use o texto abaixo';setTimeout(()=>{b.textContent=t},2600)}
  }
  async function compartilha(){try{await navigator.share({title:'Relatório Dev/Operador oculto',text:relatorioAv()})}catch(e){}}
"""


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.180">', '<meta name="app-version" content="1.10.181">', 'meta')
    t = troca(t, "const VERSAO='1.10.180', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.181', VERSAO_DATA='07/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.181\",d:\"07/11/2026\",i:[\n"
              "    'Botão Copiar relatório (Dev/Operador oculto) dizia \"Copiado!\" mas colava um texto antigo: o campo temporário da cópia nascia fora do popup modal (inerte). Agora nasce dentro do popup, o relatório também aparece num campo de texto na tela (selecionar e copiar à mão) e há o botão Compartilhar (celular). Mesma correção no Diagnóstico das Ocorrências e no menu do botão direito.',\n"
              "  ]},\n", 'historico')
    i = t.index("  async function copia(){\n    const md=relatorioAv();"); j = t.index("  const dsp=$('opsDisp')", i)
    t = t[:i] + COPIA + t[j:]
    t = troca(t, "const co=$('opsCopia');if(co)co.onclick=copia;", "const co=$('opsCopia');if(co)co.onclick=copia;\n  const sh=$('opsShare');if(sh){if(navigator.share)sh.hidden=false;sh.onclick=compartilha}", 'liga botoes')
    # botoes/campo no popup Demo
    k = t.index('id="opsCopia"'); k2 = t.index('</button>', k) + len('</button>')
    t = t[:k2] + '\n        <button type="button" class="bt c" id="opsShare" hidden title="Envia o relatório para outro app (WhatsApp, e-mail, Drive) sem usar a área de transferência">Compartilhar</button>' + t[k2:]
    t = troca(t, '<p id="opsInfo"', '<textarea id="opsTexto" readonly hidden rows="6" style="width:100%;box-sizing:border-box;font:11px/1.3 monospace;margin:6px 0" aria-label="Relatório do robô (selecione e copie)"></textarea>\n      <p id="opsInfo"', 'textarea')
    # mesma correcao nas outras copias alternativas
    t = troca(t, "a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();", "a.style.position='fixed';a.style.opacity='0';(document.querySelector('dialog[open]')||document.body).appendChild(a);a.select();", 'diag')
    t = troca(t, "ta.style.cssText = 'position:fixed;left:-9999px'; D.body.appendChild(ta); ta.select();", "ta.style.cssText = 'position:fixed;left:0;top:0;opacity:0'; (D.querySelector('dialog[open]') || D.body).appendChild(ta); ta.select();", 'menu')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
