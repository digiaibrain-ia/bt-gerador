#!/usr/bin/env python3
"""10/11/2026 - gera gerenciador_logs_v1.9.html e grafico_ensaio_v0.13.html (sem IP real no codigo). Nao sobrescreve; aborta se um trecho esperado mudou.
gerenciador v1.8 -> v1.9: o exemplo do tooltip do campo Servidor deixa de citar um IP real ("http://<ip-do-PC-BT2>:1880").
grafico v0.12 -> v0.13: o endereco padrao quando a pagina e aberta como ARQUIVO (file://) e sem endereco salvo deixa de ser um IP fixo: o campo fica vazio (placeholder "http://<ip-do-PC-BT2>:1880/api/gerador") e o botao iniciar so age com o endereco preenchido (regra que ja existia).
Servido por http(s) (Node-RED) o endereco continua sendo o da mesma origem; o medidor continua passando ?url=... ao abrir o grafico.
Uso: python3 dashboard/gerador/gerar_gerenciador_grafico_sem_ip_v0.1.py"""
import os
RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); P = os.path.join(RAIZ, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
def gera(orig, dest, f):
    o, d = os.path.join(P, orig), os.path.join(P, dest); assert os.path.exists(o) and not os.path.exists(d), 'origem ausente ou destino existe'
    open(d, 'w', encoding='utf-8').write(f(open(o, encoding='utf-8').read())); print(dest, 'ok')
def ger(t):
    t = troca(t, '<meta name="app-version" content="1.8">', '<meta name="app-version" content="1.9">', 'meta')
    t = troca(t, '<!-- gerenciador_logs_v1.8 ·', '<!-- gerenciador_logs_v1.9 · 10/11/2026 — SEM IP REAL: o exemplo do campo Servidor virou "http://<ip-do-PC-BT2>:1880". Resto igual à v1.8. (v1.8 ·', 'cab')
    return troca(t, 'ex.: http://172.17.210.156:1880', 'ex.: http://<ip-do-PC-BT2>:1880', 'ip')
def gra(t):
    t = troca(t, '<meta name="app-version" content="0.12">', '<meta name="app-version" content="0.13">', 'meta')
    t = troca(t, '<!-- grafico_ensaio_v0.12 ·', '<!-- grafico_ensaio_v0.13 · 10/11/2026 — SEM IP REAL: em arquivo local e sem endereço salvo o campo da API fica vazio (não há mais IP fixo no código). Resto igual à v0.12. (v0.12 ·', 'cab')
    t = troca(t, "location.origin + '/api/gerador' : 'http://172.17.210.156:1880/api/gerador');", "location.origin + '/api/gerador' : '');", 'ip')
    return troca(t, '<input type="text" id="dirUrl" inputmode="url"', '<input type="text" id="dirUrl" placeholder="http://<ip-do-PC-BT2>:1880/api/gerador" inputmode="url"', 'ph')
if __name__ == '__main__':
    gera('gerenciador_logs_v1.8.html', 'gerenciador_logs_v1.9.html', ger); gera('grafico_ensaio_v0.12.html', 'grafico_ensaio_v0.13.html', gra)
