#!/usr/bin/env python3
"""14/11/2026 - Gera medidor_gerador_v1.10.206.html (de 1.10.205). Nao sobrescreve; aborta se um trecho esperado mudou.
REGRA NOVA (Reginaldo): texto longo nao fica na tela: vira janela suspensa (popover) aberta pelo icone i. Na 1.10.205 o quadro do NS tinha 4-5 linhas (uma cortada).
A interface do NS (script colado na 1.10.202..205 + CSS dns-css) e substituida pelo modulo dados_ensaio_ns_v0.2.js: UMA linha curta + botao i; o detalhe (decodificacao, avisos,
conflito, alterados, legenda e EXEMPLOS DA NORMA ETD 091/094) abre no painel. Mesma logica da 1.10.205 (decodificador v0.3 estrito, origem dos campos, precedencia, conflito, envio ao registro).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.206_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); MF, FE = os.path.join(R, 'dashboard', 'modulos-fonte'), os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(FE, 'medidor_gerador_v1.10.205.html'), os.path.join(FE, 'medidor_gerador_v1.10.206.html'); assert os.path.exists(o) and not os.path.exists(d)
t = open(o, encoding='utf-8').read()
mod = open(os.path.join(MF, 'dados_ensaio_ns_v0.2.js'), encoding='utf-8').read(); assert '</script>' not in mod
# 1) tira o CSS antigo (o modulo novo injeta o proprio)
a = t.index('<style id="dns-css">'); b = t.index('</style>\n', a) + len('</style>\n'); t = t[:a] + t[b:]
# 2) troca o script antigo da interface do NS pelo modulo novo
ini = t.index('<script>\n/* =====================================================================================================================\n   dados_ensaio_ns_v0.1')
fim = t.index('})();\n</script>\n', ini) + len('})();\n</script>\n')
assert 'window.DADOS_ENSAIO_NS=' in t[ini:fim] and t[ini:fim].count('<script>') == 1
t = t[:ini] + '<script>\n' + mod + '</script>\n' + t[fim:]
t = troca(t, '<meta name="app-version" content="1.10.205">', '<meta name="app-version" content="1.10.206">', 'meta')
t = troca(t, "const VERSAO='1.10.205', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n",
          "const VERSAO='1.10.206', VERSAO_DATA='14/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.206\",d:\"14/11/2026\",i:[\n"
          "    'REGRA DE TEXTO LONGO (pedido do Reginaldo): texto longo não fica mais na tela, vira janela suspensa com o ícone ⓘ. No quadro do nº de série (Dados do ensaio) sobrou UMA linha curta (o que o NS é + etiquetas de origem, avisos e alterados) e o botão ⓘ; a decodificação completa, os avisos, o conflito com o catálogo, os campos alterados, a legenda das barras e os EXEMPLOS DA NORMA (ETD 091 e ETD 094, com botão \"usar\") abrem no painel. O painel fecha com ✕, Esc (fecha só o painel, não o diálogo) ou clique fora.'\n"
          "    ,'Sem outras mudanças de comportamento em relação à 1.10.205 (decodificador estrito pelas normas, origem de cada campo, precedência NS × catálogo, aviso de conflito, envio da origem ao registro).'\n  ]},\n", 'hist')
# o historico herdado da 1.10.204 citava um NS de exemplo fora das normas (decisao do Reginaldo: esquecer o numero; so exemplos do PDF). A funcao descrita foi removida na 1.10.205.
import re
h0 = t
t = re.sub(r"agora aceita o NS de 10 caracteres do MES \(ex\.: SDFWA01715 = S \+ DFWA01715\)\. O S não consta na ETD 091 rev\.05: aparece como aviso \(significado a confirmar com a engenharia\) e o resto é decodificado pela norma\. Qualquer outra letra na frente continua recusada\.",
           "aceitava um NS de 10 caracteres com uma letra na frente do NS da norma. REMOVIDO na 1.10.205: só vale o formato das normas ETD 091 e ETD 094.", t)
assert t != h0 and 'SDFWA' not in t and 'M9MGD' not in t, 'historico: nao achei o trecho do numero antigo ou ainda sobrou'
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.206.html ok')
