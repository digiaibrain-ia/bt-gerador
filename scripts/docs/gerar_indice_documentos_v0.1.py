#!/usr/bin/env python3
"""10/11/2026 - Move documentos SUPERADOS para docs/arquivo/ (git mv, reversivel; mesma subpasta) e gera docs/INDICE_DOCUMENTOS.md.
Nao apaga nada. Nao move o que algum script ainda le (listado em MANTIDOS). Nao sobrescreve o indice. Uso: python3 scripts/docs/gerar_indice_documentos_v0.1.py"""
import os, re, subprocess
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); os.chdir(R)
SUBST = {  # arquivo -> substituido por
 'docs/bt2/migracao/IMPLANTACAO_ROTEIRO_v0.1.md': 'IMPLANTACAO_ROTEIRO_v0.6', 'docs/bt2/migracao/IMPLANTACAO_ROTEIRO_v0.3.md': 'IMPLANTACAO_ROTEIRO_v0.6', 'docs/bt2/migracao/IMPLANTACAO_ROTEIRO_v0.4.md': 'IMPLANTACAO_ROTEIRO_v0.6',
 'docs/bt2/migracao/IMPLANTACAO_ROTEIRO_v0.5.md': 'IMPLANTACAO_ROTEIRO_v0.6', 'docs/bt2/migracao/MIGRACAO_PLANO_v0.1.md': 'MIGRACAO_PLANO_v0.5', 'docs/bt2/migracao/MIGRACAO_PLANO_v0.2.md': 'MIGRACAO_PLANO_v0.5',
 'docs/bt2/migracao/MIGRACAO_PLANO_v0.3.md': 'MIGRACAO_PLANO_v0.5', 'docs/bt2/migracao/MIGRACAO_PLANO_v0.4.md': 'MIGRACAO_PLANO_v0.5', 'docs/bt2/migracao/ANALISE_4_BANCOS_VISUAL_PLC_v0.1.md': 'ANALISE_4_BANCOS_VISUAL_PLC_v0.2',
 'docs/bt2/migracao/CHECKLIST_BANCADA_v0.1.md': 'CHECKLIST_BANCADA_v0.3', 'docs/bt2/migracao/HANDOFF_TI_v0.1.md': 'HANDOFF_TI_v0.2', 'docs/bt2/migracao/LEIA-ME_ENTREGA_v0.2.txt': 'LEIA-ME_ENTREGA_TI_v1.0.txt',
 'docs/bt2/fase4/PLANO_FASE4_v0.1.md': 'PLANO_FASE4_v0.2', 'docs/bt2/fase4/PLANO_1200_DB26_v0.1.md': 'blocos do 1200 em plc/bt2/entrega_1200_v0.5 (DB26 nao vale mais)',
 'docs/bt2/fase4/PLANO_1200_DB26_v0.2.md': 'blocos do 1200 em plc/bt2/entrega_1200_v0.5 (DB26 nao vale mais)',
 'docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v4.xlsx': 'PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx', 'docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v4_rascunho.csv': 'PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx',
 'docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v5_exemplo.xlsx': 'PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx', 'docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v5.1_exemplo.xlsx': 'PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx',
 'docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v5.2_exemplo.xlsx': 'PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx',
 'docs/bt2/arquitetura/arquitetura_bt2_v0.1.html': 'arquitetura_bt2_v0.5_editavel.html', 'docs/bt2/arquitetura/arquitetura_bt2_v0.1.mmd': 'arquitetura_bt2_v0.5_editavel.html',
 'docs/bt2/arquitetura/arquitetura_bt2_mermaid_v0.1.html': 'arquitetura_bt2_v0.5_editavel.html', 'docs/bt2/arquitetura/arquitetura_bt2_v0.2_tradicional_com_MES.html': 'arquitetura_bt2_v0.5_editavel.html',
 'docs/bt2/arquitetura/arquitetura_bt2_v0.3_ilustrada.html': 'arquitetura_bt2_v0.5_editavel.html', 'docs/bt2/arquitetura/arquitetura_bt2_v0.4_ilustrada.html': 'arquitetura_bt2_v0.5_editavel.html'}
MANTIDOS = {  # superados, mas lidos por script (nao movidos)
 'docs/bt2/migracao/IMPLANTACAO_ROTEIRO_v0.2.md': 'citado dentro de dashboard/pacotes/bt2-1.10.166.zip (pacote ja entregue)', 'docs/bt2/fase4/CHECKLIST_BANCADA_v0.2.md': 'lido por scripts/pacote/gerar_pacote_fase4_v0.1.py (substituido por CHECKLIST_BANCADA_v0.3)',
 'docs/bt2/fase4/ROTEIRO_ATUALIZACAO_FASE4_v0.1.md': 'lido por gerar_pacote_fase4_v0.1.py (substituido por IMPLANTACAO_ROTEIRO_v0.6)', 'docs/bt2/fase4/LEIA-ME_ENTREGA_FASE4_v0.1.txt': 'lido por gerar_pacote_fase4_v0.1.py (substituido por LEIA-ME_ENTREGA_TI_v1.0)',
 'docs/bt2/fase4/PLANO_1200_DB26_v0.3.md': 'lido por gerar_pacote_fase4_v0.1.py (DB26 nao vale mais)', 'docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v6_exemplo.xlsx': 'lido por plc/bt2/gerador/gerar_plano_numeracao_v7.py (origem da v7)'}
def sh(*a): return subprocess.run(a, capture_output=True, text=True, check=True).stdout
def titulo(p):
    if not p.endswith('.md'): return ''
    for l in open(p, encoding='utf-8', errors='ignore'):
        if l.startswith('# '): return re.sub(r'\s+', ' ', l[2:].strip())[:110]
    return ''
def main():
    idx = 'docs/INDICE_DOCUMENTOS.md'; assert not os.path.exists(idx), 'indice ja existe'
    mov = []
    for o, por in SUBST.items():
        d = o.replace('docs/', 'docs/arquivo/', 1); os.makedirs(os.path.dirname(d), exist_ok=True); assert not os.path.exists(d), d
        sh('git', 'mv', o, d); mov.append((o, d, por))
    ativos = [f for f in sh('git', 'ls-files', 'docs').split('\n') if f and not f.startswith('docs/arquivo/') and f != idx]
    L = ['# Índice dos documentos — 10/11/2026', '', 'Gerado por `scripts/docs/gerar_indice_documentos_v0.1.py`. **Nada foi apagado:** os superados foram movidos (git mv) para `docs/arquivo/` na mesma subpasta; para voltar, `git mv` de volta.', '',
         '## Comece por aqui', '| O que | Arquivo |', '|---|---|',
         '| Onde estamos e o que falta | `docs/bt2/ANALISE_CONCLUSAO_2026-11-10.md` |', '| Como implantar (ordem, rollback) | `docs/bt2/migracao/IMPLANTACAO_ROTEIRO_v0.6.md` |', '| Checklist de bancada | `docs/bt2/migracao/CHECKLIST_BANCADA_v0.3.md` |',
         '| Consolidação para a TI | `docs/bt2/migracao/HANDOFF_TI_v0.2.md` |', '| Numeração de blocos e DBs (inclui o PLC de cargas 1200) | `docs/bt2/plc/PLANO_NUMERACAO_BLOCOS_PLC_v7.xlsx` |',
         '| Pendências e achados | `BACKLOG_FORA_DE_ESCOPO.md` |', '| Regras do projeto | `CLAUDE.md` |', '| Criatividade (rastreio de ideias) | `docs/criatividade/LEIA-ME.md` |', '',
         '## Versões atuais fora de `docs/`', '- Medidor: `dashboard/ferramentas/medidor_gerador_v1.10.191.html` (+ `catalogo_ferramentas_v0.7.js`, `dashboard/modulos-fonte/menu_dev_v0.2.js`).',
         '- Fluxos: `nodered/flows/bt2/` — `chaves-56/400-api-v3.5`, `chaves-550/595-api-v1.6`, `registro-ensaio-db2100-api-v1.8`, `dev-logs-api-v1.3`, `cliente-156-...-v3`, `cliente-31-...-db2000-v4`, `servidor-deepsea-api-gerador-v3_7`.',
         '- PLC (rascunhos, não compilados): `plc/bt2/entrega_1200_v0.5/` (1515 + PLC de cargas 1200).', '']
    pastas = {}
    for f in ativos: pastas.setdefault(os.path.dirname(f), []).append(f)
    L += ['## Documentos válidos por pasta']
    for pa in sorted(pastas):
        L += ['', '### `%s/`' % pa, '| Arquivo | Assunto | Observação |', '|---|---|---|']
        for f in sorted(pastas[pa]):
            obs = 'SUPERADO, mantido: ' + MANTIDOS[f] if f in MANTIDOS else ''
            L.append('| `%s` | %s | %s |' % (os.path.basename(f), titulo(f).replace('|', '/'), obs))
    L += ['', '## Arquivados (movidos para `docs/arquivo/`)', '| Antes | Agora | Substituído por |', '|---|---|---|']
    for o, d, por in mov: L.append('| `%s` | `%s` | %s |' % (o, d, por))
    L += ['', '## Ainda a revisar (não movidos, sem substituto claro)', '- `docs/bt2/contratos/servidor-deepsea-api-gerador-v3_6.md`: descreve o v3_6; o fluxo atual é v3_7 sem documento próprio.',
          '- `docs/bt2/ensaio/OPERADOR_SECRETO_*_headless_*.txt`: resultados antigos do robô; úteis só como histórico.',
          '- `docs/bt2/plc/PASSO_A_PASSO_PUT_GET_1515_ET200_v4.md`: ainda descreve o ET200 provisório; confirmar o modelo do 1515 (FN03 x FM02) antes de reusar.',
          '- Documentos sem versão no nome (ex.: `CONTEXTO_MEDIDOR_GERADOR.md`) não foram avaliados quanto à validade: precisam da sua leitura.']
    open(idx, 'w', encoding='utf-8').write('\n'.join(L) + '\n'); print('movidos', len(mov), '| ativos', len(ativos), '| indice', idx)
if __name__ == '__main__': main()
