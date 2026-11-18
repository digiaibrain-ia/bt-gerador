#!/usr/bin/env python3
"""15/11/2026 - Gera medidor_gerador_v1.10.212.html (de 1.10.211). Nao sobrescreve; aborta se um trecho esperado mudou.
ALARME INTELIGENTE (pedido do Reginaldo: tratar alarmes falsos; monitorar so quando necessario):
 (1) CONTEXTO: fora do modo com PLC (Demo local) nao existe alarme de leitura do PLC (CHV-006 estava solto: BK-DEMO-01);
 (2) ESCOPO: banco so entra no alarme se estiver EM USO (selecionado, ligado ou com chave ligada) ha mais de 4 s; banco fora de uso e lido a cada 3 s (nao a cada 1 s);
 (3) CAUSA-RAIZ: Node-RED das chaves fora (COM-002) cobre COM-001/CHV-006/COM-003 (mesmo servidor); COM-001 cobre CHV-006 do mesmo banco (1 alarme, dependentes no texto);
 (4) SEGURANCA intocada: CHV-005/007/008 e COM-005 nao mudam; erro ao decidir 'em uso' = trata como em uso;
 (5) linha 'Monitorando: ...' na janela Alertas e Falhas.
Uso: python3 dashboard/gerador/gerar_medidor_v1.10.212_v0.1.py"""
import os
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); F = os.path.join(R, 'dashboard', 'ferramentas')
def troca(t, a, b, nome):
    assert t.count(a) == 1, 'trecho esperado 1x (%s): achei %d' % (nome, t.count(a)); return t.replace(a, b, 1)
o, d = os.path.join(F, 'medidor_gerador_v1.10.211.html'), os.path.join(F, 'medidor_gerador_v1.10.212.html'); assert os.path.exists(o) and not os.path.exists(d)
t = open(o, encoding='utf-8').read()

# 1) bloco novo antes da varredura
t = troca(t, "  /* ---- varredura de estado (1x por segundo) ---- */\n  function varre(){",
"""  /* ===== v1.10.212 ALARME INTELIGENTE: so alarma o que esta em uso e so no contexto certo =====
     EM USO = banco selecionado (Detalhes do Patamar), ligado, ou com alguma chave ligada. Erro ao decidir = trata como EM USO (nunca esconde por engano).
     NAO MEXE em CHV-005/007/008 nem COM-005 (seguranca). */
  const T_USO={};
  const emUsoBanco=id=>{try{return !!((window.bancoUsado&&window.bancoUsado(id))||(typeof BKS!=='undefined'&&BKS[id]&&BKS[id].lig)||CH.some((c,i)=>CH_LIG[i]&&bkDeCh(i)===id))}catch(e){return true}};
  window.bancoEmUso=emUsoBanco;
  const monitText=(srv,demo,real)=>{
    const us=BANCOS_PLC.filter(b=>emUsoBanco(b.id)).map(b=>'BC'+b.id),nu=BANCOS_PLC.filter(b=>!emUsoBanco(b.id)).map(b=>'BC'+b.id);
    const p=[];
    p.push(srv?('PLC: '+(us.length?us.join(', '):'nenhum banco em uso')+(nu.length?' (fora de uso, sem alarme: '+nu.join(', ')+')':'')):'PLC: não monitorado (Demo local, nada vai ao PLC)');
    p.push(demo?'DSE: simulado':'DSE: real');p.push(real?'Registro do ensaio: servidor real':'Registro do ensaio: simulado');
    return 'Monitorando — '+p.join(' · ');
  };

  /* ---- varredura de estado (1x por segundo) ---- */
  function varre(){""", 'bloco')

# 2) COM-001 / CHV-006 / COM-002 com causa-raiz e escopo
ini = t.index("    // COM-001: PLC sem leitura (por banco)")
fim = t.index("    // CHV-003 (v1.9.65)")
novo = """    // v1.10.212 (alarme inteligente): COM-002 (Node-RED das chaves) e a CAUSA; COM-001 (PLC do banco) e CHV-006 (chaves '?') sao DEPENDENTES e so aparecem sozinhos.
    const okChv=LINK.chv.ok&&agora-LINK.chv.ts<5000,visChv=!!LINK.chv.visto,com002=srv&&!okChv&&(visChv||gr);
    const emUso=[];
    BANCOS_PLC.forEach(b=>{
      const l=LINK.banco[b.id]||{},ok=LINK.bancoOk(b.id),visto=!!l.visto,uso=emUsoBanco(b.id);
      if(uso){if(!T_USO[b.id])T_USO[b.id]=agora;emUso.push('BC'+b.id)}else T_USO[b.id]=0;
      const maduro=uso&&agora-T_USO[b.id]>4000;            // banco recem-selecionado: espera a 1a leitura (4 s) antes de alarmar
      const falha=srv&&maduro&&!ok&&(visto||gr)&&!com002;
      liga(falha,'COM-001','BC'+b.id+': '+(visto?'perdeu a conexão':'não conectado')+' — '+(l.erro||'aguardando a 1ª leitura do PLC')+' (as chaves do banco ficam com "?")','BC'+b.id);
      // CHV-006 (v1.10.130): so quando NAO ha causa maior (COM-002/COM-001 ja explicam) e so no modo com PLC
      liga(srv&&maduro&&gr&&!ok&&!falha&&!com002,'CHV-006','BC'+b.id+': sem leitura do PLC — estado das chaves DESCONHECIDO (as chaves aparecem com "?")','BC'+b.id);
    });
    liga(com002,'COM-002',(visChv?'perdeu a conexão':'não conectado')+' — '+(LINK.chv.msg||'sem resposta do Node-RED das chaves')+(emUso.length?' (afeta também: '+emUso.join(', ')+')':''));
"""
t = t[:ini] + novo + t[fim:]

# 2b) COM-003 (registro do ensaio) usa o MESMO servidor/URL das chaves: se COM-002 ja explica, e dependente
t = troca(t, "    liga(real&&ENS.modo.estado==='erro','COM-003',", "    liga(real&&ENS.modo.estado==='erro'&&!com002,'COM-003',", 'com003')
t = troca(t, "(emUso.length?' (afeta também: '+emUso.join(', ')+')':''));", "(emUso.length?' (afeta também: '+emUso.join(', ')+' e o registro do ensaio, que usa o mesmo servidor)':' (afeta também o registro do ensaio, que usa o mesmo servidor)'));", 'com002txt')

# 3) linha Monitorando no fim da varredura
t = troca(t, "    // expiração das ocorrências de evento (CHV-001/002, SIS-001): se ninguém renovou, normaliza\n",
"    {const m=$('ocMonit');if(m){const tx=monitText(srv,demo,real);if(m.textContent!==tx)m.textContent=tx}}   // v1.10.212\n    // expiração das ocorrências de evento (CHV-001/002, SIS-001): se ninguém renovou, normaliza\n", 'monit')
t = troca(t, '    <div class="ocbar">\n      <span id="ocTipos"', '    <p id="ocMonit" class="jnota" style="margin:0 0 6px" aria-live="off"></p>\n    <div class="ocbar">\n      <span id="ocTipos"', 'html')

# 4) polling: banco fora de uso a cada 3 s
t = troca(t, "    await Promise.all(BANCOS_PLC.map(b=>chAtualizaUm(b.id)));\n    await chZeraPendentes();",
"    _pollN=(_pollN+1)%3;   // v1.10.212: banco fora de uso e lido a cada 3 s (continua sob vigia; a leitura nao fica velha: o limite e 5 s)\n    await Promise.all(BANCOS_PLC.filter(b=>_pollN===0||!window.bancoEmUso||window.bancoEmUso(b.id)).map(b=>chAtualizaUm(b.id)));\n    await chZeraPendentes();", 'poll')
t = troca(t, "  async function chAtualizaDoPlc(silencioso){", "  let _pollN=0;\n  async function chAtualizaDoPlc(silencioso){", 'pollvar')

t = troca(t, '<meta name="app-version" content="1.10.211">', '<meta name="app-version" content="1.10.212">', 'meta')
t = troca(t, "const VERSAO='1.10.211', VERSAO_DATA='15/11/2026';\nconst HISTORICO=[\n",
 "const VERSAO='1.10.212', VERSAO_DATA='15/11/2026';\nconst HISTORICO=[\n  {v:\"1.10.212\",d:\"15/11/2026\",i:[\n"
 "    'ALARME INTELIGENTE (pedido do Reginaldo: tratar alarmes falsos). (1) Contexto: no Demo local (nada vai ao PLC) não há alarme de leitura do PLC — o CHV-006 \"banco sem leitura\" aparecia no Demo à toa. (2) Escopo: só alarma o banco EM USO (selecionado em Detalhes do Patamar, ligado ou com chave ligada) há mais de 4 s; banco fora de uso é lido a cada 3 s e não alarma. (3) Causa-raiz: se o Node-RED das chaves não responde, aparece UM alarme (COM-002) com a lista dos bancos afetados, em vez de uma fila de COM-001 e CHV-006; COM-001 também cobre o CHV-006 do mesmo banco.'\n"
 "    ,'SEGURANÇA NÃO MUDA: CHV-005, CHV-007, CHV-008 e COM-005 continuam como eram; se o medidor não conseguir decidir se o banco está em uso, trata como em uso. Nova linha \"Monitorando — ...\" no topo da janela Alertas e Falhas mostra o que está sendo vigiado agora.'\n  ]},\n", 'hist')
open(d, 'w', encoding='utf-8').write(t); print('medidor_gerador_v1.10.212.html ok')
