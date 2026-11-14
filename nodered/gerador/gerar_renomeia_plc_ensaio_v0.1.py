#!/usr/bin/env python3
"""14/11/2026 - NOMES DO PLC NOS FLUXOS: "PLC da Carga" / "PLC Bancos de Carga" -> "PLC de Ensaio (1515)". Nova arquitetura (Reginaldo, 12 e 14/11/2026): os fluxos falam com o PLC de ENSAIO (1515);
o PLC de Carga (1214FC) fala com o 1515 por PUT/GET e NAO com o Node-RED. So muda NOME/TEXTO dos nos de conexao S7 e aplica o padrao de fluxos (organiza_fluxo_v0.2). Nao muda codigo, enderecos nem ligacoes
(provado por verifica_equivalencia_fluxo_v0.2.py --ignora name). Gera VERSOES NOVAS (nao sobrescreve): chaves-56 v3.7, chaves-400 v3.6, chaves-550 v1.7, chaves-595 v1.7, registro-ensaio-db2100 v1.9.
Uso: python3 nodered/gerador/gerar_renomeia_plc_ensaio_v0.1.py"""
import json, os, re, datetime, importlib.util
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); FL = os.path.join(R, 'nodered', 'flows', 'bt2')
sp = importlib.util.spec_from_file_location('org', os.path.join(os.path.dirname(__file__), 'organiza_fluxo_v0.2.py')); org = importlib.util.module_from_spec(sp); sp.loader.exec_module(org)
LISTA = [('chaves-56-api-v3.5', 'chaves-56-api-v3.7', '3.7'), ('chaves-400-api-v3.5', 'chaves-400-api-v3.6', '3.6'), ('chaves-550-api-v1.6', 'chaves-550-api-v1.7', '1.7'),
         ('chaves-595-api-v1.6', 'chaves-595-api-v1.7', '1.7'), ('registro-ensaio-db2100-api-v1.8', 'registro-ensaio-db2100-api-v1.9', '1.9')]
MUDOU = 'nomes: o PLC dos fluxos é o PLC de Ensaio (1515); o PLC de Carga (1214FC) não é lido por estes fluxos; documentação e layout (padrão de fluxos); código e ligações idênticos à versão anterior (provado por script)'
hoje = datetime.date.today().strftime('%d/%m/%Y')
for a, b, v in LISTA:
    ent, sai = os.path.join(FL, a + '.json'), os.path.join(FL, b + '.json'); assert os.path.exists(ent) and not os.path.exists(sai), b
    flow = json.load(open(ent, encoding='utf-8')); n_ren = 0
    for n in flow:
        if n['type'] == 's7 endpoint':
            nome = n['name']
            if nome.startswith('PLC da Carga'): n['name'] = 'PLC de Ensaio (1515)' + nome[len('PLC da Carga'):]; n_ren += 1
            elif nome.startswith('PLC Bancos de Carga'): n['name'] = 'PLC de Ensaio (1515)' + re.sub(r'^PLC Bancos de Carga', '', nome).replace(' - IP/rack/slot aqui', ' (IP/rack/slot)'); n_ren += 1
            n['info'] = 'Conexão S7 com o PLC de Ensaio (1515F). Endereço vem da variável PLC_IP (rack 0, slot 1). O PLC de Carga (1214FC) não é lido por este fluxo: ele conversa com o 1515 por PUT/GET.'
    assert n_ren >= 1, (a, n_ren)
    for n in flow:   # nota (comment) com nome acima de 80 caracteres: o texto inteiro vai para o info e o nome fica curto (padrao de fluxos)
        if n['type'] == 'comment' and len(n.get('name') or '') > 80:
            n['info'] = (n.get('info') or '') or n['name']; corte = n['name'][:77].rsplit(' ', 1)[0]; n['name'] = corte + '…'
    out = org.organiza(flow, v, MUDOU, hoje)
    json.dump(out, open(sai, 'w', encoding='utf-8'), ensure_ascii=False, indent=2); print('gerado', b, '| endpoints renomeados:', n_ren, '|', len(out), 'itens')
