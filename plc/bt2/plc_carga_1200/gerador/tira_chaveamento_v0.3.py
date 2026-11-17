#!/usr/bin/env python3
"""v0.3 (09/11/2026): tira o sinal de chaveamento fisico do pacote (decisao do Reginaldo: futuro). Gera copias v0.3 dos arquivos afetados; nao sobrescreve. O byte DBW2 do DB de competencia fica RESERVADO (tamanho 8 B igual)."""
import os, re
D = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
def novo(src, dst, f):
    p = os.path.join(D, dst); assert not os.path.exists(p), dst
    t = f(open(os.path.join(D, src), encoding='utf-8').read()); open(p, 'w', encoding='utf-8').write(t); print('gerado', dst)
def geral(t):
    t = re.sub(r'.*ChaveamentoFisicoV : Int;.*\n', '', t)
    t = re.sub(r'.*Compet\.chaveamentoFisicoV :=.*\n', '', t)
    t = re.sub(r'.*#chav\w+ :=.*\n', '', t)
    t = re.sub(r'.*Chaveamento_(220|380|440)V.*\n', '', t)
    t = re.sub(r'.*\bchav\w+ : Int;\n', '', t)
    t = re.sub(r',?\s*ChaveamentoFisicoV := [^,)\n]+', '', t)
    t = t.replace('chaveamentoFisicoV : Int;    // DBW2  chaveamento FISICO lido pelo banco: 0 = nao sabe, 220, 380 ou 440  [A CONFIRMAR se existe sinal]', 'reservaW2 : Int;            // DBW2  RESERVADO (futuro; antes: chaveamento fisico). Ninguem le nem escreve.')
    return t
novo('tipos_ComBanco_v0.1.scl', 'tipos_ComBanco_v0.3.scl', geral)
novo('fb_bancoCarga16_v0.1.scl', 'fb_bancoCarga16_v0.3.scl', geral)
novo('fc_chamadasBancosCarga_v0.1.scl', 'fc_chamadasBancosCarga_v0.3.scl', geral)
novo('fb_bancoCarga32_v0.2.scl', 'fb_bancoCarga32_v0.3.scl', geral)
novo('fc_chamadasBanco595_v0.2.scl', 'fc_chamadasBanco595_v0.3.scl', geral)
novo('tags_IO_1200_A_PREENCHER_v0.1.csv', 'tags_IO_1200_A_PREENCHER_v0.3.csv', geral)
