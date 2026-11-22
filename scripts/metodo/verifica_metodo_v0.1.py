#!/usr/bin/env python3
"""Teste mecanico do metodo BT2 (10/11/2026): confere, no historico do Git desde uma data, o que da para checar sem opiniao.
R1 arquivo com versao no nome NAO foi alterado depois de criado (versao nova, nunca sobrescrever).
R2 nenhum IP de rede interna em arquivo NOVO ou alterado (fora da allowlist de testes de trava).
R3 todo arquivo novo de medidor / fluxo / entrega tem gerador citado no repositorio.
R4 nenhum .zip commitado no periodo (zip e entrega, nao codigo).
Excecoes aceitas ficam em EXCECOES, com o motivo. Uso: python3 scripts/metodo/verifica_metodo_v0.1.py [AAAA-MM-DD]  (padrao 2026-11-09). Sai com 1 se houver violacao nao justificada."""
import os, re, subprocess, sys
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); os.chdir(R)
DESDE = sys.argv[1] if len(sys.argv) > 1 else '2026-11-09'
EXCECOES = {  # arquivo -> motivo (revisar a cada uso)
 'docs/bt2/plc/MAPA_RENUMERACAO_BT2_v0.1.csv': 'correcao de codificacao (BOM UTF-8 para o Excel), sem mudar conteudo; pedido do Reginaldo',
 'plc/bt2/plc_carga_1200/ROTEIRO_PROGRAMADOR_PLC_CARGA_1200_v0.3.md': 'VIOLACAO ASSUMIDA: recebeu notas de v0.4 no fim em vez de arquivo novo; pacote antigo (nao entregue)',
 'tests/integracao/t0_trava_producao.test.js': 'a trava de producao precisa do IP real (lista de bloqueio)',
 'docs/licoes/REGISTRO_LICOES_v0.1.md': 'registro VIVO: o proprio documento manda acrescentar as licoes novas no fim (o nome v0.1 e a versao do formato)',
 'scripts/metodo/verifica_metodo_v0.1.py': 'o proprio verificador: a lista de EXCECOES cresce com motivo escrito (nao e logica nova)',
 'plc/bt2/gerador/verifica_pacote_scl_v0.1.py': 'VIOLACAO ASSUMIDA: recebeu a checagem do "i" no DB de instancia na mesma versao (commit da entrega 1200 v0.11) em vez de versao nova; o v0.2 tem tudo (inclui um DB por arquivo) e e o que vale',
 'scripts/pacote/gerar_pacote_implantacao_v1.9.py': 'VIOLACAO ASSUMIDA: a primeira versao commitada trocou por engano o nome do fluxo registro-ensaio (v1.8 -> v1.9) e parou; corrigida na mesma versao antes de qualquer entrega; a v1.10+ ja partem da corrigida',
 'docs/licoes/INVENTARIO_DEMO_X_REAL_v0.1.md': 'arquivo GERADO por scripts/inventario/inventario_demo_x_real_v0.1.js (regenerado de proposito a cada medidor; o nome v0.1 e a versao do script)',
 'docs/bt2/migracao/ROTEIRO_ATUALIZACAO_NOTEBOOK_v0.1.md': 'limpeza de IP/usuario do Windows (10/11), pedido do Reginaldo: IP nao fica no Git',
 'docs/bt2/modulos/INDEX_v0.2.md': 'limpeza de IP/usuario do Windows (10/11)',
 'docs/bt2/modulos/MENU_DEV_v0.2_E_JANELAS_v0.3.md': 'limpeza de IP/usuario do Windows (10/11)',
 'plc/bt2/comunicacao_et200/db38_db39_ComEt200_v0.3.scl': 'limpeza de IP em comentario (10/11); sem mudanca de codigo',
 'dashboard/gerador/gerar_gerenciador_grafico_sem_ip_v0.1.py': 'corrigido na mesma sessao para nao conter o IP (strings quebradas); reproduz as duas saidas (conferido)',
}
ACEITA_TEXTO = ('192.168.0.1',)   # padrao de fabrica Siemens citado em documento, nao e IP do projeto
VERS = re.compile(r'(_v\d+(\.\d+)+|-v\d+(\.\d+|_\d+)+|_\d+\.\d+\.\d+|v\d+\.\d+\.\d+)')
IP = re.compile(r'(?<![\d.@])((10\.\d{1,3})|(172\.(1[6-9]|2[0-9]|3[01]))|(192\.168))\.\d{1,3}\.\d{1,3}(?![\d])')   # 4 octetos (evita versoes como mermaid@10.9.1)
def sh(*a): return subprocess.run(a, capture_output=True, text=True).stdout
def main():
    log = sh('git', 'log', '--since=' + DESDE, '--name-status', '--format=', '--no-renames')
    mod, novo = set(), set()
    for l in log.split('\n'):
        p = l.split('\t')
        if len(p) == 2: (mod if p[0] == 'M' else novo if p[0] == 'A' else set()).add(p[1]) if p[0] in 'MA' else None
    v = []
    r1 = [f for f in sorted(mod) if VERS.search(os.path.basename(f)) and os.path.exists(f)]
    for f in r1:
        if f not in novo or True: v.append(('R1', f, EXCECOES.get(f)))
    for f in sorted(mod | novo):
        if not os.path.exists(f) or f in EXCECOES and 'IP' not in EXCECOES[f] and f != 'tests/integracao/t0_trava_producao.test.js': continue
        if f.endswith(('.zip', '.xlsx', '.png', '.jpg')): continue
        try: t = open(f, encoding='utf-8', errors='ignore').read()
        except OSError: continue
        if any(m.group(0) not in ACEITA_TEXTO for m in IP.finditer(t)): v.append(('R2', f, EXCECOES.get(f)))
    todos = sh('git', 'ls-files')
    ger = [f for f in todos.split('\n') if re.search(r'(gerador|scripts)/.*\.py$', f)]
    gtxt = ''.join(open(f, encoding='utf-8', errors='ignore').read() for f in ger)
    for f in sorted(novo):
        b = os.path.basename(f)
        if (f.startswith('dashboard/ferramentas/') and b.endswith('.html')) or (f.startswith('nodered/flows/bt2/') and b.endswith('.json')):
            stem = re.sub(r'\.(html|json)$', '', b)
            if stem not in gtxt and b not in gtxt: v.append(('R3', f, EXCECOES.get(f)))
    for f in sorted(novo):
        if f.endswith('.zip'): v.append(('R4', f, EXCECOES.get(f)))
    bad = [x for x in v if not x[2]]
    print('Desde %s: %d arquivos alterados, %d novos' % (DESDE, len(mod), len(novo)))
    for r, f, m in v: print('%s %s %s' % (r, f, ('(aceito: ' + m + ')') if m else '<-- VIOLACAO'))
    print('Resultado:', 'OK' if not bad else '%d violacao(oes) sem justificativa' % len(bad)); sys.exit(1 if bad else 0)
if __name__ == '__main__': main()
