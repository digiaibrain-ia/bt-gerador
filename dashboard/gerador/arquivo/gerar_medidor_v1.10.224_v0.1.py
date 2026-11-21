#!/usr/bin/env python3
"""17/11/2026 - Gera medidor_gerador_v1.10.224.html (de 1.10.223). Nao sobrescreve; aborta se um trecho esperado mudou.
Pedido do Reginaldo (apos teste de bancada so com o BC56): silenciar ruido. CHV-005 (banco bloqueado/desligado pelo PLC) e CHV-006 (banco sem leitura) de um banco que o operador NAO selecionou em Detalhes do Patamar
E que esta parado (nenhuma chave ligada, nenhum comando pendente) deixam de ser criados (nem entram no log); se ja estavam ativos, sao limpos. Banco selecionado, ou com chave ligada/comando pendente, continua alarmando.
Mantidos de proposito (nao sao ruido): CHV-003 (Demo + PLC comanda o PLC de verdade), COM-001/COM-002/COM-005 (infraestrutura), DSE-001, CHV-001 (comando nao executado).
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.224_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas')
L = lambda p: open(p, encoding='utf-8').read()
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.223.html'), os.path.join(F, 'medidor_gerador_v1.10.224.html'); assert os.path.exists(o) and not os.path.exists(d)
t = L(o)
# 1) quem decide "banco silenciado": nao selecionado em Detalhes do Patamar E parado (mesma regra do 👁 bancos visiveis)
t = troca(t, "  window.BANCOS_VISIVEIS = { aplica, todos: v => { R.todos = !!v; grava(LS, R.todos ? '1' : '0'); aplica(); } };",
          "  /** v1.10.224: banco SILENCIADO = nao selecionado em Detalhes do Patamar e parado (sem chave ligada, sem comando pendente). Qualquer duvida/erro = NAO silencia (nunca esconde alarme por engano). */\n"
          "  const silencia = id => { try { const d = document.querySelector('#bancos details.bk[data-bk=\"' + id + '\"]'); if (!d) return false; const sel = !!(window.bancoUsado && window.bancoUsado(id)); return !sel && parado(d); } catch (e) { return false; } };\n"
          "  window.BANCOS_VISIVEIS = { aplica, silencia, todos: v => { R.todos = !!v; grava(LS, R.todos ? '1' : '0'); aplica(); } };", 'silencia')
# 2) o registro de ocorrencias nao cria CHV-005/CHV-006 de banco silenciado
t = troca(t, "  function set(card,cod,texto,opc){\n    opc=opc||{};const k=cod+'|'+(opc.ref||''),agora=Date.now(),cat=CAT[cod]||{};\n",
          "  function set(card,cod,texto,opc){\n    opc=opc||{};\n"
          "    if((cod==='CHV-005'||cod==='CHV-006')&&opc.ref&&window.BANCOS_VISIVEIS&&window.BANCOS_VISIVEIS.silencia&&window.BANCOS_VISIVEIS.silencia(String(opc.ref).replace(/^BC/,'')))return;   /* v1.10.224: ruido de banco fora do teste */\n"
          "    const k=cod+'|'+(opc.ref||''),agora=Date.now(),cat=CAT[cod]||{};\n", 'set')
# 3) se o banco passou a ser silenciado com a ocorrencia ja ativa, limpa
t = troca(t, "    if(typeof BANCOS!=='undefined'&&typeof bkLiberado==='function'&&typeof bkMotivo==='function')BANCOS.forEach(b=>{\n      const ref='BC'+b.id,o=lista().find(x=>x.cod==='CHV-005'",
          "    if(typeof BANCOS!=='undefined'&&window.BANCOS_VISIVEIS&&window.BANCOS_VISIVEIS.silencia)BANCOS.forEach(b=>{if(window.BANCOS_VISIVEIS.silencia(b.id))['CHV-005','CHV-006'].forEach(c=>{if(lista().find(x=>x.cod===c&&x.ref==='BC'+b.id&&x.ativa))limpa(null,c,'BC'+b.id)})});   /* v1.10.224 */\n"
          "    if(typeof BANCOS!=='undefined'&&typeof bkLiberado==='function'&&typeof bkMotivo==='function')BANCOS.forEach(b=>{\n      const ref='BC'+b.id,o=lista().find(x=>x.cod==='CHV-005'", 'limpa')
t = troca(t, '<meta name="app-version" content="1.10.223">', '<meta name="app-version" content="1.10.224">', 'meta')
hist = ("  {v:\"1.10.224\",d:\"17/11/2026\",i:[\n"
 "    'Menos ruído nos alarmes e no log (pedido do Reginaldo, após o teste só com o BC56): CHV-005 (banco bloqueado/desligado pelo PLC) e CHV-006 (banco sem leitura) de um banco que NÃO está selecionado em Detalhes do Patamar e está parado (nenhuma chave ligada, nenhum comando pendente) deixam de ser criados e de entrar no log; se já estavam ativos, são limpos. Banco selecionado, ou com chave ligada/comando pendente, continua alarmando. Mantidos de propósito: CHV-003 (Demo + PLC), COM-001/002/005, DSE-001 e CHV-001.'\n"
 "  ]},\n")
t = troca(t, "const VERSAO='1.10.223', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n", "const VERSAO='1.10.224', VERSAO_DATA='17/11/2026';\nconst HISTORICO=[\n" + hist, 'versao')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.224.html ok')
