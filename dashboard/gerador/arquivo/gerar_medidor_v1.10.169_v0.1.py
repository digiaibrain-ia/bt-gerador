#!/usr/bin/env python3
"""Fase 4, Portao B (clique travado, BANC-3) - gera medidor_gerador_v1.10.169.html a partir da v1.10.168 (nao sobrescreve; aborta se um trecho mudou).
Causa (confirmada pelo Reginaldo: so o F5 destravava, entao o estado preso esta NA TELA): o clique na chave tem DOIS retornos silenciosos:
  (1) CH_PEND: a chave marcada como "em envio" ignorava o clique sem avisar e sem limite de tempo;
  (2) PATAMAR_PENDENTE: com o Patamar manual esperando o Aplicar, o clique do operador so edita a sugestao (nao comanda o PLC) e tambem nao avisava.
Correcao: (1) aviso visivel + carimbo de hora; passados 12 s o estado preso e solto e o clique segue; (2) aviso visivel explicando que o clique so edita a sugestao.
Nenhum comando novo vai ao PLC; so deixa de ser silencioso e deixa de travar para sempre.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.169_v0.1.py
"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PAST = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST = 'medidor_gerador_v1.10.168.html', 'medidor_gerador_v1.10.169.html'


def troca(t, velho, novo, nome):
    assert t.count(velho) == 1, 'trecho esperado exatamente 1x (' + nome + '): achei ' + str(t.count(velho))
    return t.replace(velho, novo, 1)


def main():
    fonte, saida = os.path.join(PAST, ORIG), os.path.join(PAST, DEST)
    assert os.path.exists(fonte) and not os.path.exists(saida), 'origem ausente ou destino ja existe (nao sobrescrevo)'
    t = open(fonte, encoding='utf-8').read()
    t = troca(t, '<meta name="app-version" content="1.10.168">', '<meta name="app-version" content="1.10.169">', 'meta')
    t = troca(t, "const VERSAO='1.10.168', VERSAO_DATA='06/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.169', VERSAO_DATA='06/11/2026';\nconst HISTORICO=[\n"
              "  {v:\"1.10.169\",d:\"06/11/2026\",i:[\n"
              "    'CLIQUE TRAVADO NA CHAVE (bancada de 06/11; só o F5 destravava): o clique na chave tinha dois retornos SILENCIOSOS. (1) Chave marcada \"em envio\" ignorava o clique sem avisar e sem limite de tempo: agora a tela avisa (\"comando anterior ainda em envio\") e, passados 12 s, solta o estado preso e deixa clicar. (2) Com o Patamar manual esperando o Aplicar, o clique só edita a sugestão e não comanda o PLC: agora a tela explica isso. Nenhum comando novo vai ao PLC.',\n"
              "  ]},\n", 'historico')
    t = troca(t, "const CH_PEND=new Set();", "const CH_PEND_T={};            // v1.10.169: hora em que cada chave entrou em \"em envio\" (solta o estado preso depois de 12 s)\nconst CH_PEND=new Set();", 'declara')
    t = troca(t, "      if(CH_PEND.has(i))return; // esta chave ainda está sendo enviada; as outras podem ser clicadas em paralelo\n",
              "      if(CH_PEND.has(i)){ // esta chave ainda está sendo enviada; as outras podem ser clicadas em paralelo\n"
              "        const dtp=Date.now()-(CH_PEND_T[i]||0); // v1.10.169: nunca ignorar em silêncio e nunca travar para sempre (o POST tem timeout de 10 s)\n"
              "        if(dtp<12000){msgGer('Comando anterior desta chave ainda em envio ('+Math.ceil(dtp/1000)+' s). Aguarde.',3000);return}\n"
              "        CH_PEND.delete(i);\n"
              "      }\n", 'ch_pend click')
    t = troca(t, "      CH_CMD[i]=novo;CH_PEND.add(i);redesenha();\n", "      CH_CMD[i]=novo;CH_PEND.add(i);CH_PEND_T[i]=Date.now();redesenha();\n", 'ch_pend add')
    t = troca(t, "    if(e.isTrusted&&window.PATAMAR_PENDENTE&&window.PATAMAR_PENDENTE()){window.PATAMAR_EDITA(+t.dataset.i);return}",
              "    if(e.isTrusted&&window.PATAMAR_PENDENTE&&window.PATAMAR_PENDENTE()){window.PATAMAR_EDITA(+t.dataset.i);msgGer('Patamar manual esperando o Aplicar: o clique só edita a sugestão e NÃO comanda o PLC. Aplique ou cancele o Patamar para comandar a chave.',6000);return} // v1.10.169: aviso",
              'patamar')
    open(saida, 'w', encoding='utf-8').write(t)
    print(DEST, 'ok')


if __name__ == '__main__':
    main()
