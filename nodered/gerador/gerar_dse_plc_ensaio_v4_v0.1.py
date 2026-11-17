#!/usr/bin/env python3
"""14/11/2026 - gera nodered/flows/bt2/cliente-156-dse-plc-ensaio-v4.0.json a partir de cliente-156-dse-plc-carga-v3.json (nao sobrescreve).
Decisao do Reginaldo (12/11 e 14/11/2026): o DB2000 (DSE) fica no PLC de ENSAIO (1515), nao no PLC de Carga; o fluxo grava so no 1515. A v3 dizia "PLC da Carga (hoje 1515 provisoria; destino final 1214FC)".
So muda NOME/TEXTO (aba, endpoint, notas) e aplica o padrao de fluxos (versao unica, info em todo no, notas curtas, layout). NAO muda codigo, enderecos nem ligacoes: provado por verifica_equivalencia_fluxo_v0.2.py --ignora name.
O 1214FC (PLC de Carga) recebe o DB2000 do 1515 por PUT (fb104_putDseCarga) - nao por este fluxo.
Uso: python3 nodered/gerador/gerar_dse_plc_ensaio_v4_v0.1.py"""
import json, os, sys, datetime
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); FL = os.path.join(R, 'nodered', 'flows', 'bt2')
ent, sai = os.path.join(FL, 'cliente-156-dse-plc-carga-v3.json'), os.path.join(FL, 'cliente-156-dse-plc-ensaio-v4.0.json'); assert os.path.exists(ent) and not os.path.exists(sai)
sys.path.insert(0, os.path.dirname(__file__)); import importlib.util
sp = importlib.util.spec_from_file_location('org', os.path.join(os.path.dirname(__file__), 'organiza_fluxo_v0.2.py')); org = importlib.util.module_from_spec(sp); sp.loader.exec_module(org)
flow = json.load(open(ent, encoding='utf-8'))
NOVO_INFO = ('**DB2000 fica no PLC de Ensaio (1515).** Este fluxo lê a API do servidor DSE (local, no PC .156) e grava o **DB2000** (`db2000_BancoTeste2_DSE`) no **PLC de Ensaio (1515F)**; o endereço vem de `PLC_IP`. '
             'Decisão do Reginaldo (12/11 e 14/11/2026): o DB2000 não fica no PLC de Carga (1214FC). Para a tela do programador do PLC de Carga, o 1515 repassa os bytes 0..135 por PUT (bloco `fb104_putDseCarga`), não este fluxo.\n\n'
             'Substitui o cliente .31: só um fluxo grava o DB2000 por vez (conflito de escrita). Não importe o `cliente-31-seletor-plc-db2000` junto.')
for n in flow:
    if n['type'] == 'tab': n['label'] = 'DSE para o PLC de Ensaio (DB2000)'; n['info'] = (n.get('info') or '')
    if n['type'] == 's7 endpoint':
        n['name'] = 'PLC de Ensaio (1515) - DB2000'; n['info'] = 'Conexão S7 com o PLC 1515F de Ensaio (Banco de Teste 2). Endereço vem da variável PLC_IP. Rack 0, slot 1.'
    if n['type'] == 's7 out': n['name'] = 'Escreve DB2000 (PLC de Ensaio)'
    if n['type'] == 'comment':
        txt = n['name']; n['info'] = txt
        n['name'] = 'Roda no PC .156 (local) e começa DESLIGADO' if txt.startswith('Roda no PC') else 'DB2000 não otimizado; falha só grava o status'
hoje = datetime.date.today().strftime('%d/%m/%Y')
out = org.organiza(flow, '4.0', 'só nomes e textos: o DB2000 fica no PLC de Ensaio (1515), não no PLC de Carga; código e ligações idênticos à v3 (provado por script)', hoje)
for n in out:
    if n['type'] == 'tab':
        i = n['info'].index('## Histórico'); n['info'] = n['info'][:i] + '## Aviso\n\n' + NOVO_INFO + '\n\n## Histórico da v3 (texto original; DESATUALIZADO quanto ao "PLC da Carga")\n\n' + n['info'].split('\n\n', 4)[-1] if False else n['info'][:i] + '## Aviso\n\n' + NOVO_INFO + '\n\n' + n['info'][i:].replace('## Histórico das versões anteriores (texto original preservado)', '## Histórico da v3 (texto original; DESATUALIZADO quanto ao "PLC da Carga")')
json.dump(out, open(sai, 'w', encoding='utf-8'), ensure_ascii=False, indent=2); print('gerado', sai, len(out), 'itens')
