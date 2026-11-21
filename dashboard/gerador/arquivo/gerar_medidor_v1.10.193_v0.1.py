#!/usr/bin/env python3
"""10/11/2026 - gera medidor_gerador_v1.10.193.html a partir da 1.10.192 (nao sobrescreve; aborta se um trecho esperado mudou).
Unica mudanca: a copia EMBUTIDA do grafico (window.EMB.grafico, usada pelo botao "Analisar" quando o medidor roda sozinho) passa de grafico_ensaio_v0.10 para v0.13
(Ajuda com ✕, alvos de toque no celular, e sem IP real no codigo). A copia embutida do mapa dos FBs NAO muda. O codificador reproduz byte a byte a codificacao da copia antiga (conferido).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.193_v0.1.py"""
import json, os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); P = os.path.join(RAIZ, 'dashboard', 'ferramentas')
ORIG, DEST, GRAF = 'medidor_gerador_v1.10.192.html', 'medidor_gerador_v1.10.193.html', 'grafico_ensaio_v0.13.html'
def enc(x): return json.dumps(x, ensure_ascii=False).replace('</', '<\\/').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
def main():
    o, d = os.path.join(P, ORIG), os.path.join(P, DEST); assert os.path.exists(o) and not os.path.exists(d), 'origem ausente ou destino existe'
    t = open(o, encoding='utf-8').read()
    ini = t.index('window.EMB={grafico:') + len('window.EMB={grafico:'); s, n = json.JSONDecoder().raw_decode(t[ini:])
    assert t[ini:ini + n] == enc(s), 'codificador nao reproduz a copia antiga'
    assert 'grafico_ensaio_v0.10' in s[:400], 'a copia embutida nao e a v0.10'
    novo = open(os.path.join(P, GRAF), encoding='utf-8').read(); assert 'app-version" content="0.13"' in novo
    t = t[:ini] + enc(novo) + t[ini + n:]
    t = troca(t, '<meta name="app-version" content="1.10.192">', '<meta name="app-version" content="1.10.193">', 'meta')
    t = troca(t, "const VERSAO='1.10.192', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n",
              "const VERSAO='1.10.193', VERSAO_DATA='10/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.193\",d:\"10/11/2026\",i:[\n"
              "    'Gráfico embutido (botão Analisar quando o medidor roda sozinho) atualizado da v0.10 para a v0.13: Ajuda com ✕, alvos de toque no celular e sem IP real no código. O mapa embutido não mudou.'\n  ]},\n", 'historico')
    open(d, 'w', encoding='utf-8').write(t); print(DEST, 'ok', len(t), 'bytes')
if __name__ == '__main__': main()
