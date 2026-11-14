#!/usr/bin/env python3
"""Gera medidor_gerador_v1.10.191.html a partir da v1.10.190 (nao sobrescreve; aborta se um trecho esperado mudou).
Pedido do Reginaldo (10/11/2026): opcao para NAO perguntar "Salvar os registros agora?" ao fim do ensaio.
Novo: popup Modo > "Perguntar ao final do ensaio" (Sim/Nao). Padrao SIM (comportamento igual ao da 1.10.190). Guarda em localStorage 'medidor.cen.perguntaFim' ('0' = nao pergunta).
Nao muda gravacao, PLC, Node-RED nem o resto da Central de registros (o botao Registros continua abrindo a Central).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.191_v0.1.py"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.190.html', 'medidor_gerador_v1.10.191.html'


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


UI = ('    <h4>Perguntar ao final do ensaio <span class="ibub" tabindex="0" data-nota="mdPfNota" data-tip="">i</span></h4>\n'
      '    <span class="ensseg" id="mdPf"><button type="button" data-v="1">Sim</button><button type="button" data-v="0">Não</button></span>\n'
      '    <p class="jnota" id="mdPfNota"></p>\n')
JS = '''
/* ===== v1.10.191 · PERGUNTAR AO FINAL DO ENSAIO (Modo) =====
   POR QUE: ao terminar o ensaio a tela mostra "Salvar os registros agora?". Quem não quer essa pergunta (ex.: rodadas de Demo) pode desligá-la.
   O QUE FAZ: botões Sim/Não em ⚙ Modo. Padrão SIM. Guarda em localStorage 'medidor.cen.perguntaFim' ('0' = não pergunta; com try/catch). O botão "Registros" continua abrindo a Central. Não grava nada, não comanda PLC. */
(function(){
  const K='medidor.cen.perguntaFim';
  function pinta(){const w=document.getElementById('mdPf');if(!w)return;const v=window.CEN_PERGUNTA_FIM!==false?'1':'0';[...w.children].forEach(b=>b.classList.toggle('on',b.dataset.v===v));
    const n=document.getElementById('mdPfNota');if(n)n.textContent=v==='1'?'Ao terminar o ensaio a tela pergunta "Salvar os registros agora?". Nada é gravado sozinho.':'Ao terminar o ensaio a tela NÃO pergunta. Os registros continuam disponíveis no botão "Registros".'}
  try{window.CEN_PERGUNTA_FIM=localStorage.getItem(K)!=='0'}catch(e){window.CEN_PERGUNTA_FIM=true}
  const w=document.getElementById('mdPf');
  if(w){w.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;window.CEN_PERGUNTA_FIM=b.dataset.v==='1';try{localStorage.setItem(K,window.CEN_PERGUNTA_FIM?'1':'0')}catch(x){}pinta()});pinta()}
})();
'''


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.190">', '<meta name="app-version" content="1.10.191">', 'meta')
    t = troca(t, "const VERSAO='1.10.190', VERSAO_DATA='08/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.191', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.191\",d:\"10/11/2026\",i:[\n"
              "    'Novo em ⚙ Modo: \"Perguntar ao final do ensaio\" (Sim/Não). Com Não, a tela não mostra mais \"Ensaio finalizado. Salvar os registros agora?\"; os registros continuam no botão Registros. Padrão Sim (igual à 1.10.190).'\n"
              "  ]},\n", 'historico')
    t = troca(t, '    <p class="jnota" id="mdOpNota"></p>\n', '    <p class="jnota" id="mdOpNota"></p>\n' + UI, 'ui')
    t = troca(t, "      fimVisto = true; mostraAviso();\n", "      fimVisto = true; if (raiz.CEN_PERGUNTA_FIM !== false) mostraAviso();   // v1.10.191: chave em ⚙ Modo\n", 'aviso')
    t = troca(t, '\n/* ===== v1.10.176 · GUARDA "JANELA NA TELA"', JS + '\n/* ===== v1.10.176 · GUARDA "JANELA NA TELA"', 'js')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
